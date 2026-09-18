import "server-only";

import { prisma } from "@/lib/db";

export type ModuleProgress = {
  moduleId: string;
  completed: number;
  total: number;
  percent: number;
};

export type CourseProgress = {
  completedLessonIds: Set<string>;
  completed: number;
  total: number;
  percent: number;
  modules: Map<string, ModuleProgress>;
  lastLessonId: string | null;
};

export const emptyProgress = (total = 0): CourseProgress => ({
  completedLessonIds: new Set(),
  completed: 0,
  total,
  percent: 0,
  modules: new Map(),
  lastLessonId: null,
});

/** تجميعة واحدة لكل ما تحتاجه الواجهة عن تقدّم الطالب في دورة. */
export async function getCourseProgress(
  userId: string,
  courseId: string,
): Promise<CourseProgress> {
  const [lessons, progressRows] = await Promise.all([
    prisma.lesson.findMany({
      where: { module: { courseId } },
      select: { id: true, moduleId: true },
    }),
    prisma.lessonProgress.findMany({
      where: { userId, lesson: { module: { courseId } } },
      select: { lessonId: true, completedAt: true, lastSeenAt: true },
      orderBy: { lastSeenAt: "desc" },
    }),
  ]);

  const completedLessonIds = new Set(
    progressRows.filter((row) => row.completedAt !== null).map((row) => row.lessonId),
  );

  const modules = new Map<string, ModuleProgress>();
  for (const lesson of lessons) {
    const current = modules.get(lesson.moduleId) ?? {
      moduleId: lesson.moduleId,
      completed: 0,
      total: 0,
      percent: 0,
    };
    current.total += 1;
    if (completedLessonIds.has(lesson.id)) current.completed += 1;
    modules.set(lesson.moduleId, current);
  }
  for (const entry of modules.values()) {
    entry.percent = entry.total === 0 ? 0 : Math.round((entry.completed / entry.total) * 100);
  }

  const total = lessons.length;
  const completed = completedLessonIds.size;

  return {
    completedLessonIds,
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    modules,
    lastLessonId: progressRows[0]?.lessonId ?? null,
  };
}

export function isCourseComplete(progress: CourseProgress): boolean {
  return progress.total > 0 && progress.completed >= progress.total;
}
