import { prog, settle } from "../lib/motion";
import { toArabic } from "../lib/theme";
import { INK, STROKE, TILE_A, TILE_B } from "./common";

const COLS = 5;
const ROWS = 4;
const S = 80;
const G = 10;
const W = COLS * S + (COLS - 1) * G;
const OX = (600 - W) / 2;
const OY = 132;

/** Tiles land one by one (right-to-left, top-to-bottom); the covered area counts up to 5 m². */
export const StepCover: React.FC<{ l: number }> = ({ l }) => {
  const n = COLS * ROWS;
  const placed = Array.from({ length: n }, (_, k) => prog(l, 14 + k * 6.5, 30, (t) => t));
  const count = placed.reduce((a, p) => a + (p > 0.5 ? 1 : 0), 0);
  const area = (count / n) * 5;
  const label = `${toArabic(Math.floor(area))}٫${toArabic(Math.round((area % 1) * 10) % 10)}`;
  return (
    <svg width="600" height="600" viewBox="0 0 600 600">
      <rect
        x={OX - 14}
        y={OY - 14}
        width={W + 28}
        height={ROWS * S + (ROWS - 1) * G + 28}
        rx="16"
        fill="#E4E8F1"
        stroke={INK}
        strokeWidth={STROKE}
      />
      {placed.map((p, k) => {
        if (p <= 0) return null;
        const col = k % COLS;
        const row = Math.floor(k / COLS);
        const x = OX + W - S - col * (S + G); // RTL fill
        const y = OY + row * (S + G);
        const sc = 0.82 + 0.18 * settle(p);
        return (
          <g key={k} opacity={Math.min(1, p * 2.2)} transform={`translate(${x + S / 2} ${y + S / 2 - (1 - p) * 18}) scale(${sc})`}>
            <rect x={-S / 2} y={-S / 2} width={S} height={S} rx="7" fill={(row + col) % 2 ? TILE_B : TILE_A} />
            <rect x={-S / 2 + 6} y={-S / 2 + 6} width={S - 12} height="5" rx="2.5" fill="#fff" opacity="0.6" />
          </g>
        );
      })}
      <g transform="translate(300 574)">
        <text
          textAnchor="middle"
          direction="rtl"
          fontFamily="IBM Plex Sans Arabic"
          fontWeight={700}
          fontSize="54"
          fill={INK}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {`${label} م²`}
        </text>
      </g>
    </svg>
  );
};
