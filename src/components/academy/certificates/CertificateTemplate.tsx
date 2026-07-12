import type { CertificateStatus } from "@/types/academy";

export type CertificateTemplateProps = {
  studentName: string;
  courseTitle: string;
  certificateId: string;
  issuedAt: string;
  verificationUrl?: string | null;
  qrCodeUrl?: string | null;
  status?: CertificateStatus | string;
  organizationName?: string;
  courseDuration?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  issuedLocation?: string | null;
  signatoryName?: string;
  signatoryTitle?: string;
  projectName?: string | null;
  coveredTopics?: string[];
};

const DEFAULT_TOPICS = [
  "les notions techniques essentielles liées à la formation suivie ;",
  "les bonnes pratiques professionnelles et les standards de qualité ;",
  "les méthodes d’application terrain adaptées au contexte agricole ;",
  "l’évaluation des acquis et la validation de la participation.",
];

function formatCertificateDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

function formatOptionalDate(value?: string | null) {
  if (!value) return null;
  return formatCertificateDate(value);
}

function statusLabel(status?: string) {
  if (status === "revoked") return "Certificat révoqué";
  if (status === "draft") return "Brouillon";
  if (status === "expired") return "Expiré";
  return "Certificat valide";
}

function splitStudentName(studentName: string) {
  const parts = studentName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstLine: studentName, secondLine: "" };
  return { firstLine: parts.slice(0, -1).join(" "), secondLine: parts.at(-1) ?? "" };
}

function TrainingDates({ courseDuration, startDate, endDate }: Pick<CertificateTemplateProps, "courseDuration" | "startDate" | "endDate">) {
  const start = formatOptionalDate(startDate);
  const end = formatOptionalDate(endDate);
  const durationLabel = courseDuration || "selon le programme pédagogique validé";

  if (start && end) {
    return (
      <p>
        D’une durée de <strong>{durationLabel}</strong>, cette formation a été réalisée du <strong>{start}</strong> au <strong>{end}</strong>.
      </p>
    );
  }

  return (
    <p>
      D’une durée de <strong>{durationLabel}</strong>, cette formation a été réalisée conformément au programme pédagogique de WAL AGRITECH.
    </p>
  );
}

