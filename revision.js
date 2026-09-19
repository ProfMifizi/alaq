/* ═══ revision.js — les rouages du hub Réviser (ui/reviser.js le peint) ═══
   · le Qorān : les 17 voix (VOIX, QARI_DEFAUT, qariCur, openQari… qariRender), les repères
     mot à mot HOROV et l'illumination (suivreVerset, suivreArret), playVerse, joueMotVerset,
     lireToutQoran, motBulle, motTap, numAyatHTML, « Lire la sourate » (ouvrirLireSourate),
     les cinq boîtes (BOITES, boiteTap, majParts, partTap), les lanceurs de partie et les
     écrans Construire (vt*), Réécrire (vw*), Ordonner (st*), Réciter (_rec, recToggle…) ;
   · le vocabulaire : allReviewWords, dueReviewWords, REV_INT…, startReview (match, vf, mcq,
     assemble), le stylo ✏️ (openWrite… closeWrite) ;
   · la grammaire : NOTIONS_GRAM, gramEcransU8/U9, gramFile, lancerGrammaire, gramMaitrise, gramFaute ;
   · les lettres : letterGridHTML, badgeSolaire, LETSEL, startSelectedLetters, formsOf, learnedLettersList ;
   · les Noms d'Allah (NOMS_ALLAH, NASEL, nomTog, startNoms, lumTap, majPopNoms) et l'adoption
     Supabase (CONTENU, contentPull — rappelé à DOMContentLoaded par index.html) ;
   · l'entonnoir launchQuranReview et la fin finishReview ;
   · l'état du hub, en liaisons lexicales globales : curSourate, curReviserTab, QCTX, GRAMSES,
     WPEN, VFT, accQ, NASEL, LETSEL, _lireTout, _qariPlay, _suivi, boiteOuverte, partChoisie, _tipT, _rec.

   POURQUOI UN SCRIPT CLASSIQUE (journal : revision.js · pourquoi classique)
   ① le hub sert au premier rendu : showTab('home') appelle motBulleOff() (ui/navigation.js) ;
      différé, l'accueil reste vide à vie. Un module ouvrirait aussi une fenêtre « doigt avant
      module » sur les gestes en ligne de l'onglet.
   ② curSourate, curReviserTab, QCTX, GRAMSES et WPEN sont lus ou réassignés par d'autres
      scripts, un harnais ou un onclick : déclarés dans un module, ils deviendraient privés.
   ③ il AGIT au chargement (S.qari et sa migration, les Noms versés dans la table du son,
      l'adoption du dernier contenu connu) et ne lit alors que S, saveLocal (progression.js),
      inscrireLeSon (son.js), FATIHA, SOURATES (donnees.js) et localStorage.
      ⚠️ Pas éprouvable dans un bac nu : la garde charge ses prédécesseurs (garderLaRevision).
   Balise nue, exactement <script src="revision.js"></script> (outils/inventaire.js la relit),
   sous ui/reviser.js et avant le grand script. Ni defer, ni module, ni import/export.

   ⚠️ Préséance dans la table du son : les mots des unités 1-7 (son.js, chargé avant), puis la
   graine des Noms, puis le cache Supabase, qui GAGNE (الصَّمَدُ, اللَّهُ divergent du package).
   Le banc ⑤ le mesure avec un cache pré-rempli.

   ═══ LE CONTRAT (résolu À L'APPEL, jamais à la définition) ═══
   index.html : toast, lecteurPret, knownLetterSet, wordReadable, U8, QUEUE, qi, curU,
   curD, total, wrongCount, MISSED, inRetry, EXAM, REVIEW, REVSES, REVFREE, backTo,
   _grainesSession, pendingStreak ·
   bulles-tutoriels.js : SOLAIRES_14, LUNAIRES_14, estSolaire (lus par badgeSolaire), letterTut ·
   constance.js : feteJourPending,
   GRAINES, gagnerGraines, bumpConstance, validerJour, checkBadges, confettiBurst,
   fillFinishCases, fillFinishConstance, today, _addDays — chargé APRÈS ce fichier,
   donc résolu à l'appel seulement · progression.js : S, save, saveLocal, dkey,
   unitUnlocked, unitValidated, HEARTS_MAX, SB, SYNC · son.js : speak, sayLetterName,
   stopAudio, okBeep, playSfx, toc, spkSVG, inscrireLeSon, _sndGen, _curAudio ·
   donnees.js : UNITS, SOURATES, FATIHA, letterKey, strip · generateurs.js : shuffle,
   mcq, weightedShuffle, buildWords · parcours.js : discsFor · assets.js : icoImg ·
   ui/ : renderReviser, renderCours, renderParams · src/player/ (module) : renderStep,
   advance, ecransNotes · src/ecrans/ (module) : splitUnits, asmAttendu, asmHintOff,
   tileLabel, isHarakat, ctaOn, ctaOn2, elogeHTML, mascotteStop, mascotteDanse.
   Le banc dresse cette liste lui-même. Dans l'autre sens, index.html, ui/*.js, src/player/ et
   le pont de l'unité 8 appellent ce fichier par ses noms nus, à l'appel.

   Gardes : outils/verifier-revision.mjs, previews/_verif_revision.html (source, dist, et la copie
   sans ce fichier), garderLaRevision() (vite.config.mjs), CORE du sw, verifier-sw-horsligne.mjs,
   verifier-paquet-natif.js — et les harnais du hub (_verif_reviser_qoran, _verif_grammaire…).
   ═══════════════════════════════════════════════════════════════════════════ */

/* ===== Réviser « Les lettres » : la grille des 28, sélectionnable ===== */
var LETSEL=new Set();

/* Le NOM, pas le son : le son ne vient qu'après le tracé (journal : revision.js · le nom, pas le son). */
function letToggle(k){ if(LETSEL.has(k))LETSEL.delete(k); else{ LETSEL.add(k); sayLetterName(k); } renderReviser('lettres'); }
function letSelAll(){ knownLetterSet().forEach(function(k){LETSEL.add(k);}); renderReviser('lettres'); }
function letSelClear(){ LETSEL.clear(); renderReviser('lettres'); }
function startSelectedLetters(){
  if(!LETSEL.size)return;
  var byKey={}; learnedLettersList().forEach(function(x){byKey[letterKey(x.L)]=x;});
  var seen=S.letSeen||(S.letSeen={}); var steps=[];
  LETSEL.forEach(function(k){ var x=byKey[k]; if(x){ formsOf(x.L,x.u).forEach(function(st){steps.push(st);}); seen[k]=1; } });
  if(!steps.length){ toast('Choisis au moins une lettre débloquée'); return; }
  save(); QCTX=null; launchQuranReview(steps);
}

/* Le badge ☀️/🌙 n'apparaît qu'une fois l'unité 8 ouverte : avant, c'est du bruit. */
function badgeSolaire(k){
  if(!unitUnlocked(7))return '';
  if(SOLAIRES_14.indexOf(k)<0&&LUNAIRES_14.indexOf(k)<0)return '';   /* la hamza, hors des 28 */
  return '<span class="sm" aria-hidden="true">'+(estSolaire(k)?'☀️':'🌙')+'</span>';
}
function letterGridHTML(){
  var order=['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي'];
  var unlocked=knownLetterSet(), seen=S.letSeen||{};
  var order0=['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي'];
  var uCount=order0.filter(function(L){return unlocked.has(letterKey(L));}).length;
  var latestU=-1; UNITS.forEach(function(U,i){ if(U.alpha && (S.done[dkey(i,1)]||unitValidated(i))) latestU=i; });
  var nouv=new Set(); if(latestU>=0) UNITS[latestU].letters.forEach(function(L){ if(!seen[letterKey(L)]) nouv.add(letterKey(L)); });
  var any=uCount>0;
  // Haut : bouton Réviser + aide « ? » (ou message si rien de débloqué)
  var h=any
    ? '<div class="lg-top">'+
        '<button class="lg-rev" '+(LETSEL.size?'':'disabled')+' onclick="startSelectedLetters()">'+(LETSEL.size?('Réviser '+LETSEL.size+' lettre'+(LETSEL.size>1?'s':'')):'Réviser')+'</button>'+
        '<button class="lg-help" onclick="letterTut()" aria-label="Revoir le guide" title="Revoir le guide">?</button>'+
      '</div>'
    : '<div class="lg-prompt empty">débloque une leçon pour pouvoir sélectionner des lettres</div>';
  h+='<div class="lg-grid">'+order.map(function(L){
    var k=letterKey(L), g=(L==='ه')?'ﻩ':L;
    if(!unlocked.has(k)) return '<div class="lg-cell locked"><span class="lk">🔒</span>'+g+'</div>';
    var sel=LETSEL.has(k);
    var cls='lg-cell '+(sel?'sel':'avail')+(nouv.has(k)?' nouv':'');
    /* Le halo .nouv reste ; les emojis ✨ et 🔸 ont été retirés (journal : revision.js · emojis de la grille). */
    var mk=(sel?'<span class="ck">✓</span>':'')+badgeSolaire(k);
    return '<div class="'+cls+'" onclick="letToggle(\''+k+'\')">'+mk+g+'</div>';
  }).join('')+'</div>';
  /* La hamza, hors des 28 : visible dès que le alif est connu ; les sièges wāw et yāʾ restent
     verrouillés (pas encore enseignés). ⚠️ Ces cases ne se sélectionnent pas : on touche pour ENTENDRE. */
  if(unlocked.has('ا')){
    /* ⚠️ Ne pas remettre d'étiquette <span class="hzl"> : le nom du siège s'écoute ; min-height:44px
       tient seul la zone de touche (journal : revision.js · étiquettes de la hamza). */
    var SIEGES=[['ء',1],['أ',1],['إ',1],['ؤ',0],['ئ',0]];
    h+='<div class="lg-hamza">'+SIEGES.map(function(s){
      return s[1]
        ? '<div class="hz" onclick="hamzaTap(this,\''+s[0]+'\')">'+s[0]+'</div>'
        : '<div class="hz locked">'+s[0]+'</div>';
    }).join('')+'</div>';
  }
  if(any) h+='<div class="lg-qa"><button onclick="letSelAll()">⚡ Tout sélectionner</button><button onclick="letSelClear()">Effacer</button></div>';
  return h;
}

/* ── LES RÉCITATEURS ─────────────────────────────────────────────────────────
   17 voix. Le flux cdn.islamic.network est autorisé en streaming avec cache client (sw.js) ;
   les grands catalogues refusent l'usage commercial (journal : revision.js · récitateurs).
   kb  : le débit FAIT PARTIE de l'URL ; une valeur fausse renvoie un 403.
   sec : durée moyenne d'un verset de la Fātiḥa mesurée sur les fichiers (afinfo) — le tempo,
         qui ordonne la liste.
   Écartées, ne pas les remettre : ar.minshawimujawwad (identique au MD5 à ar.minshawi),
   ar.abdulsamad (découpage décalé). */
const VOIX=[
 {id:'ar.aymanswoaid', loc:1,        kb:64,  sec:7.1, fr:'Ayman Suwayd',          ar:'أيمن سويد',            st:'m', tag:'tajwīd'},
 {id:'ar.ibrahimakhbar',      kb:32,  sec:7.2, fr:'Ibrāhīm al-Akhḍar',     ar:'إبراهيم الأخضر',       st:'m'},
 {id:'ar.hudhaify', loc:1,           kb:128, sec:7.0, fr:'ʿAlī al-Ḥudhayfī',      ar:'علي الحذيفي',          st:'m'},
 {id:'ar.muhammadayyoub', loc:1,     kb:128, sec:6.9, fr:'Muḥammad Ayyūb',        ar:'محمد أيوب',            st:'m'},
 {id:'ar.alafasy', loc:1,            kb:128, sec:6.1, fr:'al-ʿAfāsī',             ar:'مشاري راشد العفاسي',   st:'m'},
 {id:'ar.husary', loc:1,             kb:128, sec:6.1, fr:'al-Ḥuṣarī',             ar:'محمود خليل الحصري',    st:'m'},
 {id:'ar.shaatree', loc:1,           kb:128, sec:5.9, fr:'Abū Bakr ash-Shāṭirī',  ar:'أبو بكر الشاطري',      st:'m'},
 {id:'ar.abdullahbasfar', loc:1,     kb:192, sec:5.8, fr:'ʿAbdullāh Basfar',      ar:'عبد الله بصفر',        st:'m'},
 {id:'ar.minshawi', loc:1,           kb:128, sec:5.6, fr:'al-Minshāwī',           ar:'محمد صديق المنشاوي',   st:'m'},
 {id:'ar.abdulbasitmurattal', loc:1, kb:192, sec:5.1, fr:'ʿAbd al-Bāsiṭ',         ar:'عبد الباسط عبد الصمد', st:'m'},
 {id:'ar.muhammadjibreel',    kb:128, sec:5.1, fr:'Muḥammad Jibrīl',       ar:'محمد جبريل',           st:'m'},
 {id:'ar.hanirifai',          kb:192, sec:5.0, fr:'Hānī ar-Rifāʿī',        ar:'هاني الرفاعي',         st:'m'},
 {id:'ar.saoodshuraym',       kb:64,  sec:4.6, fr:'ash-Shuraym',           ar:'سعود الشريم',          st:'m'},
 {id:'ar.abdurrahmaansudais', kb:192, sec:4.2, fr:'as-Sudays',             ar:'عبد الرحمن السديس',    st:'m'},
 {id:'ar.ahmedajamy',         kb:128, sec:4.0, fr:'Aḥmad al-ʿAjamī',       ar:'أحمد العجمي',          st:'m'},
 {id:'ar.mahermuaiqly', loc:1,       kb:128, sec:3.7, fr:'Māhir al-Muʿayqilī',    ar:'ماهر المعيقلي',        st:'m'},
 {id:'ar.husarymujawwad',     kb:128, sec:11.1,fr:'al-Ḥuṣarī',             ar:'محمود خليل الحصري',    st:'j'}
];
/* La voix par défaut : al-Ḥuṣarī (lent, segmentation HOROV complète, hébergé). VOIX[0] n'a pas
   de repères, donc rien ne s'illuminait (journal : revision.js · la voix par défaut).
   ⚠️ Ne pas réordonner VOIX (l'ordre par tempo porte un sens) ; un S.qari déjà posé est respecté. */
