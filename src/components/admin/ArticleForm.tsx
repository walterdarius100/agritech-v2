"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useActionState, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import type { ArticleFormState } from "@/lib/articles/adminArticles";
import type { ArticleStatus } from "@/types/article";

type Defaults = {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  cover_image_url: string;
  author: string;
  content: string;
  status: ArticleStatus;
  featured: boolean;
  reading_time: string;
  published_at: string;
};

type ArticleFormProps = {
  action: (
    state: ArticleFormState,
    formData: FormData,
  ) => Promise<ArticleFormState>;
  defaults: Defaults;
  submitLabel: string;
  mode?: "create" | "edit";
};

const uploadTypes = ["image/jpeg", "image/png", "image/webp"];
const maxUploadSize = 4 * 1024 * 1024;

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isLikelyHtml(value: string) {
  return /<([a-z][\w-]*)(\s[^>]*)?>[\s\S]*<\/\1>|<(br|hr|img)\b[^>]*>/i.test(
    value,
  );
}

function textToHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function ArticleForm({
  action,
  defaults,
  submitLabel,
  mode = "create",
}: ArticleFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const [coverImageUrl, setCoverImageUrl] = useState(defaults.cover_image_url);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editorHtml, setEditorHtml] = useState(() =>
    isLikelyHtml(defaults.content)
      ? defaults.content
      : textToHtml(defaults.content),
  );
  const [status, setStatus] = useState<ArticleStatus>(defaults.status);
  const [publishedAt, setPublishedAt] = useState(defaults.published_at);
  const editorRef = useRef<HTMLDivElement>(null);
  const previewHref = useMemo(
    () =>
      defaults.slug && defaults.status === "published"
        ? `/articles/${defaults.slug}`
        : "",
    [defaults.slug, defaults.status],
  );

  function runCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setEditorHtml(editorRef.current?.innerHTML ?? "");
  }

  function runPromptCommand(command: "createLink" | "insertImage") {
    const label = command === "createLink" ? "URL du lien" : "URL de l’image";
    const value = window.prompt(label);
    if (value) runCommand(command, value);
  }

  async function handleUpload(file: File | null) {
    setUploadError(null);
    setUploadStatus(null);
    if (!file) return;
    if (!uploadTypes.includes(file.type)) {
      setUploadError("Format invalide. Utilisez JPG, PNG ou WebP.");
      return;
    }
    if (file.size > maxUploadSize) {
      setUploadError("Image trop lourde. Taille maximale : 4 Mo.");
      return;
    }

    const body = new FormData();
    body.append("file", file);
    setUploadStatus("Upload en cours...");

    try {
      const response = await fetch("/admin/articles/upload-cover", {
        method: "POST",
        body,
      });
      const result = (await response.json()) as {
        url?: string;
        error?: string;
      };
      if (!response.ok || !result.url) {
        setUploadError(result.error ?? "Erreur pendant l’upload de l’image.");
        setUploadStatus(null);
        return;
      }
      setCoverImageUrl(result.url);
      setUploadStatus("Image uploadée avec succès.");
    } catch {
      setUploadError("Erreur réseau pendant l’upload de l’image.");
      setUploadStatus(null);
    }
  }

  function submitWithIntent(intent: "draft" | "publish" | "update") {
    if (intent === "draft") setStatus("draft");
    if (intent === "publish") {
      setStatus("published");
      if (!publishedAt) setPublishedAt(new Date().toISOString().slice(0, 16));
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          {state.success}
        </p>
      ) : null}

      <Section title="Informations de l’article">
        <Field
          label="Titre"
          name="title"
          required
          defaultValue={defaults.title}
          className="md:col-span-2"
        />
        <div>
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="slug"
          >
            Slug
          </label>
          <div className="mt-2 flex gap-2">
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              id="slug"
              name="slug"
              required
              defaultValue={defaults.slug}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
            />
            <button
              className="rounded-xl border border-emerald-700 px-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
              type="button"
              onClick={() => {
                const title =
                  document.querySelector<HTMLInputElement>(
                    "input[name='title']",
                  )?.value ?? "";
                const slug =
                  document.querySelector<HTMLInputElement>(
                    "input[name='slug']",
                  );
                if (slug) slug.value = slugify(title);
              }}
            >
              Générer
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Utilisez des minuscules, des chiffres et des tirets. Exemple :
            article-test-agritech
          </p>
        </div>
        <Field
          label="Catégorie"
          name="category"
          required
          defaultValue={defaults.category}
        />
        <Textarea
          label="Résumé / Extrait"
          name="excerpt"
          required
          rows={3}
          defaultValue={defaults.excerpt}
          className="md:col-span-2"
        />
        <Field
          label="Auteur"
          name="author"
          required
          defaultValue={defaults.author}
        />
        <Field
          label="Durée de lecture"
          name="reading_time"
          defaultValue={defaults.reading_time}
        />
      </Section>

      <Section
        title="Image de couverture"
        description="Collez une URL publique ou uploadez une image dans le bucket Supabase Storage article-images."
      >
        <div>
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="cover_image_url"
          >
            URL image de couverture
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
            id="cover_image_url"
            name="cover_image_url"
            type="url"
            value={coverImageUrl}
            onChange={(event) => setCoverImageUrl(event.target.value)}
          />
          <p className="mt-2 text-xs text-slate-500">
            URL publique JPG, PNG ou WebP utilisée comme image principale.
          </p>
        </div>
        <div>
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="cover_upload"
          >
            Uploader une image
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm"
            id="cover_upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) =>
              void handleUpload(event.target.files?.[0] ?? null)
            }
          />
          <p className="mt-2 text-xs text-slate-500">
            Formats acceptés : JPG, PNG, WebP. Taille maximale : 4 Mo.
          </p>
          {uploadStatus ? (
            <p className="mt-2 text-sm font-medium text-emerald-700">
              {uploadStatus}
            </p>
          ) : null}
          {uploadError ? (
            <p className="mt-2 text-sm font-medium text-red-700">
              {uploadError}
            </p>
          ) : null}
        </div>
        <div className="md:col-span-2">
          <p className="text-sm font-semibold text-slate-700">
            Aperçu de l’image
          </p>
          {coverImageUrl ? (
            <img
              className="mt-2 h-64 w-full rounded-2xl border border-slate-200 object-cover"
              src={coverImageUrl}
              alt="Aperçu de l’image de couverture"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="mt-2 flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
              Aucun aperçu disponible
            </div>
          )}
        </div>
      </Section>

      <Section
        title="Contenu"
        description="Le contenu est enregistré en HTML propre et reste compatible avec les anciens articles en texte simple."
      >
        <input type="hidden" name="content" value={editorHtml} />
        <div className="md:col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-3">
            <ToolButton onClick={() => runCommand("formatBlock", "p")}>
              Paragraphe
            </ToolButton>
            <ToolButton onClick={() => runCommand("formatBlock", "h2")}>
              Titre
            </ToolButton>
            <ToolButton onClick={() => runCommand("bold")}>Gras</ToolButton>
            <ToolButton onClick={() => runCommand("italic")}>
              Italique
            </ToolButton>
            <ToolButton onClick={() => runCommand("insertUnorderedList")}>
              Puces
            </ToolButton>
            <ToolButton onClick={() => runCommand("insertOrderedList")}>
              Numérotée
            </ToolButton>
            <ToolButton onClick={() => runCommand("formatBlock", "blockquote")}>
              Citation
            </ToolButton>
            <ToolButton onClick={() => runCommand("insertHorizontalRule")}>
              Séparateur
            </ToolButton>
            <ToolButton onClick={() => runPromptCommand("createLink")}>
              Lien
            </ToolButton>
            <ToolButton onClick={() => runPromptCommand("insertImage")}>
              Image
            </ToolButton>
            <ToolButton onClick={() => runCommand("removeFormat")}>
              Nettoyer
            </ToolButton>
          </div>
          <div
            ref={editorRef}
            className="min-h-96 px-5 py-4 text-base leading-8 text-slate-700 outline-none"
            contentEditable
            suppressContentEditableWarning
            onInput={(event) => setEditorHtml(event.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: editorHtml }}
          />
        </div>
      </Section>

      <Section title="Publication">
        <div>
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="status"
          >
            Statut
          </label>
          <select
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
            id="status"
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as ArticleStatus)}
          >
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
            <option value="archived">Archivé</option>
          </select>
        </div>
        <Field
          label="Date de publication"
          name="published_at"
          type="datetime-local"
          value={publishedAt}
          onChange={setPublishedAt}
        />
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 md:col-span-2">
          <input
            name="featured"
            type="checkbox"
            defaultChecked={defaults.featured}
          />{" "}
          Article à la une
        </label>
        <div className="flex flex-wrap gap-3 pt-2 md:col-span-2">
          {mode === "create" ? (
            <>
              <button
                className="rounded-xl border border-emerald-700 px-5 py-3 font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-60"
                disabled={pending}
                type="submit"
                name="intent"
                value="draft"
                onClick={() => submitWithIntent("draft")}
              >
                {pending ? "Enregistrement..." : "Enregistrer comme brouillon"}
              </button>
              <button
                className="rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                disabled={pending}
                type="submit"
                name="intent"
                value="publish"
                onClick={() => submitWithIntent("publish")}
              >
                {pending ? "Publication..." : "Publier"}
              </button>
            </>
          ) : (
            <button
              className="rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
              disabled={pending}
              type="submit"
              name="intent"
              value="update"
              onClick={() => submitWithIntent("update")}
            >
              {pending ? "Mise à jour..." : submitLabel}
            </button>
          )}
          {previewHref ? (
            <Link
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              href={previewHref}
              target="_blank"
            >
              Aperçu
            </Link>
          ) : (
            <button
              className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-400"
              type="button"
              disabled
              title="Enregistrez et publiez l’article avant de prévisualiser."
            >
              Aperçu
            </button>
          )}
          <Link
            className="rounded-xl px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100"
            href="/admin/articles"
          >
            Annuler
          </Link>
        </div>
      </Section>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  value,
  onChange,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-semibold text-slate-700" htmlFor={name}>
        {label}
      </label>
      <input
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={value === undefined ? defaultValue : undefined}
        value={value}
        onChange={
          onChange ? (event) => onChange(event.target.value) : undefined
        }
      />
    </div>
  );
}
function Textarea({
  label,
  name,
  rows,
  required,
  defaultValue,
  className = "",
}: {
  label: string;
  name: string;
  rows: number;
  required?: boolean;
  defaultValue: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-semibold text-slate-700" htmlFor={name}>
        {label}
      </label>
      <textarea
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
        id={name}
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue}
      />
    </div>
  );
}
function ToolButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-800"
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
