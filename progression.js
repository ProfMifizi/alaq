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
/* 🔴 11/09 — `DEF.done` ET `DEF.tests` SONT PARTAGÉS PAR RÉFÉRENCE. `DEF` est un objet
   UNIQUE du module ; `Object.assign` copie une propriété-objet par RÉFÉRENCE, jamais en
   la clonant. Sans les littéraux frais ci-dessous, `S.done` EST `DEF.done` dès qu'un
   état ne porte pas ses propres `done`/`tests` — un appareil neuf, un nuage vide. La
   première leçon écrit alors DANS LA CONSTANTE DU MODULE, pour toute la vie de l'onglet,
   et le compte SUIVANT qui se connecte sans rechargement hérite de cette leçon : elle
   part vers `user_progress` sous SON identifiant, définitivement (aucune policy
   UPDATE/DELETE côté client). REPRODUIT le 11/09 par la revue adversariale, de bout en
   bout, sur l'appareil partagé que ce fichier redoute déjà ailleurs (« le téléphone de
   Myriam prêté, son compte puis celui de Mohamed »). `doReset()` d'index.html contourne
   ce piège depuis toujours (`Object.assign({},DEF,{done:{},tests:{}})`) — ici, non.
   ⚠️ Le format d'alaq2 ne bouge pas d'un bit : on ne change que l'IDENTITÉ des objets. */
