import { NextResponse } from "next/server";
import { getCurrentStudentUser } from "@/lib/academy/auth";
import { getPaymentForStudent } from "@/lib/academy/payments";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
export async function POST(request: Request) {
 const user=await getCurrentStudentUser(); if(!user) return NextResponse.json({error:"Authentication required."},{status:401});
 const { paymentId }=await request.json().catch(()=>({})); if(typeof paymentId!=="string") return NextResponse.json({error:"Invalid paymentId."},{status:400});
 const payment=await getPaymentForStudent(paymentId,user.id); if(!payment) return NextResponse.json({error:"Payment not found."},{status:404});
 const supabase=createSupabaseAdminClient();
 const { data: course } = supabase ? await supabase.from("academy_courses").select("slug").eq("id", payment.course_id).maybeSingle() : { data: null };
 return NextResponse.json({ status: payment.status, redirectTo: payment.status === "paid" && course ? `/academy/cours/${course.slug}/apprendre` : undefined });
}
