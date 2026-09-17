/* ═══ progression.js — la persistance locale et la synchro nuage ═══════════════════════
   Porte : HEARTS_MAX, DEF, load()/save()/saveLocal() (localStorage.alaq2), S, dkey(),
   fixOrdreFormes() (migration idempotente), unitValidated()/unitUnlocked(), isDone()/setDone()
   (accroche POC-5) ; puis le moteur de synchro (cloudPull, cloudSaveNow, cloudInit,
   cloudResync), la file d'envoi et son diff (§3-§6), la livraison du blob (§7), SYNC (§8).
   ⛔ Script classique : ni import/export, ni defer, ni type="module". S est lu de façon
   synchrone par les scripts qui suivent (dès le chargement de revision.js, puis au premier
   rendu de l'accueil) : un module, différé, lèverait ReferenceError sur un écran mort.
   Résolus à l'appel seulement, jamais au chargement : UNITS (donnees.js), discsFor
   (parcours.js), buildForms (generateurs.js). Le contrat du moteur de synchro est en tête de
   sa section.
   ⚠️ window.S est un accesseur, jamais une capture : S est un let, réaffecté par cloudPull
   (ce fichier), doReset et importSave (comptes.js). Les function sont déjà des propriétés de
   window, les let/const non.
   Gardes : outils/verifier-progression.mjs, previews/_verif_progression.html,
   outils/verifier-sync-nuage.mjs. */

/* ================= ÉTAT ================= */
const HEARTS_MAX=7; // 7 vies — comme les sabʿ al-mathānī de la Fātiḥa
/* ⚠️ Le qari par défaut doit avoir des repères HOROV, sinon l'illumination mot à mot est morte
   pour qui n'ouvre jamais le sélecteur. (journal : progression.js · qari par défaut) */
const DEF={xp:0,done:{},tests:{},hearts:7,streak:0,lastDay:null,heartDay:null,qari:'ar.husary'};
/* ⚠️ Object.assign copie done et tests PAR RÉFÉRENCE : sans ces littéraux frais, S.done serait
   DEF.done, et une leçon écrite dans la constante passerait au compte suivant connecté sans
   rechargement. (journal : progression.js · DEF partagé par référence) */
function _neuf(){ return Object.assign({},DEF,{done:{},tests:{}}); }
function load(){try{return Object.assign(_neuf(),JSON.parse(localStorage.getItem('alaq2')||'{}'))}catch(e){return _neuf()}}
/* save() date S._ts, déclare au serveur (_semerLeDiff) et envoie au nuage (cloudSaveSoon) :
   réservée à une vraie progression. */
function save(){try{S._ts=Date.now();localStorage.setItem('alaq2',JSON.stringify(S))}catch(e){} _semerLeDiff(); cloudSaveSoon();}
/* saveLocal() écrit sur l'appareil, rien d'autre : ni date, ni déclaration, ni envoi.
   ⛔ Jamais pour une progression (leçon, cœur perdu, mot révisé, minutes d'objectif, score de
   constance) : elle ne rejoindrait jamais le nuage. Réservée à ce qui se recalcule seul sur
   chaque appareil (ménage du démarrage, migrations). ⚠️ Inversement, un save() de ménage au
   chargement rajeunit S._ts : cloudPull donnerait raison au dernier appareil ouvert, même plus
   pauvre, et le pousserait dans le nuage. (journal : progression.js · l'horodatage mentait) */
function saveLocal(){try{localStorage.setItem('alaq2',JSON.stringify(S))}catch(e){}}

let S=load();
/* window.S : un accesseur, jamais une capture (voir l'en-tête). */
Object.defineProperty(window,'S',{configurable:true,get(){return S;},set(v){S=v;}});

function dkey(u,i){return 'U'+UNITS[u].no+'-D'+i;}

/* Migration du 02/08 : « Les formes » est passée AVANT « Dans la Fātiḥa », et la progression est
   rangée par NUMÉRO de disque. On décoche la case pour la seule élève « repérage fait, formes pas
   faites », qui sauterait les formes. ⚠️ Le drapeau s'écrit même quand rien ne change : sinon une
   élève arrivée normalement à « formes faites, repérage pas fait » serait décochée à tort. */
function fixOrdreFormes(){
  if(S.fixFormes0208)return;
  S.fixFormes0208=1;
  UNITS.forEach(function(U,u){
    const i=discsFor(u).findIndex(function(d){return d.build===buildForms;});
    if(i<0)return;
    if(S.done[dkey(u,i)]&&!S.done[dkey(u,i+1)])delete S.done[dkey(u,i)];
  });
  /* saveLocal, pas save : une migration n'est pas une progression (voir saveLocal). Idempotente
     et gardée par son drapeau, elle se rejoue sur chaque appareil, cloudPull compris. */
  saveLocal();
}

function unitValidated(idx){ if(idx<0||idx>=UNITS.length)return false; const ds=discsFor(idx); return !!(S.done&&S.done[dkey(idx,ds.length-1)]); }
function unitUnlocked(idx){ const U=UNITS[idx]; if(!U||!U.ready)return false; if(U.no===1)return true; return unitValidated(idx-1); }

/* isDone()/setDone() : l'accroche prévue pour la synchro POC-5, rien ne les appelle encore.
   Elles enveloppent la même paire (S.done, dkey) que les écritures directes du reste de l'app. */
function isDone(u,i){ return !!(S.done&&S.done[dkey(u,i)]); }
function setDone(u,i,v){
  if(!S.done)S.done={};
  if(v===false)delete S.done[dkey(u,i)];
  else S.done[dkey(u,i)]=true;
}

