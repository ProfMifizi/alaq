/* parcours.js — l'orchestration des disques.
   Porte : la table des neuf disques types (disques()), les disques particuliers
   (revisionDisc(), LETTREVSPRO_DISC), u8Disques / u9Disques / u10Disques, et
   discsFor(u) : quels disques chaque unité montre, et dans quel ordre.
   ⚠️ Cet ordre est la progression : dkey(u,i) enregistre par numéro de disque,
   réordonner réécrit le sens de ce qui est déjà coché (voir fixOrdreFormes(),
   progression.js). (journal : parcours.js · la table paresseuse et buildReview)

   Script classique, ni defer ni module : showTab('home') appelle discsFor de façon
   synchrone au premier rendu.
   ⚠️ disques() et revisionDisc() restent paresseuses et mémoïsées : ce fichier ne
   capture rien au chargement (essai ⑫ de verifier-parcours.mjs, qui le charge sans
   constructeurs). Historique : les constructeurs vivaient alors dans le grand script.

   À l'appel seulement : les dix constructeurs buildAlphabet … buildReview
   (generateurs.js), UNITS (donnees.js), U8 (index.html), window.__alaqU9,
   window.__alaqU10 (modules ES).
   ⚠️ Un disque est reconnu par identité de fonction — progression.js
   (d.build === buildForms, fixOrdreFormes) et revision.js (ds[i].build ===
   buildWords, _lireDone) : référencer les constructeurs, jamais les recréer.
   ⚠️ disques() rend un objet partagé : rien ne doit le muter.
   Gardes : outils/verifier-parcours.mjs, previews/_verif_parcours.html. */

// ORDRE PÉDAGOGIQUE : « Les formes » AVANT « Dans la Fātiḥa » — on ne peut pas demander de repérer
// une lettre dans le verset (où elle est écrite liée) avant d'avoir montré début/milieu/fin.
/* Les neuf disques types : des RÉFÉRENCES vers les constructeurs, résolues à l'appel
   (voir l'en-tête). L'essai ⑫ de verifier-parcours.mjs charge ce fichier sans eux. */
let _disques=null;
function disques(){
  if(!_disques)_disques=[
 {icon:'💡',img:'decouvrir',label:'L\u2019alphabet',build:buildAlphabet},
 {icon:'📌',img:'memoriser',label:'Mémoriser {L}',build:buildMemo},
 {icon:'📌',img:'memoriser',label:'Les formes',build:buildForms},
 {icon:'🕋',img:'qoran',label:'Dans la Fātiḥa',build:buildSpot},
 {icon:'📌',img:'memoriser',label:'Les harakats',build:buildHarakat},
 {icon:'📌',img:'memoriser',label:'Les prolongations',build:buildMadd},
 {icon:'🔗',img:'lire',label:'Lire des mots',build:buildWords},
 {icon:'✏️',img:'ecrire',label:'Écrire des mots',build:buildWrite},
 {icon:'🏆',img:'bilan',label:'Bilan',build:buildBilan},
  ];
  return _disques;
}

// Premier disque selon l'unité : tour d'alphabet en unité 1, révision dès l'unité 2.
/* Paresseuse elle aussi (même contrat, essai ⑫).
   LETTREVSPRO_DISC n'en a pas besoin : sa fonction est déclarée dans ce fichier. */
let _revisionDisc=null;
function revisionDisc(){
  if(!_revisionDisc)_revisionDisc={icon:'🔄',img:'reviser',label:'Révision',build:buildReview};
  return _revisionDisc;
}
// Disque propre à l'unité « lettres faibles » — contenu (support/prolongation + hamza
// et son siège) à construire avec le reste de l'unité 2.
function buildLettreVsProlong(U){
  const DM=(base,hk,answer,result,tag,read)=>({type:'dragmad',base,hk,answer,result,tag,read,say:result,note:'Glisse la bonne lettre de prolongation sur la lettre'});
  const DA=(carrier,cells)=>({type:'dragassoc',carrier,cells,note:'Glisse chaque prolongation sur la lettre qui lui correspond'});
  return [
    /* Le titre est l'instruction ; sur chaque carte, la lettre et son rôle, rien de plus.
       L'écran des rôles vient AVANT les cartes : d'abord QUI a plusieurs rôles, puis LESQUELS.
       (journal : parcours.js · « Lettres vs prolongations », les retours de Myriam) */
    {type:'roles', gate:true, title:'3 lettres ont plusieurs rôles'},
    {type:'flipcards', gate:true, cartes:[
      {ar:'ي', role:'consonne', cons:'يَ', pro:'إِي'},
      {ar:'و', role:'consonne', cons:'وَ', pro:'أُو'},
      {ar:'ا', arRole:'أ', role:'support', cons:'',   pro:'أَا'}
    ]},
    DM('ن','\u0650','ي','نِي','ī','ni'),
    DM('م','\u064E','ا','مَا','ā','ma'),
    DM('ل','\u064F','و','لُو','ū','lou'),
    DA('ي',[{short:'يَ',madd:'ا',long:'يَا',say:'يَا'},{short:'يِ',madd:'ي',long:'يِي',say:'يِي'},{short:'يُ',madd:'و',long:'يُو',say:'يُو'}]),
    DA('و',[{short:'وَ',madd:'ا',long:'وَا',say:'وَا'},{short:'وِ',madd:'ي',long:'وِي',say:'وِي'},{short:'وُ',madd:'و',long:'وُو',say:'وُو'}]),
    DA('ء',[{short:'أَ',madd:'ا',long:'آ',say:'أَا'},{short:'إِ',madd:'ي',long:'إِي',say:'إِي'},{short:'أُ',madd:'و',long:'أُو',say:'أُو'}]),
    /* Le alif portant la hamza : des « supports » (pas « voyelle »), un seul terme dans la leçon. */
    {type:'taprow', title:'Touche chaque support', lignes:['أَ','إِ','أُ']},
    /* Le tri des sièges (même moteur que le tri soukoun/chedda). إِمَامٌ et إِلَيْنَا sont
       ajoutés dans ce littéral, pas dans U.words : trois mots par panier, lettres déjà connues.
       (journal : parcours.js · « Lettres vs prolongations », les retours de Myriam) */
    {type:'tri', mute:true,
      paniers:[{sig:'أ',cle:'a'},{sig:'إ',cle:'i'}],
      mots:shuffle([
        {w:'أَمَانٌ',cle:'a'},{w:'أَمِينٌ',cle:'a'},{w:'أَلِيمٌ',cle:'a'},
        {w:'إِيمَانٌ',cle:'i'},{w:'إِمَامٌ',cle:'i'},{w:'إِلَيْنَا',cle:'i'}
      ])},
    /* ي et و portant une voyelle sont des consonnes ; le alif ne l'est jamais : il prolonge ou il porte (journal : parcours.js · les rôles de ي et و).
       Le alif nu ne prolonge pas toujours (الْـ) : la règle est bornée à l'unité (journal : parcours.js · les quiz de l'unité 2) */
    mcq({prompt:'Ici, quel rôle joue le ا ?',glyph:'مَالٌ',glyphLinear:true,mute:true,graded:true,answer:'p',explain:'Dans <span class="ar">مَالٌ</span>, le <span class="ar">ا</span> suit une fatḥa et prolonge le son : on dit « māloun ». C’est son rôle de prolongation, pas de support.',
      options:shuffle([{txt:'Il prolonge le son « ā »',key:'p'},{txt:'Il fait le son « l »',key:'l'},{txt:'Il ne sert à rien',key:'x'}])}),
    mcq({prompt:'Ici, le ي est…',glyph:'يَوْمٌ',glyphLinear:true,mute:true,graded:true,answer:'c',explain:'Au début de <span class="ar">يَوْمٌ</span> (« yawmoun »), le <span class="ar">ي</span> porte une fatḥa et se prononce « y » : ici c’est une consonne.',
      options:shuffle([{txt:'une consonne « y »',key:'c'},{txt:'une prolongation « ī »',key:'i'},{txt:'une harakat',key:'h'}])}),
    mcq({prompt:'Le و prolonge le son « ū »…',mute:true,graded:true,answer:'d',explain:'Le <span class="ar">و</span> prolonge en « ū » seulement après une ḍamma. Chaque prolongation suit sa voyelle : <span class="ar">ا</span> après fatḥa, <span class="ar">ي</span> après kasra, <span class="ar">و</span> après ḍamma.',
      options:shuffle([{txt:'après une ḍamma <span style="font-family:var(--ar);font-size:1.7em">ـُ</span>',key:'d'},{txt:'après une fatḥa <span style="font-family:var(--ar);font-size:1.7em">ـَ</span>',key:'f'},{txt:'après une kasra <span style="font-family:var(--ar);font-size:1.7em">ـِ</span>',key:'k'}])}),
    mcq({prompt:'À quoi sert la hamza <span style="font-family:var(--ar)">(ء)</span> posée sur le alif ?',mute:true,graded:true,answer:'v',explain:'La hamza <span class="ar">ء</span> est une vraie lettre (un petit coup de glotte). Posée sur le alif, elle permet de prononcer une voyelle seule — a, i ou ou — au début d’un mot.',
      options:shuffle([{txt:'à dire une voyelle seule : a, i, ou',key:'v'},{txt:'à prolonger le son',key:'l'},{txt:'à séparer deux mots',key:'s'}])}),
    mcq({prompt:'Pour faire le son « i » tout seul, qu’écrit-on ?',mute:true,graded:true,grid:'grid3',answer:'i',explain:'Pour le son « i », la hamza se place sous le alif : <span class="ar">إ</span>. Au-dessus (<span class="ar">أ</span>) on dit « a » ou « ou » ; dans les mots de cette unité, le alif nu <span class="ar">ا</span> sert à prolonger.',
      options:shuffle([{ar:'إ',key:'i'},{ar:'أ',key:'a'},{ar:'ا',key:'n'}])}),
  ];
}
const LETTREVSPRO_DISC={icon:'💡',img:'decouvrir',label:'Lettres vs prolongations',build:buildLettreVsProlong};
/* Les 9 disques de l'unité 8 (aucune lettre neuve : ni Mémoriser, ni Formes).
   ⚠️ Pas de « Révision » en tête : D1 est une découverte et reste le premier écran.
   Libellés d'accueil, distincts de ceux de src/units/unit-8/donnees/disques.js
   (U8.titre(k) garde ces derniers pour le diagnostic).
   u8Disques() à la demande, mémoïsé ; build() ne lit U8 (let d'index.html, déclaré
   après ce fichier) qu'au doigt. */
const U8_PLAN=[
  {k:'D1', img:'decouvrir', label:'L’article الـ'},
  {k:'D2', img:'ecrire',    label:'Écrire avec الـ'},
  /* ⛔ Jamais « Le ل qui s’avale » : le terme du projet est « lettre muette ».
     (journal : parcours.js · unité 8, previews validées le 15/08 et « lettre muette ») */
  {k:'D3', img:'decouvrir', label:'Le ل, lettre muette'},
  {k:'D4', img:'ecrire',    label:'Écrire les solaires'},
  {k:'D5', img:'memoriser', label:'Poser l’article'},
  {k:'D6', img:'lire',      label:'L’oreille et l’œil'},
  {k:'D7', img:'memoriser', label:'Soleil et lune'},
  {k:'D8', img:'qoran',     label:'Les الـ de la Fātiḥa'},
  {k:'D9', img:'bilan',     label:'Bilan'},
];
let _u8Disques=null;
function u8Disques(){
  if(!_u8Disques) _u8Disques=U8_PLAN.map(function(p){
    return {icon:'🌙', img:p.img, label:p.label, u8:p.k,
            /* D4 clôt l'apprentissage des mots : il ouvre la révision espacée. */
            vocab:(p.k==='D4'),
            build:function(){ return U8.disque(p.k); }};
  });
  return _u8Disques;
}

/* Le disque grisé « À venir » (aVenir:true : renderHome le laisse grisé quel que soit
   S.done), pour que l'accueil montre toujours neuf disques. Utilisé par l'unité 10.
   (journal : parcours.js · la fabrique des disques « À venir ») */
function disqueAVenir(){
  return { icon:'🌙', img:'decouvrir', label:'À venir', aVenir:true,
    build:function(){ return [{type:'slide',nobadge:true,center:true,title:'Bientôt disponible',html:''}]; } };
}
/* Unité 9 : chaque écran est un st.type du registre d'exercices, pas un moteur à soi.
   ⚠️ Icône, libellé et longueur restent dans ce script classique, jamais dérivés du
   module : discsFor(8).length doit être juste dès le premier rendu. Seul build() est différé :
   il n'est appelé qu'au doigt, donc après src/entree.js.
   ⚠️ L'icône dit la NATURE du disque, pas son rang : decouvrir (une notion s'introduit),
   memoriser (une forme se travaille), qoran (le texte réel), bilan.
   (journal : parcours.js · les 9 disques portaient tous l'ampoule) */
