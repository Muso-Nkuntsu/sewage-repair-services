import type { ReactNode } from "react";
import { DropletIcon } from "@/components/ui/Icons";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-start justify-center bg-brand-light px-4 py-10 sm:items-center">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
            <DropletIcon className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-navy">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">{children}</div>
      </div>
    </div>
  );
}
