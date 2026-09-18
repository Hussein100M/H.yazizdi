import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "شروط الاستخدام",
  alternates: { canonical: "/legal/terms" },
};

const sections = [
  {
    title: "نطاق الخدمة",
    body: "تمنحك المنصة وصولاً شخصياً غير حصري إلى محتوى الدورة بعد تأكيد الاشتراك. الوصول مرتبط بحسابك وحده.",
  },
  {
    title: "الاستخدام المسموح",
    body: "المحتوى مخصص للتعلّم الشخصي والاستخدام المهني في أعمالك. لا يُسمح بإعادة نشره أو بيعه أو مشاركته مع حسابات أخرى.",
  },
  {
    title: "الشهادة",
    body: "تصدر شهادة الإتمام عن هذه المنصة باسم مقدّم الدورة، وتُثبت إكمال المحتوى فقط. لا تمثل اعتماداً أكاديمياً أو مهنياً من أي جهة.",
  },
  {
    title: "الدفع والوصول",
    body: "يُفتح الوصول بعد تأكيد الدفعة. أي طلب لم يُؤكَّد يبقى بحالة «قيد التأكيد» ولا يمنح وصولاً.",
  },
  {
    title: "حدود المسؤولية",
    body: "المحتوى تدريبي، والقرار التصميمي يبقى مسؤولية المستخدم المهنية. لا تتحمل المنصة مسؤولية النتائج المترتبة على مخرجات أدوات الذكاء الاصطناعي.",
  },
];

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="annot">Terms</p>
        <h1 className="mt-2 text-[1.875rem]">شروط الاستخدام</h1>

        <p className="mt-5 border-s-2 border-crimson bg-blush px-4 py-3 text-fine text-crimson-deep">
          نص مقترح — لم يرد في العرض التدريبي، ولم تراجعه جهة قانونية. راجعه قبل الإطلاق التجاري.
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-h3">{section.title}</h2>
              <p className="mt-2 max-w-[68ch] leading-[1.9] text-[var(--text-body)]">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <p className="mt-12 text-fine text-[var(--text-muted)]">
          للاستفسار: <span dir="ltr">{site.contactEmail}</span>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
