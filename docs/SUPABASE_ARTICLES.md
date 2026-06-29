# Articles Supabase — lecture publique

Cette documentation décrit la connexion des pages publiques d’articles à Supabase. Elle ne couvre pas l’admin articles, l’upload d’images, l’authentification ou les rôles administrateurs.

## Table `articles`

La migration `supabase/migrations/20260629_create_articles_table.sql` crée la table `articles` avec les champs suivants :

- `id` : identifiant unique de l’article.
- `title` : titre public de l’article.
- `slug` : identifiant lisible utilisé dans l’URL.
- `category` : catégorie éditoriale.
- `excerpt` : court résumé affiché dans les cartes et le hero.
- `cover_image_url` : URL de l’image principale.
- `author` : auteur affiché sur la page article.
- `content` : contenu principal de l’article.
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

Le public peut lire uniquement les articles publiés. Les brouillons et les articles archivés ne doivent pas être visibles. Aucune policy publique d’insertion, de mise à jour ou de suppression n’est créée : le public ne peut donc pas créer, modifier ou supprimer des articles.

## Images des articles

`cover_image_url` contient l’URL de l’image principale de l’article. Au début, cette URL peut pointer vers une image publique existante. Plus tard, les images pourront être gérées via Supabase Storage depuis l’admin. Si `cover_image_url` est vide, le site utilise un placeholder agricole local.

Si les images viennent de Supabase Storage, le domaine Supabase doit être autorisé pour `next/image`. Dans ce projet, `next.config.ts` lit `NEXT_PUBLIC_SUPABASE_URL` et limite l’autorisation au chemin public Supabase Storage.

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

## SEO dynamique

La page `/actualites` expose un titre et une description dédiés aux actualités agricoles en Haïti. La page `/articles/[slug]` utilise le titre, l’extrait et l’image de couverture de l’article pour ses métadonnées et Open Graph quand ces données sont disponibles.

## Prochaines étapes

1. Valider la lecture publique des articles depuis Supabase.
2. Créer l’admin articles.
3. Ajouter l’upload d’images.
4. Ajouter la gestion brouillon / publié / archivé depuis l’admin.
5. Préparer les rôles administrateurs.
