/* bulles-tutoriels.js — sous-lot 8 : les bulles, la grille des 28 lettres, les tutoriels, le micro.
   · le jeu de bulles (une leçon d'alphabet, de formes, de syllabes ou de mots à faire éclater) :
     BUL, bulStop, bulPose, bulStart, bulTick, plop, bulEclat, bulPop ;
   · la grille des 28 lettres dans les leçons : la hamza et ses sièges (HAMZA_SON,
     SIEGES_DE_LETTRE, roleTap, hamzaRailHTML, hamzaTap) et les deux familles de 14
     (SOLAIRES_14, LUNAIRES_14, estSolaire — lues aussi par badgeSolaire de revision.js et
     par les résumés de grammaire de ui/reviser.js) ;
   · les tutoriels (moteur letterTut, coach marks) : letterTut, maybeShowLetterTut, homeTut,
     maybeShowHomeTut, vocabTut, maybeShowVocabTut, coursTut, maybeShowCoursTut — un simple
     drapeau S.tut… 0→1, jamais une progression (saveLocal, pas save) ;
   · le micro (reconnaissance vocale, lecture à voix haute) : normReco, recoMatch, startReco,
     recoSelf, recoSkip — repli immédiat si SpeechRecognition manque (Safari/iOS).

   Script CLASSIQUE, chargé sous comptes.js et juste avant le grand script — ni defer, ni
   type="module", ni import/export. ⚠️ MESURÉ, pas supposé : ui/accueil.js.renderHome() (appelée
   en synchrone par showTab('home'), la dernière ligne du grand script) écrit
   `setTimeout(maybeShowHomeTut,300)` — cette ligne ÉVALUE l'identifiant maybeShowHomeTut
   immédiatement ; en module différé il n'existe pas encore à cet instant et lève ReferenceError,
   qui interromprait renderHome() en plein milieu (accueil à moitié peint).
   ⚠️ objectifFilet, lettreTap et toc (le filet de sécurité, la carte d'une lettre neuve, le
   timbre d'erreur) restent dans index.html / son.js : bulPop les appelle par leur nom, résolus
   À L'APPEL, jamais au chargement — même contrat que tous les fichiers déjà sortis.
   AU CHARGEMENT : LUNAIRES_14 lit ALPHABET (donnees.js, déjà chargé). Rien d'autre n'agit.
   À L'APPEL seulement : sayLetterName, speak, toc (son.js) · shuffle, joinsL, formGlyph,
   letterKey (donnees.js) · icoImg (assets.js) · ctaOn, advance (src/player / src/ecrans,
   modules) · objectifFilet, S, saveLocal (index.html).
   Lu par : src/player/index.js (bulStart, bulStop, hamzaRailHTML, hamzaTap, roleTap, startReco,
   recoSkip — en bare-call, résolus au global comme les ~110 autres noms qu'il consulte à l'appel) ·
   revision.js (badgeSolaire lit SOLAIRES_14/LUNAIRES_14/estSolaire, letterGridHTML appelle
   letterTut) · ui/accueil.js (maybeShowHomeTut) · ui/reviser.js (maybeShowLetterTut,
   maybeShowVocabTut, maybeShowCoursTut, LUNAIRES_14/SOLAIRES_14/estSolaire dans les résumés de
   grammaire, et en ligne coursTut()/vocabTut()/letterTut()/hamzaTap()/roleTap()).
   Gardes : outils/verifier-bulles-tutoriels.mjs, previews/_verif_bulles-tutoriels.html,
   garderLesBullesEtTutoriels() dans vite.config.mjs, CORE du sw, hors-ligne, paquet natif. */

/* ═══ LES BULLES ═══
   Elles montent, dérivent au hasard et se cognent. La non-superposition n'est pas une
   contrainte de placement, c'est la conséquence des chocs. */
