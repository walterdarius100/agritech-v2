export type ServiceFilterCategory = "Élevage" | "Production végétale" | "Technologie agricole" | "Accompagnement & formation";

export type Service = {
  title: string;
  slug: string;
  category: string;
  filterCategory: ServiceFilterCategory;
  shortDescription: string;
  image: string;
  imageAlt: string;
  detailIntro: string;
  audience: string[];
  agriTechSupport: string[];
  steps: string[];
  expectedResults: string[];
};
