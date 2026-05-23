// wordbank.js — Foreign词库 v2
// 六维度 × ~33词 ≈ 200词，按难度A1→C2分层
// 维度: daily | emotion | nature | abstract | social | academic

export const DIMENSIONS = {
  daily:    { label: '日常生活', color: '#3b82f6', icon: '☕' },
  emotion:  { label: '情感心理', color: '#f9a8d4', icon: '💭' },
  nature:   { label: '自然世界', color: '#86efac', icon: '🌿' },
  abstract: { label: '抽象概念', color: '#818cf8', icon: '✦' },
  social:   { label: '社交场景', color: '#fb923c', icon: '🗣' },
  academic: { label: '学术书面', color: '#6ee7b7', icon: '📖' },
};

// 难度等级: 1=A1, 2=A2, 3=B1, 4=B2, 5=C1, 6=C2
export const WORDS = [

  // ── DAILY 日常生活 ──────────────────────────────────────────────
  { id:'d001', dim:'daily', level:1, word:'breakfast', phonetic:'/ˈbrekfəst/', zh:'早餐',
    example:'I have breakfast at seven every morning.', exZh:'我每天七点吃早餐。' },
  { id:'d002', dim:'daily', level:1, word:'commute', phonetic:'/kəˈmjuːt/', zh:'通勤',
    example:'The commute to work takes about forty minutes.', exZh:'上班通勤大约需要四十分钟。' },
  { id:'d003', dim:'daily', level:1, word:'groceries', phonetic:'/ˈɡroʊsəriz/', zh:'杂货/食材',
    example:'She picks up groceries on the way home.', exZh:'她在回家路上买了食材。' },
  { id:'d004', dim:'daily', level:1, word:'laundry', phonetic:'/ˈlɔːndri/', zh:'洗衣',
    example:'I do laundry every Sunday afternoon.', exZh:'我每周日下午洗衣服。' },
  { id:'d005', dim:'daily', level:1, word:'errand', phonetic:'/ˈɛrənd/', zh:'差事/跑腿',
    example:'I need to run a few errands before noon.', exZh:'我中午之前要跑几个差事。' },
  { id:'d006', dim:'daily', level:2, word:'clutter', phonetic:'/ˈklʌtər/', zh:'杂乱堆积',
    example:'The desk was covered in clutter.', exZh:'桌子上堆满了杂物。' },
  { id:'d007', dim:'daily', level:2, word:'appliance', phonetic:'/əˈplaɪəns/', zh:'家电',
    example:'The kitchen appliances need replacing.', exZh:'厨房家电需要更换了。' },
  { id:'d008', dim:'daily', level:2, word:'budget', phonetic:'/ˈbʌdʒɪt/', zh:'预算',
    example:'We need to stick to our monthly budget.', exZh:'我们需要坚守月度预算。' },
  { id:'d009', dim:'daily', level:2, word:'routine', phonetic:'/ruːˈtiːn/', zh:'日常惯例',
    example:'A morning routine helps you start the day well.', exZh:'晨间惯例能让你更好地开始一天。' },
  { id:'d010', dim:'daily', level:3, word:'renovate', phonetic:'/ˈrɛnəveɪt/', zh:'翻新装修',
    example:'They plan to renovate the kitchen next year.', exZh:'他们计划明年翻新厨房。' },
  { id:'d011', dim:'daily', level:3, word:'overdue', phonetic:'/ˌoʊvərˈdjuː/', zh:'逾期的/迟该做的',
    example:'This dentist visit is long overdue.', exZh:'这次看牙拖了太久了。' },
  { id:'d012', dim:'daily', level:3, word:'hassle', phonetic:'/ˈhæsəl/', zh:'麻烦事',
    example:'Parking downtown is such a hassle.', exZh:'在市中心停车真是麻烦。' },
  { id:'d013', dim:'daily', level:3, word:'utilities', phonetic:'/juːˈtɪlɪtiz/', zh:'水电煤账单',
    example:'Utilities include electricity, gas, and water.', exZh:'水电费包括电、气和水费。' },
  { id:'d014', dim:'daily', level:4, word:'declutter', phonetic:'/diːˈklʌtər/', zh:'整理清空',
    example:'She spent the weekend decluttering her wardrobe.', exZh:'她花了整个周末整理衣橱。' },
  { id:'d015', dim:'daily', level:4, word:'insomnia', phonetic:'/ɪnˈsɒmniə/', zh:'失眠',
    example:'Stress at work triggered his insomnia.', exZh:'工作压力引发了他的失眠。' },
  { id:'d016', dim:'daily', level:4, word:'sedentary', phonetic:'/ˈsɛdənteri/', zh:'久坐不动的',
    example:'A sedentary lifestyle increases health risks.', exZh:'久坐不动的生活方式会增加健康风险。' },
  { id:'d017', dim:'daily', level:5, word:'meticulous', phonetic:'/mɪˈtɪkjʊləs/', zh:'一丝不苟的',
    example:'He is meticulous about keeping records.', exZh:'他在记录方面一丝不苟。' },
  { id:'d018', dim:'daily', level:5, word:'frugal', phonetic:'/ˈfruːɡəl/', zh:'节俭的',
    example:'Living frugally allowed her to retire early.', exZh:'节俭生活让她得以提前退休。' },
  { id:'d019', dim:'daily', level:5, word:'procrastinate', phonetic:'/prəˈkræstɪneɪt/', zh:'拖延',
    example:'Stop procrastinating and just start.', exZh:'别再拖延了，直接开始吧。' },
  { id:'d020', dim:'daily', level:6, word:'quotidian', phonetic:'/kwəˈtɪdiən/', zh:'日常平凡的(书面)',
    example:'She found beauty in the quotidian moments of life.', exZh:'她在生活的日常琐事中发现了美。' },

  // ── EMOTION 情感心理 ────────────────────────────────────────────
  { id:'e001', dim:'emotion', level:1, word:'nervous', phonetic:'/ˈnɜːrvəs/', zh:'紧张的',
    example:'I was nervous before the presentation.', exZh:'演讲前我很紧张。' },
  { id:'e002', dim:'emotion', level:1, word:'relieved', phonetic:'/rɪˈliːvd/', zh:'如释重负的',
    example:'She felt relieved after hearing the good news.', exZh:'听到好消息后她如释重负。' },
  { id:'e003', dim:'emotion', level:1, word:'frustrated', phonetic:'/ˈfrʌstreɪtɪd/', zh:'沮丧的',
    example:'He felt frustrated when the plan failed.', exZh:'计划失败时他感到沮丧。' },
  { id:'e004', dim:'emotion', level:2, word:'overwhelmed', phonetic:'/ˌoʊvərˈwɛlmd/', zh:'不堪重负的',
    example:'She felt overwhelmed by all the deadlines.', exZh:'她被一堆截止日期压得喘不过气。' },
  { id:'e005', dim:'emotion', level:2, word:'nostalgic', phonetic:'/nɒˈstælʤɪk/', zh:'怀旧的',
    example:'Old songs always make me nostalgic.', exZh:'老歌总让我怀旧。' },
  { id:'e006', dim:'emotion', level:2, word:'envious', phonetic:'/ˈɛnviəs/', zh:'羡慕的',
    example:'I am envious of her confidence.', exZh:'我很羡慕她的自信。' },
  { id:'e007', dim:'emotion', level:3, word:'apprehensive', phonetic:'/ˌæprɪˈhɛnsɪv/', zh:'忧虑的',
    example:'She was apprehensive about moving abroad.', exZh:'她对出国移居感到忧虑。' },
  { id:'e008', dim:'emotion', level:3, word:'elated', phonetic:'/ɪˈleɪtɪd/', zh:'欣喜若狂的',
    example:'The team was elated after winning.', exZh:'获胜后团队欣喜若狂。' },
  { id:'e009', dim:'emotion', level:3, word:'resentful', phonetic:'/rɪˈzɛntfʊl/', zh:'愤愤不平的',
    example:'He felt resentful about being overlooked.', exZh:'被忽视让他感到愤愤不平。' },
  { id:'e010', dim:'emotion', level:3, word:'vulnerable', phonetic:'/ˈvʌlnərəbəl/', zh:'脆弱的',
    example:'Sharing feelings can feel vulnerable.', exZh:'分享感受有时会让人感到脆弱。' },
  { id:'e011', dim:'emotion', level:4, word:'ambivalent', phonetic:'/æmˈbɪvələnt/', zh:'矛盾的/态度两可',
    example:'I feel ambivalent about leaving this job.', exZh:'对于离职，我心情很矛盾。' },
  { id:'e012', dim:'emotion', level:4, word:'despondent', phonetic:'/dɪˈspɒndənt/', zh:'沮丧绝望的',
    example:'After weeks of rejection, he grew despondent.', exZh:'几周被拒后他越来越绝望。' },
  { id:'e013', dim:'emotion', level:4, word:'exasperated', phonetic:'/ɪɡˈzæspəreɪtɪd/', zh:'极度恼怒的',
    example:'She was exasperated by the repeated delays.', exZh:'一再拖延让她极为恼火。' },
  { id:'e014', dim:'emotion', level:5, word:'disillusionment', phonetic:'/ˌdɪsɪˈluːʒənmənt/', zh:'幻灭感',
    example:'His disillusionment with politics grew over time.', exZh:'他对政治的幻灭感与日俱增。' },
  { id:'e015', dim:'emotion', level:5, word:'equanimity', phonetic:'/ˌɛkwəˈnɪmɪti/', zh:'内心平静',
    example:'She faced the crisis with remarkable equanimity.', exZh:'她以惊人的内心平静面对危机。' },
  { id:'e016', dim:'emotion', level:5, word:'cathartic', phonetic:'/kəˈθɑːrtɪk/', zh:'宣泄的/净化心灵的',
    example:'Crying during a film can be cathartic.', exZh:'在电影中哭泣有时能宣泄情绪。' },
  { id:'e017', dim:'emotion', level:6, word:'melancholy', phonetic:'/ˈmɛlənkɒli/', zh:'忧郁',
    example:'A gentle melancholy settled over the empty house.', exZh:'一种淡淡的忧郁笼罩着空荡的房子。' },
  { id:'e018', dim:'emotion', level:6, word:'ineffable', phonetic:'/ɪnˈɛfəbəl/', zh:'难以言喻的',
    example:'The view was filled with ineffable sadness.', exZh:'那景色充满了难以言喻的悲伤。' },

  // ── NATURE 自然世界 ─────────────────────────────────────────────
  { id:'n001', dim:'nature', level:1, word:'breeze', phonetic:'/briːz/', zh:'微风',
    example:'A cool breeze came through the window.', exZh:'一阵凉风从窗户吹进来。' },
  { id:'n002', dim:'nature', level:1, word:'horizon', phonetic:'/həˈraɪzən/', zh:'地平线',
    example:'The sun sank below the horizon.', exZh:'太阳沉到了地平线以下。' },
  { id:'n003', dim:'nature', level:1, word:'meadow', phonetic:'/ˈmɛdoʊ/', zh:'草地',
    example:'Children played in the wide meadow.', exZh:'孩子们在宽阔的草地上玩耍。' },
  { id:'n004', dim:'nature', level:2, word:'canopy', phonetic:'/ˈkænəpi/', zh:'(树)冠层',
    example:'Sunlight filtered through the forest canopy.', exZh:'阳光透过林冠层洒落下来。' },
  { id:'n005', dim:'nature', level:2, word:'glacier', phonetic:'/ˈɡleɪʃər/', zh:'冰川',
    example:'The glacier has retreated significantly.', exZh:'冰川已经大幅退缩了。' },
  { id:'n006', dim:'nature', level:2, word:'dusk', phonetic:'/dʌsk/', zh:'黄昏',
    example:'The sky turned orange at dusk.', exZh:'黄昏时天空变成了橙色。' },
  { id:'n007', dim:'nature', level:2, word:'estuary', phonetic:'/ˈɛstʃueri/', zh:'河口',
    example:'Migratory birds flock to the estuary.', exZh:'候鸟成群来到河口。' },
  { id:'n008', dim:'nature', level:3, word:'drought', phonetic:'/draʊt/', zh:'干旱',
    example:'The drought lasted three months.', exZh:'干旱持续了三个月。' },
  { id:'n009', dim:'nature', level:3, word:'sediment', phonetic:'/ˈsɛdɪmənt/', zh:'沉积物',
    example:'Sediment collected at the bottom of the river.', exZh:'沉积物在河底堆积。' },
  { id:'n010', dim:'nature', level:3, word:'bioluminescence', phonetic:'/ˌbaɪoʊˌluːmɪˈnɛsəns/', zh:'生物发光',
    example:'The bioluminescence lit up the night sea.', exZh:'生物发光照亮了夜晚的海面。' },
  { id:'n011', dim:'nature', level:3, word:'solstice', phonetic:'/ˈsɒlstɪs/', zh:'至日(夏至/冬至)',
    example:'The summer solstice is the longest day.', exZh:'夏至是一年中最长的一天。' },
  { id:'n012', dim:'nature', level:4, word:'permafrost', phonetic:'/ˈpɜːrməfrɒst/', zh:'永冻土',
    example:'Permafrost is thawing due to climate change.', exZh:'由于气候变化，永冻土正在融化。' },
  { id:'n013', dim:'nature', level:4, word:'tundra', phonetic:'/ˈtʌndrə/', zh:'苔原/冻原',
    example:'Few trees grow on the Arctic tundra.', exZh:'北极苔原上几乎没有树木生长。' },
  { id:'n014', dim:'nature', level:4, word:'equinox', phonetic:'/ˈiːkwɪnɒks/', zh:'春分/秋分',
    example:'Day and night are equal at the equinox.', exZh:'春分和秋分时昼夜等长。' },
  { id:'n015', dim:'nature', level:5, word:'ephemeral', phonetic:'/ɪˈfɛmərəl/', zh:'短暂的(自然界常用)',
    example:'Cherry blossoms are ephemeral and precious.', exZh:'樱花短暂而珍贵。' },
  { id:'n016', dim:'nature', level:5, word:'phosphorescent', phonetic:'/ˌfɒsfəˈrɛsənt/', zh:'磷光的',
    example:'The phosphorescent waves glowed in the dark.', exZh:'磷光海浪在黑暗中发光。' },
  { id:'n017', dim:'nature', level:6, word:'petrichor', phonetic:'/ˈpɛtrɪkɔːr/', zh:'雨后泥土的气息',
    example:'The petrichor after the storm was calming.', exZh:'暴雨后泥土的气息令人平静。' },
  { id:'n018', dim:'nature', level:6, word:'syzygy', phonetic:'/ˈsɪzɪdʒi/', zh:'朔望(日月地三点一线)',
    example:'A syzygy occurs during a solar eclipse.', exZh:'日食发生时，日月地三点一线。' },

  // ── ABSTRACT 抽象概念 ───────────────────────────────────────────
  { id:'a001', dim:'abstract', level:1, word:'progress', phonetic:'/ˈprɒɡrɛs/', zh:'进步',
    example:'We made good progress today.', exZh:'我们今天取得了很大进步。' },
  { id:'a002', dim:'abstract', level:1, word:'freedom', phonetic:'/ˈfriːdəm/', zh:'自由',
    example:'Freedom means different things to different people.', exZh:'自由对不同的人意味着不同的东西。' },
  { id:'a003', dim:'abstract', level:2, word:'integrity', phonetic:'/ɪnˈtɛɡrɪti/', zh:'诚信/正直',
    example:'She acted with integrity under pressure.', exZh:'她在压力下仍保持诚信。' },
  { id:'a004', dim:'abstract', level:2, word:'ambiguity', phonetic:'/ˌæmbɪˈɡjuːɪti/', zh:'模糊性/歧义',
    example:'The contract had too much ambiguity.', exZh:'合同存在太多歧义。' },
  { id:'a005', dim:'abstract', level:2, word:'consensus', phonetic:'/kənˈsɛnsəs/', zh:'共识',
    example:'The team reached a consensus quickly.', exZh:'团队迅速达成了共识。' },
  { id:'a006', dim:'abstract', level:3, word:'paradigm', phonetic:'/ˈpærədaɪm/', zh:'范式/思维模式',
    example:'This discovery shifted the scientific paradigm.', exZh:'这一发现改变了科学范式。' },
  { id:'a007', dim:'abstract', level:3, word:'resilience', phonetic:'/rɪˈzɪliəns/', zh:'韧性/恢复力',
    example:'Resilience is the ability to bounce back from failure.', exZh:'韧性是从失败中恢复的能力。' },
  { id:'a008', dim:'abstract', level:3, word:'nuance', phonetic:'/ˈnjuːɑːns/', zh:'细微差别',
    example:'The nuance of the argument was lost in translation.', exZh:'论点的细微差别在翻译中丢失了。' },
  { id:'a009', dim:'abstract', level:3, word:'mortality', phonetic:'/mɔːˈtælɪti/', zh:'必死性/死亡率',
    example:'Facing illness made him aware of his mortality.', exZh:'面对疾病让他意识到自己终有一死。' },
  { id:'a010', dim:'abstract', level:4, word:'subjectivity', phonetic:'/ˌsʌbdʒɛkˈtɪvɪti/', zh:'主观性',
    example:'Art is defined by its subjectivity.', exZh:'艺术以其主观性为特征。' },
  { id:'a011', dim:'abstract', level:4, word:'dichotomy', phonetic:'/daɪˈkɒtəmi/', zh:'二元对立',
    example:'The false dichotomy of work and life.', exZh:'工作与生活的虚假二元对立。' },
  { id:'a012', dim:'abstract', level:4, word:'abstraction', phonetic:'/æbˈstrækʃən/', zh:'抽象化',
    example:'Math relies heavily on abstraction.', exZh:'数学在很大程度上依赖于抽象化。' },
  { id:'a013', dim:'abstract', level:5, word:'ontology', phonetic:'/ɒnˈtɒlədʒi/', zh:'本体论(存在之学)',
    example:'Ontology asks what truly exists.', exZh:'本体论研究什么真正存在。' },
  { id:'a014', dim:'abstract', level:5, word:'hegemony', phonetic:'/hɪˈdʒɛməni/', zh:'霸权',
    example:'Cultural hegemony shapes what we see as normal.', exZh:'文化霸权塑造了我们对"正常"的认知。' },
  { id:'a015', dim:'abstract', level:5, word:'liminal', phonetic:'/ˈlɪmɪnəl/', zh:'临界的/过渡期的',
    example:'Graduation is a liminal moment between two lives.', exZh:'毕业是两段人生之间的临界时刻。' },
  { id:'a016', dim:'abstract', level:6, word:'aporia', phonetic:'/əˈpɔːriə/', zh:'无从解决的困境(哲学)',
    example:'The philosopher was stuck in an aporia.', exZh:'哲学家陷入了无从解决的困境。' },
  { id:'a017', dim:'abstract', level:6, word:'teleology', phonetic:'/ˌtɛliˈɒlədʒi/', zh:'目的论',
    example:'Teleology explains events by their purpose.', exZh:'目的论通过事物的目的来解释事件。' },

  // ── SOCIAL 社交场景 ─────────────────────────────────────────────
  { id:'s001', dim:'social', level:1, word:'introduce', phonetic:'/ˌɪntrəˈdjuːs/', zh:'介绍',
    example:'Let me introduce you to my friend.', exZh:'让我介绍你认识我的朋友。' },
  { id:'s002', dim:'social', level:1, word:'invitation', phonetic:'/ˌɪnvɪˈteɪʃən/', zh:'邀请',
    example:'I received an invitation to the party.', exZh:'我收到了派对邀请。' },
  { id:'s003', dim:'social', level:2, word:'acquaintance', phonetic:'/əˈkweɪntəns/', zh:'熟人',
    example:'He is an acquaintance, not a close friend.', exZh:'他是个熟人，不是亲密朋友。' },
  { id:'s004', dim:'social', level:2, word:'awkward', phonetic:'/ˈɔːkwərd/', zh:'尴尬的',
    example:'There was an awkward silence at dinner.', exZh:'晚餐时有一段尴尬的沉默。' },
  { id:'s005', dim:'social', level:2, word:'gossip', phonetic:'/ˈɡɒsɪp/', zh:'八卦/闲话',
    example:'Office gossip can damage trust.', exZh:'办公室八卦会损害信任。' },
  { id:'s006', dim:'social', level:3, word:'mediate', phonetic:'/ˈmiːdieɪt/', zh:'调解',
    example:'She agreed to mediate between the two sides.', exZh:'她同意在双方之间进行调解。' },
  { id:'s007', dim:'social', level:3, word:'reciprocate', phonetic:'/rɪˈsɪprəkeɪt/', zh:'回报/互惠',
    example:'He helped me, and I wanted to reciprocate.', exZh:'他帮了我，我也想回报他。' },
  { id:'s008', dim:'social', level:3, word:'confrontation', phonetic:'/ˌkɒnfrʌnˈteɪʃən/', zh:'对峙/冲突',
    example:'She avoided any confrontation with her boss.', exZh:'她避免与老板发生任何冲突。' },
  { id:'s009', dim:'social', level:3, word:'empathy', phonetic:'/ˈɛmpəθi/', zh:'共情/同理心',
    example:'Good leaders show empathy for their teams.', exZh:'好的领导者会对团队展现同理心。' },
  { id:'s010', dim:'social', level:4, word:'condescending', phonetic:'/ˌkɒndɪˈsɛndɪŋ/', zh:'居高临下的',
    example:'His tone came across as condescending.', exZh:'他的语气显得居高临下。' },
  { id:'s011', dim:'social', level:4, word:'aloof', phonetic:'/əˈluːf/', zh:'冷漠疏远的',
    example:'She seemed aloof at first but was warm later.', exZh:'她一开始显得冷漠，后来却很热情。' },
  { id:'s012', dim:'social', level:4, word:'persuasion', phonetic:'/pərˈsweɪʒən/', zh:'说服',
    example:'Gentle persuasion worked better than pressure.', exZh:'温和的说服比施压更有效。' },
  { id:'s013', dim:'social', level:4, word:'ostracize', phonetic:'/ˈɒstrəsaɪz/', zh:'排斥/排挤',
    example:'They ostracized him after the scandal.', exZh:'丑闻之后他被大家排挤。' },
  { id:'s014', dim:'social', level:5, word:'charisma', phonetic:'/kəˈrɪzmə/', zh:'个人魅力',
    example:'Her charisma drew people to her instantly.', exZh:'她的个人魅力让人对她一见如故。' },
  { id:'s015', dim:'social', level:5, word:'sycophant', phonetic:'/ˈsɪkəfænt/', zh:'马屁精',
    example:'Surrounded by sycophants, he lost touch with reality.', exZh:'被马屁精包围，他脱离了现实。' },
  { id:'s016', dim:'social', level:5, word:'deference', phonetic:'/ˈdɛfərəns/', zh:'顺从/尊重权威',
    example:'She showed deference to her elders.', exZh:'她对长辈表示尊重顺从。' },
  { id:'s017', dim:'social', level:6, word:'machination', phonetic:'/ˌmækɪˈneɪʃən/', zh:'阴谋诡计',
    example:'The coup was the result of years of machination.', exZh:'这场政变是多年阴谋诡计的结果。' },
  { id:'s018', dim:'social', level:6, word:'obsequious', phonetic:'/əbˈsiːkwiəs/', zh:'卑躬屈膝的',
    example:'His obsequious manner irritated everyone.', exZh:'他卑躬屈膝的态度让所有人反感。' },

  // ── ACADEMIC 学术书面 ───────────────────────────────────────────
  { id:'ac001', dim:'academic', level:2, word:'hypothesis', phonetic:'/haɪˈpɒθɪsɪs/', zh:'假设',
    example:'The researchers tested their hypothesis.', exZh:'研究人员检验了他们的假设。' },
  { id:'ac002', dim:'academic', level:2, word:'methodology', phonetic:'/ˌmɛθəˈdɒlədʒi/', zh:'方法论',
    example:'The methodology was clearly explained.', exZh:'方法论被清晰地阐明了。' },
  { id:'ac003', dim:'academic', level:2, word:'correlation', phonetic:'/ˌkɒrəˈleɪʃən/', zh:'相关性',
    example:'Correlation does not imply causation.', exZh:'相关性不等于因果关系。' },
  { id:'ac004', dim:'academic', level:3, word:'empirical', phonetic:'/ɪmˈpɪrɪkəl/', zh:'实证的/经验的',
    example:'The study provides empirical evidence.', exZh:'该研究提供了实证证据。' },
  { id:'ac005', dim:'academic', level:3, word:'inference', phonetic:'/ˈɪnfərəns/', zh:'推断',
    example:'The detective drew a quick inference.', exZh:'侦探迅速作出推断。' },
  { id:'ac006', dim:'academic', level:3, word:'synthesis', phonetic:'/ˈsɪnθɪsɪs/', zh:'综合/合成',
    example:'Good writing requires synthesis of ideas.', exZh:'好的写作需要综合各种观点。' },
  { id:'ac007', dim:'academic', level:3, word:'abstract', phonetic:'/ˈæbstrækt/', zh:'摘要',
    example:'Read the abstract before the full paper.', exZh:'读正文前先看摘要。' },
  { id:'ac008', dim:'academic', level:4, word:'epistemology', phonetic:'/ɪˌpɪstɪˈmɒlədʒi/', zh:'认识论',
    example:'Epistemology studies the nature of knowledge.', exZh:'认识论研究知识的本质。' },
  { id:'ac009', dim:'academic', level:4, word:'rhetoric', phonetic:'/ˈrɛtərɪk/', zh:'修辞(学)',
    example:'His speech was full of political rhetoric.', exZh:'他的演讲充满了政治修辞。' },
  { id:'ac010', dim:'academic', level:4, word:'dissertation', phonetic:'/ˌdɪsəˈteɪʃən/', zh:'论文(博士)',
    example:'She spent three years on her dissertation.', exZh:'她花了三年写博士论文。' },
  { id:'ac011', dim:'academic', level:4, word:'critique', phonetic:'/krɪˈtiːk/', zh:'评论/批判',
    example:'The critique raised important questions.', exZh:'该评论提出了重要问题。' },
  { id:'ac012', dim:'academic', level:5, word:'hermeneutics', phonetic:'/ˌhɜːrməˈnjuːtɪks/', zh:'解释学/诠释学',
    example:'Hermeneutics focuses on text interpretation.', exZh:'解释学专注于文本诠释。' },
  { id:'ac013', dim:'academic', level:5, word:'dialectic', phonetic:'/ˌdaɪəˈlɛktɪk/', zh:'辩证法',
    example:'Hegel developed a famous dialectic framework.', exZh:'黑格尔发展出著名的辩证法框架。' },
  { id:'ac014', dim:'academic', level:5, word:'positivism', phonetic:'/ˈpɒzɪtɪvɪzəm/', zh:'实证主义',
    example:'Positivism relies on observable facts.', exZh:'实证主义依赖可观察的事实。' },
  { id:'ac015', dim:'academic', level:6, word:'episteme', phonetic:'/ˈɛpɪstiːm/', zh:'知识型(福柯)',
    example:'Foucault used the concept of episteme.', exZh:'福柯使用了知识型这一概念。' },
  { id:'ac016', dim:'academic', level:6, word:'exegesis', phonetic:'/ˌɛksɪˈdʒiːsɪs/', zh:'经文注疏/详细解读',
    example:'The scholar produced a careful exegesis.', exZh:'学者进行了细致的经文注疏。' },
];

// 按维度分组
export function getByDimension(dim) {
  return WORDS.filter(w => w.dim === dim);
}

// 按难度等级获取
export function getByLevel(level) {
  return WORDS.filter(w => w.level === level);
}

// 获取维度统计（用于雷达图）
export function getDimStats(cards = {}) {
  const stats = {};
  for (const dim of Object.keys(DIMENSIONS)) {
    const words = getByDimension(dim);
    const total = words.length;
    let learned = 0, mastered = 0;
    for (const w of words) {
      const card = cards[w.id];
      if (!card) continue;
      if (card.stability >= 1) learned++;
      if (card.stability >= 21) mastered++;
    }
    stats[dim] = { total, learned, mastered, pct: total ? learned / total : 0 };
  }
  return stats;
}

// 获取薄弱维度（学习率最低的）
export function getWeakDimensions(cards = {}) {
  const stats = getDimStats(cards);
  return Object.entries(stats)
    .sort((a, b) => a[1].pct - b[1].pct)
    .slice(0, 3)
    .map(([dim]) => dim);
}

// 按id查找
export function getWordById(id) {
  return WORDS.find(w => w.id === id);
}

export const TOTAL = WORDS.length;