const QARI_DEFAUT='ar.husary';
/* ⚠️ Posé APRÈS la déclaration de QARI_DEFAUT : avant, zone morte temporelle, et le
   ReferenceError tue tout le script (node --check ne le voit pas). Écrire S.qari sert au
   sélecteur (épingler la ligne) ; les repères passent par qariCur().id. */
if(!S.qari)S.qari=QARI_DEFAUT;
/* Migration unique : l'ancien défaut écrit par DEF ressemble à un choix ; on ne bascule que
   celles qui n'ont jamais ouvert le sélecteur (qariChoisi absent). */
if(!S.qariMigr0817){ S.qariMigr0817=1;
  if(!S.qariChoisi && S.qari==='ar.aymanswoaid') S.qari=QARI_DEFAUT;
  /* ⚠️ saveLocal, PAS save : save() rajeunirait S._ts avant l'arbitrage de cloudPull
     (journal : revision.js · migration et saveLocal). */
  try{ saveLocal(); }catch(e){} }
function qariCur(){ for(var i=0;i<VOIX.length;i++)if(VOIX[i].id===S.qari)return VOIX[i];
  for(var j=0;j<VOIX.length;j++)if(VOIX[j].id===QARI_DEFAUT)return VOIX[j];
  return VOIX[0]; }
function qariById(id){ for(var i=0;i<VOIX.length;i++)if(VOIX[i].id===id)return VOIX[i]; return VOIX[0]; }
/* 10 voix hébergées (audios-app-alaq/recit/<id>/<n°>.mp3, versets 1-7) ; le flux cdn reste
   le repli et sert les 7 autres (journal : revision.js · voix hébergées). */
function qariUrlCdn(v,aya){ return 'https://cdn.islamic.network/quran/audio/'+v.kb+'/'+v.id+'/'+aya+'.mp3'; }
function qariUrl(v,aya){ return (v.loc&&aya>=1&&aya<=7)?('audios-app-alaq/recit/'+v.id+'/'+aya+'.mp3'):qariUrlCdn(v,aya); }
var _qariPlay=null; // la voix qu'on écoute DANS le sélecteur (≠ la voix choisie)

function openQari(){ qariRender(); document.getElementById('qsel').classList.add('on'); }
function closeQari(){ stopAudio(); _qariPlay=null; qariBulleOff(); document.getElementById('qsel').classList.remove('on'); }
/* La bulle ⓘ se referme au geste suivant, où qu'il tombe — pas de croix à viser. */
function qariBulleTog(){ var b=document.getElementById('qbulle'),i=document.getElementById('qbi');
  var o=!b.classList.contains('on'); b.classList.toggle('on',o); i.classList.toggle('on',o); }
function qariBulleOff(){ var b=document.getElementById('qbulle'),i=document.getElementById('qbi');
  if(b)b.classList.remove('on'); if(i)i.classList.remove('on'); }

function qariPick(id){ S.qari=id; S.qariChoisi=1; save();   /* trace du choix explicite */ qariRender();
  { var s=document.querySelector('.mushaf-sous'); if(s)s.textContent=qariCur().fr+' · touche un verset ou un mot'; }
  try{ renderReviser(curReviserTab); }catch(e){} // la ligne « Récitateur » se met à jour
  try{ renderParams(); }catch(e){}               // et la carte « Récitateur » des Paramètres
  try{ var n=document.getElementById('qariNom'), pl=document.getElementById('player');
    // ⚠️ le #qariNom du dernier spot survit dans le lecteur CACHÉ : cette branche exige le lecteur ouvert
    if(n&&pl&&pl.classList.contains('on')){ n.textContent=qariCur().fr; closeQari(); if(typeof window._spotVi==='number')playVerse(window._spotVi); } }catch(e){}
}
function qariHear(id,ev){
  ev.stopPropagation();                              // toucher ▶ n'est PAS choisir la voix
  if(_qariPlay===id){ stopAudio(); _qariPlay=null; qariRender(); return; }
  stopAudio(); _qariPlay=id; qariRender('load');     // un seul son à la fois
  var gen=_sndGen, v=qariById(id);
  var u=qariUrl(v,1);                                // verset 1 du mushaf = Al-Fātiḥa, verset 1
  var a=new Audio(u); _curAudio=a;
  var ko=function(){ if(gen!==_sndGen)return; _qariPlay=null; qariRender(); toast('Récitation indisponible sans connexion'); };
  var brancher=function(x){
    x.addEventListener('playing',function(){ if(gen===_sndGen)qariRender('play'); },{once:true});
    x.addEventListener('ended',function(){ if(gen!==_sndGen)return; _qariPlay=null; qariRender(); },{once:true});
  };
  brancher(a);
  var lireCdn=function(){ if(gen!==_sndGen||_curAudio!==a)return;   // le même repli que playVerse
    var b=new Audio(qariUrlCdn(v,1)); _curAudio=b; brancher(b);
    b.addEventListener('error',ko,{once:true});
    var p2=b.play(); if(p2&&p2.catch)p2.catch(ko); };
  var repli=(u===qariUrlCdn(v,1))?ko:lireCdn;
  a.addEventListener('error',repli,{once:true});
  var p=a.play(); if(p&&p.catch)p.catch(repli);
}
/* Complet = les 7 versets ont autant de repères que de mots. as-Sudays (verset 1) et
   ʿAbd al-Bāsiṭ (verset 4) fusionnent des mots : chez eux, un verset ne s'illumine pas. */
function qariSuivi(id){
  var t=HOROV[id]; if(!t)return '';
  var vs=(SOURATES[0]||{}).verses||[], tout=vs.length>0;
  for(var i=0;i<vs.length;i++){ var seg=t[i+1];
    if(!seg||seg.length!==vs[i].split(' ').length){ tout=false; break; } }
  return tout?'les mots s\u2019illuminent':'mots illumin\u00e9s (sauf 1 verset)';
}
function qariRow(v,etat){
  var on=(v.id===S.qari), pl=(_qariPlay===v.id);
  return '<button class="qrow'+(on?' on':'')+(pl?' '+(etat||'play'):'')+'" onclick="qariPick(\''+v.id+'\')">'+
    '<span class="tick">'+(on?'✓':'')+'</span>'+
    '<span class="qnm"><span class="fr">'+v.fr+
      (v.tag?' <em style="font-style:normal;color:var(--info);font-size:11px">· '+v.tag+'</em>':'')+
      '</span><span class="arb">'+v.ar+'</span>'+
      (qariSuivi(v.id)?'<span class="qhoro">'+qariSuivi(v.id)+'</span>':'')+
      '</span>'+
    '<span class="qsec">'+Math.round(v.sec)+'<em>s</em></span>'+
    /* le haut-parleur animé ; l'aria-label garde les trois états */
    '<span class="qhear" onclick="qariHear(\''+v.id+'\',event)" role="button" '+
      'aria-label="'+(pl?(etat==='load'?'Chargement de l’extrait':'Arrêter l’extrait'):'Écouter un extrait')+'">'+
      spkSVG(pl?'on':'')+'</span></button>';
}
function qariRender(etat){
  var h='';
  [['m','Murattal','· de la plus posée à la plus rapide'],['j','Mujawwad','· chanté']].forEach(function(g){
    var lot=VOIX.filter(function(v){return v.st===g[0];}).sort(function(a,b){return b.sec-a.sec;});
    if(!lot.length)return;
    h+='<div class="qgrp">'+g[1]+' <em>'+g[2]+'</em></div>'+
       lot.map(function(v){return qariRow(v,etat);}).join('');
  });
  document.getElementById('qlist').innerHTML=h;
  document.getElementById('qpin').innerHTML='<span class="cap">voix choisie</span>'+qariRow(qariCur(),etat);
}

/* ═══ SUIVRE LA RÉCITATION MOT À MOT ═══
   Repères de quran.com (début/fin de chaque mot, en ms), sur le même master que nos fichiers ;
   embarqués, donc hors ligne (journal : revision.js · suivre mot à mot). Relevés bruts :
   donnees/horodatage-mots-fatiha.json.
   ⚠️ Nombre de segments ≠ nombre de mots, ou voix absente : on n'illumine PAS, on n'invente rien. */
const HOROV={"ar.alafasy":{"1":[[60,610],[620,1310],[1320,2450],[2460,5970]],"2":[[80,960],[970,1800],[1810,2460],[2470,5140]],"3":[[40,1230],[1240,4160]],"4":[[60,840],[850,1400],[1410,4280]],"5":[[30,970],[980,1710],[1720,2870],[2880,6290]],"6":[[30,670],[680,1630],[1640,5120]],"7":[[30,740],[750,1700],[1710,2620],[2630,3590],[3600,4210],[4220,5290],[5300,6320],[6330,6630],[6640,12320]]},"ar.husary":{"1":[[50,510],[520,1180],[1190,2340],[2350,4480]],"2":[[700,1410],[1420,2200],[2210,2880],[2890,5310]],"3":[[150,1400],[1410,3530]],"4":[[0,1040],[1050,1660],[1670,3630]],"5":[[350,1310],[1320,2210],[2220,3510],[3520,5900]],"6":[[300,870],[880,1790],[1800,4480]],"7":[[450,1200],[1210,2110],[2120,3070],[3080,4220],[4230,4940],[4950,6200],[6210,7370],[7380,7690],[7700,13830]]},"ar.minshawi":{"1":[[600,930],[940,1630],[1640,2730],[2740,4170]],"2":[[800,1710],[1720,2630],[2640,3290],[3300,4890]],"3":[[800,2080],[2090,3700]],"4":[[0,1720],[1730,2320],[2330,3570]],"5":[[1000,2040],[2050,2860],[2870,4120],[4130,5570]],"6":[[900,1490],[1500,2660],[2670,4390]],"7":[[950,1680],[1690,2760],[2770,3770],[3780,4900],[4910,5500],[5510,6780],[6790,7810],[7820,8290],[8300,10630]]},"ar.abdulbasitmurattal":{"1":[[600,970],[980,1560],[1570,2520],[2530,3920]],"2":[[1050,1700],[1710,2470],[2480,2970],[2980,4670]],"3":[[950,1920],[1930,3850]],"4":[[0,4573]],"5":[[900,1670],[1680,2340],[2350,3460],[3470,5040]],"6":[[1050,1540],[1550,2500],[2510,4480]],"7":[[1800,2340],[2350,3140],[3150,4010],[4020,4870],[4880,5470],[5480,6460],[6470,7390],[7400,7770],[7780,12350]]},"ar.shaatree":{"1":[[260,920],[930,1840],[1850,3430],[3440,6080]],"2":[[100,850],[860,1670],[1680,2320],[2330,4550]],"3":[[110,1530],[1540,4390]],"4":[[80,1050],[1060,2640],[2650,3670]],"5":[[150,1170],[1180,2200],[2210,3600],[3610,5730]],"6":[[40,870],[880,2060],[2070,5100]],"7":[[50,1080],[1090,2230],[2240,3360],[3370,5370],[5380,6270],[6280,8210],[8220,10520],[10530,11040],[11050,18510]]},"ar.abdurrahmaansudais":{"1":[["380","730"],["740","3082"]],"2":[["420","1000"],["1010","1860"],["1870","2430"],["2440","4190"]],"3":[["180","1140"],["1150","2880"]],"4":[["90","840"],["850","1620"],["1630","3010"]],"5":[["30","970"],["980","1720"],["1730","2840"],["2850","4400"]],"6":[["0","780"],["790","1620"],["1630","3850"]],"7":[["170","1030"],["1040","2050"],["2060","2910"],["2920","3930"],["3940","4580"],["4590","5660"],["5670","6650"],["6660","11140"]]},"ar.hanirifai":{"1":[[0,1810],[1820,2770],[2780,3710]],"2":[[650,1290],[1300,2300],[2310,2920],[2930,4920]],"3":[[30,1430],[1440,2960]],"4":[[80,980],[990,1610],[1620,2690]],"5":[[180,1170],[1180,1980],[1990,3260],[3270,4820]],"6":[[250,920],[930,1940],[1950,4100]],"7":[[40,740],[750,1770],[1780,2880],[2890,4330],[4340,4920],[4930,6070],[6080,7220],[7230,7530],[7540,12670]]},"ar.saoodshuraym":{"1":[[140,650],[660,1160],[1170,2110],[2120,2560]],"2":[[100,610],[620,1410],[1420,1810],[1820,3270]],"3":[[30,890],[900,2820]],"4":[[100,790],[800,1510],[1520,2560]],"5":[[50,1060],[1070,1840],[1850,3120],[3130,4410]],"6":[[200,680],[690,1690],[1700,3320]],"7":[[60,690],[700,1560],[1570,2370],[2380,3670],[3680,4170],[4180,5110],[5120,6020],[6030,6380],[6390,11650]]}};
var _suivi=0,_suiviJeton=0;
function suivreArret(){
  if(_suivi)cancelAnimationFrame(_suivi); _suivi=0; _suiviJeton++;
  var l=document.querySelectorAll('.vw.lu,.vw.en');
  for(var i=0;i<l.length;i++)l[i].classList.remove('lu','en');
  var a=document.querySelectorAll('.ayat.en'); for(var j=0;j<a.length;j++)a[j].classList.remove('en');
  var s=document.querySelectorAll('.vspk-in.on'); for(var k=0;k<s.length;k++)s[k].classList.remove('on');
}
/* Illumine les mots du verset vi au fil de l'audio a. Sans repères : ne fait rien. */
function suivreVerset(vi,a){
  suivreArret();
  try{
    if(!a)return;
    if((typeof curSourate!=='undefined'?curSourate:0)!==0)return;   // seule la Fātiḥa est relevée
    var box=document.querySelector('[data-suivre="'+vi+'"]'); if(!box)return;
    box.classList.add('en');                       // l'ayah en cours se distingue dans le flux
    var mots=box.querySelectorAll('.vw'); if(!mots.length)return;
    var h=(HOROV[qariCur().id]||{})[vi+1];
    if(!h||h.length!==mots.length)return;                           // segmentation absente ou partielle
    var gen=_sndGen, jeton=_suiviJeton;
    var pas=function(){
      /* ⚠️ Un tour périmé ne doit rien éteindre : le repli lireCdn relance un second suivi
         sur le même verset (journal : revision.js · tour périmé du suivi). */
      if(jeton!==_suiviJeton) return;
      if(gen!==_sndGen||_curAudio!==a){ suivreArret(); return; }
      /* le verset a pu être redessiné : on reprend les nœuds */
      if(!box.isConnected){ box=document.querySelector('[data-suivre="'+vi+'"]');
        if(!box){ suivreArret(); return; } mots=box.querySelectorAll('.vw');
        if(mots.length!==h.length){ suivreArret(); return; } }
      var ms=a.currentTime*1000, cour=-1, i;
      for(i=0;i<h.length;i++) if(ms>=h[i][0]) cour=i;
      for(i=0;i<mots.length;i++){
        mots[i].classList.toggle('lu', i<cour);
        mots[i].classList.toggle('en', i===cour);
      }
      if(a.ended){                                                  // le verset entier reste allumé un instant
        for(i=0;i<mots.length;i++){ mots[i].classList.add('lu'); mots[i].classList.remove('en'); }
        /* ⚠️ Minuterie à jeton : sans lui, avec LIRE TOUT, elle éteint le verset SUIVANT
           (journal : revision.js · extinction du verset suivant). */
        _suivi=0; var _j=jeton;
        setTimeout(function(){ if(_j===_suiviJeton)suivreArret(); },1400); return;
      }
      _suivi=requestAnimationFrame(pas);
    };
    _suivi=requestAnimationFrame(pas);
  }catch(e){}
}
/* Numéro de fin d'ayah : chiffres arabes orientaux dans le signe ۝ (U+06DD) du mushaf ;
   le chiffre est posé par le code, jamais dessiné (journal : revision.js · numéro de l'ayah). */
