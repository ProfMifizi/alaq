/* rappels.js — LES RAPPELS QUOTIDIENS (web push) : la carte « Ta leçon t'attend chaque jour » après la leçon, l'installation
   sur iPhone, l'abonnement de l'appareil, le réglage de Paramètres, et LE PLAN DES 7 JOURS que le serveur envoie tel quel.
   ⛔ L'app n'écrit AUCUN texte de notification : elle écrit le plan (mots dus, mot du jour, prénom), le serveur écrit le
   texte (supabase/push-abonnements.sql, push_texte) et ne recalcule jamais. Un jour sans ligne dans le plan = aucun rappel.
   Le service worker (sw.js) affiche la notification ; ici, tout le reste.

   Script CLASSIQUE, ni defer ni module, posé APRÈS serie-mots.js : RIEN n'agit au chargement (ni S lu, ni réseau, ni écouteur).
   Il s'allume par deux accroches de coque.js — returnFromPlayer (la carte, le plan) et le démarrage (rappelDemarrer) —,
   par fillFinishCases (constance.js : rappelNoterFin) et par la carte de Paramètres (ui/parametres.js). Chacune le
   résout À L'APPEL, sous typeof : sans ce fichier, l'app ne change en rien.
   À L'APPEL : S, CLOUD, SB, SYNC, _syncPret, _rpcDe (progression.js — « UN COMPTE PAR PAGE » : les quatre RPC passent
   sous un jeton vérifié puis épinglé, jamais SB.rpc en direct) · today, _addDays (constance.js) · allReviewWords,
   dueReviewWordsAt, REV_NEW_PER_DAY (revision.js) · toast, returnFromPlayer (coque.js) · showObAccount (comptes.js) ·
   renderParams (ui/parametres.js).

   ⛔ L'ÉTAT D'APPAREIL vit dans localStorage (alaq_rappel), jamais dans S : un abonnement est celui d'UN appareil, il ne
   suit pas le compte. Les champs : on (abonné), uid (le compte qui l'a activé : un autre compte sur le même appareil ne
   le voit pas actif), h (l'heure choisie), vu (dernier jour où la carte s'est montrée), n (combien de fois), attente
   (« oui » dit, compte ou installation manquants), off (éteint par Paramètres).
   ⛔ Inerte dans le mode vitrine, dans le paquet natif (pas de service worker) et sur tout navigateur sans push.
   Gardes : outils/verifier-rappels.mjs, previews/_verif_rappels.html. (journal : rappels.js · les rappels, étape 2) */

var RAPPEL_CLE='alaq_rappel';
var RAPPEL_HEURES=[8,12,18,21];     // HEURE LOCALE de l'élève : le serveur n'en accepte pas d'autres
var RAPPEL_HEURE_DEFAUT=18;
var RAPPEL_JOURS=7;                 // le plan : aujourd'hui et les 6 jours suivants (le serveur en garde 8 au plus)
var RAPPEL_REPROPOSER_JOURS=7;      // « Plus tard » : la carte revient au bout d'une semaine, trois fois au plus
var RAPPEL_PROPOSITIONS_MAX=3;
var RAPPEL_SYNCHRO_MS=20*60*1000;   // une visite = un plan, mais pas plus d'un toutes les 20 min
var _rpFin=false, _rpPropose=false, _rpOccupe=false, _rpDern=0, _rpEnVol=false, _rpRepasse=false, _rpDemarre=false, _rpChoix=18;

/* ── l'état d'appareil ── */
function _rpLire(){
  try{ var o=JSON.parse(localStorage.getItem(RAPPEL_CLE)||'null'); return (o&&typeof o==='object'&&!Array.isArray(o))?o:{}; }
  catch(e){ return {}; }
}
function _rpEcrire(o){ try{ localStorage.setItem(RAPPEL_CLE,JSON.stringify(o)); }catch(e){} }
function _rpHeureValide(h){ h=+h; return RAPPEL_HEURES.indexOf(h)>=0?h:RAPPEL_HEURE_DEFAUT; }
function _rpToast(m){ try{ if(typeof toast==='function')toast(m); }catch(e){} }
/* abonné ICI, au nom du compte connecté ? Sans session lue (premier rendu), on ne présume pas un autre compte. */
function _rpActif(e){
  try{ return !!e.on&&_rpPermission()==='granted'&&(!e.uid||!(typeof CLOUD!=='undefined'&&CLOUD.user)||e.uid===CLOUD.user.id); }
  catch(x){ return false; }
}
function _rpPermission(){ try{ return (typeof Notification!=='undefined'&&Notification.permission)||'default'; }catch(e){ return 'default'; } }

