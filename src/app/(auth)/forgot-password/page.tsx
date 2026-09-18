import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./form";

export const metadata: Metadata = {
  title: "إعادة تعيين كلمة المرور",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-[1.625rem]">إعادة تعيين كلمة المرور</h1>
      <p className="mt-2 text-[var(--text-muted)]">
        أدخل بريدك، وسيصلك رابط لتعيين كلمة مرور جديدة.
      </p>

      <ForgotPasswordForm />

      <p className="mt-6 text-fine text-[var(--text-muted)]">
        <Link href="/login" className="link-underline text-[var(--text-strong)]">
          العودة إلى تسجيل الدخول
        </Link>
      </p>
    </>
  );
}
