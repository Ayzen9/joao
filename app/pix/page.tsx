"use client"

import { Suspense } from "react"
import { PixContent } from "./pix-content"

export default function PixPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0066b3] border-t-transparent"></div>
        </div>
      }
    >
      <PixContent />
    </Suspense>
  )
}
