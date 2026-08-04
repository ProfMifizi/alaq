/* ===== ALAQ — Le studio des sons · moteur commun aux deux pages =====
   Trois choses : écouter (un seul son à la fois), enregistrer au micro en nettoyant
   le son, et déposer le résultat sur le disque via le serveur local.            */

/* ---------------------------------------------------------------- ÉCOUTER
   Règle de l'app reprise ici : un seul son à la fois. Sans ça, comparer deux
   versions devient impossible — on les entend l'une par-dessus l'autre.        */
let _audio = null, _btn = null;

/* Anti-cache : un fichier qu'on vient de réenregistrer doit se rejouer tout de suite.
   ⚠️ Uniquement sur NOS fichiers. Les URL d'aperçu d'ElevenLabs portent parfois déjà
   un « ?payload=… » : y coller un second « ? » donne une URL que le navigateur refuse
   (error code 4), et le son ne part jamais. */
function fraiche(url) {
  if (/^https?:/i.test(url)) return url;                 // URL extérieure : on n'y touche pas
  return url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
}

function jouer(url, btn) {
  if (_audio) { _audio.pause(); _audio = null; }
  if (_btn) { _btn.classList.remove('joue'); _btn.textContent = _btn.dataset.repos; }
  if (_btn === btn) { _btn = null; return; }            // re-toucher = arrêter
  const a = new Audio(fraiche(url));
  _audio = a; _btn = btn;
  btn.dataset.repos = btn.dataset.repos || btn.textContent;
  btn.classList.add('joue'); btn.textContent = '⏸';
  const fini = () => { btn.classList.remove('joue'); btn.textContent = btn.dataset.repos;
                       if (_btn === btn) { _btn = null; _audio = null; } };
  // un son qui ne part pas doit le DIRE : sinon le bouton clignote et on croit l'ordinateur muet
  const rate = raison => { fini(); toast('Son injouable — ' + raison, 4200); };
  a.addEventListener('ended', fini);
  a.addEventListener('error', () => rate(({1:'lecture interrompue', 2:'réseau',
      3:'fichier illisible', 4:'adresse refusée par le navigateur'})[a.error && a.error.code] || 'cause inconnue'));
  a.play().catch(e => rate(e && e.name === 'NotAllowedError'
    ? 'le navigateur bloque le son tant que tu n’as pas cliqué dans la page' : (e.message || e)));
}

function toast(msg, ms = 2600) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const d = document.createElement('div'); d.className = 'toast'; d.textContent = msg;
  document.body.appendChild(d); setTimeout(() => d.remove(), ms);
}

/* ---------------------------------------------------------------- SE TENIR À JOUR
   L'inventaire dérive de index.html : une nouvelle leçon, un mot ajouté, et la liste
   change. Le serveur ne renvoie qu'une DATE — on ne recharge le tableau que si elle a
   bougé. On regarde au retour sur l'onglet (le moment où l'on revient d'avoir édité
   l'app), et de loin en loin tant que l'onglet est visible.                        */
function suisLesChangements(recharge) {
  let connue = null, occupe = false;
  async function regarde() {
    if (occupe || document.hidden) return;
    occupe = true;
    try {
      const { version } = await (await fetch('/api/version')).json();
      if (connue === null) { connue = version; return; }
      if (version !== connue) { connue = version; await recharge(); toast('Liste mise à jour'); }
    } catch (e) { /* serveur arrêté : on réessaiera */ }
    finally { occupe = false; }
  }
  regarde();
  document.addEventListener('visibilitychange', regarde);
  window.addEventListener('focus', regarde);
  setInterval(regarde, 20000);
}

/* ---------------------------------------------------------------- RÉGLAGES
   Les valeurs par défaut donnent déjà un bon résultat ; le panneau ne sert qu'aux cas
   difficiles (pièce qui résonne, voix trop loin du micro).                       */
const REGLAGES = {
  bruit: 12,      // dB au-dessus du plancher de bruit mesuré : sous ce seuil, on baisse
  voix: 6,        // dB de renfort de la voix (compresseur + gain)
  marge: 90,      // ms de silence gardés avant et après la voix
};
function litReglages() {
  document.querySelectorAll('[data-reglage]').forEach(i => { REGLAGES[i.dataset.reglage] = +i.value; });
  return REGLAGES;
}

