import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyCourse, AcademyEnrollment } from "@/types/academy";
import type { PaymentProvider, PaymentStatus } from "@/lib/payments/types";

export type AcademyPayment = { id:string; student_id:string; course_id:string; enrollment_id:string|null; provider:PaymentProvider; amount:number; currency:string; status:PaymentStatus; provider_reference:string|null; provider_checkout_url:string|null; provider_payload:Record<string, unknown>; metadata:Record<string, unknown>; paid_at:string|null; verified_at:string|null; created_at:string; updated_at:string; academy_courses?:AcademyCourse|null; profiles?:{full_name:string|null; email?:string|null}|null; };

export async function activateCourseAccessAfterPayment(paymentId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase admin client is not configured.");
  const { data: payment, error } = await supabase.from("academy_payments").select("*").eq("id", paymentId).maybeSingle();
  if (error || !payment) throw new Error("Payment not found.");
  const typedPayment = payment as AcademyPayment;
  if (typedPayment.status !== "paid") throw new Error("Payment is not paid.");
  if (!typedPayment.student_id || !typedPayment.course_id) throw new Error("Payment is missing student or course.");

  const { data: existing } = await supabase.from("academy_enrollments").select("*").eq("student_id", typedPayment.student_id).eq("course_id", typedPayment.course_id).maybeSingle();
  let enrollment = existing as AcademyEnrollment | null;
  if (enrollment) {
    const { data, error: updateError } = await supabase.from("academy_enrollments").update({ status: "active", access_source: "payment", payment_reference: typedPayment.provider_reference ?? typedPayment.id, amount_paid: typedPayment.amount, currency: typedPayment.currency, validated_at: new Date().toISOString() }).eq("id", enrollment.id).select("*").single();
    if (updateError) throw updateError;
    enrollment = data as AcademyEnrollment;
  } else {
    const { data, error: insertError } = await supabase.from("academy_enrollments").insert({ student_id: typedPayment.student_id, course_id: typedPayment.course_id, status: "active", access_source: "payment", payment_reference: typedPayment.provider_reference ?? typedPayment.id, amount_paid: typedPayment.amount, currency: typedPayment.currency, validated_at: new Date().toISOString() }).select("*").single();
    if (insertError) throw insertError;
    enrollment = data as AcademyEnrollment;
  }
  await supabase.from("academy_payments").update({ enrollment_id: enrollment.id }).eq("id", paymentId);
  return enrollment;
}

export async function getPaymentForStudent(paymentId: string, studentId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;
  const { data } = await supabase.from("academy_payments").select("*").eq("id", paymentId).eq("student_id", studentId).maybeSingle();
  return data as AcademyPayment | null;
}
