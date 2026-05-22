// fsrs.js — FSRS-5 简化实现
// 基于 SuperMemo SM-2 改进版，适合词汇学习

// FSRS 评分：1=又忘了 2=勉强记住 3=记住了 4=轻松记住
export const RATING = { AGAIN:1, HARD:2, GOOD:3, EASY:4 };

// 默认参数（FSRS-5 标准参数）
const W = [
  0.4072, 1.1829, 3.1262, 15.4722,
  7.2102, 0.5316, 1.0651, 0.0589,
  1.5330, 0.1544, 0.9369, 1.9813,
  0.0953, 0.2975, 2.2042, 0.2407,
  2.9466, 0.5034, 0.6567
];

const DECAY    = -0.5;
const FACTOR   = Math.pow(0.9, 1 / DECAY) - 1; // ≈0.0625 * something

// 初始稳定度
function initStability(r) {
  return W[r - 1];
}

// 初始难度
function initDifficulty(r) {
  return W[4] - Math.exp(W[5] * (r - 1)) + 1;
}

function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

// 可提取性（当前记忆保留率）
export function retrievability(stability, daysSince) {
  return Math.pow(1 + FACTOR * daysSince / stability, DECAY);
}

// 下次复习间隔（天）
function nextInterval(stability, desiredR = 0.9) {
  return Math.round(stability / FACTOR * (Math.pow(desiredR, 1 / DECAY) - 1));
}

// 复习后新稳定度
function reviewStability(d, s, r, rating) {
  const hardPenalty = rating === RATING.HARD ? W[15] : 1;
  const easyBonus   = rating === RATING.EASY ? W[16] : 1;
  return s * (
    Math.exp(W[8]) *
    (11 - d) *
    Math.pow(s, -W[9]) *
    (Math.exp((1 - r) * W[10]) - 1) *
    hardPenalty * easyBonus + 1
  );
}

// 复习后新难度
function reviewDifficulty(d, rating) {
  const delta = W[6] * (rating - 3);
  const newD  = d - delta;
  // 均值回归
  const mean  = W[4] - Math.exp(W[5] * 0) + 1;
  return clamp(newD + W[7] * (mean - newD), 1, 10);
}

// ── 主入口 ──────────────────────────────────────────────────

/**
 * 创建新卡片
 */
export function newCard(wordId) {
  return {
    wordId,
    state:     'new',   // new | learning | review | relearn
    stability: 0,
    difficulty: 0,
    dueDate:   Date.now(),
    lastReview: null,
    reps:      0,
    lapses:    0,
  };
}

/**
 * 评分并返回更新后的卡片
 * @param {object} card
 * @param {number} rating  RATING.AGAIN ~ RATING.EASY
 * @returns {object} updatedCard
 */
export function reviewCard(card, rating) {
  const now  = Date.now();
  const daysSince = card.lastReview
    ? (now - card.lastReview) / 86400000
    : 0;

  let { stability, difficulty, reps, lapses, state } = card;

  if (state === 'new') {
    stability  = initStability(rating);
    difficulty = initDifficulty(rating);
    state      = rating === RATING.AGAIN ? 'learning' : 'review';
  } else {
    const r = retrievability(stability, daysSince);
    if (rating === RATING.AGAIN) {
      lapses++;
      stability  = W[17] * Math.pow(stability, -W[18]) * Math.exp((1 - r) * W[10]);
      difficulty = reviewDifficulty(difficulty, rating);
      state      = 'relearn';
    } else {
      stability  = reviewStability(difficulty, stability, r, rating);
      difficulty = reviewDifficulty(difficulty, rating);
      state      = 'review';
    }
  }

  stability  = clamp(stability, 0.1, 36500);
  difficulty = clamp(difficulty, 1, 10);
  reps++;

  // 下次到期时间
  let intervalDays;
  if (state === 'learning' || state === 'relearn') {
    intervalDays = rating === RATING.AGAIN ? 0 : 1;
  } else {
    intervalDays = nextInterval(stability);
    // 评分调整
    if (rating === RATING.HARD)  intervalDays = Math.round(intervalDays * 1.2);
    if (rating === RATING.EASY)  intervalDays = Math.round(intervalDays * 1.3);
    intervalDays = Math.max(intervalDays, 1);
  }

  const dueDate = now + intervalDays * 86400000;

  return { ...card, stability, difficulty, dueDate, lastReview: now, reps, lapses, state };
}

// ── localStorage 持久化 ──────────────────────────────────────

const KEY = 'fg_cards';

export function loadCards() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}

export function saveCards(cards) {
  localStorage.setItem(KEY, JSON.stringify(cards));
}

export function getOrCreateCard(wordId) {
  const cards = loadCards();
  if (!cards[wordId]) cards[wordId] = newCard(wordId);
  return cards[wordId];
}

export function updateCard(card) {
  const cards = loadCards();
  cards[card.wordId] = card;
  saveCards(cards);
}

/**
 * 获取今天到期需复习的词 ID 列表
 */
export function getDueCards(allWordIds) {
  const cards = loadCards();
  const now   = Date.now();
  return allWordIds.filter(id => {
    const c = cards[id];
    return c && c.state !== 'new' && c.dueDate <= now;
  });
}

/**
 * 获取今天的新词（未学过），限制数量
 */
export function getNewCards(allWordIds, limit = 10) {
  const cards = loadCards();
  return allWordIds
    .filter(id => !cards[id] || cards[id].state === 'new')
    .slice(0, limit);
}

/**
 * 今日学习计划：最多10新词 + 所有到期复习词
 */
export function getTodayPlan(allWordIds) {
  const due  = getDueCards(allWordIds);
  const newW = getNewCards(allWordIds, 10);
  // 去重，复习词优先
  const combined = [...new Set([...due, ...newW])];
  return { due, newWords: newW, all: combined };
}
