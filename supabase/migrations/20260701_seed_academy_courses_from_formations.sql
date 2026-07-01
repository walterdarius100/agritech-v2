-- Non-destructive seed that links existing public formation slugs to Academy courses.
insert into public.academy_courses (
  title, slug, category, short_description, description, cover_image_url, level, duration,
  language, status, price_currency, is_free, published_at
)
values
  ('Formation en élevage de poulets de chair', 'elevage-poulets-de-chair', 'Aviculture', 'Apprendre les bases techniques pour démarrer et conduire un élevage de poulets de chair avec plus de méthode.', 'Parcours Academy lié à la formation publique existante.', '/images/formations/formation-poulet.jpg', 'beginner', 'À définir', 'fr', 'published', 'HTG', false, now()),
  ('Formation en élevage de poules pondeuses', 'elevage-poules-pondeuses', 'Aviculture', 'Comprendre l’installation, l’alimentation, le suivi sanitaire et l’organisation d’un projet de poules pondeuses.', 'Parcours Academy lié à la formation publique existante.', '/images/formations/poule-pondeuse.jpg', 'beginner', 'À définir', 'fr', 'published', 'HTG', false, now()),
  ('Formation pratique en cuniculture', 'cuniculture-pratique', 'Cuniculture', 'Se former aux bases de l’élevage de lapins : logement, alimentation, reproduction, hygiène et suivi.', 'Cette formation donne une base claire pour démarrer un petit élevage de lapins avec des pratiques simples, progressives et adaptées aux moyens disponibles.', '/images/services/cuniculture.jpg', 'beginner', 'À définir', 'fr', 'published', 'HTG', false, now()),
  ('Formation pratique en apiculture', 'apiculture-pratique', 'Apiculture', 'Découvrir les bases de l’apiculture, la conduite d’un rucher et les bonnes pratiques de suivi des colonies.', 'Parcours Academy lié à la formation publique existante.', '/images/formations/apiculture.jpg', 'beginner', 'À définir', 'fr', 'published', 'HTG', false, now()),
  ('Formation en pisciculture', 'pisciculture', 'Pisciculture', 'Comprendre les principes de base pour concevoir, organiser et suivre un projet d’élevage de poissons.', 'Parcours Academy lié à la formation publique existante.', '/images/services/pisciculture.jpg', 'beginner', 'À définir', 'fr', 'published', 'HTG', false, now()),
  ('Formation en production végétale', 'production-vegetale', 'Production végétale', 'Renforcer ses bases en cultures, pépinière, pratiques culturales et organisation d’une production végétale.', 'Parcours Academy lié à la formation publique existante.', '/images/services/pepiniere.jpg', 'beginner', 'À définir', 'fr', 'published', 'HTG', false, now()),
  ('Formation en gestion de projet agricole', 'gestion-projet-agricole', 'Gestion agricole', 'Apprendre à structurer une idée agricole, estimer les besoins, organiser les étapes et mieux préparer son projet.', 'Parcours Academy lié à la formation publique existante.', '/images/services/gabionnage.jpg', 'beginner', 'À définir', 'fr', 'published', 'HTG', false, now())
on conflict (slug) do nothing;

create unique index if not exists academy_modules_course_title_idx on public.academy_modules(course_id, title);
create unique index if not exists academy_lessons_course_title_idx on public.academy_lessons(course_id, title);
create unique index if not exists academy_resources_course_title_idx on public.academy_resources(course_id, title);

with course as (
  select id from public.academy_courses where slug = 'cuniculture-pratique'
)
insert into public.academy_modules (course_id, title, description, position, status)
select course.id, module.title, module.description, module.position, 'published'
from course
cross join (values
  ('Module 1 : Introduction à la cuniculture', 'Intérêt de l’élevage de lapins et organisation d’un petit atelier.', 1),
  ('Module 2 : Logement et matériel', 'Cages, abris, ventilation, nettoyage et confort des animaux.', 2),
  ('Module 3 : Alimentation et reproduction', 'Rations de base, accouplement, gestation et sevrage.', 3),
  ('Module 4 : Hygiène et prévention', 'Observation quotidienne et prévention des maladies fréquentes.', 4)
) as module(title, description, position)
on conflict (course_id, title) do nothing;

with course as (
  select id from public.academy_courses where slug = 'cuniculture-pratique'
), module_map as (
  select m.id, m.title from public.academy_modules m join course c on c.id = m.course_id
)
insert into public.academy_lessons (course_id, module_id, title, content, video_url, position, is_preview, duration, status)
select course.id, module_map.id, lesson.title, lesson.content, lesson.video_url, lesson.position, lesson.is_preview, lesson.duration, 'published'
from course
cross join lateral (values
  ('Module 1 : Introduction à la cuniculture', 'Intérêt de l’élevage de lapins', 'Pourquoi intégrer la cuniculture dans un projet agricole et comment définir un objectif simple.', null, 1, true, '15 min'),
  ('Module 1 : Introduction à la cuniculture', 'Organisation d’un petit atelier', 'Principes d’organisation, espaces propres/sales, planning et suivi quotidien.', null, 2, false, '20 min'),
  ('Module 2 : Logement et matériel', 'Cages, abris et ventilation', 'Choisir un espace ventilé, sec et facile à nettoyer pour réduire les pertes.', null, 3, false, '25 min'),
  ('Module 2 : Logement et matériel', 'Nettoyage et confort des animaux', 'Routines de nettoyage, litière, abreuvoirs et observation du comportement.', null, 4, false, '20 min'),
  ('Module 3 : Alimentation et reproduction', 'Rations de base', 'Composer des rations simples et surveiller l’eau, l’appétit et l’état corporel.', null, 5, false, '20 min'),
  ('Module 3 : Alimentation et reproduction', 'Accouplement, gestation et sevrage', 'Points de vigilance pour la reproduction et la conduite des jeunes lapins.', null, 6, false, '25 min'),
  ('Module 4 : Hygiène et prévention', 'Observation quotidienne', 'Reconnaître rapidement les signaux d’alerte et adapter les actions.', null, 7, false, '15 min'),
  ('Module 4 : Hygiène et prévention', 'Prévention des maladies fréquentes', 'Mesures simples d’hygiène, isolement et tenue des fiches de suivi.', null, 8, false, '20 min')
) as lesson(module_title, title, content, video_url, position, is_preview, duration)
join module_map on module_map.title = lesson.module_title
on conflict (course_id, title) do nothing;

with course as (
  select id from public.academy_courses where slug = 'cuniculture-pratique'
)
insert into public.academy_resources (course_id, title, description, external_url, resource_type, is_downloadable, position)
select course.id, resource.title, resource.description, resource.external_url, resource.resource_type, true, resource.position
from course
cross join (values
  ('Fiche de suivi cuniculture', 'Modèle simple de suivi quotidien pour lapins.', '/contact', 'document', 1),
  ('Checklist hygiène', 'Liste de contrôle pour nettoyage, observation et prévention.', '/contact', 'document', 2)
) as resource(title, description, external_url, resource_type, position)
on conflict (course_id, title) do nothing;
