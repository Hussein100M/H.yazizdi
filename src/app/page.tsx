import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getCourse, getPromptFormulas } from "@/lib/course";
import { getCurrentUser } from "@/lib/auth";
import { getCourseAccess } from "@/lib/access";
import { audience, coverStats, formatPrice, instructor, pricing, requirements, site } from "@/config/site";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSpecimen } from "@/components/hero/specimen";
import { Curriculum } from "@/components/course/curriculum";
import { PromptCard } from "@/components/course/prompt-card";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/plate";
import { EmptyState } from "@/components/ui/states";
import { faqs } from "@/content/faq";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const arabic = (value: number) => value.toLocaleString("ar-EG");

const contract = {
  change: {
    title: "يمكن تحسينه",
    annot: "What AI can enhance",
    items: [
      "الخامات والتشطيبات",
      "الأثاث وتوزيعه",
      "الإضاءة والأجواء والتدرج اللوني",
      "التفاصيل الدقيقة والواقعية",
      "زاوية اللقطة وتكوينها",
    ],
  },
  preserve: {
    title: "يجب الحفاظ عليه",
    annot: "What must stay locked",
    items: [
      "الكتلة والشكل الهندسي",
      "النسب والمقياس",
      "الفتحات والإيقاع المعماري",
      "علاقات الفراغ والحركة",
      "هوية المشروع ولغته التصميمية",
    ],
  },
};

const workflow = [
  { badge: "٠١", title: "المدخل المعماري", text: "رندر، صورة، أو لقطة نموذج" },
  { badge: "٠٢", title: "تحليل الصورة", text: "فهم الكتلة والخامات والضوء" },
  { badge: "٠٣", title: "العنصر المستهدف", text: "تحديد ما سيتغير فقط" },
  { badge: "٠٤", title: "تحويل مُتحكَّم به", text: "تعليمات دقيقة ومرجع بصري" },
  { badge: "٠٥", title: "القيود المعمارية", text: "إقفال الهندسة والنسب" },
  { badge: "٠٦", title: "الإظهار المحسّن", text: "مراجعة ومقارنة قبل/بعد" },
];

const checklist = [
  { title: "الهندسة والنسب", text: "الكتلة والفتحات وعدد العناصر مطابقة للأصل" },
  { title: "الخامات", text: "تغيّر فقط ما طُلب تغييره" },
  { title: "المقياس", text: "الأثاث والأشخاص بأبعاد واقعية" },
  { title: "الإضاءة", text: "اتجاه ضوء واحد منطقي وظلال متسقة" },
  { title: "الواقعية", text: "لا تشوهات، لا نصوص غريبة، لا عناصر عائمة" },
  { title: "المقارنة", text: "عرض قبل/بعد جنباً إلى جنب قبل التسليم" },
];

