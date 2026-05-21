/* Foreign · animations.js */
let _af = null;

export function stopAnim() {
  if (_af) { cancelAnimationFrame(_af); _af = null; }
}

export function startAnim(type, canvas) {
  stopAnim();
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const W = canvas.width, H = canvas.height;
  if      (type === 'ocean')   _ocean(ctx, W, H);
  else if (type === 'mist')    _mist(ctx, W, H);
  else if (type === 'stars')   _stars(ctx, W, H);
  else if (type === 'rain')    _rain(ctx, W, H);
  else if (type === 'aurora')  _aurora(ctx, W, H);
  else if (type === 'sakura')  _sakura(ctx, W, H);
  else if (type === 'clouds')  _clouds(ctx, W, H);
  else if (type === 'snow')    _snow(ctx, W, H);
  else if (type === 'forest')  _forest(ctx, W, H);
}

function _ocean(ctx, W, H) {
  const bub = Array.from({length:65}, () => ({
    x:Math.random()*W, y:H+Math.random()*H,
    r:.8+Math.random()*3.5, sp:.3+Math.random()*.9,
    wb:(Math.random()-.5)*.5, ph:Math.random()*Math.PI*2, a:.15+Math.random()*.4
  }));
  let t = 0;
  function d() {
    ctx.clearRect(0,0,W,H); t++;
    for (let i=0;i<6;i++) {
      const sx = W*(.08+i*.17)+Math.sin(t*.007+i)*28;
      const g = ctx.createLinearGradient(sx,0,sx+35,H*.82);
      g.addColorStop(0,'rgba(100,200,255,.08)'); g.addColorStop(1,'rgba(100,200,255,0)');
      ctx.beginPath(); ctx.moveTo(sx-12,0); ctx.lineTo(sx+45,0);
      ctx.lineTo(sx+60,H*.82); ctx.lineTo(sx+8,H*.82); ctx.closePath();
      ctx.fillStyle=g; ctx.fill();
    }
    bub.forEach(b => {
      b.y-=b.sp; b.x+=Math.sin(t*.018+b.ph)*b.wb;
      if(b.y<-10){b.y=H+10; b.x=Math.random()*W;}
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
      ctx.strokeStyle=`rgba(180,230,255,${b.a})`; ctx.lineWidth=.7; ctx.stroke();
    });
    _af = requestAnimationFrame(d);
  } d();
}

function _mist(ctx, W, H) {
  const layers = [
    {y:.42,h:.13,sp:.14,a:.06,c:'195,215,205'},
    {y:.53,h:.11,sp:.10,a:.08,c:'180,210,200'},
    {y:.63,h:.13,sp:.19,a:.07,c:'190,215,205'},
    {y:.71,h:.10,sp:.13,a:.09,c:'200,218,212'},
  ];
  const ff = Array.from({length:12}, () => ({
    x:Math.random()*W, y:H*(.32+Math.random()*.46),
    vx:(Math.random()-.5)*.38, vy:(Math.random()-.5)*.22,
    ph:Math.random()*Math.PI*2, sp:.022+Math.random()*.028
  }));
  let t = 0;
  function d() {
    ctx.clearRect(0,0,W,H); t++;
    layers.forEach(l => {
      const off = (t*l.sp) % W;
      for (let r=0;r<4;r++) {
        const x = -W + r*W*1.1 - off;
        const g = ctx.createLinearGradient(0,H*l.y,0,H*(l.y+l.h));
        g.addColorStop(0,`rgba(${l.c},0)`); g.addColorStop(.5,`rgba(${l.c},${l.a})`); g.addColorStop(1,`rgba(${l.c},0)`);
        ctx.fillStyle=g; ctx.fillRect(x,H*l.y,W*1.2,H*l.h);
      }
    });
    ff.forEach(f => {
      f.x+=f.vx+Math.sin(t*f.sp)*.38; f.y+=f.vy+Math.cos(t*f.sp*.8)*.18;
      if(f.x<0)f.x=W; if(f.x>W)f.x=0; if(f.y<H*.18)f.y=H*.72; if(f.y>H*.86)f.y=H*.28;
      const a = .25+.75*Math.abs(Math.sin(t*f.sp*2+f.ph));
      const gr = ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,7);
      gr.addColorStop(0,`rgba(180,255,150,${a})`); gr.addColorStop(1,'rgba(180,255,150,0)');
      ctx.beginPath(); ctx.arc(f.x,f.y,7,0,Math.PI*2); ctx.fillStyle=gr; ctx.fill();
      ctx.beginPath(); ctx.arc(f.x,f.y,1.5,0,Math.PI*2);
      ctx.fillStyle=`rgba(210,255,180,${a})`; ctx.fill();
    });
    _af = requestAnimationFrame(d);
  } d();
}

