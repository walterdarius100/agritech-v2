"use client";

import { useActionState } from "react";

import { loginAdmin } from "@/lib/auth/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, {});

  return (
    <form action={formAction} className="space-y-5 rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
      <div>
        <label className="text-sm font-semibold text-slate-700" htmlFor="email">Email</label>
        <input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" id="email" name="email" type="email" required />
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-700" htmlFor="password">Mot de passe</label>
        <input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" id="password" name="password" type="password" required />
      </div>
      {state.error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p> : null}
      <button className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60" disabled={pending} type="submit">
        {pending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
