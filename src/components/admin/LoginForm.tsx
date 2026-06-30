"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAdmin } from "@/lib/auth/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, {});

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
          ADMIN AGRI-TECH
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-950">
          Connexion à l’administration
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Accédez à votre espace sécurisé pour gérer les articles et les
          contenus du site.
        </p>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label
          className="text-sm font-semibold text-slate-700"
          htmlFor="password"
        >
          Mot de passe
        </label>
        <input
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state.error ? (
        <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Connexion..." : "Se connecter"}
      </button>
      <Link
        className="block text-center text-sm font-semibold text-emerald-800 hover:text-emerald-950"
        href="/"
      >
        ← Retour au site
      </Link>
    </form>
  );
}
