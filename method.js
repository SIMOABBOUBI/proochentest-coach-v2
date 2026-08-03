/* ═══════════════════════════════════════════════════════════════════════
   method.js — la méthode en trois temps

   Le rythme visuel (.beat, 3 barres) porté par index.html correspond à
   cette méthode : à l'oral, une bonne réponse A2 a toujours ces trois
   couches. On ne récite pas une liste de mots, on construit une réponse.
   ═══════════════════════════════════════════════════════════════════════ */
(function(global){

const STEPS = [
  {key:'antwert',  lb:'Äntwert',  fr:'La réponse',
    desc:'Une phrase complète avec sujet + verbe conjugué, jamais juste un mot.'},
  {key:'grond',    lb:'Grond',    fr:'Le pourquoi / la structure',
    desc:'Un « well », un « datt », ou un point de grammaire qui rend la phrase plus riche qu’un simple constat.'},
  {key:'beispill', lb:'Beispill', fr:'Le vocabulaire à retenir',
    desc:'Les 2-3 mots clés de la question, à réutiliser dans d’autres réponses du même thème.'},
];

function contentFor(step, q){
  if(!q) return '';
  switch(step){
    case 'antwert':  return {lb:q.model_lb, fr:q.model_fr};
    case 'grond':    return {lb:q.grond, fr:null};
    case 'beispill': return {lb:(q.vocab||[]).join(' · '), fr:'Erreur fréquente : ' + (q.pitfall||'—')};
    default: return {lb:'', fr:''};
  }
}

global.METHOD = {steps:STEPS, contentFor};
})(window);
