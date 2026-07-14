# Affichage dynamique des certificats Academy

Ce document décrit le branchement d’affichage des certificats Academy sur les données réelles Supabase, sans modifier la génération automatique, la génération manuelle, les paiements, la progression, les migrations ni le schéma Supabase.

## Routes utilisées

- `/academy/certificats` : liste protégée des certificats du seul étudiant connecté.
- `/academy/certificats/[certificateId]` : rendu protégé du certificat visuel. L’étudiant doit être propriétaire du certificat ; un admin autorisé peut ouvrir tous les certificats depuis l’admin.
- `/admin/academy/certificates` : liste protégée admin avec accès au rendu visuel et à la vérification publique.
- `/certificats/verifier/[certificateId]` : page publique de vérification, limitée aux informations publiques du certificat.

## Données dynamiques du template

Le rendu visuel est alimenté par `academy_certificates` et, quand elles existent, les relations suivantes :

- `academy_certificates.student_id → profiles.full_name` pour un fallback du nom étudiant.
- `academy_certificates.course_id → academy_courses.title` et `academy_courses.duration` pour le titre et la durée.
- `academy_certificates.enrollment_id → academy_enrollments.created_at` / `validated_at` pour une date de début approximative si aucune date de début n’est stockée dans les métadonnées.

Les champs utilisés par le template sont :

- `studentName`
- `courseTitle`
- `certificateId`
- `issuedAt`
- `status`
- `verificationUrl`
- `qrCodeUrl`
- `duration`
- `startDate`
- `endDate`
- `issuedCity`
- `organizationName`
- `academyName`
- `signatoryName`
- `signatoryTitle`

## Fallbacks

Les fallbacks sobres utilisés évitent d’afficher `null`, `undefined`, `NaN` ou `Invalid Date` :

- `organizationName = "WAL AGRITECH"`
- `academyName = "Agri-tech Academy"`
- `issuedCity = "Jacmel"`
- `duration = "durée définie par le programme"`
- `startDate = "date de début non précisée"`
- `endDate = "date de fin non précisée"`
- `signatoryName = "Walter Darius"`
- `signatoryTitle = "Directeur Général"`

## Formatage des dates

Toutes les dates affichées passent par un formatage français long, par exemple `12 juillet 2026`. Une date absente ou invalide utilise un libellé de fallback explicite.

## Différences d’exposition

### Espace étudiant

L’espace étudiant utilise l’utilisateur connecté et filtre `academy_certificates.student_id` avec l’identifiant de cet utilisateur. La page détail revérifie la propriété avant d’afficher le template.

### Espace admin

L’admin autorisé peut voir tous les certificats, ouvrir le rendu visuel protégé et accéder à la vérification publique. Les actions de génération/révocation existantes restent inchangées.

### Page publique

La page publique affiche uniquement :

- statut public du certificat ;
- nom de l’étudiant ;
- nom de la formation ;
- date de délivrance ;
- identifiant public du certificat ;
- structure émettrice `Agri-tech / WAL AGRITECH`.

Elle n’affiche pas les emails, téléphones, UUID Supabase, paiements, notes privées ou données admin.

## Règles de sécurité

1. Un étudiant connecté ne voit que ses propres certificats.
2. Un admin autorisé peut voir tous les certificats depuis l’admin.
3. La vérification publique expose seulement les champs publics.
4. Les routes étudiant et admin restent protégées.
5. Les paiements et informations privées ne sont pas affichés dans les certificats.
6. Le QR code pointe vers `/certificats/verifier/[certificateId]` via l’URL publique du certificat.

## Limites restantes avant impression/PDF

L’impression repose encore sur le navigateur via le bouton existant `Imprimer / Enregistrer en PDF`. Ce PR ne crée pas de génération PDF serveur et ne modifie pas le design principal du certificat.
