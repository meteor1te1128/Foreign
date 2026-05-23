// streak.js — 连击系统
import { pushToCloud, getCurrentUser } from './auth.js';

const KEY_STREAK  = 'fg_streak';
const KEY_LASTDAY = 'fg_last_study_day';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function getStreak() {
  return {
    count:   parseInt(localStorage.getItem(KEY_STREAK)  || '0'),
    lastDay: localStorage.getItem(KEY_LASTDAY) || '',
  };
}

export async function markTodayDone() {
  const today = todayStr();
  const { count, lastDay } = getStreak();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  let newCount = lastDay === today ? count
               : lastDay === yStr  ? count + 1
               : 1;

  localStorage.setItem(KEY_STREAK,  String(newCount));
  localStorage.setItem(KEY_LASTDAY, today);

  // 同步云端
  try {
    const user = await getCurrentUser();
    if (user) await pushToCloud();
  } catch(e) {}

  return newCount;
}

export function isDoneToday() {
  return getStreak().lastDay === todayStr();
}

// ── 连击庆祝动画 ────────────────────────────────────────────

export function playStreakAnim(canvas, theme, streakCount) {
  const ctx = canvas.getContext('2d');
  const W   = canvas.width;
  const H   = canvas.height;

  const factory  = THEME_PARTICLES[theme] || THEME_PARTICLES['ocean'];
  const count    = Math.min(30 + streakCount * 5, 120);
  const particles = Array.from({ length: count }, () => factory(W, H));

  const startTime = performance.now();
  const duration  = 2800;

  function frame(now) {
    const t = (now - startTime) / duration;
    if (t >= 1) return;
    particles.forEach(p => { p.update(); p.draw(ctx, 1 - t); });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function rand(a, b) { return a + Math.random() * (b - a); }

const THEME_PARTICLES = {
  ocean: (W, H) => {
    const p = { x: rand(W*.2,W*.8), y: rand(H*.5,H*.9), r: rand(3,10), vy: rand(-2,-5), vx: rand(-.5,.5), a: rand(.6,1) };
    return {
      update() { p.x+=p.vx; p.y+=p.vy; p.vy*=.99; p.vx+=rand(-.05,.05); },
      draw(ctx,fade) { ctx.save(); ctx.globalAlpha=p.a*fade; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.strokeStyle='#a8d8f0'; ctx.lineWidth=1.5; ctx.stroke(); ctx.fillStyle='rgba(255,255,255,.15)'; ctx.fill(); ctx.restore(); },
    };
  },
  fog_forest: (W, H) => {
    const p = { x: rand(W*.3,W*.7), y: rand(H*.4,H*.8), vx: rand(-3,3), vy: rand(-4,-1), r: rand(2,5), hue: rand(60,120) };
    return {
      update() { p.x+=p.vx+Math.sin(Date.now()/300)*.5; p.y+=p.vy; },
      draw(ctx,fade) { ctx.save(); ctx.globalAlpha=fade*.9; ctx.shadowBlur=12; ctx.shadowColor=`hsl(${p.hue},90%,70%)`; ctx.fillStyle=`hsl(${p.hue},90%,80%)`; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); ctx.restore(); },
    };
  },
  galaxy: (W, H) => {
    const p = { angle: rand(0,Math.PI*2), dist: rand(0,20), spd: rand(3,8), len: rand(10,30), hue: rand(240,310), cx: W/2, cy: H/2 };
    return {
      update() { p.dist+=p.spd; },
      draw(ctx,fade) { const x=p.cx+Math.cos(p.angle)*p.dist,y=p.cy+Math.sin(p.angle)*p.dist,x2=x+Math.cos(p.angle)*p.len,y2=y+Math.sin(p.angle)*p.len,a=fade*Math.max(0,1-p.dist/(W*.4)); ctx.save(); ctx.globalAlpha=a; ctx.strokeStyle=`hsl(${p.hue},80%,85%)`; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x2,y2); ctx.stroke(); ctx.restore(); },
    };
  },
  rain: (W, H) => {
    const p = { x: rand(W*.15,W*.85), y: rand(H*.3,H*.7), r: rand(2,8), gr: rand(.8,1.8) };
    return {
      update() { p.r+=p.gr; },
      draw(ctx,fade) { const a=Math.max(0,fade*(1-p.r/60)); ctx.save(); ctx.globalAlpha=a; ctx.strokeStyle='#a0c4d8'; ctx.lineWidth=1; ctx.beginPath(); ctx.ellipse(p.x,p.y,p.r,p.r*.35,0,0,Math.PI*2); ctx.stroke(); ctx.restore(); },
    };
  },
  aurora: (W, H) => {
    const p = { x: W/2+rand(-80,80), y: H*.4+rand(-50,50), angle: rand(0,Math.PI*2), spd: rand(2,5), hue: Math.random()<.5?rand(120,160):rand(270,300), size: rand(8,20) };
    return {
      update() { p.x+=Math.cos(p.angle)*p.spd; p.y+=Math.sin(p.angle)*p.spd-1; },
      draw(ctx,fade) { ctx.save(); ctx.globalAlpha=fade*.8; ctx.fillStyle=`hsla(${p.hue},80%,70%,.9)`; ctx.beginPath(); ctx.ellipse(p.x,p.y,p.size,p.size*.4,p.angle,0,Math.PI*2); ctx.fill(); ctx.restore(); },
    };
  },
  sakura: (W, H) => {
    const p = { x: rand(W*.1,W*.9), y: rand(-30,H*.3), rot: rand(0,Math.PI*2), vx: rand(-1.5,1.5), vy: rand(1.5,3.5), vr: rand(-.08,.08), size: rand(6,14) };
    return {
      update() { p.x+=p.vx+Math.sin(Date.now()/500)*.8; p.y+=p.vy; p.rot+=p.vr; },
      draw(ctx,fade) { ctx.save(); ctx.globalAlpha=fade*.85; ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle='rgba(255,192,210,.9)'; ctx.beginPath(); ctx.ellipse(0,0,p.size,p.size*.45,0,0,Math.PI*2); ctx.fill(); ctx.restore(); },
    };
  },
  sunset: (W, H) => {
    const p = { x: rand(W*.2,W*.8), y: rand(H*.5,H*.85), r: rand(5,15), gr: rand(1.5,3), hue: rand(20,45) };
    return {
      update() { p.r+=p.gr; p.y-=.5; },
      draw(ctx,fade) { const a=Math.max(0,fade*(1-p.r/80)); ctx.save(); ctx.globalAlpha=a; const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r); g.addColorStop(0,`hsla(${p.hue},100%,75%,.9)`); g.addColorStop(1,`hsla(${p.hue+15},100%,55%,0)`); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); ctx.restore(); },
    };
  },
  snow: (W, H) => {
    const p = { x: W/2+rand(-60,60), y: H/2+rand(-60,60), angle: rand(0,Math.PI*2), spd: rand(2,6), size: rand(8,18), rot: rand(0,Math.PI/3), vrot: rand(-.02,.02) };
    return {
      update() { p.x+=Math.cos(p.angle)*p.spd; p.y+=Math.sin(p.angle)*p.spd+.5; p.rot+=p.vrot; },
      draw(ctx,fade) {
        ctx.save(); ctx.globalAlpha=fade*.9; ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.strokeStyle='#d0eeff'; ctx.lineWidth=1.2;
        for(let i=0;i<6;i++){ const a=(i/6)*Math.PI*2; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a)*p.size,Math.sin(a)*p.size); ctx.stroke(); const mx=Math.cos(a)*p.size*.5,my=Math.sin(a)*p.size*.5,ba=a+Math.PI/2; ctx.beginPath(); ctx.moveTo(mx,my); ctx.lineTo(mx+Math.cos(ba)*p.size*.3,my+Math.sin(ba)*p.size*.3); ctx.stroke(); }
        ctx.restore();
      },
    };
  },
  forest_green: (W, H) => {
    const p = { x: rand(W*.1,W*.9), y: rand(H*.5,H*.95), vx: rand(-1,1), vy: rand(-2,-.5), r: rand(2,6), hue: rand(100,150) };
    return {
      update() { p.x+=p.vx+Math.sin(Date.now()/700)*.3; p.y+=p.vy; },
      draw(ctx,fade) { ctx.save(); ctx.globalAlpha=fade*.8; ctx.shadowBlur=8; ctx.shadowColor=`hsl(${p.hue},70%,60%)`; ctx.fillStyle=`hsl(${p.hue},70%,70%)`; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); ctx.restore(); },
    };
  },
  black: (W, H) => {
    const p = { gx: Math.floor(rand(0,20))*(W/20), gy: Math.floor(rand(0,12))*(H/12), a: rand(.5,1), da: rand(-.02,-.005), size: rand(3,8) };
    return {
      update() { p.a+=p.da; },
      draw(ctx,fade) { if(p.a<=0)return; ctx.save(); ctx.globalAlpha=Math.max(0,p.a)*fade; ctx.fillStyle='#ffffff'; ctx.fillRect(p.gx,p.gy,p.size,p.size); ctx.restore(); },
    };
  },
  white: (W, H) => {
    const p = { x: rand(W*.2,W*.8), y: rand(H*.2,H*.8), r: rand(2,6), gr: rand(1,2.5) };
    return {
      update() { p.r+=p.gr; },
      draw(ctx,fade) { const a=Math.max(0,fade*(1-p.r/70)); ctx.save(); ctx.globalAlpha=a; ctx.strokeStyle='rgba(40,40,40,.6)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.stroke(); ctx.restore(); },
    };
  },
};
