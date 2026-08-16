/* Sproochentest — Héiverstoen (compréhension de l'oral, B1)
   ───────────────────────────────────────────────────────────────────────────
   La deuxième épreuve, et la plus lourde : 35 minutes, trois documents, un
   questionnaire à cocher par document. Le niveau visé est B1, un cran au-dessus
   de l'expression orale — c'est là que la plupart des candidats perdent des
   points, parce qu'ils s'entraînent à parler et jamais à écouter.

   Les trois genres sont ceux de l'épreuve :
     · e Radiomessage        — bulletin, annonce, météo, info trafic
     · e Gespréich           — conversation sur un sujet du quotidien
     · en Austausch          — échange ou présentation sur un thème précis

   Il n'y a pas de fichiers son : les textes sont lus par la synthèse vocale du
   navigateur, avec une voix différente par locuteur quand le système en offre
   plusieurs. C'est moins beau qu'un enregistrement, mais c'est disponible hors
   ligne, réglable en vitesse, et ça ne pèse rien. */

window.LISTEN = (function () {

  const DOCS = [

    /* ══════════════════ 1. MESSAGES RADIO ══════════════════════════════════ */
    {
      id: 'r1', kind: 'R', min: 2,
      title: 'Verkéier a Wieder',
      fr: 'Bulletin trafic et météo',
      intro: "Un bulletin de radio du matin : circulation, puis météo.",
      lines: [
        ['N', "Gudde Moien, léif Nolauschterer, et ass siwen Auer dräisseg. Hei kënnt de Verkéiersbulletin."],
        ['N', "Op der A3 tëscht Dudelange an der Stad steet de Verkéier op ronn véier Kilometer. De Grond ass en Accident mat dräi Autoen op der Héicht vun der Sortie Hesperange. Et ginn zum Gléck keng Blesséierter, mee eng Spuer bleift bis géint néng Auer gespaart."],
        ['N', "Op der Streck tëscht Ettelbréck a Bettembourg fueren d'Zich haut mat ongeféier zwanzeg Minutte Verspéidung. D'CFL setzt Busse tëscht Miersch a Colmar-Bierg an."],
        ['N', "An elo d'Wieder. De Moie bleift et bedeckt a fiicht, mat Temperaturen ëm siwe Grad. Vu mëttes u gëtt et méi hell, an d'Sonn kënnt kuerz eraus. Owes fält erëm Reen, an et gëtt frësch: nëmmen nach dräi Grad. Muer da soll et de ganzen Dag dréche bleiwen, mat bis zu zwielef Grad."],
        ['N', "Dat war et vun eis. Eng gutt Fahrt an e schéinen Dag!"]
      ],
      q: [
        { q: "Firwat steet de Verkéier op der A3?", o: ["Wéinst Aarbechten op der Strooss", "Wéinst engem Accident mat dräi Autoen", "Wéinst dem schlechte Wieder", "Wéinst enger Manifestatioun"], a: 1,
          why: "« De Grond ass en Accident mat dräi Autoen. » Les travaux et la météo sont mentionnés ailleurs — c'est le piège classique du bulletin." },
        { q: "Wéi laang bleift eng Spuer gespaart?", o: ["Bis siwen Auer dräisseg", "Bis aacht Auer", "Bis géint néng Auer", "De ganzen Dag"], a: 2,
          why: "« eng Spuer bleift bis géint néng Auer gespaart ». Sept heures trente, c'est l'heure du bulletin, pas la fin du blocage." },
        { q: "Wat mécht d'CFL wéinst der Verspéidung?", o: ["Si annuléiert all d'Zich", "Si setzt Busse tëscht Miersch a Colmar-Bierg an", "Si bitt gratis Billjeeën un", "Si mécht näischt"], a: 1,
          why: "« D'CFL setzt Busse tëscht Miersch a Colmar-Bierg an. » — un remplacement, pas une annulation." },
        { q: "Wéi ass d'Wieder mëttes?", o: ["Et reent de ganze Mëtteg", "Et gëtt méi hell an d'Sonn kënnt kuerz eraus", "Et schneit", "Et bleift bedeckt bis owes"], a: 1,
          why: "« Vu mëttes u gëtt et méi hell, an d'Sonn kënnt kuerz eraus. » La pluie revient le soir, pas l'après-midi." },
        { q: "Wéi vill Grad ginn et muer?", o: ["Dräi Grad", "Siwe Grad", "Zwielef Grad", "Zwanzeg Grad"], a: 2,
          why: "« Muer … mat bis zu zwielef Grad. » Trois et sept degrés concernent aujourd'hui. Aux chiffres, notez toujours à quel jour ils se rapportent." }
      ],
      words: [['de Verkéiersbulletin', 'le bulletin trafic'], ['gespaart', 'fermé, bloqué'],
        ['d\'Verspéidung', 'le retard'], ['bedeckt', 'couvert'], ['fiicht', 'humide'], ['dréche', 'sec']]
    },

    {
      id: 'r2', kind: 'R', min: 2,
      title: 'Annonce vun der Gemeng',
      fr: 'Annonce municipale',
      intro: "Une annonce de la commune, diffusée à la radio locale.",
      lines: [
        ['N', "Eng Informatioun vun der Gemeng. De Samschdeg, den zwielefte Mee, fënnt am Zentrum d'Nopeschfest statt. D'Fest fänkt um eelef Auer un an dauert bis owes um zéng."],
        ['N', "D'Gemeng invitéiert all d'Awunner. Fir d'Iessen an d'Gedrénks ass gesuergt: et gëtt Grillwurscht, Zalot a Kuchen. D'Awunner kënne gär selwer e Kuch matbréngen — mee dat ass keng Flicht."],
        ['N', "Fir d'Kanner gëtt et e Spillplaz mat engem Clown an um dräi Auer e klenge Concert vun der Museksschoul."],
        ['N', "Opgepasst: d'Grand-Rue ass vun néng Auer moies bis eelef Auer owes fir den Autoverkéier gespaart. Benotzt w.e.g. de Parking bei der Schoul, en ass gratis. Mir empfeelen awer, mam Bus ze kommen: d'Linn zwielef fiert all zwanzeg Minutten."],
        ['N', "Bei schlechtem Wieder gëtt d'Fest an d'Sportshal verluegt. Weider Informatioune fannt Dir op der Internetsäit vun der Gemeng."]
      ],
      q: [
        { q: "Wéini fänkt d'Nopeschfest un?", o: ["Um néng Auer", "Um eelef Auer", "Um dräi Auer", "Um zéng Auer owes"], a: 1,
          why: "« D'Fest fänkt um eelef Auer un. » Neuf heures, c'est la fermeture de la rue ; vingt-deux heures, la fin." },
        { q: "Wat gëtt vun den Awunner erwaart?", o: ["Si mussen e Kuch matbréngen", "Si kënne gär e Kuch matbréngen, mussen awer net", "Si mussen d'Iessen bezuelen", "Si mussen sech ureschreiwen"], a: 1,
          why: "« D'Awunner kënne gär selwer e Kuch matbréngen — mee dat ass keng Flicht. » Distinguer *kënnen* de *mussen* est un point B1 récurrent." },
        { q: "Wat gëtt fir d'Kanner ugebueden?", o: ["E Fussballturnéier", "E Spillplaz mat engem Clown an e Concert", "E Kachcours", "Näischt"], a: 1,
          why: "« Fir d'Kanner gëtt et e Spillplaz mat engem Clown an um dräi Auer e klenge Concert. »" },
        { q: "Wat empfeelt d'Gemeng?", o: ["Mam Auto ze kommen", "Mam Bus ze kommen", "Ze Fouss ze kommen", "Um Parking bei der Kierch ze parken"], a: 1,
          why: "Le parking est mentionné et gratuit — mais « Mir empfeelen awer, mam Bus ze kommen. » Le *awer* signale le vrai conseil." },
        { q: "Wat geschitt bei schlechtem Wieder?", o: ["D'Fest gëtt ofgesot", "D'Fest gëtt op e spéideren Datum verluegt", "D'Fest gëtt an d'Sportshal verluegt", "D'Fest fänkt méi spéit un"], a: 2,
          why: "« Bei schlechtem Wieder gëtt d'Fest an d'Sportshal verluegt. » — déplacée, pas annulée." }
      ],
      words: [['d\'Nopeschfest', 'la fête des voisins'], ['keng Flicht', 'pas une obligation'],
        ['gespaart', 'fermé à la circulation'], ['empfeelen', 'recommander'], ['verluegt', 'déplacé']]
    },

    {
      id: 'r3', kind: 'R', min: 2,
      title: 'Noriichten a Servicer',
      fr: 'Informations et services',
      intro: "Un court journal : travaux, horaires, et une info sur les transports.",
      lines: [
        ['N', "Hei sinn d'Noriichten vun eelef Auer."],
        ['N', "D'Aarbechten op der Gare ginn haut weider. D'Halschent vun de Quaien ass zou. D'CFL rechent domat, datt d'Aarbechte bis Enn Juni daueren. Reesender solle sech virun der Ofrees op der App informéieren."],
        ['N', "D'Post huet ugekënnegt, datt d'Filialen an de klenge Gemengen ab September nëmme méi dräimol d'Woch opmaachen: méindes, mëttwochs a freides, vun néng bis zwielef Auer. D'Post seet, datt ëmmer manner Leit un de Schalter kommen, well vill Servicer elo online ginn."],
        ['N', "An eppes Positives fir d'Pendler: den ëffentlechen Transport bleift och d'nächst Joer gratis. D'Ministesch huet erkläert, datt d'Zuel vun de Passagéier zanter der Aféierung ëm ronn zwanzeg Prozent geklommen ass."],
        ['N', "D'Wieder: haut Reen, muer méi dréchen. Weider Informatiounen op der Stonn."]
      ],
      q: [
        { q: "Wéi laang daueren d'Aarbechten op der Gare?", o: ["Bis Enn Mee", "Bis Enn Juni", "Bis September", "Bis d'nächst Joer"], a: 1,
          why: "« D'CFL rechent domat, datt d'Aarbechte bis Enn Juni daueren. » Septembre concerne la poste." },
        { q: "Wéi oft maachen d'Postfilialen ab September op?", o: ["All Dag", "Fënnefmol d'Woch", "Dräimol d'Woch", "Eemol d'Woch"], a: 2,
          why: "« nëmme méi dräimol d'Woch … méindes, mëttwochs a freides »." },
        { q: "Firwat maacht d'Post d'Filialen manner op?", o: ["Well se kee Personal fënnt", "Well ëmmer manner Leit un de Schalter kommen", "Well d'Gebaier renovéiert ginn", "Well d'Gemenge se zoumaachen"], a: 1,
          why: "« well ëmmer manner Leit un de Schalter kommen, well vill Servicer elo online ginn »." },
        { q: "Wat gëtt et Positives fir d'Pendler?", o: ["Nei Zich", "Den ëffentlechen Transport bleift gratis", "Méi Parkplazen", "Manner Verspéidungen"], a: 1,
          why: "« den ëffentlechen Transport bleift och d'nächst Joer gratis »." },
        { q: "Ëm wéi vill Prozent ass d'Zuel vun de Passagéier geklommen?", o: ["Ëm zéng Prozent", "Ëm zwanzeg Prozent", "Ëm drësseg Prozent", "Ëm fofzeg Prozent"], a: 1,
          why: "« ëm ronn zwanzeg Prozent geklommen ». Le mot *ronn* (environ) n'change pas le chiffre à retenir." }
      ],
      words: [['d\'Aarbechten', 'les travaux'], ['de Reesender', 'le voyageur'], ['d\'Ofrees', 'le départ'],
        ['ugekënnegt', 'annoncé'], ['de Schalter', 'le guichet'], ['geklommen', 'augmenté']]
    },

    /* ══════════════════ 2. CONVERSATIONS DU QUOTIDIEN ═══════════════════════ */
    {
      id: 'g1', kind: 'G', min: 3,
      title: 'Beim Dokter',
      fr: 'Chez le médecin',
      intro: "Une patiente décrit ses symptômes. Le médecin l'interroge et conclut.",
      speakers: ['D\'Patientin', 'Den Dokter'],
      lines: [
        [1, "Gudde Mëtteg. Setzt Iech, wann ech gelift. Wat feelt Iech dann?"],
        [0, "Gudde Mëtteg, Här Dokter. Ech hunn zanter dräi Deeg Kappwéi a ganz staark Middegkeet. Owes hunn ech och e bësse Féiwer."],
        [1, "Hutt Dir och Halswéi oder Houscht?"],
        [0, "Halswéi jo, mee kee Houscht. An ech schmaachen näischt méi."],
        [1, "Wéi vill Grad hutt Dir gemooss?"],
        [0, "Gëschter Owend uechtdrësseg zwee. Haut moies just siwendrësseg fënnef."],
        [1, "Schafft Dir am Moment?"],
        [0, "Jo, ech schaffen an engem Büro, mee ech kann d'Aarbecht net méi maachen. Ech si komplett futti."],
        [1, "Gutt. Dat gesäit no engem Virus aus, näischt Schlëmmes. Ech ginn Iech eppes géint d'Féiwer. Wichteg ass: vill drénken, vill schlofen, an dräi Deeg doheem bleiwen."],
        [0, "Brauch ech en Antibiotikum?"],
        [1, "Nee, bei engem Virus hëlleft dat näischt. Wann d'Féiwer awer no dräi Deeg nach do ass, da kommt Dir zréck. Ech schreiwen Iech e Certificat fir bis Freideg."],
        [0, "Merci villmools. Bis Freideg also."]
      ],
      q: [
        { q: "Zanter wéini huet d'Patientin Kappwéi?", o: ["Zanter gëschter", "Zanter dräi Deeg", "Zanter enger Woch", "Zanter dräi Wochen"], a: 1,
          why: "« Ech hunn zanter dräi Deeg Kappwéi. » — *zanter* + durée, toujours au présent." },
        { q: "Wat huet si net?", o: ["Halswéi", "Féiwer", "Houscht", "Middegkeet"], a: 2,
          why: "« Halswéi jo, mee kee Houscht. » La question négative est fréquente : repérez le *kee/keng*." },
        { q: "Wéi vill Grad hat si gëschter Owend?", o: ["Siwendrësseg fënnef", "Uechtdrësseg zwee", "Néngendrësseg", "Sechsandrësseg aacht"], a: 1,
          why: "38,2 hier soir ; 37,5 ce matin. Deux chiffres, deux moments — l'erreur classique." },
        { q: "Wat verschreift den Dokter?", o: ["En Antibiotikum", "Eppes géint d'Féiwer a Rou", "Eng Kur am Spidol", "Näischt"], a: 1,
          why: "« Ech ginn Iech eppes géint d'Féiwer … vill drénken, vill schlofen. » L'antibiotique est explicitement exclu." },
        { q: "Wat soll si maachen, wann d'Féiwer bleift?", o: ["An d'Apdikt goen", "Zréck bei den Dokter kommen", "Weiderschaffen", "D'Urgence uruffen"], a: 1,
          why: "« Wann d'Féiwer awer no dräi Deeg nach do ass, da kommt Dir zréck. » — *wann…, da…* introduit la consigne conditionnelle." }
      ],
      words: [['d\'Kappwéi', 'le mal de tête'], ['d\'Middegkeet', 'la fatigue'], ['d\'Féiwer', 'la fièvre'],
        ['den Houscht', 'la toux'], ['futti', 'épuisé, cassé'], ['verschreiwen', 'prescrire'],
        ['de Certificat', 'le certificat d\'arrêt']]
    },

    {
      id: 'g2', kind: 'G', min: 3,
      title: 'Eng Wunneng besichtegen',
      fr: 'Visiter un appartement',
      intro: "Au téléphone : un candidat locataire et l'agence.",
      speakers: ['De Client', 'D\'Agence'],
      lines: [
        [1, "Agence Wunnen, gudde Mëtteg."],
        [0, "Gudde Mëtteg. Ech ruffen un wéinst der Wunneng zu Beetebuerg, déi op Ärer Internetsäit steet."],
        [1, "Déi mat dräi Zëmmeren? Jo, déi ass nach fräi."],
        [0, "Wéi grouss ass se genau?"],
        [1, "Fënnefasiechzeg Quadratmeter, am zweete Stack, mat engem klenge Balkon. Et gëtt keen Lift, dat muss ech Iech soen."],
        [0, "Dat ass net schlëmm. A wat kascht se?"],
        [1, "Dausendhonnert Euro de Mount, plus honnertfofzeg Euro Charges. De Parking kascht extra siechzeg Euro."],
        [0, "Ass eng Kichen dran?"],
        [1, "Jo, d'Kichen ass ageriicht. D'Wunneng ass soss net méibléiert."],
        [0, "A sinn Hausdéiere erlaabt?"],
        [1, "Eng Kaz jo, en Hond leider net. Wëllt Dir se kucke kommen?"],
        [0, "Gär. Wier den Donneschdeg nomëttes méiglech?"],
        [1, "Den Donneschdeg ass leider voll. Ech kéint Iech de Freideg um véier Auer ubidden."],
        [0, "De Freideg um véier passt mir gutt. Merci!"]
      ],
      q: [
        { q: "Wou ass d'Wunneng?", o: ["An der Stad", "Zu Beetebuerg", "Zu Ettelbréck", "Zu Esch"], a: 1,
          why: "« wéinst der Wunneng zu Beetebuerg »." },
        { q: "Wat gëtt et an dësem Haus net?", o: ["E Balkon", "E Lift", "Eng Kichen", "E Parking"], a: 1,
          why: "« Et gëtt keen Lift, dat muss ech Iech soen. » Le balcon, la cuisine et le parking existent tous." },
        { q: "Wéi vill kascht d'Wunneng pro Mount, ouni Parking?", o: ["Dausendhonnert Euro", "Dausendzweehonnertfofzeg Euro", "Dausendhonnertsiechzeg Euro", "Honnertfofzeg Euro"], a: 1,
          why: "1100 de loyer + 150 de charges = 1250. Le parking (60) est « extra ». Les additions sont typiques du B1." },
        { q: "Wat ass mat den Hausdéieren?", o: ["Alles ass erlaabt", "Näischt ass erlaabt", "Eng Kaz jo, en Hond net", "En Hond jo, eng Kaz net"], a: 2,
          why: "« Eng Kaz jo, en Hond leider net. »" },
        { q: "Wéini kann de Client d'Wunneng kucke goen?", o: ["Den Donneschdeg nomëttes", "De Freideg um véier", "De Samschdeg moies", "Haut owes"], a: 1,
          why: "Le client propose jeudi, l'agence répond « Den Donneschdeg ass leider voll » et propose vendredi 16 h, qui est accepté." }
      ],
      words: [['ageriicht', 'équipée'], ['méibléiert', 'meublé'], ['de Stack', 'l\'étage'],
        ['d\'Charges', 'les charges'], ['erlaabt', 'autorisé'], ['ubidden', 'proposer']]
    },

    {
      id: 'g3', kind: 'G', min: 3,
      title: 'Congé plangen',
      fr: 'Organiser ses congés',
      intro: "Deux collègues comparent leurs dates de vacances.",
      speakers: ['D\'Nora', 'De Marc'],
      lines: [
        [0, "Marc, hues du schonn dain Congé fir de Summer geplangt?"],
        [1, "Nach net ganz. Ech wéilt gär déi éischt zwou Wochen am August fräihuelen. An du?"],
        [0, "Dat ass e Problem — ech hat genau déi selwecht Wochen am Kapp. Mir kënnen net alle béid zur selwechter Zäit fort."],
        [1, "Stëmmt. Firwat brauchs du grad déi Wochen?"],
        [0, "Meng Kanner hu Schoulvakanz, an mir hunn e Camping a Frankräich reservéiert. Ech kann dat net méi änneren."],
        [1, "Da gëtt et keng Diskussioun, du hues Prioritéit. Ech ginn dann am Juli, oder vläicht éischter Enn September — do ass et méi roueg an och méi bëlleg."],
        [0, "Bass du sécher? Ech wëll net, datt du dech dono ierger."],
        [1, "Ganz sécher. Ech reesen sowisou léiwer, wann net esou vill Leit ënnerwee sinn. Ech soen dem Chef muer Bescheed."],
        [0, "Merci, Marc. Dat ass wierklech léif vun dir."],
        [1, "Kee Problem. Mee du bréngs mer eppes Guddes vum Camping mat!"]
      ],
      q: [
        { q: "Wéini wéilt de Marc am Ufank fräihuelen?", o: ["Am Juli", "Déi éischt zwou Wochen am August", "Enn September", "Am Juni"], a: 1,
          why: "« Ech wéilt gär déi éischt zwou Wochen am August fräihuelen. » — c'est son souhait de départ, avant qu'il ne change." },
        { q: "Wat ass de Problem?", o: ["De Chef ass net d'accord", "Béid wëllen déi selwecht Wochen", "De Camping ass voll", "De Marc huet kee Congé méi"], a: 1,
          why: "« Mir kënnen net alle béid zur selwechter Zäit fort. »" },
        { q: "Firwat kann d'Nora hir Datumer net änneren?", o: ["Si huet e Camping reservéiert an d'Kanner hu Schoulvakanz", "Si huet den Ticket schonn bezuelt", "De Chef huet et verbueden", "Si ass krank"], a: 0,
          why: "« Meng Kanner hu Schoulvakanz, an mir hunn e Camping a Frankräich reservéiert. »" },
        { q: "Wat entscheet de Marc?", o: ["Hie geet trotzdem am August", "Hie geet am Juli oder Enn September", "Hie mécht kee Congé", "Hie freet de Chef ze entscheeden"], a: 1,
          why: "« Ech ginn dann am Juli, oder vläicht éischter Enn September. »" },
        { q: "Wéi begrënnt de Marc seng Wiel?", o: ["Et ass méi roueg a méi bëlleg", "Säi Frënd fiert och dann", "D'Wieder ass besser", "Hie muss am August schaffen"], a: 0,
          why: "« do ass et méi roueg an och méi bëlleg », plus « wann net esou vill Leit ënnerwee sinn »." }
      ],
      words: [['de Congé', 'les congés'], ['fräihuelen', 'prendre congé'], ['d\'Schoulvakanz', 'les vacances scolaires'],
        ['ënnerwee', 'en route, en déplacement'], ['Bescheed soen', 'prévenir'], ['sech ierger', 's\'agacer']]
    },

    /* ══════════════════ 3. ÉCHANGES ET PRÉSENTATIONS ═══════════════════════ */
    {
      id: 'a1', kind: 'A', min: 4,
      title: 'Eng Erzéierin erzielt',
      fr: 'Une éducatrice raconte son métier',
      intro: "Interview à la radio : une éducatrice parle de son travail dans une maison relais.",
      speakers: ['De Journalist', 'D\'Sylvie'],
      lines: [
        [0, "Sylvie, Dir schafft zanter zéng Joer an enger Maison Relais. Wéi gesäit Ären Dag aus?"],
        [1, "Ech fänken um hallwer siwen un. Am Moie kommen déi éischt Kanner ganz fréi, well hir Eltere schaffe ginn. Mir iesse Moiesiessen zesummen, an duerno bréngen ech se an d'Schoul."],
        [0, "An nomëttes?"],
        [1, "Nomëttes ass déi intensiv Zäit. D'Kanner kommen zréck, mir maachen d'Hausaufgaben, an dono spille mir dobaussen oder molen. Ëm sechs Auer sinn déi lescht Kanner ofgeholl."],
        [0, "Wat ass dat Schéinsten un Ärer Aarbecht?"],
        [1, "Datt ee gesäit, wéi d'Kanner wuessen. E Kand, dat am September kee Wuert Lëtzebuergesch geschwat huet, erzielt am Juni ganz Geschichten. Dat ass eng grouss Freed."],
        [0, "A wat ass schwéier?"],
        [1, "D'Gruppe si grouss, heiansdo fënnefanzwanzeg Kanner. Ee ka sech net ëm all eenzelnt Kand esou këmmeren, wéi ee wéilt. An d'Elteren hunn dacks vill Sträin — si sinn ënner Drock, an dat spiere mir och."],
        [0, "Wat géift Dir engem roden, dee dee Beruff léiere wëll?"],
        [1, "Hie soll virdru mol e Stage maachen. Een muss dat wierklech gär maachen, well et ass keng Aarbecht, déi ee just fir d'Suen mécht."]
      ],
      q: [
        { q: "Wéini fänkt d'Sylvie hir Aarbecht un?", o: ["Um sechs Auer", "Um hallwer siwen", "Um aacht Auer", "Nomëttes"], a: 1,
          why: "« Ech fänken um hallwer siwen un » = 6 h 30. Les heures avec *hallwer* sont un piège : *hallwer siwen* n'est pas sept heures." },
        { q: "Firwat kommen d'Kanner esou fréi?", o: ["Well d'Schoul fréi ufänkt", "Well hir Eltere schaffe ginn", "Well se do schlofen", "Well se dat gär maachen"], a: 1,
          why: "« well hir Eltere schaffe ginn »." },
        { q: "Wat ass fir d'Sylvie dat Schéinsten?", o: ["D'Salaire", "D'Kolleegen", "Ze gesinn, wéi d'Kanner wuessen", "D'Vakanzen"], a: 2,
          why: "« Datt ee gesäit, wéi d'Kanner wuessen », illustré par l'enfant qui ne parlait pas et qui raconte des histoires." },
        { q: "Wat nennt si als Schwieregkeet?", o: ["Déi laang Deeg", "Déi grouss Gruppen an de Stress vun den Elteren", "De schlechte Salaire", "D'Kanner sinn onhéiflech"], a: 1,
          why: "« D'Gruppe si grouss … an d'Elteren hunn dacks vill Sträin — si sinn ënner Drock. »" },
        { q: "Wat rät si engem, dee de Beruff léiere wëll?", o: ["Direkt unzefänken", "Virdrun e Stage ze maachen", "Eppes anescht ze léieren", "Op der Uni ze studéieren"], a: 1,
          why: "« Hie soll virdru mol e Stage maachen », parce que ce n'est pas un métier qu'on fait pour l'argent." }
      ],
      words: [['d\'Erzéierin', 'l\'éducatrice'], ['d\'Hausaufgaben', 'les devoirs'], ['ofgeholl', 'récupéré (par les parents)'],
        ['wuessen', 'grandir'], ['ënner Drock', 'sous pression'], ['roden', 'conseiller'], ['de Stage', 'le stage']]
    },

    {
      id: 'a2', kind: 'A', min: 4,
      title: 'Gratis Bus an Zuch',
      fr: 'Les transports publics gratuits',
      intro: "Une courte présentation, suivie d'une objection et d'une réponse.",
      speakers: ['D\'Presentatrice', 'En Zuhörer'],
      lines: [
        [0, "Zanter 2020 ass den ëffentlechen Transport zu Lëtzebuerg gratis — fir jiddereen, och fir Touristen. Lëtzebuerg war dat éischt Land op der Welt, dat dat gemaach huet."],
        [0, "D'Zil war net nëmmen, Suen ze spueren. D'Zil war virun allem, de Verkéier op de Stroossen ze reduzéieren an d'Loft méi propper ze maachen. All Dag kommen ongeféier zweehonnertdausend Grenzgänger op Lëtzebuerg schaffen, an déi meescht mam Auto."],
        [0, "D'Resultat ass gemëscht. Méi Leit fuere mam Bus an Zuch, dat stëmmt. Mee d'Zuel vun den Autoen ass net wierklech erofgaangen. D'Fachleit soen: gratis alleng duergeet net. Ee brauch och méi Trams, méi Zich a méi Plazen op de Park-and-Ride."],
        [1, "Entschëllegt — wann et gratis ass, wien bezilt et dann?"],
        [0, "Gutt Fro. De Staat bezilt. D'Billjeeën hunn virdru just ronn zéng Prozent vun de Käschte gedeckt. De Rescht koum souwisou aus dem Budget. Dat heescht: den Ënnerscheed ass méi kleng, wéi vill Leit mengen."],
        [1, "An déi Kontrolleuren am Zuch — brauch ee se nach?"],
        [0, "Jo, well d'éischt Klass net gratis ass, an och wéinst der Sécherheet."]
      ],
      q: [
        { q: "Zanter wéini ass den ëffentlechen Transport gratis?", o: ["Zanter 2015", "Zanter 2020", "Zanter 2022", "Hien ass nach net gratis"], a: 1,
          why: "« Zanter 2020 ass den ëffentlechen Transport zu Lëtzebuerg gratis. »" },
        { q: "Wat war dat wichtegst Zil?", o: ["De Leit Suen ze spueren", "De Verkéier ze reduzéieren an d'Loft méi propper ze maachen", "Méi Touristen unzezéien", "D'Autoen ze verbidden"], a: 1,
          why: "« D'Zil war net nëmmen, Suen ze spueren. D'Zil war virun allem … » — le *virun allem* désigne la priorité." },
        { q: "Wéi ass d'Resultat?", o: ["E kloren Erfolleg", "E komplette Mësserfolleg", "Gemëscht: méi Passagéier, mee net manner Autoen", "Et gëtt nach kee Resultat"], a: 2,
          why: "« D'Resultat ass gemëscht. Méi Leit fuere mam Bus an Zuch … Mee d'Zuel vun den Autoen ass net wierklech erofgaangen. »" },
        { q: "Wéi vill Prozent vun de Käschten hunn d'Billjeeën virdru gedeckt?", o: ["Ronn zéng Prozent", "Ronn fofzeg Prozent", "Ronn honnert Prozent", "Guer näischt"], a: 0,
          why: "« D'Billjeeën hunn virdru just ronn zéng Prozent vun de Käschte gedeckt. »" },
        { q: "Firwat gëtt et nach Kontrolleuren?", o: ["Fir d'Billjeeën ze verkafen", "Well déi éischt Klass net gratis ass a wéinst der Sécherheet", "Fir d'Statistiken", "Et gëtt der keng méi"], a: 1,
          why: "Deux raisons données ensemble — les questions B1 demandent souvent de retenir *les deux*." }
      ],
      words: [['den ëffentlechen Transport', 'les transports publics'], ['de Grenzgänger', 'le frontalier'],
        ['erofgaangen', 'baissé'], ['d\'Fachleit', 'les experts'], ['gedeckt', 'couvert'], ['den Ënnerscheed', 'la différence']]
    },

    {
      id: 'a3', kind: 'A', min: 4,
      title: 'Zwou Meenungen iwwer Sport',
      fr: 'Deux avis sur le sport',
      intro: "Deux personnes ne sont pas d'accord sur la façon de faire du sport.",
      speakers: ['De Paul', 'D\'Anne'],
      lines: [
        [0, "Ech si sécher: wann een eppes fir seng Gesondheet maache wëll, muss een an e Fitnessstudio goen. Do huet een d'Material, en Trainer, an ee gëtt motivéiert."],
        [1, "Do sinn ech net d'accord, Paul. E Fitnessstudio kascht am Duerchschnëtt fofzeg Euro de Mount, an déi meescht Leit ginn no dräi Méint net méi hin. Ech kennen dat vu mir selwer."],
        [0, "Jo, mee ouni Struktur mécht een näischt."],
        [1, "Struktur kann een och ouni Studio hunn. Ech ginn all Owend eng hallef Stonn trëppelen, ëmmer déi selwecht Streck, ëmmer déi selwecht Zäit. Dat kascht näischt an ech hunn et zanter zwee Joer duerchgehalen."],
        [0, "Eng hallef Stonn trëppelen ass awer kee richtege Sport."],
        [1, "D'Dokteren soen eppes anescht. Dräimol d'Woch drësseg Minutten Beweegung duergeet, fir d'Häerz gesond ze halen. Et geet net drëm, wien am schnellsten ass. Et geet drëm, datt een net opgëtt."],
        [0, "Do hues du vläicht net Onrecht. Mäi Problem ass, datt ech eleng net motivéiert sinn."],
        [1, "Da komm mat mir trëppelen. Zu zwee gëtt et vill méi einfach."]
      ],
      q: [
        { q: "Wat mengt de Paul am Ufank?", o: ["Datt ee muss trëppele goen", "Datt ee muss an e Fitnessstudio goen", "Datt Sport net wichteg ass", "Datt een en Trainer bezuele muss"], a: 1,
          why: "« wann een eppes fir seng Gesondheet maache wëll, muss een an e Fitnessstudio goen »." },
        { q: "Wat ass d'Anne hiren Haaptargument géint de Studio?", o: ["Et ass ze wäit", "Et kascht vill an déi meescht Leit ginn no dräi Méint net méi hin", "D'Trainer si schlecht", "Si huet keng Zäit"], a: 1,
          why: "« kascht am Duerchschnëtt fofzeg Euro de Mount, an déi meescht Leit ginn no dräi Méint net méi hin »." },
        { q: "Wat mécht d'Anne fir hir Gesondheet?", o: ["Si schwëmmt", "Si geet all Owend eng hallef Stonn trëppelen", "Si fiert Vëlo", "Si mécht Yoga"], a: 1,
          why: "« Ech ginn all Owend eng hallef Stonn trëppelen … zanter zwee Joer. »" },
        { q: "Wat soen d'Dokteren no der Anne?", o: ["Ee muss all Dag Sport maachen", "Dräimol d'Woch drësseg Minutte Beweegung duergeet", "Nëmme Fitness hëlleft", "Trëppelen ass kee Sport"], a: 1,
          why: "« Dräimol d'Woch drësseg Minutten Beweegung duergeet, fir d'Häerz gesond ze halen. »" },
        { q: "Wéi endet d'Diskussioun?", o: ["Si bleiwen onvereenbar", "De Paul gëtt d'Anne recht a si trëppelen zesummen", "D'Anne geet an de Studio", "Si schwätzen iwwer eppes anescht"], a: 1,
          why: "« Do hues du vläicht net Onrecht … » puis « Da komm mat mir trëppelen. » Les questions sur l'issue d'une discussion sont typiques du troisième document." }
      ],
      words: [['am Duerchschnëtt', 'en moyenne'], ['duerchgehalen', 'tenu bon'], ['d\'Beweegung', 'le mouvement, l\'activité'],
        ['duergeet', 'suffit'], ['opginn', 'abandonner'], ['Onrecht hunn', 'avoir tort']]
    }
  ];

  const KIND = {
    R: { t: 'Radiomessage', fr: 'Message radio', ic: 'i-radio' },
    G: { t: 'Gespréich', fr: 'Conversation du quotidien', ic: 'i-speak' },
    A: { t: 'Austausch', fr: 'Échange ou présentation', ic: 'i-froen' }
  };

  /* Ce que l'épreuve demande vraiment, et comment l'aborder. */
  const HOWTO = {
    format: [
      ['35 minutes', 'Trois documents, un questionnaire à cocher par document.'],
      ['Trois genres', 'Un message radio, une conversation du quotidien, un échange ou une présentation.'],
      ['Deux écoutes', 'Chaque document est passé deux fois. La première pour comprendre, la seconde pour vérifier.'],
      ['Niveau B1', "Un cran au-dessus de l'expression orale, qui n'est qu'A2. C'est ici qu'on perd des points."]
    ],
    tips: [
      "Lis les questions **avant** la première écoute. Tu sauras quoi guetter au lieu de tout écouter.",
      "Note les chiffres au vol : heures, prix, durées, pourcentages. Ce sont les questions les plus fréquentes, et les plus faciles à rater.",
      "Un même document donne souvent deux chiffres proches — hier et aujourd'hui, avec et sans charges. La question porte presque toujours sur celui qu'on retient le moins.",
      "Guette les mots qui retournent une phrase : **awer** (mais), **mee** (mais), **leider** (malheureusement), **net** et **kee/keng**. La bonne réponse est souvent juste après.",
      "**kënnen** n'est pas **mussen**. « Vous pouvez apporter un gâteau » n'est pas « vous devez ».",
      "Si tu perds le fil, ne t'accroche pas au mot manquant : reprends à la phrase suivante. La deuxième écoute est là pour ça.",
      "À la deuxième écoute, ne vérifie que les réponses dont tu n'es pas sûr. Relire tout te fera rater la suite."
    ]
  };

  return { DOCS, KIND, HOWTO };
})();
