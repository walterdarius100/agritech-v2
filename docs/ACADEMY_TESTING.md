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

## Scénario contenu pédagogique — Cuniculture pratique

1. Ouvrir `/admin/academy/courses`.
2. Trouver `Cuniculture pratique` puis cliquer **Contenu**.
3. Créer le module `Introduction à la cuniculture` en `published`, position `1`.
4. Créer la leçon `Présentation de l’élevage de lapins`, associer le module, ajouter du contenu écrit, une URL vidéo et le statut `published`.
5. Créer la ressource `Guide de démarrage en cuniculture` en type `pdf` ou `document`, avec `external_url` ou `file_url`.
6. Se connecter comme Marie Lovelie, déjà inscrite avec enrollment `active` ou `completed`.
7. Ouvrir `/academy/mes-cours`, cliquer **Continuer** puis vérifier `/academy/cours/cuniculture-pratique/apprendre`.
8. Vérifier que les modules et leçons sont triés par `position`, que le contenu écrit, la vidéo et les ressources apparaissent.
9. Cliquer **Marquer comme terminé**, rafraîchir la page et vérifier que la progression reste sauvegardée dans `academy_lesson_progress`.

Exemple complet recommandé :

- Module 1 : Introduction à la cuniculture
  - Leçon 1 : Présentation de l’élevage de lapins
  - Leçon 2 : Les avantages de la cuniculture
  - Leçon 3 : Les erreurs fréquentes au démarrage
- Module 2 : Logement et matériel
  - Leçon 1 : Choisir l’emplacement du clapier
  - Leçon 2 : Matériel de base
  - Leçon 3 : Hygiène et sécurité
- Ressources : Guide de démarrage en cuniculture, Liste du matériel nécessaire.

## Vérification UX de la page d’apprentissage

Pour `/academy/cours/cuniculture-pratique/apprendre` avec un étudiant inscrit :

1. vérifier que seul le titre du cours et la progression sont visibles dans l’en-tête ;
2. vérifier que la sidebar modules/leçons est à gauche sur desktop et reste lisible sur mobile ;
3. ouvrir et fermer plusieurs modules ;
4. cliquer une leçon et vérifier que la zone vidéo change sans afficher de texte parasite avant le lecteur ;
5. tester une vidéo YouTube, un lien MP4 direct et un lien externe ;
6. vérifier les onglets **À propos de ce module**, **Formateur de la leçon** et **Ressources** ;
7. vérifier que les ressources globales du cours et celles de la leçon active apparaissent proprement ;
8. cliquer **Marquer comme terminé**, rafraîchir et confirmer que la progression reste sauvegardée.
