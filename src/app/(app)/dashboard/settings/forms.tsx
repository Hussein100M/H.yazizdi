"use client";

import { useActionState } from "react";
import { changePasswordAction, updateProfileAction, type ActionState } from "@/app/actions/auth";
import { Field } from "@/components/auth/field";
import { SubmitButton } from "@/components/auth/submit";
import { FormError, FormSuccess } from "@/components/ui/states";

const initial: ActionState = {};

export function SettingsForms({ fullName, email }: { fullName: string; email: string }) {
  const [profileState, profileAction] = useActionState(updateProfileAction, initial);
  const [passwordState, passwordAction] = useActionState(changePasswordAction, initial);

  return (
    <div className="mt-8 space-y-6">
      <section className="plate p-6">
        <h2 className="text-h3">الملف الشخصي</h2>
        <form action={profileAction} className="mt-5 space-y-4">
          <FormError message={profileState.error} />
          <FormSuccess message={profileState.success} />
          <Field id="fullName" label="الاسم الكامل" defaultValue={fullName} required />
          <div>
            <label className="block text-fine font-medium text-[var(--text-strong)]">
              البريد الإلكتروني
            </label>
            <p
              dir="ltr"
              className="mt-1.5 flex h-11 items-center rounded-[var(--radius-control)] border border-[var(--hairline)] bg-[var(--surface-2)] px-3 text-start text-[0.9375rem] text-[var(--text-muted)]"
            >
              {email}
            </p>
            <p className="mt-1.5 text-[0.75rem] text-[var(--text-muted)]">
              لتغيير البريد، تواصل مع الإدارة.
            </p>
          </div>
          <div className="pt-1">
            <SubmitButton pendingLabel="جارٍ الحفظ">احفظ التغييرات</SubmitButton>
          </div>
        </form>
      </section>

      <section className="plate p-6">
        <h2 className="text-h3">كلمة المرور</h2>
        <form action={passwordAction} className="mt-5 space-y-4">
          <FormError message={passwordState.error} />
          <FormSuccess message={passwordState.success} />
          <Field
            id="currentPassword"
            label="كلمة المرور الحالية"
            type="password"
            autoComplete="current-password"
            required
          />
          <Field
            id="password"
            label="كلمة المرور الجديدة"
            type="password"
            autoComplete="new-password"
            required
            hint="٨ أحرف فأكثر، تتضمن أرقاماً"
          />
          <Field
            id="confirmPassword"
            label="تأكيد كلمة المرور الجديدة"
            type="password"
            autoComplete="new-password"
            required
          />
          <div className="pt-1">
            <SubmitButton pendingLabel="جارٍ الحفظ">غيّر كلمة المرور</SubmitButton>
          </div>
        </form>
      </section>
    </div>
  );
}
