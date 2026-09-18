"use client";

import { useState } from "react";

/** صيغة برومبت قابلة للنسخ — أكثر ما يأخذه المتدرب معه إلى عمله. */
export function PromptCard({
  badge,
  moduleTitle,
  text,
}: {
  badge: string;
  moduleTitle: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="plate flex flex-col p-5 pt-8">
      <span className="plate-mark">{badge}</span>
      <p className="text-fine text-[var(--text-muted)]">{moduleTitle}</p>
      <p className="mt-2 flex-1 text-[0.9375rem] leading-[1.9] text-[var(--text-strong)]">{text}</p>
      <button
        type="button"
        onClick={copy}
        className="mt-4 self-start border border-[var(--hairline)] px-3 py-1.5 text-fine text-[var(--text-body)] transition-colors hover:border-crimson hover:text-crimson rounded-[var(--radius-control)]"
      >
        {copied ? "نُسخت" : "انسخ الصيغة"}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "نُسخت صيغة البرومبت" : ""}
      </span>
    </article>
  );
}
