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

## Project skills

### `interior-furniture-swap`

Lives in `.claude/skills/interior-furniture-swap/` and loads automatically
when Claude Code runs in this repository.

Attach an interior render and ask in Arabic or English (for example
«غيّر الكنبة» or "swap the armchair"). The skill:

1. Reads the render: camera, light, the image's effects (shadows,
   reflections, depth of field, colour grade, grain), and a numbered list of
   every piece that can be swapped, with its position and orientation.
2. Asks with short cards which piece to replace, and whether you have a
   reference image or want it to suggest alternatives that fit the room.
3. Reads the reference piece part by part (exact counts, proportions,
   materials and colours per part, details, and features it does not have)
   and shows you that description to correct.
4. Writes one Nano Banana, Seedream or GPT Image prompt. The prompt removes the
   old piece and puts an exact copy of the reference piece in its place, not
   the old shape re-covered in the new materials. The copy is sized to fit the
   space, keeps the old piece's spot, facing and viewing angle (not the angle
   of the reference photo), and takes the render's own light and effects. When
   the two shapes differ a lot, the skill splits the edit into two steps: first
   erase the old piece, then place the copy.
