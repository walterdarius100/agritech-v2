import Link from "next/link";

import { CertificateTemplate } from "@/components/academy/CertificateTemplate";
import { requireStudent } from "@/lib/academy/auth";
import { getCourseCompletionStatus } from "@/lib/academy/certificates";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyCertificate } from "@/types/academy";

export default async function StudentCertificatesPage() {
  const user = await requireStudent();
  const supabase = createSupabaseAdminClient();
  const [{ data }, { data: enrollments }] = supabase
    ? await Promise.all([
        supabase.from("academy_certificates").select("*").eq("student_id", user.id).order("issued_at", { ascending: false }),
        supabase.from("academy_enrollments").select("id,course_id,academy_courses(title)").eq("student_id", user.id).in("status", ["active", "completed"]),
      ])
    : [{ data: [] }, { data: [] }];
  const certificates = (data ?? []) as AcademyCertificate[];
  const certificateEnrollmentIds = new Set(certificates.map((certificate) => certificate.enrollment_id).filter(Boolean));
  const completedWithoutCertificate = (
    await Promise.all(
      ((enrollments ?? []) as { id: string; course_id: string; academy_courses?: { title: string | null } | { title: string | null }[] | null }[]).map(async (enrollment) => {
        if (certificateEnrollmentIds.has(enrollment.id)) return null;
        const completion = await getCourseCompletionStatus(enrollment.id);
        if (!completion.isCompleted) return null;
        const course = Array.isArray(enrollment.academy_courses) ? enrollment.academy_courses[0] : enrollment.academy_courses;
        return { id: enrollment.id, courseTitle: course?.title ?? enrollment.course_id, completion };
      }),
    )
  ).filter((item): item is { id: string; courseTitle: string; completion: Awaited<ReturnType<typeof getCourseCompletionStatus>> } => Boolean(item));

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold text-emerald-950">Mes certificats</h1>
      <div className="mt-8 space-y-6">{certificates.map((certificate) => <article key={certificate.id} className="rounded-2xl border p-5"><CertificateTemplate studentName={certificate.student_full_name} courseTitle={certificate.course_title} issuedAt={certificate.issued_at} certificateId={certificate.certificate_id} verificationUrl={certificate.verification_url ?? `/certificats/verifier/${certificate.certificate_id}`} qrCode={certificate.qr_code_url} /><div className="mt-4 flex flex-wrap gap-4"><span className="text-sm">Statut : {certificate.status}</span><Link className="font-semibold text-emerald-700" href={`/certificats/verifier/${certificate.certificate_id}`}>Voir / vérifier</Link>{certificate.pdf_url ? <a className="text-emerald-700" href={certificate.pdf_url}>Télécharger PDF</a> : null}</div></article>)}{completedWithoutCertificate.map((item) => <p key={item.id} className="rounded-2xl bg-amber-50 p-4 text-amber-900">Vous avez terminé la formation {item.courseTitle}. Votre certificat est en cours de génération ou de validation.</p>)}{certificates.length === 0 && completedWithoutCertificate.length === 0 ? <p>Aucun certificat émis pour le moment.</p> : null}</div>
    </main>
  );
}
