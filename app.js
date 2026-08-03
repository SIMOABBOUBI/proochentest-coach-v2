/* ═══════════════════════════════════════════════════════════════════════
   app.js — état, navigation, moteur de session
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';
const $ = (s,r) => (r||document).querySelector(s);
const $$ = (s,r) => Array.from((r||document).querySelectorAll(s));
const { cats, questions, photos } = CORPUS;

/* ── état persistant ──────────────────────────────────────────────────── */
const KEY = 'sprooch.v1';
function today(){ return new Date().toISOString().slice(0,10); }
function loadState(){
  let s = null;
  try{ s = JSON.parse(localStorage.getItem(KEY)); }catch(e){}
  if(!s) s = {xp:0, streak:0, lastDay:null, timeMode:'auto', qStats:{}, listenStats:{}, photoStats:{}};
  return s;
}
let ST = loadState();
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(ST)); }catch(e){} }
function bumpStreakOnOpen(){
  const t = today();
  if(ST.lastDay === t) return;
  if(ST.lastDay){
    const gap = Math.round((new Date(t) - new Date(ST.lastDay)) / 86400000);
    ST.streak = gap === 1 ? ST.streak + 1 : 1;
  } else { ST.streak = 1; }
  ST.lastDay = t;
  save();
}
function addXp(n){ ST.xp += n; save(); pulseHud('hXp'); }
function doneToday(kind){
  // combien d'items de ce type ont été touchés aujourd'hui
  const store = kind === 'q' ? ST.qStats : kind === 'l' ? ST.listenStats : ST.photoStats;
  return Object.values(store).filter(v => v.last === today() || v.done && v.day === today()).length;
}

/* ── jour / nuit ──────────────────────────────────────────────────────── */
function realTimeMode(){ const h = new Date().getHours(); return (h>=6 && h<18) ? 'dag' : 'owend'; }
function effectiveTime(){ return ST.timeMode === 'auto' ? realTimeMode() : ST.timeMode; }
function applyTime(){
  const t = effectiveTime();
  document.documentElement.setAttribute('data-time', t);
  $('#tbTime').textContent = t === 'dag' ? 'Jour' : 'Nuit';
  $('#tbIcon').setAttribute('href', t === 'dag' ? '#i-sun' : '#i-moon');
}
function cycleTime(){
  ST.timeMode = ST.timeMode === 'auto' ? (effectiveTime()==='dag'?'owend':'dag') : 'auto';
  save(); applyTime(); render();
  toast(ST.timeMode==='auto' ? 'Heure automatique' : (ST.timeMode==='dag'?'Mode jour forcé':'Mode nuit forcé'));
}

/* ── toasts & sheet ───────────────────────────────────────────────────── */
function toast(msg, sig){
  const el = document.createElement('div');
  el.className = 'toast' + (sig?' sig':'');
  el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(()=>el.remove(), 2600);
}
function openSheet(html){
  $('#sheetBody').innerHTML = html;
  $('#scrim').hidden = false;
  document.body.classList.add('locked');
}
function closeSheet(){
  $('#scrim').hidden = true;
  document.body.classList.remove('locked');
}
$('#scrim').addEventListener('click', e => { if(e.target.id === 'scrim') closeSheet(); });

/* ── hud ──────────────────────────────────────────────────────────────── */
function pulseHud(id){ const el = $('#'+id); if(!el) return; el.textContent = id==='hXp'?ST.xp:ST.streak; el.parentElement.classList.add('pop'); setTimeout(()=>el.parentElement.classList.remove('pop'),450); }
function refreshHud(){ $('#hStreak').textContent = ST.streak; $('#hXp').textContent = ST.xp; }

