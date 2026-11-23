/* ═══ coran.js — le lecteur du Coran (onglet Islam › Le Coran) : les 114 sourates ═══
   Liste, une carte par verset, la traduction du verset (à décocher), la traduction d'un mot en bulle tant que le doigt reste
   dessus, la voix du mot (quran.com), la récitation du récitateur choisi avec le verset doré et ses mots allumés un à un,
   pause qui garde sa place, écoute d'un verset / de versets / d'une sourate / d'une playlist de 1 à 100 fois ou en boucle,
   marque-pages et dernière lecture, copier et partager un verset. (journal : coran.js · le lecteur du Coran, 03/11)
   Depuis le 18/11 (préviews _apercu-coran-v12 à v18, validées par Myriam) : la barre du haut (⏮ ⏭ changent de sourate, ▶ ■,
   le récitateur, ×1, le cercle de l'épi), deux écritures (simple / mushaf de Médine et ses couleurs du tajwīd), les erreurs
   « à revoir » surlignées et modifiables, mémoriser mot à mot, la lecture qui compte pour la série (3 min = le jour et +10 graines,
   une fois par jour), l'écran de fin et les 7 épis en fermant, l'enchaînement d'une sourate à la suivante.
   Script CLASSIQUE, chargé sous bulles-tutoriels.js et avant coque.js. Ouvert au doigt (ui/parametres.js › ISLAM_CASES) : il
   ne sert jamais au premier rendu, mais il reste classique comme tous les écrans de la coque (aucun import, aucun export).
   AU CHARGEMENT : rien n'est lu ni écrit, il ne pose que coranOuvrir/coranFermer sur window.
   À L'APPEL : S, save, saveLocal, today, SYNC (progression.js) · VOIX, QARI_DEFAUT, HOROV, qariUrl (revision.js) · stopAudio,
   playSfx (son.js) · icoImg (assets.js) · toast, backTo, pendingStreak (coque.js) · validerJour, gagnerGraines, GRAINES,
   feteJourPending, caseHTML, ICO_GRAIN_FIN, ICO_EPI_FIN, fillFinishConstance, confettiBurst, refreshStats (constance.js, ui/).
   DONNÉES : coran/NNN-v1.json, une par sourate (texte Tanzil, mot à mot de l'app, traduction du sens de Rachid Maach / QuranEnc),
   servies par sw.js (cache d'abord). Les horaires des mots viennent de api.quran.com ; la voix d'un mot, de audio.qurancdn.com :
   lues à la source au toucher, jamais copiées ni mises en cache (conditions de Quran Foundation : « Quran data provided by
   Quran.Foundation »). Seule exception : une sourate TÉLÉCHARGÉE pour l'écoute sans connexion (sons et horaires), gardée 7 jours
   au plus — voir « écouter sans connexion » plus bas. */
