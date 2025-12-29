// Regras oficiais de cada loteria da CAIXA
export interface LotteryRule {
  name: string
  displayName: string
  minNumbers: number
  maxNumbers: number
  totalNumbers: number
  startNumber: number
  basePrice: number
  color: string
  // Para loterias especiais
  hasBonus?: boolean
  bonusName?: string
  bonusMin?: number
  bonusMax?: number
  bonusTotalNumbers?: number
  bonusStartNumber?: number
  // Para Super Sete (colunas)
  columns?: number
  numbersPerColumn?: number
  // Para Loteca (jogos de futebol)
  matches?: number
  // Para Timemania (times)
  hasTeam?: boolean
  teams?: string[]
}

export const LOTTERY_RULES: Record<string, LotteryRule> = {
  "mega da virada": {
    name: "mega da virada",
    displayName: "Mega da Virada",
    minNumbers: 6,
    maxNumbers: 20,
    totalNumbers: 60,
    startNumber: 1,
    basePrice: 6.0, // Updated from 5.0 to 6.0
    color: "#00a651",
  },
  "mega-sena": {
    name: "mega-sena",
    displayName: "Mega-Sena",
    minNumbers: 6,
    maxNumbers: 20,
    totalNumbers: 60,
    startNumber: 1,
    basePrice: 5.0,
    color: "#00a651",
  },
  lotofácil: {
    name: "lotofácil",
    displayName: "Lotofácil",
    minNumbers: 15,
    maxNumbers: 20,
    totalNumbers: 25,
    startNumber: 1,
    basePrice: 3.0,
    color: "#91278f",
  },
  quina: {
    name: "quina",
    displayName: "Quina",
    minNumbers: 5,
    maxNumbers: 15,
    totalNumbers: 80,
    startNumber: 1,
    basePrice: 2.5,
    color: "#2e3192",
  },
  "+milionária": {
    name: "+milionária",
    displayName: "+Milionária",
    minNumbers: 6,
    maxNumbers: 12,
    totalNumbers: 50,
    startNumber: 1,
    basePrice: 6.0,
    color: "#2a3580",
    hasBonus: true,
    bonusName: "Trevos",
    bonusMin: 2,
    bonusMax: 6,
    bonusTotalNumbers: 6,
    bonusStartNumber: 1,
  },
  lotomania: {
    name: "lotomania",
    displayName: "Lotomania",
    minNumbers: 50,
    maxNumbers: 50,
    totalNumbers: 100,
    startNumber: 0,
    basePrice: 3.0,
    color: "#e67200",
  },
  timemania: {
    name: "timemania",
    displayName: "Timemania",
    minNumbers: 10,
    maxNumbers: 10,
    totalNumbers: 80,
    startNumber: 1,
    basePrice: 3.5,
    color: "#038141",
    hasTeam: true,
    teams: [
      "Flamengo",
      "Palmeiras",
      "Corinthians",
      "São Paulo",
      "Santos",
      "Fluminense",
      "Vasco",
      "Botafogo",
      "Grêmio",
      "Internacional",
      "Atlético-MG",
      "Cruzeiro",
      "Bahia",
      "Sport",
      "Fortaleza",
      "Ceará",
      "Athletico-PR",
      "Coritiba",
      "Goiás",
      "Vitória",
      "Náutico",
      "Santa Cruz",
      "Remo",
      "Paysandu",
      "América-MG",
      "Ponte Preta",
      "Guarani",
      "Bragantino",
      "Avaí",
      "Figueirense",
      "Chapecoense",
      "Juventude",
      "Brasil de Pelotas",
      "CSA",
      "CRB",
      "Sampaio Corrêa",
      "ABC",
      "América-RN",
      "Paraná",
      "Londrina",
      "Operário-PR",
      "Vila Nova",
      "Cuiabá",
      "Tombense",
      "Novorizontino",
      "Ituano",
      "Mirassol",
      "Criciúma",
      "Joinville",
      "Metropolitano",
      "Brusque",
      "Marcílio Dias",
      "Hercílio Luz",
      "Tubarão",
      "Concórdia",
      "Passo Fundo",
      "São José-RS",
      "Novo Hamburgo",
      "Aimoré",
      "São Luiz",
      "Pelotas",
      "Esportivo",
      "Glória",
      "Guarany de Bagé",
      "Ypiranga",
      "São Paulo-RS",
      "Inter de Lages",
      "São Caetano",
      "Água Santa",
      "São Bernardo",
      "EC São Bernardo",
      "Santo André",
      "Portuguesa",
      "Juventus",
      "Nacional-SP",
      "Taubaté",
      "União São João",
      "Rio Branco-SP",
      "XV de Piracicaba",
      "Comercial-SP",
    ],
  },
  "dupla sena": {
    name: "dupla sena",
    displayName: "Dupla Sena",
    minNumbers: 6,
    maxNumbers: 15,
    totalNumbers: 50,
    startNumber: 1,
    basePrice: 2.5,
    color: "#a62b43",
  },
  loteca: {
    name: "loteca",
    displayName: "Loteca",
    minNumbers: 14,
    maxNumbers: 14,
    totalNumbers: 14,
    startNumber: 1,
    basePrice: 4.0,
    color: "#eb212c",
    matches: 14,
  },
  "dia de sorte": {
    name: "dia de sorte",
    displayName: "Dia de Sorte",
    minNumbers: 7,
    maxNumbers: 15,
    totalNumbers: 31,
    startNumber: 1,
    basePrice: 2.5,
    color: "#ae9319",
    hasBonus: true,
    bonusName: "Mês da Sorte",
    bonusMin: 1,
    bonusMax: 1,
    bonusTotalNumbers: 12,
    bonusStartNumber: 1,
  },
  "super sete": {
    name: "super sete",
    displayName: "Super Sete",
    minNumbers: 7,
    maxNumbers: 21,
    totalNumbers: 10,
    startNumber: 0,
    basePrice: 2.5,
    color: "#038141",
    columns: 7,
    numbersPerColumn: 10,
  },
}

