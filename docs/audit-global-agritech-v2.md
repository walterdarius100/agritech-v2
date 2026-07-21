# Audit global Agri-tech V2

Date d'audit : 2026-07-20. Portée : audit documentaire du dépôt `agritech-v2`, sans modification de logique métier, emails, paiements, certificats, routes publiques ni migrations Supabase.

## 1. Résumé exécutif

Agri-tech V2 est une plateforme Next.js App Router déjà structurée autour de modules métier cohérents : site public, services, actualités/articles, Contact, Consultation avec paiement mock, Agri-tech Academy, paiements Academy mock, progression, certificats, admin, historique `email_events`, Brevo et Supabase. Le socle est sain pour une V2 avancée : séparation claire entre `src/app`, `src/components`, `src/lib`, `src/data`, `src/types`, migrations Supabase et documentation existante.

Les principaux points forts sont :

- architecture App Router lisible et modulaire ;
- usage serveur des clés sensibles Supabase/Brevo ;
- RLS activée sur les tables critiques dans les migrations présentes ;
- admin séparé des routes publiques ;
- historique email centralisé avec statuts `sent`, `failed`, `skipped` ;
- documentation déjà abondante par module.

Les risques prioritaires identifiés sont :

- protection admin basée d'abord sur cookie en middleware puis validation dans les layouts/pages : il faut conserver une validation serveur systématique sur toutes les pages/actions admin ;
- usages fréquents du client Supabase service role dans le backend applicatif : acceptable côté serveur, mais nécessite une discipline stricte pour éviter toute fuite vers client components ;
- données personnelles dans `email_events`, Contact, Consultation et Academy : besoin d'une politique de rétention/export/suppression ;
- paiements mock encore présents : clair pour la V2, mais à isoler et documenter comme non production financière réelle ;
- SEO riche mais perfectible sur les silos agricoles locaux et le maillage interne ;
- performance à surveiller sur images publiques, dashboards admin et pages Academy riches.

Conclusion exécutive : aucune refonte urgente n'est recommandée dans ce PR. Les prochaines PR doivent surtout renforcer la sécurité admin/RLS, formaliser l'exploitation Vercel/Supabase/Brevo, améliorer l'observabilité CRM/email, puis travailler SEO/performance/UX.

## 2. État actuel du projet

### Stack et scripts

- Next.js 15, React 19, TypeScript, Tailwind CSS 4, Supabase JS, Brevo via service serveur.
- Scripts disponibles : `npm run dev`, `npm run build`, `npm run lint`, `npm run format`, `npm run format:check`.
- Variables principales documentées dans `.env.example` : Supabase public/admin, admin emails, analytics, paiements mock/MonCash/NatCash, Brevo, adresses Contact/Consultation/Academy.

### Arborescence fonctionnelle observée

- `src/app/` : routes publiques, Academy, Consultation, Contact, certificats, admin et API routes.
- `src/components/` : composants UI, layout, home, services, articles, Contact, Consultation, Academy, certificats et admin.
- `src/lib/` : services backend et utilitaires : Supabase, auth admin/student, email, paiements, consultation, contact, academy, SEO, analytics.
- `src/data/` : contenus statiques publics et catalogues initiaux.
- `supabase/migrations/` : articles, contact, academy, paiements academy, vidéo, certificats, consultation, marqueurs emails, `email_events`.
- `docs/` : documentation module par module, avec quelques documents plus anciens à harmoniser.
- `public/` : images brand, services, formations, paiements, certificats, articles.

## 3. Architecture globale

### Organisation des routes

Le routing App Router est cohérent :

- routes publiques : `/`, `/services`, `/services/[slug]`, `/actualites`, `/articles/[slug]`, `/formations`, `/contact`, `/mentions-legales`, `/politique-confidentialite` ;
- Consultation : `/consultation`, `/consultation/reserver`, `/consultation/checkout/[requestId]`, `/consultation/confirmation/[requestId]` ;
- Academy étudiant : `/academy`, `/academy/register`, `/academy/login`, `/academy/dashboard`, `/academy/mes-cours`, `/academy/cours/[slug]`, `/academy/cours/[slug]/apprendre`, `/academy/checkout/[courseSlug]`, `/academy/payment/*`, `/academy/certificats/*` ;
- certificats publics : `/certificats/verifier`, `/certificats/verifier/[certificateId]` ;
- admin : `/admin`, `/admin/articles`, `/admin/contact-requests`, `/admin/consultations`, `/admin/academy/*`, `/admin/email-events` ;
- API routes : Contact, paiements Academy, webhooks simulés/à venir, vidéo sécurisée, upload articles.