/* ═══ LE MOTEUR DE SYNCHRONISATION (sorti d'index.html le 08/09/2026, POC-5 sous-lot 2) ═══
   Dans ce fichier parce qu'il a besoin de S, save() et saveLocal(), et que la file hors ligne
   doit exister dès le premier rendu. Au chargement, rien que des littéraux, un client Supabase
   sous try/catch (le CDN est defer : SB reste nul, et index.html le recrée au
   DOMContentLoaded) et des écouteurs.
   ① Résolus à l'appel, jamais capturés : verrouConnexion, verrouLibere (comptes.js) ;
      tikEnvoyer (signalements.js) et BUILD_NUM (index.html), sous typeof ; _progVisible
      (constance.js) ; renderHome, refreshStats, _homeFocusPending (ui/accueil.js — un let que
      cloudPull réassigne) ; renderProg (ui/parametres.js).
   ② Lus ailleurs : index.html lit SB, CLOUD, SUPA_URL, SUPA_ANON, cloudInit et écrit SB ;
      comptes.js lit S, DEF, save, SB, CLOUD, SYNC, _syncT, cloudPull ; signalements.js lit
      SUPA_URL, SUPA_ANON, CLOUD ; revision.js lit SB, SYNC ; ui/parametres.js lit SB, CLOUD,
      SYNC ; src/player lit SYNC (la portée lexicale globale est partagée).
   ⚠️ SB, CLOUD, _syncT, _syncPret sont des let/const : pas des propriétés de window.
   Garde : outils/verifier-sync-nuage.mjs, qui localise le bloc par l'arbre.
   (journal : progression.js · déménagement du moteur) */
const SUPA_URL='https://ykggxipgirgjwhhxmhbn.supabase.co';
const SUPA_ANON='sb_publishable_IpnRJf3j3JfyRhQ0WWSeww_V5ctBrkh'; // clé PUBLIQUE (la RLS protège les données)
let SB=null; try{ if(window.supabase)SB=window.supabase.createClient(SUPA_URL,SUPA_ANON,
  {auth:{persistSession:true,autoRefreshToken:true}}); }catch(e){} // la connexion SURVIT aux visites : jeton gardé et renouvelé tout seul (Myriam 13/07)
const CLOUD={user:null};
let _syncT=null;
function cloudSaveSoon(){ if(!SB||!CLOUD.user)return; clearTimeout(_syncT); _syncT=setTimeout(cloudSaveNow,2000); }
let _syncPret=false; // la première synchro de la session a-t-elle eu lieu ? (voir cloudSaveNow)
let _refonteVue=0;   // §7 : la state_migrated_at du DERNIER cloudPull réussi — jamais un défaut de 0 par ignorance

/* _avecGarde : aucun appel réseau sans délai de garde. Une requête qui ne se règle jamais (métro,
   portail captif) suspendrait cloudPull : _syncPret resterait faux et plus rien ne partirait, sans
   trace. _ticketSync : une panne de synchro n'est jamais muette ; le collecteur est résolu à
   l'appel et son absence ne lève pas (ce fichier doit tourner seul, en bac).
   (journal : progression.js · outils de sûreté) */
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
    /* ⚠️ On ne parle pas avant d'avoir écouté : tant que _syncPret est faux, on va lire le nuage,
       et cloudPull poussera lui-même si le local est le plus récent. Ce verrou ferme toute la
       classe des save() de démarrage. Pas de récursion : cloudPull pose _syncPret avant
       d'appeler cloudSaveNow. (journal : progression.js · le filet structurel) */
    if(!_syncPret){ await cloudPull(); return; }
    /* L'identité se fige avant l'attente et se revérifie après (session expirée, compte changé).
       ⚠️ Puis on ne pousse jamais un état plus vieux que celui du nuage : un onglet resté ouvert
       des heures écraserait en silence ce qu'un autre appareil a fait entre-temps.
       (journal : progression.js · l'onglet périmé) */
    const uid=CLOUD.user.id;
    const r=await _avecGarde(SB.from('profiles').select('state').eq('user_id',uid).maybeSingle(),
                             8000, 'lecture du profil avant envoi');
    /* Une erreur n'est pas un nuage vide : sans ce garde, remote serait indéfini et l'envoi
       partirait comme si le nuage ne portait rien. */
    if(r&&r.error) throw r.error;
    if(!CLOUD.user||CLOUD.user.id!==uid)return;   // le compte a changé pendant l'attente
    const remote=r&&r.data&&r.data.state;
    if(remote&&(remote._ts||0)>(S._ts||0))return;
    const w=await _avecGarde(SB.from('profiles').upsert({user_id:uid, prenom:S.prenom||null, state:S, updated_at:new Date().toISOString()}),
                             8000, 'envoi du profil');
    /* supabase-js ne lève pas, il résout avec {error} : on lève nous-mêmes, sinon un refus de
       la base (RLS, contrainte, jeton périmé) resterait muet. */
    if(w&&w.error) throw w.error;
  }catch(e){ _ticketSync('envoi', e); }
}
/* ⚠️ En arrière-plan, l'envoi en attente part tout de suite : fermer l'app dans les 2 s de
   cloudSaveSoon laissait une leçon hors du nuage. (journal : progression.js · la fenêtre de 2 s) */
