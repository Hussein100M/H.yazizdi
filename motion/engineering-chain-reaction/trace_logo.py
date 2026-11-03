import numpy as np, potrace
from PIL import Image, ImageFilter
SC = 8
im = Image.open('src.jpg').convert('RGB').crop((160, 60, 508, 164))
big = im.resize((im.width * SC, im.height * SC), Image.LANCZOS)
a = np.asarray(big).astype(float)
PAL = {'white': (255, 255, 255), 'light': (207, 226, 220), 'dark': (146, 177, 172), 'black': (16, 15, 15)}
names = list(PAL); P = np.array([PAL[n] for n in names], float)
lum = a @ np.array([.299, .587, .114]); chroma = a[:, :, 1] - a[:, :, 0]
colored = chroma > 14
colcount = colored.sum(0); ix = int(np.argmax(colcount > a.shape[0] * .15)) - SC * 2   # first column of the icon
cls = np.zeros(lum.shape, int)                     # 0 white
xx = np.arange(lum.shape[1])[None, :].repeat(lum.shape[0], 0)
cls[(xx < ix) & (lum < 128)] = 3                   # black wordmark
cls[(xx >= ix) & colored & (lum >= 196)] = 1       # light sage
cls[(xx >= ix) & colored & (lum < 196)] = 2        # dark sage
def mask(n):
    m = Image.fromarray(((cls == names.index(n)) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(SC * .9))
    return np.asarray(m) > 127
def path(bm, alphamax):
    out = []
    for c in potrace.Bitmap(~bm).trace(turdsize=SC * SC * 6, alphamax=alphamax, opticurve=True, opttolerance=.3):
        s = c.start_point; d = [f'M{s.x:.1f},{s.y:.1f}']
        for seg in c.segments:
            if seg.is_corner: d.append(f'L{seg.c.x:.1f},{seg.c.y:.1f}L{seg.end_point.x:.1f},{seg.end_point.y:.1f}')
            else: d.append(f'C{seg.c1.x:.1f},{seg.c1.y:.1f} {seg.c2.x:.1f},{seg.c2.y:.1f} {seg.end_point.x:.1f},{seg.end_point.y:.1f}')
        out.append(''.join(d) + 'Z')
    return ' '.join(out)
W, H = big.size
# split icon from wordmark: icon starts at x where light/dark pixels begin
bm_txt = mask('black'); bm_txt[:, ix:] = False
paths = {'word': path(bm_txt, .25), 'light': path(mask('light'), 0), 'dark': path(mask('dark'), 0)}
ys, xs = np.where(bm_txt | (cls == 1) | (cls == 2)); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
vb = f'{x0 - 4} {y0 - 4} {x1 - x0 + 8} {y1 - y0 + 8}'
import json; json.dump({'viewBox': vb, 'iconX': int(ix), **paths}, open('logo_paths.json', 'w'))
for name, word in [('logo_dark_bg.svg', '#f1f5f4'), ('logo_original.svg', '#100f0f')]:
    open(name, 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"><path fill="{word}" fill-rule="evenodd" d="{paths["word"]}"/><path fill="#cfe2dc" fill-rule="evenodd" d="{paths["light"]}"/><path fill="#92b1ac" fill-rule="evenodd" d="{paths["dark"]}"/></svg>')
print('viewBox', vb, 'iconX', ix, {k: len(v) for k, v in paths.items()})

# ---- icon rebuilt as exact polygons from measured edges ----
col = (cls == 1) | (cls == 2)
ys, xs = np.where(col); X0, X1, Y0, Y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
dk = cls == 2
dys, dxs = np.where(dk); DX0 = np.percentile(dxs, 1)            # left edge of the dark wall
# opening: white rows in the column just right of the outer left edge
probe = cls[:, X0 + (int(DX0) - X0) // 3]; wr = np.where((probe == 0) & (np.arange(len(probe)) > Y0) & (np.arange(len(probe)) < Y1))[0]
mid = (Y0 + Y1) // 2; isw = (probe == 0)
OY0 = mid; 
while OY0 > Y0 and isw[OY0 - 1]: OY0 -= 1
OY1 = mid
while OY1 < Y1 and isw[OY1]: OY1 += 1
# dark wall top/bottom at its right edge
rc = dk[:, X1 - SC * 3]; r = np.where(rc)[0]; RY0, RY1 = r.min(), r.max() + 1
print('icon', X0, X1, Y0, Y1, 'darkX', DX0, 'opening', OY0, OY1, 'darkRight', RY0, RY1)
light = f'M{X0},{Y0}L{X1},{Y0}L{X1},{RY0}L{DX0:.0f},{OY0}L{X0},{OY0}Z M{X0},{OY1}L{DX0:.0f},{OY1}L{X1},{RY1}L{X1},{Y1}L{X0},{Y1}Z'
dark = f'M{DX0:.0f},{OY0}L{X1},{RY0}L{X1},{RY1}L{DX0:.0f},{OY1}Z'
for name, word in [('logo_dark_bg.svg', '#f1f5f4'), ('logo_original.svg', '#100f0f')]:
    open(name, 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"><path id="word" fill="{word}" fill-rule="evenodd" d="{paths["word"]}"/><path id="light" fill="#cfe2dc" d="{light}"/><path id="dark" fill="#92b1ac" d="{dark}"/></svg>')
json.dump({'viewBox': vb, 'word': paths['word'], 'light': light, 'dark': dark}, open('logo_paths.json', 'w'))
