import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {BokehPass} from 'three/addons/postprocessing/BokehPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const Q = new URLSearchParams(location.search);
const W = 1080, H = 1920, SCALE = +(Q.get('s') || 1);
const DUR = 24;

// ---------------- helpers ----------------
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const p = (t, a, b) => cl((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const eo = k => 1 - Math.pow(1 - k, 3);
const eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const back = (k, s = 1.4) => { const c3 = s + 1; return 1 + c3 * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2); };
const DEG = Math.PI / 180;
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function spline(keys, t) { // cubic Hermite with Catmull-Rom tangents over non-uniform key times
  const n = keys.length;
  if (t <= keys[0][0]) return keys[0][1].slice();
  if (t >= keys[n - 1][0]) return keys[n - 1][1].slice();
  let i = 0; while (t > keys[i + 1][0]) i++;
  const [t0, v0] = keys[i], [t1, v1] = keys[i + 1], h = t1 - t0, u = (t - t0) / h;
  const tan = j => { if (j === 0 || j === n - 1) return keys[j][1].map(() => 0); const [ta, va] = keys[j - 1], [tb, vb] = keys[j + 1]; return va.map((_, d) => (vb[d] - va[d]) / (tb - ta)); };
  const m0 = tan(i), m1 = tan(i + 1);
  const h00 = 2*u**3 - 3*u**2 + 1, h10 = u**3 - 2*u**2 + u, h01 = -2*u**3 + 3*u**2, h11 = u**3 - u**2;
  return v0.map((_, d) => h00*v0[d] + h10*h*m0[d] + h01*v1[d] + h11*h*m1[d]);
}

// ---------------- renderer / scene ----------------
const renderer = new THREE.WebGLRenderer({antialias: false, preserveDrawingBuffer: true});
renderer.setPixelRatio(SCALE); renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020203);
scene.fog = new THREE.FogExp2(0x020203, 0.0075);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.3;
const camera = new THREE.PerspectiveCamera(34, W / H, 0.1, 2500);

// palette
const ORANGE = 0xff5a1f;
const OR = a => `rgba(255,104,40,${a})`;

