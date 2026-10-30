// node render.js <engine.html> <outdir> full <duration> [workers]
// node render.js <engine.html> <outdir> preview t1 t2 ...
const {chromium} = require('playwright');
const path = require('path'), fs = require('fs');
const [,, html, outdir, mode, ...rest] = process.argv;
const FPS = 30;
fs.mkdirSync(outdir, {recursive: true});

async function page(browser) {
  const pg = await browser.newPage({viewport: {width: 1080, height: 1920}});
  pg.on('pageerror', e => console.log('JS ERROR:', e.message));
  pg.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
  await pg.goto('file://' + path.resolve(html));
  const info = await pg.evaluate('window.ready');
  return [pg, info];
}

(async () => {
  const browser = await chromium.launch();
  if (mode === 'preview') {
    const [pg, info] = await page(browser);
    console.log('ready', JSON.stringify(info));
    for (let i = 0; i < rest.length; i++) {
      await pg.evaluate(`seek(${parseFloat(rest[i])})`);
      await pg.screenshot({path: path.join(outdir, `prev_${String(i).padStart(2, '0')}.png`)});
    }
  } else {
    // SUB > 1: real motion blur. Each frame is sampled SUB times across a 180° shutter (1/60 s);
    // samples are written as one sequence (frame*SUB + k) and averaged later with ffmpeg tmix.
    // SUB = 'adaptive': more samples where the page declares fast motion (window.FAST windows), else 4.
    const D = parseFloat(rest[0]), W = parseInt(rest[1] || '4'), SUB = rest[2] || '1', N = Math.round(D * FPS);
    const t0 = Date.now();
    await Promise.all(Array.from({length: W}, async (_, w) => {
      const [pg] = await page(browser);
      const fast = await pg.evaluate('window.FAST || []');
      for (let f = w; f < N; f += W) {
        const tf = f / FPS, n = SUB === 'adaptive' ? (fast.some(([a, b]) => tf >= a && tf <= b) ? 12 : 4) : parseInt(SUB);
        for (let k = 0; k < n; k++) {
          const t = tf + (n > 1 ? (k / (n - 1) - .5) / (FPS * 2) : 0);
          await pg.evaluate(`seek(${Math.min(D - 1e-3, Math.max(0, t))})`);
          const name = n > 1 || SUB === 'adaptive' ? `${String(f).padStart(5, '0')}_${String(k).padStart(2, '0')}.jpg` : `${String(f).padStart(5, '0')}.jpg`;
          await pg.screenshot({path: path.join(outdir, name), type: 'jpeg', quality: 95});
        }
        if (w === 0 && f % 120 === 0) console.log(`frame ${f}/${N} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      }
    }));
    console.log('frames done', N, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  }
  await browser.close();
})();
