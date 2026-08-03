import AcademyPage from "@/app/academy/page";
import { createLocalizedPageMetadata } from "@/i18n/page-metadata";

export const metadata = createLocalizedPageMetadata("fr", "academy");

export default function FrenchAcademyPage() {
  return <AcademyPage locale="fr" />;
}
