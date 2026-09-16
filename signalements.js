/* ═══════════════════════════════════════════════════════════════════════════
   signalements.js — CE QUE L'APP RAPPORTE : le drapeau ⚑ que l'élève lève, et
   les tickets 🤖 qu'elle dépose toute seule (sous-lot 6 de la tâche Notion
   « extraire le lecteur d'exercices », sorti d'index.html le 16/09/2026 —
   15 instructions de premier niveau copiées À L'IDENTIQUE par l'arbre du
   fichier, jamais par un marqueur de texte).
   ───────────────────────────────────────────────────────────────────────────
   CE QU'IL PORTE — deux frères, une seule destination : le pupitre de Myriam.
   · ⚑ LE DRAPEAU (08/08) : _sigMotif, sigOuvrir/sigFermer/sigChoisir,
     sigEcran (où l'élève se trouve — CAPTURÉ, jamais demandé), sigEnvoyer,
     sigPoster, et la file `alaq_sigq` qui repart au lancement suivant.
     L'élève coche un motif ; l'app joint le reste. Jamais rien à décrire.
   · 🤖 LES TICKETS (31/08) : _tikJournal (la traîne des ~30 derniers
     événements), tikNote, tikEnvoyer, tikPoster, la file `alaq_tikq`, et LES
     DEUX CAPTEURS — `error` en phase de CAPTURE (une image ou un son mort ne
     remonte pas en bulle) et `unhandledrejection`.

   ═══ POURQUOI UN SCRIPT CLASSIQUE, ET PAS UN MODULE — MESURÉ, PAS SUPPOSÉ ═══
   ① NEUF GESTES EN LIGNE DU HTML STATIQUE l'appellent : le ⚑ du bandeau bas
      (index.html:97), le voile (332), les six motifs (335-340) et ENVOYER (342).
      Ce HTML est peint AVANT le premier script ; un module, différé et fetché à
      part, ouvrirait une fenêtre où le doigt trouve un bouton mort — la classe
      de risque que `lecteurPret()` a dû fermer le 14/09.
   ② `progression.js` — chargé plus HAUT — appelle `tikEnvoyer` à quatre endroits
      (sous garde `typeof`, donc muet si le nom manque : la panne serait
      SILENCIEUSE), et src/player/ appelle `tikNote(sigEcran())` à chaque écran.
   ③ `_sigMotif` est RÉASSIGNÉ (sigChoisir/sigOuvrir) et `_tikJournal` est mué :
      un module les publierait par COPIE — la règle du 15/09, payée par _sndGen.

   ═══ ET CE QUE LA PLACE DE CE FICHIER RÉPARE (16/09) ══════════════════════
   Les deux capteurs s'installaient à la ligne 1324 du grand script : ils étaient
   donc AVEUGLES à ses 874 premières lignes, et surtout à une erreur qui tuerait
   le grand script AVANT l'accueil — la panne « page blanche », celle qu'on ne
   voit jamais et qui ne laisse aucune trace.
   ⚠️ CE FICHIER EST DONC POSÉ LE PLUS TÔT POSSIBLE : juste SOUS progression.js, et pas
   plus haut — ses deux files de réessai appellent sigPoster/tikPoster, qui lisent SUPA_URL
   et SUPA_ANON, déclarées là. Il couvre ainsi parcours.js, les quatre ui/, revision.js et
   tout le grand script. La revue adversariale du 16/09 l'a mesuré : posé sous revision.js,
   il laissait 508 Ko de scripts classiques hors de portée — dont revision.js, sorti le
   matin même.
   ⚠️ POUR QUE CE GAIN SOIT RÉEL, DEUX CARACTÈRES ONT CHANGÉ — les seuls du lot.
   `sigEnvoyer` et `tikEnvoyer` lisaient `BUILD`, une `const` déclarée au milieu
   du grand script (index.html) : une erreur survenue AVANT cette ligne la
   trouvait en ZONE MORTE TEMPORELLE, la ReferenceError était avalée par le
   try/catch, et le ticket ne partait pas — un capteur vert qui ne rapporte rien.
   Ils lisent désormais `window.BUILD` (posée à la même ligne, mais une simple
   propriété : `undefined` avant, jamais une exception), avec un repli '?'.
   Le banc outils/verifier-constance.mjs l'éprouve : une erreur tirée avant que
   BUILD n'existe doit produire un ticket, pas un silence.

   ═══ CE QU'IL RÉSOUT CHEZ LES AUTRES, ET QUAND ═══════════════════════════
   AU CHARGEMENT (les deux files de purge) : SUPA_URL, SUPA_ANON (progression.js,
   chargé plus haut) et localStorage — rien d'autre, et rien du grand script.
   À L'APPEL seulement — 10 noms, et cette liste EST le contrat, mesurée par le banc :
   CLOUD, SUPA_URL, SUPA_ANON (progression.js) · UNITS (donnees.js) · toast et l'état
   du joueur que sigEcran lit sous try/catch — REVIEW, QUEUE, qi, curU, curD
   (index.html) — plus window.BUILD, posée par index.html au milieu du grand script.
   ⛔ NI `defer`, NI `type="module"`, ni `import`, ni `export`.

   GARDES : outils/verifier-constance.mjs (bac node:vm, les deux files, la
   signature par jour, le refus du poste de développement, le ticket qui part
   même sans BUILD), previews/_verif_constance.html (la vraie page, source et
   dist : le ⚑ ouvert au doigt, un motif coché, l'envoi), garderLaConstance()
   dans vite.config.mjs, CORE de sw.js, hors-ligne, paquet natif.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ===== ⚑ Signalements (08/08) — le drapeau du bandeau bas =====
   L'élève coche un motif, l'app capture TOUT le contexte (écran, build, appareil,
   compte) : jamais rien à décrire. Dépôt en clé publique — la RLS de la table
   n'autorise que l'insertion bornée (outils/installer-signalements.sql).
   Hors ligne ou table absente : la file alaq_sigq réessaie au prochain lancement. */
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

