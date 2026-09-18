import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "التحقق من شهادة",
  description: "تحقّق من صحة شهادة إتمام صادرة عن المنصة برقم التحقق المطبوع عليها.",
};

async function verify(formData: FormData) {
  "use server";
  const serial = String(formData.get("serial") ?? "").trim();
  if (!serial) return;
  redirect(`/certificate/${encodeURIComponent(serial.toUpperCase())}`);
}

export default function CertificateLookupPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-lg px-4 py-20 sm:px-6">
        <p className="annot">Verification</p>
        <h1 className="mt-2 text-[1.75rem]">التحقق من شهادة</h1>
        <p className="mt-3 text-[var(--text-muted)]">
          أدخل رقم التحقق المطبوع على الشهادة للتأكد من صحتها.
        </p>

        <form action={verify} className="mt-8 space-y-4">
          <div>
            <label htmlFor="serial" className="block text-fine font-medium text-[var(--text-strong)]">
              رقم التحقق
            </label>
            <input
              id="serial"
              name="serial"
              required
              dir="ltr"
              placeholder="AV-2026-XXXXXXXX"
              className="mt-1.5 h-11 w-full rounded-[var(--radius-control)] border border-[var(--hairline)] px-3 text-start font-[family-name:var(--font-annot)] focus:border-crimson"
            />
          </div>
          <Button type="submit" size="lg" className="w-full">
            تحقّق
          </Button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
