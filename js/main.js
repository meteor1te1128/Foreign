/* Foreign · main.js */
import { startAnim }      from './animations.js';
import { initAllButtons } from './buttons.js';
import { getStreak, isDoneToday } from './streak.js';

const THEMES = {
  ocean:        { img:'assets/images/ocean.jpg',        anim:'ocean',  label:'深海',   color:'#3b82f6' },
  fog_forest:   { img:'assets/images/fog_forest.jpg',   anim:'mist',   label:'雾林',   color:'#6ee7b7' },
  galaxy:       { img:'assets/images/galaxy.jpg',       anim:'stars',  label:'星空',   color:'#818cf8' },
  rain:         { img:'assets/images/rain.jpg',         anim:'rain',   label:'雨天',   color:'#93c5fd' },
  aurora:       { img:'assets/images/aurora.jpg',       anim:'aurora', label:'极光',   color:'#34d399' },
  sakura:       { img:'assets/images/sakura.jpg',       anim:'sakura', label:'樱花',   color:'#f9a8d4' },
  sunset:       { img:'assets/images/sunset.jpg',       anim:'clouds', label:'火烧云', color:'#fb923c' },
  snow:         { img:'assets/images/snow.jpg',         anim:'snow',   label:'雪山',   color:'#bae6fd' },
  forest_green: { img:'assets/images/forest_green.jpg', anim:'forest', label:'雨林',   color:'#86efac' },
  white:        { img:null, anim:'none', label:'纯白', color:'#f1f5f9', dm:true  },
  black:        { img:null, anim:'none', label:'纯黑', color:'#1e293b', dm:false },
};

const bg = document.getElementById('bg-image');
const cv = document.getElementById('bg-canvas');

function resize() {
  if (!cv) return;
  cv.width = window.innerWidth; cv.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); applyTheme(cur); });

let cur = 'ocean';

function applyTheme(key) {
  if (!THEMES[key]) key = 'ocean';
  cur = key;
  const t = THEMES[key];

  document.body.classList.remove(...Object.keys(THEMES).map(k=>`theme-${k}`), 'dm');
  document.body.classList.add(`theme-${key}`);
  if (t.dm) document.body.classList.add('dm');

  if (bg) {
    if (t.img) { bg.style.backgroundImage=`url(${t.img})`; bg.style.opacity='1'; }
    else        { bg.style.backgroundImage='none'; bg.style.opacity='0'; }
  }
  document.body.style.background =
    key==='white' ? '#f6f5f0' : key==='black' ? '#080808' : '';

  if (cv) startAnim(t.anim, cv);

  /* 圆点激活态 */
  document.querySelectorAll('.theme-dot').forEach(d => {
    d.classList.toggle('on', d.dataset.t === key);
  });

  localStorage.setItem('fg_theme', key);
}

window.setTheme = applyTheme;

/* ── 渲染圆点 dock ─────────────────────────────────── */
function renderDock() {
  const dock = document.getElementById('theme-dock');
  if (!dock) return;
  dock.innerHTML = '';

  const keys = Object.keys(THEMES);
  keys.forEach((key, i) => {
    /* 纯白/纯黑前加分隔线 */
    if (key === 'white') {
      const div = document.createElement('div');
      div.className = 'dock-divider';
      dock.appendChild(div);
    }

    const t   = THEMES[key];
    const dot = document.createElement('div');
    dot.className    = 'theme-dot';
    dot.dataset.t    = key;
    dot.dataset.label = t.label;
    dot.style.cssText = `background:${t.color};--dot-color:${t.color};`;
    /* 纯白点加边框避免消失在白底 */
    if (key === 'white') dot.style.border = '1px solid rgba(0,0,0,.15)';
    dot.onclick = () => applyTheme(key);
    dock.appendChild(dot);
  });
}

/* ── 首页动态内容 ──────────────────────────────────── */
async function initHomeContent() {
  /* 连击 */
  try {
    const streak = getStreak();
    if (streak.count > 0) {
      document.getElementById('streak-badge')?.classList.remove('hidden');
      const n = document.getElementById('streak-num');
      if (n) n.textContent = streak.count;
    }
  } catch(e) {}

  /* 今日学习 */
  const learnSub = document.getElementById('learn-sub');
  if (learnSub) {
    try {
      if (isDoneToday()) {
        learnSub.textContent = '✓ 已完成';
        learnSub.style.color = '#4ade80';
      } else {
        const { WORDS }        = await import('./wordbank.js');
        const { getTodayPlan } = await import('./fsrs.js');
        const plan = getTodayPlan(WORDS.map(w => w.id));
        learnSub.textContent = plan.all.length + ' WORDS';
      }
    } catch(e) { learnSub.textContent = 'TODAY'; }
  }

  /* 回炉本 */
  try {
    const cnt = Object.keys(JSON.parse(localStorage.getItem('fg_wrong')||'{}')).length;
    const el  = document.getElementById('wrong-sub');
    if (cnt > 0 && el) { el.textContent=cnt+' WORDS'; el.style.color='#f87171'; }
  } catch(e) {}

  /* 账号 */
  const user    = localStorage.getItem('fg_user');
  const display = document.getElementById('account-display');
  const btn     = document.getElementById('btn-login');
  if (user && display && btn) {
    display.textContent = user; display.style.display = 'inline-block';
    btn.textContent = '退出';
    btn.onclick = () => { localStorage.removeItem('fg_user'); location.reload(); };
  } else if (btn) {
    btn.onclick = () => {
      const name = prompt('用户名：');
      if (name?.trim()) { localStorage.setItem('fg_user', name.trim()); location.reload(); }
    };
  }
}

/* ── 初始化 ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  renderDock();
  initAllButtons();
  const saved = localStorage.getItem('fg_theme');
  applyTheme(saved && THEMES[saved] ? saved : 'ocean');
  if (document.getElementById('theme-dock')) await initHomeContent();
});
