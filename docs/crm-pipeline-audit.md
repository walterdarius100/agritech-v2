# Audit et planification CRM / pipeline interne

## Portée de cette PR

Cette PR est volontairement documentaire. Elle n'ajoute aucune table, aucune migration, aucune route et ne modifie pas les modules Contact, Consultation, Academy, Certificats, emails ou paiements. L'objectif est de préparer une future couche CRM indépendante qui centralise le suivi sans casser les tables sources existantes.

## Fichiers et zones audités

Zones inspectées :

- `src/app/contact/`
- `src/app/consultation/`
- `src/app/admin/`
- `src/app/api/`
- `src/lib/`
- `src/lib/email/`
- `supabase/migrations/`
- `docs/`

Fichiers clés lus pour l'audit :

- `supabase/migrations/20260630_create_contact_requests_table.sql`
- `supabase/migrations/20260702_extend_contact_requests_academy_access.sql`
- `supabase/migrations/20260714_create_consultation_tables.sql`
- `supabase/migrations/20260716_add_consultation_email_sent_at.sql`
- `supabase/migrations/20260716_require_consultation_request_email.sql`
- `supabase/migrations/20260720_create_email_events.sql`
- `src/types/contact.ts`
- `src/types/consultation.ts`
- `src/lib/contact/createContactRequest.ts`
- `src/lib/contact/adminContactRequests.ts`
- `src/lib/consultation/createConsultationRequest.ts`
- `src/lib/consultation/checkout.ts`
- `src/lib/consultation/adminConsultations.ts`
- `src/lib/consultation/statusLabels.ts`
- `src/lib/email/events.ts`
- `src/lib/auth/adminAuth.ts`
- `src/app/admin/layout.tsx`
- `src/app/admin/contact-requests/page.tsx`
- `src/app/admin/contact-requests/[id]/page.tsx`
- `src/app/admin/consultations/page.tsx`
- `src/app/admin/consultations/[requestId]/page.tsx`
- `src/app/admin/email-events/page.tsx`

## État actuel observé

### Tables Supabase utilisées par Contact

La couche Contact écrit dans `public.contact_requests`.

Colonnes observées :

| Colonne | Type observé | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `full_name` | `text not null` | Nom complet requis |
| `email` | `text not null` | Email requis |
| `phone` | `text` | Optionnel |
| `organization` | `text` | Optionnel |
| `request_type` | `text not null` | Défaut `general` |
| `service_slug` | `text` | Optionnel |
| `formation_slug` | `text` | Optionnel |
| `course_slug` | `text` | Ajout Academy access |
| `course_title` | `text` | Ajout Academy access |
| `metadata` | `jsonb not null` | Défaut `{}` |
| `subject` | `text` | Optionnel côté table, valeur par défaut applicative possible |
| `message` | `text not null` | Message requis |
| `source_page` | `text` | URL/page origine optionnelle |
| `status` | `text not null` | Défaut `new` |
| `priority` | `text not null` | Défaut `normal` |
| `admin_notes` | `text` | Notes internes |
| `created_at` | `timestamptz not null` | Défaut `now()` |
| `updated_at` | `timestamptz not null` | Mis à jour par trigger |

Statuts Contact existants :

- `new`
- `in_review`
- `contacted`
- `converted`
- `closed`
- `spam`

Priorités Contact existantes :

- `low`
- `normal`
- `high`
- `urgent`

Types Contact existants :

- `general`
- `service`
- `formation`
- `academy_access`
- `partnership`
- `other`

### Tables Supabase utilisées par Consultation

La couche Consultation utilise deux tables principales :

- `public.consultation_requests`
- `public.consultation_payments`

Colonnes observées dans `consultation_requests` :

