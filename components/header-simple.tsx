"use client"

import Link from "next/link"

export function HeaderSimple() {
  return (
    <header>
      <div className="bg-[#005da8] text-white">
        <div className="max-w-[2000px] mx-auto px-6">
          <nav className="flex items-center justify-between py-4 h-[85px]">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-white text-[20px] px-5 py-2 hover:bg-white/10 rounded-lg transition-colors"
                style={{ fontFamily: "caixaStdBold, sans-serif", fontWeight: "bold" }}
              >
                Início
              </Link>
            </div>

            <img src="/images/nova_logo.png" alt="CAIXA Loterias" className="h-[80px]" />

            <div className="flex items-center gap-4">
              <Link
                href="/carrinho"
                className="flex items-center gap-2 border-2 border-white/60 rounded-lg px-5 py-3 text-[18px] hover:bg-white/10 transition-colors"
                style={{ fontFamily: "caixaStdBold, sans-serif", fontWeight: "bold" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