var BUL={raf:0,items:[],W:0,H:0,reste:0,R:32,v:40,bruit:70,chocs:0};   // v et bruit relevés le 09/08 : plus vif, plus désordonné
function bulStop(){ if(BUL.raf)cancelAnimationFrame(BUL.raf); BUL.raf=0; BUL.items=[]; }
function bulPose(b){
  b.el.style.setProperty('--x',b.x.toFixed(1)+'px');
  b.el.style.setProperty('--y',b.y.toFixed(1)+'px');
}
function bulStart(lettres,parLettre,formes,syllabes,mots){
  var z=document.getElementById('bulzone'); if(!z)return;
  BUL.W=z.clientWidth; BUL.H=z.clientHeight; BUL.items=[]; BUL.chocs=0;
  var sac=[];
  if(mots){ // leçon 7 : une bulle par MOT — seules les cibles éclatent, un leurre secoue et reste
    mots.forEach(function(m){ sac.push({L:m.w,g:m.w,cible:!!m.cible}); });
  }else if(syllabes){ // leçons 5/6 : chaque syllabe deux fois — le son d'une bulle est SA syllabe
    syllabes.forEach(function(s){ sac.push({L:s,g:s}); sac.push({L:s,g:s}); });
  }else if(formes){ // leçon 3 : chaque forme DISTINCTE deux fois (24 bulles pour م ل ن)
    lettres.forEach(function(L){
      (joinsL(L)?[0,1,2,3]:[0,3]).forEach(function(p){
        sac.push({L:L,g:formGlyph(L,p)});sac.push({L:L,g:formGlyph(L,p)});
      });
    });
  }else{
    lettres.forEach(function(L){ for(var i=0;i<parLettre;i++)sac.push({L:L,g:L}); });
  }
  shuffle(sac);
  BUL.reste=mots?sac.filter(function(x){return x.cible;}).length:sac.length;
  /* le rayon vit dans BUL.R : la physique et l'éclat le lisent, jamais un 32 en dur */
  BUL.R=mots?56:(syllabes?60:(formes?27:32));   // un mot entier tient dans la bulle (56 = la moitié de .bul.mot) ; 60 = .bul.syl doublée (14/08)
  var R=BUL.R;
  /* ⚠️ colonnes et pas des rangées se calculent sur le rayon réel : fixes, les bulles de R=60
     débordaient de l'aire. (journal : index.html · les bulles débordaient) */
  var cols=(2*R*3<=BUL.W)?3:((2*R*2<=BUL.W)?2:1);
  var lignes=Math.ceil(sac.length/cols);
  var pitchY=Math.max((BUL.H+90)/lignes,2*R+8);
  sac.forEach(function(it,i){
    var L=it.L;
    var el=document.createElement('button');
    el.className='bul'+(formes?' frm':'')+(syllabes?' syl':'')+(mots?' mot':''); el.textContent=it.g; el.setAttribute('aria-label',L);
    var col=i%cols, rang=Math.floor(i/cols);
    var b={el:el,L:L,cible:(it.cible!==false),
      x:(cols>1?col*(BUL.W-2*R)/(cols-1)*0.98:(BUL.W-2*R)/2)+(Math.random()-0.5)*16,
      y:-R+rang*pitchY+(Math.random()-0.5)*20,
      vx:(Math.random()-0.5)*40,
      vy:-BUL.v*(0.70+Math.random()*0.60),   // chacune sa vitesse : le flux n'est pas un bloc
      pop:false};
    b.x=Math.max(0,Math.min(BUL.W-2*R,b.x));
    el.onclick=function(){ bulPop(b); };
    bulPose(b); z.appendChild(el); BUL.items.push(b);
  });
  var last=null;
  function frame(ts){
    if(!document.getElementById('bulzone')){ BUL.raf=0; return; }
    if(last===null)last=ts;
    bulTick((ts-last)/1000); last=ts;
    BUL.raf=requestAnimationFrame(frame);
  }
  BUL.raf=requestAnimationFrame(frame);
}
/* ⚠️ dt est PLAFONNÉ : un onglet revenu d'arrière-plan rend un dt énorme, et une bulle
   traverserait sa voisine sans que le choc soit détecté. */
