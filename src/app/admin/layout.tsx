import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { logoutAdmin } from "@/lib/auth/actions";
import { getCurrentAdminUser } from "@/lib/auth/adminAuth";

const adminLinks = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/contact-requests", label: "Demandes" },
  { href: "/admin/articles/new", label: "Nouvel article" },
  { href: "/", label: "Voir le site" },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthorized } = await getCurrentAdminUser();

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">{children}</div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link className="flex items-center gap-3" href="/admin">
            <Image
              src="/images/brand/Untitled-1.png"
              alt="Logo Agri-tech"
              width={52}
              height={52}
              className="h-12 w-12 shrink-0 object-contain"
              priority
            />
            <span>
              <span className="block text-base font-bold text-slate-950">
                Administration Agri-tech
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Espace sécurisé
              </span>
            </span>
          </Link>

          <nav className="flex flex-col gap-3 text-sm font-semibold sm:flex-row sm:flex-wrap sm:items-center">
            {adminLinks.map((link) => (
              <Link
                className="rounded-xl px-3 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
            <form action={logoutAdmin}>
              <button
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 sm:w-auto"
                type="submit"
              >
                Se déconnecter
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
