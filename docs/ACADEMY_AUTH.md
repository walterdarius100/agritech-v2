# Agri-tech Academy — Auth étudiant

## Séparation admin / étudiant

- `/admin/login` reste l’entrée administration et l’autorisation admin reste basée sur `ADMIN_EMAILS`.
- `/academy/login` et `/academy/register` sont dédiées aux étudiants.
- Un étudiant n’a pas besoin d’être ajouté à `ADMIN_EMAILS` pour se connecter à l’Academy.
- À l’inscription, une ligne `profiles` est créée ou complétée avec `role = student`. Après cette création de profil, le serveur tente d’envoyer l’email Brevo de bienvenue Academy avec `ACADEMY_REPLY_TO_EMAIL=formation@agritech509ht.com`; l’échec Brevo ne bloque pas le compte et `profiles.welcome_email_sent_at` reste `NULL` pour éviter les doublons uniquement après succès réel.

## Confirmation email Supabase

Si la confirmation email est activée dans Supabase, `signUp` peut créer l’utilisateur sans session immédiate. L’étudiant doit confirmer son email avant de pouvoir se connecter.

Message attendu en cas de blocage Supabase :

```txt
Votre adresse email doit être confirmée avant la connexion. Vérifiez votre boîte mail.
```

Pour tester rapidement en local, deux options :

1. garder la confirmation email activée et cliquer le lien reçu ;
2. désactiver temporairement la confirmation email dans Supabase Auth uniquement pour un test local contrôlé.

## URLs Supabase Auth à configurer

Dans Supabase Auth, configurer :

```txt
Site URL local: http://localhost:3000
Site URL production: https://votre-domaine
Redirect URLs:
  http://localhost:3000/academy/login
  http://localhost:3000/academy/dashboard
  https://votre-domaine/academy/login
  https://votre-domaine/academy/dashboard
  https://*.vercel.app/academy/login
  https://*.vercel.app/academy/dashboard
```

`NEXT_PUBLIC_SITE_URL` est utilisé pour générer l’URL de confirmation vers `/academy/login?registered=1`.
