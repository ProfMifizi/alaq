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
/* 🔴 08/09 (POC-5 sous-lot 4) — LA RÈGLE save/saveLocal PREND UN TROISIÈME SENS.
   Elle disait « save() date et envoie, saveLocal() ne date rien et n'envoie rien ».
   Elle dit désormais AUSSI : save() DÉCLARE au serveur, saveLocal() ne déclare rien.
   C'est ce qui rend muettes PAR CONSTRUCTION les deux migrations destructrices et
   fixOrdreFormes — elles s'exécutent au chargement, avant tout arbitrage, et ne
   doivent surtout pas remplir la file d'un état dont on ignore encore le propriétaire. */
function save(){try{S._ts=Date.now();localStorage.setItem('alaq2',JSON.stringify(S))}catch(e){} _semerLeDiff(); cloudSaveSoon();}
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

/* ═══════════════════════════════════════════════════════════════════════════
   LE MOTEUR DE SYNCHRONISATION (déménagé d'index.html le 08/09/2026,
   POC-5 sous-lot 2 — BUILD à venir)
   ───────────────────────────────────────────────────────────────────────────
   CE QUI SUIT EST UN DÉPLACEMENT VERBATIM. Pas une ligne réécrite, pas un
   commentaire retouché : les récits des trois incidents de synchronisation
   (17/08 le nuage écrasé par un état étranger, 28/08 l'onglet dormant, 04/09
   l'horodatage menteur) sont la mémoire de ce code, et ils voyagent avec lui.
   Toute retouche au passage aurait rendu le banc incapable de dire si une
   différence vient du déplacement ou de l'amélioration.

   POURQUOI ICI. Le moteur a besoin de `S`, `save()` et `saveLocal()` — qui
   vivent au-dessus — et le POC-5 va lui adjoindre une file d'attente hors ligne
   qui doit être disponible AU PREMIER RENDU, en même temps que `S`. Or ce
   fichier est le seul script classique chargé AVANT le grand script de la page.

   L'ORDRE EST SÛR, ET IL A ÉTÉ MESURÉ. Rien ici ne s'exécute au chargement
   sinon : trois littéraux, une création de client Supabase sous try/catch (le
   CDN est `defer`, donc `window.supabase` n'existe pas encore — `SB` reste nul
   et le grand script le recrée à DOMContentLoaded), et trois `addEventListener`.
   Aucune de ces lignes ne touche à index.html.

   LE CONTRAT AVEC index.html, dans les deux sens.
   ① Ce moteur résout À L'APPEL, jamais à la définition : verrouConnexion,
      verrouLibere, renderHome, refreshStats, renderProg, _progVisible,
      fixOrdreFormes, toast, _homeFocusPending. Même principe que setupTrace()
      dans trace-lettres.js.
   ② index.html LIT SB, CLOUD, SUPA_URL, SUPA_ANON, cloudPull, cloudSaveNow,
      cloudSaveSoon, cloudInit, _syncT — et il ÉCRIT dans `SB` (au
      DOMContentLoaded, quand le CDN Supabase est enfin chargé). C'est possible
      parce que les scripts classiques PARTAGENT LA MÊME PORTÉE LEXICALE
      GLOBALE : mesuré dans un vrai navigateur avant ce déménagement, pas supposé.
   ⚠️ `SB`, `CLOUD`, `_syncT`, `_syncPret` sont des `let`/`const` : ils ne sont
      donc PAS des propriétés de `window`. Les `function` (cloudPull, cloudInit…)
      le sont, du simple fait d'être déclarées. Même règle que pour `S` plus haut.

   GARDE : outils/verifier-sync-nuage.mjs éprouve les cinq branches de
   l'arbitrage et les trois verrous dans un bac node:vm. Il localise ce bloc PAR
   SON CONTENU, dans index.html ou ici — il rend donc les mêmes 28 verdicts des
   deux côtés du déménagement. C'est ce qui prouve qu'aucune ligne ne s'est
   perdue au copier-coller.
   ═══════════════════════════════════════════════════════════════════════════ */
const SUPA_URL='https://ykggxipgirgjwhhxmhbn.supabase.co';
const SUPA_ANON='sb_publishable_IpnRJf3j3JfyRhQ0WWSeww_V5ctBrkh'; // clé PUBLIQUE (la RLS protège les données)
let SB=null; try{ if(window.supabase)SB=window.supabase.createClient(SUPA_URL,SUPA_ANON,
  {auth:{persistSession:true,autoRefreshToken:true}}); }catch(e){} // la connexion SURVIT aux visites : jeton gardé et renouvelé tout seul (Myriam 13/07)
const CLOUD={user:null};
let _syncT=null;
function cloudSaveSoon(){ if(!SB||!CLOUD.user)return; clearTimeout(_syncT); _syncT=setTimeout(cloudSaveNow,2000); }
let _syncPret=false; // la première synchro de la session a-t-elle eu lieu ? (voir cloudSaveNow)

