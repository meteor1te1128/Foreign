// ============================================================
//  quiz.js — 词汇水平测试页
//  Foreign · 复用 animations.js 的 startAnim/stopAnim
//  localStorage key: fg_theme（与 main.js 保持一致）
// ============================================================

import { startAnim, stopAnim } from './animations.js';
import { initAllButtons } from './buttons.js';

// ──────────────────────────────────────────────────────────
// THEME — 完全复用主页逻辑
// ──────────────────────────────────────────────────────────
const THEMES = {
  ocean:        { img: 'assets/images/ocean.jpg',        anim: 'ocean'  },
  fog_forest:   { img: 'assets/images/fog_forest.jpg',   anim: 'mist'   },
  galaxy:       { img: 'assets/images/galaxy.jpg',       anim: 'stars'  },
  rain:         { img: 'assets/images/rain.jpg',         anim: 'rain'   },
  aurora:       { img: 'assets/images/aurora.jpg',       anim: 'aurora' },
  sakura:       { img: 'assets/images/sakura.jpg',       anim: 'sakura' },
  sunset:       { img: 'assets/images/sunset.jpg',       anim: 'clouds' },
  snow:         { img: 'assets/images/snow.jpg',         anim: 'snow'   },
  forest_green: { img: 'assets/images/forest_green.jpg', anim: 'forest' },
  white:        { img: null, anim: 'none', dm: true  },
  black:        { img: null, anim: 'none', dm: false },
};

const bg = document.getElementById('bg');
const cv = document.getElementById('cv');

function resize() { cv.width = window.innerWidth; cv.height = window.innerHeight; }
resize();
window.addEventListener('resize', () => { resize(); applyTheme(); });

function applyTheme() {
  const key = localStorage.getItem('fg_theme') || 'ocean';
  const t = THEMES[key] || THEMES.ocean;

  if (key === 'white') {
    bg.style.backgroundImage = 'none';
    bg.className = 'white-bg';
    document.body.classList.add('dm');
  } else if (key === 'black') {
    bg.style.backgroundImage = 'none';
    bg.className = 'black-bg';
    document.body.classList.remove('dm');
  } else {
    bg.className = '';
    bg.style.backgroundImage = `url(${t.img})`;
    document.body.classList.remove('dm');
  }

  stopAnim();
  if (t.anim !== 'none') startAnim(t.anim, cv);
}

