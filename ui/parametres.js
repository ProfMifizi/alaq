/* ui/parametres.js — Paramètres et Profil :
   · renderParams et ses cartes (Sons, Récitateur, Objectif quotidien avec prmObjectif,
     Affichage avec themeClair/grosTexte, À propos, Version de l'app) ;
   · la lecture cachée de la file d'envoi (_armerLectureFile, _ouvrirLectureFile…) ;
   · le Profil (renderProg) et les modales du rang (showRank, rankInfo) et des succès
     (showSucces), plus unitVocabCount.
   Script classique, chargé sous ui/navigation.js et avant le grand script ; il ne lit rien
   d'un autre script au chargement (voir l'en-tête de ui/accueil.js).
   À L'APPEL :
   · VERSION, BUILD_NUM, BUILD_DATE, escHTML, fatihaPct, arReveal (index.html)
   · nomChoisiHTML, cloudCardHTML, et en ligne openPrenom, cloudLogout (comptes.js)
   · today, objMinutes, objGoal, objFete, objRingHTML, rankFor, RANKS, rankTrackHTML,
     ecussonHTML, BADGES, maybeGhufranPrompt, et en ligne showGhufranInfo (constance.js)
   · S, save, dkey, unitValidated, unitUnlocked, SB, CLOUD, SYNC facultatif (progression.js)
   · UNITS, SOURATES (donnees.js) · discsFor (parcours.js) · ico, icoImg, icoEcran (assets.js)
   · chime, SND, et en ligne toggleSound (son.js) · qariCur, et en ligne openQari (revision.js)
   · toAr (ui/accueil.js)
   Gardes : outils/verifier-interface.mjs, previews/_verif_interface.html. */

/* Modales : la croix se cale en haut à droite de l'écran (.finish est fixed), le contenu
   vit sur le fond, sans boîte. */
const CROIX_SUCCES='<button class="sm-close" style="top:calc(14px + env(safe-area-inset-top,0px));right:14px" onclick="closeSucces()" aria-label="Fermer">\u2715</button>'+
  '<div style="max-width:340px;width:100%;margin:0 auto;text-align:center">';
const CROIX_RANG='<button class="sm-close" style="top:calc(14px + env(safe-area-inset-top,0px));right:14px" onclick="closeRank()" aria-label="Fermer">\u2715</button>'+
  '<div style="max-width:340px;width:100%;margin:0 auto;text-align:center">';
/* Les trois chiffres du rang, avec les icônes de la charte (plus d'emoji système) */
function rkStatsHTML(){
  return '<div class="rk-stats">'+
    '<span><img src="badges/serie3.png" alt=""> '+(S.streak||0)+' j</span>'+
    '<span><img src="badges/revision.png" alt=""> '+(S.nrev||0)+'</span>'+
    '<span>'+icoEcran('ecran-ghufran')+' '+(S.ghufLeft||0)+'</span>'+
    '</div>';
}
function showRank(){
  var R=rankFor(S.consScore); var m=document.getElementById('rankModal');
  if(!m){ m=document.createElement('div'); m.className='finish'; m.id='rankModal'; document.body.appendChild(m); }
  m.innerHTML=(CROIX_RANG)+
    '<div class="rk-big">'+R.rank.ar+'</div>'+
    '<h2 style="margin:8px 0 2px">'+R.rank.tr+'</h2>'+
    '<div class="succ-stat" style="color:var(--gold2)">'+R.rank.fr+'</div>'+
    '<p class="succ-desc">'+R.rank.desc+'</p>'+
    rkStatsHTML()+
    '</div>';
  m.classList.add('on');
}
function closeRank(){ var m=document.getElementById('rankModal'); if(m)m.classList.remove('on'); }
function rankInfo(idx){ // popup d'un rang cliqué depuis la barre du profil (Progrès)
  var R=RANKS[idx], cur=rankFor(S.consScore).idx;
  var status = idx<cur?'✓ Atteint' : (idx===cur?'⭐ En cours' : '🔒 À atteindre');
  var m=document.getElementById('rankModal');
  if(!m){ m=document.createElement('div'); m.className='finish'; m.id='rankModal'; document.body.appendChild(m); }
  m.innerHTML=(CROIX_RANG)+
    '<div class="rk-big">'+R.ar+'</div>'+
    '<h2 style="margin:8px 0 2px">'+R.tr+'</h2>'+
    '<div class="succ-stat" style="color:var(--gold2)">'+R.fr+' · '+(idx+1)+' / 7</div>'+
    '<p class="succ-desc">'+R.desc+'</p>'+
    '<div class="rk-stats">'+status+'</div>'+
    '</div>';
  m.classList.add('on');
}

