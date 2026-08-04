/* ===== ALAQ — L'étape « signer la cession de droits » (04/08/2026) =====
   Entre la connexion et le tableau des sons. Tant qu'il n'y a pas de signature
   enregistrée, aucun son ne peut être enregistré.

   Ce que la signature emporte comme preuve, et pourquoi chaque pièce compte :
     · l'adresse e-mail est VÉRIFIÉE par le code à usage unique (c'est la connexion) ;
     · l'identité est saisie par la personne elle-même ;
     · le tracé manuscrit manifeste le geste de signer ;
     · l'empreinte SHA-256 du texte EXACT fige ce qui a été accepté — si le contrat
       change plus tard, l'empreinte enregistrée le prouve ;
     · l'horodatage et l'adresse de connexion sont posés par le SERVEUR, pas par le
       navigateur : la personne ne peut pas les fabriquer (voir installer-supabase.sql,
       colonnes en `default` et droits d'insertion limités aux autres colonnes).

   ⚠️ C'est une signature électronique SIMPLE au sens d'eIDAS : recevable en justice
   (art. 25.1), mais sans la présomption de fiabilité réservée à la signature
   QUALIFIÉE (art. 1367 al. 2 du code civil). En cas de contestation, c'est au
   Producteur de prouver l'identité et l'intégrité — ce que les pièces ci-dessus
   servent précisément à établir. Pour une valeur probante supérieure : passer par un
   prestataire qualifié (Yousign, DocuSign) — le texte du contrat reste le même.   */

const JSPDF_URL = 'https://cdn.jsdelivr.net/npm/jspdf@4.2.1/dist/jspdf.umd.min.js';
const JSPDF_SRI = 'sha384-qovJwSBbRDPP5cEjCp8S0UP66wrvnjaa60XMOGzTNanrThcrGfXfnZkvgY8N1KT3';

function chargeScript(src, integrity) {
  return new Promise((ok, ko) => {
    const s = document.createElement('script');
    s.src = src; s.integrity = integrity; s.crossOrigin = 'anonymous';
    s.onload = ok; s.onerror = () => ko(new Error('script refusé : ' + src));
    document.head.append(s);
  });
}

async function empreinte(texte) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}

/* ---------------------------------------------------------------- LE FORMULAIRE */
const CHAMPS = [
  { k:'prenom',      l:'Prénom',                         t:'text' },
  { k:'nom',         l:'Nom',                            t:'text' },
  { k:'naissance',   l:'Date de naissance',              t:'date' },
  { k:'lieuNaissance', l:'Lieu de naissance (ville)',    t:'text' },
  { k:'nationalite', l:'Nationalité',                    t:'text' },
  { k:'adresse',     l:'Adresse complète',               t:'text', large:1 },
  // « où tu vis et enregistres » : c'est la RÉSIDENCE qui compte, jamais la nationalité
  { k:'pays',        l:'Pays de résidence (où tu vis et enregistres)', t:'text' },
  { k:'statut',      l:'Tu interviens en tant que',      t:'select',
    o:[['independant','travailleur indépendant'],
       ['societe','société'],
       ['particulier','particulier']] },
  // facultatif : beaucoup de gens n'ont aucun numéro, et c'est un cas prévu par le contrat
  { k:'immatriculation', l:'Numéro d’immatriculation — laisse vide si tu n’en as pas',
    t:'text', large:1, opt:1 },
  { k:'raisonSociale',   l:'Raison sociale',       t:'text', si:d => d.statut === 'societe' },
  { k:'formeJuridique',  l:'Forme juridique',      t:'text', si:d => d.statut === 'societe' },
];

