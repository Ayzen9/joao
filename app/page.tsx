import { Header } from "@/components/header"
import { MainContent } from "@/components/main-content"
import { Footer } from "@/components/footer"
import { CartProvider } from "@/components/cart-context"
import { CartSidebar } from "@/components/cart-sidebar"
import { SecurityLayer } from "@/components/security-layer"

export default function Home() {
  return (
    <CartProvider>
      <SecurityLayer>
        <div className="min-h-screen flex flex-col bg-[#e8e8e8]">
          <Header />
          <MainContent />
          <Footer />
          <CartSidebar />
        </div>
      </SecurityLayer>
    </CartProvider>
  )
}
