import Link from "next/link";

import { formatFrenchDate, getCertificateStatusLabel } from "@/lib/academy/certificate-display";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyCertificate } from "@/types/academy";

type CertificateResult = Pick<AcademyCertificate, "certificate_id" | "student_full_name" | "course_title" | "issued_at" | "status">;

export default async function CertificateResultPage({ params }: { params: Promise<{ certificateId: string }> }) {
  const { certificateId } = await params;
  const supabase = createSupabaseAdminClient();
  const { data } = supabase
    ? await supabase
        .from("academy_certificates")
        .select("certificate_id,student_full_name,course_title,issued_at,status")
        .eq("certificate_id", decodeURIComponent(certificateId))
        .maybeSingle()
    : { data: null };
  const certificate = data as CertificateResult | null;
  const isValid = certificate?.status === "issued" || certificate?.status === "valid";

  return (
    <main className="min-h-screen bg-[#f8faf7] px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 ring-1 ring-emerald-100">
        {!certificate ? (
          <>
            <h1 className="text-3xl font-bold text-red-700">Certificat introuvable</h1>
            <p className="mt-3 text-slate-600">Aucun certificat ne correspond à cet identifiant.</p>
          </>
        ) : !isValid ? (
          <>
            <h1 className="text-3xl font-bold text-orange-700">{certificate.status === "revoked" ? "Certificat révoqué" : getCertificateStatusLabel(certificate.status)}</h1>
            <p className="mt-3">Identifiant : {certificate.certificate_id}</p>
            <p className="mt-3 text-slate-600">{certificate.status === "revoked" ? "Ce certificat n’est plus valide." : "Ce certificat n’est pas actuellement valide."}</p>
          </>
        ) : (
          <>
            <p className="font-bold uppercase tracking-widest text-emerald-700">Certificat valide</p>
            <h1 className="mt-3 text-3xl font-bold text-emerald-950">{certificate.student_full_name}</h1>
            <p className="mt-3 text-slate-700">
              Ce certificat a été délivré par Agri-tech Academy à {certificate.student_full_name} pour la formation « {certificate.course_title} ».
            </p>
            <dl className="mt-6 space-y-3">
              <div>
                <dt className="text-sm text-slate-500">Formation suivie</dt>
                <dd className="font-semibold">{certificate.course_title}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Date d’émission</dt>
                <dd>{formatFrenchDate(certificate.issued_at)}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Identifiant</dt>
                <dd>{certificate.certificate_id}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Structure émettrice</dt>
                <dd>Agri-tech / WAL AGRITECH</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Statut</dt>
                <dd>{getCertificateStatusLabel(certificate.status)}</dd>
              </div>
            </dl>
          </>
        )}
        <Link className="mt-8 inline-flex font-semibold text-emerald-700" href="/certificats/verifier">
          Nouvelle vérification
        </Link>
      </div>
    </main>
  );
}
