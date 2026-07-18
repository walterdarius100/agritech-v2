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
EMAIL_REPLY_TO=support@agritech509ht.com
CONSULTATION_REPLY_TO_EMAIL=projets@agritech509ht.com
CONSULTATION_NOTIFICATION_EMAIL=projets@agritech509ht.com
```

`projets@agritech509ht.com` est l’adresse officielle des consultations/projets clients. `projet@agritech509ht.com` est invalide et ne doit pas être utilisée.

Règles importantes :

- `BREVO_API_KEY` doit rester côté serveur uniquement ;
- ne jamais créer de variable `NEXT_PUBLIC_BREVO_API_KEY` ;
- `EMAIL_FROM_ADDRESS` doit utiliser un domaine ou expéditeur vérifié dans Brevo ;
- `EMAIL_REPLY_TO` est le fallback général, typiquement `support@agritech509ht.com` ;
- `CONSULTATION_REPLY_TO_EMAIL` doit être utilisé pour les réponses aux emails Consultation, typiquement `projets@agritech509ht.com` ;
- `CONSULTATION_NOTIFICATION_EMAIL` doit recevoir les notifications internes Consultation, typiquement `projets@agritech509ht.com`.

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

## Emails Consultation payée

Les emails Consultation sont envoyés uniquement après confirmation du paiement mock, quand la demande est mise à jour en `payment_status = paid` et `request_status = paid`. Aucun email n’est envoyé à la simple soumission du formulaire.

Emails branchés :

- confirmation client : destinataire `consultation_requests.email` si fourni, objet `Confirmation de votre demande de consultation — Agri-tech`, reply-to `CONSULTATION_REPLY_TO_EMAIL` puis fallback `EMAIL_REPLY_TO` ;
- notification interne : destinataire `CONSULTATION_NOTIFICATION_EMAIL`, objet `Nouvelle consultation payée — [REQUEST_CODE]`.

Le service n’utilise jamais `admin@agritech509ht.com` pour les consultations. L’expéditeur automatique reste la configuration globale `EMAIL_FROM_NAME` + `EMAIL_FROM_ADDRESS`, typiquement `Agri-tech <noreply@agritech509ht.com>`.

### Anti-doublon Consultation

La table `consultation_requests` contient deux marqueurs :

```txt
client_email_sent_at
internal_email_sent_at
```

Le service n’envoie pas un email dont le marqueur est déjà rempli. Le formulaire Consultation rend désormais l’email client obligatoire, mais une ancienne demande sans email est ignorée proprement côté client et `client_email_sent_at` reste vide. Si Brevo échoue ou si la configuration est absente, le paiement reste confirmé et le marqueur correspondant reste vide pour permettre une relance future.

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
- Les workflows métier doivent traiter l’email comme un effet secondaire non bloquant.
- `admin@agritech509ht.com` reste réservé à l’interne technique et ne doit pas être utilisé comme expéditeur public, reply-to client ou notification Consultation.

## Comment tester

Tests techniques minimum :

```bash
npm run lint
npm run build
```

Test manuel futur, uniquement après configuration serveur :

1. créer une action ou route admin protégée ;
2. envoyer un email à `CONSULTATION_NOTIFICATION_EMAIL` uniquement ;
3. vérifier les logs serveur et la réception Brevo ;
4. supprimer ou garder la route uniquement si elle reste strictement protégée.

Aucune route de test admin n’est créée dans ce PR, car l’infrastructure centrale suffit et évite d’exposer une surface HTTP supplémentaire.

## Limites actuelles

- Le workflow Consultation mock appelle maintenant `sendTransactionalEmail()` uniquement après paiement confirmé.
- Academy, certificats et paiements Academy n’appellent pas encore `sendTransactionalEmail()`.
- Les templates métier Consultation payée sont créés ; les autres domaines n’ont pas encore de templates spécialisés.
- Une migration Supabase anti-doublon Consultation ajoute `client_email_sent_at` et `internal_email_sent_at`.
- Aucun tableau d’historique `email_events` n’est ajouté.

## Diagnostic et configuration Consultation

Les emails Consultation partent uniquement côté serveur après paiement confirmé. Les variables attendues sont `BREVO_API_KEY`, `EMAIL_FROM_NAME`, `EMAIL_FROM_ADDRESS`, `EMAIL_REPLY_TO`, `CONSULTATION_REPLY_TO_EMAIL` et `CONSULTATION_NOTIFICATION_EMAIL`. Si `BREVO_API_KEY`, `EMAIL_FROM_ADDRESS` ou `CONSULTATION_NOTIFICATION_EMAIL` manque, le paiement reste confirmé, l’erreur est loggée et le marqueur `client_email_sent_at` ou `internal_email_sent_at` concerné reste vide.

Checklist Vercel/Brevo : vérifier que `noreply@agritech509ht.com` est un sender Brevo autorisé, que `agritech509ht.com` est authentifié, que `BREVO_API_KEY` est configurée dans l’environnement Vercel réellement déployé, que le déploiement a été relancé après ajout des variables, que le plan Brevo autorise l’envoi transactionnel et que les logs Brevo montrent les tentatives d’envoi.
