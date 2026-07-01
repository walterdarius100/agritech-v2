# Academy — checklist de test

## Pages à vérifier

- `/academy` : cartes avec image, titre, description courte, durée, niveau, prix et CTA.
- `/academy/cours/cuniculture-pratique` : hero, détails, certification, programme accordéon et formateur.
- `/academy/cours/cuniculture-pratique/apprendre` : accès étudiant, lecteur vidéo, ressources cliquables, progression.
- `/admin/academy/courses` : création avec champs éditoriaux.
- `/admin/academy/courses/[id]/edit` : modification et sauvegarde des nouveaux champs.
- `/admin/academy/courses/[id]/content` : contenu modules/leçons/ressources inchangé.

## Tests fonctionnels

1. Les cartes Academy restent homogènes et responsive.
2. Les fallbacks “Durée non précisée” et “Niveau non précisé” s’affichent si nécessaire.
3. La page publique ne donne pas accès au contenu réservé.
4. Les modules du programme peuvent être ouverts/fermés.
5. Le formateur affiche les données du cours ou le fallback Équipe Agri-tech.
6. Les ressources n’affichent plus de bouton “Voir/Ouvrir”.
7. Le titre de ressource ouvre `external_url` ou `file_url`.
8. Les enrollments et la progression restent fonctionnels.

## Commandes

```bash
npm run lint
npm run build
```
