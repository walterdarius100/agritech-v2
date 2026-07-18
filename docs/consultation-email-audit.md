# Audit — emails transactionnels Consultation

Date d’audit : 2026-07-18.

## Périmètre inspecté avant modification

- Routes publiques Consultation : `src/app/consultation/page.tsx`, `src/app/consultation/reserver/page.tsx`, `src/app/consultation/checkout/[requestId]/page.tsx`, `src/app/consultation/confirmation/[requestId]/page.tsx`.
- Admin Consultation : `src/app/admin/consultations/page.tsx`, `src/app/admin/consultations/[requestId]/page.tsx`, `src/components/admin/ConsultationRequestAdminForm.tsx`.
- Formulaire public : `src/components/consultation/ConsultationReservationForm.tsx`, `src/lib/consultation/createConsultationRequest.ts`.
- Checkout mock : `src/components/consultation/ConsultationMockPaymentForm.tsx`, `src/lib/consultation/checkout.ts`, `src/lib/consultation-payments/providers/mock.ts`.
- Services Consultation : `src/lib/consultation/checkout.ts`, `src/lib/consultation/emails.ts`, `src/lib/consultation/options.ts`, `src/lib/consultation/adminConsultations.ts`.
- Services email : `src/lib/email/send-email.ts`, `src/lib/email/brevo.ts`, `src/lib/email/config.ts`, `src/lib/email/templates/consultation-paid.ts`.
- Supabase : `supabase/migrations/20260714_create_consultation_tables.sql`, `supabase/migrations/20260716_add_consultation_email_sent_at.sql`, `supabase/migrations/20260716_require_consultation_request_email.sql`.
- Documentation : `docs/consultation-module.md`, `docs/email-communication.md`, `README.md`, `.env.example`.

## État initial constaté

- La table `consultation_requests` existe avec les informations de demande, paiement, statut, timestamps et informations client.
- Les marqueurs anti-doublon `client_email_sent_at` et `internal_email_sent_at` existent via migration Supabase.
- Une contrainte `consultation_requests_email_required` existe pour exiger l’email sur les nouvelles demandes, sans modifier les anciennes lignes.
- Le formulaire public valide déjà les champs obligatoires : nom complet, téléphone WhatsApp, email, domaine concerné et description.
- Un service Brevo serveur existe et lit `BREVO_API_KEY` côté serveur via `process.env`.
- Des templates email Consultation en code existent pour la confirmation client et la notification interne.
- Le paiement mock met à jour `payment_status = paid`, `request_status = paid` et `paid_at`, puis appelle le workflow email.
- Les emails ne sont pas envoyés à la création de la demande ; ils sont déclenchés après confirmation du paiement mock.

## Éléments manquants ou incorrects

- Certaines documentations mentionnaient l’adresse invalide `projet@agritech509ht.com` au lieu de l’adresse officielle `projets@agritech509ht.com`.
- `.env.example` conservait `AGRI_TECH_NOTIFICATION_EMAIL`, variable obsolète pour Consultation ; elle reste documentée comme obsolète, mais le code Consultation utilise `CONSULTATION_NOTIFICATION_EMAIL`.
- Les logs du workflow paiement/email n’étaient pas alignés avec la checklist demandée.
- La fonction `sendConsultationPaidEmails` recevait surtout un objet déjà chargé ; elle accepte maintenant aussi un `requestId` et recharge la demande depuis Supabase pour garantir le comportement attendu et faciliter les relances anti-doublon.
- Le template interne ne listait pas explicitement le stade du projet dans le HTML.

## Plan de correction retenu

1. Garder l’architecture existante et éviter toute refonte du module Consultation.
2. Corriger les références documentaires actives vers `projets@agritech509ht.com`.
3. Renforcer les logs serveur demandés sans logger de secret.
4. Faire accepter un `requestId` à `sendConsultationPaidEmails` afin que la fonction charge la demande depuis Supabase, vérifie le paiement, respecte les marqueurs anti-doublon et ne remplisse les timestamps qu’après succès Brevo.
5. Appeler la fonction après paiement mock confirmé avec `await sendConsultationPaidEmails(supabase, requestId)`.
6. Documenter la configuration Vercel Preview/Production/Development et la vérification des logs Vercel/Brevo.

## Variables d’environnement Consultation attendues

```env
BREVO_API_KEY=...
EMAIL_FROM_NAME=Agri-tech
EMAIL_FROM_ADDRESS=noreply@agritech509ht.com
EMAIL_REPLY_TO=support@agritech509ht.com
CONSULTATION_REPLY_TO_EMAIL=projets@agritech509ht.com
CONSULTATION_NOTIFICATION_EMAIL=projets@agritech509ht.com
```

`NEXT_PUBLIC_BREVO_API_KEY` ne doit jamais être créée. La clé Brevo doit rester strictement serveur.

## Vérifications de déploiement

