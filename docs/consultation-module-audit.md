# Audit d'architecture — Module de réservation de consultation payante

## 1. Objectif du module

Le module Consultation doit remplacer progressivement l'usage de formulaires externes pour les demandes de conseil Agri-tech. Il doit permettre à un visiteur de comprendre l'offre, de remplir une demande structurée, de payer avant validation finale, puis de permettre à l'équipe Agri-tech de suivre la demande depuis l'administration.

Ce document est uniquement une proposition d'architecture. Il ne crée aucune route, aucune migration Supabase et ne modifie ni le module Academy ni les paiements existants.

## 2. Architecture recommandée

L'architecture recommandée est une approche App Router en routes dédiées, simple à comprendre et facile à faire évoluer :

| Route                                    | Rôle                                                                                    | Visibilité                                         |
| ---------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `/consultation`                          | Page publique de présentation de l'offre, bénéfices, prix de départ, FAQ courte et CTA. | Publique                                           |
| `/consultation/reserver`                 | Formulaire avancé de réservation.                                                       | Publique                                           |
| `/consultation/checkout/[requestId]`     | Paiement lié à une demande déjà créée.                                                  | Publique, mais liée à un identifiant non devinable |
| `/consultation/confirmation/[requestId]` | Confirmation après paiement mock ou fournisseur réel futur.                             | Publique, sans exposition de données sensibles     |
| `/admin/consultations`                   | Liste et suivi opérationnel des demandes.                                               | Admin uniquement                                   |

Cette séparation est préférable à une page unique parce qu'elle isole clairement la présentation, la saisie, le paiement, la confirmation et le traitement admin. Elle reste légère et compatible avec l'architecture actuelle où les pages publiques, Academy et admin sont déjà séparées.

### Alternative plus compacte

Une version minimale pourrait intégrer la présentation et le formulaire directement dans `/consultation`. Elle réduit le nombre de pages au premier PR fonctionnel, mais elle deviendra moins lisible dès l'ajout du paiement, des relances ou d'un tunnel plus détaillé. La recommandation reste donc de démarrer avec `/consultation` et `/consultation/reserver` distinctes.

## 3. Navigation publique recommandée

La navigation actuelle contient déjà `Accueil`, `Services`, `Academy`, `Actualités` et `Contact`. Le libellé recommandé est :

```txt
Consultation
```

Ce libellé est plus court que `Réserver une consultation`, s'intègre mieux dans le header desktop/mobile et reste cohérent avec les entrées existantes qui sont majoritairement courtes.

Les CTA secondaires recommandés dans le site public sont :

- `Demander une consultation` ;
- `Réserver une consultation` ;
- `Parler à un conseiller Agri-tech`.

Emplacements possibles pour ces CTA dans de futurs PR :

- hero de la page d'accueil ;
- pages Services ;
- pages de détail de service ;
- page Contact ;
- footer ou bloc d'accompagnement.

## 4. Champs du formulaire

### Informations personnelles

| Champ        | Type recommandé | Obligatoire | Notes                                                            |
| ------------ | --------------- | ----------- | ---------------------------------------------------------------- |
| `full_name`  | texte           | Oui         | Nom complet du demandeur.                                        |
| `phone`      | texte           | Oui         | Normaliser autant que possible, sans bloquer les formats locaux. |
| `email`      | email           | Oui         | Utilisé pour confirmation et suivi.                              |
| `department` | texte ou select | Oui         | Département géographique.                                        |
| `commune`    | texte           | Oui         | Commune ou ville.                                                |

### Type de consultation

Champ : `consultation_type`

Options recommandées :

- `Aviculture` ;
- `Apiculture` ;
- `Cuniculture` ;
- `Pisciculture` ;
- `Maraîchage` ;
- `Irrigation` ;
- `Projet agricole général` ;
- `Autre`.

### Niveau d'avancement

Champ : `project_stage`

Options recommandées :

- `Simple idée` ;
- `Projet déjà commencé` ;
- `Terrain disponible` ;
- `Bâtiment déjà construit` ;
- `Besoin d'étude technique` ;
- `Besoin de formation` ;
- `Besoin de suivi` ;
- `Autre`.

