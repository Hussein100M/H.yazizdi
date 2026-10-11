import { MARK, WORDMARK } from "../lib/logoPaths";

type MarkProps = {
  width: number;
  color?: string;
  fill?: number; // 0..1 fill opacity
  draw?: number; // 0..1 outline draw-on progress
  strokeOpacity?: number;
  shine?: number; // -1..2 position of a specular band across the mark (outside 0..1 = hidden)
  style?: React.CSSProperties;
};

/** The traced SAAK mark. Can be drawn on as a hairline, then filled. */
export const LogoMark: React.FC<MarkProps> = ({
  width,
  color = "#FFFFFF",
  fill = 1,
  draw = 1,
  strokeOpacity = 0,
  shine = -1,
  style,
}) => {
  const height = (width * MARK.height) / MARK.width;
  const id = `shine-${Math.round(width)}`;
  const [vx, vy, vw, vh] = MARK.viewBox.split(" ").map(Number);
  const band = shine * (vw + vh * 0.6) + vx - vh * 0.3;
  return (
    <svg width={width} height={height} viewBox={MARK.viewBox} style={{ overflow: "visible", ...style }}>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={band - 260} y1={vy} x2={band + 260} y2={vy + vh * 0.35}>
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={MARK.d} fillRule="evenodd" />
        </clipPath>
      </defs>
      <path d={MARK.d} fill={color} fillOpacity={fill} fillRule="evenodd" />
      {strokeOpacity > 0 && (
        <path
          d={MARK.d}
          fill="none"
          stroke={color}
          strokeWidth={9}
          strokeOpacity={strokeOpacity}
          pathLength={1}
          strokeDasharray={`${draw} 1`}
          strokeLinejoin="round"
        />
      )}
      {shine > -0.2 && shine < 1.2 && (
        <rect x={vx} y={vy} width={vw} height={vh} fill={`url(#${id})`} clipPath={`url(#${id}-clip)`} style={{ mixBlendMode: "overlay" }} />
      )}
    </svg>
  );
};

export const Wordmark: React.FC<{ width: number; color?: string; style?: React.CSSProperties }> = ({
  width,
  color = "#FFFFFF",
  style,
}) => {
  const height = (width * WORDMARK.height) / WORDMARK.width;
  return (
    <svg width={width} height={height} viewBox={WORDMARK.viewBox} style={style}>
      <path d={WORDMARK.d} fill={color} fillRule="evenodd" />
    </svg>
  );
};
