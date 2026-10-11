import { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { Atmosphere, Finish } from "./components/Atmosphere";
import { ease, mixHex, prog } from "./lib/motion";
import { PRODUCTS } from "./lib/theme";
import { T } from "./lib/timeline";
import { Intro } from "./scenes/Intro";
import { Outro } from "./scenes/Outro";
import { Products, shelfPos } from "./scenes/Products";
import { Steps } from "./scenes/Steps";

const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const weights = [300, 400, 500, 600, 700];
    Promise.all(
      weights.flatMap((w) => [
        document.fonts.load(`${w} 40px "IBM Plex Sans Arabic"`, "عربي"),
        document.fonts.load(`${w} 40px "IBM Plex Sans Arabic"`, "SAAK 0123"),
      ]),
    ).then(() => continueRender(handle));
  }, [handle]);
};

export const SaakAd: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();

  // environment state, driven by where we are in the film
  const pos = shelfPos(f);
  const i0 = Math.min(2, Math.floor(pos));
  const accentProduct = mixHex(PRODUCTS[i0].accent, PRODUCTS[Math.min(2, i0 + 1)].accent, pos - i0);
  const productLight = prog(f, T.product1 - 20, 70, ease.soft) * (1 - prog(f, T.howTo - 30, 60, ease.soft));
  const stepsLight = prog(f, T.step1 - 20, 60, ease.soft) * (1 - prog(f, T.outro - 20, 40, ease.soft));
  const outroLight = prog(f, T.outro + 20, 80, ease.soft);
  const accent = productLight > 0.01 ? accentProduct : stepsLight > 0.01 ? "#3D51C9" : "#3346B8";
  const accentStrength = Math.max(productLight, stepsLight * 0.8, outroLight * 0.9, prog(f, 40, 120, ease.soft) * (1 - prog(f, 200, 40)) * 0.6);
  const lightY =
    820 +
    60 * prog(f, T.product1 - 20, 60, ease.inOut) -
    100 * prog(f, T.howTo - 20, 80, ease.inOut) +
    160 * prog(f, T.outro, 90, ease.inOut);
  const floor =
    prog(f, T.product1, 60, ease.soft) * (1 - prog(f, T.howTo - 30, 50, ease.soft)) +
    prog(f, T.outro + 40, 60, ease.soft) * 0.8;
  const floorShift = pos * 820 * 0.6 + f * 0.15;

  return (
    <AbsoluteFill style={{ background: "#03051A" }}>
      <Atmosphere accent={accent} accentStrength={accentStrength} lightY={lightY} floor={floor} floorShift={floorShift} />
      <Products />
      <Intro />
      <Steps />
      <Outro />
      <Finish />
      {/* SFX-only soundtrack (client library) — built by scripts/cues.py + scripts/mix_sfx.py */}
      <Audio src={staticFile("sfx-mix.wav")} />
    </AbsoluteFill>
  );
};
