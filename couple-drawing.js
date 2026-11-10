(() => {
 // The couple at the head of the letter: a graphite pencil drawing of them, made from their photograph
 // under the bell arch, that draws itself when the letter comes into view. The pencil goes over the
 // drawing's lines first, then shades it in two passes, the first light and diagonal, the second
 // across it to finish. Each stroke uncovers the finished drawing beneath it, so what the pencil
 // leaves behind is the drawing itself. couple-strokes.js holds the paths and names the drawing
 // (build_assets/trace_drawing.py). A line is a string: two characters each for x and y in
 // half-pixels and one for its width in quarter-pixels, then one character each for every step in x
 // and y, offset by 32. A hatching stroke is two characters each for x, y and its length in x and y,
 // the lengths offset by 2048. The characters are base 64.
 const data=window.COUPLE_STROKES,figure=document.getElementById('couple-drawing'),canvas=document.getElementById('couple-canvas');
 if(!data||!figure||!canvas)return;
 const ctx=canvas.getContext('2d'),mask=document.createElement('canvas'),mtx=mask.getContext('2d');
 if(!ctx||!mtx)return;
 const nib=figure.querySelector('.couple-nib'),W=data.width,H=data.height;
 const art=new Image();art.decoding='async';art.src=data.art;
 const ready=new Promise(done=>{if(art.complete&&art.naturalWidth)done();else{art.onload=done;art.onerror=done}});
 // Four bars of the score; each pass takes its share of them and the pencil keeps an even pace within it.
 const DRAW_MS=(window.invitationTempo?.bar||2.4)*4*1000;
 const B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',V=new Int8Array(128);
 for(let i=0;i<64;i++)V[B64.charCodeAt(i)]=i;
 const at=(s,i)=>V[s.charCodeAt(i)],two=(s,i)=>at(s,i)<<6|at(s,i+1);
 // Each layer's strokes as segments: x0, y0, x1, y1, width, opacity, and when the pencil starts and ends it.
 const walk=(layer,visit)=>layer.strokes.forEach(s=>{
  if(layer.kind==='hatch'){const x=two(s,0)/2,y=two(s,2)/2;visit(x,y,x+(two(s,4)-2048)/2,y+(two(s,6)-2048)/2,layer.width);return}
  let x=two(s,0)/2,y=two(s,2)/2;const w=at(s,4)/4;
  for(let i=5;i<s.length;i+=2){const nx=x+(at(s,i)-32)/2,ny=y+(at(s,i+1)-32)/2;visit(x,y,nx,ny,w);x=nx;y=ny}
 });
 let count=0;data.layers.forEach(layer=>walk(layer,()=>count++));
 const seg=new Float32Array(count*8);
 let n=0,start=0;
 data.layers.forEach(layer=>{
  let total=0;walk(layer,(x0,y0,x1,y1)=>{total+=Math.hypot(x1-x0,y1-y0)});
  let run=0;
  walk(layer,(x0,y0,x1,y1,w)=>{
   const o=n++*8,len=Math.hypot(x1-x0,y1-y0);
   seg[o]=x0;seg[o+1]=y0;seg[o+2]=x1;seg[o+3]=y1;seg[o+4]=w;seg[o+5]=layer.alpha;
   seg[o+6]=start+layer.share*run/total;run+=len;seg[o+7]=start+layer.share*run/total;
  });
  start+=layer.share;
 });
 let cursor=0,from=null,progress=0,frame=0,lead=0,began=0,playing=false,done=false;
 function size(){
  const box=figure.getBoundingClientRect();if(!box.width)return false;
  const dpr=Math.min(window.devicePixelRatio||1,2.5);
  canvas.width=mask.width=Math.round(box.width*dpr);canvas.height=mask.height=Math.round(box.height*dpr);
  const k=canvas.width/W;
  ctx.setTransform(k,0,0,k,0,0);mtx.setTransform(k,0,0,k,0,0);
  mtx.strokeStyle='#000';mtx.lineCap='round';mtx.lineJoin='round';
  return true;
 }
 // The drawing, shown only where the pencil has been.
 function compose(){
  ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,W,H);
  ctx.drawImage(art,0,0,W,H);
  if(done)return;
  ctx.globalCompositeOperation='destination-in';
  ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(mask,0,0);
  const k=canvas.width/W;ctx.setTransform(k,0,0,k,0,0);
  ctx.globalCompositeOperation='source-over';
 }
 // Move the pencil on to `upto` (0..1 of the drawing), carrying on from where it stopped last frame.
 function pencilTo(upto){
  let width=-1,alpha=-1,open=false,x=0,y=0;
  const flush=()=>{if(open){mtx.stroke();open=false}};
  while(cursor<n){
   const o=cursor*8;if(seg[o+6]>=upto)break;
   const whole=seg[o+7]<=upto,f=whole?1:(upto-seg[o+6])/(seg[o+7]-seg[o+6]);
   const ax=from?from[0]:seg[o],ay=from?from[1]:seg[o+1];
   x=seg[o]+(seg[o+2]-seg[o])*f;y=seg[o+1]+(seg[o+3]-seg[o+1])*f;
   if(seg[o+4]!==width||seg[o+5]!==alpha){flush();width=seg[o+4];alpha=seg[o+5];mtx.lineWidth=width;mtx.globalAlpha=alpha}
   if(!open){mtx.beginPath();open=true}
   mtx.moveTo(ax,ay);mtx.lineTo(x,y);
   if(whole){cursor++;from=null}else{from=[x,y];break}
  }
  flush();
  if(nib&&cursor<n){const k=figure.clientWidth/W;nib.style.transform=`translate(${(x*k).toFixed(1)}px,${(y*k).toFixed(1)}px)`}
 }
 function finish(){
  cancelAnimationFrame(frame);clearTimeout(lead);playing=false;progress=1;done=true;
  if(size())compose();
  figure.classList.remove('is-drawing');figure.classList.add('is-drawn');
 }
 function tick(now){
  const t=Math.min(1,(now-began)/DRAW_MS);
  progress=1-Math.pow(1-t,1.3);
  pencilTo(progress);compose();
  if(t<1)frame=requestAnimationFrame(tick);else finish();
 }
 async function play(){
  cancelAnimationFrame(frame);clearTimeout(lead);
  await ready;
  if(!art.naturalWidth||!size())return;
  progress=0;cursor=0;from=null;done=false;
  figure.classList.remove('is-drawn');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return}
  mtx.setTransform(1,0,0,1,0,0);mtx.clearRect(0,0,mask.width,mask.height);size();
  compose();
  figure.classList.add('is-drawing');playing=true;
  // As with the venue, the first stroke waits for the next beat of the music (never more than 0.6s).
  const wait=(window.untilNextBeat?.()||0)*1000;
  const go=()=>{began=performance.now();frame=requestAnimationFrame(tick)};
  if(wait>30)lead=setTimeout(go,wait);else go();
 }
 // A new size clears both canvases, so the pencil's work so far is laid again at once.
 function redraw(){if(!size())return;if(done){compose();return}cursor=0;from=null;pencilTo(progress);compose()}
 let started=false;
 const begin=()=>{if(!started){started=true;play()}};
 if('IntersectionObserver' in window){const seen=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){begin();seen.disconnect()}},{threshold:.3});seen.observe(figure)}else begin();
 // A tap draws them again.
 figure.addEventListener('click',()=>{if(started&&!playing)play()});
 if('ResizeObserver' in window){let last=0;new ResizeObserver(()=>{const w=figure.clientWidth;if(w&&w!==last){last=w;if(started&&art.naturalWidth)redraw()}}).observe(figure)}
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)finish()});
})();
