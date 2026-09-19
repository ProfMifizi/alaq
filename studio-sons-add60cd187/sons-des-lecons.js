/* ═══ ALAQ — QUELLE LEÇON DEMANDE QUEL SON ? (10/08/2026) ═══════════════════════════
   L'inventaire savait dire QUELS sons existent ; il DEVINAIT à quelle leçon ils servent
   (des listes écrites à la main : « une syllabe courte, c'est les harakats et le bilan »).
   C'était faux dès qu'une leçon changeait — et ça ne prouvait rien sur la couverture.

   Ici on ne devine plus : on FAIT TOURNER les 9 constructeurs × 7 unités = les 63 leçons,
   et pour chaque écran on résout le son par les fonctions de l'app elles-mêmes
   (sayLetterName → sylBase / jouerMot / nom de lettre · speak → carte AUDIO).

   Sortie : Map( 'mim-fatha-son-court.mp3' → { unites:Set(1), lecons:Set('Les harakats'…) } )

   ⚠️ Les leçons tirent leurs distracteurs AU HASARD : on répète le parcours (PASSES) et on
   réunit les résultats, sinon un mot sur deux manquerait à l'appel.
   ⚠️ Tourne aussi chez Vercel (il ne lit que index.html) — mais l'appelant DOIT l'envelopper
   dans un try/catch : une liste devinée vaut mieux qu'un studio hors ligne.          */
const vm = require('vm');

const PASSES = 15;

/* ⛔ PLUS AUCUN DÉCOUPAGE D'index.html PAR MARQUEUR (16/09/2026). La fonction morceau() qui
   vivait ici a coûté quatre pannes silencieuses en huit jours (07, 10, 14 ×2/09), et une
   cinquième évitée de justesse le 16/09 (buildVerseTiles parti dans revision.js) : chaque
   extraction emportait sa borne, et l'appelant du studio avale les erreurs par choix. Tout ce
   que le bac lit vient désormais de fichiers ENTIERS, chargés dans l'ordre de la page. */

/* Les unités 1 à 7, lues là où l'app les lit : la semence générée depuis les
   packages JSON. On échoue fort si elle manque — un repli silencieux ferait
   disparaître les deux tiers du relevé sans un mot. */
function unitesSemees() {
  const f = require('path').join(__dirname, '..', 'alaq-vercel-static', 'content', 'unites.js');
  if (!require('fs').existsSync(f))
    throw new Error('content/unites.js introuvable — les unités 1 à 7 y vivent depuis le 06/09/2026. ' +
      'Lancer : node outils/semer-unites.mjs');
  const bac = { window: {} };
  vm.runInNewContext(require('fs').readFileSync(f, 'utf8'), bac);
  const u = bac.window.__ALAQ_UNITS;
  if (!Array.isArray(u) || !u.length)
    throw new Error('content/unites.js ne pose pas window.__ALAQ_UNITS');
  return u;
}

/* ── LE TABLEAU DE MYRIAM NE DOIT PAS TIRER AU SORT (14/09/2026) ──────────────
   Plusieurs constructeurs mélangent leurs écrans (`buildBilan` fait
   `shuffle(U.letters.slice())`, `buildWords` tire ses distracteurs…), et le bilan ne
   garde qu'une PARTIE de ce qu'il a mélangé. Résultat : deux relevés du MÊME code
   donnaient quinze étiquettes de leçon différentes — un son passait de « Les
   prolongations » à « Les prolongations · Bilan » sans qu'une ligne ait bougé.
   Myriam lit ce tableau pour savoir quoi enregistrer : il doit dire la même chose
   deux fois de suite, sinon on ne peut ni le comparer ni lui faire confiance.
   On remplace donc `Math.random` — DANS LE BAC SEULEMENT, jamais dans l'app — par une
   suite pseudo-aléatoire à graine fixe (mulberry32). Le tirage garde sa forme (les
   écrans restent mélangés, les distracteurs variés), mais il rend toujours le même
   mélange. L'app, elle, continue de tirer au hasard chez l'élève.
   ⚠️ La couverture ne dépend PAS de la graine : c'est `PASSES` (plus bas) qui rejoue
   chaque leçon assez de fois pour voir tous ses sons. Un relevé stable n'est pas un
   relevé partiel — le portillon compte 231 sons, il rougirait sinon. */
