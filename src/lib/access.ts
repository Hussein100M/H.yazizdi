import "server-only";

import { prisma } from "@/lib/db";
import type { SessionUser } from "@/lib/auth";

/**
 * الحقيقة الوحيدة بشأن الوصول إلى محتوى مدفوع.
 * تُستدعى على السيرفر قبل قراءة أي كتلة محتوى — لا يُعتمد أبداً على فحص في المتصفح.
 */
export async function hasCourseAccess(
  userId: string | undefined,
  courseId: string,
): Promise<boolean> {
  if (!userId) return false;
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { status: true },
  });
  return enrollment?.status === "ACTIVE";
}

export async function canViewLesson(
  user: SessionUser | null,
  lesson: { isPreview: boolean; courseId: string },
): Promise<boolean> {
  if (lesson.isPreview) return true;
  if (user?.role === "ADMIN") return true;
  return hasCourseAccess(user?.id, lesson.courseId);
}

export type CourseAccess = {
  isEnrolled: boolean;
  isAdmin: boolean;
  /** true إذا كان بإمكانه فتح كل الدروس */
  canViewAll: boolean;
};

export async function getCourseAccess(
  user: SessionUser | null,
  courseId: string,
): Promise<CourseAccess> {
  const isAdmin = user?.role === "ADMIN";
  const isEnrolled = await hasCourseAccess(user?.id, courseId);
  return { isEnrolled, isAdmin, canViewAll: isEnrolled || isAdmin };
}
