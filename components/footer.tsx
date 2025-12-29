export function Footer() {
  return (
    <footer className="bg-[#f5f5f5] border-t border-gray-300">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Links */}
          <div className="flex flex-wrap items-center gap-4 text-[13px]">
            <a href="#" className="text-[#005AA5] hover:underline">
              Ouvidoria
            </a>
            <span className="text-gray-400">|</span>
            <a href="#" className="text-[#005AA5] hover:underline">
              Política de Privacidade
            </a>
            <span className="text-gray-400">|</span>
            <a href="#" className="text-[#005AA5] hover:underline">
              Termos de Uso
            </a>
            <span className="text-gray-400">|</span>
            <a href="#" className="text-[#005AA5] hover:underline">
              Segurança
            </a>
            <span className="text-gray-400">|</span>
            <a href="#" className="text-[#005AA5] hover:underline">
              CAIXA Notícias
            </a>
          </div>

          {/* Botão ainfo */}
          <a href="#">
            <img
              src="https://www.loteriasonline.caixa.gov.br/silce-web/images/buttons/ainfo.png?MOD=AJPERES&CACHEID=ba449861-d64f-4636-aa1f-2788c6a5b779"
              alt="Ainfo"
              className="h-[40px]"
            />
          </a>
        </div>
      </div>
    </footer>
  )
}
