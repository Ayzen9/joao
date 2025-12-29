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
      // Super Sete: price increases with more columns selected beyond 7
      if (filledColumns === 7) return rule.basePrice
      return calculatePrice(lotteryName, filledColumns)
    }

    if (rule.name === "loteca") {
      return rule.basePrice
    }

    if (selectedNumbers.length < rule.minNumbers) {
      return 0
    }

    return calculatePrice(lotteryName, selectedNumbers.length)
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
        <div className="space-y-6">
          <p className="text-center text-xl text-gray-600" style={{ fontFamily: "caixaStdRegular" }}>
            Escolha um número de 0 a 9 em cada coluna
          </p>
          <div className="grid grid-cols-7 gap-5 justify-center">
            {Array.from({ length: 7 }).map((_, colIndex) => (
              <div key={colIndex} className="flex flex-col items-center gap-3">
                <span className="text-xl font-bold" style={{ color: lotteryColor, fontFamily: "caixaStdBold" }}>
                  Col {colIndex + 1}
                </span>
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 10 }).map((_, num) => (
                    <button
                      key={num}
                      onClick={() => handleSuperSevenClick(colIndex, num)}
                      className="w-14 h-14 rounded-full text-xl font-bold transition-all duration-200 hover:scale-110 flex items-center justify-center"
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
      )
    }

    if (rule.name === "loteca") {
      const matches = [
        { home: "Time A", away: "Time B" },
        { home: "Time C", away: "Time D" },
        { home: "Time E", away: "Time F" },
        { home: "Time G", away: "Time H" },
        { home: "Time I", away: "Time J" },
        { home: "Time K", away: "Time L" },
        { home: "Time M", away: "Time N" },
        { home: "Time O", away: "Time P" },
        { home: "Time Q", away: "Time R" },
        { home: "Time S", away: "Time T" },
        { home: "Time U", away: "Time V" },
        { home: "Time W", away: "Time X" },
        { home: "Time Y", away: "Time Z" },
        { home: "Time AA", away: "Time AB" },
      ]

      return (
        <div className="space-y-4">
          <p className="text-center text-xl text-gray-600" style={{ fontFamily: "caixaStdRegular" }}>
            Selecione o resultado de cada jogo: 1 (mandante), X (empate), 2 (visitante)
          </p>
          <div className="space-y-3">
            {matches.map((match, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                <span className="text-lg" style={{ fontFamily: "caixaStdRegular" }}>
                  {idx + 1}. {match.home} x {match.away}
                </span>
                <div className="flex gap-3">
                  {([1, "x", 2] as const).map((result) => (
                    <button
                      key={result}
                      onClick={() => handleLotecaClick(idx, result as 1 | 2 | "x")}
                      className="w-16 h-16 rounded-full text-xl font-bold transition-all duration-200 hover:scale-110 flex items-center justify-center"
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

    return (
      <div className="space-y-6">
        <p className="text-center text-xl text-gray-600" style={{ fontFamily: "caixaStdRegular" }}>
          {isBolao
            ? `Escolha de ${rule.minNumbers} a ${rule.maxNumbers} números`
            : `Escolha ${rule.minNumbers} números`}
        </p>
        <div
          className="grid gap-3 justify-center mx-auto"
          style={{
            gridTemplateColumns: `repeat(${columns}, 52px)`,
            maxWidth: "fit-content",
          }}
        >
          {numbers.map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="w-[52px] h-[52px] rounded-full text-lg font-bold transition-all duration-200 hover:scale-110 flex items-center justify-center"
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
        <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
          <h4 className="text-2xl font-bold mb-4" style={{ color: lotteryColor, fontFamily: "caixaStdBold" }}>
            Mês da Sorte
          </h4>
          <p className="text-lg text-gray-600 mb-4" style={{ fontFamily: "caixaStdRegular" }}>
            Escolha seu mês da sorte
          </p>
          <div className="grid grid-cols-4 gap-3">
            {MONTHS.map((month, idx) => (
              <button
                key={month}
                onClick={() => handleBonusClick(idx + 1)}
                className="py-4 px-4 rounded-xl text-lg font-bold transition-all duration-200 hover:scale-105"
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
      <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
        <h4 className="text-2xl font-bold mb-4" style={{ color: lotteryColor, fontFamily: "caixaStdBold" }}>
          {rule.bonusName} (escolha {rule.bonusMin} a {rule.bonusMax})
        </h4>
        <div className="flex justify-center gap-4">
          {Array.from({ length: rule.bonusTotalNumbers! }, (_, i) => i + rule.bonusStartNumber!).map((num) => (
            <button
              key={num}
              onClick={() => handleBonusClick(num)}
              className="w-20 h-20 rounded-full text-2xl font-bold transition-all duration-200 hover:scale-110 flex items-center justify-center"
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
      <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
        <h4 className="text-2xl font-bold mb-4" style={{ color: lotteryColor, fontFamily: "caixaStdBold" }}>
          Time do Coração
        </h4>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="w-full p-4 rounded-xl border-2 text-lg"
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overlay-fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl cart-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between" style={{ backgroundColor: lotteryColor }}>
          <div>
            <h3 className="text-3xl text-white uppercase tracking-wide" style={{ fontFamily: "futuraBold" }}>
              {rule.displayName}
            </h3>
            <p className="text-white/80 text-xl mt-1" style={{ fontFamily: "caixaStdRegular" }}>
              {isBolao ? "Bolão (aposta em grupo)" : "Aposta Simples"} - Concurso {concurso}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
          >
            <X className="w-8 h-8 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto" style={{ maxHeight: "calc(90vh - 240px)" }}>
          {renderNumberGrid()}
          {renderBonusSection()}
          {renderTeamSection()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex gap-4">
            <button
              onClick={handleSurpresinha}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gray-200 hover:bg-gray-300 transition-all text-xl"
              style={{ fontFamily: "caixaStdBold" }}
            >
              <Shuffle className="w-6 h-6" />
              Surpresinha
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gray-200 hover:bg-gray-300 transition-all text-xl"
              style={{ fontFamily: "caixaStdBold" }}
            >
              <Trash2 className="w-6 h-6" />
              Limpar
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-lg text-gray-500" style={{ fontFamily: "caixaStdRegular" }}>
                {numberCount.current}/{numberCount.max}{" "}
                {rule.name === "super sete" ? "colunas" : rule.name === "loteca" ? "jogos" : "números"}
              </p>
              <p className="text-4xl font-bold" style={{ color: lotteryColor, fontFamily: "caixaStdBold" }}>
                R$ {getCurrentPrice().toFixed(2).replace(".", ",")}
              </p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!isValid()}
              className="flex items-center gap-3 px-10 py-5 rounded-xl text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 text-2xl"
              style={{
                backgroundColor: isValid() ? lotteryColor : "#ccc",
                fontFamily: "caixaStdBold",
              }}
            >
              <ShoppingCart className="w-7 h-7" />
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
