/* LE CHARGEUR DE « LES MYSTÈRES DE DIYA » — script CLASSIQUE, tout petit, dernière balise avant le module.
   La couche (src/web/mysteres/, ~210 Ko) se charge chez TOUT LE MONDE, sans aucun réglage gardé sur le téléphone : l'ancien interrupteur
   (geste caché, localStorage `alaq_mysteres`) n'est plus lu, un « éteint » enregistré ne cache plus rien. Seuls l'écartent le mode vitrine et
   `?mysteres=0` dans l'adresse (les contrôles qui visent les écrans d'avant ; rien n'est gardé). La couche n'est PAS pré-cachée : sans réseau
   elle ne vient pas et l'app reste celle d'avant. Elle enveloppe les vraies fonctions de rendu : elle se charge donc APRÈS coque.js (donc ici).
   Les fichiers portent ?v=<BUILD_NUM> (jamais une ancienne couche sous une app neuve).
   (journal : mysteres-chargeur.js · les Mystères derrière un interrupteur) */
(function(){
  if(/[?&]mysteres=0(?:&|$)/.test(location.search) || window.__alaqVitrine) return;
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
