"use client";

import { useState } from "react";
import type { SVGProps } from "react";

type ShareIcon = (props: SVGProps<SVGSVGElement>) => React.ReactNode;

type ShareLink = {
  label: string;
  href: string;
  Icon: ShareIcon;
};

type ArticleShareActionsProps = {
  articleTitle: string;
  articleUrl: string;
};

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M14.2 8.2V6.7c0-.7.5-.9 1-.9h1.9V2.6l-2.7-.1c-3 0-4.7 1.8-4.7 5v.7H7v3.6h2.7v9.7h4.1v-9.7h2.8l.5-3.6h-3Z"
      />
    </svg>
  );
}

function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M5.4 8.7H2.1v10.7h3.3V8.7ZM3.8 7.2a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8Zm15.9 6.4c0-3.2-1.7-5.2-4.5-5.2-1.5 0-2.6.8-3.1 1.6h-.1V8.7H8.8v10.7h3.3v-5.3c0-1.4.3-2.8 2-2.8s1.7 1.6 1.7 2.9v5.2h3.3v-5.8h.6Z"
      />
    </svg>
  );
}

function WhatsappIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M12 3.1a8.7 8.7 0 0 0-7.4 13.3l-1 3.7 3.8-1A8.7 8.7 0 1 0 12 3.1Zm0 15.7a7 7 0 0 1-3.6-1l-.3-.2-2.2.6.6-2.1-.2-.3A7 7 0 1 1 12 18.8Zm3.9-5.2c-.2-.1-1.3-.7-1.5-.7-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a5.7 5.7 0 0 1-2.9-2.6c-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.4.3-.5.1-.2 0-.4 0-.5l-.7-1.7c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.5 3.9 1.7.7 2.4.8 3.3.7.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.2-.3-.3-.5-.4Z"
      />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M14 10.4 21.4 2h-1.8l-6.4 7.2L8.1 2H2.2l7.8 11-7.8 9h1.8l6.8-7.8 5.5 7.8h5.9L14 10.4Zm-2.4 2.7-.8-1.1-6.3-8.7h2.8l5 7 .8 1.1 6.6 9.2h-2.8l-5.3-7.5Z"
      />
    </svg>
  );
}

function EmailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M4.5 5.5h15A2.5 2.5 0 0 1 22 8v8a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 16V8a2.5 2.5 0 0 1 2.5-2.5Zm0 2 7.5 5 7.5-5h-15Zm15 9V9.7l-7 4.7a1 1 0 0 1-1.1 0l-6.9-4.7v6.8h15Z"
      />
    </svg>
  );
}

function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M8 7.5A2.5 2.5 0 0 1 10.5 5h7A2.5 2.5 0 0 1 20 7.5v7a2.5 2.5 0 0 1-2.5 2.5H16v1.5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 4 18.5v-7A2.5 2.5 0 0 1 6.5 9H8V7.5ZM10.5 7a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5h-7ZM8 11H6.5a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V17h-3.5A2.5 2.5 0 0 1 8 14.5V11Z"
      />
    </svg>
  );
}

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
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: FacebookIcon,
    },
    {
      label: "Partager sur WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      Icon: WhatsappIcon,
    },
    {
      label: "Partager sur LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: LinkedinIcon,
    },
    {
      label: "Partager sur X / Twitter",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      Icon: XIcon,
    },
    {
      label: "Partager par email",
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      Icon: EmailIcon,
    },
  ];

  async function copyArticleLink() {
    if (!navigator.clipboard) return;

    await navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="text-center">
      <div
        className="flex flex-wrap items-center justify-center gap-3"
        aria-label="Options de partage de l’article"
      >
        {shareLinks.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
            aria-label={label}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-700 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
          >
            <Icon className="h-5 w-5" />
          </a>
        ))}
        <button
          type="button"
          onClick={copyArticleLink}
          aria-label="Copier le lien de l’article"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-700 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
        >
          <CopyIcon className="h-5 w-5" />
        </button>
      </div>
      <p
        className="mt-3 min-h-5 text-sm font-medium text-emerald-800"
        aria-live="polite"
      >
        {copied ? "Lien copié dans le presse-papiers." : ""}
      </p>
    </div>
  );
}
