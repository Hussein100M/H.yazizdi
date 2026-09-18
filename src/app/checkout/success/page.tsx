import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCourse } from "@/lib/course";
import { getCourseAccess } from "@/lib/access";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "تم استلام الدفع",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const course = await getCourse();
  const access = course ? await getCourseAccess(user, course.id) : null;

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <span className="fin-mark mx-auto mb-7 block h-8 w-16" aria-hidden />
        {access?.canViewAll ? (
          <>
            <h1 className="text-[1.625rem]">فُتح وصولك</h1>
            <p className="mt-3 text-[var(--text-muted)]">
              الوحدات السبع متاحة الآن. ابدأ من الدرس الأول أو تابع من حيث توقفت.
            </p>
            <ButtonLink href="/dashboard" size="lg" className="mt-7">
              ابدأ التعلّم
            </ButtonLink>
          </>
        ) : (
          <>
            <h1 className="text-[1.625rem]">طلبك قيد التأكيد</h1>
            <p className="mt-3 text-[var(--text-muted)]">
              عاد المتصفح من صفحة الدفع، ولم يصل تأكيد المزوّد بعد. يُفتح المحتوى فور وصوله —
              لا نعتمد على عودة المتصفح وحدها.
            </p>
            <ButtonLink href="/dashboard" size="lg" variant="outline" className="mt-7">
              اذهب إلى لوحتي
            </ButtonLink>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
