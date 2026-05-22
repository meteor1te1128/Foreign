/* Foreign · main.js
   适配新版 index.html：
   - canvas id: bg-canvas
   - bg div id: bg-image
   - 主题卡片: .theme-grid 动态渲染
   - 无 .tb 元素，setTheme 直接更新 data-t 状态
*/
import { startAnim, stopAnim } from './animations.js';
import { initAllButtons }      from './buttons.js';

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

/* ── DOM 元素 ────────────────────────────────────────── */
const bg  = document.getElementById('bg-image');
const cv  = document.getElementById('bg-canvas');

/* canvas 尺寸同步 */
function resize() {
  if (!cv) return;
  cv.width  = window.innerWidth;
  cv.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); applyTheme(cur); });

/* ── 当前主题 ────────────────────────────────────────── */
let cur = 'ocean';

/* ── 主题切换 ────────────────────────────────────────── */
function applyTheme(key) {
  if (!THEMES[key]) key = 'ocean';
  cur = key;
  const t = THEMES[key];

  /* body class */
  const allKeys = Object.keys(THEMES);
  document.body.classList.remove(...allKeys.map(k => `theme-${k}`), 'dm');
  document.body.classList.add(`theme-${key}`);
  if (t.dm) document.body.classList.add('dm');

  /* 背景图 */
  if (bg) {
    if (t.img) {
      bg.style.backgroundImage = `url(${t.img})`;
      bg.style.opacity = '1';
    } else {
      bg.style.backgroundImage = 'none';
      bg.style.opacity = '0';
    }
  }

  /* 纯白/纯黑时页面底色 */
  if (key === 'white') {
    document.body.style.background = '#f6f5f0';
  } else if (key === 'black') {
    document.body.style.background = '#080808';
  } else {
    document.body.style.background = '';
  }

  /* Canvas 动画 */
  if (cv) startAnim(t.anim, cv);

  /* 主题卡片激活状态 */
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('on', btn.dataset.t === key);
  });

  /* 持久化 */
  localStorage.setItem('fg_theme', key);
}

/* 挂到 window 供 HTML onclick 使用 */
window.setTheme = applyTheme;

/* ── 动态渲染主题卡片 ─────────────────────────────────── */
function renderThemeGrid() {
  const grid = document.getElementById('theme-grid');
  if (!grid) return;

  grid.innerHTML = '';
  Object.entries(THEMES).forEach(([key, t]) => {
    const btn = document.createElement('div');
    btn.className   = 'theme-btn tb';
    btn.dataset.t   = key;
    btn.innerHTML   = `<span class="em">${t.em}</span><span class="nm">${t.label}</span>`;
    btn.onclick     = () => applyTheme(key);
    grid.appendChild(btn);
  });
}

/* ── 账号系统（localStorage 模拟）────────────────────── */
function getUsers() {
  try { return JSON.parse(localStorage.getItem('fg_u') || '{}'); }
  catch { return {}; }
}
function saveUsers(u) { localStorage.setItem('fg_u', JSON.stringify(u)); }

window.doRegister = function() {
  const u = document.getElementById('ru')?.value.trim();
  const p = document.getElementById('rp')?.value;
  if (!u) { showMsg('请输入用户名'); return; }
  if (!p) { showMsg('请设置密码');   return; }
  const users = getUsers();
  if (users[u]) { showMsg('用户名已被使用'); return; }
  users[u] = p; saveUsers(users);
  localStorage.setItem('fg_user', u);
  showMsg('注册成功！欢迎 ' + u + ' 🎉', true);
  setTimeout(() => { closeModal?.(); location.reload(); }, 1400);
};

window.doLogin = function() {
  const u = document.getElementById('lu')?.value.trim();
  const p = document.getElementById('lp')?.value;
  if (!u || !p) { showMsg('请填写完整信息'); return; }
  const users = getUsers();
  if (!users[u] || users[u] !== p) { showMsg('用户名或密码错误'); return; }
  localStorage.setItem('fg_user', u);
  showMsg('欢迎回来，' + u + ' 👋', true);
  setTimeout(() => { closeModal?.(); location.reload(); }, 1400);
};

function showMsg(txt, ok) {
  const el = document.getElementById('mmsg');
  if (!el) return;
  el.textContent = txt;
  el.className   = 'mmsg ' + (ok ? 'ok' : 'err');
}

window.openModal  = function(tab) {
  const m = document.getElementById('modal');
  if (m) m.classList.add('open');
  window.swTab?.(tab);
};
window.closeModal = function() {
  const m = document.getElementById('modal');
  if (m) m.classList.remove('open');
  const el = document.getElementById('mmsg');
  if (el) { el.textContent = ''; el.className = 'mmsg'; }
};
window.swTab = function(tab) {
  const tl = document.getElementById('tl');
  const tr = document.getElementById('tr');
  const lf = document.getElementById('lf');
  const rf = document.getElementById('rf');
  const mt = document.getElementById('mtitle');
  if (tl) tl.classList.toggle('on', tab === 'login');
  if (tr) tr.classList.toggle('on', tab === 'register');
  if (lf) lf.style.display = tab === 'login'    ? 'block' : 'none';
  if (rf) rf.style.display = tab === 'register' ? 'block' : 'none';
  if (mt) mt.textContent   = tab === 'login'    ? '欢迎回来' : '创建账号';
};

/* ── 初始化 ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  /* 渲染主题卡片 */
  renderThemeGrid();

  /* 初始化按钮特效（需要在主题卡片渲染后执行） */
  initAllButtons();

  /* 读取保存的主题 */
  const saved = localStorage.getItem('fg_theme');
  applyTheme(saved && THEMES[saved] ? saved : 'ocean');
});
