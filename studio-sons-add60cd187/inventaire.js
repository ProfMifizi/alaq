/* ===== ALAQ — Inventaire des sons (03/08/2026) =====
   Croise TROIS sources pour savoir, pour chaque son, où il est appelé et s'il existe :
     1. alaq-vercel-static/index.html  — le code qui APPELLE les sons (5 gabarits différents)
     2. alaq-vercel-static/sw.js       — la liste de pré-cache = ce qui part hors ligne
     3. audios-app-alaq/               — les fichiers qui EXISTENT vraiment
   Sortie : outils/inventaire.json, lu par studio-arabe.html et studio-francais.html.
   Usage : node inventaire.js                                         */
const fs = require('fs'), path = require('path');

const RACINE  = path.join(__dirname, '..');

/* Le même script sert dans DEUX arborescences :
     · en local (Dropbox)  : l'app est dans ../alaq-vercel-static/
     · sur GitHub / Vercel : l'app est à la racine du dépôt, à côté des audios
   On prend le premier chemin qui existe — c'est ce qui permet à Vercel de
   régénérer la liste à chaque déploiement, sans configuration particulière. */
const premier = (...c) => c.find(x => fs.existsSync(x)) || c[c.length - 1];

const INDEX   = premier(path.join(RACINE, 'alaq-vercel-static', 'index.html'),
                        path.join(RACINE, 'index.html'));
const SW      = premier(path.join(RACINE, 'alaq-vercel-static', 'sw.js'),
                        path.join(RACINE, 'sw.js'));
const AUDIOS  = premier(path.join(RACINE, 'audios-app-alaq'),
                        path.join(__dirname, 'audios-app-alaq'));
const ATTENTE = path.join(RACINE, 'audios-generes-a-valider');   // absent du dépôt : normal
const NOMS93  = premier(path.join(RACINE, 'donnees', 'noms-a-generer.json'),
                        path.join(__dirname, 'noms-a-generer.json'),
                        path.join(RACINE, 'noms-a-generer.json'));
const SORTIE  = path.join(__dirname, 'inventaire.json');
/* Les fichiers dits par une VOIX IA que Myriam réenregistre elle-même (décision du
   10/08 : plus aucune voix IA sur les sons de l'app). Ils EXISTENT — sans cette liste
   ils passeraient pour « ok » et n'apparaîtraient jamais dans le studio. */
/* Le NOM arabe de chaque lettre — LU dans generer-noms-lettres.js, jamais recopié :
   c'est lui qui porte les corrections faites à l'oreille (الِفْ, فا…). Sans lui, la
   colonne « À dire » d'un nom de lettre était vide et on risquait d'enregistrer le SON
   à la place du NOM. */
const NOMS_AR = (() => {
  try {
    const j = path.join(__dirname, 'noms-lettres.json');      // dossier déployé : le générateur n'y est pas
    if (fs.existsSync(j)) return JSON.parse(fs.readFileSync(j, 'utf8'));
    const t = fs.readFileSync(path.join(__dirname, 'generer-noms-lettres.js'), 'utf8');
    const bloc = t.match(/const NOMS\s*=\s*\{([\s\S]*?)\n\};/)[1];
    const o = {};
    for (const m of bloc.matchAll(/'([^']+)'\s*:\s*'([^']+)'/g)) o[m[1]] = m[2];
    return o;
  } catch (_) { return {}; }
})();
const AREFAIRE = new Set((() => {
  const p = path.join(__dirname, 'a-reenregistrer.json');
  try { return JSON.parse(fs.readFileSync(p, 'utf8')).fichiers || []; } catch (_) { return []; }
})());

/* les sources dont dépend l'inventaire — sert à savoir s'il est périmé */
module.exports = { INDEX, SW, AUDIOS, SORTIE };

const src = fs.readFileSync(INDEX, 'utf8');

