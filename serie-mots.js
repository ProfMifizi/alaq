/* serie-mots.js — l'écran des 7 épis (constance.js) : le verset 2:261 s'illumine MOT À MOT pendant sa récitation, et se grossit à la loupe.
   (Myriam, 22/11 : « on doit pouvoir grossir le texte du Qoran et il doit s'illuminer au fur et à mesure de la lecture ».)

   · L'ILLUMINATION : le mot dit est dans une boîte presque blanche cerclée d'ambre, les mots déjà lus en noir, le verset passe à l'or clair —
     exactement le rendu du lecteur du Coran (coran.js, .cor-carte.joue) ; tout s'éteint à la fin du son ou quand on l'arrête.
   · LES REPÈRES (SERIE_MOTS_REPERES) : début et fin de chacun des 24 mots de 2:261, en ms, pour 8 des 17 voix — api.quran.com, recitations/<id>/
     by_ayah/2:261?fields=segments (Quran Foundation, relu le 22/11 : identique à src/content/donnees/horodatage-mots-baqara-261.json). L'écran joue
     le fichier de cdn.islamic.network, pas celui de quran.com : 6 voix l'ont IDENTIQUE à l'octet ; al-Ḥuṣarī (défaut) est le même enregistrement
     en 128 k au lieu de 64 k, 26 ms plus tard ; ash-Shuraym, 12 ms plus tôt (corrélation croisée mesurée) — d'où `o`, le décalage ajouté. `d` : la
     durée du fichier joué : si elle diffère de plus de 1,5 s, on n'allume RIEN (un autre fichier = d'autres repères).
   · LES 9 AUTRES VOIX n'ont aucun repère chez quran.com : une ESTIMATION (le profil médian des 8, étiré sur la durée du fichier, entrée 0,5 s et
     sortie 0,4 s) — juste à un mot près, jamais exacte. Seule al-Ḥuṣarī al-mujawwad, trop étirée, n'en a pas.
   · Rien n'est récupéré à la volée : les repères sont ICI, la page marche sans réseau (ce fichier est dans CORE de sw.js).
   · LA LOUPE : la même que celle du lecteur (src/player/loupe-globale.js, brancherLoupeSerie, par le pont window.__alaqLoupeSerie) ; le bouton se
     pose dans #streakRang, au-dessus de CONTINUER.

   Script classique, chargé APRÈS coran.js (le dernier des classiques) : constance.js l'appelle À L'APPEL, derrière typeof — absent, l'écran des 7 épis
   marche comme avant. AU CHARGEMENT : rien n'est lu ni écrit. ⛔ Ni defer, ni module, ni import, ni export.
   À L'APPEL : _sndGen, _curAudio (son.js) · qariCur (revision.js) · window.__alaqLoupeSerie (src/entree.js).
   Garde : outils/verifier-fin-serie.mjs (le calcul), outils/verifier-fin-serie-chrome.mjs (l'écran, un vrai son).
   (journal : serie-mots.js · l'écran des 7 épis s'illumine et se grossit) */

