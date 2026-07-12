# Audit visuel — modèle officiel de certificat Agri-tech

## Références inspectées

Fichiers trouvés dans `docs/certificates` :

- `docs/certificates/agritech-certificate-template.pdf` — référence visuelle principale retenue.
- `docs/certificates/agritech-certificate-template.docx` — référence source uniquement, non parsée automatiquement.
- `docs/certificates/reference` — fichier vide ou quasi vide, sans apport visuel exploitable.

Le PDF indique une page `MediaBox 0 0 792 612`, soit un format paysage au ratio 11:8, cohérent avec un certificat US Letter paysage ou un rendu proche A4 paysage adapté à l’impression.

## 1. Format général du certificat

- **Orientation** : paysage.
- **Format page** : page large horizontale, proche US Letter paysage (`792 × 612 pt`) ; ratio visuel large, adapté à une impression pleine page.
- **Bordure** : fin cadre bleu sur presque tout le pourtour, avec angles légèrement arrondis. La bordure reste à l’intérieur de la page et laisse une marge blanche extérieure régulière.
- **Marges** : marges blanches généreuses. La zone de contenu démarre environ à 7–8 % de la largeur depuis le bord gauche, tandis que la bordure se situe près des bords imprimables. La zone basse conserve suffisamment d’espace pour la signature, le cachet, le QR code et le numéro.
- **Structure en deux zones** :
  - une grande zone gauche blanche, majoritaire, dédiée au texte de certification ;
  - une zone droite dominée par un grand panneau bleu vertical en forme de fanion.
- **Fond** : fond blanc pur sur toute la page, sans texture ni motif. Le contraste principal vient du bleu Agri-tech, du noir du texte et de l’orange de la bande projet.
- **Hiérarchie visuelle** :
  1. le panneau bleu et le grand titre `Certificat` attirent immédiatement l’œil ;
  2. le nom du bénéficiaire, très grand et bleu, est le second élément dominant ;
  3. les textes descriptifs, la liste, les dates et la signature constituent le niveau informatif ;
  4. le QR code, le numéro et la bande orange sont des éléments de validation et de contexte projet.

## 2. Zone gauche

- **Texte “Agri-tech certifie que :”** : placé en haut de la zone gauche, légèrement décalé vers la droite par rapport au bord intérieur. Il est en noir, gras, taille moyenne, sans décoration, et précède directement le nom.
- **Nom du bénéficiaire** : très grand, bleu Agri-tech, gras, sur deux lignes dans le modèle (`Walter` puis `DARIUS`). La deuxième ligne est en capitales. Le nom occupe une largeur importante et crée l’ancrage visuel principal de la zone gauche.
- **Paragraphe principal** : situé sous le nom, aligné à gauche, en noir. Le texte est en français, avec le titre de formation en gras (`apiculture moderne`) et une justification visuelle large. Le paragraphe explique que le bénéficiaire a suivi la formation, l’organisateur (`WAL AGRITECH`) et l’objet pédagogique.
- **Liste numérotée** : introduite par `Cette formation a couvert notamment :`. La liste comporte quatre lignes numérotées `1)` à `4)`, avec un retrait net entre le numéro et le texte. Les items sont espacés verticalement et restent en noir.
- **Section durée/date** : située après la liste, avec une phrase du type `D’une durée de [nombre d’heures / jours], cette formation a été réalisée du [date début] au [date fin].` Les champs dynamiques sont en gras.
- **Lieu/date** : phrase courte `Fait à [ville], le [date]`, placée sous la formule juridique. Les champs dynamiques sont en gras.
- **Signature** : placée dans le bas gauche, centrée sur une ligne horizontale fine. Le modèle affiche une signature manuscrite bleue au-dessus de la ligne, puis `Walter Darius`, `Directeur Général`, `WAL AGRITECH` empilés sous la ligne.
- **Cachet** : cachet circulaire bleu/violet placé à droite du bloc signature, dans la partie basse gauche. Il contient une forme centrale Agri-tech et du texte circulaire reprenant les valeurs de marque (`SENSIBILISER`, `EDUQUER`, `INNOVER`, `INFORMER`).

