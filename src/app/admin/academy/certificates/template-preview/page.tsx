import Link from "next/link";

import { AgriTechCertificateTemplate } from "@/components/academy/certificates/AgriTechCertificateTemplate";
import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";

export default async function CertificateTemplatePreviewPage() {
  await requireAuthorizedAdmin();

  return (
    <main className="space-y-6">
      <div className="print:hidden">
        <Link className="text-sm font-semibold text-emerald-800" href="/admin/academy/certificates">
          ← Retour aux certificats
        </Link>
        <div className="mt-3 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">Prévisualisation interne</p>
          <h1 className="mt-2 text-3xl font-black text-emerald-950">Template officiel Agri-tech statique</h1>
          <p className="mt-2 text-slate-600">
            Cette page admin sert uniquement à ajuster la reproduction visuelle HTML/CSS du modèle officiel avec des données de démonstration. Elle ne remplace pas le template réel utilisé par les certificats générés.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-slate-100 p-6 print:overflow-visible print:rounded-none print:bg-white print:p-0">
        <AgriTechCertificateTemplate />
      </div>
    </main>
  );
}
