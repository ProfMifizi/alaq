/* ===== ALAQ — Régénère la liste des sons (04/08/2026) =====
   Ce script est EMBARQUÉ dans le dossier déployé, et c'est ce qui rend la liste
   automatique : Vercel le lance à chaque déploiement (Build Command = `node
   construire.js`). Une nouvelle leçon poussée dans index.html met donc à jour la
   page du preneur de son toute seule, sans que personne ne refasse quoi que ce soit.

   Il relit `inventaire.js` — le même que celui du studio local, avec la même
   résolution de chemins — puis allège le résultat pour la page en ligne :
   ni consignes françaises, ni orphelins, ni chemins de travail.

   Usage : node construire.js                                                     */
const fs = require('fs'), path = require('path');

const FICHIER = path.join(__dirname, 'inventaire.json');

// relit le code de l'app et écrit l'inventaire COMPLET
delete require.cache[require.resolve('./inventaire.js')];
require('./inventaire.js');

const complet = JSON.parse(fs.readFileSync(FICHIER, 'utf8'));

const arabe = complet.arabe
  .filter(l => !['Orphelin', 'Variante de voix', 'Récitation', 'Effet sonore'].includes(l.famille))
  // rien à enregistrer : ce que l'app n'appelle plus, les doublons de voix IA (-f/-h),
  // le Qorān (récité, jamais enregistré ici) et les effets sonores
  .map(({ fichier, arabe, sens, translit, famille, unite, lecons, present, statut, arefaire }) =>
       ({ fichier, arabe, sens, translit, famille, unite, lecons, present, statut, arefaire }));

const compte = { total: arabe.length, ok: 0, manquant: 0, 'a-refaire': 0 };
arabe.forEach(l => { if (l.statut in compte) compte[l.statut]++; });

fs.writeFileSync(FICHIER, JSON.stringify({
  genere: complet.genere, unites: complet.unites, arabe, bilan: { arabe: compte },
}));

console.log('liste régénérée depuis le code de l’app — ' + arabe.length + ' sons ('
  + compte.manquant + ' à enregistrer, ' + compte['a-refaire'] + ' à refaire, ' + compte.ok + ' déjà là)');
