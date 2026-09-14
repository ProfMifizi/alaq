/* ═══════════════════════════════════════════════════════════════════════════
   ui/accueil.js — L'ACCUEIL (12/09/2026)
   ───────────────────────────────────────────────────────────────────────────
   CE QU'IL PORTE : le ciel de l'accueil — renderHome (une section par unité,
   neuf disques chacune, l'anneau doré du disque courant, « AVANCER ICI ? »,
   les grisés « À venir »), le bandeau d'unité unique (setBanner, onHomeScroll),
   la popup COMMENCER / REFAIRE d'un disque (discTip), le recentrage sur le
   disque courant (focusCurrentDisc, _homeFocusPending), la barre du haut
   (refreshStats) et les petites aides que trois écrans partagent : toAr,
   sujetCours, discLabel, discImg, insecables, arEnveloppe, iconFallback.

   ═══ POURQUOI UN SCRIPT CLASSIQUE, ET CHARGÉ ICI ═══
   `<script src="ui/accueil.js"></script>` vit sous parcours.js et AVANT le grand
   script d'index.html. Ni `defer`, ni `type="module"`, ni `import`, ni `export`
   — jamais. La dernière ligne du grand script est `showTab('home')`, qui appelle
   renderHome() de façon SYNCHRONE : c'est ce qui peint les cartes de l'accueil
   avant tout module, sans scintillement. Un module ES (différé) arriverait
   après, et l'élève verrait un instant de page vide. C'est la recette des cinq
   extractions précédentes (assets.js, trace-lettres.js, progression.js,
   parcours.js…), et la même contrainte inverse : ce fichier ne peut RIEN lire
   d'index.html au chargement — la remontée des `function` ne franchit pas la
   frontière d'un script, et un `const` d'index.html n'existe pas encore.

   ═══ LE CONTRAT AVEC index.html (résolu À L'APPEL, jamais à la définition) ═══
   UNITS, SOURATES, curSourate, S, dkey, unitValidated, discsFor, ICONES,
   arReveal, unitAccent, currentLesson, startDisque, startExam, updRankBadge,
   maybeShowHomeTut, maybeGhufranPrompt, openSurahMenu (en ligne). Cette liste
   EST le contrat, et le banc la garde. Dans l'autre sens, index.html et
   progression.js appellent renderHome(), refreshStats(), toAr()… et
   progression.js RÉASSIGNE _homeFocusPending (un `let` de ce fichier : la
   liaison lexicale globale est partagée entre scripts classiques).
   ⚠️ BUILD, BUILD_DATE, VERSION, BUILD_NUM restent dans index.html : le portillon
   (outils/verifier-version.mjs) les lit là-bas.

   GARDES : outils/verifier-interface.mjs (mini-DOM en Node, le banc CLIQUE),
   previews/_verif_interface.html (la vraie page, source et dist — et l'accueil
   peint SANS le module ES), verifier-sw-horsligne.mjs, verifier-paquet-natif.js.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ================= ACCUEIL ================= */
const OFFS=[0,46,64,46,0,-46,-64,-46,0];
function refreshStats(){
  document.getElementById('st-streak').textContent=S.streak;
  updRankBadge();
  document.getElementById('st-hearts').textContent=S.hearts;
}
/* ⚠️ 17/08 — la table s'arrêtait à ٧ (écrite au temps des 7 unités) : l'unité 8 affichait
   un « 8 » LATIN dans le Cours (capture de Myriam). Portée aux 12 unités du programme. */
function toAr(n){return ['','١','٢','٣','٤','٥','٦','٧','٨','٩','١٠','١١','١٢'][n]||n;}
/* le sujet d'une unité sans lettres, prêt pour le HTML : segments arabes enveloppés */
function sujetCours(U){
  return String(U.court||'Grammaire').replace(/[\u0600-\u06FF]+/g,function(m){return '<span class="csar">'+m+'</span>';});
}
// dkey(u,i) vit désormais dans progression.js (07/09/2026) — déjà une propriété de window, comme avant.
function discLabel(d,U){return d.label.indexOf('{L}')>=0?d.label.replace('{L}',U.letters.join(' ')):d.label;}
/* Deux fichiers par disque (choix de Myriam 09/08) : variante A (remplissage brun moyen) sur les
   disques dorés, variante C (sable) sur les verrouillés, plus sombres. AUCUN filtre d'inversion :
   chaque image est déjà à la bonne clarté, et les masses épaisses (tronc cérébral) sont éclaircies. */
