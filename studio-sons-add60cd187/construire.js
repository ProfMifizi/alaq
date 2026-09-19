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

/* ⛔ DEUX MODES, ET LA DIFFÉRENCE EST LE POINT (19/09/2026).
   · `--strict` (construire-en-ligne.js, sur le Mac) : l'app est là, toute erreur est un
     vrai défaut — on la laisse lever, jamais une liste périmée figée sans le dire.
   · sans option (Vercel, Build Command) : le dépôt PUBLIC ne contient que dist/ — ni
     alaq-vercel-static/, ni src/. Le studio a été reconstruit à chaque livraison de l'app
     et a ÉCHOUÉ douze fois de suite (16-19/09, « introuvable dans index.html : AUDIO ») :
     Vercel gardait l'ancienne version en ligne, sans que personne le voie. Là-bas on ne
     PEUT plus relire les leçons ; on garde la liste fabriquée sur le Mac, avec un
     avertissement bien visible dans le journal du build.
   (journal : construire.js · le studio en ligne, douze builds en erreur) */
const strict = process.argv.includes('--strict');
let complet;
try {
  // relit le code de l'app et écrit l'inventaire COMPLET
  delete require.cache[require.resolve('./inventaire.js')];
  require('./inventaire.js');
  complet = JSON.parse(fs.readFileSync(FICHIER, 'utf8'));
} catch (e) {
  if (strict) throw e;
  let pre = null;
  try { pre = JSON.parse(fs.readFileSync(FICHIER, 'utf8')); } catch (_) {}
  if (!pre || !Array.isArray(pre.arabe) || !pre.arabe.length || !pre.bilan)
    throw new Error('la liste ne peut pas être régénérée ici (' + e.message + ') ET aucune liste '
      + 'fabriquée sur le Mac n\u2019accompagne ce dossier : node outils/construire-en-ligne.js');
  const c = pre.bilan.arabe || {};
  console.warn('\n⚠️  LISTE NON RÉGÉNÉRÉE ICI : ' + e.message);
  console.warn('    On garde celle fabriquée sur le Mac (genere : ' + pre.genere + ') — '
    + pre.arabe.length + ' sons, ' + (c.manquant || 0) + ' à enregistrer.');
  console.warn('    Pour la mettre à jour : node outils/construire-en-ligne.js, puis redéployer ce dossier.\n');
  process.exit(0);
}

const arabe = complet.arabe
  .filter(l => !['Orphelin', 'Variante de voix', 'Récitation', 'Effet sonore'].includes(l.famille))
  // rien à enregistrer : ce que l'app n'appelle plus, les doublons de voix IA (-f/-h),
  // le Qorān (récité, jamais enregistré ici) et les effets sonores
  .map(({ fichier, arabe, sens, translit, famille, unite, lecons, present, statut, arefaire }) =>
       ({ fichier, arabe, sens, translit, famille, unite, lecons, present, statut, arefaire }));

const compte = { total: arabe.length, ok: 0, manquant: 0, 'a-refaire': 0 };
arabe.forEach(l => { if (l.statut in compte) compte[l.statut]++; });

fs.writeFileSync(FICHIER, JSON.stringify({
  genere: complet.genere, unites: complet.unites, arabe,
  bilan: { arabe: compte, lecons63: complet.bilan.lecons63 },   // la garantie de couverture voyage avec la liste
}));

console.log('liste régénérée depuis le code de l’app — ' + arabe.length + ' sons ('
  + compte.manquant + ' à enregistrer, ' + compte['a-refaire'] + ' à refaire, ' + compte.ok + ' déjà là)');
