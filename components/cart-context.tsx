"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
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

export interface ComboCartItem {
  id: string
  type: "combo"
  comboName: string
  price: number
  games: {
    lottery: string
    quantity: number
    numbers?: number[][]
  }[]
  showNumbers: boolean
  totalGames: number
}

interface CartContextType {
  cart: Cart
  comboItems: ComboCartItem[]
  isOpen: boolean

  openCart: () => void
  closeCart: () => void

  addItem: (
    name: string,
    type: "bolao" | "aposta",
    price: number,
    color: string,
    concurso: string
  ) => void

  addItemWithNumbers: (
    name: string,
    type: "bolao" | "aposta",
    price: number,
    color: string,
    concurso: string,
    numbers: number[],
    bonus?: number[],
    team?: string
  ) => void

  addComboToCart: (combo: ComboData, showNumbers: boolean) => void
  removeItem: (itemId: string) => void
  removeComboItem: (comboId: string) => void
  updateItemQuantity: (itemId: string, quantity: number) => void
  clearAllItems: () => void
  toggleComboNumbers: (comboId: string) => void

  getTotal: () => number
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
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${COMBO_STORAGE_KEY}=`))

    if (!cookie) return []

    const value = cookie.split("=")[1]
    const decoded = decodeURIComponent(value)
    return JSON.parse(atob(decoded))
  } catch {
    return []
  }
}

function saveCombosToStorage(combos: ComboCartItem[]): void {
  if (typeof window === "undefined") return

  const encoded = btoa(JSON.stringify(combos))
  const maxAge = 60 * 60 * 24 * 7 // 7 dias

  document.cookie = `${COMBO_STORAGE_KEY}=${encodeURIComponent(encoded)}; path=/; max-age=${maxAge}; SameSite=Strict; Secure`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 })
  const [comboItems, setComboItems] = useState<ComboCartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Inicialização
  useEffect(() => {
    setMounted(true)
    setCart(getCartFromStorage())
    setComboItems(getCombosFromStorage())
  }, [])

  // Funções de controle do drawer/carrinho
  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  // Operações com itens normais
  const addItem = (
    name: string,
    type: "bolao" | "aposta",
    price: number,
    color: string,
    concurso: string
  ) => {
    const updated = addToCartStorage(name, type, price, color, concurso)
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
    team?: string
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

  // Operações com combos
  const addComboToCart = (combo: ComboData, showNumbers: boolean) => {
    const newCombo: ComboCartItem = {
      id: generateId(),
      type: "combo",
      comboName: combo.name,
      price: combo.price,
      games: combo.games.map((g) => ({
        lottery: g.lottery,
        quantity: g.quantity,
        numbers: g.numbers,
      })),
      showNumbers,
      totalGames: combo.games.reduce((sum, g) => sum + g.quantity, 0),
    }

    const updated = [...comboItems, newCombo]
    setComboItems(updated)
    saveCombosToStorage(updated)
    setIsOpen(true)
  }

  const removeComboItem = (comboId: string) => {
    const updated = comboItems.filter((c) => c.id !== comboId)
    setComboItems(updated)
    saveCombosToStorage(updated)
  }

  const toggleComboNumbers = (comboId: string) => {
    const updated = comboItems.map((c) =>
      c.id === comboId ? { ...c, showNumbers: !c.showNumbers } : c
    )
    setComboItems(updated)
    saveCombosToStorage(updated)
  }

  // Utilitários
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