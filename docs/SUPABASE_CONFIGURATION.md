# Configuration Supabase — Agri-tech V2

Supabase servira progressivement à gérer les articles / actualités, les leads du formulaire de contact, l’authentification Academy, l’accès aux formations, la progression étudiant, les ressources pédagogiques et les certificats.

Cette étape concerne uniquement la lecture publique des articles publiés.

## Variables d’environnement

À configurer dans `.env.local` en développement local et dans `Vercel > Project Settings > Environment Variables` pour les environnements Preview et Production :

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

- `NEXT_PUBLIC_SUPABASE_URL` : URL du projet Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : clé publique anon utilisée pour la lecture publique selon les policies RLS.
- `SUPABASE_SERVICE_ROLE_KEY` : clé serveur uniquement, jamais exposée côté client.
- `NEXT_PUBLIC_SITE_URL` : URL publique du site, utile pour les liens et métadonnées.

> Ne jamais utiliser `SUPABASE_SERVICE_ROLE_KEY` dans un composant client ou dans du code exposé au navigateur.

Le fichier `.env.local` ne doit pas être commité. Les variables doivent être ajoutées dans Vercel pour que les previews et la production puissent lire les articles Supabase.

## Images Supabase Storage

Si `cover_image_url` pointe vers Supabase Storage, le domaine du projet Supabase est autorisé dynamiquement dans `next.config.ts` à partir de `NEXT_PUBLIC_SUPABASE_URL`, uniquement pour le chemin public `/storage/v1/object/public/**`.

## Fallback local

Si Supabase n’est pas configuré en local, le site peut utiliser les articles statiques temporaires pour éviter de casser le build. Ce fallback est temporaire et devra être retiré ou limité quand Supabase sera pleinement configuré.

## Diagnostic de connexion Supabase

Si les articles existent dans Supabase mais n’apparaissent pas sur `/actualites`, `/articles/[slug]` ou la section Actualités de la page d’accueil, vérifier la connexion Supabase avant de modifier les pages.

1. Vérifier que `.env.local` contient au minimum :

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

2. Redémarrer le serveur local après toute modification des variables :

   ```bash
   npm run dev
   ```

3. Ouvrir `/debug/supabase` en développement local. Cette page vérifie la présence des variables publiques, le format de l’URL Supabase, la création du client Supabase et une requête simple sur `articles` filtrée avec `status = 'published'`.

4. Ne jamais partager ni afficher `SUPABASE_SERVICE_ROLE_KEY`. La page de diagnostic n’affiche pas cette clé et ne révèle pas la clé anon complète.

5. Vérifier dans Vercel que les mêmes variables sont configurées dans `Project Settings > Environment Variables` pour Preview et Production.

6. Redéployer le site après toute modification des variables Vercel afin que Next.js les relise pendant le build et au runtime.

7. Vérifier RLS dans Supabase et confirmer l’existence d’une policy de lecture publique pour les articles publiés, par exemple :

   ```sql
   create policy "Public can read published articles"
   on articles
   for select
   using (status = 'published');
   ```

8. Vérifier les données avec une requête SQL simple :

   ```sql
   select title, slug, status, published_at
   from articles
   where status = 'published'
   order by published_at desc;
   ```
