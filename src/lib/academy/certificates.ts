import { randomInt } from "crypto";

import { enrollmentGrantsAccess } from "@/lib/academy/enrollments";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyCertificate, AcademyEnrollment, Profile } from "@/types/academy";

const CERTIFICATE_PREFIX = "AGRITECH-CERT";

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

export async function isCourseCompleted(studentId: string, courseId: string, enrollment?: Pick<AcademyEnrollment, "status"> | null) {
  if (enrollment?.status === "completed") return true;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return false;

  const [{ data: lessons }, { data: progress }] = await Promise.all([
    supabase.from("academy_lessons").select("id").eq("course_id", courseId).eq("status", "published"),
    supabase
      .from("academy_lesson_progress")
      .select("lesson_id,is_completed")
      .eq("student_id", studentId)
      .eq("course_id", courseId)
      .eq("is_completed", true),
  ]);

  const lessonIds = new Set(((lessons ?? []) as { id: string }[]).map((lesson) => lesson.id));
  if (lessonIds.size === 0) return false;

  const completedLessonIds = new Set(((progress ?? []) as { lesson_id: string }[]).map((item) => item.lesson_id));
  return [...lessonIds].every((lessonId) => completedLessonIds.has(lessonId));
}

export async function generateCertificateAfterCourseCompletion(enrollmentId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase admin client unavailable");

  const { data: existingCertificate } = await supabase
    .from("academy_certificates")
    .select("*")
    .eq("enrollment_id", enrollmentId)
    .maybeSingle();
  if (existingCertificate) return existingCertificate as AcademyCertificate;

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("academy_enrollments")
    .select("*, academy_courses(*)")
    .eq("id", enrollmentId)
    .maybeSingle();
  if (enrollmentError || !enrollment) throw new Error("Enrollment not found");

  const typedEnrollment = enrollment as AcademyEnrollment & { academy_courses?: { title?: string | null } | null };
  if (!enrollmentGrantsAccess(typedEnrollment)) throw new Error("Enrollment does not grant course access");

  const completed = await isCourseCompleted(typedEnrollment.student_id, typedEnrollment.course_id, typedEnrollment);
  if (!completed) throw new Error("Course is not completed yet");

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
    metadata: { generated_by: "academy_completion" },
  };

  const { data: created, error: createError } = await supabase.from("academy_certificates").insert(payload).select("*").single();
  if (createError) {
    const { data: existingAfterConflict } = await supabase
      .from("academy_certificates")
      .select("*")
      .eq("enrollment_id", enrollmentId)
      .maybeSingle();
    if (existingAfterConflict) return existingAfterConflict as AcademyCertificate;
    throw createError;
  }

  return created as AcademyCertificate;
}
