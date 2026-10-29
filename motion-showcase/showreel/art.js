// Illustrative placeholder artwork (one fictional building told through every chapter).
// All drawings are 1080x1920 SVG layers unless noted, so they stack and parallax together.
let UID = 0;
const ACC = (window.CFG && CFG.accent) || '#E8642C';
const HB = {x0: 300, x1: 780, xs: 860, top: 470, base: 1420, ground: 1560, fh: 95, n: 10};
const hsh = (a, b) => { const h = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return h - Math.floor(h); };
const SV = (inner, defs = '') => `<svg viewBox="0 0 1080 1920" width="1080" height="1920" preserveAspectRatio="none"><defs>${defs}</defs>${inner}</svg>`;
const LG = (id, st, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${st.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
const RG = (id, c, a0, a1 = 0) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${a0}"/><stop offset="1" stop-color="${c}" stop-opacity="${a1}"/></radialGradient>`;
const person = (x, y, h, c, o = 1) => `<g fill="${c}" opacity="${o}"><circle cx="${x}" cy="${y - h + h * .09}" r="${h * .09}"/><rect x="${x - h * .12}" y="${y - h * .8}" width="${h * .24}" height="${h * .42}" rx="${h * .08}"/><rect x="${x - h * .1}" y="${y - h * .42}" width="${h * .08}" height="${h * .42}"/><rect x="${x + h * .02}" y="${y - h * .42}" width="${h * .08}" height="${h * .42}"/></g>`;
// keep latin/number runs ("42 m²", "18,500 m²") in reading order inside Arabic text
const bidi = t => String(t).replace(/([0-9A-Za-z+@][0-9A-Za-z.,²×+@ ]*[0-9A-Za-z²])/g, '\u2066$1\u2069');
const bush = (x, y, R, seed) => { let o = ''; for (let k = 0; k < 9; k++) { const a = hsh(seed, k) * 6.283, d = R * (.25 + .6 * hsh(k, seed)); o += `<circle cx="${(x + Math.cos(a) * d).toFixed(1)}" cy="${(y + Math.sin(a) * d * .8).toFixed(1)}" r="${(R * (.32 + .3 * hsh(k + 3, seed))).toFixed(1)}" fill="${k % 3 ? '#0d110e' : '#18201a'}"/>`; } return o; };
const tree = (x, y, r, c, c2) => `<rect x="${x - 4}" y="${y - r * .4}" width="8" height="${r * 1.4}" fill="#2a211b"/><circle cx="${x - r * .45}" cy="${y - r * .5}" r="${r * .75}" fill="${c}"/><circle cx="${x + r * .45}" cy="${y - r * .55}" r="${r * .7}" fill="${c}"/><circle cx="${x}" cy="${y - r}" r="${r * .85}" fill="${c2}"/>`;

function skySVG(mode) {
  const u = 'Q' + (++UID), day = mode === 'frame';
  const st = day ? [[0, '#86a7c6'], [.5, '#c4d4e1'], [.72, '#e4e4e0'], [1, '#ece4d6']]
                 : [[0, '#151c2a'], [.3, '#2f3c56'], [.55, '#8c6e74'], [.68, '#d39a7c'], [.76, '#efbd93'], [1, '#f6d2aa']];
  const cl = day ? [[260, 420, 300, 40, .55], [780, 300, 260, 34, .5], [600, 640, 340, 30, .35]]
                 : [[300, 520, 320, 34, .22], [800, 380, 260, 28, .18], [620, 760, 360, 26, .28]];
  return SV(`<rect width="1080" height="1920" fill="url(#k${u})"/><circle cx="${day ? 840 : 240}" cy="${day ? 380 : 1340}" r="${day ? 420 : 520}" fill="url(#s${u})"/>` +
    cl.map(([x, y, rx, ry, a]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#c${u})" opacity="${a}"/>`).join(''),
    LG('k' + u, st) + RG('s' + u, day ? '#fffaf0' : '#ffd9a8', day ? .65 : .8) + RG('c' + u, day ? '#ffffff' : '#ffd7bd', 1));
}

function citySVG(mode) {
  const u = 'Q' + (++UID), day = mode === 'frame', col = day ? '#a7b4c0' : '#5d5767'; let s = '';
  for (let i = 0; i < 26; i++) {
    const x = -80 + i * 48 + hsh(i, 1) * 20, w = 40 + hsh(i, 2) * 70, h = 60 + Math.pow(hsh(i, 3), 1.6) * 360, y = 1400 - h;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h + 20}" fill="${col}" opacity="${(.55 + hsh(i, 4) * .3).toFixed(2)}"/>`;
    if (!day) for (let k = 0; k < 5; k++) if (hsh(i, k + 9) < .5) s += `<rect x="${x + 6 + hsh(k, i) * (w - 14)}" y="${y + 10 + hsh(i, k) * (h - 20)}" width="3" height="3" fill="#ffd9a0" opacity=".8"/>`;
  }
  return SV(s + `<rect y="1250" width="1080" height="200" fill="url(#h${u})"/>`, LG('h' + u, [[0, day ? '#e6e3dc' : '#f0bf98', 0], [1, day ? '#e9e4da' : '#f3c9a2', .85]]));
}

function buildingSVG(mode) {
  const u = 'Q' + (++UID), fin = mode !== 'frame', {x0, x1, xs, top, base, ground, fh, n} = HB, W = x1 - x0;
  const sy = y => y + (1380 - y) * .044, yb = i => base - i * fh;
  const defs = LG('g' + u, [[0, '#62748c'], [.55, '#3a4657'], [1, '#252d39']]) + LG('l' + u, [[0, '#ffe3b6'], [1, '#f2a564']]) +
    LG('b' + u, [[0, '#ffdcaa'], [1, '#c4723c']]) + LG('d' + u, [[0, '#1d242e'], [1, '#141920']], 1, 0) + LG('r' + u, [[0, '#ffffff', 0], [.5, '#ffffff', .09], [1, '#ffffff', 0]], 1, 1);
  let s = '';
  if (fin) {
    s += `<polygon points="${x1},${top - 30} ${xs},${sy(top - 30)} ${xs},${sy(ground)} ${x1},${ground}" fill="url(#d${u})"/>`;
    for (let i = 0; i < n; i++) {
      const y = yb(i), yt = y - fh;
      s += `<polygon points="${x1},${y - 14} ${xs},${sy(y - 14)} ${xs},${sy(y)} ${x1},${y}" fill="#a69d91"/>`;
      if (hsh(i, 7) < .45) s += `<polygon points="${x1 + 14},${yt + 10} ${xs - 10},${sy(yt + 10)} ${xs - 10},${sy(y - 22)} ${x1 + 14},${y - 22}" fill="#f0b070" opacity=".35"/>`;
    }
    s += `<polygon points="${x1},${base} ${xs},${sy(base)} ${xs},${sy(ground)} ${x1},${ground}" fill="#7a4a2c" opacity=".55"/>`;
    for (let i = 0; i < n; i++) {
      const y = yb(i), yt = y - fh, gh = fh - 14, ro = (i * 70) % 300;
      s += `<rect x="${x0}" y="${yt}" width="${W}" height="${gh}" fill="url(#g${u})"/>`;
      for (let b = 0; b < 8; b++) if (hsh(i, b) < .4) s += `<rect x="${x0 + b * 60 + 4}" y="${yt + 5}" width="52" height="${gh - 8}" fill="url(#l${u})" opacity="${(.5 + .45 * hsh(b, i)).toFixed(2)}"/>`;
      s += `<polygon points="${x0 + ro},${yt} ${x0 + ro + 90},${yt} ${x0 + ro + 30},${yt + gh} ${x0 + ro - 60},${yt + gh}" fill="url(#r${u})"/>`;
      for (let b = 0; b <= 8; b++) s += `<rect x="${x0 + b * 60 - 1.5}" y="${yt}" width="3" height="${gh}" fill="#161b22"/>`;
      if (i % 3 === 2) for (let k = 0; k < 9; k++) s += `<rect x="${x0 + 6 + k * 20}" y="${yt}" width="7" height="${gh}" fill="#a8744a"/>`;
      if (i % 2 === 1) s += `<rect x="${x0 + 290}" y="${y - 44}" width="190" height="30" fill="#ffffff" opacity=".12" stroke="#ffffff" stroke-opacity=".35" stroke-width="1.5"/>`;
      s += `<rect x="${x0}" y="${y}" width="${W}" height="6" fill="#000" opacity=".22"/><rect x="${x0 - 14}" y="${y - 14}" width="${W + 28}" height="14" fill="#ece5da"/>`;
      if (i === 3 || i === 6) { s += `<rect x="${x0 - 14}" y="${y - 22}" width="170" height="8" fill="#4d7550"/>`; for (let k = 0; k < 7; k++) s += `<circle cx="${x0 - 4 + k * 24}" cy="${y - 22}" r="${(7 + hsh(i, k) * 5).toFixed(1)}" fill="#557f57"/>`; }
    }
    s += `<rect x="${x0}" y="${top}" width="${W}" height="6" fill="#000" opacity=".22"/><rect x="${x0 - 14}" y="${top - 30}" width="${W + 28}" height="30" fill="#e3dbcf"/>`;
    for (let k = 0; k < 13; k++) s += `<rect x="${x0 + 20 + k * 36}" y="${top - 82}" width="8" height="52" fill="#a8744a"/>`;
    s += `<rect x="${x0 + 10}" y="${top - 90}" width="${W - 20}" height="9" fill="#95653f"/>`;
    s += [[x0 + 70, top - 44, 30], [x0 + 128, top - 50, 24], [x1 - 90, top - 46, 28], [x1 - 40, top - 40, 20]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#47654b"/>`).join('');
    s += `<rect x="${x0}" y="${base}" width="${W}" height="${ground - base}" fill="url(#b${u})"/>`;
    for (let k = 0; k <= 4; k++) s += `<rect x="${x0 + k * 120 - 2}" y="${base}" width="4" height="${ground - base}" fill="#3a2a20"/>`;
    s += person(x0 + 180, ground - 4, 64, '#3b2a20', .55) + person(x0 + 330, ground - 4, 60, '#3b2a20', .5);
    s += `<rect x="${x0 - 60}" y="${base - 4}" width="300" height="12" fill="#e8e1d6"/><rect x="${x0 - 60}" y="${base + 8}" width="300" height="5" fill="#000" opacity=".25"/>`;
  } else {
    const built = 7, gcol = '#8e8982';
    s += `<polygon points="${x1},${yb(built) - 14} ${xs},${sy(yb(built) - 14)} ${xs},${sy(ground)} ${x1},${ground}" fill="#6f6a64"/>`;
    s += `<rect x="${x0}" y="${base}" width="${W}" height="${ground - base}" fill="#2e2b28"/>`;
    for (let c = 0; c <= 4; c++) s += `<rect x="${x0 + c * 120 - 8}" y="${base}" width="16" height="${ground - base}" fill="${gcol}"/>`;
    for (let i = 0; i < 9; i++) {
      const y = yb(i), yt = y - fh, gh = fh - 14;
      if (i <= built) {
        if (i < built) s += `<rect x="${x0}" y="${yt}" width="${W}" height="${gh}" fill="#2e2b28" opacity=".8"/>`;
        for (let c = 0; c <= 4; c++) s += `<rect x="${x0 + c * 120 - 8}" y="${yt}" width="16" height="${gh}" fill="${gcol}"/>`;
        s += `<rect x="${x0 - 14}" y="${y - 14}" width="${W + 28}" height="14" fill="#a9a49c"/><polygon points="${x1 + 14},${y - 14} ${xs},${sy(y - 14)} ${xs},${sy(y)} ${x1 + 14},${y}" fill="#8f8a83"/>`;
        if (i === built) { s += `<rect x="${x0 - 14}" y="${yt - 10}" width="${W + 28}" height="10" fill="#b5844f"/>`; for (let k = 0; k < 12; k++) s += `<rect x="${x0 + 10 + k * 40}" y="${yt}" width="3" height="${gh}" fill="#c9a06c" opacity=".8"/>`; }
      } else for (let c = 0; c <= 4; c++) for (let r = 0; r < 3; r++) s += `<rect x="${x0 + c * 120 - 7 + r * 6}" y="${y - 48}" width="2" height="48" fill="#6d665f"/>`;
    }
    const ny = yb(built) - fh * 1.2;
    s += `<rect x="${x0 - 24}" y="${ny}" width="${W + 48}" height="${fh * 3.4}" fill="#5c6c61" opacity=".3"/>`;
    for (let k = 0; k < 33; k++) s += `<rect x="${x0 - 24 + k * 16}" y="${ny}" width="1" height="${fh * 3.4}" fill="#3d4a41" opacity=".35"/>`;
    s += `<rect x="${x0 - 150}" y="${base + 40}" width="${W + 300}" height="${ground - base - 40}" fill="#dcd6cc"/><rect x="${x0 - 150}" y="${base + 40}" width="${W + 300}" height="12" fill="${ACC}"/>`;
    for (let k = 0; k < 7; k++) s += `<rect x="${x0 - 150 + k * 112}" y="${base + 52}" width="3" height="${ground - base - 52}" fill="#c4bdb1"/>`;
    const cy = 210, mx = 905;
    let z = ''; for (let y = ground; y > cy + 30; y -= 30) z += `M${mx} ${y} L${mx + 30} ${y - 30} M${mx} ${y - 30} H${mx + 30} `;
    let j = ''; for (let x = mx; x > 350; x -= 32) j += `M${x} ${cy + 20} L${x - 16} ${cy} L${x - 32} ${cy + 20} `;
    s += `<g stroke="#e0ae3a" fill="none" stroke-width="4"><path d="M${mx} ${ground} V${cy} M${mx + 30} ${ground} V${cy}"/><path d="${z}" stroke-width="2.5"/>` +
      `<path d="M${mx + 30} ${cy} H330 M${mx + 30} ${cy + 20} H345 M330 ${cy} L345 ${cy + 20}"/><path d="${j}" stroke-width="2.5"/>` +
      `<path d="M${mx + 30} ${cy} H1075 M${mx + 30} ${cy + 16} H1075"/><path d="M${mx} ${cy} L${mx + 15} ${cy - 70} L${mx + 30} ${cy} M${mx + 15} ${cy - 70} L520 ${cy} M${mx + 15} ${cy - 70} L1060 ${cy}" stroke-width="2"/></g>` +
      `<rect x="1030" y="${cy + 16}" width="45" height="50" fill="#5a5550"/><rect x="${mx - 14}" y="${cy + 20}" width="40" height="32" fill="#d4a12e"/>` +
      `<rect x="552" y="${cy + 20}" width="22" height="10" fill="#555"/><path d="M563 ${cy + 30} V640 M563 640 L520 668 M563 640 L606 668" stroke="#444" stroke-width="2"/><rect x="500" y="668" width="126" height="14" fill="${gcol}"/>`;
  }
  return SV(s, defs);
}

function fgSVG(mode) {
  const u = 'Q' + (++UID), day = mode === 'frame'; let s = '';
  if (!day) {
    s += `<rect y="1560" width="1080" height="360" fill="url(#p${u})"/><rect x="${HB.x0}" y="1560" width="${HB.x1 - HB.x0}" height="220" fill="url(#rf${u})" opacity=".5"/>`;
    for (let k = -6; k <= 6; k++) s += `<path d="M${540 + k * 60} 1560 L${540 + k * 260} 1920" stroke="#fff" stroke-opacity=".05" stroke-width="2"/>`;
    s += `<rect x="110" y="1582" width="210" height="34" rx="4" fill="#3a332e"/><rect x="770" y="1582" width="210" height="34" rx="4" fill="#3a332e"/>`;
    s += tree(170, 1585, 44, '#33493a', '#3e5845') + tree(270, 1588, 36, '#2f4536', '#3a5241') + tree(830, 1588, 40, '#33493a', '#3e5845') + tree(930, 1585, 46, '#2f4536', '#3a5241');
    s += person(600, 1700, 120, '#1c1714') + person(668, 1712, 112, '#1c1714') + person(420, 1760, 128, '#1a1512');
    s += `<rect x="-20" y="1150" width="22" height="800" fill="#0b0d0b"/><rect x="1076" y="1180" width="22" height="800" fill="#0b0d0b"/>` + bush(-10, 1180, 200, 1) + bush(40, 1330, 130, 2) + bush(1100, 1240, 210, 3) + bush(1040, 1400, 120, 4);
    return SV(s, LG('p' + u, [[0, '#4b413a'], [1, '#1d1916']]) + LG('rf' + u, [[0, '#e7a46a', .7], [1, '#e7a46a', 0]]));
  }
  s += `<rect y="1560" width="1080" height="360" fill="url(#d${u})"/>`;
  s += [[90, 1640, 150, 46], [180, 1612, 110, 32], [760, 1650, 200, 40]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#9a958d"/><rect x="${x}" y="${y}" width="${w}" height="6" fill="#b5b0a7"/>`).join('');
  s += `<path d="M640 1700 l60 -70 l60 70 z" fill="#b8a586"/><path d="M700 1700 l50 -50 l50 50 z" fill="#a8957a"/>`;
  s += person(500, 1760, 110, '#2c2621') + `<rect x="${500 - 14}" y="${1760 - 88}" width="28" height="30" fill="${ACC}" opacity=".85"/>` + person(860, 1740, 96, '#2c2621') + `<rect x="${860 - 12}" y="${1740 - 77}" width="24" height="26" fill="${ACC}" opacity=".85"/>`;
  for (let k = 0; k < 9; k++) s += `<rect x="${40 + k * 120}" y="1600" width="70" height="16" fill="${k % 2 ? '#e8e2d8' : ACC}" opacity=".9"/>`;
  return SV(s, LG('d' + u, [[0, '#9a8a74'], [1, '#6b5e4e']]));
}

function interiorSVG() {
  const u = 'Q' + (++UID); let s = '';
  const defs = LG('w' + u, [[0, '#26324a'], [.55, '#9c7c7a'], [.8, '#efbb90'], [1, '#f5cfa6']]) + LG('f' + u, [[0, '#7a5639'], [1, '#3a281c']]) +
    LG('c' + u, [[0, '#191716'], [1, '#3a3430']]) + LG('lw' + u, [[0, '#2b2724'], [1, '#3d3631']], 1, 0) + LG('rw' + u, [[0, '#3a332f'], [1, '#26221f']], 1, 0) +
    RG('lp' + u, '#ffd9a6', .7) + LG('so' + u, [[0, '#e9ddcb'], [1, '#cdbda7']]);
  s += `<rect x="140" y="520" width="800" height="660" fill="url(#w${u})"/>`;
  for (let i = 0; i < 20; i++) { const x = 140 + i * 42 + hsh(i, 3) * 10, h = 60 + hsh(i, 5) * 210; s += `<rect x="${x}" y="${1180 - h}" width="${30 + hsh(i, 6) * 30}" height="${h}" fill="#4b4452" opacity=".75"/>`; }
  s += `<rect x="140" y="520" width="800" height="660" fill="none" stroke="#1b1816" stroke-width="12"/>` + [340, 540, 740].map(x => `<rect x="${x - 3}" y="520" width="6" height="660" fill="#1b1816"/>`).join('');
  s += `<polygon points="0,0 1080,0 940,520 140,520" fill="url(#c${u})"/><rect x="140" y="510" width="800" height="9" fill="#ffd9a6" opacity=".6"/>`;
  for (let k = 1; k < 5; k++) { const y = k * 104; s += `<path d="M${140 * y / 520} ${y} H${1080 - 140 * y / 520}" stroke="#000" stroke-opacity=".12" stroke-width="2"/>`; }
  s += `<polygon points="0,0 140,520 140,1180 0,1920" fill="url(#lw${u})"/><polygon points="1080,0 940,520 940,1180 1080,1920" fill="url(#rw${u})"/>`;
  s += `<polygon points="34,600 112,668 112,960 34,1030" fill="#c9875a" opacity=".85"/><polygon points="48,640 98,684 98,930 48,980" fill="#e9b07a" opacity=".5"/>`;
  for (let k = 0; k < 4; k++) { const y0 = 640 + k * 130; s += `<path d="M960 ${y0 + 30} L1080 ${y0 - 20 + k * 40}" stroke="#4a423c" stroke-width="10"/>`; }
  s += `<polygon points="140,1180 940,1180 1080,1920 0,1920" fill="url(#f${u})"/>`;
  for (let xb = -440; xb <= 1520; xb += 120) s += `<path d="M${(540 + (xb - 540) * .2745).toFixed(1)} 1180 L${xb} 1920" stroke="#000" stroke-opacity=".16" stroke-width="2"/>`;
  s += `<polygon points="160,1182 920,1182 1040,1700 40,1700" fill="#f3c39b" opacity=".12"/><polygon points="250,1430 830,1430 960,1740 120,1740" fill="#b49c82" opacity=".5"/>`;
  s += `<ellipse cx="540" cy="1470" rx="380" ry="40" fill="#000" opacity=".25"/><rect x="230" y="1290" width="620" height="100" rx="16" fill="url(#so${u})"/><rect x="196" y="1370" width="688" height="86" rx="16" fill="#e3d6c3"/>`;
  s += `<rect x="186" y="1300" width="60" height="160" rx="16" fill="#d8cab5"/><rect x="834" y="1300" width="60" height="160" rx="16" fill="#d8cab5"/><rect x="300" y="1310" width="150" height="70" rx="14" fill="#c98a5e" opacity=".9"/><rect x="630" y="1316" width="140" height="66" rx="14" fill="#b9a891"/>`;
  s += `<ellipse cx="540" cy="1640" rx="200" ry="36" fill="#5a3e2b"/><ellipse cx="540" cy="1630" rx="200" ry="32" fill="#8a6446"/><rect x="520" y="1576" width="22" height="48" rx="8" fill="#e8e1d6"/>`;
  s += `<rect x="538" y="0" width="4" height="700" fill="#151312"/><circle cx="540" cy="780" r="190" fill="url(#lp${u})"/><path d="M486 772 Q540 694 594 772 Z" fill="#2a2522"/>`;
  s += `<rect x="900" y="1440" width="80" height="90" rx="10" fill="#3b3430"/>` + [[-40, -120, 30, 80], [10, -150, 26, 90], [50, -110, 28, 76], [-10, -60, 34, 60]].map(([dx, dy, rx, ry], i) => `<ellipse cx="${940 + dx}" cy="${1440 + dy}" rx="${rx}" ry="${ry}" fill="${i % 2 ? '#4f6e4f' : '#5d7f5b'}" transform="rotate(${dx * .6} ${940 + dx} ${1440 + dy})"/>`).join('');
  return SV(s, defs);
}

// ---- masterplan (1000 x 1000) ----
const MPB = [[180, 125], [875, 115], [915, 520], [860, 895], [215, 910], [150, 520]];
const MPR = ['M540 940 L540 572', 'M540 348 L540 100', 'M150 640 L920 640', 'M160 298 L905 290'];
const MPPIN = [827, 527];
function masterplanSVG(pre) {
  const id = k => pre ? ` id="${pre}${k}"` : '', hide = pre ? ' style="opacity:0"' : '';
  let s = `<rect width="1000" height="1000" fill="#e8e1d4"/>`;
  [[20, 20, 110, 60], [760, 10, 130, 45], [940, 140, 60, 200], [960, 600, 40, 260], [20, 700, 80, 200], [300, 960, 260, 40], [640, 955, 220, 45]].forEach(([x, y, w, h]) => s += `<rect x="${x + 6}" y="${y + 8}" width="${w}" height="${h}" fill="#000" opacity=".1"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#dcd4c6"/>`);
  s += `<path d="M0 220 C95 240 125 330 105 420 C85 520 25 565 0 610 Z" fill="#a6c6d4"/><path d="M0 252 C80 270 104 342 87 420 C70 505 22 545 0 584" fill="none" stroke="#c8dde6" stroke-width="3"/>`;
  const ring = 'M150 92 L905 82 L952 520 L892 928 L190 942 L112 520 Z';
  s += `<path d="${ring}" fill="none" stroke="#4a4643" stroke-width="26" stroke-linejoin="round"/><path${id('R0')} d="${ring}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-dasharray="14 12"/>`;
  s += `<path d="M${MPB.map(p => p.join(' ')).join(' L')} Z" fill="#f1ebe1"/>`;
  MPR.forEach(d => s += `<path d="${d}" stroke="#57534f" stroke-width="16" fill="none"/>`);
  s += `<circle cx="540" cy="460" r="112" fill="none" stroke="#57534f" stroke-width="16"/>`;
  MPR.forEach((d, i) => s += `<path${id('R' + (i + 1))} d="${d}" stroke="#fff" stroke-opacity=".55" stroke-width="1.6" stroke-dasharray="10 9" fill="none"/>`);
  s += `<circle${id('R5')} cx="540" cy="460" r="112" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.6" stroke-dasharray="10 9"/>`;
  s += `<circle cx="540" cy="460" r="98" fill="#b5c99b"/><path d="M450 460 H630 M540 370 V550" stroke="#e9e2d3" stroke-width="6"/><circle cx="540" cy="460" r="26" fill="#a6c6d4"/>`;
  s += `<rect x="590" y="690" width="150" height="96" fill="#9fbf86"/><rect x="600" y="700" width="130" height="76" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2"/><path d="M665 700 V776" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>`;
  const Z = [
    [[190, 130, 325, 150], [170, 310, 245, 315], [165, 655, 355, 240]],
    [[560, 125, 310, 150], [660, 305, 235, 320]],
    [[560, 655, 315, 225]]];
  const ZC = [['#e8a479', '#d98a5c'], ['#7f9cc7', '#5f7fae'], ['#86b277', '#5f9450']];
  Z.forEach((rs, k) => s += `<g${id('Z' + k)}${hide} fill="${ZC[k][0]}" fill-opacity=".34" stroke="${ZC[k][1]}" stroke-width="2.5">` + rs.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/>`).join('') + (k === 2 ? `<circle cx="540" cy="460" r="104"/>` : '') + `</g>`);
  const fp = [];
  for (let k = 0; k < 4; k++) fp.push([212 + k * 78, 160, 58, 92]);
  fp.push([582, 150, 130, 100], [735, 145, 115, 110]);
  [[195, 335], [300, 335], [195, 440], [300, 440], [195, 540], [300, 540]].forEach(([x, y]) => fp.push([x, y, 72, 72]));
  fp.push([680, 330, 190, 120], [690, 480, 70, 90], [790, 480, 75, 95]);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) fp.push([190 + c * 52, 680 + r * 52, 36, 28]);
  fp.forEach(([x, y, w, h]) => s += `<rect x="${x + 7}" y="${y + 9}" width="${w}" height="${h}" fill="#000" opacity=".16"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#faf7f2" stroke="#d9d1c4" stroke-width="1"/>`);
  [[548, 600], [548, 840], [532, 700], [532, 760], [600, 820], [760, 820], [820, 700], [450, 600], [430, 230], [650, 230]].forEach(([x, y], k) => s += `<circle cx="${x}" cy="${y}" r="${7 + hsh(k, 2) * 4}" fill="#7f9d68"/>`);
  s += `<path${id('B')} d="M${MPB.map(p => p.join(' ')).join(' L')} Z" fill="none" stroke="${ACC}" stroke-width="5" stroke-linejoin="round"${pre ? ' pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"' : ''}/>`;
  MPB.forEach((p, i) => s += `<circle${id('C' + i)}${hide} cx="${p[0]}" cy="${p[1]}" r="8" fill="#fff" stroke="${ACC}" stroke-width="3.5"/>`);
  if (pre) s += Array.from({length: 12}, (_, i) => `<circle id="${pre}t${i}" r="5" fill="#fff" stroke="#57534f" stroke-width="1.5"/>`).join('');
  const ZL = [[292, 470], [715, 205], [717, 815]];
  (CFG.text.zones || []).forEach(([ar, en], k) => s += `<g${id('ZL' + k)}${hide}><rect x="${ZL[k][0] - 125}" y="${ZL[k][1] - 42}" width="250" height="84" rx="42" fill="#fff" opacity=".94"/><circle cx="${ZL[k][0] + 88}" cy="${ZL[k][1]}" r="9" fill="${ZC[k][1]}"/>` +
    `<text x="${ZL[k][0] + 68}" y="${ZL[k][1] - 4}" text-anchor="end" font-family="Alex" font-weight="600" font-size="28" fill="#1d1d1f">${ar}</text><text x="${ZL[k][0] + 68}" y="${ZL[k][1] + 24}" text-anchor="end" font-family="Inter" font-weight="600" font-size="17" letter-spacing="1.5" fill="#6b6e74">${en}</text></g>`);
  s += `<g${id('E')}${hide}><path d="M540 906 l-14 24 h28 z" fill="${ACC}"/><rect x="360" y="946" width="360" height="48" rx="24" fill="#1d1d1f"/><text x="540" y="978" text-anchor="middle" direction="rtl" unicode-bidi="embed" font-family="Alex" font-weight="600" font-size="22" fill="#fff">${CFG.text.entrance[0]} · <tspan font-family="Inter" font-size="16" letter-spacing="1.5">${CFG.text.entrance[1]}</tspan></text></g>`;
  s += `<g transform="translate(948 52)"><circle r="28" fill="#fff" opacity=".9"/><path d="M0 -20 L9 8 L0 3 L-9 8 Z" fill="#1d1d1f"/><text y="22" text-anchor="middle" font-family="Inter" font-weight="700" font-size="11" fill="#1d1d1f">N</text></g>`;
  s += `<g transform="translate(40 40)"><rect width="150" height="8" fill="#1d1d1f"/><rect width="75" height="8" fill="#fff" stroke="#1d1d1f" stroke-width="1.5"/><text y="28" font-family="Inter" font-weight="600" font-size="13" fill="#1d1d1f">0</text><text x="75" y="28" text-anchor="middle" font-family="Inter" font-weight="600" font-size="13" fill="#1d1d1f">50</text><text x="150" y="28" text-anchor="middle" font-family="Inter" font-weight="600" font-size="13" fill="#1d1d1f">100 m</text></g>`;
  return `<svg viewBox="0 0 1000 1000" width="100%" height="100%">${s}</svg>`;
}

// ---- floor plan (790 x 525) ----
const PLAN = {walls: 'M60 60H740V500H60Z M360 60V240 M60 300H190M250 300H520M580 300H740 M360 300V500 M560 300V500',
  doors: 'M190 300V240M190 240A60 60 0 0 1 250 300 M520 300V240M520 240A60 60 0 0 1 580 300 M360 240H300M300 240A60 60 0 0 0 360 300',
  wins: 'M140 54H280M140 66H280M480 54H660M480 66H660M120 494H280M120 506H280M600 494H700M600 506H700M54 120V240M66 120V240M734 360V460M746 360V460',
  furn: 'M90 330H210V420H90Z M90 352H210 M430 90H650V128H430Z M470 160H610V214H470Z M370 310H550V336H396V490H370Z M660 316H730V372H660Z M674 450A16 20 0 1 0 706 450A16 20 0 1 0 674 450Z',
  dims: 'M60 28H740M60 20V36M360 20V36M740 20V36M28 60V500M20 60H36M20 300H36M20 500H36'};
const PLAB = [['مجلس', 210, 185], ['غرفة نوم', 225, 465], ['مطبخ', 470, 425], ['حمام', 612, 470]];
function planSVG(pre) {
  const a = pre ? ' pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"' : '', id = k => pre ? ` id="${pre}${k}"` : '', hide = pre ? ' style="opacity:0"' : '';
  return `<svg viewBox="0 0 790 525" width="100%" height="100%" style="overflow:visible">
  <rect${id('hl')}${hide} x="364" y="64" width="372" height="232" fill="${ACC}" fill-opacity=".16"/>
  <g fill="none" stroke-linecap="square">
  <path${id('d')} d="${PLAN.dims}" stroke="rgba(255,255,255,.45)" stroke-width="1.6"${a}/>
  <path${id('f')} d="${PLAN.furn}" stroke="rgba(255,255,255,.5)" stroke-width="2"${a}/>
  <path${id('o')} d="${PLAN.doors}" stroke="rgba(255,255,255,.85)" stroke-width="2.4"${a}/>
  <path${id('n')} d="${PLAN.wins}" stroke="rgba(255,255,255,.85)" stroke-width="2.4"${a}/>
  <path${id('w')} d="${PLAN.walls}" stroke="#fff" stroke-width="7"${a}/></g>
  <g${id('dt')}${hide} font-family="Inter" font-weight="500" font-size="17" fill="rgba(255,255,255,.7)" text-anchor="middle"><text x="210" y="16">6.00</text><text x="550" y="16">7.60</text><text transform="translate(14 180) rotate(-90)">4.80</text><text transform="translate(14 400) rotate(-90)">4.00</text></g>
  <g font-family="Alex" font-weight="500" font-size="24" fill="rgba(255,255,255,.88)" text-anchor="middle">${PLAB.map((l, i) => `<text${id('l' + i)}${hide} x="${l[1]}" y="${l[2]}">${l[0]}</text>`).join('')}</g>
  <g${id('tg')}${hide}><rect x="440" y="150" width="220" height="56" rx="28" fill="${ACC}"/><text x="550" y="187" text-anchor="middle" direction="rtl" unicode-bidi="embed" font-family="Alex" font-weight="600" font-size="24" fill="#fff">${bidi(CFG.text.room)}</text></g></svg>`;
}
