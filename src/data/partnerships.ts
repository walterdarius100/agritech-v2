export type Partnership = {
  id: string;
  badge: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
};

export const partnerships: Partnership[] = [
  {
    id: "ong-locales",
    badge: "ONG locales",
    title: "Projets agricoles à impact social pour communautés et jeunes locaux.",
    imageSrc: "/images/services/pepiniere.jpg",
    imageAlt: "Jeunes plants en pépinière pour un projet agricole communautaire",
  },
  {
    id: "associations",
    badge: "Associations",
    title: "Formations et projets agricoles pour initiatives communautaires locales.",
    imageSrc: "/images/services/formation-poulet.jpg",
    imageAlt: "Session de formation agricole autour d’un élevage de poulets",
  },
  {
    id: "entreprises",
    badge: "Entreprises",
    title: "Solutions agricoles adaptées aux entreprises et initiatives privées.",
    imageSrc: "/images/services/irrigation.jpg",
    imageAlt: "Système d’irrigation pour un projet agricole professionnel",
  },
];
