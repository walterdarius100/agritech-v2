import HomePage from "@/app/page";
import { createLocalizedHomeMetadata } from "@/i18n/home-metadata";

export function generateMetadata() {
  return createLocalizedHomeMetadata("es");
}

export default function SpanishHomePage() {
  return <HomePage locale="es" />;
}
