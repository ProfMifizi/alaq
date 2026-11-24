/* GÉNÉRÉ par outils/preparer-mysteres-prod.py (source : _apercu-carte-joueuse-v9/carte.js) — ne pas retoucher à la main */
/* La carte joueuse v9 (24/11/2026) — UN seul code pour la préview de la carte ET pour le Profil de la préview de l'app (v10).
   Quatre sections : ① le prénom et « Niveau X : mot arabe • translittération » ; ② l'image carrée à gauche et six lignes à droite ; ③ la phrase d'encouragement et la citation ; ④ quatre disques dorés, l'icône par-dessus le cercle.
   Dépend de : window.DIYA (diya.js), window.CARTE_STATIONS / CARTE_COULEURS (_apercu-carte-joueuse-v1/donnees.js, GÉNÉRÉ depuis l'app), window.CARTE_CORAN (_apercu-carte-joueuse-v2/citations.js, GÉNÉRÉ).
   Les images (arrière-plans, icônes, coins) sont celles d'Artlist : _apercu-carte-joueuse-v9/images/ (outils/preparer-images-carte.py). */
(function(){
'use strict';
var W = window, D = W.DIYA, ST = W.CARTE_STATIONS, CO = W.CARTE_COULEURS, CORAN = W.CARTE_CORAN || {};
var C = W.CARTE = W.CARTE || {};
C.cfg = Object.assign({ images: 'images-app-alaq/mysteres/carte/', objBase: 'images-app-alaq/mysteres/indices/', policesBase: 'polices/', cssUrl: 'mysteres/carte.css' }, C.cfg || {});
var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
var nb = function(n){ return Number(n).toLocaleString('fr-FR'); };
var OBJETS = ['lune', 'sacs', 'jarres', 'lanterne', 'porte', 'natte', 'feuillet', 'bulle-icone', 'sandales'];

/* ——— le niveau : des points ET un nombre d'épi minimum (proposition de Myriam, 24/11) ——— */
C.PALIERS = [[0, 0], [10, 2], [25, 4], [50, 7], [100, 14], [200, 30], [300, 60]];
C.niveau = function(points, epi){ var n = 0; for (var i = 0; i < C.PALIERS.length; i++) if (points >= C.PALIERS[i][0] && epi >= C.PALIERS[i][1]) n = i; return n; };

/* ——— la phrase d'encouragement (tutoie le joueur) : par niveau, celle de Myriam (A) puis trois variantes (B, C, D) ——— */
C.VALORISANTES = [
  ['Tu transformes ton <b>intention</b> d’apprendre en un premier pas concret.', 'Ton <b>intention</b> d’apprendre vient de devenir un premier pas.', 'Tu as choisi de commencer : ton <b>intention</b> est déjà devenue un chemin.', 'Ce que tu voulais hier, tu le fais aujourd’hui : ton <b>intention</b> prend vie.'],
  ['Ton <b>ambition</b> te donne l’élan pour relever de nouveaux défis.', 'Ton <b>élan</b> te porte vers de nouveaux défis : continue !', 'Tu avances avec <b>envie</b> : chaque défi te rapproche du Livre.', 'Ton <b>ambition</b> grandit avec chaque mot que tu apprends.'],
  ['Chacun de tes <b>efforts</b> rend plus facile ce qui te semblait difficile.', 'Chaque <b>effort</b> que tu fais aplanit le chemin de demain.', 'Ce qui te semblait difficile devient simple, grâce à tes <b>efforts</b>.', 'Tu fournis un vrai <b>effort</b> : tes progrès parlent pour toi.'],
  ['Tu fais preuve de <b>persévérance</b> en essayant encore, même quand c’est difficile.', 'Ta <b>persévérance</b> parle pour toi : tu reviens, même quand c’est difficile.', 'Tu ne lâches pas : ta <b>persévérance</b> t’ouvre les portes du Coran.', 'Chaque jour où tu reviens, ta <b>persévérance</b> se renforce.'],
  ['Grâce à ta <b>patience</b>, tu te donnes le temps de progresser à ton rythme.', 'Ta <b>patience</b> te laisse le temps de grandir, à ton rythme.', 'Tu apprends sans te presser : ta <b>patience</b> porte déjà ses fruits.', 'Ta <b>patience</b> transforme chaque petit pas en vrai progrès.'],
  ['Ta <b>constance</b> fait de ton apprentissage une habitude dont tu peux être fier.', 'Ta <b>constance</b> a fait de l’arabe une habitude dont tu peux être fier.', 'Jour après jour, ta <b>constance</b> t’a mené plus loin que tu ne le pensais.', 'Tu tiens ton cap : ta <b>constance</b> est ta plus belle force.'],
  ['Tout ce que tu apprends est une <b>lumière</b> pour ton cœur et rayonne autour de toi.', 'Ce que tu apprends est une <b>lumière</b> pour ton cœur et pour ceux qui t’entourent.', 'Ta <b>lumière</b> grandit à chaque verset que tu comprends.', 'Tu portes une <b>lumière</b> : ce que tu apprends éclaire ceux qui t’entourent.']
];

/* ——— la citation : un hadith ou un verset qui loue la qualité du niveau, de l'apprentissage ou du comportement ; deux ou trois propositions par niveau (vérifiés par verificateur-sources-alaq le 24/11 : code/notes/verification-citations-carte-2026-11-24.md ; reste à trancher avec Myriam : le crédit QuranEnc sur les versets, la mention du Prophète ﷺ, 2664, 3:200, 24:35) ——— */
function premiere(t){ t = t || ''; var i = t.indexOf('. '); return i > 0 ? t.slice(0, i + 1) : t; }
function derniere(t){ t = t || ''; var i = t.lastIndexOf('. '); return i > 0 ? t.slice(i + 2) : t; }
var h = function(t, r){ return { t: t, r: r, cat: 'Hadith' }; }, c = function(t, r){ return { t: t, r: r, cat: 'Coran' }; };
C.CITATIONS = [
  [h('Les actes ne valent que par les intentions, et chacun n’obtient que ce qu’il a eu l’intention d’accomplir.', 'Bukhārī 1'), c((CORAN['96:1'] || '').replace(/,$/, '…'), 'Coran 96:1'), c(derniere(CORAN['20:114']), 'Coran 20:114')],
  [h('Aspire à ce qui t’est utile, demande l’aide d’Allah et ne te décourage pas.', 'Muslim 2664'), c(derniere(CORAN['20:114']), 'Coran 20:114'), h('Quiconque emprunte un chemin à la recherche du savoir, Allah lui facilite grâce à cela un chemin vers le Paradis.', 'Muslim 2699')],
  [c(CORAN['29:69'], 'Coran 29:69'), h('Quiconque emprunte un chemin à la recherche du savoir, Allah lui facilite grâce à cela un chemin vers le Paradis.', 'Muslim 2699'), c(CORAN['94:6'], 'Coran 94:6')],
  [h('Les actions les plus aimées d’Allah sont les plus régulières, même si elles sont peu nombreuses.', 'Bukhārī 6464'), c(CORAN['3:200'], 'Coran 3:200')],
  [h('Celui qui s’efforce d’être patient, Allah le rend patient. Et nul n’a reçu de don meilleur et plus vaste que la patience.', 'Bukhārī 1469'), c(CORAN['2:153'], 'Coran 2:153'), c(CORAN['94:6'], 'Coran 94:6')],
  [h('Dis : « Je crois en Allah », puis tiens-toi dans la droiture.', 'Muslim 38'), c(CORAN['46:13'], 'Coran 46:13'), h('Les actions les plus aimées d’Allah sont les plus régulières, même si elles sont peu nombreuses.', 'Bukhārī 6464')],
  [c(premiere(CORAN['24:35']), 'Coran 24:35')]
].map(function(l){ return l.filter(function(x){ return x.t; }); });

/* ——— les arrière-plans (Artlist) : la période de l'année ou l'événement ; « auto » suit la tenue ——— */
C.FONDS = [['uni', 'Uni (crème en mode sombre, marron foncé en mode clair)'], ['nuit', 'Nuit étoilée'], ['aube', 'Aube dans le désert'], ['ramadan', 'Ramadan'], ['mecque', 'La Mecque (le hajj)'], ['printemps', 'Printemps'], ['ete', 'Été'], ['automne', 'Automne'], ['hiver', 'Hiver']];
/* v6 : les arrière-plans se vendent dans la Boutique (prix d'exemple, en graines) ; la Nuit étoilée est offerte, « Selon la période » est toujours permis */
C.BOUTIQUE_FONDS = [
  { id: 'nuit', nom: 'Nuit étoilée', note: 'Le ciel du désert, la nuit.', prix: 0 },
  { id: 'aube', nom: 'Aube dans le désert', note: 'Le soleil se lève sur les dunes.', prix: 50 },
  { id: 'ramadan', nom: 'Ramadan', quand: 'Pendant le Ramadan', note: 'Des lanternes dorées dans la nuit.', prix: 70 },
  { id: 'mecque', nom: 'La Mecque', quand: 'Pendant le hajj', note: 'La Kaaba, au crépuscule.', prix: 70 },
  { id: 'printemps', nom: 'Printemps', note: 'Des collines vertes et des amandiers en fleurs.', prix: 50 },
  { id: 'ete', nom: 'Été', note: 'Le soleil sur les dunes et une oasis.', prix: 50 },
  { id: 'automne', nom: 'Automne', note: 'Des feuilles dorées dans l’air.', prix: 50 },
  { id: 'hiver', nom: 'Hiver', note: 'Un crépuscule de neige.', prix: 50 }
];
C.fondDeBoutique = function(id){ return C.BOUTIQUE_FONDS.filter(function(f){ return f.id === id; })[0] || null; };
/* v7 : l'arrière-plan PAR DÉFAUT de la mascotte, sur la carte comme sur le disque du Profil, est UNI (Myriam, 24/11) : crème en mode sombre, marron foncé en mode clair ; les images se choisissent une fois achetées */
/* v7 : l'arrière-plan UNI peut prendre une couleur au choix du joueur (gratuite) ; par défaut : crème en mode sombre, marron foncé en mode clair */
C.COULEURS = [['sable', 'Sable', '#EAD9B8'], ['rose', 'Rose', '#F1CFCF'], ['ciel', 'Ciel', '#C6DDEC'], ['menthe', 'Menthe', '#CFE6D3'], ['lavande', 'Lavande', '#DDD2EE'], ['or', 'Or doux', '#F2DC96'],
  ['marine', 'Marine', '#1F3252'], ['vert', 'Vert profond', '#1F3D30'], ['bordeaux', 'Bordeaux', '#4C2230'], ['violet', 'Violet nuit', '#2E2755'], ['ardoise', 'Ardoise', '#2F3439']];
C.couleurOk = function(v){ return /^#[0-9a-fA-F]{6}$/.test(v || ''); };
C.fondDe = function(E){ var f = E.fond; return C.FONDS.some(function(d){ return d[0] === f; }) ? f : 'uni'; };
/* les coins : l'étoile à huit pointes (dessinée) et quatre motifs d'Artlist */
C.COINS = [['etoile', 'Étoile à huit pointes'], ['arabesque', 'Arabesque fleurie'], ['geometrique', 'Entrelacs géométrique'], ['croissant', 'Croissant et étoile'], ['epi', 'Épis de blé']];
/* les lignes qui RELIENT les illustrations des quatre coins (plus de cadre fin derrière) : pour chaque motif, la distance (en q) de la ligne au bord, mesurée sur l'image d'Artlist (ty : lignes du haut et du bas ; tx : lignes de gauche et de droite), son épaisseur et sa couleur ; « depart » : où la ligne commence (sous l'illustration) */
/* v8 : les tiges droites sont ROGNÉES dans l'image du coin (x ≥ 414 px, y ≥ 427 px) ; les lignes les remplacent et partent 0,6 q AVANT le bout rogné (deph 34,5 q, depv 35,8 q), sous les feuilles. v7 : pour les épis, les lignes ont l'épaisseur (lth horizontale, ltv verticale), la place (ty, tx) et le dessin (trait brun o, cœur doré c, trait de ow q) des TIGES de l'image, mesurés sur coin-epi.webp (640 px = 62 q : 0,096875 q par pixel) */
C.LIGNES = { etoile: { ty: 4, tx: 4, lt: 1.6, c: '#D0870D', depart: 16 }, arabesque: { ty: -0.4, tx: 3.3, lt: 1.7, c: '#A17918', depart: 50 }, geometrique: { ty: 5.3, tx: 5.3, lt: 2.4, c: '#885F10', depart: 50 }, croissant: { ty: -1.7, tx: -2, lt: 1.3, c: '#7A5208', depart: 50 }, epi: { ty: 3.7975, tx: 3.9124, lth: 0.8673, ltv: 0.8448, owh: 0.192, owv: 0.229, c: '#ECBD4E', o: '#946C0A', depart: 35, deph: 34.5, depv: 35.8 } };
function tracerLiaisons(E){
  var k = E.coins || 'etoile', L = C.LIGNES[k] || C.LIGNES.etoile;
  var lth = L.lth || L.lt, ltv = L.ltv || L.lt, o = L.o || L.c, owh = L.owh || L.ow || 0, owv = L.owv || L.ow || 0;
  var comm = ';--lc:' + L.c + ';--lo:' + o;
  var h = '--ty:' + L.ty + ';--lth:' + lth + ';--ow:' + owh + ';--dep:' + (L.deph || L.depart) + comm, v = '--tx:' + L.tx + ';--ltv:' + ltv + ';--ow:' + owv + ';--dep:' + (L.depv || L.depart) + comm;
  return '<span class="lg lg-h lg-t" style="' + h + '"></span><span class="lg lg-h lg-b" style="' + h + '"></span><span class="lg lg-v lg-l" style="' + v + '"></span><span class="lg lg-v lg-r" style="' + v + '"></span>';
}
C.ICONES = { graine: 'icone-graine.webp', epi: 'icone-epi.png', livre: 'icone-livre.webp', cadenas: 'icone-cadenas.webp' };

function etoile8(){ return '<svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true"><path d="M20 2l4.6 9.8L35 8.9l-2.9 10.4L38 20l-5.9.7L35 31.1 24.6 28.2 20 38l-4.6-9.8L5 31.1l2.9-10.4L2 20l5.9-.7L5 8.9l10.4 2.9z" fill="currentColor"/><circle cx="20" cy="20" r="5.2" fill="#F7F1E4"/></svg>'; }
function coins(E){
  var k = E.coins || 'etoile', h = '';
  ['c1', 'c2', 'c3', 'c4'].forEach(function(p){ h += k === 'etoile' ? '<span class="coin ' + p + '">' + etoile8() + '</span>' : '<img class="coin orn ' + p + '" src="' + C.cfg.images + 'coin-' + esc(k) + '.webp" alt="">'; });
  return h;
}
/* le contour de Diya (filtre « dct ») est rallumé par un style en ligne : sur un arrière-plan clair (aube, été, hiver…), elle reste lisible */
function diya(E){ var svg = D.svg(E.tenue || 'classique', { taille: 100, anime: false }).replace(/(<g class="dy-sil" filter="(url\(#[^)]+\))")/, '$1 style="filter:$2"'); return '<span class="pose">' + svg + '</span>'; }
var CRAYON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.2-4.6L16.3 4.3a2.1 2.1 0 0 1 3 3L8.2 18.8z"/><path d="M14.6 6l3.4 3.4"/></svg>';
function visuel(E){ var f = C.fondDe(E), mod = !!E.modifiable; return '<div class="vis" data-fond="' + esc(f) + '"' + (mod ? ' role="button" tabindex="0" data-lm="fond-carte" aria-label="Changer l’arrière-plan de la carte"' : '') + (f === 'uni' && C.couleurOk(E.couleur) ? ' data-couleur="1" style="background:' + E.couleur + '"' : '') + '>' + (f === 'uni' ? '' : '<img class="fond" src="' + C.cfg.images + 'fond-' + esc(f) + '.webp" alt="">') + diya(E) + (mod ? '<span class="vis-edit" aria-hidden="true">' + CRAYON + '</span>' : '') + '</div>'; }
function neuf(E){ var x = ''; for (var i = 0; i < 9; i++) x += '<i' + (i < E.indices ? ' class="on"><img src="' + C.cfg.objBase + OBJETS[i] + '.webp" alt="">' : '>') + '</i>'; return '<div class="neuf9" role="img" aria-label="' + E.indices + ' indices débloqués sur 9">' + x + '</div>'; }
function disque(val, ic, lib){ var s = String(val); return '<div class="dq" role="img" aria-label="' + esc(s + ' ' + lib) + '"><span class="num' + (s.length > 4 ? ' long' : (s.length > 2 ? ' mid' : '')) + '">' + esc(s) + '</span><img class="ic" src="' + C.cfg.images + C.ICONES[ic] + '" alt=""></div>'; }
function lbl(E){ var s = ST[E.station]; return 'Carte de ' + E.nom + ' : niveau ' + (E.station + 1) + ', ' + s.tr + ', ' + s.fr + '. Sourate ' + E.sourate + ', unité ' + E.unite + ', leçon ' + E.lecon + '. ' + nb(E.graines) + ' graines, ' + E.mots + ' mots acquis, ' + E.epi + ' jours d’affilée, ' + E.mysteres + ' mystères débloqués.'; }
C.citation = function(E){ var l = C.CITATIONS[E.station]; return l[Math.min(E.cit || 0, l.length - 1)]; };

/* ——— la carte ——— */
C.html = function(E){
  var s = ST[E.station], r = CO[E.station], ci = C.citation(E), v = C.VALORISANTES[E.station][Math.min(E.valo || 0, 3)];
  var lignes = [
    '<li><b>Sourate :</b> ' + esc(E.sourate) + '</li>',
    '<li><b>Unité ' + E.unite + '</b> • <b>Leçon ' + E.lecon + '</b></li>',
    '<li><b>' + nb(E.graines) + '</b> ' + (E.graines > 1 ? 'graines' : 'graine') + '</li>',
    '<li><b>' + nb(E.mots) + '</b> ' + (E.mots > 1 ? 'mots acquis' : 'mot acquis') + '</li>',
    '<li><b>' + nb(E.epi) + '</b> ' + (E.epi > 1 ? 'jours' : 'jour') + ' d’affilée</li>',
    '<li><b>' + nb(E.mysteres) + '</b> ' + (E.mysteres > 1 ? 'mystères débloqués' : 'mystère débloqué') + '</li>'
  ].join('');
  return '<div class="cw" id="carte"><article class="carte" data-theme="' + (E.theme || (document.documentElement.classList.contains('clair') ? 'clair' : 'sombre')) + '" data-fond="' + esc(C.fondDe(E)) + '" data-coins="' + esc(E.coins || 'etoile') + '" style="--rang:' + esc(r) + '" aria-label="' + esc(lbl(E)) + '"><div class="cadre">' + tracerLiaisons(E) + coins(E) +
    '<header class="s1"><h3 class="nom">' + esc(E.nom) + '</h3><p class="niv"><b>Niveau ' + (E.station + 1) + '</b> : <span class="ar" lang="ar">' + s.ar + '</span> <span class="tr">• ' + esc(s.tr).replace(/-/g, '‑') + '</span></p></header>' +
    '<section class="s2">' + visuel(E) + '<ul class="six">' + lignes + '</ul></section>' +
    '<section class="s3"><p class="val">' + v + '</p><figure class="cit"><blockquote>«\u00a0' + esc(ci.t) + '\u00a0»\u00a0<cite>•\u00a0' + esc(ci.r).replace(/ /g, '\u00a0') + '</cite></blockquote></figure></section>' +
    '<section class="s4 disques">' + disque(nb(E.graines), 'graine', 'graines') + disque(E.epi, 'epi', 'jours d’épi') + disque(E.mots, 'livre', 'mots') + disque(E.mysteres, 'cadenas', 'mystères') + '</section>' +
    (E.neuf ? neuf(E) : '') + '</div><span class="reflet"></span></article></div>';
};
C.ajuster = function(racine){
  (racine || document).querySelectorAll('.carte .nom').forEach(function(n){
    n.style.fontSize = '';
    for (var k = 0; k < 8 && n.scrollWidth > n.clientWidth + 0.5; k++){ n.style.fontSize = Math.max(parseFloat(getComputedStyle(n).fontSize) * (n.clientWidth / n.scrollWidth) * 0.97, 9) + 'px'; }
  });
};
C.brancher = function(cw){
  var calme = matchMedia('(prefers-reduced-motion: reduce)').matches, c = cw.querySelector('.carte');
  function bouge(ev){ var r = cw.getBoundingClientRect(), x = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)), y = Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height));
    c.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); c.style.setProperty('--my', (y * 100).toFixed(1) + '%'); c.classList.add('touche');
    if (!calme){ c.classList.add('bouge'); c.style.transform = 'rotateY(' + ((x - .5) * 14).toFixed(2) + 'deg) rotateX(' + ((.5 - y) * 12).toFixed(2) + 'deg)'; } }
  function repos(){ c.classList.remove('touche', 'bouge'); c.style.transform = ''; }
  cw.addEventListener('pointermove', bouge); cw.addEventListener('pointerdown', bouge); cw.addEventListener('pointerleave', repos); cw.addEventListener('pointercancel', repos);
  cw.addEventListener('pointerup', function(ev){ if (ev.pointerType !== 'mouse') repos(); });
};
/* le texte de partage : l'adresse est un LIEN (https://alaq.fr) */
C.texte = function(E){ var s = ST[E.station]; return 'J’ai atteint le niveau ' + (E.station + 1) + ' 🎉 : ' + s.tr + ' (' + s.fr + '). J’apprends l’arabe avec le Coran sur https://alaq.fr'; };

