/* Foreign · main.js */
import { startAnim }      from './animations.js';
import { initAllButtons } from './buttons.js';
import { getStreak, isDoneToday } from './streak.js';

const THEMES = {
  ocean:        { img:'assets/images/ocean.jpg',        anim:'ocean',  label:'深海',   label_en:'OCEAN',      color:'#3b82f6', rgb:'59,130,246'   },
  fog_forest:   { img:'assets/images/fog_forest.jpg',   anim:'mist',   label:'雾林',   label_en:'FOG FOREST', color:'#6ee7b7', rgb:'110,231,183'  },
  galaxy:       { img:'assets/images/galaxy.jpg',       anim:'stars',  label:'星空',   label_en:'GALAXY',     color:'#818cf8', rgb:'129,140,248'  },
  rain:         { img:'assets/images/rain.jpg',         anim:'rain',   label:'雨天',   label_en:'RAIN',       color:'#93c5fd', rgb:'147,197,253'  },
  aurora:       { img:'assets/images/aurora.jpg',       anim:'aurora', label:'极光',   label_en:'AURORA',     color:'#34d399', rgb:'52,211,153'   },
  sakura:       { img:'assets/images/sakura.jpg',       anim:'sakura', label:'樱花',   label_en:'SAKURA',     color:'#f9a8d4', rgb:'249,168,212'  },
  sunset:       { img:'assets/images/sunset.jpg',       anim:'clouds', label:'火烧云', label_en:'SUNSET',     color:'#fb923c', rgb:'251,146,60'   },
  snow:         { img:'assets/images/snow.jpg',         anim:'snow',   label:'雪山',   label_en:'SNOW',       color:'#bae6fd', rgb:'186,230,253'  },
  forest_green: { img:'assets/images/forest_green.jpg', anim:'forest', label:'雨林',   label_en:'FOREST',     color:'#86efac', rgb:'134,239,172'  },
  white:        { img:null, anim:'none', label:'纯白', label_en:'WHITE', color:'#e2e8f0', rgb:'226,232,240', dm:true  },
  black:        { img:null, anim:'none', label:'纯黑', label_en:'BLACK', color:'#334155', rgb:'51,65,85',   dm:false },
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
    document.body.classList.remove(...Object.keys(THEMES).map(k => `theme-${k}`), 'dm');
    document.body.classList.add(`theme-${key}`);
    if (t.dm) document.body.classList.add('dm');
    document.body.style.background =
      key === 'white' ? '#f6f5f0' : key === 'black' ? '#080808' : '';
    document.documentElement.style.setProperty('--theme-color', t.color);
    document.documentElement.style.setProperty('--theme-color-rgb', t.rgb);
    localStorage.setItem('fg_theme', key);
  }

  if (bg) {
    if (t.img) { bg.style.backgroundImage = `url(${t.img})`; bg.style.opacity = '1'; }
    else        { bg.style.backgroundImage = 'none'; bg.style.opacity = '0'; }
  }

  if (cv) startAnim(t.anim, cv);

  document.querySelectorAll('.theme-dot').forEach(d => {
    d.classList.toggle('on', d.dataset.t === key);
  });
}

function previewTheme(key) {
  if (!THEMES[key]) return;
  const t = THEMES[key];
  if (bg) {
    if (t.img) { bg.style.backgroundImage = `url(${t.img})`; bg.style.opacity = '1'; }
    else        { bg.style.backgroundImage = 'none'; bg.style.opacity = '0'; }
  }
  // 纯白/纯黑预览时正确设置 body 背景色
  document.body.style.background = !t.img
    ? (key === 'white' ? '#f6f5f0' : '#080808')
    : '';
  if (cv) startAnim(t.anim, cv);
}

function restoreTheme() {
  applyTheme(cur);
}

window.setTheme = applyTheme;

