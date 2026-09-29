import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reportDetailInclude } from "@/lib/reports";
import { formatReference } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import {
  AssignmentPanel,
  ProgressCard,
  ReportHeader,
  UpdatesCard,
} from "@/components/reports/ReportDetails";
import { AdminReportControls } from "@/components/reports/AdminReportControls";
import { RefreshButton } from "@/components/reports/ReportActions";

export const metadata: Metadata = { title: "Manage Report" };

type AdminReportDetailPageProps = { params: Promise<{ id: string }> };

export default async function AdminReportDetailPage({ params }: AdminReportDetailPageProps) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [report, teams] = await Promise.all([
    prisma.report.findUnique({ where: { id }, include: reportDetailInclude }),
    prisma.team.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, technicianCount: true, status: true },
    }),
  ]);
  if (!report) notFound();

  const reference = formatReference(report.referenceNumber);

  return (
    <div className="page-container py-8 sm:py-10">
      <PageHeader
        title={`Manage report ${reference}`}
        backHref="/admin/reports"
        backLabel="All reports"
        actions={<RefreshButton label="Refresh" />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ReportHeader report={report} />

          <Card title="Resident">
            <dl className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Name</dt>
                <dd className="mt-0.5 font-semibold text-navy">
                  {report.resident.firstName} {report.resident.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Email</dt>
                <dd className="mt-0.5 break-all text-navy">{report.resident.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Phone</dt>
                <dd className="mt-0.5 text-navy">{report.contactPhone ?? report.resident.phoneNumber ?? "—"}</dd>
              </div>
            </dl>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <ProgressCard report={report} />
            <AssignmentPanel report={report} />
          </div>

          <UpdatesCard report={report} />
        </div>

        <div>
          <AdminReportControls
            reportId={report.id}
            reference={reference}
            currentStatus={report.status}
            currentTeamId={report.assignedTeamId}
            currentEta={report.eta}
            teams={teams}
          />
        </div>
      </div>
    </div>
  );
}
