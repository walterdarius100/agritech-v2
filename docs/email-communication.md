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
- L’historique global `email_events` est ajouté pour tracer les emails sans remplacer les marqueurs anti-doublon.

## Diagnostic et configuration Consultation

Les emails Consultation partent uniquement côté serveur après paiement confirmé. Les variables attendues sont `BREVO_API_KEY`, `EMAIL_FROM_NAME`, `EMAIL_FROM_ADDRESS`, `EMAIL_REPLY_TO`, `CONSULTATION_REPLY_TO_EMAIL` et `CONSULTATION_NOTIFICATION_EMAIL`. Si `BREVO_API_KEY`, `EMAIL_FROM_ADDRESS` ou `CONSULTATION_NOTIFICATION_EMAIL` manque, le paiement reste confirmé, l’erreur est loggée et le marqueur `client_email_sent_at` ou `internal_email_sent_at` concerné reste vide.

Checklist Vercel/Brevo : vérifier que `noreply@agritech509ht.com` est un sender Brevo autorisé, que `agritech509ht.com` est authentifié, que `BREVO_API_KEY` est configurée dans l’environnement Vercel réellement déployé, que le déploiement a été relancé après ajout des variables, que le plan Brevo autorise l’envoi transactionnel et que les logs Brevo montrent les tentatives d’envoi.

## Emails Contact

Le formulaire public Contact se trouve sur la route `src/app/contact/page.tsx` et rend `src/components/contact/ContactForm.tsx` via `ContactFormShell`. La soumission côté client appelle `POST /api/contact`, puis la route `src/app/api/contact/route.ts` délègue au workflow serveur `src/lib/contact/createContactRequest.ts`.

Champs réellement utilisés par le formulaire Contact : `full_name`, `email`, `phone`, `organization`, `request_type`, `subject`, `message`, ainsi que les champs de contexte `service_slug`, `service_title`, `formation_slug`, `course_slug`, `course_title` et `source_page` quand la page d’origine les fournit. Les messages sont enregistrés dans Supabase dans la table `contact_requests` avant tout envoi Brevo.

Après une soumission validée et enregistrée, le workflow Contact déclenche deux emails transactionnels Brevo côté serveur :

- notification interne à `CONTACT_NOTIFICATION_EMAIL`, attendue à `contact@agritech509ht.com`, avec l’objet `Nouveau message reçu depuis le site Agri-tech` ;
- accusé de réception visiteur à l’adresse du formulaire, uniquement si l’email visiteur est présent et valide, avec l’objet `Nous avons bien reçu votre message — Agri-tech`.

Les emails Contact utilisent l’expéditeur global `EMAIL_FROM_NAME` + `EMAIL_FROM_ADDRESS`, typiquement `Agri-tech <noreply@agritech509ht.com>`. Le reply-to Contact est `CONTACT_REPLY_TO_EMAIL`, attendu à `contact@agritech509ht.com`, avec fallback technique sur `EMAIL_REPLY_TO` si la variable dédiée manque.

Variables Contact attendues :

```env
CONTACT_NOTIFICATION_EMAIL=contact@agritech509ht.com
CONTACT_REPLY_TO_EMAIL=contact@agritech509ht.com
```

Le workflow Contact n’utilise pas `AGRI_TECH_NOTIFICATION_EMAIL`, `CONSULTATION_NOTIFICATION_EMAIL` ni `CONSULTATION_REPLY_TO_EMAIL`. L’adresse `projet@agritech509ht.com` est invalide et ne doit jamais être utilisée. L’adresse `projets@agritech509ht.com` avec `s` est réservée aux consultations/projets clients, pas au formulaire Contact.

Si Brevo échoue ou si la configuration email serveur est absente, la demande Contact reste enregistrée dans Supabase. L’erreur est loggée côté serveur sans secret et l’API retourne un message utilisateur contrôlé indiquant que le message est reçu mais que l’accusé de réception n’a pas pu être confirmé. L’échec de l’accusé visiteur n’empêche pas la tentative de notification interne.