| Colonne | Type observé | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `request_code` | `text unique not null` | Généré avec préfixe `CONS-YYYY-0000` |
| `full_name` | `text not null` | Nom complet requis |
| `email` | `text` + contrainte email | Email requis par validation applicative et contrainte SQL `not valid` |
| `phone` | `text not null` | Téléphone requis |
| `department` | `text` | Optionnel |
| `commune` | `text` | Optionnel |
| `consultation_type` | `text not null` | Domaine / type de consultation |
| `project_stage` | `text` | Optionnel |
| `project_description` | `text not null` | Description requise |
| `estimated_budget` | `text` | Optionnel |
| `consultation_mode` | `text` | Optionnel |
| `consultation_package` | `text not null` | Package fixé côté application |
| `amount` | `numeric(12,2) not null` | Défaut SQL `2500` |
| `currency` | `text not null` | Défaut SQL `HTG` |
| `payment_status` | `text not null` | Défaut `pending` |
| `request_status` | `text not null` | Défaut `pending_payment` |
| `paid_at` | `timestamptz` | Date de paiement |
| `scheduled_at` | `timestamptz` | Date de planification admin |
| `admin_notes` | `text` | Notes internes |
| `client_email_sent_at` | `timestamptz` | Marqueur anti-doublon email client |
| `internal_email_sent_at` | `timestamptz` | Marqueur anti-doublon email interne |
| `created_at` | `timestamptz not null` | Défaut `now()` |
| `updated_at` | `timestamptz not null` | Mis à jour par trigger |

Colonnes observées dans `consultation_payments` :

| Colonne | Type observé | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK |
| `consultation_request_id` | `uuid not null` | FK vers `consultation_requests(id)` avec cascade delete |
| `provider` | `text not null` | `mock`, `moncash`, `natcash`, `manual` |
| `provider_transaction_id` | `text` | Référence provider |
| `amount` | `numeric(12,2) not null` | Montant payé |
| `currency` | `text not null` | Défaut `HTG` |
| `status` | `text not null` | Défaut `pending` |
| `payment_method` | `text` | Méthode sélectionnée |
| `metadata` | `jsonb not null` | Défaut `{}` |
| `created_at` | `timestamptz not null` | Défaut `now()` |
| `updated_at` | `timestamptz not null` | Mis à jour par trigger |
| `paid_at` | `timestamptz` | Date de paiement |

Statuts Consultation existants :

- `payment_status` : `pending`, `paid`, `failed`, `cancelled`, `refunded`
- `request_status` : `pending_payment`, `paid`, `scheduled`, `completed`, `cancelled`, `failed_payment`

### Logique de paiement Consultation

Le formulaire Consultation crée d'abord une ligne `consultation_requests` avec `payment_status = pending` et `request_status = pending_payment`, puis redirige vers `/consultation/checkout/[requestId]`.

Le paiement mock :

1. vérifie la demande ;
2. évite de recréer un paiement si la demande est déjà payée ou si un paiement payé existe ;
3. crée un paiement provider `mock` ;
4. confirme immédiatement ce paiement avec statut `paid` ;
5. insère une ligne dans `consultation_payments` ;
6. met à jour `consultation_requests.payment_status = paid`, `request_status = paid`, `paid_at = ISO string` ;
7. envoie les emails Consultation payée ;
8. redirige vers `/consultation/confirmation/[requestId]`.

### Affichage admin Contact

L'admin Contact expose `/admin/contact-requests` et `/admin/contact-requests/[id]`.

La liste affiche : date, nom, email, type, sujet, statut, priorité, action. Le détail affiche les informations de la demande et permet de modifier `status`, `priority` et `admin_notes`.

### Affichage admin Consultation

L'admin Consultation expose `/admin/consultations` et `/admin/consultations/[requestId]`.

La liste affiche : code demande, nom, téléphone, email, domaine, commune, package, montant, paiement, statut demande, date, action. Elle filtre uniquement par `request_status`. Le détail affiche la demande, les paiements associés, et permet de modifier `request_status` et `admin_notes`. Quand le statut admin passe à `scheduled`, `scheduled_at` est renseigné avec la date courante.

### Événements `email_events` existants

La table `email_events` contient les types autorisés suivants :

- `consultation_client_confirmation`
- `consultation_internal_notification`
- `contact_visitor_acknowledgement`
- `contact_internal_notification`
- `academy_welcome`
- `academy_purchase_confirmation`
- `academy_internal_purchase_notification`
- `certificate_available`

