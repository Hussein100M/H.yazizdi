import { Img, staticFile } from "remotion";
import type { Product } from "../lib/theme";

type Props = {
  product: Product;
  height: number;
  shine?: number; // position of the specular band, 0..1 sweeps across; outside = hidden
  rotY?: number; // degrees, subtle turn of the object
  reflection?: number; // 0..1 floor reflection strength
  rim?: number; // 0..1 accent rim light
  shade?: number; // 0..1 how much to settle the photo into the dark set
  style?: React.CSSProperties;
};

/**
 * The real product photo (cut out of the source ad), lit like a physical object:
 * contact shadow, floor reflection, accent rim and one specular pass.
 */
export const Bag: React.FC<Props> = ({
  product,
  height,
  shine = -1,
  rotY = 0,
  reflection = 1,
  rim = 1,
  shade = 1,
  style,
}) => {
  const src = staticFile(`bag-${product.key}.png`);
  const width = (height * product.size.w) / product.size.h;
  const mask: React.CSSProperties = {
    WebkitMaskImage: `url(${src})`,
    WebkitMaskSize: "100% 100%",
    maskImage: `url(${src})`,
    maskSize: "100% 100%",
  };
  const bandX = -60 + shine * 220; // %
  return (
    <div style={{ position: "relative", width, height, ...style }}>
      {/* contact shadow */}
      <div
        style={{
          position: "absolute",
          left: "8%",
          right: "4%",
          bottom: -height * 0.035,
          height: height * 0.07,
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(0,0,10,0.85), rgba(0,0,10,0))",
        }}
      />
      {/* floor reflection */}
      {reflection > 0 && (
        <Img
          src={src}
          style={{
            position: "absolute",
            top: height - 4,
            left: 0,
            width,
            height,
            transform: `perspective(1600px) rotateY(${rotY}deg) scaleY(-1)`,
            opacity: 0.16 * reflection,
            WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 32%)",
            maskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 32%)",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `perspective(1600px) rotateY(${rotY}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <Img
          src={src}
          style={{
            width,
            height,
            filter: `drop-shadow(0 0 ${height * 0.04}px ${product.accent}${Math.round(rim * 70)
              .toString(16)
              .padStart(2, "0")})`,
          }}
        />
        {/* settle the bright studio photo into the dark set: gentle top-to-bottom falloff */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            ...mask,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.0) 0%, rgba(20,28,80,0.10) 55%, rgba(8,12,46,0.38) 100%)",
            opacity: shade,
            mixBlendMode: "multiply",
          }}
        />
        {/* edge light from the left (key light side) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            ...mask,
            background: `linear-gradient(100deg, ${product.accentLight}55 0%, transparent 22%, transparent 80%, rgba(255,255,255,0.18) 100%)`,
            mixBlendMode: "screen",
            opacity: rim,
          }}
        />
        {shine > -0.3 && shine < 1.3 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              ...mask,
              background: `linear-gradient(105deg, transparent ${bandX}%, rgba(255,255,255,0.55) ${bandX + 9}%, transparent ${bandX + 18}%)`,
              mixBlendMode: "soft-light",
            }}
          />
        )}
      </div>
    </div>
  );
};
