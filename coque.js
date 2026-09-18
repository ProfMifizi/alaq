
/* ═══ LA CARTE : ce qui vit hors de ce script (chaque fichier dit son contrat dans son en-tête) ═══
   · content/unites.js    les unités 1 à 7, générées (node outils/semer-unites.mjs)
   · assets.js            LOGO, ICONES, ico, icoImg
   · trace-lettres.js     LT, setupTrace
   · donnees.js           l'alphabet, les harakāt, FATIHA, UNITS, SOURATES, les outils arabes
   · generateurs.js       les constructeurs de disques (buildAlphabet … buildReview), shuffle, mcq
   · son.js               SONS, jouer, speak, sayLetterName, stopAudio, playSfx, SND
   · progression.js       S, DEF, save, saveLocal, dkey, unitUnlocked ; le nuage (SB, CLOUD, cloudPull,
                          cloudInit), dont localStorage reste la source immédiate
   · signalements.js      le drapeau ⚑, les tickets 🤖, les deux capteurs d'erreur
   · parcours.js          discsFor et la table paresseuse des disques
   · ui/accueil.js        renderHome, refreshStats, setBanner, discTip
   · ui/navigation.js     showTab
   · ui/parametres.js     renderParams, renderProg (le Profil), showRank, showSucces
   · ui/reviser.js        renderCours, RESUME_GRAM, renderReviser
   · revision.js          le hub Réviser : le Qorān et ses voix, startReview, finishReview, NOMS_ALLAH
   · constance.js         rangs, succès (checkBadges), graines, objectif du jour, série, Ghufrān, majJour
   · comptes.js           connexion, verrou, onboarding (onbStart), prénom, effacement (doReset et
                          l'appui long sur le logo)
   · src/player/index.js  module : startDisque, renderStep, ctaClick, advance, finishDisque, ecranRate
   · src/ecrans/index.js  module : les gabarits des unités 1 à 7 (setupDrag, asmSaisie, setupRead,
                          objectifAtteint)
   · bulles-tutoriels.js  les bulles, la grille des 28 lettres (hamza, solaire/lunaire), les
                          tutoriels (letterTut), le micro (startReco)

   Restent ici, entre autres : l'état du joueur (let), l'hôte de l'unité 8, « Plus de cœurs », escHTML,
   toast, lecteurPret, fatihaPct, returnFromPlayer, BUILD et VERSION, le démarrage.
   ⚠️ les scripts classiques partagent la portée lexicale globale : ce script lit ces noms nus, et les
   fichiers ci-dessus ne lisent d'ici qu'à l'appel, jamais au chargement. ═══ */

/* ═══ L'UNITÉ 8 EST UN MODULE (src/units/unit-8/, importé par src/entree.js) ═══
   Ce script publie son contrat (__alaqHoteU8) et une porte d'enregistrement ; l'unité s'annonce à
   l'arrivée de son module. Sûr parce qu'un module s'exécute après ce script et avant DOMContentLoaded,
   et que rien du premier rendu (refreshStats, showTab('home')) ne touche à l'unité 8.
   (journal : index.html · l'unité 8 devient un module) ═══ */

/* Le talon : un U8 inerte, jamais null, tant que le module n'est pas arrivé (ou s'il échoue).
   parcours.js, revision.js et ui/reviser.js lisent U8 ; disque() lève alors un message clair. */
const U8_TALON = {
  disque(k){ throw new Error('unité 8 : module non chargé (disque '+k+')'); },
  dessine(){ throw new Error('unité 8 : module non chargé'); },
  repos(){}, titre(){ return ''; }, mots:{}, sons(){ return null; },
};
let U8 = U8_TALON;

/* Le contrat de l'unité 8. ⚠️ l'état passe par des accesseurs, jamais par une copie : S est réaffecté
   (cloudPull, réinitialisation), QUEUE et MISSED repartent à zéro à chaque leçon.
   Une référence capturée serait morte : cœurs écrits dans un objet jeté, MISSED retombé dans la boucle
   de rattrapage du 17/08. Les fonctions déclarées, elles, peuvent être capturées. */

