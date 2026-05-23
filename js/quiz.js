// quiz.js — 词汇测试 v2
// 改动：题库随机抽取 + 题库大幅扩充 + 维度对齐 wordbank.js

import { startAnim, stopAnim } from './animations.js';
import { initAllButtons } from './buttons.js';

const THEMES = {
  ocean:{img:'assets/images/ocean.jpg',anim:'ocean'},fog_forest:{img:'assets/images/fog_forest.jpg',anim:'mist'},
  galaxy:{img:'assets/images/galaxy.jpg',anim:'stars'},rain:{img:'assets/images/rain.jpg',anim:'rain'},
  aurora:{img:'assets/images/aurora.jpg',anim:'aurora'},sakura:{img:'assets/images/sakura.jpg',anim:'sakura'},
  sunset:{img:'assets/images/sunset.jpg',anim:'clouds'},snow:{img:'assets/images/snow.jpg',anim:'snow'},
  forest_green:{img:'assets/images/forest_green.jpg',anim:'forest'},
  white:{img:null,anim:'none',dm:true},black:{img:null,anim:'none',dm:false},
};

const bg=document.getElementById('bg');const cv=document.getElementById('cv');
function resize(){cv.width=window.innerWidth;cv.height=window.innerHeight;}
resize();window.addEventListener('resize',()=>{resize();applyTheme();});
function applyTheme(){
  const key=localStorage.getItem('fg_theme')||'ocean';const t=THEMES[key]||THEMES.ocean;
  if(key==='white'){bg.style.backgroundImage='none';bg.className='white-bg';document.body.classList.add('dm');}
  else if(key==='black'){bg.style.backgroundImage='none';bg.className='black-bg';document.body.classList.remove('dm');}
  else{bg.className='';bg.style.backgroundImage=`url(${t.img})`;document.body.classList.remove('dm');}
  stopAnim();if(t.anim!=='none')startAnim(t.anim,cv);
}

// ─────────────────────────────────────────────────────────
// 六维度（与 wordbank.js 对齐）
// ─────────────────────────────────────────────────────────
const DIMENSIONS = [
  { key:'daily',    label:'日常生活', color:'rgba(100,180,255,.85)', angle:-90 },
  { key:'emotion',  label:'情感心理', color:'rgba(255,170,210,.85)', angle:-30 },
  { key:'nature',   label:'自然世界', color:'rgba(140,240,180,.85)', angle: 30 },
  { key:'abstract', label:'抽象概念', color:'rgba(190,160,255,.85)', angle: 90 },
  { key:'social',   label:'社交场景', color:'rgba(255,175,100,.85)', angle:150 },
  { key:'academic', label:'学术书面', color:'rgba(100,230,210,.85)', angle:210 },
];

