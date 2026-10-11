"""Build the SFX-only soundtrack from a cue sheet and the client's SFX library.

Usage:
  python3 scripts/mix_sfx.py <cues.json> <sfx_library_dir> <out.wav> [--video in.mp4 out.mp4] [--wave out.png]

cues.json: [{t, sound, gain, pan, align: "peak"|"start", maxdur?, event}] (t in film seconds).
Each sample is peak-normalised, channel-balanced, trimmed to maxdur (80 ms fade), placed so its
first sample (align=start) or its loudest 10 ms (align=peak) lands on t, panned and summed.
Mastering is deliberately linear (one gain + an oversampled peak limiter) so the gain hierarchy
in cues.py survives; loudnorm's dynamic fallback would ride the small ticks up to the logo hits.
The delivered MP4 is decoded and checked: integrated loudness within 0.6 LU of TARGET_I and
true peak <= -1 dBTP, otherwise the limiter ceiling is lowered and the master rebuilt.
"""
import json
import os
import subprocess
import sys
import wave

import numpy as np

SR = 48000
DURATION = 50.0
TARGET_I = -16.0  # LUFS; SFX-only bed with ~19 dB crest — platforms normalise to -14 anyway


def read_wav(path):
    with wave.open(path, "rb") as w:
        assert w.getframerate() == SR and w.getsampwidth() == 2
        x = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(np.float64) / 32768.0
        return x.reshape(-1, w.getnchannels())


