/* Foreign · animations.js
   深海 & 极光 全面重写，追求物理真实感
   其余主题精细调优 */

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

/* ─────────────────────────────────────────────────────────
   UTILITY: 简易 Perlin-like 噪声（用于极光、深海扰动）
   基于多层 sin 叠加模拟，成本低，效果足够
───────────────────────────────────────────────────────── */
function noise(x, y, t) {
  return (
    Math.sin(x * 0.8 + t * 0.7) * 0.4 +
    Math.sin(x * 1.6 - y * 0.4 + t * 0.5) * 0.25 +
    Math.sin(y * 1.1 + t * 0.9) * 0.2 +
    Math.sin(x * 0.3 + y * 0.7 + t * 0.3) * 0.15
  );
}

/* ─────────────────────────────────────────────────────────
   🌊 深海  — 全面重写
   体积光柱（多层叠加 + 噪声偏移 + 散射晕）
   气泡（大小分布符合物理，随流摇摆，边缘折射高光）
   焦散光斑（底部随机光斑模拟水面折射）
───────────────────────────────────────────────────────── */
function _ocean(ctx, W, H) {

  /* 焦散光斑 */
  const caustics = Array.from({ length: 28 }, () => ({
    x: Math.random() * W,
    y: H * (.55 + Math.random() * .45),
    rx: 18 + Math.random() * 55,
    ry: 4 + Math.random() * 12,
    rot: Math.random() * Math.PI,
    rspd: (Math.random() - .5) * .003,
    a: .025 + Math.random() * .045,
    spd: (Math.random() - .5) * .18,
  }));

  /* 气泡 — 三种尺寸，符合物理分布 */
  const bubbles = Array.from({ length: 80 }, () => _newBubble(W, H, true));

  function _newBubble(W, H, init) {
    const tier = Math.random();           // 0=微泡 1=小泡 2=中泡
    const r = tier < .6
      ? .4 + Math.random() * 1.2          // 微泡
      : tier < .88
        ? 1.4 + Math.random() * 2.4       // 小泡
        : 3.2 + Math.random() * 4.8;      // 中泡
    return {
      x: Math.random() * W,
      y: init ? Math.random() * H : H + r + 10,
      r,
      sp: (.18 + Math.random() * .55) * (1 / r * 1.8 + .4), // 小泡快
      wb: (Math.random() - .5) * .35,    // 横向漂移幅度
      ph: Math.random() * Math.PI * 2,
      phspd: .012 + Math.random() * .018,
      a: .12 + Math.random() * .32,
    };
  }

  /* 光柱参数：7根，宽度/倾斜/强度各异 */
  const rays = Array.from({ length: 7 }, (_, i) => ({
    cx: W * (.06 + i * .145),            // 基础X中心
    w: 28 + Math.random() * 60,          // 光柱宽度
    skew: (Math.random() - .5) * 38,     // 顶/底偏移（倾斜）
    a: .045 + Math.random() * .065,      // 峰值不透明度
    ph: Math.random() * Math.PI * 2,
    phspd: .004 + Math.random() * .005,
    reach: H * (.55 + Math.random() * .35), // 向下延伸深度
  }));

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += .008;

    /* 1. 体积光柱 */
    rays.forEach(ray => {
      ray.ph += ray.phspd;
      // 噪声扰动中心X
      const nx = ray.cx + noise(ray.cx / W, t, t) * 22;
      const pulse = .7 + .3 * Math.sin(ray.ph);

      // 外晕（散射）
      const gOuter = ctx.createLinearGradient(nx, 0, nx, ray.reach * .9);
      gOuter.addColorStop(0,   `rgba(60,160,255,${ray.a * .5 * pulse})`);
      gOuter.addColorStop(.35, `rgba(80,180,255,${ray.a * .28 * pulse})`);
      gOuter.addColorStop(1,   'rgba(60,140,255,0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(nx - ray.w * 1.8, 0);
      ctx.lineTo(nx + ray.w * 1.8, 0);
      ctx.lineTo(nx + ray.w * 1.8 + ray.skew, ray.reach * .9);
      ctx.lineTo(nx - ray.w * 1.8 + ray.skew, ray.reach * .9);
      ctx.closePath();
      ctx.fillStyle = gOuter;
      ctx.globalAlpha = 1;
      ctx.fill();
      ctx.restore();

      // 内核（高亮中心）
      const gCore = ctx.createLinearGradient(nx, 0, nx, ray.reach);
      gCore.addColorStop(0,   `rgba(140,210,255,${ray.a * 1.4 * pulse})`);
      gCore.addColorStop(.25, `rgba(120,195,255,${ray.a * .9 * pulse})`);
      gCore.addColorStop(.7,  `rgba(80,160,255,${ray.a * .3 * pulse})`);
      gCore.addColorStop(1,   'rgba(60,130,255,0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(nx - ray.w * .38, 0);
      ctx.lineTo(nx + ray.w * .38, 0);
      ctx.lineTo(nx + ray.w * .38 + ray.skew * .6, ray.reach);
      ctx.lineTo(nx - ray.w * .38 + ray.skew * .6, ray.reach);
      ctx.closePath();
      ctx.fillStyle = gCore;
      ctx.fill();
      ctx.restore();
    });

    /* 2. 焦散光斑 */
    caustics.forEach(c => {
      c.x += c.spd;
      c.rot += c.rspd;
      if (c.x < -c.rx * 2) c.x = W + c.rx;
      if (c.x > W + c.rx * 2) c.x = -c.rx;

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, c.rx);
      cg.addColorStop(0,   `rgba(140,220,255,${c.a})`);
      cg.addColorStop(.5,  `rgba(100,190,255,${c.a * .4})`);
      cg.addColorStop(1,   'rgba(60,160,255,0)');
      ctx.scale(1, c.ry / c.rx);
      ctx.beginPath();
      ctx.arc(0, 0, c.rx, 0, Math.PI * 2);
      ctx.fillStyle = cg;
      ctx.fill();
      ctx.restore();
    });

    /* 3. 气泡 */
    bubbles.forEach((b, i) => {
      b.ph += b.phspd;
      b.y  -= b.sp;
      b.x  += Math.sin(b.ph) * b.wb;
      if (b.y < -b.r * 2) bubbles[i] = _newBubble(W, H, false);
      if (b.x < -10) b.x = W + 10;
      if (b.x > W + 10) b.x = -10;

      // 气泡轮廓
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(200,235,255,${b.a * .85})`;
      ctx.lineWidth = b.r > 2 ? .9 : .5;
      ctx.stroke();

      // 折射高光（中大气泡才有）
      if (b.r > 1.2) {
        const hx = b.x - b.r * .32, hy = b.y - b.r * .32;
        const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, b.r * .58);
        hg.addColorStop(0, `rgba(255,255,255,${b.a * .7})`);
        hg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = hg;
        ctx.fill();
      }
    });

    _af = requestAnimationFrame(draw);
  }
  draw();
}

/* ─────────────────────────────────────────────────────────
   🌲 雾林  — 原版精调（萤火虫更亮，雾更有层次）
───────────────────────────────────────────────────────── */
function _mist(ctx, W, H) {
  const layers = [
    { y: .40, h: .14, sp: .12, a: .07, c: '195,215,205' },
    { y: .52, h: .12, sp: .09, a: .09, c: '180,210,200' },
    { y: .62, h: .14, sp: .17, a: .08, c: '190,215,205' },
    { y: .73, h: .11, sp: .12, a: .10, c: '200,218,212' },
  ];
  const ff = Array.from({ length: 14 }, () => ({
    x: Math.random() * W, y: H * (.28 + Math.random() * .5),
    vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .2,
    ph: Math.random() * Math.PI * 2, sp: .018 + Math.random() * .026,
    sz: 4 + Math.random() * 5,
  }));
  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t++;
    layers.forEach(l => {
      const off = (t * l.sp) % W;
      for (let r = 0; r < 4; r++) {
        const x = -W + r * W * 1.1 - off;
        const g = ctx.createLinearGradient(0, H * l.y, 0, H * (l.y + l.h));
        g.addColorStop(0,   `rgba(${l.c},0)`);
        g.addColorStop(.5,  `rgba(${l.c},${l.a})`);
        g.addColorStop(1,   `rgba(${l.c},0)`);
        ctx.fillStyle = g; ctx.fillRect(x, H * l.y, W * 1.2, H * l.h);
      }
    });
    ff.forEach(f => {
      f.x += f.vx + Math.sin(t * f.sp) * .42;
      f.y += f.vy + Math.cos(t * f.sp * .8) * .2;
      if (f.x < 0) f.x = W; if (f.x > W) f.x = 0;
      if (f.y < H * .15) f.y = H * .75; if (f.y > H * .88) f.y = H * .25;
      const a = .3 + .7 * Math.abs(Math.sin(t * f.sp * 2 + f.ph));
      const gr = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.sz);
      gr.addColorStop(0, `rgba(200,255,160,${a})`);
      gr.addColorStop(.5, `rgba(160,255,120,${a * .4})`);
      gr.addColorStop(1, 'rgba(160,255,120,0)');
      ctx.beginPath(); ctx.arc(f.x, f.y, f.sz, 0, Math.PI * 2);
      ctx.fillStyle = gr; ctx.fill();
      ctx.beginPath(); ctx.arc(f.x, f.y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230,255,200,${a})`; ctx.fill();
    });
    _af = requestAnimationFrame(draw);
  }
  draw();
}

