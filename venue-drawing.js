(() => {
 const data=window.AVENRA_STROKES,canvas=document.getElementById('venue-canvas'),stage=document.getElementById('architecture'),button=document.getElementById('venue-photo');
 if(!data||!canvas)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 let frame=0,started=0,cursor=0,playing=false,lead=0;
 // Three bars of the score at 100bpm. This is the longest single move in the invitation and so the
 // one most worth putting on the grid: started on a beat, it also finishes on a downbeat.
 const DRAW_MS=(window.invitationTempo?.bar||2.4)*3*1000;
 const segments=[];let total=0;
 for(const path of data.paths){for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);segments.push({a,b,start:total,length});total+=length}}
 function setup(){canvas.width=data.width;canvas.height=data.height;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#977647';ctx.lineWidth=1.1;ctx.lineCap='round';ctx.lineJoin='round'}
 function tick(now){const t=Math.min(1,(now-started)/DRAW_MS),limit=total*(1-Math.pow(1-t,1.5));ctx.beginPath();while(cursor<segments.length&&segments[cursor].start<limit){const s=segments[cursor++];ctx.moveTo(...s.a);ctx.lineTo(...s.b)}ctx.stroke();if(t<1){frame=requestAnimationFrame(tick)}else{playing=false;stage.classList.remove('is-drawing');stage.classList.add('is-drawn')}}
 window.playVenueDrawing=()=>{
  cancelAnimationFrame(frame);clearTimeout(lead);
  stage.classList.remove('show-photo','is-drawn');button.setAttribute('aria-pressed','false');button.textContent='See the real venue';
  setup();cursor=0;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){stage.classList.add('is-drawn');return}
  stage.classList.add('is-drawing');playing=true;
  // Wait out the remainder of the current beat so the first stroke lands on the pulse. The wait is
  // never more than 0.6s, and with the music off there is nothing to wait for: it starts at once.
  const wait=(window.untilNextBeat?.()||0)*1000;
  const go=()=>{started=performance.now();frame=requestAnimationFrame(tick)};
  if(wait>30)lead=setTimeout(go,wait);else go();
 };
 button.addEventListener('click',()=>{const show=!stage.classList.contains('show-photo');stage.classList.toggle('show-photo',show);button.setAttribute('aria-pressed',String(show));button.textContent=show?'Return to the sketch':'See the real venue'});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){cancelAnimationFrame(frame);clearTimeout(lead);playing=false;stage.classList.remove('is-drawing');stage.classList.add('is-drawn')}});
})();
