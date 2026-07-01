import Link from "next/link";
import { notFound } from "next/navigation";

import { updateCourse } from "@/lib/academy/admin";
import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyCourse } from "@/types/academy";

type EditCoursePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

export default async function EditAcademyCoursePage({ params, searchParams }: EditCoursePageProps) {
  await requireAuthorizedAdmin();
  const { id } = await params;
  const query = await searchParams;
  const supabase = createSupabaseAdminClient();
  if (!supabase) notFound();

  const { data } = await supabase.from("academy_courses").select("*").eq("id", id).maybeSingle();
  const course = data as AcademyCourse | null;
  if (!course) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Modifier le cours</h1>
          <p className="mt-2 text-slate-600">{course.title}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white" href={`/admin/academy/courses/${course.id}/content`}>
            Gérer le contenu du cours
          </Link>
          <Link className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700" href="/admin/academy/courses">
            Retour aux cours
          </Link>
        </div>
      </div>

      {query.success ? <p className="mt-6 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800">Cours sauvegardé avec succès.</p> : null}
      {query.error ? <p className="mt-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{query.error}</p> : null}

      <form action={updateCourse} className="mt-6 grid gap-4 rounded-2xl bg-white p-6 ring-1 ring-slate-200 md:grid-cols-2">
        <input type="hidden" name="id" value={course.id} />
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Titre
          <input name="title" required defaultValue={course.title} className="rounded-xl border border-slate-200 p-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Slug
          <input name="slug" required defaultValue={course.slug} className="rounded-xl border border-slate-200 p-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Catégorie
          <input name="category" required defaultValue={course.category} className="rounded-xl border border-slate-200 p-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Image de couverture
          <input name="coverImageUrl" defaultValue={course.cover_image_url ?? ""} className="rounded-xl border border-slate-200 p-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Niveau
          <select name="level" defaultValue={course.level ?? ""} className="rounded-xl border border-slate-200 p-3 font-normal">
            <option value="">Non défini</option>
            <option value="beginner">Débutant</option>
            <option value="intermediate">Intermédiaire</option>
            <option value="advanced">Avancé</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Durée
          <input name="duration" defaultValue={course.duration ?? ""} className="rounded-xl border border-slate-200 p-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Prix
          <input name="priceAmount" type="number" step="0.01" defaultValue={course.price_amount ?? ""} className="rounded-xl border border-slate-200 p-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Devise
          <input name="priceCurrency" defaultValue={course.price_currency ?? "HTG"} className="rounded-xl border border-slate-200 p-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Statut
          <select name="status" defaultValue={course.status} className="rounded-xl border border-slate-200 p-3 font-normal">
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
            <option value="archived">Archivé</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Date de publication
          <input name="publishedAt" type="datetime-local" defaultValue={toDatetimeLocal(course.published_at)} className="rounded-xl border border-slate-200 p-3 font-normal" />
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700">
          <input name="isFree" type="checkbox" defaultChecked={course.is_free} />
          Cours gratuit
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
          Description courte
          <textarea name="shortDescription" defaultValue={course.short_description ?? ""} className="min-h-24 rounded-xl border border-slate-200 p-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
          Description complète
          <textarea name="description" defaultValue={course.description ?? ""} className="min-h-40 rounded-xl border border-slate-200 p-3 font-normal" />
        </label>
        <button className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white md:col-span-2" type="submit">
          Sauvegarder
        </button>
      </form>
    </div>
  );
}
