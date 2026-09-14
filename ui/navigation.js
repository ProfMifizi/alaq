/* ═══════════════════════════════════════════════════════════════════════════
   ui/navigation.js — L'AIGUILLAGE DES ONGLETS (12/09/2026)
   ───────────────────────────────────────────────────────────────────────────
   CE QU'IL PORTE : showTab(name, sub) — la seule fonction qui décide quelle vue
   est visible (#home, #view-cours, #view-reviser, #view-prog, #view-params),
   quel bouton du menu bas est actif, et qui appelle le rendu de l'onglet ouvert.
   Les cinq boutons du menu bas sont du HTML statique d'index.html, avec
   `onclick="showTab('…')"` : ils trouvent cette fonction parce qu'un script
   classique la pose sur window.

   ═══ POURQUOI UN SCRIPT CLASSIQUE, ET CHARGÉ ICI ═══
   Chargé sous ui/accueil.js et AVANT le grand script d'index.html, dont la
   dernière ligne est `showTab('home')` — SYNCHRONE, c'est ce qui peint l'accueil
   sans scintillement. Ni `defer`, ni `type="module"`, ni `import`/`export`.
   Voir l'en-tête de ui/accueil.js pour la règle complète.

   ═══ LE CONTRAT AVEC index.html (résolu À L'APPEL) ═══
   motBulleOff — et, dans les autres fichiers ui/ : refreshStats, renderHome,
   renderCours, renderReviser, renderProg, renderParams. Un onglet neuf = une
   entrée dans `map` ET une branche de rendu : les deux, ou la vue reste vide.

   GARDES : outils/verifier-interface.mjs (④), previews/_verif_interface.html.
   ═══════════════════════════════════════════════════════════════════════════ */

function showTab(name,sub){
  motBulleOff();                     // le bandeau ne suit pas d'un onglet à l'autre
  refreshStats(); // la barre du haut reflète toujours l'état réel (cœurs, étoiles, série)
  const map={home:'home',cours:'view-cours',reviser:'view-reviser',prog:'view-prog',params:'view-params'};
  Object.keys(map).forEach(t=>{ const el=document.getElementById(map[t]); if(el)el.style.display=(t===name)?'':'none';
    const b=document.getElementById('bn-'+t); if(b)b.classList.toggle('active',t===name); });
  try{window.scrollTo(0,0);}catch(e){}
  if(name==='home')renderHome();
  else if(name==='cours')renderCours(sub||'video');
  else if(name==='reviser')renderReviser(sub);
  else if(name==='prog')renderProg();
  else if(name==='params')renderParams();
}
