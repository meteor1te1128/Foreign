/* Foreign · animations.js
   铁则：Canvas 只叠加动态元素，绝不画背景色
   纯白/纯黑/none → Canvas 完全透明，立即清空

   Token 机制：每次 startAnim 生成新 token，每个 draw 闭包
   捕获自己的 tk，每帧 raf(draw, tk) 检查 _token === tk，
   不一致立即退出。彻底解决布尔值竞态问题。               */

let _token = 0;    /* 全局 token，每次 startAnim 自增 */
let _ivs   = [];   /* 托管的 setInterval id */

export function stopAnim() {
  _token++;        /* token 变化 → 所有持旧 token 的 draw 自动退出 */
  _ivs.forEach(clearInterval);
  _ivs = [];
}

export function startAnim(type, canvas) {
  stopAnim();
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!type || type === 'none') return;   /* 纯白/纯黑：清空即止 */
  const tk = _token;                      /* 捕获本次启动的 token */
  const W = canvas.width, H = canvas.height;
  const fn = { ocean:_ocean, mist:_mist, stars:_stars, rain:_rain,
                aurora:_aurora, sakura:_sakura, clouds:_clouds,
                snow:_snow, forest:_forest }[type];
  if (fn) fn(ctx, W, H, tk);
}

/* ── 托管 interval ── */
function iv(fn, ms) { const id = setInterval(fn, ms); _ivs.push(id); return id; }

/* ── Token 守卫的 raf：token 不匹配则静默退出，彻底杀死旧循环 ── */
function raf(fn, tk) { if (_token === tk) requestAnimationFrame(fn); }

/* ── 工具 ──────────────────────────────────────────────── */
function noise(x,y,t){return Math.sin(x*.9+t*.8)*.38+Math.sin(x*1.7-y*.5+t*.6)*.24+Math.sin(y*1.2+t*.9)*.22+Math.sin(x*.4+y*.8+t*.35)*.16;}
function lerp(a,b,t){return a+(b-a)*t;}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function rnd(a, b) { return a + Math.random()*(b-a); }
const PI2 = Math.PI * 2;


