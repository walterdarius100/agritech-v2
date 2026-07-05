import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AcademyCertificate } from "@/types/academy";

export default async function CertificateResultPage({ params }: { params: Promise<{ certificateId: string }> }) {
  const { certificateId } = await params;
  const supabase = createSupabaseServerClient();
  const { data } = supabase
    ? await supabase
        .from("academy_certificates")
        .select("certificate_id,student_full_name,course_title,issued_at,status")
        .eq("certificate_id", decodeURIComponent(certificateId))
        .maybeSingle()
    : { data: null };
  const certificate = data as Pick<AcademyCertificate, "certificate_id" | "student_full_name" | "course_title" | "issued_at" | "status"> | null;

  return (
    <main className="min-h-screen bg-[#f8faf7] px-4 py-16"><div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 ring-1 ring-emerald-100">{!certificate ? <><h1 className="text-3xl font-bold text-red-700">Certificat introuvable</h1><p className="mt-3 text-slate-600">Aucun certificat ne correspond à cet identifiant.</p></> : certificate.status === "revoked" ? <><h1 className="text-3xl font-bold text-orange-700">Certificat révoqué</h1><p className="mt-3">Ce certificat n’est plus valide.</p><p className="mt-3 text-sm">Identifiant : {certificate.certificate_id}</p></> : certificate.status === "valid" ? <><p className="font-bold uppercase tracking-widest text-emerald-700">Certificat valide</p><h1 className="mt-3 text-3xl font-bold text-emerald-950">{certificate.student_full_name}</h1><p className="mt-4 text-slate-700">Ce certificat a été délivré par Agri-tech à {certificate.student_full_name} pour la formation {certificate.course_title}.</p><dl className="mt-6 space-y-3"><div><dt className="text-sm text-slate-500">Formation</dt><dd className="font-semibold">{certificate.course_title}</dd></div><div><dt className="text-sm text-slate-500">Date de délivrance</dt><dd>{new Date(certificate.issued_at).toLocaleDateString("fr-FR")}</dd></div><div><dt className="text-sm text-slate-500">ID du certificat</dt><dd>{certificate.certificate_id}</dd></div><div><dt className="text-sm text-slate-500">Structure émettrice</dt><dd>Agri-tech / WAL AGRITECH</dd></div></dl></> : <><h1 className="text-3xl font-bold text-slate-700">Certificat en brouillon</h1><p className="mt-3">Ce certificat est préparé mais pas encore officiel.</p></>}<Link className="mt-8 inline-flex font-semibold text-emerald-700" href="/certificats/verifier">Nouvelle vérification</Link></div></main>
  );
}
