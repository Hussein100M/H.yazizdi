---
name: "clay-rerender"
description: "Use to redraw a render or SketchUp view as a real photo in Nano Banana, all by prompt, in three passes: the clay, then the sun and shadows on the clay, then the materials with reflections, sky and atmosphere in one prompt; then fixes, with Photoshop maps only on request. Trigger: طريقة الكلاي, خلّ نانو يعيد الرسم, سكتشاب لصورة واقعية."
---

# Clay Re-render (Nano Banana)

Nano Banana is tuned to edit: it keeps the pixels it is given. Hand it a CG render or a model view with "keep everything" and it keeps the CG look too — flat light, plastic surfaces, glowing fixtures, pasted reflections. This skill splits the job into three short Nano Banana passes, each with one job, and does every step by prompt. Exports and render passes from the 3D software are welcome but never required.

1. **Clay** — the same view as a white clay model, made by prompt from the material view, in soft even light with no sun. Its one job is the geometry, so it is checked for the geometry alone.
2. **Sun and shadows** — a second pass on the clay adds the sun of the reference (or of the chosen time): direct light and crisp shadows cast from the real geometry. Nano Banana keeps what it sees, so shadows checked on the simple white model carry into the photograph — and when they come out weak or wrong, only this pass is rerun, never the geometry. With no readable sun (an overcast reference, or no sun chosen) this pass is skipped.
3. **Photo** — three images and one prompt. Image 1, the sunlit clay, sets the geometry, openings, camera, framing and shadows. Image 2, the material view (the render, or the model view with textures or flat colours), sets which material and colour each surface takes. Image 3, the realism reference, sets only the light, sky, atmosphere and colour grade. The same prompt carries the materials, the reflections, the sky and the air, so the finished photograph is drawn once. Glass reflects the sky that is in the photograph, so the sky and the reflections are always written together.
4. **Fix** — local fix passes only for what drifted or what the review found; grain and vignette are sliders in Camera Raw, with no re-render.
5. **Maps (optional)** — depth, occlusion, light-only and reflections, made by prompt from the final photograph for finishing in Photoshop. They are not part of the run: the delivery offers them in one line, and they are written only when the user asks, only the ones they ask for.

Every pass re-renders the whole image, which softens fine detail a little and can drift, so compatible changes share a pass, the passes stay few, the finished photograph is redrawn as little as possible, and each result is checked before the next. People, planting and props are added afterwards in their own pass (see Hand-off).

- Talk to the user in Arabic (their dialect); prompts in English; notes in short Arabic.
- Hand over every prompt of the run in ONE message up front (A, B and C), because the person runs them one after another in separate chats and gets lost when they arrive one at a time. The fix prompt (D) is held back: what it fixes is known only after a result comes back and is reviewed. The map prompts (E) are optional and written only when the user asks for them.
- Ask only through **AskUserQuestion** cards: max 4 questions, 2–4 options each, header ≤ 12 characters, recommended option first ending in "(مقترح)", never an "Other" option (it is built in). Skip any question the request or the images already answer and state that answer in one line.
- Headless run: ask nothing, take every recommended option, list them under الافتراضات.

## 1 Read the images (before any card)

Sort the attachments by look: the material view (a render, or a SketchUp or Revit view with textures or flat colours); a clay (an untextured white or grey copy of the same view), noting whether it already carries sun shadows; the realism reference (a photograph or render of another place); and, after a run, the result. The clay and the material view have to be the same view: a pair that doesn't line up in camera, framing or aspect gets blended into two views, so say so and ask for both from the same camera. With a clay and no material view, the description carries the materials alone: every material is ? unless the user named it, the read lists the elements, and the user fills in their materials by reply.

Then post one short block, max 8 lines, marking evidence ✓ seen · ≈ likely · ? cannot tell:

