/* comptes.js — les comptes et l'entrée dans l'app.
   · le compte (Supabase, code par e-mail) : cloudCardHTML, cloudMailInput / cloudCodeInput,
     cloudSendCode (la sonde « compte existant ? », mémorisée dans window._cloudProbe),
     cloudApplyVerdict, cloudVerify, cloudLogout ;
   · le verrou de déconnexion : VERROU_CONNEXION, verrouConnexion, verrouLibere, obLoginOpen / obLoginClose ;
   · l'onboarding : onbStart, onbShow, onbNext, onbBack, onbExistingAccount, onbLaunchLesson, la
     délégation des clics sur #onb .ob-opt, onbPrenomInput, et l'écran « Sauvegarde ta progression » :
     obAccTitle, showObAccount, obAccountClose, obLaterWarn, obLaterCancel, obLaterConfirm ;
   · le prénom / la kunya : nomChoisiHTML, openPrenom, closePrenom, savePrenom ;
   · l'effacement : resetProgress, cancelReset, doReset, et l'appui long de 2 s sur le logo (#brand).
   ⚠️ Le moteur de synchronisation (SB, CLOUD, cloudPull, cloudInit, SYNC…) vit dans progression.js.
   ⚠️ Une page ne parle qu'au nom d'un compte : quand un autre tient la session, cloudVerify se tait,
   cloudLogout et doReset rechargent sans rien toucher (voir « un compte par page », progression.js).
   ⚠️ L'état de l'onboarding (ONB, obAccountPending, pendingStreak) reste en let dans index.html :
   une seule instruction les déclare, et pendingStreak est l'état du joueur.
   ⚠️ escHTML, l'échappeur de toute l'app, reste lui aussi dans index.html.

   Script classique, jamais un module. Aucune ligne du premier rendu ne l'appelle : ses pannes
   seraient donc muettes.
   ① la fin du grand script lance onbStart et obLoginOpen (comptes.js) par setTimeout : un module
      différé entre en course avec ces minuteries (mesuré : l'onboarding ne s'ouvrait plus) ;
   ② quinze gestes en ligne du HTML statique l'appellent ;
   ③ le Profil appelle nomChoisiHTML dès qu'on le touche ;
   ④ progression.js appelle verrouConnexion / verrouLibere sous try/catch : le verrou céderait en silence.
   ⚠️ Un script classique absent donne les mêmes pannes muettes : les gardes mesurent donc les
   effets positifs (onboarding ouvert, #connexion ouvert, verrou posé).
   ⛔ Ni defer, ni type="module", ni import, ni export.
   Sa place, sous constance.js et juste avant le grand script, est la seule mesurée identique à la
   page d'avant ; ailleurs, une garde refuse la balise.

   AU CHARGEMENT : deux instructions agissent, et ne lisent que le DOM — la délégation des clics
   posée sur document et l'appui long posé sur #brand. ⛔ Rien d'un autre script.
   À L'APPEL seulement — et cette liste EST le contrat, gardée par le banc :
   S, DEF, save, SB, CLOUD, SYNC, _syncT, cloudPull, _avecGarde, _sessionMienne (progression.js)
   · maybeGhufranPrompt (constance.js) · renderHome
   (ui/accueil.js) · showTab (ui/navigation.js) · renderProg (ui/parametres.js)
   · startDisque (src/player, module) · toast, returnFromPlayer, lecteurPret,
   currentLesson, escHTML, ONB, obAccountPending (index.html).
   ⚠️ Entre ce fichier et le grand script, le navigateur rend la main une fois : ces fonctions
   existent, les let d'index.html pas encore. Sans conséquence tant que les calques #onb, #obLogin,
   #obAccount et #confirmReset restent masqués jusque-là (le menu du bas, visible, peut lever
   pendant ce tour sans rien sauvegarder).
   ET DANS L'AUTRE SENS, qui appelle comptes.js : progression.js (verrouConnexion,
   verrouLibere), constance.js et src/player (showObAccount), ui/parametres.js
   (nomChoisiHTML, cloudCardHTML, et openPrenom / cloudLogout dans le HTML
   qu'il produit), la fin du grand script d'index.html (onbStart,
   obLoginOpen), et les quinze gestes du HTML statique.

   Gardes : outils/verifier-comptes.mjs, previews/_verif_comptes.html (source, dist, et la copie
   sans ce fichier), garderLesComptes() (vite.config.mjs), CORE de sw.js ; doReset est aussi rejoué
   par outils/verifier-sync-nuage.mjs. (journal : comptes.js · en-tête d'origine) */

