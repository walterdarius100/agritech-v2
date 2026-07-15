"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  confirmConsultationMockPayment,
  type ConsultationPaymentActionState,
} from "@/lib/consultation/checkout";

const initialState: ConsultationPaymentActionState = {};

const paymentMethods = [
  {
    value: "moncash",
    label: "MonCash",
    description:
      "Simulation du paiement mobile MonCash pour valider le parcours.",
  },
  {
    value: "natcash",
    label: "NatCash",
    description:
      "Simulation du paiement mobile NatCash pour valider le parcours.",
  },
  {
    value: "manual",
    label: "Paiement manuel / confirmation interne",
    description: "Simulation d’une validation interne par l’équipe Agri-tech.",
  },
] as const;

function SubmitPaymentButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-full bg-emerald-700 px-6 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? "Traitement du paiement..." : "Paiement confirmé"}
    </button>
  );
}

export function ConsultationMockPaymentForm({
  requestId,
}: {
  requestId: string;
}) {
  const [state, formAction] = useActionState(
    confirmConsultationMockPayment,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100 sm:p-8"
    >
      <input type="hidden" name="request_id" value={requestId} />

      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
          Paiement mock
        </p>
        <h2 className="mt-3 text-2xl font-bold text-emerald-950">
          Choisir un moyen de paiement de test
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Le paiement en ligne est actuellement en mode test. Cette étape permet
          de valider le parcours de réservation.
        </p>
      </div>

      {state.error ? (
        <div
          className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          role="alert"
        >
          {state.error}
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {paymentMethods.map((method) => (
          <label
            key={method.value}
            className="flex cursor-pointer gap-3 rounded-2xl border border-emerald-100 p-4 transition hover:bg-emerald-50/70"
          >
            <input
              type="radio"
              name="payment_method"
              value={method.value}
              defaultChecked={method.value === "moncash"}
              className="mt-1 h-4 w-4 text-emerald-700 focus:ring-emerald-700"
            />
            <span>
              <span className="block font-bold text-emerald-950">
                {method.label}
              </span>
              <span className="mt-1 block text-sm leading-6 text-slate-600">
                {method.description}
              </span>
            </span>
          </label>
        ))}
      </div>

      <div className="mt-6">
        <SubmitPaymentButton />
      </div>
    </form>
  );
}
