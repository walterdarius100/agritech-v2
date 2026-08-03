import ServicesPage from "@/app/services/page";
import { createLocalizedPageMetadata } from "@/i18n/page-metadata";

export const metadata = createLocalizedPageMetadata("en", "services");

export default function EnglishServicesPage() {
  return <ServicesPage locale="en" />;
}
