import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { HealthcareProvider } from "@/context/healthcare-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HealthCare Family Dashboard",
  description: "Manage your family's health records and medications",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <HealthcareProvider>
          {children}
          <Toaster />
        </HealthcareProvider>
      </body>
    </html>
  )
}