function _neuf(){ return Object.assign({},DEF,{done:{},tests:{}}); }
function load(){try{return Object.assign(_neuf(),JSON.parse(localStorage.getItem('alaq2')||'{}'))}catch(e){return _neuf()}}
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
let _refonteVue=0;   // §7 : la state_migrated_at du DERNIER cloudPull réussi — jamais un défaut de 0 par ignorance

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
    const r=await _avecGarde(SB.from('profiles').select('state,state_migrated_at').eq('user_id',uid).maybeSingle(),
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
    /* 🔓 11/09 — LE TAMPON DU DERNIER EFFACEMENT (l'idée de Myriam, reformulée en code).
       `S._ts` est une horloge CLIENT que save() rajeunit à CHAQUE geste, même sans
       nouvelle leçon (06/09) — elle ne peut pas dire si CE contenu est antérieur à un
       effacement. `state_migrated_at` est posée par le SERVEUR, à la ventilation ET à
       chaque « Effacer ma progression » (alaq_effacer_progression) — jamais par un
       client. Comparer deux dates SERVEUR ferme un trou qui existait déjà hors de tout
       sous-lot 6 : REPRODUIT le 11/09 sur le code de production (build 209), sans une
       ligne de ce lot — un ordinateur non reconnecté depuis un effacement, touché par
       un geste anodin (un cœur perdu rajeunit S._ts sans rien changer au contenu),
       GAGNAIT l'arbitrage sur sa vieille date et REPOUSSAIT sa progression effacée
       dans le nuage. Mesuré : 40 leçon(s) ressuscitées, à l'écran ET dans le nuage. */
    const _refonteServeur=(function(){ try{ var d=r&&r.data&&r.data.state_migrated_at;
      var t=d?Date.parse(d):0; return isFinite(t)?t:0; }catch(e){ return 0; } })();
    const _refonteConnue=+S._refonte||0;   // ce que CET appareil a déjà vu, avant tout arbitrage
    _refonteVue=_refonteServeur;           // pour la livraison (§7) : la fraîcheur exigée d'un colis
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
    /* 🔓 11/09 — UN EFFACEMENT JAMAIS VU BAT TOUTE DATE ET TOUTE RICHESSE. Un appareil
       qui n'a pas encore appris qu'un effacement a eu lieu doit s'effacer LUI-MÊME
       avant même de comparer quoi que ce soit : sa richesse ET sa date sont EXACTEMENT
       ce qu'un effacement veut faire disparaître. Ne mord que sur le MÊME compte — un
       état étranger ou de propriété inconnue a déjà sa propre règle, plus stricte. */
    const _reveille = memeCompte && _refonteServeur>_refonteConnue;
    /* 🔴 11/09 (après-midi) — LA COURSE RPC/UPSERT PEUT RESSUSCITER PLUS LOIN QUE
       L'ÉCRAN. Une deuxième revue a REPRODUIT que, dans la fenêtre où le RPC a déjà
       daté l'effacement mais où l'upsert qui vide réellement `remote` n'est pas
       encore arrivé, `_reveille` adoptait `remote` tel quel — encore périmé. Rien
       dans ce fichier n'arrête ensuite ce contenu : le PROCHAIN save() ordinaire
       (perdre un cœur suffit) le repousse via cloudSaveNow (aucun garde sur
       state_migrated_at, seulement une comparaison de _ts client) ET via
       _semerLeDiff→alaq_pousser (le sous-lot 5, qui écrit PERMANENMENT dans
       user_progress, sans lire state_migrated_at non plus). Blinder ces deux tuyaux
       un par un ne fermerait pas un troisième qu'on n'aurait pas vu. LA RÈGLE JUSTE :
       ne JAMAIS laisser du contenu périmé ENTRER dans S. Si remote lui-même n'a pas
       encore rattrapé CE refonte, on adopte du VIDE (DEF), jamais son contenu. */
    const _remotePerime = _reveille && (+((remote&&remote._ts)||0))<=_refonteServeur;
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
    else if(_reveille) takeRemote=true;   // un effacement jamais vu bat toute date (voir plus haut)
    else if(memeCompte) takeRemote=(remote._ts||0)>(S._ts||0);
    else if(!S._uid) takeRemote=richesse(remote)>=richesse(S);  // fenêtre de migration : propriété INCONNUE
    else takeRemote=true;  // _uid d'un AUTRE compte : la propriété est PROUVÉE, le nuage fait foi — sans heuristique
    /* rien ne s'écrase en silence : l'état perdant est gardé sous une clé de côté */
    try{ var _perdant=takeRemote?S:remote; if(richesse(_perdant)>0)localStorage.setItem('alaq2_ecarte',JSON.stringify(_perdant)); }catch(e){}
    /* 🔓 11/09 — CE QU'ON AURA LE DROIT DE LIVRER (§7), capturé ici parce que S change
       de main deux lignes plus bas. _vuFresh : un état explicitement défié (_fresh) ne
       se livre pas plus qu'il ne se compare — le drapeau existe pour dire « ne me fais
       pas confiance », la livraison doit l'entendre autant que l'affichage. */
    var _avantS=S, _vuDistant=remote, _vuMeme=memeCompte, _vuPris=takeRemote, _vuFresh=!!S._fresh;
    delete S._fresh;
    if(takeRemote){
      /* 🔴 11/09 — VOIR _remotePerime CI-DESSUS. Un remote qui n'a pas encore
         rattrapé le refonte qui nous fait ADOPTER remote n'est pas une source sûre :
         on repart de DEF, jamais de son contenu. DEF ne porte pas `_ts` — S._ts vaut
         donc `undefined` s'il n'est pas posé — et c'est tout le sujet de la ligne
         suivante.
         🔴 11/09, LA LEÇON LA PLUS CHÈRE DE LA JOURNÉE. J'avais RETIRÉ ce `_ts` le
         matin même, sur la foi d'une mutation qui ne faisait rougir aucun essai, en
         concluant « redondant ». Il ne l'était pas : aucun essai ne jouait DEUX
         cloudPull de suite dans la fenêtre de course. Au SECOND passage, `_reveille`
         est déjà consommé (S._refonte a rattrapé), donc l'arbitrage retombe sur la
         comparaison ordinaire `(remote._ts||0)>(S._ts||0)` — et un `S._ts` absent y
         vaut 0, que le moindre horodatage distant écrase. Les 40 leçons effacées
         revenaient à l'écran AU PASSAGE SUIVANT. Posé à `_refonteServeur`, `S._ts`
         est par construction ≥ tout `remote._ts` qui a valu `_remotePerime` : le
         distant périmé ne peut plus jamais regagner l'arbitrage, et l'appareil finit
         même par REPOUSSER son état vide (cloudSaveNow), achevant l'effacement que
         l'appareil disparu n'avait pas terminé. Une mutation qui ne mord pas ne
         prouve pas qu'une ligne est morte — elle peut prouver que le banc est court. */
      S=_remotePerime ? _neuf() : Object.assign(_neuf(),remote);
      if(_remotePerime)S._ts=_refonteServeur;
      delete S._fresh;
      /* 🔴 08/09 (sous-lot 4) — LE MARQUEUR SUIT S. cloudPull est l'un des trois points
         de réaffectation CONNUS : sans cette ligne, le diff se désarmerait à la première
         synchro descendante et ne déclarerait plus jamais rien. Trouvé par le banc, qui
         semait S de la même façon. Les deux autres points (doReset, importSave) vivent
         dans index.html : doReset laisse volontairement le diff désarmé jusqu'au
         sous-lot 5 (échouer fermé), importSave passe par SYNC.importe(). */
      try{ if(typeof _poserTag==='function')_poserTag(S); }catch(e){}
      S._uid=CLOUD.user.id;                           // désormais cet appareil sait à qui est cet état
      S._refonte=Math.max(_refonteConnue,_refonteServeur);  // le tampon suit S, comme _uid (même contrat)
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
      S._refonte=Math.max(_refonteConnue,_refonteServeur);  // même tampon que dans l'autre branche
      try{localStorage.setItem('alaq2',JSON.stringify(S));}catch(e){}
      cloudSaveNow();
    }
    /* 🔓 SOUS-LOT 5 — LE SEUL ENDROIT OÙ GREFFER LE DÉPILAGE, et il a fallu le
       chercher. Surtout PAS après `_syncPret=true` (plus haut) : à cet instant
       l'arbitrage n'a pas eu lieu, S._uid peut encore être celui d'un AUTRE compte,
       et la branche takeRemote va remplacer S. On serait exactement dans l'erreur de
       destinataire que tout ce moteur combat. Ici, les deux branches sont fermées et
       S._uid est posé dans les deux cas : la propriété est PROUVÉE. */
    _depiler();
    /* 🔓 11/09 — LA LIVRAISON DU SOUS-LOT 6, REDESSINÉE APRÈS LA REVUE DU 10/09 ET LA
       QUESTION DE MYRIAM DU 11/09. L'ÉLIGIBILITÉ DU PERDANT SE DÉCIDE ICI, où le
       contexte de l'arbitrage vit encore : même compte prouvé (_vuMeme), pas
       explicitement défié (_vuFresh), et — le point neuf — pas disqualifié par un
       effacement que cet appareil vient tout juste d'apprendre (_reveille). Si
       _reveille est vrai, le perdant EST le local périmé : c'est exactement le
       contenu que ce garde existe pour arrêter, jamais pour livrer. Le GAGNANT (S)
       n'a pas besoin de cette liste : il a déjà gagné l'arbitrage, donc déjà passé
       la même épreuve — sa seule garde encore utile est la fraîcheur PAR BLOB
       (_livrable, dans §7), qui protège contre la course entre la purge (le RPC qui
       date l'effacement) et l'envoi (l'upsert qui vide réellement le blob). */
    var _perdantSur = (_vuMeme && !_vuFresh && !_reveille) ? _avantS : null;
    _livrerBlob(S, _perdantSur);
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
  /* 🔓 SOUS-LOT 5 — LE DÉPILAGE PASSE AVANT LA GARDE DU LECTEUR, délibérément.
     La garde du 28/08 protège S : remplacer l'état sous les pieds de l'élève
     casserait l'écran en cours. Le dépilage, lui, ne touche JAMAIS à S — il ne fait
     que vider une file. L'en exclure priverait d'envoi la seule période où l'élève
     produit de la progression. */
  _depiler();
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
/* 🔓 SOUS-LOT 5, 09/09/2026 — LE VERROU S'OUVRE. Il a valu ce qu'il devait valoir :
   pendant l'observation, onze comptes réels ont montré ce que la file CONTIENDRAIT
   avant qu'un seul octet ne parte. Le voici armé. Le remettre à false suffit à
   revenir en arrière — sans perdre la file, qui reste sur le disque. */
const ENVOI = true;
const OB_LOT=50;          // la taille d'un lot — voir la règle ⑤ du §6
const OB_TOURS=6;         // 6 × 50 = 300 = OB_MAX : un tour vide la file entière
const PURGE_CLE='alaq_purge_v1';   // l'intention d'effacement distant, posée avant le réseau
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
  /* 🔴 09/09 — CE REPLI NE LIBÉRAIT RIEN. Il vidait bien le rebut, puis réécrivait
     `txt` — la chaîne calculée AVANT, rebut compris. Exactement les mêmes octets :
     le disque refusait de nouveau, et on avait détruit les motifs des entrées
     refusées pour rien. On resérialise, et seulement pour la file (les deux autres
     clés ne portent pas de rebut). */
  try{ if(cle===OB_CLE&&_OB&&_OB.r&&_OB.r.length){
         _OB.r=[]; var court=JSON.stringify(_OB);
         localStorage.setItem(cle,court);
         if(localStorage.getItem(cle)===court)return true; } }catch(e){}
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
    for(i=0;i<_OB.f.length;i++)vus[_cle(_OB.f[i].uid,_OB.f[i].id)]=1;
    for(i=0;i<d.f.length;i++){ if(!d.f[i])continue;
      var k=_cle(d.f[i].uid,d.f[i].id);
      if(!vus[k]&&!_acquittees[k])_OB.f.push(d.f[i]); }
  }
  if(_OB.f.length>OB_MAX)_OB.f=_OB.f.slice(-OB_MAX);
  if(_OB.r.length>OB_REBUT_MAX)_OB.r=_OB.r.slice(-OB_REBUT_MAX);
  var ok=_ecrire(OB_CLE,JSON.stringify(_OB));
  /* La reprise s'arme ICI, au moment où la file cesse d'être vide — et pas seulement
     en fin de dépilage. Une file qui se remplit hors ligne, ou avant que la propriété
     du compte soit prouvée, doit repartir toute seule quand les conditions reviennent. */
  _reglerMetronome();
  return ok;
}
var _acquittees={};   // ce que CETTE session a déjà fait acquitter (cimetière court)

/* Le propriétaire de l'état courant. Tant que l'arbitrage n'a pas tranché, on ne sait
   pas à qui appartient S : on se tait plutôt que de déclarer au nom de quelqu'un. */
function _proprio(){
  if(S&&S._uid)return S._uid;
  if(typeof CLOUD!=='undefined'&&CLOUD&&CLOUD.user)return CLOUD.user.id;
  return null;
}

/* 🔴 09/09 — UN IDENTIFIANT D'ENTRÉE N'EST UNIQUE QU'AU SEIN D'UN COMPTE.
   'l.1.0' veut dire « la leçon U1-D0 », pas « la leçon U1-D0 de telle élève ». Sur un
   appareil partagé — le téléphone de Myriam prêté, son compte puis celui de Mohamed —
   une entrée en attente du compte A faisait donc TAIRE À JAMAIS la même leçon chez B :
   _enfiler la voyait « déjà en file » et refusait. Pire avec le rebut, qui survit aux
   sessions : une leçon abîmée chez A rendait cette leçon indéclarable chez B, pour
   toujours. La clé du cimetière porte désormais le compte. */
