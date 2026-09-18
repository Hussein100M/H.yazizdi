"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setLessonProgress } from "@/app/actions/progress";

type Neighbour = { slug: string; title: string } | null;

/** تعليم الإتمام والانتقال — الفعل الأساسي داخل المشغّل. */
export function PlayerNav({
  lessonId,
  courseSlug,
  previous,
  next,
  initiallyCompleted,
}: {
  lessonId: string;
  courseSlug: string;
  previous: Neighbour;
  next: Neighbour;
  initiallyCompleted: boolean;
}) {
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle(goNext: boolean) {
    const target = goNext ? true : !completed;
    setError(null);
    setCompleted(target);

    startTransition(async () => {
      const result = await setLessonProgress({ lessonId, completed: target });
      if (!result.ok) {
        setCompleted(!target);
        setError(result.error ?? "تعذّر حفظ التقدّم");
        return;
      }
      if (goNext && next) router.push(`/learn/${courseSlug}/${next.slug}`);
      else router.refresh();
    });
  }

  return (
    <div className="border-t border-[var(--hairline)] pt-6">
      {error ? (
        <p role="alert" className="mb-4 border-s-2 border-crimson bg-[var(--surface-2)] px-3 py-2 text-fine">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => toggle(false)}
          disabled={pending}
          aria-pressed={completed}
          className={`h-11 rounded-[var(--radius-control)] border px-5 text-[0.9375rem] transition-colors disabled:opacity-60 ${
            completed
              ? "border-crimson bg-crimson text-white"
              : "border-[var(--hairline)] text-[var(--text-strong)] hover:border-crimson"
          }`}
        >
          {completed ? "درس مكتمل" : "علّم الدرس مكتملاً"}
        </button>

        {next ? (
          <button
            type="button"
            onClick={() => toggle(true)}
            disabled={pending}
            className="h-11 rounded-[var(--radius-control)] bg-ink px-5 text-[0.9375rem] text-white transition-colors hover:bg-ink-soft disabled:opacity-60"
          >
            أكمل وانتقل إلى التالي
          </button>
        ) : (
          <Link
            href="/dashboard/certificate"
            className="flex h-11 items-center rounded-[var(--radius-control)] bg-ink px-5 text-[0.9375rem] text-white"
          >
            أنهِ الدورة
          </Link>
        )}
      </div>

      <nav aria-label="التنقل بين الدروس" className="mt-6 grid gap-3 sm:grid-cols-2">
        {previous ? (
          <Link
            href={`/learn/${courseSlug}/${previous.slug}`}
            className="plate p-4 transition-colors hover:border-crimson"
            rel="prev"
          >
            <span className="text-fine text-[var(--text-muted)]">الدرس السابق</span>
            <span className="mt-1 block text-[0.9375rem] font-medium text-[var(--text-strong)]">
              {previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}

        {next ? (
          <Link
            href={`/learn/${courseSlug}/${next.slug}`}
            className="plate p-4 text-end transition-colors hover:border-crimson"
            rel="next"
          >
            <span className="text-fine text-[var(--text-muted)]">الدرس التالي</span>
            <span className="mt-1 block text-[0.9375rem] font-medium text-[var(--text-strong)]">
              {next.title}
            </span>
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
