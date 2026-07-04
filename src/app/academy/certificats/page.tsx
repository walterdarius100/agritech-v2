import Link from "next/link";
import { requireStudent } from "@/lib/academy/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyCertificate } from "@/types/academy";

const labels = { valid: "Valide", revoked: "Révoqué", draft: "Brouillon" };

export default async function StudentCertificatesPage() {
  const user = await requireStudent();
  const supabase = createSupabaseAdminClient();
  const { data } = supabase
    ? await supabase.from("academy_certificates").select("*").eq("student_id", user.id).order("issued_at", { ascending: false })
    : { data: [] };
  const certs = (data ?? []) as AcademyCertificate[];

  return <main className="mx-auto max-w-5xl px-4 py-12"><h1 className="text-4xl font-bold text-emerald-950">Mes certificats</h1><div className="mt-8 space-y-4">{certs.map((cert) => <article key={cert.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex flex-col justify-between gap-4 md:flex-row"><div><h2 className="text-xl font-bold text-emerald-950">{cert.course_title}</h2><p className="mt-2 text-slate-600">Certificat délivré le {new Date(cert.issued_at).toLocaleDateString("fr-FR")}</p><p className="mt-1 text-sm font-semibold">ID : {cert.certificate_id}</p><p className="mt-1 text-sm">Statut : {labels[cert.status]}</p></div><div className="flex flex-wrap items-center gap-3"><Link className="rounded-xl bg-emerald-700 px-4 py-2 text-white" href={`/academy/certificats/${cert.certificate_id}`}>Voir le certificat</Link>{cert.pdf_url ? <a className="rounded-xl border px-4 py-2" href={cert.pdf_url}>Télécharger PDF</a> : <span className="rounded-xl border px-4 py-2 text-sm text-slate-500">PDF bientôt disponible</span>}<Link className="rounded-xl border px-4 py-2 text-emerald-700" href={`/certificats/verifier/${cert.certificate_id}`}>Vérifier</Link></div></div></article>)}{certs.length === 0 && <p>Aucun certificat émis pour le moment.</p>}</div></main>;
}
