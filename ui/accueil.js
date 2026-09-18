/* ui/accueil.js — l'accueil : renderHome (une section par unité, ses disques, l'anneau du
   disque courant, « AVANCER ICI ? », les grisés « À venir »), le bandeau d'unité (setBanner,
   onHomeScroll), la popup d'un disque (discTip), le recentrage (focusCurrentDisc,
   _homeFocusPending), la barre du haut (refreshStats) et des aides partagées : toAr,
   sujetCours, discLabel, discImg, insecables, arEnveloppe, iconFallback.
   Script classique, chargé sous parcours.js et avant le grand script, ni defer ni module :
   la dernière ligne du grand script, showTab('home'), appelle renderHome() en synchrone et
   peint l'accueil sans scintillement. ⛔ Rien d'un autre script n'est lu au chargement.
   À L'APPEL : UNITS, SOURATES, unitAccent (donnees.js) · curSourate (revision.js) ·
   S, dkey, unitValidated (progression.js) · discsFor (parcours.js) · ICONES (assets.js) ·
   startDisque, startExam (src/player, module : lecteurPret() prévient s'il manque) ·
   arReveal, currentLesson, lecteurPret, openSurahMenu (index.html) ·
   maybeShowHomeTut (bulles-tutoriels.js) ·
   updRankBadge, maybeGhufranPrompt (constance.js).
   Dans l'autre sens, progression.js réassigne _homeFocusPending (let partagé entre scripts).
   Gardes : outils/verifier-interface.mjs, previews/_verif_interface.html. */

const OFFS=[0,46,64,46,0,-46,-64,-46,0];
function refreshStats(){
  document.getElementById('st-streak').textContent=S.streak;
  updRankBadge();
  document.getElementById('st-hearts').textContent=S.hearts;
}
/* table portée aux 12 unités (journal : ui/accueil.js · toAr, le « 8 » latin) */
function toAr(n){return ['','١','٢','٣','٤','٥','٦','٧','٨','٩','١٠','١١','١٢'][n]||n;}
/* le sujet d'une unité sans lettres, prêt pour le HTML : segments arabes enveloppés */
function sujetCours(U){
  return String(U.court||'Grammaire').replace(/[\u0600-\u06FF]+/g,function(m){return '<span class="csar">'+m+'</span>';});
}
function discLabel(d,U){return d.label.indexOf('{L}')>=0?d.label.replace('{L}',U.letters.join(' ')):d.label;}
/* variante dorée ou verrouillée, sans filtre d'inversion ; ⚠️ le nom du verrouillé est dérivé
   de celui du doré : renommer l'un sans l'autre casse les verrouillés (journal : ui/accueil.js · discImg) */
function discImg(d,unlocked){ return 'images-app-alaq/'+(unlocked?ICONES['disq-or']:ICONES['disq-verrou'])+d.img+'.png'; }
/* Un disque touché ouvre une popup COMMENCER / REFAIRE ; re-toucher le disque ou toucher
   ailleurs la referme (journal : ui/accueil.js · discTip). */
function discTipClose(){
  var t=document.querySelector('.disc-tip');
  if(t){ var n=t._node; t.remove(); if(n)n.style.zIndex=''; }
}
function discTip(node,u,i,label,done){
  var old=document.querySelector('.disc-tip'), same=(old&&old._node===node);
  discTipClose(); if(same)return;
  var tip=document.createElement('div'); tip.className='disc-tip'; tip._node=node;
  tip.innerHTML='<div class="dt-t"></div><button class="dt-go">'+(done?'REFAIRE':'COMMENCER')+'</button>';
  tip.querySelector('.dt-t').innerHTML=label;
  tip.querySelector('.dt-go').onclick=function(ev){ev.stopPropagation();discTipClose();
    /* le lecteur est un module : lecteurPret() prévient s'il n'est pas encore là */
    if(!lecteurPret())return;
    startDisque(u,i);};
  tip.addEventListener('click',function(ev){ev.stopPropagation();});
  /* .node est positionné : sans ceci, les disques suivants se peignent par-dessus la popup */
  node.style.zIndex='30';
  node.querySelector('.bwrap').appendChild(tip);
}
document.addEventListener('click',function(e){
  var t=document.querySelector('.disc-tip');
  if(t&&!e.target.closest('.disc-tip')&&!e.target.closest('.bubble'))discTipClose();
});
/* la popup se ferme au premier geste de défilement, sinon elle le gelait ; écouteurs passifs */
window.addEventListener('scroll',discTipClose,{passive:true});
window.addEventListener('wheel',discTipClose,{passive:true});
window.addEventListener('touchmove',discTipClose,{passive:true});

