import ServicesPage from "@/app/services/page";
import { createLocalizedPageMetadata } from "@/i18n/page-metadata";

export const metadata = createLocalizedPageMetadata("fr", "services");

export default function FrenchServicesPage() {
  return <ServicesPage locale="fr" />;
}
