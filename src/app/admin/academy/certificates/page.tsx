import Link from "next/link";

import { createCertificate, revokeCertificate } from "@/lib/academy/admin";
import { getCertificateEligibilityDiagnostics } from "@/lib/academy/certificates";
import type { AcademyCertificate } from "@/types/academy";
import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export default async function CertificatesAdmin({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  await requireAuthorizedAdmin();
  const params = (await searchParams) ?? {};
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  let certificatesQuery = supabase.from("academy_certificates").select("*").order("issued_at", { ascending: false });
  if (params.status) certificatesQuery = certificatesQuery.eq("status", params.status);
  if (params.student) certificatesQuery = certificatesQuery.eq("student_id", params.student);
  if (params.course) certificatesQuery = certificatesQuery.eq("course_id", params.course);

  const [certificates, courses, profiles, diagnostics] = await Promise.all([
    certificatesQuery,
    supabase.from("academy_courses").select("id,title").order("title"),
    supabase.from("profiles").select("id,full_name").order("full_name"),
    getCertificateEligibilityDiagnostics(),
  ]);
  const eligibleDiagnostics = diagnostics.filter((item) => item.isEligible);

  return (
    <div>
      <h1 className="text-3xl font-bold">Certificats Academy</h1>
      {params.error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{decodeURIComponent(params.error)}</p> : null}
      {params.success ? <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Certificat généré ou déjà existant.</p> : null}
      <form className="mt-6 grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200 md:grid-cols-4">
        <select name="student" defaultValue={params.student ?? ""} className="rounded border p-2"><option value="">Tous les étudiants</option>{(profiles.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.full_name ?? p.id}</option>)}</select>
        <select name="course" defaultValue={params.course ?? ""} className="rounded border p-2"><option value="">Toutes les formations</option>{(courses.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
        <select name="status" defaultValue={params.status ?? ""} className="rounded border p-2"><option value="">Tous les statuts</option><option value="valid">Valide</option><option value="draft">Brouillon</option><option value="revoked">Révoqué</option></select>
        <button className="rounded-xl bg-emerald-700 px-4 py-2 text-white">Filtrer</button>
      </form>

      <form action={createCertificate} className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <label className="text-sm font-semibold">Générer manuellement après complétion</label>
        {eligibleDiagnostics.length > 0 ? (
          <div className="mt-2 flex gap-3"><select name="enrollmentId" required className="min-w-0 flex-1 rounded border p-2">{eligibleDiagnostics.map((item) => <option key={item.enrollmentId ?? item.studentId ?? item.courseId ?? "eligible"} value={item.enrollmentId ?? ""}>{item.studentName} — {item.courseTitle} — {item.progressPercentage} % — {item.completedLessons}/{item.totalLessons} leçons — Certificat non généré</option>)}</select><button className="rounded-xl bg-emerald-700 px-4 py-2 text-white">Générer le certificat</button></div>
        ) : (
          <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Aucun étudiant éligible trouvé. Vérifiez que les leçons sont bien marquées comme complétées et que la progression atteint 100 %.</p>
        )}
        <p className="mt-2 text-sm text-slate-500">L’action réutilise la fonction idempotente : un enrollment ne peut recevoir qu’un seul certificat actif ou brouillon.</p>
      </form>

      <section className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-emerald-950">Diagnostic progression / certificats</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500"><tr><th className="p-2">Étudiant</th><th className="p-2">Cours</th><th className="p-2">Progression</th><th className="p-2">Enrollment</th><th className="p-2">completed_at</th><th className="p-2">Certificat</th><th className="p-2">Éligible</th><th className="p-2">Raison</th></tr></thead>
            <tbody>{diagnostics.map((item) => <tr key={item.enrollmentId ?? `${item.studentId}-${item.courseId}`} className="border-t"><td className="p-2">{item.studentName}</td><td className="p-2">{item.courseTitle}</td><td className="p-2">{item.progressPercentage} % ({item.completedLessons}/{item.totalLessons})</td><td className="p-2">{item.enrollmentStatus ?? "—"}</td><td className="p-2">{item.completedAt ? new Date(item.completedAt).toLocaleDateString("fr-FR") : "—"}</td><td className="p-2">{item.certificateId ? `${item.certificateId} (${item.certificateStatus})` : "Aucun"}</td><td className="p-2">{item.isEligible ? "Oui" : "Non"}</td><td className="p-2">{item.reason ?? "—"}</td></tr>)}</tbody>
          </table>
          {diagnostics.length === 0 ? <p className="text-sm text-slate-500">Aucun enrollment actif ou complété à diagnostiquer.</p> : null}
        </div>
      </section>

      <div className="mt-8 space-y-3">{((certificates.data ?? []) as AcademyCertificate[]).map((c) => <div key={c.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><b>{c.certificate_id}</b><p>{c.student_full_name} — {c.course_title} — {c.status}</p><div className="mt-2 flex flex-wrap gap-3"><Link className="text-emerald-700" href={`/certificats/verifier/${c.certificate_id}`}>Page publique</Link>{c.status !== "revoked" && <form action={revokeCertificate}><input type="hidden" name="id" value={c.id} /><button className="text-sm text-red-700">Révoquer</button></form>}</div></div>)}</div>
    </div>
  );
}
