// main.js — Foreign 首页主逻辑 + 主题选择器
import { startAnim, stopAnim } from './animations.js';
import { initAllButtons }       from './buttons.js';
import { getTodayPlan }         from './fsrs.js';
import { WORDS }                from './wordbank.js';
import { register, login, logout, getCurrentUser, pullFromCloud, startAutoSync } from './auth.js';

// ── 主题配置 ──────────────────────────────────────────────
const THEMES = {
  ocean:        { img:'assets/images/ocean.jpg',        anim:'ocean',  label:'深海',   label_en:'OCEAN',      color:'#3b82f6', rgb:'59,130,246'   },
  fog_forest:   { img:'assets/images/fog_forest.jpg',   anim:'mist',   label:'雾林',   label_en:'FOG FOREST', color:'#6ee7b7', rgb:'110,231,183'  },
  galaxy:       { img:'assets/images/galaxy.jpg',       anim:'stars',  label:'星空',   label_en:'GALAXY',     color:'#818cf8', rgb:'129,140,248'  },
  rain:         { img:'assets/images/rain.jpg',         anim:'rain',   label:'雨天',   label_en:'RAIN',       color:'#93c5fd', rgb:'147,197,253'  },
  aurora:       { img:'assets/images/aurora.jpg',       anim:'none',   label:'极光',   label_en:'AURORA',     color:'#34d399', rgb:'52,211,153'   },
  sakura:       { img:'assets/images/sakura.jpg',       anim:'sakura', label:'樱花',   label_en:'SAKURA',     color:'#f9a8d4', rgb:'249,168,212'  },
  sunset:       { img:'assets/images/sunset.jpg',       anim:'clouds', label:'火烧云', label_en:'SUNSET',     color:'#fb923c', rgb:'251,146,60'   },
  snow:         { img:'assets/images/snow.jpg',         anim:'snow',   label:'雪山',   label_en:'SNOW',       color:'#bae6fd', rgb:'186,230,253'  },
  forest_green: { img:'assets/images/forest_green.jpg', anim:'forest', label:'雨林',   label_en:'FOREST',     color:'#86efac', rgb:'134,239,172'  },
  white:        { img:null, anim:'none', label:'纯白', label_en:'WHITE', color:'#94a3b8', rgb:'148,163,184', dm:true },
  black:        { img:null, anim:'none', label:'纯黑', label_en:'BLACK', color:'#475569', rgb:'71,85,105',   dm:true },
};

const bg = document.getElementById('bg');
const cv = document.getElementById('cv');
let cur  = localStorage.getItem('fg_theme') || 'ocean';
if (!THEMES[cur]) cur = 'ocean';

function resize() { cv.width = window.innerWidth; cv.height = window.innerHeight; }
resize();
window.addEventListener('resize', () => { resize(); });

function applyTheme(key, save = true) {
  if (!THEMES[key]) return;
  cur = key;
  const t = THEMES[key];
  document.body.classList.remove(...Object.keys(THEMES).map(k => `theme-${k}`), 'dm');
  document.body.classList.add(`theme-${key}`);
  if (t.dm) document.body.classList.add('dm');
  // 有背景图时清空 inline background，防止残留
  document.body.style.background = t.img ? '' : (key === 'white' ? '#f6f5f0' : '#080808');
  document.documentElement.style.setProperty('--theme-color', t.color);
  document.documentElement.style.setProperty('--theme-color-rgb', t.rgb);
  if (t.img) { bg.style.backgroundImage = `url(${t.img})`; bg.style.opacity = '1'; }
  else        { bg.style.backgroundImage = 'none'; bg.style.opacity = '0'; }
  stopAnim(); if (t.anim !== 'none') startAnim(t.anim, cv);
  if (save) localStorage.setItem('fg_theme', key);
  updateTrigger();
  document.querySelectorAll('.dock-card').forEach(c => c.classList.toggle('active', c.dataset.t === key));
}

function previewTheme(key) {
  if (!THEMES[key]) return;
  const t = THEMES[key];
  if (t.img) { bg.style.backgroundImage = `url(${t.img})`; bg.style.opacity = '1'; }
  else        { bg.style.backgroundImage = 'none'; bg.style.opacity = '0'; }
  document.body.style.background = t.img ? '' : (key === 'white' ? '#f6f5f0' : '#080808');
  // white 和 black 都需要 dm
  if (t.dm) document.body.classList.add('dm');
  else      document.body.classList.remove('dm');
  stopAnim(); if (t.anim !== 'none') startAnim(t.anim, cv);
}

