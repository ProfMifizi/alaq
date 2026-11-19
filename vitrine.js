/* vitrine.js — le mode vitrine (l'app montrée dans le téléphone dessiné de www.alaq.fr) et ses deux arrivées
   en plein écran (#bienvenue=<charge>, #retour). Décision de Myriam, 17/11/2026.

   LE MODE VITRINE ne s'allume que si : ?vitrine=1, ET la page est dans un cadre, ET le parent est permis
   (www.alaq.fr, alaq.fr, un aperçu Vercel du site, ou une adresse locale quand l'app est elle-même servie en local).
   Sinon ce fichier ne fait rien et window.__alaqVitrine n'existe pas.
   ⛔ En mode vitrine, RIEN de l'app n'est lu ni écrit sur l'appareil : localStorage est remplacé par une mémoire
   vive, sauf les clés « sb-… » (la session du compte, seule à rester vraie). ⛔ Et rien ne monte au nuage : le
   client Supabase n'y garde que « auth » (ni from, ni rpc — par un piège sur window.supabase, doublé d'une ceinture
   sur SB), CLOUD.user n'est jamais posé, cloudInit n'est pas lancé.
   Si l'un des deux verrous ne se pose pas, le mode vitrine est REFUSÉ : l'app se comporte comme d'habitude.
   Le parent est prévenu par postMessage, toujours vers son origine, jamais vers « * » :
   { alaq:'vitrine', etat:'pret' } · { alaq:'vitrine', etat:'plein-ecran', vers:'#bienvenue=…' | '#retour' }.

   ⛔ Script CLASSIQUE, PREMIÈRE balise de la page, avant le bloc du thème (qui lit localStorage) : ni defer, ni
   module, ni import/export. AU CHARGEMENT il ne lit que location, document.referrer et window.parent.
   À L'APPEL seulement : S, save, SB, CLOUD, SYNC, _sessionLue, _avecGarde (progression.js) · onbStart, obLoginOpen
   (comptes.js) · showTab (ui/navigation.js) · ONB, obAccountPending, currentLesson, lecteurPret, toast (coque.js)
   · startDisque, renderStep (src/player).
   Qui l'appelle : la fin de coque.js (vitrineArrivee) ; comptes.js, trois fois, par window.__alaqVitrine
   (lecon, compte, connectee) ; progression.js lit window.__alaqBienvenue juste après avoir chargé S.
   Gardes : outils/verifier-vitrine.mjs, previews/_verif_vitrine.html, garderLaVitrine() (vite.config.mjs), CORE de sw.js. */