/* ---------- extraire un littéral JS du code de l'app et l'évaluer ----------
   Plus sûr qu'une regex : on relit EXACTEMENT ce que l'app utilise. On repère
   « const NOM= », puis on avance en comptant les crochets (en sautant chaînes
   et commentaires) jusqu'à la fermeture, et on évalue le morceau obtenu.
   eval() est ici sans risque : la seule entrée est notre propre index.html, lu sur
   le disque par un script lancé à la main. Aucune donnée extérieure n'y entre.  */
function litteral(nom) {
  const i = src.indexOf('\nconst ' + nom + '=');
  if (i < 0) throw new Error('introuvable dans index.html : ' + nom);
  let j = i + ('\nconst ' + nom + '=').length;
  const ouvre = src[j];                       // { ou [
  const ferme = ouvre === '{' ? '}' : ']';
  let prof = 0, q = null, k = j;
  for (; k < src.length; k++) {
    const c = src[k], p = src[k - 1];
    if (q) { if (c === q && p !== '\\') q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '/' && src[k + 1] === '/') { k = src.indexOf('\n', k); continue; }
    if (c === '/' && src[k + 1] === '*') { k = src.indexOf('*/', k) + 1; continue; }
    if (c === ouvre) prof++;
    else if (c === ferme && --prof === 0) break;
  }
  return eval('(' + src.slice(j, k + 1) + ')');
}

const AUDIO      = litteral('AUDIO');        // mot/syllabe arabe -> chemin mp3
const INSTR_LIST = litteral('INSTR_LIST');   // [slug, texte français]
const LTRANS     = litteral('LTRANS');       // lettre arabe -> translittération du nom de fichier
const UNITS      = litteral('UNITS');        // les 7 unités : lettres + mots
const NOMS_ALLAH = litteral('NOMS_ALLAH');   // les Noms d'Allah (hors unités)
const VOIX       = litteral('VOIX');         // les récitateurs — loc:1 = hébergé (10/08)

/* les 9 disques (= leçons) d'une unité, dans l'ordre pédagogique */
const DISQUES = [...src.slice(src.indexOf('const DISQUES=['))
  .slice(0, 900).matchAll(/label:'((?:[^'\\]|\\.)*)'/g)].map(m => m[1].replace(/\\u2019/g, '’'));

/* ---------- fichiers présents / pré-cachés ---------- */
const presents = new Set(fs.readdirSync(AUDIOS).filter(f => f.endsWith('.mp3')));
const tailles  = {}; presents.forEach(f => { tailles[f] = fs.statSync(path.join(AUDIOS, f)).size; });
/* les récitations HÉBERGÉES (10/08) : audios-app-alaq/recit/<voix>/<n°>.mp3 */
const RECIT = path.join(AUDIOS, 'recit');
if (fs.existsSync(RECIT)) for (const dossier of fs.readdirSync(RECIT)) {
  const dp = path.join(RECIT, dossier);
  if (!fs.statSync(dp).isDirectory()) continue;
  for (const f of fs.readdirSync(dp).filter(x => x.endsWith('.mp3'))) {
    const rel = 'recit/' + dossier + '/' + f;
    presents.add(rel);
    tailles[rel] = fs.statSync(path.join(dp, f)).size;
  }
}
const precache = new Set([...fs.readFileSync(SW, 'utf8')
  .matchAll(/"audios-app-alaq\/([^"]+\.mp3)"/g)].map(m => m[1]));
// les versions IA qui attendent encore l'oreille de Myriam
const attente = new Set(fs.existsSync(ATTENTE) ? fs.readdirSync(ATTENTE).filter(f => f.endsWith('.mp3')) : []);

/* ---------- qui possède quelle lettre : la lettre appartient à l'unité qui l'enseigne ---------- */
const uniteDeLettre = {};
UNITS.forEach(U => (U.letters || []).forEach(L => { if (!(L in uniteDeLettre)) uniteDeLettre[L] = U.no; }));
const ALIF_FAM = ['أ', 'إ', 'آ', 'ٱ', 'ا'];
const cleLettre = ch => ALIF_FAM.includes(ch) ? 'ا' : ch;
ALIF_FAM.forEach(a => { if (uniteDeLettre['أ'] && !(a in uniteDeLettre)) uniteDeLettre[a] = uniteDeLettre['أ']; });
// LTRANS est indexé par la lettre nue : on remonte translittération -> unité
const uniteDeTranslit = {};
Object.entries(LTRANS).forEach(([L, tr]) => {
  const u = uniteDeLettre[L] ?? uniteDeLettre[cleLettre(L)];
  if (u) uniteDeTranslit[tr] = u;
});
Object.entries(uniteDeLettre).forEach(([L, u]) => { const tr = LTRANS[cleLettre(L)]; if (tr && !uniteDeTranslit[tr]) uniteDeTranslit[tr] = u; });

/* ---------- où est ce mot ? (unité + sens français) ---------- */
const infoMot = {};
UNITS.forEach(U => (U.words || []).forEach(w => { infoMot[w.w] = { unite: U.no, fr: w.fr, say: w.say, emoji: w.e }; }));

/* ---------- dernier recours : dans quelle leçon ce mot est-il écrit ? ----------
   On cherche le token dans le code et on remonte à la fonction build* qui l'entoure ;
   DISQUES donne le nom affiché de cette leçon (build:buildAlphabet → « L’alphabet »). */
const nomDeBuild = {};
[...src.slice(src.indexOf('const DISQUES=[')).slice(0, 900)
  .matchAll(/label:'((?:[^'\\]|\\.)*)'[^}]*build:(\w+)/g)]
  .forEach(m => { nomDeBuild[m[2]] = m[1].replace(/\\u2019/g, '’'); });
