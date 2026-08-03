import HomePage from "@/app/page";
import { createLocalizedHomeMetadata } from "@/i18n/home-metadata";

export function generateMetadata() {
  return createLocalizedHomeMetadata("fr");
}

export default function FrenchHomePage() {
  return <HomePage locale="fr" />;
}
