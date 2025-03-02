import React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ClientProviders } from "@/components/client-providers"
import { fontVariables, spaceGrotesk } from "./fonts"

export const metadata: Metadata = {
  title: "iMotos Network",
  description: "御坂网络 - 高级脑电波通信系统",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={fontVariables}>
      <body className={`${spaceGrotesk.className} bg-cyber-black text-foreground`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}