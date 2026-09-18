"use client";

import Link from "next/link";
import { useState } from "react";
import type { CurriculumModule } from "@/lib/course";
import { ProgressBar } from "@/components/ui/progress";

/** عمود المنهج داخل المشغّل: على اليمين، لأنها بداية القراءة في العربية. */
export function LessonSidebar({
  modules,
  courseSlug,
  currentLessonId,
  completedLessonIds,
  percent,
}: {
  modules: CurriculumModule[];
  courseSlug: string;
  currentLessonId: string;
  completedLessonIds: string[];
  percent: number;
}) {
  const [open, setOpen] = useState(false);
  const completed = new Set(completedLessonIds);

  const list = (
    <nav aria-label="دروس الدورة" className="scroll-shadow overflow-y-auto">
      <div className="p-4">
        <ProgressBar percent={percent} label="تقدّمك" size="sm" />
      </div>
      <ol>
        {modules.map((module) => (
          <li key={module.id} className="border-t border-[var(--hairline)]">
            <p className="flex items-baseline gap-2 px-4 pb-2 pt-4">
              <span className="font-[family-name:var(--font-annot)] text-fine text-crimson">
                {module.badge}
              </span>
              <span className="text-fine font-semibold text-[var(--text-strong)]">
                {module.title}
              </span>
            </p>
            <ul className="pb-2">
              {module.lessons.map((lesson) => {
                const isCurrent = lesson.id === currentLessonId;
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/learn/${courseSlug}/${lesson.slug}`}
                      aria-current={isCurrent ? "page" : undefined}
                      className={`flex items-start gap-2.5 px-4 py-2 text-fine transition-colors ${
                        isCurrent
                          ? "border-s-2 border-crimson bg-[color-mix(in_srgb,var(--color-crimson)_10%,transparent)] text-[var(--text-strong)]"
                          : "text-[var(--text-muted)] hover:text-[var(--text-strong)]"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`mt-1.5 block h-1.5 w-1.5 shrink-0 ${
                          completed.has(lesson.id) ? "bg-crimson" : "bg-[var(--hairline)]"
                        }`}
                      />
                      <span className="leading-snug">{lesson.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </nav>
  );

  return (
    <>
      {/* الجوال: لوح منزلق */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-10 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--hairline)] px-3 text-fine text-[var(--text-strong)]"
          aria-expanded={open}
          aria-controls="lesson-drawer"
        >
          <span className="fin-mark h-4 w-3.5" aria-hidden />
          دروس الدورة
        </button>

        {open ? (
          <div className="fixed inset-0 z-50 flex">
            <button
              type="button"
              className="flex-1 bg-black/55"
              onClick={() => setOpen(false)}
              aria-label="إغلاق قائمة الدروس"
            />
            <div
              id="lesson-drawer"
              className="flex h-full w-[min(20rem,85vw)] flex-col border-s border-[var(--hairline)] bg-[var(--surface)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--hairline)] px-4 py-3">
                <p className="font-semibold text-[var(--text-strong)]">دروس الدورة</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-fine text-[var(--text-muted)]"
                >
                  إغلاق
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{list}</div>
            </div>
          </div>
        ) : null}
      </div>

      {/* سطح المكتب: عمود ثابت */}
      <aside className="hidden lg:sticky lg:top-0 lg:block lg:h-dvh lg:w-[19rem] lg:shrink-0 lg:border-s lg:border-[var(--hairline)]">
        <div className="flex h-full flex-col">{list}</div>
      </aside>
    </>
  );
}
