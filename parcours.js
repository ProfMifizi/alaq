/* ═══════════════════════════════════════════════════════════════════════════
   parcours.js — L'ORCHESTRATION DES DISQUES (10/09/2026)
   ───────────────────────────────────────────────────────────────────────────
   CE QU'IL PORTE : la table des neuf disques types, les disques particuliers
   (Révision, « Lettres vs prolongations »), les trois moteurs d'unités de
   grammaire (u8Disques / u9Disques / u10Disques) et `discsFor(u)` —
   L'AIGUILLAGE CENTRAL, qui décide pour chaque unité QUELS disques l'élève voit
   et dans quel ORDRE.

   ⚠️ CET ORDRE EST LA PROGRESSION. `dkey(u,i)` enregistre l'avancement par
   NUMÉRO de disque : réordonner les disques réécrit le sens de ce qui est déjà
   coché. C'est l'incident du 02/08, que `fixOrdreFormes()` répare encore
   aujourd'hui dans progression.js.

   ═══ POURQUOI CE FICHIER EST UN SCRIPT CLASSIQUE, ET CHARGÉ ICI ═══
   `<script src="parcours.js"></script>` vit juste sous progression.js et AVANT
   le grand script de l'application. Ni `defer`, ni `type="module"`, ni `import`,
   ni `export` — jamais. Deux raisons, et elles se contredisent :
   — il ne peut pas être chargé APRÈS : `showTab('home')`, à la fin du grand
     script, appelle `discsFor` de façon SYNCHRONE (renderHome) ;
   — il ne peut pas capturer ses dépendances au chargement : les dix
     constructeurs (`buildAlphabet` … `buildReview`) vivent dans index.html, et
     la remontée des déclarations `function` ne franchit PAS la frontière d'un
     script. Une `const DISQUES=[{build:buildAlphabet}]` lèverait ReferenceError.
   D'où `disques()` et `revisionDisc()`, PARESSEUSES et mémoïsées : elles
   résolvent à l'appel, quand index.html a fini de se déclarer. Le même contrat
   que `setupTrace()` dans trace-lettres.js et `fixOrdreFormes()` dans
   progression.js.

   ═══ LE CONTRAT AVEC index.html, DANS LES DEUX SENS ═══
   ① CE FICHIER RÉSOUT À L'APPEL, jamais à la définition : les dix constructeurs,
      `UNITS`, `U8`, `window.__alaqU9`, `window.__alaqU10`. Cette liste EST le
      contrat, et le banc la garde.
   ② index.html et progression.js LISENT `discsFor` — et surtout ils
      reconnaissent un disque PAR IDENTITÉ DE FONCTION :
        progression.js : `d.build === buildForms`   (fixOrdreFormes)
        index.html     : `ds[i].build === buildWords` (_lireDone)
      Ce n'est pas le libellé qui compte, c'est l'OBJET. Une réécriture qui
      recréerait ces fonctions au lieu de les référencer casserait la migration
      des formes et la révision du vocabulaire — en silence, sans une erreur.
      L'essai ② du banc est le seul endroit du dépôt qui l'éprouve.
   ⚠️ `disques()` rend l'objet PARTAGÉ (mémoïsé), comme la `const` d'avant :
      `discsFor(0)` le rend tel quel. Rien ne doit le muter — rien ne le fait.

   GARDE : outils/verifier-parcours.mjs éprouve les six branches de l'aiguillage,
   le compte de NEUF disques partout, l'identité des constructeurs et les deux
   ponts vers les modules ES. Il localise ce bloc PAR SON CONTENU, dans index.html
   ou ici — il rend donc les mêmes verdicts des deux côtés du déménagement. C'est
   ce qui prouve qu'aucune ligne ne s'est perdue au copier-coller.
   ═══════════════════════════════════════════════════════════════════════════ */

