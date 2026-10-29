#!/usr/bin/env python3
"""SFX + music bed for the H.yazidi showcase, synced to engine.html timings. Usage: audio.py <outdir> <duration>"""
import sys, os
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

OUT = sys.argv[1]; D = float(sys.argv[2])
SR = 48000; N = int(SR * D); rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)

def bp(x, lo, hi, o=4): return sosfilt(butter(o, [lo, hi], btype='band', fs=SR, output='sos'), x)
def lp(x, f, o=4): return sosfilt(butter(o, f, btype='low', fs=SR, output='sos'), x)
def hp(x, f, o=4): return sosfilt(butter(o, f, btype='high', fs=SR, output='sos'), x)
def tt(d): return np.arange(int(d * SR)) / SR
def nrm(s): return s / (np.max(np.abs(s)) + 1e-9)
def put(sig, t0, gain=1.0, pan=0.0, bus=None):
    BL, BR = bus if bus else (L, R)
    i = int(t0 * SR)
    if sig.ndim == 1:
        a = (pan + 1) * np.pi / 4; sl, sr = sig * np.cos(a), sig * np.sin(a)
    else: sl, sr = sig[:, 0], sig[:, 1]
    if i < 0: sl, sr, i = sl[-i:], sr[-i:], 0
    n = min(len(sl), N - i)
    if n <= 0: return
    BL[i:i+n] += sl[:n] * gain; BR[i:i+n] += sr[:n] * gain

def whoosh(d, lo=300, hi=6000, up=True, pf=-.4, pt=.4, peak=.6):
    n = int(d * SR); w = rng.standard_normal(n)
    ls = [bp(w, lo, lo*2.2, 2), bp(w, lo*2.2, hi*.5, 2), bp(w, hi*.5, min(hi, 20000), 2)]
    x = np.linspace(0, 1, n); k = x if up else 1 - x
    s = ls[0]*(1-k)**1.5 + ls[1]*np.sin(np.pi*k)*1.1 + ls[2]*k**1.5
    s = nrm(s * np.where(x < peak, (x/peak)**2.2, ((1-x)/(1-peak))**1.6))
    a = (np.linspace(pf, pt, n) + 1) * np.pi / 4
    return np.stack([s*np.cos(a), s*np.sin(a)], 1)
def pop(f0=900, f1=260, d=.09, br=.25):
    t = tt(d); f = f1 + (f0-f1)*np.exp(-t*60)
    return nrm(np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*38) + hp(rng.standard_normal(len(t)), 3000)*np.exp(-t*900)*br)
def key_click(var=0):
    t = tt(.06); s = hp(rng.standard_normal(len(t)), 2500)*np.exp(-t*700)*.9
    s += np.sin(2*np.pi*(2400+rng.uniform(-400, 500)+var)*t)*np.exp(-t*260)*.35
    s += np.sin(2*np.pi*(170+rng.uniform(-20, 20))*t)*np.exp(-t*120)*.55
    s += bp(rng.standard_normal(len(t)), 900, 2000, 2)*np.exp(-t*300)*.4
    return nrm(s)
def tick(f=3200, d=.05):
    t = tt(d); return nrm(np.sin(2*np.pi*f*t)*np.exp(-t*140) + hp(rng.standard_normal(len(t)), 5000)*np.exp(-t*1500)*.6)
def clack():  # wooden clothes-peg
    t = tt(.08); return nrm(bp(rng.standard_normal(len(t)), 1200, 4200, 2)*np.exp(-t*160) + np.sin(2*np.pi*rng.uniform(900, 1300)*t)*np.exp(-t*120)*.6)
def ding(f=1318.5, d=1.4):
    t = tt(d); s = sum(g*np.sin(2*np.pi*f*m*t)*np.exp(-t*dc) for m, g, dc in [(1, 1, 3.2), (2, .35, 5), (3.01, .18, 7), (4.2, .08, 9)])
    return nrm(s*np.minimum(1, t/.004))
def thud(d=.35, f0=95, f1=42):
    t = tt(d); f = f1 + (f0-f1)*np.exp(-t*18)
    return nrm(np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*11) + lp(rng.standard_normal(len(t)), 400)*np.exp(-t*40)*.5)
