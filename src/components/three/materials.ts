/**
 * بدائل الخامات — نفس البدائل الواردة في الوحدة ٠١ من الدليل التدريبي.
 * الكتلة والنسب وعدد الزعانف ثابتة بين كل بديل وآخر: يتغيّر السطح وحده.
 */
export type MaterialVariant = {
  id: "original" | "wood" | "stone" | "aluminium";
  label: string;
  detail: string;
  /** صورة العرض المقابلة — تُستخدم كبديل كامل عند تعذّر WebGL */
  image: string;
  fin: { color: string; roughness: number; metalness: number };
  body: { color: string; roughness: number; metalness: number };
};

export const materialVariants: MaterialVariant[] = [
  {
    id: "original",
    label: "الأصل",
    detail: "زعانف معدنية حمراء",
    image: "/course/material-original.jpg",
    fin: { color: "#a8141e", roughness: 0.38, metalness: 0.35 },
    body: { color: "#fbfbfc", roughness: 0.62, metalness: 0.05 },
  },
  {
    id: "wood",
    label: "بديل A",
    detail: "زعانف خشبية دافئة",
    image: "/course/material-wood.jpg",
    fin: { color: "#a9703f", roughness: 0.72, metalness: 0.0 },
    body: { color: "#faf8f5", roughness: 0.68, metalness: 0.02 },
  },
  {
    id: "stone",
    label: "بديل B",
    detail: "حجر فاتح / GRC",
    image: "/course/material-stone.jpg",
    fin: { color: "#cdc7bd", roughness: 0.88, metalness: 0.0 },
    body: { color: "#f7f5f1", roughness: 0.82, metalness: 0.0 },
  },
  {
    id: "aluminium",
    label: "بديل C",
    detail: "ألمنيوم داكن",
    image: "/course/material-aluminium.jpg",
    fin: { color: "#4a4e55", roughness: 0.3, metalness: 0.78 },
    body: { color: "#f2f3f5", roughness: 0.5, metalness: 0.15 },
  },
];

/**
 * الأجواء — الوحدة ٠٣: نفس العمارة، طابع ضوئي مختلف.
 * لا تتغير الخامات هنا إلا بتأثير الضوء، تماماً كما ينص الدرس.
 */
export type MoodVariant = {
  id: "day" | "sunset" | "overcast";
  label: string;
  background: string;
  fog: string;
  key: { color: string; intensity: number; position: [number, number, number] };
  ambient: { color: string; intensity: number };
  rim: { color: string; intensity: number };
  floor: string;
  windows: { color: string; intensity: number };
};

export const moodVariants: MoodVariant[] = [
  {
    id: "day",
    label: "نهار",
    background: "#e3e7ec",
    fog: "#e3e7ec",
    key: { color: "#ffffff", intensity: 2.6, position: [-4, 8, 9] },
    ambient: { color: "#d4dae2", intensity: 0.5 },
    rim: { color: "#ffffff", intensity: 0.45 },
    floor: "#dce0e6",
    windows: { color: "#ffffff", intensity: 0 },
  },
  {
    id: "sunset",
    label: "غروب",
    background: "#3b2c43",
    fog: "#4a3348",
    key: { color: "#ffb26b", intensity: 2.4, position: [-6, 2.4, 5] },
    ambient: { color: "#6d5a7a", intensity: 0.75 },
    rim: { color: "#ff8c5a", intensity: 1.1 },
    floor: "#372a40",
    windows: { color: "#ffdda6", intensity: 1.6 },
  },
  {
    id: "overcast",
    label: "غائم",
    background: "#c3c8ce",
    fog: "#c3c8ce",
    key: { color: "#eef1f5", intensity: 1.6, position: [2, 9, 4] },
    ambient: { color: "#bcc2ca", intensity: 0.85 },
    rim: { color: "#dfe3e8", intensity: 0.3 },
    floor: "#b8bdc4",
    windows: { color: "#ffffff", intensity: 0 },
  },
];