- **المبنى** — type; storeys as far as they show; openings per face; signature elements. Count only ✓.
- **المواد** — every surface in Image 2 by element and position, its look there and the real material it stands for (✓ cream walls → smooth cream render · ≈ speckled grey panels → light grey stone cladding · ? dark face left of the hall), ground, road and neighbouring buildings included. This becomes the material description; the user corrects it by reply.
- **تفاصيل باللون فقط** — details that exist only as colour on a flat surface in Image 2: flush insets, painted bands, lettering, a material change on one plane. Prompt A keeps them as fine outlines or shallow relief, and the description names them by position and count.
- **الكاميرا** — height, lens feel, verticals, aspect; whether the clay matches Image 2.
- **تفاصيل معرّضة** — the small things most likely to vanish or change: fixtures, boxes, grooves, fluted or ribbed panels, railings, kerbs and road lines, text and logos. They become the watch-list.
- **الأشخاص والنباتات** — count, kind and position in Image 2; they become real ones in the same places.
- **المرجع** — its light as a photographer would read it: whether it has a readable sun, and if so its direction relative to the camera and its height; colour temperature, hard or soft, shadow pattern (dappled leaf shade, say), sky, haze, colour grade; what is physical in it (its building, plants, people), which stays out; overlays to crop first (app badges, icons, captions).

A ≈ or ? item is described by its look and never turned into a fact.

## 2 Card

One card, max 4 questions:
- **الكلاي** — only when no clay is attached: خلّ نانو يسوي الكلاي (مقترح) / عندي تصدير كلاي من البرنامج. The work runs by prompt first; an export is exact and skips the clay check, so on that option wait for it before writing.
- **الواقعية** — only when no realism reference is attached: بأرفق صورة مرجعية (مقترح) / نهار بشمس جانبية / ذهبية / غيم بعد مطر. On the first, wait for it; the others describe the light in words instead.
- **الأداة**: Nano Banana Pro (مقترح) / Nano Banana 2.1 + Thinking / تطبيق Gemini (الافتراضي).
- **تأكيد** — when a main surface's material is ≈ or ?: the single most important one, 2–3 readings, the conservative one first with (مقترح). Every other unclear surface is described by its look and listed under الافتراضات.

## 3 Decide (silently)

