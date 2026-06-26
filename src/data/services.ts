import type { Service } from "@/types/service";

export const services: Service[] = [
  { title: "Poulet de chair", slug: "poulet-de-chair", description: "Accompagnement technique pour lancer et optimiser un élevage de poulets de chair.", category: "Aviculture", featured: true },
  { title: "Poules pondeuses", slug: "poules-pondeuses", description: "Conseils de production, logement, alimentation et suivi sanitaire des pondeuses.", category: "Aviculture", featured: true },
  { title: "Cuniculture", slug: "cuniculture", description: "Structuration de projets d'élevage de lapins adaptés au contexte local.", category: "Élevage", featured: false },
  { title: "Apiculture", slug: "apiculture", description: "Initiation et accompagnement pour une apiculture productive et responsable.", category: "Élevage", featured: false },
  { title: "Pisciculture", slug: "pisciculture", description: "Bases techniques pour concevoir et suivre des unités piscicoles.", category: "Aquaculture", featured: true },
  { title: "Maraîchage", slug: "maraichage", description: "Appui à la production maraîchère, au calendrier cultural et aux bonnes pratiques.", category: "Production végétale", featured: false },
  { title: "Irrigation", slug: "irrigation", description: "Solutions d'irrigation adaptées aux parcelles et aux ressources disponibles.", category: "Infrastructure", featured: false },
  { title: "Écloserie", slug: "ecloserie", description: "Préparation de projets d'écloserie et suivi des paramètres clés d'incubation.", category: "Aviculture", featured: false },
  { title: "Porciculture", slug: "porciculture", description: "Conseils pour la mise en place et l'amélioration d'unités porcines.", category: "Élevage", featured: false },
  { title: "Biogaz", slug: "biogaz", description: "Préparation de solutions de valorisation des déchets agricoles en énergie.", category: "Énergie", featured: false },
];