function unitVocabCount(){ let n=0; UNITS.forEach((U,i)=>{ if(unitUnlocked(i))n+=(U.words||[]).length; }); return n; }

/* Affichage : réglages d'APPAREIL, écrits dans localStorage et jamais dans S — ils ne suivent
   pas le compte et survivent à une déconnexion (journal : ui/parametres.js · Affichage). */
function themeClair(){ try{ return localStorage.getItem('alaq_theme')==='clair'; }catch(e){ return false; } }
function grosTexte(){ try{ return localStorage.getItem('alaq_gtexte')==='1'; }catch(e){ return false; } }
function setThemeClair(on){
  try{ localStorage.setItem('alaq_theme',on?'clair':'sombre'); }catch(e){}
  document.documentElement.classList.toggle('clair',!!on);
  renderParams();
}
function setGrosTexte(on){
  try{ localStorage.setItem('alaq_gtexte',on?'1':'0'); }catch(e){}
  document.documentElement.classList.toggle('gtexte',!!on);
  renderParams();
}
const ICO_AFFICHAGE='<svg class="prm-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" '+
  'stroke-width="1.9" stroke-linecap="round" style="color:var(--gold2)">'+
  '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17" /><path d="M12 3.5a8.5 8.5 0 010 17z" fill="currentColor" stroke="none"/></svg>';
/* l'icône de la carte Version : même format que ICO_AFFICHAGE (SVG en ligne, .prm-ic) */
const ICO_VERSION='<svg class="prm-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" '+
  'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="color:var(--gold2)">'+
  '<path d="M4 4h7.2l8.8 8.8-7.2 7.2L4 11.2z"/><circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none"/></svg>';
/* « 2026-09-06 » → « 6 septembre 2026 » ; une table plutôt que toLocaleDateString : le même
   texte sur tout moteur, et le « 1er ». */
const MOIS_FR=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
function dateFr(iso){ var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso||'')); if(!m)return String(iso||'');
  var j=+m[3]; return (j===1?'1er':j)+' '+(MOIS_FR[+m[2]-1]||'?')+' '+m[1]; }
/* « 6 septembre 2026 à 23h26 », la date seule si l'heure manque */
function dateHeureFr(iso){ var m=/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(String(iso||'')); if(!m)return String(iso||'');
  return dateFr(m[1])+(m[2]?' à '+m[2]+'h'+m[3]:''); }
