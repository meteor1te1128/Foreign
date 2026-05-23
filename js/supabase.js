// js/supabase.js — Supabase 客户端初始化
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://foreign.kevin68654926.workers.dev';
const SUPABASE_KEY = 'sb_publishable_ZpGltCRTU8pQFjDb4iNC6Q_4EoaLXz3';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