def boom(d=2.6):
    t = tt(d); f = 30 + 34*np.exp(-t*3)
    s = np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*1.6) + lp(rng.standard_normal(len(t)), 900)*np.exp(-t*5)*.7 + hp(rng.standard_normal(len(t)), 2000)*np.exp(-t*45)*.35
    return nrm(s*np.minimum(1, t/.003))
def riser(d, lo=200, hi=4000):
    n = int(d*SR); x = np.arange(n)/n; f = lo*(hi/lo)**(x**1.4)
    s = (np.sin(2*np.pi*np.cumsum(f)/SR)*.25 + bp(rng.standard_normal(n), 1500, 9000, 2)*x**2)*x**2.5
    return nrm(s*np.minimum(1, (1-x)/.03))
def shimmer(d=1.2):
    n = int(d*SR); t = np.arange(n)/SR; out = np.zeros((n, 2))
    for _ in range(26):
        f = rng.uniform(2500, 7500); ph = rng.uniform(0, 6.28)
        s = np.sin(2*np.pi*f*t+ph)*(.5+.5*np.sin(2*np.pi*rng.uniform(4, 11)*t+ph)); a = (rng.uniform(-.8, .8)+1)*np.pi/4
        out[:, 0] += s*np.cos(a); out[:, 1] += s*np.sin(a)
    out += ((np.sin(2*np.pi*220*t)*.6+np.sin(2*np.pi*330*t)*.3)*.25)[:, None]
    x = t/d; return nrm(out*(np.minimum(1, x/.2)*np.minimum(1, (1-x)/.25))[:, None])
def sparkle(d=.9):
    n = int(d*SR); out = np.zeros((n, 2))
    for _ in range(9):
        s = ding(rng.uniform(2200, 4200), .5)*rng.uniform(.3, .8); st = int(rng.uniform(0, d*.6)*SR); a = (rng.uniform(-.7, .7)+1)*np.pi/4; m = min(len(s), n-st)
        out[st:st+m, 0] += s[:m]*np.cos(a); out[st:st+m, 1] += s[:m]*np.sin(a)
    return nrm(out)
def scribble(d):  # pen on paper while the plan draws itself
    t = tt(d); s = bp(rng.standard_normal(len(t)), 2500, 7000, 2)
    am = .55 + .45*np.abs(np.sin(2*np.pi*7.5*t + 2*np.sin(2*np.pi*1.3*t)))
    return nrm(s*am*np.minimum(1, t/.05)*np.minimum(1, (d-t)/.08))

# ---------------- SFX timeline (mirrors engine.html) ----------------
put(whoosh(.7, 300, 6000, True, -.2, .2, .7), 0.0, .18)
for i, t0 in enumerate([.18, .46, .84, 1.04, 1.26, 1.46]):
    put(whoosh(.2, 1500, 9000, True, 0, 0, .8), t0-.1, .1); put(pop(1300+i*80, 560, .07, .35), t0+.03, .3, (i % 2 - .5)*.3)
put(whoosh(.35, 800, 9000, False, 0, 0, .3), 1.9, .2)
put(whoosh(.45, 300, 8000, True, .3, -.8, .55), 2.02, .55)
put(whoosh(.36, 1200, 12000, True, .8, 0, .7), 2.22, .32); put(pop(1600, 700, .05), 2.57, .25)
# rope
put(whoosh(.6, 200, 7000, False, -.7, .3, .2), 2.56, .6); put(thud(.4, 110, 45), 2.6, .4)
for k, t0 in enumerate([2.63, 2.69, 2.77, 2.88, 3.02]): put(clack(), t0, .3*(1-k*.12), rng.uniform(-.5, .5))
put(shimmer(1.1), 3.1, .05)
put(riser(.55, 300, 5000), 3.75, .14)
put(whoosh(.55, 150, 5000, False, 0, 0, .55), 4.2, .5); put(pop(900, 300, .1, .2), 4.4, .14, -.5); put(pop(1100, 400, .08, .2), 4.46, .14, .5)
# canvas: icon
put(thud(.35, 120, 50), 4.74, .38); put(pop(700, 260, .12, .2), 4.78, .5)
put(pop(1000, 420, .08, .2), 5.12, .2, -.3); put(pop(1100, 450, .08, .2), 5.52, .2, .3); put(pop(950, 420, .08, .2), 5.86, .18)
put(whoosh(.4, 400, 7000, True, -.2, .2, .7), 5.88, .35); put(pop(600, 240, .12, .2), 6.32, .35)
TX = 'بروفايل الشركة 2026'
for i, ch in enumerate(TX):
    put(key_click(-600 if ch == ' ' else 0), 6.42 + (i+1)*.88/len(TX), (.18 if ch == ' ' else .26)*rng.uniform(.8, 1.1), rng.uniform(-.25, .25))
