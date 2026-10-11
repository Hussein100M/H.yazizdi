import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LogoMark, Wordmark } from "../components/Logo";
import { MaskLine } from "../components/Reveal";
import { MARK } from "../lib/logoPaths";
import { ease, lerp, mixHex, prog } from "../lib/motion";
import { C, FONT } from "../lib/theme";
import { T } from "../lib/timeline";
import { bagMarkRect, INTRO_MARK } from "./geometry";

/**
 * 0.0–3.7 s. A single point of light traces the SAAK mark as a machined hairline,
 * the mark fills, the name arrives. Then the mark travels to — and becomes — the
 * mark printed on the first bag.
 */
export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  if (f > T.product1 + 60) return null;

  const draw = prog(f, 14, 84, ease.inOut);
  const strokeOpacity = prog(f, 12, 10) * (1 - prog(f, 104, 30, ease.soft));
  const fill = prog(f, 84, 44, ease.soft);
  const push = lerp(0.9, 1, prog(f, 0, 200, ease.out));

  // hand-off: mark travels to the printed logo on bag 1
  const hand = prog(f, 192, 46, ease.inOut);
  const target = bagMarkRect(0);
  const restW = INTRO_MARK.w * push;
  const restH = (restW * MARK.height) / MARK.width;
  const restX = INTRO_MARK.cx - restW / 2;
  const restY = INTRO_MARK.top + (INTRO_MARK.w - restW) * 0.5;
  const w = lerp(restW, target.w, hand);
  const x = lerp(restX, target.x, hand);
  const y = lerp(restY, target.y, hand);
  // the printed logo is slightly taller than the vector one (bag perspective)
  const sy = lerp(1, target.h / ((target.w * MARK.height) / MARK.width), hand);
  const color = mixHex("#FFFFFF", C.brand, prog(f, 230, 8, ease.soft));
  const markOpacity = 1 - prog(f, 236, 12, ease.soft);

  // glint riding the head of the hairline
  const glintOn = prog(f, 10, 8) * (1 - prog(f, 92, 22));
  const word = prog(f, 112, 44);
  const tag = prog(f, 132, 44);
  const sub = prog(f, 148, 44);
  const leave = prog(f, 184, 30, ease.in);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: 1 - prog(f, 0, 40, ease.soft) }} />
      <div style={{ position: "absolute", left: x, top: y, opacity: markOpacity, transform: `scaleY(${sy})`, transformOrigin: "0 0" }}>
        <LogoMark
          width={w}
          color={color}
          fill={fill}
          draw={draw}
          strokeOpacity={strokeOpacity}
          shine={lerp(-0.3, 1.3, prog(f, 118, 70, ease.inOut))}
        />
        {glintOn > 0 && <Glint progress={draw} opacity={glintOn} w={w} h={(w * MARK.height) / MARK.width} />}
      </div>
      <div
        style={{
          position: "absolute",
          top: restY + restH + 92,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 34,
        }}
      >
        <MaskLine inP={word} outP={leave}>
          <Wordmark width={500} />
        </MaskLine>
        <MaskLine inP={tag} outP={leave}>
          <div style={{ fontFamily: FONT, fontSize: 64, fontWeight: 600, color: C.text }}>حلول لصق احترافية</div>
        </MaskLine>
        <MaskLine inP={sub} outP={leave}>
          <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 400, color: C.muted }}>لكل أنواع البلاط</div>
        </MaskLine>
        <div
          style={{
            width: 72 * prog(f, 160, 40),
            height: 2,
            background: "rgba(160,175,255,0.7)",
            opacity: 1 - leave,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/** A soft point of light riding the head of the hairline as it draws. */
const Glint: React.FC<{ progress: number; opacity: number; w: number; h: number }> = ({ progress, opacity, w }) => {
  const path = useMemo(() => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
    el.setAttribute("d", MARK.d);
    svg.appendChild(el);
    svg.style.position = "absolute";
    svg.style.width = "0";
    svg.style.height = "0";
    document.body.appendChild(svg);
    return { el, total: el.getTotalLength() };
  }, []);
  const [vx, vy] = MARK.viewBox.split(" ").map(Number);
  const pt = path.el.getPointAtLength(progress * path.total);
  const k = w / MARK.width;
  const px = (pt.x - vx) * k;
  const py = (pt.y - vy) * k;
  return (
    <div
      style={{
        position: "absolute",
        left: px - 70,
        top: py - 70,
        width: 140,
        height: 140,
        opacity,
        background:
          "radial-gradient(closest-side, rgba(255,255,255,1) 0%, rgba(200,212,255,0.6) 14%, rgba(120,140,255,0) 100%)",
        mixBlendMode: "screen",
      }}
    />
  );
};