/* ─────────────────────────────────────────────────────────
   🌌 星空  — 精调（流星拖尾更长更自然）
───────────────────────────────────────────────────────── */
function _stars(ctx, W, H) {
  const stars = Array.from({ length: 240 }, () => ({
    x: Math.random() * W, y: Math.random() * H * .92,
    r: .2 + Math.random() * 1.5,
    a: Math.random(),
    da: (Math.random() - .5) * .012,
    tw: Math.random() > .4,
  }));
  let meteors = [], st = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    st++;
    stars.forEach(s => {
      if (s.tw) { s.a += s.da; if (s.a < .06 || s.a > 1) s.da *= -1; }
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(225,220,255,${s.a})`; ctx.fill();
    });
    if (Math.random() < .003) {
      const angle = Math.PI * (.18 + Math.random() * .14);
      meteors.push({
        x: Math.random() * W * .7, y: Math.random() * H * .4,
        vx: Math.cos(angle) * (14 + Math.random() * 9),
        vy: Math.sin(angle) * (14 + Math.random() * 9),
        life: 1, tail: [],
      });
    }
    meteors = meteors.filter(m => m.life > 0);
    meteors.forEach(m => {
      m.tail.push({ x: m.x, y: m.y, life: m.life });
      if (m.tail.length > 22) m.tail.shift();
      m.x += m.vx; m.y += m.vy; m.life -= .019;
      // 拖尾
      for (let i = 1; i < m.tail.length; i++) {
        const p0 = m.tail[i - 1], p1 = m.tail[i];
        const prog = i / m.tail.length;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y);
        ctx.strokeStyle = `rgba(255,255,255,${m.life * prog * .85})`;
        ctx.lineWidth = prog * 2.2;
        ctx.stroke();
      }
      // 头部光点
      const hg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 4);
      hg.addColorStop(0, `rgba(255,255,255,${m.life})`);
      hg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.arc(m.x, m.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = hg; ctx.fill();
    });
    _af = requestAnimationFrame(draw);
  }
  draw();
}

/* ─────────────────────────────────────────────────────────
   🌧️ 雨夜  — 精调（水珠玻璃感更强）
───────────────────────────────────────────────────────── */
function _rain(ctx, W, H) {
  const dr = Array.from({ length: 320 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    len: 9 + Math.random() * 18, sp: 13 + Math.random() * 10,
    a: .06 + Math.random() * .16,
  }));
  const bd = Array.from({ length: 55 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: 2 + Math.random() * 5.5, vy: 0,
    gr: .03 + Math.random() * .05,
    grow: true, maxR: 3 + Math.random() * 9,
    a: .3 + Math.random() * .4, tr: [],
  }));
  setInterval(() => {
    const b = bd[Math.floor(Math.random() * bd.length)];
    b.y = -10; b.x = Math.random() * W; b.vy = 0; b.r = 1;
    b.grow = true; b.tr = [];
  }, 280);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    dr.forEach(d => {
      d.y += d.sp; d.x += d.sp * .22;
      if (d.y > H) { d.y = -d.len; d.x = Math.random() * W; }
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + d.len * .22, d.y + d.len);
      ctx.strokeStyle = `rgba(175,210,245,${d.a})`;
      ctx.lineWidth = .55; ctx.stroke();
    });
    bd.forEach(b => {
      if (b.grow) { b.r += .035; if (b.r >= b.maxR) b.grow = false; }
      else {
        b.vy += b.gr; b.y += b.vy;
        b.tr.push({ x: b.x, y: b.y });
        if (b.tr.length > 18) b.tr.shift();
      }
      if (b.y > H + 20) { b.y = -10; b.x = Math.random() * W; b.vy = 0; b.r = 1; b.grow = true; b.tr = []; }
      if (b.tr.length > 2) {
        ctx.beginPath();
        ctx.moveTo(b.tr[0].x, b.tr[0].y - b.r * .5);
        b.tr.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = `rgba(180,218,255,${b.a * .18})`;
        ctx.lineWidth = b.r * .65; ctx.stroke();
      }
      // 主体折射渐变
      const g = ctx.createRadialGradient(b.x - b.r * .3, b.y - b.r * .3, b.r * .08, b.x, b.y, b.r);
      g.addColorStop(0,   `rgba(255,255,255,${b.a * .95})`);
      g.addColorStop(.45, `rgba(210,232,255,${b.a * .55})`);
      g.addColorStop(1,   `rgba(130,185,240,${b.a * .08})`);
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
      // 高光
      ctx.beginPath(); ctx.arc(b.x - b.r * .3, b.y - b.r * .3, b.r * .32, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${b.a * .72})`; ctx.fill();
    });
    _af = requestAnimationFrame(draw);
  }
  draw();
}

