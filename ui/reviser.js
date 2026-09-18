/* ui/reviser.js — le Cours et la peinture du hub Réviser :
   · renderCours et ses sous-onglets Vidéos (UNIT_VIDEOS, ytEmbed), Résumé (coursSignsHTML, les
     accordéons accCard/accToggle/accAll, fatihaWordFor, playLetterAnim, RESUME_GRAM avec
     resumeGramU8/resumeGramU9) et Vocabulaire ;
   · renderReviser et ses sous-onglets Qorān, lettres, vocabulaire, grammaire (grammaireHubHTML).
   Les rouages du hub (BOITES, boiteTap, reviserTabTap, curReviserTab…) vivent dans revision.js,
   chargé juste après ; renderReviser lit ET réassigne curReviserTab (let partagé entre scripts).
   Script classique, chargé sous ui/parametres.js et avant le grand script ; rien n'est lu au
   chargement (RESUME_GRAM est une table de fonctions). Voir l'en-tête de ui/accueil.js.
   À L'APPEL :
   · UNITS, SOURATES, letterKey (donnees.js) · S, unitUnlocked (progression.js) · ico, icoImg (assets.js)
   · spkSVG, speak, aUnSon, aLeSon, et en ligne sayLetterName, sayLetterSound, spkAudio (son.js)
   · curSourate, curReviserTab, BOITES, letterGridHTML, allReviewWords, dueReviewWords, notionsGram,
     gramMaitrise, et en ligne coursTabTap, reviserTabTap, boiteTap, startReview, openWrite,
     startGrammarReview, startGrammarTargeted (revision.js)
   · today (constance.js) · isHarakat (src/ecrans, module)
   · arReveal, U8 (le talon, puis le module), knownLetterSet, fatihaPct (index.html)
   · estSolaire, LUNAIRES_14, SOLAIRES_14, maybeShowCoursTut, maybeShowLetterTut,
     maybeShowVocabTut, et en ligne coursTut, vocabTut (bulles-tutoriels.js)
   · toAr, sujetCours (ui/accueil.js)
   Gardes : outils/verifier-interface.mjs, previews/_verif_interface.html. */

const UNIT_VIDEOS={1:'',2:'',3:''}; // ← colle ici l'ID ou le lien YouTube de chaque unité (clé = numéro d'unité)

function ytEmbed(v){ if(!v)return''; v=String(v).trim(); let id='',m=v.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); if(m)id=m[1]; else if(/^[\w-]{11}$/.test(v))id=v; return id?('https://www.youtube.com/embed/'+id):''; }

let coursOpen={resume:{},vocab:{}};
/* la carte du tachkīl est dépliable comme les accordéons d'unité, mais sans numéro ni lettres :
   un simple booléen */
let tachkilOpen=false;
function tachkilToggle(){ tachkilOpen=!tachkilOpen; renderCours('resume'); }
function unlockedNos(){ return UNITS.filter((U,i)=>unitUnlocked(i)).map(U=>U.no); }
function accAllBtn(sub){ const nos=unlockedNos(); const allOpen=nos.length>0&&nos.every(n=>coursOpen[sub][n]);
  return '<button class="acc-all" onclick="accAll(\''+sub+'\')">'+(allOpen?'▾ Tout replier':'▸ Tout déplier')+'</button>'; }
function accCard(sub,U,inner){ const open=!!coursOpen[sub][U.no];
  return '<div class="ccard acc'+(open?' open':'')+'">'+
    '<button class="acc-h" onclick="accToggle(\''+sub+'\','+U.no+')">'+
      '<span class="cno">'+toAr(U.no)+'</span><span class="acc-tt">Unité</span>'+
      ((U.letters||[]).length?'<span class="clet">'+U.letters.join(' ')+'</span>':'<span class="clet csujet">'+sujetCours(U)+'</span>')+'<span class="acc-chev">'+(open?'▾':'▸')+'</span></button>'+
    '<div class="acc-b">'+inner+'</div></div>'; }
