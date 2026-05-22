/* Foreign · animations.js
   铁则：Canvas 只叠加动态元素，绝不画背景色
   纯白/纯黑/none → Canvas 完全透明，立即清空
   _alive 标志确保切换主题后旧 draw 循环不多跑一帧  */

let _alive = false;   /* 存活标志：stopAnim 置 false，旧 draw 自动退出 */
let _ivs   = [];      /* 托管的 setInterval id，stopAnim 时全部清除 */

export function stopAnim() {
  _alive = false;
  _ivs.forEach(clearInterval);
  _ivs = [];
}

export function startAnim(type, canvas) {
  stopAnim();
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!type || type === 'none') return;   /* 纯白/纯黑：清空即止 */
  _alive = true;
  const W = canvas.width, H = canvas.height;
  const fn = { ocean:_ocean, mist:_mist, stars:_stars, rain:_rain,
                aurora:_aurora, sakura:_sakura, clouds:_clouds,
                snow:_snow, forest:_forest }[type];
  if (fn) fn(ctx, W, H);
}

/* ── 托管 interval ── */
function iv(fn, ms) { const id = setInterval(fn, ms); _ivs.push(id); return id; }

/* ── 带存活检查的 raf：旧动画 _alive=false 后自动停 ── */
function raf(fn) { if (_alive) requestAnimationFrame(fn); }

/* ── 工具 ──────────────────────────────────────────────── */
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function rnd(a, b) { return a + Math.random()*(b-a); }
const PI2 = Math.PI * 2;

