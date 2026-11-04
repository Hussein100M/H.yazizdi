---
name: interior-furniture-swap
description: "Reads an interior render or photo, lists every swappable piece with its position and orientation, then uses short AskUserQuestion cards to pick the piece and request a reference image or suggest alternatives. Writes one design-locked English prompt (Nano Banana, Seedream, GPT Image) that removes the old piece and puts in its place an exact copy of the reference piece, described part by part (counts, proportions, materials, colours, details), never the old shape re-covered in the reference's materials. The copy is sized to fit the space, keeps the old piece's spot, orientation and viewing angle (not the reference photo's angle), and takes the render's own light, shadows, reflections and grade. Use whenever the user wants to change a sofa, chair, table, bed, lamp or rug in an interior image, with or without a product photo. Trigger: بدّل الأثاث, غيّر الكنبة, استبدل الكرسي, حط هذي القطعة بدل, انسخ القطعة من الصورة, furniture swap. Not for a wall or floor material (banana) or copying light from another render (render-style-transfer)."
---

# Interior Furniture Swap

The job: take the piece in the reference photo and put **that exact piece** into the render in place of an old one — the same product, copied faithfully, sized to fit the space, turned to the old piece's pose and lit by the render. Not the old piece re-covered in the reference's fabric, and not something "inspired by" the reference.

A swap fails in six predictable ways. Every rule below exists to stop one of them:

1. **Hybrid (re-skin)** — the model keeps the old piece's shape (arms, cushions, base, proportions) and only paints the reference's materials and colours onto it, or blends the two designs. This is the most common failure and the one that matters most here.
2. **Loose copy** — the right kind of piece but not that piece: cushions, legs or panels miscounted, details simplified or invented, proportions drifted. It comes from a vague description: given "a beige sofa", the model designs its own; given a part-by-part spec, it copies.
3. **Reference pose leak** — the piece arrives in the camera angle of the product photo (usually straight-on and studio-lit) instead of the pose the old piece had in the render, so it looks pasted in.
4. **Sticker look** — the piece is sharper, cleaner, brighter or differently coloured than the room around it: no contact shadow, no floor reflection, wrong blur, no grain.
5. **Room drift** — the model re-renders the whole frame; walls, other furniture or the light shift.
6. **Leftovers** — a leg, an arm, the old shadow or the old reflection stays behind.

So every prompt takes three things from three places:
- **Design ← Image 2, exactly** (the reference): every part, count, proportion, material, colour and detail of that piece, written as a spec sheet. Nothing of the old piece's design survives.
- **Pose and size ← Image 1** (the render): position, footprint, rotation, facing, viewing angle, handedness, and a real-world size fitted to the space.
- **Look ← Image 1**: light, shadows, reflections, depth of field, colour grade, grain, rendering style.

Conversation rules:
- Talk to the user in Arabic, in their own dialect. Prompts are English.
- Ask only through **AskUserQuestion** cards, never as a list in chat. Each card: max 4 questions, 2–4 options each, header ≤ 12 characters; never add an "Other" option (it is built in, and the user types piece numbers or their own idea there); `multiSelect` only where marked (multi). The recommended option comes first and ends with "(مقترح)". Show only options that fit what the read found.
- Skip any question the request or the read already answers, and state that answer in one line. When questions are skipped, merge what is left into fewer cards.
- No render attached → ask for it in one Arabic line and stop; this skill always edits an existing image.
- Headless run: ask nothing, take every recommended option (no reference image → the suggestion path, first suggestion), list them under الافتراضات.

## 1 Read the render (before any card)

Post one compact block. Mark each item by its evidence: ✓ seen clearly · ≈ likely, not certain · ? cannot tell. The user corrects the read by replying; it is not asked line by line. A ≈ item goes into the prompt by its look (colour, sheen, texture), never as a guessed name.

