"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CartProvider, useCart, type ComboCartItem } from "@/components/cart-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChevronUp } from "lucide-react"
import { SecurityLayer } from "@/components/security-layer"
import { CheckoutModal } from "@/components/checkout-modal"

export default function CarrinhoPage() {
  return (
    <CartProvider>
      <SecurityLayer>
        <CarrinhoContent />
      </SecurityLayer>
    </CartProvider>
  )
}

interface CartItem {
  id: string
  lottery: string
  type: "bolao" | "aposta"
  price: number
  color: string
  concurso: string
  numbers?: number[]
  bonus?: number[]
  team?: string
  quantity: number
}

function CarrinhoContent() {
  const router = useRouter()
  const { cart, comboItems, removeItem, removeComboItem, clearAllItems, toggleComboNumbers, getTotal } = useCart()
  const [expandedCombos, setExpandedCombos] = useState<Record<string, boolean>>({})
  const [expandedNumbers, setExpandedNumbers] = useState<Record<string, boolean>>({})
  const [showCheckout, setShowCheckout] = useState(false)

  const toggleExpandCombo = (comboId: string) => {
    setExpandedCombos((prev) => ({
      ...prev,
      [comboId]: !prev[comboId],
    }))
  }

  const toggleExpandNumbers = (itemId: string) => {
    setExpandedNumbers((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  const total = getTotal()

  const cartItems = cart.items as CartItem[]
  const bolaoItems = cartItems.filter((item) => item.type === "bolao")
  const apostaItems = cartItems.filter((item) => item.type === "aposta")

  const hasItems = cartItems.length > 0 || comboItems.length > 0

  // Prepare items for checkout - agora inclui números
  const getCheckoutItems = () => {
    const items: Array<{ title: string; quantity: number; price: number; numbers?: string }> = []

    // Add combo items
    comboItems.forEach((combo) => {
      const numbersStr = combo.games
        .map((g) => {
          if (g.numbers && g.numbers.length > 0) {
            return g.numbers.map((nums) => `${g.lottery} (${nums.join(",")})`).join("; ")
          }
          return `${g.lottery} (${g.quantity}x)`
        })
        .join(" | ")

      items.push({
        title: `Combo ${combo.comboName}`,
        quantity: 1,
        price: combo.price,
        numbers: numbersStr,
      })
    })

    // Add cart items
    cartItems.forEach((item) => {
      items.push({
        title: `${item.lottery} - ${item.type === "bolao" ? "Bolão" : "Aposta Simples"}`,
        quantity: item.quantity,
        price: item.price,
        numbers: item.numbers ? item.numbers.join(",") : undefined,
      })
    })

    return items
  }

  const handlePaymentSuccess = (data: { token: string; transactionId: string; qrcode: string; qrcodeUrl: string }) => {
    const items = getCheckoutItems()
    const params = new URLSearchParams({
      qrcode: encodeURIComponent(data.qrcode),
      qrcodeUrl: encodeURIComponent(data.qrcodeUrl),
      transactionId: data.transactionId,
      total: total.toString(),
      items: encodeURIComponent(JSON.stringify(items)),
    })

    router.push(`/pix?${params.toString()}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section
          className="relative overflow-hidden w-full"
          style={{
            backgroundImage: `url('https://www.loteriasonline.caixa.gov.br/silce-web/images/background/bg_institucionalInterno.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "380px",
          }}
        >
          <div className="max-w-[1900px] mx-auto px-6 py-12 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-white text-left">
                <h1
                  className="text-[55px] font-bold mb-5 leading-tight"
                  style={{
                    fontFamily: "caixaStdBold, sans-serif",
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-1.800px",
                  }}
                >
                  Carrinho de Apostas
                </h1>
                <p
                  className="text-[20px] whitespace-nowrap"
                  style={{
                    fontFamily: "caixaStdBook, sans-serif",
                    color: "#fff",
                  }}
                >
                  No carrinho estão todas as apostas que você selecionou. Basta seguir os passos para finalizar e depois
                  é só torcer.
                </p>
              </div>
              <div className="flex-shrink-0 self-end">
                <img
                  src="https://www.loteriasonline.caixa.gov.br/silce-web/images/illustrations/home-com-sorte.png"
                  alt="Loterias Online - Volantes"
                  className="max-w-[400px] md:max-w-[480px] w-full h-auto translate-y-[48px]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Link
                  href="/"
                  className="border border-[#45c0ae] text-[#4c546d] px-10 py-4 rounded font-bold text-[16px] hover:bg-[#45c0ae] hover:text-white transition-colors text-center cursor-pointer"
                  style={{ fontFamily: "caixaStdBold, sans-serif" }}
                >
                  Continuar apostando
                </Link>
                <button
                  onClick={clearAllItems}
                  className="border border-[#45c0ae] text-[#4c546d] px-10 py-4 rounded font-bold text-[16px] hover:bg-[#45c0ae] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center cursor-pointer"
                  style={{ fontFamily: "caixaStdBold, sans-serif" }}
                  disabled={!hasItems}
                >
                  Limpar carrinho
                </button>
              </div>
              <button
                onClick={() => setShowCheckout(true)}
                className="bg-[#0066b3] text-white px-14 py-5 rounded font-bold text-[18px] flex items-center justify-center gap-3 hover:bg-[#0055a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto cursor-pointer"
                style={{ fontFamily: "caixaStdBold, sans-serif" }}
                disabled={!hasItems}
              >
                <img
                  src="https://www.loteriasonline.caixa.gov.br/silce-web/images/icons/icon_concluirCompra.png"
                  alt="Concluir"
                  className="w-7 h-7 pointer-events-none"
                />
                Ir para pagamento
              </button>
            </div>

            {hasItems ? (
              <div className="space-y-14">
                {comboItems.length > 0 && (
                  <div>
                    <h2
                      className="text-[55px] text-[#0066b3] mb-8"
                      style={{ fontFamily: "caixaStdBold, sans-serif", fontWeight: 700, letterSpacing: "-.035em" }}
                    >
                      Combos de Aposta
                    </h2>
                    <div className="bg-white overflow-hidden border border-[#ddd]">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] border-collapse">
                          <thead>
                            <tr className="bg-white border-b border-[#ddd]">
                              <th
                                className="py-4 px-8 text-center text-[16px] font-normal text-[#4c556c] border border-[#ddd]"
                                style={{ fontFamily: "caixaStdRegular, sans-serif", minWidth: "100px" }}
                              >
                                Combo
                              </th>
                              <th
                                className="py-4 px-8 text-center text-[16px] font-normal text-[#4c556c] border border-[#ddd]"
                                style={{ fontFamily: "caixaStdRegular, sans-serif", minWidth: "100px" }}
                              >
                                Qtd. apostas
                              </th>
                              <th
                                className="py-4 px-8 text-center text-[16px] font-normal text-[#4c556c] border border-[#ddd]"
                                style={{ fontFamily: "caixaStdRegular, sans-serif", minWidth: "100px" }}
                              >
                                Detalhar apostas
                              </th>
                              <th
                                className="py-4 px-8 text-center text-[16px] font-normal text-[#4c556c] border border-[#ddd]"
                                style={{ fontFamily: "caixaStdRegular, sans-serif", minWidth: "100px" }}
                              >
                                Valor do Combo
                              </th>
                              <th
                                className="py-4 px-8 text-center text-[16px] font-normal text-[#4c556c] border border-[#ddd]"
                                style={{ fontFamily: "caixaStdRegular, sans-serif", minWidth: "100px" }}
                              >
                                Excluir
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {comboItems.map((combo) => (
                              <ComboRow
                                key={combo.id}
                                combo={combo}
                                isExpanded={expandedCombos[combo.id] || false}
                                onToggleExpand={() => toggleExpandCombo(combo.id)}
                                onToggleNumbers={() => toggleComboNumbers(combo.id)}
                                onRemove={() => removeComboItem(combo.id)}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {(bolaoItems.length > 0 || apostaItems.length > 0) && (
                  <div className="space-y-14">
                    {bolaoItems.length > 0 && (
                      <div>
                        <h2
                          className="text-[55px] text-[#0066b3] mb-8"
                          style={{ fontFamily: "caixaStdBold, sans-serif", fontWeight: 700, letterSpacing: "-.035em" }}
                        >
                          Bolão
                        </h2>
                        <CartTable
                          items={bolaoItems}
                          onRemove={removeItem}
                          type="bolao"
                          expandedNumbers={expandedNumbers}
                          onToggleNumbers={toggleExpandNumbers}
                        />
                      </div>
                    )}
                    {apostaItems.length > 0 && (
                      <div>
                        <h2
                          className="text-[55px] text-[#0066b3] mb-8"
                          style={{ fontFamily: "caixaStdBold, sans-serif", fontWeight: 700, letterSpacing: "-.035em" }}
                        >
                          Aposta Simples
                        </h2>
                        <CartTable
                          items={apostaItems}
                          onRemove={removeItem}
                          type="aposta"
                          expandedNumbers={expandedNumbers}
                          onToggleNumbers={toggleExpandNumbers}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-10">
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <Link
                      href="/"
                      className="border border-[#45c0ae] text-[#4c546d] px-10 py-4 rounded font-bold text-[16px] hover:bg-[#45c0ae] hover:text-white transition-colors text-center cursor-pointer"
                      style={{ fontFamily: "caixaStdBold, sans-serif" }}
                    >
                      Continuar apostando
                    </Link>
                    <button
                      onClick={clearAllItems}
                      className="border border-[#45c0ae] text-[#4c546d] px-10 py-4 rounded font-bold text-[16px] hover:bg-[#45c0ae] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center cursor-pointer"
                      style={{ fontFamily: "caixaStdBold, sans-serif" }}
                    >
                      Limpar carrinho
                    </button>
                  </div>
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="bg-[#0066b3] text-white px-14 py-5 rounded font-bold text-[18px] flex items-center justify-center gap-3 hover:bg-[#0055a0] transition-colors w-full md:w-auto cursor-pointer"
                    style={{ fontFamily: "caixaStdBold, sans-serif" }}
                  >
                    <img
                      src="https://www.loteriasonline.caixa.gov.br/silce-web/images/icons/icon_concluirCompra.png"
                      alt="Concluir"
                      className="w-7 h-7 pointer-events-none"
                    />
                    Ir para pagamento
                  </button>
                </div>

                <div className="bg-[#d0e0e3] py-8 px-10 flex justify-end items-center rounded">
                  <span
                    className="text-[20px] text-[#4c556c] mr-4"
                    style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                  >
                    Total das apostas:
                  </span>
                  <span
                    className="text-[36px] font-bold text-[#1f2a47]"
                    style={{ fontFamily: "caixaStdBold, sans-serif" }}
                  >
                    R$ {total.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-16 text-center shadow-lg max-w-2xl mx-auto">
                <p className="text-[26px] text-[#4c556c] mb-8" style={{ fontFamily: "caixaStdRegular, sans-serif" }}>
                  Seu carrinho está vazio.
                </p>
                <Link
                  href="/"
                  className="inline-block bg-[#0066b3] text-white px-14 py-5 rounded font-bold text-[20px] hover:bg-[#0055a0] transition-colors cursor-pointer"
                  style={{ fontFamily: "caixaStdBold, sans-serif" }}
                >
                  Começar a apostar
                </Link>
              </div>
            )}

            <div className="mt-16 bg-white rounded p-12 shadow">
              <p
                className="text-[18px] text-[#4c556c] mb-6"
                style={{ fontFamily: "caixaStdRegular, sans-serif", lineHeight: "1.5" }}
              >
                Colocar itens no carrinho é um passo essencial para você concluir a sua compra.
              </p>
              <h2
                className="text-[32px] text-[#1f2a47] mb-6"
                style={{ fontFamily: "caixaStdBold, sans-serif", letterSpacing: "-.035em" }}
              >
                Como funciona
              </h2>
              <p
                className="text-[16px] text-[#4c556c] mb-5"
                style={{ fontFamily: "caixaStdRegular, sans-serif", lineHeight: "1.5" }}
              >
                Confira se as suas apostas estão corretas: fique atento às quantidades, valores, Teimosinhas e
                Surpresinhas. Confira também os números que serão apostados.
              </p>
              <p
                className="text-[16px] text-[#4c556c] mb-5"
                style={{ fontFamily: "caixaStdRegular, sans-serif", lineHeight: "1.5" }}
              >
                Se algo estiver errado, clique no X no canto direito da aposta para que ela seja excluída do carrinho.
                Para corrigir, volte ao jogo e aposte novamente.
              </p>
              <p
                className="text-[16px] text-[#4c556c]"
                style={{ fontFamily: "caixaStdRegular, sans-serif", lineHeight: "1.5" }}
              >
                Quando todas as apostas estiverem corretas, clique no botão "Concluir Apostas". Você será redirecionado
                para o ambiente de pagamento.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        total={total}
        items={getCheckoutItems()}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}

function CartTable({
  items,
  onRemove,
  type,
  expandedNumbers,
  onToggleNumbers,
}: {
  items: CartItem[]
  onRemove: (id: string) => void
  type: "bolao" | "aposta"
  expandedNumbers: Record<string, boolean>
  onToggleNumbers: (id: string) => void
}) {
  const MAX_VISIBLE_NUMBERS = 8

  return (
    <div className="bg-white overflow-hidden border border-[#ddd]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="bg-white border-b border-[#ddd]">
              <th
                className="py-4 px-8 text-left text-[16px] font-normal text-[#4c556c] border border-[#ddd]"
                style={{ fontFamily: "caixaStdRegular, sans-serif", minWidth: "100px" }}
              >
                Jogo
              </th>
              <th
                className="py-4 px-8 text-center text-[16px] font-normal text-[#4c556c] border border-[#ddd]"
                style={{ fontFamily: "caixaStdRegular, sans-serif", minWidth: "100px" }}
              >
                Números
              </th>
              <th
                className="py-4 px-8 text-center text-[16px] font-normal text-[#4c556c] border border-[#ddd]"
                style={{ fontFamily: "caixaStdRegular, sans-serif", minWidth: "100px" }}
              >
                Mês
              </th>
              <th
                className="py-4 px-8 text-center text-[16px] font-normal text-[#4c556c] border border-[#ddd]"
                style={{ fontFamily: "caixaStdRegular, sans-serif", minWidth: "100px" }}
              >
                Valor
              </th>
              <th
                className="py-4 px-8 text-center text-[16px] font-normal text-[#4c556c] border border-[#ddd]"
                style={{ fontFamily: "caixaStdRegular, sans-serif", minWidth: "100px" }}
              >
                Excluir
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isExpanded = expandedNumbers[item.id] || false
              const hasMoreNumbers = item.numbers && item.numbers.length > MAX_VISIBLE_NUMBERS
              const visibleNumbers = isExpanded ? item.numbers : item.numbers?.slice(0, MAX_VISIBLE_NUMBERS)
              const remainingCount = item.numbers ? item.numbers.length - MAX_VISIBLE_NUMBERS : 0

              return (
                <tr key={item.id} className="border-b border-[#ddd] last:border-b-0">
                  <td className="py-4 px-8 border border-[#ddd]">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span
                        className="text-[21px] font-bold text-[#1f2a47]"
                        style={{ fontFamily: "caixaStdBold, sans-serif" }}
                      >
                        {item.lottery}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-8 text-center border border-[#ddd]">
                    <div className="flex flex-wrap justify-center gap-2 items-center">
                      {visibleNumbers?.map((num, idx) => (
                        <span
                          key={idx}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold text-white"
                          style={{ backgroundColor: item.color, fontFamily: "caixaStdBold, sans-serif" }}
                        >
                          {String(num).padStart(2, "0")}
                        </span>
                      ))}
                      {hasMoreNumbers && !isExpanded && (
                        <button
                          onClick={() => onToggleNumbers(item.id)}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: item.color, fontFamily: "caixaStdBold, sans-serif" }}
                        >
                          +{remainingCount}
                        </button>
                      )}
                      {isExpanded && hasMoreNumbers && (
                        <button
                          onClick={() => onToggleNumbers(item.id)}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer hover:opacity-80 transition-opacity bg-gray-400"
                        >
                          <ChevronUp className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td
                    className="py-4 px-8 text-center text-[21px] text-[#1f2a47] border border-[#ddd]"
                    style={{ fontFamily: "caixaStdBold, sans-serif" }}
                  >
                    -
                  </td>
                  <td
                    className="py-4 px-8 text-center text-[21px] text-[#0066b3] border border-[#ddd]"
                    style={{ fontFamily: "caixaStdBold, sans-serif" }}
                  >
                    R${item.price.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="py-4 px-8 text-center border border-[#ddd]">
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                    >
                      <img
                        src="/images/red.svg"
                        alt="Excluir"
                        className="w-7 h-7 mx-auto pointer-events-none"
                      />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ComboRow({
  combo,
  isExpanded,
  onToggleExpand,
  onRemove,
}: {
  combo: ComboCartItem
  isExpanded: boolean
  onToggleExpand: () => void
  onToggleNumbers: () => void
  onRemove: () => void
}) {
  return (
    <>
      <tr className="border-b border-[#ddd]">
        <td
          className="py-4 px-8 text-center text-[21px] font-bold text-[#1f2a47] border border-[#ddd]"
          style={{ fontFamily: "caixaStdBold, sans-serif" }}
        >
          {combo.comboName}
        </td>
        <td
          className="py-4 px-8 text-center text-[21px] text-[#1f2a47] border border-[#ddd]"
          style={{ fontFamily: "caixaStdBold, sans-serif" }}
        >
          {combo.totalGames}
        </td>
        <td className="py-4 px-8 text-center border border-[#ddd]">
          <button
            onClick={onToggleExpand}
            className="inline-flex items-center justify-center w-12 h-12 hover:bg-[#f0f0f0] transition-colors rounded cursor-pointer"
          >
            <img
              src="https://www.loteriasonline.caixa.gov.br/silce-web/images/icons/trevo_lupa.png"
              alt="Detalhar"
              className="w-8 h-8 pointer-events-none"
            />
          </button>
        </td>
        <td
          className="py-4 px-8 text-center text-[21px] text-[#0066b3] border border-[#ddd]"
          style={{ fontFamily: "caixaStdBold, sans-serif" }}
        >
          R${combo.price.toFixed(2).replace(".", ",")}
        </td>
        <td className="py-4 px-8 text-center border border-[#ddd]">
          <button onClick={onRemove} className="text-red-500 hover:text-red-700 transition-colors cursor-pointer">
            <img
              src="https://www.loteriasonline.caixa.gov.br/silce-web/images/icons/icon_excluirCarrinho.svg"
              alt="Excluir"
              className="w-7 h-7 mx-auto pointer-events-none"
            />
          </button>
        </td>
      </tr>
      {/* Expanded details */}
      {isExpanded && (
        <tr className="bg-[#f8f9fa]">
          <td colSpan={5} className="p-6 border border-[#ddd]">
            <div className="space-y-4">
              {combo.games.map((game, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="text-[18px] font-bold text-[#1f2a47]"
                      style={{ fontFamily: "caixaStdBold, sans-serif" }}
                    >
                      {game.lottery}
                    </span>
                    <span className="text-[14px] text-[#4c556c]">({game.quantity} apostas)</span>
                  </div>
                  {game.numbers && game.numbers.length > 0 && (
                    <div className="space-y-2">
                      {game.numbers.map((nums, numIdx) => (
                        <div key={numIdx} className="flex flex-wrap gap-2">
                          {nums.map((num, nIdx) => (
                            <span
                              key={nIdx}
                              className="w-8 h-8 rounded-full bg-[#0066b3] text-white flex items-center justify-center text-[13px] font-bold"
                            >
                              {String(num).padStart(2, "0")}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={onToggleExpand}
              className="mt-4 flex items-center gap-2 text-[#0066b3] hover:underline cursor-pointer"
            >
              <ChevronUp className="w-5 h-5" />
              Fechar detalhes
            </button>
          </td>
        </tr>
      )}
    </>
  )
}
