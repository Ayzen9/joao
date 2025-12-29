import type React from "react"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
})

export const metadata: Metadata = {
  title: "Loterias online Caixa",
  description: "Loterias Online é o site de vendas de apostas das Loterias CAIXA na internet. Com as Loterias Online, você pode apostar com segurança de onde estiver.",
  keywords: "Loteria, Loterias da Caixa, Loterias online, Agora pode, Agora pode apostar, Agora pode apostar pela internet?, Apostar na loteria pela internet, Apostar pela internet, Agora pode apostar pela internet?, Como apostar na loteria?, Como apostar nas loterias?, Como apostar na Caixa?, Posso apostar pela internet?, Pode apostar pela internet?, Como apostar pela internet?, Como fazer jogo de loteria?, Facilidade em apostar, Apostar pelo celular, Apostar pelo celular na Mega Sena, Apostar pelo celular na Loto, Apostar pelo celular na LotoFacil , Apostar pelo celular na Quina, Apostar pelo computador, Apostar de onde estiver, Apostar do trabalho, Apostar da rua, Apostar do carro, Internet em festa, Pode comemorar, Novidade para apostar pela internet, loterias online",
  themeColor: "#1E8CB1",
  generator: "Next.js",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  icons: {
    icon: "/images/favicon.ico",
    shortcut: "/images/favicon.ico",
    apple: "/images/favicon.ico",
  },
  openGraph: {
    title: "Loterias Online da Caixa",
    description: "Clique e aposte",
    url: "https://www.loteriasonline.caixa.gov.br",
    siteName: "Loterias Online da Caixa",
    images: [
      {
        url: "https://www.loteriasonline.caixa.gov.br/silce-web/images/illustrations/home-com-sorte.png",
        width: 1200,
        height: 630,
        alt: "Loterias Online CAIXA",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Loterias Online da Caixa",
    description: "Clique e aposte",
    images: ["https://www.loteriasonline.caixa.gov.br/silce-web/images/illustrations/home-com-sorte.png"],
  },
  alternates: {
    canonical: "https://www.loteriasonline.caixa.gov.br",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
      </head>
      <body className={`font-sans antialiased ${nunito.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}