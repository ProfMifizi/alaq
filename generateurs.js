/* generateurs.js — ce qui fabrique la file d'écrans d'une leçon.
   Neuf constructeurs, un par disque type : buildAlphabet, buildMemo, buildSpot,
   buildForms, buildHarakat, buildMadd, buildWords, buildWrite, buildBilan — plus
   buildReview (la Révision). Et leurs outils : shuffle/rnd/weightedShuffle, mcq,
   balancePos, wordSoundOptions/audioKey, leconSyllabes.

   Script classique, ni defer ni module : parcours.js référence ces constructeurs dans
   sa table des disques, évaluée au premier rendu (showTab('home') → renderHome →
   discsFor, en synchrone). ⚠️ progression.js reconnaît un disque par identité de
   fonction (d.build === buildForms) : une seconde définition les ferait diverger.

   À l'appel seulement (un générateur n'est appelé qu'au doigt, via startDisque) :
   UNITS, FATIHA, HK, MD, maddSyl, formGlyph, joinsL, sameLetter (donnees.js) · S
   (progression.js) · letAr, splitUnits (src/ecrans, module) · buildVerseTiles (revision.js).
   Gardes : outils/verifier-lecons.mjs, previews/_verif_lecons.html. */

/* ================= GÉNÉRATEURS ================= */
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function rnd(a){return a[Math.floor(Math.random()*a.length)];}
// Répétition espacée légère : plus un item a été raté, plus il ressort en révision.
function errWeight(k){ return 1+3*Math.min(4,(S.err&&S.err[k])||0); }
function weightedShuffle(arr,keyf){
  return arr.map(a=>({a,r:-Math.log(Math.random())/errWeight(keyf(a))}))
            .sort((u,v)=>u.r-v.r).map(o=>o.a);
}

function mcq(o){o.type='mcq';return o;}

// Place la bonne réponse à une position tournante (0,1,2,0,1,2…) pour éviter
// qu'elle tombe trop souvent au même endroit. opts = tableau d'options, ans = clé correcte.
let _lastPos=-1;
function balancePos(opts,ansKey){
  const n=opts.length;
  const ai=opts.findIndex(o=>o.key===ansKey);
  if(ai<0)return opts;
  let target=Math.floor(Math.random()*n);
  if(n>1&&target===_lastPos)target=(target+1+Math.floor(Math.random()*(n-1)))%n;
  _lastPos=target;
  const arr=opts.slice();
  const[a]=arr.splice(ai,1);
  arr.splice(target,0,a);
  return arr;
}

// « Touche le bon son » : les 3 options doivent sonner différemment. Pas de quasi-homographes :
// d'autres mots de l'unité, aux clés audio distinctes (chedda ignorée).
// (journal : generateurs.js · wordSoundOptions et la voix de synthèse)
function audioKey(s){ return (s||'').normalize('NFC').replace(/\u0651/g,''); }
function wordSoundOptions(U,w){
  const used=new Set([audioKey(w.w)]);
  const others=[];
  for(const x of shuffle(U.words||[])){
    const xk=audioKey(x.w);
    if(x.w===w.w||used.has(xk))continue;
    used.add(xk); others.push(x.w);
    if(others.length>=2)break;
  }
  return balancePos(shuffle([{snd:w.w,key:w.w},...others.map(p=>({snd:p,key:p}))]),w.w);
}

const NONATTACH=['ا','د','ذ','ر','ز','و'];

