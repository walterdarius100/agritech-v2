import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { runSupabaseDiagnostics } from "@/lib/supabase/diagnostics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Diagnostic Supabase",
};

function formatBoolean(value: boolean) {
  return value ? "oui" : "non";
}

export default async function SupabaseDebugPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const diagnostics = await runSupabaseDiagnostics();

  const rows = [
    ["Supabase URL présente", formatBoolean(diagnostics.supabaseUrlPresent)],
    ["Anon key présente", formatBoolean(diagnostics.supabaseAnonKeyPresent)],
    ["NEXT_PUBLIC_SITE_URL présente", formatBoolean(diagnostics.siteUrlPresent)],
    ["Format URL Supabase valide", formatBoolean(diagnostics.supabaseUrlValid)],
    ["Client Supabase créé", formatBoolean(diagnostics.clientCreated)],
    [
      "Test requête articles",
      diagnostics.articlesQuerySucceeded ? "succès" : "échec",
    ],
    [
      "Nombre d’articles publiés trouvés",
      diagnostics.publishedArticlesCount === null
        ? "non disponible"
        : diagnostics.publishedArticlesCount.toString(),
    ],
    [
      "Longueur anon key",
      `${diagnostics.supabaseAnonKeyLength} caractères`,
    ],
    [
      "Préfixe anon key",
      diagnostics.supabaseAnonKeyPrefix || "non disponible",
    ],
  ];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 text-slate-900">
      <h1 className="text-3xl font-bold">Diagnostic de connexion Supabase</h1>
      <p className="mt-3 text-sm text-slate-600">
        Cette page est uniquement disponible hors production. Elle ne révèle
        jamais la clé anon complète ni la clé service role.
      </p>

      <dl className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_1.2fr]"
          >
            <dt className="font-medium text-slate-700">{label}</dt>
            <dd className="break-words font-mono text-sm text-slate-950">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {diagnostics.errorMessage ? (
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-900">
            Message d’erreur technique
          </h2>
          <p className="mt-2 break-words font-mono text-sm text-red-800">
            {diagnostics.errorMessage}
          </p>
        </section>
      ) : null}
    </main>
  );
}
