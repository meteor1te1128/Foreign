// quiz.js v5 — 全场景题库 + 云端同步

import { startAnim, stopAnim } from './animations.js';
import { initAllButtons } from './buttons.js';
import { pushToCloud, getCurrentUser } from './auth.js';

const THEMES = {
  ocean:{img:'assets/images/ocean.jpg',anim:'ocean'},
  fog_forest:{img:'assets/images/fog_forest.jpg',anim:'mist'},
  galaxy:{img:'assets/images/galaxy.jpg',anim:'stars'},
  rain:{img:'assets/images/rain.jpg',anim:'rain'},
  aurora:{img:'assets/images/aurora.jpg',anim:'none'},
  sakura:{img:'assets/images/sakura.jpg',anim:'sakura'},
  sunset:{img:'assets/images/sunset.jpg',anim:'clouds'},
  snow:{img:'assets/images/snow.jpg',anim:'snow'},
  forest_green:{img:'assets/images/forest_green.jpg',anim:'forest'},
  white:{img:null,anim:'none',dm:true},
  black:{img:null,anim:'none',dm:false},
};

const bg=document.getElementById('bg');
const cv=document.getElementById('cv');
function resize(){cv.width=window.innerWidth;cv.height=window.innerHeight;}
resize();
// fix #6: resize 只更新 canvas 尺寸，不重启动画
window.addEventListener('resize',()=>{ resize(); });

function applyTheme(){
  const key=localStorage.getItem('fg_theme')||'ocean';
  const t=THEMES[key]||THEMES.ocean;
  if(key==='white'){bg.style.backgroundImage='none';bg.className='white-bg';document.body.classList.add('dm');}
  else if(key==='black'){bg.style.backgroundImage='none';bg.className='black-bg';document.body.classList.remove('dm');}
  else{bg.className='';bg.style.backgroundImage=`url(${t.img})`;document.body.classList.remove('dm');}
  stopAnim();if(t.anim!=='none')startAnim(t.anim,cv);
}

export const SCENES = [
  {key:'daily',  label:'日常生活', color:'rgba(100,180,255,.85)', icon:'🏠'},
  {key:'food',   label:'饮食',     color:'rgba(255,200,100,.85)', icon:'🍜'},
  {key:'work',   label:'职场',     color:'rgba(140,240,180,.85)', icon:'💼'},
  {key:'travel', label:'出行',     color:'rgba(190,160,255,.85)', icon:'✈️'},
  {key:'health', label:'健康',     color:'rgba(255,150,150,.85)', icon:'❤️'},
  {key:'social', label:'社交',     color:'rgba(255,175,100,.85)', icon:'🗣'},
];

