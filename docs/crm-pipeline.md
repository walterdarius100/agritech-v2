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

## Synchronisation automatique des sources

Les dossiers CRM sont désormais créés automatiquement après insertion réussie des demandes sources. La synchronisation est appelée côté serveur et reste non bloquante pour l'expérience utilisateur : en cas d'échec CRM, une erreur serveur `[crm-pipeline]` est journalisée, mais la soumission Contact, la redirection Consultation et les emails existants continuent leur flux normal.

### Création depuis Contact

Après insertion d'une ligne `contact_requests`, l'application appelle `safeCreatePipelineCaseFromContact()`.

Mapping appliqué :

- `source_type = 'contact'` ;
- `source_id = contact_requests.id` ;
- `source = 'contact'` ;
- `first_contact_at = contact_requests.created_at` ;
- `client_name = contact_requests.full_name` ;
- `organization_name = contact_requests.organization` ;
- `primary_contact = contact_requests.full_name` ;
- `email = contact_requests.email` ;
- `phone = contact_requests.phone` ;
- `project_type = 'Demande d’information générale'` ;
- `location = null` ;
- `main_channel = 'site_web'` ;
- `interest_level = 'moyen'` ;
- `priority = 'normale'` ;
- `status = 'nouveau'` ;
- `next_action = 'Répondre à la demande d’information'` ;
- `next_action_at = created_at + 1 jour` ;
- `outcome = 'en_cours'` ;
- `last_interaction_at = contact_requests.created_at`.

Le champ `metadata` conserve uniquement des informations utiles au routage interne (`request_type`, `subject`, `source_page`, slugs et titre de cours/service). Le message privé complet du formulaire Contact n'est pas copié dans le CRM.

### Création depuis Consultation

Après insertion d'une ligne `consultation_requests`, l'application appelle `safeCreatePipelineCaseFromConsultation()` avant la redirection vers le checkout.

Mapping appliqué :

- `source_type = 'consultation'` ;
- `source_id = consultation_requests.id` ;
- `source = 'consultation'` ;
- `first_contact_at = consultation_requests.created_at` ;
- `client_name = consultation_requests.full_name` ;
- `email = consultation_requests.email` ;
- `phone = consultation_requests.phone` ;
- `project_type = consultation_requests.consultation_type` ;
- `location = commune / département` selon les valeurs disponibles ;
- `main_channel = 'site_web'` ;
- `interest_level = 'eleve'` ;
- `priority = 'haute'` ;
- `status = 'a_qualifier'` ;
- `next_action = 'Vérifier le paiement et planifier la consultation'` ;
- `next_action_at = created_at + 1 jour` ;
- `outcome = 'en_cours'` ;
- `last_interaction_at = consultation_requests.created_at`.

Le champ `metadata` ne copie pas la description détaillée du projet. Il conserve uniquement les champs utiles au suivi : étape projet, budget estimé, mode, package, montant et devise.

### Anti-doublon

La synchronisation CRM vérifie l'existence d'un dossier avec le couple :

```txt
source_type + source_id
```

Si un dossier existe déjà, aucun nouveau dossier n'est créé. Si deux appels concurrents tentent une création simultanée, l'erreur d'unicité PostgreSQL `23505` est traitée comme un doublon attendu et ignorée côté CRM.

### Mise à jour après paiement Consultation

Lorsqu'un paiement Consultation est confirmé, l'application appelle `safeMarkPipelineCaseConsultationPaid()` pour mettre à jour le dossier CRM existant :

- `status = 'reunion_a_planifier'` ;
- `next_action = 'Planifier la réunion de consultation'` ;
- `priority = 'haute'` ;
- `last_interaction_at = paid_at` ;
- `next_action_at = paid_at + 1 jour`.

Cette mise à jour est également appelée si le checkout détecte qu'une demande est déjà payée, afin de rendre le traitement idempotent.

### Limites connues

- La synchronisation CRM ne crée pas encore de fiche détail, d'historique d'activité ou de notification automatique.
- Si la création CRM échoue après la création de la source, la source reste valide et l'erreur doit être corrigée depuis les logs serveur.
- Le backfill des anciennes demandes Contact/Consultation n'est pas inclus.

## Fiche détail CRM admin

La fiche détail d'un dossier CRM est disponible sur la route protégée `/admin/suivi/[caseId]`. Elle est chargée côté serveur après `requireAuthorizedAdmin()` et utilise le client Supabase admin ; aucune donnée de `client_pipeline_cases` n'est exposée dans l'espace public.

### Sections de la fiche

L'interface détail est organisée pour éviter un bloc unique difficile à lire :

1. Résumé du dossier ;
2. Informations client ;
3. Projet / besoin ;
4. Suivi commercial ;
5. Réunion ;
6. Proposition et relances ;
7. Décision / issue ;
8. Notes internes ;
9. Source d'origine.

### Champs modifiables

L'admin peut modifier les champs de suivi suivants depuis la fiche :

