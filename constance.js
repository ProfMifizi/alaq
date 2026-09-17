/* constance.js — la régularité de l'élève et ses récompenses.
   · les rangs (7 stations, النية → النور ; 50 % constance · 30 % révision · 20 % apprentissage) :
     RANKS, rankFor, RANK_COLORS, lampSVG, updRankBadge, rankTrackHTML / rankBarHTML
     (leurs modales, showRank / rankInfo / showSucces, sont dans ui/parametres.js) ;
   · les succès : BADGES, SUCCES_DESC, ecussonHTML, confettiBurst, award, checkBadges ;
   · les graines : GRAINES, gagnerGraines ;
   · l'objectif du jour : objMinutes, objGoal, objAddSec, objFete, objRingHTML ;
   · la série : today / yesterday / _dayNum / daysGap / _addDays (heure locale), validerJour,
     feteJourPending, et l'écran des 7 épis (showStreak, streakPrecharger, streakRecite, streakContinue) ;
   · le Ghufrān : GHUF_MAX_JOURS, maybeGhufranPrompt, showGhufranInfo, closeGhufran, useGhufran,
     ABSENCE_TAUX, retrogradation, acceptMiss ;
   · l'écran de fin : fillFinishConstance, ICO_*_FIN, caseHTML, fillFinishCases ;
   · le passage de minuit : majJour et ses trois branchements, rollConstance, la migration v7.

   Script classique, jamais un module : refreshStats() (ui/accueil.js) appelle updRankBadge() sans
   garde au premier rendu — différé, ReferenceError et accueil vide ; feteJourPending est réassignée
   par src/player et revision.js (un module la copierait) ; majJour() écrit #st-hearts avant le
   premier rendu ; le HTML statique appelle streakRecite() et streakContinue().
   ⛔ Ni defer, ni type="module", ni import, ni export.

   AU CHARGEMENT : majJour(), ses deux écouteurs, la minuterie, rollConstance() et la migration v7
   ne lisent que S, HEARTS_MAX, saveLocal (progression.js) et le DOM statique (#st-hearts, #p-hearts).
   ⛔ Rien du grand script : le banc l'exige.
   À L'APPEL seulement — cette liste est le contrat, mesurée par le banc :
   S, HEARTS_MAX, save, saveLocal, unitValidated (progression.js) · UNITS (donnees.js)
   · spkSVG, spkOn, spkOff, stopAudio, playSfx, _curAudio, _sndGen (son.js)
   · icoImg, icoEcran (assets.js) · qariCur, qariUrlCdn (revision.js)
   · refreshStats (ui/accueil.js) · renderProg (ui/parametres.js)
   · toast, fatihaPct, returnFromPlayer, obAccountPending (index.html) · showObAccount (comptes.js).

   ⚠️ Chargé après signalements.js : ses deux capteurs d'erreur doivent être debout avant le roulement du jour.
   Gardes : outils/verifier-constance.mjs, previews/_verif_constance.html, garderLaConstance()
   (vite.config.mjs), CORE de sw.js, outils/verifier-serie-assiduite.mjs.
   (journal : constance.js · en-tête d'origine) */

function showStreak(){ // l'épi pousse du tas de terre ; le chiffre reste le titre au-dessus
  var n=S.streak||1;
  /* l'animation ne se rejoue pas seule (loop=1) : on la redémarre (même URL, servie par le sw) */
  var pl=document.querySelector('.streak-plant');
  if(pl){ var src=pl.getAttribute('src'); pl.src=''; pl.src=src; }
  document.getElementById('streakNum').textContent=n;
  document.getElementById('streakUnit').textContent=(n>1?'jours':'jour');
  var s=document.getElementById('streakSpk'); if(s&&!s.innerHTML)s.innerHTML=spkSVG();
  document.getElementById('streak').classList.add('on');
  streakPrecharger();
  /* La récitation de 2:261 part toute seule : exception voulue par Myriam, pour que le verset soit
     entendu chaque jour — aucun autre écran ne doit réciter seul (journal : constance.js · récitation automatique).
     ⚠️ Après le préchargement et dans un setTimeout : dans le même tour, le son partirait avant la fête.
     ⚠️ L'autoplay peut être refusé : streakRecite a son propre catch, le refus reste silencieux. */
  setTimeout(function(){
    if(!document.getElementById('streak').classList.contains('on'))return; // écran déjà quitté
    try{ streakRecite(); }catch(e){}
  },420);
}
/* Le verset se précharge à l'ouverture de l'écran, pas au clic (sinon ~30 s de téléchargement devant la fête).
   ⚠️ Le service worker ne le met pas en cache (requêtes Range) : le préchargement est le seul levier.
   ⚠️ L'URL est gardée avec l'élément : le récitateur peut changer entre deux écrans. */
