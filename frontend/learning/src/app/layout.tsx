import type { Metadata } from 'next'
import { DM_Mono, DM_Sans } from 'next/font/google'
import { LearningShell } from '../components/learning-shell'
import './globals.css'

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
  title: 'Aura Learning',
  description: 'Ambiente de aprendizagem do aluno da Aura Educacional.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className={`${sans.variable} ${mono.variable}`} lang="pt-BR">
      <body>
        <LearningShell>{children}</LearningShell>
      </body>
    </html>
  )
}
