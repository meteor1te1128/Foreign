// learn.js — 每日学习页逻辑
import { WORDS, DIMENSIONS } from './wordbank.js';
import { getTodayPlan, getOrCreateCard, reviewCard, updateCard, RATING } from './fsrs.js';
import { getStreak, markTodayDone, playStreakAnim } from './streak.js';

// ── 状态 ────────────────────────────────────────────────────
let plan           = [];
let currentIdx     = 0;
let sessionResults = [];
let currentWord    = null;

// ── DOM ─────────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = $('screen-' + name);
  if (el) el.classList.add('active');
}

// ── 主题继承 ─────────────────────────────────────────────────
function initTheme() {
  const theme = localStorage.getItem('fg_theme') || 'ocean';
  document.body.className = `theme-${theme}`;
  return theme;
}

// ── 初始化 ──────────────────────────────────────────────────
async function init() {
  initTheme();
  showScreen('loading');
  await new Promise(r => setTimeout(r, 500));

  const allIds   = WORDS.map(w => w.id);
  const todayPlan = getTodayPlan(allIds);
  plan = todayPlan.all;

  // 日期显示
  const d = new Date();
  const dateStr = d.toLocaleDateString('zh-CN', { month:'long', day:'numeric', weekday:'long' });
  const dateEl = $('intro-date-str');
  if (dateEl) dateEl.textContent = dateStr.toUpperCase();

  // 统计
  $('intro-new-count').textContent    = todayPlan.newWords.length;
  $('intro-review-count').textContent = todayPlan.due.length;
  $('intro-total-count').textContent  = plan.length;

  const streak = getStreak();
  $('intro-streak-count').textContent = streak.count;

  showScreen('intro');
}

// ── Intro ────────────────────────────────────────────────────
$('btn-start-learn')?.addEventListener('click', () => {
  if (plan.length === 0) {
    finishSession();
    return;
  }
  currentIdx = 0;
  sessionResults = [];
  showNextCard();
});

// ── 情景卡片 ─────────────────────────────────────────────────
function showNextCard() {
  if (currentIdx >= plan.length) {
    finishSession();
    return;
  }
  const wordId = plan[currentIdx];
  currentWord  = WORDS.find(w => w.id === wordId);
  if (!currentWord) { currentIdx++; showNextCard(); return; }

  renderCard(currentWord);
  showScreen('card');
}

function renderCard(word) {
  const dim  = DIMENSIONS[word.dimension];
  const card = getOrCreateCard(word.id);
  const pct  = Math.round((currentIdx / plan.length) * 100);

  // 进度
  $('card-progress-text').textContent    = `${currentIdx + 1} / ${plan.length}`;
  $('card-progress-bar').style.width     = pct + '%';

  // 标签
  const badge = $('card-type-badge');
  badge.textContent  = card.state === 'new' ? '新词' : '复习';
  badge.dataset.type = card.state === 'new' ? 'new'  : 'review';
  $('card-dim-label').textContent   = dim.icon + ' ' + dim.label;
  $('card-level-label').textContent = word.level;

  // 内容
  $('card-word').textContent     = word.word;
  $('card-phonetic').textContent = word.phonetic;
  $('card-meaning').textContent  = word.meaning;

  // 例句：高亮单词
  $('card-sentence').innerHTML = word.sentence.replace(
    '___',
    `<span class="blank-word">${word.word}</span>`
  );
  const transEl = $('card-translation');
  transEl.textContent = word.translation;
  transEl.classList.add('hidden');

  // 按钮复位
  $('card-reveal-btn').classList.remove('hidden');
  $('card-rating-area').classList.add('hidden');
}

// 查看翻译
$('card-reveal-btn')?.addEventListener('click', () => {
  $('card-translation').classList.remove('hidden');
  $('card-reveal-btn').classList.add('hidden');
  $('card-rating-area').classList.remove('hidden');
});

// FSRS 评分
document.querySelectorAll('[data-rating]').forEach(btn => {
  btn.addEventListener('click', () => {
    const rating  = parseInt(btn.dataset.rating);
    const card    = getOrCreateCard(currentWord.id);
    const updated = reviewCard(card, rating);
    updateCard(updated);

    const correct = rating >= RATING.GOOD;
    sessionResults.push({ wordId: currentWord.id, correct, rating });

    if (!correct) markWrong(currentWord.id);

    // 进入填空
    showFill(currentWord);
  });
});

