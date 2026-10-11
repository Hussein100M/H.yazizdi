import { ease, lerp, prog } from "../lib/motion";
import { INK, rand, SLAB, SLAB_DIRTY, Sparkle, STROKE } from "./common";

/** A squeegee passes once; dust and oil vanish where it has been. */
export const StepClean: React.FC<{ l: number }> = ({ l }) => {
  const X = lerp(560, 40, prog(l, 22, 110, ease.inOut)); // head position, moving right→left
  const specks = Array.from({ length: 18 }, (_, i) => ({
    x: 115 + rand(i) * 370,
    y: 225 + rand(i + 40) * 215,
    r: 5 + rand(i + 80) * 9,
  }));
  const shine = prog(l, 150, 60, ease.inOut);
  return (
    <svg width="600" height="600" viewBox="0 0 600 600">
      <defs>
        <clipPath id="slab">
          <rect x="90" y="200" width="420" height="260" rx="18" />
        </clipPath>
        <linearGradient id="slabShine" x1="0" x2="1">
          <stop offset={Math.max(0, shine - 0.15)} stopColor="#fff" stopOpacity="0" />
          <stop offset={shine} stopColor="#fff" stopOpacity="0.85" />
          <stop offset={Math.min(1, shine + 0.15)} stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="300" cy="488" rx="230" ry="14" fill="#0A1040" opacity="0.10" />
      <g clipPath="url(#slab)">
        <rect x="90" y="200" width="420" height="260" fill={SLAB_DIRTY} />
        <ellipse cx="200" cy="300" rx="62" ry="28" fill="#B4BACB" opacity={0.9} />
        <ellipse cx="410" cy="390" rx="48" ry="20" fill="#B4BACB" opacity={0.9} />
        {specks.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#7F879C" opacity={0.75} />
        ))}
        {/* cleaned area trails the head */}
        <rect x={X} y="200" width={Math.max(0, 520 - X)} height="260" fill={SLAB} />
        {shine > 0 && shine < 1 && <rect x="90" y="200" width="420" height="260" fill="url(#slabShine)" />}
      </g>
      <rect x="90" y="200" width="420" height="260" rx="18" fill="none" stroke={INK} strokeWidth={STROKE} />
      {/* squeegee */}
      {l > 12 && l < 150 && (
        <g transform={`translate(${X} 0)`} opacity={prog(l, 12, 10) * (1 - prog(l, 132, 16))}>
          <line x1="0" y1="330" x2="120" y2="110" stroke={INK} strokeWidth={10} strokeLinecap="round" />
          <rect x="-14" y="190" width="28" height="280" rx="10" fill="#fff" stroke={INK} strokeWidth={STROKE} />
          <rect x="-14" y="190" width="10" height="280" rx="5" fill="#3D51C9" />
        </g>
      )}
      <Sparkle x={150} y={240} s={prog(l, 140, 26) * (1 - 0.3 * prog(l, 180, 40))} rot={l * 0.6} />
      <Sparkle x={455} y={300} s={0.75 * prog(l, 152, 26)} rot={-l * 0.5} />
      <Sparkle x={330} y={420} s={0.55 * prog(l, 164, 26)} rot={l * 0.4} />
    </svg>
  );
};
