# Academy — contenu des fiches cours

Les fiches publiques Academy utilisent maintenant les champs éditoriaux du cours pour composer les cartes catalogue et la page `/academy/cours/[slug]`.

## Champs principaux

- `title` : titre affiché dans les cartes, le hero public et l’espace d’apprentissage.
- `slug` : segment d’URL public, par exemple `/academy/cours/cuniculture-pratique`.
- `category` : catégorie affichée au-dessus du titre.
- `short_description` : résumé court pour les cartes et l’introduction.
- `description` : description détaillée affichée dans **Détails du cours**.
- `cover_image_url` : image de couverture de la carte catalogue.
- `duration` : durée textuelle affichée avec fallback “Durée non précisée”.
- `level` : niveau (`beginner`, `intermediate`, `advanced`) affiché en français.
- `price_amount`, `price_currency`, `is_free` : prix ou mention gratuit.
- `certification_description` : texte prudent sur le certificat ou l’attestation.
- `instructor_name`, `instructor_role`, `instructor_bio`, `instructor_image_url` : formateur principal.

## Page publique d’un cours

Après le hero, la page contient :

1. **Détails du cours** : modules, durée, description, certification/vidéos/ressources.
2. **Certification Agri-tech** : explication sobre sans promettre de génération automatique.
3. **Programme de la formation** : modules en cartes accordéon avec leçons publiées.
4. **Formateur Agri-tech** : données du formateur ou fallback Équipe Agri-tech.

Les compteurs de modules, leçons vidéo et ressources sont issus des tables Academy quand disponibles.