### Séparation client / serveur

La séparation est globalement bonne :

- formulaires interactifs et composants d'expérience utilisateur en client components ;
- mutations critiques en server actions ou API routes ;
- `server-only` présent sur les services email sensibles ;
- clients Supabase séparés entre public anon et admin service role.

Points d'attention :

- plusieurs fichiers `page.tsx` sont très compacts/minifiés, ce qui réduit la maintenabilité et rend l'audit/revue plus difficile ;
- le service role est utilisé pour contourner RLS côté serveur. C'est normal pour admin/webhooks/actions contrôlées, mais chaque appel doit rester derrière une autorisation serveur explicite ;
- les API publiques doivent valider entrées, identité et droits d'accès à chaque requête.

### Supabase

Les migrations montrent un modèle relationnel complet : articles, contact requests, academy courses/modules/lessons/resources/enrollments/progress/certificates/payments, consultation requests/payments, email_events. RLS est activée sur les tables Academy principales, Consultation et `email_events`. Le modèle comprend plusieurs contraintes de statut et index utiles.

Risque principal : plusieurs opérations applicatives passent par `SUPABASE_SERVICE_ROLE_KEY`. Il faut conserver ce secret uniquement serveur et ajouter une check-list de revue pour chaque nouvelle action/API.

### Brevo et emails

Le service email centralise :

- validation expéditeur/destinataire ;
- envoi Brevo ;
- fallback `skipped` si configuration absente ;
- journalisation `email_events` ;
- sanitation basique des métadonnées sensibles.

Bonne pratique observée : absence de clé Brevo publique et séparation des adresses Contact/Consultation/Academy dans `.env.example`.

### Cloudflare Stream / vidéo

Le projet contient une route `secure-video` et des champs vidéo Academy étendus. L'audit recommande de documenter précisément le contrat Cloudflare Stream : UID, URLs signées, durée de validité, accès par enrollment actif, logs d'erreur et stratégie fallback.

## 4. Modules existants

### Site public

Forces : structure claire, composants réutilisables, contenus agricoles en `src/data`, metadata globale, Open Graph/Twitter, sections crédibilité/domaines/formations/actualités/témoignages.

Risques/faiblesses :

- opportunités SEO locales encore sous-exploitées pour chaque filière agricole ;
- images JPEG/PNG dans `public/images` à auditer en poids, dimensions et formats modernes ;
- navigation riche qui peut nécessiter tests mobiles réguliers ;
- articles statiques/dynamiques à harmoniser selon source réelle Supabase.

### Contact

Forces : formulaire dédié, backend Contact, docs existantes, variables dédiées `CONTACT_NOTIFICATION_EMAIL` et `CONTACT_REPLY_TO_EMAIL`, intégration `email_events`.

Risques/faiblesses :

- besoin d'une stratégie anti-spam/rate limiting/honeypot si trafic public augmente ;
- clarification de la rétention des messages et données personnelles ;
- vérifier que les erreurs navigateur restent génériques et que les détails serveur restent dans les logs.

### Consultation

Forces : parcours complet demande → checkout mock → confirmation, statuts `payment_status`/`request_status`, tables séparées requests/payments, emails client/interne, marqueurs anti-doublon, admin Consultation, docs dédiées.

Risques/faiblesses :

- paiement mock ne doit jamais être présenté comme paiement réel ;
- avant MonCash/NatCash réel, prévoir idempotence webhook, signature, journalisation et gestion de remboursement ;
- vérifier que l'accès aux confirmations par ID ne divulgue pas trop d'informations ;
- besoin d'un CRM plus complet pour suivi projet, relances et notes structurées.

### Academy

Forces : auth étudiant, dashboard, cours, checkout, paiements mock, enrollments, progression, ressources, admin Academy, emails de bienvenue/achat/notification interne.

Risques/faiblesses :

- l'expérience étudiant peut devenir complexe sans tableau de progression global plus lisible ;
- accès cours/vidéo à vérifier systématiquement par enrollment actif ;
- besoin d'un reporting admin sur étudiants actifs, paiements, complétion, certificats ;
- UX mobile des lecteurs et ressources à tester.

