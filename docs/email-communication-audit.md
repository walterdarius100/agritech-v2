# Audit communication email — Brevo

## 1. Objectif du module email

Ce document prépare l’intégration future de Brevo pour les emails transactionnels du projet Agri-tech. Il s’agit uniquement d’un audit fonctionnel et d’une proposition d’architecture : aucun email n’est envoyé, aucune clé API n’est ajoutée et aucun workflow métier existant n’est modifié dans ce PR.

Les objectifs du futur module email sont :

- centraliser l’envoi d’emails transactionnels côté serveur ;
- éviter de dupliquer l’intégration Brevo dans les modules Consultation, Academy, Contact, Paiements, Certificats et Admin ;
- garder les actions métier résilientes si un email échoue ;
- préparer des templates maintenables par domaine fonctionnel ;
- réduire le risque de doublons avec des marqueurs d’envoi simples au démarrage.

## 2. Modules analysés

### Consultation

Le module Consultation crée une demande avec un statut `pending_payment`, puis redirige l’utilisateur vers le checkout de consultation. L’email renseigné peut être absent, donc les emails client devront être conditionnés à la présence d’une adresse valide.

Emails recommandés :

- confirmation de demande de consultation au client après création de la demande, si l’équipe souhaite confirmer la réception avant paiement ;
- confirmation de paiement et récapitulatif au client après paiement marqué comme payé ;
- notification interne à Agri-tech après demande payée ;
- email manuel ou planifié de rappel de rendez-vous lorsque la planification de consultation sera disponible.

Priorité recommandée : commencer par les emails déclenchés après paiement confirmé, car ils correspondent à une intention forte et évitent de notifier l’équipe pour des paniers non payés.

### Academy

Le module Academy couvre l’inscription étudiant, les paiements de formation, l’activation d’accès, la progression et les certificats.

Emails recommandés :

- confirmation d’inscription Academy après création du compte étudiant ;
- confirmation d’achat de formation après paiement confirmé ;
- notification d’accès à une formation après activation d’un enrollment ;
- notification interne à Agri-tech après achat Academy ;
- notification de progression importante si un workflow pédagogique le justifie plus tard ;
- notification certificat disponible après génération automatique ou manuelle.

Note : Supabase Auth peut déjà envoyer ses propres emails de confirmation selon la configuration du projet. Le futur module Brevo ne doit pas dupliquer les emails d’authentification tant que la stratégie Supabase Auth n’est pas clarifiée.

### Contact

Le module Contact insère une demande de contact côté serveur via une route API. Il inclut une protection honeypot et renvoie déjà un message public générique en cas de spam.

Emails recommandés :

- accusé de réception au visiteur après création d’une demande non-spam ;
- notification interne à Agri-tech après message reçu ;
- notification interne priorisée pour demandes `urgent`, `academy_access`, `service` ou `partnership` si la priorisation devient nécessaire.

Priorité recommandée : commencer par la notification interne, car elle améliore directement le délai de traitement sans dépendre de la délivrabilité côté visiteur.

### Paiements

Le projet contient des paiements mock et des abstractions pour fournisseurs réels. Les emails doivent être déclenchés seulement après un statut fiable `paid` ou équivalent, jamais au moment de l’initialisation du paiement.

Emails recommandés :

- reçu/récapitulatif client après paiement Consultation confirmé ;
- reçu/récapitulatif étudiant après paiement Academy confirmé ;
- notification interne après paiement confirmé ;
- email d’échec ou d’annulation uniquement si l’expérience produit le nécessite plus tard.

Règle importante : l’échec d’un email ne doit jamais annuler, bloquer ou invalider un paiement déjà confirmé.

### Certificats

Le module Certificats peut générer un certificat automatiquement après complétion ou manuellement depuis l’administration.

Emails recommandés :

- email au participant quand un certificat est généré et disponible ;
- email interne optionnel si un certificat est généré manuellement par un administrateur ;
- email de renvoi de certificat si un bouton manuel est ajouté plus tard.

Priorité recommandée : envoyer au participant uniquement quand le certificat est réellement créé et possède une URL de vérification.

### Admin

Les zones Admin Consultation, Contact et Academy sont les destinations naturelles des notifications internes.

Emails recommandés :

- notification interne nouvelle demande Contact ;
- notification interne consultation payée ;
- notification interne achat Academy ;
- notification interne optionnelle certificat généré manuellement ;
- notification interne d’erreur critique de paiement seulement si une stratégie d’alerting est définie.