/* ─────────────────────────────────────────────────────────
   🌠 极光  — 全面重写
   用噪声驱动波形，多帘子叠加，物理感的颜色渐变
   顶部淡出 / 底部淡出，像真实极光的帘子形态
───────────────────────────────────────────────────────── */
function _aurora(ctx, W, H) {

  /* 极光帘子：每条有独立相位、速度、颜色 */
  const curtains = [
    { yBase: .18, height: .28, color0: '0,230,120',  color1: '0,180,100',  speed: .55, freq: 2.2, amp: .055, phase: 0,            noiseStr: .032 },
    { yBase: .22, height: .22, color0: '60,210,255', color1: '20,160,220', speed: .38, freq: 3.1, amp: .038, phase: Math.PI * .6,  noiseStr: .028 },
    { yBase: .14, height: .32, color0: '120,60,255', color1: '80,20,200',  speed: .70, freq: 1.8, amp: .068, phase: Math.PI * 1.3, noiseStr: .04  },
    { yBase: .26, height: .18, color0: '0,255,180',  color1: '0,200,140',  speed: .42, freq: 2.8, amp: .028, phase: Math.PI * .3,  noiseStr: .022 },
  ];

  /* 雪花 */
  const snow = Array.from({ length: 90 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: .35 + Math.random() * 1.8, sp: .22 + Math.random() * .58,
    sw: Math.random() * Math.PI * 2, sws: .006 + Math.random() * .012,
    a: .12 + Math.random() * .45,
  }));

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += .006;

    curtains.forEach(c => {
      /* 逐列构建极光帘子 */
      const step = 3;
      const top  = [];  // 顶边折线
      const bot  = [];  // 底边折线（顶边 + 高度）

      for (let x = 0; x <= W; x += step) {
        const nx = x / W;
        // 噪声扰动叠加
        const n = noise(nx * 3, t * .4, t + c.phase * .5) * c.noiseStr;
        // 主波
        const wave =
          Math.sin(nx * Math.PI * c.freq + t * c.speed + c.phase) * c.amp +
          Math.sin(nx * Math.PI * c.freq * 1.8 - t * c.speed * 1.3 + c.phase) * c.amp * .4 +
          n;

        const yTop = H * (c.yBase + wave);
        const yBot = yTop + H * c.height * (.7 + .3 * Math.abs(Math.sin(nx * 4 + t)));

        top.push({ x, y: yTop });
        bot.push({ x, y: yBot });
      }

      /* 绘制帘子（带竖向渐变：顶→底渐隐） */
      ctx.save();
      ctx.beginPath();
      top.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      for (let i = bot.length - 1; i >= 0; i--) ctx.lineTo(bot[i].x, bot[i].y);
      ctx.closePath();

      /* 竖向渐变：顶淡 → 中峰 → 底渐隐 */
      const avgTop = top.reduce((s, p) => s + p.y, 0) / top.length;
      const avgBot = bot.reduce((s, p) => s + p.y, 0) / bot.length;
      const gv = ctx.createLinearGradient(0, avgTop, 0, avgBot);
      const pulse = .85 + .15 * Math.sin(t * 1.8 + c.phase);
      gv.addColorStop(0,    `rgba(${c.color0},0)`);
      gv.addColorStop(.12,  `rgba(${c.color0},${.14 * pulse})`);
      gv.addColorStop(.45,  `rgba(${c.color0},${.22 * pulse})`);
      gv.addColorStop(.72,  `rgba(${c.color1},${.12 * pulse})`);
      gv.addColorStop(1,    `rgba(${c.color1},0)`);
      ctx.fillStyle = gv;
      ctx.fill();

      /* 顶边发光线（帘子上缘最亮） */
      ctx.beginPath();
      top.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = `rgba(${c.color0},${.18 * pulse})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    });

    /* 星雪 */
    snow.forEach(s => {
      s.sw += s.sws; s.y += s.sp; s.x += Math.sin(s.sw) * .38;
      if (s.y > H + 5) { s.y = -5; s.x = Math.random() * W; }
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,240,255,${s.a})`; ctx.fill();
    });

    _af = requestAnimationFrame(draw);
  }
  draw();
}

