// usage: node render.js preview <scale> t1 t2 ...   |   node render.js frames <scale> <from> <to> <outdir>
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = __dirname;
const TYPES = {'.js': 'text/javascript', '.html': 'text/html', '.woff2': 'font/woff2', '.json': 'application/json'};
(async () => {
  const [mode, scale, ...rest] = process.argv.slice(2);
  const b = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  const pg = await b.newPage({viewport: {width: 1080, height: 1920}});
  pg.on('console', m => console.log('PAGE:', m.text()));
  pg.on('pageerror', e => console.log('JS ERROR:', e.message));
  await pg.route('http://app.local/**', r => {
    const f = path.join(ROOT, decodeURIComponent(new URL(r.request().url()).pathname));
    if (!fs.existsSync(f)) return r.fulfill({status: 404, body: 'nf'});
    r.fulfill({status: 200, contentType: TYPES[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f)});
  });
  await pg.goto(`http://app.local/scene.html?s=${scale}${process.env.QX||''}`);
  await pg.waitForFunction('window.READY === true', null, {timeout: 180000});
  console.log('TIMES', JSON.stringify(await pg.evaluate('window.TIMES')));
  if (mode === 'preview') {
    for (const [i, t] of rest.map(Number).entries()) {
      const t0 = Date.now(); await pg.evaluate(t => window.seek(t), t);
      await pg.screenshot({path: path.join(ROOT, 'prev', `p_${String(i).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 90});
      console.log(`t=${t} ${Date.now() - t0}ms`);
    }
  } else {
    const [from, to, out] = [+rest[0], +rest[1], rest[2]]; fs.mkdirSync(out, {recursive: true});
    // warm-up seeks so stateful canvases are correct when starting mid-way
    const st = Date.now();
    for (let f = from; f < to; f++) {
      await pg.evaluate(t => window.seek(t), f / 30);
      await pg.screenshot({path: path.join(out, `${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 93});
      if (f % 30 === 0) console.log(`frame ${f} ${((Date.now() - st) / (f - from + 1)).toFixed(0)}ms/f`);
    }
  }
  await b.close();
})();
