"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Loader2, CheckCircle } from "lucide-react"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  total: number
  items: Array<{ title: string; quantity: number; price: number; numbers?: string }>
  onSuccess?: () => void
}

const SAVED_DATA_COOKIE = "loterias_user_data"
const PIX_SESSION_COOKIE = "loterias_pix_session"

function getSavedUserData() {
  if (typeof window === "undefined") return null
  try {
    const stored = document.cookie.split("; ").find((row) => row.startsWith(SAVED_DATA_COOKIE + "="))
    if (stored) {
      const value = stored.split("=")[1]
      const decoded = decodeURIComponent(value)
      return JSON.parse(atob(decoded))
    }
  } catch {
    // ignore
  }
  return null
}

function saveUserData(data: Record<string, string>) {
  if (typeof window === "undefined") return
  const encoded = btoa(JSON.stringify(data))
  const maxAge = 60 * 60 * 24 * 365 // 1 ano
  document.cookie = `${SAVED_DATA_COOKIE}=${encodeURIComponent(encoded)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function savePixSession(data: {
  qrcode: string
  qrcodeUrl: string
  transactionId: string
  total: number
  items: Array<{ title: string; quantity: number; price: number; numbers?: string }>
  customerName: string
  email: string
}) {
  if (typeof window === "undefined") return
  const encoded = btoa(JSON.stringify(data))
  const maxAge = 60 * 60 // 1 hora
  document.cookie = `${PIX_SESSION_COOKIE}=${encodeURIComponent(encoded)}; path=/; max-age=${maxAge}; SameSite=Lax`
  console.log("[v0] Cookie PIX salvo com sucesso")
}

export function CheckoutModal({ isOpen, onClose, total, items, onSuccess }: CheckoutModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [saveData, setSaveData] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loadingCep, setLoadingCep] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const savedData = getSavedUserData()
      if (savedData) {
        setFormData((prev) => ({ ...prev, ...savedData }))
        setSaveData(true)
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setErrors({})
    }
  }, [isOpen])

  // Format CPF while typing
  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  // Validate CPF
  const validateCPF = (cpf: string): boolean => {
    const digits = cpf.replace(/\D/g, "")
    if (digits.length !== 11) return false
    if (/^(\d)\1+$/.test(digits)) return false

    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += Number.parseInt(digits[i]) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== Number.parseInt(digits[9])) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += Number.parseInt(digits[i]) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== Number.parseInt(digits[10])) return false

    return true
  }

  // Format phone while typing
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  // Format CEP while typing
  const formatCEP = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8)
    if (digits.length <= 5) return digits
    return `${digits.slice(0, 5)}-${digits.slice(5)}`
  }

  // Fetch address from CEP
  const fetchAddress = async (cep: string) => {
    const digits = cep.replace(/\D/g, "")
    if (digits.length !== 8) return

    setLoadingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await response.json()

      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          endereco: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
        }))
      }
    } catch (error) {
      // Silently fail
    } finally {
      setLoadingCep(false)
    }
  }

  // Validate name (must have at least two words)
  const validateName = (name: string): boolean => {
    const words = name.trim().split(/\s+/)
    return words.length >= 2 && words.every((word) => word.length >= 2)
  }

  // Validate email
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value

    if (field === "cpf") {
      formattedValue = formatCPF(value)
      if (formattedValue.replace(/\D/g, "").length === 11) {
        if (!validateCPF(formattedValue)) {
          setErrors((prev) => ({ ...prev, cpf: "CPF inválido" }))
        } else {
          setErrors((prev) => {
            const { cpf, ...rest } = prev
            return rest
          })
        }
      }
    } else if (field === "phone") {
      formattedValue = formatPhone(value)
    } else if (field === "cep") {
      formattedValue = formatCEP(value)
      if (formattedValue.replace(/\D/g, "").length === 8) {
        fetchAddress(formattedValue)
      }
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!validateName(formData.name)) {
      newErrors.name = "Digite nome e sobrenome"
    }
    if (!validateEmail(formData.email)) {
      newErrors.email = "Email inválido"
    }
    if (formData.phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Telefone inválido"
    }
    if (!validateCPF(formData.cpf)) {
      newErrors.cpf = "CPF inválido"
    }
    if (formData.cep.replace(/\D/g, "").length !== 8) {
      newErrors.cep = "CEP inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)

    if (saveData) {
      saveUserData({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
        cep: formData.cep,
        endereco: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
      })
    }

    try {
      const phoneDigits = formData.phone.replace(/\D/g, "")

      console.log("[v0] Iniciando geração de token...")

      // Generate token
      const tokenResponse = await fetch("/api/generate-pix-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderDetails: {
            customerName: formData.name,
            email: formData.email,
            phone: phoneDigits,
            cpf: formData.cpf,
            total: total,
            items: items,
            address: {
              cep: formData.cep,
              endereco: formData.endereco,
              numero: formData.numero,
              complemento: formData.complemento,
              bairro: formData.bairro,
              cidade: formData.cidade,
              estado: formData.estado,
            },
          },
        }),
      })

      const tokenData = await tokenResponse.json()
      console.log("[v0] Token response:", tokenData)

      if (!tokenData.success) {
        throw new Error(tokenData.error || "Erro ao gerar token")
      }

      console.log("[v0] Criando pagamento PIX...")

      // Create PIX payment
      const paymentResponse = await fetch("/api/pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: phoneDigits,
          cpf: formData.cpf,
          amount: total * 100,
          items: items,
          address: {
            cep: formData.cep,
            endereco: formData.endereco,
            numero: formData.numero,
            complemento: formData.complemento,
            bairro: formData.bairro,
            cidade: formData.cidade,
            estado: formData.estado,
          },
        }),
      })

      const paymentData = await paymentResponse.json()
      console.log("[v0] Payment response:", paymentData)

      if (!paymentData.success) {
        throw new Error(paymentData.error || "Erro ao processar pagamento")
      }

      console.log("[v0] Enviando email...")

      // Send email
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: formData.email,
          subject: "Confirmação de Apostas - Loterias Online",
          orderDetails: {
            customerName: formData.name,
            phone: phoneDigits,
            cpf: formData.cpf,
            total: total,
            items: items,
          },
        }),
      })

      console.log("[v0] Salvando sessão PIX no cookie...")

      savePixSession({
        qrcode: paymentData.transaction.qrcode,
        qrcodeUrl: paymentData.transaction.qrcodeUrl,
        transactionId: paymentData.transaction.id,
        total: total,
        items: items,
        customerName: formData.name,
        email: formData.email,
      })

      // Show notification
      setShowNotification(true)

      setTimeout(() => {
        setShowNotification(false)
        console.log("[v0] Redirecionando para /pix...")
        window.location.href = "/pix"
      }, 5000)
    } catch (error) {
      console.log("[v0] Erro:", error)
      setErrors({ submit: error instanceof Error ? error.message : "Erro ao processar pagamento. Tente novamente." })
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {showNotification && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[70] pt-8 animate-notification-slide">
          <div className="bg-[#28a745] text-white px-16 py-8 rounded-2xl shadow-2xl flex items-center gap-5 min-w-[500px]">
            <CheckCircle className="w-14 h-14 text-white flex-shrink-0" />
            <span className="text-[18px] font-bold" style={{ fontFamily: "caixaStdBold, sans-serif" }}>
              Te enviamos um Email com as informações do seu pedido
            </span>
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#0066b3] text-white p-6 flex items-center justify-between sticky top-0 z-10">
            <h2 className="text-[24px] font-bold" style={{ fontFamily: "caixaStdBold, sans-serif" }}>
              Finalizar Pagamento
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">
            {/* Total */}
            <div className="bg-[#f0f7ff] border border-[#cce5ff] rounded-lg p-5 text-center">
              <p className="text-[14px] text-[#0066b3] mb-1" style={{ fontFamily: "caixaStdRegular, sans-serif" }}>
                Total a pagar
              </p>
              <p className="text-[36px] font-bold text-[#0066b3]" style={{ fontFamily: "caixaStdBold, sans-serif" }}>
                R$ {total.toFixed(2).replace(".", ",")}
              </p>
            </div>

            {/* Name */}
            <div>
              <label
                className="block text-[16px] text-[#1f2a47] mb-2 font-bold"
                style={{ fontFamily: "caixaStdBold, sans-serif" }}
              >
                Nome Completo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ex: João Silva"
                className={`w-full px-4 py-3 border-2 rounded-lg text-[16px] focus:outline-none focus:border-[#0066b3] transition-colors ${
                  errors.name ? "border-red-500" : "border-[#dee2e6]"
                }`}
                style={{ fontFamily: "caixaStdRegular, sans-serif" }}
              />
              {errors.name && <p className="text-red-500 text-[14px] mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-[16px] text-[#1f2a47] mb-2 font-bold"
                style={{ fontFamily: "caixaStdBold, sans-serif" }}
              >
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="seu@email.com"
                className={`w-full px-4 py-3 border-2 rounded-lg text-[16px] focus:outline-none focus:border-[#0066b3] transition-colors ${
                  errors.email ? "border-red-500" : "border-[#dee2e6]"
                }`}
                style={{ fontFamily: "caixaStdRegular, sans-serif" }}
              />
              {errors.email && <p className="text-red-500 text-[14px] mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label
                className="block text-[16px] text-[#1f2a47] mb-2 font-bold"
                style={{ fontFamily: "caixaStdBold, sans-serif" }}
              >
                Telefone
              </label>
              <div className="flex">
                <span className="bg-[#f0f7ff] border-2 border-r-0 border-[#dee2e6] px-4 py-3 rounded-l-lg text-[16px] text-[#0066b3] font-bold">
                  +55
                </span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                  className={`flex-1 px-4 py-3 border-2 rounded-r-lg text-[16px] focus:outline-none focus:border-[#0066b3] transition-colors ${
                    errors.phone ? "border-red-500" : "border-[#dee2e6]"
                  }`}
                  style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-[14px] mt-1">{errors.phone}</p>}
            </div>

            {/* CPF */}
            <div>
              <label
                className="block text-[16px] text-[#1f2a47] mb-2 font-bold"
                style={{ fontFamily: "caixaStdBold, sans-serif" }}
              >
                CPF
              </label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => handleInputChange("cpf", e.target.value)}
                placeholder="000.000.000-00"
                className={`w-full px-4 py-3 border-2 rounded-lg text-[16px] focus:outline-none focus:border-[#0066b3] transition-colors ${
                  errors.cpf ? "border-red-500" : "border-[#dee2e6]"
                }`}
                style={{ fontFamily: "caixaStdRegular, sans-serif" }}
              />
              {errors.cpf && <p className="text-red-500 text-[14px] mt-1">{errors.cpf}</p>}
            </div>

            {/* CEP */}
            <div>
              <label
                className="block text-[16px] text-[#1f2a47] mb-2 font-bold"
                style={{ fontFamily: "caixaStdBold, sans-serif" }}
              >
                CEP
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.cep}
                  onChange={(e) => handleInputChange("cep", e.target.value)}
                  placeholder="00000-000"
                  className={`w-full px-4 py-3 border-2 rounded-lg text-[16px] focus:outline-none focus:border-[#0066b3] transition-colors ${
                    errors.cep ? "border-red-500" : "border-[#dee2e6]"
                  }`}
                  style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                />
                {loadingCep && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#0066b3]" />
                  </div>
                )}
              </div>
              {errors.cep && <p className="text-red-500 text-[14px] mt-1">{errors.cep}</p>}
            </div>

            {/* Address fields (auto-filled) */}
            {formData.endereco && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label
                      className="block text-[14px] text-[#4c556c] mb-1"
                      style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                    >
                      Endereço
                    </label>
                    <input
                      type="text"
                      value={formData.endereco}
                      readOnly
                      className="w-full px-3 py-2 border border-[#dee2e6] rounded bg-[#f8f9fa] text-[14px]"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-[14px] text-[#4c556c] mb-1"
                      style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                    >
                      Número
                    </label>
                    <input
                      type="text"
                      value={formData.numero}
                      onChange={(e) => setFormData((prev) => ({ ...prev, numero: e.target.value }))}
                      placeholder="Nº"
                      className="w-full px-3 py-2 border border-[#dee2e6] rounded text-[14px] focus:outline-none focus:border-[#0066b3]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-[14px] text-[#4c556c] mb-1"
                      style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                    >
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={formData.bairro}
                      readOnly
                      className="w-full px-3 py-2 border border-[#dee2e6] rounded bg-[#f8f9fa] text-[14px]"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-[14px] text-[#4c556c] mb-1"
                      style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                    >
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={formData.complemento}
                      onChange={(e) => setFormData((prev) => ({ ...prev, complemento: e.target.value }))}
                      placeholder="Opcional"
                      className="w-full px-3 py-2 border border-[#dee2e6] rounded text-[14px] focus:outline-none focus:border-[#0066b3]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-[14px] text-[#4c556c] mb-1"
                      style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                    >
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.cidade}
                      readOnly
                      className="w-full px-3 py-2 border border-[#dee2e6] rounded bg-[#f8f9fa] text-[14px]"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-[14px] text-[#4c556c] mb-1"
                      style={{ fontFamily: "caixaStdRegular, sans-serif" }}
                    >
                      Estado
                    </label>
                    <input
                      type="text"
                      value={formData.estado}
                      readOnly
                      className="w-full px-3 py-2 border border-[#dee2e6] rounded bg-[#f8f9fa] text-[14px]"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="saveData"
                checked={saveData}
                onChange={(e) => setSaveData(e.target.checked)}
                className="w-5 h-5 rounded border-[#dee2e6] text-[#0066b3] focus:ring-[#0066b3] cursor-pointer"
              />
              <label
                htmlFor="saveData"
                className="text-[14px] text-[#4c556c] cursor-pointer"
                style={{ fontFamily: "caixaStdRegular, sans-serif" }}
              >
                Salvar meus dados para futuras compras
              </label>
            </div>

            {/* Error message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-[14px]">
                {errors.submit}
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-[#0066b3] text-white py-4 rounded-lg text-[18px] font-bold flex items-center justify-center gap-3 hover:bg-[#0055a0] transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              style={{ fontFamily: "caixaStdBold, sans-serif" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 9h6v6H9z" />
                  </svg>
                  Gerar QR Code PIX
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
