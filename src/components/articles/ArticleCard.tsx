import Image from "next/image";

import type { Article } from "@/types/article";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-2xl p-0">
      <div className="relative h-44 bg-emerald-900" aria-hidden={!article.cover_image_url}>
        {article.cover_image_url ? (
          <Image
            src={article.cover_image_url}
            alt={`Illustration agricole pour l’article : ${article.title}`}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="orange">{article.category}</Badge>
          <span className="text-xs font-medium text-slate-500">{article.published_at}</span>
        </div>
        <h2 className="mt-4 text-xl font-bold text-emerald-950">{article.title}</h2>
        <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{article.excerpt}</p>
        <Button href={`/articles/${article.slug}`} variant="ghost" className="mt-5 justify-start px-0">
          Lire l’article →
        </Button>
      </div>
    </Card>
  );
}
