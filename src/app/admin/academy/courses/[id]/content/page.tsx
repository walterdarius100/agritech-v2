import Link from "next/link";
import { notFound } from "next/navigation";

import { archiveLesson, archiveModule, archiveResource } from "@/lib/academy/admin";
import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyCourse, AcademyLesson, AcademyModule, AcademyResource } from "@/types/academy";

export default async function CourseContentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ success?: string; error?: string; archived?: string }> }) {
  await requireAuthorizedAdmin();
  const { id } = await params;
  const query = await searchParams;
  const supabase = createSupabaseAdminClient();
  if (!supabase) notFound();
  const [{ data: courseData }, { data: modulesData }, { data: lessonsData }, { data: resourcesData }] = await Promise.all([
    supabase.from("academy_courses").select("*").eq("id", id).maybeSingle(),
    supabase.from("academy_modules").select("*").eq("course_id", id).order("position"),
    supabase.from("academy_lessons").select("*").eq("course_id", id).order("position"),
    supabase.from("academy_resources").select("*").eq("course_id", id).order("position"),
  ]);
  const course = courseData as AcademyCourse | null;
  if (!course) notFound();
  const modules = (modulesData ?? []) as AcademyModule[];
  const lessons = (lessonsData ?? []) as AcademyLesson[];
  const resources = (resourcesData ?? []) as AcademyResource[];

  return <div>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase text-emerald-700">Contenu pédagogique</p><h1 className="text-3xl font-bold">Cours : {course.title}</h1><p className="mt-2 text-slate-600">Organisez modules, leçons, vidéos et ressources.</p></div><Link className="rounded-xl border bg-white px-4 py-2 font-semibold" href="/admin/academy/courses">Retour aux cours</Link></div>
    {query.success ? <p className="mt-5 rounded-xl bg-emerald-50 p-4 font-semibold text-emerald-800">Contenu sauvegardé.</p> : null}
    {query.archived ? <p className="mt-5 rounded-xl bg-amber-50 p-4 font-semibold text-amber-800">Élément archivé.</p> : null}
    {query.error ? <p className="mt-5 rounded-xl bg-red-50 p-4 font-semibold text-red-700">{query.error}</p> : null}
    <div className="mt-6 flex flex-wrap gap-3"><Link className="rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white" href={`/admin/academy/courses/${id}/modules/new`}>Ajouter un module</Link><Link className="rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white" href={`/admin/academy/courses/${id}/lessons/new`}>Ajouter une leçon</Link><Link className="rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white" href={`/admin/academy/courses/${id}/resources/new`}>Ajouter une ressource</Link></div>
    <div className="mt-8 space-y-5">{modules.map((module) => <section key={module.id} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-bold">Module {module.position} : {module.title}</h2><p className="text-sm text-slate-500">{module.status} — {module.description}</p></div><div className="flex gap-3"><Link className="font-semibold text-emerald-800" href={`/admin/academy/courses/${id}/modules/${module.id}/edit`}>Modifier</Link><form action={archiveModule}><input type="hidden" name="courseId" value={id}/><input type="hidden" name="id" value={module.id}/><button className="font-semibold text-amber-700">Archiver</button></form></div></div><ul className="mt-4 space-y-2">{lessons.filter((lesson) => lesson.module_id === module.id).map((lesson) => <li key={lesson.id} className="rounded-xl border p-3"><div className="flex flex-wrap justify-between gap-3"><span>Leçon {lesson.position} : <strong>{lesson.title}</strong> — {lesson.status}{lesson.video_url ? " — vidéo" : ""}</span><span className="flex gap-3"><Link className="text-emerald-800" href={`/admin/academy/courses/${id}/lessons/${lesson.id}/edit`}>Modifier</Link><form action={archiveLesson}><input type="hidden" name="courseId" value={id}/><input type="hidden" name="id" value={lesson.id}/><button className="text-amber-700">Archiver</button></form></span></div>{resources.filter((resource) => resource.lesson_id === lesson.id).map((resource) => <div key={resource.id} className="mt-2 flex justify-between rounded-lg bg-slate-50 p-2 text-sm"><span>Ressource : {resource.title} — {resource.resource_type}</span><Link className="text-emerald-800" href={`/admin/academy/courses/${id}/resources/${resource.id}/edit`}>Modifier</Link></div>)}</li>)}</ul></section>)}{lessons.filter((lesson) => !lesson.module_id).length ? <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"><h2 className="text-xl font-bold">Leçons sans module</h2>{lessons.filter((lesson) => !lesson.module_id).map((lesson) => <Link key={lesson.id} className="mt-3 block rounded-xl border p-3" href={`/admin/academy/courses/${id}/lessons/${lesson.id}/edit`}>{lesson.title}</Link>)}</section> : null}<section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"><h2 className="text-xl font-bold">Ressources du cours</h2>{resources.filter((resource) => !resource.lesson_id).map((resource) => <div key={resource.id} className="mt-3 flex justify-between rounded-xl border p-3"><span>{resource.title} — {resource.resource_type}</span><span className="flex gap-3"><Link className="text-emerald-800" href={`/admin/academy/courses/${id}/resources/${resource.id}/edit`}>Modifier</Link><form action={archiveResource}><input type="hidden" name="courseId" value={id}/><input type="hidden" name="id" value={resource.id}/><button className="text-red-700">Retirer</button></form></span></div>)}</section></div>
  </div>;
}