/* ── ce que CET appareil peut : 'oui' | 'installer' (iPhone, Alaq pas encore sur l'écran d'accueil) | 'non' ──
   ⛔ Le service worker doit CONTRÔLER la page : le paquet natif n'en a pas (npm run natif le coupe), le poste local le
   désinscrit, le mode vitrine n'en pose pas — dans ces trois cas, rien ne s'affiche. Pas d'embuche à l'abonnement. */
function _rpContexte(){
  var ua=''; try{ ua=navigator.userAgent||''; }catch(e){}
  var ios=/iPad|iPhone|iPod/.test(ua)||(typeof navigator!=='undefined'&&navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  var installee=false;
  try{ installee=!!(navigator.standalone||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)); }catch(e){}
  return {ios:ios,installee:installee};
}
function rappelsDispo(){
  try{
    if(window.__alaqVitrine)return 'non';
    if(window.Capacitor&&typeof window.Capacitor.isNativePlatform==='function'&&window.Capacitor.isNativePlatform())return 'non';
    if(!('serviceWorker' in navigator)||!navigator.serviceWorker.controller)return 'non';
    if('PushManager' in window&&'Notification' in window)return 'oui';
    var c=_rpContexte();
    return (c.ios&&!c.installee)?'installer':'non';   // iOS : PushManager n'existe QUE dans l'app ajoutée à l'écran d'accueil (iOS 16.4 et +)
  }catch(e){ return 'non'; }
}

/* ── LE PLAN DES 7 JOURS ──
   m = le nombre de mots à réviser ce jour-là : dueReviewWords() REJOUÉ à la date D (les mots dont S.rev[mot].next <= D,
   plus les mots neufs, 7 au plus) ; w = le mot du jour (le premier de la file de ce jour-là, 40 caractères au plus).
   ⛔ Un jour déjà validé (S.lastDay === today()) n'a pas de ligne. ⛔ Jamais revIntakeLeft() : il ÉCRIT S.revIn.
   Pour AUJOURD'HUI seulement, les places neuves restantes sont lues dans S.revIn sans l'écrire. */
function rappelPlan(){
  var t=today(), jours={};
  var admis=(typeof REV_NEW_PER_DAY==='number')?REV_NEW_PER_DAY:7;
  var prise=(S.revIn&&S.revIn.d===t)?(+S.revIn.n||0):0;
  for(var i=0;i<RAPPEL_JOURS;i++){
    var d=_addDays(t,i);
    if(i===0&&S.lastDay===t)continue;
    var m=0, w='';
    try{
      var dus=dueReviewWordsAt(d,i===0?Math.max(0,admis-prise):admis);
      m=Math.min(999,dus.length);
      for(var k=0;k<dus.length;k++){ var mot=String(dus[k]&&dus[k].w||''); if(mot&&mot.length<=40){ w=mot; break; } }
    }catch(e){ m=0; w=''; }
    jours[d]={m:m,w:w};
  }
  return {prenom:String(S.prenom||'').slice(0,40),jours:jours};
}

/* Cette page peut-elle parler au nom du compte ? Les mêmes conditions que cloudSaveNow : le nuage de CE compte est lu,
   l'état de la page est le sien, la page n'est pas condamnée. Sinon le plan serait celui d'un autre. */