(function(){
  var W=window;
  function local(h){ return h==='localhost'||h==='127.0.0.1'||/^192\.168\.\d{1,3}\.\d{1,3}$/.test(h); }
  /* l'origine du parent : dite par le navigateur (ancestorOrigins), sinon par l'adresse qui a chargé le cadre */
  function origineDuParent(){
    try{ var a=location.ancestorOrigins; if(a&&a.length)return String(a[0]); }catch(e){}
    try{ if(document.referrer)return new URL(document.referrer).origin; }catch(e){}
    return '';
  }
  function parentPermis(o){
    if(o==='https://www.alaq.fr'||o==='https://alaq.fr')return true;
    if(/^https:\/\/alaq-site-[a-z0-9-]+-myriam-alaq\.vercel\.app$/.test(o))return true;
    try{ var u=new URL(o); return (u.protocol==='http:'||u.protocol==='https:')&&local(u.hostname)&&local(location.hostname); }
    catch(e){ return false; }
  }

  /* ① LA MÉMOIRE VIVE. ⚠️ Lire window.localStorage peut lever (stockage refusé dans un cadre d'un autre site) :
     tout part alors en mémoire, la session comprise. Rend true seulement si le remplacement est constaté. */
  function poserLaMemoireVive(){
    var vrai=null, P=null, G, E, R;
    try{ vrai=W.localStorage; P=W.Storage&&W.Storage.prototype; G=P.getItem; E=P.setItem; R=P.removeItem; }catch(e){ vrai=null; }
    var mem=Object.create(null);
    function vraie(k){ return !!vrai&&k.indexOf('sb-')===0; }   /* la session du compte : la seule clé qui reste vraie */
    var faux={
      getItem:function(k){ k=String(k); return vraie(k)?G.call(vrai,k):(k in mem?mem[k]:null); },
      setItem:function(k,v){ k=String(k); if(vraie(k))E.call(vrai,k,String(v)); else mem[k]=String(v); },
      removeItem:function(k){ k=String(k); if(vraie(k))R.call(vrai,k); else delete mem[k]; },
      clear:function(){ mem=Object.create(null); },
      key:function(i){ var ks=Object.keys(mem); return i<ks.length?ks[i]:null; }
    };
    Object.defineProperty(faux,'length',{get:function(){ return Object.keys(mem).length; }});
    try{ Object.defineProperty(W,'localStorage',{configurable:true,enumerable:true,get:function(){ return faux; }}); }catch(e){}
    try{ if(W.localStorage===faux)return true; }catch(e){}
    /* repli : le navigateur refuse de remplacer localStorage — ses méthodes passent alors par la mémoire vive */
    try{
      if(!vrai||!P)return false;
      var KEY=P.key, CLR=P.clear;
      P.getItem=function(k){ return this===vrai?faux.getItem(k):G.call(this,k); };
      P.setItem=function(k,v){ return this===vrai?faux.setItem(k,v):E.call(this,k,v); };
      P.removeItem=function(k){ return this===vrai?faux.removeItem(k):R.call(this,k); };
      P.clear=function(){ return this===vrai?faux.clear():CLR.call(this); };
      P.key=function(i){ return this===vrai?faux.key(i):KEY.call(this,i); };
      return P.setItem!==E&&P.getItem!==G&&P.removeItem!==R;
    }catch(e){ return false; }
  }

  /* ② LE CLIENT SANS DONNÉES. Le bundle supabase-js (defer) pose window.supabase après ce script : on le reçoit, et
     createClient ne rend que « auth ». Sans from ni rpc, aucun état ne peut monter, quoi que fasse le reste de l'app. */
  function poserLeClientSansDonnees(){
    var vrai, vu;
    try{ vrai=W.supabase; }catch(e){}
    function facade(){
      if(!vrai)return undefined;
      if(!vu||vu.de!==vrai)vu={de:vrai,createClient:function(){ var c=vrai.createClient.apply(vrai,arguments); return {auth:c.auth}; }};
      return vu;
    }
    try{
      Object.defineProperty(W,'supabase',{configurable:true,enumerable:true,get:facade,set:function(v){ vrai=v; }});
      var d=Object.getOwnPropertyDescriptor(W,'supabase');
      return !!d&&d.get===facade;
    }catch(e){ return false; }
  }

  /* la charge de #bienvenue : le prénom et les quatre réponses, en JSON, en base64url (ni « / » ni « + » ni « = ») */
  function court(x,n){ return String(x==null?'':x).slice(0,n); }
  function coder(o){
    var b=new TextEncoder().encode(JSON.stringify(o)), s='';
    for(var i=0;i<b.length;i++)s+=String.fromCharCode(b[i]);
    return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  /* rend { prenom, onb } ou null : une charge illisible, mal formée ou trop longue ne vaut rien */
  function lire(t){
    try{
      if(typeof t!=='string'||!/^[A-Za-z0-9_-]{2,1900}$/.test(t))return null;
      var s=atob(t.replace(/-/g,'+').replace(/_/g,'/')), b=new Uint8Array(s.length);
      for(var i=0;i<s.length;i++)b[i]=s.charCodeAt(i);
      var o=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(b));
      if(!o||typeof o!=='object'||Array.isArray(o))return null;
      var txt=function(x){ return x==null||typeof x==='string'; };
      if(!txt(o.p)||!txt(o.s)||!txt(o.n)||!txt(o.o))return null;
      if(o.i!=null&&!(Array.isArray(o.i)&&o.i.length<=12&&o.i.every(function(x){ return typeof x==='string'; })))return null;
      return { prenom:court(o.p,60).trim(),
               onb:{ source:court(o.s,60), intention:(o.i||[]).map(function(x){ return court(x,60); }), niveau:court(o.n,60), objectif:court(o.o,4) } };
    }catch(e){ return null; }
  }
  W.__alaqCharge={coder:coder,lire:lire};

  var seule=false, cadre=false;
  try{ seule=(W.parent===W); cadre=!!W.parent&&W.parent!==W; }catch(e){}

  /* #bienvenue en plein écran : la charge est lue AVANT progression.js, qui décide si l'appareil repart de zéro */
  try{ if(seule&&location.hash.indexOf('#bienvenue=')===0){ var bv=lire(location.hash.slice(11)); if(bv)W.__alaqBienvenue=bv; } }catch(e){}

  var demande=false;
  try{ demande=cadre&&/(^|[?&])vitrine=1(&|$)/.test(location.search); }catch(e){}
  if(!demande)return;
  var origine=origineDuParent();
  if(!parentPermis(origine))return;
  if(!poserLaMemoireVive()||!poserLeClientSansDonnees())return;   /* un verrou manque : pas de mode vitrine */

  /* le cadre ne lit aucune arrivée (#connexion, #bienvenue…) et ne montre aucune barre de défilement (on défile au doigt) */
  try{ if(location.hash)history.replaceState(null,'',location.pathname+location.search); }catch(e){}
  try{
    document.documentElement.classList.add('vitrine');
    var st=document.createElement('style');
    st.textContent='html.vitrine,html.vitrine *{scrollbar-width:none!important;-ms-overflow-style:none!important}'
      +'html.vitrine::-webkit-scrollbar,html.vitrine *::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}';
    document.head.appendChild(st);
  }catch(e){}

  var domPret=false;
  try{ document.addEventListener('DOMContentLoaded',function(){ domPret=true; }); }catch(e){ domPret=true; }
  function dire(etat,vers){
    var m={alaq:'vitrine',etat:etat}; if(vers)m.vers=vers;
    try{ W.parent.postMessage(m,origine); }catch(e){}
  }
  W.__alaqVitrine={
    origine:origine,
    dire:dire,
    /* la ceinture du verrou ② : si le client de la page porte encore from ou rpc (un navigateur où le piège posé sur
       window.supabase n'aurait pas pris), on ne lui laisse que « auth ». Appelée au démarrage du cadre et après la
       naissance du client (DOMContentLoaded, coque.js). */
    depouiller:function(){ try{ if(SB&&(SB.from||SB.rpc))SB={auth:SB.auth}; }catch(e){} },
    /* le bouton de l'étape 7 (onbLaunchLesson, comptes.js) : la leçon se jouera en plein écran */
    lecon:function(){
      var pi=document.getElementById('obPrenomOnb'), d=(typeof ONB!=='undefined'&&ONB&&ONB.data)||{};
      dire('plein-ecran','#bienvenue='+coder({p:court(pi&&pi.value,60).trim(),s:court(d.source,60),
        i:(Array.isArray(d.intention)?d.intention:[]).slice(0,12).map(function(x){ return court(x,60); }),n:court(d.niveau,60),o:court(d.objectif,4)}));
    },
    /* « J'ai déjà un compte » (onbExistingAccount, comptes.js) : une session vit déjà → plein écran ; sinon la connexion, dans le cadre */
    compte:function(){
      /* le client naît au DOMContentLoaded (coque.js) : un doigt plus rapide que lui attend, au lieu de lire « indisponible » */
      if(!SB&&!domPret){ document.addEventListener('DOMContentLoaded',function(){ setTimeout(function(){ W.__alaqVitrine.compte(); },0); }); return; }
      var ouvrir=function(){ try{ document.getElementById('onb').classList.remove('on'); obLoginOpen(); }catch(e){} };
      var lue=null; try{ if(SB)lue=_avecGarde(SB.auth.getSession(),1500,'session du cadre'); }catch(e){}
      if(!lue){ ouvrir(); return; }
      lue.then(function(g){ if(g&&g.data&&g.data.session&&g.data.session.user)dire('plein-ecran','#retour'); else ouvrir(); },ouvrir);
    },
    /* le code est validé (cloudVerify, comptes.js) : la session est ouverte, le compte se charge en plein écran */
    connectee:function(){ dire('plein-ecran','#retour'); }
  };
})();

