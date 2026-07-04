import Link from "next/link";
import type { AcademyCertificate } from "@/types/academy";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  const cert = data as Pick<AcademyCertificate, "certificate_id" | "student_full_name" | "course_title" | "issued_at" | "status"> | null;

  return <main className="min-h-screen bg-[#f8faf7] px-4 py-16"><div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 ring-1 ring-emerald-100">{!cert ? <><h1 className="text-3xl font-bold text-red-700">Certificat introuvable</h1><p className="mt-3 text-slate-600">Aucun certificat valide ne correspond à cet identifiant.</p></> : cert.status === "revoked" ? <><h1 className="text-3xl font-bold text-orange-700">Certificat révoqué</h1><p className="mt-3">Ce certificat n’est plus valide.</p><p className="mt-3 text-sm text-slate-600">Identifiant : {cert.certificate_id}</p></> : cert.status !== "valid" ? <><h1 className="text-3xl font-bold text-slate-700">Certificat non officiel</h1><p className="mt-3">Ce certificat n’est pas actuellement vérifiable comme certificat officiel.</p></> : <><p className="font-bold uppercase tracking-widest text-emerald-700">Certificat valide</p><h1 className="mt-3 text-3xl font-bold text-emerald-950">{cert.student_full_name}</h1><p className="mt-4 text-slate-700">Ce certificat a été délivré par Agri-tech / WAL AGRITECH à {cert.student_full_name} pour la formation {cert.course_title}.</p><dl className="mt-6 space-y-3"><div><dt className="text-sm text-slate-500">Formation suivie</dt><dd className="font-semibold">{cert.course_title}</dd></div><div><dt className="text-sm text-slate-500">Date de délivrance</dt><dd>{new Date(cert.issued_at).toLocaleDateString("fr-FR")}</dd></div><div><dt className="text-sm text-slate-500">Identifiant public</dt><dd>{cert.certificate_id}</dd></div><div><dt className="text-sm text-slate-500">Structure émettrice</dt><dd>Agri-tech / WAL AGRITECH</dd></div></dl></>}<Link className="mt-8 inline-flex text-emerald-700 font-semibold" href="/certificats/verifier">Nouvelle vérification</Link></div></main>;
}
