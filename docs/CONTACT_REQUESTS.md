# Demandes Contact

Le formulaire `/contact` gère les demandes générales, services, formations classiques, partenariats et accès Academy avec une UI volontairement simple : aucun bloc contextuel public n’est affiché au-dessus du formulaire.

## Préremplissage par contexte

- `/contact` : formulaire normal, type par défaut, domaine facultatif et message visible.
- `/contact?service=[slug]` : type `service`, domaine prérempli avec le service, message visible, obligatoire selon la logique actuelle, mais laissé vide pour que le prospect décrive librement son besoin.
- `/contact?formation=[slug]` : type `formation`, domaine prérempli avec la formation classique, message visible.
- `/contact?type=partnership` : type `partnership`, domaine `Collaboration / Partenariat`, message visible et prérempli.
- `/contact?type=academy-access&course=[slug]` : type `academy_access`, formation préremplie, nom/email/téléphone préremplis si disponibles, textarea masquée.

## Message automatique Academy

Pour les demandes Academy, le message libre n’est pas demandé à l’utilisateur. Un message clair est transmis dans `contact_requests.message` :

`Demande d’accès à la formation Academy : [Titre]. L’étudiant souhaite être contacté pour les modalités de paiement et l’activation manuelle de son accès.`

## Stockage

Les demandes sont insérées dans `contact_requests`. Les champs dédiés existants restent utilisés (`request_type`, `service_slug`, `formation_slug`, `subject`, `message`, `source_page`) et les demandes Academy utilisent aussi `course_slug`, `course_title`, `metadata`.

Les metadata conservent le contexte utile pour l’admin : Academy, service ou partenariat, sans exposer de bloc technique dans l’interface publique.
