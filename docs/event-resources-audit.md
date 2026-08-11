# Audit et architecture du module de ressources événementielles

## 1. Objet et périmètre

Ce document prépare un module de **lead generation événementielle** : pendant une conférence, une personne scanne un QR code, renseigne un formulaire court, puis obtient une ressource gratuite (plan technique, fiche ou PDF). La soumission doit être conservée dans Supabase et consultable dans l'administration.

Le nom technique recommandé est :

- `event_resources` pour le catalogue des ressources et de leurs contextes événementiels ;
- `event_resource_leads` pour les demandes associées.

Ce vocabulaire est préféré à `lead_magnets`, plus marketing et moins explicite dans une plateforme principalement francophone, et à `conference_resources`, trop restrictif pour les présentations, interventions et autres événements. Il suit aussi les noms descriptifs au pluriel déjà employés (`contact_requests`, `consultation_requests`, `newsletter_subscribers`, `client_pipeline_cases`).

**Cet audit initial était exclusivement documentaire.** La migration et les types décidés ensuite sont décrits dans `docs/event-resources.md`; aucune route, aucun formulaire, bucket, traitement CRM, Newsletter ou email n’est toutefois branché.

## 2. État réel de l'architecture auditée

### 2.1 Routes publiques et rendu

- Le projet utilise Next.js App Router sous `src/app`. Les routes publiques historiques sans préfixe (`/`, `/services`, `/contact`, `/consultation`, `/academy`, `/actualites`, etc.) coexistent avec les variantes `/fr`, `/en` et `/es`.
- Les pages de détail reposent sur des segments dynamiques, notamment `/services/[slug]`, `/articles/[slug]`, `/formations/[slug]` et `/academy/cours/[slug]`.
- Le layout racine fournit les métadonnées globales, les scripts Analytics et `PublicChrome`. Ce dernier affiche actuellement le Header et le Footer sur toute route sauf `/admin`. Une future page `/r/[slug]` aurait donc la navigation publique par défaut : si l'expérience événementielle doit être réellement autonome et non promotionnelle dans la navbar, il faudra prévoir une exception explicite dans `PublicChrome` ou, de préférence lors d'une refonte, des route groups avec layouts distincts.
- La navigation est une liste statique dans `src/data/navigation.ts` rendue par `Header`. Une route `/r/[slug]` ne doit pas y être ajoutée.
- Aucun `sitemap.ts`, `robots.ts`, `sitemap.xml`, `robots.txt` ou générateur équivalent n'existe actuellement dans `src` ou `public`. L'absence actuelle de sitemap ne remplace pas une règle d'exclusion lorsque celui-ci sera ajouté.

### 2.2 Routes et sécurité admin

- Les écrans admin sont regroupés sous `/admin` et nommés en anglais par domaine (`articles`, `contact-requests`, `consultations`, `newsletter`, `email-events`), à l'exception métier de `/admin/suivi`.
- `middleware.ts` exige le cookie d'accès pour toute route `/admin/*`, sauf `/admin/login`. Les lectures et mutations sensibles doivent en plus appeler `requireAuthorizedAdmin()` côté serveur : le middleware ne vérifie que la présence du cookie, tandis que cette fonction valide l'utilisateur Supabase et la liste `ADMIN_EMAILS`.
- `src/app/admin/layout.tsx` applique déjà `noindex, nofollow` à toute l'administration et centralise sa navigation.
- Les listes admin sont des Server Components alimentés par des fonctions serveur dédiées (`adminContactRequests`, `adminConsultations`, `adminNewsletter`, `adminPipeline`). Elles proposent recherche, filtres, statistiques et limites de résultats selon les modules.

### 2.3 Supabase et migrations

