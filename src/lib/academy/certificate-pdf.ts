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

function sanitizePdfText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[«»]/g, "\"")
    .replace(/[\u0000-\u001f\u007f-\uffff]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapePdfText(value: string) {
  return sanitizePdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
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

function buildPdfBuffer(lines: string[]) {
  const width = 842;
  const height = 595;
  const content = [
    "q",
    "1 1 1 rg 0 0 842 595 re f",
    "0.173 0.373 0.624 RG 2 w 28 28 786 539 re S",
    "0.278 0.455 0.769 rg 535 0 285 420 re f",
    "0.941 0.443 0.086 rg 785 60 24 160 re f",
    "0 0 0 rg BT /F2 18 Tf 60 520 Td (Agri-tech certifie que :) Tj ET",
    "0.278 0.455 0.769 rg BT /F2 46 Tf 60 455 Td (Certificat) Tj ET",
    "1 1 1 rg BT /F2 40 Tf 590 470 Td (Certificat) Tj ET",
    "1 1 1 rg BT /F1 20 Tf 612 438 Td (de participation) Tj ET",
    "0.122 0.302 0.169 rg BT /F2 18 Tf 60 76 Td (Walter Darius) Tj ET",
    "0 0 0 rg BT /F1 12 Tf 60 58 Td (Directeur General - WAL AGRITECH) Tj ET",
    "0 0 0 rg",
    ...lines,
    "Q",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n%AgriTech\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "binary"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, "binary");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "binary");
}

function certificateToPdfLines(certificate: CertificateWithRelations) {
  const display = toCertificateDisplayData(certificate);
  return [
    `BT /F2 50 Tf 60 400 Td (${escapePdfText(display.studentName)}) Tj ET`,
    `BT /F1 16 Tf 60 352 Td (${escapePdfText(`A suivi avec succes la formation « ${display.courseTitle} »`)}) Tj ET`,
    `BT /F1 13 Tf 60 320 Td (${escapePdfText(`Programme Agri-tech Academy - duree : ${display.duration}`)}) Tj ET`,
    `BT /F1 13 Tf 60 292 Td (${escapePdfText(`Fait a ${display.issuedCity}, le ${display.issuedAtLabel}.`)}) Tj ET`,
    `BT /F2 12 Tf 558 146 Td (${escapePdfText(`Numero du certificat : ${display.certificateId}`)}) Tj ET`,
    `BT /F1 10 Tf 558 126 Td (${escapePdfText(`Verification : ${display.verificationUrl}`)}) Tj ET`,
    `BT /F1 10 Tf 558 108 Td (${escapePdfText(display.statusLabel)}) Tj ET`,
  ];
}

export async function generateAcademyCertificatePdf(certificateId: string): Promise<AcademyCertificatePdf> {
  console.info("[academy-certificate-pdf] generation started", { certificateId });
  const { certificate, error } = await getCertificateByPublicId(certificateId);
  console.info("[academy-certificate-pdf] certificate found true/false", { found: Boolean(certificate), error });

  if (error || !certificate) {
    throw new Error(error || "Certificate not found.");
  }

  console.info("[academy-certificate-pdf] student found true/false", { found: Boolean(certificate.student_id) });
  console.info("[academy-certificate-pdf] course found true/false", { found: Boolean(certificate.course_id || certificate.course_title) });

  const buffer = buildPdfBuffer(certificateToPdfLines(certificate));
  const generated = buffer.length > 0 && buffer.subarray(0, 5).toString("utf8") === "%PDF-";
  console.info("[academy-certificate-pdf] pdf generated true/false", { generated });
  console.info("[academy-certificate-pdf] pdf size bytes", { bytes: buffer.length });

  if (!generated) throw new Error("Generated certificate PDF is invalid or empty.");
  if (buffer.length > PDF_MAX_ATTACHMENT_BYTES) throw new Error("Generated certificate PDF is too large to attach safely.");

  return {
    buffer,
    base64: buffer.toString("base64"),
    filename: buildCertificateFilename(certificate.certificate_id),
    contentType: "application/pdf",
  };
}
