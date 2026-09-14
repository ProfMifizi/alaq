/* ═══════════════════════════════════════════════════════════════════════════
   LES DONNÉES D'ALAQ — l'alphabet, les harakāt, la Fātiḥa, les douze unités,
   les sourates et leur programme. Sorti d'index.html le 14/09/2026 (sous-lot 2
   de « extraire le lecteur »), copié à l'identique.

   ⚠️ SCRIPT CLASSIQUE, ni `defer` ni `type="module"`, aucun `import`, aucun
   `export`. Un module est différé : `UNITS` est lu de façon SYNCHRONE dès le
   premier rendu (l'accueil dessine une section par unité), et `const UNITS`
   reste une liaison lexicale globale, partagée entre scripts classiques.

   ═══ CE QU'IL LIT AILLEURS, ET QUAND ═══
   ① `window.__ALAQ_UNITS` — posé par `content/unites.js` (les unités 1 à 7,
      semées depuis src/content/units/*.json). Lu AU CHARGEMENT : content/unites.js
      doit être chargé AVANT ce fichier. Sans lui, le repli garde sept places
      fermées (voir le commentaire de UNITS).
   ② `LT` — la table des tracés, dans `trace-lettres.js`. Lue AU CHARGEMENT par
      la dérivation `U.strokes`/`U.strokesPos` en fin de fichier : trace-lettres.js
      doit être chargé AVANT ce fichier.
   Rien d'autre. Ce fichier ne lit RIEN du grand script d'index.html — c'est ce
   qui rend son chargement anticipé sûr, et le banc le vérifie.

   ═══ CE QUE LE RESTE DE L'APP Y LIT ═══
   `ALPHABET` (la grille des 28 lettres, le vocabulaire), `HK`/`MD`/`MDH`/`maddSyl`
   (les harakāt et les prolongations), `FATIHA` (les sept versets), `UNITS` (tout :
   l'accueil, la progression, les générateurs, le Cours), `SOURATES`, `SOURATE_PLAN`,
   `UNIT_ACCENTS`/`unitAccent` (l'arc-en-ciel des sept unités), et les outils arabes
   (`ZWJ`, `TAT`, `formGlyph`, `joinsL`, `sameLetter`, `letterKey`…).

   ⛔ Corriger un mot des unités 1 à 7 ne se fait PAS ici : c'est
   `src/content/units/unit-0N.json`, puis `node outils/semer-unites.mjs`.
   Gardes : outils/verifier-lecons.mjs, previews/_verif_lecons.html.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ================= OUTILS ARABES ================= */
const ZWJ='\u200D';
const TAT='\u0640'; // tatweel : trait de liaison visible et fiable (iOS)
const NONJOIN='اأإآدذرزوةىءٱ';            // ne s'attachent pas à gauche
const DIA=/[\u064B-\u0652\u0670]/g;        // harakats, sukun, chedda, alif suscrit
const strip=s=>s.replace(DIA,'');
const joinsL=ch=>!NONJOIN.includes(ch);
function formGlyph(L,pos){ // 0 isolée 1 début 2 milieu 3 fin
  const jl=joinsL(L);                   // se lie à la lettre suivante (à gauche) ?
  if(pos===1)return jl?L+TAT:L;         // début  : liaison à gauche (sinon = isolée)
  if(pos===2)return jl?TAT+L+TAT:TAT+L; // milieu : liaison des 2 côtés (sinon = fin)
  if(pos===3)return TAT+L;              // fin    : liaison à droite
  return L;                             // isolée
}
// Famille du alif : le alif nu (ا) et le alif portant la hamza (أ dessus, إ dessous,
// آ madda, ٱ wasla) sont la MÊME lettre. On les traite comme équivalents pour le repérage.
const ALIF_FAM='اأإآٱ';
function letterKey(ch){ return ALIF_FAM.includes(ch)?'ا':ch; }
function sameLetter(a,b){ return letterKey(a)===letterKey(b); }

