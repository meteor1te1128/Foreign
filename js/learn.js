// learn.js — 每日学习页逻辑
// 改动：
// 1. 字段对齐新版 wordbank.js (dim/zh/example/exZh)
// 2. 填空页顶部「← 返回重选」，可撤回FSRS评分重选
// 3. 接入 study-log，学完记录日期和词数

import { WORDS, DIMENSIONS } from './wordbank.js';
import { getTodayPlan, getOrCreateCard, reviewCard, updateCard, RATING } from './fsrs.js';
import { getStreak, markTodayDone, playStreakAnim } from './streak.js';
import { recordStudyLog } from './study-log.js';

// ── 状态 ─────────────────────────────────────────────────────
let plan           = [];
let currentIdx     = 0;
let sessionResults = [];   // [{wordId, correct, rating, fillWrong}]
let currentWord    = null;
let lastRating     = null; // 记录本词FSRS评分，撤回时用

// ── DOM ──────────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = $('screen-' + name);
  if (el) el.classList.add('active');
}

// ── 主题 ─────────────────────────────────────────────────────
function initTheme() {
  const theme = localStorage.getItem('fg_theme') || 'ocean';
  document.body.className = `theme-${theme}`;
  const THEME_COLORS = {
    ocean:'#3b82f6',fog_forest:'#6ee7b7',galaxy:'#818cf8',rain:'#93c5fd',
    aurora:'#34d399',sakura:'#f9a8d4',sunset:'#fb923c',snow:'#bae6fd',
    forest_green:'#86efac',white:'#64748b',black:'#94a3b8',
  };
  const color = THEME_COLORS[theme] || '#3b82f6';
  document.documentElement.style.setProperty('--theme-color', color);
  return theme;
}

// ── 初始化 ───────────────────────────────────────────────────
async function init() {
  initTheme();
  showScreen('loading');
  await new Promise(r => setTimeout(r, 500));

  const allIds    = WORDS.map(w => w.id);
  const todayPlan = getTodayPlan(allIds);
  plan = todayPlan.all;

  const d = new Date();
  const dateStr = d.toLocaleDateString('zh-CN', { month:'long', day:'numeric', weekday:'long' });
  const dateEl = $('intro-date-str');
  if (dateEl) dateEl.textContent = dateStr.toUpperCase();

  $('intro-new-count').textContent    = todayPlan.newWords.length;
  $('intro-review-count').textContent = todayPlan.due.length;
  $('intro-total-count').textContent  = plan.length;

  const streak = getStreak();
  $('intro-streak-count').textContent = streak.count;

  showScreen('intro');
}

// ── Intro ─────────────────────────────────────────────────────
$('btn-start-learn')?.addEventListener('click', () => {
  if (plan.length === 0) { finishSession(); return; }
  currentIdx     = 0;
  sessionResults = [];
  showNextCard();
});

// ── 情景卡片 ──────────────────────────────────────────────────
function showNextCard() {
  if (currentIdx >= plan.length) { finishSession(); return; }
  const wordId = plan[currentIdx];
  currentWord  = WORDS.find(w => w.id === wordId);
  if (!currentWord) { currentIdx++; showNextCard(); return; }
  lastRating = null;
  renderCard(currentWord);
  showScreen('card');
}

function renderCard(word) {
  // 维度：新版字段是 word.dim
  const dimKey = word.dim || word.dimension;
  const dim    = DIMENSIONS[dimKey] || { icon:'✦', label: dimKey };
  const card   = getOrCreateCard(word.id);
  const pct    = Math.round((currentIdx / plan.length) * 100);

  $('card-progress-text').textContent = `${currentIdx + 1} / ${plan.length}`;
  $('card-progress-bar').style.width  = pct + '%';

  const badge = $('card-type-badge');
  badge.textContent  = card.state === 'new' ? '新词' : '复习';
  badge.dataset.type = card.state === 'new' ? 'new'  : 'review';

  $('card-dim-label').textContent   = dim.icon + ' ' + dim.label;
  $('card-level-label').textContent = word.level || '';
  $('card-word').textContent        = word.word;
  $('card-phonetic').textContent    = word.phonetic || '';

  // 新版字段：zh / example / exZh；兼容旧版 meaning / sentence / translation
  $('card-meaning').textContent = word.zh || word.meaning || '';

  const sentence = word.example || word.sentence || '';
  $('card-sentence').innerHTML = sentence.replace(
    word.word,
    `<span class="blank-word">${word.word}</span>`
  );

  const transEl = $('card-translation');
  transEl.textContent = word.exZh || word.translation || '';
  transEl.classList.add('hidden');

  $('card-reveal-btn').classList.remove('hidden');
  $('card-rating-area').classList.add('hidden');
}

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

    lastRating = rating;
    const correct = rating >= RATING.GOOD;

    // 先从 sessionResults 移除本词旧记录（如果是从填空页撤回重选的）
    const existIdx = sessionResults.findIndex(r => r.wordId === currentWord.id);
    if (existIdx >= 0) sessionResults.splice(existIdx, 1);

    sessionResults.push({ wordId: currentWord.id, correct, rating });

    if (!correct) markWrong(currentWord.id);

    showFill(currentWord);
  });
});

