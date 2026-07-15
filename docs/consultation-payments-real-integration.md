# Paiements réels Consultation — architecture préparatoire

## Objectif

Le module Consultation utilise actuellement un paiement mock afin de valider le parcours de réservation sans intégrer de fournisseur réel. Ce document prépare l'architecture pour remplacer progressivement le mock par MonCash, NatCash ou une confirmation manuelle, sans inventer d'API et sans toucher aux paiements Academy.

## Providers prévus

Les providers Consultation prévus sont :

```txt
mock
moncash
natcash
manual
```

Le code applicatif prépare ces providers dans `src/lib/consultation-payments/`. À ce stade, seul `mock` confirme réellement un paiement dans le parcours. Les providers `moncash`, `natcash` et `manual` sont réservés pour une intégration future documentée.

## Variables d'environnement prévues

Les variables suivantes sont réservées pour une intégration future. Elles ne sont pas encore utilisées par le code tant que les API officielles ne sont pas validées :

```txt
MONCASH_CLIENT_ID
MONCASH_CLIENT_SECRET
MONCASH_ENV
NATCASH_CLIENT_ID
NATCASH_CLIENT_SECRET
NATCASH_ENV
```

Ne pas ajouter de valeurs réelles dans le dépôt. Les secrets devront être configurés dans l'environnement d'exécution sécurisé, par exemple Vercel ou Supabase selon le composant concerné.

## Abstraction applicative

Le dossier `src/lib/consultation-payments/` expose les fonctions préparatoires suivantes :

- `createConsultationPayment()` : préparer une transaction provider ou un paiement mock ;
- `confirmConsultationPayment()` : confirmer le paiement côté serveur ;
- `getConsultationPaymentStatus()` : interroger le statut provider dans une intégration future.

Le checkout mock existant utilise cette abstraction avec `provider = mock`. Les autres providers ne contactent aucune API réelle dans ce PR.

## Flow cible pour un vrai provider

Le flow attendu pour MonCash ou NatCash devra être confirmé avec la documentation officielle du fournisseur :

1. Le client arrive sur `/consultation/checkout/[requestId]`.
2. Le serveur valide que la demande existe et n'est pas déjà payée.
3. Le serveur crée une ligne `consultation_payments` avec `status = pending` ou `processing` selon les statuts retenus.
4. Le serveur appelle l'API officielle du provider pour créer une transaction externe.
5. Le provider retourne une référence et éventuellement une URL de redirection.
6. Le client est redirigé vers le provider ou suit les instructions provider.
7. Le provider appelle un webhook serveur Consultation.
8. Le webhook vérifie la signature, l'origine et l'idempotence.
9. Le serveur confirme le paiement et met à jour `consultation_requests` :
   - `payment_status = paid` ;
   - `request_status = paid` ;
   - `paid_at = now()`.
10. Le client est redirigé vers `/consultation/confirmation/[requestId]`.

## Webhooks à prévoir

Les futurs webhooks devront être spécifiques au module Consultation, par exemple :

```txt
/api/consultation/payments/webhook/moncash
/api/consultation/payments/webhook/natcash
```

Ces routes ne doivent pas réutiliser les endpoints Academy et ne doivent pas modifier `academy_payments`.

Chaque webhook devra vérifier :

- signature ou mécanisme d'authentification officiel ;
- identifiant transactionnel provider ;
- montant attendu ;
- devise attendue ;
- statut final ;
- idempotence avant toute mise à jour ;
- correspondance avec `consultation_request_id` ou `request_code` selon le mapping officiel.

## Sécurité

Règles recommandées :

- ne jamais exposer `MONCASH_CLIENT_SECRET` ou `NATCASH_CLIENT_SECRET` côté client ;
- ne jamais confirmer un paiement uniquement sur la base d'un paramètre d'URL client ;
- stocker les payloads provider utiles dans `consultation_payments.metadata`, sans données sensibles ;
- comparer montant et devise avant de passer la demande en `paid` ;
- conserver la séparation entre `consultation_payments` et `academy_payments` ;
- journaliser les erreurs sans exposer de secrets ni de données personnelles complètes.

## Informations à obtenir auprès des fournisseurs

Avant toute intégration réelle, obtenir et vérifier :

- endpoints officiels sandbox et production ;
- méthode d'authentification ;
- format de création de transaction ;
- format de redirection checkout ;
- format des statuts ;
- mécanisme de webhook ou callback ;
- vérification de signature ;
- stratégie de remboursement ou annulation ;
- contraintes de devise et montants ;
- documentation officielle écrite et à jour.

## Limites actuelles

- Aucune API MonCash ou NatCash réelle n'est appelée.
- Aucun endpoint webhook réel n'est ajouté.
- Le mock reste le seul provider actif dans le checkout Consultation.
- `manual` est réservé comme provider futur pour une validation interne plus structurée.
- L'idempotence actuelle repose sur la vérification applicative d'un paiement `paid` existant ; une intégration réelle devrait renforcer cette protection avec une contrainte ou une clé d'idempotence côté base.

## Avertissement

Ne pas inventer d'endpoint MonCash ou NatCash. Ne pas intégrer de provider réel sans documentation officielle, environnement de test, stratégie de webhook, validation de signature et plan de rollback.