### Description du besoin

Champ : `project_description`

Recommandations :

- champ textarea ;
- minimum conseillé : 30 à 50 caractères ;
- maximum conseillé : 2 000 à 4 000 caractères ;
- aide utilisateur : demander le contexte, le lieu, les objectifs, contraintes et délais.

### Budget approximatif

Champ : `estimated_budget`

Options recommandées :

- `Moins de 500 USD` ;
- `500 à 1 000 USD` ;
- `1 000 à 5 000 USD` ;
- `Plus de 5 000 USD` ;
- `Je ne sais pas encore`.

### Mode de consultation souhaité

Champ : `consultation_mode`

Options recommandées :

- `En ligne` ;
- `Par téléphone` ;
- `WhatsApp` ;
- `Présentiel si possible`.

### Produit de consultation

Champ : `consultation_package`

Produit initial minimal :

```txt
Consultation agricole en ligne — 30 à 45 minutes — 2 500 HTG
```

Recommandation technique : stocker aussi `amount` et `currency` côté serveur au moment de la création de la demande. Le prix ne doit pas être considéré comme fiable s'il provient uniquement du client.

## 5. Workflow recommandé

```txt
1. Le client ouvre /consultation puis clique vers /consultation/reserver.
2. Le client remplit le formulaire.
3. Le serveur valide les champs et crée une demande avec request_status=pending_payment et payment_status=pending.
4. Le client est redirigé vers /consultation/checkout/[requestId].
5. Le paiement mock Consultation est confirmé.
6. Le paiement est enregistré dans consultation_payments.
7. La demande passe à request_status=paid et payment_status=paid.
8. Le client est redirigé vers /consultation/confirmation/[requestId].
9. L'équipe Agri-tech voit la demande dans /admin/consultations.
10. L'admin planifie, traite, complète ou annule la demande.
```

## 6. Statuts recommandés

### Statuts de demande

| Statut            | Signification                                 |
| ----------------- | --------------------------------------------- |
| `pending_payment` | Demande créée, paiement non encore validé.    |
| `paid`            | Paiement validé, demande à traiter.           |
| `scheduled`       | Consultation planifiée avec le client.        |
| `completed`       | Consultation réalisée.                        |
| `cancelled`       | Demande annulée.                              |
| `failed_payment`  | Paiement échoué ou abandonné après tentative. |

### Statuts de paiement

| Statut      | Signification                            |
| ----------- | ---------------------------------------- |
| `pending`   | Paiement initié.                         |
| `paid`      | Paiement confirmé.                       |
| `failed`    | Paiement refusé ou erreur fournisseur.   |
| `cancelled` | Paiement annulé par le client ou expiré. |
| `refunded`  | Remboursement futur éventuel.            |

## 7. Tables Supabase proposées

Aucune migration ne doit être créée dans ce PR. Les structures ci-dessous sont une proposition pour un PR ultérieur.

### Table `consultation_requests`

| Colonne                | Type indicatif | Notes                                                                      |
| ---------------------- | -------------- | -------------------------------------------------------------------------- |
| `id`                   | `uuid`         | Clé primaire, générée par Supabase.                                        |
| `request_code`         | `text`         | Code lisible, par exemple `CONS-2026-0001`.                                |
| `full_name`            | `text`         | Nom complet.                                                               |
| `email`                | `text`         | Email client.                                                              |
| `phone`                | `text`         | Téléphone client.                                                          |
| `department`           | `text`         | Département.                                                               |
| `commune`              | `text`         | Commune.                                                                   |
| `consultation_type`    | `text`         | Domaine agricole.                                                          |
| `project_stage`        | `text`         | Niveau d'avancement.                                                       |
| `project_description`  | `text`         | Description détaillée.                                                     |
| `estimated_budget`     | `text`         | Tranche budgétaire.                                                        |
| `consultation_mode`    | `text`         | Mode souhaité.                                                             |
| `consultation_package` | `text`         | Libellé de l'offre choisie.                                                |
| `amount`               | `integer`      | Montant en plus petite unité si convention adoptée, ou montant entier HTG. |
| `currency`             | `text`         | `HTG` au lancement.                                                        |
| `payment_status`       | `text`         | Statut paiement dénormalisé pour lecture rapide.                           |
| `request_status`       | `text`         | Statut opérationnel de la demande.                                         |
| `created_at`           | `timestamptz`  | Date de création.                                                          |
| `updated_at`           | `timestamptz`  | Date de mise à jour.                                                       |
| `paid_at`              | `timestamptz`  | Date de paiement confirmé.                                                 |
| `scheduled_at`         | `timestamptz`  | Date de consultation planifiée.                                            |
| `admin_notes`          | `text`         | Notes internes non visibles par le client.                                 |

