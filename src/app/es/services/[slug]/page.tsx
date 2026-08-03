import ServicePage from "@/components/public-pages/ServicePage";

export default function SpanishServicePage(props: {
  params: Promise<{ slug: string }>;
}) {
  return <ServicePage {...props} locale="es" />;
}