/* ═══ LES DEUX OUTILS DE SÛRETÉ (08/09/2026, POC-5 sous-lot 3) ═══════════════
   ① _avecGarde — AUCUN APPEL RÉSEAU SANS DÉLAI DE GARDE. Une requête qui ne se
   règle jamais (réseau qui accepte mais ne répond pas — le métro, un portail
   captif) laisse `await` suspendu POUR TOUJOURS. Si c'est celui de cloudPull,
   `_syncPret` ne passe jamais à vrai : plus une seule écriture ne part au nuage
   pour le reste de la session, sans un message, sans une trace. Le minuteur est
   annulé dès que la promesse se règle — sinon il maintiendrait la page en vie.
   ② _ticketSync — UNE PANNE DE SYNCHRO NE DOIT PLUS ÊTRE MUETTE. Le moteur
   avalait tout dans des `catch(e){}` nus : c'est ce qui a permis aux trois
   incidents de l'été de vivre des semaines sans qu'aucun signal ne remonte.
   On passe désormais par le collecteur du pupitre — résolu À L'APPEL, comme le
   reste du contrat avec index.html, et sans jamais lever si le collecteur
   n'existe pas (ce fichier doit rester utilisable seul, en bac). */
function _avecGarde(p, ms, quoi){
  var t=null;
  return Promise.race([
    Promise.resolve(p).then(function(v){ clearTimeout(t); return v; },
                            function(e){ clearTimeout(t); throw e; }),
    new Promise(function(_,rej){ t=setTimeout(function(){
      rej(new Error('delai depasse ('+ms+' ms) : '+quoi)); }, ms); })
  ]);
}
function _ticketSync(quoi, e){
  try{ if(typeof tikEnvoyer==='function')
    tikEnvoyer('suspect','synchro — '+quoi+' : '+((e&&e.message)||e||'?')); }catch(_){}
}
async function cloudSaveNow(){
  try{ if(!SB||!CLOUD.user)return;
    /* 🔴 04/09 — LE FILET STRUCTUREL : ON NE PARLE PAS AVANT D'AVOIR ÉCOUTÉ.
       Le correctif de l'horodatage (voir saveLocal) rend l'arbitrage honnête, mais il
       repose sur un recensement des écritures de ménage — et un recensement se périme :
       il suffira d'un save() ajouté un jour dans une fonction de démarrage pour rouvrir
       la faille, EN SILENCE. Ce verrou ferme la classe entière : quoi qu'il arrive au
       chargement, cet appareil n'écrit dans le nuage qu'APRÈS avoir lu ce qu'il contient.
       ⚠️ Il ne perd rien : au lieu de refuser, on va CHERCHER le nuage — cloudPull pose
       _syncPret dès qu'il a lu, puis pousse lui-même si le local est bien le plus récent.
       Pas de récursion : le drapeau est posé AVANT son propre appel à cloudSaveNow. */
    if(!_syncPret){ await cloudPull(); return; }
    /* ⚠️ 28/08 — LE VRAI COUPABLE : PAS UN ENVOI QUI ÉCHOUE, UN ENVOI TROP GÉNÉREUX.
       Les journaux Supabase le montrent noir sur blanc : chaque POST vers profiles
       réussit (200), y compris ceux du téléphone de Myriam pendant tout un après-midi
       de test de l'unité 9. Le trou vient d'ailleurs : un onglet (ou l'app) resté
       ouvert des heures pousse le `S` figé au moment de SON chargement — `cloudPull`
       n'est jamais rejoué en cours de session. Si un AUTRE appareil a progressé
       entre-temps (le téléphone), cet onglet périmé écrase en silence, plus tard,
       la progression la plus récente avec la sienne, plus pauvre. Reproduit sur son
       compte : la dernière écriture (03h35) venait d'un Mac resté ouvert depuis
       avant les 3 leçons faites sur téléphone (21h11-21h14) — elle les a effacées.
       Parade minimale et sûre : ne JAMAIS pousser un état plus vieux que ce que le
       nuage porte déjà. Ne corrige pas l'onglet périmé (il reste affiché tel quel),
       mais l'empêche de faire des dégâts — cloudPull, lui, le rattrapera au
       prochain chargement. */
    /* 🔴 08/09 — L'IDENTITÉ SE CAPTURE AVANT L'ATTENTE, ET SE REVÉRIFIE APRÈS.
       Entre le départ de la requête et sa réponse, la session peut expirer, ou
       l'élève peut changer de compte. Relire CLOUD.user.id APRÈS l'await, c'est
       écrire dans le compte de quelqu'un d'autre. On fige l'identité, et si elle
       a bougé on abandonne : cloudPull rattrapera au prochain passage. */
    const uid=CLOUD.user.id;
    const r=await _avecGarde(SB.from('profiles').select('state').eq('user_id',uid).maybeSingle(),
                             8000, 'lecture du profil avant envoi');
    /* 🔴 08/09 — UNE ERREUR N'EST PAS UN NUAGE VIDE. Sans ce garde, `r.data` vaut
       null quand la requête échoue, `remote` devient indéfini, et le garde du
       28/08 juste en dessous laisse passer l'envoi comme si le nuage ne portait
       rien. Une coupure passagère devenait une écriture. */
    if(r&&r.error) throw r.error;
    if(!CLOUD.user||CLOUD.user.id!==uid)return;   // le compte a changé pendant l'attente
    const remote=r&&r.data&&r.data.state;
    if(remote&&(remote._ts||0)>(S._ts||0))return;
    const w=await _avecGarde(SB.from('profiles').upsert({user_id:uid, prenom:S.prenom||null, state:S, updated_at:new Date().toISOString()}),
                             8000, 'envoi du profil');
    /* 🔴 08/09 — L'ENVOI QUI ÉCHOUE CESSE D'ÊTRE MUET. supabase-js ne LÈVE pas sur
       une erreur : il résout avec {error}. Ce `catch(e){}` nu ne voyait donc
       jamais un refus de la base — ni une RLS qui se referme, ni une contrainte
       violée, ni un jeton périmé. La progression restait juste... locale. */
    if(w&&w.error) throw w.error;
  }catch(e){ _ticketSync('envoi', e); }
}
/* ⚠️ 28/08 — LA FENÊTRE DE 2 S POUVAIT AVALER UNE LEÇON ENTIÈRE. `cloudSaveSoon`
   attend 2 s avant de pousser (pour ne pas marteler Supabase à chaque `save()`) —
   mais une élève qui ferme l'app ou change d'onglet JUSTE après avoir fini une
   leçon coupe ce délai : la progression reste correcte en local, mais ne
   rejoint JAMAIS le nuage. Signalé par Myriam (28/08) : une leçon d'unité 9
   terminée sur un appareil restait invisible sur un autre, même après
   déconnexion/reconnexion — la reconnexion ne peut pas retrouver ce que le
   nuage n'a jamais reçu. On pousse donc IMMÉDIATEMENT dès que l'app passe en
   arrière-plan, tant qu'un envoi est encore en attente. */
