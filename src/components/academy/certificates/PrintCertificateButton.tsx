"use client";

export function PrintCertificateButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      aria-label="Imprimer le certificat ou l’enregistrer en PDF depuis la fenêtre d’impression du navigateur"
      className="no-print rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 print:hidden"
    >
      Imprimer / Enregistrer en PDF
    </button>
  );
}
