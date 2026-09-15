/* ═══════════════════════════════════════════════════════════════════════════
   LES GABARITS D'ÉCRAN DES UNITÉS 1 À 7 — ce qui répond au doigt pendant une leçon.
   Sorti d'index.html le 15/09/2026 (sous-lot 3 de « extraire le lecteur »), copié à
   l'identique.

   Ce que ce fichier contient, écran par écran (VÉRIFIÉ contre le code — le banc compare
   cette liste à ce que le fichier déclare vraiment) : le glisser-déposer (`setupDrag`,
   `setupDragAssoc`, `setupDragMad`, `draggable`, `fantomeDe`, `dansRect`, `setupPlace`),
   les tuiles qu'on assemble (`asmSaisie`, `asmTaper`, `asmReset`, `asmUndo`, `asmFini`,
   `asmAttendu`, `tileTap`, `renderSlots` — l'écriture guidée qui REFUSE une tuile fausse),
   le tri et la fusion (`setupTri`, `setupFuse`, `doCombine`), les choix au doigt (`hkTap`,
   `assocTap`, `cmpTap`, `fiTap`, `spotTap`, `reqTap`, `fsTap`, `fwTap`), la lecture
   (`setupRead`, `splitWord`, `splitUnits`, `letAr`, `chipHTML`, `cellText`, `LTRANS`), et
   les récompenses d'objectif (`toc`, `objectifAtteint`, `elogeHTML`, `mascotteDanse`).
   ⚠️ NE SONT PAS ICI, et c'est facile à confondre : `renderMatch`, `renderVt`, `renderVw`,
   `renderSt` et `comboBonneReponse` sont restés dans index.html ; `selOpt` est dans le
   lecteur (src/player/index.js).

   ⚠️ SCRIPT CLASSIQUE, ni `defer` ni `type="module"`, aucun `import`, aucun `export`.
   ⛔ POURQUOI CLASSIQUE, ET POURQUOI CHARGÉ AVANT LE GRAND SCRIPT. Aucun de ces gabarits
   n'est APPELÉ au chargement — je l'ai mesuré, et j'en avais conclu, à tort, qu'un module
   aurait fait l'affaire. Le harnais m'a contredit : sans ce fichier, l'accueil ne se peint
   pas du tout. La raison est ailleurs, et c'est le piège déjà payé au sous-lot 1 :
   `window.__alaqHoteU8 = { …, objectifAtteint, elogeHTML, toc, draggable, dansRectMarge, … }`
   (index.html) CAPTURE cinq de ces noms PAR RACCOURCI, au moment où cette ligne s'évalue.
   S'ils n'existent pas encore, c'est ReferenceError — et tout le script classique meurt avant
   l'accueil. Un module, différé, arriverait trop tard ; il faudrait convertir ces cinq
   raccourcis en accesseurs, comme `advance` l'a été. Tant que l'hôte les capture, ce fichier
   est classique et chargé AVANT. Le banc garde ce point précis, et le harnais le PROUVE en
   rechargeant la page sans lui.
   ⚠️ Et ils sont appelés par leur NOM NU depuis `renderStep`, `setupTrace`, les générateurs,
   le hub Réviser et trois `onclick` en ligne : un module devrait publier quarante-six alias.
   ✅ RIEN ICI NE S'EXÉCUTE AU CHARGEMENT : pas une ligne hors d'une fonction, pas un
   écouteur posé. Mesuré avant l'extraction, et gardé par le banc — c'est ce qui rend
   son chargement anticipé sans effet.

   ═══ LE CONTRAT — résolu À L'APPEL, jamais au chargement ═══
   Le SON, resté dans index.html : `jouerMot`, `sayLetterName`, `speak`, `playSfx`,
   `stopAudio`, `audioBeni`, `spkOn`/`spkOff`, `warmVoices`, `_speakSynth`, `_curAudio`,
   `_curUtter`, `_sndGen`, `_SFXB`, `VOIX_G`, `SND`, `NARR`.
   L'ÉTAT du joueur, resté dans index.html : `QUEUE`, `qi`, `answered`, `MISSED`,
   `inRetry`, `REVIEW`, `RECHARGE` — et `advance` (le lecteur, un module publié sur
   window). Plus `goNoHearts`, `objectifFilet`, `escHTML`, `tachCalque`, `tachRouge`.
   Les DONNÉES : `ALPHABET`, `ALIF_FAM`, `MD`, `MDH`, `DIA`, `formGlyph`, `letterKey`,
   `maddSyl` (donnees.js), `shuffle` (generateurs.js), `S` et `save` (progression.js).
   Gardes : outils/verifier-interactions.mjs, previews/_verif_interactions.html.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ================= INTERACTIONS ================= */
