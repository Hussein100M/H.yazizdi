"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function MobileNav({
  links,
  isSignedIn,
}: {
  links: { href: string; label: string }[];
  isSignedIn: boolean;
}) {
  const pathname = usePathname();
  // القائمة مفتوحة فقط على الصفحة التي فُتحت فيها، فتُغلق تلقائياً عند التنقل
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenedAt(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpenedAt(open ? null : pathname)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex h-10 w-10 items-center justify-center border border-[var(--hairline)] rounded-[var(--radius-control)]"
      >
        <span className="sr-only">{open ? "إغلاق القائمة" : "فتح القائمة"}</span>
        <span aria-hidden className="flex flex-col gap-[5px]">
          <span
            className={`block h-px w-5 bg-[var(--text-strong)] transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`}
          />
          <span className={`block h-px w-5 bg-[var(--text-strong)] ${open ? "opacity-0" : ""}`} />
          <span
            className={`block h-px w-5 bg-[var(--text-strong)] transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
          />
        </span>
      </button>

      {open ? (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-16 border-b border-[var(--hairline)] bg-[var(--surface)] px-4 pb-6 pt-2 shadow-sm"
        >
          <nav aria-label="روابط الموقع" className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-b border-[var(--hairline)] py-3.5 text-[var(--text-body)]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={isSignedIn ? "/dashboard" : "/login"}
              className="border-b border-[var(--hairline)] py-3.5 text-[var(--text-body)]"
            >
              {isSignedIn ? "لوحتي" : "تسجيل الدخول"}
            </Link>
            <Link
              href={isSignedIn ? "/dashboard" : "/register"}
              className="mt-4 flex h-11 items-center justify-center bg-crimson text-white rounded-[var(--radius-control)]"
            >
              {isSignedIn ? "أكمل التعلّم" : "ابدأ الدورة"}
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