function accToggle(sub,no){ coursOpen[sub][no]=!coursOpen[sub][no]; renderCours(sub); }
function accAll(sub){ const nos=unlockedNos(); const allOpen=nos.length>0&&nos.every(n=>coursOpen[sub][n]); nos.forEach(n=>coursOpen[sub][n]=!allOpen); renderCours(sub); }
// Cours : signes de lecture cliquables (touche → on entend) + révélation
function playSyl(ar,el){
  try{ if(el){ el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); setTimeout(function(){el.classList.remove('pulse');},460); } }catch(e){}
  try{ speak(ar); }catch(e){}
}
function playLetterAnim(btn,L,c){
  var st=btn.parentNode.querySelector('.la-stage'); if(!st)return; st.style.display='flex';
  var W=st.querySelector('.la-word'),Bar=st.querySelector('.la-bar'),Ro=st.querySelector('.la-ro');
  var V=[{h:'\u064E',m:'ا',vs:'a',vl:'â'},{h:'\u0650',m:'ي',vs:'i',vl:'î'},{h:'\u064F',m:'و',vs:'ou',vl:'û'}];
  if(W._t)W._t.forEach(clearTimeout); W._t=[];
  function T(fn,ms){W._t.push(setTimeout(fn,ms));}
  function pop(){W.classList.remove('pop');void W.offsetWidth;W.classList.add('pop');}
  function say(t){try{speak(t);}catch(e){}}
  var t=0;
  V.forEach(function(v){
    var sh=L+v.h, lg=L+v.h+v.m;
    T(function(){W.innerHTML=L;Bar.style.width='0';Ro.textContent='';},t);
    T(function(){W.innerHTML=sh;pop();Bar.style.width='30px';Ro.textContent='';say(sh);},t+320);      // le signe se pose (bref)
    T(function(){W.innerHTML='<span>'+sh+'</span><span class="la-l2 away">'+v.m+'</span>';setTimeout(function(){var e=W.querySelector('.la-l2');if(e)e.classList.remove('away');},60);},t+1150); // la madd glisse
    T(function(){W.innerHTML=lg;pop();Bar.style.width='92px';Ro.textContent='';say(lg);},t+1800);      // soudure (long)
    t+=2600;
  });
  T(function(){W.innerHTML=L;Bar.style.width='0';Ro.textContent='';},t);
}
function coursSignsHTML(){
  var SIGNS=[
    {t:'Les voyelles courtes ('+arReveal('ḥarakāt','حَرَكَات')+')', d:'Un petit signe donne un son bref.', c:[['مَ','a'],['مِ','i'],['مُ','ou']]},
    {t:'Les prolongations ('+arReveal('madd','مَدّ')+')', d:'Une lettre (ا ي و) étire la voyelle, deux fois plus longue.', c:[['مَا','â'],['مِي','î'],['مُو','û']]},
    {t:'Le '+arReveal('soukoun','سُكُون'), d:'La lettre sans voyelle : consonne seule.', c:[['مْ','m']]},
    {t:'La '+arReveal('chedda','شَدَّة'), d:'La lettre est doublée : on insiste.', c:[['مّ','m·m']]},
    /* ⚠️ مًا, pas مً : le fatḥatayn s'écrit avec un alif final muet ; مٌ et مٍ n'en portent jamais
       (journal : ui/reviser.js · le tanwīn مًا) */
    {t:'Le '+arReveal('tanwīn','تَنْوِين'), d:'Un « n » à la fin (indéfini) : dhammatayn, kasratayn, fathatayn.', c:[['مٌ','oun'],['مٍ','in'],['مًا','an']]},
  ];
  return '<div class="ccard acc'+(tachkilOpen?' open':'')+'">'+
    '<button class="acc-h" onclick="tachkilToggle()">'+
      '<span style="flex:1;display:flex;align-items:center;gap:10px;min-width:0">'+
        '<img class="prm-ic" src="'+ico('menu-cours')+'" alt=""> <span class="acc-tt">'+arReveal('Tachkīl','تَشْكِيل')+' · les signes de lecture</span>'+
      '</span><span class="acc-chev">'+(tachkilOpen?'▾':'▸')+'</span></button>'+
    '<div class="acc-b">'+SIGNS.map(function(g){
      return '<div class="sgn-card"><div class="sgn-head">'+g.t+'</div>'+
        '<div class="sgn-chips">'+g.c.map(function(x){
          /* ⛔ une puce sans prise est désactivée, jamais jouée : elle enseigne le signe à l'œil
             (journal : ui/reviser.js · les puces de signes sans prise) */
          var jouable = aLeSon(x[0]);
          return '<button class="chip"'+(jouable?' onclick="playSyl(\''+x[0]+'\',this)"':' disabled')+
            '><span class="chip-ar">'+x[0]+'</span><span class="chip-ro">'+x[1]+'</span></button>';
        }).join('')+'</div>'+
        '<div class="sgn-desc">'+g.d+'</div></div>';
    }).join('')+'</div></div>';
}
// A : un mot de la Fātiḥa contenant la lettre
function fatihaWordFor(L){
  var k=letterKey(L), FA=(SOURATES[0]&&SOURATES[0].verses)||[];
  for(var v=0;v<FA.length;v++){ var ws=FA[v].split(' ');
    for(var w=0;w<ws.length;w++){ var word=ws[w];
      for(var c=0;c<word.length;c++){ if(letterKey(word[c])===k) return word; } } }
  return '';
}
/* LE RÉSUMÉ DE GRAMMAIRE DE L'UNITÉ 8 — l'article الـ.
   ⚠️ Il réemploie les gabarits du Cours (.sgn-card, .sgn-head, .sgn-chips, .chip, .sgn-desc,
   .lg-cell), validés dans les deux thèmes et couverts par le balayage de contraste.
   ⛔ Rien n'est retapé en arabe : les mots viennent de U8.mots, les mots de verset de U8.versets,
   les lettres travaillées sont dérivées du champ L de chaque mot.
   (journal : ui/reviser.js · le résumé de grammaire de l’unité 8) */