function _rpMaPage(){
  try{
    if(!(typeof SB!=='undefined'&&SB&&typeof CLOUD!=='undefined'&&CLOUD.user))return false;
    if(typeof SYNC!=='undefined'&&SYNC&&typeof SYNC.redemarre==='function'&&SYNC.redemarre())return false;
    if(typeof _syncPret!=='undefined'&&!_syncPret)return false;
    return !!(S&&S._uid&&S._uid===CLOUD.user.id);
  }catch(e){ return false; }
}
function _rpFuseau(){ try{ return Intl.DateTimeFormat().resolvedOptions().timeZone||'Europe/Paris'; }catch(e){ return 'Europe/Paris'; } }
function _rpBytes(b64u){
  var b=String(b64u).replace(/-/g,'+').replace(/_/g,'/'); while(b.length%4)b+='=';
  var bin=atob(b), u=new Uint8Array(bin.length); for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i); return u;
}
function _rpMemeCle(sub,cle){
  try{ var a=sub.options&&sub.options.applicationServerKey; if(!a)return true;   // rien à comparer : on garde
       var x=new Uint8Array(a); if(x.length!==cle.length)return false;
       for(var i=0;i<x.length;i++)if(x[i]!==cle[i])return false; return true; }
  catch(e){ return true; }
}
/* L'abonnement de l'appareil auprès du serveur. L'alerte de permission est DÉJÀ passée (ou ne l'est pas : on ne l'ouvre
   jamais ici) ; ne rend rien, lève sur un refus du serveur. */
async function _rpEnregistrer(uid,sub,heure){
  var k=(sub.toJSON&&sub.toJSON().keys)||{};
  var r=await _rpcDe(uid,'push_enregistrer',{p_endpoint:sub.endpoint,p_p256dh:k.p256dh,p_cle_auth:k.auth,
    p_tz:_rpFuseau(),p_heure:heure,p_plan:_rpMaPage()?rappelPlan():{prenom:'',jours:{}}},12000,'abonnement aux rappels');
  if(r&&r.error)throw r.error;
}

/* ── À CHAQUE VISITE ET À CHAQUE FIN DE LEÇON : le plan, sans bloquer rien ── */
async function rappelSynchro(force){
  if(_rpEnVol){ if(force)_rpRepasse=true; return false; }   // un envoi est en vol : celui-ci repartira derrière (l'heure changée ne se perd pas)
  try{
    var e=_rpLire(); if(!e.on)return false;
    if(rappelsDispo()!=='oui')return false;
    if(_rpPermission()!=='granted'){ e.on=0; _rpEcrire(e); return false; }   // réglé ailleurs (réglages du téléphone) : on n'insiste pas
    if(!_rpMaPage())return false;
    if(e.uid&&e.uid!==CLOUD.user.id)return false;        // abonné par un autre compte de cet appareil : ses rappels ne sont pas à nous
    var now=Date.now(); if(!force&&now-_rpDern<RAPPEL_SYNCHRO_MS)return false;
    _rpEnVol=true; _rpDern=now;
    var uid=CLOUD.user.id, h=_rpHeureValide(e.h);
    var reg=await navigator.serviceWorker.ready, sub=await reg.pushManager.getSubscription();
    if(!sub){ sub=await _rpReabonner(uid,reg); if(!sub){ e=_rpLire(); e.on=0; _rpEcrire(e); return false; } }
    var r=await _rpcDe(uid,'push_plan',{p_endpoint:sub.endpoint,p_heure:h,p_plan:rappelPlan()},10000,'plan des rappels');
    if(r&&r.error)throw r.error;
    if(r&&r.data===false)await _rpEnregistrer(uid,sub,h);   // le serveur ne connaît plus cet appareil : il se réinscrit
    return true;
  }catch(err){ return false; }
  finally{ _rpEnVol=false; if(_rpRepasse){ _rpRepasse=false; rappelSynchro(true); } }
}
/* L'abonnement a disparu du navigateur (iOS l'a révoqué, les données du site ont été vidées) alors que la permission est
   toujours donnée : on le refait sans rien demander. Rend null si on n'y arrive pas. */
async function _rpReabonner(uid,reg){
  try{
    var rc=await _rpcDe(uid,'push_cle_publique',{},10000,'clé des rappels');
    if(!rc||rc.error||!rc.data)return null;
    var sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:_rpBytes(rc.data)});
    await _rpEnregistrer(uid,sub,_rpHeureValide(_rpLire().h));
    return sub;
  }catch(e){ return null; }
}
/* Le démarrage : une seule fois, jamais avant le premier rendu. La visite compte dès que le nuage de ce compte est lu. */
function rappelDemarrer(){
  if(_rpDemarre)return; _rpDemarre=true;
  try{
    if(!_rpLire().on)return;   // personne n'est abonné ici : rien à écouter, rien à planifier (un abonnement neuf rouvre l'écoute)
    document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible')rappelSynchro(false); });
    var n=0, t=setInterval(function(){
      n++; if(n>14){ clearInterval(t); return; }
      if(_rpMaPage()){ clearInterval(t); rappelSynchro(true); }
    },2500);
  }catch(e){}
}

