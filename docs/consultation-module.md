# Module Consultation — Tables Supabase

## Objectif

Cette note décrit les tables Supabase ajoutées pour le futur module de réservation de consultation payante Agri-tech. Le module Academy reste séparé : les tables, paiements, certificats, cours et progressions Academy ne sont pas modifiés par cette migration.

## Migration créée

```txt
supabase/migrations/20260714_create_consultation_tables.sql
```

La migration crée uniquement des objets liés aux consultations :

- `consultation_requests` ;
- `consultation_payments` ;
- une séquence `consultation_request_code_seq` ;
- les fonctions `generate_consultation_request_code` et `set_consultation_request_code` ;
- des triggers de génération de code et de mise à jour automatique de `updated_at`.

## Table `consultation_requests`

Cette table stocke la demande métier créée après soumission du formulaire public.

| Champ                  | Rôle                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `id`                   | Identifiant UUID interne.                                                            |
| `request_code`         | Code lisible unique, généré automatiquement si absent, par exemple `CONS-2026-0001`. |
| `full_name`            | Nom complet du client.                                                               |
| `email`                | Email du client, optionnel au niveau base.                                           |
| `phone`                | Téléphone du client.                                                                 |
| `department`           | Département.                                                                         |
| `commune`              | Commune.                                                                             |
| `consultation_type`    | Domaine agricole demandé.                                                            |
| `project_stage`        | Niveau d'avancement du projet.                                                       |
| `project_description`  | Description du besoin.                                                               |
| `estimated_budget`     | Budget approximatif.                                                                 |
| `consultation_mode`    | Mode souhaité : en ligne, téléphone, WhatsApp ou présentiel si possible.             |
| `consultation_package` | Libellé fixe de la consultation, rempli côté serveur.                                |
| `amount`               | Montant attendu, par défaut `2500`.                                                  |
| `currency`             | Devise, par défaut `HTG`.                                                            |
| `payment_status`       | Statut de paiement dénormalisé pour lecture rapide.                                  |
| `request_status`       | Statut opérationnel de la demande.                                                   |
| `paid_at`              | Date de paiement confirmé.                                                           |
| `scheduled_at`         | Date planifiée pour la consultation.                                                 |
| `admin_notes`          | Notes internes admin.                                                                |
| `created_at`           | Date de création.                                                                    |
| `updated_at`           | Date de dernière modification.                                                       |

## Table `consultation_payments`

Cette table trace les paiements associés à une demande de consultation. Elle est volontairement séparée de `academy_payments`.

| Champ                     | Rôle                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------- |
| `id`                      | Identifiant UUID du paiement.                                                       |
| `consultation_request_id` | Référence obligatoire vers `consultation_requests.id`, avec suppression en cascade. |
| `provider`                | Fournisseur de paiement.                                                            |
| `provider_transaction_id` | Identifiant transactionnel externe si disponible.                                   |
| `amount`                  | Montant du paiement.                                                                |
| `currency`                | Devise, par défaut `HTG`.                                                           |
| `status`                  | Statut du paiement.                                                                 |
| `payment_method`          | Méthode utilisée, si différente du provider ou utile pour l'admin.                  |
| `metadata`                | Données techniques non sensibles au format JSON.                                    |
| `created_at`              | Date de création.                                                                   |
| `updated_at`              | Date de dernière modification.                                                      |
| `paid_at`                 | Date de paiement confirmé.                                                          |

## Statuts

### `consultation_requests.payment_status` et `consultation_payments.status`

Valeurs autorisées :

- `pending` ;
- `paid` ;
- `failed` ;
- `cancelled` ;
- `refunded`.

### `consultation_requests.request_status`

Valeurs autorisées :

- `pending_payment` ;
- `paid` ;
- `scheduled` ;
- `completed` ;
- `cancelled` ;
- `failed_payment`.

### `consultation_payments.provider`

Valeurs autorisées :

- `mock` ;
- `moncash` ;
- `natcash` ;
- `manual`.

## Génération du `request_code`

