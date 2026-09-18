"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getPaymentProvider, PaymentNotConfiguredError } from "@/lib/payments";
import { site } from "@/config/site";

export type CheckoutState = {
  error?: string;
  instructions?: string[];
  reference?: string;
};

/**
 * إنشاء طلب اشتراك.
 * لا يمنح هذا الإجراء أي وصول: الوصول يُفتح فقط عند تأكيد الدفع
 * عبر إشعار المزوّد الموقَّع أو تأكيد إداري موثَّق.
 */
export async function startCheckoutAction(
  _previous: CheckoutState,
  _formData: FormData,
): Promise<CheckoutState> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  const host = headerList.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return { error: "طلب غير صالح" };
    } catch {
      return { error: "طلب غير صالح" };
    }
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  const course = await prisma.course.findFirst({ where: { isPublished: true } });
  if (!course) return { error: "لا توجد دورة متاحة للاشتراك حالياً." };

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    select: { status: true },
  });
  if (existing?.status === "ACTIVE") redirect("/dashboard");

  const provider = getPaymentProvider();

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      courseId: course.id,
      provider: provider.id,
      amount: course.priceAmount,
      currency: course.priceCurrency,
      status: "INITIATED",
    },
  });

  try {
    const result = await provider.createCheckout({
      paymentId: payment.id,
      amount: course.priceAmount,
      currency: course.priceCurrency,
      courseTitle: course.title,
      customer: { id: user.id, email: user.email, fullName: user.fullName },
      successUrl: `${site.url}/checkout/success`,
      cancelUrl: `${site.url}/checkout/failed`,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { providerRef: result.providerRef, status: "AWAITING_CONFIRMATION" },
    });

    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      create: { userId: user.id, courseId: course.id, status: "PENDING" },
      update: {},
    });

    if (result.mode === "redirect") redirect(result.url);

    return { instructions: result.instructions, reference: payment.id };
  } catch (error) {
    if (error instanceof PaymentNotConfiguredError) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", failureReason: "provider_not_configured" },
      });
      return {
        error:
          "بوابة الدفع غير مهيّأة بعد على هذا الموقع. تواصل مع الإدارة لإتمام الاشتراك.",
      };
    }
    throw error;
  }
}
