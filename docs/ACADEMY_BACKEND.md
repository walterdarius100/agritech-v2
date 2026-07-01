# Agri-tech Academy — backend

Cette étape ajoute les tables `profiles`, `academy_courses`, `academy_modules`, `academy_lessons`, `academy_resources`, `academy_enrollments`, `academy_lesson_progress` et `academy_certificates` via `supabase/migrations/20260701_create_academy_tables.sql`.

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
