# Audit et architecture i18n (FR / EN / ES)

> **Périmètre de cette PR : documentation uniquement.** Aucun composant, route, contenu, appel Supabase, email ou comportement métier n'est modifié. En particulier, Consultation, Contact, Academy et CRM ont seulement été lus pour établir l'audit.

## 1. Synthèse et décision recommandée

Le site utilise Next.js 15 avec l'App Router, TypeScript et des Server/Client Components, mais ne possède actuellement ni dépendance i18n, ni segment de locale, ni dictionnaire, ni sélecteur de langue. Toutes les routes publiques sont non préfixées et la langue globale est figée à `fr-HT` dans le layout racine.

La cible recommandée est une architecture **URL-first** avec `fr` comme locale par défaut et trois espaces publics indexables :

```txt
/fr/...
/en/...
/es/...
```

Une migration progressive est nécessaire pour ne pas casser les URLs déjà publiques. Les routes métier privées, API et administration ne doivent pas être localisées dans la première phase.

| Décision | Recommandation |
| --- | --- |
| Locales applicatives | `fr`, `en`, `es` |
| Locale par défaut | `fr` |
| Codes HTML / SEO | `fr-HT`, `en`, `es` (à affiner par marché si nécessaire) |
| Routage cible | préfixe obligatoire sur les pages publiques |
| Bibliothèque | `next-intl`, à valider et installer dans une PR d'implémentation |
| Détection | préférence mémorisée, puis `Accept-Language`, avec repli `fr` |
| Admin / CRM | français, URLs inchangées |
| API, webhooks, emails, Supabase | hors périmètre de la migration initiale |

## 2. État actuel vérifié

### 2.1 Structure des routes

Le projet contient un unique layout racine `src/app/layout.tsx`. Il monte `PublicChrome` (Header + Footer) autour de **toutes** les pages, sauf lorsque ce composant masque explicitement le chrome sur `/admin`. Il n'existe pas de route group public, de dossier `[locale]`, de `not-found.tsx` localisé, ni de fichiers `sitemap.ts` ou `robots.ts`.

Routes publiques de contenu et acquisition :

```txt
/
/services                         /services/[slug]
/formations                       /formations/[slug]
/actualites                       /articles/[slug]
/contact
/consultation                     -> redirection vers /consultation/reserver
/consultation/reserver
/mentions-legales
/politique-confidentialite
/certificats/verifier             /certificats/verifier/[certificateId]
```

Academy mélange vitrine publique et espace authentifié :

```txt
Public :  /academy
          /academy/cours/[slug]                 (fiche publique)
          /academy/login, /academy/register
          /academy/payment/cancel|success
          /certificats/verifier/[certificateId]

Privé :   /academy/dashboard, /academy/mes-cours
          /academy/cours/[slug]/apprendre
          /academy/checkout/[courseSlug]
          /academy/payment/mock/[paymentId]
          /academy/certificats, /academy/certificats/[certificateId]
```

Routes privées internes : tout `/admin/**` (articles, Academy, consultations, demandes Contact, newsletter, événements email et CRM sous `/admin/suivi`). Le middleware actuel ne protège que `/admin/:path*` par cookie et redirige vers `/admin/login`. Ces routes doivent rester non préfixées et françaises.

Routes techniques non localisables : `/api/contact`, `/api/newsletter`, les routes de paiement Academy, webhooks et vidéo sécurisée, ainsi que les handlers d'upload admin. Les paramètres et identifiants dynamiques (`slug`, `requestId`, `certificateId`, `paymentId`) font partie des contrats existants.

### 2.2 Composants partagés et organisation

- `src/components/layout/Header.tsx`, `Footer.tsx` et `PublicChrome.tsx` composent le chrome public. Il n'existe pas de dossiers séparés `components/navbar` ou `components/footer` : la navbar et le footer sont dans `components/layout`.
- `src/components/ui/*` fournit les primitives (`Button`, `Container`, `Section`, `Card`, `Badge`, `SectionHeader`). Elles sont majoritairement neutres, mais leurs consommateurs portent le texte.
- Les sections de page sont organisées dans `components/home`, `services`, `formations`, `articles`, `contact`, `consultation` et `academy`.
- `src/components/admin/*` et une grande partie de `components/academy/*` servent des interfaces privées et ne sont pas prioritaires.
- Le dépôt n'a actuellement pas de `src/content/`. Le contenu statique se trouve surtout dans `src/data/`, tandis que le contenu dynamique passe par `src/lib/` et Supabase.

