import { REPORT_STATUS_LABELS, TRACKER_STEPS, type ReportStatusValue } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { CheckIcon } from "@/components/ui/Icons";

type ProgressTrackerProps = {
  status: ReportStatusValue;
  /** When each step was first reached (from the repair updates). */
  stepTimes?: Partial<Record<ReportStatusValue, Date | string>>;
};

/**
 * Vertical tracker: Reported → Assigned → In Progress → Resolved.
 * Completed steps show a tick, the current step is highlighted, future steps are hollow.
 * Every state is also written out in text, so colour is never the only signal.
 */
export function ProgressTracker({ status, stepTimes = {} }: ProgressTrackerProps) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="status">
        <p className="font-semibold">This report was cancelled.</p>
        <p className="mt-1">No further work will be done on it. Submit a new report if the problem is still there.</p>
      </div>
    );
  }

  const currentIndex = TRACKER_STEPS.indexOf(status);

  return (
    <ol className="relative" aria-label="Repair progress">
      {TRACKER_STEPS.map((step, index) => {
        const isDone = index < currentIndex || (index === currentIndex && step === "RESOLVED");
        const isCurrent = index === currentIndex && step !== "RESOLVED";
        const isLast = index === TRACKER_STEPS.length - 1;
        const reachedAt = stepTimes[step];
        const stateText = isDone ? "Completed" : isCurrent ? "Current step" : "Not started";

        return (
          <li key={step} className="relative flex gap-4 pb-6 last:pb-0" aria-current={isCurrent ? "step" : undefined}>
            {!isLast ? (
              <span
                className={`absolute left-4 top-9 -ml-px h-[calc(100%-2.25rem)] w-0.5 ${
                  index < currentIndex ? "bg-success" : "bg-slate-200"
                }`}
                aria-hidden="true"
              />
            ) : null}

            <span
              className={`relative z-10 flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 ${
                isDone
                  ? "border-success bg-success text-white"
                  : isCurrent
                    ? "border-brand bg-brand-light text-brand"
                    : "border-slate-300 bg-white text-slate-300"
              }`}
              aria-hidden="true"
            >
              {isDone ? (
                <CheckIcon className="h-4 w-4" />
              ) : isCurrent ? (
                <span className="h-3 w-3 rounded-full bg-brand" />
              ) : (
                <span className="h-2.5 w-2.5 rounded-full border-2 border-slate-300" />
              )}
            </span>

            <div className="pt-1">
              <p
                className={`text-sm font-semibold ${
                  isDone ? "text-navy" : isCurrent ? "text-brand" : "text-slate-400"
                }`}
              >
                {REPORT_STATUS_LABELS[step]}
                <span className="sr-only"> — {stateText}</span>
                {isCurrent ? (
                  <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Current
                  </span>
                ) : null}
              </p>
              {reachedAt && (isDone || isCurrent) ? (
                <p className="text-xs text-muted">{formatDateTime(reachedAt)}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
