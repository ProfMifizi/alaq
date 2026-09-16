/* ═══════════════════════════════════════════════════════════════════════════
   constance.js — LA CONSTANCE ET SES RÉCOMPENSES : les rangs, les succès, les
   graines, l'objectif du jour, la série, le Ghufrān et le passage de minuit
   (sous-lot 6 de la tâche Notion « extraire le lecteur d'exercices », sorti
   d'index.html le 16/09/2026 — 56 instructions de premier niveau, 51 noms,
   copiées À L'IDENTIQUE par l'arbre du fichier, jamais par un marqueur de texte).
   ───────────────────────────────────────────────────────────────────────────
   CE QU'IL PORTE — tout ce qui mesure la régularité de l'élève et la récompense.
   Son vocabulaire est celui du code depuis le premier jour : S.consScore,
   S.consDay, S.consFlags, rollConstance, bumpConstance. D'où son nom.
   · LES RANGS (7 stations, النية → النور) : RANKS et leur barème
     (50 % constance · 30 % révision · 20 % apprentissage), rankFor,
     RANK_COLORS, lampSVG (la mishkât d'Āyat an-Nūr 24:35), updRankBadge (la
     lampe du bandeau), rankTrackHTML / rankBarHTML (le chemin des 7 points).
     ⚠️ Les MODALES du rang et des succès (showRank, rankInfo, showSucces) vivent
     dans ui/parametres.js depuis le 12/09, avec le Profil qui les ouvre.
   · LES SUCCÈS : BADGES (les 27 succès), SUCCES_DESC, ecussonHTML (l'écusson
     doré d'une sourate), confettiBurst, award, checkBadges.
   · LES GRAINES (la monnaie d'Alaq, verset 2:261) : GRAINES — 10 par leçon,
     +5 sans faute, +10 à l'objectif — et gagnerGraines. ⛔ Elles n'achètent
     JAMAIS de Qatarāt : racheter son erreur, c'est apprendre à payer pour se
     tromper.
   · L'OBJECTIF DU JOUR : objMinutes, objGoal, objAddSec (les minutes RÉELLES,
     lecteur ouvert et page visible), objFete, objRingHTML (l'anneau du Profil).
   · LA SÉRIE : today / yesterday / _dayNum / daysGap / _addDays (toute
     l'arithmétique des jours, en heure LOCALE — en UTC la journée basculait à
     02 h à Paris), validerJour (LE SEUL endroit qui touche S.streak) et son
     filet du 13/09, feteJourPending, et l'écran des 7 épis : showStreak,
     streakPrecharger / streakRecite / streakContinue et la récitation de 2:261.
   · LE GHUFRĀN غفران (2 par mois, jamais à vendre) : GHUF_MAX_JOURS,
     maybeGhufranPrompt, showGhufranInfo, closeGhufran, useGhufran, et la
     rétrogradation quand il n'y en a plus — ABSENCE_TAUX (15 %, MESURÉS),
     retrogradation, acceptMiss.
   · L'ÉCRAN DE FIN, ses trois cases : fillFinishConstance, ICO_COCHE_FIN /
     ICO_GRAIN_FIN / ICO_EPI_FIN, caseHTML, fillFinishCases.
   · LE PASSAGE DE MINUIT : majJour (la recharge quotidienne des Qatarāt), ses
     trois branchements (visibilitychange, focus, une minuterie d'une minute —
     sur iPhone l'app n'est jamais rechargée, elle est mise en veille), le
     rollConstance() du chargement et la migration unique vers les 7 vies.

   ═══ POURQUOI UN SCRIPT CLASSIQUE, ET PAS UN MODULE — MESURÉ, PAS SUPPOSÉ ═══
   ① UNE SEULE LIGNE TRANCHE, ET ELLE EST SANS GARDE. `refreshStats()`
      (ui/accueil.js) appelle `updRankBadge()` en clair, et le grand script
      l'appelle au premier niveau, avant `showTab('home')` (sa dernière ligne).
      Ce bloc différé, cette ligne lève ReferenceError et TOUT ce qui suit meurt
      dans le même souffle — l'accueil ne se peint jamais. Exactement la panne
      mesurée pour revision.js le 16/09, à la ligne près.
   ② `feteJourPending` EST RÉASSIGNÉE PAR UN MODULE. src/player/ écrit
      `pendingStreak=feteJourPending; feteJourPending=false;` et revision.js fait
      de même à la fin d'une séance. Un module ne partage pas une valeur, il la
      COPIE (règle du 15/09, payée par _sndGen, _tocCtx, _LN et _LNg) : la fête
      des 7 épis ne partirait plus jamais, en silence. Idem pour _streakA et
      _streakUrl, que streakPrecharger et streakRecite se passent de main en main.
   ③ `majJour()` RECHARGE LES QATARĀT ET ÉCRIT `#st-hearts` AVANT LE PREMIER
      RENDU. Différé, l'élève verrait d'abord le compte de la veille, puis un saut.
   ④ DEUX GESTES EN LIGNE DU HTML STATIQUE (index.html:287 et 291, peints avant
      le premier script) appellent streakRecite() et streakContinue() : un module,
      différé ET fetché à part, ouvre une fenêtre où le doigt trouve un bouton mort.

   ═══ CE QU'IL RÉSOUT CHEZ LES AUTRES, ET QUAND ═══════════════════════════
   AU CHARGEMENT — six instructions AGISSENT (majJour(), ses deux écouteurs, la
   minuterie, rollConstance(), la migration v7) et elles ne lisent QUE TROIS noms
   extérieurs, tous de progression.js : S, HEARTS_MAX, saveLocal — plus le DOM
   statique (#st-hearts, #p-hearts). ⛔ RIEN du grand script : le banc l'exige.
   À L'APPEL seulement — 24 noms, et cette liste EST le contrat, mesurée par le banc :
   S, HEARTS_MAX, save, saveLocal, unitValidated (progression.js) · UNITS (donnees.js)
   · spkSVG, spkOn, spkOff, stopAudio, playSfx, _curAudio, _sndGen (son.js)
   · icoImg, icoEcran (assets.js) · qariCur, qariUrlCdn (revision.js)
   · refreshStats (ui/accueil.js) · renderProg (ui/parametres.js)
   · toast, fatihaPct, returnFromPlayer, obAccountPending, showObAccount (index.html).
   ⛔ NI `defer`, NI `type="module"`, ni `import`, ni `export`.

   ⚠️ ET LA PLACE DE CE FICHIER EST SOUS signalements.js, PAS AU-DESSUS : les
   deux capteurs d'erreur s'installent là-bas, et ils doivent être debout avant
   que la première ligne d'ici ne s'exécute — sinon une panne du roulement du
   jour (celle qui toucherait les Qatarāt de tout le monde) ne laisserait aucune
   trace. C'est l'ordre qu'index.html avait déjà, et on le garde.

   GARDES : outils/verifier-constance.mjs (103 essais, 8 mutants mordus — bac node:vm, une série jouée jour par
   jour, le Ghufrān, la rétrogradation, les graines, les succès, le passage de
   minuit), previews/_verif_constance.html (la vraie page, source et dist : la
   lampe du rang peinte, les Qatarāt à jour, l'écran des 7 épis ouvert au doigt,
   et la copie SANS ce fichier dont l'accueil ne se peint pas),
   garderLaConstance() dans vite.config.mjs, CORE de sw.js, hors-ligne, paquet
   natif, et outils/verifier-serie-assiduite.mjs (le filet du 13/09, qui lit
   désormais ce fichier-ci).
   ═══════════════════════════════════════════════════════════════════════════ */