/* ── LA CARTE, APRÈS LA FIN D'UNE LEÇON ──
   rappelNoterFin() : constance.js l'appelle à l'ouverture de CHAQUE écran de fin (leçon, évaluation, révision, film).
   rappelAuRetour() : première ligne de returnFromPlayer ; rend true si la carte s'est montrée (returnFromPlayer reprendra
   quand elle se ferme). Quitter une leçon à moitié n'est pas une fin : rien ne se propose. */
function rappelNoterFin(){ _rpFin=true; }
function rappelAProposer(){
  try{
    if(_rpPropose)return false;                          // une fois par page : jamais deux fois d'affilée
    if(rappelsDispo()==='non')return false;
    var e=_rpLire();
    if(_rpActif(e)||e.off)return false;                  // déjà abonnée (à ce compte), ou éteinte par Paramètres : la carte ne revient pas
    if(_rpPermission()==='denied')return false;          // refusée au système : seule la réglage du téléphone la rouvre
    if(e.attente&&typeof CLOUD!=='undefined'&&CLOUD.user)return true;   // « oui » dit sans compte : le compte est là, on reprend
    if(!e.n)return true;                                 // jamais proposée : c'est la 1re fois
    if(e.n>=RAPPEL_PROPOSITIONS_MAX)return false;
    return daysGap(e.vu||'',today())>=RAPPEL_REPROPOSER_JOURS;   // « Plus tard » : une semaine
  }catch(err){ return false; }
}
function rappelAuRetour(){
  var fin=_rpFin; _rpFin=false;                          // consommée : le retour suivant, sans fin, ne propose rien
  if(!fin)return false;
  try{ rappelSynchro(true); }catch(e){}
  if(!rappelAProposer())return false;
  rappelProposer();
  return true;
}

/* ── les pièces de la préview validée (previews/_apercu-notifications-v1.html) ── */
var _RP_ICO='<svg class="prm-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="color:var(--gold2)">'+
  '<circle cx="12" cy="12.5" r="8.5"/><path d="M12 7.6v4.9l3.2 2"/></svg>';
var _RP_PARTAGER='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+
  '<path d="M8.5 9.5H7a1.5 1.5 0 0 0-1.5 1.5v8A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 17 9.5h-1.5"/><path d="M12 14V3.5M8.5 7 12 3.5 15.5 7"/></svg>';
var _RP_AJOUTER='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+
  '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8.5v7M8.5 12h7"/></svg>';
function _rpHeuresHTML(sel,action){
  return '<div class="prm-goals">'+RAPPEL_HEURES.map(function(h){
    return '<button class="prm-goal'+(h===sel?' sel':'')+'" onclick="'+action+'('+h+')">'+h+' h</button>';
  }).join('')+'</div>';
}
/* la mascotte de la fin de leçon, CLONÉE depuis la page (ses id renommés : le dégradé du halo reste le sien) */
function _rpMascotte(){
  var s=document.getElementById('masc'); if(!s)return '';
  return '<div class="masc-wrap" style="width:120px">'+s.outerHTML.replace(/id="([^"]+)"/g,'id="rap-$1"').replace(/url\(#mgl\)/g,'url(#rap-mgl)')+'</div>';
}
/* un écran plein, comme la proposition du Ghufrān : une colonne de 340 px */
function _rpEcran(id,html){
  var m=document.createElement('div'); m.className='finish on'; m.id=id;
  m.innerHTML='<div style="max-width:340px;width:100%;margin:0 auto;text-align:center;position:relative">'+html+'</div>';
  document.body.appendChild(m); return m;
}
function _rpRetirer(id){ var m=document.getElementById(id); if(m&&m.parentNode)m.parentNode.removeChild(m); }