document.addEventListener('visibilitychange',function(){
  if(document.hidden&&_syncT){ clearTimeout(_syncT); _syncT=null; cloudSaveNow(); }
});
async function cloudPull(){ // arbitre entre l'état local et le nuage du compte
  try{ if(!SB||!CLOUD.user)return;
    /* l'identité se fige avant l'attente (voir cloudSaveNow) */
    const uid=CLOUD.user.id;
    const r=await _avecGarde(SB.from('profiles').select('state,state_migrated_at').eq('user_id',uid).maybeSingle(),
                             8000, 'lecture du profil au démarrage');
    /* _syncPret ne se pose qu'après une lecture réussie : une erreur lève, le verrou reste fermé,
       le prochain passage réessaie. (journal : progression.js · identité et erreurs de lecture) */
    if(r&&r.error) throw r.error;
    if(!CLOUD.user||CLOUD.user.id!==uid)return;   // le compte a changé pendant l'attente
    const remote=r&&r.data&&r.data.state;
    /* state_migrated_at est posée par le SERVEUR (ventilation, chaque effacement), jamais par un
       client : elle seule dit si ce contenu précède un effacement, ce que S._ts (horloge client
       rajeunie à chaque geste) ne peut pas dire. (journal : progression.js · le tampon du dernier effacement) */
    const _refonteServeur=(function(){ try{ var d=r&&r.data&&r.data.state_migrated_at;
      var t=d?Date.parse(d):0; return isFinite(t)?t:0; }catch(e){ return 0; } })();
    const _refonteConnue=+S._refonte||0;   // ce que CET appareil a déjà vu, avant tout arbitrage
    _refonteVue=_refonteServeur;           // pour la livraison (§7) : la fraîcheur exigée d'un colis
    _syncPret=true;  // le nuage est LU : cet appareil a le droit de parler (voir cloudSaveNow)
    /* ⚠️ Un horodatage ne vaut que si l'état local appartient déjà à ce compte (_uid) : comparer
       des dates n'a de sens qu'au sein d'un même compte. Sinon le nuage fait foi (propriété
       inconnue : voir la fenêtre de migration), et la branche else n'écrit dans le nuage que
       pour un local dont on est sûr. (journal : progression.js · la fusion détruisait la progression) */
    const memeCompte = S._uid && CLOUD.user && S._uid===CLOUD.user.id;
    /* Un effacement jamais vu par cet appareil bat toute date et toute richesse — sur le même
       compte seulement. */
    const _reveille = memeCompte && _refonteServeur>_refonteConnue;
    /* ⚠️ Si remote n'a pas rattrapé cet effacement (RPC daté, upsert pas encore arrivé), on adopte
       du VIDE, jamais son contenu : du périmé entré dans S serait repoussé au prochain save()
       (cloudSaveNow, _semerLeDiff). (journal : progression.js · la course RPC/upsert) */
    const _remotePerime = _reveille && (+((remote&&remote._ts)||0))<=_refonteServeur;
    /* Fenêtre de migration : un état SANS _uid (d'avant le 17/08) ne se tranche ni à la date, ni
       « nuage d'office » : on garde le plus RICHE (leçons cochées), le perdant va dans
       alaq2_ecarte. Risque assumé : un appareil jamais déconnecté par son ancien propriétaire
       peut imposer son état plus riche. (journal : progression.js · la fenêtre de migration) */
    const richesse=function(x){ return x?Object.keys(x.done||{}).length:0; };
    let takeRemote;
    /* ⚠️ Nuage vide ne veut pas dire « garder le local » : l'état d'un TIERS (_uid d'un autre
       compte) n'est ni gardé ni poussé, il est mis de côté comme tout perdant et le compte neuf
       part vierge. (journal : progression.js · nuage vide et appareil partagé) */
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
    /* Capturé avant que S change de main : ce que §7 aura le droit de livrer. Un état _fresh
       (« ne me fais pas confiance ») ne se livre pas plus qu'il ne se compare. */
    var _avantS=S, _vuDistant=remote, _vuMeme=memeCompte, _vuPris=takeRemote, _vuFresh=!!S._fresh;
    delete S._fresh;
    if(takeRemote){
      /* Remote périmé : on repart de DEF (voir _remotePerime), et S._ts prend _refonteServeur.
         ⛔ Ne pas retirer ce _ts : au cloudPull suivant, _reveille est consommé, et un S._ts
         absent (0) perdrait la comparaison ordinaire — les leçons effacées reviendraient. Posé
         ainsi, il reste ≥ tout remote._ts périmé. (journal : progression.js · le _ts retiré à tort) */
      S=_remotePerime ? _neuf() : Object.assign(_neuf(),remote);
      if(_remotePerime)S._ts=_refonteServeur;
      delete S._fresh;
      /* Le marqueur du diff suit S (cloudPull est l'un des trois points de réaffectation connus),
         sinon le diff se désarmerait à la première synchro descendante. Les deux autres, doReset
         et importSave, vivent dans comptes.js. (journal : progression.js · le marqueur suit S) */
      try{ if(typeof _poserTag==='function')_poserTag(S); }catch(e){}
      S._uid=CLOUD.user.id;                           // désormais cet appareil sait à qui est cet état
      S._refonte=Math.max(_refonteConnue,_refonteServeur);  // le tampon suit S, comme _uid (même contrat)
      S.done=S.done||{};S.tests=S.tests||{};S.err=S.err||{};S.rev=S.rev||{};S.letSeen=S.letSeen||{};S.revIn=S.revIn||{d:'',n:0};
      /* ⛔ S.rev est réservé au vocabulaire (palier, prochaine date) : une notion de grammaire ne
         s'oublie pas et ne se rappelle pas à une date, elle vit à part, dans S.revGram — une clé
         neuve évite toute migration de l'existant. */
      S.revGram=S.revGram||{};
      fixOrdreFormes(); // l'état du nuage peut venir d'un appareil resté sur l'ancien ordre
      try{localStorage.setItem('alaq2',JSON.stringify(S));}catch(e){}
      // élève reconnue (session encore vivante) : on referme l'onboarding qui aurait pu s'ouvrir
      if(S.onboarded){try{document.getElementById('onb').classList.remove('on');}catch(e){}}
      _homeFocusPending=true; // et on recentre sur son disque courant
      try{refreshStats();renderHome();}catch(e){}
    } else {
      /* Cas où le local part au nuage : ① même compte, local le plus récent (la vraie fusion) ;
         ② aucune ligne dans le nuage, local à ce compte ou à personne ; ③ fenêtre de migration,
         local sans _uid plus riche. (journal : progression.js · la fusion détruisait la progression) */
      if(CLOUD.user)S._uid=CLOUD.user.id;
      S._refonte=Math.max(_refonteConnue,_refonteServeur);  // même tampon que dans l'autre branche
      try{localStorage.setItem('alaq2',JSON.stringify(S));}catch(e){}
      cloudSaveNow();
    }
    /* Le dépilage se greffe ici, jamais juste après la pose de _syncPret (avant l'arbitrage, S._uid
       peut être celui d'un autre compte) : ici, les deux branches ont posé S._uid. */
    _depiler();
    /* L'éligibilité du perdant se décide ici, où vit le contexte de l'arbitrage : même compte
       prouvé, pas _fresh, et pas disqualifié par un effacement tout juste appris (avec
       _reveille, le perdant EST le local périmé). Le gagnant n'a besoin que de la fraîcheur par
       blob (_livrable, §7). (journal : progression.js · la livraison redessinée) */
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
      /* une session qui expire en cours de route verrouille elle aussi (journal : progression.js · la session qui expire) */
      if(!CLOUD.user)verrouConnexion(); else verrouLibere();
    });
  }catch(e){}
}

