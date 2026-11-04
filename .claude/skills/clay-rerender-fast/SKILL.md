---
name: clay-rerender-fast
description: "Fast clay re-render for Nano Banana: a SketchUp, Revit or render view becomes a real photograph in ONE generation pass. The clay and the material view are exported from the 3D software (exact geometry, real sun shadows), one merged prompt carries materials, light, sky and reflections, 3-4 takes replace serial fixing, drifted details are fixed on a crop, and finishing is done in Camera Raw with no re-render. Use instead of clay-rerender unless separate print maps are needed. Trigger: الطريقة السريعة, كلاي سريع, تمريرة وحدة, اختصر طريقة الكلاي, سكتشاب لصورة واقعية بسرعة."
---

# Clay Re-render — Fast (Nano Banana)

Nano Banana keeps the pixels it is given, so a CG render handed over with "keep everything" stays CG. The cure is to give it the geometry as a clay (no CG surfaces to copy) and the materials as words plus a design view it only reads. Every pass also redraws the whole image, which softens fine detail and lets it drift, so the fewest passes give the sharpest result. This skill therefore runs:

1. **Export** — the clay and the material view come from the 3D software, same scene, same size: exact geometry and real sun shadows in a minute, with no generation and no clay check.
2. **One prompt** — clay, material view and realism reference, with materials, light, sky and reflections in the same prompt. 3–4 takes, keep the best.
3. **Local fix** — only what drifted, on a crop pasted back over the photograph; the rest of the image is never redrawn.
4. **Finish** — grain, vignette, colour grade, depth of field and haze in Camera Raw / Photoshop. No maps from Nano Banana: a depth map, when needed, is made by Photoshop from the photograph itself, so it lands pixel for pixel.

Fallback: with only a render image and no model, Nano Banana makes the clay first (Prompt A) — one extra pass.

- Talk to the user in Arabic (their dialect); prompts in English; notes in short Arabic.
- Hand everything over in ONE message. Only the fix prompts wait for a result.
- At most one **AskUserQuestion** card, only for what the request and the images leave open: max 4 questions, 2–4 options each, header ≤ 12 characters, recommended option first ending in "(مقترح)", never an "Other" option (it is built in).
- Headless run: ask nothing, take every recommended option, list them under الافتراضات.

## 1 Read the images

Sort the attachments by look: the material view (a render, or a model view with textures or flat colours); a clay (an untextured white or grey view — note whether it carries sun shadows); the realism reference (a photo or render of another place); after a run, the result. The clay and the material view must be the same camera, framing and aspect — a pair that doesn't line up gets blended into two views, so say so and ask for both from the same saved scene.

Post one block, max 6 lines, marking ✓ seen · ≈ likely · ? cannot tell:

- **المواد** — every surface by element and position → the real material it stands for (✓ cream walls → smooth cream render · ≈ speckled grey panels → light grey stone cladding · ? dark face left of the hall), ground, road and neighbours included. The user corrects it by reply.
- **تفاصيل معرّضة** — the watch-list: fixtures, grooves, fluted panels, railings, kerbs and road lines, colour-only details (flush insets, painted bands, a material change on one plane), text and logos.
- **الأشخاص والنباتات** — count, kind and position; they become real ones in the same places.
- **المرجع** — sun side and height relative to the camera, warmth, hard or soft, sky, haze, grade; what to crop out first (buildings, people, badges, captions).
- **الكاميرا** — whether the clay matches the material view.

A ≈ or ? item is described by its look and never turned into a fact.

## 2 Card (only what is missing)

- **الكلاي** — only when no clay is attached: أصدّره من البرنامج (مقترح) / ما عندي موديل، خلّ نانو يسويه. The first gets the export steps (section 3) in the same message as the prompt; the second adds Prompt A.
- **الواقعية** — only when no reference is attached: بأرفق صورة مرجعية (مقترح) / نهار بشمس جانبية / ذهبية / غيم بعد مطر. On the first, wait for it; the others describe the light in words.
- **تأكيد** — only when a main surface's material is ≈ or ?: that one surface, 2–3 readings, the conservative one first with (مقترح). Every other unclear surface is described by its look and listed under الافتراضات.