// ─────────────────────────────────────────────────────────
// 题库（60题，六维度×10题，难度1-6）
// 答题时从每个维度随机抽取，组成20题测试
// ─────────────────────────────────────────────────────────
const QUESTION_BANK = [

  // ── DAILY 日常生活 ────────────────────────────────────
  {dim:'daily',level:1,sentence:'I usually have ___ before going to work.',zh:'我通常上班前吃早餐。',answer:'breakfast',hint:'早餐'},
  {dim:'daily',level:1,sentence:'She does the ___ every Sunday.',zh:'她每周日洗衣服。',answer:'laundry',hint:'洗衣'},
  {dim:'daily',level:2,sentence:'The desk was covered in ___ — papers, cups, and cables everywhere.',zh:'桌子上堆满了杂物。',answer:'clutter',hint:'杂乱堆积'},
  {dim:'daily',level:2,sentence:'His morning ___ starts with meditation and coffee.',zh:'他的晨间惯例从冥想和咖啡开始。',answer:'routine',hint:'日常惯例'},
  {dim:'daily',level:2,sentence:'We need to replace the kitchen ___ — the fridge is broken.',zh:'我们需要更换厨房家电，冰箱坏了。',answer:'appliance',hint:'家电（单个）'},
  {dim:'daily',level:3,sentence:'They plan to ___ the old bathroom next spring.',zh:'他们计划明年春天翻新旧浴室。',answer:'renovate',hint:'翻新'},
  {dim:'daily',level:3,sentence:'Parking downtown is such a ___.',zh:'在市中心停车真是麻烦。',answer:'hassle',hint:'令人烦恼的麻烦事'},
  {dim:'daily',level:4,sentence:'She spent the whole afternoon ___ her wardrobe.',zh:'她花了整个下午整理衣橱。',answer:'decluttering',hint:'动词ing，清理杂物'},
  {dim:'daily',level:5,sentence:'His ___ approach to budgeting allowed him to retire at 50.',zh:'他节俭的理财方式让他50岁退休。',answer:'frugal',hint:'节俭的'},
  {dim:'daily',level:6,sentence:'She found poetry in the ___ details of everyday life.',zh:'她在日常生活的平凡细节中发现了诗意。',answer:'quotidian',hint:'书面词，日常平凡的'},

  // ── EMOTION 情感心理 ──────────────────────────────────
  {dim:'emotion',level:1,sentence:'She felt ___ before her first job interview.',zh:'她在第一次求职面试前感到紧张。',answer:'nervous',hint:'紧张的'},
  {dim:'emotion',level:1,sentence:'He was ___ when he heard he passed the exam.',zh:'他听说通过考试后如释重负。',answer:'relieved',hint:'如释重负的'},
  {dim:'emotion',level:2,sentence:'She felt completely ___ by all the deadlines.',zh:'她被一堆截止日期压得喘不过气。',answer:'overwhelmed',hint:'不堪重负的'},
  {dim:'emotion',level:2,sentence:'Old photos always make me feel ___.',zh:'老照片总让我感到怀旧。',answer:'nostalgic',hint:'怀旧的'},
  {dim:'emotion',level:3,sentence:'She was ___ about moving to a new country.',zh:'她对搬去新国家感到忧虑。',answer:'apprehensive',hint:'忧虑的'},
  {dim:'emotion',level:3,sentence:'The team was ___ after their unexpected victory.',zh:'意外获胜后，团队欣喜若狂。',answer:'elated',hint:'欣喜若狂的'},
  {dim:'emotion',level:4,sentence:'I feel ___ about leaving — excited but also scared.',zh:'对于离开，我心情很矛盾——既兴奋又害怕。',answer:'ambivalent',hint:'矛盾的，态度两可'},
  {dim:'emotion',level:5,sentence:'His ___ with the political system grew over years.',zh:'他对政治体制的幻灭感与年俱增。',answer:'disillusionment',hint:'幻灭感（名词）'},
  {dim:'emotion',level:5,sentence:'She faced the crisis with extraordinary ___.',zh:'她以非凡的内心平静面对危机。',answer:'equanimity',hint:'内心平静（名词）'},
  {dim:'emotion',level:6,sentence:'A gentle ___ settled over the empty streets.',zh:'一种淡淡的忧郁笼罩着空荡的街道。',answer:'melancholy',hint:'忧郁（名词）'},

  // ── NATURE 自然世界 ───────────────────────────────────
  {dim:'nature',level:1,sentence:'A cool ___ blew in through the open window.',zh:'一阵凉风从开着的窗户吹进来。',answer:'breeze',hint:'微风'},
  {dim:'nature',level:1,sentence:'We watched the sun sink below the ___.',zh:'我们看着太阳沉入地平线。',answer:'horizon',hint:'地平线'},
  {dim:'nature',level:2,sentence:'Sunlight filtered through the forest ___.',zh:'阳光透过林冠层洒落下来。',answer:'canopy',hint:'（树）冠层'},
  {dim:'nature',level:2,sentence:'The sky turns orange and pink at ___.',zh:'黄昏时天空变成橙色和粉色。',answer:'dusk',hint:'黄昏'},
  {dim:'nature',level:3,sentence:'The ___ lasted three months, devastating crops.',zh:'干旱持续了三个月，农作物损失惨重。',answer:'drought',hint:'干旱'},
  {dim:'nature',level:3,sentence:'Cherry blossoms are ___ — gone within a week.',zh:'樱花转瞬即逝，一周内便凋落。',answer:'ephemeral',hint:'短暂的（形容词）'},
  {dim:'nature',level:4,sentence:'___ is thawing faster than scientists predicted.',zh:'永冻土融化速度比科学家预测的还快。',answer:'Permafrost',hint:'永冻土（首字母大写）'},
  {dim:'nature',level:5,sentence:'The ___ waves glowed green in the dark water.',zh:'磷光海浪在黑暗的水中发出绿光。',answer:'phosphorescent',hint:'磷光的'},
  {dim:'nature',level:6,sentence:'After the rain, the ___ of wet earth filled the air.',zh:'雨后，空气中弥漫着湿润泥土的气息。',answer:'petrichor',hint:'雨后泥土的气息（专有名词）'},
  {dim:'nature',level:4,sentence:'Few trees survive on the Arctic ___.',zh:'几乎没有树木能在北极苔原上存活。',answer:'tundra',hint:'苔原'},

  // ── ABSTRACT 抽象概念 ─────────────────────────────────
  {dim:'abstract',level:1,sentence:'We made great ___ on the project today.',zh:'我们今天在项目上取得了很大进展。',answer:'progress',hint:'进步，进展'},
  {dim:'abstract',level:2,sentence:'The team quickly reached a ___.',zh:'团队迅速达成了共识。',answer:'consensus',hint:'共识'},
  {dim:'abstract',level:2,sentence:'She acted with ___ even under pressure.',zh:'她在压力下仍保持诚信正直。',answer:'integrity',hint:'诚信，正直'},
  {dim:'abstract',level:3,sentence:'This discovery shifted the entire scientific ___.',zh:'这一发现改变了整个科学范式。',answer:'paradigm',hint:'范式，思维模式'},
  {dim:'abstract',level:3,sentence:'___ is the ability to bounce back from setbacks.',zh:'韧性是从挫折中恢复的能力。',answer:'Resilience',hint:'韧性（首字母大写）'},
  {dim:'abstract',level:3,sentence:'The ___ of the argument was lost in translation.',zh:'论点的细微差别在翻译中丢失了。',answer:'nuance',hint:'细微差别'},
  {dim:'abstract',level:4,sentence:'The ___ of work versus life is often overstated.',zh:'工作与生活的二元对立往往被过度强调。',answer:'dichotomy',hint:'二元对立'},
  {dim:'abstract',level:5,sentence:'Cultural ___ shapes what we consider normal.',zh:'文化霸权塑造了我们对"正常"的认知。',answer:'hegemony',hint:'霸权'},
  {dim:'abstract',level:5,sentence:'Graduation is a ___ moment — between two selves.',zh:'毕业是一个临界时刻——介于两个自我之间。',answer:'liminal',hint:'临界的，过渡期的'},
  {dim:'abstract',level:6,sentence:'___ explains events by their ultimate purpose.',zh:'目的论通过事物的最终目的来解释事件。',answer:'Teleology',hint:'目的论（首字母大写）'},

  // ── SOCIAL 社交场景 ───────────────────────────────────
  {dim:'social',level:1,sentence:'Let me ___ you to my colleague.',zh:'让我介绍你认识我的同事。',answer:'introduce',hint:'介绍'},
  {dim:'social',level:2,sentence:'He is just an ___, not a close friend.',zh:'他只是个熟人，不是亲密朋友。',answer:'acquaintance',hint:'熟人'},
  {dim:'social',level:2,sentence:'There was an ___ silence after the joke failed.',zh:'玩笑没人笑，之后出现了尴尬的沉默。',answer:'awkward',hint:'尴尬的'},
  {dim:'social',level:3,sentence:'She agreed to ___ between the two arguing departments.',zh:'她同意在两个争论的部门之间调解。',answer:'mediate',hint:'调解'},
  {dim:'social',level:3,sentence:'He helped me, and I wanted to ___.',zh:'他帮了我，我也想回报他。',answer:'reciprocate',hint:'回报，互惠'},
  {dim:'social',level:3,sentence:'Good leaders show ___ for their team members.',zh:'好的领导者会对团队成员展现同理心。',answer:'empathy',hint:'同理心'},
  {dim:'social',level:4,sentence:'His ___ tone made everyone uncomfortable.',zh:'他居高临下的语气让所有人感到不舒服。',answer:'condescending',hint:'居高临下的'},
  {dim:'social',level:4,sentence:'She seemed ___ at first, but warmed up quickly.',zh:'她起初显得冷漠，但很快就热情起来了。',answer:'aloof',hint:'冷漠疏远的'},
  {dim:'social',level:5,sentence:'Her natural ___ drew people to her instantly.',zh:'她天然的个人魅力让人对她一见如故。',answer:'charisma',hint:'个人魅力'},
  {dim:'social',level:6,sentence:'His ___ manner irritated every colleague.',zh:'他卑躬屈膝的态度让每个同事都反感。',answer:'obsequious',hint:'卑躬屈膝的'},

  // ── ACADEMIC 学术书面 ─────────────────────────────────
  {dim:'academic',level:2,sentence:'The researchers tested their ___.',zh:'研究人员检验了他们的假设。',answer:'hypothesis',hint:'假设'},
  {dim:'academic',level:2,sentence:'___ does not imply causation.',zh:'相关性不等于因果关系。',answer:'Correlation',hint:'相关性（首字母大写）'},
  {dim:'academic',level:3,sentence:'The study provides ___ evidence for the theory.',zh:'该研究为这一理论提供了实证证据。',answer:'empirical',hint:'实证的，经验的'},
  {dim:'academic',level:3,sentence:'Read the ___ before diving into the full paper.',zh:'读正文前先看摘要。',answer:'abstract',hint:'（论文）摘要'},
  {dim:'academic',level:3,sentence:'Good academic writing requires ___ of multiple sources.',zh:'好的学术写作需要综合多个来源。',answer:'synthesis',hint:'综合，综合分析'},
  {dim:'academic',level:4,sentence:'His speech was full of empty political ___.',zh:'他的演讲充满了空洞的政治修辞。',answer:'rhetoric',hint:'修辞，花言巧语'},
  {dim:'academic',level:4,sentence:'The committee\'s decision was ___ by lack of evidence.',zh:'委员会的决定因证据不足而受阻。',answer:'hampered',hint:'被动式，阻碍'},
  {dim:'academic',level:5,sentence:'___ studies the nature and limits of knowledge.',zh:'认识论研究知识的本质与边界。',answer:'Epistemology',hint:'认识论（首字母大写）'},
  {dim:'academic',level:5,sentence:'Hegel\'s ___ framework shaped modern philosophy.',zh:'黑格尔的辩证法框架塑造了现代哲学。',answer:'dialectic',hint:'辩证法'},
  {dim:'academic',level:6,sentence:'Foucault used the concept of ___ to describe historical knowledge systems.',zh:'福柯用知识型这一概念描述历史性知识体系。',answer:'episteme',hint:'知识型（福柯概念）'},
];