// ──────────────────────────────────────────────────────────
// QUESTION BANK
// 20道填空题，六维度 × 五难度
// ──────────────────────────────────────────────────────────
const QUESTIONS = [
  // ── Level 1 · 基础 ──
  {
    id: 1, category: '日常词汇', dimension: 'daily', difficulty: 1,
    sentence: 'She ___ her coffee every morning before work.',
    translation: '她每天上班前都喝咖啡。',
    answer: 'drinks', alternatives: [],
    hint: '动词，喝（第三人称单数现在时）',
  },
  {
    id: 2, category: '日常词汇', dimension: 'daily', difficulty: 1,
    sentence: 'The weather is ___ today. We should bring an umbrella.',
    translation: '今天天气很糟糕，我们应该带伞。',
    answer: 'terrible', alternatives: ['awful', 'horrible', 'bad'],
    hint: '形容词，表示非常糟糕',
  },
  {
    id: 3, category: '口语表达', dimension: 'spoken', difficulty: 1,
    sentence: "I'm ___ tired. I really need a break.",
    translation: '我真的太累了，需要休息一下。',
    answer: 'so', alternatives: ['really', 'very', 'quite', 'extremely'],
    hint: '副词，表示程度（最口语的一个）',
  },
  // ── Level 2 · 初中级 ──
  {
    id: 4, category: '职场词汇', dimension: 'professional', difficulty: 2,
    sentence: 'We need to ___ this project before the deadline.',
    translation: '我们需要在截止日期前完成这个项目。',
    answer: 'complete', alternatives: ['finish', 'accomplish', 'deliver'],
    hint: '动词，完成',
  },
  {
    id: 5, category: '日常词汇', dimension: 'daily', difficulty: 2,
    sentence: 'He was ___ when he heard the good news.',
    translation: '他听到这个好消息时非常兴奋。',
    answer: 'excited', alternatives: ['thrilled', 'delighted'],
    hint: '形容词，形容人的兴奋感',
  },
  {
    id: 6, category: '学术词汇', dimension: 'academic', difficulty: 2,
    sentence: 'The scientist conducted a ___ to test her hypothesis.',
    translation: '科学家进行了一个实验来验证假设。',
    answer: 'experiment', alternatives: ['study', 'test'],
    hint: '名词，实验',
  },
  {
    id: 7, category: '口语表达', dimension: 'spoken', difficulty: 2,
    sentence: "Can you ___ me a favor? I need help moving this weekend.",
    translation: '你能帮我一个忙吗？这周末我需要人帮搬东西。',
    answer: 'do', alternatives: [],
    hint: '固定搭配：do someone a favor',
  },
  // ── Level 3 · 中级 ──
  {
    id: 8, category: '职场词汇', dimension: 'professional', difficulty: 3,
    sentence: "The company's revenue has ___ significantly over the past year.",
    translation: '公司过去一年的营收大幅增长。',
    answer: 'increased', alternatives: ['grown', 'risen', 'surged'],
    hint: '动词（完成时），增长',
  },
  {
    id: 9, category: '学术词汇', dimension: 'academic', difficulty: 3,
    sentence: 'Her research ___ new light on the origins of language.',
    translation: '她的研究对语言起源提供了新的见解。',
    answer: 'shed', alternatives: [],
    hint: '固定搭配：shed light on，阐明、揭示',
  },
  {
    id: 10, category: '文学词汇', dimension: 'literary', difficulty: 3,
    sentence: 'The old house stood in ___ silence, as if holding its breath.',
    translation: '那座老房子静静地矗立着，仿佛屏住了呼吸。',
    answer: 'eerie', alternatives: ['haunting', 'uncanny'],
    hint: '形容词，令人毛骨悚然的、怪异的',
  },
  {
    id: 11, category: '日常词汇', dimension: 'daily', difficulty: 3,
    sentence: 'She has a ___ for getting into trouble without meaning to.',
    translation: '她总是在无意间惹上麻烦——简直是天赋。',
    answer: 'knack', alternatives: ['talent', 'gift'],
    hint: '名词，天赋/倾向（常带轻微讽刺）',
  },
  // ── Level 4 · 中高级 ──
  {
    id: 12, category: '职场词汇', dimension: 'professional', difficulty: 4,
    sentence: "The CEO's ___ remarks caused controversy at the press conference.",
    translation: 'CEO在发布会上的挑衅言论引发了争议。',
    answer: 'provocative', alternatives: ['controversial', 'inflammatory'],
    hint: '形容词，挑衅性的',
  },
  {
    id: 13, category: '学术词汇', dimension: 'academic', difficulty: 4,
    sentence: "The policy's ___ effects were not immediately apparent.",
    translation: '该政策的深远影响并非立竿见影。',
    answer: 'far-reaching', alternatives: ['long-term', 'profound'],
    hint: '形容词，影响深远的',
  },
  {
    id: 14, category: '文学词汇', dimension: 'literary', difficulty: 4,
    sentence: 'His ___ wit made every conversation feel like a chess match.',
    translation: '他犀利的机智使每次对话都像一场棋局。',
    answer: 'incisive', alternatives: ['sharp', 'razor-sharp', 'keen'],
    hint: '形容词，犀利的、一针见血的',
  },
  {
    id: 15, category: '口语表达', dimension: 'spoken', difficulty: 4,
    sentence: "I'll cross that bridge when I ___ to it.",
    translation: '到时候再说，船到桥头自然直。',
    answer: 'come', alternatives: ['get'],
    hint: '固定习语：cross that bridge when you come to it',
  },
  // ── Level 5 · 高级 ──
  {
    id: 16, category: '学术词汇', dimension: 'academic', difficulty: 5,
    sentence: "The committee's decision was ___ by a lack of concrete evidence.",
    translation: '委员会的决定因缺乏确凿证据而受到阻碍。',
    answer: 'hampered', alternatives: ['hindered', 'impeded', 'stymied'],
    hint: '动词（被动式），阻碍、妨碍',
  },
  {
    id: 17, category: '职场词汇', dimension: 'professional', difficulty: 5,
    sentence: 'A good leader must ___ between short-term gains and long-term vision.',
    translation: '好的领导者必须在短期利益和长远愿景之间取得平衡。',
    answer: 'balance', alternatives: ['navigate', 'reconcile'],
    hint: '动词，平衡、权衡',
  },
  {
    id: 18, category: '文学词汇', dimension: 'literary', difficulty: 5,
    sentence: "The novel's ___ narrative structure challenges conventional storytelling.",
    translation: '这部小说非线性的叙事结构挑战了传统讲故事的方式。',
    answer: 'nonlinear', alternatives: ['fragmented', 'labyrinthine'],
    hint: '形容词，非线性的',
  },
  {
    id: 19, category: '学术词汇', dimension: 'academic', difficulty: 5,
    sentence: 'Critics ___ his optimism, calling it willful blindness.',
    translation: '批评者嘲讽他的乐观主义，称之为有意的盲目。',
    answer: 'derided', alternatives: ['mocked', 'ridiculed', 'scorned'],
    hint: '动词（过去式），嘲弄、奚落',
  },
  {
    id: 20, category: '文学词汇', dimension: 'literary', difficulty: 5,
    sentence: 'Her prose style is ___ — dense with meaning yet effortlessly clear.',
    translation: '她的散文风格令人叹服——意涵丰富却毫不费力地清晰。',
    answer: 'lapidary', alternatives: ['crystalline', 'pellucid'],
    hint: '形容词（高级），简洁精炼的，如宝石切割般精致',
  },
];

