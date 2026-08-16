/* Sproochentest A2 — couche pédagogique.
   Écrite à la main : rien de tout ceci n'est dérivable du PDF source, qui donne
   la matière (questions, réponses, photos) mais pas la méthode.

   Principe directeur : à l'A2 oral, l'examinateur n'attend pas une langue
   parfaite, il attend une réponse *qui vient tout de suite* et *qui tient
   debout*. Tout ce qui suit sert cet objectif : reconnaître le type de
   question en une seconde, avoir une ossature de phrase prête, et parler
   trois phrases au lieu d'une. */

window.METHOD = (function () {

  /* ══════════════════════════════════════════════════════════════════════
     LA RÈGLE D'OR — 3 phrases, toujours
     ══════════════════════════════════════════════════════════════════════ */
  const GOLDEN = {
    title: 'Äntwert · Grond · Beispill',
    fr: 'Réponse · Raison · Exemple',
    body: "Une réponse d'un mot fait perdre des points même quand elle est juste. "
      + "À chaque question, trois phrases : ce que tu fais, pourquoi, et un exemple concret. "
      + "C'est la même mécanique pour les 278 questions — apprends la mécanique, pas 278 réponses.",
    demo: {
      q: 'Kaaft Dir gär Kleeder?',
      bad: 'Jo.',
      good: [
        ['Äntwert', 'Jo, ech kafe gär Kleeder.'],
        ['Grond', "Well ech gär nei Saache probéieren."],
        ['Beispill', "Zum Beispill hunn ech leschte Samschdeg eng nei Box an der Stad kaaft."]
      ]
    }
  };

  /* ══════════════════════════════════════════════════════════════════════
     LES 7 TYPES DE QUESTIONS
     `hit` sert aussi à classer automatiquement les questions du corpus :
     l'entraînement à la reconnaissance porte donc sur de vraies questions
     d'examen, pas sur une liste inventée.
     ══════════════════════════════════════════════════════════════════════ */
  const QTYPES = [
    {
      k: 'jonee', st: 'Jo / Nee', ic: 'i-haut', t: 'Jo / Nee', fr: 'Question fermée',
      sig: "Le verbe est en tête : Hutt Dir…? Gitt Dir…? Kaaft Dir…? Sidd Dir…?",
      hit: [], ord: 99,
      how: "Ne réponds jamais « Jo » tout seul. Jo/Nee + la phrase complète + un exemple.",
      frames: [
        'Jo, ech … gär, well …',
        'Nee, ech … net gär, well …',
        'Jo, awer nëmmen …',
        'Nee, guer net. Ech … léiwer …'
      ],
      ex: ['Sidd Dir sportlech?',
        "Jo, ech si relativ sportlech. Ech ginn zweemol d'Woch schwammen, well dat mir hëlleft ze relaxen."]
    },
    {
      k: 'watfir', st: 'Wat fir …', ic: 'i-star', t: 'Wat fir (en / eng / e)', fr: 'Lequel · quel type de',
      sig: "« Wat fir » + article. C'est la question la plus fréquente de l'examen.",
      hit: [/\bwat fir\b/, /\bwei en(g|ger)?\b/, /\bwat sinn\b/, /\ba wei enger\b/, /\bwat ass\b.*\bfir\b/], ord: 2,
      how: "Nomme d'abord, décris ensuite, justifie enfin. Deux exemples valent mieux qu'un.",
      frames: [
        'Ech hunn am léifsten …',
        "Meeschtens … , zum Beispill … an … .",
        'Dat hänkt of: fir … , … ; fir … , … .'
      ],
      ex: ['Wat fir Kleeder dot Dir un fir schaffen ze goen?',
        "Op der Aarbecht droen ech meeschtens eng Box aus Jeans an e Pullover. Fir eng Reunioun dinn ech e Hiem un, well et méi seriö ausgesäit."]
    },
    {
      k: 'wat', st: 'Wat …?', ic: 'i-froen', t: 'Wat …?', fr: 'Quoi · que fais-tu',
      sig: "« Wat maacht Dir…? », « Wat ass…? », « Wat liest Dir…? »",
      hit: [/^wat\b/, /\biwwer wat\b/, /^wien\b/, /^wie\b/, /\bmat wiem\b/, /\bwiem\b/, /\bwat heescht\b/], ord: 6,
      how: "Énumère deux ou trois choses, reliées par des connecteurs. Une liste plate coûte des points.",
      frames: [
        'Als éischt … , duerno … , an zum Schluss … .',
        'Ech … , an heiansdo … .',
        'Meeschtens … , mee wann … , dann … .'
      ],
      ex: ['Wat maacht Dir gewéinlech de Weekend?',
        "Samschdes maachen ech de Stot a ginn akafen. Sonndes trëppelen ech gär an der Natur, an owes kucken ech e Film mat menger Famill."]
    },
    {
      k: 'wou', st: 'Wou …?', ic: 'i-foto', t: 'Wou · Vu wou · Wouhin', fr: 'Où · d\'où · vers où',
      sig: "Trois questions différentes : l'endroit, l'origine, la direction.",
      hit: [/\bwou\b/, /\bwouhin\b/, /\bwuer\b/, /\bvu wou\b/, /\bwoutranger\b/], ord: 3,
      how: "Le piège est la préposition, pas le lieu. **zu** + ville, **an** + pays, **op** + surface, **bei** + personne.",
      frames: [
        'Ech wunnen zu … , dat ass am Süden / am Norden vu Lëtzebuerg.',
        'Ech kommen ursprénglech aus … .',
        'Ech ginn op … / an … .'
      ],
      ex: ['Wou wunnt Dir?',
        "Ech wunnen zu Esch-Uelzecht, an engem Appartement mat dräi Zëmmeren. Ech wunnen do zanter fënnef Joer a mir gefält et ganz gutt."]
    },
    {
      k: 'zait', st: 'Wéini · Wéi oft', ic: 'i-clock', t: 'Wéini · Wéi oft · Wéi laang · Zanter wéini', fr: 'Quand · combien de fois · depuis quand',
      sig: "Toute question de temps. « Zanter wéini » exige un présent, pas un passé.",
      hit: [/\bweini\b/, /\bwei oft\b/, /\bwei dacks\b/, /\bwei laang\b/, /\bzanter\b/, /\bsait wei\b/, /\bum wei vill auer\b/, /\bwei vill mol\b/], ord: 1,
      how: "Donne une fréquence chiffrée : « eemol d'Woch » vaut mieux que « heiansdo ».",
      frames: [
        "eemol / zweemol / dräimol d'Woch (de Mount, d'Joer)",
        'all Dag · all Weekend · all zweete Dag',
        'Zanter … Joer … (présent !) — Ech schaffen do zanter dräi Joer.',
        'Et dauert ongeféier … Minutten.'
      ],
      ex: ["Wéi oft gitt Dir akafen?",
        "Ech ginn eemol d'Woch akafen, meeschtens samschdes moies, well dann net vill Leit am Supermarché sinn."]
    },
    {
      k: 'wei', st: 'Wéi …?', ic: 'i-gram', t: 'Wéi · Wéi vill · Wéi gefält', fr: 'Comment · combien · ça te plaît',
      sig: "Demande une appréciation ou une quantité. Réponds par un adjectif, puis justifie.",
      hit: [/\bwei vill\b/, /\bwei gefaellt\b/, /\bwei ass\b/, /\bwei war\b/, /\bwei fannt\b/, /\bwei sinn\b/, /^wei\b/, /\bwat haalt dir dovun\b/, /\bwat mengt dir\b/], ord: 5,
      how: "Un adjectif seul ne suffit pas : adjectif + « well » + verbe à la fin.",
      frames: [
        'Et gefält mir ganz gutt, well …',
        'Et ass … , mee heiansdo e bësse … .',
        'Ech fannen dat … .'
      ],
      ex: ['Wéi gefält Iech Är Aarbecht?',
        "Meng Aarbecht gefält mir gutt, well ech mat sympathesche Kolleege schaffen. Heiansdo ass et e bësse stresseg, mee ech beklo mech net."]
    },
    {
      k: 'firwat', st: 'Firwat …?', ic: 'i-fiche', t: 'Firwat …?', fr: 'Pourquoi',
      sig: "La question qui suit toutes les autres. Prépare-la : elle arrive toujours.",
      hit: [/\bfirwat\b/, /\bwarum\b/], ord: 0,
      how: "**well** envoie le verbe à la fin. C'est la faute la plus fréquente et la plus visible.",
      frames: [
        'Well ech … gär hunn.',
        'Well et méi … ass.',
        'Aus zwee Grënn: éischtens … , zweetens … .'
      ],
      ex: ['Firwat léiert Dir Lëtzebuergesch?',
        "Ech léiere Lëtzebuergesch, well ech zu Lëtzebuerg wunnen a schaffen. Ech wëll mat menge Noperen a mat de Kolleegen an hirer Sprooch schwätzen."]
    }
  ];

  /* ══════════════════════════════════════════════════════════════════════
     LES BÉQUILLES — ce qui achète du temps sans faire de faute
     ══════════════════════════════════════════════════════════════════════ */
  const FILLERS = [
    ['Also …', 'Alors…'],
    ['Ech géif soen …', 'Je dirais…'],
    ['Also, wéi soll ech soen …', 'Alors, comment dire…'],
    ['Dat ass eng gutt Fro.', 'Bonne question.'],
    ['Waart, ech iwwerleeën e Moment.', "Attendez, je réfléchis un instant."],
    ['Ech mengen …', 'Je pense que…'],
    ['Dat hänkt of.', 'Ça dépend.'],
    ['Wann ech éierlech sinn …', 'Si je suis honnête…'],
    ["Entschëllegt, kënnt Dir d'Fro widderhuelen?", 'Pardon, pouvez-vous répéter la question ?'],
    ["Wéi seet een dat op Lëtzebuergesch?", "Comment dit-on ça en luxembourgeois ?"]
  ];

  const CONNECT = [
    ['an', 'et'], ['awer / mee', 'mais'], ['well', 'parce que (verbe à la fin)'],
    ['dofir', "c'est pourquoi"], ['dann', 'alors'], ['duerno', 'ensuite'],
    ['als éischt', "d'abord"], ['zum Schluss', 'pour finir'],
    ['zum Beispill', 'par exemple'], ['meeschtens', 'la plupart du temps'],
    ['heiansdo', 'parfois'], ['ëmmer', 'toujours'], ['ni', 'jamais'],
    ['normalerweis', "normalement"], ['virun allem', 'surtout'],
    ['am léifsten', 'de préférence'], ['ausserdeem', 'en plus'],
    ['allerdéngs', 'toutefois'], ['op der enger Säit … op der anerer Säit', "d'un côté… de l'autre"]
  ];

  /* ══════════════════════════════════════════════════════════════════════
     PHOTO — la méthode A · B · C · D
     ══════════════════════════════════════════════════════════════════════ */
  const PIC_METHOD = [
    {
      k: 'A', t: 'A · Situatioun', fr: 'La situation',
      time: '≈ 1 min 30',
      goal: "Qui, où, quand. Trois questions, trois à cinq phrases. Ne décris encore aucun objet.",
      blocks: [
        ['Wien? · Qui', [
          'Op der Foto gesinn ech … , an zwar … .',
          'Um Bild gesinn ech vill Leit, jonk an al Persounen.',
          "Op der Foto gesinn ech eng Famill: de Papp, d'Mamm an zwee Kanner.",
          'Ech gesi jonk Leit — ech mengen, si si Frënn.'
        ]],
        ['Wou? · Où', [
          'Ech mengen, dat ass … .',
          "D'Foto gouf bausse / bannen geholl.",
          "D'Leit sinn dobaussen a sëtzen op der Terrass vun engem Café.",
          "D'Persoune sinn am Gaart / am Park / doheem an der Stuff."
        ]],
        ['Wéini? · Saison', [
          "Am Summer, well d'Wieder sonneg ass an den Himmel kloer ass.",
          "Am Wanter, well d'Wieder bedeckt ass an d'Leit waarm Kleeder unhunn.",
          "Am Hierscht, well d'Blieder giel, orange a rout sinn a vun de Beem falen.",
          "Am Fréijoer, well vill Blummen bléien an d'Natur frësch ausgesäit."
        ]],
        ['Wéini? · Moment', [
          "Moies, well d'Liicht nach mëll ass.",
          "Mëttes, well et hell ass an d'Leit dobausse sinn.",
          'Owes, well et ufänkt däischter ze ginn.',
          "Nuets, well et däischter ass an d'Stroosseluuchten un sinn.",
          "De Weekend, well d'Leit sech entspanen an d'Geschäfter voll sinn."
        ]]
      ]
    },
    {
      k: 'B', t: 'B · Aktivitéiten', fr: "Ce qu'ils font",
      time: '≈ 1 min',
      goal: "Les verbes d'action au présent. Deux ou trois phrases suffisent.",
      blocks: [
        ['Doheem', [
          'Si schwätze mateneen an drénken eppes.',
          'Si sëtzen zesummen an drénken e Kaffi.',
          'Si kachen zesummen a preparéieren en Iessen.'
        ]],
        ['Dobaussen', [
          'Si trëppelen a kucke ronderëm.',
          'Si fuere Vëlo / si spillen zesummen.',
          "Si stinn an der Schlaang a waarden."
        ]],
        ['Stëmmung', [
          'Si gesi frou aus an hu vill Spaass.',
          'Si laachen a genéissen de Moment.'
        ]]
      ]
    },
    {
      k: 'C', t: 'C · Eng Persoun beschreiwen', fr: 'Décrire une personne',
      time: '≈ 1 min 30',
      goal: "Une ou deux personnes, jamais toutes. Position → âge → cheveux → vêtements.",
      blocks: [
        ['Positioun', [
          'An der Mëtt gesinn ech … .',
          'Uewe lénks / uewe riets gesinn ech … .',
          'Ënne lénks / ënne riets gesinn ech … .',
          'Déi éischt Persoun vu lénks … · déi zweet Persoun vu riets … .',
          'Am Virdergrond / am Hannergrond … .'
        ]],
        ['Alter', [
          "D'Mamm ass ongeféier 35 Joer al.",
          "D'Kanner hunn tëscht 8 an 10 Joer.",
          'Ech géif soen, hien ass tëscht 30 a 35 Joer al.'
        ]],
        ['Hoer & Ausgesinn', [
          'laang · kuerz · mëttellaang · gekrauselt · glat · blond · brong · gro · gefierft',
          'e Schnauz · e Baart · eng Glatz · e Päerdsschwanz · en Tuppi',
          'grouss · kleng · schlank · korpulent · sportlech · jonk · al · flott'
        ]],
        ['Kleeder', [
          'Hatt huet e wäissen T-Shirt an eng blo Box un.',
          'Hien huet e blot Hiem an eng schwaarz Box un.',
          'Si huet e rouden Rack un a Schong aus Lieder.'
        ]]
      ]
    },
    {
      k: 'D', t: 'D · Conclusioun', fr: 'La phrase de sortie',
      time: '≈ 15 s',
      goal: "Ne t'arrête jamais dans le vide : ferme toi-même, l'examinateur note la maîtrise.",
      blocks: [
        ['Ofschloss', [
          "Voilà! Dat ass alles wat ech op dëser Foto beschreiwe kann.",
          "Ech mengen, ech hunn alles Wichteges gesot.",
          "Dat ass meng Beschreiwung vun dëser Foto. Merci!"
        ]]
      ]
    }
  ];

  /* ══════════════════════════════════════════════════════════════════════
     GRAMMAIRE — seulement les fautes qui s'entendent à l'oral
     ══════════════════════════════════════════════════════════════════════ */
  const GRAMMAR = [
    {
      k: 'v2', t: 'Le verbe en 2ᵉ position', fr: 'La règle qui structure tout',
      body: "Le verbe conjugué est toujours le **2ᵉ élément** de la phrase. Si tu commences par un "
        + "complément de temps ou de lieu, le sujet passe *après* le verbe.",
      rows: [
        ['Ech ginn all Dag schaffen.', 'Je vais travailler tous les jours.', 1],
        ['All Dag ginn ech schaffen.', '↳ le sujet passe après le verbe', 1],
        ['All Dag ech ginn schaffen.', 'faute très audible', 0],
        ['Am Summer fuere mir op Spuenien.', "En été nous partons en Espagne.", 1]
      ]
    },
    {
      k: 'well', t: '« well » envoie le verbe à la fin', fr: 'Subordonnées',
      body: "Après **well** (parce que), **wann** (si/quand), **datt** (que), **obwuel** (bien que), "
        + "le verbe conjugué part tout à la fin de sa proposition.",
      rows: [
        ['… well ech midd sinn.', "…parce que je suis fatigué.", 1],
        ['… well ech sinn midd.', 'faute classique', 0],
        ["Wann d'Wieder schéin ass, ginn ech spadséieren.", "S'il fait beau, je vais me promener.", 1],
        ['Ech mengen, datt et gutt ass.', 'Je pense que c\'est bien.', 1]
      ]
    },
    {
      k: 'perf', t: 'Le passé : hunn ou sinn', fr: 'Perfekt',
      body: "Un seul passé à l'oral : **hunn / sinn + participe**. **sinn** pour le mouvement et le "
        + "changement d'état (goen, kommen, fueren, bleiwen, ginn, sinn), **hunn** pour tout le reste.",
      rows: [
        ['Ech hu geschafft.', "J'ai travaillé.", 1],
        ['Ech si gaangen.', 'Je suis allé.', 1],
        ['Ech si fortgefuer.', 'Je suis parti (en véhicule).', 1],
        ['Ech hunn e Film gekuckt.', "J'ai regardé un film.", 1],
        ['Ech hu gaangen.', 'faute', 0]
      ]
    },
    {
      k: 'gaer', t: 'gär · net gär · léiwer · am léifsten', fr: 'Dire ce qu\'on aime',
      body: "**gär** n'est pas un verbe : il se pose après le verbe conjugué. Le comparatif est "
        + "**léiwer**, le superlatif **am léifsten**.",
      rows: [
        ['Ech drénke gär Kaffi.', "J'aime bien le café.", 1],
        ['Ech drénke net gär Téi.', "Je n'aime pas le thé.", 1],
        ['Ech drénke léiwer Waasser.', "Je préfère l'eau.", 1],
        ['Am léifsten drénken ech e Cappuccino.', 'Ce que je préfère, c\'est un cappuccino.', 1],
        ['Ech gär drénke Kaffi.', 'faute', 0]
      ]
    },
    {
      k: 'dativ', t: 'Les prépositions qui commandent le datif', fr: 'Datif',
      body: "**mat, no, vun, zu, bei, säit / zanter, aus, ausser, géigeniwwer** → toujours le datif. "
        + "C'est ce qui transforme *de Bus* en *mam Bus*.",
      rows: [
        ['mat dem Bus → mam Bus', 'en bus', 1],
        ['bei dem Dokter → beim Dokter', 'chez le médecin', 1],
        ['zu der Aarbecht → op d\'Aarbecht', 'au travail', 1],
        ['vun der Stad', 'de la ville', 1],
        ['mat menger Frëndin', 'avec mon amie', 1]
      ]
    },
    {
      k: 'artikel', t: 'Les trois genres', fr: 'den · déi · dat',
      body: "Défini : **den / d'** (masc.), **d'** (fém.), **d'** (neutre). "
        + "Indéfini : **en** (masc.), **eng** (fém.), **e** (neutre). "
        + "Retiens le genre avec le mot, jamais après.",
      rows: [
        ["den Dësch — en Dësch", 'la table (m.)', 1],
        ["d'Blumm — eng Blumm", 'la fleur (f.)', 1],
        ["d'Kand — e Kand", "l'enfant (n.)", 1],
        ['Eupheneschen "n" : en Dësch, e Buttek', "le -n tombe devant b, p, f, k, g…", 1]
      ]
    },
    {
      k: 'zahlen', t: 'Heure, durée, fréquence', fr: 'Chiffres utiles',
      body: "L'examinateur teste presque toujours une heure et une fréquence. Prépare-les.",
      rows: [
        ['Et ass hallwer aacht.', 'Il est 7 h 30.', 1],
        ['Et ass Véirel op aacht.', 'Il est 8 h 15.', 1],
        ['Et ass Véirel viru aacht.', 'Il est 7 h 45.', 1],
        ["eemol d'Woch · zweemol de Mount", 'une fois par semaine · deux fois par mois', 1],
        ['Et dauert ongeféier zwanzeg Minutten.', 'Ça dure environ 20 minutes.', 1]
      ]
    }
  ];

  /* ══════════════════════════════════════════════════════════════════════
     CONJUGAISON — présent
     ══════════════════════════════════════════════════════════════════════ */
  const PERS = ['ech', 'du', 'hien / si / hatt', 'mir', 'dir', 'si'];
  const CONJ = [
    { v: 'sinn', fr: 'être', f: ['sinn', 'bass', 'ass', 'sinn', 'sidd', 'sinn'] },
    { v: 'hunn', fr: 'avoir', f: ['hunn', 'hues', 'huet', 'hunn', 'hutt', 'hunn'] },
    { v: 'ginn', fr: 'aller / donner', f: ['ginn', 'gees', 'gëtt', 'ginn', 'gitt', 'ginn'] },
    { v: 'goen', fr: 'aller (à pied)', f: ['ginn', 'gees', 'geet', 'ginn', 'gitt', 'ginn'] },
    { v: 'maachen', fr: 'faire', f: ['maachen', 'méchs', 'mécht', 'maachen', 'maacht', 'maachen'] },
    { v: 'schaffen', fr: 'travailler', f: ['schaffen', 'schaffs', 'schafft', 'schaffen', 'schafft', 'schaffen'] },
    { v: 'wunnen', fr: 'habiter', f: ['wunnen', 'wunns', 'wunnt', 'wunnen', 'wunnt', 'wunnen'] },
    { v: 'kommen', fr: 'venir', f: ['kommen', 'kënns', 'kënnt', 'kommen', 'kommt', 'kommen'] },
    { v: 'fueren', fr: 'rouler / partir', f: ['fueren', 'fiers', 'fiert', 'fueren', 'fuert', 'fueren'] },
    { v: 'iessen', fr: 'manger', f: ['iessen', 'ëss', 'ësst', 'iessen', 'iesst', 'iessen'] },
    { v: 'drénken', fr: 'boire', f: ['drénken', 'drénks', 'drénkt', 'drénken', 'drénkt', 'drénken'] },
    { v: 'liesen', fr: 'lire', f: ['liesen', 'lies', 'liest', 'liesen', 'liest', 'liesen'] },
    { v: 'kucken', fr: 'regarder', f: ['kucken', 'kucks', 'kuckt', 'kucken', 'kuckt', 'kucken'] },
    { v: 'schwätzen', fr: 'parler', f: ['schwätzen', 'schwätz', 'schwätzt', 'schwätzen', 'schwätzt', 'schwätzen'] },
    { v: 'gesinn', fr: 'voir', f: ['gesinn', 'gesäis', 'gesäit', 'gesinn', 'gesitt', 'gesinn'] },
    { v: 'kafen', fr: 'acheter', f: ['kafen', 'kaafs', 'kaaft', 'kafen', 'kaaft', 'kafen'] },
    { v: 'spillen', fr: 'jouer', f: ['spillen', 'spills', 'spillt', 'spillen', 'spillt', 'spillen'] },
    { v: 'kënnen', fr: 'pouvoir', f: ['kann', 'kanns', 'kann', 'kënnen', 'kënnt', 'kënnen'] },
    { v: 'wëllen', fr: 'vouloir', f: ['wëll', 'wëlls', 'wëll', 'wëllen', 'wëllt', 'wëllen'] },
    { v: 'mussen', fr: 'devoir', f: ['muss', 'muss', 'muss', 'mussen', 'musst', 'mussen'] }
  ];

  /* ══════════════════════════════════════════════════════════════════════
     L'EXAMEN — ce qui se passe vraiment, et la grille
     ══════════════════════════════════════════════════════════════════════ */
  const EXAM = {
    parts: [
      ['Héiverstoen', 'Compréhension de l\'oral — B1', '35 min',
        "Trois documents sonores : un message radio, une conversation du quotidien, "
        + "un échange ou une présentation sur un thème précis. Un questionnaire à cocher "
        + "par document, chaque document passé deux fois."],
      ['Mëndlechen Ausdrock · 1', 'Entretien — A2', '5 min',
        "L'examinateur propose deux sujets du quotidien (travail, famille, loisirs…) : "
        + "tu en choisis un, et la conversation s'engage dessus."],
      ['Mëndlechen Ausdrock · 2', 'Description — A2', '5 min',
        "Trois supports te sont proposés : tu en choisis un et tu le décris. "
        + "C'est la partie la plus prévisible de l'examen — la méthode A·B·C·D suffit à la remplir."]
    ],
    grid: [
      ['Repertoire', 'Le vocabulaire dont tu disposes', 'Deux ou trois mots précis du thème valent mieux qu\'un vocabulaire vague.'],
      ['Flëssegkeet', 'Ça sort sans blocage', 'Les béquilles valent mieux que le silence.'],
      ['Kloerheet', 'On te comprend sans effort', 'Parle lentement et fort. C\'est le critère qui pardonne le moins.'],
      ['Grammatesch Strukturen', 'Verbe en 2ᵉ position, « well » à la fin', 'Compte moins que d\'être compris — n\'arrête pas de parler pour te corriger.'],
      ['Kohärenz', 'Les phrases s\'enchaînent', 'Äntwert · Grond · Beispill, avec des connecteurs.'],
      ['Interaktivitéit', 'Tu réagis à ton interlocuteur', 'Faire répéter est prévu par la grille, ce n\'est pas une faute.']
    ],
    scoring: "Il faut au moins la moitié des points à l'expression orale. Une note "
      + "inférieure peut être compensée par la compréhension de l'oral, si la moyenne "
      + "des deux atteint 50 %."
  };

  /* ══════════════════════════════════════════════════════════════════════
     LA SESSION DU SOIR — pourquoi elle existe
     ══════════════════════════════════════════════════════════════════════ */
  const EVENING = {
    why: "Ce que tu revois juste avant de dormir est ce que ta mémoire consolide pendant la nuit. "
      + "La session du soir ne t'apprend rien de neuf : elle repasse ce que tu as raté aujourd'hui, "
      + "te fait dire trois réponses à voix haute, et te montre ce qui t'attend demain.",
    steps: [
      ['Bilan', "Ce que tu as fait aujourd'hui, en trois chiffres."],
      ['Repêchage', "Tout ce que tu as raté aujourd'hui, reposé une fois."],
      ['Rappel silencieux', "Cinq cartes de demain, en avant-première."],
      ['Trois à voix haute', "Tes propres réponses, dites, sans correction."],
      ['Une photo en tête', "Soixante secondes de structure A·B·C·D, les yeux fermés."],
      ['Bonne nuit', "Ce qui t'attend demain. Puis tu ranges le téléphone."]
    ],
    close: [
      "Dat war et fir haut. Schlof gutt!",
      "Genuch fir haut. Muer geet et weider.",
      "Gutt gemaach. Elo ausrouen.",
      "Fäerdeg. Däi Kapp schafft elo weider, ouni dech."
    ]
  };

  /* ══════════════════════════════════════════════════════════════════════
     CONSEILS DU JOUR
     ══════════════════════════════════════════════════════════════════════ */
  const TIPS = [
    "Une réponse d'un mot est une réponse ratée, même si elle est juste. Trois phrases : réponse, raison, exemple.",
    "Tu ne connais pas le mot ? Contourne-le. « Wéi seet een dat? » vaut mieux qu'un blanc de dix secondes.",
    "Parle plus lentement que tu ne le crois nécessaire. La lenteur passe pour de la maîtrise ; la précipitation, pour de l'hésitation.",
    "Après chaque réponse, l'examinateur demandera « Firwat? ». Prépare la raison en même temps que la réponse.",
    "« well » envoie le verbe à la fin. Une seule règle, et elle s'entend à chaque phrase.",
    "Sur la photo, décris deux personnes à fond plutôt que six en surface.",
    "Ne te corrige pas au milieu d'une phrase : finis-la, puis reformule si tu veux.",
    "Apprends les chiffres et les heures par cœur. Ils tombent à tous les examens et ne pardonnent pas l'hésitation.",
    "Personnalise chaque réponse modèle : ta vraie vie sort toujours plus vite qu'une phrase apprise.",
    "Répète à voix haute, jamais dans ta tête. L'examen est un exercice de bouche, pas de lecture.",
    "Cinq minutes tous les jours battent trois heures le dimanche. La régularité fait la fluidité.",
    "Le soir, repasse ce que tu as raté le matin : la nuit fait le reste du travail.",
    "Commence par « Also… » ou « Ech géif soen… » : tu gagnes deux secondes sans faire de faute.",
    "Si tu ne comprends pas la question, demande. C'est prévu par la grille, ce n'est pas une faute.",
    "Une phrase courte et juste vaut mieux qu'une longue qui s'effondre au milieu."
  ];

  return { GOLDEN, QTYPES, FILLERS, CONNECT, PIC_METHOD, GRAMMAR, PERS, CONJ, EXAM, EVENING, TIPS };
})();