// ─────────────────────────────────────────────────────────
// 随机抽题：每个维度抽 floor(20/6)~ceil(20/6) 题，凑满20题
// 同一维度内按难度排序，整体顺序随机打散
// ─────────────────────────────────────────────────────────
function buildQuiz() {
  const perDim = {};
  DIMENSIONS.forEach(d => { perDim[d.key] = QUESTION_BANK.filter(q => q.dim === d.key); });

  // Fisher-Yates 洗牌
  function shuffle(arr) {
    const a = [...arr];
    for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
  }

  // 每个维度抽题（3题，最后两个维度补到4题凑满20）
  const selected = [];
  DIMENSIONS.forEach((d, idx) => {
    const pool = shuffle(perDim[d.key]);
    const count = idx < 4 ? 3 : 4; // 3*4 + 4*2 = 20
    selected.push(...pool.slice(0, Math.min(count, pool.length)));
  });

  // 整体打散顺序
  return shuffle(selected).map((q,i) => ({...q, id: i+1}));
}

const DOTS = ['●○○○○○','●●○○○○','●●●○○○','●●●●○○','●●●●●○','●●●●●●'];

// ─────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────
let QUESTIONS = [];
let currentIndex = 0;
let score = 0;
let dimScores = {};

function resetState() {
  QUESTIONS = buildQuiz();
  currentIndex = 0; score = 0; dimScores = {};
  DIMENSIONS.forEach(d => { dimScores[d.key] = { correct:0, total:0 }; });
}

