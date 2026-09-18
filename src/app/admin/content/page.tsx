import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EmptyState } from "@/components/ui/states";

export const metadata: Metadata = {
  title: "المحتوى",
  robots: { index: false, follow: false },
};

const arabic = (value: number) => value.toLocaleString("ar-EG");

export default async function AdminContentPage() {
  await requireAdmin();

  const course = await prisma.course.findFirst({
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
              minutes: true,
              isPreview: true,
              videoAssetId: true,
              _count: { select: { blocks: true } },
            },
          },
        },
      },
    },
  });

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          title="لا يوجد محتوى"
          description="شغّل أمر التعبئة لإنشاء الدورة من ملف المحتوى: npm run db:seed"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <h1 className="text-[1.75rem]">{course.title}</h1>
      <p className="mt-3 max-w-[70ch] text-fine text-[var(--text-muted)]">
        المحتوى مخزّن في قاعدة البيانات ويُعاد بناؤه من{" "}
        <span className="annot">src/content/course.ts</span> عند تشغيل التعبئة. الحقول أدناه للقراءة
        والمراجعة.
      </p>

      <ol className="mt-8 space-y-4">
        {course.modules.map((module) => (
          <li key={module.id} className="plate p-5">
            <div className="flex items-baseline gap-3">
              <span className="font-[family-name:var(--font-annot)] text-crimson">
                {module.badge}
              </span>
              <h2 className="text-[1.0625rem] font-semibold text-[var(--text-strong)]">
                {module.title}
              </h2>
              <span className="ms-auto text-fine text-[var(--text-muted)]">
                {arabic(module.lessons.length)} دروس
              </span>
            </div>

            <ul className="mt-4 divide-y divide-[var(--hairline)] border-t border-[var(--hairline)]">
              {module.lessons.map((lesson) => (
                <li key={lesson.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
                  <Link
                    href={`/learn/${course.slug}/${lesson.slug}`}
                    className="text-fine text-[var(--text-strong)] hover:text-crimson"
                  >
                    {lesson.title}
                  </Link>
                  <span className="text-[0.75rem] text-[var(--text-muted)]">
                    {arabic(lesson._count.blocks)} كتل · {arabic(lesson.minutes)} د
                  </span>
                  {lesson.isPreview ? (
                    <span className="text-[0.75rem] text-crimson">معاينة</span>
                  ) : null}
                  {lesson.videoAssetId ? (
                    <span className="text-[0.75rem] text-[var(--text-muted)]">فيديو مرتبط</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
