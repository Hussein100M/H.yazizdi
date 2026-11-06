import sys, math, random
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
sys.path.insert(0, sys.argv[3])
from masks import compute, k

SRC, OUT = sys.argv[1], sys.argv[2]
LABELS = not (len(sys.argv) > 4 and sys.argv[4] == 'clean')
SC = 3                                   # upscale factor
ML, MR, MT, MB = 190, 190, 330, (700 if LABELS else 260)      # canvas margins (output px)
rng = np.random.default_rng(7); random.seed(7)

w, gray, sat, wall, green, canopy, veg = compute(SRC)
H0, W0 = gray.shape
PH, PW = H0*SC, W0*SC
CH, CW = PH+MT+MB, PW+ML+MR

# ---------- helpers ----------
def up(m, interp=cv2.INTER_LINEAR):
    return cv2.resize(m.astype(np.float32), (PW, PH), interpolation=interp)
def place(a, fill=0.0):
    """put plan-sized array into canvas-sized array"""
    out = np.full((CH, CW) + a.shape[2:], fill, np.float32)
    out[MT:MT+PH, ML:ML+PW] = a
    return out
def blur(a, s): return cv2.GaussianBlur(a, (0, 0), s)
def shift(a, dx, dy):
    M = np.float32([[1, 0, dx], [0, 1, dy]])
    return cv2.warpAffine(a, M, (a.shape[1], a.shape[0]))
def comp(base, color, alpha):
    a = np.clip(alpha, 0, 1)[..., None]
    return base*(1-a) + np.array(color, np.float32)*a
def poly_mask(pts):
    m = np.zeros((H0, W0), np.uint8)
    cv2.fillPoly(m, [np.array(pts, np.int32)], 1)
    return m
def noise_field(h, w, cells, amp):
    g = rng.standard_normal((cells[0], cells[1])).astype(np.float32)
    return cv2.resize(g, (w, h), interpolation=cv2.INTER_CUBIC)*amp

# ---------- palette (sampled from the brown reference) ----------
PAPER  = (171, 154, 136)
FLOOR  = (142, 123, 109)
PLANT  = (156, 139, 123)
POOL   = (184, 171, 157)
WHITE  = (245, 241, 235)
WALL   = (240, 236, 230)
SHADOW = (48, 36, 29)

# ---------- paper ----------
img = np.zeros((CH, CW, 3), np.float32) + np.array(PAPER, np.float32)
tex = (noise_field(CH, CW, (7, 5), 2.2) + noise_field(CH, CW, (90, 70), 1.6)
       + blur(rng.standard_normal((CH, CW)).astype(np.float32), 0.8)*3.0)
yy, xx = np.mgrid[0:CH, 0:CW].astype(np.float32)
vig = ((xx/CW-0.5)**2 + (yy/CH-0.5)**2)
img = img + tex[..., None] - (vig*26)[..., None]
# paper fibre specks
spk = (rng.random((CH, CW)) > 0.9985).astype(np.float32)
spk = blur(spk, 1.1)*9
img = comp(img, (205, 192, 178), np.clip(spk, 0, 0.45))

# ---------- regions (original-pixel coordinates) ----------
FOOT = poly_mask([(150, 147), (461, 147), (461, 609), (150, 609)])
COURT = poly_mask([(150, 325), (312, 325), (312, 368), (240, 368), (240, 410), (150, 410)]) \
      | poly_mask([(150, 527), (262, 527), (262, 609), (150, 609)])
INTERIOR = FOOT & (1-COURT)
POOLM = poly_mask([(478, 146), (542, 146), (542, 394), (478, 394)])

def region_alpha(m, s=1.2):
    return place(blur(up(m), s))

# interior floor with its own subtle mottling
ia = region_alpha(INTERIOR)
floor_col = np.array(FLOOR, np.float32) + (tex*0.8)[..., None] - (vig*30)[..., None]
img = img*(1-ia[..., None]) + floor_col*ia[..., None]
# soft inner darkening along the footprint edge (depth)
inner = np.clip(ia - region_alpha(cv2.erode(INTERIOR, k(9)), 14), 0, 1)
img = comp(img, (110, 94, 82), inner*0.25)

# pool
pa = region_alpha(POOLM)
grad = np.clip((yy - (MT+146*SC)) / (248*SC), 0, 1)
pool_col = np.array(POOL, np.float32) + (tex*0.6)[..., None] - (grad*10)[..., None]
img = img*(1-pa[..., None]) + pool_col*pa[..., None]
img = comp(img, (120, 104, 92), np.clip(pa - region_alpha(cv2.erode(POOLM, k(5)), 10), 0, 1)*0.35)

