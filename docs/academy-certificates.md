# Certificats Academy Agri-tech

## 1. Objectif

Le système de certificats Academy permet d'émettre un certificat vérifiable lorsqu'un étudiant a accès à une formation et l'a terminée. Chaque certificat possède un identifiant public lisible, par exemple `AGRITECH-CERT-2026-000001`, utilisé sur la page publique `/certificats/verifier/[certificateId]`.

Le PDF automatique final n'est pas encore forcé : une base HTML/CSS imprimable est fournie pour reproduire le modèle Word Agri-tech lors d'une prochaine étape.

## 2. Audit de l'existant

La table existante détectée est `public.academy_certificates`, créée initialement dans `supabase/migrations/20260701_create_academy_tables.sql`. Elle contenait déjà les certificats, mais il manquait `enrollment_id`, `metadata`, une unicité par inscription, et les statuts attendus étaient `issued`, `revoked`, `expired` au lieu de `valid`, `revoked`, `draft`.

Tables Academy utilisées :

- `academy_courses` : formations.
- `academy_modules` : modules.
- `academy_lessons` : leçons publiées utilisées pour calculer la complétion.
- `academy_enrollments` : accès étudiant, avec les statuts `active` et `completed` qui donnent accès.
- `academy_lesson_progress` : progression par leçon.
- `profiles` : nom public de l'étudiant.
- `academy_certificates` : certificats émis.

## 3. Migration à exécuter

Migration : `supabase/migrations/20260705_harden_academy_certificates.sql`.

Elle est non destructive et idempotente autant que possible :

- crée `academy_certificates` seulement si la table n'existe pas ;
- ajoute uniquement les colonnes manquantes ;
- convertit `issued` en `valid` et `expired` en `draft` ;
- remplace la contrainte de statut par `valid`, `revoked`, `draft` ;
- ajoute un index unique partiel sur `enrollment_id` pour éviter les doublons ;
- ajuste les policies RLS pour que l'étudiant voie ses certificats et que la page publique puisse vérifier un certificat sans connexion.

## 4. Exécution avec Supabase CLI

Depuis la racine du projet :

```bash
supabase login
supabase projects list
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Remplacez `YOUR_PROJECT_REF` par la référence du projet Supabase.

## 5. Alternative manuelle via Supabase SQL Editor

Si la CLI échoue, ouvrez :

`Supabase Dashboard → SQL Editor → New query`

Puis copiez-collez tout le contenu de :

`supabase/migrations/20260705_harden_academy_certificates.sql`

Cliquez ensuite sur `Run`.

## 6. Vérifier que la migration a fonctionné

Dans Supabase SQL Editor :

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'academy_certificates'
order by ordinal_position;

select conname
from pg_constraint
where conrelid = 'public.academy_certificates'::regclass;
```

Vérifiez notamment la présence de `enrollment_id`, `certificate_id`, `status`, `verification_url`, `qr_code_url`, `pdf_url` et `metadata`.

## 7. Génération d'un certificat

La fonction serveur idempotente est `generateCertificateAfterCourseCompletion(enrollmentId)`. Elle :

1. vérifie que l'inscription existe ;
2. vérifie que l'inscription donne accès à la formation ;
3. vérifie que la formation est terminée (`status = completed` ou toutes les leçons publiées complétées) ;
4. retourne le certificat existant si l'inscription en possède déjà un ;
5. crée un certificat `valid` sinon ;
6. génère l'URL publique et le QR code vers `/certificats/verifier/[certificateId]`.

## 8. Pages à tester

- Étudiant : `/academy/certificats`.
- Admin : `/admin/academy/certificates`.
- Vérification publique : `/certificats/verifier/AGRITECH-CERT-2026-000001`.

Scénarios :

1. terminer une formation ;
2. générer manuellement un certificat depuis l'admin ;
3. relancer la génération sur le même enrollment et vérifier qu'aucun doublon n'est créé ;
4. vérifier qu'un certificat `valid` est annoncé comme valide ;
5. révoquer le certificat et vérifier que la page publique annonce `Certificat révoqué` ;
6. tester un identifiant inexistant et vérifier `Certificat introuvable` ;
7. vérifier que l'espace étudiant n'affiche que ses propres certificats.

## 9. Dépannage : `Error: Failed to fetch (api.supabase.com)`

Cette erreur n'indique pas automatiquement que la migration SQL est incorrecte. Elle peut venir de :

- une connexion internet instable ;
- Supabase CLI non connecté ;
- un token expiré ;
- un projet Supabase non lié ;
- une mauvaise configuration locale ;
- une indisponibilité temporaire de l'API Supabase.

Commandes utiles :

```bash
supabase login
supabase projects list
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Si `supabase db push` échoue encore, utilisez l'alternative SQL Editor décrite plus haut.

## 10. Sécurité et données exposées

La page publique affiche uniquement : statut, nom de l'étudiant, formation, date de délivrance, ID public et structure émettrice. Elle n'affiche pas l'email, le téléphone, les informations de paiement, les notes privées ou les UUID internes.

L'espace étudiant filtre par `student_id` côté serveur. Les routes admin restent protégées par l'autorisation admin existante.

## 11. Limites actuelles

- Le QR code est stocké comme URL d'image vers le service léger `api.qrserver.com`.
- Le composant imprimable prépare le futur PDF, mais la génération PDF automatisée depuis le modèle Word n'est pas finalisée.
- Pour le PDF final, il faudra reproduire le modèle Word en HTML/CSS ou brancher un moteur de rendu PDF côté serveur.