**الفراغ والكاميرا** (2 lines) — room type and style; camera height, read from the horizon line (the height where horizontal lines stop sloping: at sofa-back height ≈ 0.9 m, around door-handle height ≈ 1.0–1.1 m, three quarters up a door ≈ 1.6 m); perspective: one-point (back wall square to the camera) or two-point (corner view, vanishing points left and right); lens feel (24 / 35 / 50 mm); verticals straight or converging.

**مؤثرات الصورة** (3–4 lines) — the look the new piece must inherit:
- **الضوء** — key light: source, side, quality (soft daylight from the window on the left · sun patches · ceiling downlights) and colour (≈ 5000K daylight, 2700–3000K warm lamps); accents and fill. Read the direction and softness from the shadows the existing furniture already casts: they are the proof.
- **الانعكاسات** — glossy floor, mirror, glass or polished table that currently shows furniture (the new piece must appear there too, the old reflection must go).
- **العمق** — which plane is in focus and how soft things are at the target piece's depth.
- **الطابع** — colour grade (warm or cool, contrast, saturation), bloom around lights, grain or noise, vignette, haze or light rays, rendering style (photoreal · stylised · clay · sketch) and overall sharpness.

**جرد الأثاث** — a numbered table of every swappable piece: main furniture first, then lighting, then soft furnishings and decor. Columns: **# · القطعة · المكان · الاتجاه · يتداخل مع · الاستبدال**.
- **القطعة** — type and short look (✓ three-seat sofa, grey bouclé, low plinth base).
- **المكان** — where it stands in the room and in the frame (centre, against the back wall, on the rug), and the free floor around it (≈ 40 cm to the side table, walkway in front).
- **الاتجاه** — the most important column; see *Reading orientation* below.
- **يتداخل مع** — what stands in front of it, what sits on it, what it touches (the coffee table covers its front base · three cushions and a throw on it · it sits half on the rug).
- **الاستبدال** — سهل (fully visible, standing alone) · متوسط (partly covered, or objects on it) · صعب (mostly hidden, cut by the frame, or tiny) · مدمج (built-in joinery: wardrobe, kitchen run, wall-hung TV unit, panelling — changing it is a design change, not a swap; say so and leave it out of the cards).
Matching pieces go in one row with ×2. Keep it to about 12 rows; small decor shares one row (ديكور صغير: مزهريات، كتب، شموع).

### Reading orientation

Describe each piece's pose by what the camera can see, anchored to fixed things in the room. Degrees only support the description; models follow visible relationships far better than numbers.
- **Visible faces** — front, which side (left or right), back, top; and which end is nearest the camera.
- **Facing** — what its front faces, named by a fixed element (the TV wall, the window, the camera, the dining table); what its back is against or parallel to.
- **Axis** — parallel to which wall or rug edge, receding toward which vanishing point; or set at an angle to the room grid (≈ 30°, 45°).
- **View height** — seen from slightly above (seat or table top reads as a surface) or near eye level (top barely visible).
- **Handedness** — for asymmetric pieces: the chaise or corner side of an L-sofa, the open end of a chaise longue, a desk return, the arm of an arc lamp.
- Round or symmetric pieces (round stool, pedestal table, drum pendant) have no facing; say so — their pose is position, size and view height only.

Example rows of the الاتجاه column: «الواجهة تطالع الكاميرا مباشرة، الظهر ملاصق للجدار الخلفي، مرئية من فوق شوي» · «3/4 من اليسار: الذراع اليسرى أقرب للكاميرا، الواجهة تطالع جدار التلفزيون يمين، محورها الطويل يتجه لنقطة التلاشي اليمنى» · «جانبية تماماً، الواجهة تطالع النافذة» · «دائرية — بدون اتجاه».

A pose that is ≈ or ? for a piece the user picks becomes the **تأكيد** question on the next card.

## 2 Cards

