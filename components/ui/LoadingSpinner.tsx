type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  /** Screen-reader text. Pass "" when a visible label is shown next to it. */
  label?: string;
  className?: string;
};

const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };

export function LoadingSpinner({ size = "md", label = "Loading", className = "" }: LoadingSpinnerProps) {
  return (
    <span role={label ? "status" : undefined} className={`inline-flex items-center ${className}`}>
      <svg className={`${sizes[size]} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