- Les clients sont centralisés dans `src/lib/supabase`: client public/anon pour les contextes autorisés et client service-role pour les écritures et lectures serveur. Les secrets ne doivent jamais parvenir au navigateur.
- Les migrations SQL sont horodatées sous `supabase/migrations` avec le format `YYYYMMDD_description.sql`. Elles créent explicitement contraintes, index, triggers `updated_at`, RLS et policies/révocations.
- Les collectes Contact, Consultation et Newsletter passent par le serveur. La Newsletter illustre la convention la plus stricte : RLS activé sans policy publique et insertion via le client service-role.
- Les migrations utilisent des UUID `gen_random_uuid()`, `timestamptz`, des `check`, `jsonb not null default '{}'::jsonb`, des index ciblés et des clés étrangères avec comportement de suppression explicite.

### 2.4 Formulaires et validation

- Deux conventions coexistent : Contact poste du JSON vers une Route Handler (`POST /api/contact`) ; Consultation utilise une Server Action via `useActionState` et retourne les erreurs par champ.
- La validation existante est écrite en TypeScript sans bibliothèque de schéma : nettoyage/trim, longueurs maximales, expressions régulières email, listes de valeurs autorisées et champs nullable. Elle est répétée côté serveur même lorsque les attributs HTML (`required`, `maxLength`, `type=email`) améliorent l'UX.
- Contact et Newsletter ont un honeypot. Newsletter limite aussi la taille du payload à 4 Kio et gère les doublons/concurrences. Contact a une fenêtre anti-double soumission en mémoire, utile en UX mais non distribuée.
- Pour le nouveau module, une Route Handler dédiée est la convention recommandée, car elle fournit une frontière claire pour la validation, l'anti-abus et une réponse JSON contenant l'autorisation de téléchargement. Les contrôles client ne doivent être qu'un complément.

### 2.5 CRM, Newsletter et emails

- Le CRM stocke des `client_pipeline_cases` et des interactions. `sourceSync.ts` crée aujourd'hui automatiquement, de façon idempotente, un dossier pour les sources `contact` et `consultation`, puis une interaction initiale. La contrainte SQL de `source_type` n'accepte actuellement que `contact`, `consultation` et `manual`.
- La Newsletter utilise `newsletter_subscribers`, normalise l'email en minuscules, empêche les doublons par contrainte unique et conserve statut, source, locale, page et metadata. Une inscription active existante est traitée comme un succès sans nouvelle ligne.
- Les emails transactionnels passent par le transport Brevo commun, des templates HTML/texte et `email_events`. Les pannes email sont journalisées mais ne doivent pas annuler une persistance déjà réussie.
- Ces trois domaines sont suffisamment découplés pour que la première implémentation du module conserve seulement le lead, puis ajoute les synchronisations dans des PR séparées.

### 2.6 i18n, SEO et ressources téléchargeables

- Les locales supportées sont `fr`, `en` et `es`, avec français par défaut. Les traductions UI sont des JSON chargés via `src/i18n`; le contenu public structuré est aussi localisé dans des modules TypeScript. `hasLocalizedPath` est une liste explicite des chemins localisés et ne connaît pas `/r`.
- `createMetadata` centralise canonical, Open Graph et Twitter, mais n'offre pas encore d'option robots. Le noindex admin est posé directement dans son layout.
- Le domaine canonique configuré est `https://agritech509ht.com` et `metadataBase` repose sur `NEXT_PUBLIC_SITE_URL` via `env.siteUrl`. Les QR codes de production doivent toujours encoder une URL HTTPS absolue de ce domaine, jamais une URL de preview.
- Aucun PDF n'est actuellement versionné dans `public`, et les ressources Academy indiquent explicitement que le téléchargement réel n'est pas actif. Le seul précédent Storage est le bucket public `article-images`, alimenté par des routes admin serveur et limité par MIME/taille.

## 3. Parcours utilisateur recommandé

```text
QR code imprimé ou affiché
  → https://agritech509ht.com/r/[slug]
  → chargement d'une ressource active
  → formulaire court (nom, téléphone, email)
  → validation et soumission serveur
  → création de event_resource_leads
  → réponse de succès
  → affichage du bouton de téléchargement
  → téléchargement de la ressource
  → consultation ultérieure du lead dans /admin/resources
```

