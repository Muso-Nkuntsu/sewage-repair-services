import type { ReportDetail } from "@/lib/reports";
import { formatDateTime, formatIssueType, formatReference } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { ClockIcon, MapPinIcon, UsersIcon } from "@/components/ui/Icons";
import { StatusBadge } from "./StatusBadge";
import { ProgressTracker } from "./ProgressTracker";
import { RepairTimeline, firstTimePerStatus } from "./RepairTimeline";

/** Top block: "Report #205 · Sewage Overflow · Site C, Harare". */
export function ReportHeader({ report }: { report: ReportDetail }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-bold text-brand">Report {formatReference(report.referenceNumber)}</p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-navy">{formatIssueType(report.issueType)}</h1>
          <p className="mt-1 flex items-center gap-1 text-muted">
            <MapPinIcon className="h-4 w-4 flex-none" />
            {report.location}
            {report.landmark ? <span className="text-slate-400">·</span> : null}
            {report.landmark}
          </p>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <dl className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Reported</dt>
          <dd className="mt-0.5 text-sm text-navy">{formatDateTime(report.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Last updated</dt>
          <dd className="mt-0.5 text-sm text-navy">{formatDateTime(report.updatedAt)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Description</dt>
          <dd className="mt-0.5 whitespace-pre-line text-sm text-navy">{report.description}</dd>
        </div>
        {report.contactPhone ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Contact number</dt>
            <dd className="mt-0.5 text-sm text-navy">{report.contactPhone}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

/** Assigned team, technicians and ETA. */
export function AssignmentPanel({ report }: { report: ReportDetail }) {
  const team = report.assignedTeam;
  return (
    <Card title="Repair team">
      {team ? (
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Assigned Team</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 font-semibold text-navy">
              <UsersIcon className="h-4 w-4 text-brand" /> {team.name}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Technicians</dt>
            <dd className="mt-0.5 font-semibold text-navy">
              {team.technicianCount} {team.technicianCount === 1 ? "engineer" : "engineers"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">ETA</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 font-semibold text-navy">
              <ClockIcon className="h-4 w-4 text-brand" />
              {report.status === "RESOLVED" ? "Completed" : report.eta ?? "To be confirmed"}
            </dd>
          </div>
          {team.contactNumber ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Team contact</dt>
              <dd className="mt-0.5 font-semibold text-navy">{team.contactNumber}</dd>
            </div>
          ) : null}
        </dl>
      ) : (
        <p className="text-sm text-muted">
          {report.status === "CANCELLED"
            ? "No team was assigned."
            : "A repair team has not been assigned yet. You'll see the team and ETA here as soon as one is."}
        </p>
      )}
    </Card>
  );
}

export function ProgressCard({ report }: { report: ReportDetail }) {
  return (
    <Card title="Progress">
      <ProgressTracker status={report.status} stepTimes={firstTimePerStatus(report.repairUpdates)} />
    </Card>
  );
}

export function UpdatesCard({ report, description }: { report: ReportDetail; description?: string }) {
  return (
    <Card title="Repair updates" description={description}>
      <RepairTimeline updates={report.repairUpdates} />
    </Card>
  );
}
