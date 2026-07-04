# Tests Academy

## Parcours demande d’accès

1. Ouvrir `/academy/cours/cuniculture-pratique`.
2. Cliquer `Demander l’accès` en visiteur non connecté.
3. Vérifier la redirection vers `/academy/register` avec un paramètre `next` encodé contenant `/contact?type=academy-access&course=cuniculture-pratique`.
4. Créer un compte ou se connecter via `/academy/login?next=...` et vérifier la redirection vers Contact.
5. Ouvrir directement `/contact?type=academy-access&course=cuniculture-pratique` en étudiant connecté.
6. Vérifier qu’aucune box contextuelle publique n’est affichée.
7. Vérifier que le type, la formation, le nom, l’email et le téléphone sont préremplis quand disponibles.
8. Vérifier que la textarea message est masquée pour Academy.
9. Envoyer la demande et vérifier l’enregistrement `contact_requests.request_type = academy_access` avec un message généré automatiquement.
10. Vérifier `/admin/contact-requests` et le détail de la demande.
11. Confirmer qu’aucun enrollment n’est créé automatiquement.

## Régressions à vérifier

- `/contact` sans paramètre reste une demande générale avec message visible et sans box contextuelle.
- `/contact?service=poule-pondeuse` reste une demande service avec domaine prérempli, message visible et textarea vide.
- `/contact?type=partnership` reste une demande partenariat avec message visible.
- `/admin/academy/enrollments` reste le point de validation manuelle.

## Navigation publique

- La page d’accueil présente `Agri-tech Academy` au lieu de `Formations Agri-tech`.
- Le CTA `Découvrir notre Academy` pointe vers `/academy`.
- La navbar desktop et le menu mobile affichent `Academy` et non `Formations`.

## Sécurité vidéo

- Vérifier qu’un étudiant autorisé charge le lecteur Cloudflare avec watermark.
- Vérifier qu’un utilisateur non autorisé ne reçoit pas d’URL depuis `/api/academy/secure-video`.
- Vérifier qu’aucun lien de téléchargement ou URL vidéo brute n’est affiché dans l’interface étudiant.
- Vérifier que l’application ne plante pas si les variables Cloudflare Stream signées ne sont pas configurées.

## Tests paiements mock

Configurer `ACADEMY_PAYMENTS_MODE=mock` et `NEXT_PUBLIC_ACADEMY_CHECKOUT_ENABLED=true`. Tester `/academy/checkout/cuniculture-pratique`, créer un paiement MonCash puis NatCash, simuler success/failed/cancelled sur `/academy/payment/mock/[paymentId]`, vérifier `/academy/mes-cours`, `/academy/cours/[slug]/apprendre` et `/admin/academy/payments`.