/* ---------------------------------------------------------------- CHOISIR SON MICRO
   En local, le micro branché vaut mieux que celui du Mac. Le choix est retenu d'une
   séance à l'autre. ⚠️ Le navigateur cache le NOM des micros tant qu'aucune permission
   n'a été donnée : on demande donc l'accès à l'ouverture du panneau, puis on relit la
   liste — sinon elle n'afficherait que « Micro 1 », « Micro 2 »…                    */
const MICRO = { id: localStorage.getItem('alaq-micro') || '', nom: '' };

function contrainteMicro() {
  const c = { channelCount: 1, noiseSuppression: true, echoCancellation: true, autoGainControl: false };
  if (MICRO.id) c.deviceId = { exact: MICRO.id };
  return c;
}

/* Un micro débranché depuis la dernière séance ferait échouer { exact } : on repart
   alors sur le micro par défaut plutôt que de laisser l'enregistrement impossible. */
async function ouvreMicro() {
  try { return await navigator.mediaDevices.getUserMedia({ audio: contrainteMicro() }); }
  catch (e) {
    if (!MICRO.id || e.name !== 'OverconstrainedError') throw e;
    toast('Micro « ' + (MICRO.nom || 'choisi') + ' » introuvable — retour au micro par défaut', 4200);
    MICRO.id = ''; localStorage.removeItem('alaq-micro');
    return navigator.mediaDevices.getUserMedia({ audio: contrainteMicro() });
  }
}

/* Le vumètre seul : entendre son niveau sans rien enregistrer, pour se placer. */
class Vumetre {
  async demarre(onNiveau) {
    this.flux = await ouvreMicro();
    this.ctx = new AudioContext();
    this.an = this.ctx.createAnalyser(); this.an.fftSize = 1024;
    this.ctx.createMediaStreamSource(this.flux).connect(this.an);
    this.buf = new Float32Array(this.an.fftSize);
    const boucle = () => {
      if (!this.an) return;
      this.an.getFloatTimeDomainData(this.buf);
      let c = 0; for (const v of this.buf) c = Math.max(c, Math.abs(v));
      onNiveau(c);
      this.raf = requestAnimationFrame(boucle);
    };
    boucle();
  }
  arrete() {
    cancelAnimationFrame(this.raf); this.an = null;
    this.flux && this.flux.getTracks().forEach(t => t.stop());
    this.ctx && this.ctx.close();
  }
}

/* Le choix du micro vit sur une ligne TOUJOURS VISIBLE : c'est le premier réglage à faire
   avant d'enregistrer, il n'a rien à faire dans un repli. */