/* Les verrouillés gardent le calibrage disq7-c (Myriam 09/08) : leur nom est DÉRIVÉ de celui
   du doré — renommer l'un sans l'autre ferait servir l'icône dorée à tous les verrouillés. */
function discImg(d,unlocked){ return 'images-app-alaq/'+(unlocked?ICONES['disq-or']:ICONES['disq-verrou'])+d.img+'.png'; }
/* Un disque touché n'ouvre plus la leçon directement : une popup annonce le titre et
   laisse choisir (COMMENCER / REFAIRE) — même geste que Duolingo (Myriam 08/08).
   Re-toucher le même disque referme la popup ; toucher ailleurs aussi. */
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
  tip.querySelector('.dt-go').onclick=function(ev){ev.stopPropagation();discTipClose();startDisque(u,i);};
  tip.addEventListener('click',function(ev){ev.stopPropagation();});
  /* les .node sont positionnés : les disques SUIVANTS se peignent au-dessus de la
     popup sans ceci (vu à la capture du 08/08) — le nœud ouvert passe devant */
  node.style.zIndex='30';
  node.querySelector('.bwrap').appendChild(tip);
}
document.addEventListener('click',function(e){
  var t=document.querySelector('.disc-tip');
  if(t&&!e.target.closest('.disc-tip')&&!e.target.closest('.bubble'))discTipClose();
});
/* La popup ouverte gelait le défilement sur l'appareil de Myriam (08/08) : elle se ferme
   maintenant au PREMIER geste de défilement — même comportement que Duolingo, et l'écran
   n'est plus jamais retenu. Écouteurs passifs : ils n'interceptent rien. */
window.addEventListener('scroll',discTipClose,{passive:true});
window.addEventListener('wheel',discTipClose,{passive:true});
window.addEventListener('touchmove',discTipClose,{passive:true});

// Si l'image d'un disque ne charge pas (réseau/cache), on retombe sur l'emoji d'origine — jamais un disque vide.
function iconFallback(im,ic){try{var s=document.createElement('span');s.textContent=ic;im.replaceWith(s);}catch(e){}}
// L'accueil s'ouvre sur la PREMIÈRE LEÇON de la DERNIÈRE UNITÉ EN COURS OU TERMINÉE
// (demande Myriam 23/08 — remplace le ciblage du 13/07) — à l'arrivée, au retour
// d'une leçon et après restauration du nuage ; jamais pendant que l'élève fait défiler.
// ⚠️ Pas le disque « courant » (frontier) : une unité ENTIÈREMENT terminée n'a plus
// AUCUN .node.current (frontier=-1 dans renderHome), donc l'ancien ciblage laissait
// l'écran au sommet — unité 1 — dès que la dernière unité jouable était bouclée.
let _homeFocusPending=true;
/* ⚠️ TROUVÉ PAR MYRIAM (24/08) — L'UNITÉ 9 (un SEUL disque) a révélé un angle mort de
   la boucle ci-dessous : « disque 0 fait » sert de repère de « unité EN COURS », mais
   pour une unité à un seul disque, « disque 0 fait » = « unité ENTIÈREMENT finie ».
   La boucle prend alors le DERNIER indice qui matche, même si c'est une unité déjà
   bouclée dépassant une unité PRÉCÉDENTE encore incomplète (ex.: unité 8 pas finie,
   unité 9 finie → l'ancien code pointait sur l'unité 9, pas sur le vrai travail en
   cours). `currentLesson()` (dans index.html) donne LE VRAI repère : la première leçon non
   terminée d'une unité débloquée. On ne retombe sur l'ancienne heuristique QUE si
   `currentLesson()` ne trouve plus rien à faire (tout est fini) — c'est exactement
   le cas que ce fix visait à l'origine (le 23/08) : montrer la dernière unité bouclée
   plutôt que de laisser l'écran au sommet. */
