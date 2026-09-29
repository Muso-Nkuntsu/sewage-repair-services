import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, parseBody, requireApiAdmin } from "@/lib/api";
import { teamSchema } from "@/lib/validations/team";

/** GET /api/teams — admin only. */
export async function GET() {
  try {
    await requireApiAdmin();
    const teams = await prisma.team.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { reports: { where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } } } } },
      },
    });
    return NextResponse.json({ teams });
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/teams — admin only. */
export async function POST(request: Request) {
  try {
    await requireApiAdmin();
    const input = await parseBody(request, teamSchema);
    const team = await prisma.team.create({
      data: {
        name: input.name,
        contactNumber: input.contactNumber ?? null,
        technicianCount: input.technicianCount,
        status: input.status,
      },
    });
    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
