import type { Metadata } from "next";

import { CredibilitySection } from "@/components/home/CredibilitySection";
import { DomainesSection } from "@/components/home/DomainesSection";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeFormationsSection } from "@/components/home/HomeFormationsSection";
import { HomeNewsSection } from "@/components/home/HomeNewsSection";
import { HomePartnershipsSection } from "@/components/home/HomePartnershipsSection";
import { HomeTestimonialsSection } from "@/components/home/HomeTestimonialsSection";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Votre projet agricole, bien accompagné",
  description: "Services techniques, formations pratiques et contenus éducatifs pour accompagner les projets agricoles en Haïti.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <DomainesSection />
      <HomeFormationsSection />
      <CredibilitySection />
      <HomePartnershipsSection />
      <HomeTestimonialsSection />
      <HomeNewsSection />
    </>
  );
}