function _cle(uid,id){ return String(uid)+'|'+String(id); }
function _enfiler(id,k,d,uid){
  if(!id||!uid)return false;
  if(_acquittees[_cle(uid,id)])return false;
  for(var i=0;i<_OB.f.length;i++)if(_OB.f[i].id===id&&_OB.f[i].uid===uid)return false;
  for(var j=0;j<_OB.r.length;j++)if(_OB.r[j].id===id&&_OB.r[j].uid===uid)return false;   // déjà au rebut : on n'insiste pas
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
let _resetAnnonce=false;   // SYNC.reset() l'arme : la prochaine réaffectation de S est ATTENDUE
function _poserTag(o){
  try{ Object.defineProperty(o,'_projTag',{value:_tag,enumerable:false,configurable:true,writable:true}); }catch(e){}
}
_poserTag(S);

/* LES ÉTIQUETTES DES NOTIONS DE GRAMMAIRE (choisies par Myriam le 09/09).
   ⚠️ LA CLÉ EST L'INDEX D'UNITÉ, pas son numéro : S.revGram est rangé sous l'index
   que porte NOTIONS_GRAM (u:7 = l'unité 8, u:8 = l'unité 9). Même piège que dkey(),
   dans l'autre sens.
   ⚠️ UNE ÉTIQUETTE NOMME LA NOTION, JAMAIS SON CONTENU DU MOMENT. Myriam : « on va
   rajouter des lettres de l'alphabet pas encore vues dans les prochaines sourates »,
   et de nouveaux harf viendront. J'avais d'abord proposé « harf-bi-li-ala » : cette
   étiquette aurait MENTI dès le quatrième harf. Elle nomme donc la notion, qui peut
   grossir sans changer d'identité — et la maîtrise accumulée lui reste attachée.
   ⚠️ L'unité 8 porte UNE seule notion pour deux idées liées (l'article défini/indéfini
   ET les lettres solaires/lunaires) : c'est ainsi que NOTIONS_GRAM la définit, et
   S.revGram étant rangé par unité, deux notions dans la même unité se marcheraient
   dessus. Le nom choisi par Myriam le dit honnêtement. Les séparer un jour exigera de
   re-clé S.revGram et de migrer l'existant — décision rouverte le jour où l'on
   OBSERVERA des élèves réussir l'une et rater l'autre. */
const GRAM_SLUG={ '7':'article-solaire-lunaire', '8':'harf' };

function _semerLeDiff(){
  if(!_diffArme)return false;
  var uid=_proprio(); if(!uid)return false;
  if(!S||S._projTag!==_tag){
    /* 🔴 SOUS-LOT 5 — UNE RÉAFFECTATION ANNONCÉE N'EST PLUS UNE RÉAFFECTATION INCONNUE.
       doReset remplace S une ligne après SYNC.reset() : ce garde est là pour la
       QUATRIÈME réaffectation, celle que personne n'a déclarée, pas pour celle-ci.
       Jusqu'ici le diff se désarmait à chaque effacement et n'était plus jamais rearmé
       de la session — « échouer fermé », disait le sous-lot 4. Il peut désormais
       distinguer, et c'est SYNC.reset() seul qui pose l'annonce. */
    if(_resetAnnonce){ _resetAnnonce=false; _poserTag(S); }
    else{
      _diffArme=false; _poserTag(S);
      try{ if(typeof tikEnvoyer==='function')
        tikEnvoyer('suspect','sync — S remplace hors des trois points connus : diff desarme'); }catch(e){}
      return false;
    }
  }
  /* 🔴 09/09 — UNE ANNONCE QUI NE SERT PAS DOIT S'ÉTEINDRE. SYNC.reset() arme
     _resetAnnonce pour la réaffectation de S qui suit IMMÉDIATEMENT. Si elle
     n'arrive jamais (effacement sans compte, geste interrompu), le drapeau restait
     armé pour la session : la PROCHAINE réaffectation inconnue — celle que ce garde
     existe pour attraper — aurait été accueillie comme légitime. On le consomme donc
     ici : arrivé jusqu'à cette ligne, le marqueur correspond, aucune réaffectation
     n'a eu lieu, l'annonce est périmée. */
  _resetAnnonce=false;
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
      if(!g)return;
      /* ⛔ UNE NOTION SANS ÉTIQUETTE NE DISPARAÎT PAS EN SILENCE. Le jour où une unité
         apportera une notion neuve, GRAM_SLUG sera périmé : on se tait (on n'invente
         pas un identifiant qui vivra pour toujours dans la base) MAIS on le DIT. */
      if(!slug){ try{ if(typeof tikEnvoyer==='function')
        tikEnvoyer('suspect','sync — notion de grammaire sans etiquette (unite index '+u+') : GRAM_SLUG a completer'); }catch(_){}
        return; }
      if(_IGN['g:'+slug])return;
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

/* ═════════════════════ §6 · LE DÉPILAGE ═════════════════════
   ───────────────────────────────────────────────────────────────────────────
   ⚠️ C'EST LE SEUL POINT PAR LEQUEL UN OCTET PART. Tout ce que le client
   déclare au serveur passe par ici, et par `alaq_pousser` — l'unique porte
   d'écriture accordée au client (schéma §6.2).

   LES SIX RÈGLES DE CE DÉPILAGE, chacune payée par une mesure ou un incident :

   ① ON NE PARLE QU'UNE FOIS LE PROPRIÉTAIRE PROUVÉ. `_syncPret` ne suffit PAS :
      il n'est jamais remis à false (posé une seule fois, cloudPull), et une
      session qui expire puis revient sur un AUTRE compte traverse
      `onAuthStateChange` sans repasser par cloudPull. Le feu vert exige donc
      aussi `S._uid === CLOUD.user.id` — la propriété PROUVÉE par l'arbitrage,
      pas seulement « un nuage a été lu une fois ».
      Ce n'est pas une précaution contre les doublons (tout est idempotent) :
      c'est la précaution contre l'ERREUR DE DESTINATAIRE. Le serveur crédite le
      compte de la session, jamais l'`uid` que porte l'entrée.
   ② UNE ENTRÉE D'UN AUTRE COMPTE DORT. Ni envoyée, ni jetée. C'est le pire
      scénario du projet (téléphone partagé : les graines d'une élève versées
      sur le compte d'une autre) et aucune sécurité serveur ne peut s'y opposer,
      puisque c'est bien le compte connecté qui écrit.
   ③ ÉCHEC DE TRANSPORT ≠ REFUS. Le compteur `n` d'une entrée ne monte QUE sur
      un acquittement `refus` explicite. Un réseau qui tombe ne consomme aucune
      vie — sinon trois tunnels suffiraient à envoyer au rebut une leçon faite
      en avion.
   ④ ON NE JETTE JAMAIS AVANT L'ACQUITTEMENT. Si le serveur applique le lot et
      que la réponse se perd, on rejoue : c'est sûr, les intentions sont
      idempotentes. L'inverse ne l'est pas.
   ⑤ LE LOT VAUT 50, PAS 100. Le serveur refuse au-delà de 100 — et il lève
      AVANT la boucle (erreur 22023), donc rien n'est écrit ni acquitté. Mais la
      vraie borne est ailleurs : chaque entrée ouvre une sous-transaction, et
      PostgreSQL déborde son cache de sous-identifiants au-delà de 64 par
      transaction. 50 laisse la marge des deux côtés.
   ⑥ LE MÉTRONOME S'ARME PARESSEUSEMENT. Un `setInterval` posé au chargement
      réveillerait la page toutes les 45 s pour rien — et figerait le banc
      `node:vm`, qui exécute ce fichier ENTIER avec le vrai `setInterval` de
      node. Il ne tourne que tant que la file porte quelque chose.

   ⛔ CE QUE CE DÉPILAGE NE SAIT PAS FAIRE, ET QU'IL FAUT SAVOIR :
   les entrées `rev` ne sont PAS idempotentes côté serveur (aucun `on conflict`
   sur `review_events`, et `seen_count` s'incrémente à chaque passage). Si le
   serveur valide le lot et que la réponse se perd — métro, portail captif,
   délai de garde qui expire —, le rejeu comptera CE MOT une seconde fois. Les
   deux champs touchés (`seen_count`, `ko_count`) ne sont lus par RIEN
   aujourd'hui ; `step` et `next_due`, eux, sont des écrasements idempotents et
   ne bougent pas. On l'assume plutôt que de rejouer « au cas où » un
   `alaq_bootstrap` de réconciliation — mais le jour où un tableau de bord se
   fiera à `seen_count`, c'est ici qu'il faudra revenir.
   ═══════════════════════════════════════════════════════════════════════════ */

let _enVol=null;        // la promesse du lot en vol — le verrou de ré-entrance
let _metronome=null;    // la reprise périodique, ARMÉE PARESSEUSEMENT (règle ⑥)
let _soldeAPoser=null;  // le solde certifié qui attend un instant muet
let _soldeDe=null;      // …et À QUI il appartient (voir _appliquerSolde)
let _soldePurge=false;  // …et s'il vient d'un effacement, où un zéro est un FAIT
let _dernierMotif='';   // ce que SYNC.etat() montre au geste des sept tapes

/* Ce qui part sur le fil : l'entrée DÉPOUILLÉE. `uid`, `n` et `le` sont notre
   comptabilité locale — le serveur ne les lit pas, et `uid` surtout : il écrit
   toujours sur `auth.uid()`. Les envoyer laisserait croire qu'ils protègent. */
function _surLeFil(e){ return {id:e.id, k:e.k, d:e.d}; }

/* ⛔ `build` N'EST PROTÉGÉ PAR AUCUNE REGEX CÔTÉ SERVEUR, contrairement à `xp`
   juste au-dessus de lui : `client_build = (p_profil->>'build')::int` vit HORS
   de tout bloc `exception`. Une valeur non entière lève, et TOUTE la
   transaction rebrousse chemin — les acquittements compris, alors que chaque
   entrée était bonne. On ne transmet donc que ce qui a prouvé être une suite de
   chiffres. Même prudence pour toute clé ajoutée ici un jour : ce chemin-là
   n'a pas de filet. */
function _profil(){
  var p={};
  try{ if(typeof S.xp==='number'&&isFinite(S.xp)&&S.xp>=0&&S.xp<1e7)p.xp=Math.floor(S.xp); }catch(e){}
  try{ if(typeof BUILD_NUM!=='undefined'&&/^[0-9]{1,9}$/.test(String(BUILD_NUM)))p.build=+BUILD_NUM; }catch(e){}
  return p;
}

/* Le feu vert, en un seul endroit : il rend le MOTIF du refus, jamais un booléen
   nu — c'est lui que le geste des sept tapes affiche quand rien ne part. */
function _peutDepiler(){
  if(!ENVOI)return 'observation';
  if(!SB||!CLOUD.user)return 'pas de session';
  if(!_syncPret)return 'nuage pas encore lu';
  if(!S||S._uid!==CLOUD.user.id)return 'proprietaire pas encore prouve';  // règle ①
  try{ if(typeof navigator!=='undefined'&&navigator&&navigator.onLine===false)return 'hors ligne'; }catch(e){}
  return null;
}

/* Ce que le serveur SAIT désormais. Sans cette trace persistée, le diff
   redéclarerait tout à chaque save() : le compte convergerait quand même (le
   serveur répondrait 'doublon'), mais le trafic doublerait EN SILENCE. */
function _noterConnu(c,e){
  try{
    var d=e.d||{};
    if(e.k==='graines')c.p=1;   // ce compte a un portefeuille CERTIFIÉ : son solde mesure quelque chose
    else if(e.k==='lecon')c.l['U'+d.unit_no+'-D'+d.disc_no]=1;
    else if(e.k==='test')c.t[String(d.unit_no)]=1;
    else if(e.k==='rev'){
      if(d.type==='word')c.w[d.item_id]=d.step;
      else if(d.type==='grammar'){
        /* L'INDEX vit dans l'identifiant — 'g.<slug>.<n>' —, pas dans la charge.
           On prend le MAXIMUM et non un compteur : une entrée refusée au milieu
           ne doit pas figer la suite (elle part au rebut, elle ne revient pas). */
        var m=/^g\.(.+)\.(\d+)$/.exec(e.id);
        if(m){ var s=m[1], n=+m[2];
          if(!(c.g[s]>=n))c.g[s]=n;
          if(d.success===false)c.gk[s]=(c.gk[s]||0)+1; }
      }
    }
  }catch(x){}
}

/* Le tri des acquittements. TOUTE entrée reçue est acquittée par le serveur
   (schéma §6.2) : une entrée envoyée et jamais acquittée bloquerait la tête de
   file pour toujours. ⚠️ Un 'ok' ne prouve PAS qu'une ligne a été écrite —
   'lecon' et 'test' sont des `on conflict do nothing`, 'rev' peut être sauté par
   la garde d'horloge, et 'graines' peut créditer 0 (plafond du jour). 'ok' et
   'doublon' disent la même chose et une seule : l'entrée est TRAITÉE, sors-la. */
function _acquitter(uid,lot,data){
  var acks=(data&&_estTableau(data.acks))?data.acks:[];
  var par={},i;
  for(i=0;i<acks.length;i++)if(acks[i]&&acks[i].id)par[acks[i].id]=acks[i];
  var c=_connuPour(uid), reste=[], sortis=0, rebut=0, refuses=[];
  for(i=0;i<_OB.f.length;i++){
    var e=_OB.f[i], a=(e&&e.uid===uid)?par[e.id]:null;
    if(!a){ reste.push(e); continue; }            // pas de ce lot : intacte (règle ②)
    if(a.etat==='ok'||a.etat==='doublon'){
      _acquittees[_cle(uid,e.id)]=1; _noterConnu(c,e); sortis++;
      continue;
    }
    /* Un refus EXPLICITE, et lui seul, consomme une vie (règle ③). Il n'est pas
       forcément définitif : le `when others` du serveur couvre aussi des échecs
       passagers (verrou du portefeuille, sérialisation). D'où trois essais. */
    e.n=(e.n||0)+1; refuses.push(e.id);
    if(e.n>=OB_REFUS_MAX){
      e.motif=String(a.motif||'refus sans motif').slice(0,200);
      /* ⛔ LE REBUT DOIT ENTRER AU CIMETIÈRE. Sans cette ligne, `_obEcrire`
         relit le disque et RESSUSCITE l'entrée : elle n'est plus dans `_OB.f`,
         et rien d'autre ne dit qu'on en a fini avec elle. */
      _OB.r.push(e); _acquittees[_cle(uid,e.id)]=1; rebut++;
    } else reste.push(e);
  }
  _OB.f=reste;
  _obEcrire();
  _ecrire(CONNU_CLE,JSON.stringify(_CONNU));
  return {sortis:sortis, rebut:rebut, refuses:refuses};
}

/* ═══ LA BALANCE CERTIFIÉE — décision ③ de Myriam : EN SILENCE ═══
   Le portefeuille du serveur fait foi, et le compteur local peut diverger pour
   une raison parfaitement normale : `claim_reward` ne paie un `lesson_id`
   qu'UNE FOIS PAR JOUR SERVEUR (schéma §6.1), là où `gagnerGraines` paie plein
   tarif à chaque rejeu. Une leçon refaite le même jour vaut donc 15 en local et
   0 au serveur.
   ⛔ MUETTE À L'ŒIL, pas seulement dans le code. Deux conséquences :
   — jamais pendant l'écran de fin, qui affiche justement le gain de la session ;
   — aucun rendu forcé : si la page Progression est ouverte, son chiffre attendra
     la prochaine ouverture. Un nombre qui change sous les yeux serait
     exactement le bandeau que Myriam a refusé. */
function _appliquerSolde(){
  if(_soldeAPoser===null)return false;
  /* 🔴 09/09 — LE SOLDE D'UNE ÉLÈVE NE S'ÉCRIT PAS DANS LE COMPTE DE LA SUIVANTE.
     _appliquerSolde est appelée aussi sur le chemin REFUSÉ de _depiler (« pas de
     session », « proprietaire pas encore prouve ») : sans ce contrôle, un solde
     rendu pour A pouvait se poser sur le S de B après un changement de compte. */
  if(_soldeDe && _soldeDe!==_proprio()){ _soldeAPoser=null; _soldeDe=null; return false; }
  try{ var f=document.getElementById('finish');
       if(f&&f.classList&&f.classList.contains('on'))return false; }catch(e){}
  /* Une purge distante en attente veut dire que le serveur porte ENCORE l'ancien
     solde : l'appliquer ressusciterait les graines que l'élève vient d'effacer. */
  if(_purgeDue())return false;
  var v=_soldeAPoser, pourPurge=_soldePurge; _soldeAPoser=null; _soldeDe=null; _soldePurge=false;
  /* 🔴 09/09 — UN PORTEFEUILLE VIDE N'EST PAS UN PORTEFEUILLE À ZÉRO.
     Une élève joue sans compte, gagne 260 graines, PUIS s'inscrit. Son portefeuille
     serveur n'a jamais reçu une ligne (les graines d'avant le compte ne se déclarent
     pas — c'est la règle, et Myriam l'a validée : la progression rejoint le compte à
     l'inscription, les graines non). alaq_solde() rend donc 0 — non pas « elle n'a
     rien », mais « je n'en sais rien ». Poser ce 0 DÉTRUISAIT ses 260 graines.
     La règle disait qu'elles ne REJOIGNENT pas le compte, jamais qu'on les efface.
     On n'applique donc un zéro que si le serveur a déjà certifié quelque chose pour
     ce compte — ou si l'effacement vient d'être demandé, où le zéro est un fait. */
  if(v===0 && !pourPurge){
    var c0=_connuPour(_proprio()||'?');
    if(!c0.p)return false;   // aucun versement jamais acquitté : le 0 ne mesure rien
  }
  if((S.graines||0)===v)return false;
  S.graines=v;
  saveLocal();   // ⛔ pas save() : ni redatage de la progression, ni redéclaration
  return true;
}

/* ═══ LA PURGE DISTANTE ═══
   `alaq_effacer_progression` est appelée à l'effacement, mais l'INTENTION est
   posée sur le disque AVANT que le réseau soit sollicité : si l'app meurt entre
   les deux, le prochain dépilage reprend. Sans cela, une élève qui efface hors
   ligne garderait au serveur sa progression ET son solde — et la balance
   certifiée les lui rendrait au retour du réseau. */
/* 🔴 09/09 — UNE INTENTION DE PURGE APPARTIENT À UN COMPTE, PAS À L'APPAREIL.
   Sans ce filtre, une purge posée par A et jamais aboutie (A ne se reconnecte plus)
   GELAIT DÉFINITIVEMENT la balance certifiée de tous les comptes suivants sur cet
   appareil : _appliquerSolde refuse tant qu'une purge est due, et celle-ci n'était
   levée que par A. B ne voyait plus jamais son solde se corriger, sans un message. */
function _purgeDue(){
  try{ var du=localStorage.getItem(PURGE_CLE); return !!du && du===_proprio(); }
  catch(e){ return false; }
}
async function _purgerDistant(uid){
  var du=null; try{ du=localStorage.getItem(PURGE_CLE); }catch(e){}
  if(!du||du!==uid)return false;
  var r=await _avecGarde(SB.rpc('alaq_effacer_progression',{}),12000,'purge distante');
  if(r&&r.error)throw r.error;
  try{ localStorage.removeItem(PURGE_CLE); }catch(e){}
  /* 🔴 11/09, APRÈS QUATRE REVUES — LE TAMPON SE MET À JOUR ICI, PAS AILLEURS.
     Une purge RÉUSSIE vient de poser un `state_migrated_at` neuf. Si cet appareil ne
     l'apprend pas MAINTENANT, le prochain arbitrage le verra comme « un effacement que
     je n'ai jamais vu » et révoquera l'état que l'élève s'est reconstitué depuis — la
     leçon faite juste après son propre effacement disparaîtrait.
     ⛔ J'AI D'ABORD ESSAYÉ UN DRAPEAU (« ce refonte, c'est moi »), et deux revues l'ont
     démoli : posé APRÈS le RPC, il laissait une fenêtre entière où doReset avait déjà
     remis le tampon à zéro ; et il n'était consommé que par un cloudPull menant au bout,
     donc il survivait hors ligne, au changement de compte, à la déconnexion — jusqu'à
     annuler l'effacement de QUELQU'UN D'AUTRE. Un drapeau a un cycle de vie ; une DATE
     n'en a pas. On relit donc la vraie date au serveur, une fois, et on la range.
     ⚠️ Si cette relecture échoue, on ne lève PAS : la purge, elle, a réussi. Le prochain
     cloudPull verra `_reveille` et révoquera — sans dégât, puisque doReset a laissé
     l'état VIDE. Le seul coût est une leçon faite dans cet intervalle, et c'est la
     direction prudente : l'effacement gagne. */
  try{
    var rr=await _avecGarde(SB.from('profiles').select('state_migrated_at').eq('user_id',uid).maybeSingle(),
                            8000,'relecture de la refonte après purge');
    var dd=rr&&rr.data&&rr.data.state_migrated_at, tt=dd?Date.parse(dd):0;
    /* ⚠️ `Math.max` est une ceinture, PAS un garde porteur : `state_migrated_at` ne fait
       qu'avancer (un `now()` par effacement), et `S._uid===uid` écarte l'état d'un autre
       compte — aucun essai ne peut donc le faire mordre, et la mutation le confirme. On
       le garde quand même : il ne coûte rien, et le retirer serait refaire l'erreur du
       matin (voir le commentaire de `S._ts` plus haut). L'impossibilité est DITE ici,
       plutôt que proclamée comme une garantie. */
    if(isFinite(tt)&&tt>0&&S&&S._uid===uid){ S._refonte=Math.max(+S._refonte||0,tt); saveLocal(); }
  }catch(e){}
  /* Le portefeuille est append-only : le serveur ne supprime pas les lignes, il
     écrit une compensation. Le solde qu'il rend est donc déjà à zéro. */
  var d=r&&r.data;
  if(d&&typeof d.solde==='number'&&isFinite(d.solde)){ _soldeAPoser=d.solde; _soldeDe=uid; _soldePurge=true; }
  return true;
}

/* Un tour de dépilage : autant de lots de 50 qu'il en faut, dans une SEULE
   promesse. C'est délibéré — un dépilage qui rend une promesse fidèle à son
   travail réel se mesure sans horloge, là où une chaîne de setTimeout obligerait
   le banc à deviner combien de fois « respirer ». */
async function _unTour(){
  var envoye=0, rebut=0, tours=0;
  /* 🔴 09/09 — UNE ENTRÉE NE PERD QU'UNE VIE PAR TOUR. Le garde `if(!bilan.sortis)break`
     ferme le cas du lot ENTIÈREMENT refusé, mais pas le lot PARTIEL : si 49 entrées
     passent et qu'une est refusée, le tour continue, reprend la refusée dans le lot
     suivant, et lui coûte une deuxième vie — trois rounds suffisaient à envoyer au
     rebut une graine victime d'un simple verrou de portefeuille passager. Les trois
     essais d'OB_REFUS_MAX doivent être trois OCCASIONS distinctes, pas trois boucles
     d'une même seconde. */
  var refusesCeTour={};
  var uid=CLOUD.user.id;
  /* ⚠️ D'ABORD LA CORRECTION EN ATTENTE. Un solde certifié refusé au tour précédent
     (l'écran de fin était ouvert, une purge distante était due) doit trouver une
     seconde chance même quand il n'y a plus RIEN à envoyer — sinon il reste suspendu
     jusqu'au prochain envoi, c'est-à-dire potentiellement jamais. */
  _appliquerSolde();
  await _purgerDistant(uid);   // la purge D'ABORD : elle vide le sens de tout le reste
  while(tours<OB_TOURS){
    tours++;
    /* L'identité se REVÉRIFIE à chaque tour — même règle que cloudPull. */
    if(!CLOUD.user||CLOUD.user.id!==uid||!S||S._uid!==uid){ _dernierMotif='le compte a change'; break; }
    var lot=[],i;
    for(i=0;i<_OB.f.length&&lot.length<OB_LOT;i++){
      var e=_OB.f[i];
      if(!e||!e.id||e.uid!==uid)continue;          // règle ② : les autres dorment
      if(refusesCeTour[e.id])continue;             // déjà refusée dans ce tour : on n'insiste pas
      lot.push(e);
    }
    if(!lot.length)break;
    var rep=await _avecGarde(SB.rpc('alaq_pousser',{p_entrees:lot.map(_surLeFil),p_profil:_profil()}),
                             12000,'envoi de la file ('+lot.length+' entrees)');
    /* supabase-js ne LÈVE pas : il résout avec {error}. Une erreur de LOT (>100,
       jeton périmé, RLS) ne touche AUCUNE entrée — elle lève ici, et la règle ③
       veut qu'aucune vie ne soit consommée. */
    if(rep&&rep.error)throw rep.error;
    if(!CLOUD.user||CLOUD.user.id!==uid){ _dernierMotif='le compte a change pendant l’envoi'; break; }
    var data=rep&&rep.data;
    if(data&&typeof data.solde==='number'&&isFinite(data.solde)){ _soldeAPoser=data.solde; _soldeDe=uid; }
    var bilan=_acquitter(uid,lot,data);
    for(i=0;i<bilan.refuses.length;i++)refusesCeTour[bilan.refuses[i]]=1;
    envoye+=bilan.sortis; rebut+=bilan.rebut;
    _appliquerSolde();
    if(!bilan.sortis)break;   // rien n'est sorti : on n'insiste pas dans le même souffle
  }
  /* ⚠️ UN TOUR SE TERMINE TOUJOURS EN POSANT CE QUI ATTEND. Après une purge distante,
     le solde certifié vaut 0 et la boucle sort au premier tour (la file est vide) : sans
     cette ligne, la correction resterait suspendue jusqu'au tour suivant. Même défaut
     que celui trouvé par l'essai ㉝, dans l'autre coin de la fonction. */
  _appliquerSolde();
  _dernierMotif=envoye?('envoye '+envoye+(rebut?(' · rebut '+rebut):'')):(_dernierMotif||'rien a envoyer');
  _reglerMetronome();
  return {envoye:envoye, rebut:rebut, motif:_dernierMotif};
}

/* ⛔ `_depiler()` NE REJETTE JAMAIS. Il est appelé en oubli-et-continue depuis
   quatre écouteurs : une promesse orpheline qui rejette ferait poser au capteur
   'unhandledrejection' d'index.html un ticket « promesse » illisible, au lieu du
   ticket nommé que `_ticketSync` produit ici. */
function _depiler(){
  if(_enVol)return _enVol;                       // ré-entrance : on rend le lot en vol
  var motif=_peutDepiler();
  if(motif){ _dernierMotif=motif; _appliquerSolde(); return Promise.resolve({envoye:0,motif:motif}); }
  var p;
  try{ p=_unTour(); }catch(e){ p=Promise.reject(e); }
  _enVol=Promise.resolve(p).then(function(r){ _enVol=null; return r; },
    function(e){
      _enVol=null;
      _ticketSync('depilage',e);
      _dernierMotif='echec : '+((e&&e.message)||e||'?');
      return {envoye:0, motif:_dernierMotif};
    });
  return _enVol;
}

/* Le métronome ne tourne que tant que la file porte quelque chose (règle ⑥). */
function _armerMetronome(){
  if(_metronome||!ENVOI)return;
  try{ _metronome=setInterval(function(){ _depiler(); },45000); }catch(e){}
}
function _desarmerMetronome(){
  if(!_metronome)return;
  try{ clearInterval(_metronome); }catch(e){}
  _metronome=null;
}
/* 🔴 09/09 — UN MÉTRONOME QUI NE PEUT RIEN ENVOYER EST UN RÉVEIL POUR RIEN.
   La file peut ne porter QUE des entrées endormies d'un autre compte (règle ② : ni
   envoyées, ni jetées). Les compter comme « il reste à faire » réveillait la page
   toutes les 45 s, sur un téléphone, pour un dépilage qui refusait à chaque fois.
   On ne s'arme que s'il y a quelque chose d'ENVOYABLE — et le retour du compte
   concerné passe de toute façon par cloudPull, 'online' ou 'focus'. */
function _aEnvoyer(){
  var p=_proprio(); if(!p)return false;
  for(var i=0;i<_OB.f.length;i++)if(_OB.f[i]&&_OB.f[i].uid===p)return true;
  return false;
}
function _reglerMetronome(){ if(_aEnvoyer())_armerMetronome(); else _desarmerMetronome(); }

/* ═════════════ §7 · LA LIVRAISON DU BLOB — le sous-lot 6 ═════════════
   ┌──────────────────────────────────────────────────────────────────────────┐
   │ POURQUOI. La file du sous-lot 5 déclare ce que l'élève produit À PARTIR   │
   │ de maintenant. Elle est aveugle à deux choses : le blob `profiles.state`  │
   │ qu'un vieux client continue d'écrire sans jamais rien déclarer, et l'état │
   │ local PERDANT d'un arbitrage — les leçons faites en avion, que le serveur │
   │ n'a jamais vues. Une union côté serveur ne peut pas unir ce qu'elle n'a   │
   │ pas. MESURÉ le 10/09 sur la production : 4 leçons réelles vivent dans le  │
   │ blob et dans AUCUNE table (U9-D5/6/7 et U1-D2, sur deux comptes).         │
   │                                                                          │
   │ CE LOT A ÉTÉ REFUSÉ UNE PREMIÈRE FOIS le 10/09 par la revue adversariale  │
   │ (32 constats, 7 bloquants) : la version d'hier soir datait un blob par   │
   │ SON ÉCRITURE (S._ts, une horloge client que save() rajeunit à chaque     │
   │ geste), pas par l'âge de son contenu. Un effacement pouvait ressusciter  │
   │ dès qu'un SEUL autre appareil était touché une fois. La correction du    │
   │ 11/09 déplace le garde dans cloudPull lui-même (`_reveille`, voir plus   │
   │ haut) : deux dates SERVEUR se comparent, jamais une horloge client. Ce   │
   │ qui reste ici n'est que la LIVRAISON — l'arbitrage a déjà tranché qui a  │
   │ le droit de parler.                                                     │
   └──────────────────────────────────────────────────────────────────────────┘

   CE QU'ON LIVRE, ET RIEN D'AUTRE : `done` et `tests`. Deux booléens monotones
   — une leçon faite ne se défait pas, un test réussi ne se rate pas — donc une
   union pure, rejouable sans fin sans jamais rien abîmer.

   ⛔ `rev` EST VOLONTAIREMENT EXCLU. Côté serveur, la branche ③ d'alaq_livrer_blob
   fusionne les paliers au `least()` : un blob livré ne peut que faire DESCENDRE
   un palier — prudent pour une migration jouée UNE fois, dangereux pour une
   livraison qui SE REJOUE (elle tirerait éternellement vers le bas ce que la
   file vient de certifier). MESURÉ avant de trancher : aucun compte ne porte
   dans son blob un mot que les tables ignorent, zéro mot serait rabaissé
   aujourd'hui. Les mots continuent d'arriver par la file, qui ne descend pas.

   ⛔ AUCUNE GRAINE, JAMAIS. Un blob est un texte que le client fabrique ; une
   monnaie ne se lit pas dans un texte fabriqué par celui qu'elle enrichit.

   ⛔ LA QUARANTAINE `_IGN` S'APPLIQUE ICI AUSSI — LE DEUXIÈME DÉFAUT DE LA
   REVUE DU 10/09. `SYNC.importe()` (plus bas) met tout code ALAQ1. collé en
   quarantaine : « on ne certifie pas au serveur une progression saisie au
   clavier ». Le diff du sous-lot 5 la respecte en quatre points ; la version
   d'hier soir de CE lot ne la consultait NULLE PART — 50 leçons tapées au
   clavier entraient dans les tables, définitivement. `_moissonner` filtre
   maintenant par `_IGN`, exactement comme `_semerLeDiff`.

   LA FRAÎCHEUR PAR BLOB (`_livrable`) reste une garde SÉPARÉE de `_reveille`,
   et les deux sont nécessaires : `_reveille` protège l'ARBITRAGE (donc l'écran)
   contre un effacement que cet appareil ignorait encore ; `_livrable` protège
   la LIVRAISON contre une course plus étroite — le RPC qui date l'effacement
   (`alaq_effacer_progression`) et l'upsert qui vide réellement `profiles.state`
   sont DEUX écritures séparées, à quelques secondes d'écart. Un blob dont le
   `_ts` est antérieur à la dernière refonte connue n'est jamais livré, qu'il
   soit gagnant ou perdant — c'est ce qui protège l'irréversible pendant cette
   fenêtre, même si l'écran, lui, peut brièvement clignoter sur du périmé. */
/* 🔴 11/09, APRÈS QUATRE REVUES — LA LIVRAISON PART DÉSARMÉE, ET C'EST UN CHOIX.
   Tout ce qui suit est écrit, mesuré et éprouvé : 151 essais, des mutants qui mordent,
   quatre revues adversariales. Mais ce lot est le SEUL pas IRRÉVERSIBLE du POC-5 (une
   union dans user_progress ne se défait pas), et sa valeur MESURÉE est de 4 leçons sur
   2 comptes — pendant que les quatre revues y ont trouvé 16 bloquants successifs.
   Le RÉPARATION de la résurrection (le tampon `_refonte`, §cloudPull), elle, corrige un
   défaut VIVANT en production et ne dépend en rien d'ici : elle part, la livraison non.
   Basculer à `true` est une décision de Myriam, pas une conséquence du code qui compile.
   ⚠️ Le banc arme l'interrupteur dans son bac pour éprouver toute la mécanique — un
   essai vérifie séparément que la SOURCE, elle, part bien désarmée. */
var LIVRAISON=false;      // l'interrupteur du lot, comme ENVOI pour la file
var _livre={};            // empreinte de la dernière livraison acquittée, par compte
var _livraisonMotif='';   // ce que SYNC.etat() montre au geste des sept tapes

/* Un blob n'est livrable que s'il est POSTÉRIEUR à la dernière refonte connue du
   SERVEUR (ventilation ou effacement) — jamais «`_syncPret` suffit», jamais un
   défaut à 0 par ignorance : voir le fail-closed de _livrerBlob et de SYNC.livrer(). */
function _livrable(b){
  if(!b||typeof b!=='object')return false;
  if(!_refonteVue)return true;   // ce compte n'a jamais connu de refonte serveur
  return (+b._ts||0)>_refonteVue;
}
/* On ne moissonne que la VÉRACITÉ : l'app lit partout `!!S.done[k]`, une valeur
   héritée qui ne serait pas le booléen `true` compte donc bien comme faite. La
   quarantaine `_IGN` est consultée ICI, comme dans `_semerLeDiff` — même contrat. */
function _moissonner(src,out){
  if(!src||typeof src!=='object')return out;
  var k,d=src.done,t=src.tests,H=Object.prototype.hasOwnProperty;
  if(d&&typeof d==='object')for(k in d){ if(H.call(d,k)&&d[k]&&!_IGN['l:'+k])out.done[k]=true; }
  if(t&&typeof t==='object')for(k in t){ if(H.call(t,k)&&t[k]&&!_IGN['t:'+k])out.tests[k]=true; }
  return out;
}
/* Deux livraisons identiques ne repartent pas : cloudPull se rejoue à CHAQUE
   reprise de focus, et un aller-retour par focus pour zéro insertion est un
   réveil pour rien — la leçon que le métronome a déjà apprise (§6). */
function _empreinteBlob(c){
  var a=Object.keys(c.done).sort(), b=Object.keys(c.tests).sort();
  return a.length+'·'+a.join(',')+'|'+b.length+'·'+b.join(',');
}

/* ⛔ NE REJETTE JAMAIS. Appelée en oubli-et-continue depuis cloudPull, comme
   _depiler() : une promesse orpheline ferait poser au capteur 'unhandledrejection'
   d'index.html un ticket illisible, au lieu du ticket nommé que _ticketSync produit
   ici. `perdant` arrive déjà filtré par la propriété (voir la greffe dans cloudPull) :
   cette fonction n'applique plus que la fraîcheur (_livrable), la quarantaine
   (_moissonner) et le fail-closed (_refonteVue jamais 0 par ignorance). */
function _livrerBlob(gagnant,perdant){
  try{
    if(!LIVRAISON||!SB){ _livraisonMotif='livraison eteinte'; return; }
    if(!CLOUD.user){ _livraisonMotif='pas de session'; return; }
    /* 🔓 11/09 — FAIL CLOSED. `_refonteVue` n'est posée QUE par un cloudPull qui a
       RÉUSSI (voir plus haut) — jamais un défaut de 0 par ignorance. La revue du
       10/09 a trouvé exactement l'inverse dans SYNC.livrer() : `+undefined||0`
       éteignait le garde. `_syncPret` est la MÊME condition que celle qui autorise
       déjà cloudSaveNow à parler (règle ① du §… historique) : on la réutilise. */
    if(!_syncPret){ _livraisonMotif='refonte pas encore connue'; return; }
    var uid=CLOUD.user.id;
    /* Une purge attend son tour : livrer maintenant remettrait dans les tables ce
       que l'élève vient de demander d'effacer. */
    if(_purgeDue()){ _livraisonMotif='purge en attente'; return; }
    var colis={done:{},tests:{}}, sources=0;
    if(_livrable(gagnant)){ _moissonner(gagnant,colis); sources++; }
    if(_livrable(perdant)){ _moissonner(perdant,colis); sources++; }
    if(!sources){ _livraisonMotif='rien de posterieur a la derniere refonte connue'; return; }
    var n=Object.keys(colis.done).length+Object.keys(colis.tests).length;
    if(!n){ _livraisonMotif='rien a livrer (tout est en quarantaine ou deja connu)'; return; }
    var emp=_empreinteBlob(colis);
    if(_livre[uid]===emp){ _livraisonMotif='deja livre'; return; }
    _avecGarde(SB.rpc('alaq_livrer_blob',{p_blob:colis}),12000,'livraison du blob')
      .then(function(r){
        if(r&&r.error)throw r.error;
        /* ⚠️ On n'acquitte QUE si le compte n'a pas changé pendant l'attente :
           sinon on marquerait « livré » dans le carnet de quelqu'un d'autre. */
        if(CLOUD.user&&CLOUD.user.id===uid)_livre[uid]=emp;
        var d=r&&r.data;
        _livraisonMotif='livre '+((d&&d.lecons!=null)?d.lecons:'?')+' lecon(s), '
                                +((d&&d.tests!=null)?d.tests:'?')+' test(s)';
      })
      .catch(function(e){
        _ticketSync('livraison',e);
        _livraisonMotif='echec : '+((e&&e.message)||e||'?');
      });
  }catch(e){
    _ticketSync('livraison',e);
    _livraisonMotif='echec : '+((e&&e.message)||e||'?');
  }
}

/* ═════════════════════ §8 · SYNC — ce qu'index.html appelle ═════════════════════ */
var SYNC={
  /* Déclaré au versement des graines (les trois sites de gagnerGraines). */
  graines:function(lesson_id,sans_faute,is_daily_goal){
    try{ var id=_declarerGraines(lesson_id,sans_faute,is_daily_goal); _depiler(); return id; }
    catch(e){ return null; }
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
      /* 🔴 09/09 — LA GRAMMAIRE MANQUAIT À L'APPEL. S.revGram porte un CUMUL d'écrans
         vus et ratés, et le diff en tire jusqu'à 40 intentions par session. Un code
         ALAQ1. collé — un texte que l'élève peut éditer — se faisait donc certifier au
         serveur comme de la grammaire réellement travaillée, alors que les leçons, les
         tests et le vocabulaire du même code étaient, eux, correctement tus. */
      Object.keys(S.revGram||{}).forEach(function(u){
        var g=(typeof GRAM_SLUG!=='undefined')&&GRAM_SLUG[String(u)];
        if(g)_IGN['g:'+g]=1;
      });
      _ecrire(IGNORE_CLE,JSON.stringify(_IGN));
      _poserTag(S); _diffArme=true;
    }catch(e){}
  },
  /* ═══ L'EFFACEMENT — appelé en PREMIÈRE ligne de doReset ═══
     L'ordre est strict, et c'est tout le sujet : on purge la file AVANT que S
     soit remplacé. Les entrées en attente décrivent EXACTEMENT la progression
     que l'élève vient d'effacer — les laisser partir la reconstruirait au
     serveur, une seconde après qu'elle a demandé sa disparition. */
  reset:function(){
    try{
      var uid=_proprio();
      /* 🔴 09/09 — ON N'EFFACE QUE CE QUI EST À SOI. Vider la file entière détruisait
         les graines en attente d'une AUTRE élève dont l'appareil porte encore les
         entrées endormies (règle ② du §6 : elles ne sont ni envoyées, ni jetées — un
         effacement demandé par quelqu'un d'autre ne les jette pas non plus). */
      _OB={ f:_OB.f.filter(function(e){ return e&&e.uid&&e.uid!==uid; }),
            r:_OB.r.filter(function(e){ return e&&e.uid&&e.uid!==uid; }) };
      _acquittees={};
      _ecrire(OB_CLE,JSON.stringify(_OB));
      if(uid)delete _CONNU[uid];
      _ecrire(CONNU_CLE,JSON.stringify(_CONNU));
      _IGN={}; _ecrire(IGNORE_CLE,JSON.stringify(_IGN));
      _soldeAPoser=null; _desarmerMetronome();
      /* L'INTENTION avant le réseau : si l'app meurt ici, le prochain dépilage reprend. */
      if(uid){ try{ localStorage.setItem(PURGE_CLE,uid); }catch(e){} }
      /* doReset réaffecte S juste après nous. On ANNONCE la réaffectation : le garde
         du diff est là pour les réaffectations INCONNUES, pas pour celle-ci. */
      _resetAnnonce=true;
      if(uid)_depiler();
    }catch(e){}
  },
  /* ═══ AVANT LE signOut ═══
     Après lui il n'y a plus de jeton : ce qui reste en file partirait en 401.
     On court une fois, brièvement — hors ligne le feu vert rend la main tout de
     suite, et la course de 1,5 s garantit qu'on ne fait jamais attendre l'élève. */
  avantDeconnexion:function(){
    try{ return Promise.race([Promise.resolve(_depiler()),
                              new Promise(function(r){ setTimeout(r,1500); })]); }
    catch(e){ return Promise.resolve(); }
  },
  /* Le dépilage à la demande — c'est aussi ce que le geste des sept tapes appelle. */
  depiler:function(){ try{ return _depiler(); }catch(e){ return Promise.resolve({envoye:0,motif:'?'}); } },
  /* 🔓 11/09 — SANS ARGUMENT, SANS PERDANT. La revue du 10/09 a trouvé que
     SYNC.livrer(refonte) désarmait le garde par défaut (+undefined||0 -> 0). Le
     rejeu manuel depuis la console ne livre donc plus QUE S, filtré par la même
     fraîcheur que le chemin normal — jamais un « perdant », qui n'existe que le
     temps d'un arbitrage et qu'on ne retrouve pas après coup (voir §7). */
  livrer:function(){ try{ _livrerBlob(S,null); }catch(e){} },
  /* Ce que la file contient — à lire dans la console ou par le geste secret. */
  etat:function(){
    var parK={};
    for(var i=0;i<_OB.f.length;i++)parK[_OB.f[i].k]=(parK[_OB.f[i].k]||0)+1;
    return {envoi:ENVOI, enAttente:_OB.f.length, parType:parK, rebut:_OB.r.length,
            diffArme:_diffArme, proprio:_proprio(), disqueKO:_disqueKO,
            feu:_peutDepiler(), motif:_dernierMotif, enVol:!!_enVol,
            metronome:!!_metronome, purgeDue:_purgeDue(),
            livraison:LIVRAISON, blobMotif:_livraisonMotif, refonteVue:_refonteVue,
            premieres:_OB.f.slice(0,5).map(function(e){return e.k+' '+e.id;})};
  },
};
try{ window.SYNC=SYNC; }catch(e){}

/* ═══ LES DÉCLENCHEURS — quatre, et pas un de plus ═══
   Le métronome (45 s, armé paresseusement) vit dans §6. Les trois autres sont
   ici. Chacun rend la main tout de suite : `_depiler()` ne rejette jamais, et le
   verrou de ré-entrance rend les chevauchements inoffensifs — ce qui compte, car
   'visibilitychange' et 'focus' se déclenchent à quelques millisecondes d'écart
   au retour dans l'app.
   ⚠️ Le 'visibilitychange' posé ici est SÉPARÉ de celui du 28/08 (qui vide le
   minuteur de cloudSaveSoon) : deux tâches distinctes, deux écouteurs distincts. */
try{
  window.addEventListener('online',function(){ _depiler(); });
  window.addEventListener('pagehide',function(){ _depiler(); });
  document.addEventListener('visibilitychange',function(){ if(document.hidden)_depiler(); });
}catch(e){}