function _stars(ctx, W, H) {
  const stars = Array.from({length:220}, () => ({
    x:Math.random()*W, y:Math.random()*H*.88,
    r:.25+Math.random()*1.4, a:Math.random(),
    da:(Math.random()-.5)*.014, tw:Math.random()>.45
  }));
  let sh=[], st=0;
  function d() {
    ctx.clearRect(0,0,W,H); st++;
    stars.forEach(s => {
      if(s.tw){s.a+=s.da; if(s.a<.08||s.a>1)s.da*=-1;}
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(220,215,255,${s.a})`; ctx.fill();
    });
    if(st>120+Math.random()*100){st=0; sh.push({x:-20,y:Math.random()*H*.48,vx:15+Math.random()*8,vy:4+Math.random()*5,life:1});}
    sh=sh.filter(s=>s.life>0);
    sh.forEach(s => {
      s.x+=s.vx; s.y+=s.vy; s.life-=.022;
      const sg=ctx.createLinearGradient(s.x,s.y,s.x-s.vx*5,s.y-s.vy*5);
      sg.addColorStop(0,`rgba(255,255,255,${s.life})`); sg.addColorStop(1,'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(s.x-s.vx*5,s.y-s.vy*5);
      ctx.strokeStyle=sg; ctx.lineWidth=1.5; ctx.stroke();
    });
    _af = requestAnimationFrame(d);
  } d();
}

function _rain(ctx, W, H) {
  const dr = Array.from({length:300}, () => ({
    x:Math.random()*W, y:Math.random()*H,
    len:10+Math.random()*16, sp:12+Math.random()*9, a:.07+Math.random()*.17
  }));
  const bd = Array.from({length:55}, () => ({
    x:Math.random()*W, y:Math.random()*H,
    r:2+Math.random()*5, vy:0, gr:.03+Math.random()*.05,
    grow:true, maxR:3+Math.random()*8, a:.28+Math.random()*.38, tr:[]
  }));
  setInterval(()=>{
    const b=bd[Math.floor(Math.random()*bd.length)];
    b.y=-10; b.x=Math.random()*W; b.vy=0; b.r=1; b.grow=true; b.tr=[];
  }, 300);
  function d() {
    ctx.clearRect(0,0,W,H);
    dr.forEach(d=>{
      d.y+=d.sp; d.x+=d.sp*.2; if(d.y>H){d.y=-d.len;d.x=Math.random()*W;}
      ctx.beginPath(); ctx.moveTo(d.x,d.y); ctx.lineTo(d.x+d.len*.2,d.y+d.len);
      ctx.strokeStyle=`rgba(180,210,240,${d.a})`; ctx.lineWidth=.6; ctx.stroke();
    });
    bd.forEach(b=>{
      if(b.grow){b.r+=.03; if(b.r>=b.maxR)b.grow=false;}
      else{b.vy+=b.gr; b.y+=b.vy; b.tr.push({x:b.x,y:b.y}); if(b.tr.length>15)b.tr.shift();}
      if(b.y>H+20){b.y=-10;b.x=Math.random()*W;b.vy=0;b.r=1;b.grow=true;b.tr=[];}
      if(b.tr.length>2){
        ctx.beginPath(); ctx.moveTo(b.tr[0].x,b.tr[0].y-b.r*.5);
        b.tr.forEach(p=>ctx.lineTo(p.x,p.y));
        ctx.strokeStyle=`rgba(180,215,255,${b.a*.16})`; ctx.lineWidth=b.r*.6; ctx.stroke();
      }
      const g=ctx.createRadialGradient(b.x-b.r*.3,b.y-b.r*.3,b.r*.1,b.x,b.y,b.r);
      g.addColorStop(0,`rgba(255,255,255,${b.a*.9})`);
      g.addColorStop(.5,`rgba(200,225,255,${b.a*.5})`);
      g.addColorStop(1,`rgba(140,185,230,${b.a*.1})`);
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      ctx.beginPath(); ctx.arc(b.x-b.r*.28,b.y-b.r*.28,b.r*.28,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${b.a*.68})`; ctx.fill();
    });
    _af = requestAnimationFrame(d);
  } d();
}

