import type { ReportStatusValue } from "@/lib/constants";
import { formatShortDate, formatTime } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";

export type TimelineEntry = {
  id: number;
  status: ReportStatusValue;
  comment: string;
  createdAt: Date | string;
};

/** Repair updates, oldest first, like "08:14 Report received". */
export function RepairTimeline({ updates }: { updates: TimelineEntry[] }) {
  if (updates.length === 0) {
    return <p className="text-sm text-muted">No updates yet.</p>;
  }

  return (
    <ol className="space-y-4">
      {updates.map((update) => (
        <li key={update.id} className="flex gap-4">
          <div className="w-16 flex-none text-right">
            <p className="font-mono text-sm font-semibold text-navy">{formatTime(update.createdAt)}</p>
            <p className="text-[11px] text-muted">{formatShortDate(update.createdAt)}</p>
          </div>
          <div className="flex-1 border-l-2 border-slate-200 pb-1 pl-4">
            <p className="text-sm text-navy">{update.comment}</p>
            <div className="mt-1">
              <StatusBadge status={update.status} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** First time each status appears in the timeline — used by the progress tracker. */
export function firstTimePerStatus(updates: TimelineEntry[]): Partial<Record<ReportStatusValue, Date | string>> {
  const result: Partial<Record<ReportStatusValue, Date | string>> = {};
  for (const update of updates) {
    if (!result[update.status]) result[update.status] = update.createdAt;
  }
  return result;
}