window.__alaqHoteU8 = {
  /* déclarées par des scripts classiques chargés avant (goNoHearts : plus bas, hissée), donc sûres en raccourci */
  audioBeni, playSfx, save, goNoHearts, stopAudio, icoImg, toc,
  /* ⚠️ ces quatre-là vivent dans src/ecrans, un module exécuté après ce script : en raccourci, capturées
     au chargement, elles lèveraient ReferenceError et tueraient ce script avant l'accueil. Des accesseurs
     les résolvent à l'appel ; l'unité 8 les lit à son initialisation.
     (journal : index.html · modules capturés par l'hôte de l'unité 8) */
  get objectifAtteint(){ return objectifAtteint; },
  get elogeHTML(){ return elogeHTML; },
  get draggable(){ return draggable; },
  get dansRectMarge(){ return dansRectMarge; },
  /* … et advance, pour la même raison : il vit dans src/player, importé en premier par src/entree.js */
  get advance(){ return advance; },
  /* l'état, lu à chaque appel */
  get S(){ return S; },  get QUEUE(){ return QUEUE; },  get qi(){ return qi; },
  get MISSED(){ return MISSED; },  get curU(){ return curU; },
  get _sndGen(){ return _sndGen; },
  get REVIEW(){ return REVIEW; },  get RECHARGE(){ return RECHARGE; },
  get EXAM(){ return EXAM; },      get inRetry(){ return inRetry; },
  /* les deux écritures */
  compterFaute(){ wrongCount++; gramFaute(); },
  poserSonCourant(a){ _curAudio = a; },
  /* Perdre un cœur passe par l'arbitre ecranRate (src/player) : ni la révision ni la reprise « recharge »
     n'en coûtent. ⚠️ ne pas toucher cta.onclick ici : ce cœur peut se perdre en plein milieu d'un exercice
     à plusieurs manches, et river le bouton sur goNoHearts figerait une décision périmée. À 0 qatra,
     ecranRate arrête lui-même l'exercice (repos puis goNoHearts) ; objectifAtteint ne décide que la
     cible de CONTINUER sur un écran réussi. */
  coeur(){ ecranRate(); },
};

/* L'enregistrement, appelé par src/entree.js à l'arrivée du module : les mots viennent de U8.mots
   (src/units/unit-8/donnees/mots.js), jamais retapés ici. */
let _u8Branchee = false;
window.__alaqEnregistrerU8 = function(api){
  if (_u8Branchee) return;            /* idempotent : deux poses ne doublent pas le vocabulaire */
  _u8Branchee = true;
  U8 = api;
  const m = U8.mots;
  /* les mots entrent au vocabulaire en forme de citation, indéfinie (قَلَمٌ et non الْقَلَمُ) */
  const U = UNITS[7];
  Object.keys(m).forEach(function(k){ U.words.push({w:m[k].nu, fr:m[k].fr, say:m[k].tr}); });
  /* et leurs deux sons : le mot nu et le mot défini */
  Object.keys(m).forEach(function(k){
    inscrireLeSon(m[k].nu ,'mot-'+m[k].an);
    inscrireLeSon(m[k].def,'mot-'+m[k].ad);
  });
  /* Les mots de la Fātiḥa que le disque 8 fait repérer : le résumé du Cours les fait entendre.
     ⚠️ on n'écrase jamais une prise en place : un vocabulaire qui citerait la même graphie garde sa
     prise (un fichier, un mot). (journal : index.html · les mots de la Fātiḥa de l'unité 8) */
  const mv=U8.versets||{};
  Object.keys(mv).forEach(function(w){ if(!SONS[w])inscrireLeSon(w,'mot-'+mv[w]); });
};

/* Les champs de S que ce script complète s'ils manquent (S vient de progression.js). */
if(!S.tests||typeof S.tests!=='object')S.tests={};   // examens d'unité réussis : { [noUnité]:true }
if(!S.err||typeof S.err!=='object')S.err={};         // erreurs par item (répétition espacée)
if(!S.rev||typeof S.rev!=='object')S.rev={};         // répétition espacée du vocabulaire : { mot:{n,next} }
/* ⚠️ S.revGram doit exister avant toute écriture (finishReview) : il n'était créé que par cloudPull, et
   une élève sans compte perdait toute sa session. (journal : index.html · S.revGram absent) */
