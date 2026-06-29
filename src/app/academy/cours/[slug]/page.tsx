import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CoursePlayerLayout } from "@/components/academy/CoursePlayerLayout";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { academyCourses, getAcademyCourseBySlug } from "@/data/academyCourses";
import { createMetadata } from "@/lib/seo/metadata";

type AcademyCoursePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return academyCourses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: AcademyCoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getAcademyCourseBySlug(slug);

  if (!course) {
    return createMetadata({ title: "Cours introuvable", path: `/academy/cours/${slug}` });
  }

  return createMetadata({
    title: `${course.title} | Agri-tech Academy`,
    description: course.shortDescription,
    path: `/academy/cours/${course.slug}`,
    image: course.image,
  });
}

export default async function AcademyCoursePage({ params }: AcademyCoursePageProps) {
  const { slug } = await params;
  const course = getAcademyCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  return (
    <main className="overflow-x-hidden bg-[#f8faf7]">
      <section className="border-b border-emerald-100 bg-white py-10 sm:py-12">
        <Container>
          <Button href="/academy" variant="ghost" size="sm" className="px-0 lg:hidden">
            ← Retour à l’espace étudiant
          </Button>
          <div className="mt-7 grid gap-6 lg:mt-0 lg:grid-cols-[1fr_260px] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
                {course.category}
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-emerald-950 sm:text-5xl">
                {course.title}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                {course.shortDescription}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-900">Progression fictive</p>
              <p className="mt-2 text-3xl font-black text-emerald-950">{course.progress} %</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-emerald-700" style={{ width: `${course.progress}%` }} aria-hidden="true" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-10 sm:py-12 lg:py-14">
        <div className="mb-8 rounded-2xl border border-orange-100 bg-orange-50 px-5 py-4 text-sm leading-6 text-orange-900">
          Prototype visuel — les accès, paiements et progressions réelles seront ajoutés dans une prochaine étape.
        </div>
        <CoursePlayerLayout course={course} />
      </Container>
    </main>
  );
}
