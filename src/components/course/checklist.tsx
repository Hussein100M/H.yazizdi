"use client";

import { useEffect, useState } from "react";

/**
 * قائمة المراجعة — أداة يستخدمها المتدرب على صوره فعلاً.
 * حالة التأشير محلية في المتصفح: قائمة عمل، لا تقدّم في الدورة.
 */
export function Checklist({
  id,
  items,
}: {
  id: string;
  items: { title: string; text: string }[];
}) {
  const storageKey = `checklist:${id}`;
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === items.length) {
          setChecked(parsed.map(Boolean));
        }
      }
    } catch {
      // التخزين المحلي قد يكون معطّلاً — القائمة تعمل بدونه
    }
  }, [storageKey, items.length]);

  function toggle(index: number) {
    setChecked((previous) => {
      const next = previous.map((value, i) => (i === index ? !value : value));
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // تجاهل: القائمة تبقى صالحة لهذه الجلسة
      }
      return next;
    });
  }

  const done = checked.filter(Boolean).length;

  return (
    <div className="plate">
      <ul className="divide-y divide-[var(--hairline)]">
        {items.map((item, index) => (
          <li key={item.title}>
            <label className="flex cursor-pointer items-start gap-3 p-4">
              <input
                type="checkbox"
                checked={checked[index] ?? false}
                onChange={() => toggle(index)}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-crimson)]"
              />
              <span>
                <span
                  className={`block font-medium text-[var(--text-strong)] ${
                    checked[index] ? "line-through opacity-55" : ""
                  }`}
                >
                  {item.title}
                </span>
                <span className="mt-0.5 block text-fine text-[var(--text-muted)]">{item.text}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <p
        className="border-t border-[var(--hairline)] px-4 py-3 text-fine text-[var(--text-muted)]"
        aria-live="polite"
      >
        {done.toLocaleString("ar-EG")} من {items.length.toLocaleString("ar-EG")} بنود مراجَعة
      </p>
    </div>
  );
}