function restoreTheme() { applyTheme(cur, false); }

// ── 今日计划统计 ──────────────────────────────────────────
function updateStatMeta() {
  try {
    const plan = getTodayPlan(WORDS.map(w => w.id));
    const meta  = document.getElementById('stat-meta');
    const total = document.getElementById('stat-total');
    const statNew    = document.getElementById('stat-new');
    const statReview = document.getElementById('stat-review');
    const statStreak = document.getElementById('stat-streak');
    if (meta)       meta.textContent       = `${plan.newWords.length} NEW · ${plan.due.length} REVIEW`;
    if (total)      total.textContent      = plan.all.length;
    if (statNew)    statNew.textContent    = plan.newWords.length;
    if (statReview) statReview.textContent = plan.due.length;
    if (statStreak) statStreak.textContent = parseInt(localStorage.getItem('fg_streak') || '0');
  } catch(e) {}
}

// ── 主题选择器 ────────────────────────────────────────────
function renderDock() {
  const dock = document.getElementById('theme-dock');
  if (!dock) return;

  const trigger = document.createElement('button');
  trigger.className = 'dock-trigger';
  trigger.setAttribute('aria-label', '切换主题');
  trigger.style.position = 'relative';
  trigger.innerHTML = `
    <span class="dock-trigger-ring"></span>
    <span class="dock-trigger-dot"></span>
    <span class="dock-trigger-label">${THEMES[cur]?.label || '主题'}</span>
    <span class="dock-trigger-icon">🎨</span>
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
    </div>`;
  dock.appendChild(overlay);

  const grid = overlay.querySelector('#dockGrid');
  let hoverTimer = null, panelClosing = false, isOpen = false;

  Object.keys(THEMES).forEach(key => {
    const t = THEMES[key];
    const card = document.createElement('button');
    card.className = 'dock-card'; card.dataset.t = key;
    if (key === cur) card.classList.add('active');
    card.innerHTML = `
      <span class="dock-card-swatch" style="background:${t.color}">
        ${t.img ? `<img src="${t.img}" alt="" aria-hidden="true" loading="lazy" draggable="false">` : ''}
        <span class="dock-card-ring" style="border-color:${t.color}"></span>
      </span>
      <span class="dock-card-name">${t.label}</span>`;

    card.addEventListener('mouseenter', () => {
      card.classList.add('hovered');
      const lbl = overlay.querySelector('#dockCurrentLabel');
      if (lbl) lbl.textContent = t.label;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => { if (!panelClosing) previewTheme(key); }, 80);
    });
    card.addEventListener('mouseleave', () => {
      card.classList.remove('hovered');
      const lbl = overlay.querySelector('#dockCurrentLabel');
      if (lbl) lbl.textContent = '';
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => { if (!panelClosing) restoreTheme(); }, 120);
    });
    card.addEventListener('click', () => {
      clearTimeout(hoverTimer);
      const ripple = document.createElement('span');
      ripple.className = 'dock-select-ripple'; ripple.style.background = t.color;
      card.appendChild(ripple); setTimeout(() => ripple.remove(), 500);
      applyTheme(key); closePanel();
    });
    grid.appendChild(card);
  });

  function openPanel() {
    isOpen = true; panelClosing = false;
    overlay.classList.add('open'); trigger.classList.add('open');
    grid.querySelectorAll('.dock-card').forEach((c, i) => {
      c.classList.toggle('active', c.dataset.t === cur);
      c.style.transitionDelay = `${i * 24}ms`; c.classList.add('visible');
    });
  }
  function closePanel() {
    isOpen = false; panelClosing = true; clearTimeout(hoverTimer);
    overlay.classList.remove('open'); trigger.classList.remove('open');
    grid.querySelectorAll('.dock-card').forEach(c => {
      c.style.transitionDelay = '0ms'; c.classList.remove('visible', 'hovered');
    });
    restoreTheme();
    setTimeout(() => { panelClosing = false; }, 400);
  }

  trigger.addEventListener('click', () => isOpen ? closePanel() : openPanel());
  overlay.querySelector('.dock-close').addEventListener('click', closePanel);
  overlay.addEventListener('click', e => { if (e.target === overlay) closePanel(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closePanel(); });
}

