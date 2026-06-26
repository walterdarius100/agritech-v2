import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { articles } from "@/data/articles";
import { createMetadata } from "@/lib/seo/metadata";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  return createMetadata({ title: article?.title ?? "Article Agri-tech", description: article?.excerpt ?? undefined, path: `/articles/${slug}` });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);

  if (!article) {
    return (
      <Section>
        <div className="mx-auto max-w-3xl rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
          <Badge tone="slate">Article introuvable</Badge>
          <h1 className="mt-4 text-3xl font-bold text-emerald-950">Cet article n’est pas encore disponible</h1>
          <p className="mt-4 text-slate-600">La structure dynamique est prête pour Supabase. Vérifiez le lien ou retournez aux actualités.</p>
          <Button href="/actualites" className="mt-6">Retour aux actualités</Button>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <article className="mx-auto max-w-3xl">
        <Badge tone="orange">{article.category}</Badge>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-emerald-950 sm:text-5xl">{article.title}</h1>
        <p className="mt-5 text-xl leading-8 text-slate-600">{article.excerpt}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-500"><span>{article.published_at}</span><span>•</span><span>{article.author}</span></div>
        <div className="mt-10 rounded-3xl border border-emerald-100 bg-white p-6 text-lg leading-8 text-slate-700 shadow-sm"><p>{article.content}</p></div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row"><Button href="/contact" variant="secondary">Demander un accompagnement</Button><Button href="/actualites" variant="outline">Retour aux actualités</Button></div>
      </article>
    </Section>
  );
}
