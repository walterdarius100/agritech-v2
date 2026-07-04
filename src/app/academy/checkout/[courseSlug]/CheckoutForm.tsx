"use client";

import Image from "next/image";
import { useState } from "react";

const paymentOptions = [
  {
    description: "Paiement mobile via MonCash.",
    logoAlt: "Logo MonCash",
    logoSrc: "/images/payments/payment-moncash-logo.jpg",
    name: "MonCash",
    provider: "moncash",
  },
  {
    description: "Paiement mobile via NatCash.",
    logoAlt: "Logo NatCash",
    logoSrc: "/images/payments/payment-natcash-logo.jpg",
    name: "NatCash",
    provider: "natcash",
  },
] as const;

export function CheckoutForm({ courseSlug }: { courseSlug: string }) {
  const [provider, setProvider] = useState<"moncash" | "natcash">("moncash");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/academy/payments/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseSlug, provider }),
    });
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erreur de paiement");
      return;
    }

    window.location.href = data.checkoutUrl || data.redirectTo || "/academy/mes-cours";
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {paymentOptions.map((option) => {
          const selected = provider === option.provider;

          return (
            <button
              key={option.provider}
              type="button"
              onClick={() => setProvider(option.provider)}
              className={`rounded-2xl border p-4 text-left transition hover:border-emerald-600 hover:bg-emerald-50/70 ${
                selected ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-slate-200 text-slate-800"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="flex h-11 w-24 shrink-0 items-center justify-center rounded-xl bg-white px-3 ring-1 ring-slate-100">
                  <Image
                    src={option.logoSrc}
                    alt={option.logoAlt}
                    width={96}
                    height={40}
                    className="h-7 w-auto max-w-[90px] object-contain"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold">{option.name}</span>
                  <span className="mt-1 block text-sm font-medium text-slate-600">{option.description}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}

      <button
        onClick={submit}
        disabled={loading}
        className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {loading ? "Création du paiement..." : "Continuer vers le paiement"}
      </button>
    </div>
  );
}