async function cloudSendCode(btn){
  const em=((document.getElementById('cloudEmail')||{}).value||'').trim();
  if(!SB){toast('Connexion indisponible hors ligne');return;}
  if(!/^\S+@\S+\.\S+$/.test(em)){toast('E-mail invalide 🤔');return;}
  if(btn)btn.disabled=true;
  try{
    // Sonde : shouldCreateUser:false n'envoie un code que si le compte existe ; sinon on rappelle sans l'option.
    // Verdict mémorisé par adresse : « Renvoyer un code » ne refait qu'un appel (limite de débit Supabase, 60 s).
    let known;
    if(window._cloudProbe && window._cloudProbe.em===em){
      known=window._cloudProbe.known;
      const r=await SB.auth.signInWithOtp(known?{email:em,options:{shouldCreateUser:false}}:{email:em});
      if(r&&r.error)throw r.error;
    }else{
      const probe=await SB.auth.signInWithOtp({email:em,options:{shouldCreateUser:false}});
      known=!(probe&&probe.error);
      if(!known){ const r=await SB.auth.signInWithOtp({email:em}); if(r&&r.error)throw r.error; }
      window._cloudProbe={em:em,known:known};
    }
    window._cloudEmail=em;
    const z=document.getElementById('cloudStep2'); if(z)z.style.display='block';
    cloudApplyVerdict(known,em);
    const ci=document.getElementById('cloudCode'); if(ci)setTimeout(function(){try{ci.focus();}catch(_){}} ,120);
    toast(known?'Tu as déjà un compte — connecte-toi 🔑':'Code envoyé — regarde tes e-mails 📧');
  }catch(e){ toast('Envoi impossible — réessaie dans une minute'); }
  if(btn)btn.disabled=false;
}
/* Le verdict de la sonde s'affiche, pas dans un toast de 2 s : compte existant + écran d'inscription ouvert,
   l'écran devient « Tu as déjà un compte » et il ne reste que l'e-mail et le code.
   Fonction séparée : outils/verifier-comptes.mjs la rejoue. */
