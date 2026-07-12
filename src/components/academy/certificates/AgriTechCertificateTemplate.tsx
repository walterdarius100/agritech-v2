const coveredTopics = [
  "la biologie et le comportement des abeilles",
  "l’installation et la gestion d’un rucher",
  "les techniques d’entretien et de suivi des colonies",
  "la prévention et la gestion des maladies",
];

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
      <div className="mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#f6bc19] text-[12px] font-black text-[#4775c8] shadow-[0_0_0_6px_rgba(246,188,25,0.22)]">
        ◔
      </div>
      <div className="font-[Arial_Black,Arial,sans-serif] text-[50px] font-black leading-none tracking-[-0.08em] text-white">AGRI-TECH</div>
      <div className="mt-1 text-[10px] font-black uppercase leading-none tracking-[0.16em] text-white">INFORMER • INNOVER • EDUQUER • SENSIBILISER</div>
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
              A suivi avec succès la formation en <strong>apiculture moderne</strong>, organisée par <strong>WAL AGRITECH</strong>, portant sur les techniques de base et intermédiaires de gestion des colonies d’abeilles.
            </p>

            <div>
              <p>Cette formation a couvert notamment :</p>
              <ol className="mt-[13px] space-y-[13px] pl-[19px]">
                {coveredTopics.map((topic, index) => (
                  <li key={topic} className="flex gap-[12px]">
                    <span className="min-w-[14px] text-right">{index + 1})</span>
                    <span>{topic}</span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="pt-[10px]">
              D’une durée de <strong>[nombre d’heures / jours]</strong>, cette formation a été réalisée du <strong>[date début]</strong> au <strong>[date fin]</strong>.
            </p>

            <p>En foi de quoi, le présent certificat est délivré pour servir et valoir ce que de droit.</p>

            <p>
              Fait à <strong>[ville]</strong>, le <strong>[date]</strong>
            </p>
          </div>
        </section>

        <section className="absolute bottom-[34px] left-[74px] z-10 flex items-end gap-[36px]">
          <div className="w-[156px] text-center text-black">
            <div className="mx-auto mb-[-2px] h-[40px] w-[74px] rotate-[-5deg] border-b-2 border-[#1b2a74] font-[cursive] text-[26px] leading-[36px] text-[#1b2a74]">Wdy</div>
            <div className="border-t border-slate-700 pt-[3px]">
              <p className="text-[12px] leading-[1.45]">Walter Darius</p>
              <p className="text-[12px] leading-[1.45]">Directeur Général</p>
              <p className="text-[12px] leading-[1.45]">WAL AGRITECH</p>
            </div>
          </div>

          <div className="relative flex h-[91px] w-[91px] items-center justify-center rounded-full border border-[#2e2d8f] text-[#2e2d8f]">
            <div className="absolute inset-[9px] rounded-full border border-[#2e2d8f]" />
            <div className="text-center text-[10px] font-black leading-none">◔</div>
            <span className="absolute top-[8px] text-[7px] font-black uppercase tracking-[0.13em]">INFORMER</span>
            <span className="absolute bottom-[8px] rotate-180 text-[7px] font-black uppercase tracking-[0.13em]">EDUQUER</span>
            <span className="absolute left-[-2px] rotate-[-78deg] text-[7px] font-black uppercase tracking-[0.08em]">SENSIBILISER</span>
            <span className="absolute right-[-2px] rotate-[78deg] text-[7px] font-black uppercase tracking-[0.08em]">INNOVER</span>
          </div>
        </section>

        <aside className="absolute right-[22px] top-[-18px] z-20 h-[430px] w-[294px] bg-[#4775c8] px-[14px] pt-[42px] text-center text-white [clip-path:polygon(0_0,100%_0,100%_80%,50%_100%,0_80%)]">
          <AgriTechWordmark />
          <div className="mx-auto mt-[38px] h-px w-[190px] bg-white" />
          <p className="mt-[35px] font-[Arial_Black,Arial,sans-serif] text-[50px] font-black leading-none tracking-[-0.04em]">Certificat</p>
          <p className="mt-[17px] text-[27px] font-black leading-none">de participation</p>
          <div className="mx-auto mt-[50px] h-px w-[111px] bg-white" />
          <div className="mt-[34px] flex justify-center gap-[18px] text-[19px] leading-none text-white">
            <span>★</span>
            <span>★</span>
            <span>★</span>
          </div>
        </aside>

        <div className="absolute bottom-[66px] right-[126px] z-30 flex flex-col items-center">
          <StaticQrCode />
          <p className="mt-[9px] whitespace-nowrap text-[9px] leading-none text-black">
            <strong>Numéro du certificat :</strong> AGRI-API-2026-01
          </p>
        </div>
      </div>

      <div className="absolute bottom-[39px] right-[-31px] z-40 flex h-[171px] w-[18px] items-center justify-center bg-gradient-to-b from-[#ff9b58] to-[#f07116] text-white">
        <p className="rotate-[-90deg] whitespace-nowrap text-[9px] font-black leading-none">Projet : ApisFondwa</p>
      </div>
    </article>
  );
}
