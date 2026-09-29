import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "@/components/ui/Icons";

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
};

export function PageHeader({ title, description, actions, backHref, backLabel = "Back" }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {backHref ? (
        <Link href={backHref} className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
          <ArrowLeftIcon className="h-4 w-4" />
          {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">{title}</h1>
          {description ? <p className="mt-1 text-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
