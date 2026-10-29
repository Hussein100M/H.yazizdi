#!/usr/bin/env python3
"""Showreel v2 audio: SFX from Hussein's library + a generated music bed (until a licensed track is supplied).
Usage: SFX_LIB=<dir> python3 sound.py <outdir> [music.mp3]"""
import sys, os
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

OUT = sys.argv[1]; D = 28.0; SR = 48000; N = int(SR * D)
SFX_LIB = os.environ.get('SFX_LIB', '/home/claude/sfx_library')
L = np.zeros(N); R = np.zeros(N); _cache = {}

def put(x, t0, gain=1.0, bus=None):
    BL, BR = bus or (L, R); i = int(t0 * SR); n = min(len(x), N - i)
    if n <= 0 or i < 0: return
    BL[i:i+n] += x[:n, 0] * gain; BR[i:i+n] += x[:n, 1] * gain

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

G, G9, HIT = 'ui/ui_granular_button_select', 'ui/ui_granular_button_select_9', .45

# HOOK: words, "static" struck out, breakout into motion
for i, (t0, pan) in enumerate(zip([.08, .3, .56, .7, .84, 1.0], [.3, -.3, .35, .1, -.1, -.35])):
    sput(G if i % 2 == 0 else G9, t0, .3, pan)
sput('ui/ui_backspace', 1.28, .36)
sput('riser/riser', 1.7 - HIT, .45)
sput('ui/ui_premium_open', 1.7, .5, maxdur=1.6); sput('click/click_1', 1.7, .42)
sput('pop/smooth_pop', 2.47, .3)
# 01 PROMO FILM
sput('ui/ui_enter', 3.8, .34)
sput('pop/premium_and_smooth_pop', 4.05, .38, maxdur=.9)
sput(G, 5.0, .32, -.4); sput(G9, 5.35, .32, -.4)
sput('ui/ui_stretch', 6.72, .4, maxdur=.9)
sput('pop/smooth_pop', 7.32, .28, .3)
sput('riser/rjd_riser', 8.45, .34)
# 02 MASTERPLAN
sput('ui/ui_enter', 8.7, .3)
sput('gear/smooth_and_premium_gear', 9.0, .24, maxdur=1.0)
sput('data/cinematic_data_collect_2', 9.4, .14, maxdur=1.6)
for k, t0 in enumerate([9.55, 9.67, 9.79]): sput(G9, t0, .18, (k - 1) * .4)
for k, (t0, pan) in enumerate(zip([9.95, 10.25, 10.55], [-.3, .3, .2])): sput(G if k % 2 == 0 else G9, t0, .3, pan)
sput('click/cinematic_click', 10.86, .3)
sput('pop/slow_and_smooth_pop', 11.22, .45, .3); sput('click/high_click', 11.45, .3, .3)
sput('pop/sweet_ui_open', 11.52, .34, .3)
sput('riser/riser', 13.35 - HIT, .4)
# 03 INFOGRAPHICS
sput('ui/ui_enter', 13.3, .3)
sput('gear/smooth_and_premium_gear', 13.5, .26, maxdur=1.1)
sput(G9, 14.76, .2)
sput('ui/ui_button', 15.0, .24); sput('pop/smooth_pop', 15.12, .3, .2)
sput('data/data_collect', 15.32, .35)
sput(G, 15.52, .2, 0); sput(G9, 15.72, .2, -.3)
sput('ui/ui_stretch', 17.33, .42, -.3, maxdur=.9)
# 04 CONSTRUCTION
sput('ui/ui_enter', 17.7, .3)
sput('data/cinematic_data', 17.95, .2)
for k, t0 in enumerate([17.95, 18.68, 19.42, 20.15]): sput(G if k % 2 == 0 else G9, t0, .3, .4 - k * .27)
sput('gear/middle_gear', 20.16, .2)
sput('gear/long_speed_gear', 20.22, .3, .2)
sput('shutter/smooth_camera_shutter', 21.38, .42)
# RECAP + CLOSING
sput('riser/rjd_riser', 21.46, .3)
for k, (t0, nm, pan) in enumerate([(21.6, 'shutter/camera_shutter', .4), (21.7, 'shutter/little_bit_hard_camera_shutter', -.4), (21.8, 'shutter/camera_shutter', .4)]):
    sput(nm, t0, .34, pan)
sput('riser/riser', 23.3 - HIT, .38); sput('click/click_1', 23.3, .42)
sput('pop/premium_and_smooth_pop', 24.95, .5, maxdur=.9); sput('click/click_1', 24.95, .5)
sput('pop/smooth_pop', 25.47, .22)
sput('pop/media_pop', 25.96, .38)
for k in range(3): sput(G9 if k % 2 else G, 26.25 + k * .1, .2, (k - 1) * .3)
sput('click/high_click', 26.9, .5); sput('ui/ui_button', 26.9, .22)
sput('pop/smooth_pop', 27.02, .4)