function buildAlphabet(U){
  // Le titre est l'instruction, jamais lu : seul l'arabe sonne. (journal : generateurs.js · leçon 1 v2)
  const q=[
   {type:'tapset',title:'Touche 3 des 28 lettres de l\u2019alphabet',items:[],alphabet:true,cols:4},
   {type:'harakat3',title:'Révèle les harakat'},
   {type:'fuse',title:'Associe lettres et harakat',L:'م',jeux:[
     {chip:'\u064E',fus:'مَ',son:'mim-fatha-son-court.mp3'},
     {chip:'\u0650',fus:'مِ',son:'mim-kasra-son-court.mp3'},
     {chip:'\u064F',fus:'مُ',son:'mim-damma-son-court.mp3'}]},
   {type:'tapset',title:'Touche les 3 lettres de prolongation',items:[['ا'],['و'],['ي']],cols:3,nolabel:true},
   {type:'findset',title:'Retrouve les 3 prolongations',targets:['ا','و','ي'],highlight:false},
   {type:'fuse',title:'Associe lettres et prolongations',L:'م',jeux:[
     {chip:'ا',fus:'مَا',son:'mim-alif-son-prolonge.mp3'},
     {chip:'ي',fus:'مِي',son:'mim-ya-son-prolonge.mp3'},
     {chip:'و',fus:'مُو',son:'mim-waw-son-prolonge.mp3'}]},
   {type:'selson',title:'Sélectionne les sons courts',bons:['مَ','مِ','مُ'],
     tous:['مَا','مَ','مِي','مُو','مِ','مُ'],
     corr:'Les sons courts : <span class="ar">مَ · مِ · مُ</span>'},
   {type:'selson',title:'Sélectionne les sons longs',bons:['مَا','مِي','مُو'],
     tous:['مِ','مَا','مُ','مِي','مَ','مُو'],
     corr:'Les sons longs : <span class="ar">مَا · مِي · مُو</span>'},
   {type:'formslide',L:'م',title:'Fais glisser la lettre\u00A0<span class="ar">م</span>'},
   {type:'read',word:'مَدْرَسَةٌ',lang:'ar',dir:'rtl',title:'Révèle le mot'},
   mcq({prompt:'L\u2019alphabet arabe comporte :',mute:true,graded:true,grid:'grid3',answer:'28',explain:'L\u2019alphabet arabe compte 28 lettres.',
     options:shuffle([{txt:'26 lettres',key:'26'},{txt:'28 lettres',key:'28'},{txt:'30 lettres',key:'30'}])}),
   mcq({prompt:'Comment s\u2019appellent ces signes ?',mute:true,signes:true,graded:true,answer:'h',explain:'Les harakat sont les petits signes au-dessus ou en dessous de la lettre : fatḥa « a », kasra « i », ḍamma « ou ».',
     options:shuffle([{txt:'Les harakat',key:'h'},{txt:'Des lettres spéciales',key:'l'},{txt:'Des accents',key:'a'}])}),
   mcq({prompt:'Combien de lettres de prolongation ?',mute:true,graded:true,grid:'grid3',answer:'3',explain:'Il y a 3 lettres de prolongation, qui prolongent le son.',
     options:shuffle([{txt:'3',key:'3'},{txt:'2',key:'2'},{txt:'4',key:'4'}])}),
   mcq({prompt:'Quelles sont les prolongations ?',mute:true,graded:true,answer:'awy',explain:'L\u2019alif <span class="ar">ا</span>, le wāw <span class="ar">و</span> et le yā\u2019 <span class="ar">ي</span> étirent la voyelle qui précède.',
     options:shuffle([{ar:'ا و ي',key:'awy'},{ar:'م ل ن',key:'mln'},{ar:'ب ت ث',key:'btt'}])}),
   mcq({prompt:'Comment lit-on l\u2019arabe ?',mute:true,graded:true,answer:'rtl',explain:'L\u2019arabe se lit et s\u2019écrit de droite à gauche, à l\u2019inverse du français.',
     options:shuffle([{txt:'De droite à gauche',key:'rtl'},{txt:'De gauche à droite',key:'ltr'}])}),
  ];
  return q;
}

/* Leçon 2 « Mémoriser » : cartes, bulles, repérage, quiz dans les deux sens, tracé.
   ⚠️ Sert les 7 unités : jamais de م ل ن en dur. (journal : generateurs.js · leçon 2 v2, « Mémoriser » refondue) */