## 3. Zone droite

- **Grand panneau bleu** : occupe environ le tiers droit de la page. Il commence au bord supérieur et descend largement, avec une largeur fixe importante. Sa couleur est un bleu moyen/soutenu proche de `#4774c3` à l’écran.
- **Forme de fanion/pointe vers le bas** : le panneau bleu n’est pas un simple rectangle. Son bas forme une pointe centrée vers le bas, comme un fanion ou ruban. Les côtés inférieurs sont diagonaux et convergent vers une pointe centrale située au-dessus du QR code.
- **Logo Agri-tech** : placé en haut du panneau bleu, centré. Le logo officiel apparaît en blanc, avec l’icône soleil/feuille jaune au-dessus de la marque et la baseline `INFORMER • INNOVER • EDUQUER • SENSIBILISER` en blanc.
- **Titre “Certificat”** : placé au centre du panneau, très grand, blanc, gras, avec une police géométrique/arrondie. C’est l’élément typographique le plus visible du panneau.
- **Sous-titre “de participation”** : placé sous `Certificat`, en blanc, gras, plus petit mais encore très visible.
- **Lignes décoratives** : trois lignes horizontales blanches : une longue ligne sous le logo, une ligne moyenne sous le sous-titre et une ligne courte/moyenne au-dessus ou autour des étoiles selon l’équilibre vertical.
- **Étoiles** : trois étoiles blanches centrées dans la partie inférieure du panneau bleu, au-dessus de la pointe.
- **Placement du QR code** : QR code noir et blanc placé sous la pointe du fanion, dans la zone blanche, à droite du centre de page. Il est centré sous le panneau et laisse un espace clair entre la pointe et le QR code.
- **Numéro de certificat** : placé sous le QR code, en une ligne. Le libellé `Numéro du certificat :` est en gras noir, suivi de l’identifiant (`AGRI-API-2026-01`) en noir normal ou semi-gras.

## 4. Bande orange verticale

- **Position** : bande verticale à l’extrême droite, extérieure ou quasi extérieure au cadre principal bleu, démarrant près du bas de page et ne couvrant pas toute la hauteur. Elle est plus visible dans le tiers inférieur droit.
- **Couleur** : orange vif avec un léger effet de profondeur ou dégradé visuel, proche de `#f4771f` / `#ff914d`.
- **Texte vertical** : texte blanc, gras, orienté verticalement, lisible depuis le bas vers le haut ou par rotation. Le modèle montre `Projet : ApisFondwa`.
- **Champ dynamique possible** : le texte doit accepter `projectName`, avec fallback vers le titre de formation ou un libellé projet défini par l’équipe.

## 5. Données dynamiques nécessaires

Le template HTML/CSS final devra pouvoir recevoir au minimum :

- `studentName` — nom complet du bénéficiaire, potentiellement à couper sur deux lignes.
- `courseTitle` — titre de la formation, inséré dans le paragraphe principal.
- `certificateId` — numéro public affiché sous le QR code.
- `issuedAt` — date d’émission utilisée dans `Fait à [ville], le [date]`.
- `duration` — durée lisible (`nombre d’heures / jours`).
- `startDate` — date de début de formation.
- `endDate` — date de fin de formation.
- `city` — ville du lieu d’émission.
- `projectName` — nom affiché dans la bande orange verticale.
- `coveredTopics` — quatre thèmes principaux affichés en liste numérotée.
- `verificationUrl` — URL de vérification publique encodée dans le QR code.
- `qrCode` — image ou data URL du QR code à afficher.

## 6. Écarts entre le template actuel et le modèle officiel

Comparaison avec `src/components/academy/certificates/CertificateTemplate.tsx` :

