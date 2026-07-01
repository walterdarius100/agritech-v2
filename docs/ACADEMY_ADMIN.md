# Administration Academy

Routes : `/admin/academy`, `/admin/academy/courses`, `/admin/academy/enrollments`, `/admin/academy/students`, `/admin/academy/certificates`.

Le workflow initial est manuel : créer ou publier un cours, valider une inscription après paiement MonCash/NatCash/virement reçu hors plateforme, puis émettre un certificat si nécessaire. L’accès admin reste basé sur `ADMIN_EMAILS` et la route `/admin/login` existante.
