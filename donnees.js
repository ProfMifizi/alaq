/* donnees.js — les données d'Alaq : l'alphabet, les harakāt (HK, MD, MDH, maddSyl),
   la Fātiḥa, UNITS (les douze unités), SOURATES, SOURATE_PLAN, UNIT_ACCENTS/unitAccent,
   et les outils arabes (ZWJ, TAT, formGlyph, joinsL, sameLetter, letterKey…).

   Script classique, ni defer ni module : UNITS est lu de façon synchrone au premier
   rendu (l'accueil dessine une section par unité).

   Au chargement, il ne lit que deux choses, chargées avant lui :
   ① window.__ALAQ_UNITS (content/unites.js) — les unités 1 à 7 ;
   ② LT (trace-lettres.js) — pour dériver U.strokes / U.strokesPos en fin de fichier.
   Rien du grand script d'index.html : le banc le vérifie.

   ⛔ Un mot des unités 1 à 7 se corrige dans src/content/units/unit-0N.json, puis
   node outils/semer-unites.mjs — jamais ici.
   Gardes : outils/verifier-lecons.mjs, previews/_verif_lecons.html. */

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
const UNITS=(function(){
  /* Unités 1 à 7 : window.__ALAQ_UNITS (content/unites.js). Unités 8 à 12 : la seule
     métadonnée d’accueil, leurs écrans vivent dans des modules ES.
     (journal : donnees.js · les unités 1 à 7 sorties en JSON)
     ⚠️ Le repli n’est pas un tableau vide : sans sept places, les unités 8 à 12
     glisseraient aux positions 0 à 4 (dkey, unitUnlocked, l’accueil). */
  var s = window.__ALAQ_UNITS;
  if (!Array.isArray(s) || s.length !== 7) {
    console.error('[contenu] content/unites.js absent ou incomplet — les unités 1 à 7 sont indisponibles. Vérifier le pré-cache du service worker et le déploiement de content/.');
    s = [1,2,3,4,5,6,7].map(function(n){
      return { no:n, ready:false, sub:'Contenu indisponible', letters:[], lat:{}, alpha:{}, words:[] };
    });
  }
  return s.concat([
 /* Unité 8 : aucune lettre neuve (letters:[]) ; u8:true → le moteur U8 (src/units/unit-8/).
    ⚠️ letters:[] : tout code qui boucle sur les lettres d'une unité doit filtrer sur U.letters.
    ⚠️ words est rempli par index.html depuis U8.mots, jamais retapé dans ce littéral.
    (journal : donnees.js · unité 8, première unité de grammaire) */
 { no:8,  ready:true,  ph:'GRAMMAIRE', u8:true, letters:[], words:[],
   court:'L’article الـ',                       // ce que le ciel annonce, à la place des lettres
   sub:'L’article الـ · lettres solaires et lunaires — 9 leçons' },
 /* Unité 9 : u9:true → u9Disques() (parcours.js), des exercices ordinaires du registre.
    Vocabulaire au format {w,fr,say} : les trois harf, puis les six noms.
    ⚠️ الْمَاءُ et التُّرَابُ restent à la forme définie : l'unité ne les enseigne que
    sous cette forme, et aucune source ne porte l'indéfini — ne pas inventer de graphie.
    ⚠️ Ces mots n'entrent en révision que par vocab:true sur le disque 4 (parcours.js),
    et ne sonnent que s'ils sont dans la table SONS (son.js) : un son absent est un silence.
    (journal : donnees.js · unité 9, disques et vocabulaire) */
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
   /* court : seule source du bandeau du ciel, du Cours › Résumé et du hub de grammaire.
      ⚠️ En minuscules avec majuscule initiale : les capitales de .unit-sep sont du CSS. */
   court:'Les harfs بِ · عَلَى · لِ',
   sub:'بِ · عَلَى · لِ — la grammaire par la manipulation · 9 leçons' },
 /* Unité 10 : u10:true → u10Disques() (parcours.js), même dispositif que l'unité 9.
    ⚠️ sub compte les disques RÉELS, pas les neuf de l'accueil.
    words:[] : les groupes nominaux n'entrent pas encore en révision (à trancher avec Myriam).
    (journal : donnees.js · unité 10, ouverture) */
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
