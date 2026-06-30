# Administration des demandes clients

L'espace admin expose une gestion minimale des demandes :

- `/admin/contact-requests` liste les demandes reçues avec date, nom, email, type, sujet, statut et priorité.
- `/admin/contact-requests/[id]` affiche le détail d'une demande et permet de modifier le statut, la priorité et les notes internes.

Ces pages appellent `requireAuthorizedAdmin()` avant toute lecture ou modification. Les données sont récupérées via le client Supabase service role côté serveur.

## Actions disponibles

Actions incluses dans cette étape progressive :

- consulter la liste ;
- ouvrir une demande ;
- modifier `status` ;
- modifier `priority` ;
- ajouter ou mettre à jour `admin_notes` ;
- répondre manuellement via un lien `mailto:`.

## Limites actuelles

Ce n'est pas un CRM complet : pas de pipeline avancé, pas de relance automatique, pas d'analytics complexe et pas de notification email active.

## Prochaines étapes possibles

- Ajouter une notification email serveur non bloquante.
- Ajouter des filtres par statut et priorité.
- Ajouter une recherche par email ou nom.
- Ajouter un export CSV réservé aux admins.
