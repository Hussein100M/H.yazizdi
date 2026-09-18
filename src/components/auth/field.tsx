import type { ComponentProps } from "react";

export function Field({
  label,
  id,
  hint,
  ...props
}: ComponentProps<"input"> & { label: string; id: string; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="block text-fine font-medium text-[var(--text-strong)]">
        {label}
      </label>
      <input
        id={id}
        name={id}
        {...props}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-1.5 h-11 w-full border border-[var(--hairline)] bg-[var(--surface)] px-3 text-[0.9375rem] text-[var(--text-strong)] transition-colors placeholder:text-[var(--text-muted)] focus:border-crimson rounded-[var(--radius-control)]"
      />
      {hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[0.75rem] text-[var(--text-muted)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
