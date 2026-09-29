import { NextResponse } from "next/server";
import { handleApiError, parseBody, parseId, requireApiAdmin } from "@/lib/api";
import { assignTeamSchema } from "@/lib/validations/report";
import { applyReportChanges } from "@/lib/reports";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/reports/[id]/assign — admin only.
 * Body: { teamId: number, eta?: string }
 * A REPORTED job automatically becomes ASSIGNED.
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    await requireApiAdmin();
    const id = parseId((await context.params).id);
    const input = await parseBody(request, assignTeamSchema);

    const report = await applyReportChanges(id, {
      assignedTeamId: input.teamId,
      eta: input.eta ?? undefined,
    });

    return NextResponse.json({ report });
  } catch (error) {
    return handleApiError(error);
  }
}
