import sys, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfiltfilt, resample_poly
# vo_clean.py <separated_vocals.wav> <out.wav>
# Gentle cleanup: band-limit to the VO's own 11.3 kHz bandwidth (anything above is old-SFX residue),
# soft downward expander in the pauses (-18 dB floor, 40 ms look-ahead, 160 ms hold) so word tails and breaths survive.
src, out = sys.argv[1:3]
sr, x = wavfile.read(src)
x = x.astype(np.float64) / (32768.0 if x.dtype == np.int16 else (2147483648.0 if x.dtype == np.int32 else 1.0))
m = x.mean(1) if x.ndim > 1 else x
m = resample_poly(m, 48000, sr); sr = 48000
m = sosfiltfilt(butter(4, 70, 'high', fs=sr, output='sos'), m)
m = sosfiltfilt(butter(8, 11300, 'low', fs=sr, output='sos'), m)
w = int(sr * .005); n = len(m) // w
band = sosfiltfilt(butter(4, [150, 4000], 'band', fs=sr, output='sos'), m)
db = 20 * np.log10(np.sqrt((band[:n*w].reshape(n, w)**2).mean(1)) + 1e-9)
act = db > -46
hold = 32; la = 8                                   # 160 ms hold, 40 ms look-ahead (5 ms frames)
act = np.convolve(act.astype(float), np.ones(hold), 'full')[:n] > 0
act = np.concatenate([act[la:], np.zeros(la, bool)]) | act
g = np.where(act, 1.0, 10 ** (-18 / 20))
sm = np.zeros_like(g); v = g[0]
for i, gi in enumerate(g):
    v += (gi - v) * (.5 if gi > v else .06); sm[i] = v
gain = np.interp(np.arange(len(m)), np.arange(n) * w + w / 2, sm)
m = m * gain
wavfile.write(out, sr, (np.clip(m / np.max(np.abs(m)) * .89, -1, 1) * 32767).astype(np.int16))
print('ok', round(len(m) / sr, 2))
