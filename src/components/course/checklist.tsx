"use client";

import { useMemo } from "react";
import { readLocal, useLocalValue, writeLocal } from "@/hooks/use-browser-value";

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
  const raw = useLocalValue(storageKey);

  const checked = useMemo(() => {
    const empty = items.map(() => false);
    if (!raw) return empty;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === items.length) return parsed.map(Boolean);
    } catch {
      // قيمة تالفة — نتجاهلها ونبدأ من قائمة فارغة
    }
    return empty;
  }, [raw, items]);

  function toggle(index: number) {
    const current = readLocal(storageKey);
    let base = items.map(() => false);
    if (current) {
      try {
        const parsed: unknown = JSON.parse(current);
        if (Array.isArray(parsed) && parsed.length === items.length) base = parsed.map(Boolean);
      } catch {
        // نبدأ من قائمة فارغة
      }
    }
    const next = base.map((value, i) => (i === index ? !value : value));
    writeLocal(storageKey, JSON.stringify(next));
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
