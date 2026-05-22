// streak.js — 连击系统
// 记录连续学习天数，提供主题专属连击动画

const KEY_STREAK  = 'fg_streak';
const KEY_LASTDAY = 'fg_last_study_day';

function todayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * 读取连击数据
 */
export function getStreak() {
  return {
    count:   parseInt(localStorage.getItem(KEY_STREAK)  || '0'),
    lastDay: localStorage.getItem(KEY_LASTDAY) || '',
  };
}

/**
 * 完成今日学习后调用，返回新连击数
 */
export function markTodayDone() {
  const today = todayStr();
  const { count, lastDay } = getStreak();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let newCount;
  if (lastDay === today) {
    newCount = count; // 今天已记录
  } else if (lastDay === yesterdayStr) {
    newCount = count + 1; // 连续
  } else {
    newCount = 1; // 断了，重置
  }

  localStorage.setItem(KEY_STREAK,  String(newCount));
  localStorage.setItem(KEY_LASTDAY, today);
  return newCount;
}

/**
 * 检查今天是否已完成
 */
export function isDoneToday() {
  return getStreak().lastDay === todayStr();
}

// ── 连击动画（Canvas，叠加在现有canvas上）─────────────────────

/**
 * 播放连击庆祝动画
 * @param {HTMLCanvasElement} canvas
 * @param {string} theme  当前主题key
 * @param {number} streakCount  连击天数
 */