/* ——— l'image partagée : la carte dessinée À LA DEMANDE (HTML → SVG → canvas), polices et images embarquées ——— */
var _polices = null, _css = null;
function aDataURL(url){ return fetch(url).then(function(r){ if (!r.ok) throw new Error(url); return r.blob(); }).then(function(b){ return new Promise(function(ok){ var f = new FileReader(); f.onload = function(){ ok(f.result); }; f.readAsDataURL(b); }); }); }
function policesIntegrees(){
  if (_polices) return Promise.resolve(_polices);
  var base = C.cfg.policesBase;
  return fetch(base + 'polices.css').then(function(r){ return r.text(); }).then(function(css){
    var blocs = (css.match(/@font-face\s*\{[^}]*\}/g) || []).filter(function(b){ return /(nunito-(700|800|900)-latin(-ext)?|noto-naskh-arabic-700-arabic)\.woff2/.test(b); });
    return Promise.all(blocs.map(function(b){ var m = b.match(/url\(\.\/([^)]+)\)/); return aDataURL(base + m[1]).then(function(d){ return b.replace(m[0], 'url(' + d + ')'); }); }));
  }).then(function(l){ return (_polices = l.join('\n')); });
}
function cssCarte(){
  if (_css) return Promise.resolve(_css);
  var s = document.getElementById('css-carte'); if (s && s.textContent) return Promise.resolve((_css = s.textContent));
  return fetch(C.cfg.cssUrl).then(function(r){ return r.text(); }).then(function(t){ return (_css = t); });
}
C.png = function(){
  var cw = document.getElementById('carte'), clone = cw.cloneNode(true);
  clone.style.width = '860px'; var c = clone.querySelector('.carte'); c.classList.remove('touche', 'bouge'); c.style.transform = ''; c.style.setProperty('--mx', '30%'); c.style.setProperty('--my', '22%');
  clone.querySelectorAll('.vis-edit').forEach(function(n){ n.parentNode.removeChild(n); });
  clone.querySelectorAll('.vis[role]').forEach(function(n){ n.removeAttribute('role'); n.removeAttribute('tabindex'); n.removeAttribute('data-lm'); n.removeAttribute('aria-label'); });
  var imgs = Array.prototype.slice.call(clone.querySelectorAll('img'));
  return Promise.all(imgs.map(function(im){ return aDataURL(im.getAttribute('src')).then(function(d){ im.setAttribute('src', d); }); })).then(function(){ return Promise.all([policesIntegrees(), cssCarte()]); }).then(function(r){
    var html = '<div xmlns="http://www.w3.org/1999/xhtml" class="expo"><style><![CDATA[' + r[0] + r[1] + ']]></style>' + new XMLSerializer().serializeToString(clone) + '<div class="signature">ALAQ <span>alaq.fr</span></div></div>';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><foreignObject x="0" y="0" width="1080" height="1350">' + html + '</foreignObject></svg>';
    return new Promise(function(ok, ko){ var im = new Image(); im.onload = function(){ ok(im); }; im.onerror = function(){ ko(new Error('Image SVG illisible')); }; im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); });
  }).then(function(im){
    var cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350; var x = cv.getContext('2d'); x.drawImage(im, 0, 0);
    return new Promise(function(ok){ setTimeout(function(){ x.drawImage(im, 0, 0); ok(); }, 60); }).then(function(){ return new Promise(function(ok, ko){ cv.toBlob(function(b){ b ? ok(b) : ko(new Error('PNG vide')); }, 'image/png'); }); });
  });
};
})();
