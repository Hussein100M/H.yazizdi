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

## Frontend Design skill

This project bundles the [`frontend-design`](https://github.com/anthropics/skills/tree/main/skills/frontend-design)
skill from Anthropic's public skills repository at
`.claude/skills/frontend-design/`. Claude Code loads skills from that
directory automatically, so anyone who opens this repository gets it with no
extra install step — it activates when you ask for new UI work or a visual
redesign, and it can also be invoked by name with `/frontend-design`.

The files are copied verbatim from upstream (commit `34040c9`) and are
licensed under Apache 2.0; see
`.claude/skills/frontend-design/LICENSE.txt`. To update it later, re-copy
`skills/frontend-design/` from `anthropics/skills`.