function updateTrigger() {
  const t = THEMES[cur];
  const dot   = document.querySelector('.dock-trigger-dot');
  const ring  = document.querySelector('.dock-trigger-ring');
  const label = document.querySelector('.dock-trigger-label');
  if (dot)   dot.style.background   = t.color;
  if (ring)  ring.style.borderColor = t.color;
  if (label) label.textContent      = t.label;
}

// ── 登录模态框 ────────────────────────────────────────────
function initLogin() {
  const modal  = document.getElementById('login-modal');
  const box    = document.getElementById('login-box');
  const btnL   = document.getElementById('btn-login');
  const btnC   = document.getElementById('close-modal');
  const tabs   = document.querySelectorAll('.md-tab');
  const btnSub = document.getElementById('btn-submit');
  const msg    = document.getElementById('auth-msg');
  if (!modal) return;

  let mode = 'login';

  // 修复：body.dm 存在时是亮色背景，弹窗用浅色样式
  function updateBoxTheme() {
    const isLight = document.body.classList.contains('dm');
    box.className = 'md' + (isLight ? ' lt' : '');
  }

  function openModal() {
    updateBoxTheme();
    modal.classList.add('open');
  }
  function closeModal() {
    modal.classList.remove('open');
    if (msg) msg.textContent = '';
  }

  function updateLoginBtn() {
    const saved = localStorage.getItem('fg_user');
    if (btnL) btnL.textContent = saved || '登录';
  }

  btnL?.addEventListener('click', async () => {
    const user = await getCurrentUser();
    if (user) {
      const username = localStorage.getItem('fg_user') || user.email;
      const confirmOut = confirm(`当前用户：${username}\n\n确定要登出吗？`);
      if (confirmOut) {
        await logout();
        updateLoginBtn();
        updateStatMeta();
        // 登出后刷新页面，确保所有数据状态干净
        location.reload();
      }
      return;
    }
    openModal();
  });

  btnC?.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // 主题切换时同步更新弹窗颜色
  const themeObserver = new MutationObserver(() => {
    if (modal.classList.contains('open')) updateBoxTheme();
  });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  tabs.forEach(t => {
    t.addEventListener('click', () => {
      mode = t.dataset.tab;
      tabs.forEach(x => x.classList.toggle('on', x === t));
      btnSub.textContent = mode === 'login' ? '登录' : '注册';
      if (msg) msg.textContent = '';
    });
  });

  btnSub?.addEventListener('click', async () => {
    const user = document.getElementById('inp-user')?.value.trim();
    const pass = document.getElementById('inp-pass')?.value.trim();

    btnSub.disabled = true;
    btnSub.textContent = '请稍候...';
    if (msg) { msg.textContent = ''; msg.className = 'mmsg'; }

    let result;
    if (mode === 'login') {
      result = await login(user, pass);
    } else {
      result = await register(user, pass);
    }

    btnSub.disabled = false;
    btnSub.textContent = mode === 'login' ? '登录' : '注册';

    if (result.ok) {
      if (msg) { msg.textContent = mode === 'login' ? '登录成功！' : '注册成功！'; msg.className = 'mmsg ok'; }
      updateLoginBtn();
      // 登录/注册成功后等云端数据拉取完再更新统计
      updateStatMeta();
      setTimeout(closeModal, 800);
    } else {
      if (msg) { msg.textContent = result.msg; msg.className = 'mmsg err'; }
    }
  });

  [document.getElementById('inp-user'), document.getElementById('inp-pass')].forEach(inp => {
    inp?.addEventListener('keydown', e => { if (e.key === 'Enter') btnSub?.click(); });
  });

  updateLoginBtn();
}

// ── 初始化 ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  applyTheme(cur, false);
  renderDock();
  initLogin();
  initAllButtons();

  const user = await getCurrentUser();
  if (user) {
    await pullFromCloud();
    const cloudTheme = localStorage.getItem('fg_theme') || 'ocean';
    if (cloudTheme !== cur) applyTheme(cloudTheme, false);
  }

  updateStatMeta();
  startAutoSync();
});
