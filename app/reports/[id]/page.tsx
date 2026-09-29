import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reportDetailInclude } from "@/lib/reports";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  AssignmentPanel,
  ProgressCard,
  ReportHeader,
  UpdatesCard,
} from "@/components/reports/ReportDetails";
import { CancelReportButton, RefreshButton } from "@/components/reports/ReportActions";

export const metadata: Metadata = { title: "Track Report" };

type ReportDetailPageProps = { params: Promise<{ id: string }> };

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const user = await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const report = await prisma.report.findUnique({ where: { id }, include: reportDetailInclude });

  // Residents may only see their own reports.
  if (!report || (user.role !== "ADMIN" && report.residentId !== user.id)) notFound();

  return (
    <div className="page-container max-w-5xl py-8 sm:py-10">
      <PageHeader
        title="Track Report"
        description="Follow your report from submission to repair."
        backHref={user.role === "ADMIN" ? "/admin/reports" : "/my-reports"}
        backLabel={user.role === "ADMIN" ? "All reports" : "My reports"}
        actions={<RefreshButton />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ReportHeader report={report} />
          <UpdatesCard report={report} description="Updates from the repair team appear here." />
        </div>
        <div className="space-y-6">
          <ProgressCard report={report} />
          <AssignmentPanel report={report} />
          {user.role === "RESIDENT" && report.status === "REPORTED" ? (
            <CancelReportButton reportId={report.id} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