put(tick(2200, .05), 7.44, .2)
put(whoosh(.5, 250, 8000, True, .6, -.6, .55), 7.66, .55); put(thud(.32, 120, 55), 8.05, .38); put(pop(1100, 480, .08, .3), 8.12, .22)
put(whoosh(.3, 900, 9000, True, 0, -.6, .5), 8.6, .16); put(whoosh(.3, 900, 9000, True, 0, .6, .5), 8.62, .16)
put(pop(1300, 560, .07, .3), 8.75, .22, -.5); put(pop(1450, 600, .07, .3), 8.8, .22, .5); put(shimmer(.9), 8.75, .05)
# blueprint
put(whoosh(.48, 200, 7000, True, 0, 0, .5), 9.1, .5); put(thud(.32, 110, 50), 9.5, .34)
put(scribble(.75), 9.57, .1, -.2); put(scribble(.5), 10.07, .08, .3)
for k in range(6): put(tick(2600+k*140, .04), 10.12 + k*.07, .12, rng.uniform(-.4, .4))
for k in range(5): put(pop(1400+k*90, 620, .06, .3), 10.43 + k*.07, .16, (k-2)*.2)
# materials
put(whoosh(.48, 250, 8000, True, -.6, .6, .55), 10.8, .5); put(thud(.3, 120, 55), 11.2, .3)
for j in range(4): put(pop(900+j*120, 380, .09, .3), 11.12 + j*.1, .3, (j % 2 - .5)*.6)
put(whoosh(.36, 2000, 9000, True, .5, -.2, .5), 11.44, .1); put(key_click(-900), 11.8, .38); put(pop(1500, 650, .06, .3), 11.86, .22); put(ding(2093, .7), 11.88, .07)
# stats
put(whoosh(.46, 200, 7000, True, 0, 0, .5), 12.28, .5); put(thud(.3, 110, 50), 12.7, .32)
for q in range(14): put(tick(2800 + q*60, .03), 12.66 + 0.75*(1-(1-q/13)**.5), .1)
put(ding(1318.5, 1.2), 13.42, .2)
# grid reveal
put(riser(.4, 400, 6000), 13.15, .18); put(whoosh(.8, 150, 7000, False, 0, 0, .25), 13.5, .5); put(boom(2.2), 13.55, .5); put(shimmer(1.2), 13.6, .07)
put(riser(.45, 300, 6000), 14.48, .22); put(whoosh(.5, 400, 10000, True, 0, 0, .7), 14.86, .4)
# logo
put(boom(2.8), 15.33, .85); put(thud(.5, 80, 38), 15.33, .4); put(sparkle(1.2), 15.36, .1)
put(whoosh(.6, 600, 9000, True, .4, -.4, .45), 15.9, .3); put(pop(1100, 480, .08, .3), 16.65, .2)
put(whoosh(.5, 300, 8000, False, 0, 0, .3), 18.82, .25)
# signature
put(riser(.4, 600, 6000), 18.95, .12); put(ding(1567.98, 1.8), 19.34, .16); put(sparkle(1.1), 19.34, .09); put(thud(.4, 90, 40), 19.32, .25)

sfx = np.stack([L, R], 1)
n_ir = int(.9*SR); ti = np.arange(n_ir)/SR
ir = np.stack([lp(rng.standard_normal(n_ir), 6000), lp(rng.standard_normal(n_ir), 6000)], 1)*np.exp(-ti*7)[:, None]; ir /= np.sqrt(np.sum(ir**2, 0))
sfx = sfx + np.stack([fftconvolve(sfx[:, c], ir[:, c])[:N] for c in range(2)], 1)*.2
sfx = nrm(hp(sfx.T, 25, 2).T); sfx = np.tanh(sfx*1.3)/np.tanh(1.3)
wavfile.write(os.path.join(OUT, '_sfx.wav'), SR, (sfx*.89*32767).astype(np.int16))