Protection anti-doublon Contact : le formulaire client possède déjà un état `isSubmitting` qui désactive la soumission rapide. Le serveur ajoute aussi une fenêtre anti-doublon courte en mémoire sur les champs principaux de la demande. Aucun marqueur `visitor_email_sent_at` ou `internal_email_sent_at` n’est ajouté car la table Contact existante est seulement utilisée via une insertion simple et aucune migration Contact dédiée n’est introduite dans ce PR.

## Emails transactionnels Academy

### Audit et décision inscription

L’inscription Academy passe par `supabase.auth.signUp()` dans la Server Action `registerStudent`. Cette action configure déjà `emailRedirectTo` vers `/academy/login` pour le lien de confirmation Supabase Auth, puis crée ou complète la ligne `profiles` avec `role = student`. Le déclencheur Brevo de bienvenue est exécuté côté serveur juste après cette création de profil, sans activer d’enrollment, sans paiement et sans notification interne d’achat. Si la confirmation email Supabase est activée, l’email système de confirmation reste séparé : le message Brevo de bienvenue ne remplace pas cet email technique et précise que l’étudiant doit confirmer son adresse si une vérification est requise.

### Layout graphique Agri-tech

Les emails transactionnels partagent le layout HTML `baseEmailTemplate()` : fond clair `#f6f7f4`, carte centrale blanche, en-tête vert `#1f4d2b`, titre vert, tableaux de détails compatibles email et pied de page discret. Ce layout est déjà utilisé par les emails Consultation et Contact ; les emails Academy l’utilisent maintenant également pour garder une cohérence graphique sans modifier les déclencheurs métier.

### Bienvenue après inscription simple

L’email de bienvenue Academy a pour objet `Bienvenue sur Agri-tech Academy`, pointe vers `/academy/dashboard` avec une URL absolue basée sur `NEXT_PUBLIC_SITE_URL`, utilise l’expéditeur global `EMAIL_FROM_NAME=Agri-tech` / `EMAIL_FROM_ADDRESS=noreply@agritech509ht.com`, et force le `Reply-To` via `ACADEMY_REPLY_TO_EMAIL=formation@agritech509ht.com`. Son HTML reprend le layout Agri-tech avec carte centrale, contenu hiérarchisé, bouton `Accéder à mon espace Academy` et version texte brute. Une inscription simple ne déclenche aucun email achat/accès, aucune notification interne Academy et aucun marqueur lié à `academy_payments`.

Le marqueur anti-doublon choisi est `profiles.welcome_email_sent_at`, ajouté par la migration `supabase/migrations/20260718_add_academy_welcome_email_marker.sql`. Il est rempli uniquement après succès réel de `sendTransactionalEmail()` / Brevo. Si Brevo échoue, si `BREVO_API_KEY` ou l’expéditeur sont absents, ou si l’email étudiant est invalide, la création du compte reste valide, l’erreur est loggée côté serveur sans secret et `welcome_email_sent_at` reste `NULL` pour permettre une relance future.

### Achat mock et accès formation

Le paiement mock Academy est confirmé côté serveur par `POST /api/academy/payments/mock-confirm`. Quand le résultat mock est `success`, le statut devient `paid`, `paid_at` et `verified_at` sont renseignés, puis `activateCourseAccessAfterPayment()` active ou met à jour l’enrollment Academy. Les emails Academy sont déclenchés uniquement après cette activation d’accès, afin de ne pas annoncer un accès avant paiement confirmé.

Un seul email étudiant combine la confirmation d’achat et l’accès à la formation avec l’objet `Confirmation de votre inscription à la formation « [COURSE_TITLE] »`. Le HTML reprend le layout Agri-tech, ajoute un tableau de détails formation/montant/statut et un bouton `Voir mes cours` vers `/academy/mes-cours`, qui est la page stable de consultation des cours actifs. La version texte brute reste disponible.

