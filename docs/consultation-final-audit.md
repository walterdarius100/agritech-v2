# Audit final avant merge — Module Consultation

## Résumé d'audit

Le module Consultation est prêt pour revue finale avec les éléments suivants en place :

- page publique `/consultation` ;
- entrée `Consultation` dans la navigation principale ;
- formulaire avancé `/consultation/reserver` ;
- prix fixe `2 500 HTG` sans sélection de package par le visiteur ;
- création serveur des demandes dans `consultation_requests` ;
- checkout mock `/consultation/checkout/[requestId]` ;
- confirmation `/consultation/confirmation/[requestId]` ;
- administration `/admin/consultations` et `/admin/consultations/[requestId]` ;
- architecture préparatoire pour paiements réels dans `src/lib/consultation-payments/` ;
- documentation du module, du schéma Supabase et de l'intégration paiement future.

## Routes Consultation vérifiées par structure et build

Routes publiques vérifiées :

```txt
/consultation -> redirection vers /consultation/reserver
/consultation/reserver
/consultation/checkout/[requestId]
/consultation/confirmation/[requestId]
```

Routes admin ajoutées :

```txt
/admin/consultations
/admin/consultations/[requestId]
```

Le build Next.js liste ces routes, ce qui confirme qu'elles sont reconnues par l'App Router et ne sont pas absentes du graphe applicatif.

## Navigation

La navigation publique contient l'entrée :

```txt
Consultation -> /consultation/reserver
```

Le composant Header réutilise la même source `mainNavigation` pour le menu desktop et le menu mobile. L'ajout est donc visible dans les deux variantes sans logique séparée.

La page d’accueil intègre maintenant le hero Consultation juste après la section Partenariat. La route `/consultation` est conservée comme redirection propre vers `/consultation/reserver`.

La navigation admin contient également :

```txt
Consultations -> /admin/consultations
```

## Formulaire de réservation

Champs présents dans le formulaire `/consultation/reserver` :

- Nom complet ;
- Téléphone WhatsApp ;
- Email ;
- Département ;
- Commune ;
- Domaine concerné ;
- Niveau d'avancement du projet ;
- Mode de consultation souhaité ;
- Budget approximatif ;
- Description du projet ou du besoin.

Champs obligatoires validés côté serveur :

- Nom complet ;
- Téléphone WhatsApp ;
- Domaine concerné ;
- Description du projet ou du besoin.

La section de sélection de package a été retirée. Le visiteur ne choisit plus de package.

## Prix fixe et payload Supabase

Le prix fixe reste :

```txt
2 500 HTG
```

Lors de la création d'une demande, la Server Action prépare :

```txt
amount = 2500
currency = HTG
payment_status = pending
request_status = pending_payment
consultation_package = Consultation agricole en ligne — 30 à 45 minutes
```

Le `request_code` est généré côté PostgreSQL par la migration Consultation.

## Checkout mock

Le checkout mock affiche le résumé de la demande et les moyens de paiement de test :

- MonCash ;
- NatCash ;
- Paiement manuel / confirmation interne.

La confirmation mock :

- crée une ligne dans `consultation_payments` ;
- utilise `provider = mock` ;
- utilise `status = paid` ;
- met à jour `consultation_requests.payment_status = paid` ;
- met à jour `consultation_requests.request_status = paid` ;
- renseigne `paid_at` ;
- redirige vers `/consultation/confirmation/[requestId]`.

Une vérification anti-doublon empêche de recréer un paiement `paid` si la demande est déjà payée ou si un paiement `paid` existe déjà pour cette demande.

## Confirmation

La page confirmation gère :

- demande introuvable ;
- demande enregistrée mais non payée ;
- demande payée.

Elle affiche uniquement les informations utiles au client :

- code de demande ;
- nom ;
- type de consultation ;
- montant ;
- statut de demande ;
- statut de paiement ;
- prochaine étape.

Elle n'affiche pas :

- notes admin ;
- UUID en clair si un `request_code` est disponible ;
- métadonnées techniques ;
- secrets ou informations internes.

## Admin Consultation

La page `/admin/consultations` est protégée via la protection admin existante (`requireAuthorizedAdmin`) et affiche :

- code demande ;
- nom ;
- téléphone ;
- email ;
- domaine ;
- commune ;
- package ;
- montant ;
- paiement ;
- statut demande ;
- date ;
- action de détail.

La page `/admin/consultations/[requestId]` affiche :

- informations client ;
- description du besoin ;
- niveau d'avancement ;
- budget ;
- mode souhaité ;
- paiement ;
- statut ;
- notes admin ;
- historique de paiement.

Actions disponibles :

- modifier le statut ;
- passer à `scheduled` ;
- passer à `completed` ;
- passer à `cancelled` ;
- modifier les notes internes.

## Préparation paiement réel

Le dossier `src/lib/consultation-payments/` prépare les providers :

```txt
mock
moncash
natcash
manual
```

Seul `mock` est actif. Les autres providers renvoient une erreur explicite indiquant qu'ils ne sont pas intégrés tant que la documentation officielle n'est pas validée.

Aucune API MonCash/NatCash réelle n'est appelée. Aucun endpoint webhook réel n'est ajouté. Aucun endpoint fournisseur n'est inventé.

## Emails et Brevo

Aucune intégration email n'est ajoutée dans cette branche :

- pas de Brevo ;
- pas de Resend ;
- pas de templates email ;
- pas de variable `BREVO_API_KEY` ;
- pas d'envoi automatique.

La communication email est volontairement reportée à un module séparé.

## Sécurité

Points vérifiés :

- les insertions publiques passent par des Server Actions ;
- les lectures admin utilisent la protection admin existante ;
- aucune route publique de liste des demandes n'est ajoutée ;
- les pages publiques ne montrent pas les notes admin ;
- les secrets de paiement réel ne sont pas utilisés ;
- `consultation_payments` reste séparé de `academy_payments`.

## Modules hors périmètre

Aucun changement n'est nécessaire côté :

- Academy ;
- paiements Academy ;
- certificats ;
- progression ;
- Cloudflare Stream ;
- formulaire Contact existant.

## Limites de vérification dans cet environnement

Les checks programmatiques `npm run lint` et `npm run build` passent.

Le parcours complet avec insertion réelle Supabase et paiement mock réel dépend de l'environnement Supabase cible, de la migration appliquée et des secrets de service role disponibles. Il doit être rejoué sur l'environnement de recette ou production avant merge final si ces accès ne sont pas disponibles localement.

## Conclusion

Le module Consultation est cohérent pour une première version mock-payment : public, formulaire, checkout, confirmation, admin et documentation sont présents. Le paiement réel et les emails restent explicitement hors périmètre.
