(() => {
 // The couple at the head of the letter: a pencil drawing of them in the invitation's gold, made from
 // their photograph under the bell arch, that draws itself when the letter comes into view the way an
 // artist works - a light sketch of its lines first, then their faces, their hair, her arms and his
 // hand, her dress and his shirt, each shaded with strokes that run the way the drawing's own hatching
 // runs. A pencil does it, lifting between strokes and travelling to the next as a hand does. It keeps
 // time with the music: every stage begins on a beat and the faces on a downbeat, and the pencil
 // quickens a little on each beat and eases between. Each stroke uncovers the finished drawing beneath
 // it, so what the pencil leaves is exactly the drawing.
 // couple-strokes.js holds the stages and their strokes (build_assets/trace_drawing.py). A stroke is a
 // string: two characters each for x and y in half-pixels and one for its width in quarter-pixels,
 // then one character each for every step in x and y, offset by 32. The characters are base 64.
 const data=window.COUPLE_STROKES,figure=document.getElementById('couple-drawing'),canvas=document.getElementById('couple-canvas');
 if(!data||!figure||!canvas)return;
 const ctx=canvas.getContext('2d'),mask=document.createElement('canvas'),mtx=mask.getContext('2d');
 if(!ctx||!mtx)return;
 const pencil=figure.querySelector('.couple-pencil'),W=data.width,H=data.height;
 const art=new Image();art.decoding='async';art.src=data.art;
 const ready=new Promise(done=>{if(art.complete&&art.naturalWidth)done();else{art.onload=done;art.onerror=done}});
 const TEMPO=window.invitationTempo||{beat:.6,bar:2.4};
 const B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',V=new Int8Array(128);
 for(let i=0;i<64;i++)V[B64.charCodeAt(i)]=i;
 const at=(s,i)=>V[s.charCodeAt(i)],two=(s,i)=>at(s,i)<<6|at(s,i+1);
 // A stroke takes time in proportion to its length to the power of .8, since a hand slows less than a
 // stroke shortens, and the pencil lifts before it for a moment that grows with how far it travels.
 const LIFT=.35;
 let last=null;
 const stages=data.phases.map(phase=>{
  let clock=0;
  const strokes=phase.strokes.map(s=>{
   const pts=[two(s,0)/2,two(s,2)/2];
   for(let i=5;i<s.length;i+=2)pts.push(pts[pts.length-2]+(at(s,i)-32)/2,pts[pts.length-1]+(at(s,i+1)-32)/2);
   const cum=[0];
   for(let i=2;i<pts.length;i+=2)cum.push(cum[cum.length-1]+Math.hypot(pts[i]-pts[i-2],pts[i+1]-pts[i-1]));
   const len=cum[cum.length-1];
   clock+=last?LIFT*Math.sqrt(Math.hypot(pts[0]-last[0],pts[1]-last[1])):0;
   const a=clock;clock+=Math.pow(Math.max(len,1),.8);
   last=[pts[pts.length-2],pts[pts.length-1]];
   return{pts,cum,len,width:at(s,4)/4,a,b:clock};
  });
  strokes.forEach(s=>{s.a/=clock;s.b/=clock});
  return{beats:phase.beats,span:phase.beats,alpha:phase.alpha,strokes};
 });
 // The pencil quickens on every beat and eases between, as a hand keeps time. A whole beat still
 // takes a beat, so every stage begins and ends on one.
 const PULSE=.32,keepTime=b=>b+PULSE/(2*Math.PI)*Math.sin(2*Math.PI*b),ease=f=>.5-.5*Math.cos(Math.PI*f);
 let starts=[],total=0;
 function schedule(beatInBar){
  // The sketch runs to the first downbeat at least three beats away, so the faces begin on one.
  if(beatInBar!==null){const k=(4-beatInBar)%4;stages[0].span=k<3?k+4:k}
  starts=[];total=0;
  stages.forEach(st=>{starts.push(total);total+=st.span});
 }
 function at_(s,f){
  const target=f*s.len;let i=1;
  while(i<s.cum.length-1&&s.cum[i]<target)i++;
  const l0=s.cum[i-1],l1=s.cum[i],t=l1>l0?(target-l0)/(l1-l0):0;
  return[s.pts[2*i-2]+(s.pts[2*i]-s.pts[2*i-2])*t,s.pts[2*i-1]+(s.pts[2*i+1]-s.pts[2*i-1])*t];
 }
 // Lay graphite along a stroke from one fraction of its length to another. The light sketch is laid
 // with square ends, so the pieces a stroke is drawn in over several frames meet without darkening.
 function lay(s,alpha,f0,f1){
  const L0=f0*s.len,L1=f1*s.len,p0=at_(s,f0),p1=at_(s,f1);
  mtx.globalAlpha=alpha;mtx.lineWidth=s.width;mtx.lineCap=alpha<1?'butt':'round';
  mtx.beginPath();mtx.moveTo(p0[0],p0[1]);
  for(let i=1;i<s.cum.length-1;i++){if(s.cum[i]<=L0)continue;if(s.cum[i]>=L1)break;mtx.lineTo(s.pts[2*i],s.pts[2*i+1])}
  mtx.lineTo(p1[0],p1[1]);mtx.stroke();
 }
 let si=0,ki=0,laid=0,pen=null,aim=null,lift=0,frame=0,lead=0,began=0,playing=false,done=false,beatsNow=0,lastNow=0;
 // Move the pencil on to `b` beats (already kept in time), laying every stroke it passes.
 function advance(b){
  while(si<stages.length){
   const st=stages[si],u=(b-starts[si])/st.span,S=st.strokes;
   if(u<=0)return;
   while(ki<S.length){
    const s=S[ki];
    if(u<s.a){
     // Lifted, on its way to this stroke.
     const from=ki?S[ki-1].b:0,g=s.a>from?(u-from)/(s.a-from):1,e=ease(Math.min(1,Math.max(0,g)));
     const p=pen||[s.pts[0],s.pts[1]];
     aim=[p[0]+(s.pts[0]-p[0])*e,p[1]+(s.pts[1]-p[1])*e];lift=Math.sin(Math.PI*Math.min(1,g));
     return;
    }
    const f=u>=s.b?1:ease((u-s.a)/(s.b-s.a));
    if(f>laid){lay(s,st.alpha,laid,f);laid=f}
    lift=0;
    if(f<1){aim=at_(s,f);return}
    pen=aim=[s.pts[s.pts.length-2],s.pts[s.pts.length-1]];ki++;laid=0;
   }
   si++;ki=0;
  }
 }
 function size(){
  const box=figure.getBoundingClientRect();if(!box.width)return false;
  const dpr=Math.min(window.devicePixelRatio||1,2.5);
  canvas.width=mask.width=Math.round(box.width*dpr);canvas.height=mask.height=Math.round(box.height*dpr);
  const k=canvas.width/W;
  ctx.setTransform(k,0,0,k,0,0);mtx.setTransform(k,0,0,k,0,0);
  mtx.strokeStyle='#000';mtx.lineJoin='round';
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
 // The pencil's point follows the stroke a breath behind, so it glides rather than jumps; it leans
 // a little with the hand's movement, and lifts between strokes.
 let shown=null,tilt=0;
 function placePencil(dt){
  if(!pencil||!aim)return;
  const k=figure.clientWidth/W,x=aim[0]*k,y=aim[1]*k;
  if(!shown)shown=[x,y];
  const g=1-Math.exp(-dt/.028),vx=(x-shown[0]);
  shown=[shown[0]+(x-shown[0])*g,shown[1]+(y-shown[1])*g];
  tilt+=(Math.max(-1,Math.min(1,vx/12))*6-tilt)*Math.min(1,dt*10);
  pencil.style.transform=`translate(${shown[0].toFixed(1)}px,${shown[1].toFixed(1)}px)`;
  pencil.style.setProperty('--lift',lift.toFixed(2));
  pencil.style.setProperty('--tilt',tilt.toFixed(1)+'deg');
 }
 function finish(){
  cancelAnimationFrame(frame);clearTimeout(lead);playing=false;done=true;
  if(size())compose();
  // The pencil is lifted away from the finished drawing.
  if(pencil&&shown){pencil.style.setProperty('--lift',1);pencil.style.transform=`translate(${(shown[0]+36).toFixed(1)}px,${(shown[1]-44).toFixed(1)}px)`}
  figure.classList.remove('is-drawing');figure.classList.add('is-drawn');
 }
 function tick(now){
  const dt=Math.min(.1,(now-lastNow)/1000);lastNow=now;
  beatsNow=Math.min(total,(now-began)/1000/TEMPO.beat);
  advance(keepTime(beatsNow));compose();placePencil(dt);
  if(beatsNow<total)frame=requestAnimationFrame(tick);else finish();
 }
 async function play(){
  cancelAnimationFrame(frame);clearTimeout(lead);
  await ready;
  if(!art.naturalWidth||!size())return;
  si=ki=0;laid=0;pen=aim=shown=null;lift=tilt=0;done=false;
  figure.classList.remove('is-drawn');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return}
  compose();
  // As with the venue, the first stroke waits for the next beat of the music (never more than 0.6s),
  // and the sketch is timed from where in the bar that beat falls.
  const wait=(window.untilNextBeat?.()||0)*1000;
  const go=()=>{
   const t=window.musicPosition?.();
   schedule(t==null?null:Math.round(t/TEMPO.beat)%4);
   figure.classList.add('is-drawing');playing=true;
   began=lastNow=performance.now();frame=requestAnimationFrame(tick);
  };
  if(wait>30)lead=setTimeout(go,wait);else go();
 }
 // A new size clears both canvases, so the pencil's work so far is laid again at once.
 function redraw(){
  if(!size())return;
  if(done||!playing){compose();return}
  si=ki=0;laid=0;pen=null;advance(keepTime(beatsNow));compose();
 }
 let started=false;
 const begin=()=>{if(!started){started=true;play()}};
 if('IntersectionObserver' in window){const seen=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){begin();seen.disconnect()}},{threshold:.3});seen.observe(figure)}else begin();
 // A tap draws them again.
 figure.addEventListener('click',()=>{if(started&&!playing)play()});
 if('ResizeObserver' in window){let lastW=0;new ResizeObserver(()=>{const w=figure.clientWidth;if(w&&w!==lastW){lastW=w;if(started&&art.naturalWidth)redraw()}}).observe(figure)}
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)finish()});
})();