function showStreak(){ // l'épi pousse du tas de terre (27/08) ; le chiffre reste le titre au-dessus
  var n=S.streak||1;
  /* l'animation ne se rejoue jamais toute seule (loop=1) : on force le redémarrage à
     chaque ouverture de l'écran, sans repasser par le réseau (même URL, servie par le sw). */
  var pl=document.querySelector('.streak-plant');
  if(pl){ var src=pl.getAttribute('src'); pl.src=''; pl.src=src; }
  document.getElementById('streakNum').textContent=n;
  document.getElementById('streakUnit').textContent=(n>1?'jours':'jour');
  var s=document.getElementById('streakSpk'); if(s&&!s.innerHTML)s.innerHTML=spkSVG();
  document.getElementById('streak').classList.add('on');
  streakPrecharger();
  /* 🔴 LA RÉCITATION PART TOUTE SEULE (Myriam, 01/09 : « l'écran d'assiduité avec
     l'épi : je veux que l'audio du coran se déclenche automatiquement »).
     ⚠️ CECI INVERSE UNE DÉCISION QUI ÉTAIT LA SIENNE, EN CONNAISSANCE DE
     CAUSE : le 11/08 la condition posée était l'inverse — « le verset 2:261
     fait 28 mots (~30 s) : trop long pour partir tout seul sur un écran de
     fête ». Sa raison du 01/09 l'emporte sur l'objection de durée, et c'est
     elle qu'il faut retenir : « ce sera une EXCEPTION. Je souhaite que ce
     verset soit entendu chaque jour pour qu'il soit mémorisé. »
     Autrement dit ces 30 s ne sont pas un coût à subir mais l'objet même de
     l'écran : la répétition quotidienne EST le moyen de mémorisation.
     ⛔ C'est une exception assumée, pas une règle : aucun autre écran de l'app
     ne doit se mettre à réciter tout seul au prétexte de celui-ci.
     Le haut-parleur RESTE : il coupe (streakRecite bascule), et il rejoue.
     ⚠️ APRÈS le préchargement, et dans un `setTimeout` : `streakPrecharger()`
     vient de poser un `new Audio` dont le `load()` n'a pas encore rendu la
     main, et l'écran n'est visible que depuis une image. Partir dans le même
     tour ferait jouer avant que la fête ne s'affiche.
     ⚠️ L'autoplay peut être REFUSÉ par le navigateur (aucun geste utilisateur
     sur cet écran) : `streakRecite` porte déjà son propre `catch` et laisse le
     haut-parleur en place. Un refus est donc silencieux, jamais bloquant. */
  setTimeout(function(){
    if(!document.getElementById('streak').classList.contains('on'))return; // écran déjà quitté
    try{ streakRecite(); }catch(e){}
  },420);
}
/* ⚠️ LE VERSET SE MET EN FILE À L'OUVERTURE, PAS AU CLIC (Myriam, 20/08 : « le son
   ne se déclenche pas immédiatement »). `streakRecite` créait son `new Audio` au
   moment du toucher : les ~30 s d'al-Baqara 261 commençaient alors seulement à
   descendre du CDN, et l'élève attendait devant un écran de fête.
   ⚠️ CE FICHIER N'EST PAS MIS EN CACHE : le service worker laisse passer les
   requêtes Range (sans quoi la récitation est muette sur Safari — panne du 10/08),
   donc il retéléchargerait à CHAQUE fois. Le préchargement est le seul levier.
   ⚠️ ON GARDE L'URL AVEC L'ÉLÉMENT : le récitateur peut changer entre deux écrans,
   et rejouer l'ancienne voix serait pire qu'un délai. */
let _streakA=null, _streakUrl='';
function streakPrecharger(){
  try{
    const url=qariUrlCdn(qariCur(),268);
    if(_streakA&&_streakUrl===url)return;
    _streakA=new Audio(); _streakA.preload='auto'; _streakA.src=url; _streakUrl=url;
    try{_streakA.load();}catch(e){}
  }catch(e){ _streakA=null; _streakUrl=''; }
}
/* La récitation du verset 2:261 — demandée par Myriam le 14/08.
   Le verset est joué par la voix CHOISIE par l'élève : la Fātiḥa compte 7 versets, donc
   Al-Baqara 261 porte le numéro 268 dans le mushaf continu. ⚠️ Ce fichier-là n'est PAS
   hébergé chez nous (`qariUrl` ne sert en local que les 7 versets de la Fātiḥa) : il passe
   par le flux, donc il demande une connexion. On le dit au lieu de rester muet. */
function streakRecite(){
  var b=document.getElementById('streakSpk');
  if(_curAudio&&!_curAudio.paused){ stopAudio(); spkOff(b&&b.querySelector('.spk')); return; }
  stopAudio();
  var url=qariUrlCdn(qariCur(),268);
  /* on reprend l'élément préchargé s'il porte LA MÊME voix, sinon on en fait un */
  var a=(_streakA&&_streakUrl===url)?_streakA:new Audio(url);
  try{ a.currentTime=0; }catch(e){}
  var gen=_sndGen; _curAudio=a;
  spkOn(b&&b.querySelector('.spk'));
  var fin=function(){ if(gen===_sndGen)spkOff(b&&b.querySelector('.spk')); };
  a.addEventListener('ended',fin,{once:true});
  a.addEventListener('error',function(){ fin(); toast('Récitation indisponible sans connexion'); },{once:true});
  var p=a.play(); if(p&&p.catch)p.catch(function(){ fin(); toast('Récitation indisponible sans connexion'); });
}
function streakContinue(){
  stopAudio();
  document.getElementById('streak').classList.remove('on');
  if(obAccountPending){ obAccountPending=false; showObAccount(); return; }
  returnFromPlayer();
}

