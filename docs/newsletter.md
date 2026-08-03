# Collecte Newsletter

## Rôle

Le formulaire Newsletter déjà présent dans le footer enregistre les personnes qui souhaitent recevoir les futures communications d’Agri-tech. La collecte passe par `POST /api/newsletter`; le navigateur n’écrit jamais directement dans Supabase.

## Table `newsletter_subscribers`

La migration `20260803_create_newsletter_subscribers.sql` crée une table dédiée. Ses champs principaux sont :

- `email`, normalisé en minuscules et unique ;
- `status` (`active`, `unsubscribed`, `bounced` ou `complained`) ;
- `source`, fixé à `footer` par le serveur ;
- `locale`, `page_path` et `user_agent`, contexte technique facultatif et limité en longueur ;
- `subscribed_at`, `unsubscribed_at`, `created_at` et `updated_at` ;
- `metadata`, réservé à de petites extensions futures et vide par défaut.

Aucune donnée sensible autre que l’adresse nécessaire à l’abonnement n’est collectée. Le formulaire inclut un honeypot invisible et la route refuse les payloads supérieurs à 4 Kio.

## Doublons et réactivation

Une adresse active déjà présente reçoit une réponse utilisateur positive sans nouvelle ligne. Une adresse au statut non actif est réactivée : son statut repasse à `active`, les dates d’abonnement et de mise à jour sont actualisées, et `unsubscribed_at` est effacé. La contrainte unique protège également les requêtes concurrentes.

## RLS et accès

RLS est activé sans aucune policy publique. Les rôles navigateur `anon` et `authenticated` ne peuvent donc ni lire, ni créer, ni modifier, ni supprimer les abonnés. La route serveur validée utilise exclusivement le client service-role, dont la clé reste côté serveur. Les accès d’administration Supabase restent soumis aux privilèges de l’équipe.

## Limites actuelles

Cette première version collecte uniquement les abonnements du footer. Elle n’envoie aucun email et ne propose pas de désinscription publique. Une limitation distribuée par IP n’est pas ajoutée ; elle pourra être appliquée au niveau de l’hébergement si le trafic l’exige.

## Admin Newsletter

La route protégée `/admin/newsletter` est accessible uniquement aux comptes autorisés par le mécanisme d’authentification admin existant. Elle affiche l’email, le statut, la source, la page d’inscription, les dates d’inscription et de désinscription, ainsi que la dernière mise à jour. Les données sont lues côté serveur avec le client service-role et ne sont envoyées à aucun outil Analytics.

L’administrateur peut rechercher une adresse email et filtrer la liste sur les statuts `active`, `unsubscribed`, `bounced` et `complained`. Un résumé indique le total et le nombre d’adresses de chaque statut. La liste est limitée aux 500 résultats les plus récents pour conserver une page légère.

Les seules actions proposées sont **Marquer comme désinscrit** pour une adresse active et **Réactiver** pour une adresse désinscrite. Elles sont exécutées par une Server Action qui vérifie de nouveau l’autorisation admin et l’état courant de la ligne. La désinscription renseigne `unsubscribed_at`; la réactivation l’efface et conserve la date initiale `subscribed_at`. Aucun abonné n’est supprimé.

L’admin ne permet actuellement aucun envoi de campagne, aucune synchronisation Brevo Marketing, aucun export CSV, aucun double opt-in et aucune désinscription publique.

## Améliorations futures

- synchronisation Brevo ;
- double opt-in ;
- email de bienvenue Newsletter ;
- page de désinscription ;
- export CSV ;
- segmentation.
