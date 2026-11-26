/* Couche « Les Mystères de Diya » — dans l'app (build 280, 25/11/2026). GÉNÉRÉE par outils/preparer-mysteres-prod.py depuis la préview v17 : on corrige les préviews, puis on relance le script.
   Elle ENVELOPPE les vraies fonctions de rendu (renderHome, renderIslam, renderProg, showTab, setBanner) et ajoute ses écrans : les neuf indices d'une unité, la scène à compléter, l'histoire, la collection,
   le Profil en trois volets avec la carte joueuse, le disque qui change de tenue et d'arrière-plan. Script classique chargé À LA DEMANDE par mysteres-chargeur.js (chez tout le monde).
   ÉTAT : ce qui se garde vit dans S.louma (créé au premier besoin, jamais dans DEF : doReset ne recharge pas la page), l'état d'écran vit ici. L'attribution des indices est DÉRIVÉE des disques faits
   (S.done) : objet k de l'unité u = disque k ; seule l'unité 1 a son histoire (« Le visiteur de la nuit »), les autres montrent leurs neuf carrés vides et « Mystère à venir ». LA BOUTIQUE EST OUVERTE : l'achat se fait chez le SERVEUR (acheter_diya), jamais sur le téléphone. */
(function(){
'use strict';
if(window.LM) return;
const D = document;
const DV = window.DV5, DY = window.DIYA;
const $ = s => D.querySelector(s);
const esc = v => String(v==null?'':v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const NB = 9;
/* l'état : ce qui se garde vit dans S.louma (réparé à chaque lecture), l'état d'écran dans UI, les choix de Myriam du 24/11 dans FIXE */
const UI = {page:null, onglet:'carte', depuis:'prog', vue:null};
const FIXE = {bandeau:'integre', filmAr:18, filmPos:'haut', coins:'epi', valo:3, retouches:true, nom:'Diya'};
const DEFAUT = () => ({poses:{}, vus:{}, collectees:{}, habillage:'classique', possedes:['classique'], fondsPoss:['nuit'], fondCarte:'uni', fondProfil:'uni', coulCarte:'', coulProfil:'', recitBonus:false, frSous:true});
function L(){
  const s = window.S; if(!s.louma || typeof s.louma !== 'object' || Array.isArray(s.louma)) s.louma = DEFAUT();
  const l = s.louma, d = DEFAUT();
  for(const k in d){ if(l[k] == null || typeof l[k] !== typeof d[k] || Array.isArray(l[k]) !== Array.isArray(d[k])) l[k] = d[k]; }
  if(l.possedes.indexOf('classique') < 0) l.possedes.unshift('classique');
  if(l.fondsPoss.indexOf('nuit') < 0) l.fondsPoss.unshift('nuit');
  if(!(l.fondCarte === 'uni' || CARTE.fondDeBoutique(l.fondCarte))) l.fondCarte = 'uni';
  if(!(l.fondProfil === 'uni' || CARTE.fondDeBoutique(l.fondProfil))) l.fondProfil = 'uni';
  if(!CARTE.couleurOk(l.coulCarte)) l.coulCarte = '';
  if(!CARTE.couleurOk(l.coulProfil)) l.coulProfil = '';
  return l;
}
const mailCompte = () => { try{ return (CLOUD && CLOUD.user && CLOUD.user.email) || ''; }catch(e){ return ''; } };
const P = new Proxy({}, {
  get(_, k){ if(k in UI) return UI[k]; if(k in FIXE) return FIXE[k]; if(k === 'graines') return window.S.graines || 0; if(k === 'mail') return mailCompte(); return L()[k]; },
  set(_, k, v){ if(k in UI){ UI[k] = v; return true; } if(k in FIXE || k === 'mail') return true; if(k === 'graines'){ window.S.graines = v; return true; } L()[k] = v; return true; }
});
/* les arrière-plans (Boutique) — possédés, celui de la carte et celui du disque ; « uni » (crème en mode sombre, marron foncé en mode clair) est le défaut des DEUX */
const fondConnu = id => !!CARTE.fondDeBoutique(id);
const aFond = id => P.fondsPoss.indexOf(id) >= 0;
const fondCarteEff = () => (P.fondCarte === 'uni' || (fondConnu(P.fondCarte) && aFond(P.fondCarte))) ? P.fondCarte : 'uni';     // jamais un arrière-plan qu'on n'a pas acheté
/* la couleur de l'uni (gratuite) ; vide = le défaut */
const coulCarteEff = () => CARTE.couleurOk(P.coulCarte) ? P.coulCarte : '';
const coulProfilEff = () => CARTE.couleurOk(P.coulProfil) ? P.coulProfil : '';
const fondProfilEff = () => (P.fondProfil === 'uni' || (fondConnu(P.fondProfil) && aFond(P.fondProfil))) ? P.fondProfil : 'uni';

/* ——— les neuf objets, dans l'ordre où ils arrivent (un par leçon) : les VRAIS objets (Artlist), leurs emplacements viennent de la couverture ——— */
const OBJ = [
  {id:'lune',     nom:'La lune'},
  {id:'sacs',     nom:'Les sacs de blé'},
  {id:'jarres',   nom:'Les jarres'},
  {id:'lanterne', nom:'La lanterne'},
  {id:'porte',    nom:'La porte d’entrée'},
  {id:'natte',    nom:'La natte, le coussin et la couverture'},
  {id:'feuillet', nom:'Le feuillet d’Āyat al-Kursī'},
  {id:'bulle',    nom:'La bulle de protection'},
  {id:'sandales', nom:'Les sandales et le turban'}
];
const objSrc = o => DV.base + (o.id === 'bulle' ? 'bulle-icone' : o.id) + '.webp';
const objImg = i => '<img src="'+objSrc(OBJ[i])+'" alt="">';
const IMG_CARTE = 'images-app-alaq/mysteres/carte/';
const IMG_VENIR = () => 'images-app-alaq/mysteres/indices/venir.webp';
const venirHTML = u => '<div class="lm-venir" role="img" aria-label="Mystère à venir, unité '+UNITS[u].no+'"><img class="lm-venir-img" src="'+IMG_VENIR()+'" alt=""></div>';
CARTE.cfg.objBase = DV.base; CARTE.cfg.policesBase = 'polices/'; CARTE.cfg.images = IMG_CARTE; CARTE.cfg.cssUrl = 'mysteres/carte.css';       // la carte vit ici dans l'app : ses images et ses polices ont d'autres adresses que dans sa préview
const IBULLE = 7;                               // la bulle est en DEUX couches : l'arc arrière SOUS la natte, le dôme et l'arc avant PAR-DESSUS

/* ——— le récit : des DIAPOS (une image, l'arabe du hadith, sa traduction), coupées ENTRE deux phrases du hadith ; les images retouchées (ombre plus petite, porte en arche) sont les par défaut ——— */
const RECIT = { 0: DV.recit };
const IMAGES_RECIT = () => 'images-app-alaq/mysteres/recit-1/';
const DUREE_DIAPO = d => d.voix ? Math.round(d.voix.duree * 1000) + 1400 : 4500 + d.ar.length * 28;     // avec la voix : sa durée + 1,4 s de souffle ; sans : le temps de lire (6 à 9 s)
/* la voix de Sara : une prise = une clé de SONS (son.js) ; rien n'est assemblé à la lecture. Une diapo peut avoir PLUSIEURS parties, sur le même élément audio :
   la 16 = Sara, le verset d'al-Ḥuṣarī STREAMÉ (jamais copié : son adresse est dans la donnée, coupé à `de` + `duree`), Sara. Les horaires des cases sont sur la ligne du temps de la diapo entière. */
const voixPartiesDe = d => d.voix ? (d.voix.parties || [{ src: d.voix.src, duree: d.voix.duree }]) : [];
Object.keys(RECIT).forEach(u => RECIT[u].slides.forEach(d => voixPartiesDe(d).forEach((p, k) => { if(p.src && typeof inscrireLeSon === 'function') inscrireLeSon('mystere:' + u + ':' + d.n + (k ? ':' + k : ''), p.src); })));
let VOIX = null, voixDe = null;                                     // la façade de la voix (même interface qu'un élément audio) et la diapo dont elle porte la voix
let AUD = null, vParts = [], vK = 0, vDeb = [], vVeille = 0, vFini = false;   // l'élément audio (un seul), les parties de la diapo, la partie en cours, leurs débuts, le guet du flux, la fin
const voixUrl = (d, k) => { try{ const p = voixPartiesDe(d)[k || 0]; if(!p) return null; return p.flux || (typeof urlDe === 'function' ? urlDe('mystere:' + filmU + ':' + d.n + (k ? ':' + k : '')) : null); }catch(x){ return null; } };
function voixFacade(){
  return {
    get currentTime(){ const p = vParts[vK]; return AUD ? Math.max(0, (vDeb[vK] || 0) + AUD.currentTime - (p && p.de || 0)) : 0; },   // l'heure de la DIAPO
    get paused(){ return !AUD || AUD.paused; },
    get ended(){ return vFini; },
    pause(){ clearInterval(vVeille); if(AUD) AUD.pause(); },
    play(){ voixVeiller(); return AUD ? AUD.play() : undefined; }
  };
}
/* un flux n'est qu'une COUPE : on le surveille à l'horloge ; un fichier dit sa fin lui-même (« ended ») */
function voixVeiller(){ clearInterval(vVeille); vVeille = setInterval(() => { const p = vParts[vK]; if(AUD && !AUD.paused && p && p.flux && AUD.currentTime >= (p.de || 0) + p.duree) voixSuivante(); }, 80); }
function voixSuivante(){
  clearInterval(vVeille);
  if(vK + 1 < vParts.length) voixLancer(vK + 1, 0);
  else{ vFini = true; try{ AUD.pause(); }catch(x){} }
}
function voixLancer(k, localS){
  const p = vParts[k], url = voixUrl(voixDe, k); vK = k;
  if(!p || !url){ voixSuivante(); return; }                          // une partie introuvable (hors ligne, flux muet) : silence, la suivante part
  if(AUD.getAttribute('data-url') !== url){ AUD.src = url; AUD.setAttribute('data-url', url); }
  try{ AUD.currentTime = (p.de || 0) + Math.max(0, localS || 0); }catch(x){}
  const q = AUD.play(); if(q && q.catch) q.catch(() => {});        // refus (réseau, iOS) : silence
  voixVeiller();
}
function voixDemarrer(d, depuisMs){
  if(!d || !d.voix) return;
  try{
    if(!AUD){ AUD = new Audio(); AUD.preload = 'auto'; AUD.addEventListener('playing', voixPartie); AUD.addEventListener('ended', voixSuivante); AUD.addEventListener('error', voixSuivante); VOIX = voixFacade(); }
    AUD.pause(); clearInterval(vVeille); voixDe = d; vParts = voixPartiesDe(d); vFini = false;
    let cum = 0; vDeb = vParts.map(p => { const x = cum; cum += p.duree; return x; });
    const t = Math.max(0, (depuisMs || 0) / 1000); let k = 0;
    while(k < vParts.length - 1 && t >= vDeb[k] + vParts[k].duree) k++;
    voixLancer(k, t - vDeb[k]);
    const s = RECIT[filmU].slides[shot + 1]; const u2 = s && s.voix && voixUrl(s, 0);
    if(u2 && !/^https?:/.test(u2)){ const a = new Audio(); a.preload = 'auto'; a.src = u2; }   // la suivante se charge d'avance (jamais un flux)
  }catch(x){}
}
/* la voix démarre vraiment (après le chargement) : l'horloge de la diapo se cale sur elle, la diapo ne finit jamais AVANT sa voix */
function voixPartie(){
  if(!VOIX || !voixDe || !playing || RECIT[filmU].slides[shot] !== voixDe) return;
  restant = Math.max(300, DUREE_DIAPO(voixDe) - Math.round(VOIX.currentTime * 1000)); planifier();
}
function voixArreter(){ try{ if(VOIX) VOIX.pause(); }catch(x){} }
const voixEnCours = d => !!(VOIX && voixDe === d && !VOIX.paused && !VOIX.ended && VOIX.currentTime > 0);
/* l'heure de la diapo, en secondes : celle de la voix quand elle est lancée, sinon celle de l'horloge (les mêmes horaires, sans le son) */
function heureDiapo(d, reste, total){ return VOIX && voixDe === d && VOIX.currentTime > 0 ? VOIX.currentTime : (total - reste) / 1000; }
function finDiapo(){ const d = RECIT[filmU] && RECIT[filmU].slides[shot]; if(d && voixEnCours(d) && d.voix && VOIX.currentTime < d.voix.duree + 0.3){ timer = setTimeout(finDiapo, 300); return; } avancer(); }
/* LA MASCOTTE, comme dans la halte (src/film) : celle de l'app, dont la bouche et les anses suivent la voix de Sara (au repos pendant le verset d'al-Ḥuṣarī) ; posée au sol de chaque
   image (`masc` : x, y des pieds, taille). Sans le film (module pas encore chargé) ou sans mascotte dans l'app, l'histoire se passe de mascotte. */
let MASC = null, mascPrise = null, mascSegs = null, mascDe = null;
const mascAPI = () => { try{ return window.__alaqRecit && window.__alaqRecit.mascotte || null; }catch(x){ return null; } };
function mascCreer(e){
  MASC = null; const A = mascAPI(); if(!A) return;
  const svg = A.creer(), film = e.querySelector('#lm5Film'); if(!svg || !film) return;
  const w = D.createElement('div'); w.className = 'lm-masc'; w.id = 'lmMasc'; w.appendChild(svg); film.appendChild(w);
  MASC = { w, svg }; A.bouche(svg, A.REPOS); A.bras(svg, { g: 0, d: 0 });
}
function mascPoser(d){
  if(!MASC || !d) return; const m = d.masc || [50, 84, 0.34], A = mascAPI();
  MASC.w.style.left = m[0] + '%'; MASC.w.style.top = m[1] + '%'; MASC.w.style.setProperty('--s', m[2]);
  mascDe = d; mascPrise = null; mascSegs = null;
  const v = d.voix && d.voix.mascotte;
  if(v && A){ mascPrise = { jetons: [{ mots: v.mots }], env: Array.from(v.env, c => (c.charCodeAt(0) - 32) / 94), envPas: 0.02 }; mascSegs = A.segments(mascPrise); }
}
function mascAnimer(d, t){
  const A = mascAPI(); if(!MASC || !A) return;
  if(mascDe === d && mascPrise && voixEnCours(d)){ A.bouche(MASC.svg, A.poids(mascSegs, t)); A.bras(MASC.svg, A.angles(mascPrise, t, 'voix')); }
  else{ A.bouche(MASC.svg, A.REPOS); A.bras(MASC.svg, { g: 0, d: 0 }); }
}
/* les soudures (espaces insécables, typographie française, jamais un mot seul en bout de diapo) sont faites UNE FOIS dans les données (outils/preparer-secrets-diya-v7.py (copie fidèle de _apercu-secrets-diya-v7/donnees.js)) ; ici : seulement la mise en page */
const typo = t => String(t).replace(/\bal-/g, 'al\u2011').replace(/n° /g, 'n°\u00a0').replace(/Sharḥ as-sunna/g, 'Sharḥ\u00a0as\u2011sunna');    // le trait d'union insécable : « al-/Baghawī » ne se coupe plus

/* ——— la garde-robe : les tenues de diya.js ; prix d'EXEMPLE, payés en graines (les temps forts du calendrier 80, les saisons 60) ——— */
const TEMPS = (DY.GROUPES[0] || {ids:[]}).ids;
const HAB = DY.TENUES.filter(t => t.id !== 'classique').map(t => ({id:t.id, nom:t.nom, quand:t.quand, note:t.note, prix: TEMPS.indexOf(t.id) >= 0 ? 80 : 60}));
const CLASSIQUE = {id:'classique', nom:'Classique', quand:'Toute l’année', note:'La Diya de l’app, telle qu’elle est.', prix:0};
const sans = t => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const periode = hb => (hb.quand && sans(hb.quand).indexOf(sans(hb.nom)) < 0) ? hb.quand : '';        // « Pendant le Ramadan » sous « Ramadan » ne dit rien de plus : on ne l'écrit pas
const GROUPES_COURTS = {'Temps forts du calendrier musulman':'Calendrier musulman', 'Saisons et jours de l’année':'Saisons et jours'};
const BONUS = {titre:'La coupe de lait', qui:'Abū Hurayra', prix:100};
const tenueDe = id => id === 'classique' ? CLASSIQUE : HAB.find(x => x.id === id);

/* ——— la mascotte : le dessin de diya.js (même corps que celle de l'app), jamais une image ; le contour sombre ne s'allume qu'en thème clair ——— */
const tenue = () => (P.habillage && tenueDe(P.habillage)) ? P.habillage : 'classique';      // v8 : jamais autre chose qu'une tenue connue (l'adresse de la préview peut en proposer une)
const diya = (id, W, portrait) => DY.svg(id, {taille:W, anime:false, vue:portrait ? 'portrait' : undefined});
const masc = (W, portrait) => diya(tenue(), W, portrait);

/* ——— l'état dérivé ——— */
const poses = u => (P.poses[u] = P.poses[u] || Array(NB).fill(false));
const vus = u => (P.vus[u] = P.vus[u] || Array(NB).fill(false));
const rec = u => RECIT[u] ? Array.from({length:NB}, (_, k) => !!S.done[dkey(u, k)]) : Array(NB).fill(false);      // v16 : une unité SANS histoire n'a aucun indice (les neuf objets sont ceux du mystère n° 1, pas les siens)
const cnt = a => a.filter(Boolean).length;
function uniteCourante(){ let der = 0; for(let u=0; u<UNITS.length; u++){ if(!UNITS[u].ready) continue; der = u; if(!unitValidated(u)) return u; } return der; }
function unitesAvecObjets(){ const r = []; for(let u=0; u<UNITS.length; u++) if(UNITS[u].ready && RECIT[u] && cnt(rec(u)) > 0) r.push(u); return r; }
function dus(){ const r = []; unitesAvecObjets().forEach(u => { const a = rec(u), v = vus(u); for(let k=0; k<NB; k++) if(a[k] && !v[k]) r.push({u, k}); }); return r; }
const nCartes = () => Object.keys(P.collectees).filter(u => P.collectees[u]).length + (P.recitBonus ? 1 : 0);
const totalIndices = () => { let n = 0; for(let u=0; u<UNITS.length; u++) if(UNITS[u].ready && RECIT[u]) n += cnt(rec(u)); return n; };
/* le mystère EN COURS : celui qu'on a demandé (le bandeau d'une unité), s'il n'est pas déjà résolu ; sinon le premier qui a des objets sans carte gardée ; sinon l'unité courante */
function uniteEnCours(){
  if(P.vue != null && !P.collectees[P.vue]) return P.vue;
  const a = unitesAvecObjets().filter(u => !P.collectees[u]);
  return a.length ? a[0] : uniteCourante();
}
const titre = () => esc('Les Mystères de ' + P.nom);
const grain = () => '<img class="lm10-gr" src="'+IMG_CARTE+'icone-graine.webp" alt="">';        // v10 : la graine d'Artlist (l'ancien dessin ressemblait à un épi)
const chev = () => '<svg class="lm-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
const crayon = () => '<svg class="lm7-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.2-4.6L16.3 4.3a2.1 2.1 0 0 1 3 3L8.2 18.8z"/><path d="M14.6 6l3.4 3.4"/></svg>';
const LIVRE = '<span class="lm-livre"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h6a2 2 0 0 1 2 2V19a2 2 0 0 0-2-2H4z"/><path d="M20 5.5h-6a2 2 0 0 0-2 2V19a2 2 0 0 1 2-2h6z"/></svg></span>';
const LBL = {home:'Apprendre', islam:'Islam', prog:'Profil'};
/* une région live qui existe AVANT que son texte change : seule façon d'être annoncée (le contenu de la page, lui, est repeint à chaque geste) */
const live = (function(){ let e = D.getElementById('lmLive'); if(!e){ e = D.createElement('p'); e.id = 'lmLive'; e.className = 'lm-sr'; e.setAttribute('role', 'status'); e.setAttribute('aria-live', 'polite'); D.body.appendChild(e); } return e; })();
const annonce = t => { live.textContent = ''; setTimeout(() => { live.textContent = t; }, 60); };
let sel = null, shot = 0, playing = false, restant = 6000, debut = 0, timer = null, filmU = 0, _interne = false;

/* ——— les neuf petits carrés : un contour pointillé, serré ; l'image de l'indice quand il est débloqué ——— */
function carres(u, cls){
  const a = rec(u);
  return '<span class="lm7-neuf'+(cls ? ' '+cls : '')+'" aria-hidden="true">'+OBJ.map((o, i) => '<span class="lm7-c'+(a[i] ? ' on' : '')+'">'+(a[i] ? objImg(i) : '')+'</span>').join('')+'</span>';
}

/* ——— les morceaux d'écran ——— */
const cleBandeau = u => u + '|' + tenue() + '|' + cnt(rec(u)) + '|' + P.bandeau;
function bandeauApprendre(u){
  if(P.bandeau === 'integre') return '';
  const n = cnt(rec(u));
  return '<button class="lm-bandeau lm7-ban" id="lmBandeau" data-cle="'+esc(cleBandeau(u))+'" data-lm="indices-unite:'+u+'" aria-label="'+titre()+(RECIT[u] ? ' : voir mes indices, '+n+' indices sur 9' : ' : mystère à venir')+'"><span class="lm7-ban-h"><span class="lm-m lm7-bm">'+masc(28, true)+'</span><span class="lm-bt">'+titre()+'</span>'+chev()+'</span>'+carres(u)+'</button>';
}
/* v8 : les neuf carrés DANS la boîte de l'unité (#unitBanner, la première boîte) : une seule boîte collante, sans titre */
function integrerIndices(u){
  const ub = D.getElementById('unitBanner'); if(!ub) return;
  const ex = ub.querySelector('.lm8-int');
  if(P.bandeau !== 'integre'){ if(ex) ex.remove(); ub.classList.remove('lm8-avec'); return; }
  const n = cnt(rec(u)), cle = u + '|' + n;
  if(ex && ex.dataset.cle === cle) return;
  if(ex) ex.remove();
  ub.classList.add('lm8-avec');
  ub.insertAdjacentHTML('beforeend', '<button class="lm8-int" data-cle="'+cle+'" data-lm="indices-unite:'+u+'" aria-label="'+(RECIT[u] ? 'Mes indices : '+n+' sur 9. Voir mes indices' : 'Mystère à venir pour cette unité. Voir')+'">'+carres(u)+'</button>');
}
/* la hauteur du bandeau est donnée à l'app : la pastille « Réviser » collante se cale juste dessous */
function hauteurBandeau(){
  const b = D.getElementById('lmBandeau'), ub = D.getElementById('unitBanner');
  if(b && ub) b.style.top = (parseFloat(getComputedStyle(ub).top) + ub.offsetHeight + 8) + 'px';       // sous le titre d'unité, quelle que soit sa hauteur (grands caractères)
  D.documentElement.style.setProperty('--lm-bh', b ? (b.offsetHeight + 8) + 'px' : '0px');
  try{ if(typeof revPilHauteur === 'function') revPilHauteur(); }catch(e){}       // la pastille « Réviser » se cale sous la boîte, quelle que soit sa hauteur
}
/* le bandeau est RECOMPOSÉ en entier à chaque fois (la mascotte aussi : une tenue équipée ne doit pas rester l'ancienne sur l'accueil) */
function majBandeau(u){
  integrerIndices(u);
  let b = D.getElementById('lmBandeau');
  if(P.bandeau === 'integre'){ if(b) b.remove(); hauteurBandeau(); return; }
  if(!b){ const ub = D.getElementById('unitBanner'); if(ub) ub.insertAdjacentHTML('afterend', bandeauApprendre(u)); hauteurBandeau(); return; }
  hauteurBandeau();
  if(b.dataset.cle === cleBandeau(u)) return;      // rien n'a changé : on ne touche à rien (un appui en cours ne se perd pas)
  b.outerHTML = bandeauApprendre(u); hauteurBandeau();
}
function bandeauIslam(){
  return '<button class="lm-bandeau" data-lm="ouvrir:collection:islam" aria-label="'+titre()+' : ouvrir ma collection"><span class="lm-m lm5-bm">'+masc(36, true)+'</span><span class="lm-bt">'+titre()+'</span>'+chev()+'</button>';
}

/* ——— la scène : le DÉCOR vide, les emplacements en pointillé (la silhouette de l'objet), les objets posés ——— */
const posOf = id => DV.positions[id];
const stylePos = id => { const p = posOf(id); return 'left:'+p[0]+'%;top:'+p[1]+'%;width:'+p[2]+'%'; };
const hauteurPct = id => { const e = DV.emplacements[id], p = posOf(id); return p[2] * 0.8 * e.h / e.w; };     // la scène est un 4:5 : 1 % de large = 0,8 % de haut
function slot(o, cls){
  const e = DV.emplacements[o.id], p = posOf(o.id);
  return '<svg class="lm5-slot'+(cls || '')+'" data-slot="'+o.id+'" viewBox="0 0 '+e.w+' '+e.h+'" preserveAspectRatio="none" aria-hidden="true" style="left:'+p[0]+'%;top:'+p[1]+'%;width:'+p[2]+'%;height:'+hauteurPct(o.id)+'%"><path d="'+e.d+'"/></svg>';
}
function scene(u, mode){
  if(mode === 'cover') return '<div class="lm-scene lm5 is-complete" role="img" aria-label="La couverture de l’histoire"><img class="lm5-couv" src="'+DV.base+'couverture-v3.webp" alt=""></div>';
  const pk = poses(u), assembly = mode === 'assembly';
  let h = '<div class="lm-scene lm5" id="lm5Scene" role="group" aria-label="Scène illustrée : la cour de nuit, avec les emplacements des indices"><img class="lm5-decor" src="'+DV.base+'decor.webp" alt="">';
  if(pk[IBULLE]) h += '<img class="lm5-obj lm5-dos" src="'+DV.base+'bulle-dos-forte.webp" alt="" style="'+stylePos('bulle')+'">';       // l'arc arrière : SOUS la natte
  OBJ.forEach((o, i) => {
    if(pk[i]) h += '<img class="lm5-obj'+(i === IBULLE ? ' lm5-avant' : '')+'" src="'+DV.base+(i === IBULLE ? 'bulle-avant-forte' : o.id)+'.webp" alt="" style="'+stylePos(o.id)+'">';
    else if(assembly) h += slot(o, sel === i ? ' pret' : '');
  });
  return h + '</div>';
}
function inventaire(u){
  /* seuls les objets À PLACER sont dans le casier (jamais de bande qui défile : un doigt qui tire un objet en diagonale ne doit pas faire défiler la page) ; les emplacements encore vides de la scène disent ce qui reste à gagner */
  const r = rec(u), p = poses(u), liste = OBJ.map((o, i) => i).filter(i => r[i] && !p[i]);
  if(!liste.length) return '';
  return '<div class="lm-inv" role="group" aria-label="Les indices à placer">'+liste.map(i => {
    const o = OBJ[i];
    return '<button class="lm-o dispo" data-lm="choisir:'+i+'" aria-pressed="'+(sel===i)+'" aria-label="Indice '+(i+1)+' : '+esc(o.nom)+', à placer" data-i="'+i+'">'+objImg(i)+'</button>';
  }).join('')+'</div>';
}
function ficheHTML(u){
  const R = RECIT[u];
  return '<article class="lm-fiche"><div class="lm-fiche-img">'+scene(u, 'cover')+'</div><div class="lm-fiche-t"><p class="lm-eyebrow">Unité '+UNITS[u].no+'</p><h3>'+esc(R.titre)+'</h3><p>'+esc(R.narrateur)+'</p><p class="lm5-src">'+esc(typo(R.source))+'</p></div></article>';
}
const entete = () => '<button class="lm-back" data-lm="retour" aria-label="Retour à '+(LBL[P.depuis] || 'Profil')+'">'+(LBL[P.depuis] || 'Profil')+'</button>';

/* ——— le Profil : l'utilisateur, la carte, les succès ——— */
const champ = (id, lib, val) => '<button class="lm7-champ" data-lm="modifier:'+id+'" aria-label="Modifier ton '+lib.toLowerCase()+' : '+esc(val || 'vide')+'"><span class="lm7-champ-t"><span class="lm7-lib">'+lib+'</span><span class="lm7-val'+(val ? '' : ' vide')+'">'+(val ? esc(val) : 'Ajoute ton '+lib.toLowerCase())+'</span></span>'+crayon()+'</button>';
const champLecture = (lib, val) => '<div class="lm7-champ lm7-champ-ro"><span class="lm7-champ-t"><span class="lm7-lib">'+lib+'</span><span class="lm7-val'+(val ? '' : ' vide')+'">'+(val ? esc(val) : 'Pas encore de compte')+'</span></span></div>';
function profilUtilisateur(){
  const t = tenueDe(tenue());
  const f = fondProfilEff();
  return '<section class="lm7-user" aria-label="Mon profil"><button class="lm7-avatar" data-lm="avatar" data-fond="'+f+'"'+(f === 'uni' ? (coulProfilEff() ? ' data-couleur="1" style="background:'+coulProfilEff()+'"' : '') : ' style="--fond:url('+IMG_CARTE+'fond-'+f+'.webp)"')+' aria-label="Changer de tenue ou d’arrière-plan, tenue actuelle : '+esc(t.nom)+'"><span class="lm7-av-img">'+AVEC_CONTOUR(masc(64, true))+'</span><span class="lm7-pen" aria-hidden="true">'+crayon()+'</span></button>'+
    '<div class="lm7-champs">'+champ('prenom', 'Surnom', S.prenom || '')+champLecture('Mail', mailCompte())+'</div></section>';
}
/* les valeurs de la carte viennent de l'app elle-même : les VRAIES statistiques du Profil sont lues avant d'être retirées */
function statsReelles(v){
  const o = {};
  v.querySelectorAll('.pgrid .pstat').forEach(c => { const l = c.querySelector('.pl'), n = c.querySelector('.pv'); if(l && n) o[l.textContent.trim()] = n.textContent.trim(); });
  return o;
}
function leconEnCours(){
  const u = uniteCourante(), n = discsFor(u).length; let k = 0;
  while(k < n && S.done[dkey(u, k)]) k++;
  if(k >= n && u === UNITS.reduce((m, x, i) => x.ready ? i : m, 0)) return 'Parcours terminé';
  return 'Unité ' + UNITS[u].no + ' · leçon ' + Math.min(k + 1, n) + ' sur ' + n;
}
/* v9 : la carte joueuse (piste B, code partagé : _apercu-carte-joueuse-v3/carte.js) ; les valeurs viennent de l'app. Le niveau est celui du rang actuel (la règle « points ET épi » n'est qu'une proposition) */
let derniereCarte = null;
/* v11 : le MEILLEUR épi (la règle « points ET épi » déployée au build 273 : constance.js · meilleureSerie) ; la vraie app d'ici peut être plus ancienne, on le recalcule */
function record(){
  if(typeof meilleureSerie === 'function') return meilleureSerie();
  let m = Math.max(S.serieMax || 0, S.streak || 0, S._streakAvantMiss || 0); const b = S.badges || {};
  for(const [n, k] of [[360, 'serie360'], [120, 'serie120'], [30, 'serie30'], [7, 'serie7'], [3, 'serie3']]) if(b[k]){ m = Math.max(m, n); break; }
  return m;
}
function etatCarte(st){
  const r = rankFor(S.consScore || 0), u = uniteCourante(), n = discsFor(u).length; let k = 0;
  while(k < n && S.done[dkey(u, k)]) k++;
  const sour = (typeof SOURATES !== 'undefined' ? SOURATES : []).find(x => (x.units || []).some(y => y.no === UNITS[u].no)) || {nom:'Al-Fātiḥa'};
  const num = t => parseInt(String(t || '0').replace(/\D/g, ''), 10) || 0;
  return {nom:(S.prenom || '').trim() || 'Toi', points:S.consScore || 0, epi:S.streak || 0, mots:num(st['mots']), mysteres:nCartes(), graines:S.graines || P.graines || 0, tenue:tenue(), fond:fondCarteEff(), couleur:coulCarteEff(), modifiable:true, coins:P.coins, valo:P.valo, cit:0, station:r.idx, sourate:sour.nom, unite:UNITS[u].no, lecon:Math.min(k + 1, n)};
}
const ICO_PARTAGE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>';
function carteJoueuse(st){
  derniereCarte = etatCarte(st);
  return '<section class="lm9-carte-w" aria-label="Ma carte joueuse">'+CARTE.html(derniereCarte)+'<button class="lm9-partage" data-lm="partager">'+ICO_PARTAGE+'Partager ma carte</button></section>';
}
function tabs(o){
  return '<nav class="lm-tabs" aria-label="Rubriques du profil">'+[['carte','Profil'],['indices','Mes indices'],['collection','Mes collections']].map(([id, lab]) => '<button'+(o===id ? ' aria-current="page"' : '')+' data-lm="onglet:'+id+'">'+lab+'</button>').join('')+'</nav>';
}
/* le Profil est la variante B (décidée par Myriam) : trois volets. Le premier : l'utilisateur, la carte, puis les VRAIS succès ; les blocs que la carte remplace (rang, objectif, parcours, statistiques, compte) sont retirés */
function profilB(){
  const v = $('#view-prog'); if(!v) return;
  const o = P.onglet || 'carte';
  if(o === 'carte'){
    const st = statsReelles(v);
    const succes = Array.from(v.children).find(e => e.classList.contains('ccard') && /Succès/.test((e.querySelector('h3') || {}).textContent || ''));
    /* la connexion (déconnectée) et la sortie (connectée) restent : sans elles, plus aucun moyen de se connecter ni de sortir */
    const compte = Array.from(v.children).filter(e => e.classList.contains('ccard') && /Mon compte/.test((e.querySelector('h3') || {}).textContent || ''));
    const connectee = !!v.querySelector('.acct-out');
    v.replaceChildren();
    v.insertAdjacentHTML('beforeend', tabs(o) + profilUtilisateur() + carteJoueuse(st));
    try{ CARTE.ajuster(v); const cw = v.querySelector('.cw'); if(cw) CARTE.brancher(cw); }catch(e){ console.error('LM carte', e); }
    if(succes) v.appendChild(succes);
    compte.forEach(e => v.appendChild(e));
    if(connectee) v.insertAdjacentHTML('beforeend', '<button class="lm-lien" data-lm="deconnexion">Se déconnecter</button>');
  } else { v.innerHTML = tabs(o) + (o === 'indices' ? pageIndices() : pageCollection()); }
}

/* ——— l'onglet Indices : le mystère en cours, puis les mystères résolus par sourate ——— */
function pageIndices(){
  const u = uniteEnCours();
  /* Myriam, 26/11 : plus de titre (l'onglet le dit) ; « Unité N » sur la même ligne que l'instruction */
  const tete = instr => '<div class="lm-page lm7-indices"><section class="lm7-sect" aria-label="Mystère de l’unité '+UNITS[u].no+'"><div class="lm-titre lm7-ligne-instr"><span class="lmy-compte">Unité '+UNITS[u].no+'</span><p class="lm-instr">'+instr+'</p></div>';
  if(!RECIT[u]) return tete('') + venirHTML(u) + '<button class="lm-sec" data-lm="aller:home">Continuer mon unité</button></section>' + resolus() + '</div>';
  const r = rec(u), p = poses(u), n = cnt(r), np = cnt(p), tout = np === NB;
  const dispo = r.some((x, k) => x && !p[k]);
  const instr = sel !== null ? 'Touche son emplacement en pointillé.' : dispo ? 'Glisse un indice sur sa silhouette.' : (n < NB ? 'D’autres indices arrivent.' : '');
  /* v16 : le casier est AU-DESSUS de la scène, en une rangée de petites cases : on glisse un indice sans faire défiler la page */
  let h = tete(instr)+inventaire(u)+scene(u, 'assembly');
  if(tout) h += RECIT[u] ? '<button class="cta lm-cta" data-lm="film">VOIR L’HISTOIRE</button>' : '<p class="lm-instr">Pas encore de récit pour cette unité.</p>';
  if(n < NB) h += '<button class="lm-sec" data-lm="aller:home">Continuer mon unité</button>';
  return h + '</section>' + resolus() + '</div>';
}
function resolus(){
  const us = []; for(let u=0; u<UNITS.length; u++) if(P.collectees[u]) us.push(u);
  let h = '<section class="lm7-sect" aria-labelledby="lm7H2"><h2 class="lm7-h2" id="lm7H2">Mystères résolus</h2>';
  if(!us.length) return h + '<p class="lm7-vide">Les mystères résolus apparaîtront ici.</p></section>';
  const groupes = [];
  us.forEach(u => {
    const s = (typeof SOURATES !== 'undefined' ? SOURATES : []).find(x => (x.units || []).some(y => y.no === UNITS[u].no)) || {nom:'Al-Fātiḥa', ar:'الفاتحة'};
    let g = groupes.find(x => x.s === s); if(!g){ g = {s, us:[]}; groupes.push(g); } g.us.push(u);
  });
  groupes.forEach(g => {
    h += '<h3 class="lm7-sourate"><span class="lm7-sar" lang="ar" dir="rtl">'+esc(g.s.ar)+'</span><span>'+esc(g.s.nom)+'</span></h3><ul class="lm7-lignes">'+
      g.us.map(u => '<li><button class="lm7-ligne" data-lm="zoom:'+u+'" aria-label="Unité '+UNITS[u].no+' : agrandir les neuf indices"><span class="lm7-no">'+UNITS[u].no+'</span>'+carres(u)+'</button></li>').join('')+'</ul>';
  });
  return h + '</section>';
}
/* ——— l'onglet Collection : uniquement les images ; un toucher ouvre l'histoire ——— */
function pageCollection(){
  const cartes = []; for(let u=0; u<UNITS.length; u++) if(P.collectees[u] && RECIT[u]) cartes.push(u);
  const venir = []; for(let u=0; u<UNITS.length; u++) if(UNITS[u].ready && !RECIT[u]) venir.push(u);
  let h = '<div class="lm-page lm7-coll">';
  /* la halte rejoint la collection dès que la sourate est finie (Myriam, 26/11) ; chaque image porte son titre, sur un cartouche sombre */
  const halte = typeof sourateFinie === 'function' && sourateFinie();
  const titreSur = t => '<span class="lm7-titre-img">'+esc(t)+'</span>';
  if(!cartes.length && !P.recitBonus && !halte){
    h += '<div class="lm-vide"><span class="lm-m lm5-vm">'+masc(88, true)+'</span><p>Ta scène deviendra ta première carte.</p><button class="lm-sec" data-lm="onglet:indices">Voir mes indices</button></div>';
  }
  h += '<div class="lm7-vit lm7-vit2'+(cartes.length || P.recitBonus || halte ? '' : ' lm-venir-seul')+'">'+cartes.map(u => '<button class="lm7-tuile" data-lm="film-revoir:'+u+'" aria-label="Revoir l’histoire : '+esc(RECIT[u].titre)+'"><img class="lm7-couv" src="'+DV.base+'couverture-v3.webp" alt="">'+titreSur(RECIT[u].titre)+'</button>').join('')+
    (halte ? '<button class="lm7-tuile" data-lm="halte" aria-label="Revoir la halte : La porte de la naissance"><img class="lm7-couv" src="images-app-alaq/recit-naissance/0.1.jpg" alt="">'+titreSur('La porte de la naissance')+'</button>' : '')+
    (P.recitBonus ? '<button class="lm7-tuile lm7-tuile-livre" data-lm="bientot" aria-label="'+esc(BONUS.titre)+'">'+LIVRE+'</button>' : '')+
    venir.map(u => '<div class="lm7-tuile lm7-tuile-venir" role="img" aria-label="Mystère à venir, unité '+UNITS[u].no+'"><img class="lm7-couv" src="'+IMG_VENIR()+'" alt=""><span class="lm-venir-leg"><b>'+UNITS[u].no+'</b><i>À venir</i></span></div>').join('')+'</div>';
  return h + '</div>';
}

/* ——— la Boutique : des images ; un toucher ouvre la fenêtre d'achat ——— */
/* v9 : le contour de Diya (le filtre « dct ») est rallumé par un style en ligne : la carte d'une tenue est crème en mode sombre, où le contour est éteint par défaut */
const AVEC_CONTOUR = svg => svg.replace(/(<g class="dy-sil" filter="(url\(#[^)]+\))")/, '$1 style="filter:$2"');
function tuile(hb){
  const poss = hb.id === 'classique' || P.possedes.indexOf(hb.id) >= 0, eq = P.habillage === hb.id;
  return '<button class="lm7-t lm9-t'+(eq ? ' eq' : '')+(poss ? ' poss' : '')+'" data-lm="produit:'+hb.id+'" aria-label="'+esc(hb.nom)+', '+(poss ? (eq ? 'déjà achetée, équipée' : 'déjà achetée') : hb.prix+' graines')+'"><span class="lm-m lm7-t-img">'+AVEC_CONTOUR(diya(hb.id, 88, true))+'</span>'+
    (poss ? '<span class="lm9-deja">Déjà achetée</span>' : '<span class="lm10-et" aria-hidden="true"><img class="lm10-et-i" src="'+IMG_CARTE+'etiquette-vide.webp" alt=""><span class="lm10-et-p">'+grain()+'<b>'+hb.prix+'</b></span></span>')+'</button>';
}
function tuileFond(f){
  const poss = aFond(f.id), eq = P.fondCarte === f.id || P.fondProfil === f.id;
  return '<button class="lm7-t lm9-t lm12-f'+(eq ? ' eq' : '')+(poss ? ' poss' : '')+'" data-lm="produit:fond-'+f.id+'" aria-label="'+esc(f.nom)+', '+(poss ? 'déjà acheté' : f.prix+' graines')+'"><span class="lm12-fimg"><img src="'+IMG_CARTE+'fond-'+f.id+'.webp" alt=""></span>'+
    (poss ? '<span class="lm9-deja">'+(f.prix === 0 ? 'Offert' : 'Déjà acheté')+'</span>' : '<span class="lm10-et" aria-hidden="true"><img class="lm10-et-i" src="'+IMG_CARTE+'etiquette-vide.webp" alt=""><span class="lm10-et-p">'+grain()+'<b>'+f.prix+'</b></span></span>')+'</button>';
}
function pageBoutique(){
  const groupe = g => '<h2 class="lm-rub">'+esc(GROUPES_COURTS[g.nom] || g.nom)+'</h2><div class="lm7-vit lm7-vit3">'+g.ids.map(id => tuile(HAB.find(x => x.id === id))).join('')+'</div>';
  return '<div class="lm-page">'+entete()+'<h1 class="lm-h1">Boutique</h1>'+
    '<div class="lm-solde">'+grain()+P.graines+' <small>graines</small></div>'+
    DY.GROUPES.map(groupe).join('')+'<h2 class="lm-rub">Arrière-plans</h2><div class="lm7-vit lm7-vit3">'+CARTE.BOUTIQUE_FONDS.map(tuileFond).join('')+'</div></div>';                /* v9 : plus de récits ni d'indices à acheter pour le moment ; v12 : les arrière-plans */
}
function rendrePage(){
  const v = $('#view-prog'); if(!v) return;
  v.innerHTML = pageBoutique();
}

/* ——— les fenêtres (feuille qui monte du bas) : un produit, la mascotte, un champ à modifier, les neuf indices en 3 × 3 ——— */
let pop = null;     // {type, id, opener}
let erreurAchat = '', achatEnCours = false;      /* v17 : l'achat se fait chez le serveur ; ni l'un ni l'autre ne se garde */
const compteOk = () => { try{ return !!(CLOUD && CLOUD.user && CLOUD.user.id && SB && typeof SB.rpc === 'function'); }catch(e){ return false; } };       /* une session vivante ET un client qui sait appeler le serveur (le mode vitrine n'en a pas) */
function voile(){
  let e = D.getElementById('lmPopup');
  if(!e){ e = D.createElement('div'); e.id = 'lmPopup'; e.className = 'lm7-voile'; D.body.appendChild(e); }
  return e;
}
function bouton(prix){ return grain()+'<b>'+prix+'</b>'; }
/* le bouton ACHETER, quand les graines suffisent : sans compte, ME CONNECTER à la place ; hors ligne, la phrase d'échec ; pendant l'achat, le bouton éteint */
function boutonAchat(id, prix){
  const b = (dis) => '<button class="cta lm7-pop-cta lm7-achat"'+(dis ? ' disabled' : ' data-lm="acheter:'+id+'"')+'>ACHETER '+bouton(prix)+'</button>';
  if(!compteOk()) return '<button class="cta lm7-pop-cta" data-lm="se-connecter">ME CONNECTER</button>';       /* sans compte : UN bouton vif qui ouvre la connexion — ni phrase, ni bouton mort */
  /* chaque phrase d'avertissement est insécable : à deux lignes, la coupe tombe ENTRE les phrases, jamais un mot seul (grands caractères, 360 et 390) */
  const dit = erreurAchat.split('. ').map((x, i, t) => i < t.length - 1 ? x + '.' : x).map(x => '<span class="lm-nb">'+esc(x)+'</span>').join(' ');
  return (erreurAchat ? '<p class="lm7-pop-manque" role="alert">'+dit+'</p>' : '')+b(achatEnCours);
}
function casesFond(cible){
  const cur = cible === 'carte' ? fondCarteEff() : fondProfilEff();
  const uni = '<button class="lm7-t lm12-c lm12-uni'+(cur === 'uni' ? ' eq' : '')+'" data-lm="fond-choisir-'+cible+':uni" aria-pressed="'+(cur === 'uni')+'" aria-label="Uni : crème en mode sombre, marron foncé en mode clair"><span class="lm12-fimg lm12-unie"'+((cible === 'carte' ? coulCarteEff() : coulProfilEff()) ? ' style="background:'+(cible === 'carte' ? coulCarteEff() : coulProfilEff())+'"' : '')+'></span><span class="lm12-cap">Uni</span></button>';
  return uni + CARTE.BOUTIQUE_FONDS.map(f => aFond(f.id)
    ? '<button class="lm7-t lm12-c'+(cur === f.id ? ' eq' : '')+'" data-lm="fond-choisir-'+cible+':'+f.id+'" aria-pressed="'+(cur === f.id)+'" aria-label="'+esc(f.nom)+(cur === f.id ? ', choisi' : '')+'"><span class="lm12-fimg"><img src="'+IMG_CARTE+'fond-'+f.id+'.webp" alt=""></span></button>'
    : '<button class="lm7-t sombre lm12-c" data-lm="produit:fond-'+f.id+'" aria-label="'+esc(f.nom)+', pas encore acheté : voir"><span class="lm12-fimg"><img src="'+IMG_CARTE+'fond-'+f.id+'.webp" alt=""></span></button>').join('');
}
function blocCouleurs(cible){
  const cur = (cible === 'carte' ? coulCarteEff() : coulProfilEff()).toLowerCase(), actif = (cible === 'carte' ? fondCarteEff() : fondProfilEff()) === 'uni';
  const sw = c => { const on = actif && cur === c[2].toLowerCase(); return '<button class="lm12-sw'+(on ? ' on' : '')+'" style="background:'+c[2]+'" data-lm="couleur-'+cible+':'+c[2]+'" aria-pressed="'+on+'" aria-label="'+esc(c[1])+'"></button>'; };
  const def = '<button class="lm12-sw lm12-sw-def'+(actif && !cur ? ' on' : '')+'" data-lm="couleur-'+cible+':defaut" aria-pressed="'+(actif && !cur)+'" aria-label="Par défaut : crème en mode sombre, marron foncé en mode clair"></button>';
  const perso = !!cur && !CARTE.COULEURS.some(c => c[2].toLowerCase() === cur);
  const autre = '<label class="lm12-sw lm12-sw-autre'+(actif && perso ? ' on' : '')+'" aria-label="Une autre couleur"><input type="color" data-cible="'+cible+'" value="'+(cur || '#f2e9da')+'" aria-label="Choisir une autre couleur"></label>';
  return '<h3 class="lm12-st">Couleur de l’uni</h3><div class="lm12-sws">'+def+CARTE.COULEURS.map(sw).join('')+autre+'</div>';
}
function contenuPopup(q){
  if(q.type === 'produit' && /^fond-/.test(q.id)){
    const f = CARTE.fondDeBoutique(q.id.slice(5)); if(!f) return {label:'', html:''};
    const poss = aFond(f.id), sc = fondCarteEff() === f.id, sp = fondProfilEff() === f.id;
    const manque = P.graines < f.prix;
    const act = poss
      ? '<button class="cta lm7-pop-cta'+(sc ? ' lm7-fait' : '')+'" data-lm="fond-pour-carte:'+f.id+'"'+(sc ? ' disabled' : '')+'>'+(sc ? '✓ SUR MA CARTE' : 'POUR MA CARTE')+'</button>'+
        '<button class="cta lm7-pop-cta lm12-2'+(sp ? ' lm7-fait' : '')+'" data-lm="fond-pour-profil:'+f.id+'"'+(sp ? ' disabled' : '')+'>'+(sp ? '✓ SUR MON PROFIL' : 'POUR MON PROFIL')+'</button>'
      : manque ? '<p class="lm7-pop-manque">Il te manque '+(f.prix - P.graines)+' graines.</p><button class="cta lm7-pop-cta lm7-achat" disabled>ACHETER '+bouton(f.prix)+'</button>'
      : boutonAchat('fond-'+f.id, f.prix);
    return {label:f.nom, html:'<span class="lm12-pop-fond"><img src="'+IMG_CARTE+'fond-'+f.id+'.webp" alt=""></span><h2 class="lm7-pop-t">'+esc(f.nom)+'</h2>'+(f.quand ? '<p class="lm7-pop-q">'+esc(f.quand)+'</p>' : '')+'<p class="lm7-pop-d">'+esc(f.note || '')+'</p>'+act};
  }
  if(q.type === 'fondcarte') return {label:'Arrière-plan de ma carte', html:'<h2 class="lm7-pop-t">Arrière-plan de ma carte</h2><div class="lm7-vit lm7-vit3 lm7-vit-p">'+casesFond('carte')+'</div>'+blocCouleurs('carte')+'<div class="lm7-pied"><button class="lm-sec lm7-pop-cta" data-lm="boutique-popup">Boutique</button></div>'};
  if(q.type === 'produit'){
    const recit = q.id === 'recit', hb = recit ? null : tenueDe(q.id);
    if(!recit && !hb) return {label:'', html:''};
    const poss = recit ? P.recitBonus : (q.id === 'classique' || P.possedes.indexOf(q.id) >= 0), eq = !recit && P.habillage === q.id, prix = recit ? BONUS.prix : hb.prix;
    const nom = recit ? BONUS.titre : hb.nom, desc = recit ? 'Le récit d’' + BONUS.qui + '.' : (hb.note || ''), quand = recit ? '' : periode(hb);
    const image = recit ? '<span class="lm7-pop-livre">'+LIVRE+'</span>' : '<span class="lm-m lm7-pop-img">'+diya(q.id, 150, true)+'</span>';
    let act;
    if(recit) act = poss ? '<p class="lm7-pop-ok">Dans ta collection</p><button class="cta lm7-pop-cta" data-lm="onglet-collection">VOIR MA COLLECTION</button>'
      : P.graines < prix ? '<p class="lm7-pop-manque">Il te manque '+(prix - P.graines)+' graines.</p><button class="cta lm7-pop-cta lm7-achat" disabled>ACHETER '+bouton(prix)+'</button>'
      : boutonAchat('recit', prix);
    else if(eq) act = '<button class="cta lm7-pop-cta lm7-fait" disabled>✓ ÉQUIPÉE</button>';
    else if(poss) act = '<button class="cta lm7-pop-cta" data-lm="equiper:'+q.id+'">ÉQUIPER</button>';
    else if(P.graines < prix) act = '<p class="lm7-pop-manque">Il te manque '+(prix - P.graines)+' graines.</p><button class="cta lm7-pop-cta lm7-achat" disabled>ACHETER '+bouton(prix)+'</button>';
    else act = boutonAchat(q.id, prix);
    return {label:nom, html: image+'<h2 class="lm7-pop-t">'+esc(nom)+'</h2>'+(quand ? '<p class="lm7-pop-q">'+esc(quand)+'</p>' : '')+'<p class="lm7-pop-d">'+esc(desc)+'</p>'+act};
  }
  if(q.type === 'avatar'){
    const tous = [CLASSIQUE].concat(HAB);
    const case_ = hb => {
      const poss = hb.id === 'classique' || P.possedes.indexOf(hb.id) >= 0, eq = P.habillage === hb.id;
      return poss ? '<button class="lm7-t'+(eq ? ' eq' : '')+'" data-lm="equiper-ferme:'+hb.id+'" aria-pressed="'+eq+'" aria-label="'+esc(hb.nom)+(eq ? ', équipée' : '')+'"><span class="lm-m lm7-t-img">'+diya(hb.id, 70, true)+'</span></button>'
        : '<button class="lm7-t sombre" data-lm="produit:'+hb.id+'" aria-label="'+esc(hb.nom)+', pas encore achetée : voir"><span class="lm-m lm7-t-img">'+diya(hb.id, 70, true)+'</span></button>';
    };
    const onglet = q.onglet === 'fond' ? 'fond' : 'tenue';
    const ong = '<div class="lm12-ong" role="tablist" aria-label="Personnaliser mon disque">'+[['tenue','Tenue'],['fond','Arrière-plan']].map(([k, l]) => '<button role="tab" aria-selected="'+(onglet === k)+'" class="'+(onglet === k ? 'on' : '')+'" data-lm="avatar-onglet:'+k+'">'+l+'</button>').join('')+'</div>';
    let corps;
    if(onglet === 'tenue') corps = '<div class="lm7-vit lm7-vit3 lm7-vit-p">'+tous.map(case_).join('')+'</div>';
    else corps = '<div class="lm7-vit lm7-vit3 lm7-vit-p">'+casesFond('profil')+'</div>'+blocCouleurs('profil');
    return {label:'Mon disque', html:'<h2 class="lm7-pop-t">Mon disque</h2>'+ong+corps+'<div class="lm7-pied"><button class="lm-sec lm7-pop-cta" data-lm="boutique-popup">Boutique</button></div>'};
  }
  if(q.type === 'modifier'){
    const prenom = q.id === 'prenom', lib = prenom ? 'Surnom' : 'Mail', val = prenom ? (S.prenom || '') : P.mail;
    return {label:'Modifier ' + lib.toLowerCase(), html:'<h2 class="lm7-pop-t">'+lib+'</h2><label class="lm-sr" for="lmChamp">'+lib+'</label><input class="lm7-input" id="lmChamp" type="'+(prenom ? 'text' : 'email')+'" value="'+esc(val)+'" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="'+(prenom ? 24 : 80)+'" data-champ="'+q.id+'"><p class="lm7-erreur" id="lmErreur" role="alert"></p><button class="cta lm7-pop-cta" data-lm="enregistrer:'+q.id+'">ENREGISTRER</button>'};
  }
  if(q.type === 'zoom'){
    const u = +q.id;
    return {label:'Unité ' + UNITS[u].no + ' : les neuf indices', html:'<h2 class="lm7-pop-t">Unité '+UNITS[u].no+'</h2><div class="lm7-tab33">'+OBJ.map((o, i) => '<span class="lm7-case"><img src="'+objSrc(o)+'" alt="'+esc(o.nom)+'"></span>').join('')+'</div>'+(RECIT[u] ? '<button class="cta lm7-pop-cta" data-lm="film-revoir:'+u+'">VOIR L’HISTOIRE</button>' : '')};
  }
  if(q.type === 'partage') return {label:'Partager ma carte', html:'<h2 class="lm7-pop-t">Partager ma carte</h2><img class="lm9-apercu" id="lm9Img" alt="Aperçu de l’image qui serait partagée"><p class="lm9-txt" id="lm9Txt">'+esc(derniereCarte ? CARTE.texte(derniereCarte) : '')+'</p><div class="lm9-actions"><button class="cta lm7-pop-cta" data-lm="partage-envoi">Envoyer…</button><a class="lm-sec lm9-creme" id="lm9Dl" download="carte-alaq.png" href="#">Enregistrer l’image</a><button class="lm-sec lm9-creme" data-lm="partage-copie">Copier le texte</button></div><p class="lm9-msg" id="lm9Msg" role="status" aria-live="polite"></p>'};
  if(q.type === 'bientot') return {label:BONUS.titre, html:'<span class="lm7-pop-livre">'+LIVRE+'</span><h2 class="lm7-pop-t">'+esc(BONUS.titre)+'</h2><p class="lm7-pop-d">'+esc(BONUS.qui)+' · bientôt dans l’app.</p>'};
  return {label:'', html:''};
}
function rendrePopup(){
  if(!pop) return; const e = voile(), c = contenuPopup(pop); e.classList.toggle('haut', pop.type === 'modifier');
  e.innerHTML = '<div class="lm7-feuille" role="dialog" aria-modal="true" aria-label="'+esc(c.label)+'"><button class="lm7-fermer" data-lm="fermer-popup" aria-label="Fermer">✕</button><div class="lm7-defile">'+c.html+'</div></div>';
  if(pop.type === 'partage') majPartage();
}
const partage = {blob:null, url:null, msg:''};
function majPartage(){
  const i = D.getElementById('lm9Img'), a = D.getElementById('lm9Dl'), m = D.getElementById('lm9Msg');
  if(i && partage.url) i.src = partage.url; if(a && partage.url) a.href = partage.url; if(m) m.textContent = partage.msg;
}
function lancerPartage(){
  partage.blob = null; partage.msg = 'Dessin de l’image…'; ouvrirPopup('partage');
  CARTE.png().then(b => { partage.blob = b; if(partage.url) URL.revokeObjectURL(partage.url); partage.url = URL.createObjectURL(b); partage.msg = ''; majPartage(); window.__lmPartage = {octets:b.size, type:b.type}; })
    .catch(e => { partage.msg = 'L’image n’a pas pu être dessinée ici (' + e.message + ') : fais une capture d’écran de la carte.'; majPartage(); window.__lmPartage = {erreur:e.message}; });
}
function envoyerCarte(){
  if(!partage.blob){ partage.msg = 'L’image n’est pas encore prête.'; return majPartage(); }
  const f = new File([partage.blob], 'carte-alaq.png', {type:'image/png'}), t = CARTE.texte(derniereCarte);
  if(navigator.canShare && navigator.canShare({files:[f]})) return navigator.share({files:[f], text:t, title:'Ma carte Alaq'}).then(() => { partage.msg = 'Envoyée.'; majPartage(); }).catch(e => { partage.msg = (e && e.name === 'AbortError') ? '' : 'Partage impossible ici : « Enregistrer l’image ».'; majPartage(); });
  if(navigator.share) return navigator.share({text:t}).then(() => { partage.msg = 'Texte envoyé (l’image ne passe pas sur cet appareil : « Enregistrer l’image »).'; majPartage(); }).catch(() => {});
  partage.msg = 'La feuille de partage du téléphone n’existe pas sur cet ordinateur (elle existe sur iPhone, en https). Utilise « Enregistrer l’image ».'; majPartage();
}
function copierTexte(){
  (navigator.clipboard ? navigator.clipboard.writeText(CARTE.texte(derniereCarte)) : Promise.reject()).then(() => { partage.msg = 'Texte copié.'; majPartage(); }, () => { partage.msg = 'Copie impossible ici : sélectionne le texte ci-dessus.'; majPartage(); });
}
function ouvrirPopup(type, id){
  erreurAchat = '';
  pop = {type, id, opener: D.activeElement};
  rendrePopup(); const e = voile(); e.classList.add('on');
  let b = null; for(const q of (type === 'modifier' ? ['.lm7-input'] : []).concat(['.cta:not([disabled])', '.lm7-input', '.lm7-t:not(.sombre)', '.lm-sec'])){ b = e.querySelector(q); if(b) break; }      // la saisie : le champ ; sinon l'action principale d'abord, jamais la croix
  if(!b){ e.setAttribute('tabindex', '-1'); b = e; }       // rien d'actif : le focus va à la feuille elle-même (aucun anneau sur la croix)
  try{ b.focus({preventScroll:true}); }catch(x){}
}
function fermerPopup(){
  const e = D.getElementById('lmPopup'); if(e){ e.classList.remove('on'); e.innerHTML = ''; }
  const o = pop && pop.opener; pop = null;
  if(o && o !== D.body && D.contains(o)) try{ o.focus({preventScroll:true}); }catch(x){}
}
const popupOuvert = () => !!pop;
/* après un achat ou une tenue équipée : la fenêtre ET la page derrière se repeignent */
function majPopup(){ if(pop) rendrePopup(); }

/* ——— les enveloppes des vraies fonctions ——— */
const _rh = window.renderHome;
window.renderHome = function(){
  const f = (typeof _homeFocusPending !== 'undefined') ? _homeFocusPending : false;
  const r = _rh.apply(this, arguments);
  try{
    /* juste sous le bandeau d'unité, donc AVANT l'ancre collante de la pastille « révision » : elle retombe sous nous, jamais dessus ; recomposé à chaque rendu (la mascotte suit la tenue) */
    const b = D.getElementById('unitBanner'), ex = D.getElementById('lmBandeau'), u = b && b.dataset.u != null && b.dataset.u !== '' ? +b.dataset.u : uniteCourante();
    if(ex) ex.remove();
    if(b){ const hb = bandeauApprendre(u); if(hb) b.insertAdjacentHTML('afterend', hb); integrerIndices(u); hauteurBandeau(); setTimeout(hauteurBandeau, 60); }
    if(f && typeof focusCurrentDisc === 'function') focusCurrentDisc();
  }catch(e){ console.error('LM renderHome', e); }
  return r;
};
const _sbn = window.setBanner;
window.setBanner = function(u){ const r = _sbn.apply(this, arguments); try{ majBandeau(+u); }catch(e){} return r; };
const _ri = window.renderIslam;
window.renderIslam = function(){
  const r = _ri.apply(this, arguments);
  try{ const g = $('#view-islam .isl-grille'); if(g) g.insertAdjacentHTML('beforebegin', bandeauIslam()); }catch(e){ console.error('LM renderIslam', e); }
  return r;
};
const _rp = window.renderProg;
window.renderProg = function(){
  if(P.page){ rendrePage(); return; }
  _rp.apply(this, arguments);
  try{ profilB(); }catch(e){ console.error('LM renderProg', e); }
};
const _st = window.showTab;
window.showTab = function(name, sub){
  if(!_interne){ P.page = null; sel = null; if(name !== 'prog') P.onglet = 'carte'; }
  if(pop) fermerPopup();
  return _st.apply(this, arguments);
};

/* ——— navigation entre les pages ——— */
function ouvrir(page, depuis){
  if(page === 'boutique') synchroAchats(true);                      // la Boutique s'ouvre sur les achats à jour
  P.depuis = depuis || 'prog';
  if(page === 'indices'){ P.vue = null; sel = null; }
  if(page === 'indices' || page === 'collection'){ P.onglet = page; P.page = null; } else P.page = page;
  _interne = true; try{ showTab('prog'); } finally { _interne = false; }
  /* les trois volets SONT le Profil : « Plus » reste allumé ; la Boutique (page à part) laisse allumé l'onglet d'où l'on vient */
  const dansLeProfil = (page === 'indices' || page === 'collection');
  if(P.depuis !== 'prog' && !dansLeProfil){ const bp = D.getElementById('bn-plus'); if(bp) bp.classList.remove('active'); const b = D.getElementById('bn-'+P.depuis); if(b) b.classList.add('active'); }
}
function retour(){ P.page = null; showTab(P.depuis || 'prog'); }
function rerendre(){
  const y = window.scrollY, f = !pop && D.activeElement && D.activeElement.getAttribute ? D.activeElement.getAttribute('data-lm') : null;
  window.renderProg(); window.scrollTo(0, y);
  if(f){ const n = Array.from(D.querySelectorAll('[data-lm]')).find(x => x.getAttribute('data-lm') === f); if(n) try{ n.focus({preventScroll:true}); }catch(x){} }
}

/* ——— poser les objets ——— */
function poser(k){
  const u = uniteEnCours(); if(!rec(u)[k] || poses(u)[k]) return;
  poses(u)[k] = true; sel = null; rerendre(); annonce('Indice déposé : ' + OBJ[k].nom + '. ' + cnt(poses(u)) + ' sur 9.');
  if(cnt(poses(u)) === NB && RECIT[u] && !P.collectees[u]) setTimeout(() => lancerFilm(u), 900);   // le dernier placement déclenche l'histoire
}
/* « sur son emplacement » : dans sa boîte élargie d'un quart, et au moins à 7 % de la largeur du centre (la lanterne ne fait que 5 %) */
function zone(k, px, py){
  const p = posOf(OBJ[k].id), mx = Math.max(p[2] * 0.5 * 1.25, 7), my = Math.max(hauteurPct(OBJ[k].id) * 0.5 * 1.25, 7 * 0.8);
  return Math.abs(px - p[0]) <= mx && Math.abs(py - p[1]) <= my;
}
const pct = (e, sc) => { const r = sc.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100]; };
const sceneDeLaPage = () => D.querySelector('#view-prog .lm-scene.lm5#lm5Scene');

/* ——— glisser un objet sur son emplacement (souris, doigt et stylet de la même façon) ——— */
let drag = null, apresDrag = false;
function leverDoigt(e){ return e.clientY - (drag && drag.t === 'touch' ? 46 : 0); }
D.addEventListener('pointerdown', e => {
  const b = e.target.closest && e.target.closest('.lm-o.dispo'); if(!b || (e.pointerType === 'mouse' && e.button !== 0)) return;
  drag = {i:+b.dataset.i, b, x0:e.clientX, y0:e.clientY, actif:false, clone:null, t:e.pointerType};
});
D.addEventListener('pointermove', e => {
  if(!drag) return;
  const sc = sceneDeLaPage(); if(!sc){ drag = null; return; }
  if(!drag.actif){
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0; if(dx * dx + dy * dy < 49) return;
    const r = sc.getBoundingClientRect(), c = D.createElement('img');
    c.className = 'lm5-glisse'; c.alt = ''; c.src = objSrc(OBJ[drag.i]); c.style.width = Math.max(44, posOf(OBJ[drag.i].id)[2] / 100 * r.width) + 'px';
    D.body.appendChild(c); drag.clone = c; drag.actif = true; sel = drag.i; drag.br = drag.b.getBoundingClientRect();
    const s = sc.querySelector('.lm5-slot[data-slot="'+OBJ[drag.i].id+'"]'); if(s) s.classList.add('pret');
  }
  const y = leverDoigt(e); drag.clone.style.left = e.clientX + 'px'; drag.clone.style.top = y + 'px';
  const q = pct({clientX:e.clientX, clientY:y}, sc), s = sc.querySelector('.lm5-slot[data-slot="'+OBJ[drag.i].id+'"]');
  if(s) s.classList.toggle('cible', zone(drag.i, q[0], q[1]));
  e.preventDefault();
}, {passive:false});
function finDrag(e, annule){
  if(!drag) return; const d = drag; drag = null;
  if(!d.actif) return;
  apresDrag = true; setTimeout(() => { apresDrag = false; }, 60);               // le clic qui suit un vrai glisser ne doit rien faire
  const sc = sceneDeLaPage(); d.clone.classList.add('vole');
  const q = sc && !annule ? pct({clientX:e.clientX, clientY:e.clientY - (d.t === 'touch' ? 46 : 0)}, sc) : null;
  if(sc && q && zone(d.i, q[0], q[1])){
    const r = sc.getBoundingClientRect(), p = posOf(OBJ[d.i].id);
    d.clone.style.left = (r.left + p[0] / 100 * r.width) + 'px'; d.clone.style.top = (r.top + p[1] / 100 * r.height) + 'px'; d.clone.style.width = (p[2] / 100 * r.width) + 'px';
    setTimeout(() => { d.clone.remove(); poser(d.i); }, 200);
  } else {
    d.clone.style.left = (d.br.left + d.br.width / 2) + 'px'; d.clone.style.top = (d.br.top + d.br.height / 2) + 'px'; d.clone.style.opacity = '0';
    setTimeout(() => { d.clone.remove(); }, 220); sel = null; rerendre(); annonce('Pas ici : cherche la silhouette en pointillé de cet indice.');
  }
}
D.addEventListener('pointerup', e => finDrag(e, false));
D.addEventListener('pointercancel', e => finDrag(e, true));

/* ——— l'histoire : les images du récit, sous-titrées en arabe (grand) et en français (la traduction) ——— */
const NOMS_ECRANS = {lmObjetNeuf:'Nouvel indice', lmRecompense:'Ta nouvelle carte', lmFilm:'Histoire'};
function ecran(id, cls){
  let e = D.getElementById(id);
  if(!e){ e = D.createElement('div'); e.id = id; e.className = cls; e.setAttribute('role', 'dialog'); e.setAttribute('aria-modal', 'true'); e.setAttribute('aria-label', NOMS_ECRANS[id] || ''); D.body.appendChild(e); }
  return e;
}
const montre = e => { e.classList.add('on'); const b = e.querySelector('.cta') || e.querySelector('button:not(.lm-x)') || e.querySelector('button'); if(b) try{ b.focus({preventScroll:true}); }catch(x){} };
/* l'arabe en grand (UNE taille pour toute l'histoire ; seules les phrases les plus longues rapetissent, jamais sous 20 px), le français dessous ; la case FR cache la traduction, comme dans les haltes */
function sousTitres(d){
  /* v9 : chaque mot est une case (les soudures insécables restent dans leur mot) : il s'allume quand sa voix arrive */
  const mots = String(d.ar).split(' ').filter(Boolean).map(m => '<span class="lm9-w">'+esc(m)+'</span>').join(' ');
  return '<p class="lm7-ar" dir="rtl" lang="ar">'+mots+'</p>'+(P.frSous ? '<p class="lm7-fr">'+esc(d.fr)+'</p>' : '');
}
/* la zone des sous-titres a une hauteur FIXE (l'image ne saute pas d'une diapo à l'autre) : si le texte est plus long, l'arabe et le français rapetissent par pas, jamais sous 20 et 14,5 px */
function ajusterSous(){
  const s = $('#lmLegende'); if(!s) return;
  const ar = s.querySelector('.lm7-ar'), fr = s.querySelector('.lm7-fr'); if(!ar) return;
  ar.style.fontSize = ''; if(fr) fr.style.fontSize = '';
  let a = parseFloat(getComputedStyle(ar).fontSize), f = fr ? parseFloat(getComputedStyle(fr).fontSize) : 0, n = 0;
  const amin = Math.max(14, Math.round(a * 0.7));      // v8 : le plancher suit la taille choisie (la v7 : 32 → 20)
  while(s.scrollHeight > s.clientHeight + 1 && n++ < 20){
    if(a <= amin && (!fr || f <= 14.5)) break;
    a = Math.max(amin, a - 1); ar.style.fontSize = a + 'px'; if(fr){ f = Math.max(14.5, f - 0.5); fr.style.fontSize = f + 'px'; }
  }
}
const sousTitresMaj = d => { const l = $('#lmLegende'); if(!l) return; l.innerHTML = sousTitres(d); ajusterSous(); boucleMots(); };
/* v9 : les mots de l'arabe s'allument au fil de la lecture. Ici l'horloge est celle de la diapo (la voix de Myriam n'est pas encore enregistrée : avec elle, ce sera l'horloge de l'audio, comme dans la halte) ; chaque mot pèse ses lettres */
let raf = 0;
function boucleMots(){
  cancelAnimationFrame(raf);
  const e = D.getElementById('lmFilm'); if(!e || !e.classList.contains('on') || !RECIT[filmU]) return;
  const ws = e.querySelectorAll('.lm9-w');
  if(ws.length){
    const d = RECIT[filmU].slides[shot], total = DUREE_DIAPO(d), reste = playing ? Math.max(0, restant - (Date.now() - debut)) : restant;
    const p = Math.min(1, Math.max(0, (1 - reste / total) / 0.8));        // la lecture occupe les 80 % premiers du temps de la diapo
    const t = d.voix ? heureDiapo(d, reste, total) : 0;
    mascAnimer(d, t);
    let tot = 0; ws.forEach(w => { tot += w.textContent.length + 1; });
    let cum = 0;
    ws.forEach((w, i) => {
      const deb = cum / tot; cum += w.textContent.length + 1; const fin = cum / tot;
      const h = d.voix && d.voix.mots[i];
      const lu = h ? t >= h[1] : p >= fin, ici = h ? (!lu && t >= h[0] && t > 0) : (!lu && p >= deb && p > 0);
      if(w.classList.contains('lu') !== lu) w.classList.toggle('lu', lu);
      if(w.classList.contains('ici') !== ici) w.classList.toggle('ici', ici);
    });
  }
  raf = requestAnimationFrame(boucleMots);
}
const TAILLES_AR = [18, 22, 26, 32];
/* v8 : la taille de l'arabe et la place des sous-titres se lisent sur l'écran de l'histoire (data-ar, data-pos) */
function reglerFilm(){
  const e = D.getElementById('lmFilm'); if(!e) return;
  e.dataset.ar = String(P.filmAr); e.dataset.pos = P.filmPos;
  const t = e.querySelector('[data-lm="film-taille"]'); if(t) t.textContent = 'Aa ' + P.filmAr;
  ajusterSous();
}
function filmHTML(u){
  const R = RECIT[u], d = R.slides[shot];
  const imgs = R.images.map(n => '<img class="lm5-plan'+(n === d.img ? ' on' : '')+'" data-img="'+n+'" src="'+IMAGES_RECIT()+n+'.webp" alt="">').join('');
  return '<div class="lm7-prog" aria-hidden="true"><i id="lmProg" style="width:'+Math.round((shot+1)/R.slides.length*100)+'%"></i></div><button class="lm-x" data-lm="fermer-film" aria-label="Fermer">✕</button><label class="lm7-fr-opt"><input type="checkbox" id="lmFr"'+(P.frSous ? ' checked' : '')+'><span>FR</span></label>'+
    '<div class="lm5-film'+(playing ? '' : ' is-paused')+'" id="lm5Film" data-lm="pause">'+imgs+'</div>'+
    '<p class="lm-pas" id="lmPas">'+(shot+1)+'/'+R.slides.length+'</p><div class="lm7-sub" id="lmLegende" aria-live="polite">'+sousTitres(d)+'</div>'+
    '<div class="lm-film-actions"><button class="lm-sec" id="lmPause" data-lm="pause">'+(playing ? 'Pause' : 'Reprendre')+'</button><button class="lm-sec" data-lm="suite">Suite</button></div>';
}
function planifier(){ clearTimeout(timer); debut = Date.now(); timer = setTimeout(finDiapo, restant); }
function lancerFilm(u){
  const r = D.getElementById('lmRecompense'); if(r) r.classList.remove('on');
  if(pop) fermerPopup();
  filmU = u; shot = 0; restant = DUREE_DIAPO(RECIT[u].slides[0]);
  playing = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);    // « réduire les animations » : l'histoire démarre en pause
  const e = ecran('lmFilm', 'finish'); e.classList.add('surimp'); e.innerHTML = filmHTML(u); e.dataset.ar = String(P.filmAr); e.dataset.pos = P.filmPos; montre(e); e.setAttribute('tabindex', '-1'); try{ e.focus({preventScroll:true}); }catch(x){} mascCreer(e); mascPoser(RECIT[u].slides[0]); ajusterSous(); boucleMots(); if(playing){ planifier(); voixDemarrer(RECIT[u].slides[0]); }      // le focus va à l'écran lui-même : aucun anneau sur Pause ; la voix part dans le geste du toucher
}
function avancer(){
  clearTimeout(timer);
  const R = RECIT[filmU], e = D.getElementById('lmFilm'); if(!e || !e.classList.contains('on')) return;
  if(shot >= R.slides.length - 1){ ecranRecompense(filmU); return; }
  shot++; const d = R.slides[shot]; restant = DUREE_DIAPO(d);
  e.querySelectorAll('.lm5-plan').forEach(i => i.classList.toggle('on', i.dataset.img === d.img));
  sousTitresMaj(d); mascPoser(d); $('#lmPas').textContent = (shot+1)+'/'+R.slides.length; const pg = $('#lmProg'); if(pg) pg.style.width = Math.round((shot+1)/R.slides.length*100)+'%';
  if(playing){ planifier(); voixDemarrer(d); } else voixArreter();
}
function pause(){
  const f = $('#lm5Film');
  if(playing){ restant = Math.max(1, restant - (Date.now() - debut)); clearTimeout(timer); playing = false; voixArreter(); }
  else{
    playing = true; planifier();
    const d = RECIT[filmU].slides[shot];
    if(VOIX && voixDe === d){ try{ const q = VOIX.play(); if(q && q.catch) q.catch(() => {}); }catch(x){} }     // la même diapo : la voix reprend où elle s'est arrêtée
    else voixDemarrer(d, DUREE_DIAPO(d) - restant);                  // une autre diapo (Suite en pause, ou démarrage en pause) : la voix part de l'heure de l'horloge
  }
  if(f) f.classList.toggle('is-paused', !playing);
  const b = $('#lmPause'); if(b) b.textContent = playing ? 'Pause' : 'Reprendre';
}
function fermerFilm(){ clearTimeout(timer); voixArreter(); const e = D.getElementById('lmFilm'); if(e) e.classList.remove('on'); rerendre(); }
function ecranRecompense(u){
  clearTimeout(timer); voixArreter(); const f = D.getElementById('lmFilm'); if(f) f.classList.remove('on');
  const e = ecran('lmRecompense', 'finish');
  e.innerHTML = '<p class="lm-eyebrow">'+titre()+'</p><h2>Ta nouvelle carte</h2>'+ficheHTML(u)+'<button class="cta" style="max-width:300px" data-lm="conserver:'+u+'">CONSERVER</button><button class="lm-lien" data-lm="film-revoir:'+u+'">Revoir l’histoire</button>';
  montre(e); try{ confettiBurst(); }catch(x){}
}
function conserver(u){
  P.collectees[u] = true; const e = D.getElementById('lmRecompense'); if(e) e.classList.remove('on');
  ouvrir('collection', P.depuis);
}

/* ——— la Boutique : un achat est un seul toucher, dans la fenêtre du produit ; il se fait chez le SERVEUR (acheter, plus bas) ——— */
function choisirFond(cible, id, ferme){
  if(cible === 'carte'){ if(!(id === 'uni' || (fondConnu(id) && aFond(id)))) return; P.fondCarte = id; }
  else { if(!(id === 'uni' || (fondConnu(id) && aFond(id)))) return; P.fondProfil = id; }
  try{ saveLocal(); }catch(e){}
  rerendre(); if(ferme) fermerPopup(); else majPopup();
  annonce(cible === 'carte' ? 'Arrière-plan de ta carte changé.' : 'Arrière-plan de ton disque changé.');
}
function choisirCouleur(cible, v){
  const hex = v === 'defaut' ? '' : v;
  if(hex !== '' && !CARTE.couleurOk(hex)) return;
  if(cible === 'carte'){ P.coulCarte = hex; P.fondCarte = 'uni'; } else { P.coulProfil = hex; P.fondProfil = 'uni'; }
  try{ saveLocal(); }catch(e){}
  rerendre(); majPopup();
  annonce(hex ? 'Couleur choisie.' : 'Couleur par défaut : crème en mode sombre, marron foncé en mode clair.');
}
/* ——— l'achat se fait chez le SERVEUR (acheter_diya) : il certifie le solde, fixe le prix et ne vend qu'une fois chaque objet ; le téléphone demande, puis écrit ce que le serveur a répondu ——— */
let achatsFait = false, achatsEnVol = false, achatsSeq = 0, achatsPour = '', achatsEssai = 0;
async function synchroAchats(force){
  if(!compteOk() || achatsEnVol) return;
  const uid = CLOUD.user.id;
  if(!force && (achatsFait && achatsPour === uid || Date.now() - achatsEssai < 30000)) return;       // sans réponse, on ne réessaie qu'une fois par demi-minute
  achatsEnVol = true; achatsEssai = Date.now(); const seq = achatsSeq;
  try{
    try{ await _depiler(); }catch(e){}
    const rep = await _rpcDe(uid, 'diya_mes_achats', {}, 12000, 'achats Diya');
    if(!CLOUD.user || CLOUD.user.id !== uid || seq !== achatsSeq || achatEnCours || !rep || rep.error || !Array.isArray(rep.data)) return;     // un achat ou un autre compte est passé entre-temps : cette réponse est périmée
    achatsFait = true; achatsPour = uid;
    const tenues = ['classique'], fonds = ['nuit'];
    rep.data.forEach(it => {
      const m = /^(tenue|fond):([a-z0-9-]{1,40})$/.exec(String(it)); if(!m) return;
      if(m[1] === 'tenue'){ if(tenues.indexOf(m[2]) < 0 && HAB.some(h => h.id === m[2])) tenues.push(m[2]); }
      else if(fonds.indexOf(m[2]) < 0 && fondConnu(m[2])) fonds.push(m[2]);
    });
    const l = L(), memes = (a, b) => a.length === b.length && a.every(x => b.indexOf(x) >= 0);
    if(memes(tenues, l.possedes) && memes(fonds, l.fondsPoss)) return;
    l.possedes = tenues; l.fondsPoss = fonds;                                   // le serveur fait foi : ce qui a été payé, rien d'autre
    if(l.possedes.indexOf(l.habillage) < 0) l.habillage = 'classique';
    try{ saveLocal(); }catch(e){}
    rerendre(); majPopup();
  }catch(e){ /* hors ligne : on garde ce qu'on sait */ }
  finally{ achatsEnVol = false; }
}
async function acheter(id){
  if(achatEnCours || !compteOk()) return;
  const fond = /^fond-/.test(id), obj = fond ? CARTE.fondDeBoutique(id.slice(5)) : HAB.find(x => x.id === id);
  if(!obj || (fond ? aFond(obj.id) : P.possedes.indexOf(id) >= 0) || P.graines < obj.prix) return;
  const uid = CLOUD.user.id;
  achatEnCours = true; erreurAchat = ''; achatsSeq++; majPopup();
  let msg = '', ok = false;
  try{
    try{ await _depiler(); }catch(e){}                                          // les graines gagnées partent d'abord : le serveur compte ce qu'il a reçu
    const rep = await _rpcDe(uid, 'acheter_diya', {p_item: (fond ? 'fond:' + obj.id : 'tenue:' + id), p_prix_vu: obj.prix}, 12000, 'achat Diya');
    if(!CLOUD.user || CLOUD.user.id !== uid) return;                            // un autre compte est arrivé pendant l'attente : on ne touche à rien
    if(rep && rep.error) throw rep.error;
    const d = rep && rep.data;
    if(!d || typeof d !== 'object') throw new Error('réponse illisible');
    if(typeof d.solde === 'number' && isFinite(d.solde)) S.graines = d.solde;     // le solde du serveur fait foi
    if(d.ok){ ok = true; if(fond){ if(!aFond(obj.id)) P.fondsPoss.push(obj.id); } else if(P.possedes.indexOf(id) < 0) P.possedes.push(id); }
    else if(d.motif === 'prix' && typeof d.prix === 'number'){ obj.prix = d.prix; }              // le prix du serveur a changé : l'écran se redessine avec le bon
    else if(d.motif !== 'solde') msg = 'Achat impossible pour le moment.';                       // « solde » : l'écran dit déjà « Il te manque N graines. » avec le solde certifié
  }catch(e){ msg = 'Pas de réseau. Réessaie dans un instant.'; }
  finally{
    achatEnCours = false; erreurAchat = msg; achatsSeq++;
    try{ saveLocal(); }catch(e){}
    rerendre(); majPopup();
    if(ok) annonce(fond ? 'Arrière-plan acheté : ' + obj.nom + '. Choisis-le pour ta carte ou ton disque.' : 'Tenue achetée : ' + tenueDe(id).nom + '. Touche Équiper pour la mettre.');
    else if(msg) annonce(msg);
  }
}
function equiper(id){
  try{ saveLocal(); }catch(er){}
  if(id !== 'classique' && P.possedes.indexOf(id) < 0) return;
  P.habillage = id; rerendre(); majPopup(); majBandeauxVisibles(); annonce('Tenue équipée : ' + tenueDe(id).nom + '.');
}
function majBandeauxVisibles(){ const ub = D.getElementById('unitBanner'); if(ub) majBandeau(ub.dataset.u != null && ub.dataset.u !== '' ? +ub.dataset.u : uniteCourante()); }
function enregistrer(champ){
  const i = $('#lmChamp'), er = $('#lmErreur'); if(!i || champ !== 'prenom') return;
  const v = i.value.trim();
  if(!v){ er.textContent = 'Écris un surnom.'; i.focus(); return; }
  S.prenom = v; try{ save(); }catch(e){}
  fermerPopup(); rerendre(); annonce('Enregistré.');
}

/* ——— « Un nouvel indice » : un écran à part, comme les badges (il attend que rien d'autre ne soit ouvert) ——— */
function gene(){
  if(D.querySelector('.finish.on:not(#lmObjetNeuf)')) return true;     // y compris un badge : le premier arrivé passe, l'autre attend
  for(const id of ['player', 'onb', 'coran', 'film']){ const e = D.getElementById(id); if(e && e.classList.contains('on')) return true; }
  return !!D.querySelector('.rq-voile, #revPopVoile, .disc-tip') || popupOuvert();
}
function guet(){
  if(!achatsFait && compteOk()) synchroAchats();                    // les achats de ce compte, relus une fois connecté
  const o = D.getElementById('lmObjetNeuf'); if(o && o.classList.contains('on')) return;
  if(gene()) return;
  const d = dus(); if(!d.length) return;
  const e = ecran('lmObjetNeuf', 'finish');
  if(d.length > 1){
    e.innerHTML = '<p class="lm-eyebrow">'+titre()+'</p><div class="lm-gros">'+d.length+'</div><h2 class="bn-titre" style="margin-top:0!important">indices déjà à toi</h2><div class="lm-minis lm-minis-resume" aria-hidden="true">'+d.map(o => '<span class="lm-mini on">'+objImg(o.k)+'</span>').join('')+'</div><button class="cta bn-cta" data-lm="objet-ok-tous">CONTINUER</button><button class="lm-lien" data-lm="objet-placer-tous">Les placer</button>';
    montre(e);
  } else {
    const {u, k} = d[0];
    e.innerHTML = '<div class="bn-lab">Nouvel indice</div><div class="succ-big bn-img pop">'+objImg(k)+'</div><h2 class="bn-titre">'+cnt(rec(u))+'/9</h2><button class="cta bn-cta" data-lm="objet-ok:'+u+':'+k+'">CONTINUER</button><button class="lm-lien" data-lm="objet-placer:'+u+':'+k+'">Le placer</button>';
    montre(e); try{ confettiBurst(); }catch(x){}
  }
}

/* ——— les gestes ——— */
function agir(a, x, y){
  switch(a){
    case 'ouvrir': return ouvrir(x, y);
    case 'indices-unite': P.vue = +x; ouvrir('indices', 'home'); P.vue = +x; rerendre(); if(P.collectees[+x]) ouvrirPopup('zoom', +x); return;
    case 'retour': return retour();
    case 'choisir': sel = (sel === +x) ? null : +x; rerendre(); annonce(sel === null ? 'Indice reposé.' : 'Indice choisi. Touche son emplacement en pointillé.'); return;
    case 'poser': return poser(+x);
    case 'onglet': P.onglet = x; sel = null; if(x === 'indices') P.vue = null; return rerendre();
    case 'onglet-collection': fermerPopup(); P.onglet = 'collection'; P.page = null; _interne = true; try{ showTab('prog'); } finally { _interne = false; } return;
    case 'film': return lancerFilm(uniteEnCours());
    case 'film-revoir': return lancerFilm(+x);
    case 'halte': return window.__alaqRecit ? window.__alaqRecit.ouvrir({quandFerme:function(){}}) : undefined;
    case 'fermer-film': return fermerFilm();
    case 'pause': return pause();
    case 'suite': return avancer();
    case 'conserver': return conserver(+x);
    case 'produit': return ouvrirPopup('produit', x);
    case 'acheter': return acheter(x);
    case 'equiper': return equiper(x);
    case 'equiper-ferme': equiper(x); return fermerPopup();
    case 'avatar': return ouvrirPopup('avatar');
    case 'avatar-onglet': if(pop && pop.type === 'avatar'){ pop.onglet = x === 'fond' ? 'fond' : 'tenue'; rendrePopup(); const t = voile().querySelector('.lm12-ong .on'); if(t) try{ t.focus({preventScroll:true}); }catch(e){} } return;
    case 'fond-carte': return ouvrirPopup('fondcarte');
    case 'couleur-carte': return choisirCouleur('carte', x);
    case 'couleur-profil': return choisirCouleur('profil', x);
    case 'fond-choisir-carte': return choisirFond('carte', x, true);
    case 'fond-choisir-profil': return choisirFond('profil', x, true);
    case 'fond-pour-carte': return choisirFond('carte', x, false);
    case 'fond-pour-profil': return choisirFond('profil', x, false);
    case 'boutique-popup': fermerPopup(); return ouvrir('boutique', 'prog');
    case 'se-connecter': fermerPopup(); try{ obLoginOpen(); }catch(e){} return;
    case 'modifier': return ouvrirPopup('modifier', x);
    case 'enregistrer': return enregistrer(x);
    case 'zoom': return ouvrirPopup('zoom', +x);
    case 'bientot': return ouvrirPopup('bientot');
    case 'partager': return lancerPartage();
    case 'partage-envoi': return envoyerCarte();
    case 'partage-copie': return copierTexte();
    case 'fermer-popup': return fermerPopup();
    case 'ghufran': try{ showGhufranInfo(); }catch(e){} return;
    case 'aller': P.page = null; return showTab(x);
    case 'objet-ok': { vus(+x)[+y] = true; try{ saveLocal(); }catch(er){} const e = D.getElementById('lmObjetNeuf'); if(e) e.classList.remove('on'); majBandeauxVisibles(); return; }
    case 'objet-placer': { vus(+x)[+y] = true; try{ saveLocal(); }catch(er){} const e = D.getElementById('lmObjetNeuf'); if(e) e.classList.remove('on'); P.vue = +x; ouvrir('indices', 'home'); P.vue = +x; return rerendre(); }
    case 'objet-placer-tous': { const premier = dus()[0]; dus().forEach(o => { vus(o.u)[o.k] = true; }); try{ saveLocal(); }catch(er){} const e = D.getElementById('lmObjetNeuf'); if(e) e.classList.remove('on'); P.vue = premier ? premier.u : null; ouvrir('indices', 'home'); P.vue = premier ? premier.u : null; return rerendre(); }
    case 'rang': try{ showRank(); }catch(e){} return;
    case 'deconnexion': try{ cloudLogout(); }catch(e){} return;
    case 'objet-ok-tous': { dus().forEach(o => { vus(o.u)[o.k] = true; }); try{ saveLocal(); }catch(er){} const e = D.getElementById('lmObjetNeuf'); if(e) e.classList.remove('on'); majBandeauxVisibles(); return; }
  }
}
D.addEventListener('click', e => {
  if(apresDrag) return;
  if(e.target.id === 'lmPopup'){ fermerPopup(); return; }                      // un toucher sur le voile ferme la fenêtre
  const b = e.target.closest('[data-lm]');
  /* un objet choisi se dépose en touchant son emplacement en pointillé ; ailleurs sur la scène : il est reposé */
  if(!b && sel !== null){
    const sc = e.target.closest('#lm5Scene');
    if(sc){ const q = pct(e, sc); if(zone(sel, q[0], q[1])) poser(sel); else { sel = null; rerendre(); annonce('Pas ici : cherche la silhouette en pointillé de cet indice.'); } return; }
  }
  if(!b || b.disabled) return;
  const [a, x, y] = b.dataset.lm.split(':'); agir(a, x, y);
});
D.addEventListener('change', e => { if(e.target && e.target.type === 'color' && e.target.dataset && e.target.dataset.cible){ choisirCouleur(e.target.dataset.cible, e.target.value); return; } if(e.target && e.target.id === 'lmFr'){ P.frSous = !!e.target.checked; if(RECIT[filmU]) sousTitresMaj(RECIT[filmU].slides[shot]); } });
window.addEventListener('resize', hauteurBandeau);
D.addEventListener('keydown', e => {
  if(e.key === 'Escape'){ if(pop){ fermerPopup(); return; } const f = D.getElementById('lmFilm'); if(f && f.classList.contains('on')) fermerFilm(); }
  if(e.key === 'Enter' && e.target && e.target.id === 'lmChamp'){ e.preventDefault(); enregistrer(e.target.dataset.champ); }
  if((e.key === 'Enter' || e.key === ' ') && e.target && e.target.getAttribute && e.target.getAttribute('role') === 'button' && e.target.dataset && e.target.dataset.lm === 'ghufran'){ e.preventDefault(); agir('ghufran'); }
  if((e.key === 'Enter' || e.key === ' ') && e.target && e.target.getAttribute && e.target.getAttribute('role') === 'button' && e.target.dataset && e.target.dataset.lm === 'fond-carte'){ e.preventDefault(); agir('fond-carte'); }
});

/* ——— la porte « Boutique » du feuillet Plus (décidée : le Profil ET le feuillet Plus) ——— */
function appliquerPortes(){
  const f = $('#plusFeuille'); if(!f) return;
  const ex = f.querySelector('[data-porte]'); if(ex) ex.remove();
  const b = D.createElement('button'); b.className = 'plus-item'; b.setAttribute('role', 'menuitem'); b.dataset.porte = '1'; b.dataset.lm = 'ouvrir:boutique:prog';
  b.innerHTML = '<img src="'+IMG_CARTE+'icone-boutique.webp" alt=""><span>Boutique</span>';       /* comme les autres entrées du feuillet : une image d'Artlist, sans rond */
  f.insertBefore(b, f.children[1] || null);
}

/* ——— ce que l'atelier peut demander ——— */
function env(o){
  const h = D.documentElement;
  if('clair' in o){ h.classList.toggle('clair', !!o.clair); try{ localStorage.setItem('alaq_theme', o.clair ? 'clair' : 'sombre'); }catch(e){} }
  if('gros' in o){ h.classList.toggle('gtexte', !!o.gros); try{ localStorage.setItem('alaq_gtexte', o.gros ? '1' : '0'); }catch(e){} }
  if('bande' in o){ h.style.setProperty('--edge', o.bande ? '44px' : '0px'); }
}
function onglet(){
  for(const [id, nom] of [['home', 'Apprendre'], ['view-cours', 'Cours'], ['view-reviser', 'Réviser'], ['view-prog', 'Profil'], ['view-params', 'Paramètres'], ['view-islam', 'Islam']]){
    const e = D.getElementById(id); if(e && e.style.display !== 'none') return nom;
  }
  return '';
}
const LMAPI = {
  env,
  etat(){ const u = uniteCourante(); return {unite:UNITS[u].no, recoltes:cnt(rec(u)), poses:cnt(poses(u)), graines:P.graines, cartes:nCartes(), tenue:tenue(), ecran:onglet(), page:P.page, onglet:P.onglet}; },
  reglerFilm,
  ouvrirHalte(){ try{ window.__alaqRecit.ouvrir({quandFerme(){}}); }catch(e){ console.error('LM halte', e); } },
  rafraichir(){ appliquerPortes(); const t = onglet(); if(t === 'Apprendre') showTab('home'); else if(t === 'Islam') showTab('islam'); else if(t === 'Profil') window.renderProg(); },
  aller(tab, page, depuis){ if(page){ ouvrir(page, depuis || 'prog'); } else { P.page = null; showTab(tab); } },
  scenePresqueComplete(){
    for(let k = 0; k < NB; k++) S.done[dkey(0, k)] = true;
    P.poses[0] = Array(NB).fill(false).map((_, i) => i < 8); P.vus[0] = Array(NB).fill(true); P.collectees[0] = false;
    try{ saveLocal(); }catch(e){}
    ouvrir('indices', 'home'); P.vue = 0; rerendre();
  },
  eleveExistante(){
    S.done = {}; for(let k = 0; k < NB; k++) S.done[dkey(0, k)] = true; for(let k = 0; k < 3; k++) S.done[dkey(1, k)] = true;
    P.poses = {}; P.vus = {}; P.collectees = {}; P.recitBonus = false; P.vue = null;
    try{ saveLocal(); }catch(e){}
    P.page = null; try{ _homeFocusPending = true; }catch(e){} showTab('home');      // comme l'app à l'ouverture : l'accueil se recentre sur le disque courant
  },
  guetMaintenant: guet
};
window.LM = LMAPI;

/* ——— départ : l'écran courant est repeint avec la couche (l'app est déjà ouverte), puis le guet des indices ——— */
appliquerPortes();
setInterval(guet, 400);
try{ LMAPI.rafraichir(); }catch(e){ console.error('LM départ', e); }
})();
