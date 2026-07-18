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