Règles d'expérience :

1. Le slug doit être lisible, stable, court et sans donnée personnelle, par exemple `ruche-langstroth-cap-haitien-2026`.
2. Le QR code est un support de distribution, pas un mécanisme d'authentification. Il pointe directement vers l'URL officielle ; éviter les raccourcisseurs tiers afin de préserver la marque et la durabilité.
3. La page explique la ressource avant le formulaire et n'affiche le bouton qu'après une persistance réussie. Une soumission répétée peut être rendue idempotente sans annoncer si l'email existe déjà.
4. Nom, téléphone et email sont obligatoires selon le besoin exprimé. `organization` et `interest_area` restent facultatifs pour garder un formulaire court. Les consentements doivent être séparés : accès à la ressource, contact commercial et Newsletter ne sont pas équivalents.
5. Une ressource inactive ou un slug inconnu retourne une vraie page 404, sans révéler le catalogue. Une ressource devenue indisponible peut afficher un message contrôlé sans formulaire.
6. Après succès, le téléchargement ne dépend pas d'un email futur : l'utilisateur obtient immédiatement son bouton. L'email de copie est une amélioration ultérieure.

Ces pages restent accessibles par lien ou QR code, mais ne figurent ni dans la navbar, ni dans le Footer, ni dans le futur sitemap. « Non listée » ne signifie pas privée : un lien peut être partagé et des robots peuvent le découvrir.

## 4. Modèle de données proposé (future migration uniquement)

### 4.1 Table `event_resources`

| Champ                   | Type/convention proposé                            | Rôle                                                                       |
| ----------------------- | -------------------------------------------------- | -------------------------------------------------------------------------- |
| `id`                    | `uuid primary key default gen_random_uuid()`       | Identifiant interne.                                                       |
| `slug`                  | `text not null unique`                             | Segment court de `/r/[slug]`, normalisé en minuscules.                     |
| `title`                 | `text not null`                                    | Titre visible.                                                             |
| `description`           | `text`                                             | Présentation courte.                                                       |
| `resource_type`         | `text not null default 'document'` + `check`       | `document`, `plan`, `guide`, `fiche_technique`, `presentation` ou `autre`. |
| `file_url`              | `text not null`                                    | Référence de téléchargement ; voir la recommandation Storage ci-dessous.   |
| `file_name`             | `text`                                             | Nom proposé au téléchargement, sans chemin.                                |
| `event_name`            | `text`                                             | Conférence/intervention associée.                                          |
| `topic`                 | `text`                                             | Sujet utilisé notamment pour le futur mapping CRM.                         |
| `language`              | `text not null default 'fr'` + `check`             | `fr`, `en`, `es` ou `ht`.                                                  |
| `is_active`             | `boolean not null default true`                    | Publication logique et révocation rapide du QR code.                       |
| `requires_form`         | `boolean not null default true`                    | Prépare une éventuelle ressource libre ; le MVP doit le laisser à `true`.  |
| `download_button_label` | `text not null default 'Télécharger la ressource'` | Libellé personnalisable dans la langue de la ressource.                    |
| `created_at`            | `timestamptz not null default now()`               | Audit.                                                                     |
| `updated_at`            | `timestamptz not null default now()` + trigger     | Audit des modifications.                                                   |
| `metadata`              | `jsonb not null default '{}'::jsonb`               | Extension non critique (édition, campagne, paramètres QR).                 |

Contraintes/index recommandés : slug non vide et conforme à `^[a-z0-9]+(-[a-z0-9]+)*$`, longueurs applicatives et SQL raisonnables, index `(is_active, created_at desc)`, trigger `updated_at`, RLS activé sans écriture publique. Une lecture anonyme directe de toute la table n'est pas nécessaire : le serveur peut sélectionner uniquement la ressource active demandée.

