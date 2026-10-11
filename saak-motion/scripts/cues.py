"""SFX cue sheet for the SAAK film — every cue is derived from the animation's own frame maths.

Usage: python3 scripts/cues.py out/sfx-cues.json
Frames are 60 fps and mirror src/lib/timeline.ts + the scene files. A cue's `t` is when the sound
lands (first sample for align="start", loudest 10 ms for align="peak"). Gains are for peak-normalised
samples; dense/sustained sounds sit lower and the tile run is level-matched by measured loudness.
"""
import json
import sys

FPS = 60
T = dict(product1=223, product2=583, product3=943, howTo=1303, step1=1423, outro=2623)
STEP = 240
STEPS = [T["step1"] + STEP * k for k in range(5)]
PRODUCT_STARTS = [T["product1"], T["product2"], T["product3"]]

cues = []


def pan_of(x):
    return round((x - 540) / 540 * 0.6, 3)


def cue(frame, sound, gain, x=540, align="start", maxdur=None, event="", mono=None):
    c = dict(t=round(frame / FPS, 4), sound=sound, gain=round(gain, 3), pan=pan_of(x), align=align, event=f"f{frame:.0f} {event}")
    if maxdur:
        c["maxdur"] = maxdur
    if mono:
        c["mono"] = mono
    cues.append(c)


# Sync convention (measured against the rendered frames in review): a sound lands on the FIRST
# VISIBLE frame of its motion (≈ start + 0.1·dur), not on the expo-out's 90 % point; hard one-frame
# flips (rail nodes) land exactly on the flip; samples with pre-roll use align="peak".

# ---------------------------------------------------------------- intro (0–3.7 s)
cue(12, "click/cinematic_click", 0.30, x=450, event="glint ignites on the mark outline")
cue(95, "riser/smooth_riser", 0.13, align="peak", maxdur=1.76, event="hairline draw builds into the closed mark")
cue(98, "whoosh/whoosh_deep_short", 0.55, align="peak", event="LOGO HIT: outline closes, fill resolves")
cue(101, "pop/premium_and_smooth_pop", 0.45, maxdur=0.7, event="logo hit: glassy top")
cue(120, "pop/sweet_ui_open", 0.22, event="wordmark rises")
cue(140, "ui/ui_granular_button_select", 0.20, event="tagline rises")
cue(156, "ui/ui_granular_button_select_9", 0.16, event="sub-line rises")
cue(204, "riser/rjd_riser", 0.18, event="light hands over to product purple; copy leaves")
cue(215, "whoosh/cinematic_mediam_whoosh", 0.30, x=575, align="peak", event="mark travels to the printed bag logo")
cue(231, "click/high_click", 0.24, x=575, event="mark lands on the bag logo, turns navy")
cue(253, "whoosh/whoosh_deep_short", 0.42, x=575, align="peak", event="hex iris opens: bag 1 revealed")
cue(256, "shutter/camera_shutter", 0.30, x=575, align="peak", event="product photo lands")

# ---------------------------------------------------------------- products (3.7–21.7 s)
ROW_SOUNDS = ["ui/ui_granular_button_select", "ui/ui_granular_button_select_9", "pop/smooth_pop"]
CHECK_SOUNDS = ["click/high_click", "click/cinematic_click", "click/high_click"]
CHECK_GAIN = {"click/high_click": 0.20, "click/cinematic_click": 0.26}
BADGE_X = [None, 338, 355]
for i, s0 in enumerate(PRODUCT_STARTS):
    s = s0 + (40 if i == 0 else 4)
    cue(s + 5, "pop/smooth_pop", 0.22, event=f"product {i + 1} index pill")
    cue(s + 16, "ui/ui_granular_button_select_9" if i % 2 else "ui/ui_granular_button_select", 0.18, event=f"product {i + 1} title rises")
    if i > 0:
        cue(s0 + 75, "ui/ui_enter", 0.30, x=BADGE_X[i], event=f"class badge {'C2TE' if i == 1 else 'C2TES1'} stamps on")
    chip = "pop/slow_and_smooth_pop" if i == 1 else "pop/meadia_pop"
    cue(s0 + 85, chip, 0.20, x=745, event="20 kg chip pops")
    rows = s0 + 96
    for k in range(3):
        cue(rows + k * 30 + 8, ROW_SOUNDS[(k + i) % 3], 0.20 if ROW_SOUNDS[(k + i) % 3] != "pop/smooth_pop" else 0.18, x=720, event=f"feature row {k + 1}")
        ck = CHECK_SOUNDS[(k + i) % 3]
        cue(rows + k * 30 + 13, ck, CHECK_GAIN[ck], x=910, event=f"check mark {k + 1}")

