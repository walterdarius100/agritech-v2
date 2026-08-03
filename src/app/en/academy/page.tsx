import AcademyPage from "@/app/academy/page";
import { createLocalizedPageMetadata } from "@/i18n/page-metadata";

export const metadata = createLocalizedPageMetadata("en", "academy");

export default function EnglishAcademyPage() {
  return <AcademyPage locale="en" />;
}
