"use client";

import { useState } from "react";

type ShareLink = {
  label: string;
  shortLabel: string;
  href: string;
};

type ArticleShareActionsProps = {
  articleTitle: string;
  articleUrl: string;
};

export function ArticleShareActions({
  articleTitle,
  articleUrl,
}: ArticleShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(articleTitle);

  const shareLinks: ShareLink[] = [
    {
      label: "Partager sur Facebook",
      shortLabel: "f",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "Partager sur LinkedIn",
      shortLabel: "in",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "Partager sur WhatsApp",
      shortLabel: "WA",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      label: "Partager sur X",
      shortLabel: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      label: "Partager par email",
      shortLabel: "@",
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    },
  ];

  async function copyArticleLink() {
    if (!navigator.clipboard) return;

    await navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-3"
      aria-label="Options de partage de l’article"
    >
      {shareLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target={link.href.startsWith("mailto:") ? undefined : "_blank"}
          rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}
          aria-label={link.label}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-800 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
        >
          {link.shortLabel}
        </a>
      ))}
      <button
        type="button"
        onClick={copyArticleLink}
        aria-label="Copier le lien de l’article"
        className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-emerald-800 px-3 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
      >
        {copied ? "Copié" : "Lien"}
      </button>
    </div>
  );
}
