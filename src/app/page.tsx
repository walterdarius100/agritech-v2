import type { Metadata } from "next";

import { CredibilitySection } from "@/components/home/CredibilitySection";
import { DomainesSection } from "@/components/home/DomainesSection";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeFormationsSection } from "@/components/home/HomeFormationsSection";
import { HomeNewsSection } from "@/components/home/HomeNewsSection";
import { ConsultationHeroSection } from "@/components/consultation/ConsultationHeroSection";
import { HomePartnershipsSection } from "@/components/home/HomePartnershipsSection";
import { HomeTestimonialsSection } from "@/components/home/HomeTestimonialsSection";
import { createMetadata } from "@/lib/seo/metadata";

export const revalidate = 60;

export const metadata: Metadata = createMetadata({
  title: "Votre projet agricole, bien accompagné",
  description:
    "Services techniques, Agri-tech Academy et contenus éducatifs pour accompagner les projets agricoles en Haïti.",
  path: "/",
});

export default function HomePage() {
  return (
    <main className="overflow-x-hidden bg-[#f8faf7]">
      <HomeHero />
      <DomainesSection />
      <HomeFormationsSection />
      <div className="bg-[#f2f6ed]">
        <CredibilitySection />
        <HomePartnershipsSection />
        <ConsultationHeroSection />
        <HomeTestimonialsSection />
      </div>
      <HomeNewsSection />
    </main>
  );
}
