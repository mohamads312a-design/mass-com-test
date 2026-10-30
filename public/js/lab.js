// Lab client: tracking, stage navigation, mission overlays. Included on every student page.
(function () {
  const qs = new URLSearchParams(location.search);
  const preview = qs.get('preview') === '1';
  const sid = localStorage.getItem('lab_sid');
  const lang = (preview && qs.get('lang')) || localStorage.getItem('lab_lang') || 'ar';
  const PAGES = { lobby: '/wait', alkhabar: '/sites/alkhabar', ledger: '/sites/ledger', viralvault: '/sites/viralvault', spot: '/spot', wrapped: '/wrapped' };
  const here = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  if (!sid && here !== '/' && !preview) { location.href = '/'; return; }

  const L = (o) => (o && typeof o === 'object' && ('ar' in o || 'en' in o)) ? (o[lang] ?? o.en) : o;
  const Lab = window.Lab = { sid, lang, L, site: document.body.dataset.site || '', view: 'home', state: null, dashboard: preview };
  document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  // preview mode (used by the projector heatmap) = no tracking, no popups
  if (Lab.dashboard) { Lab.log = () => {}; Lab.setView = () => {}; Lab.endView = () => {}; Lab.observe = () => {}; Lab.escape = {}; Lab.toast = () => {}; Lab.taskRunning = () => false; return; }

  // ---------------- socket + event buffer ----------------
  const buf = [];
  let socket = null;
  Lab.log = (type, data = {}) => { buf.push({ type, data, site: Lab.site, t: Date.now() }); };
  function flush() { if (socket && socket.connected && buf.length) socket.emit('ev', buf.splice(0, buf.length)); }
  setInterval(flush, 1000);
  addEventListener('pagehide', () => { Lab.endView(); flush(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { Lab.log('hidden'); flush(); } });
  setInterval(() => { if (!document.hidden && Lab.site) Lab.log('hb'); }, 5000);

  // ---------------- view + scroll depth ----------------
  let cur = null;
  Lab.setView = (v) => { if (Lab.task && Lab.task.active) Lab.task.views++; Lab.endView(); cur = { ...v, start: Date.now(), depth: 0 }; Lab.view = v.view; Lab.log('view', { view: v.view, id: v.id }); measure(); };
  Lab.endView = () => { if (!cur) return; measure(); Lab.log('viewend', { view: cur.view, kind: cur.kind, id: cur.id, words: cur.words || 0, ms: Date.now() - cur.start, depth: +cur.depth.toFixed(2) }); cur = null; };
  function measure() {
    if (!cur) return;
    let d;
    const el = cur.el && document.contains(cur.el) ? cur.el : null;
    if (el) { const r = el.getBoundingClientRect(); d = (innerHeight - r.top) / Math.max(1, r.height); }
    else d = (scrollY + innerHeight) / Math.max(1, document.documentElement.scrollHeight);
    cur.depth = Math.max(cur.depth, Math.min(1, Math.max(0, d)));
  }
  addEventListener('scroll', measure, { passive: true });

  // ---------------- taps ----------------
  Lab.task = { active: false };
  document.addEventListener('click', (e) => {
    if (e.target.closest('.lab-ui')) return;
    if (Lab.task.active) { Lab.task.taps++; if (!e.target.closest('a,button,input,select,label,[data-click],[data-t]')) Lab.task.dead++; }
    const dw = document.documentElement.clientWidth;
    const tEl = e.target.closest('[data-t]');
    Lab.log('tap', { x: +((e.pageX) / dw).toFixed(4), y: Math.round(e.pageY), dw, view: Lab.view, el: tEl ? tEl.dataset.t : e.target.tagName.toLowerCase(),
      inter: !!e.target.closest('a,button,input,select,label,[data-click],[data-t]') });
  }, true);

  // ---------------- ad impressions ----------------
  const adObs = new IntersectionObserver((ents) => ents.forEach(en => { if (en.isIntersecting && en.intersectionRatio > 0.4) { Lab.log("adseen", { id: en.target.dataset.ad }); adObs.unobserve(en.target); } }), { threshold: [0.4] });
  Lab.observe = () => document.querySelectorAll('[data-ad]:not([data-obs])').forEach(el => { el.dataset.obs = 1; adObs.observe(el); });
  new MutationObserver(() => Lab.observe()).observe(document.documentElement, { childList: true, subtree: true });

  // ---------------- stage handling ----------------
  const T = {
    mission: { ar: 'مهمة', en: 'Mission' }, answer: { ar: 'جاوب', en: 'Answer' }, giveUp: { ar: 'مش قادر', en: 'Give up' },
    done: { ar: 'تم ✓', en: 'Done ✓' }, send: { ar: 'ابعت', en: 'Submit' }, check: { ar: 'سؤال سريع', en: 'Quick check' },
    mood: { ar: 'المهمة في الموقع ده كانت سهلة ولا صعبة؟', en: 'Overall, how easy or difficult was the task on this site?' },
    hard: { ar: 'صعبة جدًا', en: 'Very difficult' }, easy: { ar: 'سهلة جدًا', en: 'Very easy' },
    ads: { ar: 'إيه أكتر حاجة عطّلتك؟', en: 'What slowed you down the most?' },
    blockers: { ar: ['النوافذ والإعلانات', 'مالقيتش اللي بدوّر عليه بسهولة', 'الصفحات المتقسمة', 'الزحمة والخط', 'ولا حاجة، كانت سهلة'], en: ['Pop-ups and ads', 'Couldn\'t find what I needed', 'Content split across pages', 'Clutter and text', 'Nothing, it was easy'] },
    thanks: { ar: 'شكرًا! كمّل تصفح 👀', en: 'Thanks! Keep browsing 👀' }, back: { ar: 'رجوع', en: 'Back' },
    escapeQ: { ar: 'اقفل تنبيهات الأخبار العاجلة في "ذا جلوبال ليدجر"', en: 'Turn off breaking-news alerts on The Global Ledger' },
    escapeDone: { ar: 'برافو! قفلت التنبيهات 🎉', en: 'Nice! Alerts turned off 🎉' }, choose: { ar: 'اختار إجابة', en: 'Choose an answer' },
    waitNext: { ar: 'استنى الدكتور…', en: 'Wait for your instructor…' },
  };
  Lab.T = T;
  const doneKey = (id) => 'lab_done_' + id;
  function applyState(st) {
    Lab.state = st;
    const target = PAGES[st.stage];
    if (target && target !== here) { Lab.endView(); flush(); setTimeout(() => location.href = target, 150); return; }
    const ov = st.overlay;
    if (ov && ov.site === Lab.site && !localStorage.getItem(doneKey(ov.id))) showOverlay(ov);
    else hideOverlay(ov && ov.id);
  }
  Lab.done = (id) => localStorage.setItem(doneKey(id), 1);

  function connect() {
    socket = io({ transports: ['websocket', 'polling'] });
    Lab.socket = socket;
    socket.on('connect', () => socket.emit('hello', { role: 'student', sid }));
    socket.on('state', applyState);
    socket.on('unknown', () => { localStorage.removeItem('lab_sid'); location.href = '/'; });
    socket.on('reset', () => { Object.keys(localStorage).filter(k => k.startsWith('lab_')).forEach(k => localStorage.removeItem(k)); location.href = '/'; });
  }
  if (window.io) connect(); else { const s = document.createElement('script'); s.src = '/socket.io/socket.io.js'; s.onload = connect; document.head.appendChild(s); }

  // ---------------- mission overlays ----------------
  const css = document.createElement('style');
  css.textContent = `
  .lab-ui{font-family:system-ui,-apple-system,"Segoe UI",Tahoma,sans-serif;direction:${lang === 'ar' ? 'rtl' : 'ltr'};-webkit-tap-highlight-color:transparent}
  .lab-bar{position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:2147483600;background:linear-gradient(135deg,#6d28d9,#db2777);color:#fff;border-radius:16px;padding:10px 12px;box-shadow:0 10px 30px rgba(109,40,217,.45);display:flex;gap:10px;align-items:center;animation:labIn .5s cubic-bezier(.2,1.4,.4,1)}
  .lab-bar .q{flex:1;font-size:14px;line-height:1.35;font-weight:600}.lab-bar small{display:block;opacity:.8;font-weight:500;font-size:11px;letter-spacing:.06em;text-transform:uppercase}
  .lab-bar .tm{font-variant-numeric:tabular-nums;font-size:12px;background:rgba(255,255,255,.2);padding:3px 7px;border-radius:99px}
  .lab-btn{border:0;border-radius:12px;padding:9px 12px;font-weight:700;font-size:14px;background:#fff;color:#6d28d9;cursor:pointer;font-family:inherit}
  .lab-btn.ghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.5);font-weight:600;padding:8px 10px;font-size:12px}
  .lab-sheet{position:fixed;inset:0;z-index:2147483601;background:rgba(15,8,30,.6);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;animation:labFade .25s}
  .lab-card{background:#fff;color:#1a1033;width:100%;max-width:520px;border-radius:24px 24px 0 0;padding:20px 18px calc(20px + env(safe-area-inset-bottom));max-height:88vh;overflow:auto;animation:labUp .35s cubic-bezier(.2,1,.3,1)}
  .lab-card h3{margin:0 0 4px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#7c3aed}.lab-card p.q{font-size:17px;font-weight:700;margin:4px 0 14px;line-height:1.4}
  .lab-opts{display:grid;gap:8px}.lab-opt{border:2px solid #ece6fb;border-radius:14px;padding:13px;font-size:16px;background:#faf8ff;text-align:start;font-family:inherit;color:inherit;cursor:pointer}
  .lab-opt.sel{border-color:#7c3aed;background:#f1eaff}
  .lab-moods{display:flex;justify-content:space-between;margin:6px 0 16px}.lab-moods button{font-size:34px;background:none;border:2px solid transparent;border-radius:16px;padding:4px 6px;cursor:pointer;transition:transform .15s}
  .lab-moods button.sel{border-color:#7c3aed;background:#f1eaff;transform:scale(1.15)}
  .lab-num{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 16px}.lab-num button{min-width:44px;padding:10px 0;border-radius:12px;border:2px solid #ece6fb;background:#faf8ff;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit;color:inherit}
  .lab-num button.sel{border-color:#7c3aed;background:#7c3aed;color:#fff}
  .lab-go{width:100%;margin-top:16px;padding:15px;border:0;border-radius:16px;background:linear-gradient(135deg,#6d28d9,#db2777);color:#fff;font-size:17px;font-weight:800;font-family:inherit;cursor:pointer}
  .lab-go:disabled{opacity:.35}
  .lab-toast{position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:2147483602;background:#1a1033;color:#fff;padding:12px 18px;border-radius:99px;font-weight:700;animation:labIn .4s cubic-bezier(.2,1.4,.4,1);font-size:15px;white-space:nowrap}
  .lab-sec{font-size:14px;font-weight:700;margin:8px 0 4px}
  @keyframes labIn{from{transform:translateY(30px) scale(.9);opacity:0}}
  body.lab-has-bar .sticky,body.lab-has-bar .cookie,body.lab-has-bar .ck,body.lab-has-bar .nl{bottom:78px!important}body.lab-has-bar{padding-bottom:80px}@keyframes labUp{from{transform:translateY(100%)}}@keyframes labFade{from{opacity:0}}`;
  document.head.appendChild(css);

  let ovEl = null, ovId = null, timerInt = null;
  Lab.toast = (msg, ms = 2200) => { const t = document.createElement('div'); t.className = 'lab-ui lab-toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), ms); };
  function hideOverlay(keepId) { if (ovEl && ovId !== keepId) { ovEl.remove(); ovEl = null; ovId = null; clearInterval(timerInt); document.body.classList.remove('lab-has-bar'); } }
  Lab.taskRunning = () => !!(ovId && ovId.startsWith('task'));

  function showOverlay(ov) {
    if (ovId === ov.id) return;
    hideOverlay(); ovId = ov.id;
    const M = (window.MISSION || {})[ov.type];
    if (!M) return;
    if (ov.type === 'task') return showTask(ov, M);
    return showCheck(ov, M);
  }

  function showTask(ov, M) {
    const start = Date.now();
    Lab.task = { active: true, taps: 0, views: 0, dead: 0 };
    const bar = document.createElement('div'); bar.className = 'lab-ui lab-bar';
    const isEscape = M.escape;
    bar.innerHTML = `<div class="q"><small>🎯 ${L(T.mission)} · <span class="tm">0s</span></small>${L(isEscape ? T.escapeQ : M.q)}</div>` +
      (isEscape ? `<button class="lab-btn ghost" data-a="give">${L(T.giveUp)}</button>` : `<button class="lab-btn" data-a="ans">${L(T.answer)}</button>`);
    document.body.appendChild(bar); ovEl = bar; document.body.classList.add('lab-has-bar');
    timerInt = setInterval(() => { const s = Math.round((Date.now() - start) / 1000); bar.querySelector('.tm').textContent = s + 's'; }, 1000);
    const finish = () => { Lab.task.active = false; Lab.done(ov.id); hideOverlay(); };
    const eff = () => ({ steps: Lab.task.taps, views: Lab.task.views, dead: Lab.task.dead });
    if (isEscape) {
      Lab.escape = { active: true, start, steps: 0, ov: ov.id };
      bar.querySelector('[data-a=give]').onclick = () => { Lab.log('escape', { done: false, gaveUp: true, ms: Date.now() - start, ...eff() }); Lab.escape.active = false; finish(); };
      Lab.escapeComplete = () => { if (!Lab.escape.active) return; Lab.escape.active = false; Lab.log('escape', { done: true, ms: Date.now() - start, ...eff() }); flush(); Lab.toast(L(T.escapeDone)); finish(); };
      return;
    }
    bar.querySelector('[data-a=ans]').onclick = () => {
      const sh = document.createElement('div'); sh.className = 'lab-ui lab-sheet';
      const choices = L(M.choices);
      sh.innerHTML = `<div class="lab-card"><h3>🎯 ${L(T.mission)}</h3><p class="q">${L(M.q)}</p><div class="lab-opts">${choices.map((c, i) => `<button class="lab-opt" data-i="${i}"><bdi>${c}</bdi></button>`).join('')}</div>
      <button class="lab-go" disabled>${L(T.send)}</button><button class="lab-btn" style="width:100%;margin-top:8px;background:#f4f1fb" data-a="back">${L(T.back)}</button>
      <button class="lab-btn" style="width:100%;margin-top:4px;background:none;color:#888;font-weight:500" data-a="give">${L(T.giveUp)}</button></div>`;
      document.body.appendChild(sh);
      let sel = null;
      sh.querySelectorAll('.lab-opt').forEach(b => b.onclick = () => { sh.querySelectorAll('.lab-opt').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sel = +b.dataset.i; sh.querySelector('.lab-go').disabled = false; });
      sh.querySelector('[data-a=back]').onclick = () => sh.remove();
      sh.querySelector('[data-a=give]').onclick = () => { Lab.log('task', { gaveUp: true, correct: false, ms: Date.now() - start, ...eff() }); sh.remove(); finish(); };
      sh.querySelector('.lab-go').onclick = () => { Lab.log('task', { answer: sel, correct: sel === M.correct, ms: Date.now() - start, ...eff() }); flush(); sh.remove(); finish(); Lab.toast(L(T.thanks)); };
    };
  }

  function showCheck(ov, M) {
    const sh = document.createElement('div'); sh.className = 'lab-ui lab-sheet'; ovEl = sh;
    const bl = L(T.blockers);
    sh.innerHTML = `<div class="lab-card"><h3>⚡ ${L(T.check)}</h3>
      <div class="lab-sec">${L(T.mood)}</div>
      <div class="lab-num" style="flex-wrap:nowrap;justify-content:space-between">${[1, 2, 3, 4, 5, 6, 7].map(n => `<button data-m="${n}" style="min-width:0;flex:1">${n}</button>`).join('')}</div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#7a6c99;margin:-10px 2px 16px"><span>${L(T.hard)}</span><span>${L(T.easy)}</span></div>
      <div class="lab-sec">${L(T.ads)}</div><div class="lab-opts">${bl.map((c, i) => `<button class="lab-opt" data-i="${i}"><bdi>${c}</bdi></button>`).join('')}</div>
      <button class="lab-go" disabled>${L(T.send)}</button></div>`;
    document.body.appendChild(sh);
    const v = { seq: null, i: null };
    const upd = () => sh.querySelector('.lab-go').disabled = !(v.seq && v.i != null);
    sh.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { sh.querySelectorAll('[data-m]').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); v.seq = +b.dataset.m; upd(); });
    sh.querySelectorAll('.lab-opt').forEach(b => b.onclick = () => { sh.querySelectorAll('.lab-opt').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); v.i = +b.dataset.i; upd(); });
    sh.querySelector('.lab-go').onclick = () => {
      Lab.log('check', { seq: v.seq, blocker: v.i });
      Lab.log('mood', { seq: v.seq }); flush();
      Lab.done(ov.id); hideOverlay(); Lab.toast(L(T.thanks));
    };
  }
})();
