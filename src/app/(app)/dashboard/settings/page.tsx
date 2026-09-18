import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { SettingsForms } from "./forms";

export const metadata: Metadata = {
  title: "الإعدادات",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="annot">Account</p>
      <h1 className="mt-2 text-[1.75rem]">إعدادات الحساب</h1>
      <SettingsForms fullName={user.fullName} email={user.email} />
    </div>
  );
}
