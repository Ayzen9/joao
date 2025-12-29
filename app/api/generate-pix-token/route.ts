import { type NextRequest, NextResponse } from "next/server"
import { encryptData } from "@/lib/encryption"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderDetails } = body

    if (!orderDetails || !orderDetails.total || !orderDetails.customerName || !orderDetails.email) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const now = Date.now()

    const tokenData = {
      name: orderDetails.customerName,
      email: orderDetails.email,
      phone: orderDetails.phone || "",
      cpf: orderDetails.cpf || "",
      total: orderDetails.total,
      items: orderDetails.items,
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
      pixGeneratedAt: 0,
      pixQrCode: null,
      pixTransactionId: null,
    }

    const encryptedToken = encryptData(JSON.stringify(tokenData))
    const urlSafeToken = Buffer.from(encryptedToken).toString("base64url")

    return NextResponse.json({
      success: true,
      token: urlSafeToken,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao gerar token" }, { status: 500 })
  }
}