const bornesBuild = [...src.matchAll(/\nfunction (build\w+)\(/g)].map(m => ({ nom: m[1], i: m.index }));
function leconDuToken(token) {
  const i = src.indexOf("'" + token + "'");
  if (i < 0) return null;
  let dernier = null;
  for (const b of bornesBuild) { if (b.i < i) dernier = b.nom; else break; }
  return dernier && nomDeBuild[dernier] ? nomDeBuild[dernier] : null;
}

/* ---------- l'inventaire arabe ---------- */
const lignes = [];
const vu = new Set();
function pousse(l) { if (vu.has(l.fichier)) return; vu.add(l.fichier); lignes.push(l); }

/* 1 · tout ce que le dictionnaire AUDIO{} sait jouer */
for (const [token, chemin] of Object.entries(AUDIO)) {
  const fichier = chemin.replace('audios-app-alaq/', '');
  const mot = infoMot[token];
  let famille = 'Autre', unite = mot ? mot.unite : null, lecons = [];

  if (/^lettre-(\w+)-nom\.mp3$/.test(fichier)) {
    famille = 'Nom de lettre';
    unite = uniteDeTranslit[RegExp.$1] ?? null;
    lecons = ['L’alphabet', 'Mémoriser {L}', 'Les formes'];
    if (NOMS_AR[token]) {   // « À dire » = le NOM écrit en arabe (دَالْ), pas la lettre seule
      pousse({ fichier, arabe: NOMS_AR[token], sens: 'le NOM de la lettre ' + token,
               translit: RegExp.$1, emoji: '', famille, unite, lecons });
      continue;
    }
  } else if (/^lettre-(\w+)-son\.mp3$/.test(fichier)) {
    famille = 'Son de lettre';
    unite = uniteDeTranslit[RegExp.$1] ?? null;
    lecons = ['L’alphabet', 'Mémoriser {L}', 'Écrire des mots'];
  } else if (/^voyelle-/.test(fichier)) {
    famille = 'Voyelle'; lecons = ['Les harakats'];
  } else if (/^mot-/.test(fichier)) {
    famille = 'Mot';
    lecons = mot ? ['Lire des mots', 'Écrire des mots', 'Bilan']
                 : [leconDuToken(token) || 'Vocabulaire'].filter(Boolean);
  } else if (/-son-court\.mp3$/.test(fichier)) {
    famille = 'Syllabe courte';
    unite = uniteDeTranslit[fichier.split('-')[0]] ?? null;
    lecons = ['Les harakats', 'Bilan'];
  } else if (/-son-prolonge\.mp3$/.test(fichier)) {
    famille = 'Syllabe longue';
    unite = uniteDeTranslit[fichier.split('-')[0]] ?? null;
    lecons = ['Les prolongations', 'Bilan'];
  } else if (/^nom-/.test(fichier)) {
    famille = 'Nom d’Allah'; lecons = ['Les Noms d’Allah'];
  }
  pousse({ fichier, arabe: token, sens: mot ? mot.fr : '', translit: mot ? mot.say : '',
           emoji: mot ? mot.emoji : '', famille, unite, lecons });
}

/* 2 · le nom et le son de chaque lettre — gabarits lettre-<translit>-nom/son.mp3 */
for (const [L, tr] of Object.entries(LTRANS)) {
  const u = uniteDeTranslit[tr] ?? null;
  pousse({ fichier: `lettre-${tr}-nom.mp3`, arabe: NOMS_AR[L] || L, sens: `le NOM de la lettre ${L} (${tr})`,
           translit: tr, emoji: '', famille: 'Nom de lettre', unite: u,
           lecons: ['L’alphabet', 'Mémoriser {L}', 'Les formes'] });
  pousse({ fichier: `lettre-${tr}-son.mp3`, arabe: L, sens: `le SON de la lettre ${L} — pas son nom (${tr})`,
           translit: tr, emoji: '', famille: 'Son de lettre', unite: u,
           lecons: ['L’alphabet', 'Mémoriser {L}', 'Écrire des mots'] });
}

/* 3 · les Noms d'Allah — leçon à part, hors des 7 unités.
   Attention : l'app ne code en dur que 6 noms (repli hors ligne) ; les 99 arrivent de
   Supabase à l'exécution (index.html l. 5286) et alimentent AUDIO[] avec leur `snd`.
   Un nom-*.mp3 du dossier est donc APPELÉ, même absent du code : ce n'est pas un orphelin. */
const nomsAr = {};
NOMS_ALLAH.forEach(n => { nomsAr[n.snd + '.mp3'] = { ar: n.ar, fr: n.fr }; });
if (fs.existsSync(NOMS93)) JSON.parse(fs.readFileSync(NOMS93, 'utf8'))
  .forEach(([f, ar]) => { if (!nomsAr[f]) nomsAr[f] = { ar, fr: '' }; });
for (const [f, n] of Object.entries(nomsAr))
  pousse({ fichier: f, arabe: n.ar, sens: n.fr, translit: '', emoji: '',
           famille: 'Nom d’Allah', unite: null, lecons: ['Les Noms d’Allah'] });

/* 3b · les récitations hébergées : 7 versets × chaque voix loc:1 (décision de Myriam
   du 10/08 — provisoire tant que l'app est gratuite ; les autres voix restent streamées) */
VOIX.filter(v => v.loc).forEach(v => { for (let n = 1; n <= 7; n++)
  pousse({ fichier: 'recit/' + v.id + '/' + n + '.mp3', arabe: v.ar || '',
           sens: v.fr + ' — Fātiḥa, verset ' + n, translit: '', emoji: '',
           famille: 'Récitation', unite: null, lecons: ['Dans la Fātiḥa', 'Le Qorān'] });
});

/* 3c · LES SONS DE L'UNITÉ 8 — elle n'est pas encore dans l'app, donc invisible à
   la lecture d'index.html. La liste est produite par  DEPUIS
   src/units/unit-8/ (la source de l'unité), jamais tenue à la main ; sur Vercel elle
   arrive embarquée, comme noms-lettres.json.
   ⚠️ Elle contient les 7 lectures VOLONTAIREMENT FAUSSES du disque 6 : Myriam les
   enregistre elle-même (aucune IA ne sait prononcer faux à la demande). */
const U8JSON = premier(path.join(__dirname, 'sons-u8.json'),
                       path.join(RACINE, 'outils', 'sons-u8.json'));
if (fs.existsSync(U8JSON))
  JSON.parse(fs.readFileSync(U8JSON, 'utf8')).forEach(l => pousse(l));

/* 3d · LES SONS DE L'UNITÉ 9 — même motif, même raison que l'unité 8 ci-dessus :
   ils vivent dans src/units/unit-9/donnees/disque-1.js (sous la forme
   `son('almaktab')`), invisibles à la lecture d'index.html. Produits par
   `outils/table-sons-u9.js` DEPUIS la source, jamais tenus à la main.
   🔴 Sans ce bloc le studio ne réclamait AUCUN son de l'unité 9 : le 26/08 les
   12 prises manquaient toutes alors que le disque 1 était prêt à s'ouvrir aux
   élèves — l'écran 6 (« écoute et choisis le bon mot ») aurait été muet, donc
   injouable, et rien n'aurait signalé le trou. Toute unité future qui vit en
   module ES doit ajouter son bloc ICI, sinon ses sons sont invisibles au studio. */
const U9JSON = premier(path.join(__dirname, 'sons-u9.json'),
                       path.join(RACINE, 'outils', 'sons-u9.json'));
if (fs.existsSync(U9JSON))
  JSON.parse(fs.readFileSync(U9JSON, 'utf8')).forEach(l => pousse(l));

/* 3e · LES SONS DE L'UNITÉ 10 — même motif, même raison (02/09) : ils vivent
   dans src/units/unit-10/donnees/disque-1.js, produits par
   `outils/table-sons-u10.js` DEPUIS la source, jamais tenus à la main. */
const U10JSON = premier(path.join(__dirname, 'sons-u10.json'),
                        path.join(RACINE, 'outils', 'sons-u10.json'));
if (fs.existsSync(U10JSON))
  JSON.parse(fs.readFileSync(U10JSON, 'utf8')).forEach(l => pousse(l));

/* 4 · ce qui reste dans le dossier sans que rien ne l'appelle : les ORPHELINS.
   Les versets sont diffusés depuis la source du récitateur (playVerse → qariUrl) :
   les fatiha-*.mp3 déposés en local ne sont donc jamais joués. */
for (const f of presents) {
  if (vu.has(f) || /^instr-/.test(f)) continue;      // consignes françaises : page 2
  let famille = 'Orphelin', lecons = [], sens = '';
  /* ⚠️ Les fichiers « -f » / « -h » ne sont PAS des orphelins : l'app construit leur nom
     à la volée (`lettre-<tr>-nom-<VOIX_G>.mp3`, `<base>-<VOIX_G>.mp3`), invisible à une
     lecture littérale. Ils ne se listent pas non plus dans le studio : Myriam enregistre
     sous le nom PLAT, et la variante de voix s'efface quand sa prise arrive. */
  const plat = f.replace(/-(f|h)\.mp3$/, '.mp3');
  if (/-(f|h)\.mp3$/.test(f) && (vu.has(plat) || /^(lettre-|felicit-)/.test(f)))
    { famille = 'Variante de voix'; sens = 'voix IA — l’app la joue tant que l’enregistrement de Myriam (' + plat + ') n’est pas là'; }
  else if (/^sfx-/.test(f)) { famille = 'Effet sonore'; lecons = ['Récompenses']; }
  else if (/^nom-/.test(f)) { famille = 'Nom d’Allah'; lecons = ['Les Noms d’Allah']; }
  else if (/^fatiha-(\d)/.test(f)) sens = 'verset ' + RegExp.$1 + ' — jamais appelé : les versets sont diffusés depuis la source du récitateur';
  else if (/-isolee-nom-de-la-lettre\.mp3$/.test(f)) sens = 'ancien nommage — l’app appelle désormais lettre-<translit>-nom.mp3';
  else if (f === 'lettre-hamza-nom.mp3') sens = 'l’app dit « alif » pour أ : elle appelle lettre-alif-nom.mp3';
  pousse({ fichier: f, arabe: '', sens, translit: '', emoji: '', famille, unite: null, lecons });
}

/* ---------- l'inventaire français (les consignes) ---------- */
const consignes = INSTR_LIST.map(([slug, texte]) => ({
  fichier: 'instr-' + slug + '.mp3',
  slug,
  texte: texte.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),   // ce qu'on entend
  html: texte,                                                        // ce qui est affiché
  famille: /^(info|intro)-/.test(slug) ? 'Explication' : 'Consigne',
}));
// consignes enregistrées que plus aucune leçon n'appelle
const slugsVivants = new Set(consignes.map(c => c.fichier));
for (const f of presents) if (/^instr-/.test(f) && !slugsVivants.has(f))
  consignes.push({ fichier: f, slug: f.slice(6, -4), texte: '', html: '', famille: 'Orpheline' });