async function monteChoixMicro(hote) {
  hote.innerHTML = '';
  const titre = document.createElement('span'); titre.className = 'mini'; titre.textContent = '🎙 Micro';
  const sel = document.createElement('select'); sel.style.minWidth = '250px';
  const test = document.createElement('button'); test.className = 'bmic'; test.textContent = '🎧 Écouter mon micro';
  const jauge = document.createElement('span'); jauge.className = 'niveau'; jauge.innerHTML = '<i></i>';
  const note = document.createElement('span'); note.className = 'etat';
  hote.append(titre, sel, test, jauge, note);

  async function relit(demanderNoms) {
    // la permission débloque les NOMS des micros ; on ne la demande qu'ici, à l'ouverture du panneau.
    // Bornée : une demande laissée sans réponse ne doit pas figer la liste pour toujours.
    if (demanderNoms) try {
      const flux = await Promise.race([ouvreMicro(), new Promise(r => setTimeout(r, 15000))]);
      flux && flux.getTracks().forEach(t => t.stop());
    } catch (e) {}
    const micros = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'audioinput');
    sel.innerHTML = micros.length
      ? micros.map((d, i) => '<option value="' + d.deviceId + '">' +
          (d.label || 'Micro ' + (i + 1)) + '</option>').join('')
      : '<option value="">aucun micro détecté</option>';
    if (MICRO.id && micros.some(d => d.deviceId === MICRO.id)) sel.value = MICRO.id;
    else MICRO.id = sel.value || '';
    MICRO.nom = (sel.selectedOptions[0] || {}).textContent || '';
    // sans permission, le navigateur masque les noms : on le DIT plutôt que d'afficher « Micro 1 »
    if (micros.length && !micros[0].label && !vu) {
      note.className = 'etat'; note.textContent = 'touche 🎧 pour voir le nom de tes micros';
    }
  }

  sel.onchange = () => {
    MICRO.id = sel.value;
    MICRO.nom = (sel.selectedOptions[0] || {}).textContent || '';
    localStorage.setItem('alaq-micro', MICRO.id);
    if (vu) { arreteTest(); test.click(); }        // on rebascule l'écoute sur le nouveau micro
  };

  let vu = null;
  const arreteTest = () => { vu && vu.arrete(); vu = null;
    test.classList.remove('enreg'); test.textContent = '🎧 Écouter mon micro';
    jauge.firstChild.style.width = '0%'; note.textContent = ''; note.className = 'etat'; };
  test.onclick = async () => {
    if (vu) return arreteTest();
    try {
      vu = new Vumetre();
      await vu.demarre(c => {
        jauge.firstChild.style.width = Math.min(100, c * 140) + '%';
        jauge.classList.toggle('fort', c > .92);
        note.className = c > .92 ? 'etat ko' : 'etat ok';
        note.textContent = c > .92 ? 'ça sature — recule' : c > .12 ? 'niveau correct' : 'parle plus fort ou rapproche-toi';
      });
      test.classList.add('enreg'); test.textContent = '⏹ Arrêter l’écoute';
      relit(false);                                 // la permission vient de tomber : les noms arrivent
    } catch (e) { vu = null; note.className = 'etat ko'; note.textContent = 'micro refusé — autorise-le dans le navigateur'; }
  };

  // un micro branché ou débranché en cours de route met la liste à jour toute seule
  navigator.mediaDevices.addEventListener('devicechange', () => relit(false));
  return relit;
}

/* ---------------------------------------------------------------- ENREGISTRER
   Chaîne de nettoyage, dans cet ordre (chaque étage règle un problème précis) :
     1. le navigateur débruite déjà à la source (noiseSuppression : le débruiteur WebRTC) ;
     2. passe-haut 85 Hz — coupe le grondement de la pièce et les « p » qui soufflent ;
     3. compresseur — resserre l'écart entre les syllabes fortes et faibles ;
     4. expandeur maison — ce qui reste sous le plancher de bruit est écrasé en douceur ;
     5. rognage des silences de début et de fin, puis normalisation à −1 dBFS.
   Le tout hors ligne (OfflineAudioContext) : on rend directement en 44,1 kHz mono,
   la fréquence attendue par l'encodeur MP3 et par les fichiers déjà en place.    */
class Micro {
  constructor(onNiveau) { this.onNiveau = onNiveau; this.flux = null; this.mr = null; }

  async demarre() {
    this.flux = await ouvreMicro();                 // le micro choisi dans les réglages
    // vumètre en direct : elle doit voir si elle parle assez fort AVANT de tout refaire
    this.ctx = new AudioContext();
    const src = this.ctx.createMediaStreamSource(this.flux);
    this.an = this.ctx.createAnalyser(); this.an.fftSize = 1024;
    src.connect(this.an);
    this.tampon = new Float32Array(this.an.fftSize);
    this.boucle();

    this.bouts = [];
    this.mr = new MediaRecorder(this.flux);
    this.mr.ondataavailable = e => { if (e.data.size) this.bouts.push(e.data); };
    this.mr.start();
    this.t0 = performance.now();
  }

  boucle() {
    if (!this.an) return;
    this.an.getFloatTimeDomainData(this.tampon);
    let c = 0; for (const v of this.tampon) c = Math.max(c, Math.abs(v));
    this.onNiveau(c, (performance.now() - this.t0) / 1000);
    this.raf = requestAnimationFrame(() => this.boucle());
  }

  async arrete() {
    cancelAnimationFrame(this.raf); this.an = null;
    const brut = await new Promise(ok => { this.mr.onstop = () => ok(new Blob(this.bouts)); this.mr.stop(); });
    this.flux.getTracks().forEach(t => t.stop());
    await this.ctx.close();
    return this.nettoie(await brut.arrayBuffer());
  }