function u9Disques(){
  return [
    { icon:'🌙', img:'decouvrir', label:'بِ · عَلَى · لِ',
      build:function(){
        if(window.__alaqU9 && typeof window.__alaqU9.disque1==='function') return window.__alaqU9.disque1();
        console.error('unité 9 : module non chargé (disque 1)'); return [];
      } },
    { icon:'🌙', img:'decouvrir', label:'بِ — le moyen',
      build:function(){
        if(window.__alaqU9 && typeof window.__alaqU9.disque2==='function') return window.__alaqU9.disque2();
        console.error('unité 9 : module non chargé (disque 2)'); return [];
      } },
    { icon:'🌙', img:'decouvrir', label:'عَلَى — sur',
      build:function(){
        if(window.__alaqU9 && typeof window.__alaqU9.disque3==='function') return window.__alaqU9.disque3();
        console.error('unité 9 : module non chargé (disque 3)'); return [];
      } },
    /* ⚠️ vocab:true fait entrer les mots en révision (_lireDone, revision.js) : sans lui,
       seulement à la validation de l'unité entière. Le disque 4 clôt le corpus. */
    { icon:'🌙', img:'decouvrir', label:'لِ — pour / à qui', vocab:true,
      build:function(){
        if(window.__alaqU9 && typeof window.__alaqU9.disque4==='function') return window.__alaqU9.disque4();
        console.error('unité 9 : module non chargé (disque 4)'); return [];
      } },
    { icon:'🌙', img:'memoriser', label:'بِ — la fin du nom',
      build:function(){
        if(window.__alaqU9 && typeof window.__alaqU9.disque5==='function') return window.__alaqU9.disque5();
        console.error('unité 9 : module non chargé (disque 5)'); return [];
      } },
    { icon:'🌙', img:'memoriser', label:'لِ — la fin du nom',
      build:function(){
        if(window.__alaqU9 && typeof window.__alaqU9.disque6==='function') return window.__alaqU9.disque6();
        console.error('unité 9 : module non chargé (disque 6)'); return [];
      } },
    { icon:'🌙', img:'memoriser', label:'عَلَى — la fin du nom',
      build:function(){
        if(window.__alaqU9 && typeof window.__alaqU9.disque7==='function') return window.__alaqU9.disque7();
        console.error('unité 9 : module non chargé (disque 7)'); return [];
      } },
    { icon:'🌙', img:'qoran', label:'Le Coran — Al-Fātiḥa',
      build:function(){
        if(window.__alaqU9 && typeof window.__alaqU9.disque8==='function') return window.__alaqU9.disque8();
        console.error('unité 9 : module non chargé (disque 8)'); return [];
      } },
    /* Le bilan : aucun disque grisé, l'unité 9 peut être validée (sans risque :
       unitUnlocked refuse une unité ready:false). (journal : parcours.js · unité 9, vocab:true et le bilan) */
    { icon:'🏆', img:'bilan', label:'Bilan — بِ · لِ · عَلَى',
      build:function(){
        if(window.__alaqU9 && typeof window.__alaqU9.disque9==='function') return window.__alaqU9.disque9();
        console.error('unité 9 : module non chargé (disque 9)'); return [];
      } },
  ];
}

/* Unité 10 « X de Y » : les NEUF disques de l'annexion ; même mécanique que u9Disques()
   (contenu dans window.__alaqU10, métadonnée et longueur dans ce script classique).
   ⛔ Le libellé ne dit pas « مُضَاف » : interdit au disque 1 par les directives validées.
   ⚠️ Ne mémoïse pas, comme u9Disques : chaque appel rend un tableau neuf.
   (journal : parcours.js · unité 10, ouverture · les neuf disques livrés) */
function u10Disques(){
  return [
    /* LES NEUF DISQUES DE L'ANNEXION, tous réels depuis le 24/09 (GO de Myriam : « tu es
       censé délivrer toutes les leçons de l'unité 10, on a tout construit »). Ils étaient
       écrits et gardés depuis des semaines, mais le parcours n'en servait qu'un : huit
       grisés tenaient leur place. `vocab:true` reste sur le PREMIER : il ouvre la porte de
       l'unité, et chaque nom de UNITS[9].words attend en plus SON disque (champ `disque`,
       allReviewWords). Les groupes d'annexion restent hors du vocabulaire (une espace,
       splitUnits() en ferait une tuile vide).
       ⚠️ Les titres sont COURTS — l'accueil n'est pas la place d'un sous-titre (règle 1),
       et l'icône dit la NATURE du disque, pas son rang. L'emoji n'est que le REPLI
       si l'image ne charge pas (onerror, ui/accueil.js) : il suit sa famille. */
    ...[
      ['🌙','decouvrir','De qui ? de quoi ?',   1, true ],
      ['📌','memoriser','La porte de la maison',2, false],
      ['📌','memoriser','Transformer',          3, false],
      ['✏️','ecrire',   'Produire',             4, false],
      ['💡','decouvrir','Le premier mot',       5, false],
      ['💡','decouvrir','Le deuxième mot',      6, false],
      ['📌','memoriser','Nommer les deux rôles',7, false],
      ['🕋','qoran',    'Dans Al-Fātiḥa',       8, false],
      ['🏆','bilan',    'Bilan',                9, false],
    ].map(function(d){
      var icon=d[0], img=d[1], label=d[2], n=d[3], vocab=d[4];
      var o={ icon:icon, img:img, label:label, build:function(){
        var f=window.__alaqU10 && window.__alaqU10['disque'+n];
        if(typeof f==='function') return f();
        console.error('unité 10 : module non chargé (disque '+n+')'); return [];
      } };
      if(vocab) o.vocab=true;
      return o;
    }),
  ];
}

/* Unité 11 : les NEUF disques (GO de Myriam, 01/11), même mécanique que u10Disques() : le rang i appelle disque(i+1),
   dkey(u,i) enregistre par rang. `vocab:true` sur le premier seul ouvre la porte du vocabulaire ;
   supportWawOuvert() (progression.js) lit le disque de rang 1 : ne pas réordonner. */
function u11Disques(){
  return [
    ['🌙','decouvrir','Les pronoms collés',  1, true ],
    ['💡','decouvrir','Nous, Tu, eux',       2, false],
    ['📌','memoriser','Mon, ton, notre, leur',3, false],
    ['✏️','ecrire',   'Produire',            4, false],
    ['📌','memoriser','Transformer',         5, false],
    ['💡','decouvrir','Les accords',         6, false],
    ['📌','memoriser','Nommer',              7, false],
    ['🕋','qoran',    'Dans Al-Fātiḥa',      8, false],
    ['🏆','bilan',    'Bilan',               9, false],
  ].map(function(d){
    var icon=d[0], img=d[1], label=d[2], n=d[3], vocab=d[4];
    var o={ icon:icon, img:img, label:label, build:function(){
      var f=window.__alaqU11 && window.__alaqU11['disque'+n];
      if(typeof f==='function') return f();
      console.error('unité 11 : module non chargé (disque '+n+')'); return [];
    } };
    if(vocab) o.vocab=true;
    return o;
  });
}

/* Unité 12 : la mémorisation de la Fātiḥa, NEUF disques (spécification : notes/u12-structure-fiche-2026-11-18-v6.md), même
   mécanique que u11Disques() : le rang i appelle disque(i+1). L'unité reste ready:false tant que Myriam n'a pas donné son GO. */
function u12Disques(){
  return [
    ['📌','memoriser','Remettre en ordre',          1, false],
    ['💡','decouvrir','Le sens · versets 1 à 5',     2, false],
    ['💡','decouvrir','Le sens · versets 6 et 7',    3, false],
    ['📌','memoriser','Placer les mots',             4, false],
    ['📌','memoriser','Traduire',                    5, false],
    ['🕋','qoran',    'L’histoire',                  6, false],
    ['✏️','ecrire',   'Dictée',                      7, false],
    ['📌','memoriser','Sans le son',                 8, false],
    ['🏆','bilan',    'Bilan',                       9, false],
  ].map(function(d){
    var icon=d[0], img=d[1], label=d[2], n=d[3], vocab=d[4];
    var o={ icon:icon, img:img, label:label, build:function(){
      var f=window.__alaqU12 && window.__alaqU12['disque'+n];
      if(typeof f==='function') return f();
      console.error('unité 12 : module non chargé (disque '+n+')'); return [];
    } };
    if(vocab) o.vocab=true;
    return o;
  });
}

/* L'évaluation « AVANCER ICI ? » depuis l'unité 8 jusqu'à l'unité 11, sur la bulle de l'unité SUIVANTE (Myriam, 02/11, 18/11, 23/11) : 20 écrans, la
   grammaire de l'unité testée ET celle des unités d'avant, l'écriture au clavier, « trouve l'erreur et corrige-la », la traduction. Des écrans DÉJÀ validés
   des disques, à un seul geste, et des écrans neufs bâtis sur les mêmes données. Chaque écran porte `origine` (l'indice de l'unité d'où il vient) :
   finishExam s'en sert pour la page d'échec, et une unité n'est validée par le test que si ses écrans y sont (le niveau 11 en porte 12 de l'unité 11).
   ⛔ Ce qui est déjà montré ne se redemande jamais : aucune réponse, cible ou nom d'un écran ne figure, sous aucune forme (autre flexion, même squelette
   de lettres, même clé de mot), dans l'énoncé, l'image, les options ou l'explication d'un autre écran.
   Le tirage est CONTRÔLÉ : examControle(q,niveau) rend la liste des violations (un seul endroit, le banc l'appelle), examGrammaire retire jusqu'à 30 fois
   (sur trois pools au plus) et garde le meilleur. Rend null avant l'unité 8.
   ➕ AJOUTER UN NIVEAU N : ① examPool : un bloc `if(niveau>=N){…}` qui `ajoute(écran,[étiquettes])` — les écrans viennent des données
   (`pas(unité,disque,rang)`), `origine` = l'indice de l'unité d'où vient l'écran ; une étiquette = une NOTION, avec ses variantes déjà en production quand
   le plan exact ne tient pas sous le contrôle ; ② EXAM_PLANS[N] : `slots` (étiquette, combien : le plus contraint d'abord), `remplir` (de quoi compléter
   jusqu'à 20), `min` (ce que le contrôle exige par notion : voir examNotions) ; ③ un type d'écran neuf a sa branche dans examFiche (ce qu'il DEMANDE, ce
   qu'il MONTRE), examFam et examGestes ; ④ le banc : NIVEAUX de outils/verifier-examen.mjs. examNiveau donne alors le niveau N à l'unité N.
   Garde : outils/verifier-examen.mjs. (journal : parcours.js · l'évaluation des unités 8 à 10 ; l'évaluation de l'unité 11) */
var EXAM_CONSIGNE_ECRIS='Écris en arabe.';
/* les consignes de français → arabe AU CLAVIER des leçons (unités 9 et 10) : le test n'en montre qu'une (journal : parcours.js · une seule consigne pour écrire en arabe) */
var EXAM_CONSIGNES_FR_AR=['Traduis en arabe.','Traduis et écris en arabe.','Écris l’expression.'];
var EXAM_U9={bint:"الْقَلَمُ لِلْبِنْتِ",maktab:"الْقَلَمُ عَلَى الْمَكْتَبِ",
  rumm:"الرُّمَّانَةُ لِلْأُمِّ",tayr:"الطَّائِرُ عَلَى الْبَيْتِ",
  son:{"bint":"/audios-app-alaq/mot-qalamlilbint.mp3","rumm":"/audios-app-alaq/mot-rummanatulilumm.mp3","tayr":"/audios-app-alaq/mot-tayralalbayt.mp3"},fr:{"bint":"Le stylo est pour la fille.","rumm":"La grenade est pour la mère.","tayr":"L’oiseau est sur la maison."}};
/* Les écrans de chaque niveau, par ÉTIQUETTE (examPool les pose) : [étiquette, combien] ; `remplir` ([étiquette, plafond]) complète
   jusqu'à 20 quand un compte n'a pas trouvé son écran ; `min` : ce que le contrôle exige de chaque notion (examNotions) ; `max` : ce qu'il n'accepte jamais de dépasser (les « Corrige » : deux aux niveaux 9 et 10).
   ⚠️ Le vocabulaire borne les notions : une réponse ne devant figurer dans aucun autre écran, les phrases de l'unité 9 ne fournissent
   que cinq écrans compatibles entre eux (harf + blocs + corrige), le bilan de l'unité 10 sept au plus (six en moyenne : voir le niveau 10).
   Ni quiz « La lettre … est » ni écran-règle au niveau 8 (la marque ou la règle donnerait la réponse des écrans suivants) : leur place
   revient aux mots des unités 1 à 7. */
