import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { formatPrice } from "@/config/site";

export const metadata: Metadata = {
  title: "لوحة الإدارة",
  robots: { index: false, follow: false },
};

const arabic = (value: number) => value.toLocaleString("ar-EG");

export default async function AdminPage() {
  await requireAdmin();

  const [students, activeEnrollments, pendingPayments, paidTotal, lessons] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    prisma.payment.count({ where: { status: "AWAITING_CONFIRMATION" } }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.lesson.count(),
  ]);

  const stats = [
    { label: "طلاب مسجّلون", value: arabic(students), href: "/admin/students" },
    { label: "اشتراكات نشطة", value: arabic(activeEnrollments), href: "/admin/students" },
    { label: "طلبات بانتظار التأكيد", value: arabic(pendingPayments), href: "/admin/payments" },
    { label: "إجمالي المحصّل", value: formatPrice(paidTotal._sum.amount ?? 0), href: "/admin/payments" },
    { label: "دروس منشورة", value: arabic(lessons), href: "/admin/content" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-[1.75rem]">نظرة عامة</h1>

      <ul className="mt-8 grid gap-px border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <li key={stat.label} className="bg-[var(--surface)]">
            <Link href={stat.href} className="block p-5 transition-colors hover:bg-[var(--surface-2)]">
              <p className="text-fine text-[var(--text-muted)]">{stat.label}</p>
              <p className="mt-1.5 text-[1.5rem] font-semibold text-[var(--text-strong)]">
                {stat.value}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="plate mt-10 p-6">
        <h2 className="text-h3">إعدادات التشغيل</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-fine text-[var(--text-muted)]">مزوّد الدفع</dt>
            <dd className="mt-1 text-[var(--text-strong)]">
              {env().PAYMENT_PROVIDER === "manual"
                ? "تحويل يدوي — التفعيل بتأكيد إداري"
                : env().PAYMENT_PROVIDER}
            </dd>
          </div>
          <div>
            <dt className="text-fine text-[var(--text-muted)]">استضافة الفيديو</dt>
            <dd className="mt-1 text-[var(--text-strong)]">
              {env().VIDEO_PROVIDER ? env().VIDEO_PROVIDER : "غير مضبوطة — الدورة تعمل بلا فيديو"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