**Stockage recommandé :** malgré le nom demandé `file_url`, stocker idéalement un chemin d'objet opaque (`bucket/path`) plutôt qu'une URL signée périssable. Créer dans une PR ultérieure un bucket privé dédié, par exemple `event-resources`, autoriser les uploads admin côté serveur, puis générer après soumission une URL signée à courte durée. Un bucket public ou un fichier dans `public/` est plus simple, mais l'URL serait récupérable avant le formulaire ou partageable sans contrôle. Si une URL externe est nécessaire, valider son protocole et ses hôtes autorisés côté serveur. Ne jamais accepter une URL fournie par le visiteur.

### 4.2 Table `event_resource_leads`

| Champ                | Type/convention proposé                                          | Rôle                                                        |
| -------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| `id`                 | `uuid primary key default gen_random_uuid()`                     | Identifiant du lead.                                        |
| `resource_id`        | `uuid not null references event_resources(id) on delete cascade` | Ressource demandée ; sa suppression purge ses leads.        |
| `full_name`          | `text not null`                                                  | Nom nettoyé.                                                |
| `phone`              | `text`                                                           | Téléphone/WhatsApp facultatif conservé comme texte.         |
| `email`              | `text not null`                                                  | Email normalisé en minuscules.                              |
| `organization`       | `text`                                                           | Organisation facultative.                                   |
| `interest_area`      | `text`                                                           | Intérêt déclaré facultatif.                                 |
| `consent_newsletter` | `boolean not null default false`                                 | Consentement marketing Newsletter explicite, non précoché.  |
| `consent_contact`    | `boolean not null default true`                                  | Valeur initiale demandée, à expliciter dans la future UI.   |
| `source`             | `text not null default 'qr_code'`                                | Canal d'acquisition fixé par le serveur.                    |
| `event_name`         | `text`                                                           | Snapshot de l'événement au moment de la soumission.         |
| `page_path`          | `text`                                                           | Chemin source facultatif fixé/validé par le serveur.        |
| `created_at`         | `timestamptz not null default now()`                             | Date de collecte.                                           |
| `metadata`           | `jsonb not null default '{}'::jsonb`                             | Contexte technique minimal (campagne, locale), sans secret. |

Contraintes/index recommandés : champs obligatoires non vides, contrôle email, index `(resource_id, created_at desc)`, `(created_at desc)`, email et téléphone pour la recherche admin. La migration retient un index unique `(resource_id, lower(email))` : un email peut demander plusieurs ressources, mais une seule ligne est conservée pour une même ressource, indépendamment de la casse. Le futur serveur devra normaliser l'email et traiter les conflits concurrents comme une soumission déjà enregistrée.

RLS doit être activé sans policy publique, comme pour la Newsletter. La Route Handler utilise le service-role côté serveur ; aucune lecture de leads ne doit être exposée au navigateur. Les suppressions de ressources physiques et les rétentions de données personnelles doivent être formalisées avant production.

## 5. Routes et composants proposés

### Routes publiques non listées

- `GET /r/[slug]` : Server Component, charge uniquement la ressource active, produit ses métadonnées noindex et rend le formulaire.
- `POST /api/event-resources/[slug]/leads` : valide, limite le payload, applique honeypot/rate limit, résout le slug côté serveur, insère le lead, puis retourne un jeton ou une URL signée de téléchargement.
- Option plus robuste : `GET /api/event-resources/download/[token]`, jeton court et signé, afin de ne pas renvoyer directement un chemin Storage.

La route courte `/r/[slug]` est retenue plutôt que `/ressources/[slug]` pour produire des QR codes moins denses et indépendants de la langue. `r` doit être réservé à ce module. Pour le MVP, `language` pilote le contenu de la page sans multiplier les URL. Une phase i18n ultérieure pourra modéliser des traductions ou des ressources sœurs ; ajouter simultanément `/fr/r`, `/en/r`, `/es/r` créerait sinon des canoniques et QR concurrents.

