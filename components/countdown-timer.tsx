"use client"

import { useState, useEffect } from "react"
import { calculateTimeRemaining } from "@/lib/lottery-utils"

interface CountdownTimerProps {
  drawDate: Date
}

export function CountdownTimer({ drawDate }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(drawDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(drawDate))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [drawDate])

  return <>{timeRemaining}</>
}
