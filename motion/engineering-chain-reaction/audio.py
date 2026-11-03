#!/usr/bin/env python3
"""Sound for the engineering chain-reaction film.
SFX come from Hussein's SFX_Library (SFX_LIB env var); the music bed is generated unless MUSIC is given.
usage: python3 audio.py times.json out.wav"""
import os, sys, json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
T = json.load(open(sys.argv[1])); OUT = sys.argv[2]
D = T['DUR']; N = int(SR * D)
L = np.zeros((N, 2))
SFX_LIB = os.environ.get('SFX_LIB', '/home/claude/sfx_library')
_cache = {}
missing = []

def sfx(name, maxdur=None):
    key = (name, maxdur)
    if key in _cache: return _cache[key]
    f = os.path.join(SFX_LIB, name + '.wav')
    if not os.path.exists(f):
        missing.append(name); _cache[key] = None; return None
    sr, x = wavfile.read(f)
    x = x.astype(np.float64) / (32768.0 if x.dtype == np.int16 else (2**31 if x.dtype == np.int32 else 1.0))
    if x.ndim == 1: x = np.stack([x, x], 1)
    if sr != SR:
        from scipy.signal import resample_poly
        x = resample_poly(x, SR, sr, axis=0)
    if maxdur and len(x) > maxdur * SR:
        n = int(maxdur * SR); fd = int(.08 * SR); x = x[:n].copy(); x[-fd:] *= np.linspace(1, 0, fd)[:, None]
    x = x / (np.max(np.abs(x)) + 1e-9); _cache[key] = x; return x

def put(x, t0, gain=1.0):
    i = int(t0 * SR)
    if i < 0: x = x[-i:]; i = 0
    n = min(len(x), N - i)
    if n > 0: L[i:i + n] += x[:n] * gain

def sput(name, t0, gain=1.0, pan=0.0, maxdur=None, end_at=None):
    x = sfx(name, maxdur)
    if x is None: return
    x = x.copy()
    if pan: x[:, 0] *= min(1, 1 - pan); x[:, 1] *= min(1, 1 + pan)
    if end_at is not None: t0 = end_at - len(x) / SR
    put(x, t0, gain)

S0, TB, T_PLAN, TS, T_LV, T_FIN, T_LIGHT, T_SUN = (T[k] for k in ['S0', 'TB', 'T_PLAN', 'TS', 'T_LV', 'T_FIN', 'T_LIGHT', 'T_SUN'])
# --- opening + pencil
sput('whoosh/cinematic_low_whoosh', .15, .28)
sput('whoosh/whoosh_deep_short', S0[0] - .35, .22)
# --- sheets fall one after another (alternate two clicks, pan across)
for i, t in enumerate(S0):
    pan = -.5 + i / (len(S0) - 1)
    sput('click/high_click' if i % 2 == 0 else 'ui/ui_button', t, .5 if i % 2 == 0 else .4, pan)
    if i in (0, len(S0) - 1): sput('pop/smooth_pop', t + .1, .35, pan)
# --- ball: push, roll, land on the plan
sput('pop/media_pop', TB, .45, .4)
sput('gear/soft_gear_2', TB + .35, .16, .2)
sput('whoosh/cinematic_fast_whoosh', T_PLAN - .55, .34)
sput('gear/middle_gear', T_PLAN, .24)
# --- plan draws itself
sput('ui/ui_typing_2', T_PLAN + .4, .2, maxdur=TS - T_PLAN - .4)
sput('data/data_collect', T_PLAN + .75, .3)
sput('riser/rjd_riser', 0, .24, end_at=TS)
# --- ball stops, energy ring
sput('whoosh/whoosh_deep_short', TS, .5)
sput('pop/premium_and_smooth_pop', TS + .05, .45)
# --- floors stack
for k in range(8):
    t = T_LV + k * .34 + .3
    sput('pop/media_pop' if k % 2 == 0 else 'ui/ui_enter', t, .32 + .02 * k, (k % 2) * .2 - .1)
