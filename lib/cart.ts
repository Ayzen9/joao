import { cookies } from "next/headers"

export interface CartItem {
  id: string
  name: string
  type: "bolao" | "aposta"
  price: number
  color: string
  concurso: string
  quantity: number
}

export interface Cart {
  items: CartItem[]
  total: number
}

const CART_COOKIE_NAME = "loterias_cart"
const CART_SECRET = process.env.CART_SECRET

function encodeCart(cart: Cart): string {
  const data = JSON.stringify(cart)
  return Buffer.from(data).toString("base64")
}

function decodeCart(encoded: string): Cart {
  try {
    const data = Buffer.from(encoded, "base64").toString("utf-8")
    return JSON.parse(data)
  } catch {
    return { items: [], total: 0 }
  }
}

export async function getCart(): Promise<Cart> {
  const cookieStore = await cookies()
  const cartCookie = cookieStore.get(CART_COOKIE_NAME)

  if (!cartCookie) {
    return { items: [], total: 0 }
  }

  return decodeCart(cartCookie.value)
}

export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}
