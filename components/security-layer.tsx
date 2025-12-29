"use client"

import type React from "react"
import { useEffect, useRef } from "react"

export function SecurityLayer({ children }: { children: React.ReactNode }) {
  const isMobileRef = useRef(false)
  const lastInnerHeight = useRef(0)

  useEffect(() => {
    const checkMobile = () => {
      isMobileRef.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      lastInnerHeight.current = window.innerHeight
    }
    checkMobile()

    const disableSelect = (e: Event) => {
      e.preventDefault()
      return false
    }

    const disableContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    const disableKeyboardShortcuts = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault()
        return false
      }
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault()
        return false
      }
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault()
        return false
      }
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault()
        return false
      }
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault()
        return false
      }
      if (e.key === "F12") {
        e.preventDefault()
        return false
      }
      return true
    }

    const disableDrag = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    document.addEventListener("selectstart", disableSelect)
    document.addEventListener("contextmenu", disableContextMenu)
    document.addEventListener("keydown", disableKeyboardShortcuts)
    document.addEventListener("dragstart", disableDrag)

    const detectDevTools = () => {
      // Não detecta em mobile para evitar falso positivo com teclado virtual
      if (isMobileRef.current) return

      // Verifica se a diferença entre outer e inner é muito grande (DevTools aberto)
      const threshold = 250
      const widthDiff = window.outerWidth - window.innerWidth
      const heightDiff = window.outerHeight - window.innerHeight

      // Ignora se a altura mudou muito pouco (pode ser zoom ou teclado)
      const heightChanged = Math.abs(window.innerHeight - lastInnerHeight.current)
      lastInnerHeight.current = window.innerHeight

      if (heightChanged > 100 && heightChanged < 400) {
        // Provavelmente teclado virtual ou zoom, ignorar
        return
      }

      if (widthDiff > threshold || heightDiff > threshold) {
        console.clear()
      }
    }

    const devToolsInterval = setInterval(detectDevTools, 3000)

    const clearConsoleInterval = setInterval(() => {
      console.clear()
    }, 15000)

    return () => {
      document.removeEventListener("selectstart", disableSelect)
      document.removeEventListener("contextmenu", disableContextMenu)
      document.removeEventListener("keydown", disableKeyboardShortcuts)
      document.removeEventListener("dragstart", disableDrag)
      clearInterval(devToolsInterval)
      clearInterval(clearConsoleInterval)
    }
  }, [])

  return <>{children}</>
}
