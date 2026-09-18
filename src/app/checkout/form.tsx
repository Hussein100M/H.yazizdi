"use client";

import { useActionState } from "react";
import { startCheckoutAction, type CheckoutState } from "@/app/actions/checkout";
import { SubmitButton } from "@/components/auth/submit";
import { FormError } from "@/components/ui/states";

const initial: CheckoutState = {};

export function CheckoutForm() {
  const [state, action] = useActionState(startCheckoutAction, initial);

  if (state.instructions) {
    return (
      <div className="mt-5">
        <p className="font-semibold text-[var(--text-strong)]">سُجّل طلبك</p>
        <ol className="mt-3 space-y-2">
          {state.instructions.map((line, index) => (
            <li key={line} className="flex gap-2.5 text-fine">
              <span className="font-[family-name:var(--font-annot)] text-crimson">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
        {state.reference ? (
          <p className="mt-4 border border-[var(--hairline)] bg-[var(--surface)] px-3 py-2 text-fine">
            رقم الطلب: <span className="annot font-semibold">{state.reference}</span>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form action={action} className="mt-5 space-y-3">
      <FormError message={state.error} />
      <SubmitButton pendingLabel="جارٍ إنشاء الطلب">تابع إلى الدفع</SubmitButton>
      <p className="text-[0.75rem] leading-relaxed text-[var(--text-muted)]">
        لا يُفتح المحتوى قبل تأكيد الدفع.
      </p>
    </form>
  );
}
