import type { Service } from "@/types/service";

export const services: Service[] = [
  { title: "Poulet de chair", slug: "poulet-de-chair", description: "Accompagnement technique pour lancer, suivre et optimiser un élevage de poulets de chair rentable.", category: "Aviculture", featured: true },
  { title: "Poules pondeuses", slug: "poules-pondeuses", description: "Conseils sur le logement, l'alimentation, la ponte, la biosécurité et le suivi sanitaire des pondeuses.", category: "Aviculture", featured: true },
  { title: "Écloserie", slug: "ecloserie", description: "Préparation de projets d'écloserie et suivi des paramètres clés d'incubation et de démarrage.", category: "Aviculture", featured: false },
  { title: "Cuniculture", slug: "cuniculture", description: "Structuration de projets d'élevage de lapins adaptés aux moyens disponibles et au marché local.", category: "Élevage", featured: false },
  { title: "Apiculture", slug: "apiculture", description: "Initiation, conduite de rucher et amélioration progressive de la production de miel.", category: "Élevage", featured: false },
  { title: "Pisciculture", slug: "pisciculture", description: "Bases techniques pour concevoir, dimensionner et suivre des unités piscicoles durables.", category: "Aquaculture", featured: true },
  { title: "Maraîchage", slug: "maraichage", description: "Appui au calendrier cultural, à la fertilisation, à l'irrigation et aux bonnes pratiques de production.", category: "Production végétale", featured: false },
  { title: "Irrigation", slug: "irrigation", description: "Orientation sur les solutions d'irrigation adaptées aux parcelles, cultures et ressources en eau.", category: "Infrastructure", featured: false },
  { title: "Porciculture", slug: "porciculture", description: "Conseils pour installer, gérer et améliorer des unités porcines avec une approche sanitaire rigoureuse.", category: "Élevage", featured: false },
  { title: "Biogaz", slug: "biogaz", description: "Préparation de solutions de valorisation des déchets agricoles en énergie et fertilisants organiques.", category: "Énergie", featured: false },
  { title: "Équipements agricoles", slug: "equipements-agricoles", description: "Aide au choix d'équipements utiles pour améliorer la productivité et la sécurité des opérations agricoles.", category: "Matériel", featured: false },
  { title: "Accompagnement technique", slug: "accompagnement-technique", description: "Diagnostic, plan d'action, suivi terrain et conseils personnalisés pour porteurs de projets agricoles.", category: "Conseil", featured: true },
];
