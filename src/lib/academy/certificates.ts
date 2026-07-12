import { randomBytes } from "crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyCertificate, AcademyEnrollment, AcademyLesson, Profile } from "@/types/academy";

export const ACTIVE_CERTIFICATE_STATUSES = ["issued", "valid", "draft"] as const;

export type CertificateEligibility = {
  enrollmentId: string;
  studentId: string;
  courseId: string;
  studentName: string | null;
  courseTitle: string;
  totalPublishedLessons: number;
  completedPublishedLessons: number;
  progressPercentage: number;
  isCompleted: boolean;
  existingCertificateId: string | null;
  isEligible: boolean;
  reason?: string;
};

export type CertificateGenerationSource = "manual_admin" | "automatic";

export type CertificateGenerationResult = {
  attempted: boolean;
  created: boolean;
  certificateId?: string;
  skippedReason?: "not_completed" | "certificate_already_exists" | "enrollment_not_found" | "generation_failed";
};

type EnrollmentWithCourse = AcademyEnrollment & {
  academy_courses?: { id: string; title: string } | null;
};

export function generateCertificateId(date = new Date()) {
  return `AGRITECH-CERT-${date.getUTCFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export function generateCertificatePublicId(date = new Date()) {
  const randomNumber = Number.parseInt(randomBytes(4).toString("hex"), 16) % 1_000_000;
  return `AGRITECH-CERT-${date.getUTCFullYear()}-${String(randomNumber).padStart(6, "0")}`;
}

export function getCertificateVerificationUrl(certificateId: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://agritech509ht.com";
  return `${base.replace(/\/$/, "")}/certificats/verifier/${encodeURIComponent(certificateId)}`;
}

function normalizeActiveCertificateId(certificate: Pick<AcademyCertificate, "certificate_id" | "status"> | null) {
  if (!certificate) return null;
  return ACTIVE_CERTIFICATE_STATUSES.includes(certificate.status as (typeof ACTIVE_CERTIFICATE_STATUSES)[number]) ? certificate.certificate_id : null;
}

function buildEligibility(params: {
  enrollment: EnrollmentWithCourse;
  profile: Pick<Profile, "full_name"> | null;
  lessons: Pick<AcademyLesson, "id">[];
  completedLessonIds: Set<string>;
  existingCertificateId: string | null;
}): CertificateEligibility {
  const { enrollment, profile, lessons, completedLessonIds, existingCertificateId } = params;
  const totalPublishedLessons = lessons.length;
  const completedPublishedLessons = lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
  const progressPercentage = totalPublishedLessons ? Math.round((completedPublishedLessons / totalPublishedLessons) * 100) : 0;
  const isCompleted = totalPublishedLessons > 0 && completedPublishedLessons === totalPublishedLessons;
  const reason = existingCertificateId
    ? "Un certificat actif existe déjà pour cet enrollment."
    : !totalPublishedLessons
      ? "La formation ne contient aucune leçon publiée."
      : !isCompleted
        ? "La formation n’est pas terminée."
        : undefined;

  return {
    enrollmentId: enrollment.id,
    studentId: enrollment.student_id,
    courseId: enrollment.course_id,
    studentName: profile?.full_name ?? null,
    courseTitle: enrollment.academy_courses?.title ?? enrollment.course_id,
    totalPublishedLessons,
    completedPublishedLessons,
    progressPercentage,
    isCompleted,
    existingCertificateId,
    isEligible: isCompleted && !existingCertificateId,
    reason,
  };
}

export async function getCertificateEligibilityForEnrollment(enrollmentId: string): Promise<CertificateEligibility | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data: enrollment } = await supabase
    .from("academy_enrollments")
    .select("*, academy_courses(id,title)")
    .eq("id", enrollmentId)
    .maybeSingle();

  if (!enrollment) return null;

  const typedEnrollment = enrollment as EnrollmentWithCourse;
  const [{ data: profile }, { data: lessons }, { data: progress }, { data: certificateByEnrollment }, { data: certificateByPair }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", typedEnrollment.student_id).maybeSingle(),
    supabase.from("academy_lessons").select("id").eq("course_id", typedEnrollment.course_id).eq("status", "published"),
    supabase
      .from("academy_lesson_progress")
      .select("lesson_id,is_completed")
      .eq("student_id", typedEnrollment.student_id)
      .eq("course_id", typedEnrollment.course_id)
      .eq("is_completed", true),
    supabase
      .from("academy_certificates")
      .select("certificate_id,status")
      .eq("enrollment_id", typedEnrollment.id)
      .in("status", [...ACTIVE_CERTIFICATE_STATUSES])
      .limit(1),
    supabase
      .from("academy_certificates")
      .select("certificate_id,status")
      .eq("student_id", typedEnrollment.student_id)
      .eq("course_id", typedEnrollment.course_id)
      .is("enrollment_id", null)
      .in("status", [...ACTIVE_CERTIFICATE_STATUSES])
      .limit(1),
  ]);

  const completedLessonIds = new Set(
    ((progress ?? []) as { lesson_id: string; is_completed: boolean }[]).filter((item) => item.is_completed).map((item) => item.lesson_id),
  );

  return buildEligibility({
    enrollment: typedEnrollment,
    profile: (profile as Pick<Profile, "full_name"> | null) ?? null,
    lessons: (lessons ?? []) as Pick<AcademyLesson, "id">[],
    completedLessonIds,
    existingCertificateId: normalizeActiveCertificateId(
      ((certificateByEnrollment?.[0] ?? certificateByPair?.[0]) as Pick<AcademyCertificate, "certificate_id" | "status"> | undefined) ?? null,
    ),
  });
}

export async function getCompletedEnrollmentsEligibleForCertificates() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [] as CertificateEligibility[];

  const { data: enrollments } = await supabase
    .from("academy_enrollments")
    .select("*, academy_courses(id,title)")
    .in("status", ["active", "completed"])
    .order("created_at", { ascending: false });

  const results = await Promise.all(
    ((enrollments ?? []) as EnrollmentWithCourse[]).map((enrollment) => getCertificateEligibilityForEnrollment(enrollment.id)),
  );

  return results.filter((item): item is CertificateEligibility => Boolean(item)).filter((item) => item.isEligible);
}

export async function createCertificateForEligibility(
  eligibility: CertificateEligibility,
  options: { source: CertificateGenerationSource; generatedBy?: string | null },
): Promise<CertificateGenerationResult> {
  if (eligibility.existingCertificateId) {
    return { attempted: true, created: false, certificateId: eligibility.existingCertificateId, skippedReason: "certificate_already_exists" };
  }

  if (!eligibility.isCompleted) {
    return { attempted: true, created: false, skippedReason: "not_completed" };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { attempted: true, created: false, skippedReason: "generation_failed" };

  const certificateId = generateCertificatePublicId();
  const { error } = await supabase.from("academy_certificates").insert({
    certificate_id: certificateId,
    student_id: eligibility.studentId,
    course_id: eligibility.courseId,
    enrollment_id: eligibility.enrollmentId,
    student_full_name: eligibility.studentName ?? "Étudiant Academy",
    course_title: eligibility.courseTitle,
    verification_url: getCertificateVerificationUrl(certificateId),
    status: "valid",
    metadata: {
      generation_source: options.source === "automatic" ? "automatic" : "manual",
      generation_mode: options.source,
      generated_by: options.generatedBy ?? null,
      total_published_lessons: eligibility.totalPublishedLessons,
      completed_published_lessons: eligibility.completedPublishedLessons,
      progress_percentage: eligibility.progressPercentage,
    },
  });

  if (error) {
    if (error.code === "23505") {
      const refreshedEligibility = await getCertificateEligibilityForEnrollment(eligibility.enrollmentId);
      return {
        attempted: true,
        created: false,
        certificateId: refreshedEligibility?.existingCertificateId ?? undefined,
        skippedReason: "certificate_already_exists",
      };
    }

    console.error("[Academy certificates] Certificate insert failed", {
      enrollmentId: eligibility.enrollmentId,
      studentId: eligibility.studentId,
      courseId: eligibility.courseId,
      progressPercentage: eligibility.progressPercentage,
      completedLessons: eligibility.completedPublishedLessons,
      totalLessons: eligibility.totalPublishedLessons,
      certificateAlreadyExists: Boolean(eligibility.existingCertificateId),
      certificateCreated: false,
      skippedReason: "generation_failed",
      source: options.source,
      message: error.message,
    });
    return { attempted: true, created: false, skippedReason: "generation_failed" };
  }

  return { attempted: true, created: true, certificateId };
}

export async function maybeGenerateCertificateAfterLessonCompletion(studentId: string, courseId: string): Promise<CertificateGenerationResult> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { attempted: true, created: false, skippedReason: "generation_failed" };

  const { data: enrollment } = await supabase
    .from("academy_enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!enrollment?.id) {
    return { attempted: false, created: false, skippedReason: "enrollment_not_found" };
  }

  const eligibility = await getCertificateEligibilityForEnrollment(String(enrollment.id));
  if (!eligibility) return { attempted: false, created: false, skippedReason: "enrollment_not_found" };

  if (eligibility.existingCertificateId) {
    return { attempted: true, created: false, certificateId: eligibility.existingCertificateId, skippedReason: "certificate_already_exists" };
  }

  if (!eligibility.isCompleted) {
    return { attempted: true, created: false, skippedReason: "not_completed" };
  }

  const result = await createCertificateForEligibility(eligibility, { source: "automatic" });
  console.info("[Academy certificates] Automatic generation result", {
    enrollmentId: eligibility.enrollmentId,
    studentId: eligibility.studentId,
    courseId: eligibility.courseId,
    progressPercentage: eligibility.progressPercentage,
    completedLessons: eligibility.completedPublishedLessons,
    totalLessons: eligibility.totalPublishedLessons,
    certificateAlreadyExists: result.skippedReason === "certificate_already_exists",
    certificateCreated: result.created,
    skippedReason: result.skippedReason ?? null,
  });

  return result;
}
