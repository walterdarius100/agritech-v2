"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { registerStudent } from "@/lib/academy/authActions";

function getSafeClientNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "";
  return value;
}

function AcademyRegisterForm() {
  const searchParams = useSearchParams();
  const next = getSafeClientNext(searchParams.get("next"));
  const loginHref = next ? `/academy/login?next=${encodeURIComponent(next)}` : "/academy/login";
  const [state, action, pending] = useActionState(registerStudent, {});

  return (
    <main className="min-h-screen bg-[#f8faf7] px-4 py-16">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-emerald-100">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Compte étudiant</p>
        <h1 className="mt-3 text-3xl font-bold text-emerald-950">Créer mon accès Academy</h1>
        {next.includes("type=academy-access") ? (
          <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
            Votre formation sélectionnée est conservée. Après la création du compte, vous serez redirigé vers le formulaire de demande d’accès.
          </p>
        ) : null}
        <form action={action} className="mt-6 grid gap-4">
          <input name="next" type="hidden" value={next} />
          <input name="fullName" required placeholder="Nom complet" className="rounded-xl border p-3" />
          <input name="email" type="email" required placeholder="Email" className="rounded-xl border p-3" />
          <input name="password" type="password" required minLength={6} placeholder="Mot de passe" className="rounded-xl border p-3" />
          <input name="phone" placeholder="Téléphone" className="rounded-xl border p-3" />
          <input name="organization" placeholder="Organisation (optionnel)" className="rounded-xl border p-3" />
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state.success && <p className="text-sm text-emerald-700">{state.success}</p>}
          <button disabled={pending} className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white">Créer mon compte</button>
        </form>
        <p className="mt-5 text-sm">Déjà inscrit ? <Link className="font-semibold text-emerald-700" href={loginHref}>Se connecter</Link></p>
      </div>
    </main>
  );
}

export default function AcademyRegisterPage() {
  return <Suspense fallback={null}><AcademyRegisterForm /></Suspense>;
}
