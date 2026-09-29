import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdminDashboardStats } from "@/lib/dashboard";
import { OPEN_STATUSES } from "@/lib/constants";
import { formatDate, formatDateTime, formatIssueType, formatReference } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CheckIcon,
  ClipboardIcon,
  ClockIcon,
  SearchIcon,
  UsersIcon,
  WrenchIcon,
} from "@/components/ui/Icons";
import { Table, TBody, TD, TH, THead } from "@/components/ui/Table";
import { InspectionStatusBadge, StatusBadge, TeamStatusBadge } from "@/components/reports/StatusBadge";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  const [stats, openReports, teams, upcomingInspections] = await Promise.all([
    getAdminDashboardStats(),
    prisma.report.findMany({
      where: { status: { in: OPEN_STATUSES } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        resident: { select: { firstName: true, lastName: true } },
        assignedTeam: { select: { name: true } },
      },
    }),
    prisma.team.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { reports: { where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } } } } },
      },
    }),
    prisma.inspection.findMany({ orderBy: { inspectionDate: "desc" }, take: 4 }),
  ]);

  return (
    <div className="page-container py-8 sm:py-10">
      <PageHeader
        title="Operations Dashboard"
        description={`Welcome back, ${admin.firstName}. Here's what needs attention today.`}
        actions={
          <>
            <ButtonLink href="/admin/reports" variant="secondary">
              All reports
            </ButtonLink>
            <ButtonLink href="/admin/reports?status=REPORTED">New reports ({stats.reportedReports})</ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          label="Open Reports"
          value={stats.openReports}
          hint={`${stats.reportedReports} waiting for a team`}
          icon={<ClipboardIcon className="h-5 w-5" />}
          accent="blue"
        />
        <DashboardCard
          label="Assigned Jobs"
          value={stats.assignedJobs}
          hint="Team assigned, not yet started"
          icon={<UsersIcon className="h-5 w-5" />}
          accent="purple"
        />
        <DashboardCard
          label="In Progress"
          value={stats.inProgress}
          hint="Teams currently on site"
          icon={<WrenchIcon className="h-5 w-5" />}
          accent="orange"
        />
        <DashboardCard
          label="Resolved This Week"
          value={stats.resolvedThisWeek}
          hint={`${stats.resolvedTotal} resolved in total`}
          icon={<CheckIcon className="h-5 w-5" />}
          accent="green"
        />
        <DashboardCard
          label="Average Fix Time"
          value={stats.averageFixHours ?? "—"}
          unit={stats.averageFixHours !== null ? "hrs" : undefined}
          hint="From report to resolution"
          icon={<ClockIcon className="h-5 w-5" />}
          accent="navy"
        />
        <DashboardCard
          label="Teams On Duty"
          value={stats.teamsOnDuty}
          unit={`/ ${stats.totalTeams}`}
          hint={`${stats.inspectionsThisWeek} inspections this week`}
          icon={<SearchIcon className="h-5 w-5" />}
          accent="amber"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Open reports"
          description="Newest first"
          padded={false}
          actions={
            <Link href="/admin/reports" className="text-sm font-semibold text-brand hover:underline">
              View all
            </Link>
          }
        >
          {openReports.length === 0 ? (
            <EmptyState title="No open reports." description="Every reported problem has been resolved." />
          ) : (
            <Table caption="Open reports">
              <THead>
                <tr>
                  <TH>Ref</TH>
                  <TH>Issue</TH>
                  <TH>Location</TH>
                  <TH>Status</TH>
                  <TH>Team</TH>
                  <TH>Reported</TH>
                </tr>
              </THead>
              <TBody>
                {openReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <TD>
                      <Link
                        href={`/admin/reports/${report.id}`}
                        className="font-mono font-bold text-brand hover:underline"
                      >
                        {formatReference(report.referenceNumber)}
                      </Link>
                    </TD>
                    <TD className="whitespace-nowrap">{formatIssueType(report.issueType)}</TD>
                    <TD className="text-muted">{report.location}</TD>
                    <TD>
                      <StatusBadge status={report.status} />
                    </TD>
                    <TD className="whitespace-nowrap">{report.assignedTeam?.name ?? "—"}</TD>
                    <TD className="whitespace-nowrap text-muted">{formatDateTime(report.createdAt)}</TD>
                  </tr>
                ))}
              </TBody>
            </Table>
          )}
        </Card>

        <div className="space-y-6">
          <Card
            title="Teams"
            actions={
              <Link href="/admin/teams" className="text-sm font-semibold text-brand hover:underline">
                Manage
              </Link>
            }
          >
            {teams.length === 0 ? (
              <p className="text-sm text-muted">No teams yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {teams.map((team) => (
                  <li key={team.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-navy">{team.name}</p>
                      <p className="text-xs text-muted">
                        {team.technicianCount} technicians · {team._count.reports} active{" "}
                        {team._count.reports === 1 ? "job" : "jobs"}
                      </p>
                    </div>
                    <TeamStatusBadge status={team.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            title="Recent inspections"
            actions={
              <Link href="/admin/inspections" className="text-sm font-semibold text-brand hover:underline">
                View all
              </Link>
            }
          >
            {upcomingInspections.length === 0 ? (
              <p className="text-sm text-muted">No inspections recorded.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {upcomingInspections.map((inspection) => (
                  <li key={inspection.id} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-navy">{inspection.location}</p>
                      <InspectionStatusBadge status={inspection.status} />
                    </div>
                    <p className="text-xs text-muted">
                      {formatDate(inspection.inspectionDate)} · {inspection.inspectorName}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
