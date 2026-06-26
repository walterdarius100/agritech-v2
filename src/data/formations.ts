import type { Formation } from "@/types/formation";

export const formations: Formation[] = [
  { title: "Formation en aviculture", slug: "formation-aviculture", description: "Parcours d'introduction aux bases techniques de l'élevage avicole moderne en Haïti.", format: "Présentiel", level: "Débutant", featured: true },
  { title: "Formation poulet de chair", slug: "formation-poulet-de-chair", description: "Cycle de production, biosécurité, alimentation, suivi de croissance et analyse des performances.", format: "Atelier pratique", level: "Débutant", featured: true },
  { title: "Formation poules pondeuses", slug: "formation-poules-pondeuses", description: "Conduite d'élevage, gestion de la ponte, collecte, qualité des œufs et prévention sanitaire.", format: "Présentiel", level: "Intermédiaire", featured: true },
  { title: "Formation cuniculture", slug: "formation-cuniculture", description: "Installation, reproduction, alimentation, hygiène et gestion de base d'un clapier productif.", format: "Présentiel", level: "Débutant", featured: false },
  { title: "Formation apiculture", slug: "formation-apiculture", description: "Introduction aux ruches, aux visites de suivi, à la conduite apicole et à la récolte du miel.", format: "Atelier", level: "Débutant", featured: false },
  { title: "Formation pisciculture", slug: "formation-pisciculture", description: "Principes d'installation, densité, nutrition, qualité de l'eau et suivi d'un bassin piscicole.", format: "Présentiel", level: "Débutant", featured: false },
  { title: "Formations personnalisées", slug: "formations-personnalisees", description: "Modules adaptés aux besoins d'une équipe, d'une organisation ou d'un projet agricole spécifique.", format: "Sur demande", level: "Tous niveaux", featured: true },
];
