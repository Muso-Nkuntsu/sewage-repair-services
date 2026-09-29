import { APP_TIME_ZONE, ISSUE_TYPE_LABELS, type IssueTypeValue } from "./constants";

export function formatReference(referenceNumber: number): string {
  return `#${referenceNumber}`;
}

export function formatIssueType(issueType: IssueTypeValue): string {
  return ISSUE_TYPE_LABELS[issueType] ?? issueType;
}

/** 22 July 2026 */
export function formatDate(value: Date | string): string {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  }).format(new Date(value));
}

/** 22 July 2026, 08:14 */
export function formatDateTime(value: Date | string): string {
  const date = new Date(value);
  const time = formatTime(date);
  return `${formatDate(date)}, ${time}`;
}

/** 08:14 */
export function formatTime(value: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: APP_TIME_ZONE,
  }).format(new Date(value));
}

/** 22 Jul 2026 */
export function formatShortDate(value: Date | string): string {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  }).format(new Date(value));
}

/** yyyy-mm-dd in South African time, for <input type="date"> values. */
export function toDateInputValue(value: Date | string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: APP_TIME_ZONE,
  }).format(new Date(value));
  return parts; // en-CA already formats as yyyy-mm-dd
}

export function formatLocation(location: string, landmark: string | null | undefined): string {
  return landmark ? `${location} — ${landmark}` : location;
}
