"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const academyLinks = [
  { href: "/admin/academy", label: "Vue d’ensemble" },
  { href: "/admin/academy/courses", label: "Cours" },
  { href: "/admin/academy/students", label: "Étudiants" },
  { href: "/admin/academy/enrollments", label: "Inscriptions" },
  { href: "/admin/academy/certificates", label: "Certificats" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin/academy") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AcademyAdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200" aria-label="Navigation Academy">
      <div className="flex flex-wrap gap-2">
        {academyLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              isActive(pathname, link.href)
                ? "bg-emerald-700 text-white"
                : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
