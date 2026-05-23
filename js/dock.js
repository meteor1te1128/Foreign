// dock.js — 子页面主题选择器独立模块
import { startAnim } from './animations.js';

const THEMES = {
  ocean:        { img:'assets/images/ocean.jpg',        anim:'ocean',  label:'深海',   color:'#3b82f6', rgb:'59,130,246'   },
  fog_forest:   { img:'assets/images/fog_forest.jpg',   anim:'mist',   label:'雾林',   color:'#6ee7b7', rgb:'110,231,183'  },
  galaxy:       { img:'assets/images/galaxy.jpg',       anim:'stars',  label:'星空',   color:'#818cf8', rgb:'129,140,248'  },
  rain:         { img:'assets/images/rain.jpg',         anim:'rain',   label:'雨天',   color:'#93c5fd', rgb:'147,197,253'  },
  aurora:       { img:'assets/images/aurora.jpg',       anim:'none',   label:'极光',   color:'#34d399', rgb:'52,211,153'   },
  sakura:       { img:'assets/images/sakura.jpg',       anim:'sakura', label:'樱花',   color:'#f9a8d4', rgb:'249,168,212'  },
  sunset:       { img:'assets/images/sunset.jpg',       anim:'clouds', label:'火烧云', color:'#fb923c', rgb:'251,146,60'   },
  snow:         { img:'assets/images/snow.jpg',         anim:'snow',   label:'雪山',   color:'#bae6fd', rgb:'186,230,253'  },
  forest_green: { img:'assets/images/forest_green.jpg', anim:'forest', label:'雨林',   color:'#86efac', rgb:'134,239,172'  },
  white:        { img:null, anim:'none', label:'纯白', color:'#e2e8f0', rgb:'226,232,240', dm:true  },
  black:        { img:null, anim:'none', label:'纯黑', color:'#334155', rgb:'51,65,85'              },
};

export function initDock(bgId='bg-image', cvId='bg-canvas') {
  const bg  = document.getElementById(bgId);
  const cv  = document.getElementById(cvId);
  let cur   = localStorage.getItem('fg_theme') || 'ocean';
  if (!THEMES[cur]) cur = 'ocean';

  function applyTheme(key) {
    if (!THEMES[key]) return;
    cur = key;
    const t = THEMES[key];
    document.body.classList.remove(...Object.keys(THEMES).map(k=>`theme-${k}`),'dm');
    document.body.classList.add(`theme-${key}`);
    if (t.dm) document.body.classList.add('dm');
    document.body.style.background = key==='white'?'#f6f5f0':key==='black'?'#080808':'';
    document.documentElement.style.setProperty('--theme-color', t.color);
    document.documentElement.style.setProperty('--theme-color-rgb', t.rgb);
    if (bg) {
      if (t.img) { bg.style.backgroundImage=`url(${t.img})`; bg.style.opacity='1'; }
      else       { bg.style.backgroundImage='none'; bg.style.opacity='0'; }
    }
    if (cv) startAnim(t.anim, cv);
    localStorage.setItem('fg_theme', key);
    updateTrigger();
    dock.querySelectorAll('.dock-card').forEach(c=>c.classList.toggle('active',c.dataset.t===key));
  }

  function previewTheme(key) {
    if (!THEMES[key]) return;
    const t = THEMES[key];
    if (bg) {
      if (t.img) { bg.style.backgroundImage=`url(${t.img})`; bg.style.opacity='1'; }
      else       { bg.style.backgroundImage='none'; bg.style.opacity='0'; }
    }
    document.body.style.background = !t.img ? (key==='white'?'#f6f5f0':'#080808') : '';
    if (cv) startAnim(t.anim, cv);
  }

  function restoreTheme() { applyTheme(cur); }

  // ── DOM ──
  const dock = document.createElement('div');
  dock.id = 'theme-dock';

  // 触发按钮：胶囊形
  const trigger = document.createElement('button');
  trigger.className = 'dock-trigger';
  trigger.setAttribute('aria-label','切换主题');
  trigger.style.position = 'relative';
  trigger.innerHTML = `
    <span class="dock-trigger-ring"></span>
    <span class="dock-trigger-dot"></span>
    <span class="dock-trigger-label">${THEMES[cur].label}</span>
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
  document.body.appendChild(dock);

  const grid = overlay.querySelector('#dockGrid');
  let hoverTimer = null, panelClosing = false, isOpen = false;

  Object.keys(THEMES).forEach(key => {
    const t = THEMES[key];
    const card = document.createElement('button');
    card.className = 'dock-card'; card.dataset.t = key;
    if (key === cur) card.classList.add('active');
    card.innerHTML = `
      <span class="dock-card-swatch" style="background:${t.color}">
        ${t.img?`<img src="${t.img}" alt="" aria-hidden="true" loading="lazy" draggable="false">`:''}
        <span class="dock-card-ring" style="border-color:${t.color}"></span>
      </span>
      <span class="dock-card-name">${t.label}</span>`;

    card.addEventListener('mouseenter', () => {
      card.classList.add('hovered');
      const lbl = overlay.querySelector('#dockCurrentLabel');
      if (lbl) lbl.textContent = t.label;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(()=>{ if(!panelClosing) previewTheme(key); }, 80);
    });
    card.addEventListener('mouseleave', () => {
      card.classList.remove('hovered');
      const lbl = overlay.querySelector('#dockCurrentLabel');
      if (lbl) lbl.textContent = '';
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(()=>{ if(!panelClosing) restoreTheme(); }, 120);
    });
    card.addEventListener('click', () => {
      clearTimeout(hoverTimer);
      const ripple = document.createElement('span');
      ripple.className='dock-select-ripple'; ripple.style.background=t.color;
      card.appendChild(ripple); setTimeout(()=>ripple.remove(), 500);
      applyTheme(key); closePanel();
    });
    grid.appendChild(card);
  });

  function openPanel() {
    isOpen=true; panelClosing=false;
    overlay.classList.add('open'); trigger.classList.add('open');
    grid.querySelectorAll('.dock-card').forEach((c,i)=>{
      c.classList.toggle('active',c.dataset.t===cur);
      c.style.transitionDelay=`${i*24}ms`; c.classList.add('visible');
    });
  }
  function closePanel() {
    isOpen=false; panelClosing=true; clearTimeout(hoverTimer);
    overlay.classList.remove('open'); trigger.classList.remove('open');
    grid.querySelectorAll('.dock-card').forEach(c=>{
      c.style.transitionDelay='0ms'; c.classList.remove('visible','hovered');
    });
    restoreTheme();
    setTimeout(()=>{ panelClosing=false; }, 400);
  }

  trigger.addEventListener('click', ()=>isOpen?closePanel():openPanel());
  overlay.querySelector('.dock-close').addEventListener('click', closePanel);
  overlay.addEventListener('click', e=>{ if(e.target===overlay) closePanel(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape'&&isOpen) closePanel(); });

  function updateTrigger() {
    const t = THEMES[cur];
    const dot   = trigger.querySelector('.dock-trigger-dot');
    const label = trigger.querySelector('.dock-trigger-label');
    if (dot)   dot.style.background = t.color;
    if (label) label.textContent    = t.label;
  }

  // 初始化
  const t = THEMES[cur];
  document.body.classList.remove(...Object.keys(THEMES).map(k=>`theme-${k}`),'dm');
  document.body.classList.add(`theme-${cur}`);
  if (t.dm) document.body.classList.add('dm');
  document.documentElement.style.setProperty('--theme-color', t.color);
  document.documentElement.style.setProperty('--theme-color-rgb', t.rgb);
  updateTrigger();
}
