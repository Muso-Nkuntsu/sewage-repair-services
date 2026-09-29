import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, parseBody, parseId, requireApiAdmin } from "@/lib/api";
import { teamSchema } from "@/lib/validations/team";

type RouteContext = { params: Promise<{ id: string }> };

/** PUT /api/teams/[id] — admin only. */
export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireApiAdmin();
    const id = parseId((await context.params).id);
    const input = await parseBody(request, teamSchema);
    const team = await prisma.team.update({
      where: { id },
      data: {
        name: input.name,
        contactNumber: input.contactNumber ?? null,
        technicianCount: input.technicianCount,
        status: input.status,
      },
    });
    return NextResponse.json({ team });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/teams/[id] — admin only.
 * Reports that were assigned to the team keep their history but lose the team link
 * (foreign key ON DELETE SET NULL).
 */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireApiAdmin();
    const id = parseId((await context.params).id);
    await prisma.team.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
