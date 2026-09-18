"use client";

import { useActionState } from "react";
import { registerAction, type ActionState } from "@/app/actions/auth";
import { Field } from "@/components/auth/field";
import { SubmitButton } from "@/components/auth/submit";
import { FormError } from "@/components/ui/states";

const initial: ActionState = {};

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, initial);

  return (
    <form action={action} className="mt-6 space-y-4" noValidate>
      <FormError message={state.error} />

      <Field id="fullName" label="الاسم الكامل" autoComplete="name" required />
      <Field
        id="email"
        label="البريد الإلكتروني"
        type="email"
        autoComplete="email"
        required
        dir="ltr"
        className="text-start"
      />
      <Field
        id="password"
        label="كلمة المرور"
        type="password"
        autoComplete="new-password"
        required
        hint="٨ أحرف فأكثر، تتضمن أرقاماً"
      />
      <Field
        id="confirmPassword"
        label="تأكيد كلمة المرور"
        type="password"
        autoComplete="new-password"
        required
      />

      <SubmitButton pendingLabel="جارٍ الإنشاء">أنشئ الحساب</SubmitButton>
    </form>
  );
}
