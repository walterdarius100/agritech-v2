# Demandes d’accès Academy

## Workflow manuel

L’accès aux formations Academy reste manuel : aucune demande Contact ne crée d’enrollment automatiquement.

1. Depuis `/academy/cours/[slug]`, le CTA `Demander l’accès` conserve le slug de la formation.
2. Si l’étudiant est connecté, il est envoyé vers `/contact?type=academy-access&course=[slug]`.
3. Si le visiteur n’est pas connecté, il est envoyé vers `/academy/register?next=...` avec une URL `next` interne encodée vers le formulaire Contact.
4. Après création de compte ou connexion, `next` est validée côté serveur puis utilisée ; sinon le fallback reste `/academy/dashboard`.
5. Le formulaire Contact est prérempli en mode `Accès formation Academy`, sans box contextuelle publique et sans textarea visible.

## Données enregistrées

Les demandes Academy utilisent `contact_requests` avec :

- `request_type = academy_access` ;
- `course_slug` ;
- `course_title` si trouvé ;
- `subject` renseigné avec la formation demandée ;
- `metadata` contenant le contexte Academy ;
- `message` généré automatiquement.

## Limites actuelles

- Pas de paiement automatique.
- Pas de panier.
- Pas de validation automatique de l’accès.
- L’équipe Agri-tech doit traiter la demande puis gérer l’enrollment dans l’admin Academy.
