/* Sproochentest A2 — Coach v4
   ───────────────────────────────────────────────────────────────────────────
   Une seule idée gouverne ce fichier : l'examen se joue à la bouche, pas à la
   lecture. Tout ce qui est mesuré, révisé et rappelé l'est en fonction d'une
   question d'examen qu'il faut savoir répondre à voix haute, tout de suite.

   Deux rendez-vous par jour, et ils ne font pas le même travail :
     · la session du jour apprend et teste,
     · la session du soir ne rattrape que les erreurs de la journée, fait dire
       trois réponses à voix haute et montre demain. Rien de neuf le soir.
   ─────────────────────────────────────────────────────────────────────────── */
(function () {
'use strict';

const C = window.CORPUS, M = window.METHOD, L = window.LISTEN;

/* ══ outils ═══════════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const qsa = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const icon = (id, cls) => `<svg class="ic ${cls || ''}" aria-hidden="true"><use href="#${id}"/></svg>`;
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const shuffle = a => { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = rnd(i + 1);[x[i], x[j]] = [x[j], x[i]]; } return x; };
const uniq = (a, f) => { const s = new Set(), o = []; for (const it of a) { const k = f(it); if (!s.has(k)) { s.add(k); o.push(it); } } return o; };
const plural = (n, s, p) => n <= 1 ? s : (p || s + 's');

const dayKey = (off = 0) => { const d = new Date(); d.setDate(d.getDate() + off); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const TODAY = dayKey(0), TOMORROW = dayKey(1);
const parseDay = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseDay(s); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const diffDays = (a, b) => Math.round((parseDay(b) - parseDay(a)) / 864e5);
const frDate = s => { try { return parseDay(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return s; } };

/* ══ index du corpus ══════════════════════════════════════════════════════
   Les questions sont classées par type au démarrage, avec les mêmes
   expressions que la fiche « 7 questions » : l'entraînement à la
   reconnaissance porte donc sur de vraies questions d'examen. */
const PRIO = M.QTYPES.slice().sort((a, b) => a.ord - b.ord);
const deacc = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const QT_OF = {};
C.froen.forEach(q => {
  const n = deacc(q.q);
  const t = PRIO.find(t => t.hit.some(re => re.test(n)));
  QT_OF[q.n] = t ? t.k : 'jonee';
});
const Q_OF = {}; C.froen.forEach(q => Q_OF[q.n] = q);
const BY_THEME = C.themes.map((t, i) => C.froen.filter(q => q.t === i));
const TOTAL_Q = C.froen.length;
const PHOTO_OF = {}; C.photos.forEach(p => PHOTO_OF[p.id] = p);

/* ══ état ═════════════════════════════════════════════════════════════════ */
const KEY = 'lux4_state';
const blank = () => ({
  v: 4,
  profile: { name: '', examDate: null, minutes: 10, sound: true, theme: 'auto', evening: 20, onboarded: false },
  srs: {},            // id -> {b, due, ok, ko}
  mine: {},           // n° de question -> ma réponse
  xp: { total: 0, byDay: {} },
  acc: {},            // compétence -> {ok, n}
  day: { d: null, err: [], steps: 0, dag: false, owend: false },
  streak: { best: 0, freezes: 2, frozen: [], last: null },
  photos: {},         // id -> {seen, note}
  lauscht: {},        // document d'écoute -> {best, tries}
  mocks: [],
  badges: {},
  lastView: null
});
let S = blank(), saveT = null;
const save = () => { clearTimeout(saveT); saveT = setTimeout(saveNow, 200); };
function saveNow() { clearTimeout(saveT); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch (e) { }
  if (raw) {
    try { S = Object.assign(blank(), JSON.parse(raw)); } catch (e) { S = blank(); }
    const d = blank();
    for (const k in d) if (S[k] == null) S[k] = d[k];
    S.profile = Object.assign(d.profile, S.profile);
    S.streak = Object.assign(d.streak, S.streak);
    S.day = Object.assign(d.day, S.day);
  } else migrate3();
  if (S.day.d !== TODAY) S.day = { d: TODAY, err: [], steps: 0, dag: false, owend: false };
}

/* Reprise de la v3 : le vocabulaire appris n'est pas la même matière, mais la
   série, l'XP et la date d'examen le sont — on ne fait pas repartir de zéro
   quelqu'un qui travaillait déjà. */
function migrate3() {
  let old = null;
  try { old = JSON.parse(localStorage.getItem('lux3_state') || 'null'); } catch (e) { }
  if (!old) return;
  if (old.profile) {
    S.profile.name = old.profile.name || '';
    S.profile.examDate = old.profile.examDate || null;
    S.profile.minutes = old.profile.minutes || 10;
  }
  S.xp.total = Math.round((old.xp && old.xp.total) || 0);
  S.xp.byDay = (old.xp && old.xp.byDay) || {};
  if (old.streak) S.streak.best = old.streak.best || 0;
  S.badges.fromV3 = true;
  saveNow();
}

/* ══ niveaux, objectif, série ═════════════════════════════════════════════ */
const LEVELS = [
  { xp: 0, t: 'Ufänger', fr: 'Débutant' },
  { xp: 300, t: 'Entdecker', fr: 'Explorateur' },
  { xp: 800, t: 'Léierjong', fr: 'Apprenti' },
  { xp: 1700, t: 'Schwätzer', fr: 'Bavard' },
  { xp: 3000, t: 'Kenner', fr: 'Connaisseur' },
  { xp: 5000, t: 'Meeschter', fr: 'Maître' },
  { xp: 7500, t: 'Sproochendokter', fr: 'Docteur ès langue' }
];
function levelInfo(xp) {
  let i = 0; while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].xp) i++;
  const cur = LEVELS[i], next = LEVELS[i + 1] || null;
  return {
    n: i + 1, t: cur.t, fr: cur.fr, next,
    pct: next ? clamp(((xp - cur.xp) / (next.xp - cur.xp)) * 100, 0, 100) : 100,
    toNext: next ? next.xp - xp : 0
  };
}
const GOAL = { 5: 40, 10: 80, 15: 120, 20: 160 };
const goalXp = () => GOAL[S.profile.minutes] || 80;
const xpToday = () => S.xp.byDay[TODAY] || 0;
const goalDone = d => (S.xp.byDay[d] || 0) >= goalXp();

function addXp(n, quiet) {
  const before = levelInfo(S.xp.total).n;
  S.xp.total += n;
  S.xp.byDay[TODAY] = (S.xp.byDay[TODAY] || 0) + n;
  const after = levelInfo(S.xp.total).n;
  if (after > before && !quiet) toast('Niveau ' + after + ' — ' + LEVELS[after - 1].t, 'sig');
  save(); paintHud(true);
}

function streakLen() {
  let n = 0, d = TODAY;
  if (!goalDone(d) && !(S.streak.frozen || []).includes(d)) d = addDays(d, -1);
  while (goalDone(d) || (S.streak.frozen || []).includes(d)) { n++; d = addDays(d, -1); }
  return n;
}
/* Un jour manqué consomme un gel plutôt que la série : la régularité se
   construit sur des semaines, une soirée ratée ne doit pas tout annuler. */
function applyFreeze() {
  const last = S.streak.last;
  if (last === TODAY) return;
  if (last) {
    let d = addDays(last, 1);
    while (d < TODAY) {
      if (!goalDone(d) && !(S.streak.frozen || []).includes(d)) {
        if ((S.streak.freezes || 0) > 0) { S.streak.freezes--; S.streak.frozen.push(d); }
        else break;
      }
      d = addDays(d, 1);
    }
  }
  S.streak.last = TODAY; save();
}

/* ══ révision espacée ═════════════════════════════════════════════════════ */
const BOX = [0, 1, 2, 4, 8, 16, 35];
const MASTER = 4;
const rec = id => S.srs[id];
const seen = id => !!S.srs[id];
const mastered = id => (S.srs[id]?.b || 0) >= MASTER;
const due = id => { const r = S.srs[id]; return r && r.due <= TODAY; };

function grade(id, q) {
  const r = S.srs[id] || (S.srs[id] = { b: 0, due: TODAY, ok: 0, ko: 0 });
  if (q >= 2) { r.b = Math.min(BOX.length - 1, r.b + 1); r.ok++; }
  else if (q === 1) { r.ok++; }
  else { r.b = Math.max(0, r.b - 2); r.ko++; noteError(id); }
  r.due = addDays(TODAY, BOX[r.b] || 0);
  save();
}
function noteError(id) {
  if (!S.day.err.includes(id)) { S.day.err.push(id); save(); }
}
function track(skill, ok) {
  const a = S.acc[skill] || (S.acc[skill] = { ok: 0, n: 0 });
  a.n++; if (ok) a.ok++; save();
}
const acc = s => { const a = S.acc[s]; return a && a.n ? a.ok / a.n : 0; };

const qId = n => 'q' + n;
const answered = n => !!(S.mine[n] && S.mine[n].trim());
const dueQ = () => C.froen.filter(q => due(qId(q.n)));
const freshQ = () => C.froen.filter(q => !seen(qId(q.n)));
const lauschtDone = () => L.DOCS.filter(d => (S.lauscht[d.id] || {}).tries).length;
const myCount = () => Object.keys(S.mine).filter(k => S.mine[k] && S.mine[k].trim()).length;

/* ══ score de préparation ═════════════════════════════════════════════════
   Cinq axes, parce qu'un seul chiffre ne dit pas quoi faire demain. */
const AXES = [
  { k: 'rep', t: 'Répertoire', fr: 'Questions que tu sais répondre',
    get: () => Object.keys(S.srs).filter(k => k[0] === 'q' && mastered(k)).length / 120 },
  { k: 'perso', t: 'Réponses à toi', fr: 'Réponses que tu as écrites toi-même',
    get: () => myCount() / 60 },
  { k: 'typ', t: 'Reconnaissance', fr: 'Identifier le type de question',
    get: () => acc('typ') * Math.min(1, (S.acc.typ?.n || 0) / 30) },
  { k: 'foto', t: 'Photo', fr: 'Photos travaillées jusqu\'au bout',
    get: () => Object.values(S.photos).filter(p => p.seen).length / 12 },
  { k: 'oral', t: 'Voix', fr: 'Réponses dites à voix haute',
    get: () => Math.min(1, (S.acc.oral?.n || 0) / 80) },
  { k: 'lausch', t: 'Écoute', fr: 'Compréhension de l\'oral — le niveau B1',
    get: () => L.DOCS.reduce((a, d) => a + ((S.lauscht[d.id] || {}).best || 0), 0) / (L.DOCS.length * 100) }
];
function readiness() {
  const parts = AXES.map(a => ({ ...a, v: clamp(a.get(), 0, 1) }));
  return { parts, score: Math.round(parts.reduce((s, p) => s + p.v, 0) / parts.length * 100) };
}

/* ══ heure : jour ou soir ═════════════════════════════════════════════════ */
function nowIsEvening() {
  const h = new Date().getHours();
  return h >= (S.profile.evening || 20) || h < 4;
}
let timeForced = null;
const isEvening = () => timeForced != null ? timeForced : nowIsEvening();
function paintTime() {
  const ev = isEvening();
  document.documentElement.setAttribute('data-time', ev ? 'owend' : 'dag');
  $('tbIcon').setAttribute('href', ev ? '#i-moon' : '#i-sun');
  $('tbTime').textContent = ev ? 'Soir' : 'Jour';
}

/* ══ voix ═════════════════════════════════════════════════════════════════ */
let voices = [];
const loadVoices = () => { voices = window.speechSynthesis ? speechSynthesis.getVoices() : []; };
if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
/* Il n'existe presque jamais de voix lb-LU installée : l'allemand reste la
   meilleure approximation pour l'oreille, et c'est ce que les candidats
   entendent de toute façon autour d'eux. */
function bestVoice() {
  return voices.find(v => /^lb/i.test(v.lang)) || voices.find(v => /^de[-_]LU/i.test(v.lang))
    || voices.find(v => /^de/i.test(v.lang)) || voices.find(v => /^nl/i.test(v.lang)) || null;
}
function speak(text, rate) {
  if (!window.speechSynthesis) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/·/g, ','));
    const v = bestVoice(); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'de-DE';
    u.rate = rate || (isEvening() ? .82 : .88);
    speechSynthesis.speak(u);
  } catch (e) { }
}
const hasTTS = () => !!window.speechSynthesis;

/* ══ lecture enchaînée d'un document sonore ═══════════════════════════════
   Une voix par locuteur quand le système en propose plusieurs : sans ça, un
   dialogue à deux devient un monologue et l'exercice perd son sens.
   On découpe par réplique plutôt que d'envoyer tout le texte d'un bloc —
   Chrome coupe les énoncés longs au bout d'une quinzaine de secondes. */
let SEQ = null, keepAlive = null;

function voicePair() {
  const de = voices.filter(v => /^(lb|de)/i.test(v.lang));
  const pool = de.length ? de : voices;
  const a = bestVoice() || pool[0] || null;
  const b = pool.find(v => v !== a && v.name !== (a && a.name)) || a;
  return [a, b];
}

function stopSpeak() {
  if (SEQ) SEQ.cancel = true;
  SEQ = null;
  clearInterval(keepAlive); keepAlive = null;
  try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { }
}

