"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { generateCertificateId, getCertificateVerificationUrl } from "@/lib/academy/certificates";
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
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  const certificateId = generateCertificateId();
  await supabase.from("academy_certificates").insert({
    certificate_id: certificateId,
    student_id: String(formData.get("studentId")),
    course_id: String(formData.get("courseId")),
    student_full_name: String(formData.get("studentFullName")),
    course_title: String(formData.get("courseTitle")),
    verification_url: getCertificateVerificationUrl(certificateId),
    status: "issued",
  });

  revalidatePath("/admin/academy/certificates");
}

export async function revokeCertificate(formData: FormData) {
  await requireAuthorizedAdmin();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  await supabase.from("academy_certificates").update({ status: "revoked" }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/academy/certificates");
}