export const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

// Calcula o preço baseado na quantidade de números selecionados
export function calculatePrice(lotteryName: string, selectedCount: number, bonusCount?: number): number {
  const rule = LOTTERY_RULES[lotteryName.toLowerCase()]
  if (!rule) return 0

  const basePrice = rule.basePrice
  const minNumbers = rule.minNumbers

  // Fórmula de combinação para calcular o preço
  if (selectedCount <= minNumbers) {
    return basePrice
  }

  // Preço aumenta com combinações adicionais
  const combinations = factorial(selectedCount) / (factorial(minNumbers) * factorial(selectedCount - minNumbers))
  return basePrice * combinations
}

function factorial(n: number): number {
  if (n <= 1) return 1
  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }
  return result
}

// Gera números aleatórios (Surpresinha)
export function generateRandomNumbers(lotteryName: string): number[] {
  const rule = LOTTERY_RULES[lotteryName.toLowerCase()]
  if (!rule) return []

  const numbers: number[] = []
  const available = Array.from({ length: rule.totalNumbers }, (_, i) => i + rule.startNumber)

  for (let i = 0; i < rule.minNumbers; i++) {
    const randomIndex = Math.floor(Math.random() * available.length)
    numbers.push(available[randomIndex])
    available.splice(randomIndex, 1)
  }

  return numbers.sort((a, b) => a - b)
}

// Gera trevos/bônus aleatórios
export function generateRandomBonus(lotteryName: string): number[] {
  const rule = LOTTERY_RULES[lotteryName.toLowerCase()]
  if (!rule || !rule.hasBonus) return []

  const bonus: number[] = []
  const available = Array.from({ length: rule.bonusTotalNumbers! }, (_, i) => i + rule.bonusStartNumber!)

  for (let i = 0; i < rule.bonusMin!; i++) {
    const randomIndex = Math.floor(Math.random() * available.length)
    bonus.push(available[randomIndex])
    available.splice(randomIndex, 1)
  }

  return bonus.sort((a, b) => a - b)
}
