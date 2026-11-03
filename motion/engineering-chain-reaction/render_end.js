// node render_end.js <t0> <dur> <fps> <outdir> [preview times...]
const {chromium} = require('playwright'); const fs = require('fs'), path = require('path');
const ROOT = __dirname, TYPES = {'.html': 'text/html', '.woff2': 'font/woff2'};
(async () => {
  const [t0, dur, fps, out, ...prev] = process.argv.slice(2); fs.mkdirSync(out, {recursive: true});
  const b = await chromium.launch(); const pg = await b.newPage({viewport: {width: 1080, height: 1920}});
  pg.on('pageerror', e => console.log('JS ERROR:', e.message));
  await pg.route('http://app.local/**', r => { const f = path.join(ROOT, decodeURIComponent(new URL(r.request().url()).pathname)); r.fulfill({status: 200, contentType: TYPES[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f)}); });
  await pg.goto(`http://app.local/endcard.html?t0=${t0}`); await pg.evaluate('window.READY');
  const ts = prev.length ? prev.map(Number) : [...Array(Math.round((+dur) * +fps)).keys()].map(i => +t0 + i / +fps);
  for (const [i, t] of ts.entries()) { await pg.evaluate(t => seek(t), t); await pg.screenshot({path: path.join(out, `${String(i).padStart(4, '0')}.png`), omitBackground: true}); }
  await b.close(); console.log('end card frames:', ts.length);
})();
