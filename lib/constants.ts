// Shared enum values and display labels.
// These mirror the Prisma enums but have no Prisma import, so they are safe
// to use in client components as well as on the server.

export const ROLES = ["RESIDENT", "ADMIN"] as const;
export type RoleValue = (typeof ROLES)[number];

export const ISSUE_TYPES = ["BURST_PIPE", "BLOCKED_DRAIN", "SEWAGE_OVERFLOW", "OTHER"] as const;
export type IssueTypeValue = (typeof ISSUE_TYPES)[number];

export const REPORT_STATUSES = ["REPORTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CANCELLED"] as const;
export type ReportStatusValue = (typeof REPORT_STATUSES)[number];

export const TEAM_STATUSES = ["ON_DUTY", "OFF_DUTY"] as const;
export type TeamStatusValue = (typeof TEAM_STATUSES)[number];

export const INSPECTION_STATUSES = ["SCHEDULED", "COMPLETED", "ISSUE_FOUND"] as const;
export type InspectionStatusValue = (typeof INSPECTION_STATUSES)[number];

export const ISSUE_TYPE_LABELS: Record<IssueTypeValue, string> = {
  BURST_PIPE: "Burst Pipe",
  BLOCKED_DRAIN: "Blocked Drain",
  SEWAGE_OVERFLOW: "Sewage Overflow",
  OTHER: "Other",
};

export const ISSUE_TYPE_HINTS: Record<IssueTypeValue, string> = {
  BURST_PIPE: "Water or sewage spraying or leaking from a broken pipe",
  BLOCKED_DRAIN: "Drain or manhole not flowing, water pooling",
  SEWAGE_OVERFLOW: "Sewage coming up from a drain, manhole or toilet",
  OTHER: "Missing manhole cover, bad smell or anything else",
};

export const REPORT_STATUS_LABELS: Record<ReportStatusValue, string> = {
  REPORTED: "Reported",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CANCELLED: "Cancelled",
};

export const TEAM_STATUS_LABELS: Record<TeamStatusValue, string> = {
  ON_DUTY: "On Duty",
  OFF_DUTY: "Off Duty",
};

export const INSPECTION_STATUS_LABELS: Record<InspectionStatusValue, string> = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  ISSUE_FOUND: "Issue Found",
};

/** Statuses that count as "still open" (work still to do). */
export const OPEN_STATUSES: ReportStatusValue[] = ["REPORTED", "ASSIGNED", "IN_PROGRESS"];

/** The four steps shown on the resident's progress tracker. */
export const TRACKER_STEPS: ReportStatusValue[] = ["REPORTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];

export const SESSION_COOKIE = "srs_session";
export const APP_TIME_ZONE = "Africa/Johannesburg";
