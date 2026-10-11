import "./fonts.css";
import { Composition } from "remotion";
import { SaakAd } from "./SaakAd";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./lib/timeline";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="SaakAd"
    component={SaakAd}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