/* ═══════════════════════════════════════════════════════
   🌊 深海 — 仰视视角
   照片特征：光从水面中央向下辐射，集中在上半部
   水面有波纹折射，中部有微小悬浮颗粒，下方很暗
   光柱从水面集中射出（不均匀分布，中间密）
═══════════════════════════════════════════════════════ */
function _ocean(ctx, W, H, tk) {

  /* 水面焦散：集中在顶部 */
  const caust = Array.from({length:22}, () => ({
    x:rnd(W*.15,W*.85), y:rnd(0,H*.22),
    rx:rnd(20,80), ry:rnd(3,12),
    rot:rnd(0,Math.PI), rspd:rnd(-.003,.003),
    a:rnd(.025,.06), spd:rnd(-.2,.2),
    ph:rnd(0,PI2), phs:rnd(.008,.018),
  }));

  /* 悬浮微粒：均匀分布，极小，向上漂 */
  const motes = Array.from({length:160}, () => ({
    x:rnd(0,W), y:rnd(0,H),
    r:rnd(.25,.9), vy:-rnd(.04,.18),
    vx:rnd(-.04,.04),
    a:rnd(.04,.18), ph:rnd(0,PI2),
  }));

  /* 光柱：中央密集，向两侧稀疏，从顶部射下 */
  const rayCount = 10;
  const rays = Array.from({length:rayCount}, (_, i) => {
    /* 高斯分布：中间多，两侧少 */
    const u = (i/(rayCount-1))*2-1;          /* -1 ~ 1 */
    const cx = W*(.5 + u*.46 + rnd(-.04,.04));
    return {
      cx, w: rnd(12,45),
      a: rnd(.028,.055) * Math.exp(-u*u*1.2),  /* 中间更亮 */
      ph:rnd(0,PI2), phs:rnd(.002,.004),
      reach: rnd(H*.35,H*.75),
      skew: u * rnd(15,40),                   /* 向外倾斜 */
    };
  });

  let t = 0;
  function draw() {
    ctx.clearRect(0,0,W,H); t+=.005;

    /* 光柱 */
    rays.forEach(r => {
      r.ph += r.phs;
      /* 水面波纹让光柱水平轻微摇摆 */
      const nx = r.cx + Math.sin(r.ph)*8 + Math.sin(r.ph*2.3+1)*4;
      const p = .62+.38*Math.sin(r.ph);

      /* 外散射 */
      const go = ctx.createLinearGradient(nx,0,nx,r.reach*.88);
      go.addColorStop(0,   `rgba(255,255,255,${r.a*.6*p})`);
      go.addColorStop(.18, `rgba(200,238,255,${r.a*.38*p})`);
      go.addColorStop(.6,  `rgba(140,210,255,${r.a*.14*p})`);
      go.addColorStop(1,   'rgba(100,185,255,0)');
      ctx.save(); ctx.beginPath();
      ctx.moveTo(nx-r.w*2.2,0); ctx.lineTo(nx+r.w*2.2,0);
      ctx.lineTo(nx+r.w*2.2+r.skew, r.reach*.88);
      ctx.lineTo(nx-r.w*2.2+r.skew, r.reach*.88);
      ctx.closePath(); ctx.fillStyle=go; ctx.fill(); ctx.restore();

      /* 内核亮线 */
      const gi = ctx.createLinearGradient(nx,0,nx,r.reach);
      gi.addColorStop(0,   `rgba(255,255,255,${r.a*1.5*p})`);
      gi.addColorStop(.22, `rgba(230,248,255,${r.a*.92*p})`);
      gi.addColorStop(.65, `rgba(180,228,255,${r.a*.22*p})`);
      gi.addColorStop(1,   'rgba(140,205,255,0)');
      ctx.save(); ctx.beginPath();
      ctx.moveTo(nx-r.w*.32,0); ctx.lineTo(nx+r.w*.32,0);
      ctx.lineTo(nx+r.w*.32+r.skew*.5, r.reach);
      ctx.lineTo(nx-r.w*.32+r.skew*.5, r.reach);
      ctx.closePath(); ctx.fillStyle=gi; ctx.fill(); ctx.restore();
    });

    /* 水面焦散 */
    caust.forEach(c => {
      c.x+=c.spd; c.rot+=c.rspd; c.ph+=c.phs;
      if(c.x<-c.rx*2)c.x=W+c.rx; if(c.x>W+c.rx*2)c.x=-c.rx;
      const pulse=.7+.3*Math.sin(c.ph);
      ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.rot);
      const g=ctx.createRadialGradient(0,0,0,0,0,c.rx);
      g.addColorStop(0,`rgba(200,242,255,${c.a*pulse})`);
      g.addColorStop(.5,`rgba(160,225,255,${c.a*pulse*.4})`);
      g.addColorStop(1,'rgba(120,200,255,0)');
      ctx.scale(1,c.ry/c.rx);
      ctx.beginPath();ctx.arc(0,0,c.rx,0,PI2);
      ctx.fillStyle=g;ctx.fill();ctx.restore();
    });

    /* 悬浮微粒 */
    motes.forEach(m => {
      m.y+=m.vy; m.x+=m.vx+Math.sin(t*.8+m.ph)*.12;
      if(m.y<-5){m.y=H+5;m.x=rnd(0,W);}
      /* 越靠近光柱中心越亮 */
      const distToCenter=Math.abs(m.x-W*.5)/(W*.5);
      const brightness=m.a*(1-distToCenter*.5);
      ctx.beginPath();ctx.arc(m.x,m.y,m.r,0,PI2);
      ctx.fillStyle=`rgba(200,235,255,${brightness})`;ctx.fill();
    });

    raf(draw, tk);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌲 雾林 — 俯视松林
   照片特征：雾是横向带状，穿插在树冠层之间
   冷灰白色调，无萤火虫（白天），雾层有3-4个高度
   轻微水平漂移，边缘自然消散
═══════════════════════════════════════════════════════ */
function _mist(ctx, W, H, tk) {

  /* 雾层：固定在几个树冠高度，横向带状 */
  /* 照片里雾主要在 20%~70% 高度区间 */
  const FOG_BANDS = [
    { yFrac:.18, thickness:.06, speed:.055, density:.82 },
    { yFrac:.32, thickness:.08, speed:.042, density:.95 },
    { yFrac:.46, thickness:.07, speed:.068, density:.78 },
    { yFrac:.58, thickness:.05, speed:.038, density:.72 },
  ];

  /* 每条雾带由多个横向椭圆组成 */
  const fogClouds = [];
  FOG_BANDS.forEach(band => {
    const count = 8 + Math.floor(Math.random()*5);
    for(let i=0;i<count;i++){
      fogClouds.push({
        band,
        x: rnd(-W*.3, W*1.3),
        y: H*band.yFrac + rnd(-H*band.thickness*.4, H*band.thickness*.4),
        rx: rnd(W*.12, W*.32),
        ry: rnd(H*band.thickness*.5, H*band.thickness*1.1),
        a: rnd(.055,.1)*band.density,
        spd: band.speed * rnd(.6,1.4) * (Math.random()>.5?1:-1),
        ph: rnd(0,PI2), phs: rnd(.001,.003),
      });
    }
  });

  let t=0;
  function draw(){
    ctx.clearRect(0,0,W,H); t++;

    fogClouds.forEach(f=>{
      f.x+=f.spd; f.ph+=f.phs;
      /* 超出边界环绕 */
      if(f.x<-f.rx*1.8)f.x=W+f.rx;
      if(f.x>W+f.rx*1.8)f.x=-f.rx;
      /* 轻微上下呼吸 */
      const jy=Math.sin(f.ph)*H*.006;

      ctx.save(); ctx.translate(f.x, f.y+jy);
      const g=ctx.createRadialGradient(0,0,0,0,0,f.rx);
      /* 冷灰白，符合照片色调 */
      g.addColorStop(0,  `rgba(215,220,222,${f.a})`);
      g.addColorStop(.42,`rgba(208,215,218,${f.a*.52})`);
      g.addColorStop(.78,`rgba(200,208,212,${f.a*.18})`);
      g.addColorStop(1,  'rgba(195,205,210,0)');
      ctx.scale(1, f.ry/f.rx);
      ctx.beginPath();ctx.arc(0,0,f.rx,0,PI2);
      ctx.fillStyle=g;ctx.fill();ctx.restore();
    });

    raf(draw, tk);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌌 星空 — 银河斜向穿过
   照片特征：银河从右下角到左上角斜穿，约45°
   地平线右侧有暖橙色光晕（城市光污染/日落余晖）
   上半部星星密，下半部（山脉剪影区）几乎无星
   银河有明显的蓝白尘埃云，不是均匀亮带
═══════════════════════════════════════════════════════ */
function _stars(ctx, W, H, tk) {

  /* 银河轴线：从右下(W*0.85,H*0.82)到左上(W*0.08,H*0.05) */
  const MW_X1=W*.85, MW_Y1=H*.82, MW_X2=W*.08, MW_Y2=H*.05;
  const MW_DX=MW_X2-MW_X1, MW_DY=MW_Y2-MW_Y1;
  const MW_LEN=Math.sqrt(MW_DX*MW_DX+MW_DY*MW_DY);
  /* 银河宽度影响范围 */
  const MW_W=W*.14;
  /* 地平线高度：下方不画星 */
  const HORIZON=H*.75;

  function mwDist(x,y){
    /* 点到银河轴线的距离 */
    const t=clamp(((x-MW_X1)*MW_DX+(y-MW_Y1)*MW_DY)/(MW_LEN*MW_LEN),0,1);
    const px=MW_X1+t*MW_DX, py=MW_Y1+t*MW_DY;
    return Math.sqrt((x-px)**2+(y-py)**2);
  }
  function mwWeight(x,y){
    if(y>HORIZON) return 0;
    const d=mwDist(x,y);
    return Math.exp(-d*d/(MW_W*MW_W)*2.2);
  }

  /* 星星：只在地平线以上，银河带内更密 */
  const stars=Array.from({length:320},()=>{
    let x,y,attempts=0;
    do{ x=rnd(0,W); y=rnd(0,HORIZON*.98); attempts++; }
    while(Math.random()>mwWeight(x,y)*2.5+.08 && attempts<12);
    const inMW=mwDist(x,y)<MW_W*.9;
    return{
      x,y,
      r:inMW?rnd(.1,.75):rnd(.15,1.4),
      a:inMW?rnd(.45,1):rnd(.12,.72),
      da:rnd(-.01,.01), tw:Math.random()>.42,
      hue:Math.random()<.18?rnd(210,240):Math.random()<.1?rnd(18,35):0,
      sat:Math.random()<.28?rnd(50,85):0,
    };
  });

  /* 银河尘埃云：沿轴线分布的椭圆亮斑 */
  const dustClouds=Array.from({length:14},(_,i)=>{
    const t2=rnd(.1,.9);
    return{
      x:MW_X1+t2*MW_DX+rnd(-MW_W*.6,MW_W*.6),
      y:MW_Y1+t2*MW_DY+rnd(-MW_W*.3,MW_W*.3),
      rx:rnd(W*.04,W*.1), ry:rnd(H*.02,H*.055),
      angle:Math.atan2(MW_DY,MW_DX)+rnd(-.3,.3),
      a:rnd(.018,.045),
    };
  });

  /* 地平线暖光晕：右侧 */
  const horizonGlow=ctx.createRadialGradient(W*.72,H*.78,0,W*.72,H*.78,H*.38);
  horizonGlow.addColorStop(0,'rgba(255,175,80,.058)');
  horizonGlow.addColorStop(.4,'rgba(240,140,50,.025)');
  horizonGlow.addColorStop(1,'rgba(200,100,20,0)');

  let meteors=[],t=0;
  function draw(){
    ctx.clearRect(0,0,W,H); t++;

    /* 地平线暖光 */
    ctx.fillStyle=horizonGlow; ctx.fillRect(0,0,W,H);

    /* 银河尘埃云 */
    dustClouds.forEach(d=>{
      ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.angle);
      const g=ctx.createRadialGradient(0,0,0,0,0,d.rx);
      g.addColorStop(0,`rgba(180,200,255,${d.a})`);
      g.addColorStop(.5,`rgba(160,185,248,${d.a*.4})`);
      g.addColorStop(1,'rgba(140,168,240,0)');
      ctx.scale(1,d.ry/d.rx);
      ctx.beginPath();ctx.arc(0,0,d.rx,0,PI2);
      ctx.fillStyle=g;ctx.fill();ctx.restore();
    });

    /* 星星 */
    stars.forEach(s=>{
      if(s.tw){s.a+=s.da;if(s.a<.08||s.a>.98)s.da*=-1;}
      const col=s.sat>0?`hsla(${s.hue},${s.sat}%,92%,${s.a})`:`rgba(222,218,255,${s.a})`;
      if(s.r>1.0&&s.a>.58){
        const dl=s.r*5.5;
        [[s.x-dl,s.y,s.x+dl,s.y],[s.x,s.y-dl,s.x,s.y+dl]].forEach(([x1,y1,x2,y2])=>{
          const g=ctx.createLinearGradient(x1,y1,x2,y2);
          g.addColorStop(0,'rgba(212,208,255,0)');
          g.addColorStop(.5,`rgba(212,208,255,${s.a*.16})`);
          g.addColorStop(1,'rgba(212,208,255,0)');
          ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
          ctx.strokeStyle=g;ctx.lineWidth=.55;ctx.stroke();
        });
      }
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,PI2);
      ctx.fillStyle=col;ctx.fill();
    });

    /* 流星：沿银河方向 */
    if(Math.random()<.0018){
      const baseAng=Math.atan2(MW_DY,MW_DX);
      const ang=baseAng+rnd(-.15,.15);
      meteors.push({x:rnd(W*.1,W*.9),y:rnd(H*.05,H*.5),
        vx:Math.cos(ang)*rnd(10,18),vy:Math.sin(ang)*rnd(10,18),
        life:1,tail:[]});
    }
    meteors=meteors.filter(m=>m.life>0);
    meteors.forEach(m=>{
      m.tail.push({x:m.x,y:m.y});
      if(m.tail.length>24)m.tail.shift();
      m.x+=m.vx;m.y+=m.vy;m.life-=.02;
      for(let i=1;i<m.tail.length;i++){
        const p0=m.tail[i-1],p1=m.tail[i],prog=i/m.tail.length;
        const gg=Math.round(lerp(185,255,prog)),bb=Math.round(lerp(58,255,prog));
        ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.lineTo(p1.x,p1.y);
        ctx.strokeStyle=`rgba(255,${gg},${bb},${m.life*prog*.9})`;
        ctx.lineWidth=prog*2.8;ctx.stroke();
      }
      const hg=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,5);
      hg.addColorStop(0,`rgba(255,255,255,${m.life})`);
      hg.addColorStop(.45,`rgba(255,205,90,${m.life*.5})`);
      hg.addColorStop(1,'rgba(255,158,28,0)');
      ctx.beginPath();ctx.arc(m.x,m.y,5,0,PI2);
      ctx.fillStyle=hg;ctx.fill();
    });
    raf(draw,tk);
  }draw();
}

