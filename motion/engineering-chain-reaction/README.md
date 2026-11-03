# CUBE — Frame your future · engineering chain-reaction short (9:16, 27.5 s)

A code-only 3D motion piece: a glowing mechanical pencil tips over → 9 drawing sheets
(A-101 … A-501) fall like dominoes → a glowing ball rolls down a scale ruler onto a blank
sheet and the floor plan draws itself → floors stack out of the plan, facade fins sweep up,
windows light, and the sun rises behind the tower. "FRAME YOUR FUTURE" appears, then the
background blurs and the CUBE logo, office name and contacts animate in.

Colours follow the CUBE identity: glows use the logo's turquoise hue (≈170°) brightened to `#3cc8b4`
(`?accent=RRGGBB` changes it); the logo keeps its exact colours `#cfe2dc` / `#92b1ac`.

Stack: Three.js (WebGL) + EffectComposer (Bloom, Bokeh DOF, ACES tone mapping), soft mirror
floor (Reflector), canvas-drawn sheets/plan, deterministic `seek(t)` rendered frame by frame
with Playwright → ffmpeg. Sound: SFX from the personal SFX_Library + a generated ambient bed.

## Build
```bash
npm install                      # three + fonts
# preview stills at half resolution
node render.js preview 0.5 3 8.2 15 21.5          # -> prev/p_XX.jpg
# full frames (split across workers if you like)
node render.js frames 1 0 360 frames & node render.js frames 1 360 720 frames
# sound: convert the library once, then build stems
python3 mklib.py <unzipped SFX folders> ../sfx_library
SFX_LIB=../sfx_library python3 audio.py times.json mix.wav
ffmpeg -i mix_music.wav -i mix_sfx.wav -filter_complex "[0:a]volume=0.5[mus];[1:a]asplit[s1][s2];[mus][s2]sidechaincompress=threshold=0.04:ratio=4:attack=4:release=220[md];[md][s1]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=11[a]" -map "[a]" final_mix.wav
node render_end.js 22.8 4.7 30 endframes          # logo end card (transparent PNGs)
./compose.sh 22.8 27.5 CUBE_FrameYourFuture_27s.mp4   # blur crossfade + end card + grain + audio
```
Rendering without a GPU (SwiftShader) takes ~5 s/frame at 1080×1920; on a machine with a GPU it is far faster.

## Where to change things
- Timing: `PEN_T0`, `ST_TF`, sheet spacing `SP`, ball speeds `vA/aR`, `T_LV`, `T_FIN`, `T_LIGHT`, `T_SUN`, `DUR` in `scene.js`.
- Look: `ORANGE`, bloom (`UnrealBloomPass`), sky shader colours, `CAM` / `FOLLOW` camera keys.
- Text: sheet titles in `SHEETS`, plan labels in `drawPlan`, end title in `scene.html`, office name/contacts in `endcard_tpl.html`.
- Logo: `logo_original.svg` / `logo_dark_bg.svg` are vector rebuilds of the CUBE logo (`trace_logo.py`).
- Sounds: event → file map in `audio.py`.
