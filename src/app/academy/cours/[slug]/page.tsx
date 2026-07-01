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
  const certificationText = course.certification_description || "À la fin de cette formation, les participants ayant suivi le parcours et rempli les conditions définies par Agri-tech pourront recevoir une attestation ou un certificat Agri-tech. La délivrance du document reste soumise à la validation de l’équipe Agri-tech.";
  const priceLabel = course.is_free ? "Gratuit" : `${course.price_amount ?? "Sur devis"} ${course.price_currency ?? "HTG"}`;
  const accessHref = hasAccess ? `/academy/cours/${course.slug}/apprendre` : user ? "/contact" : "/academy/register";
  const accessLabel = hasAccess ? "Continuer le cours" : "Demander l’accès";
  const accessCopy = course.is_free
    ? "Après votre demande, l’équipe Agri-tech pourra valider votre accès à cette formation."
    : "Après votre demande, l’équipe Agri-tech vous contactera pour finaliser les modalités de paiement. L’accès à la formation sera activé manuellement après validation.";

  return (
    <main className="bg-[#f8faf7]">
      <section className="relative overflow-hidden bg-emerald-950 py-14 text-white sm:py-20">
        {course.cover_image_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-luminosity sm:opacity-40"
            style={{ backgroundImage: `url(${course.cover_image_url})` }}
            aria-hidden="true"
          />
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(250,204,21,0.20),transparent_24%),linear-gradient(110deg,rgba(2,44,34,0.98)_0%,rgba(2,44,34,0.92)_46%,rgba(6,78,59,0.74)_100%)]" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f8faf7] to-transparent" aria-hidden="true" />
        <Container className="relative z-10">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-widest text-yellow-400">{course.category}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight drop-shadow-sm sm:text-5xl">{course.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85 drop-shadow-sm">{course.short_description ?? "Formation Academy Agri-tech."}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold text-white/90">
              <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/20 backdrop-blur-sm">{course.duration ?? "Durée non précisée"}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/20 backdrop-blur-sm">{course.level ? levelLabels[course.level] : "Niveau non précisé"}</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="rounded-xl bg-yellow-400 px-5 py-3 font-bold text-emerald-950 shadow-sm transition hover:bg-yellow-300" href={accessHref}>{accessLabel}</Link>
              <Link className="rounded-xl bg-white/10 px-5 py-3 font-semibold text-white ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-white/15" href="/academy/login">Connexion étudiant</Link>
            </div>
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
              <div className="grid gap-5 md:grid-cols-[64px_minmax(0,1fr)]">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-3xl">🎓</span>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Validation Agri-tech</p>
                  <h2 className="mt-3 text-3xl font-black text-emerald-950">Certification Agri-tech</h2>
                  <p className="mt-5 max-w-3xl whitespace-pre-line text-lg leading-8 text-slate-700">{certificationText}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100 sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Encadrement</p>
              <h2 className="mt-3 text-3xl font-black text-emerald-950">Formateur</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-[96px_minmax(0,1fr)] md:items-start">
                {course.instructor_image_url ? <span className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl"><Image src={course.instructor_image_url} alt={course.instructor_name ?? "Formateur Agri-tech"} fill unoptimized sizes="96px" className="object-cover" /></span> : <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-emerald-50 text-2xl font-black text-emerald-800">AT</span>}
                <div>
                  <p className="text-2xl font-black text-emerald-950">{course.instructor_name || "Équipe Agri-tech"}</p>
                  <p className="mt-1 text-base font-semibold text-emerald-700">{course.instructor_role || "Formateur Academy"}</p>
                  <p className="mt-5 max-w-3xl whitespace-pre-line text-lg leading-8 text-slate-700">{course.instructor_bio || "Cette formation est préparée par l’équipe Agri-tech dans le cadre de son programme de formation agricole."}</p>
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
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Modalités d’accès</p>
              <p className="mt-3 text-4xl font-black text-emerald-950">{priceLabel}</p>
              <p className="mt-4 leading-7 text-slate-600">{accessCopy}</p>
              <Link className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800" href={accessHref}>{accessLabel}</Link>
            </section>
          </aside>
        </div>
      </Container>
    </main>
  );
}