/* lines: [[locuteur, texte], …] — locuteur 'N' ou index numérique */
function speakLines(lines, opt) {
  opt = opt || {};
  stopSpeak();
  if (!hasTTS() || !voices.length) { opt.onEnd && opt.onEnd('sans-voix'); return; }
  const vs = voicePair();
  const me = SEQ = { cancel: false };
  let i = 0;
  /* Chrome met la synthèse en pause toute seule au bout d'un moment : on la
     relance périodiquement, sinon un document long s'arrête au milieu. */
  keepAlive = setInterval(() => {
    try { if (speechSynthesis.speaking && !speechSynthesis.paused) speechSynthesis.resume(); } catch (e) { }
  }, 8000);

  const step = () => {
    if (me.cancel) return;
    if (i >= lines.length) { stopSpeak(); opt.onEnd && opt.onEnd(); return; }
    const who = lines[i][0], text = lines[i][1];
    opt.onLine && opt.onLine(i, lines.length);
    const u = new SpeechSynthesisUtterance(text);
    const v = who === 'N' ? vs[0] : vs[who % 2];
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'de-DE';
    u.rate = opt.rate || .95;
    u.onend = () => { if (me.cancel) return; i++; step(); };
    u.onerror = () => { if (me.cancel) return; i++; step(); };
    try { speechSynthesis.speak(u); } catch (e) { i++; step(); }
  };
  step();
}

let actx = null;
function beep(kind) {
  if (!S.profile.sound || isEvening()) return;      // le soir, on ne sonne pas
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
    o.connect(g); g.connect(actx.destination); o.type = 'sine';
    const f = kind === 'ok' ? [660, 990] : kind === 'no' ? [300, 220] : [520, 520];
    o.frequency.setValueAtTime(f[0], t); o.frequency.exponentialRampToValueAtTime(f[1], t + .09);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.09, t + .015);
    g.gain.exponentialRampToValueAtTime(.0001, t + .22);
    o.start(t); o.stop(t + .24);
  } catch (e) { }
}
const buzz = p => { try { navigator.vibrate && !isEvening() && navigator.vibrate(p); } catch (e) { } };

/* ══ retours ══════════════════════════════════════════════════════════════ */
function toast(msg, kind) {
  const box = $('toasts'), d = document.createElement('div');
  d.className = 'toast' + (kind ? ' ' + kind : '');
  d.textContent = msg; box.appendChild(d);
  setTimeout(() => { d.style.opacity = '0'; d.style.transition = 'opacity .3s'; setTimeout(() => d.remove(), 320); }, 2400);
}
const announce = m => { $('live').textContent = m; };
function openSheet(html) {
  $('sheetBody').innerHTML = html;
  $('scrim').hidden = false; document.body.classList.add('locked');
}
/* On vide la feuille en la fermant : sinon ses identifiants restent dans le
   document et peuvent être attrapés à la place de ceux de l'exercice en cours. */
function closeSheet() {
  $('scrim').hidden = true;
  $('sheetBody').textContent = '';
  document.body.classList.remove('locked');
}

/* ══════════════════════════════════════════════════════════════════════════
   MOTEUR DE SESSION
   ══════════════════════════════════════════════════════════════════════════ */
let SX = null;

const SIZE = { 5: 8, 10: 13, 15: 18, 20: 24 };
const sessionSize = () => SIZE[S.profile.minutes] || 13;

/* ── fabriques d'étapes ─────────────────────────────────────────────────── */
const stepQCard = q => ({ t: 'qcard', q });
const stepQType = q => ({ t: 'qtype', q });
const stepQSpeak = q => ({ t: 'qspeak', q });
const stepQMine = q => ({ t: 'qmine', q });
const stepPreview = q => ({ t: 'preview', q });

function stepGender() {
  const v = pick(C.vocab);
  return { t: 'gender', v };
}
function stepGram() {
  const g = pick(M.GRAMMAR.filter(g => g.rows.some(r => r[2] === 0)));
  const bad = pick(g.rows.filter(r => r[2] === 0));
  const good = shuffle(g.rows.filter(r => r[2] === 1)).slice(0, 2);
  return { t: 'gram', g, bad, good };
}
function stepConj() {
  const c = pick(M.CONJ), i = 1 + rnd(5);
  return { t: 'conj', c, i };
}
/* Un document d'écoute par genre : l'examen en donne toujours un de chaque,
   et ce sont trois exercices différents. */
function stepLauscht(id) {
  const d = id ? L.DOCS.find(x => x.id === id) : pick(L.DOCS);
  return { t: 'lauscht', d };
}
function weakestKind() {
  const byKind = {};
  for (const k of ['R', 'G', 'A']) {
    const ds = L.DOCS.filter(d => d.kind === k);
    byKind[k] = ds.reduce((a, d) => a + ((S.lauscht[d.id] || {}).best || 0), 0) / ds.length;
  }
  return Object.keys(byKind).sort((a, b) => byKind[a] - byKind[b])[0];
}
function stepPhoto(id) {
  const p = id ? PHOTO_OF[id] : pick(C.photos);
  const b = pick(p.p);
  return { t: 'photoblk', p, b };
}

/* ── file d'exercices ───────────────────────────────────────────────────── */
function buildQueue(preset, arg) {
  const N = sessionSize();
  let steps = [];

  if (preset === 'dag') {
    /* Le cœur : des questions dues, quelques neuves, et un peu de tout le
       reste pour que la séance ne devienne pas monotone. */
    const d = shuffle(dueQ()), f = shuffle(freshQ());
    const nd = Math.min(d.length, Math.round(N * .45));
    const nf = Math.min(f.length, Math.max(2, Math.round(N * .28)));
    steps = d.slice(0, nd).map(stepQCard).concat(f.slice(0, nf).map(stepQCard));
    steps.push(stepQType(pick(C.froen)), stepQType(pick(C.froen)));
    steps.push(Math.random() < .5 ? stepGram() : stepConj());
    if (C.vocab.length) steps.push(stepGender());
    const spoken = shuffle(C.froen.filter(q => answered(q.n)));
    steps.push(stepQSpeak(spoken.length ? pick(spoken) : pick(C.froen)));
    steps.push(stepPhoto());
    while (steps.length < N) {
      const pool = C.froen.filter(q => seen(qId(q.n)));
      if (!pool.length) break;
      steps.push(stepQCard(pick(pool)));
    }
    steps = shuffle(steps).slice(0, N);

    /* L'écoute pèse autant que l'oral à l'examen : elle doit revenir souvent.
       Mais un document entier vaut cinq exercices — on ne l'ajoute qu'à partir
       de dix minutes par jour, et on retire d'autant, sinon la séance double
       de longueur sans prévenir. */
    if (N >= 13) {
      steps = steps.slice(0, N - 4);
      steps.splice(Math.min(2, steps.length), 0, stepLauscht());
    }
  }

  else if (preset === 'owend') return buildEvening();

  else if (preset === 'srs') {
    const d = shuffle(dueQ());
    if (!d.length) return [];
    steps = d.slice(0, Math.max(N, 12)).map(stepQCard);
  }

  else if (preset === 'theme') {
    const list = shuffle(BY_THEME[arg]);
    steps = list.slice(0, N).map(stepQCard);
  }

  else if (preset === 'typ') {
    steps = shuffle(C.froen).slice(0, 12).map(stepQType);
  }

  else if (preset === 'speak') {
    const mine = shuffle(C.froen.filter(q => answered(q.n)));
    const pool = mine.length >= 5 ? mine : shuffle(C.froen);
    steps = pool.slice(0, 6).map(stepQSpeak);
  }

  else if (preset === 'write') {
    /* Personnaliser : on propose d'abord les questions sans réponse à soi,
       en commençant par les thèmes déjà entamés. */
    const todo = C.froen.filter(q => !answered(q.n));
    steps = shuffle(todo).slice(0, 6).map(stepQMine);
  }

  else if (preset === 'gram') {
    steps = Array.from({ length: 6 }, stepGram).concat(Array.from({ length: 4 }, stepConj));
    steps = shuffle(steps);
  }

  else if (preset === 'gender') {
    steps = shuffle(C.vocab).slice(0, 12).map(v => ({ t: 'gender', v }));
  }

  else if (preset === 'foto') {
    const p = arg ? PHOTO_OF[arg] : pick(C.photos);
    steps = p.p.map(b => ({ t: 'photoblk', p, b }));
    steps.push({ t: 'photomind', p });
  }

  else if (preset === 'lauscht') {
    /* L'argument peut être un document précis (choisi dans la liste) ou un
       genre. À défaut, on sert le genre le moins réussi : c'est là que les
       points manquent, pas dans celui qu'on refait avec plaisir. */
    const one = arg && L.DOCS.find(d => d.id === arg);
    if (one) steps = [{ t: 'lauscht', d: one }];
    else {
      const k = (arg && L.KIND[arg]) ? arg : weakestKind();
      const pool = L.DOCS.filter(d => d.kind === k);
      const fresh = pool.filter(d => !(S.lauscht[d.id] || {}).tries);
      steps = [{ t: 'lauscht', d: pick(fresh.length ? fresh : pool) }];
    }
  }

  else if (preset === 'lauschtexam') {
    /* Format de l'épreuve : un message radio, une conversation, un échange. */
    const docs = ['R', 'G', 'A'].map(k => pick(L.DOCS.filter(d => d.kind === k)));
    steps = docs.map(d => ({ t: 'lauscht', d }));
    steps.push({ t: 'lauschtend', docs });
  }

  else if (preset === 'flash') {
    const d = shuffle(dueQ());
    const pool = d.length ? d : shuffle(C.froen.filter(q => seen(qId(q.n))));
    steps = (pool.length ? pool : shuffle(C.froen)).slice(0, 5).map(stepQCard);
    steps.push(stepQType(pick(C.froen)));
  }

  return steps.filter(Boolean);
}

/* ── la session du soir ─────────────────────────────────────────────────────
   Elle n'introduit jamais de matière neuve. Elle repasse les erreurs du jour,
   fait dire trois réponses à voix haute, montre cinq cartes de demain, puis
   s'arrête net. C'est une séance de consolidation, pas une séance de plus. */
function buildEvening() {
  const steps = [];
  const errs = S.day.err.filter(id => id[0] === 'q').map(id => Q_OF[+id.slice(1)]).filter(Boolean);
  const xt = xpToday(), st = streakLen();

  steps.push({
    t: 'info', n: '1', title: 'Bilan de la journée',
    lines: [
      [String(S.day.steps), plural(S.day.steps, 'exercice')],
      [String(xt) + ' XP', goalDone(TODAY) ? 'objectif atteint' : 'sur ' + goalXp() + ' visés'],
      [String(errs.length), plural(errs.length, 'chose ratée', 'choses ratées')]
    ],
    body: errs.length
      ? "On les repasse une fois, maintenant — c'est le meilleur moment de la journée pour ça. "
        + "Compte six ou sept minutes, puis tu ranges le téléphone."
      : "Rien à repêcher. On passe directement à la voix : cinq minutes, et au lit."
  });

  if (errs.length) {
    steps.push({ t: 'info', n: '2', title: 'Repêchage', body: "Ce que tu as raté aujourd'hui, une deuxième fois. Sans note, sans pression." });
    shuffle(errs).slice(0, 5).forEach(q => steps.push({ t: 'qcard', q, soft: true }));
  }

  const mine = shuffle(C.froen.filter(q => answered(q.n)));
  const talk = (mine.length ? mine : shuffle(C.froen)).slice(0, 3);
  if (talk.length) {
    steps.push({ t: 'info', n: '3', title: 'Trois à voix haute', body: "Dis-les vraiment, à voix basse si tu veux, mais avec la bouche. Personne ne corrige : on cherche la fluidité, pas la perfection." });
    talk.forEach(q => steps.push({ t: 'qspeak', q, soft: true }));
  }

  const tomorrow = shuffle(C.froen.filter(q => {
    const r = S.srs[qId(q.n)]; return r && r.due <= TOMORROW && r.due > TODAY;
  }));
  const prev = (tomorrow.length ? tomorrow : shuffle(C.froen.filter(q => seen(qId(q.n))))).slice(0, 4);
  if (prev.length) {
    steps.push({ t: 'info', n: '4', title: 'Ce qui revient demain', body: "Regarde, ne réponds pas. Ton cerveau travaillera dessus cette nuit." });
    prev.forEach(q => steps.push({ t: 'preview', q }));
  }

  const ph = pick(C.photos);
  steps.push({ t: 'photomind', p: ph, evening: true });

  steps.push({
    t: 'close', n: '5', title: pick(M.EVENING.close),
    body: st ? st + ' ' + plural(st, 'jour') + ' de suite. Repose-toi.' : 'À demain.'
  });
  return steps;
}

const LABEL = {
  dag: 'Session du jour', owend: 'Session du soir', srs: 'Ce qui revient aujourd\'hui',
  theme: 'Un thème', typ: 'Reconnaître la question', speak: 'À voix haute',
  write: 'Écrire mes réponses', gram: 'Grammaire', gender: 'Le bon article',
  foto: 'Décrire une photo', flash: 'Deux minutes',
  lauscht: 'Compréhension de l\'oral', lauschtexam: 'Examen blanc d\'écoute'
};

