/* LE CHARGEUR DE « LES MYSTÈRES DE DIYA » (24/11/2026) — script CLASSIQUE, tout petit, dernière balise avant le module.
   La couche (src/web/mysteres/, ~210 Ko) n'est téléchargée QUE derrière un interrupteur : `?mysteres=1` dans l'adresse (gardé dans localStorage `alaq_mysteres`),
   `?mysteres=0` l'éteint. Éteint — le cas de toute élève —, il ne fait RIEN : ni requête, ni style, ni écouteur, ni nom posé. Jamais dans le mode vitrine.
   La couche enveloppe les vraies fonctions de rendu : elle se charge donc APRÈS coque.js (donc ici). Les fichiers portent ?v=<BUILD_NUM> (jamais une ancienne couche sous une app neuve).
   (journal : mysteres-chargeur.js · les Mystères derrière un interrupteur) */
(function(){
  var oui = false;
  try{
    var m = /[?&]mysteres=([01])(?:&|$)/.exec(location.search);
    if(m) localStorage.setItem('alaq_mysteres', m[1]);
    oui = localStorage.getItem('alaq_mysteres') === '1';
  }catch(e){}
  if(!oui || window.__alaqVitrine) return;
  var v = '?v=' + (window.BUILD_NUM || '0'), base = 'mysteres/';
  ['diya.css', 'carte.css', 'couche.css'].forEach(function(f){
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = base + f + v; document.head.appendChild(l);
  });
  var js = ['diya.js', 'carte-donnees.js', 'carte.js', 'donnees.js', 'couche.js'], i = 0;
  (function suite(){
    if(i >= js.length) return;
    var s = document.createElement('script'); s.src = base + js[i++] + v;
    s.onload = suite;
    s.onerror = function(){ try{ console.warn('mysteres : ' + s.src + ' introuvable'); }catch(e){} };
    document.head.appendChild(s);
  })();
})();
