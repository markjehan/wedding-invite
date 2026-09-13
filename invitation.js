(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Motion is opt-in twice over: the guest has not asked for less of it, and the engine has the
  // properties the choreography is written in. It is settled here, before the entrance runs,
  // because the arrival's opening states hang off this class and one of the paths below hides
  // the doors synchronously - a class added after that point would restart the figure mid-step.
  const canMove = !reduced.matches && CSS.supports('translate','0 1px');
  if(canMove)document.documentElement.classList.add('motion-ready');
  // ---------- The score ----------
  // One recording carries the whole invitation, and every duration in it is cut from the same grid.
  // The file is trimmed to its own first downbeat, so t=0 is beat one. At 100bpm a beat is 0.6s and
  // a bar 2.4s. The recording's first two bars are a thin introduction and the full arrangement
  // enters at 4.8s, which is exactly the length of the door sequence: the arrangement lands as the
  // guest arrives. Nothing autoplays -- the first note is the guest's own press on the seal.
  const TEMPO={bpm:100,beat:.6,bar:2.4};
  // Sixteen bars whose two ends match closely enough to splice without a seam. A guest reads for
  // longer than the recording runs, so it returns here rather than stopping mid-invitation.
  const LOOP={start:60,end:98.4},LOOP_SPAN=LOOP.end-LOOP.start;
  const MUTE_KEY='nd-score-muted';
  const Music=(()=>{
    const el=$('#score'),toggle=$('#sound-toggle'),label=$('#sound-label'),icon=toggle&&toggle.querySelector('use');
    if(!el)return{begin:()=>Promise.resolve(),halt(){},arm(){},playing:()=>false,position:()=>null};
    const AC=window.AudioContext||window.webkitAudioContext;
    // The ceiling, not a starting volume: nothing in the invitation ever asks for more than this.
    // It was measured rather than guessed. The recording is a -14.6 LUFS master with only 4.6 LU of
    // range — a commercial loudness that would sit in front of the invitation instead of under it.
    // Ten of those decibels are taken out of the file itself, so the asset cannot be loud even if
    // every volume control here failed, and this takes the remaining four and a half. Together they
    // put playback at roughly -29 LUFS: clearly audible on a phone in a quiet room, and never
    // competing with the page. Raising this is the one change that can make the invitation shout.
    const CEILING=.6;
    const atMost=v=>Math.max(0,Math.min(v,CEILING));
    // `run` invalidates work in flight. Muting or replaying while a decode is still resolving has
    // to be able to cancel the playback that decode was going to start.
    let ctx=null,node=null,gain=null,origin=0,playing=false,viaElement=false,armed=false,run=0;
    let muted=false;try{muted=localStorage.getItem(MUTE_KEY)==='1'}catch{}
    // Fetch and decode once, up front. The press has to make sound inside its own gesture, and
    // decoding two minutes of audio at that moment would put the first note somewhere behind the
    // doors. Decoding it is also what makes the sixteen-bar loop seamless, which is why this path
    // is preferred over simply playing the element: a looping <audio> gaps at the seam.
    let decoding=Promise.resolve(null);
    if(AC)try{
      ctx=new AC();
      decoding=fetch(el.currentSrc||el.src).then(r=>r.arrayBuffer()).then(bytes=>new Promise((ok,no)=>{
        const maybe=ctx.decodeAudioData(bytes,ok,no);if(maybe&&maybe.then)maybe.then(ok,no);
      })).catch(()=>null);
    }catch{ctx=null}
    // With no Web Audio there is nothing to decode and the element has to carry the music itself,
    // so it is the one that preloads. Either way the file is fetched exactly once.
    if(!ctx){el.preload='auto';decoding=Promise.resolve(null)}
    // Pinned now rather than at play() time. An element that was never assigned a volume plays at
    // full scale, so the assignment must not be the thing that a later failure skips.
    try{el.volume=atMost(CEILING)}catch{}
    function reflect(){
      if(!toggle)return;
      toggle.hidden=false;
      toggle.setAttribute('aria-pressed',String(muted));
      if(icon)icon.setAttribute('href',muted?'#sound-off':'#sound-on');
      if(label)label.textContent=muted?'Turn the music on':'Turn the music off';
      toggle.toggleAttribute('data-playing',playing&&!muted);
    }
    function halt(){
      run++;
      const n=node,g=gain;
      node=null;gain=null;playing=false;
      // Ramp rather than cut: stopping a loud track on an arbitrary sample is an audible click.
      if(n&&g&&ctx){
        try{
          g.gain.cancelScheduledValues(ctx.currentTime);
          g.gain.setValueAtTime(g.gain.value,ctx.currentTime);
          g.gain.linearRampToValueAtTime(.0001,ctx.currentTime+.15);
          setTimeout(()=>{try{n.stop()}catch{}n.disconnect();g.disconnect()},260);
        }catch{try{n.stop()}catch{}}
      }
      if(!el.paused)try{el.pause()}catch{}
      reflect();
    }
    // Last resort: no Web Audio at all, or the file would not decode. The element loops the whole
    // recording rather than the chosen sixteen bars, so the return is less tidy, but it plays.
    function playElement(){
      el.preload='auto';
      try{el.volume=atMost(CEILING)}catch{}
      try{el.currentTime=0}catch{}
      const started=el.play();
      viaElement=true;playing=true;reflect();
      if(started&&started.then)return started.then(()=>{},()=>{playing=false;reflect()});
      return Promise.resolve();
    }
    // Resolves when the first sample actually leaves the speaker, which is not the instant it was
    // asked for: a context that has never run has to wake its output device first, and its clock
    // stays frozen until that happens. Everything visual that wants to land with the music waits
    // on this rather than on the press, or it runs a third of a beat ahead of the sound.
    function play(){
      halt();
      claimSpeaker();
      if(!ctx)return playElement();
      // Resuming has to happen here, synchronously, while the gesture that allowed it is still on
      // the stack. Starting the source itself can safely wait for the decode.
      if(ctx.state==='suspended'&&ctx.resume)ctx.resume();
      const mine=run;
      return decoding.then(buffer=>{
        if(mine!==run||muted)return;
        if(!buffer)return playElement();
        gain=ctx.createGain();
        gain.gain.setValueAtTime(.0001,ctx.currentTime);
        gain.gain.linearRampToValueAtTime(atMost(CEILING),ctx.currentTime+.15);
        gain.connect(ctx.destination);
        node=ctx.createBufferSource();
        node.buffer=buffer;node.loop=true;node.loopStart=LOOP.start;node.loopEnd=LOOP.end;
        // The source is scheduled at the frozen reading, so it begins on the device's first live
        // sample and `origin` is the zero the whole invitation counts its bars from.
        node.connect(gain);node.start();
        origin=ctx.currentTime;viaElement=false;playing=true;reflect();
        return new Promise(sounding=>{
          const frozen=origin,limit=performance.now()+1500;
          (function look(){
            if(mine!==run||!playing||ctx.currentTime>frozen||performance.now()>limit)sounding();
            else requestAnimationFrame(look);
          })();
        });
      });
    }
    function begin(){armed=true;if(muted){reflect();return Promise.resolve()}return play()}
    // Wanted, but with no gesture yet to authorise it. Arming alone is what onFirstGesture waits
    // for, so the score still starts the moment the guest touches anything.
    function arm(){armed=true;reflect()}
    function setMuted(next){
      muted=next;
      try{localStorage.setItem(MUTE_KEY,next?'1':'0')}catch{}
      if(next)halt();else if(armed)play();else reflect();
    }
    if(toggle)toggle.addEventListener('click',()=>setMuted(!muted));
    // A shared section link and reduced motion both skip the seal, so there is no press to ride in
    // on. Wait for whatever the guest does first rather than trying -- and failing -- to autoplay.
    function onFirstGesture(){
      ['pointerdown','keydown'].forEach(t=>removeEventListener(t,onFirstGesture));
      // Wake the output device on the first touch anywhere, including the touch that lands on the
      // seal: pointerdown runs ahead of click, so the device spends the press warming up instead
      // of making the first note wait for it.
      if(ctx&&ctx.state==='suspended'&&ctx.resume)ctx.resume();
      if(armed&&!muted&&!playing)play();
    }
    ['pointerdown','keydown'].forEach(t=>addEventListener(t,onFirstGesture,{passive:true}));
    // Safari only lets a touch unlock sound when the finger lifts, not when it lands, so on an iPhone
    // the pointerdown wake above is refused and the context has to be asked again on touchend or
    // click. iOS also parks a sounding context as "interrupted" whenever the phone locks, a call comes
    // in or another app takes the speaker, and never brings it back by itself. One check answers
    // both: whenever the guest lifts a finger or comes back to the page, a context that ought to be
    // sounding is asked to run.
    function wake(){
      if(!ctx||!armed||muted||ctx.state==='running'||!ctx.resume)return;
      const resumed=ctx.resume();if(resumed&&resumed.catch)resumed.catch(()=>{});
    }
    ['touchend','click'].forEach(t=>addEventListener(t,wake,{passive:true}));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake()});
    // An iPhone with its ring switch set to silent mutes Web Audio completely, while an <audio>
    // element on the same phone still plays -- so the path this invitation prefers was the one that
    // went quiet. Declaring the page's sound as playback, the category a music player uses, is how
    // Safari lets it reach the speaker anyway. Browsers without the Audio Session API skip this.
    function claimSpeaker(){try{if(navigator.audioSession&&navigator.audioSession.type!=='playback')navigator.audioSession.type='playback'}catch{}}
    reflect();
    return{
      begin,halt,arm,
      playing:()=>playing&&!muted,
      // Seconds into the recording, wrapped through the loop, or null when nothing is sounding.
      // Everything that wants to move in time with the music reads its phase from here.
      position(){
        if(!playing||muted)return null;
        let t=viaElement?el.currentTime:ctx.currentTime-origin;
        if(!viaElement&&t>=LOOP.end)t=LOOP.start+(t-LOOP.end)%LOOP_SPAN;
        return t;
      }
    };
  })();
  // How long until the next beat falls, so a move can start on the pulse instead of between two.
  const untilNextBeat=()=>{const t=Music.position();return t===null?0:(TEMPO.beat-t%TEMPO.beat)%TEMPO.beat};
  window.invitationTempo=TEMPO;
  window.musicPosition=()=>Music.position();
  window.untilNextBeat=untilNextBeat;

  // How far into the entrance the welcome begins to speak. The camera is still moving at this
  // point, so the first line surfaces through the dissolve rather than waiting behind it.
  const ARRIVE_LEAD=TEMPO.beat*6;
  // The figure plays once. Whichever path gets the guest here sets it going -- the doors hand it
  // their own remaining time as a lead, everything else starts it from the top -- and the guard
  // keeps the second caller from re-cueing a figure that is already part-way through.
  function beginArrival(lead){
    if(document.body.classList.contains('arrived'))return;
    document.documentElement.style.setProperty('--arrive',Math.max(0,lead)+'s');
    // The mark opens alone at the middle of the screen and then travels down to its place beneath
    // the names, so the figure needs to know how far that is. It is measured rather than guessed
    // because the distance is most of the height of two lines of script, which is a different
    // number on every viewport. This has to run before `arrived` lands: the lifted, enlarged state
    // lives only inside the keyframes, so right now the mark is still sitting untransformed where
    // it belongs and its box can be read honestly.
    const crest=$('.welcome-crest'),content=$('.welcome-content'),screenful=$('.welcome');
    if(crest&&content&&screenful){
      const stage=screenful.getBoundingClientRect(),mark=crest.getBoundingClientRect();
      // Two terms. The first centres the mark on the screen it opens alone on. The second lifts it
      // a little further, because a single object placed at the exact middle of a tall screen reads
      // as slightly low; the optical centre sits above the geometric one.
      const lift=(stage.top+stage.height/2)-(mark.top+mark.height/2)-innerHeight*.035;
      content.style.setProperty('--crest-lift',lift.toFixed(1)+'px');
    }
    document.body.classList.add('arrived');
  }
  // The closing signs off with the same mark the arrival opens on, and it draws itself down there
  // too. It is cloned from the hero rather than written out a second time, so the two can never
  // disagree about what the mark is. Every id inside has to be made unique on the copy: both marks
  // would otherwise share one set of ink fronts, and the hero's would have finished its sweep long
  // before the closing came into view, leaving the footer's letters already written.
  (() => {
    const hero = $('.welcome-crest'), closing = $('.closing');
    if (!hero || !closing) return;
    let html = hero.outerHTML;
    hero.querySelectorAll('[id]').forEach(node => {
      html = html.split('id="' + node.id + '"').join('id="' + node.id + '-close"')
                 .split('#' + node.id + ')').join('#' + node.id + '-close)');
    });
    const holder = document.createElement('div');
    holder.innerHTML = html;
    const mark = holder.firstElementChild;
    mark.classList.replace('welcome-crest', 'closing-crest');
    closing.prepend(mark);
  })();
  // The door ritual precedes the continuous document; it never replaces native scrolling.
  const intro=$('#door-intro'),openButton=$('#open-doors');
  const outside=[...document.body.children].filter(el=>el!==intro&&!['SCRIPT','STYLE','NOSCRIPT'].includes(el.tagName));
  let introTimer,opening=false,returnHash=location.hash;
  // Called on the paths that skip the entrance, and at the end of the entrance itself. The document
  // underneath has been painted and locked since the first frame; this is what unlocks it.
  function finishIntro(){clearTimeout(introTimer);beginArrival(0);intro.hidden=true;opening=false;intro.classList.remove('opening','pressed');document.body.classList.remove('intro-locked','intro-opening');outside.forEach(el=>el.inert=false);window.raisePetals?.();const target=document.getElementById(returnHash.slice(1))||$('#welcome');target.scrollIntoView({behavior:'instant',block:'start'});const heading=target.querySelector('h1,h2')||$('#welcome-title');heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
  // Decode the entrance art up front. The swing waits on this, so it can never start part-way
  // through a decode — that was the stall between pressing the seal and the doors moving.
  const entranceArt=Promise.all(['assets/magnolia-suite/doors.webp','assets/magnolia-suite/portrait.webp','assets/magnolia-suite/garden.webp']
    .map(src=>{const img=new Image();img.src=src;return img.decode().catch(()=>{});}));
  function openIntro(skip=false){
    if(skip||reduced.matches){Music.begin();finishIntro();return}
    if(opening)return;
    opening=true;
    intro.classList.add('pressed');
    // The first note belongs to the press itself: asking for it here keeps it inside the gesture
    // that browsers require before they will make any sound at all.
    const sounding=Music.begin();
    // The swing waits for two things — the art to be decoded and the first note to be audible — so
    // that the doors start on beat one rather than a third of a beat ahead of it. Neither wait is
    // open-ended: past one beat the doors go regardless, which leaves them a beat behind the score
    // in the worst case and never drifting against it. The seal has already answered the press.
    Promise.race([
      Promise.all([entranceArt,sounding]),
      new Promise(go=>setTimeout(go,TEMPO.beat*1000))
    ]).then(()=>{
      if(!opening)return;
      // One more frame so the pressed state paints before the swing takes the compositor.
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(!opening)return;
        // Whatever the music has already played while the art decoded and this frame was scheduled
        // is handed to the CSS as --sync, which starts every stage of the entrance that far in. A
        // beat is the ceiling, so a slow start costs the swing a little of its length rather than
        // most of it. Silence reports nothing, and the sequence simply runs from its own zero.
        const shift=Math.min(Math.max(Music.position()||0,0),TEMPO.beat);
        document.documentElement.style.setProperty('--sync',shift+'s');
        beginArrival(ARRIVE_LEAD-shift);
        intro.classList.add('opening');document.body.classList.add('intro-opening');
        // Two bars: three beats of swing, then five walking through, less whatever --sync skipped.
        introTimer=setTimeout(finishIntro,(TEMPO.bar*2-shift)*1000);
      }));
    });
  }
  // Replay puts the entrance back; on first load the markup already has it, so nothing here moves.
  function showIntro(){clearTimeout(introTimer);Music.halt();document.body.classList.remove('arrived');document.documentElement.style.setProperty('--sync','0s');document.documentElement.style.setProperty('--arrive','0s');opening=false;intro.classList.remove('opening','pressed');document.body.classList.remove('intro-opening');window.scrollTo({top:0,behavior:'instant'});intro.hidden=false;outside.forEach(el=>el.inert=true);document.body.classList.add('intro-locked');openButton.focus({preventScroll:true});}
  // Pressing the seal opens it; anywhere on the doors works too, and Escape skips straight through.
  openButton.addEventListener('click',()=>openIntro());
  intro.addEventListener('click',e=>{if(e.target!==openButton)openIntro()});
  intro.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();openIntro(true)}if(e.key==='Tab'){e.preventDefault();openButton.focus()}});
  const replay=document.createElement('button');replay.className='intro-replay';replay.textContent='Replay the opening';replay.addEventListener('click',()=>{returnHash='#welcome';showIntro()});$('.closing').append(replay);
  // A shared section link opens straight to that section. Reduced motion bypasses the intro.
  // Neither route passes through the seal, so neither has a gesture to start the score on; arming
  // it hands that job to the guest's first touch instead of losing the music altogether.
  if(reduced.matches || returnHash){Music.arm();finishIntro()} else showIntro();
  // Tells the safety net at the foot of index.html that the doors are in working order.
  window.invitationBooted=true;
  reduced.addEventListener('change',()=>{if(reduced.matches&&!intro.hidden)finishIntro()});
  // Only the date is confirmed. Calendar entries remain all-day until timing is supplied.
  const weddingDay = new Date('2026-12-04T00:00:00+05:30').getTime();
  function countdown() {
    const delta = Math.max(0, Math.floor((weddingDay - Date.now()) / 1000));
    const values = [Math.floor(delta / 86400), Math.floor(delta / 3600) % 24, Math.floor(delta / 60) % 60, delta % 60];
    ['days', 'hours', 'minutes', 'seconds'].forEach((id, i) => {
      const cell = $('#' + id), next = String(values[i]).padStart(2, '0');
      if (cell.textContent === next) return;
      cell.textContent = next;
      if (!reduced.matches) cell.animate?.([{opacity:.25,translate:'0 -7px'},{opacity:1,translate:'0 0'}], {duration:TEMPO.beat*500,easing:'cubic-bezier(.16,1,.3,1)'});
    });
    if (!delta) $('#countdown-note').textContent = Date.now() < weddingDay + 86400000 ? 'Today is our wedding day!' : 'Thank you for celebrating this beautiful chapter with us.';
  }
  countdown(); setInterval(countdown, 1000);
  // On an iPhone or iPad the plain link does better than the generated file. Safari opens a calendar
  // file it is served straight into Add to Calendar, while a script-made download only lands in
  // Files for the guest to go and find. The link already points at wedding.ics, so there it is simply
  // allowed to go, without the download attribute that would turn it back into a file.
  const appleTouch=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  if(appleTouch)$('#ical').removeAttribute('download');
  $('#ical').addEventListener('click', (event) => {
    if (appleTouch) return;
    event.preventDefault();
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const text = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Naveen and Dulanjani//Wedding//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:naveen-dulanjani-20261204@invitation.local','DTSTAMP:' + stamp,'DTSTART;VALUE=DATE:20261204','DTEND;VALUE=DATE:20261205','SUMMARY:Naveen & Dulanjani Wedding','LOCATION:Avenra Gardens\\, Negombo\\, Sri Lanka','DESCRIPTION:Ceremony time to be confirmed.','END:VEVENT','END:VCALENDAR',''].join('\r\n');
    const url = URL.createObjectURL(new Blob([text], {type:'text/calendar;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = 'Naveen-and-Dulanjani-4-December-2026.ics'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
  });
  const card = $('#scratch-card'), canvas = $('#scratch'), ctx = canvas.getContext('2d');
  let revealed = false, drawing = false, last = null, moved = 0;
  function reveal() { if (revealed) return; revealed = true; drawing = false; card.classList.add('revealed'); canvas.setAttribute('aria-disabled','true'); canvas.tabIndex = -1; $('#scratch-status').textContent = 'Friday, 4 December 2026. Find the details below.'; }
  let foilRetry = 0;
  function paintFoil(force) {
    if (!ctx || revealed) return;
    const rect = card.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    // The card can still measure zero on the pass that runs before layout has settled — the arches
    // are drawn inset from its edges, so a zero width asks for a negative corner radius and throws,
    // leaving the foil unpainted and the date on show. Wait for a real box and come back.
    if (rect.width < 80 || rect.height < 80) {
      cancelAnimationFrame(foilRetry);
      foilRetry = requestAnimationFrame(() => paintFoil(force));
      return;
    }
    const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
    if (!force && canvas.width === width && canvas.height === height) return;
    canvas.width = width; canvas.height = height; ctx.setTransform(dpr,0,0,dpr,0,0); ctx.globalCompositeOperation = 'source-over';
    const w = rect.width, h = rect.height;
    // Pale champagne leaf on pearl, guilloche lattice, arched pressed rules, a small stamped monogram.
    const gold = ctx.createLinearGradient(0,0,w,h);
    [[0,'#bf9f61'],[.14,'#e4d3ab'],[.27,'#fcf6e9'],[.41,'#d3b77f'],[.55,'#c7a76a'],[.69,'#f5ecd6'],[.83,'#d9bf8d'],[1,'#b8965a']].forEach(([at,tone]) => gold.addColorStop(at,tone));
    ctx.fillStyle = gold; ctx.fillRect(0,0,w,h);
    ctx.save(); ctx.globalAlpha = .05; ctx.strokeStyle = '#6a4e22'; ctx.lineWidth = .6;
    for (let i = -h; i < w + h; i += 9) {
      ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i+h,h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i,h); ctx.lineTo(i+h,0); ctx.stroke();
    }
    ctx.restore();
    const arch = (inset, tone) => {
      const iw = w - inset*2, dome = iw*.5;
      ctx.strokeStyle = tone; ctx.lineWidth = 1; ctx.beginPath();
      ctx.roundRect(inset, inset, iw, h - inset*2, [dome, dome, 3, 3]); ctx.stroke();
    };
    arch(15,'#7d5f2b5e'); arch(22,'#7d5f2b30');
    // The same mark that heads every section, struck into the leaf. It is walked out of the #crest
    // symbol in the document rather than written out a second time here: the medallion, the section
    // flourishes and this foil are then one drawing by construction, and redrawing the mark can no
    // longer leave the scratch card behind carrying last month's version of it.
    const crest = document.getElementById('crest');
    const [bx, by, bw, bh] = (crest.getAttribute('viewBox') || '44 38 112 120').split(/\s+/).map(Number);
    const scale = Math.min(h * .5 / bh, w * .64 / bw);
    const originX = w / 2 - (bx + bw / 2) * scale, originY = h * .44 - (by + bh / 2) * scale;
    // Only the three transform forms the symbol actually uses. Returns the uniform scale it applied
    // so the stroke can stay a hairline of the same weight however deeply it is nested.
    const applyTransform = (t) => {
      let k = 1;
      if (!t) return k;
      for (const [, fn, args] of t.matchAll(/(translate|rotate|scale)\(([^)]*)\)/g)) {
        const n = args.split(/[\s,]+/).filter(Boolean).map(Number);
        if (fn === 'translate') ctx.translate(n[0], n[1] || 0);
        else if (fn === 'rotate') ctx.rotate(n[0] * Math.PI / 180);
        else { ctx.scale(n[0], n.length > 1 ? n[1] : n[0]); k *= n[0]; }
      }
      return k;
    };
    const walk = (node, tone, hair) => {
      for (const el of node.children) {
        ctx.save();
        const k = applyTransform(el.getAttribute('transform'));
        const tag = el.tagName.toLowerCase();
        if (tag === 'g') walk(el, tone, hair / k);
        else if (tag === 'path') {
          const path = new Path2D(el.getAttribute('d'));
          const fill = el.getAttribute('fill');
          if (fill && fill !== 'none') { ctx.fillStyle = tone; ctx.fill(path); }
          else { ctx.strokeStyle = tone; ctx.lineWidth = hair * (+el.getAttribute('stroke-width') || 1); ctx.stroke(path); }
        } else if (tag === 'text') {
          ctx.fillStyle = tone;
          ctx.font = '400 ' + el.getAttribute('font-size') + 'px ' + el.getAttribute('font-family');
          ctx.textAlign = el.getAttribute('text-anchor') === 'middle' ? 'center' : 'left';
          ctx.textBaseline = 'alphabetic';
          ctx.fillText(el.textContent.trim(), +el.getAttribute('x'), +el.getAttribute('y'));
        }
        ctx.restore();
      }
    };
    const strike = (dx, dy, tone) => {
      ctx.save();
      ctx.translate(originX + dx, originY + dy);
      ctx.scale(scale, scale);
      // The symbol strokes with vector-effect:non-scaling-stroke, so the canvas has to divide the
      // weight back out of the transform to match what the SVG sites actually paint.
      walk(crest, tone, 1 / scale);
      ctx.restore();
    };
    strike(1.2, 1.2, '#fff8e4b8'); strike(0, 0, '#7d5f2b8f');
    ctx.globalCompositeOperation='destination-out';ctx.lineWidth=42;ctx.lineCap='round';ctx.lineJoin='round';moved=0;card.classList.remove('scratching');
  }
  function point(e) {const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
  function scratch(e) { if (!drawing || revealed || !ctx) return; const p=point(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();moved+=Math.hypot(p.x-last.x,p.y-last.y);last=p;card.classList.add('scratching'); }
  canvas.addEventListener('pointerdown', e=>{if(revealed||!ctx)return;drawing=true;last=point(e);canvas.setPointerCapture(e.pointerId);ctx.beginPath();ctx.arc(last.x,last.y,21,0,Math.PI*2);ctx.fill();card.classList.add('scratching');});
  canvas.addEventListener('pointermove',scratch);
  function finishScratch(){if(!drawing)return;drawing=false;if(moved>100){const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let empty=0,count=0;for(let i=3;i<pixels.length;i+=64){count++;if(pixels[i]<80)empty++;}if(empty/count>.38)reveal();}}
  canvas.addEventListener('pointerup',finishScratch);canvas.addEventListener('pointercancel',finishScratch);
  // The foil itself provides the keyboard alternative to scratching, without a separate button.
  canvas.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();reveal();}});
  // Assistive technology can activate a button without a physical pointer click.
  canvas.addEventListener('click',e=>{if(e.detail===0)reveal();});
  if(ctx){
    paintFoil();
    // The stamped monogram needs the script face; restrike once it lands, unless scratching began.
    document.fonts?.ready.then(()=>{if(!revealed&&!moved)paintFoil(true)});
    let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(paintFoil,180)});
  }else reveal();
  let venueStarted=false;
  // The drawing's scripts load after this one, so on a slow connection the venue can reach the screen
  // before they have run. The request is then left for venue-drawing.js to pick up when it arrives.
  function startVenue(){if(venueStarted)return;venueStarted=true;if(window.playVenueDrawing)window.playVenueDrawing();else window.venueRequested=true;}
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){startVenue();observer.disconnect();}},{threshold:.2});observer.observe($('#architecture'));}else startVenue();
  $('#redraw').addEventListener('click',()=>window.playVenueDrawing?.());
  // Motion decorates visible content; it never gates reading or intercepts native scrolling.
  if('IntersectionObserver' in window && canMove){
    // One sixteenth of a beat between siblings. Every staggered group used to pick its own interval,
    // which meant no two cascades agreed with each other or with anything audible; a single
    // subdivision makes each of them read as one figure played against the music underneath.
    const STEP=TEMPO.beat*1000/4;
    const plan=[
      ['.photo-invitation','fade',0],
      ['.invitation-letter>*','up',STEP],
      ['.memory-gallery figure','scale',STEP],
      ['.invitation>.disclosure','fade',0],
      ['.invitation blockquote','up',0],
      ['.date-section>.flourish,.date-section>h2,.date-section>h2+p','up',STEP],
      ['.scratch-card','lift',0],
      ['.calendar-actions>*','up',STEP],
      ['.date-section>.disclosure','fade',0],
      ['.countdown-title','up',0],
      ['.countdown>div','up',STEP],
      ['.agenda>.flourish,.agenda>h2,.agenda>h2+p','up',STEP],
      ['.timeline li','up',0],
      ['.agenda>.disclosure','fade',0],
      ['.venue>.flourish,.venue>h2,.venue>h2+p','up',STEP],
      ['.architecture','lift',0],
      ['.drawing-actions','fade',0],
      ['.venue address,.venue>.button,.map-place','up',STEP],
      ['.response>.flourish,.response>h2,.response>h2+p','up',STEP],
      ['.reply-card','lift',0],
      ['.closing>*','up',STEP]
    ];
    const tagged=new WeakSet();
    // Fire as an element's top reaches the lower edge, not a tenth of the way up it, so the
    // reveal has finished by the time the guest is actually reading it.
    // The top margin matters as much as the bottom: coming back up, an element enters from above and
    // would otherwise only start once its foot cleared the top edge, leaving it mid-animation on
    // screen. Pre-triggering on both edges makes the two directions feel identical.
    const revealer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting)entry.target.classList.add('shown');
    }),{rootMargin:'35% 0px 4% 0px'});
    // Scrolling back up should feel the same as scrolling down, so an element that has fully left
    // the viewport is re-armed to return from whichever side it went out. The reset boundary sits
    // well outside the reveal boundary; without that hysteresis it flickers at the edge.
    const rearmer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting)return;
      const el=entry.target;
      el.classList.remove('shown');
      // Read the live rect, not the entry's snapshot: a fast jump can deliver a stale one, which
      // arms the element to return from the side it is no longer on.
      el.style.setProperty('--dir',el.getBoundingClientRect().top>0?'1':'-1');
    }),{rootMargin:'95% 0px 60% 0px'});
    plan.forEach(([selector,kind,step])=>document.querySelectorAll(selector).forEach((el,i)=>{
      if(tagged.has(el))return;
      tagged.add(el);
      el.dataset.reveal=kind;
      // Cap the cascade at four steps, which is exactly one beat: past that a stagger stops reading
      // as rhythm and starts as lag, and it would also spill over the pulse it is counted against.
      if(step)el.style.setProperty('--d',Math.min(i,4)*step+'ms');
      revealer.observe(el);rearmer.observe(el);
    }));
    // The cue falls once every two bars, and this is what puts that fall on a downbeat the guest can
    // actually hear. Seeking is the only way to hold it there: animation-delay would align the loop
    // at the moment it starts and then let it drift, because the cue counts from its own beginning
    // while the score counts from the press. Re-seeking on the same cycle also absorbs the drift
    // between the audio clock and the compositor's. Silence leaves the cue running free -- nothing
    // here depends on the music playing.
    const cueLine=$('.scroll-cue span'),CUE_CYCLE=TEMPO.bar*2*1000;
    function syncCue(){
      if(!cueLine||document.hidden)return;
      const at=Music.position();
      if(at===null)return;
      cueLine.getAnimations({subtree:true}).forEach(a=>{
        if(a.animationName==='cue-fall'||a.animationName==='cue-track'){
          try{a.currentTime=(at*1000)%CUE_CYCLE}catch{}
        }
      });
    }
    syncCue();setInterval(syncCue,CUE_CYCLE);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncCue()});

    // The pen's travel has to be the path's real length. A guessed dasharray shorter than the
    // outline turns a script name into a row of beads, and the outline of nine joined letters is not
    // a number anyone can estimate -- so it is measured here, per name, and handed to the keyframes.
    document.querySelectorAll('.welcome h1 .name-trace').forEach(path => {
      const len = path.getTotalLength();
      if(!len) return;
      path.style.setProperty('--len', len.toFixed(1));
      path.classList.add('traceable');
    });
    // The pen is one CSS pixel wide, written in the font's own units: 2048 units to the em, divided by
    // however many pixels the em is right now. It used to be vector-effect:non-scaling-stroke, which
    // holds the width with no script at all but rebuilds the stroke in screen space on every paint,
    // and that was the most expensive single thing in drawing the names. The type size moves with
    // the viewport, so the width follows it.
    const heading=$('#welcome-title');
    const setPen=()=>{if(heading)heading.style.setProperty('--pen',(2048/parseFloat(getComputedStyle(heading).fontSize)).toFixed(2))};
    setPen();addEventListener('resize',setPen);

    const progress=document.createElement('span');progress.className='scroll-progress';$('.masthead').append(progress);
    const acts=[...document.querySelectorAll('.timeline li')],pan=$('.couple-background'),panFrame=$('.photo-invitation');
    let queued=false;
    function paintScroll(){
      queued=false;
      const view=innerHeight,travel=document.documentElement.scrollHeight-view,middle=view*.46;
      progress.style.scale=(travel>0?Math.min(1,Math.max(0,scrollY/travel)):0)+' 1';
      let nearest=null,smallest=Infinity;
      acts.forEach(act=>{const box=act.getBoundingClientRect(),gap=Math.abs(box.top+box.height/2-middle);
        if(box.bottom>0&&box.top<view&&gap<smallest){smallest=gap;nearest=act;}});
      acts.forEach(act=>{const box=act.getBoundingClientRect();
        act.classList.toggle('is-active',act===nearest);
        act.classList.toggle('is-passed',box.top+box.height/2<middle);});
      const frame=panFrame.getBoundingClientRect();
      if(frame.bottom>0&&frame.top<view)pan.style.objectPosition='center '+(36+(view-frame.top)/(view+frame.height)*14).toFixed(2)+'%';
      // Anything resting in the last screenful can sit below the reveal boundary; show what is
      // actually on screen rather than the whole document, so re-arming still works above.
      if(scrollY>=travel-2)document.querySelectorAll('[data-reveal]:not(.shown)').forEach(el=>{
        const box=el.getBoundingClientRect();
        if(box.top<view&&box.bottom>0)el.classList.add('shown');
      });
    }
    function onScroll(){if(queued)return;queued=true;requestAnimationFrame(paintScroll);}
    addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);paintScroll();

    // Magnolia petals drift over the whole invitation, tying the sections into one garden.
    const sky=$('#petal-drift'),sctx=sky?.getContext('2d');
    if(sctx){
      let petals=[],wide=0,tall=0,drifting=0;
      // The sway completes once every eight bars, and the fall swells gently once a bar, so the
      // drift belongs to the same pulse as everything else rather than running on its own clock.
      const SWAY=TEMPO.bar*8*1000/(Math.PI*2);
      // One gradient per petal, made the first time it is drawn and kept. It is defined in the petal's
      // own coordinates, so it stays right through every translate and rotate; building it fresh for
      // every petal on every frame was twenty allocations a frame for a colour that never changes.
      const sheenFor=r=>{const g=sctx.createLinearGradient(0,-r,0,r);g.addColorStop(0,'#fffdf6');g.addColorStop(1,'#dcc79a');return g;};
      const measure=()=>{const dpr=Math.min(devicePixelRatio||1,2);wide=innerWidth;tall=innerHeight;sky.width=wide*dpr;sky.height=tall*dpr;sctx.setTransform(dpr,0,0,dpr,0,0);};
      const seed=settled=>({x:Math.random()*wide,y:settled?Math.random()*tall:-24,r:3+Math.random()*6,turn:Math.random()*Math.PI*2,spin:(Math.random()-.5)*.014,fall:.14+Math.random()*.34,sway:16+Math.random()*42,phase:Math.random()*Math.PI*2,tint:.16+Math.random()*.3});
      function drift(now){
        drifting=requestAnimationFrame(drift);
        if(document.hidden)return;
        sctx.clearRect(0,0,wide,tall);
        const bar=Music.position();
        const breath=bar===null?1:1+.08*Math.cos(bar/TEMPO.bar*Math.PI*2);
        petals.forEach((p,i)=>{
          p.y+=p.fall*breath;p.turn+=p.spin;
          if(p.y-p.r>tall)petals[i]=seed(false);
          const x=p.x+Math.sin(now/SWAY+p.phase)*p.sway;
          sctx.save();sctx.translate(x,p.y);sctx.rotate(p.turn);sctx.globalAlpha=p.tint;
          sctx.fillStyle=p.sheen||(p.sheen=sheenFor(p.r));sctx.beginPath();sctx.moveTo(0,-p.r);
          sctx.quadraticCurveTo(p.r*.92,-p.r*.18,0,p.r);sctx.quadraticCurveTo(-p.r*.92,-p.r*.18,0,-p.r);
          sctx.fill();sctx.restore();
        });
      }
      function raise(){measure();petals=Array.from({length:innerWidth<700?11:20},()=>seed(true));sky.classList.add('lit');if(!drifting)drifting=requestAnimationFrame(drift);}
      let settleTimer;addEventListener('resize',()=>{clearTimeout(settleTimer);settleTimer=setTimeout(measure,200)});
      window.raisePetals=raise;
      if(intro.hidden)raise();
    }
  }
  const guest=(new URLSearchParams(location.search).get('guest')||'').trim().slice(0,100);if(guest)$('[name=name]').value=guest;
  // Delivery destinations are not supplied yet. Left blank, WhatsApp and the mail client still open
  // with the reply written and let the guest pick the recipient; fill these in to address them.
  const RSVP_WHATSAPP='';   // digits only, with country code, e.g. '94771234567'
  const RSVP_EMAIL='';      // e.g. 'naveen.and.dulanjani@example.com'
  $('#rsvp').addEventListener('submit',e=>{
    e.preventDefault();
    const name=$('[name=name]');name.setCustomValidity(name.value.trim()?'':'Please enter your name.');
    if(!e.target.reportValidity())return;
    const data=new FormData(e.target),note=(data.get('note')||'').trim();
    const message=`Dear Naveen & Dulanjani,\n\n${data.get('name').trim()} — ${data.get('attendance')}.\nWedding: 4 December 2026, Avenra Gardens, Negombo${note?'\n\n'+note:''}`;
    $('#reply-text').textContent=message;
    $('#send-whatsapp').href='https://wa.me/'+RSVP_WHATSAPP+'?text='+encodeURIComponent(message);
    $('#send-email').href='mailto:'+RSVP_EMAIL+'?subject='+encodeURIComponent('RSVP — Naveen & Dulanjani, 4 December 2026')+'&body='+encodeURIComponent(message);
    $('#prepared').hidden=false;
    $('#reply-status').textContent='Your reply is ready. Choose how to send it.';
    $('#prepared').scrollIntoView({block:'nearest',behavior:reduced.matches?'auto':'smooth'});
    $('#send-whatsapp').focus({preventScroll:true});
  });
  $('[name=name]').addEventListener('input',e=>e.target.setCustomValidity(''));
  $('#rsvp').addEventListener('input',()=>{if(!$('#prepared').hidden){$('#prepared').hidden=true;$('#reply-status').textContent='Details changed. Prepare your updated RSVP.';}});
  $('#copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#reply-text').textContent);$('#reply-status').textContent='Copied. Paste your RSVP into a message to the couple.';}catch{const range=document.createRange();range.selectNodeContents($('#reply-text'));getSelection().removeAllRanges();getSelection().addRange(range);$('#reply-status').textContent='Select and copy the highlighted reply.';}});
})();
