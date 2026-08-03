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

Cette première version collecte uniquement les abonnements du footer. Elle n’envoie aucun email et ne propose ni interface admin ni désinscription publique. Une limitation distribuée par IP n’est pas ajoutée ; elle pourra être appliquée au niveau de l’hébergement si le trafic l’exige.

## Améliorations futures

- synchronisation Brevo ;
- double opt-in ;
- email de bienvenue Newsletter ;
- page de désinscription ;
- admin Newsletter ;
- export CSV ;
- segmentation.
