"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ActionState } from "@/app/actions/auth";
import { Field } from "@/components/auth/field";
import { SubmitButton } from "@/components/auth/submit";
import { FormError } from "@/components/ui/states";

const initial: ActionState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, initial);

  return (
    <form action={action} className="mt-6 space-y-4" noValidate>
      <input type="hidden" name="token" value={token} />
      <FormError message={state.error} />

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
        label="تأكيد كلمة المرور"
        type="password"
        autoComplete="new-password"
        required
      />
      <SubmitButton pendingLabel="جارٍ الحفظ">احفظ كلمة المرور</SubmitButton>
    </form>
  );
}
