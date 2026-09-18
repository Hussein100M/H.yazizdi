import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPaymentProvider, WebhookVerificationError } from "@/lib/payments";
import { activateEnrollmentForPayment, markPaymentFailed } from "@/lib/enrollment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * المسار الوحيد الذي يفتح وصولاً مدفوعاً آلياً.
 * يتحقق من التوقيع أولاً، ويسجّل كل حدث مرة واحدة فقط.
 */
export async function POST(request: Request) {
  const provider = getPaymentProvider();
  const rawBody = await request.text();

  let result;
  try {
    result = await provider.verifyWebhook(rawBody, request.headers);
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "توقيع غير صالح" }, { status: 400 });
    }
    return NextResponse.json({ error: "تعذّرت معالجة الإشعار" }, { status: 400 });
  }

  if (result.kind === "ignored") {
    return NextResponse.json({ received: true });
  }

  // منع المعالجة المكررة: قيد فريد على (provider, externalId)
  try {
    await prisma.webhookEvent.create({
      data: { provider: provider.id, externalId: result.externalId, payload: { raw: rawBody } },
    });
  } catch {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const payment = await prisma.payment.findFirst({
    where: { provider: provider.id, providerRef: result.providerRef },
    select: { id: true },
  });

  if (!payment) {
    return NextResponse.json({ error: "طلب الدفع غير معروف" }, { status: 404 });
  }

  if (result.kind === "paid") {
    await activateEnrollmentForPayment(payment.id);
  } else {
    await markPaymentFailed(payment.id, result.reason);
  }

  return NextResponse.json({ received: true });
}