function cloudApplyVerdict(known,em){
  const k=document.getElementById('cloudKnown'); if(k)k.style.display=known?'block':'none';
  const nw=document.getElementById('cloudNew'); if(nw)nw.style.display=known?'none':'block';
  const ec=document.getElementById('cloudMailEcho'); if(ec)ec.textContent=em||'';
  const vb=document.getElementById('cloudVerifyBtn');
  if(vb)vb.textContent=known?'🔑 Me reconnecter':'✅ Valider mon e-mail';
  const oa=document.getElementById('obAccount');
  if(known&&oa&&oa.classList.contains('on')){
    const t=document.getElementById('obAccountTitle'); if(t)t.textContent='Tu as déjà un compte';
    const qd=document.getElementById('obQuote'); if(qd)qd.style.display='none';
    oa.querySelectorAll('.rgpd-l').forEach(function(l){l.style.display='none';});
    if(k)k.style.display='none';   // le titre suffit, pas de panneau en plus
  }
}
async function cloudVerify(){
  const code=((document.getElementById('cloudCode')||{}).value||'').trim();
  if(!SB||!window._cloudEmail||code.length<6){toast('Saisis le code reçu par e-mail');return;}
  try{
    const r=await SB.auth.verifyOtp({email:window._cloudEmail, token:code, type:'email'});
    if(r&&r.error)throw r.error;
    /* Un AUTRE compte que celui de la page : l'écouteur de cloudInit l'a condamnée, elle recharge.
       Ni accueil de l'ancien compte, ni save() sur son état. */
    try{ if(SYNC.redemarre())return; }catch(_){}
    CLOUD.user=r.data&&r.data.user;
    /* la session vient de CETTE page : seule cette origine autorise la revendication persistante (progression.js) */
    try{ if(typeof _sessionMienne==='function')_sessionMienne(); }catch(_){}
  }catch(e){ toast('Code invalide ou expiré'); return; }
  var _mk=null; try{var _me=document.getElementById('cloudMkt'); if(_me)_mk=_me.checked?1:0;}catch(_){}
  toast('Connectée, ماشاء الله ✨');
  try{ await cloudPull(); }catch(_){}          // une erreur ici ne doit PAS faire croire que le code est faux
  if(_mk!==null){ S.mktOk=_mk; S.mktTs=Date.now(); save(); }  // consentement newsletter, HORODATÉ (preuve RGPD)
  try{ renderProg(); }catch(_){}
  verrouLibere();                                 // 17/08 : la connexion lève le verrou
  const lg=document.getElementById('obLogin');    // « J'ai déjà un compte » : on rejoint l'accueil
  if(lg&&lg.classList.contains('on')){ lg.classList.remove('on'); var lc=document.getElementById('obLoginCard'); if(lc)lc.innerHTML='';
    try{showTab('home');}catch(_){} try{maybeGhufranPrompt();}catch(_){} return; }
  const ov=document.getElementById('obAccount');  // dans l'onboarding : fermer l'écran compte et rejoindre l'accueil
  if(ov&&ov.classList.contains('on')){ ov.classList.remove('on'); var c=document.getElementById('obAccountCard'); if(c)c.innerHTML=''; try{returnFromPlayer();}catch(_){ try{renderHome();}catch(_){}} }
}
async function cloudLogout(){
  /* ⛔ Pas la session d'un AUTRE compte déjà visible (onglet resté ouvert) : signOut a une portée globale et la
     fermerait sur tous ses appareils. On recharge au lieu de déconnecter. ⚠️ Revérifié juste avant
     signOut : un autre compte peut arriver PENDANT les attentes. (journal : comptes.js · la déconnexion revérifiée)
     ⚠️ « Déjà visible », pas « jamais » : signOut relit LUI-MÊME le stockage, sans verrou (l'option lock de
     supabase-js est dépréciée et nulle par défaut en 2.116.0). Une session écrite par un autre onglet entre
     notre relecture et la sienne part dans le logout GLOBAL — quelques microtâches, et fermer cette course
     demande un changement de code (journal : comptes.js · la course qui reste).
     ⛔ getSession SANS délai de garde : signOut attend tout ce qu'il attend ; à l'échéance, « inconnu » passait
     pour « même compte » et signOut partait sous le jeton de B. (journal : comptes.js · la session lente) */
  try{ if(SB&&CLOUD.user){ var _gs=await SB.auth.getSession();
    var _su=_gs&&_gs.data&&_gs.data.session&&_gs.data.session.user;
    if(_su&&_su.id!==CLOUD.user.id){ location.reload(); return; } } }catch(e){}
  // ⛔ La progression de ce compte ne doit jamais passer au compte suivant sur cet appareil :
  // on vide la mémoire locale puis on recharge l'app (tout repart par le démarrage normal).
  /* Avant le signOut (après, plus de jeton : tout partirait en 401), la file court une dernière fois :
     bornée à 1,5 s, et hors ligne la main est rendue tout de suite. ⚠️ Dette : le signOut lui-même n'a aucun délai de garde
     (journal : comptes.js · signOut sans délai). */
  try{ if(typeof SYNC!=='undefined'&&SYNC&&SYNC.avantDeconnexion)await SYNC.avantDeconnexion(); }catch(e){}
  try{ if(SYNC.redemarre()){ location.reload(); return; } }catch(e){}
  /* signOut relit lui-même la session dans le stockage : on la relit juste avant, sans attente entre les deux */
  try{ if(typeof SYNC.ailleurs==='function'&&SYNC.ailleurs()){ location.reload(); return; } }catch(e){}
  try{ if(SB)await SB.auth.signOut(); }catch(e){}
  CLOUD.user=null;
  try{ clearTimeout(_syncT); }catch(e){}
  // appareil marqué « vierge » : au prochain login, le nuage fait foi. ⚠️ Sauf page condamnée PENDANT signOut : le disque est déjà celui du compte suivant.
  // ⚠️ typeof : devant un progression.js de la 3.18 (course d'activation du service worker), le disque est vidé comme en 3.18.
  try{ if(!(typeof SYNC.redemarre==='function'&&SYNC.redemarre()))localStorage.setItem('alaq2','{"_fresh":1}'); }catch(e){}
  location.reload();
}
function cloudCardHTML(mode){
  const inp='width:100%;background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:12px;color:var(--cream);font-family:var(--ui);font-size:15px';
  if(!SB)return '<p style="color:var(--muted);font-family:var(--ui);font-size:13px;margin:0">Connexion indisponible hors ligne — ta progression reste enregistrée sur cet appareil.</p>';
  if(CLOUD.user)return '<div class="acct" style="border:none;padding:4px 0"><span class="acct-dot"></span><span class="acct-mail">'+(CLOUD.user.email||'')+'</span>'+
    '<button class="acct-out" onclick="cloudLogout()">se déconnecter</button></div>'; // sobre : point de présence + e-mail, rien d'autre
  /* mode 'login' = « J'ai déjà un compte » : pas de case RGPD, le consentement date de l'inscription. */
  return '<input id="cloudEmail" type="email" autocomplete="email" inputmode="email" placeholder="Ton e-mail" oninput="cloudMailInput()" style="'+inp+'">'+
    (mode==='login'?'':
      '<label class="rgpd-l"><input type="checkbox" id="cloudRgpd" onchange="cloudMailInput()">'+
      '<span>J\'accepte que mon e-mail serve à créer mon compte et à sauvegarder ma progression. '+
      '<a href="confidentialite.html" target="_blank" rel="noopener">Politique de confidentialité</a></span></label>'+
      '<label class="rgpd-l"><input type="checkbox" id="cloudMkt">'+
      '<span>Je veux recevoir les conseils d\'apprentissage et les nouveautés d\'ALAQ <i style="font-style:normal;opacity:.75">(facultatif)</i></span></label>')+
    '<button class="cbtn" id="cloudSendBtn" disabled style="margin-top:8px" onclick="cloudSendCode(this)">📧 Recevoir mon code</button>'+
    '<div id="cloudStep2" style="display:none;margin-top:10px">'+
      '<div id="cloudKnown" class="known-box" style="display:none">🔑 <b>Tu as déjà un compte</b> — entre le code reçu.</div>'+
      '<p id="cloudNew" style="display:none;color:var(--muted);font-family:var(--ui);font-size:13px;margin:0 0 9px;line-height:1.45">Code envoyé à <b id="cloudMailEcho" style="color:var(--cream)"></b></p>'+
      '<input id="cloudCode" inputmode="numeric" maxlength="8" placeholder="Code reçu par e-mail" oninput="cloudCodeInput()" style="'+inp+';letter-spacing:.2em;text-align:center">'+
      '<button class="cbtn" id="cloudVerifyBtn" disabled style="margin-top:8px" onclick="cloudVerify()">✅ Valider mon e-mail</button>'+
      '<button onclick="cloudSendCode(this)" style="margin-top:8px;background:none;border:none;color:var(--muted);font-family:var(--ui);font-size:13px;text-decoration:underline;cursor:pointer;width:100%">Renvoyer un code</button>'+
    '</div>';
}
/* Le bouton d'envoi reste GRIS tant que l'adresse n'est pas plausible ET que le
   consentement n'est pas donné : le refus doit se voir AVANT le clic, pas après. */
