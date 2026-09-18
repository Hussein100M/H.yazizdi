import type {
  CheckoutParams,
  CheckoutResult,
  PaymentProvider,
  WebhookResult,
} from "./types";
import { PaymentNotConfiguredError, WebhookVerificationError } from "./types";

/**
 * قالب بوابة دفع حقيقية (Stripe / Moyasar / Tap).
 *
 * لإكمال الربط، وهو كل المطلوب — لا تعديل في أي ملف آخر:
 *   ١. املأ PAYMENT_API_KEY و PAYMENT_WEBHOOK_SECRET في البيئة.
 *   ٢. أكمل createCheckout: نداء إنشاء جلسة الدفع لدى المزوّد.
 *   ٣. أكمل verifyWebhook: تحقق التوقيع ثم ترجمة حالة العملية.
 *   ٤. سجّل المزوّد في index.ts واضبط PAYMENT_PROVIDER.
 *
 * ملاحظة أمنية: التفعيل يعتمد على الإشعار الموقَّع فقط، لا على عودة المتصفح.
 */
export function createGatewayProvider(config: {
  id: string;
  label: string;
  apiKey?: string;
  webhookSecret?: string;
}): PaymentProvider {
  const isConfigured = () => Boolean(config.apiKey && config.webhookSecret);

  return {
    id: config.id,
    label: config.label,
    isConfigured,

    async createCheckout(_params: CheckoutParams): Promise<CheckoutResult> {
      if (!isConfigured()) throw new PaymentNotConfiguredError(config.id);
      // TODO(ربط المزوّد): أنشئ جلسة الدفع وأعد رابط التحويل.
      throw new PaymentNotConfiguredError(config.id);
    },

    async verifyWebhook(_rawBody: string, _headers: Headers): Promise<WebhookResult> {
      if (!isConfigured()) throw new PaymentNotConfiguredError(config.id);
      // TODO(ربط المزوّد): تحقق من التوقيع قبل قراءة الحمولة.
      throw new WebhookVerificationError();
    },
  };
}
