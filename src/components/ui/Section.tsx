import type { HTMLAttributes, ReactNode } from "react";

import { Container } from "@/components/ui/Container";

type SectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  containerClassName?: string;
};

export function Section({ children, className = "", containerClassName = "", ...props }: SectionProps) {
  return (
    <section className={`py-14 sm:py-20 ${className}`} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