### Certificats

Forces : génération automatique/manuelle, affichage étudiant/admin, page publique de vérification, template visuel, impression navigateur, email certificat disponible, anti-doublon via certificat unique.

Risques/faiblesses :

- la vérification publique doit exposer uniquement les champs nécessaires ;
- statut `revoked`/`expired` doit être clairement reflété côté public ;
- si PDF attaché à l'avenir, prévoir génération serveur fiable, stockage privé/signé, versioning du template et poids des pièces jointes.

### Emails / Communication

Forces : service unifié, templates, texte brut, statuts `sent/failed/skipped`, `email_events`, variables par module, Brevo serveur uniquement.

Risques/faiblesses :

- pas encore de relance automatisée des emails `failed` ;
- nécessité d'une page admin de détail et de filtres plus avancés ;
- besoin d'une politique de masquage/anonymisation email pour long terme ;
- adresses historiques invalides présentes dans une ancienne doc d'audit, non observées comme usage actif.

### Admin

Forces : espace séparé, navigation admin, articles, demandes contact, consultations, Academy, certificats et historique emails.

Risques/faiblesses :

- middleware vérifie uniquement la présence du cookie, pas sa validité ; la validation complète doit rester obligatoire dans chaque page/action admin ;
- absence possible d'un dashboard global synthétique KPI/alertes ;
- pages listant 100 événements ou entrées sans pagination avancée peuvent ralentir avec le volume ;
- audit trail admin plus fin à prévoir à moyen terme.

## 5. Forces du projet

1. Architecture modulaire avec boundaries métier lisibles.
2. Documentation déjà fournie par module.
3. Variables d'environnement explicites et majoritairement bien nommées.
4. RLS activée dans les migrations des tables sensibles.
5. Service email centralisé avec journalisation et statuts robustes.
6. Paiements mock isolés par providers, facilitant future intégration réelle.
7. Admin déjà opérationnel pour les principaux modules.
8. Modèle Academy riche : cours, modules, leçons, ressources, enrollment, progression, certificats.
9. SEO de base déjà présent via metadata globale et helper dédié.
10. Usage de TypeScript et conventions Next.js modernes.

## 6. Faiblesses du projet

1. Certaines pages/actions très compactes, difficiles à maintenir.
2. Pas de stratégie documentée de rétention RGPD-like pour données personnelles.
3. Protection admin à renforcer par tests et check-list systématique.
4. Pagination/filtrage admin à industrialiser.
5. SEO local par filière agricole incomplet.
6. Performance images à auditer avec métriques réelles.
7. Observabilité limitée hors `email_events`.
8. Pas encore de tests automatisés métier visibles dans les scripts.
9. Paiements réels documentés mais non implémentés, donc risque de confusion opérationnelle.
10. Documentation existante parfois historique, nécessitant un index/versioning.

## 7. Risques techniques

| Risque                                      | Priorité | Impact                                                | Recommandation                                               |
| ------------------------------------------- | -------: | ----------------------------------------------------- | ------------------------------------------------------------ |
| Service role utilisé largement côté serveur |   Élevée | Fuite ou accès excessif si importé au mauvais endroit | Maintenir `server-only`, revue import graph, tests admin/API |
| Pages admin à volumétrie croissante         |  Moyenne | Latence, timeouts, UX dégradée                        | Pagination, index complémentaires, filtres serveur           |
| Paiement réel futur                         |   Élevée | Double confirmation, fraude webhook                   | Idempotence, signatures, audit payments avant prod           |
| Docs dispersées                             |  Moyenne | Mauvaises variables ou décisions contradictoires      | Index docs + statut à jour/obsolète                          |
| Peu de tests métier                         |  Moyenne | Régressions silencieuses                              | Ajouter tests unitaires/intégration ciblés                   |

## 8. Risques sécurité

