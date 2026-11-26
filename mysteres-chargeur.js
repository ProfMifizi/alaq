/* LE CHARGEUR DE « LES MYSTÈRES DE DIYA » — script CLASSIQUE, tout petit, dernière balise avant le module.
   OUVERT À TOUS depuis le build 289 : la couche (src/web/mysteres/, ~210 Ko) se charge chez tout le monde. L'interrupteur reste pour l'ÉTEINDRE :
   `?mysteres=0` dans l'adresse (ou sept touchers sur la date de « Mise à jour »), gardé dans localStorage `alaq_mysteres` ; `?mysteres=1` la rallume.
   Jamais dans le mode vitrine. La couche n'est PAS pré-cachée : sans réseau elle ne vient pas et l'app reste celle d'avant, sans rien casser.
   Elle enveloppe les vraies fonctions de rendu : elle se charge donc APRÈS coque.js (donc ici). Les fichiers portent ?v=<BUILD_NUM> (jamais une ancienne couche sous une app neuve).
   (journal : mysteres-chargeur.js · les Mystères derrière un interrupteur) */
(function(){
  var m = /[?&]mysteres=([01])(?:&|$)/.exec(location.search), oui = !m || m[1] === '1';   // l'adresse gagne ; un stockage refusé laisse allumé
  try{
    if(m) localStorage.setItem('alaq_mysteres', m[1]);
    else oui = localStorage.getItem('alaq_mysteres') !== '0';
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
