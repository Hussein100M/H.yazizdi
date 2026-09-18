/**
 * طبقة الدفع المجرّدة.
 * تغيير المزوّد = كتابة ملف واحد يحقق هذه الواجهة وتسجيله في index.ts.
 * لا شيء خارج هذا المجلد يعرف اسم المزوّد.
 */

export type CheckoutParams = {
  paymentId: string;
  amount: number; // بالوحدة الصغرى (هللة/سنت)
  currency: string;
  courseTitle: string;
  customer: { id: string; email: string; fullName: string };
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutResult =
  | { mode: "redirect"; url: string; providerRef: string }
  | { mode: "instructions"; providerRef: string; instructions: string[] };

export type WebhookResult =
  | { kind: "ignored" }
  | { kind: "paid"; providerRef: string; externalId: string }
  | { kind: "failed"; providerRef: string; externalId: string; reason: string };

export interface PaymentProvider {
  readonly id: string;
  readonly label: string;
  /** هل المفاتيح المطلوبة موجودة؟ */
  isConfigured(): boolean;
  createCheckout(params: CheckoutParams): Promise<CheckoutResult>;
  /** يتحقق من التوقيع ثم يترجم الحمولة. يرمي عند فشل التحقق. */
  verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookResult>;
}

export class PaymentNotConfiguredError extends Error {
  constructor(providerId: string) {
    super(`مزوّد الدفع «${providerId}» غير مهيّأ: أضف مفاتيحه في متغيّرات البيئة.`);
    this.name = "PaymentNotConfiguredError";
  }
}

export class WebhookVerificationError extends Error {
  constructor(message = "تعذّر التحقق من توقيع الإشعار") {
    super(message);
    this.name = "WebhookVerificationError";
  }
}