/* ── cycle de vie ───────────────────────────────────────────────────────── */
function start(preset, arg) {
  const steps = buildQueue(preset, arg);
  if (!steps.length) {
    openSheet(`<div style="text-align:center;padding:8px 0 4px">
      <div style="font-size:2.4rem">✓</div>
      <h2 style="font-size:1.2rem;margin:10px 0 6px">Rien à réviser pour l'instant</h2>
      <p class="lead">Tes questions dues sont toutes faites. Prends-en des nouvelles pour avancer.</p></div>
      <button class="btn sig big" style="margin-top:14px" data-act="start" data-p="dag" data-close>Session du jour</button>
      <button class="btn dim big" style="margin-top:8px" data-close>Plus tard</button>`);
    return;
  }
  SX = { preset, arg, steps, i: 0, ok: 0, ko: 0, xp: 0, t0: Date.now(), done: false, soft: preset === 'owend' };
  $('sx').hidden = false; $('sx').classList.remove('out');
  document.body.classList.add('locked');
  render();
}
function quit(force) {
  if (!SX) return hide();
  if (!force && SX.i > 0 && SX.i < SX.steps.length) {
    openSheet(`<div style="text-align:center;padding:6px 0">
      <h2 style="font-size:1.15rem;margin-bottom:6px">Quitter la session ?</h2>
      <p class="lead">Tu es à ${SX.i} sur ${SX.steps.length}. Ce que tu as déjà fait est gardé.</p></div>
      <button class="btn sig big" style="margin-top:14px" data-close>Je continue</button>
      <button class="btn dim big" style="margin-top:8px" data-act="quit" data-close>Quitter</button>`);
    return;
  }
  hide();
}
function hide() {
  const el = $('sx'); el.classList.add('out');
  setTimeout(() => { el.hidden = true; el.classList.remove('out'); document.body.classList.remove('locked'); }, 190);
  /* Couper le son en sortant : sans ça, un document d'écoute continue de
     parler alors que l'écran est fermé. */
  SX = null; stopRec(); stopSpeak();
  paintHud(); renderView();
}

function progress() {
  const p = SX.steps.length ? (SX.i / SX.steps.length) * 100 : 0;
  $('sxBar').style.width = p + '%';
  $('sxCnt').textContent = Math.min(SX.i + 1, SX.steps.length) + '/' + SX.steps.length;
}
const foot = html => { $('sxFoot').innerHTML = html; };
const kick = (label, extra) => `<div class="kick"><span class="beat" aria-hidden="true"><i class="on"></i><i class="on"></i><i class="on"></i></span>${esc(label)}${extra ? ' · ' + esc(extra) : ''}</div>`;

function render() {
  if (!SX) return;
  if (SX.i >= SX.steps.length) return finish();
  progress(); stopRec(); stopSpeak();
  const st = SX.steps[SX.i];
  const body = $('sxBody'); body.scrollTop = 0;
  ({
    qcard: rQCard, qtype: rQType, qspeak: rQSpeak, qmine: rQMine, preview: rPreview,
    gender: rGender, gram: rGram, conj: rConj, photoblk: rPhotoBlk, photomind: rPhotoMind,
    lauscht: rLauscht, lauschtend: rLauschtEnd, info: rInfo, close: rInfo
  })[st.t](st, body);
}
const next = () => { if (SX) { SX.i++; SX.done = false; render(); } };

/* ── 1. la question et ta réponse ───────────────────────────────────────── */
function rQCard(st, b) {
  const q = st.q, id = qId(q.n), mine = S.mine[q.n];
  const th = C.themes[q.t];
  const t = M.QTYPES.find(x => x.k === QT_OF[q.n]);
  b.innerHTML = kick(th.fr, 'question ' + q.n) + `
    <div class="prompt lb">${esc(q.q)}</div>
    <div class="row" style="margin-top:14px">
      <span class="tag q">${esc(t.st || t.t)}</span>
      ${hasTTS() ? '<button class="btn dim" style="padding:5px 11px;font-size:.8rem" data-say="' + esc(q.q) + '">&#9835; Écouter</button>' : ''}
    </div>
    <!-- Le vide sous la question n'est pas un défaut de remplissage : c'est là
         que l'apprenant parle. On lui donne la seule structure à tenir. -->
    <div class="beats" id="beats">
      <button data-i="0">Äntwert<small>la réponse</small></button>
      <button data-i="1">Grond<small>la raison</small></button>
      <button data-i="2">Beispill<small>un exemple</small></button>
    </div>
    <div class="reveal hide" id="rv">
      ${mine ? `<div class="lab">Ta réponse</div><p>${esc(mine)}</p>` : ''}
      ${mine && q.m ? '<div style="height:14px"></div>' : ''}
      ${q.m ? `<div class="lab">${mine ? 'Réponse modèle' : 'Réponse modèle — adapte-la à ta vie'}</div><p>${esc(q.m)}</p>` : ''}
      ${!mine ? '<div style="margin-top:14px"><button class="btn dim" data-act="write-one" data-n="' + q.n + '">Écrire ma version</button></div>' : ''}
    </div>`;
  foot(`<div class="hint" style="text-align:center">Réponds à voix haute, coche tes trois temps, puis vérifie.</div>
        <button class="btn sig big" id="go">Voir la réponse</button>`);
  qsa('#beats button').forEach(btn => btn.onclick = () => btn.classList.toggle('on'));
  $('go').onclick = () => {
    $('rv').classList.remove('hide');
    if (st.soft) {
      foot(`<button class="btn sig big" id="go">Vu — suivant</button>`);
      $('go').onclick = () => { S.day.steps++; next(); };
      return;
    }
    foot(`<div class="hint" style="text-align:center">Tu as su répondre ?</div>
      <div class="grades">
        <button class="grade g0" data-g="0"><em>&#10007;</em>Pas du tout<i>1</i></button>
        <button class="grade g1" data-g="1"><em>~</em>À peu près<i>2</i></button>
        <button class="grade g2" data-g="2"><em>&#10003;</em>Sans hésiter<i>3</i></button>
      </div>`);
    /* Au clavier, Entrée doit rester utile : on ne choisit pas la note à la
       place de l'apprenant, on pose le focus sur la note du milieu — elle est
       visible, et Entrée l'active alors nativement. */
    const mid = $('sxFoot').querySelector('.grade.g1');
    if (mid) mid.focus({ preventScroll: true });
    qsa('#sxFoot .grade').forEach(btn => btn.onclick = () => {
      const g = +btn.dataset.g;
      grade(id, g); track('rep', g >= 2);
      if (g >= 2) { SX.ok++; addXp(6, true); beep('ok'); }
      else { SX.ko++; addXp(2, true); beep('no'); }
      S.day.steps++; next();
    });
  };
}

/* ── 2. reconnaître le type de question ────────────────────────────────── */
function rQType(st, b) {
  const q = st.q, right = QT_OF[q.n];
  const opts = shuffle(uniq([M.QTYPES.find(t => t.k === right), ...shuffle(M.QTYPES)], t => t.k).slice(0, 4));
  b.innerHTML = kick('Type de question') + `
    <div class="prompt lb">${esc(q.q)}</div>
    <p class="prompt-fr">Quel format de réponse cette question appelle-t-elle ?</p>
    <div class="opts">${opts.map((t, i) =>
      `<button class="opt" data-k="${t.k}"><span class="k">${i + 1}</span><span>${icon(t.ic, 'sm')} <b>${esc(t.t)}</b><br><small style="color:var(--ink-3)">${esc(t.fr)}</small></span></button>`).join('')}</div>
    <div class="reveal hide" id="rv"></div>`;
  foot('<div class="hint" style="text-align:center">Le mot-clé en tête de question donne le format.</div>');
  qsa('#sxBody .opt').forEach(btn => btn.onclick = () => {
    const good = btn.dataset.k === right, t = M.QTYPES.find(x => x.k === right);
    qsa('#sxBody .opt').forEach(o => {
      o.disabled = true;
      if (o.dataset.k === right) o.classList.add('ok');
      else if (o === btn) o.classList.add('no');
    });
    track('typ', good); grade('t' + right, good ? 2 : 0);
    if (good) { SX.ok++; addXp(4, true); beep('ok'); } else { SX.ko++; beep('no'); buzz(30); }
    const rv = $('rv'); rv.classList.remove('hide');
    rv.innerHTML = `<div class="lab">${esc(t.t)} — ${esc(t.fr)}</div>
      <p style="font-family:var(--sans);font-size:.9rem">${esc(t.how)}</p>
      <ul class="frames">${t.frames.slice(0, 3).map(f => `<li>${esc(f)}</li>`).join('')}</ul>`;
    foot('<button class="btn sig big" data-act="next">Suivant</button>');
    S.day.steps++;
  });
}

/* ── 3. dire à voix haute ──────────────────────────────────────────────── */
let mediaRec = null, chunks = [], stream = null, spkT = null;
function stopRec() {
  clearInterval(spkT); spkT = null;
  try { mediaRec && mediaRec.state === 'recording' && mediaRec.stop(); } catch (e) { }
  try { stream && stream.getTracks().forEach(t => t.stop()); } catch (e) { }
  mediaRec = null; stream = null;
}
const canRec = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);

function rQSpeak(st, b) {
  const q = st.q, mine = S.mine[q.n];
  const th = C.themes[q.t];
  b.innerHTML = kick('À voix haute', th.fr) + `
    <div class="prompt lb">${esc(q.q)}</div>
    <div class="speak">
      <div class="timer" id="tm">0:20</div>
      <button class="mic" id="mic" aria-label="S'enregistrer">&#9679;</button>
      <div class="hint" id="mh">${canRec() ? "Appuie pour t'enregistrer — facultatif" : "Enregistrement indisponible ici"}</div>
    </div>
    <div class="beats" id="beats">
      <button data-i="0">Äntwert<small>la réponse</small></button>
      <button data-i="1">Grond<small>la raison</small></button>
      <button data-i="2">Beispill<small>un exemple</small></button>
    </div>
    <p class="hint" style="margin-top:10px;text-align:center">Coche les trois temps quand tu les as dits.</p>
    <div class="reveal hide" id="rv">
      ${mine ? `<div class="lab">Ta réponse écrite</div><p>${esc(mine)}</p>` : `<div class="lab">Réponse modèle</div><p>${esc(q.m || '')}</p>`}
    </div>
    <div id="pl" style="margin-top:12px"></div>`;

  let left = 20, hit = [false, false, false];
  const tm = $('tm');
  spkT = setInterval(() => {
    left--; tm.textContent = '0:' + String(Math.max(0, left)).padStart(2, '0');
    if (left <= 5) tm.classList.add('warn');
    if (left <= 0) { clearInterval(spkT); spkT = null; tm.textContent = 'Zäit ass ëm'; }
  }, 1000);

  qsa('#beats button').forEach(btn => btn.onclick = () => {
    const i = +btn.dataset.i; hit[i] = !hit[i]; btn.classList.toggle('on', hit[i]);
  });
  $('mic').onclick = () => canRec() ? toggleRec($('mic'), $('pl'), $('mh')) : null;

  foot(`<button class="btn dim big" id="see">Voir la réponse</button>
        <button class="btn sig big" id="go">C'est dit</button>`);
  $('see').onclick = () => $('rv').classList.remove('hide');
  $('go').onclick = () => {
    const n = hit.filter(Boolean).length;
    track('oral', n >= 2);
    if (!st.soft) { grade(qId(q.n), n >= 3 ? 2 : n >= 1 ? 1 : 0); addXp(3 + n * 2, true); }
    S.day.steps++; next();
  };
}
async function toggleRec(btn, playerBox, hintEl) {
  if (mediaRec && mediaRec.state === 'recording') { mediaRec.stop(); return; }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = []; mediaRec = new MediaRecorder(stream);
    mediaRec.ondataavailable = e => e.data.size && chunks.push(e.data);
    mediaRec.onstop = () => {
      btn.classList.remove('rec'); btn.innerHTML = '&#9679;';
      hintEl.textContent = 'Réécoute-toi : comprendrais-tu quelqu\'un qui parle comme ça ?';
      const url = URL.createObjectURL(new Blob(chunks, { type: mediaRec.mimeType || 'audio/webm' }));
      playerBox.innerHTML = '<audio controls src="' + url + '" style="width:100%"></audio>';
      try { stream.getTracks().forEach(t => t.stop()); } catch (e) { }
    };
    mediaRec.start();
    btn.classList.add('rec'); btn.innerHTML = '&#9632;';
    hintEl.textContent = 'Ça tourne — appuie pour arrêter';
  } catch (e) {
    hintEl.textContent = 'Micro refusé. Le navigateur le réserve aux pages en https.';
  }
}

/* ── 4. écrire sa propre réponse ───────────────────────────────────────────
   La pièce maîtresse : personne ne passe l'examen avec la vie de quelqu'un
   d'autre. Le modèle sert d'ossature, la réponse gardée est la tienne. */
