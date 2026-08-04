/* ===== ALAQ — Le texte du contrat signé par le preneur de son (04/08/2026) =====

   ⚠️ CE FICHIER EST LE CONTRAT. Toute modification change ce que les gens signent :
   incrémenter VERSION à chaque changement de fond. L'empreinte SHA-256 du texte
   EXACT est enregistrée avec chaque signature — c'est elle qui prouve, plus tard,
   quelle version a été acceptée.

   ⚠️ Rédigé avec soin mais PAS par un juriste. Avant le premier envoi réel, le faire
   relire par un avocat ou un juriste (une heure suffit). Points de vigilance déjà
   traités dans le texte, à vérifier avec lui :
     · l'exécutant est un ARTISTE-INTERPRÈTE : ses droits sont des DROITS VOISINS
       (CPI L212-1 s.), pas du droit d'auteur — la fixation, la reproduction et la
       communication au public exigent son autorisation ÉCRITE (L212-3) ;
     · ses DROITS MORAUX sont INALIÉNABLES (L212-2) : on ne peut pas les lui faire
       céder. Le texte se limite donc à ce qui est licite (renonciation à la mention
       du nom, accord préalable sur les traitements techniques) ;
     · CPI L131-3 : chaque droit transmis doit être mentionné distinctement, avec son
       étendue, sa destination, le lieu et la durée — d'où l'article 3, détaillé ;
     · CPI L131-1 : la cession globale des œuvres FUTURES est nulle — d'où le
       périmètre limité aux enregistrements déposés via le studio (article 2) ;
     · Code du travail L7121-3 : en France, le concours d'un artiste rémunéré est
       PRÉSUMÉ être un contrat de travail. La présomption tombe si l'intéressé exerce
       en professionnel indépendant immatriculé (L7121-4) — d'où l'article 6 et la
       déclaration d'indépendance obligatoire dans le formulaire.                 */

const CONTRAT_VERSION = '2026-08-04.4';

/* Les valeurs manquantes sont marquées « ⟨…⟩ » : la fabrication REFUSE de construire
   le dossier en ligne tant qu'il en reste une. Voir construire-en-ligne.js. */
const CESSIONNAIRE = {
  /* Une entreprise individuelle n'a pas de dénomination propre : c'est le nom de la
     personne. Depuis la loi du 14 février 2022, il doit être suivi de la mention
     « entrepreneur individuel » ou « EI » sur les documents professionnels. */
  denomination:  'Myriam Bouchtaïb, épouse Bouderga, entrepreneur individuel (EI)',
  representant:  'Myriam Bouchtaïb, épouse Bouderga',
  forme:         'entreprise individuelle sous le régime de la micro-entreprise',
  siren:         '528 136 666',
  adresse:       '6 passage de la Porte Comprise, 95800 Cergy, France',
  courriel:      'prof.mifizi@gmail.com',
  projet:        'ALAQ — application d’apprentissage de la lecture de l’arabe et du Qorān',
};

/* ARTICLE 6 — il change selon que la personne est immatriculée ou non.
   ⚠️ Ne JAMAIS faire déclarer une immatriculation à qui n'en a pas : une fausse
   déclaration fragilise tout l'acte. Et la présomption de contrat de travail des
   artistes (C. trav. L. 7121-3) ne s'écarte par l'exception L. 7121-4 QUE pour un
   professionnel immatriculé — un particulier ne peut pas s'en prévaloir.
   ⚠️ La validité de la CESSION, elle, ne dépend pas de l'immatriculation : un
   particulier cède valablement ses droits voisins. Ce qui change, c'est le régime
   social et fiscal du paiement, et le risque de requalification EN FRANCE. */
function article6(d) {
  const commun = `
L’Interprète déclare agir en toute autonomie quant à ses moyens, son matériel, son
lieu et ses horaires de travail. Il n’existe entre les parties aucun lien de
subordination, ni aucune exclusivité de temps de travail.

La prestation est réalisée intégralement depuis ${d.pays}, au moyen du matériel
personnel de l’Interprète.`;

  if (!estImmatricule(d)) return `${commun}

L’Interprète déclare ne pas être immatriculé en qualité de professionnel. Il fait son
affaire personnelle de la déclaration des sommes perçues auprès des autorités
compétentes de son pays de résidence, et garantit le Producteur contre toute
réclamation d’un organisme social ou fiscal à ce titre.

Les parties conviennent que la prestation, ponctuelle et réalisée hors du territoire
français, ne relève pas du régime français des artistes du spectacle.`;

  return `${commun}

L’Interprète déclare être en règle au regard des obligations déclaratives, sociales et
fiscales qui lui incombent dans son pays de résidence, et fait son affaire personnelle
de la déclaration des sommes perçues.

L’Interprète est informé de ce que l’article L. 7121-3 du code du travail français
institue une présomption de contrat de travail pour le concours rémunéré d’un artiste
du spectacle, et déclare relever de l’exception prévue à l’article L. 7121-4, exerçant
son activité en professionnel indépendant immatriculé.`;
}

