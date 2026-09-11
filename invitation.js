(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // The door ritual precedes the continuous document; it never replaces native scrolling.
  const intro=$('#door-intro'),openButton=$('#open-doors'),skipButton=$('#skip-doors');
  const outside=[...document.body.children].filter(el=>el!==intro&&!['SCRIPT','STYLE','NOSCRIPT'].includes(el.tagName));
  let introTimer,opening=false,returnHash=location.hash;
  function finishIntro(){clearTimeout(introTimer);intro.hidden=true;opening=false;intro.classList.remove('opening');document.body.classList.remove('intro-locked','intro-opening');outside.forEach(el=>el.inert=false);const target=document.getElementById(returnHash.slice(1))||$('#welcome');target.scrollIntoView({behavior:'instant',block:'start'});const heading=target.querySelector('h1,h2')||$('#welcome-title');heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
  function openIntro(skip=false){if(skip||reduced.matches){finishIntro();return}if(opening)return;opening=true;intro.classList.add('opening');document.body.classList.add('intro-opening');skipButton.focus();introTimer=setTimeout(finishIntro,4900);}
  function showIntro(){clearTimeout(introTimer);opening=false;intro.classList.remove('opening');document.body.classList.remove('intro-opening');window.scrollTo({top:0,behavior:'instant'});intro.hidden=false;outside.forEach(el=>el.inert=true);document.body.classList.add('intro-locked');openButton.focus({preventScroll:true});}
  openButton.addEventListener('click',()=>openIntro());skipButton.addEventListener('click',()=>openIntro(true));
  intro.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();openIntro(true)}if(e.key==='Tab'){e.preventDefault();(opening||document.activeElement===openButton?skipButton:openButton).focus();}});
  const replay=document.createElement('button');replay.className='intro-replay';replay.textContent='Replay the opening';replay.addEventListener('click',()=>{returnHash='#welcome';showIntro()});$('.closing').append(replay);
  showIntro();
  // Only the date is confirmed. Calendar entries remain all-day until timing is supplied.
  const weddingDay = new Date('2026-12-04T00:00:00+05:30').getTime();
  function countdown() {
    const delta = Math.max(0, Math.floor((weddingDay - Date.now()) / 1000));
    const values = [Math.floor(delta / 86400), Math.floor(delta / 3600) % 24, Math.floor(delta / 60) % 60, delta % 60];
    ['days', 'hours', 'minutes', 'seconds'].forEach((id, i) => { $('#' + id).textContent = String(values[i]).padStart(2, '0'); });
    if (!delta) $('#countdown-note').textContent = Date.now() < weddingDay + 86400000 ? 'Today is our wedding day!' : 'Thank you for celebrating this beautiful chapter with us.';
  }
  countdown(); setInterval(countdown, 1000);
  $('#ical').addEventListener('click', () => {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const text = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Naveen and Dulanjani//Wedding//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:naveen-dulanjani-20261204@invitation.local','DTSTAMP:' + stamp,'DTSTART;VALUE=DATE:20261204','DTEND;VALUE=DATE:20261205','SUMMARY:Naveen & Dulanjani Wedding','LOCATION:Avenra Gardens\\, Negombo\\, Sri Lanka','DESCRIPTION:Ceremony time to be confirmed.','END:VEVENT','END:VCALENDAR',''].join('\r\n');
    const url = URL.createObjectURL(new Blob([text], {type:'text/calendar;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = 'Naveen-and-Dulanjani-4-December-2026.ics'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
  });
  const card = $('#scratch-card'), canvas = $('#scratch'), ctx = canvas.getContext('2d');
  let revealed = false, drawing = false, last = null, moved = 0;
  function reveal() { if (revealed) return; revealed = true; drawing = false; card.classList.add('revealed'); $('#reveal-date').textContent = 'Revealed: 4 December 2026'; $('#reveal-date').disabled = true; $('#scratch-status').textContent = 'Friday, 4 December 2026. Ceremony time to be announced.'; }
  function paintFoil() {
    if (!ctx || revealed) return;
    const rect = card.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width; canvas.height = height; ctx.setTransform(dpr,0,0,dpr,0,0); ctx.globalCompositeOperation = 'source-over';
    const gold = ctx.createLinearGradient(0,0,rect.width,rect.height); gold.addColorStop(0,'#b7995b'); gold.addColorStop(.3,'#ead5a3'); gold.addColorStop(.55,'#c7a56a'); gold.addColorStop(.8,'#eddbb6'); gold.addColorStop(1,'#ad8c4f'); ctx.fillStyle = gold; ctx.fillRect(0,0,rect.width,rect.height);
    ctx.strokeStyle = '#785b3470';ctx.lineWidth=1;ctx.strokeRect(12,12,rect.width-24,rect.height-24);ctx.strokeRect(17,17,rect.width-34,rect.height-34);ctx.globalCompositeOperation='destination-out';ctx.lineWidth=42;ctx.lineCap='round';ctx.lineJoin='round';moved=0;card.classList.remove('scratching');
  }
  function point(e) {const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
  function scratch(e) { if (!drawing || revealed || !ctx) return; const p=point(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();moved+=Math.hypot(p.x-last.x,p.y-last.y);last=p;card.classList.add('scratching'); }
  canvas.addEventListener('pointerdown', e=>{if(revealed||!ctx)return;drawing=true;last=point(e);canvas.setPointerCapture(e.pointerId);ctx.beginPath();ctx.arc(last.x,last.y,21,0,Math.PI*2);ctx.fill();card.classList.add('scratching');});
  canvas.addEventListener('pointermove',scratch);
  function finishScratch(){if(!drawing)return;drawing=false;if(moved>100){const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let empty=0,count=0;for(let i=3;i<pixels.length;i+=64){count++;if(pixels[i]<80)empty++;}if(empty/count>.38)reveal();}}
  canvas.addEventListener('pointerup',finishScratch);canvas.addEventListener('pointercancel',finishScratch);$('#reveal-date').addEventListener('click',reveal);
  if(ctx){paintFoil();let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(paintFoil,180)});}else reveal();
  let venueStarted=false;
  function startVenue(){if(venueStarted)return;venueStarted=true;window.playVenueDrawing?.();}
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){startVenue();observer.disconnect();}},{threshold:.2});observer.observe($('#architecture'));}else startVenue();
  $('#redraw').addEventListener('click',()=>window.playVenueDrawing?.());
  // Motion decorates visible content; it never gates reading or intercepts native scrolling.
  if('IntersectionObserver' in window && !reduced.matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.animate?.([{opacity:.5,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,easing:'cubic-bezier(.16,1,.3,1)'});observer.unobserve(entry.target);}}),{threshold:.2});document.querySelectorAll('.invitation-letter,.memory-gallery,.timeline,.reply-card').forEach(el=>observer.observe(el));}
  const guest=(new URLSearchParams(location.search).get('guest')||'').trim().slice(0,100);if(guest)$('[name=name]').value=guest;
  document.querySelectorAll('[name=attendance]').forEach(input=>input.addEventListener('change',()=>{$('#guest-field').hidden=$('[name=attendance]:checked')?.value==='Regretfully declines';}));
  $('#rsvp').addEventListener('submit',e=>{e.preventDefault();if(!e.target.reportValidity())return;const data=new FormData(e.target);$('#reply-text').textContent=`Dear Naveen & Dulanjani,\n\n${data.get('name')} — ${data.get('attendance')}.\nWedding: 4 December 2026\nGuests: ${data.get('attendance')==='Regretfully declines'?'0':data.get('guests')}${data.get('note')?'\n\n'+data.get('note'):''}`;$('#prepared').hidden=false;$('#reply-status').textContent='Your reply is ready to copy. Nothing has been sent.';$('#prepared').scrollIntoView({block:'nearest',behavior:reduced.matches?'auto':'smooth'});});
  $('#copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#reply-text').textContent);$('#reply-status').textContent='Copied. Paste your RSVP into a message to the couple.';}catch{const range=document.createRange();range.selectNodeContents($('#reply-text'));getSelection().removeAllRanges();getSelection().addRange(range);$('#reply-status').textContent='Select and copy the highlighted reply.';}});
})();
