/* LE CHARGEUR DE « LES MYSTÈRES DE DIYA » — script CLASSIQUE, tout petit, dernière balise avant le module.
   La couche (src/web/mysteres/, ~210 Ko) se charge chez TOUT LE MONDE, sans aucun réglage gardé sur le téléphone : l'ancien interrupteur
   (geste caché, localStorage `alaq_mysteres`) n'est plus lu, un « éteint » enregistré ne cache plus rien. Seuls l'écartent le mode vitrine et
   `?mysteres=0` dans l'adresse (les contrôles qui visent les écrans d'avant ; rien n'est gardé). La couche est dans le CŒUR du service worker
   (sans elle, réseau faible, les indices disparaissaient : Myriam, 26/11). Elle enveloppe les vraies fonctions de rendu : elle se charge donc APRÈS coque.js (donc ici).
   Les fichiers portent ?v=<BUILD_NUM> (jamais une ancienne couche sous une app neuve).
   (journal : mysteres-chargeur.js · les Mystères derrière un interrupteur) */
(function(){
  if(/[?&]mysteres=0(?:&|$)/.test(location.search) || window.__alaqVitrine) return;
  var v = '?v=' + (window.BUILD_NUM || '0'), base = 'mysteres/';
  ['diya.css', 'carte.css', 'couche.css'].forEach(function(f){
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = base + f + v;
    l.onerror = function(){ l.onerror = null; setTimeout(function(){ l.href = base + f + v + '&e=1'; }, 3000); };
    document.head.appendChild(l);
  });
  var js = ['diya.js', 'carte-donnees.js', 'carte.js', 'donnees.js', 'couche.js'], i = 0, essais = 0, enCours = false;
  /* un fichier qui ne vient pas (réseau faible) : trois nouveaux essais ; puis au retour du réseau ET quand l'app revient au premier plan
     (sur iPhone elle reprend sans se recharger) — jamais une couche abandonnée à moitié, jamais deux chargements du même fichier à la fois */
  function suite(){
    if(enCours || i >= js.length) return;
    enCours = true;
    var s = document.createElement('script'); s.src = base + js[i] + v + (essais ? '&e=' + essais : '');
    s.onload = function(){ enCours = false; i++; essais = 0; suite(); };
    s.onerror = function(){
      enCours = false;
      try{ s.remove(); console.warn('mysteres : ' + js[i] + ' introuvable'); }catch(e){}
      if(++essais <= 3) setTimeout(suite, essais * 2000);
    };
    document.head.appendChild(s);
  }
  function reprendre(){ if(i < js.length && !enCours){ essais = 0; suite(); } }
  if(window.addEventListener) window.addEventListener('online', reprendre);
  if(document.addEventListener) document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'visible') reprendre(); });
  suite();
})();
