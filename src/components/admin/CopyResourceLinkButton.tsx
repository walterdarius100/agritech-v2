"use client";

import { useState } from "react";

export function CopyResourceLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      className="font-semibold text-emerald-800 hover:text-emerald-950"
      onClick={copy}
      type="button"
    >
      {copied ? "Lien copié" : "Copier le lien"}
    </button>
  );
}
