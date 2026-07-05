import Image from "next/image";

type CertificateTemplateProps = {
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  certificateId: string;
  verificationUrl: string;
  qrCode?: string | null;
};

export function CertificateTemplate({
  studentName,
  courseTitle,
  issuedAt,
  certificateId,
  verificationUrl,
  qrCode,
}: CertificateTemplateProps) {
  return (
    <section className="rounded-[2rem] border-4 border-emerald-800 bg-white p-8 text-center shadow-sm print:shadow-none">
      <p className="text-sm font-bold uppercase tracking-[0.4em] text-emerald-700">WAL AGRITECH</p>
      <h1 className="mt-6 text-4xl font-black text-emerald-950">Certificat de réussite</h1>
      <p className="mt-8 text-slate-600">Ce certificat est décerné à</p>
      <p className="mt-3 text-3xl font-bold text-emerald-900">{studentName}</p>
      <p className="mt-8 text-slate-600">pour avoir complété avec succès la formation</p>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{courseTitle}</p>
      <div className="mt-8 grid gap-4 text-sm text-slate-600 md:grid-cols-3">
        <div><span className="font-semibold text-slate-900">Date</span><br />{new Date(issuedAt).toLocaleDateString("fr-FR")}</div>
        <div><span className="font-semibold text-slate-900">ID</span><br />{certificateId}</div>
        <div><span className="font-semibold text-slate-900">Émetteur</span><br />Agri-tech / WAL AGRITECH</div>
      </div>
      {qrCode ? <Image className="mx-auto mt-8 h-28 w-28" src={qrCode} alt="QR code de vérification" width={112} height={112} unoptimized /> : null}
      <p className="mt-4 break-all text-xs text-slate-500">{verificationUrl}</p>
    </section>
  );
}
