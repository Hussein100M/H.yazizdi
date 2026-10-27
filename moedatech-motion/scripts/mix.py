#!/usr/bin/env python3
"""SFX bus from Hussein's SFX library, synced to engine.html keyframes.
Usage: mix.py <sfx_library_dir> <out_sfx.wav>
Each event: S(file, t, gain, pan, maxdur, off, al) — al: 'start' (sound starts at t),
'peak' (sound's loudest point lands on t), 'end' (sound ends at t: risers into a hit)."""
import sys, os, numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly

SFX_LIB, OUT = sys.argv[1:3]
SR = 48000; D = 41.5; N = int(SR * D)
L = np.zeros(N); R = np.zeros(N)
_cache = {}

def load(name):
    if name in _cache: return _cache[name]
    sr, x = wavfile.read(os.path.join(SFX_LIB, name + '.wav'))
    x = x.astype(np.float64) / 32768.0
    if x.ndim == 1: x = np.stack([x, x], 1)
    if sr != SR: x = resample_poly(x, SR, sr, axis=0)
    _cache[name] = x; return x

def S(name, t, gain=1.0, pan=0.0, maxdur=None, off=0.0, al='start'):
    x = load(name)[int(off * SR):].copy()
    if maxdur and len(x) > maxdur * SR:
        n = int(maxdur * SR); f = min(int(.08 * SR), n // 3); x = x[:n]; x[-f:] *= np.linspace(1, 0, f)[:, None]
    f0 = int(.003 * SR); x[:f0] *= np.linspace(0, 1, f0)[:, None]          # de-click
    x = x / (np.max(np.abs(x)) + 1e-9)
    if pan: x[:, 0] *= min(1, 1 - pan); x[:, 1] *= min(1, 1 + pan)
    if al == 'peak':
        w = int(.01 * SR); env = np.abs(x).max(1); n = len(env) // w
        t -= (np.argmax(env[:n * w].reshape(n, w).max(1)) * w) / SR
    elif al == 'end':
        t -= len(x) / SR
    i = int(round(t * SR))
    if i < 0: x = x[-i:]; i = 0
    n = min(len(x), N - i)
    if n > 0: L[i:i+n] += x[:n, 0] * gain; R[i:i+n] += x[:n, 1] * gain

px = lambda x: max(-.7, min(.7, (x - 540) / 540 * .7))
PSP = 'pop/premium_and_smooth_pop'   # 4 variations at 0 / 1 / 2 / 3 s
NP = 'pop/normal_pop'                # variations at 0 / .7 / 1.45 / 2.0 s
SW = 'data/ma_tuttkile_stopwatch_3'

# ---------------- HOOK 0–3.95 ----------------
S('pop/smooth_pop', .22, .30, .15); S('pop/smooth_pop', .47, .28, -.15)
S('whoosh/cinematic_fast_whoosh', .90, .42, al='peak'); S('whoosh/whoosh_deep_short', .92, .40, al='peak')
S(PSP, .88, .32, maxdur=.5)
S('ui/ui_click_digital_03', 1.58, .24)
S('whoosh/epic_fast_whoosh_345469', 1.92, .24, .3, al='peak')
S('pop/slow_and_smooth_pop', 1.98, .50, px(700)); S('pop/smooth_pop', 2.33, .42, px(612))
S('pop/smooth_pop', 2.62, .32, px(560)); S('click/high_click', 2.80, .20)
S('pop/sweet_ui_open', 3.03, .40); S(SW, 3.08, .34, maxdur=.5); S('ui/ui_enter', 3.55, .34)
S('riser/smooth_riser', 3.78, .26, al='end'); S('whoosh/high_and_fast_whoosh', 3.70, .40, al='peak')
S('whoosh/whoosh_deep_short', 3.80, .46, al='peak')
S('whoosh/smooth_and_fast_whoosh', 3.97, .28, al='peak')
# ---------------- LESSOR 4.0–8.6 ----------------
S('pop/meadia_pop', 4.08, .36, maxdur=.5); S('pop/smooth_pop', 4.18, .24, .5); S('ui/ui_button', 4.98, .28, -.45)
S('whoosh/epic_fast_whoosh_345469', 4.92, .34, al='peak')
S('data/data_collect', 4.95, .22, maxdur=.5); S('ui/ui_enter', 5.45, .26, -.3)
S(NP, 5.12, .30, .3, maxdur=.45); S(NP, 5.27, .28, -.3, maxdur=.45, off=.70)
S('ui/ui_premium_open', 5.62, .26, maxdur=1.0); S('ui/ui_glitch_flicker_text_2', 5.66, .14)
S('data/cinematic_data', 5.72, .30, maxdur=.8); S('data/cinematic_data', 6.72, .24, maxdur=1.2, off=.8)
S('whoosh/cinematic_low_whoosh', 6.85, .30, al='peak')
S('ui/ui_granular_button_select', 7.23, .30, .3); S('pop/meadia_pop', 7.30, .30, .35, maxdur=.4)
S('ui/ui_granular_button_select_9', 7.81, .30, -.3); S('pop/smooth_pop', 7.88, .30, -.35); S('pop/smooth_pop', 8.02, .24, -.2)
# ---------------- HERO CARD 8.4–11.2 ----------------
S('whoosh/cinematic_fast_whoosh', 8.50, .38, al='peak'); S(PSP, 8.55, .40, maxdur=.5, off=1.0)
for i, tt in enumerate([9.0, 9.15, 9.3]):
    S('ui/ui_granular_button_select' if i % 2 == 0 else 'ui/ui_granular_button_select_9', tt, .22, .2)
S('pop/sweet_ui_open', 9.33, .40); S('ui/ui_enter', 9.36, .22)
S('ui/ui_click_digital_03', 9.81, .25)
S('whoosh/whoosh_deep_light_2', 10.90, .20, al='peak', maxdur=1.3)
# ---------------- COUNTER 10.6–13.8 ----------------
S('ui/ui_open', 11.10, .24, al='peak', maxdur=.9)
S('data/data_collect', 11.12, .30); S('gear/fast_gear', 11.12, .14, maxdur=1.62, off=.3)
S(PSP, 12.78, .45, maxdur=.5, off=2.0); S('gear/middle_gear', 12.80, .20)
S('pop/smooth_pop', 12.86, .26)
S('whoosh/high_and_fast_whoosh', 13.60, .40, al='peak')
# ---------------- BENTO 13.45–15.9 ----------------
S('shutter/camera_shutter', 13.95, .34, px(830)); S('shutter/smooth_cammera_shutter', 14.04, .32, px(540))
S('shutter/little_bit_hard_cammera_shutter', 14.13, .32, px(250))
S('pop/meadia_pop', 14.36, .30, .3, maxdur=.4); S('pop/slow_and_smooth_pop', 14.46, .32, .3); S('ui/ui_button', 14.62, .22, .3)
S(NP, 14.88, .30, -.3, maxdur=.45, off=1.45); S('ui/ui_enter', 15.15, .26, -.3)
# ---------------- REQUEST + FILTER 15.5–21.3 ----------------
S('whoosh/smooth_and_fast_whoosh', 15.78, .42, -.3, al='peak')
S('pop/sweet_ui_open', 15.97, .30)
S('gear/smooth_and_premium_gear', 17.53, .30, maxdur=.45); S('ui/ui_enter', 17.98, .32)
S('whoosh/epic_fast_whoosh_345469', 18.48, .14, al='peak'); S('pop/meadia_pop', 18.55, .30, .25, maxdur=.4)
S('click/click_2', 18.62, .30, -.4)
S('click/high_click', 18.88, .50); S('ui/ui_button', 18.88, .20); S('pop/smooth_pop', 18.98, .42)
S('whoosh/cinematic_low_whoosh', 19.25, .22, al='peak'); S(SW, 19.05, .20, maxdur=.9, off=1.0)
for k in range(6): S('ui/ui_click_digital_04', 19.12 + k * .05, .14, px(105 + k * 148))
for tt, x in [(19.3, 860), (19.55, 630), (19.8, 400)]:
    S('ui/ui_granular_button_select_9', tt, .28, px(x)); S('ui/ui_glitch_click', tt + .04, .14, px(x))
S(PSP, 19.95, .32, maxdur=.5, off=3.0)
# ---------------- NOTIFY 20.7–23.8 ----------------
S('whoosh/cinematic_fast_whoosh', 20.95, .30, al='peak'); S('whoosh/data_whoosh', 21.40, .22, al='peak', maxdur=1.4)
S('ui/ui_premium_open', 21.72, .34, maxdur=.9)
for i, x in enumerate([175, 355, 540, 725, 905]): S('ui/ui_click_digital_03', 21.75 + i * .07, .22, px(x))
for i, x in enumerate([175, 355, 540, 725, 905]): S('ui/ui_granular_button_select', 22.5 + i * .08, .20, px(x))
# ---------------- OLD WAY (dark) 23.45–27.1 ----------------
S('whoosh/cinematic_low_whoosh_b', 23.75, .40, al='peak'); S('whoosh/whoosh_deep_short', 23.80, .24, al='peak', maxdur=1.0)
S(SW, 24.0, .30, maxdur=2.7); S('gear/fast_gear', 24.0, .12, maxdur=2.7)
S('riser/rjd_riser', 24.74, .30)
BUBX = [140, 620, 560, 90, 120, 700, 640, 250, 380, 760]; BTY = [0, 1, 0, 0, 1, 0, 2, 0, 1, 0]
for i, tt in enumerate([25.24, 25.36, 25.50, 25.62, 25.74, 25.86, 26.0, 26.12, 26.24, 26.38]):
    if BTY[i] == 1: S('ui/ui_glitch_click', tt, .22, px(BUBX[i] + 150))
    else: S('pop/meadia_pop' if i % 2 else 'pop/smooth_pop', tt, .26, px(BUBX[i] + 150), maxdur=.35)
S('riser/smooth_riser', 26.70, .24, al='end'); S('whoosh/high_and_fast_woosh', 26.86, .42, al='peak')
# ---------------- PAYOFF 26.95–29.3 ----------------
S('whoosh/whoosh_deep_short', 27.02, .42, al='peak'); S(PSP, 27.02, .34, maxdur=.5)
S('pop/sweet_ui_open', 27.62, .30); S(SW, 27.70, .28, maxdur=.65, off=1.0)
S('ui/ui_enter', 28.38, .38); S('pop/slow_and_smooth_pop', 28.40, .30)
# ---------------- OFFERS 29.0–33.1 ----------------
S('whoosh/simple_whoosh', 28.98, .16, al='peak')
for tt in [29.12, 29.27, 29.42]:
    S('whoosh/epic_fast_whoosh_345469', tt + .08, .30, -.4, al='peak'); S('pop/smooth_pop', tt + .22, .22, -.2)
S('money/cinematic_money_1', 29.90, .28)
S('ui/ui_stretch', 30.45, .30, maxdur=.8); S('shutter/smooth_cammera_shutter', 30.64, .40)
S('pop/meadia_pop', 31.17, .30, -.2, maxdur=.35); S('pop/meadia_pop', 31.72, .30, .2, maxdur=.35)
# ---------------- NEGOTIATE + CHAT 33.2–37.6 ----------------
S('click/high_click', 33.22, .50, -.5); S('ui/ui_button', 33.22, .20, -.5); S('pop/smooth_pop', 33.32, .40, -.5)
S('gear/smooth_and_premium_gear', 33.38, .26, maxdur=.55); S('money/cinematic_money_2', 33.95, .30)
S('whoosh/cinematic_fast_normal_whoosh', 34.15, .30, al='peak')
S('pop/sweet_ui_open', 34.08, .34, -.4)
S('ui/ui_typing', 34.62, .22, .4, maxdur=.68)
S('pop/meadia_pop', 35.32, .34, .4, maxdur=.4); S('pop/sweet_ui_open', 35.86, .32, -.4)
S('whoosh/simple_whoosh_2', 36.42, .22, al='peak'); S(PSP, 36.40, .40, maxdur=.5, off=1.0)
S('ui/ui_glitch_flicker_text_2', 36.88, .30); S('whoosh/epic_fast_whoosh_345469', 36.98, .20, al='peak')
# ---------------- OUTRO 37.4–41.5 ----------------
S('whoosh/cinematic_fast_whoosh', 37.55, .32, al='peak')
S('whoosh/epic_fast_whoosh_345469', 38.05, .20, al='peak')
S('riser/smooth_riser', 39.12, .24, al='end')
S('pop/slow_and_smooth_pop', 38.12, .42); S('ui/ui_stretch', 38.20, .24, maxdur=.6)
S('ui/ui_click_digital_04', 38.67, .14)
S('whoosh/whoosh_deep_short', 39.12, .48, al='peak'); S(PSP, 39.12, .45, maxdur=.6, off=2.0)
S('gear/middle_gear', 39.25, .18)
S('ui/ui_premium_open', 39.65, .16, maxdur=.9)
S('pop/smooth_pop', 39.75, .16)

bus = np.stack([L, R], 1)
bus = bus / (np.max(np.abs(bus)) + 1e-9)
bus = np.tanh(bus * 1.2) / np.tanh(1.2)
fo = int(.6 * SR); bus[-fo:] *= np.linspace(1, 0, fo)[:, None]
wavfile.write(OUT, SR, (bus * .89 * 32767).astype(np.int16))
print('sfx bus ->', OUT)
