#!/usr/bin/env python3
"""CAT excavator photo: one clean source frame -> Real-ESRGAN x4 -> LaMa removes phone overlays (status text, island, icons, label, dots).
Usage: cat_photo.py <app.mp4> <models_dir> <out_dir>"""
import sys, os, subprocess, numpy as np, cv2, torch
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sr_lib import load_sr, sr, lama
VID, MD, OUT = sys.argv[1:4]; os.makedirs(OUT, exist_ok=True); torch.set_num_threads(4)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', '32.2', '-i', VID, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(1024, 576, 3)
X0, X1, Y0, Y1 = 150, 422, 286, 484
c = fr[Y0:Y1, X0:X1].copy(); H, W = c.shape[:2]
hsv = cv2.cvtColor(c, cv2.COLOR_BGR2HSV)
m = np.zeros((H, W), np.uint8)
top = slice(0, 50)
dark = (hsv[..., 2] < 95)                       # island, "9:41", signal/wifi/battery glyphs, bezel corners
m[top][dark[top]] = 255
m[0:8, :] = 255                                 # screen top edge
m[158:191, 6:100] = 255                         # "صورة المعدة" label
m[164:188, 220:270] = 255                       # carousel dots
m = cv2.dilate(m, np.ones((5, 5), np.uint8))
cv2.imwrite(os.path.join(OUT, 'cat_mask_lr.png'), m)
net = load_sr(os.path.join(MD, 'RealESRGAN_x4plus.pth'))
big = sr(net, c)
M = cv2.resize(m, (W * 4, H * 4), interpolation=cv2.INTER_NEAREST); M = cv2.dilate(M, np.ones((9, 9), np.uint8))
lm = torch.jit.load(os.path.join(MD, 'big-lama.pt'), map_location='cpu'); lm.eval()
fixed = lama(lm, big, M)
fixed = fixed[16:H * 4 - 32, 36:W * 4 - 36]     # trim bezel columns and the white card edge at the bottom
cv2.imwrite(os.path.join(OUT, 'cat.jpg'), fixed, [cv2.IMWRITE_JPEG_QUALITY, 95])
cv2.imwrite(os.path.join(OUT, 'cat_sr_raw.jpg'), big, [cv2.IMWRITE_JPEG_QUALITY, 90])
print('cat ->', fixed.shape)
