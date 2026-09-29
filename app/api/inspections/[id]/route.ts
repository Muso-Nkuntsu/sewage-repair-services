import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, parseBody, parseId, requireApiAdmin } from "@/lib/api";
import { inspectionDateFromInput, inspectionSchema } from "@/lib/validations/inspection";

type RouteContext = { params: Promise<{ id: string }> };

/** PUT /api/inspections/[id] — admin only. */
export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireApiAdmin();
    const id = parseId((await context.params).id);
    const input = await parseBody(request, inspectionSchema);
    const inspection = await prisma.inspection.update({
      where: { id },
      data: {
        location: input.location,
        inspectionDate: inspectionDateFromInput(input.inspectionDate),
        inspectorName: input.inspectorName,
        findings: input.findings ?? null,
        status: input.status,
      },
    });
    return NextResponse.json({ inspection });
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/inspections/[id] — admin only. */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireApiAdmin();
    const id = parseId((await context.params).id);
    await prisma.inspection.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