export default async function HomePage() {
  const [course, prompts, user] = await Promise.all([
    getCourse(),
    getPromptFormulas(),
    getCurrentUser(),
  ]);

  if (!course) {
    return (
      <>
        <SiteHeader />
        <main id="main" className="mx-auto max-w-2xl px-4 py-24">
          <EmptyState
            title="لا توجد دورة منشورة بعد"
            description="لم تُنشر أي دورة على هذه المنصة حتى الآن. عد لاحقاً أو تواصل مع الإدارة."
            action={{ href: "/login", label: "تسجيل الدخول" }}
          />
        </main>
        <SiteFooter />
      </>
    );
  }

  const access = await getCourseAccess(user, course.id);
  const enrollHref = user ? (access.canViewAll ? "/dashboard" : "/checkout") : "/register";
  const enrollLabel = access.canViewAll ? "أكمل التعلّم" : user ? "اشترك الآن" : "ابدأ الدورة";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.summary,
    inLanguage: "ar",
    provider: { "@type": "Person", name: course.instructor },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `PT${course.totalMinutes}M`,
    },
    offers: {
      "@type": "Offer",
      price: (course.priceAmount / 100).toFixed(2),
      priceCurrency: course.priceCurrency,
      availability: "https://schema.org/InStock",
      url: `${site.url}/checkout`,
    },
  };

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="main">
        {/* ───────── البطل: نفس الكتلة، والخامة وحدها تتغيّر ───────── */}
        <section className="border-b border-[var(--hairline)]">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16 lg:py-20">
            <div className="plate-in">
              <p className="annot">{site.tagline}</p>
              <h1 className="mt-5 text-[2.125rem] leading-[1.22] sm:text-[var(--text-h1)] lg:text-[3.25rem]">
                {course.title}
              </h1>
              <p className="mt-5 max-w-[54ch] text-[var(--text-lead)] leading-[1.8] text-[var(--text-body)]">
                {course.summary}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink href={enrollHref} size="lg">
                  {enrollLabel}
                </ButtonLink>
                <ButtonLink href="#curriculum" size="lg" variant="outline">
                  اطّلع على المنهج
                </ButtonLink>
              </div>

              <dl className="mt-10 grid grid-cols-3 gap-px border border-[var(--hairline)] bg-[var(--hairline)]">
                {coverStats.map((stat) => (
                  <div key={stat.label} className="bg-[var(--surface)] px-3 py-4 text-center">
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <span className="block font-[family-name:var(--font-annot)] text-[1.75rem] leading-none text-crimson">
                        {stat.value}
                      </span>
                      <span className="mt-2 block text-[0.75rem] leading-snug text-[var(--text-muted)]">
                        {stat.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="plate-in" style={{ animationDelay: "120ms" }}>
              <HeroSpecimen />
            </div>
          </div>
        </section>

        {/* ───────── الأطروحة ───────── */}
        <section data-surface="ink" className="bg-ink">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <span className="fin-rhythm mx-auto mb-8 block w-20" aria-hidden />
            <p className="text-[1.5rem] leading-[1.6] text-[#f4f5f6] sm:text-[1.875rem]">
              الذكاء الاصطناعي لا يُعيد تصميم المشروع… بل يُحسّن طريقة رؤيته.
            </p>
            <p className="mx-auto mt-6 max-w-[58ch] text-[#c9ccd2]">
              نغيّر عنصراً مستهدفاً واحداً، ونثبّت كل ما عداه — الكتلة، النسب، والهوية. التحكم هو ما
              يصنع الفرق بين الاحتراف والتجريب.
            </p>
          </div>
        </section>

        {/* ───────── العقد: ما يتغيّر وما يُقفل ───────── */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading
            annot="Change vs. Preserve"
            title="ما الذي يُغيّره الذكاء الاصطناعي… وما الذي يجب أن يبقى؟"
            lead="هذا الجدول هو العقد الذي نكتبه في كل برومبت: قائمة بما يتغير، وقائمة أطول بما يُقفل. كلما كانت قائمة الإقفال أوضح، كانت النتيجة أكثر أمانة للتصميم."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[contract.change, contract.preserve].map((column, index) => (
              <div
                key={column.title}
                className={`plate p-6 ${index === 0 ? "bg-blush" : "bg-[var(--surface-2)]"}`}
              >
                <p className="annot">{column.annot}</p>
                <h3 className="mt-2 text-h3">{column.title}</h3>
                <ul className="mt-5 space-y-3">
                  {column.items.map((item) => (
                    <li key={item} className="flex gap-3 text-[var(--text-body)]">
                      <span
                        aria-hidden
                        className={`mt-2.5 block h-1.5 w-1.5 shrink-0 ${
                          index === 0 ? "bg-crimson" : "bg-[var(--text-muted)]"
                        }`}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ───────── سير العمل ───────── */}
        <section className="border-y border-[var(--hairline)] bg-[var(--surface-2)]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionHeading
              annot="AI Visualization Workflow"
              title="سير العمل: من المدخل المعماري إلى الإظهار المحسّن"
              lead="ست خطوات تتكرر داخل كل وحدة. إذا تغيّر ما يجب أن يبقى، نعود إلى خطوة القيود ونُحكم الإقفال."
            />

            <ol className="mt-10 grid gap-px border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-2 lg:grid-cols-3">
              {workflow.map((step) => (
                <li key={step.badge} className="bg-[var(--surface)] p-5">
                  <span className="font-[family-name:var(--font-annot)] text-[1.25rem] text-crimson">
                    {step.badge}
                  </span>
                  <h3 className="mt-2 text-[1.0625rem]">{step.title}</h3>
                  <p className="mt-1 text-fine text-[var(--text-muted)]">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ───────── المنهج ───────── */}
        <section id="curriculum" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading
            title="المنهج الكامل"
            lead={`${arabic(course.modules.length)} وحدات · ${arabic(course.lessonCount)} درساً بالعربية. كل وحدة بنفس الهيكل: تقديم، تحدٍّ ومعالجة، خطوات عمل، مثال بصري، وأفضل ممارسات.`}
          />
          <div className="mt-10">
            <Curriculum
              modules={course.modules}
              courseSlug={course.slug}
              canViewAll={access.canViewAll}
            />
          </div>
          <p className="mt-6 text-fine text-[var(--text-muted)]">
            زمن القراءة التقديري للدورة كاملة: {arabic(Math.round(course.totalMinutes / 60))} ساعات
            تقريباً — محسوب من طول المحتوى نفسه.
          </p>
        </section>

        {/* ───────── صيغ البرومبت ───────── */}
        <section id="prompts" className="border-y border-[var(--hairline)] bg-[var(--surface-2)]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionHeading
                title="خمس صيغ برومبت تأخذها معك إلى عملك"
              lead="لكل مهارة صيغة واحدة مختبرة، تُحدّد ما يتغيّر وتُقفل كل ما عداه صراحةً."
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {prompts.map((prompt) => (
                <PromptCard
                  key={prompt.badge}
                  badge={prompt.badge}
                  moduleTitle={prompt.moduleTitle}
                  text={prompt.text}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ───────── قائمة المراجعة ───────── */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <SectionHeading
              annot="Quality Control"
              title="قائمة المراجعة قبل اعتماد أي صورة"
              lead="تُطبَّق على مخرجات كل الوحدات. أول بندين هما الأهم: إذا تغيرت الهندسة أو تغيرت خامة لم نطلب تغييرها، تُرفض الصورة مباشرة."
            />
            <ul className="grid gap-px border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-2">
              {checklist.map((item, index) => (
                <li key={item.title} className="bg-[var(--surface)] p-5">
                  <div className="flex items-baseline gap-2">
                    <span className="font-[family-name:var(--font-annot)] text-fine text-crimson">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-[1rem]">{item.title}</h3>
                  </div>
                  <p className="mt-1.5 text-fine text-[var(--text-muted)]">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───────── لمن هذه الدورة ───────── */}
        <section className="border-y border-[var(--hairline)] bg-[var(--surface-2)]">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-2">
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
              <SectionHeading title="ما تحتاجه قبل البدء" />
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
          </div>
        </section>

        {/* ───────── المدرّب ───────── */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-10 md:grid-cols-[1fr_1.3fr] md:items-center">
            <div className="plate relative aspect-[4/3] overflow-hidden">
              <span className="plate-mark z-10">REF</span>
              <Image
                src={course.heroImage}
                alt="المشروع المرجعي المستخدم في أمثلة الدورة"
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover"
              />
            </div>
            <div>
              <SectionHeading title={course.instructor} />
              <p className="mt-4 max-w-[58ch] leading-[1.9] text-[var(--text-body)]">
                {course.instructorBio}
              </p>
              {instructor.isBioPlaceholder ? (
                <p className="mt-4 border-s-2 border-crimson bg-blush px-3 py-2 text-fine text-crimson-deep">
                  نص مقترح — لم يرد في العرض التدريبي. راجعه قبل النشر من ملف
                  <span className="annot mx-1">src/config/site.ts</span>.
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {/* ───────── الاشتراك ───────── */}
        <section id="pricing" data-surface="ink" className="bg-ink">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h2 className=" text-[1.75rem] text-[#f4f5f6] sm:text-[var(--text-h2)]">
                  وصول كامل إلى الوحدات السبع
                </h2>
                <ul className="mt-6 space-y-2.5">
                  {pricing.includes.map((item) => (
                    <li key={item} className="flex gap-3 text-[#c9ccd2]">
                      <span aria-hidden className="mt-2.5 block h-1.5 w-1.5 shrink-0 bg-crimson" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="plate bg-[var(--surface-2)] p-6 text-center md:min-w-[15rem]">
                <p className="text-fine text-[var(--text-muted)]">الاشتراك لمرة واحدة</p>
                <p className="mt-2 text-[2.25rem] font-semibold leading-none text-[var(--text-strong)]">
                  {formatPrice(course.priceAmount)}
                </p>
                <ButtonLink href={enrollHref} size="lg" className="mt-5 w-full">
                  {enrollLabel}
                </ButtonLink>
                {pricing.isPlaceholder ? (
                  <p className="mt-3 text-[0.75rem] leading-snug text-crimson">
                    سعر مبدئي — لم يرد في العرض التدريبي
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* ───────── أسئلة شائعة ───────── */}
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading title="أسئلة شائعة" />
          <dl className="mt-8 divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
            {faqs.slice(0, 4).map((faq) => (
              <div key={faq.question} className="py-5">
                <dt className="text-[1.0625rem] font-semibold text-[var(--text-strong)]">
                  {faq.question}
                </dt>
                <dd className="mt-2 leading-[1.85] text-[var(--text-body)]">{faq.answer}</dd>
              </div>
            ))}
          </dl>
          <Link href="/faq" className="link-underline mt-6 inline-block text-[var(--text-body)]">
            بقية الأسئلة
          </Link>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
