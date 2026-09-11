(() => {
 const data=window.AVENRA_STROKES,canvas=document.getElementById('venue-canvas'),stage=document.getElementById('architecture'),button=document.getElementById('venue-photo');
 if(!data||!canvas)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 let frame=0,started=0,cursor=0,playing=false;
 const segments=[];let total=0;
 for(const path of data.paths){for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);segments.push({a,b,start:total,length});total+=length}}
 function setup(){canvas.width=data.width;canvas.height=data.height;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#977647';ctx.lineWidth=1.1;ctx.lineCap='round';ctx.lineJoin='round'}
 function tick(now){const t=Math.min(1,(now-started)/6500),limit=total*(1-Math.pow(1-t,1.5));ctx.beginPath();while(cursor<segments.length&&segments[cursor].start<limit){const s=segments[cursor++];ctx.moveTo(...s.a);ctx.lineTo(...s.b)}ctx.stroke();if(t<1){frame=requestAnimationFrame(tick)}else{playing=false;stage.classList.remove('is-drawing');stage.classList.add('is-drawn')}}
 window.playVenueDrawing=()=>{cancelAnimationFrame(frame);stage.classList.remove('show-photo','is-drawn');button.setAttribute('aria-pressed','false');button.textContent='See the real venue';setup();cursor=0;if(matchMedia('(prefers-reduced-motion: reduce)').matches){stage.classList.add('is-drawn');return}stage.classList.add('is-drawing');playing=true;started=performance.now();frame=requestAnimationFrame(tick)};
 button.addEventListener('click',()=>{const show=!stage.classList.contains('show-photo');stage.classList.toggle('show-photo',show);button.setAttribute('aria-pressed',String(show));button.textContent=show?'Return to the sketch':'See the real venue'});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){cancelAnimationFrame(frame);playing=false;stage.classList.remove('is-drawing');stage.classList.add('is-drawn')}});
})();
