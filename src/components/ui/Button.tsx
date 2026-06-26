import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary: "bg-emerald-700 text-white shadow-sm shadow-emerald-950/20 hover:bg-emerald-800 focus-visible:outline-emerald-700",
  secondary: "bg-orange-500 text-white shadow-sm shadow-orange-950/20 hover:bg-orange-600 focus-visible:outline-orange-500",
  outline: "bg-white text-emerald-900 ring-1 ring-inset ring-emerald-200 hover:bg-emerald-50 focus-visible:outline-emerald-700",
  ghost: "bg-transparent text-emerald-900 hover:bg-emerald-50 focus-visible:outline-emerald-700",
} as const;

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-base",
} as const;

type SharedButtonProps = {
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
};

type ButtonLinkProps = SharedButtonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type NativeButtonProps = SharedButtonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };

type ButtonProps = ButtonLinkProps | NativeButtonProps;

export function Button({ children, variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  const classes = `inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
