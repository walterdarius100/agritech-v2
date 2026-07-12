# Audit Academy — progression, enrollments et certificats

Date de l'audit : 2026-07-12.

## 1. Résumé exécutif

Ce PR est volontairement documentaire. Il ne crée pas de certificat, ne modifie pas la progression, ne modifie pas les paiements, ne touche pas au bouton **« leçon terminée »** et n'ajoute aucune migration Supabase.

Constats principaux :

- Le modèle Academy repose sur `academy_courses`, `academy_modules`, `academy_lessons`, `academy_resources`, `academy_enrollments`, `academy_lesson_progress`, `academy_certificates`, `academy_payments` et `profiles`.
- L'accès à une formation est accordé si une inscription `academy_enrollments` a un statut `active` ou `completed` et n'est pas expirée.
- La progression est calculée à partir des leçons publiées et des lignes `academy_lesson_progress.is_completed = true`.
- Une formation est considérée terminée côté interface si le pourcentage calculé atteint 100 %, mais il n'existe pas de champ `completed_at` sur `academy_enrollments` et le statut `completed` n'est pas automatiquement appliqué par l'action de progression actuelle.
- Une table `academy_certificates` existe déjà, mais elle n'est pas reliée à `academy_enrollments` et ne contient pas encore `metadata`.
- Une interface admin permet déjà d'émettre manuellement un certificat. Pour la reconstruction demandée, il faudra éviter de brancher une génération automatique directement sur le bouton de progression tant que la condition de complétion n'est pas stabilisée.

## 2. Fichiers inspectés

### Parcours étudiant Academy

| Zone | Fichiers | Rôle observé |
| --- | --- | --- |
| Catalogue | `src/app/academy/page.tsx`, `src/components/academy/CourseCard.tsx`, `src/lib/academy/courses.ts` | Liste les cours publiés depuis `academy_courses`. |
| Détail cours public | `src/app/academy/cours/[slug]/page.tsx`, `src/components/academy/CourseModuleList.tsx`, `src/components/academy/CourseResourceList.tsx`, `src/lib/academy/courses.ts` | Charge le cours, ses modules, leçons publiées et ressources. |
| Checkout et paiement | `src/app/academy/checkout/[courseSlug]/page.tsx`, `src/app/academy/checkout/[courseSlug]/CheckoutForm.tsx`, `src/app/api/academy/payments/initiate/route.ts`, `src/app/api/academy/payments/mock-confirm/route.ts`, `src/app/api/academy/payments/verify/route.ts`, `src/lib/academy/payments.ts` | Initie un paiement, confirme le mock, active ou crée l'enrollment après paiement confirmé. |
| Espace étudiant | `src/app/academy/dashboard/page.tsx`, `src/app/academy/mes-cours/page.tsx`, `src/components/academy/AcademyDashboard.tsx`, `src/components/academy/CourseProgressCard.tsx` | Affiche les accès, les cours actifs et les pourcentages de progression. |
| Apprentissage | `src/app/academy/cours/[slug]/apprendre/page.tsx`, `src/components/academy/LearningExperience.tsx`, `src/lib/academy/courses.ts`, `src/lib/academy/progress.ts` | Vérifie l'accès, charge les leçons publiées, affiche le player, calcule la progression et marque une leçon comme terminée/non terminée. |
| Certificats étudiant | `src/app/academy/certificats/page.tsx`, `src/app/certificats/verifier/[certificateId]/page.tsx` | Affiche les certificats existants et la vérification publique basée sur `academy_certificates`. |

### Administration Academy