// ─────────────────────────────────────────────────────────
// DOM
// ─────────────────────────────────────────────────────────
const screenIntro  = document.getElementById('screenIntro');
const screenQuiz   = document.getElementById('screenQuiz');
const screenResult = document.getElementById('screenResult');
const navProgress  = document.getElementById('navProgress');
const navQCount    = document.getElementById('navQCount');
const navProgressFill = document.getElementById('navProgressFill');
const qCard        = document.getElementById('qCard');
const qCategory    = document.getElementById('qCategory');
const qDifficulty  = document.getElementById('qDifficulty');
const qSentence    = document.getElementById('qSentence');
const qTranslation = document.getElementById('qTranslation');
const qInput       = document.getElementById('qInput');
const btnConfirm   = document.getElementById('btnConfirm');
const btnSkip      = document.getElementById('btnSkip');
const qFeedback    = document.getElementById('qFeedback');
const feedbackIcon = document.getElementById('feedbackIcon');
const feedbackWord = document.getElementById('feedbackWord');
const feedbackExplain = document.getElementById('feedbackExplain');
const btnNext      = document.getElementById('btnNext');
const btnStart     = document.getElementById('btnStart');
const btnRetake    = document.getElementById('btnRetake');
const btnStartLearn= document.getElementById('btnStartLearn');

