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

/* on découpe index.html par MARQUEURS, jamais par numéro de ligne (le fichier bouge tous les jours) */
function morceau(src, debut, fin, nom) {
  const i = src.indexOf(debut); if (i < 0) throw new Error('marqueur absent : ' + nom);
  const j = src.indexOf(fin, i); if (j < 0) throw new Error('fin de marqueur absente : ' + nom);
  return src.slice(i, j);
}

function contexte(src) {
  const ctx = { console, Math, JSON, Object, Array, String, Number, RegExp, Set, Map,
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
  // 1 · les briques (ZWJ, strip, formGlyph, letterKey, HK, MD, FATIHA…)
  vm.runInContext(morceau(src, 'const ZWJ=', 'const UNITS=[', 'briques'), ctx);
  // 2 · splitUnits → ttsRom : ce bloc embarque AUSSI LTRANS, sylBase et la carte AUDIO
  vm.runInContext(morceau(src, 'function splitUnits(word){', 'function ttsRom', 'splitUnits'), ctx);
  // 3 · les unités, les générateurs, les 9 constructeurs et discsFor
  vm.runInContext(morceau(src, 'const UNITS=[', '/* Ordre corrigé le 02/08', 'unités'), ctx);
  // 4 · buildVerseTiles a besoin de l'état de l'élève : on suppose TOUT appris (couverture maximale)
  vm.runInContext(`
    knownLetterSet=function(){const s=new Set();UNITS.forEach(U=>(U.letters||[]).forEach(L=>s.add(letterKey(L))));s.add('ا');return s;};
    wordReadable=function(w,set){return [...strip(w)].every(ch=>set.has(letterKey(ch)));};`, ctx);
  vm.runInContext(morceau(src, 'function buildVerseTiles(vi){', '\nfunction ', 'verseTiles'), ctx);
  /* ⚠️ piège gravé du projet : un `const` de portée script n'est PAS une propriété du global.
     On récupère UNITS, AUDIO, LTRANS… en ÉVALUANT leur nom dans le contexte. */
  const val = e => vm.runInContext(e, ctx);
  return { UNITS: val('UNITS'), AUDIO: val('AUDIO'), LTRANS: val('LTRANS'),
           discsFor: val('discsFor'), sylBase: val('sylBase'), letterKey: val('letterKey') };
}

function carteDesSons(src) {
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
    const N = x => note(parNom(x), u, lecon);
    const P = x => note(parSpeak(x), u, lecon);
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
  return { carte, ordre, inconnus: [...inconnus] };
}

module.exports = { carteDesSons, PASSES };
