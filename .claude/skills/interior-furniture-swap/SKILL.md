---
name: interior-furniture-swap
description: "Reads an interior render or photo, lists every swappable piece of furniture, lighting and soft furnishing (position, facing, viewing angle, overlaps, swap difficulty), then uses short AskUserQuestion cards to pick the piece and either request a reference image or suggest alternatives that fit the room. Writes one design-locked English prompt (Nano Banana, Seedream, GPT Image) that replaces only that piece: same spot, footprint, orientation and viewing angle as the old piece in the render, never the angle of the reference photo, and lit, shadowed, reflected, blurred and graded by the render's own light and effects so it looks rendered in, not pasted. Use whenever the user wants to change or try another sofa, chair, table, bed, lamp or rug in an interior image, with or without a product photo. Trigger: بدّل الأثاث, غيّر الكنبة, استبدل الكرسي, حط هذي القطعة بدل, قطعة أثاث من صورة مرجعية, furniture swap. Not for a wall or floor material (banana) or copying light from another render (render-style-transfer)."
---

# Interior Furniture Swap

Swapping one piece in a render fails in four predictable ways. Every rule below exists to stop one of them:

1. **Room drift** — the model re-renders the whole frame; walls, other furniture or the light shift.
2. **Reference pose leak** — the new piece arrives in the camera angle of the product photo (usually straight-on and studio-lit) instead of the pose the old piece had in the render, so it looks pasted in.
3. **Sticker look** — the piece is sharper, cleaner, brighter or differently coloured than the room around it: no contact shadow, no floor reflection, wrong blur, no grain.
4. **Leftovers** — a leg, an arm, the old shadow or the old reflection stays behind.

So every prompt takes three things from three places:
- **Pose ← Image 1** (the render): position, footprint, rotation, facing, viewing angle, handedness, scale, overlaps.
- **Design ← Image 2** (the reference) or the chosen suggestion: form, proportions, details, materials, colours.
- **Look ← Image 1** again: light, shadows, reflections, depth of field, colour grade, grain, rendering style.

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
- **المكان** — where it stands in the room and in the frame (centre, against the back wall, on the rug).
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

**عندي صورة مرجعية** → end the turn with one Arabic line asking for the image, with two tips: a photo of the piece alone (a store product photo is fine), ideally from an angle close to its angle in the render; several pieces → one image per piece, in the order of their numbers.

**Read the reference** when it arrives (max 5 lines):
- **القطعة** — type and design in physical terms: silhouette, proportions, arms, base or legs, cushions, upholstery, colour, finish, details (vocabulary: `references/furniture-vocabulary.md`).
- **الزاوية** — reference angle against the slot's angle: «المرجع أمامي مستقيم · في الرندر 3/4 من اليسار → بنلفّها، والجنب الأيسر اللي ما يبان في المرجع يكمل بنفس الخامة والتفاصيل».
- **المقاس** — proportions against the slot (three seats against two, round against rectangular) or «متقاربة».
- **الاتجاه** — handedness mismatch, if any (chaise on the right in the reference, on the left in the render).
- **ما نأخذه** — the background, other objects, lighting and logos in the reference are ignored. If it shows several pieces, list them.

**Card 2R** (reference path) — only the questions that apply; if more than four apply, the first four in the order أي قطعة · تأكيد · ناخذ منه · التوأم · المقاس · الاتجاه · الإكسسوارات go on this card and the rest on one more:
- **ناخذ منه**: الشكل والخامة كما هي (مقترح) / الشكل فقط بخامات الفراغ / الخامة واللون فقط على القطعة الحالية.
- **المقاس** — only when proportions differ: نسخة بمقاس المكان الحالي (مقترح) / بمقاسها الحقيقي.
- **الاتجاه** — only when handedness differs: زي الرندر، نعكس المرجع (مقترح) / زي المرجع.
- **الإكسسوارات** — only when objects sit on the old piece: نرجّعها على القطعة الجديدة (مقترح) / القطعة نظيفة بدونها / مثل المرجع.
- **أي قطعة** — only when the reference shows several pieces.
- **التوأم** — only when a chosen piece is ×2 and Card 1 did not ask it.
- **تأكيد** — only when the old piece's pose is ≈ or ?: 2–3 readings, the one with the most visible evidence first.

