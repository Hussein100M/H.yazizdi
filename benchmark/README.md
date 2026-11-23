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
- Each image runs twice through clay-rerender: **baseline** (current `skills/`) and **candidate** (with the proposed rules). Everything else is identical: model (Nano Banana Pro, or 2.1 with Thinking on high), realism reference, aspect, 2K output, a new chat per run.
- If the candidates only touch Prompt B slots, both versions share one lit clay (A), which halves the cost.
- Up to 8 generations per weekly test (2 images × 2 versions × 2 passes), within the 20-a-week cap.
- Each result gets three scores: مطابقة التصميم /10 and الواقعية /10 from clay-rerender's review, and الفخامة /10 from the rubric in `skills/clay-rerender/references/luxury-gulf.md`.
- A candidate is recommended only if it raises الفخامة or الواقعية on both images without lowering مطابقة التصميم.
- Results go in `benchmark/runs/week-N/` (images gitignored) and the scores in `research/weekly/week-N.md`.
