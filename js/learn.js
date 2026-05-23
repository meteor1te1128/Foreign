// learn.js — 每日学习页逻辑（简化版：直接显示翻译，两档评分）

import { WORDS, DIMENSIONS } from './wordbank.js';
import { getTodayPlan, getOrCreateCard, reviewCard, updateCard, RATING } from './fsrs.js';
import { getStreak, markTodayDone, playStreakAnim } from './streak.js';
import { recordStudyLog } from './study-log.js';
import { pushToCloud, getCurrentUser } from './auth.js';

// ── 状态 ─────────────────────────────────────────────────────
let plan           = [];
let currentIdx     = 0;
let sessionResults = [];
let currentWord    = null;

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

$('btn-start-learn')?.addEventListener('click', () => {
  if (plan.length === 0) { finishSession(); return; }
  currentIdx     = 0;
  sessionResults = [];
  showNextCard();
});

function showNextCard() {
  if (currentIdx >= plan.length) { finishSession(); return; }
  const wordId = plan[currentIdx];
  currentWord  = WORDS.find(w => w.id === wordId);
  if (!currentWord) { currentIdx++; showNextCard(); return; }
  renderCard(currentWord);
  showScreen('card');
}

function renderCard(word) {
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
  $('card-meaning').textContent     = word.zh || word.meaning || '';

  const sentence = word.example || word.sentence || '';
  $('card-sentence').innerHTML = sentence.replace(
    word.word,
    `<span class="blank-word">${word.word}</span>`
  );

  $('card-translation').textContent = word.exZh || word.translation || '';
}

document.querySelectorAll('[data-rating]').forEach(btn => {
  btn.addEventListener('click', () => {
    const rating  = parseInt(btn.dataset.rating);
    const card    = getOrCreateCard(currentWord.id);
    const updated = reviewCard(card, rating);
    updateCard(updated);

    const correct = rating >= RATING.GOOD;

    const existIdx = sessionResults.findIndex(r => r.wordId === currentWord.id);
    if (existIdx >= 0) sessionResults.splice(existIdx, 1);
    sessionResults.push({ wordId: currentWord.id, correct, rating });

    if (!correct) markWrong(currentWord.id);

    showFill(currentWord);
  });
});

function showFill(word) {
  const pct = Math.round((currentIdx / plan.length) * 100);
  $('fill-progress-text').textContent = `${currentIdx + 1} / ${plan.length}`;
  $('fill-progress-bar').style.width  = pct + '%';

  $('fill-meaning').textContent = word.zh || word.meaning || '';
  $('fill-hint').textContent    = `提示：${word.zh || word.meaning || ''}`;

  const sentence = word.example || word.sentence || '';
  const sentEl   = $('fill-sentence');
  sentEl.innerHTML = '';

  const wordLower = word.word.toLowerCase();
  const idx       = sentence.toLowerCase().indexOf(wordLower);
  if (idx >= 0) {
    sentEl.appendChild(document.createTextNode(sentence.slice(0, idx)));
  } else {
    const parts = sentence.split('___');
    sentEl.appendChild(document.createTextNode(parts[0]));
  }

  const input = document.createElement('input');
  input.type         = 'text';
  input.className    = 'fill-input';
  input.id           = 'fill-input-field';
  input.placeholder  = '输入答案…';
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

  const answer  = input.value.trim().toLowerCase();
  const target  = word.word.toLowerCase();
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

function markWrong(wordId) {
  try {
    const data = JSON.parse(localStorage.getItem('fg_wrong') || '{}');
    data[wordId] = (data[wordId] || 0) + 1;
    localStorage.setItem('fg_wrong', JSON.stringify(data));
  } catch(e) {}
}

async function finishSession() {
  const total     = sessionResults.length;
  const correct   = sessionResults.filter(r => r.correct).length;
  const pct       = total ? Math.round((correct / total) * 100) : 100;
  const newStreak = await markTodayDone();

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

  // 学完同步云端
  try {
    const user = await getCurrentUser();
    if (user) await pushToCloud();
  } catch(e) {}
}

$('btn-result-home')?.addEventListener('click', () => {
  window.location.href = 'index.html';
});

$('btn-result-again')?.addEventListener('click', () => {
  const wrongIds = sessionResults
    .filter(r => !r.correct || r.fillWrong)
    .map(r => r.wordId);
  if (wrongIds.length === 0) { window.location.href = 'index.html'; return; }
  plan           = [...new Set(wrongIds)];
  currentIdx     = 0;
  sessionResults = [];
  showNextCard();
});

init().catch(console.error);