Les emails Admin doivent rester factuels, ne pas exposer de secret et inclure uniquement les liens internes nécessaires au traitement.

### Authentification

L’authentification Academy utilise Supabase Auth pour l’inscription et la connexion étudiant. Supabase peut déjà gérer les emails de confirmation de compte et de récupération de mot de passe.

Emails à prévoir avec prudence :

- email de bienvenue Academy après confirmation effective du compte ou première connexion ;
- email d’inscription reçu uniquement si cela ne duplique pas l’email Supabase Auth ;
- emails de reset password et confirmation email à laisser à Supabase Auth tant qu’aucune migration explicite vers Brevo n’est décidée.

## 3. Architecture recommandée

Architecture cible :

```txt
src/lib/email/
  brevo.ts
  send-email.ts
  types.ts
  config.ts
  errors.ts
  templates/
    consultation/
      consultation-request-confirmation.ts
      consultation-paid-client.ts
      consultation-paid-internal.ts
    academy/
      academy-registration-confirmation.ts
      academy-purchase-confirmation.ts
      academy-access-granted.ts
      academy-purchase-internal.ts
    contact/
      contact-received-client.ts
      contact-received-internal.ts
    certificates/
      certificate-available-client.ts
      certificate-generated-internal.ts
```

Rôle des fichiers proposés :

- `config.ts` : lit et valide les variables d’environnement côté serveur uniquement ;
- `brevo.ts` : encapsule le client Brevo et l’appel API ;
- `send-email.ts` : expose une fonction générique `sendEmail()` qui applique les règles communes (`from`, `replyTo`, logs, erreurs non bloquantes) ;
- `types.ts` : définit les types communs (`EmailRecipient`, `TransactionalEmail`, `EmailSendResult`) ;
- `errors.ts` : normalise les erreurs sans exposer de secrets ;
- `templates/*` : contient les builders de templates par domaine métier.

Principe d’utilisation recommandé :

```txt
workflow métier serveur
  -> construit l’événement métier validé
  -> appelle un service email de domaine
  -> le service choisit le template
  -> sendEmail() envoie via Brevo
  -> l’erreur email est loggée mais ne bloque pas le workflow métier
```

Exemples de services de domaine possibles :

```txt
src/lib/email/consultation-emails.ts
src/lib/email/academy-emails.ts
src/lib/email/contact-emails.ts
src/lib/email/certificate-emails.ts
```

Ces services doivent recevoir des données métier déjà validées et ne doivent pas relire inutilement les secrets côté client.

## 4. Variables d’environnement à prévoir

Variables proposées, sans valeur secrète :

```env
BREVO_API_KEY=
EMAIL_FROM_NAME=Agri-tech
EMAIL_FROM_ADDRESS=noreply@agritech509ht.com
AGRI_TECH_NOTIFICATION_EMAIL=projets@agritech509ht.com  # obsolète, utiliser CONSULTATION_NOTIFICATION_EMAIL
EMAIL_REPLY_TO=projets@agritech509ht.com
```

Règles :

- `BREVO_API_KEY` doit rester uniquement côté serveur ;
- ne jamais préfixer `BREVO_API_KEY` avec `NEXT_PUBLIC_` ;
- `EMAIL_FROM_ADDRESS` doit correspondre à un domaine vérifié chez Brevo avant activation ;
- `EMAIL_REPLY_TO` peut pointer vers l’adresse opérationnelle de l’équipe ;
- les valeurs ci-dessus sont des noms attendus et exemples non secrets, pas une configuration active.

## 5. Sécurité et résilience

Règles de sécurité à appliquer lors de l’intégration :

- envoyer les emails côté serveur uniquement ;
- ne jamais appeler l’API Brevo depuis le navigateur ;
- ne jamais exposer `BREVO_API_KEY` dans du JavaScript client, dans les logs ou dans une réponse HTTP ;
- ne pas bloquer un paiement, une inscription, une demande de contact ou une génération de certificat si l’email échoue ;
- logger les erreurs côté serveur avec un contexte métier minimal, sans payload sensible complet ;
- éviter d’inclure des tokens privés ou des données personnelles inutiles dans les emails ;
- valider/normaliser les destinataires avant envoi ;
- utiliser des liens absolus construits depuis l’URL publique du site ;
- éviter les envois sur données spam détectées, notamment pour le formulaire Contact.

Stratégie d’erreur recommandée :