### Notification interne Academy

Après achat confirmé, une notification interne est envoyée à `ACADEMY_NOTIFICATION_EMAIL`, attendu à `formation@agritech509ht.com`. Le HTML reprend le même style que la notification interne Consultation : phrase de contexte, tableau de détails et lien admin discret. Le `Reply-To` Academy utilise `ACADEMY_REPLY_TO_EMAIL`, attendu à `formation@agritech509ht.com`. Ces variables dédiées évitent toute confusion avec les variables Contact ou Consultation.

### Anti-doublon et échecs Brevo

Pour les inscriptions simples, la table `profiles` reçoit le marqueur `welcome_email_sent_at`. Pour les achats, la table `academy_payments` reçoit deux marqueurs anti-doublon : `student_purchase_email_sent_at` et `internal_purchase_email_sent_at`. Chaque marqueur est rempli uniquement après succès réel de `sendTransactionalEmail()` / Brevo. Si Brevo échoue, si la configuration serveur est absente ou si l’email étudiant est invalide, le paiement et l’accès restent valides, l’erreur est loggée côté serveur sans secret et le marqueur reste vide pour permettre une relance future. L’échec de l’email étudiant n’empêche pas la tentative de notification interne.

### Variables et adresses officielles

Variables Academy à configurer côté serveur, notamment sur Vercel :

```txt
ACADEMY_NOTIFICATION_EMAIL=formation@agritech509ht.com
ACADEMY_REPLY_TO_EMAIL=formation@agritech509ht.com
```

Le module continue d’utiliser les variables globales serveur `BREVO_API_KEY`, `EMAIL_FROM_NAME`, `EMAIL_FROM_ADDRESS` et `EMAIL_REPLY_TO`. Ne jamais créer ni utiliser `NEXT_PUBLIC_BREVO_API_KEY`.

Adresse officielle Academy : `formation@agritech509ht.com`. L’adresse `projet@agritech509ht.com` est invalide et ne doit jamais être utilisée. L’adresse `projets@agritech509ht.com` avec `s` est réservée aux consultations/projets clients, pas à Academy.

### Certificat Academy disponible

Lorsqu’un certificat Academy est réellement créé dans `academy_certificates`, le serveur déclenche `sendAcademyCertificateEmail(certificateId)` après l’insertion réussie. Ce déclencheur couvre les deux chemins existants : génération automatique après complétion de toutes les leçons publiées et génération manuelle depuis `/admin/academy/certificates`.

L’email étudiant a pour objet `Votre certificat est disponible — Agri-tech Academy`. Il utilise le layout HTML Agri-tech partagé `baseEmailTemplate()` : en-tête vert, fond clair, carte centrale, tableau de détails, bouton principal `Voir mon certificat`, signature Agri-tech Academy et version texte brute. Le lien étudiant pointe vers `/academy/certificats/[certificateId]` avec une URL absolue basée sur `NEXT_PUBLIC_SITE_URL`. Le lien public de vérification existant `/certificats/verifier/[certificateId]` est inclus quand il peut être construit, sans modifier la page publique.

Le `Reply-To` forcé est `ACADEMY_REPLY_TO_EMAIL`, attendu à `formation@agritech509ht.com`. Ce workflow n’utilise pas les variables Contact ou Consultation, n’utilise jamais `projet@agritech509ht.com` et ne crée pas de variable publique Brevo.

L’anti-doublon choisi est le marqueur minimal `academy_certificates.certificate_email_sent_at`, ajouté par la migration `supabase/migrations/20260719_add_academy_certificate_email_marker.sql`. La fonction vérifie ce marqueur avant l’envoi et ne le remplit qu’après succès réel de `sendTransactionalEmail()` / Brevo. Si Brevo échoue, si la configuration serveur est absente ou si l’email étudiant est indisponible, le certificat reste généré et visible, l’erreur est loggée côté serveur sans secret et le marqueur reste vide pour permettre une relance future.