document.addEventListener('visibilitychange',function(){
  if(document.hidden&&_syncT){ clearTimeout(_syncT); _syncT=null; cloudSaveNow(); }
});
async function cloudPull(){ // fusion : le plus récent gagne ; premier login = on pousse l'état local
  try{ if(!SB||!CLOUD.user)return;
    /* 08/09 — même règle qu'au-dessus : l'identité se fige avant l'attente. */
    const uid=CLOUD.user.id;
    const r=await _avecGarde(SB.from('profiles').select('state').eq('user_id',uid).maybeSingle(),
                             8000, 'lecture du profil au démarrage');
    /* 🔴 08/09 — ON NE POSE _syncPret QU'APRÈS UNE LECTURE RÉUSSIE. Avant, le
       drapeau était posé quoi qu'il arrive : une requête en erreur ouvrait donc
       le verrou du 04/09 sur un nuage qu'on n'avait PAS lu, et la branche `else`
       plus bas poussait l'état local en croyant le compte vierge. Une coupure
       passagère se transformait en écriture. Si la lecture échoue, on lève : le
       verrou reste fermé, et le prochain passage réessaiera. */
    if(r&&r.error) throw r.error;
    if(!CLOUD.user||CLOUD.user.id!==uid)return;   // le compte a changé pendant l'attente
    const remote=r&&r.data&&r.data.state;
    _syncPret=true;  // le nuage est LU : cet appareil a le droit de parler (voir cloudSaveNow)
    /* ═══ 🔴 17/08 — LA FUSION POUVAIT DÉTRUIRE LA PROGRESSION DU COMPTE ═══════════════
       Myriam : « je ne retrouve pas ma progression faite sur l'app sur mon ordinateur quand
       je me connecte avec mon mail. C'est très problématique pour le user. » C'était pire que
       ça : la règle « le plus récent gagne » comparait deux horodatages SANS regarder à QUI
       appartient l'état local. Or sur un appareil qu'on vient d'utiliser, `S._ts` vaut
       « maintenant » — donc le local gagnait, ET la branche `else` renvoyait cet état pauvre
       vers le nuage (`cloudSaveNow`). **La progression du téléphone était écrasée dans le
       cloud**, pas seulement ignorée sur l'ordinateur.
       Le garde-fou `_fresh` existait mais n'était posé qu'à la DÉCONNEXION ou via « j'ai déjà
       un compte » à l'inscription — jamais quand on se connecte depuis Profil, le chemin normal.
       LA RÈGLE JUSTE : un horodatage ne vaut que si l'état local appartient DÉJÀ à ce compte.
       On retient donc l'identifiant du dernier compte vu (`_uid`). S'il diffère — ou s'il est
       absent, cas d'un appareil jamais connecté — le local n'appartient à personne ou à
       QUELQU'UN D'AUTRE : le nuage fait foi, quel que soit son âge. Comparer des dates n'a de
       sens qu'entre deux états du MÊME compte.
       ⚠️ Corollaire : la branche `else` n'écrit plus dans le nuage que quand on est certain
       que le local est bien celui de ce compte. C'est elle qui faisait les dégâts. */
    const memeCompte = S._uid && CLOUD.user && S._uid===CLOUD.user.id;
    /* ⚠️ 17/08 soir — LA FENÊTRE DE MIGRATION, attrapée par la question de Myriam (« c'est
       réglé ou non ? »). Avant ce build, AUCUN état ne portait `_uid` : son téléphone —
       riche et légitime — est indistinguable d'un appareil étranger. Trancher à la DATE
       rejouerait le bug du matin ; trancher « nuage d'office » aurait DÉTRUIT la progression
       du téléphone à sa première reconnexion (le nuage peut porter l'état pauvre poussé par
       l'ordinateur). Pour un état SANS _uid on garde donc le plus RICHE — le nombre de
       leçons cochées, la seule mesure qui ne mente pas — et l'état écarté est mis de côté
       dans `alaq2_ecarte`, jamais détruit. Dès que `_uid` est posé (ce build le pose
       partout), la règle stricte reprend : les dates ne se comparent qu'au sein d'un même
       compte. Risque assumé et documenté : pendant cette fenêtre, un appareil jamais
       déconnecté par son ancien propriétaire peut imposer son état plus riche — le cas
       normal reste couvert par le nettoyage de cloudLogout. */
    const richesse=function(x){ return x?Object.keys(x.done||{}).length:0; };
    let takeRemote;
    /* 🔴 08/09 — LE TROU QUE LE CORRECTIF DU 17/08 N'AVAIT PAS FERMÉ. Il ne
       traitait que le cas où le nuage porte DÉJÀ un état. Quand il est vide, cette
       ligne gardait le local sans regarder à qui il appartient — et la branche
       `else` le poussait. Sur un appareil partagé (le téléphone de Myriam prêté,
       ou son compte puis celui de Mohamed), la progression d'une élève entrait
       donc dans le compte d'une autre À LA PREMIÈRE CONNEXION du second compte.
       ⚠️ MESURÉ AVANT CORRECTION, dans outils/verifier-sync-nuage.mjs : 82 leçons
       du compte B poussées dans le nuage du compte A, et adoptées par lui.
       La règle juste est la même que partout ailleurs : un état ne vaut que s'il
       appartient à ce compte, ou s'il n'appartient à personne (fenêtre de
       migration). L'état d'un TIERS n'est ni gardé, ni poussé — il est mis de
       côté dans alaq2_ecarte comme tout perdant, et le compte neuf part vierge. */
    const _etranger = S._uid && S._uid!==CLOUD.user.id;
    if(!remote && _etranger){ takeRemote=true; }   // « prendre » un nuage vide = repartir de DEF
    else if(!remote) takeRemote=false;
    else if(S._fresh) takeRemote=true;
    else if(memeCompte) takeRemote=(remote._ts||0)>(S._ts||0);
    else if(!S._uid) takeRemote=richesse(remote)>=richesse(S);  // fenêtre de migration : propriété INCONNUE
    else takeRemote=true;  // _uid d'un AUTRE compte : la propriété est PROUVÉE, le nuage fait foi — sans heuristique
    /* rien ne s'écrase en silence : l'état perdant est gardé sous une clé de côté */
    try{ var _perdant=takeRemote?S:remote; if(richesse(_perdant)>0)localStorage.setItem('alaq2_ecarte',JSON.stringify(_perdant)); }catch(e){}
    delete S._fresh;
    if(takeRemote){
      S=Object.assign({},DEF,remote); delete S._fresh;
      /* 🔴 08/09 (sous-lot 4) — LE MARQUEUR SUIT S. cloudPull est l'un des trois points
         de réaffectation CONNUS : sans cette ligne, le diff se désarmerait à la première
         synchro descendante et ne déclarerait plus jamais rien. Trouvé par le banc, qui
         semait S de la même façon. Les deux autres points (doReset, importSave) vivent
         dans index.html : doReset laisse volontairement le diff désarmé jusqu'au
         sous-lot 5 (échouer fermé), importSave passe par SYNC.importe(). */
      try{ if(typeof _poserTag==='function')_poserTag(S); }catch(e){}
      S._uid=CLOUD.user.id;                           // désormais cet appareil sait à qui est cet état
      S.done=S.done||{};S.tests=S.tests||{};S.err=S.err||{};S.rev=S.rev||{};S.letSeen=S.letSeen||{};S.revIn=S.revIn||{d:'',n:0};
      /* ⛔ `S.rev` EST RÉSERVÉ AU VOCABULAIRE — un mot y porte son palier et sa
         prochaine date. Une notion de grammaire n'est pas un mot : elle ne s'oublie
         pas de la même façon et ne se « rappelle » pas à une date. Elle vit donc à
         part, et l'ancienne progression d'une élève traverse la mise à jour sans
         migration (spec §3.2). */
      S.revGram=S.revGram||{};
      fixOrdreFormes(); // l'état du nuage peut venir d'un appareil resté sur l'ancien ordre
      try{localStorage.setItem('alaq2',JSON.stringify(S));}catch(e){}
      // élève reconnue (session encore vivante) : on referme l'onboarding qui aurait pu s'ouvrir
      if(S.onboarded){try{document.getElementById('onb').classList.remove('on');}catch(e){}}
      _homeFocusPending=true; // et on recentre sur son disque courant
      try{refreshStats();renderHome();}catch(e){}
    } else {
      /* On n'arrive ici que dans DEUX cas sûrs : ① même compte, et l'état local est le plus
         récent — c'est la vraie fusion ; ② le compte n'a AUCUNE ligne dans le nuage (première
         inscription), et l'état local devient légitimement le sien. Dans les deux cas on peut
         écrire dans le nuage sans rien détruire. ⚠️ Avant le 17/08, on y arrivait AUSSI quand
         un autre compte se connectait sur un appareil déjà utilisé — et on y écrasait sa
         progression. C'est exactement ce que `_uid` ferme. */
      if(CLOUD.user)S._uid=CLOUD.user.id;
      try{localStorage.setItem('alaq2',JSON.stringify(S));}catch(e){}
      cloudSaveNow();
    }
  }catch(e){}
}
async function cloudInit(){
  if(!SB)return;
  try{
    const g=await SB.auth.getSession();
    const sess=g&&g.data&&g.data.session;
    if(sess&&sess.user){ CLOUD.user=sess.user; cloudPull(); }
    else { verrouConnexion(); }   /* 17/08 : aucune session ET cet appareil connaissait un compte */
    SB.auth.onAuthStateChange((ev,se)=>{ CLOUD.user=(se&&se.user)||null;
      if(_progVisible())renderProg();
      /* une session qui EXPIRE en cours de route doit verrouiller elle aussi : c'est
         exactement ce qui est arrivé à Myriam après la mise à jour. */
      if(!CLOUD.user)verrouConnexion(); else verrouLibere();
    });
  }catch(e){}
}

