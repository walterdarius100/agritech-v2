"use server";

import { revalidatePath } from "next/cache";

import { requireStudent } from "@/lib/academy/auth";
import { syncCompletionAndCertificateForEnrollment } from "@/lib/academy/certificates";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function toggleLessonProgress(formData: FormData) {
  const user = await requireStudent();
  const courseId = String(formData.get("courseId") ?? "");
  const lessonId = String(formData.get("lessonId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const completed = String(formData.get("completed") ?? "") === "true";
  const supabase = createSupabaseAdminClient();
  if (!supabase || !courseId || !lessonId) return;

  await supabase.from("academy_lesson_progress").upsert(
    {
      student_id: user.id,
      course_id: courseId,
      lesson_id: lessonId,
      is_completed: !completed,
      completed_at: completed ? null : new Date().toISOString(),
    },
    { onConflict: "student_id,lesson_id" },
  );

  if (!completed) {
    const { data: enrollment } = await supabase
      .from("academy_enrollments")
      .select("id")
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (enrollment?.id) {
      await syncCompletionAndCertificateForEnrollment(enrollment.id);
    }
  }

  revalidatePath(`/academy/cours/${slug}/apprendre`);
  revalidatePath("/academy/certificats");
}
