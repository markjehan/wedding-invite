// Films the invitation one frame at a time: the page's clock is frozen and moved on by hand,
// so every frame is sharp and the motion is perfectly even however slow the capture is.
const pw = require(process.env.LOCALAPPDATA + '/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs = require('fs');
const [, , lang, out, query = '', maxSec = '999'] = process.argv;
const FPS = 30, DT = 1000 / FPS, W = 360, H = 640;
const sleep = ms => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(out, { recursive: true });

(async () => {
  // Real Chrome, started by hand with --remote-debugging-port (Playwright cannot launch it on this
  // computer), set up as an Android phone. Without CDP set it falls back to the iPhone-style browser.
  const chrome = !!process.env.CDP;
  const b = chrome ? await pw.chromium.connectOverCDP(process.env.CDP) : await pw.webkit.launch();
  const c = await b.newContext(chrome
    ? { viewport: { width: W, height: H }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36' }
    : { ...pw.devices['iPhone 13'], viewport: { width: W, height: H }, deviceScaleFactor: 3 });
  await c.addInitScript(() => {
    // A silent stand-in for the music player whose clock is the page's (frozen) clock, so everything
    // cut to the beat lands where it would with the real recording; the film adds the real music.
    class FakeAC {
      constructor() { this.state = 'running'; this.destination = {}; }
      get currentTime() { return performance.now() / 1000; }
      resume() { return Promise.resolve(); } suspend() { return Promise.resolve(); } close() { return Promise.resolve(); }
      addEventListener() {} removeEventListener() {}
      decodeAudioData(bytes, ok) { const buf = { duration: 98.75 }; if (ok) ok(buf); return Promise.resolve(buf); }
      createGain() { return { gain: { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {}, setTargetAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() {} }; }
      createBufferSource() { return { connect() {}, disconnect() {}, stop() {}, start() { window.__musicStart = performance.now(); } }; }
    }
    window.AudioContext = window.webkitAudioContext = FakeAC;
    try { localStorage.removeItem('nd-score-muted'); } catch {}
  });
  const START = new Date('2026-11-12T09:00:00+05:30').getTime();
  await c.clock.install({ time: START });
  const p = await c.newPage();
  p.on('console', m => { if (m.type() === 'error') console.log('ERR', m.text().slice(0, 200)); });
  p.on('pageerror', e => console.log('PAGEERR', String(e).slice(0, 200)));
  // Warm the cache in real time first, then load again with the clock frozen.
  await p.goto((process.env.SITE || 'https://naveenwedsdulanjani.com/') + query); await sleep(5000);
  await p.clock.pauseAt(START + 60000);
  await p.goto((process.env.SITE || 'https://naveenwedsdulanjani.com/') + query);
  await p.addStyleTag({ content: '#__tap{position:fixed;left:0;top:0;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(255,255,255,.55);box-shadow:0 0 0 1.5px rgba(150,115,55,.7),0 2px 10px rgba(90,60,20,.25);pointer-events:none;z-index:2147483647;opacity:0}html{scrollbar-width:none}::-webkit-scrollbar{display:none}' });
  await p.evaluate(() => { const d = document.createElement('div'); d.id = '__tap'; document.documentElement.appendChild(d); });

  let n = 0; const marks = {}; const t0 = Date.now();
  const hold = () => p.evaluate(dt => {
    for (const a of document.getAnimations()) {
      if (!a.__held) { a.__held = true; const t = a.currentTime || 0; try { a.pause(); a.currentTime = (t > 0 && t < 600) ? 0 : t; } catch {} continue; }
      if (a.playState === 'running') { try { a.pause(); } catch {} }
      try { a.currentTime = (a.currentTime || 0) + dt; } catch {}
    }
  }, DT);
  async function frame() {
    await p.clock.runFor(DT);
    await hold();
    if (!process.env.QUICK || n % 15 === 0) await p.screenshot({ path: `${out}/f${String(n).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 93 });
    n++;
    if (n % 150 === 0) console.log(lang, 'frame', n, (n / FPS).toFixed(1) + 's', 'real', ((Date.now() - t0) / 1000).toFixed(0) + 's');
    if (n / FPS > +maxSec) throw new Error('STOP');
  }
  const frames = async s => { for (let i = 0, k = Math.round(s * FPS); i < k; i++) await frame(); };
  const mark = name => { marks[name] = n / FPS; };
  const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const finger = (x, y, o) => p.evaluate(([x, y, o]) => { const d = document.getElementById('__tap'); d.style.transform = `translate(${x}px,${y}px)`; d.style.opacity = o; }, [x, y, o]);
  async function centre(sel) { const r = await p.locator(sel).first().boundingBox(); return [r.x + r.width / 2, r.y + r.height / 2]; }
  async function tap(sel) {
    const [x, y] = await centre(sel);
    for (let i = 0; i < 5; i++) { await finger(x, y, (i + 1) / 5); await frame(); }
    await p.touchscreen.tap(x, y);
    for (let i = 0; i < 8; i++) { await finger(x, y, 1 - (i + 1) / 8); await frame(); }
  }
  const yOf = (sel, offset = 0) => p.evaluate(([sel, offset]) => {
    const el = document.querySelector(sel); const max = document.documentElement.scrollHeight - innerHeight;
    return Math.max(0, Math.min(max, el.getBoundingClientRect().top + scrollY + offset));
  }, [sel, offset]);
  async function scrollTo(target, seconds) {
    const from = await p.evaluate(() => scrollY), k = Math.round(seconds * FPS);
    for (let i = 1; i <= k; i++) { const y = from + (target - from) * ease(i / k); await p.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y); await frame(); }
  }
  const to = async (sel, offset, seconds) => scrollTo(await yOf(sel, offset), seconds);

  const P = 0.7;   // how long each pause is held
  const rest = s => frames(s * P);
  async function scratchFoil() {
    const r = await p.locator('#scratch').boundingBox();
    const pts = []; const rows = 6;
    for (let i = 0; i < rows; i++) { const y = r.y + r.height * (.2 + .6 * i / (rows - 1)); const l = r.x + r.width * .14, rr = r.x + r.width * .86; pts.push(i % 2 ? [rr, y] : [l, y], i % 2 ? [l, y] : [rr, y]); }
    const seg = []; let total = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
    const at = u => { let d = u * total; for (let i = 0; i < seg.length; i++) { if (d <= seg[i]) { const k = d / seg[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; } d -= seg[i]; } return pts[pts.length - 1]; };
    let [x, y] = at(0);
    for (let i = 0; i < 5; i++) { await finger(x, y, (i + 1) / 5); await frame(); }
    await p.mouse.move(x, y); await p.mouse.down();
    const k = Math.round(3.0 * FPS);
    for (let i = 1; i <= k; i++) { const u = i / k; [x, y] = at(u); await p.mouse.move(x, y, { steps: 3 }); await finger(x, y, 1); await frame(); }
    await p.mouse.up(); await p.mouse.move(2, 2);
    const done = await p.evaluate(() => document.querySelector('#scratch-card').classList.contains('revealed'));
    if (!done) { console.log('foil not cleared by the strokes; revealing by key'); await p.evaluate(() => document.querySelector('#scratch').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))); }
    for (let i = 0; i < 8; i++) { await finger(x, y, 1 - (i + 1) / 8); await frame(); }
  }
  // SHOW=1: the take made for the film. One unbroken walk through the invitation: every scroll is
  // filmed to be played at its true speed, and only the still moments (while something is being
  // written or drawn) are marked to be played faster. marks.segs lists [first frame, last frame, speed].
  const segs = [];
  const part = async (speed, fn) => { const from = n; await fn(); segs.push([from, n, speed]); };
  if (process.env.SHOW) {
    await frames(1.2);
    await tap(`.gate-choice[data-language="${lang}"]`);
    await frames(3.2);
    await part(1, async () => { await frames(.4); await tap('#open-doors'); await p.mouse.move(2, 2); await frames(5.2); });
    await part(3, () => frames(lang === 'en' ? 12.4 : 15));                    // the monogram, then both names written out in full
    await part(1, async () => { await frames(.5); await to('#couple-drawing', -70, 2.4); });
    await part(3, () => frames(7.6));                                          // the portrait, drawn to the end
    await part(1, async () => { await frames(.4); await to('.letter-label', -60, 1.9); await frames(1.2); await to('#print-stack', -110, 1.9); await frames(2.5); await to('#date-title', -90, 1.9); await frames(.4); });
    await part(1.5, () => scratchFoil());
    await part(1, async () => { await frames(1.6); await to('#venue-title', -110, 2.3); });
    await part(3, () => frames(9));                                            // the venue, drawn to the end
    await part(1, async () => { await frames(1); await to('#agenda-title', -80, 2.3); await to('.timeline li:last-child', -300, 2.8); await to('footer.closing', 9999, 3.2); });
    await part(1.5, () => frames(3.4));
    marks.segs = segs; marks.end = n / FPS;
    fs.writeFileSync(`${out}/marks.json`, JSON.stringify(marks));
    console.log('done', n, 'frames', JSON.stringify(segs));
    await c.close(); process.exit(0);
  }
  try {
    await frames(lang === 'en' ? 2.0 : 1.4);
    await tap(`.gate-choice[data-language="${lang}"]`);
    mark('chosen');
    await frames(lang === 'en' ? 3.2 : 2.8);
    await tap('#open-doors');
    mark('seal');
    await p.mouse.move(2, 2);   // a resting mouse over the photographs would hold them still
    await frames(lang === 'en' ? 17 : 19.5);
    mark('scroll');
    await to('#invitation', 0, 1.8); await rest(1.4);
    await to('#couple-drawing', -70, 1.5); await frames(7.4);
    await to('.letter-label', -60, 1.8); await rest(2.8);
    await to('#print-stack', -110, 1.8); await frames(5.4);
    mark('date');
    await to('#date-title', -90, 1.8); await rest(1.0);
    await scratchFoil(); await rest(2.6);
    await to('.calendar-actions', -60, 1.5); await rest(2.2);
    mark('venue');
    await to('#venue-title', -110, 1.8); await frames(6.6);
    await to('.drawing-actions', -200, 1.5); await rest(2.0);
    mark('agenda');
    await to('#agenda-title', -80, 1.6); await rest(1.8);
    await to('.timeline li:last-child', -300, 5.5 * P); await rest(1.0);
    mark('rsvp');
    await to('#rsvp-title', -100, 1.8); await rest(1.8);
    await to('#rsvp', -40, 1.5); await rest(2.2);
    mark('closing');
    await to('footer.closing', 9999, 2.0); await frames(4.5);
  } catch (e) { if (e.message !== 'STOP') throw e; }
  marks.end = n / FPS; marks.music = await p.evaluate(() => window.__musicStart || null);
  fs.writeFileSync(`${out}/marks.json`, JSON.stringify(marks, null, 1));
  console.log('done', n, 'frames in', ((Date.now() - t0) / 1000).toFixed(0), 's', JSON.stringify(marks));
  await c.close(); if (!chrome) await b.close(); process.exit(0);
})();