if(!S.revGram||typeof S.revGram!=='object')S.revGram={}; // maîtrise par notion : { unité:{n,ko,maj} }
if(!S.revIn||typeof S.revIn!=='object')S.revIn={d:'',n:0}; // §2.5 : admissions du jour { d:date, n:nb de mots neufs entrés }
if(!S.letSeen||typeof S.letSeen!=='object')S.letSeen={}; // lettres déjà revues (halo « nouveau »)
if(typeof S.bigNext==='undefined')S.bigNext=0;          // prochaine révision = +3 (déblocage) ?
if(typeof S.tutLetters==='undefined')S.tutLetters=0;    // tuto grille des lettres déjà vu ?
if(typeof S.tutHome==='undefined')S.tutHome=0;          // tuto page d’accueil déjà vu ?
if(typeof S.tutVocab==='undefined')S.tutVocab=0;        // tuto de la liste de vocabulaire déjà vu ?
if(typeof S.tutCours==='undefined')S.tutCours=0;        // tuto de l’onglet Cours déjà vu ?
if(typeof S.vfBest==='undefined')S.vfBest=0;            // record au « vrai ou faux » (§3.2)
if(typeof S.consScore!=='number')S.consScore=0;        // score de constance (rang)
if(typeof S.ghufLeft!=='number')S.ghufLeft=2;          // Ghufrān restants ce mois (max 2, jamais à vendre)
if(!S.badges||typeof S.badges!=='object')S.badges={};// badges gagnés
if(!S.uerr||typeof S.uerr!=='object')S.uerr={};  // unités où au moins une erreur a été faite
if(typeof S.nrev!=='number')S.nrev=0;            // nombre de révisions terminées
if(typeof S.onboarded==='undefined')S.onboarded=((S.done&&Object.keys(S.done).length>0)||S.xp>0||S.streak>0)?1:0; // élèves DÉJÀ existantes (progression présente) → pas d'onboarding
if(!S.onb||typeof S.onb!=='object')S.onb={};         // données d'onboarding {source,intention[],niveau,objectif,ts}
if(typeof S.prenom!=='string')S.prenom='';           // prénom (personnalisation + colonne Supabase profiles.prenom)
(function(){var ch=false;for(var k in S.done){var m=k.match(/^D(\d+)$/);if(m){S.done['U1-D'+m[1]]=S.done[k];delete S.done[k];ch=true;}}if(ch)saveLocal();})();  /* migration D<n> → U1-D<n> : un renommage de clés, pas une progression, d'où saveLocal */
fixOrdreFormes(); // échange formes ↔ repérage (02/08) : rattrape les progressions écrites sous l'ancien ordre

function currentLesson(){ // 1re leçon non terminée d'une unité débloquée = le disque « courant » de l'accueil
  for(let u=0;u<UNITS.length;u++){ if(!unitUnlocked(u))continue;
    const ds=discsFor(u);
    for(let k=0;k<ds.length;k++){
      /* ⚠️ un disque « À venir » n'est pas une leçon : on le saute, comme renderHome, sinon il s'ouvrait
         et rapportait des qatarāt sans rien faire. (journal : index.html · disque à venir ouvert) */
      if(ds[k]&&ds[k].aVenir)continue;
      if((k===0||!!S.done[dkey(u,k-1)])&&!S.done[dkey(u,k)])return {u:u,i:k};
    }
  }
  return null;
}
/* La leçon qu'on vient de quitter : posée par goNoHearts(), lue par showNoHearts() et noHeartsRedo().
   ⚠️ déclarée au-dessus de ses lecteurs : un let reste en zone morte temporelle jusqu'à sa ligne. */
let _repriseL=null;
function showNoHearts(){
  /* RECOMMENCER suit la leçon quittée (_repriseL) ; currentLesson() n'est qu'un repli pour les chemins
     qui n'arrivent pas d'une leçon (le cœur du bandeau, un départ refusé faute de qatarāt).
     (journal : index.html · RECOMMENCER avait disparu) */
  const hasRev=allReviewWords().length>0, L=_repriseL||currentLesson();
  let h='';
  var co=icoImg('tb-coeur','','height:18px;vertical-align:-3px'); // le même cœur que la barre du haut : registre ICONES, jamais d'emoji
  if(hasRev)h+='<button class="cta" style="max-width:300px" onclick="noHeartsReview()">RÉVISER +3 '+co+'</button>';
  if(L)h+='<button class="cta" style="max-width:300px'+(hasRev?';background:none;color:var(--gold2);border:2px solid var(--gold-d);margin-top:10px':'')+'" onclick="noHeartsRedo()">RECOMMENCER +3 '+co+'</button>';
  h+='<button class="cta" style="max-width:300px;background:none;color:var(--cream);border:2px solid var(--line);margin-top:10px" onclick="closeNoHearts()">PLUS TARD</button>';
  document.getElementById('nh-actions').innerHTML=h;
  document.getElementById('noHearts').classList.add('on'); S.bigNext=1; save(); // la 1re recharge (révision OU reprise) donnera +3
}
function closeNoHearts(){ document.getElementById('noHearts').classList.remove('on'); }
/* Le cœur de la barre du haut : à 0, l'écran « Plus de cœurs » ; sinon la rangée des Qatarāt, dessinée
   avec l'icône du registre, les dépensées visibles mais éteintes (hors du décompte de contraste, comme
   tout élément désactivé). (journal : index.html · le cœur de la barre du haut répond) */