/* ─────────────────────────────────────────────────────────
   🌸 樱花  — 精调（花瓣更真实，加深色脉络）
───────────────────────────────────────────────────────── */
function _sakura(ctx, W, H) {
  const petals = Array.from({ length: 95 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    sz: 4 + Math.random() * 8,
    vx: (Math.random() - .5) * .6,
    vy: .35 + Math.random() * 1.3,
    rot: Math.random() * Math.PI * 2,
    rv: (Math.random() - .5) * .035,
    sw: Math.random() * Math.PI * 2,
    sws: .009 + Math.random() * .018,
    a: .3 + Math.random() * .6,
  }));
  function draw() {
    ctx.clearRect(0, 0, W, H);
    petals.forEach(p => {
      p.y += p.vy; p.sw += p.sws;
      p.x += p.vx + Math.sin(p.sw) * .7;
      p.rot += p.rv;
      if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.a;

      // 花瓣椭圆
      ctx.beginPath();
      ctx.ellipse(0, 0, p.sz, p.sz * .58, 0, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(0, -p.sz * .2, 0, 0, 0, p.sz);
      g.addColorStop(0,   'rgba(255,228,235,.98)');
      g.addColorStop(.55, 'rgba(255,196,215,.85)');
      g.addColorStop(1,   'rgba(255,165,200,.2)');
      ctx.fillStyle = g; ctx.fill();

      // 脉络线
      ctx.beginPath();
      ctx.moveTo(0, p.sz * .55);
      ctx.quadraticCurveTo(0, 0, 0, -p.sz * .55);
      ctx.strokeStyle = `rgba(220,150,180,${p.a * .28})`;
      ctx.lineWidth = .6; ctx.stroke();

      ctx.restore();
      ctx.globalAlpha = 1;
    });
    _af = requestAnimationFrame(draw);
  }
  draw();
}

