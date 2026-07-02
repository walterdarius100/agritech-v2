# Paiements Agri-tech Academy

Architecture serveur pour MonCash, NatCash et le mode `mock`. Le front choisit uniquement un provider; le prix vient toujours de `academy_courses`. En mode mock, une confirmation serveur marque le paiement `paid` puis active l'enrollment via `activateCourseAccessAfterPayment`.

Les vraies APIs MonCash/NatCash ne sont pas inventées: les adapters retournent une erreur tant que les clés et la documentation officielle ne sont pas disponibles. Les webhooks répondent `501` et n'activent aucun accès.