/* ================= DONNÉES ================= */
const ALPHABET=[['ا','alif'],['ب','bā’'],['ت','tā’'],['ث','thā’'],['ج','jīm'],['ح','ḥā’'],['خ','khā’'],
 ['د','dāl'],['ذ','dhāl'],['ر','rā’'],['ز','zāy'],['س','sīn'],['ش','shīn'],['ص','ṣād'],['ض','ḍād'],
 ['ط','ṭā’'],['ظ','ẓā’'],['ع','ʿayn'],['غ','ghayn'],['ف','fā’'],['ق','qāf'],['ك','kāf'],['ل','lām'],
 ['م','mīm'],['ن','nūn'],['ه','hā’'],['و','wāw'],['ي','yā’']];
const HK=[['\u064E','a'],['\u0650','i'],['\u064F','ou']];   // fatha kasra damma
const MD=[['ا','ā'],['ي','ī'],['و','ū']];
const MDH={'ا':'\u064E','ي':'\u0650','و':'\u064F'};
function maddSyl(L,m){return L+(MDH[m]||'')+m;}                    // prolongations
const FATIHA=[
 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
 'الرَّحْمَٰنِ الرَّحِيمِ',
 'مَالِكِ يَوْمِ الدِّينِ',
 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ'];
/* LT — les 100 tracés de l'alphabet (28 lettres, calqués sur Noto Naskh 190 px) — vit dans
   trace-lettres.js depuis le 07/09/2026, avec setupTrace. Lu ICI de façon synchrone (la
   dérivation strokes/strokesPos plus bas) : trace-lettres.js est un script classique chargé
   AVANT celui-ci, juste sous assets.js. */
const UNITS=(function(){
  /* ═══ LES UNITÉS 1 À 7 VIENNENT DE content/unites.js (06/09/2026) ═══
     Leur contenu — lettres, noms de lettres, 76 mots avec leur son — vit
     désormais dans src/content/units/unit-0N.json, et le script classique
     chargé plus haut le pose sur window.__ALAQ_UNITS. Corriger un mot se
     fait LÀ-BAS, puis `node outils/semer-unites.mjs` ; le portillon compare
     les deux et rougit si la semence a vieilli.
     ⚠️ LES UNITÉS 8 À 12 RESTENT ICI, et c’est voulu : elles n’ont pas de
     contenu à déclarer (leurs écrans vivent dans des modules ES), le
     littéral n’en garde que la métadonnée d’accueil.
     ⚠️ LE REPLI N’EST PAS UN TABLEAU VIDE. Sans les sept premières, les
     unités 8 à 12 remonteraient aux positions 0 à 4 : `dkey(u,i)` lit
     `UNITS[u].no`, `unitUnlocked` prend `U.no===1` pour racine, et
     l’accueil afficherait la grammaire en première leçon. On garde donc
     SEPT places, fermées et annoncées, plutôt qu’un décalage silencieux. */
  var s = window.__ALAQ_UNITS;
  if (!Array.isArray(s) || s.length !== 7) {
    console.error('[contenu] content/unites.js absent ou incomplet — les unités 1 à 7 sont indisponibles. Vérifier le pré-cache du service worker et le déploiement de content/.');
    s = [1,2,3,4,5,6,7].map(function(n){
      return { no:n, ready:false, sub:'Contenu indisponible', letters:[], lat:{}, alpha:{}, words:[] };
    });
  }
  return s.concat([
 /* ═══ UNITÉ 8 — LA GRAMMAIRE COMMENCE ═══
    Première unité SANS lettre neuve : ce n'est plus l'alphabet qu'on apprend, c'est ce
    que les lettres FONT. D'où `letters:[]` — et le soin à prendre partout où le code
    boucle sur les lettres d'une unité (`UNITS.every`, la grille des lettres, le bilan) :
    ces endroits filtrent déjà sur `U.letters`, l'unité 8 en sort d'elle-même.
    `u8:true` dit que ses 9 disques ne sont pas ceux des unités-consonnes : ils vivent
    dans le moteur U8, qui vit dans src/units/unit-8/ (modules ES, POC-1 du 18/08).
    ⚠️ `words` est REMPLI À L'ENREGISTREMENT depuis U8.mots, jamais retapé ici : les
    14 mots ont une seule source (src/units/unit-8/donnees/mots.js). */
 { no:8,  ready:true,  ph:'GRAMMAIRE', u8:true, letters:[], words:[],
   court:'L’article الـ',                       // ce que le ciel annonce, à la place des lettres
   sub:'L’article الـ · lettres solaires et lunaires — 9 leçons' },
 /* ═══ UNITÉ 9 — بِ ﻭ عَلَى ﻭ لِ : LA GRAMMAIRE PAR LA MANIPULATION ═══
    Disques 1 à 5 ouverts (GO de Myriam sur le disque 5, 29/08). `u9:true`
    dit à `discsFor` de lire `u9Disques()` — pas de moteur à soi comme U8, les
    écrans sont des exercices ORDINAIRES du registre (voir u9Disques() plus
    haut et src/units/unit-9/donnees/disque-1.js … disque-5.js).
    ⚠️ LE DISQUE 5 CHANGE DE NATURE : les quatre premiers enseignent un SENS
    (quel harf pour quelle relation), le cinquième une FORME — la terminaison
    du nom qui passe de ـُ à ـِ derrière بِ. Ses écrans manipulent donc des
    fragments de mot arabe, pas des images, d'où les six exercices neufs qu'il
    apporte au registre (voir src/exercises/_mot-colore.js).
    LE VOCABULAIRE (GO de Myriam, 04/09) — les trois harf que l'unité enseigne,
    puis les six noms qu'elle introduit. Format {w,fr,say}, celui de l'unité 8 :
    ni `e` ni `confus` ni `b`, trois champs que plus AUCUN code ne lit (les emoji
    de sens sont retirés depuis le 12/08 ; le commentaire de wordSoundOptions dit
    que le QCM n'utilise PAS `confus` — il tire ses leurres des autres mots de
    l'unité ; `b` n'existe que sur les objets-lettres).
    ⚠️ LES DEUX FORMES DÉFINIES NE SONT PAS UNE INCOHÉRENCE. مَكْتَبٌ · بِنْتٌ ·
    وَلَدٌ · نَبَاتٌ se citent à l'indéfini, comme tout le vocabulaire du projet.
    الْمَاءُ et التُّرَابُ non : l'unité ne les enseigne QUE sous cette forme, et
    aucune source du dépôt ne porte مَاءٌ ni تُرَابٌ. Les écrire serait inventer
    une graphie — ce que la doctrine interdit — et les prises correspondantes
    n'existent pas (mot-maa.mp3 / mot-turab.mp3 sont absents du disque).
    ⚠️ CETTE GRAINE NE SERT À RIEN SANS DEUX AUTRES LIGNES, posées dans le même
    lot : le drapeau `vocab:true` sur le disque 4 de u9Disques() (sans lui,
    _lireDone(8) rend false et ces mots n'entrent JAMAIS en révision, en silence),
    et les entrées de la carte AUDIO plus bas (sans elles, speak() retombe sur la
    voix de SYNTHÈSE, que la doctrine interdit pour ce qui enseigne un son).
    ⚠️ `_adopteVocab` remplacerait cette graine s'il existait des lignes
    unite_no=9 dans Supabase — il n'y en a pas, et sa garde « pas de lignes pour
    cette unité : sa graine reste » la protège. Le jour où il y en aura, c'est
    LÀ que le vocabulaire vivra, plus ici. */
 { no:9,  ready:true,  ph:'GRAMMAIRE', u9:true, letters:[],
   words:[
  {w:'بِ',fr:'avec, au moyen de',say:'bi'},
  {w:'لِ',fr:'pour, à',say:'li'},
  {w:'عَلَى',fr:'sur',say:'ʿalā'},
  {w:'مَكْتَبٌ',fr:'un bureau',say:'maktab'},
  {w:'بِنْتٌ',fr:'une fille',say:'bint'},
  {w:'وَلَدٌ',fr:'un garçon',say:'walad'},
  {w:'نَبَاتٌ',fr:'une plante, de la végétation',say:'nabāt'},
  {w:'الْمَاءُ',fr:'l’eau',say:'al-māʾ'},
  {w:'التُّرَابُ',fr:'la terre, la poussière propre',say:'at-turāb'},
   ],
   /* ⚠️ « Les harfs » PRÉFIXÉ (Myriam, 05/09) : les trois lettres seules ne
      disaient pas QUOI elles étaient — le mot les nomme, comme « L'article
      الـ » le fait déjà pour l'unité 8. Alimente tout ce qui lit `court`
      (bandeau du ciel, Cours › Résumé, le hub de grammaire) depuis CETTE
      seule source — rien à répéter ailleurs.
      ⚠️ CASSE corrigée le 05/09 (retour de Myriam) : `court` s'écrit en
      MINUSCULE avec une majuscule de début, jamais en capitales — le figeage
      en capitales de la transition d'unité sur l'accueil (`.unit-sep`) est un
      CSS (`text-transform:uppercase`), pas une convention à recopier ici. */
   court:'Les harfs بِ · عَلَى · لِ',
   sub:'بِ · عَلَى · لِ — la grammaire par la manipulation · 9 leçons' },
 /* ═══ UNITÉ 10 — « X DE Y » : LA RELATION ENTRE DEUX NOMS ═══
    Ouverte le 02/09 (GO de Myriam : « okay pour le cablage »). `u10:true` dit
    à `discsFor` de lire `u10Disques()` — même dispositif que l'unité 9 : pas
    de moteur à soi, les écrans sont des exercices ORDINAIRES du registre
    (`scene-relation`, voir src/units/unit-10/donnees/disque-1.js).
    ⚠️ `sub` COMPTE LES DISQUES RÉELS, pas les neuf de l'accueil : l'unité 9 a
    dit « 5 leçons » puis 6, puis 7, à mesure que ses grisés devenaient réels.
    Une seule leçon ici, et le mot est au singulier.
    ⚠️ `court` NE NOMME PAS LA RÈGLE : les directives validées interdisent
    مُضَاف / إِضَافَة au disque 1. Le ciel annonce donc ce que l'élève va
    FAIRE — reconnaître de qui, de quoi on parle — pas ce qu'elle apprendra.
    `words:[]` : comme l'unité 9, les groupes nominaux ne rejoignent pas encore
    la révision espacée — à trancher avec Myriam. */
 { no:10, ready:true,  ph:'GRAMMAIRE', u10:true, letters:[], words:[],
   court:'L’annexion — الإِضَافَة',   // graphie relevée dans le document d'architecture, jamais retapée
   sub:'« X de Y » — de qui ? de quoi ? · 1 leçon' },
 { no:11, ready:false, ph:'GRAMMAIRE',    letters:[], sub:'La grammaire de la Fātiḥa — à construire' },
 { no:12, ready:false, ph:'MÉMORISATION', letters:[], sub:'La veillée — mémoriser la Fātiḥa entière' },
]);
})();

/* les tracés viennent de LT ; chaque unité n’expose QUE ses lettres (débloquées au fil des unités) */
UNITS.forEach(function(U){U.strokes={};U.strokesPos={};(U.letters||[]).forEach(function(L){
  if(LT[L+'-0'])U.strokes[L]=1; var sp={}; [1,2,3].forEach(function(p){ if(LT[L+'-'+p])sp[p]=1; }); U.strokesPos[L]=sp;
});});

/* ===== ARCHITECTURE : Sourate → Unités → Disques =====
   Statique aujourd'hui (une seule sourate) ; miroir des futures tables
   units/lessons du backend Supabase. Ajouter une sourate = ajouter une entrée. */
const SOURATES=[
 { no:1, first:1, nom:'Al-Fātiḥa', ar:'الفاتحة', sub:'L\u2019Ouverture · 7 versets · 7 unités',
   verses:FATIHA, units:UNITS,
   tr:[ // traduction mot à mot (alignée sur les mots de chaque verset)
    ['Au nom','d\u2019Allah','le Tout-Miséricordieux','le Très-Miséricordieux'],
    ['la louange','est à Allah','Seigneur','des mondes'],
    ['le Tout-Miséricordieux','le Très-Miséricordieux'],
    ['Souverain','du Jour','de la Rétribution'],
    ['c\u2019est Toi que','nous adorons','et c\u2019est Toi que','nous implorons l\u2019aide'],
    ['guide-nous','sur le chemin','droit'],
    ['le chemin','de ceux que','Tu as comblés de bienfaits','envers eux','non pas','ceux qui ont encouru la colère','envers eux','ni','les égarés'],
   ] },
];

// Enluminure arc-en-ciel : 7 unites = 7 versets d'Al-Fatiha = les 7 couleurs de la lumiere blanche.
// Chaque unite recoit une couleur (contour du bandeau + halo du disque courant + trait du separateur).
const UNIT_ACCENTS=['#d8463a','#e07a1e','#ecc531','#35a468','#2f74d0','#5350c8','#8a4fc4'];
function unitAccent(u){return UNIT_ACCENTS[((u%UNIT_ACCENTS.length)+UNIT_ACCENTS.length)%UNIT_ACCENTS.length];}

// Programme des sourates (ordre pedagogique, cf. CLAUDE.md) : seules celles construites ont un "idx".
const SOURATE_PLAN=[
 {no:1,  nom:'Al-Fatiha',    ar:'الفاتحة', idx:0},
 {no:114,nom:'An-Nas',       ar:'الناس'},
 {no:113,nom:'Al-Falaq',     ar:'الفلق'},
 {no:112,nom:'Al-Ikhlas',    ar:'الإخلاص'},
 {no:111,nom:'Al-Masad',     ar:'المسد'},
 {no:110,nom:'An-Nasr',      ar:'النصر'},
 {no:109,nom:'Al-Kafirun',   ar:'الكافرون'},
 {no:108,nom:'Al-Kawthar',   ar:'الكوثر'},
 {no:107,nom:'Al-Maʻun', ar:'الماعون'},
 {no:106,nom:'Quraysh',      ar:'قريش'},
 {no:105,nom:'Al-Fil',       ar:'الفيل'},
 {no:104,nom:'Al-Humaza',    ar:'الهمزة'},
 {no:103,nom:'Al-ʻAsr',  ar:'العصر'},
 {no:102,nom:'At-Takathur',  ar:'التكاثر'},
 {no:101,nom:'Al-Qariʻa', ar:'القارعة'},
 {no:100,nom:'Al-ʻAdiyat', ar:'العاديات'},
 {no:99, nom:'Az-Zalzala',   ar:'الزلزلة'},
 {no:98, nom:'Al-Bayyina',   ar:'البينة'},
 {no:97, nom:'Al-Qadr',      ar:'القدر'},
 {no:96, nom:'Al-ʻAlaq',  ar:'العلق'},
 {no:95, nom:'At-Tin',       ar:'التين'},
 {no:94, nom:'Ash-Sharh',    ar:'الشرح'},
 {no:93, nom:'Ad-Duha',      ar:'الضحى'},
 {no:92, nom:'Al-Layl',      ar:'الليل'},
 {no:91, nom:'Ash-Shams',    ar:'الشمس'},
 {no:90, nom:'Al-Balad',     ar:'البلد'},
 {no:89, nom:'Al-Fajr',      ar:'الفجر'},
 {no:88, nom:'Al-Ghashiya',  ar:'الغاشية'},
 {no:87, nom:'Al-Aʻla',   ar:'الأعلى'},
 {no:86, nom:'At-Tariq',     ar:'الطارق'},
 {no:85, nom:'Al-Buruj',     ar:'البروج'},
 {no:84, nom:'Al-Inshiqaq',  ar:'الانشقاق'},
 {no:83, nom:'Al-Mutaffifin', ar:'المطففين'},
 {no:82, nom:'Al-Infitar',   ar:'الانفطار'},
 {no:81, nom:'At-Takwir',    ar:'التكوير'},
 {no:80, nom:'ʻAbasa',    ar:'عبس'},
 {no:79, nom:'An-Naziʻat', ar:'النازعات'},
 {no:78, nom:'An-Nabaʾ',  ar:'النبأ'},
 {no:67, nom:'Al-Mulk',      ar:'الملك'},
 {no:55, nom:'Ar-Rahman',    ar:'الرحمن'},
 {no:18, nom:'Al-Kahf',      ar:'الكهف'},
 {no:36, nom:'Ya-Sin',       ar:'يس'},
];
