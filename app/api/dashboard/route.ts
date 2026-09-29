import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireApiUser } from "@/lib/api";
import { getAdminDashboardStats } from "@/lib/dashboard";

/**
 * GET /api/dashboard
 *   Admin: operational statistics.
 *   Resident: counts for their own reports.
 */
export async function GET() {
  try {
    const user = await requireApiUser();

    if (user.role === "ADMIN") {
      const stats = await getAdminDashboardStats();
      return NextResponse.json({ role: "ADMIN", stats });
    }

    const groups = await prisma.report.groupBy({
      by: ["status"],
      where: { residentId: user.id },
      _count: { _all: true },
    });
    const count = (status: string) => groups.find((group) => group.status === status)?._count._all ?? 0;
    const total = groups.reduce((sum, group) => sum + group._count._all, 0);

    return NextResponse.json({
      role: "RESIDENT",
      stats: {
        totalReports: total,
        openReports: count("REPORTED") + count("ASSIGNED") + count("IN_PROGRESS"),
        resolvedReports: count("RESOLVED"),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
