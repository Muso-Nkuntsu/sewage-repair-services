import Link from "next/link";
import type { IssueTypeValue, ReportStatusValue } from "@/lib/constants";
import { formatDate, formatIssueType, formatLocation, formatReference } from "@/lib/format";
import { ArrowRightIcon, MapPinIcon } from "@/components/ui/Icons";
import { StatusBadge } from "./StatusBadge";

export type ReportCardData = {
  id: number;
  referenceNumber: number;
  issueType: IssueTypeValue;
  location: string;
  landmark: string | null;
  status: ReportStatusValue;
  createdAt: Date | string;
};

export function ReportCard({ report, href }: { report: ReportCardData; href: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand hover:shadow"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-bold text-brand">{formatReference(report.referenceNumber)}</span>
          <span className="font-semibold text-navy">{formatIssueType(report.issueType)}</span>
        </div>
        <p className="mt-1 flex items-center gap-1 truncate text-sm text-muted">
          <MapPinIcon className="h-4 w-4 flex-none" />
          <span className="truncate">{formatLocation(report.location, report.landmark)}</span>
        </p>
        <p className="mt-0.5 text-xs text-muted">Reported {formatDate(report.createdAt)}</p>
      </div>
      <div className="flex flex-none flex-col items-end gap-2">
        <StatusBadge status={report.status} />
        <span className="flex items-center gap-1 text-xs font-medium text-brand">
          View <span className="sr-only">report {formatReference(report.referenceNumber)}</span>
          <ArrowRightIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