# shelf camera tracks (bag exits right, next enters from left) + light colour handover on the first moving frame
cue(T["product2"] - 19, "riser/rjd_riser", 0.14, event="accent light purple -> teal (first moving frame)")
cue(T["product2"] + 2, "whoosh/cinematic_low_whoosh", 0.32, align="peak", event="shelf track to product 2 (peak velocity)")
cue(T["product2"] + 13, "pop/slow_and_smooth_pop", 0.26, event="bag 2 settles")
cue(T["product3"] - 19, "riser/rjd_riser", 0.14, event="accent light teal -> azure (first moving frame)")
cue(T["product3"] + 2, "whoosh/cinematic_mediam_whoosh", 0.30, align="peak", event="shelf track to product 3 (peak velocity)")
cue(T["product3"] + 13, "pop/slow_and_smooth_pop", 0.24, event="bag 3 settles")
cue(T["howTo"] + 8, "whoosh/cinematic_fast_whoosh", 0.22, align="peak", event="bag 3 lowers out of frame")

# ---------------------------------------------------------------- how to (21.7–23.7 s)
h = T["howTo"]
cue(h + 21, "whoosh/whoosh_deep_short", 0.40, align="peak", event="'how to use' title lands")
cue(h + 24, "pop/sweet_ui_open", 0.28, event="'how to use' title: mid-band body for phone speakers")
cue(h + 28, "ui/ui_granular_button_select_9", 0.16, event="sub-line rises")
RAIL_X = [820, 680, 540, 400, 260]
RAIL_X_HOWTO = [540 + 1.12 * (x - 540) for x in RAIL_X]  # rail is drawn at scale(1.12) under the title
cue(h + 61, "ui/ui_stretch", 0.16, align="peak", event="rail hairline draws right-to-left")
for k in range(5):
    node = "pop/smooth_pop" if k % 2 == 0 else "ui/ui_click_digital_03"
    cue(h + 40 + 7 * k + 3, node, 0.22, x=RAIL_X_HOWTO[k], align="peak" if node == "ui/ui_click_digital_03" else "start",
        event=f"rail node {k + 1} appears")
cue(T["step1"] - 3, "ui/ui_click_digital_03", 0.24, x=840, align="peak", event="node 1 flips white (mid-rise)")
cue(T["step1"] + 4, "whoosh/epic_fast_whoosh_345469", 0.30, align="peak", event="rail rises, porcelain tile flies in")
cue(T["step1"] + 17, "click/click_1", 0.26, align="peak", event="tile lands (low body)")
cue(T["step1"] + 17, "pop/slow_and_smooth_pop", 0.30, event="tile lands (mid body)")

# ---------------------------------------------------------------- steps (23.7–43.7 s)
CARD_X0 = 240  # frame x of the illustration's svg origin
TRANS = ["whoosh/smooth_and_fast_whoosh", "whoosh/cinematic_fast_normal_whoosh"]
for k, s in enumerate(STEPS):
    base = s + 16 if k == 0 else s + 2
    if k > 0:
        cue(s - 6, TRANS[k % 2], 0.24, align="peak", event=f"step {k} -> {k + 1}: illustration slides, rail fills")
        node = "ui/ui_click_digital_03" if k % 2 else "pop/smooth_pop"
        cue(s - 3, node, 0.24, x=RAIL_X[k], align="peak", event=f"rail node {k + 1} flips white")
    cue(base + 14, "ui/ui_granular_button_select", 0.14, event=f"step {k + 1} title rises")
    cue(base + 31, "pop/meadia_pop", 0.18, event=f"step {k + 1} spec chip pops")

# step 1 — clean
s = STEPS[0]
cue(s + 77, "whoosh/fast_whoosh_alt", 0.10, align="peak", event="squeegee sweep (peak velocity)")
for l, x, g in [(142, 150, 0.26), (154, 455, 0.20), (166, 330, 0.16)]:
    cue(s + l, "click/click_2", g, x=CARD_X0 + x, maxdur=0.09, event="sparkle on the clean surface")

# step 2 — mix
s = STEPS[1]
cue(s + 20, "whoosh/cinematic_low_whoosh", 0.20, align="peak", event="water fills to the mark (fastest rise)")
cue(s + 73, "pop/slow_and_smooth_pop", 0.24, event="paddle blade enters the water")
cue(s + 102, "gear/fast_gear", 0.16, maxdur=1.95, event="paddle spins, water turns to mortar")

