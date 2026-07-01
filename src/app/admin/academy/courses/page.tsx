import Link from "next/link";

import { createCourse } from "@/lib/academy/admin";
import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyCourse } from "@/types/academy";

export default async function CoursesAdmin() {
  await requireAuthorizedAdmin();
  const supabase = createSupabaseAdminClient();
  const { data } = supabase
    ? await supabase.from("academy_courses").select("*").order("created_at", { ascending: false })
    : { data: [] };
  const courses = (data ?? []) as AcademyCourse[];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4"><h1 className="text-3xl font-bold">Cours Academy</h1><Link className="rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white" href="/admin/academy/courses/new">Nouveau cours</Link></div>
      <p className="mt-2 text-slate-600">Créez un cours simple puis modifiez-le depuis la liste.</p>

      <form action={createCourse} className="mt-6 grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200 md:grid-cols-2">
        <input name="title" required placeholder="Titre" className="rounded border p-2" />
        <input name="slug" required placeholder="slug" className="rounded border p-2" />
        <input name="category" placeholder="Catégorie" className="rounded border p-2" />
        <input name="duration" placeholder="Durée" className="rounded border p-2" />
        <select name="level" className="rounded border p-2" defaultValue="beginner">
          <option value="beginner">Débutant</option>
          <option value="intermediate">Intermédiaire</option>
          <option value="advanced">Avancé</option>
        </select>
        <select name="status" className="rounded border p-2" defaultValue="draft">
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>
        <input name="priceAmount" type="number" step="0.01" placeholder="Prix" className="rounded border p-2" />
        <input name="priceCurrency" defaultValue="HTG" className="rounded border p-2" />
        <input name="coverImageUrl" placeholder="URL image de couverture" className="rounded border p-2 md:col-span-2" />
        <label className="flex items-center gap-2">
          <input name="isFree" type="checkbox" /> Gratuit
        </label>
        <textarea name="shortDescription" placeholder="Description courte" className="rounded border p-2 md:col-span-2" />
        <textarea name="description" placeholder="Description détaillée" className="rounded border p-2 md:col-span-2" />
        <textarea name="certificationDescription" placeholder="Texte certification / conditions" className="rounded border p-2 md:col-span-2" />
        <input name="instructorName" placeholder="Nom du formateur principal" className="rounded border p-2" />
        <input name="instructorRole" placeholder="Titre ou rôle du formateur" className="rounded border p-2" />
        <input name="instructorImageUrl" placeholder="URL image du formateur" className="rounded border p-2 md:col-span-2" />
        <textarea name="instructorBio" placeholder="Bio courte du formateur" className="rounded border p-2 md:col-span-2" />
        <button className="rounded-xl bg-emerald-700 px-4 py-2 text-white md:col-span-2" type="submit">
          Créer le cours
        </button>
      </form>

      <div className="mt-8 overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-4">Titre</th>
              <th>Slug</th>
              <th>Statut</th>
              <th>Prix</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-t border-slate-100">
                <td className="p-4 font-semibold">{course.title}</td>
                <td>{course.slug}</td>
                <td>{course.status}</td>
                <td>{course.is_free ? "Gratuit" : `${course.price_amount ?? "—"} ${course.price_currency ?? "HTG"}`}</td>
                <td className="space-x-3">
                  <Link className="font-semibold text-emerald-800" href={`/admin/academy/courses/${course.id}/edit`}>
                    Modifier
                  </Link>
                  <Link className="font-semibold text-emerald-800" href={`/admin/academy/courses/${course.id}/content`}>
                    Contenu
                  </Link>
                  <Link className="font-semibold text-emerald-800" href={`/academy/cours/${course.slug}`}>
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {courses.length === 0 ? <p className="p-6 text-slate-500">Aucun cours Academy pour le moment.</p> : null}
      </div>
    </div>
  );
}
