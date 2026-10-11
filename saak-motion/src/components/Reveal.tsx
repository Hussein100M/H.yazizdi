import { FONT } from "../lib/theme";

/**
 * Text that rises out of (and back into) its own baseline mask — typography moves
 * as one designed object, never word-by-word.
 */
export const MaskLine: React.FC<{
  inP: number; // 0..1 arrival
  outP?: number; // 0..1 departure (rises up and away)
  children: React.ReactNode;
  style?: React.CSSProperties;
  pad?: number;
}> = ({ inP, outP = 0, children, style, pad = 0.28 }) => {
  const y = (1 - inP) * 105 - outP * 105;
  return (
    <div style={{ overflow: "hidden", padding: `${pad}em 0.2em`, margin: `-${pad}em -0.2em`, ...style }}>
      <div
        style={{
          transform: `translateY(${y}%)`,
          opacity: Math.min(1, inP * 1.4) * (1 - outP),
          fontFamily: FONT,
          direction: "rtl",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
    </div>
  );
};
