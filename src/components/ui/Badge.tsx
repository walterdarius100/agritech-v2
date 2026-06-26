import type { HTMLAttributes, ReactNode } from "react";

const variants = {
  green: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  orange: "bg-orange-100 text-orange-800 ring-orange-200",
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
} as const;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: keyof typeof variants;
};

export function Badge({ children, variant = "green", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