const SERIE_MOTS_REPERES={
 'ar.abdulbasitmurattal':{d:27956,o:0,m:[[600,1070],[1080,2130],[2140,3860],[3870,5320],[5330,5740],[5750,6590],[6600,7350],[7360,8090],[8100,9090],[9100,10630],[10640,11270],[11280,12240],[12250,12610],[12620,13140],[13150,15590],[15600,16040],[16050,17500],[18450,19370],[19380,20380],[20390,21580],[21590,24100],[24450,25380],[25390,26490],[26500,27400]]},
 'ar.abdurrahmaansudais':{d:21290,o:0,m:[[190,630],[640,1420],[1430,2640],[2650,3890],[3900,4190],[4200,4860],[4870,5480],[5490,6170],[6180,7110],[7120,8130],[8140,8720],[8730,10120],[10130,10440],[10450,10970],[10980,12610],[12620,13100],[13110,14100],[14110,15050],[15060,15940],[15950,16730],[16740,18500],[18510,19450],[19460,20380],[20390,21040]]},
 'ar.shaatree':{d:27254,o:0,m:[[650,1170],[1180,1950],[1960,3610],[3620,4860],[4870,5200],[5210,6010],[6020,6730],[6740,7460],[7470,8470],[8480,11720],[11730,12390],[12400,13350],[13360,13720],[13730,14290],[14300,15580],[15590,16720],[16730,18080],[18090,18960],[18970,19990],[20000,21230],[21240,23530],[23540,24480],[24490,25320],[25330,26990]]},
 'ar.hanirifai':{d:27147,o:0,m:[[650,1300],[1310,2320],[2330,3870],[3880,5300],[5310,5650],[5660,6520],[6530,7290],[7300,8190],[8200,9340],[9350,10630],[10640,11200],[11210,12820],[12830,13210],[13220,13850],[13860,15960],[15970,16500],[16510,17760],[17770,18740],[18750,19830],[19840,20930],[20940,23260],[23270,24310],[24320,25280],[25290,26930]]},
 'ar.husary':{d:39009,o:26,m:[[1000,1540],[1550,2600],[2610,4510],[4520,6280],[6290,6800],[6810,7870],[7880,8770],[8780,9680],[9690,10950],[10960,12510],[12520,13420],[13430,14700],[14710,15230],[15240,16030],[16040,18780],[18790,19330],[19340,21350],[23800,24790],[24800,26100],[26110,27480],[27490,31050],[31450,32720],[32730,33850],[33860,36200]]},
 'ar.alafasy':{d:23921,o:0,m:[[160,630],[640,1480],[1490,3030],[3040,4190],[4200,4550],[4560,5290],[5300,5980],[5990,6650],[6660,7630],[7640,8890],[8900,9530],[9540,10400],[10410,10740],[10750,11300],[11310,13640],[13650,14020],[14030,15150],[15160,16030],[16040,17000],[17010,17930],[17940,20340],[20350,21240],[21250,22040],[22050,23560]]},
 'ar.minshawi':{d:34908,o:0,m:[[1200,1890],[1900,3160],[3170,5070],[5080,6900],[6910,7420],[7430,8530],[8540,9530],[9540,10490],[10500,11930],[11940,13720],[13730,14600],[14610,15880],[15890,16420],[16430,17180],[17190,19030],[19040,20770],[20780,22800],[23500,24670],[24680,26000],[26010,27430],[27440,30400],[30410,31840],[31850,33140],[33150,34100]]},
 'ar.saoodshuraym':{d:22937,o:-12,m:[[60,460],[470,1130],[1140,2210],[2220,3230],[3240,3550],[3560,4200],[4210,4760],[4770,5390],[5400,6200],[6210,7110],[7120,7620],[7630,12520],[12530,12810],[12820,13270],[13280,14720],[14730,15140],[15150,16040],[16050,16830],[16840,17680],[17690,18340],[18350,19990],[20000,20830],[20840,21580],[21590,22580]]}
};
/* le profil médian des 8 voix : début et fin de chaque mot, en fraction de l'étendue [début du 1er mot, fin du dernier] */
const SERIE_MOTS_PROFIL={s:[0.0000,0.0203,0.0572,0.1180,0.1731,0.1887,0.2214,0.2507,0.2788,0.3184,0.3774,0.4013,0.4550,0.4706,0.4943,0.5718,0.5993,0.6641,0.6981,0.7365,0.7825,0.8738,0.9139,0.9468],e:[0.0199,0.0567,0.1176,0.1727,0.1883,0.2210,0.2503,0.2784,0.3180,0.3770,0.4009,0.4546,0.4703,0.4940,0.5714,0.5990,0.6538,0.6978,0.7362,0.7821,0.8728,0.9135,0.9464,1.0000]};
const SERIE_MOTS_SANS_ESTIMATION={'ar.husarymujawwad':1};
let _smLoupe=null, _smTimer=0, _smJeton=0;

/* le mot dit à l'instant ms : -1 avant le premier ; un mot reste allumé jusqu'au début du suivant (comme le lecteur du Coran, 40 ms d'avance) */
function serieMotsIndice(m,ms){ var q=-1; for(var i=0;i<m.length;i++)if(ms>=m[i][0]-40)q=i; return q; }

/* les repères du fichier JOUÉ par la voix v : { m:[[début,fin]…] en ms du fichier, exact } ; null = n'allumer rien.
   dur : la durée du fichier en ms (0 tant qu'elle est inconnue) */