/* ===== 🤖 Tickets automatiques (31/08) — ce que l'app détecte toute seule =====
   Le frère du drapeau ⚑ : ici PERSONNE ne coche rien — l'app capture ses propres
   pannes (erreur JS, promesse orpheline, image morte, service worker refusé) et
   les dépose dans la table `tickets` (outils/installer-tickets.sql), avec un
   JOURNAL DE BORD : la traîne des ~30 derniers événements (écrans, sons, pannes),
   celle qui avait percé le mystère du faux « Mehdi » le 08/08.
   ⚠️ PAS de ticket « son absent » en v1, et c'est un CHOIX : l'app essaie
   VOLONTAIREMENT plusieurs fichiers pour un même son (variante de voix, puis nom
   plat) — le premier 404 est un fonctionnement normal, pas une panne. Un capteur
   global inonderait le pupitre de faux tickets (le même refus que Myriam a posé
   pour « écran bloqué », 31/08). Les erreurs audio vont donc au JOURNAL seulement.
   ⚠️ L'AVALANCHE EST BARRÉE À DEUX ÉTAGES : une même signature (type + message
   normalisé + écran) ne part qu'UNE fois par jour et par appareil (localStorage) ;
   et le pupitre groupe par signature. Jamais d'UPDATE anonyme — la RLS n'accorde
   que l'INSERT borné, comme pour les signalements. */
let _tikJournal=[];
function tikNote(ev){ // une ligne de la traîne — jamais bloquant, jamais d'exception
  try{
    _tikJournal.push({t:new Date().toISOString().slice(11,19),e:String(ev).slice(0,140)});
    if(_tikJournal.length>30)_tikJournal.shift();
  }catch(e){}
}
function tikEnvoyer(type,msg){
  try{
    /* 🔴 08/09 — LE PUPITRE SE REMPLISSAIT DE NOTRE PROPRE BRUIT. 45 des 56 tickets
       étaient des « image morte » portant des chemins de FICHIERS LOCAUX
       (dist/icon-192.png, alaq-vercel-static/icon-512.png) : ils venaient d'une
       session de travail sur le port 5600 ou d'un harnais, jamais d'une élève.
       ⚠️ Le coût n'est pas le désordre, c'est la NOYADE : le ticket qui a révélé le
       crash de S.revGram était seul au milieu de 45 faux. Un pupitre bruyant est un
       pupitre qu'on cesse de lire. Le poste de développement se tait donc à la
       source — jamais l'app en ligne, dont le nom d'hôte est app.alaq.fr. */
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
/* — les capteurs — `capture:true` est indispensable : une erreur de RESSOURCE
   (img, audio) ne remonte pas en bulle, elle ne se voit qu'en phase de capture. */
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
