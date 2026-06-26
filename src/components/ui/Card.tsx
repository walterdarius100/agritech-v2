import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  as?: "article" | "div";
};

export function Card({ children, as: Component = "article", className = "", ...props }: CardProps) {
  return (
    <Component
      className={`rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm shadow-emerald-950/5 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/10 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
