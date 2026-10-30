// Turns raw interaction events into per-student metrics, personas and class aggregates.
const SITES = ['alkhabar', 'ledger', 'viralvault'];
const WPM = { ar: 170, en: 220 };

const PERSONAS = {
  deep:      { emoji: '📖', en: 'The Deep Reader',          ar: 'القارئ اللي بيغوص' },
  skimmer:   { emoji: '🏃', en: 'The Skimmer',              ar: 'بتاع السكرول السريع' },
  clickbait: { emoji: '🎣', en: 'The Clickbait Catch',      ar: 'صيد العناوين المثيرة' },
  guardian:  { emoji: '🧐', en: 'The Careful One',          ar: 'الحريص' },
  speedrun:  { emoji: '⚡', en: 'The Speedrunner',          ar: 'اللي بيعدّي على طول' },
  ninja:     { emoji: '🥷', en: 'The Popup Ninja',          ar: 'نينجا البوب أب' },
  magnet:    { emoji: '🫣', en: 'The Mis-Tapper',           ar: 'اللي بيدوس بالغلط' },
  bouncer:   { emoji: '🚪', en: 'The Bouncer',              ar: 'اللي بيهرب بسرعة' },
  hunter:    { emoji: '🎯', en: 'The Mission Hunter',       ar: 'صياد المهام' },
};

const avg = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const pct = (n, d) => d ? Math.round((n / d) * 100) : 0;
const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const last = (a) => a[a.length - 1];

function rageCount(taps) {
  // 3+ taps within 900ms and 45px of each other = one rage tap burst
  let bursts = 0, i = 0;
  const s = taps.slice().sort((a, b) => a.t - b.t);
  while (i < s.length) {
    let j = i + 1;
    while (j < s.length && s[j].t - s[j - 1].t < 450 &&
      Math.hypot((s[j].data.x - s[i].data.x) * (s[i].data.dw || 390), s[j].data.y - s[i].data.y) < 45) j++;
    if (j - i >= 3) { bursts++; i = j; } else i++;
  }
  return bursts;
}