function rappelProposer(){
  _rpPropose=true;
  var e=_rpLire(); e.vu=today(); e.n=(e.n||0)+1; _rpEcrire(e);
  _rpChoix=_rpHeureValide(e.h);
  _rpRetirer('rappelDemande');
  _rpEcran('rappelDemande',_rpMascotte()+'<h2>Ta leçon t’attend chaque jour</h2><p class="rap-q">Je te le rappelle ?</p>'+
    '<div class="rap-heures">'+_rpHeuresHTML(_rpChoix,'rappelChoisir')+'</div>'+
    '<button class="cbtn" id="rappelOui" onclick="rappelOui()">Me le rappeler</button>'+
    '<button class="cbtn cbtn-2" onclick="rappelPlusTard()">Plus tard</button>');
}
function rappelChoisir(h){
  _rpChoix=_rpHeureValide(h);
  var m=document.getElementById('rappelDemande'); if(!m)return;
  var bs=m.querySelectorAll('.prm-goal');
  for(var i=0;i<bs.length;i++)bs[i].classList.toggle('sel',RAPPEL_HEURES[i]===_rpChoix);
}
function rappelPlusTard(){
  _rpRetirer('rappelDemande');
  try{ returnFromPlayer(); }catch(e){}
}
function rappelOui(){ return rappelActiver(_rpChoix,'carte'); }
function _rpApres(quand){
  if(quand==='carte'){ try{ returnFromPlayer(); }catch(e){} }
  else{ try{ if(document.getElementById('view-params'))renderParams(); }catch(e){} }
}
function rappelInstallerEcran(quand){
  _rpRetirer('rappelInstaller');
  var m=_rpEcran('rappelInstaller','<img src="icone-alaq-192.png" alt="" style="width:72px;height:72px;border-radius:17px;display:block;margin:0 auto">'+
    '<h2>Une étape de plus</h2><p class="rap-q">Sur iPhone, les rappels n’arrivent qu’une fois Alaq sur l’écran d’accueil.</p>'+
    '<ol class="rap-etapes">'+
      '<li><span class="rap-ic">'+_RP_PARTAGER+'</span><span>Partager<small>sur iOS 26 : dans « ··· »</small></span></li>'+
      '<li><span class="rap-ic">'+_RP_AJOUTER+'</span><span>Sur l’écran d’accueil</span></li>'+
      '<li><span class="rap-ic"><img src="icone-alaq-192.png" alt=""></span><span>Ouvre Alaq depuis son icône</span></li>'+
    '</ol><button class="cbtn" onclick="rappelInstallerFermer(\''+(quand==='carte'?'carte':'params')+'\')">J’ai compris</button>');
  return m;
}
function rappelInstallerFermer(quand){ _rpRetirer('rappelInstaller'); _rpApres(quand); }

/* ── S'ABONNER ──
   Le geste de l'élève ouvre la fenêtre du système : Notification.requestPermission() est appelé AVANT tout await de cette
   fonction (iOS refuse une permission demandée hors d'un geste). La clé publique est lancée en même temps, attendue ensuite. */
