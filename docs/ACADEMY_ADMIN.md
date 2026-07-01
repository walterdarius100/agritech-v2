# Academy — administration des cours

## Créer ou modifier un cours

Depuis `/admin/academy/courses`, l’admin peut créer un cours avec les champs de base et les champs d’affichage public. Depuis `/admin/academy/courses/[id]/edit`, il peut compléter ou corriger la fiche.

Champs à renseigner :

- titre, slug, catégorie ;
- description courte et description détaillée ;
- image de couverture ;
- durée, niveau, statut, date de publication ;
- prix, devise, case cours gratuit ;
- texte de certification / conditions ;
- nom, rôle, bio courte et image du formateur principal.

## Persistance Supabase

La migration `20260701_add_academy_course_display_fields.sql` ajoute de façon non destructive :

- `certification_description` ;
- `instructor_name` ;
- `instructor_role` ;
- `instructor_bio` ;
- `instructor_image_url`.

Les autres champs existaient déjà dans `academy_courses` et sont réutilisés.

## Limites actuelles

- Pas d’upload vidéo automatique.
- Pas de paiement automatique.
- Pas de génération PDF de certificat dans ce lot.
- Gestion d’un formateur principal seulement.