/* ---------- LA VÉRITÉ SUR « QUELLE LEÇON ? » (10/08/2026) ----------
   Jusqu'ici la leçon et l'unité de chaque son étaient DEVINÉES (des listes écrites à la
   main plus haut : « une syllabe courte → Les harakats, Bilan »). C'était faux dès qu'une
   leçon changeait, et ça ne prouvait rien sur la couverture des 63 leçons.
   On fait désormais tourner les 9 constructeurs × 7 unités et on relève, écran par écran,
   les sons réellement demandés (sons-des-lecons.js).
   ⚠️ REPLI OBLIGATOIRE : si le parcours échoue (index.html remanié), on garde les listes
   devinées. Une colonne approximative vaut mieux qu'un studio hors ligne chez Vercel. */
let couverture = null;
try {
  const { carteDesSons } = require('./sons-des-lecons.js');
  const { carte, ordre, inconnus } = carteDesSons(src);
  if (inconnus.length) console.warn('  ⚠️ types d’écran non traités :', inconnus.join(' '));
  let vus = 0;
  const rang = f => ordre.has(f) ? ordre.get(f) : 99;   // ordre pédagogique RÉEL (parcours des disques)
  for (const l of lignes) {
    const e = carte.get(l.fichier);
    if (e) {
      /* l'UNITÉ reste celle qui ENSEIGNE le son (elle vient des données UNITS, elle est juste).
         On ne la remplace que si elle manquait : l'écran « voici les 28 lettres » de la leçon 1
         rattacherait sinon toutes les lettres à l'unité 1. */
      if (!l.unite) l.unite = Math.min(...e.unites);
      // les leçons de SON unité d'abord (utile au preneur de son), sinon toutes
      const propres = e.parUnite.get(l.unite);
      l.lecons = [...(propres && propres.size ? propres : e.lecons)].sort((a, b) => rang(a) - rang(b));
      l.lecon63 = true; vus++;
    }
    else if (/^lettre-\w+-son\.mp3$/.test(l.fichier))
      // aucune leçon n'appelle sayLetterSound : il vit dans la grille des lettres et le Cours
      l.lecons = ['Réviser · les lettres', 'Cours'];
  }
  /* On ne compte que ce qui S'ENREGISTRE : les 6 « mim-…-f.mp3 » ecrits en dur dans la
     lecon 1 sont des doublons de voix IA — Myriam enregistre le nom PLAT, qui est demande
     par ailleurs et bien present. Les compter ferait afficher « 6 manquent » a tort. */
  const aEnregistrer = [...carte.keys()].filter(f => !/-(f|h)\.mp3$/.test(f));
  couverture = { demandes: aEnregistrer.length,
                 couverts: aEnregistrer.filter(f => vu.has(f)).length };
  console.log('  couverture des 63 leçons : ' + carte.size + ' sons demandés, ' + vus + ' retrouvés dans l’inventaire');
  const absents = [...carte.keys()].filter(f => !vu.has(f));
  if (absents.length) console.warn('  ⚠️ demandés par une leçon mais ABSENTS de l’inventaire : ' + absents.join(', '));
} catch (e) {
  console.warn('  ⚠️ parcours des leçons impossible (' + e.message + ') — on garde les leçons devinées');
}

