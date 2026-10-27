// usage: node render.js --preview t1 t2 ...   |   node render.js --full [workers] [from] [to]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const DIR = __dirname, D = 41.5, FPS = 30, SUB = 3, SHUTTER = 0.5;
const logo = fs.readFileSync(path.join(DIR, 'assets', 'logo_path.txt'), 'utf8').trim();
const rd = n => fs.readFileSync(path.join(DIR, 'assets', n), 'utf8').trim();
fs.writeFileSync(path.join(DIR, '_engine.html'), fs.readFileSync(path.join(DIR, 'engine.html'), 'utf8')
  .split('%%LOGOINK%%').join(rd('logo_ink.txt')).split('%%LOGOARM%%').join(rd('logo_arm.txt')).split('%%LOGO%%').join(logo));

async function page(b) {
  const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on('pageerror', e => console.log('JS ERROR:', e.message));
  pg.on('console', m => { if (m.type() === 'error') console.log('CONSOLE:', m.text()); });
  await pg.goto('file://' + path.join(DIR, '_engine.html'));
  await pg.evaluate('window.ready');
  return pg;
}
(async () => {
  const a = process.argv.slice(2);
  const b = await chromium.launch();
  if (a[0] === '--preview') {
    const pg = await page(b);
    const ts = a.slice(1).map(Number);
    for (let i = 0; i < ts.length; i++) {
      // warm up sequentially a little before t so stateful bits settle
      await pg.evaluate(`seek(${ts[i]})`);
      await pg.screenshot({ path: path.join(DIR, `_prev_${String(i).padStart(2, '0')}.png`) });
    }
  } else {
    const W = +(a[1] || 4), N = Math.round(D * FPS), from = +(a[2] || 0), to = +(a[3] || N);
    const out = path.join(DIR, '_sub'); fs.mkdirSync(out, { recursive: true });
    const t0 = Date.now(); let done = 0;
    await Promise.all(Array.from({ length: W }, async (_, w) => {
      const pg = await page(b);
      const chunk = Math.ceil((to - from) / W), s = from + w * chunk, e = Math.min(to, s + chunk);
      for (let f = s; f < e; f++) {
        for (let k = 0; k < SUB; k++) {
          const t = (f + (k / SUB) * SHUTTER) / FPS;
          await pg.evaluate(`seek(${t})`);
          await pg.screenshot({ path: path.join(out, `${String(f * SUB + k).padStart(6, '0')}.jpg`), type: 'jpeg', quality: 94 });
        }
        if (++done % 60 === 0) console.log(`${done}/${to - from} frames, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      }
    }));
  }
  await b.close();
})();