const BUILTIN_QUESTIONS = [
  {id:'dy001',scene:'daily',level:1,word:'routine',sentence:'Exercise is part of his daily ___.',zh:'锻炼是他日常惯例的一部分。',hint:'惯例/日常'},
  {id:'dy002',scene:'daily',level:2,word:'commute',sentence:'His daily ___ takes over an hour each way.',zh:'他每天的通勤单程超过一小时。',hint:'通勤'},
  {id:'dy003',scene:'daily',level:3,word:'mortgage',sentence:'They took out a ___ to buy the house.',zh:'他们贷款买了这栋房子。',hint:'房贷'},
  {id:'dy004',scene:'daily',level:4,word:'frugal',sentence:'A ___ lifestyle helped her save quickly.',zh:'节俭的生活方式帮助她快速储蓄。',hint:'节俭的'},
  {id:'dy005',scene:'daily',level:5,word:'mundane',sentence:'Even ___ tasks deserve full attention.',zh:'就算是平凡的任务也值得全力投入。',hint:'平凡无趣的'},
  {id:'fd001',scene:'food',level:1,word:'ingredient',sentence:'List all the ___ before you start.',zh:'开始之前列出所有食材。',hint:'食材'},
  {id:'fd002',scene:'food',level:2,word:'nutrition',sentence:'Good ___ is key to staying healthy.',zh:'良好的营养是保持健康的关键。',hint:'营养'},
  {id:'fd003',scene:'food',level:3,word:'simmer',sentence:'Let the soup ___ for thirty minutes.',zh:'让汤小火慢炖三十分钟。',hint:'小火慢炖'},
  {id:'fd004',scene:'food',level:4,word:'palate',sentence:'This wine suits every ___.',zh:'这款葡萄酒适合各种口味。',hint:'味觉/口味偏好'},
  {id:'fd005',scene:'food',level:5,word:'umami',sentence:'Soy sauce adds deep ___ to any dish.',zh:'酱油为任何菜肴增添深沉的鲜味。',hint:'鲜味'},
  {id:'wk001',scene:'work',level:1,word:'deadline',sentence:'The ___ for this report is Friday.',zh:'这份报告的截止日期是周五。',hint:'截止日期'},
  {id:'wk002',scene:'work',level:2,word:'recruit',sentence:'The company plans to ___ fifty new staff.',zh:'公司计划招募五十名新员工。',hint:'招募'},
  {id:'wk003',scene:'work',level:3,word:'redundant',sentence:'Two hundred workers were made ___ last month.',zh:'上个月有两百名工人被裁员。',hint:'被裁员的'},
  {id:'wk004',scene:'work',level:4,word:'autonomy',sentence:'Employees need ___ to do their best work.',zh:'员工需要自主权才能做出最好的工作。',hint:'自主权'},
  {id:'wk005',scene:'work',level:5,word:'meritocracy',sentence:'A true ___ rewards skill over connections.',zh:'真正的精英制度奖励能力而非关系。',hint:'精英制度'},
  {id:'tr001',scene:'travel',level:1,word:'passport',sentence:"Don't forget your ___ at the airport.",zh:'在机场不要忘记你的护照。',hint:'护照'},
  {id:'tr002',scene:'travel',level:2,word:'itinerary',sentence:'She planned a detailed ___ for the trip.',zh:'她为这次旅行制定了详细的行程。',hint:'行程计划'},
  {id:'tr003',scene:'travel',level:3,word:'layover',sentence:'We had a four-hour ___ in Dubai.',zh:'我们在迪拜有四小时的中途停留。',hint:'中途停留'},
  {id:'tr004',scene:'travel',level:4,word:'itinerant',sentence:'He lived an ___ life, moving city to city.',zh:'他过着流浪的生活，从一个城市移到另一个城市。',hint:'流浪的/巡回的'},
  {id:'tr005',scene:'travel',level:5,word:'wanderlust',sentence:'Her constant ___ meant she rarely stayed home.',zh:'她不断的旅行欲望意味着她很少待在家里。',hint:'旅行渴望'},
  {id:'hl001',scene:'health',level:1,word:'symptom',sentence:'Fever is a common ___ of the flu.',zh:'发烧是流感的常见症状。',hint:'症状'},
  {id:'hl002',scene:'health',level:2,word:'diagnosis',sentence:'The doctor made a quick ___.',zh:'医生迅速做出了诊断。',hint:'诊断'},
  {id:'hl003',scene:'health',level:3,word:'chronic',sentence:'She suffers from ___ back pain.',zh:'她患有慢性背痛。',hint:'慢性的'},
  {id:'hl004',scene:'health',level:4,word:'prognosis',sentence:'The ___ for recovery is very good.',zh:'康复的预后非常好。',hint:'预后/预测'},
  {id:'hl005',scene:'health',level:5,word:'palliative',sentence:'The treatment was ___ rather than curative.',zh:'这种治疗是姑息性的，而非治愈性的。',hint:'姑息的/缓解性的'},
  {id:'sc001',scene:'social',level:1,word:'introduce',sentence:'Let me ___ you to my friend.',zh:'让我介绍你认识我的朋友。',hint:'介绍'},
  {id:'sc002',scene:'social',level:2,word:'empathy',sentence:'Good leaders show ___ for their teams.',zh:'好的领导者会对团队展现同理心。',hint:'同理心'},
  {id:'sc003',scene:'social',level:3,word:'reciprocate',sentence:'He helped me, so I wanted to ___.',zh:'他帮了我，所以我想回报他。',hint:'回报'},
  {id:'sc004',scene:'social',level:4,word:'condescending',sentence:'His ___ tone upset the whole team.',zh:'他居高临下的语气让整个团队不满。',hint:'居高临下的'},
  {id:'sc005',scene:'social',level:5,word:'obsequious',sentence:'His ___ manner annoyed everyone around him.',zh:'他卑躬屈膝的态度让周围所有人反感。',hint:'卑躬屈膝的'},
];

let EXTENDED_QUESTIONS = [];

