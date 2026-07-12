import { randomInt } from "crypto";

import { enrollmentGrantsAccess } from "@/lib/academy/enrollments";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyCertificate, AcademyEnrollment, Profile } from "@/types/academy";

const CERTIFICATE_PREFIX = "AGRITECH-CERT";

export type CourseCompletionStatus = {
  enrollmentId: string | null;
  studentId: string | null;
  courseId: string | null;
  isCompleted: boolean;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  enrollmentStatus: string | null;
  completedAt: string | null;
  hasAccess: boolean;
  reason?: string;
};

export type CertificateEligibilityDiagnostic = CourseCompletionStatus & {
  studentName: string;
  courseTitle: string;
  certificateId: string | null;
  certificateStatus: string | null;
  hasBlockingCertificate: boolean;
  isEligible: boolean;
};

export function generateCertificateId(date = new Date(), sequence = randomInt(1, 1_000_000)) {
  return `${CERTIFICATE_PREFIX}-${date.getUTCFullYear()}-${String(sequence).padStart(6, "0")}`;
}

export function getCertificateVerificationUrl(certificateId: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://agritech509ht.com";
  return `${base.replace(/\/$/, "")}/certificats/verifier/${encodeURIComponent(certificateId)}`;
}

export function getCertificateQrCodeUrl(certificateId: string) {
  const verificationUrl = getCertificateVerificationUrl(certificateId);
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(verificationUrl)}`;
}

function logCertificateEvent(event: string, details: Record<string, unknown>) {
  console.info(`[academy-certificates] ${event}`, details);
}

async function createUniqueCertificateId() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase admin client unavailable");

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const certificateId = generateCertificateId();
    const { data } = await supabase
      .from("academy_certificates")
      .select("certificate_id")
      .eq("certificate_id", certificateId)
      .maybeSingle();
    if (!data) return certificateId;
  }

  throw new Error("Unable to generate a unique certificate id");
}

export async function getCourseCompletionStatus(enrollmentId: string): Promise<CourseCompletionStatus> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return emptyCompletionStatus(enrollmentId, "Client Supabase admin indisponible.");
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("academy_enrollments")
    .select("*")
    .eq("id", enrollmentId)
    .maybeSingle();

  if (enrollmentError || !enrollment) {
    return emptyCompletionStatus(enrollmentId, "Aucun enrollment trouvé.");
  }

  const typedEnrollment = enrollment as AcademyEnrollment;
  const hasAccess = enrollmentGrantsAccess(typedEnrollment);
  if (!hasAccess) {
    return {
      enrollmentId,
      studentId: typedEnrollment.student_id,
      courseId: typedEnrollment.course_id,
      isCompleted: false,
      progressPercentage: 0,
      completedLessons: 0,
      totalLessons: 0,
      enrollmentStatus: typedEnrollment.status,
      completedAt: typedEnrollment.completed_at ?? null,
      hasAccess: false,
      reason: "L'enrollment ne donne pas accès au cours.",
    };
  }

  const [{ data: lessons }, { data: progress }] = await Promise.all([
    supabase.from("academy_lessons").select("id").eq("course_id", typedEnrollment.course_id).eq("status", "published"),
    supabase
      .from("academy_lesson_progress")
      .select("lesson_id,is_completed")
      .eq("student_id", typedEnrollment.student_id)
      .eq("course_id", typedEnrollment.course_id)
      .eq("is_completed", true),
  ]);

  const lessonIds = new Set(((lessons ?? []) as { id: string }[]).map((lesson) => lesson.id));
  const completedLessonIds = new Set(
    ((progress ?? []) as { lesson_id: string; is_completed: boolean }[])
      .filter((item) => item.is_completed)
      .map((item) => item.lesson_id),
  );
  const totalLessons = lessonIds.size;
  const completedLessons = [...lessonIds].filter((lessonId) => completedLessonIds.has(lessonId)).length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isCompleted = totalLessons > 0 && completedLessons === totalLessons;

  return {
    enrollmentId,
    studentId: typedEnrollment.student_id,
    courseId: typedEnrollment.course_id,
    isCompleted,
    progressPercentage,
    completedLessons,
    totalLessons,
    enrollmentStatus: typedEnrollment.status,
    completedAt: typedEnrollment.completed_at ?? null,
    hasAccess,
    reason: isCompleted ? undefined : `Progression insuffisante : ${progressPercentage} % (${completedLessons}/${totalLessons} leçons).`,
  };
}

function emptyCompletionStatus(enrollmentId: string | null, reason: string): CourseCompletionStatus {
  return {
    enrollmentId,
    studentId: null,
    courseId: null,
    isCompleted: false,
    progressPercentage: 0,
    completedLessons: 0,
    totalLessons: 0,
    enrollmentStatus: null,
    completedAt: null,
    hasAccess: false,
    reason,
  };
}

export async function markEnrollmentCompletedIfNeeded(completion: CourseCompletionStatus) {
  if (!completion.isCompleted || !completion.enrollmentId || completion.enrollmentStatus === "completed") return;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  const completedAt = completion.completedAt ?? new Date().toISOString();
  const payload: { status: "completed"; completed_at?: string } = { status: "completed" };
  payload.completed_at = completedAt;

  const { error } = await supabase.from("academy_enrollments").update(payload).eq("id", completion.enrollmentId);
  if (error && error.message.toLowerCase().includes("completed_at")) {
    await supabase.from("academy_enrollments").update({ status: "completed" }).eq("id", completion.enrollmentId);
  }
}

export async function generateCertificateAfterCourseCompletion(enrollmentId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase admin client unavailable");

  const { data: existingCertificate } = await supabase
    .from("academy_certificates")
    .select("*")
    .eq("enrollment_id", enrollmentId)
    .in("status", ["valid", "draft"])
    .maybeSingle();
  if (existingCertificate) {
    logCertificateEvent("certificate_already_exists", { enrollmentId, certificateId: existingCertificate.certificate_id, certificateStatus: existingCertificate.status });
    return existingCertificate as AcademyCertificate;
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("academy_enrollments")
    .select("*, academy_courses(*)")
    .eq("id", enrollmentId)
    .maybeSingle();
  if (enrollmentError || !enrollment) throw new Error("Impossible de générer le certificat : aucun enrollment trouvé.");

  const typedEnrollment = enrollment as AcademyEnrollment & { academy_courses?: { title?: string | null } | null };
  if (!enrollmentGrantsAccess(typedEnrollment)) throw new Error("Impossible de générer le certificat : l'enrollment ne donne pas accès au cours.");

  const completion = await getCourseCompletionStatus(enrollmentId);
  logCertificateEvent("completion_checked", {
    enrollmentId,
    courseId: completion.courseId,
    studentId: completion.studentId,
    progressPercentage: completion.progressPercentage,
    completedLessons: completion.completedLessons,
    totalLessons: completion.totalLessons,
    isCompleted: completion.isCompleted,
    reasonIfNotEligible: completion.reason ?? null,
  });
  if (!completion.isCompleted) {
    throw new Error(`Impossible de générer le certificat : ${completion.reason ?? "la formation n'est pas terminée."}`);
  }

  await markEnrollmentCompletedIfNeeded(completion);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", typedEnrollment.student_id)
    .maybeSingle();

  const certificateId = await createUniqueCertificateId();
  const verificationUrl = getCertificateVerificationUrl(certificateId);
  const payload = {
    certificate_id: certificateId,
    student_id: typedEnrollment.student_id,
    course_id: typedEnrollment.course_id,
    enrollment_id: typedEnrollment.id,
    student_full_name: ((profile as Pick<Profile, "full_name"> | null)?.full_name || "Étudiant Academy").trim(),
    course_title: typedEnrollment.academy_courses?.title || "Formation Academy",
    issued_at: new Date().toISOString(),
    status: "valid",
    verification_url: verificationUrl,
    qr_code_url: getCertificateQrCodeUrl(certificateId),
    metadata: { generated_by: "academy_completion", progress_percentage: completion.progressPercentage },
  };

  const { data: created, error: createError } = await supabase.from("academy_certificates").insert(payload).select("*").single();
  if (createError) {
    const { data: existingAfterConflict } = await supabase
      .from("academy_certificates")
      .select("*")
      .eq("enrollment_id", enrollmentId)
      .in("status", ["valid", "draft"])
      .maybeSingle();
    if (existingAfterConflict) return existingAfterConflict as AcademyCertificate;
    throw createError;
  }

  logCertificateEvent("certificate_created", { enrollmentId, certificateId, courseId: typedEnrollment.course_id, studentId: typedEnrollment.student_id });
  return created as AcademyCertificate;
}

export async function syncCompletionAndCertificateForEnrollment(enrollmentId: string) {
  const completion = await getCourseCompletionStatus(enrollmentId);
  if (!completion.isCompleted) {
    logCertificateEvent("certificate_not_generated", {
      enrollmentId,
      courseId: completion.courseId,
      studentId: completion.studentId,
      progressPercentage: completion.progressPercentage,
      completedLessons: completion.completedLessons,
      totalLessons: completion.totalLessons,
      isCompleted: completion.isCompleted,
      reasonIfNotEligible: completion.reason ?? null,
    });
    return { completion, certificate: null as AcademyCertificate | null };
  }

  await markEnrollmentCompletedIfNeeded(completion);
  const certificate = await generateCertificateAfterCourseCompletion(enrollmentId);
  return { completion, certificate };
}

export async function getCertificateEligibilityDiagnostics(): Promise<CertificateEligibilityDiagnostic[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data: enrollments } = await supabase
    .from("academy_enrollments")
    .select("id,student_id,course_id,status,completed_at,profiles(full_name),academy_courses(title)")
    .in("status", ["active", "completed"])
    .order("created_at", { ascending: false });

  const enrollmentRows = (enrollments ?? []) as Array<
    Pick<AcademyEnrollment, "id" | "student_id" | "course_id" | "status" | "completed_at"> & {
      profiles?: { full_name: string | null } | { full_name: string | null }[] | null;
      academy_courses?: { title: string | null } | { title: string | null }[] | null;
    }
  >;
  if (!enrollmentRows.length) return [];

  const enrollmentIds = enrollmentRows.map((enrollment) => enrollment.id);
  const { data: certificates } = await supabase
    .from("academy_certificates")
    .select("certificate_id,enrollment_id,status")
    .in("enrollment_id", enrollmentIds);

  const certificatesByEnrollment = new Map(
    ((certificates ?? []) as Pick<AcademyCertificate, "certificate_id" | "enrollment_id" | "status">[])
      .filter((certificate) => certificate.enrollment_id)
      .map((certificate) => [certificate.enrollment_id, certificate]),
  );

  const diagnostics = await Promise.all(
    enrollmentRows.map(async (enrollment) => {
      const completion = await getCourseCompletionStatus(enrollment.id);
      const certificate = certificatesByEnrollment.get(enrollment.id) ?? null;
      const hasBlockingCertificate = certificate?.status === "valid" || certificate?.status === "draft";
      const profile = firstRelation(enrollment.profiles);
      const course = firstRelation(enrollment.academy_courses);

      return {
        ...completion,
        studentName: profile?.full_name ?? enrollment.student_id,
        courseTitle: course?.title ?? enrollment.course_id,
        certificateId: certificate?.certificate_id ?? null,
        certificateStatus: certificate?.status ?? null,
        hasBlockingCertificate,
        isEligible: completion.isCompleted && !hasBlockingCertificate,
        reason: completion.isCompleted
          ? hasBlockingCertificate
            ? `Un certificat ${certificate?.status} existe déjà.`
            : undefined
          : completion.reason,
      } satisfies CertificateEligibilityDiagnostic;
    }),
  );

  return diagnostics;
}

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
