"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type ActionState } from "@/app/actions/auth";
import { Field } from "@/components/auth/field";
import { SubmitButton } from "@/components/auth/submit";
import { FormError, FormSuccess } from "@/components/ui/states";

const initial: ActionState = {};

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPasswordAction, initial);

  return (
    <form action={action} className="mt-6 space-y-4" noValidate>
      <FormError message={state.error} />
      <FormSuccess message={state.success} />

      {state.devResetUrl ? (
        <p className="border border-[var(--hairline)] bg-[var(--surface-2)] px-3 py-2 text-[0.75rem] break-all">
          <span className="block font-semibold text-[var(--text-strong)]">
            رابط التطوير (لا يظهر في الإنتاج):
          </span>
          <a href={state.devResetUrl} className="link-underline" dir="ltr">
            {state.devResetUrl}
          </a>
        </p>
      ) : null}

      <Field
        id="email"
        label="البريد الإلكتروني"
        type="email"
        autoComplete="email"
        required
        dir="ltr"
        className="text-start"
      />
      <SubmitButton pendingLabel="جارٍ الإرسال">أرسل الرابط</SubmitButton>
    </form>
  );
}
