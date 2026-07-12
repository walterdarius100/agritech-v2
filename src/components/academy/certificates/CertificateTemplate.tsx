import type { CertificateStatus } from "@/types/academy";

export type CertificateTemplateProps = {
  studentName: string;
  courseTitle: string;
  certificateId: string;
  issuedAt: string;
  verificationUrl?: string | null;
  status?: CertificateStatus | string;
  organizationName?: string;
};

function formatCertificateDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

function statusLabel(status?: string) {
  if (status === "revoked") return "Certificat révoqué";
  if (status === "draft") return "Brouillon";
  if (status === "expired") return "Expiré";
  return "Certificat valide";
}

export function CertificateTemplate({
  studentName,
  courseTitle,
  certificateId,
  issuedAt,
  verificationUrl,
  status = "valid",
  organizationName = "Agri-tech / WAL AGRITECH",
}: CertificateTemplateProps) {
  const isRevoked = status === "revoked";
  const isDraft = status === "draft";

  return (
    <article className="certificate-print-area relative mx-auto aspect-[1.414/1] w-full max-w-6xl overflow-hidden bg-[#fffdf4] p-4 text-emerald-950 shadow-2xl ring-1 ring-emerald-100 print:shadow-none print:ring-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.20),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(5,150,105,0.16),transparent_30%)]" />
      <div className="relative flex h-full flex-col border-[10px] border-double border-emerald-800/80 bg-white/70 p-8 text-center sm:p-10">
        {(isRevoked || isDraft) && (
          <div className="pointer-events-none absolute inset-0 flex rotate-[-18deg] items-center justify-center text-6xl font-black uppercase tracking-[0.25em] text-red-700/10 sm:text-8xl">
            {isRevoked ? "Révoqué" : "Brouillon"}
          </div>
        )}

        <header className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.45em] text-emerald-700">{organizationName}</p>
          <div className="mx-auto mt-4 h-1 w-40 rounded-full bg-yellow-500" />
          <h1 className="mt-6 text-4xl font-black uppercase tracking-[0.18em] text-emerald-950 sm:text-6xl">Certificat</h1>
          <p className="mt-2 text-lg font-semibold uppercase tracking-[0.35em] text-slate-600">de formation</p>
        </header>

        <main className="relative z-10 flex flex-1 flex-col items-center justify-center py-8">
          <p className="text-base font-medium text-slate-600 sm:text-lg">Ce certificat est décerné à</p>
          <h2 className="mt-4 max-w-4xl break-words border-b-2 border-yellow-500/70 px-6 pb-3 text-4xl font-black text-emerald-950 sm:text-6xl">
            {studentName}
          </h2>
          <p className="mt-8 max-w-3xl text-base leading-8 text-slate-700 sm:text-xl">
            pour avoir complété avec succès la formation
          </p>
          <h3 className="mt-4 max-w-4xl break-words text-2xl font-black text-emerald-800 sm:text-4xl">{courseTitle}</h3>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-700 sm:text-lg">
            délivrée par <strong>{organizationName}</strong>, en reconnaissance des compétences acquises dans le cadre du programme Agri-tech Academy.
          </p>
        </main>

        <footer className="relative z-10 grid gap-6 border-t border-emerald-900/15 pt-6 text-left text-sm text-slate-700 sm:grid-cols-3">
          <div>
            <p className="font-bold uppercase tracking-widest text-emerald-800">Date de délivrance</p>
            <p className="mt-2 font-semibold">{formatCertificateDate(issuedAt)}</p>
          </div>
          <div className="text-left sm:text-center">
            <p className="font-bold uppercase tracking-widest text-emerald-800">Direction Agri-tech</p>
            <div className="mx-0 mt-8 h-px w-48 bg-slate-400 sm:mx-auto" />
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest">Signature autorisée</p>
          </div>
          <div className="sm:text-right">
            <p className="font-bold uppercase tracking-widest text-emerald-800">Identifiant public</p>
            <p className="mt-2 break-words font-mono text-xs font-bold text-slate-900">{certificateId}</p>
            <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${isRevoked ? "bg-red-100 text-red-800" : isDraft ? "bg-yellow-100 text-yellow-800" : "bg-emerald-100 text-emerald-800"}`}>
              {statusLabel(status)}
            </p>
          </div>
        </footer>

        <div className="relative z-10 mt-4 flex items-end justify-between gap-4 text-left text-xs text-slate-500">
          <p className="max-w-lg">Ce certificat peut être vérifié à partir de son identifiant public. Aucune information de paiement n’est affichée sur ce document.</p>
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-emerald-700/40 text-center text-[10px] font-bold uppercase tracking-wider text-emerald-700/70">
            Zone QR future
          </div>
        </div>
        {verificationUrl ? <p className="relative z-10 mt-2 break-all text-xs text-slate-500">Vérification : {verificationUrl}</p> : null}
      </div>
    </article>
  );
}
