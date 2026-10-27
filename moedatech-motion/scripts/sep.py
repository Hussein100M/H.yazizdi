#!/usr/bin/env python3
"""MDX-Net vocal separation (UVR ONNX models), numpy STFT.
Usage: sep.py model.onnx in.wav out_vocals.wav [compensate]"""
import sys, numpy as np, onnxruntime as ort
from scipy.io import wavfile
from scipy.signal import resample_poly

model, inp, out = sys.argv[1:4]
comp = float(sys.argv[4]) if len(sys.argv) > 4 else 1.009
NFFT, HOP, DIMF, DIMT = 7680, 1024, 3072, 256
CH = HOP * (DIMT - 1)  # 261120 samples per chunk
win = 0.5 - 0.5 * np.cos(2 * np.pi * np.arange(NFFT) / NFFT)  # periodic hann

def stft(x):  # x [2,t] -> [4, DIMF, T]
    pad = NFFT // 2
    xp = np.pad(x, ((0, 0), (pad, pad)), mode='reflect')
    T = 1 + (xp.shape[1] - NFFT) // HOP
    idx = np.arange(NFFT)[None, :] + HOP * np.arange(T)[:, None]
    fr = xp[:, idx] * win  # [2,T,NFFT]
    S = np.fft.rfft(fr, axis=-1).transpose(0, 2, 1)  # [2,F,T]
    o = np.stack([S.real, S.imag], 1).reshape(4, -1, T)
    return o[:, :DIMF].astype(np.float32)

def istft(s):  # [4, DIMF, T] -> [2, t]
    F = NFFT // 2 + 1; T = s.shape[-1]
    s = np.concatenate([s, np.zeros((4, F - DIMF, T), np.float32)], 1).reshape(2, 2, F, T)
    S = (s[:, 0] + 1j * s[:, 1]).transpose(0, 2, 1)  # [2,T,F]
    fr = np.fft.irfft(S, n=NFFT, axis=-1) * win
    n = NFFT + HOP * (T - 1); y = np.zeros((2, n)); wsum = np.zeros(n)
    for t in range(T):
        y[:, t*HOP:t*HOP+NFFT] += fr[:, t]; wsum[t*HOP:t*HOP+NFFT] += win ** 2
    y /= np.maximum(wsum, 1e-8)
    pad = NFFT // 2
    return y[:, pad:n - pad]

sr, x = wavfile.read(inp)
x = x.astype(np.float64) / (32768.0 if x.dtype == np.int16 else 1.0)
if x.ndim == 1: x = np.stack([x, x], 1)
if sr != 44100: x = resample_poly(x, 44100, sr, axis=0); sr = 44100
mix = x.T.astype(np.float32); n = mix.shape[1]
sess = ort.InferenceSession(model)
# overlapping chunks (50%), hann-weighted overlap-add, edges trimmed
step = CH // 2
pad_l = CH // 2
mp = np.pad(mix, ((0, 0), (pad_l, CH + step)))
acc = np.zeros_like(mp); wacc = np.zeros(mp.shape[1])
cw = np.hanning(CH).astype(np.float32) + 1e-3
for i in range(0, n + pad_l, step):
    seg = mp[:, i:i+CH]
    if seg.shape[1] < CH: break
    spec = stft(seg)[None]
    pred = sess.run(None, {'input': spec})[0]
    pred_n = sess.run(None, {'input': -spec})[0]  # denoise trick
    p = (pred - pred_n) * 0.5
    y = istft(p[0])[:, :CH]
    acc[:, i:i+CH] += y * cw; wacc[i:i+CH] += cw
voc = (acc / np.maximum(wacc, 1e-6))[:, pad_l:pad_l + n] * comp
wavfile.write(out, sr, (np.clip(voc.T, -1, 1) * 32767).astype(np.int16))
print('ok', out, voc.shape)
