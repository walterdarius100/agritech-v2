# Demandes Contact

Le formulaire `/contact` est simplifié pour les demandes générales d’information. Les champs publics `Type de demande`, `Domaine concerné` et `Sujet` ne sont plus affichés : le visiteur renseigne uniquement son nom complet, son email, son téléphone et son message. Les valeurs techniques existantes restent transmises en arrière-plan quand un contexte de page le fournit, afin de préserver Supabase, les emails et l’affichage admin historique.

## Préremplissage par contexte

- `/contact` : demande générale, message visible.
- `/contact?service=[slug]` : contexte technique `service` conservé en arrière-plan, message visible.
- `/contact?formation=[slug]` : contexte technique `formation` conservé en arrière-plan, message visible.
- `/contact?type=partnership` : contexte technique `partnership` conservé en arrière-plan, message visible et prérempli.
- `/contact?type=academy-access&course=[slug]` : contexte technique `academy_access` conservé, nom/email/téléphone préremplis si disponibles, textarea masquée.

## Message automatique Academy

Pour les demandes Academy, le message libre n’est pas demandé à l’utilisateur. Un message clair est transmis dans `contact_requests.message` :

`Demande d’accès à la formation Academy : [Titre]. L’étudiant souhaite être contacté pour les modalités de paiement et l’activation manuelle de son accès.`

## Stockage

Les demandes sont insérées dans `contact_requests`. Les champs dédiés existants restent utilisés côté transmission (`request_type`, `service_slug`, `formation_slug`, `subject`, `message`, `source_page`) et les demandes Academy utilisent aussi `course_slug`, `course_title`, `metadata`. Si `request_type` est absent, la validation serveur utilise `general` par défaut. Si `subject` est absent pour une nouvelle demande Contact, le serveur enregistre le sujet automatique `Demande d’information générale`.

Les metadata conservent le contexte utile pour l’admin : Academy, service ou partenariat, sans exposer de bloc technique dans l’interface publique.


Le formulaire Consultation reste séparé et dédié aux projets agricoles structurés, accompagnements techniques et services de consultation.