// sky dome (night -> sunrise)
const skyU = {uWarm: {value: 0}, uSunDir: {value: new THREE.Vector3(1, 0, 0)}};
const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 48, 24), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, uniforms: skyU,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform float uWarm; uniform vec3 uSunDir; varying vec3 vP;
  void main(){
    float h = max(vP.y, 0.);
    vec3 night = vec3(.0016,.0017,.0022);
    vec3 zen = vec3(.012,.008,.009), mid = vec3(.22,.07,.025), hor = vec3(.8,.27,.08);
    vec3 day = mix(zen, mid, exp(-h*3.));
    day = mix(day, hor, exp(-h*11.));
    float s = max(dot(normalize(vP), normalize(uSunDir)), 0.);
    day += vec3(1.,.4,.12) * (pow(s, 10.)*.35 + pow(s, 90.)*1.0);
    gl_FragColor = vec4(mix(night, day, uWarm), 1.);
  }`
}));
scene.add(sky);

// floor: soft mirror under a translucent dark lacquer
const mirror = new Reflector(new THREE.PlaneGeometry(3000, 3000), {
  textureWidth: Math.round(W * SCALE * .5), textureHeight: Math.round(H * SCALE * .5), color: 0x6a6a6a, clipBias: 0.003, multisample: 0});
mirror.rotation.x = -Math.PI / 2; scene.add(mirror);
const floorMat = new THREE.MeshStandardMaterial({color: 0x0a0b0d, roughness: .5, metalness: 0, transparent: true, opacity: .78});
const floor = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), floorMat);
floor.rotation.x = -Math.PI / 2; floor.position.y = .004; floor.receiveShadow = true; scene.add(floor);

// lights
const hemi = new THREE.HemisphereLight(0x8a96a8, 0x000000, .22); scene.add(hemi);
const key = new THREE.DirectionalLight(0xdfe6ff, .7);
key.position.set(-30, 80, 75); key.target.position.set(50, 0, 0); scene.add(key, key.target);
key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, {left: -85, right: 85, top: 85, bottom: -85, near: 10, far: 320});
key.shadow.bias = -0.0004; key.shadow.normalBias = .04;
const sunLight = new THREE.DirectionalLight(0xffa060, 0); scene.add(sunLight, sunLight.target);
const L1 = new THREE.PointLight(0xff6a2a, 0, 0, 2); scene.add(L1);   // pencil tip -> facade fill
const L2 = new THREE.PointLight(0xff6a2a, 0, 0, 2); scene.add(L2);   // ball
const L3 = new THREE.PointLight(0xff7a38, 0, 0, 2); scene.add(L3);   // plan glow

// materials
const M = {
  graphite: new THREE.MeshStandardMaterial({color: 0x1a1c20, roughness: .36, metalness: .6}),
  black: new THREE.MeshStandardMaterial({color: 0x0d0e10, roughness: .42, metalness: .35}),
  silver: new THREE.MeshStandardMaterial({color: 0xaeb3ba, roughness: .26, metalness: 1, envMapIntensity: 1.3}),
  concrete: new THREE.MeshStandardMaterial({color: 0x9a9da3, roughness: .82, metalness: 0}),
  fin: new THREE.MeshStandardMaterial({color: 0xc2c5ca, roughness: .45, metalness: .35}),
  gun: new THREE.MeshStandardMaterial({color: 0x5d6168, roughness: .38, metalness: .9, envMapIntensity: .8}),
  glass: new THREE.MeshStandardMaterial({color: 0x06080b, roughness: .07, metalness: .9, envMapIntensity: 2.2}),
};
const glowMat = (c = ORANGE, i = 3) => new THREE.MeshStandardMaterial({color: 0x000000, emissive: c, emissiveIntensity: i, roughness: 1});
const add = (parent, geo, mat, x = 0, y = 0, z = 0, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m; };
const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const mkTex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

await document.fonts.load('700 40px JBM'); await document.fonts.load('400 40px JBM');
await document.fonts.load('700 40px Plex', 'مخطط'); await document.fonts.load('500 40px Plex', 'مخطط');
await document.fonts.ready;

// ================= 1. PENCIL =================
const PEN_X = -6, PEN_R = .38, PEN_LEN = 12;
const pencil = new THREE.Group(); pencil.position.set(PEN_X + PEN_R, 0, 0); scene.add(pencil);
const pb = new THREE.Group(); pb.position.x = -PEN_R; pencil.add(pb);
add(pb, new THREE.CylinderGeometry(.36, .36, .9, 32), M.silver, 0, .45);
add(pb, new THREE.CylinderGeometry(PEN_R, PEN_R, 7.4, 6), M.black, 0, .9 + 3.7);
const penRing = add(pb, new THREE.CylinderGeometry(.392, .392, .16, 6), glowMat(ORANGE, 2.5), 0, 7.5);
add(pb, new THREE.CylinderGeometry(.35, .35, 2.0, 40), M.silver, 0, 9.3);
for (let k = 0; k < 10; k++) add(pb, new THREE.CylinderGeometry(.356, .356, .05, 40), M.black, 0, 8.5 + k * .18, 0, false);
add(pb, new THREE.CylinderGeometry(.07, .35, 1.1, 40), M.gun, 0, 10.85);
add(pb, new THREE.CylinderGeometry(.045, .045, .45, 16), M.gun, 0, 11.62);
const tipMat = glowMat(0xff6a2a, 6);
add(pb, new THREE.CylinderGeometry(.02, .03, .2, 12), tipMat, 0, 11.94, 0, false);

// ================= 2. DRAWING SHEETS (dominoes) =================
const NS = 9, SP = 4, SH = 9, STH = .3, SW = 6;
const SHEETS = [
  ['A-101', 'مخطط الموقع', 'SITE PLAN', 'site'], ['A-102', 'الدور الأرضي', 'GROUND FLOOR', 'plan'], ['A-103', 'الدور المتكرر', 'TYPICAL FLOOR', 'plan2'],
  ['A-104', 'مخطط السطح', 'ROOF PLAN', 'roof'], ['A-201', 'الواجهة الأمامية', 'FRONT ELEVATION', 'elev'], ['A-202', 'الواجهة الجانبية', 'SIDE ELEVATION', 'elev2'],
  ['A-301', 'قطاع A-A', 'SECTION A-A', 'section'], ['A-401', 'تفاصيل الواجهة', 'FACADE DETAILS', 'detail'], ['A-501', 'منظور', '3D VIEW', 'persp']];
function thumb(c, kind, x, y, w, h) {
  c.save(); c.translate(x, y); c.lineCap = 'square';
  const R = (a, b, cw, ch) => c.strokeRect(a, b, cw, ch), Lr = (a, b, d, e) => { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke(); };
  if (kind === 'site') { c.beginPath(); c.moveTo(20, 40); c.lineTo(w - 30, 20); c.lineTo(w - 10, h - 60); c.lineTo(40, h - 20); c.closePath(); c.stroke(); R(w * .3, h * .3, w * .38, h * .3); Lr(0, h - 50, w, h - 90); Lr(0, h - 30, w, h - 70); c.beginPath(); c.arc(w - 60, 70, 22, 0, 7); c.stroke(); Lr(w - 60, 40, w - 60, 100); }
  else if (kind === 'plan' || kind === 'plan2') { R(30, 40, w - 60, h - 90); Lr(w / 2, 40, w / 2, h - 50); Lr(30, h * .45, w - 30, h * .45); R(w / 2 - 40, h * .35, 80, 90); if (kind === 'plan2') { Lr(30, h * .7, w / 2, h * .7); Lr(w / 2, h * .25, w - 30, h * .25); } for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(80 + i * 90, h * .45, 26, -Math.PI / 2, 0); c.stroke(); } }
  else if (kind === 'roof') { R(30, 40, w - 60, h - 90); for (let i = 0; i < 14; i++) Lr(30 + i * 30, 40, 30 + i * 30 - 60, h - 50); R(w / 2 - 50, h / 2 - 40, 100, 80); }
  else if (kind === 'elev' || kind === 'elev2') { const bw = kind === 'elev' ? w - 80 : w - 180; const bx = (w - bw) / 2; R(bx, 40, bw, h - 80); for (let k = 0; k < 7; k++) Lr(bx, 40 + k * (h - 80) / 7, bx + bw, 40 + k * (h - 80) / 7); for (let j = 0; j <= (kind === 'elev' ? 12 : 7); j++) Lr(bx + j * bw / (kind === 'elev' ? 12 : 7), 40, bx + j * bw / (kind === 'elev' ? 12 : 7), h - 40 - (h - 80) / 7); Lr(0, h - 40, w, h - 40); }
  else if (kind === 'section') { R(60, 40, w - 120, h - 80); for (let k = 1; k < 7; k++) Lr(60, 40 + k * (h - 80) / 7, w - 60, 40 + k * (h - 80) / 7); c.beginPath(); for (let k = 0; k < 7; k++) { const yy = h - 40 - k * (h - 80) / 7; c.moveTo(w / 2 - 40, yy); c.lineTo(w / 2 + 40, yy - (h - 80) / 7); } c.stroke(); Lr(0, h - 40, w, h - 40); }
  else if (kind === 'detail') { c.beginPath(); c.arc(w / 2, h / 2, Math.min(w, h) * .36, 0, 7); c.stroke(); for (let j = 0; j < 7; j++) R(w / 2 - 90 + j * 28, h / 2 - 90, 10, 180); Lr(w / 2 - 120, h / 2 + 100, w / 2 + 120, h / 2 + 100); }
  else if (kind === 'persp') { const cx = w / 2, cy = h * .62, a = 120, b = 70, hh = 230; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx - a, cy - b * .6); c.lineTo(cx - a, cy - b * .6 - hh); c.lineTo(cx, cy - hh); c.closePath(); c.moveTo(cx, cy); c.lineTo(cx + a * .8, cy - b * .5); c.lineTo(cx + a * .8, cy - b * .5 - hh); c.lineTo(cx, cy - hh); c.lineTo(cx - a, cy - b * .6 - hh); c.lineTo(cx - a * .2, cy - b * 1.1 - hh); c.lineTo(cx + a * .8, cy - b * .5 - hh); c.stroke(); for (let k = 1; k < 7; k++) { const d = k * hh / 7; Lr(cx, cy - d, cx - a, cy - b * .6 - d); Lr(cx, cy - d, cx + a * .8, cy - b * .5 - d); } }
  c.restore();
}
function sheetFace(i) {
  const [code, ar, en, kind] = SHEETS[i];
  const base = mkCanvas(512, 768), em = mkCanvas(512, 768);
  const b = base.getContext('2d'), e = em.getContext('2d');
  b.fillStyle = '#17191d'; b.fillRect(0, 0, 512, 768); e.fillStyle = '#000'; e.fillRect(0, 0, 512, 768);
  for (const [c, col, lw] of [[b, 'rgba(210,215,225,.10)', 2], [e, OR(.42), 2]]) {
    c.strokeStyle = col; c.lineWidth = lw; c.strokeRect(22, 22, 468, 724);
    c.lineWidth = lw; thumb(c, kind, 40, 50, 432, 450);
    c.beginPath(); c.moveTo(22, 540); c.lineTo(490, 540); c.stroke();
  }
  for (const [c, a1, a2, a3] of [[b, '#2a2d33', '#2a2d33', '#24272c'], [e, OR(1), OR(.85), OR(.55)]]) {
    c.textAlign = 'right'; c.direction = 'rtl'; c.fillStyle = a2; c.font = '700 40px Plex'; c.fillText(ar, 470, 598);
    c.direction = 'ltr'; c.textAlign = 'left'; c.fillStyle = a3; c.font = '400 19px JBM'; c.fillText(en, 42, 598);
    c.fillStyle = a1; c.font = '700 104px JBM'; c.fillText(code, 40, 712);
  }
  return [mkTex(base), mkTex(em)];
}
const sheets = [];
for (let i = 0; i < NS; i++) {
  const [map, emi] = sheetFace(i);
  const face = new THREE.MeshStandardMaterial({map, emissiveMap: emi, emissive: 0xffffff, emissiveIntensity: 1, roughness: .55, metalness: .1});
  const backM = new THREE.MeshStandardMaterial({color: 0x15171a, roughness: .5, metalness: .2});
  const mats = [backM, face, M.graphite, M.graphite, M.graphite, M.graphite];
  const g = new THREE.Group(); g.position.set(i * SP + STH / 2, 0, 0); scene.add(g);
  const m = new THREE.Mesh(new THREE.BoxGeometry(STH, SH, SW), mats); m.position.set(-STH / 2, SH / 2, 0); m.castShadow = m.receiveShadow = true; g.add(m);
  sheets.push({g, face});
}
// fall dynamics (degrees). Each sheet is limited by the one in front of it.
const PEN_T0 = 1.25, PEN_TF = 1.0, ST_TF = .6, PUSH = .25, D_GAP = SP - STH;
const penFree = t => 90 * cl((t - PEN_T0) / PEN_TF) ** 2;
const tauFor = deg => { const a = 1 - PUSH, b = PUSH, c = -deg / 90; return ST_TF * (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a); };
const lean = phi => { const r = phi * DEG; return (r + Math.asin(cl(D_GAP * Math.cos(r) / SH, -1, 1))) / DEG; };
const S0 = [];
const PIV0 = STH / 2, PEN_PIV = PEN_X + PEN_R;
const corner0 = phi => { const r = phi * DEG; return [PIV0 + (-STH * Math.cos(r) + SH * Math.sin(r)), STH * Math.sin(r) + SH * Math.cos(r)]; };
const penLimit = phi => { const [cx, cy] = corner0(phi); return Math.atan2(cx - PEN_PIV, cy) / DEG; };
S0[0] = PEN_T0 + PEN_TF * Math.sqrt(penLimit(0) / 90);
for (let i = 1; i < NS; i++) S0[i] = S0[i - 1] + tauFor(Math.asin(D_GAP / SH) / DEG);
const sheetFree = (i, t) => { const u = cl((t - S0[i]) / ST_TF); return 90 * (PUSH * u + (1 - PUSH) * u * u); };

// ================= 3. BLOCK, BALL, RULER RAMP =================
const block = add(scene, new RoundedBoxGeometry(7, 3, 6, 4, .3), M.black, 40.5, 1.5, 0);
add(scene, new THREE.BoxGeometry(7.02, .07, .07), glowMat(ORANGE, 2), 40.5, 2.75, 3.0, false);
const RA = Math.atan2(3, 22.2), R_LEN = Math.hypot(22.2, 3);
{ // ruler texture on top face
  const c = mkCanvas(2048, 292), e = mkCanvas(2048, 292); const b = c.getContext('2d'), x = e.getContext('2d');
  b.fillStyle = '#1d2024'; b.fillRect(0, 0, 2048, 292); x.fillStyle = '#000'; x.fillRect(0, 0, 2048, 292);
  const ppu = 2048 / R_LEN;
  for (let s = 0; s <= R_LEN * 4; s++) {
    const px = s * ppu / 4, len = s % 4 === 0 ? 70 : s % 2 === 0 ? 46 : 28;
    x.strokeStyle = OR(s % 4 === 0 ? .95 : .55); x.lineWidth = s % 4 === 0 ? 4 : 2.5; x.beginPath(); x.moveTo(px, 292); x.lineTo(px, 292 - len); x.stroke();
    if (s % 8 === 0 && s > 0) { x.fillStyle = OR(.9); x.font = '700 34px JBM'; x.textAlign = 'center'; x.fillText(String(s / 4), px, 292 - 88); }
  }
  x.fillStyle = OR(.5); x.font = '400 26px JBM'; x.textAlign = 'left'; x.fillText('1:100', 24, 48);
  const top = new THREE.MeshStandardMaterial({map: mkTex(c), emissiveMap: mkTex(e), emissive: 0xffffff, emissiveIntensity: 1.3, roughness: .35, metalness: .4});
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(R_LEN, .35, 3.2), [M.graphite, M.graphite, top, M.graphite, M.graphite, M.graphite]);
  ramp.castShadow = ramp.receiveShadow = true;
  ramp.position.set(44 + 11.1 - Math.sin(RA) * .175, 1.5 - Math.cos(RA) * .175, 0); ramp.rotation.z = -RA; scene.add(ramp);
  const edgeM = glowMat(ORANGE, 2.2);
  for (const z of [-1.62, 1.62]) { const e = new THREE.Mesh(new THREE.BoxGeometry(R_LEN, .06, .06), edgeM); e.position.set(0, .16, z); ramp.add(e); }
}
const ballMat = glowMat(0xff8a45, 2.6);
const ball = add(scene, new THREE.SphereGeometry(1, 48, 32), ballMat, 40.6, 4, 0, false);
// ball kinematics
const A_LEN = 44 - 40.6, vA = 7, aR = 14;
const F_LEN = 96 - (66.2 + Math.sin(RA));
const tA = A_LEN / vA, tR = (-vA + Math.sqrt(vA * vA + 2 * aR * R_LEN)) / aR, vR = vA + aR * tR, aF = vR * vR / (2 * F_LEN), tF = vR / aF;
const TB = S0[NS - 1] + tauFor(58.8);
const TS = TB + tA + tR + tF;          // ball stops on the plan
const T_PLAN = TB + tA + tR;           // ball reaches the plan
function ballS(t) { const u = t - TB; if (u <= 0) return 0; if (u < tA) return vA * u; const u2 = u - tA; if (u2 < tR) return A_LEN + vA * u2 + .5 * aR * u2 * u2; const u3 = Math.min(u2 - tR, tF); return A_LEN + R_LEN + vR * u3 - .5 * aF * u3 * u3; }
function ballPos(S) { if (S <= A_LEN) return [40.6 + S, 4, 0]; S -= A_LEN; if (S <= R_LEN) return [44 + S * Math.cos(RA) + Math.sin(RA), 3 - S * Math.sin(RA) + Math.cos(RA), 0]; S -= R_LEN; return [66.2 + Math.sin(RA) + S, 1, 0]; }
function ballLimit(bx, by) { // max angle of the last sheet before it touches the ball
  let lo = 0, hi = 70; const piv = (NS - 1) * SP + STH / 2;
  const d = th => { const r = th * DEG; return Math.hypot(piv + SH * Math.sin(r) - bx, SH * Math.cos(r) - by); };
  if (d(70) > 1 && bx > piv + SH * Math.sin(70 * DEG)) return 70;
  for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (d(m) > 1) lo = m; else hi = m; }
  return lo;
}

// ================= 4. THE PLAN (drawn live on a canvas) =================
const PX0 = 68, PZ0 = -18, PW = 56, PD = 36, PPU = 40;
const planBase = mkCanvas(PW * PPU, PD * PPU), planEm = mkCanvas(PW * PPU, PD * PPU);
{ const b = planBase.getContext('2d'); b.fillStyle = '#0e1013'; b.fillRect(0, 0, planBase.width, planBase.height); }
const planEmTex = mkTex(planEm);
const planMat = new THREE.MeshStandardMaterial({map: mkTex(planBase), emissiveMap: planEmTex, emissive: 0xffffff, emissiveIntensity: 1.6, roughness: .62, metalness: 0});
const plan = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD), planMat);
plan.rotation.x = -Math.PI / 2; plan.position.set(PX0 + PW / 2, .02, PZ0 + PD / 2); plan.receiveShadow = true; scene.add(plan);
const cx = x => (x - PX0) * PPU, cz = z => (z - PZ0) * PPU;
// building footprint / grid
const C = new THREE.Vector3(96, 0, 0), X0 = 89, X1 = 103, Z0 = -11, Z1 = 11;
function polyPartial(c, pts, k) { // draw first k (0..1) of polyline length
  let tot = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); tot += l; }
  let rem = tot * k; c.beginPath(); c.moveTo(cx(pts[0][0]), cz(pts[0][1]));
  for (let i = 1; i < pts.length && rem > 0; i++) { const f = Math.min(1, rem / seg[i - 1]); c.lineTo(cx(lerp(pts[i - 1][0], pts[i][0], f)), cz(lerp(pts[i - 1][1], pts[i][1], f))); rem -= seg[i - 1]; }
  c.stroke();
}
const lineP = (c, x1, z1, x2, z2, k) => polyPartial(c, [[x1, z1], [x2, z2]], k);
function rtext(c, txt, x, z, font, col, a) { if (a <= 0) return; c.save(); c.direction = /[\u0600-\u06FF]/.test(txt) ? 'rtl' : 'ltr'; c.translate(cx(x), cz(z)); c.rotate(Math.PI / 2); c.globalAlpha = a; c.fillStyle = col; c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 0, 0); c.restore(); }
let planDrawnAt = -1;
function drawPlan(t, bx) {
  const c = planEm.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = '#000'; c.fillRect(0, 0, planEm.width, planEm.height);
  c.lineCap = 'round'; c.lineJoin = 'round';
  { const pre = 1 - p(t, T_PLAN, T_PLAN + .6); if (pre > 0) { c.strokeStyle = OR(.28 * pre); c.lineWidth = 3; c.strokeRect(cx(PX0 + 1.2), cz(PZ0 + 1.2), (PW - 2.4) * PPU, (PD - 2.4) * PPU);
    c.strokeStyle = OR(.06 * pre); c.lineWidth = 1.5; for (let x = PX0 + 2; x < PX0 + PW; x += 2) lineP(c, x, PZ0, x, PZ0 + PD, 1); for (let z = PZ0 + 2; z < PZ0 + PD; z += 2) lineP(c, PX0, z, PX0 + PW, z, 1); } }
  if (t < T_PLAN - .2) { planEmTex.needsUpdate = true; return; }
  // grid painted by the ball
  const gx = t < TS ? bx : lerp(96, PX0 + PW, eio(p(t, TS, TS + .8)));
  c.strokeStyle = OR(.16); c.lineWidth = 1.5;
  for (let x = PX0 + 2; x < PX0 + PW; x += 2) if (x < gx) { c.globalAlpha = p(gx - x, 0, 3); lineP(c, x, PZ0, x, PZ0 + PD, 1); }
  c.globalAlpha = 1;
  for (let z = PZ0 + 2; z < PZ0 + PD; z += 2) lineP(c, PX0, z, Math.min(gx, PX0 + PW), z, 1);
  // ball trail
  c.strokeStyle = OR(.9); c.lineWidth = 3; lineP(c, PX0, 0, Math.min(bx, 96), 0, 1);
  // sheet border
  c.strokeStyle = OR(.55); c.lineWidth = 3;
  polyPartial(c, [[PX0 + 1.2, PZ0 + 1.2], [PX0 + PW - 1.2, PZ0 + 1.2], [PX0 + PW - 1.2, PZ0 + PD - 1.2], [PX0 + 1.2, PZ0 + PD - 1.2], [PX0 + 1.2, PZ0 + 1.2]], eio(p(t, T_PLAN, T_PLAN + 1.1)));
  // structural axes + bubbles
  const ax = p(t, T_PLAN + .35, T_PLAN + 1.3);
  c.setLineDash([22, 8, 4, 8]); c.strokeStyle = OR(.45); c.lineWidth = 2;
  [89, 96, 103].forEach((x, i) => lineP(c, x, -15.5, x, 15.5, cl(ax * 1.4 - i * .15)));
  [-11, -5.5, 0, 5.5, 11].forEach((z, i) => lineP(c, 84.5, z, 107.5, z, cl(ax * 1.4 - i * .1)));
  c.setLineDash([]);
  const bub = p(t, T_PLAN + 1.0, T_PLAN + 1.6);
  if (bub > 0) {
    c.strokeStyle = OR(.75 * bub); c.lineWidth = 2.5;
    [89, 96, 103].forEach((x, i) => { c.beginPath(); c.arc(cx(x), cz(-16.5), 36, 0, 7); c.stroke(); rtext(c, String(i + 1), x, -16.5, '700 34px JBM', OR(.95), bub); });
    [-11, -5.5, 0, 5.5, 11].forEach((z, i) => { c.beginPath(); c.arc(cx(83.5), cz(z), 36, 0, 7); c.stroke(); rtext(c, 'ABCDE'[i], 83.5, z, '700 34px JBM', OR(.95), bub); });
  }
  // exterior walls (traced from the corner nearest the ball)
  const wk = eio(p(t, T_PLAN + .7, T_PLAN + 1.9));
  c.strokeStyle = OR(1); c.lineWidth = 13;
  polyPartial(c, [[X0, 0], [X0, Z0], [X1, Z0], [X1, Z1], [X0, Z1], [X0, 0]], wk);
  c.strokeStyle = '#000'; c.lineWidth = 5; polyPartial(c, [[X0, 0], [X0, Z0], [X1, Z0], [X1, Z1], [X0, Z1], [X0, 0]], wk);
  // window openings on facades
  const wo = p(t, T_PLAN + 1.6, T_PLAN + 2.3);
  c.strokeStyle = OR(.85); c.lineWidth = 3;
  for (let j = 0; j < 13; j++) { const z = -10.4 + .8 + j * 1.6; if (j / 13 < wo) { lineP(c, X0 - .35, z - .55, X0 - .35, z + .55, 1); lineP(c, X0 + .35, z - .55, X0 + .35, z + .55, 1); } }
  for (let j = 0; j < 8; j++) { const x = 89.6 + .8 + j * 1.6; if (j / 8 < wo) { lineP(c, x - .55, Z1 + .35, x + .55, Z1 + .35, 1); lineP(c, x - .55, Z1 - .35, x + .55, Z1 - .35, 1); } }
  // core + stairs + lift
  const ck = eio(p(t, T_PLAN + 1.3, T_PLAN + 2.1));
  c.strokeStyle = OR(.95); c.lineWidth = 7;
  polyPartial(c, [[94.2, -3], [97.8, -3], [97.8, 3], [94.2, 3], [94.2, -3]], ck);
  c.lineWidth = 2.5; c.strokeStyle = OR(.7);
  for (let k = 0; k < 9; k++) if (k / 9 < ck) lineP(c, 94.4 + k * .37, -2.8, 94.4 + k * .37, -.2, 1);
  if (ck > .6) { lineP(c, 94.4, .4, 97.6, 2.8, (ck - .6) / .4); lineP(c, 97.6, .4, 94.4, 2.8, (ck - .6) / .4); c.strokeRect(cx(94.4), cz(.4), 3.2 * PPU, 2.4 * PPU); }
  // partitions
  const pk = eio(p(t, T_PLAN + 1.6, T_PLAN + 2.4));
  c.strokeStyle = OR(.85); c.lineWidth = 6;
  [[X0, -4, 94.2, -4], [X0, 4, 94.2, 4], [97.8, -4, X1, -4], [97.8, 4, X1, 4], [94.2, -3, 94.2, -11], [97.8, 3, 97.8, 11]].forEach(([a, b, d, e], i) => lineP(c, a, b, d, e, cl(pk * 1.5 - i * .1)));
  // doors
  const dk = p(t, T_PLAN + 2.0, T_PLAN + 2.6);
  if (dk > 0) { c.strokeStyle = OR(.6); c.lineWidth = 2.5; [[94.2, -6, 1], [94.2, 6, -1], [97.8, -6, 1], [97.8, 6, -1]].forEach(([x, z, s]) => { c.beginPath(); c.arc(cx(x), cz(z), 1.2 * PPU, s > 0 ? Math.PI : Math.PI / 2, (s > 0 ? Math.PI : Math.PI / 2) + Math.PI / 2 * dk); c.stroke(); }); }
  // dimensions
  const mk = p(t, T_PLAN + 2.2, T_PLAN + 2.9);
  if (mk > 0) {
    c.strokeStyle = OR(.7); c.lineWidth = 2;
    lineP(c, 85.6, Z0, 85.6, Z1, eio(mk)); lineP(c, X0, 14.2, X1, 14.2, eio(mk));
    [[85.6, Z0], [85.6, Z1], [85.6, 0]].forEach(([x, z]) => lineP(c, x - .5, z - .5, x + .5, z + .5, mk));
    [[X0, 14.2], [X1, 14.2]].forEach(([x, z]) => lineP(c, x - .5, z - .5, x + .5, z + .5, mk));
    rtext(c, '22.00', 84.6, 0, '700 30px JBM', OR(.9), p(t, T_PLAN + 2.6, T_PLAN + 3.0));
    rtext(c, '14.00', 96, 15.2, '700 30px JBM', OR(.9), p(t, T_PLAN + 2.6, T_PLAN + 3.0));
  }
  // room labels
  const lk = p(t, T_PLAN + 2.5, T_PLAN + 3.1);
  [['شقة ١', 91.6, -7.5], ['شقة ٢', 91.6, 7.5], ['شقة ٣', 100.4, -7.5], ['شقة ٤', 100.4, 7.5]].forEach(([s, x, z]) => rtext(c, s, x, z, '700 46px Plex', OR(.9), lk));
  rtext(c, 'درج', 96, -1.5, '500 30px Plex', OR(.8), lk); rtext(c, 'مصعد', 96, 1.6, '500 30px Plex', OR(.8), lk);
  // title block
  const tk = p(t, T_PLAN + 2.7, T_PLAN + 3.4);
  if (tk > 0) {
    c.globalAlpha = tk; c.strokeStyle = OR(.7); c.lineWidth = 3; c.strokeRect(cx(112), cz(6), 10.6 * PPU, 10.6 * PPU); lineP(c, 112, 9.8, 122.6, 9.8, 1); c.globalAlpha = 1;
    rtext(c, 'مخطط الدور المتكرر', 119.5, 11.3, '700 40px Plex', OR(.95), tk);
    rtext(c, 'A-103', 117, 11.3, '700 60px JBM', OR(1), tk);
    rtext(c, 'SCALE 1:100', 114.4, 11.3, '400 26px JBM', OR(.7), tk);
    c.save(); c.globalAlpha = tk; c.translate(cx(118), cz(-13.5)); c.strokeStyle = OR(.8); c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 60, 0, 7); c.stroke();
    c.beginPath(); c.moveTo(80, 0); c.lineTo(-40, -22); c.lineTo(-40, 22); c.closePath(); c.fillStyle = OR(.85); c.fill(); c.restore();
    rtext(c, 'N', 120.6, -13.5, '700 34px JBM', OR(.95), tk);
  }
  planEmTex.needsUpdate = true;
}
const ring = new THREE.Mesh(new THREE.RingGeometry(.94, 1, 128), new THREE.MeshBasicMaterial({color: 0xff6a2a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false}));
ring.rotation.x = -Math.PI / 2; ring.position.set(96, .06, 0); scene.add(ring);

// ================= 5. THE BUILDING =================
const LV = [{base: 0, h: 4.4}]; for (let k = 1; k <= 6; k++) LV.push({base: 4.4 + (k - 1) * 3.2, h: 3.2});
const ROOF = 4.4 + 6 * 3.2;
const T_LV = TS + .9, LV_DT = .34;
const ledMat = glowMat(ORANGE, 0);
const levels = [];
for (let k = 0; k < LV.length; k++) {
  const {base, h} = LV[k], g = new THREE.Group(); g.position.y = base; scene.add(g);
  const ins = k === 0 ? 1.5 : .6;
  add(g, new THREE.BoxGeometry(X1 - X0 - 2 * ins, h - .4, Z1 - Z0 - 2 * ins), M.glass, C.x, (h - .4) / 2, 0);
  add(g, new THREE.BoxGeometry(X1 - X0 + .6, .4, Z1 - Z0 + .6), M.concrete, C.x, h - .2, 0);
  add(g, new THREE.BoxGeometry(.07, .07, Z1 - Z0 + .6), ledMat, X0 - .34, h - .36, 0, false);
  add(g, new THREE.BoxGeometry(X1 - X0 + .6, .07, .07), ledMat, C.x, h - .36, Z1 + .34, false);
  if (k === 0) { [-10.4, -5.5, 0, 5.5, 10.4].forEach(z => add(g, new THREE.CylinderGeometry(.3, .3, h - .4, 24), M.concrete, X0 + .6, (h - .4) / 2, z)); add(g, new THREE.BoxGeometry(.3, .25, Z1 - Z0 + .6), M.concrete, X0 - .3, .12, 0); }
  levels.push({g, a: T_LV + k * LV_DT});
}
const roofG = new THREE.Group(); roofG.position.y = ROOF; scene.add(roofG);
add(roofG, new THREE.BoxGeometry(X1 - X0 + .6, .9, .3), M.concrete, C.x, .45, Z0 - .15);
add(roofG, new THREE.BoxGeometry(X1 - X0 + .6, .9, .3), M.concrete, C.x, .45, Z1 + .15);
add(roofG, new THREE.BoxGeometry(.3, .9, Z1 - Z0 + .6), M.concrete, X0 - .15, .45, 0);
add(roofG, new THREE.BoxGeometry(.3, .9, Z1 - Z0 + .6), M.concrete, X1 + .15, .45, 0);
add(roofG, new THREE.BoxGeometry(4, 2.2, 6), M.concrete, 98, 1.1, 0);
add(roofG, new THREE.BoxGeometry(.07, .07, Z1 - Z0 + .9), ledMat, X0 - .33, .92, 0, false);
levels.push({g: roofG, a: T_LV + LV.length * LV_DT});
const T_FIN = levels[levels.length - 1].a + .1;
// fins
const fins = [];
for (let k = 1; k < LV.length; k++) {
  for (let j = 0; j < 14; j++) fins.push({x: 89.2, z: -10.4 + j * 1.6, sx: .8, sz: .2, base: LV[k].base, h: LV[k].h - .4, a: T_FIN + (k - 1) * .11 + j * .04});
  for (let j = 0; j < 9; j++) fins.push({x: 89.6 + j * 1.6, z: 10.8, sx: .2, sz: .8, base: LV[k].base, h: LV[k].h - .4, a: T_FIN + (k - 1) * .11 + (14 + j) * .04});
}
const finMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), M.fin, fins.length); finMesh.castShadow = finMesh.receiveShadow = true; scene.add(finMesh);
const T_LIGHT = T_FIN + 2.0;
// window glow (additive panes behind the fins)
const wins = [];
for (let k = 1; k < LV.length; k++) {
  for (let j = 0; j < 13; j++) wins.push({p: [89.57, LV[k].base + 1.45, -10.4 + .8 + j * 1.6], r: -Math.PI / 2, w: 1.38, h: 2.62, k, x: j / 13});
  for (let j = 0; j < 8; j++) wins.push({p: [89.6 + .8 + j * 1.6, LV[k].base + 1.45, 10.43], r: 0, w: 1.38, h: 2.62, k, x: (13 + j) / 21});
}
for (let j = 0; j < 12; j++) wins.push({p: [X0 + 1.47, 2.0, -9.3 + .775 + j * 1.55], r: -Math.PI / 2, w: 1.42, h: 3.7, k: 0, x: j / 12, lobby: true});
for (let j = 0; j < 7; j++) wins.push({p: [X0 + 1.5 + .8 + j * 1.57, 2.0, 9.53], r: 0, w: 1.45, h: 3.7, k: 0, x: j / 7, lobby: true});
wins.forEach(w => { w.on = T_LIGHT + w.k * .2 + rnd() * .9; w.i = rnd() < .14 ? .06 : .55 + rnd() * .8; w.tint = .85 + rnd() * .3; if (w.lobby) { w.on = T_LIGHT - .4 + w.x * .5; w.i = .75 + rnd() * .2; } });
const winMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false}), wins.length);
scene.add(winMesh);
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _v = new THREE.Vector3(), _c = new THREE.Color(), _e = new THREE.Euler();
wins.forEach((w, i) => { _q.setFromEuler(_e.set(0, w.r, 0)); _m.compose(_v.set(...w.p), _q, _s.set(w.w, w.h, 1)); winMesh.setMatrixAt(i, _m); winMesh.setColorAt(i, _c.setRGB(0, 0, 0)); });

// ================= 6. SUN =================
const sun = new THREE.Mesh(new THREE.SphereGeometry(26, 48, 24), new THREE.MeshBasicMaterial({color: new THREE.Color(2.6, 1.0, .28), fog: false}));
scene.add(sun);
const T_SUN = T_LIGHT + 1.2;

// ================= post =================
const rt = new THREE.WebGLRenderTarget(W * SCALE, H * SCALE, {type: THREE.HalfFloatType, samples: 4});
const composer = new EffectComposer(renderer, rt); composer.setPixelRatio(SCALE); composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
const bokeh = new BokehPass(scene, camera, {focus: 10, aperture: .002, maxblur: .008}); composer.addPass(bokeh);
const bloom = new UnrealBloomPass(new THREE.Vector2(W * SCALE / 2, H * SCALE / 2), .85, .5, .74); composer.addPass(bloom);
composer.addPass(new OutputPass());
if (Q.get('nobloom')) bloom.enabled = false; if (Q.get('nobokeh')) bokeh.enabled = false;

// ================= camera path =================
// [t, [px,py,pz, tx,ty,tz, fov, aperture]]
const CAM = [
  [0.0, [-14.5, 12.6, 5.2, -5.6, 11.2, 0, 30, .009]],
  [1.4, [-15.5, 11, 8.5, -4.5, 9.2, 0, 32, .006]],
  [2.4, [-8, 7.2, 14.5, 10, 4.5, 0, 32, .0035]],
  [3.4, [8, 7.2, 15.5, 24, 4.5, 0, 32, .003]],
  [4.3, [22, 7.2, 15.5, 37, 4, 0, 32, .003]],
  [TS + 1.7, [62, 46, 20, 96, 5, 0, 40, .0012]],
  [T_FIN + .4, [50, 24, 42, 96, 11, 0, 38, .0014]],
  [T_LIGHT + .5, [33, 8, 51, 96, 13.5, 0, 38, .0012]],
  [DUR, [40, 5.5, 45, 96, 14, 0, 38, .0012]],
];
// follow-cam for the ball: offset from the ball over time
const FOLLOW = [
  [TB - .5, [-24, 9, 24, 2, 2, 0, 38, .0025]],
  [T_PLAN, [-26, 12, 22, 3, 0, 0, 38, .002]],
  [T_PLAN + 1.0, [-27, 26, 14, 4, -1, 0, 40, .0016]],
  [TS + .2, [-32, 52, 5, 0, -1, 0, 40, .0012]],
  [TS + 1.7, [-34, 46, 20, 0, 5, 0, 40, .0012]],
]
// sun placed on the final camera's line of sight, a little to the left of the tower
const SUN = (() => { const e = CAM[CAM.length - 1][1], P = new THREE.Vector3(e[0], e[1], e[2]), T = new THREE.Vector3(e[3], e[4], e[5]);
  const f = T.clone().sub(P).setY(0).normalize(), r = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize();
  return {base: P.clone().addScaledVector(f, 700).addScaledVector(r, -38), dist: 700, y0: P.y}; })();
const lookTmp = new THREE.Vector3();

// ================= seek =================
const fade = document.getElementById('fade'), t1 = document.getElementById('t1'), t2 = document.getElementById('t2');
function seek(t) {
  // pencil + sheets
  const th = new Array(NS); const ball3 = ballPos(ballS(t));
  th[NS - 1] = Math.min(sheetFree(NS - 1, t), 70.5, ball3[0] < 44.2 ? ballLimit(ball3[0], ball3[1]) : 99);
  for (let i = NS - 2; i >= 0; i--) th[i] = Math.min(sheetFree(i, t), lean(th[i + 1]));
  const pen = Math.min(penFree(t), penLimit(th[0]), 84);
  pencil.rotation.z = -pen * DEG;
  sheets.forEach((s, i) => { s.g.rotation.z = -th[i] * DEG; const hit = t - S0[i]; s.face.emissiveIntensity = hit < 0 ? .9 : 1.25 + 2.6 * Math.exp(-hit * 3.2); });
  const tip = pb.localToWorld(lookTmp.set(0, 13.0, 0)); L1.position.copy(tip); L1.intensity = 2.2 * (1 - p(t, 3, 4.5));
  tipMat.emissiveIntensity = 6 + 4 * Math.sin(t * 6) * (1 - p(t, 1, 1.6));
  // ball
  const sink = p(t, TS + .35, TS + .9);
  ball.position.set(ball3[0], ball3[1] - sink * 1.2, ball3[2]); ball.scale.setScalar(1 - eio(sink) * .999);
  ball.visible = sink < 1;
  const flare = Math.exp(-Math.max(0, t - TS) * 4) * p(t, TS - .1, TS);
  ballMat.emissiveIntensity = 2.6 + 5 * flare;
  L2.position.set(ball3[0], ball3[1] + 1.6, ball3[2]); L2.intensity = (lerp(10, 18, p(t, TB, TB + .5)) + 90 * flare) * (1 - sink);
  // plan
  if (t < TS + 4 || planDrawnAt < TS + 4) { drawPlan(t, ball3[0]); planDrawnAt = t; }
  const pulse = p(t, TS + .15, TS + 1.3);
  ring.visible = pulse > 0 && pulse < 1; ring.scale.setScalar(1 + eo(pulse) * 34); ring.material.color.setRGB(3, 1.2, .45).multiplyScalar(1 - pulse);
  planMat.emissiveIntensity = (t < T_PLAN ? 1.6 : 1.6 + 2.4 * Math.exp(-Math.max(0, t - TS - .2) * 2.5) * p(t, TS, TS + .2)) * lerp(1, .75, p(t, T_LV, T_FIN));
  L3.position.set(lerp(80, 96, p(t, T_PLAN, TS)), 9, 0); L3.intensity = 80 * p(t, T_PLAN, T_PLAN + 1.5) * (1 - .6 * p(t, T_LV, T_FIN)) + 160 * flare;
  // building levels
  levels.forEach(({g, a}) => { const k = p(t, a, a + .42); g.visible = k > 0; g.scale.y = Math.max(.001, back(k, 1.2)); });
  fins.forEach((f, i) => { const k = back(p(t, f.a, f.a + .45), 1.1); const hh = Math.max(.001, f.h * k);
    const on = t > f.a ? 1 : 0; _m.compose(_v.set(f.x, f.base + hh / 2, f.z), _q.identity(), _s.set(f.sx * on, hh * on, f.sz * on)); finMesh.setMatrixAt(i, _m); });
  finMesh.instanceMatrix.needsUpdate = true;
  wins.forEach((w, i) => { const k = p(t, w.on, w.on + .22); const fl = k > 0 && k < 1 ? (Math.sin(t * 90 + i) > 0 ? 1 : .4) : 1;
    const v = w.i * k * fl * 1.35; winMesh.setColorAt(i, _c.setRGB(v, v * .5 * w.tint, v * .2)); });
  winMesh.instanceColor.needsUpdate = true;
  ledMat.emissiveIntensity = 2.2 * p(t, T_LIGHT - .4, T_LIGHT + .6) + 1.2 * levels.reduce((s, {a}) => s + Math.exp(-Math.max(0, t - a - .35) * 5) * p(t, a + .3, a + .36), 0);
  if (t > T_LV) { L1.position.set(78, 5, 6); L1.intensity = 140 * p(t, T_LIGHT - .2, T_LIGHT + 1.5); }
  // sunrise
  const w = eio(p(t, T_SUN, T_SUN + 5.5)), fl2 = eio(p(t, DUR - 3.2, DUR - .6));
  const sunPos = _v.copy(SUN.base).setY(SUN.y0 + SUN.dist * Math.tan(lerp(2, 19.5, w) * DEG)); sun.position.copy(sunPos); sun.visible = w > 0;
  skyU.uWarm.value = w; skyU.uSunDir.value.copy(sunPos).sub(C).normalize();
  sunLight.position.copy(sunPos); sunLight.target.position.copy(C); sunLight.intensity = 1.0 * w; key.intensity = .7 * (1 - .65 * w);
  scene.fog.color.setRGB(0.008, .0085, .011).lerp(_c.setRGB(.13, .045, .016), w * .85 + .15 * fl2);
  scene.fog.density = lerp(.0075, .0045, w) + .0015 * fl2;
  hemi.color.setHex(0x8a96a8).lerp(_c.setHex(0xffa070), w); hemi.intensity = .22 + .06 * w;
  renderer.toneMappingExposure = 1 + .1 * fl2;
  bloom.strength = lerp(.85, .5, w) + .25 * fl2; bloom.threshold = lerp(.74, .92, w) - .1 * fl2;
  // camera
  const c = spline(CAM, t);
  const wF = eio(p(t, TB - 1.1, TB - .3) * (1 - p(t, TS + .5, TS + 1.7)));
  if (wF > 0) { const fo = spline(FOLLOW, t), bx = ballPos(ballS(t)); const B = [Math.min(bx[0], 96), 1, 0];
    const fc = [B[0] + fo[0], B[1] + fo[1], B[2] + fo[2], B[0] + fo[3], B[1] + fo[4], B[2] + fo[5], fo[6], fo[7]];
    for (let d = 0; d < 8; d++) c[d] = lerp(c[d], fc[d], wF); }
  const sh = .06 + .04 * p(t, 2, 6);
  camera.position.set(c[0] + Math.sin(t * 1.31) * sh, c[1] + Math.sin(t * 1.73 + 1) * sh * .8, c[2] + Math.sin(t * .97 + 2) * sh * .6);
  lookTmp.set(c[3] + Math.sin(t * 1.1 + 3) * sh * .5, c[4] + Math.sin(t * 1.43) * sh * .4, c[5]);
  camera.lookAt(lookTmp); camera.fov = c[6]; camera.updateProjectionMatrix();
  bokeh.uniforms.focus.value = camera.position.distanceTo(lookTmp);
  bokeh.uniforms.aperture.value = c[7];
  // overlays
  fade.style.opacity = 1 - p(t, 0, .7) + p(t, DUR - .5, DUR);
  const a1 = eo(p(t, DUR - 4.4, DUR - 3.5)), a2 = eo(p(t, DUR - 3.7, DUR - 3.0));
  t1.style.opacity = a1; t1.style.filter = `blur(${(1 - a1) * 14}px)`; t1.style.transform = `translateY(${(1 - a1) * 26}px)`;
  t2.style.opacity = a2; t2.style.transform = `translateY(${(1 - a2) * 16}px)`;
  renderer.shadowMap.needsUpdate = true;
  composer.render();
}
window.seek = seek;
window.TIMES = {S0, TB, T_PLAN, TS, T_LV, T_FIN, T_LIGHT, T_SUN, DUR};
seek(0);
window.READY = true;
