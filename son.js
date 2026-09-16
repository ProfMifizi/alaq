/* ══════════════════════════════════════════════════════════════════════════════
   LE SON D'ALAQ — une table, une porte.
   Sorti d'index.html et de src/ecrans/index.js le 15/09/2026 (sous-lot 4 de la tâche
   Notion « extraire le lecteur »), sur décision de Myriam : « on fait un truc ultra propre ».

   ── POURQUOI CE FICHIER EXISTE ───────────────────────────────────────────────
   Avant lui, SIX fonctions faisaient sortir un son, et chacune cherchait son fichier
   à sa façon : `speak` lisait la table, `sayLetterName` assemblait un nom, `jouerSyl`
   en assemblait un autre, `jouerMot` escaladait sur deux étages, `sayLetterSound`
   n'en avait qu'un, `jouerF` n'essayait jamais le nom nu. Résultat mesuré le 15/09 :
   151 clés étaient connues DEUX FOIS, par la table ET par une formule, et six
   lettres (ث ج خ ش ظ ف) dont la prise de Myriam existe sur le disque passaient en voix
   de synthèse sur les écrans qui consultaient la table.

   ── LA RÈGLE DU FICHIER, EN UNE PHRASE ───────────────────────────────────────
   ⛔ PLUS AUCUN NOM DE FICHIER NE S'ASSEMBLE AU MOMENT DE JOUER. La table est bâtie
   une fois, au chargement ; ensuite on ne fait plus que la LIRE. Un son introuvable
   est un SILENCE, jamais une voix de machine — et le portillon le voit avant la
   livraison (`outils/verifier-son.mjs` compare la table entière au dossier).

   ── POURQUOI UN SCRIPT CLASSIQUE, ET PAS UN MODULE ───────────────────────────
   Deux raisons, toutes deux MESURÉES, pas supposées :
   ① La table est ÉCRITE au chargement par plusieurs scripts — les mots des unités 1-7 ICI
      même, en fin de fichier (depuis le 16/09), puis par revision.js et le grand script : les mots
      des unités 1-7 (le package), les cinq raccords de l'unité 9, les Noms d'Allah,
      les mots de l'unité 8, et `_adopteNoms` quand Supabase répond. Un module, différé,
      arriverait après ces écritures.
   ② `_sndGen` — le jeton qui tient « un seul son à la fois » — est un NOMBRE réassigné, lu
      par index.html et par le pont de l'unité 8 (qui le résout par accesseur) ; `SND` est lu
      en nom nu depuis src/player, un module. Un module publie
      ses valeurs par COPIE : le nombre serait figé chez les lecteurs. Ce n'est pas une
      hypothèse — c'est exactement ce qui est arrivé le 15/09 au matin à `_tocCtx`, `_LN`
      et `_LNg`, partis dans src/ecrans (module) en 3.14 : `reveilAudio()` ne réveillait
      plus le contexte de `toc`, et le préchargement des noms de lettres était devenu
      inerte. Ces trois-là reviennent ICI, dans le monde classique, où ils appartiennent.
      ⚠️ Une fonction publiée par un module reste partagée (même objet) ; une VALEUR
      réassignée, non. Ne jamais publier depuis un module une valeur que le monde
      classique doit relire.

   Chargé par <script src="son.js"></script> sous generateurs.js et AVANT le grand
   script. Ni `defer`, ni `type="module"`, ni `import`, ni `export` — jamais.

   ── CE QUE CE FICHIER NE FAIT PAS ────────────────────────────────────────────
   Les récitations du Qorān restent dans index.html : 17 voix, dont 10 hébergées chez
   nous et le reste en flux (cdn.islamic.network), des droits et une mise en cache
   différents. L'unité 8 garde sa propre table (src/units/unit-8/donnees/sons.js), qui
   suit déjà la même règle : « résolue CONTRE LE DISQUE, jamais devinée à l'exécution ».
   C'est ce modèle-là, qui protège l'unité 8 depuis août, que ce fichier étend au reste.

   ── CE QUI A DISPARU LE 15/09, ET SUR QUELLE DÉCISION ────────────────────────
   · LA VOIX DE SYNTHÈSE, en entier (Myriam, 15/09 : « silence, et le portillon rougit »).
     `_speakSynth`, `speakFr`, `bestVoice`, `warmVoices`, `expandShadda`, `ttsRom`, `WSAY`,
     `_curUtter` et tous les contournements iOS qui les entouraient. L'app ne prononce
     plus jamais un son qu'elle n'a pas enregistré. Rien ne s'est tu pour autant : les
     460 fichiers du dossier sont là, et le banc les exige désormais un par un.
   · LA DEUXIÈME VOIX (-f / -h), en entier (Myriam, 15/09). Mesuré ce jour-là : ZÉRO
     fichier -h dans tout le dépôt, et les seuls -f encore atteignables étaient les quatre
     félicitations — qui sont donc entrées dans la table sous leur vrai nom. `VOIX_G`,
     `VOIX_HOMME_ACTIVE`, `setVoix` et `MOTS_SANS_IA` ont disparu avec. Une voix d'homme,
     un jour, sera un vrai lot avec de vrais fichiers, pas un drapeau posé sur du vide.
   · LA NARRATION DES CONSIGNES (Myriam, 15/09 : « tout retirer, dépôt compris »). Elle
     ne jouait plus depuis le 13/08 — `spokenInstr()` rend `''` en dur, donc `readInstr`
     n'était plus jamais atteinte — et ses 60 fichiers pesaient 4,6 Mo, dont 2,8 Mo
     téléchargés sur le téléphone de chaque élève à chaque installation. `INSTR_LIST`,
     `INSTR_AUDIO`, `readInstr`, `_normInstr`, `NARR` et `toggleNarr` sont partis avec.
   ══════════════════════════════════════════════════════════════════════════════ */

/* ═══════════════ 1. LE RÉGLAGE ═══════════════════════════════════════════════
   Un seul, celui que l'élève voit dans Paramètres. Il coupe les sons d'AMBIANCE —
   la signature, l'erreur, les carillons — jamais une voix enregistrée ni une
   récitation : couper « Effets sonores » ne doit pas rendre la leçon muette. */
