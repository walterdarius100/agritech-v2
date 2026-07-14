import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyCertificate, AcademyCourse, AcademyEnrollment } from "@/types/academy";

import type { CertificateWithRelations } from "./certificate-display";

type CertificateQueryResult = {
  certificates: CertificateWithRelations[];
  error: string | null;
};

type CertificateSingleQueryResult = {
  certificate: CertificateWithRelations | null;
  error: string | null;
};

type CourseSummary = Pick<AcademyCourse, "id" | "title" | "duration">;
type EnrollmentSummary = Pick<AcademyEnrollment, "id" | "created_at" | "validated_at" | "updated_at">;

function logCertificateQueryError(context: string, details: Record<string, unknown>) {
  console.error(`[Academy certificates] ${context}`, details);
}

async function hydrateCertificateRelations(certificates: AcademyCertificate[]): Promise<CertificateWithRelations[]> {
  if (certificates.length === 0) return [];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return certificates;

  const courseIds = [...new Set(certificates.map((certificate) => certificate.course_id).filter(Boolean))];
  const enrollmentIds = [...new Set(certificates.map((certificate) => certificate.enrollment_id).filter((value): value is string => Boolean(value)))];

  const [{ data: courses, error: coursesError }, { data: enrollments, error: enrollmentsError }] = await Promise.all([
    courseIds.length > 0 ? supabase.from("academy_courses").select("id,title,duration").in("id", courseIds) : Promise.resolve({ data: [], error: null }),
    enrollmentIds.length > 0 ? supabase.from("academy_enrollments").select("id,created_at,validated_at,updated_at").in("id", enrollmentIds) : Promise.resolve({ data: [], error: null }),
  ]);

  if (coursesError) {
    logCertificateQueryError("Unable to hydrate certificate course relations", { courseIds, message: coursesError.message });
  }

  if (enrollmentsError) {
    logCertificateQueryError("Unable to hydrate certificate enrollment relations", { enrollmentIds, message: enrollmentsError.message });
  }

  const coursesById = new Map((courses ?? []).map((course) => [(course as CourseSummary).id, course as CourseSummary]));
  const enrollmentsById = new Map((enrollments ?? []).map((enrollment) => [(enrollment as EnrollmentSummary).id, enrollment as EnrollmentSummary]));

  return certificates.map((certificate) => ({
    ...certificate,
    academy_courses: coursesById.get(certificate.course_id) ?? null,
    academy_enrollments: certificate.enrollment_id ? enrollmentsById.get(certificate.enrollment_id) ?? null : null,
  }));
}

export async function getStudentCertificates(studentId: string): Promise<CertificateQueryResult> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { certificates: [], error: "Configuration Supabase indisponible." };

  const { data, error } = await supabase.from("academy_certificates").select("*").eq("student_id", studentId).order("issued_at", { ascending: false });

  if (error) {
    logCertificateQueryError("Unable to load student certificates", { userId: studentId, studentIdUsedForQuery: studentId, message: error.message });
    return { certificates: [], error: "Impossible de charger vos certificats pour le moment." };
  }

  const certificates = (data ?? []) as AcademyCertificate[];
  console.info("[Academy certificates] Student certificates loaded", {
    userId: studentId,
    profileId: studentId,
    studentIdUsedForQuery: studentId,
    certificatesCount: certificates.length,
  });

  return { certificates: await hydrateCertificateRelations(certificates), error: null };
}

export async function getCertificateByPublicId(certificateId: string): Promise<CertificateSingleQueryResult> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { certificate: null, error: "Configuration Supabase indisponible." };

  const { data, error } = await supabase.from("academy_certificates").select("*").eq("certificate_id", certificateId).maybeSingle();

  if (error) {
    logCertificateQueryError("Unable to load certificate by public id", { certificateId, message: error.message });
    return { certificate: null, error: "Impossible de charger ce certificat pour le moment." };
  }

  if (!data) {
    console.info("[Academy certificates] Certificate not found", { certificateId });
    return { certificate: null, error: null };
  }

  const [certificate] = await hydrateCertificateRelations([data as AcademyCertificate]);
  return { certificate, error: null };
}