- **Sun pass** — whenever the reference has a readable sun, or a sunlit time is chosen, Prompt B gives the clay that sun, from the reference's direction relative to the camera and its height, so the photograph's light and the clay's shadows agree. B asks for direct, hard sunlight: the sunlit areas clearly brighter than the shade (about two stops), long dark shadows that are darkest and sharpest where each shadow begins and soften slightly with distance, and the rest of the view in dimmer soft light. A sun sentence that lifts the shade with ambient light or glowing fixtures gives weak shadows, so fixtures stay out of B. With an overcast reference or no readable sun, B is skipped and the clay's soft occlusion carries into C. Leaf dapples only when the reference or the user wants them: cast from outside the frame onto the paving and the base of the walls, with the openings and the upper facade in clean light so the design stays readable.
- **Light** — from Image 3, written as a photographer would set it: colour temperature, hard or soft, sky, colour grade, and the sun on the same side as the clay's shadows. It goes into the prompt after "lit like Image 3": the image shows the light, and the words keep the model on the light rather than on the reference's content. Direction is always given from the camera, with the side and whether the sun is behind the camera: "front-left" reads as a sun inside the picture, which backlights the facade and washes out the sky. Indoors, the sun comes through a window named by side and depth ("a tall window just outside the frame on the right, slightly ahead of the camera"), and the shadows are given by the way they fall ("to the left and slightly toward the camera"). Without a reference, the chosen time: day — sun from the left, behind the camera and outside the frame, about 30–35° high, raking across the facade, 5500K, clear blue sky with thin high cirrus; golden — the same side, about 15°, 3500K, long warm shadows; overcast after rain — soft even daylight, soft shadows only under projections, damp darker surfaces, wet ground mirroring the building and the warm windows, layered grey cloud.
- **Fixtures** — daylight: "the sconces and uplights are unlit in daylight"; golden: a soft glow at most; a dusk or night reference: they glow at their positions as soft washes. Image 2 often shows fixtures lit by day and the clay shows them as plain shapes, so C states the lit or unlit state.
- **Materials** — the description follows Image 2 surface by surface, by element and position, from the largest surfaces through the trims, openings and colour-only details to the ground, road and background, giving each its real material and colour ("the tall tower on the right is light grey stone cladding in flat panels with fine joints"). The user's words come first, then ✓; a ≈ surface is named by its look; a ? surface is described as it looks in Image 2 (colour and sheen). Every surface needs a real material, render and paint included ("smooth off-white mineral render with fine texture"), or a white or flat surface can stay chalky. Small accents in a contrasting colour (boxes, panels, planters) are named one by one, since the model tends to blend them into the main wall colour. Each colour-only detail is named with its exact position and count. Words suit natural materials better than colour codes, which push them toward flat paint; add a hex only for a painted surface whose exact colour matters. No invented stone names, sizes or elements the view lacks, because a listed element tends to appear.
- **Sky** — in C, right before the reflections: day or golden — "a clear warm late-afternoon sky with a few thin high cirrus, deeper blue at the top and pale and warm near the horizon"; overcast — "layered soft grey cloud, brighter toward the horizon". Indoors with no sky in view, the view through the windows takes its place, a little brighter and hazier than the room, as a camera exposed for the interior sees it.
- **Reflections** — glass reflects what stands in front of it, so the reflections are written face by face from the view. From eye level, the upper panes reflect the sky and the lower panes the trees, forecourt and buildings at their height; a glass face that looks onto another part of the building reflects that part in its colour ("the side glazing of the tower reflects the blue-violet wall beside it"). Glass seen at a glancing angle reflects strongly, and glass seen head-on lets the interior show faintly through. Each pane reflects at a slightly different angle, so reflected lines step a little from pane to pane while the mullion grid stays crisp; one perfect mirror across a facade, black glass and flat blue glass are what give a render away. Glossy surfaces in the view are named once each: car paint and windows reflect the sky and the building's colours, polished stone holds a soft blurred reflection, satin metal a soft sheen of the sky. Indoors, a polished floor reflects the furniture and the sunlit patches as soft blurred reflections broken by its joints, strongest where it is seen at a glancing angle. At dusk or night the lit interiors fill the glass, with faint sky reflections on the upper panes. C carries the full clause, right after the sky it reflects.
- **Air** — once, in C: outdoors, slight atmospheric haze makes the distant trees and buildings lighter and lower in contrast; indoors, a faint warm haze lets the sunlight show as soft beams. Never stacked twice.
- **Plants, people and cars** — become real ones of the kind seen in Image 2, same size and position; additions belong to the next pass.
- **Deliverable** — "for a luxury real-estate brochure" for homes, "for an architecture magazine feature" for public and cultural buildings, or the user's own use; the model's planning step uses it to choose the finish.
- **Fixes** (after a result) — every drifted detail by element and position, written as its state in Image 2. Up to about four changes share a pass, the building before the site. An addition that improves the picture, such as a foreground frame of leaves, is the user's call before it is taken out. A sky, reflections or light that needs a touch is fixed the same way, as a one-image fix on the latest result.
- **Finish** — grain, vignette and highlight roll-off are Camera Raw sliders, with no re-render; nothing of the finish waits for another Nano Banana pass.
- Every default used goes under الافتراضات.

## 4 Write

Every prompt follows the same rules, because each one fixes a way edit prompts fail on Nano Banana:
- Flowing prose, no labels, about 150 words plus the material description (C, which also carries the sky, reflections and air, runs to about 220). The words go to materials and light, and the locks stay in one sentence: long lock lists are what make Nano Banana freeze the image.
- Name each image's role first. Without roles the model blends the images: it copies the CG look from Image 2, and the reference hands over its buildings and plants along with its light.
- Put the change before the preservation and state the amount: "This is a full new photograph: every surface has real texture, joints, reflections and fine grain." Without the amount, the model treats the request as a light touch.
- Keep the preservation to one short sentence: geometry, openings, fixtures, camera, framing.
- Describe the wanted state in positive words. For the reference, that means saying where every object comes from instead of listing what to leave out of it: a list of exclusions names those things and invites them in.
- A map prompt asks for "the exact same view, with the same camera, framing and aspect", since a map helps only when it lands on the photograph pixel for pixel.

**Prompt A — clay** (from the material view; it is the only image in this call, so here it is Image 1):
```
Convert Image 1 into a white clay model render of the exact same building, site and camera. Every wall, cornice, groove, panel, window, fixture, step and planter keeps its exact shape, size and position, and trees, plants and people become white clay forms in their places. Where two materials meet on one flat surface, a fine shallow line marks the boundary, and lettering and insets stay as shallow relief in their exact shape. All surfaces are matte white clay and glass is flat light grey. Soft even light with no direct sun adds gentle ambient occlusion in every groove, reveal and corner.
```
Indoors it reads "the exact same room and camera", and the room's own elements are named in the second sentence (panels and mouldings, ceiling steps and coves, slats, curtains, furniture, fixtures).

