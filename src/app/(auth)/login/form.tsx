"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type ActionState } from "@/app/actions/auth";
import { Field } from "@/components/auth/field";
import { SubmitButton } from "@/components/auth/submit";
import { FormError } from "@/components/ui/states";

const initial: ActionState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, initial);

  return (
    <form action={action} className="mt-6 space-y-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <FormError message={state.error} />

      <Field
        id="email"
        label="البريد الإلكتروني"
        type="email"
        autoComplete="email"
        required
        dir="ltr"
        className="text-start"
      />
      <Field id="password" label="كلمة المرور" type="password" autoComplete="current-password" required />

      <div className="flex justify-start">
        <Link href="/forgot-password" className="link-underline text-fine text-[var(--text-muted)]">
          نسيت كلمة المرور؟
        </Link>
      </div>

      <SubmitButton pendingLabel="جارٍ الدخول">ادخل</SubmitButton>
    </form>
  );
}