/* RESUME_GRAM dit qui a un résumé de grammaire, indexé par la POSITION dans UNITS (7 = l'unité 8,
   8 = l'unité 9). ⚠️ Une unité listée sans contenu rendrait une carte vide.
   ⛔ Un résumé s'écrit avec Myriam, jamais inventé ici : l'unité n'entre dans la table qu'une fois
   son résumé écrit. */
const RESUME_GRAM={7:function(){ return resumeGramU8(); }, 8:function(){ return resumeGramU9(); }};

function gramChip(ar,ro){
  return '<button class="chip" onclick="playSyl(\''+ar+'\',this)">'+
    '<span class="chip-ar">'+ar+'</span><span class="chip-ro">'+ro+'</span></button>';
}
/* La bande des 14 : les lettres que l'unité a TRAVAILLÉES sont en or, les autres
   en gris — l'élève voit d'un coup ce qu'elle connaît et ce qui reste (spec §1.2). */
function gramBande(fam,vues){
  return '<div class="gsec-let">'+fam.split('').map(function(L){
    var g=(L==='\u0647')?'\uFEE9':L;                 /* le ه isolé s'écrit rond, comme dans la grille */
    return vues.indexOf(L)>=0?'<b>'+g+'</b>':g;
  }).join(' ')+'</div>';
}
function gramSection(titre,inner,desc){
  return '<div class="sgn-card"><div class="sgn-head">'+titre+'</div>'+inner+
    '<div class="sgn-desc">'+desc+'</div></div>';
}
/* La lettre qui suit l'article, calculée, jamais écrite dans une donnée : on saute ا et ل puis
   les marques du ل (soukoun devant une lunaire, rien devant une solaire). */
