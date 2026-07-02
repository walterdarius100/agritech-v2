"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { loginStudent } from "@/lib/academy/authActions";

function getSafeClientNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "";
  return value;
}

function AcademyLoginForm() {
  const searchParams = useSearchParams();
  const next = getSafeClientNext(searchParams.get("next"));
  const registerHref = next ? `/academy/register?next=${encodeURIComponent(next)}` : "/academy/register";
  const [state, action, pending] = useActionState(loginStudent, {});

  return (
    <main className="min-h-screen bg-emerald-950 px-4 py-16 text-white">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Agri-tech Academy</p>
        <h1 className="mt-3 text-3xl font-bold">Connexion étudiant</h1>
        {next.includes("type=academy-access") ? (
          <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
            Connectez-vous pour continuer vers votre demande d’accès Academy préremplie.
          </p>
        ) : null}
        <form action={action} className="mt-6 space-y-4">
          <input name="next" type="hidden" value={next} />
          <input name="email" type="email" required placeholder="Email" className="w-full rounded-xl border p-3" />
          <input name="password" type="password" required placeholder="Mot de passe" className="w-full rounded-xl border p-3" />
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state.success && <p className="text-sm text-emerald-700">{state.success}</p>}
          <button disabled={pending} className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white">Se connecter</button>
        </form>
        <p className="mt-5 text-sm">Pas encore inscrit ? <Link className="font-semibold text-emerald-700" href={registerHref}>Créer un compte</Link></p>
      </div>
    </main>
  );
}

export default function AcademyLoginPage() {
  return <Suspense fallback={null}><AcademyLoginForm /></Suspense>;
}
