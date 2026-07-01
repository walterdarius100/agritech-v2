# Espace étudiant Academy

Routes : `/academy/register`, `/academy/login`, `/academy/dashboard`, `/academy/mes-cours`, `/academy/cours/[slug]/apprendre`, `/academy/certificats`.

Un étudiant crée un compte Supabase Auth, un profil `student` est créé, puis il voit uniquement ses inscriptions. La page d’apprentissage vérifie une inscription `active` ou `completed` avant d’afficher les leçons et ressources.

## Nouvelle expérience d’apprentissage

La page `/academy/cours/[slug]/apprendre` est organisée comme une interface LMS :

- un en-tête simple avec le titre du cours et la progression réelle ;
- une sidebar à gauche listant les modules et les leçons publiées ;
- des modules repliables/dépliables pour naviguer sans scroll horizontal ;
- une zone vidéo prioritaire à droite ;
- des onglets sous la vidéo : **À propos de ce module**, **Formateur de la leçon** et **Ressources**.

La sélection d’une leçon se fait dans la sidebar. La vidéo, les informations du module, le formateur et les ressources affichées changent selon la leçon active. Le bouton **Marquer comme terminé** reste dans la zone de lecture et continue d’écrire dans `academy_lesson_progress`.
