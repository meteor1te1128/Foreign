/* Foreign · buttons.js
   每个主题专属点击粒子 + 磁力导航 + 通用 ripple  */

/* ── 主题粒子配置 ─────────────────────────────────────── */
const THEME_PARTICLES = {
  ocean: {
    /* 气泡：圆形，蓝白，向上漂浮 */
    count: 14,
    make(cx, cy) {
      const size = 3 + Math.random() * 6;
      const angle = -Math.PI/2 + (Math.random()-.5)*Math.PI*.8;
      const dist  = 28 + Math.random()*45;
      return {
        size, shape:'circle',
        color:`rgba(${160+Math.random()*60|0},${220+Math.random()*35|0},255,${.5+Math.random()*.4})`,
        tx: Math.cos(angle)*dist, ty: Math.sin(angle)*dist - 10,
        dur: 500 + Math.random()*300,
      };
    }
  },

  fog_forest: {
    /* 萤火虫：小圆，黄绿色，随机散射 */
    count: 12,
    make(cx, cy) {
      const angle = Math.random()*Math.PI*2;
      const dist  = 22 + Math.random()*48;
      return {
        size: 2.5 + Math.random()*4,
        shape: 'circle',
        color:`hsla(${95+Math.random()*70},90%,65%,${.6+Math.random()*.4})`,
        tx: Math.cos(angle)*dist, ty: Math.sin(angle)*dist,
        dur: 550 + Math.random()*350,
      };
    }
  },

  galaxy: {
    /* 星光：小点+偶尔长线，向外放射，紫白 */
    count: 16,
    make(cx, cy) {
      const angle = Math.random()*Math.PI*2;
      const dist  = 30 + Math.random()*55;
      const isLine = Math.random() > .65;
      return {
        size: isLine ? 1 : 1.5 + Math.random()*2.5,
        shape: isLine ? 'line' : 'circle',
        lineLen: 8 + Math.random()*16,
        lineAngle: angle,
        color:`rgba(${210+Math.random()*45|0},${208+Math.random()*47|0},255,${.55+Math.random()*.45})`,
        tx: Math.cos(angle)*dist, ty: Math.sin(angle)*dist,
        dur: 400 + Math.random()*250,
      };
    }
  },

  rain: {
    /* 水珠：椭圆，向下滑落，蓝白 */
    count: 10,
    make(cx, cy) {
      const angle = Math.PI*.5 + (Math.random()-.5)*.6;
      const dist  = 25 + Math.random()*40;
      return {
        size: 3 + Math.random()*5,
        shape: 'drop',
        color:`rgba(${175+Math.random()*50|0},${215+Math.random()*40|0},255,${.5+Math.random()*.4})`,
        tx: Math.cos(angle)*dist, ty: Math.sin(angle)*dist + 15,
        dur: 500 + Math.random()*300,
      };
    }
  },

  aurora: {
    /* 极光碎片：绿紫交替，向上弧散 */
    count: 14,
    make(cx, cy) {
      const angle = -Math.PI/2 + (Math.random()-.5)*Math.PI*1.2;
      const dist  = 28 + Math.random()*52;
      const hue   = Math.random()>.5 ? 150+Math.random()*30 : 270+Math.random()*40;
      return {
        size: 2 + Math.random()*5,
        shape: 'circle',
        color:`hsla(${hue},90%,70%,${.6+Math.random()*.4})`,
        tx: Math.cos(angle)*dist, ty: Math.sin(angle)*dist,
        dur: 500 + Math.random()*350,
      };
    }
  },

  sakura: {
    /* 花瓣：椭圆，粉色，旋转飘落 */
    count: 12,
    make(cx, cy) {
      const angle = -Math.PI/2 + (Math.random()-.5)*Math.PI;
      const dist  = 25 + Math.random()*50;
      return {
        size: 4 + Math.random()*7,
        shape: 'petal',
        color:`rgba(255,${195+Math.random()*40|0},${212+Math.random()*30|0},${.55+Math.random()*.4})`,
        tx: Math.cos(angle)*dist + (Math.random()-.5)*20,
        ty: Math.sin(angle)*dist + 10,
        rotate: Math.random()*360,
        dur: 600 + Math.random()*400,
      };
    }
  },

  sunset: {
    /* 火焰粒子：橙黄，向上窜 */
    count: 14,
    make(cx, cy) {
      const angle = -Math.PI/2 + (Math.random()-.5)*Math.PI*.7;
      const dist  = 22 + Math.random()*48;
      const hue   = 20 + Math.random()*30;
      return {
        size: 3 + Math.random()*6,
        shape: 'circle',
        color:`hsla(${hue},95%,${55+Math.random()*25}%,${.6+Math.random()*.4})`,
        tx: Math.cos(angle)*dist, ty: Math.sin(angle)*dist - 8,
        dur: 450 + Math.random()*300,
      };
    }
  },

  snow: {
    /* 冰晶：六角星形，白蓝，向外爆散 */
    count: 12,
    make(cx, cy) {
      const angle = Math.random()*Math.PI*2;
      const dist  = 26 + Math.random()*48;
      return {
        size: 3 + Math.random()*5,
        shape: 'snowflake',
        color:`rgba(${225+Math.random()*30|0},${240+Math.random()*15|0},255,${.55+Math.random()*.45})`,
        tx: Math.cos(angle)*dist, ty: Math.sin(angle)*dist,
        rotate: Math.random()*60,
        dur: 480 + Math.random()*320,
      };
    }
  },

  forest_green: {
    /* 光尘：小圆，绿色，向上漂浮 */
    count: 14,
    make(cx, cy) {
      const angle = -Math.PI/2 + (Math.random()-.5)*Math.PI*.9;
      const dist  = 24 + Math.random()*46;
      return {
        size: 2 + Math.random()*4,
        shape: 'circle',
        color:`rgba(${155+Math.random()*55|0},${215+Math.random()*40|0},${130+Math.random()*50|0},${.55+Math.random()*.45})`,
        tx: Math.cos(angle)*dist, ty: Math.sin(angle)*dist - 6,
        dur: 520 + Math.random()*330,
      };
    }
  },

  white: {
    count: 10,
    make() {
      const angle = Math.random()*Math.PI*2;
      return {
        size: 2 + Math.random()*4, shape:'circle',
        color:`rgba(0,0,0,${.12+Math.random()*.18})`,
        tx: Math.cos(angle)*35, ty: Math.sin(angle)*35,
        dur: 400 + Math.random()*200,
      };
    }
  },

  black: {
    count: 10,
    make() {
      const angle = Math.random()*Math.PI*2;
      return {
        size: 2 + Math.random()*4, shape:'circle',
        color:`rgba(255,255,255,${.12+Math.random()*.22})`,
        tx: Math.cos(angle)*35, ty: Math.sin(angle)*35,
        dur: 400 + Math.random()*200,
      };
    }
  },
};

