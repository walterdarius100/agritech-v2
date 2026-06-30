import Link from "next/link";

import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center bg-slate-50 px-4 py-16">
      <div className="mx-auto w-full max-w-md">
        <Link className="text-sm font-semibold text-emerald-800" href="/">
          ← Retour au site
        </Link>
        <div className="my-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
            ADMIN AGRI-TECH
          </p>
          <h1 className="mt-3 text-2xl font-bold text-slate-950">
            Connexion à l’administration
          </h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
