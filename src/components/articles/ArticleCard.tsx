import type { Article } from "@/types/article";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <div className="h-32 bg-[linear-gradient(135deg,#064e3b,#16a34a_55%,#f97316)]" aria-hidden="true" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-3"><Badge tone="orange">{article.category}</Badge><span className="text-xs font-medium text-slate-500">{article.published_at}</span></div>
        <h2 className="mt-4 text-xl font-bold text-emerald-950">{article.title}</h2>
        <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{article.excerpt}</p>
        <Button href={`/articles/${article.slug}`} variant="ghost" className="mt-5 justify-start px-0">Lire l’article</Button>
      </div>
    </Card>
  );
}
