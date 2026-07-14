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
  academyName?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  projectName?: string | null;
  coveredTopics?: string[];
};

// Files are stored in public/images/* and served without the public/ prefix.
const CERTIFICATE_ASSETS = {
  logo: "/images/brand/Untitled-1.png",
  signature: "/images/brand/walter-darius-signature.png",
};

function formatCertificateDate(value: string, fallback = "date non précisée") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function formatCertificateDuration(value?: string | null) {
  const duration = value?.trim();
  if (!duration) return "durée définie par le programme";

  const compactHourMatch = duration.match(/^(\d+(?:[,.]\d+)?)\s*h(?:eures?)?$/i);
  if (compactHourMatch) {
    const amount = compactHourMatch[1].replace(",", ".");
    return `${amount} ${amount === "1" ? "heure" : "heures"}`;
  }

  return duration;
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

function ProgramDescription({ courseDuration }: Pick<CertificateTemplateProps, "courseDuration">) {
  const durationLabel = formatCertificateDuration(courseDuration);

  return (
    <p>
      Ce programme, d’une durée de <strong>{durationLabel}</strong>, a couvert les notions fondamentales, les pratiques techniques et les méthodes d’application liées au domaine étudié.
    </p>
  );
}

function CertificateBrandPanel() {
  return (
    <aside className="absolute right-[2.8%] top-0 z-20 flex h-[70.5%] w-[36.2%] flex-col items-center bg-[#4775c8] px-[2.25%] pb-[6%] pt-[4.8%] text-center text-white [clip-path:polygon(0_0,100%_0,100%_80%,50%_100%,0_80%)]">
      <div className="flex w-full flex-col items-center">
        <div className="relative h-[58px] w-[220px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CERTIFICATE_ASSETS.logo} alt="Logo Agri-tech" className="h-full w-full object-contain brightness-0 invert" />
        </div>
        <p className="mt-1 whitespace-nowrap text-[10px] font-black uppercase leading-none tracking-[0.08em] text-white">
          INFORMER • INNOVER • EDUQUER • SENSIBILISER
        </p>
      </div>

      <div className="mt-[11.5%] h-px w-[66%] bg-white/95" />
      <div className="mt-[9.2%]">
        <p className="font-[Arial_Black,Arial,sans-serif] text-[clamp(2.35rem,5vw,4.75rem)] font-black leading-none tracking-[-0.055em] text-white">Certificat</p>
        <p className="mt-[5%] whitespace-nowrap text-[clamp(1.35rem,2.1vw,2.25rem)] font-black leading-none text-white">de participation</p>
      </div>
      <div className="mt-[12%] h-px w-[40%] bg-white/95" />
      <div className="mt-[8.5%] flex justify-center gap-[18px] text-[clamp(1rem,1.55vw,1.45rem)] leading-none text-white">
        <span>★</span>
        <span>★</span>
        <span>★</span>
      </div>
    </aside>
  );
}

function CertificateSignatureBlock({ organizationName, signatoryName, signatoryTitle }: Pick<CertificateTemplateProps, "organizationName" | "signatoryName" | "signatoryTitle">) {
  return (
    <div className="w-[220px] text-center text-black">
      <div className="mx-auto mb-[-4px] h-[64px] w-[150px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CERTIFICATE_ASSETS.signature} alt="Signature de Walter Darius" className="h-full w-full object-contain" />
      </div>
      <div className="border-t border-slate-700 pt-1">
        <p className="text-[17px] leading-[1.25] text-slate-950">{signatoryName}</p>
        <p className="mt-1 text-[14px] leading-[1.2] text-slate-950">{signatoryTitle}</p>
        <p className="mt-1 text-[14px] font-semibold leading-[1.2] text-slate-950">{organizationName}</p>
      </div>
    </div>
  );
}

function CertificateQrBlock({ certificateId, qrCodeUrl, verificationUrl }: Pick<CertificateTemplateProps, "certificateId" | "qrCodeUrl" | "verificationUrl">) {
  return (
    <div className="absolute bottom-[4.6%] right-[11.6%] z-30 flex w-[180px] flex-col items-center text-center">
      {qrCodeUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qrCodeUrl} alt="QR code de vérification du certificat" className="h-[112px] w-[112px] bg-white object-contain p-1.5 ring-1 ring-slate-200" />
      ) : (
        <div className="grid h-[112px] w-[112px] grid-cols-4 gap-1 bg-white p-2 ring-1 ring-slate-200" aria-label={verificationUrl ? `QR code de vérification pour ${verificationUrl}` : "Emplacement QR code"}>
          {Array.from({ length: 16 }).map((_, index) => (
            <span key={index} className={index % 2 === 0 || index === 5 || index === 10 ? "bg-slate-950" : "bg-slate-200"} />
          ))}
        </div>
      )}
      <p className="mt-2.5 whitespace-nowrap text-[11px] font-normal leading-tight text-slate-950">
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
  issuedLocation = "Jacmel",
  signatoryName = "Walter Darius",
  signatoryTitle = "Directeur Général",
  academyName = "Agri-tech Academy",
  projectName,
}: CertificateTemplateProps) {
  const isRevoked = status === "revoked";
  const isDraft = status === "draft";
  const { firstLine, secondLine } = splitStudentName(studentName);
  const issuedDate = formatCertificateDate(issuedAt);

  return (
    <article className="certificate-print-area mx-auto aspect-[1.294/1] w-full max-w-6xl overflow-hidden bg-white p-[1.75%] text-slate-950 shadow-2xl ring-1 ring-slate-200 print:shadow-none print:ring-0">
      <div className="relative h-full overflow-hidden rounded-[3px] border-[1.5px] border-[#2c5f9f] bg-white">
        {(isRevoked || isDraft) && (
          <div className="pointer-events-none absolute inset-0 z-50 flex rotate-[-18deg] items-center justify-center text-6xl font-black uppercase tracking-[0.28em] text-red-700/10 sm:text-8xl">
            {isRevoked ? "Révoqué" : "Brouillon"}
          </div>
        )}

        <section className="absolute left-[6.8%] top-[6.2%] z-10 w-[48.5%] text-left font-[Arial,Helvetica,sans-serif]">
          <p className="text-[clamp(0.9rem,1.28vw,1.18rem)] font-black leading-none text-black">Agri-tech certifie que :</p>

          <div className="mt-[3.6%] max-w-full text-[#4674c4]">
            <h1 className="max-w-full break-words [overflow-wrap:anywhere] font-[Arial_Black,Arial,sans-serif] text-[clamp(2.8rem,6.2vw,5.25rem)] font-black leading-[0.92] tracking-[-0.04em]">{firstLine}</h1>
            {secondLine ? <p className="mt-1 max-w-full break-words [overflow-wrap:anywhere] font-[Arial_Black,Arial,sans-serif] text-[clamp(2.8rem,6.2vw,5.25rem)] font-black uppercase leading-[0.92] tracking-[-0.04em]">{secondLine}</p> : null}
          </div>

          <div className="mt-[4.6%] max-w-[610px] space-y-[0.82rem] text-[clamp(0.78rem,1.18vw,1.02rem)] leading-[1.58] text-black">
            <p>
              A suivi avec succès la formation « <strong>{courseTitle}</strong> », organisée par Agri-tech Academy dans le cadre de son programme de renforcement des compétences agricoles.
            </p>

            <ProgramDescription courseDuration={courseDuration} />

            <p className="pt-[0.15rem]">En foi de quoi, le présent certificat est délivré pour servir et valoir ce que de droit.</p>
            <p className="pt-[0.05rem]">
              Fait à <strong>{issuedLocation || "Jacmel"}</strong>, le <strong>{issuedDate}</strong>.
            </p>
          </div>
        </section>

        <div className="absolute bottom-[5.2%] left-[9.2%] z-10">
          <CertificateSignatureBlock organizationName={organizationName} signatoryName={signatoryName} signatoryTitle={signatoryTitle} />
        </div>

        <CertificateBrandPanel />
        <CertificateQrBlock certificateId={certificateId} qrCodeUrl={qrCodeUrl} verificationUrl={verificationUrl} />

        <div className="absolute bottom-[7.8%] right-[2.25%] z-30 flex h-[158px] w-[26px] items-center justify-center rounded-sm bg-gradient-to-b from-[#ff9b58] to-[#f07116] text-white">
          <p className="rotate-[-90deg] whitespace-nowrap text-[12px] font-black leading-none">{academyName}</p>
          {projectName ? <span className="sr-only">Projet : {projectName}</span> : null}
        </div>

        <div className={`absolute left-5 top-4 z-40 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest print:hidden ${isRevoked ? "bg-red-100 text-red-800" : isDraft ? "bg-yellow-100 text-yellow-800" : "bg-emerald-100 text-emerald-800"}`}>
          {statusLabel(status)}
        </div>
      </div>
    </article>
  );
}