/* ── 震撼主题选择器 ─────────────────────────────────── */
function renderDock() {
  const dock = document.getElementById('theme-dock');
  if (!dock) return;
  dock.innerHTML = '';

  const trigger = document.createElement('button');
  trigger.className = 'dock-trigger';
  trigger.setAttribute('aria-label', '切换主题');
  trigger.innerHTML = `
    <span class="dock-trigger-ring"></span>
    <span class="dock-trigger-dot"></span>
    <span class="dock-trigger-label">主题</span>
  `;
  dock.appendChild(trigger);

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

  const grid = overlay.querySelector('#dockGrid');
  let hoverTimer = null;
  let panelClosing = false; // 防止面板关闭后 timer 触发

  Object.keys(THEMES).forEach(key => {
    const t = THEMES[key];
    const card = document.createElement('button');
    card.className = 'dock-card';
    card.dataset.t = key;
    if (key === cur) card.classList.add('active');

    card.innerHTML = `
      <span class="dock-card-swatch" style="background:${t.color}">
        ${t.img ? `<img src="${t.img}" alt="" aria-hidden="true" loading="lazy" draggable="false">` : ''}
        <span class="dock-card-ring" style="border-color:${t.color}"></span>
      </span>
      <span class="dock-card-name">${t.label}</span>
      <span class="dock-card-en">${t.label_en}</span>
    `;

    card.addEventListener('mouseenter', () => {
      card.classList.add('hovered');
      const label = overlay.querySelector('#dockCurrentLabel');
      if (label) label.textContent = `${t.label} · ${t.label_en}`;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        if (!panelClosing) previewTheme(key);
      }, 80);
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('hovered');
      const label = overlay.querySelector('#dockCurrentLabel');
      if (label) label.textContent = '';
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        if (!panelClosing) restoreTheme();
      }, 120);
    });

    card.addEventListener('click', () => {
      clearTimeout(hoverTimer);
      const ripple = document.createElement('span');
      ripple.className = 'dock-select-ripple';
      ripple.style.background = t.color;
      card.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
      applyTheme(key);
      closePanel();
      grid.querySelectorAll('.dock-card').forEach(c => {
        c.classList.toggle('active', c.dataset.t === key);
      });
      updateTriggerColor();
    });

    grid.appendChild(card);
  });

  let isOpen = false;

  function openPanel() {
    isOpen = true;
    panelClosing = false;
    overlay.classList.add('open');
    trigger.classList.add('open');
    grid.querySelectorAll('.dock-card').forEach(c => {
      c.classList.toggle('active', c.dataset.t === cur);
    });
    grid.querySelectorAll('.dock-card').forEach((c, i) => {
      c.style.transitionDelay = `${i * 28}ms`;
      c.classList.add('visible');
    });
  }

  function closePanel() {
    isOpen = false;
    panelClosing = true; // 标记面板正在关闭，阻止 timer 里的 restoreTheme
    clearTimeout(hoverTimer);
    overlay.classList.remove('open');
    trigger.classList.remove('open');
    grid.querySelectorAll('.dock-card').forEach(c => {
      c.style.transitionDelay = '0ms';
      c.classList.remove('visible', 'hovered');
    });
    restoreTheme();
    // 面板动画结束后解除锁定
    setTimeout(() => { panelClosing = false; }, 400);
  }

  trigger.addEventListener('click', () => isOpen ? closePanel() : openPanel());
  overlay.querySelector('.dock-close').addEventListener('click', closePanel);
  overlay.addEventListener('click', e => { if (e.target === overlay) closePanel(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closePanel(); });

  function updateTriggerColor() {
    const t = THEMES[cur];
    const dot  = trigger.querySelector('.dock-trigger-dot');
    const ring = trigger.querySelector('.dock-trigger-ring');
    if (dot)  dot.style.background   = t.color;
    if (ring) ring.style.borderColor = t.color;
  }
  updateTriggerColor();
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
    const { TOTAL } = await import('./wordbank.js');
    const el = document.getElementById('wordbank-sub');
    if (el && TOTAL) el.textContent = TOTAL + ' WORDS';
  } catch(e) {}

  try {
    const cnt = Object.keys(JSON.parse(localStorage.getItem('fg_wrong') || '{}')).length;
    const el  = document.getElementById('wrong-sub');
    if (el) {
      if (cnt > 0) { el.textContent = cnt + ' WORDS'; el.style.color = '#f87171'; }
      else           el.textContent = 'REVIEW';
    }
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