/* ⚠️ 28/08 — SANS CE RAFRAÎCHISSEMENT, UN ONGLET RESTÉ OUVERT DÉRIVE. Sa copie
   locale de S date du chargement de la page et ne voit plus rien de ce qui a
   progressé entre-temps sur un autre appareil — jusqu'à ce qu'elle finisse,
   PLUS TARD, par ÉCRASER cette progression au prochain envoi (le garde-fou de
   cloudSaveNow protège l'écrasement, mais un onglet qui ne se resynchronise
   jamais reste aveugle indéfiniment). On rejoue donc cloudPull() à chaque
   retour sur l'app, comme majJour() juste au-dessus — SAUF en pleine leçon,
   où remplacer S sous les pieds de l'élève casserait l'écran en cours. */
function cloudResync(){
  if(document.hidden)return;
  var pl=document.getElementById('player');
  if(pl&&pl.classList.contains('on'))return; // leçon en cours : on ne touche à rien
  try{cloudPull();}catch(e){}
}
document.addEventListener('visibilitychange',function(){ if(!document.hidden)cloudResync(); });
window.addEventListener('focus',cloudResync);

/* ═══════════════════════════════════════════════════════════════════════════
   LA FILE D'ENVOI ET LE DIFF — EN OBSERVATION (POC-5 sous-lot 4, 08/09/2026)
   ───────────────────────────────────────────────────────────────────────────
   ⛔ RIEN NE PART. La constante ENVOI vaut false : la file s'écrit, le diff
   tourne, les intentions s'empilent — et aucun appel serveur neuf n'est émis.
   C'est délibéré, et c'est le point le plus utile du découpage : on mesure sur
   onze comptes réels ce que la file CONTIENDRAIT, avant qu'un seul octet ne
   parte. `SYNC.etat()` se lit dans la console pour voir ce qui s'y accumule.

   POURQUOI UN DIFF PLUTÔT QUE DES APPELS PARTOUT. Une leçon est un ÉTAT : elle
   est encore dans S demain, donc une déclaration ratée se répare toute seule au
   prochain save(). Une graine est un ÉVÈNEMENT : S.graines ne porte aucune
   histoire, une graine manquée ne revient jamais. Ce qui s'auto-répare prend le
   diff (zéro ligne à ajouter dans index.html) ; ce qui ne s'auto-répare pas
   prend l'appel explicite, avec son identifiant tiré UNE SEULE FOIS.

   LES TROIS DÉCISIONS DE MYRIAM, GRAVÉES ICI :
   ② une entrée fautive s'ISOLE — compteur d'échecs PAR ENTRÉE, jamais par file.
      Une seule leçon abîmée ne doit pas condamner les vingt autres.
   ③ le solde se corrige EN SILENCE — pas de bandeau, pas de message.
   ④ à l'inscription, la progression sans compte est LIVRÉE au serveur.

   ⚠️ AUCUNE DATE ABSOLUE N'ENTRE DANS UNE DÉCISION DU MOTEUR. Les horodatages
   écrits dans la file sont là pour se LIRE à froid, jamais pour décider : une
   horloge d'appareil fausse ne doit rien pouvoir geler.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═════════════════════ §3 · LA FILE ═════════════════════ */