function showScreen(s) {
  [screenIntro, screenQuiz, screenResult].forEach(el => el.classList.remove('active'));
  s.classList.add('active');
}

function startQuiz() {
  resetState();
  navProgress.style.display = 'flex';
  showScreen(screenQuiz);
  loadQuestion(0);
}

function loadQuestion(idx) {
  const q = QUESTIONS[idx];
  navQCount.textContent = `${idx+1} / ${QUESTIONS.length}`;
  navProgressFill.style.width = `${(idx/QUESTIONS.length)*100}%`;

  const dimInfo = DIMENSIONS.find(d => d.key === q.dim);
  qCategory.textContent = dimInfo ? dimInfo.label : q.dim;
  qDifficulty.textContent = DOTS[Math.min(q.level-1, 5)];
  qTranslation.textContent = q.zh;
  qInput.value = '';
  btnConfirm.classList.remove('ready');
  qFeedback.classList.remove('visible');

  const parts = q.sentence.split('___');
  qSentence.innerHTML = parts[0] + '<span class="q-blank">____</span>' + (parts[1]||'');

  qCard.classList.add('exit');
  requestAnimationFrame(() => requestAnimationFrame(() => { qCard.classList.remove('exit'); }));

  if (dimScores[q.dim]) dimScores[q.dim].total++;
  qInput.focus();
}

