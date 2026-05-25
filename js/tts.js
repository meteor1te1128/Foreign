// tts.js — 单词发音模块（Web Speech API）

let voices = [];
let ready  = false;

function loadVoices() {
  voices = speechSynthesis.getVoices();
  ready  = voices.length > 0;
}

loadVoices();
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * 朗读单词
 * @param {string} word
 * @param {number} rate - 语速，默认 0.85
 */
export function speak(word, rate = 0.85) {
  if (!word || typeof speechSynthesis === 'undefined') return;
  speechSynthesis.cancel();
  const utter  = new SpeechSynthesisUtterance(word);
  utter.lang   = 'en-US';
  utter.rate   = rate;
  utter.pitch  = 1;
  if (!ready) loadVoices();
  const enVoices = voices.filter(v => v.lang.startsWith('en'));
  if (enVoices.length > 0) {
    utter.voice = enVoices.find(v => v.lang === 'en-US') || enVoices[0];
  }
  speechSynthesis.speak(utter);
}

/**
 * 创建发音按钮
 * dm 参数决定初始样式，按钮样式通过 CSS class 控制，不绑定重复事件
 */
export function createSpeakBtn(word, opts = {}) {
  const { size = 28, dm = false } = opts;

  const btn = document.createElement('button');
  btn.type      = 'button';
  btn.title     = `朗读 ${word}`;
  btn.className = dm ? 'speak-btn speak-btn-dm' : 'speak-btn';
  btn.setAttribute('aria-label', `朗读 ${word}`);
  btn.style.cssText = `
    width:${size}px;height:${size}px;border-radius:50%;
    flex-shrink:0;display:inline-flex;align-items:center;
    justify-content:center;vertical-align:middle;
    padding:0;line-height:1;font-size:${Math.round(size*0.5)}px;
    cursor:pointer;transition:background .18s,border-color .18s,transform .12s;
  `;

  // 注入全局 CSS（只注入一次）
  if (!document.getElementById('speak-btn-style')) {
    const style = document.createElement('style');
    style.id = 'speak-btn-style';
    style.textContent = `
      .speak-btn {
        border:1px solid rgba(255,255,255,.18);
        background:rgba(255,255,255,.08);
        color:rgba(255,255,255,.65);
      }
      .speak-btn:hover {
        background:rgba(255,255,255,.2);
        border-color:rgba(255,255,255,.42);
      }
      .speak-btn:active { transform:scale(.88); }
      .speak-btn-dm {
        border:1px solid rgba(0,0,0,.13);
        background:rgba(0,0,0,.05);
        color:rgba(0,0,0,.42);
      }
      .speak-btn-dm:hover {
        background:rgba(0,0,0,.1);
        border-color:rgba(0,0,0,.24);
      }
    `;
    document.head.appendChild(style);
  }

  btn.textContent = '🔊';
  btn.addEventListener('click', e => {
    e.stopPropagation();
    speak(word);
  });

  return btn;
}

/**
 * 将按钮切换为 dm 样式（用于主题切换后更新）
 * 不再重复绑定事件，只切换 class
 */
export function applyDmStyle(btn) {
  btn.classList.remove('speak-btn');
  btn.classList.add('speak-btn-dm');
}
