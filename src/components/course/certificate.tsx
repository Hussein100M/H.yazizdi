import { site } from "@/config/site";

/**
 * الشهادة. تصميمها من نفس لغة لوحات الدليل: إطار، تأشيرة، وترقيم تسلسلي.
 * قابلة للطباعة مباشرة من المتصفح.
 */
export function Certificate({
  holderName,
  courseTitle,
  courseTitleEn,
  issuedAt,
  serial,
  instructor,
}: {
  holderName: string;
  courseTitle: string;
  courseTitleEn: string;
  issuedAt: Date;
  serial: string;
  instructor: string;
}) {
  const issued = new Intl.DateTimeFormat("ar-SA", { dateStyle: "long" }).format(issuedAt);
  const verifyUrl = `${site.url}/certificate/${serial}`;

  return (
    <figure className="plate bg-[var(--surface)] p-6 sm:p-10">
      <div className="border border-[var(--hairline)] p-6 sm:p-12">
        <div className="flex items-start justify-between gap-4">
          <span className="fin-mark block h-8 w-14" aria-hidden />
          <p className="annot text-end">{site.tagline}</p>
        </div>

        <p className="mt-10 text-fine text-[var(--text-muted)]">تشهد هذه الوثيقة بأن</p>
        <p className="mt-2 text-[1.75rem] font-semibold text-[var(--text-strong)] sm:text-[2.25rem]">
          {holderName}
        </p>

        <p className="mt-6 text-fine text-[var(--text-muted)]">قد أتمّ بنجاح دورة</p>
        <p className="mt-2 max-w-[32ch] text-[1.25rem] font-semibold leading-snug text-[var(--text-strong)]">
          {courseTitle}
        </p>
        <p className="annot mt-1">{courseTitleEn}</p>

        <div className="mt-12 grid gap-6 border-t border-[var(--hairline)] pt-6 sm:grid-cols-3">
          <div>
            <p className="text-fine text-[var(--text-muted)]">تاريخ الإتمام</p>
            <p className="mt-1 text-[0.9375rem] text-[var(--text-strong)]">{issued}</p>
          </div>
          <div>
            <p className="text-fine text-[var(--text-muted)]">إعداد وتقديم</p>
            <p className="mt-1 text-[0.9375rem] text-[var(--text-strong)]">{instructor}</p>
          </div>
          <div>
            <p className="text-fine text-[var(--text-muted)]">رقم التحقق</p>
            <p className="annot mt-1 text-[0.9375rem] font-semibold text-[var(--text-strong)]">
              {serial}
            </p>
          </div>
        </div>
      </div>

      <figcaption className="mt-4 text-fine text-[var(--text-muted)]">
        للتحقق من صحة الشهادة:{" "}
        <a href={verifyUrl} className="link-underline" dir="ltr">
          {verifyUrl}
        </a>
      </figcaption>
    </figure>
  );
}
