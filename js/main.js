/* Foreign · main.js
   统一入口：主题切换 + Canvas动画 + 按钮特效 + 首页动态内容
*/
import { startAnim }    from './animations.js';
import { initAllButtons } from './buttons.js';
import { getStreak, isDoneToday } from './streak.js';

// ── 主题配置 ────────────────────────────────────────────────
const THEMES = {
  ocean:        { img:'assets/images/ocean.jpg',        anim:'ocean',  label:'深海',   em:'🌊' },
  fog_forest:   { img:'assets/images/fog_forest.jpg',   anim:'mist',   label:'雾林',   em:'🌲' },
  galaxy:       { img:'assets/images/galaxy.jpg',       anim:'stars',  label:'星空',   em:'🌌' },
  rain:         { img:'assets/images/rain.jpg',         anim:'rain',   label:'雨天',   em:'🌧️' },
  aurora:       { img:'assets/images/aurora.jpg',       anim:'aurora', label:'极光',   em:'🌠' },
  sakura:       { img:'assets/images/sakura.jpg',       anim:'sakura', label:'樱花',   em:'🌸' },
  sunset:       { img:'assets/images/sunset.jpg',       anim:'clouds', label:'火烧云', em:'🌅' },
  snow:         { img:'assets/images/snow.jpg',         anim:'snow',   label:'雪山',   em:'🏔️' },
  forest_green: { img:'assets/images/forest_green.jpg', anim:'forest', label:'雨林',   em:'🌿' },
  white:        { img:null, anim:'none', label:'纯白', em:'⬜', dm:true  },
  black:        { img:null, anim:'none', label:'纯黑', em:'⬛', dm:false },
};

// ── DOM ─────────────────────────────────────────────────────
const bg = document.getElementById('bg-image');
const cv = document.getElementById('bg-canvas');

// canvas 尺寸
function resize() {
  if (!cv) return;
  cv.width  = window.innerWidth;
  cv.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); applyTheme(cur); });

// ── 当前主题 ────────────────────────────────────────────────
let cur = 'ocean';

// ── 主题切换 ────────────────────────────────────────────────
function applyTheme(key) {
  if (!THEMES[key]) key = 'ocean';
  cur = key;
  const t = THEMES[key];

  // body class
  document.body.classList.remove(...Object.keys(THEMES).map(k => `theme-${k}`), 'dm');
  document.body.classList.add(`theme-${key}`);
  if (t.dm) document.body.classList.add('dm');

  // 背景图
  if (bg) {
    if (t.img) {
      bg.style.backgroundImage = `url(${t.img})`;
      bg.style.opacity = '1';
    } else {
      bg.style.backgroundImage = 'none';
      bg.style.opacity = '0';
    }
  }

  // 纯白/纯黑底色
  document.body.style.background =
    key === 'white' ? '#f6f5f0' :
    key === 'black' ? '#080808' : '';

  // Canvas 动画
  if (cv) startAnim(t.anim, cv);

  // 主题按钮状态
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('on', btn.dataset.t === key);
  });

  localStorage.setItem('fg_theme', key);
}

// 挂到 window 供其他页面调用
window.setTheme = applyTheme;

// ── 渲染主题卡片 ─────────────────────────────────────────────
function renderThemeGrid() {
  const grid = document.getElementById('theme-grid');
  if (!grid) return;
  grid.innerHTML = '';
  Object.entries(THEMES).forEach(([key, t]) => {
    const btn = document.createElement('div');
    btn.className = 'theme-btn tb';
    btn.dataset.t = key;
    btn.innerHTML = `<span class="em">${t.em}</span><span class="nm">${t.label}</span>`;
    btn.onclick   = () => applyTheme(key);
    grid.appendChild(btn);
  });
}

// ── 首页动态内容 ─────────────────────────────────────────────
async function initHomeContent() {
  // 连击徽章
  try {
    const streak = getStreak();
    if (streak.count > 0) {
      const badge = document.getElementById('streak-badge');
      if (badge) {
        badge.classList.remove('hidden');
        const numEl = document.getElementById('streak-num');
        if (numEl) numEl.textContent = streak.count;
      }
    }
  } catch(e) {}

  // 今日学习状态
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

  // 回炉本计数
  try {
    const wrong = JSON.parse(localStorage.getItem('fg_wrong') || '{}');
    const cnt   = Object.keys(wrong).length;
    const wrongSub = document.getElementById('wrong-sub');
    if (cnt > 0 && wrongSub) {
      wrongSub.textContent  = cnt + ' WORDS';
      wrongSub.style.color  = '#f87171';
    }
  } catch(e) {}

  // 账号显示
  const user = localStorage.getItem('fg_user');
  const display  = document.getElementById('account-display');
  const loginBtn = document.getElementById('btn-login');
  if (user && display && loginBtn) {
    display.textContent  = user;
    display.style.display = 'inline-block';
    loginBtn.textContent = '退出';
    loginBtn.onclick = () => {
      localStorage.removeItem('fg_user');
      location.reload();
    };
  } else if (loginBtn) {
    loginBtn.onclick = openAuthModal;
  }
}

function openAuthModal() {
  const name = prompt('用户名：');
  if (name && name.trim()) {
    localStorage.setItem('fg_user', name.trim());
    location.reload();
  }
}
window.openAuthModal = openAuthModal;

// ── 初始化 ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // 1. 渲染主题卡片
  renderThemeGrid();

  // 2. 初始化按钮特效（必须在卡片渲染后）
  initAllButtons();

  // 3. 读取并应用保存的主题
  const saved = localStorage.getItem('fg_theme');
  applyTheme(saved && THEMES[saved] ? saved : 'ocean');

  // 4. 首页专属内容（仅在有 theme-grid 的页面执行）
  if (document.getElementById('theme-grid')) {
    await initHomeContent();
  }
});