/* ---------- état de chaque ligne ---------- */
function etat(l) {
  /* ⚠️ LA PRÉSENCE SUIT LA MÊME RÈGLE QUE jouerMot : -f (voix IA) essayé avant le nom
     plat, -h en dernier repli. Sans ça, un mot déposé UNIQUEMENT en -f (comme les 14
     de l'unité 8, jamais sous le nom plat) rendait « manquant » — silence annoncé,
     alors qu'une voix S'ENTEND, la mauvaise. « Manquant » et « à refaire » ne sont
     pas la même faute : l'un dit qu'il n'y a rien, l'autre que ce n'est pas SA voix. */
  l.present  = presents.has(l.fichier)
            || presents.has(l.fichier.replace(/\.mp3$/, '-f.mp3'))
            || presents.has(l.fichier.replace(/\.mp3$/, '-h.mp3'));
  l.taille   = tailles[l.fichier] || 0;
  l.precache = precache.has(l.fichier);
  l.attente  = attente.has(l.fichier);                 // une version IA dort dans audios-generes-a-valider/
  l.arefaire = AREFAIRE.has(l.fichier);                // voix IA : à redire avec la voix de Myriam
  l.statut = !l.present ? 'manquant'                   // → l'app parle avec la voix du téléphone
           : l.famille === 'Récitation' ? 'ok'          // jamais pré-cachée : mise en cache À L'ÉCOUTE (MEDIA)
           : l.arefaire ? 'a-refaire'                   // le fichier est là, mais ce n'est pas SA voix
           : l.famille === 'Orphelin' || l.famille === 'Orpheline' ? 'orphelin'
           : !l.precache ? 'hors-cache'                // existe, mais ne part pas hors ligne
           : 'ok';
  return l;
}
lignes.forEach(etat); consignes.forEach(etat);

