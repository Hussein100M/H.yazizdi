#!/usr/bin/env python3
"""Procedural placeholder material textures (concrete, marble, wood, steel, block) -> JPG."""
import sys, os
import numpy as np
from scipy.ndimage import gaussian_filter
from PIL import Image

OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
S = 720
rng = np.random.default_rng(11)
yy, xx = np.mgrid[0:S, 0:S].astype(float)

def fbm(sig, w):
    out = np.zeros((S, S))
    for s, k in zip(sig, w):
        n = gaussian_filter(rng.standard_normal((S, S)), s, mode='wrap')
        out += n / (n.std() + 1e-9) * k
    return out / sum(w)

def save(name, img):
    Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).save(os.path.join(OUT, name + '.jpg'), quality=92)

def vignette(img, k=.18):
    d = np.hypot(xx / S - .5, yy / S - .5) / .7071
    return img * (1 - k * d ** 2)[..., None]

# concrete: fbm + pores + soft light gradient
v = .57 + .085 * fbm([1, 3, 10, 40], [.25, .35, .3, .45])
pores = np.zeros((S, S))
idx = rng.integers(0, S, (900, 2)); pores[idx[:, 0], idx[:, 1]] = rng.uniform(.5, 3, 900)
v -= np.clip(gaussian_filter(pores, 1.1) * 2.4, 0, .35)
v += .07 * (1 - yy / S) - .03 * xx / S
save('concrete', vignette(v[..., None] * np.array([1.0, .985, .95])))

# marble: mostly parallel diagonal veins with gentle meander
u = xx * .55 + yy * .85
t = fbm([60, 140], [.5, 1.0]) * .65 + fbm([5, 12], [.5, 1]) * .1
f1 = np.sin(u / 48 + t)
f2 = np.sin((xx * .8 + yy * .6) / 23 + 1.4 * fbm([40, 90], [.5, 1]))
vein = np.exp(-np.abs(f1) * 18) * (.55 + .45 * np.clip(fbm([50], [1]), -1, 1)) + .08 * np.exp(-np.abs(f1) * 2.5)
fine = np.exp(-np.abs(f2) * 30) * .35 * np.clip(fbm([30], [1]) + .3, 0, 1)
v = .945 + .018 * fbm([2, 40], [.3, 1]) - .36 * vein - .14 * fine
save('marble', vignette(v[..., None] * np.array([1.0, .99, .975]), .1))

# wood: stretched grain rings
def fbm_a(sig, w, a):
    out = np.zeros((S, S))
    for s, k in zip(sig, w):
        n = gaussian_filter(rng.standard_normal((S, S)), (s * a[0], s * a[1]), mode='wrap')
        out += n / (n.std() + 1e-9) * k
    return out / sum(w)
t = fbm_a([3, 10, 30], [.3, .6, 1], (7, 1))
rings = (.5 + .5 * np.sin((xx + 32 * t) / 6.5)) ** 2.5
streak = fbm_a([1, 2], [1, .5], (30, 1))
k = np.clip(.32 + .45 * rings + .1 * streak, 0, 1)[..., None]
c0, c1 = np.array([202, 152, 104]) / 255, np.array([118, 74, 42]) / 255
save('wood', vignette(c0 + (c1 - c0) * k))

# brushed steel: horizontal streaks + diagonal sheen
br = fbm_a([1, 2, 4], [1, .6, .3], (.3, 45))
sheen = np.exp(-((xx - yy * .6 - 220) / 230) ** 2) * .26 + np.exp(-((xx - yy * .6 - 560) / 110) ** 2) * .12
v = .44 + .05 * br + sheen
save('steel', vignette(v[..., None] * np.array([.94, .98, 1.04])))

# cement block wall
bw, bh, m = 240, 120, 12
row = yy // bh; xo = xx + (row % 2) * bw / 2; col = xo // bw
shade = np.sin(row * 12.9898 + col * 78.233) * 43758.5453; shade = shade - np.floor(shade)
dy, dx = yy % bh, xo % bw
inside = (dy > m) & (dx > m)
d = np.minimum.reduce([dy - m, bh - dy, dx - m, bw - dx])
n = fbm([1, 3, 12], [.4, .4, .3])
v = np.where(inside, .66 + shade * .07 + .05 * n - .08 * np.exp(-np.clip(d, 0, None) / 4), .48 + .03 * n)
save('block', vignette(v[..., None] * np.array([1.0, .98, .94])))
print('textures ->', OUT)
