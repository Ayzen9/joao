"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Copy, Check, QrCode, Clock, ShieldCheck, Smartphone, Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SecurityLayer } from "@/components/security-layer"

interface OrderData {
  name: string
  email: string
  phone: string
  cpf: string
  total: number
  items: Array<{ title: string; quantity: number; price: number }>
}

export default function PixEmailPage() {
  const params = useParams()
  const router = useRouter()
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [qrcode, setQrcode] = useState("")
  const [qrcodeUrl, setQrcodeUrl] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30 * 60)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const validateAndGeneratePix = async () => {
      const token = params.token as string
      if (!token) {
        setError("Token inválido")
        setIsLoading(false)
        return
      }

      try {
        // Validate token
        const validateResponse = await fetch("/api/validate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        const validateData = await validateResponse.json()

        if (!validateData.success) {
          setError(validateData.error || "Link inválido ou expirado")
          setIsLoading(false)
          return
        }

        setOrderData(validateData.orderData)

        // Check if we should use existing PIX or generate new
        if (!validateData.shouldRegeneratePix && validateData.existingPixData) {
          setQrcode(validateData.existingPixData.qrcode)
          setTimeLeft(Math.floor(validateData.existingPixData.timeRemaining / 1000))
          setIsLoading(false)
          return
        }

        // Generate new PIX
        const paymentResponse = await fetch("/api/pagamento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: validateData.orderData.name,
            email: validateData.orderData.email,
            phone: validateData.orderData.phone,
            cpf: validateData.orderData.cpf,
            amount: validateData.orderData.total * 100,
            items: validateData.orderData.items,
            source: "email",
          }),
        })

        const paymentData = await paymentResponse.json()

        if (!paymentData.success) {
          setError(paymentData.error || "Erro ao gerar PIX")
          setIsLoading(false)
          return
        }

        setQrcode(paymentData.transaction.qrcode)
        setQrcodeUrl(paymentData.transaction.qrcodeUrl)
        setTransactionId(paymentData.transaction.id)

        // Update token with new PIX data
        await fetch("/api/validate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            pixData: {
              qrcode: paymentData.transaction.qrcode,
              transactionId: paymentData.transaction.id,
            },
          }),
        })

        setIsLoading(false)
      } catch (err) {
        setError("Erro ao processar solicitação")
        setIsLoading(false)
      }
    }

    validateAndGeneratePix()
  }, [params.token])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const copyToClipboard = async () => {
    if (qrcode) {
      await navigator.clipboard.writeText(qrcode)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <SecurityLayer>
        <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-[#0066b3] mx-auto mb-4" />
              <p className="text-[18px] text-[#4c556c]" style={{ fontFamily: "caixaStdRegular, sans-serif" }}>
                Gerando seu QR Code PIX...
              </p>
            </div>
          </main>
          <Footer />
        </div>
      </SecurityLayer>
    )
  }

  if (error) {
    return (
      <SecurityLayer>
        <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
          <Header />
          <main className="flex-1 flex items-center justify-center px-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-[32px]">❌</span>
              </div>
              <h2
                className="text-[24px] text-[#1f2a47] font-bold mb-2"
                style={{ fontFamily: "caixaStdBold, sans-serif" }}
              >
                Ops!
              </h2>
              <p className="text-[16px] text-[#4c556c] mb-6" style={{ fontFamily: "caixaStdRegular, sans-serif" }}>
                {error}
              </p>
              <button
                onClick={() => router.push("/")}
                className="bg-[#0066b3] text-white px-8 py-3 rounded-lg text-[16px] font-bold hover:bg-[#0055a0] transition-colors cursor-pointer"
                style={{ fontFamily: "caixaStdBold, sans-serif" }}
              >
                Voltar ao início
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </SecurityLayer>
    )
  }

  return (
    <SecurityLayer>
      <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
        <Header />

        <main className="flex-1 py-8 md:py-12">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Left/Center - QR Code */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Header */}
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

                  {/* Timer */}
                  <div className="bg-[#fff8e6] border-b border-[#f0e6c8] px-6 py-4 flex items-center justify-center gap-3">
                    <Clock className="w-5 h-5 text-[#b38600]" />
                    <span
                      className="text-[16px] text-[#b38600] font-bold"
                      style={{ fontFamily: "caixaStdBold, sans-serif" }}
                    >
                      Expira em: {formatTime(timeLeft)}
                    </span>
                  </div>

                  {/* QR Code */}
                  <div className="p-6 md:p-10">
                    <div className="flex flex-col items-center">
                      {/* QR Code Image */}
                      <div className="bg-white p-4 md:p-6 rounded-xl border-2 border-[#dee2e6] shadow-inner mb-6">
                        {qrcodeUrl ? (
                          <img
                            src={qrcodeUrl || "/placeholder.svg"}
                            alt="QR Code PIX"
                            className="w-[200px] h-[200px] md:w-[280px] md:h-[280px]"
                          />
                        ) : (
                          <div className="w-[200px] h-[200px] md:w-[280px] md:h-[280px] bg-[#f8f9fa] flex items-center justify-center">
                            <QrCode className="w-20 h-20 text-[#dee2e6]" />
                          </div>
                        )}
                      </div>

                      {/* Total */}
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
                          R$ {orderData?.total.toFixed(2).replace(".", ",") || "0,00"}
                        </p>
                      </div>

                      {/* Copy Button */}
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

                      {/* PIX Code Display */}
                      <div className="mt-6 w-full max-w-[400px]">
                        <p
                          className="text-[14px] text-[#4c556c] mb-2 text-center"
                          style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                        >
                          Código PIX Copia e Cola
                        </p>
                        <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded-lg p-3 break-all text-[12px] text-[#4c556c] max-h-[80px] overflow-y-auto">
                          {qrcode}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
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

              {/* Right - Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6">
                  <div className="bg-[#1f2a47] text-white p-5">
                    <h2 className="text-[20px] font-bold" style={{ fontFamily: "caixaStdBold, sans-serif" }}>
                      Resumo do Pedido
                    </h2>
                  </div>

                  <div className="p-5">
                    {/* Customer Info */}
                    {orderData?.name && (
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
                          {orderData.name}
                        </p>
                        {orderData.email && (
                          <p
                            className="text-[14px] text-[#4c556c]"
                            style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                          >
                            {orderData.email}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Items */}
                    <div className="mb-5 pb-5 border-b border-[#dee2e6]">
                      <p
                        className="text-[14px] text-[#4c556c] mb-3"
                        style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                      >
                        Suas Apostas
                      </p>
                      <div className="space-y-3">
                        {orderData?.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
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
                        ))}
                      </div>
                    </div>

                    {/* Total */}
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
                        R$ {orderData?.total.toFixed(2).replace(".", ",") || "0,00"}
                      </span>
                    </div>

                    {/* Security badges */}
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

                  {/* Transaction ID */}
                  {transactionId && (
                    <div className="bg-[#f8f9fa] border-t border-[#dee2e6] p-4">
                      <p
                        className="text-[12px] text-[#4c556c] text-center"
                        style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                      >
                        ID da transação: {transactionId}
                      </p>
                    </div>
                  )}
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
