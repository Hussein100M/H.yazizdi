---
name: interior-closeup-planner
description: Reads an interior render or photo and lists every close-up and camera angle it can really give, such as sofa fabric, cushions, coffee or dining table styling, lamps and pendants, joinery and wall finishes, rugs, curtains, decor, people, and seated, orbit or corner views. It rates each shot by how much the reference actually shows, lets the user pick several on AskUserQuestion cards, then writes one design-locked English prompt per shot (Nano Banana, Seedream, GPT Image) in which only the camera moves, while furniture, fabrics, colors, objects, people and light stay identical. Use it whenever the user attaches an interior image and wants close-ups, detail shots, new angles, a set of shots, or asks which shots are available. Triggers include كلوز اب للداخلي, لقطات قريبة, قرّب على الكنبة, خامة الكنبة, ديتيل شوت, غيّر زاوية الغرفة, حلل الصورة واعطني اللقطات المتاحة, interior close-up. Not for exteriors (architectural-camera-angle-planner) or swapping a furniture piece (interior-furniture-swap).
---

# Interior Close-up Planner

The user gives one interior image (render or photo). Read the room, list the shots it can really give (close-ups of real elements plus new camera angles), let the user pick one or many, and write one prompt per chosen shot. **Only the camera changes.** The architecture, furniture, fabrics, colors, objects, people and light stay exactly as in the reference.

Talk to the user in their language (usually Arabic, often Gulf or Yemeni dialect). Write the prompts in English. This skill makes still images only; if the user asks for video, offer the shots as key frames.

If no image is attached, ask for it in one line. The shot list depends entirely on what this specific room shows, so a generic list would mislead the user.

---

## Why shots fail

An image model can only re-photograph what the reference shows. When the new camera asks for more than the reference holds, the model invents something: a new weave on the sofa, extra books on the table, a fourth wall, a different face. Two things decide how much it has to invent:

1. **Pixel budget:** how large and sharp the target is in the reference. A sofa that fills half the frame can become a fabric close-up. A vase that is a few dozen pixels wide cannot, because the texture the close-up needs does not exist in the image.
2. **Revealed area:** how much of the room the new camera sees that the reference does not, such as the wall behind the original camera, the back of the sofa, the underside of the table, the top of a tall cabinet, or the inside of a shelf.

Every rating and every lock sentence below exists to keep both of these small. Explain ratings to the user in these terms ("الكنبة واضحة وكبيرة في الصورة، فاللقطة آمنة" / "المزهرية صغيرة، فالموديل بيخترع تفاصيلها") so they understand why a shot is risky, not just that it is.

---

## Lock rules

**Full Lock (default; none of this changes):**
- Architecture: walls, openings, ceiling design, cornices, flooring, built-in joinery and fixed lighting.
- Furniture and layout: every piece keeps its position, size, shape, orientation, legs and frame.
- Soft furnishings: fabric type, weave, pile, pattern scale and direction, color, sheen, stitching and piping, the number and arrangement of cushions, throws, curtains and rugs.
- Objects: the count, position, shape, color and material of every decor item, book, plant, piece of tableware and artwork.
- People: identity, face, age, skin tone, hair, clothing, accessories, pose and position.
- Light and grade: light sources, direction, color temperature, time of day, the view outside the windows, and the overall color grade.

**What changes, only because the camera moved:**
- Perspective, framing and depth of field. Parts that fall out of focus become soft blur in the same colors and shapes. Blur lets a close-up avoid redesigning whatever it cuts off.
- Highlights, reflections and shadows shift with the viewing angle, but they still come from the same sources.
- Newly revealed surfaces are only a plain continuation of the visible ones (the same wall finish, the same floor). Never add new objects, doors, windows or art there.

**Opt-in changes (only when the user asks):** adding people to an empty room, letting people change pose or expression, changing the time of day. When the user opts in, change only that one thing and keep the Full Lock on everything else.

---

## Workflow

### Step 1: Read the room (in the user's language, short, no prompts yet)

1. **Room and style:** room type, style, and whether it is a render or a photo.
2. **Current camera:** height in meters, lens in mm, distance to the main subject, perspective type, horizon position and aspect ratio.
3. **Light:** the sources (which windows, on which side; which fixtures, on or off), the direction, the color temperature (warm, neutral or cool), the time of day and how soft the shadows are.
4. **Inventory with numbers:** every element worth locking, counted where it can be counted. For example: "كنبة بوكليه رمادية 3 مقاعد، 5 وسائد (2 بيج، 2 زيتي، 1 مقلّم)"، "طاولة رخام أبيض بعروق رمادية، عليها صينية + 3 كتب + مزهرية فيها أغصان". For people, give the count, clothing and pose. These counts go into the prompts word for word, because counted items are the ones models most often add or drop.
5. **Visible and hidden:** which walls can be seen, what the frame edge cuts off, what is hidden (behind the sofa, under the table, inside cabinets), and the hidden wall behind the camera.
6. **Pixel budget:** roughly how much of the frame width each close-up candidate takes up, and whether it is sharp. This is the input for Step 2.

