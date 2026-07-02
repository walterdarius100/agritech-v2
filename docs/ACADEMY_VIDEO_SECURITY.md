# Sécurité des vidéos Academy

## Objectif réaliste

Les vidéos Academy sont protégées contre l’accès direct simple, le téléchargement exposé dans l’interface et le partage évident d’URL. Cependant, aucune plateforme web ne peut empêcher à 100 % un enregistrement d’écran ou une capture réalisée par un appareil externe.

## Champs vidéo

Les leçons gardent `video_url` pour compatibilité, mais préparent aussi :

- `video_provider` : par exemple `cloudflare_stream`, `youtube`, `vimeo`, `mp4` ou `external` ;
- `video_uid` : identifiant Cloudflare Stream extrait de l’URL iframe ou saisi directement ;
- `video_embed_url` : URL iframe Cloudflare conservée temporairement pour compatibilité.

## Lecture Cloudflare Stream

Dans l’espace étudiant autorisé, les vidéos Cloudflare sont chargées via `/api/academy/secure-video?lessonId=...`. Cette route vérifie l’utilisateur connecté et son enrollment actif avant de retourner une URL d’iframe.

Si les clés Cloudflare Stream signées sont configurées, l’URL retournée utilise un token temporaire avec `downloadable: false`. Si les clés ne sont pas configurées, un fallback non signé n’est autorisé qu’en développement ou si `NEXT_PUBLIC_ENABLE_UNSECURE_VIDEO_FALLBACK=true`.

## Variables d’environnement

- `CLOUDFLARE_STREAM_SIGNING_KEY_ID`
- `CLOUDFLARE_STREAM_SIGNING_KEY_SECRET`
- `CLOUDFLARE_STREAM_CUSTOMER_CODE` optionnel si un domaine customer Cloudflare Stream est utilisé
- `NEXT_PUBLIC_ENABLE_UNSECURE_VIDEO_FALLBACK=true` uniquement pour développement ou transition contrôlée

## Watermark étudiant

Le lecteur affiche un watermark non interactif avec le nom ou l’email de l’étudiant. Il réduit le partage abusif mais ne remplace pas les URLs signées.