const ENVOI = false;      /* ⛔ sous-lot 4 : on observe, on n'envoie pas. */
const OB_CLE='alaq_outbox_v1', CONNU_CLE='alaq_connu_v1', IGNORE_CLE='alaq_ignore_v1';
const OB_MAX=300;         // borne dure de la file
const OB_REBUT_MAX=50;    // les refusées, gardées AVEC leur motif
const OB_REFUS_MAX=3;     // refus explicites tolérés — PAR ENTRÉE (décision ②)
const GRAM_PLAFOND=40;    // filet : une session de grammaire n'émet pas plus que ça

function _estTableau(x){ return Object.prototype.toString.call(x)==='[object Array]'; }
function _lire(cle,dflt){ try{ var t=localStorage.getItem(cle); return t?JSON.parse(t):dflt; }catch(e){ return dflt; } }

/* ⛔ ON RELIT CE QU'ON VIENT D'ÉCRIRE. Les six écritures d'alaq2 avalent leur échec
   dans un try/catch nu ; pour la file c'est interdit, le principe étant « la file est
   sur le disque AVANT toute tentative ». Et une exception n'est pas la seule façon
   d'échouer : Safari en navigation privée a déjà accepté un setItem sans rien garder.
   ⛔ ET ON NE FAIT JAMAIS DE PLACE EN PURGEANT alaq2_ecarte : c'est l'unique copie de
   l'état perdant de chaque arbitrage, « jamais détruit » dit le commentaire du 17/08.
   On sacrifie d'abord le rebut (purement informatif), qui ne coûte rien à perdre. */
