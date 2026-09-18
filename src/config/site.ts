/**
 * الإعدادات التجارية والعلامة. كل ما يحتاج صاحب المنصة تغييره موجود هنا.
 * ⚠️ القيم المعلّمة بـ PLACEHOLDER لم ترد في العرض التدريبي — غيّرها قبل الإطلاق.
 */

export const site = {
  name: "التصوير المعماري بالذكاء الاصطناعي",
  shortName: "AI Arch Viz",
  locale: "ar_SA",
  tagline: "Design Enhancement · Intent Preserved",
  description:
    "دليل تدريبي احترافي في التصوير المعماري وتحسين التصميم بالذكاء الاصطناعي: خمس مهارات عملية تشكّل معاً سير عمل واحداً، مع الحفاظ الكامل على الهوية المعمارية للمشروع.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // PLACEHOLDER — لم يرد في العرض. غيّره أو احذف القسم الذي يستخدمه.
  contactEmail: "info@example.com",
} as const;

export const instructor = {
  name: "حسين اليزيدي",
  // PLACEHOLDER — نص مقترح، لم يرد في العرض التدريبي. راجعه قبل النشر.
  title: "معدّ الدليل التدريبي",
  bio: "معدّ الدليل التدريبي «التصوير المعماري وتحسين التصميم بالذكاء الاصطناعي» — منظومة من خمس مهارات عملية تُبقي القرار التصميمي بيد المعماري وتجعل الذكاء الاصطناعي أداة تحسين للإظهار لا أداة إعادة تصميم.",
  isBioPlaceholder: true,
} as const;

export const pricing = {
  /** السعر بالهللات (١٠٠ هللة = ١ ريال). PLACEHOLDER — لم يرد أي سعر في العرض. */
  amount: 99_000,
  currency: "SAR",
  currencyLabel: "ر.س",
  isPlaceholder: true,
  // نص مقترح — راجعه
  includes: [
    "٧ وحدات · ٣٥ درساً بالعربية",
    "خمس صيغ برومبت جاهزة للنسخ",
    "قائمة مراجعة الجودة قبل التسليم",
    "أمثلة بصرية قبل/بعد لكل وحدة",
    "وصول دائم وتحديثات الوحدات القادمة",
  ],
} as const;

export function formatPrice(amountInMinor: number, currencyLabel = pricing.currencyLabel): string {
  const major = amountInMinor / 100;
  const formatted = new Intl.NumberFormat("ar-SA", {
    maximumFractionDigits: major % 1 === 0 ? 0 : 2,
  }).format(major);
  return `${formatted} ${currencyLabel}`;
}

/** إحصاءات صفحة الغلاف — مأخوذة حرفياً من الشريحة الأولى للعرض. */
export const coverStats = [
  { value: "05", label: "وحدات تدريبية" },
  { value: "01", label: "منهجية متكاملة" },
  { value: "100%", label: "حفاظ على الهوية المعمارية" },
] as const;

/** نص مقترح — مستنتج من مفردات العرض ومحتواه، لم يرد كقائمة صريحة. راجعه. */
export const audience = [
  "معماريون ومصممون داخليون ممارسون",
  "فرق الإظهار المعماري ثلاثي الأبعاد",
  "مكاتب التصميم التي تعرض بدائل على عملائها",
  "فرق التسويق العقاري والمحتوى البصري",
  "طلاب العمارة في المراحل المتقدمة",
] as const;

/** نص مقترح — مستنتج من طبيعة المحتوى (تحرير صور قائمة لا توليد من الصفر). راجعه. */
export const requirements = [
  "صور مشاريع قائمة: رندر، صورة موقع، أو لقطة من النموذج",
  "اشتراك في أحد نماذج تحرير الصور بالذكاء الاصطناعي",
  "معرفة أساسية بقراءة الرسومات والنسب المعمارية",
] as const;
