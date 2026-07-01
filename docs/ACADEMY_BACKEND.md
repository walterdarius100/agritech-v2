# Agri-tech Academy — backend

Cette étape ajoute les tables `profiles`, `academy_courses`, `academy_modules`, `academy_lessons`, `academy_resources`, `academy_enrollments`, `academy_lesson_progress` et `academy_certificates` via `supabase/migrations/20260701_create_academy_tables.sql`.

La migration `supabase/migrations/20260701_seed_academy_courses_from_formations.sql` relie les formations publiques existantes à Academy avec les mêmes slugs :

```txt
elevage-poulets-de-chair
elevage-poules-pondeuses
cuniculture-pratique
apiculture-pratique
pisciculture
production-vegetale
gestion-projet-agricole
```

Schéma :

```txt
auth.users
  → profiles
  → academy_enrollments
  → academy_courses
  → academy_lesson_progress
  → academy_certificates
```

RLS : les cours publiés sont publics, les leçons publiques sont limitées aux aperçus, les inscriptions/progressions/certificats étudiants sont filtrés sur `auth.uid()`. Les opérations admin utilisent la service role côté serveur uniquement.

Variables nécessaires : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAILS`.

Limites : pas de paiement automatique, pas d’upload Storage obligatoire et pas de PDF généré automatiquement.

## Debug accès étudiant après enrollment

Quand un cours validé n’apparaît pas côté étudiant, vérifier dans `academy_enrollments` :

```txt
student_id = id Supabase Auth de l’étudiant
course_id = id du cours dans academy_courses
status in ('active', 'completed')
expires_at vide ou dans le futur
```

Le dashboard et `/academy/mes-cours` lisent les enrollments côté serveur avec la service role, puis chargent explicitement les cours par `course_id`. Cette lecture en deux étapes évite de dépendre d’une relation PostgREST implicite entre `academy_enrollments` et `academy_courses`.

`ADMIN_EMAILS` ne concerne pas les étudiants. Il sert uniquement à autoriser `/admin/*`.
