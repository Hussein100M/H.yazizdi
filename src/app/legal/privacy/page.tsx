import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  alternates: { canonical: "/legal/privacy" },
};

const sections = [
  {
    title: "ما نجمعه",
    body: "اسمك وبريدك الإلكتروني، وتقدّمك في الدروس، وسجلّ طلبات الاشتراك. نسجّل أيضاً محاولات الدخول الفاشلة لحماية الحسابات.",
  },
  {
    title: "كلمات المرور",
    body: "لا نخزّن كلمة المرور نفسها إطلاقاً، بل بصمة مشفّرة لها (bcrypt). ولا نستطيع استرجاعها — يمكن إعادة تعيينها فقط.",
  },
  {
    title: "الجلسات",
    body: "نحفظ بصمة رمز الجلسة لا الرمز نفسه، ونحفظ بصمة عنوان الاتصال لا العنوان نفسه. تنتهي الجلسة تلقائياً، وتُلغى كل الجلسات عند تغيير كلمة المرور.",
  },
  {
    title: "الدفع",
    body: "لا تمر بيانات البطاقات عبر خوادم المنصة ولا تُخزَّن فيها. نحتفظ برقم العملية لدى مزوّد الدفع وحالتها فقط.",
  },
  {
    title: "حقوقك",
    body: "يمكنك طلب تعديل بياناتك أو حذف حسابك بالتواصل مع الإدارة. حذف الحساب يحذف تقدّمك وشهادتك.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="annot">Privacy</p>
        <h1 className="mt-2 text-[1.875rem]">سياسة الخصوصية</h1>

        <p className="mt-5 border-s-2 border-crimson bg-blush px-4 py-3 text-fine text-crimson-deep">
          نص مقترح يصف سلوك المنصة الفعلي كما هو مبنيّ في الكود. راجعه قانونياً قبل الإطلاق.
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