function bulTick(dt){
  dt=Math.min(dt,0.05);
  var R=BUL.R, D=2*R, xmax=BUL.W-D;
  var vivantes=BUL.items.filter(function(b){return !b.pop;});
  vivantes.forEach(function(b){
    b.vx+=(Math.random()-0.5)*BUL.bruit*dt;
    b.vy+=(-BUL.v-b.vy)*0.45*dt;                // rappel PLUS MOU : un choc se voit plus longtemps
    b.vx=Math.max(-46,Math.min(46,b.vx));
    b.x+=b.vx*dt; b.y+=b.vy*dt;
    if(b.x<0){b.x=0;b.vx=Math.abs(b.vx);}
    if(b.x>xmax){b.x=xmax;b.vx=-Math.abs(b.vx);}
    if(b.y<-D){                                  // sortie par le haut → retour par le bas
      b.y=BUL.H+6; b.x=Math.random()*xmax;
      b.vx=(Math.random()-0.5)*40; b.vy=-BUL.v*(0.70+Math.random()*0.60);
    }
  });
  // dix passes, et on décolle 2 % au-delà du contact : séparer A de B peut renfoncer A dans C,
  // le rappel aux parois aussi, et à 40 px/s six passes laissaient ~0,8 px de chevauchement.
  for(var pass=0;pass<10;pass++){
    for(var i=0;i<vivantes.length;i++)for(var j=i+1;j<vivantes.length;j++){
      var a=vivantes[i], c=vivantes[j];
      var dx=c.x-a.x, dy=c.y-a.y, d=Math.hypot(dx,dy);
      if(d>=D||d===0)continue;
      if(pass===0)BUL.chocs++;
      var nx=dx/d, ny=dy/d, ov=(D-d)/2*1.02;
      a.x-=nx*ov; a.y-=ny*ov; c.x+=nx*ov; c.y+=ny*ov;
      var vrel=(c.vx-a.vx)*nx+(c.vy-a.vy)*ny;
      if(vrel<0&&pass===0){                      // choc élastique, masses égales
        a.vx+=vrel*nx; a.vy+=vrel*ny;
        c.vx-=vrel*nx; c.vy-=vrel*ny;
      }
      a.x=Math.max(0,Math.min(xmax,a.x)); c.x=Math.max(0,Math.min(xmax,c.x));
    }
  }
  vivantes.forEach(bulPose);
}
/* Le « plop » : un claquement de bruit très court (la membrane cède) puis une petite montée
   résonante (l'air s'échappe). WebAudio, donc il ne compte pas comme « le son en cours » :
   il se superpose au nom de la lettre au lieu de le couper. */