### Table `consultation_payments`

Cette table est recommandée pour démarrer sans toucher aux paiements Academy.

| Colonne                   | Type indicatif | Notes                                                      |
| ------------------------- | -------------- | ---------------------------------------------------------- |
| `id`                      | `uuid`         | Clé primaire.                                              |
| `consultation_request_id` | `uuid`         | Référence vers `consultation_requests.id`.                 |
| `provider`                | `text`         | `mock`, puis éventuellement `moncash`, `natcash` ou autre. |
| `provider_payment_id`     | `text`         | Identifiant externe si disponible.                         |
| `amount`                  | `integer`      | Montant payé.                                              |
| `currency`                | `text`         | Devise.                                                    |
| `status`                  | `text`         | `pending`, `paid`, `failed`, `cancelled`, `refunded`.      |
| `metadata`                | `jsonb`        | Données techniques non sensibles.                          |
| `created_at`              | `timestamptz`  | Création.                                                  |
| `updated_at`              | `timestamptz`  | Mise à jour.                                               |
| `paid_at`                 | `timestamptz`  | Confirmation de paiement.                                  |

### Pourquoi ne pas utiliser une table globale `payments` tout de suite ?

Une table globale `payments` serait plus évolutive à long terme, mais elle risquerait d'obliger à refactorer Academy trop tôt. Pour réduire le risque, il vaut mieux commencer avec :

```txt
academy_payments = formations Academy
consultation_payments = consultations Agri-tech
```

Une unification future pourra être décidée après stabilisation des deux parcours.

## 8. Relation avec Academy et les paiements existants

Le paiement Academy peut inspirer la structure du flux Consultation, notamment le découpage `initiate`, confirmation mock et vérification serveur. En revanche, il ne faut pas réutiliser directement `academy_payments` pour Consultation.

Recommandation :

- conserver `academy_payments` pour les formations Academy ;
- créer plus tard `consultation_payments` pour les consultations ;
- éviter tout changement dans les endpoints Academy existants ;
- dupliquer temporairement une petite couche mock Consultation si nécessaire, puis factoriser uniquement quand les deux métiers sont stabilisés.

Cette séparation limite les régressions sur les inscriptions, accès cours, certificats et tableaux admin Academy.

## 9. Page admin `/admin/consultations`

La page admin proposée doit permettre de consulter et filtrer les demandes reçues.

Colonnes recommandées pour la liste :

- code demande ;
- date de demande ;
- nom client ;
- téléphone ;
- email ;
- domaine agricole ;
- mode souhaité ;
- montant ;
- statut de paiement ;
- statut de traitement ;
- date planifiée si disponible.

Actions recommandées :

- ouvrir une fiche détail ;
- ajouter ou modifier les notes internes ;
- passer de `paid` à `scheduled` ;
- passer de `scheduled` à `completed` ;
- annuler une demande ;
- filtrer par statut de paiement, statut de traitement et type de consultation.

Les notes internes doivent rester strictement côté admin.

## 10. Sécurité et confidentialité

Règles recommandées :

- le formulaire public ne nécessite pas de compte ;
- les insertions publiques doivent passer par une route serveur ou une Server Action validée ;
- les données clients ne doivent jamais être listées depuis le client public ;
- `/admin/consultations` doit utiliser la même protection admin que les autres pages admin ;
- les pages confirmation et checkout ne doivent afficher qu'un résumé minimal ;
- les identifiants publics doivent être non devinables ou accompagnés d'un `request_code` non sensible ;
- les erreurs utilisateur doivent rester génériques ;
- les logs ne doivent pas contenir de données sensibles complètes ;
- les paiements doivent être traçables dans une table dédiée ;
- les politiques RLS Supabase doivent empêcher la lecture publique de `consultation_requests` et `consultation_payments`.

