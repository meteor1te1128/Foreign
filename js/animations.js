/* Foreign · animations.js
   原则：Canvas 只画动态叠加元素，绝不覆盖背景图颜色
   纯白/纯黑：无任何 Canvas 绘制                          */

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
  /* 'none' → 不做任何事，Canvas 保持透明 */
}

/* ── 工具 ──────────────────────────────────────────────── */
function noise(x, y, t) {
  return Math.sin(x*.8+t*.7)*.4 + Math.sin(x*1.6-y*.4+t*.5)*.25
       + Math.sin(y*1.1+t*.9)*.2 + Math.sin(x*.3+y*.7+t*.3)*.15;
}
function lerp(a,b,t){return a+(b-a)*t;}
function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v));}

/* ═══════════════════════════════════════════════════════
   🌊 深海
   只画：气泡 + 淡光柱（不画任何蓝色背景层）
═══════════════════════════════════════════════════════ */
function _ocean(ctx, W, H) {

  /* 焦散光斑 — 极淡，只是隐约闪光 */
  const caustics = Array.from({length:24}, () => ({
    x:Math.random()*W, y:H*(.52+Math.random()*.48),
    rx:12+Math.random()*44, ry:2+Math.random()*8,
    rot:Math.random()*Math.PI, rspd:(Math.random()-.5)*.002,
    a:.015+Math.random()*.025, spd:(Math.random()-.5)*.14,
  }));

  /* 气泡：三档尺寸 */
  function mkBub(init) {
    const tier=Math.random();
    const r=tier<.62?.4+Math.random()*1.0 : tier<.88?1.4+Math.random()*2.0 : 3+Math.random()*4.5;
    return {
      x:Math.random()*W, y:init?Math.random()*H:H+r+6,
      r, sp:(.14+Math.random()*.4)*(1.8/r+.5),
      wb:(Math.random()-.5)*.28, ph:Math.random()*Math.PI*2,
      phspd:.009+Math.random()*.016, a:.08+Math.random()*.22,
    };
  }
  const bubbles=Array.from({length:85},()=>mkBub(true));

  /* 光柱：仅用极淡白色，不带蓝色 */
  const rays=Array.from({length:7},(_,i)=>({
    cx:W*(.05+i*.14),
    w:20+Math.random()*50,
    skew:(Math.random()-.5)*40,
    a:.022+Math.random()*.03,   /* 很淡 */
    ph:Math.random()*Math.PI*2, phspd:.003+Math.random()*.004,
    reach:H*(.45+Math.random()*.35),
  }));

  let t=0;
  function draw(){
    ctx.clearRect(0,0,W,H); t+=.006;

    /* 光柱：白色半透明，不染蓝 */
    rays.forEach(r=>{
      r.ph+=r.phspd;
      const nx=r.cx+noise(r.cx/W,t*.3,t)*18;
      const pulse=.7+.3*Math.sin(r.ph);

      /* 外晕 */
      const go=ctx.createLinearGradient(nx,0,nx,r.reach*.9);
      go.addColorStop(0,`rgba(255,255,255,${r.a*.6*pulse})`);
      go.addColorStop(.4,`rgba(220,240,255,${r.a*.25*pulse})`);
      go.addColorStop(1,'rgba(200,230,255,0)');
      ctx.save(); ctx.beginPath();
      ctx.moveTo(nx-r.w*1.8,0); ctx.lineTo(nx+r.w*1.8,0);
      ctx.lineTo(nx+r.w*1.8+r.skew,r.reach*.9);
      ctx.lineTo(nx-r.w*1.8+r.skew,r.reach*.9);
      ctx.closePath(); ctx.fillStyle=go; ctx.fill(); ctx.restore();

      /* 内核 */
      const gi=ctx.createLinearGradient(nx,0,nx,r.reach);
      gi.addColorStop(0,`rgba(255,255,255,${r.a*1.3*pulse})`);
      gi.addColorStop(.3,`rgba(230,245,255,${r.a*.8*pulse})`);
      gi.addColorStop(.7,`rgba(210,235,255,${r.a*.22*pulse})`);
      gi.addColorStop(1,'rgba(200,230,255,0)');
      ctx.save(); ctx.beginPath();
      ctx.moveTo(nx-r.w*.35,0); ctx.lineTo(nx+r.w*.35,0);
      ctx.lineTo(nx+r.w*.35+r.skew*.5,r.reach);
      ctx.lineTo(nx-r.w*.35+r.skew*.5,r.reach);
      ctx.closePath(); ctx.fillStyle=gi; ctx.fill(); ctx.restore();
    });

    /* 焦散 */
    caustics.forEach(c=>{
      c.x+=c.spd; c.rot+=c.rspd;
      if(c.x<-c.rx*2)c.x=W+c.rx; if(c.x>W+c.rx*2)c.x=-c.rx;
      ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.rot);
      const cg=ctx.createRadialGradient(0,0,0,0,0,c.rx);
      cg.addColorStop(0,`rgba(200,240,255,${c.a})`);
      cg.addColorStop(1,'rgba(180,220,255,0)');
      ctx.scale(1,c.ry/c.rx);
      ctx.beginPath(); ctx.arc(0,0,c.rx,0,Math.PI*2);
      ctx.fillStyle=cg; ctx.fill(); ctx.restore();
    });

    /* 气泡 */
    bubbles.forEach((b,i)=>{
      b.ph+=b.phspd; b.y-=b.sp; b.x+=Math.sin(b.ph)*b.wb;
      if(b.y<-b.r*2) bubbles[i]=mkBub(false);
      if(b.x<-10)b.x=W+10; if(b.x>W+10)b.x=-10;
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
      ctx.strokeStyle=`rgba(210,240,255,${b.a*.9})`; ctx.lineWidth=b.r>2?.8:.4; ctx.stroke();
      if(b.r>1.0){
        const hg=ctx.createRadialGradient(b.x-b.r*.35,b.y-b.r*.35,0,b.x-b.r*.35,b.y-b.r*.35,b.r*.6);
        hg.addColorStop(0,`rgba(255,255,255,${b.a*.7})`);
        hg.addColorStop(1,'rgba(255,255,255,0)');
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
        ctx.fillStyle=hg; ctx.fill();
      }
    });
    _af=requestAnimationFrame(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌲 雾林
   只画：萤火虫 + 局部雾气（用径向渐变，不用矩形色块）
═══════════════════════════════════════════════════════ */
function _mist(ctx, W, H) {

  /* 雾气：用多个大椭圆径向渐变，不画矩形 */
  const fogBlobs=Array.from({length:12},()=>({
    x:Math.random()*W, y:H*(.38+Math.random()*.55),
    rx:120+Math.random()*220, ry:28+Math.random()*55,
    a:.05+Math.random()*.08,
    spd:(Math.random()-.5)*.08,
    ph:Math.random()*Math.PI*2,
  }));

  /* 萤火虫：3个群落，有引力聚集 */
  const clusters=[
    {cx:W*.2,cy:H*.55,r:W*.16},
    {cx:W*.6,cy:H*.48,r:W*.2},
    {cx:W*.84,cy:H*.62,r:W*.13},
  ];
  const fireflies=Array.from({length:20},(_,i)=>{
    const cl=clusters[i%3];
    return {
      x:cl.cx+(Math.random()-.5)*cl.r,
      y:cl.cy+(Math.random()-.5)*cl.r*.6,
      vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.18,
      ph:Math.random()*Math.PI*2,
      blinkPh:Math.random()*Math.PI*2, blinkSpd:.02+Math.random()*.038,
      sz:3+Math.random()*4.5,
      hue:95+Math.random()*65,
      cl:i%3, trail:[],
    };
  });

  let t=0;
  function draw(){
    ctx.clearRect(0,0,W,H); t++;

    /* 雾气椭圆 */
    fogBlobs.forEach(f=>{
      f.x+=f.spd; f.ph+=.004;
      if(f.x<-f.rx)f.x=W+f.rx; if(f.x>W+f.rx)f.x=-f.rx;
      const jitter=Math.sin(f.ph)*8;
      ctx.save(); ctx.translate(f.x,f.y+jitter);
      const g=ctx.createRadialGradient(0,0,0,0,0,f.rx);
      g.addColorStop(0,`rgba(200,218,210,${f.a})`);
      g.addColorStop(.5,`rgba(190,212,205,${f.a*.45})`);
      g.addColorStop(1,'rgba(185,210,200,0)');
      ctx.scale(1,f.ry/f.rx);
      ctx.beginPath(); ctx.arc(0,0,f.rx,0,Math.PI*2);
      ctx.fillStyle=g; ctx.fill(); ctx.restore();
    });

    /* 萤火虫 */
    fireflies.forEach(f=>{
      const cl=clusters[f.cl];
      f.vx+=(cl.cx-f.x)*.00014; f.vy+=(cl.cy-f.y)*.00009;
      f.vx+=Math.sin(t*.017+f.ph)*.02; f.vy+=Math.cos(t*.013+f.ph)*.014;
      f.vx*=.986; f.vy*=.986;
      f.x+=f.vx; f.y+=f.vy;
      f.blinkPh+=f.blinkSpd;
      f.trail.push({x:f.x,y:f.y});
      if(f.trail.length>16)f.trail.shift();
      const blink=Math.max(0,.18+.82*Math.abs(Math.sin(f.blinkPh)));

      /* 尾迹 */
      for(let i=1;i<f.trail.length;i++){
        const p0=f.trail[i-1],p1=f.trail[i],prog=i/f.trail.length;
        ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p1.x,p1.y);
        ctx.strokeStyle=`hsla(${f.hue},88%,64%,${blink*prog*.3})`;
        ctx.lineWidth=prog*1.6; ctx.stroke();
      }
      /* 外晕 */
      const gr=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.sz*2.5);
      gr.addColorStop(0,`hsla(${f.hue},90%,70%,${blink*.5})`);
      gr.addColorStop(.45,`hsla(${f.hue},80%,60%,${blink*.15})`);
      gr.addColorStop(1,'hsla(120,70%,50%,0)');
      ctx.beginPath(); ctx.arc(f.x,f.y,f.sz*2.5,0,Math.PI*2);
      ctx.fillStyle=gr; ctx.fill();
      /* 核心 */
      ctx.beginPath(); ctx.arc(f.x,f.y,f.sz*.42,0,Math.PI*2);
      ctx.fillStyle=`hsla(${f.hue+18},95%,90%,${blink})`; ctx.fill();
    });
    _af=requestAnimationFrame(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌌 星空 — 银河密度分布 + 大气燃烧流星
═══════════════════════════════════════════════════════ */
function _stars(ctx, W, H) {
  const MW_CX=W*.52,MW_CY=H*.42,MW_W=W*.55;
  function mwW(x,y){const dx=(x-MW_CX)/MW_W,dy=(y-MW_CY)/(H*.28);return Math.exp(-(dx*dx+dy*dy)*2.6);}

  const stars=Array.from({length:260},()=>{
    let x,y;
    for(let i=0;i<8;i++){x=Math.random()*W;y=Math.random()*H*.94;if(Math.random()<mwW(x,y)*1.7)break;}
    const inMW=mwW(x,y)>.32;
    return {
      x,y,
      r:inMW?.15+Math.random()*.85:.2+Math.random()*1.4,
      a:inMW?.4+Math.random()*.6:.18+Math.random()*.78,
      da:(Math.random()-.5)*.01, tw:Math.random()>.4,
      hue:Math.random()<.14?220+Math.random()*28:Math.random()<.08?25+Math.random()*14:0,
      sat:Math.random()<.22?55+Math.random()*30:0,
    };
  });

  /* 银河薄雾 */
  const mwG=ctx.createRadialGradient(MW_CX,MW_CY,0,MW_CX,MW_CY,MW_W*.62);
  mwG.addColorStop(0,'rgba(185,178,255,.04)');
  mwG.addColorStop(.5,'rgba(160,155,240,.018)');
  mwG.addColorStop(1,'rgba(140,138,220,0)');

  let meteors=[],t=0;
  function draw(){
    ctx.clearRect(0,0,W,H); t++;
    /* 银河薄雾 */
    ctx.save(); ctx.scale(1,.52);
    ctx.fillStyle=mwG; ctx.fillRect(0,0,W,H*2); ctx.restore();

    stars.forEach(s=>{
      if(s.tw){s.a+=s.da;if(s.a<.05||s.a>1)s.da*=-1;}
      const col=s.sat>0?`hsla(${s.hue},${s.sat}%,90%,${s.a})`:`rgba(222,220,255,${s.a})`;
      if(s.r>1.0&&s.a>.62){
        const dl=s.r*4.5;
        ctx.strokeStyle=`rgba(215,212,255,${s.a*.15})`;
        ctx.lineWidth=.5;
        ctx.beginPath();ctx.moveTo(s.x-dl,s.y);ctx.lineTo(s.x+dl,s.y);ctx.stroke();
        ctx.beginPath();ctx.moveTo(s.x,s.y-dl);ctx.lineTo(s.x,s.y+dl);ctx.stroke();
      }
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=col;ctx.fill();
    });

    if(Math.random()<.0022){
      const ang=Math.PI*(.16+Math.random()*.15);
      meteors.push({x:Math.random()*W*.72,y:Math.random()*H*.36,
        vx:Math.cos(ang)*(11+Math.random()*9),vy:Math.sin(ang)*(11+Math.random()*9),
        life:1,tail:[]});
    }
    meteors=meteors.filter(m=>m.life>0);
    meteors.forEach(m=>{
      m.tail.push({x:m.x,y:m.y});
      if(m.tail.length>24)m.tail.shift();
      m.x+=m.vx;m.y+=m.vy;m.life-=.018;
      for(let i=1;i<m.tail.length;i++){
        const p0=m.tail[i-1],p1=m.tail[i],prog=i/m.tail.length;
        const r2=Math.round(lerp(255,255,prog)),g2=Math.round(lerp(190,255,prog)),b2=Math.round(lerp(70,255,prog));
        ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.lineTo(p1.x,p1.y);
        ctx.strokeStyle=`rgba(${r2},${g2},${b2},${m.life*prog*.88})`;
        ctx.lineWidth=prog*2.6;ctx.stroke();
      }
      const hg=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,5);
      hg.addColorStop(0,`rgba(255,255,255,${m.life})`);
      hg.addColorStop(.5,`rgba(255,215,110,${m.life*.5})`);
      hg.addColorStop(1,'rgba(255,170,40,0)');
      ctx.beginPath();ctx.arc(m.x,m.y,5,0,Math.PI*2);ctx.fillStyle=hg;ctx.fill();
    });
    _af=requestAnimationFrame(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌧️ 雨夜 — 景深雨丝 + 玻璃水珠
═══════════════════════════════════════════════════════ */
function _rain(ctx, W, H) {
  const rainLayers=[
    Array.from({length:110},()=>({x:Math.random()*W,y:Math.random()*H,len:5+Math.random()*7,sp:6+Math.random()*4,a:.04+Math.random()*.06,w:.38})),
    Array.from({length:90},()=>({x:Math.random()*W,y:Math.random()*H,len:9+Math.random()*12,sp:11+Math.random()*6,a:.07+Math.random()*.1,w:.6})),
    Array.from({length:55},()=>({x:Math.random()*W,y:Math.random()*H,len:14+Math.random()*20,sp:16+Math.random()*9,a:.1+Math.random()*.16,w:1.0})),
  ];
  function mkDrop(){return{x:Math.random()*W,y:-10,r:2.2+Math.random()*5.5,vy:0,gr:.024+Math.random()*.038,a:.3+Math.random()*.4,trail:[],stretch:1};}
  const drops=Array.from({length:42},()=>({...mkDrop(),y:Math.random()*H,vy:Math.random()*2}));
  setInterval(()=>{const i=Math.floor(Math.random()*drops.length);Object.assign(drops[i],mkDrop());},340);

  function draw(){
    ctx.clearRect(0,0,W,H);
    rainLayers.forEach(layer=>layer.forEach(d=>{
      d.y+=d.sp;d.x+=d.sp*.23;
      if(d.y>H){d.y=-d.len;d.x=Math.random()*W;}
      ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x+d.len*.23,d.y+d.len);
      ctx.strokeStyle=`rgba(170,205,242,${d.a})`;ctx.lineWidth=d.w;ctx.stroke();
    }));
    drops.forEach((b,i)=>{
      const rolling=b.vy>.05;
      if(rolling){b.vy+=b.gr;b.y+=b.vy;b.stretch=clamp(1+b.vy*.075,1,2.1);b.trail.push({x:b.x,y:b.y});if(b.trail.length>13)b.trail.shift();}
      else b.vy+=b.gr;
      if(b.y>H+18)Object.assign(drops[i],mkDrop());
      if(b.trail.length>2){
        ctx.beginPath();ctx.moveTo(b.trail[0].x,b.trail[0].y);
        b.trail.forEach(p=>ctx.lineTo(p.x,p.y));
        ctx.strokeStyle=`rgba(178,215,255,${b.a*.18})`;ctx.lineWidth=b.r*.65;ctx.stroke();
      }
      ctx.save();ctx.translate(b.x,b.y);ctx.scale(1,b.stretch);
      const g=ctx.createRadialGradient(-b.r*.28,-b.r*.28,b.r*.05,0,0,b.r);
      g.addColorStop(0,`rgba(255,255,255,${b.a*.95})`);
      g.addColorStop(.38,`rgba(215,235,255,${b.a*.58})`);
      g.addColorStop(.75,`rgba(155,198,238,${b.a*.22})`);
      g.addColorStop(1,`rgba(95,165,218,${b.a*.04})`);
      ctx.beginPath();ctx.arc(0,0,b.r,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
      ctx.beginPath();ctx.arc(0,0,b.r,0,Math.PI*2);
      ctx.strokeStyle=`rgba(138,182,228,${b.a*.3})`;ctx.lineWidth=.75;ctx.stroke();
      ctx.beginPath();ctx.arc(-b.r*.3,-b.r*.3,b.r*.3,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${b.a*.78})`;ctx.fill();
      ctx.restore();
    });
    _af=requestAnimationFrame(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌠 极光 — 噪声帘子（不画背景色）
═══════════════════════════════════════════════════════ */
function _aurora(ctx, W, H) {
  const curtains=[
    {yBase:.15,height:.28,color0:'0,225,115', color1:'0,165,88', speed:.5,freq:2.1,amp:.056,phase:0,ns:.032},
    {yBase:.20,height:.22,color0:'52,200,252',color1:'12,150,215',speed:.34,freq:3.1,amp:.033,phase:Math.PI*.65,ns:.026},
    {yBase:.11,height:.32,color0:'122,52,252',color1:'72,12,195', speed:.65,freq:1.72,amp:.068,phase:Math.PI*1.3,ns:.04},
    {yBase:.27,height:.18,color0:'0,252,172', color1:'0,192,132',speed:.38,freq:2.85,amp:.023,phase:Math.PI*.32,ns:.019},
  ];
  const snow=Array.from({length:90},()=>({x:Math.random()*W,y:Math.random()*H,r:.28+Math.random()*1.8,sp:.18+Math.random()*.58,sw:Math.random()*Math.PI*2,sws:.005+Math.random()*.012,a:.08+Math.random()*.45}));
  let t=0;
  function draw(){
    ctx.clearRect(0,0,W,H);t+=.0052;
    curtains.forEach(c=>{
      const step=3,top=[],bot=[];
      for(let x=0;x<=W;x+=step){
        const nx=x/W;
        const n=noise(nx*3,t*.36,t+c.phase*.5)*c.ns;
        const wave=Math.sin(nx*Math.PI*c.freq+t*c.speed+c.phase)*c.amp
                  +Math.sin(nx*Math.PI*c.freq*1.82-t*c.speed*1.32+c.phase)*c.amp*.36+n;
        const yTop=H*(c.yBase+wave);
        const yBot=yTop+H*c.height*(.66+.34*Math.abs(Math.sin(nx*4.1+t)));
        top.push({x,y:yTop});bot.push({x,y:yBot});
      }
      ctx.save();ctx.beginPath();
      top.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
      for(let i=bot.length-1;i>=0;i--)ctx.lineTo(bot[i].x,bot[i].y);
      ctx.closePath();
      const avgTop=top.reduce((s,p)=>s+p.y,0)/top.length;
      const avgBot=bot.reduce((s,p)=>s+p.y,0)/bot.length;
      const gv=ctx.createLinearGradient(0,avgTop,0,avgBot);
      const pulse=.84+.16*Math.sin(t*1.72+c.phase);
      gv.addColorStop(0,`rgba(${c.color0},0)`);
      gv.addColorStop(.09,`rgba(${c.color0},${.17*pulse})`);
      gv.addColorStop(.40,`rgba(${c.color0},${.25*pulse})`);
      gv.addColorStop(.72,`rgba(${c.color1},${.14*pulse})`);
      gv.addColorStop(1,`rgba(${c.color1},0)`);
      ctx.fillStyle=gv;ctx.fill();
      ctx.beginPath();
      top.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
      ctx.strokeStyle=`rgba(${c.color0},${.22*pulse})`;ctx.lineWidth=1.6;ctx.stroke();
      ctx.restore();
    });
    snow.forEach(s=>{
      s.sw+=s.sws;s.y+=s.sp;s.x+=Math.sin(s.sw)*.38;
      if(s.y>H+4){s.y=-4;s.x=Math.random()*W;}
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(218,240,255,${s.a})`;ctx.fill();
    });
    _af=requestAnimationFrame(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌸 樱花 — 贝塞尔花瓣 + 风场 + 正反面
═══════════════════════════════════════════════════════ */
function _sakura(ctx, W, H) {
  let windX=.35,windTarget=.35;
  setInterval(()=>{windTarget=(Math.random()-.3)*1.1;},3800);

  const petals=Array.from({length:95},()=>({
    x:Math.random()*W,y:Math.random()*H,
    sz:4.5+Math.random()*8.5,
    vx:(Math.random()-.5)*.45,vy:.28+Math.random()*1.1,
    rot:Math.random()*Math.PI*2,rv:(Math.random()-.5)*.028,
    sw:Math.random()*Math.PI*2,sws:.007+Math.random()*.015,
    a:.32+Math.random()*.58,
    flipAnim:Math.random()*Math.PI*2,flipSpd:.007+Math.random()*.014,
    veinA:.12+Math.random()*.18,
  }));

  function draw(){
    ctx.clearRect(0,0,W,H);
    windX+=(windTarget-windX)*.007;
    petals.forEach(p=>{
      p.sw+=p.sws;p.rot+=p.rv;p.flipAnim+=p.flipSpd;
      p.x+=p.vx+windX+Math.sin(p.sw)*.6;
      p.y+=p.vy+Math.cos(p.sw*.7)*.22;
      if(p.y>H+22){p.y=-22;p.x=Math.random()*W;}
      if(p.x<-28)p.x=W+28;if(p.x>W+28)p.x=-28;
      const flip=Math.cos(p.flipAnim),isBack=flip<0;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.scale(flip,1);ctx.globalAlpha=p.a;
      ctx.beginPath();
      ctx.moveTo(0,p.sz*.52);
      ctx.bezierCurveTo(p.sz*.88,p.sz*.18,p.sz*.82,-p.sz*.33,0,-p.sz*.43);
      ctx.bezierCurveTo(-p.sz*.82,-p.sz*.33,-p.sz*.88,p.sz*.18,0,p.sz*.52);
      ctx.closePath();
      const g=ctx.createRadialGradient(0,-p.sz*.18,0,0,p.sz*.08,p.sz*1.02);
      if(!isBack){g.addColorStop(0,'rgba(255,232,240,.97)');g.addColorStop(.5,'rgba(255,202,220,.88)');g.addColorStop(1,'rgba(255,172,202,.2)');}
      else{g.addColorStop(0,'rgba(238,188,208,.94)');g.addColorStop(.5,'rgba(222,158,188,.8)');g.addColorStop(1,'rgba(208,138,172,.16)');}
      ctx.fillStyle=g;ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0,p.sz*.5);ctx.quadraticCurveTo(0,0,0,-p.sz*.4);
      ctx.moveTo(0,p.sz*.08);ctx.quadraticCurveTo(-p.sz*.48,-p.sz*.04,-p.sz*.68,-p.sz*.23);
      ctx.moveTo(0,p.sz*.08);ctx.quadraticCurveTo(p.sz*.48,-p.sz*.04,p.sz*.68,-p.sz*.23);
      ctx.strokeStyle=`rgba(208,138,172,${p.veinA})`;ctx.lineWidth=.52;ctx.stroke();
      ctx.restore();ctx.globalAlpha=1;
    });
    _af=requestAnimationFrame(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌅 火烧云
   只画：丁达尔光束 + 极淡云层高光（不画渐变背景色）
═══════════════════════════════════════════════════════ */
function _clouds(ctx, W, H) {

  /* 丁达尔光束：暖白色，不带橙色（橙色来自背景图） */
  const tyndall=Array.from({length:7},(_,i)=>({
    cx:W*(.06+i*.155)+Math.random()*W*.04,
    w:14+Math.random()*38,
    a:.018+Math.random()*.028,   /* 很淡 */
    ph:Math.random()*Math.PI*2,phspd:.0025+Math.random()*.0035,
    reach:H*(.38+Math.random()*.32),
    skew:(Math.random()-.5)*48,
  }));

  /* 云层高光：只在云的位置加淡淡反光，不遮背景 */
  const cloudGlows=Array.from({length:10},()=>({
    x:Math.random()*W,y:H*(.06+Math.random()*.42),
    rx:55+Math.random()*130,ry:14+Math.random()*32,
    a:.022+Math.random()*.035,
    spd:(Math.random()-.5)*.06,
  }));

  let t=0;
  function draw(){
    ctx.clearRect(0,0,W,H);t+=.003;

    /* 光束 */
    tyndall.forEach(r=>{
      r.ph+=r.phspd;
      const nx=r.cx+Math.sin(r.ph*.6)*14;
      const pulse=.72+.28*Math.sin(r.ph);
      const gt=ctx.createLinearGradient(nx,0,nx,r.reach);
      gt.addColorStop(0,`rgba(255,240,200,${r.a*1.4*pulse})`);
      gt.addColorStop(.3,`rgba(255,228,175,${r.a*.8*pulse})`);
      gt.addColorStop(.72,`rgba(255,210,140,${r.a*.22*pulse})`);
      gt.addColorStop(1,'rgba(255,195,110,0)');
      ctx.save();ctx.beginPath();
      ctx.moveTo(nx-r.w*.45,0);ctx.lineTo(nx+r.w*.45,0);
      ctx.lineTo(nx+r.w*.45+r.skew,r.reach);ctx.lineTo(nx-r.w*.45+r.skew,r.reach);
      ctx.closePath();ctx.fillStyle=gt;ctx.fill();ctx.restore();
    });

    /* 云层边缘高光 */
    cloudGlows.forEach(c=>{
      c.x+=c.spd;
      if(c.x<-c.rx)c.x=W+c.rx;if(c.x>W+c.rx)c.x=-c.rx;
      ctx.save();ctx.translate(c.x,c.y);
      const g=ctx.createRadialGradient(0,-c.ry*.3,0,0,0,c.rx);
      g.addColorStop(0,`rgba(255,245,210,${c.a})`);
      g.addColorStop(.5,`rgba(255,225,168,${c.a*.4})`);
      g.addColorStop(1,'rgba(255,200,120,0)');
      ctx.scale(1,c.ry/c.rx);
      ctx.beginPath();ctx.arc(0,0,c.rx,0,Math.PI*2);
      ctx.fillStyle=g;ctx.fill();ctx.restore();
    });

    _af=requestAnimationFrame(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🏔️ 雪山 — 六角雪花 + 风场景深 + 地面积雪
═══════════════════════════════════════════════════════ */
function _snow(ctx, W, H) {
  let windX=.18,windTarget=.18;
  setInterval(()=>{windTarget=(Math.random()-.5)*1.5;},4800);

  function drawFlake(ctx,r){
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3,mx=Math.cos(a)*r*.55,my=Math.sin(a)*r*.55,sa=a+Math.PI/2;
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke();
      ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(mx+Math.cos(sa)*r*.27,my+Math.sin(sa)*r*.27);ctx.stroke();
      ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(mx-Math.cos(sa)*r*.27,my-Math.sin(sa)*r*.27);ctx.stroke();
    }
  }

  const layers=[
    Array.from({length:58},()=>({d:.22,x:Math.random()*W,y:Math.random()*H,r:.35+Math.random()*.75,sp:.16+Math.random()*.25,sw:Math.random()*Math.PI*2,sws:.004+Math.random()*.007,a:.08+Math.random()*.25})),
    Array.from({length:46},()=>({d:.58,x:Math.random()*W,y:Math.random()*H,r:.75+Math.random()*1.5,sp:.32+Math.random()*.5,sw:Math.random()*Math.PI*2,sws:.005+Math.random()*.009,a:.18+Math.random()*.4})),
    Array.from({length:28},()=>({d:1.0,x:Math.random()*W,y:Math.random()*H,r:1.6+Math.random()*3.0,sp:.65+Math.random()*.85,sw:Math.random()*Math.PI*2,sws:.007+Math.random()*.013,a:.32+Math.random()*.52})),
  ];

  const piles=Array.from({length:7},(_,i)=>({x:W*(i/6),h:H*.035+Math.random()*H*.055,w:W*.2+Math.random()*W*.14}));

  function draw(){
    ctx.clearRect(0,0,W,H);
    windX+=(windTarget-windX)*.005;

    /* 地面积雪：极淡 */
    piles.forEach(p=>{
      const g=ctx.createRadialGradient(p.x,H,0,p.x,H-p.h*.5,p.w*.55);
      g.addColorStop(0,'rgba(235,244,255,.22)');g.addColorStop(1,'rgba(215,230,255,0)');
      ctx.beginPath();ctx.ellipse(p.x,H,p.w*.5,p.h,0,Math.PI,0);
      ctx.fillStyle=g;ctx.fill();
    });

    layers.forEach(layer=>layer.forEach(f=>{
      f.sw+=f.sws;f.y+=f.sp;f.x+=windX*f.d+Math.sin(f.sw)*f.d*.45;
      if(f.y>H+8){f.y=-8;f.x=Math.random()*W;}
      if(f.x<-18)f.x=W+18;if(f.x>W+18)f.x=-18;
      ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.sw*.45);ctx.globalAlpha=f.a;
      if(f.r>1.8){
        ctx.strokeStyle=`rgba(242,250,255,${f.a})`;ctx.lineWidth=.55;drawFlake(ctx,f.r);
        ctx.beginPath();ctx.arc(0,0,f.r*.16,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.9)';ctx.fill();
      } else {
        ctx.beginPath();ctx.arc(0,0,f.r,0,Math.PI*2);ctx.fillStyle='rgba(245,252,255,.9)';ctx.fill();
      }
      ctx.restore();ctx.globalAlpha=1;
    }));
    _af=requestAnimationFrame(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌿 雨林 — 体积光 + 湿气景深 + 地面反光
═══════════════════════════════════════════════════════ */
function _forest(ctx, W, H) {
  const rays=Array.from({length:6},(_,i)=>({
    cx:W*(.1+i*.17),w:14+Math.random()*38,
    skew:(Math.random()-.5)*28,a:.045+Math.random()*.055,
    ph:Math.random()*Math.PI*2,phspd:.0022+Math.random()*.003,
    reach:H*(.6+Math.random()*.26),
  }));

  function mkDust(d){return{x:Math.random()*W,y:Math.random()*H,r:(.28+Math.random()*1.1)*d,vx:(Math.random()-.5)*.09*d,vy:(-.018-Math.random()*.1)*d,a:(.05+Math.random()*.22)*d,ph:Math.random()*Math.PI*2,d};}
  const dust=[
    Array.from({length:50},()=>mkDust(.32)),
    Array.from({length:40},()=>mkDust(.62)),
    Array.from({length:25},()=>mkDust(1.0)),
  ];

  const groundSpots=Array.from({length:16},()=>({x:Math.random()*W,y:H*(.8+Math.random()*.2),rx:10+Math.random()*34,ry:2+Math.random()*6,a:.03+Math.random()*.065,spd:(Math.random()-.5)*.07}));

  let t=0;
  function draw(){
    ctx.clearRect(0,0,W,H);t++;

    /* 光柱：绿白色 */
    rays.forEach(r=>{
      r.ph+=r.phspd;
      const nx=r.cx+noise(r.cx/W,t*.003,t*.003)*16;
      const pulse=.72+.28*Math.sin(r.ph);
      const go=ctx.createLinearGradient(nx,0,nx,r.reach*.88);
      go.addColorStop(0,`rgba(210,255,175,${r.a*.55*pulse})`);
      go.addColorStop(.38,`rgba(195,248,158,${r.a*.28*pulse})`);
      go.addColorStop(1,'rgba(175,235,138,0)');
      ctx.save();ctx.beginPath();
      ctx.moveTo(nx-r.w*1.85,0);ctx.lineTo(nx+r.w*1.85,0);
      ctx.lineTo(nx+r.w*1.85+r.skew,r.reach*.88);ctx.lineTo(nx-r.w*1.85+r.skew,r.reach*.88);
      ctx.closePath();ctx.fillStyle=go;ctx.fill();ctx.restore();
      const gi=ctx.createLinearGradient(nx,0,nx,r.reach);
      gi.addColorStop(0,`rgba(222,255,188,${r.a*1.35*pulse})`);
      gi.addColorStop(.28,`rgba(205,252,168,${r.a*.82*pulse})`);
      gi.addColorStop(.7,`rgba(178,238,142,${r.a*.26*pulse})`);
      gi.addColorStop(1,'rgba(155,225,118,0)');
      ctx.save();ctx.beginPath();
      ctx.moveTo(nx-r.w*.36,0);ctx.lineTo(nx+r.w*.36,0);
      ctx.lineTo(nx+r.w*.36+r.skew*.58,r.reach);ctx.lineTo(nx-r.w*.36+r.skew*.58,r.reach);
      ctx.closePath();ctx.fillStyle=gi;ctx.fill();ctx.restore();
    });

    /* 地面反光 */
    groundSpots.forEach(s=>{
      s.x+=s.spd;if(s.x<-s.rx)s.x=W+s.rx;if(s.x>W+s.rx)s.x=-s.rx;
      ctx.save();ctx.translate(s.x,s.y);
      const g=ctx.createRadialGradient(0,0,0,0,0,s.rx);
      g.addColorStop(0,`rgba(195,255,155,${s.a})`);g.addColorStop(1,'rgba(158,222,118,0)');
      ctx.scale(1,s.ry/s.rx);ctx.beginPath();ctx.arc(0,0,s.rx,0,Math.PI*2);
      ctx.fillStyle=g;ctx.fill();ctx.restore();
    });

    /* 湿气景深 */
    dust.forEach(layer=>layer.forEach(p=>{
      p.x+=p.vx+Math.sin(t*.01+p.ph)*.16*p.d;p.y+=p.vy;
      if(p.y<-6){p.y=H+6;p.x=Math.random()*W;}
      if(p.x<0)p.x=W;if(p.x>W)p.x=0;
      const fl=p.a*(.42+.58*Math.abs(Math.sin(t*.015+p.ph)));
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(202,255,168,${fl})`;ctx.fill();
    }));
    _af=requestAnimationFrame(draw);
  } draw();
}
