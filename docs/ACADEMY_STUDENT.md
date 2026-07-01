# Academy — expérience étudiant

L’espace étudiant conserve la logique existante d’accès validé, de modules, de leçons, de ressources et de progression.

## Page d’apprentissage

La page `/academy/cours/[slug]/apprendre` garde :

- sidebar modules/leçons ;
- lecteur vidéo responsive ;
- onglets À propos, Formateur, Ressources ;
- bouton de progression de leçon.

## Ajustements UX

- Le lecteur vidéo utilise un cadre plus léger afin de mieux s’intégrer à la page.
- Dans l’onglet Ressources, le bouton séparé “Ouvrir/Voir” est supprimé.
- Le titre de la ressource devient directement cliquable.
- Le lien pointe vers `external_url` si disponible, sinon vers `file_url`.
- Les liens s’ouvrent dans un nouvel onglet avec `rel="noopener noreferrer"`.

## Limites

Les ressources restent celles enregistrées en base. Aucun système d’upload ou de paiement n’est ajouté par cette amélioration.
