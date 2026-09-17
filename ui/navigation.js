/* ui/navigation.js — l'aiguillage des onglets : showTab(name, sub) choisit la vue visible,
   le bouton actif du menu bas et le rendu à appeler. Les boutons du menu bas (HTML statique)
   l'appellent en onclick.
   Script classique, chargé avant le grand script, dont la dernière ligne showTab('home') peint
   l'accueil en synchrone (voir l'en-tête de ui/accueil.js).
   À L'APPEL : motBulleOff (revision.js) · refreshStats, renderHome (ui/accueil.js) ·
   renderCours, renderReviser (ui/reviser.js) · renderProg, renderParams (ui/parametres.js).
   ⚠️ Un onglet neuf = une entrée dans map ET une branche de rendu, sinon la vue reste vide.
   Gardes : outils/verifier-interface.mjs, previews/_verif_interface.html. */

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
