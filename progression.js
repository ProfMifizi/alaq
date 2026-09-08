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
