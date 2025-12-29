import { type NextRequest, NextResponse } from "next/server"
import { decryptData, encryptData } from "@/lib/encryption"

const PIX_REGENERATION_INTERVAL = 15 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, pixData } = body

    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 400 })
    }

    const encryptedData = Buffer.from(token, "base64url").toString()
    const decryptedData = decryptData(encryptedData)
    const orderData = JSON.parse(decryptedData)

    if (orderData.expiresAt && Date.now() > orderData.expiresAt) {
      return NextResponse.json({ error: "Link expirado" }, { status: 400 })
    }

    if (pixData) {
      orderData.pixGeneratedAt = Date.now()
      orderData.pixQrCode = pixData.qrcode
      orderData.pixTransactionId = pixData.transactionId

      const updatedEncrypted = encryptData(JSON.stringify(orderData))
      const updatedToken = Buffer.from(updatedEncrypted).toString("base64url")

      return NextResponse.json({
        success: true,
        orderData,
        updatedToken,
      })
    }

    const now = Date.now()
    const timeSinceLastPix = now - (orderData.pixGeneratedAt || 0)
    const shouldRegeneratePix = timeSinceLastPix > PIX_REGENERATION_INTERVAL || !orderData.pixQrCode

    return NextResponse.json({
      success: true,
      orderData,
      shouldRegeneratePix,
      existingPixData: !shouldRegeneratePix
        ? {
            qrcode: orderData.pixQrCode,
            transactionId: orderData.pixTransactionId,
            timeRemaining: PIX_REGENERATION_INTERVAL - timeSinceLastPix,
          }
        : null,
    })
  } catch (error) {
    return NextResponse.json({ error: "Token inválido" }, { status: 400 })
  }
}
