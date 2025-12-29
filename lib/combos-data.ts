export interface ComboGame {
  lottery: string
  quantity: number
  concurso: string
  numbers?: number[][]
  color: string
}

export interface ComboData {
  id: string
  name: string
  description: string
  price: number
  baseQuantity: number // renamed from pricePerGame - now represents fixed minimum quantity
  games: ComboGame[]
  showNumbersOption: boolean
  layoutType: "single" | "grid-2" | "grid-4" | "grid-6" | "grid-8"
}

// Generate random numbers for a lottery game
function generateRandomNumbers(min: number, max: number, count: number): number[] {
  const numbers: number[] = []
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min
    if (!numbers.includes(num)) {
      numbers.push(num)
    }
  }
  return numbers.sort((a, b) => a - b)
}

// Generate games for each combo
function generateGamesForCombo(lottery: string, quantity: number): number[][] {
  const games: number[][] = []

  const lotteryConfig: Record<string, { min: number; max: number; count: number }> = {
    "mega da virada": { min: 1, max: 60, count: 6 },
    "mega-sena": { min: 1, max: 60, count: 6 },
    lotofácil: { min: 1, max: 25, count: 15 },
    quina: { min: 1, max: 80, count: 5 },
    lotomania: { min: 0, max: 99, count: 50 },
    "dupla sena": { min: 1, max: 50, count: 6 },
    "dia de sorte": { min: 1, max: 31, count: 7 },
    timemania: { min: 1, max: 80, count: 10 },
    "+milionária": { min: 1, max: 50, count: 6 },
    "super sete": { min: 0, max: 9, count: 7 },
  }

  const config = lotteryConfig[lottery.toLowerCase()] || { min: 1, max: 60, count: 6 }

  for (let i = 0; i < quantity; i++) {
    games.push(generateRandomNumbers(config.min, config.max, config.count))
  }

  return games
}