### Routes admin

- `/admin/resources` : liste, statistiques, recherche et filtres (activité, événement, langue, type), plus accès aux leads/export futur ;
- `/admin/resources/new` : création et upload ;
- `/admin/resources/[id]` : modification, activation/désactivation, aperçu URL/QR et liste des leads associés.

`/admin/resources` suit la majorité des noms de routes admin existants en anglais et correspond au nom de domaine `event_resources`. Les libellés UI restent en français. Une future implémentation doit ajouter le lien au layout admin, protéger chaque opération avec `requireAuthorizedAdmin()` et conserver toutes les requêtes dans un module serveur tel que `src/lib/event-resources/adminResources.ts`.

### Découpage applicatif futur indicatif

```text
src/app/r/[slug]/page.tsx
src/app/api/event-resources/[slug]/leads/route.ts
src/app/admin/resources/page.tsx
src/app/admin/resources/new/page.tsx
src/app/admin/resources/[id]/page.tsx
src/components/event-resources/EventResourceLeadForm.tsx
src/components/admin/EventResourceForm.tsx
src/lib/event-resources/createEventResourceLead.ts
src/lib/event-resources/getEventResourceBySlug.ts
src/lib/event-resources/adminResources.ts
src/types/event-resources.ts
```

Ce découpage est une proposition, pas une liste de fichiers créée dans cette PR.

## 6. Stratégie noindex et mesure

La future page dynamique doit retourner, y compris via `generateMetadata`, au minimum :

```ts
robots: {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false, noimageindex: true },
}
```

Recommandations complémentaires :

- envoyer aussi l'en-tête HTTP `X-Robots-Tag: noindex, nofollow, noarchive` sur `/r/:path*` (et idéalement sur les réponses de téléchargement) via la configuration Next.js ou un handler ;
- ne jamais inclure `/r/*` dans un futur sitemap et ne jamais ajouter la route aux données de navigation ;
- utiliser un canonical auto-référent sur `https://agritech509ht.com/r/[slug]` seulement si nécessaire aux aperçus ; le noindex reste la directive principale ;
- ne pas compter sur `robots.txt` ou sur une règle `Disallow` seule : bloquer le crawl peut empêcher un robot de voir le `noindex` ;
- empêcher l'envoi de PII dans Google Analytics/Clarity, les URLs, paramètres, noms d'événements et metadata. Mesurer seulement des événements agrégés (`resource_view`, `lead_submit`, `download_click`) avec l'identifiant/slug de ressource non personnel, après revue consentement.

Le layout racine a actuellement `lang="fr-HT"`. Pour des pages anglaises ou espagnoles, une future PR i18n devra vérifier la stratégie de layout/document afin que la langue HTML corresponde effectivement au contenu.

## 7. Intégrations futures (non implémentées)

### 7.1 CRM

Après une insertion réussie, un adaptateur idempotent similaire à `sourceSync.ts` pourra créer un dossier :

| CRM               | Valeur issue du lead                                    |
| ----------------- | ------------------------------------------------------- |
| `source_type`     | `event_resource`                                        |
| `source_id`       | `event_resource_leads.id`                               |
| `source`          | `qr_code`                                               |
| `project_type`    | `interest_area`, sinon `event_resources.topic`          |
| `client_name`     | `full_name`                                             |
| `primary_contact` | `full_name`                                             |
| `phone`           | `phone`                                                 |
| `email`           | `email`                                                 |
| `location`        | `null` si non collecté                                  |
| `status`          | `nouveau`                                               |
| `priority`        | `normale`                                               |
| `interest_level`  | `moyen`                                                 |
| `main_channel`    | `site_web` (ou nouveau canal explicite après migration) |
| `next_action`     | `Recontacter après téléchargement de ressource`         |