function montreContrat(SB, utilisateur, REMUNERATION, apresSignature) {
  const hote = document.getElementById('contrat');
  // ⚠️ 'block' et non '' : le masquage vient d'une RÈGLE CSS (#contrat{display:none}),
  //    or vider le style en ligne laisse la règle s'appliquer — l'écran resterait invisible.
  hote.style.display = 'block';
  hote.innerHTML = '';

  const d = { email: utilisateur.email, ...REMUNERATION };

  const h = document.createElement('div'); h.className = 'ctr-tete';
  h.innerHTML = '<h1>Avant d’enregistrer : la cession de droits</h1>' +
    '<p>Ta voix t’appartient. Pour qu’ALAQ puisse l’utiliser dans l’application, il faut ' +
    'ton accord écrit. Remplis tes informations, lis le contrat, signe — tu recevras ' +
    'ton exemplaire en PDF.</p>';
  hote.append(h);

  /* --- les champs --- */
  const form = document.createElement('div'); form.className = 'ctr-form';
  const entrees = {};
  CHAMPS.forEach(c => {
    const l = document.createElement('label'); l.className = 'ctr-champ' + (c.large ? ' large' : '');
    const t = document.createElement('span'); t.textContent = c.l;
    let i;
    if (c.t === 'select') {
      i = document.createElement('select');
      i.innerHTML = '<option value="">—</option>' +
        c.o.map(([v, n]) => '<option value="' + v + '">' + n + '</option>').join('');
    } else { i = document.createElement('input'); i.type = c.t; }
    i.oninput = i.onchange = () => { d[c.k] = i.value.trim(); redessine(); };
    entrees[c.k] = { l, i };
    l.append(t, i); form.append(l);
  });
  const mailFixe = document.createElement('label'); mailFixe.className = 'ctr-champ';
  mailFixe.innerHTML = '<span>Adresse e-mail (vérifiée par ton code)</span>';
  const mi = document.createElement('input'); mi.value = utilisateur.email; mi.disabled = true;
  mailFixe.append(mi); form.append(mailFixe);
  hote.append(form);

  /* --- le texte, qui se remplit à mesure --- */
  const boite = document.createElement('pre'); boite.className = 'ctr-texte';
  hote.append(boite);

  /* --- la signature --- */
  const zone = document.createElement('div'); zone.className = 'ctr-signe';
  zone.innerHTML =
    '<label class="ctr-case"><input type="checkbox" id="cLu"> J’ai lu l’intégralité du contrat ci-dessus et j’en accepte tous les termes.</label>' +
    '<label class="ctr-case"><input type="checkbox" id="cCede"> Je cède au Producteur mes droits voisins d’artiste-interprète sur mes enregistrements, dans les conditions de l’article 3.</label>' +
    '<label class="ctr-case"><input type="checkbox" id="cVrai"> Les informations d’identité que j’ai saisies sont exactes.</label>' +
    '<p class="mini">Signe ci-dessous avec la souris ou le doigt :</p>';
  const toile = document.createElement('canvas');
  toile.width = 520; toile.height = 150; toile.className = 'ctr-toile';
  const effacer = document.createElement('button'); effacer.className = 'brefaire'; effacer.textContent = '↺ Effacer';
  const valider = document.createElement('button'); valider.className = 'bok'; valider.textContent = '✓ Signer et continuer';
  const etat = document.createElement('div'); etat.className = 'etat';
  const ligne = document.createElement('div'); ligne.className = 'ctr-actions';
  ligne.append(effacer, valider, etat);
  zone.append(toile, ligne);
  hote.append(zone);

  /* le tracé : souris et doigt, même code (Pointer Events) */
  const ctx = toile.getContext('2d');
  ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#F2E9DA';
  let trace = false, vide = true;
  const pt = e => { const r = toile.getBoundingClientRect();
                    return [(e.clientX - r.left) * toile.width / r.width,
                            (e.clientY - r.top) * toile.height / r.height]; };
  toile.addEventListener('pointerdown', e => { trace = true; vide = false; toile.setPointerCapture(e.pointerId);
                                               const [x, y] = pt(e); ctx.beginPath(); ctx.moveTo(x, y); });
  toile.addEventListener('pointermove', e => { if (!trace) return; const [x, y] = pt(e); ctx.lineTo(x, y); ctx.stroke(); });
  toile.addEventListener('pointerup', () => { trace = false; majBouton(); });
  effacer.onclick = () => { ctx.clearRect(0, 0, toile.width, toile.height); vide = true; majBouton(); };

  const cases = () => ['cLu','cCede','cVrai'].every(i => document.getElementById(i).checked);
  ['cLu','cCede','cVrai'].forEach(i => document.getElementById(i).onchange = majBouton);

  function manquants() {
    return CHAMPS.filter(c => !c.opt && (!c.si || c.si(d)) && !d[c.k]).map(c => c.l);
  }

  /* ⚠️ Un particulier NON IMMATRICULÉ qui enregistre DEPUIS LA FRANCE : le concours
     rémunéré d'un artiste y est présumé être un contrat de travail (C. trav. L. 7121-3),
     et l'exception L. 7121-4 ne joue que pour un professionnel immatriculé. Le payer
     comme un prestataire exposerait au travail dissimulé. Le passage obligé est le GUSO
     (guichet unique du spectacle occasionnel) ou un contrat de travail en bonne et due
     forme — pas ce contrat-ci. On refuse de le laisser signer. */
  const sansAccent = t => (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  function blocageFrance() {
    return !estImmatricule(d) && /^(la )?france$/.test(sansAccent(d.pays));
  }
  function majBouton() {
    const m = manquants();
    if (blocageFrance()) {
      valider.disabled = true;
      etat.className = 'etat ko';
      etat.textContent = 'Non immatriculé et résidant en France : ce contrat ne convient pas. '
                       + 'Écris à ' + CESSIONNAIRE.courriel + ', une autre formule est nécessaire.';
      return;
    }
    valider.disabled = m.length > 0 || vide || !cases();
    etat.className = 'etat';
    etat.textContent = m.length ? 'à compléter : ' + m.slice(0, 3).join(', ') + (m.length > 3 ? '…' : '')
                     : vide ? 'il manque ta signature'
                     : !cases() ? 'il reste une case à cocher' : '';
  }
  function redessine() {
    CHAMPS.forEach(c => { entrees[c.k].l.style.display = (!c.si || c.si(d)) ? '' : 'none'; });
    boite.textContent = contratTexte(remplis(d));
    majBouton();
  }
  /* les champs vides apparaissent en clair dans l'aperçu : on voit ce qui manque */
  function remplis(d) {
    const o = { ...d };
    CHAMPS.forEach(c => { if (!o[c.k]) o[c.k] = '……………'; });
    return o;
  }
  redessine();

  /* ---------------------------------------------------------------- SIGNER */
  valider.onclick = async () => {
    valider.disabled = true; etat.className = 'etat'; etat.textContent = 'signature en cours…';
    try {
      if (blocageFrance()) throw new Error('cas non couvert par ce contrat');
      const texte = contratTexte(d);                       // le texte EXACT, sans remplissage
      const sceau = await empreinte(texte);
      const signature = toile.toDataURL('image/png');

      // 1 · la trace en base : l'horodatage et l'adresse sont posés par le serveur
      const { data: ligneBase, error } = await SB.from('contrats').insert({
        email: utilisateur.email,
        identite: { prenom:d.prenom, nom:d.nom, naissance:d.naissance, lieuNaissance:d.lieuNaissance,
                    nationalite:d.nationalite, adresse:d.adresse, pays:d.pays, statut:d.statut,
                    immatriculation:d.immatriculation || null, raisonSociale:d.raisonSociale || null,
                    formeJuridique:d.formeJuridique || null },
        version: CONTRAT_VERSION,
        empreinte: sceau,
        signature_png: signature,
        remuneration: d.remuneration,
      }).select().single();
      if (error) throw new Error(error.message);

      // 2 · le PDF, identique au texte scellé, ligne pour ligne
      etat.textContent = 'préparation du PDF…';
      const pdf = await fabriquePDF(texte, sceau, signature, d, ligneBase);

      // 3 · un exemplaire pour le Producteur, déposé avec les enregistrements
      const nomPdf = 'contrats/' + (ligneBase.signe_le || '').slice(0, 19).replace(/[-:T]/g, '')
                   + '_' + utilisateur.email.replace(/[^a-z0-9]/gi, '-') + '.pdf';
      const { error: e2 } = await SB.storage.from(SEAU)
        .upload(nomPdf, pdf.blob, { contentType: 'application/pdf' });
      if (e2) console.warn('dépôt du PDF : ' + e2.message);   // la signature reste valable
      await SB.from('contrats').update({ pdf_chemin: e2 ? null : nomPdf }).eq('id', ligneBase.id);

      // 4 · et un exemplaire pour la personne qui signe
      pdf.telecharge('ALAQ-cession-de-droits-' + d.nom + '.pdf');

      etat.className = 'etat ok'; etat.textContent = 'signé ✓';
      setTimeout(() => { hote.style.display = 'none'; apresSignature(ligneBase); }, 1200);
    } catch (e) {
      valider.disabled = false;
      etat.className = 'etat ko'; etat.textContent = 'échec : ' + (e.message || e);
    }
  };
}

/* ---------------------------------------------------------------- LE PDF
   Courier 9 pt et les lignes telles quelles : le PDF est le rendu FIDÈLE du texte
   dont on a pris l'empreinte. Un re-formatage donnerait un document qui ne
   correspondrait plus, ligne pour ligne, à ce qui a été scellé.               */
async function fabriquePDF(texte, sceau, signaturePNG, d, ligneBase) {
  if (!window.jspdf) await chargeScript(JSPDF_URL, JSPDF_SRI);
  const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4' });
  const MARGE = 46, HAUT = 52, BAS = 46, INTER = 11.4;
  const hauteur = doc.internal.pageSize.getHeight();
  let y = HAUT;
  doc.setFont('courier', 'normal'); doc.setFontSize(9);

  /* Le texte est pré-coupé à ~80 colonnes, mais les valeurs saisies (une adresse longue,
     une raison sociale) peuvent faire déborder une ligne hors de la page. On replie
     alors CETTE ligne seule, en gardant son retrait — le reste ne bouge pas d'un pixel. */
  const LARGEUR = doc.internal.pageSize.getWidth() - 2 * MARGE;
  const ligne = (t, gras) => {
    doc.setFont('courier', gras ? 'bold' : 'normal');
    const retrait = (t.match(/^ */) || [''])[0];
    const morceaux = doc.getTextWidth(t) <= LARGEUR
      ? [t]
      : doc.splitTextToSize(t, LARGEUR).map((m, i) => i ? retrait + '  ' + m.trimStart() : m);
    morceaux.forEach(m => {
      if (y > hauteur - BAS) { doc.addPage(); y = HAUT; }
      doc.text(m || ' ', MARGE, y); y += INTER;
    });
  };
  texte.split('\n').forEach(l => ligne(l, /^(ARTICLE |CONTRAT D|ENTRE LES|D’UNE PART|D’AUTRE PART)/.test(l)));

  // le bloc de preuve
  y += 8; ligne('—'.repeat(72)); ligne('');
  ligne('SIGNATURE ÉLECTRONIQUE', true);
  ligne('');
  ligne('Signataire        : ' + d.prenom + ' ' + d.nom);
  ligne('Adresse e-mail    : ' + d.email + '  (vérifiée par code à usage unique)');
  ligne('Signé le          : ' + (ligneBase.signe_le || '').replace('T', ' ').slice(0, 19) + ' (heure du serveur)');
  ligne('Adresse de conn.  : ' + (ligneBase.ip || 'non communiquée'));
  ligne('Version du contrat: ' + CONTRAT_VERSION);
  ligne('Référence         : ' + ligneBase.id);
  ligne('');
  ligne('Empreinte SHA-256 du texte accepté :');
  ligne('  ' + sceau.slice(0, 32));
  ligne('  ' + sceau.slice(32));
  ligne('');
  ligne('Toute modification du texte ci-dessus, même d’un seul caractère, change');
  ligne('cette empreinte : elle atteste de ce qui a été accepté, et de rien d’autre.');
  ligne('');
  if (y > hauteur - BAS - 90) { doc.addPage(); y = HAUT; }
  ligne('Tracé manuscrit du signataire :');
  doc.addImage(signaturePNG, 'PNG', MARGE, y, 208, 60);
  y += 68;
  ligne('Pour le Producteur : ' + CESSIONNAIRE.representant + ' — ' + CESSIONNAIRE.denomination);

  const blob = doc.output('blob');
  return { blob, telecharge: nom => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = nom; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }};
}

/* A-t-on déjà signé ? On ne redemande jamais deux fois. */
async function contratDejaSigne(SB) {
  const { data } = await SB.from('contrats').select('id,version,signe_le')
    .eq('version', CONTRAT_VERSION).limit(1);
  return data && data.length ? data[0] : null;
}