- `client_name` et `organization_name` ;
- `primary_contact`, `phone`, `email` ;
- `project_type`, `location`, `main_channel` ;
- `interest_level`, `priority`, `status` ;
- `next_action`, `responsible`, `next_action_at` ;
- `meeting_date`, `meeting_time`, `meeting_confirmed`, `post_meeting_decision` ;
- `proposal_sent_at`, `proposed_amount_usd`, `follow_up_1_at`, `follow_up_2_at` ;
- `expected_close_at`, `expected_decision`, `outcome` ;
- `admin_notes`.

### Champs non modifiables dans la fiche

Les champs techniques restent affichés en lecture seule ou réservés à la base de données :

- `id` ;
- `case_code` ;
- `source_type` ;
- `source_id` ;
- `created_at`.

### Comportement de `last_interaction_at`

Lorsqu'un admin enregistre la fiche détail, l'application met à jour `last_interaction_at` avec l'horodatage serveur courant. La règle est volontairement simple et prudente : l'enregistrement de la fiche représente une interaction CRM dès lors que cette fiche contient les champs de suivi sensibles (`status`, `next_action`, `next_action_at`, `meeting_date`, `meeting_confirmed`, `post_meeting_decision`, `proposal_sent_at`, `follow_up_1_at`, `follow_up_2_at`, `outcome`, `admin_notes`). Cette approche évite de manquer une interaction lorsqu'un champ important est modifié avec une valeur déjà existante.

### Lien avec Contact / Consultation

Le bloc **Source d'origine** affiche :

- `Source : Contact / Consultation / Manuel` ;
- `ID source : ...` lorsque `source_id` existe.

Si `source_type = contact`, la fiche propose un lien admin vers `/admin/contact-requests/[source_id]`. Si `source_type = consultation`, elle propose un lien admin vers `/admin/consultations/[source_id]`. Les dossiers manuels n'ont pas de lien source automatique.

## Création manuelle admin des dossiers CRM

La route protégée `/admin/suivi/nouveau` permet à un administrateur de créer un dossier CRM sans passer par les formulaires publics Contact ou Consultation. Elle répond aux prospects issus de canaux externes : WhatsApp, Facebook, Instagram, appel téléphonique, référence, rencontre terrain, email direct ou autre canal à qualifier.

### Accès et sécurité

- Le bouton **Nouveau dossier** est affiché dans `/admin/suivi`.
- La page de création appelle `requireAuthorizedAdmin()` côté serveur avant d'afficher le formulaire.
- L'action de création appelle aussi `requireAuthorizedAdmin()` avant toute insertion Supabase.
- Aucun formulaire public Contact, Consultation, Academy, Certificats, emails ou paiements n'est modifié par cette création manuelle.

### Champs de création

Champs disponibles dans le formulaire admin :

- Nom client / Organisation ;
- Contact principal ;
- Téléphone ;
- Email ;
- Type de projet ;
- Localisation ;
- Source ;
- Canal principal ;
- Niveau intérêt ;
- Priorité ;
- Statut ;
- Prochaine action ;
- Responsable ;
- Date prochaine action ;
- Notes internes.

Champs obligatoires :

- Nom client / Organisation ;
- Source ;
- Statut ;
- Priorité.

### Sources manuelles possibles

Le champ `source` accepte les valeurs suivantes pour un dossier créé manuellement :

- `manual` ;
- `whatsapp` ;
- `facebook` ;
- `instagram` ;
- `appel` ;
- `email_direct` ;
- `reference` ;
- `terrain` ;
- `autre`.

### Valeurs par défaut appliquées

À l'insertion, un dossier manuel est créé avec :

- `source_type = 'manual'` ;
- `source_id = null` ;
- `source = valeur choisie dans le formulaire` ;
- `status = 'nouveau'` par défaut dans le formulaire ;
- `priority = 'normale'` par défaut dans le formulaire ;
- `interest_level = 'moyen'` par défaut dans le formulaire ;
- `outcome = 'en_cours'` ;
- `first_contact_at = now()` côté application ;
- `last_interaction_at = now()` côté application.

### ID dossier et redirection

Le formulaire ne fournit pas `case_code`. Le trigger SQL existant `set_client_pipeline_case_code` continue donc à générer l'identifiant au format `AGT-CRM-YYYY-0001`, via la même logique que les dossiers automatiques Contact et Consultation.

Après création réussie, l'administrateur est redirigé vers la fiche détail protégée du dossier : `/admin/suivi/[caseId]`. Le dossier apparaît ensuite dans le pipeline `/admin/suivi` avec `source_type = manual` et la source choisie.

### Cas d'usage

La création manuelle sert à intégrer dans le pipeline CRM les prospects qui n'ont pas soumis les formulaires publics, par exemple une discussion WhatsApp, un message Facebook ou Instagram, un appel entrant, une recommandation client, une rencontre terrain ou un email direct reçu par l'équipe.

## Historique des interactions CRM

