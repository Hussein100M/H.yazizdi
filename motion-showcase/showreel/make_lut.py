#!/usr/bin/env python3
"""Export the showreel's finishing grade (the colour part of GRADE in build.sh, without the bloom)
as a 64-point .cube LUT for DaVinci Resolve. Usage: python3 make_lut.py [out.cube]"""
import os, re, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'davinci', 'H_yazidi_Showreel_Look.cube')
src = open(os.path.join(HERE, 'build.sh'), encoding='utf-8').read()
m = re.search(r"(curves=all='0/0 0\.06[^']*'),(colorbalance=[^,]*),(eq=saturation=[0-9.]+)", src)
if not m: sys.exit('colour chain not found in build.sh')
chain = f"format=gbrp,{m.group(1)},{m.group(2)},format=yuv444p,{m.group(3)},format=rgb48le"
N = 64  # haldclutsrc level 8 -> 64^3 entries, red fastest (same order as .cube)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'haldclutsrc=level=8', '-frames:v', '1', '-vf', chain,
                      '-f', 'rawvideo', '-pix_fmt', 'rgb48le', '-'], capture_output=True, check=True).stdout
px = np.frombuffer(raw, dtype='<u2').reshape(-1, 3).astype(np.float64) / 65535
assert len(px) == N ** 3, len(px)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w') as f:
    f.write(f'TITLE "H.yazidi Showreel Look"\n# {chain}\nLUT_3D_SIZE {N}\nDOMAIN_MIN 0 0 0\nDOMAIN_MAX 1 1 1\n')
    f.writelines(f'{r:.6f} {g:.6f} {b:.6f}\n' for r, g, b in px)
print('LUT ->', OUT)
