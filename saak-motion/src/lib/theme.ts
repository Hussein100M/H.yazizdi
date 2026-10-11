export const C = {
  ink0: "#03051A",
  ink1: "#080D2E",
  ink2: "#101850",
  brand: "#243272", // navy printed on the bags / logo
  brandBright: "#3D51C9",
  white: "#F5F7FC",
  porcelain: "#EEF1F8",
  text: "#EEF0F8",
  muted: "#98A1C6",
  hairline: "rgba(255,255,255,0.14)",
  inkLine: "#1C2563",
};

export const FONT = `"IBM Plex Sans Arabic", system-ui, sans-serif`;

export type Product = {
  key: "ceramic" | "porcelain" | "super";
  index: string;
  title: string;
  latin: string;
  accent: string;
  accentLight: string;
  classCode?: string;
  features: string[];
  /** logo rectangle on the cut-out bag image (px in source image) */
  mark: { x: number; y: number; w: number; h: number };
  size: { w: number; h: number };
};

export const PRODUCTS: Product[] = [
  {
    key: "ceramic",
    index: "١",
    title: "غراء السيراميك الممتاز",
    latin: "Ceramic Premium Fix",
    accent: "#7B3FB4",
    accentLight: "#C39BF0",
    features: ["ضمان ١٥ سنة", "لصق قوي للجدران والأرضيات", "كيس ٢٠ كجم – جودة سعودية"],
    mark: { x: 171, y: 34, w: 148, h: 161 },
    size: { w: 426, h: 693 },
  },
  {
    key: "porcelain",
    index: "٢",
    title: "غراء البورسلين الأفضل",
    latin: "Porcelain Premium Fix",
    accent: "#16929F",
    accentLight: "#7FDCE4",
    classCode: "C2TE",
    features: ["قوة لصق عالية", "يمنع انزلاق البلاط", "وقت عمل أطول"],
    mark: { x: 187, y: 47, w: 125, h: 152 },
    size: { w: 430, h: 694 },
  },
  {
    key: "super",
    index: "٣",
    title: "غراء سوبر ساك",
    latin: "Super SAAK Adhesive",
    accent: "#1E78D2",
    accentLight: "#8CC4F7",
    classCode: "C2TES1",
    features: ["متعدد الاستعمالات", "للبورسلين والرخام والمسابح", "مرن يتحمل الحركة والتمدد"],
    mark: { x: 185, y: 33, w: 124, h: 154 },
    size: { w: 430, h: 688 },
  },
];

export const STEPS = [
  { title: "تنظيف الأسطح", body: "نظّف السطح من الغبار والزيوت", spec: "سطح نظيف = لصق أقوى" },
  { title: "الخلط", body: "اخلط الكيس مع الماء حتى يتجانس", spec: "٤–٥ لتر ماء لكل ٢٠ كجم" },
  { title: "التطبيق", body: "افرد الغراء بالمسطرين المسنّن", spec: "سماكة ٢–٥ ملم" },
  { title: "التغطية", body: "الكيس الواحد يغطي مساحة", spec: "٥ م² لكل ٢٠ كجم" },
  { title: "الترويبة", body: "نفّذ الترويبة بعد جفاف الغراء", spec: "بعد ٢٤ ساعة" },
];

export const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
export const toArabic = (n: number) => String(n).replace(/\d/g, (d) => AR_DIGITS[+d]);