/* ═══════════════════════════════════════════════════════
   🌊 深海 — 白色体积光柱 + 焦散 + 物理气泡
═══════════════════════════════════════════════════════ */
function _ocean(ctx, W, H) {

  const caust = Array.from({length:28}, () => ({
    x:rnd(0,W), y:rnd(H*.5,H),
    rx:rnd(10,52), ry:rnd(2,9),
    rot:rnd(0,Math.PI), rspd:rnd(-.002,.002),
    a:rnd(.018,.042), spd:rnd(-.15,.15),
  }));

  function mkB(init) {
    const t = Math.random();
    const r = t<.62 ? rnd(.3,.95) : t<.88 ? rnd(1.3,2.9) : rnd(3,6.8);
    return { x:rnd(0,W), y:init?rnd(0,H):H+r+5, r,
      sp:(.12+.4/r)*rnd(.7,1.3), wb:rnd(-.28,.28),
      ph:rnd(0,PI2), phs:rnd(.008,.02), a:rnd(.07,.28) };
  }
  const bubs = Array.from({length:90}, () => mkB(true));

  /* 8根光柱，均匀分布 */
  const rays = Array.from({length:8}, (_, i) => ({
    cx: W*(.04+i*.135), w:rnd(18,58),
    skew:rnd(-44,44), a:rnd(.024,.05),
    ph:rnd(0,PI2), phs:rnd(.0022,.0048),
    reach:rnd(H*.4,H*.84),
  }));

  let t = 0;
  function draw() {
    ctx.clearRect(0,0,W,H);
    t += .006;

    rays.forEach(r => {
      r.ph += r.phs;
      const nx = r.cx + noise(r.cx/W, t*.3, t)*22;
      const p  = .66 + .34*Math.sin(r.ph);

      /* 外散射晕 */
      const go = ctx.createLinearGradient(nx,0,nx,r.reach*.9);
      go.addColorStop(0,   `rgba(255,255,255,${r.a*.52*p})`);
      go.addColorStop(.45, `rgba(228,244,255,${r.a*.2*p})`);
      go.addColorStop(1,   'rgba(210,235,255,0)');
      ctx.save(); ctx.beginPath();
      ctx.moveTo(nx-r.w*2,0);       ctx.lineTo(nx+r.w*2,0);
      ctx.lineTo(nx+r.w*2+r.skew,r.reach*.9);
      ctx.lineTo(nx-r.w*2+r.skew,r.reach*.9);
      ctx.closePath(); ctx.fillStyle=go; ctx.fill(); ctx.restore();

      /* 内核 */
      const gi = ctx.createLinearGradient(nx,0,nx,r.reach);
      gi.addColorStop(0,   `rgba(255,255,255,${r.a*1.45*p})`);
      gi.addColorStop(.26, `rgba(242,252,255,${r.a*.88*p})`);
      gi.addColorStop(.68, `rgba(220,242,255,${r.a*.18*p})`);
      gi.addColorStop(1,   'rgba(198,230,255,0)');
      ctx.save(); ctx.beginPath();
      ctx.moveTo(nx-r.w*.38,0);      ctx.lineTo(nx+r.w*.38,0);
      ctx.lineTo(nx+r.w*.38+r.skew*.5,r.reach);
      ctx.lineTo(nx-r.w*.38+r.skew*.5,r.reach);
      ctx.closePath(); ctx.fillStyle=gi; ctx.fill(); ctx.restore();
    });

    /* 焦散光斑 */
    caust.forEach(c => {
      c.x += c.spd; c.rot += c.rspd;
      if (c.x < -c.rx*2) c.x = W+c.rx;
      if (c.x >  W+c.rx*2) c.x = -c.rx;
      ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.rot);
      const g = ctx.createRadialGradient(0,0,0,0,0,c.rx);
      g.addColorStop(0, `rgba(205,242,255,${c.a})`);
      g.addColorStop(1, 'rgba(178,224,255,0)');
      ctx.scale(1, c.ry/c.rx);
      ctx.beginPath(); ctx.arc(0,0,c.rx,0,PI2);
      ctx.fillStyle=g; ctx.fill(); ctx.restore();
    });

    /* 气泡 */
    bubs.forEach((b, i) => {
      b.ph += b.phs; b.y -= b.sp; b.x += Math.sin(b.ph)*b.wb;
      if (b.y < -b.r*2) bubs[i] = mkB(false);
      if (b.x < -12) b.x = W+12; else if (b.x > W+12) b.x = -12;

      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,PI2);
      ctx.strokeStyle = `rgba(212,244,255,${b.a*.9})`;
      ctx.lineWidth = b.r>2 ? .85 : .42; ctx.stroke();

      if (b.r > 1.1) {
        const hx=b.x-b.r*.34, hy=b.y-b.r*.34;
        const hg = ctx.createRadialGradient(hx,hy,0, hx,hy,b.r*.65);
        hg.addColorStop(0, `rgba(255,255,255,${b.a*.74})`);
        hg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,PI2);
        ctx.fillStyle=hg; ctx.fill();
      }
    });
    raf(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌲 雾林 — 椭圆雾气（零硬边）+ 萤火虫群落
═══════════════════════════════════════════════════════ */
function _mist(ctx, W, H) {

  /* 18个大椭圆雾团，全部径向渐变，无矩形 */
  const fogs = Array.from({length:18}, () => ({
    x:rnd(-W*.2,W*1.2), y:rnd(H*.28,H*.88),
    rx:rnd(95,290), ry:rnd(20,65),
    a:rnd(.042,.1), spd:rnd(-.09,.09),
    ph:rnd(0,PI2), phs:rnd(.0018,.005),
  }));

  /* 3个群落，萤火虫有引力+阻尼+尾迹 */
  const cl = [{cx:W*.2,cy:H*.55,r:W*.16},{cx:W*.6,cy:H*.47,r:W*.2},{cx:W*.84,cy:H*.62,r:W*.13}];
  const ffs = Array.from({length:22}, (_, i) => {
    const c = cl[i%3];
    return { x:c.cx+rnd(-c.r,c.r), y:c.cy+rnd(-c.r*.6,c.r*.6),
      vx:rnd(-.22,.22), vy:rnd(-.16,.16),
      ph:rnd(0,PI2), bph:rnd(0,PI2), bspd:rnd(.018,.044),
      sz:rnd(3,8), hue:rnd(92,168), ci:i%3, trail:[] };
  });

  let t = 0;
  function draw() {
    ctx.clearRect(0,0,W,H); t++;

    fogs.forEach(f => {
      f.x += f.spd; f.ph += f.phs;
      if (f.x < -f.rx*1.5) f.x = W+f.rx;
      if (f.x >  W+f.rx*1.5) f.x = -f.rx;
      const jy = Math.sin(f.ph)*12;
      ctx.save(); ctx.translate(f.x, f.y+jy);
      const g = ctx.createRadialGradient(0,0,0,0,0,f.rx);
      g.addColorStop(0,  `rgba(200,218,210,${f.a})`);
      g.addColorStop(.5, `rgba(192,212,205,${f.a*.4})`);
      g.addColorStop(1,  'rgba(185,208,200,0)');
      ctx.scale(1, f.ry/f.rx);
      ctx.beginPath(); ctx.arc(0,0,f.rx,0,PI2);
      ctx.fillStyle=g; ctx.fill(); ctx.restore();
    });

    ffs.forEach(f => {
      const c = cl[f.ci];
      f.vx += (c.cx-f.x)*.00013 + Math.sin(t*.016+f.ph)*.02;
      f.vy += (c.cy-f.y)*.00009  + Math.cos(t*.012+f.ph)*.014;
      f.vx *= .986; f.vy *= .986;
      f.x += f.vx; f.y += f.vy;
      f.bph += f.bspd;
      f.trail.push({x:f.x, y:f.y});
      if (f.trail.length > 18) f.trail.shift();
      const blink = Math.max(0, .14+.86*Math.abs(Math.sin(f.bph)));

      for (let i=1; i<f.trail.length; i++) {
        const p0=f.trail[i-1], p1=f.trail[i], prog=i/f.trail.length;
        ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p1.x,p1.y);
        ctx.strokeStyle = `hsla(${f.hue},88%,64%,${blink*prog*.3})`;
        ctx.lineWidth = prog*1.8; ctx.stroke();
      }
      const gr = ctx.createRadialGradient(f.x,f.y,0, f.x,f.y,f.sz*2.8);
      gr.addColorStop(0,   `hsla(${f.hue},90%,70%,${blink*.54})`);
      gr.addColorStop(.42, `hsla(${f.hue},80%,60%,${blink*.14})`);
      gr.addColorStop(1,   'hsla(120,70%,50%,0)');
      ctx.beginPath(); ctx.arc(f.x,f.y,f.sz*2.8,0,PI2); ctx.fillStyle=gr; ctx.fill();
      ctx.beginPath(); ctx.arc(f.x,f.y,f.sz*.44,0,PI2);
      ctx.fillStyle = `hsla(${f.hue+20},96%,92%,${blink})`; ctx.fill();
    });
    raf(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌌 星空 — 银河密度分布 + 大气燃烧流星 + 十字衍射
═══════════════════════════════════════════════════════ */
function _stars(ctx, W, H) {
  const MX=W*.52, MY=H*.42, MW=W*.55, MH=H*.28;
  function mw(x,y) {
    const dx=(x-MX)/MW, dy=(y-MY)/MH;
    return Math.exp(-(dx*dx+dy*dy)*2.6);
  }

  const stars = Array.from({length:280}, () => {
    let x, y;
    for (let i=0; i<9; i++) {
      x=rnd(0,W); y=rnd(0,H*.95);
      if (Math.random() < mw(x,y)*1.8) break;
    }
    const inMW = mw(x,y)>.3;
    return { x, y,
      r:  inMW ? rnd(.12,.88) : rnd(.18,1.55),
      a:  inMW ? rnd(.4,1)    : rnd(.15,.84),
      da: rnd(-.012,.012), tw: Math.random()>.38,
      hue: Math.random()<.14 ? rnd(218,248) : Math.random()<.09 ? rnd(22,38) : 0,
      sat: Math.random()<.23 ? rnd(55,88) : 0 };
  });

  /* 银河薄雾：用椭圆径向渐变，不用 fillRect */
  const mwGrad = ctx.createRadialGradient(MX,MY,0, MX,MY,MW*.65);
  mwGrad.addColorStop(0,   'rgba(188,180,255,.04)');
  mwGrad.addColorStop(.55, 'rgba(162,156,242,.015)');
  mwGrad.addColorStop(1,   'rgba(142,140,222,0)');

  let meteors = [], t = 0;
  function draw() {
    ctx.clearRect(0,0,W,H); t++;

    /* 银河薄雾：椭圆，不遮背景 */
    ctx.save(); ctx.translate(MX, MY); ctx.scale(1, MH/MW);
    ctx.beginPath(); ctx.arc(0,0,MW*.65,0,PI2);
    ctx.fillStyle=mwGrad; ctx.fill(); ctx.restore();

    stars.forEach(s => {
      if (s.tw) { s.a += s.da; if (s.a<.05||s.a>1) s.da*=-1; }
      const col = s.sat>0 ? `hsla(${s.hue},${s.sat}%,90%,${s.a})` : `rgba(224,220,255,${s.a})`;

      /* 亮星十字衍射 */
      if (s.r>1.0 && s.a>.6) {
        const dl = s.r*5;
        [[s.x-dl,s.y,s.x+dl,s.y],[s.x,s.y-dl,s.x,s.y+dl]].forEach(([x1,y1,x2,y2]) => {
          const g = ctx.createLinearGradient(x1,y1,x2,y2);
          g.addColorStop(0,  'rgba(215,210,255,0)');
          g.addColorStop(.5, `rgba(215,210,255,${s.a*.17})`);
          g.addColorStop(1,  'rgba(215,210,255,0)');
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
          ctx.strokeStyle=g; ctx.lineWidth=.58; ctx.stroke();
        });
      }
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,PI2);
      ctx.fillStyle=col; ctx.fill();
    });

    /* 流星 — 更平的入射角（.08π ~ .22π ≈ 14°~40°） */
    if (Math.random() < .0022) {
      const ang = Math.PI*(rnd(.08,.22));
      meteors.push({ x:rnd(0,W*.72), y:rnd(0,H*.35),
        vx:Math.cos(ang)*rnd(12,22), vy:Math.sin(ang)*rnd(12,22),
        life:1, tail:[] });
    }
    meteors = meteors.filter(m => m.life>0);
    meteors.forEach(m => {
      m.tail.push({x:m.x, y:m.y});
      if (m.tail.length>26) m.tail.shift();
      m.x+=m.vx; m.y+=m.vy; m.life-=.017;

      for (let i=1; i<m.tail.length; i++) {
        const p0=m.tail[i-1], p1=m.tail[i], prog=i/m.tail.length;
        /* 白→橙黄燃烧色 */
        const gg=Math.round(lerp(188,255,prog)), bb=Math.round(lerp(62,255,prog));
        ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p1.x,p1.y);
        ctx.strokeStyle = `rgba(255,${gg},${bb},${m.life*prog*.92})`;
        ctx.lineWidth = prog*2.9; ctx.stroke();
      }
      const hg = ctx.createRadialGradient(m.x,m.y,0, m.x,m.y,5.5);
      hg.addColorStop(0,   `rgba(255,255,255,${m.life})`);
      hg.addColorStop(.45, `rgba(255,208,95,${m.life*.55})`);
      hg.addColorStop(1,   'rgba(255,162,32,0)');
      ctx.beginPath(); ctx.arc(m.x,m.y,5.5,0,PI2);
      ctx.fillStyle=hg; ctx.fill();
    });
    raf(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌧️ 雨夜 — 3景深雨丝 + 玻璃水珠物理形变
═══════════════════════════════════════════════════════ */
function _rain(ctx, W, H) {
  const layers = [
    Array.from({length:115},()=>({x:rnd(0,W),y:rnd(0,H),len:rnd(5,12),sp:rnd(6,10),a:rnd(.034,.08),w:.36})),
    Array.from({length:90}, ()=>({x:rnd(0,W),y:rnd(0,H),len:rnd(9,18),sp:rnd(10,16),a:rnd(.06,.14),w:.58})),
    Array.from({length:52}, ()=>({x:rnd(0,W),y:rnd(0,H),len:rnd(14,24),sp:rnd(15,24),a:rnd(.09,.18),w:.98})),
  ];

  function mkD() {
    return { x:rnd(0,W), y:-12, r:rnd(2.2,6.5), vy:0,
             gr:rnd(.022,.042), a:rnd(.28,.45), trail:[], stretch:1 };
  }
  const drops = Array.from({length:44}, () => ({...mkD(), y:rnd(0,H), vy:rnd(0,2.5)}));
  iv(() => {
    const i = Math.floor(Math.random()*drops.length);
    Object.assign(drops[i], mkD());
  }, 320);

  function draw() {
    ctx.clearRect(0,0,W,H);

    layers.forEach(lr => lr.forEach(d => {
      d.y += d.sp; d.x += d.sp*.22;
      if (d.y > H) { d.y=-d.len; d.x=rnd(0,W); }
      ctx.beginPath(); ctx.moveTo(d.x,d.y); ctx.lineTo(d.x+d.len*.22,d.y+d.len);
      ctx.strokeStyle=`rgba(168,205,242,${d.a})`; ctx.lineWidth=d.w; ctx.stroke();
    }));

    drops.forEach((b, i) => {
      const roll = b.vy>.05;
      if (roll) {
        b.vy += b.gr; b.y += b.vy;
        b.stretch = clamp(1+b.vy*.072, 1, 2.2);
        b.trail.push({x:b.x, y:b.y});
        if (b.trail.length>14) b.trail.shift();
      } else {
        b.vy += b.gr;
      }
      if (b.y > H+20) Object.assign(drops[i], mkD());

      if (b.trail.length>2) {
        ctx.beginPath(); ctx.moveTo(b.trail[0].x,b.trail[0].y);
        b.trail.forEach(p => ctx.lineTo(p.x,p.y));
        ctx.strokeStyle=`rgba(175,215,255,${b.a*.16})`; ctx.lineWidth=b.r*.62; ctx.stroke();
      }

      ctx.save(); ctx.translate(b.x,b.y); ctx.scale(1,b.stretch);
      const g = ctx.createRadialGradient(-b.r*.28,-b.r*.28,b.r*.05, 0,0,b.r);
      g.addColorStop(0,   `rgba(255,255,255,${b.a*.96})`);
      g.addColorStop(.38, `rgba(215,235,255,${b.a*.58})`);
      g.addColorStop(.76, `rgba(150,194,238,${b.a*.2})`);
      g.addColorStop(1,   `rgba(90,160,218,${b.a*.04})`);
      ctx.beginPath(); ctx.arc(0,0,b.r,0,PI2); ctx.fillStyle=g; ctx.fill();
      ctx.strokeStyle=`rgba(134,178,228,${b.a*.28})`; ctx.lineWidth=.72; ctx.stroke();
      /* 高光 */
      ctx.beginPath(); ctx.arc(-b.r*.3,-b.r*.3,b.r*.3,0,PI2);
      ctx.fillStyle=`rgba(255,255,255,${b.a*.82})`; ctx.fill();
      ctx.restore();
    });
    raf(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌠 极光 — 噪声帘子 + 顶缘发光线 + 雪粒
═══════════════════════════════════════════════════════ */
function _aurora(ctx, W, H) {
  const cs = [
    {y:.15,h:.30,c0:'0,225,115',  c1:'0,162,88',  sp:.50,fr:2.10,am:.056,ph:0,            ns:.032},
    {y:.20,h:.22,c0:'52,200,252', c1:'12,148,215',sp:.34,fr:3.10,am:.033,ph:Math.PI*.65,   ns:.026},
    {y:.11,h:.33,c0:'122,52,252', c1:'72,12,195',  sp:.65,fr:1.72,am:.068,ph:Math.PI*1.30, ns:.040},
    {y:.27,h:.18,c0:'0,252,172',  c1:'0,190,132', sp:.38,fr:2.85,am:.023,ph:Math.PI*.32,   ns:.019},
  ];
  const snow = Array.from({length:95}, () => ({
    x:rnd(0,W), y:rnd(0,H), r:rnd(.28,2),
    sp:rnd(.18,.68), sw:rnd(0,PI2), sws:rnd(.005,.013), a:rnd(.08,.46)
  }));

  /* 预计算每条帘子的顶部 Y 均值（避免每帧 reduce） */
  let t = 0;
  function draw() {
    ctx.clearRect(0,0,W,H); t += .0052;

    cs.forEach(c => {
      const top=[], bot=[];
      for (let x=0; x<=W; x+=3) {
        const nx = x/W;
        const n = noise(nx*3, t*.36, t+c.ph*.5)*c.ns;
        const w = Math.sin(nx*Math.PI*c.fr+t*c.sp+c.ph)*c.am
                + Math.sin(nx*Math.PI*c.fr*1.82-t*c.sp*1.32+c.ph)*c.am*.36 + n;
        const yt = H*(c.y+w);
        top.push({x, y:yt});
        bot.push({x, y:yt + H*c.h*(.65+.35*Math.abs(Math.sin(nx*4.1+t)))});
      }

      ctx.save(); ctx.beginPath();
      top.forEach((p,i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y));
      for (let i=bot.length-1; i>=0; i--) ctx.lineTo(bot[i].x,bot[i].y);
      ctx.closePath();

      /* 用帘子顶/底的均值 Y 做渐变（近似准确，省去 reduce） */
      const midIdx = Math.floor(top.length/2);
      const at = top[midIdx].y;
      const ab = bot[midIdx].y;
      const gv = ctx.createLinearGradient(0,at,0,ab);
      const p  = .84+.16*Math.sin(t*1.72+c.ph);
      gv.addColorStop(0,   `rgba(${c.c0},0)`);
      gv.addColorStop(.09, `rgba(${c.c0},${.18*p})`);
      gv.addColorStop(.40, `rgba(${c.c0},${.27*p})`);
      gv.addColorStop(.72, `rgba(${c.c1},${.15*p})`);
      gv.addColorStop(1,   `rgba(${c.c1},0)`);
      ctx.fillStyle=gv; ctx.fill();

      /* 顶缘发光线 */
      ctx.beginPath();
      top.forEach((p2,i) => i ? ctx.lineTo(p2.x,p2.y) : ctx.moveTo(p2.x,p2.y));
      ctx.strokeStyle=`rgba(${c.c0},${.25*p})`; ctx.lineWidth=1.8; ctx.stroke();
      ctx.restore();
    });

    snow.forEach(s => {
      s.sw+=s.sws; s.y+=s.sp; s.x+=Math.sin(s.sw)*.38;
      if (s.y>H+4) { s.y=-4; s.x=rnd(0,W); }
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,PI2);
      ctx.fillStyle=`rgba(218,240,255,${s.a})`; ctx.fill();
    });
    raf(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌸 樱花 — 贝塞尔花瓣 + 风场 + 正反面翻转
═══════════════════════════════════════════════════════ */
function _sakura(ctx, W, H) {
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
    raf(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌅 火烧云 — 丁达尔光束 + 云层高光（不覆盖背景）
═══════════════════════════════════════════════════════ */
function _clouds(ctx, W, H) {
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
    raf(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🏔️ 雪山 — 六角雪花 + 3景深 + 风场 + 地面积雪
═══════════════════════════════════════════════════════ */
function _snow(ctx, W, H) {
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
    raf(draw);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌿 雨林 — 绿色体积光 + 3景深湿气 + 地面反光
═══════════════════════════════════════════════════════ */
function _forest(ctx, W, H) {
  const rays = Array.from({length:6}, (_, i) => ({
    cx:W*(.1+i*.17), w:rnd(14,44), skew:rnd(-28,28),
    a:rnd(.042,.068), ph:rnd(0,PI2), phs:rnd(.002,.003),
    reach:rnd(H*.58,H*.86),
  }));

  function mkP(d) {
    return { x:rnd(0,W), y:rnd(0,H),
      r:rnd(.25,1.1)*d,
      vx:rnd(-.09,.09)*d,
      /* 修正：粒子向上漂，vy 始终为负 */
      vy:-(rnd(.02,.14)*d),
      a:rnd(.04,.22)*d, ph:rnd(0,PI2), d };
  }
  const dust = [
    Array.from({length:52}, () => mkP(.32)),
    Array.from({length:42}, () => mkP(.62)),
    Array.from({length:26}, () => mkP(1.0)),
  ];

  const gs = Array.from({length:18}, () => ({
    x:rnd(0,W), y:rnd(H*.78,H),
    rx:rnd(9,38), ry:rnd(2,7),
    a:rnd(.028,.072), spd:rnd(-.07,.07)
  }));

  let t = 0;
  function draw() {
    ctx.clearRect(0,0,W,H); t++;

    rays.forEach(r => {
      r.ph += r.phs;
      const nx=r.cx+noise(r.cx/W,t*.003,t*.003)*16, p=.72+.28*Math.sin(r.ph);

      /* 外散射 */
      const go = ctx.createLinearGradient(nx,0,nx,r.reach*.88);
      go.addColorStop(0,   `rgba(212,255,172,${r.a*.52*p})`);
      go.addColorStop(.4,  `rgba(196,250,155,${r.a*.25*p})`);
      go.addColorStop(1,   'rgba(175,235,135,0)');
      ctx.save(); ctx.beginPath();
      ctx.moveTo(nx-r.w*1.92,0); ctx.lineTo(nx+r.w*1.92,0);
      ctx.lineTo(nx+r.w*1.92+r.skew,r.reach*.88);
      ctx.lineTo(nx-r.w*1.92+r.skew,r.reach*.88);
      ctx.closePath(); ctx.fillStyle=go; ctx.fill(); ctx.restore();

      /* 内核 */
      const gi = ctx.createLinearGradient(nx,0,nx,r.reach);
      gi.addColorStop(0,   `rgba(225,255,185,${r.a*1.4*p})`);
      gi.addColorStop(.28, `rgba(208,254,166,${r.a*.86*p})`);
      gi.addColorStop(.7,  `rgba(180,240,142,${r.a*.24*p})`);
      gi.addColorStop(1,   'rgba(158,225,118,0)');
      ctx.save(); ctx.beginPath();
      ctx.moveTo(nx-r.w*.38,0); ctx.lineTo(nx+r.w*.38,0);
      ctx.lineTo(nx+r.w*.38+r.skew*.58,r.reach);
      ctx.lineTo(nx-r.w*.38+r.skew*.58,r.reach);
      ctx.closePath(); ctx.fillStyle=gi; ctx.fill(); ctx.restore();
    });

    /* 地面反光 */
    gs.forEach(s => {
      s.x+=s.spd;
      if (s.x<-s.rx) s.x=W+s.rx; else if (s.x>W+s.rx) s.x=-s.rx;
      ctx.save(); ctx.translate(s.x,s.y);
      const g = ctx.createRadialGradient(0,0,0,0,0,s.rx);
      g.addColorStop(0, `rgba(195,255,152,${s.a})`); g.addColorStop(1,'rgba(155,220,115,0)');
      ctx.scale(1,s.ry/s.rx);
      ctx.beginPath(); ctx.arc(0,0,s.rx,0,PI2);
      ctx.fillStyle=g; ctx.fill(); ctx.restore();
    });

    /* 湿气 — 检查上下两端边界 */
    dust.forEach(lr => lr.forEach(p => {
      p.x += p.vx + Math.sin(t*.01+p.ph)*.15*p.d;
      p.y += p.vy;
      /* 飘出顶部则重置到底部 */
      if (p.y < -5) { p.y=H+5; p.x=rnd(0,W); }
      /* 边缘环绕 */
      if (p.x<0) p.x=W; else if (p.x>W) p.x=0;
      const fl = p.a*(.4+.6*Math.abs(Math.sin(t*.014+p.ph)));
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,PI2);
      ctx.fillStyle=`rgba(200,255,165,${fl})`; ctx.fill();
    }));
    raf(draw);
  } draw();
}
