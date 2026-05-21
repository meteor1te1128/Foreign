/* Foreign · animations.js — 全主题物理级特效重写 */

let _af = null;

export function stopAnim() {
  if (_af) { cancelAnimationFrame(_af); _af = null; }
}

export function startAnim(type, canvas) {
  stopAnim();
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const W = canvas.width, H = canvas.height;
  if      (type === 'ocean')  _ocean(ctx, W, H);
  else if (type === 'mist')   _mist(ctx, W, H);
  else if (type === 'stars')  _stars(ctx, W, H);
  else if (type === 'rain')   _rain(ctx, W, H);
  else if (type === 'aurora') _aurora(ctx, W, H);
  else if (type === 'sakura') _sakura(ctx, W, H);
  else if (type === 'clouds') _clouds(ctx, W, H);
  else if (type === 'snow')   _snow(ctx, W, H);
  else if (type === 'forest') _forest(ctx, W, H);
}

/* ─── 噪声工具 ───────────────────────────────────────────── */
function noise(x, y, t) {
  return (
    Math.sin(x * 0.8  + t * 0.7) * 0.40 +
    Math.sin(x * 1.6  - y * 0.4 + t * 0.5) * 0.25 +
    Math.sin(y * 1.1  + t * 0.9) * 0.20 +
    Math.sin(x * 0.3  + y * 0.7 + t * 0.3) * 0.15
  );
}
function smoothNoise(x, t) {
  return Math.sin(x*1.3+t)*0.5 + Math.sin(x*2.7-t*1.4)*0.3 + Math.sin(x*0.5+t*0.6)*0.2;
}
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* ═══════════════════════════════════════════════════════════
   🌊 深海 — 体积光 + 焦散 + 物理气泡
