# Agri-tech V2

Agri-tech V2 est la refonte moderne du site Agri-tech avec Next.js, Supabase et une architecture évolutive pour les articles, les leads, les formations et la future Academy.

La V1 est actuellement live sur <https://agritech509ht.com> avec HTML, CSS, JavaScript vanilla, GitHub Pages, Cloudflare, Supabase, EmailJS et Microsoft Clarity. La V2 est développée en parallèle dans ce dépôt afin de construire une base plus robuste, modulaire, SEO-friendly et prête pour Vercel.

## Stack technique

- Next.js App Router
- React et TypeScript
- Tailwind CSS
- ESLint et Prettier
- Supabase-ready
- Microsoft Clarity-ready
- Google Analytics 4-ready
- Architecture modulaire sous `src/`

## Installation locale

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Commandes disponibles

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run format:check
```

## Variables d'environnement

Copier `.env.example` vers `.env.local` puis renseigner uniquement les valeurs utiles :

```txt
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=
NEXT_PUBLIC_CLARITY_PROJECT_ID=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
BREVO_API_KEY=
EMAIL_FROM_NAME=Agri-tech
EMAIL_FROM_ADDRESS=noreply@agritech509ht.com
EMAIL_REPLY_TO=support@agritech509ht.com
CONSULTATION_REPLY_TO_EMAIL=projets@agritech509ht.com
CONSULTATION_NOTIFICATION_EMAIL=projets@agritech509ht.com
```

Aucune vraie clé ne doit être commitée. Le projet démarre sans clés Supabase ou analytics tant que les fonctionnalités correspondantes ne sont pas utilisées.

Pour les emails Consultation, `projets@agritech509ht.com` est l’adresse officielle des consultations/projets clients. L’ancienne adresse `projet@agritech509ht.com` est invalide et ne doit pas être utilisée.

## Structure des dossiers

```txt
src/app              Routes App Router et layout global
src/components       Composants layout, UI et futurs blocs métier
src/config           Configuration centrale du site
src/data             Données statiques de départ
src/lib              Environnement, SEO, analytics, Supabase
src/types            Types TypeScript principaux
docs                 Documentation produit et roadmap
```

Pour l’organisation des images, logos, favicons et assets visuels, consulter `docs/ASSETS_GUIDE.md`.

Pour l’espace admin minimal des articles, consulter `docs/ADMIN_ARTICLES.md`.

## Stratégie Supabase

La V2 prépare des clients Supabase côté navigateur, serveur et admin, sans modifier la base distante et sans migration dans cette première étape. La table `articles` de la V1 est représentée par un type TypeScript compatible pour faciliter une intégration progressive.

## Stratégie analytics

Microsoft Clarity et Google Analytics 4 sont centralisés dans `src/lib/analytics`. Les scripts ne se chargent pas si les identifiants publics ne sont pas définis, ce qui évite les doublons et les erreurs en développement.

## Stratégie SEO

Les métadonnées globales sont définies dans le layout racine avec titre, description, Open Graph, Twitter Card, locale `fr_HT` et canonical. Le helper `createMetadata` prépare les pages et futurs articles dynamiques.

## Future Agri-tech Academy

Cette fondation ne construit pas encore l'Academy. Elle prépare l'organisation nécessaire pour ajouter ensuite comptes utilisateurs, cours, inscriptions, ressources pédagogiques et éventuelle validation d'accès ou paiement.

## Règles de sécurité

- Ne jamais commiter de vraies clés.
- Ne pas exposer `SUPABASE_SERVICE_ROLE_KEY` côté client.
- Ne pas modifier la base Supabase existante sans phase dédiée.
- Ne pas ajouter Clerk, Prisma ou une autre base de données.
- Garder Supabase comme direction principale.

## Prochaines étapes

1. Finaliser les contenus du site public V2.
2. Brancher les articles publiés depuis Supabase.
3. Ajouter le formulaire de contact et la gestion des leads.
4. Concevoir l'espace admin sécurisé.
5. Structurer les formations et préparer Agri-tech Academy.

## Documentation Supabase

- Documentation Supabase : [docs/SUPABASE_CONFIGURATION.md](docs/SUPABASE_CONFIGURATION.md)
- Documentation Articles : [docs/SUPABASE_ARTICLES.md](docs/SUPABASE_ARTICLES.md)