Ce changement ne modifie pas le template visuel du certificat, l’impression/PDF navigateur, la page publique de vérification, la progression Academy, Consultation, Contact, les paiements Academy, ni les emails Academy déjà existants d’inscription et d’achat/enrollment.

## Historique global `email_events`

Une table Supabase `public.email_events` trace désormais les communications transactionnelles Brevo sans remplacer les workflows métier ni les marqueurs anti-doublon existants. Elle sert d’audit trail opérationnel pour vérifier quels emails ont été envoyés, échoués ou volontairement ignorés.

Champs principaux :

- `event_type` : type fonctionnel de l’email ;
- `related_entity_type` / `related_entity_id` : module et ligne métier liée lorsque disponible ;
- `recipient_email` / `recipient_name` : destinataire normalisé ;
- `subject` : objet envoyé ou objet synthétique pour un `skipped` ;
- `provider` : `brevo` par défaut ;
- `provider_message_id` : identifiant Brevo quand l’API le retourne ;
- `status` : `sent`, `failed` ou `skipped` ;
- `error_message` : message court et contrôlé en cas d’échec ou d’ignoré ;
- `metadata` : contexte minimal non sensible ;
- `created_at` : date d’enregistrement serveur.

Types d’événements pris en charge :

- `consultation_client_confirmation` ;
- `consultation_internal_notification` ;
- `contact_visitor_acknowledgement` ;
- `contact_internal_notification` ;
- `academy_welcome` ;
- `academy_purchase_confirmation` ;
- `academy_internal_purchase_notification` ;
- `certificate_available`.

La fonction serveur `recordEmailEvent()` insère les lignes avec le client Supabase admin/service role. Son échec est non bloquant : l’erreur est loggée côté serveur, mais l’email et le workflow métier ne sont pas annulés. La fonction centrale `sendTransactionalEmail()` accepte un contexte optionnel `emailEvent`; les appels sans contexte continuent de fonctionner comme avant. Après succès Brevo, `status = sent` est enregistré avec `provider_message_id` si disponible. En cas d’erreur Brevo, `status = failed` est enregistré. Les cas `skipped` sont limités aux situations utiles : marqueur anti-doublon déjà présent, destinataire métier absent/invalide ou configuration email absente.

### Sécurité et RLS

RLS est activé sur `email_events`. Les rôles `anon` et `authenticated` n’ont aucune politique de lecture publique, et aucune politique d’écriture, mise à jour ou suppression n’est créée. Les insertions passent par le serveur avec la service role après exécution des workflows existants. La page admin utilise la même protection `requireAuthorizedAdmin()` que les autres pages d’administration et lit les données via le client admin serveur.

Ne jamais stocker dans `email_events` : `BREVO_API_KEY`, tokens, mots de passe, liens de session privés, données bancaires, contenu complet d’un message privé ou logs techniques détaillés. `metadata` doit rester minimal, par exemple `module`, `request_code`, `course_title` ou `certificate_id`.

### Page admin

La page `/admin/email-events` affiche les 100 derniers événements avec date, type, destinataire, sujet, statut, module lié, provider et messageId Brevo. Elle propose des filtres simples par statut et module. Elle n’affiche pas le contenu complet des emails ni de metadata détaillée afin de limiter l’exposition de données sensibles.

### Limites

Cet historique n’est pas un CRM complet, ne gère pas les webhooks de délivrabilité Brevo et ne remplace pas les marqueurs anti-doublon existants (`client_email_sent_at`, `internal_email_sent_at`, `welcome_email_sent_at`, `student_purchase_email_sent_at`, `internal_purchase_email_sent_at`, `certificate_email_sent_at`). Il ajoute une traçabilité serveur fiable sans modifier les paiements, la progression Academy, les certificats ou les templates principaux.
