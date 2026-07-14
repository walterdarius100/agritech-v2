import type { AcademyCertificate, AcademyCourse, AcademyEnrollment, CertificateStatus, Profile } from "@/types/academy";
import { getCertificateVerificationUrl } from "@/lib/academy/certificates";

export const CERTIFICATE_FALLBACKS = {
  organizationName: "WAL AGRITECH",
  academyName: "Agri-tech Academy",
  issuedCity: "Jacmel",
  duration: "durée définie par le programme",
  startDate: "date de début non précisée",
  endDate: "date de fin non précisée",
  signatoryName: "Walter Darius",
  signatoryTitle: "Directeur Général",
} as const;

export type CertificateWithRelations = AcademyCertificate & {
  academy_courses?: Pick<AcademyCourse, "id" | "title" | "duration"> | null;
  academy_enrollments?: Pick<AcademyEnrollment, "id" | "created_at" | "validated_at" | "updated_at"> | null;
  profiles?: Pick<Profile, "full_name"> | null;
};

export type CertificateDisplayData = {
  studentName: string;
  courseTitle: string;
  certificateId: string;
  issuedAt: string;
  issuedAtLabel: string;
  status: CertificateStatus;
  statusLabel: string;
  verificationUrl: string;
  qrCodeUrl: string;
  duration: string;
  startDate: string | null;
  endDate: string | null;
  startDateLabel: string;
  endDateLabel: string;
  issuedCity: string;
  organizationName: string;
  academyName: string;
  signatoryName: string;
  signatoryTitle: string;
};

function metadataString(metadata: Record<string, unknown> | null | undefined, keys: string[]) {
  for (const key of keys) {
    const value = metadata?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export function formatFrenchDate(value?: string | null, fallback = "date non précisée") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export function getCertificateStatusLabel(status?: string | null) {
  if (status === "draft") return "Brouillon";
  if (status === "revoked") return "Certificat révoqué";
  if (status === "expired") return "Expiré";
  return "Certificat valide";
}

function buildQrCodeUrl(verificationUrl: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(verificationUrl)}`;
}

export function toCertificateDisplayData(certificate: CertificateWithRelations): CertificateDisplayData {
  const metadata = certificate.metadata ?? {};
  const verificationUrl = certificate.verification_url?.trim() || getCertificateVerificationUrl(certificate.certificate_id);
  const startDate = metadataString(metadata, ["start_date", "started_at", "course_start_date"]) ?? certificate.academy_enrollments?.validated_at ?? certificate.academy_enrollments?.created_at ?? null;
  const endDate = metadataString(metadata, ["end_date", "completed_at", "course_end_date"]);

  return {
    studentName: certificate.student_full_name || certificate.profiles?.full_name || "Étudiant Academy",
    courseTitle: certificate.course_title || certificate.academy_courses?.title || "Formation Agri-tech Academy",
    certificateId: certificate.certificate_id,
    issuedAt: certificate.issued_at,
    issuedAtLabel: formatFrenchDate(certificate.issued_at),
    status: certificate.status,
    statusLabel: getCertificateStatusLabel(certificate.status),
    verificationUrl,
    qrCodeUrl: certificate.qr_code_url?.trim() || buildQrCodeUrl(verificationUrl),
    duration: metadataString(metadata, ["duration", "course_duration"]) ?? certificate.academy_courses?.duration ?? CERTIFICATE_FALLBACKS.duration,
    startDate,
    endDate,
    startDateLabel: formatFrenchDate(startDate, CERTIFICATE_FALLBACKS.startDate),
    endDateLabel: formatFrenchDate(endDate, CERTIFICATE_FALLBACKS.endDate),
    issuedCity: metadataString(metadata, ["issued_city", "issuedLocation", "issued_location"]) ?? CERTIFICATE_FALLBACKS.issuedCity,
    organizationName: metadataString(metadata, ["organization_name", "organizationName"]) ?? CERTIFICATE_FALLBACKS.organizationName,
    academyName: metadataString(metadata, ["academy_name", "academyName"]) ?? CERTIFICATE_FALLBACKS.academyName,
    signatoryName: metadataString(metadata, ["signatory_name", "signatoryName"]) ?? CERTIFICATE_FALLBACKS.signatoryName,
    signatoryTitle: metadataString(metadata, ["signatory_title", "signatoryTitle"]) ?? CERTIFICATE_FALLBACKS.signatoryTitle,
  };
}
