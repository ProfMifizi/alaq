/* GÉNÉRÉ par outils/preparer-mysteres-prod.py (source : _apercu-secrets-diya-v17/diya.js) — ne pas retoucher à la main */
/* Diya — la garde-robe de la mascotte (préview v4 : un fin contour sombre sur fond clair, demandé par Myriam le 23/11 ; en v4 « 0,5 » (sa réponse) devient le réglage par défaut ; les v1, v2 et v3 ne sont plus touchées ; rien n'est dans src/).
   Script classique : window.DIYA = { svg(id, {taille, anime}), TENUES, GROUPES, tenue(id) }.
   Le corps est celui de la mascotte de l'app (src/web/squelette.js, #masc) : mêmes formes, même viewBox 0 0 200 236, mêmes
   classes d'animation (mhalo, mcorps, mbassin, mjambe) ; seules les couleurs changent et des accessoires s'ajoutent, posés à des
   « crans » : back (derrière le halo), halo, ring (anneau), arms (bras), dome (dôme), rim (bandeau), glass (cœur du verre),
   base (devant le socle), front (devant le corps), over (par-dessus tout, hors du corps qui bouge).
   Aucune police n'est nécessaire hors le seul « Journée de l'alphabétisation » (quatre lettres arabes en <text>).
   LE CONTOUR : tout ce qui est le CORPS de Diya (anneau, bras, dôme, verre, socle, pieds et les accessoires qui y sont accrochés : besace, écharpe, croissant…) passe dans un groupe .dy-sil
   que le filtre SVG « dct » entoure d'un trait sombre. Il ne s'allume que sur fond clair (diya.css : html:not(.clair) .dy-sil{filter:none}). Le halo, les ondes, les feuilles qui tournent,
   les étincelles, les flocons et les confettis (crans back, halo, over) ne font PAS partie du corps : pas de contour. L'épaisseur est en PIXELS D'ÉCRAN (opt.contour, 0,5 par défaut depuis la v4, jamais moins d'un pixel d'écran). */
