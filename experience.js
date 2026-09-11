(() => {
  const card = document.querySelector('.keepsake');
  const canvas = document.getElementById('keepsake-foil');
  const button = document.getElementById('reveal-keepsake');
  const ctx = canvas.getContext('2d');
  let revealed = false;
  let last = null;
  const touched = new Set();
  function reveal() {
    revealed = true;
    card.classList.add('is-revealed');
    button.textContent = 'Yours to keep, always';
    button.disabled = true;
    document.getElementById('keepsake-status').textContent = 'Keepsake revealed: Of all the days, of all the places, we found each other.';
  }
  function paint() {
    if (!ctx || revealed) return;
    const box = canvas.getBoundingClientRect();
    if (!box.width) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = box.width * dpr;
    canvas.height = box.height * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.globalCompositeOperation = 'source-over';
    const foil = ctx.createLinearGradient(0,0,box.width,box.height);
    foil.addColorStop(0,'#9f844b'); foil.addColorStop(.34,'#e2cfa0'); foil.addColorStop(.53,'#baa06a'); foil.addColorStop(1,'#d8c293');
    ctx.fillStyle=foil; ctx.fillRect(0,0,box.width,box.height);
    ctx.strokeStyle='#fff5d533'; ctx.lineWidth=.5;
    for(let x=0;x<box.width;x+=4) { ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+45,box.height);ctx.stroke(); }
    ctx.fillStyle='#6d542d';ctx.font='36px Italiana, Georgia, serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('N & D',box.width/2,box.height/2);
    touched.clear();
  }
  button.addEventListener('click',reveal);
  if (!ctx) reveal();
  canvas.addEventListener('pointerdown',event => {
    if (revealed) return;
    canvas.setPointerCapture(event.pointerId); last=null; scratch(event);
  });
  function scratch(event) {
    if (!ctx || revealed) return;
    const box=canvas.getBoundingClientRect();
    const p={x:event.clientX-box.left,y:event.clientY-box.top};
    ctx.globalCompositeOperation='destination-out'; ctx.lineWidth=36;ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();ctx.moveTo(last?.x ?? p.x,last?.y ?? p.y);ctx.lineTo(p.x+.1,p.y);ctx.stroke();last=p;
    touched.add(`${Math.floor(p.x/20)},${Math.floor(p.y/20)}`);
    if(touched.size > (box.width*box.height/400)*.25) reveal();
  }
  canvas.addEventListener('pointermove',event=> { if(canvas.hasPointerCapture(event.pointerId)) scratch(event); });
  canvas.addEventListener('pointerup',()=>{last=null;});
  canvas.addEventListener('pointercancel',()=>{last=null;});
  if (window.ResizeObserver) new ResizeObserver(paint).observe(canvas); else window.addEventListener('resize',paint);
  document.fonts?.ready.then(paint); paint();
  document.getElementById('save-date').addEventListener('click',()=>{
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Naveen and Dulanjani//Invitation Demo//EN','BEGIN:VEVENT','UID:naveen-dulanjani-demo-20261018@invitation.local','DTSTAMP:20260911T000000Z','DTSTART:20261018T103000Z','DTEND:20261018T160000Z','SUMMARY:Naveen and Dulanjani - DEMO wedding date','LOCATION:Avenra Gardens - Negombo','DESCRIPTION:Placeholder date for the invitation demo. Please confirm with the couple.','END:VEVENT','END:VCALENDAR'];
    const url=URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download='naveen-dulanjani-demo.ics';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
  });
})();
