# H.yazizdi

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

## AI Landscape Design skill

`.claude/skills/ai-landscape-design/` is a project skill that turns a single
architectural image into a landscape scheme: it reads the site, classifies the
project type (villa, compound, hotel, resort, public park, plaza, campus,
commercial, civic, masterplan), defines the plantable zones, builds the planting
layers, distributes site furniture and shade at realistic scale, and outputs one
design-locked Nano Banana / Gemini image-edit prompt in English with short
Arabic notes. It can also produce a full Master Landscape Concept from one
image.

Use it in Claude Code with:

```text
/ai-landscape-design
```

or just attach a building photo and ask for landscape in Arabic or English —
for example "صمم لاندسكيب لهذه الفيلا" or "develop the landscape for this park".

Reference modules live in `.claude/skills/ai-landscape-design/references/`:
project briefs by type, planting palettes by climate with mature sizes, site
furniture dimensions and distribution rules, the Master Landscape Concept
deliverable, and two worked examples.
