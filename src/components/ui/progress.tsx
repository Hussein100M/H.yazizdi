export function ProgressBar({
  percent,
  label,
  showValue = true,
  size = "md",
}: {
  percent: number;
  label: string;
  showValue?: boolean;
  size?: "sm" | "md";
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-fine text-[var(--text-muted)]">{label}</span>
        {showValue ? (
          <span className="text-fine font-semibold text-[var(--text-strong)]">
            {clamped.toLocaleString("ar-EG")}٪
          </span>
        ) : null}
      </div>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={`mt-2 w-full overflow-hidden bg-[color-mix(in_srgb,var(--hairline)_60%,transparent)] ${
          size === "sm" ? "h-1" : "h-1.5"
        }`}
      >
        <div
          className="h-full bg-crimson transition-[width] duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