let SND=(function(){try{return localStorage.getItem('alaq_snd')!=='off'}catch(e){return true}})();
function toggleSound(){
  SND=!SND;try{localStorage.setItem('alaq_snd',SND?'on':'off')}catch(e){}
}

/* ═══════════════ 2. LA TRANSLITTÉRATION ══════════════════════════════════════
   Venue de src/ecrans/index.js le 15/09 : c'est du SON (elle ne sert qu'à nommer des
   fichiers), et elle doit être lisible au chargement pour semer la table. */
const LTRANS={'ا':'alif','ب':'ba','ت':'ta','ث':'tha','ج':'jim','ح':'hha','خ':'kha','د':'dal','ذ':'dhal','ر':'ra','ز':'zay','س':'sin','ش':'shin','ص':'sad','ض':'dad','ط':'tta','ظ':'dha','ع':'ayn','غ':'ghayn','ف':'fa','ق':'qaf','ك':'kaf','ل':'lam','م':'mim','ن':'nun','ه':'ha','و':'waw','ي':'ya'};
const HKF={'َ':'fatha','ِ':'kasra','ُ':'damma'};
const MDF={'ا':'alif','ي':'ya','و':'waw'};
/* ⚠️ Les enregistrements de SYLLABES portent l'ANCIEN nommage pour deux lettres :
   LTRANS dit nun/ayn, les fichiers disent noun-/ain- (attrapé par l'audit du 10/08 —
   sans ça le ن de l'unité 1 partait en synthèse). */
const SYLTR={'nun':'noun','ayn':'ain'};
function sylBase(s){
  if(typeof s!=='string')return null;
  if(s==='آ')return 'alif-alif-son-prolonge';   // alif madda = la prolongation du hamza
  if(s.length<2||s.length>3)return null;
  var tr=LTRANS[letterKey(s[0])]; if(!tr)return null;
  tr=SYLTR[tr]||tr;
  if(s.length===2&&HKF[s[1]])return tr+'-'+HKF[s[1]]+'-son-court';
  if(s.length===3&&MDF[s[2]]&&s[1]===MDH[s[2]])return tr+'-'+MDF[s[2]]+'-son-prolonge';
  return null;
}

/* ═══════════════ 3. LA TABLE ═════════════════════════════════════════════════
   Clé = ce que l'app demande. Valeur = le nom NU du fichier, sans dossier ni `.mp3` :
   la porte les ajoute, à un seul endroit. Le préfixe du nom porte la FAMILLE du son,
   et les 460 fichiers du dossier respectent cette discipline sans exception.

   ⚠️ LA CLÉ D'UNE LETTRE EST AMBIGUË, ET C'EST RÉSOLU ICI : « م » demande le NOM de la
   lettre, « son:م » demande son SON. Deux clés, une table ; l'app n'a jamais à choisir
   entre deux fonctions selon ce qu'elle veut entendre. */
const SONS={};

/* ⚠️ UN SILENCE VOULU N'EST PAS UN TROU. Un alif NU n'a pas de son : il PORTE la voyelle
   (Myriam, 17/08 : « alif fait un son bizarre. Silence cet audio car alif n'a pas de son »).
   Elle a raison sur le fond — le alif nu ne porte aucune valeur sonore, c'est un support de
   voyelle et de hamza ; lui faire dire quelque chose enseignerait une fausseté à une
   primo-lectrice. Il se tait donc, et son NOM (الِفْ) reste disponible, lui.
   Une clé citée ici n'entre JAMAIS dans la table : elle n'a pas de fichier, et c'est voulu.
   Le banc lit cette table pour ne pas compter ce silence comme un enregistrement manquant. */
const SANS_SON={'son:ا':'Myriam 17/08 — un alif nu n\'a pas de son, il porte la voyelle'};

/* ── ① CE QUI SE DÉDUIT : trois règles, déroulées une fois au chargement ──────
   Mesuré le 15/09 avant de les écrire, en comparant chaque règle à la table de
   l'époque : 128 syllabes et 23 noms de lettres produits, ZÉRO divergence. Ces
   151 lignes n'ont donc jamais eu besoin d'être écrites. Et une règle n'a pas de
   trou, là où une liste en a toujours un (ta règle du 17/08, Myriam). */
function semerLesSons(){
  /* ⚠️ LES SYLLABES SONT BORNÉES AUX LETTRES ENSEIGNÉES, et c'est mesuré : les 28 lettres
     ont toutes leur NOM et leur SON enregistrés, mais seules les 21 lettres des unités 1
     à 7 ont leurs 6 syllabes (126 prises, zéro manquante). Semer les 7 autres poserait
     42 clés vers des fichiers qui n'existent pas, et le banc aurait raison de rougir.
     La borne se LIT dans UNITS : le jour où une unité enseigne ث, ses syllabes entrent
     ici toutes seules, sans que personne ait à y penser. */
  const enseignees=new Set();
  try{ UNITS.forEach(function(u){ (u.letters||[]).forEach(function(L){ enseignees.add(letterKey(L)); }); }); }catch(e){}
  for(const L in LTRANS){
    const tr=LTRANS[L], trSyl=SYLTR[tr]||tr;
    SONS[L]='lettre-'+tr+'-nom';                                   // le NOM de la lettre
    if(!SANS_SON['son:'+L])SONS['son:'+L]='lettre-'+tr+'-son';     // son SON, sauf silence voulu
    if(!enseignees.has(L))continue;
    for(const h in HKF)SONS[L+h]=trSyl+'-'+HKF[h]+'-son-court';
    for(const m in MDF)SONS[L+MDH[m]+m]=trSyl+'-'+MDF[m]+'-son-prolonge';
  }
  /* ⚠️ LA FAMILLE DU ALIF, ET C'EST UN PIÈGE VÉRIFIÉ CONTRE L'ANCIENNE TABLE : ا أ إ آ ٱ
     sont CINQ caractères distincts pour le navigateur, et l'ancienne carte portait bien
     « أ » comme « ا », « أَ » comme « اَ », « إِي » comme « اِي »… neuf clés, dont des
     syllabes. On les DÉRIVE : chaque clé semée pour ا est recopiée pour chaque variante,
     plutôt que d'en écrire la liste — qui aurait un trou, comme toujours.
     ⚠️ ALIF_FAM est une CHAÎNE ('اأإآٱ'), pas un tableau : un `.forEach` dessus lève, et un
     try/catch l'aurait avalé en silence — c'est arrivé pendant ce lot même, et seul le
     contrôle de non-régression l'a vu. Pas de try/catch ici : si la famille ne se dérive
     pas, la page doit le crier, pas se taire. */
  const deAlif=Object.keys(SONS).filter(function(k){ return k.indexOf('ا')===0; });
  for(const v of ALIF_FAM){
    if(v==='ا')continue;
    deAlif.forEach(function(k){ SONS[v+k.slice(1)]=SONS[k]; });
  }
  /* 🔴 آ N'EST PAS UN ALIF COMME LES AUTRES, ET LA DÉRIVATION L'AVAIT ÉCRASÉ. Le alif madda
     est la PROLONGATION du hamza — il se dit « ââ », pas « alif ». La boucle ci-dessus lui
     avait posé le NOM de la lettre. Mesuré sur l'écran des prolongations de l'unité 2 : la
     seule option portant le hamza prolongé faisait entendre « alif », une fausseté enseignée
     là où c'est tout l'objet de l'écran — et la prise de Myriam (21/06), pourtant présente et
     pré-cachée, redevenait inatteignable. C'est une deuxième forme de l'incident du 08/09.
     Le cas spécial se pose APRÈS la dérivation, et le banc vérifie désormais qu'AUCUNE clé de
     la table ne contredit `sylBase` : c'est le garde générique qui aurait attrapé celui-ci. */
  SONS['آ']='alif-alif-son-prolonge';
}