Statuts email existants : `sent`, `failed`, `skipped`.

### Systèmes de dates déjà utilisés

Le projet utilise principalement :

- `timestamptz` SQL avec `now()` pour `created_at`, `updated_at`, `paid_at`, `scheduled_at` et marqueurs email ;
- triggers `set_updated_at()` pour mettre à jour `updated_at` ;
- `new Date().toISOString()` côté serveur pour les paiements mock et certains changements de statut ;
- `new Date(...).toLocaleDateString("fr-FR")` et `toLocaleString("fr-FR")` côté admin pour l'affichage ;
- `Date.now()` côté serveur pour la déduplication mémoire de soumissions Contact et les références mock.

### Protection des routes admin

La protection admin repose sur :

- cookies `agritech-admin-access-token` et `agritech-admin-refresh-token` ;
- lecture du user Supabase via `supabase.auth.getUser(accessToken)` ;
- allowlist `ADMIN_EMAILS` ;
- `requireAuthorizedAdmin()` dans les pages/actions sensibles ;
- redirection vers `/admin/login` si non connecté ;
- redirection vers `/admin/unauthorized` si connecté mais non autorisé.

Les opérations admin Supabase utilisent la service role côté serveur via `createSupabaseAdminClient()`. La service role contourne les politiques RLS et ne doit pas être exposée côté client.

### Logique RLS existante

Observations principales :

- `contact_requests` : RLS activée, politique publique d'insert anonyme uniquement ; pas de lecture publique.
- `consultation_requests` : RLS activée, aucune policy publique observée dans la migration de création ; l'application écrit/lit via service role côté serveur.
- `consultation_payments` : RLS activée, aucune policy publique observée ; accès via service role côté serveur.
- `email_events` : RLS activée, politique de select qui refuse explicitement l'accès à `anon` et `authenticated`.
- Les autres modules ont leurs propres policies, notamment Academy et Articles, sans nécessité de modification pour cette PR CRM documentaire.

## Architecture CRM recommandée

Créer une nouvelle table centrale indépendante : `public.client_pipeline_cases`.

Principe : ne pas fusionner les tables Contact et Consultation. Le CRM doit référencer les demandes sources et stocker uniquement les champs de suivi commercial/projet.

Champs de rattachement recommandés :

- `source_type` : `contact`, `consultation`, `manual`
- `source_id` : UUID de la demande source lorsque `source_type` vaut `contact` ou `consultation`
- `source_reference` : texte lisible optionnel, par exemple `contact_requests.id` abrégé ou `consultation_requests.request_code`

Contrainte future recommandée :

```sql
unique (source_type, source_id)
```

Pour permettre les dossiers manuels sans source, deux options sont possibles :

1. rendre `source_id` nullable et créer un index unique partiel uniquement lorsque `source_id is not null` ;
2. créer un UUID interne aussi pour les sources manuelles et conserver `source_id not null`.

Recommandation : index unique partiel, car il reflète mieux l'absence de source externe pour `manual`.

## Schéma de table CRM proposé

> Les types ci-dessous sont des recommandations pour une future migration. Ils ne sont pas implémentés dans cette PR.