// ──────────────────────────────────────────────────────────
// DIMENSION CONFIG
// ──────────────────────────────────────────────────────────
const DIMENSIONS = [
  { key: 'daily',        label: '日常词汇', color: 'rgba(180,230,255,.8)',  angle: -90 },
  { key: 'spoken',       label: '口语表达', color: 'rgba(255,200,140,.8)',  angle: -30 },
  { key: 'professional', label: '职场词汇', color: 'rgba(140,255,190,.8)',  angle: 30  },
  { key: 'academic',     label: '学术词汇', color: 'rgba(200,160,255,.8)',  angle: 90  },
  { key: 'literary',     label: '文学词汇', color: 'rgba(255,150,150,.8)',  angle: 150 },
  { key: 'idiom',        label: '习语表达', color: 'rgba(255,230,120,.8)',  angle: 210 },
];

const DOTS = ['●○○○○', '●●○○○', '●●●○○', '●●●●○', '●●●●●'];

// ──────────────────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────────────────
let currentIndex = 0;
let score = 0;
let dimScores = {};

function resetState() {
  currentIndex = 0; score = 0; dimScores = {};
  DIMENSIONS.forEach(d => { dimScores[d.key] = { correct: 0, total: 0 }; });
}

// ──────────────────────────────────────────────────────────
// DOM REFS
// ──────────────────────────────────────────────────────────
const screenIntro  = document.getElementById('screenIntro');
const screenQuiz   = document.getElementById('screenQuiz');
const screenResult = document.getElementById('screenResult');

const navProgress     = document.getElementById('navProgress');
const navQCount       = document.getElementById('navQCount');
const navProgressFill = document.getElementById('navProgressFill');

const qCard        = document.getElementById('qCard');
const qCategory    = document.getElementById('qCategory');
const qDifficulty  = document.getElementById('qDifficulty');
const qSentence    = document.getElementById('qSentence');
const qTranslation = document.getElementById('qTranslation');
const qInput       = document.getElementById('qInput');
const btnConfirm   = document.getElementById('btnConfirm');
const btnSkip      = document.getElementById('btnSkip');

const qFeedback       = document.getElementById('qFeedback');
const feedbackIcon    = document.getElementById('feedbackIcon');
const feedbackWord    = document.getElementById('feedbackWord');
const feedbackExplain = document.getElementById('feedbackExplain');
const btnNext         = document.getElementById('btnNext');

const btnStart      = document.getElementById('btnStart');
const btnRetake     = document.getElementById('btnRetake');
const btnStartLearn = document.getElementById('btnStartLearn');

// ──────────────────────────────────────────────────────────
// SCREEN TRANSITIONS
// ──────────────────────────────────────────────────────────
function showScreen(s) {
  [screenIntro, screenQuiz, screenResult].forEach(el => el.classList.remove('active'));
  s.classList.add('active');
}

// ──────────────────────────────────────────────────────────
// QUIZ FLOW
// ──────────────────────────────────────────────────────────
function startQuiz() {
  resetState();
  navProgress.style.display = 'flex';
  showScreen(screenQuiz);
  loadQuestion(0);
}

