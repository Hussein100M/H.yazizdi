import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Bag } from "../components/Bag";
import { Check, Pill } from "../components/Chips";
import { MaskLine } from "../components/Reveal";
import { ease, lerp, prog, settle } from "../lib/motion";
import { C, FONT, PRODUCTS } from "../lib/theme";
import { T } from "../lib/timeline";
import { BAG_H, BAG_TOP, bagMarkRect, bagWidth, CX } from "./geometry";

const STARTS = [T.product1, T.product2, T.product3];
const ENDS = [T.product2, T.product3, T.howTo];
const TRACK = 820; // px between bags on the shelf

/** Camera position along the shelf: 0 = bag 1, 1 = bag 2, 2 = bag 3. */
export const shelfPos = (f: number) =>
  prog(f, T.product2 - 20, 44, ease.inOut) + prog(f, T.product3 - 20, 44, ease.inOut);

/**
 * 3.7–21.7 s. One continuous shelf. The camera tracks right-to-left from product to
 * product; each bag is lit as a physical object; copy is a title, one Latin line and
 * three precise rows.
 */
export const Products: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.product1 - 40 || f > T.howTo + 40) return null;
  const pos = shelfPos(f);
  // exit into "how to": the last bag lowers out of frame
  const exit = prog(f, T.howTo - 36, 50, ease.in);

  return (
    <AbsoluteFill>
      {PRODUCTS.map((p, i) => {
        const d = i - pos;
        if (Math.abs(d) > 1.3) return null;
        const w = bagWidth(i);
        const local = f - STARTS[i];
        const idle = Math.sin((f - T.product1) / 70) * 6;
        const turn = Math.sin((f - T.product1) / 110) * 2.5;
        const scale = 1 - Math.min(1, Math.abs(d)) * 0.14 - exit * 0.12;
        const opacity = Math.max(0, 1 - Math.abs(d) * 1.1) * (1 - exit);
        const reveal = i === 0 ? prog(f, 230, 48, ease.inOut) : 1;
        if (reveal <= 0) return null;
        // hexagon iris from the printed mark — the intro logo "opens" into the bag
        const m = bagMarkRect(0);
        // the iris starts exactly as the mark's own hexagonal silhouette
        const r = lerp(m.h * 0.5, 1300, reveal);
        const cx = m.x + m.w / 2 - (CX - w / 2);
        const cy = m.y + m.h * 0.5 - BAG_TOP;
        const hex = Array.from({ length: 6 }, (_, k) => {
          const a = (Math.PI / 3) * k - Math.PI / 2;
          return `${cx + r * Math.cos(a)}px ${cy + r * Math.sin(a)}px`;
        }).join(", ");
        const chip = settle(prog(f, STARTS[i] + 70, 40, (t) => t));
        const weight = settle(prog(f, STARTS[i] + 82, 40, (t) => t));
        return (
          <div
            key={p.key}
            style={{
              position: "absolute",
              left: CX - w / 2,
              top: BAG_TOP,
              width: w,
              height: BAG_H,
              transform: `translateX(${-d * TRACK}px) translateY(${(i === 0 && f < T.product1 + 60 ? 0 : idle) + exit * 300}px) scale(${scale})`,
              transformOrigin: "50% 100%",
              opacity,
              clipPath: i === 0 && reveal < 1 ? `polygon(${hex})` : undefined,
            }}
          >
            <Bag
              product={p}
              height={BAG_H}
              rotY={turn - d * 22}
              shine={lerp(-0.4, 1.4, prog(local, 40, 110, ease.inOut))}
              rim={0.9}
            />
            {p.classCode && (
              <Pill
                color={p.accent}
                solid
                size={30}
                style={{
                  position: "absolute",
                  left: -36,
                  top: 92,
                  fontFamily: FONT,
                  direction: "ltr",
                  letterSpacing: "0.04em",
                  transform: `scale(${chip})`,
                  transformOrigin: "100% 50%",
                  opacity: Math.min(1, chip * 2),
                  boxShadow: `0 10px 30px ${p.accent}66`,
                }}
              >
                {p.classCode}
              </Pill>
            )}
            <Pill
              color={p.accentLight}
              size={28}
              style={{
                position: "absolute",
                right: -40,
                bottom: 120,
                background: "rgba(10,14,48,0.72)",
                transform: `scale(${weight})`,
                transformOrigin: "0% 50%",
                opacity: Math.min(1, weight * 2),
              }}
            >
              ٢٠ كجم
            </Pill>
          </div>
        );
      })}

      {PRODUCTS.map((p, i) => {
        const s = STARTS[i] + (i === 0 ? 40 : 4);
        const e = ENDS[i];
        if (f < s - 2 || f > e + 30) return null;
        const outP = prog(f, e - 24, 26, ease.in);
        return (
          <div key={p.key} style={{ position: "absolute", top: 178, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <MaskLine inP={prog(f, s, 40)} outP={outP}>
              <Pill color={p.accentLight} size={26}>
                {`المنتج ${p.index}`}
              </Pill>
            </MaskLine>
            <MaskLine inP={prog(f, s + 6, 46)} outP={prog(f, e - 20, 26, ease.in)} style={{ marginTop: 26 }}>
              <div style={{ fontFamily: FONT, fontSize: 84, fontWeight: 700, color: C.white, lineHeight: 1.15 }}>{p.title}</div>
            </MaskLine>
            <MaskLine inP={prog(f, s + 14, 46)} outP={prog(f, e - 16, 26, ease.in)} style={{ marginTop: 18 }}>
              <div
                style={{
                  fontFamily: FONT,
                  direction: "ltr",
                  fontSize: 25,
                  fontWeight: 500,
                  letterSpacing: "0.34em",
                  textTransform: "uppercase",
                  color: C.muted,
                }}
              >
                {p.latin}
              </div>
            </MaskLine>
          </div>
        );
      })}

      {PRODUCTS.map((p, i) => {
        const s = STARTS[i] + 96;
        const e = ENDS[i];
        if (f < s - 2 || f > e + 30) return null;
        return (
          <div key={p.key} style={{ position: "absolute", top: 1376, left: 150, right: 150, direction: "rtl" }}>
            {p.features.map((txt, k) => {
              const a = prog(f, s + k * 30, 44);
              const out = prog(f, e - 22 + k * 3, 24, ease.in);
              return (
                <div
                  key={txt}
                  style={{
                    position: "relative",
                    height: 96,
                    display: "flex",
                    alignItems: "center",
                    gap: 26,
                    opacity: a * (1 - out),
                    transform: `translateY(${(1 - a) * 26 - out * 18}px)`,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      height: 1.5,
                      width: `${a * 100}%`,
                      background: C.hairline,
                    }}
                  />
                  <Check size={40} color={p.accent} p={prog(f, s + k * 30 + 10, 26)} />
                  <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 500, color: C.text }}>{txt}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
