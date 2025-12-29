"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import {
  type Cart,
  getCartFromStorage,
  addToCart as addToCartStorage,
  addToCartWithNumbers as addToCartWithNumbersStorage,
  removeFromCart as removeFromCartStorage,
  updateQuantity as updateQuantityStorage,
  clearCart as clearCartStorage,
} from "@/lib/cart-client"
import type { ComboData } from "@/lib/combos-data"

export interface CartItem {
  id: string
  lottery: string
  type: "bolao" | "aposta"
  price: number
  color: string
  concurso: string
  quantity: number
  numbers?: number[] | { hidden: true; quantity: number }
  bonus?: number[]
  team?: string
}

export interface ComboCartItem {
  id: string
  type: "combo"
  comboName: string
  price: number
  games: {
    lottery: string
    quantity: number
    numbers?: number[][]
    color: string
    concurso: string
  }[]
  showNumbers: boolean
  totalGames: number
}

interface CartContextType {
  cart: { items: CartItem[] }
  comboItems: ComboCartItem[]
  isOpen: boolean

  openCart: () => void
  closeCart: () => void

  addItem: (
    name: string,
    type: "bolao" | "aposta",
    price: number,
    color: string,
    concurso: string,
    hiddenNumbers?: { hidden: true; quantity: number }
  ) => void

  addItemWithNumbers: (
    name: string,
    type: "bolao" | "aposta",
    price: number,
    color: string,
    concurso: string,
    numbers: number[],
    bonus?: number[],
    team?: string,
  ) => void

  addComboToCart: (combo: ComboData, showNumbers: boolean) => void
  removeItem: (itemId: string) => void
  removeComboItem: (comboId: string) => void
  updateItemQuantity: (itemId: string, quantity: number) => void
  clearAllItems: () => void
  toggleComboNumbers: (comboId: string) => void

  getTotal: () => number
  refreshCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

const COMBO_STORAGE_KEY = "loterias_combo_cart"

function generateId(): string {
  const array = new Uint32Array(4)
  crypto.getRandomValues(array)
  return Array.from(array, (n) => n.toString(36)).join("")
}

function getCombosFromStorage(): ComboCartItem[] {
  if (typeof window === "undefined") return []

  try {
    const cookie = document.cookie.split("; ").find((row) => row.startsWith(`${COMBO_STORAGE_KEY}=`))
    if (!cookie) return []

    const value = cookie.split("=")[1]
    const decoded = decodeURIComponent(value)
    const parsed = JSON.parse(atob(decoded))
    if (Array.isArray(parsed)) {
      return parsed
    }
  } catch {
    saveCombosToStorage([])
  }

  return []
}

function saveCombosToStorage(combos: ComboCartItem[]): void {
  if (typeof window === "undefined") return

  try {
    const encoded = btoa(JSON.stringify(combos))
    const maxAge = 60 * 60 * 24 * 7

    document.cookie = `${COMBO_STORAGE_KEY}=${encodeURIComponent(encoded)}; path=/; max-age=${maxAge}; SameSite=Lax`
  } catch {}
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<{ items: CartItem[] }>({ items: [] })
  const [comboItems, setComboItems] = useState<ComboCartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const refreshCart = useCallback(() => {
    const latestCart = getCartFromStorage()
    const latestCombos = getCombosFromStorage()
    setCart(latestCart)
    setComboItems(latestCombos)
  }, [])

  useEffect(() => {
    setMounted(true)
    refreshCart()
  }, [refreshCart])

  useEffect(() => {
    const handleFocus = () => refreshCart()
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [refreshCart])

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  const addItem = (
    name: string,
    type: "bolao" | "aposta",
    price: number,
    color: string,
    concurso: string,
    hiddenNumbers?: { hidden: true; quantity: number }
  ) => {
    const updated = addToCartStorage(name, type, price, color, concurso, hiddenNumbers)
    setCart(updated)
    setIsOpen(true)
  }

  const addItemWithNumbers = (
    name: string,
    type: "bolao" | "aposta",
    price: number,
    color: string,
    concurso: string,
    numbers: number[],
    bonus?: number[],
    team?: string,
  ) => {
    const updated = addToCartWithNumbersStorage(name, type, price, color, concurso, numbers, bonus, team)
    setCart(updated)
    setIsOpen(true)
  }

  const removeItem = (itemId: string) => {
    setCart(removeFromCartStorage(itemId))
  }

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setCart(updateQuantityStorage(itemId, quantity))
  }

  const addComboToCart = (combo: ComboData, showNumbers: boolean) => {
    const currentCombos = getCombosFromStorage()

    const newCombo: ComboCartItem = {
      id: generateId(),
      type: "combo",
      comboName: combo.name,
      price: combo.price,
      games: combo.games.map((g) => ({
        lottery: g.lottery,
        quantity: g.quantity,
        numbers: g.numbers,
        color: g.color,
        concurso: g.concurso,
      })),
      showNumbers,
      totalGames: combo.games.reduce((sum, g) => sum + g.quantity, 0),
    }

    const updated = [...currentCombos, newCombo]
    setComboItems(updated)
    saveCombosToStorage(updated)
    setIsOpen(true)
  }

  const removeComboItem = (comboId: string) => {
    const currentCombos = getCombosFromStorage()
    const updated = currentCombos.filter((c) => c.id !== comboId)
    setComboItems(updated)
    saveCombosToStorage(updated)
  }

  const toggleComboNumbers = (comboId: string) => {
    const currentCombos = getCombosFromStorage()
    const updated = currentCombos.map((c) => (c.id === comboId ? { ...c, showNumbers: !c.showNumbers } : c))
    setComboItems(updated)
    saveCombosToStorage(updated)
  }

  const clearAllItems = () => {
    setCart(clearCartStorage())
    setComboItems([])
    saveCombosToStorage([])
  }

  const getTotal = () =>
    cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0) +
    comboItems.reduce((sum, combo) => sum + combo.price, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        comboItems,
        isOpen,
        openCart,
        closeCart,
        addItem,
        addItemWithNumbers,
        addComboToCart,
        removeItem,
        removeComboItem,
        updateItemQuantity,
        clearAllItems,
        toggleComboNumbers,
        getTotal,
        refreshCart,
      }}
    >
      {mounted ? children : children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider")
  }
  return context
}