/* ═══════════════════════════════════════════════════════
   🌿 雨林 — 溪流森林
   照片特征：阳光从树冠正上方竖直射下（接近垂直）
   前景是溪流和石头，中景树干，远景光雾
   光柱是暖黄绿色，垂直方向，有明显体积感
   地面/溪流有光斑反射
   空气中有湿气颗粒，暖绿色调
═══════════════════════════════════════════════════════ */
function _forest(ctx, W, H, tk) {

  /* 光柱：几乎垂直，从顶部射下，暖黄绿 */
  /* 照片里树冠缝隙形成的光柱集中在中央偏左区域 */
  const rays=Array.from({length:7},(_,i)=>{
    const cx=W*(.12+i*.135)+rnd(-W*.03,W*.03);
    return{
      cx, w:rnd(8,28),
      /* 极小倾斜角，基本垂直 */
      skew:rnd(-8,8),
      a:rnd(.05,.085),
      ph:rnd(0,PI2), phs:rnd(.0018,.0028),
      reach:rnd(H*.55,H*.92),
    };
  });

  /* 溪流/地面光斑：下半部 */
  const waterSpots=Array.from({length:14},()=>({
    x:rnd(W*.1,W*.9),
    y:rnd(H*.62,H*.95),
    rx:rnd(6,28), ry:rnd(2,6),
    a:rnd(.035,.08),
    ph:rnd(0,PI2), phs:rnd(.012,.025),
    spd:rnd(-.04,.04),
  }));

  /* 湿气/光尘：暖黄绿，向上漂 */
  function mkMote(d){
    return{
      x:rnd(0,W), y:rnd(0,H),
      r:rnd(.2,.9)*d,
      vx:rnd(-.06,.06)*d,
      vy:-rnd(.015,.1)*d,
      a:rnd(.03,.18)*d,
      ph:rnd(0,PI2), d,
    };
  }
  const motes=[
    Array.from({length:55},()=>mkMote(.3)),
    Array.from({length:40},()=>mkMote(.65)),
    Array.from({length:22},()=>mkMote(1.0)),
  ];

  let t=0;
  function draw(){
    ctx.clearRect(0,0,W,H); t++;

    /* 光柱 */
    rays.forEach(r=>{
      r.ph+=r.phs;
      /* 轻微左右摇摆（树叶遮挡） */
      const nx=r.cx+Math.sin(r.ph)*5+Math.sin(r.ph*1.7+.8)*3;
      const p=.68+.32*Math.sin(r.ph);

      /* 外散射：暖黄绿 */
      const go=ctx.createLinearGradient(nx,0,nx,r.reach*.9);
      go.addColorStop(0,  `rgba(230,255,185,${r.a*.58*p})`);
      go.addColorStop(.25,`rgba(215,252,168,${r.a*.32*p})`);
      go.addColorStop(.65,`rgba(195,240,148,${r.a*.12*p})`);
      go.addColorStop(1,  'rgba(175,228,128,0)');
      ctx.save();ctx.beginPath();
      ctx.moveTo(nx-r.w*2.1,0);ctx.lineTo(nx+r.w*2.1,0);
      ctx.lineTo(nx+r.w*2.1+r.skew,r.reach*.9);
      ctx.lineTo(nx-r.w*2.1+r.skew,r.reach*.9);
      ctx.closePath();ctx.fillStyle=go;ctx.fill();ctx.restore();

      /* 内核：更亮，偏白黄 */
      const gi=ctx.createLinearGradient(nx,0,nx,r.reach);
      gi.addColorStop(0,  `rgba(248,255,210,${r.a*1.45*p})`);
      gi.addColorStop(.2, `rgba(235,255,195,${r.a*.92*p})`);
      gi.addColorStop(.62,`rgba(210,248,168,${r.a*.28*p})`);
      gi.addColorStop(1,  'rgba(185,235,142,0)');
      ctx.save();ctx.beginPath();
      ctx.moveTo(nx-r.w*.35,0);ctx.lineTo(nx+r.w*.35,0);
      ctx.lineTo(nx+r.w*.35+r.skew*.5,r.reach);
      ctx.lineTo(nx-r.w*.35+r.skew*.5,r.reach);
      ctx.closePath();ctx.fillStyle=gi;ctx.fill();ctx.restore();
    });

    /* 溪流/地面光斑 */
    waterSpots.forEach(s=>{
      s.x+=s.spd; s.ph+=s.phs;
      if(s.x<-s.rx)s.x=W+s.rx; if(s.x>W+s.rx)s.x=-s.rx;
      const pulse=.65+.35*Math.abs(Math.sin(s.ph));
      ctx.save();ctx.translate(s.x,s.y);
      const g=ctx.createRadialGradient(0,0,0,0,0,s.rx);
      g.addColorStop(0,`rgba(235,255,195,${s.a*pulse})`);
      g.addColorStop(.5,`rgba(210,248,168,${s.a*pulse*.38})`);
      g.addColorStop(1,'rgba(185,235,142,0)');
      ctx.scale(1,s.ry/s.rx);
      ctx.beginPath();ctx.arc(0,0,s.rx,0,PI2);
      ctx.fillStyle=g;ctx.fill();ctx.restore();
    });

    /* 湿气光尘 */
    motes.forEach(layer=>layer.forEach(m=>{
      m.x+=m.vx+Math.sin(t*.009+m.ph)*.12*m.d;
      m.y+=m.vy;
      if(m.y<-4){m.y=H+4;m.x=rnd(0,W);}
      if(m.x<0)m.x=W; if(m.x>W)m.x=0;
      const fl=m.a*(.38+.62*Math.abs(Math.sin(t*.012+m.ph)));
      ctx.beginPath();ctx.arc(m.x,m.y,m.r,0,PI2);
      ctx.fillStyle=`rgba(222,255,185,${fl})`;ctx.fill();
    }));

    raf(draw,tk);
  }draw();
}

