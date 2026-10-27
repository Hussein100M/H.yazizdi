import sys, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfiltfilt, resample_poly
src, out = sys.argv[1:3]
sr, x = wavfile.read(src); x = x.astype(np.float64) / 32768
m = x.mean(1)
m = resample_poly(m, 48000, sr); sr = 48000
m = sosfiltfilt(butter(4, 75, 'high', fs=sr, output='sos'), m)
m = sosfiltfilt(butter(6, 11200, 'low', fs=sr, output='sos'), m)
# speech-activity gate (smooth): attenuate gaps by -24 dB to kill residual SFX bleed
w = int(sr * .01); n = len(m) // w
band = sosfiltfilt(butter(4, [150, 4000], 'band', fs=sr, output='sos'), m)
db = 20 * np.log10(np.sqrt((band[:n*w].reshape(n, w)**2).mean(1)) + 1e-9)
act = (db > -40).astype(float)
# hold 120 ms, pre-open 30 ms
k = np.ones(12); act = np.convolve(act, k, 'full')[:n] > 0
act = np.roll(act, -3) | act
g = np.where(act, 1.0, 10**(-24/20))
# smooth gain (attack/release ~ 15/60 ms)
sm = np.zeros_like(g); v = g[0]
for i, gi in enumerate(g):
    a = .55 if gi > v else .16
    v = v + (gi - v) * a; sm[i] = v
gain = np.repeat(sm, w); gain = np.pad(gain, (0, len(m) - len(gain)), 'edge')
m = m * gain
wavfile.write(out, sr, (np.clip(m / np.max(np.abs(m)) * .89, -1, 1) * 32767).astype(np.int16))
print('ok', len(m) / sr)
