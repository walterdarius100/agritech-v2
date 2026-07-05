"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { generateCertificateAfterCourseCompletion } from "@/lib/academy/certificates";
import { extractCloudflareStreamUid, getVideoProvider, normalizeVideoUrl } from "@/lib/academy/video";
import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

function nullableString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

function nullableNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

export async function createEnrollment(formData: FormData) {
  const admin = await requireAuthorizedAdmin();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  const status = String(formData.get("status") || "active");
  await supabase.from("academy_enrollments").upsert(
    {
      student_id: String(formData.get("studentId")),
      course_id: String(formData.get("courseId")),
      status,
      access_source: String(formData.get("accessSource") || "admin_grant"),
      payment_reference: nullableString(formData.get("paymentReference")),
      amount_paid: nullableNumber(formData.get("amountPaid")),
      currency: String(formData.get("currency") || "HTG"),
      validated_by: admin.id,
      validated_at: ["active", "completed"].includes(status) ? new Date().toISOString() : null,
    },
    { onConflict: "student_id,course_id" },
  );

  revalidatePath("/admin/academy/enrollments");
  redirect("/admin/academy/enrollments?success=1");
}

export async function createCourse(formData: FormData) {
  await requireAuthorizedAdmin();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  const status = String(formData.get("status") || "draft");
  await supabase.from("academy_courses").insert({
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    category: String(formData.get("category") || "Formation"),
    short_description: nullableString(formData.get("shortDescription")),
    description: nullableString(formData.get("description")),
    cover_image_url: nullableString(formData.get("coverImageUrl")),
    level: nullableString(formData.get("level")),
    duration: nullableString(formData.get("duration")),
    status,
    price_amount: nullableNumber(formData.get("priceAmount")),
    price_currency: String(formData.get("priceCurrency") || "HTG"),
    is_free: formData.get("isFree") === "on",
    published_at: nullableString(formData.get("publishedAt")) ?? (status === "published" ? new Date().toISOString() : null),
    certification_description: nullableString(formData.get("certificationDescription")),
    instructor_name: nullableString(formData.get("instructorName")),
    instructor_role: nullableString(formData.get("instructorRole")),
    instructor_bio: nullableString(formData.get("instructorBio")),
    instructor_image_url: nullableString(formData.get("instructorImageUrl")),
  });

  revalidatePath("/admin/academy/courses");
}