function _rain(ctx, W, H, tk) {

  /* ── 附着水珠 ─────────────────────────────────────── */
  function mkDot(init) {
    return {
      x: rnd(0, W),
      y: init ? rnd(0, H) : rnd(0, H * .35),
      r: rnd(1.5, 5.5),           /* 当前半径 */
      maxR: rnd(5, 14),           /* 开始流动的阈值 */
      growSpd: rnd(.008, .022),   /* 积水速度 */
      a: rnd(.38, .62),
      flowing: false,
      /* 流动状态 */
      vy: 0, vx: 0,
      path: [],                   /* 流过的路径点 */
      pathMaxLen: 120,
      wobble: rnd(-.012, .012),   /* 左右摆动倾向 */
      wobblePh: rnd(0, Math.PI*2),
      dead: false,
    };
  }

  const dots = Array.from({length: 55}, () => mkDot(true));

  /* 每隔一段时间补充新水珠 */
  iv(() => {
    const deadIdx = dots.findIndex(d => d.dead);
    if (deadIdx >= 0) {
      dots[deadIdx] = mkDot(false);
    } else if (dots.length < 75) {
      dots.push(mkDot(false));
    }
  }, 280);

  /* ── 绘制单个水珠 ─────────────────────────────────── */
  function drawDrop(x, y, r, a, stretch) {
    const sy = stretch || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, sy);

    /* 主体：径向渐变模拟折射 */
    const g = ctx.createRadialGradient(
      -r*.3, -r*.35, r*.04,
       r*.1,  r*.1,  r
    );
    g.addColorStop(0,   `rgba(255,255,255,${a*.92})`);
    g.addColorStop(.22, `rgba(230,242,255,${a*.72})`);
    g.addColorStop(.55, `rgba(185,215,245,${a*.35})`);
    g.addColorStop(.82, `rgba(155,195,235,${a*.12})`);
    g.addColorStop(1,   `rgba(130,180,225,${a*.04})`);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, PI2);
    ctx.fillStyle = g; ctx.fill();

    /* 边缘细环：表面张力感 */
    ctx.strokeStyle = `rgba(180,215,248,${a*.22})`;
    ctx.lineWidth = .6; ctx.stroke();

    /* 左上高光（主光源） */
    const hg = ctx.createRadialGradient(-r*.32,-r*.38, 0, -r*.28,-r*.32, r*.38);
    hg.addColorStop(0, `rgba(255,255,255,${a*.88})`);
    hg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath(); ctx.arc(0, 0, r, 0, PI2);
    ctx.fillStyle = hg; ctx.fill();

    /* 右下暗面折射 */
    ctx.beginPath();
    ctx.arc(r*.22, r*.28, r*.28, 0, PI2);
    ctx.fillStyle = `rgba(140,185,230,${a*.14})`; ctx.fill();

    ctx.restore();
  }

  /* ── 绘制流痕 ─────────────────────────────────────── */
  function drawTrail(path, r, a) {
    if (path.length < 3) return;
    const w = clamp(r * .55, .8, 3.5);

    /* 流痕主体：细，半透明 */
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      /* 用二次贝塞尔让路径有自然弯曲 */
      const mx = (path[i-1].x + path[i].x) * .5;
      const my = (path[i-1].y + path[i].y) * .5;
      ctx.quadraticCurveTo(path[i-1].x, path[i-1].y, mx, my);
    }
    ctx.strokeStyle = `rgba(200,228,252,${a * .28})`;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    /* 流痕高光边：更细更亮 */
    ctx.beginPath();
    ctx.moveTo(path[0].x - w*.3, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x - w*.3, path[i].y);
    }
    ctx.strokeStyle = `rgba(255,255,255,${a * .18})`;
    ctx.lineWidth = w * .35;
    ctx.stroke();
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t++;

    dots.forEach((d, i) => {
      if (d.dead) return;

      if (!d.flowing) {
        /* 积水阶段：缓慢变大 */
        d.r += d.growSpd;

        /* 稍微抖动，模拟玻璃振动 */
        const jx = Math.sin(t * .04 + d.wobblePh) * .15;
        const jy = Math.cos(t * .03 + d.wobblePh) * .08;

        drawDrop(d.x + jx, d.y + jy, d.r, d.a, 1);

        /* 达到阈值，开始流动 */
        if (d.r >= d.maxR) {
          d.flowing = true;
          d.vy = rnd(.4, 1.2);
          d.vx = d.wobble * d.r * 2;
          d.path.push({x: d.x, y: d.y});
        }

      } else {
        /* 流动阶段 */
        d.vy = Math.min(d.vy + rnd(.018, .032), 3.8);
        /* 流痕会左右轻微摆动 */
        d.wobblePh += .045;
        d.vx += Math.sin(d.wobblePh) * .04 + d.wobble * .15;
        d.vx *= .88;  /* 横向阻尼 */

        d.x += d.vx;
        d.y += d.vy;

        /* 流动时水珠拉长 */
        const stretch = clamp(1 + d.vy * .055, 1, 1.65);

        d.path.push({x: d.x, y: d.y});
        if (d.path.length > d.pathMaxLen) d.path.shift();

        /* 先画流痕，再画水珠（水珠在最上面） */
        drawTrail(d.path, d.r, d.a);
        drawDrop(d.x, d.y, d.r * .85, d.a, stretch);

        /* 偶尔留下残余小水珠 */
        if (Math.random() < .012 && d.r > 5) {
          dots.push({
            ...mkDot(false),
            x: d.x + rnd(-4, 4),
            y: d.y - rnd(5, 20),
            r: rnd(1, 3),
            maxR: 999,   /* 不再流动 */
            growSpd: 0,
            flowing: false,
            a: rnd(.2, .4),
          });
        }

        /* 流出屏幕或合并（简化：流出屏幕则标记死亡） */
        if (d.y > H + 20 || d.x < -10 || d.x > W + 10) {
          d.dead = true;
        }
      }
    });

    /* 清理死亡粒子，保留流痕继续显示一段时间 */
    for (let i = dots.length - 1; i >= 0; i--) {
      if (dots[i].dead && dots[i].path.length === 0) {
        dots.splice(i, 1);
      } else if (dots[i].dead) {
        /* 流痕逐渐消失 */
        dots[i].a -= .004;
        if (dots[i].a > .05) drawTrail(dots[i].path, dots[i].r, dots[i].a);
        else dots.splice(i, 1);
      }
    }

    raf(draw, tk);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌠 极光 — 完全重写，贴合照片
   照片特征：
   · 竖向光柱从地平线（H*0.62）向上辐射，不是横帘
   · 绿色主导，紫色穿插，顶部有弧形卷曲
   · 光柱有竖向条纹感，亮度不均匀
   · 冰面/雪地有极光倒影（绿色反光）
   · 背景布满星点
