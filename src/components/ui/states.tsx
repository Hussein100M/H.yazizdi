import type { ReactNode } from "react";
import { ButtonLink } from "./button";

/** حالات التطبيق الحقيقية: تحميل، خطأ، فراغ، نجاح — بصوت الواجهة لا بصوت شخص. */

export function LoadingState({ label = "جارٍ التحميل" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16" role="status" aria-live="polite">
      <span className="fin-rhythm w-16 animate-pulse" aria-hidden />
      <span className="text-fine text-[var(--text-muted)]">{label}</span>
    </div>
  );
}

export function SkeletonPlate({ lines = 3 }: { lines?: number }) {
  return (
    <div className="plate p-5" aria-hidden>
      <div className="h-4 w-1/3 bg-[var(--hairline)]" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="h-3 bg-[color-mix(in_srgb,var(--hairline)_65%,transparent)]"
            style={{ width: `${100 - index * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="plate px-6 py-12 text-center">
      <span className="fin-rhythm mx-auto mb-5 block w-14" aria-hidden />
      <h3 className="text-h3">{title}</h3>
      <p className="mx-auto mt-2 max-w-[48ch] text-[var(--text-muted)]">{description}</p>
      {action ? (
        <ButtonLink href={action.href} className="mt-6">
          {action.label}
        </ButtonLink>
      ) : null}
    </div>
  );
}

export function ErrorState({
  title = "تعذّر إكمال الطلب",
  description,
  action,
}: {
  title?: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="plate border-crimson/40 bg-blush px-6 py-10 text-center">
      <h3 className="text-h3 text-crimson-deep">{title}</h3>
      <p className="mx-auto mt-2 max-w-[52ch] text-[var(--text-body)]">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="border-s-2 border-crimson bg-blush px-3 py-2 text-fine text-crimson-deep"
    >
      {message}
    </p>
  );
}

export function FormSuccess({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p
      role="status"
      className="border-s-2 border-[var(--text-strong)] bg-[var(--surface-2)] px-3 py-2 text-fine text-[var(--text-strong)]"
    >
      {message}
    </p>
  );
}
