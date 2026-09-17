/* ══════════════════════════════════════════════════════════════════════════════
   son.js — le son d'Alaq : une table, une porte.
   Porte : SND/toggleSound, la translittération (LTRANS, sylBase), la table SONS (semée
   par règles, écrite, composée) avec inscrireLeSon/aLeSon/aUnSon, l'état (_curAudio,
   _sndGen, stopAudio, quandSonFini), le pool iOS (audioBeni), la porte jouer/jouerFichier
   et ses raccourcis (speak, sayLetterName…), le haut-parleur (spkSVG/spkOn/spkOff), la
   marque sonore (playSfx, comboBonneReponse, okBeep, errorBeep, toc, chime, reveilAudio).
   ⛔ Aucun nom de fichier ne s'assemble au moment de jouer : la table est bâtie au
   chargement, puis seulement lue. Un son introuvable est un silence, jamais une voix de
   machine (journal : son.js · ce qui a disparu le 15/09).

   Script classique, pas un module :
   ① la table est écrite au chargement par plusieurs scripts (son.js lui-même en fin de
      fichier, revision.js, le grand script) : un module différé arriverait après eux ;
   ② _sndGen est un nombre réassigné, lu par revision.js, constance.js et l'hôte de
      l'unité 8 ; SND est lu depuis src/player. Un module publie ses valeurs par copie :
      elles seraient figées chez les lecteurs (journal : son.js · pourquoi un script classique).
   ⚠️ Chargé sous generateurs.js et avant le grand script ; ni defer, ni type="module",
   ni import/export.
   Hors de ce fichier : les récitations du Qorān (revision.js) et la table de l'unité 8
   (src/units/unit-8/donnees/sons.js), qui suit la même règle.
   Gardes : outils/verifier-son.mjs (table contre disque et pré-cache, écrans des leçons
   joués), previews/_verif_son.html, garderLeSon() dans vite.config.mjs.
   ══════════════════════════════════════════════════════════════════════════════ */

/* ═══ 1. LE RÉGLAGE — « Effets sonores » coupe l'ambiance (signature, erreur, carillons),
   jamais une voix enregistrée ni une récitation. */
let SND=(function(){try{return localStorage.getItem('alaq_snd')!=='off'}catch(e){return true}})();
function toggleSound(){
  SND=!SND;try{localStorage.setItem('alaq_snd',SND?'on':'off')}catch(e){}
}

/* ═══ 2. LA TRANSLITTÉRATION — du son (elle nomme des fichiers), lisible au chargement
   pour semer la table. */
const LTRANS={'ا':'alif','ب':'ba','ت':'ta','ث':'tha','ج':'jim','ح':'hha','خ':'kha','د':'dal','ذ':'dhal','ر':'ra','ز':'zay','س':'sin','ش':'shin','ص':'sad','ض':'dad','ط':'tta','ظ':'dha','ع':'ayn','غ':'ghayn','ف':'fa','ق':'qaf','ك':'kaf','ل':'lam','م':'mim','ن':'nun','ه':'ha','و':'waw','ي':'ya'};
const HKF={'َ':'fatha','ِ':'kasra','ُ':'damma'};
const MDF={'ا':'alif','ي':'ya','و':'waw'};
/* ⚠️ Les fichiers de syllabes disent noun-/ain- là où LTRANS dit nun/ayn
   (journal : son.js · syllabes noun/ain). */
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

/* ═══ 3. LA TABLE — clé = ce que l'app demande ; valeur = nom nu du fichier (la porte
   ajoute le dossier et .mp3). « م » demande le NOM de la lettre, « son:م » son SON. */
const SONS={};

/* ⚠️ Un silence voulu n'est pas un trou : le alif nu n'a pas de son, il porte la voyelle
   (son nom reste). Une clé citée ici n'entre jamais dans la table, et le banc la lit
   (journal : son.js · le alif nu se tait). */