function prmSw(on){ return '<span class="prm-sw'+(on?' on':'')+'"><i></i></span>'; }
function renderParams(){
  var v=document.getElementById('view-params'); if(!v)return;
  var obj=(S.onb&&S.onb.objectif)||'10'; // 10 min par défaut — c'est ce que objGoal() applique
  v.innerHTML=
    '<div class="ccard"><div class="ctt"><h3><img class="prm-ic" src="'+ico('prm-sons')+'" alt=""> Sons</h3></div>'+
      '<button class="prm-row" onclick="toggleSound();renderParams()">Effets sonores'+prmSw(SND)+'</button>'+
    '</div>'+
    /* le récitateur se choisit ici seulement : la même feuille que le Qorān, un seul S.qari */
    '<div class="ccard"><div class="ctt"><h3><img class="prm-ic" src="'+ico('prm-voix')+'" alt=""> Récitateur</h3></div>'+
      '<button class="prm-row" onclick="openQari()">'+escHTML(qariCur().fr)+'<span style="color:var(--muted)">›</span></button>'+
    '</div>'+
    '<div class="ccard"><div class="ctt"><h3><img class="prm-ic" src="'+ico('prm-objectif')+'" alt=""> Objectif quotidien</h3></div>'+
      '<div class="prm-goals">'+['5','10','15','20'].map(function(m){
        return '<button class="prm-goal'+(obj===m?' sel':'')+'" onclick="prmObjectif(\''+m+'\')">'+m+' min</button>';
      }).join('')+'</div>'+
    '</div>'+
    '<div class="ccard"><div class="ctt"><h3>'+ICO_AFFICHAGE+' Affichage</h3></div>'+
      '<button class="prm-row" onclick="setThemeClair(!themeClair())">Mode clair'+prmSw(themeClair())+'</button>'+
      '<button class="prm-row" onclick="setGrosTexte(!grosTexte())">Grands caractères'+prmSw(grosTexte())+'</button>'+
      '<p style="color:var(--muted);font-size:11.5px;margin:9px 2px 0;line-height:1.45">Le fond clair et les grands caractères aident quand la vue baisse. Ces deux réglages restent sur cet appareil.</p>'+
    '</div>'+
    '<div class="ccard"><div class="ctt"><h3><img class="prm-ic" src="'+ico('prm-apropos')+'" alt=""> À propos</h3></div>'+
      '<a class="prm-row" href="confidentialite.html" target="_blank" rel="noopener" style="text-decoration:none">Politique de confidentialité<span style="color:var(--muted)">›</span></a>'+
    '</div>'+
    /* Version : VERSION (BUILD_NUM) ; le libellé BUILD reste hors écran (window.BUILD).
       ⚠️ des <p>, pas des <div> : .prm-row:first-of-type compte par type, et le premier div de
       la carte est l'en-tête (journal : ui/parametres.js · la carte Version). */
    '<div class="ccard"><div class="ctt"><h3>'+ICO_VERSION+' Version de l’app</h3></div>'+
      '<p class="prm-row prm-lit">Version<span id="prm-ver">'+escHTML(VERSION+' ('+BUILD_NUM+')')+'</span></p>'+
      '<p class="prm-row prm-lit">Mise à jour<span>'+escHTML(dateHeureFr(BUILD_DATE))+'</span></p>'+
    '</div>';
    _armerLectureFile();
  }

/* LA FILE D'ENVOI, INVISIBLE POUR LES ÉLÈVES : sept tapotements sur le numéro de version, chacun
   à moins de deux secondes du précédent, ouvrent une feuille qui dit ce que la file contiendrait ; la carte ne
   change pas d'un pixel. Provisoire : pour la retirer, l'appel _armerLectureFile() ci-dessus,
   ces blocs et .filesheet d'app.css. ⚠️ Aucun onclick en ligne : le harnais exige qu'il n'en
   reste aucun après rendu. (journal : ui/parametres.js · la lecture de la file d’envoi) */
var _verTaps=0, _verT=null;
function _armerLectureFile(){
  var el=document.getElementById('prm-ver'); if(!el)return;
  el.addEventListener('click',function(){
    _verTaps++; clearTimeout(_verT);
    _verT=setTimeout(function(){_verTaps=0;},2000);   // deux secondes d'arret et tout retombe
    if(_verTaps>=7){ _verTaps=0; _ouvrirLectureFile(); }
  });
}
function _ligneFile(l,v,cl){
  return '<div class="fs-l"><span>'+escHTML(l)+'</span><span class="v '+(cl||'')+'">'+escHTML(String(v))+'</span></div>';
}
function _ouvrirLectureFile(){
  var e=null;
  try{ if(typeof SYNC!=='undefined'&&SYNC&&SYNC.etat)e=SYNC.etat(); }catch(_){ e=null; }
  var f=document.getElementById('filesheet');
  if(!f){
    var voile=document.createElement('div'); voile.id='filevoile'; voile.className='filevoile';
    f=document.createElement('div'); f.id='filesheet'; f.className='filesheet';
    document.body.appendChild(voile); document.body.appendChild(f);
    voile.addEventListener('click',_fermerLectureFile);
  }
  var corps;
  if(!e){ corps='<div class="fs-l"><span>Le moteur de file n\u2019est pas charge</span></div>'; }
  else{
    var t=e.parType||{}, pp=[];
    if(t.lecon)pp.push(t.lecon+' lecons');
    if(t.test)pp.push(t.test+' tests');
    if(t.rev)pp.push(t.rev+' revisions');
    if(t.graines)pp.push(t.graines+' graines');
    corps=_ligneFile('En attente', e.enAttente, e.enAttente?'att':'nul')+
          _ligneFile('Detail', pp.join(' \u00b7 ')||'\u2014')+
          _ligneFile('Refusees', e.rebut, e.rebut?'att':'nul')+
          _ligneFile('Diff actif', e.diffArme?'oui':'NON', e.diffArme?'ok':'att')+
          _ligneFile('Envoi', e.envoi?'ACTIF':'desarme', e.envoi?'ok':'att')+
          _ligneFile('Feu', e.feu||'vert', e.feu?'att':'ok')+
          _ligneFile('Dernier', e.motif||'\u2014')+
          _ligneFile('Metronome', e.metronome?'arme':'au repos')+
          (e.purgeDue?_ligneFile('Purge due','OUI','att'):'')+
          _ligneFile('Compte', e.proprio?String(e.proprio).slice(0,8)+'\u2026':'aucun')+
          _ligneFile('Disque', e.disqueKO?e.disqueKO+' refus':'ok', e.disqueKO?'att':'ok');
  }
  f.innerHTML='<h3>La file d\u2019envoi</h3><p class="fs-q">Envoi actif \u2014 la file part au nuage</p>'+
    corps+'<button class="fs-x" id="fs-x">Fermer</button>';
  document.getElementById('fs-x').addEventListener('click',_fermerLectureFile);
  f.classList.add('on'); document.getElementById('filevoile').classList.add('on');
}
function _fermerLectureFile(){
  var f=document.getElementById('filesheet'), v=document.getElementById('filevoile');
  if(f)f.classList.remove('on'); if(v)v.classList.remove('on');
}
function prmObjectif(m){ if(!S.onb||typeof S.onb!=='object')S.onb={}; S.onb.objectif=m; save();
  // abaisser l'objectif sous un seuil déjà dépassé doit valider le jour
  if(objMinutes()>=objGoal()&&S.lastDay!==today())objFete();
  renderParams(); }