function buildMemo(U){
  const q=[];
  U.letters.forEach(L=>q.push({type:'learn',L,mute:true}));  // le français n'est JAMAIS lu (doctrine) — le titre suffit
  q.push({type:'bulles',lettres:U.letters.slice(),parLettre:5});
  q.push({type:'findset',title:'Retrouve tes '+U.letters.length+' lettres',
    targets:U.letters.slice(),highlight:false,greyEnd:true});
  // le son → la lettre
  shuffle(U.letters).forEach(L=>q.push(mcq({
    prompt:'Choisis la bonne lettre',mute:true,spk:L,graded:true,grid:'grid3',answer:L,
    options:balancePos(shuffle(U.letters).map(x=>({ar:x,key:x})),L)})));
  // la lettre → le son : 3 haut-parleurs qui sonnent de DROITE à GAUCHE
  shuffle(U.letters).forEach(L=>q.push(mcq({
    prompt:'Choisis le bon nom de la lettre',mute:true,glyph:L,spkOpts:true,
    graded:true,grid:'grid3 rtl3',answer:L,
    options:balancePos(shuffle(U.letters).map(x=>({snd:x,key:x})),L)})));
  U.letters.forEach(L=>q.push({type:'trace',L}));
  return q;
}

function buildSpot(U){
  const q=[];
  FATIHA.forEach((v,vi)=>{
    U.letters.forEach(L=>{ if([...strip(v)].some(ch=>sameLetter(ch,L))) q.push({type:'spot',vi,L,mute:true}); });
  });
  return q;
}

function buildForms(U){
  /* Chaque lettre : la glisser dans ses cases, l'écrire dans ses formes ; puis les
     bulles-formes et les deux quiz de la leçon 2. (journal : generateurs.js · leçon 3, refonte des formes) */
  const q=[];
  U.letters.forEach(L=>{
    q.push({type:'formslide',L,title:'Fais glisser la lettre\u00A0'+letAr(L)});
    q.push({type:'trace',L});
    /* Lettres qui ne s'attachent qu'à droite (أ و ر د ذ…) : début = isolée, milieu = fin ;
       seules les formes distinctes s'écrivent (pas de tracé début/milieu pour elles). */
    (joinsL(L)?[1,2,3]:[3]).forEach(p=>q.push({type:'trace',L,pos:p}));
  });
  q.push({type:'bulles',lettres:U.letters.slice(),formes:true});
  let pc=Math.floor(Math.random()*3); const nextPos=()=>1+(pc++%3);
  // le nom sonne tout seul (voix choisie), les 3 réponses sont des formes déguisées
  shuffle(U.letters).forEach(L=>{
    const ps=shuffle([1,2,3]);
    q.push(mcq({prompt:'Choisis la bonne lettre',mute:true,spk:L,graded:true,grid:'grid3',answer:L,
      options:balancePos(shuffle(U.letters).map((x,k)=>({ar:formGlyph(x,ps[k%3]),key:x})),L)}));
  });
  // une forme en grand, 3 haut-parleurs qui sonnent de droite à gauche (grille rtl)
  shuffle(U.letters).forEach(L=>q.push(mcq({prompt:'Choisis le bon nom de la lettre',mute:true,
    glyph:formGlyph(L,nextPos()),spkOpts:true,graded:true,grid:'grid3 rtl3',answer:L,
    options:balancePos(shuffle(U.letters).map(x=>({snd:x,key:x})),L)})));
  return q;
}

function sylHK(L,h){return L+h;}
/* Leçons 5 et 6, un seul moteur : un « fuse » par lettre, les bulles-syllabes, puis chaque
   syllabe testée une fois (moitié son → écrit, moitié écrit → son). Distracteurs : même
   lettre autre signe + autre lettre même signe. (journal : generateurs.js · leçons 5 et 6 v2, les syllabes) */
