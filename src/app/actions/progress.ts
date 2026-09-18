"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canViewLesson } from "@/lib/access";
import { progressSchema } from "@/lib/validation";

/**
 * تسجيل التقدّم. كل فحص هنا على السيرفر:
 * لا يستطيع أحد تعليم درس لا يملك الوصول إليه.
 */
export async function setLessonProgress(input: {
  lessonId: string;
  completed?: boolean;
  seconds?: number;
}): Promise<{ ok: boolean; error?: string }> {
  const parsed = progressSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "بيانات غير صالحة" };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "سجّل الدخول أولاً" };

  const lesson = await prisma.lesson.findUnique({
    where: { id: parsed.data.lessonId },
    select: { id: true, slug: true, isPreview: true, module: { select: { courseId: true, course: { select: { slug: true } } } } },
  });
  if (!lesson) return { ok: false, error: "الدرس غير موجود" };

  const allowed = await canViewLesson(user, {
    isPreview: lesson.isPreview,
    courseId: lesson.module.courseId,
  });
  if (!allowed) return { ok: false, error: "لا تملك وصولاً إلى هذا الدرس" };

  const completedAt =
    parsed.data.completed === undefined ? undefined : parsed.data.completed ? new Date() : null;

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
    create: {
      userId: user.id,
      lessonId: lesson.id,
      completedAt: completedAt ?? null,
      seconds: parsed.data.seconds ?? 0,
    },
    update: {
      ...(completedAt !== undefined ? { completedAt } : {}),
      ...(parsed.data.seconds !== undefined ? { seconds: parsed.data.seconds } : {}),
      lastSeenAt: new Date(),
    },
  });

  revalidatePath(`/learn/${lesson.module.course.slug}/${lesson.slug}`);
  revalidatePath("/dashboard");
  return { ok: true };
}
