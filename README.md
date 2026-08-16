# Sproochentest — Coach A2 · v4

Entraînement à **l'oral du Sproochentest luxembourgeois**. Application web, sans
serveur, sans compte, sans requête réseau après le chargement : tout reste dans
le navigateur de l'appareil.

## ⚠️ À faire avant la première utilisation

Ce dépôt contient tout le code (`index.html`, `app.js`, `method.js`, `listen.js`,
`pwa.js`, `sw.js`) prêt à l'emploi. Deux choses restent à compléter :

1. **`corpus.js`** — ce fichier contient actuellement un corpus **réduit**
   (quelques questions d'exemple), pas les 278 questions et 27 photos
   d'origine. Remplace son contenu par le JSON complet issu de ton document
   source (`Topics - Froen an äntwerten`), en conservant exactement la
   structure `window.CORPUS = {"themes": [...], "froen": [...], "photos": [...],
   "vocab": [...]};`. Vérifie la syntaxe avant de committer :
   ```bash
   node --check corpus.js
   ```
2. **`photos/`** — le dossier existe mais est vide. Dépose-y les 27 photos
   (`a.jpg` à `aa.jpg`, comme référencé dans le champ `img` de chaque entrée
   de `CORPUS.photos`) et les icônes de ton choix dans `icons/` (des icônes
   de secours y sont déjà présentes).

## Ce que l'app propose

L'application est construite autour d'une seule idée : **l'examen, c'est une
question et ta bouche**. Tout est indexé sur une question d'examen à laquelle
il faut savoir répondre tout de suite.

### Les deux épreuves

| | niveau | durée | contenu |
|---|---|---|---|
| **Héiverstoen** | **B1** | 35 min | 3 documents — un message radio, une conversation du quotidien, un échange ou une présentation. Un questionnaire à cocher par document, chacun passé deux fois. |
| **Mëndlechen Ausdrock** | A2 | 10 min | 5 min d'entretien (au choix parmi 2 sujets) + 5 min de description (au choix parmi 3 supports). |

Il faut au moins la moitié des points à l'oral ; une note inférieure peut être
compensée par l'écoute si la moyenne des deux atteint 50 %.

### La règle d'or

`Äntwert · Grond · Beispill` — réponse, raison, exemple. Une réponse d'un mot
fait perdre des points même juste.

### Tes réponses, pas celles du document

Les questions viennent avec une réponse modèle. Elle sert d'**ossature**.
L'application te fait écrire ta propre version, la garde, et c'est **la
tienne** qu'elle te fait réviser et redire à voix haute.

### La session du soir

Elle **n'apprend rien de neuf** : bilan de la journée, repêchage des erreurs,
trois réponses dites à voix haute, cinq cartes de demain, une photo en tête,
puis clôture. À partir de l'heure choisie (20 h par défaut), l'application
entière bascule dans un régime visuel et sonore différent (lumière chaude,
sons coupés, rythme ralenti).

## Fichiers

| | |
|---|---|
| `index.html` | coquille, styles, jeu d'icônes SVG |
| `app.js` | moteur : révision espacée, sessions, écrans |
| `method.js` | couche pédagogique (règle d'or, 7 types de questions, grammaire, méthode photo) |
| `listen.js` | 9 documents de compréhension orale (B1), écrits à la main |
| `corpus.js` | données du document source — **généré**, à compléter (voir ci-dessus) |
| `photos/` | photos référencées par `corpus.js` — à déposer |
| `icons/` | icônes PWA — icônes de secours incluses |
| `sw.js`, `pwa.js` | hors-ligne, installation, mises à jour |
| `manifest.webmanifest` | métadonnées PWA |

## Utilisation en local

Double-cliquer sur `index.html` suffit — l'application se charge entièrement.
Deux fonctions restent alors indisponibles, les navigateurs les réservant aux
contextes sécurisés : l'enregistrement au micro et l'installation hors ligne.
Pour les activer :

```bash
python3 -m http.server 8080
```

puis ouvrir http://localhost:8080/. Depuis un téléphone sur le même Wi-Fi,
remplacer `localhost` par l'adresse IP de l'ordinateur.

## Hébergement sur GitHub Pages

1. Pousse ce dossier tel quel sur un dépôt GitHub (voir plus bas).
2. Dans le dépôt : **Settings → Pages → Build and deployment → Source:
   Deploy from a branch**, branche `main`, dossier `/ (root)`.
3. L'app sera servie à `https://<utilisateur>.github.io/<nom-du-depot>/`.

Aucun build, tous les chemins sont relatifs (`./corpus.js`, `./icons/...`) —
ça fonctionne aussi bien à la racine d'un domaine que dans un sous-dossier
`github.io/nom-du-depot/`.

## Vie privée

Aucun serveur, aucun compte, aucun traceur. Toute la progression — y compris
tes réponses écrites — vit dans le `localStorage` du navigateur uniquement.
L'écran *Progrès* permet de l'exporter et de la réimporter.

## Compatibilité

Chrome, Edge, Firefox et Safari récents, mobile et bureau. La synthèse vocale
utilise la meilleure voix disponible : luxembourgeoise si le système en
propose une, sinon allemande.

## Licence du contenu

Projet personnel d'entraînement, à but éducatif et non commercial.
