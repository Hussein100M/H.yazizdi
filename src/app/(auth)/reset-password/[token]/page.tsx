import type { Metadata } from "next";
import { ResetPasswordForm } from "./form";

export const metadata: Metadata = {
  title: "كلمة مرور جديدة",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <>
      <h1 className="text-[1.625rem]">كلمة مرور جديدة</h1>
      <p className="mt-2 text-[var(--text-muted)]">
        بعد الحفظ ستُغلق كل الجلسات المفتوحة على حسابك.
      </p>
      <ResetPasswordForm token={token} />
    </>
  );
}
