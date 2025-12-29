"use client"

import { useState, useEffect } from "react"
import { NumberSelectorModal } from "./number-selector-modal"
import { CombosCarousel } from "./combos-carousel"
import { LOTTERY_DRAW_DATES, calculateTimeRemaining } from "@/lib/lottery-utils"

export function MainContent() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedLottery, setSelectedLottery] = useState<{
    name: string
    color: string
    concurso: string
    isBolao: boolean
  } | null>(null)

  const [countdowns, setCountdowns] = useState<Record<string, string>>({})

  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns: Record<string, string> = {}
      Object.entries(LOTTERY_DRAW_DATES).forEach(([name, data]) => {
        newCountdowns[name] = calculateTimeRemaining(data.date)
      })
      setCountdowns(newCountdowns)
    }

    updateCountdowns()
    const interval = setInterval(updateCountdowns, 60000)
    return () => clearInterval(interval)
  }, [])

  const openModal = (name: string, color: string, concurso: string, isBolao: boolean) => {
    setSelectedLottery({ name, color, concurso, isBolao })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedLottery(null)
  }

  const getCountdown = (name: string) => {
    return countdowns[name.toLowerCase()] || "Calculando..."
  }

  return (
    <main className="flex-1">
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: `url('https://www.loteriasonline.caixa.gov.br/silce-web/images/background/bg_institucionalInterno.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "380px",
        }}
      >
        <div className="max-w-[1900px] mx-auto px-6 py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-white text-left">
              <h1
                className="text-[55px] font-bold mb-5 leading-tight"
                style={{
                  fontFamily: "caixaStdBold, sans-serif",
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-1.800px",
                }}
              >
                Loterias Online da CAIXA
              </h1>
              <p
                className="text-[20px] whitespace-nowrap"
                style={{
                  fontFamily: "caixaStdBook, sans-serif",
                  color: "#fff",
                }}
              >
                Portal Loterias CAIXA: agora você pode apostar na sorte de onde estiver.
              </p>
            </div>
            <div className="flex-shrink-0 self-end">
              <img
                src="https://www.loteriasonline.caixa.gov.br/silce-web/images/illustrations/home-com-sorte.png"
                alt="Loterias Online - Volantes"
                className="max-w-[400px] md:max-w-[480px] w-full h-auto translate-y-[48px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-[1900px] mx-auto px-10">
          <h2 className="text-[62px] mb-10" style={{ letterSpacing: "-2.17px", lineHeight: "74px" }}>
            <span style={{ fontFamily: "caixaStdBook, sans-serif", fontWeight: 300, color: "#adc0c4" }}>Todos os </span>
            <span style={{ fontFamily: "caixaStdBold, sans-serif", fontWeight: 800, color: "#0066b3" }}>produtos</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <GameCard
              name="mega da virada"
              headerImage="https://www.loteriasonline.caixa.gov.br/silce-web/images/background/topo_card_mega-sena.png"
              color="#00a651"
              prize="R$1 Bilhão"
              concurso="2955"
              sorteioLabel="Sorteio"
              sorteioDay="Quarta-Feira"
              sorteioData="31/12/2025 às 22h00"
              diasRestantes={getCountdown("mega da virada")}
              showBolao={true}
              aposteValor={6.0}
              animationDelay={0}
              onOpenModal={openModal}
            />

            <GameCard
              name="lotofácil"
              headerImage="https://www.loteriasonline.caixa.gov.br/silce-web/images/background/topo_card_lotofacil.png"
              color="#91278f"
              prize="R$1,8 Milhão"
              concurso="3574"
              sorteioLabel="Sorteio"
              sorteioDay="Segunda-Feira"
              sorteioData="29/12/2025 às 21h00"
              diasRestantes={getCountdown("lotofácil")}
              showBolao={true}
              aposteValor={3.5}
              animationDelay={1}
              onOpenModal={openModal}
            />

            <GameCard
              name="quina"
              headerImage="https://www.loteriasonline.caixa.gov.br/silce-web/images/background/topo_card_quina.png"
              color="#2e3192"
              prize="R$600 Mil"
              concurso="6914"
              sorteioLabel="Sorteio"
              sorteioDay="Segunda-Feira"
              sorteioData="29/12/2025 às 21h00"
              diasRestantes={getCountdown("quina")}
              showBolao={true}
              aposteValor={3.0}
              animationDelay={2}
              onOpenModal={openModal}
            />

            <GameCard
              name="+milionária"
              headerImage="https://www.loteriasonline.caixa.gov.br/silce-web/images/background/topo_card_+milionaria.png"
              color="#2a3580"
              prize="R$15 Milhões"
              concurso="316"
              sorteioLabel="Sorteio"
              sorteioDay="Quarta-Feira"
              sorteioData="31/12/2025 às 17h00"
              diasRestantes={getCountdown("+milionária")}
              showBolao={true}
              aposteValor={6.0}
              animationDelay={3}
              onOpenModal={openModal}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <GameCard
              name="lotomania"
              headerImage="https://www.loteriasonline.caixa.gov.br/silce-web/images/background/topo_card_lotomania.png"
              color="#e67200"
              prize="R$7,8 Milhões"
              concurso="2868"
              sorteioLabel="Sorteio"
              sorteioDay="Segunda-Feira"
              sorteioData="29/12/2025 às 21h00"
              diasRestantes={getCountdown("lotomania")}
              showBolao={false}
              aposteValor={3.0}
              animationDelay={4}
              onOpenModal={openModal}
            />

            <GameCard
              name="timemania"
              headerImage="https://www.loteriasonline.caixa.gov.br/silce-web/images/background/topo_card_timemania.png"
              color="#038141"
              titleColor="#038141"
              textColor="#038141"
              prize="R$100 Mil"
              concurso="2337"
              sorteioLabel="Sorteio"
              sorteioDay="Terça-Feira"
              sorteioData="30/12/2025 às 21h00"
              diasRestantes={getCountdown("timemania")}
              showBolao={true}
              aposteValor={3.5}
              animationDelay={5}
              onOpenModal={openModal}
            />

            <GameCard
              name="dupla sena"
              headerImage="https://www.loteriasonline.caixa.gov.br/silce-web/images/background/topo_card_dupla-sena.png"
              color="#a62b43"
              prize="R$4,5 Milhões"
              concurso="2905"
              sorteioLabel="Sorteio"
              sorteioDay="Segunda-Feira"
              sorteioData="29/12/2025 às 21h00"
              diasRestantes={getCountdown("dupla sena")}
              showBolao={true}
              aposteValor={3.0}
              animationDelay={6}
              onOpenModal={openModal}
            />

            <GameCard
              name="loteca"
              headerImage="https://www.loteriasonline.caixa.gov.br/silce-web/images/background/topo_card_loteca.png"
              color="#eb212c"
              prize=""
              concurso="1227"
              sorteioLabel="Apuração"
              sorteioDay="Sábado"
              sorteioData="10/01/2026 às 15h00"
              diasRestantes={getCountdown("loteca")}
              aguardando={true}
              showBolao={false}
              aposteValor={4.0}
              animationDelay={7}
              onOpenModal={openModal}
            />
          </div>

          <div className="flex justify-center gap-10">
            <div className="w-full sm:w-1/2 lg:w-[calc(25%-30px)]">
              <GameCard
                name="dia de sorte"
                headerImage="https://www.loteriasonline.caixa.gov.br/silce-web/images/background/topo_card_dia-de-sorte.png"
                color="#ae9319"
                titleColor="#ae9319"
                textColor="#ae9319"
                prize="R$150 Mil"
                concurso="1158"
                sorteioLabel="Sorteio"
                sorteioDay="Terça-Feira"
                sorteioData="30/12/2025 às 21h00"
                diasRestantes={getCountdown("dia de sorte")}
                showBolao={true}
                aposteValor={2.5}
                animationDelay={8}
                onOpenModal={openModal}
              />
            </div>

            <div className="w-full sm:w-1/2 lg:w-[calc(25%-30px)]">
              <GameCard
                name="super sete"
                headerImage="https://www.loteriasonline.caixa.gov.br/silce-web/images/background/topo_card_super-sete.png"
                color="#038141"
                titleColor="#038141"
                textColor="#038141"
                prize="R$200 Mil"
                concurso="791"
                sorteioLabel="Sorteio"
                sorteioDay="Segunda-Feira"
                sorteioData="29/12/2025 às 21h00"
                diasRestantes={getCountdown("super sete")}
                showBolao={true}
                aposteValor={3}
                animationDelay={9}
                onOpenModal={openModal}
              />
            </div>
          </div>
        </div>
      </section>

      <CombosCarousel />

      <section className="py-12 bg-white">
        <div className="max-w-[1900px] mx-auto px-10 text-center">
          <h2 className="text-[28px] font-bold text-[#005AA5] mb-3" style={{ fontFamily: "caixaStdBold, sans-serif" }}>
            Baixe o Aplicativo das Loterias CAIXA e tenha uma experiência completa na palma da mão!
          </h2>
          <p className="text-[18px] text-gray-600 mb-10" style={{ fontFamily: "caixaStdBook, sans-serif" }}>
            Para baixar o aplicativo, clique em uma das lojas abaixo ou aponte a câmera do celular para o QR Code!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-16">
            <div className="flex flex-col items-center">
              <a href="https://apps.apple.com/br/app/loterias-caixa/id1436530324" className="mb-5">
                <img
                  src="https://www.loteriasonline.caixa.gov.br/silce-web/images/appleStore.png"
                  alt="Baixar na App Store"
                  className="h-[55px]"
                />
              </a>
              <div className="w-[140px] h-[140px] bg-white border border-gray-300 rounded-xl flex items-center justify-center p-5">
                <img
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZoAAAGaAQAAAAAefbjOAAADFklEQVR4nO2czW3cMBBG34QCfKQAF7ClaDtISYZLSgdiKS7AgHQ0QOHLgaQsrw9BsMl6LQ0PhtarB5PQYH6+GdnEX6/04+8ZcMghhxxyyCGH9glZXR0wm9kZ1qvFypXZ+sW3OJNDV0GDJGkCUg/AYqQ+COYH2ZkgSdJH6Hbbc+h2EOVJDxMwTEEQM9IEknK7ZQoCgorljHd+Jof+LTQ/yM4xQ7IOhgns/H/+kkP3CHWXvxh+PaJkYMTXTumUP91y72dy6BqoPe4oYAaIGYOQAWTEIJhhq2Td+Zkc+gdQMjOzHmBeY8XcwfDSYWeWUmp81fYcurWP2DiA1Id2GXP7GD9q3Xd+Joeugba1Bq3I1EgtLkqZcfntnZ/JoeshPZ8kiG9Fpiq1xjAtTaECNLJWHd/iTA5d4yOKADES1H6sKkRsLmOY2s3uI/YMtYcMaIy56VKrTDUCENWCiFvEUaCYqeLU/CDppcOsD7KnIlcuBvHNa40DQGtmGSSp+YhBubqM8aO3cBV791CrPmdoHiCI1L9SxSmCDEK2ct+Nt+fQzaFN9amxVBhQ84iSUdSOZ0k5PY/YPVQtouQRBGmMEkMzhhowYrMNjxq7h5pFrBMQNYV4V63wPOJQ0FaPqGMQsHUZZSqihhOPGvuHtnnEx4ziIo8oy33EQSA9nzK1uxkz9vTSbSZmShCpfuMrtufQ1+QR5ZmvtUbNKKjhpPa83EfsHWqx4t0sWsezNkCj1pU9jzgaFGtLg3TK2NO0WOl4Wr9YCSJfuj2HbgFtVOz6cVqFqKZHlDXI9YjjQK24kMpoXeopPoJ0ytUYmN1HHAEqT3ltaWSlnxPA0pEsyIgA82MGFvO+xv6hTWbZRmQybZauCVZr3umZ5XGg97c9CbIzoOeeagypCBVv/t7nAaDPr+fMhuDNNGgxlYARJ2wYl9tvz6GbQ58tgpZWpHMQ6RwoVpJs7Xrc+Zkcuga6fKdLzI9lOsaG6REjTmVOxjbQnZ/JoWugVcUGaH3OOohb1Et4H6DxzHL/kOnP91wu/89kDjnkkEMOOeQQwG+V5mYWnB/lswAAAABJRU5ErkJggg=="
                  alt="QR Code para baixar o app Loterias CAIXA na App Store"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <a href="https://play.google.com/store/apps/details?id=br.gov.caixa.loterias.apostas" className="mb-5">
                <img
                  src="https://www.loteriasonline.caixa.gov.br/silce-web/images/googlePlay.png"
                  alt="Disponível no Google Play"
                  className="h-[55px]"
                />
              </a>
              <div className="w-[140px] h-[140px] bg-white border border-gray-300 rounded-xl flex items-center justify-center p-5">
                <img
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcIAAAHCAQAAAABUY/ToAAADeUlEQVR4nO2cXWrjMBSFzx0b8mjDLKBLUXYwSyqzM3spXUBBfizYnHmQriQnLQMlIW4496HEjT6kwEU690c24ns2//omCIgUKVKkSJEiRR6PtGw97IzNzMbN7LyYASifFh91fvBqRR6LBEkSgSQZO5IR4DSs4ISOwEDmIbFjM3j6Wb9T5P3Jpewv6GivbycC2Kx+CwAws/52c4p8TtLOADhhM3vlCoS4mdl41zlFPhk5j4Cd0RFYTuRf60HG+84p8keTfjQNBLAACNNmmMcOxLIZgG4FBsIAoE1I/qzfKfLu5GzmR9ZyIkL0zSh9WnoA2FJYdqs5RT4JCe4NSNFYjstScBZ4bYrLRLrVcB0hAq2/xDpkBScAwKDYXuSl5V2l7D6MAELMjwh790lD5EMiW9sdY0DdaRpHyl+sANDpLBN5Ye5Ba6uMshRC2oLyqebeJB8SuTd3GgAhZqdJyqgIaz/QOh8nHxLZWlsCG1aXQsm6tEFVsV3LZ/IhkcVqRJ/LrQCynI5du0GR0kMivybJuJnZy+rbzdKn4n1WQQOJ2Xo/5B68WpHHJIcVnDwdTUbAztgMWHI1xF4jwL/jDecU+Ryk18uW37TArQeWERYmpv8BAIhlhBfNNuPjVivyiKTroRqDxY5ND1pwTV2Tj9JDIvfWJIRayyooeVN+zFls+ZDIz8jAj9xPbSNgNnbk5HrIzkBRSyXy/5G/U+QdyBLbw0MyeBwfSnt1Osa4thVZ7UMi3drDC61LcRrY9pzlsF56SOSlZY8YVneaUrxH7R9qso2dej9E7i3F9gb0sPBmIJYTMf9Ze2IZ0/0yYPhIET3nEYrtRe6t9FO/9zkDlPylY04SYes5j++wQKQ/D1ytyCOSu17YmFVQbklDq6n9pJOmFnlp7j6lcTF+7kiebZQeEnlptW6fHifAO2C9cfG6H0Q+JLKxfXraNxkATZ66XO5IziUfErmzJsdYrwVlFVTrZb4ZyYdEXluz+9DLrZ6T9qIZWRqLID0k8gvS3/uR7rTOdspyulbJ5nrF9UZzinxOMt/mKC1pIW7p9VX5hofXRI6xWpGHJHNZbLP0BhB7WVMtP+mheSwt14dYrcgDkNd6qFwBSn1p9bLrUKv60kMir8jy3g97jemNMcmR7FwbhppG65vMKfJJSOP/x3xqese5SJEiRYoUKfJJyH+/5WfFxESrwgAAAABJRU5ErkJggg=="
                  alt="QR Code para baixar o app Loterias CAIXA no Google Play"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedLottery && (
        <NumberSelectorModal
          isOpen={modalOpen}
          onClose={closeModal}
          lotteryName={selectedLottery.name}
          lotteryColor={selectedLottery.color}
          concurso={selectedLottery.concurso}
          isBolao={selectedLottery.isBolao}
        />
      )}
    </main>
  )
}

function GameCard({
  name,
  headerImage,
  color,
  prize,
  concurso,
  sorteioLabel,
  sorteioDay,
  sorteioData,
  diasRestantes,
  titleColor = "#fff",
  textColor,
  aguardando = false,
  showBolao = false,
  aposteValor,
  animationDelay = 0,
  onOpenModal,
}: {
  name: string
  headerImage: string
  color: string
  prize: string
  concurso: string
  sorteioLabel: string
  sorteioDay: string
  sorteioData: string
  diasRestantes: string
  titleColor?: string
  textColor?: string
  aguardando?: boolean
  showBolao?: boolean
  aposteValor: number
  animationDelay?: number
  onOpenModal: (name: string, color: string, concurso: string, isBolao: boolean) => void
}) {
  const handleBolao = () => {
    onOpenModal(name, color, concurso, true)
  }

  const handleAposta = () => {
    onOpenModal(name, color, concurso, false)
  }

  const accentColor = textColor || color

  return (
    <div
      className="game-card bg-white rounded-xl overflow-hidden shadow-lg flex flex-col cursor-pointer animate-fade-in-up transition-all duration-300 ease-out hover:scale-110 hover:shadow-2xl hover:z-10"
      style={{ animationDelay: `${animationDelay * 0.1}s` }}
    >
      <div
        className="px-5 py-5 flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `url('${headerImage}')`,
          minHeight: "65px",
        }}
      >
        <span
          className="text-[26px] text-center game-title"
          style={{
            color: titleColor,
            fontFamily: "futuraBold, sans-serif",
            fontWeight: 700,
            letterSpacing: "-0.79968px",
            lineHeight: "31px",
          }}
        >
          {name}
        </span>
      </div>

      <div
        className="p-6 flex-1 flex flex-col items-center text-center"
        style={{
          backgroundImage: `url('https://www.loteriasonline.caixa.gov.br/silce-web/images/background/backgroud-trevos.png')`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "contain",
          backgroundColor: "#fff",
        }}
      >
        {aguardando ? (
          <>
            <p
              className="text-[15px] text-[#1f2a47] mb-1"
              style={{ fontFamily: "caixaStdRegular, sans-serif", fontWeight: "normal", letterSpacing: "-0.49px" }}
            >
              Próximo Concurso {concurso}
            </p>
            <p
              className="text-[15px] text-[#1f2a47]"
              style={{ fontFamily: "caixaStdRegular, sans-serif", fontWeight: "normal", letterSpacing: "-0.49px" }}
            >
              Aguardando estimativa de prêmio
            </p>
          </>
        ) : (
          <>
            <span
              className="text-[32px] leading-tight"
              style={{
                color: accentColor,
                fontFamily: "caixaStdBold, sans-serif",
                fontWeight: 700,
                letterSpacing: "-0.98px",
                lineHeight: "38px",
              }}
            >
              {prize}
            </span>
            <span
              className="text-[17px] text-[#1f2a47] mt-1"
              style={{
                fontFamily: "caixaStdRegular, sans-serif",
                fontWeight: "normal",
                marginBottom: "12px",
                letterSpacing: "-0.49px",
                lineHeight: "18px",
              }}
            >
              Prêmio estimado do concurso {concurso}
            </span>
          </>
        )}

        <div className="mt-6 w-full text-center">
          <p className="text-[16px]" style={{ fontFamily: "caixaStdRegular, sans-serif", lineHeight: "22px" }}>
            <span style={{ color: "#4c556c" }}>{sorteioLabel} </span>
            <span style={{ color: "#4c556c", fontFamily: "caixaStdRegular, sans-serif", fontWeight: "bold" }}>
              {sorteioDay}
            </span>
          </p>
          <p
            className="text-[16px]"
            style={{
              color: accentColor,
              fontFamily: "caixaStdBold, sans-serif",
              fontWeight: 700,
              lineHeight: "22px",
            }}
          >
            {sorteioData}
          </p>
          <p
            className="text-[16px] text-[#4c556c] mt-1"
            style={{ fontFamily: "caixaStdRegular, sans-serif", lineHeight: "22px" }}
          >
            Apostas se encerram em {diasRestantes}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 w-full">
          {showBolao && (
            <>
              <button
                onClick={handleBolao}
                className="mx-auto border-2 hover:opacity-80 transition-all hover:scale-[1.02] btn-pulse"
                style={{
                  width: "260px",
                  height: "65px",
                  borderColor: accentColor,
                  color: accentColor,
                  fontFamily: "caixaStdBold, sans-serif",
                  fontSize: "20px",
                  fontWeight: 400,
                  borderRadius: "8px",
                  lineHeight: "28px",
                  backgroundColor: "#fff",
                  marginTop: "12px",
                  marginBottom: "10px",
                }}
              >
                Compre seu bolão
              </button>
              <span
                className="text-center text-[26px] text-[#1f2a47]"
                style={{ fontFamily: "caixaStdRegular, sans-serif", letterSpacing: "-0.84px", lineHeight: "31px" }}
              >
                ou
              </span>
            </>
          )}
          <button
            onClick={handleAposta}
            className="mx-auto text-white hover:opacity-90 transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{
              width: "260px",
              height: "65px",
              backgroundColor: color,
              borderRadius: "8px",
              marginTop: "10px",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontFamily: "futuraBold, sans-serif",
                fontWeight: "bold",
                fontSize: "20px",
                lineHeight: "27px",
                color: "#fff",
              }}
            >
              Aposte
            </span>
            <br />
            <span
              style={{
                fontFamily: "futuraBold, sans-serif",
                fontSize: "20px",
                lineHeight: "27px",
                color: "#fff",
              }}
            >
              por R$ {aposteValor.toFixed(2).replace(".", ",")}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