let _disqueKO=0, _disqueTicket=false;
function _ecrire(cle,txt){
  try{ localStorage.setItem(cle,txt); if(localStorage.getItem(cle)===txt)return true; }catch(e){}
  try{ if(_OB&&_OB.r&&_OB.r.length){ _OB.r=[]; localStorage.setItem(cle,txt);
         if(localStorage.getItem(cle)===txt)return true; } }catch(e){}
  _disqueKO++;
  if(!_disqueTicket){ _disqueTicket=true;
    try{ if(typeof tikEnvoyer==='function')
      tikEnvoyer('suspect','outbox — ecriture '+cle+' refusee ou non conservee'); }catch(e){} }
  return false;
}

/* La file : { f: [entrées en attente], r: [rebut, avec motif] }.
   Une entrée : { id, k, d, uid, n } — n = nombre de refus explicites subis.
   ⚠️ `uid` EST DANS CHAQUE ENTRÉE, et c'est ce qui empêche le pire scénario : verser
   les graines d'une élève sur le compte d'une autre. Une entrée dont l'uid ne
   correspond pas au compte connecté DORT — elle n'est ni envoyée, ni jetée. */
let _OB=_lire(OB_CLE,{f:[],r:[]});
if(!_OB||!_estTableau(_OB.f))_OB={f:[],r:[]};
if(!_estTableau(_OB.r))_OB.r=[];

function _obEcrire(){
  /* Deux onglets peuvent écrire la même file. On relit-fusionne-écrit par identifiant :
     une leçon perdue se retrouverait au prochain diff, mais une GRAINE non — elle est un
     évènement, pas un état. C'est l'incident du 28/08 transposé à la file. */
  var d=_lire(OB_CLE,{f:[],r:[]});
  if(d&&_estTableau(d.f)&&d.f.length){
    var vus={}; var i;
    for(i=0;i<_OB.f.length;i++)vus[_OB.f[i].id]=1;
    for(i=0;i<d.f.length;i++)if(d.f[i]&&!vus[d.f[i].id]&&!_acquittees[d.f[i].id])_OB.f.push(d.f[i]);
  }
  if(_OB.f.length>OB_MAX)_OB.f=_OB.f.slice(-OB_MAX);
  if(_OB.r.length>OB_REBUT_MAX)_OB.r=_OB.r.slice(-OB_REBUT_MAX);
  return _ecrire(OB_CLE,JSON.stringify(_OB));
}
var _acquittees={};   // ce que CETTE session a déjà fait acquitter (cimetière court)

/* Le propriétaire de l'état courant. Tant que l'arbitrage n'a pas tranché, on ne sait
   pas à qui appartient S : on se tait plutôt que de déclarer au nom de quelqu'un. */
function _proprio(){
  if(S&&S._uid)return S._uid;
  if(typeof CLOUD!=='undefined'&&CLOUD&&CLOUD.user)return CLOUD.user.id;
  return null;
}

