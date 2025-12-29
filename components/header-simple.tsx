"use client"

import Link from "next/link"

export function HeaderSimple() {
  return (
    <header>
      <div className="bg-[#005da8] text-white">
        <div className="max-w-[2000px] mx-auto px-3 md:px-6 overflow-x-hidden">
          <nav className="flex items-center justify-between py-3 md:py-4 min-h-[70px] md:h-[85px]">
            <div className="flex items-center">
              <Link
                href="/"
                className="text-white text-[14px] md:text-[20px] px-3 md:px-5 py-2 hover:bg-white/10 rounded-lg transition-colors"
                style={{ fontFamily: "caixaStdBold, sans-serif", fontWeight: "bold" }}
              >
                Início
              </Link>
            </div>

            <img src="/images/nova_logo.png" alt="CAIXA Loterias" className="h-[60px] md:h-[80px]" />

            <div className="flex items-center">
              <Link
                href="/carrinho"
                className="flex items-center gap-1 md:gap-2 border-2 border-white/60 rounded-lg px-3 md:px-5 py-2 md:py-3 text-[14px] md:text-[18px] hover:bg-white/10 transition-colors"
                style={{ fontFamily: "caixaStdBold, sans-serif", fontWeight: "bold" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="md:w-[22px] md:h-[22px]"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Carrinho
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
