/* Installation, mise à jour, raccourcis d'application.
   Séparé de app.js : ce fichier ne parle qu'au navigateur, pas à l'apprenant. */
(function () {
  'use strict';

  if ('serviceWorker' in navigator) {
    addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () { });
    });
    navigator.serviceWorker.addEventListener('message', function (e) {
      if (e.data && e.data.type === 'update-ready') updateBar();
    });
    // le message peut arriver avant que cette page n'écoute : le worker laisse
    // aussi un marqueur en cache, qu'on relit au chargement et un peu après
    checkMark(); setTimeout(checkMark, 4000);
  }

  function checkMark() {
    // en file:// l'API existe mais son accès lève : un try/catch, pas un .catch()
    if (!('caches' in window) || location.protocol === 'file:') return;
    try { probeMark(); } catch (_) { }
  }
  function probeMark() {
    var url = new URL('__update_ready__', location.href).href;
    caches.keys().then(function (ks) {
      var k = ks.filter(function (x) { return x.indexOf('spr-shell-') === 0; })[0];
      if (!k) return;
      caches.open(k).then(function (c) {
        c.match(url).then(function (r) { if (r) updateBar(); });
      });
    }).catch(function () { });
  }

  /* Bandeau « nouvelle version ». Il ne disparaît pas tout seul : c'est une
     action à faire, pas une information à survoler. */
  function updateBar() {
    if (document.getElementById('updBar')) return;
    var box = document.getElementById('toasts'); if (!box) return;
    var d = document.createElement('div');
    d.id = 'updBar'; d.className = 'toast sig';
    d.style.pointerEvents = 'auto';
    d.appendChild(document.createTextNode('Nouvelle version disponible'));
    var b = document.createElement('button');
    b.textContent = 'Recharger';
    b.style.cssText = 'margin-left:8px;padding:5px 11px;border-radius:8px;border:0;'
      + 'background:rgba(255,255,255,.92);color:#0F1620;font-weight:700;font-size:.8rem;cursor:pointer';
    b.onclick = function () { location.reload(); };
    d.appendChild(b);
    box.appendChild(d);
  }

  /* Proposer l'installation à quelqu'un qui n'a encore rien essayé se solde
     par un refus : on attend une première session terminée. */
  var deferred = null;
  addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e;
    try {
      var st = JSON.parse(localStorage.getItem('lux4_state') || '{}');
      if (st && st.day && st.day.steps >= 5 && !localStorage.getItem('lux4_install_asked')) {
        setTimeout(installBar, 2500);
      }
    } catch (_) { }
  });

  function installBar() {
    if (!deferred || document.getElementById('instBar')) return;
    var box = document.getElementById('toasts'); if (!box) return;
    var d = document.createElement('div');
    d.id = 'instBar'; d.className = 'toast';
    d.style.pointerEvents = 'auto';
    d.appendChild(document.createTextNode("Installer l'app sur l'écran d'accueil ?"));
    var yes = document.createElement('button'), no = document.createElement('button');
    yes.textContent = 'Installer';
    yes.style.cssText = 'margin-left:8px;padding:5px 11px;border-radius:8px;border:0;'
      + 'background:#fff;color:#0F1620;font-weight:700;font-size:.8rem;cursor:pointer';
    no.textContent = '✕';
    no.setAttribute('aria-label', 'Plus tard');
    no.style.cssText = 'margin-left:4px;padding:5px 8px;border-radius:8px;border:0;'
      + 'background:transparent;color:inherit;opacity:.7;font-size:.85rem;cursor:pointer';
    yes.onclick = function () {
      localStorage.setItem('lux4_install_asked', '1');
      d.remove(); deferred.prompt(); deferred = null;
    };
    no.onclick = function () { localStorage.setItem('lux4_install_asked', '1'); d.remove(); };
    d.appendChild(yes); d.appendChild(no);
    box.appendChild(d);
  }

  addEventListener('appinstalled', function () {
    try { localStorage.setItem('lux4_install_asked', '1'); } catch (_) { }
  });

  /* Raccourcis d'application : ./?go=dag|owend|flash|typ|foto */
  try {
    var go = new URLSearchParams(location.search).get('go');
    var ok = { dag: 1, owend: 1, flash: 1, typ: 1, foto: 1, speak: 1, write: 1 };
    // ne pas lancer une session par-dessus l'accueil d'un premier lancement :
    // le raccourci n'a de sens que pour quelqu'un déjà installé
    var st = JSON.parse(localStorage.getItem('lux4_state') || '{}');
    if (go && ok[go] && st.profile && st.profile.onboarded) {
      history.replaceState(null, '', location.pathname);
      setTimeout(function () {
        if (window.APP && window.APP.start) window.APP.start(go);
      }, 500);
    }
  } catch (_) { }
})();
