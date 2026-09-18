"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { activateEnrollmentForPayment, revokeEnrollment } from "@/lib/enrollment";

/**
 * تأكيد دفعة يدوياً. هذا المسار الوحيد — غير إشعار المزوّد الموقَّع —
 * الذي يفتح وصولاً مدفوعاً، ولا يُنفَّذ إلا بحساب إداري.
 */
export async function confirmPaymentAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const paymentId = String(formData.get("paymentId") ?? "");
  if (!paymentId) return;

  await activateEnrollmentForPayment(paymentId);

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "payment.confirm",
      target: paymentId,
    },
  });

  revalidatePath("/admin/payments");
  revalidatePath("/admin/students");
}

export async function revokeAccessAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const enrollmentId = String(formData.get("enrollmentId") ?? "");
  if (!enrollmentId) return;

  await revokeEnrollment(enrollmentId);

  await prisma.auditLog.create({
    data: { actorId: admin.id, action: "enrollment.revoke", target: enrollmentId },
  });

  revalidatePath("/admin/students");
}

export async function grantAccessAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  if (!userId || !courseId) return;

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId, status: "ACTIVE", activatedAt: new Date() },
    update: { status: "ACTIVE", activatedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: { actorId: admin.id, action: "enrollment.grant", target: `${userId}:${courseId}` },
  });

  revalidatePath("/admin/students");
}
