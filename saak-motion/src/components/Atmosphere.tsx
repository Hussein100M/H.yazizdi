import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../lib/theme";

type Props = {
  accent: string; // rgb()/hex colour of the current product light
  accentStrength: number; // 0..1
  lightY: number; // vertical centre of the key light, px
  floor: number; // 0..1 visibility of the tile-joint floor
  floorShift: number; // px, lateral drift of the floor (camera track)
};

/**
 * The single, persistent environment of the film: ink-navy falloff, one soft key
 * light, a faint accent bloom behind the hero object and a perspective floor of
 * tile joints (the product's own world: tiles, joints, precision).
 */
export const Atmosphere: React.FC<Props> = ({ accent, accentStrength, lightY, floor, floorShift }) => {
  const frame = useCurrentFrame();
  const breathe = Math.sin(frame / 95) * 0.04;
  return (
    <AbsoluteFill style={{ background: C.ink0, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 70% at 50% ${lightY}px, ${C.ink2} 0%, ${C.ink1} 42%, ${C.ink0} 78%)`,
        }}
      />
      {/* accent bloom */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(46% 26% at 50% ${lightY + 40}px, ${accent} 0%, transparent 70%)`,
          opacity: accentStrength * (0.34 + breathe),
          mixBlendMode: "screen",
        }}
      />
      {/* perspective floor of tile joints */}
      <div
        style={{
          position: "absolute",
          left: -1400,
          right: -1400,
          top: 1244,
          height: 1500,
          transformOrigin: "50% 0%",
          transform: `perspective(900px) rotateX(74deg)`,
          backgroundImage: `linear-gradient(rgba(170,185,255,0.16) 2px, transparent 2px), linear-gradient(90deg, rgba(170,185,255,0.16) 2px, transparent 2px)`,
          backgroundSize: "160px 160px",
          backgroundPosition: `${floorShift}px 0px`,
          opacity: floor,
          WebkitMaskImage: "radial-gradient(34% 42% at 50% 30%, #000 0%, rgba(0,0,0,0.5) 45%, transparent 100%)",
          maskImage: "radial-gradient(34% 42% at 50% 30%, #000 0%, rgba(0,0,0,0.5) 45%, transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Vignette + deterministic film grain. Sits above everything. */
export const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = frame % 7; // cycles a few noise fields; deterministic per frame
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: "radial-gradient(85% 60% at 50% 45%, transparent 55%, rgba(0,0,8,0.55) 100%)",
        }}
      />
      <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.06, mixBlendMode: "overlay" }}>
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
