import type { CheckoutParams, CheckoutResult, PaymentProvider, WebhookResult } from "./types";

/**
 * مزوّد «التحويل اليدوي»: الوضع الافتراضي قبل ربط بوابة دفع.
 *
 * ما يفعله: ينشئ طلب شراء حقيقياً بحالة «بانتظار التأكيد».
 * ما لا يفعله — ولن يفعله أبداً: تأكيد دفعة من تلقاء نفسه.
 * التفعيل يتم يدوياً من لوحة الإدارة بعد تحقق بشري من وصول المبلغ.
 */
export const manualProvider: PaymentProvider = {
  id: "manual",
  label: "تحويل يدوي بتأكيد الإدارة",

  isConfigured() {
    return true;
  },

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    return {
      mode: "instructions",
      providerRef: params.paymentId,
      instructions: [
        "سُجّل طلبك بنجاح، ورقمه يظهر أسفل هذه الرسالة.",
        "أرسل رقم الطلب مع إشعار التحويل إلى إدارة المنصة.",
        "يُفعَّل وصولك إلى الدورة فور تأكيد استلام المبلغ.",
      ],
    };
  },

  async verifyWebhook(): Promise<WebhookResult> {
    // لا إشعارات آلية في الوضع اليدوي — التفعيل من لوحة الإدارة فقط.
    return { kind: "ignored" };
  },
};