function leconSyllabes(U,paires,fabrique,titreFuse){
  const q=[];
  U.letters.forEach(L=>q.push({type:'fuse',L,mute:true,title:titreFuse+'\u00A0'+letAr(L),
    jeux:paires.map(p=>({chip:p[0],fus:fabrique(L,p[0])}))}));
  const syls=[];U.letters.forEach(L=>paires.forEach(p=>syls.push(fabrique(L,p[0]))));
  q.push({type:'bulles',syllabes:syls.slice()});
  const ordre=shuffle(syls.slice()), nEcrit=Math.ceil(ordre.length/2);
  ordre.forEach((s,k)=>{
    /* ⚠️ retrouver (lettre, signe) en balayant, jamais via s[0] : إِ et آ ne commencent
       pas par la lettre de la table */
    let L=null,pMien=null;
    U.letters.forEach(l=>paires.forEach(p=>{ if(fabrique(l,p[0])===s){L=l;pMien=p[0];} }));
    const pAutre=shuffle(paires.filter(p=>p[0]!==pMien))[0][0];
    const lAutre=shuffle(U.letters.filter(x=>x!==L))[0];
    const opts=[s,fabrique(L,pAutre),fabrique(lAutre,pMien)];
    if(k<nEcrit)q.push(mcq({prompt:'Choisis la bonne écriture',mute:true,spk:s,graded:true,grid:'grid3',answer:s,
      options:balancePos(shuffle(opts.map(x=>({ar:x,key:x}))),s)}));
    else q.push(mcq({prompt:'Choisis le bon son',mute:true,glyph:s,spkOpts:true,graded:true,grid:'grid3 rtl3',answer:s,
      options:balancePos(shuffle(opts.map(x=>({snd:x,key:x}))),s)}));
  });
  return q;
}
function sylHKG(L,h){ return (L==='أ'&&h==='\u0650')?'إِ':L+h; }    // la kasra porte la hamza dessous : أِ n'existe pas — partagée leçon 5 + bilan
function sylMDG(L,m){ if(L==='أ'&&m==='ا')return 'آ'; if(L==='أ'&&m==='ي')return 'إِي'; return maddSyl(L,m); } // hamza : آ (jamais أَا) et إِي (jamais أِي) — partagée leçon 6 + bilan
function buildHarakat(U){ return leconSyllabes(U,HK,sylHKG,'Glisse les harakat sur la lettre'); }

function buildMadd(U){ return leconSyllabes(U,MD,sylMDG,'Glisse les prolongations sur la lettre'); }
function buildMaddANCIEN(U){ // plus appelé — à jeter avec l'accord de Myriam
  const q=[];
  U.letters.forEach(L=>{
    const syls=MD.map(m=>maddSyl(L,m[0]));
    q.push({type:'explore',items:MD.map(m=>({ar:maddSyl(L,m[0]),lab:U.lat[L]+m[1],say:maddSyl(L,m[0])})),min:3,
      title:''});
    for(let r=0;r<3;r++){
      const a1=syls[r%syls.length];
      q.push(mcq({prompt:'Écoute… puis touche la bonne syllabe',audio:a1,graded:true,grid:'grid3',answer:a1,
        options:balancePos(shuffle(syls).map(s=>({ar:s,key:s})),a1)}));
    }
    for(let r=0;r<3;r++){
      const a2=syls[r%syls.length];
      q.push(mcq({prompt:'Comment se lit cette syllabe ?',glyph:a2,graded:true,grid:'grid3',answer:a2,
        options:balancePos(shuffle(syls).map(s=>({snd:s,key:s})),a2)}));
    }
  });
  const ALL=[];U.letters.forEach(L=>MD.forEach(m=>ALL.push(maddSyl(L,m[0]))));
  for(let i=0;i<8;i++){
    const a=ALL[i%ALL.length];
    q.push(mcq({prompt:'Quiz mélangé : écoute… puis touche',audio:a,graded:true,grid:'grid3',answer:a,
      options:balancePos(shuffle([a, ...shuffle(ALL.filter(x=>x!==a)).slice(0,2)]).map(s=>({ar:s,key:s})),a)}));
  }
  for(let i=0;i<4;i++){
    const a=ALL[(i*2)%ALL.length];
    q.push(mcq({prompt:'Comment se lit cette syllabe ?',glyph:a,graded:true,grid:'grid3',answer:a,
      options:balancePos(shuffle([a, ...shuffle(ALL.filter(x=>x!==a)).slice(0,2)]).map(s=>({snd:s,key:s})),a)}));
  }
  return q;
}

