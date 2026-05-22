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
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function rnd(a, b) { return a + Math.random()*(b-a); }
const PI2 = Math.PI * 2;


/* ═══════════════════════════════════════════════════════
   🌊 深海 — 白色体积光柱 + 焦散 + 物理气泡
═══════════════════════════════════════════════════════ */
function _ocean(ctx, W, H, tk) {

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
    raf(draw, tk);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌲 雾林 — 椭圆雾气（零硬边）+ 萤火虫群落
═══════════════════════════════════════════════════════ */
function _mist(ctx, W, H, tk) {

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
    raf(draw, tk);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌌 星空 — 银河密度分布 + 大气燃烧流星 + 十字衍射
═══════════════════════════════════════════════════════ */
function _stars(ctx, W, H, tk) {
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
    raf(draw, tk);
  } draw();
}

/* ═══════════════════════════════════════════════════════
   🌧️ 雨天 — 玻璃窗视角
   完全模拟玻璃内侧：
   · 附着水珠（静止，积累变大，折射高光）
   · 积累到阈值开始向下流淌，路径弯曲不规则
   · 流痕：细窄弯曲水迹，带透明高光边
   · 两条流痕偶尔合并
   · 新水珠持续在随机位置冒出
   不画任何外部雨丝
═══════════════════════════════════════════════════════ */
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
function _forest(ctx, W, H, tk) {
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
    raf(draw, tk);
  } draw();
}