export function CertificateTemplate({
  studentName,
  courseTitle,
  certificateId,
  issuedAt,
  verificationUrl,
  qrCodeUrl,
  status = "valid",
  organizationName = "WAL AGRITECH",
  courseDuration,
  startDate,
  endDate,
  issuedLocation = "Fondwa",
  signatoryName = "Walter Darius",
  signatoryTitle = "Directeur Général",
  projectName,
  coveredTopics = DEFAULT_TOPICS,
}: CertificateTemplateProps) {
  const isRevoked = status === "revoked";
  const isDraft = status === "draft";
  const { firstLine, secondLine } = splitStudentName(studentName);
  const issuedDate = formatCertificateDate(issuedAt);
  const sideLabel = projectName || courseTitle;

  return (
    <article className="certificate-print-area mx-auto aspect-[1.414/1] w-full max-w-6xl overflow-hidden bg-white p-3 text-slate-950 shadow-2xl ring-1 ring-slate-200 print:shadow-none print:ring-0">
      <div className="relative grid h-full grid-cols-[minmax(0,1fr)_32%] overflow-hidden border-[3px] border-[#173c8f] bg-white">
        {(isRevoked || isDraft) && (
          <div className="pointer-events-none absolute inset-0 z-30 flex rotate-[-18deg] items-center justify-center text-6xl font-black uppercase tracking-[0.28em] text-red-700/10 sm:text-8xl">
            {isRevoked ? "Révoqué" : "Brouillon"}
          </div>
        )}

        <section className="flex min-w-0 flex-col px-8 py-7 text-left sm:px-12 sm:py-10">
          <p className="text-xl font-medium text-slate-900 sm:text-2xl">Agri-tech certifie que :</p>

          <div className="mt-4 text-[#123f93]">
            <h1 className="break-words text-5xl font-black leading-[0.92] tracking-tight sm:text-7xl">{firstLine}</h1>
            {secondLine ? <p className="mt-1 break-words text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-7xl">{secondLine}</p> : null}
          </div>

          <div className="mt-7 max-w-3xl space-y-4 text-[15px] leading-7 text-slate-950 sm:text-base">
            <p>
              A suivi avec succès la formation en <strong>{courseTitle}</strong>, organisée par <strong>{organizationName}</strong>, portant sur les compétences techniques et pratiques du programme Agri-tech Academy.
            </p>

            <div>
              <p className="font-bold">Cette formation a couvert notamment :</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                {coveredTopics.slice(0, 4).map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ol>
            </div>

            <TrainingDates courseDuration={courseDuration} startDate={startDate} endDate={endDate} />

            <p>En foi de quoi, ce certificat lui est délivré pour servir et valoir ce que de droit.</p>
            <p className="font-semibold">
              Fait à {issuedLocation || "Fondwa"}, le {issuedDate}
            </p>
          </div>

          <div className="mt-auto flex items-end justify-between gap-8 pt-7">
            <div className="min-w-[220px] text-center">
              <div className="mx-auto mb-1 h-10 w-44 rounded-full border border-dashed border-slate-300 text-xs italic leading-10 text-slate-400">Signature</div>
              <div className="border-t-2 border-slate-900 pt-2">
                <p className="text-lg font-black text-slate-950">{signatoryName}</p>
                <p className="text-sm font-semibold text-slate-700">{signatoryTitle}</p>
                <p className="text-sm font-black text-[#123f93]">{organizationName}</p>
              </div>
            </div>

            <div className="flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-[#123f93] text-center text-[10px] font-black uppercase leading-tight tracking-wider text-[#123f93]">
              Cachet<br />Agri-tech
            </div>
          </div>
        </section>

        <aside className="relative flex min-h-0 flex-col items-center bg-[#123f93] px-7 pb-10 pt-8 text-center text-white">
          <div className="absolute bottom-[-58px] left-0 h-28 w-full bg-white [clip-path:polygon(0_0,50%_100%,100%_0)]" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#123f93]">
              <span className="absolute -top-3 h-4 w-4 rounded-full bg-[#f59e0b]" />
              <span className="text-2xl font-black">Ag</span>
            </div>
            <p className="text-2xl font-black uppercase tracking-[0.18em]">Agri-tech</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/85">Formation • Innovation • Agriculture</p>
            <div className="my-8 h-px w-40 bg-white/80" />
            <p className="text-5xl font-black leading-none tracking-tight">Certificat</p>
            <p className="mt-3 text-2xl font-light tracking-wide">de participation</p>
            <div className="my-8 h-px w-40 bg-white/80" />
            <p className="text-2xl tracking-[0.45em]">★ ★ ★</p>
          </div>
        </aside>

        <div className="absolute bottom-5 right-[7.5%] z-20 flex w-36 flex-col items-center text-center">
          {qrCodeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrCodeUrl} alt="QR code de vérification du certificat" className="h-24 w-24 rounded bg-white object-contain p-1 ring-1 ring-slate-200" />
          ) : (
            <div className="grid h-24 w-24 grid-cols-4 gap-1 rounded bg-white p-2 ring-1 ring-slate-200" aria-label="Emplacement QR code">
              {Array.from({ length: 16 }).map((_, index) => (
                <span key={index} className={index % 2 === 0 || index === 5 || index === 10 ? "bg-slate-950" : "bg-slate-200"} />
              ))}
            </div>
          )}
          <p className="mt-2 text-[10px] font-bold leading-tight text-slate-900">Numéro du certificat : {certificateId}</p>
          {verificationUrl ? <p className="mt-1 max-w-40 break-all text-[8px] leading-tight text-slate-500">{verificationUrl}</p> : null}
        </div>

        <div className="absolute right-0 top-0 z-20 flex h-full w-8 items-center justify-center bg-[#ef8b1e] text-white">
          <p className="rotate-90 whitespace-nowrap text-xs font-black uppercase tracking-[0.22em]">Projet : {sideLabel}</p>
        </div>

        <div className={`absolute left-6 top-5 z-20 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${isRevoked ? "bg-red-100 text-red-800" : isDraft ? "bg-yellow-100 text-yellow-800" : "bg-emerald-100 text-emerald-800"}`}>
          {statusLabel(status)}
        </div>
      </div>
    </article>
  );
}
