// Rede interativa de pontos e linhas. Fundo leve e desacoplado do conteúdo.
(() => {
  const canvas = document.createElement('canvas');
  canvas.className = 'ds-interactive-background';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const pointer = { x:-1000, y:-1000, active:false };
  let width=0, height=0, ratio=1, points=[], frameId=null, inView=true;
  let scrollShift=0, lastFrame=0;

  function resize() {
    width=window.innerWidth;
    height=window.innerHeight;
    ratio=Math.min(window.devicePixelRatio||1,1.6);
    canvas.width=Math.round(width*ratio);
    canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    const count=Math.min(coarse?36:78,Math.max(22,Math.round(width*height/(coarse?22000:15500))));
    points=Array.from({length:count},(_,i)=>({
      x:(i*97.13%count)/count*width,
      y:(i*67.71%count)/count*height,
      driftX:Math.sin(i*8.21)*(.16+(i%4)*.08),
      driftY:Math.cos(i*5.13)*(.13+(i%3)*.07),
      phase:i*2.39,
      size:i%7===0?2.4:1.2,
      glow:i%5===0
    }));
    draw(0);
  }

  function draw(timestamp) {
    ctx.clearRect(0,0,width,height);
    const time=reduced?0:timestamp*.001;
    const positions=points.map(p=>{
      const driftX=Math.sin(time*.45+p.phase)*14;
      const driftY=Math.cos(time*.35+p.phase)*11;
      let x=p.x+driftX+Math.sin(scrollShift*.008+p.phase)*12;
      let y=p.y+driftY+scrollShift*.025;
      y=(y%height+height)%height;
      if(pointer.active && !reduced) {
        const dx=x-pointer.x,dy=y-pointer.y;
        const distance=Math.hypot(dx,dy);
        if(distance<165 && distance>0.1) {
          const force=Math.pow(1-distance/165,2)*72;
          x+=dx/distance*force;
          y+=dy/distance*force;
        }
      }
      return {x,y,p};
    });
    for(let i=0;i<positions.length;i++){
      for(let j=i+1;j<positions.length;j++){
        const a=positions[i],b=positions[j],distance=Math.hypot(a.x-b.x,a.y-b.y);
        const limit=coarse?150:190;
        if(distance>limit)continue;
        const alpha=(1-distance/limit)*.3;
        ctx.strokeStyle='rgba(115,220,226,'+alpha.toFixed(3)+')';
        ctx.lineWidth=.7;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
    }
    for(const v of positions){
      ctx.beginPath();
      ctx.fillStyle=v.p.glow?'rgba(60,226,227,.9)':'rgba(124,195,201,.55)';
      ctx.shadowColor=v.p.glow?'#30d9dd':'transparent';
      ctx.shadowBlur=v.p.glow?9:0;
      ctx.arc(v.x,v.y,v.p.size,0,Math.PI*2);
      ctx.fill();
    }
    ctx.shadowBlur=0;
  }

  function loop(timestamp){
    if(!inView || document.hidden) { frameId=null;return; }
    frameId=requestAnimationFrame(loop);
    if(timestamp-lastFrame<33)return;
    lastFrame=timestamp;
    draw(timestamp);
  }
  function restart(){
    if(frameId!==null){cancelAnimationFrame(frameId);frameId=null;}
    if(reduced){draw(0);return;}
    if(!document.hidden && inView)frameId=requestAnimationFrame(loop);
  }
  if(!coarse){
    window.addEventListener('pointermove',event=>{
      pointer.x=event.clientX;pointer.y=event.clientY;pointer.active=true;
      if(reduced)draw(0);
    },{passive:true});
    document.addEventListener('pointerleave',()=>{pointer.active=false;},{passive:true});
  }
  window.addEventListener('scroll',()=>{scrollShift=window.scrollY;},{passive:true});
  window.addEventListener('resize',()=>{resize();restart();},{passive:true});
  document.addEventListener('visibilitychange',restart);
  resize();restart();
})();