/* ===== Badges & confettis ===== */
const BADGES=[
 // les premières fois — une pousse, trois métaux
 ['disque1','\u{1F331}','Première leçon terminée'],
 ['unite1','\u{1F331}','Première unité validée'],
 ['sourate1','\u{1F331}','Première sourate lisible'],
 // la perfection
 ['sansfaute','\u{1F48E}','Une leçon sans aucune erreur'],
 ['unite-sansfaute','\u2734\uFE0F','Une unité entière sans erreur'],
 // les leçons — chaque leçon est un pas vers Allah (bronze · argent · or · émeraude)
 ['lecons1','\u{1F949}','1 leçon terminée'],
 ['lecons2','\u{1F949}','2 leçons terminées'],
 ['lecons3','\u{1F949}','3 leçons terminées'],
 ['lecons10','\u{1F948}','10 leçons terminées'],
 ['lecons20','\u{1F948}','20 leçons terminées'],
 ['lecons50','\u{1F948}','50 leçons terminées'],
 ['lecons100','\u{1F947}','100 leçons terminées'],
 ['lecons200','\u{1F947}','200 leçons terminées'],
 ['lecons500','\u{1F947}','500 leçons terminées'],
 ['lecons1000','\u{1F48D}','1000 leçons terminées'],
 // l'assiduité — l'épi dans son pot
 ['serie3','\u{1F33E}','3 jours d\u2019affilée'],
 ['serie7','\u{1F33E}','7 jours d\u2019affilée'],
 ['serie30','\u{1F33E}','30 jours d\u2019affilée'],
 ['serie120','\u{1F33E}','120 jours d\u2019affilée'],
 ['serie360','\u{1F33E}','360 jours d\u2019affilée'],
 // les révisions — le livre et sa pastille bleue
 ['revision','\u{1F4D6}','Première révision'],
 ['revision3','\u{1F4D6}','3 révisions'],
 ['revision7','\u{1F4D6}','7 révisions'],
 ['revision30','\u{1F4D6}','30 révisions'],
 ['revision50','\u{1F4D6}','50 révisions'],
 ['revision120','\u{1F4D6}','120 révisions'],
 ['revision360','\u{1F4D6}','360 révisions'],
];
/* Les écussons des sourates : UN gabarit doré, le nom composé par le code en Noto Naskh
   (Amiri retiré de l'app le 10/08). L'IA ne sait pas écrire l'arabe — jamais de nom généré. */
function ecussonHTML(ar,taille){
  taille=taille||64;
  return '<span class="ecu" style="width:'+taille+'px;height:'+taille+'px">'+
    '<img src="badges/ecusson-vierge.png" alt="">'+
    '<i style="font-size:'+Math.round(taille*0.165)+'px">'+ar+'</i></span>';
}
// Descriptions des succès (affichées dans le popup détail)
const SUCCES_DESC={
 disque1:'Tu as terminé ta toute première leçon. Le début du chemin, bismillah !',
 unite1:'Tu as validé ta première unité de la Fātiḥa.',
 sourate1:'Tu peux lire une sourate entière. Allāhumma bārik.',
 sansfaute:'Une leçon entière réussie sans la moindre faute.',
 'unite-sansfaute':'Toute une unité validée sans commettre d’erreur.',
 lecons1:'Une leçon terminée. Chaque leçon est un pas vers Allah.',
 lecons2:'Deux leçons derrière toi.',
 lecons3:'Trois leçons — la régularité s’installe.',
 lecons10:'Dix leçons terminées.',
 lecons20:'Vingt leçons terminées.',
 lecons50:'Cinquante leçons. Le chemin se dessine.',
 lecons100:'Cent leçons terminées, ma shā’ Allāh !',
 lecons200:'Deux cents leçons.',
 lecons500:'Cinq cents leçons — une assiduité rare.',
 lecons1000:'Mille leçons. Qu’Allah te préserve sur ce chemin.',
 serie3:'Tu es venue 3 jours de suite.',
 serie7:'Une semaine complète sans manquer un jour.',
 serie30:'Un mois entier de régularité.',
 serie120:'Cent vingt jours d’affilée.',
 serie360:'Une année de régularité, ou presque. Allāhumma bārik.',
 revision:'Tu as terminé ta première révision.',
 revision3:'Trois révisions terminées.',
 revision7:'Sept révisions — ta mémoire se renforce.',
 revision30:'Trente révisions. La sagesse de la constance.',
 revision50:'Cinquante révisions.',
 revision120:'Cent vingt révisions.',
 revision360:'Trois cent soixante révisions. Ce que tu sais ne s’effacera plus.',
};
function confettiBurst(){
  try{
    const cv=document.createElement('canvas');
    cv.style.cssText='position:fixed;inset:0;z-index:95;pointer-events:none';
    const dpr=window.devicePixelRatio||1;
    cv.width=innerWidth*dpr;cv.height=innerHeight*dpr;
    document.body.appendChild(cv);
    const ctx=cv.getContext('2d');ctx.scale(dpr,dpr);
    const cols=['#DC902E','#E8A94F','#F2E9DA','#6FB08A'];
    const P=[];for(let i=0;i<110;i++)P.push({
      x:innerWidth/2+(Math.random()-.5)*150, y:innerHeight*0.35,
      vx:(Math.random()-.5)*9, vy:-4-Math.random()*7,
      sz:4+Math.random()*5, c:cols[i%cols.length], r:Math.random()*Math.PI, vr:(Math.random()-.5)*.3});
    let t0=null;
    function fr(ts){
      if(t0===null)t0=ts;const el=(ts-t0)/1000;
      ctx.clearRect(0,0,innerWidth,innerHeight);
      P.forEach(q=>{
        q.x+=q.vx;q.y+=q.vy;q.vy+=0.22;q.r+=q.vr;
        ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.r);
        ctx.globalAlpha=Math.max(0,1-el/1.9);
        ctx.fillStyle=q.c;ctx.fillRect(-q.sz/2,-q.sz/2,q.sz,q.sz*0.6);ctx.restore();
      });
      if(el<1.9)requestAnimationFrame(fr);else cv.remove();
    }
    requestAnimationFrame(fr);
  }catch(e){}
}
function award(id){
  if(S.badges[id])return false;
  S.badges[id]=true;save();
  const b=BADGES.find(x=>x[0]===id);
  if(b){toast('🏅 Nouveau badge : '+b[1]+' '+b[2]);confettiBurst();}
  return true;
}
function checkBadges(ctx){
  ctx=ctx||{};
  const nLecons=Object.keys(S.done||{}).length;          // chaque leçon est un pas vers Allah
  [1,2,3,10,20,50,100,200,500,1000].forEach(function(n){ if(nLecons>=n)award('lecons'+n); });
  if(nLecons>=1)award('disque1');                        // pousse de bronze
  if(UNITS.some((U,i)=>unitValidated(i)))award('unite1'); // pousse d'argent
  if(ctx.noMistake)award('sansfaute');
  if(ctx.unitPerfect)award('unite-sansfaute');
  [3,7,30,120,360].forEach(function(j){ if((S.streak||0)>=j)award('serie'+j); });
  if(ctx.review||(S.nrev||0)>=1)award('revision');
  [3,7,30,50,120,360].forEach(function(n){ if((S.nrev||0)>=n)award('revision'+n); });
  if(fatihaPct()>=100)award('sourate1');                 // pousse d'or : la 1re sourate lisible
}