### Step 2: Build the list of available shots

**A. Close-ups.** Offer only elements that are really visible. Use the catalog below as a menu, and name the real element and where it sits ("the left armrest of the grey bouclé sofa", not "the sofa").
- ✅ The target is at least about 1/4 of the frame width and sharp, and the close-up shows only what is already visible.
- ⚠️ The target is about 1/10 to 1/4 of the frame width, or it is partly hidden or soft, or the shot is a macro that needs more texture than the reference holds. Recommend a crop as Image 2 and say what may be invented.
- ❌ The target is under about 1/10 of the frame width, mostly hidden, or blurred in the reference. Do not offer it. If the user asks for it, explain why and ask for a higher-resolution image or a crop of that area.

**B. Angle changes.** Use the angle catalog below.
- ✅ An orbit of 20° or less, a height between about 0.8 and 1.6 m, or a lens change that does not reveal walls the reference does not show.
- ⚠️ An orbit of 20–35°, a move into a corner where part of an unseen wall appears, or an elevated view that shows the tops of furniture.
- ❌ A reverse shot, an orbit over about 45°, or any view of the hidden wall. These need a second reference image.

If the user has already named shots, rate each one first. For a ❌ shot, explain why and offer the closest ✅ shot.

### Step 3: Show the options table

Put all shots in one numbered table, close-ups first and then angles. Columns:

| # | اللقطة (عربي + English) | الهدف بالتحديد | الارتفاع | المسافة | العدسة / FOV | الفتحة | وش يبان / وش ما يبان | التقييم |

Aim for 5–8 close-ups and 3–5 angles, and fewer when the room is simple. Never pad the list with shots the room cannot support; a short honest list is worth more than a long one that produces invented details.

### Step 4: Ask which shots to make

Use AskUserQuestion with `multiSelect: true`. A card holds at most 4 options per question and 4 questions, so split the choices:
1. Close-ups: the 4 most valuable and safest.
2. More close-ups: the next 4, only if they exist.
3. Angles: up to 4.
4. Tool and aspect ratio, only if they are not known. Default to Nano Banana, 4:5 for close-ups, and the reference ratio for angles.

The user can type table numbers under "Other". If they answer "كلها" or "سيت كامل", use the full-set preset below. If the user already named the shots in the request, skip the card.

**Full-set preset:** about 6 shots that work together as a presentation of the room: the most distinctive material close-up, a table vignette, a lighting detail, people (or the cushion arrangement if the room is empty), a seated eye-level orbit, and one close-up of the room's signature element. Keep only ✅ and ⚠️ shots, and say what was left out and why.

### Step 5: Write the prompts

- **One prompt per shot**, each complete and independent, in its own code block. Put a label outside the block with the number, the Arabic name and the rating. After the block, add a one- or two-line note in the user's language with the settings and what to check in the result.
- **Full lock in every prompt.** Repeat the inventory sentence and the lock sentences in each one, and never write "same as above". The user runs each prompt in a separate chat, where the model has seen nothing else.
- **Always use the original reference.** Do not chain results (one output as the next input). The only exception is an orbit beyond about 35°: suggest an intermediate shot first and say so in that shot's note.
- **Order:** ✅ before ⚠️. Mark every prompt that needs a crop as Image 2, and say exactly what area to crop.
- **Consistency across the set:** use the same names for materials and objects, the same light description and the same color grade in every prompt, so the set reads as one photo shoot.
- **Size:** up to 6 prompts per reply. If the user picked more, write 6 and offer the rest in the next reply.
- **Run note (once, after all the prompts):** run each prompt in a new chat with the reference attached, list which prompts need a crop, and say which prompt to test first (the largest orbit or the tightest macro), since that one shows fastest whether the model is holding the design.

---

## Close-up catalog

