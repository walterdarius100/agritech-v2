import { NextResponse } from "next/server";
import { getCurrentStudentUser } from "@/lib/academy/auth";
import { sendAcademyPurchaseEmails } from "@/lib/academy/emails";
import { activateCourseAccessAfterPayment, getPaymentForStudent } from "@/lib/academy/payments";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getAcademyPaymentsMode } from "@/lib/payments";

export async function POST(request: Request) {
  console.info("[academy-payment] mock payment confirmation started");
  if (getAcademyPaymentsMode() !== "mock") return NextResponse.json({ error: "Mock payments are disabled." }, { status: 403 });

  const user = await getCurrentStudentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { paymentId, result } = await request.json().catch(() => ({}));
  console.info("[academy-payment] payment id/request id", { paymentId: typeof paymentId === "string" ? paymentId : null });
  if (typeof paymentId !== "string" || !["success", "failed", "cancelled"].includes(result)) {
    return NextResponse.json({ error: "Invalid mock confirmation." }, { status: 400 });
  }

  const payment = await getPaymentForStudent(paymentId, user.id);
  if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  console.info("[academy-payment] payment status before update", { paymentId, status: payment.status });

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server not configured." }, { status: 500 });

  const status = result === "success" ? "paid" : result;
  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("academy_payments")
    .update({ status, paid_at: status === "paid" ? now : null, verified_at: status === "paid" ? now : null })
    .eq("id", paymentId)
    .eq("student_id", user.id);

  console.info("[academy-payment] payment update success true/false", { paymentId, success: !updateError });
  if (updateError) return NextResponse.json({ error: "Payment update failed." }, { status: 500 });

  if (status === "paid") {
    try {
      const enrollment = await activateCourseAccessAfterPayment(paymentId);
      console.info("[academy-payment] enrollment/access activation success true/false", { paymentId, success: Boolean(enrollment?.id) });
    } catch (error) {
      console.error("[academy-payment] enrollment/access activation success true/false", {
        paymentId,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return NextResponse.json({ error: "Access activation failed." }, { status: 500 });
    }

    try {
      await sendAcademyPurchaseEmails({
        paymentId,
        studentEmail: user.email,
        studentName: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null,
      });
    } catch (error) {
      console.error("[academy-email] unexpected Academy email workflow error", {
        paymentId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    status,
    redirectTo: status === "paid" ? `/academy/payment/success?paymentId=${paymentId}` : `/academy/payment/cancel?paymentId=${paymentId}`,
  });
}
