// Utility functions for lottery countdown calculations

export interface LotteryDrawDate {
  name: string
  drawDate: Date
  color: string
}

export const LOTTERY_DRAW_DATES: Record<string, { date: Date; color: string }> = {
  "mega da virada": { date: new Date("2025-12-31T22:00:00"), color: "#00a651" },
  lotofácil: { date: new Date("2025-12-29T21:00:00"), color: "#91278f" },
  quina: { date: new Date("2025-12-29T21:00:00"), color: "#2e3192" },
  "+milionária": { date: new Date("2025-12-31T17:00:00"), color: "#2a3580" },
  lotomania: { date: new Date("2025-12-29T21:00:00"), color: "#e67200" },
  timemania: { date: new Date("2025-12-30T21:00:00"), color: "#038141" },
  "dupla sena": { date: new Date("2025-12-29T21:00:00"), color: "#a62b43" },
  loteca: { date: new Date("2026-01-10T15:00:00"), color: "#eb212c" },
  "dia de sorte": { date: new Date("2025-12-30T21:00:00"), color: "#ae9319" },
  "super sete": { date: new Date("2025-12-29T21:00:00"), color: "#038141" },
}

export function calculateTimeRemaining(drawDate: Date): string {
  const now = new Date()
  const diff = drawDate.getTime() - now.getTime()

  if (diff <= 0) {
    return "Encerrado"
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  // If more than 1 day, show only days
  if (days >= 2) {
    return `${days} dias`
  }

  if (days === 1) {
    return "1 dia"
  }

  // Less than 1 day, show hours and minutes
  return `${hours} horas e ${minutes} minutos`
}

export function getTimeRemainingForLottery(lotteryName: string): string {
  const normalizedName = lotteryName.toLowerCase()
  const lottery = LOTTERY_DRAW_DATES[normalizedName]

  if (!lottery) {
    return "Indisponível"
  }

  return calculateTimeRemaining(lottery.date)
}