// ORDRE PÉDAGOGIQUE : « Les formes » AVANT « Dans la Fātiḥa » — on ne peut pas demander de repérer
// une lettre dans le verset (où elle est écrite liée) avant d'avoir montré début/milieu/fin.
/* ═══ LES NEUF DISQUES TYPES — UNE TABLE PARESSEUSE, ET C'EST DÉLIBÉRÉ ═══════
   ⚠️ CECI N'EST PAS UNE TABLE DE DONNÉES. C'est une table de RÉFÉRENCES VIVANTES
   vers dix constructeurs qui vivent plus haut dans ce fichier (L794-1118) — et
   `build:buildAlphabet` les CAPTURE au moment où la table s'évalue.
   Tant que tout habitait le même script, l'ordre suffisait : les `function`
   remontent en tête de LEUR script. Mais la remontée ne franchit pas la frontière
   d'un fichier : une `const` évaluée au chargement de parcours.js chercherait
   `buildAlphabet` avant qu'index.html l'ait déclaré, et lèverait ReferenceError —
   page blanche. Et on ne peut pas non plus charger parcours.js APRÈS : `showTab('home')`
   appelle `discsFor` de façon synchrone à la fin du grand script.
   D'où la construction À L'APPEL, mémoïsée : le même contrat que `setupTrace()` dans
   trace-lettres.js et que `fixOrdreFormes()` dans progression.js. C'est ce qui rend
   ce bloc extractible — éprouvé par l'essai ⑫ d'outils/verifier-parcours.mjs, qui
   charge le bloc dans un bac où les constructeurs n'existent PAS ENCORE.
   ⚠️ La table est mémoïsée : `discsFor(0)` rend l'objet PARTAGÉ, comme avant. Rien
   ne doit le muter — rien ne le fait aujourd'hui, et le banc compte ses neuf entrées. */
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
/* ⚠️ MÊME PIÈGE, ET IL SE CACHE MIEUX : cette constante-ci ne capture qu'UN
   constructeur, `buildReview`, mais il vit lui aussi dans index.html (L1118). Rendre
   `DISQUES` paresseux et laisser celle-ci en `const` aurait suffi à lever
   ReferenceError au chargement de parcours.js. Le tableau des dépendances de la
   tâche Notion rangeait d'ailleurs `buildReview` avec les neuf autres — c'est
   précisément ce qui rendait l'oubli invisible.
   `LETTREVSPRO_DISC`, juste en dessous, n'a PAS besoin de ce traitement : la
   fonction qu'elle capture voyage AVEC elle dans le bloc extrait. */
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
    /* 13/08 — principe 1 appliqué (Myriam : « trop trop trop de texte, c'est illisible ») :
       le titre EST l'instruction, il n'y a plus ni boîte, ni badge « À DÉCOUVRIR », ni
       paragraphe, ni rappel fléché. Sur chaque face : la lettre et son RÔLE, rien de plus —
       le son s'entend, il ne s'écrit pas (principe 2). */
    /* 14/08 — l'écran d'ouverture demandé par Myriam : l'alphabet en deux parties, et les
       trois lettres qui ont un second rôle se découvrent au doigt. Il vient AVANT les
       cartes : on voit d'abord QUI a deux rôles, on retourne ensuite pour voir LESQUELS. */
    {type:'roles', gate:true, title:'3 lettres peuvent avoir 2 rôles'},
    {type:'flipcards', gate:true, cartes:[
      {ar:'ي', cons:'يَ', pro:'إِي'},
      {ar:'و', cons:'وَ', pro:'أُو'},
      {ar:'ا', cons:'',   pro:'أَا'}
    ]},
    DM('ن','\u0650','ي','نِي','ī','ni'),
    DM('م','\u064E','ا','مَا','ā','ma'),
    DM('ل','\u064F','و','لُو','ū','lou'),
    DA('ي',[{short:'يَ',madd:'ا',long:'يَا',say:'يَا'},{short:'يِ',madd:'ي',long:'يِي',say:'يِي'},{short:'يُ',madd:'و',long:'يُو',say:'يُو'}]),
    DA('و',[{short:'وَ',madd:'ا',long:'وَا',say:'وَا'},{short:'وِ',madd:'ي',long:'وِي',say:'وِي'},{short:'وُ',madd:'و',long:'وُو',say:'وُو'}]),
    DA('ء',[{short:'أَ',madd:'ا',long:'آ',say:'أَا'},{short:'إِ',madd:'ي',long:'إِي',say:'إِي'},{short:'أُ',madd:'و',long:'أُو',say:'أُو'}]),
    /* 13/08 — mêmes principes que l'écran 1 : le titre EST l'instruction, et l'écran est
       un GESTE. Les deux paragraphes et les étiquettes latines tombent — le son enseigne
       ce que la lettre dit (principe 2), l'œil n'a pas besoin d'un doublon écrit. */
    /* 14/08 — « change instruction par "touche chaque support" » : ces trois lignes sont
       le alif PORTANT la hamza, donc des supports ; « voyelle » nommait le son entendu,
       pas ce qu'on touche. Le mot est aussi celui du filet de l'écran 1 — un seul terme
       pour une seule idée, d'un bout à l'autre de la leçon. */
    {type:'taprow', title:'Touche chaque support', lignes:['أَ','إِ','أُ']},
    /* ═══ ÉCRAN 10 — LE TRI, à la place de « Compare les deux sièges » (Myriam, 14/08) ═══
       Comparer deux cartes était un écran à REGARDER ; trier six mots est un écran à FAIRE
       (principe ③ : chaque écran est un geste). Le tri est le moteur déjà écrit pour le
       soukoun/chedda de la leçon 6 — écrans jumeaux, un seul moteur (principe ⑨) : il fait
       sonner chaque mot posé et n'allume CONTINUER qu'à la fin du dernier son.
       Les mots : quatre viennent du vocabulaire de l'unité 2 ; إِمَامٌ et إِلَيْنَا sont ajoutés
       ICI (et non dans U.words, que Supabase écrase au démarrage) — ils n'utilisent que des
       lettres déjà connues, il fallait trois mots par panier pour que le tri soit un tri. */
    {type:'tri', mute:true,
      paniers:[{sig:'أ',cle:'a'},{sig:'إ',cle:'i'}],
      mots:shuffle([
        {w:'أَمَانٌ',cle:'a'},{w:'أَمِينٌ',cle:'a'},{w:'أَلِيمٌ',cle:'a'},
        {w:'إِيمَانٌ',cle:'i'},{w:'إِمَامٌ',cle:'i'},{w:'إِلَيْنَا',cle:'i'}
      ])},
    mcq({prompt:'Ici, quel rôle joue le ا ?',glyph:'مَالٌ',glyphLinear:true,mute:true,graded:true,answer:'p',explain:'Dans <span class="ar">مَالٌ</span>, le <span class="ar">ا</span> suit une fatḥa et prolonge le son : on dit « māl ». C’est son rôle de prolongation, pas de consonne.',
      options:shuffle([{txt:'Il prolonge le son « ā »',key:'p'},{txt:'Il fait le son « l »',key:'l'},{txt:'Il ne sert à rien',key:'x'}])}),
    mcq({prompt:'Ici, le ي est…',glyph:'يَوْمٌ',glyphLinear:true,mute:true,graded:true,answer:'c',explain:'Au début de <span class="ar">يَوْمٌ</span> (« yawm »), le <span class="ar">ي</span> porte une fatḥa et se prononce « y » : ici c’est une consonne, pas une prolongation.',
      options:shuffle([{txt:'une consonne « y »',key:'c'},{txt:'une prolongation « ī »',key:'i'},{txt:'une harakat',key:'h'}])}),
    mcq({prompt:'Le و prolonge le son « ū »…',mute:true,graded:true,answer:'d',explain:'Le <span class="ar">و</span> prolonge en « ū » seulement après une ḍamma. Chaque prolongation suit sa voyelle : <span class="ar">ا</span> après fatḥa, <span class="ar">ي</span> après kasra, <span class="ar">و</span> après ḍamma.',
      options:shuffle([{txt:'après une ḍamma <span style="font-family:var(--ar);font-size:1.7em">ـُ</span>',key:'d'},{txt:'après une fatḥa <span style="font-family:var(--ar);font-size:1.7em">ـَ</span>',key:'f'},{txt:'après une kasra <span style="font-family:var(--ar);font-size:1.7em">ـِ</span>',key:'k'}])}),
    mcq({prompt:'À quoi sert la hamza <span style="font-family:var(--ar)">(ء)</span> posée sur le alif ?',mute:true,graded:true,answer:'v',explain:'La hamza <span class="ar">ء</span> est une vraie lettre (un petit coup de glotte). Posée sur le alif, elle permet de prononcer une voyelle seule — a, i ou ou — au début d’un mot.',
      options:shuffle([{txt:'à dire une voyelle seule : a, i, ou',key:'v'},{txt:'à prolonger le son',key:'l'},{txt:'à séparer deux mots',key:'s'}])}),
    mcq({prompt:'Lorsqu\u2019on veut faire le son « i » tout seul, quel support utilise-t-on ?',mute:true,graded:true,grid:'grid3',answer:'i',explain:'Pour le son « i », la hamza se place sous le alif : <span class="ar">إ</span>. Au-dessus (<span class="ar">أ</span>) on dit « a » ou « ou » ; le alif nu <span class="ar">ا</span> sert seulement à prolonger.',
      options:shuffle([{ar:'إ',key:'i'},{ar:'أ',key:'a'},{ar:'ا',key:'n'}])}),
  ];
}
const LETTREVSPRO_DISC={icon:'💡',img:'decouvrir',label:'Lettres vs prolongations',build:buildLettreVsProlong};
/* ── LES 9 DISQUES DE L'UNITÉ 8 ─────────────────────────────────────────────
   L'unité 8 n'a pas la structure des unités-consonnes : pas de « Mémoriser », pas
   de « Formes », pas de « Prolongations » — il n'y a aucune lettre neuve à
   mémoriser. Ses neuf disques sont ceux des previews validées le 15/08.

   ⚠️ PAS de disque « Révision » en tête, contrairement aux unités 2 à 7 : D1 est
   une DÉCOUVERTE et doit rester le premier écran de l'unité. Le vocabulaire des
   unités précédentes continue de se réviser depuis l'onglet Réviser.

   Les libellés ne sont pas ceux de src/units/unit-8/donnees/disques.js
   (« Découverte (الـ), lecture lunaire 1/2 ») : ceux-là décrivent un fichier,
   ceux-ci se lisent sur un disque de l'accueil. `U8.titre(k)` garde les
   premiers pour le diagnostic.

   ⚠️ Construits À LA DEMANDE : `U8` est déclaré plus haut mais les images et les
   libellés n'ont de sens qu'au premier affichage — et surtout, une const au niveau
   du script forcerait un ordre de déclaration de plus à tenir. */