/* Leçon 7 « Lire des mots », construite sur U.words / U.letters pour les 7 unités.
   Ni traduction ni emoji ; les signes se manipulent, une seule fois, en unité 1.
   (journal : generateurs.js · leçon 7 « Lire des mots » v3) */
function buildWords(U){
  const SUK='ْ', CHD='ّ', TAN='ٌ', FAT='َ', TAT='ـ';
  const ui=UNITS.indexOf(U), q=[], W=(U.words||[]).slice();
  const porte=(m,sig)=>m.w.indexOf(sig)>-1;
  /* les mots DÉJÀ lisibles : cette unité + les précédentes (le tri et les leurres y puisent) */
  const dejaVus=[]; for(let k=0;k<=ui;k++)if(UNITS[k]&&UNITS[k].words)dejaVus.push(...UNITS[k].words);

  /* ── A · LES SIGNES SE GLISSENT (unité 1 seulement : c'est là qu'ils sont neufs) ──
     Le أَ est grisé et n'est JAMAIS une cible ; la chedda arrive sur une lettre qui
     porte déjà sa fatha (design de Myriam). Le son de chaque groupe est SA syllabe. */
  if(ui===0){
    const SIGNES=[
      {chip:TAT+SUK, nom:'le soukoun',    cib:L=>L,       fin:L=>L+SUK},
      {chip:TAT+CHD, nom:'la chedda',     cib:L=>L+FAT,   fin:L=>L+CHD+FAT},
      {chip:TAT+TAN, nom:'le dhammatayn', cib:L=>L,       fin:L=>L+TAN},
    ];
    SIGNES.forEach(sg=>q.push({type:'place',mute:true,chip:sg.chip,nom:sg.nom,
      grps:U.letters.map(L=>({pre:'أَ',cib:sg.cib(L),fin:sg.fin(L)}))}));
  }

  /* ── B · ÉCOUTE → 2 ÉCRITURES : le même mot avec et sans son signe ──
     La variante se FABRIQUE (chedda retirée · soukoun devenu fatha · tanwīn retiré) :
     aucune liste à la main, les 7 unités sont servies. */
  const varSansSigne=(w,sig)=>{
    if(sig===CHD)return w.replace(CHD,'');
    if(sig===SUK)return w.replace(SUK,FAT);
    return w.replace(new RegExp(TAN+'$'),'');
  };
  const prisB={};
  [CHD,SUK,TAN].forEach(sig=>{
    const cands=W.filter(m=>porte(m,sig)&&!prisB[m.w]);
    if(!cands.length)return;
    const m=cands[0], autre=varSansSigne(m.w,sig);
    if(autre===m.w||dejaVus.some(x=>x.w===autre))return;   // jamais un VRAI mot comme leurre
    prisB[m.w]=1;
    q.push(mcq({prompt:'Choisis la bonne écriture',mute:true,spk:m.w,graded:true,grid:'grid2',answer:m.w,
      options:shuffle([{ar:m.w,key:m.w},{ar:autre,key:autre}])}));
  });

  /* ── C · « TOUCHE LE MOT QUI PORTE… » : reconnaître un signe DANS un mot ── */
  [[SUK,'un soukoun'],[CHD,'une chedda'],[TAN,'un tanwīn']].forEach(pair=>{
    const sig=pair[0];
    const bons=W.filter(m=>porte(m,sig)), autres=W.filter(m=>!porte(m,sig));
    if(!bons.length||autres.length<2)return;
    const bon=rnd(bons), lot=shuffle(autres).slice(0,2);
    q.push(mcq({prompt:'Touche le mot qui porte '+pair[1],mute:true,graded:true,grid:'grid3',answer:bon.w,
      options:balancePos(shuffle([bon,...lot].map(x=>({ar:x.w,key:x.w}))),bon.w)}));
  });

  /* ── D · LES MOTS : « Choisis le bon mot » (écrit → 3 sons) et « la bonne écriture »
     (son → 3 écrits). Un mot par écran, en alternance, jamais deux fois le même. ── */
  shuffle(W).slice(0,5).forEach((m,k)=>{   // 5 mots, comme la preview validée — pas les 9
    if(k%2===0)
      q.push(mcq({prompt:'Choisis le bon mot',mute:true,glyph:m.w,glyphLinear:true,spkOpts:true,graded:true,
        grid:'grid3 rtl3',answer:m.w,options:wordSoundOptions(U,m)}));
    else
      q.push(mcq({prompt:'Choisis la bonne écriture',mute:true,spk:m.w,graded:true,grid:'grid3',answer:m.w,
        options:balancePos(shuffle([m.w,...shuffle(W.filter(x=>x.w!==m.w)).slice(0,2).map(x=>x.w)])
          .map(x=>({ar:x,key:x})),m.w)}));
  });

  /* ── E · LES GROSSES BULLES-MOTS : seules celles qui portent le signe éclatent ──
     Un leurre touché SECOUE et reste (erreur d'exploration : jamais de cœur perdu). */
  {
    const NOMS={}; NOMS[SUK]='un soukoun'; NOMS[CHD]='une chedda'; NOMS[TAN]='un tanwīn';
    /* On choisit le signe dont les porteurs sont MINORITAIRES : chercher 8 mots sur 9
       ne fait rien chercher du tout. 2 ou 3 cibles pour 3 ou 4 leurres, 6 bulles en tout. */
    const cand=[SUK,CHD,TAN].map(sig=>({sig,bons:W.filter(m=>porte(m,sig))}))
      .filter(x=>x.bons.length>=2&&x.bons.length<=Math.floor(W.length/2))
      .sort((a,b)=>a.bons.length-b.bons.length)[0];
    if(cand){
      const cibles=shuffle(cand.bons).slice(0,3);
      const leurres=shuffle(W.filter(m=>!porte(m,cand.sig))).slice(0,6-cibles.length);
      q.push({type:'bulmots',mute:true,signe:NOMS[cand.sig],
        mots:shuffle([...cibles.map(m=>({w:m.w,cible:true})),
                      ...leurres.map(m=>({w:m.w,cible:false}))])});
    }
  }

  /* ── F · LE TRI : deux paniers de SIGNES (jamais leur nom écrit — retour de Myriam) ──
     On puise dans TOUS les mots déjà lisibles : 3 par panier dès l'unité 1. */
  {
    const parSigne={}; [SUK,CHD].forEach(sig=>{ parSigne[sig]=dejaVus.filter(m=>m.w.indexOf(sig)>-1); });
    /* Unité 1 : un seul mot porte un soukoun (نَمْلٌ). Les syllabes-signes qu'on vient de
       fabriquer à l'écran A complètent les paniers (leur son est dans SONS, son.js).
       Dès l'unité 2, les mots déjà lus suffisent : aucun ajout. */
    if(ui===0)U.letters.forEach(L=>{ parSigne[SUK].push({w:'أَ'+L+SUK}); parSigne[CHD].push({w:'أَ'+L+CHD+FAT}); });
    if(parSigne[SUK].length>=2&&parSigne[CHD].length>=2){
      const n=Math.min(3,parSigne[SUK].length,parSigne[CHD].length);
      /* ⚠️ Le signe du panier porte une vraie lettre (ن), pas un tatweel presque invisible ;
         jamais son nom écrit. (journal : generateurs.js · leçon 7 « Lire des mots » v3) */
      q.push({type:'tri',mute:true,
        paniers:[{sig:'ن'+SUK,cle:'s'},{sig:'ن'+CHD,cle:'c'}],
        mots:shuffle([...shuffle(parSigne[SUK]).slice(0,n).map(m=>({w:m.w,cle:'s'})),
                      ...shuffle(parSigne[CHD]).slice(0,n).map(m=>({w:m.w,cle:'c'}))])});
    }
  }

  // « Appuie sur ce que tu entends » : la partie du verset dont toutes les lettres sont connues
  if(U.vtiles){ const st=buildVerseTiles(U.vtiles.vi); if(st)q.push(st); }
  return q;
}