| Champ métier | Nom technique recommandé | Type Supabase recommandé | Requis | Défaut | Source Contact possible | Source Consultation possible | Admin / calculé |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ID dossier | `id` | `uuid` | Oui | `gen_random_uuid()` | Non | Non | Calculé DB |
| Code dossier lisible | `case_code` | `text` | Oui | séquence `CRM-YYYY-0000` | Non | `request_code` peut aider comme référence | Calculé DB |
| Date 1er contact | `first_contact_at` | `timestamptz` | Oui | `now()` | `created_at` | `created_at` ou `paid_at` selon règle | Prérempli, modifiable admin |
| Nom client / Organisation | `client_name` | `text` | Oui | Aucun | `organization` puis `full_name` | `full_name` | Admin |
| Contact principal | `primary_contact_name` | `text` | Oui | Aucun | `full_name` | `full_name` | Admin |
| Téléphone | `phone` | `text` | Non | `null` | `phone` | `phone` | Admin |
| Email | `email` | `text` | Non | `null` | `email` | `email` | Admin |
| Type de projet | `project_type` | `text` | Non | `null` | `request_type`, `service_slug`, `formation_slug`, `course_slug` | `consultation_type` | Admin |
| Localisation | `location` | `text` | Non | `null` | `source_page` rarement utile | concat `department`, `commune` | Admin |
| Source | `source_type` | `text` + check | Oui | Aucun | `contact` | `consultation` | Non modifiable après création |
| ID source | `source_id` | `uuid` | Non | `null` | `contact_requests.id` | `consultation_requests.id` | Non modifiable après création |
| Référence source | `source_reference` | `text` | Non | `null` | ID abrégé | `request_code` | Calculé / admin limité |
| Canal principal | `primary_channel` | `text` + check | Non | `formulaire_web` | `formulaire_web` | `formulaire_web` | Admin |
| Niveau intérêt | `interest_level` | `text` + check | Oui | `moyen` | Inféré depuis `priority`/type | Inféré depuis paiement/type | Admin |
| Priorité | `priority` | `text` + check | Oui | `normale` | mapping `priority` | `haute` si payé, sinon `normale` | Admin |
| Statut | `status` | `text` + check | Oui | `nouveau` | `new` -> `nouveau` | `pending_payment`/`paid` -> mapping | Admin |
| Prochaine action | `next_action` | `text` | Non | `null` | Non | Non | Admin |
| Responsable | `owner_user_id` | `uuid` | Non | `null` | Non | Non | Admin |
| Responsable texte | `owner_name` | `text` | Non | `null` | Non | Non | Admin si pas de table users interne |
| Date réunion prévue | `meeting_date` | `date` | Non | `null` | Non | date de `scheduled_at` possible | Admin |
| Heure réunion prévue | `meeting_time` | `time` | Non | `null` | Non | heure de `scheduled_at` possible | Admin |
| Réunion confirmée ? | `meeting_confirmed` | `boolean` | Oui | `false` | Non | `scheduled_at` peut préremplir `true` après confirmation admin | Admin |
| Décision après réunion | `post_meeting_decision` | `text` | Non | `null` | Non | Non | Admin |
| Date proposition envoyée | `proposal_sent_at` | `timestamptz` | Non | `null` | Non | Non | Admin |
| Montant proposé USD | `proposed_amount_usd` | `numeric(12,2)` | Non | `null` | Non | `amount` est en HTG, ne pas mapper automatiquement en USD | Admin |
| Date relance 1 | `follow_up_1_at` | `timestamptz` | Non | `null` | Non | Non | Admin |
| Date relance 2 | `follow_up_2_at` | `timestamptz` | Non | `null` | Non | Non | Admin |
| Date clôture prévue | `expected_close_date` | `date` | Non | `null` | Non | Non | Admin |
| Décision attendue | `expected_decision` | `text` | Non | `null` | Non | Non | Admin |
| Dernière interaction | `last_interaction_at` | `timestamptz` | Non | `created_at` | `created_at`/`updated_at` | `created_at`/`paid_at`/`scheduled_at` | Calculé avec override admin possible |
| Jours sans interaction | `days_without_interaction` | vue/generated ou calcul applicatif | Non | calcul | `last_interaction_at` | `last_interaction_at` | Calculé |
| Alerte suivi | `follow_up_alert` | vue/generated ou calcul applicatif | Oui | `false` calculé | Non | Non | Calculé |
| Issue | `outcome` | `text` + check | Oui | `en_cours` | `converted`/`closed` mappables | `completed`/`cancelled` mappables | Admin |
| Date prochaine action | `next_action_at` | `timestamptz` | Non | `null` | Non | Non | Admin + calcul affichage |
| Notes CRM | `crm_notes` | `text` | Non | `null` | `admin_notes` peut être copié une fois | `admin_notes` peut être copié une fois | Admin |
| Données snapshot | `source_snapshot` | `jsonb` | Oui | `{}` | champs source utiles | champs source utiles | Calculé à la création |
| Créé le | `created_at` | `timestamptz` | Oui | `now()` | Non | Non | DB |
| Modifié le | `updated_at` | `timestamptz` | Oui | `now()` | Non | Non | Trigger DB |