function loadQuestion(idx) {
  const q = QUESTIONS[idx];

  navQCount.textContent    = `${idx + 1} / ${QUESTIONS.length}`;
  navProgressFill.style.width = `${(idx / QUESTIONS.length) * 100}%`;

  qCategory.textContent   = q.category;
  qDifficulty.textContent = DOTS[q.difficulty - 1];
  qTranslation.textContent = q.translation;
  qInput.value = '';
  btnConfirm.classList.remove('ready');
  qFeedback.classList.remove('visible');

  // Render sentence with styled blank
  const parts = q.sentence.split('___');
  qSentence.innerHTML = parts[0] +
    '<span class="q-blank">____</span>' +
    (parts[1] || '');

  // Slide card in
  qCard.classList.add('exit');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    qCard.classList.remove('exit');
  }));

  if (dimScores[q.dimension]) dimScores[q.dimension].total++;
  qInput.focus();
}

function checkAnswer(skipped = false) {
  const q   = QUESTIONS[currentIndex];
  const raw = qInput.value.trim().toLowerCase();
  const ok  = !skipped && (
    raw === q.answer.toLowerCase() ||
    q.alternatives.map(a => a.toLowerCase()).includes(raw)
  );

  if (ok) { score++; if (dimScores[q.dimension]) dimScores[q.dimension].correct++; }

  // Feedback content
  if (skipped) {
    feedbackIcon.textContent = '💭';
    feedbackWord.textContent = q.answer;
    feedbackWord.className   = 'feedback-word skipped';
    feedbackExplain.textContent = q.hint ? `💡 ${q.hint}` : '这个词有点难，继续加油！';
  } else if (ok) {
    feedbackIcon.textContent = '✨';
    feedbackWord.textContent = raw;
    feedbackWord.className   = 'feedback-word correct';
    feedbackExplain.textContent = q.hint || '回答正确，继续保持！';
  } else {
    feedbackIcon.textContent = '📖';
    feedbackWord.textContent = q.answer;
    feedbackWord.className   = 'feedback-word wrong';
    const yourAns = raw ? `你的回答："${raw}"\n` : '';
    feedbackExplain.textContent = `${yourAns}正确答案：${q.answer}${q.hint ? '\n💡 ' + q.hint : ''}`;
  }

  qFeedback.classList.add('visible');
}

function nextQuestion() {
  qFeedback.classList.remove('visible');
  currentIndex++;
  if (currentIndex >= QUESTIONS.length) {
    navProgressFill.style.width = '100%';
    setTimeout(showResults, 400);
  } else {
    setTimeout(() => loadQuestion(currentIndex), 280);
  }
}

// ──────────────────────────────────────────────────────────
// RESULTS
// ──────────────────────────────────────────────────────────
function showResults() {
  navProgress.style.display = 'none';

  // Per-dimension percentages
  const dimPcts = {};
  DIMENSIONS.forEach(d => {
    const s = dimScores[d.key];
    // 无题目的维度给默认分，避免雷达图塌陷
    dimPcts[d.key] = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 35;
  });

  const pct   = score / QUESTIONS.length;
  const level = getLevel(pct);

  document.getElementById('resultBadge').textContent = level.badge;
  document.getElementById('resultLevel').textContent = level.label;
  document.getElementById('resultVocab').innerHTML   =
    `预计掌握词汇量约 <strong>${level.vocab}</strong> 个`;
  document.getElementById('resultPathTitle').textContent = level.pathTitle;
  document.getElementById('resultPathDesc').textContent  = level.pathDesc;

  showScreen(screenResult);
  setTimeout(() => { drawRadar(dimPcts); renderDimBars(dimPcts); }, 200);
}

function getLevel(pct) {
  if (pct >= 0.90) return { badge:'🏆', label:'C2 · 精通级',  vocab:'10,000+', pathTitle:'精进之路',   pathDesc:'你已接近母语水平，专注地道表达与文化细节' };
  if (pct >= 0.75) return { badge:'🌟', label:'C1 · 高级',    vocab:'8,000',   pathTitle:'突破高原',   pathDesc:'攻克学术与文学词汇，让表达更有质感' };
  if (pct >= 0.60) return { badge:'🎓', label:'B2 · 中高级',  vocab:'5,500',   pathTitle:'稳步进阶',   pathDesc:'深化职场与学术词汇，提升流利度' };
  if (pct >= 0.45) return { badge:'📚', label:'B1 · 中级',    vocab:'3,500',   pathTitle:'夯实基础',   pathDesc:'日常词汇已够用，现在拓展职场与学术表达' };
  if (pct >= 0.25) return { badge:'🌱', label:'A2 · 初级',    vocab:'1,500',   pathTitle:'奠基之旅',   pathDesc:'从高频日常词汇出发，建立扎实的词汇基础' };
  return              { badge:'🌿', label:'A1 · 入门',         vocab:'500',     pathTitle:'起航',       pathDesc:'每天15分钟，用情境和故事记住每一个词' };
}