function showHearts(){
  if(S.hearts<=0){ showNoHearts(); return; }
  var m=document.getElementById('heartsModal');
  if(!m){ m=document.createElement('div'); m.className='finish'; m.id='heartsModal'; document.body.appendChild(m); }
  var rangee='';
  for(var i=1;i<=HEARTS_MAX;i++)
    rangee+=icoImg('tb-coeur','','height:26px;margin:0 2px'+(i<=S.hearts?'':';filter:grayscale(1);opacity:.28'));
  var titre=S.hearts+(S.hearts>1?' gouttes d’eau':' goutte d’eau');
  var frac=S.hearts+' '+(S.hearts>1?'Qatarāt':'Qatra')+' / '+HEARTS_MAX+' Qatarāt';
  var bas='<p class="succ-desc" style="margin:10px 4px 0;font-size:15.5px;line-height:1.55">Recharge tes Qatarāt au puits Zamzam du savoir ou attends demain, elles reviendront au complet sans le moindre effort.</p>';
  m.innerHTML='<button class="sm-close" style="top:calc(14px + env(safe-area-inset-top,0px));right:14px" onclick="closeHearts()" aria-label="Fermer">✕</button>'+
    '<div style="max-width:340px;width:100%;margin:0 auto;text-align:center">'+
    '<div style="margin-bottom:10px">'+rangee+'</div>'+
    '<h2 style="margin:8px 0 2px">'+titre+'</h2>'+
    '<p class="succ-desc" style="margin:0;font-size:15px;font-weight:800;color:var(--gold2)">'+frac+'</p>'+
    bas+'</div>';
  m.classList.add('on');
}
function closeHearts(){ var m=document.getElementById('heartsModal'); if(m)m.classList.remove('on'); }
function heartsReview(){ closeHearts(); S.bigNext=1; save(); startReview(); } // même barème que « Plus de cœurs » : la 1re recharge rend +3
function noHeartsReview(){ closeNoHearts(); startReview(); }
/* rouvre la leçon quittée, pas la première non terminée du parcours
   (journal : index.html · RECOMMENCER ne recommençait pas) */
function noHeartsRedo(){
  var L=_repriseL||currentLesson();
  closeNoHearts();
  if(L&&lecteurPret())startDisque(L.u,L.i,true);
}
function goNoHearts(){
  _repriseL={u:curU,i:curD};   // la leçon qu'on quitte : c'est ELLE qu'on reprendra
  document.getElementById('player').classList.remove('on'); showNoHearts();
}

/* L'état de l'onboarding (ses fonctions : comptes.js) et de la fête des 7 épis (constance.js).
   ⚠️ une seule instruction, relue telle quelle par des bancs ; pendingStreak est réassigné par
   src/player et revision.js. */
let ONB={step:0,data:{}}, obAccountPending=false, pendingStreak=false;
/* escHTML, l'échappeur de toute l'app (& < > " ') : ui/parametres.js et src/ecrans l'appellent aussi.
   Le banc outils/verifier-comptes.mjs exécute le vrai. */
function escHTML(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){
  return c==='&'?'&amp;':c==='<'?'&lt;':c==='>'?'&gt;':c==='"'?'&quot;':'&#39;'; }); }

/* ⚠️ BUILD, BUILD_DATE, VERSION et BUILD_NUM restent dans ce fichier : outils/verifier-version.mjs les y lit. */
const BUILD='solde-coque-18sept';
window.BUILD=BUILD; // lisible par la page de diagnostic (le mouchard affiche quelle version tourne VRAIMENT)
/* Date et heure de la livraison, affichées dans Paramètres › « Version de l’app » (journal : index.html · la date et l'heure de livraison) : ISO AAAA-MM-JJTHH:MM,
   heure de Paris (dateHeureFr la met en français). ⚠️ posée au moment de livrer, et sa date est celle
   du cache de sw.js (alaq-vNNN-AAAA-MM-JJ) : le portillon l'exige. */
