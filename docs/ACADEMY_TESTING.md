# Agri-tech Academy — Parcours de test

## Rôles des routes

- `/academy` : page publique de présentation et catalogue Academy, sans progression fictive.
- `/academy/dashboard` : dashboard étudiant connecté, basé sur les enrollments réels.
- `/academy/mes-cours` : cours avec inscription `active` ou `completed` uniquement.
- `/academy/cours/[slug]` : présentation publique du cours.
- `/academy/cours/[slug]/apprendre` : apprentissage réservé aux étudiants inscrits.

## Test Marie Lovelie

```txt
Nom : Marie Lovelie
Email : marie.lovelie.test@gmail.com
Cours : Cuniculture pratique
Slug : cuniculture-pratique
```

1. Créer le compte via `/academy/register`.
2. Confirmer l’email si Supabase Auth l’exige.
3. Se connecter via `/academy/login`.
4. Vérifier que `/academy/dashboard` indique aucun cours actif.
5. Vérifier que `/academy/cours/cuniculture-pratique/apprendre` refuse l’accès sans enrollment actif.
6. Dans `/admin/academy/enrollments`, attribuer le cours `cuniculture-pratique` à Marie avec `status = active`.
7. Revenir sur `/academy/mes-cours` : le cours doit apparaître.
8. Cliquer `Continuer` : le lien doit ouvrir `/academy/cours/cuniculture-pratique/apprendre`.
9. Marquer une leçon comme terminée.
10. Rafraîchir : la progression doit rester sauvegardée dans `academy_lesson_progress`.

## Données seedées

La migration `20260701_seed_academy_courses_from_formations.sql` insère les slugs publics existants dans `academy_courses` sans écraser les cours déjà modifiés par l’admin (`on conflict (slug) do nothing`). Elle ajoute aussi des modules/leçons/ressources de base pour `cuniculture-pratique` afin de tester le parcours jusqu’à la progression.

## Debug accès étudiant après enrollment

Si Marie ne voit pas `Cuniculture pratique` après attribution :

1. ouvrir Supabase et vérifier une ligne `academy_enrollments` avec `student_id` = id Auth de Marie ;
2. vérifier que `course_id` pointe vers `academy_courses.slug = cuniculture-pratique` ;
3. vérifier `status = active` ou `completed` ;
4. vérifier que `expires_at` est vide ou futur ;
5. rafraîchir `/academy/dashboard` ou `/academy/mes-cours` ;
6. ne pas ajouter Marie dans `ADMIN_EMAILS`, car cette variable concerne seulement l’administration.

Le bouton `Continuer` doit ensuite pointer vers `/academy/cours/cuniculture-pratique/apprendre`.
