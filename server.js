// News UX Lab — classroom server
// Run: npm start   (then make port 3000 public in Codespaces)
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { Server } = require('socket.io');
const { analyze } = require('./lib/analysis');

const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'ux2026';
const DATA_FILE = path.join(__dirname, 'data', 'session.json');

const app = express();
app.set('trust proxy', true);
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' }, maxHttpBufferSize: 2e6 });

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// ---------------- store ----------------
const STAGES = ['lobby', 'alkhabar', 'ledger', 'viralvault', 'spot', 'wrapped'];
let db = { students: {}, events: [], state: { stage: 'lobby', overlay: null, startedAt: null } };
try { if (fs.existsSync(DATA_FILE)) db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) { console.warn('Could not load saved data', e.message); }
let dirty = false;
setInterval(() => {
  if (!dirty) return; dirty = false;
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFile(DATA_FILE, JSON.stringify(db), () => {});
}, 3000);

function publicUrl(req) {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL;
  if (process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN)
    return `https://${process.env.CODESPACE_NAME}-${PORT}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;
  return req ? `${req.protocol}://${req.get('host')}` : `http://localhost:${PORT}`;
}

// ---------------- analysis cache ----------------
let cache = null, cacheAt = 0;
function getAnalysis(force) {
  if (force || !cache || Date.now() - cacheAt > 1500) { cache = analyze(db); cacheAt = Date.now(); }
  return cache;
}

// ---------------- HTTP API ----------------
app.post('/api/join', (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 24);
  if (!name) return res.status(400).json({ error: 'name required' });
  const sid = crypto.randomBytes(6).toString('hex');
  db.students[sid] = { sid, name, lang: req.body.lang === 'en' ? 'en' : 'ar', joinedAt: Date.now(),
    w: req.body.w || 0, h: req.body.h || 0, ua: String(req.headers['user-agent'] || '').slice(0, 160) };
  dirty = true;
  pushFeed({ kind: 'join', name, t: Date.now() });
  res.json({ sid, state: db.state });
});
app.get('/api/state', (req, res) => res.json(db.state));
app.get('/api/me/:sid', (req, res) => {
  const a = getAnalysis(true);
  const me = a.students.find(s => s.sid === req.params.sid);
  if (!me) return res.status(404).json({ error: 'not found' });
  res.json({ me, class: a.aggregate.summaryForStudents });
});
app.get('/api/analysis', (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(403).json({ error: 'key' });
  res.json(getAnalysis(true));
});
app.get('/api/export', (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(403).json({ error: 'key' });
  res.setHeader('Content-Disposition', 'attachment; filename="newslab-session.json"');
  res.json({ ...db, analysis: getAnalysis(true) });
});
app.get('/api/qr', async (req, res) => {
  const url = publicUrl(req);
  const svg = await QRCode.toString(url, { type: 'svg', margin: 1, color: { dark: '#0b0b10', light: '#ffffff' } });
  res.json({ url, svg });
});

// ---------------- sockets ----------------
const FEED = []; function pushFeed(f) { FEED.push(f); if (FEED.length > 40) FEED.shift(); io.to('live').to('admin').emit('feed', f); }
const FEED_TYPES = new Set(['cookie', 'interstitial', 'newsletter', 'paywall', 'notif', 'video', 'adtap', 'headline', 'task', 'escape', 'scam', 'appbanner', 'mood', 'spot', 'rage']);

io.on('connection', (socket) => {
  socket.on('hello', ({ role, sid, key }) => {
    if (role === 'student' && db.students[sid]) {
      socket.data.sid = sid; socket.join('students');
      socket.emit('state', db.state);
    } else if ((role === 'live' || role === 'admin') && key === ADMIN_KEY) {
      socket.data.role = role; socket.join(role);
      socket.emit('state', db.state);
      socket.emit('analysis', getAnalysis(true));
      socket.emit('feedHistory', FEED);
    } else if (role === 'student') {
      socket.emit('unknown');
    } else socket.emit('denied');
  });

  socket.on('ev', (batch) => {
    const sid = socket.data.sid; if (!sid || !Array.isArray(batch)) return;
    const st = db.students[sid]; if (!st) return;
    for (const e of batch.slice(0, 300)) {
      if (!e || typeof e.type !== 'string') continue;
      const ev = { sid, site: String(e.site || ''), type: e.type, t: Number(e.t) || Date.now(), data: e.data || {} };
      db.events.push(ev);
      if (FEED_TYPES.has(ev.type)) pushFeed({ kind: ev.type, name: st.name, site: ev.site, data: ev.data, t: ev.t });
    }
    dirty = true;
  });

  // ---- admin controls ----
  const isAdmin = () => socket.data.role === 'admin' || socket.data.role === 'live';
  socket.on('setStage', (stage) => {
    if (!isAdmin() || !STAGES.includes(stage)) return;
    db.state.stage = stage; db.state.overlay = null;
    if (!db.state.startedAt && stage !== 'lobby') db.state.startedAt = Date.now();
    dirty = true; io.emit('state', db.state);
  });
  socket.on('pushOverlay', (type) => {
    if (!isAdmin() || !['task', 'check'].includes(type)) return;
    db.state.overlay = { type, site: db.state.stage, id: type + '-' + db.state.stage + '-' + Date.now(), at: Date.now() };
    dirty = true; io.emit('state', db.state);
  });
  socket.on('clearOverlay', () => { if (!isAdmin()) return; db.state.overlay = null; dirty = true; io.emit('state', db.state); });
  socket.on('reset', () => {
    if (!isAdmin()) return;
    db = { students: {}, events: [], state: { stage: 'lobby', overlay: null, startedAt: null } };
    FEED.length = 0; dirty = true; cache = null; io.emit('reset'); io.emit('state', db.state);
  });
  socket.on('kick', (sid) => { if (!isAdmin()) return; delete db.students[sid]; db.events = db.events.filter(e => e.sid !== sid); dirty = true; });
});

// push fresh analysis to projector/admin every 2s
let lastLen = -1, lastStudents = -1;
setInterval(() => {
  const n = db.events.length, s = Object.keys(db.students).length;
  if (n === lastLen && s === lastStudents) return;
  lastLen = n; lastStudents = s;
  const a = getAnalysis(true);
  io.to('live').to('admin').emit('analysis', a);
  io.to('admin').emit('online', io.sockets.adapter.rooms.get('students')?.size || 0);
}, 2000);

server.listen(PORT, () => {
  const url = publicUrl();
  console.log('\n  📰  News UX Lab is running');
  console.log(`  Students join:     ${url}`);
  console.log(`  Instructor panel:  ${url}/admin?key=${ADMIN_KEY}`);
  console.log(`  Projector (live):  ${url}/live?key=${ADMIN_KEY}\n`);
});