function _enfiler(id,k,d,uid){
  if(!id||!uid)return false;
  if(_acquittees[id])return false;
  for(var i=0;i<_OB.f.length;i++)if(_OB.f[i].id===id)return false;
  for(var j=0;j<_OB.r.length;j++)if(_OB.r[j].id===id)return false;   // déjà au rebut : on n'insiste pas
  _OB.f.push({id:id,k:k,d:d,uid:uid,n:0,le:new Date().toISOString()});
  return true;
}

/* ═════════════════════ §4 · LE DIFF ═════════════════════
   Ce que le serveur sait déjà, par compte : { l:{}, t:{}, w:{}, g:{}, gk:{} }.
   Tant que ENVOI vaut false, rien n'y entre jamais — donc le diff redéclare à chaque
   save() ce qui n'a pas encore été acquitté. C'est voulu : on mesure le VOLUME que la
   file porterait, pas la convergence. */
let _CONNU=_lire(CONNU_CLE,{});
let _IGN=_lire(IGNORE_CLE,{});
function _connuPour(uid){
  var c=_CONNU[uid];
  if(!c||typeof c!=='object')c=_CONNU[uid]={l:{},t:{},w:{},g:{},gk:{}};
  if(!c.l)c.l={}; if(!c.t)c.t={}; if(!c.w)c.w={}; if(!c.g)c.g={}; if(!c.gk)c.gk={};
  return c;
}

/* ⚠️ LE MARQUEUR SUR S. `S` est réaffecté à TROIS endroits connus (cloudPull, doReset,
   importSave). Une QUATRIÈME réaffectation ajoutée un jour par quelqu'un qui ne connaît
   pas ce fichier ferait redéclarer l'intégralité d'un état étranger. On pose donc une
   propriété NON ÉNUMÉRABLE sur S : invisible de JSON.stringify (alaq2 ne bouge pas d'un
   bit), mais absente d'un S qu'on n'a pas vu naître. Si elle manque, on DÉSARME le diff
   et on le dit — plutôt que de déclarer n'importe quoi. */
const _tag=('t'+Math.random()).slice(0,12);
let _diffArme=true;
function _poserTag(o){
  try{ Object.defineProperty(o,'_projTag',{value:_tag,enumerable:false,configurable:true,writable:true}); }catch(e){}
}
_poserTag(S);

const GRAM_SLUG={};   // rempli par index.html quand la grammaire aura ses slugs stables

function _semerLeDiff(){
  if(!_diffArme)return false;
  var uid=_proprio(); if(!uid)return false;
  if(!S||S._projTag!==_tag){
    _diffArme=false; _poserTag(S);
    try{ if(typeof tikEnvoyer==='function')
      tikEnvoyer('suspect','sync — S remplace hors des trois points connus : diff desarme'); }catch(e){}
    return false;
  }
  var c=_connuPour(uid), bouge=false;

  /* ① LES LEÇONS. dkey() écrit 'U<no>-D<i>' où <no> est UNITS[u].no — le NUMÉRO
     d'unité, jamais l'index. La clé porte donc déjà ce qu'attend le serveur. Une clé
     hors format n'est pas devinée : elle est ignorée, elle apparaîtra au rapport. */
  try{
    Object.keys(S.done||{}).forEach(function(k){
      if(!S.done[k]||c.l[k]||_IGN['l:'+k])return;
      var m=/^U(\d{1,2})-D(\d{1,2})$/.exec(k); if(!m)return;
      if(_enfiler('l.'+m[1]+'.'+m[2],'lecon',{unit_no:+m[1],disc_no:+m[2]},uid))bouge=true;
    });
  }catch(e){}

  /* ② LES TEST-OUT. S.tests est indexé par NUMÉRO d'unité. */
  try{
    Object.keys(S.tests||{}).forEach(function(n){
      if(!S.tests[n]||c.t[n]||_IGN['t:'+n])return;
      if(!/^\d{1,2}$/.test(n))return;
      if(_enfiler('t.'+n,'test',{unit_no:+n},uid))bouge=true;
    });
  }catch(e){}

  /* ③ LES PALIERS DU VOCABULAIRE. On n'émet QUE si le palier a bougé : sans ça, chaque
     save() redéclarerait les 261 mots d'un compte chargé. L'identifiant porte le palier,
     donc deux montées successives font deux intentions distinctes. */
  try{
    Object.keys(S.rev||{}).forEach(function(w){
      var r=S.rev[w]; if(!r||!(r.n>0))return;
      if(c.w[w]===r.n||_IGN['w:'+w])return;
      if(_enfiler('w.'+w+'.'+r.n,'rev',
        {type:'word',item_id:w,step:r.n,next_due:r.next,success:true,maj:new Date().toISOString()},uid))bouge=true;
    });
  }catch(e){}

  /* ④ LA GRAMMAIRE. S.revGram[u]={n,ko} n'est pas un palier mais un CUMUL d'écrans vus
     et ratés. Tant que les slugs stables ne sont pas posés, on ne devine pas : on se
     tait. Le plafond évite qu'un compteur aberrant n'émette mille intentions. */
  try{
    Object.keys(S.revGram||{}).forEach(function(u){
      var g=S.revGram[u], slug=GRAM_SLUG[String(u)];
      if(!g||!slug||_IGN['g:'+slug])return;
      var dn=(g.n||0)-(c.g[slug]||0); if(dn<=0)return;
      if(dn>GRAM_PLAFOND)dn=GRAM_PLAFOND;
      var dko=Math.max(0,Math.min(dn,(g.ko||0)-(c.gk[slug]||0)));
      for(var i=1;i<=dn;i++){
        if(_enfiler('g.'+slug+'.'+((c.g[slug]||0)+i),'rev',
          {type:'grammar',item_id:slug,step:1,success:(i>dko),maj:new Date().toISOString()},uid))bouge=true;
      }
    });
  }catch(e){}

  if(bouge)_obEcrire();
  return bouge;
}

