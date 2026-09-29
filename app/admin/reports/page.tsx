import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildReportFilter } from "@/lib/reports";
import { REPORT_STATUS_LABELS, type ReportStatusValue } from "@/lib/constants";
import { formatDateTime, formatIssueType, formatReference } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlusIcon, SearchIcon } from "@/components/ui/Icons";
import { Table, TBody, TD, TH, THead } from "@/components/ui/Table";
import { StatusBadge } from "@/components/reports/StatusBadge";

export const metadata: Metadata = { title: "Reports" };

const FILTERS: { value: ReportStatusValue | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "REPORTED", label: REPORT_STATUS_LABELS.REPORTED },
  { value: "ASSIGNED", label: REPORT_STATUS_LABELS.ASSIGNED },
  { value: "IN_PROGRESS", label: REPORT_STATUS_LABELS.IN_PROGRESS },
  { value: "RESOLVED", label: REPORT_STATUS_LABELS.RESOLVED },
  { value: "CANCELLED", label: REPORT_STATUS_LABELS.CANCELLED },
];

type AdminReportsPageProps = {
  searchParams: Promise<{ status?: string | string[]; q?: string | string[] }>;
};

function buildHref(status: string, q: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/admin/reports?${query}` : "/admin/reports";
}

export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const reports = await prisma.report.findMany({
    where: buildReportFilter(status || null, q || null),
    orderBy: { createdAt: "desc" },
    include: {
      resident: { select: { firstName: true, lastName: true } },
      assignedTeam: { select: { name: true } },
    },
  });

  return (
    <div className="page-container py-8 sm:py-10">
      <PageHeader
        title="Reports"
        description="All reported sewage problems. Open a report to assign a team and post updates."
        actions={
          <ButtonLink href="/report" variant="secondary">
            <PlusIcon className="h-4 w-4" /> New report
          </ButtonLink>
        }
      />

      <Card padded={false}>
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Filter by status" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            {FILTERS.map((filter) => {
              const active = status === filter.value;
              return (
                <Link
                  key={filter.label}
                  href={buildHref(filter.value, q)}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    active ? "bg-navy text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </nav>

          <form action="/admin/reports" method="get" role="search" className="flex gap-2">
            {status ? <input type="hidden" name="status" value={status} /> : null}
            <label htmlFor="q" className="sr-only">
              Search reports
            </label>
            <div className="relative flex-1 lg:w-72">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="q"
                name="q"
                defaultValue={q}
                placeholder="Search #205, location, issue..."
                className="field-control pl-9"
              />
            </div>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>
        </div>

        {reports.length === 0 ? (
          <EmptyState
            title="No reports found."
            description={q || status ? "Try a different filter or search term." : undefined}
            action={
              q || status ? (
                <ButtonLink href="/admin/reports" variant="secondary">
                  Clear filters
                </ButtonLink>
              ) : null
            }
          />
        ) : (
          <Table caption="Reports">
            <THead>
              <tr>
                <TH>Reference</TH>
                <TH>Issue</TH>
                <TH>Location</TH>
                <TH>Resident</TH>
                <TH>Status</TH>
                <TH>Assigned Team</TH>
                <TH>Created</TH>
                <TH>
                  <span className="sr-only">Actions</span>
                </TH>
              </tr>
            </THead>
            <TBody>
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50">
                  <TD className="font-mono font-bold text-brand">{formatReference(report.referenceNumber)}</TD>
                  <TD className="whitespace-nowrap font-medium">{formatIssueType(report.issueType)}</TD>
                  <TD className="min-w-[10rem] text-muted">
                    {report.location}
                    {report.landmark ? <span className="block text-xs">{report.landmark}</span> : null}
                  </TD>
                  <TD className="whitespace-nowrap">
                    {report.resident.firstName} {report.resident.lastName}
                  </TD>
                  <TD>
                    <StatusBadge status={report.status} />
                  </TD>
                  <TD className="whitespace-nowrap">{report.assignedTeam?.name ?? "—"}</TD>
                  <TD className="whitespace-nowrap text-muted">{formatDateTime(report.createdAt)}</TD>
                  <TD className="text-right">
                    <ButtonLink href={`/admin/reports/${report.id}`} size="sm" variant="secondary">
                      Manage<span className="sr-only"> report {formatReference(report.referenceNumber)}</span>
                    </ButtonLink>
                  </TD>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
        <p className="border-t border-slate-100 px-4 py-3 text-xs text-muted">
          Showing {reports.length} {reports.length === 1 ? "report" : "reports"}
        </p>
      </Card>
    </div>
  );
}
