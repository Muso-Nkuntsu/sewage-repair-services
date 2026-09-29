import type { ReactNode } from "react";

type Accent = "blue" | "purple" | "orange" | "green" | "navy" | "amber";

const accents: Record<Accent, string> = {
  blue: "bg-brand-light text-brand",
  purple: "bg-purple-50 text-purple-700",
  orange: "bg-orange-50 text-orange-600",
  green: "bg-green-50 text-success",
  navy: "bg-slate-100 text-navy",
  amber: "bg-amber-50 text-amber-700",
};

type DashboardCardProps = {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: string;
  icon?: ReactNode;
  accent?: Accent;
};

export function DashboardCard({ label, value, unit, hint, icon, accent = "blue" }: DashboardCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        {icon ? <span className={`rounded-lg p-2 ${accents[accent]}`}>{icon}</span> : null}
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-navy">
        {value}
        {unit ? <span className="ml-1 text-base font-semibold text-muted">{unit}</span> : null}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