var EXAM_PLANS={
  8:{slots:[['ecrLun',1],['ecrSol',1],['finDef',1],['finNu',1],['fin',1],['artLun',1],['artSol',1],['sensDef',1],['sensNu',1],['sens',1],
            ['avecAl',3],['ecrireU8',1],['17dictee',1],['17ecrire',1],['17sens',1],['17son',3]],
     remplir:[['17son',4],['17sens',2],['avecAl',4]], min:{unite8:12}},
  9:{slots:[['ordonner',1],['corrige',2],['harfSens',2],['trad',2],['term5',1],['term6',1],['term7',1],['cum8A',1],['avecAl',1],['sensDef',1],
            ['17dictee',1],['17ecrire',1]],
     remplir:[['harfSens',3],['ordonner',2],['corrige',2],['term',4],['avecAl',2],['17son',2],['17sens',2]],
     min:{harf:2,ordonner:1,corrige:2,terminaison:2,traduction:1,unite8:2},
     max:{corrige:2}},   // Myriam, 25/11 : « au plus 2 Corrige par test » (niveaux 9 et 10) — le plan en porte deux, le remplissage n'en ajoute pas, examControle refuse un troisième
  /* niveau 10 : UNE fois chaque notion de l'unité (corriger, traduire, nommer, harf ou annexion, ordonner), puis le bilan se complète au
     hasard (`remplir` d'abord par lui) : deux « corrige » et deux « traduis » obligatoires forçaient toujours les mêmes sept écrans et
     excluaient « Touche le مُضَاف » (mesuré : 0 sur 300 tirages). */
  10:{slots:[['corrige10',1],['trad10',1],['nommer',1],['annAssoc',1],['ordonner10',1],['ordonner',1],['corrige',1],['harfSens',1],['term',1],
             ['cum8A',1],['sensDef',1],['17dictee',1],['17ecrire',1]],
      remplir:[['corrige10',1],['nommer',2],['trad10',2],['harfSens',2],['ordonner',2],['term',2],['avecAl',2],['17son',2],['17sens',2]],
      min:{annexion:6,nommer:1,annexionOuHarf:1,corrigeAnnexion:1,corrige:2,ordonner:1,terminaison:1,harf:1,unite8:2},
      max:{corrige:2}},   // Myriam, 25/11 : au plus 2 « Corrige » par test (corrige10 + corrige, ensemble)
  /* niveau 11 (la bulle de l'unité 12) : 12 écrans de l'unité 11 (pronoms ×4, accords ×2, défini nommé ×2, Fātiḥa ×2, traduction ×2), puis deux écrans de
     chaque unité d'avant (10, 9, 8, 1 à 7). Pas de « Que veut dire ce mot ? » (`sansSens`) : le plan n'en porte pas.
     ⚠️ Le plan EXACT ne tient pas sous le contrôle (17 écrans sur 20 au plus se passent mutuellement) : `annexion10`, `tradFr` et `corrige10` sont des
     NOTIONS, chacune avec ses variantes déjà en production. Toute étiquette de l'unité 11 l'est (VAR11, dans examPool) : le plan fixe les notions et leur ordre,
     le tirage choisit l'écran. (journal : parcours.js · l'évaluation de l'unité 11 ; la variété du niveau 11) */
  11:{slots:[['pronomTu',1],['pronomLeur',1],['transforme',1],['nous',1],['accordToucher',1],['corrige11',1],['definiPourquoi',1],['rangerDefini',1],
             ['fatihaGenitif',1],['fatihaEux',1],['tradAr',1],['tradFr',1],
             ['annexion10',1],['corrige10',1],['corrige',1],['term',1],['cum8A',1],['avecAl',1],['17dictee',1],['17ecrire',1]],
      remplir:[['nous',2],['rangerDefini',2],['corrige11',2],['annexion10',2],['corrige10',2],['corrige',2],['17son',2],['17sens',2]],
      min:{unite11:12,pronoms:4,accords:2,definiNomme:2,fatiha:2,traduction11:2,corrige:3,corrige11:1,corrigeAnnexion:1,annexion:2,unite9:2,unite8:2,mots17:2,
           terminaison:1,ordonner:1},
      sansSens:true}
};
/* ce que le test couvre, par notion : le contrôle exige le minimum de EXAM_PLANS[niveau].min (un test sans « corrige » n'évalue plus la correction) */
function examNotions(q){
  var o={harf:0,terminaison:0,ordonner:0,corrige:0,traduction:0,unite8:0,annexion:0,mots17:0,nommer:0,annexionOuHarf:0,corrigeAnnexion:0,
    unite9:0,unite11:0,pronoms:0,accords:0,definiNomme:0,fatiha:0,traduction11:0,corrige11:0};
  q.forEach(function(p){ var f=examFam(p);
    if(f==='mcq/harf'||(f==='association-mots'&&p.origine===8)) o.harf++;
    if(f==='choisir-harakat') o.terminaison++;
    if(f==='ordonner-blocs') o.ordonner++;
    if(f==='clavier/corrige') o.corrige++;
    if(f==='grammaire-annexion') o.nommer++;
    if(f==='association-mots'&&p.origine===9) o.annexionOuHarf++;
    if(f==='clavier/corrige'&&p.origine===9) o.corrigeAnnexion++;
    if(f==='clavier/ecrire'&&p.origine>=8) o.traduction++;
    if(p.origine===7) o.unite8++;
    if(p.origine===8) o.unite9++;
    if(p.origine===9) o.annexion++;
    if(p.origine<7) o.mots17++;
    /* l'unité 11, par ce que l'écran FAIT (geste, cible) : la bulle à compléter ou le verbe choisi, l'accord, le défini nommé, la Fātiḥa, la traduction */
    if(p.origine===10){ var g=p.type==='scene-bulle'?p.geste:'', rl=((p.cibles||[])[0]||{}).role;
      o.unite11++;
      if(g==='glisser'||g==='choisir'||g==='toucher'||f==='clavier/ecrire') o.pronoms++;
      if((g==='mots'&&rl)||f==='clavier/corrige') o.accords++;
      if(f==='trier-colonnes'||(g==='qui'&&!p.evidence)) o.definiNomme++;
      if((g==='mots'&&!rl)||(g==='qui'&&p.evidence)) o.fatiha++;
      if(f==='explorer-traduire'||f==='ordonner-blocs') o.traduction11++;
      if(f==='clavier/corrige') o.corrige11++;
    } });
  return o;
}
/* les glosses françaises de deux noms de l'unité 8 qui disent la même chose : la table des noms proches s'en DÉRIVE (examProche) ;
   jamais ensemble dans « Que veut dire ce mot ? », et jamais demandés du français (deux arabes justes ne se comptent pas faux) */
var EXAM_GLOSES_PROCHES=[['maison','demeure']];
/* ni الـ ni عَلَى ne sont des mots à ne pas redire : l'article et le harf reviennent par nature (Allah, lui, compte : un seul noyau pour ses deux graphies) */
var EXAM_VIDES=['ال','على'];
/* les noms de l'unité 8 qu'un niveau ne pose pas dans « Choisis ce mot avec l'article » : au niveau 11, « de l'or » — son 4ᵉ choix ne diffère de
   « il est allé » (unité 7) que par la dernière voyelle (doute du vérificateur d'arabe, 23/11) */
var EXAM_SANS_AVECAL={11:['dhahab']};
/* Les graphies fautives des « Corrige » et les deux leurres du choix du harf ne sont PAS tapés : une règle les fabrique depuis la bonne phrase
   (l'arabe vient des données, une forme fautive d'une règle écrite) ; le banc les compare aux graphies relues par le vérificateur d'arabe le 18/11. */
function examFautes(E){
  var fin=function(s,de,vers){ return s.replace(de,function(){ return vers; }); }, HARF=' عَلَى ';
  var m=E.maktab.split(HARF);
  return {
    bintFaux:fin(E.bint,/لِ(?=لْ)/,'لِا'),           // لِ + الـ : l'alif de l'article reste après لِ
    rummFaux:fin(E.rumm,/ِ(?=ّ?$)/,'ُ'),                                 // ḍamma au lieu de la kasra du dernier nom
    tayrFaux:fin(E.tayr,/ُ(?= )/,'ٌ'),                                        // le tanwīn gardé sous l'article du premier mot
    maktabLi:fin(E.maktab,/ عَلَى الْ/,' لِلْ'),   // عَلَى devient لِ, fusionné avec l'article
    maktabInv:fin(m[1],/ِ$/,'ُ')+HARF+fin(m[0],/ُ$/,'ِ')           // le sujet et le complément échangés, leurs marques finales avec eux
  };
}
/* l'INVERSION des deux termes d'une phrase « X لِ Y » (le premier terme passe après لِ avec la kasra, le second devient le sujet avec la ḍamma) : la traduction d'un élève qui lit les termes à l'envers
   (« l'âne est à la corde »). Une phrase correcte en arabe, fausse comme traduction ; produite par RÈGLE depuis la bonne, jamais retapée. Rend '' si la phrase n'a pas la forme attendue. */
function examInverse(s){
  var AL='الْ', LILI='لِلْ', m=String(s).normalize('NFC').trim().split(/ +/);
  if(m.length!==2||m[0].indexOf(AL)!==0||m[1].indexOf(LILI)!==0) return '';
  var a=m[0].slice(AL.length), b=m[1].slice(LILI.length);
  if(!/\u064F$/.test(a)||!/\u0650$/.test(b)) return '';
  return AL+b.replace(/\u0650$/,function(){ return '\u064F'; })+' '+LILI+a.replace(/\u064F$/,function(){ return '\u0650'; });
}
/* le squelette d'un texte : balises ôtées, sans marques ni tatwīl, les alif unifiés */
function examSq(s){ return String(s==null?'':s).replace(/<[^>]*>/g,' ').normalize('NFC').replace(/[ً-ْٰـ]/g,'').replace(/[أإآٱ]/g,'ا'); }
/* les mots d'un texte ramenés à leur noyau : sans الـ ni بِالـ / لِلـ collés — « même mot, autre flexion » = même noyau */
function examCores(s){
  var o=[];
  examSq(s).split(/[^ء-ي]+/).forEach(function(t){
    if(t.length<2||EXAM_VIDES.indexOf(t)>=0) return;
    var c=t;
    if(t==='الله'||t==='لله') c='الله';
    else if(/^(بال|وال)/.test(c)&&c.length>4) c=c.slice(3);
    else if(/^(لل|ال)/.test(c)&&c.length>3) c=c.slice(2);
    if(c.length>=2&&o.indexOf(c)<0) o.push(c);
  });
  return o;
}
function examNoms(){ return (typeof U8!=='undefined'&&U8&&U8.mots)||{}; }
/* un nom solaire : sa lettre double (chedda) et son ل est muet */
function examSol(m){ var t=Array.from(String(m.def).normalize('NFC')), l=0, i;
  for(i=0;i<t.length;i++){ if(/[ً-ْٰ]/.test(t[i])) continue; l++; if(l===3){ var r=''; for(i=i+1;i<t.length&&/[ً-ْٰ]/.test(t[i]);i++) r+=t[i]; return r.indexOf('ّ')>=0; } }
  return false; }
function examProche(a,b){ var M=examNoms(); if(a===b||!M[a]||!M[b]) return false;
  return EXAM_GLOSES_PROCHES.some(function(g){ return g.indexOf(M[a].fr)>=0&&g.indexOf(M[b].fr)>=0; }); }
/* la famille d'un écran : deux écrans de la même ne se suivent jamais */
function examFam(p){
  if(!p) return '';
  if(p.type==='u8') return 'u8/'+p.u8.t;
  if(p.type==='mcq'){ var t=String(p.prompt).replace(/<[^>]*>/g,'');
    return /^Choisis ce mot avec/.test(t)?'mcq/avecAl':/^Que veut dire/.test(t)?'mcq/sens':/^Lis le mot/.test(t)?'mcq/son':'mcq/harf'; }
  if(p.type==='clavier-arabe') return p.erronee?'clavier/corrige':p.dictee?'clavier/dictee':(p.pieges&&p.pieges.length)?'clavier/ecrireU8':'clavier/ecrire';
  return p.type;
}
/* l'empreinte d'un écran en noyaux de mots : R = ce qu'il DEMANDE (réponse, cible, nom), V = tout ce qu'il MONTRE (énoncé, image, options,
   explication, plus R : une réponse se montre une fois donnée). Un écran de l'unité 8 ne porte que la clé du nom : sa forme arabe s'en déduit. */
function examFiche(p){
  var R=[], V=[], M=examNoms();
  var met=function(a,s){ examCores(s).forEach(function(c){ if(a.indexOf(c)<0) a.push(c); }); };
  var tout=function(o,a){ if(o==null) return;
    if(typeof o==='string') return met(a,o);
    if(typeof o!=='object') return;
    Object.keys(o).forEach(function(k){ if(k!=='son'&&k!=='sonRep'&&k!=='nom'&&k!=='origine') tout(o[k],a); }); };
  var t=p.type;
  if(t==='u8'){
    var s=p.u8, k=(s.t==='deuxecrits'||s.t==='deuxsons')?(s.cible||s.w):s.w, m=k&&M[k];
    if(m){ met(R,m.def); met(V,m.nu); met(V,m.def); } else { tout(s,V); V.forEach(function(c){ R.push(c); }); }
  } else if(t==='mcq'){
    tout([p.prompt,p.glyph,p.explain,p.why],V);
    (p.options||[]).forEach(function(o){ tout([o.ar,o.txt,o.snd],V); });
    met(R,/[؀-ۿ]/.test(String(p.answer))?p.answer:p.glyph);
  } else if(t==='clavier-arabe'){
    met(R,p.cibleAr); tout([p.erronee,p.enonce,p.explication,p.formes],V);
  } else if(t==='scene-bulle'){
    /* ce qu'il DEMANDE : la FORME posée dans la bulle ou choisie parmi des cartes (glisser, choisir, toucher : reconnue d'avoir été vue ailleurs). Toucher un mot
       (mots) ou répondre par une phrase française (qui) ne demande aucun mot arabe : la phrase est tout entière sur l'écran, la réponse est sa structure */
    var ch=(p.choix||[])[p.bonne];
    if((p.geste==='glisser'||p.geste==='choisir'||p.geste==='toucher')&&ch) met(R,ch.mot);
    tout(p,V);
  } else if(t==='explorer-traduire'||t==='trier-colonnes'){
    tout(p,V);       /* l'arabe se MONTRE ; la réponse est française (la traduction) ou une colonne : aucun mot arabe n'est demandé */
  } else if(t==='association-mots'){
    tout([p.question,p.enonce],V);
    (p.rounds||[]).forEach(function(r){ met(R,r.texte); tout(r.texte,V);
      (r.choix||[]).forEach(function(c,i){ var x=c.visuel||c.texte||c.mot||c.ar||''; met(V,x); if(i===r.bonne) met(R,x); }); });
  } else if(t==='ordonner-blocs'){
    met(R,p.sens==='fr-ar'?p.cible:p.enonce); tout([p.enonce,p.sens==='fr-ar'?[p.blocs,p.distracteurs,p.cible]:null],V);
  } else if(t==='choisir-harakat'){
    (p.rounds||[]).forEach(function(r){ met(R,r.mot); }); tout(p.harf,V);
  } else if(t==='grammaire-annexion'){
    /* demandé : le mot montré, et la réponse de chaque question qui porte sur une FORME (« Quel est le génitif de … ? » : الْعَالَمِينَ) — jamais sur un rôle (« Quel est le rôle de … ? ») */
    met(R,p.enonce||p.mot); (p.questions||[]).forEach(function(q){ if(!/rôle/.test(q.texte||'')) met(R,(q.choix||[])[q.bonne]); }); tout(p,V);
  } else { tout(p,V); V.forEach(function(c){ R.push(c); }); }
  R.forEach(function(c){ if(V.indexOf(c)<0) V.push(c); });
  return {R:R,V:V};
}
/* Combien d'éléments l'élève ORDONNE, TOUCHE ou CHOISIT dans un écran (-1 : ne s'applique pas). Sous trois, l'erreur y est quasi impossible : deux blocs, l'ordre
   se devine ; deux mots dont le français nomme l'un, l'autre est la réponse ; deux cartes, une chance sur deux sans rien savoir (Myriam, 25/11 : « il n'y a que deux mots
   donc erreur impossible »). Toucher un mot d'un verset : seuls les mots qui RÉPONDENT comptent (un mot inerte se touche sans rien coûter). Les blocs comptés sont les JUSTES (les leurres s'écartent d'un coup d'œil) ; examControle exige EXAM_ELEMENTS_MIN, sauf les choix
   binaires PAR CONCEPTION de la leçon (examBinaire). (journal : parcours.js · l'évaluation sans erreur impossible) */
