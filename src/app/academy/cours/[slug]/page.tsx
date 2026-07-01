import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { getCurrentStudentUser } from "@/lib/academy/auth";
import { getAcademyCourseBySlug, getPublicCourseProgram, hasActiveEnrollment } from "@/lib/academy/courses";
import { createMetadata } from "@/lib/seo/metadata";
import type { AcademyLevel } from "@/types/academy";

const levelLabels: Record<AcademyLevel, string> = { beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé" };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getAcademyCourseBySlug(slug);
  return createMetadata({ title: course ? `${course.title} | Agri-tech Academy` : "Cours introuvable", description: course?.short_description ?? "Formation Academy", path: `/academy/cours/${slug}` });
}

export default async function AcademyCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getAcademyCourseBySlug(slug);
  if (!course) notFound();

  const user = await getCurrentStudentUser();
  const hasAccess = user ? await hasActiveEnrollment(user.id, course.id) : false;
  const { modules, lessons, resources } = await getPublicCourseProgram(course.id);
  const videoCount = lessons.filter((lesson) => lesson.video_url).length;
  const certificationText = course.certification_description || "À la fin de cette formation, les participants ayant suivi le parcours et validé les conditions définies par Agri-tech pourront recevoir un certificat ou une attestation de participation. Ce document pourra être vérifié en ligne lorsque la fonctionnalité de vérification est activée.";

  return (
    <main className="bg-[#f8faf7]">
      <section className="bg-emerald-950 py-14 text-white sm:py-18">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-yellow-400">{course.category}</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">{course.title}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">{course.short_description ?? "Formation Academy Agri-tech."}</p>
              <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold text-white/85">
                <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">{course.duration ?? "Durée non précisée"}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">{course.level ? levelLabels[course.level] : "Niveau non précisé"}</span>
                <span className="rounded-full bg-yellow-400 px-3 py-1 text-emerald-950">{course.is_free ? "Gratuit" : `${course.price_amount ?? "Sur devis"} ${course.price_currency ?? "HTG"}`}</span>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="rounded-xl bg-yellow-400 px-5 py-3 font-bold text-emerald-950" href={hasAccess ? `/academy/cours/${course.slug}/apprendre` : user ? "/contact" : "/academy/register"}>{hasAccess ? "Continuer le cours" : user ? "Demander l’accès" : "Créer un compte étudiant"}</Link>
                <Link className="rounded-xl bg-white/10 px-5 py-3 font-semibold text-white ring-1 ring-white/15" href="/academy/login">Connexion étudiant</Link>
              </div>
            </div>
            <aside className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur">
              <p className="text-sm text-white/70">Accès</p>
              <p className="mt-2 text-2xl font-black">Validation manuelle</p>
              <p className="mt-3 text-sm leading-6 text-white/75">Accès complet après validation par l’équipe Agri-tech. Les leçons, ressources et progression restent dans l’espace étudiant sécurisé.</p>
            </aside>
          </div>
        </Container>
      </section>

      <Container className="py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-8">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100 sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Détails du cours</p>
              <h2 className="mt-3 text-3xl font-black text-emerald-950">Détails du cours</h2>
              <p className="mt-3 font-semibold text-slate-700">{modules.length} module{modules.length > 1 ? "s" : ""} | {course.duration ?? "Durée non précisée"}</p>
              <p className="mt-5 whitespace-pre-line leading-8 text-slate-700">{course.description ?? course.short_description ?? "La description détaillée de cette formation sera complétée prochainement."}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <span className="rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-900">1 certification ou attestation</span>
                <span className="rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-900">{videoCount} vidéo{videoCount > 1 ? "s" : ""}</span>
                <span className="rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-900">{resources.length} ressource{resources.length > 1 ? "s" : ""}</span>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100 sm:p-8">
              <div className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-2xl">🎓</span>
                <div>
                  <h2 className="text-3xl font-black text-emerald-950">Certification Agri-tech</h2>
                  <p className="mt-4 leading-8 text-slate-700">{certificationText}</p>
                </div>
              </div>
            </section>

            <section>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Programme</p>
              <h2 className="mt-3 text-3xl font-black text-emerald-950">Programme de la formation</h2>
              <div className="mt-6 space-y-4">
                {modules.map((module, index) => {
                  const moduleLessons = lessons.filter((lesson) => lesson.module_id === module.id);
                  return (
                    <details key={module.id} className="group rounded-3xl bg-white p-5 shadow-sm ring-1 ring-emerald-100 open:ring-emerald-300" open={index === 0}>
                      <summary className="flex cursor-pointer list-none items-start gap-4">
                        <span className="mt-1 text-xl text-emerald-700 transition group-open:rotate-90">›</span>
                        <span className="min-w-0 flex-1"><span className="block break-words text-lg font-black text-emerald-950">{module.title}</span><span className="mt-1 block text-sm font-semibold text-slate-500">Module | {moduleLessons.length} leçon{moduleLessons.length > 1 ? "s" : ""}</span></span>
                      </summary>
                      {module.description ? <p className="mt-4 leading-7 text-slate-600">{module.description}</p> : null}
                      <ul className="mt-4 space-y-2 text-sm text-slate-700">
                        {moduleLessons.map((lesson) => <li key={lesson.id} className="rounded-2xl bg-slate-50 px-4 py-3">{lesson.title}{lesson.duration ? ` — ${lesson.duration}` : ""}{lesson.is_preview ? " — aperçu gratuit" : ""}</li>)}
                        {moduleLessons.length === 0 ? <li className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-500">Leçons en préparation.</li> : null}
                      </ul>
                    </details>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
              <h2 className="text-xl font-black text-emerald-950">Formateur Agri-tech</h2>
              <div className="mt-5 flex gap-4">
                {course.instructor_image_url ? <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl"><Image src={course.instructor_image_url} alt={course.instructor_name ?? "Formateur Agri-tech"} fill unoptimized sizes="64px" className="object-cover" /></span> : <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 font-black text-emerald-800">AT</span>}
                <div>
                  <p className="font-black text-emerald-950">{course.instructor_name || "Équipe Agri-tech"}</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-700">{course.instructor_role || "Formateur Academy"}</p>
                </div>
              </div>
              <p className="mt-4 leading-7 text-slate-600">{course.instructor_bio || "Cette formation est préparée par l’équipe Agri-tech dans le cadre de son programme de formation agricole."}</p>
            </section>
          </aside>
        </div>
      </Container>
    </main>
  );
}
