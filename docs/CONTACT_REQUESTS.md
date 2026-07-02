# Demandes Contact

Le formulaire `/contact` continue de gérer les demandes générales, services, formations classiques, partenariats et autres demandes.

## Mode Academy

Quand l’URL contient `type=academy-access`, le formulaire passe en mode `Demande d’accès à une formation Academy`.

Paramètres pris en charge :

- `course` : slug de la formation Academy demandée ;
- `type=academy-access` : active le contexte Academy.

Le formulaire préremplit le nom et l’email depuis l’utilisateur Supabase connecté quand ils sont disponibles. Le nom suit cette priorité : profil `profiles.full_name`, puis `user_metadata.full_name`, puis `user_metadata.name`, sinon champ vide.

## Stockage

Les demandes sont insérées dans `contact_requests`. Les champs Academy ajoutés sont non destructifs : `course_slug`, `course_title`, `metadata`.