| Zone | Fichiers | Rôle observé |
| --- | --- | --- |
| Dashboard admin | `src/app/admin/academy/page.tsx`, `src/components/admin/AcademyAdminNav.tsx` | Compteurs cours, étudiants, accès actifs, certificats émis. |
| Cours | `src/app/admin/academy/courses/page.tsx`, `src/app/admin/academy/courses/new/page.tsx`, `src/app/admin/academy/courses/[id]/edit/page.tsx`, `src/lib/academy/admin.ts` | Création et édition des métadonnées de cours. |
| Modules/leçons/ressources | `src/app/admin/academy/courses/[id]/content/page.tsx`, `src/app/admin/academy/courses/[id]/modules/*`, `src/app/admin/academy/courses/[id]/lessons/*`, `src/app/admin/academy/courses/[id]/resources/*`, `src/lib/academy/admin.ts` | Gestion du contenu pédagogique. |
| Inscriptions | `src/app/admin/academy/enrollments/page.tsx`, `src/lib/academy/admin.ts` | Création/mise à jour manuelle d'enrollments via upsert. |
| Paiements | `src/app/admin/academy/payments/page.tsx` | Suivi des transactions `academy_payments`. |
| Certificats | `src/app/admin/academy/certificates/page.tsx`, `src/lib/academy/admin.ts`, `src/lib/academy/certificates.ts` | Émission et révocation manuelles existantes. À ne pas étendre dans ce PR. |

### Schéma et types

- `supabase/migrations/20260701_create_academy_tables.sql`
- `supabase/migrations/20260701_add_academy_course_display_fields.sql`
- `supabase/migrations/20260701_seed_academy_courses_from_formations.sql`
- `supabase/migrations/20260702_create_academy_payments.sql`
- `supabase/migrations/20260702_extend_academy_lessons_video_security.sql`
- `src/types/academy.ts`

## 3. Tables Supabase Academy identifiées

### `profiles`

- **Rôle** : profil applicatif lié à `auth.users`.
- **Colonnes principales** : `id`, `full_name`, `phone`, `organization`, `role`, `created_at`, `updated_at`.
- **Relations** : `id` référence `auth.users(id)` avec suppression cascade.
- **Contraintes** : `role in ('student','admin')`.
- **RLS visible** : lecture et mise à jour du profil par son propriétaire.
- **Risque** : confusion possible entre `profiles.id`, `student_id` et `auth.users.id`. Dans le schéma actuel, ils représentent le même UUID utilisateur, mais les noms peuvent induire en erreur.

### `academy_courses`

- **Rôle** : catalogue des formations Academy.
- **Colonnes principales** : `id`, `title`, `slug`, `category`, `short_description`, `description`, `cover_image_url`, `level`, `duration`, `language`, `status`, `price_amount`, `price_currency`, `is_free`, `published_at`, `created_at`, `updated_at`.
- **Colonnes ajoutées ensuite** : `certification_description`, `instructor_name`, `instructor_role`, `instructor_bio`, `instructor_image_url`.
- **Contraintes** : `slug unique`, `status in ('draft','published','archived')`, `level in ('beginner','intermediate','advanced') or null`.
- **RLS visible** : lecture publique des cours publiés.
- **Risque** : les champs prix sont déclarés deux fois dans les migrations via `add column if not exists` avec précision différente (`numeric(10,2)` puis `numeric(12,2)`). À vérifier avant une refonte stricte de schéma.

### `academy_modules`

- **Rôle** : groupe les leçons d'un cours.
- **Colonnes principales** : `id`, `course_id`, `title`, `description`, `position`, `status`, `created_at`, `updated_at`.
- **Relations** : `course_id` référence `academy_courses(id)` avec suppression cascade.
- **Contraintes** : `status in ('draft','published','archived')`.
- **Index importants** : `academy_modules_course_title_idx` unique dans le seed pour éviter les doublons par titre de module et cours.
- **RLS visible** : lecture publique des modules publiés si le cours parent est publié.

### `academy_lessons`

- **Rôle** : unités pédagogiques suivies par les étudiants.
- **Colonnes principales** : `id`, `course_id`, `module_id`, `title`, `content`, `video_url`, `position`, `is_preview`, `duration`, `status`, `created_at`, `updated_at`.
- **Colonnes vidéo ajoutées ensuite** : `video_provider`, `video_uid`, `video_embed_url`.
- **Relations** : `course_id` référence `academy_courses(id)` avec suppression cascade ; `module_id` référence `academy_modules(id)` avec `on delete set null`.
- **Contraintes** : `status in ('draft','published','archived')`.
- **Index importants** : `academy_lessons_course_title_idx` unique dans le seed ; `academy_lessons_video_uid_idx` sur `video_uid`.
- **RLS visible** : lecture publique limitée aux leçons publiées en preview ; l'espace d'apprentissage utilise le client admin après vérification d'accès.
- **Risque** : la complétion ne doit compter que les leçons publiées, comme le code actuel le fait.

