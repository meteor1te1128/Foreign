// learn.js — 每日学习页逻辑
import { WORDS, DIMENSIONS } from './wordbank.js';
import { getTodayPlan, getOrCreateCard, reviewCard, updateCard, RATING } from './fsrs.js';
import { getStreak, markTodayDone, playStreakAnim } from './streak.js';

// ── 状态 ────────────────────────────────────────────────────
let plan        = [];   // 今日词汇ID列表
let currentIdx  = 0;
let phase       = 'card'; // card | fill
let sessionResults = []; // { wordId, correct }
let currentWord = null;
let showingAnswer = false;

// ── DOM refs ─────────────────────────────────────────────────
const screens = {
  loading:  document.getElementById('screen-loading'),
  intro:    document.getElementById('screen-intro'),
  card:     document.getElementById('screen-card'),
  fill:     document.getElementById('screen-fill'),
  result:   document.getElementById('screen-result'),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s && s.classList.remove('active'));
  if (screens[name]) screens[name].classList.add('active');
}

// ── 主题继承 ─────────────────────────────────────────────────
function initTheme() {
  const theme = localStorage.getItem('fg_theme') || 'ocean';
  document.body.className = `theme-${theme}`;
  return theme;
}

// ── 初始化 ──────────────────────────────────────────────────
async function init() {
  const theme = initTheme();
  showScreen('loading');

  // 模拟加载（背景图加载时间）
  await new Promise(r => setTimeout(r, 600));

  const allIds = WORDS.map(w => w.id);
  const todayPlan = getTodayPlan(allIds);
  plan = todayPlan.all;

  updateIntroStats(todayPlan);
  showScreen('intro');
}

// ── Intro 屏 ─────────────────────────────────────────────────
function updateIntroStats({ due, newWords }) {
  const streak = getStreak();

  const el = id => document.getElementById(id);
  el('intro-new-count').textContent    = newWords.length;
  el('intro-review-count').textContent = due.length;
  el('intro-streak-count').textContent = streak.count;
  el('intro-total-count').textContent  = plan.length;

  // 是否今天已完成
  const doneEl = document.getElementById('intro-done-badge');
  if (streak.lastDay === new Date().toISOString().slice(0,10)) {
    doneEl && doneEl.classList.remove('hidden');
  }
}

document.getElementById('btn-start-learn')?.addEventListener('click', () => {
  if (plan.length === 0) {
    showScreen('result');
    renderResult();
    return;
  }
  currentIdx = 0;
  sessionResults = [];
  showNextCard();
});

// ── 情景卡片 (phase: card) ───────────────────────────────────
function showNextCard() {
  if (currentIdx >= plan.length) {
    finishSession();
    return;
  }

  const wordId = plan[currentIdx];
  currentWord  = WORDS.find(w => w.id === wordId);
  if (!currentWord) { currentIdx++; showNextCard(); return; }

  const card = getOrCreateCard(wordId);
  phase = 'card';
  showingAnswer = false;
  renderCard(currentWord, card);
  showScreen('card');
}

function renderCard(word, card) {
  const dim = DIMENSIONS[word.dimension];

  // 进度
  document.getElementById('card-progress-text').textContent =
    `${currentIdx + 1} / ${plan.length}`;
  document.getElementById('card-progress-bar').style.width =
    `${((currentIdx) / plan.length) * 100}%`;

  // 标签
  document.getElementById('card-dim-label').textContent  = dim.icon + ' ' + dim.label;
  document.getElementById('card-level-label').textContent = word.level;

  // 单词主体
  document.getElementById('card-word').textContent     = word.word;
  document.getElementById('card-phonetic').textContent = word.phonetic;
  document.getElementById('card-meaning').textContent  = word.meaning;

  // 例句（先隐藏翻译）
  const sentEl = document.getElementById('card-sentence');
  sentEl.innerHTML = word.sentence.replace('___',
    `<span class="blank-word">${word.word}</span>`
  );
  document.getElementById('card-translation').textContent = word.translation;
  document.getElementById('card-translation').classList.add('hidden');

  // 按钮区
  document.getElementById('card-reveal-btn').classList.remove('hidden');
  document.getElementById('card-rating-area').classList.add('hidden');

  // FSRS 状态标记
  const isNew = card.state === 'new';
  document.getElementById('card-type-badge').textContent = isNew ? '新词' : '复习';
  document.getElementById('card-type-badge').dataset.type = isNew ? 'new' : 'review';
}

// 翻转显示翻译
document.getElementById('card-reveal-btn')?.addEventListener('click', () => {
  document.getElementById('card-translation').classList.remove('hidden');
  document.getElementById('card-reveal-btn').classList.add('hidden');
  document.getElementById('card-rating-area').classList.remove('hidden');
  showingAnswer = true;
});

// FSRS 评分按钮
document.querySelectorAll('[data-rating]').forEach(btn => {
  btn.addEventListener('click', () => {
    const rating = parseInt(btn.dataset.rating);
    const card   = getOrCreateCard(currentWord.id);
    const updated = reviewCard(card, rating);
    updateCard(updated);

    // 记录结果
    const correct = rating >= RATING.GOOD;
    sessionResults.push({ wordId: currentWord.id, correct, rating });

    // 答错了存回炉本
    if (!correct) {
      markWrong(currentWord.id);
    }

    // 下一阶段：进填空
    phase = 'fill';
    showFill(currentWord);
  });
});

