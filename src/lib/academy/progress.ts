"use server";

import { revalidatePath } from "next/cache";

import { requireStudent } from "@/lib/academy/auth";
import { maybeGenerateCertificateAfterLessonCompletion } from "@/lib/academy/certificates";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function toggleLessonProgress(formData: FormData) {
  const user = await requireStudent();
  const courseId = String(formData.get("courseId") ?? "");
  const lessonId = String(formData.get("lessonId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const completed = String(formData.get("completed") ?? "") === "true";
  const supabase = createSupabaseAdminClient();
  if (!supabase || !courseId || !lessonId) return;

  const nextCompleted = !completed;
  await supabase.from("academy_lesson_progress").upsert(
    {
      student_id: user.id,
      course_id: courseId,
      lesson_id: lessonId,
      is_completed: nextCompleted,
      completed_at: completed ? null : new Date().toISOString(),
    },
    { onConflict: "student_id,lesson_id" },
  );

  if (nextCompleted) {
    try {
      const result = await maybeGenerateCertificateAfterLessonCompletion(user.id, courseId);
      if (result.attempted) {
        console.info("[Academy certificates] Post-progress automatic certificate check", {
          studentId: user.id,
          courseId,
          certificateCreated: result.created,
          certificateId: result.certificateId ?? null,
          skippedReason: result.skippedReason ?? null,
        });
      }
    } catch (error) {
      console.error("[Academy certificates] Automatic certificate generation failed after lesson completion", {
        studentId: user.id,
        courseId,
        lessonId,
        message: error instanceof Error ? error.message : "Unknown certificate generation error",
      });
    }
  }

  revalidatePath(`/academy/cours/${slug}/apprendre`);
}