function lettreApresArticle(mot){
  var i=2; while(i<mot.length&&isHarakat(mot.charAt(i)))i++;
  return mot.charAt(i)||'';
}
function resumeGramU8(){
  var m=U8.mots||{}, cles=Object.keys(m);
  /* Le module ES arrive APRÈS ce script. Sans lui, le talon rend {} : on le DIT
     au lieu d'afficher une carte vide — la panne muette que ce projet connaît. */
  if(!cles.length) return '<div class="sgn-desc">Le résumé s\u2019affiche dès que la leçon est chargée. Rouvre cet onglet dans un instant.</div>';
  var vues=cles.map(function(k){return m[k].L;});   /* les 10 lettres travaillées, dérivées des mots */
  function mot(k,quoi){ var w=m[k]; return gramChip(w[quoi==='def'?'def':'nu'], quoi==='def'?w.le:w.un); }

  /* ── 1 · L'ARTICLE ET LE TANWĪN ─────────────────────────────────────────── */
  var s1=gramSection(
    'L\u2019article <span class="ar">الـ</span> \u00b7 un mot devient LE mot',
    '<div class="sgn-chips">'+mot('qalam','nu')+'<span class="gsec-fl">\u2794</span>'+mot('qalam','def')+'</div>',
    'L\u2019article <span class="ar">الـ</span> et le tanwīn <span class="ar">ـٌ</span> ne cohabitent JAMAIS : '+
    'dès que l\u2019article arrive, le petit « -n » de la fin tombe et la dhammatayn devient une dhamma <span class="ar">ـُ</span>.');

  /* ── 2 · LES 14 LUNAIRES ────────────────────────────────────────────────── */
  var s2=gramSection(
    '\ud83c\udf19 Les 14 lettres lunaires \u00b7 <span class="ar">الْقَمَرِيَّة</span>',
    gramBande(LUNAIRES_14,vues)+
    '<div class="sgn-chips">'+['qamar','bab','yad','bayt'].map(function(k){return mot(k,'def');}).join('')+'</div>',
    'Devant ces 14 lettres, le <span class="ar">ل</span> porte un soukoun <span class="ar">الْـ</span> et s\u2019entend clairement.');

  /* ── 3 · LES 14 SOLAIRES ────────────────────────────────────────────────── */
  var s3=gramSection(
    '\u2600\ufe0f Les 14 lettres solaires \u00b7 <span class="ar">الشَّمْسِيَّة</span>',
    gramBande(SOLAIRES_14,vues)+
    '<div class="sgn-chips">'+['dar','dalw','tayr','tin'].map(function(k){return mot(k,'def');}).join('')+'</div>',
    /* ⚠️ « lettre muette », jamais « le ل s'avale » (journal : ui/reviser.js · « lettre muette ») */
    'Le <span class="ar">ل</span> est une <b>lettre muette</b> : il ne se prononce pas, et la lettre qui suit est '+
    'doublée par une chedda <span class="ar">ـّ</span>.');

  /* ── 4 · LE REPÈRE DANS L'ALPHABET ──────────────────────────────────────── */
  var ex=[['\u0642',0],['\u062f',1],['\u0628',0],['\u062a',1]];   /* ق د ب ت — deux lunaires, deux solaires */
  var s4=gramSection(
    'Le repère dans l\u2019alphabet',
    '<div class="gsec-cells">'+ex.map(function(e){
      return '<div class="lg-cell avail"><span class="sm">'+(e[1]?'\u2600\ufe0f':'\ud83c\udf19')+'</span>'+e[0]+'</div>';
    }).join('')+'</div>',
    'Chaque lettre de la grille porte maintenant son repère : \u2600\ufe0f solaire (le <span class="ar">ل</span> est muet) '+
    'ou \ud83c\udf19 lunaire (le <span class="ar">ل</span> s\u2019entend). Tu le retrouves dans <b>Réviser \u203a Les lettres</b>.');

  /* ── 5 · DANS LE QORĀN ──────────────────────────────────────────────────── */
  /* ⚠️ les mots sont choisis par leur clé latine, jamais par leur graphie : une regex arabe tapée
     de mémoire ne correspond à aucune graphie du fichier. */
  var V=U8.versets||{};
  function versetChips(cles){
    return '<div class="sgn-chips">'+Object.keys(V).filter(function(w){return cles.indexOf(V[w])>=0;})
      .sort(function(a,b){return cles.indexOf(V[a])-cles.indexOf(V[b]);})
      .map(function(w){
        var L=lettreApresArticle(w);
        return gramChip(w,(estSolaire(L)?'\u2600\ufe0f ':'\ud83c\udf19 ')+L);
      }).join('')+'</div>';
  }
  var s5=gramSection(
    'Dans la Fātiḥa',
    versetChips(['alhamdu','alamin','almustaqima'])+versetChips(['arrahmani','arrahimi','addini','assirata']),
    'Touche un mot pour l\u2019entendre. C\u2019est la lettre écrite sous le mot \u2014 celle qui suit '+
    '<span class="ar">الـ</span> \u2014 qui décide si le <span class="ar">ل</span> s\u2019entend ou reste muet.');

  return s1+s2+s3+s4+s5;
}

/* LE RÉSUMÉ DE GRAMMAIRE DE L'UNITÉ 9 — بِ · عَلَى · لِ.
   ⛔ L'unité 9 n'a pas de table centrale : les cinq exemples sont recopiés octet pour octet de
   ses disques 5, 6, 7 et 9, jamais retapés. Leurs cinq sons sont inscrits dans SONS par
   index.html (inscrireLeSon), pas par ce fichier.
   (journal : ui/reviser.js · le résumé de grammaire de l’unité 9) */

