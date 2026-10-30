#!/usr/bin/env bash
# DaVinci Resolve hand-off (run after ./build.sh): clean ungraded master, graded master, LUT and audio stems -> davinci/
set -euo pipefail
cd "$(dirname "$0")"
[ -d _frames ] || { echo "run ./build.sh first"; exit 1; }
mkdir -p davinci
python3 make_lut.py
# motion-blurred frames before the finishing grade/bloom: grade this one in Resolve with the LUT
ffmpeg -nostdin -v error -y -framerate 30 -i _frames/%05d.jpg -c:v libx264 -crf 15 -preset slow -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -t 28 davinci/Showreel_Clean_NoGrade_9x16.mp4
cp Showreel_Motion_9x16.mp4 davinci/Showreel_Graded_9x16.mp4
cp _bed.wav davinci/Audio_1_Music_Bed.wav
cp _sfx.wav davinci/Audio_2_SFX.wav
cp _mix.wav davinci/Audio_3_Final_Mix.wav
echo "DaVinci package -> davinci/"
