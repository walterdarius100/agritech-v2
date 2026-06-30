# Backend du formulaire Contact

Cette étape connecte `/contact` à Supabase sans créer de CRM complet.

## Table `contact_requests`

La migration `supabase/migrations/20260630_create_contact_requests_table.sql` crée la table `contact_requests` avec les champs prospect (`full_name`, `email`, `phone`, `organization`), qualification (`request_type`, `service_slug`, `formation_slug`, `subject`), contenu (`message`, `source_page`) et suivi interne (`status`, `priority`, `admin_notes`).

Types de demandes acceptés : `general`, `service`, `formation`, `partnership`, `other`.

Statuts acceptés : `new`, `in_review`, `contacted`, `converted`, `closed`, `spam`.

Priorités acceptées : `low`, `normal`, `high`, `urgent`.

## RLS et confidentialité

RLS est activé. Une seule policy publique autorise `anon` à insérer une demande. Aucune policy publique de lecture, mise à jour ou suppression n'est créée, car les demandes contiennent des données personnelles.

L'administration utilise le client Supabase service role uniquement côté serveur, derrière `requireAuthorizedAdmin()`. La clé `SUPABASE_SERVICE_ROLE_KEY` ne doit jamais être exposée côté client.

## Route API

`POST /api/contact` reçoit les données du formulaire, nettoie les chaînes, valide les champs, applique les limites de longueur, puis insère la demande dans Supabase.

Réponse de succès : `{ "ok": true, "message": "Votre demande a bien été envoyée." }`.

Les erreurs publiques restent génériques et ne contiennent pas de stack trace.

## Anti-spam

Le formulaire contient un honeypot caché `company_website`. Si ce champ est rempli, la route répond comme si la demande avait été acceptée, mais ne crée pas d'entrée Supabase.

## Paramètres d'URL

- `/contact?service=poulet-de-chair` force `request_type = service` et stocke `service_slug = poulet-de-chair`.
- `/contact?formation=cuniculture-pratique` force `request_type = formation` et stocke `formation_slug = cuniculture-pratique`.

Ces slugs sont transmis dans des champs cachés et revalidés côté serveur.

## Notifications email

Aucune dépendance email n'a été ajoutée à cette étape. La priorité est l'enregistrement Supabase. Une notification serveur pourra être ajoutée ensuite sans bloquer la sauvegarde si l'envoi email échoue.
