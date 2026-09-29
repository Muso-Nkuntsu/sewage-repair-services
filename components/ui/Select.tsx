import type { SelectHTMLAttributes } from "react";

export type SelectOption = { value: string; label: string };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  name: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  hint?: string;
};

export function Select({
  label,
  name,
  id,
  options,
  placeholder,
  error,
  hint,
  className = "",
  required,
  ...rest
}: SelectProps) {
  const inputId = id ?? name;
  const describedBy = [error ? `${inputId}-error` : null, hint ? `${inputId}-hint` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <label htmlFor={inputId} className="field-label">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      <select
        id={inputId}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={`field-control ${error ? "field-control-error" : ""}`}
        {...rest}
      >
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && !error ? (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