let _streakA=null, _streakUrl='';
function streakPrecharger(){
  try{
    const url=qariUrlCdn(qariCur(),268);
    if(_streakA&&_streakUrl===url)return;
    _streakA=new Audio(); _streakA.preload='auto'; _streakA.src=url; _streakUrl=url;
    try{_streakA.load();}catch(e){}
  }catch(e){ _streakA=null; _streakUrl=''; }
}
/* 2:261 dans la voix choisie : numéro 268 du mushaf continu (la Fātiḥa compte 7 versets).
   ⚠️ Fichier non hébergé chez nous : il passe par le flux, et hors ligne on le dit. */
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
/* Les écussons des sourates : un gabarit doré, le nom composé par le code en Noto Naskh.
   L'IA ne sait pas écrire l'arabe — jamais de nom généré. */
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

function today(){ // heure LOCALE : en UTC la journée basculait à 02 h à Paris
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
/* La lampe (mishkât, 24:35) : l'icône du rang, du gris de la pierre à la lumière — au 7e rang elle rayonne. */
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
    var sz=last?22:15; // le rang courant garde la même taille : seule sa lumière le distingue
    var sh=isCur?';box-shadow:0 0 0 3px rgba(232,169,79,.3),0 0 14px 3px rgba(244,208,137,.75)':(last&&reached?';box-shadow:0 0 8px '+c:'');
    dots+='<i onclick="event.stopPropagation();rankInfo('+i+')" style="width:'+sz+'px;height:'+sz+'px;background:'+c+sh+'">'+((last&&!reached)?'☀️':'')+'</i>';
  }
  // la progression fine au sein du rang est fondue dans le remplissage du chemin : plus de petite barre
  // ni de légende à part (journal : constance.js · le chemin des rangs)
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
/* Les trois cases de fin, les mêmes partout (fin de leçon, bilan, révision) :
   réussite · graines · assiduité (journal : constance.js · les trois cases de fin). */
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
  /* Gain nul : pas de case Graines (décision de Myriam), règle générale — un examen raté non plus.
     Deux cases tiennent sans retouche CSS (.cases est un flex, .case porte flex:1). */
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
  /* ⚠️ saveLocal, pas save : tout ce qu'écrit cette fonction se redéduit de la date ; save() rajeunirait
     S._ts à chaque chargement et ferait gagner l'état le plus pauvre. Le score passe par bumpConstance(). */
  saveLocal();
}
/* L'objectif quotidien : les minutes réelles (lecteur ouvert, page visible) remplissent l'anneau du
   Profil, et l'objectif atteint valide l'épi du jour. S.lastDay = le dernier jour validé. */
let feteJourPending=false;   // l'écran « 7 épis » se montre après la leçon où l'objectif est tombé
/* Les graines, monnaie d'Alaq (2:261) : 10 par leçon ou révision, +5 sans faute, +10 à l'objectif.
   ⛔ Elles n'achètent jamais de cœurs : racheter son erreur, c'est apprendre à payer pour se tromper. */
const GRAINES={lecon:10,sansFaute:5,objectif:10};
function gagnerGraines(n){ if(!(n>0))return 0; S.graines=(S.graines||0)+n; save(); return n; }
function objMinutes(){ var t=today(); if(S.objDay!==t){S.objDay=t;S.objMin=0;S.objSec=0;} return S.objMin||0; }
function objGoal(){ var m=parseInt((S.onb&&S.onb.objectif)||'',10); return (m>=5)?m:10; }  // 10 min par défaut
function objAddSec(sec){
  var avant=objMinutes()>=objGoal();          // objMinutes remet aussi les compteurs à zéro au changement de jour
  S.objSec=(S.objSec||0)+sec;
  if(S.objSec>=60){ S.objMin=(S.objMin||0)+Math.floor(S.objSec/60); S.objSec%=60;
    save(); }                                 // on n'écrit qu'à la minute pleine, pas d'upsert toutes les 15 s
  if(!avant&&(S.objMin||0)>=objGoal())objFete();
}
/* validerJour : le seul endroit qui fait avancer S.streak (useGhufran la restaure, acceptMiss la remet à zéro). Le jour se valide à l'objectif atteint OU à une
   leçon/révision terminée : qui pratique ne perd jamais sa série. */
