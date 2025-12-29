"use client"

import Link from "next/link"
import { useCart } from "./cart-context"

export function CartSidebar() {
  const { cart, comboItems, isOpen, closeCart, removeItem, removeComboItem, clearAllItems, getTotal } = useCart()

  if (!isOpen) return null

  const total = getTotal()
  const hasItems = cart.items.length > 0 || comboItems.length > 0

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 overlay-fade-in" onClick={closeCart} />

      <div className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-white shadow-2xl z-50 flex flex-col cart-slide-in rounded-l-2xl">
        <div className="bg-[#005AA5] text-white px-6 py-5 flex items-center justify-between rounded-tl-2xl">
          <h2 className="text-[24px]" style={{ fontFamily: "caixaStdBold, sans-serif" }}>
            Carrinho
          </h2>
          <button
            onClick={closeCart}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {!hasItems ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mb-4 opacity-40"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p className="text-[18px]" style={{ fontFamily: "caixaStdRegular, sans-serif" }}>
                Seu carrinho está vazio
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Combo Items */}
              {comboItems.map((combo) => (
                <div key={combo.id} className="bg-[#f0f7ff] rounded-2xl p-5 border border-[#005aa5]/20 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div
                        className="inline-block px-4 py-1.5 rounded-full text-white text-[14px] mb-3 bg-[#005aa5]"
                        style={{ fontFamily: "futuraBold, sans-serif" }}
                      >
                        COMBO
                      </div>
                      <p className="text-[16px] text-[#1f2a47] mb-1" style={{ fontFamily: "caixaStdBold, sans-serif" }}>
                        {combo.comboName}
                      </p>
                      <p className="text-[14px] text-[#4c556c]" style={{ fontFamily: "caixaStdRegular, sans-serif" }}>
                        {combo.totalGames} apostas
                      </p>
                      <p className="text-[24px] text-[#005AA5] mt-3" style={{ fontFamily: "caixaStdBold, sans-serif" }}>
                        R$ {combo.price.toFixed(2).replace(".", ",")}
                      </p>
                    </div>

                    <button
                      onClick={() => removeComboItem(combo.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full cursor-pointer"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6" />
                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* Individual Cart Items */}
              {cart.items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div
                        className="inline-block px-4 py-1.5 rounded-full text-white text-[14px] mb-3"
                        style={{ backgroundColor: item.color, fontFamily: "futuraBold, sans-serif" }}
                      >
                        {(item.lottery || "APOSTA").toUpperCase()}
                      </div>
                      <p className="text-[15px] text-[#4c556c]" style={{ fontFamily: "caixaStdRegular, sans-serif" }}>
                        {item.type === "bolao" ? "Bolão" : "Aposta"} - Concurso {item.concurso}
                      </p>

                      {item.numbers && item.numbers.length > 0 && (
                        <div className="mt-3">
                          <p
                            className="text-[12px] text-[#4c556c] mb-2"
                            style={{ fontFamily: "caixaStdBold, sans-serif" }}
                          >
                            Números:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {item.numbers.map((num, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] text-white"
                                style={{ backgroundColor: item.color, fontFamily: "caixaStdBold" }}
                              >
                                {num.toString().padStart(2, "0")}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.bonus && item.bonus.length > 0 && (
                        <div className="mt-2">
                          <p
                            className="text-[12px] text-[#4c556c] mb-1"
                            style={{ fontFamily: "caixaStdBold, sans-serif" }}
                          >
                            Bônus:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {item.bonus.map((num, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center justify-center px-2 py-1 rounded-full text-[11px] text-white"
                                style={{ backgroundColor: item.color, fontFamily: "caixaStdBold" }}
                              >
                                {num}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.team && (
                        <p className="mt-2 text-[13px]" style={{ fontFamily: "caixaStdRegular, sans-serif" }}>
                          <span className="text-[#4c556c]">Time: </span>
                          <span style={{ color: item.color, fontFamily: "caixaStdBold" }}>{item.team}</span>
                        </p>
                      )}

                      <p className="text-[24px] text-[#005AA5] mt-3" style={{ fontFamily: "caixaStdBold, sans-serif" }}>
                        R$ {item.price.toFixed(2).replace(".", ",")}
                      </p>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full cursor-pointer"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6" />
                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {hasItems && (
                <button
                  onClick={clearAllItems}
                  className="w-full text-[15px] text-red-500 hover:text-red-700 py-3 transition-colors rounded-full hover:bg-red-50 cursor-pointer"
                  style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                >
                  Limpar carrinho
                </button>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-5 bg-gray-50 rounded-bl-2xl">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[18px] text-[#4c556c]" style={{ fontFamily: "caixaStdRegular, sans-serif" }}>
              Total:
            </span>
            <span className="text-[30px] text-[#005AA5]" style={{ fontFamily: "caixaStdBold, sans-serif" }}>
              R$ {total.toFixed(2).replace(".", ",")}
            </span>
          </div>

          <Link
            href="/carrinho"
            onClick={closeCart}
            className="block w-full bg-[#209869] hover:bg-[#1a7d56] text-white py-4 rounded-full text-[18px] text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.02] cursor-pointer"
            style={{ fontFamily: "caixaStdBold, sans-serif" }}
          >
            Ver carrinho completo
          </Link>
        </div>
      </div>
    </>
  )
}