### `academy_resources`

- **Rôle** : supports rattachés à un cours et optionnellement à une leçon.
- **Colonnes principales** : `id`, `course_id`, `lesson_id`, `title`, `description`, `file_url`, `external_url`, `resource_type`, `is_downloadable`, `position`, `created_at`, `updated_at`.
- **Relations** : `course_id` référence `academy_courses(id)` ; `lesson_id` référence `academy_lessons(id)` avec `on delete set null`.
- **Contraintes** : `resource_type in ('document','pdf','video','link','image','other')`.
- **Impact progression** : les ressources ne sont pas comptées dans la progression actuelle.

### `academy_enrollments`

- **Rôle** : relie un étudiant à un cours et détermine l'accès.
- **Colonnes principales** : `id`, `student_id`, `course_id`, `status`, `access_source`, `payment_reference`, `amount_paid`, `currency`, `validated_by`, `validated_at`, `expires_at`, `created_at`, `updated_at`.
- **Relations** : `student_id` référence `auth.users(id)`, `course_id` référence `academy_courses(id)`, `validated_by` référence `auth.users(id)`.
- **Contraintes** : `unique(student_id, course_id)`, `status in ('pending','active','rejected','expired','completed')`, `access_source in ('manual','payment','free','admin_grant')`.
- **RLS visible** : un étudiant peut lire ses propres enrollments.
- **Accès actuel** : `active` et `completed` donnent accès si `expires_at` est absent ou futur.
- **Complétion actuelle** : le statut `completed` existe dans la contrainte et donne accès, mais l'action `toggleLessonProgress` ne met pas automatiquement l'enrollment à `completed`.
- **Manques pour certification automatique** : pas de colonne `completed_at`, pas de `progress_percentage` stocké.

### `academy_lesson_progress`

- **Rôle** : enregistre l'état de progression par étudiant et par leçon.
- **Colonnes principales** : `id`, `student_id`, `course_id`, `lesson_id`, `is_completed`, `completed_at`, `last_position_seconds`, `created_at`, `updated_at`.
- **Relations** : `student_id` référence `auth.users(id)`, `course_id` référence `academy_courses(id)`, `lesson_id` référence `academy_lessons(id)`.
- **Contraintes** : `unique(student_id, lesson_id)`.
- **RLS visible** : lecture, insertion et mise à jour par l'étudiant propriétaire.
- **Risque** : la contrainte unique n'inclut pas `course_id`. C'est acceptable tant qu'une leçon appartient à un seul cours, mais toute logique future doit continuer à utiliser `lesson_id` comme clé de conflit.

### `academy_certificates`

- **Rôle** : stocke les certificats Academy déjà émis.
- **Colonnes existantes** : `id`, `certificate_id`, `student_id`, `course_id`, `student_full_name`, `course_title`, `issued_at`, `status`, `verification_url`, `pdf_url`, `qr_code_url`, `created_at`, `updated_at`.
- **Relations** : `student_id` référence `auth.users(id)`, `course_id` référence `academy_courses(id)`.
- **Contraintes** : `certificate_id unique`, `status in ('issued','revoked','expired')`.
- **RLS visible** : lecture par l'étudiant propriétaire ; vérification publique des certificats `issued`.
- **Colonnes attendues mais absentes pour un système cible** : `enrollment_id`, `student_name` sous ce nom exact, `metadata`.
- **Colonnes présentes avec nom différent** : `student_full_name` existe à la place de `student_name`.
- **Risque** : absence de lien direct vers `academy_enrollments`, donc difficile d'auditer quel accès/progression a justifié l'émission.

### `academy_payments`

