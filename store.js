/**
 * store.js —— 云端存储层（Supabase）
 *
 * ⚠️ 使用前需要完成（详见 README）：
 *   1. 用 GitHub 账号登录 https://supabase.com 新建免费项目
 *   2. 把下面的 SUPABASE_URL 和 SUPABASE_ANON_KEY 填成你自己的
 *   3. 在 SQL Editor 执行 README 里的建表语句（profiles 表）
 *   4. 关闭邮箱确认（项目 → Authentication → Sign In / Providers → Email →
 *      「Confirm email」关掉），这样注册后不用收验证邮件
 */
(function (root) {
  'use strict';

  // ====== 在这里填入你的 Supabase 项目信息 ======
  var SUPABASE_URL = 'https://rptrxhdkqpjmfgjoxpnt.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdHJ4aGRrcXBqbWZnam94cG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxOTczODcsImV4cCI6MjEwMjc3MzM4N30.jzxVwLD-ufFNEBrt1NXTIthn0h6O6zJgLu_aERCArc4';
  // ==============================================

  var sb = null;
  function client() {
    if (!sb && root.supabase && SUPABASE_URL.indexOf('YOUR-PROJECT') === -1) {
      sb = root.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return sb;
  }
  function fail() {
    return Promise.reject(new Error('Supabase 未配置：请先在 store.js 填入项目 URL 和 anon key'));
  }

  // ---------- 认证 ----------
  function getSession() {
    var c = client();
    if (!c) return fail();
    return c.auth.getSession().then(function (r) {
      return r.data.session ? r.data.session.user : null;
    });
  }
  function signUp(email, pass, username) {
    var c = client();
    if (!c) return fail();
    return c.auth.signUp({
      email: email,
      password: pass,
      options: { data: { username: username } }
    });
  }
  function signIn(email, pass) {
    var c = client();
    if (!c) return fail();
    return c.auth.signInWithPassword({ email: email, password: pass });
  }
  function signOut() {
    var c = client();
    if (!c) return fail();
    return c.auth.signOut();
  }

  // ---------- 资料 / 排行榜 ----------
  function ensureProfile(user) {
    var c = client();
    var name = (user.user_metadata && user.user_metadata.username) ||
               (user.email || 'player').split('@')[0];
    var rec = { id: user.id, username: name, best_score: 0, unlocked: { '1': true } };
    if (!c) return Promise.resolve(rec);
    return Promise.resolve(c.from('profiles').upsert(rec, { onConflict: 'id' }).select().single())
      .then(function (res) { return (res && res.data) || rec; });
  }
  function loadProfile(userId) {
    var c = client();
    if (!c) return Promise.resolve(null);
    return Promise.resolve(c.from('profiles').select('id, username, best_score, unlocked').eq('id', userId).maybeSingle())
      .then(function (res) { return (res && res.data) || null; });
  }
  // 注意：update/save 返回的查询构建器只是 thenable（没有 .catch），
  // 必须用 Promise.resolve 包成标准 Promise，否则调用端 .catch 会报错
  function updateBest(userId, score) {
    var c = client();
    if (!c) return Promise.resolve();
    return Promise.resolve(c.from('profiles').update({ best_score: score }).eq('id', userId));
  }
  function saveUnlocked(userId, unlocked) {
    var c = client();
    if (!c) return Promise.resolve();
    return Promise.resolve(c.from('profiles').update({ unlocked: unlocked }).eq('id', userId));
  }
  function loadBoard() {
    var c = client();
    if (!c) return Promise.resolve([]);
    return Promise.resolve(c.from('profiles').select('username, best_score').order('best_score', { ascending: false }).limit(50))
      .then(function (res) { return (res && res.data) || []; });
  }

  // ---------- 工具 ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  root.shalong_store = {
    // 认证
    getSession: getSession,
    signUp: signUp,
    signIn: signIn,
    signOut: signOut,
    // 数据
    ensureProfile: ensureProfile,
    loadProfile: loadProfile,
    updateBest: updateBest,
    saveUnlocked: saveUnlocked,
    loadBoard: loadBoard,
    // 工具
    esc: esc
  };
})(window);