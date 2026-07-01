# Administration Academy

Routes : `/admin/academy`, `/admin/academy/courses`, `/admin/academy/courses/[id]/edit`, `/admin/academy/enrollments`, `/admin/academy/students`, `/admin/academy/certificates`.

## Navigation

La navigation admin principale contient un lien `Academy`. Toutes les pages `/admin/academy/*` affichent une sous-navigation : vue d’ensemble, cours, étudiants, inscriptions et certificats.

## Workflow d’accès manuel

1. Vérifier que le cours existe dans `/admin/academy/courses`.
2. Modifier le cours si nécessaire via `/admin/academy/courses/[id]/edit`.
3. Vérifier que l’étudiant possède une ligne `profiles`.
4. Aller dans `/admin/academy/enrollments`.
5. Choisir l’étudiant, le cours, `status = active` et une source (`manual`, `admin_grant`, `free` ou `payment`).
6. Ajouter une référence de paiement si un paiement externe a été reçu.

Cette V1 ne fait pas de paiement automatique. MonCash, NatCash ou virement restent gérés hors plateforme puis validés manuellement.
