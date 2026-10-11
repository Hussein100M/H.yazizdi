import { ease, lerp, mixHex, prog } from "../lib/motion";
import { INK, MORTAR, STROKE, WATER } from "./common";

/** Water fills to the mark, the paddle drops in and the mix turns to mortar. */
export const StepMix: React.FC<{ l: number }> = ({ l }) => {
  const level = lerp(470, 262, prog(l, 14, 70, ease.out));
  const color = mixHex(WATER, MORTAR, prog(l, 110, 80, ease.inOut));
  const rodY = lerp(-260, 0, prog(l, 70, 36, ease.out));
  const spin = l > 100 ? (l - 100) * 0.42 : 0;
  const wave = (x: number) => Math.sin(x / 26 + l / 6) * (l > 100 ? 7 : 3);
  const surface = Array.from({ length: 23 }, (_, i) => {
    const x = 130 + i * 15;
    return `${i === 0 ? "M" : "L"}${x} ${level + wave(x)}`;
  }).join(" ");
  const bucket = "M140 190 L460 190 L432 455 Q430 478 406 478 L194 478 Q170 478 168 455 Z";
  return (
    <svg width="600" height="600" viewBox="0 0 600 600">
      <defs>
        <clipPath id="bucketIn">
          <path d={bucket} />
        </clipPath>
      </defs>
      <ellipse cx="300" cy="500" rx="190" ry="14" fill="#0A1040" opacity="0.10" />
      <path d="M150 196 Q300 60 450 196" fill="none" stroke={INK} strokeWidth={STROKE - 1} strokeLinecap="round" />
      <path d={bucket} fill="#F7F8FC" />
      <clipPath id="aboveSurface">
        <rect x="0" y="-400" width="600" height={level + 400} />
      </clipPath>
      {/* paddles sit under the surface, seen through the mix */}
      <g clipPath="url(#bucketIn)">
        <g transform={`translate(0 ${rodY})`}>
          <rect x="292" y="300" width="16" height="130" rx="6" fill={INK} />
          <ellipse cx="300" cy="420" rx={Math.abs(Math.cos(spin)) * 70 + 8} ry="16" fill="none" stroke={INK} strokeWidth={STROKE} />
          <ellipse cx="300" cy="380" rx={Math.abs(Math.sin(spin)) * 62 + 8} ry="14" fill="none" stroke={INK} strokeWidth={STROKE} />
        </g>
        <path d={`${surface} L470 600 L130 600 Z`} fill={color} opacity={0.88} />
        <path d={surface} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="4" />
      </g>
      {/* measuring ticks */}
      {[300, 262, 340].map((y, i) => (
        <line key={i} x1="164" y1={y} x2={i === 1 ? 196 : 184} y2={y} stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
      ))}
      <g clipPath="url(#aboveSurface)">
        <rect x="292" y={-200 + rodY} width="16" height="640" rx="6" fill={INK} />
      </g>
      <path d={bucket} fill="none" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <rect x="128" y="180" width="344" height="20" rx="10" fill="#fff" stroke={INK} strokeWidth={STROKE} />
    </svg>
  );
};
