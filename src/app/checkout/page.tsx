import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCourse } from "@/lib/course";
import { getCourseAccess } from "@/lib/access";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EmptyState } from "@/components/ui/states";
import { formatPrice, pricing } from "@/config/site";
import { CheckoutForm } from "./form";

export const metadata: Metadata = {
  title: "إتمام الاشتراك",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  const course = await getCourse();
  if (!course) {
    return (
      <>
        <SiteHeader />
        <main id="main" className="mx-auto max-w-2xl px-4 py-20">
          <EmptyState title="لا توجد دورة متاحة" description="لم تُنشر أي دورة للاشتراك بعد." />
        </main>
        <SiteFooter />
      </>
    );
  }

  const access = await getCourseAccess(user, course.id);
  if (access.canViewAll) redirect("/dashboard");

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <h1 className="text-[1.75rem]">إتمام الاشتراك</h1>

        <div className="mt-8 grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-start">
          <div className="plate p-6">
            <h2 className="text-h3">{course.title}</h2>
            <p className="mt-2 text-fine text-[var(--text-muted)]">
              {course.modules.length.toLocaleString("ar-EG")} وحدات ·{" "}
              {course.lessonCount.toLocaleString("ar-EG")} درساً
            </p>
            <ul className="mt-5 space-y-2.5">
              {pricing.includes.map((item) => (
                <li key={item} className="flex gap-3 text-fine">
                  <span aria-hidden className="mt-2 block h-1.5 w-1.5 shrink-0 bg-crimson" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="plate bg-[var(--surface-2)] p-6">
            <p className="text-fine text-[var(--text-muted)]">الإجمالي</p>
            <p className="mt-1 text-[1.875rem] font-semibold text-[var(--text-strong)]">
              {formatPrice(course.priceAmount)}
            </p>
            <CheckoutForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
