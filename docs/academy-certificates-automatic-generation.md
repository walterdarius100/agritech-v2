# Certificats Academy — génération automatique après complétion

Date : 2026-07-12.

## 1. Déclenchement

La génération automatique se déclenche uniquement dans l’action serveur qui traite le bouton « leçon terminée » : `toggleLessonProgress` dans `src/lib/academy/progress.ts`.

Le flux reste volontairement séquentiel et limité :

```txt
clic étudiant sur « Marquer comme terminé »
→ upsert existant dans academy_lesson_progress
→ tentative secondaire de génération certificat
→ revalidation de la page d’apprentissage
```

La tentative certificat n’est lancée que lorsque la leçon passe à `is_completed = true`. Décocher une leçon ne révoque pas de certificat et ne déclenche aucune génération.

## 2. Condition de complétion utilisée

La condition officielle reste celle documentée dans l’audit et réutilisée par PR 2 :

```txt
formation terminée = toutes les leçons publiées du cours sont marquées comme terminées par l’étudiant
```

Le calcul utilise :

- `academy_lessons.status = 'published'` pour le total ;
- `academy_lesson_progress.is_completed = true` pour les leçons terminées ;
- `student_id` et `course_id` pour limiter le calcul à l’étudiant et à la formation.

Les ressources ne sont pas comptées.

## 3. Pourquoi la génération ne dépend pas de `status = completed`

Le champ `academy_enrollments.status = 'completed'` existe dans le schéma, mais il n’est pas maintenu automatiquement par le bouton « leçon terminée ».

La génération automatique ne dépend donc pas uniquement de ce statut. Elle retrouve l’enrollment à partir de `student_id + course_id`, puis réutilise `getCertificateEligibilityForEnrollment(enrollmentId)` pour recalculer la complétion réelle.

Le PR n’ajoute pas :

- `academy_enrollments.completed_at` ;
- `progress_percentage` stocké ;
- mise à jour automatique de `academy_enrollments.status` ;
- nouvelle logique parallèle de progression.

## 4. Fonction automatique ajoutée

La fonction `maybeGenerateCertificateAfterLessonCompletion(studentId, courseId)` :

1. retrouve l’enrollment de l’étudiant pour le cours ;
2. recalcule l’éligibilité via `getCertificateEligibilityForEnrollment` ;
3. retourne `not_completed` si la formation n’est pas complète ;
4. retourne `certificate_already_exists` si un certificat actif existe déjà ;
5. appelle `createCertificateForEligibility` si le cours est terminé ;
6. retourne un résultat clair : `attempted`, `created`, `certificateId`, `skippedReason`.

## 5. Anti-doublon

La protection anti-doublon reste double :

1. le code vérifie les certificats actifs existants avant insertion ;
2. la migration PR 2 ajoute un index unique partiel sur `academy_certificates(enrollment_id)` pour les statuts actifs `issued`, `valid`, `draft`.

En cas de course condition et d’erreur unique PostgreSQL (`23505`), la fonction recharge l’éligibilité et retourne `certificate_already_exists` au lieu de créer un second certificat.

## 6. Sécurité : la génération certificat ne doit jamais casser le bouton “leçon terminée”

La génération automatique est secondaire. L’action de progression entoure l’appel certificat avec un `try/catch`.

Si la génération échoue :

- la leçon reste marquée comme terminée ;
- la page d’apprentissage est revalidée normalement ;
- l’erreur est loggée côté serveur ;
- l’admin peut générer le certificat manuellement depuis `/admin/academy/certificates`.

Le PR ne logge jamais de token, clé Supabase, secret d’environnement ou information de paiement.

## 7. Logs serveur

Les logs peuvent contenir :

- `enrollmentId` ;
- `studentId` ;
- `courseId` ;
- `progressPercentage` ;
- `completedLessons` ;
- `totalLessons` ;
- `certificateAlreadyExists` ;
- `certificateCreated` ;
- `skippedReason`.

Ces données permettent de diagnostiquer pourquoi un certificat n’a pas été généré sans exposer de secret.

## 8. Visibilité admin

La page `/admin/academy/certificates` continue d’afficher tous les certificats enregistrés dans `academy_certificates`.

Une colonne « Source » affiche :

- `Automatique` si `metadata.generation_source = 'automatic'` ;
- `Manuel` si `metadata.generation_source = 'manual'` ou `metadata.generation_mode = 'manual_admin'` ;
- `—` pour les anciens certificats sans metadata de source.

## 9. Tests manuels recommandés

1. Utiliser un étudiant inscrit à un cours.
2. Marquer une leçon non finale comme terminée.
3. Vérifier qu’aucun certificat n’est généré si le cours n’est pas terminé.
4. Marquer la dernière leçon publiée comme terminée.
5. Vérifier que la progression atteint 100 %.
6. Vérifier qu’un certificat est généré automatiquement.
7. Vérifier que le certificat apparaît dans `/admin/academy/certificates` avec `Source = Automatique`.
8. Vérifier que le certificat a un `certificate_id` et un `enrollment_id`.
9. Recliquer ou rejouer l’action et vérifier qu’aucun doublon actif n’est créé.
10. Vérifier que le bouton « leçon terminée » fonctionne toujours si la génération certificat échoue.

## 10. Ce qui n’est pas inclus

Ce PR n’ajoute pas :

- cron ;
- backfill automatique des anciens étudiants ;
- génération PDF ;
- QR code ;
- téléchargement PDF ;
- modification des paiements ;
- modification de la sécurité vidéo ;
- reconstruction complète des pages publiques ;
- nouvelle logique parallèle de progression.