═══════════════════════════════════════════════════════════ */
function _ocean(ctx, W, H) {

  /* 焦散 */
  const caustics = Array.from({length:32}, () => ({
    x: Math.random()*W, y: H*(.5+Math.random()*.5),
    rx: 14+Math.random()*52, ry: 3+Math.random()*10,
    rot: Math.random()*Math.PI, rspd: (Math.random()-.5)*.0025,
    a: .02+Math.random()*.04, spd: (Math.random()-.5)*.16,
  }));

  /* 气泡三档：微/小/中 */
  function mkBub(W,H,init) {
    const tier = Math.random();
    const r = tier<.62 ? .4+Math.random()*1.1
             : tier<.88 ? 1.5+Math.random()*2.2
             :            3.5+Math.random()*5;
    return {
      x: Math.random()*W,
      y: init ? Math.random()*H : H+r+8,
      r, sp: (.15+Math.random()*.45)*(1.8/r+.5),
      wb: (Math.random()-.5)*.3,
      ph: Math.random()*Math.PI*2, phspd:.01+Math.random()*.018,
      a: .1+Math.random()*.28,
    };
  }
  const bubbles = Array.from({length:90}, (_,i) => mkBub(W,H,true));

  /* 光柱 8根 */
  const rays = Array.from({length:8}, (_,i) => ({
    cx: W*(.04+i*.135),
    w:  22+Math.random()*55,
    skew: (Math.random()-.5)*45,
    a:  .038+Math.random()*.055,
    ph: Math.random()*Math.PI*2, phspd:.003+Math.random()*.004,
    reach: H*(.5+Math.random()*.38),
  }));

  let t=0;
  function draw() {
    ctx.clearRect(0,0,W,H); t+=.007;

    /* 光柱 */
    rays.forEach(ray => {
      ray.ph += ray.phspd;
      const nx = ray.cx + noise(ray.cx/W, t*.3, t)* 20;
      const pulse = .72+.28*Math.sin(ray.ph);

      /* 外散射 */
      const go = ctx.createLinearGradient(nx,0,nx,ray.reach*.92);
      go.addColorStop(0,  `rgba(50,150,255,${ray.a*.55*pulse})`);
      go.addColorStop(.4, `rgba(70,170,255,${ray.a*.28*pulse})`);
      go.addColorStop(1,  'rgba(40,120,255,0)');
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(nx-ray.w*2,0); ctx.lineTo(nx+ray.w*2,0);
      ctx.lineTo(nx+ray.w*2+ray.skew,ray.reach*.92);
      ctx.lineTo(nx-ray.w*2+ray.skew,ray.reach*.92);
      ctx.closePath(); ctx.fillStyle=go; ctx.fill(); ctx.restore();

      /* 内核 */
      const gi = ctx.createLinearGradient(nx,0,nx,ray.reach);
      gi.addColorStop(0,   `rgba(160,220,255,${ray.a*1.5*pulse})`);
      gi.addColorStop(.22, `rgba(120,200,255,${ray.a*.95*pulse})`);
      gi.addColorStop(.65, `rgba(80,160,255,${ray.a*.32*pulse})`);
      gi.addColorStop(1,   'rgba(50,120,255,0)');
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(nx-ray.w*.4,0); ctx.lineTo(nx+ray.w*.4,0);
      ctx.lineTo(nx+ray.w*.4+ray.skew*.55,ray.reach);
      ctx.lineTo(nx-ray.w*.4+ray.skew*.55,ray.reach);
      ctx.closePath(); ctx.fillStyle=gi; ctx.fill(); ctx.restore();
    });

    /* 焦散 */
    caustics.forEach(c => {
      c.x+=c.spd; c.rot+=c.rspd;
      if(c.x<-c.rx*2) c.x=W+c.rx; if(c.x>W+c.rx*2) c.x=-c.rx;
      ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.rot);
      const cg=ctx.createRadialGradient(0,0,0,0,0,c.rx);
      cg.addColorStop(0,`rgba(140,220,255,${c.a})`);
      cg.addColorStop(.55,`rgba(90,185,255,${c.a*.35})`);
      cg.addColorStop(1,'rgba(50,150,255,0)');
      ctx.scale(1,c.ry/c.rx);
      ctx.beginPath(); ctx.arc(0,0,c.rx,0,Math.PI*2);
      ctx.fillStyle=cg; ctx.fill(); ctx.restore();
    });

    /* 气泡 */
    bubbles.forEach((b,i) => {
      b.ph+=b.phspd; b.y-=b.sp; b.x+=Math.sin(b.ph)*b.wb;
      if(b.y<-b.r*2) bubbles[i]=mkBub(W,H,false);
      if(b.x<-10)b.x=W+10; if(b.x>W+10)b.x=-10;

      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
      ctx.strokeStyle=`rgba(200,238,255,${b.a*.9})`; ctx.lineWidth=b.r>2?.85:.45; ctx.stroke();

      if(b.r>1.0) {
        const hx=b.x-b.r*.35, hy=b.y-b.r*.35;
        const hg=ctx.createRadialGradient(hx,hy,0,hx,hy,b.r*.6);
        hg.addColorStop(0,`rgba(255,255,255,${b.a*.75})`);
        hg.addColorStop(1,'rgba(255,255,255,0)');
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
        ctx.fillStyle=hg; ctx.fill();
      }
    });

    _af=requestAnimationFrame(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════════
   🌲 雾林 — 体积雾 + 萤火虫群落 + 树影
═══════════════════════════════════════════════════════════ */
function _mist(ctx, W, H) {

  /* 雾层：6层，各自独立速度/密度/色温 */
  const fogLayers = [
    {y:.35,h:.10,sp:.08,a:.05,c:'185,208,198'},
    {y:.44,h:.13,sp:.12,a:.08,c:'190,212,202'},
    {y:.55,h:.12,sp:.07,a:.10,c:'178,208,196'},
    {y:.65,h:.14,sp:.15,a:.09,c:'195,215,207'},
    {y:.76,h:.12,sp:.10,a:.12,c:'200,218,210'},
    {y:.85,h:.15,sp:.18,a:.08,c:'188,210,200'},
  ];

  /* 萤火虫群落：分3簇 */
  const clusters = [
    {cx:W*.22, cy:H*.55, r:W*.18},
    {cx:W*.62, cy:H*.48, r:W*.22},
    {cx:W*.82, cy:H*.62, r:W*.14},
  ];
  const fireflies = Array.from({length:22}, (_,i) => {
    const cl = clusters[i%3];
    return {
      x: cl.cx+(Math.random()-.5)*cl.r,
      y: cl.cy+(Math.random()-.5)*cl.r*.6,
      vx:(Math.random()-.5)*.28, vy:(Math.random()-.5)*.18,
      ph:Math.random()*Math.PI*2,
      blinkPh:Math.random()*Math.PI*2,
      blinkSpd:.025+Math.random()*.04,
      sz:3.5+Math.random()*5,
      hue:100+Math.random()*60,   /* 黄绿色域 */
      cl: i%3,
      trail:[],
    };
  });

  let t=0;
  function draw() {
    ctx.clearRect(0,0,W,H); t++;

    /* 雾层 */
    fogLayers.forEach(l => {
      const off=(t*l.sp)%W;
      for(let r=0;r<4;r++) {
        const x=-W+r*W*1.1-off;
        /* 每层加轻微噪声扰动让边缘不平 */
        const nOff = smoothNoise(t*.003+l.y, t*.002)*8;
        const g=ctx.createLinearGradient(0,H*(l.y+nOff*.01),0,H*(l.y+l.h+nOff*.01));
        g.addColorStop(0,`rgba(${l.c},0)`);
        g.addColorStop(.38,`rgba(${l.c},${l.a})`);
        g.addColorStop(.62,`rgba(${l.c},${l.a})`);
        g.addColorStop(1,`rgba(${l.c},0)`);
        ctx.fillStyle=g; ctx.fillRect(x,H*(l.y-.02),W*1.22,H*(l.h+.04));
      }
    });

    /* 萤火虫 */
    fireflies.forEach(f => {
      const cl=clusters[f.cl];
      /* 向群落中心施加微弱引力 */
      f.vx+=(cl.cx-f.x)*.00012; f.vy+=(cl.cy-f.y)*.00008;
      f.vx+=Math.sin(t*.018+f.ph)*.022; f.vy+=Math.cos(t*.014+f.ph)*.015;
      /* 阻尼 */
      f.vx*=.985; f.vy*=.985;
      f.x+=f.vx; f.y+=f.vy;
      f.blinkPh+=f.blinkSpd;

      /* 尾迹 */
      f.trail.push({x:f.x,y:f.y});
      if(f.trail.length>18) f.trail.shift();

      const blink=Math.max(0,.2+.8*Math.abs(Math.sin(f.blinkPh)));

      /* 画尾迹 */
      for(let i=1;i<f.trail.length;i++){
        const p0=f.trail[i-1],p1=f.trail[i];
        const prog=i/f.trail.length;
        ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p1.x,p1.y);
        ctx.strokeStyle=`hsla(${f.hue},90%,65%,${blink*prog*.35})`;
        ctx.lineWidth=prog*1.8; ctx.stroke();
      }

      /* 外晕 */
      const gr=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.sz*2.2);
      gr.addColorStop(0,`hsla(${f.hue},90%,70%,${blink*.55})`);
      gr.addColorStop(.4,`hsla(${f.hue},80%,60%,${blink*.18})`);
      gr.addColorStop(1,'hsla(120,70%,50%,0)');
      ctx.beginPath(); ctx.arc(f.x,f.y,f.sz*2.2,0,Math.PI*2);
      ctx.fillStyle=gr; ctx.fill();

      /* 核心亮点 */
      ctx.beginPath(); ctx.arc(f.x,f.y,f.sz*.45,0,Math.PI*2);
      ctx.fillStyle=`hsla(${f.hue+20},95%,88%,${blink})`; ctx.fill();
    });

    _af=requestAnimationFrame(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════════
   🌌 星空 — 银河密度分布 + 大气燃烧流星
═══════════════════════════════════════════════════════════ */
function _stars(ctx, W, H) {

  /* 银河带：中心密，边缘稀 */
  const MW_CX=W*.52, MW_CY=H*.42, MW_W=W*.55, MW_H=H*.28;

  function starWeight(x,y) {
    const dx=(x-MW_CX)/MW_W, dy=(y-MW_CY)/MW_H;
    return Math.exp(-(dx*dx+dy*dy)*2.8);
  }

  const stars = Array.from({length:280}, () => {
    /* 拒绝采样让银河区域更密 */
    let x,y;
    for(let i=0;i<8;i++){
      x=Math.random()*W; y=Math.random()*H*.95;
      if(Math.random()<starWeight(x,y)*1.8) break;
    }
    const inMW=starWeight(x,y)>.35;
    return {
      x,y,
      r: inMW ? .15+Math.random()*.9 : .2+Math.random()*1.5,
      a: inMW ? .4+Math.random()*.6  : .2+Math.random()*.8,
      da:(Math.random()-.5)*.01,
      tw:Math.random()>.38,
      /* 星色：大多白，少量蓝/橙 */
      hue: Math.random()<.15 ? 220+Math.random()*30
          :Math.random()<.08 ? 25+Math.random()*15
          : 0,
      sat: Math.random()<.23 ? 60+Math.random()*30 : 0,
    };
  });

  /* 银河薄雾 */
  const mwGrad = ctx.createRadialGradient(MW_CX,MW_CY,0,MW_CX,MW_CY,MW_W*.6);
  mwGrad.addColorStop(0,'rgba(190,180,255,.045)');
  mwGrad.addColorStop(.5,'rgba(160,155,240,.02)');
  mwGrad.addColorStop(1,'rgba(140,140,220,0)');

  let meteors=[], t=0;

  function draw() {
    ctx.clearRect(0,0,W,H); t++;

    /* 银河薄雾 */
    ctx.save();
    ctx.scale(1, MW_H/MW_W*.9);
    ctx.fillStyle=mwGrad;
    ctx.fillRect(0,0,W,H*(MW_W/MW_H));
    ctx.restore();

    /* 星星 */
    stars.forEach(s=>{
      if(s.tw){s.a+=s.da; if(s.a<.05||s.a>1)s.da*=-1;}
      const col=s.sat>0
        ? `hsla(${s.hue},${s.sat}%,90%,${s.a})`
        : `rgba(225,222,255,${s.a})`;
      /* 较亮星加十字衍射 */
      if(s.r>1.0&&s.a>.6){
        const dl=s.r*4;
        ctx.strokeStyle=`rgba(220,218,255,${s.a*.18})`;
        ctx.lineWidth=.5;
        ctx.beginPath(); ctx.moveTo(s.x-dl,s.y); ctx.lineTo(s.x+dl,s.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s.x,s.y-dl); ctx.lineTo(s.x,s.y+dl); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=col; ctx.fill();
    });

    /* 流星：大气燃烧色 白→橙黄→消失 */
    if(Math.random()<.0025){
      const ang=Math.PI*(.16+Math.random()*.16);
      const spd=12+Math.random()*10;
      meteors.push({
        x:Math.random()*W*.75, y:Math.random()*H*.38,
        vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd,
        life:1, tail:[],
        len:18+Math.random()*14,
      });
    }
    meteors=meteors.filter(m=>m.life>0);
    meteors.forEach(m=>{
      m.tail.push({x:m.x,y:m.y,life:m.life});
      if(m.tail.length>26) m.tail.shift();
      m.x+=m.vx; m.y+=m.vy; m.life-=.017;

      /* 拖尾：白→橙→消失 */
      for(let i=1;i<m.tail.length;i++){
        const p0=m.tail[i-1],p1=m.tail[i];
        const prog=i/m.tail.length;
        /* 越靠近头部越白，靠近尾部橙黄 */
        const r=Math.round(lerp(255,255,prog));
        const g=Math.round(lerp(200,255,prog));
        const b=Math.round(lerp(80,255,prog));
        ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p1.x,p1.y);
        ctx.strokeStyle=`rgba(${r},${g},${b},${m.life*prog*.9})`;
        ctx.lineWidth=prog*2.8; ctx.stroke();
      }
      /* 头部光晕 */
      const hg=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,5);
      hg.addColorStop(0,`rgba(255,255,255,${m.life})`);
      hg.addColorStop(.5,`rgba(255,220,120,${m.life*.5})`);
      hg.addColorStop(1,'rgba(255,180,50,0)');
      ctx.beginPath(); ctx.arc(m.x,m.y,5,0,Math.PI*2);
      ctx.fillStyle=hg; ctx.fill();
    });

    _af=requestAnimationFrame(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════════
   🌧️ 雨夜 — 景深雨丝 + 玻璃水珠物理形变
═══════════════════════════════════════════════════════════ */
function _rain(ctx, W, H) {

  /* 雨：3个景深层 */
  const rainLayers = [
    /* 远景：细、淡、慢 */
    Array.from({length:120},()=>({x:Math.random()*W,y:Math.random()*H,len:6+Math.random()*8,sp:7+Math.random()*4,a:.04+Math.random()*.07,w:.4})),
    /* 中景 */
    Array.from({length:100},()=>({x:Math.random()*W,y:Math.random()*H,len:10+Math.random()*14,sp:12+Math.random()*7,a:.08+Math.random()*.12,w:.65})),
    /* 近景：粗、亮、快 */
    Array.from({length:60},()=>({x:Math.random()*W,y:Math.random()*H,len:16+Math.random()*22,sp:18+Math.random()*10,a:.12+Math.random()*.18,w:1.1})),
  ];

  /* 水珠：玻璃形变 */
  function mkDrop() {
    return {
      x:Math.random()*W, y:-12,
      r:2.5+Math.random()*6,
      vy:0, gr:.025+Math.random()*.04,
      a:.32+Math.random()*.42,
      trail:[],
      /* 形变：静止时圆，滑落时拉长 */
      stretch:1,
    };
  }
  const drops=Array.from({length:45},()=>({...mkDrop(),y:Math.random()*H,vy:Math.random()*2}));
  setInterval(()=>{
    const i=Math.floor(Math.random()*drops.length);
    Object.assign(drops[i],mkDrop());
  },350);

  function draw() {
    ctx.clearRect(0,0,W,H);

    /* 雨层从远到近 */
    rainLayers.forEach(layer=>{
      layer.forEach(d=>{
        d.y+=d.sp; d.x+=d.sp*.24;
        if(d.y>H){d.y=-d.len;d.x=Math.random()*W;}
        ctx.beginPath();
        ctx.moveTo(d.x,d.y); ctx.lineTo(d.x+d.len*.24,d.y+d.len);
        ctx.strokeStyle=`rgba(172,208,245,${d.a})`;
        ctx.lineWidth=d.w; ctx.stroke();
      });
    });

    /* 水珠 */
    drops.forEach((b,i)=>{
      const isRolling=b.vy>0.05;
      if(isRolling){
        b.vy+=b.gr; b.y+=b.vy;
        /* 拉伸：速度越快越椭圆 */
        b.stretch=clamp(1+b.vy*.08, 1, 2.2);
        b.trail.push({x:b.x,y:b.y});
        if(b.trail.length>14) b.trail.shift();
      } else {
        b.vy+=b.gr;
      }
      if(b.y>H+20) Object.assign(drops[i],mkDrop());

      /* 尾迹 */
      if(b.trail.length>2){
        ctx.beginPath();
        ctx.moveTo(b.trail[0].x,b.trail[0].y);
        b.trail.forEach(p=>ctx.lineTo(p.x,p.y));
        ctx.strokeStyle=`rgba(180,218,255,${b.a*.2})`;
        ctx.lineWidth=b.r*.7; ctx.stroke();
      }

      /* 水珠本体（拉伸椭圆） */
      ctx.save();
      ctx.translate(b.x,b.y);
      ctx.scale(1,b.stretch);

      /* 主体折射渐变 */
      const g=ctx.createRadialGradient(-b.r*.28,-b.r*.28,b.r*.06,0,0,b.r);
      g.addColorStop(0,  `rgba(255,255,255,${b.a*.95})`);
      g.addColorStop(.38,`rgba(215,235,255,${b.a*.6})`);
      g.addColorStop(.75,`rgba(160,200,240,${b.a*.25})`);
      g.addColorStop(1,  `rgba(100,170,220,${b.a*.05})`);
      ctx.beginPath(); ctx.arc(0,0,b.r,0,Math.PI*2);
      ctx.fillStyle=g; ctx.fill();

      /* 边缘暗环（表面张力感） */
      ctx.beginPath(); ctx.arc(0,0,b.r,0,Math.PI*2);
      ctx.strokeStyle=`rgba(140,185,230,${b.a*.35})`;
      ctx.lineWidth=.8; ctx.stroke();

      /* 高光 */
      ctx.beginPath(); ctx.arc(-b.r*.32,-b.r*.32,b.r*.32,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${b.a*.8})`; ctx.fill();

      ctx.restore();
    });

    _af=requestAnimationFrame(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════════
   🌠 极光 — 噪声帘子 + 顶缘发光 (已是最新版，微调亮度)
═══════════════════════════════════════════════════════════ */
function _aurora(ctx, W, H) {
  const curtains=[
    {yBase:.16,height:.30,color0:'0,230,120', color1:'0,170,90', speed:.52,freq:2.1,amp:.058,phase:0,           ns:.034},
    {yBase:.21,height:.24,color0:'55,205,255',color1:'15,155,220',speed:.36,freq:3.2,amp:.035,phase:Math.PI*.65,ns:.027},
    {yBase:.12,height:.34,color0:'125,55,255',color1:'75,15,200', speed:.68,freq:1.75,amp:.072,phase:Math.PI*1.3,ns:.042},
    {yBase:.28,height:.19,color0:'0,255,175', color1:'0,195,135',speed:.40,freq:2.9,amp:.025,phase:Math.PI*.32,ns:.020},
  ];
  const snow=Array.from({length:95},()=>({
    x:Math.random()*W, y:Math.random()*H,
    r:.3+Math.random()*1.9, sp:.2+Math.random()*.6,
    sw:Math.random()*Math.PI*2, sws:.005+Math.random()*.013, a:.1+Math.random()*.48,
  }));
  let t=0;
  function draw(){
    ctx.clearRect(0,0,W,H); t+=.0055;
    curtains.forEach(c=>{
      const step=3, top=[], bot=[];
      for(let x=0;x<=W;x+=step){
        const nx=x/W;
        const n=noise(nx*3,t*.38,t+c.phase*.5)*c.ns;
        const wave=Math.sin(nx*Math.PI*c.freq+t*c.speed+c.phase)*c.amp
                  +Math.sin(nx*Math.PI*c.freq*1.85-t*c.speed*1.35+c.phase)*c.amp*.38+n;
        const yTop=H*(c.yBase+wave);
        const yBot=yTop+H*c.height*(.68+.32*Math.abs(Math.sin(nx*4.2+t)));
        top.push({x,y:yTop}); bot.push({x,y:yBot});
      }
      ctx.save();
      ctx.beginPath();
      top.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
      for(let i=bot.length-1;i>=0;i--) ctx.lineTo(bot[i].x,bot[i].y);
      ctx.closePath();
      const avgTop=top.reduce((s,p)=>s+p.y,0)/top.length;
      const avgBot=bot.reduce((s,p)=>s+p.y,0)/bot.length;
      const gv=ctx.createLinearGradient(0,avgTop,0,avgBot);
      const pulse=.86+.14*Math.sin(t*1.75+c.phase);
      gv.addColorStop(0,   `rgba(${c.color0},0)`);
      gv.addColorStop(.10, `rgba(${c.color0},${.16*pulse})`);
      gv.addColorStop(.42, `rgba(${c.color0},${.24*pulse})`);
      gv.addColorStop(.74, `rgba(${c.color1},${.13*pulse})`);
      gv.addColorStop(1,   `rgba(${c.color1},0)`);
      ctx.fillStyle=gv; ctx.fill();
      ctx.beginPath();
      top.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
      ctx.strokeStyle=`rgba(${c.color0},${.2*pulse})`;
      ctx.lineWidth=1.8; ctx.stroke();
      ctx.restore();
    });
    snow.forEach(s=>{
      s.sw+=s.sws; s.y+=s.sp; s.x+=Math.sin(s.sw)*.4;
      if(s.y>H+5){s.y=-5;s.x=Math.random()*W;}
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(220,242,255,${s.a})`; ctx.fill();
    });
    _af=requestAnimationFrame(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════════
   🌸 樱花 — 贝塞尔花瓣 + 风场 + 正反面
═══════════════════════════════════════════════════════════ */
function _sakura(ctx, W, H) {

  /* 风场：随时间缓变 */
  let windX=.4, windTarget=.4;
  setInterval(()=>{ windTarget=(Math.random()-.3)*1.2; },3500);

  /* 花瓣用贝塞尔曲线画心形花瓣 */
  function drawPetal(ctx, sz, flip) {
    /* 单瓣：心形变体 */
    ctx.beginPath();
    ctx.moveTo(0, sz*.55);
    ctx.bezierCurveTo(sz*.9, sz*.2,  sz*.85,-sz*.35, 0,-sz*.45);
    ctx.bezierCurveTo(-sz*.85,-sz*.35,-sz*.9, sz*.2,  0, sz*.55);
    ctx.closePath();
  }

  const petals=Array.from({length:100},()=>({
    x:Math.random()*W, y:Math.random()*H,
    sz:5+Math.random()*9,
    vx:(Math.random()-.5)*.5, vy:.3+Math.random()*1.2,
    rot:Math.random()*Math.PI*2, rv:(Math.random()-.5)*.03,
    sw:Math.random()*Math.PI*2, sws:.008+Math.random()*.016,
    a:.35+Math.random()*.6,
    flip:Math.random()>.5,   /* 正/反面 */
    flipAnim:Math.random()*Math.PI*2,
    flipSpd:.008+Math.random()*.015,
    /* 脉络深浅 */
    veinA:.15+Math.random()*.2,
  }));

  function draw() {
    ctx.clearRect(0,0,W,H);
    /* 风场渐变 */
    windX+=(windTarget-windX)*.008;

    petals.forEach(p=>{
      p.sw+=p.sws; p.rot+=p.rv;
      p.flipAnim+=p.flipSpd;
      p.x+=p.vx+windX+Math.sin(p.sw)*.65;
      p.y+=p.vy+Math.cos(p.sw*.7)*.25;
      if(p.y>H+25){p.y=-25;p.x=Math.random()*W;}
      if(p.x<-30)p.x=W+30; if(p.x>W+30)p.x=-30;

      /* 翻转系数（模拟花瓣正反翻动） */
      const flipFactor=Math.cos(p.flipAnim);
      const isBack=flipFactor<0;

      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot);
      ctx.scale(flipFactor, 1);   /* X轴缩放模拟翻转 */
      ctx.globalAlpha=p.a;

      drawPetal(ctx, p.sz, isBack);

      /* 正面：粉白渐变 */
      /* 背面：略深的玫瑰色 */
      const g=ctx.createRadialGradient(0,-p.sz*.2,0,0,p.sz*.1,p.sz*1.05);
      if(!isBack){
        g.addColorStop(0,'rgba(255,230,238,.98)');
        g.addColorStop(.5,'rgba(255,200,218,.88)');
        g.addColorStop(1,'rgba(255,170,200,.22)');
      } else {
        g.addColorStop(0,'rgba(240,190,210,.95)');
        g.addColorStop(.5,'rgba(225,160,190,.82)');
        g.addColorStop(1,'rgba(210,140,175,.18)');
      }
      ctx.fillStyle=g; ctx.fill();

      /* 脉络 */
      ctx.beginPath();
      ctx.moveTo(0,p.sz*.52); ctx.quadraticCurveTo(0,0,0,-p.sz*.42);
      /* 左右侧脉 */
      ctx.moveTo(0,p.sz*.1); ctx.quadraticCurveTo(-p.sz*.5,-p.sz*.05,-p.sz*.7,-p.sz*.25);
      ctx.moveTo(0,p.sz*.1); ctx.quadraticCurveTo( p.sz*.5,-p.sz*.05, p.sz*.7,-p.sz*.25);
      ctx.strokeStyle=`rgba(210,140,175,${p.veinA})`;
      ctx.lineWidth=.55; ctx.stroke();

      ctx.restore(); ctx.globalAlpha=1;
    });
    _af=requestAnimationFrame(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════════
   🌅 火烧云 — 噪声云层 + 丁达尔光束 + 地平线染色
═══════════════════════════════════════════════════════════ */
function _clouds(ctx, W, H) {

  /* 云朵：用多个椭圆叠加模拟积云轮廓 */
  function mkCloud() {
    const cx=Math.random()*W*1.4-W*.2;
    const cy=H*(.08+Math.random()*.38);
    const blobs=Array.from({length:4+Math.floor(Math.random()*5)},()=>({
      ox:(Math.random()-.5)*80, oy:(Math.random()-.5)*28,
      rx:30+Math.random()*65, ry:18+Math.random()*32,
    }));
    return { cx, cy, blobs,
      spd:(Math.random()-.5)*.12,
      /* 云的颜色随高度：低=橙红，高=紫灰 */
      hue:Math.random()<.5 ? 22+Math.random()*18 : 290+Math.random()*40,
      sat:60+Math.random()*30,
      a:.055+Math.random()*.075,
    };
  }
  const clouds=Array.from({length:14},mkCloud);

  /* 丁达尔光束 */
  const tyndall=Array.from({length:6},(_,i)=>({
    cx:W*(.08+i*.18)+Math.random()*W*.06,
    w:18+Math.random()*45,
    a:.03+Math.random()*.045,
    ph:Math.random()*Math.PI*2, phspd:.003+Math.random()*.004,
    reach:H*(.4+Math.random()*.35),
    skew:(Math.random()-.5)*55,
  }));

  let t=0;
  function draw(){
    ctx.clearRect(0,0,W,H); t+=.003;

    /* 地平线染色渐变（整体背景层） */
    const sunY=H*.68;
    const skyG=ctx.createLinearGradient(0,0,0,H);
    const pulse=.055+.02*Math.sin(t*1.6);
    skyG.addColorStop(0,  `rgba(160,60,120,${pulse*.5})`);  /* 高空紫 */
    skyG.addColorStop(.35,`rgba(220,90,40,${pulse*.65})`);   /* 中空橙红 */
    skyG.addColorStop(.65,`rgba(255,150,40,${pulse})`);      /* 地平线橙 */
    skyG.addColorStop(1,  `rgba(255,200,80,${pulse*.7})`);   /* 海面金 */
    ctx.fillStyle=skyG; ctx.fillRect(0,0,W,H);

    /* 太阳光晕 */
    const sg=ctx.createRadialGradient(W*.5,sunY,0,W*.5,sunY,W*.38);
    sg.addColorStop(0,  `rgba(255,210,80,${pulse*1.1})`);
    sg.addColorStop(.3, `rgba(255,150,40,${pulse*.55})`);
    sg.addColorStop(.7, `rgba(220,80,20,${pulse*.18})`);
    sg.addColorStop(1,  'rgba(180,40,0,0)');
    ctx.fillStyle=sg; ctx.fillRect(0,0,W,H);

    /* 丁达尔光束 */
    tyndall.forEach(r=>{
      r.ph+=r.phspd;
      const nx=r.cx+Math.sin(r.ph*.7)*18;
      const pulse2=.72+.28*Math.sin(r.ph);
      const gt=ctx.createLinearGradient(nx,0,nx,r.reach);
      gt.addColorStop(0,  `rgba(255,210,120,${r.a*1.3*pulse2})`);
      gt.addColorStop(.3, `rgba(255,185,80,${r.a*.8*pulse2})`);
      gt.addColorStop(.75,`rgba(255,150,40,${r.a*.25*pulse2})`);
      gt.addColorStop(1,  'rgba(240,120,20,0)');
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(nx-r.w*.42,0); ctx.lineTo(nx+r.w*.42,0);
      ctx.lineTo(nx+r.w*.42+r.skew,r.reach);
      ctx.lineTo(nx-r.w*.42+r.skew,r.reach);
      ctx.closePath(); ctx.fillStyle=gt; ctx.fill(); ctx.restore();
    });

    /* 云层 */
    clouds.forEach(c=>{
      c.cx+=c.spd;
      if(c.cx>W+200) Object.assign(c,mkCloud(),{cx:-200});
      if(c.cx<-200)  Object.assign(c,mkCloud(),{cx:W+200});
      c.blobs.forEach(b=>{
        const bx=c.cx+b.ox, by=c.cy+b.oy;
        const bg2=ctx.createRadialGradient(bx,by-b.ry*.3,0,bx,by,Math.max(b.rx,b.ry));
        bg2.addColorStop(0,  `hsla(${c.hue},${c.sat}%,72%,${c.a*1.2})`);
        bg2.addColorStop(.55,`hsla(${c.hue},${c.sat}%,58%,${c.a*.6})`);
        bg2.addColorStop(1,  `hsla(${c.hue},${c.sat}%,42%,0)`);
        ctx.save();
        ctx.scale(1, b.ry/b.rx);
        ctx.beginPath(); ctx.arc(bx,by*(b.rx/b.ry),b.rx,0,Math.PI*2);
        ctx.fillStyle=bg2; ctx.fill();
        ctx.restore();
      });
    });

    _af=requestAnimationFrame(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════════
   🏔️ 雪山 — 六角雪花 + 风场景深 + 地面积雪
═══════════════════════════════════════════════════════════ */
function _snow(ctx, W, H) {

  /* 风场 */
  let windX=.2, windTarget=.2;
  setInterval(()=>{ windTarget=(Math.random()-.5)*1.6; },4500);

  /* 六角雪花生成（仅较大雪花才画六角，小的画圆省性能） */
  function drawSnowflake(ctx, r) {
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3;
      ctx.beginPath(); ctx.moveTo(0,0);
      ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
      /* 侧枝 */
      const mx=Math.cos(a)*r*.55, my=Math.sin(a)*r*.55;
      const sa=a+Math.PI/2;
      ctx.moveTo(mx,my);
      ctx.lineTo(mx+Math.cos(sa)*r*.28, my+Math.sin(sa)*r*.28);
      ctx.moveTo(mx,my);
      ctx.lineTo(mx-Math.cos(sa)*r*.28, my-Math.sin(sa)*r*.28);
      ctx.stroke();
    }
  }

  /* 三景深层 */
  const layers=[
    Array.from({length:60},()=>({depth:.2,x:Math.random()*W,y:Math.random()*H,r:.4+Math.random()*.8, sp:.18+Math.random()*.28,sw:Math.random()*Math.PI*2,sws:.004+Math.random()*.008,a:.1+Math.random()*.28})),
    Array.from({length:50},()=>({depth:.55,x:Math.random()*W,y:Math.random()*H,r:.8+Math.random()*1.6,sp:.35+Math.random()*.55,sw:Math.random()*Math.PI*2,sws:.006+Math.random()*.01,a:.2+Math.random()*.42})),
    Array.from({length:30},()=>({depth:1.0,x:Math.random()*W,y:Math.random()*H,r:1.8+Math.random()*3.2,sp:.7+Math.random()*.9, sw:Math.random()*Math.PI*2,sws:.008+Math.random()*.014,a:.35+Math.random()*.55})),
  ];

  /* 地面积雪堆 */
  const groundPiles=Array.from({length:8},(_,i)=>({
    x:W*(i/7), h:H*.04+Math.random()*H*.06, w:W*.18+Math.random()*W*.15,
  }));

  function draw(){
    ctx.clearRect(0,0,W,H);
    windX+=(windTarget-windX)*.006;

    /* 地面积雪 */
    groundPiles.forEach(p=>{
      const gg=ctx.createRadialGradient(p.x,H,0,p.x,H-p.h*.5,p.w*.6);
      gg.addColorStop(0,'rgba(235,242,255,.28)');
      gg.addColorStop(1,'rgba(210,228,255,0)');
      ctx.beginPath();
      ctx.ellipse(p.x,H,p.w*.5,p.h,0,Math.PI,0);
      ctx.fillStyle=gg; ctx.fill();
    });

    /* 雪花：从远到近 */
    layers.forEach(layer=>{
      layer.forEach(f=>{
        f.sw+=f.sws; f.y+=f.sp; f.x+=windX*f.depth+Math.sin(f.sw)*f.depth*.5;
        if(f.y>H+10){f.y=-10;f.x=Math.random()*W;}
        if(f.x<-20)f.x=W+20; if(f.x>W+20)f.x=-20;

        ctx.save(); ctx.translate(f.x,f.y); ctx.rotate(f.sw*.5);
        ctx.globalAlpha=f.a;

        if(f.r>2.0){
          /* 六角雪花 */
          ctx.strokeStyle=`rgba(240,248,255,${f.a})`;
          ctx.lineWidth=.6; drawSnowflake(ctx,f.r);
          /* 中心点 */
          ctx.beginPath(); ctx.arc(0,0,f.r*.18,0,Math.PI*2);
          ctx.fillStyle='rgba(255,255,255,.9)'; ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(0,0,f.r,0,Math.PI*2);
          ctx.fillStyle='rgba(245,250,255,.9)'; ctx.fill();
        }
        ctx.restore(); ctx.globalAlpha=1;
      });
    });

    _af=requestAnimationFrame(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════════
   🌿 雨林 — 体积光 + 湿气粒子景深 + 地面反光
═══════════════════════════════════════════════════════════ */
function _forest(ctx, W, H) {

  /* 体积光柱：不规则宽度+噪声扰动 */
  const rays=Array.from({length:6},(_,i)=>({
    cx:W*(.1+i*.17),
    w:16+Math.random()*42,
    skew:(Math.random()-.5)*30,
    a:.06+Math.random()*.07,
    ph:Math.random()*Math.PI*2, phspd:.0025+Math.random()*.003,
    reach:H*(.62+Math.random()*.28),
  }));

  /* 湿气粒子：三景深层 */
  function mkDust(depth){
    return {
      x:Math.random()*W, y:Math.random()*H,
      r:(.3+Math.random()*1.2)*depth,
      vx:(Math.random()-.5)*.1*depth,
      vy:(-.02-Math.random()*.12)*depth,
      a:(.06+Math.random()*.25)*depth,
      ph:Math.random()*Math.PI*2,
      depth,
    };
  }
  const dustLayers=[
    Array.from({length:55},()=>mkDust(.35)),
    Array.from({length:45},()=>mkDust(.65)),
    Array.from({length:30},()=>mkDust(1.0)),
  ];

  /* 地面反光斑点 */
  const groundSpots=Array.from({length:18},()=>({
    x:Math.random()*W, y:H*(.78+Math.random()*.22),
    rx:12+Math.random()*38, ry:2+Math.random()*7,
    a:.04+Math.random()*.08, spd:(Math.random()-.5)*.08,
  }));

  let t=0;
  function draw(){
    ctx.clearRect(0,0,W,H); t++;

    /* 光柱 */
    rays.forEach(r=>{
      r.ph+=r.phspd;
      const nx=r.cx+noise(r.cx/W,t*.003,t*.003)*18;
      const pulse=.74+.26*Math.sin(r.ph);

      /* 外散射 */
      const go=ctx.createLinearGradient(nx,0,nx,r.reach*.88);
      go.addColorStop(0,'rgba(190,255,160,.06)');
      go.addColorStop(.35,`rgba(170,245,140,${r.a*.42*pulse})`);
      go.addColorStop(1,'rgba(150,230,120,0)');
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(nx-r.w*1.9,0); ctx.lineTo(nx+r.w*1.9,0);
      ctx.lineTo(nx+r.w*1.9+r.skew,r.reach*.88);
      ctx.lineTo(nx-r.w*1.9+r.skew,r.reach*.88);
      ctx.closePath(); ctx.fillStyle=go; ctx.fill(); ctx.restore();

      /* 内核 */
      const gi=ctx.createLinearGradient(nx,0,nx,r.reach);
      gi.addColorStop(0,  `rgba(215,255,180,${r.a*1.4*pulse})`);
      gi.addColorStop(.28,`rgba(195,248,160,${r.a*.88*pulse})`);
      gi.addColorStop(.7, `rgba(165,235,130,${r.a*.28*pulse})`);
      gi.addColorStop(1,  'rgba(140,220,110,0)');
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(nx-r.w*.38,0); ctx.lineTo(nx+r.w*.38,0);
      ctx.lineTo(nx+r.w*.38+r.skew*.6,r.reach);
      ctx.lineTo(nx-r.w*.38+r.skew*.6,r.reach);
      ctx.closePath(); ctx.fillStyle=gi; ctx.fill(); ctx.restore();
    });

    /* 地面反光 */
    groundSpots.forEach(s=>{
      s.x+=s.spd;
      if(s.x<-s.rx)s.x=W+s.rx; if(s.x>W+s.rx)s.x=-s.rx;
      ctx.save(); ctx.translate(s.x,s.y);
      const gg=ctx.createRadialGradient(0,0,0,0,0,s.rx);
      gg.addColorStop(0,`rgba(200,255,160,${s.a})`);
      gg.addColorStop(1,'rgba(160,220,120,0)');
      ctx.scale(1,s.ry/s.rx);
      ctx.beginPath(); ctx.arc(0,0,s.rx,0,Math.PI*2);
      ctx.fillStyle=gg; ctx.fill(); ctx.restore();
    });

    /* 湿气粒子从远到近 */
    dustLayers.forEach(layer=>{
      layer.forEach((p,i)=>{
        p.x+=p.vx+Math.sin(t*.01+p.ph)*.18*p.depth;
        p.y+=p.vy;
        if(p.y<-8){p.y=H+8;p.x=Math.random()*W;}
        if(p.x<0)p.x=W; if(p.x>W)p.x=0;
        const flicker=p.a*(0.45+0.55*Math.abs(Math.sin(t*.016+p.ph)));
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(205,255,175,${flicker})`; ctx.fill();
      });
    });

    _af=requestAnimationFrame(draw);
  } draw();
}
