import { PRODUCTS } from "../lib/theme";

// Product stage: hero bag geometry (shared by the intro hand-off and the carousel).
export const BAG_H = 760;
export const BAG_TOP = 498;
export const CX = 540;

export const bagWidth = (i: number) => (BAG_H * PRODUCTS[i].size.w) / PRODUCTS[i].size.h;

/** Where the printed SAAK mark sits on product i's bag, in frame pixels (bag at rest). */
export const bagMarkRect = (i: number) => {
  const p = PRODUCTS[i];
  const k = BAG_H / p.size.h;
  const left = CX - bagWidth(i) / 2;
  return { x: left + p.mark.x * k, y: BAG_TOP + p.mark.y * k, w: p.mark.w * k, h: p.mark.h * k };
};

// Intro mark at rest.
export const INTRO_MARK = { w: 380, cx: CX, top: 560 };
