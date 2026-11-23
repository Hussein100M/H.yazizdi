# Render Research Agent — operating manual

A one-month study (2026-11-24 → 2026-12-24). The owner picks luxury architectural
visualisations they like (mostly on Instagram) and emails them in. The agent
analyses them, finds what keeps recurring, tests it, and — only with the owner's
approval — turns it into improvements to the owner's skills, starting with
`clay-rerender`, the method that has improved their renders the most.

Scope: **architectural renders in general**, not villas only — towers, interiors, hospitality, commercial, masterplans, landscape. The question for every reference is what makes it read as a real, luxurious photograph, and which of that carries over to any project. Rules are general by default; a rule is tied to a project type only when the references show it belongs to that type.
The owner's picks define "luxury"; the agent learns their taste, it does not impose its own.

Talk to the owner in short Arabic (Gulf dialect is fine). Files: English, Arabic notes allowed.

## Layout

| Path | What it holds |
|---|---|
| `research/TEMPLATE.md` | The analysis template, mapped to the slots of the clay method |
| `research/log/YYYY-MM-DD.md` | Each day's analyses |
| `research/patterns.md` | Running tally of recurring patterns, with status |
| `research/weekly/week-N.md` | Weekly report: candidates, A/B results, proposed diff |
| `research/inbox/` | Downloaded reference images, for the run only (gitignored) |
| `benchmark/README.md` | Benchmark set registry and the A/B test protocol |
| `benchmark/images/`, `benchmark/runs/` | Benchmark images and test results (images gitignored) |
| `skills/clay-rerender/SKILL.md` | Working copy of the skill (baseline = account version of 2026-11-04) |
| `skills/clay-rerender/references/render-library.md` | The render library the skill will read: general rules first, type-specific ones under their type; grows only through approved rules |
| `skills/CHANGELOG.md` | Every approved change, with version and evidence |
| `.claude/agents/reference-analyst.md` | Subagent that analyses a batch of images |

## Hard rules

1. **No images in git.** The repo is public; references are other studios' work and benchmark images are client work. Originals stay in Gmail and are downloaded to gitignored folders for the run only.
2. **No edit to `skills/` without the owner's approval in chat.** Proposed changes live in the weekly report as a diff until approved.
3. **Learn principles, not copies.** No studio or artist names and no "in the style of …" in skill text; nothing that reproduces one specific design.
4. **Every rule fits a slot of the clay method** — A: sun & time, artificial lighting, sky & air, people · B: material description, reflections, people's dress, plants, grade, deliverable — or names another skill as its target (composition and camera → `architectural-camera-angle-planner` / `arch-prompt-interviewer`; more planting → `landscape-enhancement-passes`). A rule never adds architecture or elements the design lacks: in Nano Banana a listed element tends to appear.
5. **Keep SKILL.md lean.** Knowledge goes into `references/render-library.md`; SKILL.md gets one pointer line at most (proposed with the first approved rule — text in `skills/CHANGELOG.md`).
6. **The owner's note is the strongest signal.** A pattern the owner names in their note scores 2; one only observed scores 1.
7. **Credits:** tests follow the pipeline and weekly cap in `benchmark/README.md` (≤ 350 OpenArt credits a week, ≤ 1050 for the month); check the balance and quote each job with `openart_model_cost` before running, and report credits used and the balance left.
8. **Never invent.** If a step can't run (no new refs, connector missing, network blocked, no credits), say so in one line and skip that step. No mocked results.
9. **Gmail:** read only the image emails the owner sends to themselves from 2026-11-23 on (the query in Daily run step 1); the only change made there is the `ref-done` label (id `Label_2`). Never send, delete or forward email.

## Daily run (every morning, ~06:40 Riyadh time)

