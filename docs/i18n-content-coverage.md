# Couverture i18n des contenus publics dynamiques

## Architecture et sources

- Les articles publics viennent de `public.articles`. En l'absence de configuration Supabase, `src/data/articles.ts` reste le fallback.
- Le catalogue et les détails Academy viennent de `public.academy_courses`; le programme public utilise `academy_modules`, `academy_lessons` et `academy_resources`.
- Les slugs historiques restent la clé de route pour toutes les langues. Cette PR ne change donc aucun ancien lien.

## Format éditorial

La migration `20260804_add_public_content_translations.sql` ajoute un objet JSONB `translations`, sans supprimer les colonnes existantes. Exemple :

```json
{
  "en": { "title": "...", "excerpt": "...", "content": "..." },
  "es": { "title": "...", "excerpt": "...", "content": "..." }
}
```

Pour Academy, les clés publiques prises en charge sont `title`, `category`, `short_description`, `description`, `objectives`, `target_audience`, `program_summary`, `duration`, `certification_description`, `instructor_role` et `instructor_bio`. Les modules et leçons acceptent aussi leurs champs textuels dans leur propre objet `translations`.

## Fallback

L'ordre est : valeur de la langue active, valeur `fr` du JSONB, colonne historique (français), puis chaîne vide. Les valeurs non textuelles et les chaînes vides sont ignorées. Les slugs historiques ne sont pas localisés dans cette PR afin de préserver les URL.

## Contenus à compléter dans Supabase

La migration ne fabrique aucune traduction éditoriale longue. Après son application, exécuter un audit de données (ou utiliser l'éditeur SQL Supabase) pour lister :

- les articles où `translations->'en'` ou `translations->'es'` ne contient pas `title`, `excerpt` et `content` ;
- les formations où `translations->'en'` ou `translations->'es'` ne contient pas `title`, `short_description` et `description` ;
- les modules/leçons publiés sans titre EN/ES ;
- les champs complémentaires `objectives`, `target_audience` et `program_summary` à valider éditorialement.

Les traductions courtes contrôlées des quatre articles statiques restent disponibles quand le fallback local est utilisé. L'admin n'est volontairement pas refondu : une PR ultérieure pourra exposer l'édition JSONB avec validation et aperçu.