// ──────────────────────────────────────────────────────────
// RADAR CHART
// ──────────────────────────────────────────────────────────
function drawRadar(dimPcts) {
  const canvas = document.getElementById('radarCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.37;
  const N = DIMENSIONS.length;
  const angles = DIMENSIONS.map((_, i) => (i * 2 * Math.PI / N) - Math.PI / 2);

  const isDark = !document.body.classList.contains('dm');
  const gridColor  = isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)';
  const axisColor  = isDark ? 'rgba(255,255,255,.09)' : 'rgba(0,0,0,.09)';
  const labelColor = isDark ? 'rgba(255,255,255,.5)'  : 'rgba(0,0,0,.45)';

  // Grid rings
  for (let r = 1; r <= 5; r++) {
    ctx.beginPath();
    angles.forEach((a, i) => {
      const x = cx + (R * r / 5) * Math.cos(a);
      const y = cy + (R * r / 5) * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Axes
  angles.forEach(a => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Labels
  DIMENSIONS.forEach((d, i) => {
    const a  = angles[i];
    const lx = cx + (R + 32) * Math.cos(a);
    const ly = cy + (R + 32) * Math.sin(a);
    ctx.font = '500 11px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = labelColor;
    ctx.globalAlpha = 0.9;
    ctx.fillText(d.label, lx, ly);
    ctx.globalAlpha = 1;
  });

  // Data polygon
  const pcts = DIMENSIONS.map(d => (dimPcts[d.key] || 35) / 100);

  // Gradient fill
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
  grad.addColorStop(0, 'rgba(180,220,255,.3)');
  grad.addColorStop(1, 'rgba(180,220,255,.04)');

  ctx.beginPath();
  angles.forEach((a, i) => {
    const r = pcts[i] * R;
    i === 0
      ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
      : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  });
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,230,255,.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Dots
  angles.forEach((a, i) => {
    const r = pcts[i] * R;
    ctx.beginPath();
    ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 3.5, 0, Math.PI * 2);
    ctx.fillStyle = DIMENSIONS[i].color;
    ctx.fill();
  });
}

// ──────────────────────────────────────────────────────────
// DIMENSION BARS
// ──────────────────────────────────────────────────────────
function renderDimBars(dimPcts) {
  const container = document.getElementById('dimensionBars');
  if (!container) return;
  container.innerHTML = '';
  DIMENSIONS.forEach(d => {
    const pct = dimPcts[d.key] || 35;
    const row = document.createElement('div');
    row.className = 'dim-row';
    row.innerHTML = `
      <span class="dim-label">${d.label}</span>
      <div class="dim-bar-track">
        <div class="dim-bar-fill" data-pct="${pct}" style="background:${d.color}"></div>
      </div>
      <span class="dim-pct">${pct}%</span>
    `;
    container.appendChild(row);
  });
  requestAnimationFrame(() => {
    container.querySelectorAll('.dim-bar-fill').forEach(bar => {
      setTimeout(() => { bar.style.width = bar.dataset.pct + '%'; }, 100);
    });
  });
}

// ──────────────────────────────────────────────────────────
// EVENT LISTENERS
// ──────────────────────────────────────────────────────────
btnStart.addEventListener('click', startQuiz);

btnConfirm.addEventListener('click', () => {
  if (qInput.value.trim()) checkAnswer(false);
});

btnSkip.addEventListener('click', () => checkAnswer(true));

btnNext.addEventListener('click', nextQuestion);

btnRetake.addEventListener('click', () => {
  showScreen(screenIntro);
  navProgress.style.display = 'none';
});

btnStartLearn.addEventListener('click', () => {
  // TODO: 跳转每日学习页（下一个要开发的页面）
  alert('每日学习页即将上线！🚀');
});

qInput.addEventListener('input', () => {
  btnConfirm.classList.toggle('ready', qInput.value.trim().length > 0);
});

qInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (qFeedback.classList.contains('visible')) {
      nextQuestion();
    } else if (qInput.value.trim()) {
      checkAnswer(false);
    }
  }
});

// ──────────────────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  initAllButtons();
});
