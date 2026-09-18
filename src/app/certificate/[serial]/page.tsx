import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Certificate } from "@/components/course/certificate";
import { ErrorState } from "@/components/ui/states";

export const metadata: Metadata = {
  title: "التحقق من شهادة",
  robots: { index: false, follow: true },
};

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ serial: string }>;
}) {
  const { serial } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { serial: serial.toUpperCase() },
    include: { course: { select: { title: true, titleEn: true, instructor: true } } },
  });

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
          <h1 className="text-[1.75rem]">التحقق من شهادة</h1>

        {certificate ? (
          <>
            <p className="mt-3 text-[var(--text-muted)]">
              هذه الشهادة صحيحة وصادرة عن هذه المنصة.
            </p>
            <div className="mt-8">
              <Certificate
                holderName={certificate.holderName}
                courseTitle={certificate.course.title}
                courseTitleEn={certificate.course.titleEn}
                issuedAt={certificate.issuedAt}
                serial={certificate.serial}
                instructor={certificate.course.instructor}
              />
            </div>
          </>
        ) : (
          <div className="mt-8">
            <ErrorState
              title="لا توجد شهادة بهذا الرقم"
              description="راجع رقم التحقق كما هو مكتوب على الشهادة. الأرقام تبدأ بـ AV متبوعة بالسنة."
            />
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
