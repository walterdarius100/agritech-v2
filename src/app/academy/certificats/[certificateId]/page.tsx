import { notFound } from "next/navigation";
import { CertificateTemplate } from "@/components/academy/certificates/CertificateTemplate";
import { requireStudent } from "@/lib/academy/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyCertificate } from "@/types/academy";

export default async function CertificatePrintPage({ params }: { params: Promise<{ certificateId: string }> }) {
  const user = await requireStudent();
  const { certificateId } = await params;
  const supabase = createSupabaseAdminClient();
  const { data } = supabase
    ? await supabase.from("academy_certificates").select("*").eq("student_id", user.id).eq("certificate_id", decodeURIComponent(certificateId)).maybeSingle()
    : { data: null };
  if (!data) notFound();
  const cert = data as AcademyCertificate;
  return <main className="min-h-screen bg-slate-100 px-4 py-10 print:bg-white"><CertificateTemplate studentName={cert.student_full_name} courseTitle={cert.course_title} issuedAt={cert.issued_at} certificateId={cert.certificate_id} verificationUrl={cert.verification_url ?? ""} qrCode={cert.qr_code_url} /><div className="mx-auto mt-6 max-w-5xl text-center print:hidden"><p className="text-sm text-slate-500">Utilisez l’option d’impression du navigateur pour exporter ce certificat en PDF.</p></div></main>;
}
