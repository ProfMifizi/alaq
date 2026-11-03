/* ═══ coran.js — le lecteur du Coran (onglet Islam › Le Coran) : les 114 sourates ═══
   Liste, une carte par verset, la traduction du verset (à décocher), la traduction d'un mot en bulle tant que le doigt reste
   dessus, la voix du mot (quran.com), la récitation du récitateur choisi avec le verset doré et ses mots allumés un à un,
   pause qui garde sa place, écoute d'un verset / de versets / d'une sourate / d'une playlist de 1 à 100 fois ou en boucle,
   marque-pages et dernière lecture, copier et partager un verset. (journal : coran.js · le lecteur du Coran, 03/11)
   Préviews validées par Myriam : previews/_apercu-coran-v10.html (branche retours-accueil-2nov).
   Script CLASSIQUE, chargé sous bulles-tutoriels.js et avant coque.js. Ouvert au doigt (ui/parametres.js › ISLAM_CASES) : il
   ne sert jamais au premier rendu, mais il reste classique comme tous les écrans de la coque (aucun import, aucun export).
   AU CHARGEMENT : rien n'est lu ni écrit, il ne pose que coranOuvrir/coranFermer sur window.
   À L'APPEL : S, saveLocal (progression.js) · VOIX, QARI_DEFAUT, HOROV, qariUrl (revision.js) · stopAudio (son.js).
   DONNÉES : coran/NNN-v1.json, une par sourate (texte Tanzil, mot à mot de l'app, traduction du sens de Rachid Maach / QuranEnc),
   servies par sw.js (cache d'abord). Les horaires des mots viennent de api.quran.com ; la voix d'un mot, de audio.qurancdn.com :
   lues à la source au toucher, jamais copiées ni mises en cache (conditions de Quran Foundation : « Quran data provided by
   Quran.Foundation »). */
