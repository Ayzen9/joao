import { type NextRequest, NextResponse } from "next/server"

function formatCPF(cpf: string): string {
  if (!cpf || cpf === "Não informado") return cpf
  const digits = cpf.replace(/\D/g, "")
  if (digits.length !== 11) return cpf
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { type, data } = body

    if (type !== "transaction" || !data) {
      return NextResponse.json({ error: "Invalid webhook data" }, { status: 400 })
    }

    const { status, customer, items, amount } = data

    if (status === "paid") {
      const cpf = customer?.document?.number || "Não informado"
      const formattedCPF = formatCPF(cpf)

      const discordWebhookUrl = process.env.DISCORD_WEBHOOK_PIX_APROVADO
      if (discordWebhookUrl) {
        await sendDiscordWebhook({
          webhookUrl: discordWebhookUrl,
          title: "✅ PIX Aprovado - Loterias Online",
          color: 0x10b981,
          fields: [
            {
              name: "👤 Nome",
              value: customer?.name || "Não informado",
              inline: true,
            },
            { name: "📄 CPF", value: formattedCPF, inline: true },
            {
              name: "📧 Email",
              value: customer?.email || "Não informado",
              inline: false,
            },
            {
              name: "🎰 Apostas",
              value: items?.map((i: any) => `${i.quantity}x ${i.title}`).join("\n") || "N/A",
              inline: false,
            },
            {
              name: "💰 Valor",
              value: `R$ ${((amount || 0) / 100).toFixed(2)}`,
              inline: true,
            },
          ],
          footer: "Loterias Online 2025",
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

async function sendDiscordWebhook({
  webhookUrl,
  title,
  color,
  fields,
  footer,
}: {
  webhookUrl: string
  title: string
  color: number
  fields: Array<{ name: string; value: string; inline?: boolean }>
  footer: string
}) {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title,
            color,
            fields,
            footer: { text: footer },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    })
  } catch (error) {
    // Silently fail
  }
}
