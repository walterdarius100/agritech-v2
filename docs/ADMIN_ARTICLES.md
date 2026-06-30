# Admin articles minimal sécurisé

## Objectif

L’admin articles permet à un administrateur Agri-tech de gérer les articles Supabase sans modifier directement la base de données. Cette étape couvre uniquement les articles : pas d’upload image, pas d’éditeur riche, pas de rôles avancés et pas de backend Academy.

## Routes créées

- `/admin/login` : connexion admin par email et mot de passe Supabase Auth.
- `/admin` : mini dashboard avec compteurs d’articles.
- `/admin/articles` : liste de tous les articles avec filtres par statut.
- `/admin/articles/new` : création d’un article.
- `/admin/articles/[id]/edit` : modification d’un article existant.

## Variables d’environnement

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
ADMIN_EMAILS=
```

`ADMIN_EMAILS` contient les emails autorisés, séparés par des virgules :

```env
ADMIN_EMAILS=walter@example.com,autre-admin@example.com
```

`SUPABASE_SERVICE_ROLE_KEY` doit rester strictement côté serveur. Elle ne doit jamais être utilisée dans un composant client ni exposée dans le navigateur.

## Créer un compte admin

1. Ouvrir Supabase Dashboard.
2. Aller dans Authentication > Users.
3. Créer l’utilisateur admin avec un email et un mot de passe.
4. Ajouter exactement le même email dans `ADMIN_EMAILS`.
5. Redémarrer l’application si la variable d’environnement a changé.

Il n’y a pas d’inscription publique depuis le site.

## Sécurité retenue

La protection est volontairement simple pour cette première version :

- Supabase Auth vérifie l’email et le mot de passe.
- Le serveur vérifie que l’email connecté est présent dans `ADMIN_EMAILS`.
- Les opérations `createArticle`, `updateArticle`, `getAdminArticles` et `getAdminArticleById` s’exécutent côté serveur.
- Les écritures utilisent `SUPABASE_SERVICE_ROLE_KEY` uniquement côté serveur après validation admin.
- La lecture publique reste limitée aux articles `published` via la policy RLS existante.

Cette approche évite d’exposer la clé service role et garde une architecture progressive. Une table `admin_users` ou des rôles plus avancés pourront être ajoutés plus tard.

## Créer un article

1. Se connecter sur `/admin/login`.
2. Aller sur `/admin/articles`.
3. Cliquer sur **Nouvel article**.
4. Remplir au minimum `title`, `slug`, `category`, `excerpt` et `content`.
5. Garder `status = draft` pour un brouillon ou choisir `published` pour publier.
6. Enregistrer.

Le slug doit être en minuscules, sans accents, sans espaces, avec des tirets si nécessaire. Le bouton **Générer** peut produire un slug depuis le titre.

## Publier, archiver et mettre à la une

- Pour publier : modifier l’article, choisir `published`, puis enregistrer. Si `published_at` est vide, la date actuelle est appliquée.
- Pour archiver : choisir `archived`, puis enregistrer. L’article n’apparaît plus publiquement.
- Pour mettre à la une : cocher **Article à la une**. Lorsqu’un article est sauvegardé avec `featured = true`, les autres articles sont remis à `featured = false` côté serveur.

## Image de couverture

L’upload d’image n’est pas inclus dans cette étape. Le champ `cover_image_url` accepte uniquement une URL d’image publique. Si l’URL est vide, le site public continue d’utiliser le placeholder existant.

## Limites actuelles

- Pas encore d’upload image.
- Pas encore d’éditeur riche.
- Pas encore de rôles avancés.
- Pas de suppression d’article.
- Pas de backend Academy, paiement, certificats, CRM ou formulaire contact backend.