function _aurora(ctx, W, H) {
  const rib=[
    {c:'0,255,120',b:.22,am:.09,fr:.8,sp:1.0,w:.20,a:.13},
    {c:'60,200,255',b:.28,am:.06,fr:1.1,sp:.7,w:.16,a:.10},
    {c:'140,80,255',b:.18,am:.10,fr:.65,sp:1.3,w:.14,a:.08},
    {c:'0,255,180',b:.32,am:.05,fr:1.3,sp:.9,w:.11,a:.09},
  ];
  const sn=Array.from({length:80},()=>({
    x:Math.random()*W, y:Math.random()*H,
    r:.4+Math.random()*1.8, sp:.25+Math.random()*.6,
    sw:Math.random()*Math.PI*2, sws:.007+Math.random()*.013, a:.15+Math.random()*.5
  }));
  let t=0;
  function d(){
    ctx.clearRect(0,0,W,H); t+=.008;
    rib.forEach(r=>{
      ctx.beginPath(); const yb=H*r.b; ctx.moveTo(0,yb);
      for(let x=0;x<=W;x+=5){
        const y=yb+Math.sin(x/W*Math.PI*r.fr*3+t*r.sp)*H*r.am+Math.sin(x/W*Math.PI*r.fr*5+t*r.sp*1.5)*H*r.am*.4;
        ctx.lineTo(x,y);
      }
      for(let x=W;x>=0;x-=5){
        const y=yb+Math.sin(x/W*Math.PI*r.fr*3+t*r.sp)*H*r.am+Math.sin(x/W*Math.PI*r.fr*5+t*r.sp*1.5)*H*r.am*.4+H*r.w;
        ctx.lineTo(x,y);
      }
      ctx.closePath();
      const g=ctx.createLinearGradient(0,0,0,H*.6);
      g.addColorStop(0,`rgba(${r.c},${r.a*1.4})`); g.addColorStop(1,`rgba(${r.c},0)`);
      ctx.fillStyle=g; ctx.fill();
    });
    sn.forEach(s=>{
      s.sw+=s.sws; s.y+=s.sp; s.x+=Math.sin(s.sw)*.4;
      if(s.y>H+5){s.y=-5; s.x=Math.random()*W;}
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(220,240,255,${s.a})`; ctx.fill();
    });
    _af=requestAnimationFrame(d);
  } d();
}

function _sakura(ctx, W, H) {
  const pet=Array.from({length:90},()=>({
    x:Math.random()*W, y:Math.random()*H,
    sz:4+Math.random()*8, vx:(Math.random()-.5)*.7,
    vy:.4+Math.random()*1.4, rot:Math.random()*Math.PI*2,
    rv:(Math.random()-.5)*.04, sw:Math.random()*Math.PI*2,
    sws:.01+Math.random()*.02, a:.35+Math.random()*.55
  }));
  function d(){
    ctx.clearRect(0,0,W,H);
    pet.forEach(p=>{
      p.y+=p.vy; p.sw+=p.sws; p.x+=p.vx+Math.sin(p.sw)*.75; p.rot+=p.rv;
      if(p.y>H+20){p.y=-20; p.x=Math.random()*W;}
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.globalAlpha=p.a;
      ctx.beginPath(); ctx.ellipse(0,0,p.sz,p.sz*.58,0,0,Math.PI*2);
      const g=ctx.createRadialGradient(0,0,0,0,0,p.sz);
      g.addColorStop(0,'rgba(255,222,232,.96)');
      g.addColorStop(.5,'rgba(255,192,212,.8)');
      g.addColorStop(1,'rgba(255,162,192,.28)');
      ctx.fillStyle=g; ctx.fill();
      ctx.restore(); ctx.globalAlpha=1;
    });
    _af=requestAnimationFrame(d);
  } d();
}

function _clouds(ctx, W, H) {
  let t=0;
  function d(){
    ctx.clearRect(0,0,W,H); t+=.005;
    const pulse=.06+.03*Math.sin(t*2);
    const sg=ctx.createRadialGradient(W*.5,H*.6,0,W*.5,H*.6,W*.4);
    sg.addColorStop(0,`rgba(255,170,50,${pulse})`);
    sg.addColorStop(.5,`rgba(255,105,20,${pulse*.38})`);
    sg.addColorStop(1,'rgba(255,65,0,0)');
    ctx.fillStyle=sg; ctx.fillRect(0,0,W,H);
    for(let i=0;i<7;i++){
      const cx=W*(.08+i*.14)+Math.sin(t+i)*W*.035;
      const cy=H*(.28+Math.sin(t*.65+i)*.06);
      const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,75+i*14);
      cg.addColorStop(0,'rgba(255,190,80,.06)'); cg.addColorStop(1,'rgba(255,135,35,0)');
      ctx.beginPath(); ctx.arc(cx,cy,75+i*14,0,Math.PI*2);
      ctx.fillStyle=cg; ctx.fill();
    }
    _af=requestAnimationFrame(d);
  } d();
}

function _snow(ctx, W, H) {
  const fl=Array.from({length:140},()=>({
    x:Math.random()*W, y:Math.random()*H,
    r:.4+Math.random()*2.4, sp:.28+Math.random()*.75,
    sw:Math.random()*Math.PI*2, sws:.007+Math.random()*.014, a:.18+Math.random()*.58
  }));
  function d(){
    ctx.clearRect(0,0,W,H);
    fl.forEach(f=>{
      f.sw+=f.sws; f.y+=f.sp; f.x+=Math.sin(f.sw)*.45;
      if(f.y>H+5){f.y=-5; f.x=Math.random()*W;}
      ctx.beginPath(); ctx.arc(f.x,f.y,f.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${f.a})`; ctx.fill();
    });
    _af=requestAnimationFrame(d);
  } d();
}