function plop(){
  if(!SND)return;
  try{
    var Ctx=window.AudioContext||window.webkitAudioContext; if(!Ctx)return;
    var ac=window._ac||(window._ac=new Ctx());
    if(ac.state!=='running')ac.resume(); // iOS : couvre aussi l'état « interrupted »
    var t=ac.currentTime;
    var n=ac.createBufferSource(), buf=ac.createBuffer(1,Math.floor(ac.sampleRate*0.02),ac.sampleRate);
    var dd=buf.getChannelData(0);
    for(var i=0;i<dd.length;i++)dd[i]=(Math.random()*2-1)*(1-i/dd.length);
    n.buffer=buf;
    var bp=ac.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=1400; bp.Q.value=1.2;
    var gn=ac.createGain(); gn.gain.setValueAtTime(0.16,t); gn.gain.exponentialRampToValueAtTime(0.0001,t+0.05);
    n.connect(bp);bp.connect(gn);gn.connect(ac.destination);n.start(t);
    var o=ac.createOscillator(), g=ac.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(540,t);
    o.frequency.exponentialRampToValueAtTime(1450,t+0.05);
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.20,t+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.11);
    o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+0.12);
  }catch(e){}
}
/* L'éclat : l'onde de la paroi qui se détend, puis dix gouttelettes qui retombent. */
function bulEclat(x,y){
  var z=document.getElementById('bulzone'); if(!z)return;
  var cx=x+BUL.R, cy=y+BUL.R;
  var o=document.createElement('i'); o.className='onde';
  o.style.left=cx+'px'; o.style.top=cy+'px';
  z.appendChild(o);
  setTimeout(function(){ if(o.parentNode)o.parentNode.removeChild(o); },420);
  for(var i=0;i<10;i++){
    var d=document.createElement('i');
    d.className='goutte';
    var a=(i/10)*6.283+(Math.random()-0.5)*0.55, r=30+Math.random()*30, t=3+Math.random()*6;
    d.style.width=d.style.height=t.toFixed(1)+'px';
    d.style.margin=(-t/2).toFixed(1)+'px 0 0 '+(-t/2).toFixed(1)+'px';
    d.style.left=cx+'px'; d.style.top=cy+'px';
    d.style.setProperty('--dx',(Math.cos(a)*r).toFixed(1)+'px');
    d.style.setProperty('--dy',(Math.sin(a)*r+12).toFixed(1)+'px');   // +12 : la gravité
    d.style.animationDuration=(0.42+Math.random()*0.22).toFixed(2)+'s';
    z.appendChild(d);
    (function(el){ setTimeout(function(){ if(el.parentNode)el.parentNode.removeChild(el); },700); })(d);
  }
}
function bulPop(b){
  if(b.pop)return;
  if(b.cible===false){  // leçon 7 : ce mot ne porte pas le signe — secousse + timbre doux, la bulle reste
    b.el.classList.remove('shk'); void b.el.offsetWidth; b.el.classList.add('shk');
    toc(); return;
  }
  b.pop=true;
  b.el.classList.add('pop');
  bulEclat(b.x,b.y);
  plop();
  BUL.reste--;
  var c=document.getElementById('bul-c');
  var tot=BUL.items.length;
  if(c){c.textContent=BUL.reste;c.classList.remove('tick');void c.offsetWidth;c.classList.add('tick');} // décompte, animation réarmée à chaque éclat
  setTimeout(function(){ if(b.el.parentNode)b.el.parentNode.removeChild(b.el); },360);
  var derniere=(BUL.reste<=0);
  setTimeout(function(){                          // le plop d'abord, le nom juste après
    sayLetterName(b.L, derniere?objectifAtteint:null);
    if(derniere){ if(c)c.textContent='✓'; objectifFilet(); }
  },80);
}

/* ═══ LA GRILLE DES 28 LETTRES ═══ */

/* Toucher un siège : il s'allume et il SONNE. La hamza seule dit son nom, les sièges
   disent la voyelle qu'ils permettent — c'est exactement ce que la hamza sert à faire. */
const HAMZA_SON={'ء':'ء','أ':'أَ','إ':'إِ','ؤ':'ؤُ','ئ':'ئِ'};
/* Toucher une des trois lettres faibles de l'écran « 2 rôles » : elle se fonce, elle SONNE,
   et ses sièges se posent en bas. Idempotent — retoucher la même lettre ne rejoue que le son
   et ne débloque pas deux fois le bouton. */