// ── 填空题 ────────────────────────────────────────────────────
function showFill(word) {
  const pct = Math.round((currentIdx / plan.length) * 100);
  $('fill-progress-text').textContent = `${currentIdx + 1} / ${plan.length}`;
  $('fill-progress-bar').style.width  = pct + '%';

  // 新版字段兼容
  $('fill-meaning').textContent = word.zh || word.meaning || '';
  $('fill-hint').textContent    = `提示：${word.zh || word.meaning || ''}`;

  const sentence = word.example || word.sentence || '';
  const sentEl   = $('fill-sentence');
  sentEl.innerHTML = '';

  // 把句子里的单词替换成输入框
  const wordLower = word.word.toLowerCase();
  const idx       = sentence.toLowerCase().indexOf(wordLower);
  if (idx >= 0) {
    sentEl.appendChild(document.createTextNode(sentence.slice(0, idx)));
  } else {
    // fallback：用 ___ 分割
    const parts = sentence.split('___');
    sentEl.appendChild(document.createTextNode(parts[0]));
  }

  const input = document.createElement('input');
  input.type        = 'text';
  input.className   = 'fill-input';
  input.id          = 'fill-input-field';
  input.placeholder = '输入答案…';
  input.autocomplete = 'off';
  input.autocorrect  = 'off';
  input.spellcheck   = false;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      if (!$('fill-confirm-btn').classList.contains('hidden')) {
        checkFill(word);
      } else {
        advanceFill();
      }
    }
  });
  sentEl.appendChild(input);

  if (idx >= 0 && idx + word.word.length < sentence.length) {
    sentEl.appendChild(document.createTextNode(sentence.slice(idx + word.word.length)));
  }

  $('fill-feedback').className = 'fill-feedback hidden';
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

  const answer = input.value.trim().toLowerCase();
  const target = word.word.toLowerCase();
  const correct = answer === target ||
    (answer.length >= 3 && target.startsWith(answer) && answer.length >= target.length - 3);

  const fb = $('fill-feedback');
  fb.classList.remove('hidden', 'correct', 'wrong');
  input.classList.remove('input-correct', 'input-wrong');

  if (correct) {
    fb.textContent = `✓ ${word.word} — ${word.zh || word.meaning || ''}`;
    fb.classList.add('correct');
    input.classList.add('input-correct');
  } else {
    fb.textContent = `✗ 答案是：${word.word}`;
    fb.classList.add('wrong');
    input.classList.add('input-wrong');
    markWrong(word.id);
    // 标记填空答错
    const r = sessionResults.find(r => r.wordId === word.id);
    if (r) r.fillWrong = true;
  }

  $('fill-confirm-btn').classList.add('hidden');
  $('fill-next-btn').classList.remove('hidden');
}

function advanceFill() {
  currentIdx++;
  showNextCard();
}

$('fill-next-btn')?.addEventListener('click', advanceFill);

// ── 返回重选（撤回FSRS评分）────────────────────────────────
$('btn-back-to-card')?.addEventListener('click', () => {
  if (!currentWord) return;

  // 撤销这个词的FSRS评分：用对立评分重新apply，最简单的方式是
  // 直接从sessionResults移除，下一轮不统计；卡片数据恢复用again
  // 实际上直接重新显示情景卡片让用户重选，重选时会覆盖updateCard
  const existIdx = sessionResults.findIndex(r => r.wordId === currentWord.id);
  if (existIdx >= 0) sessionResults.splice(existIdx, 1);

  // 如果之前把这个词加进了fg_wrong，也先撤回
  try {
    const wrong = JSON.parse(localStorage.getItem('fg_wrong') || '{}');
    if (wrong[currentWord.id] > 1) wrong[currentWord.id]--;
    else delete wrong[currentWord.id];
    localStorage.setItem('fg_wrong', JSON.stringify(wrong));
  } catch(e) {}

  // 重新展示情景卡片，让用户重新评分
  renderCard(currentWord);
  // 直接显示评分区（不需要再点「查看」）
  $('card-translation').classList.remove('hidden');
  $('card-reveal-btn').classList.add('hidden');
  $('card-rating-area').classList.remove('hidden');
  showScreen('card');
});

// ── 错题记录 ──────────────────────────────────────────────────
function markWrong(wordId) {
  try {
    const data = JSON.parse(localStorage.getItem('fg_wrong') || '{}');
    data[wordId] = (data[wordId] || 0) + 1;
    localStorage.setItem('fg_wrong', JSON.stringify(data));
  } catch(e) {}
}

// ── 结算 ──────────────────────────────────────────────────────
function finishSession() {
  const total   = sessionResults.length;
  const correct = sessionResults.filter(r => r.correct).length;
  const pct     = total ? Math.round((correct / total) * 100) : 100;
  const newStreak = markTodayDone();

  // 记录学习日志（热力图数据）
  try { recordStudyLog(total); } catch(e) {}

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
  // FSRS评分差 + 填空答错 的词都进再练队列
  const wrongIds = sessionResults
    .filter(r => !r.correct || r.fillWrong)
    .map(r => r.wordId);
  if (wrongIds.length === 0) { window.location.href = 'index.html'; return; }
  plan           = [...new Set(wrongIds)];
  currentIdx     = 0;
  sessionResults = [];
  showNextCard();
});

// ── 启动 ──────────────────────────────────────────────────────
init().catch(console.error);
