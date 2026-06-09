import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "IQuadra",
  description: "Fluxo de acesso, empresas e agenda para academias e jogadores.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
