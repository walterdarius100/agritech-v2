import Link from "next/link";

import { CertificateTemplate } from "@/components/academy/CertificateTemplate";
import { requireStudent } from "@/lib/academy/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyCertificate } from "@/types/academy";

export default async function StudentCertificatesPage() {
  const user = await requireStudent();
  const supabase = createSupabaseAdminClient();
  const { data } = supabase
    ? await supabase.from("academy_certificates").select("*").eq("student_id", user.id).order("issued_at", { ascending: false })
    : { data: [] };
  const certificates = (data ?? []) as AcademyCertificate[];

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold text-emerald-950">Mes certificats</h1>
      <div className="mt-8 space-y-6">{certificates.map((certificate) => <article key={certificate.id} className="rounded-2xl border p-5"><CertificateTemplate studentName={certificate.student_full_name} courseTitle={certificate.course_title} issuedAt={certificate.issued_at} certificateId={certificate.certificate_id} verificationUrl={certificate.verification_url ?? `/certificats/verifier/${certificate.certificate_id}`} qrCode={certificate.qr_code_url} /><div className="mt-4 flex flex-wrap gap-4"><span className="text-sm">Statut : {certificate.status}</span><Link className="font-semibold text-emerald-700" href={`/certificats/verifier/${certificate.certificate_id}`}>Voir / vérifier</Link>{certificate.pdf_url ? <a className="text-emerald-700" href={certificate.pdf_url}>Télécharger PDF</a> : null}</div></article>)}{certificates.length === 0 ? <p>Aucun certificat émis pour le moment.</p> : null}</div>
    </main>
  );
}
