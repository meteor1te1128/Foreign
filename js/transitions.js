// transitions.js — 页面淡入淡出切换动画
// 在每个页面引入：import './transitions.js';

const STYLE = `
  @keyframes _pageIn  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes _pageOut { from { opacity:1; transform:translateY(0); }   to { opacity:0; transform:translateY(-8px); } }
  body.page-entering { animation: _pageIn  .32s cubic-bezier(.4,0,.2,1) both; }
  body.page-leaving  { animation: _pageOut .22s cubic-bezier(.4,0,.2,1) both; pointer-events:none; }
`;

// 注入样式
const styleEl = document.createElement('style');
styleEl.textContent = STYLE;
document.head.appendChild(styleEl);

// 页面加载时执行入场动画
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('page-entering');
  setTimeout(() => document.body.classList.remove('page-entering'), 350);
});

// 拦截所有站内链接，加出场动画再跳转
document.addEventListener('click', e => {
  const link = e.target.closest('a[href]');
  if (!link) return;

  const href = link.getAttribute('href');
  // 只处理站内相对链接，跳过锚点、新标签、外链
  if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) return;
  if (link.target === '_blank') return;

  e.preventDefault();
  document.body.classList.add('page-leaving');
  setTimeout(() => { location.href = href; }, 200);
});
