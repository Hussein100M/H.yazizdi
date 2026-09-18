import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const links = [
  { href: "/admin", label: "نظرة عامة" },
  { href: "/admin/students", label: "الطلاب" },
  { href: "/admin/payments", label: "المدفوعات" },
  { href: "/admin/content", label: "المحتوى" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-dvh bg-[var(--surface-2)]">
      <header data-surface="ink" className="bg-ink">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href="/admin" className="flex shrink-0 items-center gap-2.5">
            <span className="fin-mark h-7 w-5" aria-hidden />
            <span className="text-[0.9375rem] font-semibold text-[#f4f5f6]">لوحة الإدارة</span>
          </Link>
          <nav aria-label="أقسام الإدارة" className="flex gap-4 overflow-x-auto">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 text-fine text-[#c9ccd2] transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link href="/dashboard" className="ms-auto shrink-0 text-fine text-[#8f949c] hover:text-white">
            لوحة الطالب
          </Link>
        </div>
      </header>
      <main id="main">{children}</main>
    </div>
  );
}