async function loadExtended() {
  try {
    const [d, f, w, tr, hl, sc] = await Promise.all([
      import('./qbank/daily.js').catch(()=>({QBANK_DAILY:[]})),
      import('./qbank/food.js').catch(()=>({QBANK_FOOD:[]})),
      import('./qbank/work.js').catch(()=>({QBANK_WORK:[]})),
      import('./qbank/travel.js').catch(()=>({QBANK_TRAVEL:[]})),
      import('./qbank/health.js').catch(()=>({QBANK_HEALTH:[]})),
      import('./qbank/social.js').catch(()=>({QBANK_SOCIAL:[]})),
    ]);
    EXTENDED_QUESTIONS = [
      ...(d.QBANK_DAILY||[]),
      ...(f.QBANK_FOOD||[]),
      ...(w.QBANK_WORK||[]),
      ...(tr.QBANK_TRAVEL||[]),
      ...(hl.QBANK_HEALTH||[]),
      ...(sc.QBANK_SOCIAL||[]),
    ];
  } catch(e) {
    EXTENDED_QUESTIONS = [];
  }
}

function getAllQuestions() {
  const all = [...BUILTIN_QUESTIONS, ...EXTENDED_QUESTIONS];
  const seen = new Set();
  return all.filter(q => { if(seen.has(q.id)) return false; seen.add(q.id); return true; });
}

function buildQuiz() {
  const all = getAllQuestions();
  const perScene = {};
  SCENES.forEach(s => { perScene[s.key] = all.filter(q => q.scene === s.key); });

  function shuffle(arr) {
    const a=[...arr];
    for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
  }

  const selected = [];
  SCENES.forEach((s, idx) => {
    const pool = shuffle(perScene[s.key]);
    const count = idx < 4 ? 3 : 4;
    selected.push(...pool.slice(0, Math.min(count, pool.length)));
  });

  return shuffle(selected).map((q,i) => ({...q, qid: i+1}));
}

const DOTS = ['●○○○○','●●○○○','●●●○○','●●●●○','●●●●●'];

async function syncCloud() {
  try {
    const user = await getCurrentUser();
    if (user) await pushToCloud();
  } catch(e) {}
}

function addToReview(wordId) {
  try {
    const w = JSON.parse(localStorage.getItem('fg_wrong')||'{}');
    w[wordId] = (w[wordId]||0) + 1;
    localStorage.setItem('fg_wrong', JSON.stringify(w));
  } catch(e) {}
}
function removeFromReview(wordId) {
  try {
    const w = JSON.parse(localStorage.getItem('fg_wrong')||'{}');
    if(w[wordId]>1) w[wordId]--;
    else delete w[wordId];
    localStorage.setItem('fg_wrong', JSON.stringify(w));
  } catch(e) {}
}
function isInReview(wordId) {
  try { return !!(JSON.parse(localStorage.getItem('fg_wrong')||'{}')[wordId]); } catch { return false; }
}

let QUESTIONS=[], currentIndex=0, score=0, sceneScores={};

function resetState() {
  QUESTIONS=buildQuiz(); currentIndex=0; score=0; sceneScores={};
  SCENES.forEach(s=>{ sceneScores[s.key]={correct:0,total:0}; });
}

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
  [screenIntro,screenQuiz,screenResult].forEach(el=>el.classList.remove('active'));
  s.classList.add('active');
}

async function startQuiz() {
  await loadExtended();
  resetState();
  navProgress.style.display='flex';
  showScreen(screenQuiz);
  loadQuestion(0);
}

function loadQuestion(idx) {
  const q=QUESTIONS[idx];
  navQCount.textContent=`${idx+1} / ${QUESTIONS.length}`;
  navProgressFill.style.width=`${(idx/QUESTIONS.length)*100}%`;
  const sc=SCENES.find(s=>s.key===q.scene);
  qCategory.textContent=sc?sc.label:q.scene;
  qDifficulty.textContent=DOTS[Math.min(q.level-1,4)];
  qTranslation.textContent=q.zh;
  qInput.value='';
  btnConfirm.classList.remove('ready');
  qFeedback.classList.remove('visible');

  // fix #5: 每道新题加载时彻底重置 feedback-add-btn 状态，防止上一题残留
  const addBtn = qFeedback.querySelector('.feedback-add-btn');
  if (addBtn) {
    addBtn.style.display = 'none';
    addBtn.textContent = '＋ 加入回炉本';
    addBtn.onclick = null;
  }

  const parts=q.sentence.split('___');
  qSentence.innerHTML=parts[0]+'<span class="q-blank">____</span>'+(parts[1]||'');
  qCard.classList.add('exit');
  requestAnimationFrame(()=>requestAnimationFrame(()=>qCard.classList.remove('exit')));
  if(sceneScores[q.scene]) sceneScores[q.scene].total++;
  qInput.focus();
}

