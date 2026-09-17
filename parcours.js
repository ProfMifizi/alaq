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
       L'écran des rôles vient AVANT les cartes : d'abord QUI a deux rôles, puis LESQUELS.
       (journal : parcours.js · « Lettres vs prolongations », les retours de Myriam) */
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

/* Unité 10 « X de Y » : un disque réel et huit grisés ; même mécanique que u9Disques()
   (contenu dans window.__alaqU10, métadonnée et longueur dans ce script classique).
   ⛔ Le libellé ne dit pas « مُضَاف » : interdit au disque 1 par les directives validées.
   (journal : parcours.js · unité 10, ouverture) */
function u10Disques(){
  return [
    /* ⚠️ vocab:true posé d'avance (UNITS[9].words est vide) : l'unité finit sur un grisé,
       unitValidated(9) ne devient jamais vrai, ce drapeau est sa seule porte vers la révision.
       Les groupes d'annexion portent une espace : splitUnits() en ferait une tuile vide. */
    { icon:'🌙', img:'decouvrir', label:'De qui ? de quoi ?', vocab:true,
      build:function(){
        if(window.__alaqU10 && typeof window.__alaqU10.disque1==='function') return window.__alaqU10.disque1();
        console.error('unité 10 : module non chargé (disque 1)'); return [];
      } },
    /* ⚠️ Un disque réel ajouté = un grisé retiré : neuf disques, réels d'abord
       (gardé par _verif_u8_app et _verif_u8_dist). */
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