/* ── 当前主题 ─────────────────────────────────────────── */
function getTheme() {
  return localStorage.getItem('fg_theme') || 'ocean';
}

/* ── SVG 雪花路径（6角）─────────────────────────────── */
function drawSnowflakeSVG(size) {
  const r = size, sr = r*.55, br = r*.18;
  let d = '';
  for (let i=0;i<6;i++) {
    const a=i*Math.PI/3, sa=a+Math.PI/2;
    const mx=Math.cos(a)*sr, my=Math.sin(a)*sr;
    d += `M0,0L${Math.cos(a)*r},${Math.sin(a)*r} `;
    d += `M${mx},${my}L${mx+Math.cos(sa)*r*.28},${my+Math.sin(sa)*r*.28} `;
    d += `M${mx},${my}L${mx-Math.cos(sa)*r*.28},${my-Math.sin(sa)*r*.28} `;
  }
  return d;
}

/* ── 粒子爆炸 ────────────────────────────────────────── */
function burst(e, btn) {
  const rect  = btn.getBoundingClientRect();
  const cx    = rect.left + rect.width/2;
  const cy    = rect.top  + rect.height/2;
  const theme = getTheme();
  const cfg   = THEME_PARTICLES[theme] || THEME_PARTICLES.ocean;

  for (let i=0; i<cfg.count; i++) {
    const p = cfg.make(cx, cy);
    spawnParticle(cx, cy, p);
  }
}