**Card 2S** (suggestion path) — one **البديل** question per chosen piece (max 4), each with 3–4 alternatives built from the read: they fit the room's style and palette, the slot's footprint and the light. Order: one that continues the room's language (مقترح) · one with an accent colour already repeated in the room · a different form (curved against boxy, open legs against a solid base) · optionally a statement piece. Label = 2–4 Arabic words (كنبة منحنية بوكليه); description = material, colour and base in Arabic; `preview` = the English spec line that will go into the prompt. Add **الإكسسوارات** if objects sit on the old piece, and **التوأم** if a chosen piece is ×2, while slots are free.

At most two card rounds after Card 1 (plus waiting for the image). Anything still open goes on one follow-up card, never more.

## 3 Decide (silently, before writing)

- **Pose from Image 1, always.** The new piece stands where the old one stood, on the same footprint, with the same rotation, facing, viewing angle and handedness, and its edges follow the room's vanishing lines. The reference's camera angle, lighting, background and shadows never enter the prompt. Sides the render shows but the reference hides continue the visible design (same material and detailing, no invented features). Handedness follows الاتجاه (default: as in the render, mirroring the reference).
- **Scale from the room.** Size the piece against things in the frame — the old piece's own height, a window sill (≈ 0.9 m), a door (≈ 2.1 m), a counter (≈ 0.9 m), neighbouring seat heights — and against typical sizes in `references/furniture-vocabulary.md`. Write it as a visible relationship ("its back reaching just below the window sill") with cm as support.
- **Footprint changes.** Smaller → the area revealed behind and under it is filled by the continuation of what Image 1 shows there (wall, skirting, curtain, floor, rug pattern), named in the prompt. Larger → it may cover more wall and floor behind it, but never a neighbouring piece, a door, a window or anything in front of it, and it keeps clear of its neighbours. If it cannot fit, say so in one Arabic line and offer **المقاس**.
- **Overlaps stay overlaps.** Whatever stood in front of the old piece still covers the new one at the same place; whatever sat on it follows **الإكسسوارات**; whatever it touched (rug, wall, side table) still touches it.
- **Look from Image 1.** Every item of مؤثرات الصورة goes into the prompt: key light side and colour, accents, shadow direction and softness matching the other furniture, contact shadow and ambient occlusion, reflections in a glossy floor, mirror or glass (old reflection replaced), depth of field at its depth, grade, grain, bloom, vignette, rendering style. Name how its own materials answer that light (fabric sheen on the lit side, metal reflecting the window and lamps, glass showing the room behind). It must be no sharper, cleaner, brighter or more saturated than its neighbours at the same depth — that is what makes it read as rendered in.
- **الخامة واللون فقط** → the old piece keeps its exact shape, size, pose, cushions and base; only its upholstery or finish changes to Image 2's colour, texture and pattern, at a pattern scale sized to the real piece.
- **Passes.** One piece, or one ×2 pair, per pass. Several pieces → Pass 1, Pass 2… from the back of the room to the front, each using the previous result as Image 1. Say why in one Arabic line: narrow edits hold the room far better than several at once.
- **Red outline.** Recommend a thin red outline around the old piece (and its shadow) when only one of a ×2 pair changes, a similar piece stands nearby, the piece is small in frame, or a first try drifted. With GPT Image, use its mask or selection instead.
- **Adding into an empty spot** works the same way: the pose comes from the nearest wall, rug edge or neighbour instead of an old piece.
- **Hand-off** (say so in one Arabic line and load it): a wall, floor or other surface material → `banana` (material swap); copy light or mood from another image → `render-style-transfer`; make the whole render more realistic → `arch-prompt-interviewer`; a new camera angle → `architectural-camera-angle-planner`. If that skill is not installed, say so and continue here on the closest path.

## 4 Write

Banana-style structure: opening lock → reference role → placement and orientation → contact and overlaps → integration → removal → PRESERVE / EXTRACT / REPLACE → closing lock. Fill every bracket from the read; drop any sentence that does not apply (no reflection sentence without a glossy surface). About 200–350 words: every sentence either defines the change or stops drift.