```txt
try send email
  success -> marquer l’email comme envoyé
  failure -> logger côté serveur, ne pas throw vers l’utilisateur final, ne pas rollback l’action métier
```

## 6. Stratégie anti-doublon

### Option recommandée pour démarrer

Utiliser des champs horodatés simples sur les tables métier concernées :

```txt
consultation_requests.client_email_sent_at
consultation_requests.internal_email_sent_at
contact_requests.client_email_sent_at
contact_requests.internal_email_sent_at
academy_payments.client_email_sent_at
academy_payments.internal_email_sent_at
academy_enrollments.access_email_sent_at
academy_certificates.client_email_sent_at
academy_certificates.internal_email_sent_at
```

Avantages :

- facile à comprendre ;
- simple à requêter dans les workflows existants ;
- limite les doublons lors de retries manuels ou webhooks rejoués ;
- suffisant tant que le nombre d’événements email reste limité.

### Option plus complète plus tard

Créer une table globale `email_events` :

```txt
email_events
  id
  event_key
  event_type
  entity_type
  entity_id
  recipient_email
  status
  provider
  provider_message_id
  error_message
  sent_at
  created_at
```

Cette option est utile si le projet a besoin d’un historique complet, de retries avancés, de tableaux de bord ou d’audit par destinataire. Elle est plus robuste mais plus coûteuse à intégrer.

Recommandation actuelle : commencer par les champs `*_email_sent_at`, puis migrer vers `email_events` si les besoins d’audit ou de retry deviennent importants.

## 7. Ordre de développement recommandé

1. Créer le squelette `src/lib/email` sans activer d’envoi en production.
2. Ajouter les variables d’environnement dans la documentation de configuration.
3. Implémenter `sendEmail()` côté serveur avec Brevo et logs sécurisés.
4. Créer les templates Contact et la notification interne Contact.
5. Ajouter les emails après paiement confirmé Consultation.
6. Ajouter les emails après paiement confirmé Academy et activation d’accès.
7. Ajouter l’email certificat disponible.
8. Ajouter les champs anti-doublon nécessaires via migration Supabase dédiée.
9. Ajouter des tests unitaires sur les templates et des tests d’intégration avec Brevo mocké.
10. Ajouter éventuellement une table `email_events` si l’historique devient nécessaire.

## 8. Limites actuelles

- Aucun connecteur Brevo n’est implémenté dans ce PR.
- Aucun template email n’est ajouté dans ce PR.
- Aucun email n’est envoyé dans ce PR.
- Aucune variable d’environnement réelle ou clé API n’est ajoutée dans ce PR.
- Aucune migration Supabase n’est ajoutée dans ce PR.
- Les workflows métier existants ne sont pas modifiés dans ce PR.
- La stratégie finale pour les emails Supabase Auth doit être validée avant de remplacer ou compléter les emails natifs de Supabase.
- Les champs anti-doublon proposés nécessiteront un PR séparé de migration de base de données.

## 9. Risques identifiés

- Doublons possibles si les webhooks de paiement sont rejoués sans marqueur `*_email_sent_at`.
- Confusion utilisateur possible si Supabase Auth et Brevo envoient des emails d’inscription similaires.
- Échec de délivrabilité si le domaine d’envoi n’est pas correctement vérifié chez Brevo.
- Exposition accidentelle de secret si l’intégration est importée dans un composant client.
- Couplage excessif si chaque module appelle Brevo directement au lieu d’utiliser un service centralisé.
- Blocage métier si l’envoi email est traité comme une étape critique plutôt qu’un effet secondaire non bloquant.

## 10. Prochains PR recommandés

1. PR `email-core-brevo` : ajouter le module `src/lib/email`, le client Brevo serveur, les types et les logs sécurisés.
2. PR `email-contact-notifications` : ajouter notification interne Contact et accusé de réception visiteur avec anti-doublon.
3. PR `email-consultation-paid` : ajouter emails Consultation après paiement confirmé.
4. PR `email-academy-payment-access` : ajouter emails Academy après paiement et activation d’accès.
5. PR `email-certificates` : ajouter notification certificat disponible.
6. PR `email-events-audit` : ajouter table `email_events` seulement si un historique global devient nécessaire.

## 11. Confirmation de périmètre

Ce PR est volontairement limité à la documentation d’audit et d’architecture. Il ne contient :

- aucun appel à Brevo ;
- aucun envoi d’email ;
- aucune clé API ;
- aucune migration Supabase ;
- aucune modification de logique métier existante.
