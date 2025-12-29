"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Copy, Check, QrCode, Clock, ShieldCheck, Smartphone } from "lucide-react"
import { HeaderSimple } from "@/components/header-simple"
import { Footer } from "@/components/footer"
import { SecurityLayer } from "@/components/security-layer"

interface PixData {
  qrcode: string
  qrcodeUrl: string
  transactionId: string
  total: number
  items: Array<{ title: string; quantity: number; price: number; numbers?: string }>
  customerName: string
  email: string
}

const PIX_SESSION_COOKIE = "loterias_pix_session"

function getPixSession(): PixData | null {
  if (typeof window === "undefined") return null
  try {
    const stored = document.cookie.split("; ").find((row) => row.startsWith(PIX_SESSION_COOKIE + "="))
    if (stored) {
      const value = stored.split("=")[1]
      const decoded = decodeURIComponent(value)
      const parsed = JSON.parse(atob(decoded))
      return parsed
    }
  } catch (err) {
    console.error("Erro ao ler cookie PIX:", err)
  }
  return null
}

export function PixContent() {
  const router = useRouter()
  const [pixData, setPixData] = useState<PixData | null>(null)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30 * 60)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      const sessionData = getPixSession()

      if (!sessionData || !sessionData.qrcode || !sessionData.transactionId) {
        router.push("/carrinho")
        return
      }

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        sessionData.qrcode
      )}`

      setPixData({
        ...sessionData,
        qrcodeUrl: qrUrl
      })

      setLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  useEffect(() => {
    if (!pixData) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [pixData])

  const copyToClipboard = async () => {
    if (pixData?.qrcode) {
      await navigator.clipboard.writeText(pixData.qrcode)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (loading || !pixData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0066b3] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <SecurityLayer>
      <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
        <HeaderSimple />

        <main className="flex-1 py-8 md:py-12">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">

                  <div className="bg-[#0066b3] text-white p-6 md:p-8 text-center">
                    <QrCode className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4" />
                    <h1
                      className="text-[28px] md:text-[36px] font-bold mb-2"
                      style={{ fontFamily: "caixaStdBold, sans-serif" }}
                    >
                      Pagamento PIX
                    </h1>
                    <p
                      className="text-[16px] md:text-[18px] opacity-90"
                      style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                    >
                      Escaneie o QR Code ou copie o código
                    </p>
                  </div>

                  <div className="bg-[#fff8e6] border-b border-[#f0e6c8] px-6 py-4 flex items-center justify-center gap-3">
                    <Clock className="w-5 h-5 text-[#b38600]" />
                    <span
                      className="text-[16px] text-[#b38600] font-bold"
                      style={{ fontFamily: "caixaStdBold, sans-serif" }}
                    >
                      Expira em: {formatTime(timeLeft)}
                    </span>
                  </div>

                  <div className="p-6 md:p-10">
                    <div className="flex flex-col items-center">

                      <div className="bg-white p-4 md:p-6 rounded-xl border-2 border-[#dee2e6] shadow-inner mb-6">
                        {pixData.qrcodeUrl ? (
                          <img
                            src={pixData.qrcodeUrl}
                            alt="QR Code PIX"
                            className="w-[200px] h-[200px] md:w-[280px] md:h-[280px]"
                          />
                        ) : (
                          <div className="w-[200px] h-[200px] md:w-[280px] md:h-[280px] bg-gray-100 flex items-center justify-center">
                            <QrCode className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="text-center mb-6">
                        <p
                          className="text-[16px] text-[#4c556c] mb-1"
                          style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                        >
                          Valor a pagar
                        </p>
                        <p
                          className="text-[42px] md:text-[52px] font-bold text-[#0066b3]"
                          style={{ fontFamily: "caixaStdBold, sans-serif" }}
                        >
                          R$ {pixData.total.toFixed(2).replace(".", ",")}
                        </p>
                      </div>

                      <button
                        onClick={copyToClipboard}
                        className="w-full max-w-[400px] bg-[#0066b3] text-white py-4 rounded-lg text-[18px] font-bold flex items-center justify-center gap-3 hover:bg-[#0055a0] transition-colors cursor-pointer"
                        style={{ fontFamily: "caixaStdBold, sans-serif" }}
                      >
                        {copied ? (
                          <>
                            <Check className="w-6 h-6" />
                            Código Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-6 h-6" />
                            Copiar Código PIX
                          </>
                        )}
                      </button>

                      <div className="mt-6 w-full max-w-[400px]">
                        <p
                          className="text-[14px] text-[#4c556c] mb-2 text-center"
                          style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                        >
                          Código PIX Copia e Cola
                        </p>
                        <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded-lg p-3 break-all text-[12px] text-[#4c556c] max-h-[80px] overflow-y-auto">
                          {pixData.qrcode}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#f8f9fa] border-t border-[#dee2e6] p-6 md:p-8">
                    <h3
                      className="text-[20px] text-[#1f2a47] mb-4 font-bold"
                      style={{ fontFamily: "caixaStdBold, sans-serif" }}
                    >
                      Como pagar com PIX
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#0066b3] text-white flex items-center justify-center flex-shrink-0 text-[14px] font-bold">
                          1
                        </div>
                        <p className="text-[16px] text-[#4c556c]" style={{ fontFamily: "caixaStdRegular, sans-serif" }}>
                          Abra o aplicativo do seu banco ou carteira digital
                        </p>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#0066b3] text-white flex items-center justify-center flex-shrink-0 text-[14px] font-bold">
                          2
                        </div>
                        <p className="text-[16px] text-[#4c556c]" style={{ fontFamily: "caixaStdRegular, sans-serif" }}>
                          Escolha pagar com PIX usando QR Code ou código copia e cola
                        </p>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#0066b3] text-white flex items-center justify-center flex-shrink-0 text-[14px] font-bold">
                          3
                        </div>
                        <p className="text-[16px] text-[#4c556c]" style={{ fontFamily: "caixaStdRegular, sans-serif" }}>
                          Escaneie o QR Code acima ou cole o código copiado
                        </p>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center flex-shrink-0 text-[14px] font-bold">
                          4
                        </div>
                        <p className="text-[16px] text-[#4c556c]" style={{ fontFamily: "caixaStdRegular, sans-serif" }}>
                          Confirme o pagamento e pronto! Suas apostas serão processadas automaticamente
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6">
                  <div className="bg-[#1f2a47] text-white p-5">
                    <h2 className="text-[20px] font-bold" style={{ fontFamily: "caixaStdBold, sans-serif" }}>
                      Resumo do Pedido
                    </h2>
                  </div>

                  <div className="p-5">
                    {pixData.customerName && (
                      <div className="mb-5 pb-5 border-b border-[#dee2e6]">
                        <p
                          className="text-[14px] text-[#4c556c] mb-1"
                          style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                        >
                          Cliente
                        </p>
                        <p
                          className="text-[16px] text-[#1f2a47] font-bold"
                          style={{ fontFamily: "caixaStdBold, sans-serif" }}
                        >
                          {pixData.customerName}
                        </p>
                        {pixData.email && (
                          <p
                            className="text-[14px] text-[#4c556c]"
                            style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                          >
                            {pixData.email}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mb-5 pb-5 border-b border-[#dee2e6]">
                      <p
                        className="text-[14px] text-[#4c556c] mb-3"
                        style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                      >
                        Suas Apostas
                      </p>
                      <div className="space-y-3">
                        {pixData.items.map((item, index) => (
                          <div key={index} className="flex flex-col">
                            <div className="flex justify-between items-center">
                              <span
                                className="text-[14px] text-[#1f2a47]"
                                style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                              >
                                {item.quantity}x {item.title}
                              </span>
                              <span
                                className="text-[14px] text-[#0066b3] font-bold"
                                style={{ fontFamily: "caixaStdBold, sans-serif" }}
                              >
                                R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                              </span>
                            </div>
                            {item.numbers && (
                              <span className="text-[12px] text-[#6b7280] mt-1">Números: {item.numbers}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                      <span
                        className="text-[18px] text-[#1f2a47] font-bold"
                        style={{ fontFamily: "caixaStdBold, sans-serif" }}
                      >
                        Total
                      </span>
                      <span
                        className="text-[24px] text-[#0066b3] font-bold"
                        style={{ fontFamily: "caixaStdBold, sans-serif" }}
                      >
                        R$ {pixData.total.toFixed(2).replace(".", ",")}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-[#10b981]">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-[14px]" style={{ fontFamily: "caixaStdRegular, sans-serif" }}>
                          Pagamento 100% seguro
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[#0066b3]">
                        <Smartphone className="w-5 h-5" />
                        <span className="text-[14px]" style={{ fontFamily: "caixaStdRegular, sans-serif" }}>
                          Confirmação instantânea
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#f8f9fa] border-t border-[#dee2e6] p-4">
                    <p
                      className="text-[12px] text-[#4c556c] text-center"
                      style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                    >
                      ID da transação: {pixData.transactionId}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </SecurityLayer>
  )
}