| Risque                                    | Priorité | Module                          | Analyse                                                                                                 |
| ----------------------------------------- | -------: | ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Middleware admin limité à présence cookie |   Élevée | Admin                           | La validation serveur complète doit rester dans layout/pages/actions ; ajouter tests de non-régression. |
| Données personnelles dans `email_events`  |  Moyenne | Emails/Admin                    | Emails, noms, sujets et metadata peuvent contenir PII ; prévoir rétention et accès restreint.           |
| Vérification publique certificat          |  Moyenne | Certificats                     | Limiter les champs publics et gérer clairement les certificats révoqués/expirés.                        |
| API publiques                             |  Moyenne | Contact/Academy vidéo/paiements | Valider entrées, rate limit, vérifier identité/enrollment, ne pas exposer erreurs internes.             |
| Variables `.env.local` présentes en local |  Moyenne | Ops                             | Ne jamais commiter ; vérifier secrets avant chaque PR.                                                  |
| Upload admin articles                     |  Moyenne | Admin articles                  | Vérifier type MIME, taille, droits admin et bucket policies.                                            |

## 9. Risques UX/UI

- Parcours Consultation : préciser visuellement que le paiement est mock/test tant que réel non activé.
- Parcours Academy : améliorer la lisibilité progression, prochain cours, certificats disponibles.
- Admin : ajouter un dashboard global avec alertes emails failed, consultations payées à planifier, paiements Academy récents, certificats générés.
- Contact : renforcer feedback succès/erreur, anti-spam invisible et mention délai de réponse.
- Certificats : rendre la page de vérification très claire pour un tiers externe.
- Mobile : tester header/navigation, tableaux admin, lecteur cours et template certificat.

## 10. Risques SEO/performance

### SEO

- Bon socle metadata, mais besoin de metadata spécifiques systématiques sur services, formations, articles et certificats publics.
- Opportunités fortes : aviculture, apiculture, pisciculture, cuniculture, maraîchage, irrigation, formation agricole, consultation agricole en Haïti, étude technico-économique agricole.
- Recommandation : créer un plan éditorial en clusters par filière + pages services optimisées + articles guides + CTA Consultation/Academy.

### Performance

- Optimiser formats et dimensions des images `public/images`.
- Garder les composants client strictement nécessaires.
- Ajouter pagination aux dashboards admin.
- Mesurer build/routes avec Lighthouse/Web Vitals avant optimisations lourdes.
- Pour Cloudflare Stream, privilégier URLs signées et player léger, lazy-load hors viewport.

## 11. Vérification des adresses officielles

Adresses officielles validées pour la cible :

- `admin@agritech509ht.com` : administration interne ;
- `contact@agritech509ht.com` : Contact ;
- `projets@agritech509ht.com` : Consultation/projets ;
- `noreply@agritech509ht.com` : expéditeur automatique ;
- `support@agritech509ht.com` : support/réponses générales ;
- `formation@agritech509ht.com` : Academy.

Recherche effectuée dans le dépôt hors `node_modules` sur : `projet@agritech509ht.com`, `projet@`, `projets@`, `CONTACT_NOTIFICATION_EMAIL`, `CONSULTATION_NOTIFICATION_EMAIL`, `ACADEMY_NOTIFICATION_EMAIL`, `EMAIL_REPLY_TO`, `EMAIL_FROM_ADDRESS`.

Résultat :

- `.env.example` utilise les adresses officielles correctes, notamment `CONSULTATION_NOTIFICATION_EMAIL=projets@agritech509ht.com` et `CONSULTATION_REPLY_TO_EMAIL=projets@agritech509ht.com`.
- Le code actif observé lit des variables d'environnement, sans occurrence active de `projet@agritech509ht.com`.
- `README.md` et `docs/email-communication.md` indiquent explicitement que `projet@agritech509ht.com` est invalide.
- Une ancienne documentation `docs/email-communication-audit.md` contient encore un exemple historique avec `AGRI_TECH_NOTIFICATION_EMAIL=projet@agritech509ht.com` et `EMAIL_REPLY_TO=projet@agritech509ht.com`. Ce n'est pas un usage actif, mais le document doit être marqué obsolète ou corrigé dans une PR documentaire dédiée pour éviter confusion.

## 12. Audit base de données Supabase

Tables/migrations observées :

- `profiles` : profil étudiant/admin, rôle contrôlé.
- `academy_courses`, `academy_modules`, `academy_lessons`, `academy_resources` : catalogue Academy.
- `academy_enrollments` : inscription formation, statut, source, paiement.
- `academy_lesson_progress` : progression par leçon.
- `academy_payments` : paiements Academy mock/providers.
- `academy_certificates` : certificats avec statut, URL vérification/PDF/QR.
- `consultation_requests`, `consultation_payments` : demande et paiement Consultation.
- `email_events` : historique transactionnel global.
- `contact_requests` ou équivalent selon migration Contact réelle.
- `articles` et bucket images articles.

