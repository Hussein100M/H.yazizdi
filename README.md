# H.yazizdi

## وكيل بحث الرندر الفخم

وكيل يعمل لمدة شهر، من 24 نوفمبر إلى 24 ديسمبر 2026. يحلل المراجع التي تختارها من انستغرام، ويستخرج منها ما يتكرر، ويختبره، ثم يطوّر سكلاتك بعد موافقتك. يبدأ بطريقة الكلاي (`clay-rerender`)، والتركيز على الفلل الخليجية الحديثة.

### كيف ترسل له

ترسل إيميلاً لنفسك، والصور مرفقة، وفي نص الرسالة ما الذي أعجبك. ملاحظتك هي أقوى إشارة يتعلم منها الوكيل. اسم الحساب يقرؤه الوكيل من السكرين شوت نفسه.

أي إيميل فيه صور ترسله لنفسك يُعامل كمرجع، مهما كان عنوانه. إلا إذا بدأ العنوان بأحد هذين:

| أول العنوان | المحتوى |
|---|---|
| `#bench` | صور من شغلك للاختبار (انظر `benchmark/README.md`) |
| `#test week-N` | نتائج اختبار شغّلتها بنفسك |

### متى يعمل

- **كل يوم الساعة 6:40 صباحاً بتوقيت السعودية:** يسحب الإيميلات الجديدة، يحللها، يحدّث جدول الأنماط، ويرسل لك ملخصاً قصيراً.
- **كل خميس، ابتداءً من 3 ديسمبر:** يجمع الأنماط التي تكررت، يختبرها على صورك قبل وبعد، ويطلب موافقتك على كل تعديل.
- **في 24 ديسمبر:** يكتب دليل الفخامة النهائي، ثم يوقف المهمة اليومية.

### قواعد ثابتة

- لا يعدّل أي سكل بدون موافقتك.
- لا تُحفظ أي صورة في الريبو، لأن الريبو عام. الصور تبقى في إيميلك.
- يتعلم المبادئ، ولا ينسخ تصميماً أو أسلوب استوديو معيّن.

تعليمات الوكيل الكاملة في `CLAUDE.md`.

---

## Banana Claude plugin

This project uses [Banana Claude](https://github.com/AgriciDaniel/banana-claude),
a Claude Code plugin for brief-led image generation, editing, and review with
Google Gemini image models.

To install it, run these commands in Claude Code:

```text
/plugin marketplace add AgriciDaniel/banana-claude
/plugin install banana-claude@banana-claude-marketplace
/plugin enable banana-claude@banana-claude-marketplace
/reload-plugins
```

Requirements: Claude Code 2.1.199 or newer, Python 3.11 or newer with
`python3` on `PATH`, and a Gemini API key for a billing-enabled Google AI
project. The plugin installs disabled by default because image generation is
a paid service, and it will prompt you for your Gemini API key on first
enable (API keys are never stored in this repository or in project
settings).

Once installed, generate an image with:

```text
/banana-claude:banana generate an urban 16:9 GitHub hero with clean left-side copy space
```

See the [Banana Claude README](https://github.com/AgriciDaniel/banana-claude)
and [user guide](https://github.com/AgriciDaniel/banana-claude/blob/main/docs/guide.md)
for the full workflow, security notes, and upgrade instructions.
