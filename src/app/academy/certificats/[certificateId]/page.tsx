import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CertificateTemplate } from "@/components/academy/certificates/CertificateTemplate";
import { PrintCertificateButton } from "@/components/academy/certificates/PrintCertificateButton";
import { getCurrentStudentUser } from "@/lib/academy/auth";
import { getCurrentAdminUser } from "@/lib/auth/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyCertificate } from "@/types/academy";

type CertificateVisualPageProps = {
  params: Promise<{ certificateId: string }>;
};

export default async function CertificateVisualPage({ params }: CertificateVisualPageProps) {
  const { certificateId } = await params;
  const decodedCertificateId = decodeURIComponent(certificateId);
  const [studentUser, adminState] = await Promise.all([getCurrentStudentUser(), getCurrentAdminUser()]);
  const isAdmin = Boolean(adminState.user && adminState.isAuthorized);

  if (!studentUser && !isAdmin) {
    redirect("/academy/login");
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) notFound();

  const { data } = await supabase
    .from("academy_certificates")
    .select("*")
    .eq("certificate_id", decodedCertificateId)
    .maybeSingle();

  const certificate = data as AcademyCertificate | null;
  if (!certificate) notFound();

  const isOwner = Boolean(studentUser && certificate.student_id === studentUser.id);
  if (!isOwner && !isAdmin) notFound();

  return (
    <main className="min-h-screen bg-[#f8faf7] px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto mb-6 flex max-w-6xl flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <Link className="font-semibold text-emerald-700" href={isAdmin ? "/admin/academy/certificates" : "/academy/certificats"}>
            ← Retour aux certificats
          </Link>
          <h1 className="mt-3 text-3xl font-black text-emerald-950">Certificat de formation</h1>
          <p className="mt-1 text-slate-600">Prévisualisez le certificat puis utilisez l’impression du navigateur pour l’enregistrer en PDF.</p>
        </div>
        <PrintCertificateButton />
      </div>

      {certificate.status === "revoked" ? (
        <div className="mx-auto mb-4 max-w-6xl rounded-2xl bg-red-50 p-4 font-semibold text-red-800 ring-1 ring-red-100 print:hidden">
          Ce certificat est révoqué. Il est affiché uniquement pour consultation et ne doit pas être présenté comme valide.
        </div>
      ) : null}

      <CertificateTemplate
        studentName={certificate.student_full_name}
        courseTitle={certificate.course_title}
        certificateId={certificate.certificate_id}
        issuedAt={certificate.issued_at}
        verificationUrl={certificate.verification_url}
        status={certificate.status}
      />

      <p className="mx-auto mt-5 max-w-6xl text-sm text-slate-600 print:hidden">
        Pour obtenir un PDF, cliquez sur « Imprimer / Enregistrer en PDF », puis choisissez « Enregistrer en PDF » dans la boîte d’impression de votre navigateur.
      </p>
    </main>
  );
}