const U8_PLAN=[
  {k:'D1', img:'decouvrir', label:'L’article الـ'},
  {k:'D2', img:'ecrire',    label:'Écrire avec الـ'},
  /* ⚠️ « Le ل qui s’avale » est BANNI (Myriam, 05/09) : l'expression est
     familière et décrit un geste de gorge, là où la règle décrit une LETTRE.
     La terminologie officielle du projet est « lettre muette » — elle dit ce
     que l'élève doit retenir, et c'est elle qu'emploient le Cours et la
     révision de grammaire. */
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
            /* D4 clôt l'apprentissage des 14 mots (lus en D1/D3, écrits en D2/D4) :
               c'est lui qui ouvre la révision espacée, comme « Lire des mots » ailleurs. */
            vocab:(p.k==='D4'),
            build:function(){ return U8.disque(p.k); }};
  });
  return _u8Disques;
}

/* ── LE DISQUE DE L'UNITÉ 9 ──────────────────────────────────────────────────
   Contrairement à U8_PLAN, il n'y a ici NI moteur à soi NI branche `build:
   function(){ return U8.disque(k); }` par disque : chaque écran de
   `src/units/unit-9/donnees/disque-1.js` EST un `st.type` que le registre des
   exercices sait déjà monter (association-mots, glisser-scene, classer-harf,
   rappel-images) — « registre d'exercices », pas moteur parallèle. Le lecteur
   n'a donc besoin que d'une chose : le TABLEAU des `st` que `build()` retourne.

   ⚠️ La métadonnée d'accueil (icône, libellé) et la LONGUEUR du tableau — un
   seul disque pour l'instant — sont fixées ICI, dans le script classique,
   jamais dérivées du module : `discsFor(8).length` doit être juste dès le tout
   premier rendu de l'accueil, qu'il précède ou suive l'arrivée du module
   (même prudence qu'U8_TALON). Seul le CONTENU de `build()` est différé, et
   il ne l'est que jusqu'au premier appel — au plus tôt quand une élève ouvre
   le disque, donc toujours après que `entree.js` a fini de s'exécuter. */
