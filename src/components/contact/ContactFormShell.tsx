import { ContactForm } from "@/components/contact/ContactForm";

export function ContactFormShell({ serviceSlug, formationSlug }: { serviceSlug?: string; formationSlug?: string }) {
  return <ContactForm serviceSlug={serviceSlug} formationSlug={formationSlug} />;
}