(function(){
'use strict';
/* la liste : [n, nom, nom arabe vocalisé, sens, versets, slug du site] */
var LISTE=[[1,"Al-Fātiḥa","الْفَاتِحَة","L’Ouverture",7,"al-fatiha"],[2,"Al-Baqara","الْبَقَرَة","La Vache",286,"al-baqara"],[3,"Āl ʿImrān","آلِ عِمْرَان","La Famille d’Imran",200,"al-imran"],[4,"An-Nisāʾ","النِّسَاء","Les Femmes",176,"an-nisa"],[5,"Al-Māʾida","الْمَائِدَة","La Table servie",120,"al-maida"],[6,"Al-Anʿām","الْأَنْعَام","Les Bestiaux",165,"al-anam"],[7,"Al-Aʿrāf","الْأَعْرَاف","Les Murailles",206,"al-araf"],[8,"Al-Anfāl","الْأَنْفَال","Le Butin",75,"al-anfal"],[9,"At-Tawba","التَّوْبَة","Le Repentir",129,"at-tawba"],[10,"Yunus","يُونُس","Jonas",109,"yunus"],[11,"Hud","هُود","Houd",123,"hud"],[12,"Yusuf","يُوسُف","Joseph",111,"yusuf"],[13,"Ar-Raʿd","الرَّعْد","Le Tonnerre",43,"ar-rad"],[14,"Ibrāhim","إِبْرَاهِيم","Abraham",52,"ibrahim"],[15,"Al-Ḥijr","الْحِجْر","",99,"al-hijr"],[16,"An-Naḥl","النَّحْل","Les Abeilles",128,"an-nahl"],[17,"Al-Isrāʾ","الْإِسْرَاء","Le Voyage nocturne",111,"al-isra"],[18,"Al-Kahf","الْكَهْف","La Caverne",110,"al-kahf"],[19,"Maryam","مَرْيَم","Marie",98,"maryam"],[20,"Ṭā-Hā","طه","",135,"ta-ha"],[21,"Al-Anbiyāʾ","الْأَنْبِيَاء","Les Prophètes",112,"al-anbiya"],[22,"Al-Ḥajj","الْحَجّ","Le Pèlerinage",78,"al-hajj"],[23,"Al-Muʾminun","الْمُؤْمِنُون","Les Croyants",118,"al-muminun"],[24,"An-Nur","النُّور","La Lumière",64,"an-nur"],[25,"Al-Furqān","الْفُرْقَان","Le Discernement",77,"al-furqan"],[26,"Ash-Shuʿarāʾ","الشُّعَرَاء","Les Poètes",227,"ash-shuara"],[27,"An-Naml","النَّمْل","Les Fourmis",93,"an-naml"],[28,"Al-Qaṣaṣ","الْقَصَص","Le Récit",88,"al-qasas"],[29,"Al-ʿAnkabut","الْعَنْكَبُوت","L’Araignée",69,"al-ankabut"],[30,"Ar-Rum","الرُّوم","Les Romains",60,"ar-rum"],[31,"Luqmān","لُقْمَان","",34,"luqman"],[32,"As-Sajda","السَّجْدَة","La Prosternation",30,"as-sajda"],[33,"Al-Aḥzāb","الْأَحْزَاب","Les Coalisés",73,"al-ahzab"],[34,"Sabaʾ","سَبَأ","",54,"saba"],[35,"Fāṭir","فَاطِر","Le Créateur",45,"fatir"],[36,"Yā-Sin","يس","",83,"ya-sin"],[37,"Aṣ-Ṣāffāt","الصَّافَّات","Les Rangés",182,"as-saffat"],[38,"Ṣād","ص","",88,"sad"],[39,"Az-Zumar","الزُّمَر","Les Groupes",75,"az-zumar"],[40,"Ghāfir","غَافِر","Le Pardonneur",85,"ghafir"],[41,"Fuṣṣilat","فُصِّلَت","Les Versets détaillés",54,"fussilat"],[42,"Ash-Shurā","الشُّورَى","La Consultation",53,"ash-shura"],[43,"Az-Zukhruf","الزُّخْرُف","L’Ornement",89,"az-zukhruf"],[44,"Ad-Dukhān","الدُّخَان","La Fumée",59,"ad-dukhan"],[45,"Al-Jāthiya","الْجَاثِيَة","L’Agenouillée",37,"al-jathiya"],[46,"Al-Aḥqāf","الْأَحْقَاف","Les Dunes",35,"al-ahqaf"],[47,"Muḥammad","مُحَمَّد","",38,"muhammad"],[48,"Al-Fatḥ","الْفَتْح","La Victoire éclatante",29,"al-fath"],[49,"Al-Ḥujurāt","الْحُجُرَات","Les Appartements",18,"al-hujurat"],[50,"Qāf","ق","",45,"qaf"],[51,"Adh-Dhāriyāt","الذَّارِيَات","Qui éparpillent",60,"adh-dhariyat"],[52,"Aṭ-Ṭur","الطُّور","Le Mont",49,"at-tur"],[53,"An-Najm","النَّجْم","L’Étoile",62,"an-najm"],[54,"Al-Qamar","الْقَمَر","La Lune",55,"al-qamar"],[55,"Ar-Raḥmān","الرَّحْمَٰن","Le Tout Miséricordieux",78,"ar-rahman"],[56,"Al-Wāqiʿa","الْوَاقِعَة","L’Événement",96,"al-waqia"],[57,"Al-Ḥadid","الْحَدِيد","Le Fer",29,"al-hadid"],[58,"Al-Mujādila","الْمُجَادِلَة","La Discussion",22,"al-mujadala"],[59,"Al-Ḥashr","الْحَشْر","L’Exode",24,"al-hashr"],[60,"Al-Mumtaḥana","الْمُمْتَحَنَة","L’Éprouvée",13,"al-mumtahana"],[61,"Aṣ-Ṣaff","الصَّفّ","Le Rang",14,"as-saff"],[62,"Al-Jumuʿa","الْجُمُعَة","Le Vendredi",11,"al-jumua"],[63,"Al-Munāfiqun","الْمُنَافِقُون","Les Hypocrites",11,"al-munafiqun"],[64,"At-Taghābun","التَّغَابُن","La Grande Perte",18,"at-taghabun"],[65,"Aṭ-Ṭalāq","الطَّلَاق","Le Divorce",12,"at-talaq"],[66,"At-Taḥrim","التَّحْرِيم","L’Interdiction",12,"at-tahrim"],[67,"Al-Mulk","الْمُلْك","La Royauté",30,"al-mulk"],[68,"Al-Qalam","الْقَلَم","La Plume",52,"al-qalam"],[69,"Al-Ḥāqqa","الْحَاقَّة","Celle qui montre la vérité",52,"al-haqqa"],[70,"Al-Maʿārij","الْمَعَارِج","Les Voies d’ascension",44,"al-maarij"],[71,"Nuḥ","نُوح","Noé",28,"nuh"],[72,"Al-Jinn","الْجِنّ","Les Djinns",28,"al-jinn"],[73,"Al-Muzzammil","الْمُزَّمِّل","L’Enveloppé",20,"al-muzzammil"],[74,"Al-Muddaththir","الْمُدَّثِّر","Le Revêtu d’un manteau",56,"al-muddaththir"],[75,"Al-Qiyāma","الْقِيَامَة","La Résurrection",40,"al-qiyama"],[76,"Al-Insān","الْإِنْسَان","L’Homme",31,"al-insan"],[77,"Al-Mursalāt","الْمُرْسَلَات","Les Envoyés",50,"al-mursalat"],[78,"An-Nabaʾ","النَّبَأ","La Nouvelle",40,"an-naba"],[79,"An-Nāziʿāt","النَّازِعَات","Les Anges qui arrachent les âmes",46,"an-naziat"],[80,"ʿAbasa","عَبَسَ","Il s’est renfrogné",42,"abasa"],[81,"At-Takwir","التَّكْوِير","L’Obscurcissement",29,"at-takwir"],[82,"Al-Infiṭār","الِانْفِطَار","La Rupture",19,"al-infitar"],[83,"Al-Muṭaffifin","الْمُطَفِّفِين","Les Fraudeurs",36,"al-mutaffifin"],[84,"Al-Inshiqāq","الِانْشِقَاق","La Déchirure",25,"al-inshiqaq"],[85,"Al-Buruj","الْبُرُوج","Les Constellations",22,"al-buruj"],[86,"Aṭ-Ṭāriq","الطَّارِق","L’Astre nocturne",17,"at-tariq"],[87,"Al-Aʿlā","الْأَعْلَى","Le Très-Haut",19,"al-ala"],[88,"Al-Ghāshiya","الْغَاشِيَة","L’Enveloppante",26,"al-ghashiya"],[89,"Al-Fajr","الْفَجْر","L’Aube",30,"al-fajr"],[90,"Al-Balad","الْبَلَد","La Cité",20,"al-balad"],[91,"Ash-Shams","الشَّمْس","Le Soleil",15,"ash-shams"],[92,"Al-Layl","اللَّيْل","La Nuit",21,"al-layl"],[93,"Aḍ-Ḍuḥā","الضُّحَى","Le Jour montant",11,"ad-duha"],[94,"Ash-Sharḥ","الشَّرْح","L’Épanouissement",8,"ash-sharh"],[95,"At-Tin","التِّين","Le Figuier",8,"at-tin"],[96,"Al-ʿAlaq","الْعَلَق","L’Adhérence",19,"al-alaq"],[97,"Al-Qadr","الْقَدْر","La Destinée",5,"al-qadr"],[98,"Al-Bayyina","الْبَيِّنَة","La Preuve",8,"al-bayyina"],[99,"Az-Zalzala","الزَّلْزَلَة","La Secousse",8,"az-zalzala"],[100,"Al-ʿĀdiyāt","الْعَادِيَات","Les Coursiers",11,"al-adiyat"],[101,"Al-Qāriʿa","الْقَارِعَة","Le Fracas",11,"al-qaria"],[102,"At-Takāthur","التَّكَاثُر","La Course aux richesses",8,"at-takathur"],[103,"Al-ʿAṣr","الْعَصْر","Le Temps",3,"al-asr"],[104,"Al-Humaza","الْهُمَزَة","Les Calomniateurs",9,"al-humaza"],[105,"Al-Fil","الْفِيل","L’Éléphant",5,"al-fil"],[106,"Quraysh","قُرَيْش","",4,"quraysh"],[107,"Al-Māʿun","الْمَاعُون","L’Ustensile",7,"al-maun"],[108,"Al-Kawthar","الْكَوْثَر","L’Abondance",3,"al-kawthar"],[109,"Al-Kāfirun","الْكَافِرُون","Les Infidèles",6,"al-kafirun"],[110,"An-Naṣr","النَّصْر","Le Secours",3,"an-nasr"],[111,"Al-Masad","الْمَسَد","Les Fibres",5,"al-masad"],[112,"Al-Ikhlāṣ","الْإِخْلَاص","Le Monothéisme pur",4,"al-ikhlas"],[113,"Al-Falaq","الْفَلَق","L’Aube naissante",5,"al-falaq"],[114,"An-Nās","النَّاس","Les Hommes",6,"an-nas"]];
var OFF=(function(){ var o=[],a=0; LISTE.forEach(function(s){ o.push(a); a+=s[4]; }); return o; })();
/* les récitateurs dont quran.com donne l'horaire de chaque mot (id chez eux) */
var QF={'ar.abdulbasitmurattal':2,'ar.abdurrahmaansudais':3,'ar.shaatree':4,'ar.hanirifai':5,'ar.husary':6,'ar.alafasy':7,'ar.minshawi':9,'ar.saoodshuraym':10};
var K_MARQUES='alaq_coran_marques', K_DERNIERE='alaq_coran_derniere', K_TRAD='alaq_coran_trad', K_COPIE='alaq_coran_copie';
var CHIFFRES_LIEN='https://www.alaq.fr/coran/';
/* ÉCOUTER SANS CONNEXION (Myriam, 17/11 : « dans le métro… extrêmement pénible » ; préview _apercu-coran-v18.html). Une sourate
   téléchargée pour UNE voix : les fichiers de ses versets (ceux que l'app joue) et l'horaire de ses mots, rangés dans le cache HORS,
   joués depuis le téléphone par une adresse blob: — aucune requête au réseau, donc rien de ce qui coupe Safari sur iPhone (il
   demande le son par morceaux, et sw.js laisse ces requêtes-là au réseau). Gardés 7 JOURS au plus (conditions de Quran
   Foundation ; Myriam : « spécifier que c'est pour une semaine »), renouvelés dès le 6ᵉ jour s'il y a du réseau et que la
   sourate a été écoutée dans la semaine. Voix sans horaire quran.com : everyayah (EA), les MÊMES enregistrements que le flux
   (son décodé comparé le 17/11 : 16 voix identiques au bit près ; ash-Shuraym, même récitation, autre encodage).
   ⚠️ sw.js garde ce cache à l'activation et n'intercepte jamais everyayah. Garde : previews/_verif_coran.html ⑬. */
var HORS='alaq-coran-hors', K_HORS='alaq_coran_hors', SEPT_J=7*864e5, SIX_J=6*864e5;
var EA={'ar.aymanswoaid':'Ayman_Sowaid_64kbps','ar.ibrahimakhbar':'Ibrahim_Akhdar_32kbps','ar.hudhaify':'Hudhaify_128kbps',
  'ar.muhammadayyoub':'Muhammad_Ayyoub_64kbps','ar.alafasy':'Alafasy_128kbps','ar.husary':'Husary_128kbps',
  'ar.shaatree':'Abu_Bakr_Ash-Shaatree_128kbps','ar.abdullahbasfar':'Abdullah_Basfar_192kbps','ar.minshawi':'Minshawy_Murattal_128kbps',
  'ar.abdulbasitmurattal':'Abdul_Basit_Murattal_192kbps','ar.muhammadjibreel':'Muhammad_Jibreel_64kbps','ar.hanirifai':'Hani_Rifai_192kbps',
  'ar.saoodshuraym':'Saood_ash-Shuraym_64kbps','ar.abdurrahmaansudais':'Abdurrahmaan_As-Sudais_192kbps',
  'ar.ahmedajamy':'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net','ar.mahermuaiqly':'Maher_AlMuaiqly_64kbps','ar.husarymujawwad':'Husary_128kbps_Mujawwad'};
/* L'ÉCRITURE DU MUSHAF : le texte uthmani et ses couleurs du tajwīd viennent de api.quran.com (Quran Foundation), lus à la
   source et gardés 7 JOURS au plus dans le cache HORS (leurs conditions : pas de base embarquée) ; hors connexion et sans
   copie récente, l'écriture simple. Leur découpage en mots est le nôtre sur 6 232 versets sur 6 236 (mesuré le 18/11) ; un
   signe seul (pause, ۞) rejoint son mot, et les 4 autres se recollent sur nos mots (aligneMots). La police : KFGQPC Uthmanic
   Hafs v18, embarquée (polices/). ⛔ Leur HTML est une donnée étrangère : seules leurs balises de couleur sont relues, le
   reste est échappé (tjMots). */
var K_ECRITURE='alaq_coran_ecriture', K_ERREURS='alaq_coran_erreurs', K_JOUR='alaq_coran_jour', K_TJ='alaq_coran_tj';
var TJ_CL=/^(ham_wasl|laam_shamsiyah|slnt|idgham_wo_ghunnah|idgham_mutajanisayn|idgham_mutaqaribayn|ghunnah|ikhafa|ikhafa_shafawi|idgham_ghunnah|idgham_shafawi|iqlab|madda_normal|madda_permissible|madda_obligatory|madda_necessary|qalaqah)$/;
var LETTRE=/[ء-يٱ-ۓۺ-ۿ]/, MARQUE=/[ً-ٰٟۖ-ۭ]/, LOURDE=/[خصضغطقظ]/;
/* LA LECTURE COMPTE POUR LA SÉRIE (Myriam, 17/11) : le TEXTE lu, 2 s par mot, une fois par passage, jamais plus vite que la
   montre ; 3 minutes valident le jour (« un disque du parcours c'est environ 3 minutes »). Les graines : celles d'un disque
   (GRAINES.lecon), une fois par jour, déclarées « REV-CORAN » — le serveur ne verse que par leçon et par jour, et son solde
   remplace celui du téléphone : un autre montant serait effacé à la synchro suivante. */
var SEC_MOT=2, SEUIL_JOUR=180, CERCLE=119.4;
var NOTES=['amincir','épaissir','prolonger','ne pas prolonger','ghunna','qalqala','mal prononcé','oublié'];
var CODE_TJ=[['#64655e','Gris','Ne se prononce pas : l’alif de liaison, le lām solaire, l’idghām.'],
  ['#2b6228','Vert','Le son du nez (ghunna), deux temps : ikhfāʾ, idghām avec ghunna, iqlāb.'],
  ['#f77e00','Orange','Prolongation naturelle : deux temps.'],['#e12013','Rouge vif','Prolongation permise : deux, quatre ou six temps.'],
  ['#dd0b70','Rouge-rose','Prolongation obligatoire : quatre ou cinq temps.'],['#610b49','Bordeaux','Prolongation nécessaire : six temps.'],
  ['#006eff','Bleu','Le rebond (qalqala).'],['#1c1c57','Bleu nuit','La lettre lourde (tafkhīm).']];

var SPK='<svg class="cor-ico" viewBox="0 0 26 20"><path class="f" d="M2 7h4l5-4.5v15L6 13H2z"/><path class="f" d="M15 6.2a5 5 0 0 1 0 7.6l-1.2-1.3a3.2 3.2 0 0 0 0-5z"/><path class="f" d="M18 3.4a9 9 0 0 1 0 13.2l-1.2-1.3a7.2 7.2 0 0 0 0-10.6z" opacity=".55"/></svg>';
var RUBAN='<svg class="cor-ico" viewBox="0 0 16 20"><path d="M2 1.5h12v17l-6-4.5-6 4.5z"/></svg>';
var COPIER='<svg class="cor-ico" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>';
var PARTAGER='<svg class="cor-ico" viewBox="0 0 24 24"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8l7.4-4.4M8.3 13.2l7.4 4.4"/></svg>';
var BOUCLE='<svg class="cor-ico" viewBox="0 0 24 24"><path d="M4 11V9a3 3 0 0 1 3-3h12l-3-3M20 13v2a3 3 0 0 1-3 3H5l3 3"/></svg>';
var PLAY='<svg viewBox="0 0 24 24"><path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5z"/></svg>';
var PAUSE='<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';
var STOP='<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';
var PREC='<svg viewBox="0 0 24 24"><path d="M6 6h2.4v12H6zM19 6v12l-9-6z"/></svg>';
var SUIV='<svg viewBox="0 0 24 24"><path d="M15.6 6H18v12h-2.4zM5 6v12l9-6z"/></svg>';
var STYLO='<svg viewBox="0 0 24 24"><path d="M4 20l1.2-4.6L15.5 5.1a2 2 0 0 1 2.8 0l.6.6a2 2 0 0 1 0 2.8L8.6 18.8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M13.5 7l3.5 3.5" stroke="currentColor" stroke-width="2"/></svg>';
var OEIL='<svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2.8" fill="currentColor"/><path d="M4.5 4.5l15 15" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
var LIVRE='<svg viewBox="0 0 24 24" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5C10 5 7 4.5 4 5v13.5c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5z"/><path d="M12 6.5V20"/></svg>';
var LOGO={wa:'<svg viewBox="0 0 24 24"><path d="M12 2.2a9.7 9.7 0 0 0-8.4 14.6L2.3 21.8l5.1-1.3A9.7 9.7 0 1 0 12 2.2zm0 17.6a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.8zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8.9c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3z"/></svg>',
  fb:'<svg viewBox="0 0 24 24"><path d="M13.5 21.5v-7.8h2.6l.4-3h-3V8.8c0-.9.3-1.5 1.5-1.5h1.6V4.6a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6v7.8z"/></svg>',
  x:'<svg viewBox="0 0 24 24"><path d="M17.8 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.9 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"/></svg>',
  plus:'<svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="18" cy="12" r="1.9"/></svg>'};

function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function nomS(n){ return LISTE[n-1][1]; }
function lire(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)); return v==null?d:v; }catch(e){ return d; } }
function ecrire(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
function cap(s){ return String(s).replace(/^(ʿ?)(\S)/,function(m,a,b){ return a+b.toUpperCase(); }); }
function lienVerset(n,k){ return CHIFFRES_LIEN+LISTE[n-1][5]+'/#aya-'+k; }
function qari(){ try{ return qariCur(); }catch(e){ return VOIX[5]; } }
function qariId(){ return qari().id; }

/* ── l'état ── */
var T=null;                       // l'écran (#coran)
var TXT={};                       // les sourates chargées
var SEG={};                       // les horaires, par « récitateur:sourate »
var E={sur:1, mode:'sourate', v:1, de:1, a:3, fois:1, boucle:false, playlist:[]};
var lecture=null;                 // { f:[[sourate,verset]…], i, tour, fois, boucle, pause, a, pl }
var VOIX_A=null, VOIX_FIN=null;   // la voix de la récitation
var MOT_A=null, MOT_EL=null;      // la voix d'un mot : un canal à part
var cible=1;
var CK=null;
var DL=null;                      // le téléchargement en cours : { cle, n, fait, total, fini, err }
var EN_LIGNE={};                  // « Écouter en ligne » choisi pour une sourate, le temps de la séance
var HC_N=0, HC_APRES=null;        // la sourate de la feuille « sans connexion », et ce qui suit son choix
var TEXTE_FAIT=false;
var ECR=null;                     // l'écriture : { m:'simple'|'mushaf', c:1 couleurs du tajwīd }
var TJ={}, TJ_ERR={};             // le mushaf de chaque sourate : par verset, ses mots en HTML (ou null : l'écriture simple)
var ERR=[], ERR_ED=null;          // les erreurs « à revoir » : { id, s, k, j, l lettre, n note } ; celle qu'on écrit
var MEMO=false, CRAYON=false;     // mémoriser (le texte caché) ; le stylo des erreurs
var GEN=0;                        // une seule voix : chaque verset lancé invalide le précédent encore en route
var CPT={dernier:0}, MINUT=null, SES={gain:0};   // le compteur de la lecture du jour ; ce que la séance a gagné
var FLECHE='<svg class="cor-ico" viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>';

function coupeVoix(){ if(VOIX_A){ try{ VOIX_A.pause(); }catch(e){} } VOIX_A=null; var f=VOIX_FIN; VOIX_FIN=null; if(f)f(); }

/* ── les données ── */
function charger(n,suite){
  if(TXT[n])return suite();
  fetch('coran/'+('00'+n).slice(-3)+'-v1.json').then(function(r){ if(!r.ok)throw 0; return r.json(); }).then(function(d){
    TXT[n]={nom:LISTE[n-1][1],ar:LISTE[n-1][2],v:d.v}; suite();
  }).catch(function(){ var c=T&&T.querySelector('.cor-corps'); if(c)c.innerHTML='<div class="cor-vide">Cette sourate demande une connexion la première fois.</div>'; });
}
/* l'horaire de chaque mot et le fichier de verset qu'il décrit : quran.com (public), pour les récitateurs qu'il couvre ;
   Al-Fātiḥa en al-Ḥuṣarī (et les autres voix hébergées) : les fichiers et repères de l'app, sans réseau */
function segments(n,suite){ segmentsDe(qari(),n,suite); }
/* frais : relu à la source, jamais le téléphone (le renouvellement du 6ᵉ jour) */
function segmentsDe(v,n,suite,frais){
  if(n===1&&v.loc&&typeof HOROV!=='undefined'&&HOROV[v.id]){
    var M={}; for(var k=1;k<=7;k++){ var h=HOROV[v.id][String(k)]||[]; M[k]={url:'audios-app-alaq/recit/'+v.id+'/'+k+'.mp3',seg:h.map(function(x,j){ return [j,j+1,+x[0],+x[1]]; })}; }
    return suite(M);
  }
  var id=QF[v.id]; if(!id)return suite(null);
  var cle=id+':'+n; if(SEG[cle]&&!frais)return suite(SEG[cle]);
  var reseau=function(){
    var M2={};
    (function page(p){
      fetch('https://api.quran.com/api/v4/recitations/'+id+'/by_chapter/'+n+'?fields=segments&per_page=50&page='+p).then(function(r){ return r.json(); }).then(function(d){
        (d.audio_files||[]).forEach(function(f){ var u=f.url||''; M2[+f.verse_key.split(':')[1]]={url:u.indexOf('//')===0?'https:'+u:(u.indexOf('http')===0?u:'https://verses.quran.com/'+u),seg:f.segments||[]}; });
        if(d.pagination&&d.pagination.next_page)page(d.pagination.next_page); else { SEG[cle]=M2; suite(M2); }
      }).catch(function(){ suite(null); });
    })(1);
  };
  /* téléchargée : l'horaire du téléphone d'abord (en avion, l'API ne répond pas et les mots ne s'allumeraient plus) */
  if(frais||!horsDe(v,n)||!window.caches)return reseau();
  caches.open(HORS).then(function(c){ return c.match(urlSeg(v,n)); }).then(function(r){ return r?r.json():null; })
    .then(function(M){ if(M){ SEG[cle]=M; suite(M); } else reseau(); },reseau);
}
function urlVerset(n,k){ return qariUrl(qari(),OFF[n-1]+k); }
function urlMot(s,k,j){ var p=function(x){ return ('00'+x).slice(-3); }; return 'https://audio.qurancdn.com/wbw/'+p(s)+'_'+p(k)+'_'+p(j+1)+'.mp3'; }

/* ── écouter sans connexion ── */
function trois(x){ return ('00'+x).slice(-3); }
function cleHors(v,n){ return v.id+'|'+n; }
function metas(){ return lire(K_HORS,{}); }
/* l'entrée d'une sourate téléchargée (même en cours, « partiel ») si elle a moins de 7 jours */
function horsDe(v,n){ var m=metas()[cleHors(v,n)]; return m&&Date.now()-m.t<SEPT_J?m:null; }
function complete(v,n){ var m=horsDe(v,n); return !!(m&&!m.partiel); }
/* le fichier d'un verset tel qu'on le télécharge, et tel qu'on le cherche au moment de jouer : celui que l'app joue */
function urlHors(v,n,k,info){ if(info&&info.url)return info.url; var d=EA[v.id]; return d?'https://everyayah.com/data/'+d+'/'+trois(n)+trois(k)+'.mp3':qariUrl(v,OFF[n-1]+k); }
function urlSeg(v,n){ return 'coran-hors/'+v.id+'/'+trois(n)+'.json'; }   // l'horaire des mots, rangé avec les sons (jamais demandé au réseau)
function taille(v,n){
  var M=SEG[QF[v.id]+':'+n], u=(M&&M[1]&&M[1].url)||EA[v.id]||'', b=/(\d+)\s*kbps/i.exec(u), kb=b?+b[1]:v.kb;
  var mo=LISTE[n-1][4]*v.sec*kb/8/1024;
  return '≈ '+(mo<1?'0,'+Math.max(1,Math.round(mo*10)):Math.round(mo))+' Mo';
}
function ecouteNotee(v,n){ var M=metas(), k=cleHors(v,n); if(M[k]&&Date.now()-(M[k].e||0)>6e4){ M[k].e=Date.now(); ecrire(K_HORS,M); } }
/* la source d'un verset : le fichier du téléphone s'il y est, sinon le réseau comme avant */
function sourceVerset(s,k,info,suite){
  var v=qari(), net=info?info.url:urlVerset(s,k);
  if(!horsDe(v,s)||!window.caches)return suite(net,false);
  caches.open(HORS).then(function(c){ return c.match(urlHors(v,s,k,info)); }).then(function(r){ return r?r.blob():null; })
    .then(function(b){ if(!b)return suite(net,false); ecouteNotee(v,s); suite(URL.createObjectURL(b),true); },function(){ suite(net,false); });
}
/* télécharger une sourate pour une voix ; maj() est rappelé à chaque fichier rangé. frais : le renouvellement — tout est relu à la
   source, et l'entrée d'avant (sa date) n'est remplacée qu'au succès : un renouvellement raté laisse l'effacement du 7ᵉ jour */
function telecharger(v,n,maj,frais){
  var cle=cleHors(v,n), total=LISTE[n-1][4];
  if(DL&&DL.cle===cle&&!DL.fini&&!DL.err)return;
  var D={cle:cle,n:n,fait:0,total:total,fini:false,err:''}; if(!frais)DL=D; maj();
  var rate=function(e){ if(D.fini||D.err)return; D.err=(e&&e.name==='QuotaExceededError')?'Plus assez de place sur ton téléphone.':'Interrompu : connexion. Réessaie.'; maj(); };
  if(!window.caches)return rate();
  segmentsDe(v,n,function(M){
    if(QF[v.id]&&!M)return rate();          // sans l'API, pas l'horaire des mots ni le bon fichier
    var urls=[], i=0, c=null;
    for(var k=1;k<=total;k++)urls.push(urlHors(v,n,k,M&&M[k]));
    if(!frais){ var MM=metas(); MM[cle]={t:Date.now(),e:Date.now(),n:total,u:urls,partiel:1}; ecrire(K_HORS,MM); }   // posée d'abord : un échec en route s'efface aussi au bout de 7 jours
    var ouvrier=function(){
      if(D.err||i>=urls.length)return Promise.resolve();
      var u=urls[i++];
      return (frais?Promise.resolve(null):c.match(u)).then(function(r){ if(r)return; return fetch(u,{cache:'reload'}).then(function(f){ if(!f.ok)throw new Error(String(f.status)); return c.put(u,f); }); })
        .then(function(){ D.fait++; maj(); return ouvrier(); });
    };
    var tj=rangerTJ(n);   // son mushaf avec ses sons : la sourate n'est « sur ton téléphone » qu'avec son écriture (Myriam, 18/11)
    caches.open(HORS).then(function(cc){ c=cc; return M?c.put(urlSeg(v,n),new Response(JSON.stringify(M),{headers:{'Content-Type':'application/json'}})):null; })
      .then(function(){ return Promise.all([ouvrier(),ouvrier(),ouvrier(),ouvrier(),tj]); })
      .then(function(r){ if(D.err)return; if(!r[4])return rate(); var M3=metas(); M3[cle]={t:Date.now(),e:(M3[cle]&&M3[cle].e)||Date.now(),n:total,u:urls}; ecrire(K_HORS,M3); D.fini=true; maj(); marques(); })
      .catch(rate);
  },frais);
}
function effacerHors(cle,m){
  if(!window.caches)return; var p=cle.split('|');
  caches.open(HORS).then(function(c){ (m.u||[]).forEach(function(u){ c.delete(u); }); c.delete(urlSeg({id:p[0]},+p[1])); }).catch(function(){});
}
/* à l'ouverture : 7 jours passés, effacée ; dès le 6ᵉ jour, renouvelée si elle a été écoutée dans la semaine et qu'il y a du réseau */
function entretienHors(){
  var M=metas(), maintenant=Date.now(), change=false;
  Object.keys(M).forEach(function(cle){
    var m=M[cle], age=maintenant-m.t;
    if(age>=SEPT_J){ effacerHors(cle,m); delete M[cle]; change=true; return; }
    if(age>=SIX_J&&!m.partiel&&navigator.onLine!==false&&maintenant-(m.e||0)<SEPT_J){
      var v=VOIX.filter(function(x){ return x.id===cle.split('|')[0]; })[0];
      if(v)telecharger(v,+cle.split('|')[1],function(){},true);   // tout relu à la source, l'horaire aussi
    }
  });
  if(change){ ecrire(K_HORS,M); marques(); }
  /* le mushaf lu chez quran.com : 7 jours au plus, lui aussi */
  var MT=lire(K_TJ,{}), vieux=Object.keys(MT).filter(function(n){ return maintenant-MT[n]>=SEPT_J; });
  if(vieux.length){
    vieux.forEach(function(n){ delete MT[n]; delete TJ[n]; }); ecrire(K_TJ,MT);
    if(window.caches)caches.open(HORS).then(function(c){ vieux.forEach(function(n){ c.delete(urlTj(+n)); }); }).catch(function(){});
  }
  /* une sourate téléchargée sans son mushaf (avant la 266) ou avec un mushaf plus vieux que ses sons : il est rangé, en ligne */
  if(navigator.onLine===false)return;
  var MH=metas(), MT2=lire(K_TJ,{}), afaire=[];
  Object.keys(MH).forEach(function(cle){ var m=MH[cle], n=+cle.split('|')[1];
    if(!m.partiel&&afaire.indexOf(n)<0&&(!MT2[n]||m.t-MT2[n]>36e5))afaire.push(n); });
  (function suite(){ if(afaire.length)rangerTJ(afaire.shift()).then(suite); })();
}
/* les marques : le bouton du récitateur (cette sourate est sur le téléphone pour CETTE voix) et les lignes de la liste */
function marques(){
  if(!T)return; var v=qari(), M=metas(), ici=function(n){ var m=M[cleHors(v,n)]; return m&&!m.partiel&&Date.now()-m.t<SEPT_J?m:null; };
  var li=T.querySelector('.cor-li'); if(li)li.classList.toggle('hc-ici',!!ici(E.sur));
  T.querySelectorAll('.cor-liste .cor-srow').forEach(function(r){
    var m=ici(+r.dataset.s), s=r.querySelector('.hc-marque');
    if(!m){ if(s)s.remove(); return; }
    if(!s){ r.insertAdjacentHTML('beforeend','<span class="hc-marque" aria-label="Sur le téléphone">'+FLECHE+'<b></b></span>'); s=r.querySelector('.hc-marque'); }
    s.querySelector('b').textContent=Math.max(1,Math.ceil((m.t+SEPT_J-Date.now())/864e5))+' j';
  });
}
/* la question au ▶ : « Écouter sans connexion » — sauf déjà là, déjà répondu « en ligne », hors ligne, ou une playlist */
function demanderHors(){ var v=qari(); return E.mode!=='playlist'&&!!window.caches&&navigator.onLine!==false&&!complete(v,E.sur)&&!EN_LIGNE[cleHors(v,E.sur)]; }
function ouvreHors(apres){ HC_N=E.sur; HC_APRES=apres; peindreHors(); ouvreFeuille('hors'); segments(HC_N,function(){ if(T.classList.contains('f-hors'))peindreHors(); }); }
function peindreHors(){
  var z=T.querySelector('.cor-hc'); if(!z||!HC_N)return;
  var n=HC_N, v=qari(), x=LISTE[n-1][4], cle=cleHors(v,n), d=DL&&DL.cle===cle?DL:null;
  var h='<p class="hc-sour">'+esc(nomS(n))+'<span class="ar">'+LISTE[n-1][2]+'</span></p>'+
    '<p class="hc-det">'+x+' verset'+(x>1?'s':'')+' · '+esc(cap(v.fr))+' · '+taille(v,n)+'</p>'+
    '<p class="hc-note">Gardée 7 jours sur ton téléphone.</p>';
  if(d&&!d.fini&&!d.err)h+='<div class="hc-barre"><i style="width:'+Math.round(100*d.fait/d.total)+'%"></i></div><p class="hc-n">'+d.fait+' / '+d.total+'</p><button class="cor-grandbtn" data-a="hc-ecouter">ÉCOUTER</button>';
  else if(complete(v,n))h+='<p class="hc-n">Sur ton téléphone ✓</p><button class="cor-grandbtn" data-a="hc-ecouter">ÉCOUTER</button>';
  else h+=(d&&d.err?'<p class="hc-n hc-err">'+esc(d.err)+'</p>':'')+'<button class="cor-grandbtn" data-a="hc-dl">TÉLÉCHARGER</button><button class="hc-sec" data-a="hc-ligne">Écouter en ligne</button>';
  z.innerHTML=h;
}
function apresHors(){ var f=HC_APRES; HC_APRES=null; fermeFeuilles(); if(f)f(); }
/* le texte des 114 sourates, tout seul, une fois par séance (sw.js le garde : lisible en avion) — Myriam : « ce devrait être automatique » */
function texteAuto(){
  if(TEXTE_FAIT||navigator.onLine===false)return; TEXTE_FAIT=true; var i=0;
  (function suite(){ if(i>=LISTE.length)return; fetch(urlSourate(LISTE[i++][0])).then(function(r){ if(!r.ok)throw 0; return r.text(); }).then(function(){ setTimeout(suite,40); },function(){ TEXTE_FAIT=false; }); })();
}

/* ── l'écriture du mushaf ── */
/* le HTML tajwīd d'un verset, coupé en mots : une couleur à cheval sur deux mots est fermée avant l'espace et rouverte après ;
   les lettres lourdes hors de toute couleur prennent la leur (tafkhīm) ; un signe seul rejoint son mot */
function tjMots(h){
  h=signesDuMushaf(h);
  var re=/<tajweed class=([a-z_]+)>|<\/tajweed>|<span class=end>[^<]*<\/span>|<[^>]*>|([^<]+)/g, m, pile=[], mots=[], cur=null, taf=false;
  var ouvre=function(c){ return '<span class="tj tj-'+c+'">'; }, ouvertes=function(){ return pile.filter(Boolean); };
  var neuf=function(){ cur={h:ouvertes().map(ouvre).join(''),t:''}; mots.push(cur); };
  var fermeTaf=function(){ if(taf){ cur.h+='</span>'; taf=false; } };
  neuf();
  while((m=re.exec(h))){
    if(m[1]!==undefined){ fermeTaf(); var c=TJ_CL.test(m[1])?m[1]:''; pile.push(c); if(c)cur.h+=ouvre(c); continue; }
    if(m[0]==='</tajweed>'){ fermeTaf(); if(pile.pop())cur.h+='</span>'; continue; }
    if(m[2]===undefined)continue;                         // une autre balise, le numéro de fin : ignorés
    for(var i=0;i<m[2].length;i++){ var ch=m[2][i];
      if(ch===' '){ fermeTaf(); cur.h+=ouvertes().map(function(){ return '</span>'; }).join(''); neuf(); continue; }
      if(taf&&!MARQUE.test(ch))fermeTaf();
      if(!taf&&LOURDE.test(ch)&&!ouvertes().length){ cur.h+=ouvre('tafkhim'); taf=true; }
      cur.h+=esc(ch); cur.t+=ch;
    }
  }
  fermeTaf(); cur.h+=ouvertes().map(function(){ return '</span>'; }).join('');
  mots.forEach(function(w){ if(w.t.indexOf(PETIT_ALIF)<0)return; w.h=souder(w.h).split(PETIT_ALIF).join(ALIF_SUSCRIT); w.t=w.t.split(PETIT_ALIF).join(ALIF_SUSCRIT); });
  var out=[], avant='';
  mots.forEach(function(w){
    if(!w.t.trim())return;
    if(LETTRE.test(w.t)){ out.push(avant?avant+' '+w.h:w.h); avant=''; }
    else if(out.length)out[out.length-1]+=' '+w.h; else avant=avant?avant+' '+w.h:w.h;
  });
  return out;
}
/* ⛔ QUATRE SIGNES DU TAJWĪD DE QURAN.COM QUE LA POLICE DU MUSHAF PEINT SUR UN ROND POINTILLÉ ◌ (Myriam, 20/11 ; mesuré le 23/11 :
   leur texte n'écrit pas ces signes comme le mushaf de Médine). On les écrit comme le texte du Complexe du roi Fahd (qpc_hafs),
   que la police dessine bien : U+06DF → U+06E0 (l'alif muet de أَنَا۠ et de قَوَارِيرَا۠ : 66 fois) ; U+06EB → U+06EC (l'ishmām de
   تَأْمَ۬نَّا, 12:11) ; U+06E3 → U+06DC (le sīn de ٱلْمُصَۜيْطِرُونَ, 52:37). Et 32:3 : une balise ouverte cassée laisse un « > » et un
   U+066E à la place du ى de ٱفْتَرَىٰهُ. Balayé en passant les 77 645 mots du Coran dans la police : il n'y a pas d'autre cas.
   (journal : coran.js · le zéro rond sur un rond pointillé) */
var SIGNES_MUSHAF=[['۟','۠'],['۫','۬'],['ۣ','ۜ'],['>ٮٰ','ىٰ']];
function signesDuMushaf(h){ SIGNES_MUSHAF.forEach(function(p){ h=h.split(p[0]).join(p[1]); }); return h; }
/* ⛔ LE PETIT ALIF ٲ (U+0672) DE QURAN.COM S'ÉCRIT ٰ (U+0670) (Myriam, 18/11 : ذَٰلِكَ, ٱلصَّلَوٰةَ sur un rond pointillé ◌, iPhone ET
   Mac). Après une lettre qui ne se lie pas (و ذ ر…), leur texte tajwīd met ٲ, que la police du mushaf dessine AVEC un rond
   pointillé, et dans un autre <span> que sa lettre (145 fois dans Al-Baqara). On écrit l'alif suscrit ٰ de l'écriture simple, et
   la lettre et ses signes passent dans le morceau du petit alif : un seul morceau, la couleur de la prolongation. */
var PETIT_ALIF='ٲ', ALIF_SUSCRIT='ٰ';
function souder(h){
  var re=/<span class="tj tj-([a-z_]+)">|<\/span>|(&[a-z#0-9]+;|[\s\S])/g, m, pile=[], car=[];
  while((m=re.exec(h))){
    if(m[1]!==undefined){ pile.push(m[1]); continue; }
    if(m[0]==='</span>'){ pile.pop(); continue; }
    car.push({c:m[2],p:pile.slice()});
  }
  car.forEach(function(x,i){
    if(x.c!==PETIT_ALIF)return;
    for(var b=i-1;b>=0&&MARQUE.test(car[b].c);b--)car[b].p=x.p;   // ses signes…
    if(b>=0&&LETTRE.test(car[b].c))car[b].p=x.p;                  // …et sa lettre
  });
  var out='', ouv=[];
  car.forEach(function(x){
    if(x.p.join(' ')!==ouv.join(' ')){ out+=ouv.map(function(){ return '</span>'; }).join('')+x.p.map(function(c){ return '<span class="tj tj-'+c+'">'; }).join(''); ouv=x.p; }
    out+=x.c;
  });
  return out+ouv.map(function(){ return '</span>'; }).join('');
}
/* leurs mots sur les nôtres (la bulle et la voix d'un mot en dépendent) ; null : ce verset garde l'écriture simple */
function aligneMots(tj,nous){
  if(tj.length===nous.length)return tj;
  var out=[], i=0;
  for(var j=0;j<nous.length;j++){
    var n=nous[j].split(' ').filter(function(x){ return LETTRE.test(x); }).length||1;
    if(i+n>tj.length)return null; out.push(tj.slice(i,i+n).join(' ')); i+=n;
  }
  return i===tj.length?out:null;
}
function lireTJ(n,tx){
  try{ var vs=JSON.parse(tx).verses, nous=TXT[n].v; if(!vs||vs.length!==nous.length)return null;
    return vs.map(function(v,i){ return aligneMots(tjMots(String(v.text_uthmani_tajweed||'')),nous[i][0]); });
  }catch(e){ return null; }
}
function urlTj(n){ return 'coran-hors/tj/'+trois(n)+'.json'; }   // rangé avec les sons téléchargés, jamais demandé au réseau
var TJ_API='https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?chapter_number=';
/* le mushaf d'une sourate rangé sur le téléphone et daté (7 jours), sans rien peindre : avec ses sons, ou pour une sourate
   téléchargée sans lui. Rend vrai une fois la copie rangée. */
function rangerTJ(n){
  if(!window.caches)return Promise.resolve(false);
  var tx='';
  return fetch(TJ_API+n).then(function(r){ if(!r.ok)throw 0; return r.text(); }).then(function(t){
    var vs=JSON.parse(t).verses; if(!vs||vs.length!==LISTE[n-1][4])throw 0; tx=t; return caches.open(HORS);
  }).then(function(c){ return c.put(urlTj(n),new Response(tx,{headers:{'Content-Type':'application/json'}})); })
    .then(function(){ var M=lire(K_TJ,{}); M[n]=Date.now(); ecrire(K_TJ,M); delete TJ_ERR[n]; return true; })
    .catch(function(){ return false; });
}
function chargerTJ(n,suite){
  if(TJ[n])return suite(TJ[n]);
  var fini=false, rend=function(d){ if(fini)return; fini=true; if(d)TJ[n]=d; suite(d||null); };
  var reseau=function(){
    var to=setTimeout(function(){ rend(null); },6000);
    fetch(TJ_API+n).then(function(r){ if(!r.ok)throw 0; return r.text(); }).then(function(tx){
      clearTimeout(to); var d=lireTJ(n,tx); if(!d)return rend(null);
      if(window.caches)caches.open(HORS).then(function(c){ return c.put(urlTj(n),new Response(tx,{headers:{'Content-Type':'application/json'}})); })
        .then(function(){ var M=lire(K_TJ,{}); M[n]=Date.now(); ecrire(K_TJ,M); }).catch(function(){});
      rend(d);
    }).catch(function(){ clearTimeout(to); rend(null); });
  };
  var t=lire(K_TJ,{})[n];
  if(!t||Date.now()-t>=SEPT_J||!window.caches)return reseau();
  caches.open(HORS).then(function(c){ return c.match(urlTj(n)); }).then(function(r){ return r?r.text():null; })
    .then(function(tx){ var d=tx&&lireTJ(n,tx); if(d)rend(d); else reseau(); },reseau);
}
/* le texte de la sourate, et son mushaf si c'est l'écriture choisie (sans connexion ni copie : l'écriture simple, dite une fois).
   Un réseau lent n'immobilise jamais l'écran : à 1,5 s la sourate s'ouvre en écriture simple, et son mushaf la repeint à son arrivée. */
function preparer(n,suite){
  charger(n,function(){
    if(ECR.m!=='mushaf')return suite();
    var fait=false, tard=setTimeout(function(){ if(!fait){ fait=true; suite(); } },1500);
    chargerTJ(n,function(d){
      if(!d&&!TJ_ERR[n]){ TJ_ERR[n]=1; try{ toast('L’écriture du mushaf demande une connexion'); }catch(e){} }
      if(!fait){ fait=true; clearTimeout(tard); return suite(); }
      if(d&&E.sur===n&&ECR.m==='mushaf'&&T&&!T.querySelector('.cor-lect').hidden)repeindre();
    });
  });
}

/* ═══ l'écran ═══ */
function monte(){
  if(T)return;
  T=document.createElement('div'); T.id='coran'; T.className='coran-plein';
  T.innerHTML=
    '<div class="cor-vue cor-liste"></div>'+
    '<div class="cor-vue cor-lect" hidden>'+
      '<div class="cor-tete"><button class="cor-x" data-a="fermer" aria-label="Fermer le Coran">✕</button>'+
        '<button class="cor-sour" data-a="moins" aria-label="Sourate précédente">'+PREC+'</button><button class="cor-titre" data-a="sourates"></button>'+
        '<button class="cor-sour" data-a="plus" aria-label="Sourate suivante">'+SUIV+'</button>'+
        '<button class="cor-mp" data-a="marques" aria-label="Marque-pages">'+RUBAN+'</button></div>'+
      '<div class="cor-ctrl"><button class="cor-li" data-a="qari"><span class="cor-hcm" aria-label="Sur le téléphone">'+FLECHE+'</span><b class="cor-q1"></b></button>'+
        '<button class="cor-jouer" data-a="jouer" aria-label="Écouter">'+PLAY+'</button><button class="cor-stop" data-a="stop" aria-label="Arrêter">'+STOP+'</button>'+
        '<button class="cor-rep" data-a="ecoute" aria-label="Réglages de l’écoute">'+BOUCLE+'<span class="cor-repn">×1</span></button>'+
        '<div class="cor-serie" role="img" aria-label="La lecture du jour"><svg viewBox="0 0 44 44"><circle class="fd" cx="22" cy="22" r="19"/><circle class="av" cx="22" cy="22" r="19"/></svg>'+icoImg('tb-epi')+'</div></div>'+
      '<div class="cor-outils"><button class="cor-coche on" data-a="trad" aria-pressed="true"><span class="cor-bx">✓</span>Traduction</button>'+
        '<div class="cor-outd"><button class="cor-ob cor-memo" data-a="memo" aria-pressed="false" aria-label="Mémoriser : cacher le texte">'+OEIL+'</button>'+
        '<button class="cor-aa" data-a="ecriture" aria-label="L’écriture du Coran"><i></i><i></i><i></i>Aa</button>'+
        '<button class="cor-ob cor-stylo" data-a="stylo" aria-pressed="false" aria-label="Marquer une erreur">'+STYLO+'</button></div></div>'+
      '<div class="cor-zone"><div class="cor-corps"></div><div class="cor-rail"><div class="cor-piste"></div><div class="cor-pouce"><span class="cor-etiq"></span></div></div></div>'+
    '</div>'+
    '<div class="cor-bulle" role="tooltip"><i></i><span></span></div>'+
    '<div class="cor-voile" data-a="ferme"></div>'+
    feuilles();
  document.body.appendChild(T);
  T.addEventListener('click',clic);
  T.addEventListener('change',change);
  T.addEventListener('input',saisie);
  var corps=T.querySelector('.cor-corps');
  /* AVANT la bulle (phase de capture) : la ligne « à revoir » se modifie ; en mémorisation, un toucher sur un verset montre le mot
     suivant (au clic) et n'ouvre pas la bulle ; le stylo levé, un mot touché ouvre la feuille de l'erreur */
  corps.addEventListener('pointerdown',function(e){
    var l=e.target.closest('.rv-ligne');
    if(l){ e.stopPropagation(); e.preventDefault(); ouvreErreur(null,l.dataset.e); return; }
    if(MEMO&&!e.target.closest('button')&&e.target.closest('.cor-carte')){ e.stopPropagation(); return; }
    var w=e.target.closest('.cor-mot'); if(!w||!CRAYON)return;
    e.stopPropagation(); e.preventDefault(); crayon(false); ouvreErreur(w,null);
  },true);
  corps.addEventListener('click',function(e){
    if(!MEMO||e.target.closest('button, .rv-ligne'))return;
    var c=e.target.closest('.cor-carte'); if(!c)return; e.stopPropagation(); toucherMemo(c);
  },true);
  corps.addEventListener('pointerdown',function(e){ var m=e.target.closest('.cor-mot'); if(!m)return; montreBulle(m); joueMot(+m.dataset.k,+m.dataset.j,m); });
  corps.addEventListener('pointerup',function(e){ if(e.pointerType==='mouse')cacheBulle(); else cacheBulleBientot(); });
  corps.addEventListener('pointercancel',cacheBulle);   /* le doigt part en défilement : rien à montrer */
  corps.addEventListener('pointerover',function(e){ if(e.pointerType!=='mouse')return; var m=e.target.closest('.cor-mot'); if(m)montreBulle(m); });
  corps.addEventListener('pointerout',function(e){ if(e.pointerType==='mouse'&&e.target.closest('.cor-mot'))cacheBulle(); });
  corps.addEventListener('scroll',function(){ cacheBulle(); majRail(); clearTimeout(corps._d); corps._d=setTimeout(noteDerniere,400); });
  corps.addEventListener('contextmenu',function(e){ e.preventDefault(); });
  var pouce=T.querySelector('.cor-pouce'), rail=T.querySelector('.cor-rail');
  pouce.addEventListener('pointerdown',function(e){
    e.preventDefault(); pouce.setPointerCapture(e.pointerId); rail.classList.add('tient');
    var y0=e.clientY, s0=corps.scrollTop, h=rail.clientHeight-pouce.offsetHeight, max=corps.scrollHeight-corps.clientHeight;
    function bouge(ev){ corps.scrollTop=s0+(ev.clientY-y0)*max/Math.max(1,h); }
    function lache(){ rail.classList.remove('tient'); pouce.removeEventListener('pointermove',bouge); pouce.removeEventListener('pointerup',lache); }
    pouce.addEventListener('pointermove',bouge); pouce.addEventListener('pointerup',lache);
  });
  T.querySelector('.cor-piste').addEventListener('pointerdown',function(e){ var r=rail.getBoundingClientRect(); corps.scrollTop=(e.clientY-r.top)/r.height*(corps.scrollHeight-corps.clientHeight); });
  CK=lire(K_COPIE,null)||{ar:1,tr:1,ref:1,lien:1};
  E.playlist=[112,113,114];
}
function feuilles(){
  return '<div class="cor-feuille fa"><h3>L’écriture du Coran<button data-a="ferme" aria-label="Fermer">✕</button></h3>'+
      '<button class="cor-opt" data-ecr="simple"><b>Simple</b><small>Pour commencer à lire</small><span class="ex" lang="ar" dir="rtl">إِذَا السَّمَاءُ انفَطَرَتْ</span></button>'+
      '<button class="cor-opt" data-ecr="mushaf"><b>Mushaf de Médine</b><small>Avec les signes du tajwīd</small><span class="ex h" lang="ar" dir="rtl">إِذَا ٱلسَّمَآءُ ٱنفَطَرَتْ</span></button>'+
      '<button class="cor-sw" data-a="couleurs"><span>Couleurs du tajwīd</span><i></i></button><button class="cor-lien2" data-a="code">Le code couleur ›</button></div>'+
    '<div class="cor-feuille fk"><h3>Le code couleur du tajwīd<button data-a="ferme-code" aria-label="Fermer">✕</button></h3><div class="cor-code">'+
      CODE_TJ.map(function(c){ return '<i style="background:'+c[0]+'"></i><div><b>'+c[1]+'</b><span>'+c[2]+'</span></div>'; }).join('')+'</div></div>'+
    '<div class="cor-feuille fz"><h3>À revoir<button data-a="ferme" aria-label="Fermer">✕</button></h3><div class="cor-er"></div></div>'+
    '<div class="cor-feuille fh"><h3>Écouter sans connexion<button data-a="ferme" aria-label="Fermer">✕</button></h3><div class="cor-hc"></div></div>'+
    '<div class="cor-feuille fe"><h3>Écouter<button data-a="ferme" aria-label="Fermer">✕</button></h3>'+
      '<div class="cor-seg"><button data-m="verset">Un<br>verset</button><button data-m="versets">Des<br>versets</button><button data-m="sourate">La<br>sourate</button><button data-m="playlist">Une<br>playlist</button></div>'+
      '<div class="cor-panneau"></div><div class="cor-sep"></div>'+
      '<div class="cor-ligne"><span>Répéter</span><span class="cor-pas" data-k="fois"><button data-d="-1" aria-label="Moins">−</button><input type="number" inputmode="numeric" min="1" max="100"><button data-d="1" aria-label="Plus">+</button></span></div>'+
      '<div class="cor-ligne"><button class="cor-bascule bcl" data-a="boucle"><span class="cor-tg"><i></i></span>En boucle</button></div>'+
      '<button class="cor-grandbtn" data-a="ecouter">ÉCOUTER</button></div>'+
    '<div class="cor-feuille fm"><h3>Marque-pages<button data-a="ferme" aria-label="Fermer">✕</button></h3><div class="cor-lm"></div></div>'+
    '<div class="cor-feuille fs"><h3>Sourate<button data-a="ferme" aria-label="Fermer">✕</button></h3><input class="cor-cherche2" placeholder="Chercher une sourate" aria-label="Chercher une sourate"><div class="cor-ls">'+listeLignes('mrow')+'</div></div>'+
    '<div class="cor-feuille fq"><h3>Récitateur<button data-a="ferme" aria-label="Fermer">✕</button></h3><div class="cor-lq"></div></div>'+
    '<div class="cor-feuille fc"><h3>Copier le verset<button data-a="ferme" aria-label="Fermer">✕</button></h3><div class="cor-cases">'+
      '<label><input type="checkbox" data-c="ar">L’arabe</label><label><input type="checkbox" data-c="tr">La traduction</label>'+
      '<label><input type="checkbox" data-c="ref">La sourate et le verset</label><label><input type="checkbox" data-c="lien">Le lien alaq.fr</label></div>'+
      '<div class="cor-apercu"></div><button class="cor-grandbtn" data-a="copier-go">COPIER</button></div>'+
    '<div class="cor-feuille fp"><h3>Partager le verset<button data-a="ferme" aria-label="Fermer">✕</button></h3>'+
      '<div class="cor-hadith"><div class="ha">بَلِّغُوا عَنِّي وَلَوْ آيَةً</div><div class="hf">« Transmettez de ma part, même un verset. »</div><small>Le Prophète ﷺ — Ṣaḥīḥ al-Bukhārī, n° 3461</small></div>'+
      '<div class="cor-lien"><span class="cor-lien-u"></span><button data-a="lien-c">COPIER LE LIEN</button></div>'+
      '<div class="cor-reseaux"><button data-r="wa"><span class="rond">'+LOGO.wa+'</span>WhatsApp</button><button data-r="fb"><span class="rond">'+LOGO.fb+'</span>Facebook</button><button data-r="x"><span class="rond">'+LOGO.x+'</span>X</button><button data-r="plus"><span class="rond">'+LOGO.plus+'</span>Plus</button></div></div>';
}
function listeLignes(cls){
  return LISTE.map(function(x){
    return '<button class="cor-'+cls+'" data-s="'+x[0]+'"><span class="cor-no">'+x[0]+'</span><span class="cor-tx"><span class="cor-l1"><b>'+esc(x[1])+'</b><span class="cor-sa">'+x[2]+'</span></span><small>'+esc(x[3])+' · '+x[4]+' versets</small></span></button>';
  }).join('');
}

/* ── la liste des 114 ── */
function montreListe(){
  var d=lire(K_DERNIERE,null), h='<div class="cor-tete"><button class="cor-x" data-a="fermer" aria-label="Fermer">✕</button><span class="cor-titre fixe">Le Coran</span><button class="cor-mp" data-a="marques-liste" aria-label="Marque-pages">'+RUBAN+'</button></div>'+
    '<div class="cor-scroll"><input class="cor-cherche2" placeholder="Chercher une sourate" aria-label="Chercher une sourate">'+
    (d&&LISTE[d.s-1]?'<button class="cor-reprendre" data-s="'+d.s+'" data-k="'+d.k+'"><span class="cor-ico2">'+PLAY.replace('<svg','<svg width="18" height="18" fill="currentColor"')+'</span><span>Reprendre<small>'+esc(nomS(d.s))+' · verset '+d.k+'</small></span></button>':'')+
    '<div class="cor-ls">'+listeLignes('srow')+'</div>'+credit()+'</div>';
  T.querySelector('.cor-liste').innerHTML=h; marques();
  T.querySelector('.cor-liste').hidden=false; T.querySelector('.cor-lect').hidden=true;
}
/* le texte des 114 sourates en mémoire de l'appareil (sw.js le garde dès qu'il est lu) : lisible en avion. La récitation, elle, demande une connexion. */
function urlSourate(n){ return 'coran/'+('00'+n).slice(-3)+'-v1.json'; }
function credit(){ return '<p class="cor-credit">Texte arabe : Tanzil · Traduction du sens : Rachid Maach (QuranEnc) · Mot à mot : Alaq · Voix des mots : Quran data provided by Quran.Foundation</p>'; }

/* ── le lecteur ── */
function montreLecteur(n,k){
  preparer(n,function(){
    E.sur=n; T.querySelector('.cor-liste').hidden=true; T.querySelector('.cor-lect').hidden=false;
    var trad=lire(K_TRAD,true); T.classList.toggle('sans-trad',!trad);
    var c=T.querySelector('.cor-coche'); c.classList.toggle('on',!!trad); c.setAttribute('aria-pressed',trad?'true':'false'); c.querySelector('.cor-bx').textContent=trad?'✓':'';
    peindre(); marques(); anneau(); CPT.dernier=Date.now(); if(k)aller(n,k);
  });
}
function peindre(){
  var t=TXT[E.sur], M=lire(K_MARQUES,[]), tj=(ECR.m==='mushaf'&&TJ[E.sur])||null;
  T.classList.toggle('cor-mushaf',!!tj);
  T.querySelector('.cor-lect .cor-titre').innerHTML='<span class="cor-num">'+E.sur+'</span><span class="nm">'+esc(t.nom)+'</span><span class="a">'+t.ar+'</span><span class="car">▾</span>';
  T.querySelector('.cor-corps').innerHTML=t.v.map(function(v,i){ var k=i+1, mq=M.some(function(m){ return m[0]===E.sur&&m[1]===k; });
    return '<div class="cor-carte" data-k="'+k+'"><div class="cor-ch"><span class="cor-n">VERSET '+k+'</span>'+
      '<button class="mq'+(mq?' on':'')+'" data-a="mq" data-k="'+k+'" aria-label="Marque-page, verset '+k+'">'+RUBAN+'</button>'+
      '<button data-a="cp" data-k="'+k+'" aria-label="Copier le verset '+k+'">'+COPIER+'</button>'+
      '<button data-a="pt" data-k="'+k+'" aria-label="Partager le verset '+k+'">'+PARTAGER+'</button>'+
      '<button data-a="vj" data-k="'+k+'" aria-label="Écouter le verset '+k+'">'+SPK+'</button></div>'+
      '<div class="cor-ct" lang="ar" dir="rtl">'+((tj&&tj[i])||v[0].map(esc)).map(function(w,j){ return '<span class="cor-mot" data-k="'+k+'" data-j="'+j+'">'+w+'</span>'; }).join(' ')+'</div>'+
      '<div class="cor-tr">'+esc(v[2])+'</div></div>'; }).join('')+credit();
  T.querySelector('.cor-corps').scrollTop=0; peindreErreurs(); majRail(); etiquette();
}
/* repeint la sourate (une autre écriture) sans perdre sa place ni le verset récité */
function repeindre(){
  var k=premierVisible(); peindre(); aller(E.sur,k);
  var it=lecture&&lecture.f[lecture.i];
  if(it&&it[0]===E.sur){ var c=T.querySelector('.cor-carte[data-k="'+it[1]+'"]'); if(c)c.classList.add('joue'); }
}
function etiquette(){
  var v=qari();
  T.querySelector('.cor-q1').innerHTML=esc(cap(v.fr)+(v.st==='j'?' · mujawwad':''))+'<span class="car">▾</span>';
  T.querySelector('.cor-repn').textContent=E.boucle?'boucle':'×'+E.fois;
}

/* ── l'écriture : le choix, les couleurs, le code couleur ── */
function peindreEcriture(){
  T.querySelectorAll('.cor-opt').forEach(function(o){ o.classList.toggle('on',o.dataset.ecr===ECR.m); });
  var sw=T.querySelector('.cor-sw'); sw.classList.toggle('on',!!ECR.c); sw.classList.toggle('off',ECR.m!=='mushaf');
}
function choisirEcriture(m){
  ECR.m=m; ecrire(K_ECRITURE,ECR); peindreEcriture();
  if(!TXT[E.sur]||T.querySelector('.cor-lect').hidden)return;
  preparer(E.sur,repeindre);
}

/* ── les erreurs « à revoir » : choisies au stylo, surlignées sur la lettre, modifiables et supprimables ── */
function crayon(on){
  CRAYON=!!on; var b=T&&T.querySelector('.cor-stylo'); if(!b)return;
  b.classList.toggle('on',CRAYON); b.setAttribute('aria-pressed',CRAYON?'true':'false'); T.classList.toggle('cor-crayonne',CRAYON);
}
var EQUIV={'ا':'ٱ','ٱ':'ا','ي':'ى','ى':'ي'};   // une lettre notée dans une écriture, retrouvée dans l'autre
/* surligne la DERNIÈRE occurrence de la lettre (et ses signes) dans le mot, à travers les couleurs du tajwīd */
function surligner(mot,l){
  [l,EQUIV[l]].some(function(x){
    if(!x)return false;
    var tw=document.createTreeWalker(mot,4), n, ns=[]; while((n=tw.nextNode()))ns.push(n);
    for(var a=ns.length-1;a>=0;a--){
      var t=ns[a], i=t.nodeValue.lastIndexOf(x); if(i<0)continue;
      var j=i+1; while(j<t.nodeValue.length&&(MARQUE.test(t.nodeValue[j])||t.nodeValue[j]===PETIT_ALIF))j++;   // jamais un ٲ coupé de sa lettre
      var mi=t.splitText(i); mi.splitText(j-i);
      var s=document.createElement('span'); s.className='rv-l'; mi.parentNode.insertBefore(s,mi); s.appendChild(mi);
      return true;
    }
    return false;
  });
}
function peindreErreurs(){
  if(!T)return;
  T.querySelectorAll('.rv-l').forEach(function(s){ var p=s.parentNode; while(s.firstChild)p.insertBefore(s.firstChild,s); p.removeChild(s); p.normalize(); });
  T.querySelectorAll('.rv-ligne').forEach(function(x){ x.remove(); });
  T.querySelectorAll('.rv-carte').forEach(function(c){ c.classList.remove('rv-carte'); });
  T.querySelectorAll('.rv-mot').forEach(function(c){ c.classList.remove('rv-mot'); });
  ERR.forEach(function(e){
    if(e.s!==E.sur)return;
    var c=T.querySelector('.cor-carte[data-k="'+e.k+'"]'), m=c&&c.querySelector('.cor-mot[data-j="'+e.j+'"]'); if(!m)return;
    if(e.m)m.classList.add('rv-mot'); else surligner(m,e.l);
    c.classList.add('rv-carte');
    c.insertAdjacentHTML('beforeend','<div class="rv-ligne" data-e="'+esc(e.id)+'"><b>À revoir</b><span class="ar" lang="ar" dir="rtl">'+esc(m.textContent)+'</span>'+
      '<span>'+esc(e.n)+(e.m?'':' <span class="ar" lang="ar">'+esc(e.l)+'</span>')+'</span><span class="ed" aria-label="Modifier">'+STYLO+'</span></div>');
  });
}
function ouvreErreur(mot,id){
  var e=id?ERR.filter(function(x){ return x.id===id; })[0]:null;
  if(e)mot=T.querySelector('.cor-carte[data-k="'+e.k+'"] .cor-mot[data-j="'+e.j+'"]');
  if(!mot)return;
  var t=mot.textContent, ls=[];
  for(var i=0;i<t.length;i++)if(LETTRE.test(t[i])&&ls.indexOf(t[i])<0)ls.push(t[i]);
  if(!ls.length)return;
  ERR_ED={e:e,k:+mot.dataset.k,j:+mot.dataset.j,t:t,m:!!(e&&e.m),l:e&&!e.m&&ls.indexOf(e.l)>=0?e.l:ls[ls.length-1],n:e?e.n:''};
  /* « Une lettre » ou « Tout le mot » (Myriam, 18/11, choix C de _apercu-coran-v19) : le mot entier cache les lettres */
  T.querySelector('.cor-er').innerHTML='<p class="cor-motgd" lang="ar" dir="rtl"></p>'+
    '<div class="cor-tm"><button data-tm="lettre">Une lettre</button><button data-tm="mot">Tout le mot</button></div>'+
    '<div class="cor-lettres" dir="rtl">'+ls.map(function(x){ return '<button data-l="'+esc(x)+'">'+esc(x)+'</button>'; }).join('')+'</div>'+
    '<div class="cor-notes">'+NOTES.map(function(x){ return '<button data-n="'+esc(x)+'">'+esc(x)+'</button>'; }).join('')+'</div>'+
    '<div class="cor-act">'+(e?'<button class="cor-suppr" data-a="err-x">Je ne fais plus cette erreur</button>':'')+'<button class="cor-ok" data-a="err-ok">'+(e?'Enregistrer':'Marquer')+'</button></div>';
  peindreChoixErreur(); ouvreFeuille('erreur');
}
function peindreChoixErreur(){
  var x=ERR_ED, g=T.querySelector('.cor-motgd');
  g.textContent=x.t;   /* le grand mot montre en jaune ce qui sera marqué */
  if(x.m){ var s=document.createElement('span'); s.className='rv-l'; s.textContent=x.t; g.textContent=''; g.appendChild(s); } else surligner(g,x.l);
  T.querySelectorAll('.cor-tm button').forEach(function(b){ b.classList.toggle('on',(b.dataset.tm==='mot')===x.m); });
  T.querySelector('.cor-lettres').hidden=x.m;
  T.querySelectorAll('.cor-lettres button').forEach(function(b){ b.classList.toggle('on',!x.m&&b.dataset.l===x.l); });
  T.querySelectorAll('.cor-notes button').forEach(function(b){ b.classList.toggle('on',b.dataset.n===ERR_ED.n); });
}
function garderErreur(supprimer){
  var x=ERR_ED; if(!x)return; ERR_ED=null;
  if(supprimer)ERR=ERR.filter(function(e){ return e!==x.e; });
  else if(x.e){ x.e.l=x.m?'':x.l; x.e.m=x.m?1:0; x.e.n=x.n||'à revoir'; }
  else ERR.push({id:'e'+Date.now().toString(36)+ERR.length,s:E.sur,k:x.k,j:x.j,l:x.m?'':x.l,m:x.m?1:0,n:x.n||'à revoir'});
  ecrire(K_ERREURS,ERR); fermeFeuilles(); peindreErreurs();
}

/* ── mémoriser (mot à mot, choix B de Myriam) : l'œil barré cache le texte ; chaque toucher sur un verset montre le mot suivant ;
   tout vu, un toucher recache ── */
function memo(on){
  MEMO=!!on; if(MEMO)crayon(false);
  var b=T.querySelector('.cor-memo'); b.classList.toggle('on',MEMO); b.setAttribute('aria-pressed',MEMO?'true':'false');
  T.classList.toggle('cor-memo-on',MEMO); T.querySelectorAll('.cor-mot.mz-vu').forEach(function(m){ m.classList.remove('mz-vu'); });
}
function toucherMemo(c){
  var ms=[].slice.call(c.querySelectorAll('.cor-ct .cor-mot')), caches=ms.filter(function(m){ return !m.classList.contains('mz-vu'); });
  if(!caches.length){ ms.forEach(function(m){ m.classList.remove('mz-vu'); }); return; }
  caches[0].classList.add('mz-vu'); crediter(SEC_MOT);
}

/* ── la lecture du jour : le cercle de l'épi ── */
function jour(){ var j=lire(K_JOUR,null), t=today(); return j&&j.d===t?j:{d:t,s:0,g:0}; }
function anneau(j){
  var el=T&&T.querySelector('.cor-serie'); if(!el)return;
  var p=Math.min(1,(j||jour()).s/SEUIL_JOUR);
  el.querySelector('.av').style.strokeDashoffset=(CERCLE*(1-p)).toFixed(1); el.classList.toggle('plein',p>=1);
}
/* max : ce que le texte autorise ; le temps écoulé depuis le dernier crédit borne le reste */
function crediter(max){
  var now=Date.now(), c=Math.min((now-CPT.dernier)/1000,max); if(!(c>0))return 0;
  CPT.dernier=now; var j=jour(); j.s+=c;
  if(j.s>=SEUIL_JOUR&&!j.g){ j.g=1; ecrire(K_JOUR,j); recompense(); }
  ecrire(K_JOUR,j); anneau(j); return c;
}
function recompense(){
  try{
    validerJour();
    var g=gagnerGraines(GRAINES.lecon); SES.gain+=g;
    if(g){ try{ SYNC.graines('REV-CORAN',false,false); }catch(e){} }
    save(); try{ refreshStats(); }catch(e){}
  }catch(e){}
}
/* chaque seconde : les versets à l'écran (60 % au moins) ont chacun leur budget (2 s par mot) ; un verset sorti de l'écran,
   ou réécouté, recompte ; le texte caché ne compte que par ses vérifications */
function tic(){
  if(!T||!T.classList.contains('on')||T.querySelector('.cor-lect').hidden||document.hidden||MEMO||!TXT[E.sur])return;
  var corps=T.querySelector('.cor-corps'), cr=corps.getBoundingClientRect(), vis=[];
  T.querySelectorAll('.cor-carte').forEach(function(c){
    var r=c.getBoundingClientRect(), h=Math.max(0,Math.min(r.bottom,cr.bottom)-Math.max(r.top,cr.top));
    var ratio=r.height?h/Math.min(r.height,cr.height):0, joue=c.classList.contains('joue');
    if(ratio<0.1)delete c._budget;
    else if(c._budget===undefined||(joue&&!c._joue))c._budget=c.querySelectorAll('.cor-ct .cor-mot').length*SEC_MOT;
    c._joue=joue;
    if(ratio>=0.6&&c._budget>0)vis.push(c);
  });
  if(!vis.length)return;
  var reste=crediter(Math.min(1.2,vis.reduce(function(s,c){ return s+c._budget; },0)));
  vis.forEach(function(c){ var p=Math.min(c._budget,reste); c._budget-=p; reste-=p; });
}
/* fermer après avoir gagné : l'écran de fin d'une leçon (lecture, graines, assiduité), puis les 7 épis si le jour vient d'être validé */
function finLecture(g){
  try{
    var mn=Math.max(1,Math.floor(jour().s/60)), F=function(id){ return document.getElementById(id); };
    F('fin-icon').textContent=''; F('fin-title').textContent='Lecture terminée !'; F('fin-extra').innerHTML='';
    F('fin-cases').innerHTML='<div class="cases">'+caseHTML('c-reus',LIVRE,'Lecture',mn+' min')+caseHTML('c-grain',ICO_GRAIN_FIN,'Graines','+'+g)+
      caseHTML('c-assid',ICO_EPI_FIN,'Assiduité',(S.streak||0)+' j')+'</div>';
    var fs=document.querySelector('#finish .fin-score'); if(fs)fs.style.display='none';
    fillFinishConstance();
    pendingStreak=feteJourPending; feteJourPending=false; backTo='islam';
    F('finish').classList.add('on');
    try{ confettiBurst(); playSfx('fin-lecon'); }catch(e){}
  }catch(e){}
}

/* la bulle sous le mot : tant que le doigt (ou la souris) reste dessus */
/* ⛔ AU-DESSUS du mot, jamais dessous : le doigt couvre le dessous (Myriam, 03/11). Au doigt elle reste 3 s après qu'on l'a levé ;
   à la souris elle part dès qu'on quitte le mot ; un défilement la retire tout de suite. */
var BULLE_MS=3000, _bulleT=0;
function montreBulle(m){
  clearTimeout(_bulleT);
  var b=T.querySelector('.cor-bulle'), k=+m.dataset.k, j=+m.dataset.j; b.querySelector('span').textContent=TXT[E.sur].v[k-1][1][j];
  b.classList.add('on'); var tr=T.getBoundingClientRect(), r=m.getBoundingClientRect(), bw=b.offsetWidth, bh=b.offsetHeight;
  var x=Math.max(8,Math.min(tr.width-bw-8,r.left-tr.left+r.width/2-bw/2));
  var zone=T.querySelector('.cor-zone').getBoundingClientRect(), dessus=r.top-bh-12>=zone.top;   /* de la place sous l'en-tête ? sinon dessous */
  b.classList.toggle('haut',dessus);
  b.style.left=x+'px'; b.style.top=(dessus?r.top-tr.top-bh-10:r.bottom-tr.top+7)+'px'; b.querySelector('i').style.left=(r.left-tr.left+r.width/2-x)+'px';
}
function cacheBulle(){ clearTimeout(_bulleT); var b=T&&T.querySelector('.cor-bulle'); if(b)b.classList.remove('on'); eteindreMots(); }
/* ⛔ TOUS les mots touchés, jamais le dernier seul : une voix finie oubliait le mot d'avant, et les mots allumés s'additionnaient
   (Myriam, 18/11) */
function eteindreMots(){ if(T)T.querySelectorAll('.cor-mot.dit').forEach(function(x){ x.classList.remove('dit'); }); }
function cacheBulleBientot(){ clearTimeout(_bulleT); _bulleT=setTimeout(cacheBulle,BULLE_MS); }

/* la voix d'UN mot : sur un canal à part ; une récitation en cours se met en PAUSE, sans se perdre */
function joueMot(k,j,el){
  try{ stopAudio(); }catch(e){}
  if(lecture)suspendre(); else coupeVoix();
  if(MOT_A){ try{ MOT_A.pause(); }catch(e){} }
  eteindreMots();
  var a=new Audio(urlMot(E.sur,k,j)); MOT_A=a; MOT_EL=el; el.classList.add('dit');
  /* le mot reste allumé aussi longtemps que sa bulle : cacheBulle() retire les deux (Myriam, 03/11) */
  var fin=function(){ if(MOT_A===a)MOT_A=null; };
  a.onended=fin; a.onerror=fin; var p=a.play(); if(p&&p.catch)p.catch(fin);
}

/* la barre de défilement : la position, et le verset sous le pouce */
function premierVisible(){ var corps=T.querySelector('.cor-corps'), cs=corps.querySelectorAll('.cor-carte'), top=corps.scrollTop+4; for(var i=0;i<cs.length;i++) if(cs[i].offsetTop+cs[i].offsetHeight>top) return i+1; return 1; }
function majRail(){
  var corps=T.querySelector('.cor-corps'), rail=T.querySelector('.cor-rail'), pouce=T.querySelector('.cor-pouce');
  var h=rail.clientHeight, ratio=corps.clientHeight/Math.max(1,corps.scrollHeight);
  rail.style.display=ratio>=1?'none':''; var ph=Math.max(40,h*ratio); pouce.style.height=ph+'px';
  var max=corps.scrollHeight-corps.clientHeight; pouce.style.top=(max>0?(h-ph)*corps.scrollTop/max:0)+'px';
  pouce.querySelector('.cor-etiq').textContent='verset '+premierVisible();
}
function noteDerniere(){ if(!TXT[E.sur]||T.querySelector('.cor-lect').hidden)return; ecrire(K_DERNIERE,{s:E.sur,k:premierVisible()}); }
function aller(s,k){ var c=T.querySelector('.cor-carte[data-k="'+k+'"]'); if(c)T.querySelector('.cor-corps').scrollTop=c.offsetTop-8; }

/* ── l'écoute ── */
function file(){
  var n=TXT[E.sur].v.length, f=[];
  if(E.mode==='verset')f=[[E.sur,E.v]];
  else if(E.mode==='versets'){ var a=Math.min(E.de,E.a), b=Math.max(E.de,E.a); for(var k=a;k<=Math.min(b,n);k++)f.push([E.sur,k]); }
  else if(E.mode==='sourate'){ for(var k2=1;k2<=n;k2++)f.push([E.sur,k2]); }
  else E.playlist.slice().sort(function(x,y){ return x-y; }).forEach(function(s){ for(var k3=1;k3<=LISTE[s-1][4];k3++)f.push([s,k3]); });
  return f;
}
/* suite : « la sourate » écoutée une fois enchaîne sur la suivante, comme une application de lecture (■ arrête) */
function ecouter(f,fois,boucle){
  var suite=!f&&E.mode==='sourate'&&!fois&&!E.boucle&&E.fois===1;
  f=f||file(); if(!f.length)return; try{ stopAudio(); }catch(e){}
  lecture={f:f,i:0,tour:1,fois:fois||E.fois,boucle:boucle===undefined?E.boucle:boucle,pl:!fois&&E.mode==='playlist',suite:suite,pause:false,a:null};
  session(true); suivant();
}
function suivant(){
  if(!lecture)return;
  if(lecture.i>=lecture.f.length){ lecture.tour++; lecture.i=0;
    if(!lecture.boucle&&lecture.tour>lecture.fois){
      var n=lecture.f[0][0]+1;
      if(!lecture.suite||n>114){ arret(); return; }
      lecture.f=[]; for(var k0=1;k0<=LISTE[n-1][4];k0++)lecture.f.push([n,k0]); lecture.tour=1;
    }
  }
  var it=lecture.f[lecture.i], s=it[0], k=it[1];
  if(s!==E.sur){ var L0=lecture; preparer(s,function(){ if(lecture!==L0)return; E.sur=s; peindre(); marques(); suivant(); }); return; }
  var L1=lecture; segments(s,function(M){ if(lecture!==L1)return; jouerVerset(s,k,M&&M[k]); });
}
/* ⛔ UNE SEULE VOIX (Myriam : « deux lectures en même temps ») : chaque verset lancé invalide celui qui était encore en route
   (la source d'un verset arrive plus tard, par le cache ou le réseau) */
function jouerVerset(s,k,info){
  coupeVoix(); var L=lecture, g=++GEN;
  sourceVerset(s,k,info,function(src,local){
    if(lecture!==L||g!==GEN){ if(local){ try{ URL.revokeObjectURL(src); }catch(e){} } return; }
    jouerSource(s,k,info,src,local);
  });
}
function jouerSource(s,k,info,src,local){
  coupeVoix(); var a=new Audio(src); VOIX_A=a; lecture.a=a;
  T.querySelector('.cor-jouer').innerHTML=lecture.pause?PLAY:PAUSE;
  /* la carte est relue à chaque fois : une autre écriture repeint les versets pendant la récitation */
  var carte=function(){ return E.sur===s&&T?T.querySelector('.cor-carte[data-k="'+k+'"]'):null; }, allume=-1, vue=null, c0=carte();
  /* ⛔ seule la voix EN COURS fait avancer la lecture : une voix arrêtée qui signale sa fin ou une erreur réseau en retard sautait un
     verset de la lecture suivante, pendant qu'elle-même parlait encore (« deux lectures en même temps ») */
  var actuelle=function(){ return !!lecture&&lecture.a===a; };
  if(c0){ c0.classList.add('joue'); T.querySelector('.cor-corps').scrollTo({top:c0.offsetTop-8,behavior:'smooth'}); }
  /* les mots s'allument un à un : segments [rang, position du mot (à partir de 1), début, fin] en ms */
  if(info&&info.seg.length)a.ontimeupdate=function(){ var c=carte(); if(!c||!actuelle())return; var ms=a.currentTime*1000, q=-1;
    for(var i=0;i<info.seg.length;i++){ var g=info.seg[i]; if(ms>=g[2]-40)q=g[1]-1; }
    if(q===allume&&c===vue)return; allume=q; vue=c; c.classList.add('joue');
    c.querySelectorAll('.cor-ct .cor-mot').forEach(function(m){ var j=+m.dataset.j; m.classList.toggle('en',j===q); m.classList.toggle('lu',j<q); }); };
  VOIX_FIN=function(){ if(local){ try{ URL.revokeObjectURL(src); }catch(e){} } var c=carte(); if(c){ c.classList.remove('joue'); c.querySelectorAll('.cor-mot').forEach(function(m){ m.classList.remove('en','lu'); }); } };
  /* une voix relancée de dehors (écouteurs, écran verrouillé) alors qu'elle n'est plus la nôtre, ou en pause : on la retient */
  a.onplay=function(){ if(!lecture||lecture.a!==a||lecture.pause){ try{ a.pause(); }catch(e){} } };
  a.onended=function(){ if(!actuelle())return; var fn=VOIX_FIN; VOIX_FIN=null; VOIX_A=null; if(fn)fn(); lecture.a=null; lecture.erreurs=0; lecture.i++; suivant(); };
  /* ⛔ hors connexion (l'avion) : le fichier d'un verset est introuvable. Deux échecs de suite : on s'ARRÊTE et on le dit, au lieu de défiler tous les versets en silence (et sans fin en boucle) */
  a.onerror=function(){ if(!actuelle())return; var fn=VOIX_FIN; VOIX_FIN=null; VOIX_A=null; if(fn)fn(); lecture.a=null; lecture.erreurs=(lecture.erreurs||0)+1;
    if(lecture.erreurs>=2){ arret(); try{ toast('Pas de connexion : la récitation se charge en ligne'); }catch(e){} return; }
    lecture.i++; setTimeout(suivant,200); };
  if(!lecture.pause){ var p=a.play(); if(p&&p.catch)p.catch(function(){}); }
}
function suspendre(){ if(!lecture||lecture.pause)return; lecture.pause=true; if(lecture.a){ try{ lecture.a.pause(); }catch(e){} } T.querySelector('.cor-jouer').innerHTML=PLAY; }
function reprendre(){ if(!lecture||!lecture.pause)return; lecture.pause=false; T.querySelector('.cor-jouer').innerHTML=PAUSE;
  if(lecture.a){ VOIX_A=lecture.a; var p=lecture.a.play(); if(p&&p.catch)p.catch(function(){}); } else suivant(); }
function arret(){ lecture=null; GEN++; coupeVoix(); session(false); if(T){ T.querySelector('.cor-jouer').innerHTML=PLAY; if(TXT[E.sur])etiquette(); } }
/* les boutons de l'écran verrouillé et des écouteurs passent par notre pause, jamais à côté ; rendus quand la lecture s'arrête */
function session(on){
  try{ var ms=navigator.mediaSession; if(!ms)return;
    ms.setActionHandler('play',on?reprendre:null); ms.setActionHandler('pause',on?suspendre:null); ms.setActionHandler('stop',on?arret:null);
  }catch(e){}
}
function borne(k,x){ var max=k==='fois'?100:TXT[E.sur].v.length; return Math.max(1,Math.min(max,(x|0)||1)); }
function panneau(){
  T.querySelectorAll('.cor-seg button').forEach(function(b){ b.classList.toggle('on',b.dataset.m===E.mode); });
  var n=TXT[E.sur].v.length, p=T.querySelector('.cor-panneau');
  var pas=function(k,lab){ return '<div class="cor-ligne"><span>'+lab+'</span><span class="cor-pas" data-k="'+k+'"><button data-d="-1" aria-label="Moins">−</button><input type="number" inputmode="numeric" min="1" max="'+n+'" value="'+E[k]+'"><button data-d="1" aria-label="Plus">+</button></span></div>'; };
  if(E.mode==='verset')p.innerHTML=pas('v','Verset');
  else if(E.mode==='versets')p.innerHTML=pas('de','Du verset')+pas('a','au verset');
  else if(E.mode==='sourate')p.innerHTML='<div class="cor-ligne"><span>'+esc(nomS(E.sur))+'</span><span class="cor-muted">'+n+' versets</span></div>';
  else p.innerHTML='<div class="cor-plinfo">'+(E.playlist.length?E.playlist.map(nomS).map(esc).join(' · '):'Coche des sourates')+'</div><div class="cor-ls2">'+LISTE.map(function(s){
    return '<label><input type="checkbox" data-s="'+s[0]+'"'+(E.playlist.indexOf(s[0])>=0?' checked':'')+'>'+s[0]+'. '+esc(s[1])+'<span class="cor-sa">'+s[2]+'</span></label>'; }).join('')+'</div>';
  T.querySelector('.cor-pas[data-k="fois"] input').value=E.fois; T.querySelector('.bcl').classList.toggle('on',E.boucle);
}

/* ── copier, partager, marque-pages ── */
function texteVerset(k,c){
  var v=TXT[E.sur].v[k-1], l=[];
  if(c.ar)l.push(v[0].join(' ')); if(c.tr)l.push('« '+v[2]+' »');
  if(c.ref)l.push(nomS(E.sur)+', '+E.sur+':'+k+(c.tr?' — traduction de Rachid Maach':'')); if(c.lien)l.push(lienVerset(E.sur,k));
  return l.join('\n');
}
function apercuCopie(){
  var tx=texteVerset(cible,CK), v=TXT[E.sur].v[cible-1], ar=v[0].join(' ');
  T.querySelector('.cor-apercu').innerHTML=tx?tx.split('\n').map(function(x){ return x===ar?'<span class="a">'+esc(x)+'</span>':esc(x); }).join('\n'):'<i>Rien de coché</i>';
  T.querySelector('[data-a="copier-go"]').textContent='COPIER';
}
function copie(tx,btn,fait){
  var fin=function(){ btn.textContent=fait; };
  try{ if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(tx).then(fin,fin); return; } }catch(e){}
  fin();
}
function listeMarques(){
  var M=lire(K_MARQUES,[]), D=lire(K_DERNIERE,null), h='';
  if(D&&LISTE[D.s-1])h+='<button class="cor-mrow" data-s="'+D.s+'" data-k="'+D.k+'"><span class="ico">'+PLAY.replace('<svg','<svg width="18" height="18" fill="currentColor"')+'</span><span>Reprendre<small>'+esc(nomS(D.s))+' · verset '+D.k+'</small></span></button>';
  h+=M.length?M.map(function(m){ return '<button class="cor-mrow" data-s="'+m[0]+'" data-k="'+m[1]+'"><span class="ico plein">'+RUBAN+'</span><span>'+esc(nomS(m[0]))+'<small>verset '+m[1]+'</small></span></button>'; }).join(''):'<div class="cor-vide">Touche le ruban d’un verset pour y poser un marque-page.</div>';
  T.querySelector('.cor-lm').innerHTML=h;
}
function listeQari(){
  var cur=qariId();
  T.querySelector('.cor-lq').innerHTML=VOIX.map(function(v){ return '<button class="cor-qrow'+(v.id===cur?' on':'')+'" data-q="'+v.id+'"><span class="rd"></span><span class="nm">'+esc(cap(v.fr))+(v.st==='j'?' · mujawwad':'')+'</span><span class="ar2">'+v.ar+'</span></button>'; }).join('');
}

/* ── les gestes ── */
function ouvreFeuille(c){ T.classList.add('f-'+c); }
function fermeFeuilles(){ T.classList.remove('f-hors','f-ecoute','f-marques','f-sourates','f-qari','f-copie','f-partage','f-ecriture','f-code','f-erreur'); ERR_ED=null; }
function clic(e){
  var el=e.target.closest('[data-a]'), a=el&&el.dataset.a, b;
  if(e.target.closest('.cor-reseaux button')){ reseau(e.target.closest('.cor-reseaux button').dataset.r); return; }
  if((b=e.target.closest('.cor-opt'))){ choisirEcriture(b.dataset.ecr); return; }
  if((b=e.target.closest('.cor-tm button'))&&ERR_ED){ ERR_ED.m=b.dataset.tm==='mot'; if(ERR_ED.m&&!ERR_ED.n)ERR_ED.n='oublié'; peindreChoixErreur(); return; }
  if((b=e.target.closest('.cor-lettres button'))&&ERR_ED){ ERR_ED.m=false; ERR_ED.l=b.dataset.l; peindreChoixErreur(); return; }
  if((b=e.target.closest('.cor-notes button'))&&ERR_ED){ ERR_ED.n=b.dataset.n; peindreChoixErreur(); return; }
  if(e.target.closest('.cor-seg button')){ E.mode=e.target.closest('.cor-seg button').dataset.m; panneau(); return; }
  if(e.target.closest('.cor-pas button')){ var p=e.target.closest('.cor-pas'), kk=p.dataset.k; E[kk]=borne(kk,E[kk]+(+e.target.closest('.cor-pas button').dataset.d)); p.querySelector('input').value=E[kk]; etiquette(); return; }
  var s=e.target.closest('.cor-srow, .cor-mrow, .cor-reprendre');
  if(s){ var fs=e.target.closest('.fs'); fermeFeuilles(); arret(); montreLecteur(+s.dataset.s,s.dataset.k?+s.dataset.k:0); return; }
  var qr=e.target.closest('.cor-qrow');
  if(qr){ var id=qr.dataset.q; S.qari=id; try{ saveLocal(); }catch(x){} var rejoue=!!lecture&&!lecture.pause; fermeFeuilles(); marques(); /* en cours : on continue avec la nouvelle voix ; en pause : la lecture est abandonnée */ if(rejoue){ var L=lecture; arret(); lecture=L; session(true); suivant(); } else arret(); return; }
  if(!a)return;
  switch(a){
    case 'fermer': coranFermer(); break;
    case 'moins': case 'plus': var n2=E.sur+(a==='plus'?1:-1); if(n2>=1&&n2<=114){ arret(); montreLecteur(n2,0); } break;
    case 'stop': arret(); break;
    case 'memo': memo(!MEMO); break;
    case 'stylo': if(MEMO)memo(false); crayon(!CRAYON); break;
    case 'ecriture': peindreEcriture(); ouvreFeuille('ecriture'); break;
    case 'couleurs': ECR.c=ECR.c?0:1; ecrire(K_ECRITURE,ECR); T.classList.toggle('cor-tjc',!!ECR.c); peindreEcriture(); break;
    case 'code': ouvreFeuille('code'); break;
    case 'ferme-code': T.classList.remove('f-code'); break;
    case 'err-ok': garderErreur(false); break;
    case 'err-x': garderErreur(true); break;
    case 'hc-dl': (function(n,v){ telecharger(v,n,function(){ if(HC_N===n&&T.classList.contains('f-hors'))peindreHors(); }); })(HC_N,qari()); break;
    case 'hc-ligne': EN_LIGNE[cleHors(qari(),HC_N)]=1; apresHors(); break;
    case 'hc-ecouter': apresHors(); break;
    case 'ferme': fermeFeuilles(); break;
    case 'sourates': ouvreFeuille('sourates'); break;
    case 'qari': listeQari(); ouvreFeuille('qari'); break;
    case 'marques': case 'marques-liste': listeMarques(); ouvreFeuille('marques'); break;
    case 'trad': var on=!el.classList.contains('on'); el.classList.toggle('on',on); el.setAttribute('aria-pressed',on?'true':'false'); el.querySelector('.cor-bx').textContent=on?'✓':''; T.classList.toggle('sans-trad',!on); ecrire(K_TRAD,on); majRail(); break;
    case 'mq': var k=+el.dataset.k, M=lire(K_MARQUES,[]), i=M.findIndex(function(m){ return m[0]===E.sur&&m[1]===k; }); if(i>=0)M.splice(i,1); else M.push([E.sur,k]); ecrire(K_MARQUES,M); el.classList.toggle('on',i<0); break;
    case 'vj': arret(); ecouter([[E.sur,+el.dataset.k]],1,false); break;
    case 'jouer': if(lecture){ if(lecture.pause)reprendre(); else suspendre(); } else if(demanderHors())ouvreHors(function(){ ecouter(); }); else ecouter(); break;
    case 'ecoute': E.v=premierVisible(); panneau(); ouvreFeuille('ecoute'); break;
    case 'boucle': E.boucle=!E.boucle; T.querySelector('.bcl').classList.toggle('on',E.boucle); etiquette(); break;
    case 'ecouter': fermeFeuilles(); arret(); if(demanderHors())ouvreHors(function(){ ecouter(); }); else ecouter(); break;
    case 'cp': cible=+el.dataset.k; T.querySelectorAll('.cor-cases input').forEach(function(x){ x.checked=!!CK[x.dataset.c]; }); apercuCopie(); ouvreFeuille('copie'); break;
    case 'copier-go': copie(texteVerset(cible,CK),el,'COPIÉ ✓'); break;
    case 'pt': cible=+el.dataset.k; T.querySelector('.cor-lien-u').textContent=lienVerset(E.sur,cible); T.querySelector('[data-a="lien-c"]').textContent='COPIER LE LIEN'; ouvreFeuille('partage'); break;
    case 'lien-c': copie(lienVerset(E.sur,cible),el,'COPIÉ ✓'); break;
  }
}
function reseau(r){
  var u=lienVerset(E.sur,cible), tx=texteVerset(cible,{ar:1,tr:1,ref:1}), url='';
  if(r==='wa')url='https://wa.me/?text='+encodeURIComponent(tx+'\n'+u);
  else if(r==='fb')url='https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(u);
  else if(r==='x')url='https://twitter.com/intent/tweet?text='+encodeURIComponent('« '+TXT[E.sur].v[cible-1][2]+' » ('+nomS(E.sur)+', '+E.sur+':'+cible+')')+'&url='+encodeURIComponent(u);
  else if(navigator.share){ navigator.share({title:nomS(E.sur)+', '+E.sur+':'+cible,text:tx,url:u}).catch(function(){}); return; }
  else { copie(tx+'\n'+u,T.querySelector('.cor-reseaux [data-r="plus"]'),'Copié'); return; }
  window.open(url,'_blank','noopener');
}
function change(e){
  var t=e.target;
  if(t.matches('.cor-cases input')){ CK[t.dataset.c]=t.checked?1:0; ecrire(K_COPIE,CK); apercuCopie(); return; }
  if(t.matches('.cor-pas input')){ var kk=t.closest('.cor-pas').dataset.k; E[kk]=borne(kk,+t.value); t.value=E[kk]; etiquette(); return; }
  if(t.matches('.cor-ls2 input')){ var s=+t.dataset.s, i=E.playlist.indexOf(s); if(t.checked&&i<0)E.playlist.push(s); if(!t.checked&&i>=0)E.playlist.splice(i,1);
    T.querySelector('.cor-plinfo').textContent=E.playlist.length?E.playlist.map(nomS).join(' · '):'Coche des sourates'; }
}
function saisie(e){
  if(!e.target.matches('.cor-cherche2'))return;
  var v=e.target.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  e.target.parentNode.querySelectorAll('.cor-srow, .cor-mrow').forEach(function(r){ var x=r.textContent.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,''); r.style.display=x.indexOf(v)>=0?'':'none'; });
}

/* ── l'entrée et la sortie ── */
window.coranOuvrir=function(){
  monte(); ECR=lire(K_ECRITURE,null)||{m:'simple',c:1}; ERR=lire(K_ERREURS,[]); T.classList.toggle('cor-tjc',!!ECR.c);   // relus à chaque ouverture
  entretienHors(); montreListe(); T.classList.add('on'); fermeFeuilles(); texteAuto();
  SES.gain=0; CPT.dernier=Date.now(); clearInterval(MINUT); MINUT=setInterval(tic,1000);
};
window.coranFermer=function(){
  if(!T)return; arret(); cacheBulle(); fermeFeuilles(); crayon(false); if(MEMO)memo(false);
  var ouvert=T.classList.contains('on'); T.classList.remove('on'); noteDerniere(); clearInterval(MINUT); MINUT=null;
  var g=SES.gain; SES.gain=0; if(ouvert&&g>0)finLecture(g);
};
})();
