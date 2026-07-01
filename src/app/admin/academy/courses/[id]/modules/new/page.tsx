import Link from "next/link";
import { ModuleForm } from "@/components/admin/academy/CourseContentForms";
import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
export default async function NewModulePage({ params }: { params: Promise<{ id: string }> }) { await requireAuthorizedAdmin(); const { id } = await params; return <div><Link className="font-semibold text-emerald-800" href={`/admin/academy/courses/${id}/content`}>← Retour au contenu</Link><h1 className="mt-4 text-3xl font-bold">Ajouter un module</h1><div className="mt-6"><ModuleForm courseId={id} /></div></div>; }
