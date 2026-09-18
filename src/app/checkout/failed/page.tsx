import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "لم تكتمل عملية الدفع",
  robots: { index: false, follow: false },
};

export default function CheckoutFailedPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <h1 className="text-[1.625rem]">لم تكتمل عملية الدفع</h1>
        <p className="mt-3 text-[var(--text-muted)]">
          لم يُخصم أي مبلغ ولم يتغيّر وصولك. يمكنك المحاولة مرة أخرى، أو التواصل مع الإدارة إن
          تكرّر الأمر.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <ButtonLink href="/checkout">أعد المحاولة</ButtonLink>
          <ButtonLink href="/dashboard" variant="outline">
            لوحتي
          </ButtonLink>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
