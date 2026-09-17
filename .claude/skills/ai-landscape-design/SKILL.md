---
name: ai-landscape-design
description: Analyzes an architectural image and develops its landscape — it reads the scene, classifies the project type (villa, compound, hotel, resort, public park, plaza, campus, retail podium, masterplan), defines the plantable zones, builds the layers (trees, palms, shrubs, ground cover, lawn), distributes seating, shade structures, paths, lighting and urban elements at realistic scale, keeps the original architecture untouched, and outputs one design-locked Nano Banana / Gemini prompt in English plus short Arabic notes — or a full Master Landscape Concept from a single image. Use whenever the user wants landscape, planting, greenery, gardens, outdoor spaces or site furniture on a building photo, render or masterplan, or asks in Arabic for "صمم لاندسكيب", "طوّر المنظر الخارجي", "أضف أشجار وزراعة", "وزّع جلسات ومظلات", "حديقة عامة", "ماستر لاندسكيب", even without naming an AI image tool. For finishing an unbuilt building or a material swap use the banana skill; for lighting-only transfer use render-style-transfer.
---

# AI Landscape Design — من تحليل المشهد إلى Master Landscape

One job: turn a single architectural image into a landscape scheme that reads as if a landscape architect worked the site, then deliver it as one image-edit prompt that adds exactly that scheme and touches nothing else.

The failure mode of AI landscaping is decorative scatter — trees at impossible scale, planting sitting on the driveway, benches floating on grass facing nothing, and the building quietly redesigned along the way. Analysis before design is what prevents it: every element you add has to answer *which zone, what job, what size, how many*. Every rule below exists to stop scatter and drift.

## Step 0: Route first

| Request | Where it belongs |
|---|---|
| Add / design / develop landscape, planting, outdoor spaces, site furniture | This skill |
| Master Landscape Concept, zoning study, landscape strategy from one image | This skill → `references/master-concept.md` |
| Finish an unbuilt or under-construction building, red-mask edit, material swap, talent lock | **banana** skill |
| Copy lighting, colour temperature or mood from another render | **render-style-transfer** skill |
| Turn the result into a video or reveal sequence | **real-estate-cinematic-reveal** skill |

Landscape is often requested *together* with building completion. In that case, finish the building first (banana), then run this skill on the result — a model asked to build and to plant in one pass does both badly.

## Step 1: Read the site

Answer these from the image before designing anything. They become the Arabic analysis block in the output.

- **View type.** Aerial / bird's eye, eye-level exterior, entrance close-up, courtyard, masterplan top view. The view decides what is even visible: in an aerial, bed shapes and canopy pattern carry the design; at eye level, trunk height, seating and shade carry it.
- **Project type and who uses it.** → Step 2.
- **Scale ruler.** Pick one known element in the frame and state its real size: floor-to-floor ≈ 3.0–3.5 m, door 2.1 m, car 4.5 m long, person 1.7 m, standard parking bay 2.5 × 5 m. Everything you add is sized against that ruler, and the ruler goes into the prompt as a sentence. Without it the model invents its own scale and you get bonsai trees or a forest swallowing the villa.
- **Ground surfaces.** Which areas are asphalt road, driveway and turning apron, parking, paved plaza, bare sand or graded earth, existing lawn, planter, pool deck, roof terrace.
- **Circulation.** Vehicle route, main entrance, drop-off, pedestrian arrival, service and fire access. These stay clear — planting on them is the single most obvious tell of an AI landscape.
- **Architecture to protect.** Facade planes, entrance canopy, signage, balconies and the view lines out of them, glazing, pool, existing water features.
- **Climate and region.** Read it from the architecture, sky, light and existing vegetation: arid Gulf, coastal, Mediterranean, temperate, tropical. It decides the palette in `references/planting-palette.md`. If it is genuinely unclear, assume the user's region (arid Gulf) and say so in the notes.
- **Sun and shadows.** Direction and length of existing shadows give the time of day. Every tree, pergola and mass you add must throw its shadow the same way — inconsistent shadows are what makes a good render look pasted.
- **Existing vegetation.** What stays, what is removed, what is reinforced.

If two readings are plausible *and they change the design* (public park vs private plaza, hotel vs residential), ask one short question. For anything smaller, assume, design, and state the assumption in the notes.