/* Le texte. `d` = les données saisies par la personne qui signe. */
/* Est-on immatriculé ? Le FAIT, pas la case du menu : quelqu'un peut se dire
   « indépendant » sans avoir de numéro. C'est le numéro qui emporte les conséquences. */
const estImmatricule = d => !!(d.immatriculation && String(d.immatriculation).trim());

function contratTexte(d) {
  const C = CESSIONNAIRE;
  /* le champ « date » du navigateur rend 1990-05-02 ; sur un contrat on écrit 02/05/1990 */
  const jour = t => /^\d{4}-\d{2}-\d{2}$/.test(t || '') ? t.slice(8) + '/' + t.slice(5, 7) + '/' + t.slice(0, 4) : t;
  const num = estImmatricule(d) ? `, immatriculé${d.statut === 'societe' ? 'e' : ''} sous le numéro ${d.immatriculation}` : '';
  const qualite = d.statut === 'societe'
    ? `${d.raisonSociale}, ${d.formeJuridique}${num}, dont le siège est ${d.adresse} (${d.pays}), représentée par ${d.prenom} ${d.nom}`
    : d.statut === 'independant'
      ? `${d.prenom} ${d.nom}, travailleur indépendant${num}, demeurant ${d.adresse} (${d.pays})`
      : `${d.prenom} ${d.nom}${num}, demeurant ${d.adresse} (${d.pays})`;

  return `CONTRAT D’ENREGISTREMENT ET DE CESSION DE DROITS VOISINS D’ARTISTE-INTERPRÈTE

Version du contrat : ${CONTRAT_VERSION}


ENTRE LES SOUSSIGNÉS

${C.denomination}, ${C.forme}, immatriculée sous le numéro ${C.siren}, dont le siège
est situé ${C.adresse}, représentée par ${C.representant},
ci-après « le Producteur »,

D’UNE PART,

ET

${qualite},
né(e) le ${jour(d.naissance)} à ${d.lieuNaissance}, de nationalité ${d.nationalite},
adresse électronique ${d.email},
ci-après « l’Interprète »,

D’AUTRE PART.


ARTICLE 1 — OBJET

L’Interprète réalise, à la demande du Producteur, des enregistrements sonores de sa
voix : lettres, syllabes, mots et expressions en langue arabe, destinés au projet
${C.projet}.

L’Interprète intervient en qualité d’artiste-interprète au sens de l’article L. 212-1
du code de la propriété intellectuelle. Le présent contrat vaut autorisation écrite au
sens de l’article L. 212-3 du même code.


ARTICLE 2 — PÉRIMÈTRE

Le présent contrat porte exclusivement sur les enregistrements que l’Interprète dépose,
depuis son compte, au moyen de l’outil en ligne mis à disposition par le Producteur.
Chaque dépôt est horodaté et conservé ; la liste des fichiers déposés constitue
l’annexe du présent contrat.

Conformément à l’article L. 131-1 du code de la propriété intellectuelle, le présent
contrat ne porte sur aucune prestation future indéterminée : toute prestation nouvelle
non déposée par ce moyen fera l’objet d’un accord distinct.


ARTICLE 3 — CESSION DES DROITS VOISINS

L’Interprète autorise le Producteur, à titre exclusif, et lui cède l’ensemble de ses
droits patrimoniaux d’artiste-interprète sur les enregistrements visés à l’article 2.

Les droits cédés sont, chacun distinctement :

  a) le droit de FIXATION : enregistrer la prestation sur tout support ;
  b) le droit de REPRODUCTION : reproduire les enregistrements, en tout ou partie, en
     nombre illimité, sur tout support connu ou à venir, notamment numérique ;
  c) le droit de COMMUNICATION AU PUBLIC : diffuser les enregistrements par tout
     procédé, notamment par réseau informatique, application mobile, site internet,
     plateforme de diffusion et support hors ligne ;
  d) le droit d’ADAPTATION TECHNIQUE : découper, raccourcir, égaliser, débruiter,
     normaliser, changer de format ou de débit, aux fins d’intégration dans
     l’application, sans que ces traitements portent atteinte à l’interprétation ;
  e) le droit de MISE À DISPOSITION à la demande, permettant à chacun d’accéder aux
     enregistrements du lieu et au moment qu’il choisit individuellement.

DESTINATION : les enregistrements sont destinés au projet ${C.projet}, à ses
déclinaisons, ainsi qu’à sa promotion. L’exploitation peut être COMMERCIALE.

ÉTENDUE TERRITORIALE : le monde entier.

DURÉE : la durée légale de protection des droits voisins de l’artiste-interprète,
soit cinquante (50) ans à compter du 1er janvier de l’année civile suivant la première
communication au public, et toute prorogation légale ultérieure.

Le Producteur est libre de ne pas exploiter tout ou partie des enregistrements.


ARTICLE 4 — DROIT MORAL

Le droit moral de l’Interprète, prévu à l’article L. 212-2 du code de la propriété
intellectuelle, est inaliénable : il n’est pas cédé et ne saurait l’être.

L’Interprète accepte expressément que les traitements techniques énumérés à
l’article 3.d, qu’il reconnaît nécessaires à la destination convenue, ne portent pas
atteinte au respect dû à son interprétation.

L’Interprète accepte que les enregistrements soient exploités SANS mention de son nom.
Il conserve le droit d’en demander la mention ; le Producteur y procédera alors dans un
délai raisonnable et selon les moyens de l’application.


ARTICLE 5 — RÉMUNÉRATION

En contrepartie de la prestation et de la cession des droits visée à l’article 3, le
Producteur verse à l’Interprète : ${d.remuneration}.

Paiement : ${(d.modalitesPaiement || '').replace(/\.$/, '')}.

Le nombre d’enregistrements effectivement livrés et acceptés est établi par la liste
des fichiers déposés visée à l’article 2, qui fait foi entre les parties.

Cette rémunération couvre l’intégralité des droits cédés, pour toute la durée, tout le
territoire et toutes les destinations prévues à l’article 3. Aucune autre somme n’est
due à quelque titre que ce soit.


ARTICLE 6 — QUALITÉ DE L’INTERPRÈTE
${article6(d)}


ARTICLE 7 — GARANTIES DE L’INTERPRÈTE

L’Interprète garantit :
  a) qu’il est titulaire des droits cédés et libre de tout engagement contraire,
     notamment de toute exclusivité au profit d’un tiers ;
  b) qu’il n’est lié à aucun organisme de gestion collective de nature à faire
     obstacle à la présente cession, ou qu’il en a informé le Producteur par écrit ;
  c) que ses enregistrements sont personnels, réalisés par sa propre voix, sans
     recours à une synthèse vocale ni à la voix d’un tiers, et ne reprennent aucun
     enregistrement préexistant appartenant à autrui ;
  d) qu’il garantit le Producteur contre tout trouble, revendication ou éviction du
     fait d’un tiers relatif aux droits cédés.


ARTICLE 8 — DONNÉES PERSONNELLES

Les données d’identité recueillies au présent contrat sont traitées par le Producteur
aux seules fins de conclure et d’exécuter ce contrat et d’en conserver la preuve. Leur
base légale est l’exécution du contrat et le respect des obligations légales du
Producteur. Elles sont conservées pendant la durée des droits cédés augmentée des
délais de prescription.

L’enregistrement de la voix constitue une donnée à caractère personnel ; son traitement
a pour base légale l’exécution du présent contrat.

L’Interprète dispose des droits d’accès, de rectification, d’effacement, de limitation
et d’opposition prévus par le règlement (UE) 2016/679, exerçables auprès de
${C.courriel}. L’exercice du droit à l’effacement ne remet pas en cause la validité de
la cession des droits, ni la conservation des pièces nécessaires à la preuve du contrat.


ARTICLE 9 — SIGNATURE ÉLECTRONIQUE

Les parties conviennent de signer le présent contrat par voie électronique.

Conformément à l’article 25 du règlement (UE) n° 910/2014 (eIDAS), une signature
électronique ne peut être privée d’effet juridique au seul motif qu’elle se présente
sous forme électronique.

Le procédé employé associe à la signature : l’adresse électronique de l’Interprète,
vérifiée par l’envoi d’un code à usage unique ; les données d’identité qu’il a
saisies ; le tracé manuscrit qu’il a apposé ; l’empreinte numérique SHA-256 du texte
exact accepté ; ainsi que l’horodatage établi par le serveur du Producteur et l’adresse
de connexion. Ces éléments sont conservés de manière non modifiable.

Les parties reconnaissent à ces éléments la valeur de preuve de leur consentement.


ARTICLE 10 — RÉSILIATION ET SORT DES DROITS

Le présent contrat peut être résilié à tout moment par l’une ou l’autre des parties
pour les prestations à venir, par simple notification écrite.

La cession consentie à l’article 3 sur les enregistrements déjà déposés et payés
demeure acquise au Producteur, la résiliation étant sans effet sur elle.


ARTICLE 11 — LOI APPLICABLE ET JURIDICTION

Le présent contrat est soumis au droit français.

À défaut de règlement amiable, tout différend relatif à sa validité, son
interprétation ou son exécution sera porté devant les tribunaux compétents de France,
les parties déclarant contracter dans le cadre de leur activité professionnelle.


ARTICLE 12 — ACCEPTATION

En cochant les cases prévues et en apposant sa signature, l’Interprète déclare :
  — avoir lu l’intégralité du présent contrat et en accepter tous les termes ;
  — céder au Producteur ses droits voisins d’artiste-interprète dans les conditions
    de l’article 3 ;
  — l’exactitude des informations d’identité qu’il a fournies.
`;
}

if (typeof module !== 'undefined') module.exports = { CONTRAT_VERSION, CESSIONNAIRE, contratTexte, estImmatricule };
