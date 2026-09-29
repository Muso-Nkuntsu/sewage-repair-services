import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, parseBody, parseId, requireApiAdmin, requireApiUser } from "@/lib/api";
import { updateReportSchema } from "@/lib/validations/report";
import { applyReportChanges, reportDetailInclude } from "@/lib/reports";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/reports/[id] — owner or admin. */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireApiUser();
    const id = parseId((await context.params).id);

    const report = await prisma.report.findUnique({ where: { id }, include: reportDetailInclude });

    // Residents get "not found" for other people's reports so ids can't be probed.
    if (!report || (user.role !== "ADMIN" && report.residentId !== user.id)) {
      throw new ApiError(404, "Report not found.");
    }

    return NextResponse.json({ report });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/reports/[id]
 *   Admin: { status?, eta?, assignedTeamId? }
 *   Resident: may only cancel their own report while it is still REPORTED: { status: "CANCELLED" }
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const user = await requireApiUser();
    const id = parseId((await context.params).id);
    const input = await parseBody(request, updateReportSchema);

    if (user.role !== "ADMIN") {
      const report = await prisma.report.findUnique({ where: { id } });
      if (!report || report.residentId !== user.id) {
        throw new ApiError(404, "Report not found.");
      }
      const onlyCancelling =
        input.status === "CANCELLED" && input.eta === undefined && input.assignedTeamId === undefined;
      if (!onlyCancelling) {
        throw new ApiError(403, "Only the repair team can change this report.");
      }
      if (report.status !== "REPORTED") {
        throw new ApiError(400, "This report is already being handled and can no longer be cancelled.");
      }
      const updated = await applyReportChanges(id, {
        status: "CANCELLED",
        comment: "Report cancelled by the resident",
      });
      return NextResponse.json({ report: updated });
    }

    const updated = await applyReportChanges(id, {
      status: input.status,
      eta: input.eta,
      assignedTeamId: input.assignedTeamId,
    });
    return NextResponse.json({ report: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/reports/[id] — admin only. Repair updates are removed with it. */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireApiAdmin();
    const id = parseId((await context.params).id);
    await prisma.report.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