// ── 填空题 ───────────────────────────────────────────────────
function showFill(word) {
  const pct = Math.round((currentIdx / plan.length) * 100);
  $('fill-progress-text').textContent = `${currentIdx + 1} / ${plan.length}`;
  $('fill-progress-bar').style.width  = pct + '%';
  $('fill-meaning').textContent = word.meaning;
  $('fill-hint').textContent    = `提示：${word.hint}`;

  // 构建带 input 的句子
  const sentEl = $('fill-sentence');
  sentEl.innerHTML = '';
  const parts  = word.sentence.split('___');
  sentEl.appendChild(document.createTextNode(parts[0]));

  const input = document.createElement('input');
  input.type        = 'text';
  input.className   = 'fill-input';
  input.id          = 'fill-input-field';
  input.placeholder = word.hint;
  input.autocomplete = 'off';
  input.autocorrect  = 'off';
  input.spellcheck   = false;
  // Enter 键确认
  input.addEventListener('keydown', e => { if (e.key === 'Enter') checkFill(word); });
  sentEl.appendChild(input);

  if (parts[1]) sentEl.appendChild(document.createTextNode(parts[1]));

  // 反馈 + 按钮复位
  const fb = $('fill-feedback');
  fb.className = 'fill-feedback hidden';
  $('fill-next-btn').classList.add('hidden');
  $('fill-confirm-btn').classList.remove('hidden');

  showScreen('fill');
  setTimeout(() => input.focus(), 320);
}

$('fill-confirm-btn')?.addEventListener('click', () => {
  if (currentWord) checkFill(currentWord);
});

function checkFill(word) {
  const input = $('fill-input-field');
  if (!input) return;

  const answer  = input.value.trim().toLowerCase();
  const target  = word.word.toLowerCase();
  // 习语允许部分匹配（答案长度>=3且目标包含答案）
  const correct = answer === target ||
    (answer.length >= 3 && target.startsWith(answer) && answer.length >= target.length - 3);

  const fb = $('fill-feedback');
  fb.classList.remove('hidden', 'correct', 'wrong');
  input.classList.remove('input-correct', 'input-wrong');

  if (correct) {
    fb.textContent = `✓ 正确！${word.word} — ${word.meaning}`;
    fb.classList.add('correct');
    input.classList.add('input-correct');
  } else {
    fb.textContent = `✗ 答案是：${word.word}`;
    fb.classList.add('wrong');
    input.classList.add('input-wrong');
    // 填空答错也记录
    if (!sessionResults.find(r => r.wordId === word.id && r.fillWrong)) {
      markWrong(word.id);
    }
  }

  $('fill-confirm-btn').classList.add('hidden');
  $('fill-next-btn').classList.remove('hidden');
}

$('fill-next-btn')?.addEventListener('click', () => {
  currentIdx++;
  showNextCard();
});

// ── 错题记录 ─────────────────────────────────────────────────
function markWrong(wordId) {
  try {
    const data = JSON.parse(localStorage.getItem('fg_wrong') || '{}');
    data[wordId] = (data[wordId] || 0) + 1;
    localStorage.setItem('fg_wrong', JSON.stringify(data));
  } catch(e) {}
}

// ── 结算 ─────────────────────────────────────────────────────
function finishSession() {
  const total   = sessionResults.length;
  const correct = sessionResults.filter(r => r.correct).length;
  const pct     = total ? Math.round((correct / total) * 100) : 100;
  const newStreak = markTodayDone();

  $('result-correct').textContent = correct;
  $('result-total').textContent   = total;
  $('result-pct').textContent     = pct + '%';
  $('result-streak').textContent  = newStreak;
  $('result-msg').textContent     =
    pct >= 90 ? '太厉害了！🎉' :
    pct >= 70 ? '掌握得不错 👍' :
    pct >= 50 ? '继续加油 💪'  : '明天继续努力 🌱';

  showScreen('result');
  setTimeout(() => { $('result-bar').style.width = pct + '%'; }, 200);

  // 连击动画
  if (newStreak >= 1) {
    const canvas = $('bg-canvas');
    const theme  = localStorage.getItem('fg_theme') || 'ocean';
    if (canvas) setTimeout(() => playStreakAnim(canvas, theme, newStreak), 600);
  }
}

$('btn-result-home')?.addEventListener('click', () => {
  window.location.href = 'index.html';
});

$('btn-result-again')?.addEventListener('click', () => {
  // 只练本次答错的词
  const wrongIds = sessionResults.filter(r => !r.correct).map(r => r.wordId);
  if (wrongIds.length === 0) {
    window.location.href = 'index.html';
    return;
  }
  plan       = wrongIds;
  currentIdx = 0;
  sessionResults = [];
  showNextCard();
});

// ── 启动 ─────────────────────────────────────────────────────
init().catch(console.error);
