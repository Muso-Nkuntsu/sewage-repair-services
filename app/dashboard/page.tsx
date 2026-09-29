import type { Metadata } from "next";
import Link from "next/link";
import { requireResident } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ReportCard } from "@/components/reports/ReportCard";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CheckIcon, ClipboardIcon, ClockIcon, MegaphoneIcon, SearchIcon } from "@/components/ui/Icons";
import { OPEN_STATUSES } from "@/lib/constants";

export const metadata: Metadata = { title: "Dashboard" };

export default async function ResidentDashboardPage() {
  const user = await requireResident();

  const [reports, total, open, resolved] = await Promise.all([
    prisma.report.findMany({
      where: { residentId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.report.count({ where: { residentId: user.id } }),
    prisma.report.count({ where: { residentId: user.id, status: { in: OPEN_STATUSES } } }),
    prisma.report.count({ where: { residentId: user.id, status: "RESOLVED" } }),
  ]);

  return (
    <div className="page-container py-8 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">Welcome, {user.firstName}</h1>
        <p className="mt-1 text-muted">Report sewage problems in your area and follow the repairs.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard label="My Reports" value={total} icon={<ClipboardIcon className="h-5 w-5" />} accent="blue" />
        <DashboardCard label="Open Reports" value={open} icon={<ClockIcon className="h-5 w-5" />} accent="orange" />
        <DashboardCard
          label="Resolved Reports"
          value={resolved}
          icon={<CheckIcon className="h-5 w-5" />}
          accent="green"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/report"
          className="flex items-center gap-4 rounded-xl bg-brand p-6 text-white shadow-sm transition hover:bg-brand-dark"
        >
          <span className="rounded-lg bg-white/15 p-3">
            <MegaphoneIcon className="h-7 w-7" />
          </span>
          <span>
            <span className="block text-lg font-bold">Report an Issue</span>
            <span className="block text-sm text-blue-100">Burst pipe, blocked drain or sewage overflow</span>
          </span>
        </Link>
        <Link
          href="/my-reports"
          className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand"
        >
          <span className="rounded-lg bg-brand-light p-3 text-brand">
            <SearchIcon className="h-7 w-7" />
          </span>
          <span>
            <span className="block text-lg font-bold text-navy">Track My Reports</span>
            <span className="block text-sm text-muted">See status, assigned team and updates</span>
          </span>
        </Link>
      </div>

      <Card
        className="mt-8"
        title="Recent reports"
        actions={
          total > 0 ? (
            <Link href="/my-reports" className="text-sm font-semibold text-brand hover:underline">
              View all
            </Link>
          ) : null
        }
      >
        {reports.length === 0 ? (
          <EmptyState
            icon={<ClipboardIcon className="h-6 w-6" />}
            title="You haven't submitted any reports yet."
            description="Report an issue to get started."
            action={<ButtonLink href="/report">Report an Issue</ButtonLink>}
          />
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} href={`/reports/${report.id}`} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
