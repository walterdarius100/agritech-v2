import { formations } from "@/data/formations";
import type { AcademyCourse, AcademyCourseModule } from "@/types/academy";

const academyCourseSlugs = [
  "elevage-poulets-de-chair",
  "cuniculture-pratique",
  "apiculture-pratique",
] as const;

const prototypeProgressBySlug: Record<(typeof academyCourseSlugs)[number], number> = {
  "elevage-poulets-de-chair": 58,
  "cuniculture-pratique": 38,
  "apiculture-pratique": 30,
};

const prototypeCurrentLessonBySlug: Record<(typeof academyCourseSlugs)[number], string> = {
  "elevage-poulets-de-chair": "Alimentation, abreuvement et suivi de croissance",
  "cuniculture-pratique": "Cages, abris et ventilation",
  "apiculture-pratique": "Choix du site",
};

function getPrototypeModuleStatus(index: number): AcademyCourseModule["status"] {
  if (index === 0) return "completed";
  if (index === 1) return "current";
  return "locked";
}

// Données temporaires pour le prototype visuel de l’espace étudiant Academy.
export const academyCourses: AcademyCourse[] = academyCourseSlugs.map((slug) => {
  const formation = formations.find((item) => item.slug === slug);

  if (!formation) {
    throw new Error(`Formation introuvable pour le prototype Academy : ${slug}`);
  }

  return {
    title: formation.title,
    slug: formation.slug,
    category: formation.category,
    shortDescription: formation.shortDescription,
    image: formation.image,
    imageAlt: formation.imageAlt,
    progress: prototypeProgressBySlug[slug],
    modulesCount: formation.program.length,
    currentLesson: prototypeCurrentLessonBySlug[slug],
    modules: formation.program.map((module, index) => ({
      title: module.title,
      lessons: module.lessons,
      status: getPrototypeModuleStatus(index),
    })),
    resources: [
      { title: "Support de formation", type: "PDF", status: "coming-soon" },
      { title: "Fiche pratique", type: "Fiche", status: "coming-soon" },
      { title: "Liste de contrôle", type: "Checklist", status: "coming-soon" },
      { title: "Guide de suivi", type: "Guide", status: "coming-soon" },
    ],
  };
});

export function getAcademyCourseBySlug(slug: string) {
  return academyCourses.find((course) => course.slug === slug);
}