# step 3 — apply
s = STEPS[2]
cue(s + 18, "whoosh/long_whoosh", 0.12, maxdur=2.15, event="notched trowel combs the ridges")
cue(s + 153, "data/data_collect_alt", 0.26, x=CARD_X0 + 540, event="thickness call-out")

# step 4 — coverage: 20 tiles + m² counter (4 level-matched mid-band samples, each repeats every 4th tile)
s = STEPS[3]
TILE = [("pop/smooth_pop", 0.16, "start"), ("ui/v4_type_delete_2", 0.26, "start"),
        ("ui/ui_click_digital_03", 0.18, "peak"), ("pop/slow_and_smooth_pop", 0.16, "start")]
for k in range(20):
    col = k % 5
    snd, g, al = TILE[k % 4]
    cue(s + 14 + k * 6.5 + 10, snd, g + 0.04 * (col == 0), x=CARD_X0 + 480 - 90 * col, align=al, event=f"tile {k + 1} lands")
cue(s + 29, "data/cinematic_data_collect_2", 0.07, maxdur=2.0, mono="dominant", event="m² counter runs 0 -> 5")
cue(s + 152, "ui/ui_enter", 0.30, event="5.0 m² reached")

# step 5 — grout: a full day passes, then the 4 joints fill (3 vertical + 1 horizontal)
s = STEPS[4]
cue(s + 10, "gear/long_speed_gear", 0.18, event="clock starts")
cue(s + 108, "gear/smooth_and_premium_gear", 0.34, align="peak", event="clock completes 24 h (ratchet lands)")
for i, (x, snd, g) in enumerate([(420, "pop/slow_and_smooth_pop", 0.16), (540, "pop/meadia_pop", 0.16),
                                 (660, "pop/slow_and_smooth_pop", 0.16), (540, "pop/meadia_pop", 0.12)]):
    cue(s + 124 + 9 * i, snd, g, x=x, event=f"grout joint {i + 1} fills")
cue(s + 209, "click/click_2", 0.14, maxdur=0.09, event="gloss passes over the finished tiles")

# ---------------------------------------------------------------- outro (43.7–50 s)
O = T["outro"]
cue(O + 2, "riser/smooth_riser", 0.13, align="peak", maxdur=1.76, event="build-up into the finale logo")
cue(O + 5, "whoosh/whoosh_deep_short", 0.55, align="peak", event="FINALE LOGO HIT (mark appears, f2628)")
cue(O + 8, "pop/premium_and_smooth_pop", 0.45, maxdur=0.7, event="finale logo: glassy top")
cue(O + 21, "pop/sweet_ui_open", 0.20, event="wordmark rises")
cue(O + 35, "pop/meadia_pop", 0.22, event="tagline 'ساك.. ثبات يدوم'")
cue(O + 52, "shutter/camera_shutter", 0.26, align="peak", event="hero bag rises in")
cue(O + 60, "pop/slow_and_smooth_pop", 0.20, x=278, event="porcelain bag rises in")
cue(O + 64, "whoosh/cinematic_fast_whoosh", 0.26, align="peak", event="the three bags rise (group motion peak)")
cue(O + 66, "pop/slow_and_smooth_pop", 0.18, x=802, event="super bag rises in")
cue(O + 114, "ui/ui_granular_button_select_9", 0.22, event="proof chips appear")
cue(O + 129, "ui/ui_enter", 0.50, event="call-to-action pops")
cue(O + 129, "pop/slow_and_smooth_pop", 0.28, event="call-to-action: mid-band body")
cue(O + 134, "gear/middle_gear", 0.18, event="call-to-action: mechanical confirm")
cue(O + 164, "click/click_2", 0.14, maxdur=0.09, event="specular pass over the hero bag")
cue(O + 265, "pop/premium_and_smooth_pop", 0.16, maxdur=0.7, x=500, event="glint across the phone number (logo-family bookend)")
cue(O + 300, "whoosh/whoosh_deep_short", 0.20, event="last motion ends: resolved low tail decays into the still")

cues.sort(key=lambda c: c["t"])


def check(cs):
    """House rule: never more than 2 sounds landing within 2 frames."""
    bad = []
    for i, c in enumerate(cs):
        near = [d for d in cs if abs(d["t"] - c["t"]) <= 2 / FPS]
        if len(near) > 2:
            bad.append((c["t"], [d["sound"] for d in near]))
    return bad


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "out/sfx-cues.json"
    json.dump(cues, open(out, "w"), ensure_ascii=False, indent=1)
    print(f"{len(cues)} cues -> {out}")
    for t, names in check(cues):
        print(f"  STACK >2 at {t:.3f}s: {names}")
