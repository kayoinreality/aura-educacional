import type { Metadata } from 'next'
import { DM_Mono, DM_Sans, Playfair_Display } from 'next/font/google'
import { PublicHeader } from '../components/public-header'
import './globals.css'

const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
})

const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const mono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'Aura Educacional',
  description: 'Plataforma de cursos livres com login, checkout, area de estudos, avaliacao final e certificado digital.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className={`${display.variable} ${sans.variable} ${mono.variable}`} lang="pt-BR">
      <body>
        <PublicHeader />
        {children}
      </body>
    </html>
  )
}