function rQMine(st, b) {
  const q = st.q, th = C.themes[q.t];
  const t = M.QTYPES.find(x => x.k === QT_OF[q.n]);
  b.innerHTML = kick('Ma réponse', th.fr) + `
    <div class="prompt lb">${esc(q.q)}</div>
    <div style="margin:16px 0 8px" class="tag q">${esc(t.st || t.t)}</div>
    <ul class="frames">${t.frames.slice(0, 3).map(f => `<li>${esc(f)}</li>`).join('')}</ul>
    <textarea class="mine" id="ta" placeholder="Écris ta réponse — réponse, raison, exemple.">${esc(S.mine[q.n] || '')}</textarea>
    <details class="fold" style="margin-top:12px"><summary>Voir la réponse modèle</summary>
      <div class="body"><p class="lb" style="font-size:.95rem">${esc(q.m || '—')}</p>
      <p class="hint" style="margin-top:10px">Ne la recopie pas : remplace les faits par les tiens. Ce sont les tiens que tu retrouveras le jour J.</p></div></details>`;
  foot(`<button class="btn dim big" data-act="next">Passer</button>
        <button class="btn sig big" id="go">Garder ma réponse</button>`);
  $('go').onclick = () => {
    const v = $('ta').value.trim();
    if (v) {
      S.mine[q.n] = v;
      if (!seen(qId(q.n))) S.srs[qId(q.n)] = { b: 1, due: addDays(TODAY, 1), ok: 1, ko: 0 };
      addXp(8, true); save(); beep('ok');
    }
    S.day.steps++; next();
  };
}

/* ── 5. rappel silencieux du soir ──────────────────────────────────────── */
function rPreview(st, b) {
  const q = st.q, mine = S.mine[q.n];
  b.innerHTML = kick('Demain') + `
    <div class="prompt lb">${esc(q.q)}</div>
    <div class="reveal" style="margin-top:22px">
      <div class="lab">${mine ? 'Ta réponse' : 'Réponse modèle'}</div>
      <p>${esc(mine || q.m || '')}</p>
    </div>
    <p class="hint" style="margin-top:16px">Lis, ne réponds pas. Demain matin elle te reviendra plus vite.</p>`;
  foot('<button class="btn sig big" data-act="next">Suivant</button>');
}

/* ── 6. le bon article ─────────────────────────────────────────────────── */
const ART = [['en', 'den'], ['eng', "d'"], ['e', "d'"]];
const GNAME = ['masculin', 'féminin', 'neutre'];
function rGender(st, b) {
  const v = st.v;
  b.innerHTML = kick('Le bon article', v.grp) + `
    <div class="prompt lb">… ${esc(v.w)}</div>
    <p class="prompt-fr">Quel article indéfini ?</p>
    <div class="opts">${ART.map((a, i) =>
      `<button class="opt" data-g="${i}"><span class="k">${i + 1}</span><span class="lb" style="font-size:1.05rem">${a[0]} ${esc(v.w)}</span><span style="margin-left:auto;color:var(--ink-3);font-size:.78rem">${GNAME[i]}</span></button>`).join('')}</div>`;
  foot('<div class="hint" style="text-align:center">Le genre s\'apprend avec le mot, jamais après.</div>');
  qsa('#sxBody .opt').forEach(btn => btn.onclick = () => {
    const good = +btn.dataset.g === v.g;
    qsa('#sxBody .opt').forEach(o => {
      o.disabled = true;
      if (+o.dataset.g === v.g) o.classList.add('ok'); else if (o === btn) o.classList.add('no');
    });
    track('gender', good); grade('w' + v.w, good ? 2 : 0);
    if (good) { SX.ok++; addXp(3, true); beep('ok'); } else { SX.ko++; beep('no'); }
    foot(`<div class="hint" style="text-align:center">${ART[v.g][1]}${esc(v.w)} — ${GNAME[v.g]}</div>
          <button class="btn sig big" data-act="next">Suivant</button>`);
    S.day.steps++;
  });
}

/* ── 7. grammaire : repérer la faute ───────────────────────────────────── */
function rGram(st, b) {
  const opts = shuffle([[st.bad, 0], ...st.good.map(g => [g, 1])]);
  b.innerHTML = kick('Grammaire', st.g.t) + `
    <p class="prompt" style="font-size:1.15rem">Laquelle de ces phrases est fausse ?</p>
    <div class="opts">${opts.map(([r, ok], i) =>
      `<button class="opt" data-ok="${ok}"><span class="k">${i + 1}</span><span class="lb">${esc(r[0])}</span></button>`).join('')}</div>
    <div class="reveal hide" id="rv"></div>`;
  foot('');
  qsa('#sxBody .opt').forEach(btn => btn.onclick = () => {
    const good = btn.dataset.ok === '0';
    qsa('#sxBody .opt').forEach(o => {
      o.disabled = true;
      if (o.dataset.ok === '0') o.classList.add(good ? 'ok' : 'no');
    });
    track('gram', good); grade('g' + st.g.k, good ? 2 : 0);
    if (good) { SX.ok++; addXp(4, true); beep('ok'); } else { SX.ko++; beep('no'); }
    const rv = $('rv'); rv.classList.remove('hide');
    rv.innerHTML = `<div class="lab">${esc(st.g.t)}</div>
      <p style="font-family:var(--sans);font-size:.9rem">${st.g.body.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</p>`;
    foot('<button class="btn sig big" data-act="next">Suivant</button>');
    S.day.steps++;
  });
}

/* ── 8. conjugaison ────────────────────────────────────────────────────── */
function rConj(st, b) {
  const c = st.c, i = st.i, right = c.f[i];
  const wrong = shuffle(c.f.filter((f, j) => j !== i && f !== right)).slice(0, 2);
  const opts = shuffle([right, ...wrong, pick(M.CONJ).f[i]].filter((v, j, a) => a.indexOf(v) === j)).slice(0, 4);
  b.innerHTML = kick('Conjugaison', c.v + ' — ' + c.fr) + `
    <div class="prompt lb">${esc(M.PERS[i])} …</div>
    <p class="prompt-fr">Quelle forme de <b>${esc(c.v)}</b> ?</p>
    <div class="opts">${opts.map((o, j) =>
      `<button class="opt" data-v="${esc(o)}"><span class="k">${j + 1}</span><span class="lb">${esc(M.PERS[i])} ${esc(o)}</span></button>`).join('')}</div>`;
  foot('');
  qsa('#sxBody .opt').forEach(btn => btn.onclick = () => {
    const good = btn.dataset.v === right;
    qsa('#sxBody .opt').forEach(o => {
      o.disabled = true;
      if (o.dataset.v === right) o.classList.add('ok'); else if (o === btn) o.classList.add('no');
    });
    track('conj', good); grade('c' + c.v, good ? 2 : 0);
    if (good) { SX.ok++; addXp(3, true); beep('ok'); } else { SX.ko++; beep('no'); }
    foot(`<div class="hint" style="text-align:center">${M.PERS.map((p, j) => p.split(' ')[0] + ' ' + c.f[j]).join(' · ')}</div>
          <button class="btn sig big" data-act="next">Suivant</button>`);
    S.day.steps++;
  });
}

/* ── 9. un bloc de photo ───────────────────────────────────────────────── */
function rPhotoBlk(st, b) {
  const p = st.p, blk = st.b;
  b.innerHTML = kick('Photo', p.fr) + `
    <div class="pfull"><img src="${esc(p.img)}" alt="${esc(p.fr)}" loading="lazy"></div>
    <div style="margin-top:16px" class="tag sig">${esc(blk.l)}</div>
    <p class="prompt" style="font-size:1.1rem;margin-top:10px">${esc(blk.h)}</p>
    <p class="hint" style="margin-top:8px">Dis-le à voix haute, en deux ou trois phrases, avant de regarder.</p>
    <div class="reveal hide" id="rv"><div class="lab">Une façon de le dire</div><p>${esc(blk.t)}</p></div>`;
  foot('<button class="btn sig big" id="go">Voir une formulation</button>');
  $('go').onclick = () => {
    $('rv').classList.remove('hide');
    track('foto', true);
    (S.photos[p.id] = S.photos[p.id] || {}).seen = true;
    addXp(4, true); save();
    foot('<button class="btn sig big" data-act="next">Suivant</button>');
    S.day.steps++;
  };
}

/* ── 10. la photo dans la tête ─────────────────────────────────────────── */
function rPhotoMind(st, b) {
  const p = st.p;
  b.innerHTML = kick(st.evening ? 'Une photo en tête' : 'Enchaîner la structure') + `
    <div class="pfull"><img src="${esc(p.img)}" alt="${esc(p.fr)}" loading="lazy"></div>
    <p class="prompt" style="font-size:1.1rem;margin-top:16px">${st.evening
      ? 'Regarde-la trente secondes. Puis ferme les yeux et déroule A · B · C · D dans ta tête.'
      : 'Enchaîne les quatre blocs à voix haute, sans t\'arrêter.'}</p>
    <div class="timer" id="tm" style="text-align:center;margin:22px 0">1:00</div>
    <div class="beats">${M.PIC_METHOD.map(m => `<button data-k="${m.k}">${m.k}<small>${esc(m.fr)}</small></button>`).join('')}</div>`;
  let left = 60;
  const tm = $('tm');
  spkT = setInterval(() => {
    left--; tm.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
    if (left <= 0) { clearInterval(spkT); spkT = null; tm.textContent = 'Fäerdeg'; }
  }, 1000);
  qsa('#sxBody .beats button').forEach(btn => btn.onclick = () => btn.classList.toggle('on'));
  foot('<button class="btn sig big" id="go">C\'est fait</button>');
  $('go').onclick = () => {
    (S.photos[p.id] = S.photos[p.id] || {}).seen = true;
    track('foto', true); addXp(5, true); save(); S.day.steps++; next();
  };
}

/* ── 11. compréhension de l'oral ────────────────────────────────────────────
   La deuxième épreuve, notée au B1 — un cran au-dessus de l'expression orale.
   On reproduit la contrainte qui fait la difficulté : deux écoutes, pas trois,
   et aucun texte sous les yeux tant qu'on n'a pas répondu. */