/* ── ② CE QUI NE SE DEVINE PAS : une ligne par son ───────────────────────────
   Un mot arabe ne dit pas le nom de son fichier : مَكْتَبٌ → mot-maktab ne s'invente
   pas. Ces 99 lignes sont donc écrites.
   ⚠️ 76 D'ENTRE ELLES SONT AUSSI DANS `src/content/units/unit-0N.json`, où Myriam écrit le
   mot et son son. C'est voulu, et c'est le JSON qui TRANCHE : le grand script verse ces 76
   mots par `inscrireLeSon` APRÈS ce littéral, donc il écrase ce qui diverge — deux mots le
   font (الرَّحْمَٰنُ et الرَّحِيمُ, que le JSON pointe vers la prise des NOMS D'ALLAH, celle que
   les élèves entendent). Elles restent ici pour que la table soit complète AVANT que le grand
   script tourne : le studio, les bancs et le pré-cache la lisent à cet instant-là. */
const SONS_ECRITS={
  'أَمْ':'am-soukoun',
  'أَنْ':'an-soukoun',
  'أَلْ':'al-soukoun',
  'أَمَّ':'am-chedda',
  'أَنَّ':'an-chedda',
  'أَلَّ':'al-chedda',
  'أَمٌ':'am-tanwin',
  'أَنٌ':'an-tanwin',
  'أَلٌ':'al-tanwin',
  'نَمْلٌ':'mot-naml',
  'مَنٌّ':'mot-mann',
  'مَنَالٌ':'mot-manal',
  'مَالٌ':'mot-mal',
  'مَنَامٌ':'mot-manam',
  'نِيلٌ':'mot-nil',
  'نُونٌ':'mot-noun',
  'لِينٌ':'mot-lin',
  'لَمَّا':'mot-lamma',
  'يَوْمٌ':'mot-yawm',
  'لَيْلٌ':'mot-layl',
  'لَوْنٌ':'mot-lawn',
  'لَوْمٌ':'mot-lawm',
  'أَلِيمٌ':'mot-alim',
  'إِيمَانٌ':'mot-iman',
  'أُمٌّ':'mot-umm',
  'أَمِينٌ':'mot-amin',
  'يَمِينٌ':'mot-yamin',
  'أَمَانٌ':'mot-aman',
  'إِمَامٌ':'mot-imam',
  'إِلَيْنَا':'mot-ilayna',
  'مَمْنُونٌ':'mot-mamnoun',
  'ء':'lettre-hamza-nom',
  'رَبٌّ':'mot-rabb',
  'عَرَبِيٌّ':'mot-arabi',
  'عَيْنٌ':'mot-ayn',
  'لَبَنٌ':'mot-laban',
  'بَابٌ':'mot-bab',
  'نَبِيٌّ':'mot-nabi',
  'عَمَلٌ':'mot-amal',
  'عَالَمٌ':'mot-alam',
  'عَالَمُونَ':'mot-alamoun',
  'عَالِمٌ':'mot-aalim',
  'عُلَمَاءُ':'mot-oulama',
  'أَمْرٌ':'mot-amr',
  'رَبِيعٌ':'mot-rabi',
  'عُمْرٌ':'mot-umr',
  'a':'voyelle-a',
  'i':'voyelle-i',
  'ou':'voyelle-ou',
  'مَدْرَسَةٌ':'mot-madrasatoun',
  'دَرْسٌ':'mot-dars',
  'كَرِيمٌ':'mot-karim',
  'دِينٌ':'mot-din',
  'إِيَّاكَ':'mot-iyyaka',
  'نَعْبُدُ':'mot-naabudu',
  'النَّاسُ':'mot-annas',
  'مَالِكٌ':'mot-maalik',
  'مَلِكٌ':'mot-malik',
  'كَسَبَ':'mot-kasaba',
  'بِسْمِ':'mot-bismi',
  'الْحَمْدُ':'mot-alhamdu',
  'الرَّحْمَٰنُ':'mot-arrahman',
  'الرَّحِيمُ':'mot-arrahim',
  'قُلْ':'mot-qul',
  'أَحَدٌ':'mot-ahad',
  'حَاسِدٌ':'mot-hasid',
  'عُقَدٌ':'mot-uqad',
  'وَقَبَ':'mot-waqaba',
  'طَرِيقٌ':'mot-tariq',
  'حَطَبٌ':'mot-hatab',
  'صِرَاطٌ':'mot-sirat',
  'مُسْتَقِيمٌ':'mot-mustaqim',
  'نَسْتَعِينُ':'mot-nastain',
  'أَنْعَمْتَ':'mot-anamta',
  'غَيْر':'mot-ghayr',
  'الصَّمَدُ':'mot-assamad',
  'صُدُورٌ':'mot-sudur',
  'غَاسِقٌ':'mot-ghasiq',
  'صَبْرٌ':'mot-sabr',
  'غَيْبٌ':'mot-ghayb',
  'تَبَّ':'mot-tabba',
  'اللَّهُ':'mot-allah',
  'اهْدِنَا':'mot-ihdina',
  'الَّذِينَ':'mot-alladhina',
  'عَلَيْهِمْ':'mot-alayhim',
  'الْمَغْضُوبُ':'mot-almaghdoubou',
  'الضَّالُّونَ':'mot-addalloun',
  'هُوَ':'mot-huwa',
  'أَعُوذُ':'mot-audhu',
  'إِلَٰهٌ':'mot-ilah',
  'إِذَا':'mot-idha',
  'ذَهَبَ':'mot-dhahaba',
  'عَلَى':'mot-ala',
  'مَكْتَبٌ':'mot-maktab',
  'بِنْتٌ':'mot-bint',
  'وَلَدٌ':'mot-walad',
  'نَبَاتٌ':'mot-nabat',
  'الْمَاءُ':'mot-almaa',
  'التُّرَابُ':'mot-atturab',
};