const SIEGES_DE_LETTRE={'ا':['أ','إ'],'و':['ؤ'],'ي':['ئ']};
function roleTap(el,L){
  try{ sayLetterName(L); }catch(e){}
  el.classList.add('lit');
  (SIEGES_DE_LETTRE[L]||[]).forEach(function(s){
    var c=document.querySelector('.rl-sieges .hz[data-s="'+s+'"]');
    if(!c||!c.classList.contains('vide'))return;
    c.classList.remove('vide'); c.classList.add('neuf');
    /* le siège se découvre au toucher, sans annotation (journal : index.html · annotations des sièges) */
    c.innerHTML=s;
    c.setAttribute('onclick','hamzaTap(this,\''+s+'\')');
  });
  if(!window._rl)window._rl=new Set();
  window._rl.add(L);
  if(window._rl.size>=3)document.getElementById('cta').disabled=false;
}
/* La ligne de la hamza dans les exercices, dès l'unité 2 (curU ≥ 1 : l'alif est enseigné).
   ⚠️ ces cases ne comptent pas : on y touche pour entendre (explorer n'est pas être évalué), jamais un
   cœur. (journal : index.html · la hamza dans les exercices) */
function hamzaRailHTML(){
  if(!(curU>=1))return '';
  // le siège est écrit EN ARABE (14/08) : aucune translittération sous un glyphe arabe
  var SIEGES=[['ء','seule',1],['أ','ا',1],['إ','ا',1],['ؤ','و',0],['ئ','ي',0]];
  return '<div class="lg-hamza ex-hamza">'+SIEGES.map(function(s){
    return s[2]
      ? '<div class="hz" onclick="hamzaTap(this,\''+s[0]+'\')">'+s[0]+'<span class="hzl">'+s[1]+'</span></div>'
      : '<div class="hz locked">'+s[0]+'<span class="hzl">'+s[1]+'</span></div>';
  }).join('')+'</div>';
}
function hamzaTap(el,s){
  try{ document.querySelectorAll('.lg-hamza .hz.lit').forEach(function(x){x.classList.remove('lit');}); }catch(e){}
  el.classList.add('lit');
  var t=HAMZA_SON[s]||s;
  if(s==='ء')sayLetterName('ء'); else speak(t);
}
/* Les 28 lettres en deux familles de 14 : un fait de la langue, pas une donnée de leçon (le Cours montre
   les deux listes entières). ☀️ solaire : le ل de l'article est muet, la lettre double (chedda) ;
   🌙 lunaire : le ل se prononce, il porte un soukoun. */
const SOLAIRES_14='تثدذرزسشصضطظلن';
const LUNAIRES_14=ALPHABET.map(function(e){return e[0];})
  .filter(function(L){return SOLAIRES_14.indexOf(L)<0;}).join('');
function estSolaire(L){ return SOLAIRES_14.indexOf(letterKey(L))>=0; }

