import { randomInt } from "crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyCertificate, AcademyEnrollment } from "@/types/academy";

export type CertificateGenerationResult =
  | { ok: true; certificate: AcademyCertificate; existing: boolean }
  | { ok: false; reason: string };

export function getCertificateVerificationUrl(certificateId: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://agritech509ht.com";
  return `${base.replace(/\/$/, "")}/certificats/verifier/${encodeURIComponent(certificateId)}`;
}

export function getCertificateQrCodeUrl(certificateId: string) {
  const verificationUrl = getCertificateVerificationUrl(certificateId);
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(verificationUrl)}`;
}

export function generateCertificateId(date = new Date()) {
  return `AGRITECH-CERT-${date.getUTCFullYear()}-${String(randomInt(1, 1_000_000)).padStart(6, "0")}`;
}

async function createUniqueCertificateId() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return generateCertificateId();

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const certificateId = generateCertificateId();
    const { data } = await supabase
      .from("academy_certificates")
      .select("id")
      .eq("certificate_id", certificateId)
      .maybeSingle();
    if (!data) return certificateId;
  }

  return `AGRITECH-CERT-${new Date().getUTCFullYear()}-${Date.now()}`;
}

export async function isEnrollmentCourseCompleted(enrollment: Pick<AcademyEnrollment, "student_id" | "course_id" | "status">) {
  if (enrollment.status === "completed") return true;
  if (enrollment.status !== "active") return false;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return false;

  const [{ data: lessons }, { data: progress }] = await Promise.all([
    supabase.from("academy_lessons").select("id").eq("course_id", enrollment.course_id).eq("status", "published"),
    supabase
      .from("academy_lesson_progress")
      .select("lesson_id,is_completed")
      .eq("student_id", enrollment.student_id)
      .eq("course_id", enrollment.course_id)
      .eq("is_completed", true),
  ]);

  const lessonIds = new Set((lessons ?? []).map((lesson) => lesson.id));
  if (lessonIds.size === 0) return false;

  const completedIds = new Set((progress ?? []).map((item) => item.lesson_id));
  return [...lessonIds].every((lessonId) => completedIds.has(lessonId));
}

export async function generateCertificateAfterCourseCompletion(enrollmentId: string): Promise<CertificateGenerationResult> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, reason: "Configuration Supabase indisponible." };

  const { data: existing } = await supabase
    .from("academy_certificates")
    .select("*")
    .eq("enrollment_id", enrollmentId)
    .maybeSingle();
  if (existing) return { ok: true, certificate: existing as AcademyCertificate, existing: true };

  const { data: enrollment, error } = await supabase
    .from("academy_enrollments")
    .select("*, academy_courses(title), profiles(full_name)")
    .eq("id", enrollmentId)
    .maybeSingle();

  if (error || !enrollment) return { ok: false, reason: "Inscription introuvable." };
  if (!["active", "completed"].includes(enrollment.status)) return { ok: false, reason: "Accès au cours non actif." };

  const { data: existingForCourse } = await supabase
    .from("academy_certificates")
    .select("*")
    .eq("student_id", enrollment.student_id)
    .eq("course_id", enrollment.course_id)
    .maybeSingle();
  if (existingForCourse) {
    if (!existingForCourse.enrollment_id) {
      await supabase.from("academy_certificates").update({ enrollment_id: enrollmentId }).eq("id", existingForCourse.id);
    }
    return { ok: true, certificate: { ...existingForCourse, enrollment_id: existingForCourse.enrollment_id ?? enrollmentId } as AcademyCertificate, existing: true };
  }

  const completed = await isEnrollmentCourseCompleted(enrollment);
  if (!completed) return { ok: false, reason: "Formation non terminée." };

  const certificateId = await createUniqueCertificateId();
  const verificationUrl = getCertificateVerificationUrl(certificateId);
  const qrCodeUrl = getCertificateQrCodeUrl(certificateId);
  const studentName = enrollment.profiles?.full_name || "Étudiant Academy";
  const courseTitle = enrollment.academy_courses?.title || "Formation Academy";

  const { data: certificate, error: insertError } = await supabase
    .from("academy_certificates")
    .insert({
      certificate_id: certificateId,
      student_id: enrollment.student_id,
      course_id: enrollment.course_id,
      enrollment_id: enrollment.id,
      student_full_name: studentName,
      course_title: courseTitle,
      status: "valid",
      verification_url: verificationUrl,
      qr_code_url: qrCodeUrl,
      metadata: { generated_by: "course_completion" },
    })
    .select("*")
    .single();

  if (insertError) {
    const { data: concurrentExisting } = await supabase
      .from("academy_certificates")
      .select("*")
      .eq("enrollment_id", enrollmentId)
      .maybeSingle();
    if (concurrentExisting) return { ok: true, certificate: concurrentExisting as AcademyCertificate, existing: true };
    return { ok: false, reason: insertError.message };
  }

  await supabase.from("academy_enrollments").update({ status: "completed" }).eq("id", enrollmentId);
  return { ok: true, certificate: certificate as AcademyCertificate, existing: false };
}