**Card 1**
- **القطعة** (multi) — the 3–4 best candidates from the inventory, labelled "#n name"; the hero piece (largest, most visible, easiest to swap) first with (مقترح). Option description: «أو اكتب أرقام قطع ثانية». Skip when the request names the piece.
- **المرجع** — skip when a second image is already attached: عندي صورة مرجعية (مقترح) / اقترح لي بدائل تناسب الفراغ. Description of the second: «أو اكتب وصف القطعة اللي في بالك».
- **الأداة**: Nano Banana (مقترح) / Seedream / GPT Image.
- **التوأم** — only when the request already names a ×2 piece; otherwise it moves to Card 2R or 2S once a ×2 piece is chosen: الاثنين بنفس القطعة (مقترح) / اللي يسار فقط / اللي يمين فقط.

**عندي صورة مرجعية** → end the turn with one short Arabic message asking for the image, with these tips: a clear photo of the piece itself (a store product photo is ideal); more photos of the same piece from other angles help the copy, especially one close to its angle in the render; its dimensions from the store (length × depth × height), if known; several pieces → one image per piece, in the order of their numbers.

### The spec sheet (بطاقة القطعة)

When the reference arrives, read it like a furniture designer preparing a shop drawing: count everything that can be counted and measure every proportion against the piece itself. The prompt can only copy what it names, and the model fills every unnamed gap with its own design. Use the order, vocabulary and example in `references/furniture-vocabulary.md` (section 1). Post it as a compact list, Arabic labels with English terms, each line marked ✓ ≈ ?:

- **النوع والهيئة** — type and silhouette; overall size (store dimensions, else estimated from the proportions and typical sizes).
- **النسب** — as ratios of the piece itself: back height against overall height, arm height against the back, seat or top thickness, depth against length, leg height against body height.
- **القاعدة** — legs (exact count, shape, section, taper, splay, material, colour, set-in from the corners) or plinth, recessed plinth, sled, pedestal, trestle.
- **الأجزاء** — arms, back, seat, top, headboard, frame, drawers, doors, shade: the shape and relative size of each; cushions with exact count, loose or fixed, thickness, seam type.
- **الخامات والألوان** — per part: material, colour, finish, texture, pattern direction and pattern scale.
- **التفاصيل** — piping, welts, stitching lines, tufting with button count and grid, fluting or reeding count, edge profiles, handles, joints, visible hardware.
- **غير موجود** — features it does not have (no piping, no buttons, no visible legs, no skirt): the model adds these unless told not to.
- **الزاوية** — reference angle against the slot's angle, and how the hidden sides continue («المرجع أمامي · في الرندر 3/4 من اليسار → بنلفّها، والجنب الأيسر يكمل بنفس القماش والخياطة»).
- **المقاس** — the real size against the slot: يناسب · أطول · أقصر.

The user corrects the sheet by replying. A ? detail that changes the copy (hidden legs, the back of a chair, cushions under a throw) becomes **تأكيد**; any other ? detail is left unnamed and the prompt says hidden parts continue the visible design. Ignore the reference's background, other objects, lighting and logos. If it shows several pieces, list them and ask **أي قطعة**.

