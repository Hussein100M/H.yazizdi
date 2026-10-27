#!/usr/bin/env python3
"""Fit a newly generated voiceover (22 phrases, one per script line) onto the video's phrase slots.
Each phrase is cut at its pauses, trimmed, and placed at the slot start the animation is keyed to;
a phrase longer than its slot is time-compressed with rubberband (pitch kept), capped at 1.3x.
Usage: align_vo.py <new_vo.(mp3|wav)> <out.wav>"""
import sys, os, subprocess, tempfile, numpy as np
from scipy.io import wavfile

SRC, OUT = sys.argv[1:3]
SR = 48000; D = 41.5
# phrase slot starts (s), matched to the scene/caption keyframes in engine.html
STARTS = [0.24, 1.70, 4.06, 5.62, 6.64, 8.40, 11.08, 13.50, 16.16, 17.34, 18.32, 19.02,
          20.98, 23.98, 25.40, 27.00, 29.08, 30.62, 33.24, 33.98, 36.36, 38.24]
ENDS = [s - .08 for s in STARTS[1:]] + [41.0]

def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)

x = load(SRC)
w = int(SR * .01); n = len(x) // w
db = 20 * np.log10(np.sqrt((x[:n*w].reshape(n, w) ** 2).mean(1)) + 1e-9)
on = db > (np.percentile(db, 95) - 38)
# speech runs, merging gaps shorter than 160 ms
runs = []; i = 0
while i < n:
    if on[i]:
        j = i
        while j < n and on[j]: j += 1
        if runs and i - runs[-1][1] < 16: runs[-1][1] = j
        else: runs.append([i, j])
        i = j
    else: i += 1
runs = [r for r in runs if r[1] - r[0] > 8]
if os.environ.get('RUNS'):   # explicit phrase spans "a-b a-b ..." in seconds (verified with Whisper)
    runs = [[int(round(float(p.split('-')[0]) * 100)), int(round(float(p.split('-')[1]) * 100))] for p in os.environ['RUNS'].split()]
if os.environ.get('STARTS'):
    STARTS = [float(v) for v in os.environ['STARTS'].split()]; ENDS = [s - .08 for s in STARTS[1:]] + [41.0]
# merge the shortest gaps until there are exactly len(STARTS) phrases
while len(runs) > len(STARTS):
    gaps = [runs[k+1][0] - runs[k][1] for k in range(len(runs) - 1)]
    k = int(np.argmin(gaps)); runs[k][1] = runs[k+1][1]; del runs[k+1]
print('phrases found', len(runs), 'expected', len(STARTS))
if len(runs) != len(STARTS):
    sys.exit('phrase count mismatch: ' + ', '.join(f'{a/100:.2f}-{b/100:.2f}' for a, b in runs))

out = np.zeros(int(SR * D))
for k, (a, b) in enumerate(runs):
    seg = x[max(0, a * w - int(.03 * SR)): min(len(x), b * w + int(.08 * SR))]
    slot = ENDS[k] - STARTS[k]; dur = len(seg) / SR; ratio = 1.0
    if dur > slot:
        ratio = min(1.3, dur / slot)
        with tempfile.TemporaryDirectory() as td:
            fi, fo = os.path.join(td, 'i.wav'), os.path.join(td, 'o.wav')
            wavfile.write(fi, SR, seg.astype(np.float32))
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', fi, '-af', f'rubberband=tempo={ratio:.4f}:pitchq=quality:transients=smooth', fo], check=True)
            _, seg = wavfile.read(fo)
            seg = seg.astype(np.float64) / (32768.0 if seg.dtype == np.int16 else 1.0)   # keep every phrase on the same float scale
    f = int(.008 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    s0 = int(STARTS[k] * SR); m = min(len(seg), len(out) - s0)
    out[s0:s0 + m] += seg[:m]
    print(f'{k+1:2d} slot {STARTS[k]:5.2f}-{ENDS[k]:5.2f} ({slot:.2f}s)  phrase {dur:.2f}s  tempo x{ratio:.2f}{"  OVER" if dur/ratio > slot + .05 else ""}')
out /= np.max(np.abs(out)) + 1e-9
wavfile.write(OUT, SR, (out * .89 * 32767).astype(np.int16))
print('->', OUT)