function resumeGramU9(){
  /* ── 1 · بِ — LE MOYEN ──────────────────────────────────────────────────── */
  var s1=gramSection(
    '<span class="ar">بِ</span> — le moyen',
    '<div class="sgn-chips">'+gramChip('بِالْقَلَمِ','avec le stylo')+'</div>',
    '<span class="ar">بِ</span> veut dire « avec, au moyen de ». Il ne se détache JAMAIS du nom qui '+
    'le suit — pas d’espace, comme un préfixe.');

  /* ── 2 · لِ — POUR, À QUI ───────────────────────────────────────────────── */
  var s2=gramSection(
    '<span class="ar">لِ</span> — pour, à qui',
    '<div class="sgn-chips">'+gramChip('لِلْبِنْتِ','pour la fille')+'</div>',
    '<span class="ar">لِ</span> veut dire « pour, à ». Lui aussi s’attache SANS espace — et devant '+
    '<span class="ar">الـ</span>, son alif disparaît à l’écrit (<span class="ar">لِ+الْبِنْتُ→لِلْبِنْتِ</span>).');

  /* ── 3 · عَلَى — SUR ────────────────────────────────────────────────────── */
  var s3=gramSection(
    '<span class="ar">عَلَى</span> — sur',
    '<div class="sgn-chips">'+gramChip('عَلَى الْبَيْتِ','sur la maison')+'</div>',
    '<span class="ar">عَلَى</span> veut dire « sur ». Contrairement à <span class="ar">بِ</span> et '+
    '<span class="ar">لِ</span>, il reste toujours SÉPARÉ — l’espace et le <span class="ar">الـ</span> '+
    'du mot suivant ne bougent pas.');

  /* ── 4 · LA RÈGLE COMMUNE : LA KASRA ─────────────────────────────────────
     Source : les questions de règle des disques 5 à 7 (« se termine par une kasra »). */
  var s4=gramSection(
    'Ce que les trois ont en commun',
    '<div class="sgn-chips">'+gramChip('الْقَلَمِ','ـِ (kasra)')+gramChip('الْبِنْتِ','ـِ (kasra)')+gramChip('الْبَيْتِ','ـِ (kasra)')+'</div>',
    'Après <span class="ar">بِ</span>, <span class="ar">لِ</span> ou <span class="ar">عَلَى</span>, le nom qui '+
    'suit se termine TOUJOURS par une kasra <span class="ar">ـِ</span> — qu’il s’attache (بِ، لِ) ou '+
    'qu’il reste séparé (عَلَى).');

  /* ── 5 · DANS LE QORĀN ──────────────────────────────────────────────────── */
  var s5=gramSection(
    'Dans le Qorān',
    '<div class="sgn-chips">'+gramChip('بِسْمِ اللَّهِ','au nom d’Allah')+gramChip('الْحَمْدُ لِلَّهِ','la louange est à Allah')+'</div>',
    'Les deux premiers mots de la Fātiḥa portent déjà <span class="ar">بِ</span> et <span class="ar">لِ</span> — '+
    'la règle que tu viens d’apprendre est celle du Qorān lui-même.');

  return s1+s2+s3+s4+s5;
}

