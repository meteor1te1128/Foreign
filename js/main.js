/* Foreign · main.js — 震撼主题选择器 v2
   设计参考：Arc Browser侧边栏 + Linear主题切换 + Vercel Dashboard
   交互：点击触发 → 弧形爆炸展开 → hover全屏预览 → 选中涟漪收回   */

import { startAnim }      from './animations.js';
import { initAllButtons } from './buttons.js';
import { getStreak, isDoneToday } from './streak.js';

const THEMES = {
  ocean:        { img:'assets/images/ocean.jpg',        anim:'ocean',  label:'深海',   label_en:'OCEAN',      color:'#3b82f6' },
  fog_forest:   { img:'assets/images/fog_forest.jpg',   anim:'mist',   label:'雾林',   label_en:'FOG FOREST', color:'#6ee7b7' },
  galaxy:       { img:'assets/images/galaxy.jpg',       anim:'stars',  label:'星空',   label_en:'GALAXY',     color:'#818cf8' },
  rain:         { img:'assets/images/rain.jpg',         anim:'rain',   label:'雨天',   label_en:'RAIN',       color:'#93c5fd' },
  aurora:       { img:'assets/images/aurora.jpg',       anim:'aurora', label:'极光',   label_en:'AURORA',     color:'#34d399' },
  sakura:       { img:'assets/images/sakura.jpg',       anim:'sakura', label:'樱花',   label_en:'SAKURA',     color:'#f9a8d4' },
  sunset:       { img:'assets/images/sunset.jpg',       anim:'clouds', label:'火烧云', label_en:'SUNSET',     color:'#fb923c' },
  snow:         { img:'assets/images/snow.jpg',         anim:'snow',   label:'雪山',   label_en:'SNOW',       color:'#bae6fd' },
  forest_green: { img:'assets/images/forest_green.jpg', anim:'forest', label:'雨林',   label_en:'FOREST',     color:'#86efac' },
  white:        { img:null, anim:'none', label:'纯白', label_en:'WHITE', color:'#e2e8f0', dm:true  },
  black:        { img:null, anim:'none', label:'纯黑', label_en:'BLACK', color:'#334155', dm:false },
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

function applyTheme(key, isPreview = false) {
  if (!THEMES[key]) key = 'ocean';
  if (!isPreview) cur = key;
  const t = THEMES[key];

  if (!isPreview) {
    document.body.classList.remove(...Object.keys(THEMES).map(k=>`theme-${k}`), 'dm');
    document.body.classList.add(`theme-${key}`);
    if (t.dm) document.body.classList.add('dm');
    document.body.style.background =
      key==='white' ? '#f6f5f0' : key==='black' ? '#080808' : '';
    localStorage.setItem('fg_theme', key);
  }

  if (bg) {
    if (t.img) { bg.style.backgroundImage=`url(${t.img})`; bg.style.opacity='1'; }
    else        { bg.style.backgroundImage='none'; bg.style.opacity= isPreview ? '0' : '0'; }
  }

  if (!isPreview && cv) startAnim(t.anim, cv);

  document.querySelectorAll('.theme-dot').forEach(d => {
    d.classList.toggle('on', d.dataset.t === key);
  });
}

// 恢复真实主题（hover结束后）
function restoreTheme() {
  applyTheme(cur);
}

window.setTheme = applyTheme;

/* ═══════════════════════════════════════════════════════
   震撼主题选择器
   结构：
   · .dock-trigger — 右下角常驻小圆点（呼吸光环）
   · .dock-panel   — 展开后的主面板（全屏覆盖层）
   · .dock-grid    — 主题卡片网格（3列）
   · .dock-preview — hover时的全屏背景预览
═══════════════════════════════════════════════════════ */
function renderDock() {
  const dock = document.getElementById('theme-dock');
  if (!dock) return;
  dock.innerHTML = '';

  // ── 触发按钮（右下角常驻）──
  const trigger = document.createElement('button');
  trigger.className = 'dock-trigger';
  trigger.setAttribute('aria-label', '切换主题');
  trigger.innerHTML = `
    <span class="dock-trigger-ring"></span>
    <span class="dock-trigger-dot"></span>
    <span class="dock-trigger-label">主题</span>
  `;
  dock.appendChild(trigger);

  // ── 全屏遮罩 + 面板 ──
  const overlay = document.createElement('div');
  overlay.className = 'dock-overlay';
  overlay.innerHTML = `
    <div class="dock-panel">
      <div class="dock-panel-header">
        <span class="dock-panel-title">选择主题</span>
        <button class="dock-close" aria-label="关闭">✕</button>
      </div>
      <div class="dock-grid" id="dockGrid"></div>
      <div class="dock-panel-footer">
        <span class="dock-current-label" id="dockCurrentLabel"></span>
      </div>
    </div>
  `;
  dock.appendChild(overlay);

  // ── 主题卡片 ──
  const grid = overlay.querySelector('#dockGrid');
  const keys = Object.keys(THEMES);

  keys.forEach((key) => {
    const t = THEMES[key];
    const card = document.createElement('button');
    card.className = 'dock-card';
    card.dataset.t = key;
    if (key === cur) card.classList.add('active');

    card.innerHTML = `
      <span class="dock-card-swatch" style="background:${t.color}">
        ${t.img ? `<img src="${t.img}" alt="" aria-hidden="true" loading="lazy">` : ''}
        <span class="dock-card-ring" style="border-color:${t.color}"></span>
      </span>
      <span class="dock-card-name">${t.label}</span>
      <span class="dock-card-en">${t.label_en}</span>
    `;

    // Hover → 全屏背景预览（只换图，不换动画，性能好）
    card.addEventListener('mouseenter', () => {
      // 更新背景图预览
      if (bg) {
        if (t.img) { bg.style.backgroundImage=`url(${t.img})`; bg.style.opacity='1'; }
        else { bg.style.backgroundImage='none'; bg.style.opacity='0'; }
      }
      // 更新底部标签
      const label = overlay.querySelector('#dockCurrentLabel');
      if (label) label.textContent = `${t.label} · ${t.label_en}`;
      // 卡片放大
      card.classList.add('hovered');
    });
    card.addEventListener('mouseleave', () => {
      restoreTheme();
      card.classList.remove('hovered');
      const label = overlay.querySelector('#dockCurrentLabel');
      if (label) label.textContent = '';
    });

    // 点击选中
    card.addEventListener('click', () => {
      // 涟漪爆炸效果
      const ripple = document.createElement('span');
      ripple.className = 'dock-select-ripple';
      ripple.style.background = t.color;
      card.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);

      applyTheme(key);
      closePanel();

      // 更新所有卡片激活态
      grid.querySelectorAll('.dock-card').forEach(c => {
        c.classList.toggle('active', c.dataset.t === key);
      });
    });

    grid.appendChild(card);
  });

  // ── 开关逻辑 ──
  let isOpen = false;

  function openPanel() {
    isOpen = true;
    overlay.classList.add('open');
    trigger.classList.add('open');
    // 更新激活态
    grid.querySelectorAll('.dock-card').forEach(c => {
      c.classList.toggle('active', c.dataset.t === cur);
    });
    // 卡片入场动画：交错
    grid.querySelectorAll('.dock-card').forEach((c, i) => {
      c.style.transitionDelay = `${i * 28}ms`;
      c.classList.add('visible');
    });
  }

  function closePanel() {
    isOpen = false;
    overlay.classList.remove('open');
    trigger.classList.remove('open');
    grid.querySelectorAll('.dock-card').forEach(c => {
      c.style.transitionDelay = '0ms';
      c.classList.remove('visible');
    });
    restoreTheme();
  }

  trigger.addEventListener('click', () => isOpen ? closePanel() : openPanel());
  overlay.querySelector('.dock-close').addEventListener('click', closePanel);
  overlay.addEventListener('click', e => { if (e.target === overlay) closePanel(); });
  document.addEventListener('keydown', e => { if (e.key==='Escape' && isOpen) closePanel(); });

  // 更新触发按钮颜色（跟随当前主题）
  function updateTrigger() {
    const t = THEMES[cur];
    trigger.querySelector('.dock-trigger-dot').style.background = t.color;
    trigger.querySelector('.dock-trigger-ring').style.borderColor = t.color;
  }
  updateTrigger();
  const _origApply = window.setTheme;
  window.setTheme = (key) => { _origApply(key); updateTrigger(); };
}

/* ── 首页动态内容 ──────────────────────────────────── */
async function initHomeContent() {
  try {
    const streak = getStreak();
    if (streak.count > 0) {
      document.getElementById('streak-badge')?.classList.remove('hidden');
      const n = document.getElementById('streak-num');
      if (n) n.textContent = streak.count;
    }
  } catch(e) {}

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

  try {
    const cnt = Object.keys(JSON.parse(localStorage.getItem('fg_wrong')||'{}')).length;
    const el  = document.getElementById('wrong-sub');
    if (cnt > 0 && el) { el.textContent=cnt+' WORDS'; el.style.color='#f87171'; }
  } catch(e) {}

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
