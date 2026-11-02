# Review and fixes

Read this when a generated result comes back. Compare it with Image 1, Image 2 (or the chosen suggestion) and the prompt, and score before writing any fix: a fix written before the check usually patches the wrong thing.

## Three separate scores

Mark each check مطابق · فرق بسيط · فرق جوهري · غير قابل للتحقق. An unverifiable check never counts as a match.

- **ثبات الفراغ /10** — walls, openings, ceiling and floor unchanged; every other piece and object unchanged (count them); camera, framing and aspect unchanged; light and colour of the room unchanged; no new objects or text.
- **مطابقة القطعة /10** — silhouette and proportions; base or legs; arms, back and cushions; materials, colour and finish; details (piping, stitching, fluting, handles) — against Image 2 or the chosen suggestion. For الخامة واللون فقط: the old shape kept and only the surface changed.
- **الاندماج /10** — same footprint, facing, viewing angle and handedness as the old piece; scale against the room; edges follow the vanishing lines; contact shadow and shadow direction match the other furniture; colour temperature of the light on it; reflections where there should be any; same blur, grain and grade as its neighbours; no leftovers of the old piece.

Any فرق جوهري in ثبات الفراغ means the result is not ready, whatever the other two scores say.

## Fix order

Fix the highest level found first; lower-level issues can share one fix prompt, a level-1 or level-2 issue is fixed alone.

1. **Room drift** (architecture, other furniture, camera) → rerun the pass from the original Image 1 with a stronger lock; never patch a drifted result.
2. **Pose and placement** (wrong facing, reference angle leaked, mirrored, moved).
3. **Scale and footprint** (too big, too small, colliding with a neighbour).
4. **Leftovers** of the old piece (legs, arm, shadow, reflection).
5. **Design fidelity** (the piece does not match the reference).
6. **Integration** (light, shadows, reflections, blur, grain, grade).

## Failure → fix

| Failure | Cause | Fix |
|---|---|---|
| Whole room re-rendered, other pieces changed | edit too broad, lock too weak | Shorten the placement and integration paragraphs; name every neighbour in PRESERVE; repeat the camera and room lock at both ends; add a red outline; one piece per pass. |
| New piece in the reference's angle (straight front) | the reference pose leaked | Name the visible faces again ("its left side panel and left arm are visible, its front turned toward the TV wall"); add "rotate the design of Image 2 into this pose"; crop Image 2 to the piece alone; if available, use a reference photo taken nearer the render's angle. |
| Mirrored (chaise or arm on the wrong side) | handedness not stated | State the side by a fixed element: "the chaise end is on the left, toward the window". |
| Floating or pasted look, no shadow | contact not described | Add the contact shadow and ambient occlusion sentence and the shadow direction of a named neighbour ("like the armchair's shadow"). |
| Too sharp, too clean or too saturated | look not inherited | Repeat the grade, grain and depth-of-field sentence and "no sharper, cleaner or more saturated than the [named neighbour]". |
| Wrong colour of light on it | light not named | Name the key source, its side and its colour temperature; name the accent lamp and where its warm light lands on the piece. |
| Old legs, arm, shadow or reflection remain | removal not named | Name each leftover by location in the removal sentence and say what fills that spot ("the oak floor continues"). |
| Too big or too small | scale given only in cm | Give a visible relationship ("its back just below the sill", "the same seat height as the armchair") plus cm. |
| Reference background or extra objects copied | EXTRACT too loose | "From Image 2 take only the [piece]; ignore everything else in it." |
| Design simplified or changed | description too vague | Add the parts from `furniture-vocabulary.md` (base, arms, cushion count, details) by name. |
| Red outline visible | removal sentence weak | Put the "leave no trace" sentence right after the edit and at the end; use a thinner outline. |

## Fix prompt template

```
Using Image 1, keep everything exactly as it is and change only [the issue, named by element and location: the shadow under the new sofa / the left arm of the new armchair]: [the correction in physical terms]. Everything else must remain identical to Image 1.
```

Image 1 here is the result being fixed. Use it only when the room has not drifted; a drifted room goes back to the original render (level 1).

Local repair by tool: GPT Image → select or mask the area, then the fix prompt. Nano Banana and Seedream → name the area by position, or draw a thin red outline and add "change only inside the red outline". A selection narrows the change but does not guarantee the rest stays identical, so check ثبات الفراغ again on every repaired result. A fix is done only once the regenerated image has been checked.

## Failure log

- (empty — append: failure → cause → fix, so future runs inherit it)