### 2.3 Origine des textes

**Textes codés dans TSX.** La majorité des titres, paragraphes, CTA, libellés de formulaires, états vides, messages d'erreur et attributs d'accessibilité sont écrits directement dans les pages et composants. C'est notamment le cas de l'accueil (`components/home/*`), du Header/Footer, des listes et fiches Services/Formations, des actualités, de Contact/Consultation et d'Academy. Les chaînes client du Footer (validation et résultat newsletter) et du menu mobile devront aussi entrer dans les dictionnaires.

**Textes provenant de `src/data`.** Les sources statiques principales sont :

- `navigation.ts` et `footer.ts` : labels du chrome, coordonnées et newsletter ;
- `services.ts` : titres, descriptions, bénéfices, CTA et contenu détaillé des services ;
- `formations.ts` et `academyCourses.ts` : catalogue de repli et contenus de formation ;
- `articles.ts` : articles statiques de repli ;
- `home-domains.ts`, `testimonials.ts`, `partnerships.ts` : sections de l'accueil.

Il faut séparer à terme les données invariantes (slug technique, image, URL, icône, téléphone) des champs éditoriaux localisables. Un dictionnaire ne doit pas dupliquer les identifiants métier.

**Textes provenant de Supabase.** Les articles publiés sont lus depuis `articles` avec repli sur `src/data/articles.ts`. Le catalogue Academy public et ses fiches utilisent `academy_courses`, `academy_modules`, `academy_lessons` et `academy_resources`, avec un repli statique partiel sur les formations. Contact peut lire le profil et le titre d'un cours. Les espaces authentifiés consomment aussi profils, inscriptions, paiements, progression et certificats. Le schéma ne contient pas, d'après le code audité, de modèle explicite de traductions : ne pas modifier ce schéma dans la première PR i18n.

### 2.4 SEO actuel

- Le layout racine définit `metadataBase`, titre, description, keywords, canonical `/`, Open Graph et Twitter. `<html lang>` est statique (`fr-HT`) et `siteConfig.locale` vaut `fr_HT`.
- `src/lib/seo/metadata.ts` centralise les canonical, Open Graph et Twitter pour les pages qui l'utilisent. Il ne produit ni `alternates.languages`, ni `og:locale:alternate`.
- Des metadata statiques existent pour l'accueil, Services, Formations, Actualités, Contact, Consultation, Academy et les pages légales. Les fiches Service, Formation, Article et cours Academy ont des metadata dynamiques.
- Les pages Academy privées, plusieurs écrans de paiement/authentification et la vérification de certificats n'ont pas tous une politique `robots` explicite. Les pages admin sont déclarées `noindex, nofollow` dans leur layout.
- Aucun générateur de sitemap ou robots n'est présent dans le dépôt. Aucun `hreflang` multilingue n'est généré.

### 2.5 Navbar et footer actuels

Le Header est un Client Component responsive. Il lit `mainNavigation`, utilise des liens absolus non localisés et ne contient aucun sélecteur. Le menu mobile se ferme lors d'un changement de pathname. Le Footer est également client à cause du formulaire newsletter ; ses liens viennent de `src/data/footer.ts`, mais plusieurs libellés et messages y sont codés directement. Tous les liens du chrome devront devenir sensibles à la locale sans changer les endpoints des formulaires.

## 3. Comparaison des stratégies

### Option A — routes préfixées (`/fr`, `/en`, `/es`) — recommandée

**Avantages :** chaque traduction possède une URL indexable et partageable ; canonical, `hreflang`, analytics, cache serveur et sitemap sont déterministes ; une page conserve sa langue lors de la navigation ; le rendu serveur donne immédiatement le bon contenu et le bon `<html lang>`.

**Coûts :** migration des liens et metadata, ajout d'un layout de locale, stratégie explicite pour les anciennes URLs, adaptation des slugs éditoriaux et contrôle strict des routes exclues.

### Option B — locale client, URL inchangée

**Avantages :** faible changement initial des routes et prototype de sélecteur rapide.

**Limites rédhibitoires :** une même URL représente plusieurs langues, ce qui fragilise canonical et indexation ; le partage ne conserve pas forcément la langue ; risque de flash de contenu, hydration et dépendance au stockage client ; sitemap et `hreflang` ne peuvent pas décrire des variantes fiables. Cette option n'est pas recommandée pour l'objectif SEO.

