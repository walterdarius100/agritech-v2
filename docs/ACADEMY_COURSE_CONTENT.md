# Academy — contenu des fiches cours

Les fiches publiques Academy utilisent les champs éditoriaux du cours pour composer le catalogue `/academy` et la page détaillée `/academy/cours/[slug]`.

## Catalogue `/academy`

Les cartes du catalogue affichent uniquement les informations utiles à la découverte :

- image de couverture ;
- catégorie ;
- titre ;
- description courte ;
- durée ;
- niveau ;
- CTA vers la page détaillée.

Le prix n’est plus affiché dans les cartes pour éviter de surcharger le catalogue. Les modalités d’accès et le prix sont consultables dans la page détaillée du cours.

## Page publique d’un cours

Le hero est dédié à la présentation de la formation : catégorie, titre, description courte, durée, niveau, image éventuelle et CTA. Il ne contient plus la box “Accès / Validation manuelle” et n’affiche plus le prix.

Après le hero, la page contient :

1. **Détails du cours** : modules, durée, description, certification/vidéos/ressources.
2. **Certification Agri-tech** : section longue avec texte prudent sur l’attestation ou le certificat.
3. **Formateur** : section longue avec image, nom, rôle et bio, ou fallback Équipe Agri-tech.
4. **Programme de la formation** : modules en cartes accordéon avec leçons publiées.
5. **Modalités d’accès** : box prix + CTA `Demander l’accès` et explication de la validation manuelle.

## Champs principaux

- `title`, `slug`, `category` ;
- `short_description`, `description` ;
- `cover_image_url`, `duration`, `level` ;
- `price_amount`, `price_currency`, `is_free` ;
- `certification_description` ;
- `instructor_name`, `instructor_role`, `instructor_bio`, `instructor_image_url`.

Les compteurs de modules, leçons vidéo et ressources sont issus des tables Academy quand disponibles.