/* Au retour sur l'app, on rejoue cloudPull : un onglet resté ouvert ne voit rien de ce qui a
   progressé ailleurs. ⚠️ Sauf en pleine leçon : remplacer S sous les pieds de l'élève
   casserait l'écran en cours. */
function cloudResync(){
  if(document.hidden)return;
  /* Le dépilage passe AVANT la garde du lecteur : il ne touche jamais à S, et l'en exclure
     priverait d'envoi la seule période où l'élève produit de la progression. */
  _depiler();
  var pl=document.getElementById('player');
  if(pl&&pl.classList.contains('on'))return; // leçon en cours : on ne touche à rien
  try{cloudPull();}catch(e){}
}
document.addEventListener('visibilitychange',function(){ if(!document.hidden)cloudResync(); });
window.addEventListener('focus',cloudResync);

/* ═══ LA FILE D'ENVOI ET LE DIFF (POC-5 sous-lots 4 et 5) ═══════════════════════════
   Un diff plutôt que des appels partout : une leçon est un ÉTAT (encore dans S demain, une
   déclaration ratée se répare au prochain save()) ; une graine est un ÉVÈNEMENT (manquée, elle
   ne revient jamais). Ce qui s'auto-répare prend le diff, le reste un appel explicite, avec un
   identifiant tiré une seule fois.
   Décisions de Myriam : ② une entrée fautive s'isole (compteur d'échecs par entrée, jamais par
   file) ; ③ le solde se corrige en silence ; ④ à l'inscription, la progression sans compte est
   livrée au serveur.
   ⚠️ Aucune date absolue n'entre dans une décision du moteur : une horloge d'appareil fausse ne
   doit rien pouvoir geler. SYNC.etat() montre la file dans la console.
   (journal : progression.js · la file en observation) */

/* ═════════════════════ §3 · LA FILE ═════════════════════ */
/* ENVOI : l'interrupteur de la file. Le remettre à false revient à l'observation sans perdre
   la file, qui reste sur le disque. */
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

/* ⛔ On relit ce qu'on vient d'écrire : la file doit être sur le disque avant toute tentative,
   et Safari en navigation privée a déjà accepté un setItem sans rien garder.
   ⛔ Jamais de place faite en purgeant alaq2_ecarte (l'unique copie des perdants d'arbitrage) :
   on sacrifie d'abord le rebut, purement informatif. */