export function playStreakAnim(canvas, theme, streakCount) {
  const ctx = canvas.getContext('2d');
  const W   = canvas.width;
  const H   = canvas.height;

  // 选择粒子工厂
  const factory = THEME_PARTICLES[theme] || THEME_PARTICLES['ocean'];
  const particles = [];
  const count = Math.min(30 + streakCount * 5, 120);

  for (let i = 0; i < count; i++) {
    particles.push(factory(W, H));
  }

  const startTime = performance.now();
  const duration  = 2800;

  function draw(now) {
    const t = (now - startTime) / duration;
    if (t >= 1) return;

    particles.forEach(p => {
      p.update();
      p.draw(ctx, 1 - t); // alpha fade out
    });

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

// ── 各主题粒子工厂 ───────────────────────────────────────────

function rand(a, b) { return a + Math.random() * (b - a); }

const THEME_PARTICLES = {

  // 深海：蓝白气泡向上浮
  ocean: (W, H) => {
    const x = rand(W * 0.2, W * 0.8);
    const y = rand(H * 0.5, H * 0.9);
    const r = rand(3, 10);
    let vy  = rand(-2, -5);
    let vx  = rand(-0.5, 0.5);
    let a   = rand(0.6, 1);
    return {
      update() { x += vx; y += vy; vy *= 0.99; vx += rand(-0.05, 0.05); },
      draw(ctx, fade) {
        ctx.save();
        ctx.globalAlpha = a * fade;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = '#a8d8f0';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fill();
        ctx.restore();
      }
    };
  },

  // 雾林：萤火虫四散
  fog_forest: (W, H) => {
    let x  = rand(W * 0.3, W * 0.7);
    let y  = rand(H * 0.4, H * 0.8);
    const vx = rand(-3, 3);
    const vy = rand(-4, -1);
    const r  = rand(2, 5);
    const hue = rand(60, 120);
    return {
      update() { x += vx + Math.sin(Date.now() / 300) * 0.5; y += vy; },
      draw(ctx, fade) {
        ctx.save();
        ctx.globalAlpha = fade * 0.9;
        ctx.shadowBlur = 12;
        ctx.shadowColor = `hsl(${hue},90%,70%)`;
        ctx.fillStyle   = `hsl(${hue},90%,80%)`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };
  },

  // 星空：星光爆发 + 射线
  galaxy: (W, H) => {
    const cx  = W / 2;
    const cy  = H / 2;
    const angle = rand(0, Math.PI * 2);
    let dist  = rand(0, 20);
    const spd = rand(3, 8);
    const len = rand(10, 30);
    const hue = rand(240, 310);
    return {
      update() { dist += spd; },
      draw(ctx, fade) {
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;
        ctx.save();
        ctx.globalAlpha = fade * Math.max(0, 1 - dist / (W * 0.4));
        ctx.strokeStyle = `hsl(${hue},80%,85%)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
        ctx.stroke();
        ctx.restore();
      }
    };
  },

  // 雨夜：蓝白水珠向下扩散涟漪
  rain: (W, H) => {
    let x  = rand(W * 0.15, W * 0.85);
    let y  = rand(H * 0.3, H * 0.7);
    let r  = rand(2, 8);
    const gr = rand(0.8, 1.8);
    return {
      update() { r += gr; },
      draw(ctx, fade) {
        const a = Math.max(0, fade * (1 - r / 60));
        ctx.save();
        ctx.globalAlpha = a;
        ctx.strokeStyle = '#a0c4d8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };
  },

  // 极光：绿紫光片弧散
  aurora: (W, H) => {
    let x  = W / 2 + rand(-80, 80);
    let y  = H * 0.4 + rand(-50, 50);
    const angle = rand(0, Math.PI * 2);
    const spd   = rand(2, 5);
    const hue   = Math.random() < 0.5 ? rand(120, 160) : rand(270, 300);
    const size  = rand(8, 20);
    return {
      update() { x += Math.cos(angle) * spd; y += Math.sin(angle) * spd - 1; },
      draw(ctx, fade) {
        ctx.save();
        ctx.globalAlpha = fade * 0.8;
        ctx.fillStyle = `hsla(${hue},80%,70%,0.9)`;
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.4, angle, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };
  },

  // 樱花：粉色花瓣旋转飘落
  sakura: (W, H) => {
    let x   = rand(W * 0.1, W * 0.9);
    let y   = rand(-30, H * 0.3);
    let rot = rand(0, Math.PI * 2);
    const vx  = rand(-1.5, 1.5);
    let vy  = rand(1.5, 3.5);
    const vr  = rand(-0.08, 0.08);
    const size = rand(6, 14);
    return {
      update() { x += vx + Math.sin(Date.now()/500)*0.8; y += vy; rot += vr; },
      draw(ctx, fade) {
        ctx.save();
        ctx.globalAlpha = fade * 0.85;
        ctx.translate(x, y);
        ctx.rotate(rot);
        // 花瓣椭圆
        ctx.fillStyle = `rgba(255,192,203,0.9)`;
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };
  },

  // 火烧云：橙黄光晕向上扩散
  sunset: (W, H) => {
    let x  = rand(W * 0.2, W * 0.8);
    let y  = rand(H * 0.5, H * 0.85);
    let r  = rand(5, 15);
    const gr = rand(1.5, 3);
    const hue = rand(20, 45);
    return {
      update() { r += gr; y -= 0.5; },
      draw(ctx, fade) {
        const a = Math.max(0, fade * (1 - r / 80));
        ctx.save();
        ctx.globalAlpha = a;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `hsla(${hue},100%,75%,0.9)`);
        g.addColorStop(1, `hsla(${hue+15},100%,55%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };
  },

  // 雪山：六角雪花爆散
  snow: (W, H) => {
    let x   = W / 2 + rand(-60, 60);
    let y   = H / 2 + rand(-60, 60);
    const angle = rand(0, Math.PI * 2);
    const spd   = rand(2, 6);
    const size  = rand(8, 18);
    let rot  = rand(0, Math.PI / 3);
    const vrot = rand(-0.02, 0.02);
    return {
      update() { x += Math.cos(angle) * spd; y += Math.sin(angle) * spd + 0.5; rot += vrot; },
      draw(ctx, fade) {
        ctx.save();
        ctx.globalAlpha = fade * 0.9;
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.strokeStyle = '#d0eeff';
        ctx.lineWidth = 1.2;
        // 六角形
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
          ctx.stroke();
          // 小枝
          const mx = Math.cos(a) * size * 0.5;
          const my = Math.sin(a) * size * 0.5;
          const ba = a + Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(mx + Math.cos(ba) * size * 0.3, my + Math.sin(ba) * size * 0.3);
          ctx.stroke();
        }
        ctx.restore();
      }
    };
  },

  // 雨林：绿色光尘上漂
  forest_green: (W, H) => {
    let x  = rand(W * 0.1, W * 0.9);
    let y  = rand(H * 0.5, H * 0.95);
    const vx = rand(-1, 1);
    let vy = rand(-2, -0.5);
    const r  = rand(2, 6);
    const hue = rand(100, 150);
    return {
      update() { x += vx + Math.sin(Date.now()/700)*0.3; y += vy; },
      draw(ctx, fade) {
        ctx.save();
        ctx.globalAlpha = fade * 0.8;
        ctx.shadowBlur  = 8;
        ctx.shadowColor = `hsl(${hue},70%,60%)`;
        ctx.fillStyle   = `hsl(${hue},70%,70%)`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };
  },

  // 纯黑：粒子矩阵（白色像素格）
  black: (W, H) => {
    const gx  = Math.floor(rand(0, 20)) * (W / 20);
    const gy  = Math.floor(rand(0, 12)) * (H / 12);
    let a  = rand(0.5, 1);
    const da = rand(-0.02, -0.005);
    const size = rand(3, 8);
    return {
      update() { a += da; },
      draw(ctx, fade) {
        if (a <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, a) * fade;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(gx, gy, size, size);
        ctx.restore();
      }
    };
  },

  // 纯白：墨水扩散（深色圆环）
  white: (W, H) => {
    let x  = rand(W * 0.2, W * 0.8);
    let y  = rand(H * 0.2, H * 0.8);
    let r  = rand(2, 6);
    const gr = rand(1, 2.5);
    return {
      update() { r += gr; },
      draw(ctx, fade) {
        const a = Math.max(0, fade * (1 - r / 70));
        ctx.save();
        ctx.globalAlpha = a;
        ctx.strokeStyle = `rgba(40,40,40,0.6)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };
  },
};
