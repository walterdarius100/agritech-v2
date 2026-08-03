import HomePage from "@/app/page";
import { createLocalizedHomeMetadata } from "@/i18n/home-metadata";

export function generateMetadata() {
  return createLocalizedHomeMetadata("en");
}

export default HomePage;
