import { ease, prog } from "../lib/motion";
import { INK, STROKE, TILE_A, TILE_B } from "./common";

const S = 104;
const G = 16;
const COLS = 4;
const ROWS = 2;
const W = COLS * S + (COLS - 1) * G;
const OX = (600 - W) / 2;
const OY = 300;

/** The clock runs a full day; only then do the joints fill with grout. */
export const StepGrout: React.FC<{ l: number }> = ({ l }) => {
  const day = prog(l, 8, 100, ease.inOut);
  const hand = day * 720;
  const R = 74;
  const arc = (p: number) => {
    const a = p * Math.PI * 2 - Math.PI / 2;
    return `M300 ${150 - R - 16} A${R + 16} ${R + 16} 0 ${p > 0.5 ? 1 : 0} 1 ${300 + (R + 16) * Math.cos(a)} ${150 + (R + 16) * Math.sin(a)}`;
  };
  const joints: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let c = 1; c < COLS; c++) {
    const x = OX + c * (S + G) - G / 2;
    joints.push({ x1: x, y1: OY - 4, x2: x, y2: OY + ROWS * S + G + 4 });
  }
  for (let r = 1; r < ROWS; r++) {
    const y = OY + r * (S + G) - G / 2;
    joints.push({ x1: W + OX + 4, y1: y, x2: OX - 4, y2: y });
  }
  const gloss = prog(l, 186, 46, ease.inOut);
  return (
    <svg width="600" height="600" viewBox="0 0 600 600">
      <defs>
        <linearGradient id="gloss" x1="0" x2="1" y1="0" y2="0.3">
          <stop offset={Math.max(0, gloss - 0.12)} stopColor="#fff" stopOpacity="0" />
          <stop offset={gloss} stopColor="#fff" stopOpacity="0.7" />
          <stop offset={Math.min(1, gloss + 0.12)} stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* clock */}
      <circle cx="300" cy="150" r={R} fill="#fff" stroke={INK} strokeWidth={STROKE} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r1 = R - 14;
        const r2 = R - (i % 3 === 0 ? 26 : 20);
        return (
          <line key={i} x1={300 + r1 * Math.sin(a)} y1={150 - r1 * Math.cos(a)} x2={300 + r2 * Math.sin(a)} y2={150 - r2 * Math.cos(a)} stroke={INK} strokeWidth={i % 3 === 0 ? 5 : 3} strokeLinecap="round" />
        );
      })}
      <line x1="300" y1="150" x2="300" y2={150 - R + 22} stroke={INK} strokeWidth={6} strokeLinecap="round" transform={`rotate(${hand} 300 150)`} />
      <line x1="300" y1="150" x2="300" y2={150 - R + 40} stroke={INK} strokeWidth={8} strokeLinecap="round" transform={`rotate(${hand / 12} 300 150)`} />
      <circle cx="300" cy="150" r="8" fill={INK} />
      {day > 0.001 && <path d={arc(Math.min(0.9999, day))} fill="none" stroke="#3D51C9" strokeWidth={6} strokeLinecap="round" />}
      {/* tiles on a dark bed: joints are empty until the day has passed */}
      <rect x={OX - 12} y={OY - 12} width={W + 24} height={ROWS * S + G + 24} rx="14" fill="#3B4372" stroke={INK} strokeWidth={STROKE} />
      {Array.from({ length: COLS * ROWS }, (_, k) => {
        const c = k % COLS;
        const r = Math.floor(k / COLS);
        return <rect key={k} x={OX + c * (S + G)} y={OY + r * (S + G)} width={S} height={S} rx="6" fill={(c + r) % 2 ? TILE_B : TILE_A} />;
      })}
      {joints.map((j, i) => {
        const p = prog(l, 104 + i * 9, 40, ease.inOut);
        return (
          <line key={i} {...j} stroke="#F3F5FA" strokeWidth={G - 2} strokeLinecap="butt" pathLength={1} strokeDasharray={`${p} 1`} />
        );
      })}
      {gloss > 0 && gloss < 1 && <rect x={OX} y={OY} width={W} height={ROWS * S + G} fill="url(#gloss)" />}
    </svg>
  );
};
