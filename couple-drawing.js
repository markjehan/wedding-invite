(() => {
 // The couple at the head of the letter, engraved from their photograph under the bell arch and drawn
 // live as the venue is: the pen goes round the two of them, then their faces and hands, then lays the
 // shading in bands down the figures. couple-strokes.js holds the strokes, made by
 // build_assets/engrave_couple.py; each is [pen width in tenths of a CSS pixel, x, y, dx, dy, ...] in
 // quarter-pixels of the photograph.
 const data=window.COUPLE_STROKES,figure=document.getElementById('couple-drawing'),canvas=document.getElementById('couple-canvas');
 if(!data||!figure||!canvas)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const nib=figure.querySelector('.couple-nib'),unit=data.unit,W=data.width/unit,H=data.height/unit;
 // Three and a half bars of the score: the outline takes the first fifth, the faces and hands the next,
 // the shading the rest, so the two of them are recognisable well before the last stroke lands.
 const DRAW_MS=(window.invitationTempo?.bar||2.4)*3.5*1000,SHARE=[.2,.22,.58];
 const segs=[];
 let start=0;
 data.layers.forEach((layer,li)=>{
  const strokes=layer.paths.map(p=>{const pts=[];let x=p[1],y=p[2];pts.push(x/unit,y/unit);for(let i=3;i<p.length;i+=2){x+=p[i];y+=p[i+1];pts.push(x/unit,y/unit)}return{width:p[0]/10,pts}});
  let total=0;strokes.forEach(s=>{for(let i=2;i<s.pts.length;i+=2)total+=Math.hypot(s.pts[i]-s.pts[i-2],s.pts[i+1]-s.pts[i-1])});
  let run=0;
  strokes.forEach(s=>{for(let i=2;i<s.pts.length;i+=2){const len=Math.hypot(s.pts[i]-s.pts[i-2],s.pts[i+1]-s.pts[i-1]);
   segs.push({x0:s.pts[i-2],y0:s.pts[i-1],x1:s.pts[i],y1:s.pts[i+1],width:s.width,t0:start+SHARE[li]*run/total,t1:start+SHARE[li]*(run+len)/total});run+=len}});
  start+=SHARE[li];
 });
 let cursor=0,from=null,progress=0,frame=0,lead=0,began=0,playing=false,scale=1,dpr=1;
 function size(){
  const box=figure.getBoundingClientRect();if(!box.width)return false;
  dpr=Math.min(window.devicePixelRatio||1,2.5);
  canvas.width=Math.round(box.width*dpr);canvas.height=Math.round(box.height*dpr);
  scale=canvas.width/W;
  ctx.setTransform(scale,0,0,scale,0,0);
  ctx.strokeStyle='#977647';ctx.lineCap='round';ctx.lineJoin='round';
  return true;
 }
 // Lay ink up to `upto` (0..1 of the drawing), carrying on from where the pen stopped last frame.
 function inkTo(upto){
  let width=-1,open=false,x=0,y=0;
  const flush=()=>{if(open){ctx.stroke();open=false}};
  while(cursor<segs.length&&segs[cursor].t0<upto){
   const s=segs[cursor],done=s.t1<=upto,f=done?1:(upto-s.t0)/(s.t1-s.t0);
   const ax=from?from[0]:s.x0,ay=from?from[1]:s.y0;
   x=s.x0+(s.x1-s.x0)*f;y=s.y0+(s.y1-s.y0)*f;
   if(s.width!==width){flush();width=s.width;ctx.lineWidth=Math.max(width*dpr,.9)/scale}  // never finer than a device pixel, or it greys out
   if(!open){ctx.beginPath();open=true}
   ctx.moveTo(ax,ay);ctx.lineTo(x,y);
   if(done){cursor++;from=null}else{from=[x,y];break}
  }
  flush();
  if(nib&&cursor<segs.length){const k=figure.clientWidth/W;nib.style.transform=`translate(${(x*k).toFixed(1)}px,${(y*k).toFixed(1)}px)`}
 }
 function redraw(){if(!size())return;cursor=0;from=null;inkTo(progress)}
 function finish(){cancelAnimationFrame(frame);clearTimeout(lead);playing=false;progress=1;inkTo(1);figure.classList.remove('is-drawing');figure.classList.add('is-drawn')}
 function tick(now){
  const t=Math.min(1,(now-began)/DRAW_MS);
  progress=1-Math.pow(1-t,1.35);
  inkTo(progress);
  if(t<1)frame=requestAnimationFrame(tick);else finish();
 }
 function play(){
  cancelAnimationFrame(frame);clearTimeout(lead);
  progress=0;figure.classList.remove('is-drawn');
  if(!size())return;
  cursor=0;from=null;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return}
  figure.classList.add('is-drawing');playing=true;
  // As with the venue, the first stroke waits for the next beat of the music (never more than 0.6s).
  const wait=(window.untilNextBeat?.()||0)*1000;
  const go=()=>{began=performance.now();frame=requestAnimationFrame(tick)};
  if(wait>30)lead=setTimeout(go,wait);else go();
 }
 let started=false;
 const begin=()=>{if(!started){started=true;play()}};
 if('IntersectionObserver' in window){const seen=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){begin();seen.disconnect()}},{threshold:.35});seen.observe(figure)}else begin();
 // A tap draws them again.
 figure.addEventListener('click',()=>{if(started&&!playing)play()});
 if('ResizeObserver' in window){let last=0;new ResizeObserver(()=>{const w=figure.clientWidth;if(w&&w!==last){last=w;if(started)redraw()}}).observe(figure)}
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)finish()});
})();
