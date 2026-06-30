# Admin articles sécurisé

## Objectif

L’admin articles permet à un administrateur Agri-tech de gérer les articles Supabase depuis une interface claire, sans modifier directement la base de données et sans exposer la clé service role côté navigateur.

## Routes et navigation admin

- `/admin/login` : connexion admin par email et mot de passe dans une seule carte claire.
- `/admin` : mini dashboard avec compteurs d’articles.
- `/admin/articles` : liste de tous les articles avec filtres par statut.
- `/admin/articles/new` : création d’un article.
- `/admin/articles/[id]/edit` : modification d’un article existant.
- `/admin/articles/upload-cover` : route serveur sécurisée pour uploader l’image de couverture.

Les pages admin protégées affichent une navigation dédiée, séparée du navbar public : logo Agri-tech, libellé **Administration Agri-tech**, liens **Tableau de bord**, **Articles**, **Nouvel article**, **Voir le site** et bouton **Se déconnecter**. La navigation est responsive et le bouton de déconnexion appelle l’action serveur existante, puis redirige vers `/admin/login`. Le layout global masque explicitement le header/footer publics sur toutes les routes `/admin`, afin d’éviter le double navbar.

## Variables d’environnement

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
ADMIN_EMAILS=
NEXT_PUBLIC_TINYMCE_API_KEY=
```

`ADMIN_EMAILS` contient les emails autorisés, séparés par des virgules. `SUPABASE_SERVICE_ROLE_KEY` doit rester strictement côté serveur. `NEXT_PUBLIC_TINYMCE_API_KEY` reste optionnelle : l’éditeur est chargé sans clé obligatoire depuis les assets TinyMCE publics, et un textarea de secours reste disponible si le script ne charge pas.

## Sécurité retenue

- Supabase Auth vérifie l’email et le mot de passe.
- Le serveur vérifie que l’email connecté est présent dans `ADMIN_EMAILS`.
- Les pages `/admin`, `/admin/articles/new` et `/admin/articles/[id]/edit` appellent `requireAuthorizedAdmin()`.
- Les écritures articles et l’upload Storage utilisent la clé service role uniquement côté serveur après validation admin.
- Il n’y a pas d’inscription publique admin.
- La lecture publique reste limitée aux articles `published`.

## Organisation du formulaire article

Le formulaire de création/modification est organisé en quatre sections :

1. **Informations de l’article** : titre, slug, catégorie, résumé/extrait, auteur et durée de lecture.
2. **Image de couverture** : URL publique, upload Supabase Storage et aperçu.
3. **Contenu** : éditeur TinyMCE chargé côté client, avec stockage HTML dans le champ `content`.
4. **Publication** : statut, date de publication, article à la une et actions.

Le slug reste modifiable. Le bouton **Générer** remplit le slug depuis le titre uniquement sur action volontaire.

## Image de couverture et Supabase Storage

- Bucket : `article-images`.
- Formats acceptés : JPG, PNG, WebP.
- Taille maximale : 4 Mo.
- Chemin d’upload : `covers/<timestamp>-<uuid>-<nom-nettoye>.<extension>`.
- Après upload réussi, l’URL publique est automatiquement copiée dans `cover_image_url` et l’aperçu est mis à jour.

La migration `supabase/migrations/20260630_create_article_images_bucket.sql` crée ou met à jour le bucket public avec les limites de taille/type et ajoute une policy de lecture publique. Les uploads ne sont pas ouverts au public : ils passent par la route serveur `/admin/articles/upload-cover`, protégée par `requireAuthorizedAdmin()`.

Si la création automatique du bucket est bloquée par votre environnement Supabase, créez manuellement un bucket public `article-images`, limitez les MIME types à `image/jpeg`, `image/png`, `image/webp`, limitez la taille à `4194304` octets et conservez uniquement la lecture publique.

## Éditeur TinyMCE

La section **Contenu** utilise TinyMCE comme éditeur principal, sans API key obligatoire. La configuration active les blocs de texte, titres, gras, italique, souligné, listes, citation, séparateur horizontal, alignements, liens, insertion d’image par URL, aperçu, code, tableau, annulation/rétablissement et nettoyage de mise en forme. La zone de rédaction est agrandie pour offrir environ 560 px d’espace utile.

Le contenu est enregistré en HTML dans le champ existant `articles.content` après une sanitation minimale côté serveur : suppression des scripts, styles, handlers `on*` et URLs `javascript:`. Aucune nouvelle colonne n’est créée.

Les anciens articles en texte simple restent compatibles : la page publique affiche encore les paragraphes texte si `content` ne contient pas de HTML. Les images de couverture restent gérées séparément par `cover_image_url`; les images insérées dans le corps de l’article sont ajoutées dans TinyMCE via URL.

## Publication

Statuts stockés en base :

- `draft` : brouillon, non visible publiquement.
- `published` : publié, visible sur le site.
- `archived` : archivé, retiré de l’affichage public.

L’interface affiche les libellés français **Brouillon**, **Publié** et **Archivé**, mais envoie toujours `draft`, `published` ou `archived` à Supabase.

Actions :

- **Enregistrer comme brouillon** : force `status = draft`.
- **Publier** : force `status = published` et définit `published_at` à la date actuelle si vide.
- **Mettre à jour** : conserve le statut sélectionné et définit `published_at` si l’article passe publié sans date.
- **Aperçu** : ouvre `/articles/[slug]` dans un nouvel onglet uniquement si l’article déjà enregistré est publié.
- **Annuler** : retourne vers `/admin/articles` sans sauvegarder.

## Article à la une

Quand un article est sauvegardé avec `featured = true`, le serveur remet tous les autres articles à `featured = false`. Cela évite plusieurs articles à la une simultanément.

## Messages et validation

Validations minimales : titre, slug, catégorie, extrait, contenu, statut valide, format de slug, type image et taille image. Les erreurs affichées à l’admin sont volontairement fonctionnelles et ne contiennent pas de stack trace.

## Limites actuelles

- Pas de suppression d’article depuis l’admin.
- Pas de preview privée pour les brouillons non publiés.
- TinyMCE est chargé côté client depuis les assets publics TinyMCE, sans API key obligatoire, afin de ne pas casser le build si le package npm n’est pas disponible dans l’environnement.
- L’upload inline d’images TinyMCE vers Supabase Storage n’est pas inclus : les images de contenu sont insérées par URL.
- Pas de table de rôles avancée : la liste `ADMIN_EMAILS` reste la source d’autorisation.

## Prochaines étapes

- Ajouter une preview privée signée pour les brouillons.
- Ajouter une suppression douce ou une corbeille.
- Remplacer `ADMIN_EMAILS` par une table de rôles si plusieurs niveaux d’accès deviennent nécessaires.
