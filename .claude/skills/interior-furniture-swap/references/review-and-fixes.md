# Review and fixes

Read this when a generated result comes back. Compare it with Image 1, Image 2 (or the chosen suggestion), the spec sheet and the prompt, and score before writing any fix: a fix written before the check usually patches the wrong thing.

## Three separate scores

Mark each check مطابق · فرق بسيط · فرق جوهري · غير قابل للتحقق. An unverifiable check never counts as a match.

- **ثبات الفراغ /10** — walls, openings, ceiling and floor unchanged; every other piece and object unchanged (count them); camera, framing and aspect unchanged; light and colour of the room unchanged; no new objects or text.
- **دقة النسخ /10** — is it that exact piece? Go down the spec sheet line by line:
  - **counts** — every countable part matches exactly (legs, seat and back cushions, buttons and their grid, channels, flutes, drawers, doors, slats, chandelier arms);
  - **silhouette and proportions** — back, arm and leg heights against the whole, depth against length;
  - **base and parts** — shape of each part as in the reference;
  - **materials and colours per part** — the same, only shaded by the scene's light (not recoloured toward the room's palette);
  - **details** — seams, piping, stitching, edge profiles, handles present where they should be;
  - **absent features** — nothing added that the reference does not have;
  - **no hybrid** — nothing of the old piece's shape, arms, cushions, base or proportions survives.
- **الاندماج /10** — same footprint, facing, viewing angle and handedness as the old piece; real-world size that fits the space (not shrunk, not squashed); edges follow the vanishing lines; contact shadow and shadow direction match the other furniture; colour temperature of the light on it; reflections where there should be any; same blur, grain and grade as its neighbours; no leftovers of the old piece.

Any فرق جوهري in ثبات الفراغ means the result is not ready, whatever the other scores say. A فرق جوهري in دقة النسخ means it is not the requested piece, however well it sits in the room.

## Fix order

Fix the highest level found first; lower-level issues can share one fix prompt, a level 1–3 issue is fixed alone.

1. **Room drift** (architecture, other furniture, camera) → rerun the pass from the original Image 1 with a stronger lock; never patch a drifted result.
2. **Hybrid** (the old shape kept or blended) → rerun from the original Image 1 as two steps (erase, then place); patching a hybrid keeps the old shape underneath.
3. **Pose and placement** (wrong facing, reference angle leaked, mirrored, moved).
4. **Size** (shrunk, squashed, too large, colliding with a neighbour).
5. **Loose copy** (counts, parts, details, materials or colours off).
6. **Leftovers** of the old piece (legs, arm, shadow, reflection).
7. **Integration** (light, shadows, reflections, blur, grain, grade).

## Failure → fix

| Failure | Cause | Fix |
|---|---|---|
| Old shape with the new fabric, or a blend of both | the model morphed the piece still in the frame | Two steps: Pass A erases the old piece, Pass B places the copy in the empty spot; add "keep nothing of the old [piece]'s shape" to Pass B. |
| Wrong count (cushions, legs, buttons, flutes) | count not stated, or stated once | State each count as "exactly [n]" in the spec sheet and repeat the key ones in REPLACE. |
| Design simplified or details invented | spec too vague; absent features not named | Fill the spec sheet part by part with `furniture-vocabulary.md`; add the "no [piping / buttons / legs]" sentence. |
| Colours shifted toward the room | colour not tied to the reference | "Keep the exact colours of Image 2; the scene's light only shades them." Name each part's colour. |
| Whole room re-rendered, other pieces changed | edit too broad, lock too weak | Name every neighbour in PRESERVE; repeat the camera and room lock at both ends; add a red outline; one piece per pass. |
| New piece in the reference's angle (straight front) | the reference pose leaked | Name the visible faces again ("its left side and left arm are visible, its front turned toward the TV wall"); add "rotate the design of Image 2 into this pose"; crop Image 2 to the piece alone; add a second reference photo taken nearer the render's angle. |
| Mirrored (chaise or arm on the wrong side) | handedness not stated | State the side by a fixed element: "the chaise end is on the left, toward the window". |
| Shrunk or toy-like | scaled to the old footprint | "Its real size, about [L × D × H] cm; its seat at the same height as the [armchair]"; let it extend into free floor or use the shorter-version sentence. |
| Floating or pasted look, no shadow | contact not described | Add the contact shadow and ambient occlusion sentence and the shadow direction of a named neighbour ("like the armchair's shadow"). |
| Too sharp, too clean or too saturated | look not inherited | Repeat the grade, grain and depth-of-field sentence and "no sharper, cleaner or more saturated than the [named neighbour]". |
| Wrong colour of light on it | light not named | Name the key source, its side and its colour temperature; name the accent lamp and where its warm light lands on the piece. |
| Old legs, arm, shadow or reflection remain | removal not named | Name each leftover by location in the removal sentence and say what fills that spot ("the oak floor continues"). |
| Reference background or extra objects copied | EXTRACT too loose | "From Image 2 take only the [piece]; ignore everything else in it." |
| Red outline visible | removal sentence weak | Put the "leave no trace" sentence right after the edit and at the end; use a thinner outline. |

## Fix prompt template

```
Using Image 1, keep everything exactly as it is and change only [the issue, named by element and location: the shadow under the new sofa / the left arm of the new armchair]: [the correction in physical terms, matching Image 2]. Everything else must remain identical to Image 1.
```

Image 1 here is the result being fixed (Image 2 stays the reference). Use it only for levels 3–7; a drifted room or a hybrid goes back to the original render.

Local repair by tool: GPT Image → select or mask the area, then the fix prompt. Nano Banana and Seedream → name the area by position, or draw a thin red outline and add "change only inside the red outline". A selection narrows the change but does not guarantee the rest stays identical, so check ثبات الفراغ again on every repaired result. A fix is done only once the regenerated image has been checked.

## Failure log

- (empty — append: failure → cause → fix, so future runs inherit it)