function rLauscht(st, b) {
  const d = st.d, K = L.KIND[d.kind];
  const rec = S.lauscht[d.id] || (S.lauscht[d.id] = { best: 0, tries: 0 });
  const answers = st.ans || (st.ans = new Array(d.q.length).fill(-1));
  let plays = st.plays || 0;
  const done = () => answers.every(a => a >= 0);

  b.innerHTML = kick(K.fr, d.fr) + `
    <h2 class="lb" style="font-size:1.3rem;font-weight:500;margin-bottom:4px">${esc(d.title)}</h2>
    <p class="hint">${esc(d.intro)}</p>
    <div class="player" id="pl">
      <button class="btn sig big" id="play">Première écoute</button>
      <div class="plines"><i id="plBar" style="width:0%"></i></div>
      <div class="row" style="justify-content:space-between;align-items:center;margin-top:9px">
        <span class="hint" id="plState">Lis d'abord les questions.</span>
        <button class="chip" id="slow" aria-pressed="false">Plus lentement</button>
      </div>
    </div>
    <div class="sec"><h2>Questionnaire</h2></div>
    <div id="qs">${d.q.map((q, i) => `
      <div class="lq" data-i="${i}">
        <p class="lq-q"><span class="num">${i + 1}.</span> ${esc(q.q)}</p>
        <div class="opts">${q.o.map((o, j) =>
          `<button class="opt" data-i="${i}" data-j="${j}"><span class="k">${'ABCD'[j]}</span><span class="lb">${esc(o)}</span></button>`).join('')}</div>
      </div>`).join('')}</div>
    <div id="corr"></div>`;

  const setFoot = () => foot(`<div class="hint" style="text-align:center" id="fh">${
    done() ? 'Tu peux corriger.' : (n => n + ' ' + plural(n, 'question') + ' sans réponse')(d.q.length - answers.filter(a => a >= 0).length)}</div>
    <button class="btn sig big" id="go"${done() ? '' : ' disabled'}>Corriger</button>`);
  setFoot();

  let slow = false;
  $('slow').onclick = () => {
    slow = !slow;
    $('slow').classList.toggle('on', slow);
    $('slow').setAttribute('aria-pressed', String(slow));
  };

  $('play').onclick = () => {
    if (SEQ) { stopSpeak(); $('play').textContent = 'Reprendre'; $('plState').textContent = 'En pause.'; return; }
    plays++; st.plays = plays;
    $('play').textContent = 'Arrêter';
    $('plState').textContent = plays >= 2
      ? "Deuxième écoute — la dernière, comme à l'examen"
      : 'Première écoute sur deux';
    speakLines(d.lines, {
      rate: slow ? .72 : .95,
      onLine: (i, n) => { $('plBar').style.width = Math.round(i / n * 100) + '%'; },
      onEnd: why => {
        $('plBar').style.width = '100%';
        if (why === 'sans-voix') {
          /* Aucune voix installée : l'exercice deviendrait impossible. On bascule
             en lecture, en le disant, plutôt que de laisser un bouton mort. */
          $('plState').textContent = 'Aucune voix installée sur cet appareil — le texte s\'affiche.';
          $('pl').insertAdjacentHTML('beforeend', transcript(d));
          $('play').disabled = true;
          return;
        }
        $('play').textContent = plays >= 2 ? 'Réécouter encore' : 'Deuxième écoute';
        $('plState').textContent = plays >= 2
          ? "À l'examen, tu n'aurais pas de troisième écoute."
          : 'Deuxième écoute quand tu veux.';
      }
    });
  };

  qsa('#qs .opt').forEach(btn => btn.onclick = () => {
    const i = +btn.dataset.i, j = +btn.dataset.j;
    answers[i] = j;
    qsa(`#qs .opt[data-i="${i}"]`).forEach(o => o.classList.toggle('on', +o.dataset.j === j));
    setFoot(); wireGo();
  });

  function wireGo() {
    const g = $('go'); if (!g) return;
    g.onclick = () => {
      stopSpeak();
      const good = d.q.filter((q, i) => answers[i] === q.a).length;
      const pct = Math.round(good / d.q.length * 100);
      rec.tries++; rec.best = Math.max(rec.best || 0, pct); rec.plays = plays;
      track('lausch', pct >= 60);
      grade('l' + d.id, pct >= 80 ? 2 : pct >= 50 ? 1 : 0);
      addXp(4 + good * 3, true);
      SX.ok += good; SX.ko += d.q.length - good;
      S.day.steps++; saveNow();

      qsa('#qs .opt').forEach(o => {
        const i = +o.dataset.i, j = +o.dataset.j;
        o.disabled = true;
        if (j === d.q[i].a) o.classList.add('ok');
        else if (answers[i] === j) o.classList.add('no');
      });
      qsa('#qs .lq').forEach((el, i) => {
        el.insertAdjacentHTML('beforeend',
          `<p class="lq-why">${answers[i] === d.q[i].a ? '' : '<b>Réponse : ' + 'ABCD'[d.q[i].a] + '.</b> '}${esc(d.q[i].why)}</p>`);
      });
      $('corr').innerHTML = `
        <div class="sec"><h2>Résultat</h2></div>
        <div class="card pad" style="text-align:center">
          <div class="score num">${good}<span>/${d.q.length}</span></div>
          <p class="hint" style="margin-top:4px">${pct >= 80 ? 'Niveau B1 tenu sur ce document.'
            : pct >= 50 ? 'Passable. Réécoute en suivant le texte.' : 'Reprends-le en lisant le texte, puis réécoute sans.'}</p>
          <div class="row" style="justify-content:center;margin-top:12px">
            <button class="btn dim" id="again">Réécouter</button>
            <button class="btn dim" id="txt">Voir le texte</button>
          </div>
        </div>
        <div id="tx"></div>
        <div class="sec"><h2>À retenir</h2></div>
        <div class="card pad">${d.words.map(([lb, fr]) =>
          `<div class="gline"><span class="m">·</span><span class="t">${esc(lb)}<small>${esc(fr)}</small></span></div>`).join('')}</div>`;
      $('again').onclick = () => { $('play').disabled = false; $('play').click(); };
      $('txt').onclick = () => {
        $('tx').innerHTML = $('tx').innerHTML ? '' : transcript(d);
      };
      foot('<button class="btn sig big" data-act="next">Suivant</button>');
      $('corr').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  }
  wireGo();
}

function transcript(d) {
  const sp = d.speakers || [];
  return `<div class="card pad script">${d.lines.map(([w, t]) =>
    `<p>${w === 'N' ? '' : `<b>${esc(sp[w] || ('Persoun ' + (w + 1)))} :</b> `}${esc(t)}</p>`).join('')}</div>`;
}

/* ── 12. bilan d'un examen blanc d'écoute ──────────────────────────────── */
function rLauschtEnd(st, b) {
  const tot = st.docs.reduce((a, d) => a + d.q.length, 0);
  const good = SX.ok;
  const pct = Math.round(good / tot * 100);
  b.innerHTML = `<div style="text-align:center;padding:20px 0 10px">
      <div class="stepno">${pct}%</div>
      <h2 style="font-size:1.35rem;margin:14px 0 8px">Examen blanc d'écoute</h2>
      <div class="stat3" style="margin:18px 0">
        <div><b>${good}/${tot}</b><span>réponses justes</span></div>
        <div><b>${st.docs.length}</b><span>documents</span></div>
        <div><b>${pct >= 50 ? 'oui' : 'non'}</b><span>seuil des 50 %</span></div>
      </div>
      <p class="lead" style="max-width:32em;margin:0 auto">${pct >= 70
        ? "Tu es au-dessus de ce que l'épreuve demande. Garde le rythme de deux écoutes."
        : pct >= 50 ? "Tu passes le seuil, mais sans marge. Les chiffres et les « awer » sont ce qui te coûte le plus."
        : "En dessous du seuil. Reprends document par document en mode entraînement, texte sous les yeux à la deuxième écoute."}</p>
    </div>`;
  foot('<button class="btn sig big" data-act="quit">Terminer</button>');
  S.mocks.push({ date: TODAY, kind: 'lauscht', pct, good, tot });
  addXp(15); saveNow();
}

/* ── 13. cartons d'information (session du soir) ───────────────────────── */
function rInfo(st, b) {
  b.innerHTML = `<div style="text-align:center;padding:30px 0 10px">
      <div class="stepno">${esc(st.n || '')}</div>
      <h2 style="font-size:1.35rem;margin:14px 0 10px">${esc(st.title)}</h2>
      ${st.lines ? `<div class="stat3" style="margin:18px 0">${st.lines.map(([a, c]) =>
        `<div><b>${esc(a)}</b><span>${esc(c)}</span></div>`).join('')}</div>` : ''}
      <p class="lead" style="max-width:32em;margin:0 auto">${esc(st.body)}</p>
    </div>`;
  foot(`<button class="btn sig big" data-act="${st.t === 'close' ? 'quit' : 'next'}">${st.t === 'close' ? 'Bonne nuit' : 'Continuer'}</button>`);
}

/* ── bilan ─────────────────────────────────────────────────────────────── */
function finish() {
  const min = Math.max(1, Math.round((Date.now() - SX.t0) / 60000));
  const total = SX.ok + SX.ko;
  const pct = total ? Math.round(SX.ok / total * 100) : 0;
  const ev = SX.preset === 'owend';
  if (ev) S.day.owend = TODAY; else if (SX.preset === 'dag') S.day.dag = TODAY;
  addXp(ev ? 12 : 10);
  S.streak.best = Math.max(S.streak.best || 0, streakLen());
  if ((S.xp.byDay[TODAY] || 0) >= goalXp() && (S.streak.freezes || 0) < 2 && Math.random() < .25) S.streak.freezes++;
  saveNow();

  const st = streakLen();
  $('sxBar').style.width = '100%'; $('sxCnt').textContent = '';
  $('sxBody').innerHTML = `<div style="text-align:center;padding:26px 0 10px">
      <div class="stepno">${ev ? '&#9790;' : '&#10003;'}</div>
      <h2 style="font-size:1.5rem;margin:14px 0 6px">${ev ? 'Session du soir terminée' : 'Session terminée'}</h2>
      <p class="lead">${min} ${plural(min, 'minute')}${total ? ' · ' + pct + '% de réussite' : ''}</p>
      <div class="stat3" style="margin-top:20px">
        <div><b>${SX.ok}</b><span>réussis</span></div>
        <div><b>${SX.ko}</b><span>à revoir</span></div>
        <div><b>${st}</b><span>${plural(st, 'jour')} d'affilée</span></div>
      </div>
      ${goalDone(TODAY) ? '<p class="lead" style="margin-top:18px">Objectif du jour atteint.</p>'
        : `<p class="lead" style="margin-top:18px">Encore ${goalXp() - xpToday()} XP pour valider la journée.</p>`}
      ${!ev && !S.day.owend && isEvening() ? '<div class="note sig" style="text-align:left;margin-top:18px">Il est tard : la session du soir repasse ce que tu viens de rater. C\'est le moment où ça s\'imprime le mieux.</div>' : ''}
    </div>`;
  foot(`${!ev && isEvening() && !S.day.owend ? '<button class="btn sig big" data-act="start" data-p="owend">Enchaîner la session du soir</button>' : ''}
        <button class="btn ${!ev && isEvening() && !S.day.owend ? 'dim' : 'sig'} big" data-act="quit">Terminer</button>`);
  SX.i = SX.steps.length;
  if (!ev) confettiless();
}
/* Pas de confettis : la récompense, c'est le chiffre qui monte et la série qui
   tient. Un feu d'artifice à chaque séance finit par ne plus rien vouloir dire. */
function confettiless() { buzz([12, 40, 12]); }

/* ══════════════════════════════════════════════════════════════════════════
   ÉCRANS
   ══════════════════════════════════════════════════════════════════════════ */
let VIEW = 'haut';
function showView(v) {
  stopSpeak();
  VIEW = v; S.lastView = v; save();
  qsa('.view').forEach(s => s.classList.toggle('on', s.id === 'v-' + v));
  qsa('.tabbar button, .rail button.nav').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  renderView(); scrollTo({ top: 0, behavior: 'instant' });
}
function renderView() {
  ({ haut: rHome, froen: rFroen, lauscht: rLauscht_view, foto: rFoto, fiche: rFiche, prog: rProg })[VIEW]();
  paintHud();
}
function paintHud(pop) {
  $('hStreak').textContent = streakLen();
  $('hXp').textContent = S.xp.total;
  if (pop) { const e = $('hXp').parentElement; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); }
  const done = Math.min(3, Math.floor(xpToday() / (goalXp() / 3)));
  qsa('#beatMark i').forEach((i, k) => i.classList.toggle('on', k < Math.max(1, done)));
}

/* ── accueil ───────────────────────────────────────────────────────────── */
function greet() {
  const h = new Date().getHours(), n = S.profile.name ? ', ' + S.profile.name : '';
  if (h < 6) return 'Bonne nuit' + n;
  if (h < 11) return 'Bonjour' + n;
  if (h < 18) return 'Bon après-midi' + n;
  return 'Bonsoir' + n;
}
function daysLeft() { return S.profile.examDate ? diffDays(TODAY, S.profile.examDate) : null; }