def write_wav(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def peak_offset(x):
    """Seconds from the first sample to the loudest 10 ms window."""
    m = x.mean(1)
    hop = SR // 100
    n = len(m) // hop
    if n == 0:
        return 0.0
    rms = np.sqrt((m[: n * hop].reshape(n, hop) ** 2).mean(1))
    return float(rms.argmax() * hop + hop / 2) / SR


_cache = {}


def sample(lib, name, maxdur, mono=None):
    key = (name, maxdur, mono)
    if key not in _cache:
        x = read_wav(os.path.join(lib, name + ".wav"))
        if x.shape[1] == 1:
            x = np.repeat(x, 2, 1)
        if mono == "dominant":  # anti-phase / one-sided textures: keep the louder channel only
            ch = int(np.sqrt((x[:, 1] ** 2).mean()) > np.sqrt((x[:, 0] ** 2).mean()))
            x = np.repeat(x[:, ch : ch + 1], 2, 1)
        else:  # remove built-in L/R skew (> 2 dB) so the cue's pan means what it says
            rl, rr = np.sqrt((x ** 2).mean(0)) + 1e-12
            if abs(20 * np.log10(rr / rl)) > 2:
                x = x * np.array([np.sqrt(rl * rr) / rl, np.sqrt(rl * rr) / rr])
        if maxdur and len(x) > maxdur * SR:
            n, f = int(maxdur * SR), int(0.08 * SR)
            x = x[:n].copy()
            x[-f:] *= np.linspace(1, 0, f)[:, None]
        x = x / (np.abs(x).max() + 1e-9)
        _cache[key] = (x, peak_offset(x))
    return _cache[key]


def mix(cues, lib):
    bus = np.zeros((int(DURATION * SR), 2))
    placed = []
    for c in sorted(cues, key=lambda c: c["t"]):
        x, tp = sample(lib, c["sound"], c.get("maxdur"), c.get("mono"))
        start = c["t"] - (tp if c.get("align", "start") == "peak" else 0.0)
        i0 = int(round(start * SR))
        if i0 < 0:
            x = x[-i0:].copy()
            x[:480] *= np.linspace(0, 1, 480)[:, None]  # 10 ms fade-in where the head was cut
            i0 = 0
        x = x * float(c["gain"])
        pan = float(c.get("pan", 0.0))
        x = x * np.array([min(1.0, 1.0 - pan), min(1.0, 1.0 + pan)])
        n = min(len(x), len(bus) - i0)
        if n > 0:
            bus[i0 : i0 + n] += x[:n]
        placed.append({**c, "start": round(start, 3), "landing": round(start + (tp if c.get("align") == "peak" else 0), 3)})
    # gentle tail fade so the file ends cleanly on the still
    f = int(0.35 * SR)
    bus[-f:] *= np.linspace(1, 0, f)[:, None] ** 2
    return bus, placed


def ebur128(args):
    """Integrated loudness and true peak of an ffmpeg input (list of input args)."""
    err = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", *args, "-af", "ebur128=peak=true", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    summ = err[err.rindex("Summary:"):]
    i = float(summ.split("I:")[1].split("LUFS")[0])
    tp = float(summ.split("Peak:")[1].split("dBFS")[0])
    return i, tp


def master(bus, dst, ceiling):
    """Linear gain to TARGET_I + 4x-oversampled peak limiter. Two gain passes (the limiter eats a little)."""
    raw = dst + ".f32"
    bus.astype("<f4").tofile(raw)
    src = ["-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw]
    i_raw, _ = ebur128(src)
    gain = TARGET_I - i_raw
    for _ in range(3):
        af = (f"highpass=f=35:poles=2,aresample=192000,volume={gain:.2f}dB,"
              f"alimiter=limit={ceiling}:attack=1:release=40:level=disabled,aresample={SR}")
        subprocess.run(["ffmpeg", "-v", "error", "-y", *src, "-af", af, "-c:a", "pcm_s24le", dst], check=True)
        i_out, tp_out = ebur128(["-i", dst])
        if abs(i_out - TARGET_I) <= 0.2:
            break
        gain += TARGET_I - i_out
    os.remove(raw)
    return i_raw, gain, i_out, tp_out


def waveform_png(wav_path, cues, out_png):
    from PIL import Image, ImageDraw

    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", wav_path, "-ac", "1", "-f", "f32le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, "<f4").astype(np.float64)
    W, H = 2000, 360
    img = Image.new("RGB", (W, H), (14, 16, 30))
    d = ImageDraw.Draw(img)
    per = len(x) / W
    for px in range(W):
        seg = x[int(px * per) : int((px + 1) * per)]
        if len(seg):
            a = np.abs(seg).max()
            d.line([(px, H / 2 - a * H * 0.45), (px, H / 2 + a * H * 0.45)], fill=(120, 150, 255))
    for c in cues:
        px = c["t"] / DURATION * W
        d.line([(px, 0), (px, 14)], fill=(255, 200, 90))
    for s in range(0, 51, 5):
        px = s / DURATION * W
        d.line([(px, H - 12), (px, H)], fill=(200, 200, 200))
        d.text((px + 3, H - 14), f"{s}s", fill=(200, 200, 200))
    img.save(out_png)


def main():
    args = sys.argv[1:]
    cues_path, lib, out_wav = args[0], args[1], args[2]
    cues = json.load(open(cues_path))
    if isinstance(cues, dict):
        cues = cues["cues"]
    bus, placed = mix(cues, lib)
    video = args[args.index("--video") + 1 : args.index("--video") + 3] if "--video" in args else None
    for ceiling in (0.75, 0.7, 0.65, 0.6):
        i_raw, gain, i_out, tp_out = master(bus, out_wav, ceiling)
        print(f"cues: {len(placed)}  bus I={i_raw:.1f}  gain={gain:+.1f} dB  ceiling={ceiling}  wav I={i_out:.1f} TP={tp_out:.1f}")
        if not video:
            break
        src, dst = video
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-i", src, "-i", out_wav, "-map", "0:v", "-map", "1:a",
             "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", dst],
            check=True,
        )
        mi, mtp = ebur128(["-i", dst, "-map", "0:a"])
        print(f"  muxed {dst}: I={mi:.1f} LUFS  TP={mtp:.1f} dBTP")
        if mtp <= -1.0 and abs(mi - TARGET_I) <= 0.6:
            break
    else:
        sys.exit("master failed the loudness / true-peak gate")
    if "--wave" in args:
        waveform_png(out_wav, placed, args[args.index("--wave") + 1])


if __name__ == "__main__":
    main()
