export type HomeDomain = {
  title: string;
  category: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
};

export const homeDomains: HomeDomain[] = [
  {
    title: "Poulet de chair",
    category: "Élevage",
    description:
      "Conception de poulailler, plan de production, équipements et accompagnement technique.",
    image: "/images/services/poulet-chair.jpg",
    imageAlt: "Poulets de chair dans un poulailler agricole",
    href: "/services",
  },
  {
    title: "Poule pondeuse",
    category: "Élevage",
    description:
      "Mise en place d’unités de ponte, suivi sanitaire, alimentation et rentabilité.",
    image: "/images/services/poule-pondeuse.jpg",
    imageAlt: "Poules pondeuses dans une unité d’élevage",
    href: "/services",
  },
  {
    title: "Incubateur / Écloserie",
    category: "Technologie",
    description:
      "Fabrication et accompagnement autour des incubateurs pour production de poussins.",
    image: "/images/services/incubateur.jpg",
    imageAlt: "Incubateur agricole pour la production de poussins",
    href: "/services",
  },
];
