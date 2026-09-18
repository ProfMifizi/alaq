/* ═══ CIEL-V2 : bandeau à deux lignes, sommaire du parchemin, lanterne, portail ═══
   Bloc additif : il enveloppe renderHome et refreshStats, et remplace openSurahMenu. Il lit directement
   les liaisons lexicales globales des scripts classiques (S, UNITS, SOURATES ; RANK_COLORS et rankFor
   de constance.js). */
(function(){
'use strict';

/* ---------- 1. la lanterne : icône fixe, halo à la couleur du rang ---------- */
function poserLanterne(){
  var l=document.getElementById('st-lamp'); if(!l) return;
  var c='#DC902E';
  try{ c=RANK_COLORS[rankFor(S.consScore).idx]||c; }catch(e){}
  l.classList.add('lant-wrap');
  l.style.filter='';
  l.style.setProperty('--rangc', c);
  if(!l.querySelector('.lant'))
    l.innerHTML='<img class="lant" src="'+ico('tb-lanterne')+'" alt="">';
}

/* ---------- 2. le bandeau : deux lignes, et le parchemin ---------- */
function nomSourate(){
  try{ var SR=SOURATES[(typeof curSourate!=='undefined'?curSourate:0)]||SOURATES[0];
       return (SR.nom||'Al-Fātiḥa').toUpperCase(); }catch(e){ return 'AL-FĀTIḤA'; }
}
function phaseDe(U){ return U.ph || 'LECTURE'; }
function refaireBandeaux(){
  var B=window._homeBanners; if(!B||!B.length) return;
  var titre='CHAPITRE 1 : SOURATE '+nomSourate();
  for(var u=0;u<B.length;u++){
    var U=UNITS[u]; if(!U) continue;
    var lettres=(U.letters||[]).join(' ');
    /* une unité dit son sujet : ses lettres, sinon son court ; la phase n'est qu'un dernier recours
       (unités sans sujet). (journal : index.html · le bandeau affichait la phase) */
    var sujet = lettres
      ? 'Lettres <span class="uh-let">'+lettres+'</span>'
      : (U.court ? arEnveloppe(insecables(U.court),'uh-let')
                 : phaseDe(U).charAt(0)+phaseDe(U).slice(1).toLowerCase());
    B[u]={ top:titre,
      /* ⚠️ espace insécable avant le deux-points, sinon la 2de ligne s'ouvre sur « : ». L'espace qui suit
         reste sécable : c'est là seulement que le titre peut se plier. */
      title:'<span class="uh-l1">Unité '+U.no+'\u00A0: '+sujet+'</span>' };
  }
  var bn=document.getElementById('unitBanner');
  if(bn){ bn._filled=0; if(typeof setBanner==='function') setBanner(+bn.dataset.u||0); }
  var bu=document.querySelector('.unit-head .uh-burger');
  if(bu && !bu.querySelector('img'))
    bu.innerHTML='<img src="'+ico('tab-parchemin')+'" alt="">';
}

/* ---------- 3. le sommaire, deux niveaux : les unités, puis les chapitres ---------- */
var feuille=null, niveau='unites';
function rosace(n, etat){
  /* la marque de fin de verset du muṣḥaf : huit lobes, le numéro au centre */
  var fait=(etat==='fait'), ici=(etat==='ici');
  var trait=(fait||ici)?'#E8A94F':'rgba(220,144,46,.45)', fond=fait?'#DC902E':'none', l='',k,a;
  for(k=0;k<8;k++){ a=k*Math.PI/4;
    l+='<circle cx="'+(19+Math.cos(a)*13.5).toFixed(1)+'" cy="'+(19+Math.sin(a)*13.5).toFixed(1)+
       '" r="3.1" fill="'+(fait?'#DC902E':'none')+'" stroke="'+trait+'" stroke-width="1.2"/>'; }
  return '<span class="sc-m"><svg viewBox="0 0 38 38" fill="none">'+l+
    '<circle cx="19" cy="19" r="10.5" fill="'+fond+'" stroke="'+trait+'" stroke-width="1.5"/>'+
    '</svg><b>'+n+'</b></span>';
}
function listeUnites(){
  var h='', phasePrec='', u, U, etat, cls, n, faits, k;
  for(u=0;u<UNITS.length;u++){
    U=UNITS[u];
    var ph=phaseDe(U);
    if(ph!==phasePrec){ h+='<div class="sc-sep">'+ph+'</div>'; phasePrec=ph; }
    n=discsFor(u).length; faits=0;
    for(k=0;k<n;k++) if(S.done[dkey(u,k)]) faits++;
    if(!U.ready){ etat='À VENIR'; cls=' off'; }
    else if(faits>=n){ etat=n+' / '+n; cls=' fait'; }
    else if(unitUnlocked(u)){ etat=faits+' / '+n; cls=' ici'; }
    else { etat='0 / '+n; cls=' off'; }
    h+='<button class="srow'+cls+'" type="button" data-u="'+u+'">'+
       rosace(U.no, cls.trim())+
       '<span class="sc-x1">Unité '+U.no+
         ((U.letters&&U.letters.length)?' · <span class="ar">'+U.letters.join(' ')+'</span>':'')+
       '</span><span class="sc-e">'+etat+'</span></button>';
  }
  return h;
}
function listeChapitres(){
  var h='', k, P, ici;
  for(k=0;k<SOURATE_PLAN.length && k<14;k++){
    P=SOURATE_PLAN[k]; ici=(typeof P.idx==='number');
    h+='<button class="srow'+(ici?' ici':' off')+'" type="button" data-c="'+k+'">'+
       '<span class="cnum">'+P.no+'</span>'+
       '<span class="sc-x1">'+P.nom+' <span class="ar">'+P.ar+'</span></span>'+
       '<span class="sc-e">'+(ici?'EN COURS':'À VENIR')+'</span></button>';
  }
  return h;
}
function dessinerFeuille(){
  var t=document.getElementById('scT'), c=document.getElementById('scList');
  if(!t||!c) return;
  if(niveau==='chapitres'){
    t.innerHTML='<span class="tri">▴</span> LES CHAPITRES'; c.innerHTML=listeChapitres();
  } else {
    t.innerHTML='<span class="tri">▾</span> SOURATE '+nomSourate(); c.innerHTML=listeUnites();
  }
}
function ouvrirFeuille(){
  if(!feuille){
    feuille=document.createElement('div'); feuille.id='sommCiel';
    feuille.innerHTML='<div class="sc-bg" data-fermer="1"></div><div class="sc-in">'+
      '<div class="sc-h"><button class="sc-t" id="scT" type="button"></button>'+
      '<button class="sc-x" type="button" data-fermer="1" aria-label="Fermer">✕</button></div>'+
      '<div id="scList"></div></div>';
    document.body.appendChild(feuille);
    feuille.addEventListener('click', function(e){
      if(e.target.getAttribute && e.target.getAttribute('data-fermer')){ fermerFeuille(); return; }
      var r=e.target.closest('.srow'); if(!r) return;
      if(r.getAttribute('data-c')!==null){ niveau='unites'; dessinerFeuille(); return; }
      fermerFeuille(); allerAUnite(+r.getAttribute('data-u'));
    });
    document.getElementById('scT').addEventListener('click', function(){
      niveau=(niveau==='unites')?'chapitres':'unites'; dessinerFeuille();
    });
  }
  niveau='unites'; dessinerFeuille(); feuille.classList.add('on');
}
function fermerFeuille(){ if(feuille) feuille.classList.remove('on'); }
function allerAUnite(u){
  var sec=document.querySelector('#home .unit-sec[data-u="'+u+'"]'); if(!sec) return;
  var y=sec.getBoundingClientRect().top+window.pageYOffset-96;
  window.scrollTo({top:Math.max(0,y), behavior:'smooth'});
}

/* ---------- 4. le portail : la fin de la sourate ---------- */
function poserPortail(){
  var home=document.getElementById('home'); if(!home) return;
  if(document.getElementById('portail')) return;
  var d=document.createElement('div'); d.id='portail';
  d.innerHTML='<div class="pt-cadre"><div class="pt-jour">'+
      '<div class="pt-clarte"></div><div class="pt-v g"></div><div class="pt-v d"></div>'+
    '</div></div><div class="pt-seuil"></div>';
  home.appendChild(d);
  d.addEventListener('click', function(){
    if(d.classList.contains('verrouille') || d.classList.contains('ouvert')) return;
    d.classList.add('ouvert');
    setTimeout(ouvrirHalte, 820);
  });
  majPortail();
}
function ouvrirHalte(){
  var e=document.getElementById('entreeHalte');
  if(!e){
    e=document.createElement('div'); e.id='entreeHalte';
    e.innerHTML='<button class="eh-x" type="button" aria-label="Revenir">✕</button>'+
      '<div class="eh-k">LA HALTE</div>'+
      '<div class="eh-t">Un lundi, à La Mecque</div>'+
      '<div class="eh-s">Ṣaḥīḥ Muslim n° 1162</div>'+
      '<div class="eh-n">L’histoire audio de cette halte est en préparation, in shā’ Allāh.</div>';
    document.body.appendChild(e);
    e.querySelector('.eh-x').addEventListener('click', function(){
      e.classList.remove('on');
      var p=document.getElementById('portail'); if(p) p.classList.remove('ouvert');
    });
  }
  e.classList.add('on');
}

/* Le portail reste éteint tant que le parcours de la sourate n'est pas achevé. */
function majPortail(){
  var d=document.getElementById('portail'); if(!d) return;
  /* chaque unité prête qui a des lettres doit être validée : tout le parcours, pas la seule dernière unité.
     ⚠️ verrouille porte aussi pointer-events:none. (journal : index.html · le portail de la Fātiḥa) */
  var reste=[], u;
  for(u=0;u<UNITS.length;u++){
    var U=UNITS[u];
    if(!U||!U.ready||!U.letters||!U.letters.length) continue;
    var ok=false; try{ ok=unitValidated(u); }catch(e){}
    if(!ok) reste.push(U.no);
  }
  var fini=(reste.length===0);
  d.classList.toggle('verrouille', !fini);
  d.setAttribute('aria-disabled', fini?'false':'true');
  d.title = fini ? 'La halte' : ('Termine le parcours de la Fātiḥa — il reste l\u2019unité '+reste[0]);
}

/* ---------- greffes ---------- */
['renderHome','refreshStats'].forEach(function(nom){
  var avant=window[nom]; if(typeof avant!=='function') return;
  window[nom]=function(){
    var r=avant.apply(this,arguments);
    try{ if(nom==='renderHome'){ refaireBandeaux(); poserPortail(); majPortail(); } else poserLanterne(); }catch(e){}
    return r;
  };
});
/* le parchemin ouvre le sommaire — c'est le bouton qui appelait le menu des sourates */
window.openSurahMenu=function(){ ouvrirFeuille(); };
window.__ciel2={feuille:ouvrirFeuille, portail:poserPortail, bandeaux:refaireBandeaux, majPortail:majPortail};
try{ poserLanterne(); refaireBandeaux(); poserPortail(); }catch(e){}
})();