var EXAM_ELEMENTS_MIN=3;
function examElements(p){
  var t=p.type, g=p.geste;
  if(t==='ordonner-blocs') return (p.blocs||[]).length;
  if(t==='explorer-traduire') return (p.traduction||[]).length;
  if(t==='scene-bulle'){
    if(g==='mots'){
      /* en mode verset (sans écoute), un mot qui n'est ni cible ni piège est INERTE : un toucher dessus ne fait rien et ne coûte rien (scene-bulle : `inerte`). Seuls comptent les mots qui RÉPONDENT */
      if(p.verset&&!p.ecoute){ var rep={}; (p.cibles||[]).concat(p.pieges||[]).forEach(function(x){ rep[x.p+'/'+x.m]=1; }); return Object.keys(rep).length; }
      return (p.passages||[]).reduce(function(a,x){ return a+(x&&!x.contexte?String(x.phrase||'').trim().split(/\s+/).length:0); },0);
    }
    if(g==='glisser'||g==='choisir'||g==='qui'||g==='toucher') return (p.choix||[]).length;
  }
  if(t==='association-mots'&&(p.rounds||[]).length===1) return (p.rounds[0].choix||[]).length;
  if(t==='mcq') return (p.options||[]).length;
  if(t==='grammaire-annexion'&&p.mode==='regle'&&(p.questions||[]).length===1) return (p.questions[0].choix||[]).length;
  if(t==='grammaire-annexion'&&p.mode==='decouvrir') return String(p.mot||'').trim().split(/\s+/).length;
  if(t==='trier-colonnes') return (p.colonnes||[]).length;
  if(t==='u8'&&(p.u8.t==='article'||p.u8.t==='deuxecrits'||p.u8.t==='fin')) return 2;   // deux cartes, deux écritures, deux disques (ḍamma ou tanwīn)
  return -1;
}
/* les gestes de la leçon qui SONT un choix à deux : une carte et deux colonnes (le tri), deux écritures du même mot (l'article, l'œil), deux disques (ḍamma ou tanwīn : défini ou
   indéfini), les deux mots d'une annexion dont on nomme le rôle. Ils restent : l'erreur y est possible (une chance sur deux au hasard) et c'est la leçon même.
   ⚠️ Plus d'exception au niveau 10 : « La corde est à l'âne » (deux choix, لِ + nom ou annexion) est devenue un écran à TROIS choix (Myriam, 25/11, Q19 : « oui, un écran à trois choix à la place »). */
function examBinaire(p,niveau){
  return p.type==='trier-colonnes'||(p.type==='u8'&&(p.u8.t==='article'||p.u8.t==='deuxecrits'||p.u8.t==='fin'))||(p.type==='grammaire-annexion'&&p.mode==='decouvrir');
}
/* combien de réponses un écran fait JUGER : une seule dans un test (une erreur ne doit coûter qu'une qatra et n'être comptée qu'une fois) ;
   les types listés (ou le geste « corriger » / « relier » de scene-bulle) se jouent en plusieurs gestes */
function examGestes(p){
  if(p.type==='trier-colonnes') return (p.cartes||[]).length;
  if(p.type==='scene-bulle') return p.geste==='mots'?Math.max((p.cibles||[]).length,1):(p.geste==='corriger'||p.geste==='relier')?2:1;
  return ['apparier-formes','chasse-fatiha','analyse-etiquettes','lanceur-mots'].indexOf(p.type)>=0?2:1;
}
/* LE CONTRÔLE : tout ce que le test assemblé doit respecter, en un seul endroit (le banc le rejoue sur des centaines de tirages).
   Rend la liste des violations, vide quand le test est bon. */
