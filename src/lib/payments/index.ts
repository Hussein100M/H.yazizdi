import "server-only";

import { env } from "@/lib/env";
import { manualProvider } from "./manual";
import { createGatewayProvider } from "./gateway-template";
import type { PaymentProvider } from "./types";

export * from "./types";

function build(id: string): PaymentProvider {
  const { PAYMENT_API_KEY, PAYMENT_WEBHOOK_SECRET } = env();
  switch (id) {
    case "manual":
      return manualProvider;
    case "stripe":
      return createGatewayProvider({
        id: "stripe",
        label: "Stripe",
        apiKey: PAYMENT_API_KEY,
        webhookSecret: PAYMENT_WEBHOOK_SECRET,
      });
    case "moyasar":
      return createGatewayProvider({
        id: "moyasar",
        label: "ميسر",
        apiKey: PAYMENT_API_KEY,
        webhookSecret: PAYMENT_WEBHOOK_SECRET,
      });
    case "tap":
      return createGatewayProvider({
        id: "tap",
        label: "Tap Payments",
        apiKey: PAYMENT_API_KEY,
        webhookSecret: PAYMENT_WEBHOOK_SECRET,
      });
    default:
      return manualProvider;
  }
}

export function getPaymentProvider(): PaymentProvider {
  return build(env().PAYMENT_PROVIDER);
}