let _disqueKO=0, _disqueTicket=false;
function _ecrire(cle,txt){
  try{ localStorage.setItem(cle,txt); if(localStorage.getItem(cle)===txt)return true; }catch(e){}
  /* Le repli resérialise sans le rebut : réécrire txt (rebut compris) redonnerait les mêmes
     octets, refusés de nouveau. (journal : progression.js · écritures relues et repli du rebut) */
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
   Une entrée : { id, k, d, uid, n, le } — n = nombre de refus explicites subis.
   ⚠️ Une entrée dont l'uid n'est pas le compte connecté DORT (ni envoyée, ni jetée) : sinon
   les graines d'une élève seraient versées sur le compte d'une autre. */
let _OB=_lire(OB_CLE,{f:[],r:[]});
if(!_OB||!_estTableau(_OB.f))_OB={f:[],r:[]};
if(!_estTableau(_OB.r))_OB.r=[];

function _obEcrire(){
  /* Deux onglets peuvent écrire la même file : on relit-fusionne-écrit par identifiant. Une
     leçon perdue reviendrait au prochain diff, une graine non. */
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
  /* La reprise s'arme dès que la file cesse d'être vide, pas seulement en fin de dépilage :
     une file remplie hors ligne, ou avant la preuve de propriété, doit repartir seule. */
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

/* ⚠️ Un identifiant d'entrée n'est unique qu'au sein d'un compte : la clé du cimetière porte
   le compte, sinon une entrée (ou un rebut) du compte A taisait à jamais la même leçon chez B.
   (journal : progression.js · identifiant unique par compte) */
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
   _CONNU : ce que le serveur sait déjà, par compte — { l:{}, t:{}, w:{}, g:{}, gk:{} }, plus
   p dès qu'un versement de graines est acquitté. */
let _CONNU=_lire(CONNU_CLE,{});
let _IGN=_lire(IGNORE_CLE,{});
function _connuPour(uid){
  var c=_CONNU[uid];
  if(!c||typeof c!=='object')c=_CONNU[uid]={l:{},t:{},w:{},g:{},gk:{}};
  if(!c.l)c.l={}; if(!c.t)c.t={}; if(!c.w)c.w={}; if(!c.g)c.g={}; if(!c.gk)c.gk={};
  return c;
}

/* ⚠️ Le marqueur sur S : une propriété NON ÉNUMÉRABLE (invisible de JSON.stringify, alaq2 ne
   bouge pas) qui manque à tout S qu'on n'a pas vu naître. Une réaffectation inconnue désarme
   le diff et le dit, plutôt que de redéclarer un état étranger. */
const _tag=('t'+Math.random()).slice(0,12);
let _diffArme=true;
let _resetAnnonce=false;   // SYNC.reset() l'arme : la prochaine réaffectation de S est ATTENDUE
function _poserTag(o){
  try{ Object.defineProperty(o,'_projTag',{value:_tag,enumerable:false,configurable:true,writable:true}); }catch(e){}
}
_poserTag(S);

/* Les étiquettes des notions de grammaire (choisies par Myriam).
   ⚠️ La clé est l'INDEX d'unité, pas son numéro (7 = l'unité 8), comme S.revGram.
   ⚠️ Une étiquette nomme la notion, jamais son contenu du moment : de nouveaux harf viendront.
   ⚠️ L'unité 8 porte une seule notion pour deux idées liées ; les séparer exigera de re-clé
   S.revGram et de migrer. (journal : progression.js · les étiquettes de grammaire) */
const GRAM_SLUG={ '7':'article-solaire-lunaire', '8':'harf' };

function _semerLeDiff(){
  if(!_diffArme)return false;
  var uid=_proprio(); if(!uid)return false;
  if(!S||S._projTag!==_tag){
    /* Une réaffectation annoncée par SYNC.reset() (doReset, comptes.js) repose le marqueur ;
       toute autre désarme le diff. (journal : progression.js · la réaffectation annoncée) */
    if(_resetAnnonce){ _resetAnnonce=false; _poserTag(S); }
    else{
      _diffArme=false; _poserTag(S);
      try{ if(typeof tikEnvoyer==='function')
        tikEnvoyer('suspect','sync — S remplace hors des trois points connus : diff desarme'); }catch(e){}
      return false;
    }
  }
  /* Le marqueur correspond, aucune réaffectation n'a eu lieu : l'annonce de SYNC.reset() est
     périmée et se consomme, sinon elle blanchirait la prochaine réaffectation inconnue. */
  _resetAnnonce=false;
  var c=_connuPour(uid), bouge=false;

  /* ① LES LEÇONS. dkey() écrit 'U<no>-D<i>' (le NUMÉRO d'unité), déjà ce qu'attend le serveur.
     Une clé hors format n'est pas devinée : elle est ignorée. */
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

  /* ③ LES PALIERS DU VOCABULAIRE. On n'émet que si le palier a bougé, sinon chaque save()
     redéclarerait tous les mots. L'identifiant porte le palier : deux montées, deux intentions. */
  try{
    Object.keys(S.rev||{}).forEach(function(w){
      var r=S.rev[w]; if(!r||!(r.n>0))return;
      if(c.w[w]===r.n||_IGN['w:'+w])return;
      if(_enfiler('w.'+w+'.'+r.n,'rev',
        {type:'word',item_id:w,step:r.n,next_due:r.next,success:true,maj:new Date().toISOString()},uid))bouge=true;
    });
  }catch(e){}

  /* ④ LA GRAMMAIRE. S.revGram[u]={n,ko} est un CUMUL d'écrans vus et ratés, pas un palier. Le
     plafond évite qu'un compteur aberrant émette mille intentions. */
  try{
    Object.keys(S.revGram||{}).forEach(function(u){
      var g=S.revGram[u], slug=GRAM_SLUG[String(u)];
      if(!g)return;
      /* ⛔ Une notion sans étiquette ne s'invente pas (l'identifiant vivrait pour toujours en
         base) : on se tait, mais on le dit. */
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
   Déclarées à l'instant du versement, le seul où lesson_id et sans_faute existent.
   L'identifiant est tiré une fois : il porte l'idempotence côté serveur.
   ⚠️ Sans compte, pas de propriétaire, donc pas d'entrée : les graines gagnées avant
   l'inscription ne rejoignent pas le compte (règle validée par Myriam). */
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
   ⚠️ Le seul point par lequel part une déclaration de la file : alaq_pousser (le blob, la purge
   et la livraison ont leurs propres appels).
   ① On ne parle qu'une fois le propriétaire prouvé : _syncPret ne suffit pas (jamais remis à
      false, et un changement de compte passe par onAuthStateChange sans cloudPull), il faut
      aussi que S._uid soit CLOUD.user.id. Le serveur crédite le compte de la session, jamais
      l'uid de l'entrée : c'est la garde contre l'erreur de destinataire.
   ② Une entrée d'un autre compte dort : ni envoyée, ni jetée.
   ③ Échec de transport ≠ refus : seul un acquittement « refus » explicite consomme une vie.
   ④ On ne jette jamais avant l'acquittement : rejouer est sûr (sauf rev, voir ⛔).
   ⑤ Le lot vaut 50 : le serveur refuse au-delà de 100, et PostgreSQL déborde son cache de
      sous-transactions au-delà de 64 par transaction.
   ⑥ Le métronome s'arme paresseusement : un setInterval au chargement réveillerait la page
      pour rien et figerait le banc node:vm.
   ⛔ Les entrées rev ne sont PAS idempotentes côté serveur (review_events sans on conflict,
   seen_count incrémenté) : une réponse perdue compte le mot deux fois. seen_count et ko_count
   ne sont lus par rien aujourd'hui ; le jour où un tableau de bord s'y fie, revenir ici.
   (journal : progression.js · les six règles du dépilage) */

let _enVol=null;        // la promesse du lot en vol — le verrou de ré-entrance
let _metronome=null;    // la reprise périodique, ARMÉE PARESSEUSEMENT (règle ⑥)
let _soldeAPoser=null;  // le solde certifié qui attend un instant muet
let _soldeDe=null;      // …et À QUI il appartient (voir _appliquerSolde)
let _soldePurge=false;  // …et s'il vient d'un effacement, où un zéro est un FAIT
let _dernierMotif='';   // ce que SYNC.etat() montre au geste des sept tapes

/* Sur le fil, l'entrée dépouillée : uid, n et le sont notre comptabilité locale. Le serveur
   écrit toujours sur auth.uid() ; envoyer uid laisserait croire qu'il protège. */
function _surLeFil(e){ return {id:e.id, k:e.k, d:e.d}; }

/* ⛔ build n'est protégé par aucune regex côté serveur (lu hors de tout bloc exception) : une
   valeur non entière ferait rebrousser TOUTE la transaction, acquittements compris. On ne
   transmet qu'une suite de chiffres prouvée — même prudence pour toute clé ajoutée ici. */
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

/* Ce que le serveur SAIT désormais : sans cette trace persistée, le diff redéclarerait tout à
   chaque save() et le trafic doublerait en silence. */
function _noterConnu(c,e){
  try{
    var d=e.d||{};
    if(e.k==='graines')c.p=1;   // ce compte a un portefeuille CERTIFIÉ : son solde mesure quelque chose
    else if(e.k==='lecon')c.l['U'+d.unit_no+'-D'+d.disc_no]=1;
    else if(e.k==='test')c.t[String(d.unit_no)]=1;
    else if(e.k==='rev'){
      if(d.type==='word')c.w[d.item_id]=d.step;
      else if(d.type==='grammar'){
        /* L'index vit dans l'identifiant 'g.<slug>.<n>'. On prend le MAXIMUM, pas un compteur :
           une entrée refusée au milieu ne doit pas figer la suite. */
        var m=/^g\.(.+)\.(\d+)$/.exec(e.id);
        if(m){ var s=m[1], n=+m[2];
          if(!(c.g[s]>=n))c.g[s]=n;
          if(d.success===false)c.gk[s]=(c.gk[s]||0)+1; }
      }
    }
  }catch(x){}
}

/* Le tri des acquittements : le serveur acquitte TOUTE entrée reçue (sinon la tête de file
   bloquerait). ⚠️ 'ok' ne prouve pas qu'une ligne a été écrite (on conflict do nothing, garde
   d'horloge, plafond du jour) : 'ok' et 'doublon' disent seulement « traitée, sors-la ». */
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
    /* Un refus explicite, et lui seul, consomme une vie (règle ③). Pas forcément définitif (le
       when others du serveur couvre des échecs passagers) : d'où trois essais. */
    e.n=(e.n||0)+1; refuses.push(e.id);
    if(e.n>=OB_REFUS_MAX){
      e.motif=String(a.motif||'refus sans motif').slice(0,200);
      /* ⛔ Le rebut entre au cimetière : sinon _obEcrire relit le disque et ressuscite l'entrée. */
      _OB.r.push(e); _acquittees[_cle(uid,e.id)]=1; rebut++;
    } else reste.push(e);
  }
  _OB.f=reste;
  _obEcrire();
  _ecrire(CONNU_CLE,JSON.stringify(_CONNU));
  return {sortis:sortis, rebut:rebut, refuses:refuses};
}

/* ═══ LA BALANCE CERTIFIÉE — en silence (décision ③ de Myriam) ═══
   Le portefeuille du serveur fait foi ; le compteur local diverge normalement (claim_reward ne
   paie un lesson_id qu'une fois par jour serveur, gagnerGraines à chaque rejeu).
   ⛔ Muette à l'œil : jamais pendant l'écran de fin, et aucun rendu forcé — un nombre qui
   change sous les yeux serait le bandeau que Myriam a refusé. (journal : progression.js · la balance certifiée) */
function _appliquerSolde(){
  if(_soldeAPoser===null)return false;
  /* ⚠️ Le solde de A ne s'écrit pas dans le compte de B : _appliquerSolde est aussi appelée sur
     le chemin refusé de _depiler, possiblement après un changement de compte.
     (journal : progression.js · solde et changement de compte) */
  if(_soldeDe && _soldeDe!==_proprio()){ _soldeAPoser=null; _soldeDe=null; return false; }
  try{ var f=document.getElementById('finish');
       if(f&&f.classList&&f.classList.contains('on'))return false; }catch(e){}
  /* Une purge distante en attente veut dire que le serveur porte ENCORE l'ancien
     solde : l'appliquer ressusciterait les graines que l'élève vient d'effacer. */
  if(_purgeDue())return false;
  var v=_soldeAPoser, pourPurge=_soldePurge; _soldeAPoser=null; _soldeDe=null; _soldePurge=false;
  /* ⚠️ Un portefeuille vide n'est pas un portefeuille à zéro : sans versement jamais acquitté,
     alaq_solde() rend 0 pour « je n'en sais rien ». On n'applique un zéro que si le serveur a
     déjà certifié ce compte, ou juste après une purge. (journal : progression.js · le portefeuille vide) */
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
   L'intention d'effacement est posée sur le disque AVANT le réseau : si l'app meurt entre les
   deux, le prochain dépilage reprend (sinon la balance certifiée rendrait tout au retour du
   réseau). ⚠️ Elle appartient à un compte, pas à l'appareil : une purge de A jamais aboutie
   gèlerait la balance certifiée des comptes suivants. (journal : progression.js · la purge d'un compte) */
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
  /* ⚠️ Le tampon se met à jour ICI, après une purge réussie : sinon le prochain arbitrage
     prendrait cet effacement pour « jamais vu » et révoquerait ce que l'élève a refait depuis.
     On relit la vraie date (un drapeau a un cycle de vie, une date non) ; si la relecture
     échoue, on ne lève pas : l'effacement gagne. (journal : progression.js · le tampon après purge) */
  try{
    var rr=await _avecGarde(SB.from('profiles').select('state_migrated_at').eq('user_id',uid).maybeSingle(),
                            8000,'relecture de la refonte après purge');
    var dd=rr&&rr.data&&rr.data.state_migrated_at, tt=dd?Date.parse(dd):0;
    /* Math.max est une ceinture, pas un garde porteur : state_migrated_at ne fait qu'avancer et
       le contrôle de S._uid écarte l'état d'un autre compte. Gardé : il ne coûte rien. */
    if(isFinite(tt)&&tt>0&&S&&S._uid===uid){ S._refonte=Math.max(+S._refonte||0,tt); saveLocal(); }
  }catch(e){}
  /* Le portefeuille est append-only : le serveur ne supprime pas les lignes, il
     écrit une compensation. Le solde qu'il rend est donc déjà à zéro. */
  var d=r&&r.data;
  if(d&&typeof d.solde==='number'&&isFinite(d.solde)){ _soldeAPoser=d.solde; _soldeDe=uid; _soldePurge=true; }
  return true;
}

/* Un tour de dépilage : autant de lots de 50 qu'il en faut, dans une SEULE promesse — fidèle à
   son travail réel, elle se mesure sans horloge. */
async function _unTour(){
  var envoye=0, rebut=0, tours=0;
  /* ⚠️ Une entrée ne perd qu'une vie par tour : les trois essais d'OB_REFUS_MAX sont trois
     occasions distinctes, pas trois lots de la même seconde. (journal : progression.js · une vie par tour) */
  var refusesCeTour={};
  var uid=CLOUD.user.id;
  /* ⚠️ D'abord la correction en attente : un solde refusé au tour précédent (écran de fin
     ouvert, purge due) doit avoir sa chance même quand il n'y a plus rien à envoyer. */
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
    /* supabase-js ne lève pas : il résout avec {error}. Une erreur de LOT ne touche aucune
       entrée : elle lève ici, sans consommer de vie (règle ③). */
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
  /* ⚠️ Un tour se termine toujours en posant ce qui attend : après une purge, la boucle sort
     au premier tour et la correction resterait suspendue. */
  _appliquerSolde();
  _dernierMotif=envoye?('envoye '+envoye+(rebut?(' · rebut '+rebut):'')):(_dernierMotif||'rien a envoyer');
  _reglerMetronome();
  return {envoye:envoye, rebut:rebut, motif:_dernierMotif};
}

/* ⛔ _depiler() ne rejette jamais : appelé en oubli-et-continue, une promesse orpheline
   donnerait au capteur 'unhandledrejection' (signalements.js) un ticket illisible au lieu du
   ticket nommé de _ticketSync. */
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
/* On ne s'arme que s'il y a quelque chose d'ENVOYABLE : des entrées endormies d'un autre compte
   réveilleraient la page toutes les 45 s pour rien. Le retour de ce compte passe par cloudPull,
   'online' ou 'focus'. (journal : progression.js · le métronome pour rien) */
function _aEnvoyer(){
  var p=_proprio(); if(!p)return false;
  for(var i=0;i<_OB.f.length;i++)if(_OB.f[i]&&_OB.f[i].uid===p)return true;
  return false;
}
function _reglerMetronome(){ if(_aEnvoyer())_armerMetronome(); else _desarmerMetronome(); }

/* ═════════════ §7 · LA LIVRAISON DU BLOB — POC-5 sous-lot 6 ═════════════
   Pourquoi : la file est aveugle au blob profiles.state qu'un vieux client écrit sans rien
   déclarer, et à l'état local PERDANT d'un arbitrage (les leçons faites en avion).
   On ne livre que done et tests : des booléens monotones, une union rejouable sans fin.
   ⛔ rev exclu : alaq_livrer_blob fusionne les paliers au least(), une livraison qui se rejoue
   tirerait éternellement vers le bas ce que la file certifie.
   ⛔ Aucune graine : une monnaie ne se lit pas dans un texte fabriqué par celui qu'elle enrichit.
   ⛔ La quarantaine _IGN s'applique aussi (codes ALAQ1. collés) : _moissonner filtre comme
   _semerLeDiff.
   Deux gardes, toutes deux nécessaires : _reveille (cloudPull) protège l'arbitrage contre un
   effacement ignoré ; _livrable protège la livraison contre la course entre le RPC qui date
   l'effacement et l'upsert qui vide profiles.state. (journal : progression.js · la livraison du blob) */
/* ⛔ LIVRAISON part désarmée, par choix : c'est le seul pas IRRÉVERSIBLE du POC-5 (une union
   dans user_progress ne se défait pas). La basculer à true est une décision de Myriam. Le banc
   l'arme dans son bac et vérifie que la source part désarmée. (journal : progression.js · livraison désarmée) */
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
/* On moissonne la VÉRACITÉ (l'app lit partout !!S.done[k]) et on consulte la quarantaine
   _IGN, comme _semerLeDiff. */
function _moissonner(src,out){
  if(!src||typeof src!=='object')return out;
  var k,d=src.done,t=src.tests,H=Object.prototype.hasOwnProperty;
  if(d&&typeof d==='object')for(k in d){ if(H.call(d,k)&&d[k]&&!_IGN['l:'+k])out.done[k]=true; }
  if(t&&typeof t==='object')for(k in t){ if(H.call(t,k)&&t[k]&&!_IGN['t:'+k])out.tests[k]=true; }
  return out;
}
/* Deux livraisons identiques ne repartent pas : cloudPull se rejoue à chaque reprise de focus. */
function _empreinteBlob(c){
  var a=Object.keys(c.done).sort(), b=Object.keys(c.tests).sort();
  return a.length+'·'+a.join(',')+'|'+b.length+'·'+b.join(',');
}

/* ⛔ Ne rejette jamais (oubli-et-continue depuis cloudPull, comme _depiler). perdant arrive déjà
   filtré par la propriété : restent la fraîcheur (_livrable), la quarantaine (_moissonner) et
   le fail-closed (_refonteVue jamais 0 par ignorance). */
function _livrerBlob(gagnant,perdant){
  try{
    if(!LIVRAISON||!SB){ _livraisonMotif='livraison eteinte'; return; }
    if(!CLOUD.user){ _livraisonMotif='pas de session'; return; }
    /* Fail closed : _refonteVue n'est posée que par un cloudPull réussi, dont _syncPret est le
       témoin — jamais un défaut de 0 par ignorance. (journal : progression.js · fail closed) */
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

/* ═══ §8 · SYNC — ce qu'appellent comptes.js (reset, importe, avantDeconnexion),
   revision.js et src/player (poseKind, graines), ui/parametres.js (etat) ═══ */
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
      /* La grammaire aussi : sans elle, un code collé ferait certifier jusqu'à GRAM_PLAFOND
         intentions par session. (journal : progression.js · la grammaire en quarantaine) */
      Object.keys(S.revGram||{}).forEach(function(u){
        var g=(typeof GRAM_SLUG!=='undefined')&&GRAM_SLUG[String(u)];
        if(g)_IGN['g:'+g]=1;
      });
      _ecrire(IGNORE_CLE,JSON.stringify(_IGN));
      _poserTag(S); _diffArme=true;
    }catch(e){}
  },
  /* ═══ L'EFFACEMENT — première ligne de doReset (comptes.js) ═══ On purge la file AVANT que
     S soit remplacé : ses entrées reconstruiraient au serveur la progression effacée. */
  reset:function(){
    try{
      var uid=_proprio();
      /* On n'efface que ce qui est à soi : les entrées endormies d'un autre compte restent
         (règle ② du §6). (journal : progression.js · on n'efface que ce qui est à soi) */
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
  /* ═══ AVANT LE signOut ═══ Après lui, plus de jeton : ce qui reste partirait en 401. On
     court une fois, 1,5 s au plus — hors ligne, le feu vert rend la main tout de suite. */
  avantDeconnexion:function(){
    try{ return Promise.race([Promise.resolve(_depiler()),
                              new Promise(function(r){ setTimeout(r,1500); })]); }
    catch(e){ return Promise.resolve(); }
  },
  /* Le dépilage à la demande (console). */
  depiler:function(){ try{ return _depiler(); }catch(e){ return Promise.resolve({envoye:0,motif:'?'}); } },
  /* Sans argument, sans perdant : ne livre que S, avec la même fraîcheur que le chemin normal
     (un perdant n'existe que le temps d'un arbitrage). (journal : progression.js · fail closed) */
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

/* ═══ LES DÉCLENCHEURS de la file ═══ Le métronome (§6), puis 'online', 'pagehide' et le passage
   en arrière-plan ; cloudResync dépile aussi au retour. Chacun rend la main tout de suite :
   _depiler() ne rejette jamais et son verrou de ré-entrance rend les chevauchements inoffensifs.
   ⚠️ Ce 'visibilitychange' est distinct de celui qui vide le minuteur de cloudSaveSoon. */
try{
  window.addEventListener('online',function(){ _depiler(); });
  window.addEventListener('pagehide',function(){ _depiler(); });
  document.addEventListener('visibilitychange',function(){ if(document.hidden)_depiler(); });
}catch(e){}