# ---------- planting beds (non-tree greenery) ----------
plant = green.copy()
pl = region_alpha(plant, 1.5)
img = comp(img, PLANT, pl*0.95)
# stipple texture inside planting, like the gravel bed in the reference
dots = (rng.random((CH, CW)) > 0.955).astype(np.float32)
dots = np.clip(blur(dots, 0.9)*3.2, 0, 1)
img = comp(img, (226, 216, 204), dots*pl*0.75)
# white bed outline
pe = place(up(plant))
edge = np.clip(cv2.dilate(pe, k(5)) - cv2.erode(pe, k(3)), 0, 1)
edge = cv2.GaussianBlur(edge, (0, 0), 0.8)
img = comp(img, WHITE, edge*0.55)

# ---------- line work (furniture, paving, cars, windows...) ----------
w_up = cv2.resize(w, (PW, PH), interpolation=cv2.INTER_CUBIC)
g_up = w_up.mean(-1)
la = np.clip((246 - g_up)/112, 0, 1)
la = np.clip((la - 0.08)/0.92, 0, 1)**0.78
excl = cv2.dilate(green, k(3)) | cv2.dilate(veg, k(3)) | cv2.dilate(canopy, k(5)) | cv2.dilate(wall, k(3))
la = la*(1 - blur(up(excl), 1.0))
la = place(la)
# slight emboss: a faint dark offset under every line
img = comp(img, SHADOW, shift(blur(la, 1.6), 2, 3)*0.22)
img = comp(img, WHITE, la*0.92)

# ---------- trees: greedy circle packing on canopy -> white symbols ----------
circles = []
rem = canopy.copy()
while True:
    dt = cv2.distanceTransform(rem, cv2.DIST_L2, 5)
    _, mx, _, (x, y) = cv2.minMaxLoc(dt)
    if mx < 8: break
    r = mx*1.18
    circles.append((x, y, r))
    cv2.circle(rem, (x, y), int(r*0.92), 0, -1)

tree_layer = Image.new('RGBA', (CW*2, CH*2), (0, 0, 0, 0))   # 2x supersample
td = ImageDraw.Draw(tree_layer)
shadow_m = np.zeros((CH, CW), np.float32)
def tree_symbol(d, cx, cy, R, col=(247, 243, 238, 205), lw=4, seed=0):
    rr = random.Random(seed)
    n = int(min(17, max(11, 9 + R/28)))
    rot = rr.random()*math.tau
    ox, oy = cx + rr.uniform(-.06, .06)*R, cy + rr.uniform(-.06, .06)*R
    pts = []
    for i in range(n):
        a = rot + i*math.tau/n
        rad = R*rr.uniform(0.93, 1.0)
        pts.append((a, rad))
    # scalloped rim: one bulging arc per spoke interval
    for i in range(n):
        a0, r0 = pts[i]; a1, r1 = pts[(i+1) % n]
        if a1 < a0: a1 += math.tau
        seg = []
        for t in np.linspace(0, 1, 9):
            a = a0 + (a1-a0)*t
            rad = (r0 + (r1-r0)*t) + R*0.085*math.sin(math.pi*t)
            seg.append((cx + rad*math.cos(a), cy + rad*math.sin(a)))
        d.line(seg, fill=col, width=lw, joint='curve')
    # spokes with a small fork at the tip
    for a, rad in pts:
        tip = (ox + rad*0.88*math.cos(a), oy + rad*0.88*math.sin(a))
        d.line([(ox, oy), tip], fill=col, width=lw)
        for s in (-1, 1):
            b = a + s*0.32
            d.line([(ox + rad*0.62*math.cos(a), oy + rad*0.62*math.sin(a)),
                    (ox + rad*0.80*math.cos(b), oy + rad*0.80*math.sin(b))], fill=col, width=max(2, lw-1))
    d.ellipse([ox-R*.07, oy-R*.07, ox+R*.07, oy+R*.07], outline=col, width=lw)

for i, (x, y, r) in enumerate(circles):
    cx, cy, R = ML + x*SC, MT + y*SC, r*SC
    cv2.circle(shadow_m, (int(cx), int(cy)), int(R), 1.0, -1)
    tree_symbol(td, cx*2, cy*2, R*2, seed=i)