- Vercel Development, Preview et Production doivent contenir les variables nécessaires dans l’environnement réellement testé.
- Si le workflow est testé sur une Preview Vercel, vérifier les variables Preview et les logs Preview.
- Si le workflow est testé en production, vérifier les variables Production et les logs Production.
- Dans Brevo, vérifier les logs transactionnels pour l’email client et l’email interne envoyé à `projets@agritech509ht.com`.

## Conclusion

La cause principale du risque était un mélange entre documentation obsolète, logs insuffisants et une signature de fonction moins explicite que le workflow attendu. Les corrections restent minimales : elles sécurisent la configuration officielle, la traçabilité, le chargement serveur par `requestId`, les marqueurs anti-doublon et les templates en code, sans modifier Academy, certificats, paiements Academy, paiement réel MonCash/NatCash ni design global.

## Diagnostic complémentaire — incident emails non tentés

Point d’entrée réel du module Consultation mock : la Server Action `confirmConsultationMockPayment()` dans `src/lib/consultation/checkout.ts`, appelée par le formulaire `ConsultationMockPaymentForm`. Il n’existe pas encore de webhook Consultation MonCash/NatCash réel ; les documents d’intégration précisent que les futurs webhooks devront être ajoutés séparément après réception de la documentation fournisseur.

Cause racine la plus probable pour le symptôme « aucun événement Brevo » : le paiement était confirmé côté Supabase, mais le workflow email pouvait s’arrêter avant l’appel HTTP Brevo lorsque la configuration serveur obligatoire était absente ou invalide (`BREVO_API_KEY`, `EMAIL_FROM_ADDRESS`, `CONSULTATION_NOTIFICATION_EMAIL`) ou lorsque la demande ne possédait pas un contexte payé complet. La correction force maintenant le rechargement de la demande et du paiement payé depuis Supabase, journalise les étapes, exige un paiement confirmé côté backend (`consultation_requests` + ligne `consultation_payments` payée), et enregistre une erreur explicite au lieu d’un arrêt silencieux.

## Relance sûre des emails échoués

Procédure admin recommandée :

1. vérifier dans Supabase que la demande est réellement payée : `payment_status = 'paid'`, `request_status = 'paid'`, `paid_at IS NOT NULL` ;
2. vérifier qu’une ligne `consultation_payments` associée existe avec `status = 'paid'` et `paid_at IS NOT NULL` ;
3. ouvrir `/consultation/checkout/[requestId]` avec un accès autorisé au contexte admin/opérateur ou déclencher la Server Action de confirmation mock existante ;
4. le backend relance `sendConsultationPaidEmails(supabase, requestId)` ;
5. le workflow ignore les emails déjà envoyés (`*_email_sent_at IS NOT NULL`) et retente seulement les emails dont le marqueur est vide ;
6. consulter les logs `[consultation-payment]`, `[consultation-email]` et `[Email]` pour le résumé `sent`, `skipped_already_sent`, `skipped_locked` ou `failed`.

Les verrous `client_email_processing_at` et `internal_email_processing_at` évitent les doubles envois concurrents. Un verrou de plus de dix minutes est considéré comme expiré afin de permettre une relance après crash serverless.

## Procédure de test production/Preview

1. Déployer la branche sur l’environnement Vercel à tester.
2. Vérifier dans Vercel que `BREVO_API_KEY`, `EMAIL_FROM_NAME`, `EMAIL_FROM_ADDRESS`, `EMAIL_REPLY_TO`, `CONSULTATION_REPLY_TO_EMAIL` et `CONSULTATION_NOTIFICATION_EMAIL` existent dans ce même environnement.
3. Vérifier dans Brevo que `noreply@agritech509ht.com` est un expéditeur autorisé/vérifié.
4. Créer une demande Consultation avec un email client réel.
5. Confirmer le paiement mock depuis le checkout.
6. Vérifier dans Supabase la ligne `consultation_requests` et la ligne `consultation_payments` payées.
7. Vérifier dans les logs Vercel les étapes `provider confirmation started`, `payment update success`, `calling sendConsultationPaidEmails`, `calling Brevo transactional endpoint`, puis `Brevo transactional endpoint accepted message`.
8. Vérifier dans Brevo les deux événements transactionnels : client et interne vers `projets@agritech509ht.com`.
9. Vérifier que `client_email_sent_at` / `internal_email_sent_at` et `client_email_message_id` / `internal_email_message_id` sont remplis uniquement après acceptation Brevo.
10. Rejouer la confirmation pour vérifier l’idempotence : les emails déjà envoyés doivent être ignorés.

## Paiement réel ou webhook de test futur

Le module Consultation ne possède toujours pas de webhook réel MonCash/NatCash. Pour un futur test de paiement réel, ajouter d’abord une route `/api/consultation/payments/webhook/[provider]` qui vérifie la signature fournisseur, normalise les statuts (`paid`, `successful`, `completed`, etc.), met à jour Supabase côté serveur, puis appelle `await sendConsultationPaidEmails(supabase, requestId)`. Ne jamais valider un paiement réel uniquement depuis un paramètre d’URL navigateur.