function spawnParticle(cx, cy, p) {
  let el;

  if (p.shape === 'snowflake') {
    /* SVG 雪花 */
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width',  p.size*2+10);
    svg.setAttribute('height', p.size*2+10);
    svg.style.cssText = `
      position:fixed; pointer-events:none; z-index:9999; overflow:visible;
      left:${cx}px; top:${cy}px;
      transform-origin:center;
    `;
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', drawSnowflakeSVG(p.size));
    path.setAttribute('stroke', p.color);
    path.setAttribute('stroke-width', '.8');
    path.setAttribute('fill', 'none');
    svg.appendChild(path);
    document.body.appendChild(svg);
    svg.animate([
      { transform:`translate(-50%,-50%) rotate(${p.rotate||0}deg) scale(1)`, opacity:1 },
      { transform:`translate(calc(-50% + ${p.tx}px),calc(-50% + ${p.ty}px)) rotate(${(p.rotate||0)+60}deg) scale(0)`, opacity:0 },
    ], { duration:p.dur, easing:'cubic-bezier(.2,.8,.4,1)', fill:'forwards' })
    .onfinish = () => svg.remove();
    return;
  }

  if (p.shape === 'petal') {
    /* 椭圆花瓣 */
    el = document.createElement('div');
    el.style.cssText = `
      position:fixed; pointer-events:none; z-index:9999;
      left:${cx}px; top:${cy}px;
      width:${p.size*1.6}px; height:${p.size}px;
      background:${p.color};
      border-radius:50%;
      transform-origin:center;
    `;
    document.body.appendChild(el);
    el.animate([
      { transform:`translate(-50%,-50%) rotate(${p.rotate}deg) scale(1)`, opacity:1 },
      { transform:`translate(calc(-50% + ${p.tx}px),calc(-50% + ${p.ty}px)) rotate(${p.rotate+90}deg) scale(0)`, opacity:0 },
    ], { duration:p.dur, easing:'cubic-bezier(.2,.8,.4,1)', fill:'forwards' })
    .onfinish = () => el.remove();
    return;
  }

  if (p.shape === 'line') {
    /* 星光射线 */
    el = document.createElement('div');
    const len = p.lineLen || 12;
    el.style.cssText = `
      position:fixed; pointer-events:none; z-index:9999;
      left:${cx}px; top:${cy}px;
      width:${len}px; height:1px;
      background:${p.color};
      transform-origin:0 50%;
      transform:translate(-50%,-50%) rotate(${p.lineAngle*180/Math.PI}deg);
    `;
    document.body.appendChild(el);
    el.animate([
      { transform:`translate(-50%,-50%) rotate(${p.lineAngle*180/Math.PI}deg) scaleX(1)`, opacity:1 },
      { transform:`translate(calc(-50% + ${p.tx}px),calc(-50% + ${p.ty}px)) rotate(${p.lineAngle*180/Math.PI}deg) scaleX(0)`, opacity:0 },
    ], { duration:p.dur, easing:'cubic-bezier(.2,.8,.4,1)', fill:'forwards' })
    .onfinish = () => el.remove();
    return;
  }

  if (p.shape === 'drop') {
    /* 水珠：圆形稍拉长 */
    el = document.createElement('div');
    el.style.cssText = `
      position:fixed; pointer-events:none; z-index:9999;
      left:${cx}px; top:${cy}px;
      width:${p.size*.75}px; height:${p.size}px;
      background:${p.color};
      border-radius:50%;
      transform:translate(-50%,-50%);
    `;
    document.body.appendChild(el);
    el.animate([
      { transform:`translate(-50%,-50%) scale(1)`, opacity:1 },
      { transform:`translate(calc(-50% + ${p.tx}px),calc(-50% + ${p.ty}px)) scale(0)`, opacity:0 },
    ], { duration:p.dur, easing:'cubic-bezier(.2,.8,.4,1)', fill:'forwards' })
    .onfinish = () => el.remove();
    return;
  }

  /* 默认：圆形 */
  el = document.createElement('div');
  el.style.cssText = `
    position:fixed; pointer-events:none; z-index:9999;
    left:${cx}px; top:${cy}px;
    width:${p.size}px; height:${p.size}px;
    background:${p.color};
    border-radius:50%;
    transform:translate(-50%,-50%);
  `;
  document.body.appendChild(el);
  el.animate([
    { transform:`translate(-50%,-50%) scale(1)`, opacity:1 },
    { transform:`translate(calc(-50% + ${p.tx}px),calc(-50% + ${p.ty}px)) scale(0)`, opacity:0 },
  ], { duration:p.dur, easing:'cubic-bezier(.2,.8,.4,1)', fill:'forwards' })
  .onfinish = () => el.remove();
}

/* ── Ripple 水波 ──────────────────────────────────────── */
export function initRipple(btn) {
  btn.addEventListener('click', function(e) {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height)*1.4;
    const x = e.clientX - rect.left - size/2;
    const y = e.clientY - rect.top  - size/2;
    const r = document.createElement('span');
    r.className = 'ripple';
    r.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 650);
  });
}

/* ── 磁力导航按钮 ─────────────────────────────────────── */
export function initMagnetic(btn, strength=0.3) {
  btn.addEventListener('mousemove', function(e) {
    const rect = btn.getBoundingClientRect();
    const dx = (e.clientX-(rect.left+rect.width/2))*strength;
    const dy = (e.clientY-(rect.top+rect.height/2))*strength;
    btn.style.transform = `translate(${dx}px,${dy}px)`;
  });
  btn.addEventListener('mouseleave', function() {
    btn.style.transition = 'transform .45s cubic-bezier(.25,.46,.45,.94)';
    btn.style.transform = '';
    setTimeout(() => { btn.style.transition = ''; }, 460);
  });
}

/* ── 主题专属粒子爆炸（绑到 btn-primary）─────────────── */
export function initParticleBurst(btn) {
  btn.addEventListener('click', (e) => burst(e, btn));
}

/* ── 统一初始化 ───────────────────────────────────────── */
export function initAllButtons() {
  document.querySelectorAll('.btn-primary,.btn-secondary,.btn-nav-ghost,.btn-nav-solid,.btn-modal,.tb')
    .forEach(b => initRipple(b));
  document.querySelectorAll('.btn-nav-ghost,.btn-nav-solid')
    .forEach(b => initMagnetic(b));
  document.querySelectorAll('.btn-primary')
    .forEach(b => initParticleBurst(b));
}