function examControle(q,niveau){
  var v=[], n=q.length, M=examNoms(), CLES=Object.keys(M), F=[], fam=[], i, j;
  var nf=function(s){ return String(s).normalize('NFC'); };
  if(n!==20) v.push(n+' écrans au lieu de 20');
  for(i=0;i<n;i++) if(!q[i]) return v.concat('le rang '+(i+1)+' est vide');
  q.forEach(function(p,k){ fam[k]=examFam(p); F[k]=examFiche(p); });
  var clv=function(k){ return q[k].type==='clavier-arabe'; }, ou=function(k){ return 'écran '+(k+1)+' ('+fam[k]+')'; };
  /* l'ordre : un geste simple d'abord, jamais deux écrans de la même famille ni deux écrans au clavier de suite */
  if(clv(0)) v.push('le test s’ouvre sur un écran au clavier');
  for(i=1;i<n;i++){
    if(fam[i]===fam[i-1]) v.push('deux écrans « '+fam[i]+' » de suite (rangs '+i+' et '+(i+1)+')');
    if(clv(i)&&clv(i-1)) v.push('deux écrans au clavier de suite (rangs '+i+' et '+(i+1)+')');
  }
  /* ce qui est déjà montré ne se redemande jamais : la réponse d'un écran ne figure dans aucun autre, sous aucune forme */
  for(i=0;i<n;i++) for(j=0;j<n;j++) if(i!==j){
    var c=F[i].R.filter(function(x){ return F[j].V.indexOf(x)>=0; });
    if(c.length) v.push('fuite : « '+c.join(' ')+' » ('+ou(i)+') figure dans '+ou(j));
  }
  /* un nom de l'unité 8 ne sert que dans un écran (redit ici pour nommer le coupable) */
  CLES.forEach(function(k){ var cs=examCores(M[k].def), n8=[];
    q.forEach(function(p,x){ if(cs.length&&F[x].R.indexOf(cs[0])>=0) n8.push(x+1); });
    if(n8.length>1) v.push('le nom « '+k+' » de l’unité 8 sert dans '+n8.length+' écrans (rangs '+n8.join(', ')+')'); });
  var defs=CLES.map(function(k){ return nf(M[k].def); }), nus=CLES.map(function(k){ return nf(M[k].nu); }), sD=0, sN=0;
  q.forEach(function(p,k){
    if(typeof p.origine!=='number') v.push(ou(k)+' : pas d’unité d’origine');
    /* le volet d'un bilan : `bilan` (unités 9 et 11) ou un `fin` à titre (unité 10) ; un `fin` sans titre est la fin COMPACTE de l'écran (compacterFin) */
    if(p.bilan||(p.fin&&p.fin.titre)) v.push(ou(k)+' : volet de fin d’un bilan');
    if(p.rounds&&p.rounds.length>1) v.push(ou(k)+' : plusieurs manches (plusieurs gestes)');
    if(examGestes(p)>1) v.push(ou(k)+' : plusieurs gestes (une seule réponse jugée par écran)');
    if(p.type==='u8'&&(p.u8.t==='quiz'||p.u8.t==='deuxsons')) v.push(ou(k)+' : un écran-règle, un quiz ou une prise fautive n’a pas sa place ici');
    if(p.type==='choisir-harakat'&&p.aideMs!==0) v.push(ou(k)+' : l’aide minutée donne la réponse');
    if(p.type==='explorer-traduire'&&!p.sansAide) v.push(ou(k)+' : toucher un mot ouvre sa traduction (l’aide donne la réponse)');
    var el=examElements(p); if(el>=0&&el<EXAM_ELEMENTS_MIN&&!examBinaire(p,niveau)) v.push(ou(k)+' : '+el+' élément(s) à ordonner, toucher ou choisir (au moins '+EXAM_ELEMENTS_MIN+') : l’erreur y est quasi impossible');
    if(clv(k)&&p.tachkilFacultatif!==true) v.push(ou(k)+' : une marque absente compterait fausse');
    if(fam[k]==='clavier/corrige'){
      if(p.consigne!=='Corrige l’orthographe.'||!p.enonce||!p.explication||p.corrigeEnPlace!==true) v.push(ou(k)+' : « Corrige » sans consigne unique, énoncé, explication ou correction en place');
      if(nf(p.erronee)===nf(p.cibleAr)) v.push(ou(k)+' : la graphie « fautive » est la bonne');
      /* Q7 (Myriam, 25/11) : la réponse PART de la faute — le clavier s'ouvre sur la graphie fautive (`depart`), l'élève la corrige en place ; le jury juge la chaîne FINALE (corrigeEnPlace) */
      if(typeof p.depart!=='string'||nf(p.depart)!==nf(p.erronee)) v.push(ou(k)+' : « Corrige » dont la réponse ne part pas de la graphie fautive (depart)');
    }
    if(fam[k]==='mcq/sens'){
      var ks=[]; (p.options||[]).forEach(function(o){ CLES.forEach(function(x){ if((M[x].un===o.txt||M[x].le===o.txt)&&ks.indexOf(x)<0) ks.push(x); }); });
      ks.forEach(function(a){ ks.forEach(function(b){ if(a<b&&examProche(a,b)) v.push(ou(k)+' : « '+M[a].fr+' » et « '+M[b].fr+' » ensemble'); }); });
      if(defs.indexOf(nf(p.glyph))>=0) sD++; else if(nus.indexOf(nf(p.glyph))>=0) sN++;
    }
    if(fam[k]==='clavier/ecrireU8'){ var cle=CLES.filter(function(x){ return nf(M[x].nu)===nf(p.cibleAr)||nf(M[x].def)===nf(p.cibleAr); })[0];
      if(cle&&CLES.some(function(x){ return examProche(cle,x); })) v.push(ou(k)+' : « '+M[cle].fr+' » a deux arabes justes'); }
  });
  if(!sD&&!(EXAM_PLANS[niveau]||{}).sansSens) v.push('aucun « Que veut dire ce mot ? » sur un mot défini');
  if(niveau===8&&!sN) v.push('aucun « Que veut dire ce mot ? » sur un mot indéfini');
  var nt=examNotions(q), mn=(EXAM_PLANS[niveau]||{}).min||{}, mx=(EXAM_PLANS[niveau]||{}).max||{};
  Object.keys(mn).forEach(function(k){ if(nt[k]<mn[k]) v.push('notion « '+k+' » : '+nt[k]+' écran(s) au lieu de '+mn[k]+' au moins'); });
  /* ce que le test ne dépasse JAMAIS (EXAM_PLANS[niveau].max) : aux niveaux 9 et 10, deux « Corrige » au plus (Myriam, 25/11, préview v5, Q24). Le message ne commence pas par « notion » :
     examGrammaire ne jette pas un test pour un « Corrige » de trop, il préfère le test qui n'en a que deux */
  Object.keys(mx).forEach(function(k){ if(nt[k]>mx[k]) v.push('plus de '+mx[k]+' écrans « '+k+' » : '+nt[k]); });
  return v;
}
/* tout ce que l'évaluation d'un niveau peut prendre, chaque écran avec ses étiquettes (examChoisir pioche par étiquette) */
function examPool(niveau){
  var C=[], M=examNoms(), CLES=Object.keys(M), T={}, E=Object.assign({},EXAM_U9,examFautes(EXAM_U9));
  var nu=function(s){ return String(s).normalize('NFC').replace(/[ً-ْٰ]/g,''); };
  var nf=function(s){ return String(s).normalize('NFC'); };
  var ajoute=function(p,tags){ if(p) C.push({p:p,tags:tags}); };
  /* un écran d'un disque (construit une fois par appel) : son unité d'origine, la tachkīl facultative au clavier ; le français à rendre en arabe y est
     doré comme dans tout le test (les leçons des unités 9 et 10 l'écrivent en gris, 17 et 18 px) */
  var pas=function(ui,k,r){ var d=T[ui+'/'+k]||(T[ui+'/'+k]=discsFor(ui)[k-1].build()), p=d[r];
    if(p){ p.origine=ui; if(p.type==='clavier-arabe'){ p.tachkilFacultatif=true; if(p.enonce) p.enonceDore=true; if(EXAM_CONSIGNES_FR_AR.indexOf(p.consigne)>=0) p.consigne=EXAM_CONSIGNE_ECRIS; } } return p; };
  var permises=['ا','و','ي','ة','ئ'];
  UNITS.slice(0,7).forEach(function(V){ (V.letters||[]).forEach(function(l){ if(permises.indexOf(l)<0) permises.push(l); }); });
  var clavier=function(o){ var c=nf(o.cibleAr), b={type:'clavier-arabe',coeurs:true,permises:permises,tachkilFacultatif:true,
      lettres:nu(c).replace(/\s/g,'').split('').filter(function(l,j,a){ return a.indexOf(l)===j; })};
    for(var k in o) b[k]=o[k]; b.cibleAr=c; return b; };
  var unites=function(s){ var o=[]; Array.from(nf(s)).forEach(function(c){ if(/[ً-ْٰ]/.test(c)&&o.length) o[o.length-1].m+=c; else o.push({l:c,m:''}); }); return o; };
  /* « choisis ce mot avec الـ » : le juste, le tanwīn gardé, la mauvaise famille, le nom sans الـ avec ـُ (Myriam, 18/11) */
  var avecAl=function(m){
    var d=nf(m.def), o=unites(d), sol=examSol(m);
    if(sol){ o[1].m='ْ'; o[2].m=o[2].m.replace('ّ',''); } else { o[1].m=''; o[2].m='ّ'+o[2].m; }
    var faux=[d.replace(/ُ$/,'ٌ'), nf(o.map(function(x){ return x.l+x.m; }).join('')), nf(m.nu).replace(/ٌ$/,'ُ')];
    return mcq({prompt:'Choisis ce mot avec <span class="ar">الـ</span>.',glyph:m.nu,glyphLinear:true,graded:true,grid:'grid2',answer:d,origine:7,
      options:balancePos(shuffle([d].concat(faux).map(function(x){ return {ar:x,key:x}; })),d)});
  };
  /* le sens : « un » ou « le » du même nom, et d'un autre nom (en français seulement) qui ne dit pas la même chose */
  var sens=function(m,autre,avec){ var g=avec?m.le:m.un;
    return mcq({prompt:'Que veut dire ce mot ?',glyph:avec?m.def:m.nu,glyphLinear:true,graded:true,grid:'grid2 sens4',answer:g,origine:7,
      options:balancePos(shuffle([m.un,m.le,autre.un,autre.le].map(function(x){ return {txt:x,key:x}; })),g)}); };
  /* l'écriture : ا, ل, ـُ et ـٌ toujours offerts, sinon le clavier dirait s'il faut l'article */
  var ecrireU8=function(m,avec){ return clavier({consigne:EXAM_CONSIGNE_ECRIS,enonce:avec?m.le:m.un,enonceDore:true,cibleAr:avec?m.def:m.nu,
      son:urlDuSon('mot-'+(avec?m.ad:m.an)),toujours:['ا','ل'],pieges:['damma','dammatayn'],origine:7}); };
  /* l'unité 11, disque 6 : « Touche le mot faux, puis corrige-le » (deux gestes) devient un « Corrige l'orthographe. » au clavier — la phrase fautive,
     la forme juste, le sens et la prise sont ceux du défi, rien n'est retapé ; la faute est de LETTRE (le ة du féminin oublié) */
  var corrigeU11=function(d){ return clavier({mode:'mot',consigne:'Corrige l’orthographe.',enonce:d.enonce,enonceDore:true,cibleAr:d.resultat,erronee:d.phrase,depart:d.phrase,
      explication:d.erreurChoix,corrigeEnPlace:true,son:d.son,origine:10,
      toujours:nu(d.phrase).split('').filter(function(l){ return nu(d.resultat).indexOf(l)<0&&l!==' '; })}); };
  /* l'unité 11, disque 7 : « Range chaque groupe » (six cartes) réduit à UNE carte, sans l'encadré final (il parle d'une autre carte et donnerait la raison
     d'un autre écran) ; le terme arabe de la colonne se lit et s'entend une fois la carte posée */
  var nommerU11=function(d,k){ return {type:'trier-colonnes',consigne:'Range ce groupe.',blanc:true,jeton:'brut',coeurs:true,motFs:22,erreur:d.erreur,
      colonnes:d.colonnes,cartes:[d.cartes[k]],origine:10}; };
  var r, p;
  /* ── l'unité 8 : D5 (poser l'article, les 14 noms), D6 (l'œil, 7 noms), D1 et D3 (la terminaison) ; jamais l'oreille (prise fautive) ── */
  for(r=0;(p=pas(7,5,r));r++) if(p.u8.t==='article'&&M[p.u8.w]) ajoute(p,['article','cum8A',examSol(M[p.u8.w])?'artSol':'artLun']);
  for(r=0;(p=pas(7,6,r));r++) if(p.u8.t==='deuxecrits'&&M[p.u8.cible||p.u8.w]) ajoute(p,['ecr','cum8A',examSol(M[p.u8.cible||p.u8.w])?'ecrSol':'ecrLun']);
  [1,3].forEach(function(k){ for(var x=0;(p=pas(7,k,x));x++) if(p.u8.t==='fin') ajoute(p,['fin',p.u8.def?'finDef':'finNu']); });
  CLES.forEach(function(k){
    if((EXAM_SANS_AVECAL[niveau]||[]).indexOf(k)<0) ajoute(avecAl(M[k]),['avecAl']);
    var autres=CLES.filter(function(x){ return x!==k&&!examProche(k,x); });
    [false,true].forEach(function(avec){ if(autres.length) ajoute(sens(M[k],M[shuffle(autres)[0]],avec),['sens',avec?'sensDef':'sensNu']);
      if(!CLES.some(function(x){ return examProche(k,x); })) ajoute(ecrireU8(M[k],avec),['ecrireU8']); });
  });
  /* ── les mots des unités 1 à 7 : deux tirages du test de l'unité 7 (quatre au niveau 11 : ses douze écrans de l'unité 11 laissent peu de mots compatibles), rangés par type (le « corrige » y reste : marques facultatives) ── */
  [0,1].concat(niveau>=11?[2,3]:[]).forEach(function(){ (examVocabulaire(6)||[]).forEach(function(q){ var f=examFam(q), t=f==='mcq/sens'?'17sens':f==='mcq/son'?'17son':f==='clavier/dictee'?'17dictee':f==='clavier/ecrire'?'17ecrire':null;
    if(t) ajoute(q,[t]); }); });
  /* ── l'unité 9 : le sens du harf, la terminaison (une manche, sans l'aide minutée qui donne la réponse), le clavier, les blocs ── */
  if(niveau>=9){
    [[1,[10,12]],[2,[12,13,14]],[3,[5,6,7,12,13,14]],[4,[12,13,14]]].forEach(function(d){ d[1].forEach(function(x){ ajoute(pas(8,d[0],x),['harfSens']); }); });
    ajoute(mcq({prompt:'Choisis la bonne traduction : « Le stylo est sur le bureau. »',graded:true,grid:'grid3',answer:E.maktab,origine:8,
      options:balancePos(shuffle([E.maktab,E.maktabLi,E.maktabInv].map(function(x){ return {ar:x,key:x}; })),E.maktab)}),['harfChoix','harfSens']);
    [[5,11],[6,10],[7,11]].forEach(function(d){ var st=pas(8,d[0],d[1]);
      if(st) st.rounds.forEach(function(m){ ajoute(Object.assign({},st,{rounds:[m],aideMs:0}),['term','term'+d[0]]); }); });
    [12,13].forEach(function(x){ ajoute(pas(8,9,x),['trad']); });                       /* #14 (« Sur eux ») porte le volet de fin du bilan : jamais en évaluation */
    [9,10,11].forEach(function(x){ ajoute(pas(8,9,x),['ordonner']); });
    /* « Corrige » à SA PLACE : la saisie doit porter la bonne marque là où la graphie fautive se trompait (corrigeEnPlace), sinon retaper
       les lettres suffisait ; une seule consigne, l'énoncé français et l'explication toujours là (Myriam, 18/11 : décision n° 5) */
    var CORRIGE={bint:'Regarde لِ devant الـ.',rumm:'Regarde la fin du nom après le harf.',tayr:'Regarde la fin du premier mot.'};
    ['bint','rumm','tayr'].forEach(function(cle){ ajoute(clavier({mode:'mot',consigne:'Corrige l’orthographe.',enonce:E.fr[cle],enonceDore:true,cibleAr:E[cle],
      erronee:E[cle+'Faux'],depart:E[cle+'Faux'],explication:CORRIGE[cle],corrigeEnPlace:true,son:E.son[cle],origine:8,
      toujours:nu(E[cle+'Faux']).split('').filter(function(l){ return nu(E[cle]).indexOf(l)<0&&l!==' '; })}),['corrige']); });
  }
  /* ── l'unité 10 : le bilan (les écrans à un seul geste) ── */
  if(niveau>=10){
    var REGARDE={3:'Regarde le premier mot.',5:'Regarde la fin du second mot.'};
    /* Q19 (Myriam, 25/11, préview v5 : « oui, un écran à trois choix à la place » ; préview v1 : « 3 choix mais on garde comment sont écrites les 2 premières lignes (blanche et jaune et bien centrée)
       [...] on garde aussi la graisse du texte en arabe sur les boutons ») : « La corde est à l'âne » (D9 #4 de l'unité 10, DEUX choix : لِ + nom ou annexion) reste LE MÊME écran — la consigne blanche, l'énoncé jaune,
       les cartes de l'association — avec UNE carte de plus dans sa donnée : les deux termes INVERSÉS (examInverse : la graphie fautive est produite par règle, jamais retapée), étiquetée « l'âne est à la corde » comme
       les deux autres le sont. La COPIE du test seulement : le disque en production garde ses deux cartes ; au niveau 11, l'écran à deux choix quittait déjà le pool (moins de trois éléments).
       (journal : parcours.js · l'écran à trois choix du niveau 10) */
    var cordeTroisChoix=function(x){
      var r=x&&x.rounds&&x.rounds.length===1&&x.rounds[0], tx=function(c){ return nf(String((c&&(c.visuel||c.texte||c.mot||c.ar))||'').replace(/<[^>]*>/g,'')); };
      if(!r||!r.choix||r.choix.length!==2||!x.enonce) return null;
      var modele=r.choix[r.bonne], bonne=tx(modele), inverse=examInverse(bonne);
      if(!bonne||!inverse||typeof modele.visuel!=='string') return null;
      var neuf=Object.assign({},modele,{visuel:modele.visuel.replace(/>[^<]+</,function(){ return '>'+inverse+'<'; }),etiquette:'l’âne est à la corde'});
      return Object.assign({},x,{rounds:[Object.assign({},r,{choix:r.choix.concat([neuf])})]}); };
    [[0,'annAssoc'],[4,'annAssoc'],[9,'annAssoc'],[3,'corrige10'],[5,'corrige10'],[2,'nommer'],[7,'nommer'],[12,'nommer'],
     [1,'trad10'],[8,'trad10'],[11,'trad10'],[6,'ordonner10']].forEach(function(d){ var x=pas(9,9,d[0]);
      if(x&&d[0]===4&&d[1]==='annAssoc'&&niveau===10){ ajoute(cordeTroisChoix(x),['annAssoc']); return; }
      if(x&&d[1]==='corrige10'){ x.mode='mot'; x.consigne='Corrige l’orthographe.'; x.enonce=x.fr.charAt(0).toUpperCase()+x.fr.slice(1); x.enonceDore=true;
        x.explication=REGARDE[d[0]]; x.corrigeEnPlace=true; x.depart=x.erronee; }
      ajoute(x,[d[1]]); });
  }
  /* ── l'unité 11 : sept écrans de bulle, le clavier, le tri d'un groupe, la traduction dans les deux sens (le plan du 23/11, un geste chacun) ──
     Une étiquette est une NOTION et porte ses variantes déjà en production, [disque, rang] : le plan fixe les notions, le tirage choisit la variante
     (avec un seul écran par étiquette, 11 écrans sur 20 revenaient à chaque test : mesuré sur 800 tirages). Chaque variante garde le geste et la notion
     de son étiquette (examNotions) ; le banc nomme celle dont le rang a bougé (SIGNATURES). (journal : parcours.js · la variété du niveau 11) */
  if(niveau>=11){
    var VAR11={
      pronomTu:[[9,0],[1,13],[1,14],[3,10]],             // « toi » : le pronom à glisser dans la bulle (D9 #0), ou à toucher parmi trois ou quatre formes (D1 #13, #14 : « ta maison » ; D3 #10 : « c’est vous que… »)
      pronomLeur:[[9,1],[2,6],[1,9],[1,10],[1,12],[1,15]],  // le pronom collé : « leur stylo » à glisser (2,6 : le suffixe seul, jamais avec « Qui est désigné par ـهِمْ »), ou « notre, leur, ma » à toucher (D1)
      transforme:[[9,6],[5,5],[5,6],[5,7],[5,8],[5,9]],  // « Transforme en : … » (au clavier)
      accordToucher:[[9,14],[9,13],[8,0],[8,18],[8,19]],  // toucher le nom décrit, ou le mot qui décrit (au moins trois mots QUI RÉPONDENT : D7 #8 et #9 n'ont que deux mots ; D9 #13 et #14, D8 #19 deux mots actifs sur un verset — examElements les écarte du pool)
      definiPourquoi:[[9,15],[8,22]],                    // pourquoi le mot qui décrit porte l'article, ou pourquoi un nom n'en porte pas
      fatihaGenitif:[[8,7],[8,4],[8,23],[3,16],[3,17]],  // un mot de la Fātiḥa à toucher, sans rôle (avec un rôle, examNotions le compte comme accord) : ce qui explique un génitif, ce qui dit comment est Allah
      fatihaEux:[[9,21],[2,9],[3,8]],                    // qui est désigné par « eux » (verset 7), par « tu » (le même verset) ou par « nous » (اهْدِنَا) : le soulignement du PREMIER « sur eux » fait la réponse, ne jamais l'ôter
      tradAr:[[9,9],[9,4],[4,9],[4,13]]                  // arabe → français
    };
    Object.keys(VAR11).forEach(function(t){ VAR11[t].forEach(function(d){ ajoute(pas(10,d[0],d[1]),[t]); }); });
    [[3,6],[3,7],[3,13]].forEach(function(d){ ajoute(pas(10,d[0],d[1]),['nous']); });   // trois cartes à choisir : « nous adorons », « nous demandons le secours » (le préfixe de « nous »), la bonne écriture de « sur eux »
    [18,15,17].forEach(function(x){ var d=pas(10,6,x); if(d&&d.phrase&&d.resultat) ajoute(corrigeU11(d),['corrige11']); });   // la faute de LETTRE : ة oublié
    /* UNE carte du tri : indéfini (0) ou défini (2, 5) — pas la 4 (« بَيْتُنَا الْكَبِيرُ »), dont « Pourquoi … porte-t-il الـ ? » donne la raison ; les cartes 1 et 3 ne se tirent jamais (mesuré : 0 test sur 600) */
    var tri=pas(10,7,22); if(tri&&tri.cartes&&tri.colonnes) [0,2,5].forEach(function(x){ ajoute(nommerU11(tri,x),['rangerDefini']); });
    /* « Pourquoi الْكَبِيرُ porte-t-il الـ ? » : sa mauvaise explication (« Non : dans بَيْتٌ كَبِيرٌ, il n'en a pas. ») nommait une carte du tri : dans le TEST, elle cite un autre
       nom indéfini et son mot qui décrit (D7 #18 : صِرَاطٌ مُسْتَقِيمٌ, le moins montré ailleurs), jamais une carte du tri ; le disque en production ne change pas (Myriam, 25/11, question 3) */
    var ex=pas(10,7,18), exemple=ex&&ex.cible&&nf(ex.cible), cartesTri=((tri&&tri.cartes)||[]).map(function(c){ return nf(c.mot); });
    if(exemple) C.forEach(function(c){ var o=c.p.choix; if(c.tags.indexOf('definiPourquoi')<0||!o) return;
      c.p=Object.assign({},c.p,{choix:o.map(function(x){ var e=x.erreur&&nf(x.erreur); cartesTri.forEach(function(t){ if(e) e=e.split(t).join(exemple); }); return e&&e!==nf(x.erreur)?Object.assign({},x,{erreur:e}):x; })}); });
    /* français → arabe, les blocs : trois blocs et plus (D4 #5, #6 et #7 n'en ont que deux) — UN écran de cette notion, celui qui s'accorde avec les autres.
       Jamais tirés (mesuré : 0 test sur 600, en conflit avec les formes des écrans à toucher) : D4 #12 et #14, D6 #30, D9 #8 ; écartés plus tôt : D9 #12, D6 #31 et #32 */
    [[4,8],[4,10],[4,11]].forEach(function(d){ ajoute(pas(10,d[0],d[1]),['tradFr']); });   // au moins trois blocs à placer : D4 #5, #6 et #7 n'en ont que deux
    /* l'unité 10 : « Touche l'annexion » (le plan) ou « Touche le premier mot » (les rôles de l'annexion) : UN seul des deux, le premier ne s'accordant presque avec rien */
    C.forEach(function(c){ if(c.tags.indexOf('annAssoc')>=0||c.tags.indexOf('nommer')>=0) c.tags.push('annexion10'); });
  }
  /* ce qu'un TEST ne montre pas, même si la leçon le montre — les copies du test, jamais les disques en production :
     la note de DÉCOUVERTE d'une bulle (« ـكُمْ désigne « vous », pour plusieurs personnes. », D3 #10) est la réponse de son écran, écrite sous la scène : un test n'enseigne pas.
     ⛔ « parle à Mohamed (ou Maryam) de sa maison » garde ses QUATRE cartes, « ma maison » comprise (comptée fausse, comme au disque en production) : Myriam, 25/11, « oui, c'est clair »
     (la réponse est « ta maison »). Ne pas la retirer de nouveau. (journal : parcours.js · les copies du test) */
  C.forEach(function(c){ var o=c.p; if(!o) return;
    if(o.note){ o=Object.assign({},o); delete o.note; }
    c.p=o; });
  /* aucun écran à moins de trois éléments dans le pool (une propriété de l'écran seul : le tirage ne le choisirait que pour que le contrôle le rejette) */
  return C.filter(function(c){ var el=examElements(c.p); return !(el>=0&&el<EXAM_ELEMENTS_MIN&&!examBinaire(c.p,niveau)); });
}
/* l'ordre : un geste simple d'abord, jamais deux écrans de la même famille ni deux écrans au clavier de suite, sans rang fixe */
function examOrdonner(sel,C){
  var n=sel.length, fam=sel.map(function(i){ return examFam(C[i].p); }), clv=sel.map(function(i){ return C[i].p.type==='clavier-arabe'; });
  var rang=sel.map(function(_,k){ return k; }), res=[], pris=[], noeuds=0;
  var suite=function(){
    if(res.length===n) return true;
    if(++noeuds>4000) return false;
    var l=res.length?res[res.length-1]:-1;
    return shuffle(rang).some(function(k){
      if(pris[k]||(l<0&&clv[k])||(l>=0&&(fam[k]===fam[l]||(clv[k]&&clv[l])))) return false;
      pris[k]=true; res.push(k);
      if(suite()) return true;
      res.pop(); pris[k]=false; return false; });
  };
  if(!suite()) res=shuffle(rang);       // aucun ordre trouvé : le contrôle le dira, l'essai suivant recommence
  return res.map(function(k){ return sel[k]; });
}
/* ── LES REPRISES (Myriam, 25/11 : « ne pas redonner les mêmes questions si le user refait plusieurs fois le test et varier l'ordre ») ──
   MÉMOIRE : les trois derniers tirages de chaque test (niveau 8 à 11, unité 1 à 7), une clé d'APPAREIL comme le thème — jamais S, qui se synchronise avec le serveur ; doReset (comptes.js) la vide.
   Un tirage = les signatures ORDONNÉES de ses écrans ; signature = empreinte de ce que l'écran DEMANDE (sa famille et les noyaux de mots, à défaut ce qu'il montre), jamais l'objet : les écrans sont
   reconstruits à chaque appel. Le tirage préfère ce qui n'a pas été vu (au poids, puis le moins redit de quatre tests propres) et varie l'ordre ; un pool trop petit retombe sur ce qu'il y a, jamais
   sur une violation d'examControle. Lire et écrire sous try/catch : mémoire absente, illisible ou pleine, le test s'ouvre comme avant. (journal : parcours.js · les reprises du test) */
