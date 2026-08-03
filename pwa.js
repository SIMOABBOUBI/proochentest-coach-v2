/* pwa.js — installation + mode hors-ligne, seulement en http(s) */
if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Échec silencieux : l'app reste utilisable sans le mode hors-ligne.
    });
  });
}
