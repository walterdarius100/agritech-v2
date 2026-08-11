# Guide admin — fichiers des ressources événementielles

## Ajouter un PDF

1. Ouvrir **Admin → Ressources → Nouvelle ressource**.
2. Renseigner le titre et le slug, puis sélectionner un PDF dans **Fichier PDF**.
3. Le fichier doit porter l'extension `.pdf`, avoir le type `application/pdf`, contenir une signature PDF valide et peser au maximum **10 Mo**.
4. Enregistrer. Le serveur authentifie de nouveau l'admin, envoie le fichier dans le bucket privé `event-resources`, puis enregistre sa référence et ses métadonnées dans `event_resources`.

Le chemin Storage est unique : `[resource-id]/[timestamp]-[uuid]-nom-nettoye.pdf`. Aucun nom fourni par l'utilisateur ne devient directement un chemin et `upsert` reste désactivé.

## Remplacer un fichier

La fiche de modification affiche le nom, le type MIME et la taille du fichier actuel. Choisir un nouveau PDF puis enregistrer remplace la référence. L'ancien objet n'est supprimé qu'après la réussite de la mise à jour en base. Sans nouveau fichier sélectionné, le fichier actuel est conservé.

## Storage et fallback externe

- `storage_bucket` + `storage_path` désignent en priorité le PDF privé ;
- `file_name`, `file_mime_type` et `file_size` décrivent le fichier uploadé ;
- `file_url` reste un fallback facultatif pour toutes les ressources historiques ;
- en l'absence de Storage, `file_url` continue d'alimenter le téléchargement ;
- sans référence Storage ni `file_url`, l'interface indique proprement qu'aucun fichier n'est associé.

Après la soumission valide du formulaire public, le serveur génère une URL signée Storage valable **24 heures**. Si aucune référence Storage exploitable n'existe, il revient à l'URL externe validée. Le formulaire public et l'enregistrement des leads restent inchangés.

## Sécurité

Le bucket `event-resources` est privé et ne définit aucune policy publique sur `storage.objects`. Les uploads passent exclusivement par une Server Action protégée avec `requireAuthorizedAdmin()`. La clé service-role n'est jamais envoyée au navigateur. Un visiteur ne peut donc ni uploader, ni lister les fichiers ; il ne reçoit qu'une URL temporaire après sa soumission.

La migration `202608110001_add_event_resources_storage.sql` crée/configure le bucket et ajoute les colonnes sans supprimer `file_url` ni les ressources existantes.
