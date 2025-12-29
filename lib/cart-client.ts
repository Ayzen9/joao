"use client"

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

export interface Cart {
  items: CartItem[]
  total: number
}

const CART_STORAGE_KEY = "loterias_cart"

function generateId(): string {
  const array = new Uint32Array(4)
  crypto.getRandomValues(array)
  return Array.from(array, (n) => n.toString(36)).join("")
}

export function getCartFromStorage(): Cart {
  if (typeof window === "undefined") {
    return { items: [], total: 0 }
  }

  try {
    const stored = document.cookie.split("; ").find((row) => row.startsWith(CART_STORAGE_KEY + "="))

    if (stored) {
      const value = stored.split("=")[1]
      const decoded = decodeURIComponent(value)
      const parsed = JSON.parse(atob(decoded))
      if (parsed && Array.isArray(parsed.items)) {
        return parsed
      }
    }
  } catch {
    clearCart()
  }

  return { items: [], total: 0 }
}

export function saveCartToStorage(cart: Cart): void {
  if (typeof window === "undefined") return

  try {
    const encoded = btoa(JSON.stringify(cart))
    const maxAge = 60 * 60 * 24 * 7
    document.cookie = `${CART_STORAGE_KEY}=${encodeURIComponent(encoded)}; path=/; max-age=${maxAge}; SameSite=Lax`
  } catch {}
}

function getLatestCart(): Cart {
  return getCartFromStorage()
}

export function addToCart(
  lottery: string,
  type: "bolao" | "aposta",
  price: number,
  color: string,
  concurso: string,
  hiddenNumbers?: { hidden: true; quantity: number }
): Cart {
  const cart = getLatestCart()

  cart.items.push({
    id: generateId(),
    lottery,
    type,
    price,
    color,
    concurso,
    quantity: 1,
    numbers: hiddenNumbers,
  })

  cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  saveCartToStorage(cart)

  return cart
}

export function addToCartWithNumbers(
  lottery: string,
  type: "bolao" | "aposta",
  price: number,
  color: string,
  concurso: string,
  numbers: number[],
  bonus?: number[],
  team?: string,
): Cart {
  const cart = getLatestCart()

  cart.items.push({
    id: generateId(),
    lottery,
    type,
    price,
    color,
    concurso,
    quantity: 1,
    numbers,
    bonus,
    team,
  })

  cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  saveCartToStorage(cart)

  return cart
}

export function removeFromCart(itemId: string): Cart {
  const cart = getLatestCart()
  cart.items = cart.items.filter((item) => item.id !== itemId)
  cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  saveCartToStorage(cart)
  return cart
}

export function updateQuantity(itemId: string, quantity: number): Cart {
  const cart = getLatestCart()
  const item = cart.items.find((item) => item.id === itemId)

  if (item) {
    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.id !== itemId)
    } else {
      item.quantity = quantity
    }
  }

  cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  saveCartToStorage(cart)
  return cart
}

export function clearCart(): Cart {
  const emptyCart = { items: [], total: 0 }
  saveCartToStorage(emptyCart)
  return emptyCart
}