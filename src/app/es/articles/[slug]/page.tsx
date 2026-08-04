import ArticlePage from "@/components/public-pages/ArticlePage";
export default function SpanishArticlePage(props: {
  params: Promise<{ slug: string }>;
}) {
  return <ArticlePage {...props} locale="es" />;
}