/* Leçon 8 « Écrire des mots » : écriture guidée, un écran par mot, du plus court au plus long.
   (journal : generateurs.js · leçons 8 et 9 v2) */
function buildWrite(U){
  return U.words.slice()
    .sort((a,b)=>splitUnits(a.w).length-splitUnits(b.w).length)
    .map(w=>({type:'assemble',w,graded:true,mute:true}));
}

/* Leçon 9 « Bilan » : chaque acquis testé une fois, par le jumeau de sa leçon
   (lettre → nom → forme → syllabe → prolongation → mot lu → mot écrit). */
function buildBilan(U){
  const q=[], L=shuffle(U.letters.slice());
  const l=i=>L[i%L.length];
  q.push(mcq({prompt:'Choisis la bonne lettre',mute:true,spk:l(0),graded:true,grid:'grid3',answer:l(0),
    options:balancePos(shuffle(U.letters).map(x=>({ar:x,key:x})),l(0))}));
  q.push(mcq({prompt:'Choisis le bon nom de la lettre',mute:true,glyph:formGlyph(l(1),1+Math.floor(Math.random()*3)),
    spkOpts:true,graded:true,grid:'grid3 rtl3',answer:l(1),
    options:balancePos(shuffle(U.letters).map(x=>({snd:x,key:x})),l(1))}));
  const ps=shuffle([1,2,3]);
  q.push(mcq({prompt:'Choisis la bonne lettre',mute:true,spk:l(2),graded:true,grid:'grid3',answer:l(2),
    options:balancePos(shuffle(U.letters).map((x,k)=>({ar:formGlyph(x,ps[k%3]),key:x})),l(2))}));
  const s4=sylHKG(l(0),rnd(HK)[0]);
  q.push(mcq({prompt:'Choisis la bonne écriture',mute:true,spk:s4,graded:true,grid:'grid3',answer:s4,
    options:balancePos(shuffle(HK.map(h=>{const s=sylHKG(l(0),h[0]);return {ar:s,key:s};})),s4)}));
  const s5=sylHKG(l(1),rnd(HK)[0]);
  q.push(mcq({prompt:'Choisis le bon son',mute:true,glyph:s5,spkOpts:true,graded:true,grid:'grid3 rtl3',answer:s5,
    options:balancePos(shuffle(HK.map(h=>{const s=sylHKG(l(1),h[0]);return {snd:s,key:s};})),s5)}));
  const s6=sylMDG(l(2),rnd(MD)[0]);
  q.push(mcq({prompt:'Choisis la bonne écriture',mute:true,spk:s6,graded:true,grid:'grid3',answer:s6,
    options:balancePos(shuffle(MD.map(m=>{const s=sylMDG(l(2),m[0]);return {ar:s,key:s};})),s6)}));
  const W=shuffle(U.words.slice());
  q.push(mcq({prompt:'Choisis le bon mot',mute:true,glyph:W[0].w,glyphLinear:true,spkOpts:true,graded:true,
    grid:'grid3 rtl3',answer:W[0].w,options:wordSoundOptions(U,W[0])}));
  q.push(mcq({prompt:'Choisis la bonne écriture',mute:true,spk:W[1].w,graded:true,grid:'grid3',answer:W[1].w,
    options:balancePos(shuffle([W[1],W[2],W[3]]).map(x=>({ar:x.w,key:x.w})),W[1].w)}));
  const parTaille=U.words.slice().sort((a,b)=>splitUnits(a.w).length-splitUnits(b.w).length);
  q.push({type:'assemble',w:parTaille[0],graded:true,mute:true});
  q.push({type:'assemble',w:parTaille[parTaille.length-1],graded:true,mute:true});
  return q;
}