const SANS_SON={'son:ا':'Myriam 17/08 — un alif nu n\'a pas de son, il porte la voyelle'};

/* ── ① ce qui se déduit : trois règles, déroulées une fois au chargement (une règle n'a
   pas de trou, une liste en a toujours un). */
function semerLesSons(){
  /* ⚠️ Les syllabes sont bornées aux lettres enseignées, lues dans UNITS : les autres
     lettres n'ont pas leurs prises de syllabes (journal : son.js · syllabes bornées). */
  const enseignees=new Set();
  try{ UNITS.forEach(function(u){ (u.letters||[]).forEach(function(L){ enseignees.add(letterKey(L)); }); }); }catch(e){}
  for(const L in LTRANS){
    const tr=LTRANS[L], trSyl=SYLTR[tr]||tr;
    SONS[L]='lettre-'+tr+'-nom';                                   // le NOM de la lettre
    if(!SANS_SON['son:'+L])SONS['son:'+L]='lettre-'+tr+'-son';     // son SON, sauf silence voulu
    if(!enseignees.has(L))continue;
    for(const h in HKF)SONS[L+h]=trSyl+'-'+HKF[h]+'-son-court';
    for(const m in MDF)SONS[L+MDH[m]+m]=trSyl+'-'+MDF[m]+'-son-prolonge';
  }
  /* ⚠️ ا أ إ آ ٱ sont cinq caractères distincts : chaque clé semée pour ا est recopiée
     pour chaque variante. ALIF_FAM est une chaîne, pas un tableau (pas de .forEach), et
     pas de try/catch ici : une dérivation qui échoue doit lever, pas se taire. */
  const deAlif=Object.keys(SONS).filter(function(k){ return k.indexOf('ا')===0; });
  for(const v of ALIF_FAM){
    if(v==='ا')continue;
    deAlif.forEach(function(k){ SONS[v+k.slice(1)]=SONS[k]; });
  }
  /* ⚠️ آ (alif madda) dit la prolongation du hamza, pas « alif » : ce cas se pose APRÈS
     la dérivation, qui l'écrasait. Le banc exige qu'aucune clé ne contredise sylBase
     (journal : son.js · آ écrasé par la dérivation). */
  SONS['آ']='alif-alif-son-prolonge';
}

/* ── ② ce qui ne se devine pas : une ligne par son (مَكْتَبٌ → mot-maktab ne s'invente pas).
   ⚠️ Beaucoup sont aussi dans src/content/units/unit-0N.json, et c'est le JSON qui tranche :
   la fin de ce fichier les reverse par inscrireLeSon et écrase ce qui diverge. Ils restent
   ici pour que la table soit complète dès le chargement (studio, bancs, pré-cache). */
