import { NextResponse } from "next/server";
import { getCurrentStudentUser } from "@/lib/academy/auth";
import { activateCourseAccessAfterPayment, getPaymentForStudent } from "@/lib/academy/payments";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getAcademyPaymentsMode } from "@/lib/payments";
export async function POST(request: Request) {
 if (getAcademyPaymentsMode() !== "mock") return NextResponse.json({ error:"Mock payments are disabled." }, { status:403 });
 const user=await getCurrentStudentUser(); if(!user) return NextResponse.json({error:"Authentication required."},{status:401});
 const { paymentId, result } = await request.json().catch(()=>({}));
 if(typeof paymentId!=="string" || !["success","failed","cancelled"].includes(result)) return NextResponse.json({error:"Invalid mock confirmation."},{status:400});
 const payment=await getPaymentForStudent(paymentId,user.id); if(!payment) return NextResponse.json({error:"Payment not found."},{status:404});
 const supabase=createSupabaseAdminClient(); if(!supabase) return NextResponse.json({error:"Server not configured."},{status:500});
 const status = result === "success" ? "paid" : result;
 const now=new Date().toISOString();
 await supabase.from("academy_payments").update({ status, paid_at: status==="paid"?now:null, verified_at: status==="paid"?now:null }).eq("id", paymentId).eq("student_id", user.id);
 if(status==="paid") await activateCourseAccessAfterPayment(paymentId);
 return NextResponse.json({ status, redirectTo: status==="paid" ? `/academy/payment/success?paymentId=${paymentId}` : `/academy/payment/cancel?paymentId=${paymentId}` });
}
