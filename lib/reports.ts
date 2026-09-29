// Report business logic shared by API routes and server pages.
import { Prisma, type ReportStatus } from "@prisma/client";
import { prisma } from "./prisma";
import {
  ISSUE_TYPES,
  ISSUE_TYPE_LABELS,
  REPORT_STATUSES,
  REPORT_STATUS_LABELS,
  type ReportStatusValue,
} from "./constants";
import type { CreateReportInput } from "./validations/report";

const FIRST_REFERENCE_NUMBER = 201;

/** Include used whenever a full report (with resident, team and timeline) is needed. */
export const reportDetailInclude = {
  resident: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
  assignedTeam: true,
  repairUpdates: { orderBy: { createdAt: "asc" } },
} satisfies Prisma.ReportInclude;

export type ReportDetail = Prisma.ReportGetPayload<{ include: typeof reportDetailInclude }>;

async function nextReferenceNumber(tx: Prisma.TransactionClient): Promise<number> {
  const latest = await tx.report.aggregate({ _max: { referenceNumber: true } });
  return Math.max((latest._max.referenceNumber ?? 0) + 1, FIRST_REFERENCE_NUMBER);
}

/**
 * Creates a report with the next reference number (#208, #209, ...) and its
 * first timeline entry. Retries if two people submit at the same moment.
 */
export async function createReport(residentId: number, input: CreateReportInput) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const referenceNumber = await nextReferenceNumber(tx);
        return tx.report.create({
          data: {
            referenceNumber,
            issueType: input.issueType,
            location: input.location,
            landmark: input.landmark ?? null,
            description: input.description,
            contactPhone: input.contactPhone ?? null,
            status: "REPORTED",
            residentId,
            repairUpdates: { create: { status: "REPORTED", comment: "Report received" } },
          },
        });
      });
    } catch (error) {
      const isDuplicateReference =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!isDuplicateReference || attempt === 3) throw error;
    }
  }
  throw new Error("Could not allocate a report reference number.");
}

/** Extra fields that must change together with the status. */
export function statusSideEffects(
  newStatus: ReportStatus,
  currentResolvedAt: Date | null
): { resolvedAt: Date | null } {
  if (newStatus === "RESOLVED") {
    return { resolvedAt: currentResolvedAt ?? new Date() };
  }
  return { resolvedAt: null };
}

export function statusChangeComment(status: ReportStatus): string {
  return `Status changed to ${REPORT_STATUS_LABELS[status]}`;
}

/** Builds the WHERE clause for the admin report list (status filter + search). */
export function buildReportFilter(status: string | null, query: string | null): Prisma.ReportWhereInput {
  const where: Prisma.ReportWhereInput = {};

  if (status && (REPORT_STATUSES as readonly string[]).includes(status)) {
    where.status = status as ReportStatusValue;
  }

  const q = query?.trim().replace(/^#/, "");
  if (q) {
    const or: Prisma.ReportWhereInput[] = [
      { location: { contains: q } },
      { landmark: { contains: q } },
    ];
    if (/^\d+$/.test(q)) {
      or.push({ referenceNumber: Number(q) });
    }
    const matchingTypes = ISSUE_TYPES.filter((type) =>
      ISSUE_TYPE_LABELS[type].toLowerCase().includes(q.toLowerCase())
    );
    if (matchingTypes.length > 0) {
      or.push({ issueType: { in: matchingTypes } });
    }
    where.OR = or;
  }

  return where;
}

export type ReportChanges = {
  status?: ReportStatus;
  eta?: string | null;
  assignedTeamId?: number | null;
  comment?: string;
};

export class ReportChangeError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Applies admin changes to a report and records timeline entries.
 * Used by PUT /api/reports/[id], POST /assign and POST /updates.
 *
 * Rules:
 *  - Assigning a team to a REPORTED job moves it to ASSIGNED automatically.
 *  - Moving to RESOLVED stamps resolvedAt; moving away clears it.
 *  - Every change writes a repair update so the resident can follow along.
 */
export async function applyReportChanges(reportId: number, changes: ReportChanges) {
  const current = await prisma.report.findUnique({ where: { id: reportId } });
  if (!current) throw new ReportChangeError(404, "Report not found.");

  const data: Prisma.ReportUncheckedUpdateInput = {};
  const comments: string[] = [];

  const newEta =
    changes.eta === undefined ? undefined : changes.eta && changes.eta.trim() ? changes.eta.trim() : null;

  // Team assignment
  let teamNewlyAssigned = false;
  if (changes.assignedTeamId !== undefined && changes.assignedTeamId !== current.assignedTeamId) {
    if (changes.assignedTeamId === null) {
      data.assignedTeamId = null;
      comments.push("Repair team unassigned");
    } else {
      const team = await prisma.team.findUnique({ where: { id: changes.assignedTeamId } });
      if (!team) throw new ReportChangeError(400, "The selected team does not exist.");
      data.assignedTeamId = team.id;
      teamNewlyAssigned = true;
      const etaText = newEta ?? current.eta;
      comments.push(`Assigned to ${team.name}${etaText ? ` (ETA: ${etaText})` : ""}`);
    }
  }

  // ETA
  if (newEta !== undefined && newEta !== current.eta) {
    data.eta = newEta;
    if (!teamNewlyAssigned && newEta) comments.push(`ETA updated: ${newEta}`);
  }

  // Status
  let nextStatus = changes.status;
  const automaticStatus = !nextStatus && teamNewlyAssigned && current.status === "REPORTED";
  if (automaticStatus) nextStatus = "ASSIGNED";

  if (nextStatus && nextStatus !== current.status) {
    data.status = nextStatus;
    Object.assign(data, statusSideEffects(nextStatus, current.resolvedAt));
    // A custom comment already explains the change; otherwise record it.
    if (!automaticStatus && !changes.comment) comments.push(statusChangeComment(nextStatus));
  }

  if (changes.comment) comments.push(changes.comment);

  if (comments.length === 0) {
    throw new ReportChangeError(400, "Nothing changed.");
  }

  const statusForUpdates = (data.status as ReportStatus | undefined) ?? current.status;
  const now = Date.now();

  await prisma.$transaction([
    prisma.report.update({ where: { id: reportId }, data }),
    prisma.repairUpdate.createMany({
      // Stagger by 1 ms so the timeline order is stable.
      data: comments.map((comment, index) => ({
        reportId,
        status: statusForUpdates,
        comment,
        createdAt: new Date(now + index),
      })),
    }),
  ]);

  return prisma.report.findUniqueOrThrow({ where: { id: reportId }, include: reportDetailInclude });
}
