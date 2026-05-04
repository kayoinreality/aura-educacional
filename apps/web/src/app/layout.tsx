import type { Metadata } from 'next';
import { Inter, Fraunces, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  title: 'Aura Educacional — Cursos livres com certificado',
  description:
    'Educação continuada que vale carga horária. Plataforma com cursos livres, certificados de horas e acesso por assinatura ou compra individual.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL ?? 'https://auraeducacional.com.br'),
  openGraph: {
    title: 'Aura Educacional',
    description: 'Cursos livres com certificado de horas reconhecido',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${fraunces.variable} ${mono.variable}`}>
      <body className="bg-ivory text-ink-900 antialiased">{children}</body>
    </html>
  );
}