  async nettoie(octets) {
    const r = litReglages();
    const dec = new AudioContext();
    const brut = await dec.decodeAudioData(octets);
    await dec.close();

    // étages 2 et 3 — filtres natifs, rendus en 44,1 kHz mono
    const SR = 44100;
    const off = new OfflineAudioContext(1, Math.ceil(brut.duration * SR), SR);
    const src = off.createBufferSource(); src.buffer = brut;
    const hp = off.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 85; hp.Q.value = .7;
    const comp = off.createDynamicsCompressor();
    comp.threshold.value = -24; comp.knee.value = 24; comp.ratio.value = 3;
    comp.attack.value = .004;  comp.release.value = .18;
    const gain = off.createGain(); gain.gain.value = Math.pow(10, r.voix / 20);
    src.connect(hp).connect(comp).connect(gain).connect(off.destination);
    src.start();
    const rendu = await off.startRendering();

    let x = rendu.getChannelData(0).slice();

    // étage 4 — plancher de bruit mesuré, puis expandeur doux
    const F = Math.round(SR * .02);                                   // fenêtres de 20 ms
    const rms = [];
    for (let i = 0; i + F <= x.length; i += F) {
      let s = 0; for (let j = i; j < i + F; j++) s += x[j] * x[j];
      rms.push(Math.sqrt(s / F));
    }
    const tri = [...rms].sort((a, b) => a - b);
    const plancher = tri[Math.floor(tri.length * .1)] || 1e-5;        // le décile le plus calme = le bruit
    const seuil = plancher * Math.pow(10, r.bruit / 20);

    let env = 0;
    const monte = Math.exp(-1 / (SR * .003)), descend = Math.exp(-1 / (SR * .08));
    let g = 1;
    const lisse = Math.exp(-1 / (SR * .005));
    for (let i = 0; i < x.length; i++) {
      const a = Math.abs(x[i]);
      env = a > env ? a + (env - a) * monte : a + (env - a) * descend;
      const cible = env >= seuil ? 1 : Math.pow(Math.max(env, 1e-9) / seuil, 2);  // écrasement progressif
      g = cible + (g - cible) * lisse;                                            // pas de clic
      x[i] *= g;
    }

    // étage 5 — rogner les silences, garder une petite marge, puis normaliser
    const parle = seuil * 2;
    let d = 0, f = x.length - 1;
    while (d < x.length && Math.abs(x[d]) < parle) d++;
    while (f > d && Math.abs(x[f]) < parle) f--;
    if (d >= f) return null;                                           // rien que du silence
    const marge = Math.round(SR * r.marge / 1000);
    x = x.subarray(Math.max(0, d - marge), Math.min(x.length, f + marge));

    let crete = 0; for (const v of x) crete = Math.max(crete, Math.abs(v));
    const k = crete > 0 ? .89 / crete : 1;                              // −1 dBFS
    const pcm = new Int16Array(x.length);
    for (let i = 0; i < x.length; i++) {
      const v = Math.max(-1, Math.min(1, x[i] * k));
      pcm[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
    }
    return { mp3: encodeMP3(pcm, SR), secondes: x.length / SR };
  }
}

/* MP3 mono 128 kb/s — le même format que les fichiers déjà en place */
function encodeMP3(pcm, sr) {
  const enc = new lamejs.Mp3Encoder(1, sr, 128), morceaux = [];
  for (let i = 0; i < pcm.length; i += 1152) {
    const b = enc.encodeBuffer(pcm.subarray(i, i + 1152));
    if (b.length) morceaux.push(b);
  }
  const fin = enc.flush(); if (fin.length) morceaux.push(fin);
  let n = 0; morceaux.forEach(m => n += m.length);
  const out = new Uint8Array(n); let o = 0;
  morceaux.forEach(m => { out.set(m, o); o += m.length; });
  return out;
}

/* ---------------------------------------------------------------- DÉPOSER */
function base64(u8) {
  let s = ''; const P = 0x8000;
  for (let i = 0; i < u8.length; i += P) s += String.fromCharCode.apply(null, u8.subarray(i, i + P));
  return btoa(s);
}
async function poste(route, corps) {
  const r = await fetch(route, { method: 'POST', headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify(corps) });
  return r.json();
}

/* ---------------------------------------------------------------- LA COLONNE « ENREGISTRER »
   Un seul composant, réutilisé par les deux pages. Trois temps : repos → on enregistre →
   on écoute ce qu'on vient de dire et on garde (ou on refait).
   `deposer` dit OÙ va la prise : sur le disque en local, dans Supabase en ligne — même
   composant des deux côtés, une seule chaîne de nettoyage à entretenir.             */
/* ⚠️ Une prise ne part JAMAIS directement dans l'app : elle attend dans
   audios-generes-a-valider/, on la réécoute, et le bouton « prendre » l'installe.
   Un son qu'on vient d'enregistrer n'a pas encore été jugé — surtout pas à l'oreille. */
const DEPOT_LOCAL = (fichier, mp3) =>
  poste('/api/enregistrer', { fichier, mp3: base64(mp3), dossier: 'attente' });

function colonneMicro(cellule, fichier, apresDepot, deposer = DEPOT_LOCAL) {
  const td = document.createElement('div'); td.className = 'rec'; cellule.append(td);
  let micro = null;

  const bouton = document.createElement('button');
  bouton.className = 'bmic'; bouton.textContent = '🎙 Enregistrer';
  const jauge = document.createElement('span'); jauge.className = 'niveau'; jauge.innerHTML = '<i></i>';
  const chrono = document.createElement('span'); chrono.className = 'chrono';
  const etat = document.createElement('span'); etat.className = 'etat';
  jauge.style.display = chrono.style.display = 'none';
  td.append(bouton, jauge, chrono, etat);

  const repos = () => {
    bouton.className = 'bmic'; bouton.textContent = '🎙 Enregistrer'; bouton.disabled = false;
    jauge.style.display = chrono.style.display = 'none';
    td.querySelectorAll('.apres').forEach(e => e.remove());
  };

  bouton.onclick = async () => {
    if (micro) {                                          // ---- on arrête
      bouton.disabled = true; bouton.textContent = '⏳ nettoyage…';
      let res = null;
      try { res = await micro.arrete(); } catch (e) { etat.className = 'etat ko'; etat.textContent = String(e.message || e); }
      micro = null; jauge.style.display = chrono.style.display = 'none';
      if (!res) { repos(); etat.className = 'etat ko'; etat.textContent = 'rien entendu — recommence'; return; }
      propose(res);
      return;
    }
    try {                                                 // ---- on démarre
      etat.textContent = ''; td.querySelectorAll('.apres').forEach(e => e.remove());
      micro = new Micro((c, s) => {
        jauge.firstChild.style.width = Math.min(100, c * 140) + '%';
        jauge.classList.toggle('fort', c > .92);          // rouge = ça sature, elle recule du micro
        chrono.textContent = s.toFixed(1) + 's';
      });
      await micro.demarre();
      bouton.className = 'bmic enreg'; bouton.textContent = '⏹ Stop';
      jauge.style.display = chrono.style.display = '';
    } catch (e) {
      micro = null; etat.className = 'etat ko';
      etat.textContent = 'micro refusé — autorise-le dans le navigateur';
    }
  };

  function propose(res) {
    bouton.className = 'bmic'; bouton.textContent = '🎙 Refaire'; bouton.disabled = false;
    const blob = new Blob([res.mp3], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);

    const ecoute = document.createElement('button');
    ecoute.className = 'play apres'; ecoute.textContent = '▶';
    ecoute.title = 'écouter ce que tu viens d’enregistrer';
    ecoute.onclick = () => jouer(url, ecoute);

    const duree = document.createElement('span');
    duree.className = 'duree apres'; duree.textContent = res.secondes.toFixed(1) + 's';

    const garder = document.createElement('button');
    garder.className = 'bok apres'; garder.textContent = '✓ Garder';
    garder.title = 'mettre cette prise de côté — elle n’entre dans l’app qu’avec « prendre »';
    garder.onclick = async () => {
      garder.disabled = true; garder.textContent = '…';
      const r = await deposer(fichier, res.mp3);
      if (r.erreur) { garder.disabled = false; garder.textContent = '✓ Garder';
                      etat.className = 'etat ko'; etat.textContent = r.erreur; return; }
      toast(r.envoye ? fichier + ' envoyé ✓'
          : r.dossier === 'attente' ? fichier + ' mis de côté — écoute-le, puis « prendre »'
          : fichier + ' remplacé — l’ancien est dans _remplaces/');
      repos(); apresDepot && apresDepot(r);
    };
    td.append(ecoute, duree, garder);
  }
}
