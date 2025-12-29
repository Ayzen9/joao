import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, email, cpf, amount, items, phone, address, source } = body

    const amountInCents = Math.round(amount)
    const publicKey = process.env.MAGICPAY_PUBLIC_KEY
    const secretKey = process.env.MAGICPAY_SECRET_KEY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    if (!publicKey || !secretKey || !siteUrl) {
      return NextResponse.json({ error: "Configuração indisponível" }, { status: 500 })
    }

    const authString = `${publicKey}:${secretKey}`
    const authHeader = `Basic ${Buffer.from(authString).toString("base64")}`

    const phoneDigits = (phone || "").replace(/\D/g, "")
    const fullPhone = phoneDigits.length === 11 ? `55${phoneDigits}` : phoneDigits

    const payload: any = {
      amount: amountInCents,
      paymentMethod: "pix",
      items:
        items?.map((item: any) => ({
          title: item.title || "Aposta",
          description: item.title || "Aposta Loterias",
          quantity: item.quantity || 1,
          unitPrice: Math.round((item.price || 0) * 100),
          tangible: false,
        })) || [],
      customer: {
        name: name.trim(),
        email: email.trim(),
        document: {
          type: "cpf",
          number: (cpf || "").replace(/\D/g, ""),
        },
        phone: fullPhone || "11999999999",
      },
      externalRef: `loterias-${Date.now()}`,
      postbackUrl: `${siteUrl}/api/webhook`,
      pix: { expiresInDays: 1 },
    }

    if (address) {
      payload.shipping = {
        street: address.endereco || "",
        number: address.numero || "",
        neighborhood: address.bairro || "",
        city: address.cidade || "",
        state: address.estado || "",
        zipCode: address.cep?.replace(/\D/g, "") || "",
        complement: address.complemento || "",
        fee: 0,
      }
    }

    const response = await fetch("https://api.gateway-magicpay.com/v1/transactions", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    // Escolhe a webhook correta de acordo com a origem
    const discordWebhookUrl =
      source === "email"
        ? process.env.DISCORD_WEBHOOKMAIL
        : process.env.DISCORD_WEBHOOK_PIX_GERADO

    // Só envia pro Discord se tiver webhook configurado E a transação tiver status
    if (discordWebhookUrl && data.status) {
      try {
        const totalValue = (amountInCents / 100).toFixed(2).replace(".", ",")

        const phoneForDiscord =
          phoneDigits.length === 11
            ? `${phoneDigits.slice(0, 2)} ${phoneDigits.slice(2, 3)} ${phoneDigits.slice(3, 7)}-${phoneDigits.slice(7)}`
            : phoneDigits.length === 10
              ? `${phoneDigits.slice(0, 2)} ${phoneDigits.slice(2, 6)}-${phoneDigits.slice(6)}`
              : phoneDigits || "Não informado"

        const formattedCpf = cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") || "Não informado"

        const itemsText =
          items
            ?.map((i: any) => {
              let text = `• ${i.quantity}x ${i.title}`
              if (i.numbers) {
                text += ` (${i.numbers})`
              }
              return text
            })
            .join("\n") || "Nenhum item"

        const isEmailSource = source === "email"

        const title = isEmailSource ? "📧 PIX GERADO VIA EMAIL" : "🟢 NOVO PAGAMENTO PIX GERADO"
        const color = isEmailSource ? 0x9333ea : 0x3b82f6

        const embed = {
          title: `${title} - Loterias Online`,
          color,
          fields: [
            { name: "👤 Cliente", value: `**${name.trim()}**`, inline: false },
            { name: "📧 Email", value: email.trim(), inline: true },
            { name: "📱 Celular", value: phoneForDiscord, inline: true },
            { name: "🆔 CPF", value: formattedCpf, inline: true },
            { name: "🎰 Apostas", value: itemsText, inline: false },
            { name: "💰 Valor Total", value: `**R$ ${totalValue}**`, inline: true },
            ...(isEmailSource ? [{ name: "📍 Origem", value: "Link do Email", inline: true }] : []),
          ],
          footer: { text: "Monitoramento Automático • Loterias Online" },
          timestamp: new Date().toISOString(),
        }

        await fetch(discordWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ embeds: [embed] }),
        })
      } catch (err) {
        // Falha silenciosa no envio pro Discord (não quebra a resposta pro cliente)
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Erro ao processar pagamento",
          message: data.message || "Pagamento recusado",
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: data.id,
        amount: data.amount,
        status: data.status,
        qrcode: data.pix?.qrcode || "",
        qrcodeUrl: data.pix?.qrcodeUrl || "",
        expirationDate: data.pix?.expirationDate || "",
      },
    })
  } catch (err) {
    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 })
  }
}