- **Rôle** : transactions de paiement Academy.
- **Colonnes principales** : `id`, `student_id`, `course_id`, `enrollment_id`, `provider`, `amount`, `currency`, `status`, `provider_reference`, `provider_checkout_url`, `provider_payload`, `metadata`, `paid_at`, `verified_at`, `created_at`, `updated_at`.
- **Relations** : `student_id` référence `auth.users(id)`, `course_id` référence `academy_courses(id)`, `enrollment_id` référence `academy_enrollments(id)` avec `on delete set null`.
- **Contraintes** : provider limité à `moncash`, `natcash`, `mock`; status limité à `pending`, `processing`, `paid`, `failed`, `cancelled`, `expired`, `manual_review`.
- **Index** : `academy_payments_student_idx`, `academy_payments_course_idx`, `academy_payments_status_idx`, `academy_payments_provider_reference_idx`.
- **RLS visible** : un étudiant peut lire ses propres paiements.
- **Risque** : ne pas coupler la certification à l'état paiement directement ; l'accès pédagogique passe par l'enrollment activé.

## 4. Relations cours, modules, leçons, ressources

Le graphe principal est :

```txt
academy_courses
  ├─ academy_modules.course_id
  │    └─ academy_lessons.module_id
  ├─ academy_lessons.course_id
  └─ academy_resources.course_id / academy_resources.lesson_id
```

Observations :

- Un cours contient des modules via `academy_modules.course_id`.
- Une leçon appartient toujours à un cours via `academy_lessons.course_id`.
- Une leçon peut être rattachée à un module via `module_id`, ou rester orpheline fonctionnellement dans la section « Leçons complémentaires ».
- Les ressources appartiennent à un cours et peuvent être globales au cours ou rattachées à une leçon.
- Les leçons et modules non publiés ne sont pas chargés dans l'espace d'apprentissage étudiant.

## 5. Relation étudiants, enrollments et accès

Le graphe d'accès est :

```txt
auth.users / profiles
  └─ academy_enrollments.student_id
        └─ academy_courses.id
```

Fonctionnement observé :

- `academy_enrollments` porte l'état d'accès à un cours.
- Les statuts considérés comme actifs côté code sont `active` et `completed`.
- L'accès est refusé si `expires_at` existe et est dans le passé.
- Le paiement confirmé active ou crée l'enrollment via `activateEnrollmentForPaidPayment`.
- L'admin peut créer ou mettre à jour un enrollment via `createEnrollment`.
- Le champ `validated_at` est renseigné lorsque l'admin place le statut à `active` ou `completed`, et quand le paiement active l'accès.

## 6. Fonctionnement actuel de la progression

### Table qui enregistre la progression

La progression est enregistrée dans `academy_lesson_progress`.

### Table qui enregistre les leçons terminées

La même table `academy_lesson_progress` enregistre les leçons terminées avec `is_completed = true`.

### Champ de complétion d'une leçon

- `academy_lesson_progress.is_completed` indique si la leçon est terminée.
- `academy_lesson_progress.completed_at` est renseigné avec la date courante lorsque la leçon passe à terminée.
- Quand une leçon est décochée, `completed_at` est remis à `null`.

### Action du bouton « leçon terminée »

Le bouton dans `LearningExperience` envoie `courseId`, `lessonId`, `slug` et l'état courant `completed` à l'action serveur `toggleLessonProgress`.

L'action :

1. exige un étudiant connecté ;
2. lit `courseId`, `lessonId`, `slug`, `completed` ;
3. upsert dans `academy_lesson_progress` avec `is_completed = !completed` ;
4. utilise `onConflict: "student_id,lesson_id"` ;
5. revalide `/academy/cours/[slug]/apprendre`.

Aucune génération de certificat et aucune mise à jour d'enrollment ne sont déclenchées par cette action aujourd'hui.

### Calcul de progression

Deux fonctions calculent la progression :

- `getProgressForCourses(studentId, courseIds)` pour les cartes/listes de cours étudiant.
- `computeProgress(lessons, progress)` pour la page d'apprentissage.

Dans les deux cas :