var EXAM_VUS_CLE='alaq_exam_vus', EXAM_VUS_TIRAGES=3, EXAM_ESSAIS_MEMOIRE=20, EXAM_PROPRES=4, EXAM_ORDRES=12;
/* par rang de dernière apparition (0 = l'essai d'avant, 1 = deux essais plus tôt, 2 = trois, 3 = jamais vu dans les derniers essais) : le POIDS d'un candidat au tirage, et ce qu'un écran déjà vu COÛTE au test */
var EXAM_POIDS_VUS=[1,2,4,8], EXAM_COUT_VUS=[4,2,1,0];
/* une empreinte courte (FNV-1a, 32 bits, en base 36) : trois tirages de vingt écrans par test tiennent en quelques Ko */
function examEmpreinte(s){ var h=2166136261, i; s=String(s); for(i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0).toString(36); }
/* ce qu'un écran DEMANDE, lisible : sa famille et les noyaux réclamés (R), à défaut ceux qu'il montre (V : un tri, une traduction ou une phrase à toucher ne réclament aucun mot arabe) */
function examCle(p,F){ F=F||examFiche(p); return examFam(p)+'|'+(F.R.length?F.R:F.V).slice().sort().join(' '); }
function examSignature(p,F){ return examEmpreinte(examCle(p,F)); }
/* la signature d'un écran des unités 1 à 7 avant même de le bâtir (le tirage de mots la lit) : la famille de son type et le noyau de son mot — celle qu'examSignature donnera de l'écran bâti */
var EXAM_FAM_TYPE={sens:'mcq/sens',dictee:'clavier/dictee',son:'mcq/son',ecrire:'clavier/ecrire',corrige:'clavier/corrige'};
function examSigMot(t,ar){ return examEmpreinte(EXAM_FAM_TYPE[t]+'|'+examCores(ar).sort().join(' ')); }
/* la mémoire d'UN test : une clé par niveau (n8 à n11) ou par unité (u1 à u7) ; des tirages de signatures, le plus récent d'abord */
function examVusCle(u){ var U=UNITS[u]; return !U?'':u<7?'u'+(u+1):'n'+examNiveau(U); }
function examVusSains(t){ return (Array.isArray(t)?t:[]).filter(function(x){ return Array.isArray(x)&&x.length<=40&&x.every(function(s){ return typeof s==='string'&&s.length<=12; }); }).slice(0,EXAM_VUS_TIRAGES); }
function examVusLire(u){
  try{ var k=examVusCle(u), o=JSON.parse(localStorage.getItem(EXAM_VUS_CLE)), t=k&&o&&typeof o==='object'?examVusSains(o[k]):[];
    return t.length?t:null; }catch(e){ return null; }
}
function examVusNoter(u,q){
  try{ var k=examVusCle(u); if(!k||!q||!q.length) return;
    var o=null; try{ o=JSON.parse(localStorage.getItem(EXAM_VUS_CLE)); }catch(e){}
    if(!o||typeof o!=='object'||Array.isArray(o)) o={};
    o[k]=[q.map(function(p){ return examSignature(p); })].concat(examVusSains(o[k])).slice(0,EXAM_VUS_TIRAGES);
    localStorage.setItem(EXAM_VUS_CLE,JSON.stringify(o)); }catch(e){}
}
/* signature → rang du dernier tirage où elle a paru (0 = le plus récent) ; ce qui n'y est pas n'a pas été vu */
function examAges(vus){ var a={}; (Array.isArray(vus)?vus:[]).forEach(function(t,k){ (Array.isArray(t)?t:[]).forEach(function(s){ if(!(s in a)) a[s]=Math.min(k,EXAM_VUS_TIRAGES-1); }); }); return a; }
/* un tirage : les écrans du plan, chacun compatible avec les précédents (K[i][j] : l'un montre la réponse de l'autre), le plus
   contraint d'abord (l'étiquette qui a le moins de candidats encore possibles), puis l'ordre. `vus` (examVusLire) : la mémoire des derniers tirages de CE test, ou rien */