def margin_tree(x, y, R, seed, alpha=150):
    tree_symbol(td, x*2, y*2, R*2, col=(240, 234, 226, alpha), lw=3, seed=seed)

# canopy fill + cast shadow
img = comp(img, SHADOW, shift(blur(shadow_m, 10), 12, 16)*0.30)
img = comp(img, (196, 182, 166), blur(shadow_m, 1.2)*0.22)

# ---------- walls ----------
wm = up(wall); wm = (blur(wm, 1.3) > 0.5).astype(np.float32)
wm = place(wm)
img = comp(img, SHADOW, blur(wm, 22)*0.30)                      # ambient
img = comp(img, SHADOW, shift(blur(wm, 6), 8, 11)*0.62)          # cast shadow
wb = (wm > 0.5).astype(np.uint8)
er1 = cv2.erode(wb, k(5, cv2.MORPH_RECT)); er2 = cv2.erode(er1, k(3, cv2.MORPH_RECT))
img = comp(img, WALL, blur(wm, 0.7))
img = comp(img, (150, 138, 128), blur((er1-er2).astype(np.float32), 0.6)*0.55)  # inner line
img = comp(img, (120, 108, 98), blur((wb - cv2.erode(wb, k(3, cv2.MORPH_RECT))).astype(np.float32), 0.6)*0.35)

out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert('RGBA')