═══════════════════════════════════════════════════════ */
function _aurora(ctx, W, H, tk) {

  const HORIZON = H * .64;   /* 地平线位置，光柱从这里升起 */

  /* ── 星星（背景，上半天空） ─────────────────────────── */
  const stars = Array.from({length:220}, () => ({
    x: rnd(0, W), y: rnd(0, HORIZON * 1.1),
    r: rnd(.15, 1.2), a: rnd(.2, .85),
    da: rnd(-.008, .008), tw: Math.random() > .45,
  }));

  /* ── 极光光柱组 ─────────────────────────────────────── */
  /* 每组光柱：从地平线某点向上展开，有扇形张角 */
  const GROUPS = [
    /* 绿色主群：画面中偏左，最亮 */
    { cx:W*.38, spread:W*.28, count:9,
      hue0:145, hue1:162, bright:1.0,
      ph:0, phspd:.0042, swayAm:.018 },
    /* 绿色右群 */
    { cx:W*.62, spread:W*.22, count:7,
      hue0:148, hue1:168, bright:.85,
      ph:Math.PI*.7, phspd:.0038, swayAm:.015 },
    /* 紫色群：画面中偏右上 */
    { cx:W*.55, spread:W*.35, count:8,
      hue0:275, hue1:295, bright:.72,
      ph:Math.PI*1.2, phspd:.005, swayAm:.022 },
    /* 绿色左侧细束 */
    { cx:W*.18, spread:W*.14, count:5,
      hue0:150, hue1:165, bright:.6,
      ph:Math.PI*.4, phspd:.0035, swayAm:.012 },
  ];

  /* 预生成每根光柱的固定属性 */
  const beams = [];
  GROUPS.forEach(g => {
    for (let i = 0; i < g.count; i++) {
      const frac = (i / (g.count-1)) - .5;   /* -0.5 ~ 0.5 */
      beams.push({
        /* 底部起点：沿地平线分布在扇形内 */
        bx0: g.cx + frac * g.spread * rnd(.7, 1.0),
        /* 顶部终点：向上辐射，有随机偏移 */
        tx0: g.cx + frac * g.spread * rnd(.3, .6) + rnd(-W*.04, W*.04),
        ty0: rnd(H*.02, H*.28),
        /* 宽度：底宽顶窄 */
        wBot: rnd(W*.008, W*.025),
        wTop: rnd(W*.001, W*.006),
        /* 颜色 */
        hue: rnd(g.hue0, g.hue1),
        /* 亮度 & 相位 */
        a: rnd(.08, .22) * g.bright,
        ph: g.ph + rnd(0, PI2),
        phspd: g.phspd * rnd(.7, 1.3),
        swayAm: g.swayAm,
        /* 顶部卷曲：随噪声偏移 */
        curlPh: rnd(0, PI2),
        curlSpd: rnd(.003, .007),
        g,
      });
    }
  });

  /* ── 冰面倒影光斑（地平线以下） ────────────────────── */
  const reflections = Array.from({length:8}, () => ({
    x: rnd(W*.15, W*.85),
    y: rnd(HORIZON + H*.04, H*.92),
    rx: rnd(W*.04, W*.12),
    ry: rnd(H*.008, H*.022),
    hue: Math.random() > .3 ? rnd(148,165) : rnd(275,295),
    a: rnd(.04, .1),
    ph: rnd(0, PI2), phspd: rnd(.003, .008),
  }));

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += .005;

    /* ── 星星 ── */
    stars.forEach(s => {
      if (s.tw) { s.a += s.da; if (s.a < .08 || s.a > .88) s.da *= -1; }
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, PI2);
      ctx.fillStyle = `rgba(210,222,255,${s.a})`; ctx.fill();
    });

    /* ── 光柱 ── */
    beams.forEach(b => {
      b.ph += b.phspd;
      b.curlPh += b.curlSpd;

      /* 随时间摇摆：顶部偏移更大（旗帜效果） */
      const sway = Math.sin(b.ph) * b.swayAm;
      const curlX = Math.sin(b.curlPh) * W * .04;
      const curlY = Math.cos(b.curlPh * .7) * H * .025;

      const bx = b.bx0 + Math.sin(b.ph * .6) * W * .008;
      const tx = b.tx0 + curlX + sway * W * .5;
      const ty = b.ty0 + curlY;

      /* 脉冲亮度 */
      const pulse = .72 + .28 * Math.sin(b.ph * 1.8);
      const alpha = b.a * pulse;

      /* 光柱形状：梯形，底宽顶窄 */
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bx - b.wBot, HORIZON);
      ctx.lineTo(bx + b.wBot, HORIZON);
      ctx.lineTo(tx + b.wTop, ty);
      ctx.lineTo(tx - b.wTop, ty);
      ctx.closePath();

      /* 竖向渐变：底部亮→顶部消失 */
      const gv = ctx.createLinearGradient(0, HORIZON, 0, ty);
      gv.addColorStop(0,   `hsla(${b.hue},95%,62%,0)`);
      gv.addColorStop(.08, `hsla(${b.hue},95%,68%,${alpha*.9})`);
      gv.addColorStop(.35, `hsla(${b.hue},90%,65%,${alpha})`);
      gv.addColorStop(.72, `hsla(${b.hue},85%,58%,${alpha*.55})`);
      gv.addColorStop(1,   `hsla(${b.hue},80%,52%,0)`);
      ctx.fillStyle = gv; ctx.fill();

      /* 光柱中轴亮线：模拟竖向条纹中最亮的一根 */
      ctx.beginPath();
      ctx.moveTo(bx, HORIZON);
      ctx.lineTo(tx, ty);
      const gl = ctx.createLinearGradient(0, HORIZON, 0, ty);
      gl.addColorStop(0,   `hsla(${b.hue},100%,82%,0)`);
      gl.addColorStop(.12, `hsla(${b.hue},100%,88%,${alpha*.7})`);
      gl.addColorStop(.5,  `hsla(${b.hue},100%,85%,${alpha*.45})`);
      gl.addColorStop(1,   `hsla(${b.hue},100%,80%,0)`);
      ctx.strokeStyle = gl;
      ctx.lineWidth = clamp(b.wBot * .18, .5, 2.5);
      ctx.stroke();

      ctx.restore();
    });

    /* ── 冰面倒影 ── */
    reflections.forEach(r => {
      r.ph += r.phspd;
      const pulse = .7 + .3 * Math.sin(r.ph);
      ctx.save(); ctx.translate(r.x, r.y);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r.rx);
      g.addColorStop(0,   `hsla(${r.hue},90%,60%,${r.a * pulse})`);
      g.addColorStop(.5,  `hsla(${r.hue},85%,52%,${r.a * pulse * .4})`);
      g.addColorStop(1,   `hsla(${r.hue},80%,45%,0)`);
      ctx.scale(1, r.ry / r.rx);
      ctx.beginPath(); ctx.arc(0, 0, r.rx, 0, PI2);
      ctx.fillStyle = g; ctx.fill();
      ctx.restore();
    });

    raf(draw, tk);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌸 樱花 — 贝塞尔花瓣 + 风场 + 正反面翻转
