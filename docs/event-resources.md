# Ressources événementielles

## Rôle du module

Le socle de données sépare deux responsabilités :

- `event_resources` décrit les documents proposés pendant une conférence, une présentation ou un événement ;
- `event_resource_leads` conserve les coordonnées d'une personne ayant demandé une ressource précise.

Le module expose maintenant une page publique non listée `/r/[slug]` et une Server Action de collecte. Il ne crée encore aucune interface admin, synchronisation CRM/Newsletter ou communication email.

## Table `event_resources`

Une ressource possède un slug public, un titre, une description facultative, une référence de fichier, un contexte événementiel et des paramètres de publication. Le fichier recommandé est un objet privé du bucket `event-resources`, référencé par `storage_bucket` et `storage_path`. `file_name`, `file_mime_type` et `file_size` conservent ses métadonnées. L'ancien champ `file_url`, désormais facultatif, reste disponible comme fallback non destructif. `is_active` permet à la route serveur de refuser une ressource désactivée. `requires_form` reste disponible pour une évolution du contrôle d’accès.

Les types autorisés sont `document`, `plan`, `guide`, `fiche_technique`, `presentation` et `autre`. Les langues autorisées sont `fr`, `en`, `es` et `ht` afin de prendre en charge les ressources en créole.

### Règle de slug

`slug` est obligatoire et unique. La contrainte SQL accepte uniquement des minuscules ASCII, des chiffres et des tirets simples entre les segments, par exemple `plan-ruche-2026`. Les espaces, accents, majuscules, tirets initiaux/finaux et tirets consécutifs sont refusés.

La contrainte unique crée déjà l'index PostgreSQL utilisé pour rechercher une ressource par slug. Des index séparés couvrent `is_active` et `topic`.

## Table `event_resource_leads`

Chaque lead référence exactement une ressource. Le nom et l'email sont obligatoires ; le téléphone, l'organisation, le domaine d'intérêt, le nom de l'événement et le chemin de page sont facultatifs. Une contrainte SQL rejette les emails manifestement invalides ; la Server Action nettoie, borne et valide également tous les champs avant l’insertion.

La suppression d'une ressource supprime ses leads avec `on delete cascade`. Cette opération devra donc rester réservée au serveur/admin et être confirmée explicitement ; la désactivation via `is_active` est préférable pour conserver l'historique.

### Règle anti-doublon

L'index unique `(resource_id, lower(email))` autorise un même email à demander plusieurs ressources différentes, mais refuse une seconde ligne pour la même ressource, y compris si la casse de l'email change. La Server Action normalise l’adresse en minuscules et traite le code PostgreSQL `23505` comme une soumission déjà prise en compte, sans révéler l’existence d’un contact.

Les index supplémentaires couvrent `resource_id`, `email`, `created_at`, `source` et `event_name` pour les futurs écrans de recherche et de suivi.

## RLS et accès

RLS est activé sur les deux tables. Aucune policy publique n'est créée et tous les privilèges sont révoqués aux rôles `anon` et `authenticated` : le navigateur ne peut donc ni lister les ressources, ni insérer directement un lead, ni lire ou modifier les coordonnées collectées.

La page `/r/[slug]` et sa Server Action utilisent le client service-role exclusivement côté serveur. L'action valide le slug, recharge uniquement une ressource active, normalise la soumission et fixe elle-même les données de provenance. Après une soumission valide, elle signe le fichier Storage privé pour 24 heures. Si la référence Storage est absente ou si sa signature échoue, elle utilise le `file_url` sûr existant. Toute lecture admin de leads appelle `requireAuthorizedAdmin()`.

Le bucket privé ne possède volontairement aucune policy `storage.objects` publique : un visiteur ne peut ni uploader, ni lister, ni télécharger un objet sans URL signée. La clé service-role reste limitée aux fonctions serveur.

La clé service-role ne doit jamais être importée dans un Client Component ni transmise au navigateur.

## Contraintes complémentaires

- les titres, URLs de fichier, libellés de téléchargement, noms de leads et sources ne peuvent pas être vides ;
- `metadata` doit toujours être un objet JSON, jamais un tableau ou une valeur scalaire ;
- `updated_at` est actualisé automatiquement sur `event_resources` par un trigger dédié avec un `search_path` vide ;
- le format email SQL reprend l'approche simple déjà employée par le CRM, sans prétendre vérifier qu'une boîte existe.

## Administration

La route protégée `/admin/resources` présente les ressources, leur statut, leur nombre de leads et les statistiques globales. L’entrée **Ressources** de la navigation admin permet d’y accéder. Le bouton **Nouvelle ressource** ouvre `/admin/resources/new` : renseignez le titre, un slug unique, sélectionnez un PDF (10 Mo maximum) et conservez **Ressource active** cochée pour rendre le lien public accessible. L'upload est exécuté par la Server Action après contrôle admin, du MIME, de l'extension, de la signature PDF et de la taille. Le chemin isolé prend la forme `[resource-id]/[timestamp]-[uuid]-nom-nettoye.pdf`, sans écrasement.

Le lien officiel est construit à partir de `NEXT_PUBLIC_SITE_URL` sous la forme `/r/[slug]`. **Copier le lien** place cette URL dans le presse-papiers afin de la convertir avec l’outil QR choisi et de l’insérer dans une présentation PowerPoint. L’admin ne génère pas encore de fichier QR directement.

Depuis la liste, **Modifier** ouvre `/admin/resources/[id]`. Cette fiche affiche le nom, le type et la taille du fichier actuel. Sélectionner un autre PDF le remplace après réussite de la mise à jour ; laisser le sélecteur vide conserve l'objet actuel. La recherche couvre nom, email, téléphone et organisation. **Désactiver** rend immédiatement le slug inaccessible sur la page publique sans supprimer la ressource ni ses leads ; **Activer** le republie.

Toutes les lectures et mutations appellent `requireAuthorizedAdmin()` et utilisent le client service-role côté serveur. Aucun lead n’est rendu par une route publique.

## Limites actuelles

- aucune ressource ou donnée initiale n'est insérée par la migration ;
- aucun export CSV, pagination au-delà des 500 leads les plus récents ou génération graphique du QR code n’est encore disponible ;
- le premier format uploadable est volontairement limité au PDF et à 10 Mo ;
- la collecte limite les données à 4 Kio et utilise un honeypot, mais ne dispose pas encore d'un rate limiting distribué ;
- aucune synchronisation CRM ou Newsletter et aucun email automatique ne sont déclenchés ;
- `consent_contact` vaut `true` par défaut conformément au modèle demandé, mais le futur formulaire et sa revue légale devront rendre le consentement explicite et traçable avant exploitation commerciale ;
- la suppression en cascade est définitive : les opérations courantes doivent préférer `is_active = false`.
