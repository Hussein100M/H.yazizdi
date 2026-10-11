// Usage: node scripts/stills.mjs out/frames 0.0 1.0 2.5 ...   (times in seconds)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [outDir, ...times] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "SaakAd", browserExecutable });
for (const t of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(parseFloat(t) * composition.fps));
  const output = path.join(outDir, `t${parseFloat(t).toFixed(2)}.png`);
  await renderStill({ serveUrl, composition, frame, output, browserExecutable, imageFormat: "png" });
  console.log(output);
}
