-- ============================================================================
-- ALAQ — PHASE B · Étape 2 : le VOCABULAIRE des unités et les VERSETS en tables
-- À exécuter par Myriam dans supabase.com → SQL Editor (après phase-b-tables.sql)
-- Même principe que noms_allah : lecture PUBLIQUE, aucune écriture par l'app —
-- les éditions se font dans Table Editor. Le code de l'app garde une graine
-- identique (1er chargement / hors-ligne) : exécuter ce script ne change RIEN
-- visuellement tant qu'on n'édite pas une ligne. Éditer une ligne = l'app suit.
-- ============================================================================

-- 1 · Le vocabulaire des unités : une ligne = un mot enseigné.
--    ar     = le mot AVEC tachkīl (clé d'identité : les révisions des élèves y sont accrochées,
--             NE PAS le modifier après coup — corriger plutôt fr/emoji/say/confus)
--    b      = le mot sans tachkīl (recherche dans les versets)
--    confus = les 3 distracteurs visuellement proches (règle : jamais de simple
--             variation de terminaison casuelle)
--    snd    = fichier audio SANS extension (audios-app-alaq/<snd>.mp3)
create table if not exists public.vocabulaire (
  id serial primary key,
  unite_no int not null,
  ordre int not null default 0,
  ar text not null unique,
  b text,
  fr text not null,
  emoji text,
  say text,
  confus jsonb not null default '[]'::jsonb,
  snd text,
  actif boolean not null default true
);
alter table public.vocabulaire enable row level security;
drop policy if exists "lecture publique" on public.vocabulaire;
create policy "lecture publique" on public.vocabulaire for select using (true);

-- 2 · Les versets : une ligne = un verset d'une sourate.
--    tr = la traduction MOT À MOT (tableau aligné sur les mots du verset)
create table if not exists public.versets (
  id serial primary key,
  sourate_no int not null,
  num int not null,
  ar text not null,
  tr jsonb not null default '[]'::jsonb,
  actif boolean not null default true,
  unique (sourate_no, num)
);
alter table public.versets enable row level security;
drop policy if exists "lecture publique" on public.versets;
create policy "lecture publique" on public.versets for select using (true);

-- 3 · La graine : les 76 mots des 7 unités + les 7 versets d'Al-Fātiḥa,
--    extraits À L'IDENTIQUE du code en production (BUILD 13/07g).

