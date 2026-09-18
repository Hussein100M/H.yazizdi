import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RegisterForm } from "./form";

export const metadata: Metadata = {
  title: "حساب جديد",
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <>
      <h1 className="text-[1.625rem]">أنشئ حسابك</h1>
      <p className="mt-2 text-[var(--text-muted)]">
        درسان من وحدة المدخل مفتوحان فور إنشاء الحساب.
      </p>

      <RegisterForm />

      <p className="mt-6 text-fine text-[var(--text-muted)]">
        لديك حساب؟{" "}
        <Link href="/login" className="link-underline text-[var(--text-strong)]">
          سجّل الدخول
        </Link>
      </p>
    </>
  );
}