/* ═══ LES TUTORIELS (moteur letterTut, coach marks) ═══ */
function letterTut(customSteps){
  var steps=(customSteps||[
    {t:function(){return document.querySelector('.lg-cell.locked');},ti:'Les lettres grises 🔒',tx:'Elles ne sont pas encore débloquées : elles s’ouvriront au fur et à mesure que tu termineras tes leçons.'},
    {t:function(){return document.querySelectorAll('.lg-cell.avail')[0];},ti:'Les lettres dorées',tx:'Ce sont les lettres que tu as débloquées dans tes leçons.'},
    {t:function(){var a=document.querySelectorAll('.lg-cell.avail');return a[Math.min(3,a.length-1)]||a[0];},ti:'Ton choix ✓',tx:'Touche une lettre dorée : elle passe en JAUNE FONCÉ, avec un ✓. Tu peux en prendre plusieurs.',enter:function(){var a=document.querySelectorAll('.lg-cell.avail');var c=a[Math.min(3,a.length-1)]||a[0];if(c&&!c.querySelector('.ck')){c.classList.remove('avail');c.classList.add('sel','coachdemo');c.insertAdjacentHTML('afterbegin','<span class="ck">✓</span>');}},leave:function(){var c=document.querySelector('.lg-cell.coachdemo');if(c){c.classList.remove('sel','coachdemo');c.classList.add('avail');var k=c.querySelector('.ck');if(k)k.remove();}}},
    /* le seul endroit où la hamza s'explique (Myriam) : pas de texte permanent à l'écran */
    {t:function(){return document.querySelector('.lg-hamza');},ti:'La hamza ء',
     tx:'L’alphabet compte <b>28 lettres</b>, et la hamza n’en fait pas partie : <b>elle n’a pas de forme à elle</b>.<br>Elle se pose toujours sur un <b>siège</b> — le alif (أ إ), le wāw (ؤ) ou le yāʾ (ئ).<br>Touche-la pour l’entendre.'},
    {t:function(){return document.querySelector('.lg-rev');},ti:'On révise ! 🌙',tx:'Appuie sur « Réviser » : tu traceras chaque lettre choisie sous toutes ses formes. Bismillah !'}
  ]).filter(function(x){return x.t();});
  if(!steps.length)return;
  var ov=document.getElementById('letterTut');
  if(!ov){ ov=document.createElement('div');ov.id='letterTut';
    ov.innerHTML='<div id="ltHole"></div><div id="ltBubble"><div class="lt-arrow" id="ltArrow"></div><div class="lt-t" id="ltTitle"></div><div class="lt-x" id="ltText"></div><div class="lt-row"><span class="lt-step" id="ltStep"></span><span class="lt-btns"><button class="lt-skip" id="ltSkip">Passer</button><button class="lt-next" id="ltNext"></button></span></div></div>';
    document.body.appendChild(ov);
    ov.querySelector('#ltSkip').onclick=function(){var c=ov._steps&&ov._steps[ov._si];if(c&&c.leave)try{c.leave();}catch(e){}ov.style.display='none';};
    ov.querySelector('#ltNext').onclick=function(){var c=ov._steps[ov._si];if(c&&c.leave)try{c.leave();}catch(e){}if(ov._si>=ov._steps.length-1){ov.style.display='none';return;}ov._si++;var n=ov._steps[ov._si];if(n&&n.enter)try{n.enter();}catch(e){}ov._place();};
  }
  ov._steps=steps;ov._si=0;if(steps[0]&&steps[0].enter)try{steps[0].enter();}catch(e){}
  ov._place=function(){
    var st=ov._steps[ov._si], el=st.t(); if(!el){ov.style.display='none';return;}
    try{el.scrollIntoView({block:'center'});}catch(e){}
    requestAnimationFrame(function(){
      var r=el.getBoundingClientRect(),pad=6;
      var hole=ov.querySelector('#ltHole');
      hole.style.top=(r.top-pad)+'px';hole.style.left=(r.left-pad)+'px';hole.style.width=(r.width+pad*2)+'px';hole.style.height=(r.height+pad*2)+'px';
      ov.querySelector('#ltTitle').textContent=st.ti;
      ov.querySelector('#ltText').innerHTML=st.tx;
      ov.querySelector('#ltStep').textContent=(ov._si+1)+' / '+ov._steps.length;
      ov.querySelector('#ltNext').textContent=(ov._si===ov._steps.length-1)?'C’est parti !':'Suivant →';
      var bub=ov.querySelector('#ltBubble'),arrow=ov.querySelector('#ltArrow');
      var bw=Math.min(290,window.innerWidth-24);bub.style.width=bw+'px';
      /* ⚠️ la hauteur réelle de la bulle est mesurée avant de choisir dessous ou dessus, jamais un seuil
         deviné. (journal : index.html · le tuto 4/5 débordait) */
      var bh=bub.offsetHeight||160, below=r.bottom+bh+12<window.innerHeight;
      var top=below?(r.bottom+pad+12):(r.top-pad-12-bh);
      /* ⚠️ et la bulle reste dans l'écran même si bh est mal estimée */
      top=Math.max(8,Math.min(top,window.innerHeight-bh-8));
      var left=Math.max(12,Math.min(window.innerWidth-bw-12,r.left+r.width/2-bw/2));
      bub.style.top=top+'px';bub.style.left=left+'px';
      var ax=Math.max(16,Math.min(bw-28,r.left+r.width/2-left-8));arrow.style.left=ax+'px';
      if(below){arrow.style.top='-9px';arrow.style.transform='rotate(45deg)';}else{arrow.style.top=(bh-8)+'px';arrow.style.transform='rotate(225deg)';}
    });
  };
  ov.style.display='block';setTimeout(ov._place,40);
}
function maybeShowLetterTut(){
  if(S.tutLetters)return;
  if(!document.querySelector('.lg-cell.avail'))return; // rien de débloqué : pas de tuto
  /* saveLocal, pas save : afficher un tuto n'est pas une progression, et save() rajeunit S._ts (règle
     complète : progression.js, au-dessus de saveLocal). (journal : index.html · les tutos et save) */
  S.tutLetters=1;saveLocal();
  letterTut();
}
function homeTut(){ letterTut([
  {t:function(){return document.querySelector('.unit-head');},ti:'Ton parcours 👋',tx:'Voici ta sourate et ton unité. Le bandeau reste en haut quand tu descends. Touche le ☰ pour changer de sourate.'},
  {t:function(){return document.querySelector('.node .bubble')||document.querySelector('.bubble');},ti:'Les leçons ✍️',tx:'Chaque bulle est une leçon. Touche la première pour commencer, bismillah !'},
  {t:function(){return document.getElementById('botnav');},ti:'Le menu 🧭',tx:'En bas : 🏠 Apprendre · 📕 Cours · 🕋 Réviser · 📊 Progrès.'}
]); }
/* saveLocal : ce tuto part au simple rendu de l'accueil, et save() y redaterait la progression avant que
   cloudPull arbitre. (journal : index.html · les tutos et save) */
