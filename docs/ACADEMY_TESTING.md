# Tests Academy

## Parcours demande d’accès

1. Ouvrir `/academy/cours/cuniculture-pratique`.
2. Cliquer `Demander l’accès` en visiteur non connecté.
3. Vérifier la redirection vers `/academy/register` avec un paramètre `next` encodé contenant `/contact?type=academy-access&course=cuniculture-pratique`.
4. Créer un compte ; si Supabase renvoie une session, vérifier la redirection vers le formulaire Contact prérempli.
5. Se connecter via `/academy/login?next=...` et vérifier la même redirection.
6. Ouvrir directement `/contact?type=academy-access&course=cuniculture-pratique` en étudiant connecté.
7. Vérifier le mode `Demande d’accès à une formation Academy`, la formation, le slug, le message, le nom et l’email préremplis si disponibles.
8. Envoyer la demande et vérifier l’enregistrement `contact_requests.request_type = academy_access`.
9. Vérifier `/admin/contact-requests` et le détail de la demande.
10. Confirmer qu’aucun enrollment n’est créé automatiquement.

## Régressions à vérifier

- `/contact` sans paramètre reste une demande générale.
- `/contact?service=[slug]` reste une demande service.
- `/contact?formation=[slug]` reste une demande formation classique.
- `/admin/academy/enrollments` reste le point de validation manuelle.