// Si l'image d'un disque ne charge pas (réseau/cache), on retombe sur l'emoji d'origine — jamais un disque vide.
function iconFallback(im,ic){try{var s=document.createElement('span');s.textContent=ic;im.replaceWith(s);}catch(e){}}
// L'accueil s'ouvre sur la première leçon de l'unité en cours (à l'arrivée, au retour d'une
// leçon, après restauration du nuage), jamais pendant que l'élève fait défiler.
let _homeFocusPending=true;
/* ⚠️ Repère : currentLesson() (première leçon non terminée d'une unité débloquée). « Disque 0
   fait » ne dit pas « unité en cours » (une unité à un disque est alors finie) : ce n'est que le
   repli quand tout est fini, pour montrer la dernière unité bouclée plutôt que le sommet.
   (journal : ui/accueil.js · focusCurrentDisc) */
function focusCurrentDisc(){
  const L=currentLesson();
  let u=L?L.u:-1;
  if(u<0) for(let k=0;k<UNITS.length;k++){ if(S.done&&S.done[dkey(k,0)])u=k; }
  if(u<0)return; // rien commencé : l'écran reste au sommet, sur l'unité 1
  const sec=document.querySelector('#home .unit-sec[data-u="'+u+'"]');
  if(!sec)return;
  // Le HAUT de la section se cale juste sous le bandeau sticky, pas au centre (le centre remontait
  // la fin de l'unité précédente) ; la hauteur du bandeau est mesurée, jamais devinée.
  setTimeout(function(){
    try{
      const bn=document.getElementById('unitBanner');
      setBanner(u); // AVANT de mesurer : sa hauteur dépend du texte de CETTE unité
      // ⚠️ Pas bn.getBoundingClientRect() : tant que la page n'a pas défilé, le bandeau sticky
      // n'est pas épinglé et son rectangle est faux. On part de son `top` CSS calculé + sa hauteur.
      const pinnedTop=bn?parseFloat(getComputedStyle(bn).top)||0:0;
      const pinnedBottom=bn?pinnedTop+bn.offsetHeight:0;
      const gap=2; // onHomeScroll (plus bas dans ce fichier) tolère 6px : rester nettement en dessous
      const delta=sec.getBoundingClientRect().top-pinnedBottom-gap;
      window.scrollBy({top:delta});
      setBanner(u); // filet : si un évènement scroll asynchrone a déjà tout recalculé
    }catch(e){}
  },80);
}
function renderHome(){
  const h=document.getElementById('home');
  h.innerHTML='';
  const SR=SOURATES[(typeof curSourate!=='undefined'?curSourate:0)]||SOURATES[0];
  const vN=(SR.verses?SR.verses.length:7);
  setTimeout(maybeShowHomeTut,300);
  setTimeout(function(){try{maybeGhufranPrompt();}catch(e){}},500);
  // ---- Bandeau UNIQUE façon Duolingo : un seul encadré collé en haut,
  //      dont le contenu change au défilement quand un séparateur d'unité passe dessous.
  h.insertAdjacentHTML('beforeend',
    '<div class="unit-head" id="unitBanner" data-u="0">'+
      '<div class="uh-main">'+
        '<div class="uh-top" id="uhTop"></div>'+
        '<h2 id="uhTitle"></h2>'+
      '</div>'+
      '<button class="uh-burger" onclick="openSurahMenu()" aria-label="Changer de sourate">☰</button>'+
    '</div>');
  const BANNERS=[]; window._homeBanners=BANNERS;
  UNITS.forEach((U,u)=>{
    // VALIDATION d'une unité = terminer son DERNIER disque, le « Bilan ».
    // L'unité suivante se débloque dès que le « Bilan » de la précédente est terminé.
    // « Avancer ici » (à la fin de CHAQUE unité) = RACCOURCI test-out : réussir ce test (≤ 2 erreurs) valide tout jusqu'à cette unité INCLUSE.
    const prevValidated = U.no===1 || unitValidated(u-1);
    const playable = !!U.ready && prevValidated;
    const lettersAr=(U.letters||[]).join(' ');
    /* une unité dit son sujet : ses lettres, ou son `court` si elle n'en a pas
       (journal : ui/accueil.js · renderHome, « Les lettres » écrit en dur) */
    const sujet=lettersAr
      ? 'Lettres <span class="uh-let">'+lettersAr+'</span>'
      : arEnveloppe(insecables(U.court||'Grammaire'),'uh-let');
    const sujetSep=lettersAr
      ? 'Les lettres <span class="us-let">'+lettersAr+'</span>'
      : arEnveloppe(insecables(U.court||'Grammaire'),'us-let');
    BANNERS.push({
      top:'CHAPITRE '+toAr(SR.no||1)+' \u00b7 UNIT\u00c9 '+toAr(U.no),
      title:'<span class="uh-l1">'+sujet+' \u2014 '+arReveal('sourate','\u0633\u0648\u0631\u0629')+' '+arReveal(SR.nom,SR.ar)+'</span><span class="uh-sub2"><span class="uh-ar">'+SR.ar+'</span> \u00b7 '+vN+' versets</span>'
    });
    const sec=document.createElement('div');sec.className='unit-sec';sec.dataset.u=u;sec.style.setProperty('--accent',unitAccent(u));
    // S\u00e9parateur fin et gris\u00e9 avant chaque unit\u00e9 (sauf la 1re, remplac\u00e9e par le bandeau).
    if(u>0){
      sec.insertAdjacentHTML('beforeend',
        '<div class="unit-sep"><span class="us-t">UNIT\u00c9 '+toAr(U.no)+' \u00b7 '+sujetSep+'</span></div>');
    }
    const path=document.createElement('div');path.className='path';
    const discs=discsFor(u);
    // Un seul disque « courant » par unité : le premier débloqué non terminé (porte l'anneau doré).
    let frontier=-1;
    for(let k=0;k<discs.length;k++){ if(discs[k].aVenir)continue; if((k===0||!!S.done[dkey(u,k-1)])&&!S.done[dkey(u,k)]){frontier=k;break;} }
    discs.forEach((d,i)=>{
      const node=document.createElement('div');
      node.style.transform='translateX('+OFFS[i%OFFS.length]+'px)';
      if(playable){
        const done=!!S.done[dkey(u,i)];
        // ⚠️ un disque `aVenir` (sans contenu) reste grisé quel que soit S.done ; sans ce garde il
        // se déverrouillerait et ouvrirait un disque vide.
        const unlocked=(i===0||!!S.done[dkey(u,i-1)])&&!d.aVenir;
        const current=(i===frontier);
        node.className='node '+(done?'done':current?'current':'locked');
        node.innerHTML='<div class="bwrap"><div class="ring"></div>'+
          '<button class="bubble" '+(unlocked?'':'disabled')+' aria-label="'+discLabel(d,U).replace(/"/g,'')+'">'+
            '<span class="bi"'+(unlocked?'':' style="opacity:.62"')+'>'+(d.img?'<img class="bimg" src="'+discImg(d,unlocked)+'" alt="" onerror="iconFallback(this,\''+d.icon+'\')">':d.icon)+'</span>'+
          '</button></div>';
        if(unlocked)node.querySelector('.bubble').onclick=(ev)=>{ev.stopPropagation();discTip(node,u,i,discLabel(d,U),done);};
      } else if(U.ready && i===0){
        // 1re leçon d'une unité future : « AVANCER ICI ? » (façon Duolingo) — test-out des unités précédentes
        node.className='node jump';
        node.innerHTML='<div class="bwrap"><div class="jump-tip">AVANCER ICI ?</div>'+
          '<button class="bubble" aria-label="Avancer ici : réussis un test pour passer directement à cette unité">'+
          '<svg class=\"bi\" width=\"36\" height=\"28\" viewBox=\"0 0 36 28\" aria-hidden=\"true\"><g fill=\"#fff\" stroke=\"#fff\" stroke-width=\"7\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M6.5 6.5 L16 14 L6.5 21.5 Z\"/><path d=\"M19.5 6.5 L29 14 L19.5 21.5 Z\"/></g></svg></button></div>';
        node.querySelector('.bubble').onclick=()=>{ if(!lecteurPret())return; startExam(u-1); };
      } else {
        node.className='node locked';
        node.innerHTML='<div class="bwrap"><button class="bubble" disabled aria-label="'+discLabel(d,U).replace(/"/g,'')+'">'+
          '<span class="bi" style="opacity:.62">'+(d.img?'<img class="bimg" src="'+discImg(d,false)+'" alt="" onerror="iconFallback(this,\''+d.icon+'\')">':d.icon)+'</span></button></div>';
      }
      path.appendChild(node);
    });
    sec.appendChild(path);
    h.appendChild(sec);
  });
  setBanner(0);
  if(window._homeScroll)window.removeEventListener('scroll',window._homeScroll);
  window._homeScroll=onHomeScroll;
  window.addEventListener('scroll',onHomeScroll,{passive:true});
  requestAnimationFrame(onHomeScroll);
  if(_homeFocusPending){_homeFocusPending=false;focusCurrentDisc();} // centre sur le disque courant
}
// Remplit le bandeau du haut avec le titre de l'unite u (sans re-render inutile).
/* ⚠️ Un segment arabe dans une phrase française ne se rend pas tout seul : dans le bandeau il
   hérite de 13 px (d'où .uh-let), dans le séparateur le letter-spacing désoude les ligatures
   (.us-let le remet à 0). Les `court` sont écrits sans balise : c'est le rendu qui pose la
   classe. Le « · » reste dehors. */
function insecables(txt){
  /* espaces insécables autour du tiret : il ne commence jamais une ligne
     (journal : ui/accueil.js · insecables) */
  return String(txt||'').replace(/ (—|–) /g, '\u00A0$1\u00A0');
}
function arEnveloppe(txt, cls){
  return String(txt||'').replace(
    /[\u0600-\u06FF\uFB50-\uFEFF]+(?:\s+[\u0600-\u06FF\uFB50-\uFEFF]+)*/g,
    function(m){ return '<span class="'+cls+'">'+m+'</span>'; });
}
function setBanner(u){
  const B=window._homeBanners&&window._homeBanners[u];if(!B)return;
  const bn=document.getElementById('unitBanner');if(!bn)return;
  if(bn.dataset.u===String(u)&&bn._filled)return;
  bn.dataset.u=u;bn._filled=1;bn.style.setProperty('--accent',unitAccent(u));
  document.getElementById('uhTop').innerHTML=B.top;
  document.getElementById('uhTitle').innerHTML=B.title;
}
// Au defilement : le bandeau affiche la derniere unite dont le separateur est passe sous lui.
function onHomeScroll(){
  const home=document.getElementById('home');
  if(!home||home.style.display==='none')return;
  const bn=document.getElementById('unitBanner');if(!bn)return;
  const bBottom=bn.getBoundingClientRect().bottom;
  let active=0;
  home.querySelectorAll('.unit-sec').forEach(sec=>{
    if(sec.getBoundingClientRect().top<=bBottom+6)active=+sec.dataset.u;
  });
  setBanner(active);
}