Contraintes futures recommandées :

```sql
check (source_type in ('contact', 'consultation', 'manual'))
check (status in ('nouveau','a_qualifier','reunion_a_planifier','reunion_prevue','proposition_a_preparer','proposition_envoyee','relance_1','relance_2','gagne','perdu','en_attente','archive'))
check (interest_level in ('faible','moyen','eleve','tres_eleve'))
check (priority in ('basse','normale','haute','urgente'))
check (outcome in ('en_cours','gagne','perdu','abandonne','non_qualifie'))
```

Index futurs recommandés :

- `(status, next_action_at)`
- `(priority, next_action_at)`
- `(source_type, source_id)` unique partiel si `source_id is not null`
- `(email)`
- `(phone)`
- recherche trigram ou full-text future sur `client_name`, `primary_contact_name`, `email`, `phone`, `case_code`

## Statuts CRM recommandés

| Valeur technique | Libellé français |
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

## Niveaux d'intérêt, priorités et issues

### Niveau d'intérêt

| Valeur technique | Libellé français |
| --- | --- |
| `faible` | Faible |
| `moyen` | Moyen |
| `eleve` | Élevé |
| `tres_eleve` | Très élevé |

### Priorité

| Valeur technique | Libellé français |
| --- | --- |
| `basse` | Basse |
| `normale` | Normale |
| `haute` | Haute |
| `urgente` | Urgente |

### Issue

| Valeur technique | Libellé français |
| --- | --- |
| `en_cours` | En cours |
| `gagne` | Gagné |
| `perdu` | Perdu |
| `abandonne` | Abandonné |
| `non_qualifie` | Non qualifié |

## Règles de synchronisation futures

Règle centrale : ne créer qu'un seul dossier CRM par demande source.

### Quand une demande Contact est soumise

- Après insertion réussie dans `contact_requests`, appeler un service serveur `ensureClientPipelineCaseForContact(contactRequestId)`.
- Chercher d'abord un dossier existant avec `source_type = 'contact'` et `source_id = contactRequestId`.
- Si aucun dossier n'existe, créer un dossier avec :
  - `first_contact_at = contact.created_at`
  - `client_name = contact.organization ?? contact.full_name`
  - `primary_contact_name = contact.full_name`
  - `email = contact.email`
  - `phone = contact.phone`
  - `project_type = contact.request_type` ou slug pertinent
  - `source_type = contact`
  - `source_id = contact.id`
  - `status = nouveau`
  - `priority` mappée depuis Contact : `low -> basse`, `normal -> normale`, `high -> haute`, `urgent -> urgente`
  - `source_snapshot` contenant les champs non sensibles nécessaires à l'audit.

### Quand une demande Consultation est soumise

- Après insertion réussie dans `consultation_requests`, appeler `ensureClientPipelineCaseForConsultation(requestId)`.
- Créer un dossier unique avec statut initial `a_qualifier` ou `nouveau` selon décision métier.
- Priorité recommandée : `normale` tant que le paiement est en attente.
- `source_reference = request_code`.

### Quand une demande Consultation est payée

- Après mise à jour `payment_status = paid` et `request_status = paid`, appeler le même service `ensureClientPipelineCaseForConsultation(requestId)`.
- Si le dossier existe déjà, ne pas le dupliquer ; mettre à jour uniquement les champs de suivi qui ne risquent pas d'écraser une saisie admin, par exemple :
  - `last_interaction_at = paid_at` si plus récent ;
  - `priority = haute` si priorité actuelle inférieure et non verrouillée ;
  - `status = reunion_a_planifier` seulement si le statut actuel est encore `nouveau` ou `a_qualifier` ;
  - enrichir `source_snapshot.payment_status` et `source_snapshot.paid_at`.

