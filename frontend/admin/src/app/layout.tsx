import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aura Admin',
  description: 'Painel administrativo para banco de dados e usuarios da plataforma Aura.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