/* ── navigation ───────────────────────────────────────────────────────── */
let currentView = 'haut';
function setView(v){
  currentView = v;
  $$('.view').forEach(s => s.classList.toggle('on', s.id === 'v-'+v));
  $$('.rail .nav').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  $$('.tabbar button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  render();
  $('#views').scrollTop = 0;
}
$$('[data-v]').forEach(b => b.addEventListener('click', () => setView(b.dataset.v)));
$('[data-act="clock"]').addEventListener('click', cycleTime);
$('[data-act="streak"]').addEventListener('click', () => toast('Série : ' + ST.streak + ' jour(s) d’affilée'));
$('[data-act="level"]').addEventListener('click', () => toast('Expérience totale : ' + ST.xp + ' XP'));
const primaryBtn = $('[data-act="primary"]');
if(primaryBtn) primaryBtn.addEventListener('click', () => startSpeakSession(pickQueue(8)));

/* ── file de questions ────────────────────────────────────────────────── */
function pickQueue(n, catFilter){
  let pool = catFilter ? questions.filter(q => q.cat === catFilter) : questions.slice();
  // priorité aux questions jamais vues ou mal notées
  pool.sort((a,b) => rank(a) - rank(b));
  function rank(q){
    const st = ST.qStats[q.id];
    if(!st) return 0;
    if(st.grade === 'no') return 1;
    if(st.grade === 'mid') return 2;
    return 3;
  }
  // léger mélange à l'intérieur d'un même rang pour ne pas être toujours identique
  for(let i=pool.length-1;i>0;i--){
    if(rank(pool[i]) !== rank(pool[i-1])) continue;
    if(Math.random()<0.5){ const t=pool[i]; pool[i]=pool[i-1]; pool[i-1]=t; }
  }
  return pool.slice(0, n).map(q => q.id);
}

/* ── vue: Aujourd'hui ─────────────────────────────────────────────────── */
function renderHaut(){
  const t = effectiveTime();
  const qOfDay = questions[Math.floor((new Date().getDate()+new Date().getMonth()*31) % questions.length)];
  const spoken = Object.values(ST.qStats).filter(v=>v.last===today()).length;
  const listened = Object.values(ST.listenStats).filter(v=>v.last===today()).length;
  const photoed = Object.values(ST.photoStats).filter(v=>v.last===today()).length;
  $('#v-haut').innerHTML = `
    <div class="hero${t==='owend'?' owend':''}">
      <div class="eyebrow"><span class="beat" aria-hidden="true"><i class="on"></i><i class="on"></i><i></i></span>${t==='dag'?'Session du jour':'Session du soir'}</div>
      <div class="qq lb">${esc(qOfDay.lb)}</div>
      <div class="qfr">${esc(qOfDay.fr)}</div>
      <div class="acts">
        <button class="btn sig" id="btnStart">▶ Commencer une séance</button>
        <button class="btn dim" id="btnOneQ">Juste cette question</button>
      </div>
      <div class="stat3">
        <div><b class="num">${ST.streak}</b><span>Jours de suite</span></div>
        <div><b class="num">${spoken}</b><span>Parlé aujourd’hui</span></div>
        <div><b class="num">${ST.xp}</b><span>XP</span></div>
      </div>
    </div>
    <div class="sec"><h2>Plan du jour</h2></div>
    <ul class="plan">
      <li class="${spoken>0?'done':''}"><span class="tick">${spoken>0?'✓':'1'}</span><span class="txt">Séance de conversation<small>8 questions, méthode en 3 temps</small></span></li>
      <li class="${listened>0?'done':''}"><span class="tick">${listened>0?'✓':'2'}</span><span class="txt">Un exercice d’écoute<small>Bulletin ou dialogue + questions</small></span></li>
      <li class="${photoed>0?'done':''}"><span class="tick">${photoed>0?'✓':'3'}</span><span class="txt">Décrire une photo<small>À voix haute ou par écrit</small></span></li>
    </ul>
    <div class="sec"><h2>Accès rapide</h2></div>
    <div class="qgrid">
      <button class="qtile" data-v="froen"><svg class="ic" aria-hidden="true"><use href="#i-froen"/></svg><b>Les questions</b><span>${questions.length} questions, 10 thèmes</span></button>
      <button class="qtile" data-v="lauscht"><svg class="ic" aria-hidden="true"><use href="#i-ear"/></svg><b>L’écoute</b><span>${LISTEN.exercises.length} exercices</span></button>
      <button class="qtile" data-v="foto"><svg class="ic" aria-hidden="true"><use href="#i-foto"/></svg><b>Les photos</b><span>${photos.length} scènes à décrire</span></button>
      <button class="qtile" data-v="fiche"><svg class="ic" aria-hidden="true"><use href="#i-fiche"/></svg><b>La méthode</b><span>Äntwert · Grond · Beispill</span></button>
    </div>`;
  $('#btnStart').addEventListener('click', () => startSpeakSession(pickQueue(8)));
  $('#btnOneQ').addEventListener('click', () => startSpeakSession([qOfDay.id]));
  $$('.qtile').forEach(b => b.addEventListener('click', () => setView(b.dataset.v)));
}

/* ── vue: Les questions ───────────────────────────────────────────────── */
let qFilter = 'all';
function renderFroen(){
  const chips = ['<button class="chip'+(qFilter==='all'?' on':'')+'" data-c="all">Tout</button>']
    .concat(cats.map(c => `<button class="chip${qFilter===c.id?' on':''}" data-c="${c.id}">${esc(c.lb)}</button>`)).join('');
  const list = questions.filter(q => qFilter==='all' || q.cat===qFilter);
  const rows = list.map((q,i) => {
    const st = ST.qStats[q.id];
    const icon = !st ? '' : st.grade==='ok' ? '✅' : st.grade==='mid' ? '🟠' : '🔺';
    return `<button class="qrow${st&&st.grade==='ok'?' mine':''}" data-q="${q.id}">
      <span class="n num">${String(i+1).padStart(2,'0')}</span>
      <span class="q lb">${esc(q.lb)}<small>${esc(q.fr)}</small></span>
      <span class="st">${icon}</span>
    </button>`;
  }).join('');
  $('#v-froen').innerHTML = `
    <div class="sec"><h2>Par thème</h2></div>
    <div class="chips">${chips}</div>
    <div class="card"><div class="rows">${rows || '<p class="hint" style="padding:16px">Aucune question dans ce thème.</p>'}</div></div>
    <div class="row" style="margin-top:14px">
      <button class="btn big sig" id="btnPractCat">▶ Travailler ce thème</button>
    </div>`;
  $$('.chip').forEach(c => c.addEventListener('click', () => { qFilter = c.dataset.c; renderFroen(); }));
  $$('.qrow').forEach(r => r.addEventListener('click', () => openQuestionSheet(r.dataset.q)));
  $('#btnPractCat').addEventListener('click', () => {
    const cat = qFilter==='all' ? null : qFilter;
    startSpeakSession(pickQueue(8, cat));
  });
}
function openQuestionSheet(qid){
  const q = questions.find(x=>x.id===qid);
  openSheet(`
    <div class="kick">${esc(cats.find(c=>c.id===q.cat).fr)}</div>
    <p class="prompt lb">${esc(q.lb)}</p>
    <p class="prompt-fr">${esc(q.fr)}</p>
    <div class="reveal"><div class="lab">Äntwert</div><p class="lb">${esc(q.model_lb)}</p><p class="hint">${esc(q.model_fr)}</p></div>
    <div class="reveal"><div class="lab">Grond</div><p>${esc(q.grond)}</p></div>
    <div class="reveal"><div class="lab">Beispill · vocabulaire</div><p>${(q.vocab||[]).map(esc).join(' · ')}</p><p class="hint">Erreur fréquente : ${esc(q.pitfall||'—')}</p></div>
    <button class="btn big sig" id="btnPractOne" style="margin-top:16px">▶ M’exercer sur cette question</button>`);
  $('#btnPractOne').addEventListener('click', () => { closeSheet(); startSpeakSession([qid]); });
}

/* ── moteur de session orale ──────────────────────────────────────────── */
let SX = null; // {queue, idx, stepIdx, timer}
function startSpeakSession(queue){
  if(!queue.length) return;
  SX = {queue, idx:0, stepIdx:-1, seconds:0, timerId:null};
  $('#sx').hidden = false;
  document.body.classList.add('locked');
  renderSxStep();
}
function currentQ(){ return questions.find(q => q.id === SX.queue[SX.idx]); }
function renderSxStep(){
  const q = currentQ();
  const cat = cats.find(c=>c.id===q.cat);
  $('#sxCnt').textContent = (SX.idx+1) + ' / ' + SX.queue.length;
  $('#sxBar').style.width = Math.round((SX.idx)/SX.queue.length*100) + '%';
  const beats = METHOD.steps.map((s,i) => `<button class="${SX.stepIdx>=i?'on':''}" data-s="${i}"><b>${esc(s.lb)}</b><small>${esc(s.fr)}</small></button>`).join('');
  let revealHtml = '';
  if(SX.stepIdx >= 0){
    const step = METHOD.steps[SX.stepIdx];
    const c = METHOD.contentFor(step.key, q);
    revealHtml = `<div class="reveal"><div class="lab">${esc(step.lb)} — ${esc(step.desc)}</div><p class="lb">${esc(c.lb||'')}</p>${c.fr?`<p class="hint">${esc(c.fr)}</p>`:''}</div>`;
  }
  $('#sxBody').innerHTML = `
    <div class="kick">${esc(cat.fr)} · question ${SX.idx+1}</div>
    <p class="prompt lb">${esc(q.lb)}</p>
    <p class="prompt-fr">${esc(q.fr)}</p>
    <div class="speak">
      <button class="mic${SX.recording?' rec':''}" id="micBtn" aria-label="Chronométrer ma réponse">🎙️</button>
      <div class="timer${SX.seconds>=45?' warn':''}" id="micTimer">${fmtTime(SX.seconds)}</div>
      <p class="hint">Réponds à voix haute, puis explore les trois temps de la méthode ci-dessous.</p>
    </div>
    <div class="beats">${beats}</div>
    ${revealHtml}`;
  $('#micBtn').addEventListener('click', toggleMic);
  $$('.beats button').forEach(b => b.addEventListener('click', () => { SX.stepIdx = Math.max(SX.stepIdx, Number(b.dataset.s)); if(SX.stepIdx !== Number(b.dataset.s)) SX.stepIdx = Number(b.dataset.s); renderSxStep(); }));
  const showGrades = SX.stepIdx >= METHOD.steps.length - 1;
  $('#sxFoot').innerHTML = showGrades ? `
    <div class="grades">
      <button class="grade g0" data-g="no"><i>1</i><em>🔺</em>À revoir</button>
      <button class="grade g1" data-g="mid"><i>2</i><em>🟠</em>Presque</button>
      <button class="grade g2" data-g="ok"><i>3</i><em>✅</em>Solide</button>
    </div>` : `<p class="hint" style="text-align:center">Parcours les trois temps pour débloquer la notation.</p>`;
  if(showGrades) $$('.grade').forEach(b => b.addEventListener('click', () => gradeAndNext(b.dataset.g)));
}
function fmtTime(s){ return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); }
function toggleMic(){
  if(SX.timerId){ clearInterval(SX.timerId); SX.timerId=null; SX.recording=false; }
  else { SX.recording=true; SX.timerId = setInterval(()=>{ SX.seconds++; $('#micTimer').textContent = fmtTime(SX.seconds); $('#micTimer').classList.toggle('warn', SX.seconds>=45); }, 1000); }
  $('#micBtn').classList.toggle('rec', SX.recording);
}
function gradeAndNext(grade){
  const q = currentQ();
  ST.qStats[q.id] = {seen:((ST.qStats[q.id]&&ST.qStats[q.id].seen)||0)+1, grade, last:today()};
  addXp(grade==='ok'?12:grade==='mid'?8:5);
  save();
  if(SX.timerId) clearInterval(SX.timerId);
  SX.idx++;
  SX.stepIdx = -1; SX.seconds = 0; SX.recording = false;
  if(SX.idx >= SX.queue.length){ endSpeakSession(); return; }
  renderSxStep();
}
function endSpeakSession(){
  $('#sxBar').style.width = '100%';
  bumpStreakOnOpen();
  toast('Séance terminée — ' + SX.queue.length + ' questions travaillées', true);
  closeSx();
  render();
}
function closeSx(){
  if(SX && SX.timerId) clearInterval(SX.timerId);
  $('#sx').hidden = true;
  document.body.classList.remove('locked');
  SX = null;
}
$('#sxX').addEventListener('click', closeSx);