function validerJour(){
  var t=today(), y=yesterday();
  if(S.lastDay===t)return false;
  /* Le filet : pendingMiss est aussi alimenté depuis S.lastDay, sinon une élève qui ouvre l'app sans rien
     terminer perdait sa série en silence ; maybeGhufranPrompt le proposera, useGhufran sait la rendre après coup.
     ⚠️ Si consDay et lastDay sont tous deux en retard, le compte peut être trop haut, jamais trop bas.
     (journal : constance.js · le filet de la série) */
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
const GHUF_MAX_JOURS=2; // au-delà, aucun rattrapage : c'est la régularité qui est récompensée
function maybeGhufranPrompt(){
  if(!(S.pendingMiss>0)) return;
  if(document.getElementById('ghufModal')) return;
  var m=document.createElement('div'); m.className='finish on'; m.id='ghufModal';
  /* Un Ghufrān couvre UNE absence entière (1 ou 2 jours), 2 par mois ; au-delà, la série repart à zéro.
     L’écran qui propose un Ghufrān : un titre et des boutons, pas de texte (la définition vit dans Progrès). */
  var perdu = S.pendingMiss>GHUF_MAX_JOURS || (S.ghufLeft||0)<1;
  if(perdu){
    /* Le rang perdu est annoncé avant le bouton, et calculé ici, avant acceptMiss() : après, l'ancien
       rang n'est plus lisible. Trois cas, trois phrases vraies : on redescend, on garde son rang de
       justesse, ou on est déjà au premier (journal : constance.js · le rang perdu est dit). */
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
/* La tuile 🕊️ de Progrès explique la règle — l'écran qui propose un Ghufrān, lui, reste muet */
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
  S.ghufLeft-=1;               // UN Ghufrān pardonne UNE absence entière
  S.pendingMiss=0;
  /* Deux moments pour ce clic : ① avant toute leçon du jour, le pont par hier suffit ;
     ② après une leçon du jour (validerJour a déjà remis la série à 1), on restaure depuis S._streakAvantMiss.
     (journal : constance.js · Ghufrān rendu après coup) */
  if(S.lastDay===today()){ S.streak=(S._streakAvantMiss||0)+1; delete S._streakAvantMiss; }
  else S.lastDay=yesterday();       // pont : la série continue comme si elle était venue
  save(); closeGhufran();
  toast('\ud83d\udd4a\ufe0f Ghufr\u0101n utilis\u00e9 — '+(S.ghufLeft||0)+' restant'+((S.ghufLeft||0)>1?'s':'')+' ce mois');
  try{refreshStats();}catch(e){}
  if(_progVisible())renderProg();
}
/* La rétrogradation : chaque jour manqué retire 15 % du score qu'avait l'élève à la casse.
   Linéaire, jamais composé (la sanction est à la hauteur exacte, 6:160) ; un pourcentage et pas un
   montant fixe, car les fourchettes des rangs sont très inégales. Sept jours ramènent à An-Niyya.
   ⚠️ 15 % est mesuré : le plus petit taux qui fait vraiment descendre de rang sur le cas réel de Myriam.
   (journal : constance.js · la rétrogradation en rangs) */
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
/* Le passage de minuit : sur iPhone l'app n'est jamais rechargée, elle est mise en veille. Le jour est
   revérifié à chaque reprise (visibilitychange, focus) et chaque minute ; idempotent tant que la date locale ne change pas. */
function majJour(){
  if(S.heartDay===today())return false;
  S.hearts=HEARTS_MAX;S.heartDay=today();S.bigNext=0;saveLocal(); // recharge quotidienne : elle se rejoue sur chaque appareil, elle ne date pas la progression
  try{rollConstance();}catch(e){}
  var a=document.getElementById('st-hearts');if(a)a.textContent=S.hearts;
  var b=document.getElementById('p-hearts');if(b)b.textContent=S.hearts;
  return true;
}
majJour();
document.addEventListener('visibilitychange',function(){ if(!document.hidden)majJour(); });
window.addEventListener('focus',majJour);
setInterval(majJour,60000);
try{rollConstance();}catch(e){}
// Migration unique vers les 7 vies : les anciennes sauvegardes (5 cœurs) sont remontées à 7
(function(){ if(!S.v7){S.v7=1;S.hearts=HEARTS_MAX;S.heartDay=today();saveLocal();} })();
