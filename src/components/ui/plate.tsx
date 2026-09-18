import type { ReactNode } from "react";

/**
 * لوحة العيّنة — العنصر البنيوي الأساسي في الموقع.
 * تأشيرة الركن تحمل رقم الوحدة أو رمز اللقطة، بمنطق ترقيم لوحات الرسم المعماري.
 */
export function Plate({
  mark,
  children,
  className = "",
  as: Tag = "div",
}: {
  mark?: string;
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li" | "section";
}) {
  return (
    <Tag className={`plate ${className}`}>
      {mark ? <span className="plate-mark">{mark}</span> : null}
      {children}
    </Tag>
  );
}

export function PlateCaption({
  title,
  subtitle,
  note,
}: {
  title: string;
  subtitle?: string;
  note?: string;
}) {
  return (
    <div className="border-t border-[var(--hairline)] px-4 py-3">
      <p className="text-[0.9375rem] font-semibold text-[var(--text-strong)]">{title}</p>
      {subtitle ? <p className="annot mt-0.5">{subtitle}</p> : null}
      {note ? <p className="mt-1 text-fine text-[var(--text-muted)]">{note}</p> : null}
    </div>
  );
}

export function SectionHeading({
  annot,
  title,
  lead,
  align = "start",
}: {
  annot?: string;
  title: string;
  lead?: string;
  align?: "start" | "center";
}) {
  return (
    <header className={align === "center" ? "text-center" : ""}>
      {annot ? <p className="annot mb-3">{annot}</p> : null}
      <h2 className="text-[1.75rem] sm:text-[var(--text-h2)]">{title}</h2>
      {lead ? (
        <p className="mt-3 max-w-[62ch] text-[var(--text-body)] leading-[1.85]">{lead}</p>
      ) : null}
    </header>
  );
}
