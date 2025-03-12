import type React from "react"
import type { Metadata } from "next"
import "@/app/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { SetupButton } from "@/components/setup-button"

export const metadata: Metadata = {
  title: "Spallina Asphalt Dispatch",
  description: "Dispatch management system for Spallina Asphalt",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
        <SetupButton />
      </body>
    </html>
  )
}



import './globals.css'