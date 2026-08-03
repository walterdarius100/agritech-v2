import type { Locale } from "@/i18n/locales";

export type LocalizedValue<T = string> = Record<Locale, T>;

export function pickLocalized<T>(
  value: Partial<LocalizedValue<T>> | undefined,
  locale: Locale,
  fallback: T,
): T {
  return value?.[locale] ?? value?.fr ?? fallback;
}

export const publicContent = {
  fr: {
    brandTagline: "Solutions agricoles",
    domains: {
      eyebrow: "Nos domaines d’intervention",
      title: "Des solutions agricoles adaptées au terrain haïtien.",
      description:
        "Agri-tech accompagne les porteurs de projets agricoles à travers l’élevage, la production végétale, les technologies agricoles, la formation et le suivi technique.",
      discover: "Découvrir ce domaine",
      all: "Voir nos domaines",
    },
    pillars: [
      [
        "Élevage",
        "Poulet de chair, poules pondeuses, cuniculture, apiculture, pisciculture et porciculture.",
      ],
      [
        "Production végétale",
        "Maraîchage, pépinière, irrigation et accompagnement technique des cultures.",
      ],
      [
        "Technologies agricoles",
        "Écloserie, incubateurs, biogaz, équipements et installations agricoles.",
      ],
      [
        "Formation & accompagnement",
        "Étude de projet, formation pratique, suivi technique et conseil personnalisé.",
      ],
    ],
    domainCards: [
      [
        "Poulet de chair",
        "Élevage",
        "Conception de poulailler, plan de production, équipements et accompagnement technique.",
      ],
      [
        "Poule pondeuse",
        "Élevage",
        "Mise en place d’unités de ponte, suivi sanitaire, alimentation et rentabilité.",
      ],
      [
        "Incubateur / Écloserie",
        "Technologie",
        "Fabrication et accompagnement autour des incubateurs pour la production de poussins.",
      ],
    ],
    academy: {
      title: "L’espace de formation pour structurer vos compétences agricoles",
      description:
        "Agri-tech Academy accompagne les porteurs de projets, étudiants, techniciens et entrepreneurs qui veulent renforcer leurs compétences de manière structurée.",
      action: "Découvrir notre Academy",
      imageAlt:
        "Étudiants et porteurs de projets agricoles accompagnés par Agri-tech Academy",
    },
    method: {
      eyebrow: "Notre méthode",
      title: "Un processus simple pour éviter les projets improvisés",
      description:
        "Agri-tech transforme l’intention en démarche structurée grâce au diagnostic, au plan technique et au suivi.",
      steps: [
        "Diagnostic du terrain et du besoin",
        "Conception du modèle technique",
        "Installation et formation pratique",
        "Suivi, correction et optimisation",
      ],
    },
    consultation: {
      eyebrow: "Consultation Agri-tech",
      title: "Réservez une consultation agricole avec Agri-tech",
      description:
        "Présentez votre projet ou votre problème agricole et recevez un accompagnement adapté à votre situation.",
      book: "Réserver une consultation",
      start: "Commencer ma demande",
      cardTitle: "Un échange pour clarifier avant d’investir.",
      cardText:
        "La consultation aide à poser les bonnes questions, repérer les points de vigilance et organiser les prochaines étapes.",
      price: "Tarif de départ",
      duration: "Consultation en ligne de 30 à 45 minutes.",
    },
    partnerships: {
      eyebrow: "Partenariats",
      title: "Construisons ensemble des projets agricoles à fort impact",
      description:
        "Agri-tech collabore avec des entreprises, ONG et associations pour développer des initiatives agricoles concrètes et durables.",
      action: "Discuter d’un partenariat",
      carousel: "Opportunités de partenariat",
    },
    testimonials: {
      eyebrow: "Témoignages",
      title: "Ce que disent les personnes accompagnées.",
      description:
        "Des retours qui reflètent la qualité de notre accompagnement.",
      previous: "Témoignage précédent",
      next: "Témoignage suivant",
    },
    news: {
      eyebrow: "Actualités Agri-tech",
      title: "Conseils, analyses et nouvelles du secteur agricole.",
      description:
        "Retrouvez nos articles et contenus pratiques sur les réalités agricoles en Haïti.",
      featured: "À la une",
      read: "Lire l’article",
      all: "Voir toutes les actualités",
    },
  },
  en: {
    brandTagline: "Agricultural solutions",
    domains: {
      eyebrow: "Our areas of expertise",
      title: "Agricultural solutions tailored to Haiti.",
      description:
        "Agri-tech supports agricultural projects through livestock, crop production, agricultural technology, training and technical monitoring.",
      discover: "Explore this field",
      all: "Explore our services",
    },
    pillars: [
      [
        "Livestock",
        "Broilers, laying hens, rabbit farming, beekeeping, fish farming and pig farming.",
      ],
      [
        "Crop production",
        "Market gardening, nurseries, irrigation and technical crop support.",
      ],
      [
        "Agricultural technology",
        "Hatcheries, incubators, biogas, equipment and agricultural facilities.",
      ],
      [
        "Training & support",
        "Project studies, practical training, technical monitoring and personalized advice.",
      ],
    ],
    domainCards: [
      [
        "Broiler farming",
        "Livestock",
        "Poultry-house design, production planning, equipment and technical support.",
      ],
      [
        "Laying hens",
        "Livestock",
        "Setting up laying units, health monitoring, feeding and profitability.",
      ],
      [
        "Incubator / Hatchery",
        "Technology",
        "Incubator solutions and support for chick production.",
      ],
    ],
    academy: {
      title: "The learning space for building agricultural skills",
      description:
        "Agri-tech Academy supports project owners, students, technicians and entrepreneurs who want to strengthen their skills through structured learning.",
      action: "Explore our Academy",
      imageAlt:
        "Agricultural students and project owners supported by Agri-tech Academy",
    },
    method: {
      eyebrow: "Our method",
      title: "A straightforward process for well-planned projects",
      description:
        "Agri-tech turns ideas into a structured approach through assessment, technical planning and monitoring.",
      steps: [
        "Site and needs assessment",
        "Technical model design",
        "Installation and practical training",
        "Monitoring, adjustment and optimization",
      ],
    },
    consultation: {
      eyebrow: "Agri-tech consultation",
      title: "Book an agricultural consultation with Agri-tech",
      description:
        "Present your agricultural project or challenge and receive support tailored to your situation.",
      book: "Book a consultation",
      start: "Start my request",
      cardTitle: "A conversation to gain clarity before investing.",
      cardText:
        "A consultation helps you ask the right questions, identify risks and organize the next steps.",
      price: "Starting fee",
      duration: "30 to 45-minute online consultation.",
    },
    partnerships: {
      eyebrow: "Partnerships",
      title: "Let’s build high-impact agricultural projects together",
      description:
        "Agri-tech works with businesses, NGOs and associations to develop practical, sustainable agricultural initiatives.",
      action: "Discuss a partnership",
      carousel: "Partnership opportunities",
    },
    testimonials: {
      eyebrow: "Testimonials",
      title: "What the people we support say.",
      description: "Feedback that reflects the quality of our support.",
      previous: "Previous testimonial",
      next: "Next testimonial",
    },
    news: {
      eyebrow: "Agri-tech news",
      title: "Advice, analysis and agricultural news.",
      description:
        "Read our articles and practical insights into agriculture in Haiti.",
      featured: "Featured",
      read: "Read article",
      all: "View all news",
    },
  },
  es: {
    brandTagline: "Soluciones agrícolas",
    domains: {
      eyebrow: "Nuestras áreas de intervención",
      title: "Soluciones agrícolas adaptadas a Haití.",
      description:
        "Agri-tech acompaña proyectos mediante ganadería, producción vegetal, tecnología agrícola, formación y seguimiento técnico.",
      discover: "Descubrir esta área",
      all: "Descubrir nuestros servicios",
    },
    pillars: [
      [
        "Ganadería",
        "Pollos de engorde, gallinas ponedoras, cunicultura, apicultura, piscicultura y porcicultura.",
      ],
      [
        "Producción vegetal",
        "Horticultura, viveros, riego y acompañamiento técnico de cultivos.",
      ],
      [
        "Tecnologías agrícolas",
        "Plantas de incubación, incubadoras, biogás, equipos e instalaciones agrícolas.",
      ],
      [
        "Formación y acompañamiento",
        "Estudios de proyecto, formación práctica, seguimiento técnico y asesoría personalizada.",
      ],
    ],
    domainCards: [
      [
        "Pollos de engorde",
        "Ganadería",
        "Diseño de gallineros, planificación productiva, equipos y acompañamiento técnico.",
      ],
      [
        "Gallinas ponedoras",
        "Ganadería",
        "Instalación de unidades de puesta, seguimiento sanitario, alimentación y rentabilidad.",
      ],
      [
        "Incubadora / Planta de incubación",
        "Tecnología",
        "Soluciones de incubación y acompañamiento para producir pollitos.",
      ],
    ],
    academy: {
      title: "El espacio de formación para desarrollar competencias agrícolas",
      description:
        "Agri-tech Academy acompaña a promotores, estudiantes, técnicos y emprendedores que desean reforzar sus competencias de manera estructurada.",
      action: "Descubrir nuestra Academy",
      imageAlt:
        "Estudiantes y promotores agrícolas acompañados por Agri-tech Academy",
    },
    method: {
      eyebrow: "Nuestro método",
      title: "Un proceso sencillo para proyectos bien planificados",
      description:
        "Agri-tech convierte la intención en un proceso estructurado mediante diagnóstico, planificación técnica y seguimiento.",
      steps: [
        "Diagnóstico del terreno y las necesidades",
        "Diseño del modelo técnico",
        "Instalación y formación práctica",
        "Seguimiento, ajuste y optimización",
      ],
    },
    consultation: {
      eyebrow: "Consulta Agri-tech",
      title: "Reserva una consulta agrícola con Agri-tech",
      description:
        "Presenta tu proyecto o problema agrícola y recibe un acompañamiento adaptado a tu situación.",
      book: "Reservar una consulta",
      start: "Iniciar mi solicitud",
      cardTitle: "Una conversación para aclarar antes de invertir.",
      cardText:
        "La consulta ayuda a formular las preguntas adecuadas, detectar riesgos y organizar los próximos pasos.",
      price: "Tarifa inicial",
      duration: "Consulta en línea de 30 a 45 minutos.",
    },
    partnerships: {
      eyebrow: "Alianzas",
      title: "Construyamos juntos proyectos agrícolas de alto impacto",
      description:
        "Agri-tech colabora con empresas, ONG y asociaciones para desarrollar iniciativas agrícolas concretas y sostenibles.",
      action: "Hablar de una alianza",
      carousel: "Oportunidades de alianza",
    },
    testimonials: {
      eyebrow: "Testimonios",
      title: "Lo que dicen las personas acompañadas.",
      description:
        "Opiniones que reflejan la calidad de nuestro acompañamiento.",
      previous: "Testimonio anterior",
      next: "Testimonio siguiente",
    },
    news: {
      eyebrow: "Noticias Agri-tech",
      title: "Consejos, análisis y noticias agrícolas.",
      description:
        "Consulta nuestros artículos y contenidos prácticos sobre la agricultura en Haití.",
      featured: "Destacado",
      read: "Leer el artículo",
      all: "Ver todas las noticias",
    },
  },
} as const;