### Quand une demande est créée manuellement par un admin

- Créer un dossier avec `source_type = manual`, `source_id = null`, `source_reference = null`.
- Rendre obligatoires dans le formulaire admin : `client_name`, `primary_contact_name`, au moins un canal (`email` ou `phone`), `project_type`, `priority`, `status`.
- Conserver `source_snapshot = { "origin": "manual_admin" }`.

## Interface admin future recommandée

Route recommandée : `/admin/suivi`.

Justification : le libellé français est cohérent avec l'interface admin existante. `/admin/pipeline` reste acceptable si l'équipe préfère un vocabulaire CRM international.

### Page liste

La page `/admin/suivi` devrait contenir :

- tableau centralisé des dossiers CRM ;
- filtres par `status` ;
- filtres par `source_type` ;
- filtres par `priority` ;
- filtres par `interest_level` ;
- recherche par nom client, contact principal, téléphone, email, code dossier, ID dossier ;
- tri par date prochaine action, priorité, dernière interaction, date de création ;
- badges d'alerte pour relances dépassées ;
- lien vers la fiche source Contact ou Consultation quand applicable.

Colonnes recommandées pour la liste :

- Code dossier
- Client / Organisation
- Contact principal
- Téléphone
- Email
- Source
- Type de projet
- Statut
- Priorité
- Niveau intérêt
- Responsable
- Dernière interaction
- Prochaine action
- Alerte
- Action

### Fiche détail

La fiche détail `/admin/suivi/[caseId]` devrait permettre :

- modification des champs de suivi ;
- affichage en lecture seule de `source_type`, `source_id`, `source_reference` ;
- lien vers `/admin/contact-requests/[id]` ou `/admin/consultations/[id]` ;
- historique minimal des changements CRM dans une phase future ;
- gestion de la prochaine action ;
- saisie de notes CRM séparées des `admin_notes` des tables sources.

## Calculs automatiques recommandés

### Dernière interaction

Nom recommandé : `last_interaction_at`.

Sources possibles :

- création du dossier ;
- mise à jour admin d'une note CRM ;
- date de paiement Consultation ;
- date de réunion prévue ou confirmée ;
- dates de relance ;
- date de proposition envoyée.

Recommandation de première PR fonctionnelle : stocker `last_interaction_at` en colonne et la recalculer côté serveur lors des mutations CRM. Éviter de recalculer depuis Contact/Consultation à chaque lecture pour ne pas coupler fortement les modules.

### Jours sans interaction

Nom recommandé : `days_without_interaction`.

Calcul : différence en jours calendaires entre aujourd'hui et `last_interaction_at`.

Implémentations possibles :

- calcul applicatif dans le loader admin ;
- vue SQL `client_pipeline_cases_with_metrics` ;
- colonne générée si la contrainte de volatilité de `now()` est gérée autrement.

Recommandation : calcul applicatif ou vue SQL, pas une colonne persistée au début.

### Alerte suivi

Nom recommandé : `follow_up_alert`.

Règle de base : `true` si :

- `next_action_at` est dépassée ; ou
- `days_without_interaction` dépasse un seuil configurable ; et
- le dossier n'est pas dans un statut final (`gagne`, `perdu`, `archive`) ; et
- `outcome = en_cours`.

Seuils initiaux proposés :

- priorité `urgente` : 1 jour ;
- priorité `haute` : 3 jours ;
- priorité `normale` : 7 jours ;
- priorité `basse` : 14 jours.

### Date prochaine action

Nom recommandé : `next_action_at`.

Elle doit être saisissable par l'admin. Une suggestion automatique peut être préremplie selon le statut :

- `nouveau` / `a_qualifier` : +1 jour ;
- `reunion_a_planifier` : +2 jours ;
- `proposition_envoyee` : +3 jours ;
- `relance_1` : +5 jours ;
- `relance_2` : +7 jours.

## Sécurité et RLS CRM recommandées

Pour une future migration :

