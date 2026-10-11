// All timings are anchored to the phrase points of the original 50 s music bed
// (120 BPM, phrase hits on t = 0.21 + 0.5k s). Frames are at 60 fps.
export const FPS = 60;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const TOTAL_FRAMES = 50 * FPS;

const s = (sec: number) => Math.round(sec * FPS);

export const T = {
  intro: 0,
  product1: s(3.71),
  product2: s(9.71),
  product3: s(15.71),
  howTo: s(21.71),
  step1: s(23.71),
  step2: s(27.71),
  step3: s(31.71),
  step4: s(35.71),
  step5: s(39.71),
  outro: s(43.71),
  end: TOTAL_FRAMES,
} as const;

export const BEAT = 30; // one beat at 120 BPM, in frames
export const sec = s;
