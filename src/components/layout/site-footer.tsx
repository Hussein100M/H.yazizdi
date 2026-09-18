import Link from "next/link";
import { instructor, site } from "@/config/site";

const columns = [
  {
    title: "الدورة",
    links: [
      { href: "/course", label: "صفحة الدورة" },
      { href: "/#curriculum", label: "المنهج الكامل" },
      { href: "/#prompts", label: "صيغ البرومبت" },
      { href: "/#pricing", label: "الاشتراك" },
    ],
  },
  {
    title: "الحساب",
    links: [
      { href: "/login", label: "تسجيل الدخول" },
      { href: "/register", label: "حساب جديد" },
      { href: "/dashboard", label: "لوحة الطالب" },
      { href: "/certificate", label: "التحقق من شهادة" },
    ],
  },
  {
    title: "الموقع",
    links: [
      { href: "/faq", label: "أسئلة شائعة" },
      { href: "/legal/terms", label: "شروط الاستخدام" },
      { href: "/legal/privacy", label: "سياسة الخصوصية" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--hairline)] bg-[var(--surface-2)]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <span className="fin-mark block h-7 w-12" aria-hidden />
            <p className="mt-4 text-[1.0625rem] font-semibold text-[var(--text-strong)]">
              {site.name}
            </p>
            <p className="mt-2 max-w-[40ch] text-fine leading-relaxed text-[var(--text-muted)]">
              المعماري يقرّر… والذكاء الاصطناعي يُحسّن.
            </p>
            <p className="annot mt-4">{site.tagline}</p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-fine font-semibold text-[var(--text-strong)]">{column.title}</h2>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-fine text-[var(--text-muted)] transition-colors hover:text-crimson"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-[var(--hairline)] pt-6 text-fine text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            إعداد {instructor.name} · {new Date().getFullYear().toLocaleString("ar-EG", { useGrouping: false })}
          </p>
          <p className="annot">AI Architectural Visualization &amp; Design Enhancement</p>
        </div>
      </div>
    </footer>
  );
}
