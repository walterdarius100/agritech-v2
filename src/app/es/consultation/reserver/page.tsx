import ConsultationReservationPage from "@/app/consultation/reserver/page";
import { createLocalizedPageMetadata } from "@/i18n/page-metadata";

export const metadata = createLocalizedPageMetadata("es", "consultation");

export default function SpanishConsultationPage() {
  return <ConsultationReservationPage locale="es" />;
}