function maybeShowHomeTut(){ if(!S.onboarded)return; if(S.tutHome)return; if(!document.querySelector('.unit-head'))return; S.tutHome=1;saveLocal(); homeTut(); }
/* Le tuto de la liste de vocabulaire (moteur letterTut) : une fois (S.tutVocab), le « ? » le rejoue. */
function vocabTut(){ letterTut([
  {t:function(){return document.querySelector('#view-reviser .wspk');},ti:'Écouter',
   tx:'Touche la ligne : le mot se dit.'},
  {t:function(){return document.querySelector('#view-reviser .wpen');},ti:'Écrire ✏️',
   tx:'Entraîne-toi quand tu veux. Ça ne compte pas dans tes révisions.'},
  {t:function(){return document.querySelector('#view-reviser .wdot:not(.off)');},ti:'Le point bleu',
   tx:'Ce mot fait partie de ta série d\u2019aujourd\u2019hui.'},
  {t:function(){return document.querySelector('#view-reviser .revcount');},ti:'Ta série 🌾',
   tx:'Le nombre de mots à revoir aujourd\u2019hui. Il descend à mesure que tu révises.'}
]); }
function maybeShowVocabTut(){
  if(S.tutVocab)return;
  if(!document.querySelector('#view-reviser .wpen'))return;   // liste vide : pas de tuto
  S.tutVocab=1; saveLocal();   /* afficher un tuto n'est pas une progression */
  setTimeout(vocabTut,320);
}
/* Le tuto de l'onglet Cours (moteur letterTut) : dit une fois ce qu'un sous-titre permanent disait
   (S.tutCours) ; le « ? » le rejoue. */
