import { createEnrollment } from "@/lib/academy/admin";
import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyCourse, AcademyEnrollment, Profile } from "@/types/academy";

type EnrollmentsAdminProps = {
  searchParams: Promise<{ success?: string }>;
};

export default async function EnrollmentsAdmin({ searchParams }: EnrollmentsAdminProps) {
  await requireAuthorizedAdmin();
  const query = await searchParams;
  const supabase = createSupabaseAdminClient();

  const [enrollmentsResult, coursesResult, profilesResult] = supabase
    ? await Promise.all([
        supabase.from("academy_enrollments").select("*").order("created_at", { ascending: false }),
        supabase.from("academy_courses").select("*").order("title"),
        supabase.from("profiles").select("*").eq("role", "student").order("full_name"),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  const enrollments = (enrollmentsResult.data ?? []) as AcademyEnrollment[];
  const courses = (coursesResult.data ?? []) as AcademyCourse[];
  const profiles = (profilesResult.data ?? []) as Profile[];
  const coursesById = new Map(courses.map((course) => [course.id, course]));
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));

  return (
    <div>
      <h1 className="text-3xl font-bold">Inscriptions Academy</h1>
      <p className="mt-2 text-slate-600">
        Attribuez ou mettez à jour un accès étudiant. Les statuts visibles côté étudiant sont <b>active</b> et <b>completed</b>.
      </p>

      {query.success ? (
        <p className="mt-6 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800">
          Accès enregistré. L’étudiant verra le cours après rafraîchissement si le statut est active ou completed.
        </p>
      ) : null}

      <form action={createEnrollment} className="mt-6 grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Étudiant
          <select name="studentId" required className="rounded border p-2 font-normal">
            <option value="">Choisir un étudiant</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.full_name ?? profile.id}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Cours
          <select name="courseId" required className="rounded border p-2 font-normal">
            <option value="">Choisir un cours</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title} ({course.slug})
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Statut
          <select name="status" defaultValue="active" className="rounded border p-2 font-normal">
            <option value="active">active</option>
            <option value="completed">completed</option>
            <option value="pending">pending</option>
            <option value="rejected">rejected</option>
            <option value="expired">expired</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Source
          <select name="accessSource" defaultValue="admin_grant" className="rounded border p-2 font-normal">
            <option value="admin_grant">admin_grant</option>
            <option value="manual">manual</option>
            <option value="free">free</option>
            <option value="payment">payment</option>
          </select>
        </label>

        <input name="paymentReference" placeholder="Référence paiement" className="rounded border p-2" />
        <input name="amountPaid" type="number" step="0.01" placeholder="Montant payé" className="rounded border p-2" />
        <input name="currency" defaultValue="HTG" className="rounded border p-2" />
        <button className="rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white" type="submit">
          Enregistrer l’accès
        </button>
      </form>

      <div className="mt-8 space-y-3">
        {enrollments.map((enrollment) => {
          const profile = profilesById.get(enrollment.student_id);
          const course = coursesById.get(enrollment.course_id);
          return (
            <div key={enrollment.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <b>{profile?.full_name ?? enrollment.student_id}</b> — {course?.title ?? enrollment.course_id}
              <span className="text-sm text-slate-600"> ({enrollment.status}/{enrollment.access_source})</span>
            </div>
          );
        })}
        {enrollments.length === 0 ? <p className="rounded-2xl bg-white p-4 text-slate-500">Aucune inscription pour le moment.</p> : null}
      </div>
    </div>
  );
}