function rHome() {
  const ev = isEvening(), dl = daysLeft(), r = readiness();
  const dq = dueQ().length, hero = pick;
  const canEvening = S.day.steps > 0 || S.day.dag;
  const doneEvening = S.day.owend === TODAY;

  /* Le héros pose une vraie question d'examen. C'est le geste que l'app
     entraîne : quelqu'un demande, tu réponds tout de suite. */
  const q = C.froen[Math.abs(diffDays('2026-01-01', TODAY) * 7 + new Date().getHours()) % C.froen.length];
  const th = C.themes[q.t];

  let heroHtml;
  if (ev && !doneEvening) {
    heroHtml = `<div class="hero owend">
      <div class="eyebrow"><span class="beat" aria-hidden="true"><i class="on"></i><i class="on"></i><i class="on"></i></span>${esc(greet())}</div>
      <div class="qq">Owesrevisioun</div>
      <p class="qfr">${canEvening
        ? "Six minutes pour repasser ce que tu as raté aujourd'hui, dire trois réponses à voix haute et voir demain."
        : "Fais d'abord un tour côté jour : la session du soir repasse ce que tu as travaillé, elle n'apprend rien de neuf."}</p>
      <div class="acts">
        ${canEvening ? '<button class="btn sig" data-act="start" data-p="owend">Commencer la session du soir</button>'
          : '<button class="btn sig" data-act="start" data-p="dag">Session du jour</button>'}
        <button class="btn dim" data-act="why-evening">Pourquoi le soir ?</button>
      </div></div>`;
  } else {
    heroHtml = `<div class="hero">
      <div class="eyebrow"><span class="beat" aria-hidden="true"><i class="on"></i><i class="on"></i><i class="on"></i></span>${esc(greet())}
        ${dl != null && dl >= 0 ? `<span style="margin-left:auto;color:var(--sig)" class="num">J−${dl}</span>` : ''}</div>
      <div class="qq lb">${esc(q.q)}</div>
      <p class="qfr">${esc(th.fr)} · réponds à voix haute, puis vérifie</p>
      <div class="acts">
        <button class="btn sig" data-act="start" data-p="dag">Session du jour${dq ? ' · ' + dq + ' due' + (dq > 1 ? 's' : '') : ''}</button>
        ${hasTTS() ? `<button class="btn dim" data-say="${esc(q.q)}">&#9835; Écouter</button>` : ''}
        <button class="btn dim" data-act="open-q" data-n="${q.n}">Voir la réponse</button>
      </div></div>`;
  }

  const tiles = [
    ['i-flash', 'Deux minutes', dq ? dq + ' question' + (dq > 1 ? 's' : '') + ' due' + (dq > 1 ? 's' : '') : 'Sauver la journée', 'flash'],
    ['i-froen', 'Reconnaître', 'Le type de question', 'typ'],
    ['i-speak', 'À voix haute', 'Tes propres réponses', 'speak'],
    ['i-write', 'Écrire mes réponses', myCount() + ' sur ' + TOTAL_Q, 'write'],
    ['i-ear', 'Écouter', lauschtDone() + ' documents sur ' + L.DOCS.length, 'lauscht'],
    ['i-foto', 'Une photo', 'Méthode A·B·C·D', 'foto'],
    ['i-gram', 'Grammaire', 'Les fautes qui s\'entendent', 'gram']
  ];

  /* Trois zéros au premier lancement ne disent rien et découragent. Tant qu'il
     n'y a pas de quoi mesurer, on indique quoi faire. */
  const fresh = myCount() === 0 && S.xp.total < 20;
  $('v-haut').innerHTML = heroHtml + (fresh ? `
    <div class="card pad" style="margin-top:12px">
      <b style="font-size:.94rem">Commence par écrire tes réponses</b>
      <p class="hint" style="margin-top:5px">Les ${TOTAL_Q} questions sont là avec une réponse modèle. Remplace les faits par les tiens : ce sont les tiens qui reviendront le jour de l'examen.</p>
      <button class="btn sig" style="margin-top:11px" data-act="start" data-p="write">Écrire mes six premières</button>
    </div>` : `
    <div class="stat3">
      <div><b>${myCount()}</b><span>réponses à moi</span></div>
      <div><b>${Object.keys(S.srs).filter(k => k[0] === 'q' && mastered(k)).length}</b><span>questions sûres</span></div>
      <div><b>${r.score}%</b><span>préparation</span></div>
    </div>`) + `

    <div class="sec"><h2>Reprendre maintenant</h2></div>
    <div class="qgrid">${tiles.map(([ic, t, s, p]) =>
      `<button class="qtile" data-act="start" data-p="${p}">${icon(ic)}<b>${esc(t)}</b><span>${esc(s)}</span></button>`).join('')}</div>

    <div class="sec"><h2>Les deux rendez-vous</h2><span class="more" data-act="why-evening">à quoi ça sert</span></div>
    <ul class="plan card" style="padding:4px 16px">
      <li class="${S.day.dag === TODAY ? 'done' : ''}"><span class="tick">${S.day.dag === TODAY ? '&#10003;' : icon('i-sun', 'sm')}</span>
        <span class="txt">Session du jour<small>Apprendre, tester, se tromper. 10 à 15 minutes.</small></span></li>
      <li class="${doneEvening ? 'done' : ''}"><span class="tick">${doneEvening ? '&#10003;' : icon('i-moon', 'sm')}</span>
        <span class="txt">Session du soir<small>${doneEvening ? 'Faite. Ta nuit fait le reste.' : 'Repasser les erreurs du jour, juste avant de dormir.'}</small></span></li>
    </ul>

    <div class="sec"><h2>Suis-je prêt·e ?</h2><span class="more" data-act="view" data-v="prog">détail</span></div>
    <div class="card pad axes">${r.parts.map(p => `
      <div class="axis"><b>${esc(p.t)}</b><span class="v">${Math.round(p.v * 100)}%</span>
        <div class="bar"><i style="width:${Math.round(p.v * 100)}%"></i></div></div>`).join('')}</div>

    <div class="sec"><h2>Le conseil du jour</h2></div>
    <div class="card pad"><p style="font-size:.95rem">${esc(M.TIPS[Math.abs(diffDays('2026-01-01', TODAY)) % M.TIPS.length])}</p></div>`;
}

/* ── les 278 questions ─────────────────────────────────────────────────── */
let froenTheme = 0, froenFilter = 'all';
function rFroen() {
  const list = BY_THEME[froenTheme].filter(q =>
    froenFilter === 'mine' ? answered(q.n) :
    froenFilter === 'todo' ? !answered(q.n) :
    froenFilter === 'due' ? due(qId(q.n)) : true);
  const th = C.themes[froenTheme];
  const doneT = BY_THEME[froenTheme].filter(q => answered(q.n)).length;

  $('v-froen').innerHTML = `
    <h1 style="font-size:1.45rem">Les questions de l'examen</h1>
    <p class="lead" style="margin-top:6px">${TOTAL_Q} questions, telles qu'elles tombent. Écris ta réponse à chacune — c'est la tienne que tu retrouveras le jour J.</p>
    <div class="chips" style="margin-top:14px">${C.themes.map((t, i) =>
      `<button class="chip ${i === froenTheme ? 'on' : ''}" data-th="${i}">${esc(t.fr)}</button>`).join('')}</div>
    <div class="seg" style="margin-bottom:14px">
      ${[['all', 'Toutes'], ['todo', 'Sans ma réponse'], ['mine', 'Écrites'], ['due', 'À revoir']].map(([k, l]) =>
        `<button class="${froenFilter === k ? 'on' : ''}" data-f="${k}">${l}</button>`).join('')}</div>
    <div class="card pad" style="display:flex;gap:12px;align-items:center;margin-bottom:12px">
      <div style="flex:1"><b style="font-size:.92rem">${esc(th.fr)}</b>
        <div class="bar thin" style="margin-top:7px"><i style="width:${Math.round(doneT / BY_THEME[froenTheme].length * 100)}%"></i></div>
        <div class="hint" style="margin-top:5px">${doneT} / ${BY_THEME[froenTheme].length} réponses écrites</div></div>
      <button class="btn sig" data-act="start" data-p="theme" data-arg="${froenTheme}">S'entraîner</button>
    </div>
    <div class="card rows">${list.length ? list.map(q => {
      const mine = answered(q.n), r = S.srs[qId(q.n)];
      const mark = mine ? (r && mastered(qId(q.n)) ? '●' : '◐') : '○';
      return `<button class="qrow ${mine ? 'mine' : ''}" data-act="open-q" data-n="${q.n}">
        <span class="n">${q.n}</span>
        <span class="q">${esc(q.q)}<small>${esc(M.QTYPES.find(t => t.k === QT_OF[q.n]).st)}</small></span>
        <span class="st" title="${mine ? 'réponse écrite' : 'pas encore de réponse'}">${mark}</span></button>`;
    }).join('') : '<div class="pad hint" style="text-align:center;padding:26px">Rien dans ce filtre.</div>'}</div>`;
}

function openQuestion(n) {
  const q = Q_OF[n]; if (!q) return;
  const th = C.themes[q.t], t = M.QTYPES.find(x => x.k === QT_OF[n]);
  const mine = S.mine[n] || '';
  openSheet(`
    <div class="tag q">${esc(th.fr)}</div>
    <h2 class="lb" style="font-size:1.28rem;margin:12px 0 4px;font-weight:500">${esc(q.q)}</h2>
    <p class="hint">Question ${n} · ${esc(t.t)} — ${esc(t.fr)}</p>
    ${hasTTS() ? `<div class="row" style="margin-top:12px"><button class="btn dim" data-say="${esc(q.q)}">&#9835; Écouter</button></div>` : ''}

    <div class="sec"><h2>Comment on répond</h2></div>
    <p style="font-size:.9rem;color:var(--ink-2)">${t.how.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</p>
    <ul class="frames">${t.frames.map(f => `<li>${esc(f)}</li>`).join('')}</ul>

    <div class="sec"><h2>Ma réponse</h2></div>
    <textarea class="mine" id="qMine" placeholder="Réponse, raison, exemple.">${esc(mine)}</textarea>
    <button class="btn sig big" style="margin-top:9px" id="qSave">Garder ma réponse</button>

    <details class="fold" style="margin-top:16px"><summary>Réponse modèle</summary>
      <div class="body"><p class="lb" style="font-size:.95rem">${esc(q.m || '—')}</p>
      <p class="hint" style="margin-top:10px">Elle vient du document de préparation : c'est la vie de quelqu'un d'autre. Garde la structure, change les faits.</p></div></details>
    <button class="btn dim big" style="margin-top:9px" data-close>Fermer</button>`);
  $('qSave').onclick = () => {
    const v = $('qMine').value.trim();
    if (v) {
      S.mine[n] = v;
      if (!seen(qId(n))) S.srs[qId(n)] = { b: 1, due: addDays(TODAY, 1), ok: 1, ko: 0 };
      addXp(8);
    } else delete S.mine[n];
    saveNow(); closeSheet(); renderView(); toast(v ? 'Réponse gardée' : 'Réponse effacée');
  };
}

/* ── l'écoute ──────────────────────────────────────────────────────────── */
function rLauscht_view() {
  const byKind = k => L.DOCS.filter(d => d.kind === k);
  const scoreOf = d => (S.lauscht[d.id] || {}).best;
  const tried = L.DOCS.filter(d => (S.lauscht[d.id] || {}).tries).length;
  const avg = tried ? Math.round(L.DOCS.reduce((a, d) => a + (scoreOf(d) || 0), 0) / L.DOCS.length) : 0;
  const mocks = S.mocks.filter(m => m.kind === 'lauscht');

  $('v-lauscht').innerHTML = `
    <h1 style="font-size:1.45rem">L'écoute</h1>
    <p class="lead" style="margin-top:6px">La deuxième épreuve, et la seule notée au <b>B1</b> — un cran au-dessus de l'oral.
      Trois documents, deux écoutes chacun, un questionnaire à cocher.</p>

    <div class="card pad" style="margin-top:14px;display:flex;gap:12px;align-items:center">
      <div style="flex:1"><b style="font-size:.92rem">${tried} / ${L.DOCS.length} documents travaillés</b>
        <div class="bar thin" style="margin-top:7px"><i style="width:${Math.round(tried / L.DOCS.length * 100)}%"></i></div>
        <div class="hint" style="margin-top:5px">${tried ? 'Moyenne ' + avg + '%' : 'Commence par un message radio'}</div></div>
      <button class="btn sig" data-act="start" data-p="lauscht">Un document</button>
    </div>

    <div class="card pad" style="margin-top:10px;display:flex;gap:12px;align-items:center">
      <div style="flex:1"><b style="font-size:.92rem">Examen blanc</b>
        <div class="hint" style="margin-top:4px">Trois documents d'affilée, comme le jour J${
          mocks.length ? ' · dernier : ' + mocks[mocks.length - 1].pct + '%' : ''}</div></div>
      <button class="btn dim" data-act="start" data-p="lauschtexam">Démarrer</button>
    </div>

    <div class="sec"><h2>Comment ça se passe</h2><span class="more" data-act="how-lauscht">la méthode</span></div>
    <div class="card" style="padding:4px 16px"><div class="plan">${L.HOWTO.format.map(([t, d]) =>
      `<li><span class="tick num">·</span><span class="txt">${esc(t)}<small>${esc(d)}</small></span></li>`).join('')}</div></div>

    ${['R', 'G', 'A'].map(k => `
      <div class="sec"><h2>${esc(L.KIND[k].fr)}</h2></div>
      <div class="card rows">${byKind(k).map(d => {
        const s = scoreOf(d);
        return `<button class="dcell" data-act="start" data-p="lauscht" data-doc="${d.id}">
          ${icon(L.KIND[k].ic)}
          <span><b>${esc(d.title)}</b><small>${esc(d.fr)} · ${d.q.length} questions</small></span>
          <span class="best ${s >= 80 ? 'good' : ''}">${s == null ? '—' : s + '%'}</span></button>`;
      }).join('')}</div>`).join('')}`;
}

function howLauscht() {
  openSheet(`<h2 style="font-size:1.25rem;margin-bottom:8px">Écouter au B1</h2>
    <p class="lead">L'expression orale n'est notée qu'à l'A2, la compréhension au B1. C'est l'écoute qui élimine, et c'est celle qu'on néglige.</p>
    <div class="sec"><h2>Sept réflexes</h2></div>
    ${L.HOWTO.tips.map((t, i) => `<div class="gline"><span class="m num">${i + 1}</span>
      <span class="t" style="font-family:var(--sans);font-size:.9rem">${t.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</span></div>`).join('')}
    <div class="note">Les documents sont lus par la voix de synthèse de ton appareil, avec une voix par personne quand le système en propose plusieurs. Ce n'est pas un enregistrement d'examen, mais ça s'écoute hors ligne et tu peux ralentir.</div>
    <button class="btn sig big" style="margin-top:12px" data-act="start" data-p="lauscht" data-close>Commencer un document</button>
    <button class="btn dim big" style="margin-top:8px" data-close>Fermer</button>`);
}

/* ── les photos ────────────────────────────────────────────────────────── */
let curPhoto = null;
function rFoto() {
  if (curPhoto) return rFotoOne(PHOTO_OF[curPhoto]);
  const done = Object.values(S.photos).filter(p => p.seen).length;
  $('v-foto').innerHTML = `
    <h1 style="font-size:1.45rem">Les photos</h1>
    <p class="lead" style="margin-top:6px">${C.photos.length} photos d'entraînement, chacune décrite jusqu'au bout. La méthode est toujours la même : A · B · C · D.</p>
    <div class="card pad" style="margin-top:14px;display:flex;gap:12px;align-items:center">
      <div style="flex:1"><b style="font-size:.92rem">${done} / ${C.photos.length} travaillées</b>
        <div class="bar thin" style="margin-top:7px"><i style="width:${Math.round(done / C.photos.length * 100)}%"></i></div></div>
      <button class="btn sig" data-act="start" data-p="foto">Au hasard</button>
    </div>
    <div class="sec"><h2>Toutes les photos</h2><span class="more" data-act="view" data-v="fiche">la méthode</span></div>
    <div class="pgrid">${C.photos.map(p => `
      <button class="pcell" data-photo="${p.id}">
        <img src="${esc(p.img)}" alt="${esc(p.fr)}" loading="lazy">
        <span class="cap"><b>${esc(p.ti)}</b><span>${esc(p.fr)}${S.photos[p.id]?.seen ? ' · vue' : ''}</span></span>
      </button>`).join('')}</div>`;
}
function rFotoOne(p) {
  $('v-foto').innerHTML = `
    <button class="btn dim" data-act="photos-back" style="margin-bottom:14px">← Toutes les photos</button>
    <div class="pfull"><img src="${esc(p.img)}" alt="${esc(p.fr)}"></div>
    <h1 class="lb" style="font-size:1.35rem;margin:16px 0 2px;font-weight:500">${esc(p.ti)}</h1>
    <p class="hint">${esc(p.fr)}</p>
    <div class="row" style="margin:14px 0">
      <button class="btn sig" data-act="start" data-p="foto" data-arg="${p.id}">S'entraîner sur cette photo</button>
      <button class="btn dim" data-act="pic-timer">Chrono 5 min</button>
    </div>
    <div class="note sig">Décris d'abord, lis ensuite. L'ordre inverse ne fait rien travailler.</div>
    <details class="fold"><summary>Voir la description complète</summary><div class="body">
      ${p.p.map(b => `<div class="pblock">
        <div class="lab"><b>${esc(b.l)}</b><span>${esc(b.h)}</span></div>
        <p>${esc(b.t)}</p></div>`).join('')}
    </div></details>`;
}

/* ── la méthode ────────────────────────────────────────────────────────── */
let fiche = 'or';
function rFiche() {
  const panes = {
    or: () => {
      const g = M.GOLDEN;
      return `<div class="card pad">
        <div class="tag sig">La règle</div>
        <h2 class="lb" style="font-size:1.3rem;margin:10px 0 4px;font-weight:500">${esc(g.title)}</h2>
        <p class="hint">${esc(g.fr)}</p>
        <p style="margin-top:12px;font-size:.94rem">${esc(g.body)}</p>
        <div class="sec"><h2>En pratique</h2></div>
        <p class="lb" style="font-size:1.05rem">${esc(g.demo.q)}</p>
        <div class="gline bad" style="margin-top:10px"><span class="m">✕</span><span class="t"><s>${esc(g.demo.bad)}</s><small>correct, et pourtant raté</small></span></div>
        ${g.demo.good.map(([k, v]) => `<div class="gline"><span class="m">✓</span><span class="t">${esc(v)}<small>${esc(k)}</small></span></div>`).join('')}
      </div>
      <div class="sec"><h2>Les béquilles</h2></div>
      <p class="lead">À apprendre par cœur : elles achètent deux secondes sans faire de faute.</p>
      <div class="card pad" style="margin-top:10px">${M.FILLERS.map(([lb, fr]) =>
        `<div class="gline"><span class="m">·</span><span class="t">${esc(lb)}<small>${esc(fr)}</small></span></div>`).join('')}</div>
      <div class="sec"><h2>Les connecteurs</h2></div>
      <div class="card pad">${M.CONNECT.map(([lb, fr]) =>
        `<div class="gline"><span class="m">·</span><span class="t">${esc(lb)}<small>${esc(fr)}</small></span></div>`).join('')}</div>`;
    },
    typ: () => `<p class="lead">Repère le mot-clé : tu connais déjà le format de la réponse. C'est le levier le plus rentable de tout l'examen.</p>
      ${M.QTYPES.map(t => {
        const n = C.froen.filter(q => QT_OF[q.n] === t.k).length;
        return `<details class="fold"><summary>${icon(t.ic)} ${esc(t.t)} <span class="hint" style="margin-left:auto;padding-right:10px">${n} questions</span></summary>
        <div class="body">
          <p class="hint">${esc(t.sig)}</p>
          <p style="margin-top:10px;font-size:.92rem">${t.how.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</p>
          <ul class="frames">${t.frames.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
          <div class="sec" style="margin:16px 0 8px"><h2>Exemple</h2></div>
          <p class="lb" style="font-size:.95rem">${esc(t.ex[0])}</p>
          <p class="lb" style="font-size:.95rem;color:var(--ink-2);margin-top:6px">${esc(t.ex[1])}</p>
        </div></details>`;
      }).join('')}
      <button class="btn sig big" style="margin-top:8px" data-act="start" data-p="typ">M'entraîner à reconnaître</button>`,

    pic: () => `<p class="lead">Cinq minutes, quatre blocs. Tu ne cherches pas quoi dire : tu sais déjà dans quel ordre.</p>
      ${M.PIC_METHOD.map(m => `<details class="fold" ${m.k === 'A' ? 'open' : ''}><summary><em class="stepno sm">${m.k}</em> ${esc(m.t)}
        <span class="hint" style="margin-left:auto;padding-right:10px">${esc(m.time)}</span></summary>
        <div class="body"><p style="font-size:.92rem">${esc(m.goal)}</p>
        ${m.blocks.map(([lab, fr]) => `<div class="sec" style="margin:14px 0 6px"><h2>${esc(lab)}</h2></div>
          <ul class="frames">${fr.map(f => `<li>${esc(f)}</li>`).join('')}</ul>`).join('')}
        </div></details>`).join('')}
      <button class="btn sig big" style="margin-top:8px" data-act="view" data-v="foto">Aller aux photos</button>`,

    gram: () => `<p class="lead">Seulement les fautes qui s'entendent. Le reste ne coûte pas de points à l'A2.</p>
      ${M.GRAMMAR.map(g => `<details class="fold"><summary>${icon('i-gram')} ${esc(g.t)}</summary>
        <div class="body"><p style="font-size:.92rem">${g.body.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</p>
        <div style="margin-top:10px">${g.rows.map(([lb, fr, ok]) =>
          `<div class="gline ${ok ? '' : 'bad'}"><span class="m">${ok ? '✓' : '✕'}</span><span class="t">${ok ? esc(lb) : '<s>' + esc(lb) + '</s>'}<small>${esc(fr)}</small></span></div>`).join('')}</div>
        </div></details>`).join('')}
      <div class="sec"><h2>Conjugaison — présent</h2></div>
      ${M.CONJ.map(c => `<details class="fold"><summary>${esc(c.v)} <span class="hint" style="margin-left:auto;padding-right:10px">${esc(c.fr)}</span></summary>
        <div class="body"><table class="conj">${M.PERS.map((p, i) =>
          `<tr><td>${esc(p)}</td><td>${esc(c.f[i])}</td></tr>`).join('')}</table></div></details>`).join('')}
      <button class="btn sig big" style="margin-top:8px" data-act="start" data-p="gram">Faire les exercices</button>`,

    exam: () => `<p class="lead">Ce qui se passe vraiment le jour de l'épreuve, et sur quoi on te note.</p>
      ${M.EXAM.parts.map(([t, fr, d, body]) => `<div class="card pad" style="margin-bottom:9px">
        <div style="display:flex;gap:10px;align-items:baseline"><b>${esc(t)}</b><span class="hint">${esc(fr)}</span>
          <span class="num hint" style="margin-left:auto">${esc(d)}</span></div>
        <p style="margin-top:8px;font-size:.9rem;color:var(--ink-2)">${esc(body)}</p></div>`).join('')}
      <div class="sec"><h2>La grille</h2></div>
      <div class="card pad">${M.EXAM.grid.map(([t, fr, note]) =>
        `<div class="gline"><span class="m">·</span><span class="t" style="font-family:var(--sans)"><b>${esc(t)}</b> — ${esc(fr)}<small>${esc(note)}</small></span></div>`).join('')}</div>
      <div class="sec"><h2>Le vocabulaire du document</h2></div>
      <div class="card pad">${['masculin', 'féminin', 'neutre'].map((g, i) => {
        const ws = C.vocab.filter(v => v.g === i);
        return `<div style="margin-bottom:10px"><div class="tag">${g} · ${ART[i][1]}</div>
          <p class="lb" style="margin-top:6px;font-size:.92rem;line-height:1.7">${ws.map(w => esc(w.w)).join(' · ')}</p></div>`;
      }).join('')}
      <button class="btn sig big" style="margin-top:6px" data-act="start" data-p="gender">Drill des articles</button></div>`
  };
  $('v-fiche').innerHTML = `
    <h1 style="font-size:1.45rem">La méthode</h1>
    <p class="lead" style="margin-top:6px">Ce qu'il faut savoir avant de s'entraîner. À relire cinq minutes, pas plus.</p>
    <div class="seg" style="margin:16px 0 14px">
      ${[['or', 'La règle'], ['typ', '7 questions'], ['pic', 'Photo'], ['gram', 'Grammaire'], ['exam', 'Examen']].map(([k, l]) =>
        `<button class="${fiche === k ? 'on' : ''}" data-fi="${k}">${l}</button>`).join('')}</div>
    ${panes[fiche]()}`;
}

/* ── progression ───────────────────────────────────────────────────────── */
function rProg() {
  const r = readiness(), lv = levelInfo(S.xp.total), st = streakLen(), dl = daysLeft();
  const days = [];
  for (let i = 55; i >= 0; i--) { const d = dayKey(-i); days.push([d, S.xp.byDay[d] || 0]); }
  const max = Math.max(goalXp(), ...days.map(d => d[1]));

  $('v-prog').innerHTML = `
    <h1 style="font-size:1.45rem">Ma progression</h1>
    ${dl != null ? `<p class="lead" style="margin-top:6px">${dl >= 0
      ? `Examen le ${frDate(S.profile.examDate)} — <b class="num">${dl}</b> ${plural(dl, 'jour')}.`
      : 'La date d\'examen est passée. Mets-la à jour dans les réglages.'}</p>` : ''}

    <div class="card pad" style="margin-top:14px">
      <div style="display:flex;align-items:baseline;gap:10px">
        <b style="font-size:1.05rem">Niveau ${lv.n} — ${esc(lv.t)}</b>
        <span class="num hint" style="margin-left:auto">${S.xp.total} XP</span></div>
      <div class="bar" style="margin-top:10px"><i style="width:${lv.pct}%"></i></div>
      <p class="hint" style="margin-top:7px">${lv.next ? lv.toNext + ' XP avant « ' + esc(lv.next.t) + ' »' : 'Niveau maximum'}</p>
    </div>

    <div class="stat3" style="margin-top:10px">
      <div><b>${st}</b><span>${plural(st, 'jour')} d'affilée</span></div>
      <div><b>${S.streak.best || 0}</b><span>record</span></div>
      <div><b>${S.streak.freezes || 0}</b><span>gels restants</span></div>
    </div>

    <div class="sec"><h2>Préparation — ${r.score}%</h2></div>
    <div class="card pad axes">${r.parts.map(p => `
      <div class="axis"><b>${esc(p.t)}</b><span class="v">${Math.round(p.v * 100)}%</span>
        <div class="bar"><i style="width:${Math.round(p.v * 100)}%"></i></div>
        <div class="hint" style="grid-column:1/-1">${esc(p.fr)}</div></div>`).join('')}</div>

    <div class="sec"><h2>Huit dernières semaines</h2></div>
    <div class="card pad">
      <div style="display:grid;grid-template-columns:repeat(28,1fr);gap:3px">
        ${days.map(([d, xp]) => {
          const lvl = xp === 0 ? 0 : xp >= goalXp() ? 3 : xp >= goalXp() / 2 ? 2 : 1;
          const bg = ['var(--line)', 'color-mix(in srgb,var(--sig) 30%,var(--line))',
            'color-mix(in srgb,var(--sig) 60%,var(--line))', 'var(--sig)'][lvl];
          return `<span title="${d} · ${xp} XP" style="aspect-ratio:1;border-radius:3px;background:${bg}"></span>`;
        }).join('')}
      </div>
      <p class="hint" style="margin-top:9px">Une case par jour. Pleine = objectif atteint.</p>
    </div>

    <div class="sec"><h2>Réglages</h2></div>
    <div class="card" style="padding:4px 16px">
      <div class="plan"><li style="cursor:pointer" data-act="settings"><span class="tick">${icon('i-gear', 'sm')}</span>
        <span class="txt">Nom, date d'examen, durée, heure du soir<small>${S.profile.minutes} min/jour · soir à partir de ${S.profile.evening}h</small></span></li></div>
    </div>
    <div class="row" style="margin-top:12px">
      <button class="btn dim" data-act="export">Exporter ma progression</button>
      <button class="btn dim" data-act="import">Réimporter</button>
    </div>
    <p class="hint" style="margin-top:10px">Tout est stocké dans ce navigateur, rien n'est envoyé nulle part. Exporte avant de changer d'appareil.</p>`;
}

/* ══ feuilles ═════════════════════════════════════════════════════════════ */
function whyEvening() {
  const e = M.EVENING;
  openSheet(`<h2 style="font-size:1.25rem;margin-bottom:8px">Pourquoi une session le soir</h2>
    <p class="lead">${esc(e.why)}</p>
    <div class="sec"><h2>Ce qu'elle contient</h2></div>
    <div class="plan">${e.steps.map(([t, d], i) =>
      `<li><span class="tick num">${i + 1}</span><span class="txt">${esc(t)}<small>${esc(d)}</small></span></li>`).join('')}</div>
    <p class="hint" style="margin-top:14px">Elle ne s'ouvre qu'après un peu de travail dans la journée : sans erreurs à repêcher, ce ne serait qu'une session de plus.</p>
    <button class="btn sig big" style="margin-top:14px" data-act="start" data-p="owend" data-close>Commencer</button>
    <button class="btn dim big" style="margin-top:8px" data-close>Fermer</button>`);
}

function settings() {
  const p = S.profile;
  openSheet(`<h2 style="font-size:1.25rem;margin-bottom:14px">Réglages</h2>
    <label class="hint">Ton prénom</label>
    <input id="sName" class="mine" style="min-height:0;height:46px;font-family:var(--sans);font-size:.95rem" value="${esc(p.name)}" placeholder="Optionnel">
    <label class="hint" style="display:block;margin-top:14px">Date de l'examen</label>
    <input id="sDate" type="date" class="mine" style="min-height:0;height:46px;font-family:var(--sans);font-size:.95rem" value="${esc(p.examDate || '')}">
    <label class="hint" style="display:block;margin-top:14px">Temps par jour</label>
    <div class="seg" id="sMin">${[5, 10, 15, 20].map(m =>
      `<button class="${p.minutes === m ? 'on' : ''}" data-m="${m}">${m} min</button>`).join('')}</div>
    <label class="hint" style="display:block;margin-top:14px">La session du soir démarre à</label>
    <div class="seg" id="sEve">${[18, 19, 20, 21, 22].map(h =>
      `<button class="${p.evening === h ? 'on' : ''}" data-h="${h}">${h}h</button>`).join('')}</div>
    <label class="hint" style="display:block;margin-top:14px">Sons</label>
    <div class="seg" id="sSnd">
      <button class="${p.sound ? 'on' : ''}" data-s="1">Activés</button>
      <button class="${!p.sound ? 'on' : ''}" data-s="0">Silencieux</button></div>
    <button class="btn sig big" style="margin-top:18px" id="sSave">Enregistrer</button>
    <button class="btn dim big" style="margin-top:8px" data-close>Annuler</button>`);
  const seg = (id, attr, fn) => qsa('#' + id + ' button').forEach(b => b.onclick = () => {
    qsa('#' + id + ' button').forEach(x => x.classList.remove('on')); b.classList.add('on'); fn(b.dataset[attr]);
  });
  seg('sMin', 'm', v => p.minutes = +v);
  seg('sEve', 'h', v => p.evening = +v);
  seg('sSnd', 's', v => p.sound = v === '1');
  $('sSave').onclick = () => {
    p.name = $('sName').value.trim().slice(0, 24);
    p.examDate = $('sDate').value || null;
    saveNow(); closeSheet(); paintTime(); renderView(); toast('Réglages enregistrés');
  };
}

function levelSheet() {
  const lv = levelInfo(S.xp.total);
  openSheet(`<h2 style="font-size:1.25rem">Niveau ${lv.n} — ${esc(lv.t)}</h2>
    <p class="lead">${S.xp.total} XP · ${lv.next ? lv.toNext + ' avant « ' + esc(lv.next.t) + ' »' : 'Niveau maximum'}</p>
    <div class="bar" style="margin:14px 0"><i style="width:${lv.pct}%"></i></div>
    ${LEVELS.map(l => `<div class="gline"><span class="m">${S.xp.total >= l.xp ? '✓' : '·'}</span>
      <span class="t" style="font-family:var(--sans)">${esc(l.t)}<small>${esc(l.fr)} — ${l.xp} XP</small></span></div>`).join('')}
    <button class="btn dim big" style="margin-top:14px" data-close>Fermer</button>`);
}
function streakSheet() {
  const st = streakLen();
  openSheet(`<h2 style="font-size:1.25rem">${st} ${plural(st, 'jour')} de suite</h2>
    <p class="lead">${goalDone(TODAY) ? 'Journée validée. Reviens demain.'
      : 'Il te manque ' + (goalXp() - xpToday()) + ' XP aujourd\'hui.'}</p>
    <div class="note">Un gel couvre automatiquement un jour manqué pour que la série survive. Il t'en reste <b>${S.streak.freezes || 0}</b>.</div>
    <div class="note">Meilleure série : <b>${Math.max(S.streak.best || 0, st)} jours</b></div>
    ${!goalDone(TODAY) ? `<button class="btn sig big" style="margin-top:10px" data-act="start" data-p="${isEvening() && S.day.steps ? 'owend' : 'flash'}" data-close>Sauver la journée</button>` : ''}
    <button class="btn dim big" style="margin-top:8px" data-close>Fermer</button>`);
}

function picTimer() {
  let left = 300;
  openSheet(`<div style="text-align:center;padding:10px 0">
    <p class="hint">Cinq minutes, comme le jour J.</p>
    <div class="timer" id="pt" style="margin:16px 0">5:00</div>
    <div class="row" style="justify-content:center">
      <button class="btn sig" id="ptGo">Démarrer</button>
      <button class="btn dim" data-close>Fermer</button></div></div>`);
  let iv = null;
  $('ptGo').onclick = () => {
    if (iv) { clearInterval(iv); iv = null; $('ptGo').textContent = 'Reprendre'; return; }
    $('ptGo').textContent = 'Pause';
    iv = setInterval(() => {
      left--; const el = $('pt'); if (!el) { clearInterval(iv); return; }
      el.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
      if (left <= 30) el.classList.add('warn');
      if (left <= 0) { clearInterval(iv); iv = null; el.textContent = 'Fäerdeg'; beep('ok'); }
    }, 1000);
  };
}

/* ══ import / export ══════════════════════════════════════════════════════ */
function exportState() {
  const blob = new Blob([JSON.stringify(S)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sproochentest-' + TODAY + '.json';
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Fichier téléchargé');
}
function importState() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'application/json,.json';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (!d || typeof d !== 'object' || !d.profile) throw 0;
        S = Object.assign(blank(), d); saveNow();
        toast('Progression réimportée'); renderView(); paintHud();
      } catch (e) { toast('Fichier illisible'); }
    };
    r.readAsText(f);
  };
  inp.click();
}

