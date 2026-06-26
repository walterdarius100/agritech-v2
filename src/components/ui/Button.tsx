import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

const variants = {
  primary: "bg-emerald-700 text-white hover:bg-emerald-800",
  secondary: "bg-white text-emerald-900 ring-1 ring-emerald-200 hover:bg-emerald-50",
};

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
};

export function Button({ href, children, variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <Link href={href} className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${variants[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
