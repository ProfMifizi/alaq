/* MODE ORDINATEUR — colonne droite : rang, série/cœurs, nom d'Allah, parole du jour, révisions.
   Lit l'état réel de l'app au runtime (rankFor et RANK_COLORS de constance.js, NOMS_ALLAH
   et dueReviewWords de revision.js, S de progression.js) — à l'appel, jamais au chargement. */
(function(){
  var PAROLES=[
    {ar:'أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ', fr:'Les œuvres les plus aimées d’Allah sont les plus constantes, même petites.'},
    {ar:'مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللهِ فَلَهُ حَسَنَةٌ', fr:'Lire une seule lettre du Livre d’Allah vaut une bonne action, multipliée par dix.'},
    {ar:'اقْرَأْ', fr:'« Lis ! » — le premier mot révélé du Qor’an (sourate Al-ʿAlaq).'}
  ];
  function pick(arr){ try{ return arr[(new Date().getDate())%arr.length]; }catch(e){ return arr[0]; } }
  window.renderDeskRail=function(){
    var el=document.getElementById('deskrail');
    if(!el || typeof rankFor!=='function' || typeof S==='undefined') return;
    var r=rankFor(S.consScore||0), rank=r.rank||{ar:'',fr:''};
    var col=(typeof RANK_COLORS!=='undefined'&&RANK_COLORS[r.idx])?RANK_COLORS[r.idx]:'#DC902E';
    var lamp=icoImg('tb-lanterne','lant');
    var due=0; try{ due=dueReviewWords().length; }catch(e){}
    var noms=[]; try{ noms=NOMS_ALLAH.filter(function(n){return wordReadable(n.ar,knownLetterSet());}); }catch(e){}
    var nom=noms.length?pick(noms):((typeof NOMS_ALLAH!=='undefined'&&NOMS_ALLAH.length)?NOMS_ALLAH[0]:null), par=pick(PAROLES);
    var hearts=(typeof HEARTS_MAX!=='undefined')?HEARTS_MAX:7;
    var h='';
    h+='<div class="dr-card dr-rank" onclick="try{showRank()}catch(e){}"><span class="lamp lant-wrap" style="--rangc:'+col+'">'+lamp+'</span><div style="flex:1"><div class="dr-rank-ar">'+rank.ar+'</div><div class="dr-rank-fr">'+rank.fr+'</div><div class="dr-prog"><i style="width:'+Math.round((r.prog||0)*100)+'%"></i></div></div></div>';
    h+='<div class="dr-stats"><div><span class="dr-stx">'+icoImg('tb-epi','tbic')+' '+(S.streak||0)+'</span><small>série</small></div><div><span class="dr-stx">'+icoImg('tb-coeur','tbic')+' '+(S.hearts!=null?S.hearts:hearts)+'/'+hearts+'</span><small>Qatarāt</small></div></div>';
    if(nom) h+='<div class="dr-card"><div class="dr-h">Nom d’Allah</div><div class="dr-nom-ar">'+nom.ar+'</div><div class="dr-nom-fr">'+nom.fr+'</div></div>';
    h+='<div class="dr-card"><div class="dr-h">Parole du jour</div><div class="dr-parole-ar">'+par.ar+'</div><div class="dr-parole-fr">'+par.fr+'</div></div>';
    h+='<div class="dr-card"><div class="dr-h">À réviser</div><div class="dr-rev-n">'+due+' mot'+(due>1?'s':'')+'</div><button class="dr-rev-btn" onclick="showTab(\'reviser\')">Réviser</button></div>';
    el.innerHTML=h;
  };
  function hook(name){ var f=window[name]; if(typeof f==='function'){ window[name]=function(){ var x=f.apply(this,arguments); try{window.renderDeskRail();}catch(e){} return x; }; } }
  function boot(){ hook('showTab'); hook('refreshStats'); try{window.renderDeskRail();}catch(e){} }
  window.addEventListener('load', function(){ setTimeout(boot, 500); });
})();
