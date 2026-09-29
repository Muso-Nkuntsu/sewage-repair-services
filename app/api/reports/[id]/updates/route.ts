import { NextResponse } from "next/server";
import { handleApiError, parseBody, parseId, requireApiAdmin } from "@/lib/api";
import { repairUpdateSchema } from "@/lib/validations/report";
import { applyReportChanges } from "@/lib/reports";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/reports/[id]/updates — admin only.
 * Body: { comment: string, status?: ReportStatus }
 * Adds a timeline entry and, optionally, moves the report to a new status.
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    await requireApiAdmin();
    const id = parseId((await context.params).id);
    const input = await parseBody(request, repairUpdateSchema);

    const report = await applyReportChanges(id, {
      comment: input.comment,
      status: input.status,
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