## 4. Architecture cible et migration sans rupture

### 4.1 Arborescence proposée

```txt
src/
  app/
    [locale]/
      layout.tsx
      (marketing)/
        page.tsx
        services/...
        formations/...
        actualites/...
        articles/[slug]/...
        contact/...
        consultation/...
        academy/...              # vitrine/fiches publiques seulement
    admin/...                    # inchangé, français
    api/...                      # inchangé, sans locale
    academy/...                  # espace étudiant privé, migration différée
  i18n/
    locales.ts                   # locales, defaultLocale, types et labels
    routing.ts                   # helpers, chemins et exclusions
    request.ts                   # chargement serveur next-intl
    messages/
      fr.json
      en.json
      es.json
```

Namespaces minimaux dans chaque JSON : `navigation`, `footer`, `home`, `services`, `consultation`, `contact`, `academy`, `common`, `seo`. Des namespaces `formations`, `articles`, `legal` et `errors` pourront être ajoutés lorsqu'ils seront effectivement migrés. Conserver des clés sémantiques (`navigation.services`, `common.actions.learnMore`) plutôt que des phrases françaises comme clés.

Le layout `[locale]` doit valider la locale, charger le dictionnaire côté serveur et fournir le provider seulement aux Client Components qui en ont besoin. Les Server Components doivent rester la valeur par défaut. La locale doit piloter `<html lang>`, les formatteurs de date/nombre et les metadata.

### 4.2 Déploiement progressif recommandé

1. Ajouter l'infrastructure i18n et des tests de routage, sans déplacer les flux sensibles. Exclure explicitement `/api`, `/_next`, les assets, `/admin` et les routes Academy privées du matcher.
2. Publier `/fr`, `/en`, `/es` pour l'accueil et le chrome. Pendant cette phase, conserver `/` et les URLs françaises historiques comme alias/canonical français afin d'éviter les 404 et de mesurer la migration.
3. Migrer par familles stables (Services, Formations/Actualités, puis vitrines Contact/Consultation/Academy) avec redirections **permanentes** des anciennes URLs vers `/fr/...` seulement lorsque chaque famille est complète. Ne jamais maintenir deux canonical indexables pour le même contenu français.
4. Une fois la couverture publique suffisante, faire de `/fr/...` la forme canonique. `/` choisit une locale selon la règle ci-dessous ; les anciennes URLs françaises redirigent vers leur équivalent `/fr/...` en conservant query string et fragment côté client lorsque pertinent.

Une réécriture invisible est déconseillée comme état final : elle rend plus difficile la compréhension de la canonical et le diagnostic des doublons.

### 4.3 Redirection et choix de langue

- Une visite sur une URL préfixée ne doit **jamais** être redirigée par détection navigateur : l'URL explicite gagne.
- Sur `/`, priorité à une préférence de locale déjà choisie (cookie `NEXT_LOCALE` ou équivalent), puis à `Accept-Language`, puis repli `fr`.
- Pour limiter les surprises SEO et utilisateur, ne détecter automatiquement que sur la racine. Une ancienne URL non préfixée migre de façon déterministe vers `/fr` + pathname, pas selon le navigateur.
- Les robots et utilisateurs sans préférence arrivent donc sur `/fr`. Le cookie ne doit contenir qu'une locale autorisée et ne doit pas porter de donnée sensible.
- Une locale inconnue (`/de/...`) renvoie 404, sans repli silencieux.

## 5. Sélecteur de langue

Le sélecteur sera intégré au Header desktop et au menu mobile, avec le rendu compact `🇫🇷 FR ▾`, `🇺🇸 EN ▾` ou `🇪🇸 ES ▾`. Au clic, un menu accessible affiche :

```txt
🇫🇷 Français
🇺🇸 English
🇪🇸 Español
```

Exigences UX et accessibilité :

- bouton avec nom accessible traduit, `aria-expanded`, `aria-controls`, état actif et chevron décoratif ;
- menu pilotable au clavier (Entrée/Espace, flèches si pattern menu, Échap), focus visible, fermeture au clic extérieur et après navigation ;
- ne pas utiliser uniquement les drapeaux pour transmettre la langue ; le drapeau américain demandé est un repère visuel pour l'anglais, pas une déclaration de locale nationale ;
- conserver pathname, paramètres de recherche et ancre lorsque l'équivalent existe ; persister le choix ; éviter un rechargement complet ;
- table centrale de correspondance pour les chemins traduits et, plus tard, les slugs éditoriaux ; ne pas faire un simple remplacement aveugle du premier segment.

