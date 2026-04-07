import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/Toast'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'FuelBid — Marketplace B2B de Combustíveis',
  description: 'Plataforma de leilão reverso conectando postos de bandeira branca a distribuidoras de combustível. Cotação em tempo real, contratos digitais e compliance fiscal.',
  openGraph: {
    title: 'FuelBid — Marketplace B2B de Combustíveis',
    description: 'Leilão reverso de combustíveis para postos independentes.',
    locale: 'pt_BR',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-foreground font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