/* ── vue: L'écoute ────────────────────────────────────────────────────── */
let listenState = null; // {exoId, answers:{}, playing}
function renderLauscht(){
  if(listenState){ renderListenExercise(); return; }
  const rows = LISTEN.exercises.map(e => {
    const st = ST.listenStats[e.id];
    return `<button class="dcell" data-e="${e.id}">
      <svg class="ic" aria-hidden="true"><use href="#i-radio"/></svg>
      <span><b>${esc(e.title)}</b><small>${esc(e.fr)}</small></span>
      <span class="best${st&&st.score>=2?' good':''}">${st? st.score+'/3' : '—'}</span>
    </button>`;
  }).join('');
  $('#v-lauscht').innerHTML = `
    <div class="sec"><h2>Compréhension orale</h2></div>
    ${!LISTEN.hasTTS ? `<div class="note sig">Ton navigateur ne propose pas de synthèse vocale ; tu peux quand même lire le script et répondre aux questions.</div>` : `<div class="note">La voix utilisée est une approximation (pas de voix luxembourgeoise native dans les navigateurs) — utile pour le rythme et la compréhension, pas pour l’accent.</div>`}
    <div class="card"><div class="rows">${rows}</div></div>`;
  $$('.dcell').forEach(d => d.addEventListener('click', () => { listenState = {exoId:d.dataset.e, answers:{}}; render(); }));
}
function renderListenExercise(){
  const exo = LISTEN.exercises.find(e => e.id === listenState.exoId);
  const answered = Object.keys(listenState.answers).length;
  const qHtml = exo.questions.map((q,i) => {
    const chosen = listenState.answers[i];
    const optsHtml = q.opts.map((o,oi) => {
      let cls = 'opt';
      if(chosen!==undefined){
        if(oi===q.correct) cls += ' ok';
        else if(oi===chosen) cls += ' no';
      }
      return `<button class="${cls}" data-i="${i}" data-o="${oi}" ${chosen!==undefined?'disabled':''}><span class="k">${String.fromCharCode(65+oi)}</span>${esc(o)}</button>`;
    }).join('');
    return `<div class="lq">
      <div class="lq-q"><span class="num">${i+1}.</span>${esc(q.q)}<div class="hint">${esc(q.fr)}</div></div>
      <div class="opts">${optsHtml}</div>
      ${chosen!==undefined?`<div class="lq-why">${esc(q.why)}</div>`:''}
    </div>`;
  }).join('');
  const score = Object.entries(listenState.answers).filter(([i,o]) => exo.questions[i].correct===o).length;
  $('#v-lauscht').innerHTML = `
    <button class="btn dim" id="btnBackListen">← Retour à la liste</button>
    <div class="sec"><h2>${esc(exo.title)}</h2></div>
    <div class="player">
      <button class="btn big" id="btnPlay">${LISTEN.hasTTS ? '▶ Écouter (' + (exo.kind==='dialog'?'dialogue':'bulletin') + ')' : '🔇 Synthèse indisponible'}</button>
      <div class="plines"><i id="playBar"></i></div>
    </div>
    ${qHtml}
    ${answered===exo.questions.length ? `
      <div class="reveal"><div class="lab">Score</div><p class="score">${score}<span>/${exo.questions.length}</span></p></div>
      <div class="reveal"><div class="lab">Texte entendu</div><div class="script"><p>${esc(exo.script)}</p></div></div>
      <button class="btn big sig" id="btnFinishListen" style="margin-top:12px">Terminer</button>` : ''}`;
  $('#btnBackListen').addEventListener('click', () => { listenState = null; render(); });
  const playBtn = $('#btnPlay');
  if(LISTEN.hasTTS) playBtn.addEventListener('click', () => {
    const bar = $('#playBar'); bar.style.width='0%';
    let p=0; const est = Math.max(4, exo.script.length/14);
    const iv = setInterval(()=>{ p += 100/est/10; bar.style.width = Math.min(p,98)+'%'; }, 100);
    LISTEN.speak(exo.script, () => { clearInterval(iv); bar.style.width='100%'; });
  });
  $$('.opts .opt').forEach(o => o.addEventListener('click', () => {
    listenState.answers[o.dataset.i] = Number(o.dataset.o);
    renderListenExercise();
  }));
  const fin = $('#btnFinishListen');
  if(fin) fin.addEventListener('click', () => {
    ST.listenStats[exo.id] = {score, last:today()};
    addXp(6 + score*3); bumpStreakOnOpen(); save();
    toast('Exercice terminé — ' + score + '/' + exo.questions.length, true);
    listenState = null; render();
  });
}

