import ServicePage from "@/components/public-pages/ServicePage";

export default function FrenchServicePage(props: {
  params: Promise<{ slug: string }>;
}) {
  return <ServicePage {...props} locale="fr" />;
}
