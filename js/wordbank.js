// wordbank.js — Foreign 词库
// 六维度：daily / spoken / workplace / academic / literary / idiom

export const WORDS = [
  // ── 日常词汇 daily ──────────────────────────────────────────
  { id:'d001', word:'cozy',     phonetic:'/ˈkoʊzi/',    meaning:'舒适的，温馨的',           dimension:'daily',     level:'A2', sentence:'She curled up in a ___ corner of the café with her book.',        translation:'她蜷缩在咖啡馆一个温馨的角落里看书。',      hint:'c___y' },
  { id:'d002', word:'damp',     phonetic:'/dæmp/',      meaning:'潮湿的，微湿的',           dimension:'daily',     level:'A2', sentence:'The towel was still ___ after hanging overnight.',                 translation:'毛巾挂了一夜还是潮的。',                     hint:'d___p' },
  { id:'d003', word:'clutter',  phonetic:'/ˈklʌtər/',   meaning:'杂乱，乱堆',               dimension:'daily',     level:'B1', sentence:'I need to ___ my desk before I can focus.',                      translation:'我需要清理桌子上的杂物才能集中注意力。',    hint:'cl____r' },
  { id:'d004', word:'simmer',   phonetic:'/ˈsɪmər/',    meaning:'小火慢炖，慢慢煨',         dimension:'daily',     level:'B1', sentence:'Let the soup ___ for twenty minutes before serving.',             translation:'汤上桌前小火煨二十分钟。',                   hint:'s_____r' },
  { id:'d005', word:'mundane',  phonetic:'/mʌnˈdeɪn/',  meaning:'平凡的，日常的',           dimension:'daily',     level:'B2', sentence:'Even the most ___ tasks can feel meaningful with the right mindset.', translation:'只要心态对，即使最平凡的事也充满意义。',   hint:'m_____e' },
  { id:'d006', word:'errand',   phonetic:'/ˈerənd/',    meaning:'差事，跑腿',               dimension:'daily',     level:'A2', sentence:'I have a few ___s to run before the weekend.',                   translation:'周末前我还有几件事要跑腿处理。',             hint:'e____d' },
  { id:'d007', word:'linger',   phonetic:'/ˈlɪŋɡər/',   meaning:'逗留，久久不散',           dimension:'daily',     level:'B1', sentence:'The smell of coffee ___ed in the kitchen all morning.',           translation:'咖啡的香气整个早晨都久久不散。',             hint:'l_____r' },
  { id:'d008', word:'stumble',  phonetic:'/ˈstʌmbəl/',  meaning:'绊倒，偶然发现',           dimension:'daily',     level:'B1', sentence:'I ___d upon a beautiful old bookstore while walking.',             translation:'我散步时偶然发现了一家漂亮的旧书店。',      hint:'s_____e' },
  { id:'d009', word:'glimpse',  phonetic:'/ɡlɪmps/',    meaning:'瞥见，一瞥',               dimension:'daily',     level:'B1', sentence:'She caught a ___ of the sunset through the trees.',               translation:'她透过树丛瞥见了夕阳。',                     hint:'g_____e' },
  { id:'d010', word:'pristine', phonetic:'/ˈprɪstiːn/', meaning:'一尘不染的，崭新的',       dimension:'daily',     level:'B2', sentence:'The kitchen was in ___ condition after the cleaning.',             translation:'打扫过后，厨房一尘不染。',                   hint:'p_____e' },

  // ── 口语表达 spoken ─────────────────────────────────────────
  { id:'s001', word:'vibe',      phonetic:'/vaɪb/',         meaning:'氛围，感觉',             dimension:'spoken', level:'A2', sentence:'This place has such a great ___ — I love coming here.',           translation:'这个地方氛围很棒，我喜欢来这里。',          hint:'v__e' },
  { id:'s002', word:'bail',      phonetic:'/beɪl/',         meaning:'临时放鸽子，退出',       dimension:'spoken', level:'B1', sentence:'Sorry, I have to ___ on tonight — something came up.',            translation:'抱歉，今晚我去不了了，临时有事。',          hint:'b__l' },
  { id:'s003', word:'vague',     phonetic:'/veɪɡ/',         meaning:'模糊的，不清楚的',       dimension:'spoken', level:'B1', sentence:'His answer was really ___ — I still don't know what he meant.',   translation:'他的回答很模糊，我还是不明白他的意思。',    hint:'v___e' },
  { id:'s004', word:'rant',      phonetic:'/rænt/',         meaning:'大发牢骚，抱怨连篇',     dimension:'spoken', level:'B1', sentence:'She went on a ___ about her commute for ten minutes.',            translation:'她抱怨了十分钟的通勤。',                     hint:'r__t' },
  { id:'s005', word:'awkward',   phonetic:'/ˈɔːkwərd/',    meaning:'尴尬的，别扭的',         dimension:'spoken', level:'A2', sentence:'There was an ___ silence after his joke.',                        translation:'他讲完笑话之后出现了一阵尴尬的沉默。',      hint:'a_____d' },
  { id:'s006', word:'binge',     phonetic:'/bɪndʒ/',       meaning:'狂看，大量消费',         dimension:'spoken', level:'B1', sentence:'I ___d three seasons of that show over the weekend.',             translation:'我周末一口气看完了那部剧的三季。',           hint:'b____e' },
  { id:'s007', word:'cringe',    phonetic:'/krɪndʒ/',      meaning:'尴尬得想缩起来',         dimension:'spoken', level:'B1', sentence:'I ___ every time I think about what I said.',                     translation:'每次想起我说的话我就尴尬得想钻地缝。',      hint:'c____e' },
  { id:'s008', word:'knack',     phonetic:'/næk/',         meaning:'窍门，天赋',             dimension:'spoken', level:'B2', sentence:'She has a real ___ for making people feel at ease.',              translation:'她很有让人放松的天赋。',                     hint:'k___k' },
  { id:'s009', word:'venting',   phonetic:'/ˈventɪŋ/',    meaning:'倾诉，发泄情绪',         dimension:'spoken', level:'B1', sentence:'Thanks for listening — I just needed to do some ___.',             translation:'谢谢你听我说，我只是需要发泄一下。',        hint:'v_____g' },
  { id:'s010', word:'sarcastic', phonetic:'/sɑːrˈkæstɪk/',meaning:'讽刺的，挖苦的',         dimension:'spoken', level:'B2', sentence:'"Oh great, another meeting," he said in a ___ tone.',              translation:'"哦太好了，又开会，"他用讽刺的语气说道。',hint:'s_______c' },

  // ── 职场词汇 workplace ──────────────────────────────────────
  { id:'w001', word:'delegate',    phonetic:'/ˈdelɪɡeɪt/',  meaning:'授权，委派任务',         dimension:'workplace', level:'B2', sentence:'A good manager knows when to ___ and when to step in.',         translation:'好的管理者知道何时授权，何时亲自介入。',    hint:'d_____e' },
  { id:'w002', word:'leverage',    phonetic:'/ˈlevərɪdʒ/',  meaning:'利用，发挥优势',         dimension:'workplace', level:'B2', sentence:'We can ___ our existing relationships to win this deal.',        translation:'我们可以利用现有的关系来拿下这个合同。',    hint:'l_____e' },
  { id:'w003', word:'bottleneck',  phonetic:'/ˈbɒtlnek/',   meaning:'瓶颈，障碍',             dimension:'workplace', level:'B2', sentence:'The approval process is a ___ that slows everything down.',      translation:'审批流程是一个让一切都变慢的瓶颈。',        hint:'b________k' },
  { id:'w004', word:'bandwidth',   phonetic:'/ˈbændwɪdθ/', meaning:'精力/时间余量（职场）',  dimension:'workplace', level:'B2', sentence:'I don\'t have the ___ to take on another project right now.',    translation:'我现在没有精力再接一个项目了。',             hint:'b_______h' },
  { id:'w005', word:'synergy',     phonetic:'/ˈsɪnərdʒi/', meaning:'协同效应，合力',         dimension:'workplace', level:'C1', sentence:'The merger created real ___ between the two teams.',             translation:'这次合并在两个团队之间产生了真正的协同效应。',hint:'s_____y' },
  { id:'w006', word:'proactive',   phonetic:'/proʊˈæktɪv/',meaning:'主动的，积极预防的',     dimension:'workplace', level:'B2', sentence:'Be ___ — don\'t wait for problems to find you.',               translation:'要主动出击，不要等问题找上门。',             hint:'p_______e' },
  { id:'w007', word:'escalate',    phonetic:'/ˈeskəleɪt/', meaning:'升级，上报',             dimension:'workplace', level:'B2', sentence:'If you can\'t resolve it, ___ to your manager.',               translation:'如果你解决不了，就上报给你的经理。',        hint:'e_____e' },
  { id:'w008', word:'stakeholder', phonetic:'/ˈsteɪkhoʊldər/',meaning:'利益相关方',          dimension:'workplace', level:'C1', sentence:'We need to align all ___s before making a final decision.',      translation:'在做最终决定之前，我们需要让所有利益相关方达成一致。',hint:'s_________r' },
  { id:'w009', word:'iterate',     phonetic:'/ˈɪtəreɪt/',  meaning:'迭代，反复改进',         dimension:'workplace', level:'B2', sentence:'We\'ll ___ on the design based on user feedback.',              translation:'我们会根据用户反馈对设计进行迭代。',        hint:'i_____e' },
  { id:'w010', word:'pivot',       phonetic:'/ˈpɪvət/',    meaning:'转型，转变方向',         dimension:'workplace', level:'B2', sentence:'After the market shifted, we had to ___ our strategy.',          translation:'市场转变之后，我们不得不调整策略方向。',    hint:'p___t' },

  // ── 学术词汇 academic ───────────────────────────────────────
  { id:'a001', word:'empirical',  phonetic:'/ɪmˈpɪrɪkəl/', meaning:'以实证为基础的',        dimension:'academic', level:'C1', sentence:'The study provides ___ evidence that sleep affects memory.',       translation:'该研究提供了睡眠影响记忆的实证证据。',      hint:'e_______l' },
  { id:'a002', word:'subsequent', phonetic:'/ˈsʌbsɪkwənt/',meaning:'随后的，后续的',         dimension:'academic', level:'C1', sentence:'___ studies confirmed the initial findings.',                      translation:'后续的研究证实了最初的发现。',               hint:'s________t' },
  { id:'a003', word:'ambiguous',  phonetic:'/æmˈbɪɡjuəs/', meaning:'模棱两可的，歧义的',    dimension:'academic', level:'B2', sentence:'The data remains ___ and open to interpretation.',                translation:'数据仍然模棱两可，有多种解读空间。',         hint:'a_______s' },
  { id:'a004', word:'correlate',  phonetic:'/ˈkɒrəleɪt/',  meaning:'相关联，有关联',         dimension:'academic', level:'B2', sentence:'Higher income does not always ___ with happiness.',               translation:'更高的收入并不总是与幸福感相关。',           hint:'c_______e' },
  { id:'a005', word:'paradigm',   phonetic:'/ˈpærədaɪm/',  meaning:'范式，思维框架',         dimension:'academic', level:'C1', sentence:'This discovery challenges the dominant ___ in the field.',         translation:'这一发现挑战了该领域的主流范式。',           hint:'p______m' },
  { id:'a006', word:'hypothesis', phonetic:'/haɪˈpɒθəsɪs/',meaning:'假设，假说',             dimension:'academic', level:'B2', sentence:'The experiment was designed to test the central ___.',             translation:'这个实验是为了验证核心假说而设计的。',      hint:'h________s' },
  { id:'a007', word:'nuance',     phonetic:'/ˈnjuːɑːns/',  meaning:'细微差别，微妙之处',    dimension:'academic', level:'C1', sentence:'The ___ of her argument was lost in translation.',                 translation:'她论点中的微妙之处在翻译中丢失了。',        hint:'n_____e' },
  { id:'a008', word:'coherent',   phonetic:'/koʊˈhɪərənt/',meaning:'连贯的，有逻辑的',       dimension:'academic', level:'C1', sentence:'A good essay needs a ___ argument from start to finish.',          translation:'一篇好文章需要从头到尾有连贯的论点。',      hint:'c_____t' },
  { id:'a009', word:'inherent',   phonetic:'/ɪnˈhɪərənt/', meaning:'内在的，固有的',         dimension:'academic', level:'C1', sentence:'There is an ___ tension between freedom and security.',            translation:'自由与安全之间存在内在的张力。',             hint:'i______t' },
  { id:'a010', word:'synthesis',  phonetic:'/ˈsɪnθəsɪs/',  meaning:'综合，合成',             dimension:'academic', level:'C1', sentence:'The conclusion offers a ___ of all the key arguments.',            translation:'结论对所有核心论点进行了综合梳理。',        hint:'s_______s' },

  // ── 文学词汇 literary ───────────────────────────────────────
  { id:'l001', word:'melancholy', phonetic:'/ˈmelənkɒli/', meaning:'忧郁，惆怅',              dimension:'literary', level:'C1', sentence:'A deep ___ settled over him as autumn arrived.',                  translation:'秋天到来时，一种深深的忧郁笼罩了他。',     hint:'m________y' },
  { id:'l002', word:'ethereal',   phonetic:'/ɪˈθɪəriəl/',  meaning:'空灵的，轻盈飘渺的',    dimension:'literary', level:'C1', sentence:'The morning mist gave the valley an ___ quality.',                translation:'晨雾赋予山谷一种空灵的气质。',              hint:'e______l' },
  { id:'l003', word:'solitude',   phonetic:'/ˈsɒlɪtjuːd/', meaning:'独处，孤独（非贬义）',  dimension:'literary', level:'B2', sentence:'She sought ___ in the mountains to clear her mind.',               translation:'她独自去山中寻找宁静，让思绪沉淀。',        hint:'s_______e' },
  { id:'l004', word:'ephemeral',  phonetic:'/ɪˈfemərəl/',  meaning:'短暂的，转瞬即逝的',    dimension:'literary', level:'C1', sentence:'Beauty is ___ — that\'s what makes it precious.',                  translation:'美是短暂的，这正是它珍贵的原因。',          hint:'e______l' },
  { id:'l005', word:'wistful',    phonetic:'/ˈwɪstfəl/',   meaning:'惆怅的，带着忧伤的渴望',dimension:'literary', level:'C1', sentence:'She gave a ___ smile, remembering better days.',                   translation:'她带着一丝惆怅微笑，想起了往昔更好的时光。',hint:'w_____l' },
  { id:'l006', word:'resilience', phonetic:'/rɪˈzɪliəns/', meaning:'韧性，恢复力',           dimension:'literary', level:'B2', sentence:'The character\'s ___ in the face of loss is inspiring.',           translation:'主人公面对失去时所展现的韧性令人动容。',    hint:'r________e' },
  { id:'l007', word:'luminous',   phonetic:'/ˈluːmɪnəs/',  meaning:'发光的，光辉的',         dimension:'literary', level:'C1', sentence:'Her ___ prose made even sadness feel beautiful.',                  translation:'她光辉的文笔让即使是悲伤也变得美丽。',     hint:'l______s' },
  { id:'l008', word:'foreboding', phonetic:'/fɔːrˈboʊdɪŋ/',meaning:'不祥的预感',             dimension:'literary', level:'C1', sentence:'A sense of ___ hung over the village before the storm.',           translation:'暴风雨来临前，一种不祥的预感笼罩着村庄。', hint:'f________g' },
  { id:'l009', word:'reverie',    phonetic:'/ˈrevəri/',    meaning:'白日梦，遐想',           dimension:'literary', level:'C1', sentence:'He lost himself in a pleasant ___ about the future.',               translation:'他陷入了对未来的美好遐想中，迷失其中。',    hint:'r_____e' },
  { id:'l010', word:'catharsis',  phonetic:'/kəˈθɑːrsɪs/', meaning:'净化，情感宣泄',         dimension:'literary', level:'C1', sentence:'Crying at films can provide a kind of emotional ___.',              translation:'看电影时哭泣可以带来一种情感上的净化。',    hint:'c_______s' },

  // ── 习语表达 idiom ──────────────────────────────────────────
  { id:'i001', word:'on the fence',                   phonetic:'/ɒn ðə fens/',        meaning:'举棋不定，摇摆不定',     dimension:'idiom', level:'B1', sentence:'I\'m still ___ about whether to take the job.',                  translation:'我还在犹豫要不要接受这份工作。',            hint:'on the f___e' },
  { id:'i002', word:'burn bridges',                   phonetic:'/bɜːrn ˈbrɪdʒɪz/',   meaning:'断绝关系，自断退路',     dimension:'idiom', level:'B2', sentence:'Don\'t ___ — you might need their help someday.',                 translation:'不要自断退路，你有朝一日可能还需要他们。', hint:'burn b_____s' },
  { id:'i003', word:'hit the nail on the head',       phonetic:'/hɪt ðə neɪl/',       meaning:'说得完全正确，一针见血', dimension:'idiom', level:'B2', sentence:'You really ___ with that observation.',                          translation:'你那个观察真的说得一针见血。',              hint:'hit the n___' },
  { id:'i004', word:'silver lining',                  phonetic:'/ˈsɪlvər ˈlaɪnɪŋ/', meaning:'黑暗中的一线希望',       dimension:'idiom', level:'B1', sentence:'Every cloud has a ___ — look for the good in this.',              translation:'黑暗中总有一线希望，试着找找好的一面。',    hint:'silver l_____g' },
  { id:'i005', word:'bite the bullet',                phonetic:'/baɪt ðə ˈbʊlɪt/',   meaning:'咬牙撑过，强忍着做',     dimension:'idiom', level:'B2', sentence:'I hate the dentist, but I\'ll have to ___ and go.',               translation:'我讨厌看牙医，但我不得不咬牙去一次。',      hint:'bite the b_____' },
  { id:'i006', word:'under the weather',              phonetic:'/ˈʌndər ðə ˈweðər/',meaning:'身体不舒服，有点不对劲', dimension:'idiom', level:'B1', sentence:'I\'m feeling a bit ___ today — I might skip the gym.',            translation:'我今天有点不舒服，可能不去健身房了。',      hint:'under the w_____r' },
  { id:'i007', word:'read between the lines',         phonetic:'/riːd bɪˌtwiːn ðə laɪnz/',meaning:'读出言外之意，看出潜台词',dimension:'idiom',level:'B2',sentence:'You have to ___ — she didn\'t say it directly.',              translation:'你得读出她的言外之意，她没有直接说。',      hint:'read between the l___s' },
  { id:'i008', word:'bite off more than you can chew',phonetic:'/baɪt ɒf mɔːr/',     meaning:'贪多嚼不烂',             dimension:'idiom', level:'B2', sentence:'I think I ___ taking on three projects at once.',                 translation:'我觉得我同时接三个项目是贪多嚼不烂了。',    hint:'bite off more than you can c___' },
  { id:'i009', word:'get cold feet',                  phonetic:'/ɡet koʊld fiːt/',   meaning:'临阵退缩，突然怯场',     dimension:'idiom', level:'B1', sentence:'He ___ right before the presentation and almost left.',             translation:'他在演讲前突然怯场，差点就走了。',          hint:'get cold f__t' },
  { id:'i010', word:'the tip of the iceberg',         phonetic:'/ðə tɪp əv ðə ˈaɪsbɜːrɡ/',meaning:'冰山一角',         dimension:'idiom', level:'B2', sentence:'These complaints are just ___; the real issues run deeper.',        translation:'这些投诉不过是冰山一角，真正的问题更深。',  hint:'the tip of the i_____g' },
];

export const DIMENSIONS = {
  daily:     { label:'日常词汇', color:'#7ec8e3', icon:'☀️' },
  spoken:    { label:'口语表达', color:'#f4a261', icon:'💬' },
  workplace: { label:'职场词汇', color:'#a8dadc', icon:'💼' },
  academic:  { label:'学术词汇', color:'#c77dff', icon:'📚' },
  literary:  { label:'文学词汇', color:'#ffb4a2', icon:'✒️' },
  idiom:     { label:'习语表达', color:'#b7e4c7', icon:'🌿' },
};

export const LEVEL_VOCAB = {
  A1:500, A2:1500, B1:3500, B2:6000, C1:10000, C2:16000,
};

export function getWordsByDimension(dim) { return WORDS.filter(w => w.dimension === dim); }
export function getWordById(id) { return WORDS.find(w => w.id === id); }