/* ── vue: Les photos ──────────────────────────────────────────────────── */
function imgFor(p, big){
  return `<img src="./${p.file}" alt="${esc(p.title)}" loading="lazy" style="width:100%;height:auto;display:block;border-radius:${big?'14px':'10px'};aspect-ratio:4/3;object-fit:cover">`;
}
function renderFoto(){
  const tiles = photos.map(p => {
    const st = ST.photoStats[p.id];
    return `<button class="qtile" data-p="${p.id}">${imgFor(p,false)}<b>${esc(p.title)}</b><span>${esc(p.fr)}${st?' · fait':''}</span></button>`;
  }).join('');
  $('#v-foto').innerHTML = `
    <div class="sec"><h2>Décris ce que tu vois</h2></div>
    <p class="lead">Scènes-repères en attendant de vraies photos d’examen — décris la scène en luxembourgeois, à voix haute ou à l’écrit.</p>
    <div class="qgrid" style="margin-top:14px">${tiles}</div>`;
  $$('.qtile[data-p]').forEach(t => t.addEventListener('click', () => openPhotoSession(t.dataset.p)));
}
function openPhotoSession(pid){
  const p = photos.find(x=>x.id===pid);
  $('#sx').hidden = false; document.body.classList.add('locked');
  $('#sxCnt').textContent = ''; $('#sxBar').style.width='100%';
  const hasVocab = p.vocab && p.vocab.length;
  $('#sxBody').innerHTML = `
    <div class="kick">Foto beschreiwen</div>
    ${imgFor(p,true)}
    <p class="prompt" style="margin-top:16px">Beschreift wat Dir op dësem Bild gesitt.</p>
    <p class="prompt-fr">Décrivez ce que vous voyez sur cette image.</p>
    <textarea class="mine" id="photoTxt" placeholder="Ech gesinn… (Je vois…)"></textarea>
    <div class="reveal hide" id="photoVocab"><div class="lab">Vocabulaire utile</div><p>${hasVocab ? p.vocab.map(esc).join(' · ') : 'Pas encore renseigné pour cette photo — décris-la avec tes propres mots.'}</p></div>`;
  $('#sxFoot').innerHTML = `<button class="btn" id="btnShowVocab">Voir le vocabulaire</button><button class="btn big sig" id="btnDonePhoto">Terminer</button>`;
  $('#btnShowVocab').addEventListener('click', () => $('#photoVocab').classList.remove('hide'));
  $('#btnDonePhoto').addEventListener('click', () => {
    ST.photoStats[p.id] = {last:today()}; addXp(8); bumpStreakOnOpen(); save();
    toast('Photo décrite — bien joué', true);
    closeSx(); render();
  });
}

