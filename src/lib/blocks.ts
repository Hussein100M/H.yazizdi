// أنواع كتل المحتوى. عمود LessonBlock.data في قاعدة البيانات يحمل إحدى هذه الحمولات.

export type Tone = "neutral" | "accent" | "positive" | "negative";

export type ImageRef = {
  src: string;
  alt: string;
  label?: string;
  caption?: string;
};

export type Block =
  | { kind: "HEADING"; eyebrow?: string; text: string }
  | { kind: "PARAGRAPH"; text: string; lead?: boolean }
  | { kind: "LIST"; items: string[]; variant?: "plain" | "do" | "dont" }
  | {
      kind: "SPLIT";
      columns: {
        eyebrow?: string;
        title: string;
        subtitle?: string;
        items: string[];
        tone?: Tone;
      }[];
    }
  | { kind: "STEPS"; steps: { title: string; text: string }[] }
  | { kind: "PROMPT"; label: string; text: string }
  | {
      kind: "COMPARE";
      before: ImageRef;
      after: ImageRef;
      notes?: { title: string; text: string }[];
    }
  | {
      kind: "GALLERY";
      items: (ImageRef & { title: string; subtitle?: string })[];
      columns?: 2 | 3 | 4;
      footnote?: string;
    }
  | { kind: "CALLOUT"; text: string; source?: string }
  | { kind: "CHECKLIST"; items: { title: string; text: string }[] };

export type BlockKindName = Block["kind"];

/** حارس تشغيلي: البيانات القادمة من قاعدة البيانات تمرّ من هنا قبل العرض. */
export function isBlock(value: unknown): value is Block {
  if (typeof value !== "object" || value === null) return false;
  const kind = (value as { kind?: unknown }).kind;
  return (
    typeof kind === "string" &&
    [
      "HEADING",
      "PARAGRAPH",
      "LIST",
      "SPLIT",
      "STEPS",
      "PROMPT",
      "COMPARE",
      "GALLERY",
      "CALLOUT",
      "CHECKLIST",
    ].includes(kind)
  );
}

/** زمن قراءة تقديري محسوب من المحتوى نفسه — لا رقم مُفترض. */
export function estimateMinutes(blocks: Block[]): number {
  const WORDS_PER_MINUTE = 180;
  let words = 0;
  const count = (text: string) => {
    words += text.trim().split(/\s+/).filter(Boolean).length;
  };

  for (const block of blocks) {
    switch (block.kind) {
      case "HEADING":
        count(block.text);
        break;
      case "PARAGRAPH":
        count(block.text);
        break;
      case "LIST":
        block.items.forEach(count);
        break;
      case "SPLIT":
        block.columns.forEach((column) => {
          count(column.title);
          column.items.forEach(count);
        });
        break;
      case "STEPS":
        block.steps.forEach((step) => {
          count(step.title);
          count(step.text);
        });
        break;
      case "PROMPT":
        count(block.text);
        break;
      case "COMPARE":
        block.notes?.forEach((note) => {
          count(note.title);
          count(note.text);
        });
        break;
      case "GALLERY":
        block.items.forEach((item) => {
          count(item.title);
          if (item.caption) count(item.caption);
        });
        break;
      case "CALLOUT":
        count(block.text);
        break;
      case "CHECKLIST":
        block.items.forEach((item) => {
          count(item.title);
          count(item.text);
        });
        break;
    }
  }

  // صورة أو مقارنة تستحق وقت تأمّل، لا وقت قراءة فقط
  const visuals = blocks.filter((b) => b.kind === "COMPARE" || b.kind === "GALLERY").length;
  return Math.max(2, Math.round(words / WORDS_PER_MINUTE) + visuals);
}
