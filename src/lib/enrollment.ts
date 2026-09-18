import "server-only";

import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

/**
 * تفعيل الوصول بعد تأكيد الدفع. آمن للتكرار: استدعاؤه مرتين لا يُنشئ تسجيلين.
 * يُستدعى من مسارين فقط: إشعار المزوّد الموقَّع، أو تأكيد إداري موثَّق.
 */
export async function activateEnrollmentForPayment(paymentId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new Error("طلب الدفع غير موجود");
    if (payment.status === "PAID") return; // سبق تفعيله

    const enrollment = await tx.enrollment.upsert({
      where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
      create: {
        userId: payment.userId,
        courseId: payment.courseId,
        status: "ACTIVE",
        activatedAt: new Date(),
      },
      update: { status: "ACTIVE", activatedAt: new Date() },
    });

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", enrollmentId: enrollment.id },
    });
  });
}

export async function markPaymentFailed(paymentId: string, reason: string): Promise<void> {
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "FAILED", failureReason: reason.slice(0, 500) },
  });
}

export async function revokeEnrollment(enrollmentId: string): Promise<void> {
  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { status: "REVOKED" },
  });
}

/** رقم شهادة عام قابل للتحقق — لا يكشف أي معرّف داخلي. */
export function generateCertificateSerial(): string {
  const year = new Date().getFullYear();
  const random = randomBytes(4).toString("hex").toUpperCase();
  return `AV-${year}-${random}`;
}
