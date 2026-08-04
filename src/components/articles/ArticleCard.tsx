import Image from "next/image";

import type { Article } from "@/types/article";
import {
  formatArticleDate,
  getArticleDate,
  getArticleImage,
} from "@/lib/articles/getArticles";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getLocalizedPath, type Locale } from "@/i18n";

export function ArticleCard({
  article,
  locale = "fr",
}: {
  article: Article;
  locale?: Locale;
}) {
  const read =
    locale === "en"
      ? "Read article"
      : locale === "es"
        ? "Leer el artículo"
        : "Lire l’article";
  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-2xl p-0">
      <div className="relative h-44 bg-emerald-900" aria-hidden={false}>
        <Image
          src={getArticleImage(article)}
          alt={`Illustration agricole pour l’article : ${article.title}`}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
            {article.category ?? "Article"}
          </span>
          <span className="text-xs font-medium text-slate-500">
            {formatArticleDate(getArticleDate(article), locale)}
          </span>
        </div>
        <h2 className="mt-4 text-xl font-bold text-emerald-950">
          {article.title}
        </h2>
        <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
          {article.excerpt}
        </p>
        {article.slug ? (
          <Button
            href={
              locale === "fr"
                ? `/articles/${article.slug}`
                : getLocalizedPath(`/articles/${article.slug}`, locale)
            }
            variant="ghost"
            className="mt-5 justify-start rounded-none px-0 text-emerald-800 hover:bg-transparent hover:text-emerald-950"
          >
            {read} →
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