/* Appelée par la fin de coque.js, après #connexion et #u9. Rend true si elle a pris l'arrivée en charge ;
   false pour un démarrage ordinaire (rien n'est alors touché, sauf le hash d'une arrivée, nettoyé). */
function vitrineArrivee(){
  var W=window, nettoyer=function(){ try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){} };
  /* dans le cadre : toujours l'écran de bienvenue (onbStart, comptes.js), sans tutoriel, puis « pret » */
  if(W.__alaqVitrine){
    W.__alaqVitrine.depouiller();
    try{ document.addEventListener('DOMContentLoaded',W.__alaqVitrine.depouiller); }catch(e){}
    S.tutHome=1; S.tutLetters=1; S.tutVocab=1; S.tutCours=1;
    setTimeout(function(){ try{ onbStart(); W.__alaqVitrine.dire('pret'); }catch(e){} },120);
    return true;
  }
  var seule=false; try{ seule=(W.parent===W); }catch(e){}
  if(!seule)return false;
  var h=location.hash;

  /* #bienvenue=<charge> : progression.js a déjà remplacé l'état d'un appareil sans compte par un état neuf (neuf=1).
     On y pose le prénom et les réponses, et la première leçon part dès que le lecteur est là — comme
     onbLaunchLesson (comptes.js), sans délai fixe. Appareil avec compte ou charge illisible : démarrage ordinaire. */
  if(h.indexOf('#bienvenue=')===0){
    nettoyer();
    var b=W.__alaqBienvenue;
    if(!b||!b.neuf)return false;
    S.prenom=b.prenom;
    S.onb={source:b.onb.source,intention:b.onb.intention,niveau:b.onb.niveau,objectif:b.onb.objectif,ts:Date.now()};
    S.onboarded=1; S.tutHome=1; save();
    obAccountPending=!CLOUD.user;   /* le compte est proposé après cette première leçon */
    (function attendreLeLecteur(essai){
      if(typeof window.startDisque==='function'&&typeof window.renderStep==='function'){
        var L=(typeof currentLesson==='function'&&currentLesson())||{u:0,i:0};
        try{ startDisque(L.u,L.i); }catch(e){}
      } else if(essai<100){ setTimeout(function(){ attendreLeLecteur(essai+1); },50); }
      else{ try{ lecteurPret(); }catch(e){} }   /* le lecteur n'est pas venu : l'accueil reste, le message dit de recharger */
    })(0);
    return true;
  }

  /* #retour : l'élève vient de se connecter dans le cadre. Sur un appareil neuf (ni accueil fait, ni compte), le nuage
     fera foi, comme après « J'ai déjà un compte » (onbExistingAccount, comptes.js) ; un appareil déjà servi garde
     l'arbitrage ordinaire de cloudPull. On attend que cloudInit ait lu la session : accueil, ou écran de connexion. */
  if(h==='#retour'){
    nettoyer();
    var la=false; try{ la=SYNC.sessionPresente(); }catch(e){}
    if(la&&!S.onboarded&&!S._uid&&!S._uidVu){ S.onboarded=1; S.tutHome=1; S._fresh=1; save(); }
    var charge=false; try{ document.addEventListener('DOMContentLoaded',function(){ charge=true; }); }catch(e){ charge=true; }
    (function attendreLaSession(essai){
      try{
        if(CLOUD.user){ showTab('home'); toast('Bon retour'); return; }
        /* plus rien à attendre : pas de session gardée, session lue et refusée, pas de client, ou 8 s passées */
        if((!la&&charge)||_sessionLue||(charge&&!SB)||essai>=160){ obLoginOpen(); return; }
      }catch(e){ return; }
      setTimeout(function(){ attendreLaSession(essai+1); },50);
    })(0);
    return true;
  }
  return false;
}
