/* ═══════════════════════════════════════════════════════════════════════
   listen.js — compréhension orale (partie B1 de l'examen)

   Pas de fichiers audio réels ici : on utilise la synthèse vocale du
   navigateur (Web Speech API). Aucun navigateur courant n'a de voix
   luxembourgeoise fiable, donc on essaie 'lb-LU' puis on retombe sur une
   voix allemande — la prononciation sera approximative, c'est annoncé à
   l'écran. Utile pour travailler la compréhension du texte et le rythme
   des questions ; à compléter plus tard par de vrais enregistrements natifs
   (dossier /audio, même id) pour l'entraînement à l'oreille.
   ═══════════════════════════════════════════════════════════════════════ */
(function(global){

const EXOS = [
{id:'l01', title:'Wiederbericht', fr:'Bulletin météo', kind:'bulletin',
  script:'Gudde Moien. Haut ass et bewölkt mat e puer Sonneschäiner den Nomëtteg. D’Temperature klammen op sechzéng Grad. Muer reent et de ganzen Dag, dofir hëlt en Regemantel mat.',
  questions:[
    {q:'Wéi ass d’Wieder haut de Moien?', fr:'Comment est la météo ce matin ?',
      opts:['Sonneg de ganzen Dag','Bewölkt mat Sonneschäiner den Nomëtteg','Et reent de ganzen Dag'], correct:1,
      why:'Le bulletin dit « bewölkt mat e puer Sonneschäiner den Nomëtteg » (nuageux avec quelques éclaircies l’après-midi).'},
    {q:'Wat ass d’Temperatur den Nomëtteg?', fr:'Quelle température l’après-midi ?',
      opts:['6 Grad','16 Grad','26 Grad'], correct:1, why:'« Temperature klammen op sechzéng Grad » = seize degrés.'},
    {q:'Wat rode se fir muer?', fr:'Que conseille-t-on pour demain ?',
      opts:['E Regemantel matzehuelen','Sonnebrëll ze droen','Doheem ze bleiwen'], correct:0,
      why:'« Muer reent et de ganzen Dag, dofir hëlt en Regemantel mat » = prends un imperméable.'}]},

{id:'l02', title:'Um Telefon mam Dokter', fr:'Au téléphone avec le médecin', kind:'dialog',
  script:'— Gudde Moien, ech hätt gär en Rendez-vous fir dës Woch. — Wat fehlt Iech? — Ech hu Féiwer zanter zwee Deeg. — Gutt, kënnt Dir haut Nomëtteg em véier Auer kommen? — Jo, dat geet.',
  questions:[
    {q:'Wat fehlt der Persoun?', fr:'Qu’est-ce que la personne a ?',
      opts:['Kappwéi','Féiwer','Näischt'], correct:1, why:'« Ech hu Féiwer zanter zwee Deeg » = j’ai de la fièvre depuis deux jours.'},
    {q:'Wéini ass den Rendez-vous?', fr:'Quand est le rendez-vous ?',
      opts:['Haut Moien','Haut Nomëtteg em véier Auer','Muer fréi'], correct:1, why:'« haut Nomëtteg em véier Auer » = aujourd’hui à seize heures.'},
    {q:'Zanter wéini huet d’Persoun Féiwer?', fr:'Depuis quand a-t-elle de la fièvre ?',
      opts:['Zanter engem Mount','Zanter zwee Deeg','Zanter haut Moien'], correct:1, why:'« zanter zwee Deeg » = depuis deux jours.'}]},

{id:'l03', title:'Ukënnegung an der Gare', fr:'Annonce en gare', kind:'bulletin',
  script:'Wichteg Informatioun: den Zuch Richtung Ettelbréck huet haut zéng Minutten Retard, wéinst enger Baustell. Mir bieden ëm Entschëllegung fir d’Inconvenienten.',
  questions:[
    {q:'Wat ass d’Neiegkeet?', fr:'Quelle est la nouvelle ?',
      opts:['De Zuch fällt aus','De Zuch huet Retard','De Zuch fiert net méi op Ettelbréck'], correct:1,
      why:'« huet haut zéng Minutten Retard » = a dix minutes de retard.'},
    {q:'Wéi vill Retard huet den Zuch?', fr:'Combien de retard ?',
      opts:['5 Minutten','10 Minutten','20 Minutten'], correct:1, why:'« zéng Minutten Retard » = dix minutes.'},
    {q:'Firwat huet den Zuch Retard?', fr:'Pourquoi ce retard ?',
      opts:['Wéinst dem Wieder','Wéinst enger Baustell','Wéinst engem Streik'], correct:1, why:'« wéinst enger Baustell » = à cause de travaux.'}]},

{id:'l04', title:'Um Maart', fr:'Au marché', kind:'dialog',
  script:'— Gudden Dag, wat kann ech fir Iech doen? — Ech hätt gär een Kilo Ieppel a wat kascht d’Zalot? — D’Zalot kascht zwee Euro d’Stéck. — Gutt, ech huelen zwou Zalote wa mir.',
  questions:[
    {q:'Wat kascht d’Zalot?', fr:'Combien coûte la salade ?',
      opts:['1 Euro','2 Euro','5 Euro'], correct:1, why:'« D’Zalot kascht zwee Euro d’Stéck » = deux euros la pièce.'},
    {q:'Wéi vill Zalote kaaft d’Persoun?', fr:'Combien de salades achète-t-on ?',
      opts:['Eng','Zwou','Dräi'], correct:1, why:'« ech huelen zwou Zalote » = j’en prends deux.'},
    {q:'Wat kaaft d’Persoun nach?', fr:'Que achète-t-elle d’autre ?',
      opts:['Ee Kilo Ieppel','Ee Kilo Biren','Näischt anescht'], correct:0, why:'« Ech hätt gär een Kilo Ieppel » = un kilo de pommes.'}]},

{id:'l05', title:'Ukënnegung: Duerffest', fr:'Annonce : fête du village', kind:'bulletin',
  script:'Léif Matbierger, dëse Weekend fënnt eist Duerffest statt, vu samschdes um sechs Auer bis sonndeg owes. Et gëtt Musek, Iessen an eng Kannerspillplaz. All Persoun ass wëllkomm.',
  questions:[
    {q:'Wéini fänkt d’Fest un?', fr:'Quand commence la fête ?',
      opts:['Freides um sechs Auer','Samschdes um sechs Auer','Sonndeg um sechs Auer'], correct:1,
      why:'« vu samschdes um sechs Auer » = à partir de samedi dix-huit heures.'},
    {q:'Wat gëtt et fir Kanner?', fr:'Qu’y a-t-il pour les enfants ?',
      opts:['Eng Kannerspillplaz','Eng Schwämm','Näischt spezifescht'], correct:0, why:'« eng Kannerspillplaz » = une aire de jeux pour enfants.'},
    {q:'Wien ass wëllkomm?', fr:'Qui est le bienvenu ?',
      opts:['Nëmmen d’Famillen','Nëmmen d’Kanner','All Persoun'], correct:2, why:'« All Persoun ass wëllkomm » = tout le monde est bienvenu.'}]},
];

// ── synthèse vocale ────────────────────────────────────────────────────
let chosenVoice = null, voiceChecked = false;
function pickVoice(){
  if(voiceChecked) return chosenVoice;
  voiceChecked = true;
  if(!('speechSynthesis' in window)) return null;
  const voices = speechSynthesis.getVoices();
  chosenVoice = voices.find(v => /lb/i.test(v.lang)) ||
                voices.find(v => /^de/i.test(v.lang)) ||
                voices.find(v => /^fr/i.test(v.lang)) || voices[0] || null;
  return chosenVoice;
}
if('speechSynthesis' in window){
  speechSynthesis.onvoiceschanged = () => { voiceChecked = false; };
}
function speak(text, onend){
  if(!('speechSynthesis' in window)){ if(onend) onend(); return false; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice();
  if(v) u.voice = v;
  u.rate = 0.92;
  if(onend) u.onend = onend;
  speechSynthesis.speak(u);
  return true;
}
function stopSpeak(){ if('speechSynthesis' in window) speechSynthesis.cancel(); }

global.LISTEN = {exercises:EXOS, speak, stopSpeak, hasTTS:('speechSynthesis' in window)};
})(window);
