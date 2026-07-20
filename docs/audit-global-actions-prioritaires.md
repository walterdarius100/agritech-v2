# Actions prioritaires issues de l'audit global Agri-tech V2

Date : 2026-07-20. Cette matrice classe les recommandations sans modifier la logique métier existante.

## A. À faire immédiatement

| Priorité | Module               | Action                                                                                                                                             | Complexité | Risque | Impact attendu                                        | Dépendances                                 |
| -------: | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | ----------------------------------------------------- | ------------------------------------------- |
|       P0 | Documentation emails | Corriger ou marquer comme historique l'exemple `projet@agritech509ht.com` restant dans `docs/email-communication-audit.md`.                        | Faible     | Faible | Évite une mauvaise configuration email en production. | Validation métier des adresses officielles. |
|       P0 | Sécurité admin       | Créer une check-list imposant `requireAuthorizedAdmin` ou équivalent sur chaque page/action/API admin.                                             | Faible     | Moyen  | Réduit le risque d'accès admin non autorisé.          | Revue des routes admin actuelles.           |
|       P0 | Secrets/Ops          | Ajouter une étape de contrôle avant déploiement : aucune clé réelle dans Git, pas de `NEXT_PUBLIC_BREVO_API_KEY`, service role serveur uniquement. | Faible     | Faible | Diminue le risque de fuite de secrets.                | Process de revue PR/déploiement.            |
|       P1 | Paiements            | Documenter clairement `ACADEMY_PAYMENTS_MODE=mock` et les limites du paiement mock Consultation/Academy.                                           | Faible     | Faible | Évite confusion entre simulation et paiement réel.    | README/docs env.                            |
|       P1 | Données personnelles | Définir une politique de rétention pour Contact, Consultation, Academy, certificats et `email_events`.                                             | Moyenne    | Moyen  | Réduit l'exposition PII et prépare la conformité.     | Décision business/légale.                   |
|       P1 | API publiques        | Vérifier que chaque route publique valide entrées, erreurs et autorisations sans exposer détails internes.                                         | Moyenne    | Moyen  | Améliore robustesse et sécurité.                      | Tests ciblés.                               |

## B. À court terme

| Priorité | Module        | Action                                                                                                                                       | Complexité | Risque | Impact attendu                                    | Dépendances                     |
| -------: | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | ------------------------------------------------- | ------------------------------- |
|       P1 | Admin         | Construire un dashboard global : consultations payées à planifier, emails failed, paiements Academy, nouveaux contacts, certificats récents. | Moyenne    | Moyen  | Meilleure exploitation quotidienne.               | Requêtes agrégées Supabase.     |
|       P1 | Emails/CRM    | Ajouter page détail `email_events`, recherche, filtres par destinataire/entity et retry manuel sécurisé.                                     | Moyenne    | Moyen  | Support plus efficace et meilleure délivrabilité. | Politique de retry/idempotence. |
|       P1 | Consultation  | Améliorer CRM Consultation : pipeline, notes structurées, prochaines actions, filtres statut/date/type.                                      | Moyenne    | Moyen  | Suivi commercial/projet plus fiable.              | Dashboard admin.                |
|       P2 | Academy       | Améliorer UX dashboard étudiant : prochain cours, progression globale, certificats, état paiement/enrollment.                                | Moyenne    | Faible | Meilleure rétention étudiants.                    | Données progression fiables.    |
|       P2 | SEO           | Optimiser pages services/formations par mots-clés agricoles locaux et meta spécifiques.                                                      | Moyenne    | Faible | Plus de trafic organique qualifié.                | Plan éditorial.                 |
|       P2 | Performance   | Auditer dimensions/poids images et convertir les plus lourdes en formats modernes.                                                           | Moyenne    | Faible | Pages publiques plus rapides.                     | Mesures Lighthouse/Web Vitals.  |
|       P2 | Documentation | Créer un index des docs avec statut `officiel`, `historique`, `à revoir`.                                                                    | Faible     | Faible | Réduit contradictions et erreurs opérationnelles. | Revue docs existantes.          |
|       P2 | Tests         | Ajouter tests unitaires/intégration sur auth admin, Contact, Consultation checkout, Academy access, certificats.                             | Moyenne    | Moyen  | Réduit régressions.                               | Choix framework test.           |

## C. À moyen terme

| Priorité | Module         | Action                                                                                           | Complexité | Risque | Impact attendu                                     | Dépendances                                           |
| -------: | -------------- | ------------------------------------------------------------------------------------------------ | ---------- | ------ | -------------------------------------------------- | ----------------------------------------------------- |
|       P2 | Paiements      | Intégrer MonCash/NatCash réels avec webhooks signés, idempotence, logs et reconciliation.        | Élevée     | Élevé  | Monétisation production fiable.                    | Comptes marchands, specs providers, sécurité webhook. |
|       P2 | Finance        | Générer reçus/factures et exports comptables.                                                    | Élevée     | Moyen  | Meilleur support client et gestion administrative. | Paiements réels stabilisés.                           |
|       P2 | Certificats    | Générer PDF serveur fidèle en pièce jointe avec stockage privé/signé et versioning template.     | Élevée     | Moyen  | Certificats plus professionnels et archivables.    | Choix librairie PDF + stockage.                       |
|       P3 | CRM            | Créer un module CRM projets agricoles complet : pipeline, documents, devis, livrables, relances. | Élevée     | Moyen  | Industrialise les consultations/projets clients.   | Modèle données CRM.                                   |
|       P3 | Client         | Créer un espace client projets hors Academy.                                                     | Élevée     | Moyen  | Meilleure transparence client.                     | CRM et auth client.                                   |
|       P3 | Analytics      | Mettre en place analytics avancés funnel Contact/Consultation/Academy/certificats.               | Moyenne    | Moyen  | Pilotage croissance et conversion.                 | Consentement, GA/Clarity, événements.                 |
|       P3 | Automatisation | Automatiser relances email/SMS/WhatsApp pour paniers/paiements/cours incomplets.                 | Élevée     | Moyen  | Augmente conversion et complétion.                 | CRM, conformité, provider messaging.                  |

## Contrôles de non-régression recommandés à chaque PR

- `npm run lint`
- `npm run build`
- `rg -n "projet@agritech509ht\.com|NEXT_PUBLIC_BREVO_API_KEY|SUPABASE_SERVICE_ROLE_KEY=" -g '!node_modules' .`
- revue `git diff --stat` pour confirmer absence de changement métier involontaire sur Consultation, Contact, Academy, certificats, paiements et migrations.
