const CERTIFICATE_LOGO_PATH = "/images/brand/Untitled-1.png";
const CERTIFICATE_SIGNATURE_PATH = "/images/certificates/walter-signature.svg";
const CERTIFICATE_STAMP_PATH = "/images/certificates/agritech-stamp.svg";

const qrCells = Array.from({ length: 21 * 21 }, (_, index) => {
  const row = Math.floor(index / 21);
  const col = index % 21;
  const inTopLeft = row < 7 && col < 7;
  const inTopRight = row < 7 && col > 13;
  const inBottomLeft = row > 13 && col < 7;
  const finder = inTopLeft || inTopRight || inBottomLeft;
  const finderBorder = finder && (row % 14 === 0 || row % 14 === 6 || col % 14 === 0 || col % 14 === 6);
  const finderCenter = finder && row % 14 >= 2 && row % 14 <= 4 && col % 14 >= 2 && col % 14 <= 4;

  return finderBorder || finderCenter || (row * 3 + col * 5 + row * col) % 7 < 3;
});

function AgriTechWordmark() {
  return (
    <div className="text-center text-white">
      <div className="relative mx-auto h-[58px] w-[220px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CERTIFICATE_LOGO_PATH} alt="Logo Agri-tech" className="h-full w-full object-contain brightness-0 invert" />
      </div>
      <div className="mt-1 whitespace-nowrap text-[10px] font-black uppercase leading-none tracking-[0.08em] text-white">INFORMER • INNOVER • EDUQUER • SENSIBILISER</div>
    </div>
  );
}

function StaticQrCode() {
  return (
    <div className="grid h-[96px] w-[96px] grid-cols-[repeat(21,1fr)] gap-0.5 bg-white p-1 ring-1 ring-slate-300" aria-label="QR code de démonstration">
      {qrCells.map((isDark, index) => (
        <span key={index} className={isDark ? "bg-black" : "bg-white"} />
      ))}
    </div>
  );
}

export function AgriTechCertificateTemplate() {
  return (
    <article className="certificate-print-area relative mx-auto h-[612px] w-[792px] overflow-visible bg-white p-[17px] text-black shadow-2xl ring-1 ring-slate-200 print:shadow-none print:ring-0">
      <div className="relative h-full w-full rounded-[3px] border border-[#2c5f9f] bg-white">
        <section className="absolute left-[51px] top-[29px] z-10 w-[370px] text-left font-[Arial,Helvetica,sans-serif]">
          <p className="text-[13px] font-black leading-none text-black">Agri-tech certifie que :</p>

          <h1 className="mt-[18px] font-[Arial_Black,Arial,sans-serif] text-[52px] font-black uppercase leading-[0.9] tracking-[-0.035em] text-[#4674c4]">
            <span className="block normal-case">Walter</span>
            <span className="block">DARIUS</span>
          </h1>

          <div className="mt-[14px] space-y-[13px] text-[12.5px] leading-[1.55] text-black">
            <p>
              A suivi avec succès la formation « <strong>apiculture moderne</strong> », organisée par Agri-tech Academy dans le cadre de son programme de renforcement des compétences agricoles.
            </p>

            <p>Le programme a couvert les notions fondamentales, les pratiques techniques et les méthodes d’application liées au domaine étudié.</p>

            <p className="pt-[4px]">
              D’une durée de <strong>[nombre d’heures / jours]</strong>, la formation a été réalisée du <strong>[date début]</strong> au <strong>[date fin]</strong>.
            </p>

            <p>En foi de quoi, le présent certificat est délivré pour servir et valoir ce que de droit.</p>

            <p>
              Fait à <strong>[ville]</strong>, le <strong>[date]</strong>.
            </p>
          </div>
        </section>

        <section className="absolute bottom-[34px] left-[74px] z-10 flex items-end gap-[36px]">
          <div className="w-[156px] text-center text-black">
            <div className="mx-auto mb-[-4px] h-[40px] w-[120px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={CERTIFICATE_SIGNATURE_PATH} alt="Signature Walter Darius" className="h-full w-full object-contain" />
            </div>
            <div className="border-t border-slate-700 pt-[3px]">
              <p className="text-[12px] leading-[1.45]">Walter Darius</p>
              <p className="text-[12px] leading-[1.45]">Directeur Général</p>
              <p className="text-[12px] leading-[1.45]">WAL AGRITECH</p>
            </div>
          </div>

          <div className="h-[91px] w-[91px] opacity-90">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={CERTIFICATE_STAMP_PATH} alt="Cachet Agri-tech" className="h-full w-full object-contain" />
          </div>
        </section>

        <aside className="absolute right-[22px] top-[-18px] z-20 h-[430px] w-[294px] bg-[#4775c8] px-[14px] pt-[42px] text-center text-white [clip-path:polygon(0_0,100%_0,100%_80%,50%_100%,0_80%)]">
          <AgriTechWordmark />
          <div className="mx-auto mt-[32px] h-px w-[190px] bg-white" />
          <p className="mt-[30px] font-[Arial_Black,Arial,sans-serif] text-[50px] font-black leading-none tracking-[-0.04em]">Certificat</p>
          <p className="mt-[15px] text-[27px] font-black leading-none">de participation</p>
          <div className="mx-auto mt-[42px] h-px w-[111px] bg-white" />
          <div className="mt-[30px] flex justify-center gap-[18px] text-[19px] leading-none text-white">
            <span>★</span>
            <span>★</span>
            <span>★</span>
          </div>
        </aside>

        <div className="absolute bottom-[42px] right-[126px] z-30 flex flex-col items-center">
          <StaticQrCode />
          <p className="mt-[9px] whitespace-nowrap text-[9px] leading-none text-black">
            <strong>Numéro du certificat :</strong> AGRI-API-2026-01
          </p>
        </div>
      </div>

      <div className="absolute bottom-[39px] right-[19px] z-40 flex h-[171px] w-[18px] items-center justify-center bg-gradient-to-b from-[#ff9b58] to-[#f07116] text-white">
        <p className="rotate-[-90deg] whitespace-nowrap text-[9px] font-black leading-none">Agri-tech Academy</p>
      </div>
    </article>
  );
}
