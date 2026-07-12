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

const CERTIFICATE_ASSETS = {
  logo: "/images/brand/Untitled-1.png",
  signature: "/images/certificate/walter-darius-signature.png",
  stamp: "/images/certificate/agritech-certificate-stamp.png",
};

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
  const durationLabel = courseDuration || "durée définie par le programme";
  const startLabel = start || "date de début non précisée";
  const endLabel = end || "date de fin non précisée";

  return (
    <p>
      D’une durée de <strong>{durationLabel}</strong>, la formation a été réalisée du <strong>{startLabel}</strong> au <strong>{endLabel}</strong>.
    </p>
  );
}

function CertificateBrandPanel() {
  return (
    <aside className="absolute right-[2.5%] top-0 z-20 flex h-[71.8%] w-[36.8%] flex-col items-center bg-[#4775c8] px-[2.1%] pb-[6.2%] pt-[5.1%] text-center text-white [clip-path:polygon(0_0,100%_0,100%_80%,50%_100%,0_80%)]">
      <div className="flex w-full flex-col items-center">
        <div className="relative h-[58px] w-[220px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CERTIFICATE_ASSETS.logo} alt="Logo Agri-tech" className="h-full w-full object-contain brightness-0 invert" />
        </div>
        <p className="mt-1 whitespace-nowrap text-[10px] font-black uppercase leading-none tracking-[0.08em] text-white">
          INFORMER • INNOVER • EDUQUER • SENSIBILISER
        </p>
      </div>

      <div className="mt-[12.5%] h-px w-[64%] bg-white/95" />
      <div className="mt-[10%]">
        <p className="font-[Arial_Black,Arial,sans-serif] text-[clamp(2.4rem,5.2vw,4.9rem)] font-black leading-none tracking-[-0.055em] text-white">Certificat</p>
        <p className="mt-[5.5%] whitespace-nowrap text-[clamp(1.35rem,2.15vw,2.35rem)] font-black leading-none text-white">de participation</p>
      </div>
      <div className="mt-[13%] h-px w-[38%] bg-white/95" />
      <div className="mt-[9%] flex justify-center gap-[18px] text-[clamp(1rem,1.55vw,1.45rem)] leading-none text-white">
        <span>★</span>
        <span>★</span>
        <span>★</span>
      </div>
    </aside>
  );
}

function CertificateSignatureBlock({ organizationName, signatoryName, signatoryTitle }: Pick<CertificateTemplateProps, "organizationName" | "signatoryName" | "signatoryTitle">) {
  return (
    <div className="flex items-end gap-[30px]">
      <div className="w-[200px] text-center text-black">
        <div className="mx-auto mb-[-4px] h-[64px] w-[150px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CERTIFICATE_ASSETS.signature} alt="Signature Walter Darius" className="h-full w-full object-contain" />
        </div>
        <div className="border-t border-slate-700 pt-1">
          <p className="text-[17px] leading-[1.25] text-slate-950">{signatoryName}</p>
          <p className="mt-1 text-[14px] leading-[1.2] text-slate-950">{signatoryTitle}</p>
          <p className="mt-1 text-[14px] font-semibold leading-[1.2] text-slate-950">{organizationName}</p>
        </div>
      </div>

      <div className="h-[116px] w-[116px] opacity-90">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CERTIFICATE_ASSETS.stamp} alt="Cachet Agri-tech" className="h-full w-full object-contain" />
      </div>
    </div>
  );
}

