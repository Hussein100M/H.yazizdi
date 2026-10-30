#!/usr/bin/env bash
# DaVinci Resolve hand-off (run after ./build.sh): clean ungraded master, graded master, LUT and audio stems -> davinci/
set -euo pipefail
cd "$(dirname "$0")"
[ -d _frames ] || { echo "run ./build.sh first"; exit 1; }
mkdir -p davinci
python3 make_lut.py
# motion-blurred frames before the finishing grade/bloom, cut per scene (the LUT is applied in Resolve)
CUTS=(0 114 258 396 528 645 840)
NAMES=(00_Hook 01_Promo_Film 02_Masterplan 03_Infographics 04_Construction 05_Closing)
for i in "${!NAMES[@]}"; do
  S=${CUTS[$i]}; E=${CUTS[$((i+1))]}
  ffmpeg -nostdin -v error -y -framerate 30 -start_number "$S" -i _frames/%05d.jpg -frames:v $((E-S)) -c:v libx264 -crf 16 -g 15 -bf 0 \
    -preset slow -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 "davinci/${NAMES[$i]}.mp4"
done
cp Showreel_Motion_9x16.mp4 davinci/Showreel_Graded_9x16.mp4
cp _bed.wav davinci/Audio_1_Music_Bed.wav
cp _sfx.wav davinci/Audio_2_SFX.wav
cp _mix.wav davinci/Audio_3_Final_Mix.wav
rm -f davinci/H_yazidi_DaVinci_Package.zip
(cd davinci && zip -q -9 H_yazidi_DaVinci_Package.zip *.mp4 *.wav *.cube *.py README.md)
echo "DaVinci package -> davinci/H_yazidi_DaVinci_Package.zip"