function _addDays(d,n){ return new Date((_dayNum(d)+n)*864e5).toISOString().slice(0,10); }

function today(){ // heure LOCALE (§2.1) : en UTC la journée basculait à 02 h à Paris — un mot révisé à 00 h 30 était daté de la veille
  const d=new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function yesterday(){ return _addDays(today(),-1); } // la veille DANS LE MÊME REPÈRE que today() (sinon la série casse entre 00 h et 02 h)

/* ===== Rang de constance : 50% constance · 30% révision · 20% apprentissage ===== */
const RANKS=[
 {ar:'النية',    tr:'An-Niyya',    fr:'l’intention', min:0,   desc:'Tout commence par l’intention. Tu t’es lancée sur le chemin — bismillah.'},
 {ar:'الهمّة',   tr:'Al-Himma',    fr:'l’élan',      min:10,  desc:'L’élan du cœur : l’envie sincère qui te met en mouvement.'},
 {ar:'الاجتهاد', tr:'Al-Ijtihād',  fr:'l’effort',    min:25,  desc:'L’effort régulier. Tu t’exerces, jour après jour.'},
 {ar:'المثابرة', tr:'Al-Muthābara',fr:'l’assiduité', min:50,  desc:'L’assiduité : tu reviens fidèlement, même un peu chaque jour.'},
 {ar:'الصبر',    tr:'Aṣ-Ṣabr',     fr:'la patience', min:100, desc:'La patience dans la durée, malgré la fatigue. On tient bon.'},
 {ar:'الاستقامة',tr:'Al-Istiqāma', fr:'la constance',min:200, desc:'La constance ancrée : la régularité est devenue une habitude.'},
 {ar:'النور',    tr:'An-Nūr',      fr:'la lumière',  min:300, desc:'La lumière : la lecture du Livre t’illumine. Garde cette station en restant constante — entretiens par la révision.'},
];
function rankFor(score){
  score=Math.max(0,score||0); var idx=0;
  for(var i=0;i<RANKS.length;i++){ if(score>=RANKS[i].min)idx=i; }
  var nx=RANKS[idx+1];
  var prog=nx?Math.max(0,Math.min(100,Math.round((score-RANKS[idx].min)/(nx.min-RANKS[idx].min)*100))):100;
  return {idx:idx, rank:RANKS[idx], next:nx, prog:prog};
}
/* La lampe (mishkât, Āyat an-Nūr 24:35) : l'icône du rang. Sa couleur suit les 7 stations,
   du gris de la pierre à la lumière — au 7e rang (النور) la lampe rayonne. Choix Myriam 05/07. */
const RANK_COLORS=['#ab9d8a','#c0673a','#c9973f','#c6d0da','#e5c25e','#f39b26','#fff0c2'];
/* 1 pierre chaude · 2 cuivre · 3 laiton · 4 argent · 5 or pâle · 6 or vif · 7 lumière (halo) */
function lampSVG(color,size){
  size=size||20;
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 32 32">'+
    '<rect x="13" y="2.5" width="6" height="2.6" rx="1.2" fill="'+color+'"/>'+
    '<path d="M16 6c-4.6 0-7.5 3.4-7.5 8.2 0 4 2.2 7 4.6 8.3h5.8c2.4-1.3 4.6-4.3 4.6-8.3C23.5 9.4 20.6 6 16 6z" fill="none" stroke="'+color+'" stroke-width="2.1"/>'+
    '<path d="M16 10.2c2 2.2 3 3.9 3 5.6a3 3 0 0 1-6 0c0-1.7 1-3.4 3-5.6z" fill="'+color+'"/>'+
    '<path d="M11.5 24.6h9l1 2.9h-11z" fill="'+color+'"/></svg>';
}
function updRankBadge(){
  try{
    var rf=rankFor(S.consScore), c=RANK_COLORS[rf.idx]||RANK_COLORS[0];
    var l=document.getElementById('st-lamp');
    if(l){ l.innerHTML=lampSVG(c,23); l.style.filter=rf.idx>=6?'drop-shadow(0 0 6px '+c+')':(rf.idx>=5?'drop-shadow(0 0 3px '+c+')':''); }
  }catch(e){}
}
function rankTrackHTML(){ // le tracé seul (points + remplissage) — réutilisable, imbriqué ou non
  var rf=rankFor(S.consScore), cur=rf.idx, dots='';
  for(var i=0;i<7;i++){
    var reached=(i<=cur), isCur=(i===cur), last=(i===6);
    var c=reached?RANK_COLORS[i]:'#4A403A';
    var sz=last?22:15; // le rang courant garde la MÊME taille que les autres : seule sa lumière le distingue (Myriam 13/07)
    var sh=isCur?';box-shadow:0 0 0 3px rgba(232,169,79,.3),0 0 14px 3px rgba(244,208,137,.75)':(last&&reached?';box-shadow:0 0 8px '+c:'');
    dots+='<i onclick="event.stopPropagation();rankInfo('+i+')" style="width:'+sz+'px;height:'+sz+'px;background:'+c+sh+'">'+((last&&!reached)?'☀️':'')+'</i>';
  }
  // La progression FINE (au sein du rang) est fondue dans le chemin des 7 rangs : le remplissage
  // avance en continu vers le prochain point — plus de petite barre ni de légende à part (Myriam 13/07).
  var fill=Math.min(100,Math.max(4,Math.round((cur+(rf.prog||0)/100)/6*100)));
  return '<div class="rbar-track"><div class="rbar-line"></div><div class="rbar-fill" style="width:'+fill+'%"></div><div class="rbar-dots">'+dots+'</div></div>';
}
function rankBarHTML(){ // le chemin des 7 rangs, النية → النور — avec son en-tête (écran de fin de leçon, fond sombre)
  return '<div class="rbar"><div class="rbar-head"><span>TA CONSTANCE</span><span>OBJECTIF : النور</span></div>'+rankTrackHTML()+'</div>';
}
function fillFinishConstance(){ // écran de fin fusionné : la barre des 7 rangs de constance
  var r=document.getElementById('fin-rank'); if(r)r.innerHTML=rankBarHTML();
  var v=document.getElementById('fin-verse'); if(v)v.innerHTML='';
}
/* ═══ LES TROIS CASES DE FIN — UN SEUL ÉCRAN POUR TOUT (Myriam, 14/08) ═══
   Elle a vu ces cases à la fin du vrai/faux et a tranché : « ce type d'écran devrait être
   celui de chaque fin de leçon ». Et pour le bilan d'unité : « je préfère avoir les trois
   petites box qui donnent le nombre de graines, le pourcentage de réussite et l'assiduité ».
   Ce sont donc les MÊMES trois partout — fin de leçon, bilan, révision (principe ⑨ : les
   écrans jumeaux partagent un moteur). Le grand pourcentage seul disparaît : il disait déjà
   ce que dit la case « Réussite », en prenant dix fois la place.
   L'ordre suit la lecture : ce que j'ai réussi · ce que j'ai gagné · depuis combien de temps
   je tiens. */
const ICO_COCHE_FIN='<svg viewBox="0 0 24 24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
const ICO_GRAIN_FIN='<svg viewBox="0 0 24 24" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V9"/><path d="M12 9c0-3 2-5 5-5 0 3-2 5-5 5z"/><path d="M12 13c0-3-2-5-5-5 0 3 2 5 5 5z"/><path d="M12 15c0-3 2-5 5-5 0 3-2 5-5 5z"/></svg>';
const ICO_EPI_FIN='<svg viewBox="0 0 24 24" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V8"/><path d="M12 8c0-2.6 1.6-4.6 4-5 0 2.6-1.6 4.6-4 5z"/><path d="M12 12c0-2.6-1.6-4.6-4-5 0 2.6 1.6 4.6 4 5z"/><path d="M12 16c0-2.6 1.6-4.6 4-5 0 2.6-1.6 4.6-4 5z"/><path d="M12 20c0-2.6-1.6-4.6-4-5 0 2.6 1.6 4.6 4 5z"/></svg>';
function caseHTML(cl,ic,lab,val){
  return '<div class="case '+cl+'"><div class="case-in">'+
    '<div class="ic">'+ic+'</div><div class="lab">'+lab+'</div><div class="val">'+val+'</div></div></div>';
}
function fillFinishCases(pct,graines){
  var e=document.getElementById('fin-cases'); if(!e)return;
  var j=S.streak||0;
  /* 🔴 07/09 — GAIN NUL : PAS DE BOÎTE (décision de Myriam). « Graines +0 » serait
     frustrant pour l'élève qui vient d'écouter un verset. La case ne se rend donc que
     s'il y a quelque chose à annoncer.
     ⚠️ La règle est GÉNÉRALE, pas réservée à la récitation : un examen raté (finishExam
     laisse `graines` à 0 quand l'unité n'est pas validée) n'affiche plus « +0 » non plus.
     C'est cohérent — on ne félicite pas d'un gain qui n'a pas eu lieu.
     ⚠️ La disposition tient à deux cases sans retouche CSS : `.cases` est un flex et
     `.case` porte `flex:1` (app.css:1342-1343), donc les deux restantes s'élargissent
     pour remplir les 400 px. La cascade d'apparition suit (`nth-child(1)` .55 s,
     `nth-child(2)` .95 s) : aucune case orpheline, aucun trou. */
  var boites=[caseHTML('c-reus',ICO_COCHE_FIN,'Réussite',pct+' %')];
  if(graines>0)boites.push(caseHTML('c-grain',ICO_GRAIN_FIN,'Graines','+'+graines));
  boites.push(caseHTML('c-assid',ICO_EPI_FIN,'Assiduité',j+' j'));
  e.innerHTML='<div class="cases">'+boites.join('')+'</div>';
  // Le grand pourcentage seul ne coexiste pas avec la case qui dit la même chose.
  var fs=document.querySelector('#finish .fin-score'); if(fs)fs.style.display='none';
}
function _dayNum(x){ if(!x)return 0; var p=x.split('-'); return Math.round(Date.UTC(+p[0],(+p[1])-1,+p[2])/864e5); }
function daysGap(a,b){ return _dayNum(b)-_dayNum(a); }
function rollConstance(){
  var t=today(), mk=t.slice(0,7);
  if(typeof S.consScore!=='number')S.consScore=0;
  if(typeof S.ghufLeft!=='number')S.ghufLeft=2;
  if(S.ghufMonth!==mk){ S.ghufMonth=mk; S.ghufLeft=2; }              // recharge mensuelle
  if(!S.consDay){ S.consDay=t; S.consFlags={}; saveLocal(); return; }
  if(S.consDay!==t){
    var missed=daysGap(S.consDay,t)-1;                               // jours pleins sautés
    if(missed>0)S.pendingMiss=(S.pendingMiss||0)+missed;
    S.consDay=t; S.consFlags={};
  }
  /* ⚠️ 04/09 — saveLocal, PAS save : tout ce que cette fonction écrit (consDay, consFlags,
     ghufLeft, pendingMiss) se REDÉDUIT de la date du jour sur n'importe quel appareil.
     Avec save(), l'appel INCONDITIONNEL ci-dessus rajeunissait S._ts à chaque chargement
     de page et faisait gagner l'état le plus pauvre. Le score de constance, lui, est une
     vraie progression : il est écrit par bumpConstance(), qui garde save(). */
  saveLocal();
}
/* ══ L'OBJECTIF QUOTIDIEN (preview v2 validée le 10/08) ══
   Les minutes RÉELLES d'exercice (lecteur ouvert, page visible) remplissent l'anneau du
   Profil. L'objectif atteint VALIDE l'épi du jour : c'est LUI qui fait avancer la série —
   les fins de leçon/révision ne la bumpent plus. S.lastDay garde son sens (dernier jour
   validé) : la casse de série et le ghufrān fonctionnent inchangés. */
let feteJourPending=false;   // l'écran « 7 épis » se montre après la leçon où l'objectif est tombé
/* ═══ LES GRAINES (validées par Myriam le 13/08) ═══
   La monnaie d'Alaq. Le verset qui porte l'écran d'assiduité (2:261) décrit littéralement
   une graine qui se multiplie — c'est de là que vient le nom. Barème de la preview
   `preview_fin_lecon_v1` : 10 par leçon ou révision terminée, +5 sans aucune faute,
   +10 quand l'objectif du jour tombe.
   ⚠️ Elles n'achètent JAMAIS de cœurs : racheter son erreur, c'est apprendre à payer pour
   se tromper. Elles n'achètent que du décor. */
const GRAINES={lecon:10,sansFaute:5,objectif:10};
function gagnerGraines(n){ if(!(n>0))return 0; S.graines=(S.graines||0)+n; save(); return n; }
function objMinutes(){ var t=today(); if(S.objDay!==t){S.objDay=t;S.objMin=0;S.objSec=0;} return S.objMin||0; }
function objGoal(){ var m=parseInt((S.onb&&S.onb.objectif)||'',10); return (m>=5)?m:10; }  // 10 min par défaut
function objAddSec(sec){
  var avant=objMinutes()>=objGoal();          // objMinutes remet aussi les compteurs à zéro au changement de jour
  S.objSec=(S.objSec||0)+sec;
  if(S.objSec>=60){ S.objMin=(S.objMin||0)+Math.floor(S.objSec/60); S.objSec%=60;
    save(); }                                 // on n'écrit qu'à la MINUTE pleine — pas d'upsert nuage toutes les 15 s (audit 10/08)
  if(!avant&&(S.objMin||0)>=objGoal())objFete();
}
/* validerJour : LE SEUL endroit qui touche S.streak. Le jour se valide à l'objectif
   atteint OU — règle ADOUCIE (oui de Myriam, 10/08 soir) — à une leçon/révision terminée.
   Une élève qui pratique ne perd donc jamais sa série, même sous l'objectif. */
function validerJour(){
  var t=today(), y=yesterday();
  if(S.lastDay===t)return false;
  /* 🔴 13/09 — LE FILET QUI MANQUAIT (signalé par Myriam : série de 16 jours tombée à 1,
     EN SILENCE, sans le moindre Ghufrān proposé, rang inchangé). `S.pendingMiss` n'était
     alimenté QUE par rollConstance() via S.consDay — qui avance dès qu'on OUVRE l'app,
     même sans rien terminer. Une élève qui ouvre l'app tous les jours mais ne termine
     rien un jour donné ne fait donc JAMAIS lever pendingMiss par ce biais — alors que
     c'est EXACTEMENT le jour qui casse SA série ici, à elle, la mesure stricte. On
     alimente donc aussi pendingMiss depuis le vrai signal de la série — S.lastDay, « le
     dernier jour où j'ai terminé quelque chose » — avant de l'écraser : maybeGhufranPrompt()
     (déjà câblé, déjà éprouvé) le verra au prochain rendu et proposera un Ghufrān au lieu
     de casser en silence. La série tombe quand même à 1 ICI (zéro changement visible sur
     l'écran de fin) — c'est useGhufran()/acceptMiss() qui tranchent le sort final, et
     useGhufran() sait désormais la restaurer après coup (voir son en-tête).
     ⚠️ Limite connue et acceptée : si consDay ET lastDay ont TOUS DEUX pris du retard (une
     élève qui n'a pas ouvert l'app pendant plusieurs jours), ce filet ET rollConstance()
     peuvent chacun ajouter leur part au même pendingMiss — un compte légèrement trop élevé,
     jamais trop bas. Le plafond GHUF_MAX_JOURS et acceptMiss() absorbent cet écart sans
     conséquence : l'important est qu'aucun jour manqué ne reste totalement invisible. */
  if(S.lastDay&&S.lastDay!==y){
    var _gJ=Math.max(0,daysGap(S.lastDay,t)-1);
    if(_gJ>0){ S.pendingMiss=Math.max(S.pendingMiss||0,_gJ); S._streakAvantMiss=S.streak; }
  }
  S.streak=(S.lastDay===y)?S.streak+1:1; S.lastDay=t;
  feteJourPending=true;                       // l'écran « 7 épis » se montrera à la fin de l'exercice
  try{checkBadges({});}catch(e){}             // les badges de série (3/7/30…) tombent au bon moment
  return true;
}
function objFete(){
  validerJour();
  save();
  try{refreshStats();}catch(e){}
  try{confettiBurst();}catch(e){}
  try{playSfx('bonne-reponse');}catch(e){}
  try{toast(icoImg('tb-epi','','height:16px;vertical-align:-3px')+' Objectif du jour atteint — épi validé !');}catch(e){}
}
function objRingHTML(){ // l'anneau, SEUL, entre la carte du rang et « Ton parcours »
  var m=objMinutes(), g=objGoal(), ok=m>=g, C=2*Math.PI*50, off=C*(1-Math.min(1,m/g));
  return '<div class="obj-ring"><div class="anneau'+(ok?' fete':'')+'" title="Objectif quotidien : '+g+' min — se règle dans Paramètres">'+
    '<svg viewBox="0 0 118 118"><circle class="fond" cx="59" cy="59" r="50"/>'+
    '<circle class="prog" cx="59" cy="59" r="50" style="stroke-dasharray:'+C.toFixed(1)+';stroke-dashoffset:'+off.toFixed(1)+'"/></svg>'+
    (ok?'<div class="mn"><b>✓</b><small>'+m+' min</small></div>'+icoImg('tb-epi','obj-epi')
       :'<div class="mn">'+m+'<small>/ '+g+' min</small></div>')+
    '</div></div>';
}
function bumpConstance(kind){
  rollConstance();
  var f=S.consFlags||(S.consFlags={});
  if(!f.came){ S.consScore=(S.consScore||0)+3; f.came=1; }           // venir = constance (50%)
  if(kind==='revise'&&!f.revised){ S.consScore+=2; f.revised=1; }    // révision (30%)
  if(kind==='learn'&&!f.learned){ S.consScore+=1; f.learned=1; }     // apprentissage (20%)
  save();
}
/* Ghufrān غفران : gel de série activé par l’élève (2/mois, jamais à vendre) */
const GHUF_MAX_JOURS=2; // au-delà, aucun rattrapage : c'est la régularité qui est récompensée (Myriam 08/08)
function maybeGhufranPrompt(){
  if(!(S.pendingMiss>0)) return;
  if(document.getElementById('ghufModal')) return;
  var m=document.createElement('div'); m.className='finish on'; m.id='ghufModal';
  /* Règle du 08/08 : UN Ghufrān couvre UNE absence entière (1 ou 2 jours), pas un par
     jour. 2 par mois. Plus de 2 jours, ou plus de Ghufrān : la série repart à zéro.
     Un titre et des boutons, AUCUN texte — la définition vit dans Progrès (🕊️). */
  var perdu = S.pendingMiss>GHUF_MAX_JOURS || (S.ghufLeft||0)<1;
  if(perdu){
    /* \ud83d\udd34 LE RANG PERDU EST DIT, PAS SEULEMENT APPLIQU\u00c9 (Myriam, 01/09 : \u00ab \u00e7a
       doit \u00eatre sp\u00e9cifi\u00e9 au user. Du genre : tu as perdu ta s\u00e9rie, tu redescends
       de rang et te retrouves \u00e0 tel rang \u00bb). On l'annonce AVANT le bouton \u2014 la
       cons\u00e9quence se lit, puis l'\u00e9l\u00e8ve la confirme. Une r\u00e9trogradation
       silencieuse serait une punition qu'on n'ose pas nommer.
       \u26a0\ufe0f On le calcule ICI, avant `acceptMiss()` : apr\u00e8s, le score a d\u00e9j\u00e0
       chang\u00e9 et l'ancien rang n'est plus lisible nulle part. */
    /* \u26a0\ufe0f TROIS CAS, TROIS PHRASES VRAIES. Avec une peine en POURCENTAGE, garder
       son rang est une issue possible \u2014 celle qui avait grimp\u00e9 haut dans sa
       fourchette a un coussin. Annoncer \u00ab tu redescends \u00bb dans ce cas serait un
       mensonge, et annoncer \u00ab tu es au premier rang \u00bb un contresens. */
    var r=retrogradation();
    var P='<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:var(--muted)">';
    var ligne = r.perdu
      ? P+'Tu redescends au rang<br><b style="color:var(--gold);font-size:17px">'+
        RANKS[r.vers].tr+'</b> \u00b7 '+RANKS[r.vers].fr+'</p>'
      : (r.avant>0
         ? P+'Tu gardes le rang <b style="color:var(--gold)">'+RANKS[r.avant].tr+
           '</b> \u2014 de justesse.</p>'
         : P+'Tu es au premier rang : il n\u2019y a rien \u00e0 redescendre.</p>');
    m.innerHTML='<div style="max-width:340px;width:100%;margin:0 auto;text-align:center;position:relative">'+
      icoEcran('ecran-pousse','width:96px;height:auto;margin:0 auto')+
      '<h2 style="margin:6px 0 10px">Ta s\u00e9rie repart \u00e0 z\u00e9ro</h2>'+
      ligne+
      '<button class="cbtn" onclick="acceptMiss()">JE REPRENDS AUJOURD\u2019HUI</button>'+
      '</div>';
    document.body.appendChild(m); return;
  }
  m.innerHTML='<div style="max-width:340px;width:100%;margin:0 auto;text-align:center;position:relative">'+
    icoEcran('ecran-ghufran','width:104px;height:auto;margin:0 auto')+
    '<h2 style="margin:6px 0 18px">Tu as manqu\u00e9 '+S.pendingMiss+' jour'+(S.pendingMiss>1?'s':'')+'</h2>'+
    '<button class="cbtn" onclick="useGhufran()">\ud83d\udd4a\ufe0f Utiliser un Ghufr\u0101n</button>'+
    '<button class="cbtn" style="background:var(--panel2);color:var(--cream);border:1px solid var(--line);margin-top:8px" onclick="acceptMiss()">Non, j\u2019assume</button>'+
    '</div>';
  document.body.appendChild(m);
}
/* La tuile 🕊️ de Progrès explique la règle — l'écran d'absence, lui, reste muet (08/08) */
function showGhufranInfo(){
  var m=document.getElementById('ghufInfoModal');
  if(!m){ m=document.createElement('div'); m.className='finish'; m.id='ghufInfoModal'; document.body.appendChild(m); }
  m.innerHTML='<button class="sm-close" style="top:calc(14px + env(safe-area-inset-top,0px));right:14px" onclick="document.getElementById(\'ghufInfoModal\').classList.remove(\'on\')" aria-label="Fermer">✕</button>'+
    '<div style="max-width:340px;width:100%;margin:0 auto;text-align:center">'+
    icoEcran('ecran-ghufran','width:92px;height:auto;margin:0 auto')+
    '<h2 style="margin:6px 0 8px">Le Ghufr\u0101n <span class="arw" style="font-size:22px">\u063a\u0641\u0631\u0627\u0646</span></h2>'+
    '<p class="succ-desc" style="margin:0 0 10px">Une absence pardonn\u00e9e : ta s\u00e9rie continue comme si tu \u00e9tais venue.</p>'+
    '<p class="succ-desc" style="margin:0 auto;width:fit-content;text-align:left">\u2022 2 par mois<br>\u2022 pour une absence de 1 ou 2 jours<br>\u2022 au-del\u00e0, la s\u00e9rie repart \u00e0 z\u00e9ro</p>'+
    '<p style="color:var(--muted);font-size:12px;font-style:italic;margin:12px 0 0">C\u2019est la r\u00e9gularit\u00e9 qui est r\u00e9compens\u00e9e.</p>'+
    '</div>';
  m.classList.add('on');
}
function closeGhufran(){ var m=document.getElementById('ghufModal'); if(m)m.remove(); }
function _progVisible(){ var v=document.getElementById('view-prog'); return v && v.offsetParent!==null; }
function useGhufran(){
  var m=S.pendingMiss||0; if(m<=0){ closeGhufran(); return; }
  if(m>GHUF_MAX_JOURS||(S.ghufLeft||0)<1){ acceptMiss(); return; }  // le plafond est une RÈGLE, pas un affichage
  S.ghufLeft-=1;               // UN Ghufrān pardonne UNE absence entière (Myriam 08/08)
  S.pendingMiss=0;
  /* 🔴 13/09 — DEUX MOMENTS POSSIBLES POUR CE CLIC, ET ILS NE SE RÉPARENT PAS PAREIL.
     ① Avant toute leçon du jour (S.lastDay est encore l'ANCIEN jour, pas aujourd'hui) :
     le pont d'origine suffit — poser lastDay=hier fait que le PROCHAIN validerJour(),
     tout à l'heure dans la même session, l'incrémentera normalement.
     ② APRÈS une leçon déjà terminée aujourd'hui (validerJour() a DÉJÀ tranché — S.lastDay
     vaut déjà AUJOURD'HUI, la série DÉJÀ remise à 1, exactement le cas de Myriam) : aucun
     validerJour() ne revient avant demain, le pont d'hier ne servirait à rien. On restaure
     alors directement depuis S._streakAvantMiss, posé par validerJour() juste avant la
     casse — sinon « Utiliser un Ghufrān » consommerait un jeton pour rien, et la promesse
     de l'écran (« ta série continue comme si tu étais venue ») serait fausse. */
  if(S.lastDay===today()){ S.streak=(S._streakAvantMiss||0)+1; delete S._streakAvantMiss; }
  else S.lastDay=yesterday();       // pont : la série continue comme si elle était venue
  save(); closeGhufran();
  toast('\ud83d\udd4a\ufe0f Ghufr\u0101n utilis\u00e9 — '+(S.ghufLeft||0)+' restant'+((S.ghufLeft||0)>1?'s':'')+' ce mois');
  try{refreshStats();}catch(e){}
  if(_progVisible())renderProg();
}
/* ══ LA RÉTROGRADATION SE COMPTE EN RANGS, PLUS EN POINTS (Myriam, 01/09) ══
   Son constat, vérifié dans le code : « il y a 8 jours je n'avais plus de
   ghufrān et je suis restée plus de deux jours sans utiliser l'application.
   J'ai perdu ma série, ce qui est normal. MAIS j'ai conservé mon rang, ce qui
   est incohérent. »
   Elle a raison, et la cause était arithmétique : la peine valait −3 POINTS par
   jour manqué, sur des paliers larges de 50 (Al-Muthābara va de 50 à 100).
   Trois jours d'absence coûtaient 9 points — jamais assez pour franchir un
   seuil vers le bas. La règle disait « rétrogradation douce » et ne
   rétrogradait, en pratique, jamais.
   🔴 LA PEINE EST DONC UN POURCENTAGE DU SCORE, PAR JOUR MANQUÉ — la forme
   proposée par Myriam (« ou les jours d'absence doivent faire perdre plus de
   points »), retenue APRÈS avoir écrit puis jeté une version « on descend d'un
   rang d'office ». Cette première version avait un défaut qu'il faut garder en
   mémoire : en faisant atterrir au PLANCHER du rang inférieur, la même absence
   de 3 jours coûtait 74 points à 99 et seulement 25 à 50 — elle punissait donc
   PLUS DUREMENT celle qui avait été la plus régulière. L'inverse du but.
   Un pourcentage est continu : il coûte le même EFFORT de reconquête partout.
   ⚠️ ET UN MONTANT FIXE NE MARCHERAIT PAS NON PLUS, parce que les fourchettes
   sont très inégales (10 · 15 · 25 · 50 · 100 · 100 points) : un −12/jour
   effacerait une débutante et gratterait à peine An-Nūr.
   🔴 ET LA PEINE EST LINÉAIRE, PAS COMPOSÉE — LA RAISON EST DE MYRIAM, ET ELLE
   EST DE FOND (01/09) : « pourquoi un jour coûterait moins cher en termes de
   perte qu'un autre ? C'est pas cohérent avec notre vision. Et surtout, quand
   Allah récompense il récompense [multiplie] quelque chose, alors que quand il
   punit il punit à la hauteur du péché. Mais le péché n'est pas amoindri quand
   il dure ! »
   Une première version composait (score × 0,85 par jour) : chaque jour y
   retirait 15 % de ce qui RESTAIT, donc le 1ᵉʳ jour coûtait 12 points et le 5ᵉ
   seulement 6. Cela revenait à dire que l'irrégularité s'amortit — l'inverse
   de ce que le rang mesure, et le contraire du principe qu'elle rappelle :
   la récompense se MULTIPLIE (c'est littéralement le verset de l'écran
   d'assiduité, 2:261 — le grain qui donne sept épis de cent grains), tandis
   que la sanction est à la hauteur EXACTE (6:160 : مَن جَاءَ بِالسَّيِّئَةِ فَلَا
   يُجْزَىٰ إِلَّا مِثْلَهَا — « qui apporte une mauvaise action n'est rétribué que
   par son équivalent »). Ni plus, ni moins, et sans dégressivité.
   Chaque jour manqué retire donc LE MÊME nombre de points : 15 % du score
   qu'avait l'élève au moment où la série casse. Sept jours ramènent à zéro,
   c'est-à-dire à An-Niyya — une semaine sans rien vaut de recommencer par
   l'intention.
   ⚠️ LES 15 % SONT MESURÉS, PAS CHOISIS. Sur le cas réel de Myriam (score ~80,
   3 jours) : à 10 % elle tomberait à 56 et à 12,5 % à 50 — dans les DEUX cas
   elle resterait Al-Muthābara, c'est-à-dire le défaut qu'elle signale,
   inchangé. À 15 % elle tombe à 44 et descend à Al-Ijtihād. C'est le plus
   petit taux qui répare vraiment ce qu'elle a observé.
   ⚠️ Un seul jour ne fait pas toujours perdre le rang : qui a grimpé haut dans
   sa fourchette garde un coussin — ce n'est pas une faveur, c'est la
   proportionnalité même (hadith socle : أحبّ الأعمال إلى الله أدومها وإن قلّ). */
const ABSENCE_TAUX = 0.15;   // du score au moment de la casse, PAR jour manqué
function retrogradation(){
  var m=S.pendingMiss||0;
  var base=Math.max(0,S.consScore||0);
  var avant=rankFor(base).idx;
  /* linéaire : chaque jour retire la MÊME part, jamais une part de ce qui reste */
  var score=Math.max(0, Math.round(base*(1-ABSENCE_TAUX*m)));
  var vers=rankFor(score).idx;
  return {m:m, avant:avant, vers:vers, score:score, perdu:vers<avant};
}
function acceptMiss(){
  var r=retrogradation();
  S.consScore=Math.max(0,r.score);
  S.streak=0; S.pendingMiss=0; delete S._streakAvantMiss; save();
  closeGhufran(); if(_progVisible())renderProg();
}
/* ═══ Les modales du rang et des succès (CROIX_SUCCES, CROIX_RANG, rkStatsHTML, showRank,
   closeRank, rankInfo) vivent dans ui/parametres.js (12/09/2026), avec le Profil. ═══ */
/* ═══ LE PASSAGE DE MINUIT (correctif du 14/08, retour de Myriam : « les cœurs ne se remettent
   pas à 7 le matin ») ═══
   La recharge quotidienne ne tournait qu'AU CHARGEMENT. Or Alaq est une application installée :
   sur iPhone elle n'est jamais rechargée, elle est mise en veille puis reprise — l'élève qui la
   laisse ouverte la nuit rouvre le lendemain avec les cœurs de la veille. Le jour est donc
   revérifié à CHAQUE reprise (retour à l'écran, focus de la fenêtre) et par une minuterie d'une
   minute pour celle qui la laisse ouverte à minuit. La fonction est idempotente : elle ne fait
   rien tant que la date locale n'a pas changé. */
function majJour(){
  if(S.heartDay===today())return false;
  S.hearts=HEARTS_MAX;S.heartDay=today();S.bigNext=0;saveLocal(); // recharge quotidienne : elle se rejoue seule sur chaque appareil, elle ne date pas la progression
  try{rollConstance();}catch(e){}
  var a=document.getElementById('st-hearts');if(a)a.textContent=S.hearts;
  var b=document.getElementById('p-hearts');if(b)b.textContent=S.hearts;
  return true;
}
majJour();
document.addEventListener('visibilitychange',function(){ if(!document.hidden)majJour(); });
window.addEventListener('focus',majJour);
/* cloudResync et ses deux écouteurs ont déménagé dans progression.js le 08/09
   (POC-5 sous-lot 2), avec le reste du moteur de synchronisation. Le
   `setInterval(majJour,60000)` ci-dessous n'en fait PAS partie : il appartient au
   roulement du jour, pas au nuage. */
setInterval(majJour,60000);
try{rollConstance();}catch(e){}
// Migration unique vers les 7 vies : les anciennes sauvegardes (5 cœurs) sont remontées à 7
(function(){ if(!S.v7){S.v7=1;S.hearts=HEARTS_MAX;S.heartDay=today();saveLocal();} })();
