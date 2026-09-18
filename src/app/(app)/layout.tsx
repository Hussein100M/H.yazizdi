import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { site } from "@/config/site";

const links = [
  { href: "/dashboard", label: "لوحتي" },
  { href: "/dashboard/certificate", label: "الشهادة" },
  { href: "/dashboard/settings", label: "الإعدادات" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="min-h-dvh bg-[var(--surface-2)]">
      <header data-surface="ink" className="bg-ink">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-5 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="fin-mark h-7 w-5" aria-hidden />
            <span className="hidden text-[0.9375rem] font-semibold text-[#f4f5f6] sm:block">
              {site.name}
            </span>
          </Link>

          <nav aria-label="روابط الحساب" className="flex items-center gap-4 overflow-x-auto">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 text-fine text-[#c9ccd2] transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            {user.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="shrink-0 text-fine text-[#c9ccd2] transition-colors hover:text-white"
              >
                الإدارة
              </Link>
            ) : null}
          </nav>

          <form action={logoutAction} className="ms-auto shrink-0">
            <button
              type="submit"
              className="text-fine text-[#8f949c] transition-colors hover:text-white"
            >
              خروج
            </button>
          </form>
        </div>
      </header>

      <main id="main">{children}</main>
    </div>
  );
}