| Type | Camera height | Distance | Lens / FOV | Aperture | Sharp focus on | Usual rating |
|---|---|---|---|---|---|---|
| Upholstery macro (sofa or armchair fabric, leather) | 0.8–1.0 m, light grazing at about 30° | 0.8–1.5 m | 90–100 mm macro / ~20° | f/2.8 | weave, stitching, piping, seams | ⚠️ attach crop |
| Cushions and throw | 0.9–1.1 m | 1.2–2 m | 70–85 mm / 24–29° | f/2.8–4 | cushion fabrics, layering, throw folds | ✅ |
| Coffee table vignette | 0.9–1.1 m, 10–20° down | 1.5–2.2 m | 50–70 mm / 29–40° | f/4 | tabletop material, edge profile, objects | ✅ |
| Dining table setting | 1.2–1.4 m, 25–35° down | 1.5–2.5 m | 50 mm / 40° | f/4 | plates, cutlery, centerpiece, chair backs | ⚠️ tableware counts |
| Side table and lamp | 1.0–1.3 m | 1.5–2 m | 85 mm / 24° | f/2.8 | shade, base, glow, light falloff on the wall | ✅ |
| Pendant or chandelier | 1.4–1.6 m, tilted up 20–35° | 2–3 m | 70–85 mm | f/4 | fixture form, glow, nearby ceiling | ⚠️ ceiling beyond the frame |
| Joinery and wall finish (panels, fluting, niches, shelving) | 1.2–1.5 m, parallel to the surface | 1–2 m | 50–85 mm | f/5.6 | panel joints, edges, integrated lighting | ⚠️ attach crop |
| Material junction (floor to wall, marble to wood, rug edge to floor) | 0.4–0.8 m | 0.8–1.5 m | 85–100 mm | f/4 | the meeting line of the two materials | ⚠️ attach crop |
| Rug and furniture leg | 0.3–0.6 m | 0.8–1.5 m | 50–85 mm | f/2.8 | rug pile, leg finish, floor | ⚠️ |
| Curtain and window light | 1.2–1.5 m | 1.5–2.5 m | 50–85 mm | f/2.8 | fabric fall, sheer translucency, light through it | ✅ the view outside stays the same blur |
| Shelf or decor vignette | 1.2–1.5 m | 1.2–2 m | 70–85 mm | f/4 | objects, books, plants | ⚠️ counts |
| Artwork | at the center height of the art, parallel to the wall | 1.5–2.5 m | 50–85 mm | f/5.6 | the artwork exactly as it is | ⚠️ models redraw art, so attach a crop |
| Kitchen counter, backsplash, tap | 1.1–1.3 m | 1–1.8 m | 50–85 mm | f/4 | counter veining, tile layout, tap finish | ⚠️ |
| Bed linen and headboard | 0.9–1.2 m | 1.2–2 m | 70–85 mm | f/2.8 | linen texture, headboard upholstery | ✅ or ⚠️ |
| People, medium shot (waist up) | subject's eye height (1.1–1.2 m seated, 1.5–1.6 m standing) | 2–3 m | 50 mm / 40° | f/2.8 | faces, clothing, hands | ✅ if faces are large in the reference, ⚠️ if small |
| People, hands and activity (a cup, a book) | 1.0–1.2 m | 1–1.5 m | 85 mm | f/2.8 | hands, the object, sleeve fabric | ✅ |
| People, over the shoulder | 1.2–1.4 m, behind a person, facing a part of the room that is already visible | 1–1.5 m behind them | 35 mm | f/4 | the room sharp, the person soft | ⚠️ the back of the person is invented |

Rules for close-ups:
- Name the real element and where it is in the room.
- Say what is in sharp focus, and that the rest falls into soft blur in the same colors and shapes.
- Grazing light shows texture, but it has to be the existing light. Name the source (for example "from the window on the left") instead of adding a new one.
- Models change faces easily. If the faces in the reference are small (under about 1/12 of the frame height), rate the shot ⚠️, prefer hands, activity, profile or back views, and warn that the faces may drift.
- Put counted things (cushions, books, plates, chairs, people) into the prompt as numbers.

---

## Angle catalog (interiors)

| Angle | Height | Lens / FOV | Rating | Notes |
|---|---|---|---|---|
| Orbit 10–20° left or right | same as the reference | same lens | ✅ | the safest way to get a new angle |
| Seated eye level | 0.9–1.1 m | 24–35 mm / 54–74° | ✅ | horizon at seated eye height, a lifestyle feel |
| Standing eye level, lens change | 1.5–1.6 m | 24–35 mm | ✅ | tighter or wider from the same spot |
| Low hero | 0.5–0.7 m | 24 mm | ⚠️ | furniture feels grand; more ceiling shows and undersides may show |
| Corner wide (two-point) | 1.2–1.5 m in a corner the reference shows | 16–20 mm / 84–97° | ⚠️ | ❌ if the corner is not visible |
| One-point centered | 1.2–1.4 m | 18–24 mm | ✅ or ⚠️ | only if the back wall is fully visible |
| Framed through a real doorway or arch | 1.5 m | 24–28 mm | ⚠️ | only an opening that exists in the reference |
| Telephoto from the far side of the room | 1.2–1.4 m | 50–70 mm | ⚠️ | needs room depth in the reference |
| Elevated 45° | 2.2–2.6 m | 20–24 mm | ⚠️ | the tops of furniture and shelves are invented |
| Vertical 9:16 for social media | same position | 24–28 mm | ✅ | a crop that layers foreground and background |