function renderProg(){
  // le compte d'abord ; pas de titre « Ta progression », l'encadré du rang porte l'étiquette
  let h='';
  if(SB&&CLOUD.user){
    h+='<div class="acct"><span class="acct-dot"></span><div class="acct-id">'+nomChoisiHTML()+
       '<small>'+escHTML(CLOUD.user.email||'')+'</small></div>'+
       '<button class="acct-pen" onclick="openPrenom()" aria-label="Modifier ton nom">'+icoImg('tab-crayon','ic-inline')+'</button>'+
       '<button class="acct-out" onclick="cloudLogout()">se déconnecter</button></div>';
  } else {
    // Déconnectée, la bande du compte n'existe pas : le nom garde sa place, seul, au-dessus de la carte.
    h+='<div class="acct"><div class="acct-id">'+nomChoisiHTML()+'</div>'+
       '<button class="acct-pen" onclick="openPrenom()" aria-label="Modifier ton nom">'+icoImg('tab-crayon','ic-inline')+'</button></div>';
    h+='<div class="ccard"><div class="ctt"><h3>☁️ Mon compte</h3></div>'+cloudCardHTML()+'</div>';
  }
  var _R=rankFor(S.consScore);
  // Le tracé des 7 rangs est imbriqué dans l'encadré doré. div, pas button : les points du
  // tracé ont leur propre clic (rankInfo, stopPropagation).
  h+='<div class="rankcard" role="button" tabindex="0" onclick="showRank()">'+
       '<div class="rk-row">'+
         '<div class="rk-ar">'+_R.rank.ar+'</div>'+
         '<div class="rk-mid"><div class="rk-lbl">TON RANG</div><div class="rk-tr">'+_R.rank.tr+' · '+_R.rank.fr+'</div></div>'+
         '<div class="rk-chev">›</div>'+
       '</div>'+
       rankTrackHTML()+
     '</div>';
  h+=objRingHTML();      // l'anneau de l'objectif quotidien, seul
  h+=parcoursCardHTML(); // « Ton parcours », juste sous l'encadré du rang
  /* les graines gagnées au total sont visibles ici (journal : ui/parametres.js · renderProg, les graines dans le Profil) */
  h+='<div class="pgrid pgrid4">'+
     '<div class="pstat"><div class="pv">'+(S.streak||0)+'</div><div class="pl">série</div></div>'+
     '<div class="pstat"><div class="pv">'+(S.graines||0)+'</div><div class="pl">graines</div></div>'+
     '<div class="pstat"><div class="pv">'+unitVocabCount()+'</div><div class="pl">mots</div></div>'+
     '<div class="pstat" role="button" tabindex="0" style="cursor:pointer" onclick="showGhufranInfo()"><div class="pv">'+(S.ghufLeft||0)+'</div><div class="pl">ghufrān</div></div></div>';
  h+='<div class="ccard"><div class="ctt"><h3><img class="prm-ic" src="badges/lecons100.png" alt=""> Succès</h3></div>'+
     '<div class="ecu-row">'+SOURATES.map(function(SR,i){
        var pris=(i===0&&fatihaPct()>=100);
        return '<div class="ecu-cell'+(pris?'':' lk')+'">'+ecussonHTML(SR.ar,58)+'<span>'+escHTML(SR.nom)+'</span></div>';
     }).join('')+'</div>'+
     '<div class="sgrid">'+
     BADGES.map(function(b){var got=!!(S.badges&&S.badges[b[0]]);
       return '<button class="scell'+(got?'':' locked')+'" onclick="showSucces(\''+b[0]+'\')" aria-label="'+b[2].replace(/"/g,'')+'">'+
              '<img src="badges/'+b[0]+'.png" onerror="this.parentNode.innerHTML=\''+b[1]+'\'">'+
              '</button>';}).join('')+
     '</div></div>';
  // La carte « Ton parcours » (déclaration hissée : appelée plus haut, juste sous l'encadré du rang)
  function parcoursCardHTML(){
    const ready=UNITS.map((U,i)=>({U,i})).filter(o=>o.U.ready);
    const nTot=ready.length, nVal=ready.filter(o=>unitValidated(o.i)).length; // les unités PRÊTES, pas les déclarées
    // unité en cours, sinon la dernière unité atteinte (on montre toujours où elle en est)
    const cur=ready.find(o=>unitUnlocked(o.i)&&!unitValidated(o.i)) || ready.slice().reverse().find(o=>unitUnlocked(o.i));
    let inner='<div class="pcs-top"><b>'+arReveal('Al-Fātiḥa','الفاتحة')+'</b><span>'+nVal+' / '+nTot+' unités validées</span></div>'+
      '<div class="ubar"><i style="width:'+Math.round(nVal/Math.max(1,nTot)*100)+'%"></i></div>';
    if(nVal>=nTot && nTot>0){
      inner+='<div class="ust" style="text-align:center;margin-top:12px;color:var(--gold2)">🏆 Fātiḥa complétée, ma shā’ Allāh !</div>';
    } else if(cur){
      const i=cur.i,U=cur.U,n=discsFor(i).length; let d=0; for(let k=0;k<n;k++) if(S.done[dkey(i,k)])d++;
      const lbl=(d>=n)?'Terminée':'En cours';
      inner+='<div class="ucard cur" style="margin-top:12px"><div class="uno">'+toAr(U.no)+'</div>'+
        '<div class="ub"><div class="utt">'+lbl+' · <span class="uar">'+U.letters.join(' ')+'</span></div>'+
        '<div class="ust">'+d+' / '+n+' '+arReveal('leçons','دروس')+'</div>'+
        '<div class="ubar"><i style="width:'+Math.round(d/Math.max(1,n)*100)+'%"></i></div></div></div>';
    }
    return '<div class="ccard"><div class="ctt"><h3><img class="prm-ic" src="'+ico('menu-profil')+'" alt=""> Ton parcours</h3></div>'+inner+'</div>';
  }
  document.getElementById('view-prog').innerHTML=h; try{maybeGhufranPrompt();}catch(e){}
}
// Popup détail d'un succès (clic sur une image de la grille)

function showSucces(id){
  var b=BADGES.find(function(x){return x[0]===id;}); if(!b)return;
  var got=!!(S.badges&&S.badges[b[0]]);
  var m=document.getElementById('succesModal');
  if(!m){m=document.createElement('div');m.className='finish';m.id='succesModal';document.body.appendChild(m);}
  /* Un badge : son image et son titre. Pas de boîte, pas de corps de texte (règle Myriam 09/08). */
  m.innerHTML=(CROIX_SUCCES)+
    '<div class="succ-big'+(got?' pop':' locked')+'"><img src="badges/'+b[0]+'.png" onerror="this.parentNode.innerHTML=\''+b[1]+'\'"></div>'+
    '<h2 style="margin:16px 0 0;font-size:20px">'+b[2]+'</h2>'+
    '</div>';
  m.classList.add('on');
  if(got){try{chime();}catch(e){}}
}
function closeSucces(){var m=document.getElementById('succesModal');if(m)m.classList.remove('on');}
