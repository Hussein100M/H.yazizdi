#!/usr/bin/env python3
"""SFX bus built from Hussein's SFX library, synced to engine.html. Usage: SFX_LIB=<dir> sfx_lib.py <outdir> <duration>"""
import sys, os
import numpy as np
from scipy.io import wavfile

OUT = sys.argv[1]; D = float(sys.argv[2])
SR = 48000; N = int(SR * D)
L = np.zeros(N); R = np.zeros(N)
SFX_LIB = os.environ.get('SFX_LIB', '/home/claude/sfx_library')
_cache = {}

def put(x, t0, gain=1.0):
    i = int(t0 * SR); n = min(len(x), N - i)
    if n <= 0 or i < 0: return
    L[i:i+n] += x[:n, 0] * gain; R[i:i+n] += x[:n, 1] * gain

def sfx(name, maxdur=None):
    key = (name, maxdur)
    if key in _cache: return _cache[key]
    sr, x = wavfile.read(os.path.join(SFX_LIB, name + '.wav'))
    x = x.astype(np.float64) / 32768.0
    if x.ndim == 1: x = np.stack([x, x], 1)
    if sr != SR:
        from scipy.signal import resample_poly
        x = resample_poly(x, SR, sr, axis=0)
    if maxdur and len(x) > maxdur * SR:
        n = int(maxdur * SR); f = int(.08 * SR); x = x[:n].copy(); x[-f:] *= np.linspace(1, 0, f)[:, None]
    x = x / (np.max(np.abs(x)) + 1e-9); _cache[key] = x; return x

def sput(name, t0, gain=1.0, pan=0.0, maxdur=None):
    x = sfx(name, maxdur).copy()
    if pan: x[:, 0] *= min(1, 1 - pan); x[:, 1] *= min(1, 1 + pan)
    put(x, t0, gain)

HIT = .45  # riser/riser: reverse swell peaks into its hit 0.45 s after start

# 1. hook: words appear one by one (RTL, first word on the right)
for i, (t0, pan) in enumerate(zip([.18, .46, .84, 1.04, 1.26, 1.46], [.35, -.35, .4, .1, -.15, -.4])):
    sput('ui/ui_granular_button_select' if i % 2 == 0 else 'ui/ui_granular_button_select_9', t0, .34, pan)
sput('ui/ui_stretch', 2.08, .4, -.5, maxdur=.9)                 # second line swipes off to the left
sput('riser/riser', 2.6 - HIT, .38, .3)                         # orange square swells into the rope slam
# 2. rope: cards slide in, pegs/photos land
sput('ui/ui_stretch', 2.56, .36, .3, maxdur=.8)
for k, (t0, nm) in enumerate([(2.64, 'shutter/smooth_camera_shutter'), (2.74, 'shutter/little_bit_hard_camera_shutter'), (2.86, 'shutter/camera_shutter')]):
    sput(nm, t0, .5 - k * .1, [-.3, .2, .4][k])
sput('riser/rjd_riser', 4.22, .34)                              # fast zoom-out into the dark canvas
sput('pop/smooth_pop', 4.42, .2, -.5); sput('pop/smooth_pop', 4.5, .18, .4)
# 3a. identity icon
sput('pop/media_pop', 4.74, .36)
sput('ui/ui_beatbox_click_01', 5.12, .3, -.3); sput('ui/ui_beatbox_click_01', 5.52, .26, .3)
sput('ui/ui_glitch_flicker_text_2', 5.95, .3)                   # icon morphs into the text card
sput('pop/sweet_ui_open', 6.32, .42)
# 3b. typing
sput('ui/ui_typing_2', 6.42, .3, maxdur=.95)
sput('ui/ui_click_digital_03', 7.42, .25)                       # card tilts
# 3c. swatches
sput('ui/ui_stretch', 7.66, .4, .4, maxdur=.8)
sput('click/cinematic_click', 8.06, .4); sput('pop/slow_and_smooth_pop', 8.08, .4)
sput('ui/ui_granular_button_select', 8.72, .32, -.5); sput('ui/ui_granular_button_select_9', 8.78, .32, .5)
# 3d. blueprint draws itself
sput('riser/riser', 9.52 - HIT, .38)
sput('gear/smooth_and_premium_gear', 9.6, .26, maxdur=1.25)
for k, t0 in enumerate([10.43, 10.57, 10.71]): sput('ui/ui_granular_button_select_9', t0, .2, (k - 1) * .35)
# 3e. material samples + mouse selection
sput('ui/ui_stretch', 10.8, .4, -.4, maxdur=.8)
for j, (t0, pan) in enumerate(zip([11.1, 11.2, 11.3, 11.4], [.4, -.4, .4, -.4])):
    sput('ui/ui_granular_button_select' if j % 2 == 0 else 'ui/ui_granular_button_select_9', t0, .33, pan)
sput('click/high_click', 11.8, .55, .25); sput('ui/ui_button', 11.8, .22, .25)   # mouse press
sput('pop/smooth_pop', 11.9, .5, .25)                                            # release
# 3f. counter
sput('riser/riser', 12.7 - HIT, .36)
sput('data/data_collect', 12.66, .35)
sput('ui/ui_enter', 13.42, .38); sput('gear/middle_gear', 13.42, .2)
# 4. moodboard grid zoom-out, build-up into the logo
sput('ui/ui_premium_open', 13.52, .36, maxdur=1.5)
sput('riser/smooth_riser', 15.33 - 1.76, .2, maxdur=1.78)
sput('riser/riser', 15.33 - HIT, .42)
# 5. logo + signature
sput('pop/premium_and_smooth_pop', 15.33, .55, maxdur=.9); sput('click/click_1', 15.33, .6)   # logo impact
sput('gear/long_speed_gear', 15.98, .28, -.3)                   # name slides out from behind the icon
sput('pop/smooth_pop', 16.65, .3)                               # tagline
sput('ui/ui_backspace', 18.85, .3)                              # lockup fades
sput('pop/media_pop', 19.32, .45); sput('click/cinematic_click', 19.32, .3)

sfx_bus = np.stack([L, R], 1)
sfx_bus /= np.max(np.abs(sfx_bus)) + 1e-9
sfx_bus = np.tanh(sfx_bus * 1.2) / np.tanh(1.2)
wavfile.write(os.path.join(OUT, '_sfx.wav'), SR, (sfx_bus * .89 * 32767).astype(np.int16))
print('sfx from library ->', os.path.join(OUT, '_sfx.wav'))
