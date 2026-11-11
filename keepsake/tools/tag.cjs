const pw = require(process.env.LOCALAPPDATA + '/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
(async () => { const b = await pw.webkit.launch(); const c = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 }); const p = await c.newPage();
  await p.goto('http://127.0.0.1:4173/keepsake/film.html?scene=sinhala'); await p.evaluate(() => document.fonts.ready); await new Promise(r => setTimeout(r, 1200));
  await p.screenshot({ path: 'tag.png', omitBackground: true }); await b.close(); console.log('tag done'); })();