export const COMBOS_DATA: ComboData[] = [
  {
    id: "especial",
    name: "Especial",
    description:
      "Aposte no combo exclusivo da Mega da Virada e aumente suas chances! O prêmio está estimado em R$ 1 Bilhão e não acumula. Já pensou?",
    price: 24.0,
    baseQuantity: 4,
    games: [{ lottery: "Mega da Virada", quantity: 4, concurso: "2955", color: "#00a651" }],
    showNumbersOption: true,
    layoutType: "single",
  },
  {
    id: "fezinha-do-mes",
    name: "Fezinha do Mês",
    description:
      "Quer sorte o mês inteiro? Pacote de apostas teimosinhas de todas as modalidades disponíveis, exceto Timemania e Loteca.",
    price: 366.0,
    baseQuantity: 9,
    games: [
      { lottery: "Mega da Virada", quantity: 1, concurso: "2955", color: "#00a651" },
      { lottery: "Lotofácil", quantity: 1, concurso: "3574 a 3597", color: "#91278f" },
      { lottery: "Quina", quantity: 1, concurso: "6914 a 6937", color: "#2e3192" },
      { lottery: "+Milionária", quantity: 1, concurso: "316 a 320", color: "#2a3580" },
      { lottery: "Dupla Sena", quantity: 1, concurso: "2905 a 2916", color: "#a62b43" },
      { lottery: "Lotomania", quantity: 1, concurso: "2868 a 2879", color: "#e67200" },
      { lottery: "Dia de Sorte", quantity: 1, concurso: "1158 a 1169", color: "#ae9319" },
      { lottery: "Super Sete", quantity: 1, concurso: "791 a 802", color: "#bed730" },
    ],
    showNumbersOption: true,
    layoutType: "grid-8",
  },
  {
    id: "loterias-pra-elas",
    name: "Loterias Pra Elas",
    description:
      "Pacote com as modalidades preferidas pelas apostadoras. Várias chances para realizar seus sonhos. Já Pensou?",
    price: 21.0,
    baseQuantity: 5,
    games: [
      { lottery: "Mega da Virada", quantity: 1, concurso: "2955", color: "#00a651" },
      { lottery: "Lotofácil", quantity: 1, concurso: "3574", color: "#91278f" },
      { lottery: "+Milionária", quantity: 1, concurso: "316", color: "#2a3580" },
      { lottery: "Dupla Sena", quantity: 1, concurso: "2905", color: "#a62b43" },
      { lottery: "Dia de Sorte", quantity: 1, concurso: "1158", color: "#ae9319" },
    ],
    showNumbersOption: true,
    layoutType: "grid-6",
  },
  {
    id: "chance-todo-dia",
    name: "Chance Todo Dia",
    description: "Apostas diárias para você ter chances todos os dias. Lotofácil e Quina com sorteios frequentes!",
    price: 111.0,
    baseQuantity: 10,
    games: [
      { lottery: "Mega da Virada", quantity: 1, concurso: "2955", color: "#00a651" },
      { lottery: "Lotofácil", quantity: 1, concurso: "3574", color: "#91278f" },
      { lottery: "Quina", quantity: 1, concurso: "6914", color: "#2e3192" },
      { lottery: "+Milionária", quantity: 1, concurso: "316", color: "#2a3580" },
      { lottery: "Dupla Sena", quantity: 1, concurso: "2905", color: "#a62b43" },
      { lottery: "Lotomania", quantity: 1, concurso: "2868", color: "#e67200" },
      { lottery: "Timemania", quantity: 1, concurso: "2337", color: "#038141" },
      { lottery: "Dia de Sorte", quantity: 1, concurso: "1158", color: "#ae9319" },
      { lottery: "Super Sete", quantity: 1, concurso: "791", color: "#bed730" },
      { lottery: "Loteca", quantity: 1, concurso: "1227", color: "#eb212c" },
    ],
    showNumbersOption: true,
    layoutType: "grid-8",
  },
  {
    id: "milionario",
    name: "Milionário",
    description:
      "Combo premium com as maiores loterias. Mega da Virada, Lotofácil, +Milionária, Dupla Sena e Lotomania para chances de prêmios milionários!",
    price: 55.0,
    baseQuantity: 13,
    games: [
      { lottery: "Mega da Virada", quantity: 3, concurso: "2955", color: "#00a651" },
      { lottery: "Lotofácil", quantity: 3, concurso: "3574", color: "#91278f" },
      { lottery: "+Milionária", quantity: 2, concurso: "316", color: "#2a3580" },
      { lottery: "Dupla Sena", quantity: 3, concurso: "2905", color: "#a62b43" },
      { lottery: "Lotomania", quantity: 2, concurso: "2868", color: "#e67200" },
    ],
    showNumbersOption: true,
    layoutType: "grid-6",
  },
  {
    id: "sorte-facil",
    name: "Sorte Fácil",
    description: "Lotofácil, Lotomania, Dia de Sorte e Super Sete! As loterias com as melhores chances de ganhar!",
    price: 61.0,
    baseQuantity: 20,
    games: [
      { lottery: "Lotofácil", quantity: 5, concurso: "3574", color: "#91278f" },
      { lottery: "Lotomania", quantity: 5, concurso: "2868", color: "#e67200" },
      { lottery: "Dia de Sorte", quantity: 5, concurso: "1158", color: "#ae9319" },
      { lottery: "Super Sete", quantity: 5, concurso: "791", color: "#bed730" },
    ],
    showNumbersOption: true,
    layoutType: "grid-4",
  },
  {
    id: "combo-vip",
    name: "Combo Vip",
    description:
      "O combo mais completo! Mega da Virada, Lotofácil, Quina e +Milionária em um só pacote para maximizar suas chances.",
    price: 1652.0,
    baseQuantity: 4,
    games: [
      { lottery: "Mega da Virada", quantity: 1, concurso: "2955", color: "#00a651" },
      { lottery: "Lotofácil", quantity: 1, concurso: "3574", color: "#91278f" },
      { lottery: "Quina", quantity: 1, concurso: "6914", color: "#2e3192" },
      { lottery: "+Milionária", quantity: 1, concurso: "316", color: "#2a3580" },
    ],
    showNumbersOption: true,
    layoutType: "grid-4",
  },
]

export function calculateComboPrice(comboId: string, quantity: number): number {
  const combo = COMBOS_DATA.find((c) => c.id === comboId)
  if (!combo) return 0

  const baseQty = combo.baseQuantity
  const basePrice = combo.price

  // Price per additional game varies by combo
  const pricePerGame = basePrice / baseQty

  return pricePerGame * quantity
}

export function generateComboGames(combo: ComboData): ComboData {
  return {
    ...combo,
    games: combo.games.map((game) => ({
      ...game,
      numbers: generateGamesForCombo(game.lottery, game.quantity),
    })),
  }
}

export function getTotalGamesInCombo(combo: ComboData): number {
  return combo.baseQuantity
}