const CHIF_AR=['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function numArabe(n){ return String(n).split('').map(function(c){ return CHIF_AR[+c]||c; }).join(''); }
function numAyatHTML(vi){ return '<span class="ayano">\u06DD'+numArabe(vi+1)+'</span>'; }

/* UN SEUL MOT : on lit le fichier du verset entre les repères HOROV du mot. Sans repères : le verset entier. */
function joueMotVerset(vi,wi){
  try{
    var SRv=SOURATES[(typeof curSourate!=='undefined'?curSourate:0)]||SOURATES[0];
    var h=(HOROV[qariCur().id]||{})[vi+1];
    if(!h||h.length!==SRv.verses[vi].split(' ').length)return playVerse(vi);
    _lireTout=false; majLireTout();
    stopAudio(); var gen=_sndGen;
    var v=qariCur(), aya=(SRv.first||1)+vi;
    var a=new Audio(qariUrl(v,aya)); _curAudio=a;
    var el=document.querySelector('[data-suivre="'+vi+'"] .vw[data-w="'+wi+'"]');
    if(el)el.classList.add('en');
    var fin=function(){ if(gen!==_sndGen)return; try{a.pause();}catch(e){} if(el)el.classList.remove('en'); };
    a.addEventListener('loadedmetadata',function(){ if(gen!==_sndGen)return;
      try{ a.currentTime=h[wi][0]/1000; }catch(e){}
      var p=a.play(); if(p&&p.catch)p.catch(function(){ if(el)el.classList.remove('en'); }); });
    a.addEventListener('playing',function(){ if(gen!==_sndGen)return;
      setTimeout(fin,Math.max(200,h[wi][1]-h[wi][0]+60)); });
    a.addEventListener('error',function(){ if(el)el.classList.remove('en'); });
    a.load();
  }catch(e){}
}

/* LIRE TOUT : les versets s'enchaînent ; un second appui arrête. */
var _lireTout=false;
function majLireTout(){ var b=document.getElementById('btLireTout'); if(!b)return;
  b.classList.toggle('on',_lireTout);
  var t=document.getElementById('btLireToutT'); if(t)t.textContent=_lireTout?'ARRÊTER':'LIRE TOUT'; }
function lireToutQoran(){
  if(_lireTout){ _lireTout=false; stopAudio(); majLireTout(); return; }
  _lireTout=true; majLireTout();
  var SRv=SOURATES[(typeof curSourate!=='undefined'?curSourate:0)]||SOURATES[0];
  (function chaine(vi){
    if(!_lireTout||vi>=SRv.verses.length){ _lireTout=false; majLireTout(); return; }
    var a=playVerse(vi);
    if(!a){ _lireTout=false; majLireTout(); return; }
    var gen=_sndGen;
    var suite=function(){ if(gen!==_sndGen||!_lireTout)return; setTimeout(function(){ chaine(vi+1); },120); };
    a.addEventListener('ended',suite,{once:true});
  })(0);
}
/* Toucher un mot de la sourate : il s'éclaire, se répète et se traduit (SOURATES[n].tr).
   ⚠️ motTap n'est appelé que depuis la sourate illuminée : un exercice appelle joueMotVerset,
   sinon on soufflerait la réponse. */
function motBulleOff(){ var b=document.getElementById('motbulle'); if(b)b.classList.remove('on'); }
function motBulle(vi,wi){
  var b=document.getElementById('motbulle'); if(!b)return;
  var SR=SOURATES[(typeof curSourate!=='undefined'?curSourate:0)]||SOURATES[0];
  var mots=SR.verses[vi].split(' ');
  document.getElementById('mbAr').textContent=mots[wi]||'';
  document.getElementById('mbFr').textContent=glossOf(SR,vi,wi)||'—';
  document.getElementById('mbSrc').textContent=SR.nom+' · verset '+(vi+1)+' · mot '+(wi+1)+'/'+mots.length;
  var s=document.getElementById('mbSpk');
  s.innerHTML=spkSVG(); s.onclick=function(){ joueMotVerset(vi,wi); };
  /* ⚠️ On MESURE la barre du bas (encoche, grands caractères) ; son test de visibilité passe par
     le style calculé (offsetParent est toujours null en position:fixed). ⚠️ Dès 700px, .botnav
     devient le rail gauche : même largeur de bascule que la feuille de style, sinon la bulle
     sort par le haut (journal : revision.js · la bulle de traduction). */
  try{
    if(window.matchMedia&&window.matchMedia('(min-width:700px)').matches){
      b.style.bottom='24px';                       // pas de barre du bas : on respire du bord
    }else{
      var nav=document.querySelector('.botnav');
      var vu=nav&&getComputedStyle(nav).display!=='none';
      b.style.bottom=(vu?Math.ceil(nav.getBoundingClientRect().height):0)+'px';
    }
  }catch(e){}
  b.classList.add('on');
}
function motTap(vi,wi){ joueMotVerset(vi,wi); motBulle(vi,wi); }
function playVerse(i){ // le verset : fichier HÉBERGÉ si la voix l'a, sinon le flux ; repli flux si le fichier manque
  try{
    stopAudio();
    var gen=_sndGen;
    var SRv=SOURATES[(typeof curSourate!=='undefined'?curSourate:0)]||SOURATES[0];
    var v=qariCur(), aya=(SRv.first||1)+i;                       // n° GLOBAL du verset
    var u=qariUrl(v,aya);
    var a=new Audio(u); _curAudio=a;
    // ⚠️ un haut-parleur par verset : on allume celui de CE verset
    var _ondes=function(x){ var s=document.querySelector('[data-suivre="'+i+'"] .vspk-in .spk')||
                                    document.querySelector('.vspk .spk'); if(!s)return;
      x.addEventListener('playing',function(){ if(gen===_sndGen)s.classList.add('on'); });
      x.addEventListener('ended',function(){ s.classList.remove('on'); });
      x.addEventListener('pause',function(){ s.classList.remove('on'); });
      x.addEventListener('error',function(){ s.classList.remove('on'); }); };
    _ondes(a); suivreVerset(i,a);
    var ko=function(){ if(gen===_sndGen)toast('Récitation indisponible sans connexion'); };
    var lireCdn=function(){ if(gen!==_sndGen||_curAudio!==a)return; // garde : error + p.catch peuvent tomber tous les deux
      var b=new Audio(qariUrlCdn(v,aya)); _curAudio=b; _ondes(b); suivreVerset(i,b);
      b.addEventListener('error',ko,{once:true});
      var p2=b.play(); if(p2&&p2.catch)p2.catch(ko); };
    var repli=(u===qariUrlCdn(v,aya))?ko:lireCdn;
    a.addEventListener('error',repli,{once:true});
    var p=a.play(); if(p&&p.catch)p.catch(repli);
    return a;                       // l'enchaînement « LIRE TOUT » s'accroche à son `ended`
  }catch(e){}
}

function lastUnlockedIndex(){ let last=0; UNITS.forEach((U,i)=>{ if(unitUnlocked(i))last=i; }); return last; }

/* ===== Révision globale (réutilise le lecteur, ne marque aucun disque) ===== */
function frOptions(pool,w){
  const others=shuffle(pool.filter(x=>x.fr!==w.fr)).slice(0,2);
  return shuffle([{txt:w.fr,key:w.fr},...others.map(x=>({txt:x.fr,key:x.fr}))]);
}
// ===== Répétition espacée : sélection des mots à réviser =====
const REVIEW_CAP=7; // 7 mots par session (choix Myriam 05/07) ; au-delà, sessions successives
const REV_INT=[1,3,7,14,30]; // paliers de répétition espacée (jours) : 1 succès -> +1j, 2 -> +3j, 3 -> +7j, 4 -> +14j, 5+ -> +30j
const REV_ECRIT_DES=4;       // §3.1/D9 : l'écriture n'apparaît qu'à partir du palier 4 (J26 pour un mot sans faute)
function revPalier(w){ return (S.rev[w.w]&&S.rev[w.w].n)||0; }
const REV_NEW_PER_DAY=7;     // §2.5 : au plus 7 mots NEUFS entrent en révision par jour (sinon les 76 mots voyagent en troupeau pour toujours)
// Combien de places neuves reste-t-il aujourd'hui ? (le compteur se remet à zéro au changement de date)
function revIntakeLeft(){
  const t=today();
  if(!S.revIn||S.revIn.d!==t)S.revIn={d:t,n:0};
  return Math.max(0,REV_NEW_PER_DAY-S.revIn.n);
}

/* Le disque après lequel les mots d'une unité entrent en révision : « Lire des mots »
   (buildWords), ou le disque marqué vocab (unité 8), sinon ils n'entreraient qu'à la
   validation de toute l'unité. */
function _lireDone(idx){ const ds=discsFor(idx); for(let i=0;i<ds.length;i++){ if(ds[i].build===buildWords||ds[i].vocab)return !!S.done[dkey(idx,i)]; } return false; }
/* Un mot n'entre qu'UNE fois dans le vivier (journal : revision.js · doublon du vivier) : sinon
   deux bonnes réponses au QCM, deux cartes identiques, S.rev partagé.
   ⚠️ On garde la première rencontrée (l'unité qui l'enseigne en premier).
   ⚠️ La comparaison passe par NFC. */
function allReviewWords(){
  const p=[], vus=new Set();
  UNITS.forEach((U,idx)=>{ if(unitUnlocked(idx)&&(_lireDone(idx)||unitValidated(idx)))(U.words||[]).forEach(w=>{
    const k=(w.w||'').normalize('NFC'); if(vus.has(k))return; vus.add(k); p.push(w);
  }); });
  return p;
}
// Un mot est « dû » s'il n'a jamais été révisé, ou si sa date de prochaine révision est atteinte.
function wordDue(w){ const r=S.rev[w.w]; return !r || r.next<=today(); }
function dueReviewWords(){
  const t=today(), all=allReviewWords();
  const vus  = all.filter(w=>S.rev[w.w] && S.rev[w.w].next<=t);          // déjà entrés en révision, leur date est atteinte
  const neufs= all.filter(w=>!S.rev[w.w]).slice(0,revIntakeLeft());      // §2.5 : au plus 7/jour, dans l'ordre du programme
  return vus.concat(neufs).sort((a,b)=>{
    const ra=S.rev[a.w]||{n:0,next:''}, rb=S.rev[b.w]||{n:0,next:''};
    return ra.next<rb.next?-1:ra.next>rb.next?1:(ra.n-rb.n);   // les plus anciens / les plus fragiles d'abord
  });
}
function reviewSessionWords(){ return dueReviewWords().slice(0,REVIEW_CAP); }
/* ═══ LA RÉVISION DE GRAMMAIRE — un hub, une session panachée ═══
   Modèle du vocabulaire : un bouton, la liste des notions ; pas de boîtes par unité. Aucun
   exercice neuf : l'unité 8 par U8.disque(k), l'unité 9 par son bilan (écrans autonomes).
   Seule exception : l'écriture passe par {type:'assemble'} (le clavier), l'écran ecrire de
   l'unité 8 ayant encore l'ancienne grille (journal : revision.js · révision de grammaire). */
const GRAM_CAP=15;                 /* la taille d'une session, comme REVIEW_CAP au vocabulaire */
let GRAMSES=null;                  /* les fautes de LA session en cours, par notion */

/* Une notion n'apparaît que si son unité est ouverte ET qu'elle fournit des écrans : vide
   (module non chargé), elle promettrait un écran blanc. */
const NOTIONS_GRAM=[
  { u:7, titre:'L\u2019article <span class="ar">الـ</span>',
    sous:'Défini ou indéfini \u00b7 lettres solaires et lunaires', ecrans:gramEcransU8 },
  /* même intitulé que sur l'accueil (UNITS[8].court) */
  { u:8, titre:'Les harf <span class="ar">بِ \u00b7 عَلَى \u00b7 لِ</span>',
    sous:'Le harf change la fin du nom', ecrans:gramEcransU9 },
];
function notionsGram(){ return NOTIONS_GRAM.filter(function(N){ return unitUnlocked(N.u); }); }

/* L'unité 8 : U8.disque(k) rend des st prêts pour le lecteur ; dessine() relit st.d. */
function gramEcransU8(){
  var qs=[];
  try{
    /* D7 : questions de règle et tri ☀️/🌙 · D9 (bilan) : article, oreille, œil, الـ de la Fātiḥa */
    U8.disque('D7').forEach(function(st){
      if(st.u8.t==='quiz'||st.u8.t==='trigen')qs.push(st); });
    U8.disque('D9').forEach(function(st){
      if(['article','deuxsons','deuxecrits','spotmot'].indexOf(st.u8.t)>=0)qs.push(st); });
  }catch(e){ return []; }            /* module non chargé : la notion ne s'affiche pas */
  /* L'écriture au clavier : deux mots seulement, sinon la session devient une séance d'écriture. */
  var m=U8.mots||{};
  ['habl','nahl'].forEach(function(k){
    if(m[k])qs.push({type:'assemble', w:{w:m[k].def, fr:m[k].le}, fromFr:true, graded:true});
  });
  return qs;
}
/* L'unité 9 : son BILAN, dont les écrans sont autonomes (ceux des disques se lisent en séquence). */
function gramEcransU9(){
  if(!(window.__alaqU9&&typeof window.__alaqU9.disque9==='function'))return [];
  try{
    /* On retire le champ bilan (la bannière de fin d'unité), par un clone, jamais en place
       (journal : revision.js · bannière du bilan U9). */
    return window.__alaqU9.disque9().map(function(st){
      if(!st.bilan)return st;
      var c=Object.assign({},st); delete c.bilan; return c;
    });
  }catch(e){ return []; }
}

/* ⚠️ On clone : les objets des disques peuvent être partagés avec la leçon, un graded posé
   chez eux suivrait l'élève jusque dans son disque. */
function gramMarquer(st,u){ return Object.assign({},st,{graded:true, revGram:u}); }

/* Le panachage : à tour de rôle dans chaque notion, pour obliger à reconnaître la règle. */
function gramPanacher(paquets,cap){
  var out=[], i=0, encore=true;
  while(out.length<cap&&encore){
    encore=false;
    for(var p=0;p<paquets.length&&out.length<cap;p++){
      if(i<paquets[p].length){ out.push(paquets[p][i]); encore=true; }
    }
    i++;
  }
  return out;
}
/* Le taux de maîtrise d'une notion. Sans session jouée : -1, et le hub le dit (pas un 0 %). */
function gramMaitrise(u){
  var g=S.revGram&&S.revGram[u];
  if(!g||!g.n)return -1;
  return Math.max(0,Math.min(1,(g.n-g.ko)/g.n));
}
/* La file d'une session : les notions demandées, panachées, plafonnées. */
function gramFile(unites){
  var paquets=notionsGram()
    .filter(function(N){ return !unites||unites.indexOf(N.u)>=0; })
    .map(function(N){ return shuffle(N.ecrans()).map(function(st){ return gramMarquer(st,N.u); }); })
    .filter(function(p){ return p.length; });
  return gramPanacher(paquets,GRAM_CAP);
}
function startGrammarReview(){ lancerGrammaire(null); }
function startGrammarTargeted(u){ lancerGrammaire([u]); }
function lancerGrammaire(unites){
  var qs=gramFile(unites);
  if(!qs.length){ toast('La grammaire se charge — réessaie dans un instant'); return; }
  GRAMSES={};
  QCTX=null;               /* sinon un « ▶ Verset suivant » fantôme s'invite à la fin */
  launchQuranReview(qs);   /* le lanceur générique de session : il sert déjà les lettres */
}
/* La maîtrise se mesure sur les ERREURS, seul signal commun à tous les écrans ; les écrans
   joués se lisent dans la file à la fin. */
function gramFaute(){
  if(!GRAMSES)return;
  var st=QUEUE[qi];
  if(!st||st.revGram===undefined)return;
  GRAMSES[st.revGram]=(GRAMSES[st.revGram]||0)+1;
}

function startReview(){
  if(!lecteurPret())return;   // le lecteur est un module : sans lui, #player serait un voile vide (voir lecteurPret)
  const pool=allReviewWords();
  if(!pool.length){ toast('Termine d\u2019abord la leçon « Lire des mots » pour débloquer la révision'); return; }
  const due=reviewSessionWords();
  // session = les mots dus ; s'il n'y en a aucun, entraînement libre sur des mots appris au hasard
  const libre=(due.length===0);
  const bag=shuffle(libre?shuffle(pool).slice(0,REVIEW_CAP):due);
  if(!bag.length)return;
  REVFREE=libre;   // §3.5 : en libre, aucun palier n'est écrit (sinon des mots neufs entreraient hors quota, et un mot au palier 5 pourrait redescendre)
  REVSES={};   // §2.3 : VIDE. Une clé n'apparaît que si un écran noté touche le mot — un mot jamais vu ne bouge pas de palier.
  // §3.1 — la session s'adapte au PALIER de chaque mot : on ne fait pas écrire un mot qu'on
  // vient de découvrir. 1-2 « je le reconnais » · 3 « je sais le retrouver » · ≥4 « je sais le produire ».
  const qs=[];
  // 1) échauffement — association NON notée : elle réveille la mémoire, elle ne juge pas (§2.2)
  if(bag.length>=2)qs.push({type:'match', graded:false, pairs:bag.map(w=>({ar:w.w,fr:w.fr,w:w.w}))});
  // 2) vrai ou faux 45 s — UN écran qui couvre tous les mots, et c'est lui qui note la reconnaissance
  qs.push({type:'vf', graded:true, weight:bag.length, words:bag.slice(), pool:pool, secs:45});
  // 3) QCM — palier 3 seulement : le pont entre reconnaître et produire
  shuffle(bag.slice()).filter(w=>revPalier(w)===3).forEach(w=>qs.push(mcq({prompt:'Que veut dire ce mot ?',glyph:w.w,glyphLinear:true,audio:w.w,graded:true,flip:true,answer:w.fr,revWord:w.w,options:frOptions(pool,w)})));
  // 4) écriture — palier ≥ 4 seulement : elle GRAVE un mot déjà solide, elle ne sert pas à le découvrir
  shuffle(bag.slice()).filter(w=>revPalier(w)>=REV_ECRIT_DES).forEach(w=>qs.push({type:'assemble', w, graded:true, fromFr:true, revWord:w.w}));
  QUEUE=qs; // on attaque directement l'exercice (règle Myriam : pas d'écran d'annonce)
  /* ⚠️ startReview ne passe pas par launchQuranReview : il pose le type lui-même, sinon la
     révision de vocabulaire hériterait du type de la session précédente. */
  try{ SYNC.poseKind('vocab'); }catch(_){}
  QCTX=null; // sinon un « ▶ Verset suivant » fantôme, hérité d'un exercice mono-verset, s'invite en fin de vocabulaire
  REVIEW=true;EXAM=false;backTo='reviser';curU=lastUnlockedIndex();curD=-1;qi=0;wrongCount=0;MISSED=[];inRetry=false;
  document.getElementById('player').classList.add('on');
  document.getElementById('finish').classList.remove('on');
  document.getElementById('p-hearts').textContent=S.hearts;
  document.getElementById('st-hearts').textContent=S.hearts;
  // le vrai/faux est UN écran mais couvre tous les mots : il pèse son sac, sinon une seule
  // erreur ferait tomber le score de fin de session à 0 %.
  total=QUEUE.reduce(function(t,s){return t+(s.graded?(s.weight||1):0);},0);
  renderStep();
}
/* ----- association de mots (paires) ----- */
function derangedOrder(base){ // renvoie une permutation de base sans aucun élément à sa place
  const n=base.length; if(n<2)return base.slice();
  for(let t=0;t<60;t++){ const p=shuffle(base.slice()); if(p.every((v,i)=>v!==base[i]))return p; }
  return base.slice(1).concat(base.slice(0,1)); // repli : rotation (aucun point fixe)
}
function renderMatch(){
  const M=window._mt, box=document.getElementById('matchBox'); if(!box)return;
  let h='';
  if(M.done.length){
    h+='<div class="m-done">'+M.done.map(pi=>
      '<div class="m-row"><span class="m-ar">'+M.pairs[pi].ar+'</span><span class="m-link">✓</span><span class="m-fr">'+M.pairs[pi].fr+'</span></div>').join('')+'</div>';
  }
  if(M.leftPool.length){
    h+='<div class="m-cols"><div class="m-col">'+
      M.leftPool.map(pi=>'<button class="m-cell m-arc'+(M.sel&&M.sel.side==='L'&&M.sel.pi===pi?' sel':'')+'" onclick="matchTap(\'L\','+pi+',this)">'+M.pairs[pi].ar+'</button>').join('')+
      '</div><div class="m-col">'+
      M.rightPool.map(pi=>'<button class="m-cell'+(M.sel&&M.sel.side==='R'&&M.sel.pi===pi?' sel':'')+'" onclick="matchTap(\'R\','+pi+',this)">'+M.pairs[pi].fr+'</button>').join('')+
      '</div></div>';
  }
  box.innerHTML=h;
}
function matchTap(side,pi,el){
  const M=window._mt; if(!M)return;
  if(side==='L'&&M.pairs[pi]&&M.pairs[pi].ar)speak(M.pairs[pi].ar); // le mot arabe se prononce au toucher (demande Myriam)
  if(M.sel===null){ M.sel={side,pi}; renderMatch(); return; }
  if(M.sel.side===side){ M.sel=(M.sel.pi===pi)?null:{side,pi}; renderMatch(); return; }
  if(M.sel.pi===pi){           // bonne association (même paire des deux côtés)
    M.done.push(pi);
    M.leftPool=M.leftPool.filter(x=>x!==pi);
    M.rightPool=M.rightPool.filter(x=>x!==pi);
    M.sel=null; renderMatch();
    if(M.leftPool.length===0)ctaOn();
  } else {                     // mauvaise association : flash rouge bref
    const selBtn=document.querySelector('.m-cell.sel'); if(selBtn)selBtn.classList.add('bad');
    if(el)el.classList.add('bad');
    // §2.2 : PLUS AUCUNE sanction cachée ici. L'association est un échauffement (graded:false) :
    // elle réveille la mémoire, elle ne note pas. Le flash rouge suffit comme retour.
    M.sel=null;
    setTimeout(renderMatch,420);
  }
}
/* ═══ §3.2 · VRAI OU FAUX, 45 SECONDES ═══
   Un écran, deux couches : JEU (score, record : tous les tours) · MÉMOIRE (paliers : seuls les
   VF_TOURS premiers tours de chaque mot) (journal : revision.js · vrai ou faux). */
const VF_SECS=45, VF_TOURS=2;   // chaque mot est jugé sur exactement 2 tours : le vrai + un leurre
let VFT=null;
function vfStop(){ if(VFT){clearInterval(VFT);VFT=null;} }
function vfRounds(st){
  const r=[];
  st.words.forEach(function(w){
    r.push({w:w,fr:w.fr,vrai:true});
    const autres=shuffle(st.pool.filter(function(x){return x.fr!==w.fr;})); // frOptions filtre déjà les synonymes
    r.push({w:w,fr:(autres[0]||w).fr,vrai:false});
  });
  return shuffle(r);
}
function vfStart(st){
  window._vf={st:st,rounds:vfRounds(st),ri:0,good:0,vus:{},rates:{},left:(st.secs||VF_SECS),locked:false};
  vfDraw();
  vfStop();
  VFT=setInterval(function(){
    const V=window._vf; if(!V)return vfStop();
    V.left-=0.25;
    if(V.left<=0){ vfStop(); vfEnd(); } else vfTick();
  },250);
}
function vfTick(){
  const V=window._vf, b=document.getElementById('vfBar'); if(!V||!b)return;
  const tot=V.st.secs||VF_SECS, bas=(V.left<=10);   // les 10 dernières secondes passent en corail
  b.firstChild.style.width=Math.max(0,V.left/tot*100)+'%';
  b.className='cbar'+(bas?' low':'');
  const hd=document.getElementById('vfHd'); if(hd)hd.className='vf-hd'+(bas?' low':'');
  const s=document.getElementById('vfSecs'); if(s)s.innerHTML=Math.ceil(V.left)+'<small>s</small>';
}
function vfMarkRecord(){
  const V=window._vf; if(!V||V.good<=(S.vfBest||0))return;
  const s=document.getElementById('vfScore'), r=document.getElementById('vfRec');
  if(s)s.classList.add('rec'); if(r)r.classList.add('on');
}
function vfDraw(){
  const V=window._vf; if(!V)return;
  if(V.ri>=V.rounds.length)V.rounds=V.rounds.concat(vfRounds(V.st));  // il reste du temps : on recycle
  const r=V.rounds[V.ri];
  document.getElementById('p-body').innerHTML=
    '<div class="vf-hd" id="vfHd"><span class="secs" id="vfSecs">'+Math.ceil(V.left)+'<small>s</small></span>'+
      '<span class="score" id="vfScore">✓ '+V.good+'</span></div>'+
    '<div class="cbar" id="vfBar"><i></i></div>'+
    '<div class="recflash" id="vfRec">RECORD BATTU</div>'+
    '<div class="vf-mid"><div class="vfbare" id="vfCard">'+
      '<div class="ar">'+r.w.w+'</div><div class="fr">'+r.fr+'</div></div></div>'+
    '<div class="vf-btns"><button class="vfb non" onclick="vfRep(0)">✗ NON</button>'+
      '<button class="vfb oui" onclick="vfRep(1)">✓ OUI</button></div>';
  vfTick(); vfMarkRecord();
  speak(r.w.w);   // le mot se prononce à l'affichage ; le tour suivant coupe le précédent (stopAudio)
}
function vfRep(oui){
  const V=window._vf; if(!V||V.locked)return; V.locked=true;
  const r=V.rounds[V.ri], juste=(!!oui===r.vrai), k=r.w.w;
  if(juste)V.good++;
  // couche MÉMOIRE : au-delà de VF_TOURS, le tour est joué mais n'écrit rien
  if((V.vus[k]||0)<VF_TOURS){
    V.vus[k]=(V.vus[k]||0)+1;
    if(REVSES&&REVSES[k]===undefined)REVSES[k]=true;
    if(!juste){ if(REVSES)REVSES[k]=false; V.rates[k]=1; }
  }
  const c=document.getElementById('vfCard'); if(c)c.classList.add(juste?'ok':'ko');
  const s=document.getElementById('vfScore'); if(s)s.textContent='✓ '+V.good;
  vfMarkRecord();
  setTimeout(function(){                       // 150 ms de retour visuel, puis on enchaîne SANS confirmation
    const W=window._vf; if(!W)return;
    W.ri++; W.locked=false; if(W.left>0)vfDraw();
  },150);
}
function vfEnd(){
  const V=window._vf; if(!V)return;
  vfStop(); stopAudio();
  const st=V.st, rates=Object.keys(V.rates);
  wrongCount+=rates.length;    // le score de fin de session compte les MOTS ratés, pas les tours
  // §3.3 — chaque mot raté pousse UN item de rattrapage, et c'est un QCM : rejouer le même
  // vrai/faux juste après le retour visuel ferait mémoriser l'écran, pas le mot ; et une
  // reprise binaire se réussit une fois sur deux au hasard.
  rates.forEach(function(k){
    if(revMissedHas(k))return;                 // dédoublonnage : un mot raté deux fois = un seul item
    const w=st.words.filter(function(x){return x.w===k;})[0]; if(!w)return;
    MISSED.push(mcq({prompt:'Que veut dire ce mot ?',glyph:w.w,glyphLinear:true,audio:w.w,graded:true,
                     flip:true,answer:w.fr,revWord:w.w,options:frOptions(st.pool,w)}));
  });
  const record=(V.good>(S.vfBest||0));
  V.ancienBest=S.vfBest||0;
  if(record){ S.vfBest=V.good; save(); }
  document.getElementById('player').classList.remove('vfmode');   // on rend le pied de page
  // le taux de réussite du JEU : les tours joués, pas les paliers de mémoire
  const tours=V.ri||1, pct=Math.round(V.good/Math.max(1,tours)*100);
  /* Les félicitations ne viennent qu'à la fin de la session (finishReview), après les mots
     à revoir. ⛔ Le jeu ne crédite pas de graines : finishReview seul verse, lui seul connaît
     toutes les fautes (journal : revision.js · félicitations et double versement). */
  window._vfGraines=0;
  window._vfRecord=record; window._vfAncien=V.ancienBest||0;
  window._vfPct=pct;
  window._vf=null;
  /* ⚠️ advance(), SURTOUT PAS finishDisque : le QCM et l'écriture viennent après le vrai/faux.
     C'est renderStep qui finit quand la file est vide. */
  advance();
}
function revMissedHas(w){ for(var i=0;i<MISSED.length;i++)if(MISSED[i].revWord===w)return true; return false; }

/* ═══ §3.4 · LE STYLO ✏️ — entraînement libre ═══
   Aucun palier, aucun cœur, rien dans REVSES. Tuile fausse REFUSÉE (jamais de graphie fausse
   affichée) ; au 2e raté sur la même lettre, la bonne respire en doré (journal : revision.js · le stylo). */
let WPEN=null;
function openWrite(ar){
  const w=allReviewWords().filter(function(x){return x.w===ar;})[0]; if(!w)return;
  const cible=splitUnits(w.w);
  // Leurres : UNIQUEMENT des lettres des unités DÉJÀ ENSEIGNÉES (règle absolue)
  const connues=[];
  knownLetterSet().forEach(function(L){ if(L!=='ء'&&cible.indexOf(L)<0)connues.push(L); });
  const leurres=shuffle(connues).slice(0,3);
  WPEN={w:w,cible:cible,tiles:shuffle(cible.concat(leurres)),ch:[],used:{},rate:0,fini:false};
  var m=document.getElementById('penModal');
  if(!m){m=document.createElement('div');m.className='finish';m.id='penModal';document.body.appendChild(m);}
  drawWrite(); m.classList.add('on');
}
function drawWrite(){
  const W=WPEN, m=document.getElementById('penModal'); if(!W||!m)return;
  const reste=W.cible.length-W.ch.length;
  m.innerHTML='<div class="pen-box">'+
    '<button class="pen-x" onclick="closeWrite()" aria-label="Fermer">✕</button>'+
    '<div class="pen-fr">'+W.w.fr+'</div>'+
    '<div class="pen-zone'+(W.fini?' ok':'')+'" id="penZone">'+W.ch.join('')+
      '<span class="ph">'+'·'.repeat(reste)+'</span></div>'+
    (W.fini?'':'<div class="pen-tiles">'+W.tiles.map(function(t,i){
      return '<button class="pen-t'+(isHarakat(t)?' htile':'')+'" id="pt'+i+'"'+(W.used[i]?' disabled':'')+
        ' onclick="penTap('+i+')">'+tileLabel(t)+'</button>';}).join('')+
      '<button class="pen-t tdel" onclick="penUndo()" aria-label="Effacer">⌫</button></div>')+
    '<div class="pen-btns">'+(W.fini
      ?'<button onclick="openWrite(WPEN.w.w)">Recommencer</button><button class="prim" onclick="closeWrite()">Fermer</button>'
      :'<button onclick="closeWrite()">Fermer</button>')+'</div></div>';
  if(!W.fini&&W.rate>=2)penHint();
  if(W.fini)speak(W.w.w);
}
function penTap(i){
  const W=WPEN; if(!W||W.fini||W.used[i])return;
  if(W.tiles[i]!==W.cible[W.ch.length]){        // ✗ mauvaise lettre : REFUSÉE, rien ne s'inscrit
    W.rate++;
    const t=document.getElementById('pt'+i), z=document.getElementById('penZone');
    if(t)t.classList.add('shake'); if(z)z.classList.add('ko');
    setTimeout(function(){ if(t)t.classList.remove('shake'); if(z)z.classList.remove('ko'); },380);
    if(W.rate>=2)penHint();
    return;
  }
  W.used[i]=1; W.ch.push(W.tiles[i]); W.rate=0;  // ✓ bonne lettre : on avance, le compteur repart
  W.fini=(W.ch.length===W.cible.length);
  drawWrite();
}
function penHint(){                              // la bonne tuile respire en doré
  const W=WPEN; if(!W)return;
  const attendu=W.cible[W.ch.length];
  for(var i=0;i<W.tiles.length;i++){
    if(!W.used[i]&&W.tiles[i]===attendu){ const t=document.getElementById('pt'+i); if(t)t.classList.add('hint'); return; }
  }
}
function penUndo(){
  const W=WPEN; if(!W||W.fini||!W.ch.length)return;
  W.ch.pop(); W.rate=0;
  const k=Object.keys(W.used).filter(function(i){return W.tiles[i]===W.cible[W.ch.length];}).pop();
  if(k!==undefined)delete W.used[k];
  drawWrite();
}
function closeWrite(){ var m=document.getElementById('penModal'); if(m)m.classList.remove('on'); WPEN=null; }

/* ===== HUB « RÉVISER » : Qorān · vocabulaire · grammaire ===== */
let curSourate=0;
let curReviserTab='quran';
let accQ={ill:false,ordre:false,ecrire:false,reciter:false,noms:false}; // rétractés par défaut (choix Myriam)
function accQTog(k){
  const was=accQ[k];
  accQ={ill:false,ordre:false,ecrire:false,reciter:false,noms:false};
  accQ[k]=!was; // une seule section ouverte à la fois
  renderReviser('quran');
}
/* ===== LES NOMS D'ALLAH =====
   Une ligne = un nom ; la leçon est une file de composants génériques. Ajouter un nom : une
   ligne + son mp3. La table Supabase noms_allah remplace cette graine (CONTENU). */
const NOMS_ALLAH=[
 {ar:'الرَّحْمَٰنُ',fr:'le Tout-Miséricordieux',snd:'nom-arrahman'},
 {ar:'الرَّحِيمُ',fr:'le Très-Miséricordieux',snd:'nom-arrahim'},
 {ar:'الْمَلِكُ',fr:'le Roi',snd:'nom-almalik'},
 {ar:'السَّلَامُ',fr:'la Paix',snd:'nom-assalam'},
 {ar:'الْمُؤْمِنُ',fr:'le Rassurant',snd:'nom-almumin'},
 {ar:'الْعَلِيمُ',fr:'l’Omniscient',snd:'nom-alalim'},
];
NOMS_ALLAH.forEach(n=>{inscrireLeSon(n.ar,n.snd);}); // jouer(nom) trouve son mp3 dédié partout
/* ---- Le contenu adopté depuis Supabase : cette table n'est que la graine ----
   Pour chaque table : un cache localStorage + une adoption qui mute les constantes EN PLACE
   (mêmes références). Absente ou hors ligne : la graine ou le dernier cache fait foi. */
function _adopteNoms(rows){
  if(!rows||!rows.length)return;
  NOMS_ALLAH.length=0;
  rows.forEach(function(n){NOMS_ALLAH.push(n);inscrireLeSon(n.ar,n.snd);});
}
function _adopteVersets(rows){ // Al-Fātiḥa : FATIHA muté en place — SOURATES[0].verses EST FATIHA
  if(!rows||!rows.length)return;
  const f=rows.filter(function(r){return r.sourate_no===1;}).sort(function(a,b){return a.num-b.num;});
  if(!f.length)return;
  FATIHA.length=0; f.forEach(function(r){FATIHA.push(r.ar);});
  const S0=SOURATES[0]; S0.tr.length=0; f.forEach(function(r){S0.tr.push(r.tr||[]);});
}
const CONTENU=[
  {table:'noms_allah',  cols:'ar,fr,snd',                                   ordre:'ordre', adopte:_adopteNoms},
  /* ⛔ vocabulaire n'est plus adoptée : les mots 1-7 vivent dans src/content/units/
     (journal : revision.js · vocabulaire plus adopté). */
  {table:'versets',     cols:'sourate_no,num,ar,tr',                        ordre:'num',   adopte:_adopteVersets},
];
CONTENU.forEach(function(c){ // 1) hors-ligne d'abord : le dernier contenu connu
  try{const x=JSON.parse(localStorage.getItem('alaq_contenu_'+c.table)||'null');c.adopte(x);}catch(e){}
});
async function contentPull(){ // 2) le frais, en silence
  if(!SB)return;
  let touche=false;
  for(const c of CONTENU){
    try{
      const r=await SB.from(c.table).select(c.cols).eq('actif',true).order(c.ordre);
      if(r&&r.data&&r.data.length){
        c.adopte(r.data);
        try{localStorage.setItem('alaq_contenu_'+c.table,JSON.stringify(r.data));}catch(e){}
        touche=true;
      }
    }catch(e){} // table pas encore créée / hors-ligne : la graine suffit
  }
  if(touche){try{if((document.getElementById('view-reviser')||{}).innerHTML)renderReviser(curReviserTab);}catch(e){}}
}
contentPull();
const NASEL=new Set(); // les 3 noms choisis pour la leçon
function nomTog(ar){
  if(NASEL.has(ar))NASEL.delete(ar);
  else if(NASEL.size<3)NASEL.add(ar);
  majPopNoms();   // le choix vit dans la popup : ne repeindre que sa liste
}
function startNoms(){
  if(NASEL.size!==3){toast('Choisis 3 noms à apprendre');return;}
  const T=NOMS_ALLAH.filter(n=>NASEL.has(n.ar));
  const qs=[];
  // La leçon en 3 temps (Montessori) : nommer ①-②, reconnaître ③-⑧, restituer ⑨-⑪ (+ bilan = 12ᵉ écran)
  qs.push({type:'lumnoms',noms:T});
  qs.push({type:'match',graded:true,pairs:T.map(n=>({ar:n.ar,fr:n.fr}))});
  T.forEach(n=>qs.push(mcq({prompt:'Que veut dire ce nom ?',audio:n.ar,graded:true,flip:true,answer:n.fr,
    options:shuffle(T.map(m=>({txt:m.fr,key:m.fr})))})));
  T.forEach(n=>qs.push(mcq({prompt:'« '+n.fr+' » — quel est ce nom ?',graded:true,flip:true,answer:n.ar,
    options:shuffle(T.map(m=>({ar:m.ar,key:m.ar})))})));
  T.forEach(n=>qs.push({type:'assemble',graded:true,fromFr:true,w:{w:n.ar,fr:n.fr,e:'✨'}}));
  launchQuranReview(qs);
}
function lumTap(k){
  document.querySelectorAll('.lum').forEach((el,i)=>el.classList.toggle('on',i===k)); // un seul nom illuminé
  const n=window._lum&&window._lum[k]; if(n)speak(n.ar);                              // seul son son joue
}
let QCTX=null; // exercice mono-verset en cours : {kind:'ordre'|'ecrire'|'reciter', vi}
function glossOf(SR,vi,k){ return (SR.tr&&SR.tr[vi]&&SR.tr[vi][k])?SR.tr[vi][k]:''; }
function writableWordsOf(vi){
  const set=knownLetterSet(), SR=SOURATES[curSourate]||SOURATES[0];
  const seen=new Set(), out=[];
  SR.verses[vi].split(' ').forEach(function(w,k){
    if(wordReadable(w,set)&&!seen.has(w)){seen.add(w);
      const g=glossOf(SR,vi,k);
      out.push({w:w,fr:(g?'« '+g+' » — ':'')+SR.nom+', verset '+(vi+1),e:'🕋'});}
  });
  return out;
}
function verseFullyReadable(vi){
  const set=knownLetterSet(), SR=SOURATES[curSourate]||SOURATES[0];
  return SR.verses[vi].split(' ').every(function(w){return wordReadable(w,set);});
}
function verseWordsInOrder(vi){ // TOUS les mots du verset, dans l'ordre (doublons inclus)
  const SR=SOURATES[curSourate]||SOURATES[0];
  const ws=SR.verses[vi].split(' ');
  return ws.map(function(w,k){
    const g=glossOf(SR,vi,k);
    return {w:w,fr:(g?'« '+g+' » — ':'')+'mot '+(k+1)+'/'+ws.length+' · verset '+(vi+1),e:'🕋'};
  });
}
function startQuranOrderV(vi){ const st=buildVerseTiles(vi); if(!st)return;
  QCTX={kind:'ordre',vi:vi}; launchQuranReview([st]); }
function startQuranWriteV(vi){
  QCTX={kind:'ecrire',vi:vi};
  if(verseFullyReadable(vi)){ // ✨ le verset en entier : UN SEUL écran, il se construit sur place
    launchQuranReview([{type:'vwrite',vi:vi,graded:true}]);
    return;
  }
  const ws=writableWordsOf(vi); if(!ws.length)return;
  launchQuranReview(ws.map(function(w){return {type:'assemble',w:w,graded:true};}));
}
function startSourateWrite(){ // 🏆 la sourate entière : un écran par verset
  QCTX=null;
  const SR=SOURATES[curSourate]||SOURATES[0];
  const steps=SR.verses.map(function(v,vi){return {type:'vwrite',vi:vi,graded:true};});
  launchQuranReview(steps);
}
function startQuranReciteV(vi){ QCTX={kind:'reciter',vi:vi}; launchQuranReview([{type:'recite',vi:vi}]); }
function startSourateOrder(){ QCTX=null; launchQuranReview([{type:'stiles',graded:true}]); }
function learnedLettersList(){ // lettres des unités dont « Mémoriser » est terminé
  const out=[];
  UNITS.forEach(function(U,i){
    if(!U.alpha)return;
    if(S.done[dkey(i,1)]||unitValidated(i))U.letters.forEach(function(L){out.push({L:L,u:i,n:U.alpha[L].n});});
  });
  return out;
}
function formsOf(L,u){ // formes disponibles d'une lettre : isolée puis début/milieu/fin
  const out=[{type:'trace',L:L,u:u}];
  const sp=UNITS[u].strokesPos&&UNITS[u].strokesPos[L];
  if(sp)[1,2,3].forEach(function(p){ if(sp[p])out.push({type:'trace',L:L,u:u,pos:p}); });
  return out;
}
function startLettersReview(oneL,oneU){
  QCTX=null;
  let steps;
  if(oneL){ steps=formsOf(oneL,oneU); } // la lettre sous TOUTES ses formes
  else{
    const ls=shuffle(learnedLettersList());
    if(!ls.length){toast('Termine d\u2019abord « Mémoriser » de l\u2019unité 1');return;}
    steps=ls.map(function(x){return {type:'trace',L:x.L,u:x.u};});
  }
  launchQuranReview(steps);
}
function startFormsReview(){ // 🎭 toutes les formes liées, mélangées
  QCTX=null;
  const steps=[];
  learnedLettersList().forEach(function(x){
    const sp=UNITS[x.u].strokesPos&&UNITS[x.u].strokesPos[x.L];
    if(sp)[1,2,3].forEach(function(p){ if(sp[p])steps.push({type:'trace',L:x.L,u:x.u,pos:p}); });
  });
  if(!steps.length){toast('Termine d\u2019abord « Mémoriser » de l\u2019unité 1');return;}
  launchQuranReview(shuffle(steps));
}
function qNextVi(){
  if(!QCTX)return -1;
  const SR=SOURATES[curSourate]||SOURATES[0];
  for(let v=QCTX.vi+1;v<SR.verses.length;v++){
    if(QCTX.kind==='reciter')return v;
    if(QCTX.kind==='ordre'&&buildVerseTiles(v))return v;
    if(QCTX.kind==='ecrire'&&writableWordsOf(v).length)return v;
  }
  return -1;
}
function qNext(){
  const c=QCTX, v=qNextVi(); if(!c||v<0)return;
  mascotteStop(); // la danse ne doit pas continuer sur l'écran caché
  document.getElementById('finish').classList.remove('on');
  if(c.kind==='ordre')startQuranOrderV(v);
  else if(c.kind==='ecrire')startQuranWriteV(v);
  else startQuranReciteV(v);
}
/* ═══ LES 5 BOÎTES DE « RÉVISER › LE QORĀN » ═══
   Chaque boîte ouvre une popup (gabarit .disc-tip) ; COMMENCER lance le lecteur, comme discTip.
   Découpage (journal : revision.js · les cinq boîtes) :
   ① Construire et Réciter, EN VERSETS : une partie jusqu'à 10, puis ceil(n/10) parties égales ;
   ② Réécrire, EN FRAPPES (splitUnits compte chaque caractère) : nombre de parties = total / 70,
      répartition qui minimise la somme des carrés des tailles. Jamais un verset coupé en deux. */
function nbParties(n){ return Math.max(1,Math.ceil(n/10)); }
function partiesParVersets(n){
  const p=nbParties(n), base=Math.floor(n/p), reste=n%p, out=[]; let de=0;
  for(let k=0;k<p;k++){ const t=base+(k<reste?1:0); out.push({de:de,a:de+t}); de+=t; }
  return out;
}
function frappesDuVerset(v){ return v.split(' ').reduce((a,m)=>a+[...m].length,0); }
function partiesParFrappes(versets,budget){
  const f=versets.map(frappesDuVerset), n=f.length, tot=f.reduce((a,b)=>a+b,0);
  const k=Math.max(1,Math.min(n,Math.ceil(tot/budget)));
  const cum=[0]; f.forEach((x,i)=>cum.push(cum[i]+x));
  const somme=(i,j)=>cum[j]-cum[i], INF=Infinity;
  const best=Array.from({length:n+1},()=>new Array(k+1).fill(INF));
  const coupe=Array.from({length:n+1},()=>new Array(k+1).fill(-1));
  best[0][0]=0;
  for(let q=1;q<=k;q++)for(let j=q;j<=n;j++)for(let i=q-1;i<j;i++){
    if(best[i][q-1]===INF)continue;
    const c=best[i][q-1]+Math.pow(somme(i,j),2);
    if(c<best[j][q]){ best[j][q]=c; coupe[j][q]=i; }
  }
  const out=[]; let j=n;
  for(let q=k;q>=1;q--){ const i=coupe[j][q]; out.unshift({de:i,a:j,n:somme(i,j)}); j=i; }
  return out;
}

/* Les 5 boîtes : icône, libellé court, titre de la popup, verbe du bouton, découpage ('vers'/'frap'/null). */
const BOITES=[
 {k:'lire', ic:'tab2-lire',  lab:'Lire',      t:'Lire la sourate',      go:'LIRE',       parts:null},
 {k:'ord',  ic:'tab-puzzle', lab:'Construire',t:'Construire la sourate',go:'COMMENCER', parts:'vers'},
 {k:'ecr',  ic:'tab2-ecrire',lab:'Réécrire',  t:'Réécrire les versets', go:'COMMENCER', parts:'frap'},
 {k:'rec',  ic:'tab-micro',  lab:'Réciter',   t:'Réciter',              go:'COMMENCER', parts:'vers'},
 {k:'noms', ic:'tab-etoiles',lab:'Les noms',  t:'Les noms d’Allah',     go:'APPRENDRE', parts:null},
];

/* ── L'INFOBULLE 3 s ─────────────────────────────────────────────────────
   Un seul jeton pour toute la rangée : sinon la première minuterie éteint la seconde bulle. */
let _tipT=null;
function tipMontre(el){
  document.querySelectorAll('.itab .tip.on').forEach(function(t){t.classList.remove('on');});
  clearTimeout(_tipT);
  const t=el&&el.querySelector('.tip'); if(!t)return;
  t.classList.add('on');
  _tipT=setTimeout(function(){t.classList.remove('on');},3000);
}
/* Armée sur un vrai changement d'onglet, jamais sur un re-rendu de fond (contentPull, qariPick…). */
function reviserTabTap(k){ renderReviser(k); tipMontre(document.querySelector('#view-reviser .itab.active')); }
function coursTabTap(k){ renderCours(k); tipMontre(document.querySelector('#view-cours .itab.active')); }

/* ── LA POPUP ─────────────────────────────────────────────────────────── */
let boiteOuverte=-1, partChoisie=0;
function boiteTap(i){
  boiteOuverte=i; partChoisie=0;
  document.querySelectorAll('.rq-boite').forEach(function(b){b.classList.remove('ouverte');});
  const bx=document.getElementById('rqBx'+i); if(bx)bx.classList.add('ouverte');
  const b=BOITES[i];
  const v=document.createElement('div'); v.className='rq-voile'; v.id='rqVoile';
  v.onclick=function(e){ if(e.target===v)fermerPop(); };
  v.innerHTML='<div class="rq-pop'+(b.k==='noms'?' rq-pop-full':'')+'">'+
    '<button class="dt-x-btn" onclick="fermerPop()" aria-label="Fermer">✕</button>'+
    '<div class="dt-t">'+b.t+'</div>'+
    (b.parts?'<div class="rq-parts" id="rqParts"></div>':'')+
    (b.k==='noms'?'<div class="rq-noms-compte" id="rqNomsCompte"></div><div class="rq-noms" id="rqPopNoms"></div>':'')+
    '<button class="dt-go" id="rqPopGo">'+b.go+'</button></div>';
  document.body.appendChild(v);
  if(b.parts)majParts(b);
  if(b.k==='noms'){ majPopNoms(); return; }   // majPopNoms pose SON PROPRE onclick sur rqPopGo
  document.getElementById('rqPopGo').onclick=function(){
    fermerPop();
    if(b.k==='lire'){ ouvrirLireSourate(); return; }
    const SR=SOURATES[curSourate]||SOURATES[0];
    const P=(b.parts==='frap')?partiesParFrappes(SR.verses,70):partiesParVersets(SR.verses.length);
    const p=P[partChoisie]||P[0];
    if(b.k==='ord')startConstruireSourate(p.de,p.a);
    else if(b.k==='ecr')startReecrireSourate(p.de,p.a);
    else if(b.k==='rec')startReciterSourate(p.de,p.a);
  };
}
function fermerPop(){
  const v=document.getElementById('rqVoile'); if(v)v.remove();
  document.querySelectorAll('.rq-boite').forEach(function(b){b.classList.remove('ouverte');});
  boiteOuverte=-1;
}
/* Le sélecteur de partie n'apparaît que s'il y a plus d'une partie. */
function majParts(b){
  const box=document.getElementById('rqParts'); if(!box)return;
  const SR=SOURATES[curSourate]||SOURATES[0];
  const P=(b.parts==='frap')?partiesParFrappes(SR.verses,70):partiesParVersets(SR.verses.length);
  if(P.length<2){ box.remove(); return; }
  box.innerHTML=P.map(function(p,k){
    return '<button class="rq-part'+(k===partChoisie?' on':'')+'" onclick="partTap('+k+')">'+
      'Partie '+(k+1)+'<small>versets '+(p.de+1)+(p.a>p.de+1?'–'+p.a:'')+'</small></button>';
  }).join('');
}
function partTap(k){ partChoisie=k; const b=BOITES[boiteOuverte]; if(b)majParts(b); }
/* Le choix des 3 noms d'Allah, dans la popup. ⚠️ Ne repeint que sa propre liste. */
function majPopNoms(){
  const box=document.getElementById('rqPopNoms'); if(!box)return;
  const set=knownLetterSet();
  const lisibles=NOMS_ALLAH.filter(function(n){return wordReadable(n.ar,set);});
  const compte=document.getElementById('rqNomsCompte');
  if(compte)compte.textContent=lisibles.length+(lisibles.length>1?' noms lisibles':' nom lisible')+' avec tes lettres';
  box.innerHTML=lisibles.length
    ? lisibles.map(function(n){
        const on=NASEL.has(n.ar);
        return '<div class="rq-nom'+(on?' on':'')+'" onclick="nomTog(\''+n.ar+'\')">'+
          '<span class="ww">'+n.ar+'</span><span class="wfr">'+n.fr+'</span>'+
          '<span class="ck">'+(on?'✓':'')+'</span></div>';
      }).join('')
    : '<p style="color:#fff;opacity:.85;font-family:var(--ui);font-size:12.5px;text-align:center;margin:8px 0">Apprends encore quelques lettres pour lire les premiers noms 🌱</p>';
  const go=document.getElementById('rqPopGo');
  if(go){
    go.disabled=(NASEL.size!==3);
    go.textContent='Apprendre ('+NASEL.size+'/3)';
    go.onclick=function(){ if(NASEL.size!==3)return; fermerPop(); startNoms(); };
  }
}

/* ── « LIRE LA SOURATE », EN PLEIN ÉCRAN ─────────────────────────────────
   Même markup .mushaf/.ayat[data-suivre]/.vw[data-w] : motTap, playVerse, lireToutQoran et
   suivreVerset le retrouvent sans connaître son conteneur. Gabarit .finish. */
function ouvrirLireSourate(){
  let m=document.getElementById('lireSourate');
  if(!m){ m=document.createElement('div'); m.className='finish'; m.id='lireSourate'; document.body.appendChild(m); }
  const SR=SOURATES[curSourate]||SOURATES[0], set=knownLetterSet();
  const mot=function(w,wi,vi){
    return '<span class="vw '+(wordReadable(w,set)?'dispo':'absent')+'" data-w="'+wi+'"'+
           ' onclick="motTap('+vi+','+wi+')">'+w+'</span>';
  };
  const versesHtml=SR.verses.map(function(v,vi){
    const tab=v.split(' ');
    return '<span class="ayat" data-suivre="'+vi+'">'+
      '<span class="tete"><button class="vspk-in" onclick="playVerse('+vi+')" aria-label="Écouter le verset '+(vi+1)+'">'+
        spkSVG()+'</button>'+mot(tab[0],0,vi)+'</span> '+
      tab.slice(1).map(function(w,j){ return mot(w,j+1,vi); }).join(' ')+
      numAyatHTML(vi)+'</span> ';
  }).join('');
  m.innerHTML='<button class="fin-x" onclick="fermerLireSourate()" aria-label="Fermer">✕</button>'+
    '<div class="lsbody">'+
      '<button class="lire-tout" id="btLireTout" onclick="lireToutQoran()">'+
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5z"/></svg>'+
        '<span id="btLireToutT">LIRE TOUT</span></button>'+
      '<div class="mushaf-sous">touche un verset ou un mot</div>'+
      '<div class="mushaf">'+versesHtml+'</div>'+
    '</div>';
  m.classList.add('on');
}
function fermerLireSourate(){ const m=document.getElementById('lireSourate'); if(m)m.classList.remove('on'); }

/* ── LES TROIS LANCEURS DE PARTIE ── deb/fin : indices de verset, fin exclue. */
function startConstruireSourate(deb,fin){
  QCTX=null;
  const qs=[];
  for(let v=deb;v<fin;v++){ const st=buildVerseTiles(v); if(st)qs.push(st); }
  if(!qs.length){toast('Apprends encore quelques lettres pour débloquer cet exercice');return;}
  launchQuranReview(qs);   // dans l'ORDRE des versets — on construit la sourate, on ne la brasse pas
}
function startReecrireSourate(deb,fin){
  QCTX=null;
  const qs=[];
  for(let v=deb;v<fin;v++){ if(verseFullyReadable(v))qs.push({type:'vwrite',vi:v,graded:true}); }
  if(!qs.length){toast('Apprends encore quelques lettres pour débloquer cet exercice');return;}
  launchQuranReview(qs);
}
function startReciterSourate(deb,fin){
  QCTX=null;
  const qs=[];
  for(let v=deb;v<fin;v++)qs.push({type:'recite',vi:v});
  launchQuranReview(qs);
}

// Générateur commun : reconstruire un verset (mots lisibles = tuiles, le reste posé en gris)
function buildVerseTiles(vi){
  const set=knownLetterSet();
  const SR=SOURATES[curSourate]||SOURATES[0];
  const words=SR.verses[vi].split(' ');
  const tpl=words.map(w=>({w,slot:wordReadable(w,set)}));
  const seq=tpl.filter(t=>t.slot).map(t=>t.w);
  if(seq.length<2)return null;
  /* Chaque tuile sait d'où vient son mot (verset, rang) : elle sonne au toucher, découpée aux repères HOROV. */
  const pool=[];
  SR.verses.forEach(function(v,i){ if(i!==vi)v.split(' ').forEach(function(w,k){
    if(wordReadable(w,set)&&seq.indexOf(w)<0&&!pool.some(function(x){return x.w===w;}))pool.push({w:w,vi:i,wi:k}); }); });
  const distract=shuffle(pool).slice(0,2);
  let _k=-1;
  const tuiles=tpl.map(function(t,k){ return t.slot?{w:t.w,vi:vi,wi:k}:null; }).filter(Boolean).concat(distract);
  return {type:'vtiles', vt:{vi:vi, tpl:tpl, seq:seq, distract:distract.map(function(x){return x.w;}),
                             tuiles:shuffle(tuiles)}, graded:true};
}
function launchQuranReview(queue){
  if(!lecteurPret())return;   // idem startReview : dix-sept départs passent ici, un seul garde
  /* Le type de session se déduit de la file intacte, ici, pour les dix-sept départs. revGram
     (posé par gramMarquer) est le seul signal certain. ⚠️ Taxonomie grossière, assumée : elle
     ne sert qu'à la garde « un lesson_id ne paie qu'une fois par jour ». */
  try{ SYNC.poseKind(
    (!queue||!queue.length) ? 'mixte'
    : queue.some(function(s){return s&&s.revGram!=null;}) ? 'gram'
    : queue.every(function(s){return s&&s.type==='trace';}) ? 'lettres'
    : queue.every(function(s){return s&&s.type==='recite';}) ? 'reciter'
    : 'qoran'); }catch(_){}
  QUEUE=queue;
  REVIEW=true;EXAM=false;backTo='reviser';curU=lastUnlockedIndex();curD=-1;qi=0;wrongCount=0;MISSED=[];inRetry=false;
  document.getElementById('player').classList.add('on');
  document.getElementById('finish').classList.remove('on');
  document.getElementById('p-hearts').textContent=S.hearts;
  document.getElementById('st-hearts').textContent=S.hearts;
  total=ecransNotes(QUEUE);
  renderStep();
}
function startQuranOrder(){
  QCTX=null;
  const SR=SOURATES[curSourate]||SOURATES[0];
  const qs=[];
  SR.verses.forEach(function(v,vi){ const st=buildVerseTiles(vi); if(st)qs.push(st); });
  if(!qs.length){toast('Apprends encore quelques lettres pour débloquer cet exercice');return;}
  launchQuranReview(shuffle(qs));
}
function startQuranWrite(){
  QCTX=null;
  const set=knownLetterSet(), SR=SOURATES[curSourate]||SOURATES[0];
  const seen=new Set(), words=[];
  SR.verses.forEach(function(v,vi){ v.split(' ').forEach(function(w,k){
    if(wordReadable(w,set)&&!seen.has(w)){seen.add(w);
      const g=glossOf(SR,vi,k);
      words.push({w:w,fr:(g?'« '+g+' » — ':'')+SR.nom+', verset '+(vi+1),e:'🕋',b:strip(w)});}
  }); });
  if(!words.length){toast('Apprends encore quelques lettres pour débloquer cet exercice');return;}
  const picks=weightedShuffle(words,x=>x.w).slice(0,6).map(w=>({type:'assemble',w:w,graded:true}));
  launchQuranReview(picks);
}
function startQuranRecite(){
  QCTX=null;
  const SR=SOURATES[curSourate]||SOURATES[0];
  const qs=SR.verses.map(function(v,vi){return {type:'recite',vi:vi};});
  launchQuranReview(qs);
}
/* — enregistrement de la récitation (marche aussi sur iPhone) — */
let _rec={mr:null,chunks:[],url:null,on:false};
function recToggle(){
  const btn=document.getElementById('recBtn'), msg=document.getElementById('recMsg');
  if(_rec.on){ try{_rec.mr.stop();}catch(e){} return; }
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!window.MediaRecorder){
    if(msg)msg.textContent='Enregistrement indisponible ici — récite à voix haute, puis valide.';
    return;
  }
  navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
    _rec.chunks=[];_rec.on=true;
    const mr=new MediaRecorder(stream);_rec.mr=mr;
    mr.ondataavailable=function(e){ if(e.data&&e.data.size)_rec.chunks.push(e.data); };
    mr.onstop=function(){
      _rec.on=false;
      stream.getTracks().forEach(function(t){t.stop();});
      try{
        if(_rec.url)URL.revokeObjectURL(_rec.url);
        _rec.url=URL.createObjectURL(new Blob(_rec.chunks,{type:mr.mimeType||'audio/mp4'}));
      }catch(e){}
      if(btn)btn.innerHTML=icoImg('tab-micro','ic-inline')+' Me réenregistrer';
      const pb=document.getElementById('recPlay'); if(pb){pb.disabled=false;pb.style.opacity=1;}
      if(msg)msg.textContent='Enregistré ! Ré-écoute-toi et compare au modèle.';
    };
    mr.start();
    if(btn)btn.textContent='⏹ Terminer';
    if(msg)msg.textContent='Enregistrement… récite le verset.';
  }).catch(function(){
    if(msg)msg.textContent='Micro refusé — récite à voix haute, puis valide.';
  });
}
function recPlay(){ if(_rec.url){ try{ stopAudio(); _curAudio=new Audio(_rec.url); _curAudio.play(); }catch(e){} } }
function recValidate(btn){ if(btn){btn.disabled=true;btn.style.opacity=.5;} okBeep('final'); ctaOn(); }