(function(){
'use strict';
/* la liste : [n, nom, nom arabe vocalisé, sens, versets, slug du site] */
var LISTE=[[1,"Al-Fātiḥa","الْفَاتِحَة","L’Ouverture",7,"al-fatiha"],[2,"Al-Baqara","الْبَقَرَة","La Vache",286,"al-baqara"],[3,"Āl ʿImrān","آلِ عِمْرَان","La Famille d’Imran",200,"al-imran"],[4,"An-Nisāʾ","النِّسَاء","Les Femmes",176,"an-nisa"],[5,"Al-Māʾida","الْمَائِدَة","La Table servie",120,"al-maida"],[6,"Al-Anʿām","الْأَنْعَام","Les Bestiaux",165,"al-anam"],[7,"Al-Aʿrāf","الْأَعْرَاف","Les Murailles",206,"al-araf"],[8,"Al-Anfāl","الْأَنْفَال","Le Butin",75,"al-anfal"],[9,"At-Tawba","التَّوْبَة","Le Repentir",129,"at-tawba"],[10,"Yunus","يُونُس","Jonas",109,"yunus"],[11,"Hud","هُود","Houd",123,"hud"],[12,"Yusuf","يُوسُف","Joseph",111,"yusuf"],[13,"Ar-Raʿd","الرَّعْد","Le Tonnerre",43,"ar-rad"],[14,"Ibrāhim","إِبْرَاهِيم","Abraham",52,"ibrahim"],[15,"Al-Ḥijr","الْحِجْر","",99,"al-hijr"],[16,"An-Naḥl","النَّحْل","Les Abeilles",128,"an-nahl"],[17,"Al-Isrāʾ","الْإِسْرَاء","Le Voyage nocturne",111,"al-isra"],[18,"Al-Kahf","الْكَهْف","La Caverne",110,"al-kahf"],[19,"Maryam","مَرْيَم","Marie",98,"maryam"],[20,"Ṭā-Hā","طه","",135,"ta-ha"],[21,"Al-Anbiyāʾ","الْأَنْبِيَاء","Les Prophètes",112,"al-anbiya"],[22,"Al-Ḥajj","الْحَجّ","Le Pèlerinage",78,"al-hajj"],[23,"Al-Muʾminun","الْمُؤْمِنُون","Les Croyants",118,"al-muminun"],[24,"An-Nur","النُّور","La Lumière",64,"an-nur"],[25,"Al-Furqān","الْفُرْقَان","Le Discernement",77,"al-furqan"],[26,"Ash-Shuʿarāʾ","الشُّعَرَاء","Les Poètes",227,"ash-shuara"],[27,"An-Naml","النَّمْل","Les Fourmis",93,"an-naml"],[28,"Al-Qaṣaṣ","الْقَصَص","Le Récit",88,"al-qasas"],[29,"Al-ʿAnkabut","الْعَنْكَبُوت","L’Araignée",69,"al-ankabut"],[30,"Ar-Rum","الرُّوم","Les Romains",60,"ar-rum"],[31,"Luqmān","لُقْمَان","",34,"luqman"],[32,"As-Sajda","السَّجْدَة","La Prosternation",30,"as-sajda"],[33,"Al-Aḥzāb","الْأَحْزَاب","Les Coalisés",73,"al-ahzab"],[34,"Sabaʾ","سَبَأ","",54,"saba"],[35,"Fāṭir","فَاطِر","Le Créateur",45,"fatir"],[36,"Yā-Sin","يس","",83,"ya-sin"],[37,"Aṣ-Ṣāffāt","الصَّافَّات","Les Rangés",182,"as-saffat"],[38,"Ṣād","ص","",88,"sad"],[39,"Az-Zumar","الزُّمَر","Les Groupes",75,"az-zumar"],[40,"Ghāfir","غَافِر","Le Pardonneur",85,"ghafir"],[41,"Fuṣṣilat","فُصِّلَت","Les Versets détaillés",54,"fussilat"],[42,"Ash-Shurā","الشُّورَى","La Consultation",53,"ash-shura"],[43,"Az-Zukhruf","الزُّخْرُف","L’Ornement",89,"az-zukhruf"],[44,"Ad-Dukhān","الدُّخَان","La Fumée",59,"ad-dukhan"],[45,"Al-Jāthiya","الْجَاثِيَة","L’Agenouillée",37,"al-jathiya"],[46,"Al-Aḥqāf","الْأَحْقَاف","Les Dunes",35,"al-ahqaf"],[47,"Muḥammad","مُحَمَّد","",38,"muhammad"],[48,"Al-Fatḥ","الْفَتْح","La Victoire éclatante",29,"al-fath"],[49,"Al-Ḥujurāt","الْحُجُرَات","Les Appartements",18,"al-hujurat"],[50,"Qāf","ق","",45,"qaf"],[51,"Adh-Dhāriyāt","الذَّارِيَات","Qui éparpillent",60,"adh-dhariyat"],[52,"Aṭ-Ṭur","الطُّور","Le Mont",49,"at-tur"],[53,"An-Najm","النَّجْم","L’Étoile",62,"an-najm"],[54,"Al-Qamar","الْقَمَر","La Lune",55,"al-qamar"],[55,"Ar-Raḥmān","الرَّحْمَٰن","Le Tout Miséricordieux",78,"ar-rahman"],[56,"Al-Wāqiʿa","الْوَاقِعَة","L’Événement",96,"al-waqia"],[57,"Al-Ḥadid","الْحَدِيد","Le Fer",29,"al-hadid"],[58,"Al-Mujādila","الْمُجَادِلَة","La Discussion",22,"al-mujadala"],[59,"Al-Ḥashr","الْحَشْر","L’Exode",24,"al-hashr"],[60,"Al-Mumtaḥana","الْمُمْتَحَنَة","L’Éprouvée",13,"al-mumtahana"],[61,"Aṣ-Ṣaff","الصَّفّ","Le Rang",14,"as-saff"],[62,"Al-Jumuʿa","الْجُمُعَة","Le Vendredi",11,"al-jumua"],[63,"Al-Munāfiqun","الْمُنَافِقُون","Les Hypocrites",11,"al-munafiqun"],[64,"At-Taghābun","التَّغَابُن","La Grande Perte",18,"at-taghabun"],[65,"Aṭ-Ṭalāq","الطَّلَاق","Le Divorce",12,"at-talaq"],[66,"At-Taḥrim","التَّحْرِيم","L’Interdiction",12,"at-tahrim"],[67,"Al-Mulk","الْمُلْك","La Royauté",30,"al-mulk"],[68,"Al-Qalam","الْقَلَم","La Plume",52,"al-qalam"],[69,"Al-Ḥāqqa","الْحَاقَّة","Celle qui montre la vérité",52,"al-haqqa"],[70,"Al-Maʿārij","الْمَعَارِج","Les Voies d’ascension",44,"al-maarij"],[71,"Nuḥ","نُوح","Noé",28,"nuh"],[72,"Al-Jinn","الْجِنّ","Les Djinns",28,"al-jinn"],[73,"Al-Muzzammil","الْمُزَّمِّل","L’Enveloppé",20,"al-muzzammil"],[74,"Al-Muddaththir","الْمُدَّثِّر","Le Revêtu d’un manteau",56,"al-muddaththir"],[75,"Al-Qiyāma","الْقِيَامَة","La Résurrection",40,"al-qiyama"],[76,"Al-Insān","الْإِنْسَان","L’Homme",31,"al-insan"],[77,"Al-Mursalāt","الْمُرْسَلَات","Les Envoyés",50,"al-mursalat"],[78,"An-Nabaʾ","النَّبَأ","La Nouvelle",40,"an-naba"],[79,"An-Nāziʿāt","النَّازِعَات","Les Anges qui arrachent les âmes",46,"an-naziat"],[80,"ʿAbasa","عَبَسَ","Il s’est renfrogné",42,"abasa"],[81,"At-Takwir","التَّكْوِير","L’Obscurcissement",29,"at-takwir"],[82,"Al-Infiṭār","الِانْفِطَار","La Rupture",19,"al-infitar"],[83,"Al-Muṭaffifin","الْمُطَفِّفِين","Les Fraudeurs",36,"al-mutaffifin"],[84,"Al-Inshiqāq","الِانْشِقَاق","La Déchirure",25,"al-inshiqaq"],[85,"Al-Buruj","الْبُرُوج","Les Constellations",22,"al-buruj"],[86,"Aṭ-Ṭāriq","الطَّارِق","L’Astre nocturne",17,"at-tariq"],[87,"Al-Aʿlā","الْأَعْلَى","Le Très-Haut",19,"al-ala"],[88,"Al-Ghāshiya","الْغَاشِيَة","L’Enveloppante",26,"al-ghashiya"],[89,"Al-Fajr","الْفَجْر","L’Aube",30,"al-fajr"],[90,"Al-Balad","الْبَلَد","La Cité",20,"al-balad"],[91,"Ash-Shams","الشَّمْس","Le Soleil",15,"ash-shams"],[92,"Al-Layl","اللَّيْل","La Nuit",21,"al-layl"],[93,"Aḍ-Ḍuḥā","الضُّحَى","Le Jour montant",11,"ad-duha"],[94,"Ash-Sharḥ","الشَّرْح","L’Épanouissement",8,"ash-sharh"],[95,"At-Tin","التِّين","Le Figuier",8,"at-tin"],[96,"Al-ʿAlaq","الْعَلَق","L’Adhérence",19,"al-alaq"],[97,"Al-Qadr","الْقَدْر","La Destinée",5,"al-qadr"],[98,"Al-Bayyina","الْبَيِّنَة","La Preuve",8,"al-bayyina"],[99,"Az-Zalzala","الزَّلْزَلَة","La Secousse",8,"az-zalzala"],[100,"Al-ʿĀdiyāt","الْعَادِيَات","Les Coursiers",11,"al-adiyat"],[101,"Al-Qāriʿa","الْقَارِعَة","Le Fracas",11,"al-qaria"],[102,"At-Takāthur","التَّكَاثُر","La Course aux richesses",8,"at-takathur"],[103,"Al-ʿAṣr","الْعَصْر","Le Temps",3,"al-asr"],[104,"Al-Humaza","الْهُمَزَة","Les Calomniateurs",9,"al-humaza"],[105,"Al-Fil","الْفِيل","L’Éléphant",5,"al-fil"],[106,"Quraysh","قُرَيْش","",4,"quraysh"],[107,"Al-Māʿun","الْمَاعُون","L’Ustensile",7,"al-maun"],[108,"Al-Kawthar","الْكَوْثَر","L’Abondance",3,"al-kawthar"],[109,"Al-Kāfirun","الْكَافِرُون","Les Infidèles",6,"al-kafirun"],[110,"An-Naṣr","النَّصْر","Le Secours",3,"an-nasr"],[111,"Al-Masad","الْمَسَد","Les Fibres",5,"al-masad"],[112,"Al-Ikhlāṣ","الْإِخْلَاص","Le Monothéisme pur",4,"al-ikhlas"],[113,"Al-Falaq","الْفَلَق","L’Aube naissante",5,"al-falaq"],[114,"An-Nās","النَّاس","Les Hommes",6,"an-nas"]];
var OFF=(function(){ var o=[],a=0; LISTE.forEach(function(s){ o.push(a); a+=s[4]; }); return o; })();
/* les récitateurs dont quran.com donne l'horaire de chaque mot (id chez eux) */
var QF={'ar.abdulbasitmurattal':2,'ar.abdurrahmaansudais':3,'ar.shaatree':4,'ar.hanirifai':5,'ar.husary':6,'ar.alafasy':7,'ar.minshawi':9,'ar.saoodshuraym':10};
var K_MARQUES='alaq_coran_marques', K_DERNIERE='alaq_coran_derniere', K_TRAD='alaq_coran_trad', K_COPIE='alaq_coran_copie';
var CHIFFRES_LIEN='https://www.alaq.fr/coran/';

var SPK='<svg class="cor-ico" viewBox="0 0 26 20"><path class="f" d="M2 7h4l5-4.5v15L6 13H2z"/><path class="f" d="M15 6.2a5 5 0 0 1 0 7.6l-1.2-1.3a3.2 3.2 0 0 0 0-5z"/><path class="f" d="M18 3.4a9 9 0 0 1 0 13.2l-1.2-1.3a7.2 7.2 0 0 0 0-10.6z" opacity=".55"/></svg>';
var RUBAN='<svg class="cor-ico" viewBox="0 0 16 20"><path d="M2 1.5h12v17l-6-4.5-6 4.5z"/></svg>';
var COPIER='<svg class="cor-ico" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>';
var PARTAGER='<svg class="cor-ico" viewBox="0 0 24 24"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8l7.4-4.4M8.3 13.2l7.4 4.4"/></svg>';
var BOUCLE='<svg class="cor-ico" viewBox="0 0 24 24"><path d="M4 11V9a3 3 0 0 1 3-3h12l-3-3M20 13v2a3 3 0 0 1-3 3H5l3 3"/></svg>';
var PLAY='<svg viewBox="0 0 24 24"><path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5z"/></svg>';
var PAUSE='<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';
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
function segments(n,suite){
  var v=qari();
  if(n===1&&v.loc&&typeof HOROV!=='undefined'&&HOROV[v.id]){
    var M={}; for(var k=1;k<=7;k++){ var h=HOROV[v.id][String(k)]||[]; M[k]={url:'audios-app-alaq/recit/'+v.id+'/'+k+'.mp3',seg:h.map(function(x,j){ return [j,j+1,+x[0],+x[1]]; })}; }
    return suite(M);
  }
  var id=QF[v.id]; if(!id)return suite(null);
  var cle=id+':'+n; if(SEG[cle])return suite(SEG[cle]);
  var M2={};
  (function page(p){
    fetch('https://api.quran.com/api/v4/recitations/'+id+'/by_chapter/'+n+'?fields=segments&per_page=50&page='+p).then(function(r){ return r.json(); }).then(function(d){
      (d.audio_files||[]).forEach(function(f){ var u=f.url||''; M2[+f.verse_key.split(':')[1]]={url:u.indexOf('//')===0?'https:'+u:(u.indexOf('http')===0?u:'https://verses.quran.com/'+u),seg:f.segments||[]}; });
      if(d.pagination&&d.pagination.next_page)page(d.pagination.next_page); else { SEG[cle]=M2; suite(M2); }
    }).catch(function(){ suite(null); });
  })(1);
}
function urlVerset(n,k){ return qariUrl(qari(),OFF[n-1]+k); }
function urlMot(s,k,j){ var p=function(x){ return ('00'+x).slice(-3); }; return 'https://audio.qurancdn.com/wbw/'+p(s)+'_'+p(k)+'_'+p(j+1)+'.mp3'; }

/* ═══ l'écran ═══ */
function monte(){
  if(T)return;
  T=document.createElement('div'); T.id='coran'; T.className='coran-plein';
  T.innerHTML=
    '<div class="cor-vue cor-liste"></div>'+
    '<div class="cor-vue cor-lect" hidden>'+
      '<div class="cor-tete"><button class="cor-x" data-a="retour" aria-label="Retour à la liste">✕</button><button class="cor-titre" data-a="sourates"></button>'+
        '<button class="cor-mp" data-a="marques" aria-label="Marque-pages">'+RUBAN+'</button></div>'+
      '<div class="cor-outils"><button class="cor-coche on" data-a="trad" aria-pressed="true"><span class="cor-bx">✓</span>Traduction</button></div>'+
      '<div class="cor-zone"><div class="cor-corps"></div><div class="cor-rail"><div class="cor-piste"></div><div class="cor-pouce"><span class="cor-etiq"></span></div></div></div>'+
      '<div class="cor-lecteur"><button class="cor-jouer" data-a="jouer" aria-label="Écouter">'+PLAY+'</button><button class="cor-li" data-a="qari"><b class="cor-q1"></b><small class="cor-q2"></small></button>'+
        '<button class="cor-rep" data-a="ecoute" aria-label="Réglages de l’écoute">'+BOUCLE+'<span class="cor-repn">×1</span></button></div>'+
    '</div>'+
    '<div class="cor-bulle" role="tooltip"><i></i><span></span></div>'+
    '<div class="cor-voile" data-a="ferme"></div>'+
    feuilles();
  document.body.appendChild(T);
  T.addEventListener('click',clic);
  T.addEventListener('change',change);
  T.addEventListener('input',saisie);
  var corps=T.querySelector('.cor-corps');
  corps.addEventListener('pointerdown',function(e){ var m=e.target.closest('.cor-mot'); if(!m)return; montreBulle(m); joueMot(+m.dataset.k,+m.dataset.j,m); });
  ['pointerup','pointercancel'].forEach(function(n){ corps.addEventListener(n,cacheBulle); });
  corps.addEventListener('pointerover',function(e){ if(e.pointerType!=='mouse')return; var m=e.target.closest('.cor-mot'); if(m)montreBulle(m); });
  corps.addEventListener('pointerout',function(e){ if(e.target.closest('.cor-mot'))cacheBulle(); });
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
  return '<div class="cor-feuille fe"><h3>Écouter<button data-a="ferme" aria-label="Fermer">✕</button></h3>'+
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
  T.querySelector('.cor-liste').innerHTML=h;
  T.querySelector('.cor-liste').hidden=false; T.querySelector('.cor-lect').hidden=true;
}
function credit(){ return '<p class="cor-credit">Texte arabe : Tanzil · Traduction du sens : Rachid Maach (QuranEnc) · Mot à mot : Alaq · Voix des mots : Quran data provided by Quran.Foundation</p>'; }

/* ── le lecteur ── */
function montreLecteur(n,k){
  charger(n,function(){
    E.sur=n; T.querySelector('.cor-liste').hidden=true; T.querySelector('.cor-lect').hidden=false;
    var trad=lire(K_TRAD,true); T.classList.toggle('sans-trad',!trad);
    var c=T.querySelector('.cor-coche'); c.classList.toggle('on',!!trad); c.setAttribute('aria-pressed',trad?'true':'false'); c.querySelector('.cor-bx').textContent=trad?'✓':'';
    peindre(); if(k)aller(n,k);
  });
}
function peindre(){
  var t=TXT[E.sur], M=lire(K_MARQUES,[]);
  T.querySelector('.cor-lect .cor-titre').innerHTML=esc(t.nom)+'<span class="a">'+t.ar+'</span><span class="car">▾</span>';
  T.querySelector('.cor-corps').innerHTML=t.v.map(function(v,i){ var k=i+1, mq=M.some(function(m){ return m[0]===E.sur&&m[1]===k; });
    return '<div class="cor-carte" data-k="'+k+'"><div class="cor-ch"><span class="cor-n">VERSET '+k+'</span>'+
      '<button class="mq'+(mq?' on':'')+'" data-a="mq" data-k="'+k+'" aria-label="Marque-page, verset '+k+'">'+RUBAN+'</button>'+
      '<button data-a="cp" data-k="'+k+'" aria-label="Copier le verset '+k+'">'+COPIER+'</button>'+
      '<button data-a="pt" data-k="'+k+'" aria-label="Partager le verset '+k+'">'+PARTAGER+'</button>'+
      '<button data-a="vj" data-k="'+k+'" aria-label="Écouter le verset '+k+'">'+SPK+'</button></div>'+
      '<div class="cor-ct" lang="ar" dir="rtl">'+v[0].map(function(w,j){ return '<span class="cor-mot" data-k="'+k+'" data-j="'+j+'">'+esc(w)+'</span>'; }).join(' ')+'</div>'+
      '<div class="cor-tr">'+esc(v[2])+'</div></div>'; }).join('')+credit();
  T.querySelector('.cor-corps').scrollTop=0; majRail(); etiquette();
}
function etiquette(txt,sous){
  var v=qari();
  T.querySelector('.cor-q1').innerHTML=esc(txt||cap(v.fr)+(v.st==='j'?' · mujawwad':''))+'<span class="car">▾</span>';
  T.querySelector('.cor-q2').textContent=sous||(nomS(E.sur)+' · '+TXT[E.sur].v.length+' versets');
  T.querySelector('.cor-repn').textContent=E.boucle?'boucle':'×'+E.fois;
}

/* la bulle sous le mot : tant que le doigt (ou la souris) reste dessus */
function montreBulle(m){
  var b=T.querySelector('.cor-bulle'), k=+m.dataset.k, j=+m.dataset.j; b.querySelector('span').textContent=TXT[E.sur].v[k-1][1][j];
  b.classList.add('on'); var tr=T.getBoundingClientRect(), r=m.getBoundingClientRect(), bw=b.offsetWidth;
  var x=Math.max(8,Math.min(tr.width-bw-8,r.left-tr.left+r.width/2-bw/2));
  b.style.left=x+'px'; b.style.top=(r.bottom-tr.top+7)+'px'; b.querySelector('i').style.left=(r.left-tr.left+r.width/2-x)+'px';
}
function cacheBulle(){ var b=T&&T.querySelector('.cor-bulle'); if(b)b.classList.remove('on'); }

/* la voix d'UN mot : sur un canal à part ; une récitation en cours se met en PAUSE, sans se perdre */
function joueMot(k,j,el){
  try{ stopAudio(); }catch(e){}
  if(lecture)suspendre(); else coupeVoix();
  if(MOT_A){ try{ MOT_A.pause(); }catch(e){} if(MOT_EL)MOT_EL.classList.remove('dit'); }
  var a=new Audio(urlMot(E.sur,k,j)); MOT_A=a; MOT_EL=el; el.classList.add('dit');
  var fin=function(){ el.classList.remove('dit'); if(MOT_A===a)MOT_A=null; };
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
function ecouter(f,fois,boucle){
  f=f||file(); if(!f.length)return; try{ stopAudio(); }catch(e){}
  lecture={f:f,i:0,tour:1,fois:fois||E.fois,boucle:boucle===undefined?E.boucle:boucle,pl:!fois&&E.mode==='playlist',pause:false,a:null}; suivant();
}
function suivant(){
  if(!lecture)return;
  if(lecture.i>=lecture.f.length){ lecture.tour++; lecture.i=0; if(!lecture.boucle&&lecture.tour>lecture.fois){ arret(); return; } }
  var it=lecture.f[lecture.i], s=it[0], k=it[1];
  if(s!==E.sur){ var L0=lecture; charger(s,function(){ if(lecture!==L0)return; E.sur=s; peindre(); suivant(); }); return; }
  var L1=lecture; segments(s,function(M){ if(lecture!==L1)return; jouerVerset(s,k,M&&M[k]); });
}
function jouerVerset(s,k,info){
  coupeVoix(); var a=new Audio(info?info.url:urlVerset(s,k)); VOIX_A=a; lecture.a=a;
  T.querySelector('.cor-jouer').innerHTML=lecture.pause?PLAY:PAUSE;
  etiquette(nomS(s)+' · verset '+k,(lecture.boucle?'en boucle':'tour '+lecture.tour+' / '+lecture.fois)+(lecture.pl?' · playlist':''));
  var carte=T.querySelector('.cor-carte[data-k="'+k+'"]'), allume=-1;
  if(carte){ carte.classList.add('joue'); T.querySelector('.cor-corps').scrollTo({top:carte.offsetTop-8,behavior:'smooth'}); }
  /* les mots s'allument un à un : segments [rang, position du mot (à partir de 1), début, fin] en ms */
  if(carte&&info&&info.seg.length)a.ontimeupdate=function(){ var ms=a.currentTime*1000, q=-1;
    for(var i=0;i<info.seg.length;i++){ var g=info.seg[i]; if(ms>=g[2]-40)q=g[1]-1; }
    if(q===allume)return; allume=q;
    carte.querySelectorAll('.cor-mot').forEach(function(m){ var j=+m.dataset.j; m.classList.toggle('en',j===q); m.classList.toggle('lu',j<q); }); };
  VOIX_FIN=function(){ if(carte){ carte.classList.remove('joue'); carte.querySelectorAll('.cor-mot').forEach(function(m){ m.classList.remove('en','lu'); }); } };
  a.onended=function(){ var fn=VOIX_FIN; VOIX_FIN=null; VOIX_A=null; if(fn)fn(); if(!lecture)return; lecture.a=null; lecture.i++; suivant(); };
  a.onerror=function(){ var fn=VOIX_FIN; VOIX_FIN=null; VOIX_A=null; if(fn)fn(); if(!lecture)return; lecture.a=null; lecture.i++; setTimeout(suivant,200); };
  if(!lecture.pause){ var p=a.play(); if(p&&p.catch)p.catch(function(){}); }
}
function suspendre(){ if(!lecture||lecture.pause)return; lecture.pause=true; if(lecture.a){ try{ lecture.a.pause(); }catch(e){} } T.querySelector('.cor-jouer').innerHTML=PLAY; }
function reprendre(){ if(!lecture||!lecture.pause)return; lecture.pause=false; T.querySelector('.cor-jouer').innerHTML=PAUSE;
  if(lecture.a){ VOIX_A=lecture.a; var p=lecture.a.play(); if(p&&p.catch)p.catch(function(){}); } else suivant(); }
function arret(){ lecture=null; coupeVoix(); if(T){ T.querySelector('.cor-jouer').innerHTML=PLAY; if(TXT[E.sur])etiquette(); } }
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
function fermeFeuilles(){ T.classList.remove('f-ecoute','f-marques','f-sourates','f-qari','f-copie','f-partage'); }
function clic(e){
  var el=e.target.closest('[data-a]'), a=el&&el.dataset.a;
  if(e.target.closest('.cor-reseaux button')){ reseau(e.target.closest('.cor-reseaux button').dataset.r); return; }
  if(e.target.closest('.cor-seg button')){ E.mode=e.target.closest('.cor-seg button').dataset.m; panneau(); return; }
  if(e.target.closest('.cor-pas button')){ var p=e.target.closest('.cor-pas'), kk=p.dataset.k; E[kk]=borne(kk,E[kk]+(+e.target.closest('.cor-pas button').dataset.d)); p.querySelector('input').value=E[kk]; etiquette(); return; }
  var s=e.target.closest('.cor-srow, .cor-mrow, .cor-reprendre');
  if(s){ var fs=e.target.closest('.fs'); fermeFeuilles(); arret(); montreLecteur(+s.dataset.s,s.dataset.k?+s.dataset.k:0); return; }
  var qr=e.target.closest('.cor-qrow');
  if(qr){ var id=qr.dataset.q; S.qari=id; try{ saveLocal(); }catch(x){} var rejoue=!!lecture&&!lecture.pause; fermeFeuilles(); /* en cours : on continue avec la nouvelle voix ; en pause : la lecture est abandonnée */ if(rejoue){ var L=lecture; arret(); lecture=L; suivant(); } else arret(); return; }
  if(!a)return;
  switch(a){
    case 'fermer': coranFermer(); break;
    case 'retour': arret(); cacheBulle(); montreListe(); break;
    case 'ferme': fermeFeuilles(); break;
    case 'sourates': ouvreFeuille('sourates'); break;
    case 'qari': listeQari(); ouvreFeuille('qari'); break;
    case 'marques': case 'marques-liste': listeMarques(); ouvreFeuille('marques'); break;
    case 'trad': var on=!el.classList.contains('on'); el.classList.toggle('on',on); el.setAttribute('aria-pressed',on?'true':'false'); el.querySelector('.cor-bx').textContent=on?'✓':''; T.classList.toggle('sans-trad',!on); ecrire(K_TRAD,on); majRail(); break;
    case 'mq': var k=+el.dataset.k, M=lire(K_MARQUES,[]), i=M.findIndex(function(m){ return m[0]===E.sur&&m[1]===k; }); if(i>=0)M.splice(i,1); else M.push([E.sur,k]); ecrire(K_MARQUES,M); el.classList.toggle('on',i<0); break;
    case 'vj': arret(); ecouter([[E.sur,+el.dataset.k]],1,false); break;
    case 'jouer': if(lecture){ if(lecture.pause)reprendre(); else suspendre(); } else ecouter(); break;
    case 'ecoute': E.v=premierVisible(); panneau(); ouvreFeuille('ecoute'); break;
    case 'boucle': E.boucle=!E.boucle; T.querySelector('.bcl').classList.toggle('on',E.boucle); etiquette(); break;
    case 'ecouter': fermeFeuilles(); arret(); ecouter(); break;
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
  monte(); montreListe(); T.classList.add('on'); fermeFeuilles();
};
window.coranFermer=function(){
  if(!T)return; arret(); cacheBulle(); fermeFeuilles(); T.classList.remove('on'); noteDerniere();
};
})();
