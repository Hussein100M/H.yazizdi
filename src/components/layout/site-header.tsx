import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { ButtonLink } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";

const links = [
  { href: "/course", label: "الدورة" },
  { href: "/#curriculum", label: "المنهج" },
  { href: "/#prompts", label: "صيغ البرومبت" },
  { href: "/#pricing", label: "الاشتراك" },
  { href: "/faq", label: "أسئلة شائعة" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--hairline)] bg-[var(--surface)]/92 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="fin-mark h-7 w-5 shrink-0" aria-hidden />
          <span className="text-[0.9375rem] font-semibold leading-tight text-[var(--text-strong)]">
            التصوير المعماري
            <span className="block text-fine font-normal text-[var(--text-muted)]">
              بالذكاء الاصطناعي
            </span>
          </span>
        </Link>

        <nav aria-label="روابط الموقع" className="mx-auto hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[0.9375rem] text-[var(--text-body)] transition-colors hover:text-crimson"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2 lg:ms-0">
          {user ? (
            <ButtonLink href="/dashboard" size="sm" variant="outline" className="hidden sm:inline-flex">
              لوحتي
            </ButtonLink>
          ) : (
            <ButtonLink href="/login" size="sm" variant="ghost" className="hidden sm:inline-flex">
              تسجيل الدخول
            </ButtonLink>
          )}
          <ButtonLink href={user ? "/dashboard" : "/register"} size="sm" className="hidden sm:inline-flex">
            {user ? "أكمل التعلّم" : "ابدأ الدورة"}
          </ButtonLink>
          <MobileNav links={links} isSignedIn={Boolean(user)} />
        </div>
      </div>
    </header>
  );
}
