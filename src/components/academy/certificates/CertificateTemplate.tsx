type CertificateTemplateProps = {
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  certificateId: string;
  verificationUrl: string;
  qrCode?: string | null;
};

export function CertificateTemplate({ studentName, courseTitle, issuedAt, certificateId, verificationUrl, qrCode }: CertificateTemplateProps) {
  return (
    <section className="mx-auto aspect-[1.414/1] w-full max-w-5xl rounded-[2rem] border-8 border-emerald-800 bg-white p-10 text-center shadow-2xl print:shadow-none">
      <div className="flex h-full flex-col justify-between border border-amber-300 p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-emerald-700">WAL AGRITECH Academy</p>
          <h1 className="mt-8 text-5xl font-black uppercase text-emerald-950">Certificat</h1>
          <p className="mt-3 text-xl text-slate-600">de réussite et de participation</p>
        </div>
        <div>
          <p className="text-slate-500">Ce certificat est délivré à</p>
          <p className="mt-4 font-serif text-5xl font-bold text-emerald-900">{studentName}</p>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-700">pour avoir complété avec succès la formation Academy :</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{courseTitle}</p>
        </div>
        <div className="flex items-end justify-between gap-6 text-left">
          <div className="text-sm text-slate-600">
            <p>Délivré le {new Date(issuedAt).toLocaleDateString("fr-FR")}</p>
            <p className="mt-1 font-semibold text-slate-900">ID : {certificateId}</p>
            <p className="mt-1 break-all">Vérification : {verificationUrl}</p>
          </div>
          {qrCode ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrCode} alt="QR code de vérification" className="h-28 w-28 rounded bg-white p-1" />
          ) : null}
          <div className="text-right">
            <div className="mb-2 h-px w-48 bg-slate-400" />
            <p className="font-semibold text-emerald-950">Direction Agri-tech</p>
            <p className="text-sm text-slate-500">Structure émettrice</p>
          </div>
        </div>
      </div>
    </section>
  );
}