La migration ajoute une génération côté PostgreSQL via `consultation_request_code_seq` et un trigger `set_consultation_requests_request_code`.

Si l'application insère une demande sans `request_code`, PostgreSQL génère un code lisible au format :

```txt
CONS-YYYY-0001
```

L'interface client ne doit pas afficher uniquement l'UUID. Elle peut utiliser `request_code` pour les confirmations, échanges client et recherches admin.

## RLS et sécurité

RLS est activé sur les deux tables :

- `consultation_requests` ;
- `consultation_payments`.

Aucune policy publique d'insert, select, update ou delete n'est créée dans cette migration. La stratégie recommandée pour le formulaire public est de créer les demandes via une route serveur Next.js ou une Server Action utilisant le client Supabase admin/service role, avec validation stricte côté serveur.

Conséquences attendues :

- les visiteurs ne peuvent pas lire les demandes ;
- les visiteurs ne peuvent pas modifier les demandes ;
- les visiteurs ne peuvent pas lire les paiements ;
- les visiteurs ne peuvent pas modifier les paiements ;
- l'admin applicatif peut accéder aux données via les fonctions serveur déjà protégées par l'auth admin du projet et le service role Supabase.

## Relation entre demandes et paiements

`consultation_payments.consultation_request_id` référence `consultation_requests.id` avec `on delete cascade`.

Une demande peut avoir un ou plusieurs paiements techniques au fil du temps, par exemple :

- une tentative `mock` échouée ;
- une nouvelle tentative `mock` payée ;
- un paiement `manual` enregistré par l'équipe.

Le statut courant utile à l'admin est dupliqué dans `consultation_requests.payment_status` afin de simplifier les listes et filtres.

## Types TypeScript

Les types manuels du module sont définis dans :

```txt
src/types/consultation.ts
```

Ils couvrent :

- `ConsultationRequest` ;
- `ConsultationPayment` ;
- `ConsultationPaymentStatus` ;
- `ConsultationRequestStatus` ;
- `ConsultationPaymentProvider` ;
- `CreateConsultationRequestInput`.

## Application de la migration

Avec Supabase CLI, appliquer la migration selon le workflow de l'environnement :

```bash
supabase db push
```

ou rejouer les migrations localement selon la configuration du projet :

```bash
supabase db reset
```

## Limites actuelles

Le module dispose maintenant de la couche base de données, des types manuels, de la page publique `/consultation`, du formulaire `/consultation/reserver`, d'une Server Action de création de demande et d'une page de réception `/consultation/checkout/[requestId]`. Il ne crée pas encore :

- le paiement réel Consultation ;
- la confirmation finale après paiement ;
- la page admin `/admin/consultations` ;
- l'intégration à un vrai fournisseur de paiement.

## Formulaire public `/consultation/reserver`

La page `/consultation/reserver` contient maintenant le formulaire avancé de réservation. Les champs collectés sont :

- `full_name` : nom complet obligatoire ;
- `phone` : téléphone WhatsApp obligatoire ;
- `email` : email optionnel, validé si renseigné ;
- `department` : département ;
- `commune` : commune ;
- `consultation_type` : domaine concerné obligatoire ;
- `project_stage` : niveau d'avancement ;
- `consultation_mode` : mode souhaité ;
- `estimated_budget` : budget approximatif ;
- `project_description` : description obligatoire ;
- `consultation_package` : valeur fixe remplie automatiquement côté serveur, non sélectionnée par le visiteur.

## Validation applicative

La soumission passe par une Server Action afin d'éviter une insertion Supabase directe depuis le client. La validation applicative vérifie au minimum :

- nom complet obligatoire ;
- téléphone WhatsApp obligatoire ;
- domaine concerné obligatoire et limité aux options autorisées ;
- description obligatoire ;
- format email valide si l'email est renseigné.

En cas d'erreur, le formulaire affiche un message clair et des erreurs par champ. Le bouton de soumission est désactivé pendant l'envoi et affiche `Création de la demande...`.

## Statut initial et insertion

Lors d'une soumission valide, la Server Action insère une ligne dans `consultation_requests` via le client Supabase admin/service role. Les valeurs initiales métier sont :

