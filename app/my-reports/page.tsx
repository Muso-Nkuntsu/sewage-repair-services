import type { Metadata } from "next";
import Link from "next/link";
import { requireResident } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClipboardIcon, PlusIcon } from "@/components/ui/Icons";
import { Table, TBody, TD, TH, THead } from "@/components/ui/Table";
import { ReportCard } from "@/components/reports/ReportCard";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { formatDate, formatIssueType, formatLocation, formatReference } from "@/lib/format";

export const metadata: Metadata = { title: "My Reports" };

export default async function MyReportsPage() {
  const user = await requireResident();
  const reports = await prisma.report.findMany({
    where: { residentId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="page-container py-8 sm:py-10">
      <PageHeader
        title="My Reports"
        description="Every report you've submitted and its current status. Select a report to track it."
        actions={
          <ButtonLink href="/report">
            <PlusIcon className="h-4 w-4" /> Report an Issue
          </ButtonLink>
        }
      />

      {reports.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ClipboardIcon className="h-6 w-6" />}
            title="You haven't submitted any reports yet."
            description="Report an issue to get started."
            action={<ButtonLink href="/report">Report an Issue</ButtonLink>}
          />
        </Card>
      ) : (
        <>
          {/* Phones: cards */}
          <div className="space-y-3 md:hidden">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} href={`/reports/${report.id}`} />
            ))}
          </div>

          {/* Tablets/desktop: table */}
          <Card padded={false} className="hidden md:block">
            <Table caption="My reports">
              <THead>
                <tr>
                  <TH>Reference</TH>
                  <TH>Issue</TH>
                  <TH>Location</TH>
                  <TH>Date reported</TH>
                  <TH>Status</TH>
                  <TH>
                    <span className="sr-only">Actions</span>
                  </TH>
                </tr>
              </THead>
              <TBody>
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <TD className="font-mono font-bold text-brand">{formatReference(report.referenceNumber)}</TD>
                    <TD className="font-medium">{formatIssueType(report.issueType)}</TD>
                    <TD className="text-muted">{formatLocation(report.location, report.landmark)}</TD>
                    <TD className="whitespace-nowrap text-muted">{formatDate(report.createdAt)}</TD>
                    <TD>
                      <StatusBadge status={report.status} />
                    </TD>
                    <TD className="text-right">
                      <Link
                        href={`/reports/${report.id}`}
                        className="font-semibold text-brand hover:underline"
                      >
                        Track<span className="sr-only"> report {formatReference(report.referenceNumber)}</span>
                      </Link>
                    </TD>
                  </tr>
                ))}
              </TBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