const BUILD_DATE='2026-09-18T21:25';
window.BUILD_DATE=BUILD_DATE; // même raison que window.BUILD : lisible par les harnais et le diagnostic
/* VERSION est pour l'élève, décidée par Myriam au GO (mineur : du nouveau ou une étape de structure ;
   correctif : une réparation ; majeur : une autre app). BUILD_NUM est pour nous : le compteur du cache
   de sw.js ; verifier-version.mjs exige les mêmes nombres dans package.json, iOS et Android.
   ⏳ 3.19 proposé (sous-lot 8, une étape de structure) : à confirmer par Myriam au GO. */
const VERSION='3.20';
const BUILD_NUM=224;
window.VERSION=VERSION; window.BUILD_NUM=BUILD_NUM; // lisibles par les harnais et le diagnostic

/* ================= JOUEUR ================= */
let QUEUE=[],qi=0,curU=0,curD=0,answered=false,picked=null,wrongCount=0,total=0,MISSED=[],inRetry=false,EXAM=false;
let _grainesSession=0;   // les graines de la leçon en cours, réassignées par finishDisque (src/player) et finishReview (revision.js)
/* ⚠️ l'état du joueur reste ici, en let classiques : src/player (un module) les lit et les réassigne par
   leur nom, et ecranRate, objectifAtteint, sigEcran, le hub Réviser et l'hôte U8 lisent ces mêmes
   liaisons ; les redéclarer dans un module les rendrait privées. sigEcran les lit sous try/catch. */
/* ⚠️ un module est différé et fetché à part : un doigt peut arriver avant lui, et hors ligne à la
   première visite il n'arrive jamais. Chaque départ classique vers le lecteur passe par ici : un toast,
   et rien ne s'ouvre (sinon un voile #player vide, à croix morte). Gardé par outils/verifier-lecteur.mjs
   et previews/_verif_lecteur.html. */
function lecteurPret(){
  if(typeof startDisque==='function'&&typeof renderStep==='function')return true;
  try{toast('Le lecteur n’est pas encore chargé — recharge la page');}catch(e){}
  return false;
}

/* ═══ LES LEÇONS : icônes du tracé, filet, bulles, hamza, tutoriels, tachkīl ═══ */

/* Les icônes du tracé, dessinées (choix de Myriam : triangle dans un cercle · flèche
   circulaire). Sans texte : le libellé ne survit que pour les lecteurs d'écran. */
const ICO_DEMO='<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12.5"/><path class="plein" d="M12.5 9.5v13l10.5-6.5z"/></svg>';
const ICO_RECO='<svg viewBox="0 0 32 32"><path d="M26 16a10 10 0 11-3.4-7.5"/><path d="M26 4.5V11h-6.5"/></svg>';

/* La carte d'une lettre nouvelle : le bouton s'allume quand le NOM est fini de sonner. */
function lettreTap(el,L){
  popIt(el);
  sayLetterName(L,objectifAtteint);
  objectifFilet();
}
/* Ceinture : le bouton ne doit jamais rester gris si un son se perd (un rappel de fin de son se perd
   dès qu'un autre son démarre). ⚠️ elle ne s'arme qu'une fois l'écran fini : jamais un minuteur qui
   valide ce que l'élève n'a pas fait. (journal : index.html · le filet allumait CONTINUER trop tôt) */
function objectifFilet(){
  var e=qi;
  setTimeout(function(){ if(qi===e)objectifAtteint(); },2800);
}

function openSurahMenu(){
  var m=document.getElementById('surahMenu');
  if(!m){m=document.createElement('div');m.className='finish';m.id='surahMenu';document.body.appendChild(m);}
  var cur=(typeof curSourate!=='undefined')?curSourate:0;
  var items=SOURATE_PLAN.map(function(P){
    var built=(typeof P.idx!=='undefined'), active=built&&P.idx===cur;
    return '<button class="sm-item'+(active?' active':'')+'" '+(built?'onclick="pickSurah('+P.idx+')"':'disabled')+'>'+
      '<span class="sm-no">'+P.no+'</span>'+
      '<span class="sm-ar">'+P.ar+'</span>'+
      '<span class="sm-tx"><b>'+P.nom+'</b></span>'+
      (active?'<span class="sm-badge">✓</span>':(built?'':'<span class="sm-soon">à venir</span>'))+
      '</button>';}).join('');
  m.innerHTML='<div class="sm-box"><button class="sm-close" onclick="closeSurahMenu()" aria-label="Fermer">✕</button><div class="sm-list">'+items+'</div></div>';
  m.classList.add('on');
}
function closeSurahMenu(){var m=document.getElementById('surahMenu');if(m)m.classList.remove('on');}
function pickSurah(i){if(typeof curSourate!=='undefined')curSourate=i;closeSurahMenu();renderHome();}

