import Link from "next/link";

import { requireStudent } from "@/lib/academy/auth";
import { getActiveStudentCourses, getProgressForCourses } from "@/lib/academy/courses";

export default async function MyCoursesPage() {
  const user = await requireStudent();
  const activeCourses = await getActiveStudentCourses(user.id);
  const progressByCourse = await getProgressForCourses(
    user.id,
    activeCourses.map((enrollment) => enrollment.course_id),
  );

  return (
    <main className="bg-[#f8faf7] py-12">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="text-4xl font-bold text-emerald-950">Mes cours</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Seules les inscriptions avec accès actif ou complété sont affichées ici.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {activeCourses.map((enrollment) => {
            const course = enrollment.academy_courses;
            if (!course) return null;
            const progress = progressByCourse.get(enrollment.course_id) ?? 0;

            return (
              <article key={enrollment.id} className="rounded-3xl bg-white p-6 ring-1 ring-emerald-100">
                <p className="text-sm font-semibold uppercase text-orange-600">{course.category}</p>
                <h2 className="mt-2 text-2xl font-bold text-emerald-950">{course.title}</h2>
                <p className="mt-2 text-slate-600">{course.short_description}</p>
                <p className="mt-4 text-sm">
                  Statut d’inscription : <b>{enrollment.status}</b>
                </p>
                <p className="mt-2 text-sm text-slate-600">Progression réelle : {progress}%</p>
                <div className="mt-3 h-2 rounded-full bg-emerald-50">
                  <div className="h-2 rounded-full bg-emerald-700" style={{ width: `${progress}%` }} />
                </div>
                <Link className="mt-5 inline-flex rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white" href={`/academy/cours/${course.slug}/apprendre`}>
                  Continuer
                </Link>
              </article>
            );
          })}

          {activeCourses.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 ring-1 ring-emerald-100">
              <p className="font-semibold text-emerald-950">Aucun cours actif pour le moment.</p>
              <p className="mt-2 text-slate-600">Votre cours apparaîtra ici après validation de votre inscription par l’administration.</p>
              <Link className="mt-4 inline-flex font-semibold text-emerald-700" href="/academy">
                Consulter les formations disponibles
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