function analyzeStudent(st, evs) {
  const by = (type, site) => evs.filter(e => e.type === type && (!site || e.site === site));
  const m = { sid: st.sid, name: st.name, lang: st.lang, sites: {} };

  // ---- per site ----
  for (const site of SITES) {
    const taps = by('tap', site);
    const views = by('viewend', site);
    const arts = views.filter(v => v.data.kind === 'article');
    const check = last(by('check', site));
    const adsSeen = new Set(by('adseen', site).map(e => e.data.id)).size;
    m.sites[site] = {
      timeS: by('hb', site).length * 5,
      adsSeen,
      adTaps: by('adtap', site).length + by('interstitial', site).filter(e => e.data.action === 'adtap').length + by('video', site).filter(e => e.data.action === 'adtap').length,
      rage: rageCount(taps),
      deadTaps: taps.filter(t => !t.data.inter).length,
      taps: taps.length,
      articles: arts.length,
      bounces: arts.filter(a => a.data.ms < 8000 && a.data.depth < 0.3).length,
      mood: check ? (check.data.seq ?? check.data.mood) : null,
      blocker: check ? check.data.blocker : null,
      adsReported: check ? check.data.adsReported : null,
      popupCorrect: check ? !!check.data.popupCorrect : null,
      visited: by('hb', site).length > 0 || views.length > 0,
    };
  }

  // ---- reading ----
  const arts = by('viewend').filter(v => v.data.kind === 'article' && v.data.words > 0);
  const reads = arts.map(a => {
    const expected = (a.data.words / (WPM[st.lang] || 200)) * 60000;
    const ratio = a.data.ms / expected;
    return { ratio, depth: a.data.depth || 0, read: a.data.depth >= 0.75 && ratio >= 0.45, ms: a.data.ms };
  });
  m.reading = {
    opened: arts.length,
    read: reads.filter(r => r.read).length,
    skimmed: reads.filter(r => !r.read).length,
    avgDepth: Math.round((avg(reads.map(r => Math.min(1, r.depth))) || 0) * 100),
    avgRatio: +(avg(reads.map(r => Math.min(2, r.ratio))) || 0).toFixed(2),
  };
  const fi = by('feed').map(e => e.data.count || 0);
  m.feedItems = fi.length ? Math.max(...fi) : 0;

  // ---- headlines ----
  const hl = by('headline');
  m.headlines = {
    clickbait: hl.filter(h => h.data.kind === 'clickbait').length,
    serious: hl.filter(h => h.data.kind === 'serious').length,
    sponsored: hl.filter(h => h.data.kind === 'sponsored').length,
    ids: hl.map(h => h.data.id),
    cats: hl.reduce((o, h) => { if (h.data.cat) o[h.data.cat] = (o[h.data.cat] || 0) + 1; return o; }, {}),
  };

  // ---- privacy ----
  m.cookies = by('cookie').map(e => ({ site: e.site, choice: e.data.choice, ms: e.data.ms, opened: !!e.data.opened }));
  const firstCookie = m.cookies[0];
  m.cookieFirstMs = firstCookie ? firstCookie.ms : null;
  m.cookieAvgMs = avg(m.cookies.map(c => c.ms));
  m.cookieAccepts = m.cookies.filter(c => c.choice === 'accept').length;
  const n = last(by('notif')); m.notif = n ? n.data.choice : null;
  const nl = last(by('newsletter')); m.newsletter = nl ? { action: nl.data.action, ms: nl.data.ms } : null;
  m.alertsOff = by('escape').some(e => e.data.done);

  // ---- ads & popups ----
  const inter = by('interstitial');
  const ic = inter.find(e => e.data.action === 'close');
  m.interstitialMs = ic ? ic.data.ms : null;
  m.interstitialAdTaps = inter.filter(e => e.data.action === 'adtap').length;
  const vid = by('video');
  const skip = vid.find(e => e.data.action === 'skip');
  m.videoSkipAt = skip ? skip.data.at : (vid.find(e => e.data.action === 'complete') ? 'full' : null);
  const pw = last(by('paywall')); m.paywall = pw ? pw.data.action : null;
  const scam = last(by('scam')); m.scam = scam ? scam.data.action : null;
  m.adTaps = SITES.reduce((s, k) => s + m.sites[k].adTaps, 0);
  m.adsSeen = SITES.reduce((s, k) => s + m.sites[k].adsSeen, 0);
  m.rage = SITES.reduce((s, k) => s + m.sites[k].rage, 0);
  m.deadTaps = SITES.reduce((s, k) => s + m.sites[k].deadTaps, 0);
  m.taps = by('tap').length;
  m.timeS = SITES.reduce((s, k) => s + m.sites[k].timeS, 0);

  // ---- missions ----
  m.tasks = {};
  for (const site of ['alkhabar', 'viralvault']) {
    const t = last(by('task', site));
    m.tasks[site] = t ? { correct: !!t.data.correct, ms: t.data.ms, gaveUp: !!t.data.gaveUp } : null;
  }
  const esc = by('escape');
  const escDone = esc.find(e => e.data.done);
  const escLast = last(esc);
  m.escape = escDone ? { done: true, ms: escDone.data.ms, steps: escDone.data.steps } :
    escLast ? { done: false, ms: escLast.data.ms, steps: escLast.data.steps, gaveUp: !!escLast.data.gaveUp } : null;
  const sp = last(by('spot'));
  m.spot = sp ? { hits: sp.data.hits, misses: sp.data.misses, falseAlarms: sp.data.falseAlarms, totalAds: sp.data.totalAds,
    score: clamp(Math.round(((sp.data.hits - sp.data.falseAlarms * 0.5) / (sp.data.totalAds || 1)) * 100)) } : null;

  // ---- recall (ad blindness) ----
  const recalls = SITES.map(s => m.sites[s]).filter(x => x.adsReported != null);
  m.recall = recalls.length ? { reported: recalls.reduce((a, b) => a + b.adsReported, 0), actual: recalls.reduce((a, b) => a + b.adsSeen, 0) } : null;

  // ---- say vs do ----
  m.sayDo = SITES.filter(s => m.sites[s].mood != null).map(s => ({ site: s, mood: m.sites[s].mood, rage: m.sites[s].rage, adTaps: m.sites[s].adTaps }));
  m.contradiction = m.sayDo.find(x => x.mood >= 4 && (x.rage >= 1 || x.adTaps >= 2)) || null;

  // ---- usability ----
  const tk = (e) => e ? { ok: !!(e.data.correct || e.data.done), ms: e.data.ms, steps: e.data.steps || 0, views: e.data.views || 0, dead: e.data.dead || 0, gaveUp: !!e.data.gaveUp } : null;
  const escOk = by('escape').find(e => e.data.done);
  m.task = { alkhabar: tk(last(by('task', 'alkhabar'))), ledger: tk(escOk || last(by('escape'))), viralvault: tk(last(by('task', 'viralvault'))) };
  const tl = Object.values(m.task).filter(Boolean);
  m.taskSuccess = tl.length ? Math.round(tl.filter(t => t.ok).length / tl.length * 100) : null;
  m.taskAvgS = tl.filter(t => t.ok).length ? Math.round(avg(tl.filter(t => t.ok).map(t => t.ms)) / 1000) : null;
  m.taskAvgSteps = tl.length ? Math.round(avg(tl.map(t => t.steps))) : null;
  const lost = { alkhabar: 0, ledger: 0, viralvault: 0 };
  by('cookie').forEach(e => lost[e.site] = (lost[e.site] || 0) + (e.data.ms || 0));
  by('interstitial').filter(e => e.data.action === 'close').forEach(e => lost[e.site] += e.data.ms || 0);
  by('newsletter').forEach(e => lost[e.site] += e.data.ms || 0);
  by('notif').forEach(e => lost[e.site] += e.data.ms || 0);
  by('video').filter(e => e.data.action !== 'adtap').forEach(e => lost[e.site] += (e.data.at || 0) * 1000);
  by('scam').forEach(() => lost.alkhabar += 3000);
  m.lostS = Object.fromEntries(Object.entries(lost).map(([k, v]) => [k, Math.round(v / 1000)]));
  m.lostTotalS = Object.values(m.lostS).reduce((a, b) => a + b, 0);
  m.seqAvg = (() => { const q = SITES.map(k => m.sites[k].mood).filter(x => x != null); return q.length ? +(avg(q)).toFixed(1) : null; })();
  m.blockers = SITES.map(k => m.sites[k].blocker).filter(x => x != null);
  m.contradiction = SITES.map(site => ({ site, mood: m.sites[site].mood, rage: m.sites[site].rage, adTaps: m.sites[site].adTaps, failed: m.task[site] && !m.task[site].ok }))
    .find(x => x.mood != null && x.mood >= 6 && (x.rage >= 1 || x.failed || x.adTaps >= 1)) || null;

  // ---- scores (0-100) ----
  let priv = 50, pn = 0;
  for (const c of m.cookies) { priv += c.choice === 'accept' ? -12 : 15; pn++; }
  if (m.notif) priv += m.notif === 'allow' ? -15 : 15;
  if (m.newsletter) priv += m.newsletter.action === 'subscribe' ? -15 : 8;
  m.scores = {
    privacy: clamp(Math.round(priv)),
    reading: clamp(Math.round(m.reading.avgDepth * 0.5 + Math.min(1, m.reading.avgRatio) * 50)),
    clickbait: clamp(pct(m.headlines.clickbait + m.headlines.sponsored, hl.length)),
    adResistance: clamp(100 - m.adTaps * 20 - (m.scam === 'claim' ? 30 : 0)),
    patience: clamp(100 - m.rage * 20 - m.deadTaps * 2),
  };

  // ---- personas ----
  const fastClose = [m.interstitialMs, m.newsletter && m.newsletter.action !== 'subscribe' ? m.newsletter.ms : null].filter(x => x != null);
  const sc = {
    deep: m.reading.opened ? (m.reading.read / m.reading.opened) * 0.6 + (m.reading.avgDepth / 100) * 0.4 : 0,
    skimmer: m.reading.opened >= 2 ? (m.reading.skimmed / m.reading.opened) * 0.7 + (1 - Math.min(1, m.reading.avgRatio)) * 0.3 : 0,
    clickbait: hl.length >= 2 ? (m.headlines.clickbait + m.headlines.sponsored) / hl.length : 0,
    guardian: (m.cookies.length || m.notif) ? m.scores.privacy / 100 : 0,
    speedrun: m.cookies.length ? (m.cookieAccepts / m.cookies.length) * (m.cookieAvgMs != null && m.cookieAvgMs < 2500 ? 1 : 0.55) : 0,
    ninja: fastClose.length ? avg(fastClose.map(ms => ms < 2500 ? 1 : ms < 5000 ? 0.5 : 0.1)) * 0.75 + (typeof m.videoSkipAt === 'number' && m.videoSkipAt <= 6 ? 0.25 : 0) : 0,
    magnet: Math.min(1, m.adTaps / 3) * 0.9 + (m.scam === 'claim' ? 0.1 : 0),
    bouncer: m.reading.opened ? Math.min(1, SITES.reduce((s, k) => s + m.sites[k].bounces, 0) / Math.max(1, m.reading.opened)) * 0.8 : 0,
    hunter: ((m.tasks.alkhabar?.correct ? 1 : 0) + (m.tasks.viralvault?.correct ? 1 : 0) + (m.escape?.done ? 1 : 0) + (m.spot ? m.spot.score / 100 : 0)) / 4 * 0.85,
  };
  const ranked = Object.entries(sc).sort((a, b) => b[1] - a[1]);
  m.personaScores = sc;
  m.persona = { id: ranked[0][1] > 0 ? ranked[0][0] : 'skimmer', ...PERSONAS[ranked[0][1] > 0 ? ranked[0][0] : 'skimmer'] };
  m.persona2 = ranked[1] && ranked[1][1] > 0.25 ? { id: ranked[1][0], ...PERSONAS[ranked[1][0]] } : null;

  // ---- advertiser profile (what a real ad network would infer) ----
  const tags = [];
  const cats = Object.entries(m.headlines.cats).sort((a, b) => b[1] - a[1]).slice(0, 2).map(x => x[0]);
  if (cats.length) tags.push({ k: 'interests', v: cats });
  if (m.scores.clickbait >= 50) tags.push({ k: 'impulsive' });
  if (m.cookieAccepts && m.scores.privacy < 45) tags.push({ k: 'lowPrivacy' });
  if (m.scores.privacy >= 70) tags.push({ k: 'privacyAware' });
  if (m.adTaps >= 1) tags.push({ k: 'adResponsive' });
  if (m.scam === 'claim') tags.push({ k: 'promoSusceptible' });
  if (m.reading.opened && m.reading.avgRatio < 0.45) tags.push({ k: 'shortAttention' });
  if (m.reading.avgDepth >= 75) tags.push({ k: 'engagedReader' });
  if (m.newsletter?.action === 'subscribe' || m.notif === 'allow') tags.push({ k: 'reachable' });
  if (m.rage >= 2) tags.push({ k: 'frustrated' });
  if (m.paywall === 'subscribe') tags.push({ k: 'payer' });
  m.adProfile = tags;
  return m;
}

