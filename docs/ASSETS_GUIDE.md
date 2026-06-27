# Guide d'organisation des assets Agri-tech V2

Ce guide définit l'organisation des images, icônes et favicons du site Agri-tech V2. L'objectif est de garder un dossier `public/` lisible, durable et prêt pour Next.js, sans mélanger les images fixes du site avec les futurs médias dynamiques gérés par Supabase Storage.

## Structure des dossiers

```txt
public/
  images/
    brand/
    hero/
    services/
    formations/
    articles/
    team/
    partners/
    backgrounds/
    placeholders/
  icons/
  favicons/
```

### Où placer chaque type d'asset ?

- `public/images/brand/` : logo Agri-tech, variantes du logo, éléments visuels de marque et signatures.
- `public/images/hero/` : images principales des sections hero et visuels très visibles en haut de page.
- `public/images/services/` : images des services agricoles, cartes de services et illustrations métier.
- `public/images/formations/` : images de formations, modules pédagogiques publics et visuels de promotion.
- `public/images/articles/` : images statiques d'articles ou placeholders éditoriaux utilisés dans le code.
- `public/images/team/` : photos d'équipe, formateurs, intervenants et profils publics.
- `public/images/partners/` : logos partenaires et institutions associées.
- `public/images/backgrounds/` : textures, fonds visuels, motifs agricoles ou images d'ambiance.
- `public/images/placeholders/` : images temporaires à remplacer avant mise en production.
- `public/icons/` : icônes personnalisées du projet, idéalement en SVG.
- `public/favicons/` : favicon et fichiers associés aux navigateurs et appareils mobiles.

## Règles de nommage

Utiliser des noms descriptifs, en minuscules, sans accents, séparés par des tirets. Un bon nom doit décrire le contenu, le contexte et si possible la localisation ou la marque.

Exemples recommandés :

```txt
hero-agritech-projet-agricole-haiti.webp
service-apiculture-haiti.webp
formation-aviculture-agritech.webp
article-figue-banane-fondwa.webp
logo-agritech-main.png
```

Éviter les noms vagues ou issus directement d'un appareil photo :

```txt
IMG_1234.jpg
photo1.png
image-final-final.png
```

## Formats recommandés

- **WebP** : format recommandé pour la plupart des images du site, notamment hero, cartes, articles et backgrounds.
- **PNG** : utile pour les logos ou éléments de marque qui nécessitent une transparence parfaite.
- **SVG** : idéal pour les icônes, pictogrammes et éléments vectoriels simples.
- **JPG** : à utiliser seulement si WebP n'est pas possible ou si la source ne permet pas une conversion propre.

## Poids recommandé

Optimiser les images avant de les ajouter au dépôt :

- Images hero : idéalement moins de **300–500 Ko** si possible.
- Images de cartes services/formations : idéalement moins de **150–250 Ko**.
- Logos et icônes : fichiers légers, propres et compressés.
- Éviter les images très lourdes, les exports non compressés et les doublons inutiles.

## Utilisation avec Next.js

Les images fixes placées dans `public/` sont servies depuis la racine du site. Exemple avec `next/image` :

```tsx
import Image from "next/image";

<Image
  src="/images/hero/hero-agritech-projet-agricole-haiti.webp"
  alt="Projet agricole accompagné par Agri-tech en Haïti"
  width={1600}
  height={900}
  priority
/>
```

Bonnes pratiques :

- Rédiger un `alt` utile et contextualisé.
- Définir `width` et `height` selon le fichier réel.
- Utiliser `priority` uniquement pour les images critiques au-dessus de la ligne de flottaison.
- Préférer des images déjà redimensionnées aux dimensions utiles du site.

## Images fixes et images dynamiques

- Images fixes du site public : `public/images/`.
- Images d'articles, d'admin ou de formations gérées dynamiquement : **Supabase Storage plus tard**.
- Ressources Academy, documents pédagogiques et fichiers utilisateurs : **Supabase Storage plus tard**.

Cette séparation évite de gonfler le dépôt avec des médias administrables et permet de garder le code source léger.

## Favicons

Les favicons seront placés dans :

```txt
public/favicons/
```

Fichiers attendus lorsque le logo final sera prêt :

```txt
favicon.ico
favicon-16x16.png
favicon-32x32.png
apple-touch-icon.png
android-chrome-192x192.png
android-chrome-512x512.png
site.webmanifest
```

Il faudra générer ces tailles à partir du logo Agri-tech final, puis seulement ensuite déclarer les liens correspondants dans les métadonnées Next.js. Ne pas référencer ces fichiers dans `src/app/layout.tsx` tant qu'ils n'existent pas réellement, afin d'éviter des liens cassés.
