# موشن عرض عام (Showcase) — 9:16

فيديو 22 ثانية بنفس إيقاع الريفرنس، بمحتوى افتراضي يناسب أي شركة هندسية أو مقاولات أو مواد بناء.
الفيديو النهائي: `Showcase_Motion_9x16.mp4`

## المشاهد
| الوقت | المشهد |
|---|---|
| 0 – 2.6 ث | الهوك: «مشاريعك قوية… بس عرضها ما يوصّل؟» |
| 2.6 – 4.7 ث | كروت معلقة على حبل (مخطط، خرسانة، واجهة، رخام، حديد…) |
| 4.7 – 13.5 ث | كانفس غامق: أيقونة الهوية ← كرت يُكتب ← ألوان الهوية ← مخطط ينرسم ← عينات المواد ← عداد المشاريع |
| 13.5 – 15.3 ث | زووم آوت على شبكة مودبورد |
| 15.3 – 19.3 ث | اللوجو + «اسم شركتك» + «هندسة · مقاولات · مواد بناء» |
| 19.3 – 22 ث | التوقيع H.yazidi |

## التعديل لعميل حقيقي
كل النصوص والألوان في `project/engine.html`:
- النصوص: ابحث عن النص العربي نفسه (مثلاً `اسم شركتك`) وغيّره.
- لون الهوية: `#E8642C`.
- الصور: استبدل ملفات `project/img/*.jpg` بصور العميل بنفس الأسماء.

## إعادة الإخراج
```bash
python3 textures.py project/img          # (اختياري) يعيد توليد الخامات الافتراضية
python3 audio.py project 22              # المؤثرات الصوتية + الموسيقى
node render.js project/engine.html project/_frames full 22 4
cd project && ffmpeg -i _bed.wav -i _sfx.wav -filter_complex "[0:a]volume=0.6[m];[1:a]asplit[s1][s2];[m][s2]sidechaincompress=threshold=0.05:ratio=3:attack=5:release=250[d];[d][s1]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=11[a]" -map "[a]" -ar 48000 -t 22 _mix.wav
ffmpeg -framerate 30 -i _frames/%05d.jpg -i _mix.wav -map 0:v -map 1:a -c:v libx264 -crf 17 -pix_fmt yuv420p -c:a aac -b:a 256k -t 22 -movflags +faststart ../Showcase_Motion_9x16.mp4
```
يحتاج: Node + Playwright (Chromium)، Python مع numpy / scipy / Pillow، و ffmpeg.
الخطوط (Alexandria، IBM Plex Sans Arabic، Inter) برخصة OFL.
