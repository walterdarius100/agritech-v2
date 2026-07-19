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
ACADEMY_NOTIFICATION_EMAIL=formation@agritech509ht.com
ACADEMY_REPLY_TO_EMAIL=formation@agritech509ht.com
CONTACT_NOTIFICATION_EMAIL=contact@agritech509ht.com
CONTACT_REPLY_TO_EMAIL=contact@agritech509ht.com
```

Aucune vraie clé ne doit être commitée. Le projet démarre sans clés Supabase, Brevo ou analytics tant que les fonctionnalités correspondantes ne sont pas utilisées. La clé Brevo doit rester serveur uniquement via `BREVO_API_KEY` ; ne jamais créer `NEXT_PUBLIC_BREVO_API_KEY`. Le formulaire Contact envoie sa notification interne à `CONTACT_NOTIFICATION_EMAIL=contact@agritech509ht.com` et utilise `CONTACT_REPLY_TO_EMAIL=contact@agritech509ht.com` pour les réponses. `projet@agritech509ht.com` est invalide ; `projets@agritech509ht.com` avec `s` est réservé aux consultations/projets clients.


### Emails transactionnels Academy

Les emails Academy utilisent Brevo côté serveur après création réussie du compte étudiant et après confirmation du paiement mock Academy. Configurer `ACADEMY_NOTIFICATION_EMAIL=formation@agritech509ht.com` et `ACADEMY_REPLY_TO_EMAIL=formation@agritech509ht.com` en plus des variables globales `BREVO_API_KEY`, `EMAIL_FROM_NAME`, `EMAIL_FROM_ADDRESS` et `EMAIL_REPLY_TO`.

Après inscription Academy simple, l’étudiant reçoit uniquement l’email de bienvenue Brevo `Bienvenue sur Agri-tech Academy` avec `Reply-To: formation@agritech509ht.com`; si Supabase Auth exige une confirmation, son email système technique reste séparé et le contenu de bienvenue rappelle de confirmer l’adresse. Le marqueur `profiles.welcome_email_sent_at` évite les doublons et reste vide si Brevo échoue afin de permettre une relance future sans bloquer la création du compte. Après achat confirmé seulement, l’étudiant reçoit un email unique confirmation achat + accès, et Agri-tech reçoit une notification interne à l’adresse Academy officielle. Les marqueurs `student_purchase_email_sent_at` et `internal_purchase_email_sent_at` dans `academy_payments` protègent contre les doublons achat et ne sont remplis qu’après succès Brevo.

`projet@agritech509ht.com` est invalide ; `projets@agritech509ht.com` avec `s` reste réservé aux consultations/projets clients. La clé Brevo ne doit jamais être exposée côté client via `NEXT_PUBLIC_BREVO_API_KEY`.

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