Check the clay before going on: every opening, fixture, groove and colour-only detail from the watch-list present, and the camera, framing and aspect unchanged. A clay that fails is regenerated, never used: what it lacks, B and C cannot bring back.

**Prompt B — sun and shadows** (on the clay from A, or on an exported clay without sun; the clay is the only image in this call):
```
Image 1 is a white clay model. Add a single sun [from the left, behind the camera and outside the frame,] about [30°] high, as direct hard sunlight: the sunlit surfaces are clearly brighter than the shade, and the real geometry casts crisp, dark shadows — under every cornice, slab and projection, from [the tower] onto the surfaces behind it, inside every reveal and down the steps — all in one direction, darkest and sharpest where each shadow begins and softening slightly with distance, with soft occlusion in the shade[, and soft dappled shadows from trees just outside the frame on the paving and the base of the walls]. The model stays white clay with the exact same geometry, camera and framing; only the light changes.
```
Indoors, the sun sentence reads: "Add a single low sun from [the right and slightly ahead of the camera], through a tall window just outside the frame on [the right], about [12°] high, as direct hard sunlight: broad patches of light lie across the floor [and the rug], much brighter than the rest of the room, and every object in them casts a long, dark shadow stretching [to the left and slightly toward the camera] — [the objects, by name] — darkest and sharpest where each object meets the floor, while the rest of the room keeps soft, dimmer even light."

Check the sunlit clay before going on: every shadow falls in one direction and where the geometry puts it — a projection shades the wall below it, a taller mass shades what stands behind it — dark and crisp where it begins; the sun itself stays out of the picture unless the reference shows it there; and the geometry still matches the clay from A, since B redraws too. Shadows that come out weak, soft or misplaced mean B is rerun with a more precise sun sentence (direction from the camera, height, "direct hard sunlight", the objects that cast); A stays as it is. Shadows are far easier to judge and fix on a white model than on a finished photograph.

**Prompt C — materials, reflections and atmosphere**:
```
Image 1 is a clay model and the authoritative guide for the exact geometry, openings, camera and framing[; its shadows are cast by the sun, so keep their exact shapes and direction]. Image 2 shows the same view with its materials and sets only which material and colour each surface takes. Image 3 is a reference that sets only the light, sky, atmosphere and colour grade; every object, surface and plant in the photograph comes from Images 1 and 2. Each surface takes its real material: [the material description]. Create a real architectural photograph of this building [for …], lit like Image 3: [the reference's light, the sun on the same side as Image 1's shadows], [fixture state]. The sky is [the sky], and [the reflection clause]. [The air.] [The trees, plants and people become real ones of the same kind, size and position.] This is a full new photograph: every surface has real texture, joints, reflections and fine grain. The building matches Image 1 exactly, and each surface takes its material from Image 2 and the description.
```
The reflection clause, day or golden: "every glass face reflects this sky and what stands in front of it — [the sky in the upper panes and the trees and forecourt in the lower ones; a face that looks onto another part of the building reflects that part] — strongest where the glass is seen at a glancing angle, while the panes seen head-on let the interior show faintly through; each pane reflects at a slightly different angle, so reflected lines step a little from pane to pane, and the mullion grid stays crisp[; the car paint and windows reflect the sky and the building's colours; the polished steps hold a soft blurred reflection of the door]"; overcast after rain — "the glass reflects the bright grey sky, and the wet ground mirrors the building and its lit windows, broken by the paving joints"; dusk or night — "the lit interiors show through every pane, with faint reflections of the sky on the upper panes only". The air: "Slight atmospheric haze makes the distant trees and buildings lighter and lower in contrast"; indoors, "A faint warm haze hangs in the room, so the sunlight shows as soft beams in the air". Without a reference, drop the Image 3 sentence and "lit like Image 3"; the chosen time's light stands alone. Without a material view, drop the Image 2 sentence, say every object comes from Image 1 and the materials described here, and end with "each surface takes the material described for it". Indoors it reads "a real interior photograph of this room", the view through the windows takes the sky's place, and the reflection clause names the polished floors, stone and metal.

