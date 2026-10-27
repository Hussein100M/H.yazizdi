import torch, torch.nn as nn, torch.nn.functional as F
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

def load_sr(path):
    net = RRDBNet(); sd = torch.load(path, map_location='cpu'); net.load_state_dict(sd.get('params_ema', sd), strict=True); net.eval(); return net
def sr(net, bgr):
    import numpy as np, cv2
    x = torch.from_numpy(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255).permute(2, 0, 1)[None]
    x = F.pad(x, (8, 8, 8, 8), mode='reflect')
    with torch.no_grad(): y = net(x)[0, :, 32:-32, 32:-32].clamp(0, 1)
    return cv2.cvtColor((y.permute(1, 2, 0).numpy() * 255).round().astype(np.uint8), cv2.COLOR_RGB2BGR)
def lama(model, bgr, mask):
    import numpy as np, cv2
    H, W = mask.shape; ph, pw = (8 - H % 8) % 8, (8 - W % 8) % 8
    img = torch.from_numpy(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255).permute(2, 0, 1)[None]
    m = torch.from_numpy((mask > 0).astype(np.float32))[None, None]
    img = F.pad(img, (0, pw, 0, ph), mode='reflect'); m = F.pad(m, (0, pw, 0, ph))
    with torch.no_grad(): out = model(img, m)[0, :, :H, :W].clamp(0, 1)
    return cv2.cvtColor((out.permute(1, 2, 0).numpy() * 255).round().astype(np.uint8), cv2.COLOR_RGB2BGR)