Avant ce branchement, une migration CRM devra étendre le `check` de `source_type` et les types/labels TypeScript avec `event_resource`. L'index unique `(source_type, source_id)` fournit ensuite l'idempotence. Créer aussi une interaction initiale (« Ressource événementielle demandée ») avec `resource_id`, `event_name` et `topic` en metadata. Le choix fonctionnel recommandé est de ne synchroniser automatiquement que si `consent_contact = true`; sinon le lead reste visible dans son module sans devenir une tâche commerciale.

### 7.2 Newsletter

Si et seulement si `consent_newsletter = true`, une étape future peut synchroniser l'email normalisé vers `newsletter_subscribers` avec `source = 'event_resource'`, `page_path` et `resource_id`/`event_name` dans metadata. Elle doit réutiliser les règles actuelles d'idempotence et ne jamais considérer le simple téléchargement comme un consentement Newsletter. Il faut décider séparément si cette synchronisation déclenche l'email de bienvenue et conserver la preuve/date/version du consentement si les exigences juridiques le demandent.

### 7.3 Email

Après la persistance, un workflow non bloquant pourra envoyer via le transport Brevo existant :

- un remerciement ;
- un lien de téléchargement signé ou une URL contrôlée ;
- un rappel du thème et de l'événement ;
- un lien vers Consultation ou Academy dans la bonne langue.

Il faudra ajouter un template HTML/texte, un type `email_events` dédié et ses contraintes SQL. Comme dans les flux existants, l'échec Brevo doit être enregistré (`failed`/`skipped`) sans supprimer le lead et sans empêcher le téléchargement immédiat. Éviter une pièce jointe lourde ; préférer un lien HTTPS à durée adaptée.

## 8. Sécurité, confidentialité et risques techniques

| Risque                                         | Réponse recommandée                                                                                                                                                                       |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QR ou URL partagé publiquement                 | Considérer la page comme publique non indexée ; `is_active` permet la révocation. Ne jamais y mettre de secret durable.                                                                   |
| Contournement du formulaire par URL de fichier | Bucket privé, chemin jamais rendu avant succès, URL signée courte ou endpoint à jeton. Reconnaître qu'un destinataire peut toujours repartager le fichier téléchargé.                     |
| Spam automatisé pendant/après l'événement      | Honeypot, payload borné, rate limit distribué par IP/ressource, délais minimaux facultatifs, validation stricte serveur. Ne pas dépendre d'une `Map` mémoire en environnement serverless. |
| Doublons à forte concurrence                   | Contrainte SQL/idempotency key et traitement explicite du code Postgres `23505`.                                                                                                          |
| Énumération des slugs                          | Slugs suffisamment spécifiques, aucune API de liste publique, 404 uniforme, limitation de débit.                                                                                          |
| Fuite de PII                                   | Service-role uniquement serveur, RLS fermé, admin autorisé, logs sans valeurs personnelles, aucune PII en URL/analytics, rétention et suppression documentées.                            |
| Consentements ambigus                          | Cases distinctes, facultatives et non cochées ; texte/version/date de consentement à prévoir selon validation légale.                                                                     |
| Fichier malveillant ou trop lourd              | Upload admin seulement, allowlist MIME/extension, taille maximale, nom assaini, contrôle antivirus si le risque le justifie.                                                              |
| Open redirect / SSRF via `file_url`            | Interdire la saisie libre ou limiter aux chemins Storage/hôtes HTTPS autorisés ; générer la réponse côté serveur.                                                                         |
| QR imprimé devenu obsolète                     | URL canonique stable ; modifier la ressource derrière le slug avec historique, ou désactiver proprement sans réutiliser le slug pour un autre contenu.                                    |
| Suppression d'une ressource avec historique    | FK `on delete restrict`, désactivation logique et procédure séparée de purge du fichier.                                                                                                  |
| Réseau mobile faible en conférence             | Page légère, formulaire accessible, états pending/retry clairs, assets minimaux ; ne révéler le téléchargement qu'après confirmation serveur.                                             |
| Intégrations partielles                        | Persistance du lead comme transaction principale ; CRM, Newsletter et email idempotents, observables et non bloquants dans des étapes ultérieures.                                        |

