import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { faqs } from "@/content/faq";

export const metadata: Metadata = {
  title: "أسئلة شائعة",
  description: "إجابات عن أكثر الأسئلة تكراراً حول دورة التصوير المعماري بالذكاء الاصطناعي.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main id="main" className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="annot">FAQ</p>
        <h1 className="mt-2 text-[1.875rem]">أسئلة شائعة</h1>

        <dl className="mt-10 divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
          {faqs.map((faq) => (
            <div key={faq.question} className="py-6">
              <dt className="text-[1.0625rem] font-semibold text-[var(--text-strong)]">
                {faq.question}
              </dt>
              <dd className="mt-2 max-w-[68ch] leading-[1.9] text-[var(--text-body)]">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </main>
      <SiteFooter />
    </>
  );
}