# ---------- margin decoration: site frame + light trees ----------
deco = Image.new('RGBA', (CW, CH), (0, 0, 0, 0)); dd = ImageDraw.Draw(deco)
fr = (240, 234, 226, 130)
px0, py0, px1, py1 = ML-70, MT-110, ML+PW+70, MT+PH+80
dd.line([(px0, CH-40), (px0, py0+160), (CW//2-260, py0)], fill=fr, width=3)
dd.line([(px1, CH-40), (px1, py0+160), (CW//2+260, py0)], fill=fr, width=3)
for (x, y, R, s) in [(95, 1120, 70, 1), (88, 1290, 58, 2), (100, 1470, 66, 3), (CW-95, 1650, 66, 4),
                     (CW-90, 1830, 56, 5), (CW-100, 2050, 64, 6), (95, 2900, 72, 7), (CW-96, 2980, 70, 8),
                     (CW-120, 260, 80, 9), (CW-230, 140, 58, 10), (120, 3260, 62, 11)]:
    if y + R < CH - 30: margin_tree(x, y, R, 100+s)
out = Image.alpha_composite(out, deco)
tree_small = tree_layer.resize((CW, CH), Image.LANCZOS)
# tree line shadow for a touch of depth
tsh = tree_small.split()[3].filter(ImageFilter.GaussianBlur(2))
shadow_rgba = Image.new('RGBA', (CW, CH), SHADOW + (0,)); shadow_rgba.putalpha(tsh.point(lambda v: int(v*0.35)))
out = Image.alpha_composite(out, shadow_rgba.transform((CW, CH), Image.AFFINE, (1, 0, -3, 0, 1, -4)))
out = Image.alpha_composite(out, tree_small)

# ---------- typography ----------
FB = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
FM = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'
def wide_text(text, size, font=FB, spacing=0.32, stretch=1.28, fill=(250, 247, 242, 255)):
    f = ImageFont.truetype(font, size)
    widths = [f.getbbox(c)[2] - f.getbbox(c)[0] if c != ' ' else size*0.35 for c in text]
    adv = [f.getlength(c) for c in text]
    total = int(sum(adv) + spacing*size*(len(text)-1)) + 10
    lay = Image.new('RGBA', (total, int(size*1.4)), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    x = 4
    for c, a in zip(text, adv):
        d.text((x, 0), c, font=f, fill=fill); x += a + spacing*size
    lay = lay.crop(lay.getbbox())
    return lay.resize((int(lay.width*stretch), lay.height), Image.LANCZOS)
def paste_shadowed(base, lay, x, y, sh=(40, 30, 24), off=(3, 4), blur_r=3, op=0.55):
    s = Image.new('RGBA', lay.size, sh + (0,)); s.putalpha(lay.split()[3].point(lambda v: int(v*op)))
    s = s.filter(ImageFilter.GaussianBlur(blur_r))
    base.alpha_composite(s, (x+off[0], y+off[1])); base.alpha_composite(lay, (x, y))

# title plaque
title = wide_text('GROUND FLOOR PLAN', 46)
bw, bh = title.width + 120, title.height + 64
bx, by = (CW - bw)//2, 95
plaque = Image.new('RGBA', (CW, CH), (0, 0, 0, 0)); pd = ImageDraw.Draw(plaque)
pd.rectangle([bx+8, by+10, bx+bw+8, by+bh+10], fill=(40, 30, 24, 90))
plaque = plaque.filter(ImageFilter.GaussianBlur(8)); pd = ImageDraw.Draw(plaque)
pd.rectangle([bx, by, bx+bw, by+bh], fill=(196, 183, 168, 235))
pd.rectangle([bx+6, by+6, bx+bw-6, by+bh-6], outline=(236, 228, 218, 140), width=2)
out = Image.alpha_composite(out, plaque)
paste_shadowed(out, title, bx + (bw-title.width)//2, by + (bh-title.height)//2, op=0.35, blur_r=2, off=(2, 3))

# north arrow (top-left), drawn like the reference
na = Image.new('RGBA', (440, 440), (0, 0, 0, 0)); nd = ImageDraw.Draw(na)
c = (236, 230, 222, 235); cx = cy = 220
nd.ellipse([80, 80, 360, 360], outline=c, width=10)
for a in (45, 135, 225, 315):
    r = math.radians(a)
    nd.rectangle([cx+140*math.cos(r)-18, cy+140*math.sin(r)-18, cx+140*math.cos(r)+18, cy+140*math.sin(r)+18], fill=(171, 154, 136, 255))
nd.polygon([(cx, 40), (cx+70, 300), (cx, 250), (cx-70, 300)], fill=c)
nd.polygon([(cx, 40), (cx, 250), (cx-70, 300)], fill=(205, 196, 186, 255))
fN = ImageFont.truetype(FB, 64); nd.text((cx+60, 18), 'N', font=fN, fill=c)
na = na.rotate(-28, resample=Image.BICUBIC).resize((215, 215), Image.LANCZOS)
paste_shadowed(out, na, 55, 55, op=0.4, blur_r=4)

# room numbers (original-pixel positions) + legend
ROOMS = [
    ('ENTRANCE',          (306, 588)),
    ('MAJLIS',            (407, 476)),
    ('GUEST LOUNGE',      (197, 482)),
    ('FAMILY LIVING',     (404, 277)),
    ('KITCHEN',           (318, 168)),
    ('DINING',            (418, 188)),
    ('DINING TERRACE',    (405, 379)),
    ('SERVICE AREA',      (185, 268)),
    ('STAIR + LIFT',      (300, 383)),
    ('COURTYARD',         (276, 347)),
    ('SWIMMING POOL',     (510, 268)),
    ('POOL DECK',         (503, 127)),
    ('CAR PARKING',       (305, 700)),
    ('GARDEN',            (330, 118)),
]
fnum = ImageFont.truetype(FB, 30)
for i, (name, (x, y)) in enumerate(ROOMS if LABELS else [], 1):
    X, Y = ML + x*SC, MT + y*SC
    badge = Image.new('RGBA', (90, 90), (0, 0, 0, 0)); bd = ImageDraw.Draw(badge)
    bd.ellipse([8, 8, 82, 82], fill=(122, 105, 92, 215), outline=(246, 242, 236, 235), width=3)
    t = str(i); tb = bd.textbbox((0, 0), t, font=fnum)
    bd.text((45-(tb[0]+tb[2])/2, 45-(tb[1]+tb[3])/2), t, font=fnum, fill=(248, 245, 240, 255))
    paste_shadowed(out, badge, int(X-45), int(Y-45), op=0.45, blur_r=3)

# legend block
if not LABELS: ROOMS = []
leg_x, leg_y = ML + 40, MT + PH + 120
if LABELS:
    head = wide_text('LEGEND.', 40)
    paste_shadowed(out, head, leg_x, leg_y, op=0.35, blur_r=2, off=(2, 3))
col_w = 760
for i, (name, _) in enumerate(ROOMS, 1):
    col, row = divmod(i-1, 7)
    t = wide_text(f'{i}.{name}', 27, font=FM, spacing=0.28, stretch=1.22, fill=(246, 242, 236, 255))
    paste_shadowed(out, t, leg_x + col*col_w, leg_y + 95 + row*62, op=0.3, blur_r=2, off=(2, 2))

out.convert('RGB').save(OUT, quality=95)
print('trees', len(circles), 'size', out.size)