## 11. Risques identifiés

| Risque                               | Impact                                         | Mitigation recommandée                                                          |
| ------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------- |
| Mélange avec les paiements Academy   | Régressions sur les formations et accès cours. | Garder `consultation_payments` séparé au lancement.                             |
| Exposition de données personnelles   | Risque confidentialité client.                 | Lecture admin uniquement, confirmation publique minimale, RLS stricte.          |
| Prix manipulé côté client            | Paiement incorrect.                            | Déterminer `amount` et `currency` côté serveur.                                 |
| Demandes créées sans paiement        | Admin encombré par des brouillons.             | Statut `pending_payment`, filtres admin, nettoyage futur des demandes expirées. |
| Workflow trop complexe au premier PR | Retard et bugs.                                | Livrer par étapes courtes : documentation, UI, backend, paiement, admin.        |
| Routes de confirmation devinables    | Accès à des informations client.               | UUID, résumé limité, vérification serveur si données détaillées affichées.      |

## 12. Étapes de développement recommandées

### PR 1 — Audit et architecture

- Créer cette documentation.
- Ne pas créer de migration Supabase.
- Ne pas modifier Academy.
- Ne pas modifier les paiements existants.

### PR 2 — Pages publiques statiques

- Ajouter `/consultation`.
- Ajouter l'entrée `Consultation` dans la navigation.
- Ajouter les premiers CTA vers `/consultation` ou `/consultation/reserver`.
- Aucun paiement réel à ce stade.

### PR 3 — Formulaire et types côté application

- Ajouter `/consultation/reserver`.
- Ajouter composants de formulaire et validation TypeScript.
- Préparer les types `ConsultationRequest` et constantes d'options.
- Toujours sans migration si le backend n'est pas prêt, ou avec feature flag.

### PR 4 — Migrations Supabase Consultation

- Créer `consultation_requests`.
- Créer `consultation_payments`.
- Ajouter RLS et politiques admin.
- Ajouter fonctions d'accès serveur.

### PR 5 — Paiement mock Consultation

- Ajouter endpoints ou Server Actions dédiés Consultation.
- Ajouter `/consultation/checkout/[requestId]`.
- Ajouter `/consultation/confirmation/[requestId]`.
- Ne pas modifier les endpoints Academy.

### PR 6 — Admin Consultation

- Ajouter `/admin/consultations`.
- Ajouter liste, filtres, fiche détail et notes internes.
- Ajouter actions de changement de statut.

### PR 7 — Durcissement et automatisations

- Notifications email ou WhatsApp.
- Expiration des paiements en attente.
- Export CSV admin.
- Passage éventuel à un fournisseur réel.
- Évaluation d'une future table globale `payments` si les besoins convergent.

## 13. Synthèse finale

Architecture recommandée : tunnel séparé en cinq routes, avec présentation, formulaire, checkout, confirmation et suivi admin.

Routes proposées :

```txt
/consultation
/consultation/reserver
/consultation/checkout/[requestId]
/consultation/confirmation/[requestId]
/admin/consultations
```

Tables proposées pour un futur PR :

```txt
consultation_requests
consultation_payments
```

Champs principaux proposés :

```txt
full_name
phone
email
department
commune
consultation_type
project_stage
project_description
estimated_budget
consultation_mode
consultation_package
amount
currency
payment_status
request_status
admin_notes
```

Workflow proposé : création en `pending_payment`, paiement mock Consultation, passage en `paid`, confirmation client, traitement admin.

Confirmations de périmètre pour ce PR :

- aucune logique existante n'est modifiée ;
- aucune migration Supabase n'est créée ;
- aucun changement n'est apporté à Academy ;
- aucun changement n'est apporté aux paiements Academy ;
- le site public n'est pas modifié par ce document d'audit.