function cloudMailInput(){
  var e=document.getElementById('cloudEmail'), b=document.getElementById('cloudSendBtn');
  if(!b)return;
  var ck=document.getElementById('cloudRgpd');
  var ok=/^\S+@\S+\.\S+$/.test(((e||{}).value||'').trim()) && (!ck||ck.checked);
  b.disabled=!ok;
}
function cloudCodeInput(){
  var c=document.getElementById('cloudCode'), b=document.getElementById('cloudVerifyBtn');
  if(b)b.disabled=(((c||{}).value||'').replace(/\D/g,'').length<6);
}

function onbStart(){ ONB={step:0,data:{}}; document.getElementById('onb').classList.add('on'); onbShow(); var v=document.getElementById('obVideo'); if(v){try{v.play();}catch(e){}} }
function onbShow(){
  var all=document.querySelectorAll('#onb [data-obs]');
  for(var i=0;i<all.length;i++)all[i].classList.toggle('on', +all[i].getAttribute('data-obs')===ONB.step);
  if(ONB.step===1){ var pi=document.getElementById('obPrenomOnb'); if(pi&&pi.value!==(S.prenom||''))pi.value=S.prenom||''; }
  var q=(ONB.step>=1&&ONB.step<=6);
  document.getElementById('onbTop').style.visibility=q?'visible':'hidden';
  if(q)document.getElementById('onbFill').style.width=Math.round(ONB.step/6*100)+'%';
  var b=document.querySelector('#onb .onb-body'); if(b)b.scrollTop=0;
}
function onbNext(){
  var need={2:'source',3:'intention',4:'niveau',6:'objectif'}[ONB.step]; // écrans-questions : réponse obligatoire
  if(need){ var v=ONB.data[need]; if(!v||(Array.isArray(v)&&!v.length)){ toast('Choisis une réponse 🙂'); return; } }
  if(ONB.step<7){ONB.step++;onbShow();}
}
function onbBack(){ if(ONB.step>0){ONB.step--;onbShow();} }
function onbExistingAccount(){ // élève existante sur un appareil neuf : le nuage fait foi (_fresh)
  S.onboarded=1; S.tutHome=1; S._fresh=1; save();
  document.getElementById('onb').classList.remove('on');
  if(CLOUD.user){ cloudPull(); showTab('home'); toast('Bon retour ✨'); return; } // session encore vivante : AUCUNE reconnexion à saisir
  obLoginOpen();
}
/* Se reconnecter : un écran à part, e-mail puis code, rien d'autre (sur l'onglet Progrès, l'élève
   croyait devoir se réinscrire). */