/* ═════════════════════ §5 · LES GRAINES ═════════════════════
   Elles se DÉCLARENT, à l'instant du versement : c'est le seul moment où lesson_id et
   sans_faute existent comme variables vivantes. L'identifiant est tiré UNE FOIS et
   conservé : c'est lui qui porte l'idempotence côté serveur.
   ⚠️ Sans compte, il n'y a pas de propriétaire — donc pas d'entrée. C'est la règle que
   Myriam a validée : la progression rejoint le compte à l'inscription (alaq_livrer_blob),
   les graines gagnées avant lui, non. Une règle qui tient dans une phrase. */
let _opSeq=0;
function _declarerGraines(lesson_id,sans_faute,is_daily_goal){
  var uid=_proprio(); if(!uid)return null;
  var l=String(lesson_id||'').toUpperCase();
  if(!/^(U\d{1,2}-D\d{1,2}|EXAM-U\d{1,2}|REV-[A-Z0-9-]{1,32}|DAILY)$/.test(l))return null;
  var id='p.'+l+'.'+Date.now().toString(36)+'.'+(++_opSeq);
  if(_enfiler(id,'graines',{lesson_id:l,sans_faute:!!sans_faute,is_daily_goal:!!is_daily_goal},uid)){
    _obEcrire(); return id;
  }
  return null;
}

/* ═════════════════════ §6 · LE DÉPILAGE — DÉSARMÉ ═════════════════════
   Le code du dépilage n'entre PAS dans ce sous-lot : ENVOI vaut false, et cette
   fonction est le seul point par lequel un octet pourrait partir. Elle existe pour que
   le contrat soit visible, et pour que le sous-lot 5 n'ait qu'un mot à changer. */
function _depiler(){
  if(!ENVOI)return Promise.resolve({envoye:0,motif:'observation'});
  return Promise.resolve({envoye:0,motif:'non implemente'});   // sous-lot 5
}

/* ═════════════════════ §7 · SYNC — ce qu'index.html appelle ═════════════════════ */
var SYNC={
  /* Déclaré au versement des graines (les quatre sites de gagnerGraines). */
  graines:function(lesson_id,sans_faute,is_daily_goal){
    try{ return _declarerGraines(lesson_id,sans_faute,is_daily_goal); }catch(e){ return null; }
  },
  /* Le type de session courante, pour construire un lesson_id 'REV-…' honnête. */
  poseKind:function(k){ try{ SYNC._kind=(typeof k==='string')?k:null; }catch(e){} },
  /* Un code de sauvegarde importé est un texte que l'élève peut éditer : tout son
     contenu est marqué « à ne jamais déclarer », sinon on certifierait du texte saisi. */
  importe:function(){
    try{
      _diffArme=false;
      var c=_connuPour(_proprio()||'?');
      Object.keys(S.done||{}).forEach(function(k){ _IGN['l:'+k]=1; });
      Object.keys(S.tests||{}).forEach(function(n){ _IGN['t:'+n]=1; });
      Object.keys(S.rev||{}).forEach(function(w){ _IGN['w:'+w]=1; });
      _ecrire(IGNORE_CLE,JSON.stringify(_IGN));
      _poserTag(S); _diffArme=true;
    }catch(e){}
  },
  /* Ce que la file contient — à lire dans la console pendant l'observation. */
  etat:function(){
    var parK={};
    for(var i=0;i<_OB.f.length;i++)parK[_OB.f[i].k]=(parK[_OB.f[i].k]||0)+1;
    return {envoi:ENVOI, enAttente:_OB.f.length, parType:parK, rebut:_OB.r.length,
            diffArme:_diffArme, proprio:_proprio(), disqueKO:_disqueKO,
            premieres:_OB.f.slice(0,5).map(function(e){return e.k+' '+e.id;})};
  },
};
try{ window.SYNC=SYNC; }catch(e){}