function checkAnswer(skipped=false) {
  const q=QUESTIONS[currentIndex];
  const raw=qInput.value.trim().toLowerCase();
  const ok=!skipped&&raw===q.word.toLowerCase();

  if(ok) { score++; if(sceneScores[q.scene]) sceneScores[q.scene].correct++; }
  if(!ok && !skipped) addToReview(q.id);
  if(skipped) addToReview(q.id);

  syncCloud();

  const inReview = isInReview(q.id);

  if(skipped){
    feedbackIcon.textContent='💭';
    feedbackWord.textContent=q.word; feedbackWord.className='feedback-word skipped';
    feedbackExplain.textContent=`💡 ${q.hint}\n已加入回炉本`;
  } else if(ok){
    feedbackIcon.textContent='✨';
    feedbackWord.textContent=raw; feedbackWord.className='feedback-word correct';
    feedbackExplain.textContent=q.hint||'回答正确！';
    const addBtn = qFeedback.querySelector('.feedback-add-btn');
    if(addBtn) {
      addBtn.textContent = inReview ? '✓ 已在回炉本' : '＋ 加入回炉本';
      addBtn.dataset.id  = q.id;
      addBtn.style.display = 'inline-flex';
      addBtn.onclick = () => {
        if(isInReview(q.id)){ removeFromReview(q.id); addBtn.textContent='＋ 加入回炉本'; }
        else { addToReview(q.id); addBtn.textContent='✓ 已在回炉本'; }
        syncCloud();
      };
    }
  } else {
    feedbackIcon.textContent='📖';
    feedbackWord.textContent=q.word; feedbackWord.className='feedback-word wrong';
    feedbackExplain.textContent=`你的回答："${raw||'（空）'}"\n正确答案：${q.word}\n💡 ${q.hint}\n已加入回炉本`;
    const addBtn=qFeedback.querySelector('.feedback-add-btn');
    if(addBtn) addBtn.style.display='none';
  }

  qFeedback.classList.add('visible');
}

function nextQuestion() {
  const addBtn=qFeedback.querySelector('.feedback-add-btn');
  if(addBtn) addBtn.style.display='none';
  qFeedback.classList.remove('visible');
  currentIndex++;
  if(currentIndex>=QUESTIONS.length){ navProgressFill.style.width='100%'; setTimeout(showResults,400); }
  else setTimeout(()=>loadQuestion(currentIndex),280);
}

function showResults() {
  navProgress.style.display='none';
  const scenePcts={};
  SCENES.forEach(s=>{ const sc=sceneScores[s.key]; scenePcts[s.key]=sc.total>0?Math.round((sc.correct/sc.total)*100):30; });
  const pct=score/QUESTIONS.length;
  const level=getLevel(pct);
  document.getElementById('resultBadge').textContent=level.badge;
  document.getElementById('resultLevel').textContent=level.label;
  document.getElementById('resultVocab').innerHTML=`预计掌握词汇量约 <strong>${level.vocab}</strong> 个`;
  document.getElementById('resultPathTitle').textContent=level.pathTitle;
  document.getElementById('resultPathDesc').textContent=level.pathDesc;
  showScreen(screenResult);
  setTimeout(()=>{ drawRadar(scenePcts); renderDimBars(scenePcts); if(window.renderWeakReco) window.renderWeakReco(scenePcts,SCENES); },200);
}

function getLevel(pct){
  if(pct>=.90)return{badge:'🏆',label:'C2 · 精通级',vocab:'10,000+',pathTitle:'精进之路',pathDesc:'你已接近母语水平，专注地道表达与文化细节'};
  if(pct>=.75)return{badge:'🌟',label:'C1 · 高级',vocab:'8,000',pathTitle:'突破高原',pathDesc:'攻克学术与文学词汇，让表达更有质感'};
  if(pct>=.60)return{badge:'🎓',label:'B2 · 中高级',vocab:'5,500',pathTitle:'稳步进阶',pathDesc:'深化职场与学术词汇，提升流利度'};
  if(pct>=.45)return{badge:'📚',label:'B1 · 中级',vocab:'3,500',pathTitle:'夯实基础',pathDesc:'日常词汇已够用，现在拓展职场与学术表达'};
  if(pct>=.25)return{badge:'🌱',label:'A2 · 初级',vocab:'1,500',pathTitle:'奠基之旅',pathDesc:'从高频日常词汇出发，建立扎实的词汇基础'};
  return{badge:'🌿',label:'A1 · 入门',vocab:'500',pathTitle:'起航',pathDesc:'每天15分钟，用情境和故事记住每一个词'};
}