Filled example (a two-storey cream villa facade, a sunlit clay with leaf dapples, a warm Mediterranean reference):
```
Image 1 is a clay model and the authoritative guide for the exact geometry, openings, camera and framing; its shadows are cast by the sun, so keep their exact shapes and direction. Image 2 shows the same view with its materials and sets only which material and colour each surface takes. Image 3 is a reference that sets only the light, sky, atmosphere and colour grade; every object, surface and plant in the photograph comes from Images 1 and 2. Each surface takes its real material: the walls are smooth cream mineral render with fine trowel texture; the cornices, slab edges, vertical strips and the square wall boxes are matte dark grey-brown; the frieze bands and the panels under the windows are light fluted panels with crisp ribs; the window frames, sconces, door and handrail are matte black aluminium with clear glass; the steps are polished black granite; and the forecourt is warm grey stone setts with sanded joints. Create a real architectural photograph of this building for a luxury real-estate brochure, lit like Image 3: warm late-afternoon sun from the left, behind the camera, on the same side as the shadows in Image 1, 4500K, the sconces unlit, creamy highlights and gentle contrast. The sky is a clear warm late-afternoon sky with a few thin high cirrus, deeper blue at the top and pale and warm near the horizon, and every window reflects this sky in its upper panes and the garden in front of the house in its lower ones, strongest where the glass is seen at a glancing angle, with the warm interior faint behind the panes seen head-on; each pane reflects at a slightly different angle while the mullion grid stays crisp, and the polished black steps hold a soft blurred reflection of the door. Slight atmospheric haze makes the distant trees lighter and lower in contrast. The shrubs in the planters become real green shrubs of the same size and position. This is a full new photograph: every surface has real texture, joints, reflections and fine grain. The building matches Image 1 exactly, and each surface takes its material from Image 2 and the description.
```

**Prompt D — fix** (after a result; Image 1 is the result, Image 2 the material view). The only prompt that is NOT handed over up front: it is written after the review, from what actually drifted.
```
Image 1 is the photograph and Image 2 is the original design view. Keep Image 1's light, sky, materials, textures, planting and colour grade, and change only these, each in its exact position: [up to about four fixes, each by element and position and written as its state in Image 2]. Everything else stays exactly as in Image 1.
```
How fixes read: "every element that is dark grey in Image 2 returns to matte dark grey: [the elements]" · "the entrance door is a solid matte black door, as in Image 2" · "the steps have a single black handrail on their right side, as in Image 2" · "the top-left corner is open sky where the branches were". Some fixes need no second image, and there the model's urge to preserve works for the design instead of against it:
- A wrong material: "Using Image 1, keep everything exactly as it is and change only [the surface, by position] to [its material]."
- The sky and the reflections: "Using Image 1, keep everything exactly as it is and change only the sky and the reflections: the sky becomes [the sky]; [the reflection clause]." When the sky is already right and only the reflections need work, the sky clause reads "the sky stays exactly as it is".
- A light touch: "Using Image 1, keep everything exactly as it is and change only the light: [the touch]" — "the dappled leaf shadows fall mainly on the paving and the lower wall, leaving the upper floor in clean sunlight" · "the shadow under the projecting upper floor is deeper and crisper". A light change bigger than a touch goes back to B on the clay, then C.

**Prompt E — maps** (optional, for Photoshop; written only when the user asks, and only the maps they ask for — all four when they just say "the maps"; each map in its own code block, run on the final photograph, which is Image 1 in every map prompt, and handed over with the Photoshop notes below in short Arabic). One prompt per map, each starting "Convert Image 1 into … of the exact same view, with the same camera, framing and aspect:"
- **Depth** — "a grayscale depth map …: brightness shows distance only — the nearest surfaces white, the farthest black, each surface one smooth gradient with no light, shadow or texture, crisp edges at every outline, the sky black."
- **Occlusion** — "an ambient occlusion pass …: no sun and no cast shadows; every surface white, with soft dark grey only in corners, grooves, reveals, under projections and where objects meet the ground."
- **Light only** — "a lighting pass …: every surface the same neutral matte mid-grey with no colour, keeping only the light, shadows and occlusion exactly as they fall in Image 1."
- **Reflections** — "a reflection pass …: only what the reflective surfaces reflect remains — the sky, trees and buildings in the glass, in the car paint and windows, in polished stone and metal — in its exact position, brightness and colour as in Image 1; the interior seen through the glass and every surface that does not reflect are pure black."
- **Normal** — not in the batch; through `normal-map-material-transfer` when asked.