// Révision cumulative : remplace le tour d'alphabet à partir de l'unité 2.
// Révise les lettres des unités PRÉCÉDENTES (reconnaissance début/milieu/fin,
// + avec un tachkīl) et fait réécrire des mots déjà vus.
function buildReview(U){
  const ui=UNITS.indexOf(U);
  const letters=[],words=[];
  for(let k=0;k<ui;k++){
    const P=UNITS[k];
    if(P.alpha)(P.letters||[]).forEach(L=>{ if(P.alpha[L])letters.push(L); });
    if(P.words)words.push(...P.words);
  }
  const q=[]; // pas d'écran d'annonce : on attaque directement
  const pick3=(pool,L,glyph)=>{
    const others=shuffle(pool.filter(x=>x!==L)).slice(0,2);
    return balancePos(shuffle([L,...others]).map(x=>({ar:glyph(x),key:x})),L);
  };
  /* ① jamais plus de REV_MAX écrans ; ② la part du mot grandit à chaque unité
     (U2 5/15 … U7 15/15), le reste des lettres est tiré au sort pondéré par les erreurs.
     (journal : generateurs.js · plafond 15 de la Révision) */
  const REV_MAX=15;
  const assezDeMots=words.length>=3;
  const nMots=assezDeMots?Math.min(REV_MAX,5+2*Math.max(0,ui-1)):0;
  const nLettres=REV_MAX-nMots;

  // ① ce qui reste de reconnaissance : positions ET syllabes dans le MÊME tirage pondéré
  const cands=[];
  letters.forEach(L=>[1,2,3].forEach(p=>cands.push({k:'pos',L:L,p:p})));
  const SYL=[];letters.forEach(L=>HK.forEach(h=>SYL.push(L+h[0])));
  SYL.forEach(s=>cands.push({k:'syl',s:s}));
  weightedShuffle(cands,c=>c.k==='pos'?c.L:c.s).slice(0,Math.max(0,nLettres)).forEach(c=>{
    if(c.k==='pos')q.push(mcq({prompt:'Touche la bonne lettre',spk:c.L,mute:true,graded:true,
      grid:'grid3',answer:c.L,options:pick3(letters,c.L,x=>formGlyph(x,c.p))}));
    else q.push(mcq({prompt:'Écoute… puis touche la bonne syllabe',spk:c.s,mute:true,graded:true,grid:'grid3',
      answer:c.s,options:shuffle([c.s,...shuffle(SYL.filter(x=>x!==c.s)).slice(0,2)]).map(s=>({ar:s,key:s}))}));
  });

  // ② le mot : on ALTERNE le lire (écouter puis choisir) et l'écrire (écriture guidée)
  if(nMots){
    const pool={words:words};
    const wsel=weightedShuffle(words,w=>w.w);
    for(let i=0;i<nMots;i++){
      const w=wsel[i%wsel.length];
      if(i%2===0)q.push(mcq({prompt:'Choisis le bon mot',mute:true,glyph:w.w,glyphLinear:true,spkOpts:true,
        graded:true,grid:'grid3 rtl3',answer:w.w,options:wordSoundOptions(pool,w)}));
      else q.push({type:'assemble',w:w,graded:true,mute:true});
    }
  }
  return shuffle(q).slice(0,REV_MAX);
}
