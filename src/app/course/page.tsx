import type { Metadata } from "next";
import Image from "next/image";
import { getCourse } from "@/lib/course";
import { getCurrentUser } from "@/lib/auth";
import { getCourseAccess } from "@/lib/access";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Curriculum } from "@/components/course/curriculum";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/plate";
import { EmptyState } from "@/components/ui/states";
import { audience, formatPrice, pricing, requirements } from "@/config/site";
import { faqs } from "@/content/faq";

export const metadata: Metadata = {
  title: "صفحة الدورة",
  description:
    "المنهج الكامل لدورة التصوير المعماري وتحسين التصميم بالذكاء الاصطناعي: سبع وحدات، خمس مهارات عملية، وقائمة مراجعة جودة قبل التسليم.",
  alternates: { canonical: "/course" },
};

const arabic = (value: number) => value.toLocaleString("ar-EG");

const outcomes = [
  {
    title: "تستبدل خامة على صورة قائمة",
    text: "دون أن يتغير عدد الزعانف أو الفتحات أو النسب.",
  },
  {
    title: "تعيد تأثيث فراغ",
    text: "مع ثبات الجدران والنوافذ والأرضية، وبمقياس واقعي.",
  },
  {
    title: "تنقل أجواء صورة مرجعية",
    text: "دون أن تنتقل معها خاماتها أو عناصرها.",
  },
  {
    title: "تبني سلسلة لقطات قريبة",
    text: "بعدسة وزاوية محددتين، تروي قصة تفاصيل المشروع.",
  },
  {
    title: "ترفع جودة صورة ضعيفة",
    text: "دون إضافة أو حذف أي عنصر معماري.",
  },
  {
    title: "تراجع أي مخرج قبل تسليمه",
    text: "بقائمة مراجعة من ستة بنود ترفض أي انحراف عن التصميم.",
  },
];

export default async function CoursePage() {
  const [course, user] = await Promise.all([getCourse(), getCurrentUser()]);

  if (!course) {
    return (
      <>
        <SiteHeader />
        <main id="main" className="mx-auto max-w-2xl px-4 py-20">
          <EmptyState title="لا توجد دورة منشورة" description="ستظهر الدورة هنا فور نشرها." />
        </main>
        <SiteFooter />
      </>
    );
  }

  const access = await getCourseAccess(user, course.id);
  const enrollHref = user ? (access.canViewAll ? "/dashboard" : "/checkout") : "/register";
  const enrollLabel = access.canViewAll ? "أكمل التعلّم" : user ? "اشترك الآن" : "ابدأ الدورة";

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="border-b border-[var(--hairline)]">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center">
            <div>
              <p className="annot">{course.titleEn}</p>
              <h1 className="mt-4 text-[2rem] leading-[1.25] sm:text-[var(--text-h1)]">
                {course.title}
              </h1>
              <p className="mt-5 max-w-[56ch] text-[var(--text-lead)] leading-[1.8] text-[var(--text-body)]">
                {course.summary}
              </p>

              <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-fine">
                <div>
                  <dt className="text-[var(--text-muted)]">الوحدات</dt>
                  <dd className="text-[var(--text-strong)]">{arabic(course.modules.length)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">الدروس</dt>
                  <dd className="text-[var(--text-strong)]">{arabic(course.lessonCount)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">زمن قراءة تقديري</dt>
                  <dd className="text-[var(--text-strong)]">
                    {arabic(Math.round(course.totalMinutes / 60))} ساعات
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">اللغة</dt>
                  <dd className="text-[var(--text-strong)]">العربية</dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink href={enrollHref} size="lg">
                  {enrollLabel}
                </ButtonLink>
                <span className="text-[var(--text-muted)]">{formatPrice(course.priceAmount)}</span>
              </div>
              {pricing.isPlaceholder ? (
                <p className="mt-2 text-[0.75rem] text-crimson">
                  سعر مبدئي — لم يرد في العرض التدريبي
                </p>
              ) : null}
            </div>

            <div className="plate relative aspect-[4/3] overflow-hidden">
              <span className="plate-mark z-10">REF</span>
              <Image
                src={course.heroImage}
                alt="المشروع المرجعي المستخدم في أمثلة الدورة"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            title="ماذا ستستطيع أن تفعل بعد الدورة"
            lead="كل مخرج هنا مرتبط بوحدة كاملة في المنهج، ومقيّد بالمبدأ نفسه: عنصر واحد يتغير وكل ما عداه يُقفل."
          />
          <ul className="mt-10 grid gap-px border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-2 lg:grid-cols-3">
            {outcomes.map((outcome, index) => (
              <li key={outcome.title} className="bg-[var(--surface)] p-5">
                <span className="font-[family-name:var(--font-annot)] text-fine text-crimson">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1.5 text-[1.0625rem]">{outcome.title}</h3>
                <p className="mt-1 text-fine text-[var(--text-muted)]">{outcome.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y border-[var(--hairline)] bg-[var(--surface-2)]">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
            <SectionHeading title="المنهج" />
            <div className="mt-8">
              <Curriculum
                modules={course.modules}
                courseSlug={course.slug}
                canViewAll={access.canViewAll}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div>
            <SectionHeading title="لمن هذه الدورة" />
            <ul className="mt-6 space-y-3">
              {audience.map((item) => (
                <li key={item} className="flex gap-3 text-[var(--text-body)]">
                  <span aria-hidden className="mt-2.5 block h-1.5 w-1.5 shrink-0 bg-crimson" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading title="المتطلبات" />
            <ul className="mt-6 space-y-3">
              {requirements.map((item) => (
                <li key={item} className="flex gap-3 text-[var(--text-body)]">
                  <span
                    aria-hidden
                    className="mt-2.5 block h-1.5 w-1.5 shrink-0 bg-[var(--text-muted)]"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-[var(--hairline)]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:items-start">
              <SectionHeading title={course.instructor} />
              <p className="max-w-[62ch] leading-[1.9] text-[var(--text-body)]">
                {course.instructorBio}
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--hairline)] bg-[var(--surface-2)]">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
            <SectionHeading title="أسئلة شائعة" />
            <dl className="mt-8 divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
              {faqs.map((faq) => (
                <div key={faq.question} className="py-5">
                  <dt className="font-semibold text-[var(--text-strong)]">{faq.question}</dt>
                  <dd className="mt-2 leading-[1.85] text-[var(--text-body)]">{faq.answer}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 text-center">
              <ButtonLink href={enrollHref} size="lg">
                {enrollLabel}
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
