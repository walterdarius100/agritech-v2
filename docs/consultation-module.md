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
| `consultation_package` | Produit de consultation choisi.                                                      |
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

Cette étape crée seulement la couche base de données et les types manuels. Elle ne crée pas encore :

- la page `/consultation` ;
- le formulaire `/consultation/reserver` ;
- les routes serveur de création de demande ;
- le checkout Consultation ;
- la confirmation Consultation ;
- la page admin `/admin/consultations` ;
- l'intégration à un vrai fournisseur de paiement.
