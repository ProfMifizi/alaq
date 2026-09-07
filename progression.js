/* ═══════════════════════════════════════════════════════════════════════════
   progression.js — LA PERSISTANCE ET L'ÉTAT LOCAL (sorti d'index.html le 07/09/2026, BUILD progression-locale-07sept)
   ───────────────────────────────────────────────────────────────────────────
   Ici vivent : HEARTS_MAX et DEF (l'état par défaut), load()/save()/saveLocal()
   (les trois écritures sur localStorage.alaq2 — le commentaire de saveLocal,
   plus bas, explique la RÈGLE qui les distingue : save() date l'écriture pour
   la synchro nuage, saveLocal() ne date rien, jamais pour une vraie
   progression), `S` (l'objet de progression chargé au démarrage), dkey() (la
   clé d'un disque), fixOrdreFormes() (une migration idempotente),
   unitValidated()/unitUnlocked() (le déverrouillage des unités), et
   isDone()/setDone() — une API neuve, l'accroche prévue pour la synchro
   Supabase du POC-5 (rien ne les appelle encore dans index.html : elles
   enveloppent le même S.done[dkey(...)] que le reste de l'app, pour que
   POC-5 ait UN SEUL point d'entrée à brancher sur le nuage plutôt que des
   centaines de S.done[dkey(...)] éparpillés).

   ⚠️ SCRIPT CLASSIQUE, ET IL DOIT LE RESTER. Chargé par
   <script src="progression.js"></script>, juste sous trace-lettres.js et AVANT
   le grand script d'index.html — qui lit S et appelle save()/saveLocal()/
   dkey()/unitUnlocked() dès le premier rendu (refreshStats, showTab('home')).
   ⛔ NI `import`/`export`, NI `defer`, NI `type="module"` : un module est
   différé d'office et s'exécuterait APRÈS le grand script — chaque S.xxx du
   démarrage lèverait un ReferenceError, l'app s'ouvrirait sur un écran mort.

   fixOrdreFormes() et unitValidated() lisent UNITS, discsFor() et buildForms —
   déclarés plus bas dans index.html : comme setupTrace() dans trace-lettres.js,
   ils ne les résolvent qu'À L'APPEL, jamais à la définition. Cette liste est
   le contrat entre les deux fichiers : UNITS, discsFor, buildForms. save()
   résout cloudSaveSoon() de la même façon.

   POURQUOI `S` A BESOIN D'UN ACCESSEUR SUR window QUAND HEARTS_MAX/DEF N'EN
   ONT PAS. `save`, `saveLocal`, `dkey`, `unitUnlocked` sont des `function` :
   elles deviennent des propriétés de `window` du simple fait d'être déclarées
   dans un script classique — exactement comme ico()/icoImg() dans assets.js,
   rien à écrire de plus. Mais `S` est un `let`, réaffecté à TROIS endroits
   d'index.html (cloudPull, doReset, importSave) — un `window.S=S` posé une
   seule fois ici deviendrait FAUX dès la première réaffectation. L'accesseur
   ci-dessous fait de `window.S` un getter/setter qui lit/écrit la liaison
   lexicale `S`, jamais une copie — même principe que les getters de
   `window.__alaqHoteU8` dans index.html (« ON NE CAPTURE JAMAIS L'ÉTAT DE
   L'APP, ON LE DEMANDE »).

   Le format de localStorage.alaq2 ne change pas d'un bit : load()/save()/
   saveLocal() sont un déplacement verbatim, pas une réécriture.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ================= ÉTAT ================= */
const HEARTS_MAX=7; // 7 vies — comme les sabʿ al-mathānī de la Fātiḥa
/* ⚠️ 17/08 — `qari` PASSE À al-Ḥuṣarī. C'est ICI que se jouait le « pas de surlignage » signalé
   par Myriam : le défaut était Ayman Suwayd, la SEULE voix de tête sans repères `HOROV`, donc
   la fonction phare était morte pour qui n'ouvre jamais le sélecteur. al-Ḥuṣarī : 6,1 s de
   tempo (le plus lent des voix segmentées), 7/7 versets complets, fichiers hébergés — et c'est
   le muṣḥaf muʿallim, la récitation enregistrée POUR enseigner. Voir QARI_DEFAUT. */