## Step 2: Classify the project type

The project type is not a label, it is the brief — it decides the character of the planting, how much lawn is honest, whether seating belongs at all, and how formal the geometry should be. Read the matching section of `references/project-types.md`:

| Image shows | Section |
|---|---|
| Single villa, private house | Private villa |
| Compound, townhouses, apartment blocks | Residential compound |
| Hotel, tower with podium arrival | Hotel |
| Resort, beachfront, chalets | Resort |
| Public park, corniche, green belt | Public park |
| Urban square, forecourt, civic plaza | Plaza |
| University, school, hospital, HQ campus | Campus |
| Mall, retail street, office podium | Commercial |
| Mosque, museum, civic building | Civic |
| Masterplan or large aerial | Masterplan |

## Step 3: Zone the site before you plant

Divide the visible ground into **named zones**, each with one job. Named zones are what turn scatter into a scheme, and they carry straight into the prompt and into the Master Concept.

**Plantable:** setbacks and plot edges, the strip between building and boundary wall, islands and medians, roundabouts, courtyards and internal gardens, corners left over by the road geometry, both sides of pedestrian paths, screens in front of parking and service yards, terraces and roofs **as planters only** (and only when the slab can be assumed — say so).

**Never plant:** vehicle carriageways, fire access lanes, driveway aprons and turning areas, ramps, the clearance in front of the main entrance, directly across the hero view of the facade or the signage, pool coping, and roofs without a stated planter.

**Give every zone an intent verb** — frame, screen, shade, direct, soften, gather:
- *Frame*: two tree groups either side of the entrance axis, holding the facade in the middle.
- *Screen*: a dense mid-layer hiding parking, boundary wall, generator, or a neighbour.
- *Shade*: canopy over where people actually stand, sit, walk and park.
- *Direct*: planting lines and edges that push movement toward the entrance.
- *Soften*: ground cover and shrubs breaking the meeting line of wall and paving.
- *Gather*: the one place designed to hold people — lawn, seating court, water feature.

## Step 4: Build the landscape in layers

A real scheme is layered; a scattered one is not. Name each layer in the prompt with species, mature size, count and spacing. Palettes and species names per climate are in `references/planting-palette.md`.

1. **Canopy / feature trees** — 6–12 m mature, 6–10 m apart, in groups rather than rows unless the zone is a formal axis. These carry the shadows and the scale of the whole image.
2. **Palms / vertical accents** — clear trunk 4–8 m. Use rhythm (3, 5, 7) or a deliberate formal line at an entrance. An evenly spaced identical row across the whole frontage reads as a game asset.
3. **Shrubs / mid layer** — 0.6–1.5 m, massed in blocks and drifts, never single dots; trimmed hedges for edging and screening, with the trimmed height stated.
4. **Ground cover and seasonal** — 0.15–0.4 m, as a continuous mat at the front of beds, inside bed outlines, not sprinkled over paving.
5. **Lawn / green carpet** — only where a use justifies it: play, gathering, hotel lawn, forecourt. In arid climates keep it small, shaped and clearly functional, with gravel or decomposed granite doing the rest of the ground.

Then: **planters and raised beds** where planting sits on structure, and a stated **bed surface finish** (mulch, gravel, decomposed granite). Saying what the bed surface is tells the model the beds are designed rather than dug.

Realism comes from variation: 2–3 species per layer, uneven ages and heights, denser where people gather, thinner at the edges. Perfect repetition is the fastest way to look synthetic.

## Step 5: Hardscape, furniture and urban elements

Only when the project type calls for it — a private villa does not need public benches. Dimensions and distribution rules are in `references/site-furniture.md`. The three rules that matter most:

- **Everything sits on something.** Benches on paving or a deck, never floating on lawn; pergolas over a seating cluster, not over nothing.
- **Seating faces something.** A view, a lawn, water, play, activity. Back to a hedge or wall, face to the space.
- **Paths connect two real destinations** and follow the line people would actually walk. A path that curves prettily into nowhere is the second-most obvious AI tell after floating trees.

## Step 6: Write the prompt

English, flowing prose, with the lists explicit. This order every time — the locks sit at both ends on purpose, because that is where drift starts:

