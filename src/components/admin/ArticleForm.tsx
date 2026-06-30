"use client";

import { useActionState } from "react";

import type { ArticleFormState } from "@/lib/articles/adminArticles";
import type { ArticleStatus } from "@/types/article";

type Defaults = {
  title: string; slug: string; category: string; excerpt: string; cover_image_url: string;
  author: string; content: string; status: ArticleStatus; featured: boolean; reading_time: string; published_at: string;
};

type ArticleFormProps = {
  action: (state: ArticleFormState, formData: FormData) => Promise<ArticleFormState>;
  defaults: Defaults;
  submitLabel: string;
};

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function ArticleForm({ action, defaults, submitLabel }: ArticleFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      {state.error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{state.error}</p> : null}
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Titre" name="title" required defaultValue={defaults.title} />
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="slug">Slug</label>
          <div className="mt-2 flex gap-2">
            <input className="w-full rounded-xl border border-slate-300 px-4 py-3" id="slug" name="slug" required defaultValue={defaults.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" />
            <button className="rounded-xl border border-emerald-700 px-3 text-sm font-semibold text-emerald-800" type="button" onClick={() => {
              const title = document.querySelector<HTMLInputElement>("input[name='title']")?.value ?? "";
              const slug = document.querySelector<HTMLInputElement>("input[name='slug']");
              if (slug) slug.value = slugify(title);
            }}>Générer</button>
          </div>
        </div>
        <Field label="Catégorie" name="category" required defaultValue={defaults.category} />
        <Field label="Auteur" name="author" required defaultValue={defaults.author} />
        <Field label="Temps de lecture" name="reading_time" defaultValue={defaults.reading_time} />
        <Field label="Date de publication" name="published_at" type="datetime-local" defaultValue={defaults.published_at} />
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-700" htmlFor="cover_image_url">URL image de couverture</label>
        <input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" id="cover_image_url" name="cover_image_url" type="url" defaultValue={defaults.cover_image_url} />
        <p className="mt-2 text-sm text-slate-500">L’upload d’image sera ajouté dans une prochaine étape. Pour le moment, collez une URL d’image publique.</p>
      </div>
      <Textarea label="Extrait" name="excerpt" required rows={3} defaultValue={defaults.excerpt} />
      <Textarea label="Contenu" name="content" required rows={14} defaultValue={defaults.content} />
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="status">Statut</label>
          <select className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" id="status" name="status" defaultValue={defaults.status}>
            <option value="draft">Brouillon</option><option value="published">Publié</option><option value="archived">Archivé</option>
          </select>
        </div>
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
          <input name="featured" type="checkbox" defaultChecked={defaults.featured} /> Article à la une
        </label>
      </div>
      <button className="rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60" disabled={pending} type="submit">{pending ? "Enregistrement..." : submitLabel}</button>
    </form>
  );
}

function Field({ label, name, type = "text", required = false, defaultValue = "" }: { label: string; name: string; type?: string; required?: boolean; defaultValue?: string }) {
  return <div><label className="text-sm font-semibold text-slate-700" htmlFor={name}>{label}</label><input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" id={name} name={name} type={type} required={required} defaultValue={defaultValue} /></div>;
}
function Textarea({ label, name, rows, required, defaultValue }: { label: string; name: string; rows: number; required?: boolean; defaultValue: string }) {
  return <div><label className="text-sm font-semibold text-slate-700" htmlFor={name}>{label}</label><textarea className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" id={name} name={name} rows={rows} required={required} defaultValue={defaultValue} /></div>;
}