# ---------------- music bed (120 bpm, grid anchored on the canvas drop at 4.74) ----------------
r = np.random.default_rng(3); ML = np.zeros(N); MR = np.zeros(N); BUS = (ML, MR)
mid = lambda m: 440*2**((m-69)/12); beat = .5; bar = 2.0; T0 = 4.74
CH = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 55, 60, 64], [55, 59, 62, 67]]; RT = [45, 41, 48, 43]
def pad(f, d):
    t = np.arange(int(d*SR))/SR; s = np.zeros_like(t)
    for det in (-.004, 0, .004):
        for h in range(1, 7): s += np.sin(2*np.pi*f*(1+det)*h*t + r.uniform(0, 6))/(h**1.6)
    return lp(s*np.minimum(1, t/.6)*np.minimum(1, (d-t)/.9), 1600, 2)
def pluck(m, d=.45):
    q = np.arange(int(d*SR))/SR; f = mid(m)
    return (np.sin(2*np.pi*f*q) + .3*np.sin(4*np.pi*f*q) + .1*np.sin(6*np.pi*f*q))*np.exp(-q*9)*np.minimum(1, q/.002)
def kick():
    x = np.arange(int(.35*SR))/SR; f = 45 + 75*np.exp(-x*30)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*9)
def hat(d=.05): n = int(d*SR); return hp(r.standard_normal(n), 7000, 2)*np.exp(-np.arange(n)/SR*90)
def clap():
    n = int(.22*SR); x = np.arange(n)/SR; e = np.exp(-x*22) + .6*np.exp(-np.maximum(0, x-.012)*40)*(x > .012)
    return lp(hp(r.standard_normal(n), 1200, 2), 7000, 2)*e

# segment gains: 0 intro, 1 build, 2 groove, 3 break, 4 outro
def seg(t):
    if t < 2.6: return 0
    if t < 4.74: return 1
    if t < 14.88: return 2
    if t < 15.33: return 3
    return 4
n0 = int(np.floor((0 - T0)/bar)) - 1
for b in range(n0, int((D - T0)/bar) + 1):
    tb = T0 + b*bar; ci = b % 4; ch = CH[ci]
    if tb + bar < 0: continue
    sg = seg(max(0, tb))
    if sg != 3:
        for m in ch: put(pad(mid(m), bar + .9), tb, .04 if sg in (2, 4) else .05, r.uniform(-.5, .5), BUS)
        t = np.arange(int((bar+.4)*SR))/SR
        put(np.sin(2*np.pi*mid(RT[ci]-12)*t)*np.minimum(1, t/.05)*np.minimum(1, (bar+.4-t)/.3), tb, .13 if sg == 2 else .08, 0, BUS)
    for s8 in range(8):
        ts = tb + s8*beat/2
        if ts < 0 or ts >= D: continue
        sg = seg(ts)
        if sg in (1, 2, 4):
            m = ch[[0, 1, 2, 3, 2, 1, 3, 2][s8]] + 12; g = {1: .035, 2: .05, 4: .03}[sg]
            put(pluck(m), ts, g, [-.4, .4][s8 % 2], BUS); put(lp(pluck(m), 2500, 2), ts + beat*.75, g*.4, [.4, -.4][s8 % 2], BUS)
        if sg == 2:
            if s8 % 2 == 0: put(kick(), ts, .3, 0, BUS)
            put(hat(), ts + beat/4, .05, .2, BUS)
            if s8 in (2, 6) and ts > T0 + 2*bar: put(clap(), ts, .08, -.1, BUS)
        if sg == 1 and s8 % 2 == 0: put(hat(.03), ts, .03, .2, BUS)
m = np.stack([ML, MR], 1); m /= np.max(np.abs(m)) + 1e-9
t = np.arange(N)/SR; m *= (np.clip(t/1.2, 0, 1)*np.minimum(1, (D - t)/2.2))[:, None]
wavfile.write(os.path.join(OUT, '_bed.wav'), SR, (np.clip(m, -1, 1)*.9*32767).astype(np.int16))
print('audio ok')
