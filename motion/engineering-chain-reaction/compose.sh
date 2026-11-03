#!/bin/bash
# compose.sh <T_END> <DUR> <out.mp4> [frames_dir]
cd "$(dirname "$0")"; TE=$1; D=$2; OUT=$3; FR=${4:-frames}
ffmpeg -v error -y -framerate 30 -i $FR/%05d.jpg -framerate 30 -i endframes/%04d.png -i final_mix.wav -filter_complex \
"[0:v]split[a][b];[b]gblur=sigma=18,format=rgba,fade=t=in:st=$TE:d=1.0:alpha=1[bl];[a][bl]overlay=format=auto[bg];\
[1:v]format=rgba,tpad=start_duration=$TE:color=0x00000000[ec];[bg][ec]overlay=format=auto:eof_action=pass,\
noise=alls=4:allf=t,vignette=PI/6,fade=t=out:st=$(echo "$D-0.6"|bc):d=0.6,format=yuv420p[v]" \
-map "[v]" -map 2:a -c:v libx264 -crf 17 -preset slow -c:a aac -b:a 256k -t $D -movflags +faststart $OUT