/* ══ premier lancement ════════════════════════════════════════════════════ */
function onboarding() {
  let step = 0;
  const draft = { name: '', minutes: 10, examDate: null, evening: 20 };
  const steps = [
    () => `<div style="text-align:center;padding:8px 0">
      <span class="beat lg" aria-hidden="true"><i class="on"></i><i class="on"></i><i class="on"></i></span>
      <h2 style="font-size:1.4rem;margin:14px 0 8px">Trois phrases, pas une</h2>
      <p class="lead">L'examen ne teste pas ton vocabulaire, il teste ta capacité à répondre tout de suite et à tenir trois phrases : la réponse, la raison, un exemple.</p>
      <p class="lead" style="margin-top:12px">Cette app t'entraîne sur les <b>${TOTAL_Q} questions</b> qui tombent vraiment, et sur <b>${C.photos.length} photos</b> décrites jusqu'au bout.</p>
      </div>`,
    () => `<h2 style="font-size:1.25rem;margin-bottom:6px">Comment t'appeler ?</h2>
      <p class="lead">Facultatif, juste pour l'accueil.</p>
      <input id="oName" class="mine" style="min-height:0;height:48px;font-family:var(--sans);margin-top:12px" placeholder="Ton prénom" value="${esc(draft.name)}">`,
    () => `<h2 style="font-size:1.25rem;margin-bottom:6px">Combien de temps par jour ?</h2>
      <p class="lead">Mieux vaut dix minutes tous les jours qu'une heure le dimanche.</p>
      <div class="seg" id="oMin" style="margin-top:14px">${[5, 10, 15, 20].map(m =>
        `<button class="${draft.minutes === m ? 'on' : ''}" data-m="${m}">${m} min</button>`).join('')}</div>`,
    () => `<h2 style="font-size:1.25rem;margin-bottom:6px">Ton examen est quand ?</h2>
      <p class="lead">Ça sert à calibrer le rythme. Tu pourras la changer.</p>
      <input id="oDate" type="date" class="mine" style="min-height:0;height:48px;font-family:var(--sans);margin-top:12px" value="${draft.examDate || ''}">`,
    () => `<h2 style="font-size:1.25rem;margin-bottom:6px">Et le soir ?</h2>
      <p class="lead">À partir de cette heure, l'app bascule en mode soir : lumière chaude, pas de son, et une session courte qui repasse les erreurs de la journée juste avant que tu dormes.</p>
      <div class="seg" id="oEve" style="margin-top:14px">${[19, 20, 21, 22].map(h =>
        `<button class="${draft.evening === h ? 'on' : ''}" data-h="${h}">${h}h</button>`).join('')}</div>`
  ];
  const paint = () => {
    openSheet(steps[step]() + `
      <button class="btn sig big" style="margin-top:20px" id="oNext">${step === steps.length - 1 ? 'Commencer' : 'Continuer'}</button>
      ${step ? '<button class="btn dim big" style="margin-top:8px" id="oBack">Retour</button>' : ''}`);
    const seg = (id, attr, fn) => qsa('#' + id + ' button').forEach(b => b.onclick = () => {
      qsa('#' + id + ' button').forEach(x => x.classList.remove('on')); b.classList.add('on'); fn(b.dataset[attr]);
    });
    seg('oMin', 'm', v => draft.minutes = +v);
    seg('oEve', 'h', v => draft.evening = +v);
    $('oNext').onclick = () => {
      if ($('oName')) draft.name = $('oName').value.trim().slice(0, 24);
      if ($('oDate')) draft.examDate = $('oDate').value || null;
      if (step < steps.length - 1) { step++; paint(); return; }
      Object.assign(S.profile, draft, { onboarded: true });
      saveNow(); closeSheet(); paintTime(); renderView();
      setTimeout(() => start(isEvening() ? 'flash' : 'dag'), 300);
    };
    if ($('oBack')) $('oBack').onclick = () => { step--; paint(); };
  };
  paint();
}