const ordreFam = ['Mot', 'Voyelle', 'Nom de lettre', 'Son de lettre', 'Syllabe courte', 'Syllabe longue', 'Nom d’Allah', 'Récitation', 'Verset', 'Effet sonore', 'Orphelin'];
lignes.sort((a, b) => (a.unite || 99) - (b.unite || 99)
  || ordreFam.indexOf(a.famille) - ordreFam.indexOf(b.famille)
  || a.fichier.localeCompare(b.fichier));

const inv = {
  genere: new Date().toISOString(),
  disques: DISQUES,
  /* ⚠️ NE PAS AJOUTER L'UNITÉ 8 ICI : UNITS en compte DÉJÀ 12 — les cinq dernières
     sont des coquilles sans lettres ("La grammaire de la Fātiḥa — à construire"). Le
     sélecteur la propose donc tout seul ; l'y rajouter la ferait apparaître deux fois. */
  unites: UNITS.map(U => ({ no: U.no, sub: U.sub, lettres: U.letters })),
  arabe: lignes,
  francais: consignes,
  bilan: {
    arabe: compte(lignes), francais: compte(consignes),
    fichiersDansLeDossier: presents.size, fichiersPrecaches: precache.size,
    lecons63: couverture,   // { demandes, couverts } — la PREUVE que rien ne manque aux 63 lecons
  },
};
function compte(a) {
  const c = { total: a.length, ok: 0, manquant: 0, 'a-refaire': 0, orphelin: 0, 'hors-cache': 0 };
  a.forEach(l => c[l.statut]++); return c;
}

fs.writeFileSync(SORTIE, JSON.stringify(inv, null, 1));
console.log('inventaire.json écrit — ' + lignes.length + ' sons arabes, ' + consignes.length + ' consignes françaises');
console.log('  arabe    :', JSON.stringify(inv.bilan.arabe));
console.log('  français :', JSON.stringify(inv.bilan.francais));
console.log('  dossier  :', presents.size, 'mp3 · pré-cachés :', precache.size);
