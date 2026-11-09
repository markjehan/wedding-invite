(() => {
 // The couple at the head of the letter, drawn live as the venue is: the pen goes round the two of
 // them, then the edges between their parts and the lines of their faces and hands, then their hair,
 // then the shading in bands down the figures - dots for skin, lines that thicken in shadow for their
 // clothes. couple-strokes.js holds the strokes, made by build_assets/engrave_couple.py from their
 // photograph under the bell arch. Each stroke is a string: its first point in quarter-pixels of the
 // photograph (two characters each for x and y, base 64) and its pen width in twentieths of a pixel,
 // then three characters for each next point - the step in x and in y, offset by 32, and the width.
 const data=window.COUPLE_STROKES,figure=document.getElementById('couple-drawing'),canvas=document.getElementById('couple-canvas');
 if(!data||!figure||!canvas)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const nib=figure.querySelector('.couple-nib'),W=data.width;
 // Four bars of the score. Each layer of the drawing takes its share of them (the outline about a tenth,
 // the shading two fifths), and within a layer the pen moves at an even pace.
 const DRAW_MS=(window.invitationTempo?.bar||2.4)*4*1000;
 const B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',V=new Int8Array(128);
 for(let i=0;i<64;i++)V[B64.charCodeAt(i)]=i;
 const at=(s,i)=>V[s.charCodeAt(i)];
 // Segments, seven numbers each: x0, y0, x1, y1, pen width, and when the pen starts and finishes it.
 let count=0;
 data.layers.forEach(layer=>layer.strokes.forEach(s=>{count+=(s.length-5)/3}));
 const seg=new Float32Array(count*7);
 let n=0,start=0;
 data.layers.forEach(layer=>{
  const walk=visit=>layer.strokes.forEach(s=>{
   let x=(at(s,0)<<6|at(s,1))/4,y=(at(s,2)<<6|at(s,3))/4,w=at(s,4)*.05;
   for(let i=5;i<s.length;i+=3){
    const nx=x+(at(s,i)-32)/4,ny=y+(at(s,i+1)-32)/4,nw=at(s,i+2)*.05;
    // A dot is a step too small to see; it is still given a moment of the pen's time.
    visit(x,y,nx,ny,(w+nw)/2,Math.max(Math.hypot(nx-x,ny-y),.8));
    x=nx;y=ny;w=nw;
   }
  });
  let total=0;walk((x0,y0,x1,y1,w,len)=>{total+=len});
  let run=0;
  walk((x0,y0,x1,y1,w,len)=>{
   const o=n++*7;
   seg[o]=x0;seg[o+1]=y0;seg[o+2]=x1;seg[o+3]=y1;seg[o+4]=w;
   seg[o+5]=start+layer.share*run/total;run+=len;seg[o+6]=start+layer.share*run/total;
  });
  start+=layer.share;
 });
 let cursor=0,from=null,progress=0,frame=0,lead=0,began=0,playing=false,scale=1,thinnest=.3;
 function size(){
  const box=figure.getBoundingClientRect();if(!box.width)return false;
  const dpr=Math.min(window.devicePixelRatio||1,2.5);
  canvas.width=Math.round(box.width*dpr);canvas.height=Math.round(box.height*dpr);
  scale=canvas.width/W;
  // Pen widths are in pixels of the photograph, so the drawing keeps its weight at any size; only a
  // line finer than a third of a device pixel is held at that, or it would vanish.
  thinnest=.35/scale;
  ctx.setTransform(scale,0,0,scale,0,0);
  ctx.strokeStyle='#977647';ctx.lineCap='round';ctx.lineJoin='round';
  return true;
 }
 // Lay ink up to `upto` (0..1 of the drawing), carrying on from where the pen stopped last frame.
 function inkTo(upto){
  let width=-1,open=false,x=0,y=0;
  const flush=()=>{if(open){ctx.stroke();open=false}};
  while(cursor<n){
   const o=cursor*7;if(seg[o+5]>=upto)break;
   const done=seg[o+6]<=upto,f=done?1:(upto-seg[o+5])/(seg[o+6]-seg[o+5]);
   const ax=from?from[0]:seg[o],ay=from?from[1]:seg[o+1];
   x=seg[o]+(seg[o+2]-seg[o])*f;y=seg[o+1]+(seg[o+3]-seg[o+1])*f;
   const w=Math.max(seg[o+4],thinnest);
   if(Math.abs(w-width)>.01){flush();width=w;ctx.lineWidth=w}
   if(!open){ctx.beginPath();open=true}
   ctx.moveTo(ax,ay);ctx.lineTo(x,y);
   if(done){cursor++;from=null}else{from=[x,y];break}
  }
  flush();
  if(nib&&cursor<n){const k=figure.clientWidth/W;nib.style.transform=`translate(${(x*k).toFixed(1)}px,${(y*k).toFixed(1)}px)`}
 }
 function redraw(){if(!size())return;cursor=0;from=null;inkTo(progress)}
 function finish(){cancelAnimationFrame(frame);clearTimeout(lead);playing=false;progress=1;inkTo(1.01);figure.classList.remove('is-drawing');figure.classList.add('is-drawn')}
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
 if('IntersectionObserver' in window){const seen=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){begin();seen.disconnect()}},{threshold:.3});seen.observe(figure)}else begin();
 // A tap draws them again.
 figure.addEventListener('click',()=>{if(started&&!playing)play()});
 if('ResizeObserver' in window){let last=0;new ResizeObserver(()=>{const w=figure.clientWidth;if(w&&w!==last){last=w;if(started)redraw()}}).observe(figure)}
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)finish()});
})();
