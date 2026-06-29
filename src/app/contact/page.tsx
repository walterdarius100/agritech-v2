import type { Metadata } from "next";

import { ContactFormShell } from "@/components/contact/ContactFormShell";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Contacter Agri-tech",
  description:
    "Contactez Agri-tech pour présenter un besoin de service agricole, une demande de formation ou une idée de partenariat.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <section className="bg-emerald-950 py-14 text-white sm:py-18">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-400">Contact</p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">Parlons de votre projet agricole.</h1>
            <p className="mt-6 text-lg leading-8 text-emerald-50">
              Expliquez-nous votre besoin, votre idée ou votre situation actuelle. L’équipe Agri-tech vous répondra avec une orientation claire pour avancer de manière structurée.
            </p>
          </div>
        </Container>
      </section>
      <Section>
        <div className="mx-auto max-w-4xl">
          <ContactFormShell />
        </div>
      </Section>
    </>
  );
}
