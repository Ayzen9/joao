"use client"

import { useState, useRef, useCallback } from "react"
import {
  COMBOS_DATA,
  getTotalGamesInCombo,
  generateComboGames,
  calculateComboPrice,
  type ComboData,
} from "@/lib/combos-data"
import { useCart } from "./cart-context"

const CLOVER_PATTERN_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZ4AAAGeCAYAAACkfGcPAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQwIDc5LjE2MDQ1MSwgMjAxNy8wNS8wNi0wMTowODoyMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpiMDZkNjgwOC0wY2RhLTRhNDItOTVjZS04NDQwYTNjZGE3ODAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODJDMTcwNzRFQTg3MTFFODgzMjlDRTE2NUFGOTZDMTkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODJDMTcwNzNFQTg3MTFFODgzMjlDRTE2NUFGOTZDMTkiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NmFiZTljY2YtYzVjYS00Y2RjLTk4ODItNzljYjU3NTI0MWMxIiBzdFJlZjpkb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6YjFjMjEzNTMtYTYyOS0zZjQ1LWFjY2QtMWJkZTk0ZDUxMWYyIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+"

export function CombosCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({})
  const [showNumbersMap, setShowNumbersMap] = useState<Record<string, boolean>>({})
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    COMBOS_DATA.forEach((combo) => {
      initial[combo.id] = getTotalGamesInCombo(combo)
    })
    return initial
  })
  const [isAnimating, setIsAnimating] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const { addComboToCart } = useCart()

  const totalCombos = COMBOS_DATA.length

  const handlePrev = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)

    setCurrentIndex((prev) => {
      const newIndex = (prev - 1 + totalCombos) % totalCombos
      return newIndex
    })

    setTimeout(() => {
      setIsAnimating(false)
    }, 500)
  }, [isAnimating, totalCombos])

  const handleNext = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)

    setCurrentIndex((prev) => {
      const newIndex = (prev + 1) % totalCombos
      return newIndex
    })

    setTimeout(() => {
      setIsAnimating(false)
    }, 500)
  }, [isAnimating, totalCombos])

  const handleFlipCard = (comboId: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [comboId]: !prev[comboId],
    }))
  }

  const handleShowNumbersToggle = (comboId: string) => {
    setShowNumbersMap((prev) => ({
      ...prev,
      [comboId]: !prev[comboId],
    }))
  }

  const handleQuantityChange = (comboId: string, delta: number) => {
    const combo = COMBOS_DATA.find((c) => c.id === comboId)
    if (!combo) return
    const baseQty = getTotalGamesInCombo(combo)
    setQuantities((prev) => ({
      ...prev,
      [comboId]: Math.max(baseQty, (prev[comboId] || baseQty) + delta),
    }))
  }

  const calculateTotal = (combo: ComboData) => {
    const qty = quantities[combo.id] || getTotalGamesInCombo(combo)
    return calculateComboPrice(combo.id, qty)
  }

  const handleAddToCart = (combo: ComboData, payNow = false) => {
    const showNumbers = showNumbersMap[combo.id] ?? true
    const comboWithGames = generateComboGames(combo)
    addComboToCart(comboWithGames, showNumbers)
    handleFlipCard(combo.id)

    if (payNow) {
      window.location.href = "/carrinho"
    }
  }

  // Get visible combos (show 3 cards)
  const getVisibleCombos = () => {
    const combos = []
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % totalCombos
      combos.push({ ...COMBOS_DATA[index], originalIndex: index })
    }
    return combos
  }

  return (
    <section className="py-12 bg-[#f5f5f5]">
      <div className="max-w-[1400px] mx-auto px-10">
        <h2 className="text-[48px] mb-2" style={{ letterSpacing: "-1.5px", lineHeight: "58px" }}>
          <span
            style={{ fontFamily: "caixaStdBook, sans-serif", fontWeight: 300, color: "#adc0c4", fontStyle: "italic" }}
          >
            Combos de{" "}
          </span>
          <span
            style={{
              fontFamily: "caixaStdBold, sans-serif",
              fontWeight: 800,
              color: "#e67200",
              textDecoration: "underline",
              textDecorationThickness: "3px",
              textUnderlineOffset: "4px",
            }}
          >
            apostas
          </span>
        </h2>
        <p className="text-[16px] text-[#4c556c] mb-8" style={{ fontFamily: "caixaStdRegular, sans-serif" }}>
          Cada combo possui uma variedade de jogos prontos para você testar a sua sorte. Quanto mais você joga, mais
          chances de ganhar!
        </p>

        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            disabled={isAnimating}
            className="absolute left-[-50px] top-1/2 -translate-y-1/2 z-10 w-[40px] h-[40px] flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 cursor-pointer"
            aria-label="Anterior"
          >
            <img
              src="https://www.loteriasonline.caixa.gov.br/silce-web/images/icons/icon-slider.png"
              alt="Anterior"
              className="w-[20px] h-[32px] opacity-60 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            />
          </button>

          {/* Carousel Container */}
          <div className="overflow-hidden" ref={carouselRef}>
            <div
              className="flex gap-6 transition-all duration-500 ease-out"
              style={{
                transform: `translateX(0)`,
              }}
            >
              {getVisibleCombos().map((combo, idx) => (
                <div
                  key={`${combo.id}-${currentIndex}-${idx}`}
                  className="flex-shrink-0"
                  style={{
                    width: `calc(33.333% - 16px)`,
                    minWidth: "320px",
                    maxWidth: "370px",
                    perspective: "1000px",
                    animation: isAnimating ? `fadeSlide 0.5s ease-out` : "none",
                  }}
                >
                  <div
                    className="relative w-full h-[480px] transition-transform duration-600 ease-in-out"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: flippedCards[combo.id] ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                  >
                    {/* FRONT of card */}
                    <div
                      className="absolute inset-0 w-full h-full rounded-xl overflow-hidden shadow-lg bg-white"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <ComboCardFront combo={combo} onAposteJa={() => handleFlipCard(combo.id)} />
                    </div>

                    {/* BACK of card */}
                    <div
                      className="absolute inset-0 w-full h-full rounded-xl overflow-hidden shadow-lg"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <ComboCardBack
                        combo={combo}
                        quantity={quantities[combo.id] || getTotalGamesInCombo(combo)}
                        showNumbers={showNumbersMap[combo.id] ?? true}
                        total={calculateTotal(combo)}
                        onClose={() => handleFlipCard(combo.id)}
                        onToggleNumbers={() => handleShowNumbersToggle(combo.id)}
                        onQuantityChange={(delta) => handleQuantityChange(combo.id, delta)}
                        onAddToCart={() => handleAddToCart(combo, false)}
                        onPayNow={() => handleAddToCart(combo, true)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            disabled={isAnimating}
            className="absolute right-[-50px] top-1/2 -translate-y-1/2 z-10 w-[40px] h-[40px] flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 cursor-pointer"
            aria-label="Próximo"
          >
            <img
              src="https://www.loteriasonline.caixa.gov.br/silce-web/images/icons/icon-slider.png"
              alt="Próximo"
              className="w-[20px] h-[32px] rotate-180 opacity-60 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            />
          </button>
        </div>
      </div>
    </section>
  )
}

function ComboCardFront({
  combo,
  onAposteJa,
}: { combo: ComboData & { originalIndex: number }; onAposteJa: () => void }) {
  const renderGameGrid = () => {
    if (combo.layoutType === "single") {
      const game = combo.games[0]
      return (
        <div className="w-full h-[230px] relative overflow-hidden">
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ backgroundColor: game.color }}
          >
            {/* Clover pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage: `url(${CLOVER_PATTERN_BASE64})`,
                backgroundSize: "cover",
                backgroundPosition: "center center",
                backgroundRepeat: "no-repeat",
              }}
            />
            <span className="relative z-10 text-white text-[25px]" style={{ fontFamily: "futuraBold, sans-serif" }}>
              {game.lottery}
            </span>
            <span
              className="relative z-10 text-white/80 text-[18px] mt-2"
              style={{ fontFamily: "caixaStdRegular, sans-serif", letterSpacing: "0.5px" }}
            >
              Concurso {game.concurso}
            </span>
          </div>
        </div>
      )
    }

    const games = combo.games
    const isOddCount = games.length % 2 !== 0
    const rows = Math.ceil(games.length / 2)
    const cellHeight = 230 / rows

    return (
      <div className="w-full h-[230px] grid grid-cols-2 gap-0">
        {games.map((game, idx) => {
          const isLastAndOdd = isOddCount && idx === games.length - 1
          return (
            <div
              key={idx}
              className={`relative flex flex-col items-center justify-center p-1 text-center overflow-hidden ${isLastAndOdd ? "col-span-2" : ""}`}
              style={{
                backgroundColor: game.color,
                minHeight: `${cellHeight}px`,
              }}
            >
              {/* Clover pattern overlay */}
              <div
                className="absolute inset-0 opacity-[0.18]"
                style={{
                  backgroundImage: `url(${CLOVER_PATTERN_BASE64})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <span
                className="relative z-10 text-white text-[14px] leading-tight"
                style={{ fontFamily: "futuraBold, sans-serif" }}
              >
                {game.lottery}
              </span>
              <span
                className="relative z-10 text-white/70 text-[10px] mt-0.5"
                style={{ fontFamily: "caixaStdRegular, sans-serif" }}
              >
                Concurso {game.concurso}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Colorful header with games */}
      {renderGameGrid()}

      {/* White content area */}
      <div className="flex-1 p-5 flex flex-col items-center text-center bg-white">
        <h3 className="text-[22px] text-[#1f2a47] mb-2" style={{ fontFamily: "caixaStdBold, sans-serif" }}>
          {combo.name}
        </h3>
        <p
          className="text-[12px] text-[#4e556a] mb-4 leading-[1.35] min-h-[40px]"
          style={{ fontFamily: "caixaStdRegular, sans-serif" }}
        >
          {combo.description}
        </p>
        <span
          className="text-[25px] text-[#4e556a] mb-4"
          style={{ fontFamily: "caixaStdBold, sans-serif", fontWeight: 700 }}
        >
          R$ {combo.price.toFixed(2).replace(".", ",")}
        </span>
        <button
          onClick={onAposteJa}
          className="w-[160px] py-3 rounded-lg text-[16px] text-white transition-all hover:brightness-110 hover:scale-105 cursor-pointer"
          style={{
            fontFamily: "caixaStdBold, sans-serif",
            backgroundColor: "#e67200",
          }}
        >
          Aposte Já
        </button>
      </div>
    </div>
  )
}

function ComboCardBack({
  combo,
  quantity,
  showNumbers,
  total,
  onClose,
  onToggleNumbers,
  onQuantityChange,
  onAddToCart,
  onPayNow,
}: {
  combo: ComboData & { originalIndex: number }
  quantity: number
  showNumbers: boolean
  total: number
  onClose: () => void
  onToggleNumbers: () => void
  onQuantityChange: (delta: number) => void
  onAddToCart: () => void
  onPayNow: () => void
}) {
  return (
    <div className="flex flex-col h-full bg-[#3eb3ae]">
      {/* Header with games and close button */}
      <div className="relative p-4 flex-1">
        {/* Close button - orange X */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-[33px] h-[33px] rounded-full bg-[#e9983f] flex items-center justify-center text-white hover:bg-[#d88a35] transition-colors z-10 cursor-pointer"
          aria-label="Fechar"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M1 13L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Games list in back - scrollable if many games */}
        <div className="flex flex-wrap justify-center gap-2 mt-6 mb-3 max-h-[100px] overflow-y-auto">
          {combo.games.map((game, idx) => (
            <div key={idx} className="text-center text-white px-2">
              <span className="text-[13px] block" style={{ fontFamily: "futuraBold, sans-serif" }}>
                {game.lottery}
              </span>
              <span className="text-[9px] block opacity-80" style={{ fontFamily: "caixaStdRegular, sans-serif" }}>
                Concurso {game.concurso}
              </span>
            </div>
          ))}
        </div>

        {/* Info text */}
        <p
          className="text-white/90 text-[11px] text-center mt-2 px-2"
          style={{ fontFamily: "caixaStdRegular, sans-serif" }}
        >
          Os números dos jogos dos combos são escolhidos aleatoriamente pelo sistema. Mas antes de efetuar o pagamento é
          possível visualizar os números selecionados.
        </p>

        {/* Checkbox */}
        <label className="flex items-center justify-center gap-2 mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showNumbers}
            onChange={onToggleNumbers}
            className="w-4 h-4 accent-[#005aa5]"
          />
          <span className="text-white text-[12px]" style={{ fontFamily: "caixaStdRegular, sans-serif" }}>
            Quero ver os números escolhidos antes de pagar
          </span>
        </label>
      </div>

      {/* Bottom section - white */}
      <div className="bg-white p-4 flex flex-col items-center justify-center">
        <span className="text-[14px] text-[#4c556c] mb-3" style={{ fontFamily: "caixaStdRegular, sans-serif" }}>
          Quantidade de apostas:
        </span>

        {/* Quantity selector */}
        <div className="flex items-center gap-0 mb-4">
          <button
            onClick={() => onQuantityChange(-1)}
            className="w-[40px] h-[40px] bg-[#005aa5] text-white text-[24px] flex items-center justify-center rounded-l-lg hover:bg-[#004a8a] transition-colors cursor-pointer"
          >
            -
          </button>
          <div className="w-[50px] h-[40px] bg-white border-t-2 border-b-2 border-[#005aa5] flex items-center justify-center">
            <span className="text-[18px] text-[#1f2a47]" style={{ fontFamily: "caixaStdBold, sans-serif" }}>
              {quantity}
            </span>
          </div>
          <button
            onClick={() => onQuantityChange(1)}
            className="w-[40px] h-[40px] bg-[#005aa5] text-white text-[24px] flex items-center justify-center rounded-r-lg hover:bg-[#004a8a] transition-colors cursor-pointer"
          >
            +
          </button>
        </div>

        {/* Total */}
        <span className="text-[24px] text-[#1f2a47] mb-4" style={{ fontFamily: "caixaStdBold, sans-serif" }}>
          Total: R$ {total.toFixed(2).replace(".", ",")}
        </span>

        {/* Action buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onPayNow}
            className="flex-1 py-3 rounded-lg text-[14px] text-white transition-all hover:brightness-110 cursor-pointer"
            style={{
              fontFamily: "caixaStdBold, sans-serif",
              backgroundColor: "#e67200",
            }}
          >
            Pagar agora
          </button>
          <button
            onClick={onAddToCart}
            className="flex-1 py-3 rounded-lg text-[14px] border-2 border-[#005aa5] text-[#005aa5] bg-white hover:bg-[#005aa5] hover:text-white transition-all cursor-pointer"
            style={{ fontFamily: "caixaStdBold, sans-serif" }}
          >
            Incluir no carrinho
          </button>
        </div>
      </div>
    </div>
  )
}
