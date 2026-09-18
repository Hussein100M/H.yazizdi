"use client";

import Link from "next/link";
import { useState } from "react";
import type { CurriculumModule } from "@/lib/course";

const arabicDigits = (value: number) => value.toLocaleString("ar-EG");

/** المنهج: وحدات قابلة للفتح، وكل درس سطر واحد واضح. */
export function Curriculum({
  modules,
  courseSlug,
  completedLessonIds,
  canViewAll = false,
  defaultOpen = 0,
}: {
  modules: CurriculumModule[];
  courseSlug: string;
  completedLessonIds?: string[];
  canViewAll?: boolean;
  defaultOpen?: number | null;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);
  const completed = new Set(completedLessonIds ?? []);

  return (
    <ol className="space-y-3">
      {modules.map((module, index) => {
        const isOpen = openIndex === index;
        const panelId = `module-panel-${module.slug}`;
        const moduleMinutes = module.lessons.reduce((total, lesson) => total + lesson.minutes, 0);
        const moduleCompleted = module.lessons.filter((lesson) => completed.has(lesson.id)).length;

        return (
          <li key={module.id} className="plate">
            <h3>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-start gap-4 p-4 text-start sm:p-5"
              >
                <span
                  aria-hidden
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--surface-2)] font-[family-name:var(--font-annot)] text-[0.9375rem] text-crimson"
                >
                  {module.badge}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[1.0625rem] font-semibold text-[var(--text-strong)]">
                    {module.title}
                  </span>
                  <span className="mt-0.5 block text-fine text-[var(--text-muted)]">
                    {module.summary}
                  </span>
                </span>

                <span className="flex shrink-0 items-center gap-3 pt-1">
                  <span className="hidden text-fine text-[var(--text-muted)] sm:inline">
                    {completedLessonIds
                      ? `${arabicDigits(moduleCompleted)}/${arabicDigits(module.lessons.length)}`
                      : `${arabicDigits(module.lessons.length)} دروس`}
                  </span>
                  <span
                    aria-hidden
                    className={`block h-2 w-2 border-b border-s border-[var(--text-muted)] transition-transform ${
                      isOpen ? "rotate-[135deg]" : "-rotate-45"
                    }`}
                  />
                </span>
              </button>
            </h3>

            {isOpen ? (
              <ul id={panelId} className="border-t border-[var(--hairline)]">
                {module.lessons.map((lesson) => {
                  const openable = canViewAll || lesson.isPreview;
                  const isDone = completed.has(lesson.id);
                  const inner = (
                    <>
                      <span
                        aria-hidden
                        className={`mt-1.5 block h-1.5 w-1.5 shrink-0 ${
                          isDone ? "bg-crimson" : "bg-[var(--hairline)]"
                        }`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.9375rem] text-[var(--text-strong)]">
                          {lesson.title}
                        </span>
                        <span className="mt-0.5 block text-fine text-[var(--text-muted)]">
                          {lesson.summary.length > 110
                            ? `${lesson.summary.slice(0, 110)}…`
                            : lesson.summary}
                        </span>
                      </span>
                      <span className="shrink-0 pt-0.5 text-fine text-[var(--text-muted)]">
                        {lesson.isPreview && !canViewAll ? (
                          <span className="text-crimson">معاينة مجانية</span>
                        ) : (
                          `${arabicDigits(lesson.minutes)} د`
                        )}
                      </span>
                    </>
                  );

                  return (
                    <li key={lesson.id} className="border-b border-[var(--hairline)] last:border-b-0">
                      {openable ? (
                        <Link
                          href={`/learn/${courseSlug}/${lesson.slug}`}
                          className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-2)] sm:px-5"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div className="flex items-start gap-3 px-4 py-3 sm:px-5">{inner}</div>
                      )}
                    </li>
                  );
                })}

                <li className="px-4 py-3 text-fine text-[var(--text-muted)] sm:px-5">
                  زمن قراءة تقديري للوحدة: {arabicDigits(moduleMinutes)} دقيقة
                </li>
              </ul>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