/* Le verrou de déconnexion (décision de Myriam, 17/08) : une élève qui avait un compte et n'est plus
   connectée voit la page de connexion, pas l'accueil (journal : comptes.js · le verrou de déconnexion).
   ⚠️ Trois gardes, chacune évite d'enfermer quelqu'un à tort :
   ① sans client Supabase (CDN non chargé), on ne peut pas savoir → on n'enferme pas ;
   ② un appareil qui n'a jamais connu de compte reste libre de s'inscrire ;
   ③ une déconnexion volontaire vide le localStorage : l'appareil repart en inscription.
   Hors ligne l'app reste utilisable : c'est la session gardée par Supabase (persistSession) qui compte. */
var VERROU_CONNEXION=false;
function verrouConnexion(){
  try{
    if(!SB)return;              // ① on ne peut pas savoir → on n'enferme pas
    if(CLOUD.user)return;       // connectée : rien à faire
    if(!S._uid&&!S._uidVu)return;          // ② appareil qui n'a jamais eu de compte (ni lu, ni REVENDIQUÉ) : inscription libre
    VERROU_CONNEXION=true;
    try{ document.getElementById('player').classList.remove('on'); }catch(e){}
    try{ document.getElementById('finish').classList.remove('on'); }catch(e){}
    var t=document.querySelector('#obLogin h2');
    if(t)t.textContent='Reconnecte-toi pour continuer';
    var b=document.getElementById('obLoginBack'); if(b)b.style.display='none';
    obLoginOpen();
  }catch(e){}
}
function verrouLibere(){
  VERROU_CONNEXION=false;
  var t=document.querySelector('#obLogin h2'); if(t)t.textContent='Content de te revoir !';
  var b=document.getElementById('obLoginBack'); if(b)b.style.display='';
}
function obLoginOpen(){
  /* Une seule carte de connexion vivante : avec deux #cloudEmail (et deux #cloudRgpd) dans le DOM,
     getElementById rendrait le mauvais et la case RGPD réapparaîtrait à la connexion. */
  var mien=document.getElementById('obLoginCard');
  ['cloudEmail','cloudRgpd','cloudCode','cloudStep2','cloudSendBtn','cloudVerifyBtn','cloudKnown','cloudNew','cloudMailEcho']
    .forEach(function(id){ var o=document.getElementById(id); if(o&&(!mien||!mien.contains(o))){ var c=o.closest('#obAccountCard,.ccard'); if(c)c.innerHTML=''; } });
  var c=document.getElementById('obLoginCard'); if(c)c.innerHTML=cloudCardHTML('login');
  document.getElementById('obLogin').classList.add('on');
  var i=document.getElementById('cloudEmail'); if(i)setTimeout(function(){try{i.focus();}catch(_){}} ,120);
}
function obLoginClose(){
  if(VERROU_CONNEXION)return;   // 17/08 : déconnectée, on ne sort pas de la page de connexion
  document.getElementById('obLogin').classList.remove('on');
  var c=document.getElementById('obLoginCard'); if(c)c.innerHTML=''; // pas de #cloudEmail en double avec Progrès
  if(!S.onboarded){ try{onbStart();}catch(_){} } else { try{showTab('home');}catch(_){} }
}
/* « Plus tard » : dire ce qu'on perd. Sans compte, la progression ne vit que dans
   le localStorage de CET appareil — et cloudLogout() le vide (voir sa note). */