/* ─────────────────────────────────────────────────────────
   🌅 火烧云  — 精调（云层更有体积感）
───────────────────────────────────────────────────────── */
function _clouds(ctx, W, H) {
  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H); t += .004;
    const pulse = .065 + .028 * Math.sin(t * 1.8);
    // 太阳晕
    const sg = ctx.createRadialGradient(W * .5, H * .62, 0, W * .5, H * .62, W * .42);
    sg.addColorStop(0,   `rgba(255,180,60,${pulse})`);
    sg.addColorStop(.38, `rgba(255,115,25,${pulse * .45})`);
    sg.addColorStop(.7,  `rgba(220,60,10,${pulse * .18})`);
    sg.addColorStop(1,   'rgba(180,30,0,0)');
    ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);

    // 云层
    for (let i = 0; i < 8; i++) {
      const cx = W * (.06 + i * .13) + Math.sin(t * .8 + i) * W * .03;
      const cy = H * (.22 + Math.sin(t * .55 + i) * .055);
      const rad = 60 + i * 16;
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      cg.addColorStop(0,  `rgba(255,200,90,${.07 + .02 * Math.sin(t + i)})`);
      cg.addColorStop(.5, `rgba(255,145,40,.035)`);
      cg.addColorStop(1,  'rgba(230,100,20,0)');
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fillStyle = cg; ctx.fill();
    }
    _af = requestAnimationFrame(draw);
  }
  draw();
}

