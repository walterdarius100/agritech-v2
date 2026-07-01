# Agri-tech Academy — contenu pédagogique

## Concepts

- **Cours** : parcours global visible dans Academy, par exemple `Cuniculture pratique`.
- **Module** : chapitre ordonné du cours avec `title`, `description`, `position` et `status` (`draft`, `published`, `archived`).
- **Leçon** : contenu pédagogique rattaché au cours et, idéalement, à un module. Elle contient `title`, `module_id`, `content`, `video_url`, `duration`, `position`, `is_preview` et `status`.
- **Ressource** : document ou lien lié au cours ou à une leçon via `lesson_id` optionnel.

## Gérer le contenu

Depuis `/admin/academy/courses`, cliquer sur **Contenu**. La page `/admin/academy/courses/[id]/content` affiche le cours, ses modules, les leçons de chaque module et les ressources associées.

### Créer un module

1. Cliquer **Ajouter un module**.
2. Renseigner le titre, la description, la position et le statut.
3. Utiliser `published` pour l’afficher côté étudiant, `draft` pour préparer, `archived` pour masquer sans supprimer.

### Créer une leçon

1. Cliquer **Ajouter une leçon**.
2. Choisir le module lié.
3. Ajouter le contenu écrit dans le textarea.
4. Ajouter une durée, une position et un statut.
5. Cocher `is_preview` si la leçon doit être marquée comme aperçu gratuit.

### Ajouter une vidéo

Le champ `video_url` accepte une URL YouTube, Vimeo, MP4 direct ou externe. Côté étudiant, YouTube est intégré automatiquement quand l’identifiant est reconnu ; les autres liens sont affichés comme bouton externe.

### Ajouter une ressource

1. Cliquer **Ajouter une ressource**.
2. Choisir une leçon ou laisser vide pour une ressource globale du cours.
3. Choisir le type : `document`, `pdf`, `video`, `link`, `image`, `other`.
4. Renseigner `file_url` ou `external_url`.

## Ordre et publication

Les modules, leçons et ressources sont triés par `position`. Seules les leçons `published` sont comptabilisées dans la progression étudiant. Les modules `published` sont affichés côté étudiant.

## Limites actuelles

- Pas d’upload vidéo.
- Les ressources acceptent des URLs ; l’upload Supabase Storage `academy-resources` reste une prochaine étape si le bucket n’est pas configuré.
- Pas de quiz, devoirs, commentaires, certificats PDF ou paiement automatique dans cette étape.

## Affichage côté étudiant

La page d’apprentissage affiche maintenant le contenu dans une structure proche d’une plateforme e-learning : sidebar modules/leçons, lecteur vidéo prioritaire, bouton de progression dans la zone de lecture et onglets sous la vidéo. Les ressources globales du cours et les ressources liées à la leçon active sont disponibles dans l’onglet **Ressources**.