export async function updateCourse(formData: FormData) {
  await requireAuthorizedAdmin();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const status = String(formData.get("status") || "draft");
  const { error } = await supabase
    .from("academy_courses")
    .update({
      title: String(formData.get("title") ?? "").trim(),
      slug: String(formData.get("slug") ?? "").trim(),
      category: String(formData.get("category") || "Formation"),
      short_description: nullableString(formData.get("shortDescription")),
      description: nullableString(formData.get("description")),
      cover_image_url: nullableString(formData.get("coverImageUrl")),
      level: nullableString(formData.get("level")),
      duration: nullableString(formData.get("duration")),
      status,
      price_amount: nullableNumber(formData.get("priceAmount")),
      price_currency: String(formData.get("priceCurrency") || "HTG"),
      is_free: formData.get("isFree") === "on",
      published_at: nullableString(formData.get("publishedAt")) ?? (status === "published" ? new Date().toISOString() : null),
    certification_description: nullableString(formData.get("certificationDescription")),
    instructor_name: nullableString(formData.get("instructorName")),
    instructor_role: nullableString(formData.get("instructorRole")),
    instructor_bio: nullableString(formData.get("instructorBio")),
    instructor_image_url: nullableString(formData.get("instructorImageUrl")),
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/academy/courses/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/academy/courses");
  revalidatePath(`/admin/academy/courses/${id}/edit`);
  redirect(`/admin/academy/courses/${id}/edit?success=1`);
}

export async function createCertificate(formData: FormData) {
  await requireAuthorizedAdmin();
  const enrollmentId = String(formData.get("enrollmentId") ?? "");
  if (!enrollmentId) return;

  await generateCertificateAfterCourseCompletion(enrollmentId);

  revalidatePath("/admin/academy/certificates");
  revalidatePath("/academy/certificats");
}


export async function revokeCertificate(formData: FormData) {
  await requireAuthorizedAdmin();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  await supabase.from("academy_certificates").update({ status: "revoked" }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/academy/certificates");
}

function numberValue(value: FormDataEntryValue | null, fallback = 0) {
  const number = Number(String(value ?? "").trim());
  return Number.isFinite(number) ? number : fallback;
}

function validUrlOrNull(value: FormDataEntryValue | null) {
  const text = nullableString(value);
  if (!text) return null;
  try {
    return new URL(text).toString();
  } catch {
    return null;
  }
}

function contentRedirect(courseId: string, suffix = "success=1") {
  revalidatePath(`/admin/academy/courses/${courseId}/content`);
  redirect(`/admin/academy/courses/${courseId}/content?${suffix}`);
}

export async function saveModule(formData: FormData) {
  await requireAuthorizedAdmin();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;
  const courseId = String(formData.get("courseId") ?? "");
  const id = nullableString(formData.get("id"));
  const payload = {
    course_id: courseId,
    title: String(formData.get("title") ?? "").trim(),
    description: nullableString(formData.get("description")),
    position: numberValue(formData.get("position")),
    status: String(formData.get("status") || "draft"),
  };
  const { error } = id
    ? await supabase.from("academy_modules").update(payload).eq("id", id).eq("course_id", courseId)
    : await supabase.from("academy_modules").insert(payload);
  if (error) contentRedirect(courseId, `error=${encodeURIComponent(error.message)}`);
  contentRedirect(courseId);
}

export async function archiveModule(formData: FormData) {
  await requireAuthorizedAdmin();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;
  const courseId = String(formData.get("courseId") ?? "");
  await supabase.from("academy_modules").update({ status: "archived" }).eq("id", String(formData.get("id"))).eq("course_id", courseId);
  contentRedirect(courseId, "archived=1");
}

export async function saveLesson(formData: FormData) {
  await requireAuthorizedAdmin();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;
  const courseId = String(formData.get("courseId") ?? "");
  const id = nullableString(formData.get("id"));
  const videoInput = String(formData.get("videoUrl") ?? "");
  const normalizedVideoUrl = normalizeVideoUrl(videoInput);
  const pastedUid = !normalizedVideoUrl && /^[a-zA-Z0-9_-]{16,}$/.test(videoInput.trim()) ? videoInput.trim() : null;
  const cloudflareUid = extractCloudflareStreamUid(videoInput) ?? pastedUid;
  const videoProvider = cloudflareUid ? "cloudflare_stream" : normalizedVideoUrl ? getVideoProvider(normalizedVideoUrl) : null;
  const payload = {
    course_id: courseId,
    module_id: nullableString(formData.get("moduleId")),
    title: String(formData.get("title") ?? "").trim(),
    content: nullableString(formData.get("content")),
    video_url: normalizedVideoUrl,
    video_provider: videoProvider,
    video_uid: cloudflareUid,
    video_embed_url: videoProvider === "cloudflare_stream" ? normalizedVideoUrl : null,
    duration: nullableString(formData.get("duration")),
    position: numberValue(formData.get("position")),
    is_preview: formData.get("isPreview") === "on",
    status: String(formData.get("status") || "draft"),
  };
  const { error } = id
    ? await supabase.from("academy_lessons").update(payload).eq("id", id).eq("course_id", courseId)
    : await supabase.from("academy_lessons").insert(payload);
  if (error) contentRedirect(courseId, `error=${encodeURIComponent(error.message)}`);
  contentRedirect(courseId);
}

export async function archiveLesson(formData: FormData) {
  await requireAuthorizedAdmin();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;
  const courseId = String(formData.get("courseId") ?? "");
  await supabase.from("academy_lessons").update({ status: "archived" }).eq("id", String(formData.get("id"))).eq("course_id", courseId);
  contentRedirect(courseId, "archived=1");
}

export async function saveResource(formData: FormData) {
  await requireAuthorizedAdmin();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;
  const courseId = String(formData.get("courseId") ?? "");
  const id = nullableString(formData.get("id"));
  const payload = {
    course_id: courseId,
    lesson_id: nullableString(formData.get("lessonId")),
    title: String(formData.get("title") ?? "").trim(),
    description: nullableString(formData.get("description")),
    resource_type: String(formData.get("resourceType") || "document"),
    file_url: validUrlOrNull(formData.get("fileUrl")),
    external_url: validUrlOrNull(formData.get("externalUrl")),
    position: numberValue(formData.get("position")),
    is_downloadable: formData.get("isDownloadable") === "on",
  };
  const { error } = id
    ? await supabase.from("academy_resources").update(payload).eq("id", id).eq("course_id", courseId)
    : await supabase.from("academy_resources").insert(payload);
  if (error) contentRedirect(courseId, `error=${encodeURIComponent(error.message)}`);
  contentRedirect(courseId);
}

export async function archiveResource(formData: FormData) {
  await requireAuthorizedAdmin();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;
  const courseId = String(formData.get("courseId") ?? "");
  await supabase.from("academy_resources").delete().eq("id", String(formData.get("id"))).eq("course_id", courseId);
  contentRedirect(courseId, "archived=1");
}
