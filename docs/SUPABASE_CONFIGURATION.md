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
