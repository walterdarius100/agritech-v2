# Certificats Academy — modèle visuel imprimable

Date : 2026-07-12.

## 1. Ce que ce PR ajoute

Ce PR ajoute une base visuelle HTML/CSS/Tailwind pour afficher un certificat Academy individuel et préparer l’impression ou l’enregistrement PDF via le navigateur.

Il n’ajoute pas de génération PDF serveur, pas de QR code réel et ne modifie pas la génération manuelle ou automatique existante.

## 2. Composant visuel

Le composant principal est :

```txt
src/components/academy/certificates/CertificateTemplate.tsx
```

Il reçoit les données dynamiques suivantes :

- `studentName` ;
- `courseTitle` ;
- `certificateId` ;
- `issuedAt` ;
- `verificationUrl` ;
- `status` ;
- `organizationName`, avec `Agri-tech / WAL AGRITECH` par défaut.

Le composant affiche un rendu institutionnel avec titre, nom étudiant, formation, date, identifiant public, signature, mention Agri-tech / WAL AGRITECH et une zone future pour QR code.

## 3. Page de visualisation

La page de visualisation est :

```txt
/academy/certificats/[certificateId]
```

Elle utilise les vraies données Supabase de `academy_certificates` et affiche le certificat avec `CertificateTemplate`.

## 4. Sécurité d’accès

La page de visualisation applique les règles suivantes :

- un étudiant connecté ne peut ouvrir que ses propres certificats ;
- un admin autorisé peut ouvrir les certificats depuis l’admin Academy ;
- un utilisateur non connecté est redirigé vers la connexion Academy ;
- un certificat appartenant à un autre étudiant renvoie une page introuvable.

Les UUID internes ne sont pas mis en avant dans le rendu visuel. Les informations de paiement ne sont jamais affichées.

## 5. Liens ajoutés

La page étudiant `/academy/certificats` affiche maintenant un bouton :

```txt
Voir le certificat
```

La page admin `/admin/academy/certificates` affiche aussi :

```txt
Voir le certificat
```

pour permettre une vérification interne du rendu.

## 6. Impression et PDF navigateur

Un bouton client `Imprimer / Enregistrer en PDF` appelle `window.print()`.

Le PDF n’est pas généré côté serveur dans ce PR. L’utilisateur doit choisir « Enregistrer en PDF » dans la boîte d’impression du navigateur.

## 7. Styles print

Les styles print sont dans :

```txt
src/app/globals.css
```

Ils définissent :

```css
@page {
  size: A4 landscape;
  margin: 0;
}
```

et masquent les éléments hors certificat afin que l’impression se concentre sur `.certificate-print-area`.

## 8. Statuts

Le modèle affiche :

- `Certificat valide` pour `valid` ou `issued` ;
- `Brouillon` avec filigrane pour `draft` ;
- `Certificat révoqué` avec filigrane pour `revoked` ;
- `Expiré` pour `expired`.

Un certificat révoqué reste consultable par son propriétaire ou un admin, mais il est clairement marqué comme non valide.

## 9. Page publique de vérification

La page publique `/certificats/verifier/[certificateId]` reste une page de vérification. Elle affiche uniquement les informations publiques : nom, formation, date, identifiant, statut et structure émettrice.

Elle ne fournit pas de version complète imprimable du certificat et n’expose pas d’email, téléphone, UUID interne ou information de paiement.

## 10. Pourquoi le fichier Word n’est pas parsé automatiquement

Le fichier Word sert de référence graphique. Il n’est pas parsé automatiquement dans ce PR afin d’éviter :

- une dépendance lourde ou fragile ;
- un rendu difficile à maintenir ;
- des différences imprévisibles entre environnements ;
- un couplage prématuré au futur pipeline PDF.

Le design HTML/CSS actuel fournit une base propre que l’on pourra rapprocher progressivement du modèle Word.

## 11. Pourquoi le PDF automatique serveur est repoussé

Aucune dépendance PDF lourde, comme Puppeteer, n’est ajoutée dans ce PR pour éviter des problèmes de déploiement et de performance.

Le PDF serveur pourra faire l’objet d’un PR séparé après choix d’une solution compatible avec l’hébergement et le stockage Supabase.

## 12. Ce qui reste à faire

- intégrer le design exact du modèle Word ;
- ajouter une signature ou un cachet officiel si disponible ;
- générer un QR code réel ;
- générer et stocker un PDF serveur ;
- renseigner `pdf_url` lorsque le pipeline PDF sera prêt.
