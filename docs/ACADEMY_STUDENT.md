# Espace étudiant Academy

Routes : `/academy/register`, `/academy/login`, `/academy/dashboard`, `/academy/mes-cours`, `/academy/cours/[slug]/apprendre`, `/academy/certificats`.

Un étudiant crée un compte Supabase Auth, un profil `student` est créé, puis il voit uniquement ses inscriptions. La page d’apprentissage vérifie une inscription `active` ou `completed` avant d’afficher les leçons et ressources.