function CertificateQrBlock({ certificateId, qrCodeUrl, verificationUrl }: Pick<CertificateTemplateProps, "certificateId" | "qrCodeUrl" | "verificationUrl">) {
  return (
    <div className="absolute bottom-[3.6%] right-[9.2%] z-30 flex w-[170px] flex-col items-center text-center">
      {qrCodeUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qrCodeUrl} alt="QR code de vérification du certificat" className="h-[118px] w-[118px] bg-white object-contain p-1 ring-1 ring-slate-200" />
      ) : (
        <div className="grid h-[118px] w-[118px] grid-cols-4 gap-1 bg-white p-2 ring-1 ring-slate-200" aria-label="Emplacement QR code">
          {Array.from({ length: 16 }).map((_, index) => (
            <span key={index} className={index % 2 === 0 || index === 5 || index === 10 ? "bg-slate-950" : "bg-slate-200"} />
          ))}
        </div>
      )}
      <p className="mt-3 whitespace-nowrap text-[12px] font-normal leading-tight text-slate-950">
        <strong>Numéro du certificat :</strong> {certificateId}
      </p>
      {verificationUrl ? <p className="sr-only">URL de vérification : {verificationUrl}</p> : null}
    </div>
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
  issuedLocation = "Jacmel",
  signatoryName = "Walter Darius",
  signatoryTitle = "Directeur Général",
  projectName,
}: CertificateTemplateProps) {
  const isRevoked = status === "revoked";
  const isDraft = status === "draft";
  const { firstLine, secondLine } = splitStudentName(studentName);
  const issuedDate = formatCertificateDate(issuedAt);

  return (
    <article className="certificate-print-area mx-auto aspect-[1.294/1] w-full max-w-6xl overflow-hidden bg-white p-[1.65%] text-slate-950 shadow-2xl ring-1 ring-slate-200 print:shadow-none print:ring-0">
      <div className="relative h-full overflow-hidden rounded-[3px] border border-[#2c5f9f] bg-white">
        {(isRevoked || isDraft) && (
          <div className="pointer-events-none absolute inset-0 z-50 flex rotate-[-18deg] items-center justify-center text-6xl font-black uppercase tracking-[0.28em] text-red-700/10 sm:text-8xl">
            {isRevoked ? "Révoqué" : "Brouillon"}
          </div>
        )}

        <section className="absolute left-[6.5%] top-[5.9%] z-10 w-[49%] text-left font-[Arial,Helvetica,sans-serif]">
          <p className="text-[clamp(0.9rem,1.35vw,1.25rem)] font-black leading-none text-black">Agri-tech certifie que :</p>

          <div className="mt-[3.8%] text-[#4674c4]">
            <h1 className="break-words font-[Arial_Black,Arial,sans-serif] text-[clamp(3.2rem,7vw,6rem)] font-black leading-[0.9] tracking-[-0.045em]">{firstLine}</h1>
            {secondLine ? <p className="mt-1 break-words font-[Arial_Black,Arial,sans-serif] text-[clamp(3.2rem,7vw,6rem)] font-black uppercase leading-[0.9] tracking-[-0.045em]">{secondLine}</p> : null}
          </div>

          <div className="mt-[4.2%] max-w-[620px] space-y-3 text-[clamp(0.75rem,1.3vw,1.12rem)] leading-[1.5] text-black">
            <p>
              A suivi avec succès la formation « <strong>{courseTitle}</strong> », organisée par Agri-tech Academy dans le cadre de son programme de renforcement des compétences agricoles.
            </p>

            <p>Le programme a couvert les notions fondamentales, les pratiques techniques et les méthodes d’application liées au domaine étudié.</p>

            <TrainingDates courseDuration={courseDuration} startDate={startDate} endDate={endDate} />

            <p>En foi de quoi, le présent certificat est délivré pour servir et valoir ce que de droit.</p>
            <p>
              Fait à <strong>{issuedLocation || "Jacmel"}</strong>, le <strong>{issuedDate}</strong>.
            </p>
          </div>
        </section>

        <div className="absolute bottom-[4.5%] left-[9.5%] z-10">
          <CertificateSignatureBlock organizationName={organizationName} signatoryName={signatoryName} signatoryTitle={signatoryTitle} />
        </div>

        <CertificateBrandPanel />
        <CertificateQrBlock certificateId={certificateId} qrCodeUrl={qrCodeUrl} verificationUrl={verificationUrl} />

        <div className="absolute bottom-[7.3%] right-[2.2%] z-30 flex h-[170px] w-[28px] items-center justify-center rounded-sm bg-gradient-to-b from-[#ff9b58] to-[#f07116] text-white">
          <p className="rotate-[-90deg] whitespace-nowrap text-[12px] font-black leading-none">Agri-tech Academy</p>
          {projectName ? <span className="sr-only">Projet : {projectName}</span> : null}
        </div>

        <div className={`absolute left-5 top-4 z-40 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest print:hidden ${isRevoked ? "bg-red-100 text-red-800" : isDraft ? "bg-yellow-100 text-yellow-800" : "bg-emerald-100 text-emerald-800"}`}>
          {statusLabel(status)}
        </div>
      </div>
    </article>
  );
}
