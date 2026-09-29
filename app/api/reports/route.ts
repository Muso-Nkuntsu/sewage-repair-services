import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { handleApiError, parseBody, requireApiUser } from "@/lib/api";
import { createReportSchema } from "@/lib/validations/report";
import { buildReportFilter, createReport } from "@/lib/reports";

/**
 * GET /api/reports
 *   Residents: their own reports.
 *   Admins: all reports, optional ?status=REPORTED&q=ext
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const { searchParams } = request.nextUrl;

    const where: Prisma.ReportWhereInput =
      user.role === "ADMIN"
        ? buildReportFilter(searchParams.get("status"), searchParams.get("q"))
        : { residentId: user.id };

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        resident: { select: { id: true, firstName: true, lastName: true } },
        assignedTeam: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/reports — any logged-in user can submit a report. */
export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = await parseBody(request, createReportSchema);
    const report = await createReport(user.id, input);
    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
