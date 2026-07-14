# Impression et enregistrement PDF des certificats Academy

Ce document décrit le rendu imprimable des certificats Academy. Le périmètre est volontairement limité au navigateur : aucune génération PDF serveur, aucune dépendance PDF et aucune modification de la logique de génération des certificats ne sont introduites.

## Bouton utilisé

La page de détail du certificat affiche le bouton :

```txt
Imprimer / Enregistrer en PDF
```

Le bouton est un composant client React qui appelle uniquement :

```ts
window.print()
```

Le libellé évite volontairement “Télécharger PDF”, car aucun fichier PDF n’est créé côté serveur. Le PDF est produit par le navigateur lorsque l’utilisateur choisit l’option “Enregistrer au format PDF” dans la fenêtre d’impression.

## Routes concernées

- `/academy/certificats/[certificateId]` : page protégée de consultation du certificat pour l’étudiant propriétaire ou un admin autorisé. C’est la route principale d’impression du certificat réel.
- `/admin/academy/certificates` : la liste admin continue de pointer vers la route protégée précédente via “Voir le certificat”.
- `/admin/academy/certificates/template-preview` : la prévisualisation admin du template statique dispose aussi du bouton d’impression pour contrôler le rendu visuel.

La page publique `/certificats/verifier/[certificateId]` reste une page de vérification publique et n’est pas transformée en page de certificat imprimable.

## Règles print ajoutées

Les styles print sont centralisés dans `src/app/globals.css` :

- `@page { size: A4 landscape; margin: 0; }` force une sortie A4 paysage.
- `html` et `body` sont contraints à `297mm × 210mm`, sans marge et sans overflow, pour éviter les pages blanches supplémentaires.
- `.no-print`, `.print-hidden` et leurs enfants sont masqués complètement à l’impression.
- Le contenu non certificat est rendu invisible pendant l’impression.
- `.certificate-print-area` est repositionnée en plein format A4 paysage, avec `padding: 5mm`, sans ombre, sans overflow et avec `break-inside/page-break-inside: avoid`.
- `-webkit-print-color-adjust: exact` et `print-color-adjust: exact` sont appliqués au contexte imprimable afin de préserver les couleurs, le logo, le bandeau bleu, la bande orange et le QR code.

## Comportement attendu

À l’écran, la page conserve son layout normal avec fond neutre, navigation de retour, message d’aide et bouton d’action.

À l’impression ou lors de l’enregistrement PDF depuis le navigateur :

- seul le certificat doit apparaître ;
- les boutons, textes d’aide, liens retour, éléments admin, navigation et zones de dashboard sont masqués ;
- le certificat est optimisé pour une seule page A4 paysage ;
- les couleurs et images du template sont conservées ;
- le QR code et le numéro public du certificat restent visibles.

## Limites actuelles

Le rendu PDF dépend du moteur d’impression du navigateur et des réglages utilisateur. Pour un résultat fidèle, l’utilisateur doit choisir une sortie paysage et activer l’impression des arrière-plans si son navigateur le demande.

Aucun stockage de PDF n’est effectué. Le champ `pdf_url`, les données Supabase, le `certificate_id`, le QR code et les règles d’accès ne sont pas modifiés par cette approche.

## Évolutions possibles pour un vrai PDF serveur

Si Agri-tech souhaite plus tard produire un PDF serveur stable et archivé, il faudra prévoir un PR séparé pour :

1. choisir une stratégie de rendu serveur légère ou un service dédié ;
2. générer le PDF à partir d’un certificat déjà persisté ;
3. stocker le fichier dans un espace sécurisé ;
4. renseigner éventuellement `pdf_url` sans casser les certificats existants ;
5. gérer la révocation, les droits d’accès et la régénération de manière idempotente.

Cette évolution ne fait pas partie du présent périmètre.