// ── 填空题 (phase: fill) ─────────────────────────────────────
function showFill(word) {
  // 构建带空格的句子
  const parts = word.sentence.split('___');
  const sentenceEl = document.getElementById('fill-sentence');
  sentenceEl.innerHTML = '';

  const before = document.createTextNode(parts[0]);
  sentenceEl.appendChild(before);

  const input = document.createElement('input');
  input.type  = 'text';
  input.className = 'fill-input';
  input.id    = 'fill-input';
  input.placeholder = word.hint;
  input.autocomplete = 'off';
  input.autocorrect  = 'off';
  input.spellcheck   = false;
  sentenceEl.appendChild(input);

  if (parts[1]) {
    sentenceEl.appendChild(document.createTextNode(parts[1]));
  }

  // 提示
  document.getElementById('fill-hint').textContent     = `提示：${word.hint}`;
  document.getElementById('fill-meaning').textContent  = word.meaning;
  document.getElementById('fill-word-label').textContent = word.word;
  document.getElementById('fill-feedback').className   = 'fill-feedback hidden';
  document.getElementById('fill-next-btn').classList.add('hidden');
  document.getElementById('fill-confirm-btn').classList.remove('hidden');

  showScreen('fill');
  setTimeout(() => input.focus(), 300);
}

document.getElementById('fill-confirm-btn')?.addEventListener('click', checkFill);
document.getElementById('fill-input')?.addEventListener?.('keydown', (e) => {
  if (e.key === 'Enter') checkFill();
});

// 动态绑定（因为input是动态创建的）
document.getElementById('fill-sentence')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkFill();
});

function checkFill() {
  const input   = document.getElementById('fill-input');
  if (!input) return;
  const answer  = input.value.trim().toLowerCase();
  const correct = answer === currentWord.word.toLowerCase() ||
                  currentWord.word.toLowerCase().includes(answer) && answer.length >= 3;

  const fb = document.getElementById('fill-feedback');
  fb.classList.remove('hidden', 'correct', 'wrong');

  if (correct) {
    fb.textContent = `✓ 正确！${currentWord.word} — ${currentWord.meaning}`;
    fb.classList.add('correct');
    input.classList.add('input-correct');
  } else {
    fb.textContent = `答案是：${currentWord.word}`;
    fb.classList.add('wrong');
    input.classList.add('input-wrong');
  }

  document.getElementById('fill-confirm-btn').classList.add('hidden');
  document.getElementById('fill-next-btn').classList.remove('hidden');
}

document.getElementById('fill-next-btn')?.addEventListener('click', () => {
  currentIdx++;
  showNextCard();
});

// ── 错题记录 ─────────────────────────────────────────────────
function markWrong(wordId) {
  const data = JSON.parse(localStorage.getItem('fg_wrong') || '{}');
  data[wordId] = (data[wordId] || 0) + 1;
  localStorage.setItem('fg_wrong', JSON.stringify(data));
}

// ── 完成结算 ─────────────────────────────────────────────────
function finishSession() {
  const newStreak = markTodayDone();
  renderResult(newStreak);
  showScreen('result');

  // 播放连击动画
  const canvas = document.getElementById('bg-canvas');
  const theme  = (localStorage.getItem('fg_theme') || 'ocean');
  if (canvas && newStreak > 1) {
    setTimeout(() => {
      // 动态import streak anim
      import('./streak.js').then(m => m.playStreakAnim(canvas, theme, newStreak));
    }, 600);
  }
}

function renderResult(streakCount) {
  const total   = sessionResults.length;
  const correct = sessionResults.filter(r => r.correct).length;
  const pct     = total ? Math.round((correct / total) * 100) : 0;
  const streak  = streakCount || getStreak().count;

  document.getElementById('result-correct').textContent = correct;
  document.getElementById('result-total').textContent   = total;
  document.getElementById('result-pct').textContent     = pct + '%';
  document.getElementById('result-streak').textContent  = streak;

  // 评语
  const msg = pct >= 90 ? '太厉害了！🎉' :
              pct >= 70 ? '掌握得不错 👍' :
              pct >= 50 ? '继续加油 💪' : '明天继续努力 🌱';
  document.getElementById('result-msg').textContent = msg;

  // 进度条动画
  setTimeout(() => {
    document.getElementById('result-bar').style.width = pct + '%';
  }, 300);
}

document.getElementById('btn-result-home')?.addEventListener('click', () => {
  window.location.href = 'index.html';
});

document.getElementById('btn-result-again')?.addEventListener('click', () => {
  currentIdx = 0;
  sessionResults = [];
  // 只复习答错的
  const wrong = sessionResults.filter(r => !r.correct).map(r => r.wordId);
  if (wrong.length > 0) plan = wrong;
  showNextCard();
});

// ── 启动 ─────────────────────────────────────────────────────
init();
