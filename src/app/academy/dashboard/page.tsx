import Link from "next/link";

import { requireStudent } from "@/lib/academy/auth";
import { logoutStudent } from "@/lib/academy/authActions";
import { getActiveStudentCourses, getProgressForCourses } from "@/lib/academy/courses";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/academy";

function StatCard({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-emerald-100">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-emerald-950">{value}</p>
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

export default async function StudentDashboard() {
  const user = await requireStudent();
  const supabase = createSupabaseAdminClient();
  const activeCourses = await getActiveStudentCourses(user.id);
  const courseIds = activeCourses.map((enrollment) => enrollment.course_id);
  const progressByCourse = await getProgressForCourses(user.id, courseIds);
  const averageProgress = courseIds.length
    ? Math.round(courseIds.reduce((sum, courseId) => sum + (progressByCourse.get(courseId) ?? 0), 0) / courseIds.length)
    : 0;

  const [{ data: certs }, { data: profile }] = supabase
    ? await Promise.all([
        supabase.from("academy_certificates").select("id").eq("student_id", user.id),
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      ])
    : [{ data: [] }, { data: null }];

  const studentName = (profile as Pick<Profile, "full_name"> | null)?.full_name ?? user.email ?? "étudiant";

  return (
    <main className="bg-[#f8faf7] py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-bold uppercase tracking-widest text-emerald-700">Dashboard étudiant</p>
            <h1 className="mt-2 text-4xl font-bold text-emerald-950">Bienvenue {studentName}</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Cet espace affiche uniquement vos inscriptions Academy actives, votre progression réelle et vos certificats émis.
            </p>
          </div>
          <form action={logoutStudent}>
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700" type="submit">
              Déconnexion
            </button>
          </form>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3" aria-label="Résumé Academy réel">
          <StatCard label="Cours actifs" value={activeCourses.length} />
          <StatCard label="Progression globale" value={`${averageProgress} %`} helper="Calculée depuis les leçons terminées" />
          <StatCard label="Certificats" value={certs?.length ?? 0} />
        </section>

        <section className="mt-10 rounded-3xl bg-white p-6 ring-1 ring-emerald-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Continuer l’apprentissage</h2>
              <p className="mt-2 text-slate-600">Vos cours actifs validés par l’administration.</p>
            </div>
            <Link href="/academy/mes-cours" className="font-semibold text-emerald-700">
              Voir tous mes cours →
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {activeCourses.slice(0, 4).map((enrollment) => {
              const course = enrollment.academy_courses;
              if (!course) return null;
              const progress = progressByCourse.get(enrollment.course_id) ?? 0;

              return (
                <article key={enrollment.id} className="rounded-2xl border border-emerald-100 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-600">{course.category}</p>
                  <h3 className="mt-2 text-xl font-bold text-emerald-950">{course.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">Progression : {progress}%</p>
                  <div className="mt-3 h-2 rounded-full bg-emerald-50">
                    <div className="h-2 rounded-full bg-emerald-700" style={{ width: `${progress}%` }} />
                  </div>
                  <Link className="mt-4 inline-flex rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white" href={`/academy/cours/${course.slug}/apprendre`}>
                    Continuer
                  </Link>
                </article>
              );
            })}
          </div>

          {activeCourses.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-emerald-50 p-5 text-emerald-950">
              <p className="font-semibold">Vous n’avez pas encore de cours actif.</p>
              <p className="mt-2 text-sm text-emerald-900/75">Demandez un accès à une formation, puis l’administration validera votre inscription.</p>
              <Link className="mt-4 inline-flex font-semibold text-emerald-800" href="/academy">
                Découvrir les cours Academy →
              </Link>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
