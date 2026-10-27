#!/usr/bin/env python3
"""Recover the real equipment photos from the original video and upscale them.
1) CAT excavator: fuse frames 31.3–32.7 s (the photo pans under fixed phone overlays) -> overlay-free plate, inpaint leftovers.
2) Category tiles (loader / excavator / crane / dump truck) from frame 14.4 s.
3) Real-ESRGAN x4plus (RRDBNet) super-resolution on CPU.
Usage: photos.py <app.mp4> <RealESRGAN_x4plus.pth> <out_dir>"""
import sys, os, subprocess, numpy as np, cv2, torch, torch.nn as nn, torch.nn.functional as F

VID, W8, OUT = sys.argv[1:4]
os.makedirs(OUT, exist_ok=True)

def frames(t0, t1):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t0), '-t', str(t1 - t0), '-i', VID, '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.uint8).reshape(-1, 1024, 576, 3)
    return [f.copy() for f in a]

# ---------- 1) CAT plate by multi-frame fusion ----------
X0, X1, Y0, Y1 = 150, 422, 286, 484
fr = [f[Y0:Y1, X0:X1] for f in frames(31.30, 32.75)]
H, W = fr[0].shape[:2]
ov = np.zeros((H, W), np.uint8)                      # fixed phone overlays (frame coords)
ov[0:52, :] = 1                                       # status bar + dynamic island
ov[158:190, 8:98] = 1                                 # "صورة المعدة" label
ov[166:186, 222:268] = 1                              # carousel dots
ov[:, :9] = 1; ov[:, W - 7:] = 1; ov[190:, :] = 1     # bezel / card edge
ref_i = int(len(fr) * .62); ref = fr[ref_i]
rg = cv2.cvtColor(ref, cv2.COLOR_BGR2GRAY).astype(np.float32)
emask = ((1 - ov) * 255).astype(np.uint8)
acc, cnt = [], []
for i, f in enumerate(fr):
    g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY).astype(np.float32)
    M = np.eye(2, 3, dtype=np.float32)
    try:
        _, M = cv2.findTransformECC(rg, g, M, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6), emask, 5)
    except cv2.error:
        continue
    wf = cv2.warpAffine(f, M, (W, H), flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_CONSTANT)
    valid = cv2.warpAffine((1 - ov).astype(np.float32), M, (W, H), flags=cv2.INTER_NEAREST + cv2.WARP_INVERSE_MAP, borderValue=0)
    valid = cv2.erode(valid, np.ones((3, 3), np.uint8))
    # reject frames that disagree a lot with the reference (transition frames)
    d = np.abs(wf.astype(np.float32) - ref.astype(np.float32)).mean(2)
    ok = (valid > .5) & ((d < 28) | (ov == 1))
    acc.append(np.where(ok[..., None], wf, 0).astype(np.float32)); cnt.append(ok)
acc = np.array(acc); cnt = np.array(cnt)
med = np.zeros((H, W, 3), np.float32)
for c in range(3):
    v = np.where(cnt, acc[..., c], np.nan)
    med[..., c] = np.nanmedian(v, axis=0)
hole = np.isnan(med).any(2) | (cnt.sum(0) < 2)
med = np.nan_to_num(med).clip(0, 255).astype(np.uint8)
plate = cv2.inpaint(med, (hole * 255).astype(np.uint8), 5, cv2.INPAINT_TELEA)
print('cat plate', plate.shape, 'frames used', len(acc), 'holes', int(hole.sum()))
cv2.imwrite(os.path.join(OUT, 'cat_plate_lr.png'), plate)
cv2.imwrite(os.path.join(OUT, 'cat_holes.png'), (hole * 255).astype(np.uint8))

# ---------- 2) category tiles ----------
f14 = frames(14.40, 14.44)[0]
tiles = {'loader': (170, 455, 113, 43), 'excavator2': (293, 454, 113, 44), 'crane': (171, 534, 112, 46), 'dump': (292, 535, 114, 44)}
lr = {'cat': plate}
for k, (x, y, w, h) in tiles.items():
    lr[k] = f14[y + 3:y + h - 1, x + 3:x + w - 3]

# ---------- 3) Real-ESRGAN x4plus ----------
class RDB(nn.Module):
    def __init__(s, nf=64, gc=32):
        super().__init__()
        s.conv1 = nn.Conv2d(nf, gc, 3, 1, 1); s.conv2 = nn.Conv2d(nf + gc, gc, 3, 1, 1); s.conv3 = nn.Conv2d(nf + 2 * gc, gc, 3, 1, 1)
        s.conv4 = nn.Conv2d(nf + 3 * gc, gc, 3, 1, 1); s.conv5 = nn.Conv2d(nf + 4 * gc, nf, 3, 1, 1); s.l = nn.LeakyReLU(.2, True)
    def forward(s, x):
        x1 = s.l(s.conv1(x)); x2 = s.l(s.conv2(torch.cat((x, x1), 1))); x3 = s.l(s.conv3(torch.cat((x, x1, x2), 1)))
        x4 = s.l(s.conv4(torch.cat((x, x1, x2, x3), 1))); x5 = s.conv5(torch.cat((x, x1, x2, x3, x4), 1)); return x5 * .2 + x
class RRDB(nn.Module):
    def __init__(s): super().__init__(); s.rdb1, s.rdb2, s.rdb3 = RDB(), RDB(), RDB()
    def forward(s, x): return s.rdb3(s.rdb2(s.rdb1(x))) * .2 + x
class RRDBNet(nn.Module):
    def __init__(s, nb=23):
        super().__init__()
        s.conv_first = nn.Conv2d(3, 64, 3, 1, 1); s.body = nn.Sequential(*[RRDB() for _ in range(nb)]); s.conv_body = nn.Conv2d(64, 64, 3, 1, 1)
        s.conv_up1 = nn.Conv2d(64, 64, 3, 1, 1); s.conv_up2 = nn.Conv2d(64, 64, 3, 1, 1); s.conv_hr = nn.Conv2d(64, 64, 3, 1, 1); s.conv_last = nn.Conv2d(64, 3, 3, 1, 1)
        s.l = nn.LeakyReLU(.2, True)
    def forward(s, x):
        f = s.conv_first(x); f = f + s.conv_body(s.body(f))
        f = s.l(s.conv_up1(F.interpolate(f, scale_factor=2, mode='nearest'))); f = s.l(s.conv_up2(F.interpolate(f, scale_factor=2, mode='nearest')))
        return s.conv_last(s.l(s.conv_hr(f)))
net = RRDBNet(); sd = torch.load(W8, map_location='cpu'); net.load_state_dict(sd.get('params_ema', sd), strict=True); net.eval()
torch.set_num_threads(4)
for k, im in lr.items():
    x = torch.from_numpy(cv2.cvtColor(im, cv2.COLOR_BGR2RGB).astype(np.float32) / 255).permute(2, 0, 1)[None]
    x = F.pad(x, (8, 8, 8, 8), mode='reflect')
    with torch.no_grad(): y = net(x)[0, :, 32:-32, 32:-32].clamp(0, 1)
    y = (y.permute(1, 2, 0).numpy() * 255).round().astype(np.uint8)
    cv2.imwrite(os.path.join(OUT, f'{k}.jpg'), cv2.cvtColor(y, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 94])
    cv2.imwrite(os.path.join(OUT, f'{k}_lr.png'), im)
    print(k, im.shape, '->', y.shape)
