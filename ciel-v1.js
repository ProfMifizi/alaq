/* ═══ CIEL-V1 : la journée de marche ═══
   Bloc additif : il enveloppe renderHome et showTab, et écoute le défilement. Une sourate = une journée :
   la position sur le sentier (t = numéro d'unité + fraction parcourue) fixe l'heure, et les 12 heures se
   répartissent sur les unités présentes. Le retirer : ce bloc et son CSS jumeau. */
(function(){
'use strict';
var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* les douze heures : ciel, étoiles, lune, soleil, feu, dunes, encre */
function h(o){return Object.assign({st:0,mn:0,fi:0,ink:'#F0E6D2'},o);}
var CIEL=[
h({sky:['#1D2340','#41476F','#B98A6C'],st:.55,du:['#171226','#0E0B1C'],sun:{x:20,y:93,r:30,c:'#E8A57A',g:.30,op:1}}),
h({sky:['#2A3760','#7A5E74','#E29A5F'],st:.18,du:['#241A2C','#150F20'],sun:{x:24,y:84,r:19,c:'#FFC07E',g:.5,op:1}}),
h({sky:['#3E5C8F','#93A9C6','#E9CFA2'],du:['#8A6E4A','#6E5638'],ink:'#2E2314',sun:{x:32,y:52,r:15,c:'#FFDD9E',g:.55,op:1}}),
h({sky:['#4A6CA0','#A6BBD5','#F0DCB4'],du:['#96794F','#78603B'],ink:'#2E2314',sun:{x:42,y:34,r:14,c:'#FFE9AE',g:.6,op:1}}),
h({sky:['#5E82B0','#C2D0DF','#F4E8CD'],du:['#A0834F','#82683D'],ink:'#2E2314',sun:{x:52,y:25,r:17,c:'#FFEFA0',g:.85,op:1}}),
h({sky:['#54749F','#B2BED2','#EFD9B0'],du:['#97783F','#7A5F32'],ink:'#2E2314',sun:{x:64,y:34,r:14,c:'#FFE3A0',g:.6,op:1}}),
h({sky:['#4E5E8C','#9E90A2','#EBB47D'],du:['#8A6440','#6E4E30'],ink:'#2E2314',sun:{x:76,y:52,r:16,c:'#FFC985',g:.5,op:1}}),
h({sky:['#33356B','#7E5077','#F08A4E'],st:.12,fi:.30,du:['#3A2438','#241528'],sun:{x:86,y:80,r:18,c:'#FF9058',g:.55,op:1}}),
h({sky:['#262B58','#5E4468','#C06A55'],st:.35,fi:.55,du:['#221733','#150E22'],sun:{x:92,y:92,r:16,c:'#D95A38',g:.35,op:.45}}),
h({sky:['#1B2148','#39406E','#6E5470'],st:.6,mn:.55,fi:.80,du:['#161227','#0D0A1A'],sun:{x:96,y:100,r:14,c:'#8A3A2E',g:.2,op:0}}),
h({sky:['#141A3E','#2C3260','#463F63'],st:.85,mn:.85,fi:.92,du:['#120F22','#0A0817'],sun:{x:98,y:104,r:12,c:'#6B2E26',g:.1,op:0}}),
h({sky:['#0D1130','#1C2148','#2E2A4E'],st:1,mn:1,fi:1,du:['#100D1E','#080614'],sun:{x:100,y:106,r:12,c:'#6B2E26',g:.1,op:0}})
];

var W=document.getElementById('skyWrap'), BG=document.getElementById('skyBg'),
    ST=document.getElementById('skyStars'), SU=document.getElementById('skySun'),
    MO=document.getElementById('skyMoon'), FI=document.getElementById('skyFire'),
    CA=document.getElementById('skyCamp'), CV=document.getElementById('skyCarav'),
    D1=document.getElementById('skyD1'), D2=document.getElementById('skyD2');
if(!W) return;

var st='',k;
for(k=0;k<80;k++){var z=(Math.random()*1.6+0.6).toFixed(1);
  st+='<i style="left:'+(Math.random()*100).toFixed(1)+'%;top:'+(Math.random()*100).toFixed(1)+
      '%;width:'+z+'px;height:'+z+'px;animation-delay:'+(Math.random()*3.4).toFixed(1)+
      's;opacity:'+(Math.random()*0.6+0.3).toFixed(2)+'"></i>';}
ST.innerHTML=st;

function lerp(a,b,f){return a+(b-a)*f;}
function h2r(x){var n=parseInt(x.slice(1),16);return [(n>>16)&255,(n>>8)&255,n&255];}
function rs(a){return 'rgb('+Math.round(a[0])+','+Math.round(a[1])+','+Math.round(a[2])+')';}
function ra(a,l){return 'rgba('+Math.round(a[0])+','+Math.round(a[1])+','+Math.round(a[2])+','+l+')';}
function mix(x,y,f){var a=h2r(x),b=h2r(y);return [lerp(a[0],b[0],f),lerp(a[1],b[1],f),lerp(a[2],b[2],f)];}
function clair(c,t){return [lerp(c[0],255,t),lerp(c[1],255,t),lerp(c[2],255,t)];}
function c01(x){return x<0?0:(x>1?1:x);}

/* l'état du ciel à l'instant t (continu) : on mélange les deux heures encadrantes.
   ⚠️ L'ENCRE ne se mélange PAS linéairement — au milieu d'une unité on obtiendrait
   un gris illisible sur les deux fonds. Elle bascule au tiers du trajet. */
function trame(t){
  t=Math.max(0,Math.min(CIEL.length-1,t));
  var i=Math.floor(t), j=Math.min(i+1,CIEL.length-1), f=t-i, A=CIEL[i], B=CIEL[j];
  var fe=c01((f-0.35)/0.30);
  return {sky:[mix(A.sky[0],B.sky[0],f),mix(A.sky[1],B.sky[1],f),mix(A.sky[2],B.sky[2],f)],
    st:lerp(A.st,B.st,f), mn:lerp(A.mn,B.mn,f), fi:lerp(A.fi,B.fi,f),
    ink:mix(A.ink,B.ink,fe), du:[mix(A.du[0],B.du[0],f),mix(A.du[1],B.du[1],f)],
    sun:{x:lerp(A.sun.x,B.sun.x,f),y:lerp(A.sun.y,B.sun.y,f),r:lerp(A.sun.r,B.sun.r,f),
         c:mix(A.sun.c,B.sun.c,f),g:lerp(A.sun.g,B.sun.g,f),op:lerp(A.sun.op,B.sun.op,f)}};
}

/* l'ombre portée des pièces suit la course du soleil ; la nuit, c'est le feu de
   camp qui éclaire — par en dessous, donc l'ombre remonte */
var BAS=93, HAUT=25;
function ombre(F){
  var alt=c01((BAS-F.sun.y)/(BAS-HAUT)), L=6+(1-alt)*16, hx=(50-F.sun.x)/50;
  var x=L*hx, y=L*(0.30+0.55*alt), b=8+(1-alt)*10, a=0.18+(1-alt)*0.20;
  if(F.sun.op<1){var q=1-F.sun.op; x=lerp(x,0,q); y=lerp(y,4,q); b=lerp(b,13,q); a=lerp(a,.26,q);}
  var wf=F.fi*(1-F.sun.op);
  if(wf>0){x=lerp(x,0,wf); y=lerp(y,-7,wf); b=lerp(b,16,wf); a=lerp(a,.32,wf);}
  var R=document.documentElement.style;
  R.setProperty('--ciel-shx',x.toFixed(1)+'px'); R.setProperty('--ciel-shy',y.toFixed(1)+'px');
  R.setProperty('--ciel-shb',b.toFixed(1)+'px'); R.setProperty('--ciel-sha',a.toFixed(2));
}

/* La crête des dunes, mesurée sur le tracé réel plutôt que devinée : on échantillonne
   le bord supérieur de d1 et on interpole. Ainsi la caravane reste posée au sol quelle
   que soit la taille de l'écran, l'orientation ou la hauteur de la barre du bas. */
var CRETE=null;
function tableCrete(){
  if(CRETE || !D1.getTotalLength) return CRETE;
  var L=D1.getTotalLength(), pts=[], p, prev=-1, k;
  for(k=0;k<=140;k++){
    p=D1.getPointAtLength(L*0.55*k/140);
    if(p.x<=prev) break;                 // on s'arrête dès que le tracé redescend
    prev=p.x; pts.push([p.x,p.y]);
  }
  CRETE = pts.length>2 ? pts : null;
  return CRETE;
}
function creteY(xv){                      // y en unités de viewBox (0..110)
  var pts=tableCrete(); if(!pts) return 70;
  if(xv<=pts[0][0]) return pts[0][1];
  var k; for(k=1;k<pts.length;k++){
    if(xv<=pts[k][0]){
      var f=(xv-pts[k-1][0])/(pts[k][0]-pts[k-1][0]||1);
      return pts[k-1][1]+(pts[k][1]-pts[k-1][1])*f;
    }
  }
  return pts[pts.length-1][1];
}
function poserSurLaCrete(el, xPct, enfonce){
  /* ⚠️ on mesure le <svg>, pas le <path> : la boîte d'un tracé commence à son
     encre (ici la crête, y=32) et non en haut du viewBox — l'échelle serait fausse. */
  var sv=document.getElementById('skyDunes'); if(!sv) return;
  var r=sv.getBoundingClientRect(); if(!r.height) return;
  var h=el.offsetHeight || el.naturalHeight || 30;   // l'image peut ne pas être chargée
  var y=r.top + creteY(xPct/100*390)/110*r.height;
  el.style.top=(y - h + (enfonce||0))+'px';
}

var tCourant=-1;
function peindre(t){
  if(Math.abs(t-tCourant)<0.004) return;
  tCourant=t;
  var F=trame(t);
  BG.style.background='linear-gradient(180deg,'+rs(F.sky[0])+' 0%,'+rs(F.sky[1])+' 46%,'+rs(F.sky[2])+' 84%)';
  ST.style.opacity=F.st;
  var D=F.sun.r*2;
  SU.style.opacity=F.sun.op; SU.style.left=F.sun.x+'%'; SU.style.top=F.sun.y+'%';
  SU.style.width=D+'px'; SU.style.height=D+'px';
  SU.style.background='radial-gradient(circle,'+rs(clair(F.sun.c,.5))+' 0%,'+rs(F.sun.c)+' 58%,rgba(255,255,255,0) 76%)';
  SU.style.boxShadow='0 0 '+Math.round(F.sun.r*2.6)+'px '+Math.round(F.sun.r*0.9)+'px '+ra(F.sun.c,F.sun.g);
  MO.style.opacity=F.mn; FI.style.opacity=F.fi; CA.style.opacity=F.fi;
  D1.style.fill=rs(F.du[0]); D2.style.fill=rs(F.du[1]);
  var av=Math.min(t,CIEL.length-1)/(CIEL.length-1);
  /* le dromadaire traverse d'un bord à l'autre (112 % → −14 %, hors écran aux deux bouts) et passe devant
     le feu (z-index:1). (journal : index.html · le dromadaire traverse) */
  var xc=112-av*126;
  CV.style.left=xc+'%';
  poserSurLaCrete(CV, xc+5, 2);          // 5 % : le milieu de la bête, 2 px d'enfoncement
  poserSurLaCrete(CA, 80, 4);
  poserSurLaCrete(FI, 80, 44);   // le cœur du halo au milieu des flammes, la lueur lèche le sable
  ombre(F);
  var R=document.documentElement.style;
  R.setProperty('--ciel-ink',rs(F.ink));
  R.setProperty('--ciel-soft',ra(F.ink,.64));
  R.setProperty('--ciel-scrim',ra(F.sky[0],.93));
}

/* où en est-on sur le sentier ? Le repère de lecture est le bas du bandeau
   d'unité, celui-là même qui sert déjà à onHomeScroll. */
function position(){
  var home=document.getElementById('home'); if(!home) return 0;
  var secs=home.querySelectorAll('.unit-sec'); if(!secs.length) return 0;
  var bn=document.getElementById('unitBanner');
  var repere=(bn?bn.getBoundingClientRect().bottom:90)+40;
  var t=0,j,r;
  for(j=0;j<secs.length;j++){
    r=secs[j].getBoundingClientRect();
    if(r.top<=repere && r.bottom>repere) return j+(repere-r.top)/r.height;
    if(r.bottom<=repere) t=j+1;
  }
  return t;
}
/* les 12 heures se répartissent sur les unités présentes sur l'accueil */
function accorder(){
  var home=document.getElementById('home');
  var n=home?home.querySelectorAll('.unit-sec').length:0;
  if(n<2) return 0;
  return Math.min(CIEL.length-1, position()/(n-1)*(CIEL.length-1));
}

var actif=false;
function cielSync(){
  var home=document.getElementById('home');
  var visible=!!home && home.style.display!=='none';
  if(visible!==actif){ actif=visible; document.body.classList.toggle('ciel',visible); }
  if(visible) peindre(accorder());
}
var attente=false;
window.addEventListener('scroll', function(){
  if(attente) return; attente=true;
  requestAnimationFrame(function(){ cielSync(); attente=false; });
}, {passive:true});
window.addEventListener('resize', function(){ CRETE=null; tCourant=-1; cielSync(); });

/* greffes : on enveloppe sans réécrire. Les appels internes de l'app passent par
   la portée globale, donc réassigner window.X suffit. */
['renderHome','showTab'].forEach(function(nom){
  var avant=window[nom];
  if(typeof avant!=='function') return;
  window[nom]=function(){ var r=avant.apply(this,arguments); try{cielSync();}catch(e){} return r; };
});

window.__ciel={sync:cielSync, position:position, accorder:accorder};  /* trappe de test */
if(CV) CV.addEventListener('load', function(){ tCourant=-1; cielSync(); });
cielSync();
setTimeout(cielSync,300);
})();