Points positifs : contraintes de statut, timestamps, index sur statuts/dates, RLS activée, relations cascade cohérentes.

Points à surveiller :

- risques de données orphelines sur ressources/leçons si module supprimé avec `set null` ;
- cohérence entre statuts paiement et statuts demande/enrollment ;
- absence de politique de purge PII ;
- nécessité de scripts de seed/versioning clairement documentés ;
- vérifier que chaque table ajoutée ultérieurement reçoit RLS + policies + index.

## 13. Audit documentation existante

La documentation est riche : Academy, Contact, Consultation, certificats, emails, navigation, Supabase, V2 roadmap, assets. Elle constitue une force importante.

Risques documentaires :

- documents d'audit anciens pouvant contenir des exemples invalides ;
- absence d'un index indiquant le statut `à jour`, `historique`, `obsolète` ;
- variables historiques à harmoniser ;
- décisions futures MonCash/NatCash dispersées.

Recommandation : ajouter un `docs/README.md` ou une section dans README listant les documents officiels à suivre et les documents historiques à ne pas utiliser comme source opérationnelle.

## 14. Recommandations immédiates

Voir le fichier complémentaire `docs/audit-global-actions-prioritaires.md` pour la matrice complète. Synthèse immédiate :

1. Marquer/corriger l'exemple historique `projet@agritech509ht.com` dans l'ancienne doc email.
2. Ajouter une check-list sécurité admin : toute page/action admin doit appeler une validation serveur réelle.
3. Documenter explicitement le mode mock paiement dans l'exploitation Vercel.
4. Ajouter une check-list secrets avant PR/déploiement.
5. Formaliser la rétention PII pour Contact, Consultation, Academy et `email_events`.

## 15. Recommandations court terme

1. Dashboard admin global KPI/alertes.
2. Admin `email_events` enrichi : détail, recherche, retry manuel contrôlé.
3. Pagination/filtres robustes pour admin Consultation/Contact/Academy.
4. Tests unitaires/intégration sur actions critiques.
5. Optimisation SEO pages services/formations/articles.
6. Audit poids images et conversion WebP/AVIF si pertinent.
7. Documentation Cloudflare Stream complète.

## 16. Recommandations moyen terme

1. Paiements réels MonCash/NatCash avec webhooks signés et idempotents.
2. Reçus/factures et exports comptables.
3. Certificats PDF serveur fidèles, versionnés, avec stockage privé/signé.
4. CRM projets agricoles complet.
5. Espace client hors Academy pour consultations/projets.
6. Analytics avancés et funnel Consultation/Academy.
7. Automatisation des relances email/SMS/WhatsApp selon conformité.

## 17. Roadmap proposée

### Phase 1 — Stabilisation documentaire et sécurité

- Nettoyer docs historiques ambiguës.
- Check-list admin/API/service role.
- Politique de secrets et variables Vercel.
- Politique de rétention PII.

### Phase 2 — Exploitation admin/CRM

- Dashboard global.
- Filtres/pagination/export.
- Suivi emails failed et relance contrôlée.
- Vue pipeline Consultation.

### Phase 3 — Croissance SEO/Academy

- Clusters SEO agricoles.
- Amélioration dashboard étudiant.
- Optimisation images/pages.
- Reporting complétion/certificats.

### Phase 4 — Production paiement et documents

- MonCash/NatCash réels.
- Factures/reçus.
- PDFs certificats robustes.
- CRM projet et espace client.

## 18. Points à ne pas toucher pour l'instant

Conformément au périmètre de ce PR, ne pas modifier maintenant : logique Consultation, workflows Contact, paiements mock, Academy, progression, certificats, templates email, design global, variables d'environnement effectives, migrations Supabase, routes publiques stables.

## 19. Conclusion

Agri-tech V2 est dans un état avancé et cohérent. Le projet dispose déjà des briques essentielles pour une plateforme agricole professionnelle : contenu public, acquisition Contact/Consultation, Academy, certificats, admin et emails transactionnels. Les prochaines améliorations doivent privilégier la sécurisation opérationnelle, la gouvernance des données, l'observabilité admin/CRM, puis la croissance SEO et la préparation aux paiements réels. Ce PR doit rester documentaire pour préserver les workflows existants.