function popIt(el){el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');}
function ctaOn(){document.getElementById('cta').disabled=false;}
function signeHK(i){ // les 3 harakat DESSINÉES — épaisses et collées au disque (Myriam 07/08)
  return ['<span class="sign top"><i class="hbar"></i></span>',
          '<span class="sign bot"><i class="hbar"></i></span>',
          '<span class="sign top hi"><i class="hdam">و</i></span>'][i];
}
/* — la danse du fanous, calée sur les frappes RÉELLES du maqsūm (analysées le 07/08 :
     deux hauteurs, Dum grave −12 / sol −5, en Dum-tak-tak · Dum-tak-tak) — */
const FRAPPES_FIN=[[-5,0],[-12,210],[-12,320],[-5,460],[-12,675],[-12,785]];
let _mascT=[];
function mascotteStop(){_mascT.forEach(clearTimeout);_mascT=[];}
/* Une COPIE de la mascotte, posable ailleurs que sur l'écran de fin. Les id sont retirés
   (ils doivent rester uniques) ; seul le dégradé du halo garde un id, renommé, car il est
   référencé par `fill="url(#…)"` — un `url()` qui pointe dans un sous-arbre `display:none`
   ne peint rien de fiable. */
/* `mascotteHTML(suffixe)` (le clone de la mascotte) est SUPPRIMÉ le 14/08 : il n'existait que
   pour l'écran de récompense du vrai/faux, lui-même supprimé. #finish porte la mascotte
   d'origine — il n'y en a de nouveau qu'UNE, et plus de dégradé à renommer. */
function mascotteDanse(racine){   // racine = l'écran qui porte la mascotte (défaut : #finish)
  mascotteStop();
  const R=racine||document;
  const c=R.querySelector('.mcorps'),h=R.querySelector('.mhalo'),
        ba=R.querySelector('.mbassin'),jG=R.querySelector('.mjg'),jD=R.querySelector('.mjd');
  if(!c)return;
  const T=(f,ms)=>_mascT.push(setTimeout(f,ms));
  FRAPPES_FIN.forEach(([demi,ms],i)=>{
    const dum=demi<=-10;
    T(()=>{
      c.style.transition='transform .11s cubic-bezier(.3,1.6,.5,1)';
      c.style.transform='translateY(-'+(dum?18:8)+'px) scaleY(1.05)';
      T(()=>{c.style.transition='transform .16s';c.style.transform='translateY(0) scaleY('+(dum?.94:.98)+')';},110);
      T(()=>{c.style.transform='';},260);
      // le balancier du postérieur : SEUL le bas de la lanterne se déhanche
      ba.style.transform='rotate('+((i%2?1:-1)*(dum?10:6))+'deg)';
      T(()=>{ba.style.transform='rotate(0deg)';},140);
      jG.style.transform='rotate('+(dum?26:8)+'deg)';jD.style.transform='rotate('+(dum?-26:-8)+'deg)';
      T(()=>{jG.style.transform='rotate(15deg)';jD.style.transform='rotate(-15deg)';},150);
      h.style.transition='opacity .12s';h.style.opacity=dum?'.72':'.9';
      T(()=>{h.style.opacity='.55';},170);
    },ms);
  });
  T(()=>{ // le bouquet final, sur la dernière frappe — jamais sur une durée devinée
    h.style.transition='opacity .3s, transform .3s';h.style.opacity='1';h.style.transform='scale(1.45)';
    c.style.transition='transform .22s cubic-bezier(.3,1.7,.5,1)';c.style.transform='translateY(-16px) scale(1.05)';
    T(()=>{h.style.transition='opacity .8s, transform .8s';h.style.opacity='.55';h.style.transform='';
           c.style.transition='transform .35s';c.style.transform='';},340);
  },FRAPPES_FIN[FRAPPES_FIN.length-1][1]+40);
}
/* ===== Leçon 1 v2 (07/08) — récompense d'objectif, éloges, erreur ===== */
const ELOGES=[['مُمْتَاز','excellent'],['صَحِيح','juste'],['رَائِع','formidable'],['اللَّهُمَّ بَارِكْ','qu\u2019Allah te bénisse']];
let _elDernier=-1;
function elogeHTML(){ // jamais deux fois le même d'affilée — l'éloge écrit ENSEIGNE un mot
  let k;do{k=Math.floor(Math.random()*ELOGES.length);}while(k===_elDernier&&ELOGES.length>1);
  _elDernier=k;
  return '<span>✓</span> <span class="ar" style="font-size:20px">'+ELOGES[k][0]+'</span> <span class="elfr">('+ELOGES[k][1]+')</span>';
}
let _tocCtx=null;
function toc(){ // l'erreur : deux frappes du timbre Bayātī, +1,5 puis −1,5 (choix Myriam 07/08) ; l'oscillateur reste en secours
  if(!SND)return; // même règle que playSfx : le repli oscillateur doit se taire aussi
  if(_SFXB['erreur']){ playSfx('erreur'); return; }
  try{
    _tocCtx=_tocCtx||new (window.AudioContext||window.webkitAudioContext)();
    if(_tocCtx.state!=='running')_tocCtx.resume(); // iOS : ce contexte n'avait AUCUN resume
    const o=_tocCtx.createOscillator(),g=_tocCtx.createGain();
    o.frequency.setValueAtTime(170,_tocCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(110,_tocCtx.currentTime+.12);
    g.gain.setValueAtTime(.22,_tocCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,_tocCtx.currentTime+.16);
    o.connect(g);g.connect(_tocCtx.destination);o.start();o.stop(_tocCtx.currentTime+.17);
  }catch(e){}
}
function ctaOn2(){const c=document.getElementById('cta');if(c&&c.disabled){c.disabled=false;c.className='cta ok pope';}}
function objectifAtteint(){ // signature + éloge écrit + le bouton s'allume — une fois par écran
  if(window._objDone)return;window._objDone=true;
  /* 🔴 10/09 — LA MOITIÉ MANQUANTE DU RATTRAPAGE. La cascade classique retire
     l'écran de MISSED quand on le réussit EN RATTRAPAGE (ctaClick, src/player/ :
     `if(inRetry){…MISSED.splice(k,1)}`) ; les
     exercices du registre ne passent jamais par elle. Tant que MISSED restait vide
     en unités 9 et 10, personne ne pouvait s'en apercevoir. Depuis que les écrans
     ratés y entrent, l'absence de cette ligne rendait le rattrapage SANS FIN :
     finishDisque rouvrait la file des ratés, encore et encore, et la leçon ne se
     terminait jamais. Trouvé par le harnais de l'unité 10, qui a refusé de voir
     `S.done` posé. C'est le pendant exact de ecranRate() : l'un remplit, l'autre vide. */
  if(inRetry){ var _st=QUEUE[qi], _k=MISSED.indexOf(_st); if(_k>=0)MISSED.splice(_k,1); }
  playSfx('bonne-reponse');
  // le message de réussite sur CHAQUE écran (Myriam, 07/08 soir) — l'éloge enseigne un mot
  try{
    const fb=document.getElementById('fb'),foot=document.getElementById('p-foot');
    fb.className='fb ok';fb.innerHTML=elogeHTML();
    foot.classList.remove('bad');foot.classList.add('ok');
  }catch(e){}
  /* ── À 0 CŒUR, CONTINUER RIVE SUR « PLUS DE CŒURS » (unité 9, 23/08) ──────
     Même règle que la cascade classique (ctaClick, src/player/ : `S.hearts=Math.max(0,
     S.hearts-1)`), posée ICI et pas dans
     `ctaOn2` (qui allume aussi le bouton pour des écrans sans le moindre
     risque de cœur — spot, taprow, lecture de mot — où la question ne se
     pose jamais). Un exercice du REGISTRE peut perdre un cœur PENDANT qu'il
     est affiché (retry en place, plusieurs manches) — contrairement à un QCM
     classique, qui résout et ferme sa question en un seul geste. Sans cette
     ligne, le cœur se perdait pour de vrai mais CONTINUER envoyait quand
     même à l'écran suivant : la décision doit se prendre ICI, au moment où
     le bouton s'allume, jamais au moment où le cœur est perdu (un cœur perdu
     tôt dans un exercice à plusieurs manches serait sinon une décision
     PÉRIMÉE, agie bien après que l'exercice a été terminé avec succès).
     ⚠️ SAUF sur le TOUT DERNIER écran de la file (trouvé à l'audit du 23/08,
     avant qu'aucun disque ne l'atteigne) : `goNoHearts()` ne fait QUE fermer
     le lecteur, il n'appelle jamais `finishDisque()` — router vers lui à ce
     moment précis perdrait `S.done`, alors que l'exercice vient RÉUSSIR pour
     de vrai. La leçon finie doit compter, même à 0 cœur ; c'est la PROCHAINE
     leçon que `startDisque` bloquera normalement. */
  const cta=document.getElementById('cta');
  if(cta) cta.onclick=(!REVIEW&&!RECHARGE&&S.hearts<=0&&qi<QUEUE.length-1)?goNoHearts:advance;
  setTimeout(ctaOn2,150);
}
function quandSonFini(cb){ // rappelle cb à la fin du son EN COURS (filet 2,5 s : synthèse, silence)
  const gen=_sndGen;let done=false;
  const go=()=>{if(done||gen!==_sndGen)return;done=true;cb();};
  setTimeout(()=>{
    const a=_curAudio;
    if(a&&!a.paused&&!a.ended)a.addEventListener('ended',go,{once:true});
    setTimeout(go,2500);
  },150);
}
function jouerF(f,fallback,fin){ // un mp3 précis (voix IA), repli synthèse, rappel de fin
  // le sélecteur de voix vaut AUSSI ici : chaque « -f » a son jumeau « -h » (lot du 10/08) ;
  // madrasatoun garde son nom historique côté Habibah (cache MEDIA), le -h est un fichier neuf
  if(VOIX_G==='h')f=(f==='mot-madrasatoun.mp3')?'mot-madrasatoun-h.mp3':f.replace(/-f\.mp3$/,'-h.mp3');
  stopAudio();const gen=_sndGen;
  try{
    const a=audioBeni('audios-app-alaq/'+f);_curAudio=a;let ok=false,fini=false;
    const done=()=>{if(fini||gen!==_sndGen)return;fini=true;if(fin)fin();};
    const fb2=()=>{if(ok||gen!==_sndGen)return;ok=true;try{_speakSynth(fallback);}catch(_){}
      setTimeout(done,1100);};
    a.onended=()=>done();
    a.onerror=()=>fb2();
    a.addEventListener('playing',()=>{ok=true;},{once:true});
    const p=a.play();if(p&&p.catch)p.catch(fb2);
    // ⚠️ un chargement lent n'est PAS un fichier absent : on ne bascule en synthèse que
    // si rien n'a été téléchargé après 3,5 s (readyState 0 = même pas les métadonnées).
    setTimeout(()=>{if(!ok&&gen===_sndGen&&a.paused&&a.readyState===0)fb2();},3500);
    setTimeout(done,8000);   // filet : quoi qu'il arrive, la leçon ne se bloque jamais
  }catch(e){if(fin)fin();}
}
/* — écrans 7 / 7 bis : sélection libre, 3 max, VALIDER juge — */
/* 🔴 08/09 — CES SIX SYLLABES JOUAIENT LA VOIX DE L'IA, ET C'EST LA RÈGLE LA PLUS
   ABSOLUE DU PROJET QUI ÉTAIT ENFREINTE : une syllabe ne se génère JAMAIS par IA,
   sous aucune forme de repli — seule la voix de Myriam enseigne une prononciation.
   Signalé par elle le 08/09 : « j'y entends des sons qui ne sont pas de moi », sur
   ma · mi · mou et les prolongés maa · mii · mouu du disque 1 de l'unité 1.
   ⚠️ CE N'ÉTAIT PAS UNE RÉGRESSION NI UN CACHE : les données du disque et cette table
   NOMMAIENT les fichiers « -f » (les prises ElevenLabs) en dur. Or ces noms partent
   dans jouerF, qui — contrairement à jouerSyl — n'essaie JAMAIS le nom nu : son
   unique repli est la synthèse. Le chemin qui aurait retrouvé la voix de Myriam
   n'était donc jamais emprunté. Ses six prises existaient pourtant dans le dépôt ET
   en production (vérifié : servies en 200, empreintes distinctes des -f) : elles
   n'étaient simplement jamais demandées.
   MESURÉ : 12 références en dur, 6 ici et 6 dans les données du disque (l'audit n'en
   a trouvé aucune autre dans tout index.html). Le nom NU est la prise de Myriam ;
   le suffixe -f est la variante générée. */
const SYLF={'مَ':'mim-fatha-son-court.mp3','مِ':'mim-kasra-son-court.mp3','مُ':'mim-damma-son-court.mp3',
 'مَا':'mim-alif-son-prolonge.mp3','مِي':'mim-ya-son-prolonge.mp3','مُو':'mim-waw-son-prolonge.mp3'};
function ssSel(){return[...document.querySelectorAll('#g6 .b6.sel')];}
function ssTap(el){
  const w=window._ss;if(!w||w.fini)return;
  if(el.classList.contains('sel'))el.classList.remove('sel');
  else{
    if(ssSel().length>=3)return;
    el.classList.add('sel');
    jouerF(SYLF[el.dataset.t],el.dataset.t);
  }
  const n=ssSel().length;
  document.querySelectorAll('#g6 .b6').forEach(b=>b.classList.toggle('dim',n>=3&&!b.classList.contains('sel')));
  document.getElementById('cta').disabled=n!==3;
}
function ssValider(){
  const w=window._ss,cta=document.getElementById('cta'),foot=document.getElementById('p-foot'),fb=document.getElementById('fb');
  if(!w)return;
  if(w.fini){advance();return;}
  w.fini=true;
  if(ssSel().every(b=>b.dataset.ok==='1')){
    playSfx('bonne-reponse');
    fb.className='fb ok';fb.innerHTML=elogeHTML();
    foot.classList.add('ok');cta.className='cta ok';cta.textContent='CONTINUER';
  }else{
    toc();
    ssSel().forEach(b=>{if(b.dataset.ok!=='1'){b.classList.remove('sel');b.classList.add('wrong');}});
    // la correction : jamais laisser l'élève sur l'erreur seule — les bonnes s'allument
    document.querySelectorAll('#g6 .b6').forEach(b=>{if(b.dataset.ok==='1'){b.classList.add('sel');b.classList.remove('dim');}});
    document.getElementById('ssCorr').innerHTML=w.st.corr;
    foot.classList.add('bad');cta.className='cta bad';cta.textContent='J\u2019AI COMPRIS';
  }
  cta.onclick=advance;
}
/* — écrans 3 / 6 : le glisser-fusionner — */
/* ══ Le glisser générique de la leçon 7 (11/08) — même mécanique que setupFuse :
   fantôme suivi au doigt, cible qui se remplit, son de la syllabe, récompense à la fin. */
/* ═══ C'EST LE DISQUE ENTIER QUI SE DÉPLACE (Myriam, 14/08, leçon 6) ═══
   « Pour ceux qui ont des problèmes de vue, il est préférable que ce soit le disque complet
   qui se déplace, et pas seulement l'ombre de la tachkīl, car elle est peu visible. »
   Le fantôme n'était qu'un CARACTÈRE nu de 60 px : sous le doigt, une ḍamma fait quelques
   pixels et la moitié est cachée par le doigt lui-même. Il est désormais un CLONE de la
   pastille — même boîte, même bordure, même fond — figé à sa taille mesurée pour que rien
   ne saute au décollage. Règle §12 (une vue abîmée) : ce qu'on déplace doit avoir la taille
   de ce qu'on a touché. */
/* Le fabricant de fantôme, UN pour les quatre glisser de l'app (14/08) — `draggable`
   (harakat posées, tri), `setupFuse` (leçons 6 et « Les prolongations ») et `setupDrag`
   (les formes). Il y avait quatre créations de fantôme recopiées : j'ai corrigé la première
   et Myriam aurait retrouvé le même défaut sur les trois autres. */
function fantomeDe(el){
  var r=el.getBoundingClientRect();
  var g=el.cloneNode(true); g.removeAttribute('id'); g.classList.add('drag-clone');
  g.style.width=r.width+'px'; g.style.height=r.height+'px';
  document.body.appendChild(g); return g;
}
function draggable(el,texte,surLache){
  var ghost=null,drag=false;
  var xy=function(e){var t=(e.touches&&e.touches[0])||(e.changedTouches&&e.changedTouches[0])||e;return[t.clientX,t.clientY];};
  var mv=function(x,y){if(ghost){ghost.style.left=x+'px';ghost.style.top=y+'px';}};
  var start=function(e){e.preventDefault();drag=true;var c=xy(e);
    ghost=fantomeDe(el);mv(c[0],c[1]);el.style.opacity=.35;};
  var move=function(e){if(!drag)return;e.preventDefault();var c=xy(e);mv(c[0],c[1]);};
  var end=function(e){if(!drag)return;drag=false;
    if(ghost){ghost.remove();ghost=null;}el.style.opacity=1;
    var c=xy(e);surLache(c[0],c[1]);};
  el.addEventListener('touchstart',start,{passive:false});
  el.addEventListener('touchmove',move,{passive:false});
  el.addEventListener('touchend',end);
  el.addEventListener('mousedown',start);
  window.addEventListener('mousemove',move);
  window.addEventListener('mouseup',end);
}
function dansRect(x,y,el){ var r=el.getBoundingClientRect(); return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom; }
/* La même chose, avec une MARGE (14/08 — « la sensibilité des box pourrait être améliorée au
   toucher »). Une cible d'écriture arabe fait souvent 30 px de large ; le doigt en couvre 45
   et le point de contact rendu par le navigateur est le centre de la pulpe, pas le bout du
   doigt. 18 px de tolérance, c'est ce qui sépare « j'ai visé juste » de « ça n'a pas pris ».
   ⚠️ La marge ne rend jamais deux cibles ambiguës ici : elles sont empilées avec plus de
   36 px d'écart, et le premier candidat trouvé est le plus haut. */
function dansRectMarge(x,y,el,m){ var r=el.getBoundingClientRect(); m=m||18;
  return x>=r.left-m&&x<=r.right+m&&y>=r.top-m&&y<=r.bottom+m; }
function setupPlace(st){
  var chip=document.getElementById('sigchip'); if(!chip)return;
  draggable(chip,function(){return st.chip;},function(x,y){
    var c=[].slice.call(document.querySelectorAll('#grps .grp')).filter(function(g){
      return !g.classList.contains('done')&&dansRectMarge(x,y,g.querySelector('.gcib')); })[0];
    if(!c)return;                                   // le أَ n'est jamais une cible : rien ne se passe
    var g=st.grps[+c.dataset.k];
    c.classList.add('done'); c.querySelector('.gcib').textContent=g.fin; popIt(c);
    window._pl.n++;
    var fin=(window._pl.n>=window._pl.tot)?objectifAtteint:null;
    speak(g.pre+g.fin);                             // la syllabe : carte AUDIO, synthèse en repli
    if(fin){ setTimeout(fin,700); objectifFilet(); }
  });
}
function setupTri(){
  [].slice.call(document.querySelectorAll('#trirow .chipmot')).forEach(function(chip){
    draggable(chip,function(){return chip.dataset.w;},function(x,y){
      if(chip.classList.contains('gone'))return;
      var p=[].slice.call(document.querySelectorAll('.panier')).filter(function(pa){return dansRect(x,y,pa);})[0];
      if(!p)return;
      if(p.dataset.cle===chip.dataset.cle){
        chip.classList.add('gone');
        var sp=document.createElement('span'); sp.textContent=chip.dataset.w;
        /* 14/08 (correctifs 4) — Myriam : « on doit pouvoir retirer un mot une fois placé si
           on s'est trompé, tant qu'on n'a pas tout placé ». `reste` est relu AU CLIC (pas
           figé à la pose) : une fois le dernier mot posé, tous les mots redeviennent fixes
           d'un coup, sans qu'il faille les reparcourir un par un. */
        sp.onclick=function(){
          if(window._tri.reste<=0)return;
          sp.remove(); chip.classList.remove('gone'); window._tri.reste++;
        };
        p.querySelector('.pmots').appendChild(sp); popIt(p);
        window._tri.reste--;
        var fin=(window._tri.reste<=0)?objectifAtteint:null;
        sayLetterName(chip.dataset.w,fin);
        if(fin)objectifFilet();                 // ceinture : le bouton ne reste JAMAIS gris
      }else{
        chip.classList.remove('shake'); void chip.offsetWidth; chip.classList.add('shake');
        toc();                                      // erreur d'exploration : le timbre, jamais un cœur
      }
    });
  });
}
function setupFuse(st){
  const cells=[...document.querySelectorAll('#fuzone .mimC')];
  document.querySelectorAll('#fuzone .fchip').forEach(chip=>{
    const j=st.jeux[+chip.dataset.k];
    let ghost=null,drag=false;
    const xy=e=>{const t=(e.touches&&e.touches[0])||(e.changedTouches&&e.changedTouches[0])||e;return[t.clientX,t.clientY];};
    const mv=(x,y)=>{if(ghost){ghost.style.left=x+'px';ghost.style.top=y+'px';}};
    const start=e=>{e.preventDefault();drag=true;const[x,y]=xy(e);
      ghost=fantomeDe(chip);mv(x,y);chip.style.opacity=.35;};   // le DISQUE entier, pas le signe nu (14/08)
    const move=e=>{if(!drag)return;e.preventDefault();const[x,y]=xy(e);mv(x,y);};
    const end=e=>{if(!drag)return;drag=false;
      if(ghost){ghost.remove();ghost=null;}chip.style.opacity=1;
      const[x,y]=xy(e);
      const c=cells.find(c2=>{const r=c2.getBoundingClientRect();
        return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom&&!c2.classList.contains('done');});
      if(!c)return;
      /* 17/08 — `tachCalque` et non `tachRouge` : le signe est POSÉ SUR SA LETTRE, donc
         seul le calque peut le colorer sans emporter la lettre avec lui (Myriam : « seule
         la harakat reste bleue, la lettre garde sa couleur initiale »). */
      c.classList.add('done');c.innerHTML=tachCalque(j.fus);popIt(c);
      chip.classList.add('gone');
      const fl=chip.parentNode.querySelector('.farr');if(fl)fl.classList.add('gone');
      window._fu.n++;
      const finF=window._fu.n>=window._fu.tot?objectifAtteint:null;
      if(j.son)jouerF(j.son,j.fus,finF);      // leçon 1 : fichiers nommés explicitement (-f/-h)
      else sayLetterName(j.fus,finF);         // leçons 5/6 : la syllabe (Habibah → Myriam en repli)
      if(finF)objectifFilet();
    };
    chip.addEventListener('touchstart',start,{passive:false});
    chip.addEventListener('touchmove',move,{passive:false});
    chip.addEventListener('touchend',end);
    chip.addEventListener('mousedown',start);
    window.addEventListener('mousemove',move);
    window.addEventListener('mouseup',end);
  });
}
function reqTap(key,el){
  speak(key);popIt(el);
  window._req[key]=(window._req[key]||0)+1;
  const min=window._reqMin;
  const n=Math.min(min,window._req[key]);
  const d=el.querySelector('.dots');
  if(d)d.textContent=('● '.repeat(n)+'○ '.repeat(min-n)).trim();
  if(Object.values(window._req).every(v=>v>=min))ctaOn();
}
/* ═══ LE لا EST UNE SEULE CASE — CORRECTIF DU 14/08 ═══
   Myriam, leçon 5 : « le لا n'est pas correct sur cette écriture dans le dernier verset ».
   Dans وَلَا, le lām et le alif tombaient dans DEUX <span> voisins ; ils s'affichaient alors
   en deux hampes droites côte à côte au lieu de la ligature لا — et, le alif étant une
   lettre-cible de l'unité 2, la moitié du signe était même dorée et l'autre non.
   La cause n'est pas le CSS : la ligature lām-alif est OBLIGATOIRE en arabe, aucun ZWJ ne la
   reconstitue par-dessus une frontière d'élément. Un caractère ne peut donc pas être découpé
   n'importe où — لا est UN signe, et il devient UNE case.
   ⚠️ Conséquence assumée : une case لا vaut UNE cible même si les deux lettres sont visées.
   Le cas ne se présente dans aucune unité (le ل et le ا ne sont jamais enseignés ensemble),
   et découper la ligature pour compter juste casserait l'écriture — c'est le mauvais échange. */
function splitWord(w){
  const cl=[];
  for(const ch of w){
    if(ch.match(DIA)&&cl.length){ cl[cl.length-1].m+=ch; continue; }
    const p=cl[cl.length-1];
    if(p&&p.b==='ل'&&!p.lig&&ALIF_FAM.includes(ch)){ p.lig=ch; continue; }
    cl.push({b:ch,m:'',lig:''});
  }
  return cl;
}
// Le texte RENDU d'une case : base + ses signes + l'éventuel alif de la ligature.
function cellText(c){ return c.b+c.m+(c.lig||''); }
// Les lettres qu'une case porte — une case لا en porte deux.
function cellBases(c){ return c.lig?[c.b,c.lig]:[c.b]; }
function doCombine(res){
  const r=document.getElementById('cmbR');
  document.getElementById('cmbA').classList.add('merge');
  document.getElementById('cmbB').classList.add('merge');
  setTimeout(()=>{r.textContent=res;r.classList.add('pop');speakFr(res);ctaOn();},250);
}
function hkTap(i,el){
  speak(['أَ','إِ','أُ'][i]); // les voyelles nues = LA VOIX DE MYRIAM (décision 07/08)
  el.classList.add('lit');popIt(el);
  window._hk.add(i);
  if(window._hk.size>=3){ quandSonFini(objectifAtteint); objectifFilet(); }
}
function assocTap(i,el){
  const a=window._as;
  let syl;
  if(a.set===MD){ // prolongation : son étiré (enregistrement مَا/مِي/مُو, repli synthèse)
    const m=a.set[i][0];
    syl=a.L+m;
    speak(maddSyl(a.L,m));
  } else {
    syl=a.L+a.set[i][0];
    speak(syl);
  }
  popIt(el);
  document.getElementById('ares'+i).textContent=syl;
  el.classList.add('lit');
  if(!window._asSet)window._asSet=new Set();window._asSet.add(i);
  if(window._asSet.size>=a.set.length){ctaOn();}
}
function tsTap(L,el){
  popIt(el);el.classList.add('seen');
  window._ts.add(L);
  if(window._ts.size>=window._tsN&&!window._tsG){window._tsG=true;
    // objectif atteint : le reste de la grille s'estompe mais RESTE cliquable (curiosité)
    document.querySelectorAll('.ts-card').forEach(c=>{if(!c.classList.contains('seen'))c.classList.add('dim');});}
  sayLetterName(L);
  if(window._ts.size>=window._tsN){ quandSonFini(objectifAtteint); objectifFilet(); }
}
function setupDrag(L){
  const src=document.getElementById('dragSrc');if(!src)return;
  const cells=[...document.querySelectorAll('.fourc')];
  let ghost=null,dragging=false;
  /* l'aide des 10 s : garde par #dragSrc — le body est écrasé à chaque écran, le rappel meurt seul */
  function dragInvite(on){ if(!document.getElementById('dragSrc'))return;
    src.classList.toggle('invite',on);
    cells.forEach(c=>c.classList.remove('invite'));
    // UNE seule case s'invite (Myriam 10/08 : « toutes se sont illuminées d'un coup ») —
    // la première encore libre, dans l'ordre début·milieu·fin·isolée
    if(on){ const cible=cells.find(c=>!c.classList.contains('lit')); if(cible)cible.classList.add('invite'); } }
  let hintT=null;
  function armerInvite(){ clearTimeout(hintT); hintT=setTimeout(function(){
    dragInvite(true);
    setTimeout(function(){ dragInvite(false); armerInvite(); },3600); // 3 pulsations puis silence, et on ré-arme
  },10000); }
  armerInvite();
  function makeGhost(x,y){
    ghost=fantomeDe(src);   // la PASTILLE de la lettre, pas la lettre nue (14/08) — déjà posée dans le body
    moveGhost(x,y);
  }
  function moveGhost(x,y){if(ghost){ghost.style.left=x+'px';ghost.style.top=y+'px';}}
  function cellAt(x,y){
    return cells.find(c=>{const r=c.getBoundingClientRect();
      return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;});
  }
  function drop(x,y){
    const c=cellAt(x,y);
    if(c){
      const pos=+c.dataset.pos;
      const slot=document.getElementById('fc'+pos);
      slot.textContent=formGlyph(L,pos);slot.style.color='var(--gold)';
      c.classList.add('lit');popIt(slot);
      sayLetterName(L);   // le NOM de la lettre à chaque pose (Myriam 07/08)
      window._fsl.add(pos);
      if(window._fsl.size>=4){ quandSonFini(objectifAtteint); objectifFilet(); }
    }
  }
  function xy(e){const t=(e.touches&&e.touches[0])||(e.changedTouches&&e.changedTouches[0])||e;return[t.clientX,t.clientY];}
  function start(e){e.preventDefault();clearTimeout(hintT);dragInvite(false);dragging=true;const[x,y]=xy(e);makeGhost(x,y);src.style.opacity=.35;}
  function move(e){if(!dragging)return;e.preventDefault();const[x,y]=xy(e);moveGhost(x,y);
    cells.forEach(c=>c.classList.remove('hover'));const c=cellAt(x,y);if(c)c.classList.add('hover');}
  function end(e){if(!dragging)return;dragging=false;const[x,y]=xy(e);drop(x,y);
    cells.forEach(c=>c.classList.remove('hover'));src.style.opacity=1;
    if(ghost){ghost.remove();ghost=null;}
    if(window._fsl.size<4)armerInvite();} // toujours bloquée après un essai : l'aide reviendra
  src.addEventListener('touchstart',start,{passive:false});
  src.addEventListener('touchmove',move,{passive:false});
  src.addEventListener('touchend',end);
  src.addEventListener('mousedown',start);
  window.addEventListener('mousemove',move);
  window.addEventListener('mouseup',end);
}
function fsTap(el,L,ok){
  const fb=document.getElementById('fb'),foot=document.getElementById('p-foot');
  if(ok){
    if(el.classList.contains('hit'))return;
    el.classList.add('hit');window._fs.found++;updFs();
    fb.className='fb';fb.innerHTML='';foot.classList.remove('bad');   // la bonne pioche efface le rouge
    sayLetterName(L);   // le NOM, comme partout ailleurs dans la leçon
    if(window._fs.found>=window._fs.need){ quandSonFini(objectifAtteint); objectifFilet(); }
  }
  else{
    if(el.classList.contains('miss'))return; // anti-rafale : pas 2 cœurs sur un double-tap de la même lettre
    el.classList.add('miss');toc();
    fb.className='fb bad';fb.innerHTML='<span>✕</span> Essaie encore';
    foot.classList.add('bad');
    setTimeout(()=>el.classList.remove('miss'),400);
    if(!REVIEW&&!RECHARGE){ // même règle que ctaClick : ni la révision ni la recharge ne coûtent de cœur
      S.hearts=Math.max(0,S.hearts-1);save();
      document.getElementById('p-hearts').textContent=S.hearts;
      document.getElementById('st-hearts').textContent=S.hearts;
      if(S.hearts<=0)document.getElementById('cta').onclick=goNoHearts; // à 0 : CONTINUER mènera à « Plus de cœurs »
    }
  }
}
function fwTap(el,ok,L){
  if(L)sayLetterName(L);            // toute lettre touchée dit son nom (demande Myriam 03/08)
  if(ok){if(!el.classList.contains('hit')){el.classList.add('hit');window._fs.found++;updFs();}}
  else{el.classList.add('miss');setTimeout(()=>el.classList.remove('miss'),400);}
}
function updFs(){
  const c=document.getElementById('fs-c');
  c.textContent=window._fs.found+' / '+window._fs.need;
  if(window._fs.found>=window._fs.need){
    c.textContent='✓';
    document.querySelectorAll('.agrid .ag').forEach(b=>{if(!b.classList.contains('hit'))b.classList.add('dim');});
  }
}
function cmpTap(i,el,short,long){
  // son court puis son long étiré : enregistrements de la voix (repli synthèse si fichier absent)
  speak(short);
  setTimeout(()=>speak(long),900);
  el.classList.add('lit');
  window._cmp.add(i);if(window._cmp.size>=window._cmpN)ctaOn();
}
function setupRead(st){
  const box=document.getElementById('readbox');if(!box)return;
  const cells=[...box.querySelectorAll('.rc')];
  const N=cells.length;
  try{ // la main balaie le MOT : centre de la 1re et de la dernière lettre (sens de lecture)
    if(N){const rb=box.getBoundingClientRect(),
      r0=cells[0].getBoundingClientRect(),r1=cells[N-1].getBoundingClientRect();
      box.style.setProperty('--hx0',(r0.left+r0.width/2-rb.left-26)+'px');
      box.style.setProperty('--hx1',(r1.left+r1.width/2-rb.left-26)+'px');}
  }catch(e){}
  // ordre de lecture : RTL -> de l'index 0 (à droite) vers la fin
  let next=0;
  // toutes les lettres partent grises : c'est le doigt qui révèle (07/08)
  if(N<=1){window._rd.done=true;ctaOn();const h0=document.getElementById('readHand');if(h0)h0.style.display='none';}
  let painting=false;
  function zoneIndex(x){
    // position RÉELLE de chaque lettre (les glyphes n'ont pas la même largeur) + tolérance de 6 px
    for(let i=0;i<N;i++){ const r=cells[i].getBoundingClientRect(); if(x>=r.left-6&&x<=r.right+6)return i; }
    // doigt au-delà de la dernière lettre dans le sens de lecture -> dernière (la fin ne bloque plus)
    const last=cells[N-1].getBoundingClientRect();
    if(st.dir==='rtl' ? x<last.left : x>last.right) return N-1;
    return -1;
  }
  function finish(){
    if(window._rd.done)return;
    window._rd.done=true;
    jouerF('mot-madrasatoun.mp3',st.word); // مَدْرَسَةٌ — par le pool béni (iOS)
    const ar=document.getElementById('readArrow');if(ar)ar.style.display='none';
    const hm=document.getElementById('readHand');if(hm)hm.style.display='none';
    quandSonFini(objectifAtteint);       // le bouton attend la fin du mot
  }
  function markAt(x){
    const idx=zoneIndex(x);
    // le doigt peut sauter des zones entre deux événements : on colore TOUT jusqu'à lui (sens de lecture)
    if(idx>=next){
      for(let k=next;k<=idx;k++)cells[k].classList.add('on');
      next=idx+1;
      if(next>=N)finish();
    }
  }
  function px(e){const t=(e.touches&&e.touches[0])||(e.changedTouches&&e.changedTouches[0])||e;return t.clientX;}
  function down(e){e.preventDefault();painting=true;
    const h=document.getElementById('readHand');if(h)h.style.display='none'; // le geste est compris
    markAt(px(e));}
  function move(e){if(!painting)return;e.preventDefault();markAt(px(e));}
  function up(e){ if(painting&&e){try{markAt(px(e));}catch(_){}} painting=false; }
  box.addEventListener('touchstart',down,{passive:false});
  box.addEventListener('touchmove',move,{passive:false});
  box.addEventListener('touchend',up);
  box.addEventListener('mousedown',down);
  box.addEventListener('mousemove',move);
  box.addEventListener('mouseup',up);
  box.addEventListener('mouseleave',up);
}
function bestVoice(lang){
  try{
    const vs=speechSynthesis.getVoices().filter(v=>v.lang&&v.lang.toLowerCase().startsWith(lang));
    if(!vs.length)return null;
    const nice=vs.find(v=>/siri|premium|enhanced|natural|amélie|aurélie|thomas|amelie|marie|audrey/i.test(v.name));
    return nice||vs[0];
  }catch(e){return null;}
}
function speakFr(t,isNarr){ // consignes françaises — même mécanique de relance que _speakSynth (utterance neuve)
  try{
    const allowed=isNarr?NARR:SND;
    if(!allowed||!('speechSynthesis'in window))return;
    stopAudio();
    const gen=_sndGen;
    const mk=()=>{
      const u=new SpeechSynthesisUtterance(t);u.lang='fr-FR';u.rate=.95;u.pitch=1.05;u.volume=1;
      const v=bestVoice('fr');if(v)u.voice=v;
      u.onend=u.onerror=()=>{ if(_curUtter===u)_curUtter=null; };
      return u;
    };
    let started=false;
    const fire=()=>{
      if(started||gen!==_sndGen)return;
      try{ if(speechSynthesis.speaking||speechSynthesis.pending)speechSynthesis.cancel(); }catch(e){}
      try{speechSynthesis.resume();}catch(e){}
      const u=mk();
      u.onstart=()=>{ started=true; };
      _curUtter=u;
      try{speechSynthesis.speak(u);}catch(e){}
      try{speechSynthesis.resume();}catch(e){}
    };
    fire(); setTimeout(fire,4000); // même loi de patience que _speakSynth (12/07c)
  }catch(e){}
}
function fiTap(el,L){
  speak(L);popIt(el);
  el.classList.add('done');
  if(!el.dataset.t){el.dataset.t=1;window._fi++;}
  if(window._fi>=4)ctaOn();
}
function spotTap(el,ok){
  if(ok&&!el.classList.contains('hit')){
    el.classList.add('hit');window._spot.found++;
    const c=document.getElementById('spot-c');
    const reste=window._spot.need-window._spot.found;
    if(c){c.textContent=reste>0?reste:'✓';c.classList.remove('tick');void c.offsetWidth;c.classList.add('tick');} // le MÊME décompte que les bulles
    if(window._spot.found>=window._spot.need){ stopAudio(); objectifAtteint(); } // récompense uniforme : signature + éloge + CONTINUER vert
  } else if(!ok){
    el.classList.add('miss');setTimeout(()=>el.classList.remove('miss'),400);
    toc(); // la marque sonore de l'erreur, comme partout
  }
}
function splitUnits(word){
  // sépare chaque lettre de base et chaque harakat comme une unité distincte
  const HARAKAT='\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652'; // ـًـٌـٍـَـُـِـّـْ
  const out=[];
  for(const ch of word){
    if(HARAKAT.includes(ch))out.push(ch); else out.push(ch);
  }
  return out;
}
function isHarakat(ch){
  return '\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652'.includes(ch);
}
/* Une consigne qui NOMME une lettre l'écrit en arabe, jamais en phonétique (Myriam 11/08,
   « mettre la lettre en arabe pas en phonétique — valable sur toutes les slides de ce type »).
   Le nom translittéré (mīm, lām…) reste sur l'écran « L'alphabet », où il s'APPREND. */
function letAr(L){ return '<span class="ar">'+L+'</span>'; }
function chipAff(ch){ // une harakat NUE est portée sur un tatweel — lisible partout (leçon 5 v3 validée ; unifie AUSSI la leçon 1)
  return /^[\u064B-\u0652]$/.test(ch)?'\u0640'+ch:ch;
}
/* \u2550\u2550\u2550 17/08 \u2014 LES SIGNES QUI SE DESSINENT SOUS LA LIGNE \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   La kasra (U+0650) et la kasratayn (U+064D) se posent SOUS la ligne de base ; toutes les
   autres marques du jeton sont au-dessus (fat\u1E25a, \u1E0Damma, soukoun, chedda, dhammatayn).
   \u26A0\uFE0F Le motif est \u00E9crit en \u00C9CHAPPEMENTS, jamais avec les caract\u00E8res arabes en clair : une
   classe de caract\u00E8res arabes tap\u00E9e litt\u00E9ralement dans ce fichier ne matche rien, et le
   test passe alors en ne testant RIEN (pi\u00E8ge v\u00E9cu deux fois cette semaine).
   \u26A0\uFE0F La kasratayn n'appara\u00EEt dans AUCUN jeton aujourd'hui \u2014 elle est l\u00E0 pour que le jour
   o\u00F9 elle arrive, elle h\u00E9rite du bon traitement sans que personne y pense.
   \u26A0\uFE0F LE TEST PORTE SUR LA SORTIE DE `chipAff`, ET C'EST CE QUI LE REND S\u00DBR : il exige le
   cluster COMPLET \u00AB tatweel + marque sous la ligne \u00BB. Il accepte donc les deux \u00E9critures qui
   arrivent (la marque nue, \u00E0 qui `chipAff` pose le tatweel, et la forme d\u00E9j\u00E0 compos\u00E9e fa\u00E7on
   `TAT+SUK`), et il REFUSE tout le reste \u2014 une lettre portant une kasra (\u0628\u0650) prendrait sinon
   la branche \u00E0 deux couches, qui \u00E9crirait un trait nu en couche 1 et la lettre clipp\u00E9e en
   couche 2 : rendu faux et silencieux. Refus\u00E9e, elle retombe sur le chemin d'avant. */
var CHIP_SOUS_LIGNE=/^\u0640[\u064D\u0650]$/;
function chipSousLigne(ch){ return CHIP_SOUS_LIGNE.test(chipAff(String(ch==null?'':ch))); }
/* Le contenu du jeton. Un signe SOUS la ligne r\u00E9clame deux couches (voir le pav\u00E9 CSS
   `.fchip .tach.fk`) : le trait seul, puis le cluster entier d\u00E9cal\u00E9. Tout le reste \u2014
   les signes au-dessus, et les LETTRES de la le\u00E7on des prolongations \u2014 passe par
   `tachRouge` exactement comme avant, donc leur rendu valid\u00E9 ne bouge pas d'un pixel. */
function chipHTML(ch){
  var aff=chipAff(ch);
  if(!chipSousLigne(ch))return tachRouge(aff);
  // `aff` ne peut porter qu'un tatweel et une marque arabe : rien \u00E0 \u00E9chapper ici.
  return '<span class="tach">\u0640</span><span class="tach fk">'+aff+'</span>';
}
function tileLabel(ch){
  const HARAKAT='\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652';
  // harakat seule : portée sur un tatweel (ـ), qui appartient à la police arabe et
  // accroche le signe de façon fiable partout (le cercle pointillé ◌ manque sur desktop).
  if(HARAKAT.includes(ch))return '<span class="dc">\u0640'+ch+'</span>';
  return ch;
}
function renderSlots(){
  const s=document.getElementById('slots');if(!s)return;
  const a=window._asm;
  const done=a.ch.join('');
  const rest='·'.repeat(a.t.length-a.ch.length);
  s.innerHTML=done+'<span class="ph">'+rest+'</span>';
}
function asmAttendu(a){ // les unités acceptées à cette position — harakat d'une même lettre : ordre LIBRE (retour Myriam 10/08, équivalence canonique)
  const pos=a.ch.length, att=a.t[pos];
  if(att===undefined)return [];
  if(!isHarakat(att))return [att];
  let debut=pos; while(debut>0&&isHarakat(a.t[debut-1]))debut--;
  let fin=pos; while(fin<a.t.length&&isHarakat(a.t[fin]))fin++;
  const reste=a.t.slice(debut,fin);
  a.ch.slice(debut).forEach(p=>{const i=reste.indexOf(p); if(i>-1)reste.splice(i,1);});
  return reste;
}
/* ═══ LA ZONE DE SAISIE DE L'ÉCRITURE GUIDÉE (04/09) ═══════════════════════
   Myriam : « le clavier de révision doit être sur le même modèle qui vient
   d'être défini pour les leçons (une ligne toujours complète avec des
   distracteurs et les harakats en bleu sur une autre ligne) ».

   🔴 CE QUE LA GRILLE DE TUILES AVAIT DE FAUX, ET CE N'ÉTAIT PAS QU'UNE ALLURE.
   Elle offrait EXACTEMENT les unités du mot, mélangées, sans un seul leurre :
   le nombre de touches TRAHISSAIT la réponse, et sur un mot d'une ou deux
   unités l'écran ne pouvait tout simplement pas échouer — بِ donnait deux
   tuiles, toutes deux justes. C'est le défaut signalé pour le harf le 04/09.
   Le clavier, lui, complète toujours ses deux rangées (`tailleDeRangee`) avec
   des distracteurs qui RESSEMBLENT aux lettres du mot.
   🔴 ET UNE TOUCHE NE SE CONSOMME PLUS. Une tuile disparaissait après usage ;
   une touche reste. C'est ce qu'il faut : بَابٌ porte DEUX ب, et un clavier
   qui s'épuise ne saurait pas l'écrire.
   ⚠️ REPLI ASSUMÉ SUR L'ANCIENNE GRILLE : le module ES arrive APRÈS ce script
   classique. Un écran ouvert avant son chargement doit rester JOUABLE, jamais
   blanc — le piège « écran blanc, console propre » que ce projet connaît bien.
   Le repli garde donc son `onclick="tileTap(...)"` et sa consommation. */
function asmSaisie(mot,units){
  const K=window.__alaqClavier;
  if(K){
    K.poserCSSClavier();
    /* `commandes:true` pose ⌫ Effacer et ↺ Recommencer SOUS le clavier — jamais
       de VALIDER ici : le bouton du pied valide (règle du 31/08, un seul bouton). */
    return K.clavierPourMot(mot,{id:'asm',commandes:true});
  }
  return '<div class="tiles" id="tiles">'+shuffle(units.map((ch,i)=>({ch,i}))).map((o,k)=>
    '<button class="tile'+(isHarakat(o.ch)?' htile':'')+'" id="tile'+k+'" data-ch="'+o.ch+'" onclick="tileTap('+k+',\''+o.ch+'\')">'+tileLabel(o.ch)+'</button>').join('')+
    '<button class="tile tdel" onclick="asmUndo()" aria-label="Effacer">⌫</button></div>';
}
/* La touche qui porte un caractère donné. Les signes vivent sur `data-signe`
   (une CLÉ, 'fatha'…) et non sur le caractère : la touche AFFICHE un tatweel
   porteur et INSÈRE la marque nue — sans quoi la saisie porterait le tatweel
   et toutes les bonnes réponses seraient refusées, en silence. */
function asmTouche(ch){
  const K=window.__alaqClavier; if(!K)return null;
  const cle=K.cleDuSigne(ch);
  const sel=cle?'#asmHarakat .clv-touche':'#asmLettres .clv-touche';
  return [...document.querySelectorAll(sel)].find(t=>cle?t.dataset.signe===cle:t.dataset.l===ch)||null;
}
/* La frappe au clavier — MÊME contrat que tileTap : une touche fausse est
   REFUSÉE (jamais de graphie fausse à l'écran), elle coûte un cœur hors
   révision, et au 2e refus la bonne touche s'éclaire. */
function asmTaper(ch){
  const a=window._asm;
  if(!a||a.fini||answered||a.ch.length>=a.t.length)return;
  const acceptes=asmAttendu(a);
  const t=asmTouche(ch);
  if(!acceptes.includes(ch)){
    if(t){ if(t.classList.contains('miss'))return; // anti-rafale : pas 2 cœurs sur un double-tap
      t.classList.add('miss'); setTimeout(()=>t.classList.remove('miss'),400); }
    toc();
    a.rate=(a.rate||0)+1;
    if(a.rate>=2){ asmHintOff();
      const bon=acceptes.map(asmTouche).find(Boolean); if(bon)bon.classList.add('hint'); }
    if(!REVIEW&&!RECHARGE){
      S.hearts=Math.max(0,S.hearts-1);save();
      document.getElementById('p-hearts').textContent=S.hearts;
      document.getElementById('st-hearts').textContent=S.hearts;
      if(S.hearts<=0)document.getElementById('cta').onclick=goNoHearts;
    }
    return;
  }
  a.rate=0; asmHintOff();
  a.ch.push(ch);          // ⚠️ la touche n'est PAS désactivée : un mot peut redemander la même lettre
  renderSlots();
  if(a.ch.length===a.t.length)asmFini();
}
/* ↺ Recommencer — le clavier en offre le bouton, l'écran doit savoir répondre. */
function asmReset(){
  const a=window._asm;
  if(!a||a.fini||answered||!a.ch.length)return;
  a.ch.length=0;a.rate=0;asmHintOff();
  document.querySelectorAll('#tiles .tile').forEach(t=>{t.disabled=false;delete t.dataset.used;}); // le repli seul en a besoin
  renderSlots();
}
function tileTap(k,ch){ // v3 (10/08 tard) : tuile fausse REFUSÉE — jamais de graphie fausse (règle du ✏️) ; harakat en ordre libre
  const a=window._asm;
  if(!a||a.fini||answered||a.ch.length>=a.t.length)return;
  const acceptes=asmAttendu(a);
  const t=document.getElementById('tile'+k);
  if(!acceptes.includes(ch)){
    if(t){ if(t.classList.contains('miss'))return; // anti-rafale : pas 2 cœurs sur un double-tap (fsTap)
      t.classList.add('miss'); setTimeout(()=>t.classList.remove('miss'),400); }
    toc();
    a.rate=(a.rate||0)+1;
    if(a.rate>=2){ // 2e refus au même emplacement : la bonne tuile s'éclaire (l'indice de Myriam)
      asmHintOff();
      const bon=[...document.querySelectorAll('#tiles .tile')].find(x=>!x.disabled&&acceptes.includes(x.dataset.ch));
      if(bon)bon.classList.add('hint');
    }
    if(!REVIEW&&!RECHARGE){ // même règle que fsTap : ni la révision ni la recharge ne coûtent de cœur
      S.hearts=Math.max(0,S.hearts-1);save();
      document.getElementById('p-hearts').textContent=S.hearts;
      document.getElementById('st-hearts').textContent=S.hearts;
      if(S.hearts<=0)document.getElementById('cta').onclick=goNoHearts;
    }
    return;
  }
  a.rate=0; asmHintOff();
  a.ch.push(ch);
  if(t){t.disabled=true;t.dataset.used=a.ch.length;}
  renderSlots();
  if(a.ch.length===a.t.length)asmFini();
}
function asmHintOff(){document.querySelectorAll('#tiles .tile.hint,.clv-touche.hint').forEach(x=>x.classList.remove('hint'));}
function asmFini(){ // complet — donc juste : récompense uniforme, le mot se rejoue, CONTINUER attend la fin du son
  const a=window._asm;a.fini=true;
  if(window._objDone)return;window._objDone=true;
  playSfx('bonne-reponse');
  try{
    const fb=document.getElementById('fb'),foot=document.getElementById('p-foot');
    fb.className='fb ok';fb.innerHTML=elogeHTML();
    foot.classList.remove('bad');foot.classList.add('ok');
  }catch(e){}
  if(!a.fromFr&&a.w.fr){ // la traduction se révèle à la réussite — centrée tuiles↔bandeau, sans emoji (Myriam 10/08)
    const dv=document.createElement('div'); dv.className='asm-fr'; dv.textContent=a.w.fr;
    document.getElementById('p-body').appendChild(dv);
  }
  setTimeout(()=>jouerMot(a.w.w,ctaOn2,document.getElementById('asmSpk')),380);
}
function asmUndo(){
  const a=window._asm;
  if(!a||a.fini||answered||!a.ch.length)return;
  const n=a.ch.length;a.ch.pop();a.rate=0;asmHintOff();
  [...document.querySelectorAll('.tile')].forEach(t=>{
    if(t.dataset.used==n){t.disabled=false;delete t.dataset.used;}});
  renderSlots();
}

/* tracé */
const MADD_SOUND={'ا':'le son « a »','و':'le son « ou »','ي':'le son « i »'};
function errorBeep(){
  if(!SND)return;
  try{
    const Ctx=window.AudioContext||window.webkitAudioContext; if(!Ctx)return;
    const ac=window._ac||(window._ac=new Ctx());
    if(ac.state!=='running')ac.resume(); // iOS : couvre aussi l'état « interrupted »
    const t=ac.currentTime, o=ac.createOscillator(), g=ac.createGain();
    o.type='square'; o.frequency.setValueAtTime(200,t);
    o.frequency.exponentialRampToValueAtTime(110,t+0.18);
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.13,t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.24);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t+0.26);
  }catch(e){}
}
function setupDragAssoc(st){
  const wrap=document.getElementById('da-wrap'); if(!wrap)return;
  const cells=[...wrap.querySelectorAll('.da-cell')];
  const tiles=[...wrap.querySelectorAll('.da-tile')];
  let done=0;
  const cellUnder=(tile)=>{
    const tb=tile.getBoundingClientRect(), cx=tb.left+tb.width/2, cy=tb.top+tb.height/2;
    return cells.find(c=>{const r=c.getBoundingClientRect();return cx>r.left&&cx<r.right&&cy>r.top&&cy<r.bottom;});
  };
  tiles.forEach(tile=>{
    let dragging=false,sx=0,sy=0;
    const down=e=>{ if(tile.classList.contains('placed'))return; dragging=true; tile.classList.add('drag');
      const p=e.touches?e.touches[0]:e; sx=p.clientX; sy=p.clientY;
      try{ if(e.pointerId!=null)tile.setPointerCapture(e.pointerId);}catch(_){}
      e.preventDefault(); };
    const move=e=>{ if(!dragging)return; const p=e.touches?e.touches[0]:e;
      tile.style.transform='translate('+(p.clientX-sx)+'px,'+(p.clientY-sy)+'px) scale(1.1)';
      const c=cellUnder(tile); cells.forEach(cc=>cc.classList.toggle('over',cc===c&&!cc.classList.contains('done')));
      e.preventDefault(); };
    const up=e=>{ if(!dragging)return; dragging=false; tile.classList.remove('drag');
      const c=cellUnder(tile); cells.forEach(cc=>cc.classList.remove('over'));
      if(c && !c.classList.contains('done') && c.dataset.madd===tile.dataset.ch){
        tile.style.transform=''; tile.classList.add('placed');
        c.innerHTML='<span class="da-long">'+c.dataset.long+'</span>'; c.classList.add('done');
        // chaque pose SONNE (règle §6.3 du cerveau) — et `speak` coupe déjà le son précédent
        // si l'élève enchaîne sur une autre prolongation (Myriam, 14/08)
        warmVoices(); speak(c.dataset.say); done++;
        /* Plus AUCUNE récompense sous l'exercice (Myriam 13/08 : « les récompenses sous les
           associations sont inutiles »). Le contrat est celui de tous les écrans : on pose,
           le bouton s'allume, l'éloge discret vit dans la div du bas. */
        wrap.dataset.refus=0;
        /* ⚠️ 14/08 — « le bouton continuer s'affiche après la fin du DERNIER son ».
           `objectifAtteint` commence par `playSfx`, donc par `stopAudio()` : lancé tout de
           suite, il coupait la syllabe qu'on venait de former. Le filet 2,8 s reste en
           soupape si le rappel de fin se perd (cas gravé le 13/08). */
        if(done>=cells.length){ quandSonFini(objectifAtteint); objectifFilet(); }
      } else {
        tile.style.transition='transform .25s ease'; tile.style.transform='';
        setTimeout(()=>{tile.style.transition='';},260);
        if(c && !c.classList.contains('done')){ toc();
          /* même contrat que partout : au 2ᵉ refus, la bonne tuile respire en doré */
          var r=(parseInt(wrap.dataset.refus||'0',10))+1; wrap.dataset.refus=r;
          if(r>=2)tiles.forEach(function(x){ if(!x.classList.contains('placed')&&x.dataset.ch===c.dataset.madd)x.classList.add('hint'); });
        } }
      };
    tile.addEventListener('pointerdown',down);
    tile.addEventListener('pointermove',move);
    tile.addEventListener('pointerup',up);
    tile.addEventListener('pointercancel',up);
  });
}
function setupDragMad(st){
  const wrap=document.getElementById('dm-wrap'); if(!wrap)return;
  const target=document.getElementById('dm-target');
  let solved=false;
  const tiles=[...wrap.querySelectorAll('.dm-tile')];
  const overTarget=(tile)=>{
    const tr=target.getBoundingClientRect(), tb=tile.getBoundingClientRect();
    const cx=tb.left+tb.width/2, cy=tb.top+tb.height/2;
    return cx>tr.left&&cx<tr.right&&cy>tr.top&&cy<tr.bottom;
  };
  tiles.forEach(tile=>{
    let dragging=false,sx=0,sy=0;
    const down=e=>{ if(solved||tile.classList.contains('placed'))return;
      dragging=true; tile.classList.add('drag');
      const p=e.touches?e.touches[0]:e; sx=p.clientX; sy=p.clientY;
      try{ if(e.pointerId!=null)tile.setPointerCapture(e.pointerId); }catch(_){}
      e.preventDefault(); };
    const move=e=>{ if(!dragging)return;
      const p=e.touches?e.touches[0]:e;
      tile.style.transform='translate('+(p.clientX-sx)+'px,'+(p.clientY-sy)+'px) scale(1.12)';
      target.classList.toggle('over',overTarget(tile));
      e.preventDefault(); };
    const up=e=>{ if(!dragging)return; dragging=false; tile.classList.remove('drag');
      const ok=overTarget(tile); target.classList.remove('over');
      if(ok && tile.dataset.ch===st.answer){
        solved=true; tile.style.transform='';
        tile.classList.add('placed');
        /* 14/08 (correctifs 4) — plus de tachRouge() ici : `.tach` colore maintenant le
           cluster ENTIER (lettre + signe, seule façon qui shape juste — voir la fonction), et
           l'imbriquer dans `.dm-res` (vert, la couleur de la réussite) le peindrait rouge en
           entier. Le signe s'est déjà vu en rouge pendant la pose ; le résultat reste vert,
           sans ambiguïté sur ce que la couleur veut dire. */
        target.innerHTML='<span class="dm-res">'+escHTML(st.result)+'</span>';
        target.classList.add('done');
        /* Plus de récompense sous l'exercice, plus de pavé d'explication avec son bouton
           « J'ai compris » (Myriam 13/08). Contrat unique : on pose, la syllabe SONNE,
           le bouton s'allume et l'éloge discret vit dans la div du bas. */
        /* 14/08 — « quand la prolongation est glissée et les lettres transformées, ça doit
           jouer le son PUIS afficher le bouton continuer à la fin du son. » */
        warmVoices(); speak(st.say);
        quandSonFini(objectifAtteint); objectifFilet();
      } else {
        tile.style.transition='transform .25s ease'; tile.style.transform='';
        setTimeout(()=>{tile.style.transition='';},260);
        if(ok){ // déposée sur la cible, mais mauvaise prolongation
          toc();
          var r=(parseInt(wrap.dataset.refus||'0',10))+1; wrap.dataset.refus=r;
          if(r>=2)tiles.forEach(function(x){ if(x.dataset.ch===st.answer)x.classList.add('hint'); });
        }
      } };
    tile.addEventListener('pointerdown',down);
    tile.addEventListener('pointermove',move);
    tile.addEventListener('pointerup',up);
    tile.addEventListener('pointercancel',up);
  });
}
function okBeep(kind){ // sons de réussite (WebAudio, aucun fichier nécessaire)
  if(!SND)return;
  try{
    const Ctx=window.AudioContext||window.webkitAudioContext; if(!Ctx)return;
    const ac=window._ac||(window._ac=new Ctx());
    if(ac.state!=='running')ac.resume(); // iOS : couvre aussi l'état « interrupted »
    const t=ac.currentTime;
    const notes=kind==='final'?[[523,0],[659,.09],[784,.18]]:kind==='dot'?[[880,0]]:[[587,0],[880,.08]];
    notes.forEach(n=>{
      const o=ac.createOscillator(),g=ac.createGain();
      o.type='sine';o.frequency.setValueAtTime(n[0],t+n[1]);
      g.gain.setValueAtTime(0.0001,t+n[1]);
      g.gain.exponentialRampToValueAtTime(0.13,t+n[1]+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,t+n[1]+0.22);
      o.connect(g);g.connect(ac.destination);o.start(t+n[1]);o.stop(t+n[1]+0.24);
    });
  }catch(e){}
}
/* ===== TRACÉ GUIDÉ =====
   Le doigt doit suivre le chemin de la lettre (données strokes, police Noto Sans
   Arabic = écriture linéaire d'apprentissage). Le trait se dore au fur et à mesure ;
   point vert + flèche de départ AUTO-DÉRIVÉS du premier segment (plus de données
   starts à calibrer). Les points (nuqat) se posent en touchant leur cercle. */
