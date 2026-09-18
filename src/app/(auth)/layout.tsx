import Link from "next/link";
import { site } from "@/config/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <main id="main" className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="fin-mark h-7 w-5" aria-hidden />
            <span className="text-[0.9375rem] font-semibold text-[var(--text-strong)]">
              {site.name}
            </span>
          </Link>
          <div className="mt-8">{children}</div>
        </div>
      </main>

      <aside
        data-surface="ink"
        className="hidden bg-ink px-12 py-16 lg:flex lg:flex-col lg:justify-center"
      >
        <span className="fin-mark mb-8 block h-8 w-16" aria-hidden />
        <p className="max-w-[26ch] text-[1.625rem] leading-[1.55] text-[#f4f5f6]">
          المعماري يقرّر… والذكاء الاصطناعي يُحسّن.
        </p>
        <p className="mt-6 max-w-[42ch] text-[#c9ccd2]">
          خمس مهارات عملية تشكّل معاً سير عمل واحداً، مع الحفاظ الكامل على الكتلة والنسب وهوية
          المشروع.
        </p>
        <p className="annot mt-10">{site.tagline}</p>
      </aside>
    </div>
  );
}