The tool is not asked: Nano Banana 2.1 with Thinking on high; Nano Banana Pro is the fallback named in the notes.

## 3 Export (handed over when the user exports)

Both images from the same saved scene, same pixel size, PNG, with axes, guides, dimensions, text and section planes hidden.

- **Material view** — the normal textured view.
- **Clay, SketchUp** — Styles → Edit → Face Settings: Monochrome, with the back-face colour set to the front colour (no blue faces); Edge Settings: edges and profiles off. Shadows on with "Use sun for shading", and the time slider moved until the shadows fall the way the prompt says (sun from the left behind the camera → shadows fall to the right and away from the camera); never a sun facing the camera. Ambient Occlusion on when the version has it. Overcast: shadows off, Ambient Occlusion on.
- **Clay, Revit or others** — the same camera with a plain white or grey look, cast shadows and ambient shadows on, the sun set to the side the prompt names.

An exported clay is exact: it needs no check beyond matching the material view.

## 4 Decide (silently)

- **Light** — from Image 3, written as a photographer would set it: colour temperature, hard or soft, sky, grade, and the sun on the same side as the clay's shadows. Direction is always given from the camera, with the side and whether the sun is behind the camera: "front-left" puts the sun inside the picture, backlights the facade and washes out the sky. Without a reference, the chosen time: day — sun from the left, behind the camera and outside the frame, about 30–35° high, raking across the facade, 5500K, clear blue sky with thin high cirrus; golden — the same side, about 15°, 3500K, long warm shadows; overcast after rain — soft even daylight, soft shadows only under projections, damp darker surfaces, wet ground mirroring the building and the warm windows, layered grey cloud.
- **Fixtures** — daylight: "the sconces and uplights are unlit in daylight"; golden: a soft glow at most; dusk or night: soft washes at their positions. Always stated, since the material view often shows them lit by day.
- **Materials** — follow Image 2 surface by surface, by element and position, from the largest surfaces through trims, openings and colour-only details to the ground, road and background, each with a real material and colour ("the tall tower on the right is light grey stone cladding in flat panels with fine joints"). The user's words come first, then ✓; a ≈ surface is named by its look; a ? surface is described as it looks in Image 2 (colour and sheen). Render and paint are materials too ("smooth off-white mineral render with fine texture"). Small accents in a contrasting colour are named one by one, since the model blends them into the main wall; each colour-only detail is named with its exact position and count. Words, not hex codes, except for a painted surface whose exact colour matters. No invented stone names, sizes or elements: a listed element tends to appear.
- **Sky and reflections** — in the same prompt, right after the light. Glass reflects what stands in front of it: from eye level the upper panes reflect the sky and the lower panes the trees, forecourt and buildings at their height; a face looking onto another part of the building reflects that part in its colour. Strong at glancing angles, the interior faint behind panes seen head-on; each pane steps slightly while the mullion grid stays crisp — one perfect mirror, black glass or flat blue glass gives a render away. Car paint and windows reflect the sky and the building's colours; polished stone holds a soft blurred reflection; satin metal a soft sheen. Dusk or night: the lit interiors show through every pane, faint sky on the upper panes only. Overcast after rain: the glass reflects the bright grey sky and the wet ground mirrors the building and its lit windows, broken by the paving joints.
- **Plants, people and cars** — real ones of the kind in Image 2, same size and position; additions belong to a later pass (Hand-off).
- **Deliverable** — "for a luxury real-estate brochure" for homes, "for an architecture magazine feature" for public and cultural buildings, or the user's own use.
- Every default used goes under الافتراضات.

## 5 Write

Each rule fixes a way edit prompts fail on Nano Banana:

- Flowing prose, no labels, about 180 words plus the material description. The preservation stays in ONE sentence at the end: long lock lists are what freeze the image.
- Name each image's role first. Without roles the model blends the images: it copies Image 2's CG look, and the reference hands over its buildings and plants along with its light.
- Put the change before the preservation and state the amount: "this is a full new photograph, not a retouch". Without the amount the model makes a light touch.
- Positive words: say where every object comes from instead of listing what to leave out — a list of exclusions names those things and invites them in.