- activer RLS sur `client_pipeline_cases` ;
- ne créer aucune policy publique ;
- utiliser la service role uniquement côté serveur pour les actions admin, comme les modules admin actuels ;
- éventuellement créer une policy `using (false)` pour `anon` et `authenticated` si l'équipe veut expliciter le refus ;
- vérifier que la route admin appelle `requireAuthorizedAdmin()` avant toute lecture ou mutation ;
- ne jamais exposer le client Supabase service role côté navigateur ;
- éviter d'inclure des données sensibles inutiles dans `source_snapshot`.

## Risques techniques

- Écrasement de saisies admin lors d'une synchronisation automatique : prévoir des règles de non-écrasement.
- Duplication de dossiers CRM : imposer une contrainte unique partielle sur `(source_type, source_id)`.
- Couplage trop fort aux tables sources : garder un snapshot minimal et des références, pas une fusion.
- Statuts divergents entre CRM et tables sources : documenter les mappings et ne pas tenter une synchronisation bidirectionnelle au début.
- Dates et fuseaux horaires : continuer à stocker en `timestamptz`, afficher en `fr-FR`, et documenter le fuseau si l'équipe en choisit un pour Haïti.
- RLS : ne pas créer de policy trop permissive pour les données commerciales.
- Performance : prévoir des index pour filtres, tri et recherche avant d'ajouter beaucoup de dossiers.
- Historique : si l'audit des actions admin devient critique, ajouter une table d'événements CRM dans une PR séparée.

## Plan de PR progressif recommandé

### PR 1 — Audit et planification

- Créer ce document.
- Ne modifier aucune logique métier.
- Valider lint/build.

### PR 2 — Migration CRM minimale

- Ajouter `client_pipeline_cases`.
- Ajouter checks, index, trigger `updated_at`, RLS fermée.
- Ajouter types TypeScript CRM.
- Aucun branchement automatique dans Contact/Consultation à ce stade si l'équipe veut réduire le risque.

### PR 3 — Admin CRM lecture seule

- Ajouter `/admin/suivi` en lecture seule.
- Afficher les dossiers CRM existants.
- Ajouter filtres simples et recherche basique.

### PR 4 — Création/synchronisation contrôlée

- Ajouter services `ensureClientPipelineCaseForContact` et `ensureClientPipelineCaseForConsultation`.
- Brancher après les insertions Contact/Consultation et après paiement Consultation.
- Protéger contre les doublons avec upsert ou gestion d'erreur unique.

### PR 5 — Édition admin CRM

- Ajouter fiche détail `/admin/suivi/[caseId]`.
- Permettre la modification des champs CRM seulement.
- Ne pas modifier directement `contact_requests` ou `consultation_requests` depuis la fiche CRM.

### PR 6 — Alertes et métriques

- Ajouter calculs `days_without_interaction`, `follow_up_alert`, tri par retard.
- Ajouter indicateurs sur la page admin.

### PR 7 — Historique CRM optionnel

- Ajouter une table d'événements CRM si nécessaire.
- Tracer changement de statut, relance, proposition envoyée, responsable.

## Éléments à ne pas modifier dans cette phase

- Formulaire Contact.
- Formulaire Consultation.
- Academy.
- Certificats.
- Emails Brevo.
- `email_events`.
- Paiements Consultation.
- Routes publiques.
- Tables Supabase existantes.
- Politiques RLS existantes.

## Priorités recommandées

### Immédiat

- Valider l'architecture avec l'équipe métier.
- Confirmer le nom de route : `/admin/suivi` ou `/admin/pipeline`.
- Confirmer les statuts et libellés français.
- Confirmer si les dossiers Consultation doivent être créés dès soumission ou seulement après paiement.

### Court terme

- Créer la migration `client_pipeline_cases` avec RLS fermée.
- Ajouter types et helpers de mapping sans toucher aux flux existants.
- Construire une première page admin lecture seule.

### Moyen terme

- Activer la synchronisation automatique idempotente.
- Ajouter fiche détail éditable.
- Ajouter alertes de relance.
- Ajouter historique des actions CRM si le suivi commercial devient critique.
