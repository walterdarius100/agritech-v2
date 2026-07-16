# Communication email transactionnelle — Brevo

## Objectif

Le module email centralise l’infrastructure technique Brevo côté serveur. Il prépare les futurs emails transactionnels Agri-tech sans modifier les workflows Consultation, Academy, certificats ou paiements dans ce PR.

## Fichiers ajoutés

```txt
src/lib/email/brevo.ts
src/lib/email/send-email.ts
src/lib/email/types.ts
src/lib/email/templates/base-email-template.ts
```

## Variables d’environnement

Variables attendues côté serveur :

```env
BREVO_API_KEY=
EMAIL_FROM_NAME=Agri-tech
EMAIL_FROM_ADDRESS=noreply@agritech509ht.com
AGRI_TECH_NOTIFICATION_EMAIL=projet@agritech509ht.com
EMAIL_REPLY_TO=projet@agritech509ht.com
```

Règles importantes :

- `BREVO_API_KEY` doit rester côté serveur uniquement ;
- ne jamais créer de variable `NEXT_PUBLIC_BREVO_API_KEY` ;
- `EMAIL_FROM_ADDRESS` doit utiliser un domaine ou expéditeur vérifié dans Brevo ;
- `EMAIL_REPLY_TO` peut pointer vers l’adresse opérationnelle de l’équipe ;
- `AGRI_TECH_NOTIFICATION_EMAIL` est l’adresse interne cible pour les futurs emails admin.

## Configuration Brevo

Avant activation réelle :

1. vérifier le domaine ou l’expéditeur dans Brevo ;
2. configurer `BREVO_API_KEY` dans l’environnement serveur ;
3. configurer `EMAIL_FROM_NAME` et `EMAIL_FROM_ADDRESS` ;
4. vérifier que l’application n’importe le module email que depuis du code serveur ;
5. tester avec une adresse interne Agri-tech avant tout branchement métier.

## Fonction d’envoi

La fonction centrale est `sendTransactionalEmail()` dans `src/lib/email/send-email.ts`.

Elle reçoit :

```ts
sendTransactionalEmail({
  to,
  subject,
  html,
  text,
  replyTo,
});
```

Elle retourne un résultat typé :

- `ok: true` si Brevo accepte l’email ;
- `ok: false` avec `reason` si la configuration manque, si un destinataire est invalide ou si Brevo retourne une erreur ;
- `skipped: true` lorsque l’email est volontairement ignoré faute de configuration.

## Template de base

`src/lib/email/templates/base-email-template.ts` fournit un layout HTML sobre avec :

- nom Agri-tech ;
- titre ;
- contenu principal injecté côté serveur ;
- footer transactionnel ;
- adresse de réponse optionnelle.

Ce template est volontairement minimal afin de rester maintenable et compatible avec les clients email.

## Mode développement

Si `BREVO_API_KEY` ou l’expéditeur sont absents, `sendTransactionalEmail()` ne plante pas l’application. La fonction :

- logge côté serveur que l’email transactionnel a été ignoré ;
- retourne une erreur contrôlée `missing_configuration` ;
- n’expose aucun secret ;
- ne lance pas d’exception vers le workflow appelant.

Ce comportement permet de développer localement sans envoyer d’emails réels.

## Sécurité

- Le module importe `server-only` pour éviter son utilisation dans un bundle client Next.js.
- La clé Brevo est lue uniquement via `process.env.BREVO_API_KEY`.
- Aucun secret n’est écrit dans les logs ou dans les résultats retournés.
- Les destinataires sont normalisés et validés avant envoi.
- Les erreurs Brevo sont loggées côté serveur avec un contexte minimal.
- Les futurs workflows métier devront traiter l’email comme un effet secondaire non bloquant.

## Comment tester

Tests techniques minimum :

```bash
npm run lint
npm run build
```

Test manuel futur, uniquement après configuration serveur :

1. créer une action ou route admin protégée ;
2. envoyer un email à `AGRI_TECH_NOTIFICATION_EMAIL` uniquement ;
3. vérifier les logs serveur et la réception Brevo ;
4. supprimer ou garder la route uniquement si elle reste strictement protégée.

Aucune route de test admin n’est créée dans ce PR, car l’infrastructure centrale suffit et évite d’exposer une surface HTTP supplémentaire.

## Limites actuelles

- Aucun workflow Consultation, Academy, certificats ou paiements n’appelle encore `sendTransactionalEmail()`.
- Aucun email métier automatique n’est envoyé.
- Aucun template métier spécialisé n’est encore créé.
- Aucune migration Supabase anti-doublon n’est ajoutée.
- Aucun tableau d’historique `email_events` n’est ajouté.
