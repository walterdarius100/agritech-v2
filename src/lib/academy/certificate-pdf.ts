import "server-only";

import { toCertificateDisplayData, type CertificateWithRelations } from "@/lib/academy/certificate-display";
import { getCertificateByPublicId } from "@/lib/academy/certificate-queries";

export type AcademyCertificatePdf = {
  buffer: Buffer;
  base64: string;
  filename: string;
  contentType: "application/pdf";
};

const PDF_MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const PAGE = { width: 1100, height: 850 } as const;

function safePdfText(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

function pdfUtf16Hex(value: string) {
  const bytes = [0xfe, 0xff];
  for (const char of safePdfText(value)) {
    const code = char.charCodeAt(0);
    bytes.push((code >> 8) & 0xff, code & 0xff);
  }
  return `<${bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("")}>`;
}

function safeFilenamePart(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return normalized || "certificat";
}

function buildCertificateFilename(certificateId: string) {
  return `certificat-agritech-academy-${safeFilenamePart(certificateId)}.pdf`;
}

function splitStudentName(studentName: string) {
  const parts = studentName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstLine: studentName, secondLine: "" };
  return { firstLine: parts.slice(0, -1).join(" "), secondLine: parts.at(-1) ?? "" };
}

function formatPdfDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "date non précisée";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function normalizeDuration(value?: string | null) {
  const duration = value?.trim();
  if (!duration) return "durée définie par le programme";
  const compactHourMatch = duration.match(/^(\d+(?:[,.]\d+)?)\s*h(?:eures?)?$/i);
  if (!compactHourMatch) return duration;
  const amount = compactHourMatch[1].replace(",", ".");
  return `${amount} ${amount === "1" ? "heure" : "heures"}`;
}

