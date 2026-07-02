import { NextResponse } from "next/server";
import { getCurrentStudentUser } from "@/lib/academy/auth";
import { hasActiveEnrollment } from "@/lib/academy/courses";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { createProviderPayment, isCheckoutEnabled, normalizePaymentProvider } from "@/lib/payments";

export async function POST(request: Request) {
  const user = await getCurrentStudentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!isCheckoutEnabled()) return NextResponse.json({ error: "Checkout disabled." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const provider = normalizePaymentProvider(body.provider);
  if (!provider || typeof body.courseSlug !== "string") return NextResponse.json({ error: "Invalid payment request." }, { status: 400 });
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  const { data: course } = await supabase.from("academy_courses").select("*").eq("slug", body.courseSlug).eq("status", "published").maybeSingle();
  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
  if (await hasActiveEnrollment(user.id, course.id)) return NextResponse.json({ redirectTo: `/academy/cours/${course.slug}/apprendre`, status: "paid" });
  if (course.is_free) return NextResponse.json({ error: "This course is free; checkout is not required." }, { status: 400 });
  const amount = Number(course.price_amount);
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Prix non configuré." }, { status: 400 });
  const origin = new URL(request.url).origin;
  const { data: payment, error } = await supabase.from("academy_payments").insert({ student_id: user.id, course_id: course.id, provider, amount, currency: course.price_currency ?? "HTG", status: "pending", metadata: { courseSlug: course.slug } }).select("*").single();
  if (error || !payment) return NextResponse.json({ error: "Unable to create payment." }, { status: 500 });
  const result = await createProviderPayment({ studentId: user.id, courseId: course.id, amount, currency: course.price_currency === "USD" ? "USD" : "HTG", provider, courseSlug: course.slug, returnUrl: `${origin}/academy/payment/success?paymentId=${payment.id}`, cancelUrl: `${origin}/academy/payment/cancel?paymentId=${payment.id}&course=${course.slug}`, paymentId: payment.id });
  await supabase.from("academy_payments").update({ provider_reference: result.providerReference ?? null, provider_checkout_url: result.checkoutUrl ?? null, provider_payload: { instructions: result.instructions ?? null } }).eq("id", payment.id);
  return NextResponse.json(result);
}
