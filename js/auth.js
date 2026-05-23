// js/auth.js — 注册 / 登录 / 登出 / 云端数据同步
import { supabase } from './supabase.js';

// ── 工具：用户名转假邮箱 ──────────────────────────────────
function toEmail(username) {
  return `${username.toLowerCase().trim()}@foreign.app`;
}

// ── 注册 ──────────────────────────────────────────────────
// 返回 { ok: true } 或 { ok: false, msg: '...' }
export async function register(username, password) {
  if (!username || !password) return { ok: false, msg: '请填写用户名和密码' };
  if (username.length < 2)    return { ok: false, msg: '用户名至少2个字符' };
  if (password.length < 6)    return { ok: false, msg: '密码至少6位' };
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username))
    return { ok: false, msg: '用户名只能含字母、数字、下划线、中文' };

  const email = toEmail(username);

  // 先检查用户名是否已存在
  const { data: existing } = await supabase
    .from('user_data')
    .select('username')
    .eq('username', username)
    .maybeSingle();
  if (existing) return { ok: false, msg: '用户名已被使用' };

  // Supabase Auth 注册
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    if (error.message.includes('already registered'))
      return { ok: false, msg: '用户名已被使用' };
    return { ok: false, msg: error.message };
  }

  const uid = data.user?.id;
  if (!uid) return { ok: false, msg: '注册失败，请重试' };

  // 写入 user_data 表（初始空数据）
  const { error: dbErr } = await supabase.from('user_data').insert({
    id: uid,
    username,
    cards_json: {},
    wrong_json: {},
    study_log_json: {},
    streak: 0,
    last_study_day: '',
    theme: localStorage.getItem('fg_theme') || 'ocean',
  });
  if (dbErr) return { ok: false, msg: '数据初始化失败: ' + dbErr.message };

  // 把用户名存本地，方便显示
  localStorage.setItem('fg_user', username);
  return { ok: true };
}

// ── 登录 ──────────────────────────────────────────────────
export async function login(username, password) {
  if (!username || !password) return { ok: false, msg: '请填写用户名和密码' };

  const email = toEmail(username);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.includes('Invalid login'))
      return { ok: false, msg: '用户名或密码错误' };
    return { ok: false, msg: error.message };
  }

  // 从云端拉取数据覆盖本地
  await pullFromCloud();
  localStorage.setItem('fg_user', username);
  return { ok: true };
}

// ── 登出 ──────────────────────────────────────────────────
export async function logout() {
  await supabase.auth.signOut();
  // 清除本地用户相关数据（保留主题）
  const theme = localStorage.getItem('fg_theme');
  localStorage.clear();
  if (theme) localStorage.setItem('fg_theme', theme);
}

// ── 获取当前登录用户 ──────────────────────────────────────
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

// ── 从云端拉取数据 → 写入 localStorage ───────────────────
export async function pullFromCloud() {
  const user = await getCurrentUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('id', user.id)
    .single();
  if (error || !data) return;

  if (data.cards_json)     localStorage.setItem('fg_cards',          JSON.stringify(data.cards_json));
  if (data.wrong_json)     localStorage.setItem('fg_wrong',          JSON.stringify(data.wrong_json));
  if (data.study_log_json) localStorage.setItem('fg_study_log',      JSON.stringify(data.study_log_json));
  if (data.streak != null) localStorage.setItem('fg_streak',         String(data.streak));
  if (data.last_study_day) localStorage.setItem('fg_last_study_day', data.last_study_day);
  if (data.theme)          localStorage.setItem('fg_theme',          data.theme);
  if (data.username)       localStorage.setItem('fg_user',           data.username);
}

// ── 把本地数据推送到云端 ──────────────────────────────────
export async function pushToCloud() {
  const user = await getCurrentUser();
  if (!user) return;

  const cards    = JSON.parse(localStorage.getItem('fg_cards')     || '{}');
  const wrong    = JSON.parse(localStorage.getItem('fg_wrong')     || '{}');
  const studyLog = JSON.parse(localStorage.getItem('fg_study_log') || '{}');
  const streak   = parseInt(localStorage.getItem('fg_streak')      || '0');
  const lastDay  = localStorage.getItem('fg_last_study_day')       || '';
  const theme    = localStorage.getItem('fg_theme')                || 'ocean';

  await supabase.from('user_data').upsert({
    id: user.id,
    cards_json: cards,
    wrong_json: wrong,
    study_log_json: studyLog,
    streak,
    last_study_day: lastDay,
    theme,
    updated_at: new Date().toISOString(),
  });
}

// ── 自动定时同步（每5分钟推一次）────────────────────────
export function startAutoSync() {
  setInterval(async () => {
    const user = await getCurrentUser();
    if (user) await pushToCloud();
  }, 5 * 60 * 1000);

  // 页面关闭/切换时也推一次
  window.addEventListener('beforeunload', () => {
    getCurrentUser().then(user => { if (user) pushToCloud(); });
  });
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden') {
      const user = await getCurrentUser();
      if (user) await pushToCloud();
    }
  });
}