/* ⚠️ PLUS AUCUN DISQUE « À VENIR » DEPUIS LE 03/09 — l'unité 9 est COMPLÈTE
   (9 disques réels, le bilan compris). Cette fabrique n'a donc plus d'appelant.
   Elle est LAISSÉE, et pas par négligence : c'est le gabarit exact du disque
   grisé (`aVenir:true`, gardé à vie par `renderHome` sur `unlocked`), et
   l'unité 10 le reprendra tel quel le jour où elle s'ouvrira. Le supprimer
   obligerait à le réinventer.
   Historique : posée le 24/08 sur la demande de Myriam (« il devrait y avoir
   9 dont 8 grisées »), pour que l'accueil ne dise pas « cette unité s'arrête
   là » avant l'heure ; les huit ont été remplacées une à une par de vrais
   disques, la dernière le 03/09.
   ✅ ET L'UNITÉ 10 LA REPREND, LE JOUR MÊME (02/09) : elle s'ouvre avec UN
   disque réel et huit grisés. La fabrique perd donc son préfixe `u9` — elle
   sert deux unités, et un nom qui ment sur sa portée finit par faire écrire
   un doublon. Elle n'avait aucun appelant : le renommage ne peut rien casser. */
function disqueAVenir(){
  return { icon:'🌙', img:'decouvrir', label:'À venir', aVenir:true,
    build:function(){ return [{type:'slide',nobadge:true,center:true,title:'Bientôt disponible',html:''}]; } };
}
/* 🔴 LES 9 DISQUES PORTAIENT TOUS L'AMPOULE — signalé par Myriam le 05/09
   (« les disques n'ont eu des lampe, bug majeur »). `img:` n'avait jamais suivi
   le contenu réel : chaque disque copiait 'decouvrir' au moment de sa naissance,
   disque après disque, sans qu'aucun n'y revienne une fois le suivant écrit.
   La règle, DÉJÀ posée par les unités 1-8 (DISQUES l.3853 et suivantes) : l'icône
   dit la NATURE du disque, pas son rang — 💡decouvrir (une notion s'introduit) ·
   📌memoriser (une FORME/terminaison se travaille, sans notion neuve) ·
   🕋qoran (le texte coranique réel) · 🏆bilan (la synthèse finale). Les disques
   1-4 restent decouvrir (sens de بِ/عَلَى/لِ) ; 5-7 passent à memoriser (ils
   « n'enseignent plus un sens mais une terminaison », note du 29/08 sur D5) ;
   8 passe à qoran (transfert au VRAI texte de la Fātiḥa) ; 9 était déjà bilan. */
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
    /* ⚠️ `vocab:true` — LA PORTE D'ENTRÉE DU VOCABULAIRE EN RÉVISION (04/09).
       _lireDone(idx) cherche un disque dont le build est buildWords OU qui porte
       ce drapeau ; l'unité 9 n'a pas de leçon « Lire des mots », donc sans lui
       ses mots n'entreraient qu'à la validation de l'unité ENTIÈRE — neuf disques
       plus tard. Motif exact de l'unité 8 (l.3871, vocab:(p.k==='D4')).
       LE DISQUE 4, parce que c'est lui qui CLÔT le corpus : les trois harf sont
       tous introduits (بِ au 2, عَلَى au 3, لِ ici) et les six noms aussi. Les
       disques 5 à 9 n'enseignent plus un mot, mais une terminaison. */
    { icon:'🌙', img:'decouvrir', label:'لِ — pour / à qui', vocab:true,
      build:function(){
        if(window.__alaqU9 && typeof window.__alaqU9.disque4==='function') return window.__alaqU9.disque4();
        console.error('unité 9 : module non chargé (disque 4)'); return [];
      } },
    /* ⚠️ CES DEUX LIGNES SONT SOLIDAIRES : un disque réel ajouté = un grisé
       retiré. `_verif_u8_app` et `_verif_u8_dist` vérifient l'INVARIANT — neuf
       disques, les réels d'abord, les « à venir » ensuite, aucun trou — et
       toucher l'une sans l'autre les fait rougir toutes les deux. */
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
    /* ── LE 9ᵉ ET DERNIER : LE BILAN (GO de Myriam, 03/09) ──────────────
       🏆 `img:'bilan'` comme partout ailleurs (les unités 1 à 8 le portent) :
       une élève reconnaît un bilan à son icône avant d'en lire le titre.
       ⚠️ DEUX LIGNES SOLIDAIRES — ce disque réel REMPLACE le dernier « à
       venir » ; `_verif_u8_app` et `_verif_u8_dist` gardent l'invariant
       (9 disques, les réels d'abord, aucun trou) et rougissent si l'un bouge
       sans l'autre.
       ⚠️ ET IL CHANGE UNE CHOSE QUE LE LIBELLÉ NE DIT PAS : jusqu'ici le
       dernier disque de l'unité 9 était un « à venir » grisé À VIE, donc
       l'unité ne pouvait JAMAIS être validée. Elle le peut désormais. C'est
       sans danger — `unitUnlocked` refuse toute unité `ready:false`, donc
       l'unité 10 reste « À VENIR » au lieu de s'ouvrir sur du vide. */
    { icon:'🏆', img:'bilan', label:'Bilan — بِ · لِ · عَلَى',
      build:function(){
        if(window.__alaqU9 && typeof window.__alaqU9.disque9==='function') return window.__alaqU9.disque9();
        console.error('unité 9 : module non chargé (disque 9)'); return [];
      } },
  ];
}

