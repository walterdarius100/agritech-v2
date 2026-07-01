import Link from "next/link";

import { createCourse } from "@/lib/academy/admin";
import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";

export default async function NewAcademyCoursePage() {
  await requireAuthorizedAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Nouveau cours Academy</h1>
          <p className="mt-2 text-slate-600">Renseignez les informations publiques, pédagogiques et formateur du cours.</p>
        </div>
        <Link className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700" href="/admin/academy/courses">
          Retour aux cours
        </Link>
      </div>

      <form action={createCourse} className="mt-6 grid gap-4 rounded-2xl bg-white p-6 ring-1 ring-slate-200 md:grid-cols-2">
        <input name="title" required placeholder="Titre du cours" className="rounded-xl border border-slate-200 p-3" />
        <input name="slug" required placeholder="slug-du-cours" className="rounded-xl border border-slate-200 p-3" />
        <input name="category" placeholder="Catégorie" className="rounded-xl border border-slate-200 p-3" />
        <input name="coverImageUrl" placeholder="Image de couverture" className="rounded-xl border border-slate-200 p-3" />
        <input name="duration" placeholder="Durée" className="rounded-xl border border-slate-200 p-3" />
        <select name="level" className="rounded-xl border border-slate-200 p-3" defaultValue="">
          <option value="">Niveau non défini</option>
          <option value="beginner">Débutant</option>
          <option value="intermediate">Intermédiaire</option>
          <option value="advanced">Avancé</option>
        </select>
        <input name="priceAmount" type="number" step="0.01" placeholder="Prix" className="rounded-xl border border-slate-200 p-3" />
        <input name="priceCurrency" defaultValue="HTG" placeholder="Devise" className="rounded-xl border border-slate-200 p-3" />
        <select name="status" className="rounded-xl border border-slate-200 p-3" defaultValue="draft">
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>
        <input name="publishedAt" type="datetime-local" className="rounded-xl border border-slate-200 p-3" />
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 font-semibold text-slate-700">
          <input name="isFree" type="checkbox" /> Cours gratuit
        </label>
        <textarea name="shortDescription" placeholder="Description courte" className="min-h-24 rounded-xl border border-slate-200 p-3 md:col-span-2" />
        <textarea name="description" placeholder="Description détaillée" className="min-h-40 rounded-xl border border-slate-200 p-3 md:col-span-2" />
        <textarea name="certificationDescription" placeholder="Texte certification / conditions" className="min-h-28 rounded-xl border border-slate-200 p-3 md:col-span-2" />
        <input name="instructorName" placeholder="Nom du formateur principal" className="rounded-xl border border-slate-200 p-3" />
        <input name="instructorRole" placeholder="Titre ou rôle du formateur" className="rounded-xl border border-slate-200 p-3" />
        <input name="instructorImageUrl" placeholder="Image du formateur" className="rounded-xl border border-slate-200 p-3 md:col-span-2" />
        <textarea name="instructorBio" placeholder="Bio courte du formateur" className="min-h-28 rounded-xl border border-slate-200 p-3 md:col-span-2" />
        <button className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white md:col-span-2" type="submit">
          Créer le cours
        </button>
      </form>
    </div>
  );
}
