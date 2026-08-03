import ConsultationReservationPage from "@/app/consultation/reserver/page";
import { createLocalizedPageMetadata } from "@/i18n/page-metadata";

export const metadata = createLocalizedPageMetadata("fr", "consultation");

export default function FrenchConsultationPage() {
  return <ConsultationReservationPage locale="fr" />;
}