```txt
payment_status = pending
request_status = pending_payment
amount = 2500
currency = HTG
consultation_package = Consultation agricole en ligne — 30 à 45 minutes
```

Le `request_code` lisible est généré côté PostgreSQL par le trigger de la migration Consultation si l'application ne fournit pas de valeur.

## Redirection après soumission

Après insertion réussie, l'utilisateur est redirigé vers :

```txt
/consultation/checkout/[requestId]
```

Le choix actuel utilise l'UUID interne `id` pour la route technique de checkout. Le `request_code` reste prévu pour l'affichage client, la confirmation et les recherches admin lorsque les pages de checkout et d'administration seront complétées.

## Limites actuelles du formulaire

Cette étape ne met pas encore en place le vrai paiement. La page checkout existe uniquement comme étape de réception après création de demande afin d'éviter une 404 et de préparer l'intégration du paiement dans un prochain PR. Le prix reste fixe à `2 500 HTG`; le visiteur ne sélectionne plus de package dans le formulaire.

## Checkout mock Consultation

La route `/consultation/checkout/[requestId]` charge la demande via le client Supabase admin/service role et affiche un résumé avant paiement :

- code de demande ;
- nom du client ;
- type de consultation ;
- package fixe ;
- montant ;
- statut de paiement ;
- résumé du besoin.

Les moyens de paiement affichés sont actuellement des options de test :

- MonCash ;
- NatCash ;
- paiement manuel / confirmation interne.

Le formulaire de paiement affiche clairement que le paiement en ligne est en mode test et sert uniquement à valider le parcours de réservation.

## Confirmation du paiement mock

La confirmation du paiement mock utilise une Server Action. Elle vérifie d'abord que la demande existe, puis recherche un paiement `paid` existant pour éviter les doublons.

Si la demande n'est pas déjà payée, l'action :

1. crée une ligne dans `consultation_payments` ;
2. enregistre `provider = mock` ;
3. enregistre `status = paid` ;
4. reprend le montant et la devise de `consultation_requests` ;
5. stocke le moyen de paiement choisi dans `payment_method` et `metadata` ;
6. met à jour `consultation_requests.payment_status` à `paid` ;
7. met à jour `consultation_requests.request_status` à `paid` ;
8. renseigne `paid_at` ;
9. redirige vers `/consultation/confirmation/[requestId]`.

## Anti-doublon du paiement mock

Avant de créer un paiement mock, la Server Action vérifie :

- si `consultation_requests.payment_status` vaut déjà `paid` ;
- ou si un paiement `consultation_payments.status = paid` existe déjà pour la demande.

Dans ces cas, elle ne crée pas de nouveau paiement et redirige directement vers la confirmation.

## Limites avant paiement réel

Le checkout ne contacte pas encore MonCash ou NatCash. Les providers affichés sont des choix UX de test, tandis que la ligne technique enregistrée dans `consultation_payments.provider` reste `mock`. L'intégration des vrais fournisseurs devra ajouter une vérification serveur, des webhooks et une stratégie d'idempotence plus stricte côté base de données.

## Page de confirmation finale

La route `/consultation/confirmation/[requestId]` affiche l'état final visible par le client après le checkout mock.

La page gère trois états :

- demande introuvable : message `Demande introuvable` et liens de retour ;
- demande enregistrée mais non payée : message indiquant que le paiement n'a pas encore été confirmé et lien vers le checkout ;
- demande payée : badge `Paiement confirmé`, résumé client et prochaine étape.

Pour limiter l'exposition d'informations sensibles, la page n'affiche pas l'UUID interne, les notes admin, les métadonnées de paiement ou les détails techniques. Elle affiche uniquement :

- `request_code` ;
- nom du client ;
- type de consultation ;
- montant ;
- statut de demande ;
- statut de paiement ;
- prochaine étape.

Les CTA disponibles sont :

- retour à l'accueil ;
- voir les services ;
- contacter Agri-tech ;
- retour au checkout uniquement si le paiement n'est pas confirmé.