Exemples cibles (les segments métier restent identiques dans une première migration à faible risque) :

```txt
/fr/services                         -> /en/services
/fr/contact?service=aviculture       -> /es/contact?service=aviculture
/fr/consultation/reserver            -> /en/consultation/reserver
```

Si une route ou une traduction éditoriale n'est pas publiée dans la locale cible, le sélecteur doit mener vers `/{locale}` et non vers une page partiellement française. Un registre de disponibilité par route/contenu doit rendre ce comportement testable.

## 6. Priorités de traduction

> Cette priorisation décrit les prochaines PR. Elle n'autorise aucune modification de Contact, Consultation, Academy, CRM, emails ou Supabase dans la présente PR.

### Priorité 1 — parcours d'acquisition

1. Navbar, Footer et textes communs (CTA, états courts, accessibilité).
2. Accueil et metadata principales.
3. Index Services.
4. Vitrines publiques Contact et Consultation, sans toucher aux traitements, payloads, emails ou stockage.
5. Vitrine et catalogue public Academy, en distinguant strictement la fiche publique du lecteur/espace étudiant privé.

### Priorité 2 — profondeur éditoriale et SEO

- fiches Services et Formations publiques ;
- articles importants, puis catalogue éditorial (avec stratégie de traduction en base avant publication) ;
- FAQ si elle est ajoutée ;
- images/texte Open Graph, metadata dynamiques, `hreflang` et sitemap multilingue complet.

### Priorité 3 — différée

- administration, CRM et interfaces privées ;
- espace étudiant Academy, checkout/paiements et certificats ;
- emails internes et transactionnels.

L'administration et le CRM peuvent rester durablement en français pour l'équipe Agri-tech.

## 7. Impacts par domaine

### Services

Les slugs statiques de `src/data/services.ts` peuvent rester identiques dans les trois langues au début, ce qui réduit les risques sur les liens Contact. Les champs éditoriaux devront être séparés par locale. Des slugs réellement traduits ne doivent arriver qu'avec une table `locale + canonicalId + localizedSlug`, redirections et canonical cohérents.

### Articles

Un article Supabase est aujourd'hui identifié par un slug unique et porte titre, extrait et contenu dans une seule langue. Ne pas exposer une URL `/en/articles/x` contenant le texte français. Avant la traduction des articles, ajouter un modèle éditorial explicite (table de traductions liée à un article canonique, ou colonnes structurées) dans une PR Supabase dédiée. Chaque variante publiée doit avoir son canonical propre et ses alternates uniquement vers les traductions réellement publiées.

### Academy publique

La landing et les fiches de cours sont indexables et prioritaires, mais leurs titres/descriptions/programmes peuvent venir de Supabase. Traduire d'abord le chrome de la vitrine et les libellés, puis les cours ayant une traduction validée. Les routes authentifiées, paiements, progression, certificats et emails restent hors du premier lot. Les URLs de connexion/inscription peuvent rester non localisées tant que l'espace privé reste français, avec un retour explicite vers la locale d'origine.

### Contact et Consultation

Traduire ultérieurement uniquement la présentation et les messages utilisateur dans une PR dédiée. Les query params, valeurs techniques, schémas de validation, endpoints, création de demandes, paiement, emails et tables Supabase doivent rester identiques. Prévoir un champ de contexte `locale` uniquement après revue du contrat, et non comme effet indirect du routage.

## 8. SEO multilingue

Pour chaque page publiée dans une locale :

- canonical auto-référent (`https://agritech509ht.com/fr/services`) ;
- `alternates.languages` uniquement pour les équivalents existants : `fr`, `en`, `es` et éventuellement `x-default` vers `/fr` ou la racine de sélection ;
- `openGraph.locale` (`fr_HT`, `en_US` si le choix éditorial américain est confirmé, `es_ES` à confirmer) et `alternateLocale` ;
- `<html lang>` correspondant au contenu réellement rendu ;
- titres, descriptions, images sociales et données structurées localisés, jamais seulement le chrome ;
- dates et nombres formatés avec la locale, tout en conservant les valeurs machine (`dateTime`, montants) invariantes.

