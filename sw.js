/* ALAQ service worker — hors ligne complet
   Stratégie :
   - index.html / navigation : réseau d'abord (toujours la dernière version en ligne),
     cache en secours (avion, mosquée sans réseau…)
   - audios, polices, icônes : cache d'abord (rapide), réseau en secours
   - les audios de la voix de Myriam + la Fātiḥa sont pré-chargés à l'installation */
const CACHE='alaq-v11-2026-07-02';
const CORE=['.','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
const AUDIOS=[
"audios-app-alaq/ain-alif-son-prolonge.mp3",
"audios-app-alaq/ain-damma-son-court.mp3",
"audios-app-alaq/ain-fatha-son-court.mp3",
"audios-app-alaq/ain-isolee-nom-de-la-lettre.mp3",
"audios-app-alaq/ain-kasra-son-court.mp3",
"audios-app-alaq/ain-waw-son-prolonge.mp3",
"audios-app-alaq/ain-ya-son-prolonge.mp3",
"audios-app-alaq/alif-alif-son-prolonge.mp3",
"audios-app-alaq/alif-damma-son-court.mp3",
"audios-app-alaq/alif-fatha-son-court.mp3",
"audios-app-alaq/alif-isolee-nom-de-la-lettre.mp3",
"audios-app-alaq/alif-kasra-son-court.mp3",
"audios-app-alaq/alif-waw-son-prolonge.mp3",
"audios-app-alaq/alif-ya-son-prolonge.mp3",
"audios-app-alaq/ba-alif-son-prolonge.mp3",
"audios-app-alaq/ba-damma-son-court.mp3",
"audios-app-alaq/ba-fatha-son-court.mp3",
"audios-app-alaq/ba-isolee-nom-de-la-lettre.mp3",
"audios-app-alaq/ba-kasra-son-court.mp3",
"audios-app-alaq/ba-waw-son-prolonge.mp3",
"audios-app-alaq/ba-ya-son-prolonge.mp3",
"audios-app-alaq/fatiha-1.mp3",
"audios-app-alaq/fatiha-2.mp3",
"audios-app-alaq/fatiha-3.mp3",
"audios-app-alaq/fatiha-4.mp3",
"audios-app-alaq/fatiha-5.mp3",
"audios-app-alaq/fatiha-6.mp3",
"audios-app-alaq/fatiha-7.mp3",
"audios-app-alaq/hamza-isolee-nom-de-la-lettre.mp3",
"audios-app-alaq/instr-assoc-haraka.mp3",
"audios-app-alaq/instr-associe.mp3",
"audios-app-alaq/instr-attache-6-dorees.mp3",
"audios-app-alaq/instr-attache-6.mp3",
"audios-app-alaq/instr-choisis.mp3",
"audios-app-alaq/instr-combine.mp3",
"audios-app-alaq/instr-costume-glisse.mp3",
"audios-app-alaq/instr-costumes.mp3",
"audios-app-alaq/instr-deux-fois-cartes.mp3",
"audios-app-alaq/instr-dragassoc.mp3",
"audios-app-alaq/instr-dragmad.mp3",
"audios-app-alaq/instr-ecoute-reponse.mp3",
"audios-app-alaq/instr-ecris-arabe.mp3",
"audios-app-alaq/instr-ecris-ecoute.mp3",
"audios-app-alaq/instr-explore-3.mp3",
"audios-app-alaq/instr-explore-cases.mp3",
"audios-app-alaq/instr-glisse-gd.mp3",
"audios-app-alaq/instr-haraka-intro.mp3",
"audios-app-alaq/instr-hp-choisis.mp3",
"audios-app-alaq/instr-lettre-nom.mp3",
"audios-app-alaq/instr-madrasatoun.mp3",
"audios-app-alaq/instr-mot-ecoute.mp3",
"audios-app-alaq/instr-prolong-deux.mp3",
"audios-app-alaq/instr-prolong-dorees.mp3",
"audios-app-alaq/instr-prolong-intro.mp3",
"audios-app-alaq/instr-son-long.mp3",
"audios-app-alaq/instr-spot-verset.mp3",
"audios-app-alaq/instr-touche-droite.mp3",
"audios-app-alaq/instr-trace.mp3",
"audios-app-alaq/lam-alif-son-prolonge.mp3",
"audios-app-alaq/lam-damma-son-court.mp3",
"audios-app-alaq/lam-fatha-son-court.mp3",
"audios-app-alaq/lam-isolee-nom-de-la-lettre.mp3",
"audios-app-alaq/lam-kasra-son-court.mp3",
"audios-app-alaq/lam-waw-son-prolonge.mp3",
"audios-app-alaq/lam-ya-son-prolonge.mp3",
"audios-app-alaq/mim-alif-son-prolonge.mp3",
"audios-app-alaq/mim-damma-son-court.mp3",
"audios-app-alaq/mim-fatha-son-court.mp3",
"audios-app-alaq/mim-isolee-nom-de-la-lettre.mp3",
"audios-app-alaq/mim-kasra-son-court.mp3",
"audios-app-alaq/mim-waw-son-prolonge.mp3",
"audios-app-alaq/mim-ya-son-prolonge.mp3",
"audios-app-alaq/mot-aalim.mp3",
"audios-app-alaq/mot-alam.mp3",
"audios-app-alaq/mot-alamoun.mp3",
"audios-app-alaq/mot-alim.mp3",
"audios-app-alaq/mot-amal.mp3",
"audios-app-alaq/mot-aman.mp3",
"audios-app-alaq/mot-amin.mp3",
"audios-app-alaq/mot-amr.mp3",
"audios-app-alaq/mot-arabi.mp3",
"audios-app-alaq/mot-ayn.mp3",
"audios-app-alaq/mot-bab.mp3",
"audios-app-alaq/mot-iman.mp3",
"audios-app-alaq/mot-laban.mp3",
"audios-app-alaq/mot-lamma.mp3",
"audios-app-alaq/mot-lawm.mp3",
"audios-app-alaq/mot-lawn.mp3",
"audios-app-alaq/mot-layl.mp3",
"audios-app-alaq/mot-lin.mp3",
"audios-app-alaq/mot-mal.mp3",
"audios-app-alaq/mot-mamnoun.mp3",
"audios-app-alaq/mot-manal.mp3",
"audios-app-alaq/mot-manam.mp3",
"audios-app-alaq/mot-mann.mp3",
"audios-app-alaq/mot-nabi.mp3",
"audios-app-alaq/mot-naml.mp3",
"audios-app-alaq/mot-nil.mp3",
"audios-app-alaq/mot-noun.mp3",
"audios-app-alaq/mot-oulama.mp3",
"audios-app-alaq/mot-rabb.mp3",
"audios-app-alaq/mot-rabi.mp3",
"audios-app-alaq/mot-umm.mp3",
"audios-app-alaq/mot-umr.mp3",
"audios-app-alaq/mot-yamin.mp3",
"audios-app-alaq/mot-yawm.mp3",
"audios-app-alaq/noun-alif-son-prolonge.mp3",
"audios-app-alaq/noun-damma-son-court.mp3",
"audios-app-alaq/noun-fatha-son-court.mp3",
"audios-app-alaq/noun-isolee-nom-de-la-lettre.mp3",
"audios-app-alaq/noun-kasra-son-court.mp3",
"audios-app-alaq/noun-waw-son-prolonge.mp3",
"audios-app-alaq/noun-ya-son-prolonge.mp3",
"audios-app-alaq/ra-alif-son-prolonge.mp3",
"audios-app-alaq/ra-damma-son-court.mp3",
"audios-app-alaq/ra-fatha-son-court.mp3",
"audios-app-alaq/ra-isolee-nom-de-la-lettre.mp3",
"audios-app-alaq/ra-kasra-son-court.mp3",
"audios-app-alaq/ra-waw-son-prolonge.mp3",
"audios-app-alaq/ra-ya-son-prolonge.mp3",
"audios-app-alaq/waw-alif-son-prolonge.mp3",
"audios-app-alaq/waw-damma-son-court.mp3",
"audios-app-alaq/waw-fatha-son-court.mp3",
"audios-app-alaq/waw-isolee-nom-de-la-lettre.mp3",
"audios-app-alaq/waw-kasra-son-court.mp3",
"audios-app-alaq/waw-waw-son-prolonge.mp3",
"audios-app-alaq/waw-ya-son-prolonge.mp3",
"audios-app-alaq/ya-alif-son-prolonge.mp3",
"audios-app-alaq/ya-damma-son-court.mp3",
"audios-app-alaq/ya-fatha-son-court.mp3",
"audios-app-alaq/ya-isolee-nom-de-la-lettre.mp3",
"audios-app-alaq/ya-kasra-son-court.mp3",
"audios-app-alaq/ya-waw-son-prolonge.mp3",
"audios-app-alaq/ya-ya-son-prolonge.mp3"
];

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE);
    // le cœur d'abord (obligatoire), puis les audios un par un (tolérant aux absents)
    await c.addAll(CORE);
    await Promise.allSettled(AUDIOS.map(u=>c.add(u).catch(()=>{})));
    self.skipWaiting();
  })());
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  // navigation / index : réseau d'abord, cache en secours
  if(e.request.mode==='navigate'||url.pathname.endsWith('/index.html')||url.pathname==='/'){
    e.respondWith((async()=>{
      try{
        const r=await fetch(e.request);
        const c=await caches.open(CACHE);
        c.put('index.html',r.clone());
        return r;
      }catch(_){
        return (await caches.match('index.html'))||(await caches.match('.'))||Response.error();
      }
    })());
    return;
  }
  // audios, polices Google, récitation, icônes : cache d'abord
  const cacheFirst=url.pathname.indexOf('/audios-app-alaq/')>=0
    ||url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com'
    ||url.hostname==='everyayah.com'
    ||/\.(png|jpe?g|mp3|woff2?)$/.test(url.pathname);
  if(cacheFirst){
    e.respondWith((async()=>{
      const hit=await caches.match(e.request);
      if(hit)return hit;
      try{
        const r=await fetch(e.request);
        if(r&&(r.ok||r.type==='opaque')){const c=await caches.open(CACHE);c.put(e.request,r.clone());}
        return r;
      }catch(_){return Response.error();}
    })());
  }
});