**Card 2R** (reference path) — only the questions that apply; if more than four apply, the first four in the order أي قطعة · تأكيد · التوأم · المقاس · الاتجاه · الإكسسوارات go on this card and the rest on one more:
- **أي قطعة** — only when the reference shows several pieces.
- **تأكيد** — a ≈ or ? pose of the old piece, or a reference detail that changes the copy: 2–3 readings, the one with the most visible evidence first.
- **التوأم** — only when a chosen piece is ×2 and Card 1 did not ask it.
- **المقاس** — only when the piece at its real size does not match the slot: بمقاسها الحقيقي في المساحة المتاحة / نسخة أقصر بنفس التصميم والتفاصيل; (مقترح) goes on whichever fits without touching a neighbour, a door or a walkway. A shorter version keeps every part's design and width and drops whole modules (three seat cushions → two), and the prompt says so.
- **الاتجاه** — only when handedness differs: زي الرندر، نعكس المرجع (مقترح) / زي المرجع.
- **الإكسسوارات** — only when scatter cushions, a throw or objects sit on the old piece (the piece's own seat and back cushions are part of its design and are always copied): نرجّعها على القطعة الجديدة (مقترح) / القطعة نظيفة بدونها / مثل المرجع.

**Card 2S** (suggestion path) — one **البديل** question per chosen piece (max 4), each with 3–4 alternatives built from the read: they fit the room's style and palette, the slot's footprint and the light. Order: one that continues the room's language (مقترح) · one with an accent colour already repeated in the room · a different form (curved against boxy, open legs against a solid base) · optionally a statement piece. Label = 2–4 Arabic words (كنبة منحنية بوكليه); description = material, colour and base in Arabic; `preview` = the English one-line summary. Add **الإكسسوارات** if objects sit on the old piece, and **التوأم** if a chosen piece is ×2, while slots are free. Once one is chosen, write a full spec sheet for it with the same headings and post it for correction — a suggestion needs to be as precise as a reference.

At most two card rounds after Card 1 (plus waiting for the image). Anything still open goes on one follow-up card, never more.

## 3 Decide (silently, before writing)

- **Exact copy from Image 2.** The new piece is that product: every count, proportion, material, colour and detail on the spec sheet. Nothing of the old piece's design survives — not its silhouette, arms, cushions, base, proportions or upholstery; the old piece only lends its place and its pose. No restyling toward the room's palette, no simplification, no "similar" piece.
- **Pose from Image 1, always.** The new piece stands where the old one stood, on the same footprint, with the same rotation, facing, viewing angle and handedness, and its edges follow the room's vanishing lines. The reference's camera angle, lighting, background and shadows never enter the prompt. Sides the render shows but the reference hides continue the visible design (same material and detailing, no invented features). Handedness follows الاتجاه (default: as in the render, mirroring the reference).
- **Size fits the space; the design does not bend.** Start from the piece's real size (store dimensions, else typical sizes from the vocabulary file, checked against the reference's proportions). Centre it on the old piece's position, aligned to the same wall or rug edge, and check it against things in the frame: the old piece's height, a window sill (≈ 0.9 m), a door (≈ 2.1 m), a counter (≈ 0.9 m), neighbouring seat heights. Larger than the slot → it extends into free floor, never over a neighbour, a door, a window or a walkway; if it cannot, ask **المقاس**. Never shrink it below its real size or squash one dimension to fit: a sofa scaled down to fit looks like a toy and its seat no longer matches the room. Write the size as visible relationships ("its back reaching just below the window sill") with cm as support.
- **Footprint changes.** Smaller → the area revealed behind and under it is filled by the continuation of what Image 1 shows there (wall, skirting, curtain, floor, rug pattern), named in the prompt.
- **Overlaps stay overlaps.** Whatever stood in front of the old piece still covers the new one at the same place; whatever sat on it follows **الإكسسوارات**; whatever it touched (rug, wall, side table) still touches it.
- **Look from Image 1.** Every item of مؤثرات الصورة goes into the prompt: key light side and colour, accents, shadow direction and softness matching the other furniture, contact shadow and ambient occlusion, reflections in a glossy floor, mirror or glass (old reflection replaced), depth of field at its depth, grade, grain, bloom, vignette, rendering style. Name how its own materials answer that light (fabric sheen on the lit side, metal reflecting the window and lamps, glass showing the room behind). It must be no sharper, cleaner, brighter or more saturated than its neighbours at the same depth — that is what makes it read as rendered in. The light changes how the copied colours look on screen, never the colours themselves.
- **One step or two.** Default: one prompt that removes and places in the same pass. Use **two steps** — Pass A erases the old piece and rebuilds the room behind it, Pass B places the copy in the empty spot — when the new piece's form differs strongly from the old one (curved against boxy, a chair replacing a sofa, legs against a solid base), or when a one-step try came back as a hybrid. A model morphs an object that is still in the frame; an empty spot leaves it nothing to morph. Pass B carries the old footprint and pose in words from the read, because the old piece is no longer there to show them.
- **Passes.** One piece, or one ×2 pair, per pass. Several pieces → Pass 1, Pass 2… from the back of the room to the front, each using the previous result as Image 1. Say why in one Arabic line: narrow edits hold the room far better than several at once.
- **Red outline.** Recommend a thin red outline around the old piece (and its shadow) when only one of a ×2 pair changes, a similar piece stands nearby, the piece is small in frame, or a first try drifted. With GPT Image, use its mask or selection instead.
- **Adding into an empty spot** works the same way: the pose comes from the nearest wall, rug edge or neighbour instead of an old piece.
- **Hand-off** (say so in one Arabic line and load it): re-covering the old piece in a new fabric or colour while keeping its shape, or a wall, floor or other surface material → `banana` (material swap); copy light or mood from another image → `render-style-transfer`; make the whole render more realistic → `arch-prompt-interviewer`; a new camera angle → `architectural-camera-angle-planner`. If that skill is not installed, say so and continue here on the closest path.