═══════════════════════════════════════════════════════ */
function _sakura(ctx, W, H, tk) {
  let wx=.32, wt=.32;
  iv(() => { wt=rnd(-.35,1.1); }, 4000);

  const pets = Array.from({length:100}, () => ({
    x:rnd(0,W), y:rnd(0,H),
    sz:rnd(4,12), vx:rnd(-.45,.45), vy:rnd(.25,1.1),
    rot:rnd(0,PI2), rv:rnd(-.03,.03),
    sw:rnd(0,PI2), sws:rnd(.007,.016),
    a:rnd(.3,.65), fa:rnd(0,PI2), fs:rnd(.006,.015),
    vi:rnd(.1,.22),
  }));

  function draw() {
    ctx.clearRect(0,0,W,H);
    wx += (wt-wx)*.007;

    pets.forEach(p => {
      p.sw+=p.sws; p.rot+=p.rv; p.fa+=p.fs;
      p.x += p.vx + wx + Math.sin(p.sw)*.62;
      p.y += p.vy + Math.cos(p.sw*.7)*.2;
      if (p.y>H+22) { p.y=-22; p.x=rnd(0,W); }
      if (p.x<-28) p.x=W+28; else if (p.x>W+28) p.x=-28;

      const flip=Math.cos(p.fa), back=flip<0;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.scale(flip,1); ctx.globalAlpha=p.a;

      const s=p.sz;
      ctx.beginPath();
      ctx.moveTo(0,s*.52);
      ctx.bezierCurveTo( s*.88, s*.18,  s*.82,-s*.34, 0,-s*.43);
      ctx.bezierCurveTo(-s*.82,-s*.34, -s*.88, s*.18,  0, s*.52);
      ctx.closePath();

      const g = ctx.createRadialGradient(0,-s*.18,0, 0,s*.08,s*1.02);
      if (!back) {
        g.addColorStop(0,  'rgba(255,234,242,.98)');
        g.addColorStop(.5, 'rgba(255,204,222,.9)');
        g.addColorStop(1,  'rgba(255,174,204,.18)');
      } else {
        g.addColorStop(0,  'rgba(238,190,210,.96)');
        g.addColorStop(.5, 'rgba(222,160,190,.82)');
        g.addColorStop(1,  'rgba(208,140,174,.14)');
      }
      ctx.fillStyle=g; ctx.fill();

      /* 脉络 */
      ctx.beginPath();
      ctx.moveTo(0,s*.5); ctx.quadraticCurveTo(0,0,0,-s*.41);
      ctx.moveTo(0,s*.08); ctx.quadraticCurveTo(-s*.46,-s*.04,-s*.66,-s*.22);
      ctx.moveTo(0,s*.08); ctx.quadraticCurveTo( s*.46,-s*.04, s*.66,-s*.22);
      ctx.strokeStyle=`rgba(208,140,174,${p.vi})`; ctx.lineWidth=.52; ctx.stroke();

      ctx.restore(); ctx.globalAlpha=1;
    });
    raf(draw, tk);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌅 火烧云 — 丁达尔光束 + 云层高光（不覆盖背景）
═══════════════════════════════════════════════════════ */
function _clouds(ctx, W, H, tk) {
  const rays = Array.from({length:8}, (_, i) => ({
    cx:W*(.05+i*.135)+rnd(-W*.03,W*.03),
    w:rnd(12,44), a:rnd(.016,.034),
    ph:rnd(0,PI2), phs:rnd(.002,.004),
    reach:rnd(H*.3,H*.7), skew:rnd(-55,55),
  }));
  const cg = Array.from({length:12}, () => ({
    x:rnd(0,W), y:rnd(H*.04,H*.5),
    rx:rnd(44,148), ry:rnd(12,40),
    a:rnd(.018,.04), spd:rnd(-.065,.065),
    ph:rnd(0,PI2), phs:rnd(.001,.003),
  }));

  let t = 0;
  function draw() {
    ctx.clearRect(0,0,W,H); t+=.003;

    rays.forEach(r => {
      r.ph += r.phs;
      const nx=r.cx+Math.sin(r.ph*.6)*16, p=.68+.32*Math.sin(r.ph);
      const gt = ctx.createLinearGradient(nx,0,nx,r.reach);
      gt.addColorStop(0,   `rgba(255,242,205,${r.a*1.55*p})`);
      gt.addColorStop(.32, `rgba(255,232,178,${r.a*.82*p})`);
      gt.addColorStop(.72, `rgba(255,218,148,${r.a*.2*p})`);
      gt.addColorStop(1,   'rgba(255,198,112,0)');
      ctx.save(); ctx.beginPath();
      ctx.moveTo(nx-r.w*.46,0);    ctx.lineTo(nx+r.w*.46,0);
      ctx.lineTo(nx+r.w*.46+r.skew,r.reach); ctx.lineTo(nx-r.w*.46+r.skew,r.reach);
      ctx.closePath(); ctx.fillStyle=gt; ctx.fill(); ctx.restore();
    });

    cg.forEach(c => {
      c.x+=c.spd; c.ph+=c.phs;
      if (c.x<-c.rx) c.x=W+c.rx; else if (c.x>W+c.rx) c.x=-c.rx;
      const jy = Math.sin(c.ph)*7;
      ctx.save(); ctx.translate(c.x,c.y+jy);
      const g = ctx.createRadialGradient(0,-c.ry*.28,0, 0,0,c.rx);
      g.addColorStop(0,  `rgba(255,245,215,${c.a})`);
      g.addColorStop(.5, `rgba(255,228,170,${c.a*.36})`);
      g.addColorStop(1,  'rgba(255,204,118,0)');
      ctx.scale(1,c.ry/c.rx);
      ctx.beginPath(); ctx.arc(0,0,c.rx,0,PI2);
      ctx.fillStyle=g; ctx.fill(); ctx.restore();
    });
    raf(draw, tk);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🏔️ 雪山 — 六角雪花 + 3景深 + 风场 + 地面积雪
═══════════════════════════════════════════════════════ */
function _snow(ctx, W, H, tk) {
  let wx=.18, wt=.18;
  iv(() => { wt=rnd(-.9,1.9); }, 5000);

  function flake(ctx, r) {
    for (let i=0; i<6; i++) {
      const a=i*Math.PI/3, mx=Math.cos(a)*r*.55, my=Math.sin(a)*r*.55, sa=a+Math.PI/2;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx,my); ctx.lineTo(mx+Math.cos(sa)*r*.27,my+Math.sin(sa)*r*.27); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx,my); ctx.lineTo(mx-Math.cos(sa)*r*.27,my-Math.sin(sa)*r*.27); ctx.stroke();
    }
  }

  const layers = [
    Array.from({length:62},()=>({d:.2, x:rnd(0,W),y:rnd(0,H),r:rnd(.3,.75), sp:rnd(.14,.28),sw:rnd(0,PI2),sws:rnd(.003,.007),a:rnd(.07,.24)})),
    Array.from({length:48},()=>({d:.58,x:rnd(0,W),y:rnd(0,H),r:rnd(.72,1.6),sp:rnd(.3,.56), sw:rnd(0,PI2),sws:rnd(.005,.009),a:rnd(.16,.42)})),
    Array.from({length:28},()=>({d:1.0,x:rnd(0,W),y:rnd(0,H),r:rnd(1.8,3.4),sp:rnd(.62,.95),sw:rnd(0,PI2),sws:rnd(.007,.014),a:rnd(.3,.56)})),
  ];
  const piles = Array.from({length:8}, (_,i) => ({
    x:W*(i/7), h:rnd(H*.03,H*.072), w:rnd(W*.16,W*.26)
  }));

  function draw() {
    ctx.clearRect(0,0,W,H);
    wx += (wt-wx)*.005;

    /* 地面积雪 */
    piles.forEach(p => {
      const g = ctx.createRadialGradient(p.x,H,0, p.x,H-p.h*.5,p.w*.55);
      g.addColorStop(0, 'rgba(238,246,255,.2)'); g.addColorStop(1,'rgba(218,232,255,0)');
      ctx.beginPath(); ctx.ellipse(p.x,H,p.w*.5,p.h,0,Math.PI,0);
      ctx.fillStyle=g; ctx.fill();
    });

    layers.forEach(lr => lr.forEach(f => {
      f.sw+=f.sws; f.y+=f.sp; f.x+=wx*f.d+Math.sin(f.sw)*f.d*.42;
      if (f.y>H+8) { f.y=-8; f.x=rnd(0,W); }
      if (f.x<-18) f.x=W+18; else if (f.x>W+18) f.x=-18;

      ctx.save(); ctx.translate(f.x,f.y); ctx.rotate(f.sw*.44); ctx.globalAlpha=f.a;
      if (f.r>1.85) {
        ctx.strokeStyle=`rgba(244,252,255,${f.a})`; ctx.lineWidth=.55; flake(ctx,f.r);
        ctx.beginPath(); ctx.arc(0,0,f.r*.16,0,PI2);
        ctx.fillStyle='rgba(255,255,255,.92)'; ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(0,0,f.r,0,PI2);
        ctx.fillStyle='rgba(246,253,255,.92)'; ctx.fill();
      }
      ctx.restore(); ctx.globalAlpha=1;
    }));
    raf(draw, tk);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌿 雨林 — 绿色体积光 + 3景深湿气 + 地面反光
═══════════════════════════════════════════════════════ */
