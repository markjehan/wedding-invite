const pw = require(process.env.LOCALAPPDATA + '/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs = require('fs');
const [, , scene, out, seconds, only] = process.argv;
const FPS = 30, DT = 1000 / FPS;
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await pw.webkit.launch();
  const c = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 });
  const START = Date.parse('2026-11-12T09:00:00+05:30');
  await c.clock.install({ time: START });
  const p = await c.newPage();
  const url = 'http://127.0.0.1:4173/keepsake/making-of.html?scene=' + scene;
  await p.goto(url); await new Promise(r => setTimeout(r, 2500));
  await p.clock.pauseAt(START + 60000);
  await p.goto(url);
  await p.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 800));
  await p.evaluate(() => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = 0; } });
  const stills = only ? only.split(',').map(Number) : null;
  const total = Math.round(seconds * FPS);
  for (let n = 0; n < total; n++) {
    const t = n * DT;
    if (stills && !stills.includes(n)) continue;
    await p.evaluate(t => { for (const a of document.getAnimations()) a.currentTime = t; }, t);
    await p.screenshot({ path: `${out}/f${String(n).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 93 });
  }
  console.log(scene, 'done'); await b.close();
})();