function serieMotsReperes(v,dur){
  var R=SERIE_MOTS_REPERES[v], P=SERIE_MOTS_PROFIL;
  if(R){
    if(dur&&Math.abs(dur-R.d)>1500)return null;
    return {exact:true, m:R.m.map(function(x){ return [x[0]+R.o,x[1]+R.o]; })};
  }
  if(SERIE_MOTS_SANS_ESTIMATION[v]||!(dur>2000))return null;
  var lead=500, span=dur-lead-400;
  return {exact:false, m:P.s.map(function(s,i){ return [Math.round(lead+s*span),Math.round(lead+P.e[i]*span)]; })};
}

/* les 24 mots du verset, chacun dans son <span class="stk-mot"> (un signe de pause seul rejoint le mot d'avant) ; null si le texte n'est plus celui des repères */
function serieMotsPreparer(){
  var p=document.getElementById('streakVerse'); if(!p)return null;
  if(p._smMots)return p._smMots;
  var mots=[]; p.textContent.trim().split(/\s+/).forEach(function(t){
    if(/^[\u06D6-\u06DC]+$/.test(t)&&mots.length)mots[mots.length-1]+=' '+t; else mots.push(t); });
  if(mots.length!==SERIE_MOTS_REPERES['ar.husary'].m.length)return null;
  p.textContent='';
  p._smMots=mots.map(function(w,i){
    var s=document.createElement('span'); s.className='stk-mot'; s.dataset.j=i; s.textContent=w;
    if(i)p.appendChild(document.createTextNode(' ')); p.appendChild(s); return s; });
  return p._smMots;
}

/* à l'ouverture de l'écran : les mots prêts, la loupe branchée (une fois) et éteinte */
function serieMotsOuvrir(){
  serieMotsPreparer();
  var ecran=document.getElementById('streak'), rang=document.getElementById('streakRang'), v=document.getElementById('streakVerse');
  if(!_smLoupe&&typeof window.__alaqLoupeSerie==='function')_smLoupe=window.__alaqLoupeSerie(ecran,rang,v);
  if(_smLoupe){ _smLoupe.eteindre(); _smLoupe.majBouton(); }
}
function serieMotsFermer(){ serieMotsArret(); if(_smLoupe)_smLoupe.eteindre(); }

function serieMotsArret(){
  clearInterval(_smTimer); _smTimer=0; _smJeton++;
  var p=document.getElementById('streakVerse'); if(!p)return;
  p.classList.remove('joue');
  [].forEach.call(p.querySelectorAll('.stk-mot'),function(m){ m.classList.remove('en','lu'); });
}

/* allume les mots au fil du son a (celui qu'on vient de lancer). Un tour périmé (autre son, écran quitté) sort sans rien toucher. */
function serieMotsSuivre(a){
  serieMotsArret();
  var mots=serieMotsPreparer(), p=document.getElementById('streakVerse'); if(!mots||!a)return;
  var jeton=_smJeton, gen=_sndGen, voix=qariCur().id, rep=null, q=-2, t0=Date.now();
  _smTimer=setInterval(function(){
    if(jeton!==_smJeton)return;
    if(gen!==_sndGen||_curAudio!==a||a.ended||a.error){ serieMotsArret(); return; }   // un autre son, la fin, ou un son qui ne vient pas (hors ligne)
    if(!rep){
      var d=isFinite(a.duration)?a.duration*1000:0;
      if(!d&&Date.now()-t0<8000)return;                       // la durée n'est pas encore connue
      rep=serieMotsReperes(voix,d);
      if(!rep){ serieMotsArret(); return; }
    }
    var i=serieMotsIndice(rep.m,a.currentTime*1000);
    if(i===q)return; q=i;
    p.classList.toggle('joue',i>=0);
    mots.forEach(function(m,j){ m.classList.toggle('en',j===i); m.classList.toggle('lu',j<i); });
    if(i>=0&&_smLoupe&&_smLoupe.allumee()){                   // agrandi, le verset défile : le mot dit reste à l'écran
      var r=mots[i].getBoundingClientRect();
      if(r.top<90||r.bottom>window.innerHeight-90)mots[i].scrollIntoView({block:'center',behavior:window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    }
  },40);
}