function checkAnswer(skipped=false) {
  const q = QUESTIONS[currentIndex];
  const raw = qInput.value.trim().toLowerCase();
  const correctAnswers = [q.answer.toLowerCase(), ...(q.alternatives||[]).map(a=>a.toLowerCase())];
  const ok = !skipped && correctAnswers.includes(raw);

  if (ok) { score++; if(dimScores[q.dim]) dimScores[q.dim].correct++; }

  if (skipped) {
    feedbackIcon.textContent='💭';
    feedbackWord.textContent=q.answer; feedbackWord.className='feedback-word skipped';
    feedbackExplain.textContent=q.hint?`💡 ${q.hint}`:'这个词有点难，继续加油！';
  } else if (ok) {
    feedbackIcon.textContent='✨';
    feedbackWord.textContent=raw; feedbackWord.className='feedback-word correct';
    feedbackExplain.textContent=q.hint||'回答正确，继续保持！';
  } else {
    feedbackIcon.textContent='📖';
    feedbackWord.textContent=q.answer; feedbackWord.className='feedback-word wrong';
    const yourAns=raw?`你的回答："${raw}"\n`:'';
    feedbackExplain.textContent=`${yourAns}正确答案：${q.answer}${q.hint?'\n💡 '+q.hint:''}`;
  }
  qFeedback.classList.add('visible');
}

function nextQuestion() {
  qFeedback.classList.remove('visible');
  currentIndex++;
  if (currentIndex >= QUESTIONS.length) {
    navProgressFill.style.width='100%';
    setTimeout(showResults, 400);
  } else {
    setTimeout(()=>loadQuestion(currentIndex), 280);
  }
}

function showResults() {
  navProgress.style.display='none';
  const dimPcts={};
  DIMENSIONS.forEach(d=>{
    const s=dimScores[d.key];
    dimPcts[d.key]=s.total>0?Math.round((s.correct/s.total)*100):30;
  });
  const pct=score/QUESTIONS.length;
  const level=getLevel(pct);
  document.getElementById('resultBadge').textContent=level.badge;
  document.getElementById('resultLevel').textContent=level.label;
  document.getElementById('resultVocab').innerHTML=`预计掌握词汇量约 <strong>${level.vocab}</strong> 个`;
  document.getElementById('resultPathTitle').textContent=level.pathTitle;
  document.getElementById('resultPathDesc').textContent=level.pathDesc;
  showScreen(screenResult);
  setTimeout(()=>{ drawRadar(dimPcts); renderDimBars(dimPcts); }, 200);
}

function getLevel(pct){
  if(pct>=.90)return{badge:'🏆',label:'C2 · 精通级',vocab:'10,000+',pathTitle:'精进之路',pathDesc:'你已接近母语水平，专注地道表达与文化细节'};
  if(pct>=.75)return{badge:'🌟',label:'C1 · 高级',vocab:'8,000',pathTitle:'突破高原',pathDesc:'攻克学术与文学词汇，让表达更有质感'};
  if(pct>=.60)return{badge:'🎓',label:'B2 · 中高级',vocab:'5,500',pathTitle:'稳步进阶',pathDesc:'深化职场与学术词汇，提升流利度'};
  if(pct>=.45)return{badge:'📚',label:'B1 · 中级',vocab:'3,500',pathTitle:'夯实基础',pathDesc:'日常词汇已够用，现在拓展职场与学术表达'};
  if(pct>=.25)return{badge:'🌱',label:'A2 · 初级',vocab:'1,500',pathTitle:'奠基之旅',pathDesc:'从高频日常词汇出发，建立扎实的词汇基础'};
  return{badge:'🌿',label:'A1 · 入门',vocab:'500',pathTitle:'起航',pathDesc:'每天15分钟，用情境和故事记住每一个词'};
}

