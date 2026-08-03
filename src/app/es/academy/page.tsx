import AcademyPage from "@/app/academy/page";
import { createLocalizedPageMetadata } from "@/i18n/page-metadata";

export const metadata = createLocalizedPageMetadata("es", "academy");

export default function SpanishAcademyPage() {
  return <AcademyPage locale="es" />;
}
