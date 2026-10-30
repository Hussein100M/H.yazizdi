#!/usr/bin/env bash
# Full render: ./build.sh  (needs SFX_LIB=<path to sfx_library>, node + playwright, python3 numpy/scipy, ffmpeg)
# Audio only (after changing sounds or music): ./build.sh audio
set -euo pipefail
cd "$(dirname "$0")"
OUT=Showreel_Motion_9x16.mp4
python3 sound.py .
if [ "${1:-}" != "audio" ]; then
  # shutter samples per frame (12 on fast moves, 4 elsewhere) averaged in linear light -> real motion blur
  rm -rf _sub _frames && node ../render.js engine.html _sub full 28 4 adaptive && python3 ../avg.py _sub _frames
  # finishing grade: soft highlight bloom, gentle filmic S-curve, cool shadows / warm highlights
  GRADE="format=gbrp,split[a][b];[b]curves=all='0/0 0.72/0 1/1',gblur=sigma=28[g];[a][g]blend=all_mode=screen:all_opacity=0.14,curves=all='0/0 0.06/0.045 0.5/0.5 0.94/0.955 1/1',colorbalance=rs=-0.02:bs=0.025:rh=0.012:gh=0.004:bh=-0.012,eq=saturation=1.04,format=yuv420p"
  ffmpeg -nostdin -v error -y -framerate 30 -i _frames/%05d.jpg -filter_complex "[0:v]$GRADE" -c:v libx264 -crf 19 -preset slow -t 28 _video.mp4
fi
# licensed track in assets/music.mp3 replaces the generated bed (looped/trimmed, ducked under the SFX)
if [ -f assets/music.mp3 ]; then MUS="-stream_loop -1 -i assets/music.mp3"; MV=0.35; else MUS="-i _bed.wav"; MV=0.6; fi
ffmpeg -nostdin -v error -y $MUS -i _sfx.wav -filter_complex "[0:a]atrim=0:28,afade=t=out:st=26.5:d=1.5,volume=$MV[mus];[1:a]asplit[s1][s2];[mus][s2]sidechaincompress=threshold=0.05:ratio=3:attack=5:release=250[md];[md][s1]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=11[a]" -map "[a]" -ar 48000 -t 28 _mix.wav
ffmpeg -nostdin -v error -y -i _video.mp4 -i _mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -t 28 -movflags +faststart "$OUT"
echo "done -> $OUT"
