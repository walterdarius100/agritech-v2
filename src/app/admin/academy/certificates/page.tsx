import Link from "next/link";

import { createCertificate, generateCertificateForEnrollment, revokeCertificate } from "@/lib/academy/admin";
import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyCertificate } from "@/types/academy";

type CourseOption = { id: string; title: string };
type ProfileOption = { id: string; full_name: string | null };
type EnrollmentOption = { id: string; status: string; student_id: string; course_id: string; profiles?: ProfileOption | null; academy_courses?: CourseOption | null };

const labels = { valid: "Valide", revoked: "Révoqué", draft: "Brouillon" } as const;

export default async function CertificatesAdmin({ searchParams }: { searchParams: Promise<{ course?: string; student?: string; status?: string }> }) {
  await requireAuthorizedAdmin();
  const filters = await searchParams;
  const supabase = createSupabaseAdminClient();
  const [certsResult, coursesResult, profilesResult, enrollmentsResult] = supabase
    ? await Promise.all([
        supabase.from("academy_certificates").select("*").order("issued_at", { ascending: false }),
        supabase.from("academy_courses").select("id,title").order("title"),
        supabase.from("profiles").select("id,full_name").order("full_name"),
        supabase.from("academy_enrollments").select("id,status,student_id,course_id,profiles(full_name),academy_courses(title)").in("status", ["active", "completed"]).order("created_at", { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

  const courses = (coursesResult.data ?? []) as CourseOption[];
  const profiles = (profilesResult.data ?? []) as ProfileOption[];
  const enrollments = (enrollmentsResult.data ?? []) as unknown as EnrollmentOption[];
  const certificates = ((certsResult.data ?? []) as AcademyCertificate[]).filter(
    (cert) => (!filters.course || cert.course_id === filters.course) && (!filters.student || cert.student_id === filters.student) && (!filters.status || cert.status === filters.status),
  );

  return <div><h1 className="text-3xl font-bold">Certificats Academy</h1><form className="mt-6 grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200 md:grid-cols-3"><select name="course" defaultValue={filters.course ?? ""} className="rounded border p-2"><option value="">Toutes les formations</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select><select name="student" defaultValue={filters.student ?? ""} className="rounded border p-2"><option value="">Tous les étudiants</option>{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.full_name ?? profile.id}</option>)}</select><select name="status" defaultValue={filters.status ?? ""} className="rounded border p-2"><option value="">Tous les statuts</option><option value="valid">Valide</option><option value="revoked">Révoqué</option><option value="draft">Brouillon</option></select><button className="rounded-xl bg-slate-900 px-4 py-2 text-white md:col-span-3">Filtrer</button></form><section className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-slate-200"><h2 className="text-xl font-bold">Génération manuelle depuis une inscription terminée</h2><form action={generateCertificateForEnrollment} className="mt-4 flex flex-col gap-3 md:flex-row"><select name="enrollmentId" required className="min-w-0 flex-1 rounded border p-2">{enrollments.map((enrollment) => <option key={enrollment.id} value={enrollment.id}>{enrollment.profiles?.full_name ?? enrollment.student_id} — {enrollment.academy_courses?.title ?? enrollment.course_id} ({enrollment.status})</option>)}</select><button className="rounded-xl bg-emerald-700 px-4 py-2 text-white">Générer le certificat</button></form><p className="mt-2 text-sm text-slate-500">La génération utilise la même fonction idempotente et refuse les formations non terminées.</p></section><details className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-slate-200"><summary className="cursor-pointer font-bold">Émission manuelle exceptionnelle</summary><form action={createCertificate} className="mt-4 grid gap-3 md:grid-cols-2"><select name="studentId" required className="rounded border p-2">{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.full_name ?? profile.id}</option>)}</select><select name="courseId" required className="rounded border p-2">{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select><input name="studentFullName" required placeholder="Nom sur certificat" className="rounded border p-2" /><input name="courseTitle" required placeholder="Titre de la formation" className="rounded border p-2" /><button className="rounded-xl bg-emerald-700 px-4 py-2 text-white md:col-span-2">Émettre le certificat</button></form></details><div className="mt-8 space-y-3">{certificates.map((cert) => <div key={cert.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="flex flex-col justify-between gap-3 md:flex-row"><div><b>{cert.certificate_id}</b><p>{cert.student_full_name} — {cert.course_title}</p><p className="text-sm text-slate-600">{labels[cert.status]} — {new Date(cert.issued_at).toLocaleDateString("fr-FR")}</p></div><div className="flex flex-wrap gap-3"><Link className="text-emerald-700" href={`/certificats/verifier/${cert.certificate_id}`}>Vérifier</Link>{cert.status === "valid" && <form action={revokeCertificate}><input type="hidden" name="id" value={cert.id} /><button className="text-sm text-red-700">Révoquer</button></form>}</div></div></div>)}{certificates.length === 0 && <p>Aucun certificat ne correspond aux filtres.</p>}</div></div>;
}