/* ── ③ LES SONS DE L'APP, qui ne sont ni des mots ni des lettres ─────────────
   Ils étaient assemblés à la volée avant le 15/09 ; ils sont dans la table comme
   tout le reste. Les quatre félicitations gardent leur suffixe `-f` : c'est leur
   vrai nom de fichier, et ce sont les seules prises de voix générée que l'app
   demande encore. Le jour où Myriam les réenregistre, la ligne change ici, et
   nulle part ailleurs. */
/* ── ④ LES GRAPHIES QUE LES ÉCRANS COMPOSENT À LA VOLÉE ──────────────────────
   🔴 CES CINQ CLÉS MANQUAIENT, ET DEUX REVUES ONT DÛ LES TROUVER. Elles ne s'écrivent nulle
   part dans les données : un écran les COMPOSE au moment de sonner, et sa composition ne
   tombe pas sur la même suite de caractères que la table.
   · أَمَّ / أَنَّ / أَلَّ — les trois écrans « chedda » de l'unité 1. La table les écrit
     fatha PUIS chedda ; le générateur assemble chedda PUIS fatha. Deux suites de caractères
     différentes pour le même mot à l'œil. Le désaccord est ANCIEN, mais sa conséquence a
     changé le 15/09 : avant, une voix de machine comblait le trou ; depuis, le silence.
   · ؤُ / ئِ — les deux sièges de la hamza (`hamzaTap`) : « la hamza seule dit son nom, les
     sièges disent la voyelle qu'ils permettent ». Ces deux prises de Myriam existent, sous
     le nom de leur syllabe — elles n'étaient simplement jamais demandées.
   ⚠️ Le garde qui les attrape désormais JOUE les 63 leçons et confronte chaque clé demandée
   à la table (`outils/verifier-son.mjs`, essai ⑬). Comparer la table au disque ne suffit
   pas : il faut confronter l'ÉCRAN à la table. */
const SONS_COMPOSES={
  '\u0623\u064E\u0645\u0651\u064E':'am-chedda',   // أَمَّ, chedda avant fatha
  '\u0623\u064E\u0646\u0651\u064E':'an-chedda',   // أَنَّ
  '\u0623\u064E\u0644\u0651\u064E':'al-chedda',   // أَلَّ
  '\u0624\u064F':'waw-damma-son-court',              // ؤُ — le siège waw dit « ou »
  '\u0626\u0650':'ya-kasra-son-court',               // ئِ — le siège ya dit « i »
};

const SONS_APP={
  'sfx:bonne-reponse':'sfx-bonne-reponse',
  'sfx:erreur':'sfx-erreur',
  'sfx:fin-lecon':'sfx-fin-lecon',
  'felicit:moumtaz':'felicit-moumtaz-f',
  'felicit:sahih':'felicit-sahih-f',
  'felicit:rai':'felicit-rai-f',
  'felicit:allahumma-barik':'felicit-allahumma-barik-f',
};

semerLesSons();
Object.assign(SONS,SONS_ECRITS,SONS_COMPOSES,SONS_APP);

/* Le grand script verse ici ce qui vient des DONNÉES : les mots des unités 1-7 (leur
   champ `snd`), les Noms d'Allah (le code d'abord, Supabase ensuite), les mots des
   unités 8 à 10. Une seule porte d'entrée, pour que rien n'écrive dans SONS à la main. */
