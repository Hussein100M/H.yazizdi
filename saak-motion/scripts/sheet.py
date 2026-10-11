# Usage: python3 scripts/sheet.py out.png cols width img1 img2 ...  (labels with filename)
import sys
from PIL import Image, ImageDraw
out, cols, w = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
files = sys.argv[4:]
h = int(w * 16 / 9)
rows = (len(files) + cols - 1) // cols
S = Image.new("RGB", (cols * w + (cols + 1) * 8, rows * (h + 30) + 8), (24, 24, 28))
d = ImageDraw.Draw(S)
for k, f in enumerate(files):
    im = Image.open(f).convert("RGB").resize((w, h), Image.LANCZOS)
    x = 8 + (k % cols) * (w + 8); y = 8 + (k // cols) * (h + 30)
    S.paste(im, (x, y)); d.text((x + 4, y + h + 6), f.split("/")[-1], fill=(220, 220, 220))
S.save(out)
