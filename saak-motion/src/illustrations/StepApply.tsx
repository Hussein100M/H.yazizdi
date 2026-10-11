import { ease, lerp, prog } from "../lib/motion";
import { INK, MORTAR, SLAB, STROKE } from "./common";

/** A notched trowel combs the adhesive into even ridges; the thickness is called out. */
export const StepApply: React.FC<{ l: number }> = ({ l }) => {
  const X = lerp(540, 70, prog(l, 18, 130, ease.inOut));
  const ridges = Array.from({ length: 7 }, (_, i) => 196 + i * 38);
  const dim = prog(l, 150, 36);
  const teeth = ridges.map((y) => `L${-4} ${y - 6} L${-22} ${y + 6} L${-4} ${y + 18}`).join(" ");
  return (
    <svg width="600" height="600" viewBox="0 0 600 600">
      <defs>
        <clipPath id="combed">
          <rect x={X} y="0" width={600} height="600" />
        </clipPath>
      </defs>
      <ellipse cx="300" cy="494" rx="230" ry="14" fill="#0A1040" opacity="0.10" />
      <rect x="80" y="170" width="440" height="300" rx="18" fill={SLAB} />
      <g clipPath="url(#combed)">
        {ridges.map((y) => (
          <g key={y}>
            <rect x="96" y={y} width="408" height="22" rx="11" fill={MORTAR} />
            <rect x="104" y={y + 3} width="392" height="5" rx="2.5" fill="#fff" opacity="0.55" />
          </g>
        ))}
      </g>
      <rect x="80" y="170" width="440" height="300" rx="18" fill="none" stroke={INK} strokeWidth={STROKE} />
      {/* notched trowel */}
      {l > 8 && l < 168 && (
        <g transform={`translate(${X} 0)`} opacity={prog(l, 8, 10) * (1 - prog(l, 150, 16))}>
          <path d={`M-4 150 ${teeth} L-4 490 L60 490 L60 150 Z`} fill="#fff" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
          <path d="M28 150 L28 108 L96 108" fill="none" stroke={INK} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
          <rect x="90" y="84" width="130" height="48" rx="24" fill="#3D51C9" stroke={INK} strokeWidth={STROKE} />
        </g>
      )}
      {/* thickness call-out */}
      <g opacity={dim} transform={`translate(${(1 - dim) * 12} 0)`}>
        <line x1="540" y1="196" x2="540" y2="218" stroke="#3D51C9" strokeWidth="4" />
        <line x1="530" y1="196" x2="550" y2="196" stroke="#3D51C9" strokeWidth="4" strokeLinecap="round" />
        <line x1="530" y1="218" x2="550" y2="218" stroke="#3D51C9" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
};