function lvpFlip(card,consWord,proWord){ // carte recto/verso robuste (sans 3D) : écrase, bascule, joue le son visible
  try{
    const showProAfter=!card.classList.contains('flipped');
    card.classList.add('flipping');
    setTimeout(()=>{card.classList.toggle('flipped');card.classList.remove('flipping');},230);
    const w=showProAfter?proWord:consWord;
    if(w)speak(w);
    const n=(parseInt(card.dataset.taps||'0',10))+1; card.dataset.taps=n;
    if(n>=2)card.classList.add('seen');
    const wrap=card.closest&&card.closest('.lvp-cards');
    if(wrap&&wrap.dataset.gate==='1'){
      const all=[...wrap.querySelectorAll('.lvp-flip')];
      if(all.every(c=>parseInt(c.dataset.taps||'0',10)>=2)){
        const cta=document.getElementById('cta'); if(cta)cta.disabled=false;
      }
    }
  }catch(e){ try{card.classList.toggle('flipped');}catch(_){ } }
}
/* Une ligne touchée : elle s'allume, elle sonne, et quand toutes ont sonné le bouton
   s'allume — le contrat de tous les écrans, jamais une récompense sous l'exercice. */
function taprowTap(el,word){
  lvpHit(el,word);
  if(!window._tr)return;
  if(el.dataset.vu)return;
  el.dataset.vu=1; window._tr.n++;
  /* ⚠️ on attend la fin du son avant de récompenser : objectifAtteint() → playSfx → stopAudio couperait
     le son qu'on vient de lancer ; le filet de 2,8 s sert de soupape.
     (journal : index.html · le son de la dernière box) */
  if(window._tr.n>=window._tr.tot){ quandSonFini(objectifAtteint); objectifFilet(); }
}
function lvpHit(el,word){ // slides Lettres vs prolongations : rejoue l'anim + audio au tap
  try{ el.classList.remove('lit'); void el.offsetWidth; el.classList.add('lit'); }catch(e){}
  if(word) speak(word);
}
// Translittération arabe → latin : servait de repli à la voix de synthèse, retirée le 15/09.
const AR2LAT={
 'ا':'a','أ':'a','إ':'i','آ':'aa','ٱ':'a','ى':'a','ة':'a','ء':'',
 'ب':'b','ت':'t','ث':'s','ج':'dj','ح':'h','خ':'r','د':'d','ذ':'z','ر':'r','ز':'z',
 'س':'s','ش':'ch','ص':'s','ض':'d','ط':'t','ظ':'z','ع':'a','غ':'r','ف':'f','ق':'k',
 'ك':'k','ل':'l','م':'m','ن':'n','ه':'h','و':'w','ي':'y','ﺀ':'',
 '\u064E':'a','\u0650':'i','\u064F':'ou','\u064B':'a','\u064D':'','\u064C':'',   // tanwin en pause : ً->a, ٍ/ٌ->rien (fini « samakoune »)
 '\u0652':'','\u0651':'','\u0670':'a','\u0640':''
};
function translit(t){ let o=''; for(const ch of (t||'')) o += (ch in AR2LAT)?AR2LAT[ch]:ch; return o.trim(); }
/* La tachkīl en rouge : le signe qui commande la prolongation doit se voir. Token --tach, le rouge des
   manuscrits, pas le corail de l'erreur (une couleur par idée). (journal : index.html · la tachkīl en rouge) */
// U+064B→U+0652 : les deux tanwīn, fatḥa, ḍamma, kasra, chedda, soukoun · U+0670 : alif poignard.
// Volontairement PAS U+0654/0655 (la hamza combinante) : elle fait partie de la lettre.
const RE_TACHKIL=/[\u064B-\u0652\u0670]/g;
/* ⚠️ ne jamais séparer un signe de sa lettre : le cluster entier part dans une seule couleur. Un span par
   signe, un calque posé par Range ou un tspan SVG échouent tous.
   (journal : index.html · trois fausses pistes pour la tachkīl) */
function tachRouge(s){
  s=String(s==null?'':s);
  if(!s)return '';
  var esc=s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  RE_TACHKIL.lastIndex=0;
  return RE_TACHKIL.test(s) ? ('<span class="tach">'+esc+'</span>') : esc;
}
/* La harakat colorée, la lettre intacte : pour un signe posé sur sa lettre, deux couches (le cluster
   coloré dessous, la lettre nue opaque dessus). tachRouge suffit pour un signe seul, porté par un tatweel.
   ⚠️ aucun blanc entre les deux spans : en white-space:pre, il décalerait la couche du dessus.
   (journal : index.html · la harakat colorée) */
