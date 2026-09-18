import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 text-center">
      <span className="fin-mark mx-auto mb-7 block h-8 w-16" aria-hidden />
      <h1 className="text-[1.75rem]">الصفحة غير موجودة</h1>
      <p className="mt-3 text-[var(--text-muted)]">
        الرابط الذي فتحته لا يشير إلى صفحة على هذا الموقع. تأكد من الرابط أو ابدأ من صفحة الدورة.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href="/">صفحة الدورة</ButtonLink>
        <Link href="/faq" className="link-underline self-center text-[var(--text-body)]">
          أسئلة شائعة
        </Link>
      </div>
    </main>
  );
}
