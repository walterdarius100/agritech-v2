import type { Formation } from "@/types/formation";

export const formations: Formation[] = [
  { title: "Formation en aviculture", slug: "formation-aviculture", description: "Bases techniques pour comprendre la gestion moderne d'un atelier avicole.", format: "Présentiel", level: "Débutant", featured: true },
  { title: "Formation poulet de chair", slug: "formation-poulet-de-chair", description: "Cycle de production, biosécurité, alimentation et suivi des performances.", format: "Présentiel", level: "Débutant", featured: true },
  { title: "Formation poules pondeuses", slug: "formation-poules-pondeuses", description: "Conduite d'élevage, collecte, qualité des œufs et prévention sanitaire.", format: "Présentiel", level: "Intermédiaire", featured: true },
  { title: "Formation cuniculture", slug: "formation-cuniculture", description: "Installation, reproduction, alimentation et gestion de base d'un clapier.", format: "Présentiel", level: "Débutant", featured: false },
  { title: "Formation apiculture", slug: "formation-apiculture", description: "Introduction aux ruches, à la conduite apicole et à la récolte du miel.", format: "Atelier", level: "Débutant", featured: false },
  { title: "Formation pisciculture", slug: "formation-pisciculture", description: "Principes d'installation, densité, nutrition et suivi de la qualité de l'eau.", format: "Présentiel", level: "Débutant", featured: false },
];