function tachCalque(s){
  s=String(s==null?'':s);
  if(!s)return '';
  var ech=function(x){ return x.replace(/&/g,'&amp;').replace(/</g,'&lt;'); };
  RE_TACHKIL.lastIndex=0;
  if(!RE_TACHKIL.test(s))return ech(s);          // aucun signe : rien à superposer
  var nue=s.replace(RE_TACHKIL,'');              // la lettre (ou les lettres) sans un seul signe
  /* ⚠️ aria-hidden sur la couche du dessus : sans lui, un lecteur d'écran lirait la lettre deux fois */
  return '<span class="hkw"><span class="hkm">'+ech(s)+'</span>'+
         '<span class="hkb" aria-hidden="true">'+ech(nue)+'</span></span>';
}

function zoomVerse(btn){
  const v=document.getElementById('verseBox');if(!v)return;
  const big=v.classList.toggle('zoomed');
  if(btn&&btn.classList)btn.classList.toggle('zoomed',big); // la loupe est une IMAGE (registre) — l'état vit dans la classe
}
function toast(m){const t=document.getElementById('toast');t.innerHTML=m;t.classList.add('on'); // innerHTML : le cœur du registre ICONES peut s'y afficher (tous les appels sont nos littéraux)
  setTimeout(()=>t.classList.remove('on'),2600);}

/* ===== Carte de la Fātiḥa : les mots lisibles s'illuminent ===== */
function knownLetterSet(){ // lettres des unités dont le disque « Mémoriser » est terminé
  const set=new Set();
  UNITS.forEach((U,i)=>{
    if(!U.alpha)return;
    if(S.done[dkey(i,1)]||unitValidated(i))U.letters.forEach(L=>set.add(letterKey(L)));
  });
  if(set.has('ا'))set.add('ء'); // la hamza s'apprend avec le alif
  return set;
}
// Révélation progressive : le mot passe en ARABE une fois toutes ses lettres apprises, sinon reste en français/translittération
function arReveal(latin, ar){
  try{ var set=knownLetterSet();
    for(var i=0;i<ar.length;i++){ var c=ar[i]; if(c==='ة')c='ت'; else if(c==='ى')c='ي';
      if(!/[\u0621-\u064A]/.test(c))continue; if(!set.has(letterKey(c)))return latin; }
    return '<span class="arw">'+ar+'</span>';
  }catch(e){ return latin; }
}
function wordReadable(w,set){
  for(const ch of strip(w)){ if(!set.has(letterKey(ch)))return false; }
  return true;
}
function fatihaPct(){
  const set=knownLetterSet();let tot=0,ok=0;
  FATIHA.forEach(v=>v.split(' ').forEach(w=>{tot++;if(wordReadable(w,set))ok++;}));
  return tot?Math.round(ok/tot*100):0;
}

/* ================= ÉTAT DE LA RÉVISION ================= */
let REVIEW=false, backTo=null, REVSES=null, RECHARGE=false, REVFREE=false; // REVFREE = §3.5 : session d'entraînement libre (rien n'était dû) — cœurs oui, paliers NON
// REVSES = résultats de la session de révision en cours { mot: true|false } ; RECHARGE = reprise « recharge cœurs » d'une leçon

/* Les sons du résumé de l'unité 9 (resumeGramU9, ui/reviser.js), inscrits au chargement sans écraser une
   prise déjà en place. */
if(!SONS['بِالْقَلَمِ'])inscrireLeSon('بِالْقَلَمِ','mot-bilqalam');
if(!SONS['لِلْبِنْتِ'])inscrireLeSon('لِلْبِنْتِ','mot-lilbint');
if(!SONS['عَلَى الْبَيْتِ'])inscrireLeSon('عَلَى الْبَيْتِ','mot-alalbayt');
if(!SONS['بِسْمِ اللَّهِ'])inscrireLeSon('بِسْمِ اللَّهِ','mot-bismillah');
if(!SONS['الْحَمْدُ لِلَّهِ'])inscrireLeSon('الْحَمْدُ لِلَّهِ','mot-alhamdulillah');


function returnFromPlayer(){
  if(backTo==='reviser'){ backTo=null; showTab('reviser'); }
  else if(backTo==='cours'){ backTo=null; showTab('cours'); }
  else { _homeFocusPending=true; renderHome(); } // au retour de leçon : recentrer sur le disque courant
}

