import type { ReactNode } from "react";

export type BadgeTone = "gray" | "blue" | "purple" | "orange" | "green" | "red" | "amber";

const tones: Record<BadgeTone, string> = {
  gray: "bg-slate-100 text-slate-700 ring-slate-300",
  blue: "bg-blue-50 text-blue-700 ring-blue-300",
  purple: "bg-purple-50 text-purple-700 ring-purple-300",
  orange: "bg-orange-50 text-orange-700 ring-orange-300",
  green: "bg-green-50 text-green-700 ring-green-300",
  red: "bg-red-50 text-red-700 ring-red-300",
  amber: "bg-amber-50 text-amber-800 ring-amber-300",
};

const dots: Record<BadgeTone, string> = {
  gray: "bg-slate-500",
  blue: "bg-blue-600",
  purple: "bg-purple-600",
  orange: "bg-orange-500",
  green: "bg-green-600",
  red: "bg-red-600",
  amber: "bg-amber-500",
};

export function Badge({ tone = "gray", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${tones[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[tone]}`} aria-hidden="true" />
      {children}
    </span>
  );
}
