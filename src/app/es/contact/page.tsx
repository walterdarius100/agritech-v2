import ContactPage from "@/app/contact/page";
import { createLocalizedPageMetadata } from "@/i18n/page-metadata";

export const metadata = createLocalizedPageMetadata("es", "contact");

type Props = { searchParams: Promise<{ service?: string; formation?: string; type?: string; course?: string }> };

export default function SpanishContactPage({ searchParams }: Props) {
  return <ContactPage locale="es" searchParams={searchParams} />;
}