Créer `src/app/sitemap.ts` lors de la PR SEO. Il doit émettre chaque URL localisée publiée et ses alternates, y compris les slugs dynamiques réellement disponibles depuis Supabase. Créer `src/app/robots.ts`, autoriser les vitrines et exclure au minimum admin, API, checkout, paiement, dashboard, lecteur de cours et pages privées. La protection d'accès ne remplace pas `noindex`, et `robots.txt` ne remplace pas l'authentification.

La migration doit surveiller 404, chaînes de redirections, pages dupliquées, canonical divergentes et indexation de contenus incomplets dans Search Console. Les anciennes URLs ne doivent être retirées du sitemap qu'au moment où leur redirection permanente est active.

## 9. Risques techniques et garde-fous

| Risque | Garde-fou |
| --- | --- |
| Collision du futur middleware i18n avec la protection `/admin` | composer une seule fonction, matcher avec exclusions testées, tests `/admin`, `/api`, assets et locales |
| Rupture des URLs historiques et backlinks | migration par famille, redirections permanentes, conservation query string, journal des mappings |
| Canonical en double ou `hreflang` vers une 404 | générer depuis un registre de pages publiées, tests d'intégration et crawl avant déploiement |
| Mélange français/anglais/espagnol | ne publier une variante que lorsque son contenu principal et ses metadata sont prêts ; fallback vers l'accueil de locale dans le sélecteur |
| Slugs Supabase non localisés | conserver les slugs au départ ; concevoir un modèle de traduction séparé avant les articles/cours dynamiques |
| Tout le layout rendu client | dictionnaires côté serveur et provider limité ; conserver les Server Components |
| Bundle de dictionnaires trop lourd | chargement par locale/namespace, contrôle de taille au build |
| Régression des formulaires/paiements | traduire les labels sans modifier noms de champs, valeurs, endpoints ni logique ; tests E2E ciblés |
| Cache mélangeant des langues | locale dans le chemin et clés de cache ; aucune locale uniquement client |
| Routes privées indexées | metadata `noindex`, robots, auth inchangée et audit dédié |

## 10. Plan de PR progressif

1. **Socle i18n** : ajouter `next-intl`, locales typées, chargement des messages, helpers de liens, stratégie de matcher et tests ; aucun contenu métier dynamique.
2. **Chrome + accueil** : Header/Footer, sélecteur accessible, accueil, dictionnaires FR/EN/ES et metadata de ces pages ; captures desktop/mobile et tests de navigation.
3. **Services et formations publiques** : index puis détails, mapping des slugs et redirections historiques ; ne pas toucher aux formulaires Contact.
4. **Contact et Consultation (PR dédiée)** : texte de présentation et formulaire seulement, avec tests de soumission garantissant des payloads inchangés ; aucun changement email/Supabase/paiement.
5. **Academy publique (PR dédiée)** : landing et fiches publiées ; espace authentifié, checkout, cours et certificats exclus.
6. **Articles et contenus Supabase** : décision de modèle éditorial, migration de données séparée, workflow de publication par locale ; aucun fallback français indexable sous `/en` ou `/es`.
7. **SEO de généralisation** : sitemap et robots dynamiques, `hreflang`, Open Graph localisé, données structurées, redirects définitifs et crawl automatisé.
8. **Optionnel, plus tard** : espace étudiant privé. Admin, CRM et emails restent français sauf nouveau besoin métier explicite.

Chaque PR doit rester réversible, inclure lint/build et tester au minimum les URLs sources/cibles, la préservation des query params, les 404 de locale, les exclusions middleware et les canonical/alternates.

## 11. Critères de réussite de l'implémentation future

- les trois locales ont une URL stable et un rendu serveur cohérent ;
- `fr` est le fallback unique et explicite ;
- le sélecteur conserve la page équivalente ou revient proprement à l'accueil cible ;
- aucune route admin/API/privée n'est capturée par la locale ;
- canonical, `hreflang`, sitemap, Open Graph et `<html lang>` sont alignés ;
- aucune variante vide ou française par défaut n'est indexée sous `/en` ou `/es` ;
- les contrats Contact, Consultation, Academy, CRM, email et Supabase restent inchangés jusqu'à leurs PR dédiées.
