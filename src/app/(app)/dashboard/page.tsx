import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCourse, flattenLessons } from "@/lib/course";
import { getCourseAccess } from "@/lib/access";
import { getCourseProgress, isCourseComplete } from "@/lib/progress";
import { prisma } from "@/lib/db";
import { Curriculum } from "@/components/course/curriculum";
import { ProgressBar } from "@/components/ui/progress";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { formatPrice } from "@/config/site";

export const metadata: Metadata = {
  title: "لوحة الطالب",
  robots: { index: false, follow: false },
};

const arabic = (value: number) => value.toLocaleString("ar-EG");

export default async function DashboardPage() {
  const user = await requireUser();
  const course = await getCourse();

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          title="لا توجد دورة منشورة"
          description="لم تُنشر أي دورة بعد. ستظهر هنا فور نشرها."
        />
      </div>
    );
  }

  const access = await getCourseAccess(user, course.id);

  if (!access.canViewAll) {
    const pending = await prisma.payment.findFirst({
      where: { userId: user.id, courseId: course.id, status: "AWAITING_CONFIRMATION" },
      orderBy: { createdAt: "desc" },
    });

    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <h1 className="text-[1.75rem]">أهلاً {user.fullName}</h1>

        {pending ? (
          <div className="plate mt-8 p-6">
            <h2 className="text-h3">طلبك قيد التأكيد</h2>
            <p className="mt-2 text-[var(--text-body)]">
              سُجّل طلب اشتراكك ورقمه{" "}
              <span className="annot mx-1 font-semibold">{pending.id}</span>. يُفتح المحتوى فور
              تأكيد استلام المبلغ.
            </p>
            <p className="mt-4 text-fine text-[var(--text-muted)]">
              المبلغ: {formatPrice(pending.amount)}
            </p>
          </div>
        ) : (
          <div className="plate mt-8 p-6">
            <h2 className="text-h3">لم تشترك بعد</h2>
            <p className="mt-2 max-w-[56ch] text-[var(--text-body)]">
              وصولك الحالي يشمل دروس المعاينة فقط. اشترك لفتح الوحدات السبع كاملة.
            </p>
            <ButtonLink href="/checkout" className="mt-5">
              اشترك الآن
            </ButtonLink>
          </div>
        )}

        <section className="mt-12">
          <h2 className="text-h3">دروس المعاينة المفتوحة</h2>
          <ul className="mt-4 space-y-2">
            {flattenLessons(course)
              .filter((lesson) => lesson.isPreview)
              .map((lesson) => (
                <li key={lesson.id} className="plate">
                  <Link
                    href={`/learn/${course.slug}/${lesson.slug}`}
                    className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <span>
                      <span className="block text-[0.9375rem] font-medium text-[var(--text-strong)]">
                        {lesson.title}
                      </span>
                      <span className="mt-0.5 block text-fine text-[var(--text-muted)]">
                        {lesson.module.title}
                      </span>
                    </span>
                    <span className="shrink-0 text-fine text-[var(--text-muted)]">
                      {arabic(lesson.minutes)} د
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </div>
    );
  }

  const progress = await getCourseProgress(user.id, course.id);
  const flat = flattenLessons(course);
  const nextLesson =
    flat.find((lesson) => !progress.completedLessonIds.has(lesson.id)) ?? flat[0] ?? null;
  const complete = isCourseComplete(progress);

  const recent = await prisma.lessonProgress.findMany({
    where: { userId: user.id, lesson: { module: { courseId: course.id } } },
    orderBy: { lastSeenAt: "desc" },
    take: 4,
    select: {
      lastSeenAt: true,
      completedAt: true,
      lesson: { select: { slug: true, title: true, module: { select: { title: true } } } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <h1 className="text-[1.75rem]">أهلاً {user.fullName}</h1>

      <section className="plate mt-8 p-6 sm:p-7">
        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <h2 className="text-h3">{course.title}</h2>
            <p className="mt-1 text-fine text-[var(--text-muted)]">
              {arabic(progress.completed)} من {arabic(progress.total)} درساً مكتملاً
            </p>
            <div className="mt-5 max-w-md">
              <ProgressBar percent={progress.percent} label="تقدّمك في الدورة" />
            </div>
          </div>

          {complete ? (
            <ButtonLink href="/dashboard/certificate" size="lg">
              استلم شهادتك
            </ButtonLink>
          ) : nextLesson ? (
            <ButtonLink href={`/learn/${course.slug}/${nextLesson.slug}`} size="lg">
              {progress.completed === 0 ? "ابدأ الدرس الأول" : "أكمل من حيث توقفت"}
            </ButtonLink>
          ) : null}
        </div>

        {nextLesson && !complete ? (
          <p className="mt-5 border-t border-[var(--hairline)] pt-4 text-fine text-[var(--text-muted)]">
            التالي: {nextLesson.module.badge} · {nextLesson.title}
          </p>
        ) : null}
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <section>
          <h2 className="text-h3">المنهج</h2>
          <div className="mt-4">
            <Curriculum
              modules={course.modules}
              courseSlug={course.slug}
              completedLessonIds={[...progress.completedLessonIds]}
              canViewAll
              defaultOpen={null}
            />
          </div>
        </section>

        <section>
          <h2 className="text-h3">آخر نشاط</h2>
          {recent.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="لا نشاط بعد"
                description="افتح أول درس، وسيظهر سجلّ نشاطك هنا."
                action={
                  nextLesson
                    ? { href: `/learn/${course.slug}/${nextLesson.slug}`, label: "ابدأ الآن" }
                    : undefined
                }
              />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
              {recent.map((row) => (
                <li key={row.lesson.slug} className="py-3">
                  <Link
                    href={`/learn/${course.slug}/${row.lesson.slug}`}
                    className="block transition-colors hover:text-crimson"
                  >
                    <span className="block text-[0.9375rem] text-[var(--text-strong)]">
                      {row.lesson.title}
                    </span>
                    <span className="mt-0.5 block text-fine text-[var(--text-muted)]">
                      {row.lesson.module.title} ·{" "}
                      {row.completedAt ? "مكتمل" : "قيد المتابعة"} ·{" "}
                      {new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(
                        row.lastSeenAt,
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8">
            <h2 className="text-h3">تقدّم الوحدات</h2>
            <ul className="mt-4 space-y-4">
              {course.modules.map((module) => {
                const moduleProgress = progress.modules.get(module.id);
                return (
                  <li key={module.id}>
                    <ProgressBar
                      percent={moduleProgress?.percent ?? 0}
                      label={`${module.badge} · ${module.title}`}
                      size="sm"
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
