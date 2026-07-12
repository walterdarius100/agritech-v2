# Certificats Academy — génération manuelle admin

Date : 2026-07-12.

## 1. Ce que ce PR ajoute

Ce PR ajoute une génération manuelle de certificats depuis `/admin/academy/certificates`, réservée aux admins et limitée aux enrollments réellement terminés.

Le PR ne change pas :

- le bouton « leçon terminée » ;
- la logique de progression existante ;
- les paiements Academy ;
- les routes publiques hors vérification déjà existante ;
- la génération automatique après complétion ;
- la génération PDF ou QR code.

## 2. Logique d’éligibilité utilisée

La logique vient de l’audit `docs/academy-certificates-audit.md` : une formation est terminée lorsque toutes les leçons publiées du cours sont terminées par l’étudiant.

La fonction serveur partagée `getCertificateEligibilityForEnrollment(enrollmentId)` calcule :

- les leçons publiées du cours ;
- les lignes `academy_lesson_progress` terminées (`is_completed = true`) pour l’étudiant et le cours ;
- le pourcentage dynamique ;
- la présence d’un certificat actif existant ;
- l’éligibilité finale.

Les ressources ne sont pas comptées. Le PR ne dépend pas de `academy_enrollments.completed_at`, de `progress_percentage` stocké, ni du statut `academy_enrollments.status = completed`.

## 3. Migration Supabase ajoutée

Migration à exécuter :

```txt
supabase/migrations/20260712_extend_academy_certificates_manual_generation.sql
```

Elle ajoute uniquement des éléments nécessaires à la génération manuelle fiable :

- `academy_certificates.enrollment_id uuid` ;
- `academy_certificates.metadata jsonb not null default '{}'::jsonb` ;
- une foreign key optionnelle `enrollment_id -> academy_enrollments(id)` avec `on delete set null` ;
- un index simple sur `enrollment_id` ;
- un index unique partiel empêchant deux certificats actifs pour le même enrollment ;
- une contrainte de statut élargie à `issued`, `valid`, `draft`, `revoked`, `expired` ;
- une policy de vérification publique qui accepte `issued` et `valid`.

Aucune colonne n’est supprimée et aucune donnée existante n’est supprimée.

## 4. Exécution via Supabase CLI

Depuis la racine du projet :

```bash
supabase db push
```

Ou, selon le workflow d’environnement :

```bash
supabase migration up
```

## 5. Exécution via Supabase SQL Editor

Ouvrir le fichier suivant et copier son contenu dans le SQL Editor Supabase :

```txt
supabase/migrations/20260712_extend_academy_certificates_manual_generation.sql
```

Exécuter le script complet. Il utilise `add column if not exists`, `create index if not exists` et un bloc `do $$` pour éviter de recréer la foreign key si elle existe déjà.

## 6. Vérifier que `enrollment_id` existe

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'academy_certificates'
order by ordinal_position;
```

Vérifier que `enrollment_id` et `metadata` sont présents.

## 7. Voir les certificats générés

```sql
select certificate_id, student_id, course_id, enrollment_id, status, issued_at
from public.academy_certificates
order by issued_at desc;
```

## 8. Comment générer manuellement un certificat

1. Se connecter comme admin.
2. Ouvrir `/admin/academy/certificates`.
3. Dans la section « Générer manuellement un certificat », vérifier les enrollments éligibles.
4. Cliquer sur « Générer le certificat » pour l’enrollment souhaité.
5. Vérifier que le certificat apparaît dans la section « Certificats générés ».

Chaque ligne éligible affiche :

```txt
Nom étudiant — Formation — Progression — Leçons terminées / total
```

## 9. Protection anti-doublon

La protection est double :

1. côté serveur, `getCertificateEligibilityForEnrollment` refuse un enrollment qui possède déjà un certificat actif ;
2. côté base, l’index unique partiel `academy_certificates_active_enrollment_unique_idx` empêche plusieurs certificats actifs (`issued`, `valid`, `draft`) pour le même `enrollment_id`.

Les certificats révoqués ne sont pas supprimés. Ils restent dans l’historique avec `status = revoked`.

## 10. Statut utilisé

Les certificats générés manuellement par ce PR utilisent :

```txt
status = valid
```

Ce choix signifie que le certificat est officiellement émis dès l’action admin. Les statuts historiques `issued`, `revoked` et `expired` restent supportés, et `draft` est disponible pour un futur workflow si nécessaire.

## 11. Gestion des erreurs admin

L’action serveur renvoie des messages explicites dans l’URL admin :

- `Impossible de générer le certificat : la formation n’est pas terminée.`
- `Impossible de générer le certificat : aucun enrollment trouvé.`
- `Impossible de générer le certificat : un certificat existe déjà pour cet enrollment.`
- `Impossible de générer le certificat : insertion Supabase échouée.`

Les logs serveur incluent les identifiants techniques nécessaires au diagnostic sans afficher de secret : `enrollmentId`, `studentId`, `courseId`, total de leçons publiées, leçons terminées, progression et certificat existant.

## 12. Ce qui n’est pas inclus

Ce PR n’ajoute pas :

- de génération automatique après clic sur « leçon terminée » ;
- de PDF ;
- de QR code ;
- de nouveau bouton étudiant ;
- de modification de la progression ;
- de modification des paiements ;
- de modèle Word/HTML/CSS final.
