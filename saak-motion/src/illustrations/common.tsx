export const INK = "#1C2563";
export const STROKE = 7;
export const SLAB = "#E4E8F1";
export const SLAB_DIRTY = "#CBD0DC";
export const WATER = "#5AA6F0";
export const MORTAR = "#A2A8B8";
export const TILE_A = "#C9D4F5";
export const TILE_B = "#B3C3F1";
export const ACCENT = "#3D51C9";

// deterministic pseudo-random
export const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const Sparkle: React.FC<{ x: number; y: number; s: number; rot?: number; color?: string }> = ({
  x,
  y,
  s,
  rot = 0,
  color = ACCENT,
}) =>
  s <= 0 ? null : (
    <path
      transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}
      d="M0 -22 C2 -6 6 -2 22 0 C6 2 2 6 0 22 C-2 6 -6 2 -22 0 C-6 -2 -2 -6 0 -22Z"
      fill={color}
    />
  );