function drawRadar(dimPcts){
  const canvas=document.getElementById('radarCanvas');if(!canvas)return;
  const ctx=canvas.getContext('2d');const W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H);
  const cx=W/2,cy=H/2,R=Math.min(W,H)*.37,N=DIMENSIONS.length;
  const angles=DIMENSIONS.map((_,i)=>(i*2*Math.PI/N)-Math.PI/2);
  const isDark=!document.body.classList.contains('dm');
  const gridColor=isDark?'rgba(255,255,255,.07)':'rgba(0,0,0,.07)';
  const labelColor=isDark?'rgba(255,255,255,.5)':'rgba(0,0,0,.45)';
  for(let r=1;r<=5;r++){
    ctx.beginPath();
    angles.forEach((a,i)=>{const x=cx+(R*r/5)*Math.cos(a),y=cy+(R*r/5)*Math.sin(a);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.closePath();ctx.strokeStyle=gridColor;ctx.lineWidth=1;ctx.stroke();
  }
  angles.forEach(a=>{ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+R*Math.cos(a),cy+R*Math.sin(a));ctx.strokeStyle=gridColor;ctx.lineWidth=1;ctx.stroke();});
  DIMENSIONS.forEach((d,i)=>{
    const a=angles[i],lx=cx+(R+32)*Math.cos(a),ly=cy+(R+32)*Math.sin(a);
    ctx.font='500 11px "DM Sans",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle=labelColor;ctx.fillText(d.label,lx,ly);
  });
  const pcts=DIMENSIONS.map(d=>(dimPcts[d.key]||30)/100);
  const grad=ctx.createRadialGradient(cx,cy,0,cx,cy,R);
  grad.addColorStop(0,'rgba(180,220,255,.3)');grad.addColorStop(1,'rgba(180,220,255,.04)');
  ctx.beginPath();
  angles.forEach((a,i)=>{const r=pcts[i]*R;i===0?ctx.moveTo(cx+r*Math.cos(a),cy+r*Math.sin(a)):ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));});
  ctx.closePath();ctx.fillStyle=grad;ctx.fill();ctx.strokeStyle='rgba(200,230,255,.6)';ctx.lineWidth=1.5;ctx.stroke();
  angles.forEach((a,i)=>{const r=pcts[i]*R;ctx.beginPath();ctx.arc(cx+r*Math.cos(a),cy+r*Math.sin(a),3.5,0,Math.PI*2);ctx.fillStyle=DIMENSIONS[i].color;ctx.fill();});
}

function renderDimBars(dimPcts){
  const container=document.getElementById('dimensionBars');if(!container)return;
  container.innerHTML='';
  DIMENSIONS.forEach(d=>{
    const pct=dimPcts[d.key]||30;
    const row=document.createElement('div');row.className='dim-row';
    row.innerHTML=`<span class="dim-label">${d.label}</span><div class="dim-bar-track"><div class="dim-bar-fill" data-pct="${pct}" style="background:${d.color}"></div></div><span class="dim-pct">${pct}%</span>`;
    container.appendChild(row);
  });
  requestAnimationFrame(()=>{container.querySelectorAll('.dim-bar-fill').forEach(bar=>{setTimeout(()=>{bar.style.width=bar.dataset.pct+'%';},100);});});
}

btnStart.addEventListener('click',startQuiz);
btnConfirm.addEventListener('click',()=>{if(qInput.value.trim())checkAnswer(false);});
btnSkip.addEventListener('click',()=>checkAnswer(true));
btnNext.addEventListener('click',nextQuestion);
btnRetake.addEventListener('click',()=>{showScreen(screenIntro);navProgress.style.display='none';});
btnStartLearn.addEventListener('click',()=>{ window.location.href='learn.html'; });
qInput.addEventListener('input',()=>{btnConfirm.classList.toggle('ready',qInput.value.trim().length>0);});
qInput.addEventListener('keydown',e=>{
  if(e.key==='Enter'){
    if(qFeedback.classList.contains('visible'))nextQuestion();
    else if(qInput.value.trim())checkAnswer(false);
  }
});

document.addEventListener('DOMContentLoaded',()=>{ applyTheme(); initAllButtons(); });
