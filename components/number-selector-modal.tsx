"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Shuffle, Trash2, ShoppingCart } from "lucide-react"
import { LOTTERY_RULES, MONTHS, generateRandomNumbers, generateRandomBonus, calculatePrice } from "@/lib/lottery-rules"
import { useCart } from "./cart-context"

interface NumberSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  lotteryName: string
  lotteryColor: string
  concurso: string
  isBolao?: boolean
}

export function NumberSelectorModal({
  isOpen,
  onClose,
  lotteryName,
  lotteryColor,
  concurso,
  isBolao = false,
}: NumberSelectorModalProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [selectedBonus, setSelectedBonus] = useState<number[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>("")
  const [superSevenColumns, setSuperSevenColumns] = useState<(number | null)[]>([
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ])
  const [lotecaResults, setLotecaResults] = useState<(1 | 2 | "x" | null)[]>(Array(14).fill(null))
  const { addItemWithNumbers } = useCart()

  const rule = LOTTERY_RULES[lotteryName.toLowerCase()]

  useEffect(() => {
    if (isOpen) {
      setSelectedNumbers([])
      setSelectedBonus([])
      setSelectedTeam("")
      setSuperSevenColumns([null, null, null, null, null, null, null])
      setLotecaResults(Array(14).fill(null))
    }
  }, [isOpen, lotteryName])

  const getMaxSelectableNumbers = useCallback(() => {
    if (!rule) return 0
    return isBolao ? rule.maxNumbers : rule.minNumbers
  }, [rule, isBolao])

  const handleNumberClick = useCallback(
    (num: number) => {
      const maxSelectable = getMaxSelectableNumbers()
      setSelectedNumbers((prev) => {
        if (prev.includes(num)) {
          return prev.filter((n) => n !== num)
        }
        if (prev.length >= maxSelectable) {
          return prev
        }
        return [...prev, num].sort((a, b) => a - b)
      })
    },
    [getMaxSelectableNumbers],
  )

  const handleBonusClick = useCallback(
    (num: number) => {
      if (!rule?.hasBonus) return
      setSelectedBonus((prev) => {
        if (prev.includes(num)) {
          return prev.filter((n) => n !== num)
        }
        if (prev.length >= rule.bonusMax!) {
          return prev
        }
        return [...prev, num].sort((a, b) => a - b)
      })
    },
    [rule],
  )

  const handleSuperSevenClick = useCallback((columnIndex: number, num: number) => {
    setSuperSevenColumns((prev) => {
      const newColumns = [...prev]
      if (newColumns[columnIndex] === num) {
        newColumns[columnIndex] = null
      } else {
        newColumns[columnIndex] = num
      }
      return newColumns
    })
  }, [])

  const handleLotecaClick = useCallback((matchIndex: number, result: 1 | 2 | "x") => {
    setLotecaResults((prev) => {
      const newResults = [...prev]
      newResults[matchIndex] = newResults[matchIndex] === result ? null : result
      return newResults
    })
  }, [])

  const handleSurpresinha = useCallback(() => {
    if (!rule) return
    if (rule.name === "super sete") {
      const newColumns = superSevenColumns.map(() => Math.floor(Math.random() * 10))
      setSuperSevenColumns(newColumns)
    } else if (rule.name === "loteca") {
      const results: (1 | 2 | "x")[] = Array(14)
        .fill(null)
        .map(() => {
          const r = Math.random()
          if (r < 0.33) return 1
          if (r < 0.66) return 2
          return "x"
        })
      setLotecaResults(results)
    } else {
      setSelectedNumbers(generateRandomNumbers(lotteryName))
      if (rule.hasBonus) {
        setSelectedBonus(generateRandomBonus(lotteryName))
      }
      if (rule.hasTeam && rule.teams) {
        const randomTeam = rule.teams[Math.floor(Math.random() * rule.teams.length)]
        setSelectedTeam(randomTeam)
      }
    }
  }, [lotteryName, rule, superSevenColumns])

  const handleClear = useCallback(() => {
    setSelectedNumbers([])
    setSelectedBonus([])
    setSelectedTeam("")
    setSuperSevenColumns([null, null, null, null, null, null, null])
    setLotecaResults(Array(14).fill(null))
  }, [])

  const isValid = useCallback(() => {
    if (!rule) return false
    if (rule.name === "super sete") {
      return superSevenColumns.filter((n) => n !== null).length >= 7
    }
    if (rule.name === "loteca") {
      return lotecaResults.filter((r) => r !== null).length === 14
    }
    if (rule.hasBonus && selectedBonus.length < rule.bonusMin!) {
      return false
    }
    if (rule.hasTeam && !selectedTeam) {
      return false
    }
    return selectedNumbers.length >= rule.minNumbers
  }, [rule, selectedNumbers, selectedBonus, selectedTeam, superSevenColumns, lotecaResults])

  const getCurrentPrice = useCallback(() => {
    if (!rule) return 0

    if (rule.name === "super sete") {
      const filledColumns = superSevenColumns.filter((n) => n !== null).length
      if (filledColumns < 7) return 0
      if (filledColumns === 7) return rule.basePrice / 2
      return calculatePrice(lotteryName, filledColumns) / 2
    }

    if (rule.name === "loteca") {
      return rule.basePrice / 2
    }

    if (selectedNumbers.length < rule.minNumbers) {
      return 0
    }

    return calculatePrice(lotteryName, selectedNumbers.length) / 2
  }, [lotteryName, selectedNumbers.length, rule, superSevenColumns])

  const getNumberCount = useCallback(() => {
    if (!rule) return { current: 0, max: 0 }

    if (rule.name === "super sete") {
      const filled = superSevenColumns.filter((n) => n !== null).length
      return { current: filled, max: isBolao ? 21 : 7 }
    }

    if (rule.name === "loteca") {
      const filled = lotecaResults.filter((r) => r !== null).length
      return { current: filled, max: 14 }
    }

    return {
      current: selectedNumbers.length,
      max: getMaxSelectableNumbers(),
    }
  }, [rule, superSevenColumns, lotecaResults, selectedNumbers.length, getMaxSelectableNumbers, isBolao])

  const handleAddToCart = useCallback(() => {
    if (!isValid()) return

    let numbersToSave: number[] = []
    let bonusToSave: number[] = []

    if (rule.name === "super sete") {
      numbersToSave = superSevenColumns.filter((n) => n !== null) as number[]
    } else if (rule.name === "loteca") {
      numbersToSave = lotecaResults.map((r) => (r === 1 ? 1 : r === 2 ? 2 : 0))
    } else {
      numbersToSave = selectedNumbers
      bonusToSave = selectedBonus
    }

    addItemWithNumbers(
      lotteryName,
      isBolao ? "bolao" : "aposta",
      getCurrentPrice(),
      lotteryColor,
      concurso,
      numbersToSave,
      bonusToSave.length > 0 ? bonusToSave : undefined,
      selectedTeam || undefined,
    )

    onClose()
  }, [
    isValid,
    rule,
    superSevenColumns,
    lotecaResults,
    selectedNumbers,
    selectedBonus,
    addItemWithNumbers,
    lotteryName,
    isBolao,
    getCurrentPrice,
    lotteryColor,
    concurso,
    selectedTeam,
    onClose,
  ])

  if (!isOpen || !rule) return null

  const numberCount = getNumberCount()

  const renderNumberGrid = () => {
    if (rule.name === "super sete") {
      return (
        <div className="space-y-6 sm:space-y-8">
          <p className="text-center text-base sm:text-2xl text-gray-600" style={{ fontFamily: "caixaStdRegular" }}>
            Escolha um número de 0 a 9 em cada coluna
          </p>
          <div className="overflow-x-auto pb-4">
            <div className="grid grid-cols-7 gap-3 sm:gap-6 justify-center min-w-[360px] sm:min-w-[600px]">
              {Array.from({ length: 7 }).map((_, colIndex) => (
                <div key={colIndex} className="flex flex-col items-center gap-2 sm:gap-4">
                  <span
                    className="text-sm sm:text-2xl font-bold"
                    style={{ color: lotteryColor, fontFamily: "caixaStdBold" }}
                  >
                    Col {colIndex + 1}
                  </span>
                  <div className="flex flex-col gap-2 sm:gap-3">
                    {Array.from({ length: 10 }).map((_, num) => (
                      <button
                        key={num}
                        onClick={() => handleSuperSevenClick(colIndex, num)}
                        className="w-10 h-10 sm:w-16 sm:h-16 rounded-full text-base sm:text-2xl font-bold transition-all duration-200 hover:scale-110 flex items-center justify-center"
                        style={{
                          backgroundColor: superSevenColumns[colIndex] === num ? lotteryColor : "#f5f5f5",
                          color: superSevenColumns[colIndex] === num ? "#fff" : "#4c556c",
                          fontFamily: "caixaStdBold",
                          border: superSevenColumns[colIndex] === num ? "none" : "2px solid #e0e0e0",
                        }}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (rule.name === "loteca") {
      const matches = [
        { home: "Equipe 01", away: "Equipe 02" },
        { home: "Equipe 03", away: "Equipe 04" },
        { home: "Equipe 05", away: "Equipe 06" },
        { home: "Equipe 07", away: "Equipe 08" },
        { home: "Equipe 09", away: "Equipe 10" },
        { home: "Equipe 11", away: "Equipe 12" },
        { home: "Equipe 13", away: "Equipe 14" },
        { home: "Equipe 15", away: "Equipe 16" },
        { home: "Equipe 17", away: "Equipe 18" },
        { home: "Equipe 19", away: "Equipe 20" },
        { home: "Equipe 21", away: "Equipe 22" },
        { home: "Equipe 23", away: "Equipe 24" },
        { home: "Equipe 25", away: "Equipe 26" },
        { home: "Equipe 27", away: "Equipe 28" },
      ]

      return (
        <div className="space-y-5 sm:space-y-6">
          <p className="text-center text-base sm:text-2xl text-gray-600" style={{ fontFamily: "caixaStdRegular" }}>
            Selecione o resultado de cada jogo: 1 (mandante), X (empate), 2 (visitante)
          </p>
          <div className="space-y-3 sm:space-y-4 max-h-[60vh] sm:max-h-none overflow-y-auto pr-2">
            {matches.map((match, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 sm:p-5 rounded-2xl gap-3 sm:gap-6">
                <span className="text-sm sm:text-xl flex-1 font-medium" style={{ fontFamily: "caixaStdRegular" }}>
                  {idx + 1}. {match.home} x {match.away}
                </span>
                <div className="flex gap-2 sm:gap-4 flex-shrink-0">
                  {([1, "x", 2] as const).map((result) => (
                    <button
                      key={result}
                      onClick={() => handleLotecaClick(idx, result as 1 | 2 | "x")}
                      className="w-12 h-12 sm:w-20 sm:h-20 rounded-full text-lg sm:text-3xl font-bold transition-all duration-200 hover:scale-110 flex items-center justify-center"
                      style={{
                        backgroundColor: lotecaResults[idx] === result ? lotteryColor : "#f5f5f5",
                        color: lotecaResults[idx] === result ? "#fff" : "#4c556c",
                        fontFamily: "caixaStdBold",
                        border: lotecaResults[idx] === result ? "none" : "2px solid #e0e0e0",
                      }}
                    >
                      {result === "x" ? "X" : result}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    const numbers = Array.from({ length: rule.totalNumbers }, (_, i) => i + rule.startNumber)
    const columns = rule.totalNumbers <= 25 ? 5 : rule.totalNumbers <= 50 ? 10 : 10
    const mobileColumns = rule.totalNumbers <= 25 ? 5 : 6

    return (
      <div className="space-y-6 sm:space-y-8">
        <p className="text-center text-base sm:text-2xl text-gray-600" style={{ fontFamily: "caixaStdRegular" }}>
          {isBolao
            ? `Escolha de ${rule.minNumbers} a ${rule.maxNumbers} números`
            : `Escolha ${rule.minNumbers} números`}
        </p>
        <div
          className="grid gap-2 sm:gap-4 justify-center mx-auto"
          style={{
            gridTemplateColumns: `repeat(var(--cols), minmax(0, 1fr))`,
            maxWidth: "fit-content",
          }}
        >
          <style jsx>{`
            div {
              --cols: ${mobileColumns};
            }
            @media (min-width: 640px) {
              div {
                --cols: ${columns};
              }
            }
          `}</style>
          {numbers.map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full text-base sm:text-xl font-bold transition-all duration-200 hover:scale-110 flex items-center justify-center"
              style={{
                backgroundColor: selectedNumbers.includes(num) ? lotteryColor : "#f5f5f5",
                color: selectedNumbers.includes(num) ? "#fff" : "#4c556c",
                fontFamily: "caixaStdBold",
                border: selectedNumbers.includes(num) ? "none" : "2px solid #e0e0e0",
              }}
            >
              {num.toString().padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderBonusSection = () => {
    if (!rule.hasBonus) return null

    if (rule.bonusName === "Mês da Sorte") {
      return (
        <div className="mt-6 sm:mt-10 p-4 sm:p-8 bg-gray-50 rounded-2xl">
          <h4
            className="text-xl sm:text-3xl font-bold mb-3 sm:mb-6"
            style={{ color: lotteryColor, fontFamily: "caixaStdBold" }}
          >
            Mês da Sorte
          </h4>
          <p className="text-base sm:text-xl text-gray-600 mb-3 sm:mb-6" style={{ fontFamily: "caixaStdRegular" }}>
            Escolha seu mês da sorte
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-5">
            {MONTHS.map((month, idx) => (
              <button
                key={month}
                onClick={() => handleBonusClick(idx + 1)}
                className="py-3 sm:py-5 px-3 sm:px-6 rounded-xl text-base sm:text-xl font-bold transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: selectedBonus.includes(idx + 1) ? lotteryColor : "#f5f5f5",
                  color: selectedBonus.includes(idx + 1) ? "#fff" : "#4c556c",
                  fontFamily: "caixaStdBold",
                  border: selectedBonus.includes(idx + 1) ? "none" : "2px solid #e0e0e0",
                }}
              >
                {month.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="mt-6 sm:mt-10 p-4 sm:p-8 bg-gray-50 rounded-2xl">
        <h4
          className="text-xl sm:text-3xl font-bold mb-3 sm:mb-6"
          style={{ color: lotteryColor, fontFamily: "caixaStdBold" }}
        >
          {rule.bonusName} (escolha {rule.bonusMin} a {rule.bonusMax})
        </h4>
        <div className="flex justify-center gap-3 sm:gap-5 flex-wrap">
          {Array.from({ length: rule.bonusTotalNumbers! }, (_, i) => i + rule.bonusStartNumber!).map((num) => (
            <button
              key={num}
              onClick={() => handleBonusClick(num)}
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-full text-xl sm:text-3xl font-bold transition-all duration-200 hover:scale-110 flex items-center justify-center"
              style={{
                backgroundColor: selectedBonus.includes(num) ? lotteryColor : "#f5f5f5",
                color: selectedBonus.includes(num) ? "#fff" : "#4c556c",
                fontFamily: "caixaStdBold",
                border: selectedBonus.includes(num) ? "none" : "2px solid #e0e0e0",
              }}
            >
              🍀{num}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderTeamSection = () => {
    if (!rule.hasTeam || !rule.teams) return null

    return (
      <div className="mt-6 sm:mt-10 p-4 sm:p-8 bg-gray-50 rounded-2xl">
        <h4
          className="text-xl sm:text-3xl font-bold mb-3 sm:mb-6"
          style={{ color: lotteryColor, fontFamily: "caixaStdBold" }}
        >
          Time do Coração
        </h4>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="w-full p-4 sm:p-5 rounded-xl border-2 text-base sm:text-xl"
          style={{
            borderColor: lotteryColor,
            fontFamily: "caixaStdRegular",
          }}
        >
          <option value="">Selecione seu time...</option>
          {rule.teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/70 overlay-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-6xl h-[96vh] sm:h-[94vh] overflow-hidden shadow-2xl cart-slide-in flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-8 flex items-center justify-between shrink-0" style={{ backgroundColor: lotteryColor }}>
          <div className="flex-1 min-w-0">
            <h3
              className="text-xl sm:text-4xl text-white uppercase tracking-wide truncate"
              style={{ fontFamily: "futuraBold" }}
            >
              {rule.displayName}
            </h3>
            <p
              className="text-white/90 text-sm sm:text-2xl mt-1 sm:mt-2 truncate"
              style={{ fontFamily: "caixaStdRegular" }}
            >
              {isBolao ? "Bolão" : "Aposta Simples"} - Concurso {concurso}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all flex-shrink-0 ml-3"
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-10">
          {renderNumberGrid()}
          {renderBonusSection()}
          {renderTeamSection()}
        </div>

        <div className="p-4 sm:p-8 border-t bg-gray-50 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            <div className="flex flex-wrap gap-3 sm:gap-6">
              <button
                onClick={handleSurpresinha}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 sm:px-10 py-3 sm:py-5 rounded-2xl bg-gray-200 hover:bg-gray-300 transition-all text-base sm:text-2xl min-w-[140px]"
                style={{ fontFamily: "caixaStdBold" }}
              >
                <Shuffle className="w-5 h-5 sm:w-7 sm:h-7" />
                Surpresinha
              </button>
              <button
                onClick={handleClear}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 sm:px-10 py-3 sm:py-5 rounded-2xl bg-gray-200 hover:bg-gray-300 transition-all text-base sm:text-2xl min-w-[140px]"
                style={{ fontFamily: "caixaStdBold" }}
              >
                <Trash2 className="w-5 h-5 sm:w-7 sm:h-7" />
                Limpar
              </button>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 w-full sm:w-auto">
              <div className="text-left sm:text-right">
                <p className="text-sm sm:text-2xl text-gray-600" style={{ fontFamily: "caixaStdRegular" }}>
                  {numberCount.current}/{numberCount.max}{" "}
                  {rule.name === "super sete" ? "colunas" : rule.name === "loteca" ? "jogos" : "números"}
                </p>
                <p
                  className="text-3xl sm:text-5xl font-bold"
                  style={{ color: lotteryColor, fontFamily: "caixaStdBold" }}
                >
                  R$ {getCurrentPrice().toFixed(2).replace(".", ",")}
                </p>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!isValid()}
                className="flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-6 rounded-2xl text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 text-xl sm:text-3xl min-w-[160px] sm:min-w-[220px]"
                style={{
                  backgroundColor: isValid() ? lotteryColor : "#ccc",
                  fontFamily: "caixaStdBold",
                }}
              >
                <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="hidden sm:inline">Adicionar</span>
                <span className="sm:hidden">+</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}