function focusCurrentDisc(){
  const L=currentLesson();
  let u=L?L.u:-1;
  if(u<0) for(let k=0;k<UNITS.length;k++){ if(S.done&&S.done[dkey(k,0)])u=k; }
  if(u<0)return; // rien commencé : l'écran reste au sommet, sur l'unité 1
  const sec=document.querySelector('#home .unit-sec[data-u="'+u+'"]');
  if(!sec)return;
  // { block:'center' } CENTRAIT le 1er disque de l'unité — puisque c'est le tout premier
  // élément de sa section, centrer le fait REMONTER la fin de l'unité PRÉCÉDENTE dans la
  // moitié haute de l'écran (constaté par Myriam le 23/08 : « le disque 8 de l'unité 7 en
  // haut »). On cale plutôt le HAUT de la section juste sous le bandeau sticky, mesuré en
  // vrai (sa hauteur varie avec le sujet de l'unité) plutôt que deviné en dur.
  setTimeout(function(){
    try{
      const bn=document.getElementById('unitBanner');
      setBanner(u); // AVANT de mesurer : sa hauteur dépend du texte de CETTE unité
      // ⚠️ Mesurer bn.getBoundingClientRect() ICI serait FAUX : tant que la page n'a
      // pas encore défilé, le bandeau `position:sticky` n'est pas encore ÉPINGLÉ — son
      // rectangle reflète sa position NON accrochée (plus bas), écart mesuré : 22px sur
      // ce poste. On calcule donc sa position épinglée directement depuis son `top` CSS
      // (`calc(54px + safe-area)`, résolu par getComputedStyle) + sa propre hauteur —
      // stable quel que soit le défilement en cours.
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
    /* \u26a0\ufe0f \u00ab Les lettres \u00bb \u00c9TAIT \u00c9CRIT EN DUR, pour toutes les unit\u00e9s. L'unit\u00e9 8 n'en
       enseigne aucune (c'est la grammaire qui commence) : le ciel annon\u00e7ait
       \u00ab UNIT\u00c9 \u0668 \u00b7 Les lettres \u00bb suivi de RIEN. Une unit\u00e9 dit d\u00e9sormais son sujet \u2014
       ses lettres si elle en a, son `court` sinon. Les unit\u00e9s 9 \u00e0 12, elles aussi
       sans lettres, h\u00e9riteront de la m\u00eame r\u00e8gle sans qu'on y revienne. */
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
        // ⚠️ `aVenir` (unité 9, 24/08) : un disque SANS contenu construit reste grisé pour
        // toujours, quel que soit S.done — la place existe (Myriam : « 9 dont 8 grisées »,
        // même silhouette que les unités à 9 disques), mais rien derrière tant que ce n'est
        // pas écrit. Sans ce garde, il se déverrouillerait normalement dès le disque 0 fini,
        // et un toucher ouvrirait un disque sans contenu réel.
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
        node.querySelector('.bubble').onclick=()=>startExam(u-1);
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
/* ⚠️ UN SEGMENT ARABE GLISSÉ DANS UNE PHRASE FRANÇAISE NE SE REND PAS TOUT SEUL.
   Deux pièges, et ils sont différents selon l'endroit :
   · dans le BANDEAU, l'arabe hérite de la taille du français (13 px) — illisible
     pour du Naskh, d'où `.uh-let` (17 px, police `--ar`) ;
   · dans le SÉPARATEUR, `.unit-sep` porte `letter-spacing:.07em` — et un
     inter-lettrage DÉSOUDE les ligatures arabes. `.us-let` le remet à 0.
   Les `court` sont écrits SANS balise (« L’annexion — الإِضَافَة ») : la donnée ne
   peut donc pas oublier la classe, c'est le rendu qui la pose. Même parade que
   l'`enrichir()` des exercices de l'unité 9, portée ici au ciel.
   Le `·` reste DEHORS : il sépare, il ne se prononce pas. */
function insecables(txt){
  /* ⚠️ MESURÉ SUR UN IPHONE SE : « Unité 10 : L’annexion — الإِضَافَة » se replie sur
     deux lignes, et la coupure tombait ENTRE « L’annexion » et le tiret — la 2ᵈᵉ ligne
     s'ouvrait donc sur un tiret orphelin. C'est aussi, tout simplement, la règle
     typographique française : un tiret cadratin ne se sépare pas de ce qui le précède.
     Les espaces qui l'entourent deviennent insécables, la coupure remonte après les
     deux-points — un endroit qui se lit. */
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