/* ─────────────────────────────────────────────────────────
   🏔️ 雪山  — 精调（雪花加入景深，远近大小不同）
───────────────────────────────────────────────────────── */
function _snow(ctx, W, H) {
  const flakes = Array.from({ length: 150 }, () => {
    const depth = Math.random(); // 0=远 1=近
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: .25 + depth * 2.5,
      sp: .18 + depth * .72,
      sw: Math.random() * Math.PI * 2,
      sws: .005 + Math.random() * .012,
      a: .12 + depth * .55,
    };
  });
  function draw() {
    ctx.clearRect(0, 0, W, H);
    flakes.forEach(f => {
      f.sw += f.sws; f.y += f.sp; f.x += Math.sin(f.sw) * .42;
      if (f.y > H + 5) { f.y = -5; f.x = Math.random() * W; }
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${f.a})`; ctx.fill();
    });
    _af = requestAnimationFrame(draw);
  }
  draw();
}

/* ─────────────────────────────────────────────────────────
   🌿 雨林  — 精调（光束更宽，粒子更温暖）
───────────────────────────────────────────────────────── */
function _forest(ctx, W, H) {
  const dust = Array.from({ length: 130 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: .4 + Math.random() * 1.8,
    vx: (Math.random() - .5) * .14,
    vy: -.04 - Math.random() * .14,
    a: .08 + Math.random() * .32,
    ph: Math.random() * Math.PI * 2,
  }));
  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H); t++;
    // 光柱
    for (let i = 0; i < 5; i++) {
      const sx = W * (.14 + i * .19) + Math.sin(t * .004 + i) * 22;
      const g = ctx.createLinearGradient(sx, 0, sx + 18, H * .78);
      g.addColorStop(0,  'rgba(200,255,170,.08)');
      g.addColorStop(.4, 'rgba(180,240,140,.04)');
      g.addColorStop(1,  'rgba(180,240,140,0)');
      ctx.beginPath();
      ctx.moveTo(sx - 10, 0); ctx.lineTo(sx + 38, 0);
      ctx.lineTo(sx + 52, H * .78); ctx.lineTo(sx + 6, H * .78);
      ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    }
    // 浮尘
    dust.forEach(p => {
      p.x += p.vx + Math.sin(t * .011 + p.ph) * .22;
      p.y += p.vy;
      if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      const a = p.a * (.5 + .5 * Math.sin(t * .018 + p.ph));
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210,255,185,${a})`; ctx.fill();
    });
    _af = requestAnimationFrame(draw);
  }
  draw();
}
