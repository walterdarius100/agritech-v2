export type FormationProgramModule = {
  title: string;
  lessons: string[];
};

export type Formation = {
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  image: string;
  imageAlt: string;
  duration: string;
  format: string;
  level: string;
  detailIntro: string;
  objectives: string[];
  audience: string[];
  program: FormationProgramModule[];
  skills: string[];
  resources: string[];
};