/* ===== SON de la lettre (et non son nom) : joué en fin de tracé/démo. Prêt pour tes
   enregistrements lettre-<translit>-son.mp3 ; repli synthèse tant qu'ils n'existent pas. ===== */
const LTRANS={'ا':'alif','ب':'ba','ت':'ta','ث':'tha','ج':'jim','ح':'hha','خ':'kha','د':'dal','ذ':'dhal','ر':'ra','ز':'zay','س':'sin','ش':'shin','ص':'sad','ض':'dad','ط':'tta','ظ':'dha','ع':'ayn','غ':'ghayn','ف':'fa','ق':'qaf','ك':'kaf','ل':'lam','م':'mim','ن':'nun','ه':'ha','و':'waw','ي':'ya'};
/* — les 28 noms préchargés à l'entrée d'une leçon (latence, 07/08 soir) : le son part AU
   TOUCHER. Sans cela, chaque toucher créait un <audio> neuf ; fichier lent → 1,1 s
   d'attente puis repli sur Majed, la voix homme de l'iPhone — le « Mehdi » entendu. — */
var _LN={},_LNg='';
function prechargerNoms(){
  if(_LNg===VOIX_G)return; _LNg=VOIX_G; _LN={};
  try{
    ALPHABET.forEach(function(a){ var tr=LTRANS[letterKey(a[0])]; if(!tr)return;
      /* 17/08 — ON PRÉCHARGE SA PRISE (nom PLAT), plus la variante IA. */
      var el=new Audio('audios-app-alaq/lettre-'+tr+'-nom.mp3'); el.preload='auto'; _LN[tr]=el; });
  }catch(e){}
}
/* `fin` : rappelé quand CE son est terminé. `el` : le haut-parleur dont les ondes bougent
   pendant qu'il joue — allumé APRÈS stopAudio(), qui les éteint toutes.
   ⚠️ RÈGLE : « allumer le bouton après le son » passe TOUJOURS par `fin`, JAMAIS par
   quandSonFini() armé AVANT l'appel : celui-ci capture le jeton audio du moment, que
   stopAudio() incrémente aussitôt — il se croit alors périmé et n'allume plus rien. */