- le numérateur est le nombre de leçons dont `is_completed = true` ;
- le dénominateur est le nombre de leçons chargées/publiées ;
- le pourcentage est arrondi avec `Math.round` ;
- les ressources ne sont pas comptées ;
- les modules ne sont pas comptés directement ;
- les leçons non publiées ne sont pas comptées dans les requêtes principales de progression.

### Condition réelle de complétion d'une formation

La condition réellement exploitable actuellement est :

```txt
progression calculée = 100 %
ET toutes les leçons publiées du cours ont une ligne academy_lesson_progress avec is_completed = true pour l'étudiant.
```

Cependant :

- aucun champ `academy_enrollments.completed_at` n'existe ;
- aucun champ `academy_enrollments.progress_percentage` n'existe ;
- le statut `academy_enrollments.status = 'completed'` existe mais n'est pas automatiquement mis à jour par `toggleLessonProgress` ;
- il n'existe pas de table `academy_progress` séparée ;
- la complétion est dynamique, pas stockée comme état de cours terminé.

## 7. État actuel des certificats

### Tables recherchées

- `academy_certificates` : existe.
- `certificates` : non trouvée dans les migrations inspectées.
- `student_certificates` : non trouvée dans les migrations inspectées.
- `academy_student_certificates` : non trouvée dans les migrations inspectées.

### Table réellement utilisée

La table utilisée est `academy_certificates`.

### Colonnes existantes vs colonnes cible

| Colonne cible | État actuel |
| --- | --- |
| `id` | Existe. |
| `certificate_id` | Existe, unique. |
| `student_id` | Existe, FK vers `auth.users(id)`. |
| `course_id` | Existe, FK vers `academy_courses(id)`. |
| `enrollment_id` | Absente. |
| `student_name` | Absente sous ce nom ; `student_full_name` existe. |
| `course_title` | Existe. |
| `issued_at` | Existe. |
| `status` | Existe avec `issued`, `revoked`, `expired`. |
| `verification_url` | Existe. |
| `qr_code_url` | Existe. |
| `pdf_url` | Existe. |
| `metadata` | Absente. |
| `created_at` | Existe. |
| `updated_at` | Existe. |

### Interfaces existantes

- Étudiant : `/academy/certificats` liste les certificats de l'utilisateur.
- Public : `/certificats/verifier/[certificateId]` vérifie un certificat par identifiant.
- Admin : `/admin/academy/certificates` liste, crée manuellement et révoque des certificats.

### Risque principal

Le code contient déjà une génération manuelle dans `createCertificate`. La future reconstruction devra décider si cette fonctionnalité est conservée, refondue ou temporairement neutralisée dans un PR dédié, mais le présent audit ne la modifie pas.

## 8. Problèmes détectés à corriger dans un futur PR

1. **Pas de lien `enrollment_id` dans `academy_certificates`** : rend l'audit d'éligibilité moins fiable.
2. **Pas de `metadata` certificat** : impossible de figer proprement la version du modèle, la méthode d'émission, le contexte de complétion ou le snapshot de données.
3. **Pas de `completed_at` sur `academy_enrollments`** : la date officielle de fin de formation n'est pas stockée au niveau inscription.
4. **Pas de `progress_percentage` stocké** : le pourcentage est recalculé dynamiquement, ce qui peut changer si des leçons sont ajoutées ou archivées après coup.
5. **Statut `completed` non synchronisé automatiquement** : il existe dans la contrainte, mais la progression ne le met pas à jour.
6. **Nom de colonne `student_full_name` vs cible `student_name`** : décider s'il faut garder le nom existant ou ajouter une colonne alias/cible.
7. **Émission manuelle existante sans contrôle d'éligibilité visible dans l'admin** : l'admin peut émettre un certificat sans preuve de progression complète dans le formulaire actuel.
8. **Vérification publique dépendante de certificats déjà créés** : elle ne peut rien afficher si aucun certificat n'est émis, même si le cours est terminé.
9. **Risque de divergence UI/backend** : l'UI peut afficher 100 %, mais le backend certificat futur pourrait utiliser une autre règle si elle n'est pas centralisée.

