import Link from "next/link";
import { ResourceForm } from "@/components/admin/academy/CourseContentForms";
import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyLesson } from "@/types/academy";
export default async function NewResourcePage({ params }: { params: Promise<{ id: string }> }) { await requireAuthorizedAdmin(); const { id } = await params; const s=createSupabaseAdminClient(); const {data}=s?await s.from("academy_lessons").select("*").eq("course_id",id).order("position"):{data:[]}; return <div><Link className="font-semibold text-emerald-800" href={`/admin/academy/courses/${id}/content`}>← Retour au contenu</Link><h1 className="mt-4 text-3xl font-bold">Ajouter une ressource</h1><div className="mt-6"><ResourceForm courseId={id} lessons={(data??[]) as AcademyLesson[]} /></div></div>; }
