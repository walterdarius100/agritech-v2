export type Testimonial = {
  id: string;
  profile: string;
  domain: string;
  rating: number;
  quote: string;
  imageSrc: string;
  imageAlt: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "porteur-projet-poulet-chair",
    profile: "Porteur de projet",
    domain: "Poulet de chair",
    rating: 5,
    quote: "Agri-tech m’a aidé à structurer mon idée et à voir les erreurs que je devais éviter avant d’investir.",
    imageSrc: "/images/team/temoignage-1.jpg",
    imageAlt: "Portrait d’une personne accompagnée par Agri-tech",
  },
  {
    id: "productrice-cuniculture",
    profile: "Productrice accompagnée",
    domain: "Cuniculture",
    rating: 5,
    quote: "La formation m’a permis de mieux comprendre l’alimentation, l’hygiène et l’organisation d’un petit élevage rentable.",
    imageSrc: "/images/team/temoignage-2.jpg",
    imageAlt: "Portrait d’une productrice accompagnée par Agri-tech",
  },
  {
    id: "responsable-formation-agricole",
    profile: "Responsable d’organisation",
    domain: "Formation agricole",
    rating: 5,
    quote: "L’approche d’Agri-tech est claire, pratique et adaptée aux réalités du terrain. Cela facilite la prise de décision.",
    imageSrc: "/images/team/temoignage-3.jpg",
    imageAlt: "Portrait d’un responsable d’organisation accompagné par Agri-tech",
  },
];