- Le template actuel utilise un composant HTML responsive avec un ratio `aspect-[1.414/1]`, alors que le PDF de référence est en `792 × 612 pt` et doit être reproduit comme une page imprimable fixe.
- La bordure actuelle est plus épaisse (`border-[3px]`) que le cadre fin du modèle officiel.
- Le panneau bleu actuel occupe `32%` de la largeur, mais sa forme de fanion est simulée par un triangle blanc en bas ; le modèle officiel a un vrai bloc bleu dont le bas est découpé en pointe vers le bas.
- Le bleu du template actuel (`#123f93`) est plus sombre que le bleu du panneau officiel, qui apparaît plus clair et plus proche d’un bleu royal moyen.
- Le logo actuel est un substitut textuel/stylisé (`Ag`, `Agri-tech`) et ne reprend pas le logo officiel blanc avec pictogramme jaune et baseline complète.
- Le nom du bénéficiaire actuel est dynamique et grand, mais la composition exacte du modèle demande une première ligne en casse normale et une deuxième ligne en capitales, avec un bleu plus proche du panneau officiel.
- Le paragraphe principal actuel est générique (`compétences techniques et pratiques du programme Agri-tech Academy`) alors que le modèle officiel contient une formulation plus spécifique avec le titre de formation, l’organisateur et les techniques couvertes.
- La liste actuelle utilise une liste décimale HTML standard ; le modèle officiel utilise des numéros au format `1)`, `2)`, avec un espacement horizontal plus marqué.
- La signature actuelle est un placeholder en pointillés, alors que le modèle officiel affiche une vraie signature manuscrite bleue au-dessus d’une ligne fine.
- Le cachet actuel est un cercle textuel simplifié ; le modèle officiel utilise un cachet circulaire plus complexe avec texte circulaire et pictogramme central.
- Le QR code actuel est plus petit (`h-24 w-24`) et peut afficher un placeholder ; le modèle officiel affiche un QR code plus grand, bien centré sous la pointe du fanion.
- Le numéro de certificat actuel partage la même colonne étroite que le QR code et peut inclure l’URL de vérification ; le modèle officiel n’affiche visuellement que le libellé et le numéro sous le QR code.
- La bande orange actuelle couvre toute la hauteur à droite (`h-full w-8`) ; le modèle officiel montre une bande verticale basse, positionnée sur le bord droit et non sur toute la hauteur.
- Le template actuel affiche un badge de statut en haut à gauche ; le modèle officiel ne montre pas de badge `Certificat valide`, `Brouillon` ou `Révoqué` sur le rendu officiel.

## 7. Recommandation technique HTML/CSS

- Construire le certificat comme une surface imprimable fixe, par exemple avec une classe dédiée `certificate-page` dimensionnée en `11in × 8.5in` ou en `297mm × 210mm` selon le choix produit, puis adapter `@page { size: landscape; margin: 0; }`.
- Utiliser un conteneur interne avec bordure fine bleue, fond blanc et coordonnées relatives.
- Reproduire le panneau bleu avec un élément `clip-path: polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)` plutôt qu’avec un triangle blanc superposé.
- Réserver une grille principale en deux zones, mais positionner le panneau, le QR code, le numéro et la bande orange en absolu pour garantir la fidélité print.
- Charger le logo officiel comme image si un asset validé existe ; éviter un logo reconstruit en texte CSS.
- Prévoir des tailles typographiques fixes en `pt`, `mm`, `px` print ou `clamp` contrôlé, avec tests sur noms longs.
- Créer un rendu conditionnel : version écran centrée avec ombre, version impression sans ombre ni éléments UI externes.
- Conserver le QR code comme image dynamique, mais fixer sa taille et son emplacement pour correspondre au modèle.
- Prévoir les assets signature/cachet comme images transparentes si validés par l’équipe ; sinon garder des placeholders uniquement hors rendu officiel.
- Garder les données dynamiques séparées de la mise en page afin que l’ajustement visuel ne modifie pas la génération automatique, l’admin, Supabase, les paiements, la progression, les routes existantes ou la logique QR.
