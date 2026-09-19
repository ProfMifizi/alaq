/* ═══════════════════════════════════════════════════════════════════════════
   signalements.js — ce que l'app rapporte au pupitre de Myriam.
   · ⚑ le drapeau : _sigMotif, sigOuvrir/sigFermer/sigChoisir, sigEcran (où l'élève se
     trouve, capturé, jamais demandé), sigEnvoyer, sigPoster, et la file alaq_sigq.
   · 🤖 les tickets : _tikJournal (la traîne des ~30 derniers événements), tikNote,
     tikEnvoyer, tikPoster, la file alaq_tikq, et les deux capteurs (error en phase de
     capture, unhandledrejection).

   Script classique, pas un module :
   ① le HTML statique (squelette.js, posé avant tout script qui le lit) l'appelle en ligne (le ⚑, le voile, les
      six motifs, ENVOYER) : un module différé laisserait un bouton mort ;
   ② progression.js, chargé plus haut, appelle tikEnvoyer sous garde typeof (une panne
      serait muette), et src/player appelle tikNote et sigEcran à chaque écran ;
   ③ _sigMotif est réassigné et _tikJournal muté : un module les publierait par copie.
   ⚠️ Posé juste sous progression.js : le plus tôt possible, pour que les capteurs voient
   les scripts suivants et tout le grand script ; pas plus haut, car les files de réessai
   lisent SUPA_URL et SUPA_ANON (journal : signalements.js · en-tête d'origine).
   ⚠️ sigEnvoyer et tikEnvoyer lisent window.BUILD, jamais BUILD nu : une erreur levée
   avant la déclaration de BUILD la trouverait en zone morte temporelle, et le ticket
   ne partirait pas.

   AU CHARGEMENT (les deux files de purge) : SUPA_URL, SUPA_ANON (progression.js) et
   localStorage — rien du grand script.
   À L'APPEL seulement :
   CLOUD, SUPA_URL, SUPA_ANON (progression.js) · UNITS (donnees.js) · toast et l'état
   du joueur que sigEcran lit sous try/catch — REVIEW, QUEUE, qi, curU, curD
   (index.html) — plus window.BUILD, posée par index.html au milieu du grand script.
   ⛔ Ni defer, ni type="module", ni import, ni export.

   Gardes : outils/verifier-constance.mjs (les deux files, la signature par jour, le
   refus de localhost, le ticket sans BUILD), previews/_verif_constance.html,
   garderLaConstance() dans vite.config.mjs.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═══ ⚑ Signalements — l'élève coche un motif, l'app joint le contexte (écran, build,
   appareil, compte). La RLS n'autorise que l'insertion bornée
   (outils/installer-signalements.sql) ; hors ligne, la file alaq_sigq réessaie au
   lancement suivant. */
let _sigMotif=null;
function sigOuvrir(){
  _sigMotif=null;
  document.querySelectorAll('#sigSheet .sig-opt').forEach(o=>o.classList.remove('sel'));
  const t=document.getElementById('sigTxt');t.value='';t.classList.remove('on');
  document.getElementById('sigEnv').disabled=true;
  document.getElementById('sigVoile').classList.add('on');
  document.getElementById('sigSheet').classList.add('on');
}
function sigFermer(){
  document.getElementById('sigVoile').classList.remove('on');
  document.getElementById('sigSheet').classList.remove('on');
}
function sigChoisir(b){
  document.querySelectorAll('#sigSheet .sig-opt').forEach(o=>o.classList.remove('sel'));
  b.classList.add('sel');_sigMotif=b.dataset.motif;
  document.getElementById('sigTxt').classList.toggle('on',!!b.dataset.libre);
  document.getElementById('sigEnv').disabled=false;
}
function sigEcran(){ // où l'élève se trouve — capturé, jamais demandé
  try{
    if(REVIEW)return 'révision · écran '+(qi+1)+(QUEUE[qi]&&QUEUE[qi].type?' · '+QUEUE[qi].type:'');
    const st=QUEUE[qi];
    return 'U'+((UNITS[curU]&&UNITS[curU].no)||curU+1)+'-D'+(curD+1)+'-E'+(qi+1)+(st&&st.type?' · '+st.type:' · quiz');
  }catch(e){return '?';}
}
function sigEnvoyer(){
  if(!_sigMotif)return;
  const s={motif:_sigMotif,
    detail:(document.getElementById('sigTxt').value||'').trim().slice(0,600)||null,
    ecran:sigEcran(),build:(window.BUILD||'?'),
    appareil:(navigator.userAgent||'').slice(0,300),
    email:(CLOUD.user&&CLOUD.user.email)||null};
  sigFermer();toast('Merci ! Signalement envoyé');
  sigPoster(s).catch(()=>{
    try{const q=JSON.parse(localStorage.getItem('alaq_sigq')||'[]');q.push(s);
        localStorage.setItem('alaq_sigq',JSON.stringify(q.slice(-20)));}catch(e){}
  });
}
function sigPoster(s){
  return fetch(SUPA_URL+'/rest/v1/signalements',{method:'POST',
    headers:{apikey:SUPA_ANON,Authorization:'Bearer '+SUPA_ANON,'Content-Type':'application/json',Prefer:'return=minimal'},
    body:JSON.stringify(s)}).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);});
}
(function sigPurgerQueue(){ // les signalements restés à quai repartent au lancement
  try{
    const q=JSON.parse(localStorage.getItem('alaq_sigq')||'[]');
    if(!q.length)return;
    localStorage.removeItem('alaq_sigq');
    q.forEach(s=>sigPoster(s).catch(()=>{
      try{const r=JSON.parse(localStorage.getItem('alaq_sigq')||'[]');r.push(s);
          localStorage.setItem('alaq_sigq',JSON.stringify(r.slice(-20)));}catch(e){}
    }));
  }catch(e){}
})();