```
Using Image 1 as the base, replace only the [old piece: type and look] [position in the room] with the [piece] shown in Image 2. Keep the camera position, lens, framing, perspective and aspect ratio, the room architecture, every other piece of furniture and decor, and all lighting exactly as in Image 1.

Image 2 is a design reference only: take its [form, proportions, base, arms, cushions, upholstery, colours and details]; ignore its camera angle, viewpoint, lighting, shadows, background and every other object in it.

Placement and orientation: the new [piece] stands exactly where the old one stood, on the same footprint [from … to …], in the same pose as the old piece in Image 1 — not the pose shown in Image 2. Its front faces [fixed element]; its back is [against / parallel to …]. The camera sees it in [three-quarter view from the left, with its left arm nearest the camera and its left side panel visible], from [slightly above, so the seat reads as a surface]. Its long edges run parallel to [the rug's front edge] and recede toward the [right] vanishing point of the room. [The sides hidden in Image 2 continue the same material and detailing.] Scale: [its back reaches just below the window sill; about 220 cm long].

Contact and overlaps: [it stands on the rug, rear legs on the floor]; [the coffee table in front still covers its lower front exactly as before]; [the same three cushions and grey throw rest on its seat].

Integration: light it only with the scene's own light — [soft daylight from the tall window on the left, about 5000K, brightest on its left arm and front, falling off to the right] [and a warm 2700K glow from the floor lamp on its right]. Its shadows fall [to the right and back], as soft as those of the other furniture, with a soft contact shadow and ambient occlusion where it meets the [rug]; [its blurred reflection appears in the polished floor, replacing the old one]. Its materials react to this light: [the bouclé loops catch the light on the lit side; the brushed brass legs show soft highlights of the window]. It shares Image 1's [warm grade, gentle contrast, slight bloom near the window, fine grain and soft focus at this depth] and is no sharper, cleaner, brighter or more saturated than the furniture around it.

No part of the old [piece] remains — no legs, arms, cushions, outline, shadow or reflection. [Where the new piece is lower, the wall, skirting and curtain behind it continue exactly as in Image 1.]

PRESERVE: [walls, ceiling, windows and curtains by name; the floor and rug; each neighbouring piece by name; the objects on them; every light source and its glow].
EXTRACT (Image 2): [the piece's form, proportions, materials, colours and details] only.
REPLACE: [old piece] → [new piece].

Only the [piece] changes; the camera, the room and every other object stay identical to Image 1. Photorealistic, same resolution and aspect ratio, no added text, logos or watermarks.
```

Variations:
- **Suggestion path** — no Image 2: replace "the [piece] shown in Image 2" with a physical description (form, size, base, cushions, materials with their finish, colour, details), and drop the reference-role sentence and EXTRACT.
- **الخامة واللون فقط** — "keep its exact shape, size, pose, cushions and base; change only its [upholstery / finish] to the [fabric or finish] of Image 2: [colour, texture, pattern and its real scale]."
- **Stylised, clay or sketch render** — replace "Photorealistic" with "in exactly the same rendering style as Image 1 ([style])".
- **Red outline** — add after the opening lock: "The thin red outline marks the old piece only; follow the real edges of the new piece, not the outline." And at the end: "The red outline is a placement guide only and must leave no trace."
- **×2 pair** — "replace both [armchairs]; each keeps its own position, facing and viewing angle from Image 1; the two are identical."

## 5 Deliver

1. **الصور المطلوبة:** Image 1 = الرندر · Image 2 = صورة القطعة (+ one line for the red outline if recommended).
2. Each prompt in its own code block; **Pass 1**, **Pass 2** labels outside the blocks.
3. A short negative-prompt block only for a tool that has that field: `front-facing product view, studio lighting, white background, floating furniture, missing shadow, duplicated furniture, changed room, extra objects, text, watermark`.
4. **ملاحظات** (Arabic, 2–4 short bullets): الافتراضات · طريقة الرفع (Nano Banana and Seedream: upload the render first, then the reference — the order sets Image 1 and Image 2; crop the reference to the piece alone · GPT Image: mask the old piece a little larger than it, including its shadow) · وش تراقب أول شي (the pose and viewing angle, leftovers of the old piece, the contact shadow).
5. One closing line offering the next step: the next piece from the inventory, or reviewing the result.

## 6 Run and review

Run only when asked: load the generator's skill (for example `banana` with its tools, or Nim) and follow its upload rules; run one pass, show the result and stop; start the next pass only after approval.

When a result comes back, read `references/review-and-fixes.md` and score it before writing any fix.
