# مجموعة الاختبار (Benchmark)

صور ثابتة من شغلك، نختبر عليها كل تعديل قبل اعتماده. التعديل الذي لا يحسّن النتيجة على هذه الصور لا يدخل السكل.

## ماذا ترسل

أرسل من 6 إلى 8 صور من مشاريعك، إيميلاً لنفسك بعنوان يبدأ بـ `#bench`. اكتب في نص الرسالة وصفاً قصيراً لكل صورة بالترتيب. الأفضل أن تكون **صور مواد**، أي رندر أو لقطة SketchUp أو Revit، مثل ما تبدأ بها طريقة الكلاي:

1. واجهة فيلا أمامية، نهار.
2. المدخل عن قرب.
3. جهة الحديقة أو المسبح.
4. لقطة تصلح للمساء أو الليل.
5. لقطة جوية أو من زاوية مرتفعة.
6. داخلي: مجلس أو صالة.
7. و8. اختياري: مشروع غير الفلل.

وإذا عندك صورة مرجعية للإضاءة تستخدمها دائماً، أرسلها معها.

الصور لا تُحفظ في الريبو لأنه عام، وتبقى في إيميلك. الوكيل ينزّلها وقت الاختبار فقط.

## السجل

| ID | الوصف | وصلت | استُخدمت في |
|---|---|---|---|
| _لا توجد صور بعد_ | | | |

## Test protocol

- Two benchmark images per week, chosen by which slots the candidates touch.
- Each image runs twice through clay-rerender: **baseline** (current `skills/`) and **candidate** (with the proposed rules). Everything else is identical: models, realism reference, aspect ratio and resolution.
- **Pipeline on OpenArt (the owner's choice, 2026-11-23):**
  - Prompt A, the lit clay: `nano-banana-2-1`, image2image, **1K** — 27 credits.
  - Prompt B, the materials: `byte-plus-seedream-5-pro`, image2image, **2K** — 60 credits. This matches the owner's own production.
  - In OpenArt prompts each image is named by an `@<id>` mention of its visualReference id, in the role sentence that opens the prompt, where clay-rerender writes "Image 1 / Image 2".
  - Same `aspectRatio` in both passes: the nearest value both models accept to the benchmark image's ratio.
  - Upload: `openart_upload_sign` → PUT → `openart_upload_metadata_get`. Results: download from `cdn.openart.ai` to `benchmark/runs/week-N/` to look at them and score.
  - Save to project "احلام الشرق", folder "احلام الشرق".
- If the candidates only touch Prompt B slots, both versions share one lit clay (A).
- **Weekly cap:** 2 images × 2 versions × 2 passes = 4 × 27 + 4 × 60 = **348 credits** at most (294 with a shared clay). One rerun of a failed clay fits inside the 350 cap; anything more waits for the owner. Three test weeks (3, 10, 17 December) → **≤ 1050 credits** for the month.
- **Watch:** a 1K clay can soften fine details (grooves, insets, lettering) before the 2K materials pass. If مطابقة التصميم keeps losing points on the watch-list for that reason, tell the owner and suggest a 2K clay (Nano Banana 2.1 at 2K costs 37).
- Each result gets three scores: مطابقة التصميم /10 and الواقعية /10 from clay-rerender's review, and الفخامة /10 from the rubric in `skills/clay-rerender/references/luxury-gulf.md`.
- A candidate is recommended only if it raises الفخامة or الواقعية on both images without lowering مطابقة التصميم.
- Results go in `benchmark/runs/week-N/` (images gitignored) and the scores in `research/weekly/week-N.md`.
