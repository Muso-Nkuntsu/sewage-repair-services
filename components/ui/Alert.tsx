import type { ReactNode } from "react";
import { AlertIcon, CheckIcon } from "./Icons";

type AlertVariant = "error" | "success" | "info" | "warning";

const styles: Record<AlertVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-green-200 bg-green-50 text-green-800",
  info: "border-blue-200 bg-brand-light text-blue-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

export function Alert({
  variant = "info",
  title,
  children,
  className = "",
}: {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const Icon = variant === "success" ? CheckIcon : AlertIcon;
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex gap-3 rounded-lg border px-4 py-3 text-sm ${styles[variant]} ${className}`}
    >
      <Icon className="mt-0.5 h-5 w-5 flex-none" />
      <div>
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={title ? "mt-0.5" : ""}>{children}</div> : null}
      </div>
    </div>
  );
}
