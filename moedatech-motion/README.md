# Moedatech (معداتك) — app motion graphic

9:16 (1080×1920), 41.5 s, 30 fps. Motion language from the reference piece (DOF blur, springs, kinetic type, rolling counters, orange flash transitions) in Moedatech's navy identity (`#263a4f`) with orange as the accent.

- `Moedatech_Motion_9x16.mp4` — final render (voiceover + SFX, −14 LUFS, −2.5 dBTP).
- `engine.html` — every scene, driven by `seek(t)`; times are locked to the voiceover words.
- `render.js` — Playwright renderer (`--preview t1 t2 …` or `--full [workers]`), 3 sub-frames per frame for motion blur.
- `scripts/compose.sh` — averages sub-frames, adds light grain, encodes with the mix.
- `scripts/mix.py` — SFX bus built from the SFX_Library (not in the repo; pass its folder).
- `audio/vo_final.wav` — the original voiceover separated from the old SFX (`scripts/sep.py`, MDX-Net), gated and levelled (`scripts/vo_clean.py`).

## Rebuild

```bash
node render.js --full 4                                   # -> _sub/*.jpg
python3 scripts/mix.py /path/to/sfx_library audio/sfx_bus.wav
ffmpeg -i audio/vo_final.wav -i audio/sfx_bus.wav -filter_complex "[0:a]aformat=channel_layouts=stereo,apad=whole_dur=41.5,asplit=2[vo][sc];[1:a]volume=0.55[sfx];[sfx][sc]sidechaincompress=threshold=0.03:ratio=3.5:attack=6:release=260[sfxd];[vo][sfxd]amix=inputs=2:normalize=0,alimiter=limit=0.95,loudnorm=I=-14:TP=-1:LRA=9" -ar 48000 -t 41.5 audio/mix.wav
bash scripts/compose.sh _sub audio/mix.wav Moedatech_Motion_9x16.mp4
```

If only the sound changes, rebuild the mix and re-run `compose.sh`; the frames don't need re-rendering.