const DEF={xp:0,done:{},tests:{},hearts:7,streak:0,lastDay:null,heartDay:null,qari:'ar.husary'};
function load(){try{return Object.assign({},DEF,JSON.parse(localStorage.getItem('alaq2')||'{}'))}catch(e){return Object.assign({},DEF)}}
function save(){try{S._ts=Date.now();localStorage.setItem('alaq2',JSON.stringify(S))}catch(e){} cloudSaveSoon();}
/* 🔴 04/09 — L'HORODATAGE MENTAIT, ET C'EST LA CAUSE DES TROIS INCIDENTS DE SYNCHRO.
   Signalement de Myriam : « sur mon telephone j'ai 10 jours d'epi, sur le navigateur 1 ».
   S._ts est censé dire QUAND LA PROGRESSION A CHANGÉ — c'est sur lui que cloudPull
   arbitre entre deux appareils du même compte. Or save() le rajeunit à CHAQUE écriture,
   y compris pour du pur ménage qui ne porte aucune progression : rollConstance() appelle
   save() SANS CONDITION à chaque chargement de page, majJour() recharge les cœurs, la
   migration v7 se réécrit. Ces trois-là sont SYNCHRONES au chargement ; cloudPull, lui,
   part sur le réseau et répond après. Quand il arbitre, l'état local — vieux de trois
   jours dans son CONTENU — porte une date estampillée « il y a une seconde ». Il gagne,
   puis la branche perdante le POUSSE dans le nuage : la série et les leçons de l'autre
   appareil sont effacées.
   ⚠️ LA RÈGLE RÉELLE N'ÉTAIT DONC PAS « le plus récent gagne » MAIS « le dernier
   appareil ouvert gagne », quel que soit son contenu — un ping-pong, d'où le retour
   sans fin du symptôme. Et c'est ce qui neutralisait AUSSI le garde du 28/08 dans
   cloudSaveNow : comparer remote._ts à un S._ts qui vaut « maintenant » ne protège rien.
   Mesuré avec le code réel en bac à sable (previews/_verif_sync_nuage.html) : avec le
   ménage, le navigateur garde sa série de 1 jour ET l'écrit dans le nuage ; sans lui,
   il prend bien les 10 jours. Un seul geste sépare les deux.
   saveLocal() enregistre sur l'appareil et RIEN D'AUTRE : ni horodatage, ni envoi.
   ⛔ NE PAS l'utiliser pour une progression (leçon, cœur perdu, mot révisé, minutes
   d'objectif, score de constance) : elle ne rejoindrait jamais le nuage. Il est réservé
   à ce qui se RECALCULE tout seul sur chaque appareil à partir de la date du jour. */
function saveLocal(){try{localStorage.setItem('alaq2',JSON.stringify(S))}catch(e){}}

let S=load();
/* window.S : voir l'en-tête — un accesseur, jamais une capture, à cause des
   trois réaffectations de S dans index.html (cloudPull, doReset, importSave). */
Object.defineProperty(window,'S',{configurable:true,get(){return S;},set(v){S=v;}});

function dkey(u,i){return 'U'+UNITS[u].no+'-D'+i;}

/* Ordre corrigé le 02/08 : « Les formes » passe AVANT « Dans la Fātiḥa ». La progression est
   enregistrée par NUMÉRO de disque (dkey), donc la case du repérage devient celle des formes.
   On la décoche pour la SEULE élève concernée — repérage fait, formes pas faites — sinon elle
   sauterait « Les formes » sans jamais l'apprendre. Les deux autres cas (rien fait / tout fait)
   restent justes tels quels. ⚠️ Le drapeau doit être ÉCRIT même quand rien ne change : sans lui,
   une élève arrivée NORMALEMENT à « formes faites, repérage pas fait » serait décochée à tort. */
function fixOrdreFormes(){
  if(S.fixFormes0208)return;
  S.fixFormes0208=1;
  UNITS.forEach(function(U,u){
    const i=discsFor(u).findIndex(function(d){return d.build===buildForms;});
    if(i<0)return;
    if(S.done[dkey(u,i)]&&!S.done[dkey(u,i+1)])delete S.done[dkey(u,i)];
  });
  /* ⚠️ 04/09 — saveLocal, PAS save : une MIGRATION n'est pas une progression. Elle
     s'exécute au chargement, AVANT que cloudPull ait pu arbitrer — avec save() elle
     rajeunissait S._ts et faisait gagner l'état local le plus pauvre (voir saveLocal).
     Elle est idempotente et gardée par son drapeau : elle se rejoue seule sur chaque
     appareil, y compris sur l'état qui revient du nuage (cloudPull la rappelle). Son
     résultat rejoindra le nuage à la première vraie progression. */
  saveLocal();
}

function unitValidated(idx){ if(idx<0||idx>=UNITS.length)return false; const ds=discsFor(idx); return !!(S.done&&S.done[dkey(idx,ds.length-1)]); }
function unitUnlocked(idx){ const U=UNITS[idx]; if(!U||!U.ready)return false; if(U.no===1)return true; return unitValidated(idx-1); }

/* ── isDone()/setDone() — L'ACCROCHE DU POC-5, PAS ENCORE APPELÉE ────────────
   index.html continue d'écrire S.done[dkey(u,i)]=true directement, comme avant
   (des centaines d'endroits, hors du périmètre de cette étape) : ces deux-là
   enveloppent EXACTEMENT la même paire (S.done, dkey), pour que la synchro
   Supabase du POC-5 ait un seul point d'entrée à brancher — pas une réécriture
   des appels existants. */
function isDone(u,i){ return !!(S.done&&S.done[dkey(u,i)]); }
function setDone(u,i,v){
  if(!S.done)S.done={};
  if(v===false)delete S.done[dkey(u,i)];
  else S.done[dkey(u,i)]=true;
}
