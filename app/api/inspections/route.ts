import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, parseBody, requireApiAdmin } from "@/lib/api";
import { inspectionDateFromInput, inspectionSchema } from "@/lib/validations/inspection";

/** GET /api/inspections — admin only, newest first. */
export async function GET() {
  try {
    await requireApiAdmin();
    const inspections = await prisma.inspection.findMany({ orderBy: { inspectionDate: "desc" } });
    return NextResponse.json({ inspections });
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/inspections — admin only. */
export async function POST(request: Request) {
  try {
    await requireApiAdmin();
    const input = await parseBody(request, inspectionSchema);
    const inspection = await prisma.inspection.create({
      data: {
        location: input.location,
        inspectionDate: inspectionDateFromInput(input.inspectionDate),
        inspectorName: input.inspectorName,
        findings: input.findings ?? null,
        status: input.status,
      },
    });
    return NextResponse.json({ inspection }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
