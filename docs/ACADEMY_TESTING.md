# Academy — checklist de test

## Pages à vérifier

- `/academy` : cartes avec image, titre, description courte, durée, niveau et CTA, sans prix.
- `/academy/cours/cuniculture-pratique` : hero sans prix ni box accès, détails, certification longue, formateur long, programme accordéon et box modalités d’accès.
- `/academy/cours/cuniculture-pratique/apprendre` : accès étudiant, lecteur vidéo plus large, onglets, ressources cliquables, progression.

## Tests fonctionnels

1. Sur `/academy`, les cartes de formation n’affichent plus le prix.
2. Les cartes affichent toujours image, description courte, durée et niveau.
3. Sur `/academy/cours/[slug]`, la box “Accès / Validation manuelle” n’est plus dans le hero.
4. Le prix n’est plus affiché dans le hero.
5. Une box prix + CTA `Demander l’accès` apparaît dans les modalités d’accès.
6. La phrase expliquant la validation manuelle par l’équipe Agri-tech est affichée.
7. La section Formateur est affichée en format long et lisible.
8. La section Certification Agri-tech est affichée en format long et lisible.
9. Le lecteur vidéo dans `/apprendre` est légèrement plus large et conserve son ratio responsive.
10. Les onglets, ressources, enrollments et la progression continuent de fonctionner.
11. Aucun scroll horizontal sur mobile.

## Commandes

```bash
npm run lint
npm run build
```
