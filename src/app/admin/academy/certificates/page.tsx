import Link from "next/link";

import { createCertificate, revokeCertificate } from "@/lib/academy/admin";
import type { AcademyCertificate } from "@/types/academy";
import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type EnrollmentOption = { id: string; status: string; student_id: string; course_id: string; profiles?: { full_name: string | null } | { full_name: string | null }[] | null; academy_courses?: { title: string | null } | { title: string | null }[] | null };

function firstRelation<T>(value: T | T[] | null | undefined) { return Array.isArray(value) ? value[0] : value; }

export default async function CertificatesAdmin({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  await requireAuthorizedAdmin();
  const params = (await searchParams) ?? {};
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  let certificatesQuery = supabase.from("academy_certificates").select("*").order("issued_at", { ascending: false });
  if (params.status) certificatesQuery = certificatesQuery.eq("status", params.status);
  if (params.student) certificatesQuery = certificatesQuery.eq("student_id", params.student);
  if (params.course) certificatesQuery = certificatesQuery.eq("course_id", params.course);

  const [certificates, courses, profiles, enrollments] = await Promise.all([
    certificatesQuery,
    supabase.from("academy_courses").select("id,title").order("title"),
    supabase.from("profiles").select("id,full_name").order("full_name"),
    supabase
      .from("academy_enrollments")
      .select("id,status,student_id,course_id,profiles(full_name),academy_courses(title)")
      .in("status", ["active", "completed"])
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Certificats Academy</h1>
      <form className="mt-6 grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200 md:grid-cols-4">
        <select name="student" defaultValue={params.student ?? ""} className="rounded border p-2"><option value="">Tous les étudiants</option>{(profiles.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.full_name ?? p.id}</option>)}</select>
        <select name="course" defaultValue={params.course ?? ""} className="rounded border p-2"><option value="">Toutes les formations</option>{(courses.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
        <select name="status" defaultValue={params.status ?? ""} className="rounded border p-2"><option value="">Tous les statuts</option><option value="valid">Valide</option><option value="draft">Brouillon</option><option value="revoked">Révoqué</option></select>
        <button className="rounded-xl bg-emerald-700 px-4 py-2 text-white">Filtrer</button>
      </form>
      <form action={createCertificate} className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <label className="text-sm font-semibold">Générer manuellement après complétion</label>
        <div className="mt-2 flex gap-3"><select name="enrollmentId" required className="min-w-0 flex-1 rounded border p-2">{((enrollments.data ?? []) as unknown as EnrollmentOption[]).map((e) => <option key={e.id} value={e.id}>{firstRelation(e.profiles)?.full_name ?? e.student_id} — {firstRelation(e.academy_courses)?.title ?? e.course_id} ({e.status})</option>)}</select><button className="rounded-xl bg-emerald-700 px-4 py-2 text-white">Générer le certificat</button></div>
        <p className="mt-2 text-sm text-slate-500">L’action réutilise la fonction idempotente : un enrollment ne peut recevoir qu’un seul certificat.</p>
      </form>
      <div className="mt-8 space-y-3">{((certificates.data ?? []) as AcademyCertificate[]).map((c) => <div key={c.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><b>{c.certificate_id}</b><p>{c.student_full_name} — {c.course_title} — {c.status}</p><div className="mt-2 flex flex-wrap gap-3"><Link className="text-emerald-700" href={`/certificats/verifier/${c.certificate_id}`}>Page publique</Link>{c.status !== "revoked" && <form action={revokeCertificate}><input type="hidden" name="id" value={c.id} /><button className="text-sm text-red-700">Révoquer</button></form>}</div></div>)}</div>
    </div>
  );
}