async function rappelActiver(heure,quand){
  if(_rpOccupe)return 'occupe';
  heure=_rpHeureValide(heure);
  var e=_rpLire(); e.h=heure; e.off=0;
  var dispo=rappelsDispo();
  if(dispo==='non'){ _rpRetirer('rappelDemande'); _rpApres(quand); return 'non'; }
  /* le serveur exige un compte : « oui » est gardé, la carte reviendra dès que le compte existe */
  if(!(typeof SB!=='undefined'&&SB&&typeof CLOUD!=='undefined'&&CLOUD.user)){
    e.attente=1; _rpEcrire(e); _rpRetirer('rappelDemande');
    _rpToast('Crée d’abord ton compte');
    if(quand==='carte'){ try{ showObAccount(); }catch(x){ _rpApres(quand); } } else _rpApres(quand);
    return 'compte';
  }
  if(dispo==='installer'){ e.attente=1; _rpEcrire(e); _rpRetirer('rappelDemande'); rappelInstallerEcran(quand); return 'installer'; }
  if(_rpPermission()==='denied'){
    _rpRetirer('rappelDemande'); _rpToast('Active les notifications d’Alaq dans les réglages du téléphone'); _rpApres(quand); return 'refuse';
  }
  var uid=CLOUD.user.id;
  var demande=(_rpPermission()==='default')?Promise.resolve(Notification.requestPermission()):Promise.resolve(_rpPermission());
  var cle=_rpcDe(uid,'push_cle_publique',{},10000,'clé des rappels'); cle.catch(function(){});
  _rpOccupe=true;
  var cree=null;
  try{
    var p=await demande;
    if(p!=='granted'){
      e.attente=0; _rpEcrire(e); _rpRetirer('rappelDemande');
      if(p==='denied')_rpToast('Active les notifications d’Alaq dans les réglages du téléphone');
      _rpApres(quand); return 'refuse';
    }
    var rc=await cle; if(!rc||rc.error||!rc.data)throw (rc&&rc.error)||new Error('clé publique absente');
    var kb=_rpBytes(rc.data);
    var reg=await navigator.serviceWorker.ready, sub=await reg.pushManager.getSubscription();
    if(sub&&!_rpMemeCle(sub,kb)){ await sub.unsubscribe(); sub=null; }   // la clé du serveur a changé : l'ancien abonnement ne servirait plus
    if(!sub){ sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:kb}); cree=sub; }
    await _rpEnregistrer(uid,sub,heure);
    e.on=1; e.uid=uid; e.attente=0; _rpEcrire(e); _rpDern=Date.now();
    _rpDemarre=false; rappelDemarrer();                    // l'écoute des visites commence maintenant
    cree=null;
  }catch(err){
    if(cree){ try{ await cree.unsubscribe(); }catch(x){} }   // inscrit chez le navigateur, pas chez le serveur : on défait
    e.on=0; _rpEcrire(e);
    _rpRetirer('rappelDemande');
    _rpToast('Rappel impossible pour l’instant, réessaie plus tard');
    _rpOccupe=false; _rpApres(quand); return 'echec';
  }
  _rpOccupe=false;
  _rpRetirer('rappelDemande');
  _rpApres(quand);
  return 'ok';
}

/* ── S'EN DÉSABONNER (Paramètres) : l'abonnement du navigateur d'abord, puis la ligne du serveur ── */
async function rappelDesactiver(){
  if(_rpOccupe)return false;
  _rpOccupe=true;
  var e=_rpLire(); e.on=0; e.off=1; e.attente=0; _rpEcrire(e);
  try{ renderParams(); }catch(x){}
  try{
    var ep=null;
    try{ var reg=await navigator.serviceWorker.ready, sub=await reg.pushManager.getSubscription();
         if(sub){ ep=sub.endpoint; await sub.unsubscribe(); } }catch(x){}
    /* sans session ou hors ligne, la ligne reste : le service de push répond 404/410 à son prochain envoi et le serveur la supprime */
    try{ if(ep&&typeof SB!=='undefined'&&SB&&typeof CLOUD!=='undefined'&&CLOUD.user)
           await _rpcDe(CLOUD.user.id,'push_supprimer',{p_endpoint:ep},8000,'désabonnement aux rappels'); }catch(x){}
  }finally{ _rpOccupe=false; }
  return true;
}

/* ── PARAMÈTRES : la carte « Rappel quotidien », après « Objectif quotidien » (rendue par renderParams) ── */
function rappelCarteHTML(){
  try{
    if(rappelsDispo()==='non')return '';
    var e=_rpLire(), actif=_rpActif(e);
    return '<div class="ccard" id="rappelCarte"><div class="ctt"><h3>'+_RP_ICO+' Rappel quotidien</h3></div>'+
      '<button class="prm-row" role="switch" aria-checked="'+(actif?'true':'false')+'" onclick="rappelBascule()">Me rappeler'+
        '<span class="prm-sw'+(actif?' on':'')+'"><i></i></span></button>'+
      (actif?'<div style="margin-top:10px">'+_rpHeuresHTML(_rpHeureValide(e.h),'rappelHeure')+'</div>':'')+
    '</div>';
  }catch(err){ return ''; }
}
function rappelBascule(){
  var e=_rpLire();
  if(_rpActif(e))return rappelDesactiver();
  return rappelActiver(_rpHeureValide(e.h),'params');
}
function rappelHeure(h){
  h=_rpHeureValide(h);
  var e=_rpLire(); e.h=h; _rpEcrire(e);
  try{ renderParams(); }catch(x){}
  return rappelSynchro(true);                            // le serveur apprend la nouvelle heure avec le plan
}