function examTirage(C,K,plan,vus,info){
  var pris=[], reste=plan.slots.map(function(s){ return {tag:s[0],n:s[1]}; }), age=vus?examAges(vus):null;
  var libre=function(i){ return pris.indexOf(i)<0&&pris.every(function(j){ return !K[j][i]; }); };
  var possibles=function(tag){ var l=[]; C.forEach(function(c,i){ if(c.tags.indexOf(tag)>=0&&libre(i)) l.push(i); }); return l; };
  var hasard=function(l){ return l[Math.floor(Math.random()*l.length)]; };
  var sig=function(i){ return C[i].sig||(C[i].sig=examSignature(C[i].p)); };
  var rang=function(i){ var s=sig(i); return (s in age)?age[s]:EXAM_VUS_TIRAGES; };
  /* le plus FRAIS d'abord, au poids : ce qui n'a pas été vu aux derniers essais pèse le plus, ce qui est revenu à l'essai d'avant le moins (jamais zéro : un seul candidat reste tiré) */
  var choisir=function(l){
    if(!age) return hasard(l);
    var w=l.map(function(i){ return EXAM_POIDS_VUS[rang(i)]; }), x=Math.random()*w.reduce(function(a,b){ return a+b; },0), k=0;
    while(k<l.length-1&&x>=w[k]){ x-=w[k]; k++; }
    return l[k];
  };
  while(reste.length){
    var m=null;
    reste=reste.filter(function(r){ r.l=possibles(r.tag); if(!r.l.length) return false; if(!m||r.l.length<m.l.length) m=r; return true; });
    if(!m) break;
    pris.push(choisir(m.l));
    if(--m.n<=0) reste.splice(reste.indexOf(m),1);
  }
  var compte=function(tag){ return pris.filter(function(i){ return C[i].tags.indexOf(tag)>=0; }).length; };
  /* le remplissage : les étiquettes de `remplir` tour à tour. Avec la mémoire, un premier passage n'ajoute que ce qui n'a pas paru à l'essai d'AVANT (un « corrige » dont tous les
     écrans viennent de revenir passe son tour), un second complète comme avant : les plafonds et l'ordre des étiquettes ne changent pas, et les notions du plan viennent des `slots` */
  for(var etape=0;etape<(age?2:1)&&pris.length<20;etape++)
    for(var g=0;pris.length<20&&g<80;g++){
      var r=plan.remplir[g%plan.remplir.length], l=compte(r[0])<r[1]?possibles(r[0]):[];
      if(l.length&&(etape||!age||l.some(function(i){ var s=sig(i); return !(s in age)||age[s]>0; }))) pris.push(choisir(l));
    }
  /* l'ordre : jamais les mêmes écrans dans le même ordre que l'essai d'avant — aucun écran commun au MÊME rang (le meilleur de EXAM_ORDRES essais, dans les limites d'examOrdonner) */
  var ordre=examOrdonner(pris,C), dernier=vus&&vus[0];
  if(dernier){
    var fixes=function(o){ return o.filter(function(i,k){ return sig(i)===dernier[k]; }).length; }, f0=fixes(ordre);
    for(var t=0;t<EXAM_ORDRES&&f0>0;t++){ var o=examOrdonner(pris,C), f=fixes(o); if(f<f0){ f0=f; ordre=o; } }
  }
  if(info&&age) info.cout=pris.reduce(function(a,i){ return a+EXAM_COUT_VUS[rang(i)]; },0);   // ce que ce tirage redit, pour garder le moins redit des tests propres d'un pool
  return ordre.map(function(i){ return C[i].p; });
}
/* le niveau d'un test = le numéro de l'unité testée, plafonné au dernier plan écrit : la bulle de l'unité 12 teste l'unité 11 (startExam(10)) au niveau 11.
   ⛔ Sans EXAM_PLANS[11], elle recevrait le niveau 10 et finishExam validerait l'unité 11 sans l'avoir évaluée. L'unité 12 elle-même n'a aucune bulle
   (il n'y a pas d'unité 13) : sa garde `U.u12` ne sert qu'à lui rendre le plafond. (journal : parcours.js · l'évaluation de l'unité 11) */
function examNiveau(U){ var max=0; for(var k in EXAM_PLANS) if(+k>max) max=+k; return Math.min(U.no,max); }
function examGrammaire(u,vus){
  var U=UNITS[u];
  if(!U||!(U.u8||U.u9||U.u10||U.u11||U.u12)) return null;   // startExam(10), la bulle de l'unité 12, teste l'unité 11 ; `u12` : le plafond, aucune bulle ne l'appelle
  var niveau=examNiveau(U), meilleur=null, q, v;
  /* trois pools de trente essais : un pool dont une étiquette s'épuise (mesuré : 1 tirage sur 15 000 donnait 19 écrans) ne se retire pas
     autrement, les essais n'y changent que les choix, jamais les écrans disponibles. Les EXAM_ESSAIS_MEMOIRE premiers essais de chaque pool suivent la mémoire des reprises
     (`vus`) : on garde, parmi EXAM_PROPRES tests sans violation, le moins redit ; si aucun ne sort propre, les suivants tirent comme avant : la mémoire ne coûte jamais un test. */
  for(var tour=0;tour<3&&(!meilleur||meilleur.v.length);tour++){
    var C=examPool(niveau), F=C.map(function(c){ return examFiche(c.p); }), propres=0;
    var K=C.map(function(a,i){ return C.map(function(b,j){ return i!==j&&(F[i].R.some(function(x){ return F[j].V.indexOf(x)>=0; })||F[j].R.some(function(x){ return F[i].V.indexOf(x)>=0; })); }); });
    if(vus) C.forEach(function(c,i){ c.sig=examSignature(c.p,F[i]); });
    for(var essai=0;essai<30;essai++){
      var guide=vus&&essai<EXAM_ESSAIS_MEMOIRE, info={};
      q=examTirage(C,K,EXAM_PLANS[niveau],guide?vus:null,info); v=examControle(q,niveau);
      if(!meilleur||v.length<meilleur.v.length||(!v.length&&(info.cout||0)<(meilleur.cout||0))) meilleur={q:q,v:v,cout:info.cout};
      if(!v.length&&(!guide||++propres>=EXAM_PROPRES)) break;
      if(guide&&essai===EXAM_ESSAIS_MEMOIRE-1&&!meilleur.v.length) break;   // le moins redit des tests propres de ce pool, faute d'en trouver EXAM_PROPRES
    }
  }
  /* un test à moitié vide n'est pas un test, ni un test qui n'évalue pas l'unité testée ou une notion de son plan (un module absent) : finishExam validerait
     ce que le test n'a pas vu. Le lecteur (startExam) le dit à l'élève au lieu de l'ouvrir. */
  if(meilleur.q.length<10) throw new Error('évaluation de l’unité '+U.no+' : '+meilleur.q.length+' écran(s) seulement — '+meilleur.v[0]);
  if(!meilleur.q.some(function(p){ return p&&p.origine===niveau-1; })||meilleur.v.some(function(m){ return /^notion /.test(m); }))
    throw new Error('évaluation de l’unité '+U.no+' : l’unité testée n’est pas évaluée — '+meilleur.v[0]);
  return meilleur.q;
}

/* L'évaluation « AVANCER ICI ? » des unités 1 à 7 (Myriam, 18/11) : un test CUMULATIF et court. Cinq types d'écrans tournent,
   toujours dans cet ordre — le sens d'un mot, la dictée, le son d'un mot, le français → arabe, la graphie à corriger ;
   un mot ne paraît qu'une fois ; un écran sur deux vient de l'unité testée, l'autre des unités d'avant.
   Chaque écran porte `origine` (l'indice de l'unité de son mot) : finishExam s'en sert pour proposer une unité après un échec.
   ⛔ Un arabe juste n'est jamais compté faux, et rien ne donne la réponse d'un autre écran : les cinq filtres de `x.peut`.
   Garde : outils/verifier-examen.mjs. (journal : parcours.js · l'évaluation des unités 1 à 7) */
var EXAM_TYPES=['sens','dictee','son','ecrire','corrige'];
/* les mots des unités 1 à 7 qu'AUCUN test ne tire (clés de son : 'mot-dhahaba'), ni ici ni dans les écrans des unités 1 à 7 des tests 8 à 11 : VIDE. Myriam a tranché
   (25/11, préview v5, Q15 : « A, le garder », contre ma reco : ذَهَبَ, le verbe de l'unité 7, reste un mot des tests ; sa remarque du 24/11 était « le mot qu'on a vu c'est l'or »). Le banc vérifie qu'un mot écarté ne paraît nulle part,
   et que mot-dhahaba n'est PAS écarté. */