1. **Collect.** Gmail `search_threads` with `from:me to:me has:attachment (filename:png OR filename:jpg OR filename:jpeg OR filename:heic OR filename:webp) after:2026/11/23 -label:ref-done` — every image email the owner sends themselves, whatever the subject (the first one came without `#ref`). For each thread, `get_thread`, then `download_gmail_attachment` for each image, and sort by subject:
   - `#bench` → `benchmark/images/B<n>.<ext>`, and add a row to the registry in `benchmark/README.md`.
   - `#test` → `benchmark/runs/week-N/`; score them as in the weekly run, step 4.
   - anything else is a reference → `research/inbox/YYYY-MM-DD/NN.<ext>`; keep the email body (the owner's note) with it. Instagram screenshots show the source account at the top; read it from there when the note doesn't name it. Slides of one carousel count as one source.
   If nothing is new: one Arabic line ("ما وصلت مراجع جديدة اليوم"), no commit, stop.
2. **Analyse** each reference with `research/TEMPLATE.md`. For more than 5 images, hand the batch to the `reference-analyst` subagent (if that type isn't available, a general-purpose agent given `.claude/agents/reference-analyst.md`) so the image reads stay out of the main context. Output: `research/log/YYYY-MM-DD.md`.
3. **Tally** in `research/patterns.md`: match each transferable rule to an existing pattern (add its score, source and log link) or add a new row. Record contradictions in the Notes column — two opposite patterns can both be right for different project types; split them by type rather than averaging.
4. **Mark** the processed threads with the Gmail label `ref-done` (create it if missing).
5. **Commit and push** to the session branch: `research: YYYY-MM-DD — N refs`.
6. **Report** in Arabic, 6 lines at most: how many were analysed, the 2–3 strongest observations, and any pattern that just became a candidate.

## Weekly run (the Thursday daily run, from 2026-12-03)

1. **Distil.** A candidate is a pattern with score ≥ 4, from ≥ 2 different source accounts, with no unresolved contradiction for its project type.
2. **Draft** the edit to `render-library.md` (or another target skill — copy it first from `/root/.claude/skills/synced/*/<name>/` into `skills/<name>/`) as a diff in `research/weekly/week-N.md`.
3. **Test (A/B)** following `benchmark/README.md`: 2 benchmark images the candidates affect, each run twice through the clay prompts — baseline (current `skills/`) and candidate — with the same model, reference and aspect. If the candidates only touch Prompt B slots, both versions share one clay. Run on OpenArt with the pipeline in `benchmark/README.md` (clay on Nano Banana 2.1 at 1K, materials on Seedream 5 Pro at 2K, `@id` mentions instead of "Image 1/2"); check each clay before its materials pass, as clay-rerender says. If OpenArt can't run (credits, connector, network), give the owner the prompt pairs to run themselves and send back by email with subject `#test week-N`.
4. **Score** each result with clay-rerender's review — مطابقة التصميم /10 and الواقعية /10 — plus الفخامة /10 from the rubric in `render-library.md`. A candidate that costs design fidelity is rejected however luxurious it looks.
5. **Report** in `research/weekly/week-N.md` (candidates, evidence, scores, recommendation: adopt / reject / retest) and a short Arabic summary in chat; ask the owner to approve each candidate.
6. **On approval:** apply to `skills/`, record it in `skills/CHANGELOG.md` with a new version, set the pattern's status to `adopted`, zip the changed skill into `dist/<skill>.zip`, and tell the owner to upload it in place of the current version on their claude.ai skills page. Rejected → status `rejected` with the reason.

## Month end (the 2026-12-24 run)

Write `research/FINAL.md`: the luxury guide (adopted rules by slot with their before/after evidence), what was rejected and why, and what to study next. Offer to publish it as a page. Then disable the daily scheduled task (`update_trigger`, `enabled: false`, id under State) and tell the owner.

## State (keep current)

- Started 2026-11-24 · ends 2026-12-24 · weekly on Thursdays from 2026-12-03.
- Session branch: `claude/dreamy-edison-65hokr`.
- Daily scheduled task: "Render research daily", id `trig_0137nj9PWstEXw1MJxsYZFv4`, `CRON_TZ=Asia/Riyadh 40 6 * * *`, fires into session `session_01DWRF5jWYqNQaGWtcYjaHJL`. The owner asked for 7:00; 06:40 keeps it off the busy top of the hour.
- OpenArt: reconnected on 2026-11-23 to the owner's paid account (Starter, 1411 credits). The connector reloaded inside this same session, so the scheduled task stays here. Tests go in project "احلام الشرق" (`x6v3Oftgh079X5YV5p0e`), folder "احلام الشرق" (`jYhSsB4mq00Azn7ebBva`).
- Network: uploads go through `storage.googleapis.com` (reachable); results download from `cdn.openart.ai` (added to the Default environment's allowed hosts on 2026-11-23).
- The owner's own production (folder "فيلا الملكي" in Personal Project): materials pass on Seedream 5 Pro at 2K, images referred to as `@id` in the prompt, sometimes a third image as a material sample (e.g. the stone), "calm and still, no people and no vehicles" in some shots. The test pipeline mirrors this.
- Nim: 0 credits.
- Benchmark images: none yet (the owner sends them with subject `#bench`).
- People: learn from the owner's references, per project type; until then the skill's current rule (smart-casual and modest) stands.
- 2026-11-23: the owner widened the scope from villas to renders in general; the library was renamed from `luxury-gulf.md` to `render-library.md`.

## Resume in a new session

Connectors load when a session starts, so after the owner reconnects OpenArt to the other account (or if this session ends), a new session continues the work: check out this branch, read this file and `research/patterns.md`, create the daily scheduled task again in the new session (same time, same prompt), delete the old one, and update State.
