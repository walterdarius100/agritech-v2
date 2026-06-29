import type { Article } from "@/types/article";

export const articles: Article[] = [
  {
    id: "static-article-a-la-une",
    title: "Pourquoi bien préparer un projet agricole avant d’investir ?",
    slug: "article-a-la-une",
    category: "Analyse agricole",
    excerpt:
      "Avant de construire un poulailler, lancer une ferme ou acheter des équipements, une étude sérieuse permet de réduire les erreurs, mieux estimer les coûts et adapter le projet au terrain.",
    cover_image_url: "/images/services/pepiniere.jpg",
    author: "Équipe Agri-tech",
    content:
      "Un projet agricole solide commence par une analyse du terrain, de l’eau disponible, du budget, du marché et des compétences nécessaires. Cette préparation aide à choisir le bon modèle technique, anticiper les charges et éviter les décisions précipitées qui fragilisent la rentabilité.",
    status: "published",
    featured: true,
    reading_time: "3 min de lecture",
    published_at: "2026-06-20",
    created_at: "2026-06-20",
    updated_at: "2026-06-20",
  },
  {
    id: "static-erreurs-demarrage-elevage-poulet-chair",
    title: "Poulet de chair : les erreurs fréquentes au démarrage d’un élevage",
    slug: "erreurs-demarrage-elevage-poulet-chair",
    category: "Aviculture",
    excerpt:
      "Température, densité, alimentation et hygiène : les premiers jours déterminent fortement la croissance, la santé et les résultats économiques d’un lot.",
    cover_image_url: "/images/services/poulet-chair.jpg",
    author: "Équipe Agri-tech",
    content:
      "Le démarrage d’un élevage de poulet de chair demande une préparation rigoureuse du bâtiment, de la litière, des points d’eau et du programme alimentaire. Une observation quotidienne permet de corriger rapidement les écarts et de limiter les pertes.",
    status: "published",
    featured: false,
    reading_time: "3 min de lecture",
    published_at: "2026-06-12",
    created_at: "2026-06-12",
    updated_at: "2026-06-12",
  },
  {
    id: "static-cuniculture-alimentation-rentabilite",
    title:
      "Cuniculture : pourquoi l’alimentation influence directement la rentabilité",
    slug: "cuniculture-alimentation-rentabilite",
    category: "Cuniculture",
    excerpt:
      "Une ration régulière, équilibrée et adaptée au stade de production réduit les pertes et améliore la performance des élevages de lapins.",
    cover_image_url: "/images/services/cuniculture.jpg",
    author: "Équipe Agri-tech",
    content:
      "En cuniculture, l’alimentation influence la croissance, la reproduction et la santé digestive. Le suivi des quantités distribuées, de la qualité des fourrages et de l’eau disponible fait partie des leviers essentiels pour stabiliser la rentabilité.",
    status: "published",
    featured: false,
    reading_time: "3 min de lecture",
    published_at: "2026-06-05",
    created_at: "2026-06-05",
    updated_at: "2026-06-05",
  },
  {
    id: "static-apiculture-causes-depart-colonie",
    title: "Apiculture : comprendre les causes de départ d’une colonie",
    slug: "apiculture-causes-depart-colonie",
    category: "Apiculture",
    excerpt:
      "Manque de nourriture, emplacement inadapté, chaleur excessive ou dérangements répétés peuvent pousser une colonie à quitter la ruche.",
    cover_image_url: "/images/services/apiculture.jpg",
    author: "Équipe Agri-tech",
    content:
      "Le départ d’une colonie n’est pas toujours un hasard. L’apiculteur doit observer l’environnement, la disponibilité florale, l’ombre, la ventilation et les manipulations réalisées afin de créer des conditions plus stables pour les abeilles.",
    status: "published",
    featured: false,
    reading_time: "3 min de lecture",
    published_at: "2026-05-28",
    created_at: "2026-05-28",
    updated_at: "2026-05-28",
  },
];