function _forest(ctx, W, H) {
  // light rays + floating dust particles
  const dust=Array.from({length:120},()=>({
    x:Math.random()*W, y:Math.random()*H,
    r:.5+Math.random()*1.5, vx:(Math.random()-.5)*.15,
    vy:-.05-Math.random()*.15, a:.1+Math.random()*.35,
    ph:Math.random()*Math.PI*2
  }));
  let t=0;
  function d(){
    ctx.clearRect(0,0,W,H); t++;
    // god rays
    for(let i=0;i<5;i++){
      const sx=W*(.15+i*.18)+Math.sin(t*.005+i)*20;
      const g=ctx.createLinearGradient(sx,0,sx+20,H*.75);
      g.addColorStop(0,'rgba(200,255,180,.07)'); g.addColorStop(1,'rgba(200,255,180,0)');
      ctx.beginPath(); ctx.moveTo(sx-8,0); ctx.lineTo(sx+28,0);
      ctx.lineTo(sx+40,H*.75); ctx.lineTo(sx+4,H*.75); ctx.closePath();
      ctx.fillStyle=g; ctx.fill();
    }
    dust.forEach(p=>{
      p.x+=p.vx+Math.sin(t*.012+p.ph)*.2;
      p.y+=p.vy;
      if(p.y<-5){p.y=H+5; p.x=Math.random()*W;}
      if(p.x<0)p.x=W; if(p.x>W)p.x=0;
      const a=p.a*(0.5+0.5*Math.sin(t*.02+p.ph));
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(220,255,200,${a})`; ctx.fill();
    });
    _af=requestAnimationFrame(d);
  } d();
}