function renderCours(sub){
  sub=sub||'video';
  const tabs=[['video','<img class="itab-ic" src="'+ico('tab-video')+'" alt="">','Vidéos'],['resume','<img class="itab-ic" src="'+ico('tab2-lire')+'" alt="">','Résumé'],['vocab','<img class="itab-ic" src="'+ico('tab-cartes')+'" alt="">','Vocabulaire']];
  const unlocked=UNITS.map((U,i)=>i).filter(i=>unitUnlocked(i));
  let h='<div style="display:flex;justify-content:flex-end;margin:0 0 4px">'+'<button class="lg-help" onclick="coursTut()" aria-label="À quoi servent ces onglets ?">?</button></div>';h+='<div class="icontabs">'+tabs.map(t=>'<button class="itab'+(t[0]===sub?' active':'')+'" onclick="coursTabTap(\''+t[0]+'\')">'+t[1]+'<span class="tip">'+t[2]+'</span></button>').join('')+'</div>';
  if(!unlocked.length){ h+='<div class="cempty"><div class="ce-ic">🔒</div>Commence l\u2019unité 1 pour débloquer du contenu ici.</div>'; document.getElementById('view-cours').innerHTML=h; return; }
  /* une unité dit son sujet : ses lettres, ou son `court` quand elle n'en a pas */
  const head=U=>'<div class="ctt"><div class="cno">'+toAr(U.no)+'</div><h3>Unité</h3>'+((U.letters||[]).length?'<div class="clet">'+U.letters.join(' ')+'</div>':'<div class="clet csujet">'+sujetCours(U)+'</div>')+'</div>';

  if(sub==='video'){
    h+=unlocked.map(i=>{ const U=UNITS[i]; const emb=ytEmbed(UNIT_VIDEOS[U.no]);
      return '<div class="ccard">'+head(U)+(emb
        ?'<div class="vembed"><iframe src="'+emb+'" allowfullscreen loading="lazy"></iframe></div>'
        :'<div class="vsoon"><div class="vic">'+icoImg('tab-video')+'</div>Vidéo bientôt disponible</div>')+'</div>'; }).join('');
  }
  else if(sub==='resume'){
    h+=accAllBtn('resume')+coursSignsHTML();
    /* Le Résumé ne montre que les unités qui ont des lettres ou un résumé écrit dans RESUME_GRAM :
       sinon, une carte vide (journal : ui/reviser.js · renderCours, les unités sans lettres). */
    h+=unlocked.filter(function(i){ return (UNITS[i].letters||[]).length||RESUME_GRAM[i]; }).map(function(i){ const U=UNITS[i];
      if(!(U.letters||[]).length) return accCard('resume',U,RESUME_GRAM[i]());
      const rows=U.letters.map(function(L){ const d=U.alpha[L]; var ex=fatihaWordFor(L);
        return '<div class="lrow"><div class="lbig">'+L+'</div><div class="ltx">'+
          /* ⛔ pas de transcription du nom (règle de Myriam, 14/08) : il s'écoute */
          '<div class="ln"><button class="lspk" onclick="sayLetterName(\''+L+'\')" aria-label="Écouter le nom">🔊</button> <span class="lcap">son nom</span></div>'+
          /* une lettre sans son propre (le alif) n'offre pas de bouton muet */
          (aUnSon(L)
            ? '<div class="ls"><button class="lspk" onclick="sayLetterSound(\''+L+'\')" aria-label="Écouter le son">🔊</button> '+d.son+'</div>'
            : '<div class="ls"><span class="lcap">porte la voyelle, sans son propre</span></div>')+
          /* ⚠️ le haut-parleur n'apparaît que si le son existe : fatihaWordFor rend la forme du
             verset, la table porte les formes de citation. Le mot reste affiché.
             (journal : ui/reviser.js · renderCours, le haut-parleur du mot de la Fātiḥa) */
          (ex?'<div class="lex">📖 <span class="lex-w"'+(aLeSon(ex)?' onclick="speak(\''+ex+'\')"':'')+'>'+ex+'</span>'+
              (aLeSon(ex)?' <button class="lspk" onclick="speak(\''+ex+'\')" aria-label="Écouter le mot">🔊</button>':'')+'</div>':'')+
          '<div class="lanim"><button class="la-btn" onclick="playLetterAnim(this,\''+L+'\',\''+(U.lat[L]||'')+'\')">▶ voir la prolongation</button><div class="la-stage" style="display:none"><div class="la-word">'+L+'</div><div class="la-track"><div class="la-bar"></div></div><div class="la-ro"></div></div></div>'+
          '</div></div>';
      }).join('');
      return accCard('resume',U,rows);
    }).join('');
  }
  else if(sub==='vocab'){
    h+=accAllBtn('vocab')+unlocked.map(i=>{ const U=UNITS[i];
      const rows=(U.words||[]).map(w=>'<div class="grow"><div class="gar">'+w.w+'</div><div class="gtx"><span class="gfr">'+w.fr+'</span></div><button class="gspk" onclick="speak(\''+w.w+'\')" aria-label="Écouter">'+spkSVG()+'</button></div>').join('');
      return accCard('vocab',U,'<div class="gloss">'+rows+'</div>'); }).join('');
  }

  document.getElementById('view-cours').innerHTML=h;
  maybeShowCoursTut();
}

/* ═══ LE HUB DE LA GRAMMAIRE — sur le modèle du vocabulaire : un bouton en haut, les notions
   en liste, un crayon ✏️ par notion. Pas de boîtes par unité (à l'unité 12 on choisirait
   toujours la même). Gabarits de la liste du vocabulaire (.wrow, .wtx, .wfr, .wpen, .revbtn,
   .revcount, .ubar), déjà couverts par le balayage de contraste. */
