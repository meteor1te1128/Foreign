/* Foreign · main.js */
import { startAnim, stopAnim } from './animations.js';
import { initAllButtons } from './buttons.js';

const THEMES = {
  ocean:        { img: 'assets/images/ocean.jpg',        anim: 'ocean'  },
  fog_forest:   { img: 'assets/images/fog_forest.jpg',   anim: 'mist'   },
  galaxy:       { img: 'assets/images/galaxy.jpg',       anim: 'stars'  },
  rain:         { img: 'assets/images/rain.jpg',         anim: 'rain'   },
  aurora:       { img: 'assets/images/aurora.jpg',       anim: 'aurora' },
  sakura:       { img: 'assets/images/sakura.jpg',       anim: 'sakura' },
  sunset:       { img: 'assets/images/sunset.jpg',       anim: 'clouds' },
  snow:         { img: 'assets/images/snow.jpg',         anim: 'snow'   },
  forest_green: { img: 'assets/images/forest_green.jpg', anim: 'forest' },
  white:        { img: null, anim: 'none', dm: true  },
  black:        { img: null, anim: 'none', dm: false },
};

let cur = 'ocean';
const bg = document.getElementById('bg');
const cv = document.getElementById('cv');

function resize() { cv.width = window.innerWidth; cv.height = window.innerHeight; }
resize();
window.addEventListener('resize', () => { resize(); setTheme(cur); });

window.setTheme = function(key) {
  cur = key;
  document.querySelectorAll('.tb').forEach(b => b.classList.toggle('on', b.dataset.t === key));
  const t = THEMES[key];
  if (key === 'white') {
    bg.style.backgroundImage = 'none'; bg.className = 'white-bg';
    document.body.classList.add('dm');
  } else if (key === 'black') {
    bg.style.backgroundImage = 'none'; bg.className = 'black-bg';
    document.body.classList.remove('dm');
  } else {
    bg.className = '';
    bg.style.backgroundImage = `url(${t.img})`;
    document.body.classList.remove('dm');
  }
  stopAnim();
  if (t.anim !== 'none') startAnim(t.anim, cv);
  localStorage.setItem('fg_theme', key);
};

window.openModal = function(tab) {
  document.getElementById('modal').classList.add('open');
  swTab(tab);
};
window.closeModal = function() {
  document.getElementById('modal').classList.remove('open');
  const m = document.getElementById('mmsg');
  m.textContent = ''; m.className = 'mmsg';
};

function swTab(tab) {
  document.getElementById('tl').classList.toggle('on', tab === 'login');
  document.getElementById('tr').classList.toggle('on', tab === 'register');
  document.getElementById('lf').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('rf').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('mtitle').textContent = tab === 'login' ? '欢迎回来' : '创建账号';
  document.getElementById('mbox').className = 'md' + (cur === 'white' ? ' lt' : '');
}
window.swTab = swTab;

function getU() { try { return JSON.parse(localStorage.getItem('fg_u') || '{}'); } catch { return {}; } }
function saveU(u) { localStorage.setItem('fg_u', JSON.stringify(u)); }
function showMsg(txt, ok) {
  const el = document.getElementById('mmsg');
  el.textContent = txt; el.className = 'mmsg ' + (ok ? 'ok' : 'err');
}

window.doRegister = function() {
  const u = document.getElementById('ru').value.trim();
  const p = document.getElementById('rp').value;
  if (!u) { showMsg('请输入用户名'); return; }
  if (!p) { showMsg('请设置密码'); return; }
  const users = getU();
  if (users[u]) { showMsg('用户名已被使用'); return; }
  users[u] = p; saveU(users);
  showMsg('注册成功！欢迎 ' + u + ' 🎉', true);
  setTimeout(() => closeModal(), 1600);
};

window.doLogin = function() {
  const u = document.getElementById('lu').value.trim();
  const p = document.getElementById('lp').value;
  if (!u || !p) { showMsg('请填写完整信息'); return; }
  const users = getU();
  if (!users[u] || users[u] !== p) { showMsg('用户名或密码错误'); return; }
  showMsg('欢迎回来，' + u + ' 👋', true);
  setTimeout(() => closeModal(), 1600);
};

document.addEventListener('DOMContentLoaded', () => {
  initAllButtons();
  const saved = localStorage.getItem('fg_theme');
  setTheme(saved && THEMES[saved] ? saved : 'ocean');
});
