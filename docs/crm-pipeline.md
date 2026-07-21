# CRM Pipeline Agri-tech

## Rôle de `client_pipeline_cases`

`client_pipeline_cases` est la table centrale prévue pour le suivi CRM interne Agri-tech. Elle sert à regrouper les dossiers commerciaux/projet issus de Contact, Consultation ou d'une création manuelle admin, sans fusionner ni remplacer les tables sources existantes.

Cette table est ajoutée comme couche indépendante : les formulaires publics, les emails, les paiements, Academy et Certificats ne sont pas branchés sur cette table dans cette PR.

## Relation avec Contact

Une future synchronisation pourra créer un dossier CRM après insertion d'une ligne `contact_requests`.

Mapping recommandé :

- `source_type = 'contact'`
- `source_id = contact_requests.id`
- `client_name = contact_requests.organization` si présent, sinon `contact_requests.full_name`
- `primary_contact = contact_requests.full_name`
- `email = contact_requests.email`
- `phone = contact_requests.phone`
- `project_type = contact_requests.request_type` ou un slug métier pertinent
- `first_contact_at = contact_requests.created_at`

La contrainte unique partielle sur `(source_type, source_id)` empêchera de créer plusieurs dossiers CRM pour la même demande Contact.

## Relation avec Consultation

Une future synchronisation pourra créer ou enrichir un dossier CRM après insertion ou paiement d'une ligne `consultation_requests`.

Mapping recommandé :

- `source_type = 'consultation'`
- `source_id = consultation_requests.id`
- `client_name = consultation_requests.full_name`
- `primary_contact = consultation_requests.full_name`
- `email = consultation_requests.email`
- `phone = consultation_requests.phone`
- `project_type = consultation_requests.consultation_type`
- `location = department || commune` selon les champs disponibles
- `first_contact_at = consultation_requests.created_at`
- `last_interaction_at = consultation_requests.paid_at` après paiement si plus récent

La table CRM ne remplace pas `consultation_requests` ni `consultation_payments`. Les statuts de paiement restent dans le module Consultation.

## Dossiers manuels

Les dossiers créés directement par un admin utilisent :

- `source_type = 'manual'`
- `source_id = null`
- `source = 'manual'`

Cette forme est compatible avec l'index unique partiel, car les dossiers manuels n'ont pas d'identifiant source externe.

## Champs principaux

Champs d'identité et rattachement :

- `id`
- `case_code`
- `source_type`
- `source_id`
- `source`
- `metadata`

Champs client :

- `client_name`
- `organization_name`
- `primary_contact`
- `phone`
- `email`
- `location`

Champs pipeline :

- `project_type`
- `interest_level`
- `priority`
- `status`
- `outcome`
- `responsible`
- `next_action`
- `next_action_at`
- `last_interaction_at`
- `alert_follow_up`

Champs réunion/proposition :

- `meeting_date`
- `meeting_time`
- `meeting_confirmed`
- `post_meeting_decision`
- `proposal_sent_at`
- `proposed_amount_usd`
- `expected_close_at`
- `expected_decision`

## Code dossier

La migration ajoute une séquence et une fonction SQL pour générer `case_code` automatiquement au format :

```txt
AGT-CRM-YYYY-0001
```

Le trigger `set_client_pipeline_cases_case_code` remplit `case_code` avant insertion si aucune valeur n'est fournie. Le champ reste `unique not null` afin d'être lisible et utilisable dans le futur admin CRM.

## Règles de statuts

Statuts CRM autorisés :

| Valeur | Libellé recommandé |
| --- | --- |
| `nouveau` | Nouveau |
| `a_qualifier` | À qualifier |
| `reunion_a_planifier` | Réunion à planifier |
| `reunion_prevue` | Réunion prévue |
| `proposition_a_preparer` | Proposition à préparer |
| `proposition_envoyee` | Proposition envoyée |
| `relance_1` | Relance 1 |
| `relance_2` | Relance 2 |
| `gagne` | Gagné |
| `perdu` | Perdu |
| `en_attente` | En attente |
| `archive` | Archivé |