"Distance only" and "no sun" matter: without them the depth map keeps the photograph's shading and the occlusion pass keeps its cast shadows, which then darken twice on Multiply.

In Photoshop a map works as a layer or as a mask (select it, copy, Alt+click the mask of an adjustment layer, paste). Depth, inverted, masks a haze layer and feeds Lens Blur; occlusion goes on Multiply at 15–30%; the light-only pass as the mask of a warming Color Balance layer warms only the sunlit areas, and inverted (Ctrl+I) on a cooling one cools only the shadows; the reflection pass goes on Screen at 20–50% to lift the reflections, and as the mask of a Curves or Hue/Saturation layer it grades only them. Nano Banana redraws, so each map goes over the photograph in Difference mode before use: edges that turn black mean it lands, and a shifted map is nudged with Free Transform or regenerated. Without the maps, Photoshop makes the same tools from the photograph itself: Filter → Neural Filters → Depth Blur → Output depth map only for depth, and Camera Raw's Color Grading for warm highlights and cool shadows.

## 5 Deliver

1. **All prompts of the run in one message**, in run order, each in its own code block with its label outside: برومبت أ — الكلاي، ب — الشمس والظلال، ج — المواد والانعكاسات والجو. D is held back (it needs a result to look at, so it comes after the review, together with whatever touch the review found), and E is not in the message: the closing line offers it. B goes in whenever the light has a sun, and drops with an overcast reference or no sun. With an exported clay that already carries the sun's shadows, drop A and B; with an exported clay without sun, drop A and keep B. C is written from the material view and doesn't wait for the clay, but runs only after the clay (and B) pass the check.
2. **ملاحظات** (Arabic, short):
   - الافتراضات.
   - ترتيب التشغيل (كل خطوة في محادثة جديدة، وانتظر فحص الخطوة قبل اللي بعدها)، مع الصور بالترتيب:
     1. أ: الرندر فقط ← كلاي بدون شمس. افحص الشكل.
     2. ب: الكلاي فقط ← كلاي بشمس وظلال. افحص الظلال؛ لو ضعيفة أو غلط أعد ب بس، والكلاي يبقى.
     3. ج: الكلاي المشمس، ثم صورة المواد (الرندر)، ثم المرجع ← الصورة الواقعية بموادها وانعكاساتها وجوّها. أرسلها للمراجعة.
     4. د: ما تنكتب قبل المراجعة؛ بعدها: النتيجة، ثم صورة المواد (أو النتيجة بس للإصلاح اللي ما يحتاج صورة ثانية).
   - المرجع: قصّ منه الشعارات والأيقونات والنصوص، والأفضل مرجع ضوءه واضح (اتجاه الشمس، الدفء، نوع الظل).
   - الإعدادات: في AI Studio اختر Nano Banana Pro، أو 2.1 مع Thinking؛ وفي تطبيق Gemini ولّد ثم من النقاط الثلاث اختر Redo with Pro (AI Pro وUltra). الناتج 2K أو 4K، وحدد النسبة نفس نسبة الرندر في كل خطوة.
   - كل محاولة في محادثة جديدة، لأن المحادثة الطويلة ترجّع صور قديمة؛ وأعد التوليد مرتين أو ثلاث قبل ما تغيّر البرومبت.
   - كل تمريرة تعيد رسم الصورة كلها وتنعّمها شوي: لو نعمت، الصق المنطقة المعدّلة بس فوق النسخة اللي قبلها في فوتوشوب.
   - Grain والـ Vignette في Camera Raw، بدون إعادة توليد.
   - النصوص والشعارات: رجّعها من صورة المواد في فوتوشوب بعد التوليد، لأن النموذج يشوّهها.
   - وش تراقب: قائمة التفاصيل المعرّضة، والظلال باتجاه واحد وفي مكانها الصح وغامقة عند بدايتها والشمس برّا الصورة، وكل سطح أخذ مادته الحقيقية بدل شكل الرندر، والزجاج يعكس سماء الصورة واللي قدامه (مو أسود ولا أزرق مسطح ولا مراية وحدة على الواجهة كلها)، وما دخل من المرجع غير ضوءه.
   - لو بتصدّر من البرنامج بدل نانو: الكلاي وصورة المواد من نفس الكاميرا والنسبة، بأعلى دقة، والحواف مطفية. الكلاي من سكتشاب Face Style → Monochrome، والظلال بالوقت والتاريخ بنفس اتجاه شمس المرجع، وساعتها ما تحتاج أ ولا ب.
