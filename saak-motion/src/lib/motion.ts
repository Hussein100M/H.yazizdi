import { Easing, interpolate } from "remotion";

// House curves. expoOut is the signature arrival curve (cubic-bezier(0.16, 1, 0.3, 1)).
export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.55, 0, 0.9, 0.3),
  soft: Easing.bezier(0.33, 0, 0.2, 1),
};

/** 0→1 progress of `frame` through [start, start+dur], eased and clamped. */
export const prog = (
  frame: number,
  start: number,
  dur: number,
  easing: (t: number) => number = ease.out,
) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Settle with a sub-2% overshoot: rises to ~1.015 then rests at 1. */
export const settle = (t: number) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const e = ease.out(t);
  return e + Math.sin(Math.PI * e) * 0.015 * (1 - t);
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Fade window: in over [a, a+i], out over [b-o, b]. */
export const windowOpacity = (frame: number, a: number, b: number, i = 18, o = 18) =>
  Math.min(prog(frame, a, i, ease.soft), 1 - prog(frame, b - o, o, ease.soft));

export const mixHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (p: number, sh: number) => (p >> sh) & 255;
  const m = (sh: number) => Math.round(lerp(ch(pa, sh), ch(pb, sh), t));
  return `rgb(${m(16)}, ${m(8)}, ${m(0)})`;
};
