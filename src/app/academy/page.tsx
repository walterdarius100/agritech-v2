import type { Metadata } from "next";

import { AcademyDashboard } from "@/components/academy/AcademyDashboard";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Espace étudiant | Agri-tech Academy",
  description:
    "Prototype de l’espace étudiant Agri-tech Academy pour suivre les formations, modules et ressources pédagogiques.",
  path: "/academy",
});

export default function AcademyPage() {
  return <AcademyDashboard />;
}