function grammaireHubHTML(){
  var N=notionsGram();
  if(!N.length) return '<div class="ccard" style="opacity:.7;text-align:center">'+
    '<h3 style="font-family:var(--ui);font-size:17px;margin:0 0 8px">La grammaire</h3>'+
    '<p style="color:var(--muted);font-family:var(--ui);font-size:13.5px;margin:0">'+
    'Elle s\u2019ouvre avec l\u2019unité 8, quand les lettres sont sues et qu\u2019on peut enfin regarder ce qu\u2019elles FONT.</p></div>';

  /* ⚠️ Le badge compte les notions PAS ENCORE RÉVISÉES AUJOURD'HUI (g.maj, posé par finishReview) :
     il descend comme celui du vocabulaire, que le tutoriel décrit ainsi. La séance, elle, reste
     gramFile(null). (journal : ui/reviser.js · grammaireHubHTML, le badge qui mentait) */
  var nb=notionsGram().filter(function(x){
    var g=S.revGram&&S.revGram[x.u];
    return !g||g.maj!==today();
  }).length;
  var lignes=N.map(function(x){
    var m=gramMaitrise(x.u), pc=Math.round(Math.max(0,m)*100);
    /* sans séance jouée, pas de « 0 % » (il se lirait « tu ne sais rien ») */
    var jauge=(m<0)
      ? '<div class="wfr" style="margin-top:5px">pas encore révisée</div>'
      : '<div class="ubar" title="'+pc+' % de réussite"><i style="width:'+pc+'%"></i></div>';
    return '<div class="wrow">'+
      '<span class="gnum">'+toAr(UNITS[x.u].no)+'</span>'+
      '<div class="wtx"><div class="gtt">'+x.titre+'</div>'+
        /* ⚠️ « % de réussite », jamais un pourcentage nu : c'est un taux sur les écrans vus, pas une
           couverture de la notion (journal : ui/reviser.js · grammaireHubHTML, « % de réussite ») */
        '<div class="wfr">'+x.sous+(m<0?'':' \u00b7 '+pc+' % de réussite')+'</div>'+jauge+'</div>'+
      '<button class="wpen" onclick="startGrammarTargeted('+x.u+')" '+
        'aria-label="S\u2019entraîner sur cette notion">\u270f\ufe0f</button>'+
    '</div>';
  }).join('');

  return '<div class="ccard">'+
    '<div style="display:flex;gap:10px;align-items:center;max-width:340px;margin:0 auto">'+
        '<button class="cbtn revbtn" style="flex:1;margin:0" onclick="startGrammarReview()">'+
          (nb?'<span>Réviser</span><span class="revcount"><i>'+nb+'</i></span>':'S\u2019entraîner')+'</button>'+
    '</div>'+
    '<p style="color:var(--muted);font-family:var(--ui);font-size:12.5px;text-align:center;margin:9px 0 2px">'+
      'Une séance qui mêle toutes tes notions</p>'+
    '<div class="wlist">'+lignes+'</div></div>';
}