function drawRadar(scenePcts){
  const canvas=document.getElementById('radarCanvas');if(!canvas)return;
  const ctx=canvas.getContext('2d');const W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H);
  const cx=W/2,cy=H/2,R=Math.min(W,H)*.37,N=SCENES.length;
  const angles=SCENES.map((_,i)=>(i*2*Math.PI/N)-Math.PI/2);
  const isDark=!document.body.classList.contains('dm');
  const gridColor=isDark?'rgba(255,255,255,.07)':'rgba(0,0,0,.07)';
  const labelColor=isDark?'rgba(255,255,255,.5)':'rgba(0,0,0,.45)';
  for(let r=1;r<=5;r++){
    ctx.beginPath();
    angles.forEach((a,i)=>{const x=cx+(R*r/5)*Math.cos(a),y=cy+(R*r/5)*Math.sin(a);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.closePath();ctx.strokeStyle=gridColor;ctx.lineWidth=1;ctx.stroke();
  }
  angles.forEach(a=>{ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+R*Math.cos(a),cy+R*Math.sin(a));ctx.strokeStyle=gridColor;ctx.lineWidth=1;ctx.stroke();});
  SCENES.forEach((s,i)=>{
    const a=angles[i],lx=cx+(R+32)*Math.cos(a),ly=cy+(R+32)*Math.sin(a);
    ctx.font='500 11px "DM Sans",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle=labelColor;ctx.fillText(s.label,lx,ly);
  });
  const pcts=SCENES.map(s=>(scenePcts[s.key]||30)/100);
  const grad=ctx.createRadialGradient(cx,cy,0,cx,cy,R);
  grad.addColorStop(0,'rgba(180,220,255,.3)');grad.addColorStop(1,'rgba(180,220,255,.04)');
  ctx.beginPath();
  angles.forEach((a,i)=>{const r=pcts[i]*R;i===0?ctx.moveTo(cx+r*Math.cos(a),cy+r*Math.sin(a)):ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));});
  ctx.closePath();ctx.fillStyle=grad;ctx.fill();ctx.strokeStyle='rgba(200,230,255,.6)';ctx.lineWidth=1.5;ctx.stroke();
  angles.forEach((a,i)=>{const r=pcts[i]*R;ctx.beginPath();ctx.arc(cx+r*Math.cos(a),cy+r*Math.sin(a),3.5,0,Math.PI*2);ctx.fillStyle=SCENES[i].color;ctx.fill();});
}

function renderDimBars(scenePcts){
  const container=document.getElementById('dimensionBars');if(!container)return;
  container.innerHTML='';
  SCENES.forEach(s=>{
    const pct=scenePcts[s.key]||30;
    const row=document.createElement('div');row.className='dim-row';
    row.innerHTML=`<span class="dim-label">${s.label}</span><div class="dim-bar-track"><div class="dim-bar-fill" data-pct="${pct}" style="background:${s.color}"></div></div><span class="dim-pct">${pct}%</span>`;
    container.appendChild(row);
  });
  requestAnimationFrame(()=>{ container.querySelectorAll('.dim-bar-fill').forEach(bar=>{ setTimeout(()=>{ bar.style.width=bar.dataset.pct+'%'; },100); }); });
}

btnStart.addEventListener('click',startQuiz);
btnConfirm.addEventListener('click',()=>{ if(qInput.value.trim())checkAnswer(false); });
btnSkip.addEventListener('click',()=>checkAnswer(true));
btnNext.addEventListener('click',nextQuestion);
btnRetake.addEventListener('click',()=>{ showScreen(screenIntro);navProgress.style.display='none'; });
btnStartLearn.addEventListener('click',()=>{ window.location.href='learn.html'; });
qInput.addEventListener('input',()=>{ btnConfirm.classList.toggle('ready',qInput.value.trim().length>0); });
qInput.addEventListener('keydown',e=>{
  if(e.key==='Enter'){
    if(qFeedback.classList.contains('visible'))nextQuestion();
    else if(qInput.value.trim())checkAnswer(false);
  }
});

document.addEventListener('DOMContentLoaded',()=>{ applyTheme(); initAllButtons(); });