/* ═══ 🤖 Tickets automatiques — l'app dépose ses propres pannes dans la table tickets
   (outils/installer-tickets.sql), avec la traîne des ~30 derniers événements
   (journal : signalements.js · les tickets automatiques).
   ⚠️ Pas de ticket « son absent » : les erreurs audio vont à la traîne seulement. Un son
   absent est un silence voulu, que le portillon détecte (outils/verifier-son.mjs) ; un
   capteur global noierait le pupitre.
   ⚠️ Anti-avalanche : une même signature (type + message normalisé + écran) ne part
   qu'une fois par jour et par appareil. Jamais d'UPDATE anonyme : la RLS n'accorde que
   l'INSERT borné. */
let _tikJournal=[];
function tikNote(ev){ // une ligne de la traîne — jamais bloquant, jamais d'exception
  try{
    _tikJournal.push({t:new Date().toISOString().slice(11,19),e:String(ev).slice(0,140)});
    if(_tikJournal.length>30)_tikJournal.shift();
  }catch(e){}
}
function tikEnvoyer(type,msg){
  try{
    /* ⚠️ Le poste de développement se tait à la source : ses faux tickets noyaient les
       vrais (journal : signalements.js · le pupitre noyé par le poste de développement). */
    const h=(location&&location.hostname)||'';
    if(!h||h==='localhost'||h==='127.0.0.1'||h==='[::1]'||h==='::1')return;
    const sig=(type+'|'+String(msg||'').replace(/\d+/g,'N').slice(0,80)+'|'+sigEcran()).slice(0,160);
    const cle='alaq_tik_'+sig, jour=new Date().toISOString().slice(0,10);
    try{ if(localStorage.getItem(cle)===jour)return; localStorage.setItem(cle,jour); }catch(e){}
    const t={signature:sig,type:type,message:String(msg||'').slice(0,600),
      ecran:sigEcran(),build:(window.BUILD||'?'),
      appareil:(navigator.userAgent||'').slice(0,300),
      email:(CLOUD.user&&CLOUD.user.email)||null,
      journal:_tikJournal.slice(-30)};
    tikPoster(t).catch(()=>{
      try{const q=JSON.parse(localStorage.getItem('alaq_tikq')||'[]');q.push(t);
          localStorage.setItem('alaq_tikq',JSON.stringify(q.slice(-10)));}catch(e){}
    });
  }catch(e){}
}
function tikPoster(t){
  return fetch(SUPA_URL+'/rest/v1/tickets',{method:'POST',
    headers:{apikey:SUPA_ANON,Authorization:'Bearer '+SUPA_ANON,'Content-Type':'application/json',Prefer:'return=minimal'},
    body:JSON.stringify(t)}).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);});
}
(function tikPurgerQueue(){ // les tickets restés à quai repartent au lancement
  try{
    const q=JSON.parse(localStorage.getItem('alaq_tikq')||'[]');
    if(!q.length)return;
    localStorage.removeItem('alaq_tikq');
    q.forEach(t=>tikPoster(t).catch(()=>{
      try{const r=JSON.parse(localStorage.getItem('alaq_tikq')||'[]');r.push(t);
          localStorage.setItem('alaq_tikq',JSON.stringify(r.slice(-10)));}catch(e){}
    }));
  }catch(e){}
})();
/* Les capteurs — capture:true est indispensable : une erreur de RESSOURCE (img, audio)
   ne remonte pas en bulle. */
window.addEventListener('error',function(e){
  try{
    if(e&&e.target&&e.target!==window&&e.target.tagName){
      const tg=e.target.tagName,src=(e.target.currentSrc||e.target.src||'');
      const nom=src.split('/').slice(-2).join('/');
      if(tg==='IMG'){ tikNote('image ✕ '+nom); tikEnvoyer('image-morte',nom); }
      else if(tg==='AUDIO'||tg==='SOURCE'){ tikNote('son ✕ '+src.split('/').pop()); }
      return;
    }
    tikNote('js ✕ '+String(e.message||'').slice(0,80));
    tikEnvoyer('js-error',(e.message||'?')+' @'+(String(e.filename||'').split('/').pop()||'?')+':'+(e.lineno||0));
  }catch(x){}
},true);
window.addEventListener('unhandledrejection',function(e){
  try{
    const m=(e&&e.reason&&(e.reason.message||String(e.reason)))||'?';
    tikNote('promesse ✕ '+m.slice(0,80));
    tikEnvoyer('promesse',m);
  }catch(x){}
});