3. One closing line with the next step (run A, check the clay, then B), and one line offering the maps: "لو تحتاج خرائط للطباعة (عمق، إظلال، ضوء، انعكاسات) قل لي وأكتبها لك."

When the user asks for the maps, hand over Prompt E for the maps they named, each in its own code block, with these notes in short Arabic: كل ماب في محادثة جديدة، والصورة النهائية بس. في فوتوشوب كل ماب يشتغل طبقة أو ماسك (انسخه، Alt+كليك على ماسك طبقة التعديل، الصق). الانعكاسات Screen بـ 20–50%، والأوكلوجن Multiply بـ 15–30%، والعمق مقلوب ماسك للضباب، والضوء فقط ماسك يدفّي المناطق المشمسة ومقلوب يبرّد الظل؛ وراجع كل ماب بوضع Difference فوق الصورة قبل الاستعمال.

## 6 Review

When a result comes back, compare it with the clay, the material view, the reference and the prompt, and give two scores:
- **مطابقة التصميم /10** — massing, storeys and roofline; openings by count and position; watch-list and colour-only details; each surface's material and colour against Image 2 and the description; plants and people in the same places and sizes; camera, framing and aspect; site lines (kerbs, roads, markings); nothing added, from the reference or anywhere else.
- **الواقعية /10** — the reference's light: warmth, shadow quality and colour grade; the clay's shadows kept in shape, direction and strength; one shadow direction; nothing carried over from Image 2's CG look (flat light, plastic surfaces, fixtures lit by day); no surface left chalky or clay-like; a sky with depth; glass that reflects this photograph's own sky and surroundings, stronger at glancing angles and stepping slightly from pane to pane, never black, flat blue or one perfect mirror; ground and plants read as real.

Mark each check مطابق · فرق بسيط · فرق جوهري · غير قابل للتحقق; an unverifiable check never counts as a match, and any فرق جوهري in design means the result is not ready.

Fix the highest level first:
- Massing or camera drift → re-roll Prompt C; if the clay itself drifted, regenerate the clay from A, then B.
- Shadows weak, soft, or in the wrong place or direction → rerun B on the clay from A with a more precise sun sentence, then rerun C. A stays as it is.
- Missing or changed details, wrong colours, an unwanted addition → write Prompt D now (the only prompt held back).
- A surface left chalky or copying Image 2's CG look → the one-line material fix, or rerun C with that surface described more concretely (colour, finish, joints). If the whole result copies Image 2, drop Image 2 and let the description carry the materials alone.
- Objects from the reference → crop the reference down to its sky and light and rerun C, or take them out with Prompt D if the rest works.
- A flat sky, black, flat or mismatched reflections, or light that needs a touch → the one-image D fix for the sky and the reflections, or for the light.

A fix is done only once the regenerated image has been checked. After D passes, the photograph is final; the maps come only if the user asks for them.

## Run (only when asked)

If a generator is connected (Nim, or the user's own Gemini API server), load its skill and follow its upload rules: images in role order, one prompt per run, show the result, stop; the next prompt only after approval. Report credits used and the balance in one line.

## Hand-off

Say so in one Arabic line and load it:
- People, planting, cars or styling after the re-photograph → `arch-prompt-interviewer` (its object pass) or `banana`.
- Copy light or mood from a reference while keeping the render's own pixels, with no redraw → `render-style-transfer`.
- A normal map as the geometry image instead of a clay → `normal-map-material-transfer`.
- A new camera angle → `architectural-camera-angle-planner`.
- A model the user can export from, and a single generation pass → `clay-rerender-fast`.

If the skill is not installed, say so in one line and continue here.
