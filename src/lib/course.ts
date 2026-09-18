import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/db";
import { courseSeed } from "@/content/course";
import { isBlock, type Block } from "@/lib/blocks";

export const COURSE_SLUG = courseSeed.slug;

export type CurriculumLesson = {
  id: string;
  slug: string;
  title: string;
  titleEn: string | null;
  summary: string;
  kind: string;
  minutes: number;
  isPreview: boolean;
  hasVideo: boolean;
};

export type CurriculumModule = {
  id: string;
  slug: string;
  badge: string;
  title: string;
  titleEn: string;
  summary: string;
  lessons: CurriculumLesson[];
};

export type CourseDetail = {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  tagline: string;
  summary: string;
  heroImage: string;
  priceAmount: number;
  priceCurrency: string;
  instructor: string;
  instructorBio: string;
  modules: CurriculumModule[];
  lessonCount: number;
  totalMinutes: number;
};

/** الدورة كاملة بمنهجها — بلا أي كتلة محتوى، فهي آمنة للصفحات العامة. */
export const getCourse = cache(async (slug: string = COURSE_SLUG): Promise<CourseDetail | null> => {
  const course = await prisma.course.findFirst({
    where: { slug, isPublished: true },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              titleEn: true,
              summary: true,
              kind: true,
              minutes: true,
              isPreview: true,
              videoAssetId: true,
            },
          },
        },
      },
    },
  });

  if (!course) return null;

  const modules: CurriculumModule[] = course.modules.map((module) => ({
    id: module.id,
    slug: module.slug,
    badge: module.badge,
    title: module.title,
    titleEn: module.titleEn,
    summary: module.summary,
    lessons: module.lessons.map((lesson) => ({
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      titleEn: lesson.titleEn,
      summary: lesson.summary,
      kind: lesson.kind,
      minutes: lesson.minutes,
      isPreview: lesson.isPreview,
      hasVideo: Boolean(lesson.videoAssetId),
    })),
  }));

  const lessons = modules.flatMap((module) => module.lessons);

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    titleEn: course.titleEn,
    tagline: course.tagline,
    summary: course.summary,
    heroImage: course.heroImage,
    priceAmount: course.priceAmount,
    priceCurrency: course.priceCurrency,
    instructor: course.instructor,
    instructorBio: course.instructorBio,
    modules,
    lessonCount: lessons.length,
    totalMinutes: lessons.reduce((total, lesson) => total + lesson.minutes, 0),
  };
});

export type LessonDetail = {
  id: string;
  slug: string;
  title: string;
  titleEn: string | null;
  summary: string;
  minutes: number;
  isPreview: boolean;
  videoAssetId: string | null;
  moduleId: string;
  moduleSlug: string;
  moduleBadge: string;
  moduleTitle: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
};

export const getLesson = cache(
  async (courseSlug: string, lessonSlug: string): Promise<LessonDetail | null> => {
    const lesson = await prisma.lesson.findFirst({
      where: { slug: lessonSlug, module: { course: { slug: courseSlug } } },
      include: { module: { include: { course: true } } },
    });

    if (!lesson) return null;

    return {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      titleEn: lesson.titleEn,
      summary: lesson.summary,
      minutes: lesson.minutes,
      isPreview: lesson.isPreview,
      videoAssetId: lesson.videoAssetId,
      moduleId: lesson.moduleId,
      moduleSlug: lesson.module.slug,
      moduleBadge: lesson.module.badge,
      moduleTitle: lesson.module.title,
      courseId: lesson.module.courseId,
      courseSlug: lesson.module.course.slug,
      courseTitle: lesson.module.course.title,
    };
  },
);

/**
 * كتل الدرس. تُستدعى فقط بعد تأكيد الوصول على السيرفر.
 * لا تُستدعى من أي صفحة عامة.
 */
export async function getLessonBlocks(lessonId: string): Promise<Block[]> {
  const rows = await prisma.lessonBlock.findMany({
    where: { lessonId },
    orderBy: { order: "asc" },
    select: { data: true },
  });
  return rows.map((row) => row.data).filter(isBlock);
}

/** ترتيب مسطّح للدروس — للتنقل بين السابق والتالي. */
export function flattenLessons(course: CourseDetail) {
  return course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({ ...lesson, module })),
  );
}

export function findLessonNeighbours(course: CourseDetail, lessonId: string) {
  const flat = flattenLessons(course);
  const index = flat.findIndex((lesson) => lesson.id === lessonId);
  if (index === -1) return { previous: null, next: null, index: -1, total: flat.length };
  return {
    previous: index > 0 ? flat[index - 1]! : null,
    next: index < flat.length - 1 ? flat[index + 1]! : null,
    index,
    total: flat.length,
  };
}

/** صيغ البرومبت — قيمة حقيقية من المنهج تُعرض في الصفحة العامة. */
export const getPromptFormulas = cache(async () => {
  const blocks = await prisma.lessonBlock.findMany({
    where: { kind: "PROMPT" },
    orderBy: [{ lesson: { module: { order: "asc" } } }, { order: "asc" }],
    select: {
      data: true,
      lesson: { select: { module: { select: { badge: true, title: true } } } },
    },
  });

  return blocks.flatMap((row) => {
    const block = row.data;
    if (!isBlock(block) || block.kind !== "PROMPT") return [];
    return [
      {
        badge: row.lesson.module.badge,
        moduleTitle: row.lesson.module.title,
        text: block.text,
      },
    ];
  });
});
