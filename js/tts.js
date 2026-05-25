// tts.js — 单词发音模块（Web Speech API）

let voices = [];
let ready  = false;

function loadVoices() {
  voices = speechSynthesis.getVoices();
  ready  = voices.length > 0;
}

// Chrome 需要监听 onvoiceschanged
loadVoices();
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * 朗读单词
 * @param {string} word - 要朗读的英文单词
 * @param {number} rate - 语速 0.1-2，默认 0.85（稍慢，便于学习）
 */
export function speak(word, rate = 0.85) {
  if (!word || typeof speechSynthesis === 'undefined') return;

  // 取消当前正在播放的
  speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(word);
  utter.lang  = 'en-US';
  utter.rate  = rate;
  utter.pitch = 1;

  // 优先选英语女声，没有则用任意英语声音
  if (!ready) loadVoices();
  const enVoices = voices.filter(v => v.lang.startsWith('en'));
  if (enVoices.length > 0) {
    // 优先 en-US，其次任意 en
    utter.voice = enVoices.find(v => v.lang === 'en-US') || enVoices[0];
  }

  speechSynthesis.speak(utter);
}

/**
 * 创建发音按钮元素
 * @param {string} word
 * @param {object} opts - { size, className }
 */
export function createSpeakBtn(word, opts = {}) {
  const { size = 28, className = '' } = opts;
  const btn = document.createElement('button');
  btn.type      = 'button';
  btn.title     = `朗读 ${word}`;
  btn.className = `speak-btn ${className}`.trim();
  btn.setAttribute('aria-label', `朗读 ${word}`);
  btn.style.cssText = `
    width:${size}px; height:${size}px;
    border-radius:50%;
    border:1px solid rgba(255,255,255,.18);
    background:rgba(255,255,255,.08);
    color:rgba(255,255,255,.65);
    font-size:${Math.round(size * 0.5)}px;
    cursor:pointer;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    flex-shrink:0;
    transition:all .18s;
    vertical-align:middle;
    padding:0;
    line-height:1;
  `;
  btn.textContent = '🔊';

  btn.addEventListener('mouseenter', () => {
    btn.style.background = 'rgba(255,255,255,.18)';
    btn.style.borderColor = 'rgba(255,255,255,.4)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background = 'rgba(255,255,255,.08)';
    btn.style.borderColor = 'rgba(255,255,255,.18)';
  });
  btn.addEventListener('click', e => {
    e.stopPropagation();
    speak(word);
    // 点击动画
    btn.style.transform = 'scale(.88)';
    setTimeout(() => { btn.style.transform = ''; }, 180);
  });

  return btn;
}

/**
 * dm 主题下按钮样式（深色文字背景）
 * 调用时机：body.classList.contains('dm') 为 true 时
 */
export function applyDmStyle(btn) {
  btn.style.borderColor = 'rgba(0,0,0,.15)';
  btn.style.background  = 'rgba(0,0,0,.05)';
  btn.style.color       = 'rgba(0,0,0,.45)';

  btn.addEventListener('mouseenter', () => {
    btn.style.background  = 'rgba(0,0,0,.1)';
    btn.style.borderColor = 'rgba(0,0,0,.25)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background  = 'rgba(0,0,0,.05)';
    btn.style.borderColor = 'rgba(0,0,0,.15)';
  });
}