/* ----- « Appuie sur ce que tu entends » (tuiles de mots du verset) ----- */
function renderVt(){
  const box=document.getElementById('vtSlots');if(!box)return;
  const M=window._vt;
  let k=0;
  box.innerHTML=M.tpl.map(function(t){
    if(!t.slot)return '<span class="vw" style="color:var(--lock)">'+t.w+'</span>';
    const html=(M.ch[k]!==undefined)
      ?'<span class="vw" style="color:var(--gold)">'+M.ch[k]+'</span>'
      :'<span class="vw" style="color:var(--lock);opacity:.65">···</span>';
    k++;return html;
  }).join(' ');
}
/* renderVw = majVwVerse (à chaque frappe) + vwSaisie (au changement de MOT seulement) : sinon
   le clavier serait rebâti à chaque caractère. */
function renderVw(){ majVwVerse(); vwSaisie(); }
function majVwVerse(){
  const M=window._vw;if(!M)return;
  const box=document.getElementById('vwVerse');if(!box)return;
  // le verset : mots écrits en doré · mot en cours (progression + points) · mots à venir estompés
  box.innerHTML=M.words.map(function(w,i){
    if(i<M.wi)return '<span style="color:var(--gold)">'+w+'</span>';
    if(i===M.wi){
      const done=M.ch.join(''), rest='·'.repeat(Math.max(0,M.units.length-M.ch.length));
      return '<span style="border-bottom:2px solid var(--gold-d);padding-bottom:2px">'+
        '<span style="color:var(--cream)">'+done+'</span><span class="ph">'+rest+'</span></span>';
    }
    return '<span style="color:var(--lock);opacity:.45">'+w+'</span>';
  }).join(' ');
}
/* Le clavier, reconstruit UNIQUEMENT quand le mot change. */
function vwSaisie(){
  const M=window._vw;if(!M)return;
  const box=document.getElementById('vwClavier');if(!box)return;
  const K=window.__alaqClavier;
  if(K){
    if(M.claviePour!==M.wi){
      M.claviePour=M.wi; K.poserCSSClavier();
      box.innerHTML=K.clavierPourMot(M.words[M.wi],{id:'vw',commandes:true});
      K.brancherClavier(box,{taper:vwTaperCle,effacer:vwUndo,recommencer:vwResetMot,id:'vw'});
    }
    return;
  }
  /* ⚠️ REPLI si le module du clavier n'est pas chargé : l'écran reste jouable, jamais blanc.
     ⚠️ Un seul test : M.tilesFor vaut 0 au premier mot (journal : revision.js · tuiles remélangées). */
  if(M.tilesFor!==M.wi){
    M.tilesFor=M.wi;M.shuffled=shuffle(M.units.slice());
    box.innerHTML='<div class="tiles" id="vwTiles">'+M.shuffled.map(function(ch,k){
      return '<button class="tile linear-ar'+(isHarakat(ch)?' htile':'')+'" id="vwt'+k+'" onclick="vwTap('+k+')">'+tileLabel(ch)+'</button>';
    }).join('')+'<button class="tile tdel" onclick="vwUndo()" aria-label="Effacer">⌫</button></div>';
  }
}
/* La touche d'un caractère sur le clavier 'vw' — jumelle d'asmTouche, scopée sur #vwLettres/#vwHarakat. */
function vwToucheCle(ch){
  const K=window.__alaqClavier; if(!K)return null;
  const cle=K.cleDuSigne(ch);
  const sel=cle?'#vwHarakat .clv-touche':'#vwLettres .clv-touche';
  return [...document.querySelectorAll(sel)].find(t=>cle?t.dataset.signe===cle:t.dataset.l===ch)||null;
}
/* La frappe au clavier : touche fausse REFUSÉE, indice au 2e refus. ⚠️ Aucun cœur perdu :
   la session tourne sous REVIEW=true, comme vwTap et vtTap. */
