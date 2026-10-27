#!/usr/bin/env python3
"""Voice = Wiener mask (from BS-Roformer's voice estimate) applied to the ORIGINAL audio.
Where the old SFX are absent the mask is ~1, so the original voice passes through untouched
(no separation artifacts); where SFX overlap the words, the mask removes them.
Usage: vo_hybrid.py <original.wav> <roformer_vocals.wav> <out.wav>"""
import sys, numpy as np
from scipy.io import wavfile
from scipy.signal import stft, istft, butter, sosfiltfilt, resample_poly
from scipy.ndimage import uniform_filter

def mono(path):
    sr, x = wavfile.read(path); x = x.astype(np.float64)
    x /= 32768.0 if np.abs(x).max() > 2 else 1.0
    return sr, (x.mean(1) if x.ndim > 1 else x)

sr, O = mono(sys.argv[1]); sr2, V = mono(sys.argv[2]); assert sr == sr2
n = min(len(O), len(V)); O, V = O[:n], V[:n]
# align (separator output should be sample-aligned; verify)
lag = np.argmax(np.correlate(O[sr*5:sr*7], V[sr*5:sr*7], 'full')) - (2*sr - 1)
if abs(lag) > 0 and abs(lag) < 200: V = np.roll(V, lag)
print('lag', lag)
NF, HOP = 2048, 256
f, t, SO = stft(O, sr, nperseg=NF, noverlap=NF - HOP)
_, _, SV = stft(V, sr, nperseg=NF, noverlap=NF - HOP)
PV = np.abs(SV) ** 2; PR = np.abs(SO - SV) ** 2
PV = uniform_filter(PV, (3, 3)); PR = uniform_filter(PR, (3, 3))      # tame musical noise
M = PV / (PV + PR + 1e-12)
M = np.clip(M, 0, 1) ** 1.0
M[f > 11300] = 0                                                      # VO is band-limited; anything above is old SFX
_, Y = istft(M * SO, sr, nperseg=NF, noverlap=NF - HOP)
Y = Y[:n]
# soft expander in the pauses (-20 dB floor, look-ahead 40 ms, hold 160 ms) to drop faint leftovers between phrases
y48 = resample_poly(Y, 48000, sr); sr = 48000
y48 = sosfiltfilt(butter(4, 60, 'high', fs=sr, output='sos'), y48)
w = int(sr * .005); k = len(y48) // w
band = sosfiltfilt(butter(4, [150, 4000], 'band', fs=sr, output='sos'), y48)
db = 20 * np.log10(np.sqrt((band[:k*w].reshape(k, w) ** 2).mean(1)) + 1e-9)
act = np.convolve((db > -46).astype(float), np.ones(32), 'full')[:k] > 0
act = np.concatenate([act[8:], np.zeros(8, bool)]) | act
g = np.where(act, 1.0, 10 ** (-20 / 20)); sm = np.zeros_like(g); v = g[0]
for i, gi in enumerate(g):
    v += (gi - v) * (.5 if gi > v else .06); sm[i] = v
y48 *= np.interp(np.arange(len(y48)), np.arange(k) * w + w / 2, sm)
wavfile.write(sys.argv[3], sr, (np.clip(y48 / np.max(np.abs(y48)) * .89, -1, 1) * 32767).astype(np.int16))
# report: how much of the voice is the untouched original
spm = (np.abs(SO) ** 2).sum(0); thr = np.percentile(spm, 40)
print('frames with mask>0.9 over speech band (share of time-freq energy):', round(float((M[(f > 150) & (f < 8000)] > .9).mean()), 3))