(function(){
'use strict';
var N = 0;
var BASE = { m:'#EFA63C', md:'#E39B2E', mb:'#E8A94F', leg:'#F58A22', halo:'#F0A73C', haloC:'#FFD98A', ring:'#B9B2AC',
             glass:'#F7EBC0', glassHi:'#FFF8E0', domeHi:'#FFD98A', mouth:'#E2622A', eye:'#1B2A3A' };
function r2(v){ return Math.round(v * 100) / 100; }

/* ——— les petites pièces ——— */
function etincelle(x, y, s, fill, cls, delai){
  var k = s * 0.2;
  return '<path class="dy-e' + (cls ? ' ' + cls : '') + '"' + (delai != null ? ' style="animation-delay:' + delai + 's"' : '') + ' fill="' + fill +
    '" d="M' + x + ' ' + r2(y - s) + 'Q' + r2(x + k) + ' ' + r2(y - k) + ' ' + r2(x + s) + ' ' + y + 'Q' + r2(x + k) + ' ' + r2(y + k) + ' ' + x + ' ' + r2(y + s) +
    'Q' + r2(x - k) + ' ' + r2(y + k) + ' ' + r2(x - s) + ' ' + y + 'Q' + r2(x - k) + ' ' + r2(y - k) + ' ' + x + ' ' + r2(y - s) + 'Z"/>';
}
/* un croissant qui s'ouvre vers la droite quand rot = 0 */
function croissant(cx, cy, r, fill, rot){
  var R = r * 1.32;
  return '<path transform="translate(' + cx + ' ' + cy + ') rotate(' + rot + ')" fill="' + fill + '" d="M0 ' + (-r) + 'A' + r + ' ' + r + ' 0 1 0 0 ' + r + 'A' + r2(R) + ' ' + r2(R) + ' 0 0 1 0 ' + (-r) + 'Z"/>';
}
/* un nœud : deux boucles, un cœur, deux pans (taille 1 ≈ 30 de large) */
function noeud(cx, cy, s, c1, c2){
  return '<g transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')">' +
    '<path d="M-1 1L-10 15L-4.5 13.5L-1.5 18L3 4Z" fill="' + c2 + '"/><path d="M1 1L10 15L4.5 13.5L1.5 18L-3 4Z" fill="' + c2 + '"/>' +
    '<path d="M0 0C-5-9-16-9-16-2C-16 5-6 6 0 0Z" fill="' + c1 + '"/><path d="M0 0C5-9 16-9 16-2C16 5 6 6 0 0Z" fill="' + c1 + '"/>' +
    '<path d="M-3 -1.5C-7-5-11-4-11-2" fill="none" stroke="' + c2 + '" stroke-width="1" stroke-linecap="round" opacity=".55"/>' +
    '<circle cx="0" cy="0" r="3.4" fill="' + c2 + '"/></g>';
}
function fleur(x, y, r, petale, coeur){
  var s = '<g transform="translate(' + x + ' ' + y + ')">';
  for(var i = 0; i < 5; i++){ var a = i * 72 * Math.PI / 180 - Math.PI / 2; s += '<circle' + (petale === '#FFFFFF' ? ' data-c="blanc"' : '') + ' cx="' + r2(Math.cos(a) * r * 1.05) + '" cy="' + r2(Math.sin(a) * r * 1.05) + '" r="' + r2(r * 0.62) + '" fill="' + petale + '"/>'; }
  return s + '<circle r="' + r2(r * 0.5) + '" fill="' + coeur + '"/></g>';
}
function feuille(x, y, l, rot, fill, nerv){
  return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')"><path d="M0 0Q' + r2(l * 0.3) + ' ' + r2(-l * 0.42) + ' ' + l + ' 0Q' + r2(l * 0.3) + ' ' + r2(l * 0.42) + ' 0 0Z" fill="' + fill + '"/>' +
    (nerv ? '<path d="M' + r2(l * 0.1) + ' 0H' + r2(l * 0.86) + '" stroke="' + nerv + '" stroke-width="1.2" stroke-linecap="round" fill="none"/>' : '') + '</g>';
}
function flocon(x, y, r, col, op){
  var d = '', i, a, k, b, px, py, L;
  for(i = 0; i < 3; i++){ a = i * 60 * Math.PI / 180; d += 'M' + r2(-Math.cos(a) * r) + ' ' + r2(-Math.sin(a) * r) + 'L' + r2(Math.cos(a) * r) + ' ' + r2(Math.sin(a) * r); }
  for(k = 0; k < 6; k++){
    b = k * 60 * Math.PI / 180; px = Math.cos(b) * r * 0.62; py = Math.sin(b) * r * 0.62; L = r * 0.3;
    d += 'M' + r2(px) + ' ' + r2(py) + 'l' + r2(Math.cos(b + 0.9) * L) + ' ' + r2(Math.sin(b + 0.9) * L) + 'M' + r2(px) + ' ' + r2(py) + 'l' + r2(Math.cos(b - 0.9) * L) + ' ' + r2(Math.sin(b - 0.9) * L);
  }
  return '<g class="dy-neige" transform="translate(' + x + ' ' + y + ')" opacity="' + (op || 1) + '"><path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + r2(Math.max(1, r * 0.17)) + '" stroke-linecap="round"/></g>';
}
function onde(cx, cy, rx, ry, amp, k, ph, col, w, op, cls){
  var d = '', i, t, m;
  for(i = 0; i <= 90; i++){ t = i / 90 * 2 * Math.PI; m = 1 + amp * Math.sin(k * t + ph); d += (i ? 'L' : 'M') + r2(cx + Math.cos(t) * rx * m) + ' ' + r2(cy + Math.sin(t) * ry * m); }
  return '<path' + (cls ? ' class="' + cls + '"' : '') + ' d="' + d + 'Z" fill="none" stroke="' + col + '" stroke-width="' + w + '" opacity="' + op + '"/>';
}
function etoilesHalo(col){
  var s = '', i, a, rr, T = [6.6, 4.2, 5.4];
  for(i = 0; i < 12; i++){
    a = (i * 30 + (i % 2 ? 14 : 0)) * Math.PI / 180; rr = 92 + (i % 3) * 3;
    s += etincelle(r2(100 + Math.cos(a) * rr), r2(126 + Math.sin(a) * rr * 1.04), T[i % 3], col, 'tw', r2((i * 0.37) % 2.6));
  }
  return s;
}
var CONFETTIS = [[22,44,5,3,25,'#E8B63A'],[44,20,4,4,0,'#C8442F'],[160,30,5,3,-30,'#2F8F8A'],[178,66,4,4,0,'#E8B63A'],[12,96,5,3,60,'#F2E9DA'],
  [186,110,5,3,-20,'#C8442F'],[30,140,4,4,0,'#2F8F8A'],[172,150,5,3,40,'#E8B63A'],[48,196,5,3,-40,'#F2E9DA'],[154,206,4,4,0,'#C8442F'],[100,6,4,3,15,'#2F8F8A'],[134,18,4,4,0,'#F2E9DA']];
function confettis(cls){
  return CONFETTIS.map(function(c, i){
    return '<rect' + (cls ? ' class="' + cls + '" style="animation-delay:' + r2((i * 0.43) % 3.2) + 's"' : '') + ' x="' + c[0] + '" y="' + c[1] + '" width="' + (c[2] * 1.5) + '" height="' + (c[3] * 1.5) + '" rx="1.2" fill="' + c[5] + '"' + (c[5] === '#F2E9DA' ? ' data-c="creme"' : '') + ' transform="rotate(' + c[4] + ' ' + c[0] + ' ' + c[1] + ')"/>';
  }).join('');
}

/* ——— l'écharpe d'hiver (refaite) : un vrai tour de cou qui passe DEVANT le socle, un nœud, deux pans qui pendent devant ——— */
function echarpe(c1, c2, c3){
  return '' +
    /* le pan du fond, plus sombre */
    '<path d="M107 178L124 179Q122 193 125 206L108 208Q110 192 107 178Z" fill="' + c3 + '"/>' +
    '<path d="M108.5 196L124.2 197.4M108.4 201L124.8 202.4" stroke="' + c2 + '" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>' +
    '<path d="M111 208.5v5M116 208v5M121 207.6v5" stroke="' + c3 + '" stroke-width="2.2" stroke-linecap="round"/>' +
    /* le tour de cou, en arc comme un sourire (vu de face, un peu d'en haut) */
    '<path d="M54 154Q100 171 146 154Q153 164 146 174Q100 192 54 174Q47 164 54 154Z" fill="' + c1 + '"/>' +
    '<path d="M56 160.2Q100 177 144 160.2M56 167.2Q100 184 144 167.2" fill="none" stroke="' + c2 + '" stroke-width="2.4" stroke-linecap="round" opacity=".95"/>' +
    /* le pan de devant */
    '<g class="pan"><path d="M118 177L141 175Q145 192 146 209L121 213Q122 194 118 177Z" fill="' + c1 + '"/>' +
    '<path d="M121.5 197.6L145.6 195.6M121.8 203.6L145.9 201.6" stroke="' + c2 + '" stroke-width="2.6" stroke-linecap="round"/>' +
    '<path d="M124.5 213.4v6M130 213v6M135.5 212.5v6M141 212v6" stroke="' + c1 + '" stroke-width="2.4" stroke-linecap="round"/></g>' +
    /* le nœud */
    '<ellipse cx="129" cy="175.5" rx="12" ry="9.5" fill="' + c3 + '"/><path d="M121 172Q129 168 137 172" fill="none" stroke="' + c2 + '" stroke-width="2" stroke-linecap="round" opacity=".9"/>' +
    '<path d="M121.4 178.4Q129 182.4 136.6 178.4" fill="none" stroke="' + c2 + '" stroke-width="2" stroke-linecap="round" opacity=".9"/>';
}

/* ——— le chapeau de paille d'été ——— */
function chapeau(){
  return '<g class="chapeau" transform="rotate(-9 100 50)">' +
    '<ellipse cx="100" cy="51" rx="47" ry="9.5" fill="#E2C070"/>' +
    '<path d="M54 52Q100 64 146 52" fill="none" stroke="#C9A24F" stroke-width="1.4" stroke-linecap="round" opacity=".75"/>' +
    '<path d="M78 49Q76 29 100 29Q124 29 122 49Q100 56 78 49Z" fill="#F2D88C"/>' +
    '<path d="M78.4 44.6Q100 52 121.6 44.6L122 49Q100 57 78 49Z" fill="#D65A3A"/>' +
    '<path d="M86 36Q92 31 100 31" fill="none" stroke="#FFF1BF" stroke-width="2.2" stroke-linecap="round" opacity=".8"/></g>';
}

/* ——— la besace de cuir (hajj) et le cartable de la rentrée : pendus à gauche, une sangle qui monte jusqu'à l'épaule ——— */
function besace(cuir, rabat, boucle){
  return '<path d="M33 164Q32 120 59 86" fill="none" stroke="' + cuir + '" stroke-width="4.6" stroke-linecap="round"/>' +
    '<rect x="18" y="156" width="44" height="35" rx="7" fill="' + cuir + '"/>' +
    '<path d="M18 163Q18 156 25 156H55Q62 156 62 163V172Q40 183 18 172Z" fill="' + rabat + '"/>' +
    '<rect x="36.5" y="170" width="7" height="9.5" rx="1.8" fill="' + boucle + '"/>' +
    '<path d="M23 184.4H57" stroke="' + rabat + '" stroke-width="1.4" stroke-linecap="round" opacity=".6"/>';
}
function boussole(){
  return '<path d="M176 130V140" stroke="#8E5B35" stroke-width="2.6" stroke-linecap="round"/>' +
    '<circle cx="176" cy="154" r="14.5" fill="#B9773F"/><circle cx="176" cy="154" r="11" fill="#F7EBC0"/>' +
    '<path d="M176 144.4L179.4 154H172.6Z" fill="#C8442F"/><path d="M176 163.6L172.6 154H179.4Z" fill="#6B7B88"/>' +
    '<circle cx="176" cy="154" r="1.9" fill="#3A2A1A"/>' +
    '<circle cx="176" cy="141.6" r="1.2" fill="#8E5B35"/><circle cx="188.4" cy="154" r="1.2" fill="#8E5B35"/><circle cx="176" cy="166.4" r="1.2" fill="#8E5B35"/><circle cx="163.6" cy="154" r="1.2" fill="#8E5B35"/>';
}
function crayon(){
  return '<g transform="rotate(14 44 150)">' +
    '<rect x="38" y="104" width="10" height="50" fill="#F2C230"/><rect x="41.4" y="104" width="3" height="50" fill="#D9A41F"/>' +
    '<path d="M38 154H48L43 163Z" fill="#E8C9A0"/><path d="M40.8 159.6H45.2L43 163Z" fill="#3B3B3B"/>' +
    '<rect x="38" y="99" width="10" height="6" fill="#C8CCD0"/><rect x="38" y="92" width="10" height="8" rx="3" fill="#E98FA0"/></g>';
}
function carteRoulee(){
  return '<path d="M32 156Q31 120 59 86" fill="none" stroke="#8E5B35" stroke-width="3.6" stroke-linecap="round"/>' +
    '<g transform="rotate(-24 41 168)"><rect class="dy-papier" x="14" y="158" width="54" height="20" rx="10" fill="#F1DFB4"/>' +
    '<ellipse cx="17.6" cy="168" rx="3.8" ry="10" fill="#D8BF86"/><ellipse cx="64.4" cy="168" rx="3.8" ry="10" fill="#E7D29B"/>' +
    '<rect x="35" y="157" width="7" height="22" rx="2.4" fill="#C8442F"/>' +
    '<path d="M23 166Q29 162 33 167M46 171Q52 166 58 171" fill="none" stroke="#B89B5E" stroke-width="1.3" stroke-linecap="round" opacity=".7"/></g>';
}
function carnet(){
  return '<path d="M174 130V142" stroke="#8E5B35" stroke-width="2.6" stroke-linecap="round"/>' +
    '<g transform="rotate(8 176 162)"><rect class="dy-papier" x="160" y="140" width="32" height="42" rx="4.4" fill="#F2E3C0"/><rect x="160" y="140" width="7" height="42" rx="3" fill="#C48B4B"/>' +
    '<path d="M180 150l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7Z" fill="#C48B4B"/>' +
    '<path d="M185 182V192L188.4 188.8L191.8 192V182Z" fill="#C8442F"/></g>';
}
function livreOuvert(){
  return '<g transform="translate(100 190)">' +
    '<path d="M-37 -9L-37 13Q-18 7 0 15Q18 7 37 13L37 -9Z" fill="#3E5E9E"/>' +
    '<path d="M-33 -11Q-16 -17 0 -8V12Q-16 4 -33 8Z" fill="#FBF3DC"/><path d="M33 -11Q16 -17 0 -8V12Q16 4 33 8Z" fill="#F3E8C8"/>' +
    '<path d="M-26 -7Q-16 -10 -7 -5M-26 -1Q-16 -4 -7 1M-26 5Q-16 2 -7 7M26 -7Q16 -10 7 -5M26 -1Q16 -4 7 1M26 5Q16 2 7 7" fill="none" stroke="#C9B98D" stroke-width="1.4" stroke-linecap="round"/>' +
    '<path d="M0 -8V12" stroke="#D8C8A0" stroke-width="1.2"/></g>';
}
function lettresHalo(){
  var L = [['أ', 34, 46, 32, 0], ['ب', 166, 40, 30, .6], ['ت', 16, 76, 26, 1.2], ['ث', 184, 78, 26, 1.8]], s = '';
  L.forEach(function(l){ s += '<text class="lettre dy-lettre" style="animation-delay:' + l[4] + 's" x="' + l[1] + '" y="' + l[2] + '" font-size="' + l[3] + '" text-anchor="middle" fill="#F5D675" stroke="#3A2A10" stroke-width=".6" paint-order="stroke" font-family="\'Noto Naskh Arabic\',serif" font-weight="700">' + l[0] + '</text>'; });
  return s;
}

/* ——— les arabesques d'or du 18 décembre ——— */
function arabesques(col){
  var s = ' fill="none" stroke="' + col + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  var dome = '<g' + s + '><path d="M100 49V73"/><path d="M100 49Q94.5 56 100 63Q105.5 56 100 49Z" fill="' + col + '" stroke="none"/>' +
    '<path d="M100 71C92 71 85 68 84 61C83.4 56 89 55 90 59C90.6 61.6 87.6 62.6 86.6 61.2"/>' +
    '<path d="M100 71C108 71 115 68 116 61C116.6 56 111 55 110 59C109.4 61.6 112.4 62.6 113.4 61.2"/>' +
    '<path d="M70 73Q68 63 75 58M130 73Q132 63 125 58"/></g>';
  var rim = '<path d="M52 80.5', i;
  rim += 'q3.5 -4 7 0'; for(i = 0; i < 13; i++) rim += 't7 0';
  rim += '" fill="none" stroke="' + col + '" stroke-width="1.5" stroke-linecap="round"/>';
  var bras = '<path d="M60 80Q24 88 24 130L24 186" fill="none" stroke="' + col + '" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="0.1 6.5"/>' +
             '<path d="M140 80Q176 88 176 130L176 186" fill="none" stroke="' + col + '" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="0.1 6.5"/>';
  return { dome: dome, rim: rim, bras: bras };
}

/* ——— la broderie de l'Aïd al-Adha ——— */
function broderie(col){
  var s = '', x;
  for(x = 60; x <= 140; x += 10){ s += '<path d="M' + x + ' 77.4l3.8 3.1-3.8 3.1-3.8-3.1Z" fill="' + col + '"/>'; }
  s += '<circle cx="86" cy="62" r="1.7" fill="' + col + '"/><circle cx="100" cy="58" r="1.7" fill="' + col + '"/><circle cx="114" cy="62" r="1.7" fill="' + col + '"/>';
  return s;
}

/* ——— la définition de chaque tenue ——— */
var G_TEMPS = 'Temps forts du calendrier musulman', G_SAISON = 'Saisons et jours de l’année';
var TENUES = [
  { id:'classique', nom:'Classique', groupe:'', quand:'Toute l’année', note:'La Diya de l’app, telle qu’elle est.', pal:{}, f:function(){ return {}; } },

  { id:'ramadan', nom:'Ramadan', groupe:G_TEMPS, quand:'Pendant le Ramadan', note:'Métal bleu nuit et or, petit croissant suspendu à son anneau, lumière chaleureuse.',
    pal:{ m:'#2F4A7D', md:'#D4A84B', mb:'#E0BC66', leg:'#D4A84B', ring:'#E8C46D', halo:'#F0B84C', haloC:'#FFE2A0', glass:'#F9EBC2', domeHi:'#8AA6DC' },
    f:function(){ return {
      front:'<path d="M110 30.2Q123 34 126 46" fill="none" stroke="#FFE6A3" stroke-width="2.4" stroke-linecap="round"/>' + croissant(127, 60, 13, '#E8C46D', -38) + etincelle(138, 47, 4.2, '#FFF0C0'),
      over:etincelle(28, 58, 5, '#FFE6A3') + etincelle(173, 100, 3.6, '#FFE6A3') + etincelle(18, 126, 2.8, '#FFE6A3') + etincelle(180, 38, 2.8, '#FFE6A3') }; } },

  { id:'dixnuits', nom:'Les dix dernières nuits', groupe:G_TEMPS, quand:'Les 10 dernières nuits du Ramadan', note:'La tenue Ramadan évolue : halo étoilé, reflets dorés, lumière qui scintille doucement.',
    pal:{ m:'#222C62', md:'#E0B64F', mb:'#EBC866', leg:'#E0B64F', ring:'#F0D27A', halo:'#F5C85A', haloC:'#FFEAB0', glass:'#FBEFC8', domeHi:'#98A6EA' },
    f:function(){ return {
      halo:etoilesHalo('#FFE9A8'),
      front:'<path d="M110 30.2Q123 34 126 46" fill="none" stroke="#FFE6A3" stroke-width="2.4" stroke-linecap="round"/>' + croissant(127, 60, 13, '#F0D27A', -38) + etincelle(138, 47, 4.2, '#FFF4D0', 'tw', 0.2),
      dome:'<path d="M57 73Q58 49 100 47" fill="none" stroke="#F0D27A" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>' + etincelle(70, 60, 3.4, '#FFF4D0', 'tw', 0.8),
      arms:'<path d="M60 80Q24 88 24 130L24 186" fill="none" stroke="#F0D27A" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="0.1 6.5"/><path d="M140 80Q176 88 176 130L176 186" fill="none" stroke="#F0D27A" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="0.1 6.5"/>' }; } },

  { id:'fitr', nom:'Aïd al-Fitr', groupe:G_TEMPS, quand:'Les jours de l’Aïd al-Fitr', note:'Ivoire et or, joli ruban sur l’anneau, pluie de petites étincelles à l’apparition.',
    pal:{ m:'#EADDB9', md:'#C9A24A', mb:'#D9B863', leg:'#DDBF72', ring:'#D8B25A', halo:'#F2C766', haloC:'#FFF0C2', glass:'#FFF6DA', domeHi:'#FFFFFF' },
    f:function(){ return {
      front:'<path d="M86 40Q66 52 62 80L71 73L69 94L80 72Q82 56 93 43Z" fill="#E3B33C"/><path d="M90 42Q100 54 108 78L101 72L100 90L94 70Q91 56 86 44Z" fill="#C9962B"/>' + noeud(89, 34, 1.05, '#E3B33C', '#A97A18'),
      over:etincelle(34, 50, 4.6, '#F2C766', 'chute', 0) + etincelle(166, 44, 3.6, '#F2C766', 'chute', 0.7) + etincelle(20, 112, 3, '#F2C766', 'chute', 1.4) +
           etincelle(182, 104, 4, '#F2C766', 'chute', 2) + etincelle(46, 172, 3, '#F2C766', 'chute', 2.6) + etincelle(156, 168, 3.4, '#F2C766', 'chute', 1.1) }; } },

  { id:'hajj', nom:'Diya voyageuse', groupe:G_TEMPS, quand:'Dhou al-Hijja et la période du hajj', note:'Petite besace, tons sable et cuivre, boussole accrochée au côté.',
    pal:{ m:'#D3B07C', md:'#A8693A', mb:'#B77B48', leg:'#A8693A', ring:'#8E5B35', halo:'#EDB56A', haloC:'#FFE0A8', glass:'#F8EBC4', domeHi:'#F2DDB2' },
    f:function(){ return { arms:besace('#8A5230', '#B57A47', '#E7C766') + boussole() }; } },

  { id:'adha', nom:'Aïd al-Adha', groupe:G_TEMPS, quand:'Les jours de l’Aïd al-Adha', note:'Vert profond et or, détail brodé et petit nœud de fête.',
    pal:{ m:'#1F6B4F', md:'#D2AE55', mb:'#DDBB66', leg:'#2C8A65', ring:'#D2AE55', halo:'#F0BD55', haloC:'#FFE4A0', glass:'#F7EBC0', domeHi:'#7BCBA4' },
    f:function(){ return { dome:noeud(100, 48, 1.0, '#F2D88A', '#B98F32'), rim:broderie('#F2D88A'),
      over:etincelle(32, 56, 4, '#F2D88A') + etincelle(170, 84, 3.2, '#F2D88A') + etincelle(24, 138, 2.8, '#F2D88A') }; } },

  { id:'hijri', nom:'Nouvelle année hégirienne', groupe:G_TEMPS, quand:'Début de l’année hégirienne', note:'Bronze et prune, un carnet neuf : une nouvelle aventure commence.',
    pal:{ m:'#7A4568', md:'#C48B4B', mb:'#D09A5B', leg:'#B07A3E', ring:'#C48B4B', halo:'#E7A860', haloC:'#FFDCA8', glass:'#F6E6C6', domeHi:'#C990B4' },
    f:function(){ return { arms:carnet(), over:etincelle(30, 56, 4, '#FFDCA8') + etincelle(170, 76, 3, '#FFDCA8') }; } },

  { id:'achoura', nom:'Achoura', groupe:G_TEMPS, quand:'Le jour d’Achoura', note:'Une variation discrète autour du bleu et de l’argent, avec un halo ondoyant.',
    pal:{ m:'#5A7FB2', md:'#C5CED9', mb:'#D6DDE6', leg:'#9AB0CF', ring:'#C5CED9', halo:'#9BC4EA', haloC:'#E2F1FF', glass:'#F1F2EA', domeHi:'#BCD4F2' },
    f:function(){ return { back:'<g class="onde">' + onde(100, 126, 90, 96, 0.03, 6, 0, '#C5DDF3', 2.4, 0.8, 'dy-w1') + onde(100, 126, 81, 87, 0.034, 5, 1.6, '#9BC4EA', 2, 0.65, 'dy-w2') + onde(100, 126, 99, 105, 0.026, 7, 3.1, '#E2F1FF', 1.6, 0.55, 'dy-w3') + '</g>' }; } },

  { id:'printemps', nom:'Printemps', groupe:G_SAISON, quand:'De mars à mai', note:'Vert sauge, petites fleurs autour du socle, une feuille suspendue à l’anneau.',
    pal:{ m:'#8EB38A', md:'#5F906B', mb:'#6F9F79', leg:'#A5C99A', ring:'#B9B2AC', halo:'#C6E3A0', haloC:'#F2FBD0', glass:'#F8F0C8', domeHi:'#D5EBC4' },
    f:function(){ return {
      front:'<path d="M89 31Q81 40 82 50" fill="none" stroke="#5F9A5E" stroke-width="1.8" stroke-linecap="round"/>' + feuille(82, 49, 25, 94, '#8FD27A', '#4F8A52'),
      base:feuille(32, 214, 20, -155, '#5FA264') + feuille(60, 216, 17, -30, '#7FB87A') + feuille(168, 214, 20, -25, '#5FA264') + feuille(140, 216, 17, 210, '#7FB87A') +
           fleur(38, 204, 8.4, '#F4A7B9', '#FFE08A') + '<g class="pousse">' + fleur(57, 213, 6.4, '#FFFFFF', '#F4B03A') + '</g>' + fleur(162, 204, 8.4, '#FFE08A', '#E9778F') + fleur(143, 213, 6.4, '#F4A7B9', '#FFE08A') }; } },

  { id:'ete', nom:'Été', groupe:G_SAISON, quand:'De juin à août', note:'Turquoise et abricot, lumière de coucher de soleil, petit chapeau de voyage.',
    pal:{ m:'#33B2AB', md:'#F2A154', mb:'#F5B070', leg:'#F5B070', ring:'#F2A154', halo:'#FF9B6A', haloC:'#FFD6A8', glass:'#FFE6C8', domeHi:'#A8EBE4' },
    f:function(){ return { dome:chapeau(), over:etincelle(30, 70, 4.4, '#FFC98A') + etincelle(172, 96, 3.6, '#FFC98A') + etincelle(22, 142, 3, '#FFC98A') }; } },

  { id:'automne', nom:'Automne', groupe:G_SAISON, quand:'De septembre à novembre', note:'Cuivre et caramel, des feuilles qui tourbillonnent autour d’elle.',
    pal:{ m:'#B96A3A', md:'#E2A24E', mb:'#D78F42', leg:'#C9763A', ring:'#B9B2AC', halo:'#F0A044', haloC:'#FFD58C', glass:'#F8E6BC', domeHi:'#EBAE7C' },
    f:function(){ return {
      back:'<g class="tourne">' + feuille(16, 34, 42, 38, '#C8442F', '#8C2A1C') + feuille(184, 58, 40, 150, '#E58A2E', '#A85A14') + feuille(2, 152, 40, -25, '#E2B33C', '#A87C14') + '</g>',
      over:'<g class="tourne2">' + feuille(180, 148, 42, 205, '#C8442F', '#8C2A1C') + feuille(24, 196, 38, 330, '#E58A2E', '#A85A14') + feuille(150, 16, 34, 72, '#8C4A2B', '#5C2E18') + '</g>' }; } },

  { id:'hiver', nom:'Hiver', groupe:G_SAISON, quand:'De décembre à février', note:'Bleu givré, écharpe sous le visage, flocons et cœur lumineux bien chaud.',
    pal:{ m:'#7DB2D3', md:'#4F86AC', mb:'#6C9DC0', leg:'#A9D2E8', ring:'#D5E4EC', halo:'#C5E8F7', haloC:'#F2FBFF', glass:'#FFE9B8', domeHi:'#E4F4FC' },
    f:function(u){ return {
      defs:'<radialGradient id="gw' + u + '"><stop offset="0" stop-color="#FFB347" stop-opacity=".95"/><stop offset="55%" stop-color="#FFC966" stop-opacity=".5"/><stop offset="100%" stop-color="#FFD98A" stop-opacity="0"/></radialGradient>' +
           '<clipPath id="gc' + u + '"><path d="M60 90H140Q148 134 134 172H66Q52 134 60 90Z"/></clipPath>',
      glass:'<circle cx="100" cy="128" r="46" fill="url(#gw' + u + ')" clip-path="url(#gc' + u + ')"/>',
      dome:'<g fill="#F4FBFF" opacity=".9"><circle cx="64" cy="66" r="1.5"/><circle cx="118" cy="52" r="1.3"/><circle cx="132" cy="68" r="1.6"/><circle cx="88" cy="50" r="1.2"/></g>',
      base:echarpe('#B23A48', '#F6EBD9', '#8C2634'),
      over:'<g class="neige">' + flocon(26, 52, 8, '#EAF6FC') + flocon(176, 70, 6.4, '#EAF6FC', .9) + flocon(14, 118, 5.2, '#EAF6FC', .8) + flocon(186, 130, 7.4, '#EAF6FC') + flocon(40, 176, 4.6, '#EAF6FC', .8) + flocon(160, 188, 5.4, '#EAF6FC', .85) + '</g>' }; } },

  { id:'rentree', nom:'Rentrée', groupe:G_SAISON, quand:'Début septembre', note:'Petite besace et crayon glissé sur le côté : Diya reprend ses découvertes.',
    pal:{}, f:function(){ return { arms:crayon() + besace('#2A7F7A', '#3FA9A3', '#F2C230') }; } },

  { id:'vacances', nom:'Vacances', groupe:G_SAISON, quand:'Pendant les vacances scolaires', note:'Version exploratrice avec carte roulée et boussole.',
    pal:{}, f:function(){ return { arms:carteRoulee() + boussole() }; } },

  { id:'anniv', nom:'Anniversaire d’Alaq', groupe:G_SAISON, quand:'La semaine de l’anniversaire d’Alaq', note:'Édition dorée, ruban aux couleurs d’Alaq et confettis.',
    pal:{ m:'#E8B63A', md:'#C8872A', mb:'#F1CB60', leg:'#D99A2A', ring:'#F5D675', halo:'#FFD35C', haloC:'#FFF2BC', glass:'#FFF3CC', domeHi:'#FFF1B0' },
    f:function(){ return {
      rim:'<rect x="48" y="74" width="104" height="13" rx="6.5" fill="#5A3416"/><path d="M52 76.6H148M52 84.4H148" stroke="#F2E9DA" stroke-width="1.4" stroke-linecap="round" opacity=".9"/>' +
          '<path d="M140 86L150 124L162 114L154 90Z" fill="#D0870D"/><path d="M134 86L130 128L143 118L146 88Z" fill="#F5D675"/>' + noeud(141, 80, 1.5, '#F5D675', '#5A3416'),
      over:confettis('chute') }; } },

  { id:'langue', nom:'Journée de la langue arabe', groupe:G_SAISON, quand:'Le 18 décembre', note:'Arabesques et détail calligraphique sur le métal.',
    pal:{ m:'#1F5F6B', md:'#D2AE55', mb:'#DDBB66', leg:'#2A7C8A', ring:'#D2AE55', halo:'#F0BD55', haloC:'#FFE4A0', glass:'#F7EBC0', domeHi:'#6CB8C4' },
    f:function(){ var a = arabesques('#F2D88A'); return { dome:a.dome, rim:a.rim, arms:a.bras, over:etincelle(30, 62, 3.6, '#F2D88A') + etincelle(172, 88, 3, '#F2D88A') }; } },

  { id:'alpha', nom:'Journée de l’alphabétisation', groupe:G_SAISON, quand:'Le 8 septembre', note:'Un petit livre ouvert et des lettres qui apparaissent dans son halo.',
    pal:{ m:'#5C7BC0', md:'#E3C36A', mb:'#EBD07C', leg:'#7C97D2', ring:'#B9B2AC', halo:'#A9C0F0', haloC:'#E8EEFF', glass:'#FBF1CF', domeHi:'#B7C8F2' },
    f:function(){ return { halo:lettresHalo(), base:livreOuvert() }; } }
];
var BY_ID = {}; TENUES.forEach(function(t){ BY_ID[t.id] = t; });

function paletteDe(t){ var p = {}, k; for(k in BASE) p[k] = BASE[k]; for(k in (t.pal || {})) p[k] = t.pal[k]; return p; }

/* la couleur du contour (fond clair) : PLUSDOUX par défaut (le choix de Myriam, 23/11) ; DOUX et MARQUE (l'ancien brun presque noir) pour comparer. Contraste contre le parchemin #F7F1E4 : 4,35:1 · 3,74:1 · 12,96:1 */
var COULEURS = { doux: '#8B6B45', plusdoux: '#957650', marque: '#3A2410' };
/* le dessin : même ordre des formes que squelette.js, avec les crans entre elles */
function svg(id, opt){
  opt = opt || {};
  var t = BY_ID[id] || BY_ID.classique, p = paletteDe(t), u = 'd' + (++N), o = t.f(u);
  function c(k){ return o[k] ? (k === 'defs' ? o[k] : '<g class="dy-acc" data-slot="' + k + '">' + o[k] + '</g>') : ''; }   // chaque cran est un groupe : le banc de mesure sait ce qui est accessoire
  var taille = opt.taille || 170, portrait = opt.vue === 'portrait';
  /* « portrait » : de l'anneau au socle, sans les jambes — pour une photo de profil ou une pastille */
  var vb = portrait ? '0 0 200 214' : '0 0 200 236', hauteur = portrait ? taille * 214 / 200 : taille * 200 / 170;   // le portrait garde la pleine largeur : les accessoires des côtés (sacoche, boussole, carte) ne sont plus coupés
  /* le contour sombre : une dilatation de la silhouette (son canal alpha), peinte DERRIÈRE le dessin ; son rayon est en unités du dessin (200 de large), donc proportionnel à la taille affichée */
  var th = opt.contour == null ? 0.5 : opt.contour;
  if (th > 0) th = Math.max(th, 1 / (window.devicePixelRatio || 1));   // jamais moins d'UN pixel d'écran : le navigateur arrondit le rayon au pixel (0,3 et 0,5 donnent le même trait, 0,8 et 1,1 aussi sur un écran Retina) — mesuré le 23/11
  var rc = r2(th * 200 / taille);
  var coul = opt.couleur || COULEURS.plusdoux;   // 23/11 : « adoucis la couleur du contour, juste de quoi trancher avec le fond clair » — le brun « plus doux » #957650 CHOISI par Myriam le 23/11 (3,7:1 contre le parchemin ; l'ancien brun presque noir : 13:1)
  var filtre = th > 0 ? '<filter id="dct' + u + '" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB"><feMorphology in="SourceAlpha" operator="dilate" radius="' + rc + '" result="e"/>' +
    '<feFlood flood-color="' + coul + '"/><feComposite in2="e" operator="in" result="o"/><feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' : '';
  return '<svg class="masc diya' + (opt.anime === false ? '' : ' anime') + '" viewBox="' + vb + '" style="width:' + taille + 'px;height:' + r2(hauteur) + 'px" aria-hidden="true" focusable="false" data-tenue="' + t.id + '">' +
    '<defs><radialGradient id="mgl' + u + '"><stop offset="0" stop-color="' + p.haloC + '" stop-opacity=".95"/><stop offset="52%" stop-color="' + p.halo + '" stop-opacity=".33"/><stop offset="100%" stop-color="' + p.halo + '" stop-opacity="0"/></radialGradient>' + filtre + c('defs') + '</defs>' +
    c('back') +
    '<ellipse class="mhalo" cx="100" cy="126" rx="98" ry="102" fill="url(#mgl' + u + ')"/>' +
    c('halo') +
    '<g class="dy-sil"' + (th > 0 ? ' filter="url(#dct' + u + ')"' : '') + '>' +
    '<g class="mcorps">' +
      '<circle class="dy-ring" cx="100" cy="22" r="14" fill="none" stroke="' + p.ring + '" stroke-width="7"/>' + c('ring') +
      '<rect class="dy-m" x="92" y="32" width="16" height="18" rx="8" fill="' + p.m + '"/>' +
      '<path class="dy-ms" d="M60 80Q24 88 24 130L24 186" fill="none" stroke="' + p.m + '" stroke-width="14" stroke-linecap="round"/>' +
      '<path class="dy-ms" d="M140 80Q176 88 176 130L176 186" fill="none" stroke="' + p.m + '" stroke-width="14" stroke-linecap="round"/>' + c('arms') +
      '<path class="dy-m" d="M54 76Q56 44 100 44Q144 44 146 76Z" fill="' + p.m + '"/>' +
      '<ellipse class="dy-hi" cx="80" cy="60" rx="8" ry="11" fill="' + p.domeHi + '" opacity=".7" transform="rotate(-25 80 60)"/>' + c('dome') +
      '<rect class="dy-md" x="48" y="74" width="104" height="13" rx="6.5" fill="' + p.md + '"/>' + c('rim') +
      '<path d="M60 90H140Q148 134 134 172H66Q52 134 60 90Z" fill="' + p.glass + '"/>' +
      '<path d="M70 100Q66 128 72 152" fill="none" stroke="' + p.glassHi + '" stroke-width="6" stroke-linecap="round" opacity=".75"/>' + c('glass') +
      '<ellipse cx="82" cy="120" rx="13" ry="16" fill="#fff"/><ellipse cx="118" cy="120" rx="13" ry="16" fill="#fff"/>' +
      '<ellipse cx="84" cy="122" rx="7.5" ry="10" fill="' + p.eye + '"/><ellipse cx="120" cy="122" rx="7.5" ry="10" fill="' + p.eye + '"/>' +
      '<circle cx="81" cy="117" r="2.8" fill="#fff"/><circle cx="117" cy="117" r="2.8" fill="#fff"/>' +
      '<path d="M88 142Q100 152 112 142" fill="none" stroke="' + p.mouth + '" stroke-width="5.5" stroke-linecap="round"/>' +
      '<g class="mbassin"><path class="dy-m" d="M64 172H136L142 194H58Z" fill="' + p.m + '"/><rect class="dy-mb" x="46" y="193" width="108" height="14" rx="7" fill="' + p.mb + '"/></g>' + c('base') + c('front') +
    '</g>' +
    '<rect class="mjambe mjg dy-leg" x="70" y="203" width="18" height="30" rx="9" fill="' + p.leg + '" transform="rotate(15)"/>' +
    '<rect class="mjambe mjd dy-leg" x="112" y="203" width="18" height="30" rx="9" fill="' + p.leg + '" transform="rotate(-15)"/>' +
    '</g>' + c('over') +
  '</svg>';
}

window.DIYA = { svg: svg, COULEURS: COULEURS, TENUES: TENUES, tenue: function(id){ return BY_ID[id] || BY_ID.classique; }, BASE: BASE,
  GROUPES: [{ nom: G_TEMPS, ids: ['ramadan','dixnuits','fitr','hajj','adha','hijri','achoura'] },
            { nom: G_SAISON, ids: ['printemps','ete','automne','hiver','rentree','vacances','anniv','langue','alpha'] }] };
})();