sfx_bus = np.stack([L, R], 1); sfx_bus /= np.max(np.abs(sfx_bus)) + 1e-9
sfx_bus = np.tanh(sfx_bus * 1.2) / np.tanh(1.2)
wavfile.write(os.path.join(OUT, '_sfx.wav'), SR, (sfx_bus * .89 * 32767).astype(np.int16))

# ---------------- music bed: silent static slide, drop at the breakout (1.7 s) ----------------
r = np.random.default_rng(3); ML = np.zeros(N); MR = np.zeros(N); BUS = (ML, MR)
def mput(x, t0, g, pan=0):
    a = (pan + 1) * np.pi / 4; put(np.stack([x * np.cos(a), x * np.sin(a)], 1), t0, g, BUS)
def lp(x, f, o=2): return sosfilt(butter(o, f, btype='low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, btype='high', fs=SR, output='sos'), x)
mid = lambda m: 440 * 2 ** ((m - 69) / 12); beat = .5; bar = 2.0; T0 = 1.7
CH = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 55, 60, 64], [55, 59, 62, 67]]; RT = [45, 41, 48, 43]
def pad(f, d):
    t = np.arange(int(d * SR)) / SR; s = np.zeros_like(t)
    for det in (-.004, 0, .004):
        for h in range(1, 7): s += np.sin(2 * np.pi * f * (1 + det) * h * t + r.uniform(0, 6)) / (h ** 1.6)
    return lp(s * np.minimum(1, t / .6) * np.minimum(1, (d - t) / .9), 1600)
def pluck(m, d=.45):
    q = np.arange(int(d * SR)) / SR; f = mid(m)
    return (np.sin(2 * np.pi * f * q) + .3 * np.sin(4 * np.pi * f * q) + .1 * np.sin(6 * np.pi * f * q)) * np.exp(-q * 9) * np.minimum(1, q / .002)
def kick():
    x = np.arange(int(.35 * SR)) / SR; f = 45 + 75 * np.exp(-x * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 9)
def hat(d=.05): n = int(d * SR); return hp(r.standard_normal(n), 7000) * np.exp(-np.arange(n) / SR * 90)
def clap():
    n = int(.22 * SR); x = np.arange(n) / SR; e = np.exp(-x * 22) + .6 * np.exp(-np.maximum(0, x - .012) * 40) * (x > .012)
    return lp(hp(r.standard_normal(n), 1200), 7000) * e
def seg(t): return 0 if t < T0 else (2 if t < 21.45 else 4)
# intro: one low filtered drone under the static slide
t = np.arange(int(T0 * SR)) / SR; mput(lp(np.sin(2 * np.pi * mid(45) * t) + .4 * np.sin(2 * np.pi * mid(57) * t), 500) * np.minimum(1, t / .4) * np.minimum(1, (T0 - t) / .05), 0, .05)
for b in range(0, int((D - T0) / bar) + 1):
    tb = T0 + b * bar; ci = b % 4; ch = CH[ci]; sg = seg(tb)
    for m in ch: mput(pad(mid(m), bar + .9), tb, .04, r.uniform(-.5, .5))
    t = np.arange(int((bar + .4) * SR)) / SR
    mput(np.sin(2 * np.pi * mid(RT[ci] - 12) * t) * np.minimum(1, t / .05) * np.minimum(1, (bar + .4 - t) / .3), tb, .13 if sg == 2 else .07)
    for s8 in range(8):
        ts = tb + s8 * beat / 2
        if ts >= D: continue
        sg = seg(ts); m = ch[[0, 1, 2, 3, 2, 1, 3, 2][s8]] + 12
        g = .05 if sg == 2 else .03
        mput(pluck(m), ts, g, [-.4, .4][s8 % 2]); mput(lp(pluck(m), 2500), ts + beat * .75, g * .4, [.4, -.4][s8 % 2])
        if sg == 2:
            if s8 % 2 == 0: mput(kick(), ts, .3)
            mput(hat(), ts + beat / 4, .05, .2)
            if s8 in (2, 6) and ts > T0 + bar: mput(clap(), ts, .08, -.1)
m = np.stack([ML, MR], 1); m /= np.max(np.abs(m)) + 1e-9
tt = np.arange(N) / SR; m *= np.minimum(1, (D - tt) / 2.0)[:, None]
wavfile.write(os.path.join(OUT, '_bed.wav'), SR, (np.clip(m, -1, 1) * .9 * 32767).astype(np.int16))
print('sound ok')
