import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Bag } from "../components/Bag";
import { LogoMark, Wordmark } from "../components/Logo";
import { MaskLine } from "../components/Reveal";
import { ease, lerp, prog, settle } from "../lib/motion";
import { C, FONT, PRODUCTS } from "../lib/theme";
import { T } from "../lib/timeline";

const O = T.outro;

/**
 * 43.7–50 s. Darkness returns; the family of three rises into one composed object;
 * the mark, the line, the proof points and the number. The last second is still.
 */
export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  if (f < O - 10) return null;
  const mark = prog(f, O + 4, 50);
  const word = prog(f, O + 20, 44);
  const line = prog(f, O + 34, 46);
  const lineup = [
    { i: 1, x: -262, h: 500, top: 742, rot: 14, at: O + 52 },
    { i: 2, x: 262, h: 500, top: 742, rot: -14, at: O + 58 },
    { i: 0, x: 0, h: 590, top: 652, rot: 0, at: O + 44 },
  ];
  const chips = prog(f, O + 112, 44);
  const cta = settle(prog(f, O + 128, 50, (t) => t));
  const ctaShine = prog(f, O + 230, 70, ease.inOut);

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 132, width: "100%", display: "flex", justifyContent: "center" }}>
        <div style={{ transform: `scale(${lerp(0.86, 1, mark)})`, opacity: mark }}>
          <LogoMark width={164} shine={lerp(-0.3, 1.3, prog(f, O + 150, 70, ease.inOut))} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 340, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <MaskLine inP={word}>
          <Wordmark width={360} />
        </MaskLine>
        <MaskLine inP={line}>
          <div style={{ fontFamily: FONT, fontSize: 100, fontWeight: 700, color: C.white, lineHeight: 1.15 }}>ساك.. ثبات يدوم</div>
        </MaskLine>
      </div>

      {lineup.map(({ i, x, h, top, rot, at }) => {
        const p = prog(f, at, 64);
        const w = (h * PRODUCTS[i].size.w) / PRODUCTS[i].size.h;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 + x - w / 2,
              top,
              transform: `translateY(${(1 - p) * 220}px)`,
              opacity: Math.min(1, p * 1.6),
            }}
          >
            <Bag product={PRODUCTS[i]} height={h} rotY={rot} rim={0.7} reflection={0.8} shade={i === 0 ? 1 : 1.4}
              shine={i === 0 ? lerp(-0.4, 1.4, prog(f, O + 120, 90, ease.inOut)) : -1} />
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          top: 1346,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: 22,
          direction: "rtl",
          opacity: chips,
          transform: `translateY(${(1 - chips) * 20}px)`,
        }}
      >
        {["صناعة سعودية", "حاصل على شهادات الأيزو"].map((t) => (
          <div
            key={t}
            style={{
              fontFamily: FONT,
              fontSize: 32,
              fontWeight: 500,
              color: C.text,
              padding: "14px 30px",
              borderRadius: 999,
              border: "1.5px solid rgba(170,185,255,0.35)",
              background: "rgba(20,28,80,0.35)",
            }}
          >
            {t}
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", top: 1460, width: "100%", display: "flex", justifyContent: "center" }}>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            direction: "rtl",
            display: "flex",
            alignItems: "center",
            gap: 26,
            padding: "18px 22px 18px 44px",
            borderRadius: 999,
            background: "linear-gradient(180deg, #FFFFFF 0%, #E9ECF6 100%)",
            boxShadow: "0 24px 60px rgba(0,0,20,0.5), 0 0 0 1px rgba(255,255,255,0.6) inset",
            transform: `scale(${0.92 + 0.08 * cta})`,
            opacity: Math.min(1, cta * 2),
          }}
        >
          <div style={{ width: 86, height: 86, borderRadius: "50%", background: C.brand, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="40" height="40" viewBox="0 0 24 24">
              <path
                fill="#fff"
                d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"
              />
            </svg>
          </div>
          <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 600, color: C.brand }}>اتصل بنا</div>
          <div style={{ fontFamily: FONT, direction: "ltr", fontSize: 68, fontWeight: 700, color: "#0B1138", letterSpacing: "0.01em", fontVariantNumeric: "tabular-nums" }}>
            920008148
          </div>
          {ctaShine > 0 && ctaShine < 1 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(105deg, transparent ${ctaShine * 140 - 30}%, rgba(255,255,255,0.9) ${ctaShine * 140 - 20}%, transparent ${ctaShine * 140 - 10}%)`,
                mixBlendMode: "overlay",
              }}
            />
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
