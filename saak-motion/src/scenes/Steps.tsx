import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Pill } from "../components/Chips";
import { MaskLine } from "../components/Reveal";
import { StepApply } from "../illustrations/StepApply";
import { StepClean } from "../illustrations/StepClean";
import { StepCover } from "../illustrations/StepCover";
import { StepGrout } from "../illustrations/StepGrout";
import { StepMix } from "../illustrations/StepMix";
import { ease, lerp, prog, settle } from "../lib/motion";
import { C, FONT, STEPS, toArabic } from "../lib/theme";
import { T } from "../lib/timeline";

const STARTS = [T.step1, T.step2, T.step3, T.step4, T.step5];
const ILLUSTRATIONS = [StepClean, StepMix, StepApply, StepCover, StepGrout];
const STEP_LEN = T.step2 - T.step1;
const CARD = 760;
const CARD_TOP = 400;
const STEP_ACCENT = "#9DB0FF";

/**
 * 21.7–43.7 s. "How to use" resolves into a five-node rail; the rail rises to the top
 * and a single porcelain tile becomes the stage for all five steps.
 */
export const Steps: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.howTo - 10 || f > T.outro + 50) return null;

  // ---- How-to title card
  const hIn = prog(f, T.howTo + 4, 46);
  const hOut = prog(f, T.step1 - 26, 30, ease.in);

  // ---- rail: appears under the title, then rises to the top as the steps begin
  const railRise = prog(f, T.step1 - 24, 56, ease.inOut);
  const railY = lerp(1210, 236, railRise);
  const railScale = lerp(1.12, 1, railRise);
  const leave = prog(f, T.outro - 30, 40, ease.in);

  // ---- card (a porcelain tile) lands
  const cardIn = prog(f, T.step1 - 4, 60, ease.out);
  const cardY = lerp(1300, 0, cardIn) + leave * 260;
  const cardScale = lerp(0.9, 1, cardIn) - leave * 0.08;

  return (
    <AbsoluteFill>
      {f < T.step1 + 10 && (
        <div style={{ position: "absolute", top: 700, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          <MaskLine inP={hIn} outP={hOut}>
            <div style={{ fontFamily: FONT, fontSize: 116, fontWeight: 700, color: C.white }}>طريقة الاستخدام</div>
          </MaskLine>
          <MaskLine inP={prog(f, T.howTo + 14, 46)} outP={prog(f, T.step1 - 30, 30, ease.in)}>
            <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 400, color: C.muted }}>٥ خطوات سهلة لنتيجة احترافية</div>
          </MaskLine>
        </div>
      )}

      <Rail f={f} y={railY} scale={railScale} opacity={1 - leave} />

      {/* the tile */}
      {cardIn > 0 && (
        <div
          style={{
            position: "absolute",
            left: (1080 - CARD) / 2,
            top: CARD_TOP,
            width: CARD,
            height: CARD,
            borderRadius: 56,
            transform: `translateY(${cardY}px) scale(${cardScale})`,
            opacity: 1 - leave,
            background: "linear-gradient(160deg, #FFFFFF 0%, #F1F3F9 45%, #E2E6F0 100%)",
            boxShadow:
              "0 2px 0 rgba(255,255,255,0.9) inset, 0 -3px 0 rgba(20,30,90,0.10) inset, 0 70px 120px rgba(0,0,12,0.55), 0 20px 40px rgba(0,0,20,0.35)",
            overflow: "hidden",
          }}
        >
          {STARTS.map((s, k) => {
            const Ill = ILLUSTRATIONS[k];
            const a = k === 0 ? prog(f, s + 10, 40) : prog(f, s - 4, 40);
            const out = k === 4 ? 0 : prog(f, s + STEP_LEN - 20, 26, ease.in);
            if (a <= 0 || out >= 1) return null;
            return (
              <div
                key={k}
                style={{
                  position: "absolute",
                  left: (CARD - 600) / 2,
                  top: (CARD - 600) / 2,
                  opacity: a * (1 - out),
                  transform: `translateX(${(1 - a) * -90 + out * 90}px)`,
                }}
              >
                <Ill l={f - s} />
              </div>
            );
          })}
        </div>
      )}

      {STARTS.map((s, k) => {
        const e = s + STEP_LEN;
        if (f < s - 4 || f > e + 40) return null;
        const base = k === 0 ? s + 16 : s + 2;
        const outBase = k === 4 ? T.outro - 26 : e - 22;
        const spec = settle(prog(f, base + 30, 40, (t) => t));
        return (
          <div key={k} style={{ position: "absolute", top: 1224, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <MaskLine inP={prog(f, base, 40)} outP={prog(f, outBase, 24, ease.in)}>
              <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 600, color: STEP_ACCENT }}>{`الخطوة ${toArabic(k + 1)}`}</div>
            </MaskLine>
            <MaskLine inP={prog(f, base + 5, 44)} outP={prog(f, outBase + 3, 24, ease.in)} style={{ marginTop: 18 }}>
              <div style={{ fontFamily: FONT, fontSize: 92, fontWeight: 700, color: C.white, lineHeight: 1.15 }}>{STEPS[k].title}</div>
            </MaskLine>
            <MaskLine inP={prog(f, base + 11, 44)} outP={prog(f, outBase + 6, 24, ease.in)} style={{ marginTop: 14 }}>
              <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 400, color: C.muted }}>{STEPS[k].body}</div>
            </MaskLine>
            <div
              style={{
                marginTop: 44,
                transform: `scale(${0.9 + 0.1 * spec}) translateY(${prog(f, outBase + 8, 24, ease.in) * -20}px)`,
                opacity: Math.min(1, spec * 2) * (1 - prog(f, outBase + 8, 20, ease.in)),
              }}
            >
              <Pill color={STEP_ACCENT} size={34}>
                {STEPS[k].spec}
              </Pill>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Five nodes, right-to-left. A light line fills from node to node as steps complete. */
const Rail: React.FC<{ f: number; y: number; scale: number; opacity: number }> = ({ f, y, scale, opacity }) => {
  const GAP = 140;
  const N = 5;
  const x = (k: number) => 540 + ((N - 1) / 2) * GAP - k * GAP;
  const appear = (k: number) => prog(f, T.howTo + 40 + k * 7, 36);
  const active = (k: number) => prog(f, STARTS[k] - 6, 24);
  const done = (k: number) => (k < 4 ? prog(f, STARTS[k + 1] - 8, 22) : 0);
  const seg = (k: number) => (k < 4 ? prog(f, STARTS[k + 1] - 22, 30, ease.inOut) : 0);
  if (opacity <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity }}>
      <div style={{ position: "absolute", left: 0, top: y, width: 1080, transform: `scale(${scale})`, transformOrigin: "50% 0" }}>
        {/* base hairline */}
        <div
          style={{
            position: "absolute",
            top: -1,
            left: x(4),
            width: (x(0) - x(4)) * prog(f, T.howTo + 36, 50, ease.inOut),
            height: 2,
            background: "rgba(160,175,255,0.22)",
            marginLeft: (x(0) - x(4)) * (1 - prog(f, T.howTo + 36, 50, ease.inOut)),
          }}
        />
        {Array.from({ length: 4 }, (_, k) => (
          <div
            key={k}
            style={{
              position: "absolute",
              top: -1.5,
              left: x(k) - GAP * seg(k),
              width: GAP * seg(k),
              height: 3,
              background: "#9DB0FF",
              boxShadow: "0 0 12px rgba(157,176,255,0.8)",
            }}
          />
        ))}
        {Array.from({ length: N }, (_, k) => {
          const a = active(k);
          const d = done(k);
          const ap = settle(appear(k));
          const size = 54 + a * 10 - d * 10;
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: x(k) - size / 2,
                top: -size / 2,
                width: size,
                height: size,
                borderRadius: "50%",
                transform: `scale(${ap})`,
                opacity: Math.min(1, ap * 1.5),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT,
                fontSize: 26,
                fontWeight: 600,
                background: d > 0.5 ? "#3D51C9" : a > 0.5 ? "#FFFFFF" : "#0B1138",
                color: d > 0.5 ? "#FFFFFF" : a > 0.5 ? C.brand : C.muted,
                border: `2px solid ${a > 0.5 && d < 0.5 ? "#FFFFFF" : "rgba(160,175,255,0.4)"}`,
                boxShadow: a > 0.5 && d < 0.5 ? `0 0 0 ${10 * a}px rgba(157,176,255,0.14), 0 0 30px rgba(157,176,255,0.45)` : "none",
              }}
            >
              {toArabic(k + 1)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