sput('gear/middle_gear', T_LV + 8 * .34 + .3, .22)
# --- fins sweep around the facade
sput('whoosh/cinematic_mediam_whoosh', T_FIN - .15, .32)
sput('data/cinematic_data', T_FIN + .25, .3)
# --- lights on
sput('ui/ui_open', T_LIGHT - .4, .4)
for j in range(5): sput('ui/ui_granular_button_select', T_LIGHT + .1 + j * .2, .3, -.4 + j * .2)
# --- sunrise + title
T_TITLE, T_END = T['T_TITLE'], T['T_END']
sput('whoosh/slow_and_smooth_whoosh', T_SUN, .26)
sput('riser/premium_riser', 0, .3, end_at=T_TITLE)
sput('whoosh/whoosh_deep_short', T_TITLE - .05, .45)
sput('pop/premium_and_smooth_pop', T_TITLE, .45)
# --- end card: CUBE logo + office name
sput('riser/smooth_riser', 0, .28, end_at=T_END + .85)
sput('whoosh/cinematic_low_whoosh', T_END + .12, .3)
sput('whoosh/epic_fast_whoosh_345469', T_END + .38, .3, -.3)
sput('whoosh/whoosh_deep_short', T_END + .85, .5)
sput('pop/premium_and_smooth_pop', T_END + .85, .5)
sput('data/data_collect', T_END + 1.05, .22, .2)
sput('pop/sweet_ui_open', T_END + 1.5, .3)
sput('ui/ui_enter', T_END + 1.8, .3)
sput('pop/media_pop', T_END + 2.4, .28)
sput('whoosh/cinematic_low_whoosh_2', D - .9, .2)

sfx_bus = L.copy()
if missing: print('MISSING:', sorted(set(missing)))

# --- music bed (generated, ambient) ---
def lp(x, f): return sosfilt(butter(2, f, btype='low', fs=SR, output='sos'), x, axis=0)
t = np.arange(N) / SR; rng = np.random.default_rng(5)
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
music = np.zeros((N, 2))
def pad(notes, t0, t1, g):
    i0, i1 = int(t0 * SR), int(min(t1, D) * SR); tt = np.arange(i1 - i0) / SR; d = tt[-1] if len(tt) else 1
    env = np.minimum(1, tt / 1.6) * np.minimum(1, (d - tt) / 1.6)
    for m in notes:
        for det, pn in ((-.003, -.5), (.003, .5)):
            s = sum(np.sin(2 * np.pi * mid(m) * (1 + det) * h * tt + rng.uniform(0, 6)) / h ** 1.7 for h in range(1, 6))
            music[i0:i1, 0] += s * env * g * (1 - pn) / 2; music[i0:i1, 1] += s * env * g * (1 + pn) / 2
pad([45, 52, 57, 60], 0, T_PLAN + 1, .05)            # Am (dark)
pad([41, 48, 53, 57], T_PLAN - .5, T_LV + 1, .05)      # F
pad([43, 50, 55, 59], T_LV, T_LIGHT + .5, .055)        # G
pad([48, 55, 60, 64, 67], T_LIGHT - .2, D, .06)        # C (sunrise, opens up)
sub = np.sin(2 * np.pi * 55 * t) * np.exp(-((t - TS) % 100) * 0) * 0
music += lp(music, 2200) * 0
music = lp(music, 2600)
pulse_t = [x for x in np.arange(T_LV, T_LIGHT, .34)]
for pt in pulse_t:
    i = int(pt * SR); tt = np.arange(int(.4 * SR)) / SR; f = 45 + 50 * np.exp(-tt * 25)
    k = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9) * .35; n = min(len(k), N - i); music[i:i + n] += k[:n, None]
music *= (np.minimum(1, t / 1.2) * np.minimum(1, (D - t) / 1.5))[:, None]
music /= np.max(np.abs(music)) + 1e-9

MUSIC = os.environ.get('MUSIC')
if MUSIC:
    import subprocess
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-stream_loop', '-1', '-i', MUSIC, '-t', str(D), '-ar', str(SR), '-ac', '2', '/tmp/_m.wav'], check=True)
    _, mm = wavfile.read('/tmp/_m.wav'); music = mm.astype(np.float64) / 32768; music = music[:N]
    music *= (np.minimum(1, t / 1.0) * np.minimum(1, (D - t) / 2.0))[:len(music), None]

sfx_bus /= np.max(np.abs(sfx_bus)) + 1e-9
sfx_bus = np.tanh(sfx_bus * 1.2) / np.tanh(1.2)
wavfile.write(OUT.replace('.wav', '_sfx.wav'), SR, (sfx_bus * .9 * 32767).astype(np.int16))
wavfile.write(OUT.replace('.wav', '_music.wav'), SR, (music * .9 * 32767).astype(np.int16))
print('wrote', OUT.replace('.wav', '_sfx.wav'), OUT.replace('.wav', '_music.wav'))