const SONS_ECRITS={
  'أَمْ':'am-soukoun',
  'أَنْ':'an-soukoun',
  'أَلْ':'al-soukoun',
  'أَمَّ':'am-chedda',
  'أَنَّ':'an-chedda',
  'أَلَّ':'al-chedda',
  'أَمٌ':'am-tanwin',
  'أَنٌ':'an-tanwin',
  'أَلٌ':'al-tanwin',
  'نَمْلٌ':'mot-naml',
  'مَنٌّ':'mot-mann',
  'مَنَالٌ':'mot-manal',
  'مَالٌ':'mot-mal',
  'مَنَامٌ':'mot-manam',
  'نِيلٌ':'mot-nil',
  'نُونٌ':'mot-noun',
  'لِينٌ':'mot-lin',
  'لَمَّا':'mot-lamma',
  'يَوْمٌ':'mot-yawm',
  'لَيْلٌ':'mot-layl',
  'لَوْنٌ':'mot-lawn',
  'لَوْمٌ':'mot-lawm',
  'أَلِيمٌ':'mot-alim',
  'إِيمَانٌ':'mot-iman',
  'أُمٌّ':'mot-umm',
  'أَمِينٌ':'mot-amin',
  'يَمِينٌ':'mot-yamin',
  'أَمَانٌ':'mot-aman',
  'إِمَامٌ':'mot-imam',
  'إِلَيْنَا':'mot-ilayna',
  'مَمْنُونٌ':'mot-mamnoun',
  'ء':'lettre-hamza-nom',
  'رَبٌّ':'mot-rabb',
  'عَرَبِيٌّ':'mot-arabi',
  'عَيْنٌ':'mot-ayn',
  'لَبَنٌ':'mot-laban',
  'بَابٌ':'mot-bab',
  'نَبِيٌّ':'mot-nabi',
  'عَمَلٌ':'mot-amal',
  'عَالَمٌ':'mot-alam',
  'عَالَمُونَ':'mot-alamoun',
  'عَالِمٌ':'mot-aalim',
  'عُلَمَاءُ':'mot-oulama',
  'أَمْرٌ':'mot-amr',
  'رَبِيعٌ':'mot-rabi',
  'عُمْرٌ':'mot-umr',
  'a':'voyelle-a',
  'i':'voyelle-i',
  'ou':'voyelle-ou',
  'مَدْرَسَةٌ':'mot-madrasatoun',
  'دَرْسٌ':'mot-dars',
  'كَرِيمٌ':'mot-karim',
  'دِينٌ':'mot-din',
  'إِيَّاكَ':'mot-iyyaka',
  'نَعْبُدُ':'mot-naabudu',
  'النَّاسُ':'mot-annas',
  'مَالِكٌ':'mot-maalik',
  'مَلِكٌ':'mot-malik',
  'كَسَبَ':'mot-kasaba',
  'بِسْمِ':'mot-bismi',
  'الْحَمْدُ':'mot-alhamdu',
  'الرَّحْمَٰنُ':'mot-arrahman',
  'الرَّحِيمُ':'mot-arrahim',
  'قُلْ':'mot-qul',
  'أَحَدٌ':'mot-ahad',
  'حَاسِدٌ':'mot-hasid',
  'عُقَدٌ':'mot-uqad',
  'وَقَبَ':'mot-waqaba',
  'طَرِيقٌ':'mot-tariq',
  'حَطَبٌ':'mot-hatab',
  'صِرَاطٌ':'mot-sirat',
  'مُسْتَقِيمٌ':'mot-mustaqim',
  'نَسْتَعِينُ':'mot-nastain',
  'أَنْعَمْتَ':'mot-anamta',
  'غَيْر':'mot-ghayr',
  'الصَّمَدُ':'mot-assamad',
  'صُدُورٌ':'mot-sudur',
  'غَاسِقٌ':'mot-ghasiq',
  'صَبْرٌ':'mot-sabr',
  'غَيْبٌ':'mot-ghayb',
  'تَبَّ':'mot-tabba',
  'اللَّهُ':'mot-allah',
  'اهْدِنَا':'mot-ihdina',
  'الَّذِينَ':'mot-alladhina',
  'عَلَيْهِمْ':'mot-alayhim',
  'الْمَغْضُوبُ':'mot-almaghdoubou',
  'الضَّالُّونَ':'mot-addalloun',
  'هُوَ':'mot-huwa',
  'أَعُوذُ':'mot-audhu',
  'إِلَٰهٌ':'mot-ilah',
  'إِذَا':'mot-idha',
  'ذَهَبَ':'mot-dhahaba',
  'عَلَى':'mot-ala',
  'مَكْتَبٌ':'mot-maktab',
  'بِنْتٌ':'mot-bint',
  'وَلَدٌ':'mot-walad',
  'نَبَاتٌ':'mot-nabat',
  'الْمَاءُ':'mot-almaa',
  'التُّرَابُ':'mot-atturab',
};