**Perspective rules for every prompt:** vertical lines stay perfectly vertical (architectural shift-lens correction), the horizon equals the camera height, there is no fisheye or barrel distortion, and walls stay straight. Keep real proportions: seat height about 45 cm, coffee table 40–45 cm, dining table about 75 cm, doors 2.1–2.4 m, ceilings 2.7–3.2 m.

**Visibility lock for every prompt:** give the camera height in meters, and write one sentence on what is visible from there and what is not. Lowering the camera reveals the undersides of tables and seats, and raising it reveals the tops of shelves and cabinets. If the reference does not show those surfaces, keep them out of the frame or say they are not visible.

---

## Prompt template

Write each prompt as flowing prose, with no bullets or labels inside it, and put the lock at both the start and the end.

```
Using the reference image as the sole and absolute source of truth for the room, its furniture, materials, objects, people and light, re-photograph the exact same interior as [shot name] without changing anything in it; only the camera moves. [Camera move: orbit X° to the left/right around the seating area / move to about X m from the element] at a camera height of X m, [tilt if any], with the horizon at X m, shot on an X mm lens (approx. X° horizontal field of view) at f/X, with all vertical lines perfectly vertical, [one/two]-point perspective and no fisheye or barrel distortion. The frame shows [the real element by name and position, and what surrounds it]; [focus target] is in sharp focus, while [the rest] falls into soft natural blur that keeps the same colors and shapes as the reference. From this position [visible surfaces] can be seen, while [hidden wall / undersides / tops] are not visible and must not appear. Preserve exactly [inventory sentence with counts: each piece of furniture's shape, size and position; fabric type, weave, pattern, color, sheen and stitching; every object with its count; each person's identity, face, clothing and pose]. [Image 2 sentence, if a crop is attached.] Keep the original light: [sources and direction], [color temperature], [time of day], with highlights, reflections and shadows coming from those same sources and shifting only as the new viewpoint requires. Do not add, remove, move, resize, recolor or redesign any furniture, cushion, object, plant, artwork, person, material, fixture or architectural element; anything not visible in the reference is only a plain, logical continuation of the visible surfaces. Photorealistic interior photography, [aspect ratio]. The room must remain identical to the reference image in every detail.
```

**Image 2 sentence:** `Image 2 is a close crop of the same area from the original image and sets the exact detail: the [weave / veining / grain / pattern] keeps the scale, direction, color and sheen seen there, with no new patterns, logos, stains, wrinkles or ornaments.`

**Negative list** (add it when the tool has a negative field):
```
redesigned furniture, changed fabric, changed weave, changed colors, changed pattern, extra cushions, missing cushions, moved objects, new decor, extra objects, different people, changed faces, changed clothing, new light source, changed time of day, warped walls, fisheye, barrel distortion, converging verticals, tilted horizon, invented textures, hallucinated details
```

**Tool notes:** Nano Banana, GPT Image and Seedream edit modes hold a locked design best; attach the reference first and the crop second. Midjourney does not lock a design from a reference, so if the user names it, say that its result will drift and suggest one of the edit models instead.

---

## Reviewing a result

When the user sends a result and asks how it looks, score two things separately:

- **Design fidelity /10:** go through the Step 1 inventory. Check the counts (cushions, books, chairs, people), the fabric and its weave, the colors, the object positions, the people's faces and clothing, and the light direction. Mark each item as matching, a small difference, a major difference, or cannot be checked. Any major difference means the shot is not ready.
- **Realism /10:** perspective, light, reflections, depth of field and photographic quality.

Do not count blur, shifted highlights or the plain continuation of visible surfaces as errors; they are expected when the camera moves. Then give the fix as exact sentences to change in the prompt. Typical fixes are a smaller orbit, a longer distance, restating the count that changed, or attaching a crop as Image 2.

---

## Output format

1. **Room reading** (Step 1), short, in the user's language.
2. **Options table** with numbers and ratings (Step 3).
3. **AskUserQuestion** card (Step 4), unless the user already named the shots.
4. After the choice: **the prompts**, one code block per shot with a label and a short note, then **the run note**, plus the negative list when the tool supports it.
5. One line with a safer alternative for the riskiest shot (a smaller orbit, a longer lens, or a crop).