function inscrireLeSon(cle,nom){
  if(!cle||!nom)return;
  SONS[cle]=String(nom).replace(/^audios-app-alaq\//,'').replace(/\.mp3$/,'');
}

/* ── LES FAMILLES ────────────────────────────────────────────────────────────
   Aujourd'hui elles ne servent qu'au BANC, qui vérifie que chaque son de la table
   tombe dans une famille connue et que son fichier existe. Elles ne pilotent plus
   aucun repli : depuis le 15/09 il n'y en a qu'un, le silence, pour tout le monde. */
const FAMILLES=['lettre','mot','nom','voyelle','sfx','felicit','am','an','al','faux'];
function familleDe(nom){
  const s=String(nom||'');
  if(/-son-(court|prolonge)$/.test(s))return 'syllabe';
  const p=s.split('-')[0];
  return FAMILLES.indexOf(p)>=0?p:null;
}
/* « Ce son existe-t-il ? » — la question que tout écran doit pouvoir poser AVANT d'offrir un
   bouton. Depuis que l'app se tait au lieu d'appeler une voix de machine, un haut-parleur
   affiché sur un son absent ne joue plus rien : l'élève lit ça comme une panne. Un écran qui
   n'est pas sûr de son son demande ici, et n'offre le bouton que si la réponse est oui. */
function aLeSon(cle){ return typeof cle==='string' && !!SONS[cle]; }
/* « Cette lettre a-t-elle un son à faire entendre ? » — la grille des 28 du Cours s'en
   sert pour n'offrir le bouton que là où il sonnera. */
function aUnSon(L){ const k='son:'+letterKey(L); return !!SONS[k] && !SANS_SON[k]; }

/* ═══════════════ 4. L'ÉTAT ═══════════════════════════════════════════════════
   `_sndGen` est le jeton de génération : tout repli et toute minuterie d'un ancien son
   sont annulés dès qu'un nouveau son démarre. Il est lu par index.html, src/ecrans,
   src/player et le pont de l'unité 8 — d'où la note de l'en-tête : il doit rester ici,
   dans un script classique, pour que tout le monde lise LE MÊME nombre. */
let _curAudio=null,_sndGen=0;
function stopAudio(){ // un seul son à la fois : coupe le fichier ET le tampon WebAudio, et invalide les replis en attente
  _sndGen++;
  try{ if(typeof suivreArret==='function')suivreArret(); }catch(e){}   // et l'illumination du verset s'éteint avec lui
  try{ if(_curSrc){ _curSrc.stop(); _curSrc=null; } }catch(e){}
  try{ if(_curAudio){ _curAudio.pause(); _curAudio=null; } }catch(e){}
}
function quandSonFini(cb){ // rappelle cb à la fin du son EN COURS (filet 2,5 s : silence)
  const gen=_sndGen;let done=false;
  const go=()=>{if(done||gen!==_sndGen)return;done=true;cb();};
  setTimeout(()=>{
    const a=_curAudio;
    if(a&&!a.paused&&!a.ended)a.addEventListener('ended',go,{once:true});
    setTimeout(go,2500);
  },150);
}

/* ═══════════════ 5. LE POOL BÉNI (iOS) ═══════════════════════════════════════
   Copié à l'identique d'index.html le 15/09 — ses commentaires datés racontent quatre
   bugs vécus, ils restent tels quels. */
const _POOL=[];let _poolI=0;
/* ⚠️ Le 1er silence (v2b) était un base64 bricolé, INVALIDE : play() échouait, la
   bénédiction ratait EN SILENCE et iOS continuait de bloquer la signature (vécu par
   Myriam le soir même). Celui-ci est fabriqué octet par octet — 20 ms, 8 kHz. Et on
   ne se déclare béni qu'après un play() RÉUSSI : sinon on réessaie au geste suivant. */
const _SIL='data:audio/wav;base64,UklGRmQBAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
function benirAudio(){
  if(_POOL.length)return;
  const cand=[];for(let i=0;i<4;i++)cand.push(new Audio(_SIL));
  const fini=()=>{
    if(_POOL.length)return;
    cand.forEach(a=>{try{a.pause();}catch(e){}_POOL.push(a);});
    ['touchend','pointerup','mousedown','click'].forEach(ev=>document.removeEventListener(ev,benirAudio,true));
  };
  const p=cand[0].play();
  cand.slice(1).forEach(a=>{const q=a.play();if(q&&q.catch)q.catch(()=>{});});
  if(p&&p.then)p.then(fini).catch(()=>{});else fini();
}
try{
  ['touchend','pointerup','mousedown','click'].forEach(ev=>document.addEventListener(ev,benirAudio,true));
}catch(e){}
/* 🔴 UN SEUL LECTEUR DE SECOURS, PAS UN NOUVEAU À CHAQUE FOIS (Myriam, 16/08 : « au
   début j'ai eu les audios… puis ça s'est arrêté en cours de route » — un exercice
   qui enchaîne 14 sons, exactement le nombre qui use la patience d'un tas d'<audio>
   jamais libérés). Tant que le pool n'est pas béni, `new Audio(url)` en créait un
   NEUF à chaque appel, sans jamais le détruire ni le réutiliser — une fuite muette
   qui grossit à chaque son et peut finir par faire refuser les suivants. _SECOURS
   suit exactement le geste des éléments du pool : on le met en pause, on efface ses
   anciens écouteurs, on pose la nouvelle source — un seul élément, pour toujours. */
let _secours=null;
function audioBeni(url){ // un lecteur du pool si béni, le même lecteur de secours sinon (bureau)
  if(!_POOL.length){
    if(!_secours)_secours=new Audio();
    try{_secours.pause();}catch(e){}
    _secours.onended=null;_secours.onerror=null;_secours.muted=false;_secours.src=url;
    return _secours;
  }
  /* 🔴 UN DEUXIÈME SON FAIT TAIRE LE PREMIER (Myriam, 28/08 : « quand je fais glisser
     l'objet sur la maman avant que l'audio ne soit terminé, les deux audios se jouent
     en même temps »). LA CAUSE EST ICI, pas dans l'exercice : le pool sert QUATRE
     lecteurs à tour de rôle, et on ne mettait en pause que celui qu'on rendait — le
     précédent, un autre élément du pool, continuait tranquillement de sonner. Un
     exercice qui énonce sa phrase puis la répète à la réussite en superposait donc
     jusqu'à quatre. On fait taire TOUT le pool (et le lecteur de secours) avant de
     servir : la règle vaut pour tous les appelants, pas seulement pour le registre.
     ⚠️ Le sfx récompense/erreur ne passe PAS par ici quand son tampon est décodé
     (branche WebAudio de playSfx) — la superposition VOULUE du 17/08, « le mot finit
     de sonner sous le ding », reste donc intacte. */
  _POOL.forEach(function(p){try{p.pause();}catch(e){}});
  try{if(_secours)_secours.pause();}catch(e){}
  const a=_POOL[_poolI++%_POOL.length];
  a.onended=null;a.onerror=null;a.muted=false;a.src=url;
  return a;
}

/* ═══════════════ 6. LA PORTE ═════════════════════════════════════════════════
   UNE seule fonction fait sortir une voix enregistrée. Tout le reste de ce chapitre
   n'est que du vocabulaire : des raccourcis d'une ligne, pour que les milliers
   d'appels existants gardent le nom qui dit ce qu'ils veulent entendre. */
const DOSSIER='audios-app-alaq/';
function urlDuSon(nom){ return DOSSIER+nom+'.mp3'; }

/* `cle` : ce que l'app demande (un mot, une lettre, « son:ل », « sfx:erreur »…).
   `o.el` : le haut-parleur dont les ondes bougent pendant que le son joue.
   `o.fin` : rappelé quand CE son est fini — TOUJOURS appelé, même sur un silence.
   ⚠️ RÈGLE (gravée le 09/08) : « allumer le bouton après le son » passe TOUJOURS par
   `o.fin`, JAMAIS par quandSonFini() armé AVANT l'appel — celui-ci capture le jeton du
   moment, que stopAudio() incrémente aussitôt : il se croit périmé et n'allume rien. */
function jouer(cle,o){
  o=o||{};
  const nom=(typeof cle==='string'&&SONS[cle])||null;
  return jouerFichier(nom,o);
}
/* Joue un fichier NOMMÉ, sans passer par la table. Réservé aux rares sons que la table
   ne peut pas porter parce que l'appelant tient déjà le nom : les prises de l'unité 8,
   les extraits de verset. Un nom absent du disque se tait, comme partout ailleurs. */
function jouerFichier(nom,o){
  o=o||{};
  stopAudio();
  spkOff(); spkOn(o.el);
  const gen=_sndGen;
  let fini=false;
  const termine=function(){ if(fini||gen!==_sndGen)return; fini=true; spkOff(); if(o.fin)o.fin(); };
  /* ⛔ AUCUNE VOIX DE MACHINE (Myriam, 15/09). Un son que l'app n'a pas enregistré est
     un SILENCE — et le bouton CONTINUER s'allume quand même, par `termine`. Le trou,
     lui, est signalé au portillon, pas à l'élève : voir outils/verifier-son.mjs. */
  if(!nom){ setTimeout(termine,120); return; }
  try{
    const a=audioBeni(urlDuSon(nom)); _curAudio=a;
    let parti=false;
    a.addEventListener('playing',function(){parti=true;},{once:true});
    a.onended=termine;
    a.onerror=function(){ setTimeout(termine,80); };   // fichier absent : on se tait, et on rend la main
    const p=a.play(); if(p&&p.catch)p.catch(function(){ setTimeout(termine,80); });
    /* un chargement lent n'est PAS un fichier absent : on ne rend la main que si rien
       n'a même commencé à se télécharger (readyState 0 = pas même les métadonnées). */
    setTimeout(function(){ if(!parti&&gen===_sndGen&&a.paused&&a.readyState===0)termine(); },1400);
    /* ⚠️ 6 s, PAS 8 : c'est le filet que `jouerMot` avait, et il borne l'attente maximale du
       bouton CONTINUER. Une revue a relevé qu'un filet unique à 8 s ALLONGEAIT l'attente là
       où l'ancien code descendait à 2,2 s (le nom d'une lettre) ou 2,6 s (le son d'une
       lettre) — et un site ne porte aucune ceinture : `asmFini` appelle la porte sans
       `objectifFilet()`. Sur un réseau lent, l'élève y attendait deux secondes de plus
       qu'avant. Le filet le plus long d'avant fait donc loi pour tous. */
    setTimeout(termine,6000);  // filet : le rappel finit toujours par venir (CONTINUER ne reste jamais gris)
  }catch(e){ setTimeout(termine,120); }
}

/* ── LE VOCABULAIRE : des raccourcis d'une ligne vers la porte unique ────────
   Ils ne contiennent AUCUNE logique. Ils existent pour que l'appel dise ce qu'il veut
   entendre — `sayLetterSound(L)` se lit mieux que `jouer('son:'+L)` — et pour que les
   soixante appels dispersés dans index.html, src/ecrans, src/player, ui/reviser,
   trace-lettres et les onclick du HTML n'aient pas eu à changer. */
function speak(t){ jouer(t); }
function sayLetterName(L,fin,el){ jouer(L,{fin:fin,el:el}); }
function sayLetterSound(L,fin){ jouer('son:'+letterKey(L),{fin:fin}); }
function jouerMot(ar,fin,el){ jouer(ar,{fin:fin,el:el}); }
function spkAudio(t,el){ jouer(t,{el:el||document.getElementById('spkBig')}); }
function spkRejouer(L){ jouer(L,{el:document.getElementById('spkBig')}); }
/* jouerF gardait un nom de fichier en dur (les six syllabes du disque 1, مَدْرَسَةٌ) :
   il passe par le nom, pas par la table — d'où jouerFichier. Le 2e argument, jadis le
   texte à faire lire par la synthèse, n'a plus d'objet et n'est plus lu. */
function jouerF(f,_inutile,fin){ jouerFichier(String(f).replace(/\.mp3$/,''),{fin:fin}); }
/* Les 3 haut-parleurs sonnent l'un après l'autre. La grille est en `direction:rtl`,
   donc l'option 0 est celle de DROITE : la séquence suit le sens de l'arabe. */
function spkSequence(st,k){
  if(QUEUE[qi]!==st||answered)return;
  if(!st.options||k>=st.options.length)return;
  var o=st.options[k];
  jouer(o.snd,{el:document.getElementById('sopt'+k),
               fin:function(){ setTimeout(function(){ spkSequence(st,k+1); },260); }});
}

/* ═══════════════ 7. LE HAUT-PARLEUR DESSINÉ ══════════════════════════════════
   Les trois ondes s'animent en cascade tant que le son joue. */
function spkSVG(cls){
  return '<svg class="spk'+(cls?' '+cls:'')+'" viewBox="0 0 52 34" aria-hidden="true">'+
    '<path class="cone" d="M5 12.5h7l9-7.5a1.6 1.6 0 012.6 1.2v21.6a1.6 1.6 0 01-2.6 1.2l-9-7.5H5a2 2 0 01-2-2v-5a2 2 0 012-2z"/>'+
    '<path class="w w1" d="M30 12.5a7 7 0 010 9"/>'+
    '<path class="w w2" d="M35.5 8a13 13 0 010 18"/>'+
    '<path class="w w3" d="M41 3.5a19 19 0 010 27"/></svg>';
}
function spkOn(el){
  if(!el)return;
  el.classList.add('on');
  var s=el.querySelector('.spk'); if(s)s.classList.add('on');
}
function spkOff(){
  /* ⚠️ 17/08 — `.wspk` AJOUTÉ. Sans lui, le haut-parleur d'une ligne de vocabulaire
     s'allumait et ne s'éteignait plus jamais : spkOn() pose `on` sur l'élément ET sur son
     `.spk`, mais spkOff() ne balayait que trois classes. Toute nouvelle sorte de bouton
     sonore DOIT rejoindre cette liste. */
  var l=document.querySelectorAll('.spk.on,.spkbtn.on,.opt.on,.wspk.on');
  for(var i=0;i<l.length;i++)l[i].classList.remove('on');
}

/* ═══════════════ 8. LA MARQUE SONORE ═════════════════════════════════════════
   Validée par Myriam le 05/08/2026 — trois étages :
   ① la SIGNATURE à chaque bonne réponse : sfx-bonne-reponse.mp3, le motif « Ṭalaʿa al-badr »
      en trois frappes sur la seconde neutre du maqām Bayātī. Toujours le même : c'est la
      répétition qui grave, comme le « ding » de Duolingo.
   ② le COMBO toutes les COMBO_TOUS bonnes réponses D'AFFILÉE : un mot tiré d'un pool qui
      tourne. Rare donc précieux, varié donc jamais lassant — et la récompense enseigne du
      vocabulaire, ce qu'une app d'arabe peut faire et pas une app généraliste.
   ③ la CLÔTURE en fin de leçon : confettis + sfx-fin-lecon.mp3 (voir finishDisque). */
const _SFXB={};let _sfxCtx=null,_curSrc=null;
function chargerSfx(){ // réveille le moteur à chaque geste, décode les sons courts une seule fois
  try{
    _sfxCtx=_sfxCtx||new (window.AudioContext||window.webkitAudioContext)();
    if(_sfxCtx.state!=='running')_sfxCtx.resume(); // iOS : couvre aussi l'état « interrupted »
    /* 🔴 15/09 — 'fin-lecon' MANQUAIT à cette liste, et c'était mesurable : ses trois
       appels prenaient donc TOUJOURS la branche <audio> de repli, celle qui appelle
       stopAudio() et coupe le son en cours — exactement ce que la branche WebAudio
       existe pour éviter. La clôture de leçon coupait la dernière félicitation. */
    ['bonne-reponse','erreur','fin-lecon'].forEach(n=>{
      if(_SFXB[n]||_SFXB['_'+n])return;
      _SFXB['_'+n]=1; // verrou : un seul téléchargement par son
      fetch(urlDuSon(SONS['sfx:'+n])).then(r=>r.arrayBuffer())
        /* ⚠️ decodeAudioData accepte DEUX rappels **et** rend une promesse. La nôtre
           est bien rattrapée par le .catch du bas ; celle qu'il rend, elle, ne trouvait
           personne — d'où un « EncodingError » en promesse non gérée à chaque décodage
           qui échoue (visible dans les harnais et la console de l'élève). On la congédie
           explicitement : elle ne nous apprend rien de plus que `rej`. */
        .then(ab=>new Promise((res,rej)=>{const p=_sfxCtx.decodeAudioData(ab,res,rej);if(p&&p.catch)p.catch(()=>{});}))
        .then(b=>{_SFXB[n]=b;}).catch(()=>{delete _SFXB['_'+n];});
    });
  }catch(e){}
}
try{
  ['touchend','pointerup','mousedown','click'].forEach(ev=>document.addEventListener(ev,chargerSfx,true));
}catch(e){}
/* ═══ 17/08 — « PARFOIS LE SON DU BOUTON CONTINUER DISPARAÎT » (Myriam) ═══════════════
   Sur iOS, un AudioContext passé « interrupted » (appel, Siri, verrouillage, bascule
   d'app) ne repart JAMAIS tout seul — resume() doit être rappelé. Tous les gardes du
   fichier ne testaient que 'suspended' : ils rataient cet état WebKit hors standard, et
   comme le tampon sfx est décodé, playSfx prenait toujours la branche WebAudio gelée —
   le repli <audio> était inatteignable. D'où « je dois fermer l'application ».
   `state!=='running'` couvre les deux états, et au retour au premier plan on réveille
   TOUS les contextes du fichier d'un coup.
   ⚠️ 15/09 — LES QUATRE CONTEXTES VIVENT DÉSORMAIS DANS CE FICHIER, et c'est la raison
   pour laquelle `_tocCtx` en revient : parti dans un module le matin même, il n'était
   plus le même objet ici, et ce réveil ne le touchait plus. */
function reveilAudio(){
  [window._ac,_sfxCtx,_tocCtx,chime._ac].forEach(function(c){
    try{ if(c&&c.state!=='running')c.resume(); }catch(e){}
  });
}
try{ document.addEventListener('visibilitychange',function(){ if(!document.hidden)reveilAudio(); }); }catch(e){}
function playSfx(name){ // récompense/erreur : tampon WebAudio si décodé (jamais bloqué), sinon <audio> béni, sinon SILENCE
  if(!SND)return; // « Effets sonores » coupe la récompense À L'INSTANT (Myriam 10/08)
  try{
    const b=_SFXB[name];
    if(b&&_sfxCtx){
      /* ⚠️ 17/08 — Myriam : « le son du dernier mot choisi est tu par l'apparition du
         bouton continuer ». Le sfx WebAudio se SUPERPOSE : plus de stopAudio() ici —
         le mot (`_curAudio`) finit de sonner, seul le sfx précédent s'arrête. */
      try{ if(_curSrc){ _curSrc.stop(); _curSrc=null; } }catch(_){}
      if(_sfxCtx.state!=='running')_sfxCtx.resume(); // iOS : couvre aussi l'état « interrupted »
      const s=_sfxCtx.createBufferSource();s.buffer=b;s.connect(_sfxCtx.destination);_curSrc=s;s.start();
      return;
    }
    stopAudio(); // repli <audio> seulement : il écrase _curAudio, l'ancien contrat reste
    const a=audioBeni(urlDuSon(SONS['sfx:'+name]||('sfx-'+name))); _curAudio=a;
    const p=a.play(); if(p&&p.catch)p.catch(()=>{});
  }catch(e){}
}
const COMBO_TOUS=3;
const COMBO_POOL=['moumtaz','sahih','rai','allahumma-barik'];
let comboSerie=0, comboDernier='';
function comboReset(){ comboSerie=0; }
function comboBonneReponse(){
  playSfx('bonne-reponse');                       // la signature, toujours
  if(++comboSerie<COMBO_TOUS)return;
  comboSerie=0;
  // jamais deux fois le même d'affilée : c'est la variété qui empêche la lassitude
  const dispo=COMBO_POOL.filter(m=>m!==comboDernier);
  comboDernier=dispo[Math.floor(Math.random()*dispo.length)];
  const gen=_sndGen, nom=SONS['felicit:'+comboDernier];
  // 350 ms : la signature (les quartes de Myriam, 287 ms) finit, on enchaîne sans trou.
  // Le jeton _sndGen est revérifié : changer d'écran entre-temps annule la félicitation.
  setTimeout(function(){
    if(gen!==_sndGen||!nom)return;
    try{ const a=audioBeni(urlDuSon(nom)); _curAudio=a; const p=a.play(); if(p&&p.catch)p.catch(function(){}); }catch(e){}
  },350);
}
function okBeep(kind){ // sons de réussite (WebAudio, aucun fichier nécessaire)
  if(!SND)return;
  try{
    const Ctx=window.AudioContext||window.webkitAudioContext; if(!Ctx)return;
    const ac=window._ac||(window._ac=new Ctx());
    if(ac.state!=='running')ac.resume(); // iOS : couvre aussi l'état « interrupted »
    const t=ac.currentTime;
    const notes=kind==='final'?[[523,0],[659,.09],[784,.18]]:kind==='dot'?[[880,0]]:[[587,0],[880,.08]];
    notes.forEach(n=>{
      const o=ac.createOscillator(),g=ac.createGain();
      o.type='sine';o.frequency.setValueAtTime(n[0],t+n[1]);
      g.gain.setValueAtTime(0.0001,t+n[1]);
      g.gain.exponentialRampToValueAtTime(0.13,t+n[1]+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,t+n[1]+0.22);
      o.connect(g);g.connect(ac.destination);o.start(t+n[1]);o.stop(t+n[1]+0.24);
    });
  }catch(e){}
}
function errorBeep(){
  if(!SND)return;
  try{
    const Ctx=window.AudioContext||window.webkitAudioContext; if(!Ctx)return;
    const ac=window._ac||(window._ac=new Ctx());
    if(ac.state!=='running')ac.resume(); // iOS : couvre aussi l'état « interrupted »
    const t=ac.currentTime, o=ac.createOscillator(), g=ac.createGain();
    o.type='square'; o.frequency.setValueAtTime(200,t);
    o.frequency.exponentialRampToValueAtTime(110,t+0.18);
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.13,t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.24);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t+0.26);
  }catch(e){}
}
let _tocCtx=null;
function toc(){ // l'erreur : deux frappes du timbre Bayātī, +1,5 puis −1,5 (choix Myriam 07/08) ; l'oscillateur reste en secours
  if(!SND)return; // même règle que playSfx : le repli oscillateur doit se taire aussi
  if(_SFXB['erreur']){ playSfx('erreur'); return; }
  try{
    _tocCtx=_tocCtx||new (window.AudioContext||window.webkitAudioContext)();
    if(_tocCtx.state!=='running')_tocCtx.resume(); // iOS : ce contexte n'avait AUCUN resume
    const o=_tocCtx.createOscillator(),g=_tocCtx.createGain();
    o.frequency.setValueAtTime(170,_tocCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(110,_tocCtx.currentTime+.12);
    g.gain.setValueAtTime(.22,_tocCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,_tocCtx.currentTime+.16);
    o.connect(g);g.connect(_tocCtx.destination);o.start();o.stop(_tocCtx.currentTime+.17);
  }catch(e){}
}
function chime(){ // petit carillon doux (arpège A5·D6·G6) — Web Audio, sans fichier
  if(!SND)return;   // 15/09 : c'était le SEUL générateur du projet sans ce garde
  try{
    var AC=window.AudioContext||window.webkitAudioContext; if(!AC)return;
    var ac=chime._ac||(chime._ac=new AC()); if(ac.state!=='running')ac.resume(); // iOS : couvre aussi l'état « interrupted »
    var t=ac.currentTime;
    [[880,0],[1174.66,0.09],[1567.98,0.18]].forEach(function(p){
      var o=ac.createOscillator(), g=ac.createGain();
      o.type='sine'; o.frequency.value=p[0]; var s=t+p[1];
      g.gain.setValueAtTime(0.0001,s);
      g.gain.exponentialRampToValueAtTime(0.16,s+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,s+0.55);
      o.connect(g); g.connect(ac.destination); o.start(s); o.stop(s+0.6);
    });
  }catch(e){}
}

/* ── LE SON DE CHAQUE MOT DES UNITÉS 1 À 7 (06/09/2026 ; versé ICI depuis le 16/09/2026) ──
   ⚠️ POURQUOI ICI, ET PAS DANS index.html COMME AVANT : le hub Réviser (revision.js) verse
   les Noms d'Allah et le cache Supabase au chargement, AVANT le grand script. Deux clés sont
   partagées avec la graine des Noms (الرَّحْمَٰنُ, الرَّحِيمُ) et, contre la TABLE réelle, deux de
   plus divergent (الصَّمَدُ, اللَّهُ : le package dit mot-*, la table nom-*). Avant le 16/09, le
   cache des Noms écrivait EN DERNIER et gagnait, en ligne comme en avion ; laissé dans
   index.html, ce versement serait passé après lui et deux mots auraient changé de prise en
   avion. Versé ici — son.js se charge avant revision.js —, l'ordre d'écriture est celui
   d'avant, à la clé près, et le banc du hub (outils/verifier-revision.mjs ⑤) l'exige :
   le cache des Noms gagne sur le package. UNITS vient de donnees.js, chargé avant.
   🔴 IL VIENT DU PACKAGE, ET IL DOIT GAGNER SUR LA CARTE CI-DESSUS. Jusqu’ici
   c’est la table Supabase `vocabulaire` qui posait ces entrées, et elle ne
   disait pas tout à fait la même chose : pour الرَّحْمَٰنُ et الرَّحِيمُ elle sert la
   prise des NOMS D’ALLAH (`nom-*`) là où la carte dit `mot-*`. Ce sont deux
   enregistrements différents, et c’est la version des Noms que les élèves
   entendent. Sans cette boucle, couper l’adoption ferait changer deux mots du
   Qorān de voix — en silence. Le `snd` de chaque mot porte la vérité. */
UNITS.forEach(function(U){ (U.words||[]).forEach(function(w){
  if (w && w.w && w.snd) inscrireLeSon(w.w, w.snd);
}); });
