// Dashboard statistics, calculated from MySQL.
import { prisma } from "./prisma";

export type AdminDashboardStats = {
  totalReports: number;
  openReports: number;
  reportedReports: number;
  assignedJobs: number;
  inProgress: number;
  resolvedTotal: number;
  resolvedThisWeek: number;
  averageFixHours: number | null;
  teamsOnDuty: number;
  totalTeams: number;
  inspectionsThisWeek: number;
  issuesFoundThisWeek: number;
};

/**
 * Monday 00:00 of the current week in South African time (UTC+2, no DST),
 * returned as a UTC Date for database comparison.
 */
export function startOfWeekSAST(now: Date = new Date()): Date {
  const offsetMs = 2 * 60 * 60 * 1000;
  const local = new Date(now.getTime() + offsetMs);
  const daysSinceMonday = (local.getUTCDay() + 6) % 7;
  const localMidnightMonday = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate() - daysSinceMonday
  );
  return new Date(localMidnightMonday - offsetMs);
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const weekStart = startOfWeekSAST();
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [statusGroups, resolvedThisWeek, resolvedReports, teamsOnDuty, totalTeams, inspectionsThisWeek, issuesFoundThisWeek] =
    await Promise.all([
      prisma.report.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.report.count({ where: { status: "RESOLVED", resolvedAt: { gte: weekStart } } }),
      prisma.report.findMany({
        where: { status: "RESOLVED", resolvedAt: { not: null } },
        select: { createdAt: true, resolvedAt: true },
      }),
      prisma.team.count({ where: { status: "ON_DUTY" } }),
      prisma.team.count(),
      prisma.inspection.count({ where: { inspectionDate: { gte: weekStart, lt: weekEnd } } }),
      prisma.inspection.count({
        where: { status: "ISSUE_FOUND", inspectionDate: { gte: weekStart, lt: weekEnd } },
      }),
    ]);

  const countFor = (status: string) =>
    statusGroups.find((group) => group.status === status)?._count._all ?? 0;

  const reportedReports = countFor("REPORTED");
  const assignedJobs = countFor("ASSIGNED");
  const inProgress = countFor("IN_PROGRESS");
  const resolvedTotal = countFor("RESOLVED");
  const totalReports = statusGroups.reduce((sum, group) => sum + group._count._all, 0);

  let averageFixHours: number | null = null;
  if (resolvedReports.length > 0) {
    const totalMs = resolvedReports.reduce((sum, report) => {
      const resolvedAt = report.resolvedAt ?? report.createdAt;
      return sum + Math.max(0, resolvedAt.getTime() - report.createdAt.getTime());
    }, 0);
    averageFixHours = Math.round((totalMs / resolvedReports.length / 3_600_000) * 10) / 10;
  }

  return {
    totalReports,
    openReports: reportedReports + assignedJobs + inProgress,
    reportedReports,
    assignedJobs,
    inProgress,
    resolvedTotal,
    resolvedThisWeek,
    averageFixHours,
    teamsOnDuty,
    totalTeams,
    inspectionsThisWeek,
    issuesFoundThisWeek,
  };
}
