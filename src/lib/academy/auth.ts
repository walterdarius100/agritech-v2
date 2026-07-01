import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
export const STUDENT_ACCESS_TOKEN_COOKIE = "agritech-student-access-token";
export const STUDENT_REFRESH_TOKEN_COOKIE = "agritech-student-refresh-token";
export type AcademyAuthState = { error?: string; success?: string };
export async function getCurrentStudentUser() { const token=(await cookies()).get(STUDENT_ACCESS_TOKEN_COOKIE)?.value; const supabase=createSupabaseAdminClient(); if(!token||!supabase) return null; const {data,error}=await supabase.auth.getUser(token); return error?null:data.user; }
export async function requireStudent() { const user=await getCurrentStudentUser(); if(!user) redirect("/academy/login"); return user; }
