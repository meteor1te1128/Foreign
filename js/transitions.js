// transitions.js — 页面切换动画

const STYLE = `
  @keyframes _pageIn  { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
  @keyframes _pageOut { from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-8px)} }
  body.page-entering { animation:_pageIn  .32s cubic-bezier(.4,0,.2,1) both; }
  body.page-leaving  { animation:_pageOut .22s cubic-bezier(.4,0,.2,1) both; pointer-events:none; }
`;

const styleEl = document.createElement('style');
styleEl.textContent = STYLE;
document.head.appendChild(styleEl);

// 入场动画
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('page-entering');
  setTimeout(() => document.body.classList.remove('page-entering'), 350);
});

/**
 * 带出场动画的页面跳转（供 JS 代码调用）
 * 替换 window.location.href = url
 */
export function navigate(url) {
  document.body.classList.add('page-leaving');
  setTimeout(() => { location.href = url; }, 200);
}

// 拦截 <a> 标签点击，加出场动画
document.addEventListener('click', e => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) return;
  if (link.target === '_blank') return;
  e.preventDefault();
  navigate(href);
});
