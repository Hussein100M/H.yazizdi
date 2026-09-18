import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./form";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;

  return (
    <>
      <h1 className="text-[1.625rem]">تسجيل الدخول</h1>
      <p className="mt-2 text-[var(--text-muted)]">أكمل من حيث توقفت.</p>

      {params.reset ? (
        <p
          role="status"
          className="mt-5 border-s-2 border-[var(--text-strong)] bg-[var(--surface-2)] px-3 py-2 text-fine"
        >
          غُيّرت كلمة المرور. سجّل الدخول بها الآن.
        </p>
      ) : null}

      <LoginForm next={params.next} />

      <p className="mt-6 text-fine text-[var(--text-muted)]">
        لا تملك حساباً؟{" "}
        <Link href="/register" className="link-underline text-[var(--text-strong)]">
          أنشئ حساباً
        </Link>
      </p>
    </>
  );
}
