import { generateManualCertificateForEnrollment, revokeCertificate } from "@/lib/academy/admin";
import { getCompletedEnrollmentsEligibleForCertificates } from "@/lib/academy/certificates";
import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyCertificate } from "@/types/academy";

type CertificatesAdminProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR");
}

function getGenerationSource(certificate: AcademyCertificate) {
  const source = certificate.metadata?.generation_source ?? certificate.metadata?.generation_mode;
  if (source === "automatic") return "Automatique";
  if (source === "manual" || source === "manual_admin") return "Manuel";
  return "—";
}

export default async function CertificatesAdmin({ searchParams }: CertificatesAdminProps) {
  await requireAuthorizedAdmin();
  const params = await searchParams;
  const supabase = createSupabaseAdminClient();
  const [{ data: certificateRows }, eligibleEnrollments] = supabase
    ? await Promise.all([
        supabase.from("academy_certificates").select("*").order("issued_at", { ascending: false }),
        getCompletedEnrollmentsEligibleForCertificates(),
      ])
    : [{ data: [] }, []];

  const certificates = (certificateRows ?? []) as AcademyCertificate[];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Certificats Academy</h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Suivi des certificats générés manuellement ou automatiquement après complétion réelle d’une formation.
          </p>
        </div>
      </div>

      {params.error ? <div className="mt-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-800 ring-1 ring-red-100">{params.error}</div> : null}
      {params.success ? <div className="mt-6 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800 ring-1 ring-emerald-100">{params.success}</div> : null}

      <section className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-emerald-950">Générer manuellement un certificat</h2>
            <p className="mt-1 text-sm text-slate-600">
              Un étudiant est éligible lorsque toutes les leçons publiées sont terminées et qu’aucun certificat actif n’existe déjà pour cet enrollment.
            </p>
          </div>
        </div>

        {eligibleEnrollments.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">Étudiant</th>
                  <th className="p-3">Formation</th>
                  <th className="p-3">Progression</th>
                  <th className="p-3">Leçons</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {eligibleEnrollments.map((eligibility) => (
                  <tr key={eligibility.enrollmentId} className="border-t">
                    <td className="p-3 font-semibold">{eligibility.studentName ?? "Étudiant Academy"}</td>
                    <td className="p-3">{eligibility.courseTitle}</td>
                    <td className="p-3 font-bold text-emerald-800">{eligibility.progressPercentage} %</td>
                    <td className="p-3">
                      {eligibility.completedPublishedLessons}/{eligibility.totalPublishedLessons} leçons
                    </td>
                    <td className="p-3">
                      <form action={generateManualCertificateForEnrollment}>
                        <input type="hidden" name="enrollmentId" value={eligibility.enrollmentId} />
                        <button className="rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800">
                          Générer le certificat
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-slate-600">
            Aucun étudiant éligible pour le moment. Un étudiant devient éligible lorsque toutes les leçons publiées d’une formation sont terminées et qu’aucun certificat actif n’existe déjà pour cet enrollment.
          </p>
        )}
      </section>

      <section className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-emerald-950">Certificats générés</h2>
        {certificates.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">Identifiant</th>
                  <th className="p-3">Étudiant</th>
                  <th className="p-3">Formation</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">Délivré le</th>
                  <th className="p-3">Enrollment</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((certificate) => (
                  <tr key={certificate.id} className="border-t align-top">
                    <td className="p-3 font-mono text-xs font-bold">{certificate.certificate_id}</td>
                    <td className="p-3">{certificate.student_full_name}</td>
                    <td className="p-3">{certificate.course_title}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800">{certificate.status}</span>
                    </td>
                    <td className="p-3">{formatDate(certificate.issued_at)}</td>
                    <td className="p-3 font-mono text-xs">{certificate.enrollment_id ?? "—"}</td>
                    <td className="p-3">{getGenerationSource(certificate)}</td>
                    <td className="p-3">
                      <a className="font-semibold text-emerald-700" href={`/certificats/verifier/${certificate.certificate_id}`}>
                        Vérifier
                      </a>
                      {["issued", "valid", "draft"].includes(certificate.status) ? (
                        <form action={revokeCertificate} className="mt-2">
                          <input type="hidden" name="id" value={certificate.id} />
                          <button className="text-sm font-semibold text-red-700">Révoquer</button>
                        </form>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-slate-600">Aucun certificat généré pour le moment.</p>
        )}
      </section>
    </div>
  );
}