function obLaterWarn(){
  var m=document.getElementById('laterModal');
  if(!m){ m=document.createElement('div'); m.className='finish'; m.id='laterModal'; document.body.appendChild(m); }
  m.innerHTML='<div style="max-width:340px;width:100%;margin:0 auto;text-align:center;position:relative">'+
    '<div style="font-size:44px">⚠️</div>'+
    '<h2 style="margin:8px 0 18px;font-size:21px">Tu perdras ta progression</h2>'+
    '<button class="cbtn" onclick="obLaterCancel()">CRÉER MON COMPTE</button>'+
    '<button class="cbtn" style="background:none;color:var(--cream);border:2px solid var(--line);margin-top:8px" onclick="obLaterConfirm()">Continuer sans compte</button>'+
    '</div>';
  m.classList.add('on');
}
function obLaterCancel(){ var m=document.getElementById('laterModal'); if(m)m.classList.remove('on'); }
function obLaterConfirm(){ obLaterCancel(); obAccountClose(); }
function onbLaunchLesson(){
  var pi=document.getElementById('obPrenomOnb'); if(pi)S.prenom=(pi.value||'').trim();
  S.onb={source:ONB.data.source||'', intention:ONB.data.intention||[], niveau:ONB.data.niveau||'', objectif:ONB.data.objectif||'', ts:Date.now()};
  S.onboarded=1; S.tutHome=1; save();
  document.getElementById('onb').classList.remove('on');
  obAccountPending=!CLOUD.user;                       // proposer le compte après cette 1re leçon si non connectée
  var L=(typeof currentLesson==='function'&&currentLesson())||{u:0,i:0};
  if(lecteurPret())startDisque(L.u,L.i);   // l'onboarding est consommé ; sans lecteur : l'accueil, et le toast dit de recharger
}
document.addEventListener('click',function(e){
  var b=e.target.closest('#onb .ob-opt'); if(!b)return;
  var k=b.getAttribute('data-obk'), v=b.getAttribute('data-obv');
  if(b.hasAttribute('data-obmulti')){
    b.classList.toggle('sel');
    ONB.data[k]=ONB.data[k]||[];
    var idx=ONB.data[k].indexOf(v);
    if(b.classList.contains('sel')){ if(idx<0)ONB.data[k].push(v); } else if(idx>=0)ONB.data[k].splice(idx,1);
  } else {
    ONB.data[k]=v;
    var sib=b.parentElement.querySelectorAll('.ob-opt');
    for(var i=0;i<sib.length;i++)sib[i].classList.remove('sel');
    b.classList.add('sel');
  }
});
function obAccTitle(){ return S.prenom?S.prenom+', sauvegarde ta progression.':'Sauvegarde ta progression'; }
function onbPrenomInput(v){ S.prenom=(v||'').trim(); save(); var t=document.getElementById('obAccountTitle'); if(t)t.textContent=obAccTitle(); }

