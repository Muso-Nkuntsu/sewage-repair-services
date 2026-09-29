import { Badge, type BadgeTone } from "@/components/ui/Badge";
import {
  INSPECTION_STATUS_LABELS,
  REPORT_STATUS_LABELS,
  TEAM_STATUS_LABELS,
  type InspectionStatusValue,
  type ReportStatusValue,
  type TeamStatusValue,
} from "@/lib/constants";

const reportTones: Record<ReportStatusValue, BadgeTone> = {
  REPORTED: "blue",
  ASSIGNED: "purple",
  IN_PROGRESS: "orange",
  RESOLVED: "green",
  CANCELLED: "red",
};

const teamTones: Record<TeamStatusValue, BadgeTone> = {
  ON_DUTY: "green",
  OFF_DUTY: "gray",
};

const inspectionTones: Record<InspectionStatusValue, BadgeTone> = {
  SCHEDULED: "blue",
  COMPLETED: "green",
  ISSUE_FOUND: "amber",
};

export function StatusBadge({ status }: { status: ReportStatusValue }) {
  return <Badge tone={reportTones[status]}>{REPORT_STATUS_LABELS[status]}</Badge>;
}

export function TeamStatusBadge({ status }: { status: TeamStatusValue }) {
  return <Badge tone={teamTones[status]}>{TEAM_STATUS_LABELS[status]}</Badge>;
}

export function InspectionStatusBadge({ status }: { status: InspectionStatusValue }) {
  return <Badge tone={inspectionTones[status]}>{INSPECTION_STATUS_LABELS[status]}</Badge>;
}
