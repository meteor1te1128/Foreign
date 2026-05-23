// fsrs.js — FSRS-5 简化实现（含卡片缓存）

export const RATING = { AGAIN:1, HARD:2, GOOD:3, EASY:4 };

const W = [
  0.4072, 1.1829, 3.1262, 15.4722,
  7.2102, 0.5316, 1.0651, 0.0589,
  1.5330, 0.1544, 0.9369, 1.9813,
  0.0953, 0.2975, 2.2042, 0.2407,
  2.9466, 0.5034, 0.6567
];

const DECAY  = -0.5;
const FACTOR = Math.pow(0.9, 1 / DECAY) - 1;

function initStability(r)  { return W[r - 1]; }
function initDifficulty(r) { return W[4] - Math.exp(W[5] * (r - 1)) + 1; }
function clamp(v, lo, hi)  { return Math.min(Math.max(v, lo), hi); }

export function retrievability(stability, daysSince) {
  return Math.pow(1 + FACTOR * daysSince / stability, DECAY);
}

function nextInterval(stability, desiredR = 0.9) {
  return Math.round(stability / FACTOR * (Math.pow(desiredR, 1 / DECAY) - 1));
}

function reviewStability(d, s, r, rating) {
  const hardPenalty = rating === RATING.HARD ? W[15] : 1;
  const easyBonus   = rating === RATING.EASY ? W[16] : 1;
  return s * (Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp((1 - r) * W[10]) - 1) * hardPenalty * easyBonus + 1);
}

function reviewDifficulty(d, rating) {
  const delta = W[6] * (rating - 3);
  const newD  = d - delta;
  const mean  = W[4] - Math.exp(W[5] * 0) + 1;
  return clamp(newD + W[7] * (mean - newD), 1, 10);
}

export function newCard(wordId) {
  return { wordId, state:'new', stability:0, difficulty:0, dueDate:Date.now(), lastReview:null, reps:0, lapses:0 };
}

export function reviewCard(card, rating) {
  const now = Date.now();
  const daysSince = card.lastReview ? (now - card.lastReview) / 86400000 : 0;
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

  let intervalDays;
  if (state === 'learning' || state === 'relearn') {
    intervalDays = rating === RATING.AGAIN ? 0 : 1;
  } else {
    intervalDays = nextInterval(stability);
    if (rating === RATING.HARD) intervalDays = Math.round(intervalDays * 1.2);
    if (rating === RATING.EASY) intervalDays = Math.round(intervalDays * 1.3);
    intervalDays = Math.max(intervalDays, 1);
  }

  return { ...card, stability, difficulty, dueDate: now + intervalDays * 86400000, lastReview: now, reps, lapses, state };
}

// ── localStorage + 内存缓存 ──────────────────────────────────

const KEY = 'fg_cards';
let _cache = null; // 内存缓存

export function loadCards() {
  if (_cache) return _cache;
  try { _cache = JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { _cache = {}; }
  return _cache;
}

export function saveCards(cards) {
  _cache = cards;
  localStorage.setItem(KEY, JSON.stringify(cards));
}

export function invalidateCache() {
  _cache = null;
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

export function getDueCards(allWordIds) {
  const cards = loadCards();
  const now   = Date.now();
  return allWordIds.filter(id => {
    const c = cards[id];
    return c && c.state !== 'new' && c.dueDate <= now;
  });
}

export function getNewCards(allWordIds, limit = 10) {
  const cards = loadCards();
  return allWordIds.filter(id => !cards[id] || cards[id].state === 'new').slice(0, limit);
}

export function getTodayPlan(allWordIds) {
  const due  = getDueCards(allWordIds);
  const newW = getNewCards(allWordIds, 10);
  const combined = [...new Set([...due, ...newW])];
  return { due, newWords: newW, all: combined };
}