## 9. Risques techniques à éviter lors des prochains PR

1. **Génération automatique branchée trop tôt sur la progression** : ne pas appeler de création certificat depuis `toggleLessonProgress` tant que la complétion n'est pas centralisée et testée.
2. **Migration incohérente** : ne jamais créer d'index sur `enrollment_id` avant d'ajouter la colonne et sa FK.
3. **Confusion `student_id`, `profile_id`, `auth.users.id`** : documenter clairement que `student_id` pointe vers `auth.users(id)` et que `profiles.id` partage cet UUID.
4. **Admin filtré uniquement sur `status = completed`** : les certificats manuels ou l'éligibilité pourraient être invisibles si les enrollments ne passent jamais à `completed`.
5. **Condition de fin différente entre UI et backend** : créer une fonction serveur unique d'éligibilité avant tout automatisme.
6. **Page publique sans données** : ne pas promettre la vérification publique tant que l'émission n'est pas fiable.
7. **Absence de plan migration** : séparer migration additive, logique admin, interface étudiant et automatisation.
8. **Absence de fallback** : si la génération certificat échoue, la progression doit rester enregistrée et le bouton ne doit pas échouer.
9. **Bouton « leçon terminée » cassé** : conserver cette action minimale ; toute certification automatique doit être asynchrone ou découplée.

## 10. Stratégie recommandée pour construire les certificats sans casser la progression

1. **Stabiliser une fonction d'éligibilité pure côté serveur**
   - Entrées : `studentId`, `courseId` ou `enrollmentId`.
   - Sortie : total leçons publiées, leçons terminées, pourcentage, booléen `isComplete`.
   - Ne modifie aucune donnée.

2. **Ajouter d'abord les certificats manuels vérifiables**
   - L'admin choisit un enrollment éligible.
   - Le certificat référence `enrollment_id`.
   - Aucune génération automatique depuis la progression.

3. **Ajouter ensuite les pages étudiant/publique**
   - Lire uniquement des certificats déjà émis.
   - Prévoir les états vide, révoqué, expiré, introuvable.

4. **Automatiser en dernier**
   - Après stabilisation, déclencher la génération seulement quand la formation devient complète.
   - Prévoir idempotence via contrainte unique probable `(student_id, course_id)` ou `(enrollment_id)` selon la décision métier.
   - En cas d'échec certificat, ne jamais annuler l'upsert de progression.

5. **Générer PDF/QR en dernier**
   - Le PDF et QR code doivent dépendre d'un certificat déjà persisté, pas de l'action de progression.

## 11. Migrations futures recommandées

Toutes les migrations futures doivent être additives et non destructives au départ.

Proposition à discuter :

```sql
-- Proposition future, ne pas exécuter dans ce PR.
alter table public.academy_certificates
  add column if not exists enrollment_id uuid references public.academy_enrollments(id) on delete set null,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists academy_certificates_enrollment_idx
  on public.academy_certificates(enrollment_id);

-- Option métier à valider : éviter les doublons actifs par enrollment ou par couple étudiant/cours.
-- create unique index ... where status = 'issued';
```

Autres migrations possibles :

- Ajouter `completed_at timestamptz` sur `academy_enrollments` uniquement si la complétion stockée devient une exigence produit.
- Ajouter `progress_percentage integer` uniquement si le produit accepte un snapshot stocké à maintenir.
- Ajouter une colonne `student_name` seulement si l'équipe décide de remplacer ou dupliquer `student_full_name`.
- Ajouter des index sur `academy_lesson_progress(student_id, course_id)` si les volumes progressent.

## 12. Recommandations de sécurité

- Continuer à vérifier l'accès par enrollment avant de charger le contenu complet d'apprentissage.
- Ne pas exposer les URLs PDF privées sans politique de stockage adaptée.
- Garder la vérification publique limitée aux champs nécessaires : identifiant, nom, formation, date, statut.
- Journaliser l'émetteur admin dans `metadata` ou une colonne dédiée lors du futur PR manuel.
- Prévoir un statut `revoked` visible publiquement sans exposer de données sensibles supplémentaires.
- Prévoir une génération idempotente : si un certificat existe déjà, ne pas créer de doublon.