/* ══ LES SYLLABES (leçons 5 & 6, refonte du 10/08) ══
   sayLetterName reçoit indifféremment une LETTRE (→ son nom) ou une SYLLABE
   (→ l'enregistrement <translit>-<signe>-son-court/prolonge). La voix choisie (-f Habibah)
   d'abord, la voix de Myriam (fichier nu) en repli — la synthèse ne vient qu'en tout
   dernier secours : sur une syllabe isolée elle improvise (règle gravée du 07/08). */
const HKF={'\u064E':'fatha','\u0650':'kasra','\u064F':'damma'};
const MDF={'ا':'alif','ي':'ya','و':'waw'};
/* ⚠️ Les enregistrements de SYLLABES portent l'ANCIEN nommage pour deux lettres :
   LTRANS dit nun/ayn, les fichiers disent noun-/ain- (attrapé par l'audit du 10/08 —
   sans ça le ن de l'unité 1 partait en synthèse). */
const SYLTR={'nun':'noun','ayn':'ain'};
function sylBase(s){
  if(typeof s!=='string')return null;
  if(s==='آ')return 'alif-alif-son-prolonge';   // alif madda = la prolongation du hamza
  if(s.length<2||s.length>3)return null;
  var tr=LTRANS[letterKey(s[0])]; if(!tr)return null;
  tr=SYLTR[tr]||tr;
  if(s.length===2&&HKF[s[1]])return tr+'-'+HKF[s[1]]+'-son-court';
  if(s.length===3&&MDF[s[2]]&&s[1]===MDH[s[2]])return tr+'-'+MDF[s[2]]+'-son-prolonge';
  return null;
}
function jouerSyl(base,ar,fin,el){
  stopAudio();
  spkOff(); spkOn(el);
  var gen=_sndGen, fini=false;
  var termine=function(){ if(fini||gen!==_sndGen)return; fini=true; spkOff(); if(fin)fin(); };
  /* 17/08 — SA PRISE D'ABORD (nom plat), la variante de voix en repli. Même motif que
     sayLetterName : elle a réenregistré 72 syllabes, elles étaient toutes derrière l'IA. */
  var essais=['audios-app-alaq/'+base+'.mp3','audios-app-alaq/'+base+'-'+VOIX_G+'.mp3'];
  var tente=function(i){
    if(gen!==_sndGen)return;
    if(i>=essais.length){ try{_speakSynth(ar);}catch(_){ } setTimeout(termine,900); return; }
    var a=audioBeni(essais[i]); _curAudio=a; var ok=false, passe=false;
    /* ⚠️ UN SEUL avancement par tentative : sur un 404, 'error' ET p.catch tombent tous
       les deux — sans le verrou, la syllabe suivante jouait EN DOUBLE (audit du 10/08). */
    var suivant=function(){ if(ok||passe||gen!==_sndGen)return; passe=true; tente(i+1); };
    a.addEventListener('playing',function(){ok=true;},{once:true});
    a.onended=termine;
    a.onerror=suivant;
    var p=a.play(); if(p&&p.catch)p.catch(suivant);
    setTimeout(function(){ if(!ok&&gen===_sndGen&&a.paused&&a.readyState===0)suivant(); },1400);
  };
  tente(0);
  setTimeout(termine,3200);  // filet : le rappel finit toujours par venir (bulles, séquences)
}