## 4 Write

Banana-style structure: opening lock → the copy (spec sheet) → placement and orientation → size → contact and overlaps → integration → removal → PRESERVE / EXTRACT / REPLACE → closing lock. Fill every bracket from the read and the spec sheet; drop any sentence that does not apply (no reflection sentence without a glossy surface). About 300–450 words; the spec sheet is the longest part and earns its length.

```
Using Image 1 as the base, remove the [old piece: type and look] [position in the room] completely and put in its place an exact copy of the [piece] shown in Image 2. Keep the camera position, lens, framing, perspective and aspect ratio, the room architecture, every other piece of furniture and decor, and all lighting exactly as in Image 1.

The new piece is that exact [piece] from Image 2, copied faithfully: [spec sheet in this order — type and silhouette; proportions as ratios; base with exact leg count, shape and material; each part and its shape; cushions with exact count, thickness and seams; material, colour and finish of each part; details; then "it has no [piping / buttons / visible legs]"]. Reproduce its silhouette, proportions, part counts, materials, colours and details exactly; do not simplify, restyle, recolour or invent features, and keep nothing of the old [piece]'s shape, arms, cushions, base, proportions or upholstery. From Image 2 take only this piece; ignore its camera angle, viewpoint, lighting, shadows, background and every other object in it.

Placement and orientation: it stands exactly where the old one stood, on the same footprint [from … to …], in the same pose as the old piece in Image 1 — not the pose shown in Image 2. Its front faces [fixed element]; its back is [against / parallel to …]. The camera sees it in [three-quarter view from the left, with its left arm nearest the camera and its left side visible], from [slightly above, so the seat reads as a surface]. Its long edges run parallel to [the rug's front edge] and recede toward the [right] vanishing point of the room. [The sides hidden in Image 2 continue the same material and detailing.]

Size: its real size, about [230 × 95 × 72 cm]: [its back reaches just below the window sill; its seat matches the armchair's seat height], centred on the old piece's position [and extending a little further to the right into free floor].

Contact and overlaps: [it stands on the rug, rear legs on the floor]; [the coffee table in front still covers its lower front exactly as before]; [the same three cushions and grey throw rest on its seat].

Integration: light it only with the scene's own light — [soft daylight from the tall window on the left, about 5000K, brightest on its left arm and front, falling off to the right] [and a warm 2700K glow from the floor lamp on its right]. Its shadows fall [to the right and back], as soft as those of the other furniture, with a soft contact shadow and ambient occlusion where it meets the [rug]; [its blurred reflection appears in the polished floor, replacing the old one]. Its materials react to this light: [the bouclé loops catch the light on the lit side; the brushed brass legs show soft highlights of the window]. It shares Image 1's [warm grade, gentle contrast, slight bloom near the window, fine grain and soft focus at this depth] and is no sharper, cleaner, brighter or more saturated than the furniture around it.

No part of the old [piece] remains — no legs, arms, cushions, outline, shadow or reflection. [Where the new piece is lower, the wall, skirting and curtain behind it continue exactly as in Image 1.]

PRESERVE: [walls, ceiling, windows and curtains by name; the floor and rug; each neighbouring piece by name; the objects on them; every light source and its glow].
EXTRACT (Image 2): the [piece] itself — its complete design: shape, proportions, part counts, materials, colours and details.
REPLACE: [old piece] → an exact copy of the [piece] in Image 2.

Only the [piece] changes; the camera, the room and every other object stay identical to Image 1. Photorealistic, same resolution and aspect ratio, no added text, logos or watermarks.
```

