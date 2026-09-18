import Image from "next/image";
import type { Block } from "@/lib/blocks";
import { CompareSlider } from "./compare-slider";
import { Checklist } from "./checklist";
import { PromptCard } from "./prompt-card";

const toneStyles: Record<string, string> = {
  accent: "bg-[color-mix(in_srgb,var(--color-crimson)_7%,var(--surface))]",
  positive: "bg-[var(--surface-2)]",
  negative: "bg-[var(--surface-2)]",
  neutral: "bg-[var(--surface-2)]",
};

function BlockView({ block, lessonId }: { block: Block; lessonId: string }) {
  switch (block.kind) {
    case "HEADING":
      return (
        <div>
          {block.eyebrow ? <p className="annot mb-2">{block.eyebrow}</p> : null}
          <h3 className="text-h3">{block.text}</h3>
        </div>
      );

    case "PARAGRAPH":
      return (
        <p
          className={
            block.lead
              ? "max-w-[68ch] text-[var(--text-lead)] leading-[1.85] text-[var(--text-strong)]"
              : "max-w-[70ch] leading-[1.9]"
          }
        >
          {block.text}
        </p>
      );

    case "LIST":
      return (
        <ul className="max-w-[68ch] space-y-2.5">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3">
              <span
                aria-hidden
                className={`mt-2.5 block h-1.5 w-1.5 shrink-0 ${
                  block.variant === "dont" ? "bg-[var(--text-muted)]" : "bg-crimson"
                }`}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "SPLIT":
      return (
        <div
          className={`grid gap-4 ${
            block.columns.length >= 3 ? "sm:grid-cols-3" : "md:grid-cols-2"
          }`}
        >
          {block.columns.map((column) => (
            <div
              key={column.title}
              className={`plate p-5 ${toneStyles[column.tone ?? "neutral"] ?? toneStyles.neutral}`}
            >
              {column.eyebrow ? (
                <p className="text-fine font-medium text-crimson">{column.eyebrow}</p>
              ) : null}
              <h4 className="mt-1 text-[1.0625rem] font-semibold text-[var(--text-strong)]">
                {column.title}
              </h4>
              {column.items.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {column.items.map((item) => (
                    <li key={item} className="flex gap-2.5 text-fine leading-relaxed">
                      <span
                        aria-hidden
                        className="mt-2 block h-1 w-1 shrink-0 bg-[var(--text-muted)]"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      );

    case "STEPS":
      return (
        <ol className="grid gap-px border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-2">
          {block.steps.map((step, index) => (
            <li key={step.title} className="bg-[var(--surface)] p-5">
              <span className="font-[family-name:var(--font-annot)] text-[1.125rem] text-crimson">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h4 className="mt-1.5 text-[1.0625rem] font-semibold text-[var(--text-strong)]">
                {step.title}
              </h4>
              <p className="mt-1 text-fine leading-relaxed text-[var(--text-muted)]">{step.text}</p>
            </li>
          ))}
        </ol>
      );

    case "PROMPT":
      return <PromptCard badge="PROMPT" moduleTitle={block.label} text={block.text} />;

    case "COMPARE":
      return (
        <div>
          <CompareSlider before={block.before} after={block.after} />
          {block.notes && block.notes.length > 0 ? (
            <ul className="mt-4 grid gap-px border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-3">
              {block.notes.map((note) => (
                <li key={note.title} className="bg-[var(--surface)] p-4">
                  <p className="text-[0.9375rem] font-semibold text-[var(--text-strong)]">
                    {note.title}
                  </p>
                  <p className="mt-1 text-fine text-[var(--text-muted)]">{note.text}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      );

    case "GALLERY":
      return (
        <div>
          <ul
            className={`grid gap-4 ${
              block.columns === 4
                ? "sm:grid-cols-2 lg:grid-cols-4"
                : block.columns === 2
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {block.items.map((item) => (
              <li key={item.src + item.title} className="plate overflow-hidden">
                <div className="relative aspect-[3/2]">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                    className="object-cover"
                  />
                </div>
                <div className="border-t border-[var(--hairline)] p-3.5">
                  <p className="text-[0.9375rem] font-semibold text-[var(--text-strong)]">
                    {item.title}
                  </p>
                  {item.subtitle ? <p className="annot mt-0.5">{item.subtitle}</p> : null}
                  {item.caption ? (
                    <p className="mt-1.5 text-fine text-[var(--text-muted)]">{item.caption}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          {block.footnote ? (
            <p className="mt-3 text-fine text-[var(--text-muted)]">{block.footnote}</p>
          ) : null}
        </div>
      );

    case "CALLOUT":
      return (
        <blockquote className="border-s-2 border-crimson ps-5">
          <p className="max-w-[58ch] text-[1.25rem] leading-[1.7] text-[var(--text-strong)]">
            {block.text}
          </p>
          {block.source ? <cite className="annot mt-2 block not-italic">{block.source}</cite> : null}
        </blockquote>
      );

    case "CHECKLIST":
      return <Checklist id={lessonId} items={block.items} />;

    default:
      return null;
  }
}

export function LessonBlocks({ blocks, lessonId }: { blocks: Block[]; lessonId: string }) {
  return (
    <div className="space-y-9">
      {blocks.map((block, index) => (
        <BlockView key={`${block.kind}-${index}`} block={block} lessonId={lessonId} />
      ))}
    </div>
  );
}