/* ── vue: La méthode ──────────────────────────────────────────────────── */
function renderFiche(){
  const steps = METHOD.steps.map((s,i) => `
    <div class="card pad" style="margin-bottom:12px">
      <div class="row" style="align-items:center;gap:12px;margin-bottom:8px">
        <span class="stepno sm">${i+1}</span><b>${esc(s.lb)} <span class="hint">— ${esc(s.fr)}</span></b>
      </div>
      <p class="lead">${esc(s.desc)}</p>
    </div>`).join('');
  $('#v-fiche').innerHTML = `
    <div class="sec"><h2>La méthode en 3 temps</h2></div>
    <p class="lead">Le rythme visuel <span class="beat" aria-hidden="true"><i class="on"></i><i class="on"></i><i class="on"></i></span> qui accompagne l’app suit toujours ces trois temps : on ne récite pas un mot, on construit une réponse.</p>
    ${steps}
    <div class="sec"><h2>Trois réflexes grammaticaux</h2></div>
    <div class="note sig"><b>well</b> (parce que) et <b>datt</b> (que) envoient le verbe conjugué en fin de proposition.</div>
    <div class="note"><b>wann</b> (quand/si) fait pareil : le verbe recule en fin de proposition.</div>
    <div class="note"><b>mir gefält</b> (ça me plaît) fonctionne à l’inverse du français — le sujet grammatical, c’est la chose qui plaît.</div>`;
}