La table interne `client_pipeline_interactions` conserve les échanges importants rattachés à chaque dossier CRM. Elle ne remplace pas `client_pipeline_cases` : elle ajoute une chronologie exploitable dans la fiche détail admin `/admin/suivi/[caseId]`.

### Table `client_pipeline_interactions`

La migration crée les colonnes suivantes :

- `id` : identifiant UUID de l'interaction ;
- `case_id` : référence obligatoire vers `client_pipeline_cases(id)` avec suppression en cascade ;
- `interaction_type` : type de l'échange, `note` par défaut ;
- `interaction_date` : date métier de l'interaction, `now()` par défaut ;
- `channel` : canal utilisé, optionnel ;
- `summary` : résumé obligatoire ;
- `details` : détails internes optionnels ;
- `created_by` : auteur ou source système optionnel ;
- `created_at` : date technique de création ;
- `metadata` : données techniques JSON internes.

La table active RLS, révoque les droits `anon` et `authenticated`, et reste utilisée uniquement via le client Supabase admin côté serveur.

### Types d'interactions

Valeurs autorisées :

- `note` ;
- `appel` ;
- `whatsapp` ;
- `email` ;
- `reunion` ;
- `relance` ;
- `proposition` ;
- `paiement` ;
- `decision` ;
- `autre`.

### Canaux autorisés

Valeurs autorisées :

- `telephone` ;
- `whatsapp` ;
- `email` ;
- `site_web` ;
- `reunion_en_ligne` ;
- `reunion_physique` ;
- `facebook` ;
- `instagram` ;
- `autre`.

### Fonctionnement dans la fiche détail

La fiche `/admin/suivi/[caseId]` affiche la section **Historique des interactions** avec la date, le type, le canal, le résumé, les détails et l'auteur. Un formulaire admin permet d'ajouter une interaction avec : type d'interaction, canal, date, résumé et détails. Le type et le résumé sont obligatoires.

À chaque ajout manuel, l'action serveur insère l'interaction puis met à jour `client_pipeline_cases.last_interaction_at` avec la date de l'interaction. Le formulaire permet aussi, si nécessaire, de mettre à jour simplement `next_action`, `next_action_at` et `status` dans le dossier principal.

### Interactions automatiques

Des interactions système simples sont créées lors des événements CRM internes suivants :

- dossier créé depuis Contact ;
- dossier créé depuis Consultation ;
- dossier manuel créé depuis l'admin ;
- consultation payée.

Les interactions automatiques pour `proposition envoyée` et `relance ajoutée` restent une amélioration future si l'historique doit devenir un journal d'audit exhaustif de chaque modification de fiche.

## Alertes de relance et vue prioritaire

La page admin `/admin/suivi` calcule désormais des alertes applicatives côté serveur à partir des champs du dossier CRM. Ces alertes n'envoient aucun email automatique et ne créent aucun rappel externe : elles servent uniquement à prioriser l'affichage dans le dashboard admin.

### Statuts actifs et non actifs

Les règles d'alerte ne s'appliquent qu'aux statuts actifs :

- `nouveau` ;
- `a_qualifier` ;
- `reunion_a_planifier` ;
- `reunion_prevue` ;
- `proposition_a_preparer` ;
- `proposition_envoyee` ;
- `relance_1` ;
- `relance_2` ;
- `en_attente`.

Les statuts `gagne`, `perdu` et `archive` sont considérés comme non actifs et ne génèrent pas d'alerte de relance inutile.

### Règles d'alerte

Un dossier actif peut afficher un ou plusieurs badges :

- **Action aujourd’hui** : `next_action_at` correspond à la date du jour ;
- **En retard** : `next_action_at` est dépassée ;
- **À relancer** : aucune interaction depuis au moins 7 jours, ou `alert_follow_up` est déjà positionné ;
- **Aucune prochaine action** : le dossier actif n'a pas de `next_action_at` ;
- **Priorité urgente** : le dossier actif est marqué `priority = urgente`.

### Vue “À traiter”

L'onglet **À traiter** de `/admin/suivi` filtre les dossiers actifs à prioriser. Il inclut :

- les dossiers avec action en retard ;
- les dossiers avec action aujourd'hui ;
- les dossiers sans interaction depuis au moins 7 jours ;
- les dossiers actifs sans prochaine action ;
- les dossiers de priorité `haute` ou `urgente`.

### Logique de tri de la vue “À traiter”

La vue prioritaire trie les dossiers dans l'ordre suivant :

1. action en retard ;
2. priorité urgente ;
3. date de prochaine action la plus proche ;
4. nombre de jours sans interaction le plus élevé ;
5. date de création la plus récente.

### Résumé CRM

Le haut de `/admin/suivi` affiche des compteurs rapides : nouveaux dossiers, dossiers à traiter, actions en retard, propositions envoyées, dossiers gagnés et dossiers perdus.

### Limites actuelles

Les alertes sont calculées à l'affichage et sur les 100 derniers dossiers retournés par la requête admin actuelle. Elles ne déclenchent pas d'email, de notification externe, de tâche planifiée ni d'écriture automatique supplémentaire en base.
