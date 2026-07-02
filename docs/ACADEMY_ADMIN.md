# Admin Academy et demandes Contact

## Traitement manuel

Les demandes `academy_access` apparaissent dans `/admin/contact-requests` avec un badge `Academy`, le nom, l’email, la formation demandée et le slug du cours.

Depuis le détail d’une demande Academy, le lien `Gérer l’accès Academy` mène vers `/admin/academy/enrollments` pour aider l’équipe à attribuer l’accès manuellement.

## Règle importante

Une demande Contact n’accorde jamais l’accès automatiquement. L’enrollment Academy reste validé par un administrateur.

## Vidéos Cloudflare Stream

Dans le formulaire de leçon, l’admin peut coller l’URL iframe Cloudflare Stream ou l’identifiant vidéo. Le système extrait l’UID quand possible et prépare `video_provider`, `video_uid` et `video_embed_url` sans supprimer `video_url`.