function coursTut(){ letterTut([
  {t:function(){return document.querySelectorAll('#view-cours .itab')[0];},ti:'Les vidéos 🎬',
   tx:'La leçon filmée de chaque unité.'},
  {t:function(){return document.querySelectorAll('#view-cours .itab')[1];},ti:'Le résumé 📖',
   tx:'Tes lettres, leurs sons, leur mot du Qorān.'},
  {t:function(){return document.querySelectorAll('#view-cours .itab')[2];},ti:'Le vocabulaire',
   tx:'Tous les mots que tu sais lire.'},
  {t:function(){return document.querySelector('#view-cours .ccard');},ti:'Une carte par unité',
   tx:'Elle s\u2019ajoute quand tu débloques l\u2019unité.'}
]); }
function maybeShowCoursTut(){
  if(S.tutCours)return;
  if(!document.querySelector('#view-cours .ccard'))return;   // aucune unité débloquée : pas de tuto
  S.tutCours=1; saveLocal();   /* afficher un tuto n'est pas une progression */
  setTimeout(coursTut,320);
}

/* ═══ LE MICRO : reconnaissance vocale (lecture à voix haute, modèle Duolingo) ═══ */
// ===== Reconnaissance vocale (lecture à voix haute, modèle Duolingo) =====
function normReco(s){
  return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z\u0600-\u06ff]/g,'').trim();
}
function recoMatch(said,w){
  const n=normReco(said);if(!n)return false;
  const arBare=normReco(w.b);
  if(n.includes(arBare)||arBare.includes(n))return true;
  return (w.alts||[w.say]).some(a=>{const na=normReco(a);return na&&(n.includes(na)||na.includes(n));});
}
function startReco(btn){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const fb=document.getElementById('recoFb');
  if(!SR){
    fb.innerHTML='<div class="reco-warn">🎤 Ton appareil ne permet pas d\u2019écouter ta voix ici. '+
      'Lis le mot à voix haute, puis confirme.</div>'+
      '<button class="cta" style="margin-top:10px" onclick="recoSelf()">✅ Je l\u2019ai lu</button>';
    return;
  }
  let rec;try{rec=new SR();}catch(e){recoSelf();return;}
  rec.lang='ar-SA';rec.interimResults=false;rec.maxAlternatives=5;
  btn.classList.add('listening');btn.innerHTML=icoImg('tab-micro','ic-inline')+' J\u2019écoute…';
  fb.innerHTML='<div class="hint">Parle maintenant…</div>';
  let got=false;
  rec.onresult=(ev)=>{
    got=true;const alts=[];
    for(let i=0;i<ev.results[0].length;i++)alts.push(ev.results[0][i].transcript);
    const ok=alts.some(a=>recoMatch(a,window._reco.w));
    btn.classList.remove('listening');btn.innerHTML=icoImg('tab-micro','ic-inline')+' Réessayer';
    if(ok){window._reco.ok=true;
      fb.innerHTML='<div class="reco-ok">✅ Très bien ! ماشاء الله</div>';
      speak(window._reco.w.w);ctaOn();
    }else{
      fb.innerHTML='<div class="reco-retry">🔁 Pas tout à fait — réécoute le modèle et réessaie.</div>'+
        '<button class="narr-link" style="margin-top:4px" onclick="recoSelf()">Valider quand même</button>';
    }
  };
  rec.onerror=(e)=>{
    btn.classList.remove('listening');btn.innerHTML=icoImg('tab-micro','ic-inline')+' Lis le mot';
    fb.innerHTML='<div class="reco-warn">🎤 Micro indisponible. Lis à voix haute puis confirme.</div>'+
      '<button class="cta" style="margin-top:10px" onclick="recoSelf()">✅ Je l\u2019ai lu</button>';
  };
  rec.onend=()=>{btn.classList.remove('listening');
    if(!got&&!window._reco.ok)btn.innerHTML=icoImg('tab-micro','ic-inline')+' Lis le mot';};
  try{rec.start();}catch(e){recoSelf();}
}
function recoSelf(){
  window._reco.ok=true;const fb=document.getElementById('recoFb');
  if(fb)fb.innerHTML='<div class="reco-ok">✅ Continue !</div>';
  speak(window._reco.w.w);ctaOn();
}
function recoSkip(){ctaOn();advance();}
