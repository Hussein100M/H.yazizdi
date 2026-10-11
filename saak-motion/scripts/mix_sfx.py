"""Build the SFX-only soundtrack from a cue sheet and the client's SFX library.

Usage:
  python3 scripts/mix_sfx.py <cues.json> <sfx_library_dir> <out.wav> [--video in.mp4 out.mp4] [--wave out.png]

cues.json: [{t, sound, gain, pan, align: "peak"|"start", maxdur?, event}] (t in film seconds).
Each sample is peak-normalised, trimmed to maxdur (80 ms fade), placed so its first sample
(align=start) or its loudest 10 ms (align=peak) lands on t, panned, summed; the bus is
normalised, soft-limited and loudness-normalised to -14 LUFS / -1 dBTP (two-pass loudnorm).
"""
import json
import os
import subprocess
import sys
import wave

import numpy as np

SR = 48000
DURATION = 50.0


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


def sample(lib, name, maxdur):
    key = (name, maxdur)
    if key not in _cache:
        x = read_wav(os.path.join(lib, name + ".wav"))
        if x.shape[1] == 1:
            x = np.repeat(x, 2, 1)
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
        x, tp = sample(lib, c["sound"], c.get("maxdur"))
        start = c["t"] - (tp if c.get("align", "start") == "peak" else 0.0)
        i0 = int(round(start * SR))
        if i0 < 0:
            x = x[-i0:]
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
    bus /= np.abs(bus).max() + 1e-9
    bus = np.tanh(bus * 1.2) / np.tanh(1.2)
    return bus, placed


def loudnorm(src, dst):
    probe = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", src, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    m = json.loads(probe[probe.rindex("{") : probe.rindex("}") + 1])
    af = (
        f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
        f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
    )
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", af, "-ar", str(SR), "-c:a", "pcm_s16le", dst], check=True)
    return m


def waveform_png(wav_path, cues, out_png):
    from PIL import Image, ImageDraw

    x = read_wav(wav_path).mean(1)
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
    raw = out_wav + ".raw.wav"
    write_wav(raw, bus)
    stats = loudnorm(raw, out_wav)
    os.remove(raw)
    print(f"cues: {len(placed)}  measured before norm: I={stats['input_i']} TP={stats['input_tp']}")
    if "--video" in args:
        i = args.index("--video")
        src, dst = args[i + 1], args[i + 2]
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-i", src, "-i", out_wav, "-map", "0:v", "-map", "1:a",
             "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", dst],
            check=True,
        )
        print("muxed", dst)
    if "--wave" in args:
        waveform_png(out_wav, placed, args[args.index("--wave") + 1])


if __name__ == "__main__":
    main()
