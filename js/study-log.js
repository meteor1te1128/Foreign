// ── 学习日志记录 (加入 learn.js 的结算逻辑里) ──────────────────────
// 在每轮学习结束时调用 recordStudyLog(count)
// count = 本次学习的词数

export function recordStudyLog(count) {
  if (!count || count <= 0) return;
  const key = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const log = JSON.parse(localStorage.getItem('fg_study_log') || '{}');
  log[key] = (log[key] || 0) + count;
  localStorage.setItem('fg_study_log', JSON.stringify(log));
}

// 获取今日学习词数
export function getTodayCount() {
  const key = new Date().toISOString().slice(0, 10);
  const log = JSON.parse(localStorage.getItem('fg_study_log') || '{}');
  return log[key] || 0;
}

// 获取过去N天的学习记录 (用于首页统计)
export function getRecentLog(days = 30) {
  const log = JSON.parse(localStorage.getItem('fg_study_log') || '{}');
  const result = {};
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result[key] = log[key] || 0;
  }
  return result;
}
