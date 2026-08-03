# Sproochentest — Coach A2

Coach d'entraînement à l'oral du Sproochentest luxembourgeois (A2), en PWA
100 % statique (HTML/CSS/JS, aucune dépendance, aucun backend).

⚠️ **Outil privé et indépendant**, non affilié à l'INLL ni aux
administrations luxembourgeoises. Il ne garantit aucun résultat officiel.

## Contenu
- 42 questions d'expression orale, réparties sur les 10 thèmes officiels
  (présentation, famille, travail, logement, transports, loisirs, santé,
  nourriture, Luxembourg, projets) — voir `corpus.js`.
- Méthode de réponse en 3 temps : **Äntwert · Grond · Beispill**
  (réponse · justification · vocabulaire) — voir `method.js`.
- 5 exercices de compréhension orale avec synthèse vocale du navigateur
  (approximative : aucun navigateur n'a de voix luxembourgeoise fiable) —
  voir `listen.js`.
- 27 vraies photos à décrire (dossier `/photos`) — voir `corpus.js`.
  ⚠️ Les titres affichés sont des placeholders génériques
  ("Foto 1"…"Foto 27") : je n'ai pas voulu inventer de légendes précises
  sans certitude sur chaque scène. Corrige-les directement dans
  `corpus.js` (`title`, `fr`, `vocab`), un objet par photo — c'est la
  correction la plus rapide à fort impact.
- Suivi de progression (série de jours, XP, score par thème) en
  `localStorage`, rien n'est envoyé à un serveur.
- PWA installable, fonctionne hors-ligne après la première visite
  (`sw.js` + `manifest.webmanifest`).

## Lancer en local
Aucune compilation nécessaire. Il faut juste servir les fichiers via http
(le fetch du manifest et le service worker ne marchent pas en `file://`) :

```bash
cd sproochentest-coach
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

ou avec Node : `npx serve .`

## Déployer sur GitHub Pages (URL publique gratuite)
```bash
cd sproochentest-coach
git init
git add .
git commit -m "Sproochentest Coach — première version"
git branch -M main
git remote add origin https://github.com/<ton-compte>/sproochentest-coach.git
git push -u origin main
```
Puis sur GitHub : Settings → Pages → Source = "Deploy from a branch" →
Branch = `main` / `root`. L'URL sera
`https://<ton-compte>.github.io/sproochentest-coach/` (disponible après
1-2 minutes, et à chaque nouveau `push`).

## Ce que j'étendrais en premier
1. **Les légendes des 27 photos** : remplacer les titres génériques
   "Foto N" dans `corpus.js` par de vrais titres luxembourgeois + 2-3 mots
   de vocabulaire par photo.
2. **Le corpus de questions** : passer de 42 à un ensemble plus large,
   idéalement relu par un locuteur natif — c'est la priorité, le reste ne
   vaut que ce que vaut le contenu.
3. **De vrais enregistrements audio** pour l'écoute plutôt que la
   synthèse vocale (dossier `/audio`, même `id` que dans `listen.js`) —
   la synthèse actuelle aide pour le texte, pas pour l'oreille.
4. **Un vrai enregistreur vocal** (MediaRecorder) pour se réécouter après
   chaque réponse, au lieu du simple chronomètre actuel.
