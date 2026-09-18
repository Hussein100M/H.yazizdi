import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getCourse } from "@/lib/course";
import { getCourseAccess } from "@/lib/access";
import { getCourseProgress, isCourseComplete } from "@/lib/progress";
import { prisma } from "@/lib/db";
import { generateCertificateSerial } from "@/lib/enrollment";
import { Certificate } from "@/components/course/certificate";
import { ProgressBar } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/states";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "الشهادة",
  robots: { index: false, follow: false },
};

export default async function CertificatePage() {
  const user = await requireUser();
  const course = await getCourse();

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState title="لا توجد دورة" description="لم تُنشر أي دورة بعد." />
      </div>
    );
  }

  const access = await getCourseAccess(user, course.id);
  const progress = await getCourseProgress(user.id, course.id);

  if (!access.canViewAll) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          title="الشهادة بعد إكمال الدورة"
          description="تصدر شهادة الإتمام بعد إنهاء جميع دروس الدورة. اشترك أولاً لفتح الوحدات."
          action={{ href: "/checkout", label: "اشترك الآن" }}
        />
      </div>
    );
  }

  if (!isCourseComplete(progress)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <p className="annot">Certificate</p>
        <h1 className="mt-2 text-[1.75rem]">شهادتك بانتظار آخر الدروس</h1>
        <p className="mt-3 text-[var(--text-muted)]">
          تصدر الشهادة تلقائياً فور إكمال جميع دروس الدورة.
        </p>
        <div className="plate mt-8 p-6">
          <ProgressBar percent={progress.percent} label="تقدّمك في الدورة" />
          <p className="mt-4 text-fine text-[var(--text-muted)]">
            بقي {(progress.total - progress.completed).toLocaleString("ar-EG")} درساً.
          </p>
          <ButtonLink href="/dashboard" className="mt-5">
            أكمل التعلّم
          </ButtonLink>
        </div>
      </div>
    );
  }

  // تُصدر مرة واحدة، ويبقى الاسم كما كان وقت الإصدار
  const certificate = await prisma.certificate.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    create: {
      serial: generateCertificateSerial(),
      userId: user.id,
      courseId: course.id,
      holderName: user.fullName,
    },
    update: {},
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <p className="annot">Certificate</p>
      <h1 className="mt-2 text-[1.75rem]">شهادة إتمام الدورة</h1>
      <p className="mt-3 max-w-[60ch] text-[var(--text-muted)]">
        هذه الشهادة صادرة عن هذه المنصة وتُثبت إكمال محتوى الدورة. لا تمثل أي اعتماد أكاديمي أو
        مهني.
      </p>

      <div className="mt-8">
        <Certificate
          holderName={certificate.holderName}
          courseTitle={course.title}
          courseTitleEn={course.titleEn}
          issuedAt={certificate.issuedAt}
          serial={certificate.serial}
          instructor={course.instructor}
        />
      </div>
    </div>
  );
}
