-- ============================================================================
-- ALAQ — PHASE B (contenu dynamique en tables) · Étape 1 : le pilote noms_allah
-- À exécuter par Myriam dans supabase.com → SQL Editor (projet ykggxipgirgjwhhxmhbn)
-- Principe : le contenu pédagogique est PUBLIC en lecture ; AUCUNE écriture par
-- l'application (pas de policy d'écriture → la RLS bloque tout). Les éditions se
-- font dans Table Editor du tableau de bord (Phase C : interface admin dans l'app).
-- ============================================================================

-- 1 · La version du contenu : une seule ligne, à incrémenter à chaque édition.
--     L'app la consulte pour savoir si son cache local est périmé (requête minuscule).
create table if not exists public.contenu_versions (
  id int primary key default 1 check (id = 1),
  version int not null default 1,
  updated_at timestamptz not null default now()
);
insert into public.contenu_versions (id, version) values (1, 1)
  on conflict (id) do nothing;
alter table public.contenu_versions enable row level security;
drop policy if exists "lecture publique" on public.contenu_versions;
create policy "lecture publique" on public.contenu_versions for select using (true);

-- 2 · Les noms d'Allah — le pilote : une ligne = un nom.
--     Ajouter un nom : insérer la ligne ici + générer son mp3 (generer-noms-allah.js)
--     + déposer le fichier audios-app-alaq/<snd>.mp3, puis version+1 dans contenu_versions.
create table if not exists public.noms_allah (
  id serial primary key,
  ordre int not null default 0,          -- ordre d'affichage dans la liste
  ar text not null unique,               -- le nom AVEC tachkīl complet
  fr text not null,                      -- la traduction française
  snd text not null,                     -- fichier audio SANS extension (ex. nom-arrahman)
  actif boolean not null default true    -- false = retiré de l'app sans supprimer la ligne
);
alter table public.noms_allah enable row level security;
drop policy if exists "lecture publique" on public.noms_allah;
create policy "lecture publique" on public.noms_allah for select using (true);

-- 3 · La graine : les 6 noms déjà en production (audios ElevenLabs en place).
insert into public.noms_allah (ordre, ar, fr, snd) values
  (1, 'الرَّحْمَٰنُ', 'le Tout-Miséricordieux',  'nom-arrahman'),
  (2, 'الرَّحِيمُ',   'le Très-Miséricordieux',  'nom-arrahim'),
  (3, 'الْمَلِكُ',    'le Roi',                  'nom-almalik'),
  (4, 'السَّلَامُ',   'la Paix',                 'nom-assalam'),
  (5, 'الْمُؤْمِنُ',  'le Rassurant',            'nom-almumin'),
  (6, 'الْعَلِيمُ',   'l''Omniscient',           'nom-alalim')
on conflict (ar) do nothing;

-- (Étapes suivantes de la Phase B, tables à venir sur le même modèle :
--  sourates → unites → lecons → ecrans(jsonb), puis vocabulaire et audios.)