1. **Opening lock.** Image A is the base. Camera position, lens, framing, perspective and aspect ratio unchanged. The building's geometry, massing, facade materials and colours, openings, roofline, entrance and signage unchanged. Existing roads, driveway, parking layout and paving unchanged unless the edit says otherwise. Daylight, sun direction, shadow direction and sky unchanged.
2. **Scale ruler.** One sentence: "The building's floor-to-floor height is about 3.2 m — size all planting and furniture against it."
3. **Zone by zone.** One short paragraph per named zone: what goes there, species, mature heights in metres, counts, spacing, bed shapes.
4. **PRESERVE** — a concrete list. Name the surfaces that stay clear (asphalt, driveway, entrance forecourt) individually; a generic "keep everything else" is weak.
5. **ADD** — the countable list of what is new, mirroring the zones.
6. **Closing lock.** Same building, same viewpoint, same light. New trees and structures cast shadows in the existing sun direction. Photorealistic, same resolution and aspect ratio, no text, logos or watermarks, and no change to the architecture.

Aim for 200–400 words. Every sentence should either place something or prevent drift. `references/worked-example.md` has two complete outputs — a villa at eye level and a park from the air — worth reading once for the density and tone a good prompt has.

## Step 7: Output format

Reply in exactly this shape, nothing before or after unless asked:

**تحليل المشهد:** 3–5 Arabic bullets — project type, view type, climate, scale ruler, sun direction.

**مناطق الـ Landscape:** one line per zone — `اسم الزون: دوره + العناصر الرئيسية`.

**الصور المطلوبة:** Image A = … (plus Image B and its single job, if any).

```
[the English prompt]
```

**ملاحظات:** 2–4 Arabic bullets — what to check first in the result, the likeliest failure here and its one-line fix, any assumption made, and the remaining passes if the work was split.

## Passes: one image rarely holds a whole scheme

When the scheme has softscape *and* furniture *and* lighting, split it. Nano Banana holds geometry far better on narrow edits:

- **Pass 1** — ground: bed outlines, lawn, trees, palms, shrubs, ground cover.
- **Pass 2** — hardscape and people-elements: paths, seating, pergolas and shade, water, play.
- **Pass 3** — atmosphere: night lighting, or people and activity.

Give pass 1 now, list the rest in the notes, and feed each output back as the new Image A.

## Master Landscape Concept

When the user asks for a concept, a strategy, a zoning study, or "ماستر لاندسكيب" rather than a single edited image, follow `references/master-concept.md` — it covers the concept statement, the zone table, the planting strategy, circulation, the furniture programme, and how to sequence the images that illustrate it.

## Troubleshooting

Diagnose, then return a full revised prompt in the same output format.

- **Trees the wrong size.** Restate the scale ruler, give each element a height in metres, and tie it to a known element ("canopy just above the first-floor slab").
- **Planting on roads, driveway or entrance.** Name each surface in PRESERVE as staying clear and in use ("the asphalt driveway remains clear asphalt with no planting").
- **Architecture changed.** Shorten the landscape section, split into passes, and repeat the facade and opening lock at both ends.
- **Scattered dots instead of a scheme.** Switch to massing language: "a continuous 8 m bed", "a group of five", "a drift of low shrubs", and give bed outlines.
- **Furniture floating or oversized.** Anchor it to a surface and give dimensions: seat height 0.45 m, bench 1.8 m long, pergola 2.6 m clear.
- **Shadows inconsistent.** One sentence naming the sun direction read from the existing shadows, plus the requirement that new elements match it.
- **Lawn everywhere in a desert scene.** Restrict lawn to one named zone and specify gravel or decomposed granite for the rest.
- **Landscape looks like a different project.** The type was wrong — re-read `references/project-types.md` and rebuild the zones.

When a new repeatable failure appears, append it below so future runs inherit the fix.

## Reference files

- `references/project-types.md` — the brief behind each project type: zones, planting character, furniture, typical mistakes.
- `references/planting-palette.md` — species by climate with mature sizes, plus the spacing table and the rules that keep planting believable.
- `references/site-furniture.md` — furniture, hardscape and lighting with real dimensions and distribution rules.
- `references/master-concept.md` — the full Master Landscape Concept deliverable and its slide sequence.
- `references/worked-example.md` — two complete outputs in the skill's format.

## Failure log

- (empty — append: failure → cause → fix)