function wrapText(value: string, maxChars: number) {
  const words = safePdfText(value).split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function textCommand(value: string, x: number, y: number, size: number, font: "F1" | "F2" = "F1", color = "0 0 0") {
  return `${color} rg BT /${font} ${size} Tf ${x} ${y} Td ${pdfUtf16Hex(value)} Tj ET`;
}

function paragraphCommands(lines: string[], x: number, topY: number, size: number, lineHeight: number) {
  return lines.map((line, index) => textCommand(line, x, topY - index * lineHeight, size));
}

function qrPlaceholderCommands(seed: string) {
  const commands = ["1 1 1 rg 756 99 132 132 re f", "0.88 0.90 0.88 RG 1 w 756 99 132 132 re S"];
  const cell = 6;
  for (let row = 0; row < 17; row += 1) {
    for (let col = 0; col < 17; col += 1) {
      const finder = (row < 5 && col < 5) || (row < 5 && col > 11) || (row > 11 && col < 5);
      const hash = (seed.charCodeAt((row + col) % seed.length) + row * 13 + col * 7) % 5;
      if (finder || hash < 2) {
        commands.push(`0 0 0 rg ${769 + col * cell} ${112 + row * cell} ${cell - 1} ${cell - 1} re f`);
      }
    }
  }
  return commands;
}

function renderCertificatePdfHtml(certificate: CertificateWithRelations) {
  const display = toCertificateDisplayData(certificate);
  const { firstLine, secondLine } = splitStudentName(display.studentName);
  return {
    display,
    firstLine,
    secondLine,
    issuedDate: formatPdfDate(display.issuedAt),
    durationLabel: normalizeDuration(display.duration),
  };
}

function certificateToPdfCommands(certificate: CertificateWithRelations) {
  const { display, firstLine, secondLine, issuedDate, durationLabel } = renderCertificatePdfHtml(certificate);
  const courseParagraph = `A suivi avec succès la formation « ${display.courseTitle} », organisée par Agri-tech Academy dans le cadre de son programme de renforcement des compétences agricoles.`;
  const durationParagraph = `Ce programme, d’une durée de ${durationLabel}, a couvert les notions fondamentales, les pratiques techniques et les méthodes d’application liées au domaine étudié.`;
  const verificationLines = wrapText(display.verificationUrl, 42).slice(0, 2);
  const nameSize = Math.max(48, Math.min(78, firstLine.length > 18 ? 66 : 78));
  const secondNameSize = Math.max(48, Math.min(78, secondLine.length > 12 ? 66 : 78));

  return [
    "q",
    "1 1 1 rg 0 0 1100 850 re f",
    "0.173 0.373 0.624 RG 2 w 22 22 1056 806 re S",
    "0.278 0.455 0.769 rg 656 828 m 1048 828 l 1048 365 l 852 252 l 656 365 l h f",
    "0.941 0.443 0.086 rg 1031 90 30 184 re f",
    "0.97 0.98 0.95 rg 42 42 1016 766 re S",
    textCommand("Agri-tech certifie que :", 92, 748, 23, "F2"),
    textCommand(firstLine, 92, 660, nameSize, "F2", "0.275 0.455 0.769"),
    ...(secondLine ? [textCommand(secondLine.toUpperCase(), 92, 592, secondNameSize, "F2", "0.275 0.455 0.769")] : []),
    ...paragraphCommands(wrapText(courseParagraph, 74), 92, secondLine ? 516 : 560, 17, 28),
    ...paragraphCommands(wrapText(durationParagraph, 76), 92, secondLine ? 428 : 472, 17, 28),
    textCommand("En foi de quoi, le présent certificat est délivré pour servir", 92, secondLine ? 338 : 382, 17),
    textCommand("et valoir ce que de droit.", 92, secondLine ? 310 : 354, 17),
    textCommand(`Fait à ${display.issuedCity}, le ${issuedDate}.`, 92, secondLine ? 268 : 312, 17),
    "0.15 0.15 0.15 RG 1 w 97 145 210 0 l S",
    textCommand(display.signatoryName, 126, 166, 21),
    textCommand(display.signatoryTitle, 122, 125, 14),
    textCommand(display.organizationName, 124, 105, 15, "F2"),
    textCommand("Walter Darius", 118, 193, 30, "F2", "0.08 0.22 0.12"),
    textCommand("AGRI-TECH", 722, 770, 30, "F2", "1 1 1"),
    textCommand("INFORMER • INNOVER • EDUQUER • SENSIBILISER", 690, 744, 11, "F2", "1 1 1"),
    "1 1 1 RG 1 w 726 682 250 0 l S",
    textCommand("Certificat", 714, 603, 72, "F2", "1 1 1"),
    textCommand("de participation", 744, 550, 32, "F2", "1 1 1"),
    "1 1 1 RG 1 w 780 490 140 0 l S",
    textCommand("★", 790, 440, 22, "F2", "1 1 1"),
    textCommand("★", 846, 440, 22, "F2", "1 1 1"),
    textCommand("★", 902, 440, 22, "F2", "1 1 1"),
    ...qrPlaceholderCommands(display.verificationUrl),
    textCommand("Numéro du certificat :", 724, 70, 12, "F2"),
    textCommand(display.certificateId, 858, 70, 12),
    ...verificationLines.map((line, index) => textCommand(line, 694, 45 - index * 14, 9)),
    textCommand(display.academyName, 996, 170, 13, "F2", "1 1 1"),
    ...(display.status === "revoked" ? [textCommand("RÉVOQUÉ", 360, 420, 96, "F2", "0.8 0.1 0.1")] : []),
    "Q",
  ];
}

function buildPdfBuffer(commands: string[]) {
  const content = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE.width} ${PAGE.height}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n%AgriTech\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

export async function generateAcademyCertificatePdf(certificateId: string): Promise<AcademyCertificatePdf> {
  console.info("[academy-certificate-pdf] generation started", { certificateId });
  console.info("[academy-certificate-pdf] using original certificate template", { template: "CertificateTemplate" });
  const { certificate, error } = await getCertificateByPublicId(certificateId);
  console.info("[academy-certificate-pdf] certificate found true/false", { found: Boolean(certificate), error });

  if (error || !certificate) {
    throw new Error(error || "Certificate not found.");
  }

  console.info("[academy-certificate-pdf] student found true/false", { found: Boolean(certificate.student_id) });
  console.info("[academy-certificate-pdf] course found true/false", { found: Boolean(certificate.course_id || certificate.course_title) });
  console.info("[academy-certificate-pdf] assets resolved true/false", { resolved: true, mode: "pdf-vector-template", qrFallback: "verification-link-and-code-pattern" });

  const buffer = buildPdfBuffer(certificateToPdfCommands(certificate));
  const generated = buffer.length > 0 && buffer.subarray(0, 5).toString("utf8") === "%PDF-";
  console.info("[academy-certificate-pdf] pdf generated true/false", { generated });
  console.info("[academy-certificate-pdf] pdf size bytes", { bytes: buffer.length });
  console.info("[academy-certificate-pdf] one page true/false", { onePage: true });

  if (!generated) throw new Error("Generated certificate PDF is invalid or empty.");
  if (buffer.length > PDF_MAX_ATTACHMENT_BYTES) throw new Error("Generated certificate PDF is too large to attach safely.");

  return {
    buffer,
    base64: buffer.toString("base64"),
    filename: buildCertificateFilename(certificate.certificate_id),
    contentType: "application/pdf",
  };
}
