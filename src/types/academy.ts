export type AcademyModuleStatus = "completed" | "current" | "locked";

export type AcademyResourceType = "PDF" | "Fiche" | "Checklist" | "Guide";

export type AcademyResourceStatus = "available" | "coming-soon";

export type AcademyCourseModule = {
  title: string;
  lessons: string[];
  status: AcademyModuleStatus;
};

export type AcademyCourseResource = {
  title: string;
  type: AcademyResourceType;
  status: AcademyResourceStatus;
};

export type AcademyCourse = {
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  image: string;
  imageAlt: string;
  progress: number;
  modulesCount: number;
  currentLesson?: string;
  modules: AcademyCourseModule[];
  resources: AcademyCourseResource[];
};