/* Le nom choisi, affiché et modifiable dans la bande du compte : s'il manque, « Choisis ta kunya »
   prend sa place. Seul stockage : S.prenom (déjà synchronisé), rien de neuf à synchroniser. */
function nomChoisiHTML(){
  return S.prenom ? '<b>'+escHTML(S.prenom)+'</b>' : '<b class="acct-todo">Choisis ta kunya</b>';
}
function openPrenom(){
  var m=document.getElementById('prenomModal');
  if(!m){ m=document.createElement('div'); m.className='finish'; m.id='prenomModal'; document.body.appendChild(m); }
  m.innerHTML='<div class="sm-box" style="max-width:340px;text-align:center">'+
    '<button class="sm-close" onclick="closePrenom()" aria-label="Fermer">✕</button>'+
    '<h2 style="margin:8px 0 2px">Ton nom</h2>'+
    '<p class="succ-desc" style="margin:8px 0 14px">La <b style="color:var(--gold2)">kunya</b> <span class="arw" style="font-size:16px">كُنْيَة</span> est le nom d’affection en islam : <span class="arw" style="font-size:16px">أمّ</span> ou <span class="arw" style="font-size:16px">أبو</span> suivi d’un prénom comme Umm Salama, Abū Bakr. Tu peux aussi tout simplement écrire ton prénom.</p>'+
    '<input id="prenomIn" type="text" maxlength="24" autocomplete="given-name" placeholder="Ton prénom ou ta kunya" value="'+escHTML(S.prenom||'')+'" style="width:100%;box-sizing:border-box;background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:12px;color:var(--cream);font-family:var(--ui);font-size:16px;text-align:center">'+
    '<button class="cbtn" style="margin-top:12px" onclick="savePrenom()">Enregistrer</button>'+
    '</div>';
  m.classList.add('on');
  var i=document.getElementById('prenomIn');
  if(i){ i.addEventListener('keydown',function(e){ if(e.key==='Enter')savePrenom(); });
         setTimeout(function(){ try{i.focus();}catch(_){}} ,80); }
}
function closePrenom(){ var m=document.getElementById('prenomModal'); if(m)m.classList.remove('on'); }
function savePrenom(){
  var i=document.getElementById('prenomIn');
  S.prenom=(i?i.value:'').trim(); save();   // save() → cloudSaveSoon() → upsert profiles.prenom
  closePrenom(); try{renderProg();}catch(_){}
}
function showObAccount(){
  var card=document.getElementById('obAccountCard'); if(card)card.innerHTML=cloudCardHTML();
  var q=document.getElementById('obQuote'); if(q)q.style.display='';
  var t=document.getElementById('obAccountTitle'); if(t)t.textContent=obAccTitle();
  document.getElementById('obAccount').classList.add('on');
}
function obAccountClose(){ var o=document.getElementById('obAccount'); o.classList.remove('on'); var c=document.getElementById('obAccountCard'); if(c)c.innerHTML=''; returnFromPlayer(); } // vider la carte : pas de #cloudEmail en double avec Progrès
function resetProgress(){ document.getElementById('confirmReset').classList.add('on'); }
function cancelReset(){ document.getElementById('confirmReset').classList.remove('on'); }
async function doReset(){
  /* ⛔ Décision de Myriam (17/09) : page (CLOUD.user, S._uid ou _uidVu), session du stockage et disque à deux
     comptes → rien d'effacé, aucune purge, rechargement. ⚠️ L'onclick n'attend pas : sans compte tout reste
     synchrone, et une session muette n'empêche pas l'effacement (inconnu n'est pas divergent). (journal : comptes.js · l'effacement refusé)
     ⚠️ La confirmation se ferme AVANT l'attente : ouverte pendant, ANNULER promettait une annulation qui n'annulait rien. */
  try{ document.getElementById('confirmReset').classList.remove('on'); }catch(e){}
  try{
    var page=function(){ var c=CLOUD.user&&CLOUD.user.id, p=S&&(S._uid||S._uidVu);
      return ((c&&p&&c!==p)||(SYNC.redemarre&&SYNC.redemarre())||(typeof SYNC.ailleurs==='function'&&SYNC.ailleurs()))?false:(c||p||null); };
    if(page()===false){ location.reload(); return; }
    if(SB&&page()){
      var su=null;
      try{ var g=await _avecGarde(SB.auth.getSession(),1500,'session avant effacement');
           su=g&&g.data&&g.data.session&&g.data.session.user; }catch(e){}
      var id=page();
      if(id===false||(su&&su.id!==id)){ location.reload(); return; }
    }
  }catch(e){}
  /* En première ligne de l'effacement, l'ordre est tout le sujet : les entrées en attente décrivent la
     progression qu'on efface. SYNC.reset() vide la file, pose l'intention de purge distante et annonce
     la réaffectation de S qui suit, pour
     que le garde du diff ne la prenne pas pour une réaffectation inconnue. */
  try{ SYNC.reset(); }catch(e){}
  try{localStorage.removeItem('alaq2');}catch(e){}
  /* Le tampon _refonte survit à l'effacement : il décrit ce que cet appareil sait du serveur, pas la
     progression. Sans lui, un cloudPull joué avant la purge distante adopterait le blob du nuage et
     rendrait la progression effacée (journal : comptes.js · le tampon de refonte survit). */
  var _refonteAvant=+(S&&S._refonte)||0;
  var _uidAvant=S&&S._uid, _vuAvant=S&&S._uidVu;
  S=Object.assign({},DEF,{done:{},tests:{}});
  if(_refonteAvant)S._refonte=_refonteAvant;
  /* L'état neuf appartient à l'élève connectée, on le dit (_uid) : DEF ne le porte pas, et sans lui la
     purge distante ne partait jamais et le nuage rendait la progression effacée
     (journal : comptes.js · l'effacement rendait la progression). ⚠️ Jamais si l'état effacé était
     celui d'un AUTRE compte : il ne devient pas le sien. ⚠️ Sans session (hors ligne, SB nul), il garde
     son propriétaire : sans marque, la relance en ligne rendait les leçons effacées par la fenêtre de migration. */
  try{ if(typeof CLOUD!=='undefined'&&CLOUD&&CLOUD.user){ if(!_uidAvant||_uidAvant===CLOUD.user.id)S._uid=CLOUD.user.id; }
       else if(_uidAvant)S._uid=_uidAvant; else if(_vuAvant)S._uidVu=_vuAvant; }catch(e){}
  save();
  renderHome();
}

/* Reset réservé enseignant : appui long (2 s) sur le logo ALAQ en haut à gauche */
(function(){
  const b=document.getElementById('brand');if(!b)return;
  let t=null;
  const startp=()=>{ clearTimeout(t); t=setTimeout(()=>{t=null;resetProgress();},2000); };
  const stop=()=>{ if(t){clearTimeout(t);t=null;} };
  b.addEventListener('touchstart',startp,{passive:true});
  b.addEventListener('touchend',stop);b.addEventListener('touchmove',stop);
  b.addEventListener('mousedown',startp);
  b.addEventListener('mouseup',stop);b.addEventListener('mouseleave',stop);
})();
