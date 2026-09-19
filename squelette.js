/* ═══ LE SQUELETTE HTML DE L'APP ═══
   Tout le HTML statique, un bloc par écran, dans l'ordre du DOM : injecté en synchrone juste AVANT sa propre
   balise, la première de <body>. Les gestes en ligne (onclick…) visent les scripts qui suivent : ils se
   résolvent au doigt, jamais au chargement.
   ⛔ SCRIPT CLASSIQUE, ni defer, ni async, ni module : document.currentScript est nul dans un module, et les
   scripts suivants lisent ce DOM pendant leur chargement (assets.js, constance.js…).
   ⛔ L'ORDRE DES BLOCS EST CELUI DU DOM : six .finish et #qsel partagent z-index 60, le dernier passe devant.
   ⛔ Littéraux gabarits : jamais d'accent grave, de ${ ni de barre oblique inverse dans le HTML.
   ⚠️ Hors de portée des capteurs d'erreur (signalements.js vient après) : son absence arrive au pupitre
   comme un TypeError sur #blogo dans coque.js.
   Aucun nom au premier niveau. Gardes : outils/verifier-squelette.mjs, garderLeSquelette() (vite.config.mjs),
   CORE du sw. */
(function () {
  const ECRANS = [
    /* le ciel de la journée (ciel-v1.js, ciel-v2.js) : derrière toute l'app, visible sur l'accueil seul */
    `
<div id="skyWrap" aria-hidden="true">
  <div id="skyBg"></div>
  <div id="skyStars"></div>
  <div id="skySun"></div>
  <div id="skyMoon"><svg viewBox="0 0 24 24" width="26" height="26" fill="#EFE6CF"><path d="M15.4 3.6a8.6 8.6 0 1 0 5.1 11.6A7.1 7.1 0 0 1 15.4 3.6Z"/></svg></div>
  <img id="skyCarav" data-ico="dromadaire" src="images-app-alaq/icone-ciel-dromadaire-v1.png" alt="">
  <svg id="skyDunes" viewBox="0 0 390 110" preserveAspectRatio="none">
    <path id="skyD1" fill="#8A6E4A" d="M0 70 C60 50 120 58 180 44 C240 32 300 52 390 36 L390 110 L0 110 Z"/>
    <path id="skyD2" fill="#6E5638" d="M0 88 C70 72 140 84 210 70 C280 58 330 76 390 64 L390 110 L0 110 Z"/>
  </svg>
  <div id="skyFire"></div>
  <div id="skyCamp">
    <svg viewBox="0 0 120 104" width="100%" height="100%" fill="none">
      <defs><linearGradient id="gFlamme" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFD98A"/><stop offset=".45" stop-color="#E8901F"/>
        <stop offset="1" stop-color="#B0563F"/></linearGradient></defs>
      <ellipse cx="20" cy="92" rx="9" ry="4.5" stroke="#5E4C39" stroke-width="2"/>
      <ellipse cx="60" cy="96" rx="10" ry="4.5" stroke="#5E4C39" stroke-width="2"/>
      <ellipse cx="100" cy="92" rx="9" ry="4.5" stroke="#5E4C39" stroke-width="2"/>
      <path d="M28 88 L92 78" stroke="#8A6A42" stroke-width="6.5" stroke-linecap="round"/>
      <path d="M30 78 L90 89" stroke="#6E5233" stroke-width="6.5" stroke-linecap="round"/>
      <ellipse class="braise" cx="60" cy="84" rx="21" ry="6" fill="#C4551F"/>
      <path class="fl f1" d="M60 18 C44 46 36 58 36 72 C36 84 47 90 60 90 C73 90 84 84 84 72 C84 58 76 46 60 18Z" fill="url(#gFlamme)" opacity=".92"/>
      <path class="fl f2" d="M60 42 C52 56 48 62 48 70 C48 78 53 83 60 83 C67 83 72 78 72 70 C72 62 68 56 60 42Z" fill="#F0A93A"/>
      <path class="fl f3" d="M60 58 C56 66 54 69 54 73 C54 78 57 81 60 81 C63 81 66 78 66 73 C66 69 64 66 60 58Z" fill="#FFE9B0"/>
    </svg>
  </div>
</div>
`,
    /* la barre du haut : la série, les Qatarāt, la lampe du rang */
    `
<div class="topbar">
  <div class="brand" id="brand"><img class="blogo" id="blogo" alt="ALAQ"></div>
  <div class="stats">
    <div class="stat"><img class="tbic" data-ico="tb-epi" src="images-app-alaq/icone-tb-epi-v1.png" alt=""> <span id="st-streak">0</span></div>
    <div class="stat" onclick="showHearts()" style="cursor:pointer" role="button" tabindex="0" aria-label="Tes Qatarāt"><img class="tbic" data-ico="tb-coeur" src="images-app-alaq/icone-tb-goutte-v1.png" alt=""> <span id="st-hearts">7</span></div>
    <div class="stat" onclick="showRank()" style="cursor:pointer;display:flex;align-items:center"><span id="st-lamp" style="display:flex"></span></div>
  </div>
</div>
`,
    /* les cinq onglets, vides (peints par ui/) et la colonne d'ordinateur (rail-ordinateur.js) */
    `
<div class="wrap" id="home"></div>
<div class="view" id="view-cours" style="display:none"></div>
<div class="view" id="view-reviser" style="display:none"></div>
<div class="view" id="view-prog" style="display:none"></div>
<div class="view" id="view-params" style="display:none"></div>
<aside class="deskrail" id="deskrail"></aside>
`,
    /* le lecteur d'exercices (src/player/) */
    `
<div class="player" id="player">
  <div class="p-top">
    <button class="p-close" onclick="quitDisque()">✕</button>
    <div class="pbar"><i id="pbar-i"></i></div>
    <div class="hearts"><img class="tbic" data-ico="tb-coeur" src="images-app-alaq/icone-tb-goutte-v1.png" alt=""> <span id="p-hearts">5</span></div>
  </div>
  <div class="p-body" id="p-body"></div>
  <div class="p-foot" id="p-foot">
    <button class="p-flag" onclick="sigOuvrir()" aria-label="Signaler un problème">⚑</button>
    <div id="fb"></div>
    <div id="why" class="why"></div>
    <button class="cta" id="cta" disabled>VÉRIFIER</button>
  </div>
</div>
`,
    /* le sélecteur des récitateurs (revision.js) */
    `
<div class="qsel" id="qsel" onclick="qariBulleOff()">
<div class="qsel-top"><button class="qx" onclick="closeQari()">✕</button><h3>Récitateur</h3>
<button class="qi" id="qbi" onclick="event.stopPropagation();qariBulleTog()">i</button></div>
<div class="qbulle" id="qbulle">Dix voix sont enregistrées dans l'app ; les sept autres sont diffusées depuis leur source. Toutes demandent une connexion internet — seules les leçons fonctionnent hors ligne.<br><br>Les voix marquées <b>« les mots s’illuminent »</b> font défiler la lecture mot à mot pendant la récitation.</div>
<div class="qpin" id="qpin"></div>
<div class="qlist" id="qlist"></div>
</div>
`,
    /* la fin de leçon : la mascotte, le score, les trois cases */
    `
<div class="finish" id="finish">
  <div class="masc-wrap"><svg id="masc" class="masc" viewBox="0 0 200 236" aria-label="mascotte Alaq">
    <defs><radialGradient id="mgl"><stop offset="0" stop-color="#FFD98A" stop-opacity=".95"/><stop offset="52%" stop-color="#F0A73C" stop-opacity=".33"/><stop offset="100%" stop-color="#F0A73C" stop-opacity="0"/></radialGradient></defs>
    <ellipse id="mhalo" class="mhalo" cx="100" cy="126" rx="98" ry="102" fill="url(#mgl)"/>
    <g id="mcorps" class="mcorps">
      <circle cx="100" cy="22" r="14" fill="none" stroke="#B9B2AC" stroke-width="7"/>
      <rect x="92" y="32" width="16" height="18" rx="8" fill="#EFA63C"/>
      <path d="M60 80 Q24 88 24 130 L24 186" fill="none" stroke="#EFA63C" stroke-width="14" stroke-linecap="round"/>
      <path d="M140 80 Q176 88 176 130 L176 186" fill="none" stroke="#EFA63C" stroke-width="14" stroke-linecap="round"/>
      <path d="M54 76 Q56 44 100 44 Q144 44 146 76 Z" fill="#EFA63C"/>
      <ellipse cx="80" cy="60" rx="8" ry="11" fill="#FFD98A" opacity=".7" transform="rotate(-25 80 60)"/>
      <rect x="48" y="74" width="104" height="13" rx="6.5" fill="#E39B2E"/>
      <path d="M60 90 H140 Q148 134 134 172 H66 Q52 134 60 90 Z" fill="#F7EBC0"/>
      <path d="M70 100 Q66 128 72 152" fill="none" stroke="#FFF8E0" stroke-width="6" stroke-linecap="round" opacity=".75"/>
      <ellipse cx="82" cy="120" rx="13" ry="16" fill="#fff"/><ellipse cx="118" cy="120" rx="13" ry="16" fill="#fff"/>
      <ellipse cx="84" cy="122" rx="7.5" ry="10" fill="#1B2A3A"/><ellipse cx="120" cy="122" rx="7.5" ry="10" fill="#1B2A3A"/>
      <circle cx="81" cy="117" r="2.8" fill="#fff"/><circle cx="117" cy="117" r="2.8" fill="#fff"/>
      <path d="M88 142 Q100 152 112 142" fill="none" stroke="#E2622A" stroke-width="5.5" stroke-linecap="round"/>
      <g id="mbassin" class="mbassin">
        <path d="M64 172 H136 L142 194 H58 Z" fill="#EFA63C"/>
        <rect x="46" y="193" width="108" height="14" rx="7" fill="#E8A94F"/>
      </g>
    </g>
    <rect class="mjambe mjg" id="mjG" x="70" y="203" width="18" height="30" rx="9" fill="#F58A22" transform="rotate(15)"/>
    <rect class="mjambe mjd" id="mjD" x="112" y="203" width="18" height="30" rx="9" fill="#F58A22" transform="rotate(-15)"/>
  </svg></div>
  <div class="big" id="fin-icon" style="display:none">✓</div>
  <h2 id="fin-title">Leçon terminée !</h2>
  <div class="fin-score"><span class="fs-v" id="fin-acc">100%</span><span class="fs-l">de réussite</span></div>
  <!-- Les trois cases de fin : graines, réussite, assiduité (remplies par constance.js). -->
  <div id="fin-cases"></div>
  <div id="fin-extra"></div>
  <span id="fin-xp" style="display:none"></span>
  <button class="cta" id="fin-cta" style="max-width:300px;margin-top:14px" onclick="closeFinish()">CONTINUER</button>
</div>
`,
    /* la traduction du mot touché : un seul bandeau pour toute l'app */
    `
<div class="motbulle" id="motbulle">
  <div class="mb-h"><button class="mb-spk" id="mbSpk" aria-label="Réécouter"></button>
    <div class="mb-ar" id="mbAr"></div>
    <button class="mb-x" onclick="motBulleOff()" aria-label="Fermer">✕</button></div>
  <div class="mb-lab">Traduction approchée</div>
  <div class="mb-fr" id="mbFr"></div>
  <div class="mb-src" id="mbSrc"></div>
</div>
`,
    /* la confirmation de l'effacement (comptes.js) */
    `
<div class="finish" id="confirmReset">
  <div class="big">⚠️</div>
  <h2>Réinitialiser la progression ?</h2>
  <p style="max-width:320px;color:var(--cream);opacity:.8;margin:-14px 0 26px">Tout repart à zéro (étoiles, disques terminés). Cette action est irréversible.</p>
  <button class="cta cta-danger" style="max-width:300px" onclick="doReset()">RÉINITIALISER</button>
  <button class="cta" style="max-width:300px;background:none;color:var(--cream);border:2px solid var(--line);margin-top:10px" onclick="cancelReset()">ANNULER</button>
</div>
`,
    /* plus de Qatarāt */
    `
<div class="finish" id="noHearts">
  <div class="big"><img src="images-app-alaq/icone-tb-goutte-v1.png" data-ico="tb-coeur" alt="" style="height:64px;filter:grayscale(1) opacity(.55)"></div>
  <h2>Ton eau est épuisée !</h2>
  <p class="succ-desc" style="margin:0 0 14px">Recharge tes Qatarāt en révisant au puits Zamzam du savoir.</p>
  <div id="nh-actions" style="display:flex;flex-direction:column;align-items:center;width:100%"></div>
</div>
`,
    /* l'onboarding, huit panneaux (comptes.js) */
    `
<div class="onb" id="onb">
  <div class="onb-top" id="onbTop"><button class="onb-back" onclick="onbBack()" aria-label="Retour">‹</button><div class="onb-track"><div class="onb-fill" id="onbFill"></div></div></div>
  <div class="onb-body">

    <section class="obs on" data-obs="0">
      <div style="flex:1"></div>
      <img class="ob-logo" src="icon-512.png" alt="ALAQ">
      <p class="ob-lead">Méthode francophone pour apprendre à lire l'arabe, comprendre et mémoriser le Qor'an.</p>
      <div style="flex:1"></div>
      <button class="cta" onclick="onbNext()">COMMENCER</button>
      <button class="cta" style="background:none;color:var(--cream);border:2px solid var(--line);box-shadow:none;margin-top:10px" onclick="onbExistingAccount()">J'AI DÉJÀ UN COMPTE</button>
    </section>

    <section class="obs" data-obs="1">
      <div style="flex:1"></div>
      <h1>Comment t'appelles-tu ?</h1>
      <input class="ob-in" id="obPrenomOnb" type="text" autocomplete="given-name" placeholder="Ton prénom" oninput="onbPrenomInput(this.value)">
      <div style="flex:1"></div>
      <button class="cta ob-cta" onclick="onbNext()">CONTINUER</button>
    </section>

    <section class="obs" data-obs="2">
      <div style="flex:1"></div>
      <h1>Comment as-tu connu ALAQ ?</h1>
      <div class="ob-opts">
        <button class="ob-opt" data-obk="source" data-obv="YouTube"><span class="em">▶️</span> YouTube</button>
        <button class="ob-opt" data-obk="source" data-obv="Bouche à oreille"><span class="em">👥</span> Bouche à oreille</button>
        <button class="ob-opt" data-obk="source" data-obv="Recommandation IA"><span class="em">🤖</span> Recommandation IA</button>
        <button class="ob-opt" data-obk="source" data-obv="Recherche Google"><span class="em">🔎</span> Recherche Google</button>
        <button class="ob-opt" data-obk="source" data-obv="Réseaux sociaux"><span class="em">📱</span> Réseaux sociaux</button>
        <button class="ob-opt" data-obk="source" data-obv="Autre"><span class="em">✨</span> Autre</button>
      </div>
      <div style="flex:1"></div>
      <button class="cta ob-cta" onclick="onbNext()">CONTINUER</button>
    </section>

    <section class="obs" data-obs="3">
      <div style="flex:1"></div>
      <h1>Quelle est ton intention ?</h1>
      <div class="ob-ar">نِيَّتُك</div><div class="ob-hint">Plusieurs choix possibles</div>
      <div class="ob-opts">
        <button class="ob-opt" data-obmulti data-obk="intention" data-obv="Apprendre l'arabe"><span class="em">🔤</span> Apprendre l'arabe</button>
        <button class="ob-opt" data-obmulti data-obk="intention" data-obv="Lire le Qor'an"><span class="em">📖</span> Lire le Qor'an</button>
        <button class="ob-opt" data-obmulti data-obk="intention" data-obv="Mémoriser le Qor'an"><span class="em">🧠</span> Mémoriser le Qor'an</button>
        <button class="ob-opt" data-obmulti data-obk="intention" data-obv="Comprendre le Qor'an"><span class="em">💡</span> Comprendre le Qor'an</button>
        <button class="ob-opt" data-obmulti data-obk="intention" data-obv="Accompagner mes enfants"><span class="em">👨‍👩‍👧</span> Accompagner mes enfants</button>
        <button class="ob-opt" data-obmulti data-obk="intention" data-obv="Autre"><span class="em">✨</span> Autre</button>
      </div>
      <div style="flex:1"></div>
      <button class="cta ob-cta" onclick="onbNext()">CONTINUER</button>
    </section>

    <section class="obs" data-obs="4">
      <div style="flex:1"></div>
      <h1>Sais-tu lire l'arabe ?</h1>
      <div class="ob-opts">
        <button class="ob-opt" data-obk="niveau" data-obv="Je pars de zéro"><span class="em">🌱</span> Je pars de zéro</button>
        <button class="ob-opt" data-obk="niveau" data-obv="Quelques lettres"><span class="em">🔤</span> Je connais quelques lettres</button>
        <button class="ob-opt" data-obk="niveau" data-obv="Je déchiffre lentement"><span class="em">🐢</span> Je déchiffre lentement</button>
        <button class="ob-opt" data-obk="niveau" data-obv="Je lis sans comprendre"><span class="em">👁️</span> Je lis mais ne comprends pas</button>
        <button class="ob-opt" data-obk="niveau" data-obv="Je lis et comprends un peu"><span class="em">💬</span> Je lis et comprends un peu</button>
      </div>
      <div style="flex:1"></div>
      <button class="cta ob-cta" onclick="onbNext()">CONTINUER</button>
    </section>

    <section class="obs" data-obs="5">
      <div style="flex:1"></div>
      <h1>Avec ALAQ, tu vas :</h1>
      <div class="ob-list">
        <div class="ob-li"><span class="ck">✓</span> Lire le Qor'an en arabe</div>
        <div class="ob-li"><span class="ck">✓</span> Lire avec le tajwīd</div>
        <div class="ob-li"><span class="ck">✓</span> Comprendre ce que tu lis</div>
        <div class="ob-li"><span class="ck">✓</span> Mémoriser le Qor'an</div>
        <div class="ob-li"><span class="ck">✓</span> Enrichir ton vocabulaire</div>
        <div class="ob-li"><span class="ck">✓</span> Maîtriser la grammaire</div>
        <div class="ob-li"><span class="ck">✓</span> Installer une routine</div>
      </div>
      <div style="flex:1"></div>
      <button class="cta ob-cta" onclick="onbNext()">CONTINUER</button>
    </section>

    <section class="obs" data-obs="6">
      <div style="flex:1"></div>
      <h1>Ton objectif quotidien</h1>
      <div class="ob-opts">
        <button class="ob-opt goal" data-obk="objectif" data-obv="5"><span class="min">5 min</span><span class="lbl">Motivé</span></button>
        <button class="ob-opt goal" data-obk="objectif" data-obv="10"><span class="min">10 min</span><span class="lbl">Investi</span></button>
        <button class="ob-opt goal" data-obk="objectif" data-obv="15"><span class="min">15 min</span><span class="lbl">Déterminé</span></button>
        <button class="ob-opt goal" data-obk="objectif" data-obv="20"><span class="min">20 min</span><span class="lbl">Ambitieux</span></button>
      </div>
      <div style="flex:1"></div>
      <button class="cta ob-cta" onclick="onbNext()">CONTINUER</button>
    </section>

    <section class="obs" data-obs="7">
      <div style="flex:1"></div>
      <div style="font-size:52px">🕋</div>
      <p class="ob-lead" style="font-weight:900;font-size:18px;margin-bottom:2px">Bismillah, on commence !</p>
      <p class="ob-sub">Tes 3 premières lettres : م · ل · ن</p>
      <div style="flex:1"></div>
      <button class="cta ob-cta" onclick="onbLaunchLesson()">MA PREMIÈRE LEÇON</button>
    </section>

  </div>
</div>
`,
    /* l'écran d'assiduité (constance.js) : le verset 2:261 entier, sa traduction entière, sa récitation.
     ⚠️ jamais d'emoji 🌾/🌱 : ils se peignent seuls et ignorent le thème. */
    `
<div class="finish" id="streak">
  <div style="font-weight:900;color:var(--gold2);margin-top:6px"><span id="streakNum" style="font-size:46px">1</span> <span id="streakUnit" style="font-size:18px">jour</span></div>
  <img class="streak-plant" src="images-app-alaq/epi-pousse-anime-v1.webp" alt="" width="210" height="210">
  <button class="stk-spk" id="streakSpk" onclick="streakRecite()" aria-label="Écouter le verset"></button>
  <p class="verse" id="streakVerse">مَّثَلُ الَّذِينَ يُنْفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنْبَتَتْ سَبْعَ سَنَابِلَ فِي كُلِّ سُنْبُلَةٍ مِائَةُ حَبَّةٍ ۗ وَاللَّهُ يُضَاعِفُ لِمَنْ يَشَاءُ ۗ وَاللَّهُ وَاسِعٌ عَلِيمٌ</p>
  <p class="stk-tr">« Ceux qui dépensent leurs biens dans le chemin d’Allah sont à l’image d’un grain qui fait pousser sept épis, à cent grains chacun. Et Allah multiplie la récompense à qui Il veut. Allah est Immense et Savant. »</p>
  <p class="stk-src">sourate Al-Baqara, verset 261</p>
  <button class="cta" style="max-width:300px" onclick="streakContinue()">CONTINUER</button>
</div>
`,
    /* « Sauvegarde ta progression » (comptes.js) */
    `
<div class="finish" id="obAccount">
  <!-- ⚠️ .ic2 à deux fichiers (nuit / -clair), comme les autres icônes d'écran : sinon l'icône crème
       s'efface sur le parchemin du mode clair. (journal : index.html · icône du compte en mode clair) -->
  <span class="ic2"><img class="o-nuit" data-ico="ecran-compte" src="images-app-alaq/icone-ecran-compte.png" alt="" style="width:88px;height:auto"><img class="o-jour" src="images-app-alaq/icone-ecran-compte-clair.png" alt="" style="width:88px;height:auto"></span>
  <h2 id="obAccountTitle">Sauvegarde ta progression</h2>
  <p id="obQuote" style="max-width:330px;color:var(--muted);font-size:12px;margin:0 0 16px;font-style:italic">« Les actes les plus aimés d'Allah sont les plus constants, même s'ils sont peu » — Bukhari &amp; Muslim</p>
  <div id="obAccountCard" style="width:100%;max-width:320px"></div>
  <button class="cta" style="max-width:320px;background:none;color:var(--cream);border:2px solid var(--line);box-shadow:none;margin-top:12px" onclick="obLaterWarn()">Plus tard</button>
</div>
`,
    /* « Content de te revoir ! » : la connexion à un compte existant (comptes.js) */
    `
<div class="finish" id="obLogin">
  <svg viewBox="0 0 200 236" style="width:96px;height:auto" aria-hidden="true">
    <defs><radialGradient id="obgl"><stop offset="0" stop-color="#FFD98A" stop-opacity=".95"/><stop offset="52%" stop-color="#F0A73C" stop-opacity=".33"/><stop offset="100%" stop-color="#F0A73C" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="100" cy="126" rx="98" ry="102" fill="url(#obgl)"/>
    <circle cx="100" cy="22" r="14" fill="none" stroke="#B9B2AC" stroke-width="7"/>
    <rect x="92" y="32" width="16" height="18" rx="8" fill="#EFA63C"/>
    <path d="M60 80 Q24 88 24 130 L24 186" fill="none" stroke="#EFA63C" stroke-width="14" stroke-linecap="round"/>
    <path d="M140 80 Q176 88 176 130 L176 186" fill="none" stroke="#EFA63C" stroke-width="14" stroke-linecap="round"/>
    <path d="M54 76 Q56 44 100 44 Q144 44 146 76 Z" fill="#EFA63C"/>
    <ellipse cx="80" cy="60" rx="8" ry="11" fill="#FFD98A" opacity=".7" transform="rotate(-25 80 60)"/>
    <rect x="48" y="74" width="104" height="13" rx="6.5" fill="#E39B2E"/>
    <path d="M60 90 H140 Q148 134 134 172 H66 Q52 134 60 90 Z" fill="#F7EBC0"/>
    <path d="M70 100 Q66 128 72 152" fill="none" stroke="#FFF8E0" stroke-width="6" stroke-linecap="round" opacity=".75"/>
    <ellipse cx="82" cy="120" rx="13" ry="16" fill="#fff"/><ellipse cx="118" cy="120" rx="13" ry="16" fill="#fff"/>
    <ellipse cx="84" cy="122" rx="7.5" ry="10" fill="#1B2A3A"/><ellipse cx="120" cy="122" rx="7.5" ry="10" fill="#1B2A3A"/>
    <circle cx="81" cy="117" r="2.8" fill="#fff"/><circle cx="117" cy="117" r="2.8" fill="#fff"/>
    <path d="M88 142 Q100 152 112 142" fill="none" stroke="#E2622A" stroke-width="5.5" stroke-linecap="round"/>
    <path d="M64 172 H136 L142 194 H58 Z" fill="#EFA63C"/>
    <rect x="46" y="193" width="108" height="14" rx="7" fill="#E8A94F"/>
    <rect x="70" y="203" width="18" height="30" rx="9" fill="#F58A22" transform="rotate(12 79 203)"/>
    <rect x="112" y="203" width="18" height="30" rx="9" fill="#F58A22" transform="rotate(-12 121 203)"/>
  </svg>
  <h2 style="margin:10px 0 14px">Content de te revoir !</h2>
  <div id="obLoginCard" style="width:100%;max-width:320px"></div>
  <button class="cta" style="max-width:320px;background:none;color:var(--cream);border:2px solid var(--line);box-shadow:none;margin-top:12px" id="obLoginBack" onclick="obLoginClose()">Retour</button>
</div>
`,
    /* le ⚑ : le voile et la feuille des motifs (signalements.js) */
    `
<div class="sig-voile" id="sigVoile" onclick="sigFermer()"></div>
<div class="sig-sheet" id="sigSheet">
  <h3>⚑ Signaler un problème</h3>
  <button class="sig-opt" data-motif="Le son ne se joue pas" onclick="sigChoisir(this)">Le son ne se joue pas</button>
  <button class="sig-opt" data-motif="Le son arrive en retard" onclick="sigChoisir(this)">Le son arrive en retard</button>
  <button class="sig-opt" data-motif="Ce n’est pas le bon son" onclick="sigChoisir(this)">Ce n’est pas le bon son</button>
  <button class="sig-opt" data-motif="L’affichage est cassé" onclick="sigChoisir(this)">L’affichage est cassé</button>
  <button class="sig-opt" data-motif="Ma réponse aurait dû être acceptée" onclick="sigChoisir(this)">Ma réponse aurait dû être acceptée</button>
  <button class="sig-opt" data-motif="Autre chose" data-libre="1" onclick="sigChoisir(this)">Autre chose</button>
  <textarea class="sig-txt" id="sigTxt" maxlength="600" placeholder="Dis-nous ce qui ne va pas (facultatif)"></textarea>
  <button class="sig-env" id="sigEnv" disabled onclick="sigEnvoyer()">ENVOYER</button>
</div>
`,
    /* le toast */
    `
<div class="toast" id="toast"></div>
`,
    /* le menu bas, cinq onglets (ui/navigation.js) */
    `
<nav class="botnav" id="botnav">
  <div class="deskbrand"><img class="dlg" src="icon-192.png" alt="ALAQ"></div>
  <button class="bn active" id="bn-home" onclick="showTab('home')"><span class="bi"><img class="bni" data-ico="menu-apprendre" src="images-app-alaq/icone-menu-apprendre.png" alt=""></span><span class="bn-lab">Apprendre</span></button>
  <button class="bn" id="bn-cours" onclick="showTab('cours')"><span class="bi"><img class="bni" data-ico="menu-cours" src="images-app-alaq/icone-menu-cours.png" alt=""></span><span class="bn-lab">Cours</span></button>
  <button class="bn" id="bn-reviser" onclick="showTab('reviser')"><span class="bi"><img class="bni" data-ico="menu-reviser" src="images-app-alaq/icone-menu-puits-v2.png" alt=""></span><span class="bn-lab">Réviser</span></button>
  <button class="bn" id="bn-prog" onclick="showTab('prog')"><span class="bi"><img class="bni" data-ico="menu-profil" src="images-app-alaq/icone-menu-profil.png" alt=""></span><span class="bn-lab">Profil</span></button>
  <button class="bn" id="bn-params" onclick="showTab('params')"><span class="bi"><img class="bni" data-ico="menu-parametres" src="images-app-alaq/icone-menu-parametres.png" alt=""></span><span class="bn-lab">Paramètres</span></button>
</nav>
`,
  ];
  const ici = document.currentScript;
  if (!ici) throw new Error('squelette.js : script classique synchrone obligatoire (ni defer, ni async, ni module)');
  ici.insertAdjacentHTML('beforebegin', ECRANS.join(''));
})();