/* ═══ UNITÉ 10 — « X DE Y » : LA RELATION ENTRE DEUX NOMS (GO de Myriam, 02/09) ═══
   L'unité s'ouvre avec UN disque réel et huit grisés, exactement comme
   l'unité 9 le 24/08 (« il devrait y avoir 9 dont 8 grisées ») : l'accueil ne
   doit pas laisser croire que l'unité s'arrête au premier disque.
   Même mécanique que `u9Disques()` — le contenu vient du module ES
   (`window.__alaqU10`, publié par src/entree.js), la MÉTADONNÉE d'accueil
   (icône, libellé, longueur de la liste) reste ici, dans le script classique.
   ⚠️ ET C'EST VOULU : si la longueur dépendait du module, l'accueil
   afficherait « 0/0 » le temps que le module charge (la prudence d'U8_TALON).
   ⚠️ LE LIBELLÉ NE DIT PAS « مُضَاف » — les directives validées par Myriam
   l'interdisent explicitement au disque 1 : l'élève comprend le LIEN, elle
   n'apprend pas encore son nom. */
function u10Disques(){
  return [
    /* ⚠️ `vocab:true` POSÉ D'AVANCE, ET IL NE FAIT RIEN AUJOURD'HUI — UNITS[9].words
       est vide (les groupes d'annexion n'entrent pas encore en révision : leur
       graphie porte une ESPACE, dont splitUnits() ferait une tuile VIDE dans
       l'écriture guidée — mesuré). Le drapeau est là parce que l'unité 10 finit
       sur un GRISÉ : unitValidated(9) ne peut JAMAIS devenir vrai, et sans ce
       drapeau son vocabulaire serait inerte à vie, sans une ligne d'erreur. Le
       jour où ces mots entrent, il n'y aura que words à remplir. */
    { icon:'🌙', img:'decouvrir', label:'De qui ? de quoi ?', vocab:true,
      build:function(){
        if(window.__alaqU10 && typeof window.__alaqU10.disque1==='function') return window.__alaqU10.disque1();
        console.error('unité 10 : module non chargé (disque 1)'); return [];
      } },
    /* ⚠️ DEUX LIGNES SOLIDAIRES, comme dans l'unité 9 : un disque réel ajouté
       ici = un grisé retiré là. Le compte doit rester à NEUF. */
    ...Array.from({length:8}, disqueAVenir),
  ];
}

function discsFor(u){
  if(UNITS[u]&&UNITS[u].u8) return u8Disques();               // unité 8 : la grammaire, 9 disques à elle
  if(UNITS[u]&&UNITS[u].u9) return u9Disques();               // unité 9 : la grammaire, registre d'exercices
  if(UNITS[u]&&UNITS[u].u10) return u10Disques();             // unité 10 : « X de Y », même registre
  var D=disques();
  if(u===0) return D;                                        // unité 1 : tour d'alphabet en tête
  if(UNITS[u].kind==='weak')                                 // unité 2 : structure sur mesure
    // Révision · Mémoriser · Lettres vs prolongations · Formes · Fātiḥa · Harakats · Lire · Écrire · Bilan
    // (pas de disque « Les prolongations » : redondant ici, et aucun mot propre en ū)
    return [revisionDisc(), D[1], LETTREVSPRO_DISC, D[2], D[3], D[4], D[6], D[7], D[8]];
  return [revisionDisc(), ...D.slice(1)];                    // unités-consonnes : révision en tête
}
