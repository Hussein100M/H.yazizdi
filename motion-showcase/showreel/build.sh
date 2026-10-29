#!/usr/bin/env bash
# Full render: ./build.sh  (needs SFX_LIB=<path to sfx_library>, node + playwright, python3 numpy/scipy, ffmpeg)
# Audio only (after changing sounds or music): ./build.sh audio
set -euo pipefail
cd "$(dirname "$0")"
OUT=Showreel_Motion_9x16.mp4
python3 sound.py .
if [ "${1:-}" != "audio" ]; then
  rm -rf _frames && node ../render.js engine.html _frames full 28 4
  ffmpeg -nostdin -v error -y -framerate 30 -i _frames/%05d.jpg -c:v libx264 -crf 19 -preset slow -pix_fmt yuv420p -t 28 _video.mp4
fi
# licensed track in assets/music.mp3 replaces the generated bed (looped/trimmed, ducked under the SFX)
if [ -f assets/music.mp3 ]; then MUS="-stream_loop -1 -i assets/music.mp3"; MV=0.35; else MUS="-i _bed.wav"; MV=0.6; fi
ffmpeg -nostdin -v error -y $MUS -i _sfx.wav -filter_complex "[0:a]atrim=0:28,afade=t=out:st=26.5:d=1.5,volume=$MV[mus];[1:a]asplit[s1][s2];[mus][s2]sidechaincompress=threshold=0.05:ratio=3:attack=5:release=250[md];[md][s1]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=11[a]" -map "[a]" -ar 48000 -t 28 _mix.wav
ffmpeg -nostdin -v error -y -i _video.mp4 -i _mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -t 28 -movflags +faststart "$OUT"
echo "done -> $OUT"
