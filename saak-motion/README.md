# SAAK — premium 9:16 ad (Remotion)

A ground-up motion rebuild of `SAAK_Ad_50s_1080x1920.mp4`: same content, same music, same
50 s length, now one continuous film with a single lighting world and object-driven transitions.

- Format: 1080 × 1920 (9:16), 60 fps, H.264 + AAC, 50.0 s (3000 frames)
- Output: `out/saak-ad-9x16.mp4`, poster `out/poster.png`, contact sheet `out/contact-sheet.png`

## Storyboard

Timings are locked to the phrase hits of the original 120 BPM music bed (t = 0.21 + 0.5k s).

| Time | Visual | Transition logic | Copy |
|---|---|---|---|
| 0.00–1.6 | Black opens to deep ink navy. A single point of light traces the SAAK mark as a hairline, then the mark fills and a specular band passes over it. | — | — |
| 1.9–3.2 | Wordmark, line and sub-line rise from their own baselines. | Typography moves as one object per line. | SAAK ساك · حلول لصق احترافية · لكل أنواع البلاط |
| 3.2–4.6 | The mark travels and lands exactly on the logo printed on the first bag. A hexagonal iris (the mark's own silhouette) opens the bag around it. | Shared element: logo → printed logo. | — |
| 3.7–9.7 | Ceramic Premium Fix: hero bag on a dark set with a contact shadow, a floor reflection, a purple key light and one specular pass. Three precise rows land on the beat. | — | المنتج ١ · غراء السيراميك الممتاز · 3 features |
| 9.7–15.7 | Porcelain Premium Fix (teal light, C2TE badge). | Camera tracks along one shelf (right to left). The light colour hands over with the move. | المنتج ٢ … |
| 15.7–21.7 | Super SAAK Adhesive (azure light, C2TES1 badge). | Same shelf track. | المنتج ٣ … |
| 21.1–23.7 | The bag lowers out of frame and the floor dissolves. "How to use" appears and a 5-node rail draws beneath it. | The rail is the next scene's navigation. | طريقة الاستخدام · ٥ خطوات سهلة لنتيجة احترافية |
| 23.3–24.4 | The rail rises to the top and a porcelain tile lands centre frame. | Shared element: rail. | — |
| 23.7–43.7 | Five 4-second steps on the same tile, each with one animated idea: a squeegee clears dust; water fills to the mark, then the paddle turns it to mortar; a notched trowel combs ridges (thickness called out); tiles land and m² counts to ٥٫٠; a clock runs a full day, then the joints fill with grout. | The tile stays, so content slides inside it. Rail nodes complete one by one. | Step title, one line and one spec chip each |
| 43.2–44.4 | The tile drops away and darkness returns. | — | — |
| 43.7–50.0 | The mark, the wordmark and the line. The three bags rise into one composed group. The proof chips, then the call to action. A specular pass runs over the hero bag, the mark and the CTA. The last ~1.2 s is still. | — | ساك.. ثبات يدوم · صناعة سعودية · حاصل على شهادات الأيزو · اتصل بنا 920008148 |

## Assets (all taken from the supplied ad, nothing invented)

- `public/bag-*.png`: the three real product photos, cut out of the ad's frames (rembg / isnet + mask cleanup). The Super SAAK mask reuses the Porcelain silhouette, because both are the same bag shot.
- `public/saak-mark.svg`, `public/saak-wordmark.svg`, `src/lib/logoPaths.ts`: the official logo, potrace-traced from the intro frame (not redrawn).
- `public/audio.m4a`: the ad's original music track, unchanged.
- Copy: verbatim from the original ad. "·" was replaced by "–" because "·" reads as Arabic zero (٠).
- Font: IBM Plex Sans Arabic (OFL, via @fontsource).

## Motion language

- One environment for the whole film: ink-navy falloff, one key light, a faint perspective floor of tile joints, vignette and fine grain. Only the accent light colour changes per product.
- Curves: `cubic-bezier(0.16,1,0.3,1)` for arrivals, `(0.65,0,0.35,1)` for camera moves, and overshoot kept under 2% (`settle`).
- Every element has its own arrival time (4–30 frame offsets); nothing starts and stops on the same frame.
- Transitions are object-driven: the logo becomes the printed logo, the shelf track carries the light from product to product, the rail becomes navigation, and the tile acts as the stage.

## Known compromises

- The bag photos are only as sharp as the source video (about 430 px wide). They're shown at up to ~1.15× and lose a little crispness on large screens. A lossless packshot would fix this.
- The printed logo on the bag is photographed in slight perspective, so the hand-off morph is a ~10-frame crossfade rather than a pixel-perfect match.
- The illustrations are original flat line art in brand colours, not photography.

## Reproduce

```bash
npm install
export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell  # optional
npm run typecheck
npx remotion render SaakAd out/saak-ad-9x16.mp4 --codec=h264 --crf=16 --pixel-format=yuv420p --audio-codec=aac
node scripts/stills.mjs out/frames 0 2.6 6 12 18 22.5 25 33.5 41.5 49.5   # review stills
npm run studio   # interactive preview
```
