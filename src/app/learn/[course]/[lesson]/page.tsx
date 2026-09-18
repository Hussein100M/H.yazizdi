import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { canViewLesson, getCourseAccess } from "@/lib/access";
import {
  findLessonNeighbours,
  getCourse,
  getLesson,
  getLessonBlocks,
} from "@/lib/course";
import { getCourseProgress } from "@/lib/progress";
import { createPlaybackSource } from "@/lib/video";
import { prisma } from "@/lib/db";
import { LessonBlocks } from "@/components/course/blocks";
import { LessonSidebar } from "@/components/course/lesson-sidebar";
import { PlayerNav } from "@/components/course/player-nav";
import { VideoFrame } from "@/components/course/video-frame";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/config/site";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const arabic = (value: number) => value.toLocaleString("ar-EG");

export default async function LessonPage({
  params,
}: {
  params: Promise<{ course: string; lesson: string }>;
}) {
  const { course: courseSlug, lesson: lessonSlug } = await params;

  const [lesson, course, user] = await Promise.all([
    getLesson(courseSlug, lessonSlug),
    getCourse(courseSlug),
    getCurrentUser(),
  ]);

  if (!lesson || !course) notFound();

  // ── بوابة الوصول: تُقيَّم على السيرفر قبل قراءة أي كتلة محتوى ──
  const allowed = await canViewLesson(user, {
    isPreview: lesson.isPreview,
    courseId: lesson.courseId,
  });

  if (!allowed) {
    const access = await getCourseAccess(user, lesson.courseId);
    return (
      <div data-surface="ink" className="min-h-dvh bg-ink">
        <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
          <span className="fin-mark mx-auto mb-8 block h-8 w-16" aria-hidden />
          <h1 className="text-[1.625rem] text-[#f4f5f6]">هذا الدرس ضمن الاشتراك</h1>
          <p className="mt-3 text-[#c9ccd2]">
            {user
              ? access.isEnrolled
                ? "تعذّر التحقق من وصولك. حدّث الصفحة أو تواصل مع الإدارة."
                : "اشترك لفتح الوحدات السبع كاملة، أو تابع دروس المعاينة المتاحة."
              : "سجّل الدخول للوصول إلى دروس الدورة."}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <ButtonLink href={user ? "/checkout" : `/login?next=/learn/${courseSlug}/${lessonSlug}`}>
              {user ? "اشترك الآن" : "تسجيل الدخول"}
            </ButtonLink>
            <ButtonLink href="/" variant="outline">
              صفحة الدورة
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const [blocks, progress] = await Promise.all([
    getLessonBlocks(lesson.id),
    user ? getCourseProgress(user.id, lesson.courseId) : null,
  ]);

  const { previous, next, index, total } = findLessonNeighbours(course, lesson.id);
  const playback = lesson.videoAssetId ? await createPlaybackSource(lesson.videoAssetId) : null;

  const completed = user
    ? Boolean(
        await prisma.lessonProgress.findUnique({
          where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
          select: { completedAt: true },
        }).then((row) => row?.completedAt),
      )
    : false;

  // تسجيل آخر زيارة يحدث عند التعليم أو الانتقال، لا عند كل عرض صفحة

  return (
    <div data-surface="ink" className="min-h-dvh bg-ink text-[var(--text-body)]">
      <div className="mx-auto flex max-w-[92rem]">
        {progress ? (
          <LessonSidebar
            modules={course.modules}
            courseSlug={course.slug}
            currentLessonId={lesson.id}
            completedLessonIds={[...progress.completedLessonIds]}
            percent={progress.percent}
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <header className="border-b border-[var(--hairline)]">
            <div className="flex flex-wrap items-center gap-4 px-4 py-4 sm:px-8">
              <Link
                href={user ? "/dashboard" : "/"}
                className="text-fine text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)]"
              >
                {user ? "لوحتي" : site.name}
              </Link>
              <span className="text-fine text-[var(--text-muted)]" aria-hidden>
                /
              </span>
              <p className="text-fine text-[var(--text-muted)]">{lesson.moduleTitle}</p>
              {index >= 0 ? (
                <p className="ms-auto text-fine text-[var(--text-muted)]">
                  الدرس {arabic(index + 1)} من {arabic(total)}
                </p>
              ) : null}
            </div>
          </header>

          <article className="px-4 py-10 sm:px-8 lg:py-14">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="font-[family-name:var(--font-annot)] text-fine text-crimson">
                  {lesson.moduleBadge}
                </span>
                {lesson.titleEn ? <span className="annot">{lesson.titleEn}</span> : null}
                {lesson.isPreview ? (
                  <span className="border border-[var(--hairline)] px-2 py-0.5 text-[0.6875rem] text-[var(--text-muted)]">
                    معاينة مجانية
                  </span>
                ) : null}
              </div>

              <h1 className="mt-3 text-[1.75rem] leading-[1.35] sm:text-[2.125rem]">
                {lesson.title}
              </h1>
              <p className="mt-4 max-w-[68ch] text-[var(--text-lead)] leading-[1.85] text-[var(--text-body)]">
                {lesson.summary}
              </p>

              <p className="mt-4 text-fine text-[var(--text-muted)]">
                زمن قراءة تقديري: {arabic(lesson.minutes)} دقائق
              </p>

              {playback ? (
                <div className="mt-10">
                  <VideoFrame source={playback} poster={course.heroImage} />
                </div>
              ) : null}

              <div className="mt-10">
                <LessonBlocks blocks={blocks} lessonId={lesson.id} />
              </div>

              <div className="mt-12">
                {user ? (
                  <PlayerNav
                    lessonId={lesson.id}
                    courseSlug={course.slug}
                    previous={previous ? { slug: previous.slug, title: previous.title } : null}
                    next={next ? { slug: next.slug, title: next.title } : null}
                    initiallyCompleted={completed}
                  />
                ) : (
                  <div className="border-t border-[var(--hairline)] pt-6">
                    <p className="text-[var(--text-muted)]">
                      سجّل الدخول لحفظ تقدّمك ومتابعة بقية الدروس.
                    </p>
                    <ButtonLink href="/register" className="mt-4">
                      أنشئ حساباً
                    </ButtonLink>
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
