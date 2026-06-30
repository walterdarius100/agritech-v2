# Articles Supabase — lecture publique et Storage

Cette documentation décrit la connexion des pages publiques d’articles à Supabase et la configuration Storage utilisée par l’admin.

## Table `articles`

La migration `supabase/migrations/20260629_create_articles_table.sql` crée la table `articles` avec les champs suivants :

- `id` : identifiant unique de l’article.
- `title` : titre public de l’article.
- `slug` : identifiant lisible utilisé dans l’URL.
- `category` : catégorie éditoriale.
- `excerpt` : court résumé affiché dans les cartes et le hero.
- `cover_image_url` : URL de l’image principale.
- `author` : auteur affiché sur la page article.
- `content` : contenu principal de l’article, en texte simple pour les anciens contenus ou en HTML propre depuis l’éditeur admin.
- `status` : état de publication.
- `featured` : indique si l’article est à la une.
- `reading_time` : durée de lecture affichée.
- `published_at` : date de publication.
- `created_at` : date de création.
- `updated_at` : date de dernière modification.

## Statuts des articles

- `draft` : article en brouillon, non visible publiquement.
- `published` : article publié, visible sur le site.
- `archived` : article retiré de l’affichage public sans suppression définitive.

## Sécurité RLS

RLS est activé sur la table `articles`. La policy publique attendue est :

```sql
create policy "Public can read published articles"
on articles
for select
using (status = 'published');
```

Le public peut lire uniquement les articles publiés. Aucune policy publique d’insertion, de mise à jour ou de suppression n’est créée.

## Supabase Storage pour les images

Bucket utilisé : `article-images`.

Configuration attendue :

- bucket public pour permettre l’affichage des images sur le site ;
- lecture publique des objets du bucket ;
- formats acceptés : `image/jpeg`, `image/png`, `image/webp` ;
- taille maximale : 4 Mo (`4194304` octets) ;
- pas d’upload public depuis le navigateur visiteur.

La migration `supabase/migrations/20260630_create_article_images_bucket.sql` crée ou met à jour le bucket et ajoute la lecture publique :

```sql
insert into storage.buckets (...)
values ('article-images', 'article-images', true, 4194304, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update ...;

create policy "Public read access for article images"
on storage.objects for select
to public
using (bucket_id = 'article-images');
```

Les uploads admin passent par la route serveur `/admin/articles/upload-cover`. Cette route vérifie l’admin connecté, valide le type et la taille du fichier, utilise `SUPABASE_SERVICE_ROLE_KEY` côté serveur uniquement, puis retourne l’URL publique à stocker dans `cover_image_url`.

Si votre instance Supabase ne permet pas d’appliquer les migrations Storage via SQL, créez manuellement le bucket `article-images` dans le Dashboard avec les mêmes paramètres.

## Rendu public du contenu

La page `/articles/[slug]` reste compatible avec deux formats :

- texte simple : rendu en paragraphes, comme auparavant ;
- HTML généré par TinyMCE dans l’éditeur admin : rendu avec styles typographiques pour paragraphes, titres, listes, citations, liens, images et séparateurs.

Une sanitation minimale est appliquée côté sauvegarde et côté rendu pour supprimer scripts, styles, handlers inline et URLs `javascript:`. Le HTML rendu provient uniquement des administrateurs autorisés ; aucun visiteur public ne peut publier ce contenu.

## Fonctions de lecture publiques

- `getPublishedArticles()` : récupère les articles avec `status = 'published'`, triés par date de publication décroissante.
- `getFeaturedArticle()` : récupère l’article à la une le plus récent, ou le dernier article publié si aucun article n’est marqué `featured`.
- `getLatestArticles(limit)` : récupère les derniers articles publiés.
- `getArticleBySlug(slug)` : récupère un article publié à partir de son slug.
- `getRelatedArticles(currentSlug, limit)` : récupère les derniers articles publiés en excluant l’article courant.

Ces fonctions utilisent la clé anon côté serveur et s’appuient sur RLS. Si Supabase n’est pas configuré, elles basculent sur les articles statiques temporaires.

## Pages connectées

- `/` : la section Actualités utilise l’article à la une et les derniers articles.
- `/actualites` : affiche l’article à la une et la liste des autres articles publiés.
- `/articles/[slug]` : affiche l’article complet, les actions de partage et la section “À lire aussi”.

## Prochaines étapes

1. Ajouter une preview privée pour les brouillons.
2. Ajouter une gestion de suppression ou d’archivage avancée.
3. Ajouter des rôles administrateurs plus granulaires si nécessaire.