insert into public.vocabulaire (unite_no, ordre, ar, b, fr, emoji, say, confus, snd) values
  (1, 1, 'نَمْلٌ', 'نمل', 'une fourmi', '🐜', 'naml', '["نَامِل","نَمالٌ","مَنْلٌ"]'::jsonb, 'mot-naml'),
  (1, 2, 'مَنٌّ', 'من', 'de la manne', '🍯', 'mann', '["مَنْ","نَمٌّ","مَانٌ"]'::jsonb, 'mot-mann'),
  (1, 3, 'مَنَالٌ', 'منال', 'Manal (un prénom)', '🎯', 'manāl', '["مِنَالٌ","نَمَالٌ","مَنَّالٌ"]'::jsonb, 'mot-manal'),
  (1, 4, 'مَالٌ', 'مال', 'des biens', '💰', 'mal', '["مالَ","مَلٌّ","مِيلٌ"]'::jsonb, 'mot-mal'),
  (1, 5, 'مَنَامٌ', 'منام', 'un sommeil, un songe', '😴', 'manām', '["مِنَامٌ","نَمَامٌ","مَنَّامٌ"]'::jsonb, 'mot-manam'),
  (1, 6, 'نِيلٌ', 'نيل', 'le Nil', '🌊', 'nil', '["نَيْلٌ","نِلٌّ","لِينٌ"]'::jsonb, 'mot-nil'),
  (1, 7, 'نُونٌ', 'نون', 'un poisson', '🐟', 'noun', '["نَوْنٌ","نُنٌّ","نَانٌ"]'::jsonb, 'mot-noun'),
  (1, 8, 'لِينٌ', 'لين', 'de la douceur', '🌿', 'lin', '["لَيْنٌ","لِنٌّ","نِيلٌ"]'::jsonb, 'mot-lin'),
  (1, 9, 'لَمَّا', 'لما', 'lorsque', '⏳', 'lammā', '["مالَ","لَما","لَامّا"]'::jsonb, 'mot-lamma'),
  (2, 1, 'يَوْمٌ', 'يوم', 'un jour', '☀️', 'yawm', '["يُومٌ","يَوْنٌ","يَوْلٌ"]'::jsonb, 'mot-yawm'),
  (2, 2, 'لَيْلٌ', 'ليل', 'une nuit', '🌙', 'layl', '["لِيلٌ","لَيْنٌ","أَيْلٌ"]'::jsonb, 'mot-layl'),
  (2, 3, 'لَوْنٌ', 'لون', 'une couleur', '🎨', 'lawn', '["لُونٌ","لَوْلٌ","نَوْنٌ"]'::jsonb, 'mot-lawn'),
  (2, 4, 'لَوْمٌ', 'لوم', 'un blâme', '😣', 'lawm', '["لُومٌ","لَوْنٌ","أَوْمٌ"]'::jsonb, 'mot-lawm'),
  (2, 5, 'أَلِيمٌ', 'أليم', 'douloureux', '💔', 'alīm', '["إِلِيمٌ","أَلِمٌ","أَنِيمٌ"]'::jsonb, 'mot-alim'),
  (2, 6, 'إِيمَانٌ', 'إيمان', 'de la foi', '🤲', 'īmān', '["أَيْمَانٌ","إِيمَالٌ","إِمَانٌ"]'::jsonb, 'mot-iman'),
  (2, 7, 'أُمٌّ', 'أم', 'une mère', '👩', 'umm', '["أُمْ","أُنٌّ","أَمٌّ"]'::jsonb, 'mot-umm'),
  (2, 8, 'أَمِينٌ', 'أمين', 'digne de confiance', '🤝', 'amīn', '["أَمِنٌ","أَمِيلٌ","نَمِينٌ"]'::jsonb, 'mot-amin'),
  (2, 9, 'يَمِينٌ', 'يمين', 'une main droite', '✋', 'yamīn', '["يَمِنٌ","يَمِيلٌ","لَمِينٌ"]'::jsonb, 'mot-yamin'),
  (2, 10, 'أَمَانٌ', 'أمان', 'de la sécurité', '🛡️', 'amān', '["أَمَالٌ","أَمَنٌ","أَنَامٌ"]'::jsonb, 'mot-aman'),
  (2, 11, 'مَمْنُونٌ', 'ممنون', 'interrompu, diminué', '➖', 'mamnūn', '["مَمْنُنٌ","مَنْمُونٌ","مَمْنُومٌ"]'::jsonb, 'mot-mamnoun'),
  (3, 1, 'رَبٌّ', 'رب', 'un maître, un seigneur', '🤲', 'rabb', '["بَرٌّ","رَبْ","رَنٌّ"]'::jsonb, 'mot-rabb'),
  (3, 2, 'عَرَبِيٌّ', 'عربي', 'arabe', '🗣️', 'ʿarabī', '["عَرَبِيْ","عَرَبِيٍّ","عَرَنِيٌّ"]'::jsonb, 'mot-arabi'),
  (3, 3, 'عَيْنٌ', 'عين', 'un œil, une source', '👁️', 'ʿayn', '["عَيْمٌ","أَيْنٌ","عَيْنْ"]'::jsonb, 'mot-ayn'),
  (3, 4, 'لَبَنٌ', 'لبن', 'du lait', '🥛', 'laban', '["لَبَمٌ","نَبَنٌ","لَبَنْ"]'::jsonb, 'mot-laban'),
  (3, 5, 'بَابٌ', 'باب', 'une porte', '🚪', 'bāb', '["نَابٌ","بَانٌ","بَابْ"]'::jsonb, 'mot-bab'),
  (3, 6, 'نَبِيٌّ', 'نبي', 'un prophète', '☪️', 'nabī', '["نَبِيْ","بَنِيٌّ","نَبِيٍّ"]'::jsonb, 'mot-nabi'),
  (3, 7, 'عَمَلٌ', 'عمل', 'une action, une œuvre', '🛠️', 'ʿamal', '["عَمَنٌ","أَمَلٌ","عَمَلْ"]'::jsonb, 'mot-amal'),
  (3, 8, 'عَالَمٌ', 'عالم', 'un monde', '🌍', 'ʿālam', '["عَالِمٌ","عَالَنٌ","عَالَمْ"]'::jsonb, 'mot-alam'),
  (3, 9, 'عَالَمُونَ', 'عالمون', 'des mondes', '🌌', 'ʿālamūn', '["عَالِمُونَ","عَالَمُونْ","عَالَمَونَ"]'::jsonb, 'mot-alamoun'),
  (3, 10, 'عَالِمٌ', 'عالم', 'un savant', '🧑‍🏫', 'ʿālim', '["عَالَمٌ","عَالِمْ","عَالِنٌ"]'::jsonb, 'mot-aalim'),
  (3, 11, 'عُلَمَاءُ', 'علماء', 'des savants', '👥', 'ʿulamāʾ', '["عُلَمَاءٌ","عَلَمَاءُ","عُلُمَاءُ"]'::jsonb, 'mot-oulama'),
  (3, 12, 'أَمْرٌ', 'أمر', 'un ordre, une affaire', '📜', 'amr', '["أَمْنٌ","أُمْرٌ","أَمْرْ"]'::jsonb, 'mot-amr'),
  (3, 13, 'رَبِيعٌ', 'ربيع', 'un printemps', '🌸', 'rabīʿ', '["رَبِيعْ","رَنِيعٌ","رَبِيعٍ"]'::jsonb, 'mot-rabi'),
  (3, 14, 'عُمْرٌ', 'عمر', 'une durée de vie, un âge', '⏳', 'ʿumr', '["عُمْرْ","عَمْرٌ","عُمْنٌ"]'::jsonb, 'mot-umr'),
  (4, 1, 'دَرْسٌ', 'درس', 'une leçon', '📖', 'dars', '["دَرَسٌ","دَرْنٌ","رَرْسٌ"]'::jsonb, 'mot-dars'),
  (4, 2, 'كَرِيمٌ', 'كريم', 'généreux, noble', '🌟', 'karīm', '["كَبِيرٌ","رَكِيمٌ","كَرِيبٌ"]'::jsonb, 'mot-karim'),
  (4, 3, 'دِينٌ', 'دين', 'une religion, une rétribution', '🕋', 'dīn', '["دَينٌ","رِينٌ","دِيمٌ"]'::jsonb, 'mot-din'),
  (4, 4, 'إِيَّاكَ', 'إياك', 'c’est Toi (que)', '🤲', 'iyyāka', '["إِيَّاكِ","إِيَّانَ","إِنَّاكَ"]'::jsonb, 'mot-iyyaka'),
  (4, 5, 'نَعْبُدُ', 'نعبد', 'nous adorons', '🙏', 'naʿbudu', '["نَعْبُدٌ","يَعْبُدُ","نَعْبُرُ"]'::jsonb, 'mot-naabudu'),
  (4, 6, 'النَّاسُ', 'الناس', 'les gens, l’humanité', '👥', 'an-nās', '["المَّاسُ","النَّابُ","الرَّاسُ"]'::jsonb, 'mot-annas'),
  (4, 7, 'مَالِكٌ', 'مالك', 'souverain, maître', '👑', 'mālik', '["كَامِلٌ","مَالِنٌ","مَابِكٌ"]'::jsonb, 'mot-maalik'),
  (4, 8, 'مَلِكٌ', 'ملك', 'un roi', '🤴', 'malik', '["مِلْكٌ","كَلِمٌ","مَنِكٌ"]'::jsonb, 'mot-malik'),
  (4, 9, 'كَسَبَ', 'كسب', 'il a acquis, il a gagné', '🎯', 'kasaba', '["سَكَبَ","كَسَرَ","كَبَسَ"]'::jsonb, 'mot-kasaba'),
  (4, 10, 'بِسْمِ', 'بسم', 'au nom de', '🔑', 'bismi', '["بِمْسِ","مِسْبِ","بِسْرِ"]'::jsonb, 'mot-bismi'),
  (5, 1, 'الْحَمْدُ', 'الحمد', 'la louange', '✨', 'al-ḥamdou', '["الْحَمَلُ","الْمَحْدُ","الْحَبْدُ"]'::jsonb, 'mot-alhamdu'),
  (5, 2, 'الرَّحْمَٰنُ', 'الرحمن', 'le Tout-Miséricordieux', '💛', 'ar-raḥmān', '["الرَّمْحَنُ","الرَّحْمَلُ","الرَّحْنَمُ"]'::jsonb, 'nom-arrahman'),
  (5, 3, 'الرَّحِيمُ', 'الرحيم', 'le Très-Miséricordieux', '💗', 'ar-raḥīm', '["الرَّحِيبُ","الرَّمِيحُ","الرَّحِينُ"]'::jsonb, 'nom-arrahim'),
  (5, 4, 'قُلْ', 'قل', 'dis !', '💬', 'qoul', '["قُمْ","لُقْ","قُبْ"]'::jsonb, 'mot-qul'),
  (5, 5, 'أَحَدٌ', 'أحد', 'un, unique', '☝️', 'aḥad', '["أَحَرٌ","أَدَحٌ","أَحَمٌ"]'::jsonb, 'mot-ahad'),
  (5, 6, 'حَاسِدٌ', 'حاسد', 'un envieux', '😒', 'ḥāsid', '["حَاسِرٌ","سَاحِدٌ","حَادِسٌ"]'::jsonb, 'mot-hasid'),
  (5, 7, 'عُقَدٌ', 'عقد', 'des nœuds', '🪢', 'ʿouqad', '["عُقَرٌ","قُعَدٌ","عُدَقٌ"]'::jsonb, 'mot-uqad'),
  (5, 8, 'وَقَبَ', 'وقب', 'elle s’installe (la nuit)', '🌒', 'waqaba', '["وَقَدَ","وَبَقَ","قَوَبَ"]'::jsonb, 'mot-waqaba'),
  (5, 9, 'طَرِيقٌ', 'طريق', 'un chemin', '🛣️', 'ṭarīq', '["طَرِيدٌ","قَرِيطٌ","طَبِيقٌ"]'::jsonb, 'mot-tariq'),
  (5, 10, 'حَطَبٌ', 'حطب', 'du bois (de feu)', '🪵', 'ḥaṭab', '["حَبَطٌ","طَحَبٌ","حَطَرٌ"]'::jsonb, 'mot-hatab'),
  (6, 1, 'صِرَاطٌ', 'صراط', 'un chemin, une voie', '🛤️', 'ṣirāṭ', '["صِرَاعٌ","صِرَاقٌ","طِرَاصٌ"]'::jsonb, 'mot-sirat'),
  (6, 2, 'مُسْتَقِيمٌ', 'مستقيم', 'droit', '📏', 'moustaqīm', '["مُسْتَقِينٌ","مُسْتَطِيمٌ","مُتْسَقِيمٌ"]'::jsonb, 'mot-mustaqim'),
  (6, 3, 'نَسْتَعِينُ', 'نستعين', 'nous implorons l’aide', '🤲', 'nastaʿīn', '["يَسْتَعِينُ","نَسْتَعِيمُ","نَسْتَغِينُ"]'::jsonb, 'mot-nastain'),
  (6, 4, 'أَنْعَمْتَ', 'أنعمت', 'Tu as comblé de bienfaits', '🎁', 'anʿamta', '["أَنْعَمْنَ","أَعْنَمْتَ","أَنْغَمْتَ"]'::jsonb, 'mot-anamta'),
  (6, 5, 'غَيْر', 'غير', 'autre que, excepté', '🚫', 'ghayr', '["عَيْر","غَيْن","غَبْر"]'::jsonb, 'mot-ghayr'),
  (6, 6, 'الصَّمَدُ', 'الصمد', 'l’Absolu, Celui dont tout dépend', '🏔️', 'aṣ-ṣamad', '["الصَّمَرُ","الصَّدَمُ","السَّمَدُ"]'::jsonb, 'mot-assamad'),
  (6, 7, 'صُدُورٌ', 'صدور', 'des poitrines', '🫀', 'ṣoudour', '["صُدُودٌ","صُرُودٌ","سُدُورٌ"]'::jsonb, 'mot-sudur'),
  (6, 8, 'غَاسِقٌ', 'غاسق', 'une nuit noire', '🌑', 'ghāsiq', '["غَاسِبٌ","عَاسِقٌ","غَاقِسٌ"]'::jsonb, 'mot-ghasiq'),
  (6, 9, 'صَبْرٌ', 'صبر', 'la patience', '🌱', 'ṣabr', '["سَبْرٌ","صَرْبٌ","صَبْدٌ"]'::jsonb, 'mot-sabr'),
  (6, 10, 'غَيْبٌ', 'غيب', 'l’invisible', '🌌', 'ghayb', '["عَيْبٌ","غَيْمٌ","غَيْتٌ"]'::jsonb, 'mot-ghayb'),
  (6, 11, 'تَبَّ', 'تب', 'il a péri', '🥀', 'tabba', '["تَبَّتْ","بَتَّ","تَنَّ"]'::jsonb, 'mot-tabba'),
  (7, 1, 'اللَّهُ', 'الله', 'Allah', '🕋', 'allāh', '["لِلَّهِ","اللَّهُمَّ","لَهُ"]'::jsonb, 'mot-allah'),
  (7, 2, 'اهْدِنَا', 'اهدنا', 'guide-nous', '🧭', 'ihdinā', '["اهْدِمَا","هَدَانَا","اهْدِيَا"]'::jsonb, 'mot-ihdina'),
  (7, 3, 'الَّذِينَ', 'الذين', 'ceux que, ceux qui', '👥', 'alladhīna', '["الَّذِي","الَّذَيْنِ","الَّدِينَ"]'::jsonb, 'mot-alladhina'),
  (7, 4, 'عَلَيْهِمْ', 'عليهم', 'envers eux, sur eux', '👆', 'ʿalayhim', '["عَلَيْكُمْ","إِلَيْهِمْ","عَلَيْهِنَّ"]'::jsonb, 'mot-alayhim'),
  (7, 5, 'الْمَغْضُوبِ', 'المغضوب', 'ceux qui ont encouru la colère', '⚡', 'al-maghḍoub', '["الْمَعْضُوبِ","الْمَغْصُوبِ","الْمَضْغُوبِ"]'::jsonb, 'mot-almaghdub'),
  (7, 6, 'الضَّالِّينَ', 'الضالين', 'les égarés', '🌫️', 'aḍ-ḍāllīn', '["الصَّالِّينَ","الضَّامِّينَ","الضَّالِّيلَ"]'::jsonb, 'mot-addallin'),
  (7, 7, 'هُوَ', 'هو', 'Lui', '👤', 'houwa', '["هِيَ","هُمْ","هُنَّ"]'::jsonb, 'mot-huwa'),
  (7, 8, 'أَعُوذُ', 'أعوذ', 'je cherche refuge', '🛡️', 'aʿoudhou', '["أَعُودُ","نَعُوذُ","يَعُوذُ"]'::jsonb, 'mot-audhu'),
  (7, 9, 'إِلَٰهٌ', 'إله', 'une divinité', '🕌', 'ilāh', '["إِلَيْهِ","إِلَٰهِي","هِلَالٌ"]'::jsonb, 'mot-ilah'),
  (7, 10, 'إِذَا', 'إذا', 'lorsque, quand', '⏱️', 'idhā', '["إِذْ","إِدَا","ذَا"]'::jsonb, 'mot-idha'),
  (7, 11, 'ذَهَبَ', 'ذهب', 'il est allé, il est parti', '🚶', 'dhahaba', '["دَهَبَ","وَهَبَ","ذَهَلَ"]'::jsonb, 'mot-dhahaba')
on conflict (ar) do nothing;

insert into public.versets (sourate_no, num, ar, tr) values
  (1, 1, 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '["Au nom","d’Allah","le Tout-Miséricordieux","le Très-Miséricordieux"]'::jsonb),
  (1, 2, 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', '["la louange","est à Allah","Seigneur","des mondes"]'::jsonb),
  (1, 3, 'الرَّحْمَٰنِ الرَّحِيمِ', '["le Tout-Miséricordieux","le Très-Miséricordieux"]'::jsonb),
  (1, 4, 'مَالِكِ يَوْمِ الدِّينِ', '["Souverain","du Jour","de la Rétribution"]'::jsonb),
  (1, 5, 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', '["c’est Toi que","nous adorons","et c’est Toi que","nous implorons l’aide"]'::jsonb),
  (1, 6, 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', '["guide-nous","sur le chemin","droit"]'::jsonb),
  (1, 7, 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', '["le chemin","de ceux que","Tu as comblés de bienfaits","envers eux","non pas","ceux qui ont encouru la colère","envers eux","ni","les égarés"]'::jsonb)
on conflict (sourate_no, num) do nothing;
