#!/usr/bin/env python3
"""Average each frame's shutter samples in linear light -> one motion-blurred frame. avg.py <sub_dir> <out_dir>"""
import sys, os, glob
from multiprocessing import Pool
import numpy as np
from PIL import Image
SUB, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
LUT = (np.arange(256) / 255.0) ** 2.2
def one(f):
    fs = sorted(glob.glob(os.path.join(SUB, f'{f:05d}_*.jpg')))
    acc = sum(LUT[np.asarray(Image.open(p).convert('RGB'))] for p in fs) / len(fs)
    Image.fromarray((np.clip(acc, 0, 1) ** (1 / 2.2) * 255 + .5).astype(np.uint8)).save(os.path.join(OUT, f'{f:05d}.jpg'), quality=95)
    return len(fs)
if __name__ == '__main__':
    n = len({os.path.basename(p)[:5] for p in glob.glob(os.path.join(SUB, '*_*.jpg'))})
    with Pool(4) as pool: c = pool.map(one, range(n), chunksize=8)
    print('averaged', n, 'frames,', sum(c), 'samples')