**Main prompt** (Image 1 the clay, Image 2 the material view, Image 3 the reference):

```
Image 1 is a clay model and the exact guide for the geometry, openings, camera, framing and shadows. Image 2 is the same view as a design render and shows only which material and colour each surface takes. Image 3 is a photograph that shows only the light, sky and colour grade I want. Turn Image 1 into a real architectural photograph [for a luxury real-estate brochure]: this is a full new photograph, not a retouch — every surface has real texture, joints, fine grain and true reflections. [MATERIAL DESCRIPTION, surface by surface, by element and position.] Lit like Image 3: [LIGHT SENTENCE], with crisp shadows exactly where Image 1 casts them; [FIXTURE STATE]. The sky is [SKY], and [REFLECTION CLAUSE]. The plants, people and cars are real ones of the same kind, size and position as in Image 2. Keep the geometry, openings, fixtures, camera and framing of Image 1 exactly; every object comes from Image 1 and Image 2, and only the light comes from Image 3.
```

- **No reference** — drop the Image 3 sentence and "like Image 3"; the chosen time's light stands alone, and the last clause ends at "every object comes from Image 1 and Image 2".
- **No material view** (clay only) — drop the Image 2 sentence; every object comes from Image 1 and the materials described here; end with "each surface takes the material described for it".
- **Overcast** — "with soft shadows only under projections and soft occlusion exactly as in Image 1" in place of the crisp-shadow clause.

**Prompt A — clay by Nano Banana** (fallback only, no model; the render is the only image in this call):

```
Convert Image 1 into a white clay model render of the exact same building, site and camera. Every surface — walls, frames, ground, planting, cars and people — becomes the same matte white clay with no texture, colour or reflection, and the glass becomes flat pale grey so every opening still reads; every mullion, groove, railing, fixture and colour-only detail stays as a fine edge or shallow relief in its exact place. [CLAY LIGHT SENTENCE] Keep the geometry, openings, camera, framing and aspect of Image 1 exactly.
```

Clay light sentence, with a sun: "A single sun [from the left, behind the camera and outside the frame,] about [30°] high casts crisp shadows from the real geometry — under every cornice, slab and projection, from [the tower] onto the surfaces behind it, inside every reveal and down the steps — all in one direction, with soft occlusion in the shade." Without a sun: "Soft even light with no direct sun adds gentle ambient occlusion in every groove, reveal and corner."

Check this clay before the main prompt: every watch-list item present, every shadow in one direction where the geometry puts it, the sun outside the picture. A clay that fails is regenerated, never used: what it lacks, the main prompt cannot bring back.

**Fix prompts** (after a result only; up to about four changes per pass, the building before the site):

A surface that only took the wrong material, or a flat sky and wrong glass — on the whole photograph, no second image:

```
Using Image 1, keep everything exactly as it is and change only [the surface, by position] to [its material].
```

(For the sky and glass: "change only the sky and the glass: [SKY], and [REFLECTION CLAUSE]"; when the sky is already right, "the sky stays exactly as it is".)

A drifted, missing or added detail — the area cropped with a margin from the result, and the same area cropped from the material view after scaling it to the result's size:

```
Image 1 is a crop of a photograph and Image 2 is the same crop of the original design. Keep Image 1's light, materials, grain and framing exactly, and change only this: [each fix, written as its state in Image 2].
```

Fixes read as states: "every element that is dark grey in Image 2 returns to matte dark grey: [the elements]" · "the entrance door is a solid matte black door, as in Image 2" · "the steps have a single black handrail on their right side, as in Image 2" · "the top-left corner is open sky where the branches were". The fixed crop goes back over the photograph as a layer with a soft-edged mask.

## 6 Deliver

One message, in this order:

