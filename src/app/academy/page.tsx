import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { formations } from "@/data/formations";
import { getCurrentStudentUser } from "@/lib/academy/auth";
import { getPublishedAcademyCourses } from "@/lib/academy/courses";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Agri-tech Academy | Formations agricoles",
  description:
    "Découvrez les formations Agri-tech Academy et connectez-vous à votre espace étudiant pour suivre vos cours validés.",
  path: "/academy",
});

export default async function AcademyPage() {
  const [user, academyCourses] = await Promise.all([getCurrentStudentUser(), getPublishedAcademyCourses()]);
  const publicCourses = academyCourses.length
    ? academyCourses.map((course) => ({
        title: course.title,
        slug: course.slug,
        category: course.category,
        shortDescription: course.short_description ?? "Formation Academy Agri-tech.",
        duration: course.duration ?? "Durée non précisée",
        level: course.level === "beginner" ? "Débutant" : course.level === "intermediate" ? "Intermédiaire" : course.level === "advanced" ? "Avancé" : "Niveau non précisé",
        coverImageUrl: course.cover_image_url,
      }))
    : formations.map((formation) => ({
        title: formation.title,
        slug: formation.slug,
        category: formation.category,
        shortDescription: formation.shortDescription,
        duration: formation.duration,
        level: formation.level,
        coverImageUrl: formation.image,
      }));

  return (
    <main className="bg-[#f8faf7]">
      <section className="bg-emerald-950 py-16 text-white sm:py-20">
        <Container>
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-400">Agri-tech Academy</p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
              Formations agricoles pratiques, accès étudiant sécurisé.
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/80">
              Consultez les parcours disponibles, créez votre compte étudiant et accédez au contenu complet après validation de votre inscription.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="rounded-xl bg-yellow-400 px-5 py-3 font-bold text-emerald-950" href={user ? "/academy/dashboard" : "/academy/register"}>
                {user ? "Aller à mon dashboard" : "Créer un compte étudiant"}
              </Link>
              <Link className="rounded-xl bg-white/10 px-5 py-3 font-semibold text-white ring-1 ring-white/15" href="/academy/login">
                Connexion étudiant
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-12 sm:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Catalogue public</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">Cours disponibles</h2>
          <p className="mt-4 leading-7 text-slate-600">
            Cette page est publique. La progression réelle, les ressources privées et les leçons complètes sont réservées à `/academy/dashboard` et `/academy/cours/[slug]/apprendre`.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publicCourses.map((course) => (
            <article key={course.slug} className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-emerald-100 transition hover:-translate-y-1 hover:shadow-md">
              <div className="relative h-48 overflow-hidden bg-emerald-50">
                {course.coverImageUrl ? <Image src={course.coverImageUrl} alt={course.title} fill unoptimized sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center bg-emerald-900 text-sm font-bold uppercase tracking-[0.18em] text-yellow-300">Agri-tech Academy</div>}
              </div>
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">{course.category}</p>
                <h3 className="mt-3 text-xl font-bold text-emerald-950">{course.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{course.shortDescription}</p>
                <div className="mt-5 grid gap-2 text-xs font-semibold text-emerald-800 sm:grid-cols-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-2">Durée : {course.duration}</span>
                  <span className="rounded-full bg-emerald-50 px-3 py-2">Niveau : {course.level}</span>
                </div>
                <Link className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800" href={`/academy/cours/${course.slug}`}>
                  Voir la formation →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </main>
  );
}