var EXAM_MOTS_ECARTES=[];
var EXAM_ECRANS=[12,12,16,16,20,20,20];
/* réutilisés dans les leçons de grammaire (unités 8 à 11) : tirés d'abord pour « écris » et « corrige » */
var EXAM_PRIORITE='mot-lin mot-yawm mot-umm mot-rabb mot-ayn mot-bab mot-alamoun mot-umr mot-din mot-iyyaka mot-naabudu mot-annas mot-maalik mot-bismi mot-alhamdu nom-arrahman-v2 nom-arrahim-v2 mot-sirat mot-mustaqim mot-nastain mot-anamta mot-ghayr mot-allah mot-ihdina mot-alladhina mot-alayhim mot-almaghdoubou mot-addalloun'.split(' ');
/* désignent Allah ou s'adressent à Lui : jamais écrits faux, ni cible ni leurre de « Que veut dire ce mot ? » */
var EXAM_SACRES='mot-rabb mot-iyyaka mot-maalik mot-malik nom-arrahman-v2 nom-arrahim-v2 mot-ahad mot-anamta mot-assamad mot-allah mot-ihdina mot-huwa mot-ilah'.split(' ');
/* UNE graphie fautive par mot, relue par le vérificateur d'arabe : [la forme, ce qui y est faux] — elle se MONTRE, jamais ne s'entend */
var EXAM_FAUTES={'mot-naml':['نِمْلٌ','haraka'],'mot-manal':['مَنَلٌ','prolongation'],'mot-manam':['مِنَامٌ','haraka'],'mot-nil':['نِلٌ','prolongation'],'mot-noun':['نُنٌ','prolongation'],'mot-lin':['نِينٌ','lettre'],'mot-yawm':['يَوَمٌ','soukoun'],'mot-layl':['لِيْلٌ','haraka'],'mot-lawn':['لِوْنٌ','haraka'],'mot-lawm':['لِوْمٌ','haraka'],'mot-umm':['أُوٌّ','lettre'],'mot-amin':['أَوِينٌ','lettre'],'mot-yamin':['يَمِنٌ','prolongation'],'mot-mamnoun':['وَمْنُونٌ','lettre'],'mot-arabi':['نَرَبِيٌّ','lettre'],'mot-ayn':['نَيْنٌ','lettre'],'mot-laban':['نَبَنٌ','lettre'],'mot-bab':['بَبٌ','prolongation'],'mot-nabi':['بَبِيٌّ','lettre'],'mot-amal':['عِمَلٌ','haraka'],'mot-alam':['نَالَمٌ','lettre'],'mot-alamoun':['عَلَمُونَ','prolongation'],'mot-aalim':['نَالِمٌ','lettre'],'mot-oulama':['عِلَمَاءُ','haraka'],'mot-amr':['أَوْرٌ','lettre'],'mot-rabi':['رِبِيعٌ','haraka'],'mot-dars':['رَرْسٌ','lettre'],'mot-karim':['لَرِيمٌ','lettre'],'mot-din':['دِنٌ','prolongation'],'mot-naabudu':['بَعْبُدُ','lettre'],'mot-annas':['النَّانُ','lettre'],'mot-kasaba':['كِسَبَ','haraka'],'mot-bismi':['نِسْمِ','lettre'],'mot-alhamdu':['الْحِمْدُ','haraka'],'mot-hasid':['حَسِدٌ','prolongation'],'mot-uqad':['حُقَدٌ','lettre'],'mot-waqaba':['وَنَبَ','lettre'],'mot-tariq':['طِرِيقٌ','haraka'],'mot-hatab':['حِطَبٌ','haraka'],'mot-sirat':['صِرَطٌ','prolongation'],'mot-mustaqim':['وُسْتَقِيمٌ','lettre'],'mot-nastain':['نَسَتَعِينُ','soukoun'],'mot-ghayr':['غِيْر','haraka'],'mot-sudur':['صَدُورٌ','haraka'],'mot-ghasiq':['غَاسَقٌ','haraka'],'mot-sabr':['طَبْرٌ','lettre'],'mot-ghayb':['غِيْبٌ','haraka'],'mot-tabba':['تِبَّ','haraka'],'mot-alladhina':['الَّذِنَ','prolongation'],'mot-alayhim':['عِلَيْهِمْ','haraka'],'mot-almaghdoubou':['الْمَغَضُوبُ','soukoun'],'mot-addalloun':['الضَّلُّونَ','prolongation'],'mot-audhu':['أَغُوذُ','lettre'],'mot-dhahaba':['ذِهَبَ','haraka']};
/* deux sens que le vérificateur d'arabe juge trop proches sans qu'ils partagent un mot : jamais dans le même test */
var EXAM_PROCHES=[['mot-maalik','mot-malik'],['mot-rabb','mot-malik'],['mot-iman','mot-din']];
var EXAM_REGARDE={haraka:'Regarde les harakāt.',soukoun:'Regarde le soukoun.',chedda:'Regarde la chedda.',prolongation:'Regarde les prolongations.',lettre:'Regarde les lettres.'};
function examVocabulaire(u,vus){
  if(!(u>=0&&u<=6)) return null;
  var mots=[], i;
  for(i=0;i<=u;i++) (UNITS[i].words||[]).forEach(function(w){ if(w.snd&&EXAM_MOTS_ECARTES.indexOf(w.snd)<0) mots.push({w:w,u:i}); });
  var n=Math.min(EXAM_ECRANS[u],mots.length);
  var nu=function(s){ return String(s).normalize('NFC').replace(/[\u064B-\u0652\u0670]/g,''); };
  var sacre=function(x){ return EXAM_SACRES.indexOf(x.w.snd)>=0; };
  var prio=function(x){ return EXAM_PRIORITE.indexOf(x.w.snd)>=0; };
  /* les mots PLEINS d'un sens (« une nuit noire » → nuit, noir) : deux mots qui en partagent un sont de la même famille */
  var VIDES=' un une des du de la le les l d à au aux en et ou que qui ce c est il elle a nous je tu on se s y ne pas pour celui ceux dont tout sur mot général ';
  mots.forEach(function(x){ x.pleins=String(x.w.fr).toLowerCase().replace(/[’']/g,' ').replace(/[^a-zà-ÿ ]/g,' ').split(/ +/)
    .filter(function(m){ return m&&VIDES.indexOf(' '+m+' ')<0; }).map(function(m){ return m.replace(/(es|e|s)$/,''); }); });
  var famille=function(x,y){ return x!==y&&(x.pleins.some(function(m){ return y.pleins.indexOf(m)>=0; })||
    EXAM_PROCHES.some(function(p){ return p.indexOf(x.w.snd)>=0&&p.indexOf(y.w.snd)>=0; })); };
  /* mêmes lettres nues, autres marques (عَالَمٌ « un monde » / عَالِمٌ « un savant ») : les marques sont facultatives au clavier, donc l'un se recopie, ou se corrige, d'après l'autre montré ailleurs
     dans le test : jamais ensemble. Seul le sens (`famille`) ne les séparait pas. (journal : parcours.js · les mots aux mêmes lettres) */
  var memesLettres=function(x,y){ return x!==y&&nu(x.w.w).replace(/\s/g,'')===nu(y.w.w).replace(/\s/g,''); };
  /* la dictée n'exige que ce que la voix dit : ni alif de liaison, ni alif suscrit */
  var dictable=function(x){ var m=String(x.w.w).normalize('NFC'); return !/^\u0627(?![\u064E\u064F\u0650])/.test(m)&&m.indexOf('\u0670')<0; };
  /* ce que chaque mot PEUT, calculé UNE fois (le tirage le relit à chaque écran) ; « écris » écarte un sens que deux mots
     appris traduisent : l'autre arabe serait juste aussi */
  var age=examAges(vus);
  mots.forEach(function(x){
    x.peut={sens:!sacre(x),dictee:dictable(x),son:true,ecrire:!mots.some(function(y){ return y!==x&&famille(x,y); }),
      corrige:!!EXAM_FAUTES[x.w.snd]&&!sacre(x)};
    x.prio=prio(x)?1:0;
    /* la signature de chaque (type, mot) : lue seulement quand une mémoire des reprises est donnée */
    if(vus){ x.sig={}; x.vu=EXAM_VUS_TIRAGES; EXAM_TYPES.forEach(function(t){ var s=x.sig[t]=examSigMot(t,x.w.w); if((s in age)&&age[s]<x.vu) x.vu=age[s]; }); }   // x.vu : le dernier essai où le MOT a paru, sous n'importe quel type
  });
  /* le tirage : chaque écran a son type (ils tournent) et sa source (l'unité testée un écran sur deux). Les mots se distribuent
     en commençant par les types les plus exigeants — la dictée d'abord — pour qu'aucun ne manque de mots ; au hasard parmi ceux
     qui PEUVENT ce type, le vocabulaire de la grammaire d'abord pour écrire et corriger. Avec une mémoire des reprises (`vus`), le mot
     le plus FRAIS d'abord SOUS CE TYPE (celui que cet essai-là n'a pas déjà montré, le plus ancien sinon), puis le vocabulaire de la grammaire. */
  var RARE=['dictee','ecrire','corrige','sens','son'];
  var affecter=function(){
    var cases=[], pris=[];
    for(var k=0;k<n;k++) cases.push({k:k,t:EXAM_TYPES[k%5],dernier:(k%2===0)||u===0});
    var libres=function(t){ return shuffle(mots.filter(function(x){ return pris.indexOf(x)<0&&x.peut[t]&&!pris.some(function(p){ return famille(p,x)||memesLettres(p,x); }); })); };
    cases.slice().sort(function(a,b){ return RARE.indexOf(a.t)-RARE.indexOf(b.t)||a.k-b.k; }).forEach(function(c){
      var l=libres(c.t);
      if(!l.length){ c.t='son'; l=libres('son'); }                 /* aucun mot pour ce type : le son, que tout mot peut */
      if(!l.length) return;
      var vivier=l.filter(function(x){ return (x.u===u)===c.dernier; });
      if(!vivier.length) vivier=l;
      var gram=c.t==='ecrire'||c.t==='corrige', frais=function(x){ var s=x.sig[c.t]; return (s in age)?age[s]:EXAM_VUS_TIRAGES; };
      if(vus) vivier.sort(function(a,b){ return (b.vu-a.vu)||(frais(b)-frais(a))||(gram?b.prio-a.prio:0); });   // le mot pas encore posé d'abord, puis pas encore posé SOUS CE TYPE, puis le vocabulaire de la grammaire
      else if(gram) vivier.sort(function(a,b){ return b.prio-a.prio; });
      c.x=vivier[0]; pris.push(c.x);
    });
    return cases.filter(function(c){ return c.x; });
  };
  var cases=affecter(), dernier=vus&&vus[0];
  /* l'ordre : jamais les mêmes écrans dans le même ordre que l'essai d'avant (les cinq types tournent toujours dans leur ordre : ce sont les mots qui changent de rang) */
  if(dernier){
    var fixes=function(cs){ return cs.filter(function(c,k){ return c.x.sig[c.t]===dernier[k]; }).length; }, f0=fixes(cases);
    for(var t=0;t<EXAM_ORDRES&&f0>0;t++){ var essai=affecter(), f=fixes(essai); if(f<f0){ f0=f; cases=essai; } }
  }
  /* les touches-leurres : les lettres apprises, rien d'autre (و et ي dès l'unité 1, en prolongations ; ة à l'unité 6) */
  var permises=['ا','و','ي'];
  for(i=0;i<=u;i++) (UNITS[i].letters||[]).forEach(function(l){ if(permises.indexOf(l)<0) permises.push(l); });
  if(u>=5) permises.push('ة');
  var nOpt=(u===0)?3:4;
  var communes=function(a,b){ var A=nu(a), c=0, vu={}; nu(b).split('').forEach(function(l){ if(A.indexOf(l)>=0&&!vu[l]){ vu[l]=1; c++; } }); return c; };
  var clavier=function(x,o){
    var w=x.w, base={type:'clavier-arabe',cibleAr:w.w,son:urlDuSon(w.snd),coeurs:true,permises:permises,origine:x.u,tachkilFacultatif:true,
      lettres:nu(w.w).replace(/\s/g,'').split('').filter(function(l,j,a){ return a.indexOf(l)===j; })};
    for(var c in o) base[c]=o[c];
    return base;
  };
  var ecran={
    /* les trois leurres : le sens d'autres mots qui RESSEMBLENT au mot à l'écrit, pour qu'il faille le lire */
    sens:function(x){
      var w=x.w, vus={}, opts=[]; vus[w.fr]=1;
      var cand=shuffle(mots.filter(function(y){ return y!==x&&!sacre(y)&&!famille(x,y); }));
      cand.sort(function(a,b){ return communes(b.w.w,w.w)-communes(a.w.w,w.w); });
      cand.forEach(function(y){ if(opts.length<nOpt-1&&!vus[y.w.fr]&&!opts.some(function(o){ return famille(o,y); })){ vus[y.w.fr]=1; opts.push(y); } });
      return mcq({prompt:'Que veut dire ce mot ?',glyph:w.w,glyphLinear:true,graded:true,grid:nOpt===3?'grid3':'grid2 sens4',answer:w.fr,origine:x.u,
        options:balancePos(shuffle([{txt:w.fr,key:w.fr}].concat(opts.map(function(y){ return {txt:y.w.fr,key:y.w.fr}; }))),w.fr)});
    },
    /* les sons proposés : d'abord ceux des mots qui se confondent avec le bon */
    son:function(x){
      var w=x.w, vus={}, opts=[]; vus[audioKey(w.w)]=1;
      var autres=mots.filter(function(y){ return y!==x&&!sacre(y); });
      var cand=autres.filter(function(y){ return (w.confus||[]).indexOf(y.w.w)>=0; })
        .concat(shuffle(autres.filter(function(y){ return y.u===x.u; })),shuffle(autres));
      cand.forEach(function(y){ var c=audioKey(y.w.w); if(opts.length<nOpt-1&&!vus[c]){ vus[c]=1; opts.push(y.w.w); } });
      return mcq({prompt:'Lis le mot, puis touche le bon son',glyph:w.w,glyphLinear:true,fr:w.fr,graded:true,spkOpts:true,
        grid:nOpt===3?'grid3 rtl3':'grid2 rtl3',answer:w.w,origine:x.u,
        options:balancePos(shuffle([{snd:w.w,key:w.w}].concat(opts.map(function(p){ return {snd:p,key:p}; }))),w.w)});
    },
    dictee:function(x){ return clavier(x,{mode:'mot',consigne:'Écoute… puis écris le mot',dictee:true,fr:x.w.fr}); },
    ecrire:function(x){ return clavier(x,{consigne:EXAM_CONSIGNE_ECRIS,enonce:x.w.fr,enonceDore:true}); },
    corrige:function(x){
      var f=EXAM_FAUTES[x.w.snd], juste=nu(x.w.w);
      /* corrigeEnPlace : une graphie qui ne se trompe que de MARQUE (21 sur 54) se corrige par la bonne marque à sa place ; retaper les lettres ne suffit plus */
      return clavier(x,{mode:'mot',consigne:'Corrige l’orthographe.',enonce:x.w.fr,enonceDore:true,erronee:f[0],depart:f[0],explication:EXAM_REGARDE[f[1]],corrigeEnPlace:true,
        toujours:nu(f[0]).split('').filter(function(l){ return juste.indexOf(l)<0; })});
    }
  };
  return cases.filter(function(c){ return c.x; }).map(function(c){ return ecran[c.t](c.x); });
}

/* L'AVERTISSEMENT des qatarāt (Myriam, 25/11, question 10 : « un avertissement court avant de commencer ») : un écran raté coûte une qatra, et le test s'arrête à la dernière (ecranRate,
   « Plus de cœurs »). Chaque test permet un nombre d'écrans ratés (`permis` : 15 % des écrans notés, arrondi en bas — 1 sur 9 ou 12, 2 sur 16, 3 sur 20 —, calculé par le lecteur sur CE test,
   comme finishExam), donc il faut permis + 1 qatarāt pour aller au bout. Avec `permis` qatarāt ou moins (et plus de zéro : à zéro, le test ne s'ouvre pas, c'est « Plus de cœurs »), le test peut
   s'arrêter alors que les erreurs permises ne sont pas épuisées : l'écran d'annonce porte une ligne ; au-dessus, rien (une ligne de trop faisait croire un test de 16 écrans impossible à deux
   qatarāt). Deux formulations à valider sur la préview : changer celle qui est en place = changer le numéro de EXAM_AVERTISSEMENT (la troisième, « il faut 4 Qatarāt », était fausse : elle est écartée,
   vérificateur d'arabe et de français, 25/11). {n} = le nombre restant, {mot} = « Qatra » ou « Qatarāt » comme partout dans l'app.
   LA FORME (vague 5 quater, metteur en page : aucune phrase ne se coupait au deux-points sur un vrai téléphone) : « début\u00A0: » puis UN retour à la ligne (\n) puis la suite — la ligne se coupe entre
   deux propositions, jamais au milieu d'une, chaque moitié tenant sur UNE ligne au pire cas MESURÉ (360 px en grands caractères : 246 px utiles ; « chaque erreur en coûte une. » en demande 256 à 16 px, « un écran
   raté en coûte une. » 250, d'où la ligne à 15 px dans buildExam : 234) ; \u00A0 entre le nombre et son nom et avant le deux-points (ni un nombre ni un deux-points seuls au bout d'une ligne) ;
   du TEXTE pur, le \n est rendu par white-space:pre-line dans buildExam (jamais une balise : la ligne est posée dans du HTML) ; les deux derniers mots de chaque moitié sont liés par \u00A0 (si la ligne se
   coupe sur un écran plus étroit que les quatre mesurés, jamais un mot seul : « coûte une. » et non « une. »). À une seule qatra, « Plus que 1 Qatra » se dit « Plus qu’une Qatra ».
   « écran raté » et non « erreur » : en évaluation le 2ᵉ essai au clavier ne coûte rien (ecranRate), la phrase doit rester vraie.
   (journal : parcours.js · l'avertissement des qatarāt) */
var EXAM_AVERTISSEMENTS=[
  'Il te reste {n}\u00A0{mot}\u00A0:\nle test peut\u00A0s’arrêter.',
  'Plus que {n}\u00A0{mot}\u00A0:\nun écran raté en coûte\u00A0une.'
];
var EXAM_AVERTISSEMENT=EXAM_AVERTISSEMENTS[0];
function examAvertissement(n,permis){
  n=Math.floor(+n); permis=Math.floor(+permis);
  if(!(n>0&&n<=permis)) return '';
  var t=EXAM_AVERTISSEMENT.replace('{n}',function(){ return n; }).replace('{mot}',function(){ return n>1?'Qatarāt':'Qatra'; });
  return n===1?t.replace(/\bque 1(?=[ \u00A0])/,function(){ return 'qu’une'; }):t;
}

function discsFor(u){
  if(UNITS[u]&&UNITS[u].u8) return u8Disques();               // unité 8 : la grammaire, 9 disques à elle
  if(UNITS[u]&&UNITS[u].u9) return u9Disques();               // unité 9 : la grammaire, registre d'exercices
  if(UNITS[u]&&UNITS[u].u10) return u10Disques();             // unité 10 : « X de Y », même registre
  if(UNITS[u]&&UNITS[u].u11) return u11Disques();             // unité 11 : pronoms et accords, même registre
  if(UNITS[u]&&UNITS[u].u12) return u12Disques();             // unité 12 : mémoriser la Fātiḥa, même registre
  var D=disques();
  if(u===0) return D;                                        // unité 1 : tour d'alphabet en tête
  if(UNITS[u].kind==='weak')                                 // unité 2 : structure sur mesure
    // Révision · Mémoriser · Lettres vs prolongations · Formes · Fātiḥa · Harakats · Lire · Écrire · Bilan
    // (pas de disque « Les prolongations » : redondant ici, et aucun mot propre en ū)
    return [revisionDisc(), D[1], LETTREVSPRO_DISC, D[2], D[3], D[4], D[6], D[7], D[8]];
  return [revisionDisc(), ...D.slice(1)];                    // unités-consonnes : révision en tête
}