/* ── ③ les graphies que les écrans composent à la volée : l'ordre des signes y diffère
   de la table (chedda puis fatha), ou la prise existe sous le nom de sa syllabe (sièges de
   la hamza de hamzaTap). ⚠️ Confronter l'écran à la table, pas seulement la table au disque
   (journal : son.js · les sons de l'app et les cinq graphies composées). */
const SONS_COMPOSES={
  '\u0623\u064E\u0645\u0651\u064E':'am-chedda',   // أَمَّ, chedda avant fatha
  '\u0623\u064E\u0646\u0651\u064E':'an-chedda',   // أَنَّ
  '\u0623\u064E\u0644\u0651\u064E':'al-chedda',   // أَلَّ
  '\u0624\u064F':'waw-damma-son-court',              // ؤُ — le siège waw dit « ou »
  '\u0626\u0650':'ya-kasra-son-court',               // ئِ — le siège ya dit « i »
};

/* ── ④ les sons de l'app, ni mots ni lettres. Les félicitations gardent leur suffixe -f :
   c'est leur vrai nom de fichier. */
const SONS_APP={
  'sfx:bonne-reponse':'sfx-bonne-reponse',
  'sfx:erreur':'sfx-erreur',
  'sfx:fin-lecon':'sfx-fin-lecon',
  'felicit:moumtaz':'felicit-moumtaz-f',
  'felicit:sahih':'felicit-sahih-f',
  'felicit:rai':'felicit-rai-f',
  'felicit:allahumma-barik':'felicit-allahumma-barik-f',
};

semerLesSons();
Object.assign(SONS,SONS_ECRITS,SONS_COMPOSES,SONS_APP);

/* La seule porte d'entrée de ce qui vient des données (mots des unités, Noms d'Allah,
   unités 8+) : rien n'écrit dans SONS à la main. */
