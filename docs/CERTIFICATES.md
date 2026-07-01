# Certificats Academy

Les certificats sont stockés dans `academy_certificates` avec un identifiant public du type `AGRITECH-CERT-YYYY-XXXXXX`.

La vérification publique se fait via `/certificats/verifier` ou `/certificats/verifier/[certificateId]`. Elle affiche seulement le nom du bénéficiaire, la formation, la date d’émission, l’identifiant et le statut. Les emails, téléphones et notes internes ne sont pas exposés.

La première version stocke `verification_url`, `pdf_url` et `qr_code_url`, mais ne génère pas encore de PDF ni d’image QR automatiquement.
