import ServicePage from "@/components/public-pages/ServicePage";

export default function EnglishServicePage(props: {
  params: Promise<{ slug: string }>;
}) {
  return <ServicePage {...props} locale="en" />;
}