function hasardFixe(graine) {
  let t = graine >>> 0;
  return function () {
    t = (t + 0x6D2B79F5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function contexte(src) {
  /* un Math à nous : tout de l'original, sauf random() */
  const MathFixe = Object.create(Math);
  MathFixe.random = hasardFixe(20260914);
  const ctx = { console, Math: MathFixe, JSON, Object, Array, String, Number, RegExp, Set, Map,
                S: { err: {}, done: {}, rev: {} }, curSourate: 0, window: {}, save: () => {} };
  /* ⚠️ LE CONTRAT D'HÔTE DE L'UNITÉ 8 VIT DANS LA TRANCHE 3 (31/08, audit).
     Depuis le POC-1, `window.__alaqHoteU8 = { audioBeni, playSfx, … }` est posé
     ENTRE `const UNITS=[` et le marqueur de fin — or ces fonctions sont définies
     bien plus loin dans index.html, HORS tranche : la tranche levait
     ReferenceError, le try/catch d'inventaire.js retombait sur les leçons
     DEVINÉES et `bilan.lecons63` restait null — en silence, depuis le 18/08.
     Des COQUILLES suffisent : le contrat n'a besoin que de noms qui existent,
     personne ne joue de son dans ce bac à sable. */
  ['audioBeni','playSfx','objectifAtteint','advance','elogeHTML','toc','goNoHearts',
   'stopAudio','draggable','dansRectMarge','icoImg'].forEach(n => { ctx[n] = () => {}; });
  vm.createContext(ctx);
  /* 1 · LES BRIQUES ET LES UNITÉS — un FICHIER ENTIER depuis le 14/09/2026, plus une tranche.
     ZWJ, strip, formGlyph, letterKey, HK, MD, FATIHA et UNITS vivent dans donnees.js
     (sous-lot 2 de « extraire le lecteur »). C'est un gain : deux découpages par marqueurs
     de texte disparaissent — et c'est par eux que ce fichier est tombé en panne DEUX fois
     (07/09, puis 10/09), chaque fois en silence, l'appelant enveloppant tout dans un
     try/catch. Un fichier chargé en entier, comme la page le fait, ne peut pas rater sa borne.
     ⚠️ donnees.js lit `window.__ALAQ_UNITS` (la semence) et `LT` AU CHARGEMENT : la semence
     est posée juste au-dessus, et trace-lettres.js est chargé plus bas — donc on le charge
     AVANT donnees.js (l'ordre de la page : unites → assets → trace-lettres → donnees). */
  /* ⚠️ LES UNITÉS AVANT LA CARTE AUDIO — L'ORDRE DU FICHIER, PAS L'INVERSE
     (06/09/2026). Ces deux tranches étaient jouées dans l'ordre inverse de
     celui d'index.html, et ça ne se voyait pas tant que rien ne les liait.
     Depuis la migration, le bloc de la carte AUDIO se termine par une boucle
     qui lit `UNITS` pour poser le son de chaque mot : jouée en premier, elle
     levait « UNITS is not defined » — et comme l'appelant enveloppe tout ceci
     dans un try/catch, le studio retombait EN SILENCE sur ses leçons devinées.
     On suit désormais l'ordre réel : les unités d'abord, la carte ensuite. */
  /* la semence est posée sur `window` AVANT d'évaluer la construction, comme le
     fait la balise `<script src="content/unites.js">` dans la page : sinon
     `UNITS` retombe sur son repli et crie « content/unites.js absent » alors
     que le fichier est là — un faux rouge dans la sortie d'un outil. */
  ctx.window.__ALAQ_UNITS = unitesSemees();
  /* 🔴 13/09 — CASSÉ EN SILENCE DEPUIS LE 07/09 (trouvé par la revue adversariale du lot ui/).
     La borne de fin « Ordre corrigé le 02/08 » a quitté index.html avec progression.js
     (07/09), puis discsFor avec parcours.js (10/09) : morceau() levait « fin de marqueur
     absente : unités », et inventaire.js retombait EN SILENCE sur ses leçons devinées —
     exactement la panne du 18/08, rejouée six jours durant. La tranche va désormais jusqu'à
     splitUnits (le marqueur de la tranche 3, qui vit toujours ici), et les trois scripts
     classiques dont elle dépend sont chargés AVANT, comme la page le fait : trace-lettres.js
     (LT est lu de façon synchrone pour dériver U.strokes), progression.js (dkey, unitUnlocked,
     S — avec un localStorage et un document factices) et parcours.js (discsFor). */
  const APP = require('path').join(__dirname, '..', 'alaq-vercel-static');
  const lireApp = n => require('fs').readFileSync(require('path').join(APP, n), 'utf8');
  ctx.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  ctx.document = { addEventListener: () => {}, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], hidden: false, body: { appendChild: () => {} }, createElement: () => ({ classList: { add() {}, remove() {} }, style: {} }) };
  ctx.window.addEventListener = () => {}; ctx.window.removeEventListener = () => {};
  ctx.addEventListener = () => {}; ctx.removeEventListener = () => {};
  ctx.setTimeout = () => 0; ctx.clearTimeout = () => {}; ctx.setInterval = () => 0; ctx.clearInterval = () => {};
  ctx.navigator = { onLine: false, serviceWorker: undefined }; ctx.location = { hash: '', pathname: '/', search: '', hostname: 'studio' };
  ctx.Date = Date; ctx.Promise = Promise; ctx.Boolean = Boolean; ctx.isNaN = isNaN; ctx.parseInt = parseInt; ctx.parseFloat = parseFloat;
  ctx.globalThis = ctx; ctx.self = ctx;
  vm.runInContext(lireApp('trace-lettres.js'), ctx, { filename: 'trace-lettres.js' });
  vm.runInContext(lireApp('donnees.js'), ctx, { filename: 'donnees.js' });
  /* 2 · LES GÉNÉRATEURS ET LES NEUF CONSTRUCTEURS — un fichier entier, lui aussi (14/09).
     discsFor vient de parcours.js, qui les référence : generateurs.js doit être chargé avant. */
  vm.runInContext(lireApp('generateurs.js'), ctx, { filename: 'generateurs.js' });
  vm.runInContext(lireApp('progression.js'), ctx, { filename: 'progression.js' });
  vm.runInContext(lireApp('parcours.js'), ctx, { filename: 'parcours.js' });
  /* 🔴 LES UNITÉS 1 À 7 VIENNENT DE LA SEMENCE (06/09/2026), PAS DE LA TRANCHE.
     Elles ont migré vers `src/content/units/unit-0N.json`, et l'app les lit par
     `content/unites.js`. La tranche ci-dessus garde les générateurs, les neuf
     constructeurs et `discsFor` — mais son `UNITS` ne portera bientôt plus que
     les unités 8 à 12. Sans cette injection, tous les constructeurs
     tourneraient sur cinq unités : le relevé des sons rétrécirait des deux
     tiers, et `inventaire.js` retomberait EN SILENCE sur ses leçons devinées
     (son appelant enveloppe cet appel dans un try/catch).
     ⚠️ ON MUTE `UNITS` EN PLACE : c'est un `const`, et surtout les
     constructeurs de la tranche capturent CETTE référence. La réassigner ne
     changerait rien pour eux.
     ⚠️ Le montage vaut AVANT comme APRÈS le retrait : aujourd'hui la tranche
     porte les douze et la semence en remplace sept à l'identique ; demain elle
     n'en portera que cinq, et la semence complètera. */
  ctx.__SEMEES = unitesSemees();
  vm.runInContext(
    '(function(){' +
    '  var s = __SEMEES;' +
    '  var restantes = UNITS.filter(function(U){ return !s.some(function(x){ return x.no === U.no; }); });' +
    '  var toutes = s.concat(restantes).sort(function(a,b){ return a.no - b.no; });' +
    '  UNITS.length = 0; toutes.forEach(function(U){ UNITS.push(U); });' +
    '  if (UNITS.length !== 12) throw new Error("sons-des-lecons : " + UNITS.length + " unités au lieu de 12 — " +' +
    '    "le relevé des sons serait incomplet, et l’appelant retomberait en silence sur ses leçons devinées");' +
    '})();', ctx);
  /* 3 · LES GABARITS D'ÉCRAN — un fichier entier depuis le 15/09/2026 (sous-lot 3).
     `splitUnits`, `letAr`, `sylBase`, `jouerSyl` et les soixante autres gabarits vivent dans
     interactions.js ; la tranche « splitUnits → ttsRom » qui les taillait ici n'a plus de
     borne. ✅ 15/09 — LA TRANCHE « carte AUDIO » A DISPARU : le son vit dans son.js, qu'on
     charge ENTIER comme les autres scripts classiques. ✅ 16/09 — il n'en reste AUCUNE :
     buildVerseTiles est parti avec le hub Réviser dans revision.js, chargé ENTIER lui aussi
     (plus bas, après son.js et le versement des mots : il lit S, saveLocal et inscrireLeSon
     au chargement). Plus un seul marqueur de texte sur index.html. */
  vm.runInContext(require('fs').readFileSync(require('path').join(__dirname, '..', 'src', 'ecrans', 'index.js'), 'utf8'), ctx, { filename: 'src/ecrans/index.js' });
  vm.runInContext(lireApp('son.js'), ctx, { filename: 'son.js' });
  /* le grand script verse ensuite les mots des unités dans la table : on rejoue ce versement,
     sinon l'inventaire croirait que 85 mots n'ont pas de son. */
  vm.runInContext('UNITS.forEach(function(U){(U.words||[]).forEach(function(w){ if(w&&w.w&&w.snd)inscrireLeSon(w.w,w.snd); });});', ctx);
  // 4 · buildVerseTiles a besoin de l'état de l'élève : on suppose TOUT appris (couverture maximale)
  vm.runInContext(`
    knownLetterSet=function(){const s=new Set();UNITS.forEach(U=>(U.letters||[]).forEach(L=>s.add(letterKey(L))));s.add('ا');return s;};
    wordReadable=function(w,set){return [...strip(w)].every(ch=>set.has(letterKey(ch)));};`, ctx);
  /* 5 · LE HUB RÉVISER, entier (16/09) — buildVerseTiles y vit ; le bac a déjà S, saveLocal
     (progression.js), inscrireLeSon (son.js) et localStorage, tout ce qu'il lit au chargement.
     Une assertion de forme derrière : un fichier qui aurait bougé rendrait un relevé de
     versets VIDE sans un mot, et l'appelant du studio avale les erreurs par choix. */
  vm.runInContext(lireApp('revision.js'), ctx, { filename: 'revision.js' });
  if (vm.runInContext("typeof buildVerseTiles!=='function' || BOITES.length!==5 || VOIX.length!==17", ctx))
    throw new Error('revision.js : buildVerseTiles, BOITES ou VOIX absents après chargement — le relevé des versets serait vide');
  /* ⚠️ piège gravé du projet : un `const` de portée script n'est PAS une propriété du global.
     On récupère UNITS, AUDIO, LTRANS… en ÉVALUANT leur nom dans le contexte. */
  const val = e => vm.runInContext(e, ctx);
  /* ⚠️ LA TABLE REND DES NOMS NUS DEPUIS LE 15/09 ('mot-maktab'). Le studio, lui, raisonne
     en CHEMINS depuis toujours : on projette ici, à un seul endroit, plutôt que de toucher
     à ses dizaines de consommateurs. */
  const projeter = (t) => { const o = {}; for (const k in t) o[k] = 'audios-app-alaq/' + t[k] + '.mp3'; return o; };
  return { UNITS: val('UNITS'), AUDIO: projeter(val('SONS')), SONS: val('SONS'), LTRANS: val('LTRANS'),
           discsFor: val('discsFor'), sylBase: val('sylBase'), letterKey: val('letterKey') };
}

function carteDesSons(src) {
  /* ⚠️ 15/09 — `src` DEVIENT FACULTATIF. `inventaire.js` nous appelle désormais pour obtenir
     la table du son, et il nous appelait jusque-là en nous passant index.html qu'il avait lu
     lui-même. Les deux fichiers se `require` l'un l'autre : appelé depuis le HAUT
     d'inventaire.js, son `module.exports` n'existe pas encore et `src` arrivait `undefined`
     — une panne au premier `indexOf`. On lit le fichier nous-mêmes quand personne ne nous
     le donne : aucune dépendance, aucune boucle. */
  if (src === undefined) src = require('fs').readFileSync(require('path').join(__dirname, '..', 'alaq-vercel-static', 'index.html'), 'utf8');
  const { UNITS, AUDIO, LTRANS, discsFor, sylBase, letterKey } = contexte(src);
  const plat = c => c.replace('audios-app-alaq/', '');

  /* la résolution de l'app, ramenée au nom PLAT — celui sous lequel Myriam enregistre */
  const parNom = t => {                       // sayLetterName : syllabe → mot → nom de lettre
    if (typeof t !== 'string' || !t) return null;
    const b = sylBase(t);           if (b) return b + '.mp3';
    if (t.length > 3 && AUDIO[t])   return plat(AUDIO[t]);
    const tr = LTRANS[letterKey(t)]; return tr ? 'lettre-' + tr + '-nom.mp3' : null;
  };
  const parSpeak = t => {                     // speak : la carte AUDIO seule (sinon voix de synthèse)
    if (typeof t !== 'string' || !t) return null;
    return AUDIO[t] ? plat(AUDIO[t]) : parNom(t);
  };

  const carte = new Map();

  const cles = new Set();   /* les CLÉS que les écrans demandent (15/09) */
  const inconnus = new Set();
  const ordre = new Map();          // libellé de leçon -> son rang dans le parcours d'une unité
  /* On garde le détail PAR UNITÉ : sans lui, l'écran « voici les 28 lettres » de la leçon 1
     rattacherait TOUTES les lettres à l'unité 1 — vrai (on peut les toucher) mais trompeur
     pour qui enregistre : le ح s'enseigne en unité 5. L'appelant choisit la bonne vue. */
  const note = (f, unite, lecon) => {
    if (!f) return;
    if (!carte.has(f)) carte.set(f, { unites: new Set(), lecons: new Set(), parUnite: new Map() });
    const e = carte.get(f);
    e.unites.add(unite); e.lecons.add(lecon);
    if (!e.parUnite.has(unite)) e.parUnite.set(unite, new Set());
    e.parUnite.get(unite).add(lecon);
  };

  /* Ce que chaque TYPE d'écran fait sonner — relevé sur les gestionnaires de l'app :
     tsTap/fsTap/setupDrag/bulPop/fin de tracé → sayLetterName ;
     selson/harakat3/dragmad/dragassoc → speak ; assemble & read → le MOT.            */
  function ecran(st, u, lecon) {
    /* 15/09 — ON NOTE AUSSI LA CLÉ, PAS SEULEMENT LE FICHIER. Depuis que tout passe par une
       table, la question « ce fichier existe-t-il ? » ne suffit plus : il faut savoir si
       l'ÉCRAN demande une clé que la table connaît. C'est le trou qui a laissé passer le alif
       madda, les sièges de la hamza et quinze boutons du Cours — le banc comparait la table au
       disque, jamais l'écran à la table. `outils/verifier-son.mjs` lit `cles`. */
    const N = x => { if (typeof x === 'string' && x) cles.add(x); return note(parNom(x), u, lecon); };
    const P = x => { if (typeof x === 'string' && x) cles.add(x); return note(parSpeak(x), u, lecon); };
    switch (st.type || 'mcq') {
      case 'learn': case 'trace':  N(st.L); break;
      case 'formslide':            N(st.L); break;
      case 'tapset':               st.alphabet ? Object.keys(LTRANS).forEach(N)
                                               : (st.items || []).flat().forEach(N); break;
      case 'findset':              (st.targets || []).forEach(N); break;
      case 'fuse':                 (st.jeux || []).forEach(j => j.son ? note(plat(j.son), u, lecon) : N(j.fus)); break;
      case 'bulles':               (st.syllabes || []).forEach(N); (st.lettres || []).forEach(N); break;
      case 'selson':               (st.tous || []).forEach(P); break;
      case 'harakat3':             ['أَ', 'إِ', 'أُ'].forEach(P); break;
      case 'read':                 [...String(st.word || '')].forEach(c => { if (LTRANS[letterKey(c)]) N(c); });
                                   P(st.word); break;          // le mot entier sonne à la fin (jouerF)
      case 'assemble':             P(st.w && st.w.w); break;
      case 'dragmad':              P(st.result); break;
      case 'dragassoc':            (st.cells || []).forEach(c => { P(c.say || c.long); P(c.short); }); break;
      case 'spot': case 'vtiles':  break;    // récitation du verset : famille à part, jamais enregistrée ici
      case 'info': case 'slide':   break;    // écrans de texte : rien d'arabe à dire
      case 'mcq':
        if (st.spk) N(st.spk);
        if (st.audio) P(st.audio);
        (st.options || []).forEach(o => { if (o.snd !== undefined) st.spkOpts ? N(o.snd) : P(o.snd); });
        if (st.answer && (st.options || []).some(o => o.snd !== undefined)) P(st.answer); // la bonne réponse sonne après une erreur
        break;
      /* 15/09 — CES SIX TYPES N'ÉTAIENT PAS BALAYÉS, et c'est là que deux revues ont trouvé
         des écrans muets : les trois « chedda » de l'unité 1 et les sièges de la hamza. Un
         type non traité ne coûtait qu'un avertissement ; depuis que le silence remplace la
         voix de machine, il coûte un écran sans son. */
      case 'place':                (st.grps || []).forEach(g => P(String(g.pre || '') + String(g.fin || ''))); break;
      case 'tri': case 'bulmots':  (st.mots || []).forEach(m => N(typeof m === 'string' ? m : (m && m.w))); break;
      case 'flipcards':            (st.cartes || []).forEach(c => { P(c.cons); P(c.pro); }); break;
      case 'taprow':               (st.lignes || []).flat().forEach(P); break;
      case 'roles':                break;   // on touche la LETTRE (sayLetterName), les sièges ne font que s'allumer
      default: inconnus.add(st.type);
    }
  }

  for (let passe = 0; passe < PASSES; passe++)
    for (let u = 0; u < UNITS.length; u++) {
      if (!UNITS[u].letters || !UNITS[u].letters.length) continue;   // les 5 unités futures n'ont pas de leçons
      discsFor(u).forEach((d, di) => {
        // l'ordre PÉDAGOGIQUE vient du parcours lui-même : la table DISQUES ignore les
        // disques sur mesure (« Lettres vs prolongations » de l'unité 2), qui finissaient après le Bilan
        if (!ordre.has(d.label) || ordre.get(d.label) > di) ordre.set(d.label, di);
        let q; try { q = d.build(UNITS[u]); } catch (_) { return; }
        (q || []).filter(Boolean).forEach(st => ecran(st, UNITS[u].no, d.label));
      });
    }

  if (!carte.size) throw new Error('parcours des leçons : aucun son trouvé');
  if (!cles.size) throw new Error('parcours des leçons : aucune clé demandée');
  /* `table` (15/09) : la table du son elle-même, projetée en chemins. `inventaire.js` la
     réclame depuis que son extraction par littéral est devenue impossible — 151 des entrées
     naissent d'une règle, elles n'existent que si le code TOURNE. */
  return { carte, ordre, inconnus: [...inconnus], table: AUDIO, cles: [...cles] };
}

module.exports = { carteDesSons, PASSES };

/* ── LE MODE --verifier (13/09) ────────────────────────────────────────────
   Câblé dans npm run qa. Cet outil s'était cassé en silence le 07/09 (une borne de
   découpe partie avec progression.js) : l'appelant enveloppe tout dans un try/catch,
   par choix (une colonne devinée vaut mieux qu'un studio hors ligne chez Vercel) —
   mais un choix qui rend une panne invisible doit avoir sa sonnette ailleurs. C'est
   ici. Base de référence : 231 sons demandés par les 63 leçons (10/08/2026). */
if (require.main === module && process.argv.includes('--verifier')) {
  const fs = require('fs'), path = require('path');
  const src = fs.readFileSync(path.join(__dirname, '..', 'alaq-vercel-static', 'index.html'), 'utf8');
  let r;
  try { r = carteDesSons(src); }
  catch (e) { console.error('✗ sons-des-lecons.js ne parcourt plus index.html : ' + e.message + '\n  → le studio retombe EN SILENCE sur ses leçons devinées (inventaire.js)'); process.exit(1); }
  /* ⛔ LE TABLEAU DOIT DIRE LA MÊME CHOSE DEUX FOIS (14/09/2026). Plusieurs constructeurs
     mélangent leurs écrans, et le bilan ne garde qu'une partie de ce qu'il a mélangé : deux
     relevés du MÊME code donnaient quinze étiquettes de leçon différentes. Myriam lit ce tableau
     pour savoir quoi enregistrer — un tableau qui bouge tout seul ne peut être ni comparé ni cru.
     Le bac tire désormais sur une graine fixe (hasardFixe, plus haut) ; cet essai est sa sonnette. */
  let r2;
  try { r2 = carteDesSons(src); }
  catch (e) { console.error('✗ sons-des-lecons.js : le second relevé a levé — ' + e.message); process.exit(1); }
  const signature = (x) => [...x.carte.entries()].map(([k, v]) => k + '→' + [...(v.lecons || v)].sort().join('/')).sort().join('\n');
  if (signature(r) !== signature(r2)) {
    const A = signature(r).split('\n'), B = signature(r2).split('\n');
    const d = A.filter((l, i) => l !== B[i]).slice(0, 3);
    console.error('✗ sons-des-lecons.js : DEUX relevés du même code donnent deux tableaux différents — ' +
      'un tirage au sort s’est glissé dans le bac (le tableau de Myriam bougerait tout seul).\n  ex. ' + d.join('\n  ex. '));
    process.exit(1);
  }
  const n = r.carte.size;
  if (n < 200) { console.error('✗ sons-des-lecons.js : ' + n + ' son(s) demandé(s) seulement — la base est à 231 ; une tranche d’index.html s’est-elle vidée ?'); process.exit(1); }
  console.log('✓ sons-des-lecons.js : ' + n + ' sons demandés par les 63 leçons, ' + r.ordre.size + ' disques ordonnés, ' + r.inconnus.length + ' type(s) d’écran non traité(s)' + (r.inconnus.length ? ' (' + r.inconnus.join(' ') + ')' : ''));
  process.exit(0);
}