function vwTaperCle(ch){
  const M=window._vw; if(!M||M.wi>=M.words.length)return;
  const acceptes=asmAttendu({t:M.units,ch:M.ch});
  const t=vwToucheCle(ch);
  if(!acceptes.includes(ch)){
    if(t){ if(t.classList.contains('miss'))return;
      t.classList.add('miss'); setTimeout(()=>t.classList.remove('miss'),400); }
    toc();
    M.refus=(M.refus||0)+1;
    if(M.refus>=2){ asmHintOff();
      const bon=acceptes.map(vwToucheCle).find(Boolean); if(bon)bon.classList.add('hint'); }
    return;
  }
  M.refus=0; asmHintOff();
  M.ch.push(ch);
  vwFiniMot();
}
/* Le mot est-il complet ? Et le verset ? (sert la voie clavier et le repli) */
function vwFiniMot(){
  const M=window._vw; if(!M)return;
  majVwVerse();
  if(M.ch.length<M.units.length)return;
  const msg=document.getElementById('vwMsg');
  okBeep();M.wi++;M.ch=[];M.refus=0;
  if(M.wi>=M.words.length){            // verset terminé
    majVwVerse();
    if(msg)msg.textContent='';
    okBeep('final');
    const a=playVerse(M.vi); if(a)a.addEventListener('ended',ctaOn,{once:true});
    const box=document.getElementById('vwClavier'); if(box)box.innerHTML='';
    setTimeout(ctaOn,9000);            // filet : CONTINUER ne reste jamais gris
  } else {
    M.units=splitUnits(M.words[M.wi]);
    if(msg)msg.textContent='';
    majVwVerse();
    vwSaisie();                        // reconstruit le clavier pour le mot suivant
  }
}
/* ↺ Recommencer au clavier : efface le mot en cours. */
function vwResetMot(){
  const M=window._vw; if(!M||!M.ch.length)return;
  M.ch.length=0; M.refus=0; asmHintOff();
  renderVw();
}
/* Écriture guidée (repli tuiles) : la tuile fausse est REFUSÉE, indice au 2e refus. */
function vwTap(k){
  const M=window._vw;if(!M||M.wi>=M.words.length)return;
  const t=document.getElementById('vwt'+k);if(!t||t.disabled)return;
  const attendu=M.units[M.ch.length];
  if(M.shuffled[k]!==attendu){
    t.classList.remove('miss');void t.offsetWidth;t.classList.add('miss');toc();
    if((M.refus=(M.refus||0)+1)>=2)M.shuffled.forEach(function(ch,j){
      const b=document.getElementById('vwt'+j);
      if(b&&!b.disabled&&ch===attendu)b.classList.add('hint'); });
    return;
  }
  M.refus=0;
  document.querySelectorAll('#vwTiles .tile.hint').forEach(x=>x.classList.remove('hint'));
  M.ch.push(M.shuffled[k]);t.disabled=true;t.dataset.used=M.ch.length;
  renderVw();
  if(M.ch.length===M.units.length){      // complet donc juste
    const msg=document.getElementById('vwMsg');
    okBeep();M.wi++;M.ch=[];M.refus=0;
    if(M.wi>=M.words.length){            // verset terminé
      renderVw();
      if(msg)msg.textContent='';
      okBeep('final');
      const a=playVerse(M.vi); if(a)a.addEventListener('ended',ctaOn,{once:true});
      document.getElementById('vwTiles').innerHTML='';
      setTimeout(ctaOn,9000);            // filet : CONTINUER ne reste jamais gris
    } else {
      M.units=splitUnits(M.words[M.wi]);
      if(msg)msg.textContent='';
      renderVw();
    }
  }
}
function vwUndo(){
  const M=window._vw;if(!M||!M.ch.length)return;
  const n=M.ch.length;M.ch.pop();M.refus=0;asmHintOff();  // efface aussi .clv-touche.hint
  [...document.querySelectorAll('#vwTiles .tile')].forEach(function(t){
    if(t.dataset.used==n){t.disabled=false;delete t.dataset.used;}
    t.classList.remove('hint');});
  renderVw();
}
function renderSt(){
  const box=document.getElementById('stSlots');if(!box)return;
  const M=window._st;const SR=SOURATES[curSourate]||SOURATES[0];
  let html='';
  for(let i=0;i<M.n;i++){
    const vi=M.ch[i];
    html+='<div class="stslot'+(vi!==undefined?' full':'')+'"><span class="no">'+(i+1)+'</span>'+
      '<span class="txt">'+(vi!==undefined?SR.verses[vi]:'')+'</span></div>';
  }
  box.innerHTML=html;
}
function stTap(k){        // même écriture guidée : un verset hors d'ordre est REFUSÉ
  const M=window._st;if(!M)return;
  if(M.ch.length>=M.n)return;
  const t=document.getElementById('stile'+k);if(!t||t.disabled)return;
  const vi=parseInt(t.dataset.vi,10);
  if(vi!==M.ch.length){
    t.classList.remove('miss');void t.offsetWidth;t.classList.add('miss');toc();
    if((M.refus=(M.refus||0)+1)>=2)[...document.querySelectorAll('.sttile')].forEach(function(b){
      if(!b.disabled&&+b.dataset.vi===M.ch.length)b.classList.add('hint'); });
    return;
  }
  M.refus=0;
  [...document.querySelectorAll('.sttile.hint')].forEach(function(b){b.classList.remove('hint');});
  M.ch.push(vi);t.disabled=true;t.dataset.used=M.ch.length;
  renderSt();
  if(M.ch.length===M.n){
    playSfx('bonne-reponse');
    const fb=document.getElementById('fb');fb.className='fb ok';fb.innerHTML=elogeHTML();
    document.getElementById('p-foot').classList.add('ok');
    const a=playVerse(0); if(a)a.addEventListener('ended',ctaOn2,{once:true});
    setTimeout(ctaOn2,9000);
  }
}
function stUndo(){
  const M=window._st;if(!M||!M.ch.length)return;
  const n=M.ch.length;M.ch.pop();M.refus=0;
  [...document.querySelectorAll('.sttile')].forEach(function(t){
    if(t.dataset.used==n){t.disabled=false;delete t.dataset.used;}
    t.classList.remove('hint');});
  renderSt();
}
/* Écriture guidée : le mot faux est REFUSÉ, rien ne s'écrit ; indice au 2e refus ; toucher un mot le fait entendre. */
function vtTap(k){
  const M=window._vt;if(!M)return;
  if(M.ch.length>=M.seq.length)return;
  const t=M.tuiles[k], el=document.getElementById('vtile'+k);
  if(!t||!el||el.disabled)return;
  if(t.vi!==undefined&&t.wi!==undefined)joueMotVerset(t.vi,t.wi);   // le mot sonne au toucher
  if(t.w!==M.seq[M.ch.length]){
    el.classList.remove('miss');void el.offsetWidth;el.classList.add('miss');toc();
    if(++M.refus>=2)M.tuiles.forEach(function(x,j){
      const b=document.getElementById('vtile'+j);
      if(b&&!b.disabled&&x.w===M.seq[M.ch.length])b.classList.add('hint'); });
    return;
  }
  M.refus=0;
  document.querySelectorAll('#vtTiles .wtile.hint').forEach(x=>x.classList.remove('hint'));
  M.ch.push(t.w);el.disabled=true;el.dataset.used=M.ch.length;
  renderVt();
  if(M.ch.length===M.seq.length)vtFini();
}
function vtFini(){        // complet donc juste : éloge, le verset se rejoue, CONTINUER à la fin du son
  const M=window._vt, foot=document.getElementById('p-foot'), fb=document.getElementById('fb');
  playSfx('bonne-reponse');
  fb.className='fb ok';fb.innerHTML=elogeHTML();
  foot.classList.remove('bad');foot.classList.add('ok');
  const a=playVerse(M.vi);
  if(a)a.addEventListener('ended',ctaOn2,{once:true});
  setTimeout(ctaOn2,9000);   // filet : CONTINUER ne reste jamais gris
}
function vtUndo(){
  const M=window._vt;if(!M||!M.ch.length)return;
  const n=M.ch.length;M.ch.pop();M.refus=0;
  [...document.querySelectorAll('#vtTiles .wtile')].forEach(t=>{
    if(t.dataset.used==n){t.disabled=false;delete t.dataset.used;}
    t.classList.remove('hint');});
  renderVt();
}
function finishReview(){
  if(REVFREE)REVSES=null;
  /* La grammaire tient ses comptes à part : écrans joués lus dans la file, fautes dans GRAMSES. */
  if(GRAMSES){
    var vus={};
    QUEUE.forEach(function(st){ if(st.revGram!==undefined)vus[st.revGram]=(vus[st.revGram]||0)+1; });
    Object.keys(vus).forEach(function(u){
      var g=S.revGram[u]||{n:0,ko:0};
      S.revGram[u]={n:g.n+vus[u], ko:g.ko+(GRAMSES[u]||0), maj:today()};
    });
    GRAMSES=null;
  }
  /* On ne paie que si la file demandait autre chose qu'écouter : recite est le seul écran passif.
     ⚠️ Pas « total > 0 » : les écrans trace ne sont pas graded, et tracer est du travail
     (journal : revision.js · paiement de la récitation). */
  var _aTravaille = QUEUE.some(function(st){ return st && st.type!=='recite'; });
  _grainesSession = _aTravaille
    ? gagnerGraines(GRAINES.lecon+(wrongCount?0:GRAINES.sansFaute))   // §3.5 : entraînement libre — cœurs, XP, série et badges oui ; paliers intacts
    : 0;
  /* On ne déclare que ce qui a été versé. Le type vient de SYNC.poseKind : sans lui, toutes les
     révisions porteraient le même lesson_id et le serveur n'en paierait qu'une par jour
     (claim_reward, garde v_deja_lecon). */
  if(_grainesSession){ try{
    SYNC.graines('REV-'+String(SYNC._kind||'mixte').toUpperCase(), !wrongCount, false);
  }catch(_){} }
  if(REVSES){ // répétition espacée : chaque mot touché par un écran noté reçoit sa prochaine date
    const t=today();
    Object.keys(REVSES).forEach(function(w){
      if(!S.rev[w]){ if(!S.revIn||S.revIn.d!==t)S.revIn={d:t,n:0}; S.revIn.n++; }   // §2.5 : ce mot consomme une place d'admission du jour
      // §2.4 : su -> palier suivant ; raté -> retour au PALIER 1 (donc revu demain, REV_INT[0]=1).
      // Aucune date forcée : elle découle du palier, comme pour une réussite.
      const n=(REVSES[w]!==false)?(((S.rev[w]&&S.rev[w].n)||0)+1):1;
      S.rev[w]={n:n, next:_addDays(t,REV_INT[Math.min(n-1,REV_INT.length-1)])};
    });
    REVSES=null;
  }
  REVIEW=false;REVFREE=false; S.xp+=10; S.nrev=(S.nrev||0)+1;
  const before=S.hearts;
  const gain=S.bigNext?3:1;               // 1re révision après blocage = +3 ; les suivantes = +1
  S.hearts=Math.min(HEARTS_MAX,S.hearts+gain);S.bigNext=0;S.heartDay=today();
  if(before<HEARTS_MAX)setTimeout(()=>toast(icoImg('tb-coeur','','height:16px;vertical-align:-3px')+' +'+gain+' '+(gain>1?'Qatarāt':'Qatra')+', ماشاء الله !'),600);
  checkBadges({review:true});
  validerJour();                                     // une révision terminée valide AUSSI le jour (règle adoucie)
  pendingStreak=feteJourPending; feteJourPending=false;
  bumpConstance('revise');
  save();
  // le vrai/faux compte en TOURS joués, pas en écrans de file : son taux à lui fait foi
  const acc=(typeof window._vfPct==='number')?window._vfPct
           :(total?Math.round((total-Math.min(total,wrongCount))/total*100):100);
  window._vfPct=null;
  document.getElementById('player').classList.remove('on');
  document.getElementById('fin-extra').innerHTML=(qNextVi()>=0)
    ?'<button class="cta" style="max-width:300px;margin-bottom:12px" onclick="qNext()">▶ Verset suivant</button>'
    :'';
  document.getElementById('fin-icon').textContent='';
  document.getElementById('fin-title').textContent='Révision terminée !';
  document.getElementById('fin-xp').textContent='+10';
  document.getElementById('fin-acc').textContent=acc+'%';
  /* _vfGraines vaut toujours 0 (le vrai/faux ne crédite plus) : c'est _grainesSession qui porte
     le montant. Expression gardée pour qu'un _vfGraines ressuscité se voie. ⛔ Ne pas déplacer le
     versement vers le jeu : seul finishReview connaît wrongCount. */
  fillFinishCases(acc,(window._vfGraines||0)||_grainesSession);
  if(window._vfRecord)document.getElementById('fin-extra').innerHTML+=
    '<div class="vf-rec">RECORD BATTU — ancien : '+(window._vfAncien||0)+'</div>';
  window._vfGraines=0; window._vfRecord=false;
  fillFinishConstance();
  document.getElementById('finish').classList.add('on');
  confettiBurst();
  playSfx('fin-lecon');   // le maqsūm — même clôture que la leçon
  mascotteDanse();        // le fanous danse dessus (partition FRAPPES_FIN)
}
