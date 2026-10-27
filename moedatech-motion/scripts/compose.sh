#!/bin/bash
# compose.sh <sub_dir> <audio.wav> <out.mp4>
# 3 sub-frames per output frame (180° shutter) -> averaged motion blur, light film grain, x264.
set -e
SUB="$1"; AUD="$2"; OUT="$3"
ffmpeg -v error -y -framerate 90 -i "$SUB/%06d.jpg" -i "$AUD" \
  -filter_complex "[0:v]tmix=frames=3:weights='1 1 1',select='eq(mod(n\,3)\,2)',setpts=N/30/TB,noise=alls=2:allf=t,format=yuv420p[v]" \
  -map "[v]" -map 1:a -r 30 -c:v libx264 -preset slow -crf 19 -maxrate 12M -bufsize 24M -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a 256k -ar 48000 -t 41.5 -movflags +faststart "$OUT"
