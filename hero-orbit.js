// Escultura generativa de filamentos e esferas, sensível ao cursor e ao scroll.
(() => {
  const hero = document.querySelector('.hero');
  const canvas = document.getElementById('hero-motion-canvas');
  if (!hero || !canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let w=1,h=1,dpr=1,raf=0,visible=true,scroll=0;
  const mouse={x:0,y:0,tx:0,ty:0};
  const rnd=n=>{const t=Math.sin(n*127.1+72.3)*43758.5453;return t-Math.floor(t);};
  function resize(){
    const r=canvas.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);
    dpr=Math.min(devicePixelRatio||1,1.6);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);draw(0);
  }
  function sphere(x,y,r){
    const g=ctx.createRadialGradient(x-r*.32,y-r*.38,r*.03,x,y,r);
    g.addColorStop(0,'#fff');g.addColorStop(.21,'#fafafa');g.addColorStop(.43,'#a3a4a5');g.addColorStop(.72,'#44484b');g.addColorStop(1,'#d7d8d7');
    ctx.save();ctx.shadowColor='rgba(55,55,55,.18)';ctx.shadowBlur=r*.7;
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.65)';ctx.lineWidth=.8;ctx.stroke();ctx.restore();
  }
  function draw(t){
    ctx.clearRect(0,0,w,h);
    const mobile=w<650,cx=w*(mobile?.62:.735)+mouse.x*(mobile?12:55),cy=h*(mobile?.69:.48)+mouse.y*39-scroll*21;
    const scale=Math.min(w*(mobile?.65:.35),h*(mobile?.40:.46));
    const time=reduced.matches?0:t*.00022,twist=mouse.x*.42+scroll*.46+Math.sin(time)*.12;
    const strands=mobile?32:60,steps=mobile?80:118;
    for(let k=0;k<strands;k++){
      const v=k/(strands-1),offset=(v-.5)*2;
      ctx.beginPath();
      for(let i=0;i<=steps;i++){
        const u=i/steps,a=(u*3.4+twist)*Math.PI,wide=Math.sin(u*Math.PI)*scale;
        const x=cx+(u-.5)*scale*2.1+Math.cos(a+offset*1.7)*wide*.49+offset*scale*.18;
        const y=cy+Math.sin(a+offset*2.3)*wide*.48+Math.sin(u*10+offset*2+time)*scale*.095+offset*scale*.32;
        if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      const strength=1-Math.abs(offset)*.7;
      ctx.strokeStyle=k%7===0?`rgba(62,62,66,${.32*strength})`:`rgba(104,105,109,${.16*strength})`;
      ctx.lineWidth=k%7===0?1.1:.65;ctx.stroke();
    }
    for(let j=0;j<15;j++){
      const radius=scale*(.52+j*.043),tilt=j*.28+twist;
      ctx.save();ctx.translate(cx,cy);ctx.rotate(tilt);
      ctx.beginPath();ctx.ellipse(0,0,radius,radius*(.22+.11*Math.sin(j)),0,0,Math.PI*2);
      ctx.strokeStyle=`rgba(70,70,74,${.09+(j%4===0?.20:0)})`;
      ctx.lineWidth=j%5===0?1.15:.65;ctx.stroke();ctx.restore();
    }
    const dots=[];
    for(let i=0;i<(mobile?46:94);i++){
      const a=rnd(i+7)*Math.PI*2+twist*.45,z=.35+rnd(i+47)*1.2;
      dots.push({x:cx+Math.cos(a)*scale*z*1.14+(rnd(i+90)-.5)*scale*.5,y:cy+Math.sin(a*1.45+i*.13)*scale*z*.75,r:(.9+rnd(i+140)*2.4)*z,z});
    }
    dots.forEach((p,i)=>{
      if(i%4===0)for(let j=i+1;j<dots.length;j+=7){
        const q=dots[j],dist=Math.hypot(p.x-q.x,p.y-q.y);
        if(dist<scale*.6){ctx.strokeStyle=`rgba(83,84,86,${(1-dist/(scale*.6))*.23})`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
      }
      if(i%11===0)sphere(p.x,p.y,p.r*2.5);
      else{ctx.fillStyle=`rgba(68,70,73,${.22+p.z*.27})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r*.55,0,Math.PI*2);ctx.fill();}
    });
    sphere(cx-scale*.22,cy-scale*.03,scale*.23);
    sphere(cx+scale*.62,cy-scale*.44,scale*.12);
    sphere(cx+scale*.72,cy+scale*.42,scale*.065);
  }
  function frame(t){raf=requestAnimationFrame(frame);mouse.x+=(mouse.tx-mouse.x)*.065;mouse.y+=(mouse.ty-mouse.y)*.065;draw(t);}
  function start(){cancelAnimationFrame(raf);raf=0;if(visible&&!document.hidden&&!reduced.matches)raf=requestAnimationFrame(frame);else draw(0);}
  hero.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=hero.getBoundingClientRect();mouse.tx=((e.clientX-r.left)/r.width-.5)*2;mouse.ty=((e.clientY-r.top)/r.height-.5)*2;},{passive:true});
  hero.addEventListener('pointerleave',()=>{mouse.tx=0;mouse.ty=0;});
  window.addEventListener('scroll',()=>{const r=hero.getBoundingClientRect();scroll=Math.max(-1,Math.min(1,-r.top/Math.max(r.height,1)));if(reduced.matches)draw(0);},{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',start);
  if('IntersectionObserver' in window)new IntersectionObserver(e=>{visible=e[0].isIntersecting;start();}).observe(hero);
  if(reduced.addEventListener)reduced.addEventListener('change',start);
  resize();start();
})();
