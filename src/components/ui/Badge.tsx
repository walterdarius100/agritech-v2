import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: "green" | "orange" | "slate";
};

const tones = {
  green: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  orange: "bg-orange-100 text-orange-800 ring-orange-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function Badge({ children, tone = "green", className, ...props }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1", tones[tone], className)} {...props}>
      {children}
    </span>
  );
}
