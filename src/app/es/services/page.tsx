import ServicesPage from "@/app/services/page";
import { createLocalizedPageMetadata } from "@/i18n/page-metadata";

export const metadata = createLocalizedPageMetadata("es", "services");

export default function SpanishServicesPage() {
  return <ServicesPage locale="es" />;
}
