# Moedatech (معداتك) — app motion graphic

9:16 (1080×1920), 41.5 s, 30 fps. Motion language from the reference piece (DOF blur, springs, kinetic type, rolling counters, orange flash transitions) in Moedatech's navy identity (`#263a4f`) with orange as the accent.

- `Moedatech_Motion_9x16.mp4` — final render (voiceover + SFX, −14 LUFS, −2.5 dBTP).
- `engine.html` — every scene, driven by `seek(t)`; times are locked to the voiceover words.
- `render.js` — Playwright renderer (`--preview t1 t2 …` or `--full [workers]`), 3 sub-frames per frame for motion blur.
- `scripts/compose.sh` — averages sub-frames, adds light grain, encodes with the mix.
- `scripts/mix.py` — SFX bus built from the SFX_Library (not in the repo; pass its folder).
- `img/*.jpg` — the real equipment photos, recovered from the original video: `scripts/cat_photo.py` (Real-ESRGAN ×4 + LaMa removes the phone overlays) and `scripts/photos.py` (category tiles).
- `audio/vo_final.wav` — voiceover: ElevenLabs "Nasser AlJubaily" (Saudi), eleven_multilingual_v2, source in `audio/vo_nasser_source.mp3`. `scripts/align_vo.py` places each of its 22 phrases on the scene slots (rubberband ≤ ×1.06 where a phrase runs long); the on-screen words in `engine.html` are timed to this voice. Older voice extractions (`vo_hybrid.py`, `sep.py`, `vo_clean.py`) are kept for reference.
  Phrase spans / slot starts used: `RUNS="0.08-1.40 2.53-4.01 4.68-6.22 6.40-7.46 8.05-9.43 9.60-11.30 11.96-13.77 14.43-16.79 17.15-18.26 18.89-19.81 20.09-20.52 21.01-22.56 23.28-25.25 25.93-27.08 27.28-28.51 29.04-30.48 31.07-32.16 32.59-34.56 35.28-35.75 36.03-37.59 38.27-39.01 39.61-40.75"`, `STARTS="0.18 1.92 3.92 5.58 6.76 8.40 11.08 13.25 16.02 17.28 18.36 19.02 20.98 23.98 25.40 27.00 29.08 30.62 33.24 33.98 36.36 38.40"`.

## Rebuild

```bash
node render.js --full 4                                   # -> _sub/*.jpg
python3 scripts/mix.py /path/to/sfx_library audio/sfx_bus.wav
ffmpeg -i audio/vo_final.wav -i audio/sfx_bus.wav -filter_complex "[0:a]aformat=channel_layouts=stereo,apad=whole_dur=41.5,asplit=2[vo][sc];[1:a]volume=0.80[sfx];[sfx][sc]sidechaincompress=threshold=0.03:ratio=3.5:attack=6:release=260[sfxd];[vo][sfxd]amix=inputs=2:normalize=0,alimiter=limit=0.95,loudnorm=I=-14:TP=-1:LRA=9" -ar 48000 -t 41.5 audio/mix.wav
bash scripts/compose.sh _sub audio/mix.wav Moedatech_Motion_9x16.mp4
```

If only the sound changes, rebuild the mix and re-run `compose.sh`; the frames don't need re-rendering.
