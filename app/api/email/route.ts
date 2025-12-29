import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { encryptData } from "@/lib/encryption"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, orderDetails } = body

    if (!to || !subject || !orderDetails) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const tokenData = {
      name: orderDetails.customerName,
      email: to,
      phone: orderDetails.phone || "",
      cpf: orderDetails.cpf || "",
      total: orderDetails.total,
      items: orderDetails.items,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    }

    const encryptedToken = encryptData(JSON.stringify(tokenData))
    const urlSafeToken = Buffer.from(encryptedToken).toString("base64url")

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!siteUrl) {
      return NextResponse.json({ error: "Configuração do site ausente" }, { status: 500 })
    }
    const paymentLink = `${siteUrl}/pix-email/${urlSafeToken}`

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmação de Pedido</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f7f7f7;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #0066b3; padding: 32px 40px; text-align: center;">
                      <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #ffffff; letter-spacing: -0.5px;">Loterias Online</h1>
                    </td>
                  </tr>
                  
                  <!-- Status Badge -->
                  <tr>
                    <td style="padding: 24px 40px 0 40px; text-align: center;">
                      <span style="display: inline-block; background-color: #fff8e6; color: #b38600; font-size: 12px; font-weight: 600; padding: 6px 16px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Aguardando Pagamento</span>
                    </td>
                  </tr>
                  
                  <!-- Greeting -->
                  <tr>
                    <td style="padding: 24px 40px 16px 40px;">
                      <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">Olá, ${orderDetails.customerName}!</h2>
                      <p style="margin: 0; font-size: 15px; color: #666666;">Suas apostas foram registradas com sucesso. Para concluir a compra, realize o pagamento via PIX clicando no botão abaixo.</p>
                    </td>
                  </tr>
                  
                  <!-- Order Value Box -->
                  <tr>
                    <td style="padding: 8px 40px 24px 40px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0f7ff; border-radius: 8px; border: 1px solid #cce5ff;">
                        <tr>
                          <td style="padding: 24px; text-align: center;">
                            <p style="margin: 0 0 4px 0; font-size: 13px; color: #0066b3; text-transform: uppercase; letter-spacing: 0.5px;">Valor Total</p>
                            <p style="margin: 0; font-size: 32px; font-weight: 700; color: #0066b3;">R$ ${orderDetails.total.toFixed(2).replace(".", ",")}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- CTA Button -->
                  <tr>
                    <td style="padding: 0 40px 32px 40px; text-align: center;">
                      <a href="${paymentLink}" style="display: inline-block; background-color: #0066b3; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 48px; border-radius: 8px;">Pagar com PIX</a>
                      <p style="margin: 16px 0 0 0; font-size: 13px; color: #999999;">O QR Code será gerado automaticamente</p>
                    </td>
                  </tr>
                  
                  <!-- Divider -->
                  <tr>
                    <td style="padding: 0 40px;">
                      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 0;">
                    </td>
                  </tr>
                  
                  <!-- Order Items -->
                  <tr>
                    <td style="padding: 24px 40px;">
                      <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">Suas Apostas</h3>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        ${orderDetails.items
                          .map(
                            (item: any) => `
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                              <span style="font-size: 14px; color: #333333;">${item.quantity}x ${item.title}</span>
                            </td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
                              <span style="font-size: 14px; font-weight: 600; color: #333333;">R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
                            </td>
                          </tr>
                        `,
                          )
                          .join("")}
                        <tr>
                          <td style="padding: 16px 0 0 0;">
                            <span style="font-size: 14px; font-weight: 600; color: #1a1a1a;">Total</span>
                          </td>
                          <td style="padding: 16px 0 0 0; text-align: right;">
                            <span style="font-size: 16px; font-weight: 700; color: #0066b3;">R$ ${orderDetails.total.toFixed(2).replace(".", ",")}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Info Box -->
                  <tr>
                    <td style="padding: 0 40px 24px 40px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0f7ff; border-radius: 8px;">
                        <tr>
                          <td style="padding: 16px 20px;">
                            <p style="margin: 0; font-size: 13px; color: #0066b3; line-height: 1.6;">
                              <strong>Importante:</strong> Após a confirmação do pagamento, suas apostas serão processadas automaticamente. Boa sorte!
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Second CTA -->
                  <tr>
                    <td style="padding: 0 40px 32px 40px; text-align: center;">
                      <a href="${paymentLink}" style="display: inline-block; background-color: #1f2a47; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 40px; border-radius: 8px;">Finalizar Pagamento</a>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9f9f9; padding: 24px 40px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0 0 8px 0; font-size: 13px; color: #888888;">Loterias Online Brasil</p>
                      <p style="margin: 0; font-size: 12px; color: #aaaaaa;">Este é um email automático. Por favor, não responda.</p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: "Loterias Online <no-reply@importsparaguai.shop>",
      to: [to],
      subject: subject,
      html: emailHtml,
    })

    if (error) {
      return NextResponse.json({ error: "Erro ao enviar email", details: error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Email enviado com sucesso",
      emailId: data?.id,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno ao processar solicitação" }, { status: 500 })
  }
}