function renderReviser(sub){
  sub=sub||curReviserTab||'quran';curReviserTab=sub;
  const tabs=[['quran','<img class="itab-ic" src="'+ico('tab2-qoran')+'" alt="">','Le Qorān'],['lettres','<img class="itab-ic" src="'+ico('tab-crayon')+'" alt="">','Les lettres'],['vocab','<img class="itab-ic" src="'+ico('tab-cartes')+'" alt="">','Le vocabulaire'],['grammaire','<img class="itab-ic" src="'+ico('tab-parchemin')+'" alt="">','La grammaire']];
  const SR=SOURATES[curSourate]||SOURATES[0];
  const set=knownLetterSet(), pc=fatihaPct();
  let h='<div class="icontabs">'+tabs.map(function(t){
    return '<button class="itab'+(t[0]===sub?' active':'')+'" onclick="reviserTabTap(\''+t[0]+'\')">'+t[1]+'<span class="tip">'+t[2]+'</span></button>';
  }).join('')+'</div>';

  if(sub==='quran'){
    /* Cinq boîtes ; la sourate illuminée s'ouvre en plein écran par ouvrirLireSourate() (revision.js).
       Pas de bouton Récitateur ici : il est dans Paramètres. (journal : ui/reviser.js · renderReviser, les cinq boîtes) */
    h+='<div class="spick">'+
      '<div class="sbtn" onclick="event.stopPropagation();var m=document.getElementById(\'smenu\');if(m)m.classList.toggle(\'open\')">'+
        '<span style="font-family:var(--quran);font-size:19px;color:var(--gold)">'+SR.ar+'</span> '+SR.nom+
        '<span class="pct">lisible à '+pc+' %</span><span style="color:var(--gold2);font-weight:900">▾</span></div>'+
      '<div class="smenu" id="smenu">'+
        '<div class="srow cur"><span class="sar">'+SR.ar+'</span> '+SR.nom+' <span class="pct">'+pc+' %</span></div>'+
        [['الإخلاص','Al-Ikhlāṣ'],['الفلق','Al-Falaq'],['الناس','An-Nās']].map(function(x){
          return '<div class="srow lock"><span class="sar">'+x[0]+'</span> '+x[1]+' <span class="pct">🔒 0 %</span></div>';}).join('')+
        '<div class="shint">Une sourate se déverrouille dès que tu peux lire ses premiers mots</div>'+
      '</div></div>'+
      /* ⚠️ margin auto, pas 0 : une marge gauche en ligne battait le centrage bureau */
      '<div style="display:flex;align-items:center;gap:10px;margin:0 auto 12px"><div class="ubar" style="flex:1;margin:0"><i style="width:'+pc+'%"></i></div>'+
      '<b style="color:var(--gold2);font-family:var(--ui)">'+pc+' %</b></div>'+
      '<div class="rq-grille" id="rqGrille">'+BOITES.map(function(b,i){
        return '<button class="rq-boite" id="rqBx'+i+'" onclick="boiteTap('+i+')" aria-label="'+b.t+'">'+
          '<img src="'+ico(b.ic)+'" alt=""><span class="rq-lab">'+b.lab+'</span></button>';
      }).join('')+'</div>';
  }
  else if(sub==='lettres'){
    h+='<div class="ccard">'+letterGridHTML()+'</div>';
  }
  else if(sub==='vocab'){
    const vwords=allReviewWords();               // uniquement les mots APPRIS (leçon « Lire des mots » terminée)
    // Règle Myriam : jamais deux chiffres en contradiction. Avec l'échelonnement (§2.5), un mot neuf
    // hors quota n'est PAS dû aujourd'hui — il ne doit donc pas porter de point rouge.
    const dueSet=new Set(dueReviewWords().map(function(w){return w.w;}));
    const nDue=dueSet.size;                      // mots dus aujourd'hui — le chiffre DÉCRÉMENTE après chaque série
    const ordered=vwords.slice().sort(function(a,b){return (dueSet.has(b.w)?1:0)-(dueSet.has(a.w)?1:0);});
    const vlist=ordered.map(function(w){
      // Le 🔊 remplace l'emoji du mot : chaque icône dit ce qu'elle fait. Le point est toujours
      // réservé, pour aligner les ✏️. spkAudio, pas speak : il anime le haut-parleur de la ligne.
      // (journal : ui/reviser.js · renderReviser, le haut-parleur du vocabulaire)
      return '<div class="wrow" style="cursor:pointer" role="button" aria-label="Écouter '+w.fr.replace(/"/g,'')+'" onclick="spkAudio(\''+w.w+'\',this.querySelector(\'.wspk\'))">'+
        '<span class="wspk">'+spkSVG()+'</span>'+
        '<div class="wtx"><div class="ww">'+w.w+'</div><div class="wfr">'+w.fr+'</div></div>'+
        '<span class="wdot'+(dueSet.has(w.w)?'':' off')+'" title="à réviser aujourd\u2019hui"></span>'+
        '<button class="wpen" onclick="event.stopPropagation();openWrite(\''+w.w+'\')" aria-label="S\'entraîner à écrire">✏️</button>'+
      '</div>';
    }).join('');
    h+='<div class="ccard">'+
      '<div style="display:flex;gap:10px;align-items:center;max-width:340px;margin:0 auto">'+
        '<button class="cbtn revbtn" style="flex:1;margin:0" onclick="startReview()">'+(nDue?'<span>Réviser</span><span class="revcount"><i>'+nDue+'</i></span>':'S\u2019entraîner')+'</button>'+
        (vwords.length?'<button class="lg-help" onclick="vocabTut()" aria-label="À quoi servent ces signes ?">?</button>':'')+
      '</div>'+
      (vwords.length?'':'<p style="color:var(--muted);font-family:var(--ui);font-size:13.5px;text-align:center;margin:10px 0 0">Les mots apparaîtront ici après la leçon « Lire des mots ».</p>')+
      '<div class="wlist">'+vlist+'</div></div>';
  }
  else{
    h+=grammaireHubHTML();
  }
  document.getElementById('view-reviser').innerHTML=h;
  if(sub==='lettres')setTimeout(maybeShowLetterTut,80);
  if(sub==='vocab')setTimeout(maybeShowVocabTut,80);   // 1re ouverture seulement (S.tutVocab)
}
