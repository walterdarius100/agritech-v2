import Link from "next/link";

import { requireStudent } from "@/lib/academy/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { formatFrenchDate, getCertificateStatusLabel, toCertificateDisplayData, type CertificateWithRelations } from "@/lib/academy/certificate-display";

export default async function StudentCertificatesPage() {
  const user = await requireStudent();
  const supabase = createSupabaseAdminClient();
  const { data } = supabase
    ? await supabase
        .from("academy_certificates")
        .select("*, academy_courses(id,title,duration), academy_enrollments(id,created_at,validated_at,updated_at), profiles(full_name)")
        .eq("student_id", user.id)
        .order("issued_at", { ascending: false })
    : { data: [] };
  const certificates = ((data ?? []) as CertificateWithRelations[]).map(toCertificateDisplayData);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold text-emerald-950">Mes certificats</h1>
      <p className="mt-3 text-slate-600">Consultez, vérifiez et imprimez vos certificats Agri-tech Academy.</p>
      <div className="mt-8 space-y-4">
        {certificates.map((certificate) => (
          <article key={certificate.certificateId} className="rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-emerald-50">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-emerald-950">{certificate.courseTitle}</h2>
                <p className="mt-2 text-slate-700">{formatFrenchDate(certificate.issuedAt)}</p>
                <p className="mt-1 font-mono text-xs font-semibold text-slate-500">ID : {certificate.certificateId}</p>
                <p className="mt-2 text-sm font-semibold">Statut : {getCertificateStatusLabel(certificate.status)}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800" href={`/academy/certificats/${certificate.certificateId}`}>
                  Voir le certificat
                </Link>
                <Link className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 ring-1 ring-emerald-100" href={`/certificats/verifier/${certificate.certificateId}`}>
                  Vérifier
                </Link>
                <Link className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200" href={`/academy/certificats/${certificate.certificateId}`}>
                  Imprimer / PDF
                </Link>
              </div>
            </div>
          </article>
        ))}
        {certificates.length === 0 ? <p>Aucun certificat disponible pour le moment.</p> : null}
      </div>
    </main>
  );
}