Autres valeurs contrôlées :

- `source_type` : `contact`, `consultation`, `manual`
- `interest_level` : `faible`, `moyen`, `eleve`, `tres_eleve`
- `priority` : `basse`, `normale`, `haute`, `urgente`
- `outcome` : `en_cours`, `gagne`, `perdu`, `abandonne`, `non_qualifie`

## Sécurité RLS

La migration active RLS sur `client_pipeline_cases`.

Aucune policy publique d'insertion, lecture, mise à jour ou suppression n'est créée. Une policy de lecture explicite refuse l'accès à `anon` et `authenticated`. Les opérations CRM futures devront passer par le serveur admin, avec la même logique de protection que les pages admin existantes (`requireAuthorizedAdmin()` et client Supabase service role côté serveur).

Les dossiers clients ne doivent jamais être exposés publiquement.

## Indexes

La migration ajoute des indexes pour les usages admin futurs :

- `source_type`
- `source_id`
- unicité partielle `(source_type, source_id)` quand `source_id is not null`
- `status`
- `priority`
- `interest_level`
- `outcome`
- `next_action_at`
- `last_interaction_at`
- `created_at desc`
- `email`
- `phone`
- `case_code`

## Éléments non encore implémentés

Cette PR ne branche pas encore la table CRM sur les flux existants.

Non implémenté à ce stade :

- création automatique d'un dossier CRM après soumission Contact ;
- création automatique d'un dossier CRM après soumission Consultation ;
- enrichissement automatique après paiement Consultation ;
- interface admin complète `/admin/suivi` ;
- fiche détail CRM ;
- édition CRM ;
- calcul automatique applicatif de `alert_follow_up` ;
- historique des changements CRM.

## Interface admin de suivi client

La route admin du suivi CRM est `/admin/suivi`. Elle est ajoutée dans la navigation d’administration sous le libellé **Suivi client** et doit être rendue uniquement dans l’espace admin protégé.

La page charge les dossiers depuis `client_pipeline_cases` côté serveur avec le client Supabase admin, après vérification `requireAuthorizedAdmin()`. Elle n’ajoute pas de branchement automatique depuis Contact ou Consultation et ne modifie pas les emails, paiements, Academy ou Certificats.

### Colonnes visibles

Le tableau principal reste volontairement synthétique pour éviter une interface illisible. Les colonnes visibles sont :

- ID dossier (`case_code`) ;
- Date 1er contact (`first_contact_at`) ;
- Nom client / Organisation (`client_name`, `organization_name`) ;
- Téléphone (`phone`) ;
- Email (`email`) ;
- Type de projet (`project_type`) ;
- Localisation (`location`) ;
- Source (`source_type`) ;
- Niveau intérêt (`interest_level`) ;
- Priorité (`priority`) ;
- Statut (`status`) ;
- Prochaine action (`next_action`) ;
- Responsable (`responsible`) ;
- Date prochaine action (`next_action_at`) ;
- Jours sans interaction ;
- Alerte suivi ;
- Issue (`outcome`).

Les autres champs restent réservés à une future fiche détail CRM.

### Filtres disponibles

Les filtres disponibles dans `/admin/suivi` sont :

- recherche libre par ID dossier, nom client, organisation, téléphone ou email ;
- statut ;
- source ;
- priorité ;
- niveau d’intérêt ;
- issue.

### Calcul des jours sans interaction

Le calcul est fait côté affichage uniquement, sans stockage supplémentaire dans `client_pipeline_cases` :

```txt
jours sans interaction = aujourd’hui - date de référence
```

La date de référence est choisie dans cet ordre :

1. `last_interaction_at` si renseigné ;
2. `first_contact_at` ;
3. `created_at`.

### Logique d’alerte suivi

La page affiche une alerte visuelle sans envoyer de notification automatique :

- **Action en retard** si `next_action_at` est dépassée ;
- **À relancer** si les jours sans interaction sont supérieurs ou égaux à 7, ou si `alert_follow_up` est déjà vrai ;
- **RAS** sinon.

Cette logique est uniquement informative dans cette PR.