document.getElementById('blogo').src=LOGO;
/* fermer le menu des sourates au clic ailleurs */
document.addEventListener('click',function(e){
  const m=document.getElementById('smenu');
  if(m&&!e.target.closest('.spick'))m.classList.remove('open');
});
/* Service worker (hors ligne, audios en cache). ⛔ jamais en local : son cache ressert les octets vus la
   première fois sous un nom, et « vider le cache » du navigateur n'y touche pas. ⚠️ en local on désinscrit
   aussi ce qui traîne et on vide ses caches, sinon un sw déjà posé contrôle la page pour toujours.
   (journal : index.html · le service worker en local) */
if('serviceWorker'in navigator&&location.protocol!=='file:'){
  const enLocal=location.hostname==='localhost'||location.hostname==='127.0.0.1'||location.hostname==='[::1]';
  if(enLocal){
    navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});
    if(window.caches)caches.keys().then(ks=>ks.forEach(k=>caches.delete(k))).catch(()=>{});
  }else{
    /* une installation qui échoue n'est jamais silencieuse : un ticket part */
    try{navigator.serviceWorker.register('sw.js')
      .catch(function(err){try{tikEnvoyer('sw',String(err&&err.message||err).slice(0,300))}catch(e){}});}catch(e){}
  }
}
(function(){const b=document.getElementById('sndtog');if(b)b.textContent=SND?'🔊':'🔇';})();
/* Les minutes de l'objectif : 15 s de leçon visible = 15 s comptées. Le lecteur fermé
   ou l'onglet caché ne comptent pas. */
setInterval(function(){ try{
  var pl=document.getElementById('player');
  if(pl&&pl.classList.contains('on')&&document.visibilityState==='visible')objAddSec(15);
}catch(e){} },15000);
/* Supabase est en defer, et un script defer s'exécute avant DOMContentLoaded : window.supabase est là.
   ⚠️ SB est un let de progression.js : le réassigner ici écrit la même liaison, pas une copie. */
document.addEventListener('DOMContentLoaded',function(){
  try{ if(window.supabase&&!SB)SB=window.supabase.createClient(SUPA_URL,SUPA_ANON,
    {auth:{persistSession:true,autoRefreshToken:true}}); }catch(e){}
  try{cloudInit();}catch(e){}
  try{contentPull();}catch(e){} // le contenu des tables, une fois SB prêt
  // au 1er lancement le SW ne contrôle pas encore la page : 'ready' attend qu'il soit actif
  try{navigator.serviceWorker.ready.then(function(r){r.active&&r.active.postMessage('precache');});}catch(e){}
});
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();}catch(e){} // demande au navigateur de NE PAS purger le stockage (connexion + progression)

/* ⚠️ le premier rendu est synchrone : refreshStats (qui appelle updRankBadge sans garde) et showTab('home').
   Tout ce qu'ils touchent doit venir d'un script classique chargé plus haut. */
refreshStats();
showTab('home');
/* alaq.fr ▸ « J'ai déjà un compte » arrive sur app.alaq.fr#connexion : l'écran de
   connexion s'ouvre directement, sans traverser l'accueil ni l'onboarding. */
if(location.hash==='#connexion'){
  try{history.replaceState(null,'',location.pathname);}catch(e){}
  setTimeout(function(){ try{ if(CLOUD.user){showTab('home');toast('Bon retour ✨');} else obLoginOpen(); }catch(e){} },200);
} else if(location.hash==='#u9'){
  /* Raccourci de test pour Myriam : ouvre U9-D1 sans passer par l'accueil, sans toucher S.done.
     ⚠️ on attend que les modules soient publiés (__alaqU9 et le lecteur), jamais un délai fixe : trop
     tôt, la file est vide et l'élève tombe sur « Leçon terminée ! 100 % ».
     (journal : index.html · le raccourci #u9 partait trop tôt) */
  try{history.replaceState(null,'',location.pathname);}catch(e){}
  (function attendreModuleU9(essai){
    if(window.__alaqU9&&typeof window.__alaqU9.disque1==='function'&&typeof window.startDisque==='function'){
      try{startDisque(8,0);}catch(e){}
    } else if(essai<100){ setTimeout(function(){attendreModuleU9(essai+1);},50); }
    else{ try{toast('Module unité 9 introuvable');}catch(e){} }
  })(0);
} else if(!S.onboarded){ setTimeout(function(){try{onbStart();}catch(e){}},120); } // 1er lancement : parcours de bienvenue