1. **التصدير** — the export steps from section 3 with the sun side filled in (only when the user exports).
2. **The prompts**, each in its own code block, its label outside: البرومبت الرئيسي, and برومبت أ — الكلاي before it in the fallback. The fix prompts wait for a result.
3. **ملاحظات** (short Arabic):
   - الافتراضات.
   - ارفع الصور بالترتيب: الكلاي ← صورة المواد ← المرجع.
   - المرجع: قصّه على السماء والإضاءة، وشيل منه الشعارات والنصوص والأيقونات.
   - الأداة: Nano Banana 2.1 مع Thinking على high؛ لو ما ضبط جرّب Pro. نفس نسبة الأبعاد، 2K أو 4K.
   - ولّد 3–4 مرات، كل محاولة في محادثة جديدة، واختر الأفضل قبل أي إصلاح.
   - الإصلاح يكون على قصّ تلصقه فوق الصورة، عشان باقي الصورة ما ينعاد رسمه ويتنعّم.
   - التشطيب في Camera Raw بدون إعادة توليد: Grain وVignette، وColor Grading (الإضاءات دافية والظلال باردة)، وLens Blur لعمق الميدان. للضباب: Filter ← Neural Filters ← Depth Blur ← Output depth map only، واقلبها ماسك لطبقة الضباب.
   - النصوص والشعارات: رجّعها من صورة المواد في فوتوشوب، لأن النموذج يشوّهها.
   - وش تراقب: قائمة التفاصيل المعرّضة، والظلال باتجاه واحد وفي مكانها الصح، وكل سطح أخذ مادته الحقيقية بدل شكل الرندر، والزجاج يعكس سماء الصورة واللي قدامه (مو أسود ولا أزرق مسطح ولا مراية وحدة على الواجهة كلها)، وما دخل من المرجع غير ضوءه.
4. One closing line with the next step (export, run, send the best take).

## 7 Review

When a result comes back, compare it with the clay, the material view, the reference and the prompt, and give two scores:

- **مطابقة التصميم /10** — massing, storeys and roofline; openings by count and position; the watch-list and colour-only details; each surface's material and colour against Image 2 and the description; plants and people in the same places and sizes; camera and framing; site lines; nothing added, from the reference or anywhere else.
- **الواقعية /10** — the reference's warmth, shadow quality and grade; the clay's shadows kept in shape and direction; nothing carried over from Image 2's CG look (flat light, plastic surfaces, fixtures lit by day); no surface left chalky; a sky with depth; glass that reflects this photograph's own sky and surroundings; ground and plants read as real.

Mark each check مطابق · فرق بسيط · فرق جوهري · غير قابل للتحقق; an unverifiable check never counts as a match, and any فرق جوهري in design means the result is not ready.

Fix the highest level first:

- Massing or camera drift → another take of the main prompt; if it persists, check that the clay and the material view share one camera.
- Shadows in the wrong place or direction → re-export the clay with the sun moved (or Prompt A with a more precise light sentence), then rerun.
- Missing or changed details, wrong colours, an unwanted addition → the crop fix.
- A surface left chalky or copying Image 2's CG look → the one-image material fix, or rerun with that surface described more concretely (colour, finish, joints). If the whole result copies Image 2, drop Image 2 and let the words carry the materials.
- Objects from the reference → crop the reference down to its sky and light and rerun, or remove them with the crop fix.
- A flat sky, black, flat or mismatched glass → the one-image fix for the sky and the glass.

A fix is done only once the regenerated image has been checked.

## Run (only when asked)

If a generator is connected (Nim, or the user's own Gemini API server), load its skill and follow its upload rules: images in role order, one prompt per run, show the result, stop; the next prompt only after approval. Report credits used and the balance in one line.

## Hand-off

Say so in one Arabic line and load it:

- People, planting, cars or styling after the photograph → `arch-prompt-interviewer` (its object pass) or `banana`.
- Copy light or mood from a reference while keeping the render's own pixels, with no redraw → `render-style-transfer`.
- A normal map as the geometry image instead of a clay → `normal-map-material-transfer`.
- A new camera angle → `architectural-camera-angle-planner`.
- Separate depth, occlusion, light or reflection maps made by Nano Banana for print → `clay-rerender` (the full version, Prompt D).

If the skill is not installed, say so in one line and continue here.