## 9. Stratégie QR code

- Générer le QR à partir de l'URL canonique finale `https://agritech509ht.com/r/<slug>` ; aucun paramètre PII.
- Utiliser une correction d'erreur adaptée à la projection/impression, un contraste élevé, une zone calme et une taille testée à la distance réelle. Afficher aussi l'URL courte en texte comme solution de secours.
- Exporter SVG/PDF pour PowerPoint/impression et PNG haute résolution si nécessaire. Le QR lui-même peut être généré dans l'admin plus tard, mais le fichier du QR n'a pas besoin d'être stocké : il est déterministe à partir de l'URL.
- Tester avant chaque intervention sur iOS/Android, en Wi-Fi et données mobiles, et vérifier que le domaine, le certificat TLS, le slug actif et la ressource sont ceux de production.
- Les campagnes peuvent être différenciées par une ressource/slug ou par un identifiant non personnel en metadata. Éviter les paramètres UTM si le slug suffit ; sinon les limiter à des valeurs contrôlées et les exclure du canonical.

## 10. Plan de PR progressif

1. **PR 1 — audit (présente PR)** : documentation et décisions ; aucune logique métier.
2. **PR 2 — données et sécurité** : migrations `event_resources`/`event_resource_leads`, RLS fermé, contraintes/index/triggers, bucket privé et tests SQL. Ne pas toucher aux tables existantes hors nécessité validée.
3. **PR 3 — collecte publique** : types, requêtes serveur, `/r/[slug]`, Route Handler, validation, anti-abus, noindex/en-tête, téléchargement signé et tests. Adapter le chrome public sans modifier les formulaires existants.
4. **PR 4 — administration** : liste/détail/création, upload sécurisé, activation, statistiques, leads, QR exportable, autorisation serveur et tests.
5. **PR 5 — i18n et accessibilité** : textes FR/EN/ES, stratégie de traductions de ressources, langue HTML, validation clavier/lecteur d'écran et messages d'erreur.
6. **PR 6 — CRM opt-in** : extension contrôlée des contraintes/types CRM, synchronisation idempotente et interaction initiale, sans rendre l'échec bloquant.
7. **PR 7 — Newsletter opt-in** : synchronisation consentie et idempotente, preuve de consentement, décision sur welcome email/double opt-in.
8. **PR 8 — email et observabilité** : template de remerciement, lien signé, `email_events`, reprise d'échecs, métriques non personnelles.

Chaque PR doit avoir sa migration additive propre, ses tests, une procédure de rollback fonctionnelle et une vérification qu'aucun secret/service-role n'est inclus dans le bundle client.

## 11. Décisions à valider avant implémentation

- durée de conservation des leads et procédure de suppression/export ;
- texte légal exact et caractère obligatoire ou facultatif de `consent_contact` ;
- politique de doublon (un lead par ressource/email ou historique de chaque scan) ;
- bucket privé Supabase versus hébergement documentaire externe autorisé ;
- durée des liens signés et possibilité de retéléchargement ;
- langues disponibles par ressource et comportement de fallback ;
- niveau de rate limiting attendu pour un pic simultané de conférence ;
- rôle admin autorisé à voir/exporter les coordonnées et à uploader les fichiers.

## 12. Conclusion

L'architecture recommandée isole la collecte dans `event_resources` et `event_resource_leads`, expose une URL courte `/r/[slug]`, persiste exclusivement côté serveur, et ne libère le téléchargement qu'après succès. Elle s'aligne sur les conventions Supabase/admin actuelles tout en gardant CRM, Newsletter et email comme intégrations opt-in, idempotentes et non bloquantes. La migration issue de cet audit ajoute uniquement les deux nouvelles tables. Elle ne change aucun comportement de Contact, Consultation, Newsletter, Academy, CRM ou email.
