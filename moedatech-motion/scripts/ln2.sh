#!/bin/bash
# two-pass loudnorm: ln2.sh in.wav out.wav I TP [pre-filter]
IN=$1; OUT=$2; I=$3; TP=$4; PRE=${5:-anull}
J=$(ffmpeg -hide_banner -i "$IN" -af "$PRE,loudnorm=I=$I:TP=$TP:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$IN" -af "$PRE,loudnorm=I=$I:TP=$TP:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -ar 48000 "$OUT"