function inscrireLeSon(cle,nom){
  if(!cle||!nom)return;
  SONS[cle]=String(nom).replace(/^audios-app-alaq\//,'').replace(/\.mp3$/,'');
}

/* Les familles ne servent qu'au banc (chaque son tombe dans une famille connue) ;
   elles ne pilotent aucun repli. */
const FAMILLES=['lettre','mot','nom','voyelle','sfx','felicit','am','an','al','faux'];
function familleDe(nom){
  const s=String(nom||'');
  if(/-son-(court|prolonge)$/.test(s))return 'syllabe';
  const p=s.split('-')[0];
  return FAMILLES.indexOf(p)>=0?p:null;
}
/* « Ce son existe-t-il ? » — à demander avant d'offrir un haut-parleur : un bouton qui
   ne joue rien se lit comme une panne. */
function aLeSon(cle){ return typeof cle==='string' && !!SONS[cle]; }
/* « Cette lettre a-t-elle un son ? » — pour la grille des 28 du Cours. */
function aUnSon(L){ const k='son:'+letterKey(L); return !!SONS[k] && !SANS_SON[k]; }

/* ═══ 4. L'ÉTAT — _sndGen est le jeton de génération : un nouveau son annule les replis
   et minuteries de l'ancien. Il reste dans ce script classique (voir l'en-tête). */
let _curAudio=null,_sndGen=0;
function stopAudio(){ // un seul son à la fois : coupe le fichier ET le tampon WebAudio, et invalide les replis en attente
  _sndGen++;
  try{ if(typeof suivreArret==='function')suivreArret(); }catch(e){}   // et l'illumination du verset s'éteint avec lui
  try{ if(_curSrc){ _curSrc.stop(); _curSrc=null; } }catch(e){}
  try{ if(_curAudio){ _curAudio.pause(); _curAudio=null; } }catch(e){}
}
function quandSonFini(cb){ // rappelle cb à la fin du son EN COURS (filet 2,5 s : silence)
  const gen=_sndGen;let done=false;
  const go=()=>{if(done||gen!==_sndGen)return;done=true;cb();};
  setTimeout(()=>{
    const a=_curAudio;
    if(a&&!a.paused&&!a.ended)a.addEventListener('ended',go,{once:true});
    setTimeout(go,2500);
  },150);
}

/* ═══ 5. LE POOL BÉNI (iOS) */
const _POOL=[];let _poolI=0;
/* ⚠️ Un silence WAV valide (20 ms, 8 kHz) ; on ne se déclare béni qu'après un play()
   réussi, sinon on réessaie au geste suivant (journal : son.js · le silence base64 invalide). */
const _SIL='data:audio/wav;base64,UklGRmQBAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
function benirAudio(){
  if(_POOL.length)return;
  const cand=[];for(let i=0;i<4;i++)cand.push(new Audio(_SIL));
  const fini=()=>{
    if(_POOL.length)return;
    cand.forEach(a=>{try{a.pause();}catch(e){}_POOL.push(a);});
    ['touchend','pointerup','mousedown','click'].forEach(ev=>document.removeEventListener(ev,benirAudio,true));
  };
  const p=cand[0].play();
  cand.slice(1).forEach(a=>{const q=a.play();if(q&&q.catch)q.catch(()=>{});});
  if(p&&p.then)p.then(fini).catch(()=>{});else fini();
}
try{
  ['touchend','pointerup','mousedown','click'].forEach(ev=>document.addEventListener(ev,benirAudio,true));
}catch(e){}
/* ⚠️ Un seul lecteur de secours, réutilisé : un new Audio() par appel fuyait et finissait
   par faire refuser les sons (journal : son.js · un seul lecteur de secours). */
let _secours=null;
function audioBeni(url){ // un lecteur du pool si béni, le même lecteur de secours sinon (bureau)
  if(!_POOL.length){
    if(!_secours)_secours=new Audio();
    try{_secours.pause();}catch(e){}
    _secours.onended=null;_secours.onerror=null;_secours.muted=false;_secours.src=url;
    return _secours;
  }
  /* ⚠️ Faire taire TOUT le pool (et le secours) avant de servir, sinon deux sons se
     superposent (journal : son.js · un deuxième son fait taire le premier). Le sfx
     WebAudio de playSfx ne passe pas ici : sa superposition au mot est voulue. */
  _POOL.forEach(function(p){try{p.pause();}catch(e){}});
  try{if(_secours)_secours.pause();}catch(e){}
  const a=_POOL[_poolI++%_POOL.length];
  a.onended=null;a.onerror=null;a.muted=false;a.src=url;
  return a;
}

/* ═══ 6. LA PORTE — une seule fonction fait sortir une voix enregistrée ; le reste
   n'est que du vocabulaire. */
const DOSSIER='audios-app-alaq/';
function urlDuSon(nom){ return DOSSIER+nom+'.mp3'; }

/* cle : ce que l'app demande · o.el : le haut-parleur animé · o.fin : rappelé à la fin
   de CE son, toujours, même sur un silence.
   ⚠️ Allumer un bouton après le son passe par o.fin, jamais par quandSonFini() armé avant
   l'appel : stopAudio() incrémente le jeton, et le rappel se croit périmé. */
function jouer(cle,o){
  o=o||{};
  const nom=(typeof cle==='string'&&SONS[cle])||null;
  return jouerFichier(nom,o);
}
/* Joue un fichier NOMMÉ, hors table (pour jouerF). Un nom absent se tait aussi. */
function jouerFichier(nom,o){
  o=o||{};
  stopAudio();
  spkOff(); spkOn(o.el);
  const gen=_sndGen;
  let fini=false;
  const termine=function(){ if(fini||gen!==_sndGen)return; fini=true; spkOff(); if(o.fin)o.fin(); };
  /* ⛔ Aucune voix de machine : un son absent est un silence, et termine rend la main
     (CONTINUER s'allume). Le trou est signalé au portillon (outils/verifier-son.mjs). */
  if(!nom){ setTimeout(termine,120); return; }
  try{
    const a=audioBeni(urlDuSon(nom)); _curAudio=a;
    let parti=false;
    a.addEventListener('playing',function(){parti=true;},{once:true});
    a.onended=termine;
    a.onerror=function(){ setTimeout(termine,80); };   // fichier absent : on se tait, et on rend la main
    const p=a.play(); if(p&&p.catch)p.catch(function(){ setTimeout(termine,80); });
    /* un chargement lent n'est PAS un fichier absent : on ne rend la main que si rien
       n'a même commencé à se télécharger (readyState 0 = pas même les métadonnées). */
    setTimeout(function(){ if(!parti&&gen===_sndGen&&a.paused&&a.readyState===0)termine(); },1400);
    /* ⚠️ 6 s, pas plus : ce filet borne l'attente de CONTINUER, et asmFini appelle la
       porte sans objectifFilet() (journal : son.js · le filet de 6 s). */
    setTimeout(termine,6000);  // filet : le rappel finit toujours par venir (CONTINUER ne reste jamais gris)
  }catch(e){ setTimeout(termine,120); }
}

/* ── le vocabulaire : raccourcis d'une ligne vers la porte, sans logique — l'appel dit
   ce qu'il veut entendre, et les appelants existants n'ont pas eu à changer. */
function speak(t){ jouer(t); }
function sayLetterName(L,fin,el){ jouer(L,{fin:fin,el:el}); }
function sayLetterSound(L,fin){ jouer('son:'+letterKey(L),{fin:fin}); }
function jouerMot(ar,fin,el){ jouer(ar,{fin:fin,el:el}); }
function spkAudio(t,el){ jouer(t,{el:el||document.getElementById('spkBig')}); }
function spkRejouer(L){ jouer(L,{el:document.getElementById('spkBig')}); }
/* jouerF : un nom de fichier en dur, donc hors table. Son 2e argument n'est plus lu. */
function jouerF(f,_inutile,fin){ jouerFichier(String(f).replace(/\.mp3$/,''),{fin:fin}); }
/* Les 3 haut-parleurs sonnent l'un après l'autre. La grille est en `direction:rtl`,
   donc l'option 0 est celle de DROITE : la séquence suit le sens de l'arabe. */
function spkSequence(st,k){
  if(QUEUE[qi]!==st||answered)return;
  if(!st.options||k>=st.options.length)return;
  var o=st.options[k];
  jouer(o.snd,{el:document.getElementById('sopt'+k),
               fin:function(){ setTimeout(function(){ spkSequence(st,k+1); },260); }});
}

/* ═══ 7. LE HAUT-PARLEUR DESSINÉ — trois ondes animées en cascade pendant le son. */
function spkSVG(cls){
  return '<svg class="spk'+(cls?' '+cls:'')+'" viewBox="0 0 52 34" aria-hidden="true">'+
    '<path class="cone" d="M5 12.5h7l9-7.5a1.6 1.6 0 012.6 1.2v21.6a1.6 1.6 0 01-2.6 1.2l-9-7.5H5a2 2 0 01-2-2v-5a2 2 0 012-2z"/>'+
    '<path class="w w1" d="M30 12.5a7 7 0 010 9"/>'+
    '<path class="w w2" d="M35.5 8a13 13 0 010 18"/>'+
    '<path class="w w3" d="M41 3.5a19 19 0 010 27"/></svg>';
}
function spkOn(el){
  if(!el)return;
  el.classList.add('on');
  var s=el.querySelector('.spk'); if(s)s.classList.add('on');
}
function spkOff(){
  /* ⚠️ Toute nouvelle sorte de bouton sonore doit rejoindre ce sélecteur, sinon son
     haut-parleur reste allumé (journal : son.js · spkOff et .wspk). */
  var l=document.querySelectorAll('.spk.on,.spkbtn.on,.opt.on,.wspk.on');
  for(var i=0;i<l.length;i++)l[i].classList.remove('on');
}

/* ═══ 8. LA MARQUE SONORE — ① la signature à chaque bonne réponse (sfx-bonne-reponse) ;
   ② un mot de félicitation toutes les COMBO_TOUS bonnes réponses d'affilée ; ③ la clôture
   de leçon (sfx-fin-lecon) (journal : son.js · la marque sonore). */
const _SFXB={};let _sfxCtx=null,_curSrc=null;
function chargerSfx(){ // réveille le moteur à chaque geste, décode les sons courts une seule fois
  try{
    _sfxCtx=_sfxCtx||new (window.AudioContext||window.webkitAudioContext)();
    if(_sfxCtx.state!=='running')_sfxCtx.resume(); // iOS : couvre aussi l'état « interrupted »
    /* ⚠️ Chaque sfx de playSfx doit être décodé ici : sinon il prend le repli <audio>,
       qui appelle stopAudio() et coupe le son en cours (journal : son.js · fin-lecon). */
    ['bonne-reponse','erreur','fin-lecon'].forEach(n=>{
      if(_SFXB[n]||_SFXB['_'+n])return;
      _SFXB['_'+n]=1; // verrou : un seul téléchargement par son
      fetch(urlDuSon(SONS['sfx:'+n])).then(r=>r.arrayBuffer())
        /* ⚠️ decodeAudioData rend AUSSI une promesse : on la rattrape, sinon une
           « EncodingError » non gérée à chaque échec de décodage. */
        .then(ab=>new Promise((res,rej)=>{const p=_sfxCtx.decodeAudioData(ab,res,rej);if(p&&p.catch)p.catch(()=>{});}))
        .then(b=>{_SFXB[n]=b;}).catch(()=>{delete _SFXB['_'+n];});
    });
  }catch(e){}
}
try{
  ['touchend','pointerup','mousedown','click'].forEach(ev=>document.addEventListener(ev,chargerSfx,true));
}catch(e){}
/* ⚠️ iOS : un AudioContext « interrupted » (appel, Siri, verrouillage) ne repart jamais
   seul. D'où state!=='running' partout, et le réveil de TOUS les contextes au retour au
   premier plan — ils doivent donc vivre dans ce fichier classique, _tocCtx compris
   (journal : son.js · le son du bouton CONTINUER disparaît). */
function reveilAudio(){
  [window._ac,_sfxCtx,_tocCtx,chime._ac].forEach(function(c){
    try{ if(c&&c.state!=='running')c.resume(); }catch(e){}
  });
}
try{ document.addEventListener('visibilitychange',function(){ if(!document.hidden)reveilAudio(); }); }catch(e){}
function playSfx(name){ // récompense/erreur : tampon WebAudio si décodé (jamais bloqué), sinon <audio> béni, sinon SILENCE
  if(!SND)return; // « Effets sonores » coupe la récompense À L'INSTANT (Myriam 10/08)
  try{
    const b=_SFXB[name];
    if(b&&_sfxCtx){
      /* ⚠️ Pas de stopAudio() ici : le sfx se superpose et le mot finit de sonner
         (journal : son.js · le sfx se superpose au mot). */
      try{ if(_curSrc){ _curSrc.stop(); _curSrc=null; } }catch(_){}
      if(_sfxCtx.state!=='running')_sfxCtx.resume(); // iOS : couvre aussi l'état « interrupted »
      const s=_sfxCtx.createBufferSource();s.buffer=b;s.connect(_sfxCtx.destination);_curSrc=s;s.start();
      return;
    }
    stopAudio(); // repli <audio> seulement : il écrase _curAudio, l'ancien contrat reste
    const a=audioBeni(urlDuSon(SONS['sfx:'+name]||('sfx-'+name))); _curAudio=a;
    const p=a.play(); if(p&&p.catch)p.catch(()=>{});
  }catch(e){}
}
const COMBO_TOUS=3;
const COMBO_POOL=['moumtaz','sahih','rai','allahumma-barik'];
let comboSerie=0, comboDernier='';
function comboReset(){ comboSerie=0; }
function comboBonneReponse(){
  playSfx('bonne-reponse');                       // la signature, toujours
  if(++comboSerie<COMBO_TOUS)return;
  comboSerie=0;
  // jamais deux fois le même d'affilée : c'est la variété qui empêche la lassitude
  const dispo=COMBO_POOL.filter(m=>m!==comboDernier);
  comboDernier=dispo[Math.floor(Math.random()*dispo.length)];
  const gen=_sndGen, nom=SONS['felicit:'+comboDernier];
  // 350 ms : la signature (les quartes de Myriam, 287 ms) finit, on enchaîne sans trou.
  // Le jeton _sndGen est revérifié : changer d'écran entre-temps annule la félicitation.
  setTimeout(function(){
    if(gen!==_sndGen||!nom)return;
    try{ const a=audioBeni(urlDuSon(nom)); _curAudio=a; const p=a.play(); if(p&&p.catch)p.catch(function(){}); }catch(e){}
  },350);
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
let _tocCtx=null;
function toc(){ // l'erreur : deux frappes du timbre Bayātī, +1,5 puis −1,5 (choix Myriam 07/08) ; l'oscillateur reste en secours
  if(!SND)return; // même règle que playSfx : le repli oscillateur doit se taire aussi
  if(_SFXB['erreur']){ playSfx('erreur'); return; }
  try{
    _tocCtx=_tocCtx||new (window.AudioContext||window.webkitAudioContext)();
    if(_tocCtx.state!=='running')_tocCtx.resume(); // iOS : couvre aussi l'état « interrupted »
    const o=_tocCtx.createOscillator(),g=_tocCtx.createGain();
    o.frequency.setValueAtTime(170,_tocCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(110,_tocCtx.currentTime+.12);
    g.gain.setValueAtTime(.22,_tocCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,_tocCtx.currentTime+.16);
    o.connect(g);g.connect(_tocCtx.destination);o.start();o.stop(_tocCtx.currentTime+.17);
  }catch(e){}
}
function chime(){ // petit carillon doux (arpège A5·D6·G6) — Web Audio, sans fichier
  if(!SND)return;   // comme tous les générateurs
  try{
    var AC=window.AudioContext||window.webkitAudioContext; if(!AC)return;
    var ac=chime._ac||(chime._ac=new AC()); if(ac.state!=='running')ac.resume(); // iOS : couvre aussi l'état « interrupted »
    var t=ac.currentTime;
    [[880,0],[1174.66,0.09],[1567.98,0.18]].forEach(function(p){
      var o=ac.createOscillator(), g=ac.createGain();
      o.type='sine'; o.frequency.value=p[0]; var s=t+p[1];
      g.gain.setValueAtTime(0.0001,s);
      g.gain.exponentialRampToValueAtTime(0.16,s+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,s+0.55);
      o.connect(g); g.connect(ac.destination); o.start(s); o.stop(s+0.6);
    });
  }catch(e){}
}

/* ── le son de chaque mot des unités 1 à 7, depuis le package (champ snd).
   ⚠️ Versé ICI, pas dans le grand script : son.js se charge avant revision.js, dont le
   cache des Noms d'Allah doit écrire APRÈS et gagner (outils/verifier-revision.mjs ⑤).
   ⚠️ Et il gagne sur SONS_ECRITS : pour الرَّحْمَٰنُ et الرَّحِيمُ, le package pointe la prise
   des Noms d'Allah (journal : son.js · les mots des unités 1 à 7 versés ici). */
UNITS.forEach(function(U){ (U.words||[]).forEach(function(w){
  if (w && w.w && w.snd) inscrireLeSon(w.w, w.snd);
}); });