/* ══ interactions globales ════════════════════════════════════════════════ */
document.addEventListener('click', e => {
  const say = e.target.closest('[data-say]');
  if (say) { speak(say.dataset.say); return; }

  const nav = e.target.closest('[data-v]');
  if (nav && !e.target.closest('[data-act]')) { showView(nav.dataset.v); return; }

  const th = e.target.closest('[data-th]');
  if (th) { froenTheme = +th.dataset.th; rFroen(); return; }
  const fl = e.target.closest('[data-f]');
  if (fl) { froenFilter = fl.dataset.f; rFroen(); return; }
  const fi = e.target.closest('[data-fi]');
  if (fi) { fiche = fi.dataset.fi; rFiche(); return; }
  const ph = e.target.closest('[data-photo]');
  if (ph) { curPhoto = ph.dataset.photo; rFoto(); scrollTo({ top: 0 }); return; }

  /* `data-close` se suffit à lui-même : « Fermer », « Annuler », « Plus tard »
     n'ont pas d'autre effet que de refermer la feuille, et ne portent donc
     aucun `data-act`. */
  const close = e.target.closest('[data-close]');
  if (close) closeSheet();

  const b = e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act;

  const acts = {
    start: () => start(b.dataset.p, b.dataset.doc != null ? b.dataset.doc
      : b.dataset.arg != null ? (isNaN(+b.dataset.arg) ? b.dataset.arg : +b.dataset.arg) : undefined),
    primary: () => start(isEvening() && (S.day.steps || S.day.dag) && S.day.owend !== TODAY ? 'owend' : 'dag'),
    next: () => next(),
    quit: () => quit(true),
    view: () => showView(b.dataset.v),
    'open-q': () => openQuestion(+b.dataset.n),
    'write-one': () => { const n = +b.dataset.n; quit(true); setTimeout(() => openQuestion(n), 250); },
    'photos-back': () => { curPhoto = null; rFoto(); },
    'pic-timer': () => picTimer(),
    'why-evening': () => whyEvening(),
    'how-lauscht': () => howLauscht(),
    settings: () => settings(),
    level: () => levelSheet(),
    streak: () => streakSheet(),
    clock: () => { timeForced = !isEvening(); paintTime(); renderView(); toast(isEvening() ? 'Mode soir' : 'Mode jour'); },
    export: () => exportState(),
    import: () => importState()
  };
  if (acts[a]) { e.preventDefault(); acts[a](); }
});

$('scrim').addEventListener('click', e => { if (e.target === $('scrim')) closeSheet(); });
$('sxX').addEventListener('click', () => quit());

document.addEventListener('keydown', e => {
  if (!$('scrim').hidden && e.key === 'Escape') return closeSheet();
  if (!$('sx').hidden) {
    if (e.key === 'Escape') return quit();
    if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.key === 'Enter' || e.key === ' ') {
      const btn = $('sxFoot').querySelector('.btn.sig') || $('sxFoot').querySelector('.btn');
      if (btn) { e.preventDefault(); btn.click(); }
      return;
    }
    if (/^[1-9]$/.test(e.key)) {
      const opts = qsa('#sxBody .opt:not([disabled])'), grades = qsa('#sxFoot .grade');
      const t = opts[+e.key - 1] || grades[+e.key - 1];
      if (t) { e.preventDefault(); t.click(); }
    }
    return;
  }
  if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
  const map = { 1: 'haut', 2: 'froen', 3: 'lauscht', 4: 'foto', 5: 'fiche', 6: 'prog' };
  if (map[e.key]) showView(map[e.key]);
  if (e.key === 'Enter' && VIEW === 'haut') start(isEvening() && S.day.steps ? 'owend' : 'dag');
});

addEventListener('scroll', () => $('topbar').classList.toggle('stuck', scrollY > 6), { passive: true });
/* L'heure tourne pendant qu'on utilise l'app : à 20 h pile, elle bascule. */
setInterval(() => { if (timeForced == null) { const was = document.documentElement.dataset.time; paintTime(); if (was !== document.documentElement.dataset.time) renderView(); } }, 60000);

/* ══ démarrage ════════════════════════════════════════════════════════════ */
load();
applyFreeze();
paintTime();
showView(S.profile.onboarded && S.lastView && ['haut', 'froen', 'lauscht', 'foto', 'fiche', 'prog'].includes(S.lastView) ? S.lastView : 'haut');
paintHud();
if (!S.profile.onboarded) setTimeout(onboarding, 350);
else if (S.badges.fromV3 && !S.badges.fromV3seen) { S.badges.fromV3seen = TODAY; save(); setTimeout(() => toast('Ta progression de la v3 a été reprise'), 800); }
addEventListener('pointerdown', function once() { loadVoices(); removeEventListener('pointerdown', once); }, { once: true });

window.APP = { start, showView, queue: buildQueue, S: () => S };
})();