function analyze(db) {
  const groups = {};
  for (const e of db.events) (groups[e.sid] = groups[e.sid] || []).push(e);
  const students = Object.values(db.students).map(st => analyzeStudent(st, groups[st.sid] || []));
  const active = students.filter(s => s.taps > 0 || s.timeS > 0);
  const N = active.length;
  const A = {};

  // privacy
  const allCookies = active.flatMap(s => s.cookies.map(c => ({ ...c, name: s.name, sid: s.sid })));
  A.cookies = {
    total: allCookies.length,
    accept: pct(allCookies.filter(c => c.choice === 'accept').length, allCookies.length),
    reject: pct(allCookies.filter(c => c.choice === 'reject').length, allCookies.length),
    custom: pct(allCookies.filter(c => c.choice === 'custom').length, allCookies.length),
    openedSettings: pct(allCookies.filter(c => c.opened).length, allCookies.length),
    avgMs: Math.round(avg(allCookies.map(c => c.ms)) || 0),
    race: active.filter(s => s.cookieFirstMs != null).map(s => ({ name: s.name, ms: s.cookieFirstMs, choice: s.cookies[0].choice })).sort((a, b) => a.ms - b.ms),
    bySite: Object.fromEntries(SITES.map(site => { const c = allCookies.filter(x => x.site === site); return [site, { accept: pct(c.filter(x => x.choice === 'accept').length, c.length), n: c.length }]; })),
  };
  const nots = active.filter(s => s.notif);
  A.notif = { n: nots.length, allow: pct(nots.filter(s => s.notif === 'allow').length, nots.length), allowNames: nots.filter(s => s.notif === 'allow').map(s => s.name) };
  const nls = active.filter(s => s.newsletter);
  A.newsletter = { n: nls.length, subscribe: pct(nls.filter(s => s.newsletter.action === 'subscribe').length, nls.length),
    decline: pct(nls.filter(s => s.newsletter.action === 'decline').length, nls.length), close: pct(nls.filter(s => s.newsletter.action === 'close').length, nls.length) };

  // ads
  const inter = active.filter(s => s.interstitialMs != null);
  A.ads = {
    interstitialAvgMs: Math.round(avg(inter.map(s => s.interstitialMs)) || 0),
    interstitialRace: inter.map(s => ({ name: s.name, ms: s.interstitialMs })).sort((a, b) => a.ms - b.ms),
    accidental: pct(active.filter(s => s.interstitialAdTaps > 0).length, inter.length || N),
    adTappers: active.filter(s => s.adTaps > 0).map(s => ({ name: s.name, n: s.adTaps })).sort((a, b) => b.n - a.n),
    totalAdTaps: active.reduce((a, s) => a + s.adTaps, 0),
    video: { atSkip: active.filter(s => typeof s.videoSkipAt === 'number' && s.videoSkipAt <= 6).length,
      late: active.filter(s => typeof s.videoSkipAt === 'number' && s.videoSkipAt > 6).length,
      full: active.filter(s => s.videoSkipAt === 'full').length },
    scamClaim: active.filter(s => s.scam === 'claim').map(s => s.name),
    paywall: ['subscribe', 'signin', 'back'].reduce((o, k) => (o[k] = active.filter(s => s.paywall === k).length, o), {}),
  };

  // reading
  A.reading = {
    dots: active.filter(s => s.reading.opened).map(s => ({ name: s.name, depth: s.reading.avgDepth, ratio: s.reading.avgRatio, persona: s.persona.id })),
    avgDepth: Math.round(avg(active.filter(s => s.reading.opened).map(s => s.reading.avgDepth)) || 0),
    readPct: pct(active.reduce((a, s) => a + s.reading.read, 0), active.reduce((a, s) => a + s.reading.opened, 0)),
    feedMax: active.map(s => ({ name: s.name, n: s.feedItems })).sort((a, b) => b.n - a.n).slice(0, 5),
  };

  // headlines
  const hc = {};
  active.forEach(s => s.headlines.ids.forEach(id => hc[id] = (hc[id] || 0) + 1));
  A.headlines = {
    clickbait: active.reduce((a, s) => a + s.headlines.clickbait, 0),
    serious: active.reduce((a, s) => a + s.headlines.serious, 0),
    sponsored: active.reduce((a, s) => a + s.headlines.sponsored, 0),
    top: Object.entries(hc).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, n]) => ({ id, n })),
  };

  // missions
  const mk = (site) => { const t = active.map(s => ({ name: s.name, ...s.tasks[site] })).filter(x => x.ms != null);
    return { n: t.length, correct: pct(t.filter(x => x.correct).length, t.length), gaveUp: t.filter(x => x.gaveUp).length,
      avgS: Math.round((avg(t.filter(x => x.correct).map(x => x.ms)) || 0) / 1000), fastest: t.filter(x => x.correct).sort((a, b) => a.ms - b.ms).slice(0, 3) }; };
  const esc = active.filter(s => s.escape);
  A.missions = {
    alkhabar: mk('alkhabar'), viralvault: mk('viralvault'),
    escape: { n: esc.length, done: pct(esc.filter(s => s.escape.done).length, esc.length), gaveUp: esc.filter(s => s.escape.gaveUp).length,
      avgS: Math.round((avg(esc.filter(s => s.escape.done).map(s => s.escape.ms)) || 0) / 1000),
      avgSteps: +(avg(esc.filter(s => s.escape.done).map(s => s.escape.steps)) || 0).toFixed(1),
      list: esc.map(s => ({ name: s.name, done: s.escape.done, s: Math.round(s.escape.ms / 1000) })).sort((a, b) => (b.done - a.done) || (a.s - b.s)) },
    spot: { n: active.filter(s => s.spot).length, avgScore: Math.round(avg(active.filter(s => s.spot).map(s => s.spot.score)) || 0),
      missedNative: pct(active.filter(s => s.spot && s.spot.misses > 0).length, active.filter(s => s.spot).length),
      ranking: active.filter(s => s.spot).map(s => ({ name: s.name, score: s.spot.score })).sort((a, b) => b.score - a.score) },
  };

  // recall (ad blindness)
  A.recall = Object.fromEntries(SITES.map(site => {
    const r = active.filter(s => s.sites[site].adsReported != null);
    return [site, { n: r.length, reported: +(avg(r.map(s => s.sites[site].adsReported)) || 0).toFixed(1), actual: +(avg(r.map(s => s.sites[site].adsSeen)) || 0).toFixed(1),
      popupCorrect: pct(r.filter(s => s.sites[site].popupCorrect).length, r.length) }];
  }));

  // say vs do + site comparison
  A.sites = Object.fromEntries(SITES.map(site => {
    const v = active.filter(s => s.sites[site].visited).map(s => s.sites[site]);
    const moods = v.filter(x => x.mood != null).map(x => x.mood);
    const arts = v.reduce((a, x) => a + x.articles, 0);
    const r = {
      n: v.length,
      avgTimeS: Math.round(avg(v.map(x => x.timeS)) || 0),
      mood: +(avg(moods) || 0).toFixed(1),
      rage: +(avg(v.map(x => x.rage)) || 0).toFixed(2),
      adTaps: +(avg(v.map(x => x.adTaps)) || 0).toFixed(2),
      adsSeen: +(avg(v.map(x => x.adsSeen)) || 0).toFixed(1),
      bounce: pct(v.reduce((a, x) => a + x.bounces, 0), arts),
      deadTaps: +(avg(v.map(x => x.deadTaps)) || 0).toFixed(1),
    };
    r.frustration = Math.round(clamp(r.rage * 25 + r.adTaps * 15 + r.bounce * 0.4 + r.adsSeen * 2 + (moods.length ? (5 - r.mood) * 8 : 0)));
    return [site, r];
  }));
  const ranked = SITES.filter(s => A.sites[s].n).sort((a, b) => A.sites[b].frustration - A.sites[a].frustration);
  A.worstSite = ranked[0] || null;
  A.contradictions = active.filter(s => s.contradiction).map(s => ({ name: s.name, ...s.contradiction })).slice(0, 8);

  // heatmaps (home view taps)
  A.heat = {};
  for (const site of SITES) A.heat[site] = [];
  for (const e of db.events) if (e.type === 'tap' && A.heat[e.site] && e.data.view === 'home' && A.heat[e.site].length < 3000)
    A.heat[e.site].push([+(e.data.x || 0).toFixed(3), +((e.data.y || 0) / (e.data.dw || 390)).toFixed(3)]);

  // personas
  A.personas = {};
  active.forEach(s => (A.personas[s.persona.id] = A.personas[s.persona.id] || { ...PERSONAS[s.persona.id], names: [] }).names.push(s.name));

  // hall of fame
  const top = (arr, f, filt = () => true) => { const a = arr.filter(filt).sort(f); return a[0] || null; };
  A.fame = [
    { k: 'fastestCookie', s: top(active, (a, b) => a.cookieFirstMs - b.cookieFirstMs, s => s.cookieFirstMs != null && s.cookies[0].choice === 'accept'), v: s => (s.cookieFirstMs / 1000).toFixed(1) + 's' },
    { k: 'deepest', s: top(active, (a, b) => b.scores.reading - a.scores.reading, s => s.reading.opened > 0), v: s => s.reading.avgDepth + '%' },
    { k: 'rage', s: top(active, (a, b) => b.rage - a.rage, s => s.rage > 0), v: s => s.rage + '×' },
    { k: 'adMagnet', s: top(active, (a, b) => b.adTaps - a.adTaps, s => s.adTaps > 0), v: s => s.adTaps + '' },
    { k: 'guardian', s: top(active, (a, b) => b.scores.privacy - a.scores.privacy, s => s.cookies.length > 0), v: s => s.scores.privacy + '/100' },
    { k: 'scroller', s: top(active, (a, b) => b.feedItems - a.feedItems, s => s.feedItems > 0), v: s => s.feedItems + '' },
    { k: 'escape', s: top(active, (a, b) => a.escape.ms - b.escape.ms, s => s.escape && s.escape.done), v: s => Math.round(s.escape.ms / 1000) + 's' },
    { k: 'spotter', s: top(active, (a, b) => b.spot.score - a.spot.score, s => !!s.spot), v: s => s.spot.score + '%' },
  ].filter(f => f.s).map(f => ({ k: f.k, name: f.s.name, value: f.v(f.s) }));

  // ---- usability aggregate ----
  const U = {};
  U.tasks = Object.fromEntries(SITES.map(site => {
    const t = active.map(s => ({ name: s.name, ...(s.task[site] || {}) })).filter(x => x.ms != null);
    const ok = t.filter(x => x.ok);
    return [site, { n: t.length, success: pct(ok.length, t.length), gaveUp: t.filter(x => x.gaveUp).length,
      avgS: Math.round((avg(ok.map(x => x.ms)) || 0) / 1000), avgSteps: Math.round(avg(t.map(x => x.steps)) || 0), avgViews: +(avg(t.map(x => x.views)) || 0).toFixed(1),
      avgDead: +(avg(t.map(x => x.dead)) || 0).toFixed(1), fastest: ok.sort((a, b) => a.ms - b.ms).slice(0, 3).map(x => ({ name: x.name, s: Math.round(x.ms / 1000), steps: x.steps })) }];
  }));
  U.lost = active.map(s => ({ name: s.name, s: s.lostTotalS })).filter(x => x.s > 0).sort((a, b) => b.s - a.s);
  U.lostAvg = Math.round(avg(U.lost.map(x => x.s)) || 0);
  U.lostBySite = Object.fromEntries(SITES.map(k => [k, Math.round(avg(active.filter(s => s.sites[k].visited).map(s => s.lostS[k])) || 0)]));
  U.blockers = [0, 1, 2, 3, 4].map(i => active.reduce((a, s) => a + s.blockers.filter(b => b === i).length, 0));
  U.blockersBySite = Object.fromEntries(SITES.map(k => [k, [0, 1, 2, 3, 4].map(i => active.filter(s => s.sites[k].blocker === i).length)]));
  U.errors = { rage: active.reduce((a, s) => a + s.rage, 0), dead: active.reduce((a, s) => a + s.deadTaps, 0), mistaps: active.reduce((a, s) => a + s.adTaps, 0),
    gaveUp: active.reduce((a, s) => a + Object.values(s.task).filter(t => t && t.gaveUp).length, 0),
    ragers: active.filter(s => s.rage > 0).map(s => ({ name: s.name, n: s.rage })).sort((a, b) => b.n - a.n).slice(0, 6) };
  U.score = Object.fromEntries(SITES.map(k => {
    const t = U.tasks[k], seqs = active.map(s => s.sites[k].mood).filter(x => x != null), sq = seqs.length ? avg(seqs) : null;
    const rage = avg(active.filter(s => s.sites[k].visited).map(s => s.sites[k].rage)) || 0;
    const sc = Math.round(clamp((t.n ? t.success : 50) * 0.4 + (sq != null ? (sq - 1) / 6 * 100 : 50) * 0.3 + (1 - Math.min(1, U.lostBySite[k] / 30)) * 100 * 0.15 + (1 - Math.min(1, rage / 2)) * 100 * 0.15));
    return [k, { score: sc, seq: sq != null ? +sq.toFixed(1) : null, success: t.success, avgS: t.avgS, steps: t.avgSteps, lost: U.lostBySite[k], rage: +rage.toFixed(2) }];
  }));
  const sr = SITES.filter(k => A.sites[k].n).sort((a, b) => U.score[a].score - U.score[b].score);
  U.worst = sr[0] || null; U.best = sr[sr.length - 1] || null;
  U.saydo = active.filter(s => s.contradiction).map(s => ({ name: s.name, ...s.contradiction })).slice(0, 8);
  U.fame = [
    { k: 'fastTask', s: active.filter(s => s.taskAvgS != null && s.taskSuccess === 100).sort((a, b) => a.taskAvgS - b.taskAvgS)[0], v: s => s.taskAvgS + 's' },
    { k: 'fewSteps', s: active.filter(s => s.taskAvgSteps != null && s.taskSuccess >= 66).sort((a, b) => a.taskAvgSteps - b.taskAvgSteps)[0], v: s => s.taskAvgSteps + '' },
    { k: 'ninja', s: active.filter(s => s.lostTotalS > 0).sort((a, b) => a.lostTotalS - b.lostTotalS)[0], v: s => s.lostTotalS + 's' },
    { k: 'lost', s: active.filter(s => s.lostTotalS > 0).sort((a, b) => b.lostTotalS - a.lostTotalS)[0], v: s => s.lostTotalS + 's' },
    { k: 'rage', s: active.filter(s => s.rage > 0).sort((a, b) => b.rage - a.rage)[0], v: s => s.rage + '×' },
    { k: 'deepest', s: active.filter(s => s.reading.opened > 0).sort((a, b) => b.scores.reading - a.scores.reading)[0], v: s => s.reading.avgDepth + '%' },
    { k: 'scroller', s: active.filter(s => s.feedItems > 0).sort((a, b) => b.feedItems - a.feedItems)[0], v: s => s.feedItems + '' },
    { k: 'spotter', s: active.filter(s => s.spot).sort((a, b) => b.spot.score - a.spot.score)[0], v: s => s.spot.score + '%' },
  ].filter(f => f.s).map(f => ({ k: f.k, name: f.s.name, value: f.v(f.s) }));
  A.usability = U;
  const tsorted = active.filter(s => s.taskAvgS != null).map(s => s.taskAvgS).sort((a, b) => a - b);
  students.forEach(s => { s.fasterThan = s.taskAvgS != null && tsorted.length > 1 ? Math.round(tsorted.filter(x => x > s.taskAvgS).length / (tsorted.length - 1) * 100) : null; });

  // for student Wrapped comparisons
  const cms = active.filter(s => s.cookieFirstMs != null).map(s => s.cookieFirstMs).sort((a, b) => a - b);
  students.forEach(s => {
    s.cookieFasterThan = s.cookieFirstMs != null && cms.length > 1 ? Math.round((cms.filter(x => x > s.cookieFirstMs).length / (cms.length - 1)) * 100) : null;
  });
  A.summaryForStudents = { lostAvg: U.lostAvg, n: N, cookieAccept: A.cookies.accept, avgDepth: A.reading.avgDepth, worstSite: A.worstSite, personas: Object.fromEntries(Object.entries(A.personas).map(([k, v]) => [k, v.names.length])) };

  return { generatedAt: Date.now(), n: N, joined: students.length, students, aggregate: A, personas: PERSONAS };
}

module.exports = { analyze, PERSONAS };
