import ConsultationReservationPage from "@/app/consultation/reserver/page";
import { createLocalizedPageMetadata } from "@/i18n/page-metadata";

export const metadata = createLocalizedPageMetadata("en", "consultation");

export default function EnglishConsultationPage() {
  return <ConsultationReservationPage locale="en" />;
}
