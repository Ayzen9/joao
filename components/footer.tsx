export function Footer() {
  return (
    <footer className="bg-[#f5f5f5] border-t border-gray-300 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 pt-6 pb-4 md:pt-8 md:pb-6">
        <div className="text-center text-[#4c556c] text-[11px] md:text-[13px] leading-relaxed mb-6">
          <p>Caixa Econômica Federal</p>
          <p>CNPJ 00.360.305/0001-04</p>
          <p>SBS QUADRA 4 LT 3/4 - ASA SUL</p>
          <p>CEP 70.070-140 BRASÍLIA DF</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-5 text-[11px] md:text-[13px]">
            <a href="#" className="text-[#4c556c] hover:underline">
              Ouvidoria
            </a>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <a href="#" className="text-[#4c556c] hover:underline">
              Política de Privacidade
            </a>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <a href="#" className="text-[#4c556c] hover:underline">
              Termos de Uso
            </a>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <a href="#" className="text-[#4c556c] hover:underline">
              Segurança
            </a>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <a href="#" className="text-[#4c556c] hover:underline">
              CAIXA Notícias
            </a>
          </div>

          <a href="#">
            <img
              src="https://www.loteriasonline.caixa.gov.br/silce-web/images/buttons/ainfo.png?MOD=AJPERES&CACHEID=ba449861-d64f-4636-aa1f-2788c6a5b779"
              alt="Ainfo"
              className="h-[32px] md:h-[40px]"
            />
          </a>
        </div>
      </div>
    </footer>
  )
}