## 13. Recommandations modèle Word vers HTML/CSS/PDF

À traiter uniquement dans un PR final dédié :

- Convertir le modèle Word Agri-tech en template HTML/CSS versionné.
- Garder les données dynamiques limitées : nom étudiant, formation, date, identifiant, URL de vérification.
- Générer le QR code à partir de `verification_url` après persistance du certificat.
- Stocker le PDF dans un bucket Supabase avec politique de lecture claire.
- Enregistrer `pdf_url`, `qr_code_url` et des informations de version dans `metadata`.
- Ne pas bloquer la progression si la génération PDF échoue ; le certificat base de données doit rester la source de vérité.

## 14. Plan de reconstruction en PR progressifs

### PR 1 : Audit certificat et progression Academy

- **Objectif** : documenter l'état actuel et les risques.
- **Doit faire** : créer ce document d'audit.
- **Ne doit pas faire** : modifier progression, paiement, bouton de leçon, génération certificat ou migrations.
- **Risques à surveiller** : aucun comportement applicatif ne doit changer.

### PR 2 : Certificats manuels admin vérifiables

- **Objectif** : reconstruire proprement l'émission manuelle admin.
- **Doit faire** : migration additive pour `enrollment_id`/`metadata`, fonction d'éligibilité serveur, émission idempotente depuis un enrollment.
- **Ne doit pas faire** : génération automatique après clic sur leçon terminée.
- **Risques à surveiller** : doublons, mauvaise correspondance étudiant/cours, émission sans éligibilité.

### PR 3 : Page étudiant + page publique de vérification

- **Objectif** : fiabiliser l'expérience de consultation et vérification.
- **Doit faire** : états vide/introuvable/révoqué/émis, liens de vérification stables, affichage sécurisé.
- **Ne doit pas faire** : générer des certificats ou PDF.
- **Risques à surveiller** : fuite de données, accès PDF non sécurisé, dépendance à un certificat absent.

### PR 4 : Génération automatique après complétion

- **Objectif** : générer automatiquement quand la formation devient réellement complète.
- **Doit faire** : utiliser la fonction d'éligibilité centralisée, être idempotent, découpler l'échec certificat de la progression.
- **Ne doit pas faire** : modifier brutalement le comportement du bouton sans fallback.
- **Risques à surveiller** : erreurs serveur sur `toggleLessonProgress`, race conditions, certificats doublons.

### PR 5 : Modèle visuel HTML/CSS et PDF basé sur le modèle Word Agri-tech

- **Objectif** : produire le certificat visuel final.
- **Doit faire** : template HTML/CSS, QR code, PDF, stockage, versioning du modèle.
- **Ne doit pas faire** : changer la règle de complétion.
- **Risques à surveiller** : rendu PDF instable, URLs expirées, dépendances lourdes, erreurs bloquantes dans le parcours étudiant.

## 15. Confirmations de périmètre de ce PR

- Le bouton **« leçon terminée »** n'a pas été modifié.
- La logique de progression n'a pas été modifiée.
- La logique de paiement mock/MonCash/NatCash n'a pas été modifiée.
- Les enrollments n'ont pas été modifiés.
- Aucune migration destructive n'a été ajoutée.
- Aucun endpoint certificat n'a été ajouté.
- Aucune génération QR/PDF n'a été ajoutée.
- Aucun certificat n'est créé par ce PR.

## Note PR 4 — Modèle visuel imprimable

Le PR 4 ajoute un rendu HTML/CSS/Tailwind du certificat dans `src/components/academy/certificates/CertificateTemplate.tsx` et une page protégée `/academy/certificats/[certificateId]`.

Cette étape prépare l’impression A4 paysage et l’enregistrement PDF via le navigateur sans parser automatiquement le fichier Word de référence et sans ajouter de génération PDF serveur. La logique de progression, la génération manuelle, la génération automatique et les paiements restent inchangés.
