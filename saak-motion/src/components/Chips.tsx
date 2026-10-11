import { C, FONT } from "../lib/theme";

export const Pill: React.FC<{
  children: React.ReactNode;
  color: string;
  size?: number;
  solid?: boolean;
  style?: React.CSSProperties;
}> = ({ children, color, size = 26, solid = false, style }) => (
  <div
    style={{
      fontFamily: FONT,
      direction: "rtl",
      fontSize: size,
      fontWeight: 600,
      lineHeight: 1,
      padding: `${size * 0.42}px ${size * 0.9}px`,
      borderRadius: 999,
      color: solid ? C.white : color,
      background: solid ? color : `${color}1F`,
      border: `1.5px solid ${solid ? "rgba(255,255,255,0.25)" : `${color}80`}`,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Check: React.FC<{ size: number; color: string; p?: number }> = ({ size, color, p = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="19" fill={color} />
    <path
      d="M12 20.5 L17.5 26 L28.5 14.5"
      fill="none"
      stroke="#fff"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={`${p} 1`}
    />
  </svg>
);
