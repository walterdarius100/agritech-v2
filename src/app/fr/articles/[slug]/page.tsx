import ArticlePage from "@/components/public-pages/ArticlePage";
export default function FrenchArticlePage(props: {
  params: Promise<{ slug: string }>;
}) {
  return <ArticlePage {...props} locale="fr" />;
}
