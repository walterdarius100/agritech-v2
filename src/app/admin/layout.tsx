import Link from "next/link";

import { logoutAdmin } from "@/lib/auth/actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link className="text-lg font-bold text-emerald-800" href="/admin/articles">Admin Agri-tech</Link>
          <nav className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/admin/articles">Articles</Link><Link href="/">Voir le site</Link>
            <form action={logoutAdmin}><button className="rounded-lg bg-slate-900 px-3 py-2 text-white" type="submit">Se déconnecter</button></form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
