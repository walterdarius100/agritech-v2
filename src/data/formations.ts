import type { Formation } from "@/types/formation";

const commonAudience = [
  "Jeunes intéressés par l’agriculture",
  "Producteurs débutants",
  "Porteurs de projets agricoles",
  "Organisations souhaitant former leurs membres",
  "Femmes et groupes communautaires",
];

const commonResources = [
  "Support de formation",
  "Fiches pratiques",
  "Liste de contrôle",
  "Recommandations techniques",
  "Accès aux ressources complémentaires selon disponibilité",
];

export const formations: Formation[] = [
  {
    title: "Formation en élevage de poulets de chair",
    slug: "elevage-poulets-de-chair",
    category: "Aviculture",
    shortDescription:
      "Apprendre les bases techniques pour démarrer et conduire un élevage de poulets de chair avec plus de méthode.",
    image: "/images/formations/formation-poulet.jpg",
    imageAlt: "Formation Agri-tech en élevage de poulets de chair",
    duration: "À définir",
    format: "Présentiel / Hybride",
    level: "Débutant",
    detailIntro:
      "Cette formation aide les participants à comprendre les étapes clés d’un lot de poulets de chair, du bâtiment à la sortie de production, avec une attention particulière à l’organisation, l’alimentation et la prévention des pertes.",
    objectives: [
      "Comprendre le cycle de production des poulets de chair",
      "Préparer un bâtiment adapté et fonctionnel",
      "Identifier les erreurs fréquentes au démarrage",
      "Suivre l’alimentation, la croissance et la santé du lot",
    ],
    audience: commonAudience,
    program: [
      {
        title: "Module 1 : Introduction à l’élevage de poulets de chair",
        lessons: [
          "Rôle de l’aviculture dans un projet agricole",
          "Cycle de production et points de vigilance",
        ],
      },
      {
        title: "Module 2 : Installation et préparation du bâtiment",
        lessons: [
          "Choix de l’espace",
          "Litière, chauffage, ventilation et densité",
        ],
      },
      {
        title: "Module 3 : Conduite technique du lot",
        lessons: [
          "Réception des poussins",
          "Alimentation, abreuvement et suivi de croissance",
        ],
      },
      {
        title: "Module 4 : Hygiène et prévention",
        lessons: ["Biosécurité simple", "Observation des signes d’alerte"],
      },
      {
        title: "Module 5 : Rentabilité et bonnes pratiques",
        lessons: [
          "Suivi des dépenses",
          "Erreurs fréquentes et décisions à anticiper",
        ],
      },
    ],
    skills: [
      "Préparer un démarrage de lot",
      "Organiser les tâches quotidiennes",
      "Lire les indicateurs simples de performance",
      "Réduire les risques sanitaires de base",
    ],
    resources: commonResources,
  },
  {
    title: "Formation en élevage de poules pondeuses",
    slug: "elevage-poules-pondeuses",
    category: "Aviculture",
    shortDescription:
      "Comprendre l’installation, l’alimentation, le suivi sanitaire et l’organisation d’un projet de poules pondeuses.",
    image: "/images/formations/poule-pondeuse.jpg",
    imageAlt: "Formation Agri-tech en élevage de poules pondeuses",
    duration: "À définir",
    format: "Présentiel / Hybride",
    level: "Débutant à intermédiaire",
    detailIntro:
      "Ce parcours présente les bases pour installer et suivre un élevage de pondeuses avec méthode, depuis l’organisation du poulailler jusqu’au suivi de la ponte et de la qualité des œufs.",
    objectives: [
      "Comprendre les besoins des pondeuses",
      "Organiser l’espace et les équipements",
      "Suivre l’alimentation, la ponte et la collecte",
      "Prévenir les problèmes sanitaires courants",
    ],
    audience: commonAudience,
    program: [
      {
        title: "Module 1 : Bases de l’élevage de pondeuses",
        lessons: ["Objectifs de production", "Principales phases de conduite"],
      },
      {
        title: "Module 2 : Installation du poulailler",
        lessons: [
          "Nids, perchoirs et circulation",
          "Lumière, ventilation et densité",
        ],
      },
      {
        title: "Module 3 : Alimentation et ponte",
        lessons: [
          "Besoins nutritionnels",
          "Suivi de la ponte et qualité des œufs",
        ],
      },
      {
        title: "Module 4 : Hygiène et suivi sanitaire",
        lessons: ["Nettoyage", "Observation du troupeau et prévention"],
      },
      {
        title: "Module 5 : Organisation et gestion",
        lessons: [
          "Collecte et stockage",
          "Calculs simples pour piloter l’activité",
        ],
      },
    ],
    skills: [
      "Installer un poulailler fonctionnel",
      "Planifier les routines de suivi",
      "Améliorer la collecte des œufs",
      "Repérer les anomalies courantes",
    ],
    resources: commonResources,
  },
  {
    title: "Formation pratique en cuniculture",
    slug: "cuniculture-pratique",
    category: "Cuniculture",
    shortDescription:
      "Se former aux bases de l’élevage de lapins : logement, alimentation, reproduction, hygiène et suivi.",
    image: "/images/services/cuniculture.jpg",
    imageAlt: "Formation pratique en cuniculture",
    duration: "À définir",
    format: "Présentiel / Hybride",
    level: "Débutant",
    detailIntro:
      "Cette formation donne une base claire pour démarrer un petit élevage de lapins avec des pratiques simples, progressives et adaptées aux moyens disponibles.",
    objectives: [
      "Comprendre les bases de l’élevage de lapins",
      "Préparer un logement propre et adapté",
      "Organiser la reproduction et le suivi",
      "Limiter les pertes grâce à l’hygiène et l’observation",
    ],
    audience: commonAudience,
    program: [
      {
        title: "Module 1 : Introduction à la cuniculture",
        lessons: [
          "Intérêt de l’élevage de lapins",
          "Organisation d’un petit atelier",
        ],
      },
      {
        title: "Module 2 : Logement et matériel",
        lessons: [
          "Cages, abris et ventilation",
          "Nettoyage et confort des animaux",
        ],
      },
      {
        title: "Module 3 : Alimentation et reproduction",
        lessons: ["Rations de base", "Accouplement, gestation et sevrage"],
      },
      {
        title: "Module 4 : Hygiène et prévention",
        lessons: [
          "Observation quotidienne",
          "Prévention des maladies fréquentes",
        ],
      },
      {
        title: "Module 5 : Gestion simple",
        lessons: [
          "Fiches de suivi",
          "Organisation progressive de la production",
        ],
      },
    ],
    skills: [
      "Installer un clapier simple",
      "Planifier les reproductions",
      "Suivre les jeunes lapins",
      "Maintenir de bonnes conditions d’hygiène",
    ],
    resources: commonResources,
  },
  {
    title: "Formation pratique en apiculture",
    slug: "apiculture-pratique",
    category: "Apiculture",
    shortDescription:
      "Découvrir les bases de l’apiculture, la conduite d’un rucher et les bonnes pratiques de suivi des colonies.",
    image: "/images/formations/apiculture.jpg",
    imageAlt: "Formation en apiculture",
    duration: "À définir",
    format: "Présentiel",
    level: "Débutant",
    detailIntro:
      "Cette formation introduit les principes essentiels pour comprendre les abeilles, installer un rucher et réaliser des visites de suivi avec prudence et méthode.",
    objectives: [
      "Comprendre l’organisation d’une colonie",
      "Choisir un emplacement adapté pour les ruches",
      "Réaliser les premiers gestes de suivi",
      "Identifier les risques et bonnes pratiques de sécurité",
    ],
    audience: commonAudience,
    program: [
      {
        title: "Module 1 : Découverte de l’apiculture",
        lessons: ["Rôle des abeilles", "Organisation de la ruche"],
      },
      {
        title: "Module 2 : Installation du rucher",
        lessons: ["Choix du site", "Matériel de base et sécurité"],
      },
      {
        title: "Module 3 : Conduite des colonies",
        lessons: [
          "Visites de suivi",
          "Observation des cadres et de l’activité",
        ],
      },
      {
        title: "Module 4 : Hygiène et prévention",
        lessons: ["Gestion des risques", "Bonnes pratiques de manipulation"],
      },
      {
        title: "Module 5 : Récolte et valorisation",
        lessons: ["Principes de récolte", "Qualité et conservation du miel"],
      },
    ],
    skills: [
      "Observer une colonie",
      "Préparer une visite de ruche",
      "Appliquer les règles de sécurité",
      "Planifier l’entretien d’un rucher",
    ],
    resources: commonResources,
  },
  {
    title: "Formation en pisciculture",
    slug: "pisciculture",
    category: "Pisciculture",
    shortDescription:
      "Comprendre les principes de base pour concevoir, organiser et suivre un projet d’élevage de poissons.",
    image: "/images/services/pisciculture.jpg",
    imageAlt: "Formation Agri-tech en pisciculture",
    duration: "À définir",
    format: "Présentiel / Hybride",
    level: "Débutant",
    detailIntro:
      "Ce module présente les bases d’un projet piscicole : choix du système, qualité de l’eau, alimentation, densité et suivi régulier des poissons.",
    objectives: [
      "Comprendre les systèmes piscicoles de base",
      "Identifier les besoins en eau et en espace",
      "Organiser l’alimentation et le suivi",
      "Prévenir les erreurs fréquentes de conduite",
    ],
    audience: commonAudience,
    program: [
      {
        title: "Module 1 : Introduction à la pisciculture",
        lessons: [
          "Principes d’élevage de poissons",
          "Choix du système selon les moyens",
        ],
      },
      {
        title: "Module 2 : Bassins et qualité de l’eau",
        lessons: ["Implantation", "Paramètres simples à surveiller"],
      },
      {
        title: "Module 3 : Alevins, alimentation et croissance",
        lessons: ["Mise en charge", "Nutrition et suivi du poids"],
      },
      {
        title: "Module 4 : Hygiène et prévention",
        lessons: ["Observation", "Risques courants et réactions rapides"],
      },
      {
        title: "Module 5 : Organisation du projet",
        lessons: ["Planification", "Suivi des coûts et bonnes pratiques"],
      },
    ],
    skills: [
      "Évaluer les conditions d’un site",
      "Suivre la qualité de l’eau",
      "Organiser l’alimentation",
      "Tenir un suivi simple de production",
    ],
    resources: commonResources,
  },
  {
    title: "Formation en production végétale",
    slug: "production-vegetale",
    category: "Production végétale",
    shortDescription:
      "Renforcer ses bases en cultures, pépinière, pratiques culturales et organisation d’une production végétale.",
    image: "/images/services/pepiniere.jpg",
    imageAlt: "Formation agricole en production végétale",
    duration: "À définir",
    format: "Présentiel / Hybride",
    level: "Débutant",
    detailIntro:
      "Cette formation accompagne les participants dans la compréhension des bases de la production végétale, de la préparation de la pépinière au suivi des cultures.",
    objectives: [
      "Comprendre les besoins des cultures",
      "Organiser une pépinière ou une parcelle",
      "Appliquer des pratiques culturales simples",
      "Mieux planifier les activités selon le terrain",
    ],
    audience: commonAudience,
    program: [
      {
        title: "Module 1 : Bases de la production végétale",
        lessons: ["Choix des cultures", "Sol, climat et calendrier"],
      },
      {
        title: "Module 2 : Pépinière et préparation",
        lessons: ["Semis", "Préparation du sol et repiquage"],
      },
      {
        title: "Module 3 : Conduite culturale",
        lessons: ["Arrosage", "Fertilisation et entretien"],
      },
      {
        title: "Module 4 : Protection et suivi",
        lessons: [
          "Observation des maladies et ravageurs",
          "Mesures préventives",
        ],
      },
      {
        title: "Module 5 : Organisation de la production",
        lessons: ["Planification", "Récolte, pertes et bonnes pratiques"],
      },
    ],
    skills: [
      "Planifier une production simple",
      "Préparer une pépinière",
      "Suivre les besoins des cultures",
      "Identifier les problèmes fréquents",
    ],
    resources: commonResources,
  },
  {
    title: "Formation en gestion de projet agricole",
    slug: "gestion-projet-agricole",
    category: "Gestion agricole",
    shortDescription:
      "Apprendre à structurer une idée agricole, estimer les besoins, organiser les étapes et mieux préparer son projet.",
    image: "/images/services/gabionnage.jpg",
    imageAlt: "Formation en gestion de projet agricole",
    duration: "À définir",
    format: "En ligne / Hybride",
    level: "Débutant à intermédiaire",
    detailIntro:
      "Cette formation aide les porteurs de projets à passer d’une idée agricole à une démarche plus structurée : objectifs, ressources, étapes, risques et premiers calculs de faisabilité.",
    objectives: [
      "Clarifier une idée de projet agricole",
      "Identifier les besoins techniques et financiers",
      "Organiser les étapes de mise en œuvre",
      "Mieux préparer les décisions avant investissement",
    ],
    audience: commonAudience,
    program: [
      {
        title: "Module 1 : Définir son idée de projet",
        lessons: [
          "Problème, solution et objectifs",
          "Public cible et contexte local",
        ],
      },
      {
        title: "Module 2 : Ressources et organisation",
        lessons: ["Besoins matériels", "Rôles, calendrier et priorités"],
      },
      {
        title: "Module 3 : Estimation et budget",
        lessons: [
          "Dépenses principales",
          "Recettes possibles et marges de prudence",
        ],
      },
      {
        title: "Module 4 : Risques et suivi",
        lessons: ["Risques techniques", "Indicateurs simples de pilotage"],
      },
      {
        title: "Module 5 : Présenter son projet",
        lessons: ["Synthèse du projet", "Prochaines étapes et plan d’action"],
      },
    ],
    skills: [
      "Structurer une idée agricole",
      "Estimer les besoins de départ",
      "Construire un plan d’action",
      "Présenter un projet de façon claire",
    ],
    resources: commonResources,
  },
];

export function getFormationBySlug(slug: string) {
  return formations.find((formation) => formation.slug === slug);
}