Variations:
- **Suggestion path** — no Image 2: "put in its place a [piece]: [spec sheet]"; drop the Image 2 sentences and EXTRACT.
- **More views of the same piece** — "Images 2 and 3 show the same [piece] from different angles; use them together to copy it exactly." EXTRACT names both.
- **Shorter version** (المقاس) — after the spec sheet: "Make it a [two-seat] version of the same design: every part keeps its exact design, thickness and width, with [two] seat cushions instead of [three]."
- **Two steps** —
  Pass A: "Using Image 1, remove the [old piece] [position] completely, together with [the cushions and throw on it,] its shadow and its reflection. Fill its place with the continuation of what lies behind and under it: [the wall, skirting, curtain, oak floor and the rug's pattern and border], with matching texture, perspective and light. Everything else stays identical to Image 1: same camera, framing, light and resolution; no new objects."
  Pass B: the main template with Image 1 = Pass A's result; the opening becomes "place an exact copy of the [piece] in Image 2 on the empty [floor / rug] where the old [piece] stood: [footprint and pose in words from the read]", the removal paragraph is dropped, and the accessories (if kept) are described by colour, count and position from the read.
- **Stylised, clay or sketch render** — replace "Photorealistic" with "in exactly the same rendering style as Image 1 ([style])".
- **Red outline** — add after the opening lock: "The thin red outline marks the old piece only; follow the real edges of the new piece, not the outline." And at the end: "The red outline is a placement guide only and must leave no trace."
- **×2 pair** — "replace both [armchairs] with exact copies of the [chair] in Image 2; each keeps its own position, facing and viewing angle from Image 1; the two are identical."

## 5 Deliver

1. **الصور المطلوبة:** Image 1 = الرندر · Image 2 = صورة القطعة (+ Image 3 for another view, + one line for the red outline if recommended).
2. Each prompt in its own code block; **Pass 1**, **Pass 2** (or **Pass A**, **Pass B**) labels outside the blocks.
3. A short negative-prompt block only for a tool that has that field: `mix of old and new design, old sofa shape with new fabric, wrong cushion count, simplified design, front-facing product view, studio lighting, white background, floating furniture, missing shadow, toy-sized furniture, duplicated furniture, changed room, extra objects, text, watermark` (swap "sofa" and "cushion" for the piece's own parts).
4. **ملاحظات** (Arabic, 2–4 short bullets): الافتراضات · طريقة الرفع (Nano Banana and Seedream: upload the render first, then the reference — the order sets Image 1 and Image 2; crop the reference to the piece alone · GPT Image: mask the old piece a little larger than it, including its shadow) · وش تراقب أول شي (هل هي نفس القطعة بالضبط — عدّ المخدات والأرجل والتفاصيل، ما بقى شي من شكل القديمة، الاتجاه والزاوية، الظل).
5. One closing line offering the next step: the next piece from the inventory, or reviewing the result.

## 6 Run and review

Run only when asked: load the generator's skill (for example `banana` with its tools, or Nim) and follow its upload rules; run one pass, show the result and stop; start the next pass only after approval.

When a result comes back, read `references/review-and-fixes.md` and score it before writing any fix.