/* ── vue: Ma progression ─────────────────────────────────────────────── */
function renderProg(){
  const axes = cats.map(c => {
    const qs = questions.filter(q=>q.cat===c.id);
    const ok = qs.filter(q => ST.qStats[q.id] && ST.qStats[q.id].grade==='ok').length;
    const pct = qs.length ? Math.round(ok/qs.length*100) : 0;
    return `<div class="axis"><b>${esc(c.lb)}</b><span class="v num">${ok}/${qs.length}</span><div class="bar"><i style="width:${pct}%"></i></div></div>`;
  }).join('');
  const totalSeen = Object.keys(ST.qStats).length;
  $('#v-prog').innerHTML = `
    <div class="sec"><h2>Vue d’ensemble</h2></div>
    <div class="stat3">
      <div><b class="num">${ST.streak}</b><span>Jours de suite</span></div>
      <div><b class="num">${totalSeen}/${questions.length}</b><span>Questions vues</span></div>
      <div><b class="num">${ST.xp}</b><span>XP total</span></div>
    </div>
    <div class="sec"><h2>Par thème</h2></div>
    <div class="card pad"><div class="axes">${axes}</div></div>
    <div class="sec"><h2>Données</h2></div>
    <button class="btn dim" id="btnReset">Réinitialiser ma progression</button>`;
  $('#btnReset').addEventListener('click', () => {
    openSheet(`<p class="prompt">Tout effacer ?</p><p class="lead">Ça remet XP, série et notes à zéro, sur cet appareil seulement.</p>
      <div class="row" style="margin-top:16px"><button class="btn" id="cancelReset">Annuler</button><button class="btn sig" id="confirmReset">Effacer</button></div>`);
    $('#cancelReset').addEventListener('click', closeSheet);
    $('#confirmReset').addEventListener('click', () => {
      localStorage.removeItem(KEY); ST = loadState(); closeSheet(); refreshHud(); render();
      toast('Progression réinitialisée');
    });
  });
}

/* ── util & boucle de rendu ──────────────────────────────────────────── */
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function render(){
  refreshHud();
  ({haut:renderHaut, froen:renderFroen, lauscht:renderLauscht, foto:renderFoto, fiche:renderFiche, prog:renderProg})[currentView]();
}
window.addEventListener('scroll', () => {}, {passive:true});
const topbarEl = $('#topbar');
$('#views').addEventListener('scroll', () => topbarEl.classList.toggle('stuck', $('#views').scrollTop > 4));

/* ── démarrage ────────────────────────────────────────────────────────── */
bumpStreakOnOpen();
applyTime();
refreshHud();
render();
setInterval(applyTime, 5*60*1000); // suit l'heure réelle si en mode auto

})();
